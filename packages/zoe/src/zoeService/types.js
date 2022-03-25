/// <reference types="ses"/>

/**
 * @typedef {Object} ZoeService Zoe provides a framework for deploying and
 *   working with smart contracts. It is accessed as a long-lived and
 *   well-trusted service that enforces offer safety for the contracts that use
 *   it. Zoe has a single `invitationIssuer` for the entirety of its lifetime.
 *   By having a reference to Zoe, a user can get the `invitationIssuer` and
 *   thus validate any `invitation` they receive from someone else.
 *
 *   Zoe has two different facets: the public Zoe service and the contract facet
 *   (ZCF). Each contract instance has a copy of ZCF within its vat. The
 *   contract and ZCF never have direct access to the users' payments or the Zoe purses.
 * @property {GetInvitationIssuer} getInvitationIssuer Zoe has a single
 *   `invitationIssuer` for the entirety of its lifetime. By having a reference
 *   to Zoe, a user can get the `invitationIssuer` and thus validate any
 *   `invitation` they receive from someone else. The mint associated with the
 *   invitationIssuer creates the ERTP payments that represent the right to
 *   interact with a smart contract in particular ways.
 * @property {InstallBundle} install
 * @property {InstallBundleID} installBundleID
 * @property {import('./utils').StartInstance<I>} startInstance
 * @property {Offer} offer
 * @property {GetPublicFacet} getPublicFacet
 * @property {GetIssuers} getIssuers
 * @property {GetBrands} getBrands
 * @property {GetTerms} getTerms
 * @property {GetInstallationForInstance} getInstallationForInstance
 * @property {GetInstance} getInstance
 * @property {GetInstallation} getInstallation
 * @property {GetInvitationDetails} getInvitationDetails Return an object with
 *   the instance, installation, description, invitation handle, and any custom
 *   properties specific to the contract.
 * @property {GetFeeIssuer} getFeeIssuer
 * @property {() => Promise<Purse>} makeFeePurse Deprecated. Does nothing useful
 *   but provided during transition so less old code breaks.
 * @property {(defaultFeePurse: ERef<Purse>) => ZoeService} bindDefaultFeePurse
 *   Deprecated. Does nothing useful but provided during transition so less old code breaks.
 * @property {GetConfiguration} getConfiguration
 * @property {GetBundleIDFromInstallation} getBundleIDFromInstallation
 */

/**
 * @callback GetInvitationIssuer
 * @returns {Promise<Issuer>}
 */

/**
 * @callback GetFeeIssuer
 * @returns {Promise<Issuer>}
 */

/**
 * @callback GetConfiguration
 * @returns {{
 *   feeIssuerConfig: FeeIssuerConfig;
 * }}
 */

/**
 * @callback GetPublicFacet
 * @param {ERef<Instance>} instanceP
 * @returns {Promise<Object>}
 */

/**
 * @callback GetIssuers
 * @param {Instance} instance
 * @returns {Promise<IssuerKeywordRecord>}
 */

/**
 * @callback GetBrands
 * @param {Instance} instance
 * @returns {Promise<BrandKeywordRecord>}
 */

/**
 * @callback GetTerms
 * @param {Instance} instance
 * @returns {Promise<AnyTerms>}
 */

/**
 * @callback GetInstallationForInstance
 * @param {Instance} instance
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetInstance
 * @param {ERef<Invitation>} invitation
 * @returns {Promise<Instance>}
 */

/**
 * @callback GetInstallation
 * @param {ERef<Invitation>} invitation
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetInvitationDetails
 * @param {ERef<Invitation>} invitation
 * @returns {Promise<InvitationDetails>}
 */

// XXX include `SourceBundle` because that's how this function is used.
// TODO remove this function https://github.com/Agoric/agoric-sdk/issues/4565
/**
 * @deprecated
 * @callback InstallBundle Create an installation by safely evaluating the code
 *   and registering it with Zoe. Returns an installation.
 * @param {Bundle | SourceBundle} bundle
 * @returns {Promise<Installation>}
 * @see InstallBundleID
 */

/**
 * @callback InstallBundleID Create an installation from a Bundle ID. Returns an
 *   installation.
 * @param {BundleID} bundleID
 * @returns {Promise<Installation>}
 */

/**
 * @callback GetBundleIDFromInstallation Verify that an alleged Invitation is
 *   real, and return the Bundle ID it will use for contract code.
 * @param {ERef<Installation>}
 * @returns {Promise<BundleID>}
 */

