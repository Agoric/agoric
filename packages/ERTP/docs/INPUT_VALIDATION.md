# Input Validation for ERTP - A Walkthrough

## Requirements

We want ERTP to be robust against malicious code in the same vat, so the ERTP must be robust without the kind of checks that we get for free in intervat communication going through `@endo/marshal` and `@agoric/swingset-vat`. In other words, the only tools at our disposal are being in a Hardened JS environment, and helpers that we import and call directly, such as `passStyleOf` from `@endo/marshal`.

## Malicious Behavior

We identify two personas: the creator of an issuerKit, and a user of the asset type. A user is someone who holds a purse or payment of that brand, or describes something in terms of an amount of that brand. A creator might be vulnerable to an attack by users and vice versa. Users might be vulnerable to other users.

The malicious behavior we would like to prevent is:

1. Users stealing funds from other users
2. Users minting who do not have access to the mint
3. The creator of an issuerKit revoking assets from the holders of purses and payments

## Entry points in ERTP

There are three entry points in ERTP:

1. packages/ERTP/src/amountMath.js
2. packages/ERTP/src/issuerKit.js
3. packages/ERTP/src/typeGuards.js

This document will only analyze `AmountMath.coerce`, but the
methodology for validating inputs remains the same for the ERTP functions.

`AmountMath.coerce` takes a `brand` and an `amount` and returns a new
`amount`, but throws if the amount's brand is not identical to the
`brand` argument, or if the amount is not a valid amount generally.
(Note that we do not check whether the `assetKind` according to the
`brand` argument matches the implicit `assetKind` of the `amount`
argument's value. This is because checking the `assetKind` according
to the `brand` would currently require an asynchronous call on the
brand.)

For `coerce` to work according to spec, if the user passes in an
invalid brand or an invalid amount, the function should throw.

## Valid amounts

A valid amount is an object record with two properties: `brand` and
`value`. `brand` is a Remotable with a few methods, such as
`isMyIssuer`, but for the purposes of a valid amount, we allow any
Remotable and do not call any of these methods (we would have to call
them asynchronously in order to check them, since the `brand` might be
a remote object, so we do not check them.)

The value is either a bigint Nat in the case of AssetKind.NAT (we formerly allowed numbers for backwards compatibility, but now only bigints are allowed) or an array of Structures in the case of AssetKind.SET. The array of Structures might include any combination of other Structures, “undefined”, “null”, booleans, symbols, strings, pass-by-copy records, pass-by-copy arrays, numbers, bigints, Remotables, and errors. Importantly, a Structure cannot contain promises.

## Invalid Amounts

There are a number of ways in which amounts can be invalid:

### Not an object

- **The danger**: we’ll get unexpected failures later on in our use of the amount rather than failing fast at the start as intended.

### Not a CopyRecord

- **The danger**: an object that isn’t a `copyRecord` can have
  `getters` that return different values at different times, so
  checking the value would be no guarantee that the value will be the
  same when accessed later. For example:

```js
const object1 = {};
let checked = false;
Object.defineProperty(object1, 'value', {
  get() {
    if (checked) {
      return 1000000n;
    } else {
      checked = true;
      return 1n;
    }
  },
});
```

```sh
> object1.value
1n
> object1.value
1000000n
```

`Object.freeze(object1)` is not helpful here, as the `getter` is not changing, the value that is being returned is. `harden` also does not prevent `value` from changing. ​​When harden does encounter an accessor property during its traversal, it does not "read" the property, and thereby does not call the getter. Rather, it proceeds to recursively harden the getter and setter themselves. That's because, for an accessor property, its current value isn't, for this purpose, considered part of its API surface, but rather part of the behavior of that API. Thus, we need an additional way to ensure that the value of `checked` cannot change.

`passStyleOf` throws on objects with accessor properties like the
object defined above. (In the future, `passStyleOf` may allow far
objects (passStyleOf === 'remotable') to have getters. When that
change happens, `passStyleOf` would not throw in that case.)

### Is a CopyRecord and is a proxy

- **The dangers**:
  1. A proxy can throw on any property access. Any time it does _not_ throw, it _must_ return the same
     value as before.
  2. A proxy can mount a reentrancy attack. When the property is
     accessed, the proxy handler is called, and the handler can
     reenter the code while the original is still waiting for that
     property access to return.

We _assume_ we will address proxy-based reentrancy by other, lower-level means.
Specifically, `passStyleOf(x) === 'copyRecord'` or
`passStyleOf(x) === 'copyArray'` would guarantee that `x` is not a proxy, protecting
against dangers #1 and #2. We should note that proxy-based reentrancy
is not a threat across a vat boundary because it requires synchronous
access.

## Invalid brands

A brand can be "wrong" if:

1. It's not a Remotable
2. Its methods don’t adhere to the expected Brand API
3. It misbehaves (i.e. answering isMyIssuer with different responses)

In determining whether a brand is "valid", we only check that the brand is a remotable. This means that a brand
that passes our input validation could still have the wrong API or misbehave.

## Who hardens?

It is the responsibility of the sender/client (the creator of an
issuerKit or user of ERTP) to harden. AmountMath does not harden
inputs.

## The implementation

In `AmountMath.coerce(brand, allegedAmount)`, we do the following:

1. assert that the `brand` is a remotable
2. assert that the `allegedAmount` is a `copyRecord`
3. destructure the `allegedAmount` into `allegedBrand` and
   `allegedValue`
4. Assert that the `brand` is identical to the `allegedBrand`
5. Call `AmountMath.make(brand, allegedValue)`, which:
   - Asserts that the `brand` is a remotable, again.
   - Asserts that the `allegedValue` is a `copyArray` or a `bigint`
   - Gets the appropriate MathHelpers
   - Calls `helpers.doCoerce(allegedValue)`, which either asserts
     that the value is a `Nat bigint` or that the value is a
     `copyArray` `structure` with no duplicate elements
6. Return a new `amount`

Thus, we ensure that the `brand` is valid by checking that it is a
remotable. We ensure that the `allegedAmount` is a copyRecord with
valid `brand` and `value` properties.

If `allegedAmount` were a proxy, we would either throw in step 3 (the
destructuring), or we successfully get both the `allegedBrand` and
`allegedValue` and never touch the proxy again. Currently, we do not
attempt to prevent proxy-based reentrancy, so defending against danger
#1 is the full extent of our defense.
