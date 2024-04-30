// @jessie-check

/**
 * @import {BrandKeywordRecord, IssuerKeywordRecord} from './types.js';
 */

/**
 * @typedef {object} SeatData
 * @property {ProposalRecord} proposal
 * @property {Allocation} initialAllocation
 * @property {SeatHandle} seatHandle
 * @property {object} [offerArgs]
 */

/**
 * Given an allocation, withdraw payments to create a payout
 *
 * @callback WithdrawPayments
 * @param {Allocation} allocation
 * @returns {PaymentPKeywordRecord}
 */

/**
 * @typedef WithdrawFacet
 * @property {(allocation:Allocation) => PaymentPKeywordRecord} withdrawPayments
 */

/**
 * @typedef {object} InstanceAdminHelper
 * @property {(zoeSeatAdmin: ZoeSeatAdmin) => void} exitZoeSeatAdmin
 * @property {(zoeSeatAdmin: ZoeSeatAdmin) => boolean} hasExited
 */

/**
 * @typedef {object} ZoeSeatAdminKit
 * @property {UserSeat} userSeat
 * @property {ZoeSeatAdmin} zoeSeatAdmin
 */

/**
 * @callback MakeZoeSeatAdminKit
 * Make the Zoe seat admin, user seat and a notifier
 * @param {Allocation} initialAllocation
 * @param {InstanceAdminHelper} instanceAdminHelper
 * @param {ProposalRecord} proposal
 * @param {WithdrawFacet} withdrawFacet
 * @param {ERef<ExitObj>} exitObj
 * @param {ERef<unknown>} [offerResult]
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @returns {ZoeSeatAdminKit}
 */

/**
 * @callback ZoeSeatAdminExit
 * @param {Completion} [completion]
 * @returns {void}
 */

/**
 * @typedef {object} ZoeSeatAdmin
 * @property {(allocation: Allocation) => void} replaceAllocation
 * @property {ZoeSeatAdminExit} exit
 * @property {import('@agoric/swingset-vat').ShutdownWithFailure} fail called with the reason
 * for calling fail on this seat, where reason is normally an instanceof Error.
 * @property {() => Subscriber<AmountKeywordRecord>} getExitSubscriber
 */

/**
 * @callback {(brand: Brand) => AssetKind} GetAssetKind
 */

/**
 * @typedef {object} HandleOfferResult
 * @property {Promise<unknown>} offerResultPromise
 * @property {ExitObj} exitObj
 */

/**
 * The seatHandle may be created in either the Zoe or ZCF vat,
 * depending on whether the seat comes from a normal offer or a
 * request by the contract for an "empty" seat.
 *
 * @typedef {object} InstanceAdmin
 * @property {() => void} assertAcceptingOffers
 * @property {(invitationHandle: InvitationHandle,
 *     initialAllocation: Allocation,
 *     proposal: ProposalRecord,
 *     offerArgs?: object,
 * ) => UserSeat } makeUserSeat
 * @property {MakeNoEscrowSeat} makeNoEscrowSeat
 * @property {() => Instance} getInstance
 * @property {() => object} getPublicFacet
 * @property {() => IssuerKeywordRecord} getIssuers
 * @property {() => BrandKeywordRecord} getBrands
 * @property {() => object} getTerms
 * @property {() => string[]} getOfferFilter
 * @property {() => Installation} getInstallation
 * @property {(completion: Completion) => void} exitAllSeats
 * @property {import('@agoric/swingset-vat').ShutdownWithFailure} failAllSeats
 * @property {() => void} stopAcceptingOffers
 * @property {(string: string) => boolean} isBlocked
 * @property {(handleOfferObj: HandleOfferObj, publicFacet: unknown) => void} initDelayedState
 * @property {(strings: string[]) => void} setOfferFilter
 */

