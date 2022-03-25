// @ts-check

/**
 * @callback Maximum
 * @param {Amount} left
 * @param {Amount} right
 * @returns {Amount}
 */

/**
 * A bigint representing a number that will be divided by 10,0000. Financial
 * ratios are often represented in basis points.
 *
 * @typedef {bigint} BASIS_POINTS
 */

/**
 * Make a Ratio representing a fee expressed in Basis Points. (hundredths of a percent)
 *
 * @callback MakeFeeRatio
 * @param {BASIS_POINTS} feeBP
 * @param {Brand} brandOfFee
 * @returns {Ratio}
 */

/**
 * @callback AmountGT
 * @param {Amount} left
 * @param {Amount} right
 * @returns {boolean}
 */
