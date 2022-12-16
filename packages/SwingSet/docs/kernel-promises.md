# Kernel Promises

Kernel holds a promise table:

| kernel promise number | decider vat ID | state | subscribing vats |

## Actually

Promises created locally in a Vat can only be resolved by that vat: the
resolver is a function, and functions cannot be serialized. You can always
manually create an object to call the function, and export that object.

Sending a promise (as args or wrapped inside a result) doesn't really send
the promise, rather it tells the kernel to create a kernel promise and then
forwards any resolution of the sender's promise into the kernel.

The slots cited in syscalls and dispatches are typed: import/export/promise
(not resolver). Promises can be used as method targets or exports, and as the
target of a dispatch.fulfill/reject. Resolvers are only used in special
calls, so they can't be cited in slots.

send({type: import, id}, "foo", JSON([{@qclass: slot, index: 0}]),
[{type: promise, id: 4}])

For each vat, the kernel maps importIDs to (vat,exportID). It also maps
promiseIDs (which are basically imports) to a row in the Kernel Promise Table
which could say "decided by vatID,resolverID", "forwarded to rowN",
"fulfilled by X", "rejected with X". (the settled values shouldn't stick
around for long, once we notify all subscribers it'd be nice to forget about
the value, but maybe we can't). The kernel maps vat's resolverID to a row of
the KPT.

In general we won't deliver messages speculatively (before the target has
resolved): we can manage ordering better if dispatch.deliver isn't invoked
until user code is allowed to run. This means the kernel needs to manage a
set of pending deliveries (with some internal ordering constraints), and it
needs to know when a promise has been fulfilled to a target (as opposed to
being fulfilled to data, or rejected, both of which cause the delivery to
fail, and the result promise to be rejected).

If/when we do decide to deliver things before their target is resolved, we'll
use `dispatch.queue` instead of `dispatch.deliver` to make it clear. We'll
need to do this with the comms vat, which might get `dispatch.deliver` for
inbound network messages and `dispatch.queue` for everything from other vats.

- syscall.send(exportID, methodName, argsString, slots) -> resultPromiseID

  "hey kernel, please send a message to this target (one of your local
  pass-by-presence). I'm going to create a local promise to manage the
  result. Give me a kernel promise ID (export) so I can send messages to the
  result (citing resultPromiseID in the target of a syscall.send), or share
  the promise with someone else (cite resultPromiseID in the slots)

- syscall.subscribe(promiseID)

  "hey kernel, I care about one of your promises, so please call my
  dispatch.notify\* when it changes state"

- syscall.createPromise() -> { promiseID, resolverID }

  "hey kernel, I want to share one of my local promises, so please create a
  kernel-promise that I can cite."

- dispatch.deliver(target, methodName, argsString, slots, resolverID)
  target is {type: export, id} or {type: resolver, id}

  "hey vat, I'm sending a message to one of your exports, or to be queued for
  delivery to whatever you resolve a local promise to. Please create a local
  promise to track its result, and associate it with resolverID in case we
  need to talk about it in the future"

