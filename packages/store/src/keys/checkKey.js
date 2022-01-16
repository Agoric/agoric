// @ts-check

/// <reference types="ses"/>

import {
  assertChecker,
  assertPassable,
  Far,
  getTag,
  isObject,
  makeTagged,
  passStyleOf,
} from '@agoric/marshal';
import { checkElements, makeSetOfElements } from './copySet.js';
import { compareAntiRank, sortByRank } from '../patterns/rankOrder.js';

const { details: X, quote: q } = assert;
const { ownKeys } = Reflect;

// ////////////////// Primitive and Scalar keys ////////////////////////////////

/**
 * @param {Passable} val
 * @param {Checker=} check
 * @returns {boolean}
 */
const checkPrimitiveKey = (val, check = x => x) => {
  if (isObject(val)) {
    return check(false, X`A ${q(typeof val)} cannot be a primitive: ${val}`);
  }
  // TODO There is not yet a checkPassable, but perhaps there should be.
  // If that happens, we should call it here instead.
  assertPassable(val);
  return true;
};

/**
 * @param {Passable} val
 * @returns {boolean}
 */
export const isPrimitiveKey = val => checkPrimitiveKey(val);
harden(isPrimitiveKey);

/**
 * @param {Passable} val
 * @returns {void}
 */
export const assertPrimitiveKey = val => {
  checkPrimitiveKey(val, assertChecker);
};
harden(assertPrimitiveKey);

/**
 * @param {Passable} val
 * @param {Checker=} check
 * @returns {boolean}
 */
export const checkScalarKey = (val, check = x => x) => {
  if (isPrimitiveKey(val)) {
    return true;
  }
  const passStyle = passStyleOf(val);
  return check(
    passStyle === 'remotable',
    X`A ${q(passStyle)} cannot be a scalar key: ${val}`,
  );
};

/**
 * @param {Passable} val
 * @returns {boolean}
 */
export const isScalarKey = val => checkScalarKey(val);
harden(isScalarKey);

/**
 * @param {Passable} val
 * @returns {void}
 */
export const assertScalarKey = val => {
  checkScalarKey(val, assertChecker);
};
harden(assertScalarKey);

// ////////////////////////////// Keys /////////////////////////////////////////

/** @type {WeakSet<Key>} */
const keyMemo = new WeakSet();

/**
 * @param {Passable} val
 * @param {Checker=} check
 * @returns {boolean}
 */
export const checkKey = (val, check = x => x) => {
  if (isPrimitiveKey(val)) {
    return true;
  }
  if (!isObject(val)) {
    // TODO There is not yet a checkPassable, but perhaps there should be.
    // If that happens, we should call it here instead.
    assertPassable(val);
    return true;
  }
  if (keyMemo.has(val)) {
    return true;
  }
  // eslint-disable-next-line no-use-before-define
  const result = checkKeyInternal(val, check);
  if (result) {
    // Don't cache the undefined cases, so that if it is tried again
    // with `assertChecker` it'll throw a diagnostic again
    keyMemo.add(val);
  }
  // Note that we do not memoize a negative judgement, so that if it is tried
  // again with a checker, it will still produce a useful diagnostic.
  return result;
};
harden(checkKey);

/**
 * @param {Passable} val
 * @returns {boolean}
 */
export const isKey = val => checkKey(val);
harden(isKey);

/**
 * @param {Key} val
 */
export const assertKey = val => {
  checkKey(val, assertChecker);
};
harden(assertKey);

// //////////////////////////// CopySet ////////////////////////////////////////

// Moved to here so they can check that the copySet contains only keys
// without creating an import cycle.

/** @type WeakSet<CopySet<Key>> */
const copySetMemo = new WeakSet();

/**
 * @param {Passable} s
 * @param {Checker=} check
 * @returns {boolean}
 */
