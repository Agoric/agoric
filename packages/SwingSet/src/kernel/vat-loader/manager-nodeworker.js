// @ts-check
// import { Worker } from 'worker_threads'; // not from a Compartment
import { assert, details as X } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';
import { makeManagerKit } from './manager-helper.js';

// start a "Worker" (Node's tool for starting new threads) and load a bundle
// into it

/*
import { waitUntilQuiescent } from '../../waitUntilQuiescent';
function wait10ms() {
  const { promise: queueEmptyP, resolve } = makePromiseKit();
  setTimeout(() => resolve(), 10);
  return queueEmptyP;
}
*/

// eslint-disable-next-line no-unused-vars
function parentLog(first, ...args) {
  // console.error(`--parent: ${first}`, ...args);
}

/** @typedef {import('worker_threads').Worker} Worker */

/**
 * @param {{
 *   makeNodeWorker: () => Worker;
 *   kernelKeeper: KernelKeeper;
 *   kernelSlog: KernelSlog;
 *   testLog: (...args: unknown[]) => void;
 * }} tools
 * @returns {VatManagerFactory}
 */
export function makeNodeWorkerVatManagerFactory(tools) {
  const { makeNodeWorker, kernelKeeper, kernelSlog, testLog } = tools;

  function createFromBundle(vatID, bundle, managerOptions, vatSyscallHandler) {
    const {
      virtualObjectCacheSize,
      enableDisavow,
      enableVatstore,
      compareSyscalls,
      useTranscript,
    } = managerOptions;
    assert(!managerOptions.enableSetup, 'not supported at all');
    assert(useTranscript, 'node worker: useTranscript=false not supported');

    // We use workerCanBlock=false because we get syscalls via an async
    // postMessage from the worker thread, whose vat code has moved on (it
    // really wants a synchronous/immediate syscall)
    const mk = makeManagerKit(
      vatID,
      kernelSlog,
      kernelKeeper,
      vatSyscallHandler,
      false,
      compareSyscalls,
      useTranscript,
    );

    // start the worker and establish a connection

    const { promise: workerP, resolve: gotWorker } = makePromiseKit();

    function sendToWorker(msg) {
      assert(msg instanceof Array);
      workerP.then(worker => worker.postMessage(msg));
    }

    const { promise: dispatchReadyP, resolve: dispatchIsReady } =
      makePromiseKit();
    let waiting;

    function handleUpstream([type, ...args]) {
      parentLog(`received`, type);
      if (type === 'setUplinkAck') {
        parentLog(`upload ready`);
      } else if (type === 'gotBundle') {
        parentLog(`bundle loaded`);
      } else if (type === 'dispatchReady') {
        parentLog(`dispatch() ready`);
        // wait10ms().then(dispatchIsReady); // stall to let logs get printed
        dispatchIsReady(undefined);
      } else if (type === 'syscall') {
        parentLog(`syscall`, args);
        const [vatSyscallObject] = args;
        mk.syscallFromWorker(vatSyscallObject);
      } else if (type === 'testLog') {
        testLog(...args);
      } else if (type === 'deliverDone') {
        parentLog(`deliverDone`);
        if (waiting) {
          const resolve = waiting;
          waiting = null;
          const [vatDeliveryResults] = args;
          resolve(vatDeliveryResults);
        }
      } else {
        parentLog(`unrecognized uplink message ${type}`);
      }
    }

    const worker = makeNodeWorker();
    worker.on('message', handleUpstream);
    gotWorker(worker);

    parentLog(`instructing worker to load bundle..`);
    sendToWorker([
      'setBundle',
      bundle,
      virtualObjectCacheSize,
      enableDisavow,
      enableVatstore,
    ]);

    function deliverToWorker(delivery) {
      parentLog(`sending delivery`, delivery);
      assert(!waiting, X`already waiting for delivery`);
      const pr = makePromiseKit();
      waiting = pr.resolve;
      sendToWorker(['deliver', delivery]);
      return pr.promise;
    }
    mk.setDeliverToWorker(deliverToWorker);

    function shutdown() {
      // this returns a Promise that fulfills with 1 if we used
      // worker.terminate(), otherwise with the `exitCode` passed to
      // `process.exit(exitCode)` within the worker.
      return worker.terminate().then(_ => undefined);
    }
    const manager = mk.getManager(shutdown);
    return dispatchReadyP.then(() => manager);
  }

  return harden({ createFromBundle });
}
