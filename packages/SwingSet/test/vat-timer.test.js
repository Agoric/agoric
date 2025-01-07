// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';

import { Far, E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { makeScalarMapStore } from '@agoric/store';
import { TimeMath } from '@agoric/time';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import { buildRootObject, debugTools } from '../src/vats/timer/vat-timer.js';

test('schedule', t => {
  const schedule = makeScalarMapStore();

  const addEvent = (when, event) => debugTools.addEvent(schedule, when, event);
  const removeEvent = (when, event) =>
    debugTools.removeEvent(schedule, when, event);
  const firstWakeup = () => debugTools.firstWakeup(schedule);
  const removeEventsUpTo = upto => debugTools.removeEventsUpTo(schedule, upto);

  // exercise the ordered list, without concern about the durability
  // the handlers
  addEvent(10n, 'e10');
  addEvent(30n, 'e30');
  addEvent(20n, 'e20');
  addEvent(30n, 'e30x');
  t.deepEqual(schedule.get(10n), ['e10']);
  t.deepEqual(schedule.get(20n), ['e20']);
  t.deepEqual(schedule.get(30n), ['e30', 'e30x']);
  t.is(firstWakeup(), 10n);

  let done = removeEventsUpTo(5n);
  t.deepEqual(done, []);
  done = removeEventsUpTo(10n);
  t.deepEqual(done, ['e10']);
  t.is(firstWakeup(), 20n);
  done = removeEventsUpTo(10n);
  t.deepEqual(done, []);
  done = removeEventsUpTo(35n);
  t.deepEqual(done, ['e20', 'e30', 'e30x']);
  t.is(firstWakeup(), undefined);
  done = removeEventsUpTo(40n);
  t.deepEqual(done, []);

  addEvent(50n, 'e50');
  addEvent(50n, 'e50x');
  addEvent(60n, 'e60');
  addEvent(70n, 'e70');
  addEvent(70n, 'e70x');
  t.deepEqual(schedule.get(50n), ['e50', 'e50x']);
  t.is(firstWakeup(), 50n);
  removeEvent(50n, 'e50');
  t.deepEqual(schedule.get(50n), ['e50x']);
  // removing a bogus event is ignored
  removeEvent('50n', 'bogus');
  t.deepEqual(schedule.get(50n), ['e50x']);
  removeEvent(50n, 'e50x');
  t.not(schedule.has(50n));
  t.is(firstWakeup(), 60n);
});

test('cancels', t => {
  const cancels = makeScalarMapStore();
  const addCancel = (cancelToken, event) =>
    debugTools.addCancel(cancels, cancelToken, event);
  const removeCancel = (cancelToken, event) =>
    debugTools.removeCancel(cancels, cancelToken, event);

  const cancel1 = Far('cancel token', {});
  const cancel2 = Far('cancel token', {});
  const cancel3 = Far('cancel token', {});
  addCancel(cancel1, 'e10');
  addCancel(cancel2, 'e20');
  addCancel(cancel3, 'e30');
  addCancel(cancel3, 'e30x'); // cancels can be shared among events

  t.deepEqual(cancels.get(cancel1), ['e10']);
  t.deepEqual(cancels.get(cancel2), ['e20']);
  t.deepEqual(cancels.get(cancel3), ['e30', 'e30x']);

  removeCancel(cancel1, 'e10');
  t.not(cancels.has(cancel1));

  // bogus cancels are ignored
  removeCancel('bogus', 'e20');
  t.deepEqual(cancels.get(cancel2), ['e20']);
  // unrecognized events are ignored
  removeCancel(cancel2, 'bogus');
  t.deepEqual(cancels.get(cancel2), ['e20']);

  removeCancel(cancel3, 'e30x');
  t.deepEqual(cancels.get(cancel3), ['e30']);
  removeCancel(cancel3, 'e30');
  t.not(cancels.has(cancel3));

  t.throws(() => removeCancel(undefined)); // that would be confusing
});

test('measureInterval', t => {
  const { measureInterval } = debugTools; // mi(start, interval, now)
  const interval = 10n;
  let start;
  const mi = now => {
    const { latest, next } = measureInterval(start, interval, now);
    return [latest?.time, latest?.count, next.time, next.count];
  };

  start = 0n; // 0,10,20,30
  t.deepEqual(mi(0n), [0n, 1n, 10n, 2n]);
  t.deepEqual(mi(1n), [0n, 1n, 10n, 2n]);
  t.deepEqual(mi(9n), [0n, 1n, 10n, 2n]);
  t.deepEqual(mi(10n), [10n, 2n, 20n, 3n]);
  t.deepEqual(mi(11n), [10n, 2n, 20n, 3n]);
  t.deepEqual(mi(20n), [20n, 3n, 30n, 4n]);

  start = 5n; // 5,15,25,35
  t.deepEqual(mi(0n), [undefined, undefined, 5n, 1n]);
  t.deepEqual(mi(4n), [undefined, undefined, 5n, 1n]);
  t.deepEqual(mi(5n), [5n, 1n, 15n, 2n]);
  t.deepEqual(mi(14n), [5n, 1n, 15n, 2n]);
  t.deepEqual(mi(15n), [15n, 2n, 25n, 3n]);
  t.deepEqual(mi(25n), [25n, 3n, 35n, 4n]);

  start = 63n; // 63,73,83,93
  t.deepEqual(mi(0n), [undefined, undefined, 63n, 1n]);
  t.deepEqual(mi(9n), [undefined, undefined, 63n, 1n]);
  t.deepEqual(mi(62n), [undefined, undefined, 63n, 1n]);
  t.deepEqual(mi(63n), [63n, 1n, 73n, 2n]);
  t.deepEqual(mi(72n), [63n, 1n, 73n, 2n]);
  t.deepEqual(mi(73n), [73n, 2n, 83n, 3n]);
  t.deepEqual(mi(83n), [83n, 3n, 93n, 4n]);
});

const setup = async (t, allowRefire = false) => {
  const state = {
    now: 0n, // current time, updated during test
    currentWakeup: undefined,
    currentHandler: undefined,
  };
  const deviceMarker = harden({});
  const timerDeviceFuncs = harden({
    getLastPolled: () => state.now,
    setWakeup: (when, handler) => {
      assert.equal(state.currentWakeup, undefined, 'one at a time');
      assert.equal(state.currentHandler, undefined, 'one at a time');
      if (state.currentWakeup !== undefined) {
        assert(
          state.currentWakeup > state.now,
          `too late: ${state.currentWakeup} <= ${state.now}`,
        );
      }
      state.currentWakeup = when;
      state.currentHandler = handler;
      return when;
    },
    removeWakeup: _handler => {
      state.currentWakeup = undefined;
      state.currentHandler = undefined;
    },
  });
  const D = node => {
    assert.equal(node, deviceMarker, 'fake D only supports devices.timer');
    return timerDeviceFuncs;
  };
  const vatPowers = { D };

  const vatParameters = {};
  // const baggage = makeScalarBigMapStore();
  const baggage = makeScalarMapStore();

  const root = buildRootObject(vatPowers, vatParameters, baggage);
  const ts = await E(root).createTimerService(deviceMarker);

  const fired = {};
  const makeHandler = which =>
    Far('handler', {
      wake(time) {
        // handlers/promises get the most recent timestamp
        if (!allowRefire) {
          // some tests re-use the handler, but the rest should not
          // observe handler.wake() called more than once
          t.is(fired[which], undefined, 'wake() called multiple times');
        }
        fired[which] = time;
      },
    });

  const thenFire = (p, which) => {
    p.then(
      value => (fired[which] = ['fulfill', value]),
      err => (fired[which] = ['reject', err]),
    );
  };

  // The device/poll() side of the timer deals strictly with
  // BigInts. The API side deals with branded Timestamp and
  // RelativeTime records, and tolerates unbranded values. vat-timer
  // creates the brand internally.

  const timerBrand = ts.getTimerBrand();
  const toTS = value => TimeMath.coerceTimestampRecord(value, timerBrand);
  const toRT = value => TimeMath.coerceRelativeTimeRecord(value, timerBrand);

  return { ts, state, fired, makeHandler, thenFire, toTS, toRT };
};

test('getCurrentTimestamp', async t => {
  // now = ts.getCurrentTimestamp()
  const { ts, state, toTS } = await setup(t);
  t.not(ts, undefined);
  state.now = 10n;
  t.deepEqual(ts.getCurrentTimestamp(), toTS(10n));
  t.deepEqual(ts.getCurrentTimestamp(), toTS(10n));
  state.now = 20n;
  t.deepEqual(ts.getCurrentTimestamp(), toTS(20n));
});

test('brand', async t => {
  // ts.getTimerBrand(), brand.isMyTimerService()
  const { ts } = await setup(t);
  const brand = ts.getTimerBrand();
  const clock = ts.getClock();

  t.is(ts.getTimerBrand(), brand);
  t.true(brand.isMyTimerService(ts));
  t.false(brand.isMyTimerService({}));
  t.false(brand.isMyTimerService(brand));
  t.false(brand.isMyTimerService(clock));

  t.true(brand.isMyClock(clock));
  t.false(brand.isMyClock({}));
  t.false(brand.isMyClock(brand));
  t.false(brand.isMyClock(ts));

  const handler = Far('handler', { wake: _time => 0 });
  const right = ts.getTimerBrand();
  const wrong = Far('wrong', {
    isMyTimerService: () => false,
    isMyClock: () => false,
  });
  t.not(right, wrong);

  const when = TimeMath.coerceTimestampRecord(1000n, wrong);
  const delay = TimeMath.coerceRelativeTimeRecord(1000n, wrong);
  const exp = { message: /TimerBrands must match/ };
  t.throws(() => ts.setWakeup(when, handler), exp);
  t.throws(async () => ts.wakeAt(when), exp);
  t.throws(async () => ts.delay(delay), exp);
  t.throws(() => ts.makeRepeater(delay, delay), exp);
  t.throws(() => ts.repeatAfter(delay, delay, handler), exp);
  t.throws(() => ts.makeNotifier(delay, delay), exp);

  /*
  // API no longer accepts old-style TimestampValues (without brand)
  const whenNobrand = 123n;
  const delayNobrand = 123n;
  const expTS = { message: /TimerService takes branded Timestamp/ };
  const expRT = { message: /TimerService takes branded RelativeTime/ };
  t.throws(() => ts.setWakeup(whenNobrand, handler), expTS);
  t.throws(() => ts.wakeAt(whenNobrand), expTS);
  t.throws(() => ts.delay(delayNobrand), expRT);
  t.throws(() => ts.makeRepeater(delayNobrand, delayNobrand), expRT);
  t.throws(() => ts.repeatAfter(delayNobrand, delayNobrand, handler), expRT);
  t.throws(() => ts.makeNotifier(delayNobrand, delayNobrand), expRT);
  */

  // API still accepts old-style TimestampValues
  const whenNobrand = 123n;
  const delayNobrand = 123n;
  ts.setWakeup(whenNobrand, handler);
  void ts.wakeAt(whenNobrand);
  void ts.delay(delayNobrand);
  ts.makeRepeater(delayNobrand, delayNobrand);
  ts.repeatAfter(delayNobrand, delayNobrand, handler);
  ts.makeNotifier(delayNobrand, delayNobrand);
});

test('clock', async t => {
  // clock.getCurrentTimestamp(), clock.getTimerBrand()
  const { ts, state, toTS } = await setup(t);
  const clock = ts.getClock();

  state.now = 10n;
  t.deepEqual(clock.getCurrentTimestamp(), toTS(10n));
  t.deepEqual(clock.getCurrentTimestamp(), toTS(10n));
  state.now = 20n;
  t.deepEqual(clock.getCurrentTimestamp(), toTS(20n));

  t.is(clock.setWakeup, undefined);
  t.is(clock.wakeAt, undefined);
  t.is(clock.makeRepeater, undefined);

  const brand = ts.getTimerBrand();
  t.is(clock.getTimerBrand(), brand);
  t.true(brand.isMyClock(clock));
  t.false(brand.isMyClock({}));
});

test('setWakeup', async t => {
  // ts.setWakeup(when, handler, cancelToken) -> when
  const { ts, state, fired, makeHandler, toTS } = await setup(t);

  t.not(ts, undefined);
  t.is(state.currentWakeup, undefined);

  t.deepEqual(ts.getCurrentTimestamp(), toTS(state.now));

  // the first setWakeup sets the alarm
  const t30 = ts.setWakeup(toTS(30n), makeHandler(30));
  t.deepEqual(t30, toTS(30n));
  t.is(state.currentWakeup, 30n);
  t.not(state.currentHandler, undefined);

  // an earlier setWakeup brings the alarm forward
  const cancel20 = Far('cancel token', {});
  ts.setWakeup(toTS(20n), makeHandler(20), cancel20);
  t.is(state.currentWakeup, 20n);

  // deleting the earlier pushes the alarm back
  ts.cancel(cancel20);
  t.is(state.currentWakeup, 30n);

  // later setWakeups do not change the alarm
  ts.setWakeup(toTS(40n), makeHandler(40));
  ts.setWakeup(toTS(50n), makeHandler(50));
  ts.setWakeup(toTS(50n), makeHandler('50x'));
  // cancel tokens can be shared
  const cancel6x = Far('cancel token', {});
  ts.setWakeup(toTS(60n), makeHandler(60n), cancel6x);
  ts.setWakeup(toTS(60n), makeHandler('60x'));
  ts.setWakeup(toTS(61n), makeHandler(61n), cancel6x);
  t.is(state.currentWakeup, 30n);

  // wake up exactly on time (30n)
  state.now = 30n;
  state.currentHandler.wake(30n);
  await waitUntilQuiescent();
  t.deepEqual(fired[20], undefined); // was removed
  t.deepEqual(fired[30], toTS(30n)); // fired
  t.deepEqual(fired[40], undefined); // not yet fired
  // resets wakeup to next alarm
  t.is(state.currentWakeup, 40n);
  t.not(state.currentHandler, undefined);

  // wake up a little late (41n), then message takes a while to arrive
  // (51n), all wakeups before/upto the arrival time are fired, and
  // they all get the most recent timestamp
  state.now = 51n;
  state.currentHandler.wake(toTS(41n));
  await waitUntilQuiescent();
  t.deepEqual(fired[40], toTS(51n));
  t.deepEqual(fired[50], toTS(51n));
  t.deepEqual(fired['50x'], toTS(51n));
  t.deepEqual(fired[60], undefined);
  t.is(state.currentWakeup, 60n);
  t.not(state.currentHandler, undefined);

  // a setWakeup in the past will be fired immediately
  ts.setWakeup(toTS(21n), makeHandler(21));
  await waitUntilQuiescent();
  t.deepEqual(fired[21], toTS(51n));

  // as will a setWakeup for the exact present
  ts.setWakeup(toTS(51n), makeHandler(51));
  await waitUntilQuiescent();
  t.deepEqual(fired[51], toTS(51n));

  // the remaining time-entry handler should still be there
  state.now = 65n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired['60x'], toTS(65n));
});

