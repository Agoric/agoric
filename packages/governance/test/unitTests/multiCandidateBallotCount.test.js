import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { makeStoredPublishKit } from '@agoric/notifier';
import {
  eventLoopIteration,
  makeFakeMarshaller,
} from '@agoric/notifier/tools/testSupports.js';
import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';
import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/eventual-send';
import {
  ChoiceMethod,
  coerceQuestionSpec,
  ElectionType,
  QuorumRule,
} from '../../src/index.js';
import { makeMultiCandidateVoteCounter } from '../../src/multiCandidateVoteCounter.js';

/**
 * @import {Position} from '../../src/types.js';
 */

const SIMPLE_ISSUE = harden({
  text: 'Fish or Beef or Pork or Chicken or Duck?',
});
const FISH = harden({ text: 'Fish' });
const BEEF = harden({ text: 'Beef' });
const PORK = harden({ text: 'Pork' });
const CHICKEN = harden({ text: 'Chicken' });
const DUCK = harden({ text: 'Duck' });
const MUTTON = harden({ text: 'Mutton' });
const GOAT = harden({ text: 'Goat' });

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

test('multi candidate contested', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK, CHICKEN, DUCK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 3,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );

  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');
  const tedSeat = makeHandle('Voter');
  const carolSeat = makeHandle('Voter');
  const jackSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;
  t.deepEqual(positions.length, 5);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 2n);
  void E(creatorFacet).submitVote(bobSeat, [positions[2]], 15n);
  void E(creatorFacet).submitVote(tedSeat, [positions[1]], 27n);
  void E(creatorFacet).submitVote(carolSeat, [positions[3]], 17n);
  await E(creatorFacet).submitVote(jackSeat, [positions[4]], 14n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [BEEF, CHICKEN, PORK]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [BEEF, CHICKEN, PORK],
  });
});

test('multi candidate tie outcome', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK, CHICKEN, DUCK, MUTTON, GOAT],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 5,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );

  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');
  const tedSeat = makeHandle('Voter');
  const carolSeat = makeHandle('Voter');
  const jackSeat = makeHandle('Voter');
  const johnSeat = makeHandle('Voter');
  const charlieSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;
  t.deepEqual(positions.length, 7);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 3n);
  void E(creatorFacet).submitVote(bobSeat, [positions[2]], 5n);
  void E(creatorFacet).submitVote(tedSeat, [positions[1]], 5n);
  void E(creatorFacet).submitVote(carolSeat, [positions[3]], 8n);
  void E(creatorFacet).submitVote(johnSeat, [positions[5]], 5n);
  void E(creatorFacet).submitVote(charlieSeat, [positions[6]], 5n);
  await E(creatorFacet).submitVote(jackSeat, [positions[4]], 5n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.assert(outcome.length === 5);
  t.assert(outcome[0] === positions[3]);

  /** @type {Position[]} */
  const tiedPositions = [GOAT, DUCK, MUTTON, PORK, BEEF];

  for (let i = 1; i < outcome.length; i += 1) {
    t.assert(tiedPositions.includes(outcome[i]));
  }

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
  });
});

test('multi candidate tie outcome case #2', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK, CHICKEN, DUCK, MUTTON, GOAT],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 3,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );

  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');
  const tedSeat = makeHandle('Voter');
  const carolSeat = makeHandle('Voter');
  const johnSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;
  t.deepEqual(positions.length, 7);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 3n);
  void E(creatorFacet).submitVote(bobSeat, [positions[2]], 5n);
  void E(creatorFacet).submitVote(tedSeat, [positions[1]], 5n);
  void E(creatorFacet).submitVote(carolSeat, [positions[3]], 7n);
  await E(creatorFacet).submitVote(johnSeat, [positions[5]], 8n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.assert(outcome.length === 3);
  t.assert(outcome[0] === MUTTON);
  t.assert(outcome[1] === CHICKEN);

  /** @type {Position[]} */
  const tiedPositions = [PORK, BEEF];

  for (let i = 2; i < outcome.length; i += 1) {
    t.assert(tiedPositions.includes(outcome[i]));
  }

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
  });
});

test('multi candidate spoiled', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.MAJORITY,
    tieOutcome: BEEF,
  });

  const { publisher } = makePublisherFromFakes();
  const { publicFacet, creatorFacet } = makeMultiCandidateVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const alicePositions = aliceTemplate.getDetails().positions;
  t.deepEqual(alicePositions.length, 3);
  t.deepEqual(alicePositions[0], FISH);

  await t.throwsAsync(
    async () => E(creatorFacet).submitVote(aliceSeat, [harden({ text: 'no' })]),
    {
      message: `The specified choice is not a legal position: {"text":"no"}.`,
    },
  );
});

