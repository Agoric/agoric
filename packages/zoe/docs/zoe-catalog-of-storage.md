# Catalog of Zoe Maps/WeakMaps/Stores

## Zoe Service (one per chain)

### installations - native WeakSet

An installation is added whenever a user calls `E(zoe).install` to
install a contract bundle (even when the code is identical to that of
another, already existing installation).

**Expected cardinality**: one element per call
to `E(zoe).install`. On the testnet with only the bootstrap and load
generation code running, this should be less than 10 elements total.

**Access patterns**: `add`, `has`

**Dropped?**: Currently, never dropped by design.

### brandToIssuerRecord - WeakStore from `@agoric/store`

A (brand, issuerRecord) is added whenever a new issuer is added to
Zoe.

**Expected cardinality:** one entry per issuer. On the testnet with
only the bootstrap and load generation code running, this should be
about 10 entries.

**Access patterns**: `init`, `get`

**Dropped?**: Currently, never dropped by design.

### issuerToIssuerRecord - WeakStore from `@agoric/store`

An (issuer, issuerRecord) is added whenever a new issuer is added to
Zoe.

**Expected cardinality:** one entry per issuer. On the testnet with
only the bootstrap and load generation code running, this should be
about 10 entries.

**Access patterns**: `init`, `has`, `get`

**Dropped?**: Currently, never dropped by design.

### brandToPurse - WeakStore from `@agoric/store`

A (brand, purse) is added whenever a new issuer is added to Zoe.

**Expected cardinality**: one entry per issuer. On the testnet with
only the bootstrap and load generation code running, this should be
about 10 entries.

**Access patterns**: `init`, `has`, `get`

**Dropped?**: Currently, never dropped by design.

### instanceToInstanceAdmin - WeakStore from `@agoric/store`

An (instance, instanceAdmin) is added whenever a user calls
`E(zoe).startInstance` and creates a new contract instance.

**Expected cardinality**: one entry per instance. On the testnet with
only the bootstrap and load generation code running, this should be
about 5-10 entries.

**Access patterns**: `init`, `get`

**Dropped?**: Currently, not dropped, but there was a task to drop it.
It looks like the task was checked, but the problem is not solved.
https://github.com/Agoric/agoric-sdk/issues/2880

### zoeSeatAdmins - native Set

A zoeSeatAdmin is added for every userSeat created, so every time a
user calls `E(zoe).offer` with an invitation, OR when a contract creates
an "emptySeat" for bookkeeping.

**Expected cardinality**: one entry per userSeat. If a contract
creates an "emptySeat" for bookkeeping, there will be no invitation,
so we do not know the cardinality in comparison to invitations,
especially since many invitations will not be used.

On the testnet with only the bootstrap and load generation code
running, this will increase by one for every `E(zoe).offer` call.
(Note that a different contract might create numerous "emptySeats" for
accounting, so this is not strictly tied to the number of
`E(zoe).offer` calls in general.)

**Access patterns**: `add`, `has`, `delete`, `forEach`. We only iterate with `forEach` to exit all the seats in the
case of a shutdown or shutdownWithFailure.

**Dropped?**: Currently, dropped when the seat is exited.

### seatHandleToZoeSeatAdmin - WeakStore from `@agoric/store`

A (seatHandle, zoeSeatAdmin) is added for every userSeat created, so
every time a user calls `E(zoe).offer` with an invitation, OR when a
contract creates an "emptySeat" for bookkeeping.

**Expected cardinality**: one entry per userSeat. If a contract
creates an "emptySeat" for bookkeeping, there will be no invitation,
so we do not know the cardinality in comparison to invitations,
especially since many invitations will not be used.

On the testnet with only the bootstrap and load generation code
running, this will increase by one for every `E(zoe).offer` call.
(Note that a different contract might create numerous "emptySeats" for
accounting, so this is not strictly tied to the number of
`E(zoe).offer` calls in general.)

**Access patterns**: `init`, `get`

**Dropped?**: Currently, not dropped, but there is a task to drop it: https://github.com/Agoric/agoric-sdk/issues/2880

## Contract Facet (one per instance)

### brandToIssuerRecord - WeakStore from `@agoric/store` - uses same code as ZoeService

A (brand, issuerRecord) is added whenever a new issuer is added to
this contract instance. (If the same issuer is used in multiple
instances, it is stored in duplicate, since each instance has its own
vat.)

**Expected cardinality**: one entry per issuer per contract. On the testnet with
only the bootstrap and load generation code running, this should be
about 5-10 entries for each instance at most (the AMM has the most
issuers by far).

**Access patterns**: `init`, `get`

**Dropped?**: Currently, never dropped by design.

### issuerToIssuerRecord - WeakStore from `@agoric/store` - uses same code as ZoeService

An (issuer, issuerRecord) is added whenever a new issuer is added to
this contract instance. (If the same issuer is used in multiple
instances, it is stored in duplicate, since each instance has its own
vat.)

**Expected cardinality**: one entry per issuer per contract. On the testnet with
only the bootstrap and load generation code running, this should be
about 5-10 entries for each instance at most (the AMM has the most
issuers by far).

**Access patterns**: `init`, `has`, `get`

**Dropped?**: Currently, never dropped by design.

### invitationHandleToHandler - WeakStore from `@agoric/store`

An (invitationHandle, offerHandler) is added when an invitation is
made.

**Expected cardinality**: one entry per invitation.

**Access patterns**: `init`, `get`, `delete`

**Dropped?**: Yes, when the offer is made and the offerHandler is called.

### activeZCFSeats - WeakStore from `@agoric/store`

A (zcfSeat, allocation) is created when a user calls `E(zoe).offer` or
contract code creates an "emptySeat" for bookkeeping.

**Expected cardinality**: One per call to `E(zoe).offer` or
"emptySeat". On the testnet with only the bootstrap and load
generation code running, this will increase by one for every
`E(zoe).offer` call. (Note that a different contract might create
numerous "emptySeats" for accounting, so this is not strictly tied to
the number of `E(zoe).offer` calls in general.)

**Access patterns**: `init`, `set`, `has`, `get`, `delete`

**Dropped?**: When a ZCFSeat is exited, the entry is dropped.

### zcfSeatsSoFar - Native Set

A new empty Set called `zcfSeatsSoFar` is created in every call to
`reallocateInternal`. It's used to prevent aliasing issues. Only the
seats being reallocated over are added.

**Expected cardinality**: In practice, probably 2 elements total every
time, but it could be larger if the reallocation occurs over multiple
seats.

**Access patterns**: `has`, `add`

**Dropped?**: Entire Set is dropped when the function
`reallocateInternal` ends.

### sumsByBrand - Store from `@agoric/store`

Two of these are created in every call to `zcf.reallocate`, and then
are immediately dropped.

**Expected cardinality**: One key per brand of allocation reallocated over.

**Access patterns**: `init`, `set`, `has`, `get`, `keys`

**Dropped?**: Entire Store is dropped when the function
`assertRightsConserved` ends.
