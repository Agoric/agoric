import { Fail } from '@endo/errors';
import { prepareDurablePublishKit } from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { M, prepareExoClassKit } from '@agoric/vat-data';
import { deeplyFulfilled } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { NonNullish } from '@agoric/internal';

import { satisfiesWant } from '../contractFacet/offerSafety.js';
import '../types-ambient.js';
import '../internal-types.js';
import {
  declareOldZoeSeatAdminKind,
  OriginalZoeSeatIKit,
  ZoeUserSeatShape,
  coreUserSeatMethods,
} from './originalZoeSeat.js';

// ZoeSeatAdmin has the implementation of coreUserSeatMethods, but ZoeUserSeat
// is the facet shared with users. The latter transparently forwards to the
// former.

const ZoeSeatAdmin = harden({
  userSeatAccess: M.interface('UserSeatAccess', {
    ...coreUserSeatMethods,
    initExitObjectSetter: M.call(M.any()).returns(),
    assertHasNotExited: M.call(M.string()).returns(),
  }),
  zoeSeatAdmin: OriginalZoeSeatIKit.zoeSeatAdmin,
});

const ZoeUserSeat = harden({
  userSeat: ZoeUserSeatShape,
  exitObjSetter: M.interface('exitObjSetter', {
    setExitObject: M.call(M.or(M.remotable(), M.undefined())).returns(),
  }),
});

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

  declareOldZoeSeatAdminKind(baggage, makeDurablePublishKit);

  const doExit = async (
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

  const makeZoeSeatAdmin = prepareExoClassKit(
    baggage,
    'ZoeSeatAdmin',
    ZoeSeatAdmin,
    /**
     * @param {Allocation} initialAllocation
     * @param {ProposalRecord} proposal
     * @param {InstanceAdminHelper} instanceAdminHelper
     * @param {WithdrawFacet} withdrawFacet
     * @param {boolean} [offerResultIsUndefined]
     */
    (
      initialAllocation,
      proposal,
      instanceAdminHelper,
      withdrawFacet,
      // emptySeatKits start with offerResult validly undefined; others can set
      // it to anything (including undefined) in resolveExitAndResult()
      offerResultIsUndefined = false,
    ) => {
      const { publisher, subscriber } = makeDurablePublishKit();
      return {
        currentAllocation: initialAllocation,
        proposal,
        offerResult: /** @type {any} */ (undefined),
        offerResultStored: offerResultIsUndefined,
        instanceAdminHelper,
        withdrawFacet,
        publisher,
        subscriber,
        payouts: harden({}),
        exiting: false,
        /** @type {{ setExitObject: (exitObj: ExitObj | undefined) => void} | undefined} */
        exitObjectSetter: undefined,
      };
    },
    {
      // methods for userSeat to call
      userSeatAccess: {
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
            () =>
              NonNullish(state.payouts[keyword], `No payout for "${keyword}"`),
            () =>
              NonNullish(state.payouts[keyword], `No payout for "${keyword}"`),
          );
        },

        async getOfferResult() {
          const { state, facets } = this;

          if (state.offerResultStored) {
            return state.offerResult;
          }

          if (ephemeralOfferResultStore.has(facets.zoeSeatAdmin)) {
            return ephemeralOfferResultStore.get(facets.zoeSeatAdmin).promise;
          }

          const kit = makePromiseKit();
          ephemeralOfferResultStore.set(facets.zoeSeatAdmin, kit);
          return kit.promise;
        },
        async hasExited() {
          const { state, facets } = this;

          return (
            state.exiting ||
            state.instanceAdminHelper.hasExited(facets.zoeSeatAdmin)
          );
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
        initExitObjectSetter(setter) {
          this.state.exitObjectSetter = setter;
        },
        assertHasNotExited(msg) {
          const { state, facets } = this;
          const { instanceAdminHelper } = state;
          const hasExited1 = instanceAdminHelper.hasExited(facets.zoeSeatAdmin);

          !hasExited1 || assert(!hasExited1, msg);
        },
      },
      zoeSeatAdmin: {
        replaceAllocation(replacementAllocation) {
          const { state, facets } = this;
          facets.userSeatAccess.assertHasNotExited(
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
          facets.userSeatAccess.assertHasNotExited(
            'Cannot exit seat. Seat has already exited',
          );

          state.exiting = true;
          void E.when(
            doExit(
              facets.zoeSeatAdmin,
              state.currentAllocation,
              state.withdrawFacet,
              state.instanceAdminHelper,
            ),
            () => {
              if (state.exitObjectSetter) {
                state.exitObjectSetter.setExitObject(undefined);
                state.exitObjectSetter = undefined;
              }
              return state.publisher.finish(completion);
            },
          );
        },
        fail(reason) {
          const { state, facets } = this;
          // Since this method doesn't wait, we could re-enter via failAllSeats.
          // If that happens, we shouldn't re-do any of the work.
          if (state.exiting) {
            return;
          }

          facets.userSeatAccess.assertHasNotExited(
            'Cannot fail seat. Seat has already exited',
          );

          state.exiting = true;
          void E.when(
            doExit(
              facets.zoeSeatAdmin,
              state.currentAllocation,
              state.withdrawFacet,
              state.instanceAdminHelper,
            ),
            () => state.publisher.fail(reason),
            () => state.publisher.fail(reason),
          );

          if (state.exitObjectSetter) {
            state.exitObjectSetter.setExitObject(undefined);
            state.exitObjectSetter = undefined;
          }
        },
        // called only for seats resulting from offers.
        /** @param {HandleOfferResult} result */
        resolveExitAndResult({ offerResultPromise, exitObj }) {
          const { state, facets } = this;

          !state.offerResultStored ||
            Fail`offerResultStored before offerResultPromise`;

          if (!ephemeralOfferResultStore.has(facets.zoeSeatAdmin)) {
            // this was called before getOfferResult
            const kit = makePromiseKit();
            kit.resolve(offerResultPromise);
            ephemeralOfferResultStore.set(facets.zoeSeatAdmin, kit);
          }

          const pKit = ephemeralOfferResultStore.get(facets.zoeSeatAdmin);
          void E.when(
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
                    ephemeralOfferResultStore.delete(facets.zoeSeatAdmin);
                  } catch (err) {
                    console.warn(
                      'non-durable offer result will be lost upon zoe vat termination:',
                      offerResult,
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

          // @ts-expect-error exitObjectSetter is set at birth.
          state.exitObjectSetter.setExitObject(exitObj);
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
    },
  );

  const makeUserSeat = prepareExoClassKit(
    baggage,
    'ZoeUserSeat',
    ZoeUserSeat,
    (userSeatAccess, exitObj) => {
      return {
        userSeatAccess,
        exitObj,
      };
    },
    {
      userSeat: {
        async getProposal() {
          return this.state.userSeatAccess.getProposal();
        },
        async getPayouts() {
          return this.state.userSeatAccess.getPayouts();
        },
        async getPayout(keyword) {
          return this.state.userSeatAccess.getPayout(keyword);
        },

        async getOfferResult() {
          return this.state.userSeatAccess.getOfferResult();
        },
        async hasExited() {
          return this.state.userSeatAccess.hasExited();
        },
        async tryExit() {
          const { state } = this;

          state.userSeatAccess.assertHasNotExited(
            'Cannot exit; seat has already exited',
          );
          if (!state.exitObj)
            throw Fail`exitObj not initialized or already nullified`;

          const exitResult = E(state.exitObj).exit();

          // unlink an un-collectible cycle.
          state.exitObj = undefined;

          return exitResult;
        },
        async numWantsSatisfied() {
          return this.state.userSeatAccess.numWantsSatisfied();
        },
        getExitSubscriber() {
          return this.state.userSeatAccess.getExitSubscriber();
        },
        getFinalAllocation() {
          return this.state.userSeatAccess.getFinalAllocation();
        },
      },
      exitObjSetter: {
        setExitObject(exitObject) {
          this.state.exitObj = exitObject;
        },
      },
    },
  );

  /**
   * @param {Allocation} initialAllocation
   * @param {ProposalRecord} proposal
   * @param {InstanceAdminHelper} instanceAdminHelper
   * @param {WithdrawFacet} withdrawFacet
   * @param {ERef<ExitObj>} [exitObj]
   * @param {boolean} [offerResultIsUndefined]
   */
  const makeZoeSeatAdminKit = (
    initialAllocation,
    proposal,
    instanceAdminHelper,
    withdrawFacet,
    exitObj = undefined,
    offerResultIsUndefined = false,
  ) => {
    const { zoeSeatAdmin, userSeatAccess } = makeZoeSeatAdmin(
      initialAllocation,
      proposal,
      instanceAdminHelper,
      withdrawFacet,
      offerResultIsUndefined,
    );
    const { userSeat, exitObjSetter } = makeUserSeat(userSeatAccess, exitObj);
    userSeatAccess.initExitObjectSetter(exitObjSetter);

    // The original makeZoeSeatAdminKit returned two facets of the same kind.
    // This is returning two independent facets.
    return { userSeat, zoeSeatAdmin };
  };
  return makeZoeSeatAdminKit;
};
