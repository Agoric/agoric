/**
 * @typedef {Object} PriceQuote
 * @property {Amount} quoteAmount Amount whose value is a PriceQuoteValue
 * @property {ERef<Payment> | null} quotePayment The `quoteAmount` wrapped as a payment
 */

/**
 * @typedef {[PriceDescription]} PriceQuoteValue A single-valued set of
 *   PriceDescriptions. This is the `value` in PriceQuote.quoteAmount (`{ brand,
 *   value: PriceQuoteValue }`).
 */

/**
 * @typedef {Object} PriceDescription A description of a single quote
 * @property {Amount} amountIn The amount supplied to a trade
 * @property {Amount} amountOut The quoted result of trading `amountIn`
 * @property {TimerService} timer The service that gave the `timestamp`
 * @property {Timestamp} timestamp A timestamp according to `timer` for the quote
 * @property {any} [conditions] Additional conditions for the quote
 */

/**
 * @callback PriceQuoteCreate
 * @param {PriceQuery} priceQuery
 * @returns {ERef<PriceQuote> | undefined}
 */

/**
 * @callback PriceQuoteTrigger
 * @param {PriceQuoteCreate} createQuote
 */

/**
 * @typedef {Object} PriceAuthorityAdmin
 * @property {(createQuote: PriceQuoteCreate) => Promise<void>} fireTriggers
 */

/**
 * @typedef {Object} PriceAuthorityKit
 * @property {PriceAuthority} priceAuthority
 * @property {PriceAuthorityAdmin} adminFacet
 */

/**
 * @typedef {Object} MutableQuote
 * @property {(reason?: any) => void} cancel
 * @property {(amountIn: Amount, amountOut: Amount) => void} updateLevel
 * @property {() => ERef<PriceQuote>} getPromise
 */

/**
 * @typedef {Object} PriceAuthority An object that mints PriceQuotes and handles
 *   triggers and notifiers for changes in the price
 * @property {(brandIn: Brand, brandOut: Brand) => ERef<Issuer>} getQuoteIssuer
 *   Get the ERTP issuer of PriceQuotes for a given brandIn/brandOut pair
 * @property {(brandIn: Brand, brandOut: Brand) => ERef<TimerService>} getTimerService
 *   Get the timer used in PriceQuotes for a given brandIn/brandOut pair
 * @property {(
 *   amountIn: Amount,
 *   brandOut: Brand,
 * ) => ERef<Notifier<PriceQuote>>} makeQuoteNotifier
 *   Be notified of the latest PriceQuotes for a given `amountIn`. The rate at
 *   which these are issued may be very different between `priceAuthorities`.
 * @property {(
 *   deadline: Timestamp,
 *   amountIn: Amount,
 *   brandOut: Brand,
 * ) => Promise<PriceQuote>} quoteAtTime
 *   Resolves after `deadline` passes on the priceAuthority's timerService with
 *   the price quote of `amountIn` at that time
 * @property {(amountIn: Amount, brandOut: Brand) => Promise<PriceQuote>} quoteGiven
 *   Get a quote corresponding to the specified amountIn
 * @property {(brandIn: Brand, amountOut: Amount) => Promise<PriceQuote>} quoteWanted
 *   Get a quote corresponding to the specified amountOut
 * @property {(
 *   amountIn: Amount,
 *   amountOutLimit: Amount,
 * ) => Promise<PriceQuote>} quoteWhenGT
 *   Resolve when a price quote of `amountIn` exceeds `amountOutLimit`
 * @property {(
 *   amountIn: Amount,
 *   amountOutLimit: Amount,
 * ) => Promise<PriceQuote>} quoteWhenGTE
 *   Resolve when a price quote of `amountIn` reaches or exceeds `amountOutLimit`
 * @property {(
 *   amountIn: Amount,
 *   amountOutLimit: Amount,
 * ) => Promise<PriceQuote>} quoteWhenLTE
 *   Resolve when a price quote of `amountIn` reaches or drops below `amountOutLimit`
 * @property {(
 *   amountIn: Amount,
 *   amountOutLimit: Amount,
 * ) => Promise<PriceQuote>} quoteWhenLT
 *   Resolve when the price quote of `amountIn` drops below `amountOutLimit`
 * @property {(amountIn: Amount, amountOutLimit: Amount) => ERef<MutableQuote>} mutableQuoteWhenGT
 *   Resolve when a price quote of `amountIn` exceeds `amountOutLimit`
 * @property {(amountIn: Amount, amountOutLimit: Amount) => ERef<MutableQuote>} mutableQuoteWhenGTE
 *   Resolve when a price quote of `amountIn` reaches or exceeds `amountOutLimit`
 * @property {(amountIn: Amount, amountOutLimit: Amount) => ERef<MutableQuote>} mutableQuoteWhenLTE
 *   Resolve when a price quote of `amountIn` reaches or drops below `amountOutLimit`
 * @property {(amountIn: Amount, amountOutLimit: Amount) => ERef<MutableQuote>} mutableQuoteWhenLT
 *   Resolve when the price quote of `amountIn` drops below `amountOutLimit`
 */

/** @typedef {(amount: Amount) => Amount} PriceCalculator */

/**
 * @callback PriceQuery
 * @param {PriceCalculator} calcAmountIn
 * @param {PriceCalculator} calcAmountOut
 * @returns {{ amountIn: Amount; amountOut: Amount; timestamp?: Timestamp }}
 */
