/// <reference types="ses"/>

import { assert } from '@agoric/assert';
import { E, Far } from '@endo/far';

import { makePublishKit } from './publish-kit.js';
import { subscribeLatest } from './subscribe.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {LatestTopic, Notifier, NotifierRecord, PublishKit, Subscriber, UpdateRecord} from './types.js';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * @template T
 * @param {ERef<LatestTopic<T>>} sharableInternalsP
 * @returns {Notifier<T>}
 */
export const makeNotifier = sharableInternalsP => {
  /** @type {Notifier<T>} */
  const notifier = Far('notifier', {
    ...subscribeLatest(sharableInternalsP),
    getUpdateSince: async updateCount =>
      E(sharableInternalsP).getUpdateSince(updateCount),

    /**
     * Use this to distribute a Notifier efficiently over the network,
     * by obtaining this from the Notifier to be replicated, and applying
     * `makeNotifier` to it at the new site to get an equivalent local
     * Notifier at that site.
     */
    getSharableNotifierInternals: async () => sharableInternalsP,
    /**
     * @deprecated
     * Used only by `makeCastingSpecFromRef`.  Instead that function should use
     * the `StoredFacet` API.
     */
    getStoreKey: () => harden({ notifier }),
  });
  return notifier;
};

/**
 * @template T
 * @param {ERef<Subscriber<T>>} subscriber
 * @returns {Notifier<T>}
 */
export const makeNotifierFromSubscriber = subscriber => {
  /**
   * @type {LatestTopic<T>}
   */
  const baseNotifier = harden({
    getUpdateSince: (updateCount = undefined) =>
      E(subscriber).getUpdateSince(updateCount),
  });

  /** @type {Notifier<T>} */
  const notifier = Far('notifier', {
    ...makeNotifier(baseNotifier),
    ...baseNotifier,
  });
  return notifier;
};
harden(makeNotifierFromSubscriber);

/**
 * Produces a pair of objects, which allow a service to produce a stream of
 * update promises.
 *
 * The initial state argument has to be truly optional even though it can
 * be any first class value including `undefined`. We need to distinguish the
 * presence vs the absence of it, which we cannot do with the optional argument
 * syntax. Rather we use the arity of the `initialStateArr` array.
 *
 * If no initial state is provided to `makeNotifierKit`, then it starts without
 * an initial state. Its initial state will instead be the state of the first
 * update.
 *
 * @template T
 * @param {[] | [T]} initialStateArr the first state to be returned (typed as rest array to permit `undefined`)
 * @returns {NotifierRecord<T>} the notifier and updater
 */
export const makeNotifierKit = (...initialStateArr) => {
  /** @type {PublishKit<T>} */
  const { publisher, subscriber } = makePublishKit();

  const notifier = makeNotifierFromSubscriber(subscriber);

  const updater = Far('updater', {
    updateState: state => publisher.publish(state),
    finish: completion => publisher.finish(completion),
    fail: reason => publisher.fail(reason),
  });

  assert(initialStateArr.length <= 1, 'too many arguments');
  if (initialStateArr.length === 1) {
    updater.updateState(initialStateArr[0]);
  }

  // notifier facet is separate so it can be handed out while updater
  // is tightly held
  return harden({ notifier, updater });
};

/**
 * Adaptor from async iterable to notifier.
 *
 * @deprecated The resulting notifier is lossless, which is not desirable.
 * Prefer makeNotifierFromSubscriber, and refer to
 * https://github.com/Agoric/agoric-sdk/issues/5413 and
 * https://github.com/Agoric/agoric-sdk/pull/5695 for context.
 *
 * @template T
 * @param {ERef<AsyncIterable<T>>} asyncIterableP
 * @returns {Notifier<T>}
 */
export const makeNotifierFromAsyncIterable = asyncIterableP => {
  const iteratorP = E(asyncIterableP)[Symbol.asyncIterator]();

  /** @type {Promise<UpdateRecord<T>>|undefined} */
  let optNextPromise;
  let currentUpdateCount = 0n;
  /** @type {ERef<UpdateRecord<T>>|undefined} */
  let currentResponse;
  let final = false;

  /**
   * @type {LatestTopic<T>}
   */
  const baseNotifier = Far('baseNotifier', {
    getUpdateSince(updateCount = -1n) {
      if (updateCount < currentUpdateCount) {
        if (currentResponse) {
          return Promise.resolve(currentResponse);
        }
      } else if (updateCount !== currentUpdateCount) {
        throw Error(
          'getUpdateSince argument must be a previously-issued updateCount.',
        );
      }

      // Return a final response if we have one, otherwise a promise for the next state.
      if (final) {
        assert(currentResponse !== undefined);
        return Promise.resolve(currentResponse);
      }
      if (!optNextPromise) {
        const nextIterResultP = E(iteratorP).next();
        optNextPromise = E.when(
          nextIterResultP,
          ({ done, value }) => {
            assert(!final);
            if (done) {
              final = true;
            }
            currentUpdateCount += 1n;
            currentResponse = harden({
              value,
              updateCount: done ? undefined : currentUpdateCount,
            });
            optNextPromise = undefined;
            return currentResponse;
          },
          _reason => {
            final = true;
            currentResponse =
              /** @type {Promise<UpdateRecord<T>>} */
              (nextIterResultP);
            optNextPromise = undefined;
            return currentResponse;
          },
        );
      }
      return optNextPromise;
    },
  });

  /** @type {Notifier<T>} */
  const notifier = Far('notifier', {
    // Don't leak the original asyncIterableP since it may be remote and we also
    // want the same semantics for this exposed iterable and the baseNotifier.
    ...makeNotifier(baseNotifier),
    ...baseNotifier,
  });
  return notifier;
};
harden(makeNotifierFromAsyncIterable);
