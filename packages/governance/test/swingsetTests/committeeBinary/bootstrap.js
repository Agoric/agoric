// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';

import {
  ChoiceMethod,
  QuorumRule,
  ElectionType,
  looksLikeQuestionSpec,
} from '../../../src/index.js';

const { quote: q } = assert;

const makeVoterVat = async (log, vats, zoe) => {
  const voterCreator = E(vats.voter).build(zoe);
  log(`=> voter vat is set up`);
  return voterCreator;
};

const createQuestion = async (qDetails, closingTime, tools, quorumRule) => {
  const { electorateFacet, installations } = tools;
  const { issue, positions, electionType } = qDetails;
  const closingRule = {
    timer: tools.timer,
    deadline: closingTime,
  };

  const questionSpec = looksLikeQuestionSpec(
    harden({
      method: ChoiceMethod.UNRANKED,
      issue,
      positions,
      electionType,
      maxChoices: 1,
      closingRule,
      quorumRule,
      tieOutcome: positions[1],
    }),
  );

  const { instance: counterInstance } = await E(electorateFacet).addQuestion(
    installations.binaryVoteCounter,
    questionSpec,
  );
  return { counterInstance };
};

const committeeBinaryStart = async (
  zoe,
  voterCreator,
  timer,
  log,
  installations,
) => {
  const electorateTerms = { committeeName: 'TheCommittee', committeeSize: 5 };
  const { creatorFacet: electorateFacet, instance: electorateInstance } =
    await E(zoe).startInstance(installations.committee, {}, electorateTerms);

  const choose = { text: 'Choose' };
  const electionType = ElectionType.SURVEY;
  const details = {
    issue: choose,
    positions: [harden({ text: 'Eeny' }), harden({ text: 'Meeny' })],
    electionType,
  };
  const [eeny, meeny] = details.positions;
  const tools = { electorateFacet, installations, timer };
  const { counterInstance } = await createQuestion(
    details,
    3n,
    tools,
    QuorumRule.MAJORITY,
  );

  const invitations = await E(electorateFacet).getVoterInvitations();
  const details2 = await E(zoe).getInvitationDetails(invitations[2]);

  log(
    `invitation details check: ${details2.instance === electorateInstance} ${
      details2.description
    }`,
  );

  const aliceP = E(voterCreator).createVoter('Alice', invitations[0], eeny);
  const bobP = E(voterCreator).createVoter('Bob', invitations[1], meeny);
  const carolP = E(voterCreator).createVoter('Carol', invitations[2], eeny);
  const daveP = E(voterCreator).createVoter('Dave', invitations[3], eeny);
  const emmaP = E(voterCreator).createVoter('Emma', invitations[4], meeny);
  const [alice] = await Promise.all([aliceP, bobP, carolP, daveP, emmaP]);

  // At least one voter should verify that everything is on the up-and-up
  const instances = { electorateInstance, counterInstance };
  await E(alice).verifyBallot(choose, instances);

  await E(timer).tick();
  await E(timer).tick();
  await E(timer).tick();

  const publicFacet = E(zoe).getPublicFacet(counterInstance);
  await E(publicFacet)
    .getOutcome()
    .then(outcome => log(`vote outcome: ${q(outcome)}`))
    .catch(e => log(`vote failed ${e}`));
};

