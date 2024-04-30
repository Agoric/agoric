import { mustMatch } from '@agoric/store';
import { E } from '@endo/eventual-send';

import { makeTracer } from '@agoric/internal';
import { provideSingleton } from '@agoric/zoe/src/contractSupport/durability.js';
import { CONTRACT_ELECTORATE } from './contractGovernance/governParam.js';
import { prepareContractGovernorKit } from './contractGovernorKit.js';
import { ParamChangesQuestionDetailsShape } from './typeGuards.js';

/**
 * @import {ContractMeta, Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, StandardTerms, ZCF, ZoeService} from '@agoric/zoe';
 * @import {GovernableStartFn, GovernorCreatorFacet, GovernorPublic, ParamChangeIssueDetails} from './types.js';
 */

const { Fail } = assert;

const trace = makeTracer('CGov', false);

/** @type {ContractMeta} */
export const meta = {
  upgradability: 'canUpgrade',
};
harden(meta);

/**
 * Validate that the question details correspond to a parameter change question
 * that the electorate hosts, and that the voteCounter and other details are
 * consistent with it.
 *
 * @param {ERef<ZoeService>} zoe
 * @param {Instance} electorate
 * @param {ParamChangeIssueDetails} details
 */
export const validateQuestionDetails = async (zoe, electorate, details) => {
  const {
    counterInstance,
    issue: { contract: governedInstance },
  } = details;
  mustMatch(details, ParamChangesQuestionDetailsShape);

  const governorInstance = await E.get(E(zoe).getTerms(governedInstance))
    .electionManager;
  const governorPublic = E(zoe).getPublicFacet(governorInstance);

  return Promise.all([
    E(governorPublic).validateVoteCounter(counterInstance),
    E(governorPublic).validateElectorate(electorate),
    E(governorPublic).validateTimer(details.closingRule),
  ]);
};
harden(validateQuestionDetails);

/**
 * Validate that the questions counted by the voteCounter correspond to a
 * parameter change question that the electorate hosts, and that the
 * voteCounter and other details are consistent.
 *
 * @param {ERef<ZoeService>} zoe
 * @param {Instance} electorate
 * @param {Instance} voteCounter
 */
export const validateQuestionFromCounter = async (
  zoe,
  electorate,
  voteCounter,
) => {
  const counterPublicP = E(zoe).getPublicFacet(voteCounter);
  const questionDetails = await E(counterPublicP).getDetails();

  return validateQuestionDetails(zoe, electorate, questionDetails);
};
harden(validateQuestionFromCounter);

/**
 * @typedef {StandardTerms} ContractGovernorTerms
 * @property {import('@agoric/time').TimerService} timer
 * @property {Installation} governedContractInstallation
 */

/**
 * ContractGovernor is an ElectionManager that starts up a contract and hands
 * its own creator a facet that allows them to manage that contract's APIs,
 * offer filters, and parameters.
 *
 * The terms for this contract include the Timer, and the Installation to be
 * started, as well as an issuerKeywordRecord or terms needed by the governed
 * contract. Those details for the governed contract are included in this
 * contract's terms as a "governed" record. If the contract expects privateArgs,
 * those will be provided in this contract's `privateArgs` under 'governed:'.
 *
 * terms = {
 *    timer,
 *    governedContractInstallation,
 *    governed: { issuerKeywordRecord, terms },
 * };
 *
 * The electorate that will vote on governance questions is itself a governed
 * parameter. Its value is available from the publicFacet using
 * getElectorateInstance(). When creating new questions, we use
 * getUpdatedPoserFacet() to inform the electorate about the new question.
 *
 * The governedContract is responsible for supplying getParamMgrRetriever() in
 * its creatorFacet. getParamMgrRetriever() takes a ParamSpecification, which
 * identifies the parameter to be voted on. A minimal ParamSpecification
 * specifies the key which identifies a particular paramManager (even if there's
 * only one) and the parameterName. The interpretation of ParamSpecification is
 * up to the contract.
 *
 * The contractGovernor creatorFacet includes `voteOnParamChanges`,
 * `voteOnFilter`, and `voteOnApiInvocation`. `voteOnParamChanges` is used to
 * create questions that will automatically update contract parameters if
 * passed. `voteOnFilter` can be used to create questions that will prevent the
 * exercise of certain invitations if passed. `voteOnApiInvocation` creates
 * questions that will invoke pre-defined APIs in the contract.
 *
 * This facet will usually be closely held. The creatorFacet can also be used to
 * retrieve the governed instance, publicFacet, and its creatorFacet with
 * the voteOn*() methods omitted.
 *
 * The governed contract's terms include the instance of this (governing)
 * contract (as electionManager) so clients will be able to look up the state
 * of the governed parameters.
 *
 * template {{}} PF Public facet of governed
 * template {ContractPowerfulCreatorFacet} CF Creator facet of governed
 * type {ContractStartFn<
 * GovernorPublic,
 * GovernorCreatorFacet<PF,CF>,
 * {
 *   timer: import('@agoric/time').TimerService,
 *   governedContractInstallation: Installation<CF>,
 *   governed: {
 *     issuerKeywordRecord: IssuerKeywordRecord,
 *     terms: {governedParams: {[CONTRACT_ELECTORATE]: InvitationParam}},
 *   }
 * }>}
 */

