// @jessie-check

/// <reference types="ses"/>

import { E, Far } from '@endo/far';
import { subscribeEach } from './subscribe.js';
import { makePublishKit } from './publish-kit.js';

import { makePinnedHistoryTopic } from './topic.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {EachTopic, IterationObserver, LatestTopic, Notifier, NotifierRecord, SubscriptionRecord, Publisher, PublishKit, StoredPublishKit, StoredSubscription, StoredSubscriber, Subscriber, Subscription, UpdateRecord} from '../src/types.js';
 * @import {Marshaller, StorageNode, Unserializer} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * @template T
 * @param {ERef<EachTopic<T>>} topic
 * @returns {Subscription<T>}
 */
const makeSubscription = topic => {
  const subscription = Far('Subscription', {
    ...subscribeEach(topic),
    subscribeAfter: async publishCount => E(topic).subscribeAfter(publishCount),

    /**
     * Use this to distribute a Subscription efficiently over the network,
     * by obtaining this from the Subscription to be replicated, and applying
     * `makeSubscription` to it at the new site to get an equivalent local
     * Subscription at that site.
     */
    getSharableSubscriptionInternals: async () => topic,

    getStoreKey: () => harden({ subscription }),
  });
  return subscription;
};
harden(makeSubscription);
export { makeSubscription };

/**
 * @deprecated Producers should use
 * ```js
 * const { publisher, subscriber } = makePublishKit();
 * const topic = makePinnedHistoryTopic(subscriber);
 * ```
 * instead, which makes it clearer that all the subscriber's history is
 * retained, preventing GC.  Potentially remote consumers use
 * ```js
 * for await (const value of subscribeEach(topic)) { ... }
 * ```
 *
 * Makes a `{ publication, subscription }` for doing lossless efficient
 * distributed pub/sub.
 *
 * @template T
 * @returns {SubscriptionRecord<T>}
 */
const makeSubscriptionKit = () => {
  const { publisher, subscriber } = makePublishKit();

  // The publish kit subscriber is prefix-lossy, so making *this* subscriber completely
  // lossless from initialisation requires pinning the former's history.

  const pinnedHistoryTopic = makePinnedHistoryTopic(subscriber);
  const subscription = makeSubscription(pinnedHistoryTopic);

  /** @type {IterationObserver<T>} */
  const publication = Far('publication', {
    updateState: nonFinalValue => publisher.publish(nonFinalValue),
    finish: completion => publisher.finish(completion),
    fail: reason => publisher.fail(reason),
  });

  return harden({ publication, subscription });
};
harden(makeSubscriptionKit);
export { makeSubscriptionKit };
