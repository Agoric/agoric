// @ts-check
import '../../exported.js';

import { assert, details as X } from '@agoric/assert';
import { keyEQ, fit } from '@agoric/store';
import { E } from '@endo/eventual-send';
import { makePromiseKit } from '@endo/promise-kit';
import { AssetKind } from '@agoric/ertp';
import { satisfiesWant } from '../contractFacet/offerSafety.js';

export const defaultAcceptanceMsg = `The offer has been accepted. Once the contract has been completed, please check your payout`;

const getKeysSorted = obj =>
  harden(Object.getOwnPropertyNames(obj || {}).sort());

export const assertIssuerKeywords = (zcf, expected) => {
  const { issuers } = zcf.getTerms();
  const actual = getKeysSorted(issuers);
  expected = [...expected]; // in case hardened
  expected.sort();
  assert(
    keyEQ(actual, harden(expected)),
    X`keywords: ${actual} were not as expected: ${expected}`,
  );
};

/**
 * @typedef {Object} ZcfSeatPartial
 * @property {() => ProposalRecord} getProposal
 * @property {() => Allocation} getCurrentAllocation
 */

/**
 * Check whether an update to currentAllocation satisfies proposal.want. Note
 * that this is half of the offer safety check; whether the allocation
 * constitutes a refund is not checked. The update is merged with
 * currentAllocation (update's values prevailing if the keywords are the same)
 * to produce the newAllocation.
 *
 * @param {ZCF} zcf
 * @param {ZcfSeatPartial} seat
 * @param {AmountKeywordRecord} update
 * @returns {boolean}
 */
export const satisfies = (zcf, seat, update) => {
  const currentAllocation = seat.getCurrentAllocation();
  const newAllocation = { ...currentAllocation, ...update };
  const proposal = seat.getProposal();
  return satisfiesWant(proposal, newAllocation);
};

/** @type {Swap} */
export const swap = (zcf, leftSeat, rightSeat) => {
  try {
    rightSeat.decrementBy(harden(leftSeat.getProposal().want));
    leftSeat.incrementBy(harden(leftSeat.getProposal().want));

    leftSeat.decrementBy(harden(rightSeat.getProposal().want));
    rightSeat.incrementBy(harden(rightSeat.getProposal().want));

    zcf.reallocate(leftSeat, rightSeat);
  } catch (err) {
    leftSeat.fail(err);
    rightSeat.fail(err);
    throw err;
  }

  leftSeat.exit();
  rightSeat.exit();
  return defaultAcceptanceMsg;
};

/** @type {SwapExact} */
export const swapExact = (zcf, leftSeat, rightSeat) => {
  try {
    rightSeat.decrementBy(harden(rightSeat.getProposal().give));
    leftSeat.incrementBy(harden(leftSeat.getProposal().want));

    leftSeat.decrementBy(harden(leftSeat.getProposal().give));
    rightSeat.incrementBy(harden(rightSeat.getProposal().want));

    zcf.reallocate(leftSeat, rightSeat);
  } catch (err) {
    leftSeat.fail(err);
    rightSeat.fail(err);
    throw err;
  }

  leftSeat.exit();
  rightSeat.exit();
  return defaultAcceptanceMsg;
};

/**
 * @typedef ExpectedRecord
 * @property {Record<Keyword, null>} [want]
 * @property {Record<Keyword, null>} [give]
 * @property {Partial<Record<keyof ProposalRecord['exit'], null>>} [exit]
 */

/**
 * Check the seat's proposal against `proposalShape`. If the client submits an
 * offer which does not match these expectations, the seat will be exited (and
 * payments refunded).
 *
 * @param {ZCFSeat} seat
 * @param {Pattern} proposalShape
 */
export const fitProposalShape = (seat, proposalShape) =>
  // TODO remove this harden, obligating our caller to harden.
  fit(seat.getProposal(), harden(proposalShape));

/**
 * Check the seat's proposal against an `expected` record that says what shape
 * of proposal is acceptable.
 *
 * This ExpectedRecord is like a Proposal, but the amounts in 'want' and 'give'
 * should be null; the exit clause should specify a rule with null contents. If
 * the client submits an offer which does not match these expectations, the seat
 * will be exited (and payments refunded).
 *
 * @param {ZCFSeat} seat
 * @param {ExpectedRecord} expected
 */
