// @jessie-check

import { AmountMath } from '@agoric/ertp';
import { Nat } from '@endo/nat';
import { E } from '@endo/eventual-send';

/**
 * @import {PriceQuote, PriceDescription} from '@agoric/zoe';
 */

const { Fail } = assert;

// PriceAuthorities return quotes as a pair of an amount and a payment, both
// with the same value. The underlying amount wraps amountIn, amountOut, timer
// and timestamp. The payment is issued by the quoteIssuer to support veracity
// checking. These helpers make it easier to extract the components of the Quote

/**
 * @param {PriceQuote} quote
 * @returns {PriceDescription}
 */
export const getPriceDescription = quote => {
  quote.quoteAmount.value.length === 1 ||
    Fail`quoteAmount set must have one member`;
  return quote.quoteAmount.value[0];
};

/** @param {PriceQuote} quote */
export const getAmountIn = quote => getPriceDescription(quote).amountIn;
/** @param {PriceQuote} quote */
export const getAmountOut = quote => getPriceDescription(quote).amountOut;
/** @type {(quote: PriceQuote) => import('@agoric/time').Timestamp} */
export const getTimestamp = quote => getPriceDescription(quote).timestamp;

/** @param {Brand<'nat'>} brand */
export const unitAmount = async brand => {
  // Brand methods are remote
  const displayInfo = await E(brand).getDisplayInfo();
  const decimalPlaces = displayInfo.decimalPlaces ?? 0;
  return AmountMath.make(brand, 10n ** Nat(decimalPlaces));
};
harden(unitAmount);
