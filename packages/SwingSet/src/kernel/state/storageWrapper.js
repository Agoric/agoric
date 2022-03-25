import { assert } from '@agoric/assert';
import { insistStorageAPI } from '../../lib/storageAPI.js';

// We manage a host-realm Storage object with a has/getKeys/get/set/del API.
// We must protect against cross-realm contamination, and add some
// convenience methods.

// NOTE: There's a lot of suspenders-and-belt paranoia here because we have to
// be vewy, vewy careful with host-realm objects.  This raises a question
// whether ad hoc paranoia is the best engineering practice.  Also, if it's
// important for users of a parameter to be aware of the potentially suspect
// nature of that parameter, perhaps we should establish some naming convention
// that signals that the object could be foreign and thus deserving of
// xenophobia.

/**
 * Given two iterators over ordered sequences, produce a new iterator that will
 * iterate in order over the merged output of the two iterators.
 *
 * @param {Iterator} it1
 * @param {Iterator} it2
 * @yields Any
 */
function* mergeSortedIterators(it1, it2) {
  let v1 = it1.next();
  let v2 = it2.next();
  while (!v1.done && !v2.done) {
    if (v1.value < v2.value) {
      const result = v1.value;
      v1 = it1.next();
      yield result;
    } else if (v1.value === v2.value) {
      const result = v1.value;
      v1 = it1.next();
      v2 = it2.next();
      yield result;
    } else {
      const result = v2.value;
      v2 = it2.next();
      yield result;
    }
  }
  const itrest = v1.done ? it2 : it1;
  let v = v1.done ? v2 : v1;
  while (!v.done) {
    const result = v.value;
    v = itrest.next();
    yield result;
  }
}

/**
 * Create and return a crank buffer, which wraps a storage object with logic
 * that buffers any mutations until told to commit them.
 *
 * @param {any} kvStore The storage object that this crank buffer will be based on.
 * @param {CreateSHA256} createSHA256
 * @param {(key: string) => boolean} isConsensusKey
 * @returns {any} An object { crankBuffer, // crank buffer as described,
 *   wrapping `kvStore` commitCrank, // function to save buffered mutations to
 *   `kvStore` abortCrank, // function to discard buffered mutations }
 */
export function buildCrankBuffer(
  kvStore,
  createSHA256,
  isConsensusKey = () => true,
) {
  insistStorageAPI(kvStore);
  let crankhasher;
  function resetCrankhash() {
    crankhasher = createSHA256();
  }

  // to avoid confusion, additions and deletions should never share a key
  const additions = new Map();
  const deletions = new Set();
  resetCrankhash();

  const crankBuffer = {
    has(key) {
      if (additions.has(key)) {
        return true;
      }
      if (deletions.has(key)) {
        return false;
      }
      return kvStore.has(key);
    },

    *getKeys(start, end) {
      // Warning: this function introduces a consistency risk that callers must
      // take into account in their usage of it.  If keys are added to the store
      // within the range from `start` to `end` while iteration is in progress,
      // these additions will not be visible to this iterator and thus not
      // reflected in the stream of keys it returns.  Callers who might be
      // vulnerable to any resulting data inconsistencies thus introduced must
      // take measures to protect themselves, either by avoiding making such
      // changes while iterating or by arranging to invalidate and reconstruct
      // the iterator when such changes are made.  At this layer of abstraction,
      // the store does not possess the necessary knowledge to protect the
      // caller from these kinds of risks, as the nature of the risks themselves
      // varies depending on what the caller is trying to do.  This API should
      // not be made available to user (i.e., vat) code.  Rather, it is intended
      // as a low-level mechanism to use in implementating higher level storage
      // abstractions that are expected to provide their own consistency
      // protections as appropriate to their own circumstances.

      assert.typeof(start, 'string');
      assert.typeof(end, 'string');

      // Find additions within the query range for use during iteration.
      const added = [];
      for (const k of additions.keys()) {
        if ((start === '' || start <= k) && (end === '' || k < end)) {
          added.push(k);
        }
      }
      added.sort();

      for (const k of mergeSortedIterators(
        added.values(),
        kvStore.getKeys(start, end),
      )) {
        if ((start === '' || start <= k) && (end === '' || k < end)) {
          if (!deletions.has(k)) {
            yield k;
          }
        }
      }
    },

    get(key) {
      assert.typeof(key, 'string');
      if (additions.has(key)) {
        return additions.get(key);
      }
      if (deletions.has(key)) {
        return undefined;
      }
      return kvStore.get(key);
    },

    set(key, value) {
      assert.typeof(key, 'string');
      assert.typeof(value, 'string');
      additions.set(key, value);
      deletions.delete(key);
      if (isConsensusKey(key)) {
        crankhasher.add('add');
        crankhasher.add('\n');
        crankhasher.add(key);
        crankhasher.add('\n');
        crankhasher.add(value);
        crankhasher.add('\n');
      }
    },

    delete(key) {
      assert.typeof(key, 'string');
      additions.delete(key);
      deletions.add(key);
      if (isConsensusKey(key)) {
        crankhasher.add('delete');
        crankhasher.add('\n');
        crankhasher.add(key);
        crankhasher.add('\n');
      }
    },
  };

  /**
   * Flush any buffered mutations to the underlying storage, and update the activityhash.
   *
   * @returns {{ crankhash: string; activityhash: string }}
   */
  function commitCrank() {
    for (const [key, value] of additions) {
      kvStore.set(key, value);
    }
    for (const key of deletions) {
      kvStore.delete(key);
    }
    additions.clear();
    deletions.clear();
    const crankhash = crankhasher.finish();
    resetCrankhash();

    let oldActivityhash = kvStore.get('activityhash');
    if (oldActivityhash === undefined) {
      oldActivityhash = '';
    }
    const hasher = createSHA256('activityhash\n');
    hasher.add(oldActivityhash);
    hasher.add('\n');
    hasher.add(crankhash);
    hasher.add('\n');
    const activityhash = hasher.finish();
    kvStore.set('activityhash', activityhash);

    return { crankhash, activityhash };
  }

  /** Discard any buffered mutations. */
  function abortCrank() {
    additions.clear();
    deletions.clear();
    resetCrankhash();
  }

  return harden({ crankBuffer, commitCrank, abortCrank });
}

