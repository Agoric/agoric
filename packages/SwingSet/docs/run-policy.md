# The Run Policy

The SwingSet kernel maintains a queue of pending operations to execute: mostly deliveries to vats and promise resolution notifications. This queue may be sizable, and each operation may provoke more work to be added to the list.

SwingSet manages its own prioritization and scheduling for this workload, but it does not get to decide how much work should be done at a time. The host applications breaks this work up into "blocks". We colloquially describe this as the "block size": in the SwingSet context this refers to the number of deliveries ("cranks") performed before declaring the block to be finished, rather than measuring the number of bytes in some host application consensus data structure.

The host is responsible for committing the SwingSet state to durable storage (i.e. `swingstore.commit()`) at the end of a block. Outbound messages are embargoed until after this commit point, to prevent "hangover inconsistency" from revealing state that might still get unwound. Large block sizes are generally more efficient, however 1: they increase latency, because outbound reply messages cannot be delivered until the end of the block, and 2: they increase the likelihood of losing progress because of a crash or other interrupt during the block. Depending upon the application, it may be appropriate to limit blocks to 5-10 seconds of computation.

To impose this limit, the host application has two choices. The first is to call `controller.step()` many times, until the limit is reached. Each invocation performs one delivery to one vat, and returns `true` if there is more work left on the run-queue, or `false` if the queue is empty. Applications could use this method if they want to impose a wallclock limit on the block (keep calling `step()` until 5 seconds have passed or it returns `false`).

But the more sophisticated approach is to call `controller.run(policy)`, with a "Run Policy" object that knows when the block should end. The policy object will get detailed information about each delivery, including the metering results (how many low-level JS engine operations were performed), and can use this to guide the block size.

## Cranks

The kernel maintains two queues. The highest priority queue contains "GC Actions", which are messages to vats that indicate an object has been garbage collected and can now be freed. These are provoked by reference-counting operations that occur as a side-effect of GC syscalls, as well as vat termination events. Each GC Action counts as a "crank", and is reported to the policy object. The policy may end a block while there is still GC Action work to do, in which case the kernel will pick it back up again when the next block begins.

If the GC Action queue is entirely empty, the kernel will look for regular work to do. This consists of the following event types:

- message deliveries to vats (provoked by `syscall.send`, delivered as `dispatch.deliver`)
- promise resolution notifications (provoked by `syscall.resolve`, delivered as `dispatch.notify`)
- vat creation

Each message delivery and resolution notification causes (at most) one vat to execute one "crank" (it might not execute any crank, e.g. when a message is delivered to an unresolved promise, it just gets added to the promise's queue). This crank gives the vat some amount of time to process the delivery, during which it may invoke any number of syscalls. The crank might cause the vat to be terminated, either because of an error, or because it took too much CPU and exceeded its Meter's allowance. Each crank yields a "delivery results object", which indicates the success or failure of the delivery.

When run in a suitable vat worker (`managerType: 'xs-worker'`), the delivery results also include the number of "computrons" consumed, as counted by the JS engine. Computrons are vaguely correlated to CPU cycles (despite being much larger) and thus some correspondence to wallclock time. A Run Policy which wishes to limit wallclock time in a consensus-base manner should pay attention to the cumulative computron count, and end the block after some experimentally-determined limit.

Vat creation also gives a single vat (the brand new one) time to run the top-level forms of its source bundle, as well as the invocation of its `buildRootObject()` method. This typically takes considerably longer than the subsequent messages, and is not currently metered.

## Run Policy

The kernel will invoke the following methods on the policy object (so all must exist, even if they're empty):

- `policy.vatCreated()`
- `policy.crankComplete({ computrons })`
- `policy.crankFailed()`
- `policy.emptyCrank()`

All methods should return `true` if the kernel should keep running, or `false` if it should stop.

The `computrons` argument may be `undefined` (e.g. if the crank was delivered to a non-`xs worker`-based vat, such as the comms vat). The policy should probably treat this as equivalent to some "typical" number of computrons.

`crankFailed` indicates the vat suffered an error during crank delivery, such as a metering fault, memory allocation fault, or fatal syscall. We do not currently have a way to measure the computron usage of failed cranks (many of the error cases are signaled by the worker process exiting with a distinctive status code, which does not give it an opportunity to report back detailed metering data). The run policy should assume the worst.

`emptyCrank` indicates the kernel processed a queued messages which didn't result in a delivery.

More arguments may be added in the future, such as:

- `vatCreated:` the size of the source bundle
- `crankComplete`: the number of syscalls that were made
- `crankComplete`: the aggregate size of the delivery/notification arguments
  - (the first message delivered to each ZCF contract vat contains a very large contract source bundle, and takes considerable time to execute, and this would let the policy treat these cranks accordingly)
- `crankFailed`: the number of computrons consumed before the failure
- `crankFailed`: the nature of the failure (we might be able to distinguish between 1: per-crank metering limit exceeded, 2: allocation limit exceed, 3: fatal syscall, 4: Meter exhausted)

The run policy should be provided as the first argument to `controller.run()`. If omitted, the kernel defaults to `forever`, a policy that runs until the queue is empty.

## Typical Run Policies

A basic policy might simply limit the block to 100 cranks with deliveries and two vat creations:

```js
function make100CrankPolicy() {
  let cranks = 0;
  let vats = 0;
  const policy = harden({
    vatCreated() {
      vats += 1;
      return vats < 2;
    },
    crankComplete(details) {
      cranks += 1;
      return cranks < 100;
    },
    crankFailed() {
      cranks += 1;
      return cranks < 100;
    },
    emptyCrank() {
      return true;
    },
  });
}
```

and would be supplied like:

```js
while (1) {
  processInboundIO();
  const policy = make100CrankPolicy();
  await controller.run(policy);
  await commit();
  processOutboundIO();
}
```

Note that a new policy object should be provided for each call to `run()`.

A more sophisticated one would count computrons. Suppose that experiments suggest that one million computrons take about 5 seconds to execute. The policy would look like:

```js
function makeComputronCounterPolicy(limit) {
  let total = 0;
  const policy = harden({
    vatCreated() {
      total += 100000; // pretend vat creation takes 100k computrons
      return total < limit;
    },
    crankComplete(details) {
      const { computrons } = details;
      total += computrons;
      return total < limit;
    },
    crankFailed() {
      total += 1000000; // who knows, 1M is as good as anything
      return total < limit;
    },
    emptyCrank() {
      return true;
    },
  });
}
```

See `src/runPolicies.js` for examples.

## Non-Consensus Wallclock Limits

If the SwingSet kernel is not being operated in consensus mode, then it is safe to use wallclock time as a block limit:

```js
function makeWallclockPolicy(seconds) {
  let timeout = Date.now() + 1000 * seconds;
  const policy = harden({
    vatCreated: () => Date.now() < timeout,
    crankComplete: () => Date.now() < timeout,
    crankFailed: () => Date.now() < timeout,
    emptyCrank: () => Date.now() < timeout,
  });
}
```

The kernel does not know (ahead of time) how long the last crank will take, so this will ensure the N-1 initial cranks take less than `seconds` time.

The kernel knows nothing of time, because the kernel is specifically deterministic. If you want to use wallclock time (which is inherently non-deterministic across the separate nodes of a consensus machine), the run policy is responsible for bringing its own source of nondeterminism.
