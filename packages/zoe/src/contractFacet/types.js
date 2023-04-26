/// <reference types="ses"/>

/** @typedef {import('@agoric/ertp').IssuerOptionsRecord} IssuerOptionsRecord */

// XXX can be tighter than 'any'
/**
 * @typedef {any} Completion
 * Any passable non-thenable. Often an explanatory string.
 */

/**
 * @callback ZCFMakeEmptySeatKit
 * @param {ExitRule} [exit]
 * @returns {ZcfSeatKit}
 */

/**
 * @template {object} [CT=Record<string, unknown>] Contract's custom terms
 * @typedef {object} ZCF Zoe Contract Facet
 *
 * The Zoe interface specific to a contract instance. The Zoe Contract
 * Facet is an API object used by running contract instances to access
 * the Zoe state for that instance. The Zoe Contract Facet is accessed
 * synchronously from within the contract, and usually is referred to
 * in code as zcf.
 *
 * @property {Reallocate} reallocate - reallocate amounts among seats.
 * Deprecated: Use atomicRearrange instead.
 * @property {(keyword: Keyword) => void} assertUniqueKeyword - check
 * whether a keyword is valid and unique and could be added in
 * `saveIssuer`
 * @property {SaveIssuer} saveIssuer - save an issuer to ZCF and Zoe
 * and get the AmountMath and brand synchronously accessible after
 * saving
 * @property {MakeInvitation} makeInvitation
 * @property {(completion: Completion) => void} shutdown
 * @property {ShutdownWithFailure} shutdownWithFailure
 * @property {() => ERef<ZoeService>} getZoeService
 * @property {() => Issuer<'copyBag'>} getInvitationIssuer
 * @property {() => StandardTerms & CT} getTerms
 * @property {<K extends AssetKind>(issuer: Issuer<K>) => Brand<K>} getBrandForIssuer
 * @property {<K extends AssetKind>(brand: Brand<K>) => Issuer<K>} getIssuerForBrand
 * @property {GetAssetKindByBrand} getAssetKind
 * @property {<K extends AssetKind = 'nat'>(
 *   keyword: Keyword,
 *   assetKind?: K,
 *   displayInfo?: AdditionalDisplayInfo,
 *   options?: IssuerOptionsRecord
 * ) => Promise<ZCFMint<K>>} makeZCFMint
 * @property {ZCFRegisterFeeMint} registerFeeMint
 * @property {ZCFMakeEmptySeatKit} makeEmptySeatKit
 * @property {SetTestJig} setTestJig
 * @property {() => Promise<void>} stopAcceptingOffers
 * @property {(strings: Array<string>) => Promise<void>} setOfferFilter
 * @property {() => Promise<Array<string>>} getOfferFilter
 * @property {() => Instance} getInstance
 */

/**
 * @typedef {(seat1: ZCFSeat, seat2: ZCFSeat, ...seatRest:
 * Array<ZCFSeat>) => void} Reallocate
 *
 * The contract can reallocate over seats, which commits the staged
 * allocation for each seat. On commit, the staged allocation becomes
 * the current allocation and the staged allocation is deleted.
 *
 * The reallocation will only succeed if the reallocation 1) conserves
 * rights (the amounts specified have the same total value as the
 * current total amount), and 2) is 'offer-safe' for all parties
 * involved. All seats that have staged allocations must be included
 * as arguments to `reallocate`, or an error is thrown. Additionally,
 * an error is thrown if any seats included in `reallocate` do not
 * have a staged allocation.
 *
 * The reallocation is partial, meaning that it applies only to the
 * seats passed in as arguments. By induction, if rights conservation
 * and offer safety hold before, they will hold after a safe
 * reallocation, even though we only re-validate for the seats whose
 * allocations will change. Since rights are conserved for the change,
 * overall rights will be unchanged, and a reallocation can only
 * effect offer safety for seats whose allocations change.
 */

/**
 * @callback SaveIssuer
 *
 * Informs Zoe about an issuer and returns a promise for acknowledging
 * when the issuer is added and ready.
 *
 * @param {ERef<Issuer>} issuerP Promise for issuer
 * @param {Keyword} keyword Keyword for added issuer
 * @returns {Promise<IssuerRecord<*>>} Issuer is added and ready
 */

/**
 * @typedef {<Result>(
 *   offerHandler: OfferHandler<Result>,
 *   description: string,
 *   customDetails?: object,
 *   proposalShape?: Pattern,
 * ) => Promise<Invitation<Awaited<Result>>>
 * } MakeInvitation
 *
 * Make a credible Zoe invitation for a particular smart contract
 * indicated by the `instance` in the details of the invitation. Zoe
 * also puts the `installation` and a unique `handle` in the details
 * of the invitation. The contract must provide a `description` for
 * the invitation and should include whatever information is necessary
 * for a potential buyer of the invitation to know what they are
 * getting in the `customDetails`. `customDetails` will be
 * placed in the details of the invitation.
 */