test('wakeAt', async t => {
  // p = ts.wakeAt(absolute, cancelToken=undefined)
  const { ts, state, fired, thenFire, toTS } = await setup(t);

  const cancel10 = Far('cancel token', {});
  const cancel20 = Far('cancel token', {});
  thenFire(ts.wakeAt(toTS(10n), cancel10), '10');
  thenFire(ts.wakeAt(toTS(10n)), '10x');
  thenFire(ts.wakeAt(toTS(20n), cancel20), '20');

  t.is(state.currentWakeup, 10n);

  state.now = 10n;
  state.currentHandler.wake(10n);
  await waitUntilQuiescent();
  t.deepEqual(fired['10'], ['fulfill', toTS(10n)]);
  t.deepEqual(fired['10x'], ['fulfill', toTS(10n)]);
  t.deepEqual(fired['20'], undefined);

  // late cancel is ignored
  ts.cancel(cancel10);

  // adding a wakeAt in the past will fire immediately
  thenFire(ts.wakeAt(toTS(5n)), '5');
  await waitUntilQuiescent();
  t.deepEqual(fired['5'], ['fulfill', toTS(10n)]);

  // as will a wakeAt for exactly now
  thenFire(ts.wakeAt(toTS(10n)), '10y');
  await waitUntilQuiescent();
  t.deepEqual(fired['10y'], ['fulfill', toTS(10n)]);

  // cancelling a wakeAt causes the promise to reject
  ts.cancel(cancel20);
  await waitUntilQuiescent();
  t.deepEqual(fired['20'], ['reject', Error('TimerCancelled')]);

  // duplicate cancel is ignored
  ts.cancel(cancel20);
});

