// @ts-check
import { getVowPayload, basicE } from './vow-utils.js';
import { PromiseWatcherI, watchPromiseShim } from './watch-promise.js';

/**
 * @import {PromiseWatcher} from './watch-promise.js';
 * @import {ERef, Vow, VowKit, VowResolver, Watcher} from './types.js';
 */

const { apply } = Reflect;

/**
 * @param {typeof watchPromiseShim} watchPromise
 */
const makeWatchNextStep =
  watchPromise =>
  /**
   * If the specimen is a vow, obtain a fresh shortened promise from it,
   * otherwise coerce the non-vow specimen to a promise.  Then, associate a
   * (usually durable) watcher object with the promise.
   *
   * @param {any} specimen
   * @param {PromiseWatcher} promiseWatcher
   */
  (specimen, promiseWatcher) => {
    let promise;
    const payload = getVowPayload(specimen);
    if (payload) {
      promise = basicE(payload.vowV0).shorten();
    } else {
      promise = basicE.resolve(specimen);
    }
    watchPromise(promise, promiseWatcher);
  };

/**
 * @param {VowResolver | undefined} resolver
 * @param {Watcher<unknown, unknown, unknown> | undefined} watcher
 * @param {keyof Required<Watcher>} wcb
 * @param {unknown} value
 * @param {unknown} [watcherContext]
 */
const settle = (resolver, watcher, wcb, value, watcherContext) => {
  try {
    let chainedValue = value;
    const w = watcher && watcher[wcb];
    if (w) {
      chainedValue = apply(w, watcher, [value, watcherContext]);
    } else if (wcb === 'onRejected') {
      throw value;
    }
    resolver && resolver.resolve(chainedValue);
  } catch (e) {
    if (resolver) {
      resolver.reject(e);
    } else {
      // for host's unhandled rejection handler to catch
      throw e;
    }
  }
};

/**
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {(reason: any) => boolean} isRetryableReason
 * @param {ReturnType<typeof makeWatchNextStep>} watchNextStep
 */
const preparePromiseWatcher = (zone, isRetryableReason, watchNextStep) =>
  zone.exoClass(
    'PromiseWatcher',
    PromiseWatcherI,
    /**
     * @template [T=any]
     * @template [TResult1=T]
     * @template [TResult2=never]
     * @param {VowResolver<TResult1 | TResult2>} resolver
     * @param {Watcher<T, TResult1, TResult2>} [watcher]
     * @param {unknown} [watcherContext]
     */
    (resolver, watcher, watcherContext) => {
      const state = {
        vow: /** @type {unknown} */ (undefined),
        resolver,
        watcher,
        watcherContext: harden(watcherContext),
      };
      return /** @type {Partial<typeof state>} */ (state);
    },
    {
      /** @type {Required<PromiseWatcher>['onFulfilled']} */
      onFulfilled(value) {
        const { watcher, watcherContext, resolver } = this.state;
        if (getVowPayload(value)) {
          // We've been shortened, so reflect our state accordingly, and go again.
          this.state.vow = value;
          watchNextStep(value, this.self);
          return;
        }
        this.state.watcher = undefined;
        this.state.resolver = undefined;
        settle(resolver, watcher, 'onFulfilled', value, watcherContext);
      },
      /** @type {Required<PromiseWatcher>['onRejected']} */
      onRejected(reason) {
        const { vow, watcher, watcherContext, resolver } = this.state;
        if (vow && isRetryableReason(reason)) {
          watchNextStep(vow, this.self);
          return;
        }
        this.state.resolver = undefined;
        this.state.watcher = undefined;
        settle(resolver, watcher, 'onRejected', reason, watcherContext);
      },
    },
  );

/**
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {() => VowKit<any>} makeVowKit
 * @param {typeof watchPromiseShim} [watchPromise]
 * @param {(reason: any) => boolean} [isRetryableReason]
 */
export const prepareWatch = (
  zone,
  makeVowKit,
  watchPromise = watchPromiseShim,
  isRetryableReason = _reason => false,
) => {
  const watchNextStep = makeWatchNextStep(watchPromise);
  const makePromiseWatcher = preparePromiseWatcher(
    zone,
    isRetryableReason,
    watchNextStep,
  );

  /**
   * @template [T=unknown]
   * @template [TResult1=T]
   * @template [TResult2=T]
   * @template [C=unknown] watcher context
   * @param {ERef<T | Vow<T>>} specimenP
   * @param {Watcher<T, TResult1, TResult2>} [watcher]
   * @param {C} [watcherContext]
   */
  const watch = (specimenP, watcher, watcherContext) => {
    /** @type {VowKit<TResult1 | TResult2>} */
    const { resolver, vow } = makeVowKit();

    // Create a promise watcher to track vows, retrying upon rejection as
    // controlled by `isRetryableReason`.
    const promiseWatcher = makePromiseWatcher(
      resolver,
      watcher,
      watcherContext,
    );

    // Coerce the specimen to a promise, and start the watcher cycle.
    watchPromise(basicE.resolve(specimenP), promiseWatcher);

    return vow;
  };
  harden(watch);

  return watch;
};

harden(prepareWatch);

/** @typedef {ReturnType<typeof prepareWatch>} Watch */