/**
 * @callback ZCFRegisterFeeMint
 * @param {Keyword} keyword
 * @param {FeeMintAccess} allegedFeeMintAccess - an object that
 * purports to be the object that grants access to the fee mint
 * @returns {Promise<ZCFMint<'nat'>>}
 */

/**
 * Provide a jig object for testing purposes only.
 *
 * The contract code provides a callback whose return result will
 * be made available to the test that started this contract. The
 * supplied callback will only be called in a testing context,
 * never in production; i.e., it is only called if `testJigSetter`
 * was supplied.
 *
 * If no, `testFn` is supplied, then an empty jig will be used.
 * An additional `zcf` property set to the current ContractFacet
 * will be appended to the returned jig object (overriding any
 * provided by the `testFn`).
 *
 * @callback SetTestJig
 * @param {() => Record<string, unknown>} testFn
 * @returns {void}
 */

/**
 * @callback ZCFMintMintGains
 * @param {AmountKeywordRecord} gains
 * @param {ZCFSeat} [zcfSeat]
 * @returns {ZCFSeat}
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {object} ZCFMint
 * @property {() => IssuerRecord<K>} getIssuerRecord
 * @property {ZCFMintMintGains} mintGains
 * All the amounts in gains must be of this ZCFMint's brand.
 * The gains' keywords are in the namespace of that seat.
 * Add the gains to that seat's allocation.
 * The resulting state must be offer safe. (Currently, increasing assets can
 * never violate offer safety anyway.)
 *
 * Mint that amount of assets into the pooled purse.
 * If a seat is provided, it is returned. Otherwise a new seat is
 * returned.
 * TODO unimplemented
 * This creation-on-demand is not yet implemented.
 *
 * @property {(losses: AmountKeywordRecord,
 *             zcfSeat: ZCFSeat,
 *            ) => void} burnLosses
 * All the amounts in losses must be of this ZCFMint's brand.
 * The losses' keywords are in the namespace of that seat.
 * Subtract losses from that seat's allocation.
 * The resulting state must be offer safe.
 *
 * Burn that amount of assets from the pooled purse.
 */

/**
 * @callback ZCFSeatFail
 *
 * fail called with the reason for this failure, where reason is
 * normally an instanceof Error.
 * @param {unknown} reason
 * @returns {Error}
 */

/**
 * @callback ZCFGetAmountAllocated
 * The brand is used for filling in an empty amount if the `keyword`
 * is not present in the allocation
 * @param {Keyword} keyword
 * @param {Brand} [brand]
 * @returns {Amount<any>}
 */

/**
 * @typedef {object} ZCFSeat
 * @property {(completion?: Completion) => void} exit
 * @property {ZCFSeatFail} fail
 * @property {() => Promise<Subscriber<Allocation>>} getSubscriber
 * @property {() => boolean} hasExited
 * @property {() => ProposalRecord} getProposal
 * @property {ZCFGetAmountAllocated} getAmountAllocated
 * @property {() => Allocation} getCurrentAllocation
 * @property {() => Allocation} getStagedAllocation
 * Deprecated: Use atomicRearrange instead
 * @property {() => boolean} hasStagedAllocation
 * Deprecated: Use atomicRearrange instead
 * @property {(newAllocation: Allocation) => boolean} isOfferSafe
 * @property {(amountKeywordRecord: AmountKeywordRecord) => AmountKeywordRecord} incrementBy
 * Deprecated: Use atomicRearrange instead
 * @property {(amountKeywordRecord: AmountKeywordRecord) => AmountKeywordRecord} decrementBy
 * Deprecated: Use atomicRearrange instead
 * @property {() => void} clear
 * Deprecated: Use atomicRearrange instead
 */

/**
 * @typedef {{ zcfSeat: ZCFSeat, userSeat: ERef<UserSeat>}} ZcfSeatKit
 */

/**
 * @template {object} OR Offer results
 * @typedef {(seat: ZCFSeat, offerArgs?: object) => OR} HandleOffer
 */

/**
 * @template {object} [OR=unknown] Offer results
 * @typedef {HandleOffer<OR> | { handle: HandleOffer<OR> }} OfferHandler
 */

/**
 * API for a contract start function.
 *
 * CAVEAT: assumes synchronous
 *
 * @deprecated define function signature directly
 *
 * @template {object} [PF=any] Public facet
 * @template {object} [CF=any] Creator facet
 * @template {object} [CT=any] Custom terms
 * @template {object} [PA=any] Private args
 * @callback ContractStartFn
 * @param {ZCF<CT>} zcf
 * @param {PA} privateArgs
 * @returns {ContractStartFnResult<PF, CF>}
 */

/**
 * @template PF Public facet
 * @template CF Creator facet
 * @typedef {object} ContractStartFnResult
 * @property {PF} publicFacet
 * @property {CF} creatorFacet
 * @property {Promise<Invitation>} [creatorInvitation]
 */

/**
 * @template S
 * @typedef {import('../zoeService/utils').ContractOf<S>} ContractOf
 */

/**
 * @typedef {import('../zoeService/utils').AdminFacet} AdminFacet
 */
