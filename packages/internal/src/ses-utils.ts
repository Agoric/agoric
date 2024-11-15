// @ts-check
// @jessie-check
/* eslint-disable no-use-before-define */
/**
 * @file Utility functions that are dependent upon a hardened environment,
 *   either directly or indirectly (e.g. by @endo imports).
 */

import { q, Fail, makeError, annotateError, X } from '@endo/errors';
import { deeplyFulfilled, isObject } from '@endo/marshal';
import { makePromiseKit, type PromiseKit } from '@endo/promise-kit';
import { makeQueue, type AsyncQueue } from '@endo/stream';
import { asyncGenerate } from 'jessie.js';

const { fromEntries, keys, values } = Object;

/**
 * flatten the
 *   type output to improve type hints shown in editors
 *   https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
 */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
export type Callable = (...args: any[]) => any;
export type DeeplyAwaitedObject<T extends {}> = {
  [K in keyof T]: T[K] extends Callable ? T[K] : DeeplyAwaited<T[K]>;
};
export type DeeplyAwaited<T> =
  T extends PromiseLike<any>
    ? Awaited<T>
    : T extends {}
      ? Simplify<DeeplyAwaitedObject<T>>
      : Awaited<T>;

/**
 * A more constrained version of {deeplyFulfilled} for type safety until
 * https://github.com/endojs/endo/issues/1257 Useful in starting contracts that
 * need all terms to be fulfilled in order to be durable.
 *
 * @type {<T extends {}>(unfulfilledTerms: T) => Promise<DeeplyAwaited<T>>}
 */
export const deeplyFulfilledObject: <T extends {}>(
  unfulfilledTerms: T,
) => Promise<DeeplyAwaited<T>> = async obj => {
  isObject(obj) || Fail`param must be an object`;
  return deeplyFulfilled(obj);
};

/**
 * Tolerate absence of AggregateError in e.g. xsnap.
 * @param errors
 * @param message
 * @param options
 */
const makeAggregateError: (
  errors: Error[],
  message?: string,
  options?: object,
) => Error =
  typeof AggregateError === 'function'
    ? (errors, message, options) => AggregateError(errors, message, options)
    : (errors, message, options) => {
        return makeError(message ?? 'multiple errors', undefined, {
          ...options,
          errors,
        });
      };

export const PromiseAllOrErrors = async <T>(
  items: readonly (T | PromiseLike<T>)[],
): Promise<T[]> => {
  return Promise.allSettled(items).then(results => {
    const errors: Error[] = results
      .filter(({ status }) => status === 'rejected')
      // @ts-expect-error narrowed by filter
      .map(result => result.reason);
    if (!errors.length) {
      return (results as PromiseFulfilledResult<T>[]).map(
        result => result.value,
      );
    } else if (errors.length === 1) {
      throw errors[0];
    } else {
      throw makeAggregateError(errors);
    }
  });
};

export const aggregateTryFinally = async <T>(
  trier: () => Promise<T>,
  finalizer: (error?: unknown) => Promise<unknown>,
): ReturnType<() => Promise<T>> =>
  trier().then(
    async result => finalizer().then(() => result),
    async tryError =>
      finalizer(tryError)
        .then(
          () => tryError,
          finalizeError => makeAggregateError([tryError, finalizeError]),
        )
        .then(error => Promise.reject(error)),
  );

/**
 * Run a function with the ability to defer last-in-first-out cleanup callbacks.
 *
 * @param fn
 */
export const withDeferredCleanup = async <T>(
  fn: (
    addCleanup: (cfn: (err?: unknown) => Promise<void>) => void,
  ) => Promise<T>,
): ReturnType<
  (addCleanup: (cfn: (err?: unknown) => Promise<void>) => void) => Promise<T>
