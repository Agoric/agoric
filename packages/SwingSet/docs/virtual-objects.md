# TODO (update to include new stores stuff)

# Vat Secondary Storage

The kernel currently provides two secondary storage mechanisms for the use of (application) code running in a vat:

- Virtual and durable objects
- Persistent stores

These are accessed via properties of the `VatData` global made available to vat code, or more stylishly by importing from [@agoric/vat-data](../../vat-data) (that's a working placeholder module which we will be replacing it with a more ergonomic package name once we figure out what that should be).

The APIs described here all have to do with storing data on disk.  However, you should understand an important distinction made in these APIs between the labels "virtual" and "durable".  In our usage here, things that are "virtual" will automatically swap their state to disk storage and thus don't eat up RAM space in the running vat process even if they grow large in number.  In contrast, things that are "durable" are not only stored on disk but survive the lifetime of the vat process holding them and may be retrieved later in a future version of the vat.

## Virtual and Durable Objects

A virtual or durable object (which we'll abbreviate VDO to save breath) is an object whose state is automatically and transparently backed up in secondary storage.  This means that when a given VDO is not in active use, it need not occupy any memory within the executing vat.  Thus a vat can manage an arbitrarily large number of such objects without concern about running out of memory.

A VDO has a "kind", which defines what sort of behavior and state it will possess.  A kind is not exactly a data type, since it comes with a concrete implementation, but it indicates a family of objects that share a set of common behaviors and a common state template.

A vat can define new kinds of VDOs by calling one of the `defineKind` functions:

  `maker = defineKind(descriptionTag, init, behavior, options)`
or
  `maker = defineKindMulti(descriptionTag, init, facets, options)`
or
  `maker = defineDurableKind(kindHandle, init, behavior, options)`
or
  `maker = defineDurableKindMulti(kindHandle, init, facets, options)`

The return value from any of these is a maker function which the vat can use to create instances of the newly defined VDO kind.

The `descriptionTag` parameter is a short description string for the kind.  This is the same kind of tag string you would use in a call to `Far`.  It will appear on `.toString()` representations of corresponding `Presence` objects that are exported to remote vats.  Note that this string should only be used for diagnostics and debugging, as it is not safe from substitution by adversarial intermediaries.

A `kindHandle` is a type of durable object that can be used to identify the kind in a later incarnation of the vat.  The usage of a kind handle rather than a simple tag string is the main thing that distinguished the durable from the non-durable kind definition functions.  You obtain a kind handle for use in `defineDurableKind` by calling

  `kindHandle = makeKindHandle(descriptionTag)`

where `descriptionTag` is exactly the same as the same named parameter of `defineKind`.  The difference is that a kind handle is itself a durable object that may be stored for later retrieval, and used in a future call to `defineDurableKind` or `defineDurableKindMulti` to associate new behavior with the kind in question.

The `init` parameter is a function that will be called when new instances are first created. It is expected to return a simple JavaScript object that represents the initialized state for the new VDO instance.  Any parameters passed to the maker function returned by `defineKind`/`defineDurableKind` are passed directly to the `init` function.

The single-faceted VDO definition functions, `defineKind` and `defineDurableKind`, take a `behavior` parameter.  This is an object whose named properties are all functions that will become methods of the virtual objects returned by the maker function.  The behavior object can be empty; in such a case the resulting VDO can serve as a powerless but unforgeable "marker" handle.

The multi-faceted VDO definition functions, `defineKindMulti` and `defineDurableKindMulti`, take a `facets` parameter.  This is an object whose named properties are descriptors as would be passed to the `behavior` parameter described in the previous paragraph.  These will become facets of new instances of the VDO.  The return value from the maker function will be an object mapping to the facets by name.

In either the single- or multi-faceted case, the individual behavior functions must have the signature:

  `methodname(context, ...args) { ...`

where `context` describes the invocation context of the method and `...args` are whatever arguments were passed to the method when it was invoked.  In the case of a single facet VDO, `context` will take the form `{ state, self }`, where `state` is the VDO state and `self` is a reference to the VDO itself.  In the case of a multi-facet VDO, `context` will instead be `{ state, facets }`, where `facets` is an object whose named properties are the facets of the VDO.

## Kind Options

The (optional) `options` parameter provides additional parameters to characterize the VDO.  Currently there are four options, although more may be added in the future:

* `finish`: a function to run after object initialization
* `stateShape`: a constraint on `state` data
* `interfaceGuard`: a constraint on the method definitions
* `thisfulMethods`: changes the invocation signature to support class/`this`-like usage

### `finish` option

The `finish` option is a function that, if present, will be called at the end of
instance initialization.  It will be invoked after the VDO is created but before
it is returned from the maker function.  `finish` is passed one parameter, a
`context` object identical to that passed to method behaviors.  The `finish`
function can modify the object's state at a time when the object's identity is
known (or its facets' identies are known), and thus can be used in cases where a
validly initialized instance requires it to participate in some kind of cyclical
object graph with other VDOs.  It can also be used, for example, to register the
object with outside tracking data structures, or do whatever other post-creation
setup is needed for the object to do its job.

For example:

```javascript
  const counterRegistry = makeScalarBigMapStore('counters');

  const initCounter = (name) => ({ counter: 0, name });

  const counterBehavior = {
    inc: ({state}) => {
      state.counter += 1;
    },
    dec: ({state}) => {
      state.counter -= 1;
    },
    setCount: ({state}, count) => {
      state.counter = count;
    },
    getCount: ({state}) => state.counter,
    getName: ({state}) => state.name,
  };

  const finishCounter = ({ state, self }) => {
    counterRegistry.init(state.name, self);
  };

  const makeCounter = defineKind('counter', initCounter, counterBehavior, { finish: finishCounter });
```

This defines a simple virtual counter object with two properties in its state: a count and a name.  Note that none of the methods bother to read `self` from the context parameter because none of them need to refer to it.  You'd use it like this:

```javascript
  const fooCounter = makeCounter('foo');
  const barCounter = makeCounter('bar');

  fooCounter.inc();
  fooCounter.inc();
  counterRegistry.get('bar').setCount(1);
  barCounter.inc();
  console.log(`${fooCounter.getName()} count is ${fooCounter.getCount()`); // "foo count is 2"
  console.log(`${barCounter.getName()} count is ${barCounter.getCount()`); // "bar count is 2"
```

### `stateShape` option

By default, the `state` of each VDO instance can be any serializable record: an object with string property names and arbitrary values (of course durable objects can only hold durable state). Whatever the `initialize` function returns is used as the state of that one object. The property names are then fixed for the lifetime of that object (although see below about upgrade). Behavior methods can change the values of each property, but cannot add new properties, or remove the existing ones.

By default, each instance can have a different "shape": different property names, and the values can have different types. For example, while it's not recommended (behavior methods would need to adapt), `initialize` is within its rights to do the following:

```js
const initialize = (arg1, arg2) => {
  if (arg1 === 'foo') {
    return { foo: arg2 };
  }
  return { count: 0, bar: arg2 };
}
```

To prevent accidental variation in the shape of the generated `state` object, as well as to provide some amount of documentation, the `stateShape` option can be used to establish a [Pattern](https://github.com/endojs/endo/tree/master/packages/patterns) that will be imposed upon both the return value of `initialize`, and upon any changes made to `state` by behavior methods.

```js
import { M } from '@endo/patterns';

const counterPattern = { counter: M.number(), name: M.string() };
const initCounter = ..;
const counterBehavior = ..;
const makeCounter = defineKind('counter', initCounter, counterBehavior,
                               { stateShape: counterPattern });
```

In the future, the `stateShape` option may enable a space-saving optimization: the state data can be "compressed" by only recording the variable portions. In our example, instead of each instance recording a full record (with its own copy of the `counter:` and `name:` property strings), it could be recorded as a simple array (`[1, 'name']`). For high-cardinality objects, with complex/nested state instances, this could save a significant amount of disk space.

### `interfaceGuard` option

The `interfaceGuard` option provides a data structure which constrains the methods and arguments of the behavior record. In particular, it can enforce runtime type checks on the incoming arguments, before the behavior methods are invoked. This both serves as a form of documentation for callers, and can replace some internal argument validation which would otherwise live at the beginning of each behavior method.


### `thisfulMethods` option

VDO methods receive a "context" object: either `{ state, self }` or `{ state, facets }` (for multi-facet objects). By default, this is injected as the first argument of the behavior method invocation, e.g. `setCount({ state, self }, count)`. Behavior methods must be written to anticipate the context in this position. An invocation like `counter.setCount(count)` is received by code like:

```js
    setCount: ({state}, count) => {
      state.counter = count;
    },
```

If `options.thisfulMethods = true`, the context is delivered through the JavaScript `this` variable, instead of being added to the method arguments. As a result, the received method arguments are exactly the same as the invocation. `counter.setCount(count)` would be received by code like:

```js
    setCount: (count) => {
      const { state } = this;
      state.counter = count;
    },
```

This is more convenient for class-like VDO definitions, and is used extensively by the vat-data "Exo" tools defined elsewhere.


## Multiple Facets

Suppose you wanted to change our `makeCounter` example create independent facets for the increment and decrement capabilities. The `defineKindMulti` function is used to define a single Kind with multiple facets (independent objects which share the same state). A simplified version of the above (without the name property, counter registry, and `setCount` method) might look like:

```javascript
  const initFacetedCounter = () => ({ counter: 0 });

  const getCount = ({state}) => state.counter,

  const facetedCounterBehavior = {
    incr: {
      step: ({ state }) => {
        state.counter += 1;
      },
      getCount,
    },
    decr: {
      step: ({ state }) => {
        state.counter -= 1;
      },
      getCount,
    },
  };

  const makeFacetedCounter = defineKindMulti('counter', initFacetedCounter, facetedCounterBehavior);
```

Note how the `getCount` method is declared once and then used in two different facets.

If you wanted to also make this durable, instead of the last line you'd generate the kind with something more like:

```javascript
  const facetedCounterKind = makeKindHandle('durable counter');
  const makeFacetedCounter = defineDurableKindMulti(facetedCounterKind, initCounter, facetedCounterBehavior);
```

In either case you'd use it like:

```javascript
  const { incr, decr } = makeFacetedCounter('foo');

  incr.step();
  incr.step();
  console.log(`count is ${decr.getCount()`); // "count is 2"
  decr.step();
  console.log(`count is ${incr.getCount()`); // "count is 1"
```

## Additional Details

- The set of state properties is completely determined by the named enumerable properties of the object that `init` returns.  State properties cannot thereafter be added or removed from the instance.  Currently there is no requirement that all instances of a given kind have the same set of properties, but code authors should not rely on this as such enforcement may be added in the future (and `options.stateShape` provides a way to opt-in to such enforcement.

- The values a state property may take are limited to things that are serializable and which may be hardened (and, in fact, _are_ hardened and serialized the moment they are assigned).  You can replace the value of a state property, but you cannot mutate it.  In other words, you can do things like:

  `state.zot = [...state.zot, 'last'];`

  but you can't do things like:

  `state.zot.push('last');`

- A VDO can be passed as a parameter in messages to other vats.  It will be passed by presence, just like any other non-data object you might send in a message parameter.

- A VDO's state may include references to other VDOs. The latter objects will be persisted separately and only deserialized as needed, so "swapping in" a VDO that references other VDOs does not entail swapping in the entire associated object graph.

## Upgrading Durable Object State and StateShape

(Summary: objects hold a hidden `version` number, Kind definitions can supply a `currentVersion` number and an `upgradeState` function, object state is upgraded lazily upon behavior invocation).

The total lifetime of each vat is broken up into multiple "incarnations"; a new is created each time the vat is upgraded. Durable objects and collections are the only form of data which survive this transition: virtual objects and ephemeral Remotables are abandoned, all exported promises are rejected, and the entire JS engine state is erased.

The new incarnation can (and is required) to provide new behavior for every durable Kind that was present in the previous version. This new behavior can be different than the previous version (which in fact is usually the main reason for the upgrade): it might add new methods, or change the code of an existing method. Authors are responsible for providing backwards compatibility to clients, so it is better to add methods, add new positional arguments, or add new options to an option bag argument, than to remove methods or remove arguments.

If the new Kind definition wants to store different data than previous versions, it is free to do so, however we must address both the `stateShape` constraint (if supplied), and provide a way to safely handle `state` records created by previous versions.

To support this, the four `defineKind` functions accept `currentVersion` and `upgradeState` options. These do not need to be supplied in the initial Kind definition call, nor in any subsequent version that uses the same `state` data. However, the first time a different `stateShape` is needed, or when the `state` contents need to be migrated/updated in any way, that version's `defineKind` call must supply both options. Every subsequent version must do the same.

`currentVersion` is an integer, which defaults to 0. Each `state` record is recorded with this version. If the first incarnation of a vat omits `currentVersion` and creates object A and B, then the second incarnation provides `currentVersion: 1` and creates objects C and D, then the durable-object database will remember:

* A: `version: 0`
* B: `version: 0`
* C: `version: 1`
* D: `version: 1`

and these version annotations will remain in place until the object is upgraded or deleted.

`upgradeState` is a synchronous function which takes `(oldVersion, oldState)` and is responsible for returning the new state. Every time an old record is accessed (i.e. when a behavior method is invoked, to supply it with `context.state`), if the record's version does not match `currentVersion`, the upgrade function is called. The new `state` is immediately stored back into the DB, with the new version number (so the migration only happens once per record).

The actual return value of `upgradeState` is `{ version, state }`. The upgrade process asserts that the returned `version` is equal to `currentVersion`, to catch mistakes where the upgrade function skips a step or has not been updated to match the Kind definition.

`upgradeState` must be prepared to handle data from any historical version. To avoid gaps, authors are encouraged to use a pattern which retains every single-step delta, like this:

```js
function upgradeState(version, oldState) {
  let state = { ...oldState }; // shallowly-mutable copy
  // add comment here describing initial schema
  if (version === 0) {
    state.newThing = INITIAL_VALUE;
    version = 1;
  }
  // add comment here describing schema for version 1
  if (version === 1) {
    state.thing = state.thing + 1; // e.g. change from 1-indexed to 0-indexed
    version = 2;
  }
  // add comment here describing schema for version 2
  // in the future: add a new clause here for each new version

  return { version, state };
}
```

(TODO: consider making `oldState` a shallow-mutable object, instead of a fully hardened object, to make it easier to add/remove top-level properties. However it wouldn't help with deeper mutations. Naming it `state` might make it look like it could be modified in-place, and I think it's better to require it as a return value.)

The current version's `stateShape` constraint is enforced upon the return value from any calls to `upgradeState` during that incarnation, in addition to `initialize` state (for new objects) and the state that results when behavior methods mutate their `state`.

Old objects (where `obj.version !== currentVersion`) were constrained by the *old* `stateShape` that was active in the incarnation which last modified them, but are not affected by the current `stateShape`. This is not observable by user code, however, because objects are upgraded before the current behavior code can see them.

State upgrades are performed lazily: no record is touched until absolutely necessary. However they are upgraded transparently and reliably: Kind behavior methods in version 2 will only ever see `state` objects with the matching version. If the `upgradeState` function throws an Error, the original `state` record (and `version` annotation) is left alone, the behavior method is never invoked, and the caller receives an error.

This lazy upgrade policy means the performance impact of upgrade should be minimal. However if user code were to iterate over a large number of durable objects (invoking a method on every one), this would trigger an upgrade of them all. Such iteration is discouraged, as it increases the memory footprint of the enclosing crank.

The `currentVersion` integer should be monotonically incremented in each new incarnation which needs to change the contents of `state` records. This will definitely happen if the `stateShape` changes in a way that would reject old states, but even the most tightly-fitting `stateShape` cannot express semantic constraints on how the data is used.  For example, suppose `state.tokens` in the first version was used to count milli-BLD tokens (so `state.tokens: 1_000` means 1.0 BLD). But later, we realize that more resolution is required, so the field is revised to store micro-BLD (so 1.0 BLD means `state.tokens: 1_000_000`). The upgrade function must do `state.tokens *= 1_000`, even though the `stateShape` does not change. (Note: while this may let the code do the right thing, humans reading the code and the historical state are likely to get confused, so the safest approach is to change the *name* of the field at the same time you change its semantics).


## (TODO) Virtual Collections
