import type { LatestTopic } from '@agoric/notifier';
import type { ERef } from '@endo/far';
import type { RemotableObject, CopyTagged } from '@endo/pass-style';
import type { CopyBag, CopySet, Key, Pattern, Limits } from '@endo/patterns';
import type { TypeTag } from '@agoric/internal/src/tagged.js';
import type { AssetKind } from './amountMath.js';

export type { AssetKind } from './amountMath.js';

export type NatAmount = {
  brand: Brand<'nat'>;
  value: bigint;
};
export type SetAmount<K extends Key> = {
  brand: Brand<'set'>;
  value: K[];
};
export type CopySetAmount<K extends Key> = {
  brand: Brand<'copySet'>;
  value: CopySet<K>;
};
export type CopyBagAmount<K extends Key> = {
  brand: Brand<'copyBag'>;
  value: CopyBag<K>;
};
export type AnyAmount = {
  brand: Brand<any>;
  value: any;
};
/**
 * Amounts are descriptions of digital assets, answering the questions "how
 * much" and "of what kind". Amounts are values labeled with a brand.
 * AmountMath executes the logic of how amounts are changed when digital
 * assets are merged, separated, or otherwise manipulated. For example, a
 * deposit of 2 bucks into a purse that already has 3 bucks gives a new purse
 * balance of 5 bucks. An empty purse has 0 bucks. AmountMath relies heavily
 * on polymorphic MathHelpers, which manipulate the unbranded portion.
 */
export type Amount<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = K extends 'nat'
  ? NatAmount
  : K extends 'set'
    ? SetAmount<M>
    : K extends 'copySet'
      ? CopySetAmount<M>
      : K extends 'copyBag'
        ? CopyBagAmount<M>
        : AnyAmount;
/**
 * An `AmountValue` describes a set or quantity of assets that can be owned or
 * shared.
 *
 * A fungible `AmountValue` uses a non-negative bigint to represent a quantity
 * of that many assets.
 *
 * A non-fungible `AmountValue` uses an array or CopySet of `Key`s to represent
 * a set of whatever asset each key represents. A `Key` is a passable value
 * that can be used as an element in a set (SetStore or CopySet) or as the key
 * in a map (MapStore or CopyMap).
 *
 * `SetValue` is for the deprecated set representation, using an array directly
 * to represent the array of its elements. `CopySet` is the proper
 * representation using a CopySet.
 *
 * A semi-fungible `CopyBag` is represented as a `CopyBag` of `Key` objects.
 * "Bag" is synonymous with MultiSet, where an element of a bag can be present
 * once or more times, i.e., some positive bigint number of times,
 * representing that quantity of the asset represented by that key.
 */
export type AmountValue = NatValue | SetValue | CopySet | CopyBag;

/**
 * See doc-comment
 *   for `AmountValue`.
 */
export type AssetValueForKind<
  K extends AssetKind,
  M extends Key = Key,
> = K extends 'nat'
  ? NatValue
  : K extends 'set'
    ? SetValue<M>
    : K extends 'copySet'
      ? CopySet<M>
      : K extends 'copyBag'
        ? CopyBag<M>
        : never;

export type AssetKindForValue<V extends AmountValue> = V extends NatValue
  ? 'nat'
  : V extends SetValue
    ? 'set'
    : V extends CopySet
      ? 'copySet'
      : V extends CopyBag
        ? 'copyBag'
        : never;

export type AmountValueHasBound = CopyTagged<
  'match:has',
  [elementPatt: Pattern, countPatt: bigint, limits?: Limits]
>;

export type AmountValueBound<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = AssetValueForKind<K, M> | AmountValueHasBound;

export type AmountBound<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = {
  brand: Brand<K>;
  value: AmountValueBound<K, M>;
};

export type Ratio = { numerator: Amount<'nat'>; denominator: Amount<'nat'> };

