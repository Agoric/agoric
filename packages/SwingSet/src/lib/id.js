import { Nat } from '@endo/nat';

import { Fail } from '@agoric/assert';

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
  try {
    typeof s === 'string' || Fail`not a string`;
    s.startsWith(`v`) || Fail`does not start with 'v'`;
    Nat(BigInt(s.slice(1)));
  } catch (e) {
    Fail`${s} is not a 'vNN'-style VatID: ${e}`;
  }
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
 * @returns {asserts s is string}
 */
export function insistDeviceID(s) {
  try {
    if (typeof s !== 'string') {
      throw Fail`not a string`;
    }
    s.startsWith(`d`) || Fail`does not start with 'd'`;
    Nat(BigInt(s.slice(1)));
  } catch (e) {
    Fail`${s} is not a 'dNN'-style DeviceID: ${e}`;
  }
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

/**
 * Parse a vat or device ID string into its constituent parts.
 *
 * @param {string} s  The string to be parsed.
 *
 * @returns {{ type: 'vat' | 'device', id: bigint}} an object: {
 *    type: STRING, // 'vat' or 'device', accordingly
 *    id: Nat       // the index
 *  }
 *
 * @throws {Error} if the parameter is not a string or is malformed.
 */
export function parseVatOrDeviceID(s) {
  typeof s === 'string' ||
    Fail`${s} is not a string, so cannot be a VatID/DeviceID`;
  /** @type {'vat' | 'device' | undefined} */
  let type;
  let idSuffix;
  if (s.startsWith('v')) {
    type = 'vat';
    idSuffix = s.slice(1);
  } else if (s.startsWith('d')) {
    type = 'device';
    idSuffix = s.slice(1);
  } else {
    throw Fail`${s} is neither a VatID nor a DeviceID`;
  }
  return harden({ type, id: Nat(BigInt(idSuffix)) });
}

export function makeUpgradeID(index) {
  return `up${Nat(index)}`;
}
