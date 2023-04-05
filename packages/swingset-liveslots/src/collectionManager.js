import { assert, q, Fail } from '@agoric/assert';
import {
  zeroPad,
  makeEncodePassable,
  makeDecodePassable,
  isEncodedRemotable,
} from '@endo/marshal/src/encodePassable.js';
import { compareRank } from '@endo/marshal/src/rankOrder.js';
import {
  getRankCover,
  assertPattern,
  matches,
  mustMatch,
  M,
  makeCopySet,
  makeCopyMap,
} from '@agoric/store';
import { Far, passStyleOf } from '@endo/marshal';
import { makeBaseRef, parseVatSlot } from './parseVatSlots.js';
import {
  enumerateKeysStartEnd,
  enumerateKeysWithPrefix,
} from './vatstore-iterators.js';
import { makeCache } from './cache.js';

// XXX TODO: The following key length limit was put in place due to limitations
// in LMDB.  With the move away from LMDB, it is no longer relevant, but I'm
// leaving it in place for the time being as a general defensive measure against
// various kind of resource exhaustion mischief.  Although the switch to a
// database without the limitation that motivated this would enable this max
// length value to be made larger, current code is already engineered with this
// max in mind, so leaving it in place for the time being it should not pose any
// new challenges.  Later, when we have time to examine this more deeply, we
// should consider relaxing or removing this cap.
const MAX_DBKEY_LENGTH = 220;

function pattEq(p1, p2) {
  return compareRank(p1, p2) === 0;
}

function matchAny(patt) {
  return patt === undefined || pattEq(patt, M.any());
}

function throwNotDurable(value, slotIndex, serializedValue) {
  // prettier-ignore
  Fail`value is not durable: ${value} at slot ${q(slotIndex)} of ${serializedValue.body}`;
}

function prefixc(collectionID, dbEntryKey) {
  return `vc.${collectionID}.${dbEntryKey}`;
}

/**
 * @typedef {object} SchemaCacheValue
 * @property {Pattern} keyShape
 * @property {Pattern} valueShape
 * @property {string} label
 * @property {object} schemataCapData
 */

/*
 * Build a cache that holds the schema for each collection.
 *
 * The cache maps collectionID to { keyShape, valueShape, label,
 * schemataCapData }. These are initialized when the collection is
 * first constructed, and never modified afterwards. The values live
 * in the vatstore, inside two keys, one for the [keyShape,
 * valueShape] schemata, another for the label.
 */
function makeSchemaCache(syscall, unserialize) {
  /** @type {(collectionID: string) => SchemaCacheValue} */
  const readBacking = collectionID => {
    // this is only called once per crank
    const schemataKey = prefixc(collectionID, '|schemata');
    const schemataValue = syscall.vatstoreGet(schemataKey);
    const schemataCapData = JSON.parse(schemataValue);
    const { keyShape, valueShape } = unserialize(schemataCapData);
    const labelKey = prefixc(collectionID, '|label');
    const label = syscall.vatstoreGet(labelKey);
    return harden({ keyShape, valueShape, label, schemataCapData });
  };
  /** @type {(collectionID: string, value: SchemaCacheValue) => void } */
  const writeBacking = (collectionID, value) => {
    const { label, schemataCapData } = value;
    const schemataKey = prefixc(collectionID, '|schemata');
    const schemataValue = JSON.stringify(schemataCapData);
    syscall.vatstoreSet(schemataKey, schemataValue);
    const labelKey = prefixc(collectionID, '|label');
    syscall.vatstoreSet(labelKey, label);
  };
  /** @type {(collectionID: string) => void} */
  const deleteBacking = collectionID => {
    const schemataKey = prefixc(collectionID, '|schemata');
    const labelKey = prefixc(collectionID, '|label');
    syscall.vatstoreDelete(schemataKey);
    syscall.vatstoreDelete(labelKey);
  };
  return makeCache(readBacking, writeBacking, deleteBacking);
}

