import { annotateError, assert, Fail, makeError, X } from '@endo/errors';
import { passStyleOf } from '@endo/pass-style';
import { PassStyleOfEndowmentSymbol } from '@endo/pass-style/endow.js';
import { Remotable, getInterfaceOf, makeMarshal } from '@endo/marshal';
import { isPromise } from '@endo/promise-kit';
import { E, HandledPromise } from '@endo/eventual-send';
import { insistVatType, makeVatSlot, parseVatSlot } from './parseVatSlots.js';
import { insistCapData } from './capdata.js';
import { extractMethod, legibilizeMethod } from './kdebug.js';
import { insistMessage } from './message.js';
import { makeVirtualReferenceManager } from './virtualReferences.js';
import { makeVirtualObjectManager } from './virtualObjectManager.js';
import { makeCollectionManager } from './collectionManager.js';
import { makeWatchedPromiseManager } from './watchedPromises.js';
import { makeBOYDKit } from './boyd-gc.js';

const SYSCALL_CAPDATA_BODY_SIZE_LIMIT = 10_000_000;
const SYSCALL_CAPDATA_SLOTS_LENGTH_LIMIT = 10_000;

// 'makeLiveSlots' is a dispatcher which uses javascript Maps to keep track
// of local objects which have been exported. These cannot be persisted
// beyond the runtime of the javascript environment, so this mechanism is not
// going to work for our in-chain hosts.

/**
 * Instantiate the liveslots layer for a new vat and then populate the vat with
 * a new root object and its initial associated object graph, if any.
 *
 * @param {*} syscall  Kernel syscall interface that the vat will have access to
 * @param {*} forVatID  Vat ID label, for use in debug diagnostics
 * @param {*} vatPowers
 * @param {import('./types.js').LiveSlotsOptions} liveSlotsOptions
 * @param {*} gcTools { WeakRef, FinalizationRegistry, waitUntilQuiescent, gcAndFinalize,
 *                      meterControl }
 * @param {Pick<Console, 'debug' | 'log' | 'info' | 'warn' | 'error'>} console
 * @param {*} buildVatNamespace
 *
 * @returns {*} { dispatch }
 */
