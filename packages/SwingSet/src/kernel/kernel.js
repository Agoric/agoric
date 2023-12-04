import { assert, Fail } from '@agoric/assert';
import { isNat } from '@endo/nat';
import { importBundle } from '@endo/import-bundle';
import { makeUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';
import { kser, kslot, makeError } from '@agoric/kmarshal';
import { assertKnownOptions } from '../lib/assertOptions.js';
import { foreverPolicy } from '../lib/runPolicies.js';
import { makeVatManagerFactory } from './vat-loader/manager-factory.js';
import { makeVatWarehouse } from './vat-warehouse.js';
import makeDeviceManager from './deviceManager.js';
import makeKernelKeeper from './state/kernelKeeper.js';
import {
  kdebug,
  kdebugEnable,
  legibilizeMessageArgs,
  extractMethod,
} from '../lib/kdebug.js';
import { insistKernelType, parseKernelSlot } from './parseKernelSlots.js';
import { parseVatSlot } from '../lib/parseVatSlots.js';
import { extractSingleSlot, insistCapData } from '../lib/capdata.js';
import { insistMessage, insistVatDeliveryResult } from '../lib/message.js';
import { insistDeviceID, insistVatID } from '../lib/id.js';
import { updateWorkerOptions } from '../lib/workerOptions.js';
import { makeVatOptionRecorder } from '../lib/recordVatOptions.js';
import { makeKernelQueueHandler } from './kernelQueue.js';
import { makeKernelSyscallHandler } from './kernelSyscall.js';
import { makeSlogger, makeDummySlogger } from './slogger.js';
import { makeDummyMeterControl } from './dummyMeterControl.js';
import { getKpidsToRetire } from './cleanup.js';
import { processGCActionSet } from './gc-actions.js';
import { makeVatLoader } from './vat-loader/vat-loader.js';
import { makeDeviceTranslators } from './deviceTranslator.js';
import { notifyTermination } from './notifyTermination.js';
import { makeVatAdminHooks } from './vat-admin-hooks.js';

/**
 * @typedef {import('@agoric/swingset-liveslots').VatDeliveryObject} VatDeliveryObject
 * @typedef {import('@agoric/swingset-liveslots').VatDeliveryResult} VatDeliveryResult
 * @typedef {import('@agoric/swingset-liveslots').VatSyscallObject} VatSyscallObject
 * @typedef {import('@agoric/swingset-liveslots').VatSyscallResult} VatSyscallResult
 */

function abbreviateReplacer(_, arg) {
  if (typeof arg === 'bigint') {
    return Number(arg);
  }
  if (typeof arg === 'string' && arg.length >= 40) {
    // truncate long strings
    return `${arg.slice(0, 15)}...${arg.slice(arg.length - 15)}`;
  }
  return arg;
}

/**
 * Provide the kref of a vat's root object, as if it had been exported.
 *
 * @param {*} kernelKeeper  Kernel keeper managing persistent kernel state.
 * @param {string} vatID  Vat ID of the vat whose root kref is sought.
 *
 * @returns {string} the kref of the root object of the given vat.
 */
export function exportRootObject(kernelKeeper, vatID) {
  insistVatID(vatID);
  const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
  return vatKeeper.mapVatSlotToKernelSlot('o+0');
}

/*
 * Pretend that a vat just exported an object, and increment the refcount on
 * the resulting kref so nothing tries to delete it for being unreferenced.
 */
export function doAddExport(kernelKeeper, fromVatID, vref) {
  insistVatID(fromVatID);
  assert(parseVatSlot(vref).allocatedByVat);
  const vatKeeper = kernelKeeper.provideVatKeeper(fromVatID);
  const kref = vatKeeper.mapVatSlotToKernelSlot(vref);
  // we lie to incrementRefCount (this is really an export, but we pretend
  // it's an import) so it will actually increment the count
  kernelKeeper.incrementRefCount(kref, 'doAddExport', { isExport: false });
  return kref;
}

export default function buildKernel(
  kernelEndowments,
  deviceEndowments,
  kernelRuntimeOptions = {},
) {
  const {
    waitUntilQuiescent,
    kernelStorage,
    debugPrefix,
    vatEndowments,
    slogCallbacks = {},
    makeConsole,
    startSubprocessWorkerNode,
    startXSnap,
    writeSlogObject,
    WeakRef,
    FinalizationRegistry,
    gcAndFinalize,
    bundleHandler,
  } = kernelEndowments;
  deviceEndowments = { ...deviceEndowments }; // copy so we can modify
  const {
    verbose,
    warehousePolicy,
    overrideVatManagerOptions = {},
  } = kernelRuntimeOptions;
  const logStartup = verbose ? console.debug : () => 0;

  const vatAdminRootKref = kernelStorage.kvStore.get('vatAdminRootKref');

  /** @type { KernelSlog } */
  const kernelSlog = writeSlogObject
    ? makeSlogger(slogCallbacks, writeSlogObject)
    : makeDummySlogger(slogCallbacks, makeConsole('disabled slogger'));

  const kernelKeeper = makeKernelKeeper(kernelStorage, kernelSlog);

  /** @type {ReturnType<makeVatWarehouse>} */
  let vatWarehouse;
  let started = false;

  /**
   * @typedef {{
   *   manager: unknown,
   *   translators: ReturnType<makeDeviceTranslators>,
   * }} DeviceInfo
   */
  const ephemeral = {
    /** @type { Map<string, DeviceInfo> } key is deviceID */
    devices: new Map(),
    /** @type {string[]} */
    log: [],
  };

  /**
   * @typedef { (args: SwingSetCapData) => SwingSetCapData } DeviceHook
   * @typedef { string } HookName
   * @typedef { Record<HookName, DeviceHook> } HooksForOneDevice
   * @typedef { string } DeviceID
   * @typedef { Map<DeviceID, HooksForOneDevice> } HooksForAllDevices
   * @type HooksForAllDevices
   */
  const deviceHooks = new Map();

  const optionRecorder = makeVatOptionRecorder(kernelKeeper, bundleHandler);

  // This is a low-level output-only string logger used by old unit tests to
  // see whether vats made progress or not. The array it appends to is
  // available as c.dump().log . New unit tests should instead use the
  // 'result' value returned by c.queueToKref()
  function testLog(...args) {
    const rendered = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg, abbreviateReplacer),
    );
    ephemeral.log.push(rendered.join(''));
  }
  harden(testLog);

  function makeSourcedConsole(vatID) {
    const origConsole = makeConsole(args => {
      const source = args.shift();
      return `${debugPrefix}SwingSet:${source}:${vatID}`;
    });
    return kernelSlog.vatConsole(vatID, origConsole);
  }

  // message flow: vat -> syscall -> acceptanceQueue -> runQueue -> delivery -> vat
  // runQueue and acceptanceQueue entries are {type, more..}. 'more' depends on type:
  // * send: target, msg
  // * notify: vatID, kpid
  // * create-vat: vatID, source, dynamicOptions

  // in the kernel table, promises and resolvers are both indexed by the same
  // value. kernelPromises[promiseID] = { decider, subscribers }

  // The "Vat Powers" are given to vats as arguments of setup(). Liveslots
  // provides them, and more, as the only argument to buildRootObject(). They
  // represent controlled authorities that come from the kernel but that do
  // not go through the syscall mechanism (so they aren't included in the
  // replay transcript), so they must not be particularly stateful. If any of
  // them behave differently from one invocation to the next, the vat code
  // which uses it will not be a deterministic function of the transcript,
  // breaking our orthogonal-persistence model. They can have access to
  // state, but they must not let it influence the data they return to the
  // vat.

  // These will eventually be provided by the in-worker supervisor instead.

  // TODO: ideally the powerless ones are imported by the vat, not passed in
  // an argument.

  const allVatPowers = harden({
    testLog,
  });

  /** @type {(name: string) => string} */
  function vatNameToID(name) {
    const vatID = kernelKeeper.getVatIDForName(name);
    insistVatID(vatID);
    return vatID;
  }

  /** @type {(name: string) => string} */
  function deviceNameToID(name) {
    const deviceID = kernelKeeper.getDeviceIDForName(name);
    insistDeviceID(deviceID);
    return deviceID;
  }

  /** @type {(forVatID: string, what: string) => string} */
  function addImport(forVatID, what) {
    if (!started) {
      throw Error('must do kernel.start() before addImport()');
      // because otherwise we can't get the vatManager
    }
    insistVatID(forVatID);
    const kernelSlot = `${what}`;
    parseKernelSlot(what);
    const vatKeeper = kernelKeeper.provideVatKeeper(forVatID);
    return vatKeeper.mapKernelSlotToVatSlot(kernelSlot);
  }

  function pinObject(kref) {
    kernelKeeper.pinObject(kref);
  }

  function addExport(fromVatID, vatSlot) {
    if (!started) {
      throw Error('must do kernel.start() before addExport()');
      // because otherwise we can't get the vatKeeper
    }
    return doAddExport(kernelKeeper, fromVatID, vatSlot);
  }

  // If `kernelPanic` is set to non-null, vat execution code will throw it as an
  // error at the first opportunity
  let kernelPanic = null;

  /** @type {import('../types-internal.js').KernelPanic} */
  function panic(problem, err = undefined) {
    console.error(`##### KERNEL PANIC: ${problem} #####`);
    kernelPanic = err || Error(`kernel panic ${problem}`);
  }

  const { doSend, doSubscribe, doResolve, resolveToError, queueToKref } =
    makeKernelQueueHandler({ kernelKeeper, panic });

  /**
   * Terminate a vat; that is: delete vat DB state,
   * resolve orphaned promises, notify parent, and
   * shutdown worker.
   *
   * @param {string} vatID
   * @param {boolean} shouldReject
   * @param {SwingSetCapData} info
   */
  async function terminateVat(vatID, shouldReject, info) {
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const critical = vatKeeper.getOptions().critical;
    insistCapData(info);
    // ISSUE: terminate stuff in its own crank like creation?
    // TODO: if a static vat terminates, panic the kernel?
    // TODO: guard against somebody telling vatAdmin to kill a vat twice

    // If a vat is terminated during the initial processCreateVat, the
    // `abortCrank` will have erased all record of the vat, so this
    // check will report 'false'. That's fine, there's no state to
    // clean up.
    if (kernelKeeper.vatIsAlive(vatID)) {
      // Reject all promises decided by the vat, making sure to capture the list
      // of kpids before that data is deleted.
      const deadPromises = [...kernelKeeper.enumeratePromisesByDecider(vatID)];
      kernelKeeper.cleanupAfterTerminatedVat(vatID);
      for (const kpid of deadPromises) {
        resolveToError(kpid, makeError('vat terminated'), vatID);
      }
    }
    if (critical) {
      // The following error construction is a bit awkward, but (1) it saves us
      // from doing unmarshaling while in the kernel, while (2) it protects
      // against the info not actually encoding an error, but (3) it still
      // provides some diagnostic information back to the host, and (4) this
      // should happen rarely enough that if you have to do a little bit of
      // extra interpretive work on the receiving end to diagnose the problem,
      // it's going to be a small cost compared to the trouble you're probably
      // already in anyway if this happens.
      panic(`critical vat ${vatID} failed`, Error(info.body));
      return;
    }
    if (vatAdminRootKref) {
      // static vat termination can happen before vat admin vat exists
      notifyTermination(
        vatID,
        vatAdminRootKref,
        shouldReject,
        info,
        queueToKref,
      );
    } else {
      console.log(
        `warning: vat ${vatID} terminated without a vatAdmin to report to`,
      );
    }

    // worker needs to be stopped, if any
    await vatWarehouse.stopWorker(vatID);
  }

  function notifyMeterThreshold(meterID) {
    // tell vatAdmin that a meter has dropped below its notifyThreshold
    const { remaining } = kernelKeeper.getMeter(meterID);
    assert.typeof(vatAdminRootKref, 'string', 'vatAdminRootKref missing');
    queueToKref(
      vatAdminRootKref,
      'meterCrossedThreshold',
      [meterID, remaining],
      'logFailure',
    );
  }

  // TODO: instead of using a kernel-wide flag here, consider making each
  // VatManager responsible for remembering if/when a KernelSyscallResult
  // reports a non-'ok' status and therefore the vat is toast. Then the
  // delivery handler could ask the manager (or vat-warehouse) afterwards for
  // the sticky-fatal state. If we did that, we wouldn't need
  // `vatFatalSyscall`. We'd still need a way for `requestTermination` to
  // work, though.

  // These two flags are reset at the beginning of each
  // deliverAndLogToVat, set by syscall implementations, and
  // incorporated into the DeliveryStatus result of deliverAndLogToVat

  let vatRequestedTermination;
  let illegalSyscall;

  // this is called for syscall.exit, which allows the crank to complete
  // before terminating the vat
  function requestTermination(vatID, reject, info) {
    insistCapData(info);
    vatRequestedTermination = { reject, info };
  }

  // this is called for vat-fatal syscall errors, which aborts the crank and
  // then terminates the vat
  function vatFatalSyscall(vatID, problem) {
    illegalSyscall = { vatID, info: makeError(problem) };
  }

  const kernelSyscallHandler = makeKernelSyscallHandler({
    kernelKeeper,
    ephemeral,
    doSend,
    doSubscribe,
    doResolve,
    requestTermination,
    deviceHooks,
  });

  /**
   *
   * @typedef { import('@agoric/swingset-liveslots').MeterConsumption } MeterConsumption
   * @typedef { import('../types-internal.js').MeterID } MeterID
   *
   *  Any delivery crank (send, notify, start-vat.. anything which is allowed
   *  to make vat delivery) emits one of these status events if a delivery
   *  actually happened.
   *
   * @typedef { [string, any[]] } RawMethargs
   * @typedef { {
   *    metering?: MeterConsumption | null, // delivery metering results
   *    deliveryError?: string, // delivery failed
   *    illegalSyscall: { vatID: VatID, info: SwingSetCapData } | undefined,
   *    vatRequestedTermination: { reject: boolean, info: SwingSetCapData } | undefined,
   *  } } DeliveryStatus
   * @typedef { {
   *    abort?: boolean, // changes should be discarded, not committed
   *    consumeMessage?: boolean, // discard the aborted delivery
   *    didDelivery?: VatID, // we made a delivery to a vat, for run policy and save-snapshot
   *    computrons?: BigInt, // computron count for run policy
   *    meterID?: string, // deduct those computrons from a meter
   *    decrementReapCount?: { vatID: VatID }, // the reap counter should decrement
   *    terminate?: { vatID: VatID, reject: boolean, info: SwingSetCapData }, // terminate vat, notify vat-admin
   *    vatAdminMethargs?: RawMethargs, // methargs to notify vat-admin about create/upgrade results
   * } } CrankResults
   */

  const NO_DELIVERY_CRANK_RESULTS = harden({});

  /**
   * Perform one delivery to a vat.
   *
   * @param {VatID} vatID
   * @param {KernelDeliveryObject} kd
   * @param {VatDeliveryObject} vd
   */
  async function deliverAndLogToVat(vatID, kd, vd) {
    vatRequestedTermination = undefined;
    illegalSyscall = undefined;
    assert(vatWarehouse.lookup(vatID));
    // Ensure that the vatSlogger is available before clist translation.
    const vs = kernelSlog.provideVatSlogger(vatID).vatSlog;
    await null;
    try {
      /** @type { VatDeliveryResult } */
      const deliveryResult = await vatWarehouse.deliverToVat(vatID, kd, vd, vs);
      insistVatDeliveryResult(deliveryResult);
      // const [ ok, problem, usage ] = deliveryResult;

      /** @type {DeliveryStatus} */
      const status = { illegalSyscall, vatRequestedTermination };
      // we get metering for all non-throwing deliveries (both 'ok'
      // and 'error') except for hard metering faults
      status.metering = deliveryResult[2];
      if (deliveryResult[0] !== 'ok') {
        // kernel-panic -worthy delivery problems (unexpected worker
        // exit, pipe problems) are signalled with an exception, so
        // non-'ok' status means:
        //
        // * hard metering fault (E_TOO_MUCH_COMPUTATION or
        //   E_STACK_OVERFLOW or E_NOT_ENOUGH_MEMORY), and the worker is
        //   dead
        // * a bug in the vat's dispatch() or liveslots, and we
        //   shouldn't trust the surviving worker
        // * Liveslots observed a vat-fatal error, like startVat()
        //   noticed buildRootObject() did not restore all virtual
        //   Kinds, and we're not going to use the worker
        //
        // So in all cases, our caller should abandon the worker.
        await vatWarehouse.stopWorker(vatID);
        // TODO: does stopWorker work if the worker process just died?
        status.deliveryError = deliveryResult[1];
      }
      return harden(status);
    } catch (e) {
      // log so we get a stack trace before we panic the kernel
      console.error(`error in kernel.deliver:`, e);
      throw e;
    }
  }

  /**
   * Given the results of a delivery, build a set of instructions for
   * finishing up the crank. This is a helper function whose return
   * value should be further customized as needed by each run-queue
   * event handler.
   *
   * Two flags influence this:
   *  `decrementReapCount` is used for deliveries that run userspace code
   *  `meterID` means we should check a meter
   *
   * @param {VatID} vatID
   * @param {DeliveryStatus} status
   * @param {boolean} decrementReapCount
   * @param {MeterID} [meterID]
   * @returns {CrankResults}
   */
  function deliveryCrankResults(vatID, status, decrementReapCount, meterID) {
    let meterUnderrun = false;
    let computrons;
    if (status.metering?.compute) {
      computrons = BigInt(status.metering.compute);
    }
    // TODO metering.allocate, some day

    /** @type {CrankResults} */
    const results = { didDelivery: vatID, computrons };

    if (meterID && computrons) {
      results.meterID = meterID; // decrement meter when we're done
      if (!kernelKeeper.checkMeter(meterID, computrons)) {
        meterUnderrun = true; // vat used too much, oops
      }
    }

    // note: these conditionals express a priority order: the
    // consequences of an illegal syscall take precedence over a vat
    // requesting termination, etc

    if (status.illegalSyscall) {
      // For now, vat errors both rewind changes and terminate the
      // vat. Some day, they might rewind changes but then suspend the
      // vat.
      results.abort = true;
      const { info } = status.illegalSyscall;
      results.terminate = { vatID, reject: true, info };
    } else if (status.deliveryError) {
      results.abort = true;
      const info = makeError(status.deliveryError);
      results.terminate = { vatID, reject: true, info };
    } else if (meterUnderrun) {
      results.abort = true;
      const info = makeError('meter underflow, vat terminated');
      results.terminate = { vatID, reject: true, info };
    } else if (status.vatRequestedTermination) {
      if (status.vatRequestedTermination.reject) {
        results.abort = true; // vatPowers.exitWithFailure wants rewind
      }
      results.terminate = { vatID, ...status.vatRequestedTermination };
    }

    if (decrementReapCount && !(results.abort || results.terminate)) {
      results.decrementReapCount = { vatID };
    }

    // We leave results.consumeMessage up to the caller.  Send failures
    // never set results.consumeMessage (we allow the delivery to be
    // re-attempted and it splats against the now-dead vat, or doesn't
    // get delivered until the vat is unsuspended).  But failures in
    // e.g. startVat will want to set consumeMessage.

    return harden(results);
  }

  /**
   * Deliver one message to a vat.
   *
   * @param {VatID} vatID
   * @param {string} target
   * @param {Message} msg
   * @returns {Promise<CrankResults>}
   */
  async function processSend(vatID, target, msg) {
    insistMessage(msg);
    kernelKeeper.incStat('dispatches');
    kernelKeeper.incStat('dispatchDeliver');

    const vatInfo = vatWarehouse.lookup(vatID);
    assert(vatInfo, 'routeSendEvent() should have noticed dead vat');
    const { enablePipelining, meterID } = vatInfo;

    /** @type { KernelDeliveryMessage } */
    const kd = harden(['message', target, msg]);
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);

    if (enablePipelining && msg.result) {
      // TODO maybe move after deliverAndLogToVat??
      kernelKeeper.requeueKernelPromise(msg.result);
    }

    const status = await deliverAndLogToVat(vatID, kd, vd);
    return deliveryCrankResults(vatID, status, true, meterID);
  }

  /**
   *
   * @param {RunQueueEventNotify} message
   * @returns {Promise<CrankResults>}
   */
  async function processNotify(message) {
    const { vatID, kpid } = message;
    insistVatID(vatID);
    insistKernelType('promise', kpid);
    kernelKeeper.incStat('dispatches');
    const vatInfo = vatWarehouse.lookup(vatID);
    if (!vatInfo) {
      kdebug(`dropping notify of ${kpid} to ${vatID} because vat is dead`);
      return NO_DELIVERY_CRANK_RESULTS;
    }
    const { meterID } = vatInfo;

    const p = kernelKeeper.getKernelPromise(kpid);
    kernelKeeper.incStat('dispatchNotify');
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    p.state !== 'unresolved' || Fail`spurious notification ${kpid}`;
    /** @type { KernelDeliveryOneNotify[] } */
    const resolutions = [];
    if (!vatKeeper.hasCListEntry(kpid)) {
      kdebug(`vat ${vatID} has no c-list entry for ${kpid}`);
      kdebug(`skipping notify of ${kpid} because it's already been done`);
      return NO_DELIVERY_CRANK_RESULTS;
    }
    const targets = getKpidsToRetire(kernelKeeper, kpid, p.data);
    if (targets.length === 0) {
      kdebug(`no kpids to retire`);
      kdebug(`skipping notify of ${kpid} because it's already been done`);
      return NO_DELIVERY_CRANK_RESULTS;
    }
    for (const toResolve of targets) {
      const { state, data } = kernelKeeper.getKernelPromise(toResolve);
      resolutions.push([toResolve, { state, data }]);
    }
    /** @type { KernelDeliveryNotify } */
    const kd = harden(['notify', resolutions]);
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    vatKeeper.deleteCListEntriesForKernelSlots(targets);
    const status = await deliverAndLogToVat(vatID, kd, vd);
    return deliveryCrankResults(vatID, status, true, meterID);
  }

  /**
   *
   * @param {RunQueueEventDropExports | RunQueueEventRetireImports | RunQueueEventRetireExports} message
   * @returns {Promise<CrankResults>}
   */
  async function processGCMessage(message) {
    // used for dropExports, retireExports, and retireImports
    const { type, vatID, krefs } = message;
    // console.log(`-- processGCMessage(${vatID} ${type} ${krefs.join(',')})`);
    insistVatID(vatID);
    if (!vatWarehouse.lookup(vatID)) {
      return NO_DELIVERY_CRANK_RESULTS; // can't collect from the dead
    }
    /** @type { KernelDeliveryDropExports | KernelDeliveryRetireExports | KernelDeliveryRetireImports } */
    const kd = harden([type, krefs]);
    if (type === 'retireExports') {
      for (const kref of krefs) {
        // const rc = kernelKeeper.getObjectRefCount(kref);
        // console.log(`   ${kref}: ${rc.reachable},${rc.recognizable}`);
        kernelKeeper.deleteKernelObject(kref);
        // console.log(`   deleted ${kref}`);
      }
    }
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    const status = await deliverAndLogToVat(vatID, kd, vd);
    return deliveryCrankResults(vatID, status, false); // no meterID
  }

  /**
   *
   * @param {RunQueueEventBringOutYourDead} message
   * @returns {Promise<CrankResults>}
   */
  async function processBringOutYourDead(message) {
    const { type, vatID } = message;
    // console.log(`-- processBringOutYourDead(${vatID})`);
    insistVatID(vatID);
    if (!vatWarehouse.lookup(vatID)) {
      return NO_DELIVERY_CRANK_RESULTS; // can't collect from the dead
    }
    /** @type { KernelDeliveryBringOutYourDead } */
    const kd = harden([type]);
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    const status = await deliverAndLogToVat(vatID, kd, vd);
    return deliveryCrankResults(vatID, status, false); // no meter
  }

  /**
   * The 'startVat' event is queued by `initializeKernel` for all static vats,
   * so that we execute their bundle imports and call their `buildRootObject`
   * functions in a transcript context.  The consequence of this is that if
   * there are N static vats, N 'startVat' events will be the first N events on
   * the initial run queue.  For dynamic vats, the handler of the 'create-vat'
   * event, `processCreateVat`, calls `processStartVat` directly, rather than
   * enqueing 'startVat', so that vat startup happens promptly after creation
   * and so that there are no intervening events in the run queue between vat
   * creation and vat startup (it would probably not be a problem if there were,
   * but doing it this way simply guarantees there won't be such a problem
   * without requiring any further analysis to be sure).
   *
   * @param {RunQueueEventStartVat} message
   * @returns {Promise<CrankResults>}
   */
  async function processStartVat(message) {
    const { vatID, vatParameters } = message;
    // console.log(`-- processStartVat(${vatID})`);
    insistVatID(vatID);
    insistCapData(vatParameters);
    const vatInfo = vatWarehouse.lookup(vatID);
    if (!vatInfo) {
      kdebug(`vat ${vatID} terminated before startVat delivered`);
      return NO_DELIVERY_CRANK_RESULTS;
    }
    const { meterID } = vatInfo;
    /** @type { KernelDeliveryStartVat } */
    const kd = harden(['startVat', vatParameters]);
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    // decref slots now that create-vat is off run-queue
    for (const kref of vatParameters.slots) {
      kernelKeeper.decrementRefCount(kref, 'create-vat-event');
    }

    const status = await deliverAndLogToVat(vatID, kd, vd);
    // note: if deliveryCrankResults() learns to suspend vats,
    // startVat errors should still terminate them
    const results = harden({
      ...deliveryCrankResults(vatID, status, true, meterID),
      consumeMessage: true,
    });
    return results;
  }

  /**
   *
   * @param {RunQueueEventCreateVat} message
   * @returns {Promise<CrankResults>}
   */
  async function processCreateVat(message) {
    assert(vatAdminRootKref, `initializeKernel did not set vatAdminRootKref`);
    const { vatID, source, vatParameters, dynamicOptions } = message;
    insistCapData(vatParameters);
    kernelKeeper.addDynamicVatID(vatID);
    await optionRecorder.recordDynamic(vatID, source, dynamicOptions);

    // createDynamicVat makes the worker, installs lockdown and
    // supervisor, but does not load the vat bundle yet. It can fail
    // if the options are bad, worker cannot be launched, lockdown or
    // supervisor bundles are bad.

    try {
      await vatWarehouse.createDynamicVat(vatID);
    } catch (err) {
      console.log('error during createDynamicVat', err);
      const info = makeError(`${err}`);
      const results = {
        didDelivery: vatID, // ok, it failed, but we did spend the time
        abort: true, // delete partial vat state
        consumeMessage: true, // don't repeat createVat
        terminate: { vatID, reject: true, info },
      };
      return harden(results);
    }

    // If we managed to make a worker, use processStartVat() to invoke
    // dispatch.startVat . The CrankResults it returns may signal an
    // error like meter underflow during startVat, or failure to
    // redefine all Kinds.

    /** @type { RunQueueEventStartVat } */
    const startVat = { type: 'startVat', vatID, vatParameters };
    const startResults = await processStartVat(startVat);
    if (startResults.terminate) {
      const consumeMessage = true;
      return harden({ ...startResults, consumeMessage });
    }

    // if the startVat CrankResults were happy, we should report them
    // (for meter deductions and runPolicy computrons), but add a
    // success message for vat-admin, which also gives it access to
    // the new vat's root object

    const kernelRootObjSlot = exportRootObject(kernelKeeper, vatID);
    const arg = { rootObject: kslot(kernelRootObjSlot) };
    /** @type { RawMethargs } */
    const vatAdminMethargs = ['newVatCallback', [vatID, arg]];
    return harden({ ...startResults, vatAdminMethargs });
  }

  function setKernelVatOption(vatID, option, value) {
    switch (option) {
      case 'reapInterval': {
        if (value === 'never' || isNat(value)) {
          const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
          vatKeeper.updateReapInterval(value);
        } else {
          console.log(`WARNING: invalid reapInterval value`, value);
        }
        return true;
      }
      default:
        return false;
    }
  }

  /**
   *
   * @param {RunQueueEventChangeVatOptions} message
   * @returns {Promise<CrankResults>}
   */
  async function processChangeVatOptions(message) {
    const { vatID, options } = message;
    insistVatID(vatID);
    if (!vatWarehouse.lookup(vatID)) {
      return NO_DELIVERY_CRANK_RESULTS; // vat is dead, ignore
    }

    /** @type { Record<string, unknown> } */
    const optionsForVat = {};
    let haveOptionsForVat = false;
    for (const option of Object.getOwnPropertyNames(options)) {
      if (!setKernelVatOption(vatID, option, options[option])) {
        optionsForVat[option] = options[option];
        haveOptionsForVat = true;
      }
    }
    if (!haveOptionsForVat) {
      return NO_DELIVERY_CRANK_RESULTS;
    }

    /** @type { KernelDeliveryChangeVatOptions } */
    const kd = harden(['changeVatOptions', optionsForVat]);
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    const status = await deliverAndLogToVat(vatID, kd, vd);
    const results = deliveryCrankResults(vatID, status, false); // no meter
    return harden({ ...results, consumeMessage: true });
  }

  function addComputrons(computrons1, computrons2) {
    if (computrons1 !== undefined) {
      assert.typeof(computrons1, 'bigint');
    }
    if (computrons2 !== undefined) {
      assert.typeof(computrons2, 'bigint');
    }
    // leave undefined if both deliveries lacked numbers
    if (computrons1 !== undefined || computrons2 !== undefined) {
      return (computrons1 || 0n) + (computrons2 || 0n);
    }
    return undefined;
  }

  /**
   * @param {RunQueueEventUpgradeVat} message
   * @returns {Promise<CrankResults>}
   */
  async function processUpgradeVat(message) {
    assert(vatAdminRootKref, 'initializeKernel did not set vatAdminRootKref');
    const { vatID, upgradeID, bundleID, vatParameters, upgradeMessage } =
      message;
    insistCapData(vatParameters);
    assert.typeof(upgradeMessage, 'string');

    const vatInfo = vatWarehouse.lookup(vatID);
    if (!vatInfo) {
      return NO_DELIVERY_CRANK_RESULTS; // vat terminated already
    }
    const { meterID } = vatInfo;
    let computrons;
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const oldIncarnation = vatKeeper.getIncarnationNumber();
    const disconnectionObject = makeUpgradeDisconnection(
      upgradeMessage,
      oldIncarnation,
    );
    const disconnectionCapData = kser(disconnectionObject);

    /**
     * Terminate the vat and translate internal-delivery results into
     * abort-without-termination results for the upgrade delivery.
     *
     * @param {CrankResults} badDeliveryResults
     * @param {SwingSetCapData} errorCapData
     * @returns {Promise<CrankResults>}
     */
    const abortUpgrade = async (badDeliveryResults, errorCapData) => {
      // get rid of the worker, so the next delivery to this vat will
      // re-create one from the previous state
      await vatWarehouse.stopWorker(vatID);

      // notify vat-admin of the failed upgrade without revealing error details
      insistCapData(errorCapData);
      // const error = kunser(errorCapData);
      const error = Error('vat-upgrade failure');
      /** @type {RawMethargs} */
      const vatAdminMethargs = [
        'vatUpgradeCallback',
        [upgradeID, false, error],
      ];

      const results = harden({
        ...badDeliveryResults,
        computrons, // still report computrons
        abort: true, // always unwind
        consumeMessage: true, // don't repeat the upgrade
        terminate: undefined, // do *not* terminate the vat
        vatAdminMethargs,
      });
      return results;
    };

    // cleanup on behalf of the worker
    // This used to be handled by a stopVat delivery to the vat itself,
    // but the implementation of that was cut to the bone
    // in commits like 91480dee8e48ae26c39c420febf73b93deba6ea5
    // basically reverting 1cfbeaa3c925d0f8502edfb313ecb12a1cab5eac
    // and then ultimately moved to the kernel in a MUCH diminished form
    // (see #5342 and #6650, and testUpgrade in
    // {@link ../../test/upgrade/test-upgrade.js}).
    // We hope to eventually add back correct sophisticated logic
    // by e.g. having liveslots sweep the database when restoring a vat.

    // send BOYD so the terminating vat has one last chance to clean
    // up, drop imports, and delete durable data.
    // If a vat is so broken it can't do BOYD, we can make this optional.
    /** @type { import('../types-external.js').KernelDeliveryBringOutYourDead } */
    const boydKD = harden(['bringOutYourDead']);
    const boydVD = vatWarehouse.kernelDeliveryToVatDelivery(vatID, boydKD);
    const boydStatus = await deliverAndLogToVat(vatID, boydKD, boydVD);
    const boydResults = deliveryCrankResults(vatID, boydStatus, false);

    // we don't meter bringOutYourDead since no user code is running, but we
    // still report computrons to the runPolicy
    computrons = addComputrons(computrons, boydResults.computrons);

    // In the unexpected event that there is a problem during this
    // upgrade-internal BOYD, the appropriate response isn't fully
    // clear. We currently opt to translate a `terminate` result into a
    // non-terminating `abort` that unwinds the upgrade delivery, and to
    // ignore a non-terminate `abort` result. This is expected to change
    // in the future, especially if we ever need some kind of emergency/
    // manual upgrade (which might involve something like throwing an
    // error to prompt a kernel panic if the bad vat is marked critical).
    // There's a good analysis at
    // https://github.com/Agoric/agoric-sdk/pull/7244#discussion_r1153633902
    if (boydResults.terminate) {
      console.log(
        `WARNING: vat ${vatID} failed to upgrade from incarnation ${oldIncarnation} (BOYD)`,
      );
      const { info: errorCapData } = boydResults.terminate;
      const results = await abortUpgrade(boydResults, errorCapData);
      return results;
    }

    // reject all promises for which the vat was decider
    for (const kpid of kernelKeeper.enumeratePromisesByDecider(vatID)) {
      resolveToError(kpid, disconnectionCapData, vatID);
    }

    // simulate an abandonExports syscall from the vat,
    // without making an *actual* syscall that could pollute logs
    const abandonedObjects = [
      ...kernelKeeper.enumerateNonDurableObjectExports(vatID),
    ];
    for (const { kref, vref } of abandonedObjects) {
      /** @see translateAbandonExports in {@link ./vatTranslator.js} */
      vatKeeper.deleteCListEntry(kref, vref);
      /** @see abandonExports in {@link ./kernelSyscall.js} */
      kernelKeeper.orphanKernelObject(kref, vatID);
    }

    // cleanup done, now we reset the worker to a clean state with no
    // transcript or snapshot and prime everything for the next incarnation.

    const newIncarnation = await vatWarehouse.beginNewWorkerIncarnation(vatID);
    // update source and bundleIDs, store back to vat metadata
    const source = { bundleID };
    const origOptions = vatKeeper.getOptions();
    const workerOptions = await updateWorkerOptions(origOptions.workerOptions, {
      bundleHandler,
    });
    const vatOptions = harden({ ...origOptions, workerOptions });
    vatKeeper.setSourceAndOptions(source, vatOptions);
    // TODO: decref the bundleID once setSourceAndOptions increfs it

    // pause, take a deep breath, appreciate this moment of silence
    // between the old and the new. this moment will never come again.

    // deliver a startVat with the new vatParameters
    /** @type { import('../types-external.js').KernelDeliveryStartVat } */
    const startVatKD = harden(['startVat', vatParameters]);
    const startVatVD = vatWarehouse.kernelDeliveryToVatDelivery(
      vatID,
      startVatKD,
    );
    // decref vatParameters now that translation did incref
    for (const kref of vatParameters.slots) {
      kernelKeeper.decrementRefCount(kref, 'upgrade-vat-event');
    }
    const startVatStatus = await deliverAndLogToVat(
      vatID,
      startVatKD,
      startVatVD,
    );
    const startVatResults = deliveryCrankResults(vatID, startVatStatus, false);
    computrons = addComputrons(computrons, startVatResults.computrons);

    if (startVatResults.terminate) {
      // abort and unwind just like above
      console.log(
        `WARNING: vat ${vatID} failed to upgrade from incarnation ${oldIncarnation} (startVat)`,
      );
      const { info: errorCapData } = startVatResults.terminate;
      const results = await abortUpgrade(startVatResults, errorCapData);
      return results;
    }

    console.log(
      `vat ${vatID} upgraded from incarnation ${oldIncarnation} to ${newIncarnation} with source ${bundleID}`,
    );

    const args = [upgradeID, true, undefined, newIncarnation];
    /** @type {RawMethargs} */
    const vatAdminMethargs = ['vatUpgradeCallback', args];
    const results = harden({
      computrons,
      meterID, // for the startVat
      vatAdminMethargs,
    });
    return results;
  }

  function legibilizeMessage(message) {
    if (message.type === 'send') {
      const msg = message.msg;
      const [method, argList] = legibilizeMessageArgs(msg.methargs);
      const result = msg.result ? msg.result : 'null';
      return `@${message.target} <- ${method}(${argList}) : @${result}`;
    } else if (message.type === 'notify') {
      return `notify(vatID: ${message.vatID}, kpid: @${message.kpid})`;
    } else if (message.type === 'create-vat') {
      // prettier-ignore
      return `create-vat ${message.vatID} opts: ${JSON.stringify(message.dynamicOptions)} vatParameters: ${JSON.stringify(message.vatParameters)}`;
    } else if (message.type === 'upgrade-vat') {
      // prettier-ignore
      return `upgrade-vat ${message.vatID} upgradeID: ${message.upgradeID} vatParameters: ${JSON.stringify(message.vatParameters)}`;
    } else if (message.type === 'changeVatOptions') {
      // prettier-ignore
      return `changeVatOptions ${message.vatID} options: ${JSON.stringify(message.options)}`;
      // eslint-disable-next-line no-use-before-define
    } else if (gcMessages.includes(message.type)) {
      // prettier-ignore
      return `${message.type} ${message.vatID} ${message.krefs.map(e=>`@${e}`).join(' ')}`;
    } else if (
      message.type === 'bringOutYourDead' ||
      message.type === 'startVat'
    ) {
      return `${message.type} ${message.vatID}`;
    } else {
      return `unknown message type ${message.type}`;
    }
  }

  /**
   * routeSend(message) figures out where a 'send' event should go. If the
   * message needs to be queued (it is sent to an unresolved promise without
   * a pipelining decider), this queues it, and returns null. If the message
   * goes splat against a dead vat or a non-deliverable resolved promise,
   * this rejects any result promise, and returns null. Otherwise it returns
   * the vatID and actual target to which it should be delivered. If the
   * original target was a promise that has been fulfilled to an object,
   * this returns that settled object.
   *
   * This does not decrement any refcounts. The caller should do that.
   *
   * @param {RunQueueEventSend} message
   * @returns {{ vatID: VatID | null, target: string } | null}
   */
  function routeSendEvent(message) {
    const { target, msg } = message;
    const { type } = parseKernelSlot(target);
    ['object', 'promise'].includes(type) ||
      Fail`unable to send() to slot.type ${type}`;

    function splat(error) {
      if (msg.result) {
        resolveToError(msg.result, error);
      }
      return null; // message isn't going to a vat
    }

    function send(targetObject) {
      const vatID = kernelKeeper.ownerOfKernelObject(targetObject);
      if (!vatID) {
        return splat(makeError('vat terminated'));
      }
      return { vatID, target: targetObject };
    }

    function requeue() {
      // message will be requeued, not sent to a vat right now
      return { vatID: null, target };
    }

    if (type === 'object') {
      return send(target);
    }
    // else type === 'promise'
    const kp = kernelKeeper.getKernelPromise(target);
    switch (kp.state) {
      case 'fulfilled': {
        const targetSlot = extractSingleSlot(kp.data);
        if (targetSlot && parseKernelSlot(targetSlot).type === 'object') {
          return send(targetSlot);
        }
        // TODO: maybe mimic (3).foo(): "TypeError: XX.foo is not a function"
        const method = extractMethod(msg.methargs);
        const s = `data is not callable, has no method ${method}`;
        return splat(makeError(s));
      }
      case 'rejected': {
        // TODO maybe simpler to redirect msg.result to kp, if we had redirect
        return splat(kp.data);
      }
      case 'unresolved': {
        if (!kp.decider) {
          return requeue();
        } else {
          insistVatID(kp.decider);
          const deciderVat = vatWarehouse.lookup(kp.decider);
          if (!deciderVat) {
            // decider is dead
            return splat(makeError('vat terminated'));
          }
          if (deciderVat.enablePipelining) {
            return { vatID: kp.decider, target };
          }
          return requeue();
        }
      }
      default:
        throw Fail`unknown promise resolution '${kp.state}'`;
    }
  }

  function decrementSendEventRefCount(message) {
    kernelKeeper.decrementRefCount(message.target, `deq|msg|t`);
    if (message.msg.result) {
      kernelKeeper.decrementRefCount(message.msg.result, `deq|msg|r`);
    }
    let idx = 0;
    for (const argSlot of message.msg.methargs.slots) {
      kernelKeeper.decrementRefCount(argSlot, `deq|msg|s${idx}`);
      idx += 1;
    }
  }

  function decrementNotifyEventRefCount(message) {
    kernelKeeper.decrementRefCount(message.kpid, `deq|notify`);
  }

  const gcMessages = ['dropExports', 'retireExports', 'retireImports'];

  /**
   * @typedef { import('../types-internal.js').VatID } VatID
   * @typedef { import('../types-internal.js').InternalDynamicVatOptions } InternalDynamicVatOptions
   *
   * @typedef { import('../types-internal.js').RunQueueEventNotify } RunQueueEventNotify
   * @typedef { import('../types-internal.js').RunQueueEventSend } RunQueueEventSend
   * @typedef { import('../types-internal.js').RunQueueEventCreateVat } RunQueueEventCreateVat
   * @typedef { import('../types-internal.js').RunQueueEventUpgradeVat } RunQueueEventUpgradeVat
   * @typedef { import('../types-internal.js').RunQueueEventChangeVatOptions } RunQueueEventChangeVatOptions
   * @typedef { import('../types-internal.js').RunQueueEventStartVat } RunQueueEventStartVat
   * @typedef { import('../types-internal.js').RunQueueEventDropExports } RunQueueEventDropExports
   * @typedef { import('../types-internal.js').RunQueueEventRetireExports } RunQueueEventRetireExports
   * @typedef { import('../types-internal.js').RunQueueEventRetireImports } RunQueueEventRetireImports
   * @typedef { import('../types-internal.js').RunQueueEventNegatedGCAction } RunQueueEventNegatedGCAction
   * @typedef { import('../types-internal.js').RunQueueEventBringOutYourDead } RunQueueEventBringOutYourDead
   * @typedef { import('../types-internal.js').RunQueueEvent } RunQueueEvent
   */

  /**
   *
   * Dispatch one delivery event. Eventually, this will be called in a
   * "delivery crank" for a DeliveryEvent, after the scheduler chooses a
   * vat with a non-empty vat-input-queue, and we'll know the target vat
   * ahead of time. For now, this is called for each run-queue event, so
   * 'send' does not yet know which vat will be involved (if any).
   *
   * @param {RunQueueEvent} message
   * @returns {Promise<CrankResults>}
   */
  async function deliverRunQueueEvent(message) {
    // Decref everything in the message, under the assumption that most of
    // the time we're delivering to a vat or answering the result promise
    // with an error. If we wind up queueing it on a promise, we'll
    // re-increment everything there.

    // .vatID is present on all RunQueueEvents except 'send', which gets it
    // from routeSendEvent. Eventually, every DeliveryEvent will have a
    // specific vatID and this will be provided as an argument
    let vatID;
    if (message.type !== 'send') {
      vatID = message.vatID;
    }

    let deliverP = NO_DELIVERY_CRANK_RESULTS;

    // The common action should be delivering events to the vat. Any references
    // in the events should no longer be the kernel's responsibility and the
    // refcounts should be decremented
    if (message.type === 'send') {
      const route = routeSendEvent(message);
      if (!route) {
        // Message went splat
        decrementSendEventRefCount(message);
      } else {
        vatID = route.vatID;
        if (vatID) {
          decrementSendEventRefCount(message);
          deliverP = processSend(vatID, route.target, message.msg);
        } else {
          // Message is requeued and stays the kernel's responsibility, do not
          // decrement refcounts in this case
          kernelKeeper.addMessageToPromiseQueue(route.target, message.msg);
        }
      }
      // vatID will be undefined for splat or requeue, else vat of deliverry
    } else if (message.type === 'notify') {
      decrementNotifyEventRefCount(message);
      deliverP = processNotify(message);
    } else if (message.type === 'create-vat') {
      // creating a new dynamic vat will immediately do start-vat
      deliverP = processCreateVat(message);
    } else if (message.type === 'startVat') {
      deliverP = processStartVat(message);
    } else if (message.type === 'upgrade-vat') {
      deliverP = processUpgradeVat(message);
    } else if (message.type === 'changeVatOptions') {
      deliverP = processChangeVatOptions(message);
    } else if (message.type === 'bringOutYourDead') {
      deliverP = processBringOutYourDead(message);
    } else if (message.type === 'negated-gc-action') {
      // processGCActionSet pruned some negated actions, but had no GC
      // action to perform. Record the DB changes in their own crank.
    } else if (gcMessages.includes(message.type)) {
      deliverP = processGCMessage(message);
    } else {
      Fail`unable to process message.type ${message.type}`;
    }

    // this always returns a CrankResults, even if it's just
    // NO_DELIVERY_CRANK_RESULTS
    const results = await deliverP;
    return results;
  }

  /**
   * @param {RunQueueEvent} message
   * @returns {Promise<PolicyInput>}
   */
  async function processDeliveryMessage(message) {
    kdebug('');
    // prettier-ignore
    kdebug(`processQ crank ${kernelKeeper.getCrankNumber()} ${JSON.stringify(message)}`);
    kdebug(legibilizeMessage(message));
    kernelSlog.write({
      type: 'crank-start',
      crankType: 'delivery',
      crankNum: kernelKeeper.getCrankNumber(),
      message,
    });
    /** @type { PolicyInput } */
    let policyInput = ['none', {}];

    // TODO: policyInput=['crank-failed',{}] is meant to cover
    // deliveries which fail so badly we don't get metering data (but
    // which might have taken up considerable time
    // anyways). Previously, this was triggered by meter underflow
    // (which only happens when we have metering, so the metering data
    // is more accurate and should be reported directly), or for a
    // delivery failure (deliveryResult[0]!=='ok') (which means hard
    // metering fault, bug in liveslots, or startVat() Kind
    // restoration error). We now get metering for everything but hard
    // metering faults.

    // The CrankResults tell us what we should do at end-of-crank:
    // abort/commit the changes, pop the aborted delivery message,
    // deduct a meter, decrement the vat's reapcount, and maybe
    // terminate the vat

    kernelKeeper.establishCrankSavepoint('deliver');
    const crankResults = await deliverRunQueueEvent(message);
    // { abort/commit, deduct, terminate+notify, consumeMessage }

    if (crankResults.didDelivery) {
      if (message.type === 'create-vat') {
        // TODO: create-vat now gets metering, at least for the
        // dispatch.startVat . We should probably tell the policy about
        // the creation too since there's extra overhead (we're
        // launching a new child process, at least, although that
        // sometimes happens randomly because of vat eviction policy
        // which should not affect the in-consensus policyInput)
        policyInput = ['create-vat', {}];
      } else {
        policyInput = ['crank', {}];
      }
    }

    // Deliveries cause syscalls, syscalls might cause errors
    // (Reported through vatFatalSyscall() and the 'illegalSyscall'
    // flag), those errors require the delivery consequences be
    // unwound (and the vat either terminated or suspended
    // somehow). syscall.exit(isfailure=true) requests an
    // unwind. Failed upgrades also require an unwind and set .abort
    // directly.

    if (crankResults.abort) {
      // Errors unwind any changes the vat made, by rolling back to the
      // "deliver" savepoint In addition, the crankResults will either ask for
      // the message to be consumed (without redelivery), or they'll ask for it
      // to be attempted again (so it can go "splat" against a terminated vat,
      // and give the sender the right error). In the latter case, we roll back
      // to the "start" savepoint, established by `run()` or `step()` before the
      // delivery was pulled off the run-queue, undoing the dequeueing.
      kernelKeeper.rollbackCrank(
        crankResults.consumeMessage ? 'deliver' : 'start',
      );
    } else {
      const vatID = crankResults.didDelivery;
      if (vatID) {
        await vatWarehouse.maybeSaveSnapshot(vatID);
      }
    }
    const { computrons, meterID } = crankResults;
    if (computrons) {
      assert.typeof(computrons, 'bigint');
      policyInput[1].computrons = BigInt(computrons);
      if (meterID) {
        const notify = kernelKeeper.deductMeter(meterID, computrons);
        if (notify) {
          notifyMeterThreshold(meterID); // queue notification
        }
      }
    }
    if (crankResults.decrementReapCount) {
      // deliveries cause garbage, garbage needs collection
      const { vatID } = crankResults.decrementReapCount;
      const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
      if (vatKeeper.countdownToReap()) {
        kernelKeeper.scheduleReap(vatID);
      }
    }

    // Vat termination (during delivery) is triggered by an illegal
    // syscall (until/unless we implement suspension somehow), by a
    // metering fault (same), or by syscall.exit()

    if (crankResults.terminate) {
      const { vatID, reject, info } = crankResults.terminate;
      kdebug(`vat terminated: ${JSON.stringify(info)}`);
      kernelSlog.terminateVat(vatID, reject, info);
      // this deletes state, rejects promises, notifies vat-admin
      await terminateVat(vatID, reject, info);
    }

    if (crankResults.vatAdminMethargs) {
      // we use terminateVat() to notify vat-admin about failed vat
      // creation, but vatAdminMethargs for successful vat creation,
      // and failed/successful vat upgrades.
      const [method, args] = crankResults.vatAdminMethargs;
      queueToKref(vatAdminRootKref, method, args, 'logFailure');
    }

    kernelKeeper.processRefcounts();
    const crankNum = kernelKeeper.getCrankNumber();
    kernelKeeper.incrementCrankNumber();
    const { crankhash, activityhash } = kernelKeeper.emitCrankHashes();
    // kernelSlog.write({
    //   type: 'kernel-stats',
    //   stats: kernelKeeper.getStats(),
    // });
    kernelSlog.write({
      type: 'crank-finish',
      crankNum,
      crankhash,
      activityhash,
    });
    return harden(policyInput);
  }

  let processQueueRunning;
  async function tryProcessMessage(processor, message) {
    if (processQueueRunning) {
      console.error(`We're currently already running at`, processQueueRunning);
      Fail`Kernel reentrancy is forbidden`;
    }
    processQueueRunning = Error('here');
    await null;
    try {
      const result = await processor(message);
      processQueueRunning = undefined;
      return result;
    } catch (err) {
      processQueueRunning = undefined;
      // panic() sets the kernelPanic flag which will be checked on the way out
      // by run() or step().
      panic(`error during tryProcessMessage: ${err}`, err);
      // Due to the panic() call, the following return value will be ignored, so
      // don't read deep meaning into the specific value that is returned here
      // (though I believe it is correct in context); the return is present to
      // make eslint happy.
      return ['crank-failed', {}];
    }
  }

  /**
   * @param {RunQueueEvent} message
   * @returns {Promise<PolicyInput>}
   */
  async function processAcceptanceMessage(message) {
    kdebug('');
    // prettier-ignore
    kdebug(`processAcceptanceQ crank ${kernelKeeper.getCrankNumber()} ${message.type}`);
    // kdebug(legibilizeMessage(message));
    kernelSlog.write({
      type: 'crank-start',
      crankType: 'routing',
      crankNum: kernelKeeper.getCrankNumber(),
      message,
    });
    /** @type { PolicyInput } */
    const policyInput = ['none', {}];

    // By default we're moving events from one queue to another. Any references
    // in the events remain the kernel's responsibility and the refcounts persist
    if (message.type === 'send') {
      const route = routeSendEvent(message);
      if (!route) {
        // Message went splat, no longer the kernel's responsibility
        decrementSendEventRefCount(message);
      } else {
        const { vatID, target } = route;
        if (target !== message.target) {
          // Message has been re-targeted, other refcounts stay intact
          kernelKeeper.decrementRefCount(message.target, `deq|msg|t`);
          kernelKeeper.incrementRefCount(target, `enq|msg|t`);
        }
        if (vatID) {
          kernelKeeper.addToRunQueue({
            ...message,
            target,
          });
        } else {
          kernelKeeper.addMessageToPromiseQueue(target, message.msg);
        }
      }
    } else {
      kernelKeeper.addToRunQueue(message);
    }

    kernelKeeper.processRefcounts();
    const crankNum = kernelKeeper.getCrankNumber();
    kernelKeeper.incrementCrankNumber();
    const { crankhash, activityhash } = kernelKeeper.emitCrankHashes();
    kernelSlog.write({
      type: 'crank-finish',
      crankNum,
      crankhash,
      activityhash,
    });

    return harden(policyInput);
  }

  const gcTools = harden({
    WeakRef,
    FinalizationRegistry,
    waitUntilQuiescent,
    gcAndFinalize,
    meterControl: makeDummyMeterControl(),
  });
  const vatManagerFactory = makeVatManagerFactory({
    allVatPowers,
    kernelKeeper,
    vatEndowments,
    startSubprocessWorkerNode,
    startXSnap,
    gcTools,
    kernelSlog,
  });

  function buildVatSyscallHandler(vatID, translators) {
    // This handler never throws. The VatSyscallResult it returns is one of:
    // * success, no response data: ['ok', null]
    // * success, capdata (callNow) ['ok', capdata]
    // * exit, capdata ['exit', capdata]
    // * error: you are dead ['error, description]
    // the VatManager+VatWorker will see the error case, but liveslots will
    // not
    /**
     *
     * @param {VatSyscallObject} vatSyscallObject
     * @returns {VatSyscallResult}
     */
    function vatSyscallHandler(vatSyscallObject) {
      if (!vatWarehouse.lookup(vatID)) {
        // This is a safety check -- this case should never happen unless the
        // vatManager is somehow confused.
        console.error(`vatSyscallHandler invoked on dead vat ${vatID}`);
        const problem = 'vat is dead';
        vatFatalSyscall(vatID, problem);
        return harden(['error', problem]);
      }
      /** @type { KernelSyscallObject | undefined } */
      let ksc;
      /** @type { KernelSyscallResult } */
      let kres = harden(['error', 'incomplete']);
      /** @type { VatSyscallResult } */
      let vres = harden(['error', 'incomplete']);

      try {
        // This can throw if the vat asks for something not on their clist,
        // or their syscall doesn't make sense in some other way, or due to a
        // kernel bug, all of which are fatal to the vat.
        ksc = translators.vatSyscallToKernelSyscall(vatSyscallObject);
      } catch (vaterr) {
        // prettier-ignore
        kdebug(`vat ${vatID} terminated: error during translation: ${vaterr} ${JSON.stringify(vatSyscallObject)}`);
        console.log(`error during syscall translation:`, vaterr);
        const problem = 'syscall translation error: prepare to die';
        vatFatalSyscall(vatID, problem);
        kres = harden(['error', problem]);
        vres = harden(['error', problem]);
        // we leave this catch() with ksc=undefined, so no doKernelSyscall()
      }

      /** @type { SlogFinishSyscall } */
      const finish = kernelSlog.syscall(vatID, ksc, vatSyscallObject);

      if (ksc) {
        try {
          // this can throw if kernel is buggy
          kres = kernelSyscallHandler(ksc);

          // kres is a KernelResult: ['ok', value] or ['error', problem],
          // where 'error' means we want the calling vat's syscall() to
          // throw. Vats record the response in the transcript (which is why
          // we use 'null' instead of 'undefined', TODO clean this up
          // #4390), but otherwise most syscalls ignore it. The two that
          // pay attention are 'callNow' (which assumes it's capdata), and
          // 'vatstoreGet' (which assumes string or null).

          // this can throw if the translator is buggy
          vres = translators.kernelSyscallResultToVatSyscallResult(
            ksc[0],
            kres,
          );

          // here, vres is ['ok', null] or ['ok', capdata] or ['error', problem]
        } catch (err) {
          // kernel/translator errors cause a kernel panic
          panic(`error during syscall/device.invoke: ${err}`, err);
          // the kernel is now in a shutdown state, but it may take a while to
          // grind to a halt
          const problem = 'you killed my kernel. prepare to die';
          vatFatalSyscall(vatID, problem);
          vres = harden(['error', problem]);
        }
      }
      finish(kres, vres);
      return vres;
    }
    return vatSyscallHandler;
  }

  const vatLoader = makeVatLoader({
    vatManagerFactory,
    kernelSlog,
    makeSourcedConsole,
    kernelKeeper,
    overrideVatManagerOptions,
  });

  vatWarehouse = makeVatWarehouse({
    kernelSlog,
    kernelKeeper,
    vatLoader,
    buildVatSyscallHandler,
    panic,
    warehousePolicy,
  });

  /**
   * Create a dynamically generated vat for testing purposes.  Such vats are
   * defined by providing a setup function rather than a bundle and can be
   * instantiated without a controller and without an initialized kernel.  These
   * vats are subject to some severe limitations: they will have no reliable
   * persistent state (that is, after the kernel exits, there is no pretense
   * that the swingset could be resumed) and they are limited to local vats.
   * Although they are dynamically creatd, these vats will have names like
   * static vats so that they can be looked up by calling
   * `kernel.vatNameToID()`.
   *
   * @param {string} name  Name for the vat
   * @param {*} setup  Setup function that will return a dispatcher for the vat
   * @param {*} vatParameters  Vat configuration parameters
   * @param {*} creationOptions  Options controlling vat creation
   *
   * This function is intended to provide minimal scaffolding for unit tests and
   * should never be used in a production environment.
   */
  async function createTestVat(
    name,
    setup,
    vatParameters = {},
    creationOptions = {},
  ) {
    !kernelKeeper.hasVatWithName(name) || Fail`vat ${name} already exists`;
    typeof setup === 'function' ||
      Fail`setup is not a function, rather ${setup}`;
    assertKnownOptions(creationOptions, [
      'bundleID',
      'enablePipelining',
      'reapInterval',
    ]);
    const {
      bundleID = 'b1-00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      reapInterval = 'never',
      enablePipelining,
    } = creationOptions;
    const vatID = kernelKeeper.allocateVatIDForNameIfNeeded(name);
    logStartup(`assigned VatID ${vatID} for test vat ${name}`);

    const source = { bundleID };
    /** @type {import('../types-external.js').ManagerType} */
    const managerType = 'local';
    const options = {
      name,
      reapInterval,
      enablePipelining,
      managerType,
    };
    await optionRecorder.recordStatic(vatID, source, options);

    await vatWarehouse.loadTestVat(vatID, setup);

    const vpCapData = kser(vatParameters);
    /** @type { RunQueueEventStartVat } */
    const startVatMessage = {
      type: 'startVat',
      vatID,
      vatParameters: vpCapData,
    };
    // eslint-disable-next-line no-unused-vars
    const ds = await processStartVat(startVatMessage);
    // TODO: do something with DeliveryStatus, maybe just assert it's ok

    return vatID;
  }

  // note: deviceEndowments.vatAdmin can move out here,
  // makeSwingsetController() calls buildKernel() and kernel.start() in
  // nearly rapid succession

  async function start() {
    if (started) {
      throw Error('kernel.start already called');
    }
    started = true;
    kernelKeeper.getInitialized() || Fail`kernel not initialized`;

    kernelKeeper.loadStats();

    await vatWarehouse.start(logStartup);

    // the admin device is endowed directly by the kernel
    deviceEndowments.vatAdmin = {
      hasBundle: kernelKeeper.hasBundle,
      getBundle: kernelKeeper.getBundle,
      getNamedBundleID: kernelKeeper.getNamedBundleID,
      meterCreate: (remaining, threshold) =>
        kernelKeeper.allocateMeter(remaining, threshold),
      meterAddRemaining: (meterID, delta) =>
        kernelKeeper.addMeterRemaining(meterID, delta),
      meterSetThreshold: (meterID, threshold) =>
        kernelKeeper.setMeterThreshold(meterID, threshold),
      meterGet: meterID => kernelKeeper.getMeter(meterID),
    };

    // instantiate all devices
    for (const [name, deviceID] of kernelKeeper.getDevices()) {
      logStartup(`starting device ${name} as ${deviceID}`);
      const deviceKeeper = kernelKeeper.allocateDeviceKeeperIfNeeded(deviceID);
      const { source, options } = deviceKeeper.getSourceAndOptions();
      assert(source.bundleID);
      assertKnownOptions(options, ['deviceParameters', 'unendowed']);
      const { deviceParameters = {}, unendowed } = options;
      const devConsole = makeConsole(`${debugPrefix}SwingSet:dev-${name}`);

      const bundle = kernelKeeper.getBundle(source.bundleID);
      assert(bundle);
      const NS = await importBundle(bundle, {
        filePrefix: `dev-${name}/...`,
        endowments: harden({ ...vatEndowments, console: devConsole, assert }),
      });

      if (deviceEndowments[name] || unendowed) {
        const translators = makeDeviceTranslators(deviceID, name, kernelKeeper);
        function deviceSyscallHandler(deviceSyscallObject) {
          const ksc =
            translators.deviceSyscallToKernelSyscall(deviceSyscallObject);
          const kres = kernelSyscallHandler(ksc);
          const dres = translators.kernelResultToDeviceResult(ksc[0], kres);
          assert.equal(dres[0], 'ok');
          return dres[1];
        }

        // Wrapper for state, to give to the device to access its state.
        // Devices are allowed to get their state at startup, and set it anytime.
        // They do not use orthogonal persistence or transcripts.
        const state = harden({
          get() {
            return deviceKeeper.getDeviceState();
          },
          set(value) {
            deviceKeeper.setDeviceState(value);
          },
        });

        deviceHooks.set(deviceID, {});
        const manager = makeDeviceManager(
          name,
          NS,
          state,
          deviceEndowments[name],
          testLog,
          deviceParameters,
          deviceSyscallHandler,
        );
        ephemeral.devices.set(deviceID, { translators, manager });
      } else {
        console.log(
          `WARNING: skipping device ${deviceID} (${name}) because it has no endowments`,
        );
      }
    }

    // attach vat-admin device hooks
    const vatAdminDeviceID = kernelKeeper.getDeviceIDForName('vatAdmin');
    if (vatAdminDeviceID) {
      const hooks = makeVatAdminHooks({ kernelKeeper, terminateVat });
      deviceHooks.set(vatAdminDeviceID, hooks);
    }
  }

  /**
   * Pulls the next message from the highest-priority queue and returns it
   * along with a corresponding processor.
   *
   * @returns {{
   *   message: RunQueueEvent | undefined,
   *   processor: (message: RunQueueEvent) => Promise<PolicyInput>,
   * }}
   */
  function getNextMessageAndProcessor() {
    const acceptanceMessage = kernelKeeper.getNextAcceptanceQueueMsg();
    if (acceptanceMessage) {
      return {
        message: acceptanceMessage,
        processor: processAcceptanceMessage,
      };
    }
    const message =
      processGCActionSet(kernelKeeper) ||
      kernelKeeper.nextReapAction() ||
      kernelKeeper.getNextRunQueueMsg();
    return { message, processor: processDeliveryMessage };
  }

  function changeKernelOptions(options) {
    assertKnownOptions(options, ['defaultReapInterval', 'snapshotInterval']);
    kernelKeeper.startCrank();
    try {
      for (const option of Object.getOwnPropertyNames(options)) {
        const value = options[option];
        switch (option) {
          case 'defaultReapInterval': {
            kernelKeeper.setDefaultReapInterval(value);
            break;
          }
          case 'snapshotInterval': {
            vatWarehouse.setSnapshotInterval(value);
            break;
          }
          default:
            Fail`this can't happen (kernel option ${option})`;
        }
      }
    } finally {
      kernelKeeper.emitCrankHashes();
      kernelKeeper.endCrank();
    }
  }

  async function step() {
    if (kernelPanic) {
      throw kernelPanic;
    }
    if (!started) {
      throw Error('must do kernel.start() before step()');
    }
    kernelKeeper.startCrank();
    await null;
    try {
      kernelKeeper.establishCrankSavepoint('start');
      const { processor, message } = getNextMessageAndProcessor();
      // process a single message
      if (message) {
        await tryProcessMessage(processor, message);
        if (kernelPanic) {
          throw kernelPanic;
        }
        return 1;
      } else {
        return 0;
      }
    } finally {
      kernelKeeper.endCrank();
    }
  }

  /**
   * Run the kernel until the policy says to stop, or the queue is empty.
   *
   * @param {RunPolicy} [policy] - a RunPolicy to limit the work being done
   * @returns {Promise<number>} The number of cranks that were executed.
   */
  async function run(policy = foreverPolicy()) {
    assert(policy);
    if (kernelPanic) {
      throw kernelPanic;
    }
    if (!started) {
      throw Error('must do kernel.start() before run()');
    }
    let count = 0;
    await null;
    for (;;) {
      kernelKeeper.startCrank();
      try {
        kernelKeeper.establishCrankSavepoint('start');
        const { processor, message } = getNextMessageAndProcessor();
        if (!message) {
          break;
        }
        count += 1;
        /** @type { PolicyInput } */
        const policyInput = await tryProcessMessage(processor, message);
        if (kernelPanic) {
          throw kernelPanic;
        }
        // console.log(`policyInput`, policyInput);
        let policyOutput = true; // keep going
        switch (policyInput[0]) {
          case 'create-vat':
            policyOutput = policy.vatCreated(policyInput[1]);
            break;
          case 'crank':
            policyOutput = policy.crankComplete(policyInput[1]);
            break;
          case 'crank-failed':
            policyOutput = policy.crankFailed(policyInput[1]);
            break;
          case 'none':
            policyOutput = policy.emptyCrank();
            break;
          default:
            Fail`unknown policyInput type in ${policyInput}`;
        }
        if (!policyOutput) {
          // console.log(`ending c.run() by policy, count=${count}`);
          return count;
        }
      } finally {
        kernelKeeper.endCrank();
      }
    }
    return count;
  }

  // mostly used by tests, only needed with thread/process-based workers
  function shutdown() {
    return vatWarehouse.shutdown();
  }

  /**
   * Install a pre-validated bundle under the given ID.
   *
   * @param {BundleID} bundleID
   * @param {EndoZipBase64Bundle} bundle
   */
  async function installBundle(bundleID, bundle) {
    // bundleID is b1-HASH
    if (!kernelKeeper.hasBundle(bundleID)) {
      kernelKeeper.startCrank();
      try {
        kernelKeeper.addBundle(bundleID, bundle);
        if (vatAdminRootKref) {
          // TODO: consider 'panic' instead of 'logFailure'
          queueToKref(
            vatAdminRootKref,
            'bundleInstalled',
            [bundleID],
            'logFailure',
          );
        } else {
          // this should only happen during unit tests that are too lazy to
          // build a complete kernel: test/bundles/test-bundles-kernel.js
          console.log(`installBundle cannot notify, missing vatAdminRootKref`);
        }
      } finally {
        kernelKeeper.emitCrankHashes();
        kernelKeeper.endCrank();
      }
    }
  }

  function kpRegisterInterest(kpid) {
    kernelKeeper.incrementRefCount(kpid, 'external');
  }

  function kpStatus(kpid) {
    try {
      const p = kernelKeeper.getKernelPromise(kpid);
      if (p) {
        return p.state;
      } else {
        return 'unknown';
      }
    } catch (e) {
      return 'unknown';
    }
  }

  function kpResolution(kpid, options = {}) {
    // `incref` should ultimately be removed,
    // see https://github.com/Agoric/agoric-sdk/issues/7213
    const { incref = true } = options;
    const p = kernelKeeper.getKernelPromise(kpid);
    switch (p.state) {
      case 'unresolved': {
        throw Fail`resolution of ${kpid} is still pending`;
      }
      case 'fulfilled':
      case 'rejected': {
        kernelKeeper.decrementRefCount(kpid, 'external');
        if (incref) {
          for (const kref of p.data.slots) {
            kernelKeeper.incrementRefCount(kref, 'external');
          }
        }
        return p.data;
      }
      default: {
        throw Fail`invalid state for ${kpid}: ${p.state}`;
      }
    }
  }

  function addDeviceHook(deviceName, hookName, hook) {
    const deviceID = kernelKeeper.getDeviceIDForName(deviceName);
    if (!deviceID) {
      throw Fail`no such device ${deviceName}`;
    }
    deviceHooks.has(deviceID) || Fail`no such device ${deviceID}`;
    const hooks = deviceHooks.get(deviceID);
    if (!hooks) {
      throw Fail`no hooks for ${deviceName}`;
    }
    hooks[hookName] = hook;
  }

  const kernel = harden({
    // these are meant for the controller
    installBundle,
    start,
    step,
    run,
    shutdown,
    changeKernelOptions,

    // the rest are for testing and debugging

    createTestVat,

    log(str) {
      ephemeral.log.push(`${str}`);
    },

    getStats() {
      return kernelKeeper.getStats();
    },

    getStatus() {
      return harden({
        activeVats: vatWarehouse.activeVatsInfo(),
      });
    },

    /**
     * Returns 2 numbers informing the state of the kernel queues:
     * - activeQueues: the total length of queues which can be processed
     * - inactiveQueues: the total length of queues which are waiting on some
     *   kernel state change.
     *
     * The reason to keep those separate is to make explicit a state where the
     * active queues are empty and only the inactive queues have pending events,
     * aka where SwingSet is blocked on some external trigger.
     */
    getQueuesLength() {
      const { runQueueLength, acceptanceQueueLength, promiseQueuesLength } =
        kernelKeeper.getStats(true);

      assert.typeof(runQueueLength, 'number');
      assert.typeof(acceptanceQueueLength, 'number');
      assert.typeof(promiseQueuesLength, 'number');

      return {
        activeQueues: runQueueLength + acceptanceQueueLength,
        inactiveQueues: promiseQueuesLength,
      };
    },

    dump() {
      // note: dump().log is not deterministic, since log() does not go
      // through the syscall interface (and we replay transcripts one vat at
      // a time, so any log() calls that were interleaved during their
      // original execution will be sorted by vat in the replay). Logs are
      // not kept in the persistent state, only in ephemeral state.
      return { log: ephemeral.log, ...kernelKeeper.dump() };
    },
    kdebugEnable,

    addImport,
    addExport,
    getRootObject(vatID) {
      return exportRootObject(kernelKeeper, vatID);
    },
    pinObject,
    vatNameToID,
    deviceNameToID,
    queueToKref,
    kpRegisterInterest,
    kpStatus,
    kpResolution,
    addDeviceHook,
  });

  return kernel;
}
