/**
 * A Timer device that provides a capability that can be used to schedule wake()
 * calls at particular times. The simpler form is a handler object with a wake()
 * function can be passed to D(timer).setWakeup(baseTime, handler) to be woken
 * after baseTime.
 *
 * The other form r = D(timer).makeRepeater(baseTime, interval) allows one to
 * create a repeater object which can be used to scheduled regular wakeups. Each
 * time D(timer).schedule(r, w) is called, w.wake(r) will be scheduled to be
 * called after the next multiple of interval since startTime. This doesn't
 * guarantee that the wake() calls will come at that exact time, but repeated
 * scheduling will not accumulate drift.
 *
 * The main entry point is buildRootDeviceNode(). The other exports are for
 * testing. Selected vats that need to schedule events can be given access to
 * the device.
 *
 * This code runs in the inner half of the device vat. It handles kernel objects
 * in serialized format, and uses SO() to send messages to them. The only device
 * object exposed to vats is the scheduler itself. The repeaters are identified
 * by sequential integers, so the vat must treat those as closely held, and
 * expose only capabilities that don't reveal them.
 */

import { Nat } from '@agoric/nat';
import { assert, details as X } from '@agoric/assert';
import { Far } from '@endo/marshal';

// Since we use harden when saving the state, we need to copy the arrays so they
// will continue to be mutable. each record inside handlers is immutable, so we
// can share those, but everything higher has to be copied. We copy on every
// save and when restoring on restart.
// If this turns out to be a problem, we could hold onto a mutable array of
// hardened {time, handlers} records, and copy them when we make changes, which
// would take many fewer copies than the current approach.
function copyState(schedState) {
  if (!schedState) {
    return [];
  }

  const newSchedule = [];
  for (const { time, handlers } of schedState) {
    assert.typeof(time, 'bigint');
    // we want a mutable copy of the handlers array, but not its contents.
    newSchedule.push({ time, handlers: handlers.slice(0) });
  }
  return newSchedule;
}

/**
 * @typedef {object} Event
 * @property {bigint} time
 * @property {Array<IndexedHandler>} handlers
 *
 * @typedef {object} IndexedHandler
 * @property {number} [index]
 * @property {Waker} waker
 *
 * @typedef {object} Waker
 * @property {(now: bigint) => void} wake
 */

/**
 * A MultiMap from times to one or more values. In addition to add() and
 * remove(), removeEventsThrough() supports removing (and returning) all the
 * key-value pairs with keys (deadlines) less than or equal to some value. The
 * values are either a handler (stored as { handler }) or a handler and a
 * repeater (stored as { handler, repeater }).
 *
 * To support quiescent solo vats (which normally only run if there's an
 * incoming event), we'd want to tell the host loop when we should next be
 * scheduled.
 *
 * @param {Array<Event>} [state=undefined]
 */
function makeTimerMap(state = undefined) {
  /**
   * @type {Array<Event>} an array containing events that should be triggered
   * after specific times.  Multiple events can be stored with the same time
   * {time, handlers: [handler, ...]}. The array will be kept sorted in
   * increasing order by timestamp.
   */
  const schedule = state ? copyState(state) : [];

  function cloneSchedule() {
    return copyState(schedule);
  }

  /** @param {bigint} time */
  function eventsFor(time) {
    assert.typeof(time, 'bigint');
    for (let i = 0; i < schedule.length && schedule[i].time <= time; i += 1) {
      if (schedule[i].time === time) {
        return schedule[i];
      }
    }
    const newRecord = { time, handlers: [] };
    schedule.push(newRecord);
    return newRecord;
  }

  // There's some question as to whether it's important to invoke the handlers
  // in the order of their deadlines. If so, we should probably ensure that the
  // recorded deadlines don't have finer granularity than the turns.
  /**
   *
   * @param {bigint} time
   * @param {IndexedHandler} handler
   * @param {number} [repeater]
   * @returns {bigint}
   */
  function add(time, handler, repeater = undefined) {
    assert.typeof(time, 'bigint');
    /** @type {IndexedHandler} */
    const handlerRecord =
      typeof repeater === 'number' ? { handler, index: repeater } : { handler };
    const { handlers: records } = eventsFor(time);
    records.push(handlerRecord);
    schedule.sort((a, b) => Number(a.time - b.time));
    return time;
  }

  /**
   * Remove and return all pairs indexed by numbers up to target
   *
   * @param {bigint} target
   */
  function removeEventsThrough(target) {
    assert.typeof(target, 'bigint');
    const returnValues = [];
    // remove events from last to first so as not to disturb the indexes.
    const reversedIndexesToRemove = [];
    for (let i = 0; i < schedule.length; i += 1) {
      const { time } = schedule[i];
      if (time > target) {
        break;
      }
      returnValues.push(schedule[i]);
      reversedIndexesToRemove.unshift(i);
    }
    for (const j of reversedIndexesToRemove) {
      schedule.splice(j, 1);
    }
    return returnValues;
  }

  // We don't expect this to be called often, so we don't optimize for it.
  /**
   *
   * @param {IndexedHandler} targetHandler
   * @returns {bigint[]}
   */
  function remove(targetHandler) {
    /** @type {bigint[]} */
    const droppedTimes = [];
    let i = 0;
    while (i < schedule.length) {
      const { time, handlers } = schedule[i];
      if (handlers.length === 1) {
        if (handlers[0] === targetHandler) {
          schedule.splice(i, 1);
          droppedTimes.push(time);
        } else {
          i += 1;
        }
      } else {
        // Nothing prevents a particular handler from appearing more than once
        for (const handler of handlers) {
          if (handler === targetHandler && handlers.indexOf(handler) !== -1) {
            handlers.splice(handlers.indexOf(handler), 1);
            droppedTimes.push(time);
          }
        }
        if (handlers.length === 0) {
          schedule.splice(i, 1);
        } else {
          i += 1;
        }
      }
    }
    return droppedTimes;
  }
  return harden({ add, remove, removeEventsThrough, cloneSchedule });
}

