// @ts-check

import { passStyleOf, assertRemotable, assertRecord } from '@endo/marshal';

import './types.js';
import { M, matches } from '@agoric/store';
import { natMathHelpers } from './mathHelpers/natMathHelpers.js';
import { setMathHelpers } from './mathHelpers/setMathHelpers.js';
import { copySetMathHelpers } from './mathHelpers/copySetMathHelpers.js';
import { copyBagMathHelpers } from './mathHelpers/copyBagMathHelpers.js';

const { details: X, quote: q } = assert;

/**
 * Constants for the kinds of assets we support.
 *
 * @type {{
 *   NAT: 'nat';
 *   SET: 'set';
 *   COPY_SET: 'copySet';
 *   COPY_BAG: 'copyBag';
 * }}
 */
const AssetKind = harden({
  NAT: 'nat',
  SET: 'set',
  COPY_SET: 'copySet',
  COPY_BAG: 'copyBag',
});
const assetKindNames = harden(Object.values(AssetKind).sort());

/** @type {AssertAssetKind} */
const assertAssetKind = allegedAK =>
  assert(
    assetKindNames.includes(allegedAK),
    X`The assetKind ${allegedAK} must be one of ${q(assetKindNames)}`,
  );
harden(assertAssetKind);

/**
 * Amounts describe digital assets. From an amount, you can learn the brand of
 * digital asset as well as "how much" or "how many". Amounts have two parts: a
 * brand (loosely speaking, the type of digital asset) and the value (the answer
 * to "how much"). For example, in the phrase "5 bucks", "bucks" takes the role
 * of the brand and the value is 5. Amounts can describe fungible and
 * non-fungible digital assets. Amounts are pass-by-copy and can be made by and
 * sent to anyone.
 *
 * The issuer is the authoritative source of the amount in payments and purses.
 * The issuer must be able to do things such as add digital assets to a purse
 * and withdraw digital assets from a purse. To do so, it must know how to add
 * and subtract digital assets. Rather than hard-coding a particular solution,
 * we chose to parameterize the issuer with a collection of polymorphic
 * functions, which we call `AmountMath`. These math functions include concepts
 * like addition, subtraction, and greater than or equal to.
 *
 * We also want to make sure there is no confusion as to what kind of asset we
 * are using. Thus, AmountMath includes checks of the `brand`, the unique
 * identifier for the type of digital asset. If the wrong brand is used in
 * AmountMath, an error is thrown and the operation does not succeed.
 *
 * AmountMath uses mathHelpers to do most of the work, but then adds the brand
 * to the result. The function `value` gets the value from the amount by
 * removing the brand (amount -> value), and the function `make` adds the brand
 * to produce an amount (value -> amount). The function `coerce` takes an amount
 * and checks it, returning an amount (amount -> amount).
 *
 * Each issuer of digital assets has an associated brand in a one-to-one
 * mapping. In untrusted contexts, such as in analyzing payments and amounts, we
 * can get the brand and find the issuer which matches the brand. The issuer and
 * the brand mutually validate each other.
 */

/**
 * @type {{
 *   nat: NatMathHelpers;
 *   set: SetMathHelpers;
 *   copySet: CopySetMathHelpers;
 *   copyBag: CopyBagMathHelpers;
 * }}
 */
const helpers = {
  nat: natMathHelpers,
  set: setMathHelpers,
  copySet: copySetMathHelpers,
  copyBag: copyBagMathHelpers,
};

/**
 * @template {AmountValue} V
 * @type {(value: V) => AssetKindForValue<V>}
 */
const assertValueGetAssetKind = value => {
  const passStyle = passStyleOf(value);
  if (passStyle === 'bigint') {
    // @ts-expect-error cast
    return 'nat';
  }
  if (passStyle === 'copyArray') {
    // @ts-expect-error cast
    return 'set';
  }
  if (matches(value, M.set())) {
    // @ts-expect-error cast
    return 'copySet';
  }
  if (matches(value, M.bag())) {
    // @ts-expect-error cast
    return 'copyBag';
  }
  assert.fail(
    // TODO This isn't quite the right error message, in case valuePassStyle
    // is 'tagged'. We would need to distinguish what kind of tagged
    // object it is.
    // Also, this kind of manual listing is a maintenance hazard we
    // (TODO) will encounter when we extend the math helpers further.
    X`value ${value} must be a bigint, copySet, copyBag, or an array, not ${passStyle}`,
  );
};

/**
 * Asserts that value is a valid AmountMath and returns the appropriate helpers.
 *
 * Made available only for testing, but it is harmless for other uses.
 *
 * @template {AmountValue} V
 * @param {V} value
 * @returns {MathHelpers<V>}
 */
