# Comms Protocol

The comms vat converts kernel dispatches into messages sent to remote
machines, and messages received from remote machines into kernel syscalls. It
relies upon the "VatTP vat" to transmit and receive these messages.

## Types of "Slots" in the CommsVat

You can think of a slot as short string that represents either an object or a
promise, and is either a local or remote. The slot type changes as a message
passes through various parts of the system. For instance, let's look at a
specific case, where a vat `a` in Machine A is sending a message to a vat `b`
in Machine B about an object that lives on `a`.

[ Diagram to come ]

The same object on vat `a` has the following representations:

- in vat `a`: `o+1` (vat export number 1)
- in the commsVat on Machine A: `o-2` (import number 2)
- over the wire to B: `ro-3` (remote object ingress number 3)
- in the commsVat on Machine B: `o+4` (vat export number 4)
- in vat `b`: `o-5` (vat import number 5)

(The identifiers are allocated on demand, so the numbers will vary. These
values were chosen to indicate that all the ids are unrelated to each other.)

Note that when Machine B sends this same object back, the wire identifier
type will be different (`ro+NN` instead of `ro-NN`):

- in vat `b`: `o-5` (vat import number 5)
- in the commsVat on Machine B: `o+4` (vat export number 4)
- over the wire to A: `ro+3` (remote object egress number 3)
- in the commsVat on Machine A: `o-2` (import number 2)
- in vat `a`: `o+1` (vat export number 1)

Similar identifiers are used for Promises: `p+1`, `rp-3`, `p-5`, etc.

## Comms Messages

The comms protocol consists of single-line strings which encode these
messages. There are four different types, with some formatting variations
that depend upon the presence of slots and/or a result promise:

```
deliver:${remoteTargetSlot}:;${methargs.body}
deliver:${remoteTargetSlot}::${slots..};${methargs.body}
deliver:${remoteTargetSlot}:${remoteResultSlot};${methargs.body}
deliver:${remoteTargetSlot}:${remoteResultSlot}:${slots..};${methargs.body}
resolve:object:${target}:${resolutionRef};
resolve:data:${target};${resolution.data.body}
resolve:data:${target}:${slots..};${resolution.data.body}
resolve:reject:${target};${resolution.data.body}
resolve:reject:${target}:${slots..};${resolution.data.body}
```

## Over the Wire Slot Types

The possible types are:

- remote object ingress: arrives as `ro-NN`
- remote object egress: arrives as `ro+NN`
- remote promise ingress: arrives as `rp-NN`
- remote promise egress: arrives as `rp+NN`

The comms protocol is exceedingly polite, and always emits object/promise
references in the format that the receiving machine can understand, i.e. from
the receiving machine's perspective. If the sign character is positive, the
number being referenced was allocated by the receiving machine. If it is
negative, the number was allocated by the sending machine.

As a result, the same object/promise will be referenced in two different
ways, depending on which direction the enclosing message is travelling. This
is different than the vat-kernel interface, where the symmetry is broken by
the fact that vats only ever talk to the kernel, and references do not depend
upon the message direction (syscall into the kernel, or dispatch into a vat).

Like kernel promises, the `rp+NN`/`rp-NN` references used in inter-machine
messages have two different properties. The sign character indicates which
side (receiver '+', or sender '-') _allocated_ the number. The promise also
has a specific _Decider_, which changes as the promise is used as the result
of a delivery. The rules about transferring decision-making authority match
those between vats in the kernel. The sign character says nothing about which
side is the Decider.

Like kernel _objects_, the `ro+NN`/`ro-NN` references have a clear owner: if
machine A receives a message that cites `ro+NN`, the object being referenced
is owned by machine A, and any mesasges _sent_ to this object must be sent to
machine A. If it receives `ro-NN` from machine B, that refers to an object
owned by B.

Ingress and egress types can appear in the slots of messages going either
way - in other words, the arguments of my message can be referencing either
things on my machine or your machine (or a third machine!).

## Delivery

`remoteTargetSlot` will be `ro+NN` or `rp+NN`: it is a target to which a
message is being delivered, and thus will always be an _egress_ (export) of
the machine which receives the message (if it were an ingress, the message
was sent to the wrong place).

`remoteResultSlot` is either an empty string, or a `rp+NN` promise identifier.

`slots..` is a colon-joined list of any slots in the message arguments, which
can be `ro+NN`, `ro-NN`, `rp+NN`, or `rp-NN`.

`methargs.body` is the JSON-encoded method+argument message body (using our
`marshal` library). The value that `methargs` encodes is always a pair (which
is to say, a two-element array) consisting of the method name and the arguments
list. The latter is itself always an array, though it can be an empty array if
there are no arguments. As far as the comms encoding is concerned, the method
"name" can be any serialized value, though it actually is limited by use to
being a string, a symbol, or `undefined`. As JSON, the methargs body can
contain arbitrary characters except for a newline. The comms message always ends
with a newline.

### Examples

Machine A sends these message to machine B. Assume `target` is an object that
lives on B, and known to A as `ro-1`.

```js
void E(target).foo(1, 2);
```

This is a "send-only" message (the return Promise is explicitly dropped, so
there is no result slot). (Note that we cannot currently detect the drop, so
vat code cannot currently cause a send-only message, but the other layers are
prepared to handle them if and when that becomes possible).

`marshal` will JSON-encode the argument array into a body of `[1,2]`, with an
associated `slots` that is empty (since there are no remotely-referenceable
objects or Promises in the arguments).

The message will thus be transmitted as: `deliver:ro+1:foo:;[1,2]` (this uses
`ro+1`, not `ro-1`, because references are formatted for the receiver before
transmitting, and the target of a message always lives on the side receiving
the message).

