/// <reference types="ses"/>

import { E } from '@endo/far';
import { subscribeLatest } from './subscribe.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {BaseNotifier, IterationObserver, LatestTopic} from '../src/types.js';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * @deprecated Use `subscribeLatest` from `@agoric/notifier/subscribe.js` instead.
 *
 * Adaptor from a notifierP to an async iterable.
 * The notifierP can be any object that has an eventually invocable
 * `getUpdateSince` method that behaves according to the notifier
 * spec. This can be a notifier, a promise for a local or remote
 * notifier, or a presence of a remote notifier.
 *
 * It is also used internally by notifier.js so that a notifier itself is an
 * async iterable.
 *
 * An async iterable is an object with a `[Symbol.asyncIterator]()` method
 * that returns an async iterator. The async iterator we return here has only
 * a `next()` method, without the optional `return` and `throw` methods. The
 * omitted methods, if present, would be used by the for/await/of loop to
 * inform the iterator of early termination. But this adaptor would not do
 * anything useful in reaction to this notification.
 *
 * An async iterator's `next()` method returns a promise for an iteration
 * result. An iteration result is a record with `value` and `done` properties.
 *
 * The purpose of building on the notifier protocol is to have a lossy
 * adaptor, where intermediate results can be missed in favor of more recent
 * results which are therefore less stale. See
 * https://github.com/Agoric/documentation/blob/HEAD/main/guides/js-programming/notifiers.md
 *
 * @template T
 * @param {ERef<BaseNotifier<T>>} notifierP
 * @returns {ForkableAsyncIterable<T>}
 */
export const makeAsyncIterableFromNotifier = subscribeLatest;

/**
 * This advances `asyncIteratorP` updating `iterationObserver` with each
 * successive value. The `iterationObserver` may only be interested in certain
 * occurrences (`updateState`, `finish`, `fail`), so for convenience,
 * `observeIterator` feature tests for those methods before calling them.
 *
 * @template T
 * @param {ERef<AsyncIterator<T>>} asyncIteratorP
 * @param {Partial<IterationObserver<T>>} iterationObserver
 * @returns {Promise<undefined>}
 */
export const observeIterator = (asyncIteratorP, iterationObserver) => {
  return new Promise((ack, observerError) => {
    const recur = () => {
      E.when(
        E(asyncIteratorP).next(),
        ({ value, done }) => {
          if (done) {
            iterationObserver.finish && iterationObserver.finish(value);
            ack(undefined);
          } else {
            iterationObserver.updateState &&
              iterationObserver.updateState(value);
            recur();
          }
        },
        reason => {
          iterationObserver.fail && iterationObserver.fail(reason);
          ack(undefined);
        },
      ).catch(observerError);
    };
    recur();
  });
};

/**
 * This reads from `asyncIterableP` updating `iterationObserver` with each
 * successive value. The `iterationObserver` may only be interested in certain
 * occurrences (`updateState`, `finish`, `fail`), so for convenience,
 * `observeIteration` feature tests for those methods before calling them.
 *
 * @template T
 * @param {ERef<AsyncIterable<T>>} asyncIterableP
 * @param {Partial<IterationObserver<T>>} iterationObserver
 * @returns {Promise<undefined>}
 */
export const observeIteration = (asyncIterableP, iterationObserver) => {
  const iteratorP = E(asyncIterableP)[Symbol.asyncIterator]();
  return observeIterator(iteratorP, iterationObserver);
};

/**
 * As updates come in from the possibly remote `notifierP`, update
 * the local `updater`. Since the updates come from a notifier, they
 * are lossy, i.e., once a more recent state can be reported, less recent
 * states are assumed irrelevant and dropped.
 *
 * @template T
 * @param {ERef<LatestTopic<T>>} notifierP
 * @param {Partial<IterationObserver<T>>} iterationObserver
 * @returns {Promise<undefined>}
 */
export const observeNotifier = (notifierP, iterationObserver) =>
  observeIteration(subscribeLatest(notifierP), iterationObserver);
