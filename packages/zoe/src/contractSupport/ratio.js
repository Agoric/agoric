// @ts-check

import './types.js';
import { assert, details as X, q } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { assertRecord } from '@endo/marshal';
import { isNat } from '@agoric/nat';

import { natSafeMath } from './safeMath.js';

const { multiply, floorDivide, ceilDivide, add, subtract } = natSafeMath;

// make a Ratio, which represents a fraction. It is a pass-by-copy record.
//
// The natural syntax for the most common operations we want to support
// are Amount * Ratio and Amount / Ratio. Since the operations want to adhere to
// the ratio rather than the amount, we settled on a calling convention of
// [ceil|floor]MultiplyBy(Amount, Ratio) and [ceil|floor]DivideBy(Amount, Ratio)
//
// The most common kind of Ratio can be applied to Amounts of a particular
// brand, and produces results of the same brand. This represents a multiplier
// that is only applicable to that brand. The less common kind of Ratio can be
// applied to one particular brand of amounts, and produces results of another
// particular brand. This represents some kind of exchange rate. The
// brand-checking helps us ensure that normal Ratios aren't applied to amounts
// of the wrong brand, and that exchange rates are only used in the appropriate
// direction.
//
// Since the ratios are represented by a numerator and a denominator, every
// multiplication or division operation that produces an amount ends with a
// division of the underlying bigints, and bigint division requires that the
// rounding mode (round up or round down) be specified. It would be a mistake to
// hide this distinction from the caller, so we make it very visible by using
// floorMultiplyBy, ceilMultiplyBy, floorDivideBy, and ceilDivideBy.

const PERCENT = 100n;

const ratioPropertyNames = ['numerator', 'denominator'];

export const assertIsRatio = ratio => {
  assertRecord(ratio, 'ratio');
  const keys = Object.keys(ratio);
  assert(keys.length === 2, X`Ratio ${ratio} must be a record with 2 fields.`);
  for (const name of keys) {
    assert(
      ratioPropertyNames.includes(name),
      X`Parameter must be a Ratio record, but ${ratio} has ${q(name)}`,
    );
  }
  const numeratorValue = ratio.numerator.value;
  const denominatorValue = ratio.denominator.value;
  assert(
    isNat(numeratorValue),
    X`The numerator value must be a NatValue, not ${numeratorValue}`,
  );
  assert(
    isNat(denominatorValue),
    X`The denominator value must be a NatValue, not ${denominatorValue}`,
  );
};

/**
 * @param {bigint} numerator
 * @param {Brand} numeratorBrand
 * @param {bigint} [denominator] The default denominator is 100
 * @param {Brand} [denominatorBrand] The default is to reuse the numeratorBrand
 * @returns {Ratio}
 */
export const makeRatio = (
  numerator,
  numeratorBrand,
  denominator = PERCENT,
  denominatorBrand = numeratorBrand,
) => {
  assert(
    denominator > 0n,
    X`No infinite ratios! Denominator was 0/${q(denominatorBrand)}`,
  );

  return harden({
    numerator: AmountMath.make(numeratorBrand, numerator),
    denominator: AmountMath.make(denominatorBrand, denominator),
  });
};

/**
 * @param {Amount} numeratorAmount
 * @param {Amount} denominatorAmount
 * @returns {Ratio}
 */
export const makeRatioFromAmounts = (numeratorAmount, denominatorAmount) => {
  AmountMath.coerce(numeratorAmount.brand, numeratorAmount);
  AmountMath.coerce(denominatorAmount.brand, denominatorAmount);
  return makeRatio(
    // @ts-ignore value can be any AmountValue but makeRatio() supports only bigint
    numeratorAmount.value,
    numeratorAmount.brand,
    denominatorAmount.value,
    denominatorAmount.brand,
  );
};

const multiplyHelper = (amount, ratio, divideOp) => {
  AmountMath.coerce(amount.brand, amount);
  assertIsRatio(ratio);
  assert(
    amount.brand === ratio.denominator.brand,
    X`amount's brand ${q(amount.brand)} must match ratio's denominator ${q(
      ratio.denominator.brand,
    )}`,
  );

  return AmountMath.make(
    ratio.numerator.brand,
    divideOp(
      multiply(amount.value, ratio.numerator.value),
      ratio.denominator.value,
    ),
  );
};

/** @type {ScaleAmount} */
export const floorMultiplyBy = (amount, ratio) => {
  // @ts-ignore cast
  return multiplyHelper(amount, ratio, floorDivide);
};

/** @type {ScaleAmount} */
export const ceilMultiplyBy = (amount, ratio) => {
  // @ts-ignore cast
  return multiplyHelper(amount, ratio, ceilDivide);
};

