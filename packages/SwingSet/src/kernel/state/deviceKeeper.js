/** Kernel's keeper of persistent state for a device. */

import { Nat } from '@agoric/nat';
import { assert, details as X } from '@agoric/assert';
import { parseKernelSlot } from '../parseKernelSlots.js';
import { makeVatSlot, parseVatSlot } from '../../lib/parseVatSlots.js';
import { insistDeviceID } from '../../lib/id.js';

const FIRST_DEVICE_IMPORTED_OBJECT_ID = 10n;
const FIRST_DEVICE_IMPORTED_DEVICE_ID = 20n;
const FIRST_DEVICE_IMPORTED_PROMISE_ID = 30n;

/**
 * Establish a device's state.
 *
 * @param {any} kvStore The storage in which the persistent state will be kept
 * @param {string} deviceID The device ID string of the device in question
 *
 *   TODO move into makeDeviceKeeper?
 */
export function initializeDeviceState(kvStore, deviceID) {
  kvStore.set(`${deviceID}.o.nextID`, `${FIRST_DEVICE_IMPORTED_OBJECT_ID}`);
  kvStore.set(`${deviceID}.d.nextID`, `${FIRST_DEVICE_IMPORTED_DEVICE_ID}`);
  kvStore.set(`${deviceID}.p.nextID`, `${FIRST_DEVICE_IMPORTED_PROMISE_ID}`);
}

/**
 * Produce a device keeper for a device.
 *
 * @param {any} kvStore The storage in which the persistent state will be kept
 * @param {string} deviceID The device ID string of the device in question
 * @param {addKernelDeviceNode: (deviceID: string) => string,
 *          incrementRefCount: (kernelSlot: string,
 *                              tag: string?,
 *                              options: {
 *                                isExport: boolean?,
 *                                onlyRecognizable: boolean?,
 *                              },
 *                             ) => undefined),} tools
 * @returns {any} An object to hold and access the kernel's state for the given device
 */