export function makeCollectionManager(
  syscall,
  vrm,
  allocateExportID,
  allocateCollectionID,
  convertValToSlot,
  convertSlotToVal,
  registerValue,
  serialize,
  unserialize,
  assertAcceptableSyscallCapdataSize,
) {
  const storeKindIDToName = new Map();

  /** @type { import('./cache.js').Cache<SchemaCacheValue>} */
  const schemaCache = makeSchemaCache(syscall, unserialize);

  const storeKindInfo = {
    scalarMapStore: {
      hasWeakKeys: false,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateMapStore,
      durable: false,
    },
    scalarWeakMapStore: {
      hasWeakKeys: true,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateWeakMapStore,
      durable: false,
    },
    scalarSetStore: {
      hasWeakKeys: false,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateSetStore,
      durable: false,
    },
    scalarWeakSetStore: {
      hasWeakKeys: true,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateWeakSetStore,
      durable: false,
    },
    scalarDurableMapStore: {
      hasWeakKeys: false,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateMapStore,
      durable: true,
    },
    scalarDurableWeakMapStore: {
      hasWeakKeys: true,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateWeakMapStore,
      durable: true,
    },
    scalarDurableSetStore: {
      hasWeakKeys: false,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateSetStore,
      durable: true,
    },
    scalarDurableWeakSetStore: {
      hasWeakKeys: true,
      kindID: 0,
      // eslint-disable-next-line no-use-before-define
      reanimator: reanimateWeakSetStore,
      durable: true,
    },
  };

  function initializeStoreKindInfo() {
    let storeKindIDs = {};
    const rawTable = syscall.vatstoreGet('storeKindIDTable');
    if (rawTable) {
      storeKindIDs = JSON.parse(rawTable);
    }
    for (const kind of Object.getOwnPropertyNames(storeKindInfo)) {
      let kindID = storeKindIDs[kind];
      if (!kindID) {
        kindID = allocateExportID();
        storeKindIDs[kind] = kindID;
      }
      storeKindInfo[kind].kindID = kindID;
      storeKindIDToName.set(`${kindID}`, kind);
      vrm.registerKind(
        kindID,
        storeKindInfo[kind].reanimator,
        // eslint-disable-next-line no-use-before-define
        deleteCollection,
        storeKindInfo[kind].durable,
      );
    }
    syscall.vatstoreSet('storeKindIDTable', JSON.stringify(storeKindIDs));
  }

  function obtainStoreKindID(kindName) {
    return storeKindInfo[kindName].kindID;
  }

  // Now that it's only used for this purpose, what should it be called?
  // TODO Should we be using the new encodeBigInt scheme instead, anyway?
  const BIGINT_TAG_LEN = 10;

  /**
   * Delete an entry from a collection as part of garbage collecting the entry's key.
   *
   * @param {string} collectionID - the collection from which the entry is to be deleted
   * @param {string} vobjID - the entry key being removed
   *
   * @returns {boolean} true if this removal possibly introduces a further GC opportunity
   */
  function deleteCollectionEntry(collectionID, vobjID) {
    const ordinalKey = prefixc(collectionID, `|${vobjID}`);
    const ordinalString = syscall.vatstoreGet(ordinalKey);
    syscall.vatstoreDelete(ordinalKey);
    const ordinalTag = zeroPad(ordinalString, BIGINT_TAG_LEN);
    const recordKey = prefixc(collectionID, `r${ordinalTag}:${vobjID}`);
    const rawValue = syscall.vatstoreGet(recordKey);
    let doMoreGC = false;
    if (rawValue !== undefined) {
      const value = JSON.parse(rawValue);
      doMoreGC = value.slots.map(vrm.removeReachableVref).some(b => b);
      syscall.vatstoreDelete(recordKey);
    }
    return doMoreGC;
  }
  vrm.setDeleteCollectionEntry(deleteCollectionEntry);

  function summonCollectionInternal(_initial, collectionID, kindName) {
    assert.typeof(kindName, 'string');
    const kindInfo = storeKindInfo[kindName];
    kindInfo || Fail`unknown collection kind ${kindName}`;
    const { hasWeakKeys, durable } = kindInfo;
    const getSchema = () => schemaCache.get(collectionID);
    const dbKeyPrefix = `vc.${collectionID}.`;
    let currentGenerationNumber = 0;

    const makeInvalidKeyTypeMsg = label =>
      `invalid key type for collection ${q(label)}`;
    const makeInvalidValueTypeMsg = label =>
      `invalid value type for collection ${q(label)}`;

    const serializeValue = value => {
      const { valueShape, label } = getSchema();
      if (valueShape !== undefined) {
        mustMatch(value, valueShape, makeInvalidValueTypeMsg(label));
      }
      return serialize(value);
    };

    const unserializeValue = data => {
      const { valueShape, label } = getSchema();
      const value = unserialize(data);
      if (valueShape !== undefined) {
        mustMatch(value, valueShape, makeInvalidValueTypeMsg(label));
      }
      return value;
    };

    function prefix(dbEntryKey) {
      return `${dbKeyPrefix}${dbEntryKey}`;
    }

    const encodeRemotable = remotable => {
      // eslint-disable-next-line no-use-before-define
      const ordinal = getOrdinal(remotable);
      ordinal !== undefined || Fail`no ordinal for ${remotable}`;
      const ordinalTag = zeroPad(ordinal, BIGINT_TAG_LEN);
      return `r${ordinalTag}:${convertValToSlot(remotable)}`;
    };

    // `makeEncodePassable` has three named options:
    // `encodeRemotable`, `encodeError`, and `encodePromise`.
    // Those which are omitted default to a function that always throws.
    // So by omitting `encodeError` and `encodePromise`, we know that
    // the resulting function will encode only `Key` arguments.
    const encodeKey = makeEncodePassable({ encodeRemotable });

    const vrefFromDBKey = dbKey => dbKey.substring(BIGINT_TAG_LEN + 2);

    const decodeRemotable = encodedKey =>
      convertSlotToVal(vrefFromDBKey(encodedKey));

    // `makeDecodePassable` has three named options:
    // `decodeRemotable`, `decodeError`, and `decodePromise`.
    // Those which are omitted default to a function that always throws.
    // So by omitting `decodeError` and `decodePromise`, we know that
    // the resulting function will decode only to `Key` results.
    const decodeKey = makeDecodePassable({ decodeRemotable });

    function generateOrdinal(remotable) {
      const nextOrdinal = Number.parseInt(
        syscall.vatstoreGet(prefix('|nextOrdinal')),
        10,
      );
      syscall.vatstoreSet(
        prefix(`|${convertValToSlot(remotable)}`),
        `${nextOrdinal}`,
      );
      syscall.vatstoreSet(prefix('|nextOrdinal'), `${nextOrdinal + 1}`);
    }

    function getOrdinal(remotable) {
      return syscall.vatstoreGet(prefix(`|${convertValToSlot(remotable)}`));
    }

    function deleteOrdinal(remotable) {
      syscall.vatstoreDelete(prefix(`|${convertValToSlot(remotable)}`));
    }

    function keyToDBKey(key) {
      const encodedKey = encodeKey(key);
      assert(encodedKey.length < MAX_DBKEY_LENGTH, 'key too large');
      return prefix(encodedKey);
    }

    function dbKeyToKey(dbKey) {
      const dbEntryKey = dbKey.substring(dbKeyPrefix.length);
      return decodeKey(dbEntryKey);
    }

    function has(key) {
      const { keyShape } = getSchema();
      if (!matches(key, keyShape)) {
        return false;
      }
      if (passStyleOf(key) === 'remotable') {
        return getOrdinal(key) !== undefined;
      } else {
        return syscall.vatstoreGet(keyToDBKey(key)) !== undefined;
      }
    }

    function get(key) {
      const { keyShape, label } = getSchema();
      mustMatch(key, keyShape, makeInvalidKeyTypeMsg(label));
      if (passStyleOf(key) === 'remotable' && getOrdinal(key) === undefined) {
        throw Fail`key ${key} not found in collection ${q(label)}`;
      }
      const result = syscall.vatstoreGet(keyToDBKey(key));
      if (!result) {
        throw Fail`key ${key} not found in collection ${q(label)}`;
      }
      return unserializeValue(JSON.parse(result));
    }

    function updateEntryCount(delta) {
      if (!hasWeakKeys) {
        const entryCount = Number.parseInt(
          syscall.vatstoreGet(prefix('|entryCount')),
          10,
        );
        syscall.vatstoreSet(prefix('|entryCount'), `${entryCount + delta}`);
      }
    }

    const doInit = (key, value, precheckedHas) => {
      const { keyShape, label } = getSchema();
      mustMatch(key, keyShape, makeInvalidKeyTypeMsg(label));
      precheckedHas ||
        !has(key) ||
        Fail`key ${key} already registered in collection ${q(label)}`;
      const serializedValue = serializeValue(value);
      currentGenerationNumber += 1;
      assertAcceptableSyscallCapdataSize([serializedValue]);
      if (durable) {
        serializedValue.slots.forEach((vref, slotIndex) => {
          if (!vrm.isDurable(vref)) {
            throwNotDurable(value, slotIndex, serializedValue);
          }
        });
      }
      if (passStyleOf(key) === 'remotable') {
        const vref = convertValToSlot(key);
        if (durable) {
          vrm.isDurable(vref) || Fail`key (${key}) is not durable in ${value}`;
        }
        generateOrdinal(key);
        if (hasWeakKeys) {
          vrm.addRecognizableValue(key, `${collectionID}`, true);
        } else {
          vrm.addReachableVref(vref);
        }
      }
      serializedValue.slots.forEach(vrm.addReachableVref);
      syscall.vatstoreSet(keyToDBKey(key), JSON.stringify(serializedValue));
      updateEntryCount(1);
    };

    const init = (key, value) => doInit(key, value, false);

    const addToSet = key => {
      if (!has(key)) {
        doInit(key, null, true);
      }
    };

    function set(key, value) {
      const { keyShape, label } = getSchema();
      mustMatch(key, keyShape, makeInvalidKeyTypeMsg(label));
      const after = serializeValue(harden(value));
      assertAcceptableSyscallCapdataSize([after]);
      if (durable) {
        after.slots.forEach((vref, i) => {
          if (!vrm.isDurable(vref)) {
            throwNotDurable(value, i, after);
          }
        });
      }
      const dbKey = keyToDBKey(key);
      const rawBefore = syscall.vatstoreGet(dbKey);
      rawBefore || Fail`key ${key} not found in collection ${q(label)}`;
      const before = JSON.parse(rawBefore);
      vrm.updateReferenceCounts(before.slots, after.slots);
      syscall.vatstoreSet(dbKey, JSON.stringify(after));
    }

    function deleteInternal(key) {
      const { keyShape, label } = getSchema();
      mustMatch(key, keyShape, makeInvalidKeyTypeMsg(label));
      if (passStyleOf(key) === 'remotable' && getOrdinal(key) === undefined) {
        throw Fail`key ${key} not found in collection ${q(label)}`;
      }
      const dbKey = keyToDBKey(key);
      const rawValue = syscall.vatstoreGet(dbKey);
      rawValue || Fail`key ${key} not found in collection ${q(label)}`;
      const value = JSON.parse(rawValue);
      const doMoreGC1 = value.slots.map(vrm.removeReachableVref).some(b => b);
      syscall.vatstoreDelete(dbKey);
      let doMoreGC2 = false;
      if (passStyleOf(key) === 'remotable') {
        deleteOrdinal(key);
        if (hasWeakKeys) {
          vrm.removeRecognizableValue(key, `${collectionID}`, true);
        } else {
          doMoreGC2 = vrm.removeReachableVref(convertValToSlot(key));
        }
      }
      return doMoreGC1 || doMoreGC2;
    }

    function del(key) {
      deleteInternal(key);
      updateEntryCount(-1);
    }

    function entriesInternal(
      yieldKeys,
      yieldValues,
      keyPatt = M.any(),
      valuePatt = M.any(),
    ) {
      assert(yieldKeys || yieldValues, 'useless entries()');
      assertPattern(keyPatt);
      assertPattern(valuePatt);

      const [coverStart, coverEnd] = getRankCover(keyPatt, encodeKey);
      const start = prefix(coverStart); // inclusive
      const end = prefix(coverEnd); // exclusive

      const generationAtStart = currentGenerationNumber;
      function checkGen() {
        if (generationAtStart !== currentGenerationNumber) {
          Fail`keys in store cannot be added to during iteration`;
        }
      }

      const needToMatchKey = !matchAny(keyPatt);
      const needToMatchValue = !matchAny(valuePatt);

      // we always get the dbKey, but we might not need to unserialize it
      const needKeys = yieldKeys || needToMatchKey;
      // we don't always need the dbValue
      const needValues = yieldValues || needToMatchValue;

      /**
       * @yields {[any, any]}
       * @returns {Generator<[any, any], void, unknown>}
       */
      function* iter() {
        // the inner iterator yields all keys for which (start <= key < end)
        const iterKeys = enumerateKeysStartEnd(syscall, start, end, checkGen);

        // and the outer iterator filters by keyPatt/valuePatt and
        // yields the right [key,value] tuples
        for (const dbKey of iterKeys) {
          const key = needKeys ? dbKeyToKey(dbKey) : undefined;
          // safe because needToMatchKey implies needKeys
          if (needToMatchKey && !matches(key, keyPatt)) {
            continue;
          }
          const value = needValues
            ? unserializeValue(JSON.parse(syscall.vatstoreGet(dbKey)))
            : undefined;
          if (needToMatchValue && !matches(value, valuePatt)) {
            continue;
          }
          yield [yieldKeys ? key : undefined, yieldValues ? value : undefined];
        }
      }

      return iter();
    }

    function keys(keyPatt, valuePatt) {
      function* iter() {
        for (const entry of entriesInternal(true, false, keyPatt, valuePatt)) {
          yield entry[0];
        }
      }
      return iter();
    }

    /**
     * Clear the entire contents of a collection non-selectively.  Since we are
     * being unconditional, we don't need to inspect any of the keys to decide
     * what to do and therefore can avoid deserializing the keys. In particular,
     * this avoids swapping in any virtual objects that were used as keys, which
     * can needlessly thrash the virtual object cache when an entire collection
     * is being deleted.
     *
     * @returns {boolean} true if this operation introduces a potential
     *   opportunity to do further GC.
     */
    function clearInternalFull() {
      let doMoreGC = false;
      const [coverStart, coverEnd] = getRankCover(M.any(), encodeKey);
      const start = prefix(coverStart);
      const end = prefix(coverEnd);

      // this yields all keys for which (start <= key < end)
      for (const dbKey of enumerateKeysStartEnd(syscall, start, end)) {
        const value = JSON.parse(syscall.vatstoreGet(dbKey));
        doMoreGC =
          value.slots.map(vrm.removeReachableVref).some(b => b) || doMoreGC;
        syscall.vatstoreDelete(dbKey);
        if (isEncodedRemotable(dbKey)) {
          const keyVref = vrefFromDBKey(dbKey);
          if (hasWeakKeys) {
            vrm.removeRecognizableVref(keyVref, `${collectionID}`, true);
          } else {
            doMoreGC = vrm.removeReachableVref(keyVref) || doMoreGC;
          }
          syscall.vatstoreDelete(prefix(`|${keyVref}`));
        }
      }
      return doMoreGC;
    }

    function clearInternal(isDeleting, keyPatt, valuePatt) {
      let doMoreGC = false;
      if (isDeleting || (matchAny(keyPatt) && matchAny(valuePatt))) {
        doMoreGC = clearInternalFull();
      } else {
        for (const k of keys(keyPatt, valuePatt)) {
          doMoreGC = deleteInternal(k) || doMoreGC;
        }
      }
      if (!hasWeakKeys && !isDeleting) {
        syscall.vatstoreSet(prefix('|entryCount'), '0');
      }
      return doMoreGC;
    }

    function clear(keyPatt, valuePatt) {
      clearInternal(false, keyPatt, valuePatt);
    }

    function values(keyPatt, valuePatt) {
      function* iter() {
        for (const entry of entriesInternal(false, true, keyPatt, valuePatt)) {
          yield entry[1];
        }
      }
      return iter();
    }

    function entries(keyPatt, valuePatt) {
      function* iter() {
        for (const entry of entriesInternal(true, true, keyPatt, valuePatt)) {
          yield entry;
        }
      }
      return iter();
    }

    function countEntries(keyPatt, valuePatt) {
      let count = 0;
      // eslint-disable-next-line no-use-before-define, no-unused-vars
      for (const k of keys(keyPatt, valuePatt)) {
        count += 1;
      }
      return count;
    }

    function getSize(keyPatt, valuePatt) {
      if (matchAny(keyPatt) && matchAny(valuePatt)) {
        return Number.parseInt(syscall.vatstoreGet(prefix('|entryCount')), 10);
      }
      return countEntries(keyPatt, valuePatt);
    }

    function sizeInternal() {
      return countEntries();
    }

    const snapshotSet = keyPatt => makeCopySet(keys(keyPatt));

    const snapshotMap = (keyPatt, valuePatt) =>
      makeCopyMap(entries(keyPatt, valuePatt));

    return {
      has,
      get,
      getSize,
      init,
      addToSet,
      set,
      delete: del,
      keys,
      values,
      entries,
      snapshotSet,
      snapshotMap,
      sizeInternal,
      clear,
      clearInternal,
    };
  }

  function summonCollection(initial, collectionID, kindName) {
    const hasWeakKeys = storeKindInfo[kindName].hasWeakKeys;
    const raw = summonCollectionInternal(initial, collectionID, kindName);

    const { has, get, init, addToSet, set, delete: del } = raw;
    const weakMethods = {
      has,
      get,
      init,
      addToSet,
      set,
      delete: del,
    };

    let collection;
    if (hasWeakKeys) {
      collection = weakMethods;
    } else {
      const {
        keys,
        values,
        entries,
        getSize,
        snapshotSet,
        snapshotMap,
        clear,
      } = raw;
      collection = {
        ...weakMethods,
        keys,
        values,
        entries,
        getSize,
        snapshotSet,
        snapshotMap,
        clear,
      };
    }
    return collection;
  }

  function storeSizeInternal(vobjID) {
    const { id, subid } = parseVatSlot(vobjID);
    const kindName = storeKindIDToName.get(`${id}`);
    kindName || Fail`unknown kind ID ${id}`;
    const collectionID = `${subid}`;
    const collection = summonCollectionInternal(false, collectionID, kindName);
    return collection.sizeInternal();
  }

  function deleteCollection(vobjID) {
    const { id, subid } = parseVatSlot(vobjID);
    const kindName = storeKindIDToName.get(`${id}`);
    const collectionID = `${subid}`;
    const collection = summonCollectionInternal(false, collectionID, kindName);

    const doMoreGC = collection.clearInternal(true);
    for (const dbKey of enumerateKeysWithPrefix(
      syscall,
      prefixc(collectionID, '|'),
    )) {
      // these two keys are owned by schemaCache, and will be deleted
      // when schemaCache is flushed
      if (dbKey.endsWith('|schemata') || dbKey.endsWith('|label')) {
        continue;
      }
      // but we must still delete the other keys (|nextOrdinal and
      // |entryCount)
      syscall.vatstoreDelete(dbKey);
    }
    schemaCache.delete(collectionID);
    return doMoreGC;
  }

  function makeCollection(label, kindName, isDurable, keyShape, valueShape) {
    assert.typeof(label, 'string');
    assert(storeKindInfo[kindName]);
    assertPattern(keyShape);
    if (valueShape) {
      assertPattern(valueShape);
    }
    const collectionID = `${allocateCollectionID()}`;
    const kindID = obtainStoreKindID(kindName);
    const vobjID = makeBaseRef(kindID, collectionID, isDurable);

    syscall.vatstoreSet(prefixc(collectionID, '|nextOrdinal'), '1');
    const { hasWeakKeys } = storeKindInfo[kindName];
    if (!hasWeakKeys) {
      syscall.vatstoreSet(prefixc(collectionID, '|entryCount'), '0');
    }

    const schemata = {}; // don't populate 'undefined', keep it small
    if (keyShape !== undefined) {
      schemata.keyShape = keyShape;
    }
    if (valueShape !== undefined) {
      schemata.valueShape = valueShape;
    }
    const schemataCapData = serialize(harden(schemata));
    schemaCache.set(
      collectionID,
      harden({ keyShape, valueShape, label, schemataCapData }),
    );

    return [vobjID, summonCollection(true, collectionID, kindName)];
  }

  function collectionToMapStore(collection) {
    const { snapshotSet: _, snapshotMap, ...rest } = collection;
    return Far('mapStore', { snapshot: snapshotMap, ...rest });
  }

  function collectionToWeakMapStore(collection) {
    return Far('weakMapStore', collection);
  }

  function collectionToSetStore(collection) {
    const {
      has,
      addToSet,
      delete: del,
      keys,
      getSize,
      snapshotSet,
      clear,
    } = collection;
    function* entries(patt) {
      for (const k of keys(patt)) {
        yield [k, k];
      }
    }
    function addAll(elems) {
      for (const elem of elems) {
        addToSet(elem, null);
      }
    }

    const setStore = {
      has,
      add: addToSet,
      addAll,
      delete: del,
      keys: patt => keys(patt),
      values: patt => keys(patt),
      entries,
      getSize: patt => getSize(patt),
      snapshot: snapshotSet,
      clear,
    };
    return Far('setStore', setStore);
  }

  function collectionToWeakSetStore(collection) {
    const { has, addToSet, delete: del } = collection;
    function addAll(elems) {
      for (const elem of elems) {
        addToSet(elem);
      }
    }

    const weakSetStore = {
      has,
      add: addToSet,
      addAll,
      delete: del,
    };
    return Far('weakSetStore', weakSetStore);
  }

  /**
   * Produce a big map.
   *
   * @template K,V
   * @param {string} [label='map'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {MapStore<K,V>}
   */
  function makeBigMapStore(label = 'map', options = {}) {
    const {
      keyShape = M.any(),
      valueShape = undefined,
      durable = false,
    } = options;
    const kindName = durable ? 'scalarDurableMapStore' : 'scalarMapStore';
    const [vobjID, collection] = makeCollection(
      label,
      kindName,
      durable,
      keyShape,
      valueShape,
    );
    const store = collectionToMapStore(collection);
    registerValue(vobjID, store, false);
    return store;
  }

  function provideBaggage() {
    let baggageID = syscall.vatstoreGet('baggageID');
    if (baggageID) {
      return convertSlotToVal(baggageID);
    } else {
      const baggage = makeBigMapStore('baggage', {
        keyShape: M.string(),
        durable: true,
      });
      baggageID = convertValToSlot(baggage);
      syscall.vatstoreSet('baggageID', baggageID);
      // artificially increment the baggage's refcount so it never gets GC'd
      vrm.addReachableVref(baggageID);
      return baggage;
    }
  }

  /**
   * Produce a weak big map.
   *
   * @template K,V
   * @param {string} [label='weakMap'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {WeakMapStore<K,V>}
   */
  function makeBigWeakMapStore(label = 'weakMap', options = {}) {
    const {
      keyShape = M.any(),
      valueShape = undefined,
      durable = false,
    } = options;
    const kindName = durable
      ? 'scalarDurableWeakMapStore'
      : 'scalarWeakMapStore';
    const [vobjID, collection] = makeCollection(
      label,
      kindName,
      durable,
      keyShape,
      valueShape,
    );
    const store = collectionToWeakMapStore(collection);
    registerValue(vobjID, store, false);
    return store;
  }

  /**
   * Produce a big set.
   *
   * @template K
   * @param {string} [label='set'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {SetStore<K>}
   */
  function makeBigSetStore(label = 'set', options = {}) {
    const {
      keyShape = M.scalar(),
      valueShape = undefined,
      durable = false,
    } = options;
    const kindName = durable ? 'scalarDurableSetStore' : 'scalarSetStore';
    const [vobjID, collection] = makeCollection(
      label,
      kindName,
      durable,
      keyShape,
      valueShape,
    );
    const store = collectionToSetStore(collection);
    registerValue(vobjID, store, false);
    return store;
  }

  /**
   * Produce a weak big set.
   *
   * @template K
   * @param {string} [label='weakSet'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {WeakSetStore<K>}
   */
  function makeBigWeakSetStore(label = 'weakSet', options = {}) {
    const {
      keyShape = M.scalar(),
      valueShape = undefined,
      durable = false,
    } = options;
    const kindName = durable
      ? 'scalarDurableWeakSetStore'
      : 'scalarWeakSetStore';
    const [vobjID, collection] = makeCollection(
      label,
      kindName,
      durable,
      keyShape,
      valueShape,
    );
    const store = collectionToWeakSetStore(collection);
    registerValue(vobjID, store, false);
    return store;
  }

  function reanimateCollection(vobjID) {
    const { id, subid } = parseVatSlot(vobjID);
    const collectionID = `${subid}`;
    const kindName = storeKindIDToName.get(`${id}`);
    return summonCollection(false, collectionID, kindName);
  }

  function reanimateMapStore(vobjID) {
    return collectionToMapStore(reanimateCollection(vobjID));
  }

  function reanimateWeakMapStore(vobjID) {
    return collectionToWeakMapStore(reanimateCollection(vobjID));
  }

  function reanimateSetStore(vobjID) {
    return collectionToSetStore(reanimateCollection(vobjID));
  }

  function reanimateWeakSetStore(vobjID) {
    return collectionToWeakSetStore(reanimateCollection(vobjID));
  }

  const testHooks = {
    obtainStoreKindID,
    storeSizeInternal,
    makeCollection,
  };

  /**
   * @param {Pattern} baseKeyShape
   * @param {StoreOptions} options
   * @returns {StoreOptions}
   */
  const narrowKeyShapeOption = (baseKeyShape, options) => {
    const { keyShape: keyShapeRestriction } = options;
    // To prepare for pattern-based compression
    // https://github.com/Agoric/agoric-sdk/pull/6432
    // put the substantive pattern, if any, last in the `M.and` since
    // an `M.and` pattern compresses only according to its last conjunct.
    const keyShape =
      keyShapeRestriction === undefined
        ? baseKeyShape
        : M.and(baseKeyShape, keyShapeRestriction);
    return harden({ ...options, keyShape });
  };

  /**
   * Produce a *scalar* big map: keys can only be atomic values, primitives, or
   * remotables.
   *
   * @template K,V
   * @param {string} [label='map'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {MapStore<K,V>}
   */
  const makeScalarBigMapStore = (label = 'map', options = {}) =>
    makeBigMapStore(label, narrowKeyShapeOption(M.scalar(), options));

  /**
   * Produce a *scalar* weak big map: keys can only be atomic values,
   * primitives, or remotables.
   *
   * @template K,V
   * @param {string} [label='weakMap'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {WeakMapStore<K,V>}
   */
  const makeScalarBigWeakMapStore = (label = 'weakMap', options = {}) =>
    makeBigWeakMapStore(label, narrowKeyShapeOption(M.scalar(), options));

  /**
   * Produce a *scalar* big set: keys can only be atomic values, primitives, or
   * remotables.
   *
   * @template K
   * @param {string} [label='set'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {SetStore<K>}
   */
  const makeScalarBigSetStore = (label = 'set', options = {}) =>
    makeBigSetStore(label, narrowKeyShapeOption(M.scalar(), options));

  /**
   * Produce a *scalar* weak big set: keys can only be atomic values,
   * primitives, or remotables.
   *
   * @template K
   * @param {string} [label='weakSet'] - diagnostic label for the store
   * @param {StoreOptions} [options]
   * @returns {WeakSetStore<K>}
   */
  const makeScalarBigWeakSetStore = (label = 'weakSet', options = {}) =>
    makeBigWeakSetStore(label, narrowKeyShapeOption(M.scalar(), options));

  const flushSchemaCache = () => schemaCache.flush();

  function getRetentionStats() {
    return {};
  }

  return harden({
    initializeStoreKindInfo,
    makeScalarBigMapStore,
    makeScalarBigWeakMapStore,
    makeScalarBigSetStore,
    makeScalarBigWeakSetStore,
    provideBaggage,
    flushSchemaCache,
    getRetentionStats,
    testHooks,
  });
}
