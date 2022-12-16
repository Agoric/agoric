# TODO (update to include new stores stuff)

# Vat Secondary Storage

The kernel currently provides two secondary storage mechanisms for the use of (application) code running in a vat:

- Virtual and durable objects
- Persistent stores

These are accessed via properties of the `VatData` global made available to vat code, or more stylishly by importing from `@agoric/vat-data` (that's a working placeholder module which we will be replacing it with a more ergonomic package name once we figure out what that should be).

The APIs described here all have to do with storing data on disk. However, you should understand an important distinction made in these APIs between the labels "virtual" and "durable". In our usage here, things that are "virtual" will automatically swap their state to disk storage and thus don't eat up RAM space in the running vat process even if they grow large in number. In contrast, things that are "durable" are not only stored on disk but survive the lifetime of the vat process holding them and may be retrieved later in a future version of the vat.

## Virtual and Durable Objects

A virtual or durable object (which we'll abbreviate VDO to save breath) is an object whose state is automatically and transparently backed up in secondary storage. This means that when a given VDO is not in active use, it need not occupy any memory within the executing vat. Thus a vat can manage an arbitrarily large number of such objects without concern about running out of memory.

A VDO has a "kind", which defines what sort of behavior and state it will possess. A kind is not exactly a data type, since it comes with a concrete implementation, but it indicates a family of objects that share a set of common behaviors and a common state template.

A vat can define new kinds of VDOs by calling one of the `defineKind` functions:

`maker = defineKind(descriptionTag, init, behavior, options)`
or
`maker = defineKindMulti(descriptionTag, init, facets, options)`
or
`maker = defineDurableKind(kindHandle, init, behavior, options)`
or
`maker = defineDurableKindMulti(kindHandle, init, facets, options)`

The return value from any of these is a maker function which the vat can use to create instances of the newly defined VDO kind.

The `descriptionTag` parameter is a short description string for the kind. This is the same kind of tag string you would use in a call to `Far`. It will appear on `.toString()` representations of corresponding `Presence` objects that are exported to remote vats. Note that this string should only be used for diagnostics and debugging, as it is not safe from substitution by adversarial intermediaries.

A `kindHandle` is a type of durable object that can be used to identify the kind in a later incarnation of the vat. The usage of a kind handle rather than a simple tag string is the main thing that distinguished the durable from the non-durable kind definition functions. You obtain a kind handle for use in `defineDurableKind` by calling

`kindHandle = makeKindHandle(descriptionTag)`

where `descriptionTag` is exactly the same as the same named parameter of `defineKind`. The difference is that a kind handle is itself a durable object that may be stored for later retrieval, and used in a future call to `defineDurableKind` or `defineDurableKindMulti` to associate new behavior with the kind in question.

The `init` parameter is a function that will be called when new instances are first created. It is expected to return a simple JavaScript object that represents the initialized state for the new VDO instance. Any parameters passed to the maker function returned by `defineKind`/`defineDurableKind` are passed directly to the `init` function.

The single-faceted VDO definition functions, `defineKind` and `defineDurableKind`, take a `behavior` parameter. This is an object whose named properties are all functions that will become methods of the virtual objects returned by the maker function. The behavior object can be empty; in such a case the resulting VDO can serve as a powerless but unforgeable "marker" handle.

The multi-faceted VDO definition functions, `defineKindMulti` and `defineDurableKindMulti`, take a `facets` parameter. This is an object whose named properties are descriptors as would be passed to the `behavior` parameter described in the previous paragraph. These will become facets of new instances of the VDO. The return value from the maker function will be an object mapping to the facets by name.

In either the single- or multi-faceted case, the individual behavior functions must have the signature:

`methodname(context, ...args) { ...`

where `context` describes the invocation context of the method and `...args` are whatever arguments were passed to the method when it was invoked. In the case of a single facet VDO, `context` will take the form `{ state, self }`, where `state` is the VDO state and `self` is a reference to the VDO itself. In the case of a multi-facet VDO, `context` will instead be `{ state, facets }`, where `facets` is an object whose named properties are the facets of the VDO.

The `options` parameter is optional. It provides additional parameters to characterize the VDO. Currently there is only one supported option, `finish`, though we anticipate more options may be added in future versions of the API.

The `finish` option is a function that, if present, will be called at the end of
instance initialization. It will be invoked after the VDO is created but before
it is returned from the maker function. `finish` is passed one parameter, a
`context` object identical to that passed to method behaviors. The `finish`
function can modify the object's state at a time when the object's identity is
known (or its facets' identies are known), and thus can be used in cases where a
validly initialized instance requires it to participate in some kind of cyclical
object graph with other VDOs. It can also be used, for example, to register the
object with outside tracking data structures, or do whatever other post-creation
setup is needed for the object to do its job.

For example:

```javascript
const counterRegistry = makeScalarBigMapStore('counters');

const initCounter = name => ({ counter: 0, name });

const counterBehavior = {
  inc: ({ state }) => {
    state.counter += 1;
  },
  dec: ({ state }) => {
    state.counter -= 1;
  },
  setCount: ({ state }, count) => {
    state.counter = count;
  },
  getCount: ({ state }) => state.counter,
  getName: ({ state }) => state.name,
};

const finishCounter = ({ state, self }) => {
  counterRegistry.init(state.name, self);
};

const makeCounter = defineKind('counter', initCounter, counterBehavior, {
  finish: finishCounter,
});
```

This defines a simple virtual counter object with two properties in its state: a count and a name. Note that none of the methods bother to read `self` from the context parameter because none of them need to refer to it. You'd use it like this:

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

Suppose you instead wanted to provide a version with the increment and decrement capabilities made available as independent facets. A simplified version of the above (without the name property, counter registry, and `setCount` method) might look like:

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
const makeFacetedCounter = defineDurableKindMulti(
  facetedCounterKind,
  initCounter,
  facetedCounterBehavior,
);
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

Additional important details:

- The set of state properties is completely determined by the named enumerable properties of the object that `init` returns. State properties cannot thereafter be added or removed from the instance. Currently there is no requirement that all instances of a given kind have the same set of properties, but code authors should not rely on this as such enforcement may be added in the future.

- The values a state property may take are limited to things that are serializable and which may be hardened (and, in fact, _are_ hardened and serialized the moment they are assigned). You can replace the value of a state property, but you cannot mutate it. In other words, you can do things like:

  `state.zot = [...state.zot, 'last'];`

  but you can't do things like:

  `state.zot.push('last');`

- A VDO can be passed as a parameter in messages to other vats. It will be passed by presence, just like any other non-data object you might send in a message parameter.

- A VDO's state may include references to other VDOs. The latter objects will be persisted separately and only deserialized as needed, so "swapping in" a VDO that references other VDOs does not entail swapping in the entire associated object graph.
