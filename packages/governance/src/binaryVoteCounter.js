// @ts-check

import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import {
  defineHeapFarClassKit,
  initEmpty,
  keyEQ,
  makeStore,
} from '@agoric/store';

import {
  buildUnrankedQuestion,
  ChoiceMethod,
  coerceQuestionSpec,
  positionIncluded,
} from './question.js';
import { scheduleClose } from './closingRule.js';
import { BinaryVoteCounterIKit } from './typeGuards.js';

const { details: X } = assert;

const makeQuorumCounter = quorumThreshold => {
  const check = stats => {
    const votes = stats.results.reduce(
      (runningTotal, { total }) => runningTotal + total,
      0n,
    );
    return votes >= quorumThreshold;
  };
  /** @type {QuorumCounter} */
  return Far('checker', { check });
};

const validateBinaryQuestionSpec = questionSpec => {
  coerceQuestionSpec(questionSpec);

  const positions = questionSpec.positions;
  assert(
    positions.length === 2,
    X`Binary questions must have exactly two positions. had ${positions.length}: ${positions}`,
  );

  assert(
    questionSpec.maxChoices === 1,
    X`Can only choose 1 item on a binary question`,
  );
  assert(
    questionSpec.method === ChoiceMethod.UNRANKED,
    X`${questionSpec.method} must be UNRANKED`,
  );
  // We don't check the quorumRule or quorumThreshold here. The quorumThreshold
  // is provided by the Electorate that creates this voteCounter, since only it
  // can translate the quorumRule to a required number of votes.
};

// Notice that BinaryVoteCounter is designed to run as a Zoe contract. The
// business part of the contract is extracted here so it can be tested
// independently. The standard Zoe start function is at the bottom of this file.

/** @type {BuildVoteCounter} */
const makeBinaryVoteCounter = (questionSpec, threshold, instance) => {
  validateBinaryQuestionSpec(questionSpec);

  const question = buildUnrankedQuestion(questionSpec, instance);
  const details = question.getDetails();

  let isOpen = true;
  const positions = questionSpec.positions;
  /** @type { PromiseRecord<Position> } */
  const outcomePromise = makePromiseKit();
  /** @type { PromiseRecord<VoteStatistics> } */
  const tallyPromise = makePromiseKit();
  // The Electorate is responsible for creating a unique seat for each voter.
  // This voteCounter allows voters to re-vote, and replaces their previous
  // choice with the new selection.

  /**
   * @typedef {object} RecordedBallot
   * @property {Position} chosen
   * @property {bigint} shares
   */
  /** @type {Store<Handle<'Voter'>,RecordedBallot> } */
  const allBallots = makeStore('voterHandle');

  const countVotes = () => {
    assert(!isOpen, X`can't count votes while the election is open`);

    // question has position choices; Each ballot in allBallots should
    // match. count the valid ballots and report results.
    let spoiled = 0n;
    const tally = [0n, 0n];

    for (const { chosen, shares } of allBallots.values()) {
      const choice = positions.findIndex(p => keyEQ(p, chosen));
      if (choice < 0) {
        spoiled += shares;
      } else {
        tally[choice] += shares;
      }
    }

    /** @type { VoteStatistics } */
    const stats = {
      spoiled,
      votes: allBallots.getSize(),
      results: [
        { position: positions[0], total: tally[0] },
        { position: positions[1], total: tally[1] },
      ],
    };

    // CRUCIAL: countVotes only gets called once for each question. We want to
    // ensure that tallyPromise and outcomePromise always get resolved. The
    // tally gets the results regardless of the outcome. outcomePromise gets a
    // different resolution depending on whether there was no quorum to make a
    // decision, or the outcome is based on a majority either way, or a tie.
    tallyPromise.resolve(stats);

    if (!makeQuorumCounter(threshold).check(stats)) {
      outcomePromise.reject('No quorum');
      return;
    }

    if (tally[0] > tally[1]) {
      outcomePromise.resolve(positions[0]);
    } else if (tally[1] > tally[0]) {
      outcomePromise.resolve(positions[1]);
    } else {
      outcomePromise.resolve(questionSpec.tieOutcome);
    }
  };

  const makeBinaryVoteCounterKit = defineHeapFarClassKit(
    'Binary VoteCounter',
    BinaryVoteCounterIKit,
    initEmpty,
    {
      closeFacet: {
        closeVoting() {
          isOpen = false;
          countVotes();
        },
      },
      creatorFacet: {
        submitVote(voterHandle, chosenPositions, shares = 1n) {
          assert(chosenPositions.length === 1, 'only 1 position allowed');
          const [position] = chosenPositions;
          assert(
            positionIncluded(positions, position),
            X`The specified choice is not a legal position: ${position}.`,
          );

          // CRUCIAL: If the voter cast a valid ballot, we'll record it, but we need
          // to make sure that each voter's vote is recorded only once.
          const completedBallot = harden({ chosen: position, shares });
          allBallots.has(voterHandle)
            ? allBallots.set(voterHandle, completedBallot)
            : allBallots.init(voterHandle, completedBallot);
          return completedBallot;
        },
      },
      publicFacet: {
        getQuestion() {
          return question;
        },
        isOpen() {
          return isOpen;
        },
        getOutcome() {
          return outcomePromise.promise;
        },
        getStats() {
          return tallyPromise.promise;
        },
        getDetails() {
          return details;
        },
        getInstance() {
          return instance;
        },
      },
    },
  );
  return makeBinaryVoteCounterKit();
};

// The contract wrapper extracts the terms and runs makeBinaryVoteCounter().
// It schedules the closing of the vote, finally inserting the contract
// instance in the publicFacet before returning public and creator facets.

/**
 * @type {ContractStartFn<VoteCounterPublicFacet, VoteCounterCreatorFacet, {questionSpec: QuestionSpec, quorumThreshold: bigint}>}
 */
const start = zcf => {
  // There are a variety of ways of counting quorums. The parameters must be
  // visible in the terms. We're doing a simple threshold here. If we wanted to
  // discount abstentions, we could refactor to provide the quorumCounter as a
  // component.
  // TODO(hibbert) checking the quorum should be pluggable and legible.
  const { questionSpec, quorumThreshold } = zcf.getTerms();
  // The closeFacet is exposed for testing, but doesn't escape from a contract
  const { publicFacet, creatorFacet, closeFacet } = makeBinaryVoteCounter(
    questionSpec,
    quorumThreshold,
    zcf.getInstance(),
  );

  scheduleClose(questionSpec.closingRule, () => closeFacet.closeVoting());

  return { publicFacet, creatorFacet };
};

harden(start);
harden(makeBinaryVoteCounter);

export { makeBinaryVoteCounter, start };
