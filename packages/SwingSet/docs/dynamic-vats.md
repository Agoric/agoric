# Dynamic Vats

A SwingSet machine has two sets of vats. The first are the _Static Vats_, which are defined in the configuration object, and created at startup time. The root objects of these vats are made available to the `bootstrap()` method, which can wire them together as it sees fit.

The second set are the _Dynamic Vats_. These are created after startup, with source code bundles that were not known at boot time. Typically these bundles arrive over the network from external providers. In the Agoric system, contracts are installed as dynamic vats (each spawned instance goes into a separate vat).

Dynamic vats are metered by default: each message delivered gets a limited amount of resources (CPU cycles, memory, stack frames). If it exceeds this budget, the vat is terminated. All outstanding messages will be rejected, any future messages will be rejected, and it will never get CPU time again.

## Creating a Dynamic Vat

Vats are created by sending a `createVat()` message to the _Vat Admin Service_ object, containing the source bundle which defines your new vat. Dynamic vats can only be created by other vats on the same SwingSet, so ultimately one of the static vats must cooperate.

The ability to create new vats is not ambient: it requires access to the Vat Admin Service object, which is initially only made available to the bootstrap call. The bootstrap call usually shares it with the vat that installs contracts.

### Making the Source Bundle

Vats are created from "bundlecaps", which are objects that represent installed source code bundles. See docs/bundles.md for details.

The first step is to create a source bundle. To do this, you'll want to point the `bundleSource` function (from the `@endo/bundle-source` package) at a local source file. This file should export a function named `buildRootObject` (it can export other things too, perhaps for unit tests, but only `buildRootObject` will be used by the dynamic vat loader). Suppose your vat code is stored in `vat-counter.js`:

```js
export function buildRootObject() {
  let counter = 0;
  const root = {
    increment() {
      return (counter += 1);
    },
    read() {
      return counter;
    },
  };
  return harden(root);
}
```

Then turn this into a bundle:

```js
import bundleSource from '@endo/bundle-source';
async function run() {
  const bundle = await bundleSource('.../vat-counter.js');
  // 'bundle' can be JSON serialized
}
```

The next step is to somehow get this bundle into the host application, perhaps through a network connection. In the Agoric system, the bundling and transfer is managed by the `agoric deploy` command.

Then, your host application can install this bundle into the kernel. Pass the bundle to `controller.validateAndInstallBundle(bundle)`, which will return a `bundleID` string. Then somehow get this bundleID into a vat.

Once inside a vat with access to the `bundle` device, you can convert the bundleID string into a "bundlecap" with:

```js
const bundlecap = D(devices.bundle).getBundleCap(bundleID);
```

The `vatAdminService` accepts the bundlecap.

### Invoking createVat()

Once the bundle object is present within a vat that has access to the Vat Admin Service, you create the vat with a `createVat` call:

```js
const control = await E(vatAdminService).createVat(bundlecap, options);
```

### Options

`createVat()` recognizes the following options:

- `name` (string): used in debug messages and the `ps`-visible worker argments, to name the vat
- `meter` (`Meter` object, default none): a Meter object to impose upon the vat. If provided, the Meter will be deducted for each computron spent executing, and the vat will be terminated if the Meter runs out. See docs/metering.md for details.
- `managerType` (`'local'` or `'xs-worker'` or `'nodeWorker'` or `'node-subprocess'`): the type of worker that will host the vat. `xs-worker` is the only sensible choice. Defaults to a value set by `config.defaultManagerType`, or `xs-worker` if that is not set
- `vatParameters` (JSON-serializable object): data passed to `buildRootObject` in the `vatParameters` argument
- `enableSetup` (boolean, default `false`): only used for specialized vats like comms, bypasses `buildRootObject` and the liveslots layer
- `enablePipelining` (boolean, default `false`): only used for specialized vats like comms, pipelines all messages into the vat instead of queueing them in the kernel until the target promise resolves
- `enableVatstore` (boolean, default `true`): enables `vatPowers.vatstore` methods for DB-backed state management
- `virtualObjectCacheSize` (integer): performance tuning parameter
- `useTranscript` (boolean, default `true`): only used for specialized vats like comms
- `reapInterval` (integer): performance tuning parameter
- `critical` (special object): mark the vat as "critical", if it terminates then panic the kernel

