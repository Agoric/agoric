import {
  Remotable,
  passStyleOf,
  getInterfaceOf,
  makeMarshal,
} from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';
import { isPromise } from '@endo/promise-kit';
import {
  insistVatType,
  makeVatSlot,
  parseVatSlot,
} from '../lib/parseVatSlots.js';
import { insistCapData } from '../lib/capdata.js';
import { insistMessage } from '../lib/message.js';
import { makeVirtualReferenceManager } from './virtualReferences.js';
import { makeVirtualObjectManager } from './virtualObjectManager.js';
import { makeCollectionManager } from './collectionManager.js';

const DEFAULT_VIRTUAL_OBJECT_CACHE_SIZE = 3; // XXX ridiculously small value to force churn for testing

// 'makeLiveSlots' is a dispatcher which uses javascript Maps to keep track
// of local objects which have been exported. These cannot be persisted
// beyond the runtime of the javascript environment, so this mechanism is not
// going to work for our in-chain hosts.

/**
 * Instantiate the liveslots layer for a new vat and then populate the vat with
 * a new root object and its initial associated object graph, if any.
 *
 * @param {any} syscall Kernel syscall interface that the vat will have access to
 * @param {any} forVatID Vat ID label, for use in debug diagostics
 * @param {number} cacheSize Maximum number of entries in the virtual object state cache
 * @param {boolean} enableDisavow
 * @param {boolean} enableVatstore
 * @param {any} vatPowers
 * @param {any} gcTools { WeakRef, FinalizationRegistry, waitUntilQuiescent,
 *   gcAndFinalize, meterControl }
 * @param {Console} console
 * @param {any} buildVatNamespace
 * @returns {any} { dispatch }
 */
