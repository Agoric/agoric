/** Kernel's keeper of persistent state for a vat. */
// @ts-check
import { Nat } from '@agoric/nat';
import { assert, details as X, q } from '@agoric/assert';
import { parseKernelSlot } from '../parseKernelSlots.js';
import { makeVatSlot, parseVatSlot } from '../../lib/parseVatSlots.js';
import { insistVatID } from '../../lib/id.js';
import { kdebug } from '../../lib/kdebug.js';
import {
  parseReachableAndVatSlot,
  buildReachableAndVatSlot,
} from './reachable.js';

/** @typedef {import('../../types-internal.js').RecordedVatOptions} RecordedVatOptions */

// makeVatKeeper is a pure function: all state is kept in the argument object

// TODO: tests rely on these numbers and haven't been updated to use names.
const FIRST_OBJECT_ID = 50n;
const FIRST_PROMISE_ID = 60n;
const FIRST_DEVICE_ID = 70n;

/**
 * Establish a vat's state.
 *
 * @param {any} kvStore The key-value store in which the persistent state will be kept
 * @param {any} streamStore Accompanying stream store
 * @param {string} vatID The vat ID string of the vat in question TODO: consider
 *   making this part of makeVatKeeper
 */
export function initializeVatState(kvStore, streamStore, vatID) {
  kvStore.set(`${vatID}.o.nextID`, `${FIRST_OBJECT_ID}`);
  kvStore.set(`${vatID}.p.nextID`, `${FIRST_PROMISE_ID}`);
  kvStore.set(`${vatID}.d.nextID`, `${FIRST_DEVICE_ID}`);
  kvStore.set(`${vatID}.nextDeliveryNum`, `0`);
  kvStore.set(
    `${vatID}.t.endPosition`,
    `${JSON.stringify(streamStore.STREAM_START)}`,
  );
}

/**
 * Produce a vat keeper for a vat.
 *
 * @param {KVStorePlus} kvStore The keyValue store in which the persistent state
 *   will be kept
 * @param {StreamStore} streamStore Accompanying stream store, for the transcripts
 * @param {any} kernelSlog
 * @param {string} vatID The vat ID string of the vat in question
 * @param {any} addKernelObject Kernel function to add a new object to the
 *   kernel's mapping tables.
 * @param {any} addKernelPromiseForVat Kernel function to add a new promise to
 *   the kernel's mapping tables.
 * @param {(kernelSlot: string) => boolean} kernelObjectExists
 * @param {any} incrementRefCount
 * @param {any} decrementRefCount
 * @param {(kernelSlot: string) => {
 *   reachable: number;
 *   recognizable: number;
 * }} getObjectRefCount
 * @param {(
 *   kernelSlot: string,
 *   o: { reachable: number; recognizable: number },
 * ) => void} setObjectRefCount
 * @param {(
 *   vatID: string,
 *   kernelSlot: string,
 * ) => { isReachable: boolean; vatSlot: string }} getReachableAndVatSlot
 * @param {(kernelSlot: string) => void} addMaybeFreeKref
 * @param {any} incStat
 * @param {any} decStat
 * @param {any} getCrankNumber
 * @param {SnapStore} [snapStore] Returns an object to hold and access the
 *   kernel's state for the given vat
 */