const divideHelper = (amount, ratio, divideOp) => {
  AmountMath.coerce(amount.brand, amount);
  assertIsRatio(ratio);
  assert(
    amount.brand === ratio.numerator.brand,
    X`amount's brand ${q(amount.brand)} must match ratio's numerator ${q(
      ratio.numerator.brand,
    )}`,
  );

  return AmountMath.make(
    ratio.denominator.brand,
    divideOp(
      multiply(amount.value, ratio.denominator.value),
      ratio.numerator.value,
    ),
  );
};

/** @type {ScaleAmount} */
export const floorDivideBy = (amount, ratio) => {
  // @ts-ignore cast
  return divideHelper(amount, ratio, floorDivide);
};

/** @type {ScaleAmount} */
export const ceilDivideBy = (amount, ratio) => {
  // @ts-ignore cast
  return divideHelper(amount, ratio, ceilDivide);
};

/**
 * @param {Ratio} ratio
 * @returns {Ratio}
 */
export const invertRatio = ratio => {
  assertIsRatio(ratio);

  return makeRatio(
    /** @type {NatValue} */ (ratio.denominator.value),
    ratio.denominator.brand,
    /** @type {NatValue} */ (ratio.numerator.value),
    ratio.numerator.brand,
  );
};

/**
 * @param {Ratio} left
 * @param {Ratio} right
 * @returns {Ratio}
 */
export const addRatios = (left, right) => {
  assertIsRatio(right);
  assertIsRatio(left);
  assert(
    left.numerator.brand === left.denominator.brand &&
      left.numerator.brand === right.numerator.brand &&
      left.numerator.brand === right.denominator.brand,
    X`all brands must match:  ${q(left)} ${q(right)}`,
  );

  return makeRatio(
    add(
      multiply(left.numerator.value, right.denominator.value),
      multiply(left.denominator.value, right.numerator.value),
    ),
    left.numerator.brand,
    multiply(left.denominator.value, right.denominator.value),
  );
};

/**
 * @param {Ratio} left
 * @param {Ratio} right
 * @returns {Ratio}
 */
export const multiplyRatios = (left, right) => {
  assertIsRatio(right);
  assertIsRatio(left);
  assert(
    left.numerator.brand === left.denominator.brand &&
      left.numerator.brand === right.numerator.brand &&
      left.numerator.brand === right.denominator.brand,
    X`all brands must match:  ${q(left)} ${q(right)}`,
  );

  return makeRatio(
    multiply(left.numerator.value, right.numerator.value),
    left.numerator.brand,
    multiply(left.denominator.value, right.denominator.value),
  );
};

/**
 * If ratio is between 0 and 1, subtract from 1.
 *
 * @param {Ratio} ratio
 * @returns {Ratio}
 */
export const oneMinus = ratio => {
  assertIsRatio(ratio);
  assert(
    ratio.numerator.brand === ratio.denominator.brand,
    X`oneMinus only supports ratios with a single brand, but ${ratio.numerator.brand} doesn't match ${ratio.denominator.brand}`,
  );
  assert(
    ratio.numerator.value <= ratio.denominator.value,
    X`Parameter must be less than or equal to 1: ${ratio.numerator.value}/${ratio.denominator.value}`,
  );
  return makeRatio(
    subtract(ratio.denominator.value, ratio.numerator.value),
    ratio.numerator.brand,
    // @ts-ignore value can be any AmountValue but makeRatio() supports only bigint
    ratio.denominator.value,
    ratio.numerator.brand,
  );
};

/**
 * @param {Ratio} left
 * @param {Ratio} right
 * @returns {boolean}
 */
export const ratioGTE = (left, right) => {
  assert(
    left.numerator.brand === right.numerator.brand &&
      left.denominator.brand === right.denominator.brand,
    `brands must match`,
  );
  return natSafeMath.isGTE(
    multiply(left.numerator.value, right.denominator.value),
    multiply(right.numerator.value, left.denominator.value),
  );
};

/**
 * True iff the ratios are the same values (equal or equivalant may return false)
 *
 * @param {Ratio} left
 * @param {Ratio} right
 * @returns {boolean}
 */
export const ratiosSame = (left, right) => {
  return (
    AmountMath.isEqual(left.numerator, right.numerator) &&
    AmountMath.isEqual(left.denominator, right.denominator)
  );
};

/**
 * Make an equivalant ratio with a new denominator
 *
 * @param {Ratio} ratio
 * @param {bigint} newDen
 * @returns {Ratio}
 */
export const quantize = (ratio, newDen) => {
  const oldDen = ratio.denominator.value;
  const oldNum = ratio.numerator.value;
  const newNum =
    // TODO adopt banker's rounding https://github.com/Agoric/agoric-sdk/issues/4573
    newDen === oldDen ? oldNum : ceilDivide(oldNum * newDen, oldDen);
  return makeRatio(
    newNum,
    ratio.numerator.brand,
    newDen,
    ratio.denominator.brand,
  );
};
