/* eslint-disable no-underscore-dangle */
// @ts-check
/// <reference types="ses"/>

import { HandledPromise, E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';

import './types.js';

/**
 * @template T
 * @param {ERef<SubscriptionInternals<T>>} sharableInternalsP
 * @returns {Subscription<T>}
 */
const makeSubscription = sharableInternalsP => {
  return Far('Subscription', {
    // eslint-disable-next-line no-use-before-define
    [Symbol.asyncIterator]: () => makeSubscriptionIterator(sharableInternalsP),

    /**
     * Use this to distribute a Subscription efficiently over the network, by
     * obtaining this from the Subscription to be replicated, and applying
     * `makeSubscription` to it at the new site to get an equivalent local
     * Subscription at that site.
     *
     * @returns {ERef<SubscriptionInternals<T>>}
     */
    getSharableSubscriptionInternals: () => sharableInternalsP,
  });
};
harden(makeSubscription);
export { makeSubscription };

/**
 * @template T
 * @param {ERef<SubscriptionInternals<T>>} tailP
 * @returns {SubscriptionIterator<T>}
 */
const makeSubscriptionIterator = tailP => {
  // To understand the implementation, start with
  // https://web.archive.org/web/20160404122250/http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#infinite_queue
  return Far('SubscriptionIterator', {
    subscribe: () => makeSubscription(tailP),
    [Symbol.asyncIterator]: () => makeSubscriptionIterator(tailP),
    next: () => {
      const resultP = E.get(tailP).head;
      tailP = E.get(tailP).tail;
      return resultP;
    },
  });
};

/**
 * Makes a `{ publication, subscription }` for doing lossless efficient
 * distributed pub/sub.
 *
 * @template T
 * @returns {SubscriptionRecord<T>}
 */
const makeSubscriptionKit = () => {
  /**
   * @type {| ((internals: ERef<SubscriptionInternals<T>>) => void)
   *   | undefined}
   */
  let rear;
  const hp = new HandledPromise(r => (rear = r));
  const subscription = makeSubscription(hp);

  /** @type {IterationObserver<T>} */
  const publication = Far('publication', {
    updateState: value => {
      if (rear === undefined) {
        throw new Error('Cannot update state after termination.');
      }
      const { promise: nextTailE, resolve: nextRear } = makePromiseKit();
      rear(harden({ head: { value, done: false }, tail: nextTailE }));
      rear = nextRear;
    },
    finish: finalValue => {
      if (rear === undefined) {
        throw new Error('Cannot finish after termination.');
      }
      const readComplaint = HandledPromise.reject(
        new Error('cannot read past end of iteration'),
      );
      readComplaint.catch(_ => {}); // suppress unhandled rejection error
      rear({ head: { value: finalValue, done: true }, tail: readComplaint });
      rear = undefined;
    },
    fail: reason => {
      if (rear === undefined) {
        throw new Error('Cannot fail after termination.');
      }
      /** @type {Promise<SubscriptionInternals<T>>} */
      const rejection = HandledPromise.reject(reason);
      rear(rejection);
      rear = undefined;
    },
  });
  return harden({ publication, subscription });
};
harden(makeSubscriptionKit);
export { makeSubscriptionKit };
