/* global globalThis WeakRef FinalizationRegistry */
// @ts-check
import { assert, details as X } from '@agoric/assert';
import { importBundle } from '@endo/import-bundle';
import { makeMarshal } from '@endo/marshal';
import '../../types-ambient.js';
// grumble... waitUntilQuiescent is exported and closes over ambient authority
import { waitUntilQuiescent } from '../../lib-nodejs/waitUntilQuiescent.js';
import { makeGcAndFinalize } from '../../lib-nodejs/gc-and-finalize.js';
import {
  insistVatDeliveryObject,
  insistVatSyscallResult,
} from '../../lib/message.js';

import { makeLiveSlots } from '../../liveslots/liveslots.js';
import {
  makeSupervisorDispatch,
  makeSupervisorSyscall,
  makeVatConsole,
} from '../supervisor-helper.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// eslint-disable-next-line no-unused-vars
function workerLog(first, ...args) {
  // eslint-disable-next-line
  // console.log(`---worker: ${first}`, ...args);
}

workerLog(`supervisor started`);

function makeMeterControl() {
  let meteringDisabled = 0;

  function isMeteringDisabled() {
    return !!meteringDisabled;
  }

  function assertIsMetered(msg) {
    assert(!meteringDisabled, msg);
  }
  function assertNotMetered(msg) {
    assert(!!meteringDisabled, msg);
  }

  function runWithoutMetering(thunk) {
    const limit = globalThis.currentMeterLimit();
    const before = globalThis.resetMeter(0, 0);
    meteringDisabled += 1;
    try {
      return thunk();
    } finally {
      globalThis.resetMeter(limit, before);
      meteringDisabled -= 1;
    }
  }

  async function runWithoutMeteringAsync(thunk) {
    const limit = globalThis.currentMeterLimit();
    const before = globalThis.resetMeter(0, 0);
    meteringDisabled += 1;
    return Promise.resolve()
      .then(() => thunk())
      .finally(() => {
        globalThis.resetMeter(limit, before);
        meteringDisabled -= 1;
      });
  }

  // return a version of f that runs outside metering
  function unmetered(f) {
    function wrapped(...args) {
      return runWithoutMetering(() => f(...args));
    }
    return harden(wrapped);
  }

  /** @type {MeterControl} */
  const meterControl = {
    isMeteringDisabled,
    assertIsMetered,
    assertNotMetered,
    runWithoutMetering,
    runWithoutMeteringAsync,
    unmetered,
  };
  return harden(meterControl);
}

const meterControl = makeMeterControl();

/**
 * Wrap byte-level protocols with tagged array codec.
 *
 * @param {(cmd: ArrayBuffer) => ArrayBuffer} issueCommand As from xsnap
 *
 * @typedef {[unknown, ...unknown[]]} Tagged Tagged array
 */
function managerPort(issueCommand) {
  /** @type {(item: Tagged) => ArrayBuffer} */
  const encode = item => {
    let txt;
    try {
      txt = JSON.stringify(item);
    } catch (nope) {
      workerLog(nope.message, item);
      throw nope;
    }
    return encoder.encode(txt).buffer;
  };

  /** @type {(msg: ArrayBuffer) => any} */
  const decodeData = msg => JSON.parse(decoder.decode(msg) || 'null');

  /** @type {(msg: ArrayBuffer) => Tagged} */
  function decode(msg) {
    /** @type {Tagged} */
    const item = decodeData(msg);
    assert(Array.isArray(item), X`expected array`);
    assert(item.length > 0, X`empty array lacks tag`);
    return item;
  }

  return harden({
    /** @type {(item: Tagged) => void} */
    send: item => {
      issueCommand(encode(item));
    },
    /** @type {(item: Tagged) => unknown} */
    call: item => decodeData(issueCommand(encode(item))),

    /**
     * Wrap an async Tagged handler in the xsnap async reporting idiom.
     *
     * @template T
     * @param {(item: Tagged) => Promise<Tagged>} f Async Tagged handler
     * @returns {(msg: ArrayBuffer) => Report<ArrayBuffer>} Xsnap style handleCommand
     *
     * @typedef {{ result?: T }} Report<T> Report T when idle
     */
    handlerFrom(f) {
      const lastResort = encoder.encode(`exception from ${f.name}`).buffer;
      return msg => {
        const report = {};
        f(decode(msg))
          .then(item => {
            workerLog('result', item);
            report.result = encode(item);
          })
          .catch(err => {
            report.result = encode(['err', err.name, err.message]);
          })
          .catch(_err => {
            report.result = lastResort;
          });
        return report;
      };
    },
  });
}

// please excuse copy-and-paste from kernel.js
function abbreviateReplacer(_, arg) {
  if (typeof arg === 'bigint') {
    // since testLog is only for testing, 2^53 is enough.
    // precedent: 32a1dd3
    return Number(arg);
  }
  if (typeof arg === 'string' && arg.length >= 40) {
    // truncate long strings
    return `${arg.slice(0, 15)}...${arg.slice(arg.length - 15)}`;
  }
  return arg;
}

