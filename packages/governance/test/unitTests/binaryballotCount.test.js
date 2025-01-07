import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { E } from '@endo/eventual-send';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { Far } from '@endo/marshal';
import { makeStoredPublishKit } from '@agoric/notifier';
import {
  eventLoopIteration,
  makeFakeMarshaller,
} from '@agoric/notifier/tools/testSupports.js';

import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';
import {
  ChoiceMethod,
  ElectionType,
  QuorumRule,
  coerceQuestionSpec,
  makeParamChangePositions,
} from '../../src/index.js';
import { makeBinaryVoteCounter } from '../../src/binaryVoteCounter.js';

const SIMPLE_ISSUE = harden({ text: 'Fish or cut bait?' });
const FISH = harden({ text: 'Fish' });
const BAIT = harden({ text: 'Cut Bait' });

/** @type {PARAM_CHANGE_ISSUE} */
// @ts-expect-error cast
const PARAM_ISSUE = harden({
  spec: {
    paramPath: { key: 'something' },
    changes: { arbitrary: 37 },
  },
  contract: Far('contract', {}),
});
const { positive, negative } = makeParamChangePositions({ Arbitrary: 37 });
const PARAM_CHANGE_ISSUE = harden({
  spec: { paramPath: { key: 'governedParam' }, changes: { Whatever: 37 } },
  contract: makeHandle('Instance'),
});

const FAKE_CLOSING_RULE = {
  timer: buildZoeManualTimer(console.log),
  deadline: 3n,
};

const FAKE_COUNTER_INSTANCE = makeHandle('Instance');

function makePublisherFromFakes() {
  const storageRoot = makeMockChainStorageRoot();
  const publishKit = makeStoredPublishKit(storageRoot, makeFakeMarshaller());
  return { publisher: publishKit.publisher, storageRoot };
}

test('binary question', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BAIT],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BAIT,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const alicePositions = aliceTemplate.getDetails().positions;
  t.deepEqual(alicePositions.length, 2);
  t.deepEqual(alicePositions[0], FISH);
  await E(creatorFacet).submitVote(aliceSeat, [alicePositions[0]]);
  closeFacet.closeVoting();
  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, FISH);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: FISH,
  });
});

test('binary spoiled', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BAIT],
    electionType: ElectionType.ELECTION,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BAIT,
    maxWinners: 1,
  });

  const { publisher } = makePublisherFromFakes();
  const { publicFacet, creatorFacet } = makeBinaryVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const alicePositions = aliceTemplate.getDetails().positions;
  t.deepEqual(alicePositions.length, 2);
  t.deepEqual(alicePositions[0], FISH);

  await t.throwsAsync(
    async () => E(creatorFacet).submitVote(aliceSeat, [harden({ text: 'no' })]),
    {
      message: `The specified choice is not a legal position: {"text":"no"}.`,
    },
  );
});

test('binary tied', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: PARAM_CHANGE_ISSUE,
    positions: [positive, negative],
    electionType: ElectionType.PARAM_CHANGE,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: negative,
    maxWinners: 1,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    2n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  void E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  await E(creatorFacet).submitVote(bobSeat, [positions[1]]);
  closeFacet.closeVoting();
  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, negative);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: negative,
  });
});

test('binary bad vote', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: PARAM_CHANGE_ISSUE,
    positions: [positive, negative],
    electionType: ElectionType.PARAM_CHANGE,
    maxChoices: 1,
    maxWinners: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: negative,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { creatorFacet, publicFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceSeat = makeHandle('Voter');

  await t.throwsAsync(
    async () => E(creatorFacet).submitVote(aliceSeat, [BAIT]),
    {
      message: `The specified choice is not a legal position: {"text":"Cut Bait"}.`,
    },
  );

  closeFacet.closeVoting();
  const outcome = await E(publicFacet)
    .getOutcome()
    .catch(e => t.is(e, 'No quorum'));
  t.deepEqual(outcome, negative);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: negative,
  });
});

test('binary no votes', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: PARAM_CHANGE_ISSUE,
    positions: [positive, negative],
    electionType: ElectionType.PARAM_CHANGE,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: negative,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );

  closeFacet.closeVoting();
  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, negative);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: negative,
  });
});

test('binary varying share weights', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BAIT],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BAIT,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    1n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aceSeat = makeHandle('Voter');
  const austinSeat = makeHandle('Voter');
  const saraSeat = makeHandle('Voter');

  await Promise.all([
    E(creatorFacet).submitVote(aceSeat, [FISH], 37n),
    E(creatorFacet).submitVote(austinSeat, [BAIT], 24n),
    E(creatorFacet).submitVote(saraSeat, [BAIT], 11n),
  ]);

  closeFacet.closeVoting();
  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, FISH);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: FISH,
  });
});

test('binary contested', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: PARAM_ISSUE,
    positions: [positive, negative],
    electionType: ElectionType.PARAM_CHANGE,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: negative,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    3n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;
  t.deepEqual(positions.length, 2);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 23n);
  await E(creatorFacet).submitVote(bobSeat, [positions[1]], 47n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, negative);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: negative,
  });
});

test('binary revote', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: PARAM_CHANGE_ISSUE,
    positions: [positive, negative],
    electionType: ElectionType.PARAM_CHANGE,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: negative,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    5n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;
  t.deepEqual(positions.length, 2);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 23n);
  void E(creatorFacet).submitVote(bobSeat, [positions[1]], 47n);
  await E(creatorFacet).submitVote(bobSeat, [positions[1]], 15n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, positive);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    position: positive,
  });
});

test('binary question too many positions', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BAIT],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BAIT,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    1n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const alicePositions = aliceTemplate.getDetails().positions;
  await t.throwsAsync(
    async () => E(creatorFacet).submitVote(aliceSeat, alicePositions),
    {
      message: 'only 1 position allowed',
    },
  );

  closeFacet.closeVoting();
  const outcome = await E(publicFacet)
    .getOutcome()
    .catch(e => t.is(e, 'No quorum'));
  t.deepEqual(outcome, true);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'fail',
    reason: 'No quorum',
  });
});

test('binary no quorum', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.UNRANKED,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BAIT],
    electionType: ElectionType.ELECTION,
    maxChoices: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BAIT,
    maxWinners: 1,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    2n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  await E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  closeFacet.closeVoting();
  await E(publicFacet)
    .getOutcome()
    .then(o => t.fail(`expected to reject, not ${o}`))
    .catch(e => t.deepEqual(e, 'No quorum'));

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'fail',
    reason: 'No quorum',
  });
});
test('binary too many positions', async t => {
  t.notThrows(() =>
    coerceQuestionSpec({
      method: ChoiceMethod.UNRANKED,
      issue: SIMPLE_ISSUE,
      positions: [FISH, BAIT, harden({ text: 'sleep' })],
      electionType: ElectionType.SURVEY,
      maxChoices: 1,
      maxWinners: 1,
      closingRule: FAKE_CLOSING_RULE,
      quorumRule: QuorumRule.NO_QUORUM,
      tieOutcome: BAIT,
    }),
  );
});
