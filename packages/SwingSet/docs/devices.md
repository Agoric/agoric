# "Device" Access

Most vats communicate only in terms of object references, method calls,
promises, and resolution. Everything outside the vat is accessed through an
eventual send, which can deliver pure data and references, but nothing else.

A SwingSet application includes a kernel and a collection of vats. These vats
can talk to each other, but to have any influence on the world outside that
application, there must be a "device" which provides access to authority
outside the vat model, and at least one vat must have a reference to
something within that device.

The simplest such device might just provide synchronous access to a shared
data structure that lives outside the kernel state database. Since vats are
normally confined to communicating through object messages (and even then
only through asynchronous access), even a basic key-value store must be
presented as a "device" if shared beyond a single vat.

## Vat Access to Devices

The SwingSet architecture, despite being implemented in Javascript, is
patterned after lower-level OS kernel layout, hence the distinction between
"userspace" and "kernelspace", with a "syscall" API from one to the other.
Following that pattern, we say that certain vats have extraordinary access to
one or more "device objects", which allows commands to be sent to a "device
driver" that has privileged access to functions or data that is outside the
vat model.

These device objects are imported into vats just like anything else (such as
exports from other vats, or kernel promises). They can be included in
argument lists and delivered from one vat to another like normal objects.
However, they cannot be the target of a `syscall.send`. Instead, a special
`syscall.callNow` accepts a device reference as its first argument:

```
syscall.callNow(device, argsbytes, slots) -> { bytes, slots }
```

This `callNow` runs _synchronously_, unlike `syscall.send()`. The device
driver returns the results with the same format as the arguments are sent: a
serialized object, plus some number of slots that it can reference. All
interactions with the device are through syscalls and data values. This
preserves our ability to migrate the vat to a new machine (and forward
messages, if necessary).

The `liveSlots` wrapper provides an easier-to-use frontend to `syscall.send`,
allowing userspace code to use `E(presence).method(args) -> promise` instead
of raw syscalls. It provides a similar frontend to `callNow`, which looks
like:

```
retval = D(devicenode).method(args)
```

## Device Access to Vats

Devices can send messages to vats. In particular, they can perform
`syscall.sendOnly()`, which pushes a message onto the kernel run-queue.
Unlike `syscall.send`, `sendOnly` does _not_ support a result promise, so the
device does not get to hear about the results of delivering the message.
`sendOnly` does not return anything.

The `deviceSlots` wrapper exposes `sendOnly` with a special wrapper:

```
SO(presence).method(args)
```

Unlike the `E` wrapper, this does not return a promise, since `sendOnly` does
not provide one either.

## Devices Don't Promise

For simplicity, we remove the promise APIs from devices and their
interactions with vats. Devices cannot create kernel promises, and
`syscall.sendOnly` (which is the only way for the device to send messages to
vats) does not cause a promise to be created. Vats cannot put promises into
the arguments of `syscall.callNow`.

We might change this in the future.

## Bootstrap Vat Disseminates Device Access

Initially, the bootstrap vat holds exclusive access to all devices. They are
provided as an argument to the `bootstrap()` call, in the same way it gets
the root object of all other vats. From here, the `bootstrap()` can share
device access with other vats as it sees fit. Devices can be passed as
message arguments and through promise resolutions just like any other import
or export.

The function signature is `bootstrap(vats, devices) -> undefined`. The
`devices` argument, like `vats`, is a plain object whose keys are the names
of the devices, with values that contain device references.

## Device Configuration and Endowments

Devices are special because they receive **endowments**, which are functions
that point outside the kernel. These are provided by the host application, to
give the device access to IO or storage outside the kernel database
(`swingstore`).

The `initializeSwingset()` call is supplied with a `config` object that
describes the initial set of vats (including the bootstrap vat). We use
`config.devices` to define the set of host devices that will be made
available to `bootstrap()`. `config.devices` is an object whose keys are
device names, and values are a description of how the device should be
created, just like for vats. `sourceSpec` is the most useful parameter: it
names a file which provides the source code of the device's entry point. This
file can `import` other files. During initialization, this file (and
everything it references) will be bundled into a single string, and this
string will be stored in the database. Every subsequent launch of the kernel
will use this same source code.

Initialization happens exactly once, for the lifetime of the swingset state
database, using `initializeSwingset()`.

