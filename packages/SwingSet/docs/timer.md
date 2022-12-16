# Adding a Timer to a new Deployment

There's documentation elsewhere about [how devices fit into the SwingSet
architecture](devices.md). In order to install a Timer device, you first build
a timer object in order to create the timer's endowments, source code, and
`poll()` function.

## Kernel Configuration

The timer service consists of a device (`device-timer`) and a helper vat (`vat-timer`). The host application must configure the device as it builds the swingset kernel, and then the bootstrap vat must finish the job by wiring the device and vat together.

```js
import { buildTimer } from `@agoric/swingset-vat`;
const timer = buildTimer();
```

The `timer` record contains three items: a `srcPath` that points to the timer device source code, an `endowments` which must be provided to the timer device instance, and a `poll` function for use by the host application.

The timer vat is added automatically, but the `config` record must still define the timer device:

```js
config.devices = [
   ...
  timer: { sourceSpec: timer.srcPath },
];
```

and when creating the swingset controller, the `deviceEndowments` record must include the timer's endowments:

```js
const deviceEndowments = {
  timer: { timer.endowments },
};
..
await initializeSwingset(config, [], hostStorage);
const c = await makeSwingsetController(hostStorage, deviceEndowments);
```

## Bootstrap Registration

The timer vat is created automatically, but it must still be wired up. Within your `bootstrap` vat, during the `bootstrap()` call, do the following:

```js
async function bootstrap(vats, devices) {
  const timerService = await E(vats.timer).createTimerService(devices.timer);
  ...
  // use timerService
}
```

The `timerService` Presence returned by `createTimerService` is the API handle from which all timer services are obtained.

## Host Application Invokes poll()

Once the kernel is started, the host application will call `timer.poll(now)` periodically with the current time. This is the device's only way to learn about the passing of time. It remembers the most recent value to satisfy `getCurrentTimestamp()` requests, and it compares `now` against the list of upcoming wakeups and repeating timers to decide if something needs to be scheduled.

This should be called when the kernel is idle (i.e. _not_ in the middle of a `controller.run()`), as it will push callback events onto the run-queue. In a consensus machine (blockchain), this is typically called at the beginning of each block's transaction processing phase.

`poll()` will return `true` if any work was pushed onto the queue, or `false` if not. In a non-consensus (solo) machine, it may be appropriate to skip a `controller.run()` if `poll()` does not report any work being added. In a consensus machine, the return value should be ignored.

Note that `poll()` (and indeed the entire timer service) is agnostic as to what "time" means. You might choose to use seconds, milliseconds, a block height, or any non-decreasing integer. In a blockchain application, you might either use block height, or a consensus-managed block time. In a solo application, the standard unix seconds-since-epoch would be appropriate. The one constraint is that the value is a BigInt that never decreases (`poll(oldTime)` will throw an Error).

A single application might have multiple sources of time, which would require the creation and configuration of multiple timer device+vat pairs.

## Using the Timer Service

The `timerService` object can be distributed to other vats as necessary.

```js
// for this example, assume poll() provides seconds-since-epoch

const now = await E(timerService).getCurrentTimestamp();

// simple one-shot Promise-based relative delay
const p1 = E(timerService).delay(30n); // fires 30 seconds from now
await p1;

// same, but cancellable
const cancel2 = Far('cancel', {}); // any pass-by-reference object
// the cancelToken is always optional
const p2 = E(timerService).delay(30n, cancel2);
// E(timerService).cancel(cancel2) will cancel that

// same, but absolute instead of relative-to-now
const monday = 1_660_000_000;
const p3 = E(timerService).wakeAt(monday, cancel2);
await p3; // fires Mon Aug  8 16:06:40 2022 PDT

// non-Promise API functions needs a handler callback
const handler = Far('handler', {
  wake(t) {
    console.log(`woken up, scheduled for ${t}`);
  },
});

// then for one-shot absolute wakeups:
await E(timerService).setWakeup(monday, handler, cancel2);
// handler.wake(t) will be called shortly after monday

// cancel early:
await E(timerService).cancel(cancel2);

// wake up at least 60 seconds from now:
await E(timerService).setWakeup(now + 60n, handler, cancel2);

// repeatAfter() creates a repeating wakeup service: the handler will
// fire somewhat after 20 seconds from now (now+delay), and again
// every 60 seconds thereafter. The next wakeup will not be scheduled
// until the handler message is acknowledged (when its return promise is
// fulfilled), so wakeups might be skipped, but they will always be
// scheduled for the next 'now + delay + k * interval', so they will not
// accumulate drift. If the handler rejects, the repeater will be
// cancelled.

const delay = 20n;
const interval = 60n;
E(timerService).repeatAfter(delay, interval, handler, cancel2);

// repeating wakeup service, Notifier-style . This supports both the
// native 'E(notifierP).getUpdateSince()' Notifier protocol, and an
// asyncIterator. To use it in a for/await loop (which does not know how
// to make `E()`-style eventual sends to the remote notifier), you must
// wrap it in a local "front-end" Notifier by calling the `makeNotifier()`
// you get from the '@agoric/notifier' package.

const notifierP = E(timerService).makeNotifier(delay, interval, cancel2);
// import { makeNotifier } from '@agoric/notifier';
const notifier = makeNotifier(notifierP);

for await (const scheduled of notifier) {
  console.log(`woken up, scheduled for ${scheduled}`);
  // note: runs forever, once per 'interval'
  break; // unless you escape early
}

// `makeRepeater` creates a "repeater object" with .schedule
// and .disable methods to turn it on and off

const r = E(timerService).makeRepeater(delay, interval);
E(r).schedule(handler);
E(r).disable(); // cancel and delete entire repeater

// the 'clock' facet offers `getCurrentTimestamp` and nothing else
const clock = await E(timerService).getClock();
const now2 = await E(clock).getCurrentTimestamp();

// a "Timer Brand" is an object that identifies the source of time
// used by any given TimerService, without exposing any authority
// to get the time or schedule wakeups

const brand1 = await E(timerService).getTimerBrand();
const brand2 = await E(clock).getTimerBrand();
assert.equal(brand1, brand2);
assert(await E(brand1).isMyTimerService(timerService));
assert(await E(brand1).isMyClock(clock));
```
