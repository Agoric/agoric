# LiveSlots

This runtime treats vats as if they were userspace processes in an operating system. The "kernel" calls into a userspace function named `dispatch()` which is registered at setup time. The vat calls into the kernel through a `syscall` object. Vats and the kernel talk about "slots", which are either exported from the vat (and referenced by other vats via the kernel), or imported into the vat (and thus reference other vats, via the kernel). Vats are internally responsible for managing their slot tables and implementing the `dispatch()` function.

"Liveslots" is a particular dispatch mechanism that uses Maps/WeakMaps to track "live objects". Imported references to objects on other vats are represented by special "Presence" objects. Liveslots implements the `E` wrapper which allows messages to be sent through presences: `promise = E(presence).methodname(args)`. Presences can be sent in arguments or returned from method calls.

The nice thing about Liveslots is that user code looks pretty close to regular non-distributed code. Objects are retained (protected against garbage collection) by virtue of being referenced by external vats, starting with the "root occupant" (aka "Object 0") as created by the `buildRootObject()` function.

The downside is that we don't have a good way to persist a vat using Liveslots. Since any living object could reference any javascript object, including functions, closures, and iterators, we can't turn the entire vat into data and store it for later resumption. This impacts our ability to use this mechanism on blockchain-based machines, as well as our ability to migrate vats from one kernel to another.

## buildRootObject()

Most SwingSet vats use liveslots (with the notable exception of the comms vat). The stereotypical vat definition file when using Liveslots is:

```js

export buildRootObject() {
  const obj0 = Far('root', {
    foo(arg1, arg2) {
      // implement foo
      return 'value';
    },
  });
  return harden(obj0);
}
```

See `static-vats.md`, `dynamic-vats.md`, and `vat-environment.md` in this directory for details.

This function returns the "root object". A remote reference to it will be made available to the bootstrap vat, which can use it to trigger whatever initialization needs to happen.

## Returning New Objects

```js
    foo(arg1) {
      const obj2 = Far('obj2', {
        bar(arg2) { return 'barbar'; }
      });
      return obj2;
    },
```

## Calling Objects

```js
import { E } from '@endo/eventual-send';

const p = E(target).foo('arg1');
p.then(obj2 => E(obj2).bar('arg2'));
```

The method name being invoked can be any string, or the special `Symbol.asyncIterator`. All other Symbol-named methods are currently rejected, but see #2612 for plans to accept anything that JavaScript will accept.

## What can be serialized

For safety, all objects should hardened before they are allowed to escape the scope of their construction (so that an adversarial counterparty cannot change their contents in surprising ways). However both method arguments and return values are currently automatically hardened for you.

- Data Objects: when an object's enumerable properties are all non-functions, and the object inherits from either `Object`, `Array`, or `null`, the object is passed by copy: the receiving end gets an object with all the same enumerable properties and their values. The new object inherits from `Object`. These objects are "selfless": they do not retain object identity, so sending the same pass-by-copy object multiple times will result in values that are not `===` to each other.
- Pass-by-Presence objects: when an object is marked with the special `Far` function (which requires that all its enumerable properties _are_ functions), the object is passed by presence. The receiving end gets a special Presence object, which can be wrapped by `E(presence)` to make asynchronous remote method calls on the original object.
- plain data: anything that JSON can handle will be serialized as plain data, plus numbers (including -0, `NaN`, `Infinity`, `-Infinity`, and BigInts), some Symbols, and `undefined`.
- Promises: these are recognized as special, and delivered as pass-by-reference. The recipient gets their own Promise whose behavior is linked to the original. When the original Promise is resolved, the downstream version will eventually be resolved too.

Some useful things cannot be serialized: they will trigger an error.

- Functions: this may be fixed, but for now only entire objects are pass-by-presence, and bare functions cause an error. This includes resolvers for Promises.
- Mixed objects: objects with both function properties and non-function properties. We aren't really sure how to combine pass-by-presence and pass-by-copy, however look at issue #2069 ("auxiliary data") for some plans.
- Non-frozen objects: since the receiving end would not automatically get updated with changes to a non-frozen object's properties, it seems safer to require that all values be frozen before transmission

Uncertain:

- Maps: This might actually serialize as pass-by-presence, since it has no non-function properties (in fact it has no own properties at all, they all live on `Map.prototype`, whose properties are all functions). The receiving side gets a Presence, not a Map, but invoking e.g. `E(p).get(123)` will return a promise that will be fulfilled with the results of `m.get(123)` on the sending side.
- WeakMaps: same, except the values being passed into `get()` would be coming from the deserializer, and so they might not be that useful.

## How things get serialized

- pass-by-presence objects: `{@qclass: "slot", index: slotIndex}`
- local Promises: passed as a promise
- promise returned by `E(p).foo()`: passes as a promise, with pipelining enabled
- Function: rejected (todo: wrap)

## Garbage Collection vs Metering

When a swingset kernel is part of a consensus machine, the visible state must be a deterministic function of userspace activity. Every member kernel must perform the same set of operations.

However we are not yet confident that the timing of garbage collection will remain identical between kernels that experience different patterns of snapshot+restart. In particular, up until recently, the amount of "headroom" in the XS memory allocator was reset upon snapshot reload: the new XS engine only allocates as much RAM as the snapshot needs, whereas before the snapshot was taken, the RAM footprint could have been larger (e.g. if a large number of objects we allocated and then released), leading to more "headroom". Automatic GC is triggered by an attempt to allocate space which cannot be satisfied by this headroom, so it will happen more frequently in the post-reload engine than before the snapshot. See issues #3428, #3458, and #3577 for details.

We rely upon the engine to only invoke finalizer callback at explicitly-deterministic times, but we tolerate (guard against) objects becoming collected spontaneously, which will e.g. cause a WeakRef to become "dead" (`wr.deref() === undefined`) at a random point in the middle of a turn. Any code which calls `wr.deref`, or is conditionally executed/skipped according to the results, is "GC-sensitive". This includes `convertSlotToVal`, and therefore `m.unserialize`.

We cannot allow metering results to diverge between validators, because:

- 1: it might make the difference between the crank completing successfully, and the vat being terminated for a per-crank metering fault
- 2: it will change the large-scale Meter value, which is reported to userspace
- 3: it might cause the runPolicy to finish the block earlier on one validator than on others

all of which would cause a consensus failure.

To prevent this, we run most of the "inbound" side of liveslots without metering. This includes the first turn of all `dispatch.*` methods, which runs entirely within liveslots:

- `dispatch.deliver` performs argument deserialization in the first turn, then executes user code in the second and subsequent turns
- `dispatch.notify` does the same
- the GC deliveries (`dispatch.dropExport`, etc) only use one turn

We also disable metering when deserializing the return value from a (synchronous) device call, and when retiring a promise ID (which touches `slotToVal`).

Finally, we disable metering for all turns of the post-crank GC `finish()` call. This excludes all invocations of the finalizer callbacks, as well as all the `processDeadSet` code which is highly sensitive to the results.