export function makeVatKeeper(
  kvStore,
  streamStore,
  kernelSlog,
  vatID,
  addKernelObject,
  addKernelPromiseForVat,
  kernelObjectExists,
  incrementRefCount,
  decrementRefCount,
  getObjectRefCount,
  setObjectRefCount,
  getReachableAndVatSlot,
  addMaybeFreeKref,
  incStat,
  decStat,
  getCrankNumber,
  snapStore = undefined,
) {
  insistVatID(vatID);
  const transcriptStream = `transcript-${vatID}`;

  function getRequired(key) {
    const value = kvStore.get(key);
    assert(value !== undefined, `missing: ${key}`);
    return value;
  }

  /**
   * @param {SourceOfBundle} source
   * @param {RecordedVatOptions} options
   */
  function setSourceAndOptions(source, options) {
    // take care with API change
    assert(options.managerType, X`vat options missing managerType`);
    assert(source);
    assert(
      'bundle' in source || 'bundleName' in source || 'bundleID' in source,
    );
    assert.typeof(options, 'object');
    kvStore.set(`${vatID}.source`, JSON.stringify(source));
    kvStore.set(`${vatID}.options`, JSON.stringify(options));
  }

  function getSourceAndOptions() {
    const source = JSON.parse(getRequired(`${vatID}.source`));
    /** @type {ManagerOptions} */
    const options = JSON.parse(kvStore.get(`${vatID}.options`) || '{}');
    return harden({ source, options });
  }

  function getOptions() {
    /** @type {ManagerOptions} */
    const options = JSON.parse(kvStore.get(`${vatID}.options`) || '{}');
    return harden(options);
  }

  function initializeReapCountdown(count) {
    assert(
      typeof count === 'number' ||
        typeof count === 'bigint' ||
        count === 'never',
      `bad reapCountdown ${count}`,
    );
    kvStore.set(`${vatID}.reapInterval`, `${count}`);
    kvStore.set(`${vatID}.reapCountdown`, `${count}`);
  }

  function countdownToReap() {
    const rawCount = getRequired(`${vatID}.reapCountdown`);
    if (rawCount === 'never') {
      return false;
    } else {
      const count = Number.parseInt(rawCount, 10);
      if (count === 1) {
        kvStore.set(
          `${vatID}.reapCountdown`,
          getRequired(`${vatID}.reapInterval`),
        );
        return true;
      } else {
        kvStore.set(`${vatID}.reapCountdown`, `${count - 1}`);
        return false;
      }
    }
  }

  function nextDeliveryNum() {
    const num = Nat(BigInt(getRequired(`${vatID}.nextDeliveryNum`)));
    kvStore.set(`${vatID}.nextDeliveryNum`, `${num + 1n}`);
    return num;
  }

  function getReachableFlag(kernelSlot) {
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    const data = kvStore.get(kernelKey);
    const { isReachable } = parseReachableAndVatSlot(data);
    return isReachable;
  }

  function insistNotReachable(kernelSlot) {
    const isReachable = getReachableFlag(kernelSlot);
    assert.equal(isReachable, false, X`${kernelSlot} was reachable, oops`);
  }

  function setReachableFlag(kernelSlot, _tag) {
    const { type } = parseKernelSlot(kernelSlot);
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    const { isReachable, vatSlot } = parseReachableAndVatSlot(
      kvStore.get(kernelKey),
    );
    const { allocatedByVat } = parseVatSlot(vatSlot);
    kvStore.set(kernelKey, buildReachableAndVatSlot(true, vatSlot));
    // increment 'reachable' part of refcount, but only for object imports
    if (!isReachable && type === 'object' && !allocatedByVat) {
      // eslint-disable-next-line prefer-const
      let { reachable, recognizable } = getObjectRefCount(kernelSlot);
      reachable += 1;
      // kdebug(`++ ${kernelSlot} ${tag} ${reachable},${recognizable}`);
      setObjectRefCount(kernelSlot, { reachable, recognizable });
    }
  }

  function clearReachableFlag(kernelSlot, _tag) {
    const { type } = parseKernelSlot(kernelSlot);
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    const { isReachable, vatSlot } = parseReachableAndVatSlot(
      kvStore.get(kernelKey),
    );
    const { allocatedByVat } = parseVatSlot(vatSlot);
    kvStore.set(kernelKey, buildReachableAndVatSlot(false, vatSlot));
    // decrement 'reachable' part of refcount, but only for object imports
    if (
      isReachable &&
      type === 'object' &&
      !allocatedByVat &&
      kernelObjectExists(kernelSlot)
    ) {
      // eslint-disable-next-line prefer-const
      let { reachable, recognizable } = getObjectRefCount(kernelSlot);
      reachable -= 1;
      // kdebug(`-- ${kernelSlot} ${tag} ${reachable},${recognizable}`);
      setObjectRefCount(kernelSlot, { reachable, recognizable });
      if (reachable === 0) {
        addMaybeFreeKref(kernelSlot);
      }
    }
  }

  function importsKernelSlot(kernelSlot) {
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    const data = kvStore.get(kernelKey);
    if (data) {
      const { vatSlot } = parseReachableAndVatSlot(data);
      const { allocatedByVat } = parseVatSlot(vatSlot);
      if (!allocatedByVat) {
        return true;
      }
    }
    return false;
  }

  /**
   * Provide the kernel slot corresponding to a given vat slot, allocating a new
   * one (for exports only) if it doesn't already exist. If we're allowed to
   * allocate, we also ensure the 'reachable' flag is set on it (whether we
   * allocated a new one or used an existing one). If we're not allowed to
   * allocate, we insist that the reachable flag was already set.
   *
   * @param {string} vatSlot The vat slot of interest
   * @param {{ setReachable?: boolean; required?: boolean }} options
   *   'setReachable' will set the 'reachable' flag on vat exports, while
   *   'required' means we refuse to allocate a missing entry
   * @returns {string} The kernel slot that vatSlot maps to
   * @throws {Error} If vatSlot is not a kind of thing that can be exported by
   *   vats or is otherwise invalid.
   */
  function mapVatSlotToKernelSlot(vatSlot, options = {}) {
    const { setReachable = true, required = false } = options;
    assert.typeof(vatSlot, 'string', X`non-string vatSlot: ${vatSlot}`);
    const { type, allocatedByVat } = parseVatSlot(vatSlot);
    const vatKey = `${vatID}.c.${vatSlot}`;
    if (!kvStore.has(vatKey)) {
      assert(!required, `vref ${vatSlot} not in clist`);
      if (allocatedByVat) {
        let kernelSlot;
        if (type === 'object') {
          // this sets the initial refcount to reachable:0 recognizable:0
          kernelSlot = addKernelObject(vatID);
        } else if (type === 'device') {
          assert.fail(X`normal vats aren't allowed to export device nodes`);
        } else if (type === 'promise') {
          kernelSlot = addKernelPromiseForVat(vatID);
        } else {
          assert.fail(X`unknown type ${type}`);
        }
        // now increment the refcount with isExport=true and
        // onlyRecognizable=true, which will skip object exports (we only
        // count imports) and leave the reachability count at zero
        const incopts = { isExport: true, onlyRecognizable: true };
        incrementRefCount(kernelSlot, `${vatID}|vk|clist`, incopts);
        const kernelKey = `${vatID}.c.${kernelSlot}`;
        incStat('clistEntries');
        // we add the key as "unreachable" but "recognizable", and then rely
        // on setReachableFlag() at the end to both mark it reachable and to
        // update any necessary refcounts consistently
        kvStore.set(kernelKey, buildReachableAndVatSlot(false, vatSlot));
        kvStore.set(vatKey, kernelSlot);
        if (kernelSlog) {
          kernelSlog.changeCList(
            vatID,
            getCrankNumber(),
            'export',
            kernelSlot,
            vatSlot,
          );
        }
        kdebug(`Add mapping v->k ${kernelKey}<=>${vatKey}`);
      } else {
        // the vat didn't allocate it, and the kernel didn't allocate it
        // (else it would have been in the c-list), so it must be bogus
        assert.fail(X`unknown vatSlot ${q(vatSlot)}`);
      }
    }
    const kernelSlot = getRequired(vatKey);

    if (setReachable) {
      if (allocatedByVat) {
        // exports are marked as reachable, if they weren't already
        setReachableFlag(kernelSlot, `${vatID}|vk|clistR`);
      } else {
        // imports must be reachable
        const { isReachable } = getReachableAndVatSlot(vatID, kernelSlot);
        assert(isReachable, X`vat tried to access unreachable import`);
      }
    }
    return kernelSlot;
  }

  /**
   * Provide the vat slot corresponding to a given kernel slot, including
   * creating the vat slot if it doesn't already exist.
   *
   * @param {string} kernelSlot The kernel slot of interest
   * @param {{ setReachable?: boolean; required?: boolean }} options
   *   'setReachable' will set the 'reachable' flag on vat imports, while
   *   'required' means we refuse to allocate a missing entry
   * @returns {string} The vat slot kernelSlot maps to
   * @throws {Error} If kernelSlot is not a kind of thing that can be imported
   *   by vats or is otherwise invalid.
   */
  function mapKernelSlotToVatSlot(kernelSlot, options = {}) {
    const { setReachable = true, required = false } = options;
    assert.typeof(kernelSlot, 'string', 'non-string kernelSlot');
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    if (!kvStore.has(kernelKey)) {
      assert(!required, `kref ${kernelSlot} not in clist`);
      const { type } = parseKernelSlot(kernelSlot);

      let id;
      if (type === 'object') {
        id = Nat(BigInt(getRequired(`${vatID}.o.nextID`)));
        kvStore.set(`${vatID}.o.nextID`, `${id + 1n}`);
      } else if (type === 'device') {
        id = Nat(BigInt(getRequired(`${vatID}.d.nextID`)));
        kvStore.set(`${vatID}.d.nextID`, `${id + 1n}`);
      } else if (type === 'promise') {
        id = Nat(BigInt(getRequired(`${vatID}.p.nextID`)));
        kvStore.set(`${vatID}.p.nextID`, `${id + 1n}`);
      } else {
        assert.fail(X`unknown type ${type}`);
      }
      // use isExport=false, since this is an import, and leave reachable
      // alone to defer to setReachableFlag below
      incrementRefCount(kernelSlot, `${vatID}|kv|clist`, {
        onlyRecognizable: true,
      });
      const vatSlot = makeVatSlot(type, false, id);

      const vatKey = `${vatID}.c.${vatSlot}`;
      incStat('clistEntries');
      kvStore.set(vatKey, kernelSlot);
      kvStore.set(kernelKey, buildReachableAndVatSlot(false, vatSlot));
      if (kernelSlog) {
        kernelSlog.changeCList(
          vatID,
          getCrankNumber(),
          'import',
          kernelSlot,
          vatSlot,
        );
      }
      kdebug(`Add mapping k->v ${kernelKey}<=>${vatKey}`);
    }

    const { isReachable, vatSlot } = getReachableAndVatSlot(vatID, kernelSlot);
    const { allocatedByVat } = parseVatSlot(vatSlot);
    if (setReachable) {
      if (!allocatedByVat) {
        // imports are marked as reachable, if they weren't already
        setReachableFlag(kernelSlot, `${vatID}|kv|clistR`);
      } else {
        // if the kernel is sending non-reachable exports back into
        // exporting vat, that's a kernel bug
        assert(isReachable, X`kernel sent unreachable export ${kernelSlot}`);
      }
    }
    return vatSlot;
  }

  /**
   * Test if there's a c-list entry for some slot.
   *
   * @param {string} slot The slot of interest
   * @returns {boolean} True iff this vat has a c-list entry mapping for `slot`.
   */
  function hasCListEntry(slot) {
    return kvStore.has(`${vatID}.c.${slot}`);
  }

  /**
   * Remove an entry from the vat's c-list.
   *
   * @param {string} kernelSlot The kernel slot being removed
   * @param {string} vatSlot The vat slot being removed
   */
  function deleteCListEntry(kernelSlot, vatSlot) {
    parseKernelSlot(kernelSlot); // used for its assert()
    const { allocatedByVat } = parseVatSlot(vatSlot);
    const kernelKey = `${vatID}.c.${kernelSlot}`;
    const vatKey = `${vatID}.c.${vatSlot}`;
    assert(kvStore.has(kernelKey));
    kdebug(`Delete mapping ${kernelKey}<=>${vatKey}`);
    if (kernelSlog) {
      kernelSlog.changeCList(
        vatID,
        getCrankNumber(),
        'drop',
        kernelSlot,
        vatSlot,
      );
    }
    const isExport = allocatedByVat;
    // We tolerate the object kref not being present in the kernel object
    // table, either because we're being called during the translation of
    // dispatch.retireExports/retireImports (so the kernel object has already
    // been deleted), or because the exporter's syscall.retireExport raced
    // ahead of the importer's syscall.retireImports (retireImports calls
    // deleteCListEntry).

    // First, make sure the reachable flag is clear, which might reduce the
    // reachable refcount. Note that we need the clist entry to find this, so
    // decref before delete.
    clearReachableFlag(kernelSlot, `${vatID}|del|clistR`);

    // Then decrementRefCount only the recognizable portion of the refcount.
    // `decrementRefCount` is a nop if the object is already gone.
    const decopts = { isExport, onlyRecognizable: true };
    decrementRefCount(kernelSlot, `${vatID}|del|clist`, decopts);

    decStat('clistEntries');
    kvStore.delete(kernelKey);
    kvStore.delete(vatKey);
  }

  function deleteCListEntriesForKernelSlots(kernelSlots) {
    for (const kernelSlot of kernelSlots) {
      const vatSlot = mapKernelSlotToVatSlot(kernelSlot);
      deleteCListEntry(kernelSlot, vatSlot);
    }
  }

  /**
   * Generator function to return the vat's transcript, one entry at a time.
   *
   * @param {StreamPosition} [startPos] Optional position to begin reading from
   * @yields {TranscriptEntry} A stream of transcript entries
   */
  function* getTranscript(startPos = streamStore.STREAM_START) {
    const endPos = JSON.parse(getRequired(`${vatID}.t.endPosition`));
    for (const entry of streamStore.readStream(
      transcriptStream,
      startPos,
      endPos,
    )) {
      yield /** @type {TranscriptEntry} */ (JSON.parse(entry));
    }
  }

  /**
   * Append an entry to the vat's transcript.
   *
   * @param {Object} entry The transcript entry to append.
   */
  function addToTranscript(entry) {
    const oldPos = JSON.parse(getRequired(`${vatID}.t.endPosition`));
    const newPos = streamStore.writeStreamItem(
      transcriptStream,
      JSON.stringify(entry),
      oldPos,
    );
    kvStore.set(`${vatID}.t.endPosition`, `${JSON.stringify(newPos)}`);
  }

  /** @returns {StreamPosition} */
  function getTranscriptEndPosition() {
    return JSON.parse(
      kvStore.get(`${vatID}.t.endPosition`) ||
        assert.fail('missing endPosition'),
    );
  }

  /** @returns {{ snapshotID: string; startPos: StreamPosition } | undefined} */
  function getLastSnapshot() {
    const notation = kvStore.get(`local.${vatID}.lastSnapshot`);
    if (!notation) {
      return undefined;
    }
    const { snapshotID, startPos } = JSON.parse(notation);
    assert.typeof(snapshotID, 'string');
    assert(startPos);
    return { snapshotID, startPos };
  }

  function transcriptSnapshotStats() {
    const totalEntries = getTranscriptEndPosition().itemCount;
    const lastSnapshot = getLastSnapshot();
    const snapshottedEntries = lastSnapshot
      ? lastSnapshot.startPos.itemCount
      : 0;
    return { totalEntries, snapshottedEntries };
  }

  /**
   * Add vatID to consumers of a snapshot.
   *
   * @param {string} snapshotID
   */
  function addToSnapshot(snapshotID) {
    const key = `local.snapshot.${snapshotID}`;
    const consumers = JSON.parse(kvStore.get(key) || '[]');
    assert(Array.isArray(consumers));

    // We can't completely rule out the possibility that
    // a vat will use the same snapshot twice in a row.
    //
    // PERFORMANCE NOTE: we assume consumer lists are short;
    // usually length 1. So O(n) search here is better
    // than keeping the list sorted.
    if (!consumers.includes(vatID)) {
      consumers.push(vatID);
      kvStore.set(key, JSON.stringify(consumers));
      // console.log('addToSnapshot result:', { vatID, snapshotID, consumers });
    }
  }

  /**
   * Remove vatID from consumers of a snapshot.
   *
   * @param {string} snapshotID
   */
  function removeFromSnapshot(snapshotID) {
    const key = `local.snapshot.${snapshotID}`;
    const consumersJSON = kvStore.get(key);
    assert(consumersJSON, X`cannot remove ${vatID}: ${key} key not defined`);
    const consumers = JSON.parse(consumersJSON);
    assert(Array.isArray(consumers));
    const ix = consumers.indexOf(vatID);
    assert(ix >= 0);
    consumers.splice(ix, 1);
    // console.log('removeFromSnapshot done:', { vatID, snapshotID, consumers });
    kvStore.set(key, JSON.stringify(consumers));
    return consumers.length;
  }

  /**
   * Store a snapshot, if given a snapStore.
   *
   * @param {VatManager} manager
   * @returns {Promise<boolean>}
   */
  async function saveSnapshot(manager) {
    if (!snapStore || !manager.makeSnapshot) {
      return false;
    }

    const snapshotID = await manager.makeSnapshot(snapStore);
    const old = getLastSnapshot();
    if (old) {
      if (removeFromSnapshot(old.snapshotID) === 0) {
        snapStore.prepareToDelete(old.snapshotID);
      }
    }
    const endPosition = getTranscriptEndPosition();
    kvStore.set(
      `local.${vatID}.lastSnapshot`,
      JSON.stringify({ snapshotID, startPos: endPosition }),
    );
    addToSnapshot(snapshotID);
    return true;
  }

  function vatStats() {
    function getCount(key, first) {
      const id = Nat(BigInt(getRequired(key)));
      return id - Nat(first);
    }

    const objectCount = getCount(`${vatID}.o.nextID`, FIRST_OBJECT_ID);
    const promiseCount = getCount(`${vatID}.p.nextID`, FIRST_PROMISE_ID);
    const deviceCount = getCount(`${vatID}.d.nextID`, FIRST_DEVICE_ID);
    const transcriptCount = JSON.parse(
      getRequired(`${vatID}.t.endPosition`),
    ).itemCount;

    // TODO: Fix the downstream JSON.stringify to allow the counts to be BigInts
    return harden({
      objectCount: Number(objectCount),
      promiseCount: Number(promiseCount),
      deviceCount: Number(deviceCount),
      transcriptCount: Number(transcriptCount),
    });
  }

  /**
   * Produce a dump of this vat's state for debugging purposes.
   *
   * @returns {[string, string, string][]} An array of this vat's state information
   */
  function dumpState() {
    const res = [];
    const prefix = `${vatID}.c.`;
    for (const k of kvStore.getKeys(prefix, `${vatID}.c/`)) {
      if (k.startsWith(prefix)) {
        const slot = k.slice(prefix.length);
        if (!slot.startsWith('k')) {
          const vatSlot = slot;
          const kernelSlot =
            kvStore.get(k) || assert.fail('getKeys ensures get');
          /** @type {[string, string, string]} */
          const item = [kernelSlot, vatID, vatSlot];
          res.push(item);
        }
      }
    }
    return harden(res);
  }

  return harden({
    setSourceAndOptions,
    getSourceAndOptions,
    getOptions,
    initializeReapCountdown,
    countdownToReap,
    nextDeliveryNum,
    importsKernelSlot,
    mapVatSlotToKernelSlot,
    mapKernelSlotToVatSlot,
    getReachableFlag,
    insistNotReachable,
    setReachableFlag,
    clearReachableFlag,
    hasCListEntry,
    deleteCListEntry,
    deleteCListEntriesForKernelSlots,
    getTranscript,
    transcriptSnapshotStats,
    addToTranscript,
    vatStats,
    dumpState,
    saveSnapshot,
    getLastSnapshot,
    removeFromSnapshot,
  });
}