test('delay', async t => {
  // p = ts.delay(relative, cancelToken=undefined)
  const { ts, state, fired, thenFire, toTS, toRT } = await setup(t);

  state.now = 100n;

  const cancel10 = Far('cancel token', {});
  const cancel20 = Far('cancel token', {});
  thenFire(ts.delay(toRT(10n), cancel10), '10'); // =110
  thenFire(ts.delay(toRT(10n)), '10x'); // =110
  thenFire(ts.delay(toRT(20n), cancel20), '20'); // =120

  t.is(state.currentWakeup, 110n);

  state.now = 110n;
  state.currentHandler.wake(110n);
  await waitUntilQuiescent();
  t.deepEqual(fired['10'], ['fulfill', toTS(110n)]);
  t.deepEqual(fired['10x'], ['fulfill', toTS(110n)]);
  t.deepEqual(fired['20'], undefined);

  // late cancel is ignored
  ts.cancel(cancel10);

  // delay=0 fires immediately
  thenFire(ts.delay(toRT(0n)), '0');
  await waitUntilQuiescent();
  t.deepEqual(fired['0'], ['fulfill', toTS(110n)]);

  // delay must be non-negative
  t.throws(async () => ts.delay(toRT(-1n)), {
    message: /Must be non-negative/,
  });

  // cancelling a delay causes the promise to reject
  ts.cancel(cancel20);
  await waitUntilQuiescent();
  t.deepEqual(fired['20'], ['reject', Error('TimerCancelled')]);

  // duplicate cancel is ignored
  ts.cancel(cancel20);
});