export const assertProposalShape = (seat, expected) => {
  assert.typeof(expected, 'object');
  assert(!Array.isArray(expected), X`Expected must be an non-array object`);
  const assertValuesNull = e => {
    if (e !== undefined) {
      Object.values(e).forEach(value =>
        assert(
          value === null,
          X`The value of the expected record must be null but was ${value}`,
        ),
      );
    }
  };

  // Assert values of the expected record are all null. We do not
  // check the values of the actual proposal.
  assertValuesNull(expected.give);
  assertValuesNull(expected.want);
  assertValuesNull(expected.exit);

  const actual = seat.getProposal();
  const assertKeys = (a, e) => {
    if (e !== undefined) {
      assert(
        keyEQ(getKeysSorted(a), getKeysSorted(e)),
        X`actual ${a} did not match expected ${e}`,
      );
    }
  };
  assertKeys(actual.give, expected.give);
  assertKeys(actual.want, expected.want);
  assertKeys(actual.exit, expected.exit);
};

/* Given a brand, assert that brand is AssetKind.NAT. */
export const assertNatAssetKind = (zcf, brand) => {
  assert(
    zcf.getAssetKind(brand) === AssetKind.NAT,
    X`brand must be AssetKind.NAT`,
  );
};

export const depositToSeatSuccessMsg = `Deposit and reallocation successful.`;

/**
 * Deposit payments such that their amounts are reallocated to a seat. The
 * `amounts` and `payments` records must have corresponding keywords.
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} recipientSeat
 * @param {AmountKeywordRecord} amounts
 * @param {PaymentPKeywordRecord} payments
 * @returns {Promise<string>} `Deposit and reallocation successful.`
 */

export async function depositToSeat(zcf, recipientSeat, amounts, payments) {
  assert(!recipientSeat.hasExited(), 'The recipientSeat cannot have exited.');

  // We will create a temporary offer to be able to escrow our payments
  // with Zoe.
  function reallocateAfterDeposit(tempSeat) {
    // After the assets are deposited, reallocate them onto the recipient seat and
    // exit the temporary seat. Note that the offerResult is the return value of this
    // function, so this synchronous trade must happen before the
    // offerResult resolves.
    tempSeat.decrementBy(harden(amounts));
    recipientSeat.incrementBy(harden(amounts));
    zcf.reallocate(tempSeat, recipientSeat);
    tempSeat.exit();
    return depositToSeatSuccessMsg;
  }
  const invitation = zcf.makeInvitation(
    reallocateAfterDeposit,
    'temporary seat for deposit',
  );
  const proposal = harden({ give: amounts });
  harden(payments);
  // To escrow the payment, we must get the Zoe Service facet and
  // make an offer
  const zoe = zcf.getZoeService();
  const tempUserSeat = E(zoe).offer(invitation, proposal, payments);
  // This will be a promise for the string: `Deposit and reallocation
  // successful.` It will only fulfill after the assets have been
  // successfully reallocated to the recipient seat.
  return E(tempUserSeat).getOfferResult();
}

/**
 * Withdraw payments from a seat. Note that withdrawing the amounts of the
 * payments must not and cannot violate offer safety for the seat. The `amounts`
 * and `payments` records must have corresponding keywords.
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} seat
 * @param {AmountKeywordRecord} amounts
 * @returns {Promise<PaymentPKeywordRecord>}
 */
export async function withdrawFromSeat(zcf, seat, amounts) {
  assert(!seat.hasExited(), 'The seat cannot have exited.');
  const { zcfSeat: tempSeat, userSeat: tempUserSeatP } = zcf.makeEmptySeatKit();
  seat.decrementBy(harden(amounts));
  tempSeat.incrementBy(harden(amounts));
  zcf.reallocate(tempSeat, seat);
  tempSeat.exit();
  return E(tempUserSeatP).getPayouts();
}

/**
 * Save all of the issuers in an issuersKeywordRecord to ZCF, using the method
 * `zcf.saveIssuer`. This does not error if any of the keywords already exist.
 * If the keyword is already present, it is ignored.
 *
 * @param {ZCF} zcf
 * @param {IssuerKeywordRecord} issuerKeywordRecord Issuers to save to ZCF
 */
