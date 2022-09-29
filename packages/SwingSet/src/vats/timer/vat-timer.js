/* eslint-disable no-use-before-define */
// @ts-check

import { E } from '@endo/eventual-send';
import { Far, passStyleOf } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { Nat } from '@agoric/nat';
import { assert } from '@agoric/assert';
import {
  provideKindHandle,
  provideDurableMapStore,
  provideDurableWeakMapStore,
  defineDurableKindMulti,
  vivifyKind,
  vivifySingleton,
} from '@agoric/vat-data';
import { makeScalarWeakMapStore } from '@agoric/store';
import { TimeMath } from './timeMath.js';

// This consumes O(N) RAM only for outstanding promises, via wakeAt(),
// delay(), and Notifiers/Iterators (for each actively-waiting
// client). Everything else should remain in the DB.

/**
 * @typedef {object} Handler
 * Handler is a user-provided Far object with .wake(time) used for callbacks
 * @property {(scheduled: Timestamp) => unknown} wake
 *
 * @typedef {unknown} CancelToken
 * CancelToken must be pass-by-reference and durable, either local or remote
 *
 * @typedef {{
 *  scheduleYourself: () => void,
 *  fired: (now: TimestampValue) => void,
 *  cancel: () => void,
 * }} Event
 *
 * @typedef {MapStore<TimestampValue, Event[]>} Schedule
 *
 * @typedef {{ cancel: () => void }} Cancellable
 *
 * @typedef {WeakMapStore<CancelToken, Cancellable[]>} CancelTable
 *
 * @typedef {unknown} PromiseEvent
 *
 * @typedef {{
 *  resolve: (scheduled: Timestamp) => void
 *  reject: (err: unknown) => void
 * }} WakeupPromiseControls
 *
 * @typedef {LegacyWeakMap<PromiseEvent, WakeupPromiseControls>} WakeupPromiseTable
 */

// These (pure) internal functions are exported for unit tests.

/**
 * Insert an event into the schedule at its given time.
 *
 * @param {Schedule} schedule
 * @param {TimestampValue} when
 * @param {Event} event
 */
const addEvent = (schedule, when, event) => {
  assert.typeof(when, 'bigint');
  if (!schedule.has(when)) {
    schedule.init(when, harden([event]));
  } else {
    // events track their .scheduled time, so if addEvent() is called,
    // it is safe to assume the event isn't already scheduled
    schedule.set(when, harden([...schedule.get(when), event]));
  }
};

/**
 * Remove an event from the schedule
 *
 * @param {Schedule} schedule
 * @param {TimestampValue} when
 * @param {Event} event
 */
const removeEvent = (schedule, when, event) => {
  if (schedule.has(when)) {
    /** @typedef { Event[] } */
    const originalEvents = schedule.get(when);
    /** @typedef { Event[] } */
    const remainingEvents = originalEvents.filter(ev => ev !== event);
    if (remainingEvents.length === 0) {
      schedule.delete(when);
    } else if (remainingEvents.length < originalEvents.length) {
      schedule.set(when, harden(remainingEvents));
    }
  }
};

/**
 * Add a CancelToken->Event registration
 *
 * @param {CancelTable} cancels
 * @param {CancelToken} cancelToken
 * @param {Cancellable} event
 */
const addCancel = (cancels, cancelToken, event) => {
  if (!cancels.has(cancelToken)) {
    cancels.init(cancelToken, harden([event]));
  } else {
    // Each cancelToken can cancel multiple events, but we only
    // addCancel() for each event once, so it is safe to assume the
    // event is not already there. This was useful for debugging.
    // const oldEvents = cancels.get(cancelToken);
    // assert(oldEvents.indexOf(event) === -1, 'addCancel duplicate event');
    const events = [...cancels.get(cancelToken), event];
    cancels.set(cancelToken, harden(events));
  }
};

/**
 * Remove a CancelToken->Event registration
 *
 * @param {CancelTable} cancels
 * @param {CancelToken} cancelToken
 * @param {Cancellable} event
 */
