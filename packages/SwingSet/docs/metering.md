# Metering CPU Usage

The Halting Problem is unsolvable: no amount of static analysis or human auditing can pre-determine how many steps an arbitrary Turing-complete program will take before it finishes, or if it will ever finish. To prevent the code in one vat from preventing execution of code in other vats (or the kernel itself), SwingSet provides a mechanism to limit the amount of computation that each vat can perform. Any vat which exceeds its limit is terminated, and any messages it sent before the limit was reached are cancelled.

Two limits can be imposed. The first is a per-crank limit. Each message delivered to a vat results in a sequence of "turns" known as a "crank". A crank is also triggered when the vat receives notification of a kernel-side promise being resolved or rejected. Cranks run until the vat stops adding work to the resolved-promise queue, and there is nothing left to do until the next message or notification arrives. A per-crank limit imparts a ceiling on the amount of computation that can be done during each crank, but does not say anything about the number of cranks that can be run.

The second limit spans multiple cranks and is managed by the "Meter": a variable-sized reservoir of execution credits. Each vat can be associated with a single Meter, and the remaining capacity of the Meter is reduced at the end of each crank by whatever amount the vat consumed during that crank. The Meter can be refilled by sending it a message, but if any crank causes the Meter's remaining value to drop below zero, the vat is terminated.

## The Computron

SwingSet measures computation with a unit named the "computron": the smallest unit of indivisible computation. The number of computrons used by a given piece of code depends upon its inputs, the state it can access, and the history of its previous activity, but it does _not_ depend upon the activity of other vats, other processes on the same host computer, wall-clock time, or type of CPU being used (32-bit vs 64-bit, Intel vs ARM). The metering usage is meant to be consistent across any SwingSet using the same version of the kernel and vat code, which receives the same sequence of vat inputs (the transcript), making it safe to use in a consensus machine.

Metering is provided by low-level code in the JavaScript engine, which is counting basic operations like "read a property from an object" and "add two numbers". This is larger than a CPU cycle. The exact mapping depends upon intricate details of the engine, and is likely to change if/when the JS engine is upgraded. SwingSet kernels that participate in a consensus machine must be careful to synchronize upgrades to prevent divergence of metering results.

To gain some intuition on how "big" a computron is, here are some examples:

- An empty function: 36560 computrons. This is the base overhead for each message delivery (dispatch.deliver)
- Adding `async` to a function (which creates a return Promise): 98
- `let i = 1`: 3
- `i += 2`: 4
- `let sum; for (let i=0; i<100; i++) { sum += i; }`: 1412
  - same, but adding to 1000: 14012
- defining a `harden()`ed add/read "counter" object: 1475
  - invoking `add()`: 19
- `console.log('')`: 1011 computrons
- ERTP `getBrand()`: 49300
- ERTP `getCurrentAmount()`: 54240
- ERTP `getUpdateSince()`: 59084
- ERTP `deposit()`: 124775
- ERTP `withdraw()`: 111141
- Zoe `install()`: 62901
- ZCF `executeContract()` of the Multi-Pool Autoswap contract: 12.9M
- ZCF `executeContract()` (importBundle) of the Treasury contract: 13.5M

Computrons have a loose relationship to wallclock time, but are generally correlated, so tracking the cumulative computrons spent during SwingSet cranks can provide a rough measure of how much time is being spent, which can be useful to e.g. limit blocks to a reasonable amount of execution time.

The SwingSet Meter APIs accept and deliver computron values in BigInts.

## Meter Objects

The kernel manages `Meter` objects. Each one has a `remaining` capacity and a notification `threshold`. The Meter has a `Notifier` which can inform interested parties when the capacity drops below the threshold, so they can refill it before any associated vats are in danger of being terminated due to an underflow.

Vats can create a Meter object by invoking the `createMeter` method on the `vatAdmin` object. This is the same object used to create new dynamic vats. `createMeter` takes two arguments, both denominated in computrons:

- `remaining`: sets the initial capacity of the Meter
- `threshold`: set the notification threshold

If you want to impose a per-crank limit, but not a cumulative limit, you can use `createUnlimitedMeter` to make a Meter that never deducts (`remaining` is always the special string `'unlimited'`) and never notifies.

```js
const remaining = 100_000_000n; // 100M computrons
const threshold = 20_000_000n: // notify below 20M
const meter = await E(vatAdmin).createMeter(remaining, threshold);
const umeter = await E(vatAdmin).createUnlimitedMeter();
```

The holder of a Meter object can manipulate the meter with the following API:

- `meter.addRemaining(delta)`: increment the capacity by some amount
- `meter.setThreshold(threshold)`: replace the notification threshold
- `meter.get() -> { remaining, threshold }`: read the remaining capacity and current notification threshold
- `meter.getNotifier() -> Notifier`: access the Notifier object

```js
await E(meter).get(); // -> { remaining: 100_000_000n, threshold: 20_000_000n }
await E(meter).setThreshold(50n);
await E(meter).get(); // -> { remaining: 100_000_000n, threshold: 50n }
await E(meter).addRemaining(999n);
await E(meter).get(); // -> { remaining: 100_000_999n, threshold: 50n }
```

## Notification

The meter's `remaining` value will be deducted over time. When it crosses below `threshold`, the Notifier is updated. This is an instance of `@agoric/notifier`:

```js
const notifier = await E(meter).getNotifier();
const initial = await E(notifier).getUpdateSince();
const p1 = E(notifier).getUpdateSince(initial);
p1.then(remaining => console.log(`meter down to ${remaining}, must refill`));
```

Note that the notification will occur only once for each transition from "above threshold" to "below threshold". So even if the vat continues to operate (and keeps deducting from the Meter), the notification will not be repeated.

The notification may be triggered again if the meter is refilled above the current threshold, or if the threshold is reduced below the current remaining capacity.

## Per-Crank Limits

The per-crank limit is currently hardcoded to 100M computrons, defined by `DEFAULT_CRANK_METERING_LIMIT` in `packages/xsnap/src/xsnap.js`. This has experimentally been determined to be sufficient for loading large contract bundles, which is the single largest operation we've observed so far.

This per-crank limit is intended to maintain fairness even among vats with a large Meter capacity: just because the Meter allows the vat to spend 17 hours of CPU time, we don't want it to spend it all at once. It also provides a safety mechanism when the vat is using an "unlimited" meter, which allows the vat to use as make cranks as it wants, but each crank is limited.

## Assigning Meters to Vats

Each vat can be associated with a single Meter. A Meter can be attached to multiple vats (although that may make it difficult to assign responsibility for the consumption it measures). To attach a Meter, include it in the options bag to the `vatAdmin`'s `createVat` or `createVatByName` methods:

```js
const control = await E(vatAdmin).createVat(bundle, { meter });
```

The default (omitting a `meter` option) leaves the vat unmetered.

Assigning a Meter to a vat activates the per-crank limit. To achieve a per-crank limit without a Meter object (which must be refilled occasionally to keep the vat from being terminated), use an unlimited meter:

```js
const meter = await E(vatAdmin).createUnlimitedMeter();
const control = await E(vatAdmin).createVat(bundle, { meter });
```

## runPolicy

TODO: The host application can limit the number of cranks processed in a single call to `controller.run()` by providing a `runPolicy` object. This policy object is informed about each crank and the number of computrons it consumed. By comparing the cumulative computrons against an experimentally (and externally) determined threshold, the `runLimit` object can tell the kernel to stop processing before the run-queue is drained. For a busy kernel, with an ever-increasing amount of work to do, this can limit the size of a commitment domain (e.g. the "block" in a blockchain / consensus machine).

This is a work in process, please follow issue #3460 for progress.
