// @jessie-check

// Ensure this is a module.
export {};

/** @import { ERef } from '@endo/far' */

/**
 * @import {PromiseKit, PromiseRecord} from '@endo/promise-kit'
 */

/**
 * @template T
 * @template [TReturn=any]
 * @template [TNext=undefined]
 * @typedef {AsyncIterator<T, TReturn, TNext> & {
 *   fork(): ForkableAsyncIterator<T, TReturn, TNext>
 * }} ForkableAsyncIterator An AsyncIterator that can be forked at a given position
 * into multiple independent ForkableAsyncIterators starting from that position.
 */

/**
 * @template T
 * @template [TReturn=any]
 * @template [TNext=undefined]
 * @typedef {{ [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext> }} AsyncIterableOnly
 */

/**
 * @template T
 * @template [TReturn=any]
 * @template [TNext=undefined]
 * @typedef {{
 *   [Symbol.asyncIterator](): ForkableAsyncIterableIterator<T, TReturn, TNext>,
 *   fork(): ForkableAsyncIterableIterator<T, TReturn, TNext> } &
 *   ForkableAsyncIterator<T, TReturn, TNext>
 * } ForkableAsyncIterableIterator
 */

/**
 * @template T
 * @template [TReturn=any]
 * @template [TNext=undefined]
 * @typedef {{
 *   [Symbol.asyncIterator]: () => ForkableAsyncIterator<T, TReturn, TNext>
 * }} ForkableAsyncIterable
 * An AsyncIterable that produces ForkableAsyncIterators.
 */

/**
 * @template T
 * @typedef {object} IterationObserver<T>
 * A valid sequence of calls to the methods of an `IterationObserver`
 * represents an iteration. A valid sequence consists of any number of calls
 * to `updateState` with the successive non-final values, followed by a
 * final call to either `finish` with a successful `completion` value
 * or `fail` with the alleged `reason` for failure. After at most one
 * terminating calls, no further calls to these methods are valid and must be
 * rejected.
 * @property {(nonFinalValue: T) => void} updateState
 * @property {(completion: T) => void} finish
 * @property {(reason: unknown) => void} fail
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @template T
 * @typedef {object} PublicationRecord
 * Will be shared between machines, so it must be safe to expose. But software
 * outside the current package should consider it opaque, not depending on its
 * internal structure.
 * @property {IteratorResult<T>} head
 * @property {bigint} publishCount starts at 1 for the first result
 *   and advances by 1 for each subsequent result
 * @property {Promise<PublicationRecord<T>>} tail
 */

/**
 * @template T
 * @typedef {object} EachTopic
 * @property {(publishCount?: bigint) => Promise<PublicationRecord<T>>} subscribeAfter
 * Returns a promise for a "current" PublicationRecord (referencing its
 * immediate successor via a `tail` promise) that is later than the
 * provided publishCount.
 * Used to make forward-lossless ("each") iterators.
 */

/**
 * @template T
 * @typedef {ForkableAsyncIterable<T, T> & EachTopic<T>} IterableEachTopic
 * An EachTopic with default asyncIterable behaviour.
 *
 * NOTE: the publication records and iterators returned by this object are
 * ephemeral and will be severed during upgrade.  A caller should use
 * `subscribeEach` to wrap this topic in a local iterable which automatically
 * attempts to reconnect upon being severed.
 */

/**
 * @template T
 * @typedef {AsyncIterableOnly<T, T> & LatestTopic<T>} IterableLatestTopic
 * A LatestTopic with default asyncIterable behaviour.
 *
 * NOTE: the iterators returned by this object are ephemeral and will be severed
 * during upgrade.  A caller should use `subscribeLatest` to wrap this topic in
 * a local iterable which automatically attempts to reconnect upon being
 * severed.
 */

/**
 * @template T
 * @typedef {object} LatestTopic
 * @property {(updateCount?: bigint | number) => Promise<UpdateRecord<T>>} getUpdateSince
 * Returns a promise for an update record as of an update count.
 * If the `updateCount` argument is omitted or differs from the current update count,
 * the promise promptly resolves to the current record.
 * Otherwise, after the next state change, the promise resolves to the resulting record.
 * This is an attenuated form of `subscribeAfter` whose return value stands alone and
 * does not allow consumers to pin a chain of historical PublicationRecords.
 * Used to make lossy ("latest") iterators.
 * NOTE: Use of `number` as an `updateCount` is deprecated.
 */

/**
 * @template T
 * @typedef {LatestTopic<T>} BaseNotifier This type is deprecated but is still
 * used externally.
 */

/**
 * @template T
 * @typedef {LatestTopic<T> & EachTopic<T>} Subscriber
 * A stream of results that allows consumers to configure
 * forward-lossless "each" iteration with `subscribeEach` and
 * lossy "latest" iteration with `subscribeLatest`.
 */

/**
 * @template T
 * @typedef {object} Publisher
 * A valid sequence of calls to the methods of an `IterationObserver`
 * represents an iteration. A valid sequence consists of any number of calls
 * to `publish` with the successive non-final values, followed by a
 * final call to either `finish` with a successful `completion` value
 * or `fail` with the alleged `reason` for failure. After at most one
 * terminating calls, no further calls to these methods are valid and must be
 * rejected.
 * @property {(nonFinalValue: T) => void} publish
 * @property {(completion: T) => void} finish
 * @property {(reason: any) => void} fail
 */

/**
 * @template T
 * @typedef {Partial<Publisher<T>>} PublishObserver
 */

/**
 * @template T
 * @typedef {object} PublishKit<T>
 * @property {Publisher<T>} publisher
 * @property {Subscriber<T>} subscriber
 */

