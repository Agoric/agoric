// @ts-check
import { assert, details } from '@agoric/assert';
import { Nat } from '@agoric/nat';
import '@agoric/ertp/exported.js';

import { captureNum } from './helpers/captureNum.js';
import { roundToDecimalPlaces } from './helpers/roundToDecimalPlaces.js';

/**
 * Parse a string as a Nat, using `decimalPlaces`, the number of places to move
 * the decimal over to the right to create an integer. For example, "3.00"
 * dollars turns into 300n cents with decimalPlaces = 2.
 *
 * Note that if places beyond the decimalPlaces are specified, the number is
 * rounded to the floor. For instance, "3.009" dollars is still 300n cents with
 * decimalPlaces =2 because the thousandths place is dropped.
 *
 * In the future, we may add a parameter to change the rounding rules.
 *
 * @param {string} str
 * @param {number} decimalPlaces
 */
export function parseAsNat(str, decimalPlaces = 0) {
  assert.typeof(str, 'string', details`value to parse ${str} must be a string`);
  const capturedNum = captureNum(str);
  const roundedRight = roundToDecimalPlaces(capturedNum.right, decimalPlaces);
  return Nat(BigInt(`${capturedNum.left}${roundedRight}`));
}
