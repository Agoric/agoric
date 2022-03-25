/**
 * @typedef {Object} SellItemsPublicFacet
 * @property {() => Issuer} getItemsIssuer
 * @property {() => Amount} getAvailableItems
 *
 * @typedef {Object} SellItemsCreatorOnly
 * @property {() => Promise<Invitation>} makeBuyerInvitation
 *
 * @typedef {SellItemsPublicFacet & SellItemsCreatorOnly} SellItemsCreatorFacet
 */

/**
 * @typedef {Object} SellItemsParameters
 * @property {Record<string, any>} customValueProperties
 * @property {number} count
 * @property {Issuer} moneyIssuer
 * @property {Installation} sellItemsInstallation
 * @property {Amount} pricePerItem
 *
 * @typedef {Object} SellItemsResult
 * @property {UserSeat} sellItemsCreatorSeat
 * @property {SellItemsCreatorFacet} sellItemsCreatorFacet
 * @property {Instance} sellItemsInstance
 * @property {SellItemsPublicFacet} sellItemsPublicFacet
 *
 * @typedef {Object} MintAndSellNFTCreatorFacet
 * @property {(sellParams: SellItemsParameters) => Promise<SellItemsResult>} sellTokens
 * @property {() => Issuer} getIssuer
 */

/**
 * @typedef {Object} AutomaticRefundPublicFacet
 * @property {() => bigint} getOffersCount
 * @property {() => Promise<Invitation>} makeInvitation
 */

/**
 * @typedef {Object} AutoswapPublicFacet
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
 * @property {() => Issuer} getLiquidityIssuer
 * @property {() => bigint} getLiquiditySupply Get the current value of
 *   liquidity held by investors.
 * @property {(amountIn: Amount, brandOut: Brand) => Amount} getInputPrice
 *   Calculate the amount of brandOut that will be returned if the amountIn is
 *   offered using makeSwapInInvitation at the current price.
 * @property {(amountOut: Amount, brandIn: Brand) => Amount} getOutputPrice
 *   Calculate the amount of brandIn that is required in order to get amountOut
 *   using makeSwapOutInvitation at the current price
 * @property {() => Record<string, Amount>} getPoolAllocation Get an
 *   AmountKeywordRecord showing the current balances in the pool.
 */
