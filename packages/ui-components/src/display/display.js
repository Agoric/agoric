// @ts-check
import { assert, details } from '@agoric/assert';
import { AssetKind } from '@agoric/ertp';
import '@agoric/ertp/exported.js';

import { parseAsNat } from './natValue/parseAsNat.js';
import { stringifyNat } from './natValue/stringifyNat.js';
import { parseAsSet } from './setValue/parseAsSet.js';
import { stringifySet } from './setValue/stringifySet.js';

/**
 * @param {string} str - String to parse as a value
 * @param {AssetKind} [assetKind] - AssetKind of the value
 * @param {number} [decimalPlaces] - Places to move the decimal to the left
 * @returns {AmountValue}
 */
export const parseAsValue = (
  str,
  assetKind = AssetKind.NAT,
  decimalPlaces = 0,
) => {
  if (assetKind === AssetKind.NAT) {
    return parseAsNat(str, decimalPlaces);
  }
  if (assetKind === AssetKind.SET) {
    return parseAsSet(str);
  }
  assert.fail(details`AssetKind ${assetKind} must be NAT or SET`);
};

/**
 * @param {string} str - String to parse as a value
 * @param {Brand} brand - Brand to use in the amount
 * @param {AssetKind} [assetKind] - AssetKind of the value
 * @param {number} [decimalPlaces] - Places to move the decimal to the left
 * @returns {Amount}
 */
export const parseAsAmount = (
  str,
  brand,
  assetKind = AssetKind.NAT,
  decimalPlaces = 0,
) => {
  return { brand, value: parseAsValue(str, assetKind, decimalPlaces) };
};

/**
 * @param {AmountValue} value - Value to stringify
 * @param {AssetKind} [assetKind] - AssetKind of the value
 * @param {number} [decimalPlaces] - Places to move the decimal to the right in the string
 * @param {number} [placesToShow] - Places after the decimal to show
 * @returns {string}
 */
export const stringifyValue = (
  value,
  assetKind = AssetKind.NAT,
  decimalPlaces = 0,
  placesToShow = 2,
) => {
  if (assetKind === AssetKind.NAT) {
    // @ts-ignore AmountValue is a Nat
    return stringifyNat(value, decimalPlaces, placesToShow);
  }
  if (assetKind === AssetKind.SET) {
    // @ts-ignore AmountValue is a SetValue
    return stringifySet(value);
  }
  assert.fail(details`AssetKind ${assetKind} must be NAT or SET`);
};

/**
 * Stringify the value of a purse
 *
 * @param {any} purse
 * @returns {string}
 */
export const stringifyPurseValue = purse => {
  if (!purse) {
    return '0';
  }
  return stringifyValue(
    purse.value,
    purse.displayInfo.assetKind,
    purse.displayInfo.decimalPlaces,
  );
};

/**
 * Stringify the value in an amount
 *
 * @param {Amount} amount
 * @param {AssetKind} [assetKind] - AssetKind of the value
 * @param {number} [decimalPlaces] - Places to move the decimal to the right in the string
 * @param {number} [placesToShow] - Places after the decimal to show
 * @returns {string}
 */
export function stringifyAmountValue(
  amount,
  assetKind,
  decimalPlaces,
  placesToShow,
) {
  if (!amount) {
    return '0';
  }
  return stringifyValue(amount.value, assetKind, decimalPlaces, placesToShow);
}
