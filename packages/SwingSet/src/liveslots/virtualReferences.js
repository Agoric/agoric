// @ts-check
/* eslint-disable no-use-before-define, jsdoc/require-returns-type */

import { assert, details as X } from '@agoric/assert';
import { Nat } from '@agoric/nat';
import { parseVatSlot } from '../lib/parseVatSlots.js';

/**
 * @param {*} syscall  Vat's syscall object, used to access the vatstore operations.
 * @param {(val: object) => string} getSlotForVal  A function that returns the
 *   object ID (vref) for a given object, if any.  their corresponding export
 *   IDs
 * @param {(slot: string) => object} requiredValForSlot  A function that
 *   converts an object ID (vref) to an object.
 * @param {*} FinalizationRegistry  Powerful JavaScript intrinsic normally denied
 *   by SES
 * @param {*} addToPossiblyDeadSet  Function to record objects whose deaths
 *   should be reinvestigated
 * @param {*} addToPossiblyRetiredSet  Function to record dead objects whose
 *   retirement should be reinvestigated
 * @param {boolean} relaxDurabilityRules True IFF the associated swingset is
 *   running with relaxed durability rules
 */
export function makeVirtualReferenceManager(
  syscall,
  getSlotForVal,
  requiredValForSlot,
  FinalizationRegistry,
  addToPossiblyDeadSet,
  addToPossiblyRetiredSet,
  relaxDurabilityRules,
) {
  const droppedCollectionRegistry = new FinalizationRegistry(
    finalizeDroppedCollection,
  );

  /**
   * Check if a virtual object is truly dead - i.e., unreachable - and truly
   * delete it if so.
   *
   * A virtual object is kept alive if it or any of its facets are reachable by
   * any of three legs:
   *  - in-memory references (if so, it will have a representative and thus a
   *    non-null slot-to-val entry)
   *  - virtual references (if so, it will have a refcount > 0)
   *  - being exported (if so, its export flag will be set)
   *
   * This function is called after a leg has been reported missing, and only
   * if the memory (Representative) leg is currently missing, to see if the
   * other two legs are now gone also.
   *
   * Deletion consists of removing the vatstore entries that describe its state
   * and track its refcount status.  In addition, when a virtual object is
   * deleted, we delete any weak collection entries for which it was a key. If
   * it had been exported, we also inform the kernel that the vref has been
   * retired, so other vats can delete their weak collection entries too.
   *
   * @param {string} baseRef  The virtual object cohort that's plausibly dead
   *
   * @returns {[boolean, string[]]} A pair of a flag that's true if this
   *    possibly created a new GC opportunity and an array of vrefs that should
   *    now be regarded as unrecognizable
   */
  function possibleVirtualObjectDeath(baseRef) {
    const refCount = getRefCount(baseRef);
    const [reachable, retirees] = getExportStatus(baseRef);
    if (!reachable && refCount === 0) {
      let doMoreGC = deleteStoredRepresentation(baseRef);
      syscall.vatstoreDelete(`vom.rc.${baseRef}`);
      syscall.vatstoreDelete(`vom.es.${baseRef}`);
      doMoreGC = ceaseRecognition(baseRef) || doMoreGC;
      return [doMoreGC, retirees];
    }
    return [false, []];
  }

  /**
   * Get information about the export status of a virtual object.
   *
   * @param {string} baseRef  The baseRef of the virtual object of interest.
   *
   * @returns {[boolean, string[]]} A pair of a flag that's true if the
   *     indicated virtual object is reachable and an array of vrefs (to facets
   *     of the object) that should now be regarded as unrecognizable
   */
  function getExportStatus(baseRef) {
    const es = syscall.vatstoreGet(`vom.es.${baseRef}`);
    if (es) {
      const reachable = es.indexOf('r') >= 0;
      const retirees = [];
      if (!reachable) {
        if (es === 's') {
          // unfaceted
          retirees.push(baseRef);
        } else {
          // faceted
          for (let i = 0; i < es.length; i += 1) {
            if (es[i] === 's') {
              retirees.push(`${baseRef}:${i}`);
            }
          }
        }
      }
      return [reachable, retirees];
    } else {
      return [false, []];
    }
  }

  function getRefCount(baseRef) {
    const raw = syscall.vatstoreGet(`vom.rc.${baseRef}`);
    if (raw) {
      return Number(raw);
    } else {
      return 0;
    }
  }

  function setRefCount(baseRef, refCount) {
    const { virtual, facet } = parseVatSlot(baseRef);
    assert(
      !facet,
      `setRefCount ${baseRef} should not receive individual facets`,
    );
    syscall.vatstoreSet(`vom.rc.${baseRef}`, `${Nat(refCount)}`);
    if (refCount === 0) {
      if (!virtual) {
        syscall.vatstoreDelete(`vom.rc.${baseRef}`);
      }
      addToPossiblyDeadSet(baseRef);
    }
  }

  function getFacetCount(baseRef) {
    // Note that this only works if the VDO is in memory
    const val = requiredValForSlot(baseRef);
    if (Array.isArray(val)) {
      return val.length;
    } else {
      return 1;
    }
  }

  function setExportStatus(vref, exportStatus) {
    const { baseRef, facet } = parseVatSlot(vref);
    const key = `vom.es.${baseRef}`;
    const esRaw = syscall.vatstoreGet(key);
    // If `esRaw` is undefined, it means there's no export status information
    // available, which can only happen when we are exporting the object for the
    // first time, which in turn means that the object must be in memory (since
    // export is happening when it's being serialized) and thus it has an
    // instance or cohort record from which a facet count can be derived.  On
    // the other hand, if `esRaw` does have a value, the value will be a string
    // whose length is the facet count.  Either way, we will know how many
    // facets there are.
    const es = Array.from(esRaw || 'n'.repeat(getFacetCount(baseRef)));
    const facetIdx = facet === undefined ? 0 : facet;
    // The export status of each facet is encoded as:
    // 's' -> 'recogizable' ('s' for "see"), 'r' -> 'reachable', 'n' -> 'none'
    switch (exportStatus) {
      // POSSIBLE TODO: An anticipated refactoring may merge
      // dispatch.dropExports with dispatch.retireExports. If this happens, and
      // the export status can drop from 'reachable' to 'none' in a single step, we
      // must perform this "the export pillar has dropped" check in both the
      // reachable and the none cases (possibly reading the old status first, if
      // we must ensure addToPossiblyDeadSet only happens once).
      case 'recognizable': {
        es[facetIdx] = 's';
        syscall.vatstoreSet(key, es.join(''));
        const refCount = getRefCount(baseRef);
        if (refCount === 0 && es.indexOf('r') < 0) {
          addToPossiblyDeadSet(baseRef);
        }
        break;
      }
      case 'reachable':
        es[facetIdx] = 'r';
        syscall.vatstoreSet(key, es.join(''));
        break;
      case 'none':
        es[facetIdx] = 'n';
        if (es.indexOf('r') < 0 && es.indexOf('s') < 0) {
          syscall.vatstoreDelete(key);
        } else {
          syscall.vatstoreSet(key, es.join(''));
        }
        break;
      default:
        assert.fail(`invalid set export status ${exportStatus}`);
    }
  }

  function incRefCount(baseRef) {
    const oldRefCount = getRefCount(baseRef);
    setRefCount(baseRef, oldRefCount + 1);
  }

  function decRefCount(baseRef) {
    const oldRefCount = getRefCount(baseRef);
    assert(oldRefCount > 0, `attempt to decref ${baseRef} below 0`);
    setRefCount(baseRef, oldRefCount - 1);
  }

  /**
   * Map from virtual object kind IDs to information about those kinds,
   * including functions for handling the persistent representations of the
   * corresponding kinds of objects.
   */
  const kindInfoTable = new Map();

  /**
   * Register information describing a persistent object kind.
   *
   * @param {string} kindID  The kind of persistent object being handle
   * @param {(string, boolean) => object} reanimator  Reanimator function for the given kind.
   * @param {(string) => boolean} deleter  Deleter function for the given kind.
   * @param {boolean} durable  Flag indicating if instances survive vat termination
   */
  function registerKind(kindID, reanimator, deleter, durable) {
    kindInfoTable.set(`${kindID}`, { reanimator, deleter, durable });
  }

  /**
   * Record the names of the facets of a multi-faceted virtual object.
   *
   * @param {string} kindID  The kind we're talking about
   * @param {string[]|null} facetNames  A sorted array of facet names to be
   *    recorded, or null if the kind is unfaceted
   */
  function rememberFacetNames(kindID, facetNames) {
    const kindInfo = kindInfoTable.get(`${kindID}`);
    assert(kindInfo, `no kind info for ${kindID}`);
    assert.equal(kindInfo.facetNames, undefined);
    kindInfo.facetNames = facetNames;
  }

  /**
   * Inquire if a given persistent object kind is a durable kind or not.
   *
   * @param {string} kindID  The kind of interest
   *
   * @returns {boolean}  true if the indicated kind is durable.
   */
  function isDurableKind(kindID) {
    const { durable } = kindInfoTable.get(`${kindID}`);
    return durable;
  }

  /**
   * Inquire if a given vref is something that can be stored in a durable store
   * or virtual object.
   *
   * @param {string} vref  The vref of interest
   *
   * @returns {boolean}  true if the indicated object reference is durable.
   */
  function isDurable(vref) {
    const { type, id, virtual, allocatedByVat } = parseVatSlot(vref);
    if (relaxDurabilityRules) {
      // we'll pretend an object is durable if running with relaxed rules
      return true;
    } else if (type === 'device') {
      // devices are durable
      return true;
    } else if (type !== 'object') {
      // promises are not durable
      return false;
    } else if (!allocatedByVat) {
      // imports are durable
      return true;
    } else if (virtual) {
      // stores and virtual objects are durable if their kinds are so configured
      return isDurableKind(id);
    } else {
      // otherwise it's not durable
      return false;
    }
  }

  /**
   * Create an in-memory representation of a given object by reanimating it from
   * persistent storage.  Used for deserializing.
   *
   * @param {string} baseRef  The baseRef of the object being reanimated
   *
   * @returns A representative of the object identified by `baseRef`
   */
  function reanimate(baseRef) {
    const { id } = parseVatSlot(baseRef);
    const kindID = `${id}`;
    const kindInfo = kindInfoTable.get(kindID);
    assert(kindInfo, `no kind info for ${kindID}, call defineDurableKind`);
    const { reanimator } = kindInfo;
    if (reanimator) {
      return reanimator(baseRef);
    } else {
      assert.fail(X`unknown kind ${kindID}`);
    }
  }

  /**
   * Delete the persistent representation of a virtual object given its ID
   *
   * @param {string} vobjID  The virtual object ID of the object to be expunged
   */
  function deleteStoredRepresentation(vobjID) {
    const { id } = parseVatSlot(vobjID);
    const kindID = `${id}`;
    const { deleter } = kindInfoTable.get(kindID);
    if (deleter) {
      return deleter(vobjID);
    } else {
      assert.fail(X`unknown kind ${kindID}`);
    }
  }

  /**
   * Map of all Remotables which are reachable by our virtualized data, e.g.
   * `makeWeakStore().set(key, remotable)` or `virtualObject.state.foo =
   * remotable`. The serialization process stores the Remotable's vref to disk,
   * but doesn't actually retain the Remotable. To correctly unserialize that
   * offline data later, we must ensure the Remotable remains alive. This Map
   * keeps a strong reference to the Remotable along with its (virtual) refcount.
   */
  /** @type {Map<object, number>} Remotable->refcount */
  const remotableRefCounts = new Map();

  // Note that since presence refCounts are keyed by vref, `processDeadSet` must
  // query the refCount directly in order to determine if a presence that found
  // its way into the dead set is live or not, whereas it never needs to query
  // the `remotableRefCounts` map because that map holds actual live references
  // as keys and so Remotable references will only find their way into the dead
  // set if they are actually unreferenced (including, notably, their absence
  // from the `remotableRefCounts` map).

  function addReachableVref(vref) {
    const { type, virtual, allocatedByVat, baseRef } = parseVatSlot(vref);
    if (type === 'object') {
      if (allocatedByVat) {
        if (virtual) {
          incRefCount(baseRef);
        } else {
          // exported non-virtual object: Remotable
          const remotable = requiredValForSlot(vref);
          const oldRefCount = remotableRefCounts.get(remotable) || 0;
          remotableRefCounts.set(remotable, oldRefCount + 1);
        }
      } else {
        // We refcount imports, to preserve their vrefs against
        // syscall.dropImport when the Presence itself goes away.
        incRefCount(baseRef);
      }
    } else if (type === 'promise') {
      // need to track promises too, maybe in remotableRefCounts
      const p = requiredValForSlot(vref);
      const oldRefCount = remotableRefCounts.get(p) || 0;
      remotableRefCounts.set(p, oldRefCount + 1);
    }
  }

  function removeReachableVref(vref) {
    let droppedMemoryReference = false;
    const { type, virtual, allocatedByVat, baseRef } = parseVatSlot(vref);
    if (type === 'object') {
      if (allocatedByVat) {
        if (virtual) {
          decRefCount(baseRef);
        } else {
          // exported non-virtual object: Remotable
          const remotable = requiredValForSlot(vref);
          const oldRefCount = remotableRefCounts.get(remotable) || 0;
          assert(oldRefCount > 0, `attempt to decref ${vref} below 0`);
          if (oldRefCount === 1) {
            remotableRefCounts.delete(remotable);
            droppedMemoryReference = true;
          } else {
            remotableRefCounts.set(remotable, oldRefCount - 1);
          }
        }
      } else {
        decRefCount(baseRef);
      }
    } else if (type === 'promise') {
      const p = requiredValForSlot(vref);
      const oldRefCount = remotableRefCounts.get(p) || 0;
      assert(oldRefCount > 0, `attempt to decref ${vref} below 0`);
      if (oldRefCount === 1) {
        remotableRefCounts.delete(p);
        droppedMemoryReference = true; // true for promises too
      } else {
        remotableRefCounts.set(p, oldRefCount - 1);
      }
    }
    return droppedMemoryReference;
  }

  function getReachablePromiseRefCount(p) {
    return remotableRefCounts.get(p) || 0;
  }

  // for testing only
  function getReachableRefCount(vref) {
    const { type, virtual, allocatedByVat, baseRef } = parseVatSlot(vref);
    assert.equal(type, 'object');
    if (allocatedByVat) {
      if (virtual) {
        return getRefCount(baseRef);
      } else {
        const remotable = requiredValForSlot(baseRef);
        return remotableRefCounts.get(remotable);
      }
    } else {
      return getRefCount(baseRef);
    }
  }

  function updateReferenceCounts(beforeSlots, afterSlots) {
    // Note that the slots of a capdata object are not required to be
    // deduplicated nor are they expected to be presented in any particular
    // order, so the comparison of which references appear in the before state
    // to which appear in the after state must look only at the presence or
    // absence of individual elements from the slots arrays and pay no attention
    // to the organization of the slots arrays themselves.
    const vrefStatus = {};
    for (const vref of beforeSlots) {
      vrefStatus[vref] = 'drop';
    }
    for (const vref of afterSlots) {
      if (vrefStatus[vref] === 'drop') {
        vrefStatus[vref] = 'keep';
      } else if (!vrefStatus[vref]) {
        vrefStatus[vref] = 'add';
      }
    }
    for (const [vref, status] of Object.entries(vrefStatus)) {
      switch (status) {
        case 'add':
          addReachableVref(vref);
          break;
        case 'drop':
          removeReachableVref(vref);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Check if a given vref points to a reachable presence.
   *
   * @param {string} vref  The vref of the presence being enquired about
   *
   * @returns {boolean} true if the indicated presence remains reachable.
   */
  function isPresenceReachable(vref) {
    return !!getRefCount(vref);
  }

  /**
   * A map from vrefs (those which are recognizable by (i.e., used as keys in)
   * VOM aware collections) to sets of recognizers (the collections for which
   * they are respectively used as keys).  These vrefs correspond to either
   * imported Presences or virtual objects (Remotables do not participate in
   * this as they are not keyed by vref but by the actual Remotable objects
   * themselves). We add to a vref's recognizer set whenever we use a Presence
   * or virtual object as a key into a weak store instance or an instance of
   * VirtualObjectAwareWeakMap or VirtualObjectAwareWeakSet.  We remove it
   * whenever that key (or the whole collection containing it) is deleted.
   *
   * A recognizer is one of:
   *   Map - the map contained within a VirtualObjectAwareWeakMap to point to its vref-keyed entries.
   *   Set - the set contained within a VirtualObjectAwareWeakSet to point to its vref-keyed entries.
   *   deleter - a function within a WeakStore that can be called to remove an entry from that store.
   *
   * It is critical that each collection have exactly one recognizer that is
   * unique to that collection, because the recognizers themselves will be
   * tracked by their object identities, but the recognizer cannot be the
   * collection itself else it would prevent the collection from being garbage
   * collected.
   *
   * TODO: all the "recognizers" in principle could be, and probably should be,
   * reduced to deleter functions.  However, since the VirtualObjectAware
   * collections are actual JavaScript classes I need to take some care to
   * ensure that I've got the exactly-one-per-collection invariant handled
   * correctly.
   *
   * TODO: concoct a better type def than Set<any>
   */
  /**
   * @typedef { Map<string, *> | Set<string> } Recognizer
   */
  /** @type {Map<string, Set<Recognizer>>} */
  const vrefRecognizers = new Map();

  function addRecognizableValue(value, recognizer, recognizerIsVirtual) {
    const vref = getSlotForVal(value);
    if (vref) {
      const { type, allocatedByVat, virtual } = parseVatSlot(vref);
      if (type === 'object' && (!allocatedByVat || virtual)) {
        if (recognizerIsVirtual) {
          syscall.vatstoreSet(`vom.ir.${vref}|${recognizer}`, '1');
        } else {
          let recognizerSet = vrefRecognizers.get(vref);
          if (!recognizerSet) {
            recognizerSet = new Set();
            vrefRecognizers.set(vref, recognizerSet);
          }
          recognizerSet.add(recognizer);
        }
      }
    }
  }

  function removeRecognizableVref(vref, recognizer, recognizerIsVirtual) {
    const { type, allocatedByVat, virtual } = parseVatSlot(vref);
    if (type === 'object' && (!allocatedByVat || virtual)) {
      if (recognizerIsVirtual) {
        syscall.vatstoreDelete(`vom.ir.${vref}|${recognizer}`);
      } else {
        const recognizerSet = vrefRecognizers.get(vref);
        assert(recognizerSet && recognizerSet.has(recognizer));
        recognizerSet.delete(recognizer);
        if (recognizerSet.size === 0) {
          vrefRecognizers.delete(vref);
          if (!allocatedByVat) {
            addToPossiblyRetiredSet(vref);
          }
        }
      }
    }
  }

  function removeRecognizableValue(value, recognizer, recognizerIsVirtual) {
    const vref = getSlotForVal(value);
    if (vref) {
      removeRecognizableVref(vref, recognizer, recognizerIsVirtual);
    }
  }

  let deleteCollectionEntry;
  function setDeleteCollectionEntry(fn) {
    deleteCollectionEntry = fn;
  }

  /**
   * Remove a given vref from all weak collections in which it was used as a
   * key.
   *
   * @param {string} vref  The vref that shall henceforth no longer be recognized
   *
   * @returns {boolean} true if this possibly creates a GC opportunity
   */
  function ceaseRecognition(vref) {
    let doMoreGC = false;
    const p = parseVatSlot(vref);
    if (p.allocatedByVat && p.virtual && p.facet === undefined) {
      // If `vref` identifies a multi-faceted object that should no longer be
      // "recognized", what that really means that all references to its
      // individual facets should no longer be recognized -- nobody actually
      // references the object itself except internal data structures.  So in
      // this case we need individually to stop recognizing the facets
      // themselves.
      const kindInfo = kindInfoTable.get(`${p.id}`);
      // This function can be called either from `dispatch.retireImports` or
      // from `possibleVirtualObjectDeath`.  In the latter case the vref is
      // actually a baseRef and so needs to be expanded to cease recognition of
      // all the facets.
      if (kindInfo) {
        const { facetNames } = kindInfo;
        if (facetNames) {
          for (let i = 0; i < facetNames.length; i += 1) {
            doMoreGC = ceaseRecognition(`${vref}:${i}`) || doMoreGC;
          }
          return doMoreGC;
        }
      }
    }
    const recognizerSet = vrefRecognizers.get(vref);
    if (recognizerSet) {
      vrefRecognizers.delete(vref);
      for (const recognizer of recognizerSet) {
        if (recognizer instanceof Map) {
          recognizer.delete(vref);
          doMoreGC = true;
        } else if (recognizer instanceof Set) {
          recognizer.delete(vref);
        } else {
          assert.fail(`unknown recognizer type ${typeof recognizer}`);
        }
      }
    }
    const prefix = `vom.ir.${vref}|`;
    let [key] = syscall.vatstoreGetAfter('', prefix);
    while (key) {
      syscall.vatstoreDelete(key);
      const parts = key.split('|');
      doMoreGC = deleteCollectionEntry(parts[1], vref) || doMoreGC;
      [key] = syscall.vatstoreGetAfter(key, prefix);
    }
    return doMoreGC;
  }

  function isVrefRecognizable(vref) {
    if (vrefRecognizers.has(vref)) {
      return true;
    } else {
      const [key] = syscall.vatstoreGetAfter('', `vom.ir.${vref}|`);
      return !!key;
    }
  }

  function finalizeDroppedCollection(descriptor) {
    descriptor.collectionDeleter(descriptor);
  }

  function vrefKey(value) {
    const vobjID = getSlotForVal(value);
    if (vobjID) {
      const { type, virtual, allocatedByVat } = parseVatSlot(vobjID);
      if (type === 'object' && (virtual || !allocatedByVat)) {
        return vobjID;
      }
    }
    return undefined;
  }

  function countCollectionsForWeakKey(vref) {
    const recognizerSet = vrefRecognizers.get(vref);
    let size = recognizerSet ? recognizerSet.size : 0;
    const prefix = `vom.ir.${vref}|`;
    let [key] = syscall.vatstoreGetAfter('', prefix);
    while (key) {
      size += 1;
      [key] = syscall.vatstoreGetAfter(key, prefix);
    }
    return size;
  }

  const testHooks = {
    getReachableRefCount,
    countCollectionsForWeakKey,
  };

  return harden({
    droppedCollectionRegistry,
    isDurable,
    isDurableKind,
    registerKind,
    rememberFacetNames,
    reanimate,
    addReachableVref,
    removeReachableVref,
    updateReferenceCounts,
    getReachablePromiseRefCount,
    addRecognizableValue,
    removeRecognizableVref,
    removeRecognizableValue,
    vrefKey,
    isPresenceReachable,
    isVrefRecognizable,
    setExportStatus,
    possibleVirtualObjectDeath,
    ceaseRecognition,
    setDeleteCollectionEntry,
    testHooks,
  });
}
