import { AmountMath } from '@agoric/ertp';
import { splitMany } from '@agoric/ertp/src/legacy-payment-helpers.js';
import { E, Far } from '@endo/far';
import { Nat } from '@endo/nat';
import { observeNotifier } from '@agoric/notifier';
import { mustMatch, makeScalarSetStore, M } from '@agoric/store';
import { RelativeTimeShape } from '@agoric/time';
import { KeywordShape } from '@agoric/zoe/src/typeGuards.js';

const KeywordSharesShape = M.recordOf(KeywordShape, M.nat());

/** @type {ContractMeta<typeof start>} */
export const meta = {
  customTermsShape: {
    keywordShares: KeywordSharesShape,
    timerService: M.eref(M.remotable('TimerService')),
    collectionInterval: RelativeTimeShape,
  },
};
harden(meta);

/**
 * @import {RelativeTime} from '@agoric/time'
 * @import {TimerService} from '@agoric/time'
 */

/**
 * @typedef {object} FeeCollector
 * @property {() => ERef<Payment<'nat'>>} collectFees
 */

/**
 * @typedef {object} PeriodicFeeCollector
 * @property {() => FeeCollector} getCollector
 * @property {() => Promise<void>} collectAndDistributeNow
 * @property {() => void} stop
 */

/**
 * @typedef {object} CollectibleContractFacet
 * @property {() => Promise<Invitation<string, never>>} makeCollectFeesInvitation
 */

/**
 * wrapper to take the a creatorFacet (e.g. vaultFactory) and make a call that
 * will request an invitation and return a promise for a payment.
 *
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<CollectibleContractFacet>} creatorFacet
 */
export const makeContractFeeCollector = (zoe, creatorFacet) => {
  /** @type {FeeCollector} */
  return Far('feeCollector', {
    collectFees: async () => {
      const invitation = E(creatorFacet).makeCollectFeesInvitation();
      const collectFeesSeat = E(zoe).offer(invitation, undefined, undefined);
      return E(collectFeesSeat).getPayout('Fee');
    },
  });
};

/**
 * A distributor of fees from Inter Protocol sources to deposit facets. Each
 * time the epochTimer signals the end of an Epoch, it will ask the contracts
 * for fees that have been collected to date and send that payment to the
 * depositFacet.
 *
 * @param {() => Promise<unknown>} schedulePayments - distribute to the
 *   destinations
 * @param {ERef<TimerService>} timerService - timer that is used to schedule
 *   collections
 * @param {RelativeTime} [collectionInterval] - how often to collect fees in the
 *   `timerService` unit
 */
export const startDistributing = (
  schedulePayments,
  timerService,
  collectionInterval = 1n,
) => {
  const timeObserver = {
    updateState: async _ =>
      schedulePayments().catch(e => {
        console.error('failed with', e);
        throw e;
      }),
    fail: reason => {
      throw Error(`fee distributor timer failed: ${reason}`);
    },
    finish: done => {
      throw Error(`fee distributor timer died: ${done}`);
    },
  };

  const collectionNotifier = E(timerService).makeNotifier(
    0n,
    collectionInterval,
  );
  observeNotifier(collectionNotifier, timeObserver).catch(e => {
    console.error('fee distributor failed with', e);
  });
};

/**
 * @typedef {{
 *   pushPayment: (payment: Payment, issuer: ERef<Issuer>) => Promise<Amount>;
 * }} FeeDestination
 * @param {Record<Keyword, ERef<FeeDestination>>} [destinations]
 * @param {Record<Keyword, NatValue>} [keywordShares]
 */
export const makeShareConfig = (destinations = {}, keywordShares = {}) => {
  let totalShares = 0n;
  const shares = Object.entries(destinations)
    .filter(([_, dst]) => dst)
    .map(([kw, destination]) => {
      const share = Nat(keywordShares[kw]);
      totalShares += share;
      return {
        share,
        destination,
      };
    });
  return { shares, totalShares };
};

/** @typedef {ReturnType<typeof makeShareConfig>} ShareConfig */

/**
 * Split and deposit a payment given a share configuration.
 *
 * @param {Payment<'nat'>} payment
 * @param {ERef<Issuer<'nat'>>} issuer
 * @param {ShareConfig} shareConfig
 */
export const sharePayment = async (
  payment,
  issuer,
  { shares, totalShares },
) => {
  // Divide the payment into shares.
  if (!shares.length) {
    return;
  }

  /** @type {Amount<'nat'>} */
  const paymentAmount = await E(issuer).getAmountOf(payment);
  if (AmountMath.isEmpty(paymentAmount)) {
    return;
  }
  const { value: totalValue, brand } = paymentAmount;

  let remainder = totalValue;
  const destinedAmountEntries = shares
    .map(({ share, destination }, i) => {
      const value =
        i === shares.length - 1
          ? remainder
          : (totalValue * share) / totalShares;
      remainder -= value;
      return /** @type {const} */ ([
        destination,
        AmountMath.make(brand, value),
      ]);
    })
    .filter(([_, amt]) => !AmountMath.isEmpty(amt));

  /**
   * If the `sharedPayment[i]` payments that are sent to the fee `destination`
   * with `pushPayment` never arrive, or never get deposited (or otherwise used
   * up), then they remain in the recovery set of the `recoveryPurse`. The
   * purpose of this, and of recovery sets in general, is to be able, in
   * emergencies, to recover the assets of payments in flight that seem to be
   * stuck. This is much like cancelling a check that may still be undeposited.
   *
   * TODO: However, for this to be possible, the `recoveryPurse` holding that
   * recovery set must remain accessible to someone that should legitimately be
   * able to recover those payments. But this `recoveryPurse` is currently
   * dropped on the floor instead.
   */
  const recoveryPurse = E(issuer).makeEmptyPurse();

  // Split the payment, which asserts conservation of the total.
  const sharedPayment = await splitMany(
    recoveryPurse,
    payment,
    destinedAmountEntries.map(([_dst, amt]) => amt),
  );

  // Send each nonempty payment to the corresponding destination.
  await Promise.all(
    destinedAmountEntries.map(async ([destination], i) =>
      E(destination).pushPayment(sharedPayment[i], issuer),
    ),
  );
};