const removeCancel = (cancels, cancelToken, event) => {
  assert(cancelToken !== undefined); // that would be super confusing
  // this check is to tolerate a race between cancel and timer, but it
  // also means we ignore a bogus cancelToken
  if (cancels.has(cancelToken)) {
    const oldEvents = cancels.get(cancelToken);
    const newEvents = oldEvents.filter(oldEvent => oldEvent !== event);
    if (newEvents.length === 0) {
      cancels.delete(cancelToken);
    } else if (newEvents.length < oldEvents.length) {
      cancels.set(cancelToken, harden(newEvents));
    }
  }
};

/**
 * @param {Schedule} schedule
 * @returns {TimestampValue | undefined}
 */
const firstWakeup = schedule => {
  // console.log(`--fW:`);
  // for (const [time, events] of schedule.entries()) {
  //   console.log(` ${time} ${events.map(e => e.toString()).join(',')}`);
  // }
  const iter = schedule.keys()[Symbol.iterator]();
  const first = iter.next();
  if (first.done) {
    return undefined;
  }
  return first.value;
};

// if you really must replace "time <= upto" below, use this
// const timeLTE(a, b) {
//    return TimeMath.compareAbs(a, b) !== 1;
// }
// if (timeLTE(time, upto)) {

/**
 * return list of events for time <= upto
 *
 * @param {Schedule} schedule
 * @param {TimestampValue} upto
 * @returns { Event[] }
 */
const removeEventsUpTo = (schedule, upto) => {
  assert.typeof(upto, 'bigint');
  let ready = [];
  for (const [time, events] of schedule.entries()) {
    if (time <= upto) {
      ready = ready.concat(events);
      schedule.delete(time);
    } else {
      break; // don't walk the entire future
    }
  }
  return ready;
};

/*
 * measureInterval: used to schedule repeaters
 *
 * given (start=10, interval=10), i.e. 10,20,30,..
 *
 *  | now | latest?.count | latest?.time | next.time | next.count |
 *  |-----+---------------+--------------+-----------+------------|
 *  |   0 |     undefined |    undefined |        10 |          1 |
 *  |   1 |     undefined |    undefined |        10 |          1 |
 *  |   9 |     undefined |    undefined |        10 |          1 |
 *  |  10 |             1 |           10 |        20 |          2 |
 *  |  11 |             1 |           10 |        20 |          2 |
 *  |  19 |             1 |           10 |        20 |          2 |
 *  |  20 |             2 |           20 |        30 |          3 |
 *  |  21 |             2 |           20 |        30 |          3 |
 *  |  29 |             2 |           20 |        30 |          3 |
 *  |  30 |             3 |           30 |        40 |          4 |
 *
 * @param {TimestampValue} start
 * @param {RelativeTimeValue} interval
 * @param {TimestampValue} now
 * @returns { latest: [{ time: TimestampValue, count: bigint }],
 *            next: { time: TimestampValue, count: bigint } }
 */
const measureInterval = (start, interval, now) => {
  // Used to schedule repeaters.
  assert.typeof(start, 'bigint');
  assert.typeof(interval, 'bigint');
  assert.typeof(now, 'bigint');
  let latest;
  const next = { time: start, count: 1n };
  if (now >= start) {
    // 'latestTime' is the largest non-future value of
    // start+k*interval
    const latestTime = now - ((now - start) % interval);
    // 'latestCount' is the 1-indexed counter of events at or before
    // the current time
    const age = Number(now) - Number(start);
    const latestCount = BigInt(Math.floor(age / Number(interval))) + 1n;
    latest = { time: latestTime, count: latestCount };

    // 'next.time' is the smallest future value of start+k*interval
    next.time = latest.time + interval;
    next.count = latest.count + 1n;
  }
  return { latest, next };
};

