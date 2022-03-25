import { assert, details as X } from '@agoric/assert';
import { insistMessage } from '../lib/message.js';
import { insistKernelType } from './parseKernelSlots.js';
import { insistVatType, parseVatSlot } from '../lib/parseVatSlots.js';
import { insistCapData } from '../lib/capdata.js';
import { kdebug } from '../lib/kdebug.js';
import { assertValidVatstoreKey } from './vatTranslator.js';

/*
 * Return a function that converts KernelInvocation objects into
 * DeviceInvocation objects
 */
export function makeKDTranslator(deviceID, kernelKeeper) {
  const deviceKeeper = kernelKeeper.allocateDeviceKeeperIfNeeded(deviceID);
  const { mapKernelSlotToDeviceSlot } = deviceKeeper;

  function kernelInvocationToDeviceInvocation(kernelInvocation) {
    const [target, method, args] = kernelInvocation;
    insistKernelType('device', target);
    insistCapData(args);
    const targetSlot = mapKernelSlotToDeviceSlot(target);
    const { allocatedByVat } = parseVatSlot(targetSlot);
    assert(allocatedByVat, X`invoke() to someone else's device`);
    const slots = args.slots.map(slot => mapKernelSlotToDeviceSlot(slot));
    const deviceArgs = { ...args, slots };
    const deviceInvocation = harden([targetSlot, method, deviceArgs]);
    return deviceInvocation;
  }

  return kernelInvocationToDeviceInvocation;
}

/* Return a function that converts DeviceInvocationResult data into
 * KernelInvocationResult data
 */

function makeDRTranslator(deviceID, kernelKeeper) {
  const deviceKeeper = kernelKeeper.allocateDeviceKeeperIfNeeded(deviceID);
  const { mapDeviceSlotToKernelSlot } = deviceKeeper;

  /**
   * @param {DeviceInvocationResult} deviceInvocationResult
   * @returns {KernelSyscallResult}
   */
  function deviceResultToKernelResult(deviceInvocationResult) {
    // deviceInvocationResult is ['ok', capdata]
    const [successFlag, devData] = deviceInvocationResult;
    if (successFlag === 'ok') {
      insistCapData(devData);
      const kData = {
        ...devData,
        slots: devData.slots.map(slot => mapDeviceSlotToKernelSlot(slot)),
      };
      return harden(['ok', kData]);
    } else {
      assert.equal(successFlag, 'error');
      assert.typeof(devData, 'string');
      return harden([successFlag, devData]);
    }
  }
  return deviceResultToKernelResult;
}

/**
 * Return a function that converts DeviceSyscall objects into KernelSyscall objects
 *
 * @param {string} deviceID
 * @param {string} deviceName
 * @param {any} kernelKeeper
 * @returns {(dsc: DeviceSyscallObject) => KernelSyscallObject}
 */
