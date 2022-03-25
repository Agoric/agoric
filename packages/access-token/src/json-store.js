// @ts-check
import fs from 'fs';
import path from 'path';
import process from 'process';
import Readlines from 'n-readlines';

// TODO: Update this when we make a breaking change.
// const DATA_FILE = 'data.jsonlines';
//
// For compatibility, because it's tricky to diagnose that the file location has
// changed when you're just trying to use the wallet from the browser.
const DATA_FILE = 'swingset-kernel-state.jsonlines';

/** @typedef {ReturnType<typeof makeStorageInMemory>['storage']} JSONStore */

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
}

/**
 * Create a new instance of a RAM-based implementation of the Storage API.
 *
 * The "Storage API" is a set of functions { has, getKeys, get, set, delete }
 * that work on string keys and accept string values.
 *
 * Returns an object: { storage, // the storage API object itself state // the
 * underlying map that holds the state in memory }
 */
function makeStorageInMemory() {
  const state = new Map();

  /**
   * Test if the state contains a value for a given key.
   *
   * @param {string} key The key that is of interest.
   * @returns {boolean} True if a value is stored for the key, false if not.
   * @throws If key is not a string.
   */
  function has(key) {
    if (`${key}` !== key) {
      throw new Error(`non-string key ${key}`);
    }
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
   * @yields An iterator for the keys from start <= key < end
   * @throws If either parameter is not a string.
   */
  function* getKeys(start, end) {
    if (`${start}` !== start) {
      throw new Error(`non-string start ${start}`);
    }
    if (`${end}` !== end) {
      throw new Error(`non-string end ${end}`);
    }

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
    if (`${key}` !== key) {
      throw new Error(`non-string key ${key}`);
    }
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
    if (`${key}` !== key) {
      throw new Error(`non-string key ${key}`);
    }
    if (`${value}` !== value) {
      throw new Error(`non-string value ${value}`);
    }
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
    if (`${key}` !== key) {
      throw new Error(`non-string key ${key}`);
    }
    state.delete(key);
  }

  const storage = {
    has,
    getKeys,
    get,
    set,
    delete: del,
  };

  return { storage, state };
}

/**
 * Do the work of `initJSONStore` and `openJSONStore`.
 *
 * @param {string} [dirPath] Path to a directory in which database files may be
 *   kept, or null.
 * @param {boolean} [forceReset] If true, initialize the database to an empty state
 * @returns {{
 *   storage: JSONStore; // a storage API object to load and store data
 *   commit: () => void; // commit changes made since the last commit
 *   close: () => void; // shutdown the store, abandoning any uncommitted changes
 * }}
 */
function makeJSONStore(dirPath, forceReset = false) {
  const { storage, state } = makeStorageInMemory();

  let storeFile;
  if (dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
    storeFile = path.resolve(dirPath, DATA_FILE);
    if (forceReset) {
      safeUnlink(storeFile);
    } else {
      let lines;
      try {
        lines = new Readlines(storeFile);
      } catch (e) {
        // storeFile will be missing the first time we try to use it.  That's OK;
        // commit will create it.
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
      if (lines) {
        let line = lines.next();
        while (line) {
          // @ts-ignore JSON.parse can take a Buffer
          const [key, value] = JSON.parse(line);
          storage.set(key, value);
          line = lines.next();
        }
      }
    }
  }

  /** Commit unsaved changes. */
  function commit() {
    if (dirPath) {
      const tempFile = `${storeFile}-${process.pid}.tmp`;
      const fd = fs.openSync(tempFile, 'w');

      for (const [key, value] of state.entries()) {
        const line = JSON.stringify([key, value]);
        fs.writeSync(fd, line);
        fs.writeSync(fd, '\n');
      }
      fs.closeSync(fd);
      fs.renameSync(tempFile, storeFile);
    }
  }

  /**
   * Close the "database", abandoning any changes made since the last commit (if
   * you want to save them, call commit() first).
   */
  function close() {
    // Nothing to do here.
  }

  return { storage, commit, close };
}

/**
 * Create a swingset store that is an in-memory map, normally backed by JSON
 * serialized to a text file. If there is an existing store at the given
 * `dirPath`, it will be reinitialized to an empty state.
 *
 * @param {string} [dirPath] Path to a directory in which database files may be
 *   kept. This directory need not actually exist yet (if it doesn't it will be
 *   created) but it is reserved (by the caller) for the exclusive use of this
 *   JSON store instance. If this is nullish, the JSON store created will have
 *   no backing store and thus be non-persistent.
 *
 *   Returns an object: { storage, // a storage API object to load and store data
 *   commit, // a function to commit changes made since the last commit close //
 *   a function to shutdown the store, abandoning any uncommitted // changes }
 */
export function initJSONStore(dirPath) {
  if (dirPath !== null && dirPath !== undefined && `${dirPath}` !== dirPath) {
    throw new Error('dirPath must be a string or nullish');
  }
  return makeJSONStore(dirPath, true);
}

/**
 * Open a swingset store that is an in-memory map, backed by JSON serialized to
 * a text file. If there is no existing store at the given `dirPath`, a new,
 * empty store will be created.
 *
 * @param {string} dirPath Path to a directory in which database files may be
 *   kept. This directory need not actually exist yet (if it doesn't it will be
 *   created) but it is reserved (by the caller) for the exclusive use of this
 *   JSON store instance.
 *
 *   Returns an object: { storage, // a storage API object to load and store data
 *   commit, // a function to commit changes made since the last commit close //
 *   a function to shutdown the store, abandoning any uncommitted // changes }
 */
export function openJSONStore(dirPath) {
  if (`${dirPath}` !== dirPath) {
    throw new Error('dirPath must be a string');
  }
  return makeJSONStore(dirPath, false);
}

/**
 * Produce a representation of all the state found in a JSON store.
 *
 * WARNING: This is a helper function intended for use in testing and debugging.
 * It extracts _everything_, and does so in the simplest and stupidest possible
 * way, hence it is likely to be a performance and memory hog if you attempt to
 * use it on anything real.
 *
 * @param {JSONStore} storage The swing storage whose state is to be extracted.
 * @returns {Record<string, string>} An array representing all the current state
 *   in `storage`, one element of the form [key, value] per key/value pair.
 */
export function getAllState(storage) {
  /** @type {Record<string, string>} */
  const stuff = {};
  for (const key of Array.from(storage.getKeys('', ''))) {
    // @ts-ignore get(key) of key from getKeys() is not undefined
    stuff[key] = storage.get(key);
  }
  return stuff;
}

/**
 * Stuff a bunch of state into a JSON store.
 *
 * WARNING: This is intended to support testing and should not be used as a
 * general store initialization mechanism. In particular, note that it does not
 * bother to remove any existing state in the store that it is given.
 *
 * @param {JSONStore} storage The storage whose state is to be set.
 * @param {[string, string][]} stuff An array of key/value pairs, each element
 *   of the form [key, value]
 */
export function setAllState(storage, stuff) {
  for (const k of Object.getOwnPropertyNames(stuff)) {
    storage.set(k, stuff[k]);
  }
}

/**
 * Is this directory a compatible JSON store?
 *
 * @param {string} dirPath Path to a directory in which database files might be
 *   present. This directory need not actually exist
 * @returns {boolean} If the directory is present and contains the files created
 *   by initJSONStore or openJSONStore, returns true. Else returns false.
 */
export function isJSONStore(dirPath) {
  if (`${dirPath}` !== dirPath) {
    throw new Error('dirPath must be a string');
  }
  if (fs.existsSync(dirPath)) {
    const storeFile = path.resolve(dirPath, DATA_FILE);
    if (fs.existsSync(storeFile)) {
      return true;
    }
  }
  return false;
}
