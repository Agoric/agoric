import { synchronizedTee } from '@agoric/internal';
import { assert, Fail, q } from '@endo/errors';
import { ExitCode } from '@agoric/xsnap/api.js';
import { makeManagerKit } from './manager-helper.js';

import {
  insistVatSyscallObject,
  insistVatDeliveryResult,
} from '../../lib/message.js';

/// <reference path="../../types-ambient.js" />

/**
 * @import {VatDeliveryObject} from '@agoric/swingset-liveslots'
 * @import {VatDeliveryResult} from '@agoric/swingset-liveslots'
 * @import {VatSyscallObject} from '@agoric/swingset-liveslots'
 * @import {VatSyscallResult} from '@agoric/swingset-liveslots'
 * @import {LiveSlotsOptions} from '@agoric/swingset-liveslots'
 * @import {VatManagerFactory} from '../../types-internal.js'
 */

// eslint-disable-next-line no-unused-vars
function parentLog(first, ...args) {
  // console.error(`--parent: ${first}`, ...args);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** @param { (item: import('./types.js').Tagged) => unknown } [handleUpstream] */
const makeRevokableHandleCommandKit = handleUpstream => {
  /**
   * @param {Uint8Array} msg
   * @returns {Promise<Uint8Array>}
   */
  const handleCommand = async msg => {
    // parentLog('handleCommand', { length: msg.byteLength });
    if (!handleUpstream) {
      throw Fail`Worker received command after revocation`;
    }
    const tagged = handleUpstream(JSON.parse(decoder.decode(msg)));
    return encoder.encode(JSON.stringify(tagged));
  };
  const revoke = () => {
    handleUpstream = undefined;
  };
  return harden({ handleCommand, revoke });
};

/**
 * @param {{
 *   kernelKeeper: KernelKeeper,
 *   kernelSlog: KernelSlog,
 *   startXSnap: import('../../controller/startXSnap.js').StartXSnap,
 *   testLog: (...args: unknown[]) => void,
 * }} tools
 * @returns {VatManagerFactory}
 *
 * @typedef { { moduleFormat: 'getExport', source: string } } ExportBundle
 * @typedef { (msg: Uint8Array) => Promise<Uint8Array> } AsyncHandler
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
   * @param {import('../../types-internal.js').ManagerOptions} managerOptions
   * @param {LiveSlotsOptions} liveSlotsOptions
   */
  async function createFromBundle(
    vatID,
    bundle,
    managerOptions,
    liveSlotsOptions,
  ) {
    parentLog(vatID, 'createFromBundle', { vatID });
    const {
      name: vatName,
      metered,
      useTranscript,
      sourcedConsole,
      workerOptions,
    } = managerOptions;
    assert(
      !managerOptions.enableSetup,
      'xsnap: enableSetup not supported at all',
    );
    assert(useTranscript, 'xsnap: useTranscript=false not supported');
    assert(workerOptions.type === 'xsnap');
    const { bundleIDs } = workerOptions;
    assert(bundleIDs, 'bundleIDs required for xsnap');

    const mk = makeManagerKit();

    /** @type { (item: import('./types.js').Tagged) => unknown } */
    function handleUpstream([type, ...args]) {
      parentLog(vatID, `handleUpstream`, type, args.length);
      switch (type) {
        case 'syscall': {
          parentLog(vatID, `syscall`, args[0], args.length);
          const vso = args[0];
          insistVatSyscallObject(vso);
          return mk.syscallFromWorker(vso);
        }
        case 'sourcedConsole': {
          const [source, level, ...rest] = args;
          // Choose the right console.
          if (typeof level === 'string' && level in sourcedConsole) {
            sourcedConsole[level](source, ...rest);
          } else {
            console.error(`bad ${type} level`, level);
          }
          return ['ok'];
        }
        case 'testLog': {
          testLog(...args);
          return ['OK'];
        }
        default: {
          throw Fail`unrecognized uplink message ${type}`;
        }
      }
    }

    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const snapshotInfo = vatKeeper.getSnapshotInfo();
    if (snapshotInfo) {
      kernelSlog.write({ type: 'heap-snapshot-load', vatID, ...snapshotInfo });
    }

    // `startXSnap` adds `nameDisplayArg` as a dummy argument so that 'ps'
    // shows which worker is for which vat, but is careful to prevent
    // a shell-escape attack
    const nameDisplayArg = `${vatID}:${vatName !== undefined ? vatName : ''}`;

    /** @type {ReturnType<typeof makeRevokableHandleCommandKit> | undefined} */
    let handleCommandKit = makeRevokableHandleCommandKit(handleUpstream);

    // start the worker and establish a connection
    let worker = await startXSnap(nameDisplayArg, {
      bundleIDs,
      vatID,
      handleCommand: handleCommandKit.handleCommand,
      metered,
      init: snapshotInfo && { from: 'snapStore', vatID },
    });

    /** @type { (item: import('./types.js').Tagged) => Promise<import('./types.js').WorkerResults> } */
    async function issueTagged(item) {
      parentLog(item[0], '...', item.length - 1);
      const result = await worker.issueStringCommand(JSON.stringify(item));
      // note: if 'result.reply' is empty, that probably means the
      // worker reached end-of-crank (idle) without seeing the
      // `dispatch()` promise resolve
      const reply = JSON.parse(result.reply);
      assert(Array.isArray(reply));
      const [tag, ...rest] = reply;
      return { ...result, reply: [tag, ...rest] };
    }

    if (snapshotInfo) {
      parentLog(vatID, `snapshot loaded. dispatch ready.`);
    } else {
      parentLog(vatID, `instructing worker to load bundle..`);
      const { reply: bundleReply } = await issueTagged([
        'setBundle',
        vatID,
        bundle,
        liveSlotsOptions,
      ]);
      if (bundleReply[0] === 'dispatchReady') {
        parentLog(vatID, `bundle loaded. dispatch ready.`);
      } else {
        const [_tag, errName, message] = bundleReply;
        Fail`setBundle failed: ${q(errName)}: ${q(message)}`;
      }
    }

    /**
     * @param { VatDeliveryObject} delivery
     * @returns {Promise<VatDeliveryResult>}
     */
    async function deliverToWorker(delivery) {
      parentLog(vatID, `sending delivery`, delivery);
      /** @type { import('./types.js').WorkerResults } */
      let result;
      await null;
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
      /** @type { VatDeliveryResult } */

      // @ts-expect-error I don't know how to appease tsc
      const deliverResult = harden([
        result.reply[0], // 'ok' or 'error'
        result.reply[1] || null, // results or problem or null
        result.meterUsage || null, // meter usage statistics or null
      ]);
      insistVatDeliveryResult(deliverResult);
      return deliverResult;
    }
    mk.setDeliverToWorker(deliverToWorker);

    async function shutdown() {
      handleCommandKit?.revoke();
      handleCommandKit = undefined;
      return worker.close().then(_ => undefined);
    }
    /**
     * @param {number} snapPos
     * @param {SnapStore} snapStore
     * @param {boolean} [restartWorker]
     * @returns {Promise<SnapshotResult>}
     */
    async function makeSnapshot(snapPos, snapStore, restartWorker) {
      const snapshotDescription = `${vatID}-${snapPos}`;
      const snapshotStream = worker.makeSnapshotStream(snapshotDescription);

      if (!restartWorker) {
        return snapStore.saveSnapshot(vatID, snapPos, snapshotStream);
      }

      /** @type {AsyncGenerator<Uint8Array, void, void>[]} */
      const [restartWorkerStream, snapStoreSaveStream] = synchronizedTee(
        snapshotStream,
        2,
      );

      handleCommandKit?.revoke();
      handleCommandKit = makeRevokableHandleCommandKit(handleUpstream);

      let snapshotResults;
      const closeP = worker.close();
      [worker, snapshotResults] = await Promise.all([
        startXSnap(nameDisplayArg, {
          bundleIDs,
          vatID,
          handleCommand: handleCommandKit.handleCommand,
          metered,
          init: {
            from: 'snapshotStream',
            snapshotStream: restartWorkerStream,
            snapshotDescription,
          },
        }),
        snapStore.saveSnapshot(vatID, snapPos, snapStoreSaveStream),
      ]);
      await closeP;

      /** @type {Partial<import('@agoric/swing-store').SnapshotInfo>} */
      const reloadSnapshotInfo = {
        snapPos,
        hash: snapshotResults.hash,
      };

      kernelSlog.write({
        type: 'heap-snapshot-load',
        vatID,
        ...reloadSnapshotInfo,
      });

      return snapshotResults;
    }

    return mk.getManager(shutdown, makeSnapshot);
  }

  return harden({ createFromBundle });
}
