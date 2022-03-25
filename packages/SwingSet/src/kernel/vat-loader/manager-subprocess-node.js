// import { spawn } from 'child_process'; // not from Compartment

import { assert, details as X } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';
import { makeManagerKit } from './manager-helper.js';

// start a "Worker" (Node's tool for starting new threads) and load a bundle
// into it

// eslint-disable-next-line no-unused-vars
function parentLog(first, ...args) {
  // console.error(`--parent: ${first}`, ...args);
}

export function makeNodeSubprocessFactory(tools) {
  const { startSubprocessWorker, kernelKeeper, kernelSlog, testLog } = tools;

  function createFromBundle(vatID, bundle, managerOptions, vatSyscallHandler) {
    const {
      virtualObjectCacheSize,
      enableDisavow,
      enableVatstore,
      compareSyscalls,
      useTranscript,
    } = managerOptions;
    assert(!managerOptions.enableSetup, 'not supported at all');
    assert(useTranscript, 'node-subprocess: useTranscript=false not supported');

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
    const { fromChild, toChild, terminate, done } = startSubprocessWorker();

    function sendToWorker(msg) {
      assert(Array.isArray(msg));
      toChild.write(msg);
    }

    // TODO: make the worker responsible for checking themselves: we send
    // both the delivery and the expected syscalls, and the supervisor
    // compares what the bundle does with what it was told to expect.
    // Modulo flow control, we just stream transcript entries at the
    // worker and eventually get back an "ok" or an error. When we do
    // that, doSyscall won't even see replayed syscalls from the worker.

    const { promise: dispatchReadyP, resolve: dispatchIsReady } =
      makePromiseKit();
    let waiting;

    /**
     * @param {VatDeliveryObject} delivery
     * @returns {Promise<VatDeliveryResult>}
     */
    function deliverToWorker(delivery) {
      parentLog(`sending delivery`, delivery);
      assert(!waiting, X`already waiting for delivery`);
      const pr = makePromiseKit();
      waiting = pr.resolve;
      sendToWorker(['deliver', delivery]);
      return pr.promise;
    }
    mk.setDeliverToWorker(deliverToWorker);

    function handleUpstream([type, ...args]) {
      parentLog(`received`, type);
      if (type === 'setUplinkAck') {
        parentLog(`upload ready`);
      } else if (type === 'gotBundle') {
        parentLog(`bundle loaded`);
      } else if (type === 'dispatchReady') {
        parentLog(`dispatch() ready`);
        // wait10ms().then(dispatchIsReady); // stall to let logs get printed
        dispatchIsReady();
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

    fromChild.on('data', handleUpstream);

    parentLog(`instructing worker to load bundle..`);
    sendToWorker([
      'setBundle',
      bundle,
      virtualObjectCacheSize,
      enableDisavow,
      enableVatstore,
    ]);

    function shutdown() {
      terminate();
      return done.then(_ => undefined);
    }
    const manager = mk.getManager(shutdown);
    return dispatchReadyP.then(() => manager);
  }

  return harden({ createFromBundle });
}
