// @ts-check

import { assert } from '@agoric/assert';
import { E, Far } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { mapIterable } from '@endo/marshal';
import { makeLegacyMap } from '@agoric/store';

import './types.js';

/**
 * Make two facets of a node in a name hierarchy: the nameHub is read access and
 * the nameAdmin is write access.
 *
 * @returns {NameHubKit}
 */
export const makeNameHubKit = () => {
  /** @typedef {Partial<PromiseRecord<unknown> & { value: unknown }>} NameRecord */
  /** @type {LegacyMap<string, NameRecord>} */
  // Legacy because a promiseKit is not a passable
  const keyToRecord = makeLegacyMap('nameKey');

  /** @type {NameHub} */
  const nameHub = Far('nameHub', {
    async lookup(...path) {
      if (path.length === 0) {
        return nameHub;
      }
      const [first, ...remaining] = path;
      const record = keyToRecord.get(first);
      /** @type {any} */
      const firstValue = record.promise || record.value;
      if (remaining.length === 0) {
        return firstValue;
      }
      return E(firstValue).lookup(...remaining);
    },
    entries() {
      return [
        ...mapIterable(
          keyToRecord.entries(),
          ([key, record]) =>
            /** @type {[string, ERef<unknown>]} */ ([
              key,
              record.promise || record.value,
            ]),
        ),
      ];
    },
    values() {
      return [
        ...mapIterable(
          keyToRecord.values(),
          record => record.promise || record.value,
        ),
      ];
    },
    keys() {
      return [...keyToRecord.keys()];
    },
  });

  /** @type {NameAdmin} */
  const nameAdmin = Far('nameAdmin', {
    reserve(key) {
      assert.typeof(key, 'string');
      if (!keyToRecord.has(key)) {
        keyToRecord.init(key, makePromiseKit());
      }
    },
    update(key, newValue) {
      assert.typeof(key, 'string');
      const record = harden({ value: newValue });
      if (keyToRecord.has(key)) {
        const old = keyToRecord.get(key);
        if (old.resolve) {
          old.resolve(newValue);
        }
        keyToRecord.set(key, record);
      } else {
        keyToRecord.init(key, record);
      }
    },
    delete(key) {
      if (keyToRecord.has(key)) {
        // Reject only if already exists.
        const old = keyToRecord.get(key);
        if (old.reject) {
          old.reject(Error(`Value has been deleted`));
          // Silence unhandled rejections.
          old.promise && old.promise.catch(_ => {});
        }
      }
      // This delete may throw.  Reflect it to callers.
      keyToRecord.delete(key);
    },
  });

  const nameHubKit = harden({
    nameHub,
    nameAdmin,
  });
  return nameHubKit;
};
