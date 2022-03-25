// @ts-check
import { assert, details as X } from '@agoric/assert';
import { insistMessage } from '../lib/message.js';
import { insistKernelType, parseKernelSlot } from './parseKernelSlots.js';
import { insistVatType, parseVatSlot } from '../lib/parseVatSlots.js';
import { insistCapData } from '../lib/capdata.js';
import {
  kdebug,
  legibilizeMessageArgs,
  legibilizeValue,
} from '../lib/kdebug.js';

/** @type {VatDeliveryBringOutYourDead} */
const reapMessageVatDelivery = harden(['bringOutYourDead']);

export function assertValidVatstoreKey(key) {
  assert.typeof(key, 'string');
}

/**
 * Return a function that converts KernelDelivery objects into VatDelivery objects
 *
 * @param {string} vatID
 * @param {KernelKeeper} kernelKeeper
 * @returns {(kd: KernelDeliveryObject) => VatDeliveryObject}
 */
function makeTranslateKernelDeliveryToVatDelivery(vatID, kernelKeeper) {
  const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
  const { mapKernelSlotToVatSlot } = vatKeeper;

  // msg is { method, args, result }, all slots are kernel-centric
  function translateMessage(target, msg) {
    insistMessage(msg);
    const targetSlot = mapKernelSlotToVatSlot(target);
    const { type } = parseVatSlot(targetSlot);
    if (type === 'object') {
      assert(parseVatSlot(targetSlot).allocatedByVat, 'deliver() to wrong vat');
    } else if (type === 'promise') {
      const p = kernelKeeper.getKernelPromise(target);
      assert(p.decider === vatID, 'wrong decider');
    }
    const inputSlots = msg.args.slots.map(slot => mapKernelSlotToVatSlot(slot));
    let resultSlot = null;
    if (msg.result) {
      insistKernelType('promise', msg.result);
      const p = kernelKeeper.getKernelPromise(msg.result);
      assert(
        p.state === 'unresolved',
        X`result ${msg.result} already resolved`,
      );
      assert(
        !p.decider,
        X`result ${msg.result} already has decider ${p.decider}`,
      );
      resultSlot = vatKeeper.mapKernelSlotToVatSlot(msg.result);
      insistVatType('promise', resultSlot);
      kernelKeeper.setDecider(msg.result, vatID);
    }

    const vatMessage = harden({
      method: msg.method,
      args: { ...msg.args, slots: inputSlots },
      result: resultSlot,
    });
    /** @type {VatDeliveryMessage} */
    const vatDelivery = harden(['message', targetSlot, vatMessage]);
    return vatDelivery;
  }

  /**
   * @param {{ state: string; data: SwingSetCapData }} kp
   * @returns {[isReject: boolean, resolution: SwingSetCapData]}
   */
  function translatePromiseDescriptor(kp) {
    if (kp.state === 'fulfilled' || kp.state === 'rejected') {
      return [
        kp.state === 'rejected',
        {
          ...kp.data,
          slots: kp.data.slots.map(slot => mapKernelSlotToVatSlot(slot)),
        },
      ];
    } else if (kp.state === 'redirected') {
      // TODO unimplemented
      throw new Error('not implemented yet');
    } else {
      assert.fail(X`unknown kernelPromise state '${kp.state}'`);
    }
  }

  /**
   * @param {KernelDeliveryOneNotify[]} kResolutions
   * @returns {VatDeliveryNotify}
   */
  function translateNotify(kResolutions) {
    const vResolutions = [];
    let idx = 0;
    for (const resolution of kResolutions) {
      const [kpid, p] = resolution;
      assert(p.state !== 'unresolved', X`spurious notification ${kpid}`);
      const vpid = mapKernelSlotToVatSlot(kpid);
      /** @type {VatOneResolution} */
      const vres = [vpid, ...translatePromiseDescriptor(p)];
      vResolutions.push(vres);
      kdebug(`notify ${idx} ${kpid} ${JSON.stringify(vres)}`);
      idx += 1;
    }
    /** @type {VatDeliveryNotify} */
    const vatDelivery = harden(['notify', vResolutions]);
    return vatDelivery;
  }

  const gcDeliveryMapOpts = { setReachable: false, required: true };
  function translateDropExports(krefs) {
    const vrefs = krefs.map(kref =>
      mapKernelSlotToVatSlot(kref, gcDeliveryMapOpts),
    );
    krefs.map(kref => vatKeeper.clearReachableFlag(kref, 'dropE'));
    /** @type {VatDeliveryDropExports} */
    const vatDelivery = harden(['dropExports', vrefs]);
    return vatDelivery;
  }

  function translateRetireExports(krefs) {
    const vrefs = [];
    for (const kref of krefs) {
      const vref = mapKernelSlotToVatSlot(kref, gcDeliveryMapOpts);
      vatKeeper.deleteCListEntry(kref, vref);
      vrefs.push(vref);
    }
    /** @type {VatDeliveryRetireExports} */
    const vatDelivery = harden(['retireExports', vrefs]);
    return vatDelivery;
  }

  function translateRetireImports(krefs) {
    const vrefs = [];
    for (const kref of krefs) {
      const vref = mapKernelSlotToVatSlot(kref, gcDeliveryMapOpts);
      vatKeeper.deleteCListEntry(kref, vref);
      vrefs.push(vref);
    }
    /** @type {VatDeliveryRetireImports} */
    const vatDelivery = harden(['retireImports', vrefs]);
    return vatDelivery;
  }

  /**
   * @param {SwingSetCapData} kernelVP
   * @returns {VatDeliveryStartVat}
   */
  function translateStartVat(kernelVP) {
    const slots = kernelVP.slots.map(slot => mapKernelSlotToVatSlot(slot));
    const vatVP = { ...kernelVP, slots };
    /** @type {VatDeliveryStartVat} */
    const startVatMessageVatDelivery = harden(['startVat', vatVP]);
    return startVatMessageVatDelivery;
  }

  function translateBringOutYourDead() {
    return reapMessageVatDelivery;
  }

  /**
   * @param {KernelDeliveryObject} kd
   * @returns {VatDeliveryObject}
   */
  function kernelDeliveryToVatDelivery(kd) {
    switch (kd[0]) {
      case 'message': {
        const [_, ...args] = kd;
        return translateMessage(...args);
      }
      case 'notify': {
        const [_, ...args] = kd;
        return translateNotify(...args);
      }
      case 'dropExports': {
        const [_, ...args] = kd;
        return translateDropExports(...args);
      }
      case 'retireExports': {
        const [_, ...args] = kd;
        return translateRetireExports(...args);
      }
      case 'retireImports': {
        const [_, ...args] = kd;
        return translateRetireImports(...args);
      }
      case 'startVat': {
        const [_, ...args] = kd;
        return translateStartVat(...args);
      }
      case 'bringOutYourDead': {
        const [_, ...args] = kd;
        return translateBringOutYourDead(...args);
      }
      default:
        assert.fail(X`unknown kernelDelivery.type ${kd[0]}`);
    }
    // returns one of:
    //  ['message', target, msg]
    //  ['notify', resolutions]
    //  ['dropExports', vrefs]
    //  ['retireExports', vrefs]
    //  ['retireImports', vrefs]
    //  ['startVat']
    //  ['bringOutYourDead']
  }

  return kernelDeliveryToVatDelivery;
}

