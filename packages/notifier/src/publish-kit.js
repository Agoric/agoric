/// <reference types="ses" />

import { Fail, q } from '@endo/errors';
import { E, Far } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { M, getInterfaceGuardPayload } from '@endo/patterns';
import { canBeDurable, prepareExoClassKit } from '@agoric/vat-data';

/**
 * @import {ERef} from '@endo/far';
 * @import {DurablePublishKitState, DurablePublishKitValueDurability, LatestTopic, Notifier, NotifierRecord, PublicationRecord, Publisher, PublishKit, Subscriber, UpdateRecord} from '../src/types.js';
 */

const sink = () => {};
const makeQuietRejection = reason => {
  const rejection = harden(Promise.reject(reason));
  void E.when(rejection, sink, sink);
  return rejection;
};
const tooFarRejection = makeQuietRejection(
  harden(Error('Cannot read past end of iteration.')),
);

export const PublisherI = M.interface('Publisher', {
  publish: M.call(M.any()).returns(),
  finish: M.call(M.any()).returns(),
  fail: M.call(M.any()).returns(),
});

// For backwards compatibility with Notifier `getUpdateSince`.
export const UpdateCountShape = M.or(M.bigint(), M.number());
export const SubscriberI = M.interface('Subscriber', {
  subscribeAfter: M.call().optional(M.bigint()).returns(M.promise()),
  getUpdateSince: M.call().optional(UpdateCountShape).returns(M.promise()),
});
export const publishKitIKit = harden({
  publisher: PublisherI,
  subscriber: SubscriberI,
});

export const ForkableAsyncIterableIteratorShape = M.interface(
  'ForkableAsyncIterableIterator',
  {
    fork: M.call().returns(M.any()),
    [Symbol.asyncIterator]: M.call().returns(M.any()), // oops: recursive type
    next: M.callWhen().returns(M.any()),
  },
);

export const IterableEachTopicI = M.interface('IterableEachTopic', {
  subscribeAfter:
    getInterfaceGuardPayload(SubscriberI).methodGuards.subscribeAfter,
  [Symbol.asyncIterator]: M.call().returns(
    M.remotable('ForkableAsyncIterableIterator'),
  ),
});

export const IterableLatestTopicI = M.interface('IterableLatestTopic', {
  getUpdateSince:
    getInterfaceGuardPayload(SubscriberI).methodGuards.getUpdateSince,
  [Symbol.asyncIterator]: M.call().returns(
    M.remotable('ForkableAsyncIterableIterator'),
  ),
});

/**
 * @template {object} Arg
 * @template Ret
 * @param {(arg: Arg) => Ret} fn
 * @returns {(arg: Arg) => Ret}
 */
const weakMemoizeUnary = fn => {
  const cache = new WeakMap();
  return arg => {
    /** @type {object} */
    const oarg = arg;
    if (cache.has(oarg)) {
      return cache.get(oarg);
    }
    const result = fn(arg);
    cache.set(oarg, result);
    return result;
  };
};

/**
 * @template T
 * @param {PublicationRecord<T>} record
 * @returns {UpdateRecord<T>}
 */
const makeUpdateRecordFromPublicationRecord = record => {
  const {
    head: { value, done },
    publishCount,
  } = record;
  if (done) {
    // Final results have undefined updateCount.
    return harden({ value, updateCount: undefined });
  }
  return harden({ value, updateCount: publishCount });
};

/**
 * Makes a `{ publisher, subscriber }` pair for doing efficient
 * distributed pub/sub supporting both "each" and "latest" iteration
 * of published values.
 *
 * @template T
 * @returns {PublishKit<T>}
 */
export const makePublishKit = () => {
  /** @type {Promise<PublicationRecord<T>>} */
  let tailP;
  /** @type {undefined | ((value: ERef<PublicationRecord<T>>) => void)} */
  let tailR;
  ({ promise: tailP, resolve: tailR } = makePromiseKit());

  let currentPublishCount = 0n;
  let currentP = tailP;
  const advanceCurrent = (done, value, rejection) => {
    if (tailR === undefined) {
      throw Error('Cannot update state after termination.');
    }

    currentPublishCount += 1n;
    currentP = tailP;
    const resolveCurrent = tailR;

    if (done) {
      tailP = tooFarRejection;
      tailR = undefined;
    } else {
      ({ promise: tailP, resolve: tailR } = makePromiseKit());
    }

    if (rejection) {
      resolveCurrent(rejection);
    } else {
      resolveCurrent(
        harden({
          head: { value, done },
          publishCount: currentPublishCount,
          tail: tailP,
        }),
      );
    }
  };

  const makeMemoizedUpdateRecord = weakMemoizeUnary(
    makeUpdateRecordFromPublicationRecord,
  );

  /**
   * @template T
   * @type {Subscriber<T>}
   */
  const subscriber = Far('Subscriber', {
    subscribeAfter: (publishCount = -1n) => {
      assert.typeof(publishCount, 'bigint');
      if (publishCount === currentPublishCount) {
        return tailP;
      } else if (publishCount < currentPublishCount) {
        return currentP;
      } else {
        throw Error(
          'subscribeAfter argument must be a previously-issued publishCount.',
        );
      }
    },
    getUpdateSince: updateCount => {
      if (updateCount === undefined) {
        return subscriber.subscribeAfter().then(makeMemoizedUpdateRecord);
      }
      updateCount = BigInt(updateCount);
      return (
        subscriber
          // `subscribeAfter` may resolve with the update record numbered
          // `updateCount + 1`, even if several updates are published in the
          // same crank...
          .subscribeAfter(updateCount)
          // ... so we poll the latest published update, without waiting for any
          // further ones.
          .then(() => subscriber.getUpdateSince())
      );
    },
  });

  /** @type {Publisher<T>} */
  const publisher = Far('Publisher', {
    publish: value => {
      advanceCurrent(false, value);
    },
    finish: finalValue => {
      advanceCurrent(true, finalValue);
    },
    fail: reason => {
      advanceCurrent(true, undefined, makeQuietRejection(reason));
    },
  });
  return harden({ publisher, subscriber });
};
harden(makePublishKit);