```js
function initializeApplication() {
 ..
 const config = {
   vats: ..,
   devices: {
     myDevice: {
       sourceSpec: '../my-device.js',
       creationOptions: {},
     },
   },
   ..,
 };
 await initializeSwingset(config, [], hostStorage);
 ..
```

Later, each time the host application restarts, it must call
`makeSwingsetController` to build the controller object, through which the
application will drive the kernel. At this time, the application can can
provide endowments to each device through the `deviceEndowments` argument.
This object uses the same device names as keys, and each value is provide to
the corresponding device in the `endowments` parameter.

```js
function startApplication() {
 ..
 const deviceEndowments = {
   myDevice: { stuff },
 };
 const controller = makeSwingsetController(hostStorage, deviceEndowments, runtimeOptions);
 ..
 await controller.run();
```

For every device configured during initialization, there must be exactly one
set of endowments provided to `makeSwingsetController`. It is an error to
provide an entry in `config.devices` which collides with the name of a kernel
device (see below).

(For the convenience of unit tests, any configured device that lacks
endowments will be skipped. You can provide a special
`creationOptions.unendowed` property during initialization to make the
runtime instantiate the device anyways).

### Device Construction

The standard device source file should export a function named
`buildRootDeviceNode`, which acts very much like `buildRootObject` for vats:

```js
// exampledevice-src.js
import { Far } from '@endo/marshal';

export function buildRootDeviceNode(tools) {
  // tools contains: SO, getDeviceState, setDeviceState, endowments,
  //                 deviceParameters, serialize
  const { stuff } = endowments;

  return Far('root',
    helloDevice(arg) { return stuff(arg); },
  });
}
```

This sort of device code gets an environment similar to the one liveslots
provides to regular vat code, except:

- It does not provide the `E()` wrapper, since devices cannot manage promises
  or perform result-bearing eventual-sends
- Instead, it provides an `SO()` wrapper, which exposes `syscall.sendOnly`.
- All pass-by-presence objects returned by device methods are passed as
  new device nodes, not objects
- The return value of `buildRootDeviceNode` is exposed as the root device
  node to the bootstrap function (e.g. `devices.myDevice`)

### State Management

State management for devices is very different than for vats, because devices
do not benefit from the orthogonal persistence that vats get. Instead, they
get `getDeviceState` and `setDeviceState`, which they must call after each
invocation that changes internal state.

TODO: examples of safe usage

### Device-Related Vat APIs

Vats get one API to interact with devices:

- `syscall.callNow(deviceSlot, method, argsCapdata) -> resultsCapdata`

The `liveSlots` helper for constructing vats provides both an `E()` wrapper
(for constructing `syscall.send()` messages to Presences) and a `D()` wrapper
(for constructing `syscall.callNow()` messages to device nodes). For example,
the bootstrap vat could do:

```js
  bootstrap(vats, devices) {
    const result = D(devices.myDevice).helloDevice('foo');
```

### Device APIs

Within a device defined by `buildRootDeviceNode`, device node methods can
receive Presence objects very much like those in vats. However instead of
using `E(presence).methodname(args)`, device code must use `SO` (for
`sendOnly`):

```js
// hello-device-src.js
import { Far } from '@endo/marshal';
export function buildRootDeviceNode(tools) {
  return Far('root',
    callMe(callbackObj) { SO(callbackObj).hello('there'); },
  });
}
```

This will push a delivery onto the kernel run-queue.

```js
// vat does
const callbackObj = Far('cb', {
  hello(arg) {
    console.log('they called me!', arg);
  },
});
E(devices.hello).callMe(callbackObj);
// and in some upcoming crank, we'll see
//   'they called me! there'
```

This is most useful when prompted by external input, through a callback
established via an endowment. See the timer and mailbox devices for examples.

The low-level device API uses `dispatch` and `syscall` just like with vats.
However the inbound message pathway uses `dispatch.invoke(deviceNodeID, method, argsCapdata) -> resultCapdata`, and the outbound pathway uses
`syscall.sendOnly`.

## Raw Devices

An alternate way to write a device is to use the "raw device API". In this
mode, there is no deviceSlots layer, and no attempt to provide
object-capability abstractions. Instead, the device code is given a `syscall`
object, and is expected to provide a `dispatch` object, and everything else
is left up to the device.

This mode makes it possible to create new device nodes as part of the normal
API, because the code can learn the raw device ref (dref) of the target
device node on each inbound invocation, without needing a pre-registered
table of JavaScript `Object` instances for every export.

