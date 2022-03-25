// @ts-check
import { E } from '@endo/eventual-send';
import { makePromiseKit } from '@endo/promise-kit';
import { observeIteration, observeIterator } from '../src/index.js';

import '../src/types.js';

/** @typedef {import('@endo/marshal').Passable} Passable */

/** @typedef {import('ava').Assertions} Assertions */

const obj = harden({});
const unresP = new Promise(_ => {});
const rejP = Promise.reject(new Error('foo'));
rejP.catch(_ => {}); // Suppress Node UnhandledPromiseRejectionWarning

/**
 * The non-final test values to be produced and tested for.
 *
 * @type {Passable[]}
 */
const payloads = harden([1, -0, undefined, NaN, obj, unresP, rejP, null]);

/**
 * The value to be used and tested for as the completion value for a successful finish.
 *
 * @type {Passable}
 */
const refResult = harden({});

/** The value to be used and tested for as the reason for an unsuccessful failure. */
const refReason = new Error('bar');

/**
 * Returns an AsyncIterable that enumerates the successive `payload` values
 * above in order. It then terminates either by successfully finishing or by
 * failing according to the `fails` parameter. If it finishes successfully,
 * `refResult` is the completion. If it fails, `refReason` is reported as the
 * reason for failure.
 *
 * @param {boolean} fails Does the returned async iterable finish successfully or fail?
 * @returns {AsyncIterable<Passable>}
 */
const makeTestIterable = fails => {
  return harden({
    [Symbol.asyncIterator]() {
      let i = 0;
      return harden({
        next() {
          if (i < payloads.length) {
            const value = payloads[i];
            i += 1;
            return Promise.resolve(harden({ value, done: false }));
          }
          if (fails) {
            return Promise.reject(refReason);
          }
          return Promise.resolve(harden({ value: refResult, done: true }));
        },
      });
    },
  });
};

export const finiteStream = makeTestIterable(false);
export const explodingStream = makeTestIterable(true);

/**
 * For testing a promise for the terminal value of the kind of test iteration
 * made by `makeTestIterable`. The `fails` parameter says whether we expect this
 * promise to succeed with the canonical `refResult` successful completion, or
 * to fail with the canonical `refReason` reason for failure.
 *
 * @param {Assertions} t
 * @param {ERef<Passable>} p
 * @param {boolean} fails
 */
export const testEnding = (t, p, fails) => {
  return E.when(
    p,
    result => {
      t.is(fails, false);
      t.is(result, refResult);
    },
    reason => {
      t.is(fails, true);
      t.is(reason, refReason);
    },
  );
};

/**
 * The tests below use `skip` so that they can correctly test that the non-final
 * iteration values they see are a sampling subset of the canonical testing
 * iteration if they're supposed to be. If lossy is false, then those tests
 * still test for exact conformance.
 *
 * @param {number} i
 * @param {Passable} value
 * @param {boolean} lossy
 * @returns {number}
 */
const skip = (i, value, lossy) => {
  if (!lossy) {
    return i;
  }
  while (i < payloads.length && !Object.is(value, payloads[i])) {
    i += 1;
  }
  return i;
};

/**
 * This tests whether `iterable` contains the non-final iteration values from
 * the canonical test iteration. It returns a promise for the termination to be
 * tested with `testEnding`. If `lossy` is true, then it only checks that these
 * non-final values are from a sampliing subset of the canonical test iteration.
 * Otherwise it checks for exact conformance.
 *
 * @param {Assertions} t
 * @param {AsyncIterable<Passable>} iterable
 * @param {boolean} lossy
 * @returns {Promise<Passable>}
 */
export const testManualConsumer = (t, iterable, lossy = false) => {
  const iterator = iterable[Symbol.asyncIterator]();
  const testLoop = i => {
    return iterator.next().then(
      ({ value, done }) => {
        i = skip(i, value, lossy);
        if (done) {
          t.is(i, payloads.length);
          return value;
        }
        t.truthy(i < payloads.length);
        // Need precise equality
        t.truthy(Object.is(value, payloads[i]));
        return testLoop(i + 1);
      },
      reason => {
        t.truthy(i <= payloads.length);
        throw reason;
      },
    );
  };
  return testLoop(0);
};

