// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import '@agoric/zoe/exported.js';

import path from 'path';
import { E } from '@endo/eventual-send';
import { makeZoeKit } from '@agoric/zoe';
import fakeVatAdmin from '@agoric/zoe/tools/fakeVatAdmin.js';
import bundleSource from '@endo/bundle-source';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';

import {
  ChoiceMethod,
  ElectionType,
  QuorumRule,
  looksLikeQuestionSpec,
} from '../../src/index.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const electorateRoot = `${dirname}/../../src/committee.js`;
const counterRoot = `${dirname}/../../src/binaryVoteCounter.js`;

const setupContract = async () => {
  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);

  // pack the contract
  const [electorateBundle, counterBundle] = await Promise.all([
    bundleSource(electorateRoot),
    bundleSource(counterRoot),
  ]);
  // install the contract
  /** @typedef {Installation<import('../../src/committee.js').start>} CommitteInstallation */
  /** @typedef {Installation<import('../../src/binaryVoteCounter.js').start>} CounterInstallation */
  /** @type {[CommitteInstallation, CounterInstallation]} */
  // @ts-expect-error cast
  const [electorateInstallation, counterInstallation] = await Promise.all([
    E(zoe).install(electorateBundle),
    E(zoe).install(counterBundle),
  ]);
  const terms = { committeeName: 'illuminati', committeeSize: 13 };
  /** @type {import('@agoric/zoe/src/zoeService/utils').StartInstance} */
  const startInstance = E(zoe).startInstance;
  const electorateStartResult = await startInstance(
    electorateInstallation,
    {},
    terms,
  );

  return { electorateStartResult, counterInstallation };
};

test('committee-open no questions', async t => {
  const {
    electorateStartResult: { publicFacet },
  } = await setupContract();
  t.deepEqual(await publicFacet.getOpenQuestions(), []);
});

test('committee-open question:one', async t => {
  const {
    electorateStartResult: { creatorFacet, publicFacet },
    counterInstallation,
  } = await setupContract();

  const positions = [harden({ text: 'because' }), harden({ text: 'why not?' })];
  const questionSpec = looksLikeQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: harden({ text: 'why' }),
    positions,
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    closingRule: {
      timer: buildManualTimer(console.log),
      deadline: 2n,
    },
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: positions[1],
  });
  await E(creatorFacet).addQuestion(counterInstallation, questionSpec);
  const questions = await publicFacet.getOpenQuestions();
  const question = E(publicFacet).getQuestion(questions[0]);
  const questionDetails = await E(question).getDetails();
  // @ts-expect-error FIXME missing prop
  t.deepEqual(questionDetails.issue.text, 'why');
});

test('committee-open question:mixed', async t => {
  const {
    electorateStartResult: { creatorFacet, publicFacet },
    counterInstallation,
  } = await setupContract();

  const timer = buildManualTimer(console.log);
  const positions = [harden({ text: 'because' }), harden({ text: 'why not?' })];
  const questionSpec = looksLikeQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: harden({ text: 'why' }),
    positions,
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    closingRule: { timer, deadline: 4n },
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: positions[1],
  });
  await E(creatorFacet).addQuestion(counterInstallation, questionSpec);

  const questionSpec2 = {
    ...questionSpec,
    issue: harden({ text: 'why2' }),
    closingRule: questionSpec.closingRule,
    quorumRule: QuorumRule.MAJORITY,
  };
  await E(creatorFacet).addQuestion(counterInstallation, questionSpec2);

  const questionSpec3 = {
    ...questionSpec,
    issue: harden({ text: 'why3' }),
    closingRule: {
      timer,
      deadline: 1n,
    },
    quorumRule: QuorumRule.MAJORITY,
  };
  const { publicFacet: counterPublic } = await E(creatorFacet).addQuestion(
    counterInstallation,
    questionSpec3,
  );
  // We didn't add any votes. getOutcome() will eventually return a broken
  // promise, but not until some time after tick(). Add a .catch() for it.
  E(counterPublic)
    .getOutcome()
    .catch(e => t.deepEqual(e, 'No quorum'));

  timer.tick();

  const questions = await publicFacet.getOpenQuestions();
  t.deepEqual(questions.length, 2);
});