test('multi candidate revote', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 3,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const template = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = template.getDetails().positions;

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]], 23n);
  void E(creatorFacet).submitVote(bobSeat, [positions[1]], 15n);
  await E(creatorFacet).submitVote(bobSeat, [positions[2]], 47n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [PORK, FISH]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [PORK, FISH],
  });
});

test('multi candidate no votes', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });
  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, closeFacet } = makeMultiCandidateVoteCounter(
    questionSpec,
    0n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );

  closeFacet.closeVoting();
  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [BEEF]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [BEEF],
  });
});

test('multi candidate no quorum', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      3n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 3);
  t.deepEqual(positions[0], FISH);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  await E(creatorFacet).submitVote(bobSeat, [positions[1]]);
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

test('multi candidate specify multiple chocies', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 3,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 3);
  t.deepEqual(positions[0], FISH);

  void E(creatorFacet).submitVote(aliceSeat, [
    positions[0],
    positions[1],
    positions[2],
  ]);
  await E(creatorFacet).submitVote(bobSeat, [positions[1], positions[0]]);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [FISH, BEEF]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [FISH, BEEF],
  });
});

test('multi candidate specify multiple chocies with varying share weights', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 2,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 3);
  t.deepEqual(positions[0], FISH);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0], positions[1]], 3n);
  await E(creatorFacet).submitVote(bobSeat, [positions[1], positions[2]], 4n);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [BEEF, PORK]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [BEEF, PORK],
  });
});

test('multi candidate winners less than max winners', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: { text: 'max winners issue' },
    positions: [FISH, BEEF, PORK, CHICKEN, DUCK, MUTTON],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 4,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');
  const tedSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 6);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  void E(creatorFacet).submitVote(tedSeat, [positions[3]]);
  await E(creatorFacet).submitVote(bobSeat, [positions[5]]);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.deepEqual(outcome, [FISH, CHICKEN, MUTTON]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [FISH, CHICKEN, MUTTON],
  });
});

test('multi candidate single winner', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK, CHICKEN],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');
  const tedSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 4);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  void E(creatorFacet).submitVote(tedSeat, [positions[2]]);
  await E(creatorFacet).submitVote(bobSeat, [positions[2]]);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.assert(outcome.length === 1);
  t.deepEqual(outcome, [PORK]);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
    positions: [PORK],
  });
});

test('multi candidate single winner tie outcome', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK, CHICKEN],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 1,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher, storageRoot } = makePublisherFromFakes();
  const { publicFacet, creatorFacet, closeFacet } =
    makeMultiCandidateVoteCounter(
      questionSpec,
      0n,
      FAKE_COUNTER_INSTANCE,
      publisher,
    );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');
  const bobSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 4);

  void E(creatorFacet).submitVote(aliceSeat, [positions[0]]);
  await E(creatorFacet).submitVote(bobSeat, [positions[1]]);
  closeFacet.closeVoting();

  const outcome = await E(publicFacet).getOutcome();
  t.assert(outcome.length === 1);
  t.assert(outcome[0] === FISH || outcome[0] === BEEF);

  await eventLoopIteration();
  t.like(storageRoot.getBody('mockChainStorageRoot'), {
    outcome: 'win',
  });
});

test('multi candidate exceeds max choices', async t => {
  const questionSpec = coerceQuestionSpec({
    method: ChoiceMethod.PLURALITY,
    issue: SIMPLE_ISSUE,
    positions: [FISH, BEEF, PORK],
    electionType: ElectionType.SURVEY,
    maxChoices: 1,
    maxWinners: 2,
    closingRule: FAKE_CLOSING_RULE,
    quorumRule: QuorumRule.NO_QUORUM,
    tieOutcome: BEEF,
  });

  const { publisher } = makePublisherFromFakes();
  const { publicFacet, creatorFacet } = makeMultiCandidateVoteCounter(
    questionSpec,
    3n,
    FAKE_COUNTER_INSTANCE,
    publisher,
  );
  const aliceTemplate = publicFacet.getQuestion();
  const aliceSeat = makeHandle('Voter');

  const positions = aliceTemplate.getDetails().positions;
  t.deepEqual(positions.length, 3);
  t.deepEqual(positions[0], FISH);

  await t.throwsAsync(
    async () =>
      E(creatorFacet).submitVote(aliceSeat, [positions[0], positions[1]]),
    {
      message: `The number of choices exceeds the max choices.`,
    },
  );
});