/** @deprecated */
export type DisplayInfo<K extends AssetKind = AssetKind> = {
  /**
   * Tells the display software how many
   * decimal places to move the decimal over to the left, or in other words,
   * which position corresponds to whole numbers. We require fungible digital
   * assets to be represented in integers, in the smallest unit (i.e. USD might
   * be represented in mill, a thousandth of a dollar. In that case,
   * `decimalPlaces` would be 3.) This property is optional, and for
   * non-fungible digital assets, should not be specified. The decimalPlaces
   * property should be used for _display purposes only_. Any other use is an
   * anti-pattern.
   */
  decimalPlaces?: number | undefined;
  /**
   * - the kind of asset, either AssetKind.NAT (fungible)
   * or AssetKind.SET or AssetKind.COPY_SET (non-fungible)
   */
  assetKind: K;
};
export type BrandMethods<K extends AssetKind> = {
  /**
   *   Should be used with `issuer.getBrand` to ensure an issuer and brand match.
   */
  isMyIssuer: (allegedIssuer: ERef<Issuer<K>>) => Promise<boolean>;
  getAllegedName: () => string;
  /** @deprecated look up in boardAux */
  getDisplayInfo: () => DisplayInfo<K>;
  getAmountShape: () => Pattern;
};
/**
 * The brand identifies the
 *   kind of issuer, and has a function to get the alleged name for the kind of
 *   asset described. The alleged name (such as 'BTC' or 'moola') is provided by
 *   the maker of the issuer and should not be trusted as accurate.
 *
 *   Every amount created by a particular issuer will share the same brand, but
 *   recipients cannot rely on the brand to verify that a purported amount
 *   represents the issuer they intended, since the same brand can be reused by
 *   a misbehaving issuer.
 */
export type Brand<K extends AssetKind = AssetKind> = RemotableObject &
  BrandMethods<K>;
/**
 * Return true if the payment continues to exist.
 *
 *   If the payment is a promise, the operation will proceed upon fulfillment.
 */
export type IssuerIsLive = (payment: ERef<Payment>) => Promise<boolean>;
/**
 * Get the amount of digital assets in the payment.
 *   Because the payment is not trusted, we cannot call a method on it directly,
 *   and must use the issuer instead.
 *
 *   If the payment is a promise, the operation will proceed upon fulfillment.
 */
export type IssuerGetAmountOf<K extends AssetKind, M extends Key = Key> = (
  payment: ERef<Payment<K, M>>,
) => Promise<Amount<K, M>>;
/**
 * Burn all of the digital assets in the payment.
 *   `optAmountShape` is optional. If the `optAmountShape` pattern is present,
 *   the amount of the digital assets in the payment must match
 *   `optAmountShape`, to prevent sending the wrong payment and other
 *   confusion.
 *
 *   If the payment is a promise, the operation will proceed upon fulfillment.
 *
 *   As always with optional `Pattern` arguments, keep in mind that technically
 *   the value `undefined` itself is a valid `Key` and therefore a valid
 *   `Pattern`. But in optional pattern position, a top level `undefined` will
 *   be interpreted as absence. If you want to express a `Pattern` that will
 *   match only `undefined`, use `M.undefined()` instead.
 */
export type IssuerBurn = (
  payment: ERef<Payment>,
  optAmountShape?: Pattern,
) => Promise<Amount>;
/**
 * Work around JSDoc union handling
 */
export type IssuerMethods<K extends AssetKind, M extends Key> = {
  /**
   * Get the Brand for this Issuer. The Brand
   * indicates the type of digital asset and is shared by the mint, the issuer,
   * and any purses and payments of this particular kind. The brand is not
   * closely held, so this function should not be trusted to identify an issuer
   * alone. Fake digital assets and amount can use another issuer's brand.
   */
  getBrand: () => Brand<K>;
  /**
   * Get the allegedName for this
   * mint/issuer
   */
  getAllegedName: () => string;
  /**
   * Get the kind of MathHelpers used by this
   * Issuer.
   */
  getAssetKind: () => K;
  /** @deprecated look up in boardAux */
  getDisplayInfo: () => DisplayInfo<K>;
  /**
   * Make an empty purse of this
   * brand.
   */
  makeEmptyPurse: () => Purse<K, M>;
  isLive: IssuerIsLive;
  getAmountOf: IssuerGetAmountOf<K, M>;
  burn: IssuerBurn;
};
/**
 * The issuer cannot
 *   mint a new amount, but it can create empty purses and payments. The issuer
 *   can also transform payments (splitting payments, combining payments,
 *   burning payments, and claiming payments exclusively). The issuer should be
 *   gotten from a trusted source and then relied upon as the decider of whether
 *   an untrusted payment is valid.
 */
