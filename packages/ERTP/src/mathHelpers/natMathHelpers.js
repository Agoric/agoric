// @jessie-check

import { Fail } from '@endo/errors';
import { Nat, isNat } from '@endo/nat';

/**
 * @import {Key} from '@endo/patterns'
 * @import {MathHelpers, NatValue} from '../types.js'
 */

const empty = 0n;

/**
 * Fungible digital assets use the natMathHelpers to manage balances - the
 * operations are merely arithmetic on natural, non-negative numbers.
 *
 * Natural numbers are used for fungible erights such as money because rounding
 * issues make floats problematic. All operations should be done with the
 * smallest whole unit such that the `natMathHelpers` never deals with
 * fractional parts.
 *
 * For this 'nat' asset kind, the rightBound is always a bigint, since a a
 * fungible number has no "elements" to match against an elementPattern.
 *
 * @type {MathHelpers<'nat', Key, NatValue>}
 */
export const natMathHelpers = harden({
  doCoerce: nat => {
    // TODO: tighten the definition of Nat in @agoric/nat to throw on `number`
    assert.typeof(nat, 'bigint');
    isNat(nat) || Fail`value ${nat} must be a natural number`;
    return Nat(nat);
  },
  doMakeEmpty: () => empty,
  doIsEmpty: nat => nat === empty,
  doIsGTE: (left, rightBound) =>
    left >= /** @type {bigint} */ (/** @type {unknown} */ (rightBound)),
  doIsEqual: (left, right) => left === right,
  // BigInts don't observably overflow
  doAdd: (left, right) => left + right,
  doSubtract: (left, rightBound) =>
    Nat(left - /** @type {bigint} */ (/** @type {unknown} */ (rightBound))),
});