test('makeRepeater', async t => {
  // r=ts.makeRepeater(delay, interval); r.schedule(handler); r.disable();
  const { ts, state, fired, makeHandler, toTS, toRT } = await setup(t, true);

  state.now = 3n;

  // fire at T=25,35,45,..
  const r1 = ts.makeRepeater(toRT(22n), toRT(10n));
  t.is(state.currentWakeup, undefined); // not scheduled yet
  // interval starts at now+delay as computed during ts.makeRepeater,
  // not recomputed during r1.schedule()
  state.now = 4n;
  r1.schedule(makeHandler(1));
  t.is(state.currentWakeup, 25n);

  // duplicate .schedule throws
  const h2 = makeHandler(2);
  t.throws(() => r1.schedule(h2), { message: 'repeater already scheduled' });

  // empty handler throws
  t.throws(() => r1.schedule(), { message: 'bad repeater.schedule() handler' });

  state.now = 5n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], undefined); // not yet

  state.now = 24n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], undefined); // wait for it

  state.now = 25n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(25n)); // fired
  t.is(state.currentWakeup, 35n); // primed for next time

  // if we miss a couple, next wakeup is in the future
  state.now = 50n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(50n));
  t.is(state.currentWakeup, 55n);

  // likewise if device-timer message takes a while to reach vat-timer
  state.now = 60n;
  // sent at T=50, received by vat-timer at T=60
  state.currentHandler.wake(50n);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(60n));
  t.is(state.currentWakeup, 65n);

  r1.disable();
  t.is(state.currentWakeup, undefined);

  // duplicate .disable is ignored
  r1.disable();

  ts.setWakeup(toTS(70n), makeHandler(70));
  t.is(state.currentWakeup, 70n);
  state.now = 70n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[70], toTS(70n));
  t.deepEqual(fired[1], toTS(60n)); // not re-fired
  t.is(state.currentWakeup, undefined);

  let pk = makePromiseKit();
  let slowState = 'uncalled';
  const slowHandler = Far('slow', {
    wake(time) {
      slowState = time;
      return pk.promise;
    },
  });
  // we can .schedule a new handler if the repeater is not active
  r1.schedule(slowHandler);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 75n);

  state.now = 80n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();

  // while the handler is running, the repeater is not scheduled
  t.deepEqual(slowState, toTS(80n));
  t.is(state.currentWakeup, undefined);

  // if time passes while the handler is running..
  state.now = 100n;
  // .. then the repeater will skip some intervals
  pk.resolve('ignored');
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 105n); // not 85n

  r1.disable();

  // if the handler rejects, the repeater is cancelled
  const brokenHandler = Far('broken', {
    wake(_time) {
      throw Error('deliberate handler error');
    },
  });
  r1.schedule(brokenHandler);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 105n);

  state.now = 110n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined); // no longer scheduled

  const h115 = makeHandler(115);

  // TODO: unfortunately, a handler rejection puts the repeater in a
  // funny state where we can't directly restart
  // it. `repeaterFacets.repeater` tracks its own state.active, which
  // is not cleared when a handler rejection does cancel() . I'd like
  // to see this fixed some day, but I don't think it's too important
  // right now, especially because unless the client is catching their
  // own exceptions, they have no way to discover the cancellation.

  t.throws(() => r1.schedule(h115), { message: 'repeater already scheduled' });

  // however, we *can* .disable() and then re-.schedule()
  r1.disable();
  r1.schedule(makeHandler(115));
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 115n);
  state.now = 115n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[115], toTS(115n));

  r1.disable();
  r1.schedule(brokenHandler);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 125n);
  state.now = 130n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined);
  r1.disable();

  // we can .disable() while the handler is running
  pk = makePromiseKit();
  slowState = 'uncalled';
  r1.schedule(slowHandler);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 135n);
  state.now = 140n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(slowState, toTS(140n));
  r1.disable();
  pk.resolve('ignored');
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined);
});