export const assertValueGetHelpers = value =>
  // @ts-expect-error cast
  helpers[assertValueGetAssetKind(value)];

/** @type {(allegedBrand: Brand, brand?: Brand) => void} */
const optionalBrandCheck = (allegedBrand, brand) => {
  if (brand !== undefined) {
    assertRemotable(brand, 'brand');
    assert.equal(
      allegedBrand,
      brand,
      X`amount's brand ${allegedBrand} did not match expected brand ${brand}`,
    );
  }
};

/**
 * @template {AssetKind} [K=AssetKind]
 * @param {Amount<K>} leftAmount
 * @param {Amount<K>} rightAmount
 * @param {Brand<K> | undefined} brand
 * @returns {MathHelpers<any>}
 */
const checkLRAndGetHelpers = (leftAmount, rightAmount, brand = undefined) => {
  assertRecord(leftAmount, 'leftAmount');
  assertRecord(rightAmount, 'rightAmount');
  const { value: leftValue, brand: leftBrand } = leftAmount;
  const { value: rightValue, brand: rightBrand } = rightAmount;
  assertRemotable(leftBrand, 'leftBrand');
  assertRemotable(rightBrand, 'rightBrand');
  optionalBrandCheck(leftBrand, brand);
  optionalBrandCheck(rightBrand, brand);
  assert.equal(
    leftBrand,
    rightBrand,
    X`Brands in left ${leftBrand} and right ${rightBrand} should match but do not`,
  );
  const leftHelpers = assertValueGetHelpers(leftValue);
  const rightHelpers = assertValueGetHelpers(rightValue);
  assert.equal(
    leftHelpers,
    rightHelpers,
    X`The left ${leftAmount} and right amount ${rightAmount} had different assetKinds`,
  );
  return leftHelpers;
};

/**
 * @template {AssetKind} K
 * @param {MathHelpers<AssetKind>} h
 * @param {Amount<K>} leftAmount
 * @param {Amount<K>} rightAmount
 * @returns {[K, K]}
 */
const coerceLR = (h, leftAmount, rightAmount) => {
  // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
  return [h.doCoerce(leftAmount.value), h.doCoerce(rightAmount.value)];
};

/**
 * Logic for manipulating amounts.
 *
 * Amounts are the canonical description of tradable goods. They are manipulated
 * by issuers and mints, and represent the goods and currency carried by purses
 * and payments. They can be used to represent things like currency, stock, and
 * the abstract right to participate in a particular exchange.
 */
