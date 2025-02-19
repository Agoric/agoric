/// <reference types="ses" />

import { X, q, Fail, makeError } from '@endo/errors';
import { E, Far } from '@endo/far';
import * as tendermint34 from '@cosmjs/tendermint-rpc';
import * as stargateStar from '@cosmjs/stargate';

import { isStreamCell } from '@agoric/internal/src/lib-chainStorage.js';
import { MAKE_DEFAULT_DECODER, MAKE_DEFAULT_UNSERIALIZER } from './defaults.js';
import { makeCastingSpec } from './casting-spec.js';
import { makeLeader as defaultMakeLeader } from './leader-netconfig.js';

// A lot of cosmjs classes end up hardened through instances shared by this
// package so preemptively harden them all.
// However we cannot directly harden a module namespace object (exotic behavior
// for bindings) so spread the namespace instead
harden({
  tendermint34: { ...tendermint34 },
  stargateStar: { ...stargateStar },
});

const { QueryClient } = stargateStar;
const { Tendermint34Client } = tendermint34;
const textDecoder = new TextDecoder();

/** @template T @typedef {import('./types.js').Follower<import('./types.js').ValueFollowerElement<T>>} ValueFollower */

// Copied from https://github.com/cosmos/cosmjs/pull/1328/files until release
/**
 * @typedef {{
 *   readonly value: Uint8Array;
 *   readonly height: number;
 * }} QueryStoreResponse
 * The response of an ABCI query to Tendermint.
 * This is a subset of `tendermint34.AbciQueryResponse` in order
 * to abstract away Tendermint versions.
 */

/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 */
const arrayEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

const defaultDataPrefixBytes = new Uint8Array();

/**
 * @param {Uint8Array} prefixedData
 * @param {Uint8Array} prefix
 */
const stripPrefix = (prefixedData, prefix) => {
  assert(
    prefixedData.length >= prefix.length,
    X`result too short for data prefix ${prefix}`,
  );
  assert(
    arrayEqual(prefixedData.subarray(0, prefix.length), prefix),
    X`${prefixedData} doesn't start with data prefix ${prefix}`,
  );
  return prefixedData.slice(prefix.length);
};

/**
 * @template T
 * @param {Iterable<T>} values
 * @returns {T}
 */
const collectSingle = values => {
  /** @type {T[]} */
  const head = [];
  let count = 0;
  for (const value of values) {
    count += 1;
    if (count === 1) {
      head.push(value);
    } else {
      assert.fail(`expected single value, got at least ${count}`);
    }
  }

  assert.equal(head.length, 1, 'expected single value');
  return head[0];
};

// Coordinate with switch/case of tryGetDataAtHeight.
const proofs = ['strict', 'none', 'optimistic'];

/**
 * @template T
 * @param {any} sourceP
 * @param {import('./types.js').LeaderOrMaker} [leaderOrMaker]
 * @param {import('./types.js').FollowerOptions} [options]
 * @returns {ValueFollower<T>}
 */
