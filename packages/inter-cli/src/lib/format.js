// @ts-check
// @jessie-check
import { Nat } from '@endo/nat';
import { makeMap } from 'jessie.js';

const { Fail } = assert;

/**
 * @param {NatValue} a
 * @param {NatValue} b
 */
const gcd = (a, b) => {
  if (b === 0n) {
    return a;
  }

  return gcd(b, a % b);
};

/**
 *
 * @param {Record<string,import("./boardClient").VBankAssetDetail>} vbankAssets
 */
export const makeAssetFormatters = vbankAssets => {
  const byBrand = makeMap(Object.values(vbankAssets).map(a => [a.brand, a]));

  /** @param {Brand} brand */
  const getDetail = brand => {
    const detail = byBrand.get(brand);
    if (!detail) {
      throw Fail`unknown brand: ${brand}`;
    }
    return detail;
  };

  /** @param {import("./boardClient").VBankAssetDetail} detail */
  const getDecimalPlaces = detail => {
    const decimalPlaces = detail?.displayInfo?.decimalPlaces || 0;
    return decimalPlaces;
  };

  /**
   * @param {NatValue} value
   * @param {number} decimalPlaces
   */
  const decimal = (value, decimalPlaces) => {
    const rawNumeral = `${value}`;
    const digits = rawNumeral.length;
    const whole =
      digits > decimalPlaces
        ? rawNumeral.slice(0, digits - decimalPlaces)
        : '0';
    const frac = ('0'.repeat(decimalPlaces) + rawNumeral)
      .slice(-decimalPlaces)
      .replace(/0+$/, '');
    const dot = frac.length > 0 ? '.' : '';
    return `${whole}${dot}${frac}`;
  };

  /** @param {Amount<'nat'>} amt */
  const amount = ({ brand, value }) => {
    const detail = getDetail(brand);
    const decimalPlaces = getDecimalPlaces(detail);
    return `${decimal(value, decimalPlaces)} ${detail.issuerName}`;
  };

  /**
   * @param {Ratio} x
   * @param {number} [showDecimals]
   */
  const rate = ({ numerator, denominator }, showDecimals = 4) => {
    numerator.brand === denominator.brand || Fail`brands differ in rate`;
    const pct = (100 * Number(numerator.value)) / Number(denominator.value);
    return `${pct.toFixed(showDecimals)}%`;
  };

  /**
   * @param {Ratio} x
   * @param {number} [showDecimals]
   */
  const price = ({ numerator, denominator }, showDecimals = 4) => {
    const detail = {
      top: getDetail(numerator.brand),
      bot: getDetail(denominator.brand),
    };
    const decimaPlaces = {
      top: getDecimalPlaces(detail.top),
      bot: getDecimalPlaces(detail.bot),
    };
    const f = gcd(numerator.value, denominator.value);
    const scaled = {
      top: numerator.value / f,
      bot: denominator.value / f,
      shift: 10 ** (decimaPlaces.bot - decimaPlaces.top),
    };
    Number.isSafeInteger(Number(scaled.top)) ||
      Fail`too big to divide: ${scaled.top}`;
    Number.isSafeInteger(Number(scaled.bot)) ||
      Fail`too big to divide: ${scaled.bot}`;
    scaled.bot > 0n || Fail`cannot divide by 0`;
    const x = Number(scaled.top) / (Number(scaled.bot) * scaled.shift);
    // TODO: format ratios > 1e20 nicely
    const xStr = x.toFixed(showDecimals);
    if (numerator.brand === denominator.brand) {
      return `${xStr}`;
    }
    return `${xStr} ${detail.top.issuerName}/${detail.bot.issuerName}`;
  };

  return harden({
    hasBrand: b => byBrand.has(b),
    amount,
    price,
    rate,
  });
};

/** @param {NatValue} seconds */
export const formatTimestamp = seconds => {
  Nat(seconds);
  const ms = Number(seconds) * 1000;
  const iso = new Date(ms).toISOString();
  const noFrac = iso.replace(/\.000Z$/, 'Z');
  return noFrac;
};