export const buildRootObject = (vatPowers, _vatParameters, baggage) => {
  const { D } = vatPowers;

  /** @type {import('../../devices/timer/device-timer.js').TimerDevice=} */
  let timerDevice;
  const insistDevice = () => {
    assert(timerDevice, 'TimerService used before createTimerService()');
  };

  if (baggage.has('timerDevice')) {
    // we're an upgraded version: use the previously-stored device
    timerDevice = baggage.get('timerDevice');
  }

  // These Kinds are the ongoing obligations of the vat: all future
  // versions must define behaviors for these. Search for calls to
  // 'vivifyKind', 'vivifySingleton', or 'defineDurableKindMulti'.
  // * oneShotEvent
  // * promiseEvent
  // * repeaterEvent
  // * timerRepeater
  // * timerNotifier
  // * timerIterator
  // * wakeupHandler
  // * timerService
  // * timerClock
  // * timerBrand

  const repeaterHandle = provideKindHandle(baggage, 'timerRepeater');
  const notifierHandle = provideKindHandle(baggage, 'timerNotifier');

  // we have two durable tables: 'schedule' and 'cancels'

  // The 'schedule' maps upcoming timestamps to the Event that should
  // be fired. We rely upon the earlier-vs-later sortability of BigInt
  // keys, and upon our Stores performing efficient iteration.

  /** @type {Schedule} */
  const schedule = provideDurableMapStore(baggage, 'schedule');

  // 'cancels' maps cancel handles to Cancellables that will be
  // removed. Cancellables are either Events (and each event knows its
  // own .scheduled time, so we can find and remove it from
  // 'schedule'), or a Notifier's 'canceller' facet (to mark
  // unscheduled / idle Notifiers for the next time they're invoked).

  /** @type {CancelTable} */
  const cancels = provideDurableWeakMapStore(baggage, 'cancels');

  // Then an *ephemeral* WeakMap to hang on to the ephemeral Promise
  // resolve/reject functions for delay/wakeAt. We can't hold these
  // bare functions in the (durable) PromiseEvent, but we *can* use
  // the PromiseEvent as a key to fetch them when the event
  // fires. It's ok for these to be ephemeral: all promises get
  // rejected (with { name: 'vatUpgraded' }) during an upgrade, so if
  // the timer fires *after* an upgrade, we no longer need to reject
  // it ourselves. The RAM usage will be O(N) on the number of pending
  // Promise-based wakeups currently scheduled.

  /** @type {WakeupPromiseTable} */
  const wakeupPromises = makeScalarWeakMapStore('promises');

  // -- helper functions

  /**
   * convert an internal TimestampValue into a branded Timestamp
   *
   * @param {TimestampValue} when
   * @returns {Timestamp}
   */
  const toTimestamp = when => {
    return TimeMath.toAbs(when); // TODO (when, brand)
  };

  /**
   * convert external (branded) Timestamp to internal bigint
   *
   * @param {Timestamp} when
   * @returns {TimestampValue}
   */
  const fromTimestamp = when => {
    return TimeMath.absValue(when); // TODO: brand
  };

  /**
   * convert external (branded) RelativeTime to internal bigint
   *
   * @param {RelativeTime} delta
   * @returns {RelativeTimeValue}
   */
  const fromRelativeTime = delta => TimeMath.relValue(delta);

  const reschedule = () => {
    // the first wakeup should be in the future: the device will not
    // immediately fire when given a stale request
    const newFirstWakeup = firstWakeup(schedule);
    // idempotent and ignored if not currently registered
    D(timerDevice).removeWakeup(wakeupHandler);
    if (newFirstWakeup) {
      D(timerDevice).setWakeup(newFirstWakeup, wakeupHandler);
    }
  };

  /**
   * @returns {TimestampValue}
   */
  const getNow = () => {
    insistDevice();
    return Nat(D(timerDevice).getLastPolled());
  };

  // this gets called when the device's wakeup message reaches us
  const processAndReschedule = () => {
    // first, service everything that is ready
    const now = getNow();
    removeEventsUpTo(schedule, now).forEach(event => event.fired(now));
    // then, reschedule for whatever is up next
    reschedule();
  };

  // we have three kinds of events in our 'schedule' table: "one-shot"
  // (for setWakeup), "promise" (for wakeAt and delay, also used by
  // makeNotifier), and repeaters (for makeRepeater and repeatAfter)

  // In general these events are in one of three states, with three
  // transitions:
  //
  // idle --start--> scheduled : event is on 'schedule' and maybe 'cancels'
  // idle --start--> fired : not on either
  // scheduled --fired--> fired : already removed from 'schedule',
  //                              must remove from 'cancels'
  // scheduled --cancel--> cancelled : already removed from 'cancels',
  //                                   must remove from schedule

  // -- Event (one-shot)

  /**
   * @param {TimestampValue} when
   * @param {Handler} handler
   * @param {CancelToken} [cancelToken]
   */
  const initOneShotEvent = (when, handler, cancelToken) => {
    return { when, handler, cancelToken };
  };

  const oneShotEventBehavior = {
    scheduleYourself({ self, state }) {
      addEvent(schedule, state.when, self);
      if (state.cancelToken) {
        addCancel(cancels, state.cancelToken, self);
      }
      reschedule();
    },

    fired({ self, state }, now) {
      if (state.cancelToken) {
        removeCancel(cancels, state.cancelToken, self); // stop tracking
      }
      // we tell the client the most recent time available
      const p = E(state.handler).wake(now);
      // one-shots ignore errors, but note this does make handler
      // errors harder to notice.  TODO we'd use E.sendOnly() for
      // non-repeaters, if it existed
      p.catch(_err => undefined);
    },

    cancel({ self, state }) {
      removeEvent(schedule, state.when, self);
      reschedule();
    },
  };

  const makeOneShotEvent = vivifyKind(
    baggage,
    'oneShotEvent',
    initOneShotEvent,
    oneShotEventBehavior,
  );

  // -- Event (promise)

  const initPromiseEvent = (when, cancelToken) => {
    return { when, cancelToken };
  };

  const promiseEventBehavior = {
    scheduleYourself({ self, state }) {
      addEvent(schedule, state.when, self);
      if (state.cancelToken) {
        addCancel(cancels, state.cancelToken, self);
      }
      reschedule();
    },

    fired({ self, state }, now) {
      if (state.cancelToken) {
        removeCancel(cancels, state.cancelToken, self); // stop tracking
      }
      if (wakeupPromises.has(self)) {
        wakeupPromises.get(self).resolve(now);
        // else we were upgraded and promise was rejected/disconnected
      }
    },

    cancel({ self, state }) {
      removeEvent(schedule, state.when, self);
      reschedule();
      if (wakeupPromises.has(self)) {
        // TODO: don't want our stack trace here, not helpful. Maybe
        // create singleton Error at module scope?
        wakeupPromises.get(self).reject(Error('TimerCancelled'));
      }
    },
  };

  /**
   * @returns { PromiseEvent }
   */
  const makePromiseEvent = vivifyKind(
    baggage,
    'promiseEvent',
    initPromiseEvent,
    promiseEventBehavior,
  );

  /**
   * @param {TimestampValue} when
   * @param {TimestampValue} now
   * @param {CancelToken} cancelToken
   * @returns {Promise<Timestamp>}
   */
  const wakeAtInternal = (when, now, cancelToken) => {
    if (when <= now) {
      return Promise.resolve(toTimestamp(now));
    }
    const event = makePromiseEvent(when, cancelToken);
    const { resolve, reject, promise } = makePromiseKit();
    // these 'controls' are never shared off-vat, but we wrap them as
    // Far to appease WeakMapStore's value requirements
    const controls = Far('controls', { resolve, reject });
    wakeupPromises.init(event, controls);
    event.scheduleYourself();
    return promise; // disconnects upon upgrade
  };

  // -- Event (repeaters)

  // state machine:
  // idle --start--> scheduled : on 'schedule' and maybe 'cancels'
  // idle --start--> firing : maybe on 'cancels'
  // scheduled --fired--> firing : already removed from 'schedule'
  // scheduled --cancel--> cancelled: already removed from 'cancels'
  // firing --resp.resolve--> scheduled: (reschedule) add to 'schedule'
  // firing --resp.reject--> cancelled: maybe remove from 'cancels'
  // firing --cancel--> cancelled: already removed from 'cancels'
  // cancelled --resp.resolve--> cancelled
  // cancelled --resp.reject--> cancelled

  const initRepeaterEvent = (start, interval, handler, cancelToken) => {
    const scheduled = undefined; // wakeup time if scheduled, clear if firing
    const cancelled = false; // set to 'true' once cancelled
    return { start, interval, handler, scheduled, cancelled, cancelToken };
  };

  const repeaterEventBehavior = {
    scheduleYourself({ self, state }) {
      if (state.cancelToken) {
        addCancel(cancels, state.cancelToken, self);
      }
      const now = getNow();
      if (state.start === now) {
        state.scheduled = now;
        self.fired(now);
      } else {
        const { next } = measureInterval(state.start, state.interval, now);
        state.scheduled = next.time; // cleared if fired/cancelled
        addEvent(schedule, next.time, self);
        reschedule();
      }
    },

    fired({ self, state }, now) {
      state.scheduled = undefined;
      // repeaters stay in "firing" until their promise settles
      E(state.handler)
        .wake(now)
        .then(
          _res => self.wakerDone(), // reschedule unless cancelled
          _err => self.wakerFailed(), // do not reschedule
        )
        .catch(err => console.log(`timer repeater error`, err));
    },

    wakerDone({ self, state }) {
      if (!state.cancelled) {
        const now = getNow();
        const { next } = measureInterval(state.start, state.interval, now);
        state.scheduled = next.time; // cleared if fired/cancelled
        addEvent(schedule, next.time, self);
        reschedule();
      }
    },

    wakerFailed({ self, state }) {
      if (state.cancelToken) {
        removeCancel(cancels, state.cancelToken, self); // stop tracking
      }
    },

    cancel({ self, state }) {
      // TODO: consider handler.onError
      if (state.scheduled !== undefined) {
        removeEvent(schedule, state.scheduled, self);
        reschedule();
        state.scheduled = undefined; // not strictly necessary, event is dropped
      }
      state.cancelled = true; // for wakerDone to check
      state.cancelToken = undefined; // for wakerFailed to check
    },
  };

  const makeRepeaterEvent = vivifyKind(
    baggage,
    'repeaterEvent',
    initRepeaterEvent,
    repeaterEventBehavior,
  );

  // -- now we can define the public API functions

  /**
   * @returns {Timestamp}
   */
  const getCurrentTimestamp = () => toTimestamp(getNow());

  /**
   * @param {Timestamp} when
   * @param {Handler} handler
   * @param {CancelToken} [cancelToken]
   * @returns {Timestamp}
   */
  const setWakeup = (when, handler, cancelToken = undefined) => {
    when = fromTimestamp(when);
    assert.equal(passStyleOf(handler), 'remotable', 'bad setWakeup() handler');
    if (cancelToken) {
      assert.equal(passStyleOf(cancelToken), 'remotable', 'bad cancel token');
    }
    const now = getNow();
    if (when <= now) {
      const p = E(handler).wake(now); // would prefer sendOnly()
      p.catch(_err => undefined);
    } else {
      const event = makeOneShotEvent(when, handler, cancelToken);
      event.scheduleYourself();
    }
    // TODO this is the documented behavior, but is it useful?
    return toTimestamp(when);
  };

  /**
   * wakeAt(when): return a Promise that fires (with the scheduled
   * wakeup time) somewhat after 'when'. If a 'cancelToken' is
   * provided, calling ts.cancel(cancelToken) before wakeup will cause
   * the Promise to be rejected instead.
   *
   * @param {Timestamp} when
   * @param {CancelToken} [cancelToken]
   * @returns { Promise<Timestamp> }
   */
  const wakeAt = (when, cancelToken = undefined) => {
    when = fromTimestamp(when);
    const now = getNow();
    return wakeAtInternal(when, now, cancelToken);
  };

  /**
   * addDelay(delay): return a Promise that fires (with the scheduled
   * wakeup time) at 'delay' time units in the future.
   *
   * @param {RelativeTime} delay
   * @param {CancelToken} [cancelToken]
   * @returns { Promise<Timestamp> }
   */
  const addDelay = (delay, cancelToken = undefined) => {
    delay = fromRelativeTime(delay);
    assert(delay >= 0n, 'delay must not be negative');
    const now = getNow();
    const when = now + delay;
    return wakeAtInternal(when, now, cancelToken);
  };

  /**
   * cancel(token): Cancel an outstanding one-shot, or a Notifier
   * (outstanding or idle), or new-style repeater (not `makeRepeater`,
   * which has .disable). For things that return Promises, the Promise
   * is rejected with Error('TimerCancelled').
   *
   * @param {CancelToken} cancelToken
   */
  const cancel = cancelToken => {
    // silently ignore multiple cancels and bogus token
    if (cancels.has(cancelToken)) {
      const cancelled = cancels.get(cancelToken);
      cancels.delete(cancelToken);
      cancelled.forEach(thing => thing.cancel());
    }
  };

  /**
   * Internal function to register a handler, which will be invoked as
   * handler.wake(scheduledTime) at the earliest non-past instance of
   * `start + k*interval`. When the wake() result promise
   * fulfills, the repeater will be rescheduled for the next such
   * instance (there may be gaps). If that promise rejects, the
   * repeater will be cancelled. The repeater can also be cancelled by
   * providing `cancelToken` and calling
   * `E(timerService).cancel(cancelToken)`.
   *
   * @param {TimestampValue} start
   * @param {RelativeTimeValue} interval
   * @param {Handler} handler
   * @param {CancelToken} [cancelToken]
   */
  const repeat = (start, interval, handler, cancelToken) => {
    assert.typeof(start, 'bigint');
    assert.typeof(interval, 'bigint');
    assert(interval > 0n, 'interval must be positive');
    const event = makeRepeaterEvent(start, interval, handler, cancelToken);
    // computes first wakeup, inserts into schedule, updates alarm. If
    // start has passed already, fires immediately.
    event.scheduleYourself();
  };

  // --- Repeaters: legacy "distinct Repeater object" API ---

  // The durable Repeater object is built from (delay, interval)
  // arguments which requests a wakeup at the earliest non-past
  // instance of `now + delay + k*interval`. The returned object
  // provides {schedule, disable} methods. We build an Event from it.

  const initRepeater = (delay, interval) => {
    // first wakeup at now+delay, then now+delay+k*interval
    delay = fromRelativeTime(delay);
    assert(delay >= 0n, 'delay must be non-negative');
    interval = fromRelativeTime(interval);
    assert(interval > 0n, 'interval must be nonzero');
    const start = getNow() + delay;
    const active = false;
    return { start, interval, active };
  };
  const repeaterFacets = {
    cancel: {} /* internal CancelToken */,
    repeater: {
      schedule({ state, facets }, handler) {
        assert(
          passStyleOf(handler) === 'remotable',
          'bad repeater.schedule() handler',
        );
        assert(!state.active, 'repeater already scheduled');
        state.active = true;
        repeat(state.start, state.interval, handler, facets.cancel);
      },
      disable({ state, facets }) {
        if (state.active) {
          cancel(facets.cancel);
          state.active = false;
        }
      },
    },
  };
  const createRepeater = defineDurableKindMulti(
    repeaterHandle,
    initRepeater,
    repeaterFacets,
  );
  const makeRepeater = (delay, interval) =>
    createRepeater(delay, interval).repeater;

  /**
   * @param {RelativeTime} delay
   * @param {RelativeTime} interval
   * @param {Handler} handler
   * @param {CancelToken} [cancelToken]
   */
  const repeatAfter = (delay, interval, handler, cancelToken) => {
    // first wakeup at now+delay, then now+delay+k*interval
    delay = fromRelativeTime(delay);
    interval = fromRelativeTime(interval);
    const now = getNow();
    const start = now + delay;
    return repeat(start, interval, handler, cancelToken);
  };

  // -- notifiers

  // First we define the Iterator, since Notifiers are Iterable.

  const initIterator = notifier => ({
    notifier,
    updateCount: undefined,
    active: false,
  });
  const iteratorBehavior = {
    next({ state }) {
      assert(!state.active, 'timer iterator dislikes overlapping next()');
      state.active = true;
      return state.notifier
        .getUpdateSince(state.updateCount)
        .then(({ value, updateCount: newUpdateCount }) => {
          state.active = false;
          state.updateCount = newUpdateCount;
          return harden({ value, done: newUpdateCount === undefined });
        });
    },
  };
  const createIterator = vivifyKind(
    baggage,
    'timerIterator',
    initIterator,
    iteratorBehavior,
  );

  // Our Notifier behaves as if it was fed with an semi-infinite
  // series of Timestamps, starting at 'start' (= 'delay' + the moment
  // at which the makeNotifier() message was received), and emitting a
  // new value every 'interval', until the Notifier is cancelled
  // (which might never happen). The 'updateCount' begins at '1' for
  // 'start', then '2' for 'start+interval', etc. We start at '1'
  // instead of '0' as defense against clients who incorrectly
  // interpret any falsy 'updateCount' as meaning "notifier has
  // finished" instead of using the correct `=== undefined` test. A
  // cancelled Notifier is switched into a state where all
  // getUpdateSince() calls return a Promise which immediately fires
  // with time of cancellation.

  // Each update reports the time at which the update was scheduled,
  // even if vat-timer knows it is delivering the update a little
  // late.

  /**
   * @param {RelativeTime} delay
   * @param {RelativeTime} interval
   * @param {CancelToken} [cancelToken]
   */
  const initNotifier = (delay, interval, cancelToken = undefined) => {
    // first wakeup at now+delay, then now+delay+k*interval
    delay = fromRelativeTime(delay);
    assert(delay >= 0n, 'delay must be non-negative');
    interval = fromRelativeTime(interval);
    assert(interval > 0n, 'interval must be nonzero');
    const now = getNow();
    const start = now + delay;
    if (cancelToken) {
      assert.equal(passStyleOf(cancelToken), 'remotable', 'bad cancel token');
    }
    const final = undefined; // set when cancelled
    return { start, interval, cancelToken, final };
  };

  const notifierFacets = {
    notifier: {
      [Symbol.asyncIterator]({ facets }) {
        return createIterator(facets.notifier);
      },
      async getUpdateSince({ facets, state }, updateCount = -1n) {
        // if the Notifier has never fired, they have no business
        // giving us a non-undefined updateCount, but we don't hold
        // that against them: we treat it as stale, not an error
        const { start, interval, cancelToken, final } = state;
        if (final) {
          return final;
        }
        const now = getNow();
        const mi = measureInterval(start, interval, now);
        const unstarted = mi.latest === undefined;
        const wantNext =
          unstarted || (mi.latest && mi.latest.count === updateCount);

        //   notifier   ||     client-submitted updateCount       |
        //    state     ||   undefined  |   stale    |   fresh    |
        // |------------||--------------+------------+------------|
        // | started    || latest       | latest     | next       |
        // | unstarted  || next (first) | next (err) | next (err) |
        // | cancelled  || final        | final      | final      |

        if (wantNext) {
          // wakeAtInternal() will fire with a 'thenTS' Timestamp of
          // when vat-timer receives the device wakeup, which could be
          // somewhat later than the scheduled time (even if the
          // device is triggered exactly on time).
          return wakeAtInternal(mi.next.time, now, cancelToken).then(
            thenTS => {
              // We recompute updateCount at firing time, as if their
              // getUpdateSince() arrived late, to maintain the 1:1
              // pairing of 'value' and 'updateCount'.
              const then = fromTimestamp(thenTS);
              const { latest } = measureInterval(start, interval, then);
              assert(latest);
              const value = toTimestamp(latest.time);
              return harden({ value, updateCount: latest.count });
            },
            // Else, our (active) promiseEvent was cancelled, so this
            // rejection will race with canceller.cancel() below (and
            // any other getUpdateSince() Promises that are still
            // waiting). Exactly one will create the "final value" for
            // all current and future getUpdateSince() clients.
            _cancelErr => facets.canceller.cancel({ state }),
          );
        } else {
          // fire with the latest (previous) event time
          assert(mi.latest);
          const value = toTimestamp(mi.latest.time);
          return harden({ value, updateCount: mi.latest.count });
        }
      },
    },

    canceller: {
      cancel({ state }) {
        if (!state.final) {
          // We report the cancellation time, and an updateCount of
          // 'undefined', which indicates the Notifier is exhausted.
          const value = toTimestamp(getNow());
          state.final = harden({ value, updateCount: undefined });
        }
        return state.final; // for convenience of waitForNext()
      },
    },
  };

  const finishNotifier = ({ state, facets }) => {
    const { cancelToken } = state;
    if (cancelToken) {
      addCancel(cancels, cancelToken, facets.canceller);
    }
  };
  const createNotifier = defineDurableKindMulti(
    notifierHandle,
    initNotifier,
    notifierFacets,
    { finish: finishNotifier },
  );

  /**
   * makeNotifier(delay, interval): return a Notifier that fires on
   * the same schedule as makeRepeater()
   *
   * @param {RelativeTime} delay
   * @param {RelativeTime} interval
   * @param {CancelToken} cancelToken
   * @returns { BaseNotifier<Timestamp> }
   */
  const makeNotifier = (delay, interval, cancelToken) =>
    createNotifier(delay, interval, cancelToken).notifier;

  // -- now we finally build the TimerService

  const wakeupHandler = vivifySingleton(baggage, 'wakeupHandler', {
    wake: processAndReschedule,
  });

  const timerService = vivifySingleton(baggage, 'timerService', {
    getCurrentTimestamp,
    setWakeup /* one-shot with handler (absolute) */,
    wakeAt /* one-shot with Promise (absolute) */,
    delay: addDelay /* one-shot with Promise (relative) */,
    makeRepeater /* repeater with Repeater control object (old) */,
    repeatAfter /* repeater without control object */,
    makeNotifier /* Notifier */,
    cancel /* cancel setWakeup/wakeAt/delay/repeat */,
    getClock: () => timerClock,
    getTimerBrand: () => timerBrand,
  });

  // attenuated read-only facet
  const timerClock = vivifySingleton(baggage, 'timerClock', {
    getCurrentTimestamp,
    getTimerBrand: () => timerBrand,
  });

  // powerless identifier
  const timerBrand = vivifySingleton(baggage, 'timerBrand', {
    isMyTimerService: alleged => alleged === timerService,
    isMyClock: alleged => alleged === timerClock,
  });

  // If we needed to do anything during upgrade, now is the time,
  // since all our Kind obligations are met.

  // if (baggage.has('timerDevice')) {
  //   console.log(`--post-upgrade wakeup`);
  //   for (const [time, events] of schedule.entries()) {
  //     console.log(` -- ${time}`, events);
  //   }
  // }

  /**
   * createTimerService() registers devices.timer and returns the
   * timer service. This must called at least once, to connect the
   * device, but we don't prohibit it from being called again (to
   * replace the device), just in case that's useful someday
   *
   * @param {import('../../devices/timer/device-timer.js').TimerDevice} timerNode
   * @returns {Promise<TimerService>}
   */
  const createTimerService = timerNode => {
    timerDevice = timerNode;
    if (baggage.has('timerDevice')) {
      baggage.set('timerDevice', timerDevice);
    } else {
      baggage.init('timerDevice', timerDevice);
    }
    // @ts-expect-error Type mismatch hard to diagnose
    return timerService;
  };

  return Far('root', { createTimerService });
};

export const debugTools = harden({
  addEvent,
  removeEvent,
  addCancel,
  removeCancel,
  removeEventsUpTo,
  firstWakeup,
  measureInterval,
});
