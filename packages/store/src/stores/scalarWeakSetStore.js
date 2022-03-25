// @ts-check

import { Far, passStyleOf } from '@endo/marshal';
import { fit, assertPattern } from '../patterns/patternMatchers.js';

const { details: X, quote: q } = assert;

/**
 * @template K
 * @param {WeakSet<K & Object>} jsset
 * @param {(k: K) => void} assertKeyOkToAdd
 * @param {(k: K) => void} [assertKeyOkToDelete]
 * @param {string} [keyName]
 * @returns {WeakSetStore<K>}
 */
export const makeWeakSetStoreMethods = (
  jsset,
  assertKeyOkToAdd,
  assertKeyOkToDelete = undefined,
  keyName = 'key',
) => {
  const assertKeyExists = key =>
    assert(jsset.has(key), X`${q(keyName)} not found: ${key}`);

  return harden({
    has: key => {
      // Check if a key exists. The key can be any JavaScript value,
      // though the answer will always be false for keys that cannot be found
      // in this set.
      return jsset.has(key);
    },

    add: key => {
      assertKeyOkToAdd(key);
      jsset.add(key);
    },
    delete: key => {
      assertKeyExists(key);
      if (assertKeyOkToDelete !== undefined) {
        assertKeyOkToDelete(key);
      }
      jsset.delete(key);
    },

    addAll: keys => {
      for (const key of keys) {
        assertKeyOkToAdd(key);
        jsset.add(key);
      }
    },
  });
};

/**
 * This is a _scalar_ set in that the keys can only be atomic values, primitives
 * or remotables. Other storeSets will accept, for example, copyArrays and
 * copyRecords, as keys and look them up based on equality of their contents.
 *
 * TODO For now, this scalarWeakSet accepts only remotables, reflecting the
 * constraints of the underlying JavaScript WeakSet it uses internally. But it
 * should accept the primitives as well, storing them in a separate internal
 * set. What makes it "weak" is that it provides no API for enumerating what's
 * there. Though note that this would only enables collection of the remotables,
 * since the other primitives may always appear.
 *
 * @template K
 * @param {string} [keyName='key'] - The column name for the key
 * @param {StoreOptions} [options]
 * @returns {WeakSetStore<K>}
 */
export const makeScalarWeakSetStore = (
  keyName = 'key',
  { longLived = true, keySchema = undefined } = {},
) => {
  const jsset = new (longLived ? WeakSet : Set)();
  if (keySchema !== undefined) {
    assertPattern(keySchema);
  }

  const assertKeyOkToAdd = key => {
    // TODO: Just a transition kludge. Remove when possible.
    // See https://github.com/Agoric/agoric-sdk/issues/3606
    harden(key);

    assert(
      passStyleOf(key) === 'remotable',
      X`Only remotables can be keys of scalar WeakStores: ${key}`,
    );
    if (keySchema !== undefined) {
      fit(key, keySchema);
    }
  };

  return Far(`scalar WeakSetStore of ${q(keyName)}`, {
    ...makeWeakSetStoreMethods(jsset, assertKeyOkToAdd, undefined, keyName),
  });
};
harden(makeScalarWeakSetStore);
