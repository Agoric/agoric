// @ts-check
import { assert } from '@agoric/assert';
import {
  insistVatSyscallObject,
  insistVatSyscallResult,
} from '../lib/message.js';
import '../types-ambient.js';

/**
 * @typedef {(
 *   delivery: VatDeliveryObject,
 * ) => VatDeliveryResult | Promise<VatDeliveryResult>} VatDispatcherSyncAsync
 *
 * @typedef {(delivery: VatDeliveryObject) => Promise<VatDeliveryResult>} VatDispatcher
 */

/**
 * Given the liveslots 'dispatch' function, return a version that never rejects.
 * It will always return a VatDeliveryResult, even if liveslots throws or
 * rejects. All supervisors should wrap the liveslots `dispatch` function with
 * this one, and call it in response to messages from the manager process.
 *
 * @param {VatDispatcherSyncAsync} dispatch
 * @returns {VatDispatcher}
 */
function makeSupervisorDispatch(dispatch) {
  /**
   * @param {VatDeliveryObject} delivery
   * @returns {Promise<VatDeliveryResult>}
   */
  async function dispatchToVat(delivery) {
    // the (low-level) vat is responsible for giving up agency, but we still
    // protect against exceptions
    return Promise.resolve(delivery)
      .then(dispatch)
      .then(
        () => harden(['ok', null, null]),
        err => {
          // TODO react more thoughtfully, maybe terminate the vat
          console.log(`error ${err} during vat dispatch() of ${delivery}`);
          return harden(['error', `${err.message}`, null]);
        },
      );
  }

  return harden(dispatchToVat);
}
harden(makeSupervisorDispatch);
export { makeSupervisorDispatch };

/**
 * This returns a function that is provided to liveslots as the 'syscall'
 * argument: an object with one method per syscall type. These methods return
 * data, or nothing. If the kernel experiences a problem executing the syscall,
 * the method will throw, or the kernel will kill the vat, or both.
 *
 * I should be given a `syscallToManager` function that accepts a
 * VatSyscallObject and (synchronously) returns a VatSyscallResult.
 *
 * @param {VatSyscaller} syscallToManager
 * @param {boolean} workerCanBlock
 *
 * @typedef {unknown} TheSyscallObjectWithMethodsThatLiveslotsWants
 * @returns {TheSyscallObjectWithMethodsThatLiveslotsWants}
 */
function makeSupervisorSyscall(syscallToManager, workerCanBlock) {
  function doSyscall(fields) {
    insistVatSyscallObject(fields);
    /** @type {VatSyscallObject} */
    const vso = harden(fields);
    let r;
    try {
      r = syscallToManager(vso);
    } catch (err) {
      console.log(`worker got error during syscall:`, err);
      throw err;
    }
    if (!workerCanBlock) {
      // we don't expect an answer
      return null;
    }
    const vsr = r;
    insistVatSyscallResult(vsr);
    const [type, ...rest] = vsr;
    switch (type) {
      case 'ok': {
        const [data] = rest;
        return data;
      }
      case 'error': {
        const [err] = rest;
        throw Error(`syscall.${fields[0]} failed: ${err}`);
      }
      default:
        throw Error(`unknown result type ${type}`);
    }
  }

  // this will be given to liveslots, it should have distinct methods that
  // return immediate results or throw errors
  const syscallForVat = {
    /**
     * @type {(
     *   target: string,
     *   method: string,
     *   args: SwingSetCapData,
     *   result?: string,
     * ) => unknown}
     */
    send: (target, method, args, result) =>
      doSyscall(['send', target, { method, args, result }]),
    subscribe: vpid => doSyscall(['subscribe', vpid]),
    resolve: resolutions => doSyscall(['resolve', resolutions]),
    exit: (isFailure, data) => doSyscall(['exit', isFailure, data]),
    dropImports: vrefs => doSyscall(['dropImports', vrefs]),
    retireImports: vrefs => doSyscall(['retireImports', vrefs]),
    retireExports: vrefs => doSyscall(['retireExports', vrefs]),

    // These syscalls should be omitted if the worker cannot get a
    // synchronous return value back from the kernel, such as when the worker
    // is in a child process or thread, and cannot be blocked until the
    // result gets back. vatstoreSet and vatstoreDelete are included because
    // vatstoreSet requires a result, and we offer them as a group.
    callNow: (target, method, args) =>
      doSyscall(['callNow', target, method, args]),
    vatstoreGet: key => {
      const result = doSyscall(['vatstoreGet', key]);
      return result === null ? undefined : result;
    },
    vatstoreSet: (key, value) => doSyscall(['vatstoreSet', key, value]),
    vatstoreGetAfter: (priorKey, lowerBound, upperBound) => {
      const syscall = ['vatstoreGetAfter', priorKey, lowerBound];
      if (upperBound) {
        syscall.push(upperBound);
      }
      const result = doSyscall(syscall);
      return result === null ? [undefined, undefined] : result;
    },
    vatstoreDelete: key => doSyscall(['vatstoreDelete', key]),
  };

  const blocking = [
    'callNow',
    'vatstoreGet',
    'vatstoreSet',
    'vatstoreGetAfter',
    'vatstoreDelete',
  ];

  if (!workerCanBlock) {
    for (const name of blocking) {
      const err = `this non-blocking worker transport cannot syscall.${name}`;
      syscallForVat[name] = () => assert.fail(err);
    }
  }

  return harden(syscallForVat);
}

harden(makeSupervisorSyscall);
export { makeSupervisorSyscall };

/**
 * Create a vat console from a log stream maker.
 *
 * TODO: consider other methods per SES VirtualConsole. See
 * https://github.com/Agoric/agoric-sdk/issues/2146
 *
 * @param {(level: string) => (...args: any[]) => void} makeLog
 */
function makeVatConsole(makeLog) {
  return harden({
    debug: makeLog('debug'),
    log: makeLog('log'),
    info: makeLog('info'),
    warn: makeLog('warn'),
    error: makeLog('error'),
  });
}

harden(makeVatConsole);
export { makeVatConsole };
