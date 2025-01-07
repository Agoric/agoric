import { assert, Fail } from '@endo/errors';
import { Far, passStyleOf } from '@endo/far';
import { makeMarshal } from '@endo/marshal';

/**
 * @import {ConvertSlotToVal} from '@endo/marshal';
 */

// Simple wrapper for serializing and unserializing marshalled values inside the
// kernel, where we don't actually want to use clists nor actually allocate real
// objects, but instead to stay entirely within the domain of krefs.  This is
// used to enable syntactic manipulation of serialized values while remaining
// agnostic about the internal details of the serialization encoding.

/**
 * @typedef {{getKref: () => string, iface: () => string} | Promise} KCap
 */

const { toStringTag } = Symbol;

const makeStandinPromise = async kref => {
  const p = Promise.resolve(`${kref} stand in`);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Object.defineProperty(p, toStringTag, {
    value: kref,
    enumerable: false,
  });
  return harden(p);
};
harden(makeStandinPromise);

const getStandinPromiseTag = p => {
  const desc = Object.getOwnPropertyDescriptor(p, toStringTag);
  assert(desc !== undefined, 'promise lacks own @@toStringTag property');
  const kref = desc.value;
  assert.typeof(kref, 'string');
  return kref;
};

/**
 * @type {ConvertSlotToVal<string>}
 */
export const kslot = (kref, iface = 'undefined') => {
  assert.typeof(kref, 'string');
  if (iface && iface.startsWith('Alleged: ')) {
    // Encoder prepends "Alleged: " to iface string, but the decoder doesn't strip it
    // Unclear whether it's the decoder or me who is wrong
    iface = iface.slice(9);
  }
  if (
    kref.startsWith('p') ||
    kref.startsWith('kp') ||
    kref.startsWith('lp') ||
    kref.startsWith('rp')
  ) {
    return makeStandinPromise(kref);
  } else {
    const o = Far(iface, {
      iface: () => iface,
      getKref: () => `${kref}`,
    });
    return o;
  }
};

/**
 * @param {any} obj
 * @returns {string}
 */
export const krefOf = obj => {
  switch (passStyleOf(obj)) {
    case 'promise': {
      return getStandinPromiseTag(obj);
    }
    case 'remotable': {
      const getKref = obj.getKref;
      assert.typeof(getKref, 'function', 'object lacks getKref function');
      return getKref();
    }
    default:
      // When krefOf() is called as part of kmarshal.serialize, marshal
      // will only give it things that are 'remotable' (Promises and the
      // Far objects created by kslot()).  When krefOf() is called by
      // kernel code (as part of extractSingleSlot() or the vat-comms
      // equivalent), it ought to throw if 'obj' is not one of the
      // objects created by our kslot().
      return Fail`krefOf requires a promise or remotable`;
  }
};

const kmarshal = makeMarshal(krefOf, kslot, {
  serializeBodyFormat: 'smallcaps',
  errorTagging: 'off',
});

export const kser = value => kmarshal.serialize(harden(value));

/**
 * @param {import('@endo/marshal').CapData<string>} serializedValue
 * @returns {any}
 */
export const kunser = serializedValue => kmarshal.unserialize(serializedValue);

export function makeError(message) {
  assert.typeof(message, 'string');
  return kser(Error(message));
}