- syscall.notifyRedirect(resolverID, newPromiseID)
- syscall.notifyFulfillToTarget(resolverID, slot)
- syscall.notifyFulfillToData(resolverID, resultString, slots)
- syscall.notifyReject(resolverID, resultString, slots)

  "hey kernel, remember that promise you cared about with dispatch.subscribe?
  The state has changed. I resolved it to:

  - redirect: one of your other promises
  - fulfillToTarget(slot={type: export, id}): one of my pass-by-presence
    objects
  - fulfillToTarget(slot={type: import, id}): one of my imports (somebody
    else's exported pass-by-presence object)
  - fulfillToData: some non-callable data (which might contain imports,
    exports, or promises)
  - reject: some arbitrary data, but with reject() instead of resolve()

  I'm done with it, so I'm going to forget this resolverID now"

- dispatch.notifyFulfillToTarget(promiseID, slot)
- dispatch.notifyFulfillToData(promiseID, resultString, slots)
- dispatch.notifyReject(promiseID, resultString, slots)

  "hey vat, remember that promise you cared about with syscall.subscribe?
  It's settled, here's the result. I'm going to forget about promiseID now."

In the future, we might add:

- syscall.release(promiseID)

  "hey kernel, ... ???"

- dispatch.release(resolverID)

  "hey vat, remember that promise? nobody is subscribed anymore, and nobody
  will ever be subscribed again in the future, so you can forget about it"
  ???

- dispatch.subscribe(resolverID)

  "hey vat, remember that promise you created with dispatch.deliver or
  syscall.createPromise? Specifically the resolverID. Someone now cares about
  the result, and you are the only one who can provide it. Please call
  syscall.notify\* with the given resolverID when it changes state."

## No Longer Accurate, Probably

- syscall.registerPromise(exportID)
- syscall.noticeSettled(exportID, serializedResolution, slots)
- syscall.noticeRedirect(exportID, importOrExportID)
-
- syscall.subscribe/whenMoreResolved(importID)
- dispatch.noticeSettled(importID, serializedResolution, slots)
- there is no dispatch.noticeRedirect

When a Vat creates a new local Promise and sends it (as a method argument, or
in a return value), its comms layer notices that this is the first time that
Vat has crossed the wire. The comms layer allocates an export ID and calls
`syscall.registerPromise(exportID)`, which tells the kernel to add an entry
in the kernel promise table (allocate a new kernel promise number, and map it
to/from the callers' vatID/exportID). It also calls `.then` on the promise
and attaches callbacks which will invoke `syscall.noticeSettled` (which we
use for both fulfillment and rejection, by somehow encoding a broken promise
with something distinct from a serialized error, or we could split
`noticeSettled` into `noticeFulfilled` and `noticeRejected`, which tbh would
be better). A moment later, the comms layer will invoke `syscall.send` and
will cite the exportID in the `slots` value. The JSON-encoded arguments
string will mention `@qclass: 'promise'` instead of `@qclass: 'slot'` for the
promise.

When the kernel maps the `slots` in a `syscall.send` from
sending-vat-relative to neutral coordinates, it usually takes all positive
(export) IDs and just prepends the sending VatID. With this change, it needs
to find the exportIDs that match the kernel promise table and map them to a
special `kernel:promisenumber` coordinate. We could use a magic VatID for
this, or use a separate table (which might avoid some confusion if someone
creates a vat with a colliding name).

When the kernel eventually delivers the enclosing message, it maps the
neutral coordinates to target-vat-relative ones, by finding everything that
doesn't exist in the target vat's table and allocating negative importIDs for
them. It does the same thing for kernel-tracked promises.

The receiving Vat's comms layer notices the `@qclass: 'promise'` and maps the
object to a new local Promise. It immediately calls `syscall.subscribe` on
the importID, which causes the kernel to add this vatID to the "subscribing
vats" column of the promise table. It sets up an internal table to make sure
that `dispatch.noticeSettled` will cause the resolution to be unserialized
and passed into the resolver of the new Promise. A moment later, when the
arguments finish unserializing, a method will be invoked with the new
Promise.

Later, if/when the sending Vat invokes its resolver or rejector, the `.then`
callback is run, and that Vat will call `syscall.noticeSettled` with the
exportID. This tells the kernel replace the decider vatid/exportID in the
kernel table with a resolution vatID/exportID.

## Invocation

When a Vat uses the imported promise as a method target, our `E()` wrapper
remembers the importID that was used to build that promise and turns any
proxy calls into `syscall.send` with the importID as the targetID. The kernel
notices that this importID maps to a kernel promise rather than to some other
vat's export. If the kernel promise table says the promise is unsettled, the
message is sent to the decider (as a normal `dispatch.deliver`). If it is
settled, it sends it to the resolution (the code will look the same, really).

## Redirection

Some day, Promises may get a mechanism to let us discover when they have been
redirected (i.e. their resolver is called with an unfulfilled promise). This
might be through some new Promise API (parallel to `.then`, maybe called
`.onMoreResolved` or `.onRedirect`), or by using Promise-like objects (e.g.
Vows) instead of actual Promises. The existing `.then` method is
insufficient, because its callback only runs when the resolver is invoked
with a non-Promise (specifically a non-"thenable").

If we had this, and the second promise is associated with a kernel promise,
then we can pipeline any messages sent to the first promise, instead of
waiting for the first promise to be fully settled.

This would be implemented by having the deciding Vat call
`syscall.noticeRedirect` when the redirection happens. The details are still
fuzzy, but I think there are three cases:

- redirect to another local promise: look up the exportID (or allocate a new
  one)
- redirect to an imported value: look up the importID
- redirect to a settled value: call `syscall.noticeSettled` instead

The kernel table would be updated to have a redirect pointer to some other
row of the kernel table. There's no need to tell subscribing vats about the
redirection: they will continue to send their messages to the kernel as
usual. But when they do, for each slot (target or argument) which refers to a
kernel promise, we'll follow the redirections until we find either a
resolution or the decider, and map the slot to match. We'll also update all
the intermediate entries (as well as the calling Vat's import table) to
shorten the paths. As a result, there's no need for a
`dispatch.noticeRedirect`: everything happens through the kernel tables.

## Method Answers

## Or...

- syscall.send(targetImportID, methodName, argsString, slots) -> resultImportID
- syscall.registerPromise(exportID) -> resolverImportID
- dispatch.deliver(facetExportID, methodName, argsString, slots, resolverImportID)
- syscall.notifyRedirect(resolverImportID, targetImport/ExportID)
- syscall.notifyFulfill(resolverImportID, resultString, slots)
- syscall.notifyReject(resolverImportID, resultString, slots)
- syscall.subscribe(promiseImportID)
- dispatch.notifyFulfill(resultImportID, resultString, slots)
- dispatch.notifyReject(resultImportID, resultString, slots)

The recipient of a method isn't really exporting a promise, they're
importing a resolver, which they're expected to call (redirect or fulfill or
reject) later.

Creating a promise and exporting it requires registration first, which causes
the kernel to allocate a resolverImportID. The owner of the promise is then
expected to call (redirect or fulfill or reject).

The recipient of a promise is allowed to subscribe to changes, which are
delivered with dispatch.notifyFulfill/notifyReject. The recipient doesn't
learn about redirect, because instead the kernel's tables are updated.
