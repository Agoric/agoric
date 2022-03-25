// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { makeWeakStore } from '@agoric/store';
import { assert, details as X, q } from '@agoric/assert';

import './types.js';
import './internal-types.js';

import { cleanKeywords } from '../cleanProposal.js';
import { arrayToObj, objectMap } from '../objArrayConversion.js';

/** Store the pool purses whose purpose is to escrow assets, with one purse per brand. */
export const makeEscrowStorage = () => {
  /** @type {WeakStore<Brand, ERef<Purse>>} */
  const brandToPurse = makeWeakStore('brand');

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
        assert.fail(
          X`A purse could not be created for brand ${brand} because: ${err}`,
        ),
    );
  };

  /** @type {MakeLocalPurse} */
  const makeLocalPurse = (issuer, brand) => {
    if (brandToPurse.has(brand)) {
      return /** @type {Purse} */ (brandToPurse.get(brand));
    } else {
      const localPurse = issuer.makeEmptyPurse();
      brandToPurse.init(brand, localPurse);
      return localPurse;
    }
  };

  /** @type {WithdrawPayments} */
  const withdrawPayments = allocation => {
    return harden(
      objectMap(allocation, ([keyword, amount]) => {
        const purse = brandToPurse.get(amount.brand);
        return [keyword, E(purse).withdraw(amount)];
      }),
    );
  };

  /**
   * Only used internally. Actually deposit a payment or promise for payment.
   *
   * @param {ERef<Payment>} paymentP
   * @param {Amount} amount
   * @returns {Promise<Amount>}
   */
  const doDepositPayment = (paymentP, amount) => {
    const purse = brandToPurse.get(amount.brand);
    return E.when(paymentP, payment => E(purse).deposit(payment, amount));
  };

  // Proposal is cleaned, but payments are not

  /** @type {DepositPayments} */
  const depositPayments = async (proposal, payments) => {
    const { give, want } = proposal;
    const giveKeywords = Object.keys(give);
    const wantKeywords = Object.keys(want);
    const paymentKeywords = cleanKeywords(payments);

    // Assert that all of the payment keywords are present in the give
    // keywords. Proposal.give keywords that do not have matching payments will
    // be caught in the deposit step.
    paymentKeywords.forEach(keyword => {
      assert(
        giveKeywords.includes(keyword),
        X`The ${q(
          keyword,
        )} keyword in the paymentKeywordRecord was not a keyword in proposal.give, which had keywords: ${q(
          giveKeywords,
        )}`,
      );
    });

    const proposalKeywords = harden([...giveKeywords, ...wantKeywords]);

    // If any of these deposits hang or fail, then depositPayments
    // hangs or fails, the offer does not succeed, and any funds that
    // were deposited into the pool purses are lost. We have a ticket
    // for giving the user a refund of what was already deposited, and
    // offer safety and payout liveness are still meaningful as long
    // as issuers are well-behaved. For more, see
    // https://github.com/Agoric/agoric-sdk/issues/1271
    const amountsDeposited = await Promise.all(
      giveKeywords.map(keyword => {
        assert(
          payments[keyword] !== undefined,
          X`The ${q(
            keyword,
          )} keyword in proposal.give did not have an associated payment in the paymentKeywordRecord, which had keywords: ${q(
            paymentKeywords,
          )}`,
        );
        return doDepositPayment(payments[keyword], give[keyword]);
      }),
    );

    const emptyAmountsForWantKeywords = wantKeywords.map(keyword =>
      AmountMath.makeEmptyFromAmount(want[keyword]),
    );

    const initialAllocation = arrayToObj(
      [...amountsDeposited, ...emptyAmountsForWantKeywords],
      proposalKeywords,
    );

    return initialAllocation;
  };

  return {
    createPurse, // createPurse does not return a purse
    makeLocalPurse,
    withdrawPayments,
    depositPayments,
  };
};