test('makeRepeater from now', async t => {
  // r=ts.makeRepeater(delay, interval); r.schedule(handler); r.disable();
  const { ts, state, fired, makeHandler, toTS, toRT } = await setup(t);

  state.now = 0n;
  // creating a repeater with delay=0, and doing schedule() right now,
  // will fire immediately
  const r = ts.makeRepeater(toRT(0n), toRT(10n));
  r.schedule(makeHandler(0));
  t.is(state.currentWakeup, undefined);
  await waitUntilQuiescent();
  t.deepEqual(fired[0], toTS(0n));
});

test('repeatAfter', async t => {
  // ts.repeatAfter(delay, interval, handler, cancelToken);
  const { ts, state, fired, makeHandler, toTS, toRT } = await setup(t, true);

  state.now = 3n;

  // fire at T=25,35,45,..
  const cancel1 = Far('cancel', {});
  ts.repeatAfter(toRT(22n), toRT(10n), makeHandler(1), cancel1);
  t.is(state.currentWakeup, 25n);

  state.now = 4n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], undefined); // not yet

  state.now = 24n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], undefined); // wait for it

  state.now = 25n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(25n)); // fired
  t.is(state.currentWakeup, 35n); // primed for next time

  // if we miss a couple, next wakeup is in the future
  state.now = 50n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(50n));
  t.is(state.currentWakeup, 55n);

  // likewise if device-timer message takes a while to reach vat-timer
  state.now = 60n;
  // sent at T=50, received by vat-timer at T=60
  state.currentHandler.wake(50n);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(60n));
  t.is(state.currentWakeup, 65n);

  // we can cancel the repeater while it is scheduled
  ts.cancel(cancel1);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined);

  // duplicate cancel is ignored
  ts.cancel(cancel1);

  ts.setWakeup(toTS(70n), makeHandler(70));
  t.is(state.currentWakeup, 70n);
  state.now = 70n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[70], toTS(70n));
  t.deepEqual(fired[1], toTS(60n)); // not re-fired
  t.is(state.currentWakeup, undefined);

  let pk = makePromiseKit();
  let slowState = 'uncalled';
  const slowHandler = Far('slow', {
    wake(time) {
      slowState = time;
      return pk.promise;
    },
  });

  const cancel2 = Far('cancel', {});
  ts.repeatAfter(toRT(5n), toRT(10n), slowHandler, cancel2);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 75n);

  state.now = 80n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();

  // while the handler is running, the repeater is not scheduled
  t.deepEqual(slowState, toTS(80n));
  t.is(state.currentWakeup, undefined);

  // if time passes while the handler is running..
  state.now = 100n;
  // .. then the repeater will skip some intervals
  pk.resolve('ignored');
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 105n); // not 85n

  ts.cancel(cancel2);
  await waitUntilQuiescent();

  // if the handler rejects, the repeater is cancelled
  const brokenHandler = Far('broken', {
    wake(_time) {
      throw Error('expected error');
    },
  });
  // we can re-use cancel tokens too
  ts.repeatAfter(toRT(5n), toRT(10n), brokenHandler, cancel1);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 105n);

  state.now = 110n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined); // no longer scheduled

  // cancel is ignored, already cancelled
  ts.cancel(cancel1);
  await waitUntilQuiescent();

  // we can cancel while the handler is running
  pk = makePromiseKit();
  slowState = 'uncalled';
  const cancel3 = Far('cancel', {});
  ts.repeatAfter(toRT(5n), toRT(10n), slowHandler, cancel3);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 115n);
  state.now = 120n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(slowState, toTS(120n));
  ts.cancel(cancel3); // while handler is running
  await waitUntilQuiescent();
  pk.resolve('ignored');
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined);
  // still ignores duplicate cancels
  ts.cancel(cancel3);
});

