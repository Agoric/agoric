// @ts-check
import { assert, details as X, q } from '@agoric/assert';

/**
 * @typedef {import('./swingStore').KVStore} KVStore
 *
 * @typedef {import('./swingStore').StreamPosition} StreamPosition
 *
 * @typedef {import('./swingStore').StreamStore} StreamStore
 *
 * @typedef {import('./swingStore').SwingStore} SwingStore
 */

const streamPeek = new WeakMap(); // for tests to get raw access to the streams

/**
 * Create a non-persistent swing store based on an in-memory map.
 *
 * @returns {SwingStore}
 */
export function initEphemeralSwingStore() {
  const state = new Map();

  /**
   * Test if the state contains a value for a given key.
   *
   * @param {string} key The key that is of interest.
   * @returns {boolean} True if a value is stored for the key, false if not.
   * @throws If key is not a string.
   */
  function has(key) {
    assert.typeof(key, 'string');
    return state.has(key);
  }

  /**
   * Generator function that returns an iterator over all the keys within a
   * given range, in lexicographical order.
   *
   * Note that this can be slow as it's only intended for use in debugging and
   * test result verification.
   *
   * @param {string} start Start of the key range of interest (inclusive). An
   *   empty string indicates a range from the beginning of the key set.
   * @param {string} end End of the key range of interest (exclusive). An empty
   *   string indicates a range through the end of the key set.
   * @yields {string} An iterator for the keys from start <= key < end
   * @throws If either parameter is not a string.
   */
  function* getKeys(start, end) {
    assert.typeof(start, 'string');
    assert.typeof(end, 'string');

    const keys = Array.from(state.keys()).sort();
    for (const k of keys) {
      if ((start === '' || start <= k) && (end === '' || k < end)) {
        yield k;
      }
    }
  }

  /**
   * Obtain the value stored for a given key.
   *
   * @param {string} key The key whose value is sought.
   * @returns {string | undefined} The (string) value for the given key, or
   *   undefined if there is no such value.
   * @throws If key is not a string.
   */
  function get(key) {
    assert.typeof(key, 'string');
    return state.get(key);
  }

  /**
   * Store a value for a given key. The value will replace any prior value if
   * there was one.
   *
   * @param {string} key The key whose value is being set.
   * @param {string} value The value to set the key to.
   * @throws If either parameter is not a string.
   */
  function set(key, value) {
    assert.typeof(key, 'string');
    assert.typeof(value, 'string');
    state.set(key, value);
  }

  /**
   * Remove any stored value for a given key. It is permissible for there to be
   * no existing stored value for the key.
   *
   * @param {string} key The key whose value is to be deleted
   * @throws If key is not a string.
   */
  function del(key) {
    assert.typeof(key, 'string');
    state.delete(key);
  }

  const kvStore = {
    has,
    getKeys,
    get,
    set,
    delete: del,
  };

  /** @type {Map<string, string[]>} */
  const streams = new Map();
  /** @type {Map<string, string>} */
  const streamStatus = new Map();
  let statusCounter = 0;

  const STREAM_START = harden({ itemCount: 0 });

  function insistStreamName(streamName) {
    assert.typeof(streamName, 'string');
    assert(
      streamName.match(/^[-\w]+$/),
      X`invalid stream name ${q(streamName)}`,
    );
  }

  function insistStreamPosition(position) {
    assert.typeof(position.itemCount, 'number');
    assert(position.itemCount >= 0);
  }

  /**
   * Close a stream that's open for read or write.
   *
   * @param {string} streamName The stream to close
   */
  function closeStream(streamName) {
    insistStreamName(streamName);
    streamStatus.delete(streamName);
  }

  /**
   * Generator function that returns an iterator over the items in a stream.
   *
   * @param {string} streamName The stream to read
   * @param {Object} startPosition The position to start reading from
   * @param {Object} endPosition The position of the end of the stream
   * @returns {Iterable<string>} An iterable for the items in the named stream
   */
  function readStream(streamName, startPosition, endPosition) {
    insistStreamName(streamName);
    const stream = streams.get(streamName) || [];
    assert(
      !streamStatus.get(streamName),
      X`can't read stream ${q(streamName)} because it's already in use`,
    );
    insistStreamPosition(startPosition);
    insistStreamPosition(endPosition);
    assert(startPosition.itemCount <= endPosition.itemCount);

    if (endPosition.itemCount === 0) {
      return [];
    } else {
      const readStatus = `read-${statusCounter}`;
      statusCounter += 1;
      streamStatus.set(streamName, readStatus);
      stream.length = endPosition.itemCount;
      let pos = startPosition.itemCount;
      function* reader() {
        while (pos < stream.length) {
          assert(
            streamStatus.get(streamName) === readStatus,
            X`can't read stream ${q(streamName)}, it's been closed`,
          );
          const result = stream[pos];
          pos += 1;
          yield result;
        }
        assert(
          streamStatus.get(streamName) === readStatus,
          X`can't read stream ${q(streamName)}, it's been closed`,
        );
        streamStatus.delete(streamName);
      }
      return reader();
    }
  }

  /**
   * Write to a stream.
   *
   * @param {string} streamName The stream to be written
   * @param {string} item The item to write
   * @param {Object} position The position to write the item
   * @returns {Object} The new position after writing
   */
  function writeStreamItem(streamName, item, position) {
    insistStreamName(streamName);
    insistStreamPosition(position);
    let stream = streams.get(streamName);
    if (!stream) {
      stream = [];
      streams.set(streamName, stream);
    } else {
      assert(
        !streamStatus.get(streamName),
        X`can't write stream ${q(streamName)} because it's already in use`,
      );
    }
    stream[position.itemCount] = item;
    return harden({ itemCount: position.itemCount + 1 });
  }

  const streamStore = {
    readStream,
    writeStreamItem,
    closeStream,
    STREAM_START,
  };

  /** Commit unsaved changes. */
  function commit() {
    // Nothing to do here.
  }

  /**
   * Close the "database", abandoning any changes made since the last commit (if
   * you want to save them, call commit() first).
   */
  function close() {
    // Nothing to do here.
  }

  streamPeek.set(streamStore, streams);

  return harden({ kvStore, streamStore, commit, close });
}