Next, we introduce a result promise, by retaining the return value of `E`. We
assume this is allocated as `rp+3` (the number is allocated by A, the
sender):

```js
const p = E(target).foo(1, 2);
```

This will be transmitted as: `deliver:ro+1:foo:rp-3;[1,2]`

Now, we introduce an argument slot, by including some pass-by-reference
object in the arguments. `bar` is an object that lives on A with index 2.
`bar` will be sent to B as `ro-2`, and B would send it back as `ro+2`.

```js
const p = E(target).foo(1, 2, bar);
```

`marshal` will encode the argument array into a body of
`[1,2,{"@qclass":"slot","index":0}]`, with an associated `slots` that
references `bar` (so `[ 'ro-2' ]`).

The message will thus be transmitted as:
`deliver:ro+1:foo:rp-3:ro-2;[1,2,{"@qclass":"slot","index":0}]`

If we performed a send-only instead, `void E(target).foo(1,2,bar)` is
delivered as `deliver:ro+1:foo::ro-2;[1,2,{"@qclass":"slot","index":0}]`

A send-only of two argument slots, `void E(target).foo(1,2,bar,baz)` (with
`baz` living on A as well), would be
`deliver:ro+1:foo::ro-2:ro-4;[1,2,{"@qclass":"slot","index":0},{"@qclass":"slot","index":1}]`

A send-with-result of two slots, `p = E(target).foo(1,2,bar,baz)`, would be
`deliver:ro+1:foo:rp-3:ro-2:ro-4;[1,2,{"@qclass":"slot","index":0},{"@qclass":"slot","index":1}]`
. The result promise slot appears first, followed by all argument slots.

## Promise Resolution

`target` will be `rp-NN` or `rp+NN`: only Promises can be resolved.

Promises that resolve to data, or which are rejected, will have a `body` and
possibly `slots`. Each slot can hold any kind of reference: `ro+NN`, `ro-NN`,
`rp+NN`, or `rp-NN`. A promise cannot currently be resolved directly to another
promise, unless the promise value is nested in data, or it's a rejection.

Promises that resolve to a callable object have a single `resolutionRef`,
which always resolves to `ro+NN` or `ro-NN`.

### Examples

Continuing the "Delivery" examples, let us look at machine B, where `foo` is
implemented. If `foo()` returns a value, the original inbound `deliver:`
message's result promise will be resolved with that value. Likewise, if
`foo()` throws an Error, the result promise will be rejected with the Error
object. Either kind of value might include arbitrary data, which might
include object or promise references.

If A's `deliver:` included `rp-3` as the result promise, then when B sends
the resolution back, it will cite `rp+3`.

If B's `foo()` does `return 4;`, the resolution will be transmitted as
`resolve:data:rp+3;4`

`return [5,6]` would yield `resolve:data:rp+3;[5,6]`

Suppose `foo()` has access to the same `bar` from the examples above. When B
sends a message that references `bar` (which lives on A, the recipient of the
`resolve` message), it will cite `ro+2` (the sign is flipped when `bar` is
sent from B to A, instead of from A to B).

If B does `return bar;`, the resolution is transmitted as
`resolve:object:rp+3:ro+2` (note the `resolve:object`, not `resolve:data`,
because resolving to a single callable object is a special case: message can
be delivered an object, but not to data).

If B does `return [bar];`, the resolution is transmitted as
`resolve:data:rp+3:ro+2;[{"@qclass":"slot","index":0}]` . The `ro+2` is the
length-one `slots` array, which is referenced by the result body.

`return [1,2,bar];` causes
`resolve:data:rp+3:ro+2;[1,2,{"@qclass":"slot","index":0}]`

If B had access to a `baz` that also lived on A, `return [1,2,bar,baz]` would cause `resolve:data:rp+3:ro+2:ro+4;[1,2,{"@qclass":"slot","index":0},{"@qclass":"slot","index":1}]`

If `foo()` did `throw Error('oops')`, the Error would be serialized as
`{"@qclass":"error","name":"Error","message":"oops"}`. The message would be
`reject:rp+3:{"@qclass":"error","name":"Error","message":"oops"}`.

If `foo()` did `throw Error(bar)`, the message would be
`reject:rp+3:ro+2;{"@qclass":"error","name":"Error","message":{"@qclass":"slot","index":0}}`

## inbound messages

The inbound parser will locate the first semicolon and tokenize the string up
to that point as a series of colon-separated fields. The first field is the
message type (`deliver` or `resolve`).

For `deliver`, the second field is the target slot. The third field (which might
be an empty string) is the result promise. Any remaining fields are slots for
the arguments. Everything after the semicolon is the body for the arguments.

If the type is `resolve`, the second field is used as the subtype (`object`
or `data` or `reject`). The next field is the target (the promise being
resolved). Everything after the semicolon is the body of the resolution data
(if any).

For `resolve:object`, the next field is the object to which the target is
being resolved, and there are no other fields. The body is empty.

For `resolve:data` and `resolve:reject`, the remaining fields (if any) are
slots for the resolution/rejection data.

Messages arriving from distant machines will appear as a string on a
transport device, which will invoke the inbound handler with line of message
data (omitting the newline).

We anticipate adding `resolve:forward` in the future, which will replace one
promise with another. The message format for this will probably be
`resolve:forward:${target}:${resolutionRef};`, where `resolutionRef` is a
promise identifier.

## Comparison to the E version of CapTP:

In the E version of CapTP, there are four tables: questions, answers, imports, and
exports. We only have ingresses and egresses

For more information about the four tables in the E version of CapTP see:
http://www.erights.org/elib/distrib/captp/4tables.html