test('repeatAfter from now', async t => {
  // ts.repeatAfter(delay, interval, handler, cancelToken);
  const { ts, state, fired, makeHandler, toTS, toRT } = await setup(t);
  state.now = 3n;

  // delay=0 fires right away
  const cancel1 = Far('cancel1', {});
  ts.repeatAfter(toRT(0n), toRT(10n), makeHandler(3), cancel1);
  t.is(state.currentWakeup, undefined);
  await waitUntilQuiescent();
  t.deepEqual(fired[3], toTS(3n));
  t.is(state.currentWakeup, 13n);
  // delay=0 doesn't break cancellation
  ts.cancel(cancel1);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, undefined); // unscheduled

  // delay=0 can be cancelled during slow handler
  const cancel2 = Far('cancel2', {});
  const pk2 = makePromiseKit();
  let slowState2 = 'uncalled';
  const slowHandler2 = Far('slow', {
    wake(time) {
      slowState2 = time;
      return pk2.promise;
    },
  });
  ts.repeatAfter(toRT(0n), toRT(10n), slowHandler2, cancel2); // 3,13,..
  await waitUntilQuiescent();
  t.deepEqual(slowState2, toTS(3n));
  t.is(state.currentWakeup, undefined);
  ts.cancel(cancel2);
  t.is(state.currentWakeup, undefined);
  pk2.resolve('done');
  t.is(state.currentWakeup, undefined); // not rescheduled

  // cancellation during slow handler which rejects (thus cancels again)
  const cancel3 = Far('cancel3', {});
  const pk3 = makePromiseKit();
  let slowState3 = 'uncalled';
  const slowHandler3 = Far('slow', {
    wake(time) {
      slowState3 = time;
      return pk3.promise;
    },
  });
  ts.repeatAfter(toRT(0n), toRT(10n), slowHandler3, cancel3); // 3,13,..
  await waitUntilQuiescent();
  t.deepEqual(slowState3, toTS(3n));
  t.is(state.currentWakeup, undefined);
  ts.cancel(cancel3);
  t.is(state.currentWakeup, undefined);
  pk3.reject('oops');
  t.is(state.currentWakeup, undefined);
});

test('repeatAfter shared cancel token', async t => {
  // ts.repeatAfter(delay, interval, handler, cancelToken);
  const { ts, state, fired, makeHandler, toTS, toRT } = await setup(t, true);

  state.now = 0n;

  const throwingHandler = Far('handler', {
    wake(time) {
      fired.thrower = time;
      throw Error('boom');
    },
  });

  const cancel1 = Far('cancel', {});
  // first repeater fires at T=5,15,25,35
  ts.repeatAfter(toRT(5n), toRT(10n), makeHandler(1), cancel1);
  // second repeater fires at T=10,20,30,40
  ts.repeatAfter(toRT(10n), toRT(10n), throwingHandler, cancel1);
  t.is(state.currentWakeup, 5n);

  // let both fire
  state.now = 12n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(12n));
  t.deepEqual(fired.thrower, toTS(12n));

  // second should be cancelled because the handler threw
  t.is(state.currentWakeup, 15n);

  state.now = 22n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(fired[1], toTS(22n));
  t.deepEqual(fired.thrower, toTS(12n)); // not re-fired
  t.is(state.currentWakeup, 25n);

  // second should still be cancellable
  ts.cancel(cancel1);
  t.is(state.currentWakeup, undefined);
});

// the timer's Notifiers pretend to track an infinite series of events
// at start+k*interval , where start=now+delay

test('notifier in future', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toTS, toRT } = await setup(t);

  state.now = 100n;

  // fire at T=125,135,145,..
  const cancel1 = Far('cancel', {});
  const n = ts.makeNotifier(toRT(25n), toRT(10n), cancel1);
  t.is(state.currentWakeup, undefined); // not active yet

  // getUpdateSince(undefined) before 'start' waits until start
  const p1 = n.getUpdateSince(undefined);
  let done1;
  void p1.then(res => (done1 = res));
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 125n);

  state.now = 130n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done1, { value: toTS(125n), updateCount: 1n });
  // inactive until polled again
  t.is(state.currentWakeup, undefined);

  // fast handler turnaround waits for the next event
  const p2 = n.getUpdateSince(done1.updateCount);
  let done2;
  void p2.then(res => (done2 = res));
  await waitUntilQuiescent();
  // notifier waits when updateCount matches
  t.deepEqual(done2, undefined);
  t.is(state.currentWakeup, 135n);

  state.now = 140n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done2, { value: toTS(135n), updateCount: 2n });
  t.is(state.currentWakeup, undefined);

  // slow turnaround gets the most recent missed event right away
  state.now = 150n;
  const p3 = n.getUpdateSince(done2.updateCount);
  let done3;
  void p3.then(res => (done3 = res));
  await waitUntilQuiescent();
  // fires immediately
  t.deepEqual(done3, { value: toTS(145n), updateCount: 3n });
  t.is(state.currentWakeup, undefined);

  // a really slow handler will miss multiple events
  state.now = 180n; // missed 155 and 165
  const p4 = n.getUpdateSince(done3.updateCount);
  let done4;
  void p4.then(res => (done4 = res));
  await waitUntilQuiescent();
  t.deepEqual(done4, { value: toTS(175n), updateCount: 6n });
  t.is(state.currentWakeup, undefined);
});

test('notifier from now', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toTS, toRT } = await setup(t);

  state.now = 100n;

  // delay=0 fires right away: T=100,110,120,..
  let done1;
  const n = ts.makeNotifier(toRT(0n), toRT(10n));
  const p1 = n.getUpdateSince(undefined);
  void p1.then(res => (done1 = res));
  await waitUntilQuiescent();
  t.deepEqual(done1, { value: toTS(100n), updateCount: 1n });

  // but doesn't fire forever
  const p2 = n.getUpdateSince(done1.updateCount);
  let done2;
  void p2.then(res => (done2 = res));
  await waitUntilQuiescent();
  t.deepEqual(done2, undefined);
  t.is(state.currentWakeup, 110n);

  // move forward a little bit, not enough to fire
  state.now = 101n;
  // premature wakeup, off-spec but nice to tolerate
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 110n);
  t.deepEqual(done2, undefined);

  // a second subscriber who queries elsewhen in the window should get
  // the same update values

  const p3 = n.getUpdateSince(done1.updateCount);
  let done3;
  void p3.then(res => (done3 = res));
  await waitUntilQuiescent();
  t.deepEqual(done3, undefined);
  // still waiting
  t.is(state.currentWakeup, 110n);

  state.now = 116n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done2, { value: toTS(110n), updateCount: 2n });
  t.deepEqual(done3, { value: toTS(110n), updateCount: 2n });
});

