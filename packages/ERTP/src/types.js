/// <reference types="ses"/>

/**
 * @typedef {import('@endo/marshal').InterfaceSpec} InterfaceSpec
 *
 * @typedef {import('@endo/marshal').GetInterfaceOf} GetInterfaceOf
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {object} Amount Amounts are descriptions of digital assets,
 *   answering the questions "how much" and "of what kind". Amounts are values
 *   labeled with a brand. AmountMath executes the logic of how amounts are
 *   changed when digital assets are merged, separated, or otherwise
 *   manipulated. For example, a deposit of 2 bucks into a purse that already
 *   has 3 bucks gives a new purse balance of 5 bucks. An empty purse has 0
 *   bucks. AmountMath relies heavily on polymorphic MathHelpers, which
 *   manipulate the unbranded portion.
 * @property {Brand<K>} brand
 * @property {AssetValueForKind<K>} value
 */

/**
 * @typedef {NatValue | SetValue | CopySetValue | CopyBagValue} AmountValue An
 *   `AmountValue` describes a set or quantity of assets that can be owned or shared.
 *
 *   A fungible `AmountValue` uses a non-negative bigint to represent a quantity
 *   of that many assets.
 *
 *   A non-fungible `AmountValue` uses an array or CopySet of `Key`s to represent
 *   a set of whatever asset each key represents. A `Key` is a passable value
 *   that can be used as an element in a set (SetStore or CopySet) or as the key
 *   in a map (MapStore or CopyMap).
 *
 *   `SetValue` is for the deprecated set representation, using an array directly
 *   to represent the array of its elements. `CopySetValue` is the proper
 *   representation using a CopySet.
 *
 *   A semi-fungible `CopyBagValue` is represented as a `CopyBag` of `Key`
 *   objects. "Bag" is synonymous with MultiSet, where an element of a bag can
 *   be present once or more times, i.e., some positive bigint number of times,
 *   representing that quantity of the asset represented by that key.
 */

/**
 * @typedef {AmountValue} Value "Value" is a deprecated alias for "AmountValue".
 *   Please use "AmountValue" instead.
 */

/**
 * @typedef {'nat' | 'set' | 'copySet' | 'copyBag'} AssetKind See doc-comment
 *   for `AmountValue`.
 */

/**
 * @template {AssetKind} K
 * @typedef {K extends 'nat'
 *   ? NatValue
 *   : K extends 'set'
 *   ? SetValue
 *   : K extends 'copySet'
 *   ? CopySetValue
 *   : K extends 'copyBag'
 *   ? CopyBagValue
 *   : never} AssetValueForKind
 */

/**
 * @template {AmountValue} V
 * @typedef {V extends NatValue
 *   ? 'nat'
 *   : V extends SetValue
 *   ? 'set'
 *   : V extends CopySetValue
 *   ? 'copySet'
 *   : V extends CopyBagValue
 *   ? 'copyBag'
 *   : never} AssetKindForValue
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} DisplayInfo
 * @property {number} [decimalPlaces] Tells the display software how many
 *   decimal places to move the decimal over to the left, or in other words,
 *   which position corresponds to whole numbers. We require fungible digital
 *   assets to be represented in integers, in the smallest unit (i.e. USD might
 *   be represented in mill, a thousandth of a dollar. In that case,
 *   `decimalPlaces` would be 3.) This property is optional, and for
 *   non-fungible digital assets, should not be specified. The decimalPlaces
 *   property should be used for _display purposes only_. Any other use is an
 *   anti-pattern.
 * @property {K} assetKind - The kind of asset, either AssetKind.NAT (fungible)
 *   or AssetKind.SET or AssetKind.COPY_SET (non-fungible)
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} Brand The brand identifies the kind of issuer, and has a
 *   function to get the alleged name for the kind of asset described. The
 *   alleged name (such as 'BTC' or 'moola') is provided by the maker of the
 *   issuer and should not be trusted as accurate.
 *
 *   Every amount created by a particular AmountMath will share the same brand,
 *   but recipients cannot rely on the brand to verify that a purported amount
 *   represents the issuer they intended, since the same brand can be reused by
 *   a misbehaving issuer.
 * @property {(allegedIssuer: ERef<Issuer>) => Promise<boolean>} isMyIssuer
 *   Should be used with `issuer.getBrand` to ensure an issuer and brand match.
 * @property {() => string} getAllegedName
 * @property {() => DisplayInfo} getDisplayInfo Give information to UI on how to
 *   display the amount.
 */

/**
 * @callback IssuerBurn Burn all of the digital assets in the payment.
 *   `optAmount` is optional. If `optAmount` is present, the code will insist
 *   that the amount of the digital assets in the payment is equal to
 *   `optAmount`, to prevent sending the wrong payment and other confusion.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @param {Pattern} [optAmountShape]
 * @returns {Promise<Amount>}
 */

