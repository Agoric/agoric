// @ts-check
import { E, Far } from '@endo/far';
import { deeplyFulfilled, makeMarshal } from '@endo/marshal';
import { matches, makeScalarMapStore } from '@agoric/store';

import '@agoric/store/exported.js';

import { makeScalarBigMapStore } from '@agoric/vat-data';
import { iterateLatest, makeFollower } from '@agoric/casting';
import { withGroundState, makeState } from './state.js';

/**
 * @param {(obj: unknown) => unknown} [sanitize]
 * @returns {(key: Passable) => Promise<string>}
 */
const makeKeyToString = (sanitize = obj => obj) => {
  let lastNonce = 0;
  const valToNonce = new WeakMap();
  const valToSlot = val => {
    let slot = valToNonce.get(val);
    if (!slot) {
      lastNonce += 1;
      slot = lastNonce;
      valToNonce.set(val, slot);
    }
    return slot;
  };

  const { serialize: keyToJsonable } = makeMarshal(valToSlot);
  const keyToString = async keyP => {
    const key = await sanitize(keyP);
    const obj = keyToJsonable(key);
    return JSON.stringify(obj);
  };
  return keyToString;
};

/**
 * @param {string} keyStr
 * @param {(oldValue: unknown) => unknown} txn
 * @param {Pattern} guardPattern
 * @param {(obj: unknown) => unknown} sanitize Process keys and values with
 * this function before storing them
 * @param {{
 * get(key: string): import('./types').State;
 * set(key: string, value: import('./types').State): void;
 * init(key: string, value: import('./types').State): void;
 * }} stateStore
 * @returns {Promise<unknown>} the value of the updated state
 */
const applyCacheTransaction = async (
  keyStr,
  txn,
  guardPattern,
  sanitize,
  stateStore,
) => {
  /**
   * Retrieve a potential updated state from the transaction.
   *
   * @param {import('./types').State} basisState
   * @returns {Promise<import('./types').State | null>} the updated state, or null if no longer applicable
   */
  const getUpdatedState = async basisState => {
    const { value } = basisState;
    if (!matches(value, guardPattern)) {
      // value doesn't match, so don't apply the update.
      return null;
    }

    const newValue = await sanitize(txn(value));
    return makeState(newValue, basisState);
  };

  let basisState = stateStore.get(keyStr);
  let updatedState = await getUpdatedState(basisState);

  // AWAIT INTERLEAVING

  // Loop until our updated state is fresh wrt our current state.
  basisState = stateStore.get(keyStr);
  while (updatedState && updatedState.generation <= basisState.generation) {
    // eslint-disable-next-line no-await-in-loop
    updatedState = await getUpdatedState(basisState);
    // AWAIT INTERLEAVING
    basisState = stateStore.get(keyStr);
  }

  if (!updatedState) {
    // The latest store value doesn't match the guard pattern, so don't
    // update.
    return basisState.value;
  }

  // The guard pattern passes and the updated state is fresh, so update the
  // store.
  if (basisState.generation < 1n) {
    // XXX can encapsulate this logic in the caller and eliminate `init()`
    stateStore.init(keyStr, updatedState);
  } else {
    stateStore.set(keyStr, updatedState);
  }

  // Return the newly-applied value.
  return updatedState.value;
};

/**
 * @param {MapStore<string, import('./types').State>} stateStore
 * @param {Marshaller} marshaller
 * @returns {Promise<string>}
 */
const stringifyStateStore = async (stateStore, marshaller) => {
  const obj = {};
  for (const [key, value] of stateStore.entries()) {
    obj[key] = E(marshaller).serialize(value);
  }
  return deeplyFulfilled(harden(obj)).then(fulfilledObj =>
    JSON.stringify(fulfilledObj),
  );
};

/**
 * Make a cache coordinator backed by a MapStore.  This coordinator doesn't
 * currently enforce any cache eviction, but that would be a useful feature.
 *
 * @param {MapStore<string, import('./types').State>} [stateStore]
 * @param {(obj: unknown) => unknown} [sanitize] Process keys and values with
 * this function before storing them. Defaults to deeplyFulfilled.
 */
export const makeScalarStoreCoordinator = (
  stateStore = makeScalarMapStore(),
  sanitize = deeplyFulfilled,
) => {
  const serializePassable = makeKeyToString(sanitize);

  const defaultStateStore = withGroundState(stateStore);

  /** @type {import('./types').Coordinator} */
  const coord = Far('store cache coordinator', {
    getRecentValue: async key => {
      const keyStr = await serializePassable(key);
      return defaultStateStore.get(keyStr).value;
    },
    setCacheValue: async (key, newValue, guardPattern) => {
      const keyStr = await serializePassable(key);
      return applyCacheTransaction(
        keyStr,
        () => newValue,
        guardPattern,
        sanitize,
        defaultStateStore,
      );
    },
    updateCacheValue: async (key, updater, guardPattern) => {
      const keyStr = await serializePassable(key);
      return applyCacheTransaction(
        keyStr,
        oldValue => E(updater).update(oldValue),
        guardPattern,
        sanitize,
        defaultStateStore,
      );
    },
  });
  return coord;
};