test('cancel notifier', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toTS, toRT } = await setup(t);
  state.now = 0n;

  // cancel n1 while inactive, before it ever fires
  const cancel1 = Far('cancel', {});
  const n1 = ts.makeNotifier(toRT(5n - state.now), toRT(10n), cancel1); // T=5,15,
  t.is(state.currentWakeup, undefined); // not active yet
  const p1a = n1.getUpdateSince(undefined);
  state.now = 1n;
  ts.cancel(cancel1); // time of cancellation = 1n
  const p1b = n1.getUpdateSince(undefined);
  state.now = 2n;
  const p1c = n1.getUpdateSince(undefined);
  t.deepEqual(await p1a, { value: toTS(1n), updateCount: undefined });
  t.deepEqual(await p1b, { value: toTS(1n), updateCount: undefined });
  t.deepEqual(await p1c, { value: toTS(1n), updateCount: undefined });

  // cancel n2 while active, but before it ever fires
  const cancel2 = Far('cancel', {});
  const n2 = ts.makeNotifier(toRT(5n - state.now), toRT(10n), cancel2); // T=5,15,
  t.is(state.currentWakeup, undefined); // not active yet
  const p2a = n2.getUpdateSince(undefined);
  t.is(state.currentWakeup, 5n); // primed
  state.now = 3n;
  const p2b = n2.getUpdateSince(undefined);
  ts.cancel(cancel2); // time of cancellation = 3n
  t.is(state.currentWakeup, undefined); // no longer active
  const p2c = n2.getUpdateSince(undefined);
  state.now = 4n;
  const p2d = n2.getUpdateSince(undefined);
  t.deepEqual(await p2a, { value: toTS(3n), updateCount: undefined });
  t.deepEqual(await p2b, { value: toTS(3n), updateCount: undefined });
  t.deepEqual(await p2c, { value: toTS(3n), updateCount: undefined });
  t.deepEqual(await p2d, { value: toTS(3n), updateCount: undefined });

  // cancel n3 while idle, immediately after first firing
  const cancel3 = Far('cancel', {});
  const n3 = ts.makeNotifier(toRT(5n - state.now), toRT(10n), cancel3); // T=5,15,
  const p3a = n3.getUpdateSince(undefined);
  t.is(state.currentWakeup, 5n); // primed
  state.now = 5n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  const res3a = await p3a;
  t.deepEqual(res3a, { value: toTS(5n), updateCount: 1n });
  t.is(state.currentWakeup, undefined); // no longer active
  const p3b = n3.getUpdateSince(res3a.updateCount);
  ts.cancel(cancel3); // time of cancellation = 5n
  const p3c = n3.getUpdateSince(res3a.updateCount);
  t.is(state.currentWakeup, undefined); // not reactivated
  t.deepEqual(await p3b, { value: toTS(5n), updateCount: undefined });
  t.deepEqual(await p3c, { value: toTS(5n), updateCount: undefined });

  // cancel n4 while idle, slightly after first firing

  const cancel4 = Far('cancel', {});
  const n4 = ts.makeNotifier(toRT(10n - state.now), toRT(10n), cancel4); // T=10,20,
  const p4a = n4.getUpdateSince(undefined);
  t.is(state.currentWakeup, 10n); // primed
  state.now = 10n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  const res4a = await p4a;
  t.deepEqual(res4a, { value: toTS(10n), updateCount: 1n });
  t.is(state.currentWakeup, undefined); // no longer active
  const p4b = n4.getUpdateSince(res4a.updateCount);
  state.now = 11n;
  ts.cancel(cancel4); // time of cancellation = 11n
  const p4c = n4.getUpdateSince(res4a.updateCount);
  const p4d = n4.getUpdateSince(undefined);
  t.is(state.currentWakeup, undefined); // not reactivated
  t.deepEqual(await p4b, { value: toTS(11n), updateCount: undefined });
  t.deepEqual(await p4c, { value: toTS(11n), updateCount: undefined });
  t.deepEqual(await p4d, { value: toTS(11n), updateCount: undefined });

  // cancel n5 while active, after first firing
  const cancel5 = Far('cancel', {});
  const n5 = ts.makeNotifier(toRT(20n - state.now), toRT(10n), cancel5); // fire at T=20,30,
  const p5a = n5.getUpdateSince(undefined);
  t.is(state.currentWakeup, 20n); // primed
  state.now = 21n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  const res5a = await p5a;
  t.deepEqual(res5a, { value: toTS(20n), updateCount: 1n });
  t.is(state.currentWakeup, undefined); // no longer active
  state.now = 22n;
  const p5b = n5.getUpdateSince(res5a.updateCount);
  t.is(state.currentWakeup, 30n); // reactivated
  ts.cancel(cancel5); // time of cancellation = 22n
  t.is(state.currentWakeup, undefined); // no longer active
  const p5c = n5.getUpdateSince(res5a.updateCount);
  t.deepEqual(await p5b, { value: toTS(22n), updateCount: undefined });
  t.deepEqual(await p5c, { value: toTS(22n), updateCount: undefined });
});