Note that any vat which can reach `createVat()` can create a new unmetered vat, even if the caller was metered themselves. So do not share an unattenuated Vat Admin object with an unmetered vat if you wish them to remain confined to metered operation.

#### Critical Dynamic Vats and the criticalVatKey

The `critical` option can be used for certain vats which are so important that the system should halt rather than proceed without them. It causes the same behavior as the `critical: true` flag on static vats (e.g.`config.vats.NAME.creationOptions.critical = true`): if a critical vat is terminated for any reason (metering failure, illegal syscall), the kernel panics, which causes `controller.run()` to reject, which should prevent the host application from committing the state vector that includes the vat being terminated.

However we cannot grant the ability to halt the entire kernel to just any user of `createVat()`. To prevent that, the dynamic `critical:` option requires a special object named `criticalVatKey`. This can only be obtained from the vat-admin _root object_ (which is distinct from the `vatAdminService`).

Bootstrap methods usually look like the following:

```js
function bootstrap(vats, devices) {
  const vatAdminService = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
  // do rest of bootstrap
  ..
  // maybe create a dynamic vat
  const options = { vatParameters };
  const { root, adminNode } = await E(vatAdminService).createVat(bundlecap, options);
```

To use the critical vat flag, it should do this instead:

```js
function bootstrap(vats, devices) {
  const criticalVatKey = await E(vats.vatAdmin).getCriticalVatKey();
  const vatAdminService = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
  // do rest of bootstrap
  ..
  // maybe create a dynamic vat
  const options = { vatParameters, critical: criticalVatKey };
  const { root, adminNode } = await E(vatAdminService).createVat(bundlecap, options);
```

## Root Object and Admin Node

The result of `createVat` gives you access to two things. One is a _Presence_ through which you can send messages to the root object of the new vat (whatever `buildRootObject()` returned):

```js
const { root, adminNode } = await E(vatAdminService).createVat(bundlecap);
await E(root).increment();
let count = E(root).read();
console.log(count); // 1
await E(root).increment();
count = E(root).read();
console.log(count); // 2
```

The other is the `adminNode`. This gives the creator of the vat control over the vat itself. Through this, you can retrieve statistics about the vat's execution, find out whether it is still running or not (it might be terminated because it ran down its meter), and preemptively terminate the vat. More features will be added in the future.

### Vat Stats

The current stats include the number of objects, promises, and devices in the vat's _C-List_, which tracks what this vat can reach on other vats.

It also contains the count of entries in the vat's _transcript_. When the SwingSet restarts and needs to restore the vat to its previously-stored state, the kernel will replay the transcript: it re-submits each entry to the vat, allowing the vat to perform the same actions it did the previous time around. Each message delivery goes into a separate transcript entry, as does each promise-resolution notification. The `transcriptCount` thus gives a rough measure of how many messages the vat has executed.

```js
const data = E(adminNode).adminData();
const { objectCount, promiseCount, deviceCount, transcriptCount } = data;
```

### Waiting for Vat Termination

To find out when the vat is terminated (either explicitly or due to a metering fault), you can wait for the `done()` Promise to fire. It will be resolved normally if the vat invokes `vatPowers.exitVat(reason)`. It will be rejected if the vat invokes `vatPowers.exitVatWithFailure(reason)`, if the adminNode holder uses `E(adminNode).terminateWithFailure(reason)`, if the vat suffers a metering fault, or if the vat is halted for any other reason (illegal syscall, etc).

```
E(adminNode).done()
  .then(() => console.log(`the vat was intentionally shut down`) )
  .catch(error => console.log(`surprise halt: ${error}`) );
```

When the vat halted due to a metering fault, `error` will be a `RangeError` with a message of `Compute meter exceeded`, `Allocate meter exceeded`, or `Stack meter exceeded`.

## Upgrade

Dynamic vats can be upgraded to use a new source code bundle. Most vat state is discarded, however "durable" collections are retained for use by the replacement version. For full details, see docs/vat-upgrade.md .

The upgrade process is triggered through the admin node, and requires a bundlecap for the new source. (Note that "upgrading" to the same source bundle as the original vat is valid, and can serve as a sort of "spring cleaning").

```js
const results = E(adminNode).upgrade(newBundlecap, newVatParameters, options);
```
