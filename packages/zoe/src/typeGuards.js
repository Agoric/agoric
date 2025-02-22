// @jessie-check

import {
  AmountShape,
  AssetKindShape,
  BrandShape,
  DisplayInfoShape,
  IssuerKitShape,
  IssuerShape,
  PaymentShape,
} from '@agoric/ertp';
import { SubscriberShape } from '@agoric/notifier';
import { M } from '@agoric/store';
import { TimestampShape } from '@agoric/time';

/**
 * @import {TypedPattern} from '@agoric/internal';
 */

// keywords have an initial cap
export const KeywordShape = M.string();

/** @type {TypedPattern<InvitationHandle>} */
export const InvitationHandleShape = M.remotable('InvitationHandle');
/** @type {TypedPattern<Invitation>} */
export const InvitationShape = M.remotable('Invitation');
export const InstanceHandleShape = M.remotable('InstanceHandle');
/** @type {TypedPattern<Installation>} */
export const InstallationShape = M.remotable('Installation');
export const SeatShape = M.remotable('Seat');

export const AmountKeywordRecordShape = M.recordOf(KeywordShape, AmountShape);
export const AmountPatternKeywordRecordShape = M.recordOf(
  KeywordShape,
  M.pattern(),
);
export const PaymentPKeywordRecordShape = M.recordOf(
  KeywordShape,
  M.eref(PaymentShape),
);
export const IssuerKeywordRecordShape = M.recordOf(KeywordShape, IssuerShape);
export const IssuerPKeywordRecordShape = M.recordOf(
  KeywordShape,
  M.eref(IssuerShape),
);
export const BrandKeywordRecordShape = M.recordOf(KeywordShape, BrandShape);

export const IssuerRecordShape = M.splitRecord(
  {
    brand: BrandShape,
    issuer: IssuerShape,
    assetKind: AssetKindShape,
  },
  { displayInfo: DisplayInfoShape },
);

export const TermsShape = {
  issuers: IssuerKeywordRecordShape,
  brands: BrandKeywordRecordShape,
};
harden(TermsShape);

export const InstanceRecordShape = {
  installation: InstallationShape,
  instance: InstanceHandleShape,
  terms: M.splitRecord(TermsShape),
};
harden(InstanceRecordShape);

export const HandleI = M.interface('Handle', {});

export const makeHandleShape = name => M.remotable(`${name}Handle`);
export const TimerShape = makeHandleShape('timer');

/**
 * After defaults are filled in
 *
 * @see {ProposalRecord} type
 */
export const FullProposalShape = {
  want: AmountPatternKeywordRecordShape,
  give: AmountKeywordRecordShape,
  // To accept only one, we could use M.or rather than M.splitRecord,
  // but the error messages would have been worse. Rather,
  // cleanProposal's assertExit checks that there's exactly one.
  exit: M.splitRecord(
    {},
    {
      onDemand: null,
      waived: null,
      afterDeadline: {
        timer: M.eref(TimerShape),
        deadline: TimestampShape,
      },
    },
    {},
  ),
};
harden(FullProposalShape);

/** @see {Proposal} type */
export const ProposalShape = M.splitRecord({}, FullProposalShape, {});

export const EmptyProposalShape = M.splitRecord({
  give: {},
  want: {},
  exit: { onDemand: null },
});

export const isOnDemandExitRule = exit => {
  const [exitKey] = Object.keys(exit);
  return exitKey === 'onDemand';
};
harden(isOnDemandExitRule);

/**
 * @param {ExitRule} exit
 * @returns {exit is WaivedExitRule}
 */
export const isWaivedExitRule = exit => {
  const [exitKey] = Object.keys(exit);
  return exitKey === 'waived';
};
harden(isWaivedExitRule);

/**
 * @param {ExitRule} exit
 * @returns {exit is AfterDeadlineExitRule}
 */
export const isAfterDeadlineExitRule = exit => {
  const [exitKey] = Object.keys(exit);
  return exitKey === 'afterDeadline';
};
harden(isAfterDeadlineExitRule);

/** @type {TypedPattern<InvitationDetails>} */
export const InvitationElementShape = M.splitRecord({
  description: M.string(),
  handle: InvitationHandleShape,
  instance: InstanceHandleShape,
  installation: InstallationShape,
});

export const OfferHandlerI = M.interface('OfferHandler', {
  handle: M.call(SeatShape).optional(M.any()).returns(M.any()),
});

export const SeatHandleAllocationsShape = M.arrayOf({
  seatHandle: SeatShape,
  allocation: AmountKeywordRecordShape,
});

export const ZoeMintShape = M.remotable('ZoeMint');
export const ZoeMintI = M.interface('ZoeMint', {
  getIssuerRecord: M.call().returns(IssuerRecordShape),
  mintAndEscrow: M.call(AmountShape).returns(),
  withdrawAndBurn: M.call(AmountShape).returns(),
});

export const FeeMintAccessShape = M.remotable('FeeMintAccess');

export const ExitObjectI = M.interface('Exit Object', {
  exit: M.call().returns(),
});