/**
 * @template T
 * @typedef {object} StoredPublishKit<T>
 * @property {Publisher<T>} publisher
 * @property {StoredSubscriber<T>} subscriber
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {'mandatory' | 'opportunistic' | 'ignored'} DurablePublishKitValueDurability
 *
 * Durability configures constraints on non-terminal values that can be
 * published to a durable publish kit (terminal values sent to finish or fail
 * must always be durable).
 * - 'mandatory' means that each value must be durable, so it can be restored
 *   on upgrade.
 * - 'opportunistic' means that a durable value is persisted for post-upgrade
 *   restoration, but a non-durable value is still accepted (and will result in
 *   valueless restoration).
 * - 'ignored' means that a value is not persisted for restoration even if it
 *   is durable.
 *
 * 'mandatory' is the only currently-supported value, and others must not be
 * enabled without test coverage.
 */

/**
 * @typedef {object} DurablePublishKitState
 *
 * @property {DurablePublishKitValueDurability} valueDurability
 *
 * @property {bigint} publishCount
 *
 * @property {'live' | 'finished' | 'failed'} status
 *
 * @property {boolean} hasValue
 * hasValue indicates the presence of value. It starts off false,
 * and can be reset to false when a durable publish kit is restored and
 * the previous value was not durable, or non-terminal and valueDurablity is 'ignored'.
 *
 * @property {any} value
 * value holds either a non-terminal value from `publish` or a terminal value
 * from `finish` or `fail`, depending upon the value in status.
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @template T
 * @typedef {object} UpdateRecord<T>
 * @property {T} value is whatever state the service wants to publish
 * @property {bigint} [updateCount] is a value that identifies the update.  For
 * the last update, it is `undefined`.
 */

/**
 * @template T
 * @typedef {BaseNotifier<T>} NotifierInternals Will be shared between machines,
 * so it must be safe to expose. But other software should avoid depending on
 * its internal structure.
 */

/**
 * @template T
 * @typedef {NotifierInternals<T> &
 *   ForkableAsyncIterable<T, T> &
 *   SharableNotifier<T>
 * } Notifier<T> an object that can be used to get the current state or updates
 */

/**
 * @template T
 * @typedef {object} SharableNotifier
 * @property {() => Promise<NotifierInternals<T>>} getSharableNotifierInternals
 * Used to replicate the multicast values at other sites. To manually create a
 * local representative of a Notification, do
 * ```js
 * localIterable =
 *   makeNotifier(E(remoteIterable).getSharableNotifierInternals());
 * ```
 * The resulting `localIterable` also supports such remote use, and
 * will return access to the same representation.
 */

/**
 * @template T
 * @typedef {object} NotifierRecord<T> the produced notifier/updater pair
 * @property {IterationObserver<T>} updater the (closely-held) notifier producer
 * @property {Notifier<T>} notifier the (widely-held) notifier consumer
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @template T
 * @typedef {IterableEachTopic<T> & EachTopic<T> &
 *   SharableSubscription<T>} Subscription<T>
 * A form of AsyncIterable supporting distributed and multicast usage.
 */

/**
 * @template T
 * @typedef {object} SharableSubscription
 * @property {() => Promise<EachTopic<T>>} getSharableSubscriptionInternals
 * Used to replicate the multicast values at other sites. To manually create a
 * local representative of a Subscription, do
 * ```js
 * localIterable =
 *   makeSubscription(E(remoteIterable).getSharableSubscriptionInternals());
 * ```
 * The resulting `localIterable` also supports such remote use, and
 * will return access to the same representation.
 */

/**
 * @template T
 * @typedef {object} SubscriptionRecord<T>
 * @property {IterationObserver<T>} publication
 * @property {Subscription<T>} subscription
 */

// /////////////////////////////////////////////////////////////////////////////

/** @template [Slot=unknown] @typedef {import('@endo/marshal').Marshal<Slot>} Marshaller */
/** @typedef {Pick<Marshaller, 'fromCapData'>} Unserializer */

/**
 * Defined by vstorageStoreKey in vstorage.go
 *
 * @typedef VStorageKey
 * @property {string} storeName
 * @property {string} storeSubkey
 * @property {string} dataPrefixBytes
 * @property {string} [noDataValue]
 */

/**
 * This represents a node in an IAVL tree.
 *
 * The active implementation is x/vstorage, an Agoric extension of the Cosmos SDK.
 *
 * Vstorage is a hierarchical externally-reachable storage structure that
 * identifies children by restricted ASCII name and is associated with arbitrary
 * string-valued data for each node, defaulting to the empty string.
 *
 * @typedef {object} StorageNode
 * @property {(data: string) => Promise<void>} setValue publishes some data (append to the node)
 * @property {() => string} getPath the chain storage path at which the node was constructed
 * @property {() => Promise<VStorageKey>} getStoreKey DEPRECATED use getPath
 * @property {(subPath: string, options?: {sequence?: boolean}) => StorageNode} makeChildNode
 */

/**
 * @typedef {object} StoredFacet
 * @property {() => Promise<string>} getPath the chain storage path at which the node was constructed
 * @property {StorageNode['getStoreKey']} getStoreKey DEPRECATED use getPath
 * @property {() => Unserializer} getUnserializer get the unserializer for the stored data
 */

/**
 * @deprecated use StoredSubscriber
 * @template T
 * @typedef {Subscription<T> & {
 *   getStoreKey: () => Promise<VStorageKey & { subscription: Subscription<T> }>,
 *   getUnserializer: () => Unserializer,
 * }} StoredSubscription
 */

/**
 * @template T
 * @typedef {Subscriber<T> & StoredFacet} StoredSubscriber
 */