/** @param {ReturnType<typeof managerPort>} port */
function makeWorker(port) {
  /**
   * @type {| ((delivery: VatDeliveryObject) => Promise<VatDeliveryResult>)
   *   | null}
   */
  let dispatch = null;

  /**
   * @param {unknown} vatID
   * @param {unknown} bundle
   * @param {unknown} virtualObjectCacheSize
   * @param {boolean} enableDisavow
   * @param {boolean} enableVatstore
   * @param {boolean} [gcEveryCrank]
   * @returns {Promise<Tagged>}
   */
  async function setBundle(
    vatID,
    bundle,
    virtualObjectCacheSize,
    enableDisavow,
    enableVatstore,
    gcEveryCrank,
  ) {
    /** @type {(vso: VatSyscallObject) => VatSyscallResult} */
    function syscallToManager(vatSyscallObject) {
      workerLog('doSyscall', vatSyscallObject);
      const result = port.call(['syscall', vatSyscallObject]);
      workerLog(' ... syscall result:', result);
      insistVatSyscallResult(result);
      return result;
    }

    const syscall = makeSupervisorSyscall(syscallToManager, true);

    const vatPowers = {
      makeMarshal,
      testLog: (...args) =>
        port.send([
          'testLog',
          ...args.map(arg =>
            typeof arg === 'string'
              ? arg
              : JSON.stringify(arg, abbreviateReplacer),
          ),
        ]),
    };

    const cacheSize =
      typeof virtualObjectCacheSize === 'number'
        ? virtualObjectCacheSize
        : undefined;

    const gcTools = harden({
      WeakRef,
      FinalizationRegistry,
      waitUntilQuiescent,
      // FIXME(mfig): Here is where GC-per-crank is silently disabled.
      // We need to do a better analysis of the tradeoffs.
      gcAndFinalize: makeGcAndFinalize(gcEveryCrank && globalThis.gc),
      meterControl,
    });

    /** @param {string} dst */
    const makeLogMaker = dst => {
      /** @param {string} level */
      const makeLog = level => {
        // Capture the `console.log`, etc.'s `printAll` function.
        const printAll = console[level];
        assert.typeof(printAll, 'function');
        const portSendingPrinter = (...args) => {
          port.send([dst, level, ...args]);
        };
        return (...args) => {
          // Use the causal console, but output to the port.
          //
          // FIXME: This is a hack until the start compartment can create
          // Console objects that log to a different destination than
          // `globalThis.console`.
          const { print: savePrinter } = globalThis;
          try {
            globalThis.print = portSendingPrinter;
            printAll(...args);
          } finally {
            globalThis.print = savePrinter;
          }
        };
      };
      return makeLog;
    };

    const workerEndowments = {
      console: makeVatConsole(makeLogMaker('console')),
      assert,
      // bootstrap provides HandledPromise
      HandledPromise: globalThis.HandledPromise,
      TextEncoder,
      TextDecoder,
      Base64: globalThis.Base64, // Present only in XSnap
    };

    async function buildVatNamespace(
      lsEndowments,
      inescapableGlobalProperties,
    ) {
      const vatNS = await importBundle(bundle, {
        endowments: { ...workerEndowments, ...lsEndowments },
        inescapableGlobalProperties,
      });
      workerLog(`got vatNS:`, Object.keys(vatNS).join(','));
      return vatNS;
    }

    const ls = makeLiveSlots(
      syscall,
      vatID,
      vatPowers,
      cacheSize,
      enableDisavow,
      enableVatstore,
      gcTools,
      makeVatConsole(makeLogMaker('liveSlotsConsole')),
      buildVatNamespace,
    );

    assert(ls.dispatch);
    dispatch = makeSupervisorDispatch(ls.dispatch);
    workerLog(`got dispatch`);
    return ['dispatchReady'];
  }

  /** @type {(item: Tagged) => Promise<Tagged>} */
  async function handleItem([tag, ...args]) {
    workerLog('handleItem', tag, args.length);
    switch (tag) {
      case 'setBundle': {
        assert(!dispatch, 'cannot setBundle again');
        const enableDisavow = !!args[3];
        const enableVatstore = !!args[4];
        const gcEveryCrank = args[5] === undefined ? true : !!args[5];
        return setBundle(
          args[0],
          args[1],
          args[2],
          enableDisavow,
          enableVatstore,
          gcEveryCrank,
        );
      }
      case 'deliver': {
        assert(dispatch, 'cannot deliver before setBundle');
        const [vatDeliveryObject] = args;
        insistVatDeliveryObject(vatDeliveryObject);
        return dispatch(vatDeliveryObject);
      }
      default:
        workerLog('handleItem: bad tag', tag, args.length);
        return ['bad tag', tag];
    }
  }

  return harden({
    handleItem,
  });
}

// xsnap provides issueCommand global
const port = managerPort(globalThis.issueCommand);
const worker = makeWorker(port);
globalThis.handleCommand = port.handlerFrom(worker.handleItem);
