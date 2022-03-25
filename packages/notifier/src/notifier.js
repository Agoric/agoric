// @ts-check
/// <reference types="ses"/>

import { assert } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeAsyncIterableFromNotifier } from './asyncIterableAdaptor.js';

import './types.js';

/**
 * @template T
 * @param {ERef<BaseNotifier<T> | NotifierInternals<T>>} sharableInternalsP
 * @returns {AsyncIterable<T> & SharableNotifier<T>}
 */
export const makeNotifier = sharableInternalsP => {
  const asyncIterable = makeAsyncIterableFromNotifier(sharableInternalsP);

  return Far('notifier', {
    ...asyncIterable,

    /**
     * Use this to distribute a Notifier efficiently over the network, by
     * obtaining this from the Notifier to be replicated, and applying
     * `makeNotifier` to it at the new site to get an equivalent local Notifier
     * at that site.
     */
    getSharableNotifierInternals: () => sharableInternalsP,
  });
};

/**
 * Produces a pair of objects, which allow a service to produce a stream of
 * update promises.
 *
 * The initial state argument has to be truly optional even though it can be any
 * first class value including `undefined`. We need to distinguish the presence
 * vs the absence of it, which we cannot do with the optional argument syntax.
 * Rather we use the arity of the `args` array.
 *
 * If no initial state is provided to `makeNotifierKit`, then it starts without
 * an initial state. Its initial state will instead be the state of the first update.
 *
 * @template T
 * @param {[] | [T]} args The first state to be returned
 * @returns {NotifierRecord<T>} The notifier and updater
 */
export const makeNotifierKit = (...args) => {
  /** @type {PromiseRecord<UpdateRecord<T>> | undefined} */
  let optNextPromiseKit;
  /** @type {UpdateCount} */
  let currentUpdateCount = 1; // avoid falsy numbers
  /** @type {UpdateRecord<T> | undefined} */
  let currentResponse;

  const hasState = () => currentResponse !== undefined;

  const final = () => currentUpdateCount === undefined;

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
      if (!optNextPromiseKit) {
        optNextPromiseKit = makePromiseKit();
      }
      return optNextPromiseKit.promise;
    },
  });

  const notifier = Far('notifier', {
    ...makeNotifier(baseNotifier),
    ...baseNotifier,
  });

  const updater = Far('updater', {
    updateState(state) {
      if (final()) {
        throw new Error('Cannot update state after termination.');
      }

      // become hasState() && !final()
      assert(currentUpdateCount);
      currentUpdateCount += 1;
      currentResponse = harden({
        value: state,
        updateCount: currentUpdateCount,
      });
      if (optNextPromiseKit) {
        optNextPromiseKit.resolve(currentResponse);
        optNextPromiseKit = undefined;
      }
    },

    finish(finalState) {
      if (final()) {
        throw new Error('Cannot finish after termination.');
      }

      // become hasState() && final()
      currentUpdateCount = undefined;
      currentResponse = harden({
        value: finalState,
        updateCount: currentUpdateCount,
      });
      if (optNextPromiseKit) {
        optNextPromiseKit.resolve(currentResponse);
        optNextPromiseKit = undefined;
      }
    },

    fail(reason) {
      if (final()) {
        throw new Error('Cannot fail after termination.');
      }

      // become !hasState() && final()
      currentUpdateCount = undefined;
      currentResponse = undefined;
      if (!optNextPromiseKit) {
        optNextPromiseKit = makePromiseKit();
      }
      // Don't trigger Node.js's UnhandledPromiseRejectionWarning
      optNextPromiseKit.promise.catch(_ => {});
      optNextPromiseKit.reject(reason);
    },
  });

  if (args.length >= 1) {
    updater.updateState(args[0]);
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

  /** @type {Promise<UpdateRecord<T>> | undefined} */
  let optNextPromise;
  /** @type {UpdateCount} */
  let currentUpdateCount = 1; // avoid falsy numbers
  /** @type {UpdateRecord<T> | undefined} */
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

  return Far('notifier', {
    // Don't leak the original asyncIterableP since it may be remote and we also
    // want the same semantics for this exposed iterable and the baseNotifier.
    ...makeAsyncIterableFromNotifier(baseNotifier),
    ...baseNotifier,

    /**
     * Use this to distribute a Notifier efficiently over the network, by
     * obtaining this from the Notifier to be replicated, and applying
     * `makeNotifier` to it at the new site to get an equivalent local Notifier
     * at that site.
     */
    getSharableNotifierInternals: () => baseNotifier,
  });
};
harden(makeNotifierFromAsyncIterable);
