// @ts-check
import { assert, details } from '@agoric/assert';
import { importBundle } from '@agoric/import-bundle';
import { Remotable, getInterfaceOf, makeMarshal } from '@agoric/marshal';
// grumble... waitUntilQuiescent is exported and closes over ambient authority
import { waitUntilQuiescent } from '../../waitUntilQuiescent';

import { makeLiveSlots } from '../liveSlots';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// eslint-disable-next-line no-unused-vars
function workerLog(first, ...args) {
  // @ts-ignore
  // eslint-disable-next-line
  // print(`---worker: ${first}`, ...args);
}

workerLog(`supervisor started`);

/**
 * @param { (cmd: ArrayBuffer) => ArrayBuffer } issueCommand
 * @typedef { [unknown, ...unknown[]] } Tagged
 * @typedef { (item: Tagged) => unknown } DataHandler
 * @typedef { (item: Tagged) => Promise<Tagged> } AsyncHandler
 */
function ManagerPort(issueCommand) {
  /** @type { (item: Tagged) => ArrayBuffer } */
  const encode = item => encoder.encode(JSON.stringify(item)).buffer;

  /** @type { (msg: ArrayBuffer) => any } */
  const decodeData = msg => JSON.parse(decoder.decode(msg));

  /** @type { (msg: ArrayBuffer) => Tagged } */
  function decode(msg) {
    /** @type { Tagged } */
    const item = decodeData(msg);
    assert(Array.isArray(item), details`expected array`);
    assert(item.length > 0, details`empty array lacks tag`);
    return item;
  }

  return harden({
    /** @type { (item: Tagged) => void } */
    send: item => {
      issueCommand(encode(item));
    },
    /** @type { DataHandler } */
    call: item => decodeData(issueCommand(encode(item))),
    /** @type { (f: AsyncHandler)  => ((msg: ArrayBuffer) => { result?: ArrayBuffer })} */
    handler: f => msg => {
      const report = {};
      f(decode(msg)).then(item => {
        workerLog('result', item);
        report.result = encode(item);
      }); // TODO: .catch?!?!
      return report;
    },
  });
}

function makeConsole(_tag) {
  const log = console; // TODO: anylogger(tag);
  const cons = {
    debug: log.debug,
    log: log.log,
    info: log.info,
    warn: log.warn,
    error: log.error,
  };
  return harden(cons);
}

/**
 * @param { (value: void) => void } f
 * @param { string } errmsg
 */
function runAndWait(f, errmsg) {
  Promise.resolve()
    .then(f)
    .then(undefined, err => workerLog(`doProcess: ${errmsg}:`, err));
  return waitUntilQuiescent();
}

/**
 * @param { ReturnType<ManagerPort> } port
 */
function makeWorker(port) {
  /** @type { Record<string, (...args: unknown[]) => void> | null } */
  let dispatch = null;

  /** @type { (dr: Tagged, errmsg: string) => Promise<Tagged> } */
  async function doProcess(dispatchRecord, errmsg) {
    assert(dispatch);
    const theDispatch = dispatch;
    const [dispatchOp, ...dispatchArgs] = dispatchRecord;
    assert(typeof dispatchOp === 'string');
    workerLog(`runAndWait`);
    await runAndWait(() => theDispatch[dispatchOp](...dispatchArgs), errmsg);
    workerLog(`doProcess done`);
    /** @type { Tagged } */
    const vatDeliveryResults = harden(['ok']);
    return vatDeliveryResults;
  }

  /** @type { (ts: unknown, msg: any) => Promise<Tagged> } */
  function doMessage(targetSlot, msg) {
    const errmsg = `vat[${targetSlot}].${msg.method} dispatch failed`;
    return doProcess(
      ['deliver', targetSlot, msg.method, msg.args, msg.result],
      errmsg,
    );
  }

  /** @type { (rs: unknown) => Promise<Tagged> } */
  function doNotify(resolutions) {
    const errmsg = `vat.notify failed`;
    return doProcess(['notify', resolutions], errmsg);
  }

  /**
   * @param {unknown} vatID
   * @param {unknown} bundle
   * @param {unknown} vatParameters
   * @param {unknown} virtualObjectCacheSize
   * @returns { Promise<Tagged> }
   */
  async function setBundle(
    vatID,
    bundle,
    vatParameters,
    virtualObjectCacheSize,
  ) {
    /** @type { (item: Tagged) => unknown } */
    function doSyscall(vatSyscallObject) {
      workerLog('doSyscall', vatSyscallObject);
      const result = port.call(['syscall', ...vatSyscallObject]);
      workerLog(' ... syscall result:', result);
      return result;
    }

    const syscall = harden({
      send: (...args) => doSyscall(['send', ...args]),
      callNow: (...args) => doSyscall(['callNow', ...args]),
      subscribe: (...args) => doSyscall(['subscribe', ...args]),
      fulfillToData: (...args) => doSyscall(['fulfillToData', ...args]),
      fulfillToPresence: (...args) => doSyscall(['fulfillToPresence', ...args]),
      reject: (...args) => doSyscall(['reject', ...args]),
    });

    const vatPowers = {
      Remotable,
      getInterfaceOf,
      makeMarshal,
      testLog: (...args) => port.send(['testLog', ...args]),
    };

    const ls = makeLiveSlots(
      syscall,
      vatID,
      vatPowers,
      vatParameters,
      // @ts-ignore  TODO: defend against non-numeric?
      virtualObjectCacheSize,
      // TODO: lsgc? API drift?
    );

    const endowments = {
      ...ls.vatGlobals,
      console: makeConsole(`SwingSet:vatWorker`),
      assert,
      // @ts-ignore bootstrap provides HandledPromise
      // eslint-disable-next-line no-undef
      HandledPromise,
    };
    const vatNS = await importBundle(bundle, { endowments });
    workerLog(`got vatNS:`, Object.keys(vatNS).join(','));
    ls.setBuildRootObject(vatNS.buildRootObject);
    dispatch = ls.dispatch;
    assert(dispatch);
    workerLog(`got dispatch:`, Object.keys(dispatch).join(','));
    return ['dispatchReady'];
  }

  /** @type { (item: Tagged) => Promise<Tagged> } */
  async function handleItem([tag, ...args]) {
    workerLog('handleItem', tag, args.length);
    switch (tag) {
      case 'setBundle':
        assert(!dispatch, 'cannot setBundle again');
        return setBundle(args[0], args[1], args[2], args[3]);
      case 'deliver': {
        assert(dispatch, 'cannot deliver before setBundle');
        const [dtype, ...dargs] = args;
        switch (dtype) {
          case 'message':
            return doMessage(dargs[0], dargs[1]);
          case 'notify':
            return doNotify(dargs[0]);
          default:
            throw Error(`bad delivery type ${dtype}`);
        }
      }
      default:
        workerLog('handleItem: bad tag', tag, args.length);
        return ['bad tag', tag];
    }
  }

  return harden({
    /** @type { AsyncHandler } */
    handleItem,
  });
}

// @ts-ignore xsnap provides issueCommand global
// eslint-disable-next-line no-undef
const port = ManagerPort(issueCommand);
const worker = makeWorker(port);
globalThis.handleCommand = port.handler(worker.handleItem);
