// @ts-check
/// <reference types="ses"/>

/**
 * @typedef {Object} SeatGainsLossesRecord
 * @property {ZCFSeat} seat
 * @property {AmountKeywordRecord} gains - What the seat will gain as a result
 *   of this trade
 * @property {AmountKeywordRecord} [losses] - What the seat will give up as a
 *   result of this trade. Losses is optional, but can only be omitted if the
 *   keywords for both seats are the same. If losses is not defined, the gains
 *   of the other seat is subtracted.
 */

/**
 * @callback Swap If two seats can satisfy each other's wants, trade enough to
 *   satisfy the wants of both seats and exit both seats.
 *
 *   The surplus remains with the original seat. For example if seat A gives 5
 *   moola and seat B only wants 3 moola, seat A retains 2 moola.
 *
 *   If the swap fails, no assets are transferred, both seats will fail, and the
 *   function throws.
 *
 *   The keywords for both seats must match.
 * @param {ZCF} zcf
 * @param {ZCFSeat} leftSeat
 * @param {ZCFSeat} rightSeat
 * @returns {string}
 */

/**
 * @callback SwapExact Swap such that both seats gain what they want and lose
 *   everything that they gave. Only good for exact and entire swaps where each
 *   seat wants everything that the other seat has. The benefit of using this
 *   method is that the keywords of each seat do not matter.
 *
 *   If the swap fails, no assets are transferred, both seats will fail, and the
 *   function throws.
 * @param {ZCF} zcf
 * @param {ZCFSeat} leftSeat
 * @param {ZCFSeat} rightSeat
 * @returns {string}
 */

/**
 * @typedef {Record<Keyword, Keyword>} KeywordKeywordRecord A mapping of
 *   keywords to keywords.
 */

/**
 * @callback Reverse Given a mapping of keywords to keywords, invert the keys
 *   and values. This is used to map the offers made to another contract back to
 *   the keywords used in the first contract.
 * @param {KeywordKeywordRecord} [keywordRecord]
 * @returns {KeywordKeywordRecord}
 */

/**
 * @callback MapKeywords Remap the keywords of an amountKeywordRecord or a
 *   PaymentPKeywordRecord according to a mapping. This is used to remap from
 *   keywords used in contractA to keywords used in contractB and vice versa in `offerTo`
 * @param {AmountKeywordRecord | PaymentPKeywordRecord | undefined}
 *   KeywordRecord
 * @param {KeywordKeywordRecord} keywordMapping
 */

/**
 * @typedef {Object} Ratio
 * @property {Amount<'nat'>} numerator
 * @property {Amount<'nat'>} denominator
 */

/**
 * @callback ScaleAmount
 * @param {Amount} amount
 * @param {Ratio} ratio
 * @returns {Amount<'nat'>}
 */
