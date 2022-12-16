# Vat Upgrade

Dynamic vats can be upgraded to use a new code bundle. This might be used to fix a bug, to add new functionality, or merely to delete accumulated state and reduce memory usage.

Swingset vats are normally orthogonally persistent and assume they will live forever. So the ability to retain meaningful identity across an upgrade requires careful planning, starting with the very first version of the code being deployed.

For convenience, this description will use "v1" to describe the old version of the vat, and "v2" to describe the new version, but the process applies to any sequential pair of versions. The very first version is special, because we use `createVat` instead of `upgrade`. Also note that the v2 code bundle can actually be the same as the v1 bundle: "cross-grade" is a legitimate approach to deleting accumulated state.

## The Upgrade Sequence

Vat upgrade is triggered by an `upgrade()` message to the vat's "adminNode" (the one returned by `E(vatAdminService).createVat()`). This schedules an upgrade event on the kernel run-queue. When this event is processed, the following takes place:

- the vat's current worker (if any) is shut down
  - outstanding promises are rejected
  - non-durable exported objects are abandoned
- any heap snapshot for the vat is deleted
- the vat's transcript is (effectively) deleted
- (TODO) the vat's non-durable data is deleted
- the vat's source record is updated to point at the v2 source bundle
- a new worker is started, and loads the v2 source bundle
- the v2 code performs its "upgrade phase"
  - this is signaled with a call to `buildRootObject()`
  - the upgrade invocation gets new `vatParameters`
- the v2 upgrade phase rewires all durable virtual object kinds, and
  reassociates objects with all export obligations
- the v2 upgrade phase completes, telling the kernel the vat is open for
  business
- messages from other vats start to arrive at the v2 code

The first time the v2 code is invoked is called the "upgrade phase", and represents a limited window of time (a single crank) during which v2 must perform a number of tasks. The v2 code can use Promises to defer work into the (very) near future, however all this work must be complete by the time the promise queue is drained.

If a large number of data records need updating, the v2 code can (and should) use lazy/on-demand data migration, to avoid doing too much work in a single crank. However, the new vat only has a single upgrade-phase crank to prepare for incoming messages. So any lazy migration must be prepared to handle arbitrary messages despite the migration not being complete.

Vat upgrade uses a bundlecap, just like `createVat()`.

## Upgrade is Semi-Traumatic

Vat upgrade is not transparent: other vats will notice something has happened. The vat upgrade philosophy is to preserve long-term state, but abandon any work that was in-progress. Transactions that were in-flight should be aborted or error out. Some exported objects may start producing errors when used. Clients of the upgraded vat should be prepared to handle these errors and resume from some more fundamental starting point.

## Exported Obligations

As vats run, they send and receive messages. When these messages carry object references, the vat winds up with a set of "object imports" (things defined on other vats and imported here) and "object exports" (things defined here and exported to other vats). The vat startup process creates the "root object", which is exported immediately.

Each export represents an obligation. Other vats might send a message to the exported object, or they might send a message that references the exported object, and we must be prepared to handle it. So the primary job of the v2 vat code is to satisfy all the obligations incurred by v1. Another way to express this is that the kernel c-list, which maps kernel "krefs" to vat "vrefs" for each object, must be satisfied: every vref must be reassociated somehow, or marked as broken.

There are two basic kinds of exports:

- singleton in-RAM objects (created with `Far()` from a standard JavaScript
  `Object`, using the standard objects-as-closures pattern)

- virtual objects (defined with `makeKind()` or `makeDurableKind()`, created
  by invoking the function those return, and whose state is kept in the
  database rather than in RAM)

The v2 code is obligated to re-define all durable virtual-object Kinds created by v1 during the upgrade phase. Once complete, this allows liveslots to satisfy deserialization of any inbound message addressed to (or referencing) a previously-exported virtual object.

The v2 code is also obligated to reattach any singleton objects. The API for this is still under consideration. The root object may be a special case: if the upgrade invocation is simply a new call to `buildRootObject()`, then whatever object that returns will be associated with the root-object vref (`o+0`).

## Durable State

The v2 code runs in a brand new JavaScript environment: nothing is carried over from the RAM image of the v1 vat. To fulfill its obligations, v1 must arrange to deliver data and imported object references to v2. This uses two mechanisms: durable storage, and the "baggage" (better name TBD).

