import { M } from '@agoric/store';
import { E } from '@endo/far';
import { isPromise } from '@endo/promise-kit';

import {
  AmountShape,
  BrandShape,
  DepositFacetShape,
  NotifierShape,
  PaymentShape,
} from '@agoric/ertp/src/typeGuards.js';

import '@agoric/ertp/exported.js';
import { getInterfaceGuardPayload } from '@endo/patterns';

const { Fail } = assert;

/**
 * @param {Pattern} [brandShape]
 * @param {Pattern} [amountShape]
 */
export const makeVirtualPurseKitIKit = (
  brandShape = BrandShape,
  amountShape = AmountShape,
) => {
  const VirtualPurseI = M.interface('VirtualPurse', {
    getAllegedBrand: M.callWhen().returns(brandShape),
    getCurrentAmount: M.callWhen().returns(amountShape),
    getCurrentAmountNotifier: M.callWhen().returns(NotifierShape),
    // PurseI does *not* delay `deposit` until `srcPayment` is fulfulled.
    // Rather, the semantics of `deposit` require it to provide its
    // callers with a strong guarantee that `deposit` messages are
    // processed without further delay in the order they arrive.
    // PurseI therefore requires that the `srcPayment` argument already
    // be a remotable, not a promise.
    // PurseI only calls this raw method after validating that
    // `srcPayment` is a remotable, leaving it
    // to this raw method to validate that this remotable is actually
    // a live payment of the correct brand with sufficient funds.
    deposit: M.callWhen(PaymentShape)
      .optional(M.pattern())
      .returns(amountShape),
    getDepositFacet: M.callWhen().returns(DepositFacetShape),
    withdraw: M.callWhen(amountShape).returns(PaymentShape),
    getRecoverySet: M.callWhen().returns(M.setOf(PaymentShape)),
    recoverAll: M.callWhen().returns(amountShape),
  });

  const DepositFacetI = M.interface('DepositFacet', {
    receive: getInterfaceGuardPayload(VirtualPurseI).methodGuards.deposit,
  });

  const RetainRedeemI = M.interface('RetainRedeem', {
    retain: M.callWhen(PaymentShape).optional(amountShape).returns(amountShape),
    redeem: M.callWhen(amountShape).returns(PaymentShape),
  });

  const UtilsI = M.interface('Utils', {
    retain: getInterfaceGuardPayload(RetainRedeemI).methodGuards.retain,
    redeem: getInterfaceGuardPayload(RetainRedeemI).methodGuards.redeem,
    recoverableClaim: M.callWhen(M.await(PaymentShape))
      .optional(amountShape)
      .returns(PaymentShape),
  });

  const VirtualPurseIKit = harden({
    depositFacet: DepositFacetI,
    purse: VirtualPurseI,
    escrower: RetainRedeemI,
    minter: RetainRedeemI,
    utils: UtilsI,
  });

  const VirtualPurseControllerI = M.interface('VirtualPurseController', {
    pushAmount: M.callWhen(AmountShape).returns(),
    pullAmount: M.callWhen(AmountShape).returns(),
    getBalances: M.call(BrandShape).returns(NotifierShape),
  });

  return { VirtualPurseIKit, VirtualPurseControllerI };
};

/** @import {EOnly} from '@endo/far'; */

/** @typedef {(pmt: Payment, optAmountShape?: Pattern) => Promise<Amount>} Retain */
/** @typedef {(amt: Amount) => Promise<Payment>} Redeem */

/**
 * @typedef {object} VirtualPurseController The object that determines the
 *   remote behaviour of a virtual purse.
 * @property {(amount: Amount) => Promise<void>} pushAmount Tell the controller
 *   to send an amount from "us" to the "other side". This should resolve on
 *   success and reject on failure. IT IS IMPORTANT NEVER TO FAIL in normal
 *   operation. That will irrecoverably lose assets.
 * @property {(amount: Amount) => Promise<void>} pullAmount Tell the controller
 *   to send an amount from the "other side" to "us". This should resolve on
 *   success and reject on failure. We can still recover assets from failure to
 *   pull.
 * @property {(brand: Brand) => LatestTopic<Amount>} getBalances Return the
 *   current balance iterable for a given brand.
 */

