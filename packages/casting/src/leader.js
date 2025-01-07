import { E, Far } from '@endo/far';
import { DEFAULT_RETRY_CALLBACK, DEFAULT_JITTER } from './defaults.js';
import { shuffle } from './shuffle.js';
import { makePollingChangeFollower } from './change-follower.js';

/**
 * Create a chain leader that rotates through a list of endpoints.
 *
 * @param {string[]} endpoints
 * @param {import('./types.js').LeaderOptions} leaderOptions
 */
export const makeRoundRobinLeader = (endpoints, leaderOptions = {}) => {
  const { retryCallback = DEFAULT_RETRY_CALLBACK, jitter = DEFAULT_JITTER } =
    leaderOptions;

  // Shuffle the RPC addresses, so that we don't always hit the same one as all
  // our peers.
  shuffle(endpoints);

  let lastRespondingEndpointIndex = 0;
  let thisAttempt = 0;
  let retrying;

  /** @type {import('./types.js').Leader} */
  const leader = Far('round robin leader', {
    getOptions: () => leaderOptions,
    jitter: async where => jitter && jitter(where),
    retry: async (where, err, attempt) => {
      if (retryCallback) {
        return retryCallback(where, err, attempt);
      }
      throw err;
    },
    watchCasting: async _castingSpecP => pollingChangeFollower,
    /**
     * @template T
     * @param {string} where
     * @param {(endpoint: string) => Promise<T>} callback
     */
    mapEndpoints: async (where, callback) => {
      where = `${where} (round-robin endpoints)`;
      /** @type {Promise<T[]>} */
      const p = new Promise((resolve, reject) => {
        let endpointIndex = lastRespondingEndpointIndex;

        const retry = err => {
          if (!retrying) {
            const attempt = thisAttempt;
            retrying = E(leader)
              .retry(where, err, attempt)
              .then(() => {
                endpointIndex = (endpointIndex + 1) % endpoints.length;
                retrying = null;
              });
          }

          retrying
            .then(async () => jitter && jitter(where))
            .then(applyOne, reject);
          thisAttempt += 1;
        };

        const applyOne = () => {
          Promise.resolve()
            .then(async () => callback(endpoints[endpointIndex]))
            .then(res => {
              resolve(harden([res]));
              lastRespondingEndpointIndex = endpointIndex;
              thisAttempt = 0;
            }, retry);

          // Don't return to prevent a promise chain.
        };

        applyOne();
      });
      return p;
    },
  });

  const pollingChangeFollower = makePollingChangeFollower(leader);
  return leader;
};
