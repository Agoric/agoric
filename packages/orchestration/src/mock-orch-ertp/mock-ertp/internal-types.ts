import type { ERef } from '@endo/eventual-send';

import type { WeakMapStore, SetStore } from '@agoric/store';

import type { Payment, Amount } from '@agoric/ertp';
import type { MockOrchAccount } from '../mock-orch/types.ts';
import type { MockPurse } from './types.js';

export type PaymentLedgerMap = WeakMapStore<Payment, Amount>;

export type RecoverySet = SetStore<Payment>;

export type RecoveryFacet = {
  /**
   *
   */
  initPayment: (payment: Payment) => void;

  /**
   *
   */
  deletePayment: (payment: Payment) => void;

  /**
   * Awkward name because `getRecoverSet` is already a method of purse that
   * return a copySet.
   */
  getRecoverySetStore: () => RecoverySet;

  /**
   * Get the amount contained in all payments still in the recoverySet at
   * this moment
   */
  getCurrentEncumberedBalance: () => Amount;

  /**
   *
   */
  encumber: (amount: Amount) => void;

  /**
   *
   */
  unencumber: (amount: Amount) => void;

  /**
   *
   */
  getOrchAcct: () => ERef<MockOrchAccount>;
};

export type PaymentRecoveryMap = WeakMapStore<Payment, RecoveryFacet>;

export type MockIssuerAdmin = {
  makePurse: (orchAcctP: ERef<MockOrchAccount>) => ERef<MockPurse>;
};
