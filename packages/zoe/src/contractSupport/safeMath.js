// @ts-check

import { Nat } from '@agoric/nat';

/**
 * These operations should be used for calculations with the values of basic
 * fungible tokens.
 *
 * NatSafeMath is designed to be used directly, and so it needs to validate the
 * inputs, as well as the outputs when necessary.
 */
export const natSafeMath = harden({
  // BigInts don't observably overflow
  add: (x, y) => Nat(x) + Nat(y),
  subtract: (x, y) => Nat(Nat(x) - Nat(y)),
  multiply: (x, y) => Nat(x) * Nat(y),
  floorDivide: (x, y) => Nat(x) / Nat(y),
  ceilDivide: (x, y) => {
    y = Nat(y);
    return Nat(Nat(x) + y - 1n) / y;
  },
  isGTE: (x, y) => x >= y,
});
