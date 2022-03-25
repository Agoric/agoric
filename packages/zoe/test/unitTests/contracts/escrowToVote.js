// @ts-check

import { assert, details as X, q } from '@agoric/assert';
import { Far } from '@endo/marshal';
import { makeStore } from '@agoric/store';
import { AmountMath } from '@agoric/ertp';
// Eventually will be importable from '@agoric/zoe-contract-support'
import {
  assertIssuerKeywords,
  assertProposalShape,
  assertNatAssetKind,
} from '../../../src/contractSupport/index.js';

import '../../../exported.js';

/**
 * This contract implements coin voting. There are two roles: the Secretary, who
 * can determine the question (a string), make voting invitations, and close the
 * election; and the Voters, who can vote YES or NO on the question. The voters
 * can only get the capability to vote by making an offer using a voter
 * invitation and escrowing assets. The brand of assets is determined on
 * contract instantiation through an issuerKeywordRecord. The instantiator gets
 * the only Secretary access through the creatorFacet.
 *
 * @type {ContractStartFn<
 *   undefined,
 *   { closeElection: unknown; makeVoterInvitation: unknown }
 * >}
 */
const start = zcf => {
  const {
    question,
    brands: { Assets: assetsBrand },
  } = zcf.getTerms();
  let electionOpen = true;
  assertIssuerKeywords(zcf, harden(['Assets']));
  assert.typeof(question, 'string');
  assertNatAssetKind(zcf, assetsBrand);

  const seatToResponse = makeStore('seat');

  // We assume the only valid responses are 'YES' and 'NO'
  const assertResponse = response => {
    assert(
      response === 'NO' || response === 'YES',
      X`the answer ${q(response)} was not 'YES' or 'NO'`,
    );
    // Throw an error if the response is not valid, but do not
    // exit the seat. We should allow the voter to recast their vote.
  };

  const voteHandler = voterSeat => {
    assertProposalShape(voterSeat, {
      give: { Assets: null },
    });
    const voter = Far('voter', {
      /**
       * Vote on a particular issue
       *
       * @param {string} response - 'YES' || 'NO'
       */
      vote: response => {
        // Throw if the offer is no longer active, i.e. the user has
        // completed their offer and the assets are no longer escrowed.
        assert(!voterSeat.hasExited(), X`the voter seat has exited`);

        assertResponse(response);

        // Record the response
        if (seatToResponse.has(voterSeat)) {
          seatToResponse.set(voterSeat, response);
        } else {
          seatToResponse.init(voterSeat, response);
        }
        return `Successfully voted '${response}'`;
      },
    });
    return voter;
  };

  const creatorFacet = Far('creatorFacet', {
    closeElection: () => {
      assert(electionOpen, 'the election is already closed');
      // YES | NO to Nat
      const tally = new Map();
      tally.set('YES', AmountMath.makeEmpty(assetsBrand));
      tally.set('NO', AmountMath.makeEmpty(assetsBrand));

      for (const [seat, response] of seatToResponse.entries()) {
        if (!seat.hasExited()) {
          const escrowedAmount = seat.getAmountAllocated('Assets');
          const sumSoFar = tally.get(response);
          tally.set(response, AmountMath.add(escrowedAmount, sumSoFar));
          seat.exit('Thank you for voting');
        }
      }
      electionOpen = false;

      return harden({
        YES: tally.get('YES'),
        NO: tally.get('NO'),
      });
    },
    makeVoterInvitation: () => {
      assert(electionOpen, 'the election is closed');
      return zcf.makeInvitation(voteHandler, 'voter');
    },
  });

  // Return the creatorFacet so that the creator of the
  // contract instance can hand out scarce votes and close the election.

  return harden({ creatorFacet });
};

harden(start);
export { start };
