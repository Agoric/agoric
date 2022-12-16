# Persistence

The ocap community has explored a variety of persistence mechanisms, each with a variety of benefits and limitations.

E (and arguably SmallTalk) provided "orthogonal persistence", in which programmers could pretend their objects lived forever. The runtime engine was responsible for finding a way to serialize those objects such that the hosting process could be shut down and resumed later from disk without the Vat code being aware of the interruption. Live references were severed upon resumption, but was indistinguishable from a network problem (it was as if the TCP connection got severed for some reason), which _was_ observable to Vat code (`reactToLostClient` in one direction, a broken Promise in the other), which was expected to restart from a `SturdyRef`.

In Javascript, this requires support from the JS engine, as regular code has no way to follow closed-over values, or serialize non-function code objects such as closures and Promises. One approach (explored in NodeKen) is to have an engine like V8 store all its heap state in a memory-mapped file. This file can then be preserved after the engine shuts down, and used again when it starts back up in the future. A similar approach would be compile a smaller engine like XS into WASM, and then preserve the linear memory space of the WASM instance. By drawing the boundary of the JS engine carefully, the various "exits" from the JS object graph can be re-attached upon resumption.

Without orthogonal persistence, programmers must be more aware of their data model. In fact, they must be aware of for a second reason: upgrade, which must replace the code while retaining the data. Migration of a Vat from one host to another looks a lot like upgrade. We presume that Promises (and iterators and other conveniences) cannot survive an upgrade or migration, so programmers must think far enough ahead to enable occasional mode switches. Programs can use these tools "most of the time", but there must be a way to tell the program to prepare for suspension, at which point it discards the unserializable objects and writes all state out as a well-schematized data. It could either terminate in-flight operations with an error, or wait for these operations to complete naturally before triggering the suspend.

## Checkpoint + Transcript