/**
 * @param {ERef<Issuer<'nat'>>} feeIssuer
 * @param {{
 *   keywordShares: Record<Keyword, NatValue>;
 *   timerService: ERef<TimerService>;
 *   collectionInterval: RelativeTime;
 * }} terms
 */
export const makeFeeDistributor = (feeIssuer, terms) => {
  const { timerService, collectionInterval } = terms;

  /** @type {Record<string, ERef<FeeDestination>>} */
  let destinations = {};
  let { keywordShares } = terms;
  let shareConfig = makeShareConfig(destinations, keywordShares);

  /** @type {SetStore<FeeCollector>} */
  const collectors = makeScalarSetStore();

  /** @param {Payment<'nat'>} payment */
  const distributeFees = async payment =>
    sharePayment(payment, feeIssuer, shareConfig);

  const schedulePayments = async () => {
    if (shareConfig.totalShares <= 0n) {
      return;
    }
    await Promise.all(
      [...collectors.values()].map(async collector =>
        E(collector).collectFees().then(distributeFees),
      ),
    );
  };

  const publicFacet = Far('feeDistributor publicFacet', {
    distributeFees,
    getKeywordShares: () => keywordShares,
  });

  const creatorFacet = Far('feeDistributor creatorFacet', {
    makeContractFeeCollector,
    /**
     * Start distributing fees from this collector.
     *
     * @param {string} debugName
     * @param {ERef<FeeCollector>} collectorP
     */
    startPeriodicCollection: async (debugName, collectorP) => {
      const collector = await collectorP;

      /** @type {PeriodicFeeCollector} */
      const periodicCollector = Far('PeriodicFeeCollector', {
        getDebugName: () => debugName,
        getCollector: () => collector,
        collectAndDistributeNow: async () => {
          if (shareConfig.totalShares <= 0n) {
            return;
          }
          const payment = await E(collector).collectFees();
          await distributeFees(payment);
        },
        stop: () => {
          collectors.delete(collector);
        },
      });

      // Run once immediately for this collector, to test that the registration
      // will work.
      await E(periodicCollector).collectAndDistributeNow();

      collectors.add(collector);
      return periodicCollector;
    },

    /**
     * @param {import('@endo/far').EOnly<
     *   import('@agoric/ertp/src/types.js').DepositFacet
     * >} depositFacet
     */
    makeDepositFacetDestination: depositFacet => {
      return Far(`DepositFacetDestination`, {
        pushPayment: async (payment, _issuer) => {
          return E(depositFacet).receive(payment);
        },
      });
    },
    /**
     * Create a destination that generates invitations and makes Zoe offers.
     *
     * @param {ERef<ZoeService>} zoe
     * @param {string} keyword
     * @param {unknown} target
     * @param {PropertyKey} makeInvitationMethod
     * @param {unknown[]} [args]
     */
    makeOfferDestination: (
      zoe,
      keyword,
      target,
      makeInvitationMethod,
      args = [],
    ) => {
      return Far(`${String(makeInvitationMethod)} OfferDestination`, {
        pushPayment: async (payment, issuer) => {
          const paymentAmount = await E(issuer).getAmountOf(payment);

          // Give the payment to the contract via its invitation.
          const invitation = E(target)[makeInvitationMethod](...args);
          const result = E(zoe).offer(
            invitation,
            {
              give: {
                [keyword]: paymentAmount,
              },
            },
            {
              [keyword]: payment,
            },
          );

          // Assert that the offer completed.
          await E(result).getOfferResult();

          // We deliberately drop our payouts on the floor, since the ERTP purse
          // recovery mechanism can get them back to the distributor contract.
          return paymentAmount;
        },
      });
    },

    /** @param {Record<Keyword, ERef<FeeDestination>>} newDestinations */
    setDestinations: async newDestinations => {
      destinations = newDestinations;
      shareConfig = makeShareConfig(destinations, keywordShares);
      // Run once immediately for these destinations.
      await schedulePayments();
    },

    /** @param {Record<Keyword, bigint>} newShares */
    setKeywordShares: newShares => {
      mustMatch(newShares, KeywordSharesShape);
      keywordShares = newShares;
    },
  });

  // Start processing collections.
  startDistributing(schedulePayments, timerService, collectionInterval);

  return harden({
    creatorFacet,
    publicFacet,
  });
};

/** @typedef {ReturnType<typeof makeFeeDistributor>['creatorFacet']} FeeDistributorCreatorFacet */
/** @typedef {ReturnType<typeof makeFeeDistributor>['publicFacet']} FeeDistributorPublicFacet */

/** @param {ZCF<Parameters<typeof makeFeeDistributor>[1]>} zcf */
export const start = async zcf => {
  const feeIssuer = E(zcf.getZoeService()).getFeeIssuer();
  return makeFeeDistributor(feeIssuer, zcf.getTerms());
};