test('iterator', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toTS, toRT } = await setup(t);

  state.now = 100n;

  // fire at T=125,135,145,..
  const n = ts.makeNotifier(toRT(25n), toRT(10n));

  // iterator interface
  const iter = n[Symbol.asyncIterator]();
  const p1 = iter.next();
  let done1;
  void p1.then(res => (done1 = res));
  await waitUntilQuiescent();
  t.is(state.currentWakeup, 125n);
  t.deepEqual(done1, undefined);

  // concurrent next() is rejected
  t.throws(async () => iter.next(), {
    message: 'timer iterator dislikes overlapping next()',
  });

  state.now = 130n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done1, { value: toTS(125n), done: false });
  t.is(state.currentWakeup, undefined);

  // fast turnaround will wait for next event
  const p2 = iter.next();
  let done2;
  void p2.then(res => (done2 = res));
  await waitUntilQuiescent();
  t.deepEqual(done2, undefined);
  t.is(state.currentWakeup, 135n);

  state.now = 140n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done2, { value: toTS(135n), done: false });
  t.is(state.currentWakeup, undefined);
  const p3 = iter.next(); // before state.now changes
  let done3;
  void p3.then(res => (done3 = res));
  await waitUntilQuiescent();
  t.deepEqual(done3, undefined);
  t.is(state.currentWakeup, 145n); // waits for next event

  state.now = 150n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();
  t.deepEqual(done3, { value: toTS(145n), done: false });
  t.is(state.currentWakeup, undefined);

  // slow turnaround will get the missed event immediately
  state.now = 160n; // before next()
  const p4 = iter.next(); // missed 155
  let done4;
  void p4.then(res => (done4 = res));
  await waitUntilQuiescent();
  t.deepEqual(done4, { value: toTS(155n), done: false });
  t.is(state.currentWakeup, undefined);

  // very slow turnaround will get the most recent missed event
  state.now = 180n; // before next()
  const p5 = iter.next(); // missed 165 and 175
  let done5;
  void p5.then(res => (done5 = res));
  await waitUntilQuiescent();
  t.deepEqual(done5, { value: toTS(175n), done: false });
  t.is(state.currentWakeup, undefined);

  // sample loop, starts when now=180
  const drain5 = async results => {
    for await (const x of n) {
      results.push(x);
      if (results.length >= 5) {
        break;
      }
    }
  };

  // parallel iterators don't conflict
  const results1 = [];
  const results2 = [];

  const p6a = drain5(results1);
  const p6b = drain5(results2);
  t.deepEqual(results1, []);
  t.deepEqual(results2, []);

  for (let now = 181n; now <= 300n; now += 1n) {
    state.now = now;
    if (state.currentWakeup && state.currentHandler) {
      state.currentHandler.wake(state.now);
    }
    await waitUntilQuiescent();
  }
  await p6a;
  await p6b;
  t.deepEqual(results1, [
    toTS(175n),
    toTS(185n),
    toTS(195n),
    toTS(205n),
    toTS(215n),
  ]);
  t.deepEqual(results2, [
    toTS(175n),
    toTS(185n),
    toTS(195n),
    toTS(205n),
    toTS(215n),
  ]);
  t.is(state.now, 300n);
});

const drainForOf = async (n, results) => {
  for await (const x of n) {
    results.push(x);
  }
};

const drainManual = async (n, results) => {
  const iter = n[Symbol.asyncIterator]();
  for (;;) {
    const res = await iter.next();
    if (res.done) {
      results.push({ returnValue: res.value });
      break;
    } else {
      results.push(res.value);
    }
  }
};

test('cancel active iterator', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toTS, toRT } = await setup(t);

  state.now = 100n;

  // fire at T=125,135,145,..
  const cancel1 = Far('cancel', {});
  const n = ts.makeNotifier(toRT(25n), toRT(10n), cancel1);

  // Cancellation halts the iterator, and the "return value" is the
  // cancellation time. But note that for..of does not expose the
  // return value.

  const resultsForOf = [];
  const p1 = drainForOf(n, resultsForOf); // grabs first next() promise
  const resultsManual = [];
  const p2 = drainManual(n, resultsManual);

  // allow one value to be posted
  t.is(state.currentWakeup, 125n);
  state.now = 130n;
  state.currentHandler.wake(state.now);
  await waitUntilQuiescent();

  state.now = 131n;
  ts.cancel(cancel1); // time of cancellation = 131n

  await p1;
  await p2;
  t.deepEqual(resultsForOf, [toTS(125n)]);
  t.deepEqual(resultsManual, [toTS(125n), { returnValue: toTS(131n) }]);
});

test('cancel idle iterator', async t => {
  // n = ts.makeNotifier(delay, interval, cancelToken);
  const { ts, state, toRT, toTS } = await setup(t);

  state.now = 100n;

  // fire at T=125,135,145,..
  const cancel1 = Far('cancel', {});
  const n = ts.makeNotifier(toRT(25), toRT(10), cancel1);
  ts.cancel(cancel1); // before first event

  const resultsForOf = [];
  const p1 = drainForOf(n, resultsForOf); // grabs first next() promise
  const resultsManual = [];
  const p2 = drainManual(n, resultsManual);

  await p1;
  await p2;
  t.deepEqual(resultsForOf, []);
  t.deepEqual(resultsManual, [{ returnValue: toTS(100) }]);
});