const DurablePublishKitStateShape = harden({
  valueDurability: M.any(),
  publishCount: M.any(),
  status: M.any(),
  hasValue: M.any(),
  value: M.any(),
});

// TODO: Move durable publish kit to a new file?

/**
 * @param {object} [options]
 * @param {DurablePublishKitValueDurability & 'mandatory'} [options.valueDurability]
 * @returns {DurablePublishKitState}
 */
const initDurablePublishKitState = (options = {}) => {
  const { valueDurability = 'mandatory' } = options;
  assert.equal(valueDurability, 'mandatory');
  return {
    // configuration
    valueDurability,

    // lifecycle progress
    publishCount: 0n,
    status: 'live', // | 'finished' | 'failed'

    // persisted result data
    // Note that in addition to non-terminal values from `publish`,
    // value also holds the terminal value from `finish` or `fail`.
    hasValue: false,
    value: undefined,
  };
};

// We need the WeakMap key for a kit to be a vref-bearing object
// in its cohort, and have arbitrarily chosen the publisher facet.
/** @typedef {Publisher<*>} DurablePublishKitEphemeralKey */
/**
 * @param {PublishKit<*>} facets
 * @returns {DurablePublishKitEphemeralKey}
 */
const getEphemeralKey = facets => facets.publisher;

/**
 * @typedef DurablePublishKitEphemeralData
 * @property {Promise<*> | undefined} currentP The current-result promise
 *   (undefined unless resolved with unrecoverable ephemeral data)
 * @property {Promise<*>} tailP The next-result promise
 * @property {((value: any) => void) | undefined} tailR The next-result resolver
 *   (undefined when the publish kit has terminated)
 */

/** @type {WeakMap<DurablePublishKitEphemeralKey, DurablePublishKitEphemeralData>} */
const durablePublishKitEphemeralData = new WeakMap();

/**
 * Returns the current-result promise associated with a given durable
 * publish kit, recreated unless we already have one with retained
 * ephemeral data.
 *
 * @param {DurablePublishKitState} state
 * @param {PublishKit<*>} facets
 * @param {Promise<*>} tail
 * @returns {Promise<*>}
 */
const provideCurrentP = (state, facets, tail) => {
  const ephemeralKey = getEphemeralKey(facets);
  const foundData = durablePublishKitEphemeralData.get(ephemeralKey);
  const currentP = foundData && foundData.currentP;
  if (currentP) {
    return currentP;
  }

  const { publishCount, status, hasValue, value } = state;
  if (!hasValue) {
    assert(status === 'live');
    return tail;
  }
  if (status === 'live' || status === 'finished') {
    const cell = harden({
      head: { value, done: status !== 'live' },
      publishCount,
      tail,
    });
    return E.resolve(cell);
  } else if (status === 'failed') {
    return makeQuietRejection(value);
  } else {
    throw Fail`Invalid durable promise kit status: ${q(status)}`;
  }
};

/**
 * Returns the next-result promise and resolver associated with a given
 * durable publish kit.
 * These are lost on upgrade but recreated on-demand, preserving the
 * value in (but not the identity of) the current { value, done } result
 * when possible, which is always the case when that value is terminal
 * (i.e., from `finish` or `fail`) or when the durable publish kit is
 * configured with `valueDurability: 'mandatory'`.
 *
 * @param {DurablePublishKitState} state
 * @param {PublishKit<*>} facets
 * @returns {DurablePublishKitEphemeralData}
 */
