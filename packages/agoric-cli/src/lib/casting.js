// @ts-check

import { delay, exponentialBackoff, randomBackoff } from '@agoric/casting';

// TODO: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
/**
 * @param {{log: (...args: any) => void, sleep: number, jitter: number }} config
 * @returns {import('@agoric/casting').LeaderOptions}
 */
export const makeLeaderOptions = ({ log, sleep, jitter }) => {
  return {
    retryCallback: async (where, e, attempt) => {
      const backoff = Math.ceil(exponentialBackoff(attempt));
      log(
        `Retrying ${where} in ${backoff}ms due to:`,
        e,
        Error(`attempt #${attempt}`),
      );
      return delay(backoff);
    },
    keepPolling: async where => {
      if (!sleep) {
        return true;
      }
      const backoff = Math.ceil(sleep * 1_000);
      log(`Repeating ${where} after ${backoff}ms`);
      await delay(backoff);
      return true;
    },
    jitter: async where => {
      if (!jitter) {
        return undefined;
      }
      const backoff = Math.ceil(randomBackoff(jitter * 1_000));
      log(`Jittering ${where} for ${backoff}ms`);
      return delay(backoff);
    },
  };
};
harden(makeLeaderOptions);
