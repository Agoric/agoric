// @ts-check

import { assert, details as X, q } from '@agoric/assert';
import '../types.js';

/**
 * See doccomment in the closely related `legacyMap.js` module.
 *
 * @deprecated Switch to ScalarWeakMap if possible, WeakMap otherwise
 * @template K,V
 * @param {string} [keyName='key'] - The column name for the key
 * @returns {LegacyWeakMap<K, V>}
 */
export const makeLegacyWeakMap = (keyName = 'key') => {
  /** @type {WeakMap<K & Object, V>} */
  const wm = new WeakMap();
  const assertKeyDoesNotExist = key =>
    assert(!wm.has(key), X`${q(keyName)} already registered: ${key}`);
  const assertKeyExists = key =>
    assert(wm.has(key), X`${q(keyName)} not found: ${key}`);
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
