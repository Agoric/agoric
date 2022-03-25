/** @typedef {'long' | 'short'} PositionKind */

/**
 * @callback MakeOptionInvitation
 * @param {PositionKind} positionKind
 * @returns {Promise<Payment>}
 */

/**
 * @typedef {Object} PayoffHandler
 * @property {() => void} schedulePayoffs
 * @property {MakeOptionInvitation} makeOptionInvitation
 */

/**
 * @typedef {Object} CalculateSharesReturn Return value from calculateShares,
 *   which represents the portions assigned to the long and short side of a
 *   transaction. These will be two non-negative integers that sum to 100.
 * @property {Ratio} longShare
 * @property {Ratio} shortShare
 */

/**
 * @callback CalculateShares Calculate the portion (as a percentage) of the
 *   collateral that should be allocated to the long side of a call spread
 *   contract. price gives the value of the underlying asset at closing that
 *   determines the payouts to the parties
 *
 *   If price <= strikePrice1, return Ratio representing 0 if price >=
 *   strikePrice2, return Ratio representing 1. Otherwise return longShare and
 *   shortShare representing ratios between 0% and 100% reflecting the position
 *   of the price in the range from strikePrice1 to strikePrice2.
 * @param {Brand} collateralBrand
 * @param {Amount} price
 * @param {Amount} strikePrice1
 * @param {Amount} strikePrice2
 * @returns {CalculateSharesReturn}
 */

/**
 * @callback Make100Percent
 * @param {Brand} brand
 * @returns {Ratio}
 */

/**
 * @callback Make0Percent
 * @param {Brand} brand
 * @returns {Ratio}
 */