Raw devices have access to a per-device string/string key-value store whose
API matches the `vatStore` available to vats:

- `syscall.vatstoreGet(key)` -> `string`
- `syscall.vatstoreSet(key, value)`
- `syscall.vatstoreDelete(key)`

The mode is enabled by exporting a function named `buildDevice` instead of
`buildRootDeviceNode`.

```js
export function buildDevice(tools, endowments) {
  const { syscall } = tools;
  const dispatch = {
    invoke: (dnid, method, argsCapdata) => {
      ..
    },
  };
  return dispatch;
}
```

To make it easier to write a raw device, a helper library named "deviceTools"
is available in `src/deviceTools.js`. This provides a marshalling layer that
can parse the incoming `argsCapdata` into representations of different sorts
of objects, and a reverse direction for serializing the returned results.
Unlike liveslots and deviceslots, this library makes no attempt to present
the parsed output as invocable objects. When it parses `o-4` into a
"Presence", you cannot use `E()` on that presence. However, you can extract
the `o-4` from it. The library is most useful for building the data structure
of the return results without manual JSON hacking.

## Kernel Devices

The kernel automatically configures devices for internal use. Most are paired
with vats to expose the functionality for user vats.

- `vats.vatAdmin` works with `devices.vatAdmin` to allow the creation of new
  "dynamic vats" at runtime.

### Device Access to Kernel Hooks

Internal devices like vat-admin need to invoke kernel-provided endowments in
a way that translates device-side objects into the correct kernel references
(krefs). To facilitate this, the kernel can configure internal devices with a
named list of "kernel hooks". Each one is a kernel function which the device
can invoke by calling `syscall.callKernelHook(hookname, argsCapData)`. The
hook name must be a string that matches a configured hook. The second
argument must be a dref-space CapData structure, which will be translated to
kref-space and provide to the hook function. The hook can return capdata: it
will be translated back into device-space and returned to the device.
`callKernelHook` is invoked synchronously.

To configure these, the kernel should put the functions on
`deviceHooks.get(deviceName)[hookName]` during or after `start()`. For unit
tests, they can be added later, by calling
`controller.debug.addDeviceHook(deviceName, hookName, hook)`.

The kernel-hosted hooks receive kref-based arguments, and the translation
process will add new device exports to the c-list, but remember that the
refcounts are not incremented. If the kernel hook needs to hold onto an
object it gets from the device, it should establish its own refcount.

References returned from the kernel hook will also add device imports to the
c-list, and the refcounts on them will be handled by the device in the usual
fashion. Currently, that means the device increments the refcount and never
drops it again: devices hold on to everything forever (until we implement
some form of GC within devices).

## Devices in the Swingset Source Tree

The Swingset source tree includes source code for several useful devices.

- Timer Device: this gives vats the ability to set one-shot and repeating
  timers, and to ask about the current time. Host applications must configure
  and endow a timer device, and connect it to a wrapper vat. User vats talk
  to the wrapper vat for access.
- Mailbox: this enables the Comms/VatTP vats to exchange messages with other
  kernels, through a host-application provided delivery channel.
- Command: this facilitates an HTTP or WebSocket -exposed channel into and
  out of user vats.

Using these devices requires adding the device (and associated wrapper vat)
to the `config.devices` and `config.vats` object, then endowing the devices
at runtime. E.g. the Timer Device needs a way to query the current time, and
to be notified when a particular time has been reached.

### Mailbox Device

Most off-machine communication takes place through a "mailbox". This is a
special portion of the kernel state vector into which the VatTP layer can
write message bodies destined for other machines, using the `add(recipient, msgnum, body)` method of the outbox device. The host loop is expected to
allow the kernel to quiesce, then examine this mailbox for new outbound
messages. At that point it should attempt to deliver them to the other
machine, using TCP/TLS (perhaps with `libp2p`) or other means. By deferring
message delivery until the kernel state has been checkpointed, we avoid the
"hangover inconsistency" problem.

VatTP code can remove messages from the outbox when it receives an
acknowledgment of receipt, by using the `remove(recipient, msgnum)` method.

Each mailbox is paired with a partner in some other machine. To send an
acknowledgment to that remote mailbox, VatTP can use the
`ackInbound(recipient, msgnum)` method. This ack is written into the state
vector next to the outbox where it can be delivered to the remote end by the
same host loop.
