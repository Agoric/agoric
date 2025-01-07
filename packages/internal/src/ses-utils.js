// @ts-check
// @jessie-check
/**
 * @file Utility functions that are dependent upon a hardened environment,
 *   either directly or indirectly (e.g. by @endo imports).
 */

import { q, Fail, makeError, annotateError, X } from '@endo/errors';
import { deeplyFulfilled, isObject } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { makeQueue } from '@endo/stream';
import { asyncGenerate } from 'jessie.js';

const { fromEntries, keys, values } = Object;

/** @import {ERef} from '@endo/far' */

/**
 * @template T
 * @typedef {{ [KeyType in keyof T]: T[KeyType] } & {}} Simplify flatten the
 *   type output to improve type hints shown in editors
 *   https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
 */

/**
 * @typedef {(...args: any[]) => any} Callable
 */

/**
 * @template {{}} T
 * @typedef {{
 *   [K in keyof T]: T[K] extends Callable ? T[K] : DeeplyAwaited<T[K]>;
 * }} DeeplyAwaitedObject
 */

/**
 * @template T
 * @typedef {T extends PromiseLike<any>
 *     ? Awaited<T>
 *     : T extends {}
 *       ? Simplify<DeeplyAwaitedObject<T>>
 *       : Awaited<T>} DeeplyAwaited
 */

/**
 * A more constrained version of {deeplyFulfilled} for type safety until
 * https://github.com/endojs/endo/issues/1257 Useful in starting contracts that
 * need all terms to be fulfilled in order to be durable.
 *
 * @type {<T extends {}>(unfulfilledTerms: T) => Promise<DeeplyAwaited<T>>}
 */
export const deeplyFulfilledObject = async obj => {
  isObject(obj) || Fail`param must be an object`;
  return deeplyFulfilled(obj);
};

/**
 * Tolerate absence of AggregateError in e.g. xsnap.
 *
 * @type {(errors: Error[], message?: string, options?: object) => Error}
 */
const makeAggregateError =
  typeof AggregateError === 'function'
    ? (errors, message, options) => AggregateError(errors, message, options)
    : (errors, message, options) => {
        return makeError(message ?? 'multiple errors', undefined, {
          ...options,
          errors,
        });
      };

/**
 * @template T
 * @param {readonly (T | PromiseLike<T>)[]} items
 * @returns {Promise<T[]>}
 */
export const PromiseAllOrErrors = async items => {
  return Promise.allSettled(items).then(results => {
    const errors = /** @type {PromiseRejectedResult[]} */ (
      results.filter(({ status }) => status === 'rejected')
    ).map(result => result.reason);
    if (!errors.length) {
      return /** @type {PromiseFulfilledResult<T>[]} */ (results).map(
        result => result.value,
      );
    } else if (errors.length === 1) {
      throw errors[0];
    } else {
      throw makeAggregateError(errors);
    }
  });
};

/**
 * @template T
 * @param {() => Promise<T>} trier
 * @param {(error?: unknown) => Promise<unknown>} finalizer
 * @returns {ReturnType<trier>}
 */
export const aggregateTryFinally = async (trier, finalizer) =>
  trier().then(
    async result => finalizer().then(() => result),
    async tryError =>
      finalizer(tryError)
        .then(
          () => tryError,
          finalizeError => makeAggregateError([tryError, finalizeError]),
        )
        .then(async error => Promise.reject(error)),
  );

/**
 * Run a function with the ability to defer last-in-first-out cleanup callbacks.
 *
 * @template T
 * @param {(
 *   addCleanup: (fn: (err?: unknown) => Promise<void>) => void,
 * ) => Promise<T>} fn
 * @returns {ReturnType<fn>}
 */
export const withDeferredCleanup = async fn => {
  /** @type {((err?: unknown) => unknown)[]} */
  const cleanupsLIFO = [];
  /** @type {(cleanup: (err?: unknown) => unknown) => void} */
  const addCleanup = cleanup => {
    cleanupsLIFO.unshift(cleanup);
  };
  /** @type {(err?: unknown) => Promise<void>} */
  const finalizer = async err => {
    // Run each cleanup in its own isolated stack.
    const cleanupResults = cleanupsLIFO.map(async cleanup => {
      await null;
      return cleanup(err);
    });
    await PromiseAllOrErrors(cleanupResults);
  };
  return aggregateTryFinally(async () => fn(addCleanup), finalizer);
};

/**
 * @template {Record<string, unknown>} T
 * @typedef {{ [P in keyof T]: Exclude<T[P], undefined> }} AllDefined
 */

/**
 * Concise way to check values are available from object literal shorthand.
 * Throws error message to specify the missing values.
 *
 * @template {Record<string, unknown>} T
 * @param {T} obj
 * @returns {asserts obj is AllDefined<T>}
 * @throws if any value in the object entries is not defined
 */
export const assertAllDefined = obj => {
  const missing = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    Fail`missing ${q(missing)}`;
  }
};

/** @type {IteratorResult<undefined, never>} */
const notDone = harden({ done: false, value: undefined });

