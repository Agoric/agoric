// @ts-check

import { Far } from '@endo/marshal';

const { details: X, quote: q } = assert;

/**
 * @template K,V
 * @typedef {Object} CurrentKeysKit
 * @property {(k: K, v?: V) => void} assertUpdateOnAdd
 * @property {(k: K) => void} assertUpdateOnDelete
 * @property {Iterable<K>} iterableKeys
 */

/**
 * @template K,V
 * @param {() => Iterable<K>} getRawKeys
 * @param {(k: K) => boolean} checkHas
 * @param {RankCompare} compare
 * @param {(k: K, v?: V) => void} assertOkToAdd
 * @param {(k: K) => void} [assertOkToDelete]
 * @param {string} [keyName]
 * @returns {CurrentKeysKit<K, V>}
 */
export const makeCurrentKeysKit = (
  getRawKeys,
  checkHas,
  compare,
  assertOkToAdd,
  assertOkToDelete = undefined,
  keyName = 'key',
) => {
  let updateCount = 0;
  let sortedKeysMemo;

  const assertUpdateOnAdd = (k, v = undefined) => {
    assertOkToAdd(k, v);
    updateCount += 1;
    sortedKeysMemo = undefined;
  };

  const assertUpdateOnDelete = k => assertOkToDelete && assertOkToDelete(k);

  const getSortedKeys = () => {
    if (sortedKeysMemo === undefined) {
      sortedKeysMemo = harden([...getRawKeys()].sort(compare));
    }
    return sortedKeysMemo;
  };

  const iterableKeys = Far('Iterable of keys', {
    [Symbol.iterator]: () => {
      const generation = updateCount;
      getSortedKeys();
      const len = sortedKeysMemo.length;
      let i = 0;
      return Far('Iterator of keys', {
        next: () => {
          assert.equal(
            generation,
            updateCount,
            X`Store ${q(keyName)} cursor stale`,
          );
          // If they're equal, then the sortedKeyMemo is the same one
          // we started with.
          for (;;) {
            if (i < len) {
              const value = sortedKeysMemo[i];
              i += 1;
              if (checkHas(value)) {
                return harden({ done: false, value });
              }
            } else {
              return harden({ done: true, value: undefined });
            }
          }
        },
      });
    },
  });

  return harden({
    assertUpdateOnAdd,
    assertUpdateOnDelete,
    iterableKeys,
  });
};
harden(makeCurrentKeysKit);