/**
 * The seatHandle may be created in either the Zoe or ZCF vat,
 * depending on whether the seat comes from a normal offer or a
 * request by the contract for an "empty" seat.
 *
 * @typedef {object} HandleOfferObj
 * @property {(invitationHandle: InvitationHandle,
 *             seatData: SeatData,
 *            ) => HandleOfferResult} handleOffer
 */

/**
 * @callback ZoeInstanceAdminMakeInvitation
 * @param {InvitationHandle} invitationHandle
 * @param {string} description
 * @param {Record<string, any>} [customDetails]
 * @param {Pattern} [proposalShape]
 * @returns {Invitation}
 */

/**
 * @typedef {object} ZoeInstanceAdmin
 * @property {ZoeInstanceAdminMakeInvitation} makeInvitation
 * @property {(issuerP: ERef<Issuer>,
 *             keyword: Keyword
 *            ) => Promise<IssuerRecord>} saveIssuer
 * @property {MakeZoeMint} makeZoeMint
 * @property {RegisterFeeMint} registerFeeMint
 * @property {MakeNoEscrowSeat} makeNoEscrowSeat
 * @property {ReplaceAllocations} replaceAllocations
 * @property {(completion: Completion) => void} exitAllSeats
 * @property {import('@agoric/swingset-vat').ShutdownWithFailure} failAllSeats
 * @property {(seatHandle: SeatHandle, completion: Completion) => void} exitSeat
 * @property {(seatHandle: SeatHandle, reason: Error) => void} failSeat
 * @property {() => void} stopAcceptingOffers
 * @property {(strings: Array<string>) => void} setOfferFilter
 * @property {() => Array<string>} getOfferFilter
 * @property {(seatHandle: SeatHandle) => Subscriber<AmountKeywordRecord>} getExitSubscriber
 * @property {() => void} repairContractCompletionWatcher
 */

/**
 * @callback RegisterFeeMint
 * @param {Keyword} keyword - the keyword to use for the issuer
 * @param {FeeMintAccess} allegedFeeMintAccess - an object that
 * purports to be the object that allows access to the feeMint
 * @returns {ZoeMint<'nat'>}
 */

/**
 * @callback WrapIssuerKitWithZoeMint
 * @param {Keyword} keyword - the keyword to use for the issuer
 * @param {IssuerKit} localIssuerKit - an issuer kit that originates
 * within Zoe
 */

/**
 * @callback MakeZoeMint
 * @param {Keyword} keyword
 * @param {AssetKind} [assetKind]
 * @param {AdditionalDisplayInfo} [displayInfo]
 * @param {IssuerOptionsRecord} [options]
 * @returns {ZoeMint}
 */

/**
 * @callback MakeNoEscrowSeat
 * @param {Allocation} initialAllocation
 * @param {ProposalRecord} proposal
 * @param {ExitObj} exitObj
 * @param {SeatHandle} seatHandle
 * @returns {UserSeat}
 */

/**
 * @callback ReplaceAllocations
 * @param {SeatHandleAllocation[]} seatHandleAllocations
 */

/**
 * @typedef {object} SeatHandleAllocation
 * @property {SeatHandle} seatHandle
 * @property {Allocation} allocation
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {object} ZoeMint
 * @property {() => IssuerRecord<K>} getIssuerRecord
 * @property {(totalToMint: Amount<K>) => void} mintAndEscrow
 * @property {(totalToBurn: Amount<K>) => void} withdrawAndBurn
 * Note that the burning is asynchronous, and so may not have happened by
 * the time withdrawAndBurn returns. We rely on our other bookkeeping so that
 * these assets are assumed burned elsewhere, so no one will try to access
 * them even before they are actually burned.
 */

/**
 * @typedef {object} ZCFRoot
 * @property {StartZcf} startZcf
 * @property {RestartContract} restartContract
 */

/**
 * @typedef {object} ExecuteContractResult
 * @property {object} creatorFacet
 * @property {Promise<Invitation>} [creatorInvitation]
 * @property {object} publicFacet
 * @property {HandleOfferObj} handleOfferObj
 */