export async function saveAllIssuers(zcf, issuerKeywordRecord = harden({})) {
  const { issuers } = zcf.getTerms();
  const issuersPSaved = Object.entries(issuerKeywordRecord).map(
    ([keyword, issuer]) => {
      // If the keyword does not yet exist, add it and the
      // associated issuer.
      if (issuers[keyword] === undefined) {
        return zcf.saveIssuer(issuer, keyword);
      }
      return undefined;
    },
  );
  return Promise.all(issuersPSaved);
}

/** @type {MapKeywords} */
export const mapKeywords = (keywordRecord = {}, keywordMapping) => {
  return harden(
    Object.fromEntries(
      Object.entries(keywordRecord).map(([keyword, value]) => {
        if (keywordMapping[keyword] === undefined) {
          return [keyword, value];
        }
        return [keywordMapping[keyword], value];
      }),
    ),
  );
};
/** @type {Reverse} */
const reverse = (keywordRecord = {}) => {
  return harden(
    Object.fromEntries(
      Object.entries(keywordRecord).map(([key, value]) => [value, key]),
    ),
  );
};

/**
 * Make an offer to another contract instance (labeled contractB below),
 * withdrawing the payments for the offer from a seat in the current contract
 * instance (contractA) and depositing the payouts in another seat in the
 * current contract instance (contractA).
 *
 * @param {ZCF} zcf Zoe Contract Facet for contractA
 * @param {ERef<Invitation>} invitation Invitation to contractB
 * @param {KeywordKeywordRecord} [keywordMapping] Mapping of keywords used in
 *   contractA to keywords to be used in contractB. Note that the pathway to
 *   deposit the payout back to contractA reverses this mapping.
 * @param {Proposal} [proposal] The proposal for the offer to be made to contractB
 * @param {ZCFSeat} fromSeat The seat in contractA to take the offer payments from.
 * @param {ZCFSeat} [toSeat=fromSeat] The seat in contractA to deposit the
 *   payout of the offer to. If `toSeat` is not provided, this defaults to the
 *   `fromSeat`.
 * @returns {Promise<{
 *   userSeatPromise: Promise<UserSeat>;
 *   deposited: Promise<AmountKeywordRecord>;
 * }>}
 *   A promise for the userSeat for the offer to the other contract, and a promise
 *   (`deposited`) which resolves when the payout for the offer has been
 *   deposited to the `toSeat`
 */
export const offerTo = async (
  zcf,
  invitation,
  keywordMapping = {},
  proposal,
  // @ts-expect-error A required parameter cannot follow an optional parameter.
  fromSeat,
  toSeat,
) => {
  const definedToSeat = toSeat !== undefined ? toSeat : fromSeat;

  const zoe = zcf.getZoeService();
  const mappingReversed = reverse(keywordMapping);

  const newKeywords =
    proposal !== undefined
      ? mapKeywords(proposal.give, mappingReversed)
      : harden({});

  // the proposal is in the other contract's keywords, but we want to
  // use `proposal.give` to withdraw
  const payments = await withdrawFromSeat(zcf, fromSeat, newKeywords);

  // Map to the other contract's keywords
  const paymentsForOtherContract = mapKeywords(payments, keywordMapping);

  const userSeatPromise = E(zoe).offer(
    invitation,
    proposal,
    paymentsForOtherContract,
  );

  const depositedPromiseKit = makePromiseKit();

  const doDeposit = async payoutPayments => {
    const amounts = await E(userSeatPromise).getCurrentAllocation();

    // Map back to the original contract's keywords
    const mappedAmounts = mapKeywords(amounts, mappingReversed);
    const mappedPayments = mapKeywords(payoutPayments, mappingReversed);
    await depositToSeat(zcf, definedToSeat, mappedAmounts, mappedPayments);
    depositedPromiseKit.resolve(mappedAmounts);
  };

  E(userSeatPromise).getPayouts().then(doDeposit);

  return harden({ userSeatPromise, deposited: depositedPromiseKit.promise });
};

/**
 * Create a wrapped version of zcf that asserts an invariant before performing a
 * reallocation.
 *
 * @param {ZCF} zcf
 * @param {(seats: ZCFSeat[]) => void} assertFn - An assertion that must be true
 *   for the reallocate to occur
 * @returns {ZCF}
 */
export const checkZCF = (zcf, assertFn) => {
  const checkedZCF = harden({
    ...zcf,
    reallocate: (...seats) => {
      assertFn(seats);
      // @ts-ignore The types aren't right for spreading
      zcf.reallocate(...seats);
    },
  });
  return checkedZCF;
};
