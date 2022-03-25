// @ts-check
import { assert } from '@agoric/assert';
import { makeDeviceSlots } from './deviceSlots.js';
import { insistCapData } from '../lib/capdata.js';

import '../types-ambient.js';

/* The DeviceManager is much simpler than the VatManager, because the feature
 * set is smaller:
 *  * the only Delivery is `invoke`
 *  * the only exported references are "device nodes" (d+NN)
 *  * the only syscall is `sendOnly`
 *  * the only imported references are objects (o-NN)
 *  * no transcript or orthogonal persistence
 *  * no promises (imported or exported)
 */

/**
 * Produce an object that will serve as the kernel's handle onto a device.
 *
 * @param {string} deviceName The device's name, for human readable diagnostics
 * @param {any} deviceNamespace The module namespace object exported by the device bundle
 * @param {any} state A get/set object for the device's persistent state
 * @param {Record<string, any>} endowments The device's configured endowments
 * @param {any} testLog
 * @param {any} deviceParameters Parameters from the device's config entry
 * @param {any} deviceSyscallHandler
 */
export default function makeDeviceManager(
  deviceName,
  deviceNamespace,
  state,
  endowments,
  testLog,
  deviceParameters,
  deviceSyscallHandler,
) {
  const syscall = harden({
    sendOnly: (target, method, args) => {
      const dso = harden(['sendOnly', target, method, args]);
      deviceSyscallHandler(dso);
    },
    vatstoreGet: key => {
      const dso = harden(['vatstoreGet', key]);
      return deviceSyscallHandler(dso);
    },
    vatstoreSet: (key, value) => {
      const dso = harden(['vatstoreSet', key, value]);
      deviceSyscallHandler(dso);
    },
    vatstoreDelete: key => {
      const dso = harden(['vatstoreDelete', key]);
      deviceSyscallHandler(dso);
    },
    callKernelHook: (name, args) => {
      const dso = harden(['callKernelHook', name, args]);
      const result = deviceSyscallHandler(dso);
      insistCapData(result);
      return result;
    },
  });

  let dispatch;
  if (typeof deviceNamespace.buildDevice === 'function') {
    // raw device
    const tools = { syscall };
    // maybe add state utilities
    dispatch = deviceNamespace.buildDevice(tools, endowments);
  } else {
    assert(
      typeof deviceNamespace.buildRootDeviceNode === 'function',
      `device ${deviceName} lacks buildRootDeviceNode`,
    );

    // Setting up the device runtime gives us back the device's dispatch object
    dispatch = makeDeviceSlots(
      syscall,
      state,
      deviceNamespace.buildRootDeviceNode,
      deviceName,
      endowments,
      testLog,
      deviceParameters,
    );
  }

  /**
   * Invoke a method on a device node.
   *
   * @param {DeviceInvocation} deviceInvocation
   * @returns {DeviceInvocationResult}
   */
  function invoke(deviceInvocation) {
    const [target, method, args] = deviceInvocation;
    try {
      /** @type {DeviceInvocationResult} */
      const deviceResults = dispatch.invoke(target, method, args);
      // common error: raw devices returning capdata instead of ['ok', capdata]
      assert.equal(deviceResults.length, 2, deviceResults);
      if (deviceResults[0] === 'ok') {
        insistCapData(deviceResults[1]);
      } else {
        assert.equal(deviceResults[0], 'error');
        assert.typeof(deviceResults[1], 'string');
      }
      return deviceResults;
    } catch (e) {
      console.log(`dm.invoke failed, informing calling vat`, e);
      return harden(['error', 'device.invoke failed, see logs for details']);
    }
  }

  const manager = {
    invoke,
  };
  return manager;
}