/**
 * @callback StartZcf
 * @param {ERef<ZoeInstanceAdmin>} zoeInstanceAdmin
 * @param {InstanceRecord} instanceRecordFromZoe
 * @param {IssuerRecords} issuerStorageFromZoe
 * @param {object} [privateArgs]
 * @returns {Promise<ExecuteContractResult>}
 */

/**
 * @callback RestartContract
 * @param {object} [privateArgs]
 * @returns {Promise<ExecuteUpgradeableContractResult>}
 */

/**
 * @callback MakeExitObj
 * @param {ProposalRecord} proposal
 * @param {ZCFSeat} zoeSeatAdmin
 * @returns {ExitObj}
 */

/**
 * @typedef {object} ExitObj
 * @property {() => void} exit
 */

/**
 * @typedef {Handle<'Seat'>} SeatHandle
 */

/**
 * @callback GetAssetKindByBrand
 * Get the assetKind for a brand known by Zoe
 *
 * To be deleted when brands have a property for assetKind
 *
 * @param {Brand} brand
 * @returns {AssetKind}
 */

/**
 * @typedef {Array<IssuerRecord>} IssuerRecords
 */

/**
 * @callback MakeZCFSeat
 * @param {SeatData} seatData
 * @returns {ZCFSeat}
 */

/**
 * @callback DropAllReferences
 *
 * Drops all of the references in the seat-related weakStores by
 * dropping the stores
 * @returns {void}
 */

/**
 * @typedef {object} ZcfSeatManager
 * @property {MakeZCFSeat} makeZCFSeat
 * @property {Reallocate} reallocate
 * @property {DropAllReferences} dropAllReferences
 */

/**
 * @typedef {object} ZcfMintReallocator
 * @property {(zcfSeat: ZCFSeat, newAllocation: Allocation) => void} reallocate
 */

/**
 * @callback CreateSeatManager
 *
 * The SeatManager holds the active zcfSeats and can reallocate and
 * make new zcfSeats.
 *
 * @param {ERef<ZoeInstanceAdmin>} zoeInstanceAdmin
 * @param {GetAssetKindByBrand} getAssetKindByBrand
 * @param {import('@agoric/swingset-vat').ShutdownWithFailure} shutdownWithFailure
 * @param {import('@agoric/vat-data').Baggage} zcfBaggage
 * @returns {{ seatManager: ZcfSeatManager, zcfMintReallocator: ZcfMintReallocator }}
 */

/**
 * @callback InstanceStateAddIssuer
 *
 * Add an issuer and its keyword to the instanceRecord for the
 * contract instance
 *
 * @param {Keyword} keyword
 * @param {IssuerRecord} issuerRecord
 * @returns {void}
 */

/**
 * @callback InstanceStateGetTerms
 * @returns {AnyTerms}
 */

/**
 * @callback InstanceStateGetInstallation
 * @returns {Installation}
 */

/**
 * @callback InstanceRecordGetIssuers
 * @returns {IssuerKeywordRecord}
 */

/**
 * @callback InstanceRecordGetBrands
 * @returns {BrandKeywordRecord}
 */

/**
 * @typedef {object} InstanceState
 * @property {InstanceStateAddIssuer} addIssuer
 * @property {GetInstanceRecord} getInstanceRecord
 * @property {InstanceStateGetTerms} getTerms
 * @property {InstanceStateGetInstallation} getInstallation
 * @property {InstanceRecordGetIssuers} getIssuers
 * @property {InstanceRecordGetBrands} getBrands
 * @property {(keyword: Keyword) => void} assertUniqueKeyword
 */

/**
 * @callback GetInstanceRecord
 * @returns {InstanceRecord}
 */

/**
 * @callback IssuerStorageGetIssuerRecords
 * @param {Issuer[]} issuers
 * @returns {IssuerRecords}
 */
