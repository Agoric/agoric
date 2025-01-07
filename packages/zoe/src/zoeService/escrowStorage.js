import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { q, Fail } from '@endo/errors';
import { deeplyFulfilledObject, objectMap } from '@agoric/internal';
import { provideDurableWeakMapStore } from '@agoric/vat-data';

/// <reference path="./types.js" />
import './internal-types.js';

import { cleanKeywords } from '../cleanProposal.js';

/**
 * Store the pool purses whose purpose is to escrow assets, with one
 * purse per brand.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const provideEscrowStorage = baggage => {
  /** @type {WeakMapStore<Brand, Purse>} */
  const brandToPurse = provideDurableWeakMapStore(baggage, 'brandToPurse');

  /** @type {CreatePurse} */
  const createPurse = (issuer, brand) => {
    if (brandToPurse.has(brand)) {
      return undefined;
    }
    return E.when(
      E(issuer).makeEmptyPurse(),
      purse => {
        // Check again after the promise resolves
        if (!brandToPurse.has(brand)) {
          brandToPurse.init(brand, purse);
        }
      },
      err =>
        Fail`A purse could not be created for brand ${brand} because: ${err}`,
    );
  };

  /**
   * @type {ProvideLocalPurse}
   */
  const provideLocalPurse = (issuer, brand) => {
    if (brandToPurse.has(brand)) {
      return /** @type {Purse} */ (brandToPurse.get(brand));
    } else {
      const localPurse = issuer.makeEmptyPurse();
      brandToPurse.init(brand, localPurse);
      return localPurse;
    }
  };

  /** @type {WithdrawPayments} */
  const withdrawPayments = allocation =>
    objectMap(allocation, async amount =>
      E(brandToPurse.get(amount.brand)).withdraw(amount),
    );

  /**
   *
   *  Only used internally. Actually deposit a payment or promise for payment.
   *
   * @param {ERef<Payment>} paymentP
   * @param {Amount} amount
   * @returns {Promise<Amount>}
   */
  const doDepositPayment = async (paymentP, amount) => {
    const purse = brandToPurse.get(amount.brand);
    return E.when(paymentP, async payment => E(purse).deposit(payment, amount));
  };

  // Proposal is cleaned, but payments are not

  /** @type {DepositPayments} */
  const depositPayments = async (proposal, payments) => {
    const { give, want } = proposal;
    const giveKeywords = Object.keys(give);
    const paymentKeywords = cleanKeywords(payments);

    // Assert that all of the payment keywords are present in the give
    // keywords. Proposal.give keywords that do not have matching payments will
    // be caught in the deposit step.
    for (const keyword of paymentKeywords) {
      giveKeywords.includes(keyword) ||
        Fail`The ${q(
          keyword,
        )} keyword in the paymentKeywordRecord was not a keyword in proposal.give, which had keywords: ${q(
          giveKeywords,
        )}`;
    }

    // If any of these deposits hang or fail, then this `await` also
    // hangs or fails, the offer does not succeed, and any funds that
    // were deposited into the pool purses are lost. We have a ticket
    // for giving the user a refund of what was already deposited, and
    // offer safety and payout liveness are still meaningful as long
    // as issuers are well-behaved. For more, see
    // https://github.com/Agoric/agoric-sdk/issues/1271
    const depositPs = objectMap(give, async (amount, keyword) => {
      payments[keyword] !== undefined ||
        Fail`The ${q(
          keyword,
        )} keyword in proposal.give did not have an associated payment in the paymentKeywordRecord, which had keywords: ${q(
          paymentKeywords,
        )}`;
      return doDepositPayment(payments[keyword], amount);
    });
    const deposits = await deeplyFulfilledObject(depositPs);

    const initialAllocation = harden({
      ...objectMap(want, amount => AmountMath.makeEmptyFromAmount(amount)),
      // Deposits should win in case of overlapping give/want keywords
      // (which are not allowed as of 2024-01).
      ...deposits,
    });

    return initialAllocation;
  };

  return {
    createPurse, // createPurse does not return a purse
    provideLocalPurse,
    withdrawPayments,
    depositPayments,
  };
};
