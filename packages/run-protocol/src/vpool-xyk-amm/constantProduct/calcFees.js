// @ts-check

import { AmountMath } from '@agoric/ertp';
import {
  ceilMultiplyBy,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';

import { BASIS_POINTS } from './defaults.js';

const { details: X } = assert;

/**
 * Make a ratio given a nat representing basis points and a brand.
 *
 * @type {MakeFeeRatio}
 */
const makeFeeRatio = (feeBP, brandOfFee) =>
  makeRatio(feeBP, brandOfFee, BASIS_POINTS);

/** @type {Maximum} */
const maximum = (left, right) => {
  // If left is greater or equal, return left. Otherwise return right.
  return AmountMath.isGTE(left, right) ? left : right;
};

/** @type {AmountGT} */
const amountGT = (left, right) =>
  AmountMath.isGTE(left, right) && !AmountMath.isEqual(left, right);

/**
 * Apply the feeRatio to the amount that has a matching brand. This used to
 * calculate fees in the single pool case.
 *
 * @param {{ amountIn: Amount; amountOut: Amount }} amounts - A record with two
 *   amounts in different brands.
 * @param {Ratio} feeRatio
 * @returns {Amount}
 */
const calcFee = ({ amountIn, amountOut }, feeRatio) => {
  assert(
    feeRatio.numerator.brand === feeRatio.denominator.brand,
    X`feeRatio numerator and denominator must use the same brand ${feeRatio}`,
  );

  let sameBrandAmount;
  if (amountIn.brand === feeRatio.numerator.brand) {
    sameBrandAmount = amountIn;
  } else if (amountOut.brand === feeRatio.numerator.brand) {
    sameBrandAmount = amountOut;
  } else {
    assert(
      false,
      X`feeRatio's brand (${feeRatio.numerator.brand}) must match one of the amounts [${amountIn}, ${amountOut}].`,
    );
  }

  // Always round fees up
  const fee = ceilMultiplyBy(sameBrandAmount, feeRatio);

  // Fee cannot exceed the amount on which it is levied
  assert(
    AmountMath.isGTE(sameBrandAmount, fee),
    X`The feeRatio can't be greater than 1 ${feeRatio}`,
  );

  return fee;
};

/**
 * Estimate the swap values, then calculate fees. The swapFn provided by the
 * caller will be swapInNoFees or swapOutNoFees. SwapOut.
 *
 * @type {CalculateFees}
 */
const calculateFees = (
  amountGiven,
  poolAllocation,
  amountWanted,
  protocolFeeRatio,
  poolFeeRatio,
  swapFn,
) => {
  // Get a rough estimation in both brands of the amount to be swapped
  const estimation = swapFn({ amountGiven, poolAllocation, amountWanted });

  const protocolFee = calcFee(estimation, protocolFeeRatio);
  const poolFee = calcFee(estimation, poolFeeRatio);

  return harden({ protocolFee, poolFee, ...estimation });
};

harden(amountGT);
harden(maximum);
harden(makeFeeRatio);
harden(calculateFees);

export { amountGT, maximum, makeFeeRatio, calculateFees };
