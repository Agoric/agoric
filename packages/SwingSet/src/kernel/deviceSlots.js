// @ts-check
import { Remotable, passStyleOf, makeMarshal } from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';
import {
  insistVatType,
  makeVatSlot,
  parseVatSlot,
} from '../lib/parseVatSlots.js';
import { insistCapData } from '../lib/capdata.js';

// 'makeDeviceSlots' is a subset of makeLiveSlots, for device code

export function makeDeviceSlots(
  syscall,
  state,
  buildRootDeviceNode,
  forDeviceName,
  endowments,
  testLog,
  deviceParameters,
) {
  assert(state.get && state.set, 'deviceSlots.build got bad "state" argument');
  assert(
    typeof buildRootDeviceNode === 'function',
    'deviceSlots.build got bad "buildRootDeviceNode"',
  );
  const enableLSDebug = false;
  function lsdebug(...args) {
    if (enableLSDebug) {
      console.log(...args);
    }
  }

  function makePresence(id, iface = undefined) {
    const result = {
      [`_importID_${id}`]() {},
    };
    if (iface === undefined) {
      return harden(result);
    }
    return Remotable(iface, undefined, result);
  }

  const outstandingProxies = new WeakSet();
  const valToSlot = new WeakMap();
  const slotToVal = new Map();
  let nextExportID = 1;

  function allocateExportID() {
    const exportID = nextExportID;
    nextExportID += 1;
    return exportID;
  }

  function exportPassByPresence() {
    const exportID = allocateExportID();
    return makeVatSlot('device', true, exportID);
  }

  function convertValToSlot(val) {
    // lsdebug(`convertValToSlot`, val, Object.isFrozen(val));
    // This is either a Presence (in presenceToImportID), a
    // previously-serialized local pass-by-presence object or
    // previously-serialized local Promise (in valToSlot), a new local
    // pass-by-presence object, or a new local Promise.

    // If we've already assigned it an importID or exportID, it might be in
    // slots/slotMap for this particular act of serialization. If it's new,
    // it certainly will not be in slotMap. If we've already serialized it in
    // this particular act, it will definitely be in slotMap.

    if (!valToSlot.has(val)) {
      // must be a new export
      // lsdebug('must be a new export', JSON.stringify(val));
      assert.equal(passStyleOf(val), 'remotable');
      const slot = exportPassByPresence();
      parseVatSlot(slot); // assertion
      valToSlot.set(val, slot);
      slotToVal.set(slot, val);
    }
    return valToSlot.get(val);
  }

  function convertSlotToVal(slot, iface = undefined) {
    if (!slotToVal.has(slot)) {
      let val;
      const { type, allocatedByVat } = parseVatSlot(slot);
      assert(!allocatedByVat, X`I don't remember allocating ${slot}`);
      if (type === 'object') {
        // this is a new import value
        // lsdebug(`assigning new import ${slot}`);
        val = makePresence(slot, iface);
        // lsdebug(` for presence`, val);
      } else if (type === 'device') {
        assert.fail(X`devices should not be given other devices '${slot}'`);
      } else {
        assert.fail(X`unrecognized slot type '${type}'`);
      }
      slotToVal.set(slot, val);
      valToSlot.set(val, slot);
    }
    return slotToVal.get(slot);
  }

  const m = makeMarshal(convertValToSlot, convertSlotToVal, {
    marshalName: `device:${forDeviceName}`,
    // TODO Temporary hack.
    // See https://github.com/Agoric/agoric-sdk/issues/2780
    errorIdNum: 50000,
  });

  function PresenceHandler(importSlot) {
    return {
      get(target, prop) {
        lsdebug(`PreH proxy.get(${String(prop)})`);
        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
          return undefined;
        }
        const p = (...args) => {
          const capdata = m.serialize(harden(args));
          syscall.sendOnly(importSlot, prop, capdata);
        };
        return p;
      },
      has(_target, _prop) {
        return true;
      },
    };
  }

  function SO(x) {
    // SO(x).name(args)
    //
    // SO returns a proxy, like the E() in liveSlots. However SO's proxy does
    // a sendOnly() rather than a send(), so it doesn't return a Promise. And
    // since devices don't accept Promises either, SO(x) must be given a
    // presence, not a promise that might resolve to a presence.

    assert(!outstandingProxies.has(x), X`SO(SO(x)) is invalid`);
    const slot = valToSlot.get(x);
    assert(
      slot && parseVatSlot(slot).type === 'object',
      X`SO(x) must be called on a Presence, not ${x}`,
    );
    const handler = PresenceHandler(slot);
    const p = harden(new Proxy({}, handler));
    outstandingProxies.add(p);
    return p;
  }

  function getDeviceState() {
    const stateData = state.get();
    if (!stateData) {
      return undefined;
    }
    insistCapData(stateData);
    return m.unserialize(stateData);
  }

  function setDeviceState(deviceState) {
    const ser = m.serialize(deviceState);
    insistCapData(ser);
    state.set(ser);
  }

  // Here we finally invoke the device code, and get back the root devnode.
  // Note that we do *not* harden() the argument, since the provider might
  // not have wanted the endowments hardened.
  const rootObject = buildRootDeviceNode({
    SO,
    getDeviceState,
    setDeviceState,
    testLog,
    endowments,
    deviceParameters,
    serialize: m.serialize, // We deliberately do not provide m.deserialize
  });
  assert.equal(passStyleOf(rootObject), 'remotable');

  const rootSlot = makeVatSlot('device', true, 0n);
  valToSlot.set(rootObject, rootSlot);
  slotToVal.set(rootSlot, rootObject);

  // Exceptions in device invocations are fatal to the kernel. This returns a
  // VatInvocationResult object: ['ok', capdata].

  // this function throws an exception if anything goes wrong, or if the
  // device node itself throws an exception during invocation
  /**
   * @param {string} deviceID
   * @param {string} method
   * @param {SwingSetCapData} args
   * @returns {DeviceInvocationResult}
   */
  function invoke(deviceID, method, args) {
    insistVatType('device', deviceID);
    insistCapData(args);
    lsdebug(
      `ls[${forDeviceName}].dispatch.invoke ${deviceID}.${method}`,
      args.slots,
    );
    const t = slotToVal.get(deviceID);
    if (!(method in t)) {
      throw new TypeError(
        `target[${method}] does not exist, has ${Object.getOwnPropertyNames(
          t,
        )}`,
      );
    }
    const fn = t[method];
    const ftype = typeof fn;
    if (ftype !== 'function') {
      throw new TypeError(
        `target[${method}] is not a function, typeof is ${ftype}, has ${Object.getOwnPropertyNames(
          t,
        )}`,
      );
    }
    const res = fn.apply(t, m.unserialize(args));
    const vres = m.serialize(res);
    /** @type {DeviceInvocationResultOk} */
    const ires = harden(['ok', vres]);
    lsdebug(` results ${vres.body} ${JSON.stringify(vres.slots)}`);
    return ires;
  }

  return harden({ invoke });
}