/** @param {import('@agoric/zone').Zone} zone */
const prepareVirtualPurseKit = zone =>
  zone.exoClassKit(
    'VirtualPurseKit',
    makeVirtualPurseKitIKit().VirtualPurseIKit,
    /**
     * @param {ERef<VirtualPurseController>} vpc
     * @param {{ issuer: ERef<Issuer>; brand: Brand; mint?: ERef<Mint> }} issuerKit
     * @param {{ recoveryPurse: ERef<Purse>; escrowPurse?: ERef<Purse> }} purses
     */
    (vpc, issuerKit, purses) => ({
      vpc,
      ...issuerKit,
      ...purses,
      retainerFacet: issuerKit.mint
        ? /** @type {const} */ ('minter')
        : /** @type {const} */ ('escrower'),
    }),
    {
      utils: {
        /**
         * Claim a payment for recovery via our `recoveryPurse`. No need for
         * this on the `retain` operations (since we are just burning the
         * payment or depositing it directly in the `escrowPurse`).
         *
         * @param {ERef<Payment>} payment
         * @param {Amount} [optAmountShape]
         */
        async recoverableClaim(payment, optAmountShape) {
          const {
            state: { recoveryPurse },
          } = this;
          const pmt = await payment;
          const amt = await E(recoveryPurse).deposit(pmt, optAmountShape);
          return E(recoveryPurse).withdraw(optAmountShape || amt);
        },
        /** @type {Retain} */
        async retain(payment, optAmountShape) {
          const {
            state: { retainerFacet },
            facets: { [retainerFacet]: retainer },
          } = this;
          return retainer.retain(payment, optAmountShape);
        },
        /** @type {Redeem} */
        async redeem(amount) {
          const {
            state: { retainerFacet },
            facets: { [retainerFacet]: retainer },
          } = this;
          return retainer.redeem(amount);
        },
      },
      minter: {
        /** @type {Retain} */
        async retain(payment, optAmountShape) {
          !!this.state.mint || Fail`minter cannot retain without a mint.`;
          return E(this.state.issuer).burn(payment, optAmountShape);
        },
        /** @type {Redeem} */
        async redeem(amount) {
          const {
            state: { mint },
          } = this;
          if (!mint) {
            throw Fail`minter cannot redeem without a mint.`;
          }
          return this.facets.utils.recoverableClaim(
            E(mint).mintPayment(amount),
          );
        },
      },
      escrower: {
        /** @type {Retain} */
        async retain(payment, optAmountShape) {
          const {
            state: { escrowPurse },
          } = this;
          if (!escrowPurse) {
            throw Fail`escrower cannot retain without an escrow purse.`;
          }
          return E(escrowPurse).deposit(payment, optAmountShape);
        },
        /** @type {Redeem} */
        async redeem(amount) {
          const {
            state: { escrowPurse },
          } = this;
          if (!escrowPurse) {
            throw Fail`escrower cannot redeem without an escrow purse.`;
          }
          return this.facets.utils.recoverableClaim(
            E(escrowPurse).withdraw(amount),
          );
        },
      },
      depositFacet: {
        async receive(payment, optAmountShape = undefined) {
          if (isPromise(payment)) {
            throw TypeError(
              `deposit does not accept promises as first argument. Instead of passing the promise (deposit(paymentPromise)), consider unwrapping the promise first: E.when(paymentPromise, actualPayment => deposit(actualPayment))`,
            );
          }

          const amt = await this.facets.utils.retain(payment, optAmountShape);

          // The push must always succeed.
          //
          // NOTE: There is no potential recovery protocol for failed `.pushAmount`,
          // there's no path to send a new payment back to the virtual purse holder.
          // If we don't first retain the payment, we can't be guaranteed that it is
          // the correct value, and that would be a race where somebody else might
          // claim the payment before us.
          return E(this.state.vpc)
            .pushAmount(amt)
            .then(_ => amt);
        },
      },
      purse: {
        async deposit(payment, optAmountShape) {
          return this.facets.depositFacet.receive(payment, optAmountShape);
        },
        getAllegedBrand() {
          return this.state.brand;
        },
        async getCurrentAmount() {
          const topic = E(this.state.vpc).getBalances(this.state.brand);
          return E.get(E(topic).getUpdateSince()).value;
        },
        getCurrentAmountNotifier() {
          const topic = E(this.state.vpc).getBalances(this.state.brand);
          return topic;
        },
        getDepositFacet() {
          return this.facets.depositFacet;
        },
        async withdraw(amount) {
          // Both ensure that the amount exists, and have the other side "send" it
          // to us.  If this fails, the balance is not affected and the withdraw
          // (properly) fails, too.
          await E(this.state.vpc).pullAmount(amount);
          // Amount has been successfully received from the other side.
          // Try to redeem the amount.
          const pmt = await this.facets.utils.redeem(amount).catch(async e => {
            // We can recover from failed redemptions... just send back what we
            // received.
            await E(this.state.vpc).pushAmount(amount);
            throw e;
          });
          return pmt;
        },
        getRecoverySet() {
          return E(this.state.recoveryPurse).getRecoverySet();
        },
        recoverAll() {
          return E(this.state.recoveryPurse).recoverAll();
        },
      },
    },
  );

/** @param {import('@agoric/zone').Zone} zone */
export const prepareVirtualPurse = zone => {
  const makeVirtualPurseKit = prepareVirtualPurseKit(zone);

  /**
   * @param {ERef<VirtualPurseController>} vpc the controller that represents
   *   the "other side" of this purse.
   * @param {{
   *   issuer: ERef<Issuer>;
   *   brand: Brand;
   *   mint?: ERef<Mint>;
   *   escrowPurse?: ERef<Purse>;
   * }} params
   *   the contents of the issuer kit for "us".
   *
   *   If the mint is not specified, then the virtual purse will escrow local
   *   assets instead of minting/burning them. That is a better option in
   *   general, but escrow doesn't support the case where the "other side" is
   *   also minting assets... our escrow purse may not have enough assets in it
   *   to redeem the ones that are sent from the "other side".
   * @returns {Promise<Awaited<EOnly<Purse>>>} This is not just a Purse because
   *   it plays fast-and-loose with the synchronous Purse interface. So, the
   *   consumer of this result must only interact with the virtual purse via
   *   eventual-send (to conceal the methods that are returning promises instead
   *   of synchronously).
   */
  const makeVirtualPurse = async (
    vpc,
    { escrowPurse: defaultEscrowPurse, ...issuerKit },
  ) => {
    const [recoveryPurse, escrowPurse] = await Promise.all([
      E(issuerKit.issuer).makeEmptyPurse(),
      // If we can't mint, then we need to escrow.
      issuerKit.mint
        ? defaultEscrowPurse
        : defaultEscrowPurse || E(issuerKit.issuer).makeEmptyPurse(),
    ]);
    const vpurse = makeVirtualPurseKit(vpc, issuerKit, {
      recoveryPurse,
      escrowPurse,
    }).purse;
    return vpurse;
  };

  return makeVirtualPurse;
};

harden(prepareVirtualPurse);