function build(
  syscall,
  forVatID,
  cacheSize,
  enableDisavow,
  enableVatstore,
  vatPowers,
  gcTools,
  console,
  buildVatNamespace,
) {
  const { WeakRef, FinalizationRegistry, meterControl } = gcTools;
  const enableLSDebug = false;
  function lsdebug(...args) {
    if (enableLSDebug) {
      console.log(...args);
    }
  }

  let didStartVat = false;

  const outstandingProxies = new WeakSet();

  /**
   * Translation and tracking tables to map in-vat object/promise references
   * to/from vat-format slot strings.
   *
   * Exports: pass-by-presence objects (Remotables) in the vat are exported as
   * o+NN slots, as are "virtual object" exports. Promises are exported as p+NN
   * slots. We retain a strong reference to all exports via the
   * `exportedRemotables` Set until the kernel tells us all external references
   * have been dropped via dispatch.dropExports, or by some unilateral
   * revoke-object operation executed by our user-level code.
   *
   * Imports: o-NN slots are represented as a Presence. p-NN slots are
   * represented as an imported Promise, with the resolver held in an additional
   * table (importedPromisesByPromiseID) to handle a future incoming resolution
   * message. We retain a weak reference to the Presence, and use a
   * FinalizationRegistry to learn when the vat has dropped it, so we can notify
   * the kernel. We retain strong references to unresolved Promises. When an
   * import is added, the finalizer is added to `vreffedObjectRegistry`.
   *
   * SlotToVal is a Map whose keys are slots (strings) and the values are
   * WeakRefs. If the entry is present but wr.deref()===undefined (the weakref
   * is dead), treat that as if the entry was not present. The same slotToVal
   * table is used for both imports and returning exports. The subset of those
   * which need to be held strongly (exported objects and promises, imported
   * promises) are kept alive by `exportedRemotables`.
   *
   * ValToSlot is a WeakMap whose keys are Remotable/Presence/Promise objects,
   * and the keys are (string) slot identifiers. This is used for both exports
   * and returned imports.
   *
   * We use two weak maps plus the strong `exportedRemotables` set, because it
   * seems simpler than using four separate maps (import-vs-export times strong-vs-weak).
   */

  const valToSlot = new WeakMap(); // object -> vref
  const slotToVal = new Map(); // baseRef -> WeakRef(object)
  const exportedRemotables = new Set(); // objects
  const kernelRecognizableRemotables = new Set(); // vrefs
  const pendingPromises = new Set(); // Promises
  const importedDevices = new Set(); // device nodes
  const possiblyDeadSet = new Set(); // baseRefs that need to be checked for being dead
  const possiblyRetiredSet = new Set(); // vrefs that might need to be rechecked for being retired

  function retainExportedVref(vref) {
    // if the vref corresponds to a Remotable, keep a strong reference to it
    // until the kernel tells us to release it
    const { type, allocatedByVat, virtual } = parseVatSlot(vref);
    if (type === 'object' && allocatedByVat) {
      if (virtual) {
        // eslint-disable-next-line no-use-before-define
        vrm.setExportStatus(vref, 'reachable');
      } else {
        // eslint-disable-next-line no-use-before-define
        const remotable = requiredValForSlot(vref);
        exportedRemotables.add(remotable);
        kernelRecognizableRemotables.add(vref);
      }
    }
  }

  /*
    Imports are in one of 5 states: UNKNOWN, REACHABLE, UNREACHABLE,
    COLLECTED, FINALIZED. Note that there's no actual state machine with those
    values, and we can't observe all of the transitions from JavaScript, but
    we can describe what operations could cause a transition, and what our
    observations allow us to deduce about the state:

    * UKNOWN moves to REACHABLE when a crank introduces a new import
    * userspace holds a reference only in REACHABLE
    * REACHABLE moves to UNREACHABLE only during a userspace crank
    * UNREACHABLE moves to COLLECTED when GC runs, which queues the finalizer
    * COLLECTED moves to FINALIZED when a new turn runs the finalizer
    * liveslots moves from FINALIZED to UNKNOWN by syscalling dropImports

    convertSlotToVal either imports a vref for the first time, or
    re-introduces a previously-seen vref. It transitions from:

    * UNKNOWN to REACHABLE by creating a new Presence
    * UNREACHABLE to REACHABLE by re-using the old Presence that userspace
      forgot about
    * COLLECTED/FINALIZED to REACHABLE by creating a new Presence

    Our tracking tables hold data that depends on the current state:

    * slotToVal holds a WeakRef in [REACHABLE, UNREACHABLE, COLLECTED]
    * that WeakRef .deref()s into something in [REACHABLE, UNREACHABLE]
    * deadSet holds the vref only in FINALIZED
    * re-introduction must ensure the vref is not in the deadSet

    Each state thus has a set of perhaps-measurable properties:

    * UNKNOWN: slotToVal[baseRef] is missing, baseRef not in deadSet
    * REACHABLE: slotToVal has live weakref, userspace can reach
    * UNREACHABLE: slotToVal has live weakref, userspace cannot reach
    * COLLECTED: slotToVal[baseRef] has dead weakref
    * FINALIZED: slotToVal[baseRef] is missing, baseRef is in deadSet

    Our finalizer callback is queued by the engine's transition from
    UNREACHABLE to COLLECTED, but the baseRef might be re-introduced before the
    callback has a chance to run. There might even be multiple copies of the
    finalizer callback queued. So the callback must deduce the current state
    and only perform cleanup (i.e. delete the slotToVal entry and add the
    baseRef to the deadSet) in the COLLECTED state.

  */

  function finalizeDroppedObject(baseRef) {
    // TODO: Ideally this function should assert that it is not metered.  This
    // appears to be fine in practice, but it breaks a number of unit tests in
    // ways that are not obvious how to fix.
    // meterControl.assertNotMetered();
    const wr = slotToVal.get(baseRef);
    // The finalizer for a given Presence might run in any state:
    // * COLLECTED: most common. Action: move to FINALIZED
    // * REACHABLE/UNREACHABLE: after re-introduction. Action: ignore
    // * FINALIZED: after re-introduction and subsequent finalizer invocation
    //   (second finalizer executed for the same baseRef). Action: be idempotent
    // * UNKNOWN: after re-introduction, multiple finalizer invocation,
    //   and post-crank cleanup does dropImports and deletes baseRef from
    //   deadSet. Action: ignore

    if (wr && !wr.deref()) {
      // we're in the COLLECTED state, or FINALIZED after a re-introduction
      // eslint-disable-next-line no-use-before-define
      addToPossiblyDeadSet(baseRef);
      slotToVal.delete(baseRef);
    }
  }
  const vreffedObjectRegistry = new FinalizationRegistry(finalizeDroppedObject);

  async function scanForDeadObjects() {
    // `possiblyDeadSet` accumulates vrefs which have lost a supporting
    // pillar (in-memory, export, or virtualized data refcount) since the
    // last call to scanForDeadObjects. The vref might still be supported
    // by a remaining pillar, or the pillar which was dropped might be back
    // (e.g., given a new in-memory manifestation).

    const [importsToDrop, importsToRetire, exportsToRetire] = [[], [], []];
    let doMore;
    do {
      doMore = false;

      // Yes, we know this is an await inside a loop.  Too bad.  (Also, it's a
      // `do {} while` loop, which means there's no conditional bypass of the
      // await.)
      // eslint-disable-next-line no-await-in-loop
      await gcTools.gcAndFinalize();

      // `deadSet` is the subset of those vrefs which lack an in-memory
      // manifestation *right now* (i.e. the non-resurrected ones), for which
      // we must check the remaining pillars.
      const deadSet = new Set();
      for (const baseRef of possiblyDeadSet) {
        // eslint-disable-next-line no-use-before-define
        if (!slotToVal.has(baseRef)) {
          deadSet.add(baseRef);
        }
      }
      possiblyDeadSet.clear();

      for (const vref of possiblyRetiredSet) {
        // eslint-disable-next-line no-use-before-define
        if (!getValForSlot(vref) && !deadSet.has(vref)) {
          // Don't retire things that haven't yet made the transition to dead,
          // i.e., always drop before retiring
          // eslint-disable-next-line no-use-before-define
          if (!vrm.isVrefRecognizable(vref)) {
            importsToRetire.push(vref);
          }
        }
      }
      possiblyRetiredSet.clear();

      const deadBaseRefs = Array.from(deadSet);
      deadBaseRefs.sort();
      for (const baseRef of deadBaseRefs) {
        const { virtual, allocatedByVat, type } = parseVatSlot(baseRef);
        assert(type === 'object', `unprepared to track ${type}`);
        if (virtual) {
          // Representative: send nothing, but perform refcount checking
          // eslint-disable-next-line no-use-before-define
          const [gcAgain, retirees] = vrm.possibleVirtualObjectDeath(baseRef);
          if (retirees) {
            retirees.map(retiree => exportsToRetire.push(retiree));
          }
          doMore = doMore || gcAgain;
        } else if (allocatedByVat) {
          // Remotable: send retireExport
          // for remotables, vref === baseRef
          if (kernelRecognizableRemotables.has(baseRef)) {
            kernelRecognizableRemotables.delete(baseRef);
            exportsToRetire.push(baseRef);
          }
        } else {
          // Presence: send dropImport unless reachable by VOM
          // eslint-disable-next-line no-lonely-if, no-use-before-define
          if (!vrm.isPresenceReachable(baseRef)) {
            importsToDrop.push(baseRef);
            // eslint-disable-next-line no-use-before-define
            if (!vrm.isVrefRecognizable(baseRef)) {
              // for presences, baseRef === vref
              importsToRetire.push(baseRef);
            }
          }
        }
      }
    } while (possiblyDeadSet.size > 0 || possiblyRetiredSet.size > 0 || doMore);

    if (importsToDrop.length) {
      importsToDrop.sort();
      syscall.dropImports(importsToDrop);
    }
    if (importsToRetire.length) {
      importsToRetire.sort();
      syscall.retireImports(importsToRetire);
    }
    if (exportsToRetire.length) {
      exportsToRetire.sort();
      syscall.retireExports(exportsToRetire);
    }
  }

  /** Remember disavowed Presences which will kill the vat if you try to talk to them */
  const disavowedPresences = new WeakSet();
  const disavowalError = harden(Error(`this Presence has been disavowed`));

  const importedPromisesByPromiseID = new Map(); // vpid -> { resolve, reject }

  function makeImportedPresence(slot, iface = `Alleged: presence ${slot}`) {
    // Called by convertSlotToVal for type=object (an `o-NN` reference). We
    // build a Presence for application-level code to receive. This Presence
    // is associated with 'slot' so that all handled messages get sent to
    // that slot: pres~.foo() causes a syscall.send(target=slot, msg=foo).

    lsdebug(`makeImportedPresence(${slot})`);
    const fulfilledHandler = {
      applyMethod(o, prop, args, returnedP) {
        // Support: o~.[prop](...args) remote method invocation
        lsdebug(`makeImportedPresence handler.applyMethod (${slot})`);
        if (disavowedPresences.has(o)) {
          // eslint-disable-next-line no-use-before-define
          exitVatWithFailure(disavowalError);
          throw disavowalError;
        }
        // eslint-disable-next-line no-use-before-define
        return queueMessage(slot, prop, args, returnedP);
      },
      // FIXME: applyFunction(o, args, returnedP) { },
      get(o, prop) {
        lsdebug(`makeImportedPresence handler.get (${slot})`);
        if (disavowedPresences.has(o)) {
          // eslint-disable-next-line no-use-before-define
          exitVatWithFailure(disavowalError);
          throw disavowalError;
        }
        // FIXME: Actually use remote property lookup
        return o[prop];
      },
    };

    let remotePresence;
    const p = new HandledPromise((_res, _rej, resolveWithPresence) => {
      // Use Remotable rather than Far to make a remote from a presence
      remotePresence = Remotable(
        iface,
        undefined,
        resolveWithPresence(fulfilledHandler),
      );
      // remote === presence, actually

      // todo: mfig says resolveWithPresence
      // gives us a Presence, Remotable gives us a Remote. I think that
      // implies we have a lot of renaming to do, 'makeRemote' instead of
      // 'makeImportedPresence', etc. I'd like to defer that for a later
      // cleanup/renaming pass.
    }); // no unfulfilledHandler

    // The call to resolveWithPresence performs the forwarding logic
    // immediately, so by the time we reach here, E(presence).foo() will use
    // our fulfilledHandler, and nobody can observe the fact that we failed
    // to provide an unfulfilledHandler.

    // We throw 'p' away, but it is retained by the internal tables of
    // HandledPromise, and will be returned to anyone who calls
    // `HandledPromise.resolve(presence)`. So we must harden it now, for
    // safety, to prevent it from being used as a communication channel
    // between isolated objects that share a reference to the Presence.
    harden(p);

    // Up at the application level, presence~.foo(args) starts by doing
    // HandledPromise.resolve(presence), which retrieves it, and then does
    // p.eventualSend('foo', [args]), which uses the fulfilledHandler.

    // We harden the presence for the same safety reasons.
    return harden(remotePresence);
  }

  function makePipelinablePromise(vpid) {
    // Called by convertSlotToVal(type=promise) for incoming promises (a
    // `p-NN` reference), and by queueMessage() for the result of an outbound
    // message (a `p+NN` reference). We build a Promise for application-level
    // code, to which messages can be pipelined, and we prepare for the
    // kernel to tell us that it has been resolved in various ways.
    insistVatType('promise', vpid);
    lsdebug(`makePipelinablePromise(${vpid})`);

    // The Promise will we associated with a handler that converts p~.foo() into
    // a syscall.send() that targets the vpid. When the Promise is resolved
    // (during receipt of a dispatch.notify), this Promise's handler will be
    // replaced by the handler of the resolution, which might be a Presence or a
    // local object.

    // for safety as we shake out bugs in HandledPromise, we guard against
    // this handler being used after it was supposed to be resolved
    let handlerActive = true;
    const unfulfilledHandler = {
      applyMethod(_p, prop, args, returnedP) {
        // Support: p~.[prop](...args) remote method invocation
        lsdebug(`makePipelinablePromise handler.applyMethod (${vpid})`);
        if (!handlerActive) {
          console.error(`mIPromise handler called after resolution`);
          assert.fail(X`mIPromise handler called after resolution`);
        }
        // eslint-disable-next-line no-use-before-define
        return queueMessage(vpid, prop, args, returnedP);
      },
      get(p, prop) {
        // Support: p~.[prop]
        lsdebug(`makePipelinablePromise handler.get (${vpid})`);
        if (!handlerActive) {
          console.error(`mIPromise handler called after resolution`);
          assert.fail(X`mIPromise handler called after resolution`);
        }
        // FIXME: Actually pipeline.
        return p.then(o => o[prop]);
      },
    };

    let resolve;
    let reject;
    const p = new HandledPromise((res, rej, _resPres) => {
      resolve = res;
      reject = rej;
    }, unfulfilledHandler);

    // Prepare for the kernel to tell us about resolution. Both ensure the
    // old handler should never be called again. TODO: once we're confident
    // about how we interact with HandledPromise, just use harden({ resolve,
    // reject }).
    const pRec = harden({
      resolve(resolution) {
        handlerActive = false;
        resolve(resolution);
      },

      reject(rejection) {
        handlerActive = false;
        reject(rejection);
      },
    });
    importedPromisesByPromiseID.set(vpid, pRec);

    return harden(p);
  }

  function makeDeviceNode(id, iface = `Alleged: device ${id}`) {
    return Remotable(iface);
  }

  let idCounters;
  let idCountersAreDirty = false;

  function initializeIDCounters() {
    if (!idCounters) {
      const raw = syscall.vatstoreGet('idCounters');
      if (raw) {
        idCounters = JSON.parse(raw);
      } else {
        idCounters = {};
      }
    }
  }

  function allocateNextID(name, initialValue = 1) {
    if (!idCounters) {
      // Normally `initializeIDCounters` would be called from startVat, but some
      // tests bypass that so this is a backstop.  Note that the invocation from
      // startVat is there to make vatStore access patterns a bit more
      // consistent from one vat to another, principally as a confusion
      // reduction measure in service of debugging; it is not a correctness
      // issue.
      initializeIDCounters();
    }
    if (!idCounters[name]) {
      idCounters[name] = initialValue;
    }
    const result = idCounters[name];
    idCounters[name] += 1;
    idCountersAreDirty = true;
    return result;
  }

  function flushIDCounters() {
    if (idCountersAreDirty) {
      syscall.vatstoreSet('idCounters', JSON.stringify(idCounters));
      idCountersAreDirty = false;
    }
  }

  // TODO: fix awkward non-orthogonality: allocateExportID() returns a number,
  // allocatePromiseID() returns a slot, exportPromise() uses the slot from
  // allocatePromiseID(), exportPassByPresence() generates a slot itself using
  // the number from allocateExportID().  Both allocateX fns should return a
  // number or return a slot; both exportY fns should either create a slot or
  // use a slot from the corresponding allocateX

  function allocateExportID() {
    // We start exportIDs with 1 because 'o+0' is always automatically
    // pre-assigned to the root object.
    return allocateNextID('exportID', 1);
  }

  function allocateCollectionID() {
    return allocateNextID('collectionID', 1);
  }

  function allocatePromiseID() {
    // The starting point for numbering promiseIDs is pretty arbitrary.  We start
    // from 5 as a very minor aid to debugging: It helps, when puzzling over
    // trace logs and the like, for the numbers in the various species of IDs to
    // be a little out of sync and thus a little less similar to each other when
    // jumbled together.
    const promiseID = allocateNextID('promiseID', 5);
    return makeVatSlot('promise', true, promiseID);
  }

  const knownResolutions = new WeakMap();

  function exportPromise(p) {
    const pid = allocatePromiseID();
    lsdebug(`Promise allocation ${forVatID}:${pid} in exportPromise`);
    if (!knownResolutions.has(p)) {
      // eslint-disable-next-line no-use-before-define
      p.then(thenResolve(p, pid), thenReject(p, pid));
    }
    return pid;
  }

  function exportPassByPresence() {
    const exportID = allocateExportID();
    return makeVatSlot('object', true, exportID);
  }

  // eslint-disable-next-line no-use-before-define
  const m = makeMarshal(convertValToSlot, convertSlotToVal, {
    marshalName: `liveSlots:${forVatID}`,
    // TODO Temporary hack.
    // See https://github.com/Agoric/agoric-sdk/issues/2780
    errorIdNum: 70000,
    marshalSaveError: err =>
      // By sending this to `console.info`, under cosmic-swingset this is
      // controlled by the `console` option given to makeLiveSlots.
      console.info('Logging sent error stack', err),
  });
  const unmeteredUnserialize = meterControl.unmetered(m.unserialize);
  // eslint-disable-next-line no-use-before-define
  const unmeteredConvertSlotToVal = meterControl.unmetered(convertSlotToVal);

  function getSlotForVal(val) {
    return valToSlot.get(val);
  }

  function getValForSlot(baseRef) {
    meterControl.assertNotMetered();
    const wr = slotToVal.get(baseRef);
    return wr && wr.deref();
  }

  function requiredValForSlot(baseRef) {
    const wr = slotToVal.get(baseRef);
    const result = wr && wr.deref();
    assert(result, X`no value for ${baseRef}`);
    return result;
  }

  function addToPossiblyDeadSet(baseRef) {
    possiblyDeadSet.add(baseRef);
  }

  function addToPossiblyRetiredSet(vref) {
    possiblyRetiredSet.add(vref);
  }

  const vrm = makeVirtualReferenceManager(
    syscall,
    getSlotForVal,
    requiredValForSlot,
    FinalizationRegistry,
    addToPossiblyDeadSet,
    addToPossiblyRetiredSet,
  );

  const vom = makeVirtualObjectManager(
    syscall,
    vrm,
    allocateExportID,
    getSlotForVal,
    // eslint-disable-next-line no-use-before-define
    registerValue,
    m.serialize,
    unmeteredUnserialize,
    cacheSize,
  );

  const collectionManager = makeCollectionManager(
    syscall,
    vrm,
    allocateExportID,
    allocateCollectionID,
    // eslint-disable-next-line no-use-before-define
    convertValToSlot,
    unmeteredConvertSlotToVal,
    // eslint-disable-next-line no-use-before-define
    registerValue,
    m.serialize,
    unmeteredUnserialize,
  );

  function convertValToSlot(val) {
    // lsdebug(`serializeToSlot`, val, Object.isFrozen(val));
    // This is either a Presence (in presenceToImportID), a
    // previously-serialized local pass-by-presence object or
    // previously-serialized local Promise (in valToSlot), a new local
    // pass-by-presence object, or a new local Promise.

    // If we've already assigned it an importID or exportID, it might be in
    // slots/slotMap for this particular act of serialization. If it's new,
    // it certainly will not be in slotMap. If we've already serialized it in
    // this particular act, it will definitely be in slotMap.

    if (!valToSlot.has(val)) {
      let slot;
      // must be a new export
      // lsdebug('must be a new export', JSON.stringify(val));
      if (isPromise(val)) {
        slot = exportPromise(val);
        pendingPromises.add(val); // keep it alive until resolved
      } else {
        if (disavowedPresences.has(val)) {
          // eslint-disable-next-line no-use-before-define
          exitVatWithFailure(disavowalError);
          throw disavowalError; // cannot reference a disavowed object
        }
        assert.equal(passStyleOf(val), 'remotable');
        slot = exportPassByPresence();
      }
      const { type, baseRef } = parseVatSlot(slot); // also used as assertion
      valToSlot.set(val, slot);
      slotToVal.set(baseRef, new WeakRef(val));
      if (type === 'object') {
        // Set.delete() metering seems unaffected by presence/absence, but it
        // doesn't matter anyway because deadSet.add only happens when
        // finializers run, and we wrote xsnap.c to ensure they only run
        // deterministically (during gcAndFinalize)
        vreffedObjectRegistry.register(val, baseRef, val);
      }
    }
    return valToSlot.get(val);
  }

  let importedPromises = null;
  function beginCollectingPromiseImports() {
    importedPromises = new Set();
  }
  function finishCollectingPromiseImports() {
    const result = importedPromises;
    importedPromises = null;
    return result;
  }

  function registerValue(baseRef, val, valIsCohort) {
    const { type, facet } = parseVatSlot(baseRef);
    assert(
      !facet,
      `registerValue(${baseRef} should not receive individual facets`,
    );
    slotToVal.set(baseRef, new WeakRef(val));
    if (valIsCohort) {
      for (let i = 0; i < val.length; i += 1) {
        valToSlot.set(val[i], `${baseRef}:${i}`);
      }
    } else {
      valToSlot.set(val, baseRef);
    }
    // we don't dropImports on promises, to avoid interaction with retire
    if (type === 'object') {
      vreffedObjectRegistry.register(val, baseRef, val);
    }
  }

  // The meter usage of convertSlotToVal is strongly affected by GC, because
  // it only creates a new Presence if one does not already exist. Userspace
  // moves from REACHABLE to UNREACHABLE, but the JS engine then moves to
  // COLLECTED (and maybe FINALIZED) on its own, and we must not allow the
  // latter changes to affect metering. So every call to convertSlotToVal (or
  // m.unserialize) must be wrapped by unmetered().
  function convertSlotToVal(slot, iface = undefined) {
    meterControl.assertNotMetered();
    const { type, allocatedByVat, virtual, facet, baseRef } =
      parseVatSlot(slot);
    let val = getValForSlot(baseRef);
    if (val) {
      if (virtual) {
        // If it's a virtual object for which we already have a representative,
        // we are going to use that existing representative to preserve ===
        // equality and WeakMap key usability, BUT we are going to ask the user
        // code to make a new representative anyway (which we'll discard) so
        // that as far as the user code is concerned we are making a new
        // representative with each act of deserialization.  This way they can't
        // detect reanimation by playing games inside their kind definition to
        // try to observe when new representatives are created (e.g., by
        // counting calls or squirreling things away in hidden WeakMaps).
        vrm.reanimate(baseRef, true); // N.b.: throwing away the result
        if (facet !== undefined) {
          return val[facet];
        }
      }
      return val;
    }
    let result;
    if (virtual) {
      assert.equal(type, 'object');
      val = vrm.reanimate(baseRef, false);
      if (facet !== undefined) {
        result = val[facet];
      }
    } else {
      assert(!allocatedByVat, X`I don't remember allocating ${slot}`);
      if (type === 'object') {
        // this is a new import value
        val = makeImportedPresence(slot, iface);
      } else if (type === 'promise') {
        assert(
          !parseVatSlot(slot).allocatedByVat,
          X`kernel is being presumptuous: vat got unrecognized vatSlot ${slot}`,
        );
        val = makePipelinablePromise(slot);
        // ideally we'd wait until .then is called on p before subscribing,
        // but the current Promise API doesn't give us a way to discover
        // this, so we must subscribe right away. If we were using Vows or
        // some other then-able, we could just hook then() to notify us.
        if (importedPromises) {
          importedPromises.add(slot);
        } else {
          syscall.subscribe(slot);
        }
        // keep the imported promise alive until it resolves
        pendingPromises.add(val);
      } else if (type === 'device') {
        val = makeDeviceNode(slot, iface);
        importedDevices.add(val);
      } else {
        assert.fail(X`unrecognized slot type '${type}'`);
      }
    }
    registerValue(baseRef, val, facet !== undefined);
    if (!result) {
      result = val;
    }
    return result;
  }

  function resolutionCollector() {
    const resolutions = [];
    const doneResolutions = new Set();

    function scanSlots(slots) {
      for (const slot of slots) {
        const { type } = parseVatSlot(slot);
        if (type === 'promise') {
          // this can run metered because it's supposed to always be present
          const p = requiredValForSlot(slot);
          const priorResolution = knownResolutions.get(p);
          if (priorResolution && !doneResolutions.has(slot)) {
            const [priorRejected, priorRes] = priorResolution;
            // eslint-disable-next-line no-use-before-define
            collect(slot, priorRejected, priorRes);
          }
        }
      }
    }

    function collect(promiseID, rejected, value) {
      doneResolutions.add(promiseID);
      meterControl.assertIsMetered(); // else userspace getters could escape
      let valueSer;
      try {
        valueSer = m.serialize(value);
      } catch (e) {
        // Serialization failure.
        valueSer = m.serialize(e);
        rejected = true;
      }
      valueSer.slots.map(retainExportedVref);
      resolutions.push([promiseID, rejected, valueSer]);
      scanSlots(valueSer.slots);
    }

    function forPromise(promiseID, rejected, value) {
      collect(promiseID, rejected, value);
      return resolutions;
    }

    function forSlots(slots) {
      scanSlots(slots);
      return resolutions;
    }

    return {
      forPromise,
      forSlots,
    };
  }

  function queueMessage(targetSlot, prop, args, returnedP) {
    if (typeof prop === 'symbol') {
      if (prop === Symbol.asyncIterator) {
        // special-case this Symbol for now, will be replaced in #2481
        prop = 'Symbol.asyncIterator';
      } else {
        throw Error(`arbitrary Symbols cannot be used as method names`);
      }
    }

    meterControl.assertIsMetered(); // else userspace getters could escape
    const serArgs = m.serialize(harden(args));
    serArgs.slots.map(retainExportedVref);
    const resultVPID = allocatePromiseID();
    lsdebug(`Promise allocation ${forVatID}:${resultVPID} in queueMessage`);
    // create a Promise which callers follow for the result, give it a
    // handler so we can pipeline messages to it, and prepare for the kernel
    // to notify us of its resolution
    const p = makePipelinablePromise(resultVPID);

    lsdebug(
      `ls.qm send(${JSON.stringify(targetSlot)}, ${String(
        prop,
      )}) -> ${resultVPID}`,
    );
    syscall.send(targetSlot, prop, serArgs, resultVPID);
    const resolutions = resolutionCollector().forSlots(serArgs.slots);
    if (resolutions.length > 0) {
      syscall.resolve(resolutions);
    }

    // ideally we'd wait until .then is called on p before subscribing, but
    // the current Promise API doesn't give us a way to discover this, so we
    // must subscribe right away. If we were using Vows or some other
    // then-able, we could just hook then() to notify us.
    syscall.subscribe(resultVPID);

    // We return 'p' to the handler, and the eventual resolution of 'p' will
    // be used to resolve the caller's Promise, but the caller never sees 'p'
    // itself. The caller got back their Promise before the handler ever got
    // invoked, and thus before queueMessage was called.. If that caller
    // passes the Promise they received as argument or return value, we want
    // it to serialize as resultVPID. And if someone passes resultVPID to
    // them, we want the user-level code to get back that Promise, not 'p'.
    // As a result, we do not retain or track 'p'. Only 'returnedP' is
    // registered and retained by pendingPromises.

    valToSlot.set(returnedP, resultVPID);
    slotToVal.set(resultVPID, new WeakRef(returnedP));
    pendingPromises.add(returnedP);
    // we do not use vreffedObjectRegistry for promises, even result promises

    return p;
  }

  function forbidPromises(serArgs) {
    for (const slot of serArgs.slots) {
      assert(
        parseVatSlot(slot).type !== 'promise',
        X`D() arguments cannot include a Promise`,
      );
    }
  }

  function DeviceHandler(slot) {
    return {
      get(target, prop) {
        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
          return undefined;
        }
        return (...args) => {
          meterControl.assertIsMetered(); // userspace getters shouldn't escape
          const serArgs = m.serialize(harden(args));
          serArgs.slots.map(retainExportedVref);
          forbidPromises(serArgs);
          const ret = syscall.callNow(slot, prop, serArgs);
          insistCapData(ret);
          // but the unserialize must be unmetered, to prevent divergence
          const retval = unmeteredUnserialize(ret);
          return retval;
        };
      },
    };
  }

  function D(x) {
    // results = D(devicenode).name(args)
    if (outstandingProxies.has(x)) {
      throw new Error('D(D(x)) is invalid');
    }
    const slot = valToSlot.get(x);
    if (!slot || parseVatSlot(slot).type !== 'device') {
      throw new Error('D() must be given a device node');
    }
    const handler = DeviceHandler(slot);
    const pr = harden(new Proxy({}, handler));
    outstandingProxies.add(pr);
    return pr;
  }

  function deliver(target, method, argsdata, result) {
    assert(didStartVat);
    insistCapData(argsdata);
    lsdebug(
      `ls[${forVatID}].dispatch.deliver ${target}.${method} -> ${result}`,
    );
    const t = convertSlotToVal(target);
    assert(t, X`no target ${target}`);
    // TODO: if we acquire new decision-making authority over a promise that
    // we already knew about ('result' is already in slotToVal), we should no
    // longer accept dispatch.notify from the kernel. We currently use
    // importedPromisesByPromiseID to track a combination of "we care about
    // when this promise resolves" and "we are listening for the kernel to
    // resolve it". We should split that into two tables or something. And we
    // should error-check cases that the kernel shouldn't do, like getting
    // the same vpid as a result= twice, or getting a result= for an exported
    // promise (for which we were already the decider).

    if (method === 'Symbol.asyncIterator') {
      method = Symbol.asyncIterator;
    }

    meterControl.assertNotMetered();
    const args = m.unserialize(argsdata);

    // If the method is missing, or is not a Function, or the method throws a
    // synchronous exception, we notify the caller (by rejecting the result
    // promise, if any). If the method returns an eventually-rejected
    // Promise, we notify them when it resolves.

    // If the method returns a synchronous value, we notify the caller right
    // away. If it returns an eventually-fulfilled Promise, we notify the
    // caller when it resolves.

    // Both situations are the business of this vat and the calling vat, not
    // the kernel. deliver() does not report such exceptions to the kernel.

    // We have a presence, so forward to it.
    let res;
    if (args) {
      // It has arguments, must be a method application.
      res = HandledPromise.applyMethod(t, method, args);
    } else {
      // Just a getter.
      // TODO: untested, but in principle sound.
      res = HandledPromise.get(t, method);
    }
    let notifySuccess = () => undefined;
    let notifyFailure = () => undefined;
    if (result) {
      insistVatType('promise', result);
      // eslint-disable-next-line no-use-before-define
      notifySuccess = thenResolve(res, result);
      // eslint-disable-next-line no-use-before-define
      notifyFailure = thenReject(res, result);
    }
    res.then(notifySuccess, notifyFailure);
  }

  function retirePromiseID(promiseID) {
    lsdebug(`Retiring ${forVatID}:${promiseID}`);
    importedPromisesByPromiseID.delete(promiseID);
    const p = getValForSlot(promiseID);
    if (p) {
      valToSlot.delete(p);
      pendingPromises.delete(p);
    }
    slotToVal.delete(promiseID);
  }

  function thenHandler(p, promiseID, rejected) {
    // this runs metered
    insistVatType('promise', promiseID);
    return value => {
      knownResolutions.set(p, harden([rejected, value]));
      harden(value);
      lsdebug(`ls.thenHandler fired`, value);
      const resolutions = resolutionCollector().forPromise(
        promiseID,
        rejected,
        value,
      );

      syscall.resolve(resolutions);

      const pRec = importedPromisesByPromiseID.get(promiseID);
      if (pRec) {
        if (rejected) {
          pRec.reject(value);
        } else {
          pRec.resolve(value);
        }
      }
      meterControl.runWithoutMetering(() => retirePromiseID(promiseID));
    };
  }

  function thenResolve(p, promiseID) {
    return thenHandler(p, promiseID, false);
  }

  function thenReject(p, promiseID) {
    return thenHandler(p, promiseID, true);
  }

  function notifyOnePromise(promiseID, rejected, data) {
    insistCapData(data);
    lsdebug(
      `ls.dispatch.notify(${promiseID}, ${rejected}, ${data.body}, [${data.slots}])`,
    );
    insistVatType('promise', promiseID);
    // TODO: insist that we do not have decider authority for promiseID
    assert(
      importedPromisesByPromiseID.has(promiseID),
      X`unknown promiseID '${promiseID}'`,
    );
    const pRec = importedPromisesByPromiseID.get(promiseID);
    meterControl.assertNotMetered();
    const val = m.unserialize(data);
    if (rejected) {
      pRec.reject(val);
    } else {
      pRec.resolve(val);
    }
  }

  function notify(resolutions) {
    assert(didStartVat);
    beginCollectingPromiseImports();
    for (const resolution of resolutions) {
      const [vpid, rejected, data] = resolution;
      notifyOnePromise(vpid, rejected, data);
    }
    for (const resolution of resolutions) {
      const [vpid] = resolution;
      retirePromiseID(vpid);
    }
    const imports = finishCollectingPromiseImports();
    meterControl.assertNotMetered();
    for (const slot of imports) {
      if (slotToVal.get(slot)) {
        // we'll only subscribe to new promises, which is within consensus
        syscall.subscribe(slot);
      }
    }
  }

  function dropExports(vrefs) {
    assert(Array.isArray(vrefs));
    vrefs.map(vref => insistVatType('object', vref));
    vrefs.map(vref => assert(parseVatSlot(vref).allocatedByVat));
    // console.log(`-- liveslots acting upon dropExports ${vrefs.join(',')}`);
    meterControl.assertNotMetered();
    for (const vref of vrefs) {
      const o = getValForSlot(vref);
      if (o) {
        exportedRemotables.delete(o);
      }
      const { virtual } = parseVatSlot(vref);
      if (virtual) {
        vrm.setExportStatus(vref, 'recognizable');
      }
    }
  }

  function retireOneExport(vref) {
    insistVatType('object', vref);
    const { virtual, allocatedByVat, type } = parseVatSlot(vref);
    assert(allocatedByVat);
    assert.equal(type, 'object');
    // console.log(`-- liveslots acting on retireExports ${vref}`);
    if (virtual) {
      vrm.setExportStatus(vref, 'none');
    } else {
      // Remotable
      kernelRecognizableRemotables.delete(vref);
    }
  }

  function retireExports(vrefs) {
    assert(Array.isArray(vrefs));
    vrefs.forEach(retireOneExport);
  }

  function retireImports(vrefs) {
    assert(Array.isArray(vrefs));
    vrefs.map(vref => insistVatType('object', vref));
    vrefs.map(vref => assert(!parseVatSlot(vref).allocatedByVat));
    vrefs.forEach(vrm.ceaseRecognition);
  }

  // TODO: when we add notifyForward, guard against cycles

  function exitVat(completion) {
    meterControl.assertIsMetered(); // else userspace getters could escape
    const args = m.serialize(harden(completion));
    args.slots.map(retainExportedVref);
    syscall.exit(false, args);
  }

  /** @type {ExitVatWithFailure} */
  function exitVatWithFailure(reason) {
    meterControl.assertIsMetered(); // else userspace getters could escape
    const args = m.serialize(harden(reason));
    args.slots.map(retainExportedVref);
    syscall.exit(true, args);
  }

  function disavow(presence) {
    if (!valToSlot.has(presence)) {
      assert.fail(X`attempt to disavow unknown ${presence}`);
    }
    const slot = valToSlot.get(presence);
    const { type, allocatedByVat } = parseVatSlot(slot);
    assert.equal(type, 'object', X`attempt to disavow non-object ${presence}`);
    // disavow() is only for imports: we'll use a different API to revoke
    // exports, one which accepts an Error object
    assert.equal(allocatedByVat, false, X`attempt to disavow an export`);
    valToSlot.delete(presence);
    slotToVal.delete(slot);
    disavowedPresences.add(presence);

    syscall.dropImports([slot]);
  }

  const vatGlobals = harden({
    VatData: {
      defineKind: vom.defineKind,
      defineDurableKind: vom.defineDurableKind,
      makeKindHandle: vom.makeKindHandle,
      makeScalarBigMapStore: collectionManager.makeScalarBigMapStore,
      makeScalarBigWeakMapStore: collectionManager.makeScalarBigWeakMapStore,
      makeScalarBigSetStore: collectionManager.makeScalarBigSetStore,
      makeScalarBigWeakSetStore: collectionManager.makeScalarBigWeakSetStore,
    },
  });

  const inescapableGlobalProperties = harden({
    WeakMap: vom.VirtualObjectAwareWeakMap,
    WeakSet: vom.VirtualObjectAwareWeakSet,
  });

  const testHooks = harden({
    ...vom.testHooks,
    ...vrm.testHooks,
    ...collectionManager.testHooks,
  });

  function assertValidUserVatstoreKey(key) {
    assert.typeof(key, 'string');
    assert(key.match(/^[-\w.+/]+$/), X`invalid vatstore key`);
  }

  let baggage;
  async function startVat(vatParametersCapData) {
    insistCapData(vatParametersCapData);
    assert(!didStartVat);
    didStartVat = true;

    // Build the `vatPowers` provided to `buildRootObject`. We include
    // vatGlobals and inescapableGlobalProperties to make it easier to write
    // unit tests that share their vatPowers with the test program, for
    // direct manipulation). 'D' is used by only a few vats: (bootstrap,
    // bridge, vat-http).
    const vpow = {
      D,
      exitVat,
      exitVatWithFailure,
      ...vatGlobals,
      ...inescapableGlobalProperties,
      ...vatPowers,
    };
    if (enableDisavow) {
      vpow.disavow = disavow;
    }
    if (enableVatstore) {
      vpow.vatstore = harden({
        get: key => {
          assertValidUserVatstoreKey(key);
          return syscall.vatstoreGet(`vvs.${key}`);
        },
        set: (key, value) => {
          assertValidUserVatstoreKey(key);
          assert.typeof(value, 'string');
          syscall.vatstoreSet(`vvs.${key}`, value);
        },
        getAfter: (priorKey, lowerBound, upperBound) => {
          let scopedPriorKey = '';
          if (priorKey !== '') {
            assertValidUserVatstoreKey(priorKey);
            assert(priorKey >= lowerBound, 'priorKey must be >= lowerBound');
            scopedPriorKey = `vvs.${priorKey}`;
          }
          assertValidUserVatstoreKey(lowerBound);
          const scopedLowerBound = `vvs.${lowerBound}`;
          let scopedUpperBound;
          if (upperBound) {
            assertValidUserVatstoreKey(upperBound);
            assert(upperBound > lowerBound, 'upperBound must be > lowerBound');
            scopedUpperBound = `vvs.${upperBound}`;
          }
          const [key, value] = syscall.vatstoreGetAfter(
            scopedPriorKey,
            scopedLowerBound,
            scopedUpperBound,
          );
          if (key) {
            assert(key.startsWith('vvs.'));
            return [key.slice(4), value];
          } else {
            return [undefined, undefined];
          }
        },
        delete: key => {
          assertValidUserVatstoreKey(key);
          syscall.vatstoreDelete(`vvs.${key}`);
        },
      });
    }

    initializeIDCounters();
    const vatParameters = m.unserialize(vatParametersCapData);
    baggage = collectionManager.provideBaggage();

    // Below this point, user-provided code might crash or overrun a meter, so
    // any prior-to-user-code setup that can be done without reference to the
    // content of the user-provided code should be above this point.
    await Promise.resolve();

    // syscalls/VatData/makeKind must be enabled before invoking buildVatNamespace
    const vatNS = await buildVatNamespace(
      vatGlobals,
      inescapableGlobalProperties,
    );
    const buildRootObject = vatNS.buildRootObject;
    assert.typeof(
      buildRootObject,
      'function',
      X`vat source bundle lacks buildRootObject() function`,
    );

    // here we finally invoke the vat code, and get back the root object
    const rootObject = buildRootObject(
      harden(vpow),
      harden(vatParameters),
      baggage,
    );
    assert.equal(
      passStyleOf(rootObject),
      'remotable',
      X`buildRootObject() for vat ${forVatID} returned ${rootObject}, which is not Far`,
    );
    assert(
      getInterfaceOf(rootObject) !== undefined,
      X`buildRootObject() for vat ${forVatID} returned ${rootObject} with no interface`,
    );

    const rootSlot = makeVatSlot('object', true, BigInt(0));
    valToSlot.set(rootObject, rootSlot);
    slotToVal.set(rootSlot, new WeakRef(rootObject));
    retainExportedVref(rootSlot);
    // we do not use vreffedObjectRegistry for root objects
  }

  /**
   * @param {VatDeliveryObject} delivery
   * @returns {void | Promise<void>}
   */
  function dispatchToUserspace(delivery) {
    let result;
    const [type, ...args] = delivery;
    switch (type) {
      case 'message': {
        const [targetSlot, msg] = args;
        insistMessage(msg);
        deliver(targetSlot, msg.method, msg.args, msg.result);
        break;
      }
      case 'notify': {
        const [resolutions] = args;
        notify(resolutions);
        break;
      }
      case 'dropExports': {
        const [vrefs] = args;
        dropExports(vrefs);
        break;
      }
      case 'retireExports': {
        const [vrefs] = args;
        retireExports(vrefs);
        break;
      }
      case 'retireImports': {
        const [vrefs] = args;
        retireImports(vrefs);
        break;
      }
      case 'startVat': {
        const [vpCapData] = args;
        result = startVat(vpCapData);
        break;
      }
      default:
        assert.fail(X`unknown delivery type ${type}`);
    }
    return result;
  }

  // the first turn of each dispatch is spent in liveslots, and is not
  // metered
  const unmeteredDispatch = meterControl.unmetered(dispatchToUserspace);

  async function bringOutYourDead() {
    vom.flushCache();
    await gcTools.gcAndFinalize();
    const doMore = await scanForDeadObjects();
    if (doMore) {
      return bringOutYourDead();
    }
    return undefined;
  }

  /**
   * Do things that should be done (such as flushing caches to disk) after a
   * dispatch has completed and user code has relinquished agency.
   */
  function afterDispatchActions() {
    flushIDCounters();
  }

  /**
   * This 'dispatch' function is the entry point for the vat as a whole: the
   * vat-worker supervisor gives us VatDeliveryObjects (like dispatch.deliver)
   * to execute. Here in liveslots, we invoke user-provided code during this
   * time, which might cause us to make some syscalls. This userspace code might
   * use Promises to add more turns to the ready promise queue, but we never
   * give it direct access to the timer or IO queues (setImmediate, setInterval,
   * setTimeout), so once the promise queue is empty, the vat userspace loses
   * "agency" (the ability to initiate further execution), and
   * waitUntilQuiescent fires. At that point we return control to the supervisor
   * by resolving our return promise.
   *
   * Liveslots specifically guards against userspace reacquiring agency after
   * our return promise is fired: vats are idle between cranks. Metering of the
   * worker guards against userspace performing a synchronous infinite loop
   * (`for (;;) {}`, the dreaded cthulu operator) or an async one (`function
   * again() { return Promise.resolve().then(again); }`), by killing the vat
   * after too much work. Userspace errors during delivery are expressed by
   * calling syscall.resolve to reject the dispatch.deliver(result=) promise ID,
   * which is unrelated to the Promise that `dispatch` returns.
   *
   * Liveslots does the authority to stall a crank indefinitely, by virtue of
   * having access to `waitUntilQuiescent` and `FinalizationRegistry` (to retain
   * agency), and the ability to disable metering (to disable worker
   * termination), but only a buggy liveslots would do this. The kernel is
   * vulnerable to a buggy liveslots never finishing a crank.
   *
   * This `dispatch` function always returns a Promise. It resolves (with
   * nothing) when the crank completes successfully. If it rejects, that
   * indicates the delivery has failed, and the worker should send an ["error",
   * ..] `VatDeliveryResult` back to the kernel (which may elect to terminate
   * the vat). Userspace should not be able to cause the delivery to fail: only
   * a bug in liveslots should trigger a failure.
   *
   * @param {VatDeliveryObject} delivery
   * @returns {Promise<void>}
   */
  async function dispatch(delivery) {
    // We must short-circuit dispatch to bringOutYourDead here because it has to
    // be async
    if (delivery[0] === 'bringOutYourDead') {
      return meterControl.runWithoutMeteringAsync(bringOutYourDead);
    } else {
      // Start user code running, record any internal liveslots errors. We do
      // *not* directly wait for the userspace function to complete, nor for
      // any promise it returns to fire.
      const p = Promise.resolve(delivery).then(unmeteredDispatch);

      // Instead, we wait for userspace to become idle by draining the promise
      // queue. We clean up and then return 'p' so any bugs in liveslots that
      // cause an error during unmeteredDispatch will be reported to the
      // supervisor (but only after userspace is idle).
      return gcTools.waitUntilQuiescent().then(() => {
        afterDispatchActions();
        return p;
      });
    }
  }
  harden(dispatch);

  // we return 'possiblyDeadSet' for unit tests
  return harden({
    dispatch,
    startVat,
    vatGlobals,
    inescapableGlobalProperties,
    m,
    possiblyDeadSet,
    testHooks,
  });
}

