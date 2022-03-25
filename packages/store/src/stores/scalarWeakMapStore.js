// @ts-check

import { Far, assertPassable, passStyleOf } from '@endo/marshal';
import { fit, assertPattern } from '../patterns/patternMatchers.js';

const { details: X, quote: q } = assert;

/**
 * @template K,V
 * @param {WeakMap<K & Object, V>} jsmap
 * @param {(k: K, v: V) => void} assertKVOkToAdd
 * @param {(k: K, v: V) => void} assertKVOkToSet
 * @param {(k: K) => void} [assertKeyOkToDelete]
 * @param {string} [keyName]
 * @returns {WeakMapStore<K, V>}
 */
export const makeWeakMapStoreMethods = (
  jsmap,
  assertKVOkToAdd,
  assertKVOkToSet,
  assertKeyOkToDelete = undefined,
  keyName = 'key',
) => {
  const assertKeyDoesNotExist = key =>
    assert(!jsmap.has(key), X`${q(keyName)} already registered: ${key}`);

  const assertKeyExists = key =>
    assert(jsmap.has(key), X`${q(keyName)} not found: ${key}`);

  return harden({
    has: key => {
      // Check if a key exists. The key can be any JavaScript value,
      // though the answer will always be false for keys that cannot be found
      // in this map.
      return jsmap.has(key);
    },
    get: key => {
      assertKeyExists(key);
      // How to tell typescript I believe the `get` will succeed.
      return /** @type {V} */ (jsmap.get(key));
    },

    init: (key, value) => {
      assertKeyDoesNotExist(key);
      assertKVOkToAdd(key, value);
      jsmap.set(key, value);
    },
    set: (key, value) => {
      assertKeyExists(key);
      assertKVOkToSet(key, value);
      jsmap.set(key, value);
    },
    delete: key => {
      assertKeyExists(key);
      if (assertKeyOkToDelete !== undefined) {
        assertKeyOkToDelete(key);
      }
      jsmap.delete(key);
    },

    addAll: entries => {
      for (const [key, value] of entries) {
        // Don't assert that the key either does or does not exist.
        assertKVOkToAdd(key, value);
        jsmap.set(key, value);
      }
    },
  });
};

/**
 * This is a _scalar_ mapStore in that the keys can only be atomic values:
 * primitives or remotables. Other mapStores will accept, for example,
 * copyArrays and copyRecords as keys and look them up based on equality of
 * their contents.
 *
 * TODO For now, this scalarWeakMap accepts only remotables, reflecting the
 * constraints of the underlying JavaScript WeakMap it uses internally. But it
 * should accept the primitives as well, storing them in a separate internal
 * map. What makes it "weak" is that it provides no API for enumerating what's
 * there. Though note that this would only enables collection of the remotables,
 * since the other primitives may always reappear.
 *
 * @template K,V
 * @param {string} [keyName='key'] - The column name for the key
 * @param {StoreOptions} [options]
 * @returns {WeakMapStore<K, V>}
 */
export const makeScalarWeakMapStore = (
  keyName = 'key',
  { longLived = true, keySchema = undefined, valueSchema = undefined } = {},
) => {
  const jsmap = new (longLived ? WeakMap : Map)();
  if (keySchema !== undefined) {
    assertPattern(keySchema);
  }
  if (valueSchema !== undefined) {
    assertPattern(valueSchema);
  }

  const assertKVOkToSet = (_key, value) => {
    // TODO: Just a transition kludge. Remove when possible.
    // See https://github.com/Agoric/agoric-sdk/issues/3606
    harden(value);

    assertPassable(value);
    if (valueSchema !== undefined) {
      fit(value, valueSchema);
    }
  };

  const assertKVOkToAdd = (key, value) => {
    // TODO: Just a transition kludge. Remove when possible.
    // See https://github.com/Agoric/agoric-sdk/issues/3606
    harden(key);

    assert(
      passStyleOf(key) === 'remotable',
      X`Only remotables can be keys of scalar WeakMapStores: ${key}`,
    );
    if (keySchema !== undefined) {
      fit(key, keySchema);
    }
    assertKVOkToSet(key, value);
  };

  return Far(`scalar WeakMapStore of ${q(keyName)}`, {
    ...makeWeakMapStoreMethods(
      jsmap,
      assertKVOkToAdd,
      assertKVOkToSet,
      undefined,
      keyName,
    ),
  });
};
harden(makeScalarWeakMapStore);
