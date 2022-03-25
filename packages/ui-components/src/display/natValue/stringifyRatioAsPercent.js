// @ts-check

import { assert, details } from '@agoric/assert';
import '@agoric/zoe/exported.js';

import { captureNum } from './helpers/captureNum.js';
import { roundToDecimalPlaces } from './helpers/roundToDecimalPlaces.js';

const PERCENT_BASE = 100n;
const PLACES_TO_SHOW = 0;

/**
 * @param {Ratio} ratio
 * @param {(brand: Brand) => number | undefined} getDecimalPlaces
 * @param {number} [placesToShow]
 * @returns {string}
 */
export const stringifyRatioAsPercent = (
  ratio,
  getDecimalPlaces,
  placesToShow = PLACES_TO_SHOW,
) => {
  if (ratio === null || ratio === undefined) {
    return '0';
  }
  assert(
    ratio && ratio.numerator,
    details`Ratio ${ratio} did not look like a ratio`,
  );

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
  const denomPower = 10n ** BigInt(denomDecimalPlaces);
  const numPower = 10n ** BigInt(numDecimalPlaces);
  // @ts-ignore value is BigInt
  const numerator = ratio.numerator.value * denomPower * PERCENT_BASE;
  // @ts-ignore value is BigInt
  const denominator = ratio.denominator.value * numPower;
  const str = `${Number(numerator) / Number(denominator)}`;
  const capturedNum = captureNum(str);
  const right = roundToDecimalPlaces(capturedNum.right, placesToShow);
  if (right === '') {
    return `${capturedNum.left}`;
  }
  return `${capturedNum.left}.${right}`;
};
