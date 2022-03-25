// @ts-check
import { assert, details as X } from '@agoric/assert';
import { importBundle } from '@endo/import-bundle';
import { stringify } from '@endo/marshal';
import { assertKnownOptions } from '../lib/assertOptions.js';
import { foreverPolicy } from '../lib/runPolicies.js';
import { makeVatManagerFactory } from './vat-loader/manager-factory.js';
import { makeVatWarehouse } from './vat-warehouse.js';
import makeDeviceManager from './deviceManager.js';
import makeKernelKeeper from './state/kernelKeeper.js';
import { kdebug, kdebugEnable, legibilizeMessageArgs } from '../lib/kdebug.js';
import { insistKernelType, parseKernelSlot } from './parseKernelSlots.js';
import { parseVatSlot } from '../lib/parseVatSlots.js';
import { insistCapData } from '../lib/capdata.js';
import { insistMessage, insistVatDeliveryResult } from '../lib/message.js';
import { insistDeviceID, insistVatID } from '../lib/id.js';
import { makeKernelQueueHandler } from './kernelQueue.js';
import { makeKernelSyscallHandler } from './kernelSyscall.js';
import { makeSlogger, makeDummySlogger } from './slogger.js';
import { makeDummyMeterControl } from './dummyMeterControl.js';
import { getKpidsToRetire } from './cleanup.js';
import { processNextGCAction } from './gc-actions.js';
import { makeVatLoader } from './vat-loader/vat-loader.js';
import { makeDeviceTranslators } from './deviceTranslator.js';
import { notifyTermination } from './notifyTermination.js';
import { makeVatAdminHooks } from './vat-admin-hooks.js';

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

function makeError(message, name = 'Error') {
  assert.typeof(message, 'string');
  const err = { '@qclass': 'error', name, message };
  return harden({ body: JSON.stringify(err), slots: [] });
}

const VAT_TERMINATION_ERROR = makeError('vat terminated');

