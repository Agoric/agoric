// @ts-check
/// <reference types="ses"/>

import { assert } from '@agoric/assert';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeAsyncIterableFromNotifier } from './asyncIterableAdaptor.js';

import './types.js';
import { makeEmptyPublishKit } from './publish-kit.js';

/**
 * @template T
 * @param {ERef<BaseNotifier<T> | NotifierInternals<T>>} sharableInternalsP
 * @returns {AsyncIterable<T> & SharableNotifier<T>}
 */
export const makeNotifier = sharableInternalsP => {
  const asyncIterable = makeAsyncIterableFromNotifier(sharableInternalsP);

  /** @type {AsyncIterable<T> & SharableNotifier<T>} */
  const notifier = Far('notifier', {
    ...asyncIterable,

    /**
     * Use this to distribute a Notifier efficiently over the network,
     * by obtaining this from the Notifier to be replicated, and applying
     * `makeNotifier` to it at the new site to get an equivalent local
     * Notifier at that site.
     */
    getSharableNotifierInternals: () => sharableInternalsP,
    getStoreKey: () => harden({ notifier }),
  });
  return notifier;
};

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
  const { publisher, subscriber } = makeEmptyPublishKit();

  const baseNotifier = Far('baseNotifier', {
    // NaN matches nothing
    getUpdateSince(baseUpdateCount = NaN) {
      const basePublishCount = Number.isNaN(baseUpdateCount)
        ? -BigInt(1) // See https://github.com/Agoric/agoric-sdk/issues/5438
        : BigInt(baseUpdateCount);
      return E.when(
        subscriber.subscribeAfter(basePublishCount),
        ({ head: { value, done }, publishCount }) => {
          const updateCount = done ? undefined : Number(publishCount);
          return harden({ value, updateCount });
        },
      );
    },
  });

  const notifier = Far('notifier', {
    ...makeNotifier(baseNotifier),
    ...baseNotifier,
  });

  const updater = Far('updater', {
    updateState: publisher.publish,
    finish: publisher.finish,
    fail: publisher.fail,
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
 * @template T
 * @param {ERef<AsyncIterable<T>>} asyncIterableP
 * @returns {Notifier<T>}
 */
export const makeNotifierFromAsyncIterable = asyncIterableP => {
  const iteratorP = E(asyncIterableP)[Symbol.asyncIterator]();

  /** @type {Promise<UpdateRecord<T>>|undefined} */
  let optNextPromise;
  /** @type {UpdateCount} */
  let currentUpdateCount = 1; // avoid falsy numbers
  /** @type {UpdateRecord<T>|undefined} */
  let currentResponse;

  const hasState = () => currentResponse !== undefined;

  const final = () => currentUpdateCount === undefined;

  /**
   * @template T
   * @type {BaseNotifier<T>}
   */
  const baseNotifier = Far('baseNotifier', {
    // NaN matches nothing
    getUpdateSince(updateCount = NaN) {
      if (
        hasState() &&
        (final() ||
          (currentResponse && currentResponse.updateCount !== updateCount))
      ) {
        // If hasState() and either it is final() or it is
        // not the state of updateCount, return the current state.
        assert(currentResponse !== undefined);
        return Promise.resolve(currentResponse);
      }

      // otherwise return a promise for the next state.
      if (!optNextPromise) {
        const nextIterResultP = E(iteratorP).next();
        optNextPromise = E.when(
          nextIterResultP,
          ({ done, value }) => {
            assert(currentUpdateCount);
            currentUpdateCount = done ? undefined : currentUpdateCount + 1;
            currentResponse = harden({
              value,
              updateCount: currentUpdateCount,
            });
            optNextPromise = undefined;
            return currentResponse;
          },
          _reason => {
            currentUpdateCount = undefined;
            currentResponse = undefined;
            // We know that nextIterResultP is rejected, and we just need any
            // promise rejected by that reason.
            return /** @type {Promise<UpdateRecord<T>>} */ (nextIterResultP);
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
    ...makeAsyncIterableFromNotifier(baseNotifier),
    ...baseNotifier,

    /**
     * Use this to distribute a Notifier efficiently over the network,
     * by obtaining this from the Notifier to be replicated, and applying
     * `makeNotifier` to it at the new site to get an equivalent local
     * Notifier at that site.
     */
    getSharableNotifierInternals: () => baseNotifier,
    getStoreKey: () => harden({ notifier }),
  });
  return notifier;
};
harden(makeNotifierFromAsyncIterable);
