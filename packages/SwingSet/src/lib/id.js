import { Nat } from '@endo/nat';

import { Fail } from '@endo/errors';

const vatIDPattern = /^v\d+$/;
const deviceIDPattern = /^d\d+$/;

// Vats are identified by an integer index, which (for typechecking purposes)
// is encoded as `vNN`. Devices are similarly identified as `dNN`. Both have
// human-readable names, which are provided to controller.addGenesisVat(),
// and usually come from the `vat-NAME.js` filenames processed in
// loadBasedir(). These names also appear in the `vats` and `devices`
// arguments to the bootstrap Vat's `bootstrap()` function, and in debug
// messages.

/**
 * Assert function to ensure that something expected to be a vat ID string
 * actually is one.
 *
 * @param {string} s  The (alleged) string to be tested.
 *
 * @throws {Error} if, upon inspection, the parameter is not a string or is not a
 *    well-formed vat ID as described above.
 *
 * @returns {void}
 */
export function insistVatID(s) {
  typeof s === 'string' || Fail`not a string`;
  vatIDPattern.test(s) || Fail`${s} is not a 'vNN'-style VatID`;
}

/**
 * Generate a vat ID string given an index.
 *
 * @param {bigint | number} index  The index.
 *
 * @returns {string} a vat ID string of the form "vNN" where NN is the index.
 */
export function makeVatID(index) {
  return `v${Nat(index)}`;
}

/**
 * Assert function to ensure that something expected to be a device ID string
 * actually is one.
 *
 * @param {unknown} s  The (alleged) string to be tested.
 *
 * @throws {Error} if, upon inspection, the parameter is not a string or is not a
 *    well-formed device ID as described above.
 *
 * @returns {void}
 */
export function insistDeviceID(s) {
  typeof s === 'string' || Fail`not a string`;

  // @ts-expect-error
  deviceIDPattern.test(s) || Fail`${s} is not a 'dNN'-style DeviceID`;
}

/**
 * Generate a device ID string given an index.
 *
 * @param {bigint | number} index  The index.
 *
 * @returns {string} a device ID string of the form "dNN" where NN is the index.
 */
export function makeDeviceID(index) {
  return `d${Nat(index)}`;
}

export function makeUpgradeID(index) {
  return `up${Nat(index)}`;
}
