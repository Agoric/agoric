import type { RetryOptions } from '../tools/sleep.js';

/**
 * Wait up to 90 seconds to ensure staking rewards are available.
 *
 * While we expect staking rewards to be available after a
 * single block (~5-12 seconds for most chains), this provides additional
 * padding after observed failures in CI
 * (https://github.com/Agoric/agoric-sdk/issues/9934).
 *
 * A more robust approach might consider Distribution params and the
 * {@link FAUCET_POUR} constant to determine how many blocks it should take for
 * rewards to be available.
 */
export const STAKING_REWARDS_TIMEOUT: RetryOptions = {
  retryIntervalMs: 5000,
  maxRetries: 18,
};

/**
 * Wait up to 2 minutes to ensure:
 * - IBC Transfer from LocalAccount -> ICA Account Completes
 * - Delegation from ICA Account (initiated from SwingSet) Completes
 * - Delegations are visible via LCD (API Endpoint)
 *
 * Most of the time this finishes in <7 seconds, but other times it
 * appears to take much longer.
 */
export const AUTO_STAKE_IT_DELEGATIONS_TIMEOUT: RetryOptions = {
  retryIntervalMs: 5000,
  maxRetries: 24,
};

/**
 * Wait up to 2 minutes to ensure:
 * - ICA Account is created
 * - ICQ Connection is established (in some instances)
 * - Query is executed (sometimes local, sometimes via ICQ)
 */
export const MAKE_ACCOUNT_AND_QUERY_BALANCE_TIMEOUT: RetryOptions = {
  retryIntervalMs: 5000,
  maxRetries: 24,
};

export const TWO_MINUTES: RetryOptions = {
  retryIntervalMs: 5000,
  maxRetries: 24,
};
