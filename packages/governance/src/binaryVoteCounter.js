/* eslint @typescript-eslint/no-floating-promises: "warn" */
import { makePromiseKit } from '@endo/promise-kit';
import { makeExo, keyEQ, makeScalarMapStore } from '@agoric/store';
import { E } from '@endo/eventual-send';

import {
  buildQuestion,
  ChoiceMethod,
  coerceQuestionSpec,
  positionIncluded,
} from './question.js';
import { scheduleClose } from './closingRule.js';
import {
  BinaryVoteCounterAdminI,
  BinaryVoteCounterCloseI,
  BinaryVoteCounterPublicI,
} from './typeGuards.js';
import { makeQuorumCounter } from './quorumCounter.js';

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {BuildVoteCounter, OutcomeRecord, Position, QuestionSpec, VoteStatistics} from './types.js';
 */

const { Fail } = assert;

const validateBinaryQuestionSpec = questionSpec => {
  coerceQuestionSpec(questionSpec);

  const positions = questionSpec.positions;
  positions.length === 2 ||
    Fail`Binary questions must have exactly two positions. had ${positions.length}: ${positions}`;
  questionSpec.maxChoices === 1 ||
    Fail`Can only choose 1 item on a binary question`;
  questionSpec.method === ChoiceMethod.UNRANKED ||
    Fail`${questionSpec.method} must be UNRANKED`;
  // We don't check the quorumRule or quorumThreshold here. The quorumThreshold
  // is provided by the Electorate that creates this voteCounter, since only it
  // can translate the quorumRule to a required number of votes.
};

// Notice that BinaryVoteCounter is designed to run as a Zoe contract. The
// business part of the contract is extracted here so it can be tested
// independently. The standard Zoe start function is at the bottom of this file.

/** @type {BuildVoteCounter} */
const makeBinaryVoteCounter = (
  questionSpec,
  threshold,
  instance,
  publisher,
) => {
  validateBinaryQuestionSpec(questionSpec);

  const question = buildQuestion(questionSpec, instance);
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
  /** @type {MapStore<Handle<'Voter'>,RecordedBallot> } */
  const allBallots = makeScalarMapStore('voterHandle');

  const countVotes = () => {
    !isOpen || Fail`can't count votes while the election is open`;

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
      /** @type {OutcomeRecord} */
      const voteOutcome = {
        question: details.questionHandle,
        outcome: 'fail',
        reason: 'No quorum',
      };
      E(publisher).publish(voteOutcome);
      return;
    }

    if (tally[0] > tally[1]) {
      outcomePromise.resolve(positions[0]);
    } else if (tally[1] > tally[0]) {
      outcomePromise.resolve(positions[1]);
    } else {
      outcomePromise.resolve(questionSpec.tieOutcome);
    }

    // XXX if we should distinguish ties, publish should be called in if above
    E.when(outcomePromise.promise, position => {
      /** @type {OutcomeRecord} */
      const voteOutcome = {
        question: details.questionHandle,
        position,
        outcome: 'win',
      };
      return E(publisher).publish(voteOutcome);
    });
  };

  const closeFacet = makeExo(
    'BinaryVoteCounter close',
    BinaryVoteCounterCloseI,
    {
      closeVoting() {
        isOpen = false;
        countVotes();
      },
    },
  );

  const creatorFacet = makeExo(
    'BinaryVoteCounter creator',
    BinaryVoteCounterAdminI,
    {
      submitVote(voterHandle, chosenPositions, shares = 1n) {
        assert(chosenPositions.length === 1, 'only 1 position allowed');
        const [position] = chosenPositions;
        positionIncluded(positions, position) ||
          Fail`The specified choice is not a legal position: ${position}.`;

        // CRUCIAL: If the voter cast a valid ballot, we'll record it, but we need
        // to make sure that each voter's vote is recorded only once.
        const completedBallot = harden({ chosen: position, shares });
        allBallots.has(voterHandle)
          ? allBallots.set(voterHandle, completedBallot)
          : allBallots.init(voterHandle, completedBallot);
        return completedBallot;
      },
    },
  );

  const publicFacet = makeExo(
    'BinaryVoteCounter public',
    BinaryVoteCounterPublicI,
    {
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
  );

  return harden({
    creatorFacet,
    publicFacet,
    closeFacet,
  });
};

// The contract wrapper extracts the terms and runs makeBinaryVoteCounter().
// It schedules the closing of the vote, finally inserting the contract
// instance in the publicFacet before returning public and creator facets.

/**
 * @param {ZCF<{questionSpec: QuestionSpec, quorumThreshold: bigint}>} zcf
 * @param {{outcomePublisher: Publisher<OutcomeRecord>}} outcomePublisher
 */
const start = (zcf, { outcomePublisher }) => {
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
    outcomePublisher,
  );

  scheduleClose(questionSpec.closingRule, () => closeFacet.closeVoting());

  return { publicFacet, creatorFacet };
};

harden(start);
harden(makeBinaryVoteCounter);

export { makeBinaryVoteCounter, start };
