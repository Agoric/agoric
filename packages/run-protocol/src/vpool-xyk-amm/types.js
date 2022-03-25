// @ts-check

/**
 * @typedef {Object} VPoolPriceQuote
 * @property {Amount} amountIn
 * @property {Amount} amountOut
 */

/**
 * @typedef {Object} VPool - Virtual pool for price quotes and trading
 * @property {(amountIn: Amount, amountOut: Amount) => VPoolPriceQuote} getInputPrice
 * @property {(amountIn: Amount, amountOut: Amount) => VPoolPriceQuote} getOutputPrice
 * @property {(seat: ZCFSeat, amountIn: Amount, amountOut: Amount) => string} swapIn
 * @property {(seat: ZCFSeat, amountIn: Amount, amountOut: Amount) => string} swapOut
 */

/**
 * @typedef {Object} DoublePoolSwapResult
 * @property {Amount} swapperGives
 * @property {Amount} swapperGets
 * @property {Amount} inPoolIncrement
 * @property {Amount} inPoolDecrement
 * @property {Amount} outPoolIncrement
 * @property {Amount} outPoolDecrement
 * @property {Amount} protocolFee
 */

/**
 * @callback GetDoublePoolSwapQuote
 * @param {Amount} amountIn
 * @param {Amount} amountOut
 * @returns {DoublePoolSwapResult}
 */

/**
 * @callback GetSinglePoolSwapQuote
 * @param {Amount} amountIn
 * @param {Amount} amountOut
 * @returns {SwapResult}
 */

/**
 * @typedef {Object} VPoolInternalFacet - Virtual pool for price quotes and trading
 * @property {GetDoublePoolSwapQuote} getPriceForInput
 * @property {GetDoublePoolSwapQuote} getPriceForOutput
 */

/**
 * @callback AddLiquidityActual
 * @param {XYKPool} pool
 * @param {ZCFSeat} zcfSeat
 * @param {Amount} secondaryAmount
 * @param {Amount} poolCentralAmount
 * @param {ZCFSeat} feeSeat
 * @returns {string}
 */

/**
 * @typedef {Object} SinglePoolInternalFacet
 * @property {GetSinglePoolSwapQuote} getPriceForInput
 * @property {GetSinglePoolSwapQuote} getPriceForOutput
 * @property {AddLiquidityActual} addLiquidityActual
 */

/**
 * @template T
 * @typedef {Object} VPoolWrapper - Wrapper holding external and internal facets
 * @property {VPool} externalFacet
 * @property {T} internalFacet
 */

/**
 * @typedef {Object} XYKPool
 * @property {() => bigint} getLiquiditySupply
 * @property {() => Issuer} getLiquidityIssuer
 * @property {(seat: ZCFSeat) => string} addLiquidity
 * @property {(seat: ZCFSeat) => string} removeLiquidity
 * @property {() => ZCFSeat} getPoolSeat
 * @property {() => Amount} getSecondaryAmount
 * @property {() => Amount} getCentralAmount
 * @property {() => Notifier<Record<string, Amount>>} getNotifier
 * @property {() => void} updateState
 * @property {() => PriceAuthority} getToCentralPriceAuthority
 * @property {() => PriceAuthority} getFromCentralPriceAuthority
 * @property {() => VPoolWrapper<unknown>} getVPool
 */

/**
 * @typedef {Object} XYKAMMCreatorFacet
 * @property {() => Promise<Invitation>} makeCollectFeesInvitation
 */
/**
 * @typedef {Object} XYKAMMPublicFacet
 * @property {(issuer: Issuer, keyword: Keyword) => Promise<Issuer>} addPool
 *   Add a new liquidity pool
 * @property {() => Promise<Invitation>} makeSwapInvitation Synonym for
 *   makeSwapInInvitation
 * @property {() => Promise<Invitation>} makeSwapInInvitation Make an invitation
 *   that allows one to do a swap in which the In amount is specified and the
 *   Out amount is calculated
 * @property {() => Promise<Invitation>} makeSwapOutInvitation Make an
 *   invitation that allows one to do a swap in which the Out amount is
 *   specified and the In amount is calculated
 * @property {() => Promise<Invitation>} makeAddLiquidityInvitation Make an
 *   invitation that allows one to add liquidity to the pool.
 * @property {() => Promise<Invitation>} makeRemoveLiquidityInvitation Make an
 *   invitation that allows one to remove liquidity from the pool.
 * @property {(brand: Brand) => Issuer} getLiquidityIssuer
 * @property {(brand: Brand) => bigint} getLiquiditySupply Get the current value
 *   of liquidity in the pool for brand held by investors.
 * @property {(amountIn: Amount, amountOut: Amount) => VPoolPriceQuote} getInputPrice
 *   Calculate the amount of brandOut that will be returned if the amountIn is
 *   offered using makeSwapInInvitation at the current price.
 * @property {(amountOut: Amount, amountIn: Amount) => VPoolPriceQuote} getOutputPrice
 *   Calculate the amount of brandIn that is required in order to get amountOut
 *   using makeSwapOutInvitation at the current price
 * @property {(brand: Brand) => Record<string, Amount>} getPoolAllocation Get an
 *   AmountKeywordRecord showing the current balances in the pool for brand.
 * @property {() => Issuer} getQuoteIssuer - Get the Issuer that attests to the
 *   prices in the priceQuotes issued by the PriceAuthorities
 * @property {(brand: Brand) => {
 *   toCentral: PriceAuthority;
 *   fromCentral: PriceAuthority;
 * }} getPriceAuthorities
 *   Get a pair of PriceAuthorities { toCentral, fromCentral } for requesting
 *   Prices and notifications about changing prices.
 * @property {() => Brand[]} getAllPoolBrands
 * @property {() => Allocation} getProtocolPoolBalance
 */

/**
 * @callback MakeAmmParamManager
 * @param {ERef<ZoeService>} zoe
 * @param {bigint} poolFeeBP
 * @param {bigint} protocolFeeBP
 * @param {Invitation} poserInvitation - Invitation for the question poser
 * @returns {Promise<ParamManagerFull>}
 */
