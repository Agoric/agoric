# Handling of Authority in ERTP and Zoe

Note: These are internal documentation notes. For how to use Zoe and
how to develop smart contracts, please see
https://agoric.com/documentation/

This document gives a quick overview of how Agoric handles authority
in ERTP and Zoe. Two case studies will be used: first, a study of how
ERTP purses interact with the ERTP paymentLedger, and second, a study
of the escrow code in Zoe.

## Use of Closures

Agoric has deliberately chosen to use closures to create objects and
store state. Agoric does not use classes, and many functions in Agoric
code are not purely functional. Rather, the functions and objects are
the means of conveying authority.

## Division of Files

Files in ERTP and Zoe have been structured to isolate and attenuate
authority so that POLA (Principle of Least Authority) is followed. For
example, in ERTP, the core code that controls the movement of assets
is isolated to paymentLedger.js. Because of this organization choice,
we can confine the `paymentLedger` WeakStore to this file and only
export attenuated access, in the form of an `issuer` and `mint`
object.

## Why not imports? Why pass functions and objects around?

In the object capabilities paradigm, access control is achieved by
selectively passing objects (or functions). This is a fundamental
aspect of object capabilities. These objects have methods which allow
the holder to take certain actions. Importantly, only the holder can
take these actions.

We use this pattern both in our external APIs and also within services
and packages. We do this in order to achieve defense-in-depth and
least authority. For example, we want the bare minimum of code to be
able to withdraw funds from Zoe’s escrow purses, and we want the code
to be easy to audit.

Imports do not serve the same purposes. If powerful capabilities can
be imported, then we have to restrict which files can import what,
thus relying on a lower level to give us guarantees. By passing
powerful capabilities instead, we can merely inspect the code and how
it is being used to ensure that the powerful capability does not
wrongfully escape.

## Case study: ERTP purses and the ERTP paymentLedger

First, some quick context on the file structure in ERTP. There are two
main entrypoints: amountMath.js and issuerKit.js. It is common for
users of ERTP to import `AmountMath` as a stateless library and use it
with already existing ERTP assets. issuerKit.js is how users create
new assets.

There is specific malicious behavior that ERTP must not allow:

- Users stealing funds from other users
- Users minting who do not have access to the mint
- Holders of a mint revoking assets.

In ERTP, the most powerful object is `paymentLedger`, which is a
mapping from payment objects to the amounts which they are said to
hold. Any movement of assets (payment to payment, or purse to payment,
or payment to purse) makes a change to `paymentLedger`. The malicious
behavior listed above would have to engage with the `paymentLedger` in
some regard to be a successful attack. Thus, we want to try to isolate
this powerful authority as much as possible, and be very clear about
when it can be accessed. To achieve this, the `paymentLedger` has its
own file, and never escapes the file.

Other parts of ERTP are also split into their own files. For example,
payments themselves have no internal state, so the code for making a
payment can be in an external file. The same with brands. Purses are
slightly different. We’ve chosen to divide up the code for making a
purse. Rather than add all of the purse-making code to
`paymentLedger`, we chose to only add the `deposit` and `withdraw`
logic. This allowed us to group together the code that accesses the
`paymentLedger`. The alternatives, such as passing the paymentLedger
itself, or moving all of the purse code into the paymentLedger file
would not be as easy to audit.

## Case study: EscrowStorage in Zoe

As one of its features, Zoe provides escrow services for users. This
means that within Zoe, there are ERTP purses containing all of the
funds for all of the users of contracts. This is obviously an area of
high authority that needs as much protection as possible.

To achieve this goal, the code for escrowing is in a separate file:
https://github.com/Agoric/agoric-sdk/blob/198e5c37b4ce3738ed5776c36c949847a226265c/packages/zoe/src/zoeService/escrowStorage.js

Isolating the purses in this way means that there is no way to
directly access the purse objects, outside the file. And more, the
only way that assets can be withdrawn from the purses is through the
function `withdrawPayments`.

Thus, once the file itself has been audited to ensure these
assumptions are correct, then the reviewer only has to search for uses
of `withdrawPayments`. There is only one usage, which is to make a
payout:
https://github.com/Agoric/agoric-sdk/blob/198e5c37b4ce3738ed5776c36c949847a226265c/packages/zoe/src/zoeService/zoeSeat.js#L49