> => {
  const cleanupsLIFO = [] as ((err?: unknown) => unknown)[];
  const addCleanup: (cleanup: (err?: unknown) => unknown) => void = cleanup => {
    cleanupsLIFO.unshift(cleanup);
  };
  const finalizer: (err?: unknown) => Promise<void> = async err => {
    // Run each cleanup in its own isolated stack.
    const cleanupResults = cleanupsLIFO.map(async cleanup => {
      await null;
      return cleanup(err);
    });
    await PromiseAllOrErrors(cleanupResults);
  };
  return aggregateTryFinally(() => fn(addCleanup), finalizer);
};

export type AllDefined<T extends Record<string, unknown>> = {
  [P in keyof T]: Exclude<T[P], undefined>;
};

/**
 * Concise way to check values are available from object literal shorthand.
 * Throws error message to specify the missing values.
 *
 * @param obj
 * @throws if any value in the object entries is not defined
 */
export function assertAllDefined<T extends Record<string, unknown>>(
  obj: T,
): asserts obj is AllDefined<T> {
  const missing = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    Fail`missing ${q(missing)}`;
  }
}
harden(assertAllDefined);

const notDone = harden({ done: false, value: undefined }) as IteratorResult<
  undefined,
  never
>;

const alwaysDone = harden({ done: true, value: undefined }) as IteratorResult<
  never,
  void
>;

export const forever = asyncGenerate(() => notDone);

/**
 * @param produce The value of `await produce()` is used for its
 *   truthiness vs falsiness. IOW, it is coerced to a boolean so the caller need
 *   not bother doing this themselves.
 */
export const whileTrue = <T>(produce: () => T): AsyncIterable<Awaited<T>> =>
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
 * @param produce The value of `await produce()` is used for its
 *   truthiness vs falsiness. IOW, it is coerced to a boolean so the caller need
 *   not bother doing this themselves.
 */
export const untilTrue = <T>(produce: () => T): AsyncIterable<Awaited<T>> =>
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

export const zip = <XT, YT>(xs: XT[], ys: YT[]): [XT, YT][] =>
  harden(xs.map((x, i) => [x, ys[+i]]));

export const allValues = async <T extends Record<string, ERef<any>>>(
  obj: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
  const resolved = await Promise.all(values(obj));
  // @ts-expect-error cast
  return harden(fromEntries(zip(keys(obj), resolved)));
};

/**
 * A tee implementation where all readers are synchronized with each other. They
 * all consume the source stream in lockstep, and any one returning or throwing
 * early will affect the others.
 *
 * @param sourceStream
 * @param readerCount
 */
export const synchronizedTee = <T = unknown>(
  sourceStream: AsyncIterator<T, void, void>,
  readerCount: number,
): AsyncGenerator<T, void, void>[] => {
  let doneResult: IteratorReturnResult<void> | undefined;

  type QueuePayload = IteratorResult<
    (value: PromiseLike<IteratorResult<T>>) => void
  >;
  const queues = [] as AsyncQueue<QueuePayload>[];

  const pullNext = async (): Promise<void> => {
    const requests = await Promise.allSettled(queues.map(queue => queue.get()));
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
    let result: Promise<IteratorResult<T>>;
    if (doneResult) {
      result = Promise.resolve(doneResult);
    } else if (rejections.length) {
      const error = makeError(X`Teed stream threw`);
      annotateError(error, X`Teed rejections: ${rejections}`);
      result =
        sourceStream.throw?.(error) ||
        Promise.resolve(sourceStream.return?.()).then(() =>
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
    const queue = makeQueue() as AsyncQueue<QueuePayload>;
    queues.push(queue);

    /** @type {AsyncGenerator<T, void, void>} */
    const reader = harden({
      async next() {
        const { promise, resolve } = makePromiseKit() as PromiseKit<
          IteratorResult<T>
        >;
        queue.put({ value: resolve, done: false });
        return promise;
      },
      async return() {
        const { promise, resolve } = makePromiseKit() as PromiseKit<
          IteratorResult<T>
        >;
        queue.put({ value: resolve, done: true });
        return promise;
      },
      async throw(reason: any) {
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