export const checkCopySet = (s, check = x => x) => {
  if (copySetMemo.has(s)) {
    return true;
  }
  const result =
    check(
      passStyleOf(s) === 'tagged' && getTag(s) === 'copySet',
      X`Not a copySet: ${s}`,
    ) &&
    checkElements(s.payload, check) &&
    checkKey(s.payload);
  if (result) {
    copySetMemo.add(s);
  }
  return result;
};
harden(checkCopySet);

/**
 * @callback IsCopySet
 * @param {Passable} s
 * @returns {s is CopySet<Key>}
 */

/** @type {IsCopySet} */
export const isCopySet = s => checkCopySet(s);
harden(isCopySet);

/**
 * @callback AssertCopySet
 * @param {Passable} s
 * @returns {asserts s is CopySet<Key>}
 */

/** @type {AssertCopySet} */
export const assertCopySet = s => {
  checkCopySet(s, assertChecker);
};
harden(assertCopySet);

/**
 * @template K
 * @param {CopySet<K>} s
 * @returns {K[]}
 */
export const getCopySetKeys = s => {
  assertCopySet(s);
  return s.payload;
};
harden(getCopySetKeys);

/**
 * @template K
 * @param {CopySet<K>} s
 * @param {(key: K, index: number) => boolean} fn
 * @returns {boolean}
 */
export const everyCopySetKey = (s, fn) =>
  getCopySetKeys(s).every((key, index) => fn(key, index));
harden(everyCopySetKey);

/**
 * @template K
 * @param {Iterable<K>} elementIter
 * @returns {CopySet<K>}
 */
export const makeCopySet = elementIter => {
  const result = makeSetOfElements(elementIter);
  assertCopySet(result);
  return result;
};
harden(makeCopySet);

// //////////////////////////// CopyMap ////////////////////////////////////////

// Moved to here so they can check that the copyMap's keys contains only keys
// without creating an import cycle.

/** @type WeakSet<CopyMap<any,any>> */
const copyMapMemo = new WeakSet();

/**
 * @param {Passable} m
 * @param {Checker=} check
 * @returns {boolean}
 */
export const checkCopyMap = (m, check = x => x) => {
  if (copyMapMemo.has(m)) {
    return true;
  }
  if (!(passStyleOf(m) === 'tagged' && getTag(m) === 'copyMap')) {
    return check(false, X`Not a copyMap: ${m}`);
  }
  const { payload } = m;
  if (passStyleOf(payload) !== 'copyRecord') {
    return check(false, X`A copyMap's payload must be a record: ${m}`);
  }
  const { keys, values, ...rest } = payload;
  const result =
    check(
      ownKeys(rest).length === 0,
      X`A copyMap's payload must only have .keys and .values: ${m}`,
    ) &&
    checkElements(keys, check) &&
    check(
      passStyleOf(values) === 'copyArray',
      X`A copyMap's .values must be a copyArray: ${m}`,
    ) &&
    check(
      keys.length === values.length,
      X`A copyMap must have the same number of keys and values: ${m}`,
    );
  if (result) {
    copyMapMemo.add(m);
  }
  return result;
};
harden(checkCopyMap);

/**
 * @callback IsCopyMap
 * @param {Passable} m
 * @returns {m is CopyMap<Key, Passable>}
 */

/** @type {IsCopyMap} */
export const isCopyMap = m => checkCopyMap(m);
harden(isCopyMap);

/**
 * @callback AssertCopyMap
 * @param {Passable} m
 * @returns {asserts m is CopyMap<Key, Passable>}
 */

/** @type {AssertCopyMap} */
export const assertCopyMap = m => {
  checkCopyMap(m, assertChecker);
};
harden(assertCopyMap);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @returns {K[]}
 */
export const getCopyMapKeys = m => {
  assertCopyMap(m);
  return m.payload.keys;
};
harden(getCopyMapKeys);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @returns {V[]}
 */
export const getCopyMapValues = m => {
  assertCopyMap(m);
  return m.payload.values;
};
harden(getCopyMapValues);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @returns {Iterable<[K,V]>}
 */