export function makeDSTranslator(deviceID, deviceName, kernelKeeper) {
  const deviceKeeper = kernelKeeper.allocateDeviceKeeperIfNeeded(deviceID);
  const { mapDeviceSlotToKernelSlot } = deviceKeeper;

  // syscall.sendOnly is translated into a kernel send() with result=null
  function translateSendOnly(targetSlot, method, args) {
    assert.typeof(targetSlot, 'string', 'non-string targetSlot');
    insistVatType('object', targetSlot);
    insistCapData(args);
    const target = mapDeviceSlotToKernelSlot(targetSlot);
    assert(target, 'unable to find target');
    kdebug(`syscall[${deviceName}].send(${targetSlot}/${target}).${method}`);
    kdebug(`  ^target is ${target}`);
    const msg = harden({
      method,
      args: {
        ...args,
        slots: args.slots.map(slot => mapDeviceSlotToKernelSlot(slot)),
      },
      result: null, // this makes it sendOnly
    });
    insistMessage(msg);
    const ks = harden(['send', target, msg]);
    return ks;
  }

  function translateVatstoreGet(key) {
    assertValidVatstoreKey(key);
    kdebug(`syscall[${deviceID}].vatstoreGet(${key})`);
    return harden(['vatstoreGet', deviceID, key]);
  }

  function translateVatstoreSet(key, value) {
    assertValidVatstoreKey(key);
    assert.typeof(value, 'string');
    kdebug(`syscall[${deviceID}].vatstoreSet(${key},${value})`);
    return harden(['vatstoreSet', deviceID, key, value]);
  }

  function translateVatstoreGetAfter(priorKey, lowerBound, upperBound) {
    if (priorKey !== '') {
      assertValidVatstoreKey(priorKey);
    }
    assertValidVatstoreKey(lowerBound);
    if (upperBound) {
      assertValidVatstoreKey(upperBound);
    }
    kdebug(
      `syscall[${deviceID}].vatstoreGetAfter(${priorKey}, ${lowerBound}, ${upperBound})`,
    );
    return harden([
      'vatstoreGetAfter',
      deviceID,
      priorKey,
      lowerBound,
      upperBound,
    ]);
  }

  function translateVatstoreDelete(key) {
    assertValidVatstoreKey(key);
    kdebug(`syscall[${deviceID}].vatstoreDelete(${key})`);
    return harden(['vatstoreDelete', deviceID, key]);
  }

  function translateCallKernelHook(name, dargs) {
    assert.typeof(name, 'string', `callKernelHook requires string hook name`);
    insistCapData(dargs); // dref slots
    const kargs = harden({
      ...dargs,
      slots: dargs.slots.map(slot => mapDeviceSlotToKernelSlot(slot)),
    });
    return harden(['callKernelHook', deviceID, name, kargs]);
  }

  // vsc is [type, ...args]
  // ksc is:
  //  ['send', ktarget, kmsg]
  /**
   * Convert syscalls from device space to kernel space
   *
   * @param {DeviceSyscallObject} vsc
   * @returns {KernelSyscallObject}
   */
  function deviceSyscallToKernelSyscall(vsc) {
    const [type, ...args] = vsc;
    switch (type) {
      case 'sendOnly':
        return translateSendOnly(...args); // becomes ['send' .. result=null]
      case 'vatstoreGet':
        return translateVatstoreGet(...args);
      case 'vatstoreSet':
        return translateVatstoreSet(...args);
      case 'vatstoreGetAfter':
        return translateVatstoreGetAfter(...args);
      case 'vatstoreDelete':
        return translateVatstoreDelete(...args);
      case 'callKernelHook':
        return translateCallKernelHook(...args);
      default:
        assert.fail(X`unknown deviceSyscall type ${type}`);
    }
  }

  return deviceSyscallToKernelSyscall;
}

function makeKRTranslator(deviceID, kernelKeeper) {
  const deviceKeeper = kernelKeeper.allocateDeviceKeeperIfNeeded(deviceID);
  const { mapKernelSlotToDeviceSlot } = deviceKeeper;

  function kernelResultToDeviceResult(type, kres) {
    const [successFlag, resultData] = kres;
    assert(successFlag === 'ok', 'unexpected KSR error');
    switch (type) {
      case 'vatstoreGet': {
        if (resultData) {
          assert.typeof(resultData, 'string');
          return harden(['ok', resultData]);
        } else {
          return harden(['ok', undefined]);
        }
      }
      case 'vatstoreGetAfter': {
        if (resultData) {
          assert(Array.isArray(resultData));
          return harden(['ok', resultData]);
        } else {
          return harden(['ok', undefined]);
        }
      }
      case 'callKernelHook': {
        insistCapData(resultData);
        const kresult = resultData;
        const dresult = harden({
          ...kresult,
          slots: kresult.slots.map(slot => mapKernelSlotToDeviceSlot(slot)),
        });
        return harden(['ok', dresult]);
      }
      default:
        assert(resultData === null);
        return harden(['ok', null]);
    }
  }

  return kernelResultToDeviceResult;
}

export function makeDeviceTranslators(deviceID, deviceName, kernelKeeper) {
  return harden({
    kernelInvocationToDeviceInvocation: makeKDTranslator(
      deviceID,
      kernelKeeper,
    ),
    deviceResultToKernelResult: makeDRTranslator(deviceID, kernelKeeper),
    deviceSyscallToKernelSyscall: makeDSTranslator(
      deviceID,
      deviceName,
      kernelKeeper,
    ),
    kernelResultToDeviceResult: makeKRTranslator(deviceID, kernelKeeper),
  });
}