export const makeCosmjsFollower = (
  sourceP,
  leaderOrMaker = defaultMakeLeader,
  options = {},
) => {
  const {
    decode = MAKE_DEFAULT_DECODER(),
    unserializer = MAKE_DEFAULT_UNSERIALIZER(),
    proof = 'optimistic',
    crasher = null,
  } = options;

  /**
   * @param {any} err
   */
  const crash = err => {
    if (crasher) {
      E(crasher)
        .crash(`PROOF VERIFICATION FAILURE; crashing follower`, err)
        .catch(e => Fail`crashing follower failed: ${e}`);
    }
    throw err;
  };
  proofs.includes(proof) || Fail`unrecognized follower proof mode ${proof}`;

  const where = 'CosmJS follower';
  const castingSpecP = makeCastingSpec(sourceP);

  const leader =
    typeof leaderOrMaker === 'function' ? leaderOrMaker() : leaderOrMaker;

  const tendermintClientPs = new Map();
  /**
   * @param {string} endpoint
   * @returns {tendermint34.Tendermint34Client}
   */
  const provideTendermintClient = endpoint => {
    let clientP = tendermintClientPs.get(endpoint);
    if (!clientP) {
      clientP = Tendermint34Client.connect(endpoint);
      tendermintClientPs.set(endpoint, clientP);
    }
    return clientP;
  };

  /** @type {Map<string, import('@cosmjs/stargate').QueryClient>} */
  const endpointToQueryClient = new Map();

  /**
   * @param {string} endpoint
   */
  const provideQueryClient = async endpoint => {
    if (endpointToQueryClient.has(endpoint)) {
      // Cache hit.
      const queryClient = endpointToQueryClient.get(endpoint);
      assert(queryClient);
      return queryClient;
    }
    // Create a new client.  They retry automatically.
    const rpcClient = await provideTendermintClient(endpoint);
    const queryClient = QueryClient.withExtensions(rpcClient);
    endpointToQueryClient.set(endpoint, queryClient);
    return queryClient;
  };

  /**
   * @param {(endpoint: string, storeName: string, storeSubkey: Uint8Array) => Promise<QueryStoreResponse>} tryGetPrefixedData
   * @returns {Promise<QueryStoreResponse>}
   */
  const retryGetPrefixedData = async tryGetPrefixedData => {
    const {
      storeName,
      storeSubkey,
      dataPrefixBytes = defaultDataPrefixBytes,
      noDataValue,
    } = await castingSpecP;

    if (typeof storeName !== 'string') {
      throw Fail`storeName must be a string, got ${storeName}`;
    }
    if (!storeSubkey) {
      throw Fail`storeSubkey must be a Uint8Array, got ${storeSubkey}`;
    }

    // mapEndpoints is our retry loop.
    const values = await E(leader).mapEndpoints(where, async endpoint =>
      tryGetPrefixedData(endpoint, storeName, storeSubkey).then(
        result => {
          return { result, error: null };
        },
        error => {
          return { result: null, error };
        },
      ),
    );

    const { result, error } = collectSingle(values);
    if (error !== null) {
      throw error;
    }
    assert(result);

    /** @type {Uint8Array} */
    let value;
    if (result.value.length === 0) {
      value = result.value;
    } else if (noDataValue && arrayEqual(result.value, noDataValue)) {
      value = new Uint8Array();
    } else {
      value = stripPrefix(result.value, dataPrefixBytes);
    }
    return { value, height: result.height };
  };

  /**
   * @deprecated no longer supported https://github.com/cosmos/cosmjs/pull/1623
   * @param {number} [height]
   * @returns {Promise<QueryStoreResponse>}
   */
  const getProvenDataAtHeight = async height => {
    console.error('getProvenDataAtHeight', height, 'is no longer supported');
    throw makeError(X`Verified queries are no longer supported`);
  };

  /**
   * @param {number} [height] desired height, or the latest height if not set
   * @returns {Promise<QueryStoreResponse>}
   */
  const getUnprovenDataAtHeight = async height => {
    return retryGetPrefixedData(async (endpoint, storeName, storeSubkey) => {
      const queryClient = await provideQueryClient(endpoint);
      return E(queryClient).queryAbci(
        `store/${storeName}/key`,
        storeSubkey,
        height,
      );
    });
  };

  /**
   * @param {number} [blockHeight] desired height, or the latest height if not set
   * @returns {Promise<QueryStoreResponse>}
   */
  const tryGetDataAtHeight = async blockHeight => {
    await null;
    if (proof === 'strict') {
      // Crash hard if we can't prove.
      return getProvenDataAtHeight(blockHeight).catch(crash);
    } else if (proof === 'none') {
      // Fast and loose.
      return getUnprovenDataAtHeight(blockHeight);
    } else if (proof === 'optimistic') {
      const alleged = await getUnprovenDataAtHeight(blockHeight);

      // Prove later, since it may take time we say we can't afford.
      getProvenDataAtHeight(alleged.height).then(proven => {
        if (arrayEqual(proven.value, alleged.value)) {
          return;
        }
        crash(
          makeError(
            X`Alleged value ${alleged.value} did not match proof ${proven.value}`,
          ),
        );
      }, crash);

      // Speculate that we got the right value.
      return alleged;
    }

    throw Fail`Unrecognized proof option ${q(
      proof,
    )}, must be one of strict, none, or optimistic`;
  };

  /**
   * @param {number} [blockHeight] desired height, or the latest height if not set
   */
  const getDataAtHeight = async blockHeight => {
    await null;
    for (let attempt = 0; ; attempt += 1) {
      try {
        // AWAIT
        return await tryGetDataAtHeight(blockHeight);
      } catch (error) {
        // We expect occasionally to see an error here if the chain has not
        // reached the requested blockHeight.
        await E(leader).retry(where, error, attempt);
        continue;
      }
    }
  };

  /**
   * @param {number} blockHeight
   * @param {Uint8Array} data
   */
  const streamCellForData = (blockHeight, data) => {
    const text = textDecoder.decode(data);
    try {
      const cell = JSON.parse(text);
      if (isStreamCell(cell)) {
        return harden({
          blockHeight: Number(cell.blockHeight),
          values: cell.values.map(decode),
        });
      }

      // This is JSON but not the shape of a stream cell.
      // Fall through...
    } catch {
      // This is not even JSON, so it must be a legacy value cell.
      // Fall through...
    }

    // Coerce legacy value cells to stream cells at their given height.
    // Since this is either the first iteration or the data varies bytewise
    // from the data on the previous block, we can assume the blockHeight is
    // the current block.
    return harden({
      blockHeight,
      values: [decode(text)],
    });
  };

  /**
   * @param {any} data
   * @param {number} blockHeight
   * @param {number} currentBlockHeight
   * @returns {Promise<import('./types.js').ValueFollowerElement<T>>}
   */
  const followerElementFromStreamCellValue = async (
    data,
    blockHeight,
    currentBlockHeight,
  ) => {
    await null;
    try {
      // AWAIT
      const value = await /** @type {T} */ (
        unserializer ? E(unserializer).fromCapData(data) : data
      );
      return { value, blockHeight, currentBlockHeight };
    } catch (e) {
      return { blockHeight, currentBlockHeight, error: e, value: undefined };
    }
  };

  /**
   * @param {import('./types.js').StreamCell<T>} streamCell
   * @param {number} currentBlockHeight
   * @yields {ValueFollowerElement<T>}
   */
  function* allValuesFromCell(streamCell, currentBlockHeight) {
    for (const data of streamCell.values) {
      yield followerElementFromStreamCellValue(
        data,
        streamCell.blockHeight,
        currentBlockHeight,
      );
    }
  }
  harden(allValuesFromCell);

  /**
   * @param {import('./types.js').StreamCell<T>} streamCell
   * @param {number} currentBlockHeight
   * @yields {ValueFollowerElement<T>}
   */
  function* reverseValuesFromCell(streamCell, currentBlockHeight) {
    for (let i = streamCell.values.length - 1; i >= 0; i -= 1) {
      yield followerElementFromStreamCellValue(
        streamCell.values[i],
        streamCell.blockHeight,
        currentBlockHeight,
      );
    }
  }
  harden(reverseValuesFromCell);

  /**
   * @param {import('./types.js').StreamCell<T>} streamCell
   * @param {number} currentBlockHeight
   * @yields {ValueFollowerElement<T>}
   */
  function* lastValueFromCell(streamCell, currentBlockHeight) {
    const { values } = streamCell;
    if (values.length > 0) {
      const last = values[values.length - 1];
      yield followerElementFromStreamCellValue(
        last,
        streamCell.blockHeight,
        currentBlockHeight,
      );
    }
  }
  harden(lastValueFromCell);

  /**
   * @yields {ValueFollowerElement<T>}
   */
  async function* getLatestIterable() {
    /** @type {number | undefined} the last known latest height */
    let lastHeight;
    let lastValue;
    await null;
    for (;;) {
      const latest = await getDataAtHeight();
      if (lastHeight && latest.height <= lastHeight) {
        // Wait for a fresh block
        // TODO Long-poll for next block
        // https://github.com/Agoric/agoric-sdk/issues/6154
        await E(leader).jitter(where);
        continue;
      }

      if (latest.value.length === 0) {
        // No value, so try again
        // TODO Long-poll for block data change
        // https://github.com/Agoric/agoric-sdk/issues/6154
        await E(leader).jitter(where);
        continue;
      }
      const currentStreamCell = streamCellForData(latest.height, latest.value);

      lastHeight = latest.height;

      // Ignore adjacent duplicates.
      // This can only occur for legacy cells.
      // It is possible that the data changed from and back to the last
      // sampled data, but ignoring intermediate changes is consistent with
      // the semantics of getLatestIterable.
      if (lastValue !== undefined && arrayEqual(lastValue, latest.value)) {
        continue;
      }
      // However, streamCells that vacillate will reemit, since each iteration
      // at a unique block height is considered distinct.

      yield* lastValueFromCell(currentStreamCell, latest.height);
      lastValue = latest.value;
    }
  }
  harden(getLatestIterable);

  /**
   * @param {number} [cursorBlockHeight]
   * @yields {ValueFollowerElement<T>}
   */
  async function* getEachIterableAtHeight(cursorBlockHeight) {
    // Track the data for the last emitted cell (the cell at the
    // cursorBlockHeight) so we know not to emit duplicates
    // of that cell.
    let cursorData;
    // Initially yield *all* the values that were most recently stored in a
    // block.
    // If the block has no corresponding data, wait for the first block to
    // contain data.
    await null;
    for (;;) {
      let thisHeight;
      ({ value: cursorData, height: thisHeight } =
        await getDataAtHeight(cursorBlockHeight));
      if (cursorData.length !== 0) {
        cursorBlockHeight = thisHeight;
        const cursorStreamCell = streamCellForData(
          cursorBlockHeight,
          cursorData,
        );
        yield* allValuesFromCell(cursorStreamCell, cursorBlockHeight);
        break;
      }
      // TODO Long-poll for next block
      // https://github.com/Agoric/agoric-sdk/issues/6154
      await E(leader).jitter(where);
    }

    // For each subsequent iteration, yield every value that has been
    // published since the last iteration and advance the cursor.
    for (;;) {
      // Scan backward for all changes since the last observed block and yield
      // them in forward order.
      // Stream cells allow us to skip blocks that did not change.
      // We walk backward through all blocks with legacy cells, only yielding
      // the value for cells that changed.
      // This does imply accumulating a potentially large number of values if
      // the eachIterable gets sampled infrequently.
      let { value: rightData, height: rightBlockHeight } =
        await getDataAtHeight();
      if (rightBlockHeight <= cursorBlockHeight || rightData.length === 0) {
        // TODO Long-poll for next block
        // https://github.com/Agoric/agoric-sdk/issues/6154
        await E(leader).jitter(where);
        continue;
      }

      let rightStreamCell = streamCellForData(rightBlockHeight, rightData);

      // Compare block cell data pairwise (left, right) and accumulate
      // a stack of each cell we encounter.
      const currentData = rightData;
      const currentBlockHeight = rightBlockHeight;

      const cells = [];
      while (rightBlockHeight > cursorBlockHeight) {
        if (rightStreamCell.blockHeight > rightBlockHeight) {
          const { storeName, storeSubkey } = await castingSpecP;
          throw Error(
            `Corrupt storage cell for ${storeName} under key ${storeSubkey} at block-height ${rightBlockHeight} claims to being published at a later block height ${rightStreamCell.blockHeight}`,
          );
        }
        const leftBlockHeight = rightStreamCell.blockHeight - 1;
        // Do not scan behind the cusor.
        if (leftBlockHeight <= cursorBlockHeight) {
          break;
        }
        const leftData = (await getDataAtHeight(leftBlockHeight)).value;
        // Do not scan behind a cell with no data.
        // This should not happen but can be tolerated.
        if (leftData.length === 0) {
          break;
        }
        const leftStreamCell = streamCellForData(leftBlockHeight, leftData);

        // Stream cells include a block height that is guaranteed to change
        // between iterations even if the values are identical.
        // We can rely on this difference to ensure that we yield
        // every iteration, including duplicates.
        // Legacy cells do not contain a block height to distingish versions,
        // so we simply assume that the value must change between iterations
        // for a cell to be worthy of notice.
        if (!arrayEqual(leftData, rightData)) {
          cells.push(rightStreamCell);
        }

        // Prepare for next iteration by moving left to right.
        rightData = leftData;
        rightStreamCell = leftStreamCell;
        rightBlockHeight = leftBlockHeight;
      }

      // At the end of a sequence of identical value cells, we emit the value
      // only if it differs from the last reported cell.
      if (!arrayEqual(rightData, cursorData)) {
        cells.push(rightStreamCell);
      }

      // Yield collected cells in forward order.
      // They were collected by scanning blocks backward.
      for (;;) {
        const cell = cells.pop();
        if (cell === undefined) {
          break;
        }
        yield* allValuesFromCell(cell, currentBlockHeight);
      }

      // Advance the cursor.
      cursorBlockHeight = currentBlockHeight;
      cursorData = currentData;
    }
  }
  harden(getEachIterableAtHeight);

  /**
   * @param {number} [cursorBlockHeight]
   * @yields {ValueFollowerElement<T>}
   */
  async function* getReverseIterableAtHeight(cursorBlockHeight) {
    // Track the data for the last emitted cell (the cell at the
    // cursorBlockHeight) so we know not to emit duplicates
    // of that cell.
    let cursorData;
    await null;
    while (cursorBlockHeight === undefined || cursorBlockHeight > 0) {
      ({ value: cursorData, height: cursorBlockHeight } =
        await getDataAtHeight(cursorBlockHeight));
      if (cursorData.length === 0) {
        // No data at the cursor height, so signal beginning of stream.
        return;
      }
      const cursorStreamCell = streamCellForData(cursorBlockHeight, cursorData);
      yield* reverseValuesFromCell(cursorStreamCell, cursorBlockHeight);
      cursorBlockHeight = cursorStreamCell.blockHeight - 1;
    }
  }
  harden(getReverseIterableAtHeight);

  /** @type {ValueFollower<T>} */
  return Far('chain follower', {
    async getLatestIterable() {
      return getLatestIterable();
    },
    async getEachIterable({ height = undefined } = {}) {
      return getEachIterableAtHeight(height);
    },
    async getReverseIterable({ height = undefined } = {}) {
      return getReverseIterableAtHeight(height);
    },
  });
};
