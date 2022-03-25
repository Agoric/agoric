// @ts-check
import { Nat } from '@agoric/nat';
import { assert } from '@agoric/assert';
import { buildSerializationTools } from '../lib/deviceTools.js';

/*

The "vatAdmin device" manages code bundles, meters, and the creation /
maintenance of dynamic vats.

Code bundles can be used to define a new dynamic vat
(vatAdminSvc~.createVat), or can be imported/evaluated from within a vat
(importBundle).

Bundles are 'endoZipBase64' archives, which are basically a string-encoded
ZIP file containing a bunch of importable modules and a single "compartment
map". Each bundle has a unique "bundleID" string, which is the SHA512 hash of
the compartment map file, aka the manifest. This manifest contains hashes of
all the component modules, as well as information about how they link
together, so the bundle's behavior is completely specified by the bundleID
(plus the runtime behavior of the module loader, which includes global
endowments, and potentially "holes" in the module map which will be filled in
by the loader with locally-provided module namespace objects). The order of
the modules in a zip file does not affect the bundleID.

Any two bundles are likely to have a lot of modules in common (shared support
libraries, etc). Modules are individual source files, so they tend to be
small (1-50kB), but bundles tend to be several MB in size.

The goals are:
* install bundles "out of band", through controller.validateAndInstallBundle()
* keep large (multi-MB) bundles out of vat messages and transcripts
* reduce communication bandwidth by uploading shared modules only once
* reduce storage costs by storing shared modules only once

The kernel will provide this device with three endowments:
* hasBundle(bundleID) -> boolean
* getBundle(bundleID) -> string
* getNamedBundleID(name) -> bundleID

The root device node offers two methods to callers:
* D(devices.bundle).getBundleCap(bundleID) -> devnode or undefined
* D(devices.bundle).getNamedBundleCap(name) -> devnode or undefined

The device node returned by getBundleCap() is called, unsurprisingly, a
"bundlecap". Most vats interact with bundlecaps, not bundleIDs (although of
course somebody must call `getBundleCap()` first). Holding a bundlecap
guarantees that the bundle contents are available, since `getBundleCap()`
will fail unless the bundle is currently installed. When we implement
refcounting GC for bundles, the bundlecap will maintain a reference and
protect the bundle data from collection.

The bundlecap device node provides two device-invocation methods to callers:

* D(bundleCap).getBundleID() -> string (bundleID)
* D(bundleCap).getBundle() -> string (the bundle contents)

For now, the only way to give a bundle to `importBundle()` is to obtain its
string contents first, but eventually we hope to implement more direct
support and keep the large string out of syscall results and userspace
entirely.

Meters are defined by the wrapper vat, who talks to us with a meterID
instead.

Dynamic vats are created with either a bundlecap (which we convert into a
bundleID before submitting to the kernel), or (temporarily) a full bundle.

*/

/**
 * If you're into types, this might loosely describe devices.vatAdmin
 *
 * @typedef {import('../../types-external.js').BundleID} BundleID
 *
 * @typedef {string} MeterID
 *
 * @typedef {string} VatID
 *
 * @typedef {string} UpgradeID
 *
 * @typedef {{
 *   createMeter: (remaining: bigint, threshold: bigint) => MeterID;
 *   createUnlimitedMeter: () => MeterID;
 *   addMeterRemaining: (meterID: MeterID, delta: bigint) => void;
 *   setMeterThreshold: (meterID: MeterID, threshold: bigint) => void;
 *   getMeter: (meterID: MeterID) => { remaining: bigint; threshold: bigint };
 *   createByBundle: (bundle: Bundle, options: {}) => VatID;
 *   createByBundleID: (bundleID: BundleID, options: {}) => VatID;
 *   upgradeVat: (bundleID: BundleID, vatParameters: {}) => UpgradeID;
 *   terminateWithFailure: (vatID: VatID, reason: {}) => void;
 *   getBundleCap: (bundleID: BundleID) => BundleCap;
 *   getNamedBundleCap: (name: string) => BundleCap;
 * }} VatAdminRootDeviceNode
 */