export const ExitObjectShape = M.remotable('ExitObj');
export const InstanceAdminShape = M.remotable('InstanceAdmin');
export const InstanceAdminI = M.interface('InstanceAdmin', {
  makeInvitation: M.call(InvitationHandleShape, M.string())
    .optional(M.record(), M.pattern())
    .returns(InvitationShape),
  saveIssuer: M.callWhen(M.await(IssuerShape), KeywordShape).returns(
    IssuerRecordShape,
  ),
  makeNoEscrowSeat: M.call(
    AmountKeywordRecordShape,
    ProposalShape,
    ExitObjectShape,
    SeatShape,
  ).returns(SeatShape),
  exitAllSeats: M.call(M.any()).returns(),
  failAllSeats: M.call(M.any()).returns(),
  exitSeat: M.call(SeatShape, M.any()).returns(),
  failSeat: M.call(SeatShape, M.any()).returns(),
  makeZoeMint: M.call(KeywordShape)
    .optional(
      AssetKindShape,
      DisplayInfoShape,
      M.splitRecord({}, { elementShape: M.pattern() }),
    )
    .returns(M.remotable('zoeMint')),
  registerFeeMint: M.call(KeywordShape, FeeMintAccessShape).returns(
    M.remotable('feeMint'),
  ),
  replaceAllocations: M.call(SeatHandleAllocationsShape).returns(),
  stopAcceptingOffers: M.call().returns(),
  setOfferFilter: M.call(M.arrayOf(M.string())).returns(),
  getOfferFilter: M.call().returns(M.arrayOf(M.string())),
  getExitSubscriber: M.call(SeatShape).returns(SubscriberShape),
  isBlocked: M.call(M.string()).returns(M.boolean()),
  repairContractCompletionWatcher: M.call().returns(),
});

export const InstanceStorageManagerIKit = {
  instanceStorageManager: M.interface('InstanceStorageManager', {
    getTerms: M.call().returns(M.splitRecord(TermsShape)),
    getIssuers: M.call().returns(IssuerKeywordRecordShape),
    getBrands: M.call().returns(BrandKeywordRecordShape),
    getInstallation: M.call().returns(InstallationShape),
    getInvitationIssuer: M.call().returns(IssuerShape),

    saveIssuer: M.call(IssuerShape, KeywordShape).returns(M.promise()),
    makeZoeMint: M.call(KeywordShape)
      .optional(
        AssetKindShape,
        DisplayInfoShape,
        M.splitRecord({}, { elementShape: M.pattern() }),
      )
      .returns(M.eref(ZoeMintShape)),
    registerFeeMint: M.call(KeywordShape, FeeMintAccessShape).returns(
      M.remotable('feeMint'),
    ),
    getInstanceRecord: M.call().returns(InstanceRecordShape),
    getIssuerRecords: M.call().returns(M.arrayOf(IssuerRecordShape)),
    getWithdrawFacet: M.call().returns(M.remotable('WithdrawFacet')),
    initInstanceAdmin: M.call(
      InstanceHandleShape,
      M.remotable('instanceAdmin'),
    ).returns(M.promise()),
    deleteInstanceAdmin: M.call(InstanceAdminShape).returns(),
    makeInvitation: M.call(InvitationHandleShape, M.string())
      .optional(M.record(), M.pattern())
      .returns(PaymentShape),
    getRoot: M.call().returns(M.any()),
    getAdminNode: M.call().returns(M.remotable('adminNode')),
  }),
  withdrawFacet: M.interface('WithdrawFacet', {
    withdrawPayments: M.call(AmountKeywordRecordShape).returns(
      PaymentPKeywordRecordShape,
    ),
  }),
  helpers: M.interface('InstanceStorageManager helper', {
    wrapIssuerKitWithZoeMint: M.call(
      KeywordShape,
      IssuerKitShape,
      M.remotable('adminNode'),
    ).returns(ZoeMintShape),
  }),
};
harden(InstanceStorageManagerIKit);

export const BundleCapShape = M.remotable('bundleCap');
export const BundleShape = M.and(
  M.splitRecord({ moduleFormat: M.any() }),
  M.recordOf(M.string(), M.string({ stringLengthLimit: Infinity })),
);

export const UnwrappedInstallationShape = M.splitRecord(
  { installation: InstallationShape },
  {
    bundle: M.recordOf(M.string(), M.string({ stringLengthLimit: Infinity })),
    bundleCap: BundleCapShape,
    bundleID: M.string(),
  },
  {},
);

