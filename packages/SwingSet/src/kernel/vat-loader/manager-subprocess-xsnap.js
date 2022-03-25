// @ts-check
import { assert, details as X, q } from '@agoric/assert';
import { ExitCode } from '@agoric/xsnap/api.js';
import { makeManagerKit } from './manager-helper.js';

import {
  insistVatSyscallObject,
  insistVatDeliveryResult,
} from '../../lib/message.js';
import '../../types-ambient.js';
import './types.js';

// eslint-disable-next-line no-unused-vars
function parentLog(first, ...args) {
  // console.error(`--parent: ${first}`, ...args);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * @param {{
 *   allVatPowers: VatPowers;
 *   kernelKeeper: KernelKeeper;
 *   kernelSlog: KernelSlog;
 *   startXSnap: (
 *     name: string,
 *     handleCommand: AsyncHandler,
 *     metered?: boolean,
 *     snapshotHash?: string,
 *   ) => Promise<XSnap>;
 *   testLog: (...args: unknown[]) => void;
 * }} tools
 * @returns {VatManagerFactory}
 *
 * @typedef {{ moduleFormat: 'getExport'; source: string }} ExportBundle
 *
 * @typedef {(msg: Uint8Array) => Promise<Uint8Array>} AsyncHandler
 */
export function makeXsSubprocessFactory({
  kernelKeeper,
  kernelSlog,
  startXSnap,
  testLog,
}) {
  /**
   * @param {string} vatID
   * @param {unknown} bundle
   * @param {ManagerOptions} managerOptions
   * @param {(vso: VatSyscallObject) => VatSyscallResult} vatSyscallHandler
   */
  async function createFromBundle(
    vatID,
    bundle,
    managerOptions,
    vatSyscallHandler,
  ) {
    parentLog(vatID, 'createFromBundle', { vatID });
    const {
      virtualObjectCacheSize,
      enableDisavow,
      enableVatstore,
      gcEveryCrank = true,
      name,
      metered,
      compareSyscalls,
      useTranscript,
      liveSlotsConsole,
      vatConsole,
    } = managerOptions;
    assert(
      !managerOptions.enableSetup,
      'xs-worker: enableSetup not supported at all',
    );
    assert(useTranscript, 'xs-worker: useTranscript=false not supported');

    const mk = makeManagerKit(
      vatID,
      kernelSlog,
      kernelKeeper,
      vatSyscallHandler,
      true,
      compareSyscalls,
      useTranscript,
    );

    /** @type {(item: Tagged) => unknown} */
    function handleUpstream([type, ...args]) {
      parentLog(vatID, `handleUpstream`, type, args.length);
      switch (type) {
        case 'syscall': {
          parentLog(vatID, `syscall`, args[0], args.length);
          const vso = args[0];
          insistVatSyscallObject(vso);
          return mk.syscallFromWorker(vso);
        }
        case 'liveSlotsConsole':
        case 'console': {
          const [level, ...rest] = args;
          // Choose the right console.
          const myConsole =
            (type === 'liveSlotsConsole' && liveSlotsConsole) || vatConsole;
          if (typeof level === 'string' && level in myConsole) {
            myConsole[level](...rest);
          } else {
            console.error(`bad ${type} level`, level);
          }
          return ['ok'];
        }
        case 'testLog':
          testLog(...args);
          return ['OK'];
        default:
          assert.fail(X`unrecognized uplink message ${type}`);
      }
    }

    /** @type {(msg: Uint8Array) => Promise<Uint8Array>} */
    async function handleCommand(msg) {
      // parentLog('handleCommand', { length: msg.byteLength });
      const tagged = handleUpstream(JSON.parse(decoder.decode(msg)));
      return encoder.encode(JSON.stringify(tagged));
    }

    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const lastSnapshot = vatKeeper.getLastSnapshot();

    // start the worker and establish a connection
    const worker = await startXSnap(
      `${vatID}:${name}`,
      handleCommand,
      metered,
      lastSnapshot ? lastSnapshot.snapshotID : undefined,
    );

    /** @type {(item: Tagged) => Promise<CrankResults>} */
    async function issueTagged(item) {
      parentLog(item[0], '...', item.length - 1);
      const result = await worker.issueStringCommand(JSON.stringify(item));
      const reply = JSON.parse(result.reply);
      assert(Array.isArray(reply));
      const [tag, ...rest] = reply;
      return { ...result, reply: [tag, ...rest] };
    }

    if (lastSnapshot) {
      parentLog(vatID, `snapshot loaded. dispatch ready.`);
    } else {
      parentLog(vatID, `instructing worker to load bundle..`);
      const { reply: bundleReply } = await issueTagged([
        'setBundle',
        vatID,
        bundle,
        virtualObjectCacheSize,
        enableDisavow,
        enableVatstore,
        gcEveryCrank,
      ]);
      if (bundleReply[0] === 'dispatchReady') {
        parentLog(vatID, `bundle loaded. dispatch ready.`);
      } else {
        const [_tag, errName, message] = bundleReply;
        assert.fail(X`setBundle failed: ${q(errName)}: ${q(message)}`);
      }
    }

    /**
     * @param {VatDeliveryObject} delivery
     * @returns {Promise<VatDeliveryResult>}
     */
    async function deliverToWorker(delivery) {
      parentLog(vatID, `sending delivery`, delivery);
      let result;
      try {
        result = await issueTagged(['deliver', delivery]);
      } catch (err) {
        parentLog('issueTagged error:', err.code, err.message);
        let message;
        switch (err.code) {
          case ExitCode.E_TOO_MUCH_COMPUTATION:
            message = 'Compute meter exceeded';
            break;
          case ExitCode.E_STACK_OVERFLOW:
            message = 'Stack meter exceeded';
            break;
          case ExitCode.E_NOT_ENOUGH_MEMORY:
            message = 'Allocate meter exceeded';
            break;
          default:
            // non-metering failure. crash.
            throw err;
        }
        return harden(['error', message, null]);
      }

      parentLog(vatID, `deliverDone`, result.reply[0], result.reply.length);
      // Attach the meterUsage to the deliver result.
      const deliverResult = harden([
        result.reply[0], // 'ok' or 'error'
        result.reply[1] || null, // problem or null
        result.meterUsage || null, // meter usage statistics or null
      ]);
      insistVatDeliveryResult(deliverResult);
      return deliverResult;
    }
    mk.setDeliverToWorker(deliverToWorker);

    function shutdown() {
      return worker.close().then(_ => undefined);
    }
    /**
     * @param {SnapStore} snapStore
     * @returns {Promise<string>}
     */
    function makeSnapshot(snapStore) {
      return snapStore.save(fn => worker.snapshot(fn));
    }

    return mk.getManager(shutdown, makeSnapshot);
  }

  return harden({ createFromBundle });
}
