export {};

/**
 * @template T
 * @typedef {PromiseLike<T | Whenable<T>>} PromiseWhenable
 */

/**
 * @template [T=any]
 * @typedef {{ whenable0: { shorten(): Promise<T | Whenable<T>>} }} Whenable
 */

/**
 * @template [T=any]
 * @typedef {{
 *   whenable: import('./types.js').Whenable<T>,
 *   settler: Settler<T>,
 *   promise: Promise<T>
 * }} WhenableKit
 */

/**
 * @template [T=any]
 * @typedef {{ resolve(value?: T): void, reject(reason?: any): void }} Settler
 */

/**
 * @template [T=any]
 * @typedef {object} Watcher
 * @property {(value: T) => Whenable<TResult1> | PromiseWhenable<TResult1> | TResult1} [onFullfilled]
 * @property {(reason: any) => Whenable<TResult2> | PromiseWhenable<TResult2> | TResult2} [onRejected]
 */
