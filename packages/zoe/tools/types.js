// @jessie-check

export {};

/**
 * @typedef {object} PriceQuote
 * @property {Amount<'set'>} quoteAmount
 * Amount whose value is a PriceQuoteValue
 * @property {ERef<Payment<'set'>>} quotePayment
 * The `quoteAmount` wrapped as a payment
 */

/**
 * @typedef {[PriceDescription]} PriceQuoteValue
 * A single-valued set of PriceDescriptions.  This is the `value` in
 * PriceQuote.quoteAmount (`{ brand, value: PriceQuoteValue }`).
 */

/**
 * @typedef {object} PriceDescription
 * A description of a single quote
 * @property {Amount<'nat'>} amountIn
 * The amount supplied to a trade
 * @property {Amount<'nat'>} amountOut
 * The quoted result of trading `amountIn`
 * @property {import('@agoric/time').TimerService} timer
 * The service that gave the `timestamp`
 * @property {import('@agoric/time').TimestampRecord} timestamp
 * A timestamp according to `timer` for the quote
 * @property {any} [conditions]
 * Additional conditions for the quote
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
 * @typedef {object} PriceAuthorityAdmin
 * @property {(createQuote: PriceQuoteCreate) => Promise<void>} fireTriggers
 */

/**
 * @typedef {object} PriceAuthorityKit
 * @property {PriceAuthority} priceAuthority
 * @property {PriceAuthorityAdmin} adminFacet
 */

/**
 * @typedef {object} MutableQuote
 * @property {(reason?: any) => void} cancel
 * @property {(amountIn: Amount<'nat'>, amountOut: Amount<'nat'>) => void} updateLevel
 * @property {() => ERef<PriceQuote>} getPromise
 */

/**
 * @typedef {object} PriceAuthority
 * An object that mints PriceQuotes and handles
 * triggers and notifiers for changes in the price
 *
 * @property {(brandIn: Brand, brandOut: Brand) => ERef<Issuer<'set'>>} getQuoteIssuer
 * Get the ERTP issuer of PriceQuotes for a given brandIn/brandOut pair
 *
 * @property {(brandIn: Brand,
 *             brandOut: Brand
 * ) => ERef<import('@agoric/time').TimerService>} getTimerService
 * Get the timer used in PriceQuotes for a given brandIn/brandOut pair
 *
 * @property {(amountIn: Amount<'nat'>,
 *             brandOut: Brand<'nat'>
 *            ) => ERef<Notifier<PriceQuote>>} makeQuoteNotifier
 * Be notified of the latest PriceQuotes for a given
 * `amountIn`.  The rate at which these are issued may be very different between
 * `priceAuthorities`.
 *
 * @property {(deadline: import('@agoric/time').Timestamp,
 *             amountIn: Amount<'nat'>,
 *             brandOut: Brand<'nat'>
 * ) => Promise<PriceQuote>} quoteAtTime
 * Resolves after `deadline` passes on the
 * priceAuthority's timerService with the price quote of `amountIn` at that time
 *
 * @property {(amountIn: Amount<'nat'>,
 *             brandOut: Brand<'nat'>
 * ) => Promise<PriceQuote>} quoteGiven
 * Get a quote corresponding to the specified amountIn
 *
 * @property {(brandIn: Brand<'nat'>,
 *             amountOut: Amount<'nat'>) => Promise<PriceQuote>} quoteWanted
 * Get a quote corresponding to the specified amountOut
 *
 * @property {(amountIn: Amount<'nat'>,
 *             amountOutLimit: Amount<'nat'>
 * ) => Promise<PriceQuote>} quoteWhenGT
 * Resolve when a price quote of `amountIn` exceeds `amountOutLimit`
 *
 * @property {(amountIn: Amount<'nat'>,
 *             amountOutLimit: Amount<'nat'>
 * ) => Promise<PriceQuote>} quoteWhenGTE
 * Resolve when a price quote of `amountIn` reaches or exceeds `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => Promise<PriceQuote>} quoteWhenLTE
 * Resolve when a price quote of `amountIn` reaches or drops below
 * `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => Promise<PriceQuote>} quoteWhenLT
 * Resolve when the price quote of `amountIn` drops below `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => ERef<MutableQuote>} mutableQuoteWhenGT
 * Resolve when a price quote of `amountIn` exceeds `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => ERef<MutableQuote>} mutableQuoteWhenGTE
 * Resolve when a price quote of `amountIn` reaches or exceeds
 * `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => ERef<MutableQuote>} mutableQuoteWhenLTE
 * Resolve when a price quote of `amountIn` reaches or drops below
 * `amountOutLimit`
 *
 * @property {(amountIn: Amount,
 *             amountOutLimit: Amount
 * ) => ERef<MutableQuote>} mutableQuoteWhenLT
 * Resolve when the price quote of `amountIn` drops below `amountOutLimit`
 */

/**
 * @typedef {(amount: Amount<'nat'>) => Amount<'nat'>} PriceCalculator
 */

/**
 * @callback PriceQuery
 * @param {PriceCalculator} calcAmountIn
 * @param {PriceCalculator} calcAmountOut
 * @returns {{ amountIn: Amount<'nat'>, amountOut: Amount<'nat'>, timestamp?: import('@agoric/time').TimestampRecord } | undefined}
 */

/**
 * @typedef {object} PriceLevel
 * A description of a single quote
 *
 * @property {Amount<'nat'>} amountIn
 * The amount supplied to a trade
 * @property {Amount<'nat'>} amountOut
 * The quoted result of trading `amountIn`
 */