/**
 * @callback IssuerClaim Transfer all digital assets from the payment to a new
 *   payment and delete the original. `optAmount` is optional. If `optAmount` is
 *   present, the code will insist that the amount of digital assets in the
 *   payment is equal to `optAmount`, to prevent sending the wrong payment and
 *   other confusion.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @param {Pattern} [optAmountShape]
 * @returns {Promise<Payment>}
 */

/**
 * @callback IssuerIsLive Return true if the payment continues to exist.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @returns {Promise<boolean>}
 */

/**
 * @callback IssuerGetAmountOf Get the amount of digital assets in the payment.
 *   Because the payment is not trusted, we cannot call a method on it directly,
 *   and must use the issuer instead.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @returns {Promise<Amount>}
 */

/**
 * @callback IssuerCombine Combine multiple payments into one payment.
 *
 *   If any of the payments is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>[]} paymentsArray
 * @param {Amount} [optTotalAmount]
 * @returns {Promise<Payment>}
 */

/**
 * @callback IssuerSplit Split a single payment into two payments, A and B,
 *   according to the paymentAmountA passed in.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @param {Amount} paymentAmountA
 * @returns {Promise<Payment[]>}
 */

/**
 * @callback IssuerSplitMany Split a single payment into many payments,
 *   according to the amounts passed in.
 *
 *   If the payment is a promise, the operation will proceed upon resolution.
 * @param {ERef<Payment>} payment
 * @param {Amount[]} amounts
 * @returns {Promise<Payment[]>}
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} Issuer The issuer cannot mint a new amount, but it can
 *   create empty purses and payments. The issuer can also transform payments
 *   (splitting payments, combining payments, burning payments, and claiming
 *   payments exclusively). The issuer should be gotten from a trusted source
 *   and then relied upon as the decider of whether an untrusted payment is valid.
 * @property {() => Brand<K>} getBrand Get the Brand for this Issuer. The Brand
 *   indicates the type of digital asset and is shared by the mint, the issuer,
 *   and any purses and payments of this particular kind. The brand is not
 *   closely held, so this function should not be trusted to identify an issuer
 *   alone. Fake digital assets and amount can use another issuer's brand.
 * @property {() => string} getAllegedName Get the allegedName for this mint/issuer
 * @property {() => AssetKind} getAssetKind Get the kind of MathHelpers used by
 *   this Issuer.
 * @property {() => DisplayInfo} getDisplayInfo Give information to UI on how to
 *   display amounts for this issuer.
 * @property {() => Purse} makeEmptyPurse Make an empty purse of this brand.
 * @property {IssuerIsLive} isLive
 * @property {IssuerGetAmountOf} getAmountOf
 * @property {IssuerBurn} burn
 * @property {IssuerClaim} claim
 * @property {IssuerCombine} combine
 * @property {IssuerSplit} split
 * @property {IssuerSplitMany} splitMany
 */

/**
 * @typedef {Object} AdditionalDisplayInfo
 * @property {number} [decimalPlaces] Tells the display software how many
 *   decimal places to move the decimal over to the left, or in other words,
 *   which position corresponds to whole numbers. We require fungible digital
 *   assets to be represented in integers, in the smallest unit (i.e. USD might
 *   be represented in mill, a thousandth of a dollar. In that case,
 *   `decimalPlaces` would be 3.) This property is optional, and for
 *   non-fungible digital assets, should not be specified. The decimalPlaces
 *   property should be used for _display purposes only_. Any other use is an
 *   anti-pattern.
 * @property {AssetKind} [assetKind]
 */

/**
 * @callback ShutdownWithFailure Called to shut something down because something
 *   went wrong, where the reason is supposed to be an Error that describes what
 *   went wrong. Some valid implementations of `ShutdownWithFailure` will never
 *   return, either because they throw or because they immediately shutdown the
 *   enclosing unit of computation. However, they also might return, so the
 *   caller should follow this call by their own defensive `throw reason;` if
 *   appropriate.
 * @param {Error} reason
 * @returns {void}
 */

/** @typedef {import('./issuerKit').IssuerKit} IssuerKit */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} Mint Holding a Mint carries the right to issue new digital
 *   assets. These assets all have the same kind, which is called a Brand.
 * @property {() => Issuer<K>} getIssuer Gets the Issuer for this mint.
 * @property {(newAmount: Amount<K>) => Payment<K>} mintPayment
 */

/**
 * @callback DepositFacetReceive
 * @param {Payment} payment
 * @param {Pattern} [optAmountShape]
 * @returns {Amount}
 */

