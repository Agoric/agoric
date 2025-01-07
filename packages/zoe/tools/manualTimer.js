import { Fail } from '@endo/errors';
import { Far } from '@endo/marshal';
import { bindAllMethods } from '@agoric/internal';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { TimeMath } from '@agoric/time';

/**
 * @import {TimerServiceCommon} from '@agoric/time';
 * @import {RemotableObject} from '@endo/pass-style';
 * @import {RemotableBrand} from '@endo/eventual-send';
 */

// we wrap SwingSet's buildManualTimer to accomodate the needs of
// zoe's tests

/**
 * @typedef {{
 *  timeStep?: import('@agoric/time').RelativeTime | bigint,
 *  eventLoopIteration?: () => Promise<void>,
 * }} ZoeManualTimerOptions
 */

const nolog = (..._args) => {};

/**
 * @typedef {object} ManualTimerAdmin
 * @property {(msg?: string) => void | Promise<void>} tick Advance the timer by one tick.
 * DEPRECATED: use `await tickN(1)` instead.  `tick` function errors might be
 * thrown synchronously, even though success is signaled by returning anything
 * other than a rejected promise.
 * @property {(nTimes: number, msg?: string) => Promise<void>} tickN
 */

/** @typedef {ReturnType<typeof buildManualTimer> & RemotableBrand<ManualTimerAdmin, TimerServiceCommon & ManualTimerAdmin> & ManualTimerAdmin} ZoeManualTimer */

/**
 * A fake TimerService, for unit tests that do not use a real
 * kernel. You can make time pass by calling `advanceTo(when)`, or one
 * `timeStep` at a time by calling `tick()`.
 *
 * `advanceTo()` merely schedules a wakeup: the actual
 * handlers (in the code under test) are invoked several turns
 * later. Some zoe/etc tests want to poll for the consequences of
 * those invocations. The best approach is to get an appropriate
 * Promise from your code-under-test, wait for it to fire, and then
 * poll. But some libraries do not offer this convenience, especially
 * when they use internal "fire and forget" actions.
 *
 * To support those tests, the manual timer accepts a
 * `eventLoopIteration` option. If provided, each call to `tick()`
 * will wait for all triggered activity to complete before
 * returning. That doesn't mean the `wake()` handler's result promise
 * has fired; it just means there are no settled Promises still trying
 * to execute their callbacks.
 *
 * The following will wait for all such Promise activity to finish
 * before returning from `tick()`:
 *
 *  eventLoopIteration = () => new Promise(setImmediate);
 *  mt = buildManualTimer(log, startTime, { eventLoopIteration })
 *
 * `tickN(count)` calls `tick()` multiple times, awaiting each one
 *
 * The first argument is called to log 'tick' events, which might help
 * with "golden transcript" -style tests to distinguish tick
 * boundaries
 *
 * @param {(...args: any[]) => void} [log]
 * @param {import('@agoric/time').Timestamp | bigint} [startValue=0n]
 * @param {ZoeManualTimerOptions} [options]
 * @returns {ZoeManualTimer}
 */

export const buildZoeManualTimer = (
  log = nolog,
  startValue = 0n,
  options = {},
) => {
  const { timeStep = 1n, eventLoopIteration, ...buildOptions } = options;
  const optSuffix = msg => (msg ? `: ${msg}` : '');
  const callbacks = {
    advanceTo: (newTime, msg) => log(`@@ tick:${newTime}${optSuffix(msg)} @@`),
    setWakeup: (now, when) =>
      log(`@@ schedule task for:${when}, currently: ${now} @@`),
    // wake: now => log(`@@ run task at:${now} @@`),
  };

  // neither of these could possibly be a record, because the caller
  // doesn't have our brand yet, but this makes the types maximally
  // tolerant
  startValue = TimeMath.absValue(startValue);
  const timeStepValue = TimeMath.relValue(timeStep);
  assert.typeof(startValue, 'bigint');
  assert.typeof(timeStepValue, 'bigint');

  const timerService = buildManualTimer({
    startTime: startValue,
    ...buildOptions,
    callbacks,
  });
  const toRT = rt =>
    TimeMath.coerceRelativeTimeRecord(rt, timerService.getTimerBrand());

  const tick = async msg => {
    const oldTime = timerService.getCurrentTimestamp();
    const newTime = TimeMath.addAbsRel(oldTime, toRT(timeStepValue));
    timerService.advanceTo(TimeMath.absValue(newTime), msg);
    // that schedules wakeups, but they don't fire until a later turn
    return eventLoopIteration && eventLoopIteration();
  };

  const tickN = async (nTimes, msg) => {
    nTimes >= 1 || Fail`invariant nTimes >= 1`;
    await null;
    for (let i = 0; i < nTimes; i += 1) {
      await tick(msg);
    }
  };

  return Far('ManualTimer', {
    ...bindAllMethods(timerService),
    tick,
    tickN,
  });
};
harden(buildZoeManualTimer);

// Default export is for backwards compatibility
export default buildZoeManualTimer;