/**
 * Return a function that converts VatSyscall objects into KernelSyscall objects
 *
 * @param {string} vatID
 * @param {KernelKeeper} kernelKeeper
 * @returns {(vsc: VatSyscallObject) => KernelSyscallObject}
 */
function makeTranslateVatSyscallToKernelSyscall(vatID, kernelKeeper) {
  const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
  const { mapVatSlotToKernelSlot, clearReachableFlag } = vatKeeper;

  function translateSend(targetSlot, msg) {
    assert.typeof(targetSlot, 'string', 'non-string targetSlot');
    insistMessage(msg);
    const { method, args, result: resultSlot } = msg;
    insistCapData(args);
    // TODO: disable send-to-self for now, qv issue #43
    const target = mapVatSlotToKernelSlot(targetSlot);
    const argList = legibilizeMessageArgs(args).join(', ');
    // prettier-ignore
    kdebug(`syscall[${vatID}].send(${targetSlot}/${target}).${method}(${argList})`);
    const kernelSlots = args.slots.map(slot => mapVatSlotToKernelSlot(slot));
    const kernelArgs = harden({ ...args, slots: kernelSlots });
    let result = null;
    if (resultSlot) {
      insistVatType('promise', resultSlot);
      result = mapVatSlotToKernelSlot(resultSlot);
      insistKernelType('promise', result);
      // The promise must be unresolved, and this Vat must be the decider.
      // The most common case is that 'resultSlot' is a new exported promise
      // (p+NN). But it might be a previously-imported promise (p-NN) that
      // they got in a deliver() call, which gave them resolution authority.
      const p = kernelKeeper.getKernelPromise(result);
      assert(
        p.state === 'unresolved',
        X`send() result ${result} is already resolved`,
      );
      assert(
        p.decider === vatID,
        X`send() result ${result} is decided by ${p.decider} not ${vatID}`,
      );
      kernelKeeper.clearDecider(result);
      // resolution authority now held by run-queue
    }

    const kmsg = harden({
      method,
      args: kernelArgs,
      result,
    });
    insistMessage(kmsg);
    /** @type {KernelSyscallSend} */
    const ks = harden(['send', target, kmsg]);
    return ks;
  }

  /**
   * @param {boolean} isFailure
   * @param {SwingSetCapData} info
   * @returns {KernelSyscallExit}
   */
  function translateExit(isFailure, info) {
    insistCapData(info);
    kdebug(`syscall[${vatID}].exit(${isFailure},${legibilizeValue(info)})`);
    const kernelSlots = info.slots.map(slot => mapVatSlotToKernelSlot(slot));
    const kernelInfo = harden({ ...info, slots: kernelSlots });
    return harden(['exit', vatID, !!isFailure, kernelInfo]);
  }

  /**
   * @param {string} key
   * @returns {KernelSyscallVatstoreGet}
   */
  function translateVatstoreGet(key) {
    assertValidVatstoreKey(key);
    kdebug(`syscall[${vatID}].vatstoreGet(${key})`);
    return harden(['vatstoreGet', vatID, key]);
  }

  /**
   * @param {string} key
   * @param {string} value
   * @returns {KernelSyscallVatstoreSet}
   */
  function translateVatstoreSet(key, value) {
    assertValidVatstoreKey(key);
    assert.typeof(value, 'string');
    kdebug(`syscall[${vatID}].vatstoreSet(${key},${value})`);
    return harden(['vatstoreSet', vatID, key, value]);
  }

  /**
   * @param {string} priorKey
   * @param {string} lowerBound
   * @param {string | undefined} upperBound
   * @returns {KernelSyscallVatstoreGetAfter}
   */
  function translateVatstoreGetAfter(priorKey, lowerBound, upperBound) {
    if (priorKey !== '') {
      assertValidVatstoreKey(priorKey);
    }
    assertValidVatstoreKey(lowerBound);
    if (upperBound) {
      assertValidVatstoreKey(upperBound);
    }
    if (upperBound === null) {
      upperBound = undefined;
    }
    kdebug(
      `syscall[${vatID}].vatstoreGetAfter(${priorKey}, ${lowerBound}, ${upperBound})`,
    );
    return harden([
      'vatstoreGetAfter',
      vatID,
      priorKey,
      lowerBound,
      upperBound,
    ]);
  }

  /**
   * @param {string} key
   * @returns {KernelSyscallVatstoreDelete}
   */
  function translateVatstoreDelete(key) {
    assertValidVatstoreKey(key);
    kdebug(`syscall[${vatID}].vatstoreDelete(${key})`);
    return harden(['vatstoreDelete', vatID, key]);
  }

  const gcSyscallMapOpts = { required: true, setReachable: false };

  /**
   * @param {string[]} vrefs
   * @returns {KernelSyscallDropImports}
   */
  function translateDropImports(vrefs) {
    assert(Array.isArray(vrefs), X`dropImports() given non-Array ${vrefs}`);
    const krefs = vrefs.map(vref => {
      const { type, allocatedByVat } = parseVatSlot(vref);
      assert.equal(type, 'object');
      assert.equal(allocatedByVat, false); // drop *imports*, not exports
      // we translate into krefs, *not* setting the reachable flag
      const kref = mapVatSlotToKernelSlot(vref, gcSyscallMapOpts);
      // and we clear the reachable flag, which might the decrement the
      // reachable refcount, which might tag the kref for processing
      clearReachableFlag(kref, 'dropI');
      return kref;
    });
    kdebug(`syscall[${vatID}].dropImports(${krefs.join(' ')})`);
    // we've done all the work here, during translation
    return harden(['dropImports', krefs]);
  }

  /**
   * @param {string[]} vrefs
   * @returns {KernelSyscallRetireImports}
   */
  function translateRetireImports(vrefs) {
    assert(Array.isArray(vrefs), X`retireImports() given non-Array ${vrefs}`);
    const krefs = vrefs.map(vref => {
      const { type, allocatedByVat } = parseVatSlot(vref);
      assert.equal(type, 'object');
      assert.equal(allocatedByVat, false); // retire *imports*, not exports
      const kref = mapVatSlotToKernelSlot(vref, gcSyscallMapOpts);
      if (vatKeeper.getReachableFlag(kref)) {
        throw Error(`syscall.retireImports but ${vref} is still reachable`);
      }
      // deleting the clist entry will decrement the recognizable count, but
      // not the reachable count (because it was unreachable, as we asserted)
      vatKeeper.deleteCListEntry(kref, vref);
      return kref;
    });
    kdebug(`syscall[${vatID}].retireImports(${krefs.join(' ')})`);
    // we've done all the work here, during translation
    return harden(['retireImports', krefs]);
  }

  /**
   * @param {string[]} vrefs
   * @returns {KernelSyscallRetireExports}
   */
  function translateRetireExports(vrefs) {
    assert(Array.isArray(vrefs), X`retireExports() given non-Array ${vrefs}`);
    const krefs = vrefs.map(vref => {
      const { type, allocatedByVat } = parseVatSlot(vref);
      assert.equal(type, 'object');
      assert.equal(allocatedByVat, true); // retire *exports*, not imports
      // kref must already be in the clist
      const kref = mapVatSlotToKernelSlot(vref, gcSyscallMapOpts);
      vatKeeper.insistNotReachable(kref);
      vatKeeper.deleteCListEntry(kref, vref);
      return kref;
    });
    kdebug(`syscall[${vatID}].retireExports(${krefs.join(' ')})`);
    // retireExports still has work to do
    return harden(['retireExports', krefs]);
  }

  /**
   * @param {string} target
   * @param {string} method
   * @param {SwingSetCapData} args
   * @returns {KernelSyscallInvoke}
   */
  function translateCallNow(target, method, args) {
    insistCapData(args);
    const dev = mapVatSlotToKernelSlot(target);
    const { type } = parseKernelSlot(dev);
    assert(type === 'device', X`doCallNow must target a device, not ${dev}`);
    for (const slot of args.slots) {
      assert(
        parseVatSlot(slot).type !== 'promise',
        `syscall.callNow() args cannot include promises like ${slot}`,
      );
    }
    const kernelSlots = args.slots.map(slot => mapVatSlotToKernelSlot(slot));
    const kernelData = harden({ ...args, slots: kernelSlots });
    // prettier-ignore
    kdebug(`syscall[${vatID}].callNow(${target}/${dev}).${method}(${JSON.stringify(args)})`);
    return harden(['invoke', dev, method, kernelData]);
  }

  function translateSubscribe(vpid) {
    const kpid = mapVatSlotToKernelSlot(vpid);
    kdebug(`syscall[${vatID}].subscribe(${vpid}/${kpid})`);
    assert(
      kernelKeeper.hasKernelPromise(kpid),
      X`unknown kernelPromise id '${kpid}'`,
    );
    /** @type {KernelSyscallSubscribe} */
    const ks = harden(['subscribe', vatID, kpid]);
    return ks;
  }

  /**
   * @param {VatOneResolution[]} vresolutions
   * @returns {KernelSyscallResolve}
   */
  function translateResolve(vresolutions) {
    /** @type {KernelOneResolution[]} */
    const kresolutions = [];
    const kpidsResolved = [];
    let idx = 0;
    for (const resolution of vresolutions) {
      const [vpid, rejected, data] = resolution;
      insistVatType('promise', vpid);
      insistCapData(data);
      const kpid = mapVatSlotToKernelSlot(vpid);
      const kernelSlots = data.slots.map(slot => mapVatSlotToKernelSlot(slot));
      const kernelData = harden({ ...data, slots: kernelSlots });
      kdebug(
        `syscall[${vatID}].resolve[${idx}](${vpid}/${kpid}, ${rejected}) = ${
          data.body
        } ${JSON.stringify(data.slots)}/${JSON.stringify(kernelSlots)}`,
      );
      idx += 1;
      kresolutions.push([kpid, rejected, kernelData]);
      kpidsResolved.push(kpid);
    }
    vatKeeper.deleteCListEntriesForKernelSlots(kpidsResolved);
    return harden(['resolve', vatID, kresolutions]);
  }

  // vsc is [type, ...args]
  // ksc is:
  //  ['send', ktarget, kmsg]
  /**
   * @param {VatSyscallObject} vsc
   * @returns {KernelSyscallObject}
   */
  function vatSyscallToKernelSyscall(vsc) {
    switch (vsc[0]) {
      case 'send': {
        const [_, ...args] = vsc;
        return translateSend(...args);
      }
      case 'callNow': {
        const [_, ...args] = vsc;
        return translateCallNow(...args); // becomes invoke()
      }
      case 'subscribe': {
        const [_, ...args] = vsc;
        return translateSubscribe(...args);
      }
      case 'resolve': {
        const [_, ...args] = vsc;
        return translateResolve(...args);
      }
      case 'exit': {
        const [_, ...args] = vsc;
        return translateExit(...args);
      }
      case 'vatstoreGet': {
        const [_, ...args] = vsc;
        return translateVatstoreGet(...args);
      }
      case 'vatstoreSet': {
        const [_, ...args] = vsc;
        return translateVatstoreSet(...args);
      }
      case 'vatstoreGetAfter': {
        const [_, ...args] = vsc;
        return translateVatstoreGetAfter(...args);
      }
      case 'vatstoreDelete': {
        const [_, ...args] = vsc;
        return translateVatstoreDelete(...args);
      }
      case 'dropImports': {
        const [_, ...args] = vsc;
        return translateDropImports(...args);
      }
      case 'retireImports': {
        const [_, ...args] = vsc;
        return translateRetireImports(...args);
      }
      case 'retireExports': {
        const [_, ...args] = vsc;
        return translateRetireExports(...args);
      }
      default:
        assert.fail(X`unknown vatSyscall type ${vsc[0]}`);
    }
  }

  return vatSyscallToKernelSyscall;
}

