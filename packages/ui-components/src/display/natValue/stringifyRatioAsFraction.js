// @ts-check

import { assert } from '@agoric/assert';
import { isNatValue } from '@agoric/ertp';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/zoe/exported.js';

import { stringifyNat } from './stringifyNat.js';

const PLACES_TO_SHOW = 2;

/**
 * @param {Ratio} ratio
 * @param {(brand: Brand) => number | undefined} getDecimalPlaces
 * @param {number} [numPlacesToShow]
 * @param {number} [denomPlacesToShow]
 * @returns {string}
 */
export const stringifyRatioAsFraction = (
  ratio,
  getDecimalPlaces,
  numPlacesToShow = PLACES_TO_SHOW,
  denomPlacesToShow = PLACES_TO_SHOW,
) => {
  assert(isNatValue(ratio.numerator.value));
  assert(isNatValue(ratio.denominator.value));

  const numDecimalPlaces = getDecimalPlaces(ratio.numerator.brand);
  const denomDecimalPlaces = getDecimalPlaces(ratio.denominator.brand);

  assert(
    numDecimalPlaces,
    `decimalPlaces for numerator ${ratio.numerator} must be provided`,
  );
  assert(
    denomDecimalPlaces,
    `decimalPlaces for denominator ${ratio.denominator} must be provided`,
  );
  const numeratorString = stringifyNat(
    // @ts-ignore value is BigInt
    ratio.numerator.value,
    numDecimalPlaces,
    numPlacesToShow,
  );
  const denominatorString = stringifyNat(
    // @ts-ignore value is BigInt
    ratio.denominator.value,
    denomDecimalPlaces,
    denomPlacesToShow,
  );
  return `${numeratorString} / ${denominatorString}`;
};