/** @type {IteratorResult<never, void>} */
const alwaysDone = harden({ done: true, value: undefined });

export const forever = asyncGenerate(() => notDone);

/**
 * @template T
 * @param {() => T} produce The value of `await produce()` is used for its
 *   truthiness vs falsiness. IOW, it is coerced to a boolean so the caller need
 *   not bother doing this themselves.
 * @returns {AsyncIterable<Awaited<T>>}
 */
export const whileTrue = produce =>
  asyncGenerate(async () => {
    const value = await produce();
    if (!value) {
      return alwaysDone;
    }
    return harden({
      done: false,
      value,
    });
  });

/**
 * @template T
 * @param {() => T} produce The value of `await produce()` is used for its
 *   truthiness vs falsiness. IOW, it is coerced to a boolean so the caller need
 *   not bother doing this themselves.
 * @returns {AsyncIterable<Awaited<T>>}
 */
export const untilTrue = produce =>
  asyncGenerate(async () => {
    const value = await produce();
    if (value) {
      return harden({
        done: true,
        value,
      });
    }
    return harden({
      done: false,
      value,
    });
  });

/** @type {<X, Y>(xs: X[], ys: Y[]) => [X, Y][]} */
export const zip = (xs, ys) => harden(xs.map((x, i) => [x, ys[+i]]));

/**
 * @type {<T extends Record<string, ERef<any>>>(
 *   obj: T,
 * ) => Promise<{ [K in keyof T]: Awaited<T[K]> }>}
 */
export const allValues = async obj => {
  const resolved = await Promise.all(values(obj));
  // @ts-expect-error cast
  return harden(fromEntries(zip(keys(obj), resolved)));
};

/**
 * A tee implementation where all readers are synchronized with each other. They
 * all consume the source stream in lockstep, and any one returning or throwing
 * early will affect the others.
 *
 * @template [T=unknown]
 * @param {AsyncIterator<T, void, void>} sourceStream
 * @param {number} readerCount
 */
export const synchronizedTee = (sourceStream, readerCount) => {
  /** @type {IteratorReturnResult<void> | undefined} */
  let doneResult;

  /**
   * @typedef {IteratorResult<
   *   (value: PromiseLike<IteratorResult<T>>) => void
   * >} QueuePayload
   */
  /** @type {import('@endo/stream').AsyncQueue<QueuePayload>[]} */
  const queues = [];

  /** @returns {Promise<void>} */
  const pullNext = async () => {
    const requests = await Promise.allSettled(
      queues.map(async queue => queue.get()),
    );
    const rejections = [];
    /** @type {Array<(value: PromiseLike<IteratorResult<T>>) => void>} */
    const resolvers = [];
    let done = false;
    for (const settledResult of requests) {
      if (settledResult.status === 'rejected') {
        rejections.push(settledResult.reason);
      } else {
        done ||= !!settledResult.value.done;
        resolvers.push(settledResult.value.value);
      }
    }
    /** @type {Promise<IteratorResult<T>>} */
    let result;
    if (doneResult) {
      result = Promise.resolve(doneResult);
    } else if (rejections.length) {
      const error = makeError(X`Teed stream threw`);
      annotateError(error, X`Teed rejections: ${rejections}`);
      result =
        sourceStream.throw?.(error) ||
        Promise.resolve(sourceStream.return?.()).then(async () =>
          Promise.reject(error),
        );
    } else if (done) {
      result =
        sourceStream.return?.() ||
        Promise.resolve({ done: true, value: undefined });
    } else {
      result = sourceStream.next();
    }
    result.then(
      r => {
        if (r.done) {
          doneResult = r;
        }
      },
      () => {
        doneResult = { done: true, value: undefined };
      },
    );
    for (const resolve of resolvers) {
      resolve(result);
    }
    return pullNext();
  };

  const readers = Array.from({ length: readerCount }).map(() => {
    /** @type {import('@endo/stream').AsyncQueue<QueuePayload>} */
    const queue = makeQueue();
    queues.push(queue);

    /** @type {AsyncGenerator<T, void, void>} */
    const reader = harden({
      async next() {
        /**
         * @type {import('@endo/promise-kit').PromiseKit<
         *   IteratorResult<T>
         * >}
         */
        const { promise, resolve } = makePromiseKit();
        queue.put({ value: resolve, done: false });
        return promise;
      },
      async return() {
        /**
         * @type {import('@endo/promise-kit').PromiseKit<
         *   IteratorResult<T>
         * >}
         */
        const { promise, resolve } = makePromiseKit();
        queue.put({ value: resolve, done: true });
        return promise;
      },
      async throw(reason) {
        const rejection = Promise.reject(reason);
        queue.put(rejection);
        return rejection;
      },
      // eslint-disable-next-line no-restricted-globals
      [Symbol.asyncIterator]() {
        return reader;
      },
      // eslint-disable-next-line no-restricted-globals
      async [Symbol.asyncDispose]() {
        await reader.return();
      },
    });
    return reader;
  });

  void pullNext();
  return readers;
};
