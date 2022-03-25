// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { observeIteration } from '@agoric/notifier';

import { makeParamTerms } from './governedContract.js';
import { CONTRACT_ELECTORATE, assertContractElectorate } from '../../../src';

const { quote: q } = assert;

/**
 * @param {ERef<ZoeService>} zoe
 * @param {(string: string) => undefined} log
 * @param {Record<string, Installation>} installations
 * @param {ERef<GovernedContractFacetAccess<unknown>>} contractFacetAccess
 * @param {bigint} deadline
 * @returns {Promise<any>}
 */
const voteToChangeParameter = async (
  zoe,
  log,
  installations,
  contractFacetAccess,
  deadline,
) => {
  const { details, instance, outcomeOfUpdate } = await E(
    contractFacetAccess,
  ).voteOnParamChange(
    { key: 'main', parameterName: 'MalleableNumber' },
    299792458n,
    installations.binaryVoteCounter,
    deadline,
  );

  E(E(zoe).getPublicFacet(instance))
    .getOutcome()
    .then(outcome => log(`vote outcome: ${q(outcome)}`))
    .catch(e => log(`vote failed ${e}`));

  E.when(outcomeOfUpdate, outcome => log(`updated to ${q(outcome)}`)).catch(e =>
    log(`update failed: ${e}`),
  );
  return { details, outcomeOfUpdate };
};

const installContracts = async (zoe, cb) => {
  const [committee, binaryVoteCounter, contractGovernor, governedContract] =
    await Promise.all([
      E(zoe).install(cb.committee),
      E(zoe).install(cb.binaryVoteCounter),
      E(zoe).install(cb.contractGovernor),
      E(zoe).install(cb.governedContract),
    ]);
  const installations = {
    committee,
    binaryVoteCounter,
    contractGovernor,
    governedContract,
  };
  return installations;
};

const startElectorate = async (zoe, installations, electorateTerms) => {
  const { creatorFacet: electorateCreatorFacet, instance: electorateInstance } =
    await E(zoe).startInstance(installations.committee, {}, electorateTerms);
  return { electorateCreatorFacet, electorateInstance };
};

const createVoters = async (electorateCreatorFacet, voterCreator) => {
  const invitations = await E(electorateCreatorFacet).getVoterInvitations();

  const aliceP = E(voterCreator).createVoter('Alice', invitations[0]);
  const bobP = E(voterCreator).createVoter('Bob', invitations[1]);
  const carolP = E(voterCreator).createVoter('Carol', invitations[2]);
  const daveP = E(voterCreator).createVoter('Dave', invitations[3]);
  const emmaP = E(voterCreator).createVoter('Emma', invitations[4]);
  return Promise.all([aliceP, bobP, carolP, daveP, emmaP]);
};

const votersVote = async (detailsP, votersP, selections) => {
  const [voters, details] = await Promise.all([votersP, detailsP]);
  const { positions, questionHandle } = details;

  await Promise.all(
    voters.map((v, i) => {
      return E(v).castBallotFor(questionHandle, positions[selections[i]]);
    }),
  );
};

const oneVoterValidate = async (
  votersP,
  detailsP,
  governedInstanceP,
  electorateInstance,
  governorInstanceP,
  installations,
  timer,
) => {
  const [voters, details, governedInstance, governorInstance] =
    await Promise.all([
      votersP,
      detailsP,
      governedInstanceP,
      governorInstanceP,
    ]);
  const { counterInstance } = details;

  E(voters[0]).validate(
    counterInstance,
    governedInstance,
    electorateInstance,
    governorInstance,
    installations,
    timer,
  );
};

const checkContractState = async (zoe, contractInstanceP, log) => {
  const contractInstance = await contractInstanceP;
  const contractPublic = E(zoe).getPublicFacet(contractInstance);
  let paramValues = await E(contractPublic).getGovernedParams();
  const subscription = await E(contractPublic).getSubscription();
  const paramChangeObserver = Far('param observer', {
    updateState: update =>
      log(`${update.name} was changed to ${q(update.value)}`),
  });
  observeIteration(subscription, paramChangeObserver);

  // it takes a while for the update to propagate. The second time it seems good
  paramValues = await E(contractPublic).getGovernedParams();
  const malleableNumber = paramValues.MalleableNumber;

  log(`current value of MalleableNumber is ${malleableNumber.value}`);
};

const setupElectorateChange = async (
  zoe,
  log,
  governor,
  installations,
  invitation,
) => {
  const { details, instance, outcomeOfUpdate } = await E(
    governor,
  ).voteOnParamChange(
    { key: 'main', parameterName: CONTRACT_ELECTORATE },
    invitation,
    installations.binaryVoteCounter,
    2n,
  );

  E(E(zoe).getPublicFacet(instance))
    .getOutcome()
    .then(outcome => log(`vote outcome: ${q(outcome)}`))
    .catch(e => log(`vote failed ${e}`));

  E.when(outcomeOfUpdate, outcome => log(`updated to ${q(outcome)}`)).catch(e =>
    log(`update failed: ${e}`),
  );
  return { details, outcomeOfUpdate };
};

