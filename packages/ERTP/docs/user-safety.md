# ERTP User Safety

## Both a protocol and an implementation

ERTP can be thought of as a protocol and an implementation. There
could be multiple different implementations of the protocol, but for
now, we just have one (@agoric/ertp) whose types specify the protocol.
The distinction between protocol and implementation becomes important
because when Zoe escrows assets for use in contracts, it does not
verify that the assets were made using the latest @agoric/ertp
implementation. This means that the issuers and brands of assets that
users escrow may misbehave.

Zoe specifically uses the @agoric/ertp implementation for contract invitations.

For every new brand of token, there is:

- A mint - this is the only object with the ability to mint tokens. To mint, call `mint.mintPayment`.
  - A good example of an object capability - anyone who has access to the `mint` object can mint, and _only those_ who have access to the `mint` object can mint.
- A brand - this is the object that is the embodiment of the brand of token. When making offers, including the brand allows you to specify exactly what tokens you are giving and will accept.
- An issuer - The trusted authority of which objects hold which tokens.

The only objects that can “hold” assets:

- Purses: An object that a user holds for the long-term, made directly using the issuer for the token
- Payments: An short-lived object that is usually created by withdrawing from a purse (Payments can also be created by minting.) Payments are what are sent to other people and sent as an offer to Zoe

More generally in ERTP:

- In ERTP, users rely on issuers, and must be very careful which issuers they choose to rely on.
- Users do not trust payments from other users. Users must use a trusted issuer to claim the payment or a purse (made from a trusted issuer) to deposit the payment.
- Users do not accept purses from other users.
- Users send amounts (amount = brand + value) to other users to reference the intended kind of an asset.

| If someone sends you x, you should: |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An issuer                           | Ask yourself: Given what I know about the sender and what the sender says the issuer is an authority on, am I willing to rely on this issuer as the authority for this particular brand of token? (See below for more information on when to accept issuers.)                                                                                                                                                                                                                                                                                              |
| A payment                           | Call `E(payment).getAllegedBrand()` to get the purported brand of the payment. Then, using the brand, look up the corresponding issuer or purse. Then, do either: `const newPaymentJustForMe = await E(issuer).claim(payment);` (This produces a new payment that only the user has access to. The old payment (which the sender might have access to) is used up and can be discarded.) Or: `await E(purse).deposit(payment);` This will also use up the old payment; it can now be discarded. The amount within the payment is transferred to the purse. |
| A purse                             | DO NOT ACCEPT. Just drop it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| A mint                              | Ask: why would someone do this? Probably, do not accept it. Mints are meant to stay in a contract and not be exposed, so someone sending a mint is highly unusual.                                                                                                                                                                                                                                                                                                                                                                                         |
| An amount                           | This is a very normal part of negotiation about a potential trade or deal. If you want to check whether the amount is well-formed for a particular brand that you already know, you can create a safe copy with: `const myAmount = AmountMath.coerce(particularBrand, amount);`                                                                                                                                                                                                                                                                            |
| A brand                             | This is a normal part of negotiation, if the value part of the amount isn’t yet known. This is how someone would tell you the kind of token that is wanted or given.                                                                                                                                                                                                                                                                                                                                                                                       |
| A value                             | Normally this would be part of an amount. Just make sure you know which brand or potential brands you are talking about so there’s no confusion.                                                                                                                                                                                                                                                                                                                                                                                                           |

## Accepting Issuers

The dangers of accepting an issuer:

- The issuer is actually a different one than the one that you think
  it is.
- The issuer wasn’t made using the ERTP implementation, and its actual
  code does things like revoke assets from purses and payments
  unexpectedly.

Examples of receiving purported “issuers” that should not be trusted:

- A stranger tells you about a new currency with issuer x.
- A stranger sends you issuer x and says it’s the issuer for something valuable, like the Agoric staking token.

Examples of receiving purported issuers that could be trusted:

- Your best friend sends you the issuer for a new currency they're
  excited about
- A currency’s public website sends your wallet the issuer for its own currency
  E.g. The well known AMM website tells your wallet that its liquidity
  token issuer for a certain pool is x

If the issuer was made in a Zoe contract (currently, the only way for users to create issuers on-chain), then asserting that the issuer was produced in a contract by inspecting the contract code itself and the mechanisms by which the issuer is exposed, is the best way to be assured that an issuer is well-behaving.

Note that Zoe assumes that issuers may misbehave. Users of Zoe are required to rely on issuers at their own risk. A misbehaving issuer will not hurt Zoe or other users, but it will potentially hurt a user who makes an offer that `wants` or `gives` assets of the same `brand` as the issuer.
