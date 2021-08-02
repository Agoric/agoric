// @ts-check

// eslint-disable-next-line spaced-comment
/// <reference types="ses"/>

import { Nat } from '@agoric/nat';
import { assert, details as X, q } from '@agoric/assert';
import { passStyleOf } from './passStyleOf.js';

import './types.js';
import { getInterfaceOf } from './helpers/remotable.js';
import { ErrorHelper, getErrorConstructor } from './helpers/error.js';
import { makeTagged } from './makeTagged.js';
import { isObject, getTag } from './helpers/passStyle-helpers.js';
import {
  assertPassableSymbol,
  nameForPassableSymbol,
  passableSymbolForName,
} from './helpers/symbol.js';

const { ownKeys } = Reflect;
const { isArray } = Array;
const { getOwnPropertyDescriptors, defineProperties, is, fromEntries } = Object;

/**
 * Special property name that indicates an encoding that needs special
 * decoding.
 */
const QCLASS = '@qclass';
export { QCLASS };

const defaultValToSlotFn = x => x;
const defaultSlotToValFn = (x, _) => x;

/**
 * @template Slot
 * @type {MakeMarshal<Slot>}
 */
export function makeMarshal(
  convertValToSlot = defaultValToSlotFn,
  convertSlotToVal = defaultSlotToValFn,
  {
    errorTagging = 'on',
    marshalName = 'anon-marshal',
    // TODO Temporary hack.
    // See https://github.com/Agoric/agoric-sdk/issues/2780
    errorIdNum = 10000,
    // We prefer that the caller instead log to somewhere hidden
    // to be revealed when correlating with the received error.
    marshalSaveError = err =>
      console.log('Temporary logging of sent error', err),
  } = {},
) {
  assert.typeof(marshalName, 'string');
  assert(
    errorTagging === 'on' || errorTagging === 'off',
    X`The errorTagging option can only be "on" or "off" ${errorTagging}`,
  );
  const nextErrorId = () => {
    errorIdNum += 1;
    return `error:${marshalName}#${errorIdNum}`;
  };

  /**
   * @template Slot
   * @type {Serialize<Slot>}
   */
  const serialize = root => {
    const slots = [];
    // maps val (promise or remotable) to index of slots[]
    const slotMap = new Map();

    /**
     * @param {Passable} val
     * @param {InterfaceSpec=} iface
     * @returns {Encoding}
     */
    function serializeSlot(val, iface = undefined) {
      let slotIndex;
      if (slotMap.has(val)) {
        slotIndex = slotMap.get(val);
        assert.typeof(slotIndex, 'number');
        iface = undefined;
      } else {
        const slot = convertValToSlot(val);

        slotIndex = slots.length;
        slots.push(slot);
        slotMap.set(val, slotIndex);
      }

      if (iface === undefined) {
        return harden({
          [QCLASS]: 'slot',
          index: slotIndex,
        });
      }
      return harden({
        [QCLASS]: 'slot',
        iface,
        index: slotIndex,
      });
    }

    /**
     * Even if an Error is not actually passable, we'd rather send
     * it anyway because the diagnostic info carried by the error
     * is more valuable than diagnosing why the error isn't
     * passable. See comments in ErrorHelper.
     *
     * @param {Error} err
     * @returns {Encoding}
     */
    const encodeError = err => {
      if (errorTagging === 'on') {
        // We deliberately do not share the stack, but it would
        // be useful to log the stack locally so someone who has
        // privileged access to the throwing Vat can correlate
        // the problem with the remote Vat that gets this
        // summary. If we do that, we could allocate some random
        // identifier and include it in the message, to help
        // with the correlation.
        const errorId = nextErrorId();
        assert.note(err, X`Sent as ${errorId}`);
        marshalSaveError(err);
        return harden({
          [QCLASS]: 'error',
          errorId,
          message: `${err.message}`,
          name: `${err.name}`,
        });
      } else {
        return harden({
          [QCLASS]: 'error',
          message: `${err.message}`,
          name: `${err.name}`,
        });
      }
    };

    /**
     * Must encode `val` into plain JSON data *canonically*, such that
     * `JSON.stringify(encode(v1)) === JSON.stringify(encode(v1))`
     * For each copyRecord, we only accept string property names,
     * not symbols. On the encoded form the sort
     * order of these names must be the same as their enumeration
     * order, so a `JSON.stringify` of the encoded form agrees with
     * a canonical-json stringify of the encoded form.
     *
     * @param {Passable} val
     * @returns {Encoding}
     */
    const encode = val => {
      if (ErrorHelper.canBeValid(val)) {
        return encodeError(val);
      }
      // First we handle all primitives. Some can be represented directly as
      // JSON, and some must be encoded as [QCLASS] composites.
      const passStyle = passStyleOf(val);
      switch (passStyle) {
        case 'null': {
          return null;
        }
        case 'undefined': {
          return harden({ [QCLASS]: 'undefined' });
        }
        case 'string':
        case 'boolean': {
          return val;
        }
        case 'number': {
          if (Number.isNaN(val)) {
            return harden({ [QCLASS]: 'NaN' });
          }
          if (is(val, -0)) {
            return 0;
          }
          if (val === Infinity) {
            return harden({ [QCLASS]: 'Infinity' });
          }
          if (val === -Infinity) {
            return harden({ [QCLASS]: '-Infinity' });
          }
          return val;
        }
        case 'bigint': {
          return harden({
            [QCLASS]: 'bigint',
            digits: String(val),
          });
        }
        case 'symbol': {
          assertPassableSymbol(val);
          const name = /** @type {string} */ (nameForPassableSymbol(val));
          if (name === '@@asyncIterator') {
            // Deprectated qclass. TODO make conditional
            // on environment variable. Eventually remove, but only after
            // confident that all supported receivers understand
            // `[QCLASS]: 'symbol'`.
            return harden({
              [QCLASS]: '@@asyncIterator',
            });
          }
          return harden({
            [QCLASS]: 'symbol',
            name,
          });
        }
        case 'copyRecord': {
          if (QCLASS in val) {
            // Hilbert hotel
            const { [QCLASS]: qclassValue, ...rest } = val;
            if (ownKeys(rest).length === 0) {
              /** @type {Encoding} */
              const result = harden({
                [QCLASS]: 'hilbert',
                original: encode(qclassValue),
              });
              return result;
            } else {
              /** @type {Encoding} */
              const result = harden({
                [QCLASS]: 'hilbert',
                original: encode(qclassValue),
                rest: encode(harden(rest)),
              });
              return result;
            }
          }
          // Currently copyRecord allows only string keys so this will
          // work. If we allow sortable symbol keys, this will need to
          // become more interesting.
          const names = ownKeys(val).sort();
          return fromEntries(names.map(name => [name, encode(val[name])]));
        }
        case 'copyArray': {
          return val.map(encode);
        }
        case 'tagged': {
          /** @type {Encoding} */
          const result = harden({
            [QCLASS]: 'tagged',
            tag: getTag(val),
            payload: encode(val.payload),
          });
          return result;
        }
        case 'remotable': {
          const iface = getInterfaceOf(val);
          // console.log(`serializeSlot: ${val}`);
          return serializeSlot(val, iface);
        }
        case 'error': {
          return encodeError(val);
        }
        case 'promise': {
          // console.log(`serializeSlot: ${val}`);
          return serializeSlot(val);
        }
        default: {
          assert.fail(X`unrecognized passStyle ${q(passStyle)}`, TypeError);
        }
      }
    };

    const encoded = encode(root);

    return harden({
      body: JSON.stringify(encoded),
      slots,
    });
  };

  const makeFullRevive = slots => {
    /** @type {Map<number, Passable>} */
    const valMap = new Map();

    function unserializeSlot(index, iface) {
      if (valMap.has(index)) {
        return valMap.get(index);
      }
      const slot = slots[Number(Nat(index))];
      const val = convertSlotToVal(slot, iface);
      valMap.set(index, val);
      return val;
    }

    /**
     * We stay close to the algorithm at
     * https://tc39.github.io/ecma262/#sec-json.parse , where
     * fullRevive(harden(JSON.parse(str))) is like JSON.parse(str, revive))
     * for a similar reviver. But with the following differences:
     *
     * Rather than pass a reviver to JSON.parse, we first call a plain
     * (one argument) JSON.parse to get rawTree, and then post-process
     * the rawTree with fullRevive. The kind of revive function
     * handled by JSON.parse only does one step in post-order, with
     * JSON.parse doing the recursion. By contrast, fullParse does its
     * own recursion in the same pre-order in which the replacer visited them.
     *
     * In order to break cycles, the potentially cyclic objects are
     * not frozen during the recursion. Rather, the whole graph is
     * hardened before being returned. Error objects are not
     * potentially recursive, and so may be harmlessly hardened when
     * they are produced.
     *
     * fullRevive can produce properties whose value is undefined,
     * which a JSON.parse on a reviver cannot do. If a reviver returns
     * undefined to JSON.parse, JSON.parse will delete the property
     * instead.
     *
     * fullRevive creates and returns a new graph, rather than
     * modifying the original tree in place.
     *
     * fullRevive may rely on rawTree being the result of a plain call
     * to JSON.parse. However, it *cannot* rely on it having been
     * produced by JSON.stringify on the replacer above, i.e., it
     * cannot rely on it being a valid marshalled
     * representation. Rather, fullRevive must validate that.
     *
     * @param {Encoding} rawTree must be hardened
     */
    function fullRevive(rawTree) {
      if (!isObject(rawTree)) {
        // primitives pass through
        return rawTree;
      }
      // Assertions of the above to narrow the type.
      assert.typeof(rawTree, 'object');
      assert(rawTree !== null);
      if (QCLASS in rawTree) {
        const qclass = rawTree[QCLASS];
        assert.typeof(
          qclass,
          'string',
          X`invalid qclass typeof ${q(typeof qclass)}`,
        );
        assert(!isArray(rawTree));
        // Switching on `encoded[QCLASS]` (or anything less direct, like
        // `qclass`) does not discriminate rawTree in typescript@4.2.3 and
        // earlier.
        switch (rawTree['@qclass']) {
          // Encoding of primitives not handled by JSON
          case 'undefined': {
            return undefined;
          }
          case 'NaN': {
            return NaN;
          }
          case 'Infinity': {
            return Infinity;
          }
          case '-Infinity': {
            return -Infinity;
          }
          case 'bigint': {
            const { digits } = rawTree;
            assert.typeof(
              digits,
              'string',
              X`invalid digits typeof ${q(typeof digits)}`,
            );
            return BigInt(digits);
          }
          case '@@asyncIterator': {
            // Deprectated qclass. TODO make conditional
            // on environment variable. Eventually remove, but after confident
            // that there are no more supported senders.
            return Symbol.asyncIterator;
          }
          case 'symbol': {
            const { name } = rawTree;
            return passableSymbolForName(name);
          }

          case 'tagged': {
            const { tag, payload } = rawTree;
            return makeTagged(tag, fullRevive(payload));
          }

          case 'error': {
            const { name, message, errorId } = rawTree;
            assert.typeof(
              name,
              'string',
              X`invalid error name typeof ${q(typeof name)}`,
            );
            assert.typeof(
              message,
              'string',
              X`invalid error message typeof ${q(typeof message)}`,
            );
            const EC = getErrorConstructor(`${name}`) || Error;
            // errorId is a late addition so be tolerant of its absence.
            const errorName =
              errorId === undefined
                ? `Remote${EC.name}`
                : `Remote${EC.name}(${errorId})`;
            const error = assert.error(`${message}`, EC, { errorName });
            return error;
          }

          case 'slot': {
            const { index, iface } = rawTree;
            const val = unserializeSlot(index, iface);
            return val;
          }

          case 'hilbert': {
            const { original, rest } = rawTree;
            assert(
              'original' in rawTree,
              X`Invalid Hilbert Hotel encoding ${rawTree}`,
            );
            // Don't harden since we're not done mutating it
            const result = { [QCLASS]: fullRevive(original) };
            if ('rest' in rawTree) {
              assert(
                rest !== undefined,
                X`Rest encoding must not be undefined`,
              );
              const restObj = fullRevive(rest);
              // TODO really should assert that `passStyleOf(rest)` is
              // `'copyRecord'` but we'd have to harden it and it is too
              // early to do that.
              assert(
                !(QCLASS in restObj),
                X`Rest must not contain its own definition of ${q(QCLASS)}`,
              );
              defineProperties(result, getOwnPropertyDescriptors(restObj));
            }
            return result;
          }

          default: {
            assert(
              // @ts-ignore Should be at-ts-expect-error, but see
              // https://github.com/Agoric/agoric-sdk/issues/3840
              //
              // This value indeed violates the current types.
              // We test for it to give a more informative diagnostic if we
              // receive it from a counterparty using an older version of the
              // protocol.
              qclass !== 'ibid',
              X`The protocol no longer supports ibid encoding: ${rawTree}.`,
            );
            assert.fail(X`unrecognized ${q(QCLASS)} ${q(qclass)}`, TypeError);
          }
        }
      } else if (isArray(rawTree)) {
        const result = [];
        const { length } = rawTree;
        for (let i = 0; i < length; i += 1) {
          result[i] = fullRevive(rawTree[i]);
        }
        return result;
      } else {
        const result = {};
        for (const name of ownKeys(rawTree)) {
          assert.typeof(
            name,
            'string',
            X`Property ${name} of ${rawTree} must be a string`,
          );
          result[name] = fullRevive(rawTree[name]);
        }
        return result;
      }
    }
    return fullRevive;
  };

  /**
   * @template Slot
   * @type {Unserialize<Slot>}
   */
  const unserialize = data => {
    assert.typeof(
      data.body,
      'string',
      X`unserialize() given non-capdata (.body is ${data.body}, not string)`,
    );
    assert(
      isArray(data.slots),
      X`unserialize() given non-capdata (.slots are not Array)`,
    );
    const rawTree = harden(JSON.parse(data.body));
    const fullRevive = makeFullRevive(data.slots);
    return harden(fullRevive(rawTree));
  };

  return harden({
    serialize,
    unserialize,
  });
}