/** @param {KVStore} kvStore */
export function addHelpers(kvStore) {
  // these functions are built on top of the DB interface
  insistStorageAPI(kvStore);

  // NOTE: awkward naming: the thing that returns a stream of keys is named
  // "enumerate..." while the thing that returns a stream of values is named
  // "get..."
  function* enumeratePrefixedKeys(prefix, start = 0) {
    // Return an iterator over all existing keys `${prefix}${N}`, for N
    // starting at `start`, in numeric order. This is implemented with
    // has/get rather than any DB-specific functionality: we could imagine
    // a DB with getRange(start, end), but the numbers would be sorted
    // incorrectly.
    for (let i = start; true; i += 1) {
      const key = `${prefix}${i}`;
      if (kvStore.has(key)) {
        yield key;
      } else {
        return;
      }
    }
  }

  function* getPrefixedValues(prefix, start = 0) {
    for (const key of enumeratePrefixedKeys(prefix, start)) {
      yield kvStore.get(key) || assert.fail('enumerate ensures get');
    }
  }

  function deletePrefixedKeys(prefix, start = 0) {
    // this is kind of like a deleteRange() would be, but can be implemented
    // efficiently without backend DB support because it only looks at
    // numeric suffixes, in sequential order.
    for (const key of enumeratePrefixedKeys(prefix, start)) {
      kvStore.delete(key);
    }
  }

  return harden({
    enumeratePrefixedKeys,
    getPrefixedValues,
    deletePrefixedKeys,
    ...kvStore,
  });
}

// The "KeeperStorage" API is a set of functions { has, get, set, delete,
// enumeratePrefixedKeys, getPrefixedValues, deletePrefixedKeys }. The Kernel
// Keeper manipulates the saved kernel state through an object that
// implements the KeeperStorage API. That object is usually associated with a
// write-back buffer wrapper (the CrankBuffer), but the keeper is unaware of
// that.

export function wrapStorage(kvStore, createSHA256, isConsensusKey) {
  insistStorageAPI(kvStore);
  const { crankBuffer, commitCrank, abortCrank } = buildCrankBuffer(
    kvStore,
    createSHA256,
    isConsensusKey,
  );
  const enhancedCrankBuffer = addHelpers(crankBuffer);
  return { enhancedCrankBuffer, commitCrank, abortCrank };
}