const validateElectorateChange = async (
  zoe,
  log,
  voters1,
  detailsP,
  governorInstance,
  electorateInstance,
  publicFacet,
) => {
  const electorateValid = E(publicFacet).validateElectorate(electorateInstance);
  const details = await detailsP;
  const timerValid = E(publicFacet).validateTimer(details);

  await assertContractElectorate(zoe, governorInstance, electorateInstance);

  const [eValid, tValid] = await Promise.all([electorateValid, timerValid]);

  return log(`Validation complete: ${eValid && tValid}`);
};

const makeBootstrap = (argv, cb, vatPowers) => async (vats, devices) => {
  const log = vatPowers.testLog;
  const vatAdminSvc = await E(vats.vatAdmin).createVatAdminService(
    devices.vatAdmin,
  );
  /** @type {ERef<ZoeService>} */
  const zoe = E(vats.zoe).buildZoe(vatAdminSvc);
  const installations = await installContracts(zoe, cb);
  const timer = buildManualTimer(log);
  const voterCreator = E(vats.voter).build(zoe);
  const firstElectorateTerms = {
    committeeName: 'TwentyCommittee',
    committeeSize: 5,
  };
  const {
    electorateCreatorFacet: firstElectorateCreatorFacet,
    electorateInstance: firstElectorateInstance,
  } = await startElectorate(zoe, installations, firstElectorateTerms);

  log(`=> voter and electorate vats are set up`);

  const initialPoserInvitation = E(
    firstElectorateCreatorFacet,
  ).getPoserInvitation();
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const invitationValue = await E(invitationIssuer).getAmountOf(
    initialPoserInvitation,
  );

  const governedContractTerms = {
    timer,
    electorateInstance: firstElectorateInstance,
    governedContractInstallation: installations.governedContract,
    governed: {
      issuerKeywordRecord: {},
      terms: {
        main: makeParamTerms(602214090000000000000000n, invitationValue),
      },
      privateArgs: { initialPoserInvitation },
    },
  };

  const { creatorFacet: governor, instance: governorInstance } = await E(
    zoe,
  ).startInstance(installations.contractGovernor, {}, governedContractTerms);
  const governedInstance = E(governor).getInstance();

  const [testName] = argv;
  switch (testName) {
    case 'contractGovernorStart': {
      const votersP = createVoters(firstElectorateCreatorFacet, voterCreator);
      const { details: detailsP, outcomeOfUpdate: outcome1 } =
        await voteToChangeParameter(zoe, log, installations, governor, 3n);
      await votersVote(detailsP, votersP, [0, 1, 1, 0, 0]);

      await oneVoterValidate(
        votersP,
        detailsP,
        governedInstance,
        firstElectorateInstance,
        governorInstance,
        installations,
        timer,
      );

      await E(timer).tick();
      await E(timer).tick();
      await E(timer).tick();
      await outcome1;

      await checkContractState(zoe, governedInstance, log);
      break;
    }
    case 'changeElectorateStart': {
      const voters1 = createVoters(firstElectorateCreatorFacet, voterCreator);

      const secondElectorateTerms = {
        committeeName: 'ThirtyCommittee',
        committeeSize: 5,
      };
      const {
        electorateCreatorFacet: secondElectorateCreatorFacet,
        electorateInstance: secondElectorateInstance,
      } = await startElectorate(zoe, installations, secondElectorateTerms);
      const voters2 = createVoters(secondElectorateCreatorFacet, voterCreator);

      const newPoserInvitationP = E(
        secondElectorateCreatorFacet,
      ).getPoserInvitation();
      const [newPoserInvitation] = await Promise.all([newPoserInvitationP]);

      const { details: details1, outcomeOfUpdate: electorateOutcome } =
        await setupElectorateChange(
          zoe,
          log,
          governor,
          installations,
          newPoserInvitation,
        );

      await votersVote(details1, voters1, [1, 0, 0, 0, 1]);
      await E(timer).tick();
      await E(timer).tick();
      await electorateOutcome;

      await validateElectorateChange(
        zoe,
        log,
        voters1,
        details1,
        governorInstance,
        secondElectorateInstance,
        E(zoe).getPublicFacet(governorInstance),
      );

      const { details: details2, outcomeOfUpdate: outcome2 } =
        await voteToChangeParameter(zoe, log, installations, governor, 4n);
      await votersVote(details2, voters2, [0, 0, 1, 0, 1]);
      await E(timer).tick();
      await E(timer).tick();
      await outcome2;

      await checkContractState(zoe, governedInstance, log);

      break;
    }
    default:
      log(`didn't find test: ${argv}`);
  }
};

export const buildRootObject = (vatPowers, vatParameters) => {
  const { argv, contractBundles: cb } = vatParameters;
  return Far('root', { bootstrap: makeBootstrap(argv, cb, vatPowers) });
};
