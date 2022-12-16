# Static Vats

A SwingSet machine has two sets of vats. The first are the _Static Vats_, which are defined in the configuration object, and created at startup time. The root objects of these vats are made available to the `bootstrap()` method, which can wire them together as it sees fit.

The second set are the _Dynamic Vats_. These are created after startup, with source code bundles that were not known at boot time. Typically these bundles arrive over the network from external providers. In the Agoric system, contracts are installed as dynamic vats (each spawned instance goes into a separate vat).

This document describes how you define and configure the static vats.

## Creating a Static Vat

The source code for all static vats must be available at the time the host application starts up. This source code, and its dependencies, must not change for the lifetime of the SwingSet machine (which, through persistence and the kernel state database, extends beyond a single process). Applications are encouraged to copy the static vat sources into a working directory during some sort of "init" step, where they'll remain untouched by normal development work on the original files. But note that this won't protect against changes in dependencies.

Static vats are defined by a JS module file which exports a function named `buildRootObject`. The file may export other names; these are currently ignored. The module can import other modules, as long as they are pure JS (no native modules or binary libraries), and they are compatible with SES. See `vat-environment.md` for details of the kind of JS you can use. The static vat file will be scanned for its imports, and the entire dependency graph will be merged into a single "source bundle" object when the kernel first launches.

The `buildRootObject` function will be called with one object, named `vatPowers`. The contents of `vatPowers` are subject to change, but in general it provides pure functions which are inconvenient to access as imports, and vat-specific authorities that are not easy to express through syscalls. See below for the current property list.

`buildRootObject` is expected to return a hardened object with callable methods and no data properties (note that `harden` is available as a global). For example:

```js
export function buildRootObject(vatPowers) {
  let counter = 0;
  return harden({
    increment() {
      counter += 1;
    },
    read() {
      return counter;
    },
  });
}
```

Each vat has a name. A _Presence_ for this vat's root object will be made available to the bootstrap function, in its `vats` argument. For example, if this vat is named `counter`, then the bootstrap function could do:

```js
function bootstrap(argv, vats, devices) {
  E(vats.counter).increment();
}
```

The _bootstrap function_ is the method named `bootstrap` on a special _bootstrap vat_. This is a static vat defined in a separate section of the config object, currently named `config.bootstrapIndexJS`. This vat is given access to the root objects of all other vats, as well as access to all devices, plus a set of arguments passed into `buildVatController`, all delivered in the bootstrap message. This message is synthesized by the kernel and sent automatically at machine startup. Since no other messages exist at startup time, and only connectivity begets connectivity (as befits an object-capability system), the bootstrap function is entirely responsible for establishing the inter-vat connections necessary for subsequent activity.

### Legacy setup() Function

More generally, vats are defined in terms of a `syscall` object (for the vat to send instructions into the kernel), and a `dispatch` object (for the kernel to send messages into the vat). Vats can provide a `setup()` function which is given a `syscall`, among other things, and are expected to return a `dispatch`. Vats defined this way are not obligated to provide object-capability security within the vat. For example, `syscall.send()` can be used to send a message to any remote object that has ever been granted to anything within the vat. If everything within the vat can reach `syscall`, then every object within the vat is as powerful as any other, and there is no partitioning of authority within the vat.

Most vats use "liveslots", a layer which provides an object-capability environment within a vat. Liveslots is a library which provides a `makeLiveslots()` function. Vats which use liveslots will export a `setup()` function which calls `makeLiveslots()` internally. These vats tend to have boilerplate like this:

```js
export default function setup(syscall, state, helpers, vatPowers0) {
  return helpers.makeLiveSlots(
    syscall,
    state,
    (E, D, vatPowers) => buildRootObject(vatPowers),
    helpers.vatID,
    vatPowers0,
  );
}
```

These vats are still supported, for now. Any vat source file which exports `buildRootObject()` will automatically use liveslots. If the file does _not_ export `buildRootObject()`, it is expected to export a `default` function that behaves like the `setup()` described above.

A few vats do not use liveslots. The main one is the "comms vat", which performs low-level mapping of kernel-sourced messages into strings that are sent off-machine to other swingsets. This mapping would be rather inefficient if it went through the serialization/deserialization layers that liveslots provides to normal vats. The comms vat will eventually be loaded with some special configuration flag to mark it as non-liveslots, rather than retaining the `default`/`setup()` fallback.

## VatPowers

Static vats currently receive the following objects in their `buildRootObject()`'s sole `vatPowers` argument:

- `exitVat`
- `exitVatWithFailure`
- `disavow`, but only if `creationOptions.enableDisavow` was truthy

### vat termination: `exitVat` and `exitVatWithFailure`

A vat may signal to the kernel that it should be terminated at the end of its current crank. Two powers are provided to do this: `exitVat(completion)` and `exitVatWithFailure(reason)`. These powers will work in any vat but are primarily useful in dynamic vats. The two differ in how the circumstances of termination are signalled to holders of the vat's `done` promise: `exitVat` fulfills that promise with the value provided in the `completion` parameter, whereas `exitVatWithFailure` rejects the promise with the value provided in the `reason` parameter. Conventionally, `completion` will be a string and `reason` will be an `Error`, but any serializable object may be used for either. After the crank in which either of these powers is invoked, no further messages will be delivered to the vat; instead, any such messages will be rejected with a `'vat terminated'` error. Any outstanding promises for which the vat was the decider will also be rejected in the same way. The vat and any resources it holds will become eligible for garbage collection. However, the crank itself will end normally, meaning that any actions taken by the vat during the crank in which either exit power was invoked will become part of the persisted state of the swingset, including messages that were sent from the vat during that crank (including, notably, actions taken _after_ the exit power was invoked but before the crank finished).

### explicitly dropping imported Presences: `disavow`

If enabled, vat code can explicitly drop an imported Presence by calling `vatPowers.disavow(presence)`, which will cause liveslots to invoke `syscall.dropImports()` on the Presence's object ID. This is primarily for testing the GC syscalls without relying upon engine-level finalizers (which are non-trivial to force), especially before the finalization code is complete.

Once disavowed, the Presence stops working. Any messages sent to it (with `E(disavowedPresence).method(args)`) or which reference it (`E(target).method(disavowedPresence)`) will be rejected with an error. Any promise resolutions that reference it will fail somewhat silently (just like unhandled rejected promises).

It's not clear that `disavow` is a good idea: it may be removed once the GC implementation is complete.

## Configuring Vats

Each swingset is created by a call to `buildVatController`, which takes a `config` argument. The `config.vats` property is a Map of named vat definitions: each value is an object with `sourcepath` and `options`. The `sourcepath` is the filename of the vat definition file (the one that exports `buildRootObject`).

See "configuration.md" for details about the properties that `options` can contain.

## Built-in Vats

The kernel has a handful of built-in vats, which are automatically added and do not need to appear in the `config.vats` table. One is used to create new dynamic vats, this is known as the `vatAdmin` vat.

Other vats are defined by swingset but must be added (to `config.vats`) by the application. These include the timer management vat and the comms vat. These vats might be turned into built-in vats in the future, and removed from the application's sphere of responsibility.
