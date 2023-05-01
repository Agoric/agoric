# Vat Upgrade

Dynamic vats can be upgraded to use a new code bundle. This might be used to fix a bug, to add new functionality, or merely to delete accumulated state and reduce memory usage.

Swingset vats are normally orthogonally persistent and assume they will live forever. So the ability to retain meaningful identity across an upgrade requires careful planning, starting with the very first version of the code being deployed.

For convenience, this description will use "v1" to describe the old version of the vat, and "v2" to describe the new version, but the process applies to any sequential pair of versions. The very first version is special, because we use `createVat` instead of `upgrade`. Also note that the v2 code bundle can actually be the same as the v1 bundle, such a "null upgrade" is a legitimate approach to deleting accumulated state.

## The Upgrade Sequence

Vat upgrade is triggered by an `upgrade()` message to the vat's "adminNode" control facet (the one returned by `E(vatAdminService).createVat()`). This schedules an upgrade event on the kernel run-queue. When this event is processed, the following takes place:

* the vat's current worker (if any) is shut down
  * outstanding promises are rejected
  * non-durable exported objects are abandoned
* any heap snapshot for the vat is deleted
* the vat's transcript is (effectively) deleted
* (TODO) the vat's non-durable data is deleted
* the vat's source record is updated to point at the v2 source bundle
* a new worker is started, and loads the v2 source bundle
* the v2 code performs its "upgrade phase"
  * this is signaled with a call to `buildRootObject()`
  * the upgrade invocation gets new `vatParameters`
* the v2 upgrade phase rewires all durable virtual object kinds, and
  reassociates objects with all export obligations
* the v2 upgrade phase completes, telling the kernel the vat is open for
  business
* messages from other vats start to arrive at the v2 code

The first time the v2 code is invoked is called the "upgrade phase", and represents a limited window of time (a single crank) during which v2 must perform a number of tasks. The v2 code can use Promises to defer work into the (very) near future, however all this work must be complete by the time the promise queue is drained. This means `buildRootObject` may not `await` messages sent off-vat, because their responses cannot return before the initial `startVat` delivery is complete.

If a large number of data records need updating, the v2 code can (and should) use lazy/on-demand data migration, to avoid doing too much work in a single crank. However, the new vat only has a single upgrade-phase crank to prepare for incoming messages. So any lazy migration must be prepared to handle arbitrary messages despite the migration not being complete.

Vat upgrade uses a bundlecap, just like `createVat()`.

## Upgrade is Semi-Traumatic

Vat upgrade is not transparent: other vats will notice something has happened. The vat upgrade philosophy is to preserve long-term state, but abandon any work that was in-progress. Transactions that were in-flight should be aborted or error out. Some exported objects may start producing errors when used. Clients of the upgraded vat should be prepared to handle these errors and resume from some more fundamental starting point.

## Exported Obligations

As vats run, they send and receive messages. When these messages carry object references, the vat winds up with a set of "object imports" (things defined on other vats and imported here) and "object exports" (things defined here and exported to other vats). The vat startup process creates the "root object", which is exported immediately.

Each export represents an obligation. Other vats might send a message to the exported object, or they might send a message that references the exported object, and we must be prepared to handle it. So the primary job of the v2 vat code is to satisfy all the obligations incurred by v1. Another way to express this is that the kernel c-list, which maps kernel "krefs" to vat "vrefs" for each object, must be satisfied: every vref must be reassociated somehow, or marked as broken.

