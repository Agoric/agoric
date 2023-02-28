import {
  makeRatio,
  coerceToNumber,
} from '@agoric/zoe/src/contractSupport/index.js';
import { M, mustMatch } from '@agoric/store';
import { RatioShape } from '@agoric/ertp';

import { decodeData, encodeData } from '../vaultFactory/storeUtils.js';

const { Fail } = assert;

/**
 * @file we use a floating point representation of the price or rate as the
 * first part of the key in the store. The second part is the sequence number of
 * the bid, but it doesn't matter for sorting. When we retrieve multiple bids,
 * it's only by bid value, so we don't care how the sequence numbers sort.
 *
 * We take advantage of the fact that encodeData takes a passable and turns it
 * into a sort key. Arrays of passable data sort like composite keys.
 */

/**
 * Return a sort key that will compare based only on price. Price is the prefix
 * of the complete sort key, which is sufficient to find offers below a cutoff.
 *
 * @param {Ratio} offerPrice
 */
export const toPartialOfferKey = offerPrice => {
  assert(offerPrice);
  const mostSignificantPart = coerceToNumber(offerPrice);
  return encodeData(harden([mostSignificantPart, 0n]));
};

/**
 * Return a sort key that distinguishes by Price and sequence number
 *
 * @param {Ratio} offerPrice IST/collateral
 * @param {bigint} sequenceNumber
 * @returns {string} lexically sortable string in which highest price is first,
 *    ties will be broken by sequenceNumber of offer
 */
export const toPriceOfferKey = (offerPrice, sequenceNumber) => {
  mustMatch(offerPrice, RatioShape);
  offerPrice.numerator.brand !== offerPrice.denominator.brand ||
    Fail`offer prices must have different numerator and denominator`;
  mustMatch(sequenceNumber, M.nat());

  const mostSignificantPart = coerceToNumber(offerPrice);
  return encodeData(harden([mostSignificantPart, sequenceNumber]));
};

const priceRatioFromFloat = (floatPrice, numBrand, denomBrand, useDecimals) => {
  const denominatorValue = 10 ** useDecimals;
  return makeRatio(
    BigInt(Math.round(floatPrice * denominatorValue)),
    numBrand,
    BigInt(denominatorValue),
    denomBrand,
  );
};

const discountRatioFromKey = (floatDiscount, numBrand, useDecimals) => {
  const denominatorValue = 10 ** useDecimals;
  return makeRatio(
    BigInt(Math.round(floatDiscount * denominatorValue)),
    numBrand,
    BigInt(denominatorValue),
  );
};

/**
 * fromPriceOfferKey is only used for diagnostics.
 *
 * @param {string} key
 * @param {Brand} numBrand
 * @param {Brand} denomBrand
 * @param {number} useDecimals
 * @returns {[normalizedPrice: Ratio, sequenceNumber: bigint]}
 */
export const fromPriceOfferKey = (key, numBrand, denomBrand, useDecimals) => {
  const [pricePart, sequenceNumberPart] = decodeData(key);
  return [
    priceRatioFromFloat(pricePart, numBrand, denomBrand, useDecimals),
    sequenceNumberPart,
  ];
};

export const toDiscountComparator = rate => {
  assert(rate);
  const mostSignificantPart = coerceToNumber(rate);
  return encodeData(harden([mostSignificantPart, 0n]));
};

/**
 * Sorts offers expressed as percentage of the current oracle price.
 *
 * @param {Ratio} rate discount/markup rate expressed as a ratio IST/IST
 * @param {bigint} sequenceNumber
 * @returns {string} lexically sortable string in which highest price is first,
 *    ties will be broken by sequenceNumber of offer
 */
export const toDiscountedRateOfferKey = (rate, sequenceNumber) => {
  mustMatch(rate, RatioShape);
  rate.numerator.brand === rate.denominator.brand ||
    Fail`discount rate must have the same numerator and denominator`;
  mustMatch(sequenceNumber, M.nat());

  const mostSignificantPart = coerceToNumber(rate);
  return encodeData(harden([mostSignificantPart, sequenceNumber]));
};

/**
 * fromDiscountedRateOfferKey is only used for diagnostics.
 *
 * @param {string} key
 * @param {Brand} brand
 * @param {number} useDecimals
 * @returns {[normalizedPrice: Ratio, sequenceNumber: bigint]}
 */
export const fromDiscountedRateOfferKey = (key, brand, useDecimals) => {
  const [discountPart, sequenceNumberPart] = decodeData(key);
  return [
    discountRatioFromKey(discountPart, brand, useDecimals),
    sequenceNumberPart,
  ];
};