/**
 * Don't write any marshalled value that's older than what's already pushed
 *
 * @param {MapStore<string, import('./types').State>} stateStore
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<Marshaller>} marshaller
 * @returns {<T>(storedValue: T) => Promise<T>}
 */
const makeLastWinsUpdater = (stateStore, marshaller, storageNode) => {
  let lastPrepareTicket = 0n;
  let lastCommitTicket = 0n;

  return async storedValue => {
    // NB: two phase write (serialize/setValue)
    // Make sure we're not racing ahead if the marshaller is taking too long, by skipping
    // setValue (commit) for any serialized (prepare) that's older than the latest commit.
    lastPrepareTicket += 1n;
    const marshallTicket = lastPrepareTicket;
    const serializedStore = await stringifyStateStore(stateStore, marshaller);
    if (marshallTicket < lastCommitTicket) {
      // skip setValue() so we don't regress the store state
      return storedValue;
    }
    await E(storageNode).setValue(serializedStore);
    lastCommitTicket = marshallTicket;
    return storedValue;
  };
};

/**
 * Make a cache coordinator backed by a MapStore.  This coordinator doesn't
 * currently enforce any cache eviction, but that would be a useful feature.
 *
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<Marshaller>} marshaller
 */
export const makeChainStorageCoordinator = (storageNode, marshaller) => {
  const stateStore = makeScalarBigMapStore('stateKey');

  const sanitize = deeplyFulfilled;
  const serializePassable = makeKeyToString(sanitize);

  const defaultStateStore = withGroundState(stateStore);

  const updateStorageNode = makeLastWinsUpdater(
    defaultStateStore,
    marshaller,
    storageNode,
  );

  /** @type {import('./types').Coordinator} */
  const coord = Far('store cache coordinator', {
    getRecentValue: async key => {
      const keyStr = await serializePassable(key);
      return defaultStateStore.get(keyStr).value;
    },
    setCacheValue: async (key, newValue, guardPattern) => {
      const keyStr = await serializePassable(key);
      const storedValue = await applyCacheTransaction(
        keyStr,
        () => newValue,
        guardPattern,
        sanitize,
        defaultStateStore,
      );
      return updateStorageNode(storedValue);
    },
    updateCacheValue: async (key, updater, guardPattern) => {
      const keyStr = await serializePassable(key);
      const storedValue = await applyCacheTransaction(
        keyStr,
        oldValue => E(updater).update(oldValue),
        guardPattern,
        sanitize,
        defaultStateStore,
      );
      return updateStorageNode(storedValue);
    },
  });
  return coord;
};

/**
 * Make a cache coordinator backed by a casting node.
 *
 * @param {import('@agoric/casting').Leader} leader
 * @param {import('@agoric/casting').CastingSpec} castingSpec
 * @param {import('@agoric/casting').FollowerOptions} followerOptions
 * @param {(...messages: unknown[]) => void} log
 */
export const makeCastingClientCoordinator = async (
  leader,
  castingSpec,
  followerOptions,
  log = _ => null,
) => {
  const follower = makeFollower(castingSpec, leader, followerOptions);
  const iteratorP = E(iterateLatest(follower))[Symbol.asyncIterator]();

  let finished = false;
  let currentState;

  const updateState = async () => {
    const { value, done } = await E(iteratorP).next();
    // eslint-disable-next-line no-await-in-loop, @jessie.js/no-nested-await
    currentState = value.value;
    log('new currentState', currentState);
    finished = !!done;
  };
  // ??? would it be better for the coordinator maker to be synchronous? That
  // would require Coordinator interface to have an async method to initialize.
  await updateState();

  // XXX Follower using old API
  const watchState = async () => {
    while (!finished) {
      log('watchState awaiting');
      // Allow nested awaits (in loop) because it's safe for each to run in a turn
      // eslint-disable-next-line no-await-in-loop, @jessie.js/no-nested-await
      await updateState();
    }
  };

  watchState().catch(console.error);

  /** @type {import('./types').Coordinator} */
  const coord = Far('store cache coordinator', {
    getRecentValue: async key => {
      log('getRecentValue', key, 'from', currentState);
      return Promise.resolve(currentState[key]);
    },
    setCacheValue: async (key, newValue, guardPattern) => {
      throw Error('not impl');
    },
    updateCacheValue: async (key, updater, guardPattern) => {
      throw Error('not impl');
    },
  });
  return coord;
};
