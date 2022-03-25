// @ts-check

import { assert, details as X, q } from '@agoric/assert';

/**
 * @typedef {bigint | boolean | null | number | string | symbol | undefined} Primitive
 *
 * @typedef {string | number | symbol} PropertyName
 */

/**
 * @template T
 * @template {PropertyName} U
 * @param {T[]} array
 * @param {U[]} keys
 */
export const arrayToObj = (array, keys) => {
  assert(
    array.length === keys.length,
    X`array and keys must be of equal length`,
  );
  const obj =
    /** @type {Record<U, T>} */
    ({});
  keys.forEach((key, i) => (obj[key] = array[i]));
  return harden(obj);
};

/**
 * Assert all values from `part` appear in `whole`.
 *
 * @param {string[]} whole
 * @param {string[]} part
 */
export const assertSubset = (whole, part) => {
  part.forEach(key => {
    assert.typeof(key, 'string');
    assert(
      whole.includes(key),
      X`key ${q(key)} was not one of the expected keys ${q(whole)}`,
    );
  });
};

/**
 * By analogy with how `Array.prototype.map` will map the elements of an array
 * to transformed elements of an array of the same shape, `objectMap` will do
 * likewise for the string-named own enumerable properties of an object.
 *
 * `objectMap` is a convenience over
 *
 * - Using `Object.entries` to convert these property values into an array of
 *   `[key, value]` pairs,
 * - A normal array map with this list and the provided callback, hopefully
 *   producing a similar array of `[key, mappedValue]` pairs,
 * - Using `Object.fromEntries` to put it all back together in a new object whose
 *   own properties are according to that list of mapped pairs.
 *
 * Some edge cases to be aware of
 *
 * - If any of the original properties were accessors, `Object.entries` will cause
 *   its `getter` to be called and will use the resulting value.
 * - No matter whether the original property was an accessor, writable, or
 *   configurable, all the properties of the returned object will be writable,
 *   configurable, data properties.
 * - No matter what the original object may have inherited from, and no matter
 *   whether it was a special kind of object such as an array, the returned
 *   object will always be a plain object inheriting directly from
 *   `Object.prototype` and whose state is only these new mapped own properties.
 * - The caller-provided mapping function can map the entry to a new entry with a
 *   different key, in which case the new object will have those keys as its
 *   property names rather than the original's.
 *
 * Typical usage will be to apply `objectMap` to a pass-by-copy record, i.e.,
 * and object for which `passStyleOf(original) === 'copyRecord'`. For these,
 * none of these edge cases arise. If the mapping does not introduce
 * symbol-named properties, then the result, once hardened, will also be a
 * pass-by-copy record.
 *
 * @template T, U
 * @template {keyof T} K
 * @param {{ [K2 in keyof T]: T[K2] }} original
 * @param {(pair: [K, T[K]]) => [K, U]} mapPairFn
 * @returns {Record<K, U>}
 */
export const objectMap = (original, mapPairFn) => {
  const ents = /** @type {[K, T[K]][]} */ (Object.entries(original));
  const mapEnts = ents.map(ent => mapPairFn(ent));
  return /** @type {Record<K, U>} */ (harden(Object.fromEntries(mapEnts)));
};