function nextScheduleTime(index, repeaters, lastPolled) {
  assert.typeof(lastPolled, 'bigint');
  const { startTime, interval } = repeaters[index];
  assert.typeof(startTime, 'bigint');
  assert.typeof(interval, 'bigint');
  // return the smallest value of `startTime + N * interval` after lastPolled
  return lastPolled + interval - ((lastPolled - startTime) % interval);
}

// curryPollFn provided at top level so it can be exported and tested.
function curryPollFn(SO, repeaters, deadlines, getLastPolledFn, saveStateFn) {
  // poll() is intended to be called by the host loop. Now might be Date.now(),
  // or it might be a block height.
  function poll(now) {
    const timeAndEvents = deadlines.removeEventsThrough(now);
    let wokeAnything = false;
    timeAndEvents.forEach(events => {
      const { time, handlers } = events;
      assert.typeof(time, 'bigint');
      for (const { index, handler } of handlers) {
        if (typeof index === 'number') {
          SO(handler).wake(time);
          if (repeaters[index]) {
            const next = nextScheduleTime(index, repeaters, getLastPolledFn());
            deadlines.add(next, handler, index);
          }
        } else {
          SO(handler).wake(time);
        }
        wokeAnything = true;
      }
    });
    if (wokeAnything) {
      saveStateFn();
    }

    return wokeAnything;
  }

  return poll;
}

export function buildRootDeviceNode(tools) {
  const { SO, getDeviceState, setDeviceState, endowments } = tools;
  const restart = getDeviceState();

  // A MultiMap from times to schedule objects, with optional repeaters
  const deadlines = makeTimerMap(restart ? restart.deadlines : undefined);

  // repeaters is an array storing repeater objects by index. When we delete,
  // we fill the hole with undefined so the indexes don't change. Copy
  // repeaters because it's frozen.
  const repeaters = restart ? restart.repeaters.slice(0) : [];

  // The latest time poll() was called. This might be a block height or it
  // might be a time from Date.now(). The current time is not reflected back
  // to the user.
  let lastPolled = restart ? restart.lastPolled : 0n;
  let nextRepeater = restart ? restart.nextRepeater : 0;

  function getLastPolled() {
    return lastPolled;
  }

  function saveState() {
    setDeviceState(
      harden({
        lastPolled,
        nextRepeater,
        // send copies of these so we can still modify them.
        repeaters: repeaters.slice(0),
        deadlines: deadlines.cloneSchedule(),
      }),
    );
  }

  function updateTime(time) {
    time >= lastPolled ||
      assert.fail(
        X`Time is monotonic. ${time} cannot be less than ${lastPolled}`,
      );
    lastPolled = time;
    saveState();
  }

  const innerPoll = curryPollFn(
    SO,
    repeaters,
    deadlines,
    getLastPolled,
    saveState,
  );
  const poll = t => {
    updateTime(t);
    return innerPoll(t);
  };
  endowments.registerDevicePollFunction(harden(poll));

  // The Root Device Node. There are two ways to schedule a callback. The
  // first is a straight setWakeup(), which says how soon, and what object to
  // send wake() to. The second is to create a repeater, which makes it
  // possible for vat code to reliably schedule repeating event. There's no
  // guarantee that the handler will be called at the precise desired time,
  // but the repeated calls won't accumulate timing drift, so the trigger
  // point will be reached at consistent intervals.
  return Far('root', {
    setWakeup(baseTime, handler) {
      baseTime = Nat(baseTime);
      deadlines.add(baseTime, handler);
      saveState();
      return baseTime;
    },
    /** @param {IndexedHandler} handler */
    removeWakeup(handler) {
      const times = deadlines.remove(handler);
      saveState();
      return harden(times);
    },
    getLastPolled,

    // We can't persist device objects at this point
    // (https://github.com/Agoric/SwingSet/issues/175), so we represent the
    // identity of Repeaters using unique indexes. The indexes are exposed
    // directly to the wrapper vat, and we rely on the wrapper vat to manage
    // the authority they represent as capabilities.
    makeRepeater(startTime, interval) {
      const index = nextRepeater;
      repeaters.push({
        startTime: Nat(startTime),
        interval: Nat(interval),
      });
      nextRepeater += 1;
      saveState();
      return index;
    },
    deleteRepeater(index) {
      repeaters[index] = undefined;
      saveState();
      return index;
    },
    /**
     * @param {number} index
     * @param {IndexedHandler} handler
     */
    schedule(index, handler) {
      const nextTime = nextScheduleTime(index, repeaters, lastPolled);
      deadlines.add(nextTime, handler, index);
      saveState();
      return nextTime;
    },
  });
}

/** @typedef {Device<ReturnType<typeof buildRootDeviceNode>>} TimerDevice */

// exported for testing. Only buildRootDeviceNode is intended for production
// use.
export { makeTimerMap, curryPollFn };
