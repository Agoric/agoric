import harden from '@agoric/harden';

/**
 * A Vat management device that provides a capability that can be used to
 * create new vats. create(adminId, code) creates a new vat running code, and
 * returns the root object.
 *
 * setup(...) calls makeDeviceSlots(..., makeRootDevice, ...), which calls
 * deviceSlots' build() function (which invokes makeRootDevice) to create the
 * root device. Selected vats that need to create new vats can be given access
 * to the device.
 *
 * This code runs in the inner part of the device vat. The only device object
 * exposed to vats is the vat creator. The root objects for the new vats are
 * returned as javascript objects.
 *
 * We don't currently need to use SO, or to maintain state. All functionality is
 * provided by calling kernel functions and passing in the VatID. The wrapper
 * vat sends the VatID on every call.
 */
export default function setup(syscall, state, helpers, endowments) {
  const {
    create: kernelVatCreationFn,
    stats: kernelVatStatsFn,
    // terminate: kernelTerminateFn,
  } = endowments;

  // makeRootDevice is called with { SO, getDeviceState, setDeviceState } as
  // parameters, but we don't need these, as discussed above.
  function makeRootDevice() {
    // The Root Device Node.
    return harden({
      // Called by the wrapper vat to create a new vat. Gets a new ID from the
      // kernel's vat creator fn. Remember that the root object will arrive
      // separately. We clean up the outgoing and incoming arguments.
      create(code) {
        const bundle = harden({
          source: code.source,
          moduleFormat: code.moduleFormat,
        });
        const result = kernelVatCreationFn(bundle);
        if (result.vatID) {
          return harden({ vatID: `${result.vatID}` });
        }
        return harden({ error: `${result.error}` });
      },
      terminate(_vatID) {
        // TODO(hibbert)
      },
      // Call the registered kernel function to request vat stats. Clean up the
      // outgoing and incoming arguments.
      adminStats(vatID) {
        return kernelVatStatsFn(`${vatID}`);
      },
    });
  }

  // return dispatch object
  return helpers.makeDeviceSlots(syscall, state, makeRootDevice, helpers.name);
}
