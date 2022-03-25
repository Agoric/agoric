// @ts-check

import { AmountMath } from '@agoric/ertp';

/**
 * Helper to perform satisfiesWant and satisfiesGive. Is allocationAmount
 * greater than or equal to requiredAmount for every keyword of giveOrWant?
 *
 * @param {AmountKeywordRecord} giveOrWant
 * @param {AmountKeywordRecord} allocation
 */
const satisfiesInternal = (giveOrWant = {}, allocation) => {
  const isGTEByKeyword = ([keyword, requiredAmount]) => {
    // If there is no allocation for a keyword, we know the giveOrWant
    // is not satisfied without checking further.
    if (allocation[keyword] === undefined) {
      return false;
    }
    const allocationAmount = allocation[keyword];
    return AmountMath.isGTE(allocationAmount, requiredAmount);
  };
  return Object.entries(giveOrWant).every(isGTEByKeyword);
};

/**
 * For this allocation to satisfy what the user wanted, their allocated amounts
 * must be greater than or equal to proposal.want.
 *
 * @param {ProposalRecord} proposal - The rules that accompanied the escrow of
 *   payments that dictate what the user expected to get back from Zoe. A
 *   proposal is a record with keys `give`, `want`, and `exit`. `give` and
 *   `want` are records with keywords as keys and amounts as values. The
 *   proposal is a user's understanding of the contract that they are entering
 *   when they make an offer.
 * @param {AmountKeywordRecord} allocation - A record with keywords as keys and
 *   amounts as values. These amounts are the reallocation to be given to a user.
 */
const satisfiesWant = (proposal, allocation) =>
  satisfiesInternal(proposal.want, allocation);

/**
 * For this allocation to count as a full refund, the allocated amounts must be
 * greater than or equal to what was originally offered (proposal.give).
 *
 * @param {ProposalRecord} proposal - The rules that accompanied the escrow of
 *   payments that dictate what the user expected to get back from Zoe. A
 *   proposal is a record with keys `give`, `want`, and `exit`. `give` and
 *   `want` are records with keywords as keys and amounts as values. The
 *   proposal is a user's understanding of the contract that they are entering
 *   when they make an offer.
 * @param {AmountKeywordRecord} allocation - A record with keywords as keys and
 *   amounts as values. These amounts are the reallocation to be given to a user.
 */
const satisfiesGive = (proposal, allocation) =>
  satisfiesInternal(proposal.give, allocation);

/**
 * `isOfferSafe` checks offer safety for a single offer.
 *
 * Note: This implementation checks whether we fully satisfy `proposal.give`
 * (giving a refund) or whether we fully satisfy `proposal.want`. Both can be
 * fully satisfied.
 *
 * @param {ProposalRecord} proposal - The rules that accompanied the escrow of
 *   payments that dictate what the user expected to get back from Zoe. A
 *   proposal is a record with keys `give`, `want`, and `exit`. `give` and
 *   `want` are records with keywords as keys and amounts as values. The
 *   proposal is a user's understanding of the contract that they are entering
 *   when they make an offer.
 * @param {AmountKeywordRecord} allocation - A record with keywords as keys and
 *   amounts as values. These amounts are the reallocation to be given to a user.
 */
function isOfferSafe(proposal, allocation) {
  return (
    satisfiesGive(proposal, allocation) || satisfiesWant(proposal, allocation)
  );
}

export { isOfferSafe, satisfiesWant };
