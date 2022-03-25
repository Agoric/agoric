/**
 * @typedef {Object} OracleAdmin
 * @property {() => Promise<void>} delete Remove the oracle from the aggregator
 * @property {(result: any) => Promise<void>} pushResult Rather than waiting for
 *   the polling query, push a result directly from this oracle
 */

/**
 * @callback PriceAggregatorCreatorFacetInitOracle
 * @param {Instance} oracleInstance
 * @param {unknown} [query]
 * @returns {Promise<OracleAdmin>}
 */

/**
 * @typedef {Object} PriceAggregatorCreatorFacet
 * @property {(quoteMint: Mint) => Promise<void>} initializeQuoteMint
 * @property {PriceAggregatorCreatorFacetInitOracle} initOracle
 */

/**
 * @typedef {Object} PriceAggregatorPublicFacet
 * @property {() => PriceAuthority} getPriceAuthority
 */

/**
 * @typedef {Object} PriceAggregatorKit
 * @property {PriceAggregatorPublicFacet} publicFacet
 * @property {PriceAggregatorCreatorFacet} creatorFacet
 */

/**
 * @typedef {Object} OraclePublicFacet The public methods accessible from the
 *   contract instance
 * @property {(query: any) => ERef<Invitation>} makeQueryInvitation Create an
 *   invitation for an oracle query
 * @property {(query: any) => ERef<any>} query Make an unpaid query
 */

/**
 * @callback OracleCreatorFacetMakeWithdrawInvitation
 * @param {boolean} [total]
 * @returns {ERef<Invitation>}
 */

/**
 * @typedef {Object} OracleCreatorFacet The private methods accessible from the
 *   contract instance
 * @property {() => AmountKeywordRecord} getCurrentFees Get the current fee amounts
 * @property {OracleCreatorFacetMakeWithdrawInvitation} makeWithdrawInvitation
 *   Create an invitation to withdraw fees
 * @property {() => Promise<Invitation>} makeShutdownInvitation Make an
 *   invitation to withdraw all fees and shutdown
 */

/**
 * @typedef {Object} OraclePrivateParameters
 * @property {OracleHandler} oracleHandler
 */

/**
 * @typedef {Object} OracleInitializationFacet
 * @property {(privateParams: OraclePrivateParameters) => OracleCreatorFacet} initialize
 */

/**
 * @typedef {Object} OracleStartFnResult
 * @property {OracleInitializationFacet} creatorFacet
 * @property {OraclePublicFacet} publicFacet
 * @property {Instance} instance
 */

/**
 * @typedef {Object} OracleKit
 * @property {OracleCreatorFacet} creatorFacet
 * @property {OraclePublicFacet} publicFacet
 * @property {Instance} instance
 */

/**
 * @typedef {Object} OracleReply
 * @property {any} reply
 * @property {Amount} [requiredFee]
 */

/**
 * @typedef {Object} OracleHandler
 * @property {(query: any, fee: Amount) => Promise<OracleReply>} onQuery
 *   Callback to reply to a query
 * @property {(query: any, reason: any) => void} onError Notice an error
 * @property {(
 *   query: any,
 *   reply: any,
 *   requiredFee: Amount | undefined,
 * ) => void} onReply
 *   Notice a successful reply
 */
