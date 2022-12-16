# Vat Workers / Vat Managers

To support a variety of vat execution engines, each vat is isolated into a "Vat Worker". The kernel interacts with this through a "Vat Manager". Messages between these three pieces (kernel, manager, and worker) are defined in this document, along with the "translator" needed to convert object/promise references between the different domains.

## Delivery (one per Crank)

The kernel moves from one "Crank" to the next by pulling an action off the run-queue and executing it. There are two kinds of actions: a message delivery, and a promise resolution notification. Each action will cause a single "Delivery" object to be constructed and delivered to a specific vat, however which vat will receive it is not known until the action is examined.

When the run-queue action is `send`, the action will contain a "target" and a message to be sent. This `target` will either be an object reference or a promise reference. For object references, the kernel object table is consulted to determine which vat owns that object. For promise references, the promise table says what state that promise is in:

- if the promise is resolved to an object, the object table is used, just as if the message were sent to the object directly
- if the promise is resolved to data or rejected, an error result is generated and a new notification action is pushed onto the end of the run-queue (to reject the message's result promise)
- if the promise has been forwarded to another promise, the lookup process recurses with that other promise
- if the promise is unresolved:
  - if decision making authority is currently held by the kernel, the message is queued within the target promise, for execution if/when the promise resolves
  - if decision making authority is held by a vat, but that vat does not have pipelining enabled, the message is queued within the target promise
  - if the decider is a pipelining-enabled vat, the message is delivered to the vat, just as if the message target was an object in that vat

In both `send` cases, if a message needs to be delivered to a vat, the kernel will construct a `send` Delivery object.

If instead, the run-queue action is `notify`, the action will name a promise (which must be in one of the resolved states) and a vat to inform. The kernel will generate a `notify` Delivery object, and invoke the VatManager's `.deliver` method as before.

The `Delivery` object is a hardened Array of data (Objects, Arrays, and Strings, all of which can be serialized as JSON), whose first element is a type. It will take one of the following shapes:

- `['message', targetSlot, msg]`
- `['notify', resolutions]`
- `['dropExports', vrefs]`

In the `message` form, `targetSlot` is a object/promise reference (a string like `o+13` or `p-24`), which identifies the object or promise to which the message is being sent. This target can be a promise if the message is being pipelined to the result of some earlier message.

The `msg` field is an object shaped like `{ method, args, result }`, where `method` is a string (the method name being invoked), `args` is a "capdata" structure (an object `{ body, slots }`, where `body` is a JSON-formatted string, and `slots` is an array of object/promise references), and `result` is either `null` or a promise reference string (the promise that should be resolved by the executing vat if/when the message processing is complete).

In the `notify` form, `resolutions` is an array of one or more resolution descriptors, each of which is an array of the form:

- `[vpid, promiseDescriptor]`

`vpid` is a promise reference that names the promise being resolved. `promiseDescriptor` is a record that describes the resolution, in the form:

- `{ rejected, data }`

`rejected` is a boolean value, where `true` indicates that the promise is being fulfilled and `false` indicates that `data` is a capdata structure that describes the value the promise is being fulfilled to or rejected as.

This Delivery object begins life in the kernel as a `KernelDelivery` object, in which all of the object/promise references ("slots") are kernel-centric. Object references will look like `ko123`, and promise references will look like `kp456`.

The kernel uses a vat-specific "translator" to convert this `KernelDelivery` into a `VatDelivery` object, in which the slots are vat-centric (`o+NN`, `p-NN`, etc). This conversion goes through the vat's "c-list", and may mutate the c-list as necessary (when the vat is introduced to an object that it did not already have access to). One form of mutation is the deletion of entries for promises that have been resolved: vats and the kernel follow a shared policy so they can forget these references simultaneously.

The kernel then invokes the target vat's `VatManager`'s `.deliver()` method with the `VatDelivery` as its one argument. `deliver()` is expected to return a Promise that fires with a `KernelDeliveryResult` object when the vat is idle once more. The result indicates whether the Vat finished execution of the delivery without fault, or if e.g. the vat suffered a metering underflow or attempted to use a missing c-list entry. At this point, the kernel will commit state changes and/or react to the vat being terminated.

## Syscall

The VatManager is given access to a `VatSyscallHandler` function. This takes a `VatSyscall` object, which is a hardened array, in which the first element is always a type string. It takes one of the following forms:

- `['send', target, msg]`
- `['callNow', target, method, args]`
- `['subscribe', vpid]`
- `['resolve', resolutions]`
- `['vatstoreGet', key]`
- `['vatstoreSet', key, data]`
- `['vatstoreDelete', key]`
- `['dropImports', slots]`

As with deliveries (but in reverse), the translator converts this from vat-centric identifiers into kernel-centric ones, and emits a `KernelSyscall` object, with one of these forms:

- `['send', target, msg]`
- `['invoke', target, method, args]`
- `['subscribe', vatid, kpid]`
- `['resolve', vatid, resolutions]`
- `['vatstoreGet', vatid, key]`
- `['vatstoreSet', vatid, key, data]`
- `['vatstoreDelete', vatid, key]`

The `KernelSyscallHandler` accepts one of these objects and executes the syscall. Most syscalls modify kernel state (by appending an item to the run-queue, or modifying promise- and object- tables) and then return an empty result. `invoke` is special in that it will synchronously invoke some device and then return a result that contains arbitrary data. In any event, the KernelSyscallHandler returns a `KernelSyscallResult` object, which has one of the following forms:

- `['ok', null]`
- `['ok', capdata]`
- (we can imagine a `['error', reason]` form, but errors in device invocations or within the kernel are delivered by throwing exceptions, which will terminate the kernel, and thus does not need a way to express an error in-band)

The `KernelSyscallResult` is passed to the translator, which converts it into a `VatSyscallResult` object, with the same forms. This result is passed to the VatManager as the return value of the syscall invocation.

The entire sequence looks like:

![vat-worker diagram](./images/vat-workers.png)

## Device Invocation

"Devices" were originally intended to be just like vats, except with access to external endowments, allowing them to influence (and be influenced by) the outside world, unmediated by the kernel. Devices are the only way for a swingset to do any IO. Consequences of this model became quickly apparent:

- deterministic operation cannot be guaranteed in the face of endowments
- therefore orthogonal persistence was removed, along with the transcript
- Promises are harder to reason about without orthogonal persistence, so they were removed
- we have use cases that require synchronous invocation of device code
- that requires a new vat syscall, and a new device delivery

The resulting Device design gives vats the ability to do `syscall.callNow()`, which looks a lot like `syscall.send` except that it does not accept a `result` promise identifier, it blocks waiting for the device operation, and it returns a capdata value. On the device side, we add a `dispatch.invoke()`, which is like the existing `dispatch.deliver()` except that it does not include a `result` argument, and it expects a capdata return value.

Devices can also do `syscall.sendOnly()`, which is just like `syscall.send()` except that it doesn't accept a `result` argument. Devices can do no other syscalls. Vats can query values directly from a device by reading the return value of `syscall.callNow()`, or they can ask the device to send them a message in the future (e.g. when a timer has expired, or when an IO device has received a message). These future messages are sent from the device back to the vat with `sendOnly`, because the device cannot resolve a Promise the same way a normal vat would do.

The `KernelSyscallHandler` function that implements `syscall.callNow()` will take the `KernelSyscall` object, confirm that the `target` points at a device node, look up the owning device, and create a `KernelInvocation` object to encapsulate the arguments. This is sent through a device-specific translator to get a `DeviceInvocation` object (with device-centric object identifiers), which is submitted to the DeviceManager's `invoke()` method. This `invoke()` is expected to perform the device action and then return a `DeviceResult` object. The result is translated again into a `KernelSyscallResult`. Now that the device side of the interaction is complete, the `KernelSyscallResult` is passed through the invoking vat's translator to get a `VatSyscallResult`, and then returned to the vat.

At its deepest point, the call stack will basically look like:

- (top) device code implementing `dispatch.invoke`
- kernel handler for `callNow`
- vat calling (blocking for result of) `syscall.callNow`
- (bottom) kernel delivery to that vat

Devices can invoke `syscall.callNow` while they run, so the call stack could be one layer deeper:

- (top) kernel handler for `sendOnly` (pushes item on the run-queue)
- device code implementing `dispatch.invoke`
- kernel handler for `callNow`
- vat calling (blocking for result of) `syscall.callNow`
- (bottom) kernel delivery to that vat

Devices can also be invoked externally, e.g. in response to inbound IO messages, or a timer expiring. We still need to build a mechanism for safe interleaving (see [#720](https://github.com/Agoric/agoric-sdk/issues/720)), so this can't happen in the middle of some other crank, but at suitably safe times, some function within the device will be invoked by a caller outside the kernel. Within this function, the device might call `syscall.sendOnly`, and we need to safely append that item to the run-queue (and inform the caller that they ought to run the kernel now, because it has work to do). The device might also use `setDeviceState()` to update its internal state. All of the state-vector changes made by these calls need to be committed to, just as if a vat had successfully finished a crank.

When invoked externally, the call stack might look like:

- (top) kernel handler for `sendOnly` (pushes item on the run-queue)
- device code implementing externally-visible function
- kernel event-interleaving handler
- external caller invoking device function
- (bottom) IO or timer event which provoked that external caller

## VatWorker

The kernel interacts only with the `VatManager`. Each vat manager owns a `VatWorker` in which the actual vat code executes. This might be in the same process: the current implementation runs all vat code inside a SES-confined `Compartment` using injected metering code to prevent runaway vats from breaking other vats or the overall kernel. However other implementations could run vat code in a separate process, with the `VatDelivery`/`VatSyscall` objects being serialized and sent over a pipe. The vat code could be executed on a different JavaScript engine, like XS, either in the same process as the kernel, or in a separate one.

The kernel has a method named `addVatManager` which is the entry point by which new managers are connected to the kernel. A separate function (specific to the type of worker being created) is used ahead of time to build the manager object. `addVatManager` is responsible for constructing the necessary translators, giving the manager a way to invoke syscalls, and attaching the new vat to the kernel tables so that other vats can send it messages.

When the Worker is in a separate process, we expect the VatManager to send it formatted messages over a pipe. The Manager will send a `VatDelivery` request, and wait to receive the `VatDeliveryResult` response. In the meantime, the Vat will send `VatSyscall` requests over the same pipe (so really the Manager is waiting for either a `VatSyscall` request or the `VatDeliveryResult` response). The Worker will do a blocking read of the pipe, waiting for the `VatSyscallResult` to come back. This blocking read is the key to allowing the vat to believe it has synchronous access to data in secondary storage. The kernel can perform async reads of a database or filesystem, if necessary, and respond at its own pace, but the vat will sit quietly waiting for that response before it does anything else. The Manager doesn't declare the crank as complete until it sees the `VatDeliveryResult`, so the kernel will not make any new deliveries while this one is still active.

## Metering

The kernel is unaware of how vats are metered (if at all). All it knows is that a `DeliveryResult` comes back with an indication of the vat being terminated.

The VatManager communicates with the VatWorker to manage metering. The actual metering is likely to be implemented in the worker. The worker will either inject metering code in the bundles it is asked to evaluate, or use platform-level (`ulimit`) tools to enforce resource limits. If the vat process is terminated because of a resource limit, or if the `VatDeliveryResult` takes too long to return (indicating excessive CPU usage or an infinite loop), the manager will close the pipes and terminate the child process, and provide a "vat has terminated" `VatDeliveryResult` back to the kernel.
