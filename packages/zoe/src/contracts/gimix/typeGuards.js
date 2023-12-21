import { M, makeCopyBag } from '@endo/patterns';
import { AmountShape } from '@agoric/ertp';
import { TimestampShape } from '@agoric/time';
import { TimerShape } from '../../typeGuards.js';

export const DeliverProposalShape = M.splitRecord({
  give: {},
  want: { Acceptance: AmountShape },
  exit: { onDemand: null },
});

export const JobReportProposalShape = M.splitRecord({
  give: {},
  want: M.splitRecord({}, { Fee: AmountShape }, {}),
  exit: { onDemand: null },
});

export const OracleInvitationProposalShape = M.splitRecord({
  give: {},
  want: {},
  exit: { onDemand: null },
});

export const makeStampAmount = (oracleBrand, issueURL) =>
  harden({
    brand: oracleBrand,
    value: makeCopyBag([[`Fixed ${issueURL}`, 1n]]),
  });

export const makeWorkAgreementProposalShape = stampAmount =>
  M.splitRecord({
    give: M.splitRecord({ Acceptance: AmountShape }, { Fee: AmountShape }, {}),
    want: {
      Stamp: stampAmount,
    },
    exit: {
      afterDeadline: {
        timer: M.eref(TimerShape),
        deadline: TimestampShape,
      },
    },
  });

export const ReportShape = harden({
  deliverDepositAddr: M.string(),
  jobID: M.nat(),
  issueURL: M.string(),
  prURL: M.string(),
});

export const JobsReportContinuingIKit = {
  invitationMakers: M.interface('JobReportInvitationMaker', {
    JobReport: M.call(ReportShape).returns(M.any()),
  }),
  kitMustHaveMultipleFacets: M.interface('Stub', {}),
};

export const GimixContractFacetsIKit = harden({
  creatorFacet: M.interface('GimixCreatorFacetKit', {
    makeOracleInvitation: M.call().returns(M.any()),
  }),
  publicFacet: M.interface('GimixPublicFacet', {
    makeWorkAgreementInvitation: M.call(M.string()).returns(M.any()),
  }),
});
