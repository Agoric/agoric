import { q, Fail } from '@agoric/assert';
import '../types-ambient.js';

/**
 * See doccomment in the closely related `legacyMap.js` module.
 *
 * @deprecated switch to ScalarWeakMap if possible, WeakMap otherwise
 * @template K,V
 * @param {string} [tag] - tag for debugging
 * @returns {LegacyWeakMap<K, V>}
 */
export const makeLegacyWeakMap = (tag = 'key') => {
  /** @type {WeakMap<K & object, V>} */
  const wm = new WeakMap();
  const assertKeyDoesNotExist = key =>
    !wm.has(key) || Fail`${q(tag)} already registered: ${key}`;
  const assertKeyExists = key =>
    wm.has(key) || Fail`${q(tag)} not found: ${key}`;
  return harden({
    has: key => {
      // Check if a key exists. The key can be any JavaScript value,
      // though the answer will always be false for keys that cannot be found
      // in this map.
      return wm.has(key);
    },
    init: (key, value) => {
      assertKeyDoesNotExist(key);
      wm.set(key, value);
    },
    get: key => {
      assertKeyExists(key);
      // How to tell typescript I believe the `get` will succeed.
      return /** @type {V} */ (wm.get(key));
    },
    set: (key, value) => {
      assertKeyExists(key);
      wm.set(key, value);
    },
    delete: key => {
      assertKeyExists(key);
      wm.delete(key);
    },
  });
};
harden(makeLegacyWeakMap);