There are three basic categories of exports (cf. [A Taxonomy of Exo-making Functions](https://github.com/endojs/endo/blob/master/packages/exo/docs/exo-taxonomy.md#heap-vs-virtual-vs-durable)):

* Heap objects in vat RAM
  * one-off objects created with `Far()` or `makeExo()`
  * instances created with a "make" function from `defineExoClass()`
  * multifaceted kit instances created with a "makeKit" function from `defineExoClassKit()`

* Virtual objects in disk-based storage
  * instances created with a "make" function from `defineVirtualExoClass()`
  * multifaceted kit instances created with a "makeKit" function from `defineVirtualExoClassKit()`

* Durable objects in disk-based storage
  * instances created with a "make" function from `defineDurableExoClass()` or `prepareExoClass()`
  * multifaceted kit instances created with a "makeKit" function from `defineDurableExoClassKit()` or `prepareExoClassKit()`
  * singleton objects created with `prepareExo()`

During the upgrade phase, v2 code is obligated to re-define all durable Kinds created by v1 (i.e., those associated with objects in the third category) with the same facets and methods or a superset thereof. Once complete, this allows liveslots to satisfy deserialization of any inbound message addressed to (or referencing) a previously-exported durable object.

As a special case, the root object returned from v2's `buildRootObject()` is automatically associated with exportID `o+0` (see [How Liveslots Uses the Vatstore](../../swingset-liveslots/src/vatstore-usage.md#counters)) and is therefore also obligated to support the same methods as its predecessor. This means that the root object is effectively always durable, and should not be explicitly persisted.

To be precise, the root object *must* be an "ephemeral" object as documented in [swingset-liveslots](https://github.com/Agoric/agoric-sdk/blob/master/packages/swingset-liveslots/docs/liveslots.md#buildrootobject) (e.g. created with `Far` or `makeExo()`). It cannot be a virtual or durable object (created with a maker returned by `defineKind` or `defineDurableKind`, or the vat-data convenience wrappers like `prepareExo` or `prepareSingleton`). This ensures that the root object's identity is stable across upgrades.

### Zone API

The [zone API](https://github.com/Agoric/agoric-sdk/tree/master/packages/zone#readme) provides a unified model for creating the objects mentioned above, regardless of their backing storage:

  * singleton objects created with `zone.exo()`
  * instances created with a "make" function from `zone.exoClass()`
  * multifaceted kit instances created with a "makeKit" function from `zone.exoClassKit()`

You can obtain individual zones implementing this API as follows:
  * Heap objects in vat RAM
    - `import { heapZone } from '@agoric/zone';`
  * Virtual objects in disk-based storage
    - `import { virtualZone } from '@agoric/zone/virtual.js';`
  * Durable objects in disk-based storage
    - zone API maker found at `import { makeDurableZone } from '@agoric/zone/durable.js';` and
    - zone API backed by a durable map and created by `makeDurableZone(durableMap)`

## Durable State

The v2 code runs in a brand new JavaScript environment; nothing is carried over from the RAM image of the v1 vat. To fulfill its obligations, v1 must arrange to deliver data and imported object references to v2. This uses two mechanisms: durable storage, and the "baggage".

Vat code has access to three categories of collection objects, each of which offers both Map and Set collections in both strong and weak forms. The simplest category consists of "_heap_" collections provided by JavaScript as `Map`, `Set`, `WeakMap`, and `WeakSet`; their data is held only in RAM.
The second two categories are both referred to as "[Stores](../../swingset-liveslots/src/vatstore-usage.md#virtualdurable-collections-aka-stores)"; they are created by `makeScalarBigMapStore()`, `makeScalarBigWeakMapStore()`, `makeScalarBigSetStore()`, or `makeScalarBigWeakSetStore()`, and their contents are held in disk-based storage. What differentiates the second two categories from each other is use of the `durable` option: when it is false, the collection is "_[merely-]virtual_" and not preserved across upgrade, but when it is true, the collection is "_durable_" and **is** preserved. Durable collections can only hold durable objects.

The zone API exposes providers for these collections as `zone.mapStore(label)`,
`zone.setStore(label)`, `zone.weakMapStore(label)`, and
`zone.weakSetStore(label)`.  They only create a new collection if the `label`
entry in the zone has not been used before.  If you want to unconditionally
create a fresh, unnamed collection in the zone, you can use the providers
exposed under `zone.detached()`, such as `zone.detached().mapStore(label)`.

Heap and merely-virtual collections are _ephemeral_ and discarded during upgrade. More precisely, the v2 code has no way to reach anything but durable data, so even if the kernel did not delete the DB records, the v2 code could not ever read them.

The v2 code gets exactly one special object during the upgrade phase, currently known as "baggage". This is a durable Map (i.e., the kind of object returned from `makeScalarBigMapStore('label', { durable: true })`). All versions get access to the baggage: the v1 code should add data to it, so that the v2 code can read it back out. This provides the bridge between versions that allows v2 to assume responsibility for the obligations created by v1. It also provides a way for v1 to deliver authorities (in the form of imported object references) to v2, so v2 can talk to the world as if it were v1.

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

For durable objects, the v1 code must store the "durable kind handle" in durable storage. This is done automatically by `prepareExoClass()` and `prepareExoClassKit()`, but can also be done manually (see [Virtual and Durable Objects](./virtual-objects.md#virtual-and-durable-objects)).

```js
import { M } from '@agoric/store';
const FooI = M.interface('foo', fooMethodGuards);
// someDurableMap should generally be reachable from baggage.
const makeFoo = prepareExoClass(someDurableMap, 'foo', fooI, initFoo, fooMethods);
```

or with the zone API:

```js
import { M, makeDurableZone } from '@agoric/zone';
const FooI = M.interface('foo', fooMethodGuards);
// someDurableMap should generally be reachable from baggage.
const zone = makeDurableZone(someDurableMap);
const makeFoo = zone.exoClass('foo', fooI, initFoo, fooMethods);
```

The v1 code can also store imported objects (Presences) and plain data in a durable collection. Durable collections are themselves durable objects, so they can be nested:

```js
const parentMap = makeScalarBigMapStore(parentLabel, { durable: true });
baggage.init('parent', parentMap);
const childMap = makeScalarBigMapStore(childLabel, { durable: true });
parentMap.init('child', childMap);
```

or with the zone API:

```js
const parentMap = makeDurableZone(baggage).mapStore('parent');
const childMap = makeDurableZone(parentMap).mapStore('child');
```

The "baggage" is a special instance of `makeScalarBigMapStore`, with backing data is stored in a well-known per-vat location so each version can be given a reference. For every piece of data that v1 wrote into the baggage, v2 can read an equivalent item from the baggage it receives. However, any data associated with such items that v1 did _not_ write into baggage is lost -- v2 is a distinct process from v1, with its own independent heap and virtual memory.

While the baggage can use any suitable keys, at least one of the baggage keys should be a piece of plain data such as a string. The v2 vat starts out with nothing but baggage and a pile of source code, and source code can carry strings but not object references. So to allow v2 to get started, it must be able to do at least one `baggage.get('string')`. The value it retrieves from that initial call can be a durable object, which then might be usable as a second key. But without at least one plain-data key, v2 won't be able to extract anything from the baggage.

As v1 runs, it may need to add more data to the baggage, or remove stale data. The nested nature of the durable object storage graph means you can provide child objects to individual subsystems, to limit their authority:

```js
const fooData = makeScalarBigMapStore(fooLabel, { durable: true });
const barData = makeScalarBigMapStore(barLabel, { durable: true });
baggage.set('foo data', fooData);
baggage.set('bar data', barData);
initializeFoo(fooData);
initializeBar(barData);
```

or with the zone API:

```js
const zone = makeDurableZone(baggage);
const fooData = zone.mapStore('foo data');
const barData = zone.mapStore('bar data');
initializeFoo(fooData);
initializeBar(barData);
```

## From Outside: the AdminNode Upgrade API

An upgrade is triggered by invoking the `upgrade` method of the vat's "adminNode" control facet. This facet is returned when the vat is first created (along with the vat's root object), so the original creator is often the initiator of upgrades later. But a common pattern is to hand that control facet to some sort of governance object. The ability to upgrade a vat is also the ability to control its behavior, and any users who expect some particular vat behavior (e.g. when auditing some contract code) must take into account the possibility of upgrade, which means they'll care about who exactly can cause an upgrade to occur.

Upgrades use bundlecaps, just like the initial `createVat()` call. So the first step of an upgrade is to install the v2 source bundle (unless it is a "null upgrade" that re-uses the original bundle). This uses `controller.validateAndInstallBundle()` from the outside, and then `D(devices.bundle).getBundleCap()` from the inside. See [bundles.md](./bundles.md) for details.

Once the governance object is holding the v2 bundlecap, it triggers the upgrade with `E(adminNode).restartVat(newBundlecap, options)`. This schedules the upgrade sequence (described above), and returns a Promise that resolves when the upgrade is complete. If the upgrade fails, the Promise is rejected and the old vat is reinstalled. An upgrade might fail because the new source bundle has a syntax error (preventing evaluation), or because the upgrade phase throws an exception or returns a Promise that rejects. It will also fail if the ugprade phase does not fulfill all of its obligations, such as leaving a durable Kind unattached.

An important property of `options` is `vatParameters`. This value is passed to the upgrade phase (as the usual second argument to `buildRootObject()`) and can be used to communicate with the upgrade-time code before any external messages have a chance to be delivered. In the Zoe ZCF vat, this is how new contract code will be delivered, so it can be executed (and can assume responsibility for v1 obligations) to completion by the time the upgrade phase finishes.

## From Inside: V2 Executes the Upgrade

The v2 code wakes up inside the upgrade phase when `buildRootObject(vatPowers, vatParameters, baggage)` is called, where `vatParameters` will come from the call to `upgrade`. This `buildRootObject()` is expected to return an object, or a Promise that resolves to an object, and that object will assume the identity of the root object.

Before completion of `buildRootObject()` is indicated (either by returning a non-promise or by fulfilling a returned promise), the v2 code is obligated to redefine every Kind that was created by the v1 code. If any durable Kinds are defined incompletely or left undefined by the time of that indication, the upgrade fails and the vat is rolled back to v1.

```js
import { M } from '@agoric/store';
// fooMethodGuards and fooMethods must match or be a superset of their v1 analogs.
const FooI = M.interface('foo', fooMethodGuards);
// someDurableMap is `baggage` or was retrieved from it.
const makeFoo = prepareExoClass(someDurableMap, 'foo', fooI, initFoo, fooMethods);
```

When `buildRootObject()` finishes and the upgrade phase completes successfully, the kernel will reject all Promises that v1 had exported (specifically all promises for which v1 was the "decider"). It will abandon any non-durable exports made by v1, and external vats which imported those objects will find themselves holding a broken reference (i.e. every message sent to it will be rejected with an Error, just as if they were exported by a vat which was then terminated).

If the v2 code experiences an error during the upgrade phase, the entire upgrade is aborted and the v1 code is reinstated. The caller of `E(adminNode).restartVat()` will observe their result promise get rejected.
