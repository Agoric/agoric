// @jessie-check

import { Far } from '@endo/far';
import {
  mapAsyncIterable,
  subscribeEach,
  subscribeLatest,
} from './iterable.js';
import { makeCosmjsFollower } from './follower-cosmjs.js';
import { makeCastingSpec } from './casting-spec.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {IterationObserver, LatestTopic, Notifier, NotifierRecord, PublicationRecord, Publisher, PublishKit, StoredPublishKit, StoredSubscription, StoredSubscriber, Subscriber, Subscription, UpdateRecord} from '../src/types.js';
 * @import {Marshaller, StorageNode, Unserializer} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * @template T
 * @param {ERef<import('./types.js').CastingSpec>} spec
 */
const makeSubscriptionFollower = spec => {
  const transform = value =>
    harden({ value, blockHeight: NaN, currentBlockHeight: NaN });
  /** @type {import('./types.js').Follower<import('./types.js').ValueFollowerElement<T>>} */
  const follower = Far('subscription/notifier follower', {
    getLatestIterable: async () => {
      const { notifier, subscription } = await spec;
      let ai;
      if (notifier) {
        ai = subscribeLatest(notifier);
      } else {
        assert(subscription);
        ai = subscribeEach(subscription);
      }
      return mapAsyncIterable(ai, transform);
    },

    getEachIterable: async () => {
      const { notifier, subscription } = await spec;
      let ai;
      if (subscription) {
        ai = subscribeEach(subscription);
      } else {
        assert(notifier);
        ai = subscribeLatest(notifier);
      }
      return mapAsyncIterable(ai, transform);
    },

    getReverseIterable: async () => {
      throw Error(
        'reverse iteration not implemented for subscription follower',
      );
    },
  });
  return follower;
};

/**
 * @template T
 * @param {ERef<import('./types.js').CastingSpec> | string} specP
 * @param {import('./types.js').LeaderOrMaker} [leaderOrMaker]
 * @param {import('./types.js').FollowerOptions} [options]
 * @returns {Promise<import('./follower-cosmjs.js').ValueFollower<T>>}
 */
export const makeFollower = async (specP, leaderOrMaker, options) => {
  const spec = await makeCastingSpec(specP);
  const { storeName } = spec;
  if (storeName) {
    return makeCosmjsFollower(spec, leaderOrMaker, options);
  }
  return makeSubscriptionFollower(spec);
};
