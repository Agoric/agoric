// @ts-check

import { assert, details as X, q } from '@agoric/assert';

/**
 * This module and its fraternal sibling legacyWeakMap exist only to ease a
 * transition to the modern `store` system, are deprecated, and will eventually
 * disappear. They are needed for now to support some of the uses of the old
 * behavior that are not compatible with the new. The constraint imposed by the
 * new is that only passables can be used as values, and only keys (roughly,
 * structures, aka comparables) can be used as values.
 *
 * See https://github.com/Agoric/agoric-sdk/pull/3567 TODO Once that PR is
 * merged, link to the documents rather than the PRs.
 *
 * Each of these non-conforming uses should be marked with a
 *
 * ```js
 * // Legacy because...
 * ```
 *
 * Comment explaining the problem inhibiting conversion to the new system. Some
 * of these problems as of this writing:
 *
 * - A promiseKit used as a value, even though a promiseKit is not a passable.
 *   Solutions are to make it a passable, or to convert the container back to a
 *   conventional JavaScript Map.
 * - A mutable array used as a value, that is subsequently mutated. Freezing the
 *   array wouldn't work of course because it would break the subsequent
 *   mutation. Using a far object wrapping an array would likely work fine.
 *
 * @deprecated Switch to ScalarMap if possible, Map otherwise
 * @template K,V
 * @param {string} [keyName='key'] - The column name for the key
 * @returns {LegacyMap<K, V>}
 */
export const makeLegacyMap = (keyName = 'key') => {
  const m = new Map();
  const assertKeyDoesNotExist = key =>
    assert(!m.has(key), X`${q(keyName)} already registered: ${key}`);
  const assertKeyExists = key =>
    assert(m.has(key), X`${q(keyName)} not found: ${key}`);
  return harden({
    has: key => {
      // Check if a key exists. The key can be any JavaScript value,
      // though the answer will always be false for keys that cannot be found
      // in this map.
      return m.has(key);
    },
    init: (key, value) => {
      assertKeyDoesNotExist(key);
      m.set(key, value);
    },
    get: key => {
      assertKeyExists(key);
      return m.get(key);
    },
    set: (key, value) => {
      assertKeyExists(key);
      m.set(key, value);
    },
    delete: key => {
      assertKeyExists(key);
      m.delete(key);
    },
    keys: () => m.keys(),
    values: () => m.values(),
    entries: () => m.entries(),
    getSize: () => m.size,
    clear: () => m.clear(),
  });
};
harden(makeLegacyMap);
