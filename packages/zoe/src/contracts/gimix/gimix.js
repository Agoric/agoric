import { E } from '@endo/eventual-send';
import { M } from '@endo/patterns';
import {
  prepareExoClass,
  prepareExoClassKit,
  provide,
  provideDurableMapStore,
} from '@agoric/vat-data';
import { AmountMath, AmountShape } from '@agoric/ertp';
import { OfferHandlerI } from '../../typeGuards.js';
import {
  DeliverProposalShape,
  JobReportProposalShape,
  OracleInvitationProposalShape,
  makeWorkAgreementProposalShape,
  ReportShape,
  JobsReportContinuingIKit,
  GimixContractFacetsIKit,
  makeStampAmount,
} from './typeGuards.js';

const { details: X, Fail, quote: q } = assert;

/**
 * @typedef {object} GiMiXTerms
 * @property {import('@agoric/vats').NameHub} namesByAddress
 * @property {import('@agoric/time/src/types').TimerService} timer
 */

/**
 * @param {ZCF<GiMiXTerms>} zcf
 * @param {unknown} _privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const prepare = async (zcf, _privateArgs, baggage) => {
  const { namesByAddress } = zcf.getTerms();

  const workByJob = provideDurableMapStore(
    baggage,
    'JobWork',
    harden({
      keyShape: M.nat(),
      valueShape: {
        issueURL: M.string(),
        requestorSeat: M.remotable('requestorSeat'),
        acceptanceAmount: AmountShape,
      },
    }),
  );

  const makeDeliverHandler = prepareExoClass(
    baggage,
    'DeliverHandler',
    OfferHandlerI,
    (requestorSeat, acceptanceAmount, reporterSeat, optFeeAmount, report) => ({
      requestorSeat,
      acceptanceAmount,
      reporterSeat,
      optFeeAmount,
      report,
    }),
    {
      handle(responderSeat) {
        const {
          state: {
            requestorSeat,
            acceptanceAmount,
            reporterSeat,
            optFeeAmount,
            report,
          },
        } = this;
        const { jobID, issueURL } = report;

        const {
          want: { Acceptance: wantedAmount },
        } = responderSeat.getProposal();

        if (!AmountMath.isGTE(acceptanceAmount, wantedAmount)) {
          const reason = assert.error(
            X`Amount wanted ${q(
              wantedAmount,
            )} must be within amount offered ${q(acceptanceAmount)}`,
          );
          responderSeat.fail(reason);
          throw reason;
        }

        workByJob.delete(jobID);
        if (requestorSeat.hasExited()) {
          // TODO check that the deadline actually has expired.
          // Otherwise, report mysterious failure.
          const reason = assert.error(X`Offer deadline expired`);
          responderSeat.fail(reason);
          throw reason;
        }
        const stampAmounts = harden({
          // eslint-disable-next-line no-use-before-define
          Stamp: makeStampAmount(oracleBrand, issueURL),
        });
        // eslint-disable-next-line no-use-before-define
        const stampSeat = gimixOracleMint.mintGains(stampAmounts);
        /** @type {TransferPart[]} */
        const transfers = [
          [stampSeat, requestorSeat, stampAmounts],
          [
            requestorSeat,
            responderSeat,
            {
              Acceptance: acceptanceAmount,
            },
          ],
        ];
        if (optFeeAmount) {
          transfers.push([
            requestorSeat,
            reporterSeat,
            {
              Fee: optFeeAmount,
            },
          ]);
        }
        zcf.atomicRearrange(harden(transfers));
        stampSeat.exit('done');
        responderSeat.exit('paid');
        requestorSeat.exit('mission accomplished');
        if (!reporterSeat.hasExited()) {
          reporterSeat.exit('thanks');
        }
      },
    },
    harden({
      stateShape: {
        requestorSeat: M.remotable('ZCFSeat'),
        acceptanceAmount: AmountShape,
        reporterSeat: M.remotable('ZCFSeat'),
        optFeeAmount: M.opt(AmountShape),
        report: ReportShape,
      },
    }),
  );

  const makeJobReportHandler = prepareExoClass(
    baggage,
    'JobReportHandler',
    OfferHandlerI,
    (report, optFeeAmount = undefined) => ({ report, optFeeAmount }),
    {
      handle(reporterSeat) {
        const {
          state: { report, optFeeAmount },
        } = this;
        const { deliverDepositAddr, jobID, issueURL } = report;

        const depositFacetP = E(namesByAddress).lookup(
          deliverDepositAddr,
          'depositFacet',
        );
        workByJob.has(jobID) || Fail`Gimix job ${q(jobID)} not found`;
        const {
          issueURL: expectedIssueURL,
          requestorSeat,
          acceptanceAmount,
        } = workByJob.get(jobID);
        expectedIssueURL === issueURL ||
          Fail`Gimix job ${q(jobID)} expected issue ${q(
            expectedIssueURL,
          )} not ${q(issueURL)}`;
        const deliverInvitationP = zcf.makeInvitation(
          makeDeliverHandler(
            requestorSeat,
            acceptanceAmount,
            reporterSeat,
            optFeeAmount,
            report,
          ),
          'gimix delivery',
          {
            acceptanceAmount,
            report,
          },
          DeliverProposalShape,
        );
        return deliverInvitationP.then(pmt => E(depositFacetP).receive(pmt));
      },
    },
    harden({
      stateShape: {
        report: ReportShape,
        optFeeAmount: M.opt(AmountShape),
      },
    }),
  );

  const makeJobReportContinuing = prepareExoClassKit(
    baggage,
    'JobsReportContinuing',
    JobsReportContinuingIKit,
    () => ({}),
    {
      invitationMakers: {
        JobReport(report, optFeeAmount) {
          return zcf.makeInvitation(
            makeJobReportHandler(report, optFeeAmount),
            'gimix job report',
            report,
            JobReportProposalShape,
          );
        },
      },
      kitMustHaveMultipleFacets: {},
    },
    harden({
      stateShape: {},
    }),
  );

  const makeOracleInvitationHandler = prepareExoClass(
    baggage,
    'OracleInvitationHandler',
    OfferHandlerI,
    () => ({}),
    {
      handle(oracleStartSeat) {
        oracleStartSeat.exit('started');
        return makeJobReportContinuing();
      },
    },
    harden({
      stateShape: {},
    }),
  );

  const NEXT_JOB_ID_VAR = 'nextGimixJobID';
  provide(baggage, NEXT_JOB_ID_VAR, () => 0n);

  // Hazard: Sequential assignment leaks info about how many previous
  // ones were allocated. This could both be a side channel and a covert
  // channel, i.e., the source of the leakage may be inadvertantly or
  // purposely leaking. However, this is a confidentiality-only leak,
  // and our current assumption of a public transparent chain makes
  // and the info at stake public anyway.
  const getNextJobID = () => {
    const nextGimixJobID = baggage.get(NEXT_JOB_ID_VAR);
    baggage.set(NEXT_JOB_ID_VAR, nextGimixJobID + 1n);
    return nextGimixJobID;
  };

  const makeWorkAgreementHandler = prepareExoClass(
    baggage,
    'WorkAgreementHandler',
    OfferHandlerI,
    issueURL => ({ issueURL }),
    {
      handle(requestorSeat) {
        const {
          state: { issueURL },
        } = this;
        const {
          give: { Acceptance: acceptanceAmount },
        } = requestorSeat.getProposal();

        const jobID = getNextJobID();
        workByJob.init(
          jobID,
          harden({
            issueURL,
            requestorSeat,
            acceptanceAmount,
          }),
        );
        return jobID;
      },
    },
    harden({
      stateShape: {
        issueURL: M.string(),
      },
    }),
  );

  const makeGimixContractFacets = prepareExoClassKit(
    baggage,
    'GimixContractFacets',
    GimixContractFacetsIKit,
    () => ({}),
    {
      creatorFacet: {
        makeOracleInvitation() {
          return zcf.makeInvitation(
            makeOracleInvitationHandler(),
            'gimix oracle invitation',
            undefined,
            OracleInvitationProposalShape,
          );
        },
      },
      publicFacet: {
        makeWorkAgreementInvitation(issueURL) {
          // eslint-disable-next-line no-use-before-define
          const stampAmount = makeStampAmount(oracleBrand, issueURL);
          return zcf.makeInvitation(
            makeWorkAgreementHandler(issueURL),
            'gimix work agreement',
            harden({
              issueURL,
            }),
            makeWorkAgreementProposalShape(stampAmount),
          );
        },
      },
    },
    harden({
      stateShape: {},
    }),
  );

  // ///////////////////////////////////////////////////////////////////////////
  //
  // The following `await` terminates the synchronous prelude of the `prepare`
  // function.
  // In this contract, we choose to use a fixed set of calls to the
  // `prepare*` functions, which means they all need to happen up front
  // before any interesting activity.
  // To be extra disciplined, we call all the `prepare*` functions above,
  // during the synchronous prelude.
  // This choice prevents us from using lexical nesting within actions,
  // and so all state must be provided as durable instance state.
  // (This is sometimes known as "lambda lifting".)
  // As an experiment in upgrade tolerance, we make all exposed abstractions
  // durable and upgradable, including offer handlers. By making the
  // offer handlers durable, their invitations should remain valid
  // across an upgrade.
  //
  // We continue in the same lexical scope below, so all the top level
  // variables declared an initialized after the synchronous prelude
  // are in scope above. But they can only be used by the code above
  // after they have been initialized.
  //
  // ///////////////////////////////////////////////////////////////////////////

  const gimixOracleMint = await zcf.makeZCFMint(
    'GimixOracle',
    'copyBag',
    undefined,
    { elementShape: M.string() }, // `Fixed ${issueURL}`
  );

  const { brand: oracleBrand } = gimixOracleMint.getIssuerRecord();

  return makeGimixContractFacets();
};
harden(prepare);