/*
 * return a function that converts KernelSyscallResult objects into
 * VatSyscallResult objects
 */
function makeTranslateKernelSyscallResultToVatSyscallResult(
  vatID,
  kernelKeeper,
) {
  const vatKeeper = kernelKeeper.provideVatKeeper(vatID);

  const { mapKernelSlotToVatSlot } = vatKeeper;

  // Most syscalls return ['ok', null], but callNow() returns ['ok', capdata]
  // and vatstoreGet() returns ['ok', string] or ['ok', undefined], and
  // invoke() can return ['error', problem].
  /**
   * @param {string} type
   * @param {KernelSyscallResult} kres
   * @returns {VatSyscallResult}
   */
  function kernelSyscallResultToVatSyscallResult(type, kres) {
    const [successFlag, resultData] = kres;
    switch (type) {
      case 'invoke': {
        if (kres[0] === 'ok') {
          insistCapData(resultData);
          // prettier-ignore
          const slots =
                resultData.slots.map(slot => mapKernelSlotToVatSlot(slot));
          const vdata = { ...resultData, slots };
          /** @type {VatSyscallResultOk} */
          const vres = harden(['ok', vdata]);
          return vres;
        } else {
          return harden([kres[0], kres[1]]);
        }
      }
      case 'vatstoreGet':
        assert(successFlag === 'ok', 'unexpected KSR error');
        if (resultData) {
          assert.typeof(resultData, 'string');
          return harden(['ok', resultData]);
        } else {
          return harden(['ok', null]);
        }
      case 'vatstoreGetAfter':
        assert(successFlag === 'ok', 'unexpected KSR error');
        if (resultData) {
          assert(Array.isArray(resultData));
          return harden(['ok', resultData]);
        } else {
          return harden(['ok', [undefined, undefined]]);
        }
      default:
        assert(successFlag === 'ok', 'unexpected KSR error');
        assert(resultData === null);
        return harden(['ok', null]);
    }
  }

  return kernelSyscallResultToVatSyscallResult;
}

export function makeVatTranslators(vatID, kernelKeeper) {
  const mKD = makeTranslateKernelDeliveryToVatDelivery;
  const mVS = makeTranslateVatSyscallToKernelSyscall;
  const mKSR = makeTranslateKernelSyscallResultToVatSyscallResult;

  return harden({
    kernelDeliveryToVatDelivery: mKD(vatID, kernelKeeper),
    vatSyscallToKernelSyscall: mVS(vatID, kernelKeeper),
    kernelSyscallResultToVatSyscallResult: mKSR(vatID, kernelKeeper),
  });
}
