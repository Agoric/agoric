import { E, Far } from '@endo/far';
import { DEFAULT_KEEP_POLLING } from './defaults.js';

/**
 * Just return an unspecified allegedValue every poll period.
 *
 * @param {import('./types.js').Leader} leader
 * @returns {Promise<import('./types.js').Follower<import('./types.js').CastingChange>>}
 */
export const makePollingChangeFollower = async leader => {
  const { keepPolling = DEFAULT_KEEP_POLLING } = await E(leader).getOptions();

  const iterable = Far('polling change follower iterable', {
    [Symbol.asyncIterator]: () => {
      /** @type {Promise<boolean> | undefined} */
      let nextPollPromise;
      return Far('polling change follower iterator', {
        next: async () => {
          if (!nextPollPromise) {
            nextPollPromise = keepPolling('polling change follower').then(
              async cont => {
                if (cont) {
                  return E(leader)
                    .jitter('polling change follower')
                    .then(() => cont);
                }
                return cont;
              },
            );
          }
          const keepGoing = await nextPollPromise;
          nextPollPromise = undefined;
          const change = harden({
            // Make no warrant as to the values.
            values: [],
          });
          return harden({
            value: change,
            done: !keepGoing,
          });
        },
      });
    },
  });

  return Far('polling change follower', {
    getLatestIterable: async () => iterable,
    getEachIterable: async () => iterable,
    getReverseIterable: async () => {
      throw Error('not implemented for polling change follower');
    },
  });
};