/**
 * Instantiate the liveslots layer for a new vat and then populate the vat with
 * a new root object and its initial associated object graph, if any.
 *
 * @param {any} syscall Kernel syscall interface that the vat will have access to
 * @param {any} forVatID Vat ID label, for use in debug diagostics
 * @param {any} vatPowers
 * @param {number} cacheSize Upper bound on virtual object cache size
 * @param {boolean} enableDisavow
 * @param {boolean} enableVatstore
 * @param {any} gcTools { WeakRef, FinalizationRegistry, waitUntilQuiescent }
 * @param {Pick<Console, 'debug' | 'log' | 'info' | 'warn' | 'error'>} [liveSlotsConsole]
 * @param {any} buildVatNamespace
 * @returns {any} { vatGlobals, inescapableGlobalProperties, dispatch }
 *
 *   SetBuildRootObject should be called, once, with a function that will create a
 *   root object for the new vat The caller provided buildRootObject function
 *   produces and returns the new vat's root object:
 *
 *   BuildRootObject(vatPowers, vatParameters)
 *
 *   Within the vat, `import { E } from '@endo/eventual-send'` will provide the E
 *   wrapper. For any object x, E(x) returns a proxy object that converts any
 *   method invocation into a corresponding eventual send to x. That is,
 *   E(x).foo(arg1, arg2) is equivalent to x~.foo(arg1, arg2)
 *
 *   If x is the presence in this vat of a remote object (that is, an object
 *   outside the vat), this will result in a message send out of the vat via the
 *   kernel syscall interface.
 *
 *   In the same vein, if x is the presence in this vat of a kernel device,
 *   vatPowers.D(x) returns a proxy such that a method invocation on it is
 *   translated into the corresponding immediate invocation of the device
 *   (using, once again, the kernel syscall interface). D(x).foo(args) will
 *   perform an immediate syscall.callNow on the device node.
 */
export function makeLiveSlots(
  syscall,
  forVatID = 'unknown',
  vatPowers = harden({}),
  cacheSize = DEFAULT_VIRTUAL_OBJECT_CACHE_SIZE,
  enableDisavow = false,
  enableVatstore = false,
  gcTools,
  liveSlotsConsole = console,
  buildVatNamespace,
) {
  const allVatPowers = {
    ...vatPowers,
    makeMarshal,
  };
  const r = build(
    syscall,
    forVatID,
    cacheSize,
    enableDisavow,
    enableVatstore,
    allVatPowers,
    gcTools,
    liveSlotsConsole,
    buildVatNamespace,
  );
  const { dispatch, startVat, possiblyDeadSet, testHooks } = r; // omit 'm'
  return harden({
    dispatch,
    startVat,
    possiblyDeadSet,
    testHooks,
  });
}

// for tests
export function makeMarshaller(syscall, gcTools, vatID = 'forVatID') {
  const { m } = build(
    syscall,
    vatID,
    DEFAULT_VIRTUAL_OBJECT_CACHE_SIZE,
    false,
    false,
    {},
    gcTools,
    console,
  );
  return { m };
}