export function makeDeviceKeeper(kvStore, deviceID, tools) {
  insistDeviceID(deviceID);
  const { addKernelDeviceNode, incrementRefCount } = tools;

  function setSourceAndOptions(source, options) {
    assert.typeof(source, 'object');
    assert(source && source.bundleID);
    assert.typeof(options, 'object');
    kvStore.set(`${deviceID}.source`, JSON.stringify(source));
    kvStore.set(`${deviceID}.options`, JSON.stringify(options));
  }

  function getSourceAndOptions() {
    const source = JSON.parse(kvStore.get(`${deviceID}.source`));
    const options = JSON.parse(kvStore.get(`${deviceID}.options`));
    return harden({ source, options });
  }

  /**
   * Provide the kernel slot corresponding to a given device slot, including
   * creating the kernel slot if it doesn't already exist.
   *
   * @param {string} devSlot The device slot of interest
   * @returns {string} The kernel slot that devSlot maps to
   * @throws {Error} If devSlot is not a kind of thing that can be exported by
   *   devices or is otherwise invalid.
   */
  function mapDeviceSlotToKernelSlot(devSlot) {
    assert.typeof(devSlot, 'string', X`non-string devSlot: ${devSlot}`);
    // kdebug(`mapOutbound ${devSlot}`);
    const devKey = `${deviceID}.c.${devSlot}`;
    if (!kvStore.has(devKey)) {
      const { type, allocatedByVat } = parseVatSlot(devSlot);

      if (allocatedByVat) {
        let kernelSlot;
        if (type === 'object') {
          assert.fail(X`devices cannot export Objects`);
        } else if (type === 'promise') {
          assert.fail(X`devices cannot export Promises`);
        } else if (type === 'device') {
          kernelSlot = addKernelDeviceNode(deviceID);
        } else {
          assert.fail(X`unknown type ${type}`);
        }
        // device nodes don't have refcounts: they're immortal
        const kernelKey = `${deviceID}.c.${kernelSlot}`;
        kvStore.set(kernelKey, devSlot);
        kvStore.set(devKey, kernelSlot);
      } else {
        // the vat didn't allocate it, and the kernel didn't allocate it
        // (else it would have been in the c-list), so it must be bogus
        assert.fail(X`unknown devSlot ${devSlot}`);
      }
    }

    return kvStore.get(devKey);
  }

  /**
   * Provide the device slot corresponding to a given kernel slot, including
   * creating the device slot if it doesn't already exist.
   *
   * @param {string} kernelSlot The kernel slot of interest
   * @returns {string} The device slot kernelSlot maps to
   * @throws {Error} If kernelSlot is not a kind of thing that can be imported
   *   by devices or is otherwise invalid.
   */
  function mapKernelSlotToDeviceSlot(kernelSlot) {
    assert.typeof(kernelSlot, 'string', 'non-string kernelSlot');
    const kernelKey = `${deviceID}.c.${kernelSlot}`;
    if (!kvStore.has(kernelKey)) {
      const { type } = parseKernelSlot(kernelSlot);

      let id;
      if (type === 'object') {
        id = Nat(BigInt(kvStore.get(`${deviceID}.o.nextID`)));
        kvStore.set(`${deviceID}.o.nextID`, `${id + 1n}`);
      } else if (type === 'device') {
        id = Nat(BigInt(kvStore.get(`${deviceID}.d.nextID`)));
        kvStore.set(`${deviceID}.d.nextID`, `${id + 1n}`);
      } else if (type === 'promise') {
        id = Nat(BigInt(kvStore.get(`${deviceID}.p.nextID`)));
        kvStore.set(`${deviceID}.p.nextID`, `${id + 1n}`);
      } else {
        assert.fail(X`unknown type ${type}`);
      }
      // Use isExport=false, since this is an import. Unlike
      // mapKernelSlotToVatSlot, we use onlyRecognizable=false, to increment
      // both reachable and recognizable, because we aren't tracking object
      // reachability on the device clist (deviceSlots doesn't use WeakRefs
      // and won't emit dropImports), so we need the clist to hold a ref to
      // the imported object forever.
      const opts = { isExport: false, onlyRecognizable: false };
      incrementRefCount(kernelSlot, `${deviceID}|dk|clist`, opts);

      const devSlot = makeVatSlot(type, false, id);

      const devKey = `${deviceID}.c.${devSlot}`;
      kvStore.set(devKey, kernelSlot);
      kvStore.set(kernelKey, devSlot);
    }

    return kvStore.get(kernelKey);
  }

  /**
   * Obtain the device's state.
   *
   * @returns {any} This device's state, or undefined if it has none.
   */
  function getDeviceState() {
    // this should return an object, generally CapData, or undefined
    const key = `${deviceID}.deviceState`;
    if (kvStore.has(key)) {
      return JSON.parse(kvStore.get(key));
      // todo: formalize the CapData, and store .deviceState.body, and
      // .deviceState.slots as 'vatSlot[,vatSlot..]'
    }
    return undefined;
  }

  /**
   * Set this device's state.
   *
   * @param {any} value The value to set the state to. This should be
   *   serializable. (NOTE: the intent is that the structure here will
   *   eventually be more codified than it is now).
   */
  function setDeviceState(value) {
    kvStore.set(`${deviceID}.deviceState`, JSON.stringify(value));
  }

  /**
   * Produce a dump of this device's state for debugging purposes.
   *
   * @returns {[string, string, string][]} An array of this device's state information
   */
  function dumpState() {
    const res = [];
    const prefix = `${deviceID}.c.`;
    for (const k of kvStore.getKeys(prefix, `${deviceID}.c/`)) {
      // The bounds passed to getKeys() here work because '/' is the next
      // character in ASCII after '.'
      if (k.startsWith(prefix)) {
        const slot = k.slice(prefix.length);
        if (!slot.startsWith('k')) {
          const devSlot = slot;
          const kernelSlot = kvStore.get(k);
          res.push([kernelSlot, deviceID, devSlot]);
        }
      }
    }
    return harden(res);
  }

  return harden({
    getSourceAndOptions,
    setSourceAndOptions,
    mapDeviceSlotToKernelSlot,
    mapKernelSlotToDeviceSlot,
    getDeviceState,
    setDeviceState,
    dumpState,
  });
}