const provideDurablePublishKitEphemeralData = (state, facets) => {
  const ephemeralKey = getEphemeralKey(facets);
  const foundData = durablePublishKitEphemeralData.get(ephemeralKey);
  if (foundData) {
    return foundData;
  }

  const { status } = state;
  let tailP;
  let tailR;
  if (status === 'live') {
    ({ promise: tailP, resolve: tailR } = makePromiseKit());
    void E.when(tailP, sink, sink);
  } else if (status === 'finished' || status === 'failed') {
    tailP = tooFarRejection;
  } else {
    throw Fail`Invalid durable promise kit status: ${q(status)}`;
  }
  // currentP is not ephemeral when restoring from persisted state.
  const obj = harden({ currentP: undefined, tailP, tailR });
  durablePublishKitEphemeralData.set(ephemeralKey, obj);
  return obj;
};

/**
 * Extends the sequence of results.
 *
 * @param {{state: DurablePublishKitState, facets: PublishKit<*>}} context
 * @param {any} value
 * @param {DurablePublishKitState['status']} [targetStatus]
 */
const advanceDurablePublishKit = (context, value, targetStatus = 'live') => {
  const { state, facets } = context;
  const { valueDurability, status } = state;
  if (status !== 'live') {
    throw Error('Cannot update state after termination.');
  }
  const done = targetStatus !== 'live';
  if (done || valueDurability === 'mandatory') {
    canBeDurable(value) || Fail`Cannot accept non-durable value: ${value}`;
  }
  const { tailP: oldTailP, tailR: resolveOldTail } =
    provideDurablePublishKitEphemeralData(state, facets);
  assert.typeof(resolveOldTail, 'function');

  const publishCount = state.publishCount + 1n;
  state.publishCount = publishCount;

  let tailP;
  let tailR;
  if (done) {
    state.status = targetStatus;
    tailP = tooFarRejection;
    tailR = undefined;
  } else {
    ({ promise: tailP, resolve: tailR } = makePromiseKit());
    void E.when(tailP, sink, sink);
  }

  let currentP;
  if (targetStatus === 'failed') {
    state.hasValue = true;
    state.value = value;
    const rejection = makeQuietRejection(value);
    resolveOldTail(rejection);
  } else {
    // Persist a terminal value, or a non-terminal value
    // if configured as 'mandatory' or 'opportunistic'.
    if (done || (valueDurability !== 'ignored' && canBeDurable(value))) {
      state.hasValue = true;
      state.value = value;
    } else {
      state.hasValue = false;
      state.value = undefined;
      // Retain any promise with non-durable resolution.
      currentP = oldTailP;
    }

    resolveOldTail(
      harden({
        head: { value, done },
        publishCount,
        tail: tailP,
      }),
    );
  }

  durablePublishKitEphemeralData.set(
    getEphemeralKey(facets),
    harden({ currentP, tailP, tailR }),
  );
};

/**
 * @param {import('@agoric/swingset-liveslots').Baggage} baggage
 * @param {string} kindName
 * @returns {<T>(options?: Parameters<typeof initDurablePublishKitState>[0]) => PublishKit<T>}
 */
export const prepareDurablePublishKit = (baggage, kindName) => {
  // TODO: Once we unify with makePublishKit, we will use a Zone-compatible weak
  // map for memoization.
  const makeMemoizedUpdateRecord = makeUpdateRecordFromPublicationRecord;

  return prepareExoClassKit(
    baggage,
    kindName,
    publishKitIKit,
    initDurablePublishKitState,
    {
      // The publisher facet of a durable publish kit
      // accepts new values.
      publisher: {
        publish(value) {
          advanceDurablePublishKit(this, value);
        },
        finish(finalValue) {
          advanceDurablePublishKit(this, finalValue, 'finished');
        },
        fail(reason) {
          advanceDurablePublishKit(this, reason, 'failed');
        },
      },

      // The subscriber facet of a durable publish kit
      // propagates values.
      subscriber: {
        subscribeAfter(publishCount = -1n) {
          const { state, facets } = this;
          const { publishCount: currentPublishCount } = state;
          const { currentP, tailP } = provideDurablePublishKitEphemeralData(
            state,
            facets,
          );
          if (publishCount === currentPublishCount) {
            return tailP;
          } else if (publishCount < currentPublishCount) {
            return currentP || provideCurrentP(state, facets, tailP);
          } else {
            throw Error(
              'subscribeAfter argument must be a previously-issued publishCount.',
            );
          }
        },
        getUpdateSince(updateCount) {
          const {
            facets: { subscriber },
          } = this;
          if (updateCount === undefined) {
            return subscriber.subscribeAfter().then(makeMemoizedUpdateRecord);
          }
          updateCount = BigInt(updateCount);
          return (
            subscriber
              // `subscribeAfter` may resolve with the update record numbered
              // `updateCount + 1`, even if several updates are published in the
              // same crank...
              .subscribeAfter(updateCount)
              // ... so we poll the latest published update, without waiting for any
              // further ones.
              .then(() => subscriber.getUpdateSince())
          );
        },
      },
    },
    {
      stateShape: DurablePublishKitStateShape,
    },
  );
};
harden(prepareDurablePublishKit);

export const SubscriberShape = M.remotable('Subscriber');
