import { E, Far } from '@endo/far';

/**
 * @import {ERef} from '@endo/far';
 */

export { subscribeEach, subscribeLatest } from '@agoric/notifier/subscribe.js';

/**
 * @template TIn
 * @template TOut
 * @param {AsyncIterable<TIn>} iterable
 * @param {(value: TIn) => TOut} transform
 * @returns {AsyncIterable<TOut>}
 */
export const mapAsyncIterable = (iterable, transform) => {
  async function* transformGenerator() {
    for await (const value of iterable) {
      yield transform(value);
    }
  }
  harden(transformGenerator);
  return transformGenerator();
};

/**
 * TODO: Remove this function when we have an @endo/publish-kit that suppports pull topics
 *
 * @template T
 * @param {ERef<import('./types.js').Follower<T>>} follower
 */
export const iterateLatest = follower =>
  // For now, just pass through the iterable.
  Far('iterateLatest iterable', {
    /** @returns {AsyncIterator<T>} */
    [Symbol.asyncIterator]: () => {
      const latestIterable = E(follower).getLatestIterable();
      const iterator = E(latestIterable)[Symbol.asyncIterator]();
      return Far('iterateLatest iterator', {
        next: () => E(iterator).next(),
      });
    },
  });

/**
 * TODO: Remove this function when we have an @endo/publish-kit that suppports pull topics
 *
 * @template T
 * @param {ERef<import('./types.js').Follower<T>>} follower
 * @param {import('./types.js').IterateEachOptions} [options]
 */
export const iterateEach = (follower, options) =>
  // For now, just pass through the iterable.
  Far('iterateEach iterable', {
    /** @returns {AsyncIterator<T>} */
    [Symbol.asyncIterator]: () => {
      const eachIterable = E(follower).getEachIterable(options);
      const iterator = E(eachIterable)[Symbol.asyncIterator]();
      return Far('iterateEach iterator', {
        next: () => E(iterator).next(),
      });
    },
  });

/**
 * @template T
 * @param {ERef<import('./types.js').Follower<T>>} follower
 * @param {import('./types.js').IterateEachOptions} [options]
 */
export const iterateReverse = (follower, options) =>
  // For now, just pass through the iterable.
  Far('iterateReverse iterable', {
    /** @returns {AsyncIterator<T>} */
    [Symbol.asyncIterator]: () => {
      const eachIterable = E(follower).getReverseIterable(options);
      const iterator = E(eachIterable)[Symbol.asyncIterator]();
      return Far('iterateEach iterator', {
        next: () => E(iterator).next(),
      });
    },
  });
