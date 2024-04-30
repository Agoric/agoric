// eslint-disable-next-line import/order
import { test } from './prepare-test-env-ava.js';

import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import {
  makePublishKit,
  makeStoredPublishKit,
  makeStoredSubscriber,
  makeStoredSubscription,
  makeSubscriptionKit,
  subscribeEach,
} from '../src/index.js';
import {
  eventLoopIteration,
  makeFakeStorage,
  makeFakeMarshaller,
} from '../tools/testSupports.js';

import '../src/types.js';
import { jsonPairs } from './marshal-corpus.js';

test('stored subscription', async t => {
  t.plan((jsonPairs.length + 2) * 4 + 1);

  const initialValue = 'first value';
  const { publication: pubStorage, subscription: subStorage } =
    makeSubscriptionKit();
  const storage = makeFakeStorage('publish.foo.bar', pubStorage);
  const { subscription, publication } = makeSubscriptionKit();
  publication.updateState(initialValue);
  const storesub = makeStoredSubscription(subscription, storage);

  t.deepEqual(await E(storesub).getStoreKey(), {
    subscription,
    ...(await E(storage).getStoreKey()),
  });
  const unserializer = E(storesub).getUnserializer();

  const ait = E(storesub)[Symbol.asyncIterator]();
  const storeAit = subStorage[Symbol.asyncIterator]();

  const { unserialize } = makeMarshal();
  const check = async (description, origValue, expectedDone) => {
    const { done: storedDone, value: storedEncoded } = await storeAit.next();
    t.assert(
      !storedDone,
      `storage iterator should not report done for ${description}`,
    );
    const storedDecoded = JSON.parse(storedEncoded);
    const storedValue = await E(unserializer).fromCapData(storedDecoded);
    t.deepEqual(
      storedValue,
      origValue,
      `check stored value against original ${description}`,
    );

    const { done, value } = await E(ait).next();
    t.is(done, expectedDone, `check doneness for ${description}`);
    t.deepEqual(
      value,
      origValue,
      `check value against original ${description}`,
    );
  };

  await check(initialValue, initialValue, false);
  for await (const [encoded] of jsonPairs) {
    const origValue = unserialize({ body: encoded, slots: [] });
    await E(publication).updateState(origValue);
    await check(encoded, origValue, false);
  }

  const terminalNull = null;
  await E(publication).finish(terminalNull);
  await check('terminal null', terminalNull, true);
});

test('stored subscriber', async t => {
  t.plan((jsonPairs.length + 2) * 4 + 1);

  const initialValue = 'first value';
  const { publication: pubStorage, subscription: subStorage } =
    makeSubscriptionKit();
  const storage = makeFakeStorage('publish.foo.bar', pubStorage);

  const { publisher, subscriber } = makePublishKit();

  publisher.publish(initialValue);
  const storesub = makeStoredSubscriber(
    subscriber,
    storage,
    makeFakeMarshaller(),
  );

  t.deepEqual(await E(storesub).getStoreKey(), await E(storage).getStoreKey());
  const unserializer = E(storesub).getUnserializer();

  const storedSubscriberIterable = subscribeEach(subscriber);
  const storedSubscriberIterator = E(storedSubscriberIterable)[
    Symbol.asyncIterator
  ]();
  const storageIterator = subStorage[Symbol.asyncIterator]();

  const { unserialize } = makeMarshal();
  const check = async (description, origValue, expectedDone) => {
    const { done: storedDone, value: storedEncoded } =
      await storageIterator.next();
    t.assert(
      !storedDone,
      `storage iterator should not report done for ${description}`,
    );
    const storedDecoded = JSON.parse(storedEncoded);
    const storedValue = await E(unserializer).fromCapData(storedDecoded);
    t.deepEqual(
      storedValue,
      origValue,
      `check stored value against original ${description}`,
    );

    const { done, value } = await E(storedSubscriberIterator).next();
    t.is(done, expectedDone, `check doneness for ${description}`);
    t.deepEqual(
      value,
      origValue,
      `check value against original ${description}`,
    );
  };

  await check(initialValue, initialValue, false);
  for await (const [encoded] of jsonPairs) {
    const origValue = unserialize({ body: encoded, slots: [] });
    await E(publisher).publish(origValue);
    await check(encoded, origValue, false);
  }

  const terminalNull = null;
  await E(publisher).finish(terminalNull);
  await check('terminal null', terminalNull, true);
});

test('stored subscriber with setValue failure', async t => {
  const initialValue = 'first value';

  const storage = makeFakeStorage('publish.foo.bar', {
    // @ts-expect-error faulty publication param to fail setValue
    updateState: null,
  });

  const { publisher, subscriber } = makePublishKit();

  makeStoredSubscriber(subscriber, storage, makeFakeMarshaller());

  t.is(storage.countSetValueCalls(), 0);
  publisher.publish(initialValue); // fails setValue
  // should increment
  await eventLoopIteration();
  t.is(storage.countSetValueCalls(), 1);

  // stops trying after a failure
  publisher.publish(initialValue); // fails setValue
  // should not increment
  await eventLoopIteration();
  t.is(storage.countSetValueCalls(), 1);
});

test.failing('stored subscriber with subscriber failure', async t => {
  // No error handling rn
  t.fail();
});

test('StoredPublisher', async t => {
  const storageNode = makeFakeStorage('publish.foo.bar');
  const marshaller = makeFakeMarshaller();

  const { subscriber } = makeStoredPublishKit(storageNode, marshaller);

  t.is(await subscriber.getPath(), 'publish.foo.bar');
  t.deepEqual(await subscriber.getStoreKey(), {
    dataPrefixBytes: '',
    storeName: 'swingset',
    storeSubkey: 'swingset/data:publish.publish.foo.bar',
  });
  // could test that the unserializer is the one from the fake marshaller but this suffices
  t.truthy(subscriber.getUnserializer);
});
