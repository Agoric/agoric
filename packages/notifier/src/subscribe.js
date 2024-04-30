import { E, Far } from '@endo/far';
import { isObject } from '@endo/marshal';
import { isUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {IterationObserver, LatestTopic, Notifier, NotifierRecord, PublicationRecord, Publisher, PublishKit, StoredPublishKit, StoredSubscription, StoredSubscriber, Subscriber, Subscription, UpdateRecord, EachTopic, ForkableAsyncIterableIterator} from '../src/types.js';
 * @import {Marshaller, StorageNode, Unserializer} from '@agoric/internal/src/lib-chainStorage.js';
 */

const { details: X, Fail } = assert;
const sink = () => {};

/**
 * Check the promise returned by a function for rejection by vat upgrade,
 * and refetch upon encountering that condition.
 *
 * @template T
 * @param {() => ERef<T>} getter
 * @param {ERef<T>[]} [seed]
 * @returns {Promise<T>}
 */
const reconnectAsNeeded = async (getter, seed = []) => {
  let disconnection;
  let lastVersion = -Infinity;
  // End synchronous prelude.
  await null;
  for (let i = 0; ; i += 1) {
    try {
      const resultP = i < seed.length ? seed[i] : getter();
      const result = await resultP;
      return result;
    } catch (err) {
      if (isUpgradeDisconnection(err)) {
        if (!disconnection) {
          disconnection = err;
        }
        const { incarnationNumber: version } = err;
        if (version > lastVersion) {
          // We don't expect another upgrade in between receiving
          // a disconnection and re-requesting an update, but must
          // nevertheless be prepared for that.
          lastVersion = version;
          continue;
        }
      }
      // if `err` is an (Error) object, we can try to associate it with
      // information about the disconnection that prompted the request
      // for which it is a result.
      if (isObject(err) && disconnection && disconnection !== err) {
        try {
          assert.note(
            err,
            X`Attempting to recover from disconnection: ${disconnection}`,
          );
        } catch (_err) {
          // noop
        }
      }
      throw err;
    }
  }
};

/**
 * Create a near iterable that corresponds to a potentially far one.
 *
 * @template T
 * @param {ERef<AsyncIterableIterator<T>>} itP
 */
export const subscribe = itP =>
  Far('AsyncIterable', {
    [Symbol.asyncIterator]: () => {
      const it = E(itP)[Symbol.asyncIterator]();
      const self = Far('AsyncIterableIterator', {
        [Symbol.asyncIterator]: () => self,
        next: async () => E(it).next(),
      });
      return self;
    },
  });

/**
 * Asyncronously iterates over the contents of a PublicationRecord chain as they
 * appear.  This iteration must drop parts of publication records that are no
 * longer needed so they can be garbage collected.
 *
 * @template T
 * @param {ERef<EachTopic<T>>} topic
 * @param {ERef<PublicationRecord<T>>} nextCellP
 *   PublicationRecord corresponding with the first iteration result
 * @returns {ForkableAsyncIterableIterator<T, T>}
 */
const makeEachIterator = (topic, nextCellP) => {
  // To understand the implementation, start with
  // https://web.archive.org/web/20160404122250/http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#infinite_queue
  const self = Far('EachIterator', {
    [Symbol.asyncIterator]: () => self,
    next: () => {
      const {
        head: resultP,
        publishCount: publishCountP,
        tail: tailP,
      } = E.get(nextCellP);

      // If tailP is broken by upgrade, we will need to re-request it
      // directly from `topic`.
      const getSuccessor = async () => {
        const publishCount = await publishCountP;
        assert.typeof(publishCount, 'bigint');
        const successor = await E(topic).subscribeAfter(publishCount);
        const newPublishCount = successor.publishCount;
        if (newPublishCount !== publishCount + 1n) {
          Fail`eachIterator broken by gap from publishCount ${publishCount} to ${newPublishCount}`;
        }
        return successor;
      };

      // Replace nextCellP on every call to next() so things work even
      // with an eager consumer that doesn't wait for results to settle.
      nextCellP = reconnectAsNeeded(getSuccessor, [tailP]);

      // Avoid unhandled rejection warnings here if the previous cell was rejected or
      // there is no further request of this iterator.
      // `tailP` is handled inside `reconnectAsNeeded` and `resultP` is the caller's
      // concern, leaving only `publishCountP` and the new `nextCellP`.
      void E.when(publishCountP, sink, sink);
      void E.when(nextCellP, sink, sink);
      return resultP;
    },
    fork: () => makeEachIterator(topic, nextCellP),
  });
  return self;
};

/**
 * Given a local or remote subscriber, returns a local AsyncIterable which
 * provides "prefix lossy" iterations of the underlying PublicationList.
 * By "prefix lossy", we mean that you may miss everything published before
 * you ask the returned iterable for an iterator. But the returned iterator
 * will enumerate each thing published from that iterator's starting point
 * up to a disconnection result indicating upgrade of the producer
 * (which breaks the gap-free guarantee and therefore terminates any active
 * iterator while still supporting creation of new iterators).
 *
 * If the underlying PublicationList is terminated, that terminal value will be
 * reported losslessly.
 *
 * @template T
 * @param {ERef<EachTopic<T>>} topic
 */
export const subscribeEach = topic => {
  const iterable = Far('EachIterable', {
    [Symbol.asyncIterator]: () => {
      const firstCellP = reconnectAsNeeded(() => E(topic).subscribeAfter());
      return makeEachIterator(topic, firstCellP);
    },
  });
  return iterable;
};
harden(subscribeEach);

/**
 * @template T
 * @param {ERef<LatestTopic<T>>} topic
 * @param {bigint} [localUpdateCount]
 * @param {IteratorReturnResult<T>} [terminalResult]
 * @returns {ForkableAsyncIterableIterator<T, T>}
 */
const cloneLatestIterator = (topic, localUpdateCount, terminalResult) => {
  let mutex = Promise.resolve();

  /**
   * Request the next update record from the topic, updating our local state,
   * and convert it to an iterator result.
   *
   * @returns {Promise<IteratorResult<T, T>>}
   */
  const maybeRequestNextResult = async () => {
    if (terminalResult) {
      // We've reached the end of the topic, just keep returning the last result
      // without further requests.
      return terminalResult;
    }

    // Send the next request now, skipping past intermediate updates
    // and upgrade disconnections.
    const { value, updateCount } = await reconnectAsNeeded(() =>
      E(topic).getUpdateSince(localUpdateCount),
    );
    // Make sure the next request is for a fresher value.
    localUpdateCount = updateCount;

    // Make an IteratorResult.
    if (updateCount === undefined) {
      terminalResult = harden({ done: true, value });
      return terminalResult;
    }
    return harden({ done: false, value });
  };

  const self = Far('LatestIterator', {
    fork: () => cloneLatestIterator(topic, localUpdateCount, terminalResult),
    [Symbol.asyncIterator]: () => self,
    next: async () => {
      // In this adaptor, once `next()` is called and returns an unresolved
      // promise, further `next()` calls will also return unresolved promises
      // but each call will not trigger another `topic` request until the prior
      // one has settled.
      //
      // This linear queueing behavior is only needed for code that uses the
      // async iterator protocol explicitly. When this async iterator is
      // consumed by a for/await/of loop, `next()` will only be called after the
      // promise for the previous iteration result has fulfilled. If it fulfills
      // with `done: true`, the for/await/of loop will never call `next()`
      // again.
      //
      // See
      // https://2ality.com/2016/10/asynchronous-iteration.html#queuing-next()-invocations
      // for an explicit use that sends `next()` without waiting.

      if (terminalResult) {
        // We've reached the end of the topic, just keep returning the last
        // result.
        return terminalResult;
      }

      // BEGIN CRITICAL SECTION - synchronously enqueue and reassign `mutex`
      //
      // Use `mutex` to ensure that we have no more than a single request in
      // flight.
      const nextResult = mutex.then(maybeRequestNextResult);
      mutex = nextResult.then(sink, sink);
      // END CRITICAL SECTION

      return nextResult;
    },
  });
  return self;
};

/**
 * @template T
 * @param {ERef<LatestTopic<T>>} topic
 * @returns {ForkableAsyncIterableIterator<T, T>}
 */
const makeLatestIterator = topic => cloneLatestIterator(topic);

/**
 * Given a local or remote subscriber, returns a local AsyncIterable which
 * provides "lossy" iterations of the underlying PublicationList.
 * By "lossy", we mean that you may miss any published state if a more
 * recent published state can be reported instead.
 *
 * If the underlying PublicationList is terminated by upgrade of the producer,
 * it will be re-requested. All other terminal values will be losslessly
 * propagated.
 *
 * @template T
 * @param {ERef<LatestTopic<T>>} topic
 */
export const subscribeLatest = topic => {
  const iterable = Far('LatestIterable', {
    [Symbol.asyncIterator]: () => makeLatestIterator(topic),
  });
  return iterable;
};
harden(subscribeLatest);