In the absence of an engine-supported checkpoint (or to handle non-serializable data), we can instead record a transcript of inbound messages, and rely upon the Vat's deterministic operation to get back to the same state without actually recording that state. If it weren't for the unbounded growth of this transcript, and the O(N) cost of re-executing it on restart, (and the fact that it doesn't help us with migration very much), we could use it in lieu of checkpoint support.

One compromise is to use a checkpoint if/when available, and then a partial transcript on the operations that have occurred since that checkpoint. We can treat the checkpoint as a performance optimization that allows us to truncate the transcript. If we get checkpoint support but it only works when the Vat has discarded all non-serializable objects (and has an empty Promise queue, as is the state at the end of each kernel turn), then we can use the transcript to record the state since the last suspend operation (which is defined by having no non-serializable objects at the end of a turn, and which might need to be explicitly triggered). If the suspend operation also stores data into a well-defined schema, then a migration operation can use that data as a starting point.

This leads to each Vat being defined by the following data:

- root object (i.e. the code evaluated in `setup()` at Vat initialization time) (fuzzy)
  (we do not store the root object; changing it constitutes migration)
- the most recent checkpoint (empty at init, possibly still empty)
- the transcript of delivered messages since the last checkpoint
- the return values of each syscall made by the Vat

Each invocation of the Vat's `dispatch` function can make zero or more syscalls. We must record at least the return values of these syscalls, as they influence the vat's behavior just as much as the messages we've delivered.

To ensure the Vat's behavior is consistent across restores, we also track the full contents (name and arguments) of each syscall, and we insist that each `dispatch` leads to the same set of syscalls. In the future, we could make the transcript smaller by simply hashing the syscalls, and only comparing the final hash root. When we take a checkpoint, we can fold the checkpoint data into the hash, and clear the transcript.

When we want to restore a Vat, we start by unpacking the checkpoint and instantiating the root object. We then deliver the first message from the transcript. For every syscall this triggers, we compare it against the transcript and provide the correct return value, but we do not actually deliver the syscalls into the kernel (because the kernel's state was already restored independently of the Vat state, and we don't want the syscalls to be executed twice). We repeat this process until the transcript is empty. If at any point the syscall transcript does not match, then we know the restored Vat did not behave the same as the stored one, and we abort.

## Kernel State

The SwingSet kernel contains some number of Vats and the tables that connect them together. The kernel state contains:

- the state of each Vat
- the runQueue: a list of pending `dispatch` calls to make to each Vat. The main ones are `deliver` calls (which correspond to method invocations on some target object), which include the target VatID, the facet ID, the arguments, and the answer ResponseID. Other ones include notifyFulfillToData, notifyFulfillToTarget, and notifyReject.
- the import table: a list of which Vats have access to which exports of the other Vats, or to kernel-side Promises
- the promise table: a list of which kernel-side Promises are defined, their current state (unresolved, fulfilled/rejected in various ways), the "decider" Vat for unresolved ones, and the list of Vats currently subscribed to head about state changes

To restore an entire kernel, we must:

- restore the promise, import, and run-queue tables
- for each Vat:
  - restore the Vat's checkpoint and transcript
  - configure a syscall object to check the syscalls without actually executing them
  - create the Vat (with the current version of the root object)
  - execute the Vat's setup() function with the check-only syscall
  - replay the transcript, checking syscalls as we go
  - reconfigure the syscall object to record and execute

Now the kernel should be back in the same state it had before. Every entry in the kernel's import/promise tables should match a Presence or Promise inside the corresponding Vat.

We can execute each Vat's transcript independently: the Vat's state will not depend upon what's happening in the other Vats, and the kernel's state won't depend upon what happens in this particular Vat (since we ignore syscalls during the replay, and check to make sure it emits the same syscalls that _were_ executed last time).

Since syscalls can return values (e.g. a `send` returns a PromiseID for the answer), our Vat transcript must record these, so the same values can be returned during playback mode.

## Schematized Data (TODO)

To enable experimentation with other persistence mechanisms, the kernel provides a `state` object to each vat userspace. If the vat invokes `state.activate()`, checkpoints and transcripts are turned off, and the kernel assumes the vat relies solely upon the contents of the state object.

Initially, the `state` object will have a single get/set(string) pair of methods. Later, as it gets more sophisticated, it will support a Merkle tree (of arbitrary arity) in which each child edge is named (or numbered) and either points to another node or a string (of JSON) (see IPFS for details). These nodes will provide an API with `has_child(index)`, `get_or_create_child_node(index)`, `delete_child(index)`, `set_child_data(index, data)`, `get_child_data(index)`. The vat gets access to a per-vat root node. By keeping track of which edges are followed by the vat, the kernel learns which data affects the computation, so it can construct an efficient proof for validators (i.e. the contents of every node that was visited, since the nodes contain the hashes of all their children (nodes or data). The only way to modify the tree is through the various set/delete APIs, so the kernel also learns which subset of the new tree data must be included in the proof.

In this mode, Vat userspace is responsible for only depending upon state that comes from this persistence object, and for updating the persistence object with all state changes.

## ORM-Style Schemas

Many programs are effectively managing access to a database. For example, ERTP "Mints" manage a table of Purses, each of which has some balance. The owners of a Purse can transfer this balance into other Purses.

In a conventional identity-based system, each Purse might have a list of owner IDs. A `withdraw` method would be gated on an identity check. Any owner of a Purse might be able to grant access to additional owners, or there could be some central administrator who alone has this power. The data structure which supports this could be a table mapping PurseID to balance and a list of OwnerIDs.

In the ocap style, access to a Purse is managed by access to a Purse object. Anyone who has a reference can freely give it to anyone else, without identities or an administrator. The typical data structure for this is a Map or WeakMap from Purse object to balance.

Persisting the Purse object may be annoying, especially when the _balance_ is what we actually care about, and the methods on it are just a convenience. Another approach would be to persist zero-method object references, and provide a collection of unbound/static _functions_ (not methods) that accept these references.

This may result in an "ORM"-style (Object-relational mapping) approach, where the programmer is obligated to describe a schema for their data that can be used to construct objects for each row of the serialized state. The functions are invoked with these objects, and any state changes are made by telling the objects what their new data ought to be. In this approach, clients have closely-held access to a row of the table, and can pass this object into functions, but the server is not obligated to serialize general-purpose data (nor closures, promises, and other difficult-to-serialize things). The pre-specified schema also makes upgrade much easier, as all data is in a well-organized shape at all times.

It might also be possible to take a program written in the ocap/Map style, and automatically translate it into a schema and an ORM-style program. This would allow programmers to defer thinking about their schema until it comes time to do an upgrade, but at that point at least the information exists. The upgrader code would need to deal directly with the schema: it could not be written in quite the same style as the original Map-based code.
