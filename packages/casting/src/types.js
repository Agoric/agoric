// @jessie-check

// Ensure this is a module.
export {};

/**
 * @import {Notifier, Subscription} from '@agoric/notifier';
 */

/**
 * @typedef {object} LeaderOptions
 * @property {null | ((where: string, err: any, attempt?: number) => Promise<void>)} [retryCallback]
 * @property {(where: string) => Promise<void>} [jitter]
 * @property {(where: string) => Promise<boolean>} [keepPolling]
 */

/**
 * @typedef {object} CastingChange
 * @property {number} [blockHeight]
 * @property {Uint8Array[]} values
 */

/**
 * @typedef {object} Leader
 * @property {(where: string, error: any, attempt?: number) => Promise<void>} retry
 * @property {(where: string) => Promise<void>} jitter
 * @property {() => LeaderOptions} getOptions
 * @property {<T>(where: string, callback: (endpoint: string) => Promise<T>) => Promise<T[]>} mapEndpoints
 * @property {(spec: ERef<CastingSpec>) => Promise<Follower<CastingChange>>} watchCasting
 */

/** @typedef {ERef<Leader> | (() => ERef<Leader>)} LeaderOrMaker */

/**
 * @template T
 * @typedef {object} Follower
 * @property {() => Promise<AsyncIterable<T>>} getLatestIterable
 * @property {(options?: IterateEachOptions) => Promise<AsyncIterable<T>>} getEachIterable
 * @property {(options?: IterateEachOptions) => Promise<AsyncIterable<T>>} getReverseIterable
 */

/**
 * @typedef {object} ValueFollowerBase
 * @property {number} blockHeight
 * @property {number} currentBlockHeight
 */

/**
 * @see {ChangeFollower}
 * @template T
 * @typedef {ValueFollowerBase & ({ value: T } | { value: undefined, error: any })} ValueFollowerElement
 */

/**
 * @typedef {Pick<import('@endo/marshal').Marshal<unknown>, 'fromCapData' | 'unserialize'>} Unserializer
 */

/**
 * @typedef {object} Crasher
 * @property {(...args: unknown[]) => void} crash
 */

/**
 * @typedef {object} FollowerOptions
 * @property {null | import('@endo/far').FarRef<Unserializer>} [unserializer]
 * @property {(text: string) => any} [decode]
 * @property {'strict'|'optimistic'|'none'} [proof]
 * @property {import('@endo/far').FarRef<Crasher>} [crasher]
 */

/**
 * @typedef {object} CastingSpec
 * @property {string} [storeName]
 * @property {Uint8Array} [storeSubkey]
 * @property {Uint8Array} [dataPrefixBytes]
 * @property {Uint8Array} [noDataValue]
 * @property {ERef<Subscription<any>>} [subscription]
 * @property {ERef<Notifier<any>>} [notifier]
 */

/**
 * @typedef {object} IterateEachOptions
 * @property {number} [height]
 */

/**
 * @template T
 * @typedef {object} StreamCell
 * @property {number} blockHeight
 * @property {Array<T>} values
 */