/**
 * `testAutoConsumer` does essentially the same job as `testManualConsumer`,
 * except `testAutoConsumer` consumes using the JavaScript `for-await-of`
 * syntax. However, the `for-await-of` loop cannot observe the final value of an
 * iteration, so this test consumer cannot report what it actually was. However,
 * it can tell whether the iteration finished successfully. In that case,
 * `testAutoConsumer` fulfills the returned promise with the canonical
 * `refResult` completion value, which is what `testEnding` expects.
 *
 * @param {Assertions} t
 * @param {AsyncIterable<Passable>} iterable
 * @param {boolean} lossy
 * @returns {Promise<Passable>}
 */
export const testAutoConsumer = async (t, iterable, lossy = false) => {
  let i = 0;
  try {
    for await (const value of iterable) {
      i = skip(i, value, lossy);
      t.truthy(i < payloads.length);
      // Need precise equality
      t.truthy(Object.is(value, payloads[i]));
      i += 1;
    }
  } finally {
    t.truthy(i <= payloads.length);
  }
  return refResult;
};

/**
 * Makes an IterationObserver which will test iteration reported to it against
 * the canonical test iteration.
 *
 * @param {Assertions} t
 * @param {boolean} lossy Are we checking every non-final value or only a sampling subset?
 * @param {boolean} fails Do we expect termination with the canonical successful
 *   completion or the canonical failure reason?
 * @returns {IterationObserver<Passable>}
 */
export const makeTestIterationObserver = (t, lossy, fails) => {
  let i = 0;
  return harden({
    updateState(newState) {
      i = skip(i, newState, lossy);
      t.truthy(i < payloads.length);
      // Need precise equality
      t.truthy(Object.is(newState, payloads[i]));
      i += 1;
    },
    finish(finalState) {
      t.is(fails, false);
      t.is(finalState, refResult);
    },
    fail(reason) {
      t.is(fails, true);
      t.is(reason, refReason);
    },
  });
};

/**
 * See the Paula example in the README
 *
 * @param {IterationObserver<Passable>} iterationObserver
 * @returns {void}
 */
export const paula = iterationObserver => {
  // Paula the publisher says
  iterationObserver.updateState('a');
  iterationObserver.updateState('b');
  iterationObserver.finish('done');
};

/**
 * See the Alice example in the README
 *
 * @param {AsyncIterable<Passable>} asyncIterable
 * @returns {Promise<Passable[]>}
 */
export const alice = async asyncIterable => {
  const log = [];

  try {
    for await (const val of asyncIterable) {
      log.push(['non-final', val]);
    }
    log.push(['finished']);
  } catch (reason) {
    log.push(['failed', reason]);
  }
  return log;
};

/**
 * See the Bob example in the README
 *
 * @param {ERef<AsyncIterable<Passable>>} asyncIterableP
 * @returns {Promise<Passable[]>}
 */
export const bob = async asyncIterableP => {
  const log = [];
  const observer = harden({
    updateState: val => log.push(['non-final', val]),
    finish: completion => log.push(['finished', completion]),
    fail: reason => log.push(['failed', reason]),
  });
  await observeIteration(asyncIterableP, observer);
  return log;
};

/**
 * See the Carol example in the README. The Alice and Bob code above have been
 * abstracted from the code in the README to apply to any IterationObserver and
 * AsyncIterable. By contrast, the Carol code is inherently specific to subscriptions.
 *
 * @param {ERef<Subscription<Passable>>} subscriptionP
 * @returns {Promise<Passable[]>}
 */
export const carol = async subscriptionP => {
  // @ts-ignore
  const subscriptionIteratorP = E(subscriptionP)[Symbol.asyncIterator]();
  const { promise: afterA, resolve: afterAResolve } = makePromiseKit();

  const makeObserver = log =>
    harden({
      updateState: val => {
        if (val === 'a') {
          afterAResolve(E(subscriptionIteratorP).subscribe());
        }
        log.push(['non-final', val]);
      },
      finish: completion => log.push(['finished', completion]),
      fail: reason => log.push(['failed', reason]),
    });

  const log1 = [];
  const observer1 = makeObserver(log1);
  const log2 = [];
  const observer2 = makeObserver(log2);

  const p1 = observeIterator(subscriptionIteratorP, observer1);
  // afterA is an ERef<Subscription> so we use observeIteration on it.
  const p2 = observeIteration(afterA, observer2);
  await Promise.all([p1, p2]);
  return [log1, log2];
};
