import { E, passStyleOf } from '@endo/far';

import { isUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';
import { prepareExoClassKit, watchPromise } from '@agoric/vat-data';
import { M } from '@agoric/store';
import {
  PaymentPKeywordRecordShape,
  SeatShape,
} from '@agoric/zoe/src/typeGuards.js';
import { AmountShape } from '@agoric/ertp/src/typeGuards.js';
import { deeplyFulfilledObject, objectMap } from '@agoric/internal';

import { UNPUBLISHED_RESULT } from './offers.js';

/**
 * @import {OfferSpec} from './offers.js';
 * @import {ContinuingOfferResult} from './types.js';
 * @import {Passable} from '@endo/pass-style';
 * @import {PromiseWatcher} from '@agoric/swingset-liveslots';
 * @import {Baggage} from '@agoric/vat-data';
 * @import {Vow, VowTools} from '@agoric/vow';
 */

/**
 * @template {any} T
 * @typedef {PromiseWatcher<T, [UserSeat]>} OfferPromiseWatcher<T, [UserSeat]
 */

/**
 * @typedef {{
 *   resultWatcher: OfferPromiseWatcher<Passable>;
 *   numWantsWatcher: OfferPromiseWatcher<number>;
 *   paymentWatcher: OfferPromiseWatcher<PaymentPKeywordRecord>;
 * }} OutcomeWatchers
 */

/** @param {VowTools} vowTools */
const makeWatchForOfferResult = ({ watch }) => {
  /**
   * @param {OutcomeWatchers} watchers
   * @param {UserSeat} seat
   * @returns {Vow<void>} Vow that resolves when offer result has been processed
   *   by the resultWatcher
   */
  const watchForOfferResult = ({ resultWatcher }, seat) => {
    // Offer result may be anything, including a Vow, so watch it durably.
    return watch(E(seat).getOfferResult(), resultWatcher, seat);
  };
  return watchForOfferResult;
};

/**
 * @param {OutcomeWatchers} watchers
 * @param {UserSeat} seat
 */
const watchForNumWants = async ({ numWantsWatcher }, seat) => {
  const p = E(seat).numWantsSatisfied();
  watchPromise(p, numWantsWatcher, seat);
  return p;
};

/**
 * @param {OutcomeWatchers} watchers
 * @param {UserSeat} seat
 */
const watchForPayout = async ({ paymentWatcher }, seat) => {
  const p = E(seat).getPayouts();
  watchPromise(p, paymentWatcher, seat);
  return p;
};

/** @param {VowTools} vowTools */
export const makeWatchOfferOutcomes = vowTools => {
  const watchForOfferResult = makeWatchForOfferResult(vowTools);
  const { when, allVows } = vowTools;
  /**
   * @param {OutcomeWatchers} watchers
   * @param {UserSeat} seat
   */
  const watchOfferOutcomes = async (watchers, seat) => {
    // Use `when` to get a promise from the vow.
    // Unlike `asPromise` this doesn't warn in case of disconnections, which is
    // fine since we actually handle the outcome durably through the watchers.
    // Only the `executeOffer` caller relies on the settlement of this promise,
    // and only in tests.
    return when(
      allVows([
        watchForOfferResult(watchers, seat),
        watchForNumWants(watchers, seat),
        watchForPayout(watchers, seat),
      ]),
    );
  };
  return watchOfferOutcomes;
};

const offerWatcherGuard = harden({
  helper: M.interface('InstanceAdminStorage', {
    updateStatus: M.call(M.any()).returns(),
    onNewContinuingOffer: M.call(
      M.or(M.number(), M.string()),
      AmountShape,
      M.any(),
    )
      .optional(M.record())
      .returns(),
    publishResult: M.call(M.any()).returns(),
    handleError: M.call(M.error()).returns(),
  }),
  paymentWatcher: M.interface('paymentWatcher', {
    onFulfilled: M.call(PaymentPKeywordRecordShape, SeatShape).returns(
      M.promise(),
    ),
    onRejected: M.call(M.any(), SeatShape).returns(),
  }),
  resultWatcher: M.interface('resultWatcher', {
    onFulfilled: M.call(M.any(), SeatShape).returns(),
    onRejected: M.call(M.any(), SeatShape).returns(),
  }),
  numWantsWatcher: M.interface('numWantsWatcher', {
    onFulfilled: M.call(M.number(), SeatShape).returns(),
    onRejected: M.call(M.any(), SeatShape).returns(),
  }),
});

/**
 * @param {Baggage} baggage
 * @param {VowTools} vowTools
 */
export const prepareOfferWatcher = (baggage, vowTools) => {
  const watchForOfferResult = makeWatchForOfferResult(vowTools);
  return prepareExoClassKit(
    baggage,
    'OfferWatcher',
    offerWatcherGuard,
    // XXX walletHelper is `any` because the helper facet is too nested to export its type
    /**
     * @param {any} walletHelper
     * @param {{ receive: (payment: Payment) => Promise<Amount> }} deposit
     * @param {OfferSpec} offerSpec
     * @param {string} address
     * @param {Amount<'set'>} invitationAmount
     * @param {UserSeat} seatRef
     */
    (walletHelper, deposit, offerSpec, address, invitationAmount, seatRef) => ({
      walletHelper,
      deposit,
      status: offerSpec,
      address,
      invitationAmount,
      seatRef,
    }),
    {
      helper: {
        /**
         * @param {Record<string, unknown>} offerStatusUpdates
         */
        updateStatus(offerStatusUpdates) {
          const { state } = this;
          state.status = harden({ ...state.status, ...offerStatusUpdates });

          state.walletHelper.updateStatus(state.status);
        },
        /**
         * @param {string} offerId
         * @param {Amount<'set'>} invitationAmount
         * @param {import('./types.js').InvitationMakers} invitationMakers
         * @param {import('./types.js').PublicSubscribers} publicSubscribers
         */
        onNewContinuingOffer(
          offerId,
          invitationAmount,
          invitationMakers,
          publicSubscribers,
        ) {
          const { state } = this;

          void state.walletHelper.addContinuingOffer(
            offerId,
            invitationAmount,
            invitationMakers,
            publicSubscribers,
          );
        },

        /** @param {Passable | ContinuingOfferResult} result */
        publishResult(result) {
          const { state, facets } = this;

          const passStyle = passStyleOf(result);
          // someday can we get TS to type narrow based on the passStyleOf result match?
          switch (passStyle) {
            case 'bigint':
            case 'boolean':
            case 'null':
            case 'number':
            case 'string':
            case 'symbol':
            case 'undefined':
              facets.helper.updateStatus({ result });
              break;
            case 'copyRecord':
              // @ts-expect-error narrowed by passStyle
              if ('invitationMakers' in result) {
                // save for continuing invitation offer

                void facets.helper.onNewContinuingOffer(
                  String(state.status.id),
                  state.invitationAmount,
                  // @ts-expect-error narrowed by passStyle
                  result.invitationMakers,
                  result.publicSubscribers,
                );
              }
              facets.helper.updateStatus({ result: UNPUBLISHED_RESULT });
              break;
            default:
              // drop the result
              facets.helper.updateStatus({ result: UNPUBLISHED_RESULT });
          }
        },
        /**
         * Called when the offer result promise rejects. The other two watchers
         * are waiting for particular values out of Zoe but they settle at the
         * same time and don't need their own error handling.
         *
         * @param {Error} err
         */
        handleError(err) {
          const { facets } = this;
          facets.helper.updateStatus({ error: err.toString() });
          const { seatRef } = this.state;
          void E.when(E(seatRef).hasExited(), hasExited => {
            if (!hasExited) {
              void E(seatRef).tryExit();
            }
          });
        },
      },

      /** @type {OutcomeWatchers['paymentWatcher']} */
      paymentWatcher: {
        async onFulfilled(payouts) {
          const { state, facets } = this;

          // This will block until all payouts succeed, but user will be updated
          // since each payout will trigger its corresponding purse notifier.
          const amountPKeywordRecord = objectMap(payouts, async paymentRef =>
            E.when(paymentRef, async payment => state.deposit.receive(payment)),
          );
          const amounts = await deeplyFulfilledObject(amountPKeywordRecord);
          facets.helper.updateStatus({ payouts: amounts });
        },
        /**
         * If promise disconnected, watch again. Or if there's an Error, handle
         * it.
         *
         * @param {Error
         *   | import('@agoric/internal/src/upgrade-api.js').UpgradeDisconnection} reason
         * @param {UserSeat} seat
         */
        onRejected(reason, seat) {
          const { facets } = this;
          if (isUpgradeDisconnection(reason)) {
            void watchForPayout(facets, seat);
          } else {
            facets.helper.handleError(reason);
          }
        },
      },

      /** @type {OutcomeWatchers['resultWatcher']} */
      resultWatcher: {
        onFulfilled(result) {
          const { facets } = this;
          facets.helper.publishResult(result);
        },
        /**
         * If promise disconnected, watch again. Or if there's an Error, handle
         * it.
         *
         * @param {Error
         *   | import('@agoric/internal/src/upgrade-api.js').UpgradeDisconnection} reason
         * @param {UserSeat} seat
         */
        onRejected(reason, seat) {
          const { facets } = this;
          if (isUpgradeDisconnection(reason)) {
            void watchForOfferResult(facets, seat);
          } else {
            facets.helper.handleError(reason);
          }
          // throw so the vow watcher propagates the rejection
          throw reason;
        },
      },

      /** @type {OutcomeWatchers['numWantsWatcher']} */
      numWantsWatcher: {
        onFulfilled(numSatisfied) {
          const { facets } = this;

          facets.helper.updateStatus({ numWantsSatisfied: numSatisfied });
        },
        /**
         * If promise disconnected, watch again.
         *
         * Errors are handled by the paymentWatcher because numWantsSatisfied()
         * and getPayouts() settle the same (they await the same promise and
         * then synchronously return a local value).
         *
         * @param {Error
         *   | import('@agoric/internal/src/upgrade-api.js').UpgradeDisconnection} reason
         * @param {UserSeat} seat
         */
        onRejected(reason, seat) {
          const { facets } = this;
          if (isUpgradeDisconnection(reason)) {
            void watchForNumWants(facets, seat);
          }
        },
      },
    },
  );
};
harden(prepareOfferWatcher);

/** @typedef {ReturnType<typeof prepareOfferWatcher>} MakeOfferWatcher */
/** @typedef {ReturnType<MakeOfferWatcher>} OfferWatcher */
