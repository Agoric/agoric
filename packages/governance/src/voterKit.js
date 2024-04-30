import { M, prepareExoClassKit } from '@agoric/vat-data';
import { defineDurableHandle } from '@agoric/zoe/src/makeHandle.js';
import { E } from '@endo/eventual-send';
import { PositionShape, QuestionHandleShape } from './typeGuards.js';

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {VoteCounterCreatorFacet, VoteCounterPublicFacet, QuestionSpec, OutcomeRecord, AddQuestion, AddQuestionReturn, CompletedBallet, Position} from './types.js';
 */

const VoterI = M.interface('voter', {
  castBallotFor: M.call(QuestionHandleShape, M.arrayOf(PositionShape)).returns(
    M.promise(),
  ),
});

const InvitationMakerI = M.interface('invitationMaker', {
  makeVoteInvitation: M.call(
    M.arrayOf(PositionShape),
    QuestionHandleShape,
  ).returns(M.promise()),
});

/**
 * Make a kit suitable for returning to a voter invited to a committee.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {object} powers
 * @param {ZCF} powers.zcf
 * @param {(questionHandle: Handle<'Question'>, voterHandle: Handle<'Voter'>, chosenPositions: Position[], weight: bigint) => ERef<CompletedBallet>} powers.submitVote
 */
export const prepareVoterKit = (baggage, { submitVote, zcf }) => {
  const makeVoterHandle = defineDurableHandle(baggage, 'Voter');
  const makeVoterKit = prepareExoClassKit(
    baggage,
    'VoterKit',
    { voter: VoterI, invitationMakers: InvitationMakerI },
    id => {
      const voterHandle = makeVoterHandle();
      return { id, voterHandle };
    },
    {
      voter: {
        castBallotFor(questionHandle, positions, weight = 1n) {
          const { voterHandle } = this.state;
          return E(submitVote)(questionHandle, voterHandle, positions, weight);
        },
      },
      invitationMakers: {
        makeVoteInvitation(positions, questionHandle) {
          const { voter } = this.facets;
          const continuingVoteHandler = cSeat => {
            cSeat.exit();
            return voter.castBallotFor(questionHandle, positions);
          };

          return zcf.makeInvitation(continuingVoteHandler, 'vote');
        },
      },
    },
  );
  return makeVoterKit;
};
harden(prepareVoterKit);