function build(
  syscall,
  forVatID,
  vatPowers,
  liveSlotsOptions = {},
  gcTools,
  console,
  buildVatNamespace,
) {
  const { enableDisavow = false, relaxDurabilityRules = false } =
    liveSlotsOptions;
  const { WeakRef, FinalizationRegistry, meterControl } = gcTools;
  const enableLSDebug = false;
  function lsdebug(...args) {
    if (enableLSDebug) {
      console.log(...args);
    }
  }

  let didStartVat = false;
  const didStopVat = false;

  const outstandingProxies = new WeakSet();

  let syscallCapdataBodySizeLimit = SYSCALL_CAPDATA_BODY_SIZE_LIMIT;
  let syscallCapdataSlotsLengthLimit = SYSCALL_CAPDATA_SLOTS_LENGTH_LIMIT;

  function setSyscallCapdataLimits(
    bodySizeLimit = SYSCALL_CAPDATA_BODY_SIZE_LIMIT,
    slotsLengthLimit = SYSCALL_CAPDATA_SLOTS_LENGTH_LIMIT,
  ) {
    syscallCapdataBodySizeLimit = bodySizeLimit;
    syscallCapdataSlotsLengthLimit = slotsLengthLimit;
  }

  function isAcceptableSyscallCapdataSize(capdatas) {
    let bodySizeTotal = 0;
    let slotsLengthTotal = 0;
    for (const capdata of capdatas) {
      bodySizeTotal += capdata.body.length;
      slotsLengthTotal += capdata.slots.length;
    }
    return (
      bodySizeTotal <= syscallCapdataBodySizeLimit &&
      slotsLengthTotal <= syscallCapdataSlotsLengthLimit
    );
  }

  function assertAcceptableSyscallCapdataSize(capdatas) {
    assert(
      isAcceptableSyscallCapdataSize(capdatas),
      'syscall capdata too large',
    );
  }

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
   * represented as an imported Promise, with the resolver held in an
   * additional table (importedPromisesByPromiseID) to handle a future
   * incoming resolution message. We retain a weak reference to the Presence,
   * and use a FinalizationRegistry to learn when the vat has dropped it, so
   * we can notify the kernel. We retain strong references to unresolved
   * Promises. When an import is added, the finalizer is added to
   * `vreffedObjectRegistry`.
   *
   * slotToVal is a Map whose keys are slots (strings) and the values are
   * WeakRefs. If the entry is present but wr.deref()===undefined (the
   * weakref is dead), treat that as if the entry was not present. The same
   * slotToVal table is used for both imports and returning exports. The
   * subset of those which need to be held strongly (exported objects and
   * promises, imported promises) are kept alive by `exportedRemotables`.
   *
   * valToSlot is a WeakMap whose keys are Remotable/Presence/Promise
   * objects, and the keys are (string) slot identifiers. This is used
   * for both exports and returned imports.
   *
   * We use two weak maps plus the strong `exportedRemotables` set, because
   * it seems simpler than using four separate maps (import-vs-export times
   * strong-vs-weak).
   */

  /** @type {WeakMap<object, string>} */
  const valToSlot = new WeakMap(); // object -> vref
  const slotToVal = new Map(); // baseRef -> WeakRef(object)
  const exportedRemotables = new Set(); // objects
  const kernelRecognizableRemotables = new Set(); // vrefs
  const importedDevices = new Set(); // device nodes
  const possiblyDeadSet = new Set(); // baseRefs that need to be checked for being dead
  const possiblyRetiredSet = new Set(); // vrefs that might need to be rechecked for being retired

  // importedVPIDs and exportedVPIDs track all promises which the
  // kernel knows about: the kernel is the decider for importedVPIDs,
  // and we are the decider for exportedVPIDs

  // We do not need to include the ancillary promises that
  // resolutionCollector() creates: those are resolved immediately
  // after export. However we remove those during resolution just in
  // case they overlap with non-ancillary ones.

  const exportedVPIDs = new Map(); // VPID -> Promise, kernel-known, vat-decided
  const importedVPIDs = new Map(); // VPID -> { promise, resolve, reject }, kernel-known+decided

  function retainExportedVref(vref) {
    // if the vref corresponds to a Remotable, keep a strong reference to it
    // until the kernel tells us to release it
    const { type, allocatedByVat, virtual, durable } = parseVatSlot(vref);
    if (type === 'object' && allocatedByVat) {
      if (virtual || durable) {
        vrm.setExportStatus(vref, 'reachable');
      } else {
        const remotable = requiredValForSlot(vref);
        exportedRemotables.add(remotable);
        kernelRecognizableRemotables.add(vref);
      }
    }
  }

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
      addToPossiblyDeadSet(baseRef);
      slotToVal.delete(baseRef);
    }
  }
  const vreffedObjectRegistry = new FinalizationRegistry(finalizeDroppedObject);

  /**
   * Remember disavowed Presences which will kill the vat if you try to talk
   * to them
   */
  const disavowedPresences = new WeakSet();
  const disavowalError = harden(Error(`this Presence has been disavowed`));

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
          exitVatWithFailure(disavowalError);
          throw disavowalError;
        }
        return queueMessage(slot, prop, args, returnedP);
      },
      applyFunction(o, args, returnedP) {
        return fulfilledHandler.applyMethod(o, undefined, args, returnedP);
      },
      get(o, prop) {
        lsdebug(`makeImportedPresence handler.get (${slot})`);
        if (disavowedPresences.has(o)) {
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
    void harden(p);

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
          Fail`mIPromise handler called after resolution`;
        }
        return queueMessage(vpid, prop, args, returnedP);
      },
      get(p, prop) {
        // Support: p~.[prop]
        lsdebug(`makePipelinablePromise handler.get (${vpid})`);
        if (!handlerActive) {
          console.error(`mIPromise handler called after resolution`);
          Fail`mIPromise handler called after resolution`;
        }
        // FIXME: Actually pipeline.
        return E.when(p, o => o[prop]);
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
      promise: p,
      resolve(resolution) {
        handlerActive = false;
        resolve(resolution);
      },

      reject(rejection) {
        handlerActive = false;
        reject(rejection);
      },
    });
    return pRec;
  }

  function makeDeviceNode(id, iface = `Alleged: device ${id}`) {
    return Remotable(iface);
  }

  // TODO: fix awkward non-orthogonality: allocateExportID() returns a number,
  // allocatePromiseID() returns a slot, registerPromise() uses the slot from
  // allocatePromiseID(), exportPassByPresence() generates a slot itself using
  // the number from allocateExportID().  Both allocateX fns should return a
  // number or return a slot; both exportY fns should either create a slot or
  // use a slot from the corresponding allocateX

  function allocateExportID() {
    return vrm.allocateNextID('exportID');
  }

  function allocateCollectionID() {
    return vrm.allocateNextID('collectionID');
  }

  function allocatePromiseID() {
    const promiseID = vrm.allocateNextID('promiseID');
    return makeVatSlot('promise', true, promiseID);
  }

  const knownResolutions = new WeakMap();

  /**
   * Determines if a vref from a watched promise or outbound argument
   * identifies a promise that should be exported, and if so then
   * adds it to exportedVPIDs and sets up handlers.
   *
   * @param {any} vref
   * @returns {boolean} whether the vref was added to exportedVPIDs
   */
  function maybeExportPromise(vref) {
    // we only care about new vpids
    if (
      parseVatSlot(vref).type === 'promise' &&
      !exportedVPIDs.has(vref) &&
      !importedVPIDs.has(vref)
    ) {
      const vpid = vref;
      // The kernel is about to learn about this promise (syscall.send
      // arguments or syscall.resolve resolution data), so prepare to
      // do a syscall.resolve when it fires. The caller must finish
      // doing their syscall before this turn finishes, to ensure the
      // kernel isn't surprised by a spurious resolution.
      const p = requiredValForSlot(vpid);
      // if (!knownResolutions.has(p)) { // TODO really?
      followForKernel(vpid, p);
      return true;
    }
    return false;
  }

  function exportPassByPresence() {
    const exportID = allocateExportID();
    return makeVatSlot('object', true, exportID);
  }

  const m = makeMarshal(convertValToSlot, convertSlotToVal, {
    marshalName: `liveSlots:${forVatID}`,
    serializeBodyFormat: 'smallcaps',
    // TODO Temporary hack.
    // See https://github.com/Agoric/agoric-sdk/issues/2780
    errorIdNum: 70_000,
    marshalSaveError: err =>
      // By sending this to `console.warn`, under cosmic-swingset this is
      // controlled by the `console` option given to makeLiveSlots.
      console.warn('Logging sent error stack', err),
  });
  const unmeteredUnserialize = meterControl.unmetered(m.unserialize);
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
    result || Fail`no value for ${baseRef}`;
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
    WeakRef,
    addToPossiblyDeadSet,
    addToPossiblyRetiredSet,
    relaxDurabilityRules,
  );

  const vom = makeVirtualObjectManager(
    syscall,
    vrm,
    allocateExportID,
    getSlotForVal,
    requiredValForSlot,
    registerValue,
    m.serialize,
    unmeteredUnserialize,
    assertAcceptableSyscallCapdataSize,
    liveSlotsOptions,
  );

  const collectionManager = makeCollectionManager(
    syscall,
    vrm,
    allocateExportID,
    allocateCollectionID,
    convertValToSlot,
    unmeteredConvertSlotToVal,
    registerValue,
    m.serialize,
    unmeteredUnserialize,
    assertAcceptableSyscallCapdataSize,
  );

  const watchedPromiseManager = makeWatchedPromiseManager({
    syscall,
    vrm,
    vom,
    collectionManager,
    convertValToSlot,
    convertSlotToVal: unmeteredConvertSlotToVal,
    maybeExportPromise,
  });

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
      // must be a new export/store
      // lsdebug('must be a new export', JSON.stringify(val));
      if (isPromise(val)) {
        // the promise either appeared in outbound arguments, or in a
        // virtual-object store operation, so immediately after
        // serialization we'll either add it to exportedVPIDs or
        // increment a vdata refcount
        slot = allocatePromiseID();
      } else {
        if (disavowedPresences.has(val)) {
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
    const { type, id, facet } = parseVatSlot(baseRef);
    !facet ||
      Fail`registerValue(${baseRef} should not receive individual facets`;
    slotToVal.set(baseRef, new WeakRef(val));
    if (valIsCohort) {
      for (const [index, name] of vrm.getFacetNames(id).entries()) {
        valToSlot.set(val[name], `${baseRef}:${index}`);
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
    const { type, allocatedByVat, id, virtual, durable, facet, baseRef } =
      parseVatSlot(slot);
    let val = getValForSlot(baseRef);
    if (val) {
      if (virtual || durable) {
        if (facet !== undefined) {
          return vrm.getFacet(id, val, facet);
        }
      }
      return val;
    }
    let result;
    if (virtual || durable) {
      assert.equal(type, 'object');
      try {
        val = vrm.reanimate(baseRef);
      } catch (err) {
        const wrappedError = makeError(X`failed to reanimate ${iface}`);
        annotateError(wrappedError, X`Original error: ${err}`);
        throw wrappedError;
      }
      if (facet !== undefined) {
        result = vrm.getFacet(id, val, facet);
      }
    } else if (type === 'object') {
      // Note: an abandonned (e.g. by an upgrade) exported ephemeral or virtual
      // object would appear as an import if re-introduced. In the future we
      // may need to change that if we want to keep recognizing such references
      // In that case we'd need to create an imported presence for these
      // unknown vrefs allocated by the vat.
      // See https://github.com/Agoric/agoric-sdk/issues/9746
      !allocatedByVat || Fail`I don't remember allocating ${slot}`;
      // this is a new import value
      val = makeImportedPresence(slot, iface);
    } else if (type === 'promise') {
      // We unconditionally create a promise record, even if the promise looks
      // like it was allocated by us. This can happen when re-importing a
      // promise created by the previous incarnation. We may or may not have
      // been the decider of the promise. If we were, the kernel will be
      // rejecting the promise on our behalf. We may have previously been
      // subscribed to that promise, but subscription is idempotent.
      const pRec = makePipelinablePromise(slot);
      importedVPIDs.set(slot, pRec);
      val = pRec.promise;
      // ideally we'd wait until .then is called on p before subscribing,
      // but the current Promise API doesn't give us a way to discover
      // this, so we must subscribe right away. If we were using Vows or
      // some other then-able, we could just hook then() to notify us.
      if (importedPromises) {
        // leave the subscribe() up to dispatch.notify()
        importedPromises.add(slot);
      } else {
        // probably in dispatch.deliver(), so subscribe now
        syscall.subscribe(slot);
      }
    } else if (type === 'device') {
      !allocatedByVat || Fail`unexpected device ${slot} allocated by vat`;
      val = makeDeviceNode(slot, iface);
      importedDevices.add(val);
    } else {
      Fail`unrecognized slot type '${type}'`;
    }
    registerValue(baseRef, val, facet !== undefined);
    if (!result) {
      result = val;
    }
    return result;
  }

  function revivePromise(slot) {
    meterControl.assertNotMetered();
    const { type } = parseVatSlot(slot);
    type === 'promise' || Fail`revivePromise called on non-promise ${slot}`;
    const val = getValForSlot(slot);
    if (val) {
      // revivePromise is only called by loadWatchedPromiseTable, which runs
      // after buildRootObject(), which is given the deserialized vatParameters.
      // The only way revivePromise() might encounter a pre-existing vpid is if
      // these vatParameters include a promise that the previous incarnation
      // watched, but that `buildRootObject` in the new incarnation didn't
      // explicitly watch again. This can be either a previously imported
      // promise, or a promise the previous incarnation exported, regardless of
      // who the decider now is.
      //
      // In that case convertSlotToVal() has already deserialized the vpid, but
      // since `buildRootObject` didn't explicitely call watchPromise on it, no
      // registration exists so loadWatchedPromiseTable attempts to revive the
      // promise.
      return val;
    }
    // NOTE: it is important that this code not do anything *more*
    // than what convertSlotToVal(vpid) would do
    const pRec = makePipelinablePromise(slot);
    importedVPIDs.set(slot, pRec);
    const p = pRec.promise;
    registerValue(slot, p);
    return p;
  }
  const unmeteredRevivePromise = meterControl.unmetered(revivePromise);

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
      // do maybeExportPromise() next to the syscall, not here
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

  async function queueMessage(targetSlot, prop, args, returnedP) {
    const methargs = [prop, args];

    meterControl.assertIsMetered(); // else userspace getters could escape
    const serMethargs = m.serialize(harden(methargs));
    assertAcceptableSyscallCapdataSize([serMethargs]);
    serMethargs.slots.map(retainExportedVref);

    const resultVPID = allocatePromiseID();
    lsdebug(`Promise allocation ${forVatID}:${resultVPID} in queueMessage`);
    // create a Promise which callers follow for the result, give it a
    // handler so we can pipeline messages to it, and prepare for the kernel
    // to notify us of its resolution
    const pRec = makePipelinablePromise(resultVPID);

    // userspace sees `returnedP` (so that's what we need to register
    // in slotToVal, and what's what we need to retain with a strong
    // reference via importedVPIDs), but when dispatch.notify arrives,
    // we need to fire `pRec.promise` because that's what we've got
    // the firing controls for
    importedVPIDs.set(resultVPID, harden({ ...pRec, promise: returnedP }));
    valToSlot.set(returnedP, resultVPID);
    slotToVal.set(resultVPID, new WeakRef(returnedP));

    // prettier-ignore
    lsdebug(
      `ls.qm send(${JSON.stringify(targetSlot)}, ${legibilizeMethod(prop)}) -> ${resultVPID}`,
    );
    syscall.send(targetSlot, serMethargs, resultVPID);

    // The vpids in the syscall.send might be in A:exportedVPIDs,
    // B:importedVPIDs, or C:neither. Just after the send(), we are
    // newly on the hook for following the ones in C:neither. One
    // option would be to feed all the syscall.send slots to
    // maybeExportPromise(), which will sort them into A/B/C, then
    // take everything in C:neither and do a .then on it and add it to
    // exportedVPIDs. Then we call it a day, and allow all the
    // resolutions to be delivered in a later turn.
    //
    // But instead, we choose the option that says "but many of those
    // promises might already be resolved", and if there's more than
    // one, we could amortize some syscall overhead by emitting all
    // the known resolutions in a 2-or-larger batch, and in this
    // moment (in this turn) we have a whole list of them that we can
    // check synchronously.
    //
    // To implement this option, the sequence is:
    // * use W to name the vpids in syscall.send
    // * feed W into resolutionCollector(), to get 'resolutions'
    //   * that provides the resolution of any promise in W that is
    //     known to be resolved, plus any known-resolved promises
    //     transitively referenced through their resolution data
    //   * all these resolutions will use the original vpid, which the
    //     kernel does not currently know about, because the vpid was
    //     retired earlier, the previous time that promise was
    //     resolved
    // * name X the set of vpids resolved in 'resolutions'
    //   * assert that X vpids are not in exportedVPIDs or importedVPIDs
    //   * they can only be in X if we remembered the Promise's
    //     resolution, which means we observed the vpid resolve
    //   * at that moment of observation, we would have removed it
    //     from exportedVPIDs, as we did a syscall.resolve on it
    // * name Y the set of vpids *referenced* by 'resolutions'
    // * emit syscall.resolve(resolutions)
    // * Z = (W+Y)-X: the set of vpids we told the kernel but didn't resolve
    // * feed Z into maybeExportPromise()

    const maybeNewVPIDs = new Set(serMethargs.slots);
    const resolutions = resolutionCollector().forSlots(serMethargs.slots);
    if (resolutions.length > 0) {
      try {
        const resolutionCDs = resolutions.map(
          ([_xvpid, _isReject, resolutionCD]) => resolutionCD,
        );
        assertAcceptableSyscallCapdataSize(resolutionCDs);
      } catch (e) {
        syscall.exit(true, m.serialize(e));
        return null;
      }
      syscall.resolve(resolutions);
      for (const resolution of resolutions) {
        const [_xvpid, _isReject, resolutionCD] = resolution;
        for (const vref of resolutionCD.slots) {
          maybeNewVPIDs.add(vref);
        }
      }
      for (const resolution of resolutions) {
        const [xvpid] = resolution;
        maybeNewVPIDs.delete(xvpid);
      }
    }
    for (const newVPID of Array.from(maybeNewVPIDs).sort()) {
      maybeExportPromise(newVPID);
    }

    // ideally we'd wait until .then is called on p before subscribing, but
    // the current Promise API doesn't give us a way to discover this, so we
    // must subscribe right away. If we were using Vows or some other
    // then-able, we could just hook then() to notify us.
    syscall.subscribe(resultVPID);

    // We return our new 'pRec.promise' to the handler, and when we
    // resolve it (during dispatch.notify) its resolution will be used
    // to resolve the caller's 'returnedP' Promise, but the caller
    // never sees pRec.promise itself. The caller got back their
    // 'returnedP' Promise before the handler even got invoked, and
    // thus before this queueMessage() was called.. If that caller
    // passes the 'returnedP' Promise they received as argument or
    // return value, we want it to serialize as resultVPID. And if
    // someone passes resultVPID to them, we want the user-level code
    // to get back that Promise, not 'pRec.promise'.  As a result, we
    // do not retain or track 'pRec.promise'. Only 'returnedP' is
    // registered and retained by importedVPIDs.

    return pRec.promise;
  }

  function forbidPromises(serArgs) {
    for (const slot of serArgs.slots) {
      parseVatSlot(slot).type !== 'promise' ||
        Fail`D() arguments cannot include a Promise`;
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
          assertAcceptableSyscallCapdataSize([serArgs]);
          serArgs.slots.map(retainExportedVref);
          // if we didn't forbid promises, we'd need to
          // maybeExportPromise() here
          forbidPromises(serArgs);
          const ret = syscall.callNow(slot, prop, serArgs);
          insistCapData(ret);
          forbidPromises(ret);
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
      throw Error('D(D(x)) is invalid');
    }
    const slot = valToSlot.get(x);
    if (!slot || parseVatSlot(slot).type !== 'device') {
      throw Error('D() must be given a device node');
    }
    const handler = DeviceHandler(slot);
    const pr = harden(new Proxy({}, handler));
    outstandingProxies.add(pr);
    return pr;
  }

  function deliver(target, methargsdata, resultVPID) {
    assert(didStartVat);
    assert(!didStopVat);
    insistCapData(methargsdata);

    // prettier-ignore
    lsdebug(
      `ls[${forVatID}].dispatch.deliver ${target}.${extractMethod(methargsdata)} -> ${resultVPID}`,
    );
    const t = convertSlotToVal(target);
    t || Fail`no target ${target}`;
    // TODO: if we acquire new decision-making authority over a promise that
    // we already knew about ('resultVPID' is already in slotToVal), we should no
    // longer accept dispatch.notify from the kernel. We currently use
    // importedPromisesByPromiseID to track a combination of "we care about
    // when this promise resolves" and "we are listening for the kernel to
    // resolve it". We should split that into two tables or something. And we
    // should error-check cases that the kernel shouldn't do, like getting
    // the same vpid as a result= twice, or getting a result= for an exported
    // promise (for which we were already the decider).

    meterControl.assertNotMetered();
    const methargs = m.unserialize(methargsdata);
    const [method, args] = methargs;

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
      // It has arguments, must be a method or function application.
      if (method === undefined) {
        res = HandledPromise.applyFunction(t, args);
      } else {
        res = HandledPromise.applyMethod(t, method, args);
      }
    } else {
      // Just a getter.
      // TODO: untested, but in principle sound.
      res = HandledPromise.get(t, method);
    }

    let p = res; // the promise tied to resultVPID
    if (resultVPID) {
      if (importedVPIDs.has(resultVPID)) {
        // This vpid was imported earlier, and we just now became the
        // decider, so we already have a local Promise object for
        // it. We keep using that object.
        // , but forward it to 'res', and
        // move it from importedVPIDs to exportedVPIDs.
        const pRec = importedVPIDs.get(resultVPID);
        // remove it from importedVPIDs: the kernel will no longer be
        // telling us about its resolution
        importedVPIDs.delete(resultVPID);
        // forward it to the userspace-fired result promise (despite
        // using resolve(), this could either fulfill or reject)
        pRec.resolve(res);
        // exportedVPIDs will hold a strong reference to the pRec
        // promise that everyone is already using, and when it fires
        // we'll notify the kernel
        p = pRec.promise;
        // note: the kernel does not unsubscribe vats that acquire
        // decider status (but it probably should), so after we do our
        // syscall.resolve, the kernel will give us a
        // dispatch.notify. But we'll ignore the stale vpid by
        // checking importedVPIDs in notifyOnePromise()
      } else {
        // new vpid
        registerValue(resultVPID, res, false);
      }
      // in both cases, we are now the decider, so treat it like an
      // exported promise
      followForKernel(resultVPID, p);
    }
  }

  function unregisterUnreferencedVPID(vpid) {
    lsdebug(`unregisterUnreferencedVPID ${forVatID}:${vpid}`);
    assert.equal(parseVatSlot(vpid).type, 'promise');
    // we are only called with vpids that are in exportedVPIDs or
    // importedVPIDs, so the WeakRef should still be populated, making
    // this safe to call from metered code
    const p = requiredValForSlot(vpid);
    if (vrm.getReachablePromiseRefCount(p) === 0) {
      // unregister
      valToSlot.delete(p);
      slotToVal.delete(vpid);
      // the caller will remove the vpid from
      // exportedVPIDs/importedVPIDs in a moment
    }
  }

  /**
   *
   * @param {string} vpid
   * @param {Promise<unknown>} p
   */
  function followForKernel(vpid, p) {
    insistVatType('promise', vpid);
    exportedVPIDs.set(vpid, p);

    function handle(isReject, value) {
      knownResolutions.set(p, harden([isReject, value]));
      lsdebug(`ls.thenHandler fired`, value);
      assert(exportedVPIDs.has(vpid), vpid);
      const rc = resolutionCollector();
      const resolutions = rc.forPromise(vpid, isReject, value);
      try {
        const resolutionCDs = resolutions.map(
          ([_xvpid, _isReject, resolutionCD]) => resolutionCD,
        );
        assertAcceptableSyscallCapdataSize(resolutionCDs);
      } catch (e) {
        syscall.exit(true, m.serialize(e));
        return;
      }
      syscall.resolve(resolutions);

      const maybeNewVPIDs = new Set();
      // if we mention a vpid, we might need to track it
      for (const resolution of resolutions) {
        const [_xvpid, _isReject, resolutionCD] = resolution;
        for (const vref of resolutionCD.slots) {
          maybeNewVPIDs.add(vref);
        }
      }
      // but not if we just resolved it (including the primary)
      for (const resolution of resolutions) {
        const [xvpid] = resolution;
        maybeNewVPIDs.delete(xvpid);
      }
      // track everything that's left
      for (const newVPID of Array.from(maybeNewVPIDs).sort()) {
        maybeExportPromise(newVPID);
      }

      // only the primary can possibly be newly resolved
      unregisterUnreferencedVPID(vpid);
      exportedVPIDs.delete(vpid);
    }

    void E.when(
      p,
      value => handle(false, value),
      value => handle(true, value),
    );
  }

  function notifyOnePromise(promiseID, rejected, data) {
    insistCapData(data);
    lsdebug(
      `ls.dispatch.notify(${promiseID}, ${rejected}, ${data.body}, [${data.slots}])`,
    );
    insistVatType('promise', promiseID);
    const pRec = importedVPIDs.get(promiseID);
    // we check pRec to ignore stale notifies, either from before an
    // upgrade, or if we acquire decider authority for a
    // previously-imported promise
    if (pRec) {
      meterControl.assertNotMetered();
      const val = m.unserialize(data);
      if (rejected) {
        pRec.reject(val);
      } else {
        pRec.resolve(val);
      }
      return true; // caller will remove from importedVPIDs
    }
    // else ignore: our predecessor version might have subscribed
    return false;
  }

  function notify(resolutions) {
    assert(didStartVat);
    assert(!didStopVat);
    // notifyOnePromise() will tell us whether each vpid in the batch
    // was retired or stale
    const retiredVPIDs = [];
    // Deserializing the batch of resolutions may import new promises,
    // some of which are resolved later in the batch. We'll need to
    // subscribe to the remaining (new+unresolved) ones.
    beginCollectingPromiseImports();
    for (const resolution of resolutions) {
      const [vpid, rejected, data] = resolution;
      const retired = notifyOnePromise(vpid, rejected, data);
      if (retired) {
        retiredVPIDs.push(vpid); // not stale
      }
    }
    // 'imports' is an exclusively-owned Set that holds all new
    // promise vpids, both resolved and unresolved
    const imports = finishCollectingPromiseImports();
    for (const vpid of retiredVPIDs) {
      unregisterUnreferencedVPID(vpid); // unregisters if not in vdata
      importedVPIDs.delete(vpid);
      imports.delete(vpid); // resolved, so don't subscribe()
    }
    for (const vpid of Array.from(imports).sort()) {
      syscall.subscribe(vpid);
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
      const { virtual, durable } = parseVatSlot(vref);
      if (virtual || durable) {
        vrm.setExportStatus(vref, 'recognizable');
      }
    }
  }

  function retireOneExport(vref) {
    insistVatType('object', vref);
    const { virtual, durable, allocatedByVat, type } = parseVatSlot(vref);
    assert(allocatedByVat);
    assert.equal(type, 'object');
    // console.log(`-- liveslots acting on retireExports ${vref}`);
    if (virtual || durable) {
      vrm.setExportStatus(vref, 'none');
    } else {
      // Remotable
      kernelRecognizableRemotables.delete(vref);
    }
  }

  function retireExports(vrefs) {
    assert(Array.isArray(vrefs));
    for (const vref of vrefs) {
      retireOneExport(vref);
    }
  }

  function retireImports(vrefs) {
    assert(Array.isArray(vrefs));
    vrefs.map(vref => insistVatType('object', vref));
    vrefs.map(vref => assert(!parseVatSlot(vref).allocatedByVat));
    for (const vref of vrefs) {
      vrm.ceaseRecognition(vref);
    }
  }

  // TODO: when we add notifyForward, guard against cycles

  function exitVat(completion) {
    meterControl.assertIsMetered(); // else userspace getters could escape
    const args = m.serialize(harden(completion));
    if (isAcceptableSyscallCapdataSize([args])) {
      args.slots.map(retainExportedVref);
      syscall.exit(false, args);
    } else {
      syscall.exit(true, m.serialize(Error('syscall capdata too large')));
    }
  }

  function exitVatWithFailure(reason) {
    meterControl.assertIsMetered(); // else userspace getters could escape
    const args = m.serialize(harden(reason));
    if (isAcceptableSyscallCapdataSize([args])) {
      args.slots.map(retainExportedVref);
      syscall.exit(true, args);
    } else {
      syscall.exit(true, m.serialize(Error('syscall capdata too large')));
    }
  }

  function disavow(presence) {
    if (!valToSlot.has(presence)) {
      Fail`attempt to disavow unknown ${presence}`;
    }
    const slot = valToSlot.get(presence);
    // @ts-expect-error not undefined b/c of has() check
    const { type, allocatedByVat } = parseVatSlot(slot);
    type === 'object' || Fail`attempt to disavow non-object ${presence}`;
    // disavow() is only for imports: we'll use a different API to revoke
    // exports, one which accepts an Error object
    !allocatedByVat || Fail`attempt to disavow an export`;
    valToSlot.delete(presence);
    slotToVal.delete(slot);
    disavowedPresences.add(presence);

    syscall.dropImports([slot]);
  }

  const vatGlobals = harden({
    VatData: {
      defineKind: vom.defineKind,
      defineKindMulti: vom.defineKindMulti,
      defineDurableKind: vom.defineDurableKind,
      defineDurableKindMulti: vom.defineDurableKindMulti,
      makeKindHandle: vom.makeKindHandle,
      canBeDurable: vom.canBeDurable,
      providePromiseWatcher: watchedPromiseManager.providePromiseWatcher,
      watchPromise: watchedPromiseManager.watchPromise,
      makeScalarBigMapStore: collectionManager.makeScalarBigMapStore,
      makeScalarBigWeakMapStore: collectionManager.makeScalarBigWeakMapStore,
      makeScalarBigSetStore: collectionManager.makeScalarBigSetStore,
      makeScalarBigWeakSetStore: collectionManager.makeScalarBigWeakSetStore,
    },
  });

  const inescapableGlobalProperties = harden({
    WeakMap: vom.VirtualObjectAwareWeakMap,
    WeakSet: vom.VirtualObjectAwareWeakSet,
    [PassStyleOfEndowmentSymbol]: passStyleOf,
  });

  function getRetentionStats() {
    return {
      ...collectionManager.getRetentionStats(),
      ...vrm.getRetentionStats(),
      ...vom.getRetentionStats(),
      exportedRemotables: exportedRemotables.size,
      importedDevices: importedDevices.size,
      kernelRecognizableRemotables: kernelRecognizableRemotables.size,
      exportedVPIDs: exportedVPIDs.size,
      importedVPIDs: importedVPIDs.size,
      possiblyDeadSet: possiblyDeadSet.size,
      possiblyRetiredSet: possiblyRetiredSet.size,
      slotToVal: slotToVal.size,
    };
  }

  const testHooks = harden({
    ...vom.testHooks,
    ...vrm.testHooks,
    ...collectionManager.testHooks,
    setSyscallCapdataLimits,
    vatGlobals,

    getRetentionStats,
    exportedRemotables,
    importedDevices,
    kernelRecognizableRemotables,
    exportedVPIDs,
    importedVPIDs,
    possiblyDeadSet,
    possiblyRetiredSet,
    slotToVal,
    valToSlot,
    afterDispatchActions,
  });

  function setVatOption(option, _value) {
    // note: we removed the only settable option in #7138, but we'll
    // retain dispatch.changeVatOptions to make it easier to add a new
    // one in the future
    switch (option) {
      default:
        console.warn(`WARNING setVatOption unknown option ${option}`);
    }
  }

  function changeVatOptions(options) {
    for (const option of Object.getOwnPropertyNames(options)) {
      setVatOption(option, options[option]);
    }
  }

  let baggage;
  async function startVat(vatParametersCapData) {
    insistCapData(vatParametersCapData);
    assert(!didStartVat);
    didStartVat = true;
    assert(!didStopVat);

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
    harden(vpow);

    vrm.initializeIDCounters();
    vom.initializeKindHandleKind();
    collectionManager.initializeStoreKindInfo();

    const vatParameters = m.unserialize(vatParametersCapData);
    baggage = collectionManager.provideBaggage();
    watchedPromiseManager.preparePromiseWatcherTables();

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
    typeof buildRootObject === 'function' ||
      Fail`vat source bundle lacks buildRootObject() function`;

    // here we finally invoke the vat code, and get back the root object
    const rootObject = await buildRootObject(vpow, vatParameters, baggage);
    passStyleOf(rootObject) === 'remotable' ||
      Fail`buildRootObject() for vat ${forVatID} returned ${rootObject}, which is not Far`;
    getInterfaceOf(rootObject) !== undefined ||
      Fail`buildRootObject() for vat ${forVatID} returned ${rootObject} with no interface`;
    if (valToSlot.has(rootObject)) {
      Fail`buildRootObject() must return ephemeral, not virtual/durable object`;
    }

    // Need to load watched promises *after* buildRootObject() so that handler kindIDs
    // have a chance to be reassociated with their handlers.
    watchedPromiseManager.loadWatchedPromiseTable(unmeteredRevivePromise);

    const rootSlot = makeVatSlot('object', true, BigInt(0));
    valToSlot.set(rootObject, rootSlot);
    slotToVal.set(rootSlot, new WeakRef(rootObject));
    retainExportedVref(rootSlot);
    // we do not use vreffedObjectRegistry for root objects

    vom.insistAllDurableKindsReconnected();
  }

  /**
   * @param {import('./types.js').VatDeliveryObject} delivery
   * @returns {undefined | ReturnType<startVat>}
   */
  async function dispatchToUserspace(delivery) {
    let result;
    const [type, ...args] = delivery;
    switch (type) {
      case 'message': {
        const [targetSlot, msg] = args;
        insistMessage(msg);
        deliver(targetSlot, msg.methargs, msg.result);
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
      case 'changeVatOptions': {
        const [options] = args;
        changeVatOptions(options);
        break;
      }
      case 'startVat': {
        const [vpCapData] = args;
        result = startVat(vpCapData);
        break;
      }
      default:
        Fail`unknown delivery type ${type}`;
    }
    return result;
  }

  // the first turn of each dispatch is spent in liveslots, and is not
  // metered
  const unmeteredDispatch = meterControl.unmetered(dispatchToUserspace);

  const { scanForDeadObjects } = makeBOYDKit({
    gcTools,
    slotToVal,
    vrm,
    kernelRecognizableRemotables,
    syscall,
    possiblyDeadSet,
    possiblyRetiredSet,
  });

  /**
   * @param { import('./types.js').SwingSetCapData } _disconnectObjectCapData
   * @returns {Promise<void>}
   */
  async function stopVat(_disconnectObjectCapData) {
    console.warn('stopVat is a no-op as of #6650');
  }

  /**
   * Do things that should be done (such as flushing caches to disk) after a
   * dispatch has completed and user code has relinquished agency.
   */
  function afterDispatchActions() {
    vrm.flushIDCounters();
    collectionManager.flushSchemaCache();
    vom.flushStateCache();
  }

  const bringOutYourDead = async () => {
    await scanForDeadObjects();
    // Now flush all the vatstore changes (deletions and refcounts) we
    // made. dispatch() calls afterDispatchActions() automatically for
    // most methods, but not bringOutYourDead().
    afterDispatchActions();
    // XXX TODO: make this conditional on a config setting
    return getRetentionStats();
  };

  /**
   * This 'dispatch' function is the entry point for the vat as a whole: the
   * vat-worker supervisor gives us VatDeliveryObjects (like
   * dispatch.deliver) to execute. Here in liveslots, we invoke user-provided
   * code during this time, which might cause us to make some syscalls. This
   * userspace code might use Promises to add more turns to the ready promise
   * queue, but we never give it direct access to the timer or IO queues
   * (setImmediate, setInterval, setTimeout), so once the promise queue is
   * empty, the vat userspace loses "agency" (the ability to initiate further
   * execution), and waitUntilQuiescent fires. At that point we return
   * control to the supervisor by resolving our return promise.
   *
   * Liveslots specifically guards against userspace reacquiring agency after
   * our return promise is fired: vats are idle between cranks. Metering of
   * the worker guards against userspace performing a synchronous infinite
   * loop (`for (;;) {}`, the dreaded cthulu operator) or an async one
   * (`function again() { return Promise.resolve().then(again); }`), by
   * killing the vat after too much work. Userspace errors during delivery
   * are expressed by calling syscall.resolve to reject the
   * dispatch.deliver(result=) promise ID, which is unrelated to the Promise
   * that `dispatch` returns.
   *
   * Liveslots does the authority to stall a crank indefinitely, by virtue of
   * having access to `waitUntilQuiescent` and `FinalizationRegistry` (to
   * retain agency), and the ability to disable metering (to disable worker
   * termination), but only a buggy liveslots would do this. The kernel is
   * vulnerable to a buggy liveslots never finishing a crank.
   *
   * This `dispatch` function always returns a Promise. It resolves (with
   * nothing) when the crank completes successfully. If it rejects, that
   * indicates the delivery has failed, and the worker should send an
   * ["error", ..] `VatDeliveryResult` back to the kernel (which may elect to
   * terminate the vat). Userspace should not be able to cause the delivery
   * to fail: only a bug in liveslots should trigger a failure.
   *
   * @param {import('./types.js').VatDeliveryObject} delivery
   * @returns {Promise<void>}
   */
  async function dispatch(delivery) {
    // We must short-circuit dispatch to bringOutYourDead here because it has to
    // be async, same for stopVat
    if (delivery[0] === 'bringOutYourDead') {
      return meterControl.runWithoutMeteringAsync(bringOutYourDead);
    } else if (delivery[0] === 'stopVat') {
      return meterControl.runWithoutMeteringAsync(async () =>
        stopVat(delivery[1]),
      );
    } else {
      // Start user code running, record any internal liveslots errors. We do
      // *not* directly wait for the userspace function to complete, nor for
      // any promise it returns to fire.
      const p = Promise.resolve(delivery).then(unmeteredDispatch);

      // Instead, we wait for userspace to become idle by draining the
      // promise queue. We clean up and then examine/return 'p' so any
      // bugs in liveslots that cause an error during
      // unmeteredDispatch (or a 'buildRootObject' that fails to
      // complete in time) will be reported to the supervisor (but
      // only after userspace is idle).
      return gcTools.waitUntilQuiescent().then(async () => {
        afterDispatchActions();
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.race([p, Promise.reject('buildRootObject unresolved')]);
        // the only delivery that pays attention to a user-provided
        // Promise is startVat, so the error message is specialized to
        // the only user problem that could cause the promise to not be
        // settled.
      });
    }
  }
  harden(dispatch);

  // we return 'possiblyDeadSet' for unit tests
  return harden({
    dispatch,
    m,
    testHooks,
  });
}

/**
 * Instantiate the liveslots layer for a new vat and then populate the vat with
 * a new root object and its initial associated object graph, if any.
 *
 * @param {*} syscall  Kernel syscall interface that the vat will have access to
 * @param {*} forVatID  Vat ID label, for use in debug diagostics
 * @param {*} vatPowers
 * @param {import('./types.js').LiveSlotsOptions} liveSlotsOptions
 * @param {*} gcTools { WeakRef, FinalizationRegistry, waitUntilQuiescent }
 * @param {Pick<Console, 'debug' | 'log' | 'info' | 'warn' | 'error'>} [liveSlotsConsole]
 * @param {*} [buildVatNamespace]
 *
 * @returns {*} { dispatch }
 *
 * setBuildRootObject should be called, once, with a function that will
 * create a root object for the new vat The caller provided buildRootObject
 * function produces and returns the new vat's root object:
 *
 * buildRootObject(vatPowers, vatParameters)
 *
 * Within the vat, `import { E } from '@endo/eventual-send'` will
 * provide the E wrapper. For any object x, E(x) returns a proxy object
 * that converts any method invocation into a corresponding eventual send
 * to x. That is, E(x).foo(arg1, arg2) is equivalent to x~.foo(arg1,
 * arg2)
 *
 * If x is the presence in this vat of a remote object (that is, an object
 * outside the vat), this will result in a message send out of the vat via
 * the kernel syscall interface.
 *
 * In the same vein, if x is the presence in this vat of a kernel device,
 * vatPowers.D(x) returns a proxy such that a method invocation on it is
 * translated into the corresponding immediate invocation of the device
 * (using, once again, the kernel syscall interface). D(x).foo(args) will
 * perform an immediate syscall.callNow on the device node.
 */
export function makeLiveSlots(
  syscall,
  forVatID = 'unknown',
  vatPowers = harden({}),
  liveSlotsOptions,
  gcTools,
  liveSlotsConsole = console,
  buildVatNamespace,
) {
  const r = build(
    syscall,
    forVatID,
    vatPowers,
    liveSlotsOptions,
    gcTools,
    liveSlotsConsole,
    buildVatNamespace,
  );
  const { dispatch, possiblyDeadSet, testHooks } = r; // omit 'm'
  return harden({
    dispatch,
    possiblyDeadSet,
    testHooks,
  });
}

// for tests
export function makeMarshaller(syscall, gcTools, vatID = 'forVatID') {
  // @ts-expect-error missing buildVatNamespace param
  const { m } = build(syscall, vatID, {}, {}, gcTools, console);
  return { m };
}
