// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import {
  setupGovernance,
  validateParamChangeQuestion,
  CONTRACT_ELECTORATE,
} from './paramGovernance/governParam.js';

const { details: X } = assert;

/** @type {ValidateQuestionDetails} */
const validateQuestionDetails = async (zoe, electorate, details) => {
  const {
    counterInstance,
    issue: { contract: governedInstance },
  } = details;
  validateParamChangeQuestion(details);

  const governorInstance = await E.get(E(zoe).getTerms(governedInstance))
    .electionManager;
  const governorPublic = E(zoe).getPublicFacet(governorInstance);

  return Promise.all([
    E(governorPublic).validateVoteCounter(counterInstance),
    E(governorPublic).validateElectorate(electorate),
    E(governorPublic).validateTimer(details),
  ]);
};

/** @type {ValidateQuestionFromCounter} */
const validateQuestionFromCounter = async (zoe, electorate, voteCounter) => {
  const counterPublicP = E(zoe).getPublicFacet(voteCounter);
  const questionDetails = await E(counterPublicP).getDetails();

  return validateQuestionDetails(zoe, electorate, questionDetails);
};

/**
 * @typedef {StandardTerms} ContractGovernorTerms
 * @property {TimerService} timer
 * @property {Instance} electorateInstance
 * @property {Installation} governedContractInstallation
 */

/**
 * ContractGovernor is an ElectionManager that starts up a contract and hands
 * its own creator a facet that allows them to call for votes on parameters that
 * were declared by the contract.
 *
 * The terms for this contract include the Timer, Electorate and the
 * Installation to be started, as well as an issuerKeywordRecord or terms needed
 * by the governed contract. Those details for the governed contract are
 * included in this contract's terms as a "governed" record. If the contract
 * expects privateArgs, those can be supplied as well.
 *
 * Terms = { timer, electorateInstance, governedContractInstallation, governed:
 * { issuerKeywordRecord, terms, privateArgs, }, };
 *
 * The governedContract is responsible for supplying getParamMgrRetriever() in
 * its creatorFacet. getParamMgrRetriever() takes a ParamSpecification, which
 * identifies the parameter to be voted on. A minimal ParamSpecification
 * specifies the key which identifies a particular paramManager (even if there's
 * only one) and the parameterName. The interpretation of ParamSpecification is
 * up to the contract.
 *
 * The contractGovernor creatorFacet includes voteOnParamChange(), which is used
 * to create questions that will automatically update contract parameters if
 * passed. This facet will usually be closely held. The creatorFacet can also be
 * used to retrieve the governed instance, publicFacet, and it's creatorFacet
 * with voteOnParamChange() omitted.
 *
 * The governed contract's terms include the instance of this (governing)
 * contract (as electionManager) so clients will be able to look up the state of
 * the governed parameters.
 *
 * @template {object} PF Public facet of governed
 * @template {ContractPowerfulCreatorFacet} CF Creator facet of governed
 * @type {ContractStartFn<
 *   GovernorPublic,
 *   GovernedContractFacetAccess<PF>,
 *   {
 *     timer: TimerService;
 *     electorateInstance: Instance;
 *     governedContractInstallation: Installation<CF>;
 *     governed: {
 *       issuerKeywordRecord: IssuerKeywordRecord;
 *       terms: { main: { [CONTRACT_ELECTORATE]: Amount<'set'> } };
 *       privateArgs: unknown;
 *     };
 *   }
 * >}
 */
const start = async zcf => {
  const zoe = zcf.getZoeService();
  const {
    timer,
    governedContractInstallation,
    governed: {
      issuerKeywordRecord: governedIssuerKeywordRecord,
      terms: governedTerms,
      privateArgs: privateContractArgs,
    },
  } = zcf.getTerms();

  assert(
    governedTerms.main[CONTRACT_ELECTORATE],
    X`Contract must declare ${CONTRACT_ELECTORATE} as a governed parameter`,
  );

  const augmentedTerms = harden({
    ...governedTerms,
    electionManager: zcf.getInstance(),
  });

  const {
    creatorFacet: governedCF,
    instance: governedInstance,
    publicFacet: governedPF,
  } = await E(zoe).startInstance(
    governedContractInstallation,
    governedIssuerKeywordRecord,
    augmentedTerms,
    privateContractArgs,
  );

  /** @type {() => Promise<Instance>} */
  const getElectorateInstance = async () => {
    const invitationAmount = await E(governedPF).getInvitationAmount(
      CONTRACT_ELECTORATE,
    );
    return invitationAmount.value[0].instance;
  };

  // CRUCIAL: only contractGovernor should get the ability to update params
  /** @type {Promise<LimitedCreatorFacet>} */
  const limitedCreatorFacet = E(governedCF).getLimitedCreatorFacet();
  const { voteOnParamChange, createdQuestion } = await setupGovernance(
    zoe,
    E(governedCF).getParamMgrRetriever(),
    governedInstance,
    timer,
  );

  const validateVoteCounter = async voteCounter => {
    const created = await E(createdQuestion)(voteCounter);
    assert(created, X`VoteCounter was not created by this contractGovernor`);
    return true;
  };

  const validateTimer = details => {
    assert(
      details.closingRule.timer === timer,
      X`closing rule must use my timer`,
    );
    return true;
  };

  const validateElectorate = async regP => {
    return E.when(regP, async reg => {
      const electorateInstance = await getElectorateInstance();
      assert(
        reg === electorateInstance,
        X`Electorate doesn't match my Electorate`,
      );
      return true;
    });
  };

  const creatorFacet = Far('governor creatorFacet', {
    voteOnParamChange,
    getCreatorFacet: () => limitedCreatorFacet,
    getInstance: () => governedInstance,
    getPublicFacet: () => governedPF,
  });

  const publicFacet = Far('contract governor public', {
    getElectorate: getElectorateInstance,
    getGovernedContract: () => governedInstance,
    validateVoteCounter,
    validateElectorate,
    validateTimer,
  });

  return { creatorFacet, publicFacet };
};

harden(start);
harden(validateQuestionDetails);
harden(validateQuestionFromCounter);
export { start, validateQuestionDetails, validateQuestionFromCounter };