export const getCopyMapEntries = m => {
  assertCopyMap(m);
  const {
    payload: { keys, values },
  } = m;
  const { length } = keys;
  return Far('CopyMap entries iterable', {
    [Symbol.iterator]: () => {
      let i = 0;
      return Far('CopyMap entries iterator', {
        next: () => {
          /** @type {IteratorResult<[K,V],void>} */
          let result;
          if (i < length) {
            result = harden({ done: false, value: [keys[i], values[i]] });
            i += 1;
            return result;
          } else {
            result = harden({ done: true, value: undefined });
          }
          return result;
        },
      });
    },
  });
};
harden(getCopyMapEntries);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @param {(key: K, index: number) => boolean} fn
 * @returns {boolean}
 */
export const everyCopyMapKey = (m, fn) =>
  getCopyMapKeys(m).every((key, index) => fn(key, index));
harden(everyCopyMapKey);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @param {(value: V, index: number) => boolean} fn
 * @returns {boolean}
 */
export const everyCopyMapValue = (m, fn) =>
  getCopyMapValues(m).every((value, index) => fn(value, index));
harden(everyCopyMapValue);

/**
 * @template K,V
 * @param {CopyMap<K,V>} m
 * @returns {CopySet<K>}
 */
export const copyMapKeySet = m =>
  // A copyMap's keys are already in the internal form used by copySets.
  makeTagged('copySet', m.payload.keys);
harden(copyMapKeySet);

/**
 * @template K,V
 * @param {Iterable<[K, V]>} entries
 * @returns {CopyMap<K,V>}
 */
export const makeCopyMap = entries => {
  // This is weird, but reverse rank sorting the entries is a good first step
  // for getting the rank sorted keys together with the values
  // organized by those keys. Also, among values associated with
  // keys in the same equivalence class, those are rank sorted.
  // TODO This
  // could solve the copyMap cover issue explained in patternMatchers.js.
  // But only if we include this criteria in our validation of copyMaps,
  // which we currently do not.
  const sortedEntries = sortByRank(entries, compareAntiRank);
  const keys = sortedEntries.map(([k, _v]) => k);
  const values = sortedEntries.map(([_k, v]) => v);
  const result = makeTagged('copyMap', { keys, values });
  assertCopyMap(result);
  return result;
};
harden(makeCopyMap);

// //////////////////////// Keys Recur /////////////////////////////////////////

/**
 * @param {Passable} val
 * @param {Checker=} check
 * @returns {boolean}
 */
const checkKeyInternal = (val, check = x => x) => {
  const checkIt = child => checkKey(child, check);

  const passStyle = passStyleOf(val);
  switch (passStyle) {
    case 'copyRecord': {
      // A copyRecord is a key iff all its children are keys
      return Object.values(val).every(checkIt);
    }
    case 'copyArray': {
      // A copyArray is a key iff all its children are keys
      return val.every(checkIt);
    }
    case 'tagged': {
      const tag = getTag(val);
      switch (tag) {
        case 'copySet': {
          return checkCopySet(val, check);
        }
        case 'copyMap': {
          return (
            checkCopyMap(val, check) &&
            // For a copyMap to be a key, all its keys and values must
            // be keys. Keys already checked by `checkCopyMap` since
            // that's a copyMap requirement in general.
            everyCopyMapValue(val, checkIt)
          );
        }
        default: {
          return check(
            false,
            X`A passable tagged ${q(tag)} is not a key: ${val}`,
          );
        }
      }
    }
    case 'remotable': {
      // All remotables are keys.
      return true;
    }
    case 'error':
    case 'promise': {
      return check(false, X`A ${q(passStyle)} cannot be a key`);
    }
    default: {
      // Unexpected tags are just non-keys, but an unexpected passStyle
      // is always an error.
      assert.fail(X`unexpected passStyle ${q(passStyle)}: ${val}`);
    }
  }
};