/**
 * Produce a representation of all the state found in a swing store.
 *
 * WARNING: This is a helper function intended for use in testing and debugging.
 * It extracts _everything_, and does so in the simplest and stupidest possible
 * way, hence it is likely to be a performance and memory hog if you attempt to
 * use it on anything real.
 *
 * @param {SwingStore} swingStore The swing store whose state is to be extracted.
 * @returns {{
 *   kvStuff: Record<string, string>;
 *   streamStuff: Map<string, string[]>;
 * }}
 *   A crude representation of all of the state of `swingStore`
 */
export function getAllState(swingStore) {
  const { kvStore, streamStore } = swingStore;
  /** @type {Record<string, string>} */
  const kvStuff = {};
  for (const key of Array.from(kvStore.getKeys('', ''))) {
    // @ts-ignore get(key) of key from getKeys() is not undefined
    kvStuff[key] = kvStore.get(key);
  }
  const streamStuff = new Map();
  const peek = streamPeek.get(streamStore);
  if (peek) {
    for (const [streamName, stream] of peek.entries()) {
      streamStuff.set(streamName, Array.from(stream));
    }
  }
  return { kvStuff, streamStuff };
}

/**
 * Stuff a bunch of state into a swing store.
 *
 * WARNING: This is intended to support testing and should not be used as a
 * general store initialization mechanism. In particular, note that it does not
 * bother to remove any pre-existing state from the store that it is given.
 *
 * @param {SwingStore} swingStore The swing store whose state is to be set.
 * @param {{
 *   kvStuff: Record<string, string>;
 *   streamStuff: Map<string, string[]>;
 * }} stuff
 *   The state to stuff into `swingStore`
 */
export function setAllState(swingStore, stuff) {
  const { kvStore, streamStore } = swingStore;
  const { kvStuff, streamStuff } = stuff;
  for (const k of Object.getOwnPropertyNames(kvStuff)) {
    kvStore.set(k, kvStuff[k]);
  }
  for (const [streamName, stream] of streamStuff.entries()) {
    let pos = streamStore.STREAM_START;
    for (const item of stream) {
      pos = streamStore.writeStreamItem(streamName, item, pos);
    }
    streamStore.closeStream(streamName);
  }
}