/**
 * Provide the kref of a vat's root object, as if it had been exported.
 *
 * @param {any} kernelKeeper Kernel keeper managing persistent kernel state.
 * @param {string} vatID Vat ID of the vat whose root kref is sought.
 * @returns {string} The kref of the root object of the given vat.
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
  kernelOptions = {},
) {
  const {
    waitUntilQuiescent,
    hostStorage,
    debugPrefix,
    vatEndowments,
    slogCallbacks = {},
    makeConsole,
    makeNodeWorker,
    startSubprocessWorkerNode,
    startXSnap,
    writeSlogObject,
    WeakRef,
    FinalizationRegistry,
    gcAndFinalize,
    createSHA256,
  } = kernelEndowments;
  deviceEndowments = { ...deviceEndowments }; // copy so we can modify
  const {
    verbose,
    defaultManagerType = 'local',
    warehousePolicy,
    overrideVatManagerOptions = {},
  } = kernelOptions;
  const logStartup = verbose ? console.debug : () => 0;

  const vatAdminRootKref = hostStorage.kvStore.get('vatAdminRootKref');

  /** @type {KernelSlog} */
  const kernelSlog = writeSlogObject
    ? makeSlogger(slogCallbacks, writeSlogObject)
    : makeDummySlogger(slogCallbacks, makeConsole);

  const kernelKeeper = makeKernelKeeper(hostStorage, kernelSlog, createSHA256);

  let started = false;

  /**
   * @typedef {{
   *   manager: unknown;
   *   translators: ReturnType<makeDeviceTranslators>;
   * }} DeviceInfo
   */
  const ephemeral = {
    /** @type {Map<string, DeviceInfo>} key Is deviceID */
    devices: new Map(),
    /** @type {string[]} */
    log: [],
  };

  /**
   * @typedef {(args: SwingSetCapData) => SwingSetCapData} DeviceHook
   *
   * @typedef {string} HookName
   *
   * @typedef {Record<HookName, DeviceHook>} HooksForOneDevice
   *
   * @typedef {string} DeviceID
   *
   * @typedef {Map<DeviceID, HooksForOneDevice>} HooksForAllDevices
   * @type HooksForAllDevices
   */
  const deviceHooks = new Map();

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

  function makeVatConsole(kind, vatID) {
    const origConsole = makeConsole(`${debugPrefix}SwingSet:${kind}:${vatID}`);
    if (kind === 'ls') {
      // LiveSlots is not recorded to kernelSlog.
      // The slog captures 1: what a vat is told to do, and
      // 2: what a vat says about its activities
      return origConsole;
    }
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

  function vatNameToID(name) {
    const vatID = kernelKeeper.getVatIDForName(name);
    insistVatID(vatID);
    return vatID;
  }

  function deviceNameToID(name) {
    const deviceID = kernelKeeper.getDeviceIDForName(name);
    insistDeviceID(deviceID);
    return deviceID;
  }

  function addImport(forVatID, what) {
    if (!started) {
      throw new Error('must do kernel.start() before addImport()');
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
      throw new Error('must do kernel.start() before addExport()');
      // because otherwise we can't get the vatKeeper
    }
    return doAddExport(kernelKeeper, fromVatID, vatSlot);
  }

  // If `kernelPanic` is set to non-null, vat execution code will throw it as an
  // error at the first opportunity
  let kernelPanic = null;

  /** @type {(problem: unknown, err?: Error) => void} */
  function panic(problem, err = undefined) {
    console.error(`##### KERNEL PANIC: ${problem} #####`);
    kernelPanic = err || new Error(`kernel panic ${problem}`);
  }

  const { doSend, doSubscribe, doResolve, resolveToError, queueToKref } =
    makeKernelQueueHandler({ kernelKeeper, panic });

  /**
   * Terminate a vat; that is: delete vat DB state, resolve orphaned promises,
   * notify parent, and shutdown worker.
   *
   * @param {string} vatID
   * @param {boolean} shouldReject
   * @param {SwingSetCapData} info
   */
  function terminateVat(vatID, shouldReject, info) {
    insistCapData(info);
    // guard against somebody telling vatAdmin to kill a vat twice
    if (kernelKeeper.vatIsAlive(vatID)) {
      const promisesToReject = kernelKeeper.cleanupAfterTerminatedVat(vatID);
      for (const kpid of promisesToReject) {
        resolveToError(kpid, VAT_TERMINATION_ERROR, vatID);
      }
      // TODO: if a static vat terminates, panic the kernel?

      // ISSUE: terminate stuff in its own crank like creation?
      // eslint-disable-next-line no-use-before-define
      vatWarehouse.vatWasTerminated(vatID);
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
  }

  function notifyMeterThreshold(meterID) {
    // tell vatAdmin that a meter has dropped below its notifyThreshold
    const { remaining } = kernelKeeper.getMeter(meterID);
    const args = { body: stringify(harden([meterID, remaining])), slots: [] };
    assert.typeof(vatAdminRootKref, 'string', 'vatAdminRootKref missing');
    queueToKref(vatAdminRootKref, 'meterCrossedThreshold', args, 'logFailure');
  }

  // TODO: instead of using a kernel-wide flag here, consider making each
  // VatManager responsible for remembering if/when a KernelSyscallResult
  // reports a non-'ok' status and therefore the vat is toast. Then the
  // delivery handler could ask the manager (or vat-warehouse) afterwards for
  // the sticky-fatal state. If we did that, we wouldn't need
  // `vatFatalSyscall`. We'd still need a way for `requestTermination` to
  // work, though.

  let terminationTrigger;

  // this is called for syscall.exit, which allows the crank to complete
  // before terminating the vat
  function requestTermination(vatID, reject, info) {
    insistCapData(info);
    // if vatFatalSyscall was here already, don't override: bad syscalls win
    if (!terminationTrigger) {
      terminationTrigger = { vatID, abortCrank: false, reject, info };
    }
  }

  // this is called for vat-fatal syscall errors, which aborts the crank and
  // then terminates the vat
  function vatFatalSyscall(vatID, problem) {
    terminationTrigger = {
      vatID,
      abortCrank: true,
      reject: true,
      info: makeError(problem),
    };
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
   * @typedef {{ compute: number }} MeterConsumption Any delivery crank (send,
   *   notify, start-vat.. anything which is allowed to make vat delivery) emits
   *   one of these status events if a delivery actually happened.
   *
   * @typedef {{
   *   vatID?: VatID; // vat to which the delivery was made
   *   metering?: MeterConsumption | null; // delivery metering results
   *   useMeter?: boolean; // this delivery should count against the vat's meter
   *   decrementReapCount?: boolean; // the reap counter should decrement
   *   discardFailedDelivery?: boolean; // crank abort should not repeat the delivery
   *   terminate?: string | null; // vat should be terminated
   * }} DeliveryStatus
   */

  /**
   * Perform one delivery to a vat.
   *
   * @param {VatID} vatID
   * @param {KernelDeliveryObject} kd
   * @param {VatDeliveryObject} vd
   * @returns {Promise<DeliveryStatus>}
   */
  async function deliverAndLogToVat(vatID, kd, vd) {
    // eslint-disable-next-line no-use-before-define
    assert(vatWarehouse.lookup(vatID));
    // Ensure that the vatSlogger is available before clist translation.
    const vs = kernelSlog.provideVatSlogger(vatID).vatSlog;
    try {
      /** @type {VatDeliveryResult} */
      // eslint-disable-next-line no-use-before-define
      const deliveryResult = await vatWarehouse.deliverToVat(vatID, kd, vd, vs);

      insistVatDeliveryResult(deliveryResult);
      // const [ ok, problem, usage ] = deliveryResult;
      if (deliveryResult[0] === 'ok') {
        return { metering: deliveryResult[2] };
      } else {
        // probably a hard metering fault, or a bug in the vat's dispatch()
        return { terminate: deliveryResult[1] }; // might be dead
      }
    } catch (e) {
      // log so we get a stack trace
      console.error(`error in kernel.deliver:`, e);
      throw e;
    }
  }

  /**
   * Deliver one message to a vat.
   *
   * @param {VatID} vatID
   * @param {string} target
   * @param {Message} msg
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processSend(vatID, target, msg) {
    insistMessage(msg);
    kernelKeeper.incStat('dispatches');
    kernelKeeper.incStat('dispatchDeliver');
    // eslint-disable-next-line no-use-before-define
    if (!vatWarehouse.lookup(vatID)) {
      // splat
      if (msg.result) {
        resolveToError(msg.result, VAT_TERMINATION_ERROR);
      }
      return null;
    }

    /** @type {KernelDeliveryMessage} */
    const kd = harden(['message', target, msg]);
    // eslint-disable-next-line no-use-before-define
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    return deliverAndLogToVat(vatID, kd, vd);
  }

  function extractPresenceIfPresent(data) {
    const body = JSON.parse(data.body);
    if (
      body &&
      typeof body === 'object' &&
      body['@qclass'] === 'slot' &&
      body.index === 0
    ) {
      if (data.slots.length === 1) {
        const slot = data.slots[0];
        const { type } = parseKernelSlot(slot);
        if (type === 'object') {
          return slot;
        }
      }
    }
    return null;
  }

  /**
   * @param {RunQueueEventNotify} message
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processNotify(message) {
    const { vatID, kpid } = message;
    insistVatID(vatID);
    insistKernelType('promise', kpid);
    kernelKeeper.incStat('dispatches');
    // eslint-disable-next-line no-use-before-define
    if (!vatWarehouse.lookup(vatID)) {
      kdebug(`dropping notify of ${kpid} to ${vatID} because vat is dead`);
      return null;
    }

    const p = kernelKeeper.getKernelPromise(kpid);
    kernelKeeper.incStat('dispatchNotify');
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);

    assert(p.state !== 'unresolved', X`spurious notification ${kpid}`);
    /** @type {KernelDeliveryOneNotify[]} */
    const resolutions = [];
    if (!vatKeeper.hasCListEntry(kpid)) {
      kdebug(`vat ${vatID} has no c-list entry for ${kpid}`);
      kdebug(`skipping notify of ${kpid} because it's already been done`);
      return null;
    }
    const targets = getKpidsToRetire(kernelKeeper, kpid, p.data);
    if (targets.length === 0) {
      kdebug(`no kpids to retire`);
      kdebug(`skipping notify of ${kpid} because it's already been done`);
      return null;
    }
    for (const toResolve of targets) {
      const { state, data } = kernelKeeper.getKernelPromise(toResolve);
      resolutions.push([toResolve, { state, data }]);
    }
    /** @type {KernelDeliveryNotify} */
    const kd = harden(['notify', resolutions]);
    // eslint-disable-next-line no-use-before-define
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    vatKeeper.deleteCListEntriesForKernelSlots(targets);

    return deliverAndLogToVat(vatID, kd, vd);
  }

  /**
   * @param {| RunQueueEventDropExports
   *   | RunQueueEventRetireImports
   *   | RunQueueEventRetireExports} message
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processGCMessage(message) {
    // used for dropExports, retireExports, and retireImports
    const { type, vatID, krefs } = message;
    // console.log(`-- processGCMessage(${vatID} ${type} ${krefs.join(',')})`);
    insistVatID(vatID);
    // eslint-disable-next-line no-use-before-define
    if (!vatWarehouse.lookup(vatID)) {
      return null; // can't collect from the dead
    }
    /**
     * @type {| KernelDeliveryDropExports
     *   | KernelDeliveryRetireExports
     *   | KernelDeliveryRetireImports}
     */
    const kd = harden([type, krefs]);
    if (type === 'retireExports') {
      for (const kref of krefs) {
        // const rc = kernelKeeper.getObjectRefCount(kref);
        // console.log(`   ${kref}: ${rc.reachable},${rc.recognizable}`);
        kernelKeeper.deleteKernelObject(kref);
        // console.log(`   deleted ${kref}`);
      }
    }
    // eslint-disable-next-line no-use-before-define
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    return deliverAndLogToVat(vatID, kd, vd);
  }

  /**
   * @param {RunQueueEventBringOutYourDead} message
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processBringOutYourDead(message) {
    const { type, vatID } = message;
    // console.log(`-- processBringOutYourDead(${vatID})`);
    insistVatID(vatID);
    // eslint-disable-next-line no-use-before-define
    if (!vatWarehouse.lookup(vatID)) {
      return null; // can't collect from the dead
    }
    /** @type {KernelDeliveryBringOutYourDead} */
    const kd = harden([type]);
    // eslint-disable-next-line no-use-before-define
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    return deliverAndLogToVat(vatID, kd, vd);
  }

  /**
   * The 'startVat' event is queued by `initializeKernel` for all static vats,
   * so that we execute their bundle imports and call their `buildRootObject`
   * functions in a transcript context. The consequence of this is that if there
   * are N static vats, N 'startVat' events will be the first N events on the
   * initial run queue. For dynamic vats, the handler of the 'create-vat' event,
   * `processCreateVat`, calls `processStartVat` directly, rather than enqueing
   * 'startVat', so that vat startup happens promptly after creation and so that
   * there are no intervening events in the run queue between vat creation and
   * vat startup (it would probably not be a problem if there were, but doing it
   * this way simply guarantees there won't be such a problem without requiring
   * any further analysis to be sure).
   *
   * @param {RunQueueEventStartVat} message
   * @returns {Promise<DeliveryStatus>}
   */
  async function processStartVat(message) {
    const { vatID, vatParameters } = message;
    // console.log(`-- processStartVat(${vatID})`);
    insistVatID(vatID);
    insistCapData(vatParameters);
    // eslint-disable-next-line no-use-before-define
    assert(vatWarehouse.lookup(vatID));
    /** @type {KernelDeliveryStartVat} */
    const kd = harden(['startVat', vatParameters]);
    // eslint-disable-next-line no-use-before-define
    const vd = vatWarehouse.kernelDeliveryToVatDelivery(vatID, kd);
    // decref slots now that create-vat is off run-queue
    for (const kref of vatParameters.slots) {
      kernelKeeper.decrementRefCount(kref, 'create-vat-event');
    }

    // TODO: can we provide a computron count to the run policy?
    const status = await deliverAndLogToVat(vatID, kd, vd);
    return { ...status, discardFailedDelivery: true };
  }

  /**
   * @param {RunQueueEventCreateVat} message
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processCreateVat(message) {
    assert(vatAdminRootKref, `initializeKernel did not set vatAdminRootKref`);
    const { vatID, source, vatParameters, dynamicOptions } = message;
    insistCapData(vatParameters);
    kernelKeeper.addDynamicVatID(vatID);
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const options = { ...dynamicOptions };
    if (!dynamicOptions.managerType) {
      options.managerType = kernelKeeper.getDefaultManagerType();
    }
    if (!dynamicOptions.reapInterval) {
      options.reapInterval = kernelKeeper.getDefaultReapInterval();
    }
    vatKeeper.setSourceAndOptions(source, options);
    vatKeeper.initializeReapCountdown(options.reapInterval);

    function sendNewVatCallback(args) {
      // @ts-ignore see assert(...) above
      queueToKref(vatAdminRootKref, 'newVatCallback', args, 'logFailure');
    }

    function makeSuccessResponse(status) {
      // build success message, giving admin vat access to the new vat's root
      // object
      const kernelRootObjSlot = exportRootObject(kernelKeeper, vatID);
      const args = {
        body: JSON.stringify([
          vatID,
          { rootObject: { '@qclass': 'slot', index: 0 } },
        ]),
        slots: [kernelRootObjSlot],
      };
      sendNewVatCallback(args);
      return { ...status, discardFailedDelivery: true };
    }

    function makeErrorResponse(error) {
      // delete partial vat state
      kernelKeeper.cleanupAfterTerminatedVat(vatID);
      const args = {
        body: JSON.stringify([vatID, { error: `${error}` }]),
        slots: [],
      };
      sendNewVatCallback(args);
      // ?? will this cause double-termination? or just get unwound?
      return { terminate: error, discardFailedDelivery: true };
    }

    // TODO warner think through failure paths

    return (
      // eslint-disable-next-line no-use-before-define
      vatWarehouse
        .createDynamicVat(vatID)
        // if createDynamicVat fails, go directly to makeErrorResponse
        .then(_vatinfo =>
          processStartVat({ type: 'startVat', vatID, vatParameters }),
        )
        // If processStartVat/deliverAndLogToVat observes a worker error, it
        // will return status={ terminate: problem } rather than throw an
        // error, so makeSuccessResponse will sendNewVatCallback. But the
        // status is passed through, so processDeliveryMessage() will
        // terminate the half-started vat and abort the crank, undoing
        // sendNewVatCallback. processDeliveryMessage() is responsible for
        // notifying vat-admin of the termination after doing abortCrank().
        .then(makeSuccessResponse, makeErrorResponse)
        .catch(err => console.error(`error in vat creation`, err))
    );
  }

  /**
   * @param {RunQueueEventUpgradeVat} message
   * @returns {Promise<DeliveryStatus | null>}
   */
  async function processUpgradeVat(message) {
    assert(vatAdminRootKref, `initializeKernel did not set vatAdminRootKref`);
    // const { upgradeID, bundleID, vatParameters } = message;
    const { upgradeID, vatParameters } = message;
    insistCapData(vatParameters);
    // for now, all attempts to upgrade will fail

    // TODO: decref the bundleID and vatParameters.slots
    const args = {
      body: JSON.stringify([upgradeID, false, { error: `not implemented` }]),
      slots: [],
    };
    queueToKref(vatAdminRootKref, 'vatUpgradeCallback', args, 'logFailure');
    return null; // no delivery made (yet)
  }

  function legibilizeMessage(message) {
    if (message.type === 'send') {
      const msg = message.msg;
      const argList = legibilizeMessageArgs(msg.args).join(', ');
      const result = msg.result ? msg.result : 'null';
      return `@${message.target} <- ${msg.method}(${argList}) : @${result}`;
    } else if (message.type === 'notify') {
      return `notify(vatID: ${message.vatID}, kpid: @${message.kpid})`;
    } else if (message.type === 'create-vat') {
      // prettier-ignore
      return `create-vat ${message.vatID} opts: ${JSON.stringify(message.dynamicOptions)}`;
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
   * RouteSend(message) figures out where a 'send' event should go. If the
   * message needs to be queued (it is sent to an unresolved promise without a
   * pipelining decider), this queues it, and returns null. If the message goes
   * splat against a dead vat or a non-deliverable resolved promise, this
   * rejects any result promise, and returns null. Otherwise it returns the
   * vatID and actual target to which it should be delivered. If the original
   * target was a promise that has been fulfilled to an object, this returns
   * that settled object.
   *
   * This does not decrement any refcounts. The caller should do that.
   *
   * @param {RunQueueEventSend} message
   * @returns {{ vatID: VatID; targetObject: string } | null}
   */
  function routeSendEvent(message) {
    const { target, msg } = message;
    const { type } = parseKernelSlot(target);
    assert(
      ['object', 'promise'].includes(type),
      X`unable to send() to slot.type ${type}`,
    );

    function splat(error) {
      if (msg.result) {
        resolveToError(msg.result, error);
      }
      return null; // message isn't going to a vat
    }

    function send(targetObject) {
      const vatID = kernelKeeper.ownerOfKernelObject(targetObject);
      if (!vatID) {
        return splat(VAT_TERMINATION_ERROR);
      }
      return { vatID, targetObject };
    }

    function enqueue() {
      kernelKeeper.addMessageToPromiseQueue(target, msg);
      return null; // message is queued, not sent to a vat right now
    }

    if (type === 'object') {
      return send(target);
    }
    // else type === 'promise'
    const kp = kernelKeeper.getKernelPromise(target);
    switch (kp.state) {
      case 'fulfilled': {
        const presence = extractPresenceIfPresent(kp.data);
        if (presence) {
          return send(presence);
        }
        // TODO: maybe mimic (3).foo(): "TypeError: XX.foo is not a function"
        const s = `data is not callable, has no method ${msg.method}`;
        return splat(makeError(s));
      }
      case 'rejected': {
        // TODO maybe simpler to redirect msg.result to kp, if we had redirect
        return splat(kp.data);
      }
      case 'unresolved': {
        if (!kp.decider) {
          return enqueue();
        } else {
          insistVatID(kp.decider);
          // eslint-disable-next-line no-use-before-define
          const deciderVat = vatWarehouse.lookup(kp.decider);
          if (!deciderVat) {
            // decider is dead
            return splat(VAT_TERMINATION_ERROR);
          }
          if (deciderVat.enablePipelining) {
            return { vatID: kp.decider, targetObject: target };
          }
          return enqueue();
        }
      }
      default:
        assert.fail(`unknown promise resolution '${kp.state}'`);
    }
  }

  function decrementSendEventRefCount(message) {
    kernelKeeper.decrementRefCount(message.target, `deq|msg|t`);
    if (message.msg.result) {
      kernelKeeper.decrementRefCount(message.msg.result, `deq|msg|r`);
    }
    let idx = 0;
    for (const argSlot of message.msg.args.slots) {
      kernelKeeper.decrementRefCount(argSlot, `deq|msg|s${idx}`);
      idx += 1;
    }
  }

  function decrementNotifyEventRefCount(message) {
    kernelKeeper.decrementRefCount(message.kpid, `deq|notify`);
  }

  const gcMessages = ['dropExports', 'retireExports', 'retireImports'];

  /**
   * @typedef {import('../types-internal.js').VatID} VatID
   *
   * @typedef {import('../types-internal.js').InternalDynamicVatOptions} InternalDynamicVatOptions
   *
   * @typedef {{ type: 'notify'; vatID: VatID; kpid: string }} RunQueueEventNotify
   *
   * @typedef {{ type: 'send'; target: string; msg: Message }} RunQueueEventSend
   *
   * @typedef {{
   *   type: 'create-vat';
   *   vatID: VatID;
   *   source: { bundle: Bundle } | { bundleID: BundleID };
   *   vatParameters: SwingSetCapData;
   *   dynamicOptions: InternalDynamicVatOptions;
   * }} RunQueueEventCreateVat
   *
   * @typedef {{
   *   type: 'upgrade-vat';
   *   vatID: VatID;
   *   upgradeID: string;
   *   bundleID: BundleID;
   *   vatParameters: SwingSetCapData;
   * }} RunQueueEventUpgradeVat
   *
   * @typedef {{
   *   type: 'startVat';
   *   vatID: VatID;
   *   vatParameters: SwingSetCapData;
   * }} RunQueueEventStartVat
   *
   * @typedef {{ type: 'dropExports'; vatID: VatID; krefs: string[] }} RunQueueEventDropExports
   *
   * @typedef {{ type: 'retireExports'; vatID: VatID; krefs: string[] }} RunQueueEventRetireExports
   *
   * @typedef {{ type: 'retireImports'; vatID: VatID; krefs: string[] }} RunQueueEventRetireImports
   *
   * @typedef {{ type: 'bringOutYourDead'; vatID: VatID }} RunQueueEventBringOutYourDead
   *
   * @typedef {| RunQueueEventNotify
   *   | RunQueueEventSend
   *   | RunQueueEventCreateVat
   *   | RunQueueEventUpgradeVat
   *   | RunQueueEventStartVat
   *   | RunQueueEventDropExports
   *   | RunQueueEventRetireExports
   *   | RunQueueEventRetireImports
   *   | RunQueueEventBringOutYourDead} RunQueueEvent
   */

  /**
   * Dispatch one delivery event. Eventually, this will be called in a "delivery
   * crank" for a DeliveryEvent, after the scheduler chooses a vat with a
   * non-empty vat-input-queue, and we'll know the target vat ahead of time. For
   * now, this is called for each run-queue event, so 'send' does not yet know
   * which vat will be involved (if any).
   *
   * @param {RunQueueEvent} message
   * @returns {Promise<DeliveryStatus | null>}
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
    let useMeter = false;
    let deliverP = null;

    if (message.type === 'send') {
      useMeter = true;
      const route = routeSendEvent(message);
      decrementSendEventRefCount(message);
      if (route) {
        vatID = route.vatID;
        deliverP = processSend(vatID, route.targetObject, message.msg);
      }
    } else if (message.type === 'notify') {
      useMeter = true;
      decrementNotifyEventRefCount(message);
      deliverP = processNotify(message);
    } else if (message.type === 'create-vat') {
      // creating a new dynamic vat will immediately do start-vat
      deliverP = processCreateVat(message);
    } else if (message.type === 'startVat') {
      deliverP = processStartVat(message);
    } else if (message.type === 'upgrade-vat') {
      deliverP = processUpgradeVat(message);
    } else if (message.type === 'bringOutYourDead') {
      deliverP = processBringOutYourDead(message);
    } else if (gcMessages.includes(message.type)) {
      deliverP = processGCMessage(message);
    } else {
      assert.fail(X`unable to process message.type ${message.type}`);
    }

    let status = await deliverP;

    // status will be set if we made a delivery, else undefined
    if (status) {
      const decrementReapCount = message.type !== 'bringOutYourDead';
      // the caller needs to be told the vatID that received the delivery,
      // but eventually they'll tell us, and 'vatID' should be removed from
      // DeliveryStatus
      assert(vatID, 'DeliveryStatus.vatID missing');
      status = { vatID, useMeter, decrementReapCount, ...status };
    }
    return status;
  }

  async function processDeliveryMessage(message) {
    kdebug(`processQ ${JSON.stringify(message)}`);
    kdebug(legibilizeMessage(message));
    kernelSlog.write({ type: 'crank-start', message });
    /** @type {PolicyInput} */
    let policyInput = ['none'];
    if (message.type === 'create-vat') {
      policyInput = ['create-vat', {}];
    }

    // terminationTrigger can be set by syscall.exit or a vat-fatal syscall
    terminationTrigger = null; // reset terminationTrigger before delivery

    // 'deduction' remembers any meter deduction we performed, in case we
    // unwind state and have to apply it again
    let deduction;
    let vatID;
    let discardFailedDelivery;

    // The DeliveryStatus tells us what happened to the delivery (success or
    // worker error). It will be null if the delivery got cancelled, like a
    // 'notify' or 'retireExports' that was superceded somehow.

    const status = await deliverRunQueueEvent(message);

    if (status) {
      policyInput = ['crank', {}];
      vatID = status.vatID;
      const vatKeeper = kernelKeeper.provideVatKeeper(vatID);

      // deliveries cause garbage, garbage needs collection
      const { decrementReapCount } = status;
      if (decrementReapCount && vatKeeper.countdownToReap()) {
        kernelKeeper.scheduleReap(vatID);
      }

      // deliveries cause metering, metering needs deducting
      const meterID = vatKeeper.getOptions().meterID;
      const { metering, useMeter } = status;
      if (metering) {
        // if the result has metering, we report it to the runPolicy
        const consumed = metering.compute;
        assert.typeof(consumed, 'number');
        const computrons = BigInt(consumed);
        policyInput = ['crank', { computrons }];

        // and if both vat and delivery are metered, deduct from the Meter
        if (useMeter && meterID) {
          deduction = { meterID, computrons }; // in case we must rededuct
          const { notify, underflow } = kernelKeeper.deductMeter(
            meterID,
            computrons,
          );
          if (notify) {
            notifyMeterThreshold(meterID);
          }

          // deducting too much causes termination
          if (underflow) {
            console.log(`meter ${meterID} underflow, terminating vat ${vatID}`);
            policyInput = ['crank-failed', {}];
            const err = makeError('meter underflow, vat terminated');
            terminationTrigger = {
              vatID,
              abortCrank: true,
              reject: true,
              info: err,
            };
          }
        }
      }

      // Deliveries cause syscalls, syscalls might cause errors, errors cause
      // termination. Those are reported by the syscall handlers setting
      // terminationTrigger.

      // worker errors also terminate the vat
      const { terminate } = status;
      if (terminate) {
        console.log(`delivery problem, terminating vat ${vatID}`, terminate);
        policyInput = ['crank-failed', {}];
        const info = makeError(terminate);
        terminationTrigger = { vatID, abortCrank: true, reject: true, info };
      }

      // some deliveries should be consumed when they fail
      discardFailedDelivery = status.discardFailedDelivery;
    } else {
      // no status: the delivery got dropped, so no metering or termination
      assert(!terminationTrigger, 'hey, no delivery means no termination');
    }

    // terminate upon fatal syscalls, sys.exit requests, and worker problems
    let didAbort = false;
    if (terminationTrigger) {
      assert(vatID, `terminationTrigger but not vatID`);
      const ttvid = terminationTrigger.vatID;
      assert.equal(ttvid, vatID, `wrong vat got terminated`);
      const { abortCrank, reject, info } = terminationTrigger;
      if (abortCrank) {
        // errors unwind any changes the vat made
        kernelKeeper.abortCrank();
        didAbort = true;
        // but metering deductions and underflow notifications must survive
        if (deduction) {
          const { meterID, computrons } = deduction; // re-deduct metering
          const { notify } = kernelKeeper.deductMeter(meterID, computrons);
          if (notify) {
            notifyMeterThreshold(meterID); // re-queue notification
          }
        }
        // some deliveries should be consumed when they fail
        if (discardFailedDelivery) {
          // kernelKeeper.abortCrank removed all evidence that the crank ever
          // happened, including, notably, the removal of the delivery itself
          // from the head of the run queue, which will result in it being
          // delivered again on the next crank. If we don't want that, then
          // we need to remove it again.

          // eslint-disable-next-line no-use-before-define
          getNextDeliveryMessage();
        }
        // other deliveries should be re-attempted on the next crank, so they
        // get the right error: we leave those on the queue
      }

      // state changes reflecting the termination must also survive, so these
      // happen after a possible abortCrank()
      terminateVat(vatID, reject, info);
      kernelSlog.terminateVat(vatID, reject, info);
      kdebug(`vat terminated: ${JSON.stringify(info)}`);
    }

    if (!didAbort) {
      // eslint-disable-next-line no-use-before-define
      await vatWarehouse.maybeSaveSnapshot();
    }
    kernelKeeper.processRefcounts();
    kernelKeeper.saveStats();
    const crankNum = kernelKeeper.getCrankNumber();
    kernelKeeper.incrementCrankNumber();
    const { crankhash, activityhash } = kernelKeeper.commitCrank();
    kernelSlog.write({
      type: 'crank-finish',
      crankNum,
      crankhash,
      activityhash,
    });
    return harden(policyInput);
  }

  let processQueueRunning;
  async function tryProcessDeliveryMessage(message) {
    if (processQueueRunning) {
      console.error(`We're currently already running at`, processQueueRunning);
      assert.fail(X`Kernel reentrancy is forbidden`);
    }
    processQueueRunning = Error('here');
    return processDeliveryMessage(message).finally(() => {
      processQueueRunning = undefined;
    });
  }

  async function processAcceptanceMessage(message) {
    kdebug(`processAcceptanceQ ${JSON.stringify(message)}`);
    kdebug(legibilizeMessage(message));
    if (processQueueRunning) {
      console.error(`We're currently already running at`, processQueueRunning);
      assert.fail(X`Kernel reentrancy is forbidden`);
    }
    kernelSlog.write({ type: 'crank-start', message });
    /** @type {PolicyInput} */
    const policyInput = ['none'];
    try {
      processQueueRunning = Error('here');

      kernelKeeper.addToRunQueue(message);

      kernelKeeper.processRefcounts();
      kernelKeeper.saveStats();
      const crankNum = kernelKeeper.getCrankNumber();
      kernelKeeper.incrementCrankNumber();
      const { crankhash, activityhash } = kernelKeeper.commitCrank();
      kernelSlog.write({
        type: 'crank-finish',
        crankNum,
        crankhash,
        activityhash,
      });
    } finally {
      processQueueRunning = undefined;
    }
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
    makeNodeWorker,
    startSubprocessWorkerNode,
    startXSnap,
    gcTools,
    defaultManagerType,
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
     * @param {VatSyscallObject} vatSyscallObject
     * @returns {VatSyscallResult}
     */
    function vatSyscallHandler(vatSyscallObject) {
      // eslint-disable-next-line no-use-before-define
      if (!vatWarehouse.lookup(vatID)) {
        // This is a safety check -- this case should never happen unless the
        // vatManager is somehow confused.
        console.error(`vatSyscallHandler invoked on dead vat ${vatID}`);
        const problem = 'vat is dead';
        vatFatalSyscall(vatID, problem);
        return harden(['error', problem]);
      }
      /** @type {KernelSyscallObject | undefined} */
      let ksc;
      /** @type {KernelSyscallResult} */
      let kres = harden(['error', 'incomplete']);
      /** @type {VatSyscallResult} */
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

      /** @type {SlogFinishSyscall} */
      const finish = kernelSlog.syscall(vatID, ksc, vatSyscallObject);

      if (ksc) {
        try {
          // this can throw if kernel is buggy
          kres = kernelSyscallHandler(ksc);

          // kres is a KernelResult: ['ok', value] or ['error', problem],
          // where 'error' means we want the calling vat's syscall() to
          // throw. Vats (liveslots) record the response in the transcript
          // (which is why we use 'null' instead of 'undefined', TODO clean
          // this up #4390), but otherwise most syscalls ignore it. The one
          // syscall that pays attention is callNow(), which assumes it's
          // capdata.

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
    makeVatConsole,
    kernelKeeper,
    panic,
    buildVatSyscallHandler,
    vatAdminRootKref,
    overrideVatManagerOptions,
  });

  const vatWarehouse = makeVatWarehouse(
    kernelKeeper,
    vatLoader,
    warehousePolicy,
  );

  /**
   * Create a dynamically generated vat for testing purposes. Such vats are
   * defined by providing a setup function rather than a bundle and can be
   * instantiated without a controller and without an initialized kernel. These
   * vats are subject to some severe limitations: they will have no reliable
   * persistent state (that is, after the kernel exits, there is no pretense
   * that the swingset could be resumed) and they are limited to local vats.
   * Although they are dynamically creatd, these vats will have names like
   * static vats so that they can be looked up by calling `kernel.vatNameToID()`.
   *
   * @param {string} name Name for the vat
   * @param {any} setup Setup function that will return a dispatcher for the vat
   * @param {any} vatParameters Vat configuration parameters
   * @param {any} creationOptions Options controlling vat creation
   *
   *   This function is intended to provide minimal scaffolding for unit tests and
   *   should never be used in a production environment.
   */
  async function createTestVat(
    name,
    setup,
    vatParameters = {},
    creationOptions = {},
  ) {
    assert.typeof(
      setup,
      'function',
      X`setup is not a function, rather ${setup}`,
    );
    assertKnownOptions(creationOptions, [
      'enablePipelining',
      'metered',
      'reapInterval',
    ]);

    assert(!kernelKeeper.hasVatWithName(name), X`vat ${name} already exists`);

    const vatID = kernelKeeper.allocateVatIDForNameIfNeeded(name);
    logStartup(`assigned VatID ${vatID} for test vat ${name}`);

    if (!creationOptions.reapInterval) {
      creationOptions.reapInterval = 'never';
    }
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    vatKeeper.initializeReapCountdown(creationOptions.reapInterval);

    await vatWarehouse.loadTestVat(vatID, setup, creationOptions);

    const vpCapData = { body: stringify(harden(vatParameters)), slots: [] };
    /** @type {RunQueueEventStartVat} */
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
    assert(kernelKeeper.getInitialized(), X`kernel not initialized`);

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
      // eslint-disable-next-line no-await-in-loop
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

    kernelKeeper.loadStats();
  }

  function getNextDeliveryMessage() {
    const gcMessage = processNextGCAction(kernelKeeper);
    if (gcMessage) {
      return gcMessage;
    }
    const reapMessage = kernelKeeper.nextReapAction();
    if (reapMessage) {
      return reapMessage;
    }

    if (!kernelKeeper.isRunQueueEmpty()) {
      return kernelKeeper.getNextRunQueueMsg();
    }
    return undefined;
  }

  function getNextAcceptanceMessage() {
    if (!kernelKeeper.isAcceptanceQueueEmpty()) {
      return kernelKeeper.getNextAcceptanceQueueMsg();
    }
    return undefined;
  }

  function startProcessingNextMessageIfAny() {
    /** @type {Promise<PolicyInput> | undefined} */
    let resultPromise;
    let message = getNextAcceptanceMessage();
    if (message) {
      resultPromise = processAcceptanceMessage(message);
    } else {
      message = getNextDeliveryMessage();
      if (message) {
        resultPromise = tryProcessDeliveryMessage(message);
      }
    }
    return { resultPromise };
  }

  async function step() {
    if (kernelPanic) {
      throw kernelPanic;
    }
    if (!started) {
      throw new Error('must do kernel.start() before step()');
    }
    const { resultPromise } = startProcessingNextMessageIfAny();
    // process a single message
    if (resultPromise) {
      await resultPromise;
      if (kernelPanic) {
        throw kernelPanic;
      }
      kernelKeeper.commitCrank();
      return 1;
    } else {
      kernelKeeper.commitCrank();
      return 0;
    }
  }

  /**
   * Run the kernel until the policy says to stop, or the queue is empty.
   *
   * @param {RunPolicy | null} policy - A RunPolicy to limit the work being done
   * @returns {Promise<number>} The number of cranks that were executed.
   */

  async function run(policy = foreverPolicy()) {
    assert(policy);
    if (kernelPanic) {
      throw kernelPanic;
    }
    if (!started) {
      throw new Error('must do kernel.start() before run()');
    }
    let count = 0;
    for (;;) {
      const { resultPromise } = startProcessingNextMessageIfAny();
      if (!resultPromise) {
        break;
      }
      count += 1;
      /** @type {PolicyInput} */
      // eslint-disable-next-line no-await-in-loop
      const policyInput = await resultPromise;
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
          assert.fail(`unknown policyInput type in ${policyInput}`);
      }
      if (!policyOutput) {
        // console.log(`ending c.run() by policy, count=${count}`);
        return count;
      }
    }
    kernelKeeper.commitCrank();
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
      kernelKeeper.addBundle(bundleID, bundle);
      const args = harden({ body: JSON.stringify([bundleID]), slots: [] });
      if (vatAdminRootKref) {
        // TODO: consider 'panic' instead of 'logFailure'
        queueToKref(vatAdminRootKref, 'bundleInstalled', args, 'logFailure');
      } else {
        // this should only happen during unit tests that are too lazy to
        // build a complete kernel: test/bundles/test-bundles-kernel.js
        console.log(`installBundle cannot notify, missing vatAdminRootKref`);
      }
      kernelKeeper.commitCrank();
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

  function kpResolution(kpid) {
    const p = kernelKeeper.getKernelPromise(kpid);
    switch (p.state) {
      case 'unresolved':
        assert.fail(X`resolution of ${kpid} is still pending`);
      case 'fulfilled':
      case 'rejected':
        kernelKeeper.decrementRefCount(kpid, 'external');
        for (const kref of p.data.slots) {
          kernelKeeper.incrementRefCount(kref, 'external');
        }
        return p.data;
      default:
        assert.fail(X`invalid state for ${kpid}: ${p.state}`);
    }
  }

  function addDeviceHook(deviceName, hookName, hook) {
    const deviceID = kernelKeeper.getDeviceIDForName(deviceName);
    assert(deviceID, `no such device ${deviceName}`);
    assert(deviceHooks.has(deviceID), `no such device ${deviceID}`);
    const hooks = deviceHooks.get(deviceID);
    assert(hooks, `no hooks for ${deviceName}`);
    hooks[hookName] = hook;
  }

  const kernel = harden({
    // these are meant for the controller
    installBundle,
    start,
    step,
    run,
    shutdown,

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

    getActivityhash() {
      return kernelKeeper.getActivityhash();
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
