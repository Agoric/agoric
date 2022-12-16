# A Taxonomy of Stores

Some dimensions on which our Stores differ. For each of these dimensions, in the headings below we indicate the dominant default choice with an asterisk (\*). A given Store maker should document which non-default points in this design space it supports. For example, the `makeScalarMapStore` function makes stores that are Strong and Ephemeral and have Scalar keys. The name is explicit only about the dimensions in which it differs from the defaults.

All stores are Far objects (a kind of remotable) that may be snapshotted to (or restored from) a corresponding pass-by-copy objects. MapStores snapshot into CopyMaps. SetStores snapshot into CopySets.

# API Differences

## SetStores vs MapStores

- SetStores store only keys (of type Key), where each key is key-unique, i.e., it is not keyEQ to any other key in the set.
- MapStores store key value associations, where the keys are key-unique Keys, as with sets, and the associated values are Passable.

## Weak vs Strong\*

- A weak store does not enable its contents to be iterated. Only with the key of a given entry will a weak store reveal anything about the entry. This sometimes enables gc of entries that the collector knows can never be mentioned. But, unlike JavaScript WeakSets and WeakMaps, a weak store _may_ allow other values as keys, such as numbers, that can be synthesized at will. Entries indexed by such synthesizable keys can never be collected.
- A strong store does enable iteration of its contents, and so must retain those contents as long as the strong store itself exists.

Methods on stores can be grouped into four categories:

- lookup -- `has`, `get`
- update -- `init`, `set`, `add`, `delete`, `addAll`
- query -- `keys`, `values`, `entries`, `getSize`
- query-update -- `clear`

Both strong and weak stores have lookup and update methods, whereas only strong stores have query and query-update methods. The latter are denied to weak stores since the operations entail iterability.

# Storage and Representation Differences

## Scalar Keys Only vs Composite Keys Allowed\*

- Scalars are primitives or remotables, those keys that can be compared without looking inside objects. This directly reflects the semantics of JavaScript's Maps and Sets, which only index by scalar keys.
- Composite keys are things like copyArrays, copyRecords, copySets, or copyMaps, that compare by structural key equality.

## Long\* vs Short Expected Lifetime (WeakStores only)

The expected lifetime of a weak store helps us optimize its representation.

- If we expect a weak store to outlive most of its keys, we may internally use a JavaScript WeakMap.
- If we expect the keys in a weak store to outlive the store, we may internally use a JavaScript Map, to avoid the costs often associated indexing a key for JavaScript WeakMaps that are no longer alive. Though keep in mind that this representation denies the garbage collector the opportunity to collect those keys while these expected-to-be-short-lived stores are still alive.

## Heap\* vs Virtual

- Like JavaScript Maps and Sets, heap stores live in the JavaScript language heap, limited by the size of heap memory and occupying room in vat snapshots.
- Virtual collections potentially live outside the heap (i.e., on disk). A virtual store serializes (marshals) its contents to store it, and unserializes (unmarshals) its contents to retrieve it. Virtual objects (a kind of far object) that are accessible _only_ from virtual stores can completely disappear from the heap, to be restored if any serialized reference to it is restored. A virtual store is itself a virtual object.

## Ephemeral\* vs Durable (Heap is always Ephemeral)

Stores only exist in one vat at a time, giving us free transactional integrity. All heap stores are ephemeral. Virtual stores can be ephemeral or durable. Ephemeral and durable virtual stores are collectively referred to as "big", since they are able to grow to a large number of elements -- "Big" is an ergonomically friendlier alternative to "Virtual" in the names of the associated maker functions.

- Ephemeral stores only exist in the vat that initially created them, dying when that vat dies. The content of virtual ephemeral stores can include references to ephemeral non-virtual remotables or promises.
- A durable store can be part of a vat's "estate", to be transferred to that vat's heir/successor on the death of its current vat. A durable store can only contain keys and values that are still meaningful across such traumas, such as

  - durable objects (a kind of virtual object)
  - Remotes, a kind of remotable designating a far object in another vat
  - Promises, perhaps. These are tempting because they can be restored into a well-defined severed state, the rejected promise.

  A durable store may not store a reference to a local non-durable far object. A durable store is itself a durable object.