/**
 * Start an instance of a governor, governing a "governed" contract specified in terms.
 *
 * @template {GovernableStartFn} SF Start function of governed contract
 * @param {ZCF<{
 *   timer: import('@agoric/time').TimerService,
 *   governedContractInstallation: Installation<SF>,
 *   governed: {
 *     issuerKeywordRecord: IssuerKeywordRecord,
 *     terms: {governedParams: {[CONTRACT_ELECTORATE]: import('./contractGovernance/typedParamManager.js').InvitationParam}},
 *     label?: string,
 *   }
 * }>} zcf
 * @param {{
 *   governed: Record<string, unknown>
 * }} privateArgs
 * @returns {Promise<{
 *   creatorFacet: GovernorCreatorFacet<SF>,
 *   publicFacet: GovernorPublic,
 * }>}
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  trace('start');
  const zoe = zcf.getZoeService();
  trace('getTerms', zcf.getTerms());
  const {
    timer,
    governedContractInstallation,
    governed: {
      issuerKeywordRecord: governedIssuerKeywordRecord,
      terms: contractTerms,
      label: governedContractLabel,
    },
  } = zcf.getTerms();
  trace('contractTerms', contractTerms);
  contractTerms.governedParams[CONTRACT_ELECTORATE] ||
    Fail`Contract must declare ${CONTRACT_ELECTORATE} as a governed parameter`;

  const makeContractGovernorKit = prepareContractGovernorKit(baggage, {
    timer,
    zoe,
  });

  trace('awaiting provideSingleton()');
  const governorKit = await provideSingleton(
    baggage,
    'contractGovernorKit',
    async () => {
      const augmentedTerms = harden({
        ...contractTerms,
        electionManager: zcf.getInstance(),
      });

      trace('starting governedContractInstallation of', governedContractLabel);
      const startedInstanceKit = await E(zoe).startInstance(
        governedContractInstallation,
        governedIssuerKeywordRecord,

        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error -- failed only when not built
        // @ts-ignore XXX governance types https://github.com/Agoric/agoric-sdk/issues/7178
        augmentedTerms,
        privateArgs.governed,
        governedContractLabel,
      );
      trace('awaiting remote limitedCreatorFacet');
      const limitedCreatorFacet = await E(
        startedInstanceKit.creatorFacet,
      ).getLimitedCreatorFacet();

      return makeContractGovernorKit(startedInstanceKit, limitedCreatorFacet);
    },
  );

  // At this point, some remote calls still need to be made within the governorKit.
  // Specifically, to the vat of the governed contract for its API names. The exo
  // defers that until API governance is requested to be invoked or validated.

  trace('start complete');

  // CRUCIAL: only contractGovernor should get the ability to update params
  return { creatorFacet: governorKit.creator, publicFacet: governorKit.public };
};
harden(start);