/**
 * @template {object} [OR=any]
 * @callback Offer To redeem an invitation, the user normally provides a
 *   proposal (their rules for the offer) as well as payments to be escrowed by
 *   Zoe. If either the proposal or payments would be empty, indicate this by
 *   omitting that argument or passing undefined, rather than passing an empty record.
 *
 *   The proposal has three parts: `want` and `give` are used by Zoe to enforce
 *   offer safety, and `exit` is used to specify the particular payout-liveness
 *   policy that Zoe can guarantee. `want` and `give` are objects with keywords
 *   as keys and amounts as values. `paymentKeywordRecord` is a record with
 *   keywords as keys, and the values are the actual payments to be escrowed. A
 *   payment is expected for every rule under `give`.
 * @param {ERef<Invitation<OR>>} invitation
 * @param {Proposal} [proposal]
 * @param {PaymentPKeywordRecord} [paymentKeywordRecord]
 * @param {Object} [offerArgs]
 * @returns {Promise<UserSeat<OR>>} Seat
 */

/**
 * @template {Object} [OR=any]
 * @typedef {Object} UserSeat
 * @property {() => Promise<Allocation>} getCurrentAllocation TODO remove
 *   getCurrentAllocation query
 * @property {() => Promise<ProposalRecord>} getProposal
 * @property {() => Promise<PaymentPKeywordRecord>} getPayouts
 * @property {(keyword: Keyword) => Promise<Payment>} getPayout
 * @property {() => Promise<OR>} getOfferResult
 * @property {() => void} [tryExit]
 * @property {() => Promise<boolean>} hasExited
 * @property {() => Promise<Notifier<Allocation>>} getNotifier
 */

/**
 * @typedef {Partial<ProposalRecord>} Proposal
 *
 * @typedef {{
 *   give: AmountKeywordRecord;
 *   want: AmountKeywordRecord;
 *   exit: ExitRule;
 * }} ProposalRecord
 */

/**
 * @typedef {Record<Keyword, Amount>} AmountKeywordRecord The keys are keywords,
 *   and the values are amounts. For example: { Asset:
 *   AmountMath.make(assetBrand, 5n), Price: AmountMath.make(priceBrand, 9n) }
 */

/**
 * @typedef {Object} Waker
 * @property {() => void} wake
 */

/** @typedef {bigint} Deadline */

/**
 * @typedef {Object} Timer
 * @property {(deadline: Deadline, wakerP: ERef<Waker>) => void} setWakeup
 */

/**
 * @typedef {Object} OnDemandExitRule
 * @property {null} onDemand
 */

/**
 * @typedef {Object} WaivedExitRule
 * @property {null} waived
 */

/**
 * @typedef {Object} AfterDeadlineExitRule
 * @property {{ timer: Timer; deadline: Deadline }} afterDeadline
 */

/**
 * @typedef {OnDemandExitRule | WaivedExitRule | AfterDeadlineExitRule} ExitRule
 *   The possible keys are 'waived', 'onDemand', and 'afterDeadline'. `timer` and
 *   `deadline` only are used for the `afterDeadline` key. The possible records
 *   are: `{ waived: null }` `{ onDemand: null }` `{ afterDeadline: { timer
 *   :Timer<Deadline>, deadline :Deadline } }
 */

/** @typedef {Handle<'Instance'>} Instance */

/**
 * @typedef {Object} VatAdminSvc
 * @property {(BundleID: id) => Promise<BundleCap>} getBundleCap
 * @property {(name: string) => Promise<BundleCap>} getNamedBundleCap
 * @property {(bundleCap: BundleCap) => Promise<RootAndAdminNode>} createVat
 */

/** @typedef {{ bundleCap: BundleCap } | { name: string } | { id: BundleID }} ZCFSpec */

/** @typedef {Record<string, any>} SourceBundle Opaque type for a JSONable source bundle */

/**
 * @typedef {Record<Keyword, ERef<Payment>>} PaymentPKeywordRecord
 *
 * @typedef {Record<Keyword, Payment>} PaymentKeywordRecord
 */

/**
 * @typedef {Object} StandardInvitationDetails
 * @property {Installation} installation
 * @property {Instance} instance
 * @property {InvitationHandle} handle
 * @property {string} description
 */

/** @typedef {StandardInvitationDetails & Record<string, any>} InvitationDetails */

/**
 * @template [C=unknown] Contract
 * @typedef {import('./utils').Installation<C>} Installation
 */

/**
 * @template {Installation} I
 * @typedef {import('./utils').InstallationStart<I>} InstallationStart
 */

/**
 * @typedef {Object} FeeIssuerConfig
 * @property {string} name
 * @property {AssetKind} assetKind
 * @property {DisplayInfo} displayInfo
 */

/**
 * @typedef {Object} ZoeFeesConfig
 * @property {NatValue} getPublicFacetFee
 */
