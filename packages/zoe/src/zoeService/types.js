// @jessie-check

/// <reference types="ses"/>

// Ensure this is a module
export {};

/**
 * @import {ERef} from '@endo/far';
 * @import {BundleCap, BundleID} from '@agoric/swingset-vat';
 * @import {AssetKind, Amount, DisplayInfo, NatValue, Payment} from '@agoric/ertp/src/types.js';
 * @import {Subscriber} from '@agoric/notifier';
 * @import {Allocation, Handle, InvitationHandle, Keyword} from '../types.js';
 * @import {StartInstance, GetPublicFacet, Instance, Installation, InstallationStart} from './utils.js';
 * @import {Completion, Invitation} from '../contractFacet/types.js';
 */

/**
 * @typedef {object} ZoeService
 *
 * Zoe provides a framework for deploying and working with smart
 * contracts. It is accessed as a long-lived and well-trusted service
 * that enforces offer safety for the contracts that use it. Zoe has a
 * single `invitationIssuer` for the entirety of its lifetime. By
 * having a reference to Zoe, a user can get the `invitationIssuer`
 * and thus validate any `invitation` they receive from someone else.
 *
 * Zoe has two different facets: the public Zoe service and the
 * contract facet (ZCF). Each contract instance has a copy of ZCF
 * within its vat. The contract and ZCF never have direct access to
 * the users' payments or the Zoe purses.
 *
 * @property {GetInvitationIssuer} getInvitationIssuer
 *
 * Zoe has a single `invitationIssuer` for the entirety of its
 * lifetime. By having a reference to Zoe, a user can get the
 * `invitationIssuer` and thus validate any `invitation` they receive
 * from someone else. The mint associated with the invitationIssuer
 * creates the ERTP payments that represent the right to interact with
 * a smart contract in particular ways.
 *
 * @property {InstallBundle} install
 * @property {InstallBundleID} installBundleID
 * @property {StartInstance} startInstance
 * @property {Offer} offer
 * @property {GetPublicFacet} getPublicFacet
 * @property {GetIssuers} getIssuers
 * @property {GetBrands} getBrands
 * @property {import('./utils.js').GetTerms} getTerms
 * @property {GetOfferFilter} getOfferFilter
 * @property {GetInstallationForInstance} getInstallationForInstance
 * @property {GetInstance} getInstance
 * @property {GetInstallation} getInstallation
 * @property {GetInvitationDetails} getInvitationDetails
 * Return an object with the instance, installation, description, invitation
 * handle, and any custom properties specific to the contract.
 * @property {GetFeeIssuer} getFeeIssuer
 * @property {GetConfiguration} getConfiguration
 * @property {GetBundleIDFromInstallation} getBundleIDFromInstallation
 * @property {(invitationHandle: InvitationHandle) => Pattern | undefined} getProposalShapeForInvitation
 */

/**
 * @callback GetInvitationIssuer
 * @returns {Promise<Issuer<'set'>>}
 */

/**
 * @callback GetFeeIssuer
 * @returns {Promise<Issuer<'nat'>>}
 */

/**
 * @callback GetConfiguration
 * @returns {{
 *   feeIssuerConfig: FeeIssuerConfig,
 * }}
 */

/**
 * @callback GetIssuers
 * @param {Instance<any>} instance
 * @returns {Promise<IssuerKeywordRecord>}
 */

/**
 * @callback GetBrands
 * @param {Instance<any>} instance
 * @returns {Promise<BrandKeywordRecord>}
 */

/**
 * @callback GetOfferFilter
 * @param {Instance<any>} instance
 * @returns {string[]}
 */

/**
 * @callback SetOfferFilter
 * @param {Instance} instance
 * @param {string[]} strings
 */

/**
 * @callback GetInstallationForInstance
 * @param {Instance<any>} instance
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetInstance
 * @param {ERef<Invitation>} invitation
 * @returns {Promise<Instance<any>>}
 */

/**
 * @callback GetInstallation
 * @param {ERef<Invitation>} invitation
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetInvitationDetails
 * @param {ERef<Invitation<any, any>>} invitation
 * @returns {Promise<InvitationDetails>}
 */

// TODO remove support for source bundles, leaving only support for hash bundles.
// https://github.com/Agoric/agoric-sdk/issues/4565
/**
 * @callback InstallBundle
 *
 * Create an installation by safely evaluating the code and
 * registering it with Zoe. Returns an installation.
 *
 * @param {Bundle | SourceBundle} bundle
 * @param {string} [bundleLabel]
 * @returns {Promise<Installation<any>>}
 */

// TODO consolidate installBundleID into install.
// https://github.com/Agoric/agoric-sdk/issues/4974
/**
 * @callback InstallBundleID
 *
 * Create an installation from a Bundle ID. Returns an installation.
 *
 * @param {BundleID} bundleID
 * @param {string} [bundleLabel]
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetBundleIDFromInstallation
 *
 * Verify that an alleged Installation is real, and return the Bundle ID it
 * will use for contract code.
 *
 * @param {ERef<Installation>} allegedInstallation
 * @returns {Promise<BundleID>}
 */

/**
 * @typedef {<Result, Args = undefined>(
 *   invitation: ERef<Invitation<Result, Args>>,
 *   proposal?: Proposal,
 *   paymentKeywordRecord?: PaymentPKeywordRecord,
 *   offerArgs?: Args,
 *   ) => Promise<UserSeat<Result>>
 * } Offer
 *
 * To redeem an invitation, the user normally provides a proposal (their
 * rules for the offer) as well as payments to be escrowed by Zoe.  If
 * either the proposal or payments would be empty, indicate this by
 * omitting that argument or passing undefined, rather than passing an
 * empty record.
 *
 * The proposal has three parts: `want` and `give` are used by Zoe to
 * enforce offer safety, and `exit` is used to specify the particular
 * payout-liveness policy that Zoe can guarantee. `want` and `give`
 * are objects with keywords as keys and amounts as values.
 * `paymentKeywordRecord` is a record with keywords as keys, and the
 * values are the actual payments to be escrowed. A payment is
 * expected for every rule under `give`.
 */

