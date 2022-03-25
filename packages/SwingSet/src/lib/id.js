import { Nat } from '@agoric/nat';

import { assert, details as X } from '@agoric/assert';

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
 * @param {string} s The (alleged) string to be tested.
 * @returns {void}
 * @throws {Error} If, upon inspection, the parameter is not a string or is not
 *   a well-formed vat ID as described above.
 */
export function insistVatID(s) {
  try {
    assert.typeof(s, 'string', X`not a string`);
    assert(s.startsWith(`v`), X`does not start with 'v'`);
    Nat(BigInt(s.slice(1)));
  } catch (e) {
    assert.fail(X`'${s} is not a 'vNN'-style VatID: ${e}`);
  }
}

/**
 * Generate a vat ID string given an index.
 *
 * @param {bigint | number} index The index.
 * @returns {string} A vat ID string of the form "vNN" where NN is the index.
 */
export function makeVatID(index) {
  return `v${Nat(index)}`;
}

/**
 * Assert function to ensure that something expected to be a device ID string
 * actually is one.
 *
 * @param {unknown} s The (alleged) string to be tested.
 * @returns {void}
 * @throws {Error} If, upon inspection, the parameter is not a string or is not
 *   a well-formed device ID as described above.
 */
export function insistDeviceID(s) {
  try {
    assert.typeof(s, 'string', X`not a string`);
    assert(s.startsWith(`d`), X`does not start with 'd'`);
    Nat(BigInt(s.slice(1)));
  } catch (e) {
    assert.fail(X`'${s} is not a 'dNN'-style DeviceID: ${e}`);
  }
}

/**
 * Generate a device ID string given an index.
 *
 * @param {bigint | number} index The index.
 * @returns {string} A device ID string of the form "dNN" where NN is the index.
 */
export function makeDeviceID(index) {
  return `d${Nat(index)}`;
}

/**
 * Parse a vat or device ID string into its constituent parts.
 *
 * @param {string} s The string to be parsed.
 * @returns {{ type: 'vat' | 'device'; id: number }} An object: { type: STRING,
 *   // 'vat' or 'device', accordingly id: Nat // the index }
 * @throws {Error} If the parameter is not a string or is malformed.
 */
export function parseVatOrDeviceID(s) {
  assert.typeof(
    s,
    'string',
    X`${s} is not a string, so cannot be a VatID/DeviceID`,
  );
  s = `${s}`;
  let type;
  let idSuffix;
  if (s.startsWith('v')) {
    type = 'vat';
    idSuffix = s.slice(1);
  } else if (s.startsWith('d')) {
    type = 'device';
    idSuffix = s.slice(1);
  } else {
    assert.fail(X`'${s}' is neither a VatID nor a DeviceID`);
  }
  return harden({ type, id: Nat(BigInt(idSuffix)) });
}

export function makeUpgradeID(index) {
  return `up${Nat(index)}`;
}
