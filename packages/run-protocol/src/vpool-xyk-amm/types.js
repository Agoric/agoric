// @ts-check

/**
 * @typedef {object} VPoolPriceQuote
 * @property {Amount<'nat'>} amountIn
 * @property {Amount<'nat'>} amountOut
 */

/**
 * @typedef {object} SinglePoolSwapResult
 *
 * @property {Amount<'nat'>} xIncrement
 * @property {Amount<'nat'>} swapperGives
 * @property {Amount<'nat'>} yDecrement
 * @property {Amount<'nat'>} swapperGets
 * @property {Amount<'nat'>} protocolFee
 * @property {Amount<'nat'>} poolFee
 * @property {Amount<'nat'>} newY
 * @property {Amount<'nat'>} newX
 */

/**
 * @typedef {object} DoublePoolSwapResult
 * @property {Amount<'nat'>} swapperGives
 * @property {Amount<'nat'>} swapperGets
 * @property {Amount<'nat'>} inPoolIncrement
 * @property {Amount<'nat'>} inPoolDecrement
 * @property {Amount<'nat'>} outPoolIncrement
 * @property {Amount<'nat'>} outPoolDecrement
 * @property {Amount<'nat'>} protocolFee
 */

/**
 * @typedef {A extends 'single' ? SinglePoolSwapResult
 * : A extends 'double' ? DoublePoolSwapResult
 * : SinglePoolSwapResult | DoublePoolSwapResult} SwapResult
 * @template {'single' | 'double' | unknown} A arity
 */

/**
 * @typedef {object} VirtualPool - virtual pool for price quotes and trading
 * @property {(seat: ZCFSeat, prices: SwapResult<A>) => string} allocateGainsAndLosses
 * @property {(amountIn: Amount, amountOut: Amount) => SwapResult<A>} getPriceForInput
 * @property {(amountIn: Amount, amountOut: Amount) => SwapResult<A>} getPriceForOutput
 * @template {'single' | 'double' | unknown} [A=unknown] arity
 */

/**
 * @callback AddLiquidityActual
 * @param {XYKPool} pool
 * @param {ZCFSeat} zcfSeat
 * @param {Amount<'nat'>} secondaryAmount
 * @param {Amount<'nat'>} poolCentralAmount
 * @param {ZCFSeat} [feeSeat]
 * @returns {string}
 */

/**
 * @callback AddLiquidityInternal
 * @param {ZCFSeat} zcfSeat
 * @param {Amount<'nat'>} secondaryAmount
 * @param {Amount<'nat'>} poolCentralAmount
 * @param {ZCFSeat} [feeSeat]
 */

/**
 * @typedef {object} XYKPool
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
 * @property {() => VirtualPool} getVPool
 */

/**
 * @typedef {object} PoolFacets
 * @property {XYKPool} pool
 * @property {{addLiquidityActual: AddLiquidityActual, addLiquidityInternal: AddLiquidityInternal}} helper
 * @property {VirtualPool<'single'>} singlePool
 */

/**
 * @typedef {object} XYKAMMCreatorFacet
 * @property {() => Promise<Invitation>} makeCollectFeesInvitation
 */
/**
 * @typedef {object} XYKAMMPublicFacet
 * @property {() => Promise<Invitation>} addPoolInvitation
 * add a new liquidity pool
 * @property {(secondaryIssuer: ERef<Issuer>, keyword: Keyword) => Promise<Issuer>} addIssuer
 * @property {() => Promise<Invitation>} makeSwapInvitation synonym for
 * makeSwapInInvitation
 * @property {() => Promise<Invitation>} makeSwapInInvitation make an invitation
 * that allows one to do a swap in which the In amount is specified and the Out
 * amount is calculated
 * @property {() => Promise<Invitation>} makeSwapOutInvitation make an invitation
 * that allows one to do a swap in which the Out amount is specified and the In
 * amount is calculated
 * @property {() => Promise<Invitation>} makeAddLiquidityInvitation make an
 * invitation that allows one to add liquidity to the pool.
 * @property {() => Promise<Invitation>} makeAddLiquidityAtRateInvitation make
 * an invitation that allows one to add liquidity to the pool at an arbitrary
 * ratio of collateral to Central.
 * @property {() => Promise<Invitation>} makeRemoveLiquidityInvitation make an
 * invitation that allows one to remove liquidity from the pool.
 * @property {(brand: Brand) => Issuer} getLiquidityIssuer
 * @property {(brand: Brand) => bigint} getLiquiditySupply get the current value of
 * liquidity in the pool for brand held by investors.
 * @property {(amountIn: Amount, amountOut: Amount) => VPoolPriceQuote} getInputPrice
 * calculate the amount of brandOut that will be returned if the amountIn is
 * offered using makeSwapInInvitation at the current price.
 * @property {(amountOut: Amount, amountIn: Amount) => VPoolPriceQuote} getOutputPrice
 * calculate the amount of brandIn that is required in order to get amountOut
 * using makeSwapOutInvitation at the current price
 * @property {(brand: Brand) => Record<string, Amount>} getPoolAllocation get an
 * AmountKeywordRecord showing the current balances in the pool for brand.
 * @property {() => Issuer} getQuoteIssuer - get the Issuer that attests to
 * the prices in the priceQuotes issued by the PriceAuthorities
 * @property {(brand: Brand) => {toCentral: PriceAuthority, fromCentral: PriceAuthority}} getPriceAuthorities
 * get a pair of PriceAuthorities { toCentral, fromCentral } for requesting
 * Prices and notifications about changing prices.
 * @property {() => Brand[]} getAllPoolBrands
 * @property {() => Allocation} getProtocolPoolBalance
 */

/**
 * @callback MakeAmmParamManager
 * @param {ERef<ZoeService>} zoe
 * @param {bigint} poolFeeBP
 * @param {bigint} protocolFeeBP
 * @param {Invitation} poserInvitation - invitation for the question poser
 * @returns {Promise<ParamManagerFull>}
 */
