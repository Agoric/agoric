/* eslint @typescript-eslint/no-floating-promises: "warn" */
import '../types-ambient.js';

import { prepareDurablePublishKit, SubscriberShape } from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { M, prepareExoClassKit } from '@agoric/vat-data';
import { deeplyFulfilled } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';

import { satisfiesWant } from '../contractFacet/offerSafety.js';
import '../internal-types.js';
import {
  AmountKeywordRecordShape,
  KeywordShape,
  ExitObjectShape,
  PaymentPKeywordRecordShape,
} from '../typeGuards.js';

const { Fail } = assert;

const ZoeSeatIKit = harden({
  zoeSeatAdmin: M.interface('ZoeSeatAdmin', {
    replaceAllocation: M.call(AmountKeywordRecordShape).returns(),
    exit: M.call(M.any()).returns(),
    fail: M.call(M.any()).returns(),
    resolveExitAndResult: M.call({
      offerResultPromise: M.promise(),
      exitObj: ExitObjectShape,
    }).returns(),
    getExitSubscriber: M.call().returns(SubscriberShape),
    // The return promise is empty, but doExit relies on settlement as a signal
    // that the payouts have settled. The exit publisher is notified after that.
    finalPayouts: M.call(M.eref(PaymentPKeywordRecordShape)).returns(
      M.promise(),
    ),
  }),
  userSeat: M.interface('UserSeat', {
    getProposal: M.call().returns(M.promise()),
    getPayouts: M.call().returns(M.promise()),
    getPayout: M.call(KeywordShape).returns(M.promise()),
    getOfferResult: M.call().returns(M.promise()),
    hasExited: M.call().returns(M.promise()),
    tryExit: M.call().returns(M.promise()),
    numWantsSatisfied: M.call().returns(M.promise()),
    getFinalAllocation: M.call().returns(M.promise()),
    getExitSubscriber: M.call().returns(M.any()),
  }),
});

const assertHasNotExited = (c, msg) => {
  !c.state.instanceAdminHelper.hasExited(c.facets.zoeSeatAdmin) ||
    assert(!c.state.instanceAdminHelper.hasExited(c.facets.zoeSeatAdmin), msg);
};

