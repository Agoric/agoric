// eslint-disable-next-line spaced-comment
/// <reference types="ses"/>

/**
 * @typedef {Object} ZoeService
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
 * @property {() => Issuer} getInvitationIssuer
 *
 * Zoe has a single `invitationIssuer` for the entirety of its
 * lifetime. By having a reference to Zoe, a user can get the
 * `invitationIssuer` and thus validate any `invitation` they receive
 * from someone else. The mint associated with the invitationIssuer
 * creates the ERTP payments that represent the right to interact with
 * a smart contract in particular ways.
 *
 * @property {Install} install
 * @property {StartInstance} startInstance
 * @property {Offer} offer
 * @property {(instance: Instance) => Object} getPublicFacet
 * @property {(instance: Instance) => IssuerKeywordRecord} getIssuers
 * @property {(instance: Instance) => BrandKeywordRecord} getBrands
 * @property {(instance: Instance) => Object} getTerms
 * @property {(invitation: ERef<Invitation>) => Promise<Instance>} getInstance
 * @property {(invitation: ERef<Invitation>) => Promise<Installation>} getInstallation
 * @property {(invitation: ERef<Invitation>) => Promise<InvitationDetails>}
 * getInvitationDetails - return an object with the instance,
 * installation, description, invitation handle, and any custom properties
 * specific to the contract.
 */

/**
 * @callback Install
 *
 * Create an installation by safely evaluating the code and
 * registering it with Zoe. Returns an installation.
 *
 * @param {SourceBundle} bundle
 * @returns {Promise<Installation>}
 */

/**
 * @callback StartInstance
 * Zoe is long-lived. We can use Zoe to create smart contract
 * instances by specifying a particular contract installation to use,
 * as well as the `terms` of the contract. The `terms.issuers` is a
 * record mapping string names (keywords) to issuers, such as `{
 * Asset: simoleanIssuer}`. (Note that the keywords must begin with a
 * capital letter and must be ASCII identifiers.) Parties to the
 * contract will use the keywords to index their proposal and their
 * payments.
 *
 * The custom terms are the arguments to the contract, such as the
 * number of bids an auction will wait for before closing. Custom
 * terms are up to the discretion of the smart contract. We get back
 * the creator facet, public facet, and creator invitation as defined
 * by the contract.
 *
 * @param {Installation} installation
 * @param {IssuerKeywordRecord=} issuerKeywordRecord
 * @param {Object=} terms
 * @returns {Promise<StartInstanceResult>}
 */

/**
 * @callback Offer
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
 *
 * @param {ERef<Invitation>} invitation
 * @param {Proposal=} proposal
 * @param {PaymentPKeywordRecord=} paymentKeywordRecord
 * @returns {Promise<UserSeat>} seat
 */

/**
 * @typedef {Object} UserSeat
 * @property {() => Promise<Allocation>} getCurrentAllocation
 * @property {() => Promise<ProposalRecord>} getProposal
 * @property {() => Promise<PaymentPKeywordRecord>} getPayouts
 * @property {(keyword: Keyword) => Promise<Payment>} getPayout
 * @property {() => Promise<OfferResult>} getOfferResult
 * @property {() => void=} tryExit
 * @property {() => Promise<boolean>} hasExited
 * @property {() => Promise<Notifier>} getNotifier
 */

/**
 * @typedef {any} OfferResult
 */

/**
 * @typedef {Object} AdminFacet
 * @property {() => Promise<string|Error|any>} getVatShutdownPromise
 * @property {() => any} getVatStats
 */

/**
 * @typedef {Object} StartInstanceResult
 * @property {any} creatorFacet
 * @property {any} publicFacet
 * @property {Instance} instance
 * @property {Payment | undefined} creatorInvitation
 * @property {AdminFacet} adminFacet
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
 * @typedef {Record<Keyword,Amount>} AmountKeywordRecord
 *
 * The keys are keywords, and the values are amounts. For example:
 * { Asset: amountMath.make(5), Price: amountMath.make(9) }
 */

/**
 * @typedef {Object} Waker
 * @property {() => void} wake
 */

/**
 * @typedef {number} Deadline
 */

/**
 * @typedef {Object} Timer
 * @property {(deadline: Deadline, wakerP: ERef<Waker>) => void} setWakeup
 */

/**
 * @typedef {Object} ExitRule
 * @property {null=} onDemand
 * @property {null=} waived
 * @property {{timer:Timer, deadline:Deadline}=} afterDeadline
 *
 * The possible keys are 'waived', 'onDemand', and 'afterDeadline'.
 * `timer` and `deadline` only are used for the `afterDeadline` key.
 * The possible records are:
 * `{ waived: null }`
 * `{ onDemand: null }`
 * `{ afterDeadline: { timer :Timer<Deadline>, deadline :Deadline } }
 */

/**
 * @typedef {Handle<'InstanceHandle'>} Instance
 */

/**
 * @typedef {Object} VatAdminSvc
 * @property {(bundle: SourceBundle) => RootAndAdminNode} createVat
 * @property {(BundleName: string) => RootAndAdminNode} createVatByName
 */

/**
 * @typedef {Record<string, any>} SourceBundle Opaque type for a JSONable source bundle
 */

/**
 * @typedef {Record<Keyword,ERef<Payment>>} PaymentPKeywordRecord
 * @typedef {Record<Keyword,Payment>} PaymentKeywordRecord
 */

/**
 * @typedef {Object} StandardInvitationDetails
 * @property {Installation} installation
 * @property {Instance} instance
 * @property {InvitationHandle} handle
 * @property {string} description
 */

/**
 * @typedef {StandardInvitationDetails & Record<string, any>} InvitationDetails
 */

/**
 * @typedef {Object} Installation
 * @property {() => SourceBundle} getBundle
 */
