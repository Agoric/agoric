// @ts-check
import { makeAsVow } from './vow-utils.js';
import { prepareVowKit } from './vow.js';
import { prepareWatchUtils } from './watch-utils.js';
import { prepareWatch } from './watch.js';
import { prepareRetryableTools } from './retryable.js';
import { makeWhen } from './when.js';

/**
 * @import {Zone} from '@agoric/base-zone';
 * @import {Passable} from '@endo/pass-style';
 * @import {IsRetryableReason, AsPromiseFunction, Vow, VowTools} from './types.js';
 */

/**
 * NB: Not to be used in a Vat. It doesn't know what an upgrade is. For that you
 * need `prepareVowTools` from `vat.js`.
 *
 * @param {Zone} zone
 * @param {object} [powers]
 * @param {IsRetryableReason} [powers.isRetryableReason]
 * @returns {VowTools}
 */
export const prepareBasicVowTools = (zone, powers = {}) => {
  const { isRetryableReason = /** @type {IsRetryableReason} */ (() => false) } =
    powers;
  const makeVowKit = prepareVowKit(zone);
  const when = makeWhen(isRetryableReason);
  const watch = prepareWatch(zone, makeVowKit, isRetryableReason);
  const makeWatchUtils = prepareWatchUtils(zone, {
    watch,
    when,
    makeVowKit,
    isRetryableReason,
  });
  const watchUtils = makeWatchUtils();
  const asVow = makeAsVow(makeVowKit);

  const { retryable } = prepareRetryableTools(zone, {
    makeVowKit,
    isRetryableReason,
  });

  /**
   * Vow-tolerant implementation of Promise.all that takes an iterable of vows
   * and other {@link Passable}s and returns a single {@link Vow}. It resolves
   * with an array of values when all of the input's promises or vows are
   * fulfilled and rejects when any of the input's promises or vows are
   * rejected with the first rejection reason.
   *
   * @param {unknown[]} maybeVows
   */
  const all = maybeVows => watchUtils.all(maybeVows);

  /**
   * @param {unknown[]} maybeVows
   * @deprecated use `vowTools.all`
   */
  const allVows = all;

  /**
   * Vow-tolerant implementation of Promise.allSettled that takes an iterable
   * of vows and other {@link Passable}s and returns a single {@link Vow}. It
   * resolves when all of the input's promises or vows are settled with an
   * array of settled outcome objects.
   *
   * @param {unknown[]} maybeVows
   */
  const allSettled = maybeVows => watchUtils.allSettled(maybeVows);

  /** @type {AsPromiseFunction} */
  const asPromise = async (specimenP, ...watcherArgs) =>
    watchUtils.asPromise(specimenP, ...watcherArgs);

  return harden({
    when,
    watch,
    makeVowKit,
    all,
    allVows,
    allSettled,
    asVow,
    asPromise,
    retryable,
    retriable: retryable, // For temporary backwards compat with alpha implementation
  });
};
harden(prepareBasicVowTools);