export type Issuer<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = RemotableObject & IssuerMethods<K, M>;
export type PaymentLedger<K extends AssetKind = AssetKind> = {
  mint: Mint<K>;
  /**
   * Externally useful only if this issuer
   * uses recovery sets. Can be used to get the recovery set associated with
   * minted payments that are still live.
   */
  mintRecoveryPurse: Purse<K>;
  issuer: Issuer<K>;
  brand: Brand<K>;
};
export type IssuerKit<K extends AssetKind = AssetKind, M extends Key = Key> = {
  mint: Mint<K, M>;
  /**
   * Externally useful only if this
   * issuer uses recovery sets. Can be used to get the recovery set associated
   * with minted payments that are still live.
   */
  mintRecoveryPurse: Purse<K, M>;
  issuer: Issuer<K, M>;
  brand: Brand<K>;
  displayInfo: DisplayInfo;
};
export type AdditionalDisplayInfo = {
  /**
   * Tells the display software how many
   * decimal places to move the decimal over to the left, or in other words,
   * which position corresponds to whole numbers. We require fungible digital
   * assets to be represented in integers, in the smallest unit (i.e. USD might
   * be represented in mill, a thousandth of a dollar. In that case,
   * `decimalPlaces` would be 3.) This property is optional, and for
   * non-fungible digital assets, should not be specified. The decimalPlaces
   * property should be used for _display purposes only_. Any other use is an
   * anti-pattern.
   */
  decimalPlaces?: number | undefined;
  assetKind?: AssetKind | undefined;
};
/**
 * Holding a Mint carries the right to issue new digital
 *   assets. These assets all have the same kind, which is called a Brand.
 */
export type Mint<K extends AssetKind = AssetKind, M extends Key = Key> = {
  /**
   * Gets the Issuer for this mint.
   */
  getIssuer: () => Issuer<K, M>;
  /**
   * Creates a new
   * Payment containing newly minted amount.
   */
  mintPayment: (newAmount: Amount<K>) => Payment<K, M>;
};
/**
 * Issuers first became durable with mandatory recovery sets. Later they were
 * made optional, but there is no support for converting from one state to the
 * other. Thus, absence of a `RecoverySetsOption` state is equivalent to
 * `'hasRecoverySets'`. In the absence of a `recoverySetsOption` parameter,
 * upgradeIssuerKit defaults to the predecessor's `RecoverySetsOption` state, or
 * `'hasRecoverySets'` if none.
 *
 * At this time, issuers started in one of the states (`'noRecoverySets'`, or
 * `'hasRecoverySets'`) cannot be converted to the other on upgrade. If this
 * transition is needed, it can likely be supported in a future upgrade. File an
 * issue on github and explain what you need and why.
 */
export type RecoverySetsOption = 'hasRecoverySets' | 'noRecoverySets';
export type DepositFacetReceive = (
  payment: Payment,
  optAmountShape?: Pattern,
) => Amount;
export type DepositFacet = {
  /**
   * Deposit all the contents of payment
   * into the purse that made this facet, returning the amount. If the optional
   * argument `optAmount` does not equal the amount of digital assets in the
   * payment, throw an error.
   *
   * If payment is a promise, throw an error.
   */
  receive: DepositFacetReceive;
};
/**
 * Purses hold amount of
 *   digital assets of the same brand, but unlike Payments, they are not meant
 *   to be sent to others. To transfer digital assets, a Payment should be
 *   withdrawn from a Purse. The amount of digital assets in a purse can change
 *   through the action of deposit() and withdraw().
 */
export type Purse<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = RemotableObject & PurseMethods<K, M>;
/**
 * The primary use for Purses and Payments is for
 *   currency-like and goods-like digital assets, but they can also be used to
 *   represent other kinds of rights, such as the right to participate in a
 *   particular contract.
 */