const AmountMath = {
  /**
   * Make an amount from a value by adding the brand.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Brand<K>} brand
   * @param {AssetValueForKind<K>} allegedValue
   * @returns {Amount<K>}
   */
  // allegedValue has a conditional expression for type widening, to prevent V being bound to a a literal like 1n
  make: (brand, allegedValue) => {
    assertRemotable(brand, 'brand');
    const h = assertValueGetHelpers(allegedValue);
    const value = h.doCoerce(allegedValue);
    // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
    return harden({ brand, value });
  },
  /**
   * Make sure this amount is valid enough, and return a corresponding valid amount if so.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Brand} brand
   * @param {Amount<K>} allegedAmount
   * @returns {Amount<K>}
   */
  coerce: (brand, allegedAmount) => {
    assertRemotable(brand, 'brand');
    assertRecord(allegedAmount, 'amount');
    const { brand: allegedBrand, value: allegedValue } = allegedAmount;
    assert(
      brand === allegedBrand,
      X`The brand in the allegedAmount ${allegedAmount} in 'coerce' didn't match the specified brand ${brand}.`,
    );
    // Will throw on inappropriate value
    // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
    return AmountMath.make(brand, allegedValue);
  },
  /**
   * Extract and return the value.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Brand<K>} brand
   * @param {Amount<K>} amount
   * @returns {AssetValueForKind<K>}
   */
  getValue: (brand, amount) => AmountMath.coerce(brand, amount).value,
  /**
   * Return the amount representing an empty amount. This is the identity
   * element for MathHelpers.add and MatHelpers.subtract.
   *
   * @template {AssetKind} K
   * @param {Brand<K>} brand
   * @param {K} [assetKind]
   * @returns {Amount<K>}
   */
  // @ts-expect-error TS/jsdoc things 'nat' can't be assigned to K subclassing AssetKind
  // If we were using TypeScript we'd simply overload the function definition for each case.
  makeEmpty: (brand, assetKind = 'nat') => {
    assertRemotable(brand, 'brand');
    assertAssetKind(assetKind);
    const value = helpers[assetKind].doMakeEmpty();
    // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
    return harden({ brand, value });
  },
  /**
   * Return the amount representing an empty amount, using another amount as the
   * template for the brand and assetKind.
   *
   * @template {AssetKind} K
   * @param {Amount<K>} amount
   * @returns {Amount<K>}
   */
  makeEmptyFromAmount: amount => {
    assertRecord(amount, 'amount');
    const { brand, value } = amount;
    // @ts-expect-error cast
    const assetKind = assertValueGetAssetKind(value);
    // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
    return AmountMath.makeEmpty(brand, assetKind);
  },
  /**
   * Return true if the Amount is empty. Otherwise false.
   *
   * @param {Amount} amount
   * @param {Brand} [brand]
   * @returns {boolean}
   */
  isEmpty: (amount, brand = undefined) => {
    assertRecord(amount, 'amount');
    const { brand: allegedBrand, value } = amount;
    assertRemotable(allegedBrand, 'brand');
    optionalBrandCheck(allegedBrand, brand);
    const h = assertValueGetHelpers(value);
    return h.doIsEmpty(h.doCoerce(value));
  },
  /**
   * Returns true if the leftAmount is greater than or equal to the rightAmount.
   * For non-scalars, "greater than or equal to" depends on the kind of amount,
   * as defined by the MathHelpers. For example, whether rectangle A is greater
   * than rectangle B depends on whether rectangle A includes rectangle B as
   * defined by the logic in MathHelpers.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} leftAmount
   * @param {Amount<K>} rightAmount
   * @param {Brand<K>} [brand]
   * @returns {boolean}
   */
  isGTE: (leftAmount, rightAmount, brand = undefined) => {
    const h = checkLRAndGetHelpers(leftAmount, rightAmount, brand);
    return h.doIsGTE(...coerceLR(h, leftAmount, rightAmount));
  },
  /**
   * Returns true if the leftAmount equals the rightAmount. We assume that if
   * isGTE is true in both directions, isEqual is also true
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} leftAmount
   * @param {Amount<K>} rightAmount
   * @param {Brand<K>} [brand]
   * @returns {boolean}
   */
  isEqual: (leftAmount, rightAmount, brand = undefined) => {
    const h = checkLRAndGetHelpers(leftAmount, rightAmount, brand);
    return h.doIsEqual(...coerceLR(h, leftAmount, rightAmount));
  },
  /**
   * Returns a new amount that is the union of both leftAmount and rightAmount.
   *
   * For fungible amount this means adding the values. For other kinds of
   * amount, it usually means including all of the elements from both left and right.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} leftAmount
   * @param {Amount<K>} rightAmount
   * @param {Brand<K>} [brand]
   * @returns {Amount<K>}
   */
  add: (leftAmount, rightAmount, brand = undefined) => {
    const h = checkLRAndGetHelpers(leftAmount, rightAmount, brand);
    const value = h.doAdd(...coerceLR(h, leftAmount, rightAmount));
    return harden({ brand: leftAmount.brand, value });
  },
  /**
   * Returns a new amount that is the leftAmount minus the rightAmount (i.e.
   * everything in the leftAmount that is not in the rightAmount). If leftAmount
   * doesn't include rightAmount (subtraction results in a negative), throw an
   * error. Because the left amount must include the right amount, this is NOT
   * equivalent to set subtraction.
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} leftAmount
   * @param {Amount<K>} rightAmount
   * @param {Brand<K>} [brand]
   * @returns {Amount<K>}
   */
  subtract: (leftAmount, rightAmount, brand = undefined) => {
    const h = checkLRAndGetHelpers(leftAmount, rightAmount, brand);
    const value = h.doSubtract(...coerceLR(h, leftAmount, rightAmount));
    return harden({ brand: leftAmount.brand, value });
  },
  /**
   * Returns the min value between x and y using isGTE
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} x
   * @param {Amount<K>} y
   * @param {Brand<K>} [brand]
   * @returns {Amount<K>}
   */
  min: (x, y, brand = undefined) => (AmountMath.isGTE(x, y, brand) ? y : x),
  /**
   * Returns the max value between x and y using isGTE
   *
   * @template {AssetKind} [K=AssetKind]
   * @param {Amount<K>} x
   * @param {Amount<K>} y
   * @param {Brand<K>} [brand]
   * @returns {Amount<K>}
   */
  max: (x, y, brand = undefined) => (AmountMath.isGTE(x, y, brand) ? x : y),
};
harden(AmountMath);

/** @param {Amount} amount */
const getAssetKind = amount => {
  assertRecord(amount, 'amount');
  const { value } = amount;
  // @ts-ignore cast (ignore b/c erroring in CI but not my IDE)
  return assertValueGetAssetKind(value);
};
harden(getAssetKind);

export { AmountMath, AssetKind, getAssetKind, assertAssetKind };