Vat code has access to three categories of collection objects. Each category offers both Map and Set collections, in strong and weak forms (parallel to the standard JavaScript `Map`, `Set`, `WeakMap`, and `WeakSet` facilities).

The simplest category are the "ephemeral" collections: their data is held only in RAM. The second are "virtual": data is held in a disk-based database. The third are "durable": in addition to using a DB, the data is preserved across vat upgrade. Durable collections can only hold durable objects.

Ephemeral and merely-virtual collections are discarded during upgrade. More precisely, the v2 code has no way to reach anything but durable data, so even if the kernel did not delete the DB records, the v2 code could not ever read them.

The v2 code gets exactly one special object during the upgrade phase, currently known as "the baggage". This is a durable Map. All versions get access to the baggage: the v1 code should add data to it, so that the v2 code can read it back out. This provides the bridge between versions that allows v2 to assume responsibility for the obligations created by v1. It also provides way for v1 to deliver authorities (in the form of imported object references) to v2, so v2 can talk to the world as if it were v1.

## Promises Are Broken

Promises do not cross the upgrade boundary. If v1 created and exported a Promise to some remote vat, that vat will observe the Promise becoming rejected at the moment of vat upgrade. If v1 received a Promise from a remote vat, v2 will not hear about the Promise.

This is a limitation of the upgrade mechanics (we haven't thought of a good way for v2 to assume responsibility for resolving a v1 promise, or to identify a v1 promise to attach a new `.then` callback). But it also reinforces the general philosophy of vat upgrade: preserve the long-term obligations, but abandon any work that was in-progress.

## The Upgrade Story

An analogy is in order. Imagine a small business, perhaps one that sells and repairs toasters. It has a small office, a phone number, suppliers, customers, outstanding purchase and repair orders, etc. The owner is preparing to retire, and a new owner across town has agreed to buy the business and move the office to a new building.

The old owner (v1) has accumulated authorities (object imports) like the long-term contracts with suppliers to provide replacement parts. It has also accumulated obligations: the (exported) phone number is known (imported) by lots of customers, and they expect to get an answer when they call (send a message). There are records of what customers owe or how much credit they have, and piles of data about how to fix a variety of toasters.

The old owner wants the new business to succeed, so they carefully put everything the new owner will need into a safe (the "baggage"). This includes the authorities to exercise the supplier contracts (object imports), the customer records, and the toaster repair manuals (plain data). It includes the authority to receive calls on the published phone number. They omit the outstanding repair orders (non-durable data), with the understanding that customers know about the transition and are prepared to receive errors for the incomplete work.

On the day of the handoff (kernel upgrade event), the movers show up at the old office and pick up the safe. They leave everything else. They deliver the safe to the new location, hand the key to the new owner, and take off.

The new owner (v2) starts by opening the safe (the baggage) and taking out the first few documents. They use the phone-number authority to claim ownership of the phone number, so customers can keep calling. They use the supplier contracts (object imports) to order new replacement parts. They cross-reference the repair manuals (plain data) to set up the new repair workbench.

They do all of this in a single day (crank), and by the end of the day they're ready to receive calls (inbound vat messages), so they're open for business.

## From Inside: V1 Prepares for Upgrade

To enable upgrade, the v1 code must stash important data in durable storage, and it must add pointers to this data in the baggage. It needs to do this from the very beginning: if v1 fails to retain something, v2 cannot get access to it, and the upgrade will be that much more traumatic.

For upgrade-important in-RAM objects, the v1 code needs to store a "reattachment handle" (name and API TBD) in durable storage. This gives the v2 code the authority to take over the identity of these exported objects.

For upgrade-important virtual objects (specifically durable virtual objects), the v1 code must store the "durable kind handle" in durable storage. This handle is created before calling `makeDurableKind`, like this:

```js
const fooHandle = allocateDurableKindHandle();
const makeFoo = makeDurableKind(fooHandle, fooBehavior);
someDurableStorage.set('foo handle', fooHandle);
```

The v1 code can also store imported objects (Presences) and plain data in a durable collection. Durable collections are themselves durable objects, so they can be nested:

```js
const childMap = makeScalarDurableMapStore();
const parentMap = makeScalarDurableMapStore();
parentMap.init('child', childMap);
baggage.init('parent', parentMap);
```

The 'baggage' is a special instance of `makeScalarDurableMapStore()`. The backing data is stored in a well-known per-vat location, so each version can be given a reference. These are, of course, distinct JavaScript `Object`s, just like running the same program twice results in distinct objects within each invocation. But for every piece of data that v1 wrote into the baggage, v2 can read an equivalent item from the baggage it receives.

While the baggage can use any suitable keys, at least one of the baggage keys should be a string or a number, some piece of plain data. The v2 vat starts out with nothing but baggage and a pile of source code, and source code can carry strings but not object references. So to allow v2 to get started, it must be able to do at least one `baggage.get('string')`. The value it retrieves from that initial call can be a durable object, which then might be usable as a second key. But without at least one plain-data key, v2 won't be able to extract anything from the baggage.

As v1 runs, it may need to add more data to the baggage, or remove stale data. The nested nature of the durable object storage graph means you can provide child objects to individual subsystems, to limit their authority:

```js
const fooData = makeScalarDurableMapStore();
const barData = makeScalarDurableMapStore();
baggage.set('foo data', fooData);
baggage.set('bar data', barData);
initializeFoo(fooData);
initializeBar(barData);
```

## From Outside: the AdminNode Upgrade API

The upgrade must be triggered by something holding the vat's `adminNode` object. This is typically the same thing that created the vat in the first place, but a common pattern is to hand the `adminNode` to some sort of governance object. The ability to upgrade a vat is also the ability to control its behavior, and any users who expect some particular vat behavior (e.g. they auditing some contract code) must take into account the possibility of upgrade, which means they'll care about who exactly can cause an upgrade to occur.

Upgrades use bundlecaps, just like the initial `createVat()` call. So the first step of an upgrade is to install the v2 source bundle (unless it is a "cross-grade" that re-uses the original bundle). This uses `controller.validateAndInstallBundle()` from the outside, and `D(devices.bundle).getBundleCap()` from the inside. See docs/bundles.md for details.

Once the governance object is holding the v2 bundlecap, it triggers the upgrade with `E(adminNode).upgrade(newBundlecap, options)`. This schedules the upgrade sequence (described above), and returns a Promise that resolves when the upgrade is complete. If the upgrade fails, the Promise is rejected and the old vat is reinstalled. An upgrade might fail because the new source bundle has a syntax error (preventing evaluation), or because the upgrade phase throws an exception or returns a Promise that rejects. It will also fail if the ugprade phase does not fulfill all of its obligations, such as leaving a durable Kind unattached.

An important property of the `options` bag is `vatParameters`. This value is passed to the upgrade phase (as the usual second argument to `buildRootObject()`) and can be used to communicate with the upgrade-time code before any external messages have a chance to be delivered. In the Zoe ZCF vat, this is how new contract code will be delivered, so it can be executed (and can assume responsibility for v1 obligations) to completion by the time the upgrade phase finishes.

## From Inside: V2 Executes the Upgrade

The v2 code wakes up inside the upgrade phase. The exact function signature is TBD, but for now let's assume that the v2 code is expected to provide the same `buildRootObject()` export as v1. In this case, the upgrade phase begins with `buildRootObject(vatPowers, vatParameters, baggage)` being called, where `vatParameters` will come from the call to `upgrade`. This `buildRootObject()` is expected to return an object, or a Promise that resolves to an object, and that object will assume the identity of the root object.

Before `buildRootObject()` returns (and/or its return Promise is resolved), the v2 code is obligated to call `makeDurableKind()` for every Kind that was created by the v1 code. It needs the stored handles to identify which Kind is being replaced:

```js
const fooHandle = baggage.get('foo handle');
const makeFoo = makeDurableKind(fooHandle, newFooBehavior);
```

It also needs to reattach every singleton `Far()` object exported by the v1 code.

When `buildRootObject()` finishes and the upgrade phase completes successfully, the kernel will reject all Promises that v1 had exported (specifically all promises for which v1 was the "decider"). It will terminate any non-durable exports made by v1, and external vats which imported those objects will find themselves holding a broken reference (i.e. every message sent to it will be rejected with an Error, just as if they were exported by a vat which was then terminated).

TBD: we might terminate any Durable exported objects which v2 does not reattach, or we might treat that as an error.

(TODO) If the v2 code experiences an error during the upgrade phase, the entire upgrade is aborted and the v1 code is reinstated.