export const ZoeStorageManagerIKit = {
  zoeServiceDataAccess: M.interface('ZoeService dataAccess', {
    getTerms: M.call(InstanceHandleShape).returns(M.splitRecord(TermsShape)),
    getIssuers: M.call(InstanceHandleShape).returns(IssuerKeywordRecordShape),
    getBrands: M.call(InstanceHandleShape).returns(BrandKeywordRecordShape),
    getInstallation: M.call(InstanceHandleShape).returns(
      M.eref(M.remotable('Installation')),
    ),
    getInvitationIssuer: M.call().returns(IssuerShape),

    getBundleIDFromInstallation: M.call(InstallationShape).returns(
      M.eref(M.string()),
    ),
    installBundle: M.call(BundleShape)
      .optional(M.string())
      .returns(M.promise()),
    installBundleID: M.call(M.string())
      .optional(M.string())
      .returns(M.promise()),

    getPublicFacet: M.call(InstanceHandleShape).returns(
      M.eref(M.remotable('PublicFacet')),
    ),
    getOfferFilter: M.call(InstanceHandleShape).returns(M.arrayOf(M.string())),
    getProposalShapeForInvitation: M.call(InvitationHandleShape).returns(
      M.opt(M.pattern()),
    ),
  }),
  makeOfferAccess: M.interface('ZoeStorage makeOffer access', {
    getAssetKindByBrand: M.call(BrandShape).returns(AssetKindShape),
    getInstanceAdmin: M.call(InstanceHandleShape).returns(
      M.remotable('instanceAdmin'),
    ),
    getProposalShapeForInvitation: M.call(InvitationHandleShape).returns(
      M.opt(M.pattern()),
    ),
    getInvitationIssuer: M.call().returns(IssuerShape),
    depositPayments: M.call(ProposalShape, PaymentPKeywordRecordShape).returns(
      M.promise(),
    ),
  }),
  startInstanceAccess: M.interface('ZoeStorage startInstance access', {
    makeZoeInstanceStorageManager: M.call(
      InstallationShape,
      M.any(),
      IssuerPKeywordRecordShape,
      InstanceHandleShape,
      M.or(BundleCapShape, BundleShape),
      M.string(),
    ).returns(M.promise()),
    unwrapInstallation: M.callWhen(M.eref(InstallationShape)).returns(
      UnwrappedInstallationShape,
    ),
  }),
  invitationIssuerAccess: M.interface('ZoeStorage invitationIssuer', {
    getInvitationIssuer: M.call().returns(IssuerShape),
  }),
};
harden(ZoeStorageManagerIKit);

export const ZoeServiceI = M.interface('ZoeService', {
  install: M.call(M.any()).optional(M.string()).returns(M.promise()),
  installBundleID: M.call(M.string()).optional(M.string()).returns(M.promise()),
  startInstance: M.call(M.eref(InstallationShape))
    .optional(IssuerPKeywordRecordShape, M.record(), M.record(), M.string())
    .returns(M.promise()),
  offer: M.call(M.eref(InvitationShape))
    .optional(ProposalShape, PaymentPKeywordRecordShape, M.any())
    .returns(M.promise()),

  getOfferFilter: M.callWhen(M.await(InstanceHandleShape)).returns(
    M.arrayOf(M.string()),
  ),
  getInvitationIssuer: M.call().returns(M.promise()),
  getFeeIssuer: M.call().returns(M.promise()),
  getBrands: M.callWhen(M.await(InstanceHandleShape)).returns(
    BrandKeywordRecordShape,
  ),
  getIssuers: M.callWhen(M.await(InstanceHandleShape)).returns(
    IssuerKeywordRecordShape,
  ),
  getPublicFacet: M.callWhen(M.await(InstanceHandleShape)).returns(
    M.remotable('PublicFacet'),
  ),
  getTerms: M.callWhen(M.await(InstanceHandleShape)).returns(M.any()),
  getInstallationForInstance: M.callWhen(M.await(InstanceHandleShape)).returns(
    M.eref(M.remotable('Installation')),
  ),
  getBundleIDFromInstallation: M.callWhen(M.await(InstallationShape)).returns(
    M.eref(M.string()),
  ),

  getInstallation: M.call(M.eref(InvitationShape)).returns(M.promise()),
  getInstance: M.call(M.eref(InvitationShape)).returns(M.promise()),
  getConfiguration: M.call().returns({
    feeIssuerConfig: {
      name: M.string(),
      assetKind: 'nat',
      displayInfo: DisplayInfoShape,
    },
  }),
  getInvitationDetails: M.call(M.eref(InvitationShape)).returns(M.any()),
  getProposalShapeForInvitation: M.call(InvitationHandleShape).returns(
    M.opt(M.pattern()),
  ),
});

export const AdminFacetI = M.interface('ZcfAdminFacet', {
  getVatShutdownPromise: M.call().returns(M.promise()),
  restartContract: M.call().optional(M.any()).returns(M.promise()),
  upgradeContract: M.call(M.string()).optional(M.any()).returns(M.promise()),
  terminateContract: M.call(M.error()).returns(M.promise()),
});

export const SeatDataShape = M.splitRecord(
  {
    proposal: ProposalShape,
    initialAllocation: AmountKeywordRecordShape,
    seatHandle: SeatShape,
  },
  {
    offerArgs: M.any(),
  },
);

export const HandleOfferI = M.interface('HandleOffer', {
  handleOffer: M.call(InvitationHandleShape, SeatDataShape).returns({
    offerResultPromise: M.promise(),
    exitObj: ExitObjectShape,
  }),
});

export const PriceQuoteShape = {
  quoteAmount: AmountShape,
  quotePayment: M.eref(PaymentShape),
};
harden(PriceQuoteShape);