/**
 * makeZoeSeatAdminFactory returns a maker for an object that manages the state
 * of a seat participating in a Zoe contract and return its two facets.
 *
 * The UserSeat is suitable to be handed to an agent outside zoe and the
 * contract and allows them to query or monitor the current state, access the
 * payouts and result, and call exit() if that's allowed for this seat.
 *
 * The zoeSeatAdmin is passed by Zoe to the ContractFacet (zcf), to allow zcf to
 * query or update the allocation or exit the seat cleanly.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const makeZoeSeatAdminFactory = baggage => {
  const makeDurablePublishKit = prepareDurablePublishKit(
    baggage,
    'zoe Seat publisher',
  );

  const doExit = (
    zoeSeatAdmin,
    currentAllocation,
    withdrawFacet,
    instanceAdminHelper,
  ) => {
    /** @type {PaymentPKeywordRecord} */
    const payouts = withdrawFacet.withdrawPayments(currentAllocation);
    return E.when(
      zoeSeatAdmin.finalPayouts(payouts),
      () => instanceAdminHelper.exitZoeSeatAdmin(zoeSeatAdmin),
      () => instanceAdminHelper.exitZoeSeatAdmin(zoeSeatAdmin),
    );
  };

  // There is a race between resolveExitAndResult() and getOfferResult() that
  // can be limited to when the adminFactory is paged in. If state.offerResult
  // is defined, getOfferResult will return it. If it's not defined when
  // getOfferResult is called, create a promiseKit, return the promise and store
  // the kit here. When resolveExitAndResult() is called, it saves
  // state.offerResult and resolves the promise if it exists, then removes the
  // table entry.
  /**
   * @typedef {WeakMap<ZCFSeat, unknown>}
   */
  const ephemeralOfferResultStore = new WeakMap();

  return prepareExoClassKit(
    baggage,
    'ZoeSeatKit',
    ZoeSeatIKit,
    /**
     *
     * @param {Allocation} initialAllocation
     * @param {ProposalRecord} proposal
     * @param {InstanceAdminHelper} instanceAdminHelper
     * @param {WithdrawFacet} withdrawFacet
     * @param {ERef<ExitObj>} [exitObj]
     * @param {boolean} [offerResultIsUndefined]
     */
    (
      initialAllocation,
      proposal,
      instanceAdminHelper,
      withdrawFacet,
      exitObj = undefined,
      // emptySeatKits start with offerResult validly undefined; others can set
      // it to anything (including undefined) in resolveExitAndResult()
      offerResultIsUndefined = false,
    ) => {
      const { publisher, subscriber } = makeDurablePublishKit();
      return {
        currentAllocation: initialAllocation,
        proposal,
        exitObj,
        offerResult: undefined,
        offerResultStored: offerResultIsUndefined,
        instanceAdminHelper,
        withdrawFacet,
        publisher,
        subscriber,
        payouts: harden({}),
        exiting: false,
      };
    },
    {
      zoeSeatAdmin: {
        replaceAllocation(replacementAllocation) {
          const { state } = this;
          assertHasNotExited(
            this,
            'Cannot replace allocation. Seat has already exited',
          );
          harden(replacementAllocation);
          // Merging happens in ZCF, so replacementAllocation can
          // replace the old allocation entirely.

          state.currentAllocation = replacementAllocation;
        },
        exit(completion) {
          const { state, facets } = this;
          // Since this method doesn't wait, we could re-enter via exitAllSeats.
          // If that happens, we shouldn't re-do any of the work.
          if (state.exiting) {
            return;
          }
          assertHasNotExited(this, 'Cannot exit seat. Seat has already exited');

          state.exiting = true;
          E.when(
            doExit(
              facets.zoeSeatAdmin,
              state.currentAllocation,
              state.withdrawFacet,
              state.instanceAdminHelper,
            ),
            () => state.publisher.finish(completion),
          );
        },
        fail(reason) {
          const { state, facets } = this;
          // Since this method doesn't wait, we could re-enter via failAllSeats.
          // If that happens, we shouldn't re-do any of the work.
          if (state.exiting) {
            return;
          }

          assertHasNotExited(this, 'Cannot fail seat. Seat has already exited');

          state.exiting = true;
          E.when(
            doExit(
              facets.zoeSeatAdmin,
              state.currentAllocation,
              state.withdrawFacet,
              state.instanceAdminHelper,
            ),
            () => state.publisher.fail(reason),
            () => state.publisher.fail(reason),
          );
        },
        // called only for seats resulting from offers.
        /** @param {HandleOfferResult} result */
        resolveExitAndResult({ offerResultPromise, exitObj }) {
          const { state, facets } = this;

          !state.offerResultStored ||
            Fail`offerResultStored before offerResultPromise`;

          if (!ephemeralOfferResultStore.has(facets.userSeat)) {
            // this was called before getOfferResult
            const kit = makePromiseKit();
            kit.resolve(offerResultPromise);
            ephemeralOfferResultStore.set(facets.userSeat, kit);
          }

          const pKit = ephemeralOfferResultStore.get(facets.userSeat);
          E.when(
            offerResultPromise,
            offerResult => {
              // Resolve the ephemeral promise for offerResult
              pKit.resolve(offerResult);
              // Now we want to store the offerResult in `state` to get it off the heap,
              // but we need to handle three cases:
              //   1. already durable. (This includes being a remote presence.)
              //   2. has promises for durable objects.
              //   3. not durable even after resolving promises.
              // For #1 we can assign directly, but we deeply await to also handle #2.
              void E.when(
                deeplyFulfilled(offerResult),
                fulfilledOfferResult => {
                  try {
                    // In cases 1-2 this assignment will succeed.
                    state.offerResult = fulfilledOfferResult;
                    // If it doesn't, then these lines won't be reached so the
                    // flag will stay false and the promise will stay in the heap
                    state.offerResultStored = true;
                    ephemeralOfferResultStore.delete(facets.userSeat);
                  } catch (err) {
                    console.warn(
                      `non-durable offer result will be lost upon zoe vat termination: ${offerResult}`,
                    );
                  }
                },
                // no rejection handler because an offer result containing promises that reject
                // is within spec
              );
            },
            e => {
              pKit.reject(e);
              // NB: leave the rejected promise in the ephemeralOfferResultStore
              // because it can't go in durable state
            },
          );

          state.exitObj = exitObj;
        },
        getExitSubscriber() {
          const { state } = this;
          return state.subscriber;
        },
        async finalPayouts(payments) {
          const { state } = this;

          const settledPayouts = await deeplyFulfilled(payments);
          state.payouts = settledPayouts;
        },
      },
      userSeat: {
        async getProposal() {
          const { state } = this;
          return state.proposal;
        },
        async getPayouts() {
          const { state } = this;

          return E.when(
            state.subscriber.subscribeAfter(),
            () => state.payouts,
            () => state.payouts,
          );
        },
        async getPayout(keyword) {
          const { state } = this;

          // subscriber.subscribeAfter() only triggers after publisher.finish()
          // in exit() or publisher.fail() in fail(). Both of those wait for
          // doExit(), which ensures that finalPayouts() has set state.payouts.
          return E.when(
            state.subscriber.subscribeAfter(),
            () => state.payouts[keyword],
            () => state.payouts[keyword],
          );
        },

        async getOfferResult() {
          const { state, facets } = this;

          if (state.offerResultStored) {
            return state.offerResult;
          }

          if (ephemeralOfferResultStore.has(facets.userSeat)) {
            return ephemeralOfferResultStore.get(facets.userSeat).promise;
          }

          const kit = makePromiseKit();
          ephemeralOfferResultStore.set(facets.userSeat, kit);
          return kit.promise;
        },
        async hasExited() {
          const { state, facets } = this;

          return (
            state.exiting ||
            state.instanceAdminHelper.hasExited(facets.zoeSeatAdmin)
          );
        },
        async tryExit() {
          const { state } = this;
          if (!state.exitObj)
            throw Fail`exitObj must be initialized before use`;
          assertHasNotExited(this, 'Cannot exit; seat has already exited');

          return E(state.exitObj).exit();
        },
        async numWantsSatisfied() {
          const { state } = this;
          return E.when(
            state.subscriber.subscribeAfter(),
            () => satisfiesWant(state.proposal, state.currentAllocation),
            () => satisfiesWant(state.proposal, state.currentAllocation),
          );
        },
        getExitSubscriber() {
          const { state } = this;
          return state.subscriber;
        },
        getFinalAllocation() {
          const { state } = this;
          return E.when(
            state.subscriber.subscribeAfter(),
            () => state.currentAllocation,
            () => state.currentAllocation,
          );
        },
      },
    },
  );
};
