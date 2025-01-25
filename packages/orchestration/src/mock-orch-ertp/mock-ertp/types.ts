import type { ERef } from '@endo/eventual-send';
import type { CopySet, Key, Pattern } from '@endo/patterns';
import type { LatestTopic } from '@agoric/notifier';

import type {
  Amount,
  Brand,
  Payment,
  DepositFacetReceive,
  DepositFacet,
  PurseMethods,
} from '@agoric/ertp';

/** @see {DepositFacetReceive} */
export type MockDepositFacetReceive = (
  payment: Payment,
  optAmountShape?: Pattern,
) => ERef<Amount>;

/** @see {DepositFacet} */
export type MockDepositFacet = {
  /**
   * Deposit all the contents of payment
   * into the purse that made this facet, returning the amount. If the optional
   * argument `optAmount` does not equal the amount of digital assets in the
   * payment, throw an error.
   *
   * If payment is a promise, throw an error.
   */
  receive: MockDepositFacetReceive;
};

/**
 * Purses hold amount of
 *   digital assets of the same brand, but unlike Payments, they are not meant
 *   to be sent to others. To transfer digital assets, a Payment should be
 *   withdrawn from a Purse. The amount of digital assets in a purse can change
 *   through the action of deposit() and withdraw().
 *
 * @see {PurseMethods}
 */
export type MockPurse = {
  /**
   * Get the alleged Brand for this
   * Purse
   */
  getAllegedBrand: () => Brand;

  /**
   * Get the amount contained in
   * this purse + all payments still in the recoverySet at this moment
   */
  getCurrentFullBalance: () => ERef<Amount>;

  /**
   * Get the amount contained all payments still in the recoverySet at this moment
   */
  getCurrentEncumberedBalance: () => Amount;

  /**
   * Get the amount contained in
   * this purse.
   */
  getCurrentUnencumberedBalance: () => ERef<Amount>;

  /**
   * Get the amount contained in
   * this purse.
   */
  getCurrentAmount: () => ERef<Amount>;

  /**
   * Get a
   * lossy notifier for changes to this purse's balance.
   */
  getCurrentAmountNotifier: () => LatestTopic<Amount>;

  /**
   *   Deposit all the contents of payment into this purse, returning the amount. If
   *   the optional argument `optAmount` does not equal the amount of digital
   *   assets in the payment, throw an error.
   *
   *   If payment is a promise, throw an error.
   */
  deposit: (payment: Payment, optAmountShape?: Pattern) => ERef<Amount>;

  /**
   * Return an object whose
   * `receive` method deposits to the current Purse.
   */
  getDepositFacet: () => MockDepositFacet;

  /**
   * Withdraw amount
   * from this purse into a new Payment.
   */
  withdraw: (amount: Amount) => Payment;

  /**
   * The set of payments
   * withdrawn from this purse that are still live. These are the payments that
   * can still be recovered in emergencies by, for example, depositing into this
   * purse. Such a deposit action is like canceling an outstanding check because
   * you're tired of waiting for it. Once your cancellation is acknowledged, you
   * can spend the assets at stake on other things. Afterwards, if the recipient
   * of the original check finally gets around to depositing it, their deposit
   * fails.
   *
   * Returns an empty set if this issuer does not support recovery sets.
   */
  getRecoverySet: () => CopySet<Payment>;

  /**
   * For use in emergencies, such as
   * coming back from a traumatic crash and upgrade. This deposits all the
   * payments in this purse's recovery set into the purse itself, returning the
   * total amount of assets recovered.
   *
   * Returns an empty amount if this issuer does not support recovery sets.
   */
  recoverAll: () => Amount;
};