export type PurseMethods<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = {
  /**
   * Get the alleged Brand for this
   * Purse
   */
  getAllegedBrand: () => Brand<K>;
  /**
   * Get the amount contained in
   * this purse.
   */
  getCurrentAmount: () => Amount<K, M>;
  /**
   * Get a
   * lossy notifier for changes to this purse's balance.
   */
  getCurrentAmountNotifier: () => LatestTopic<Amount<K, M>>;
  /**
   *   Deposit all the contents of payment into this purse, returning the amount. If
   *   the optional argument `optAmount` does not equal the amount of digital
   *   assets in the payment, throw an error.
   *
   *   If payment is a promise, throw an error.
   */
  deposit: <P extends Payment<K, M>>(
    payment: P,
    optAmountShape?: Pattern,
  ) => P extends Payment<K, M> ? Amount<K, M> : never;
  /**
   * Return an object whose
   * `receive` method deposits to the current Purse.
   */
  getDepositFacet: () => DepositFacet;
  /**
   * Withdraw amount
   * from this purse into a new Payment.
   */
  withdraw: (amount: Amount<K, M>) => Payment<K, M>;
  /**
   * The set of payments
   * withdrawn from this purse that are still live. These are the payments that
   * can still be recovered in emergencies by, for example, depositing into this
   * purse. Such a deposit action is like canceling an outstanding check because
   * you're tired of waiting for it. Once your cancellation is acknowledged, you
   * can spend the assets at stake on other things. Afterwards, if the recipient
   * of the original check finally gets around to depositing it, their deposit
   * fails.
   *
   * Returns an empty set if this issuer does not support recovery sets.
   */
  getRecoverySet: () => CopySet<Payment<K, M>>;
  /**
   * For use in emergencies, such as
   * coming back from a traumatic crash and upgrade. This deposits all the
   * payments in this purse's recovery set into the purse itself, returning the
   * total amount of assets recovered.
   *
   * Returns an empty amount if this issuer does not support recovery sets.
   */
  recoverAll: () => Amount<K, M>;
};
/**
 * Payments hold amount
 *   of digital assets of the same brand in transit. Payments can be deposited
 *   in purses, split into multiple payments, combined, and claimed (getting an
 *   exclusive payment). Payments are linear, meaning that either a payment has
 *   the same amount of digital assets it started with, or it is used up
 *   entirely. It is impossible to partially use a payment.
 *
 *   Payments are often received from other actors and therefore should not be
 *   trusted themselves. To get the amount of digital assets in a payment, use
 *   the trusted issuer: issuer.getAmountOf(payment),
 *
 *   Payments can be converted to Purses by getting a trusted issuer and calling
 *   `issuer.makeEmptyPurse()` to create a purse, then
 *   `purse.deposit(payment)`.
 */
export type Payment<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
> = RemotableObject &
  TypeTag<
    {
      /**
       * Get the allegedBrand, indicating
       * the type of digital asset this payment purports to be, and which issuer to
       * use. Because payments are not trusted, any method calls on payments should
       * be treated with suspicion and verified elsewhere.
       */
      getAllegedBrand: () => Brand<K>;
    },
    'Set-like value type',
    M
  >;

/**
 * All of the difference in how digital asset
 *   amount are manipulated can be reduced to the behavior of the math on
 *   values. We extract this custom logic into mathHelpers. MathHelpers are
 *   about value arithmetic, whereas AmountMath is about amounts, which are the
 *   values labeled with a brand. AmountMath use mathHelpers to do their value
 *   arithmetic, and then brand the results, making a new amount.
 *
 *   The MathHelpers are designed to be called only from AmountMath, and so all
 *   methods but coerce can assume their inputs are valid. They only need to do
 *   output validation, and only when there is a possibility of invalid output.
 */
export type MathHelpers<
  K extends AssetKind = AssetKind,
  M extends Key = Key,
  V extends AssetValueForKind<K, M> = AssetValueForKind<K, M>,
  VBound extends AmountValueHasBound = AmountValueHasBound,
> = {
  /**
   * Check the kind of this value and
   * throw if it is not the expected kind.
   */
  doCoerce: (allegedValue: V) => V;
  /**
   * Get the representation for the identity
   * element (often 0 or an empty array)
   */
  doMakeEmpty: () => V;
  /**
   * Is the value the identity
   * element?
   */
  doIsEmpty: (value: V) => boolean;
  /**
   * Is the left greater than
   * or equal to the right bound?
   */
  doIsGTE: (left: V, rightBound: VBound) => boolean;
  /**
   * Does left equal right?
   */
  doIsEqual: (left: V, right: V) => boolean;
  /**
   * Return the left combined with the
   * right.
   */
  doAdd: (left: V, right: V) => V;
  /**
   * Return what remains after
   * removing the right from the left. If something in the right was not in the
   * left, we throw an error.
   */
  doSubtract: (left: V, rightBound: VBound) => V;
};
export type NatValue = bigint;
export type SetValue<K extends Key = Key> = K[];
