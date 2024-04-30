import { EmptyProposalShape } from '@agoric/zoe/src/typeGuards.js';
import { E } from '@endo/eventual-send';
import { deeplyFulfilled, Far } from '@endo/marshal';

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {VoteCounterCreatorFacet, VoteCounterPublicFacet, QuestionSpec, OutcomeRecord, AddQuestion, AddQuestionReturn} from './types.js';
 */

/**
 * @typedef {object} QuestionRecord
 * @property {ERef<VoteCounterCreatorFacet>} voteCap
 * @property {VoteCounterPublicFacet} publicFacet
 * @property {import('@agoric/time').Timestamp} deadline
 */

/**
 * Start up a new Counter for a question
 *
 * @param {ZCF} zcf
 * @param {QuestionSpec} questionSpec
 * @param {unknown} quorumThreshold
 * @param {ERef<Installation>} voteCounter
 * @param {MapStore<Handle<'Question'>, QuestionRecord>} questionStore
 * @param {Publisher<unknown>} questionsPublisher
 * @param {Publisher<OutcomeRecord>} outcomePublisher
 * @returns {Promise<AddQuestionReturn>}
 */
const startCounter = async (
  zcf,
  questionSpec,
  quorumThreshold,
  voteCounter,
  questionStore,
  questionsPublisher,
  outcomePublisher,
) => {
  const voteCounterTerms = {
    questionSpec,
    electorate: zcf.getInstance(),
    quorumThreshold,
  };

  const { deadline } = questionSpec.closingRule;
  // facets of the voteCounter. creatorInvitation and adminFacet not used
  /** @type {{ creatorFacet: VoteCounterCreatorFacet, publicFacet: VoteCounterPublicFacet, instance: Instance }} */
  const { creatorFacet, publicFacet, instance } = await E(
    zcf.getZoeService(),
  ).startInstance(
    voteCounter,
    {},
    voteCounterTerms,
    { outcomePublisher },
    `voteCounter.${deadline}`,
  );
  const details = await E(publicFacet).getDetails();
  questionsPublisher.publish(details);
  const questionHandle = details.questionHandle;

  const voteCounterFacets = { voteCap: creatorFacet, publicFacet, deadline };

  questionStore.init(questionHandle, harden(voteCounterFacets));

  return { creatorFacet, publicFacet, instance, deadline, questionHandle };
};

/** @param {MapStore<Handle<'Question'>, QuestionRecord>} questionStore */
const getOpenQuestions = async questionStore => {
  const isOpenPQuestions = [...questionStore.entries()].map(
    ([key, { publicFacet }]) => {
      return [E(publicFacet).isOpen(), key];
    },
  );

  const isOpenQuestions = await deeplyFulfilled(harden(isOpenPQuestions));
  return isOpenQuestions
    .filter(([open, _key]) => open)
    .map(([_open, key]) => key);
};

/**
 * @param {ERef<Handle<'Question'>>} questionHandleP
 * @param {MapStore<Handle<'Question'>, QuestionRecord>} questionStore
 */
const getQuestion = (questionHandleP, questionStore) =>
  E.when(questionHandleP, questionHandle =>
    E(questionStore.get(questionHandle).publicFacet).getQuestion(),
  );

/**
 * @param {ZCF} zcf
 * @param {AddQuestion} addQuestion
 */
const getPoserInvitation = (zcf, addQuestion) => {
  const questionPoserHandler = seat => {
    seat.exit();
    return Far(`questionPoser`, { addQuestion });
  };
  return zcf.makeInvitation(
    questionPoserHandler,
    `questionPoser`,
    undefined,
    EmptyProposalShape,
  );
};

harden(startCounter);
harden(getOpenQuestions);
harden(getQuestion);
harden(getPoserInvitation);

export { startCounter, getOpenQuestions, getQuestion, getPoserInvitation };