/**
 * @typedef {Object} DepositFacet
 * @property {DepositFacetReceive} receive Deposit all the contents of payment
 *   into the purse that made this facet, returning the amount. If the optional
 *   argument `optAmount` does not equal the amount of digital assets in the
 *   payment, throw an error.
 *
 *   If payment is a promise, throw an error.
 */

/**
 * @callback PurseDeposit
 * @param {Payment} payment
 * @param {Pattern} [optAmountShape]
 * @returns {Amount}
 */

/**
 * @typedef {Object} Purse Purses hold amount of digital assets of the same
 *   brand, but unlike Payments, they are not meant to be sent to others. To
 *   transfer digital assets, a Payment should be withdrawn from a Purse. The
 *   amount of digital assets in a purse can change through the action of
 *   deposit() and withdraw().
 *
 *   The primary use for Purses and Payments is for currency-like and goods-like
 *   digital assets, but they can also be used to represent other kinds of
 *   rights, such as the right to participate in a particular contract.
 * @property {() => Brand} getAllegedBrand Get the alleged Brand for this Purse
 * @property {() => Amount} getCurrentAmount Get the amount contained in this purse.
 * @property {() => Notifier<Amount>} getCurrentAmountNotifier Get a lossy
 *   notifier for changes to this purse's balance.
 * @property {PurseDeposit} deposit Deposit all the contents of payment into
 *   this purse, returning the amount. If the optional argument `optAmount` does
 *   not equal the amount of digital assets in the payment, throw an error.
 *
 *   If payment is a promise, throw an error.
 * @property {() => DepositFacet} getDepositFacet Return an object whose
 *   `receive` method deposits to the current Purse.
 * @property {(amount: Amount) => Payment} withdraw Withdraw amount from this
 *   purse into a new Payment.
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} Payment Payments hold amount of digital assets of the same
 *   brand in transit. Payments can be deposited in purses, split into multiple
 *   payments, combined, and claimed (getting an exclusive payment). Payments
 *   are linear, meaning that either a payment has the same amount of digital
 *   assets it started with, or it is used up entirely. It is impossible to
 *   partially use a payment.
 *
 *   Payments are often received from other actors and therefore should not be
 *   trusted themselves. To get the amount of digital assets in a payment, use
 *   the trusted issuer: issuer.getAmountOf(payment),
 *
 *   Payments can be converted to Purses by getting a trusted issuer and calling
 *   `issuer.makeEmptyPurse()` to create a purse, then `purse.deposit(payment)`.
 * @property {() => Brand<K>} getAllegedBrand Get the allegedBrand, indicating
 *   the type of digital asset this payment purports to be, and which issuer to
 *   use. Because payments are not trusted, any method calls on payments should
 *   be treated with suspicion and verified elsewhere.
 */

/**
 * @template {AssetKind} K
 * @typedef {Object} MathHelpers<K> All of the difference in how digital asset
 *   amount are manipulated can be reduced to the behavior of the math on
 *   values. We extract this custom logic into mathHelpers. MathHelpers are
 *   about value arithmetic, whereas AmountMath is about amounts, which are the
 *   values labeled with a brand. AmountMath use mathHelpers to do their value
 *   arithmetic, and then brand the results, making a new amount.
 *
 *   The MathHelpers are designed to be called only from AmountMath, and so all
 *   methods but coerce can assume their inputs are valid. They only need to do
 *   output validation, and only when there is a possibility of invalid output.
 * @property {(allegedValue: V) => V} doCoerce Check the kind of this value and
 *   throw if it is not the expected kind.
 * @property {() => V} doMakeEmpty Get the representation for the identity
 *   element (often 0 or an empty array)
 * @property {(value: V) => boolean} doIsEmpty Is the value the identity element?
 * @property {(left: V, right: V) => boolean} doIsGTE Is the left greater than
 *   or equal to the right?
 * @property {(left: V, right: V) => boolean} doIsEqual Does left equal right?
 * @property {(left: V, right: V) => V} doAdd Return the left combined with the right.
 * @property {(left: V, right: V) => V} doSubtract Return what remains after
 *   removing the right from the left. If something in the right was not in the
 *   left, we throw an error.
 */

/** @typedef {bigint} NatValue */

/** @typedef {MathHelpers<NatValue>} NatMathHelpers */

/** @typedef {Key[]} SetValue */

/** @typedef {MathHelpers<SetValue>} SetMathHelpers */

/** @typedef {CopySet<Key>} CopySetValue */

/** @typedef {MathHelpers<CopySetValue>} CopySetMathHelpers */

/** @typedef {CopyBag<Key>} CopyBagValue */

/** @typedef {MathHelpers<CopyBagValue>} CopyBagMathHelpers */

/**
 * @callback AssertAssetKind
 * @param {AssetKind} allegedAK
 * @returns {void}
 */
