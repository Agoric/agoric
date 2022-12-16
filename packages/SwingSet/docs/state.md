# SwingSet State Management

The state of a SwingSet environment consists of several pieces:

- the kernel-wide Object and Promise tables
- the kernel's run-queue
- each Vat's c-list entries
- the persistent state of each Vat's runtime code

The first three items are just tables of data: mappings from strings to other
strings, or lists of easily-serialized records.

The Vat runtime state, however, is more complicated. Most of our Vats use
"orthogonal persistence", because of which Vat code can carelessly pretend to
be immortal: it will never observe the passing of time, or cycles of being
saved to disk and being restored after a host reboot. The simplest (albeit
most expensive) approach is to record the initial code evaluated to create
the vat (which doesn't change) and a complete transcript of all the vat's
interactions with the kernel (which grows constantly).

A more sophisticated approach is to enhance the Javascript engine to provide
a snapshot of the Vat's heap, and record this checkpoint on a periodic basis.
We assume the snapshot operation is fairly expensive, so we don't create one
after every turn. Instead, we accumulate shorter transcripts between
snapshots. So we might grow a transcript to 100 messages before recording a
snapshot and truncating the transcript.

The transcript is just a list of message deliveries, which is just data, so
its contents can be recorded in the kernel state just like the c-lists and
object/promise tables.

## Kernel Cycles

We define a "Turn" to be span of computation from one empty call stack to the
next. Each Turn starts with either a message delivery from the kernel (a call
to the Vat's `dispatch.deliver` or `dispatch.notify` functions), or a Promise
`.then` callback. While the Turn is running, the Vat might invoke various
`syscall` methods into the kernel, or it could add deliveries to the Promise
queue by resolving Promises or calling `.then` on a previously-resolved
Promise. When the Turn is complete, the one delivery that triggered it has
been retired from the call stack, but the queue of ready Promise callbacks
might not be empty.

A "Crank" is defined as the span from one empty Promise callback queue to the
next (if you visualize the Vat as a clockwork box with lots of rods and
gears, it might have a big knob on the side: you keep turning this crank
until the machinery stops). Crank boundaries are also Turn boundaries,
however many Turn boundaries will not end the Crank. If a Vat never uses
Promises, then Cranks and Turns will be identical. Each Crank is initiated by
a message delivery from the kernel.

A "Block" is a group of Cranks. The host (in which the SwingSet machine is
embedded) decides how many Cranks to perform before declaring the end of a
Block. The Block is frequently the span of computation from one empty
run-queue to the next, however if there is a lot of work to do, the host
might choose to end the Block early, leaving work on the run-queue for some
future Block.

The Block is the minimal unit of transactional persistence. At the end of
each Block, the kernel state must be securely written to disk. The host could
be terminated at any moment (server reboot, upgrade, kernel crash, or power
loss). When the host is restarted, it must come back to a state that was
recorded at the end of some Block. No outgoing messages may be released
unless the computation that caused them has been safely written into a block.

Cranks are transactional too. If a Crank finishes successfully, all state
changes it makes must be visible to subsequent Cranks. However a Crank might
not finish successfully:

- the Vat might trigger a fault: accessing an invalid c-list entry, or
  resolving the same promise twice. The Vat is terminated.
- the Crank might run out of gas, by using more CPU time or memory than the
  current Meter allows. The kernel might notice this in between Turns, or the
  engine might interrupt the Vat in the middle of a Turn. A Keeper may be
  invoked to decide what to do. If the Crank is allowed to complete, nothing
  special must be done, but if the Crank must be abandoned, then any state
  changes made during the Crank must also be ignored (and worse, the JS
  engine state must be rebuilt to match what it was at the beginning of the
  crank, which requires replaying the transcript).

If the Crank does not finish successfully, all state changes from that Crank
must be discarded. If it _does_ finish successfully, the changes must be
visible to subsequent Cranks, but must not be written to the persistent disk
until the host declares the _Block_ to be finished (to ensure a reboot
returns the machine to an inter-Block boundary, not merely an inter-Crank
boundary).

## Transactions

This implies a string-to-string key-value store, with a two-level write-back
cache. We define **StorageAPI** (typed as **KVStore**) as a set of functions
`{ has, getKeys, get, set, delete }`, with the usual semantics (`has` takes a
string and returns a boolean, `get` returns `undefined` for missing objects).
`getKeys(start, end)` returns an iterator of sorted keys `start <= key < end`.

We also define a **HostDB** as an object with functions `{ has, getKeys, get, applyBatch }`. The batch is a list of `{op: 'set', key, value}` or `{op: 'delete', key}`, and is used to perform an atomic mutation.

Objects with the `StorageAPI` interface exist at multiple points in the
system. There is a single `HostDB` object, in the host. We trace the
construction of these objects starting from the host side:

- The host holds a `hostDB` object which represents some sort of on-disk
  database with transactional semantics, which we use as a string-to-string
  key-value store. It provides the `HostDB` API.
- The host calls `buildBlockBuffer(hostDB)` to get back two facets: `{ blockBuffer, commitBlock }`. `blockBuffer` provides StorageAPI, and is
  given to the controller as `config.hostStorage`. The host invokes
  `commitBlock()` at the end of each Block (e.g. after it does an `await controller.run()`.
- The controller gives `hostStorage` (the BlockBuffer) to the kernel as an
  endowment (specifically as an argument to `buildKernel()`).
- The kernel wraps `blockBuffer` with a function named `guard()` to protect
  the Realm boundary with a limited Membrane (which ensures all arguments are
  strings, all return values are strings or booleans or `undefined`, and
  catches exceptions from the host Realm to rewrite them into kernel-realm
  versions). The guarded `blockBuffer` also implements StorageAPI.
- The guarded `blockBuffer` is fed into `buildCrankBuffer()` to get back
  three facets: `{ crankBuffer, commitCrank, abortCrank }`. `crankBuffer`
  provides StorageAPI, and is given to the `kernelKeeper`. The kernel invokes
  `commitCrank` at the end of each successful Crank, and `abortCrank` when
  the Crank is abandoned.
- The `kernelKeeper` wraps the `crankBuffer` with a read cache (which also
  provides StorageAPI, but caches some values internally to reduce the number
  of cross-realm calls and HostDB operations). The cached `crankBuffer` is
  then wrapped with some helper methods: `{ enumeratePrefixedKeys, getPrefixedValues, deletePrefixedKeys }` to produce the
  `enhancedCrankBuffer`, which provides both StorageAPI plus the helper
  methods (typed as **KVStorePlus**).
- All `kernelKeeper` and `vatKeeper` operations use the
  `enhancedCrankBuffer`. They are unaware of Crank or Block boundaries, nor
  can they sense the operation of the read cache.

We can then follow the use of these objects from the kernel-side
`kernelKeeper` back out:

- All reads from the keepers first look in the read cache, then if that
  misses they do a `crankBuffer.get` or `.has` (the `.getKeys` operation is
  only used for debugging, so it bypasses the read cache). The results of the
  `get` might be added to the read cache, if it seems likely to be useful.
  When a keeper does a `crankBuffer.set` or `.delete`, the corresponding
  entry is either added to the read buffer, or the read buffer entry is
  deleted (e.g. vat transcript entries won't be read back during the lifetime
  of the kernel, so they don't ever need to be included in the read cache).
- Writes from the keepers are fed into `crankBuffer.set` or `.delete`.
- The CrankBuffer responds to `.set` or `.delete` by adding the operation to
  the Crank-level write-back buffer (a `Map` for additions, and a `Set` of
  deleted keys). Reads will check the shadow table first, then fall back to
  reading from the BlockBuffer (through the cross-realm guard).
- When `commitCrank` is invoked, it calls `.set` or `.delete` on the guarded
  BlockBuffer according to the contents of the writeback buffer tables. It
  does not need to inform the BlockBuffer about the end of the Crank: if the
  process is interrupted before the writes are finished, the whole process
  will be terminated, and the next reboot will start from the results of the
  previous Block.
- When BlockBuffer's `.get`/`.has` is called, it first checks the Block-level
  write-back buffer (again a `Map` for additions and a `Set` of deleted
  keys). If the key is not present in those, it forwards the read to the
  HostDB. Writes are added to the write-back buffers.
- When `commitBlock` is called, the contents of the write-back buffers are
  submitted as an atomic batch to the HostDB. Depending upon the HostDB
  interface, this might be a single invocation of `applyBatch` with a large
  list of operations, or it might be a `startTransaction` followed by many
  small writes/deletes and finished with a `commit` call.

## Future Improvements

The `hostDB.applyBatch` API delivers a Block's worth of state changes in an
atomic unit. Using an `applyBatch` that accepts a list of `set` and `delete`
calls is simple, but requires an extra copy of the Block-sized state delta to
exist in RAM:

- Each Crank's state delta is accumulated in RAM (inside the `crankBuffer`)
  until the end of the Crank. The Crank Buffer is then drained into the Block
  Buffer.
- If the HostDB uses `applyBatch`, the Block's changes are accumulated in RAM
  inside the Block Buffer until the end of the Block. The Block Buffer is
  then drained into the HostDB.
- If the HostDB provided a `startTransaction`/`commit` API instead, each
  Crank's changes could be flushed to disk (but not actually committed to
  yet), reducing the RAM footprint.

The HostDB is provided by the host, which can use whatever technology it
wants. The `src/hostStorage.js` module provides `buildStorageInMemory()` and
`buildHostDBInMemory()`, which constructs in-memory simulated HostDB, which
can produce a JSON-serializeable object on demand (so `commitBlock` can
generated this object, stringify it, and write the string to disk). The RAM
footprint of this peaks at 3 times the total kernel state vector (one for the
`Map` that backs the HostDB, a second copy for the JSON-able object, and a
third for the stringified form). An easy improvement would be to write the
`Map`'s entries separately (perhaps as JSON-serialized strings, one key+value
per line). This could be made more efficient by encoding with netstrings, or
by relying upon the keys not having certain characters like spaces, colons,
or newlines (and using those to separate the key from the value, and to
terminate each line). This would reduce the footprint to roughly the size of
the kernel state, plus a copy of the keys (for sorting).

A real HostDB would store everything on disk, only using RAM for the read
cache. The read cache could aggressively discard the c-lists and kernel
tables for all vats that are not in active use. The transcripts never need to
be held in memory. This enables a time-memory cache tradeoff, in which the
minimal RAM footprint is just the heap space used by all Vats. This footprint
could be reduced further by discarding the Vat's JS heap entirely, in
exchange for an expensive reconstruction step (replaying the entire
transcript) when the Vat next becomes active. If most Vats are idle for
extended periods of time, this might make a lot of sense.

In the extreme case, an idle SwingSet uses almost no RAM. When a message
arrives to the inbox, a few c-list entries are fetched to find the dispatch
target, which then points to a Vat. The Vat's initial code and transcript are
read in, and the entire Vat history is replayed. At the end of this process,
we have a JavaScript environment with the right objects, and the inbound
message can be delivered. This results in some syscalls (which update more
tables, on disk), and maybe some more message deliveries, which might thaw
out another Vat or two. At the end of the process, some c-lists have been
changed, and some transcripts have grown longer, but we can now discard all
Vat heaps again.
