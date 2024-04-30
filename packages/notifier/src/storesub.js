import { E, Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { assertAllDefined } from '@agoric/internal';
import { makeSerializeToStorage } from '@agoric/internal/src/lib-chainStorage.js';
import { observeIteration } from './asyncIterableAdaptor.js';
import { makePublishKit } from './publish-kit.js';
import { makeSubscriptionKit } from './subscriber.js';
import { subscribeEach } from './subscribe.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {IterationObserver, LatestTopic, Notifier, NotifierRecord, PublicationRecord, Publisher, PublishKit, StoredPublishKit, StoredSubscription, StoredSubscriber, Subscriber, Subscription, UpdateRecord} from '../src/types.js';
 * @import {Marshaller, StorageNode, Unserializer} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * NB: does not yet survive upgrade https://github.com/Agoric/agoric-sdk/issues/6893
 *
 * @alpha
 * @template T
 * @param {Subscriber<T>} subscriber
 * @param {(v: T) => void} consumeValue
 */
export const forEachPublicationRecord = async (subscriber, consumeValue) => {
  // We open-code the for-await-of implementation rather than using that syntax
  // directly because we want to run the consumer on the done value as well.
  const iterator = subscribeEach(subscriber)[Symbol.asyncIterator]();

  let finished = false;
  await null;
  while (!finished) {
    const { value, done } = await iterator.next();
    await consumeValue(value);
    finished = !!done;
  }
};

/**
 * Begin iterating the source, storing serialized iteration values.  If the
 * storageNode's `setValue` operation rejects, no further writes to it will
 * be attempted (but results will remain available from the subscriber).
 *
 * Returns a StoredSubscriber that can be used by a client to directly follow
 * the iteration themselves, or obtain information to subscribe to the stored
 * data out-of-band.
 *
 * @template T
 * @param {Subscriber<T>} subscriber
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<ReturnType<typeof makeMarshal>>} marshaller
 * @returns {StoredSubscriber<T>}
 */
export const makeStoredSubscriber = (subscriber, storageNode, marshaller) => {
  assertAllDefined({ subscriber, storageNode, marshaller });

  const marshallToStorage = makeSerializeToStorage(storageNode, marshaller);

  // Start publishing the source.
  forEachPublicationRecord(subscriber, marshallToStorage).catch(err => {
    // TODO: How should we handle and/or surface this failure?
    // https://github.com/Agoric/agoric-sdk/pull/5766#discussion_r922498088
    console.error('StoredSubscriber failed to iterate', err);
  });

  /** @type {Unserializer} */
  const unserializer = Far('unserializer', {
    fromCapData: data => E(marshaller).fromCapData(data),
    unserialize: data => E(marshaller).fromCapData(data),
  });

  /** @type {StoredSubscriber<T>} */
  const storesub = Far('StoredSubscriber', {
    subscribeAfter: publishCount => subscriber.subscribeAfter(publishCount),
    getUpdateSince: updateCount => subscriber.getUpdateSince(updateCount),
    getPath: () => E(storageNode).getPath(),
    getStoreKey: () => E(storageNode).getStoreKey(),
    getUnserializer: () => unserializer,
  });
  return storesub;
};

/**
 * @deprecated use makeStoredSubscriber
 *
 * Begin iterating the source, storing serialized iteration values.  If the
 * storageNode's `setValue` operation rejects, the iteration will be terminated.
 *
 * Returns a StoredSubscription that can be used by a client to directly follow
 * the iteration themselves, or obtain information to subscribe to the stored
 * data out-of-band.
 *
 * @template T
 * @param {Subscription<T>} subscription
 * @param {ERef<StorageNode>} [storageNode]
 * @param {ERef<ReturnType<typeof makeMarshal>>} [marshaller]
 * @returns {StoredSubscription<T>}
 */
export const makeStoredSubscription = (
  subscription,
  storageNode,
  marshaller = makeMarshal(undefined, undefined, {
    marshalSaveError: () => {},
    serializeBodyFormat: 'smallcaps',
  }),
) => {
  /** @type {import('@agoric/internal/src/lib-chainStorage.js').Unserializer} */
  const unserializer = Far('unserializer', {
    fromCapData: data => E(marshaller).fromCapData(data),
    unserialize: data => E(marshaller).fromCapData(data),
  });

  // Abort the iteration on the next observation if the publisher ever fails.
  let publishFailed = false;
  let publishException;

  const fail = err => {
    publishFailed = true;
    publishException = err;
  };

  // Must *not* be an async function, because it sometimes must throw to abort
  // the iteration.
  const publishValue = obj => {
    assert(storageNode);
    if (publishFailed) {
      // To properly abort the iteration, this must be a synchronous exception.
      throw publishException;
    }

    // Publish the value, capturing any error.
    E(marshaller)
      .toCapData(obj)
      .then(serialized => {
        const encoded = JSON.stringify(serialized);
        return E(storageNode).setValue(encoded);
      })
      .catch(fail);
  };

  if (storageNode) {
    // Start publishing the source.
    observeIteration(subscription, {
      updateState: publishValue,
      finish: publishValue,
    }).catch(fail);
  }

  /** @type {StoredSubscription<T>} */
  const storesub = Far('StoredSubscription', {
    // @ts-expect-error getStoreKey type does not have `subscription`
    getStoreKey: async () => {
      if (!storageNode) {
        return harden({ subscription });
      }
      const storeKey = await E(storageNode).getStoreKey();
      return harden({ ...storeKey, subscription });
    },
    getUnserializer: () => unserializer,
    getSharableSubscriptionInternals: () =>
      subscription.getSharableSubscriptionInternals(),
    [Symbol.asyncIterator]: () => subscription[Symbol.asyncIterator](),
    subscribeAfter: publishCount => subscription.subscribeAfter(publishCount),
  });
  return storesub;
};
harden(makeStoredSubscription);

/**
 * @deprecated use StoredPublishKit
 * @template T
 * @typedef {object} StoredPublisherKit
 * @property {StoredSubscription<T>} subscriber
 * @property {IterationObserver<T>} publisher
 */

/**
 * @deprecated incompatible with durability; instead handle vstorage ephemerally on a durable PublishKit
 *
 * @template [T=unknown]
 * @param {ERef<StorageNode>} [storageNode]
 * @param {ERef<Marshaller>} [marshaller]
 * @param {string} [childPath]
 * @returns {StoredPublisherKit<T>}
 */
export const makeStoredPublisherKit = (storageNode, marshaller, childPath) => {
  const { publication, subscription } = makeSubscriptionKit();

  if (storageNode && childPath) {
    storageNode = E(storageNode).makeChildNode(childPath);
  }

  // wrap the subscription to tee events to storage, repeating to this `subscriber`
  const subscriber = makeStoredSubscription(
    subscription,
    storageNode,
    marshaller,
  );

  return {
    publisher: publication,
    subscriber,
  };
};

/**
 * @deprecated incompatible with durability; instead handle vstorage ephemerally on a durable PublishKit
 *
 * Like makePublishKit this makes a `{ publisher, subscriber }` pair for doing efficient
 * distributed pub/sub supporting both "each" and "latest" iteration
 * of published values.
 *
 * What's different is `subscriber` tees records, writing out to storageNode.
 *
 * @template [T=unknown]
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<Marshaller>} marshaller
 * @returns {StoredPublishKit<T>}
 */
export const makeStoredPublishKit = (storageNode, marshaller) => {
  const { publisher, subscriber } = makePublishKit();

  return {
    publisher,
    // wrap the subscriber to tee events to storage
    subscriber: makeStoredSubscriber(subscriber, storageNode, marshaller),
  };
};
harden(makeStoredPublishKit);