export function buildDevice(tools, endowments) {
  const { hasBundle, getBundle, getNamedBundleID } = endowments;
  const { meterCreate, meterAddRemaining, meterSetThreshold, meterGet } =
    endowments;

  const { syscall } = tools;
  const dtools = buildSerializationTools(syscall, 'bundle');
  const { unserialize, returnFromInvoke, deviceNodeForSlot } = dtools;

  const ROOT = 'd+0';
  const bundleIDRE = new RegExp('^b1-[0-9a-f]{128}$');
  const nextDeviceNodeIDKey = 'nextDev';

  // reminder: you may not perform vatstore writes during buildDevice(),
  // because it runs on each kernel reboot, which is not consistent among
  // members of a consensus kernel

  function allocateDeviceNode() {
    let s = syscall.vatstoreGet(nextDeviceNodeIDKey);
    if (!s) {
      s = '1';
    }
    const id = BigInt(s);
    syscall.vatstoreSet(nextDeviceNodeIDKey, `${id + 1n}`);
    return `d+${id}`;
  }

  function returnCapForBundleID(bundleID) {
    assert(bundleID, 'returnCapForBundleID needs bundleID');
    const idToBundleKey = `id.${bundleID}`;
    let cap;
    cap = syscall.vatstoreGet(idToBundleKey);
    if (!cap) {
      if (!hasBundle(bundleID)) {
        return returnFromInvoke(undefined);
      }
      cap = allocateDeviceNode();
      syscall.vatstoreSet(idToBundleKey, cap);
      const capToIDKey = `slot.${cap}`;
      syscall.vatstoreSet(capToIDKey, bundleID);
    }
    return returnFromInvoke(deviceNodeForSlot(cap));
  }

  // invoke() should use unserialize() and returnFromInvoke. Throwing an
  // error will cause the calling vat's D() to throw.

  const dispatch = {
    invoke: (dnid, method, argsCapdata) => {
      if (dnid === ROOT) {
        // Meters

        // D(devices.vatAdmin).createMeter(remaining, threshold) -> meterID
        if (method === 'createMeter') {
          const args = unserialize(argsCapdata);
          const [remaining, threshold] = args;
          assert.typeof(remaining, 'bigint', `createMeter() remaining`);
          assert.typeof(threshold, 'bigint', `createMeter() threshold`);
          const meterID = meterCreate(Nat(remaining), Nat(threshold));
          return returnFromInvoke(meterID);
        }

        // D(devices.vatAdmin).createUnlimitedMeter() -> meterID
        if (method === 'createUnlimitedMeter') {
          const meterID = meterCreate('unlimited', 0n);
          return returnFromInvoke(meterID);
        }

        // D(devices.vatAdmin).addMeterRemaining(meterID, delta)
        if (method === 'addMeterRemaining') {
          const args = unserialize(argsCapdata);
          const [meterID, delta] = args;
          assert.typeof(meterID, 'string', `addMeterRemaining() meterID`);
          assert.typeof(delta, 'bigint', `addMeterRemaining() delta`);
          meterAddRemaining(meterID, Nat(delta));
          return returnFromInvoke(undefined);
        }

        // D(devices.vatAdmin).setMeterThreshold(meterID, threshold)
        if (method === 'setMeterThreshold') {
          const args = unserialize(argsCapdata);
          const [meterID, threshold] = args;
          assert.typeof(meterID, 'string', `setMeterThreshold() meterID`);
          assert.typeof(threshold, 'bigint', `setMeterThreshold() threshold`);
          meterSetThreshold(meterID, Nat(threshold));
          return returnFromInvoke(undefined);
        }

        // D(devices.vatAdmin).getMeter(meterID) -> { remaining, threshold }
        if (method === 'getMeter') {
          const args = unserialize(argsCapdata);
          const [meterID] = args;
          assert.typeof(meterID, 'string', `getMeter() meterID`);
          return returnFromInvoke(meterGet(meterID));
        }

        // Vat Creation

        // D(devices.vatAdmin).createByBundle(bundle, options) -> vatID
        if (method === 'createByBundle') {
          const res = syscall.callKernelHook('createByBundle', argsCapdata);
          const vatID = JSON.parse(res.body);
          assert.typeof(vatID, 'string', `createByBundle gave non-VatID`);
          return returnFromInvoke(vatID);
        }

        // D(devices.vatAdmin).createByBundleID(bundleID, options) -> vatID
        if (method === 'createByBundleID') {
          const res = syscall.callKernelHook('createByID', argsCapdata);
          const vatID = JSON.parse(res.body);
          assert.typeof(vatID, 'string', `createByID gave non-VatID`);
          return returnFromInvoke(vatID);
        }

        // D(devices.vatAdmin).upgradeVat(bundleID, vatParameters) -> upgradeID
        if (method === 'upgradeVat') {
          const args = JSON.parse(argsCapdata.body);
          assert(Array.isArray(args), 'upgradeVat() args array');
          assert.equal(args.length, 2, `upgradeVat() args length`);
          const [bundleID, _vatParameters] = args;
          assert.typeof(bundleID, 'string', `upgradeVat() bundleID`);

          const res = syscall.callKernelHook('upgrade', argsCapdata);
          const upgradeID = JSON.parse(res.body);
          assert.typeof(upgradeID, 'string', 'upgradeVat gave non-upgradeID');
          return returnFromInvoke(upgradeID);
        }

        // D(devices.vatAdmin).terminateWithFailure(vatID, reason)
        if (method === 'terminateWithFailure') {
          const args = JSON.parse(argsCapdata.body);
          assert(Array.isArray(args), 'terminateWithFailure() args array');
          assert.equal(args.length, 2, `terminateWithFailure() args length`);
          const [vatID, _reason] = args;
          assert.typeof(vatID, 'string', `terminateWithFailure() vatID`);

          syscall.callKernelHook('terminate', argsCapdata);
          return returnFromInvoke(undefined);
        }

        // Bundlecaps

        // D(devices.bundle).getBundleCap(id) -> bundlecap
        if (method === 'getBundleCap') {
          const args = unserialize(argsCapdata);
          const [bundleID] = args;
          assert.typeof(bundleID, 'string', `getBundleCap() bundleID`);
          assert(bundleIDRE.test(bundleID), 'getBundleCap() not a bundleID');
          return returnCapForBundleID(bundleID);
        }
        // D(devices.bundle).getNamedBundleCap(name) -> bundlecap
        if (method === 'getNamedBundleCap') {
          const args = unserialize(argsCapdata);
          const [name] = args;
          assert.typeof(name, 'string', `getNamedBundleCap() name`);
          let bundleID;
          try {
            // this throws on a bad name, so make a better error
            bundleID = getNamedBundleID(name);
          } catch (e) {
            throw Error(`unregistered bundle name '${name}'`);
          }
          return returnCapForBundleID(bundleID);
        }
        throw TypeError(`target[${method}] does not exist`);
      }

      const capToIDKey = `slot.${dnid}`;
      const bundleID = syscall.vatstoreGet(capToIDKey);
      if (bundleID) {
        // D(bundleCap).getBundleID() -> id
        if (method === 'getBundleID') {
          return returnFromInvoke(bundleID);
        }
        // D(bundleCap).getBundle() -> bundle
        if (method === 'getBundle') {
          return returnFromInvoke(getBundle(bundleID));
        }
        throw TypeError(`bundlecap[${method}] does not exist`);
      }
      throw TypeError(`unknown device node ${dnid}, shouldn't happen`);
    },
  };
  return dispatch;
}
