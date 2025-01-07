// import { spawn } from 'child_process'; // not from Compartment

import { assert, Fail } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { makePromiseKit } from '@endo/promise-kit';
import { makeManagerKit } from './manager-helper.js';

// start a "Worker" (Node's tool for starting new threads) and load a bundle
// into it

// eslint-disable-next-line no-unused-vars
function parentLog(first, ...args) {
  // console.error(`--parent: ${first}`, ...args);
}

export function makeNodeSubprocessFactory(tools) {
  const { startSubprocessWorker, testLog } = tools;

  async function createFromBundle(
    vatID,
    bundle,
    managerOptions,
    liveSlotsOptions,
  ) {
    assert(!managerOptions.enableSetup, 'not supported at all');
    assert(
      managerOptions.useTranscript,
      'node-subprocess: useTranscript=false not supported',
    );
    const { name, workerOptions } = managerOptions;
    const { nodeOptions } = workerOptions;

    !nodeOptions ||
      Array.isArray(nodeOptions) ||
      Fail`nodeOptions must be an array`;

    // Node worker subprocess adds `nameDisplayArg` as a dummy argument so that
    // 'ps' shows which worker is for which vat
    const nameDisplayArg = `${vatID}:${name !== undefined ? name : ''}`;

    const mk = makeManagerKit();

    // start the worker and establish a connection
    const { fromChild, toChild, done } = startSubprocessWorker(
      nameDisplayArg,
      vatID,
      nodeOptions,
    );

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
     * @param {import('@agoric/swingset-liveslots').VatDeliveryObject} delivery
     * @returns {Promise<import('@agoric/swingset-liveslots').VatDeliveryResult>}
     */
    async function deliverToWorker(delivery) {
      parentLog(`sending delivery`, delivery);
      !waiting || Fail`already waiting for delivery`;
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
        dispatchIsReady(undefined);
      } else if (type === 'syscall') {
        parentLog(`syscall`, args);
        const [vatSyscallObject] = args;
        const vsr = mk.syscallFromWorker(vatSyscallObject);
        sendToWorker(vsr);
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
    sendToWorker(['setBundle', vatID, bundle, liveSlotsOptions]);

    async function shutdown() {
      // terminate(); // XXX currently disabled since it breaks profiling; we should revisit if we develop a problem with worker vat processes refusing to exit when requested to do so
      sendToWorker(['exit']);
      return E.when(done, _ => undefined);
    }
    const manager = mk.getManager(shutdown);
    return dispatchReadyP.then(() => manager);
  }

  return harden({ createFromBundle });
}