/**
 * Zoe uses seats to access or manipulate offers. They let contracts and users
 * interact with them. Zoe has two kinds of seats. ZCFSeats are used within
 * contracts and with zcf methods. UserSeats represent offers external to Zoe
 * and the contract. The party who exercises an invitation and sends the offer()
 * message to Zoe gets a UserSeat that can check payouts' status or retrieve the
 * result of processing the offer in the contract. This varies, but examples are
 * a string and an invitation for another seat.
 *
 * Also, a UserSeat can be handed to an agent outside Zoe and the contract,
 * letting them query or monitor the current state, access the payouts and
 * result, and, if it's allowed for this seat, call tryExit().
 *
 * Since anyone can attempt to exit the seat if they have a reference to it, you
 * should only share a UserSeat with trusted parties.
 *
 * UserSeat includes queries for the associated offer's current state and an
 * operation to request that the offer exit, as follows:
 *
 * @see {@link https://docs.agoric.com/zoe/api/zoe.html#userseat-object}}
 * @template {object} [OR=unknown]
 * @typedef {object} UserSeat
 * @property {() => Promise<ProposalRecord>} getProposal
 * @property {() => Promise<PaymentPKeywordRecord>} getPayouts
 * returns a promise for a KeywordPaymentRecord containing all the payouts from
 * this seat. The promise will resolve after the seat has exited.
 * @property {(keyword: Keyword) => Promise<Payment<any>>} getPayout
 * returns a promise for the Payment corresponding to the indicated keyword.
 * The promise will resolve after the seat has exited.
 * @property {() => Promise<OR>} getOfferResult
 * @property {() => void} [tryExit]
 * Note: Only works if the seat's `proposal` has an `OnDemand` `exit` clause. Zoe's
 * offer-safety guarantee applies no matter how a seat's interaction with a
 * contract ends. Under normal circumstances, the participant might be able to
 * call `tryExit()`, or the contract might do something explicitly. On exiting,
 * the seat holder gets its current `allocation` and the `seat` can no longer
 * interact with the contract.
 * @property {() => Promise<boolean>} hasExited
 * Returns true if the seat has exited, false if it is still active.
 * @property {() => Promise<0|1>} numWantsSatisfied returns 1 if the proposal's
 * want clause was satisfied by the final allocation, otherwise 0. This is
 * numeric to support a planned enhancement called "multiples" which will allow
 * the return value to be any non-negative number. The promise will resolve
 * after the seat has exited.
 * @property {() => Promise<Allocation>} getFinalAllocation
 * return a promise for the final allocation. The promise will resolve after the
 * seat has exited.
 * @property {() => Subscriber<Completion>} getExitSubscriber returns a subscriber that
 * will be notified when the seat has exited or failed.
 */

/**
 * @typedef {Partial<ProposalRecord>} Proposal
 *
 * @typedef {{give: AmountKeywordRecord,
 *            want: AmountKeywordRecord,
 *            exit: ExitRule
 *           }} ProposalRecord
 */

/**
 * @typedef {Record<Keyword, Amount<any>>} AmountKeywordRecord
 *
 * The keys are keywords, and the values are amounts. For example:
 * { Asset: AmountMath.make(assetBrand, 5n), Price:
 * AmountMath.make(priceBrand, 9n) }
 */

/**
 * @typedef {object} Waker
 * @property {() => void} wake
 */

/**
 * @typedef {object} OnDemandExitRule
 * @property {null} onDemand
 */

/**
 * @typedef {object} WaivedExitRule
 * @property {null} waived
 */

/**
 * @typedef {object} AfterDeadlineExitRule
 * @property {{timer: import('@agoric/time').TimerService, deadline: import('@agoric/time').Timestamp}} afterDeadline
 */

/**
 * @typedef {OnDemandExitRule | WaivedExitRule | AfterDeadlineExitRule} ExitRule
 *
 * The possible keys are 'waived', 'onDemand', and 'afterDeadline'.
 * `timer` and `deadline` only are used for the `afterDeadline` key.
 * The possible records are:
 * `{ waived: null }`
 * `{ onDemand: null }`
 * `{ afterDeadline: { timer :Timer<Deadline>, deadline :Deadline } }`
 */

/**
 * @typedef {{bundleCap: BundleCap } | {name: string} | {id: BundleID}} ZCFSpec
 */

/**
 * @typedef {Record<Keyword,ERef<Payment<any>>>} PaymentPKeywordRecord
 * @typedef {Record<Keyword,Payment<any>>} PaymentKeywordRecord
 */

/**
 * @typedef {object} InvitationDetails
 * @property {Installation<any>} installation
 * @property {Instance<any>} instance
 * @property {InvitationHandle} handle
 * @property {string} description
 * @property {Record<string, any>} [customDetails]
 */

/**
 * @typedef {object} FeeIssuerConfig
 * @property {string} name
 * @property {AssetKind} assetKind
 * @property {DisplayInfo} displayInfo
 */

/**
 * @typedef {object} ZoeFeesConfig
 * @property {NatValue} getPublicFacetFee
 */

/**
 * @typedef {Handle<'feeMintAccess'>} FeeMintAccess
 */
