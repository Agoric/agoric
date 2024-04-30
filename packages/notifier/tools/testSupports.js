import { Far, makeMarshal } from '@endo/marshal';

/**
 * @import {IterationObserver} from '../src/types.js';
 * @import {StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 */

export { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';

/**
 * @param {string} path
 * @param {IterationObserver<unknown>} [publication]
 */
export const makeFakeStorage = (path, publication) => {
  let setValueCalls = 0;
  const fullPath = `publish.${path}`;
  const storeKey = harden({
    storeName: 'swingset',
    storeSubkey: `swingset/data:${fullPath}`,
    dataPrefixBytes: '',
  });
  /** @type {StorageNode & { countSetValueCalls: () => number}} */
  const storage = Far('StorageNode', {
    getPath: () => path,
    getStoreKey: async () => storeKey,
    setValue: async value => {
      setValueCalls += 1;
      assert.typeof(value, 'string');
      if (publication) {
        publication.updateState(value);
      }
    },
    makeChildNode: () => storage,
    countSetValueCalls: () => setValueCalls,
  });
  return storage;
};
harden(makeFakeStorage);

export const makeFakeMarshaller = () =>
  makeMarshal(undefined, undefined, {
    marshalSaveError: () => {},
  });
harden(makeFakeMarshaller);