const committeeBinaryTwoQuestions = async (
  zoe,
  voterCreator,
  timer,
  log,
  installations,
) => {
  log('starting TWO questions test');

  const electorateTerms = { committeeName: 'TheCommittee', committeeSize: 5 };
  const { creatorFacet: electorateFacet, instance: electorateInstance } =
    await E(zoe).startInstance(installations.committee, {}, electorateTerms);

  const invitations = await E(electorateFacet).getVoterInvitations();
  const details2 = await E(zoe).getInvitationDetails(invitations[2]);

  log(
    `invitation details check: ${details2.instance === electorateInstance} ${
      details2.description
    }`,
  );

  const tools = { electorateFacet, installations, timer };
  const twoPotato = harden({ text: 'Two Potato' });
  const onePotato = harden({ text: 'One Potato' });
  const choose = { text: 'Choose' };
  const howHigh = { text: 'How high?' };
  const oneFoot = harden({ text: '1 foot' });
  const twoFeet = harden({ text: '2 feet' });

  const aliceP = E(voterCreator).createMultiVoter('Alice', invitations[0], [
    [choose, onePotato],
    [howHigh, oneFoot],
  ]);
  const bobP = E(voterCreator).createMultiVoter('Bob', invitations[1], [
    [choose, onePotato],
    [howHigh, twoFeet],
  ]);
  const carolP = E(voterCreator).createMultiVoter('Carol', invitations[2], [
    [choose, twoPotato],
    [howHigh, oneFoot],
  ]);
  const daveP = E(voterCreator).createMultiVoter('Dave', invitations[3], [
    [choose, onePotato],
    [howHigh, oneFoot],
  ]);
  const emmaP = E(voterCreator).createMultiVoter('Emma', invitations[4], [
    [choose, onePotato],
    [howHigh, twoFeet],
  ]);

  const potato = {
    issue: choose,
    positions: [onePotato, twoPotato],
    electionType: ElectionType.SURVEY,
  };
  const { counterInstance: potatoCounterInstance } = await createQuestion(
    potato,
    3n,
    tools,
    QuorumRule.MAJORITY,
  );

  const height = {
    issue: howHigh,
    positions: [oneFoot, twoFeet],
    electionType: ElectionType.SURVEY,
  };
  const { counterInstance: heightCounterInstance } = await createQuestion(
    height,
    4n,
    tools,
    QuorumRule.MAJORITY,
  );

  const [alice, bob] = await Promise.all([aliceP, bobP, carolP, daveP, emmaP]);
  // At least one voter should verify that everything is on the up-and-up
  await E(alice).verifyBallot(choose, {
    electorateInstance,
    counterInstance: potatoCounterInstance,
  });
  await E(bob).verifyBallot(howHigh, {
    electorateInstance,
    counterInstance: heightCounterInstance,
  });

  await E(timer).tick();
  await E(timer).tick();
  await E(timer).tick();
  await E(timer).tick();

  await E(E(zoe).getPublicFacet(potatoCounterInstance))
    .getOutcome()
    .then(outcome => log(`vote outcome: ${q(outcome)}`))
    .catch(e => log(`vote failed ${e}`));

  await E(E(zoe).getPublicFacet(heightCounterInstance))
    .getOutcome()
    .then(outcome => log(`vote outcome: ${q(outcome)}`))
    .catch(e => log(`vote failed ${e}`));
};

const makeBootstrap = (argv, cb, vatPowers) => async (vats, devices) => {
  const log = vatPowers.testLog;
  const vatAdminSvc = await E(vats.vatAdmin).createVatAdminService(
    devices.vatAdmin,
  );
  /** @type {ERef<ZoeService>} */
  const zoe = E(vats.zoe).buildZoe(vatAdminSvc);

  const [committee, binaryVoteCounter] = await Promise.all([
    E(zoe).install(cb.committee),
    E(zoe).install(cb.binaryVoteCounter),
  ]);
  const timer = buildManualTimer(log);

  const installations = { committee, binaryVoteCounter };

  const voterCreator = await makeVoterVat(log, vats, zoe);

  const [testName] = argv;
  switch (testName) {
    case 'committeeBinaryStart':
      committeeBinaryStart(zoe, voterCreator, timer, log, installations);
      break;
    case 'committeeBinaryTwoQuestions':
      committeeBinaryTwoQuestions(zoe, voterCreator, timer, log, installations);
      break;
    default:
      log(`didn't find test: ${argv}`);
  }
};

export const buildRootObject = (vatPowers, vatParameters) => {
  const { argv, contractBundles: cb } = vatParameters;
  return Far('root', { bootstrap: makeBootstrap(argv, cb, vatPowers) });
};
