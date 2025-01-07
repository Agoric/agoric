import { Fail, q } from '@endo/errors';
import { E } from '@endo/far';
import {
  AmountShape,
  BrandShape,
  DisplayInfoShape,
  IssuerShape,
  PaymentShape,
  PurseShape,
} from '@agoric/ertp';
import {
  deeplyFulfilledObject,
  makeTracer,
  objectMap,
  StorageNodeShape,
} from '@agoric/internal';
import { isUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';
import { M, mustMatch } from '@agoric/store';
import {
  appendToStoredArray,
  provideLazy,
} from '@agoric/store/src/stores/store-utils.js';
import {
  makeScalarBigMapStore,
  makeScalarBigWeakMapStore,
  prepareExoClass,
  prepareExoClassKit,
  provide,
  watchPromise,
} from '@agoric/vat-data';
import {
  prepareRecorderKit,
  SubscriberShape,
  TopicsRecordShape,
} from '@agoric/zoe/src/contractSupport/index.js';
import {
  AmountKeywordRecordShape,
  PaymentPKeywordRecordShape,
} from '@agoric/zoe/src/typeGuards.js';
import { prepareVowTools } from '@agoric/vow';
import { makeDurableZone } from '@agoric/zone/durable.js';

import { makeInvitationsHelper } from './invitations.js';
import { shape } from './typeGuards.js';
import { objectMapStoragePath } from './utils.js';
import { prepareOfferWatcher, makeWatchOfferOutcomes } from './offerWatcher.js';

/** @import {OfferId, OfferStatus} from './offers.js'; */

const trace = makeTracer('SmrtWlt');

/**
 * @file Smart wallet module
 * @see {@link ../README.md} }
 */

/** @typedef {number | string} OfferId */

/**
 * @typedef {{
 *   id: OfferId;
 *   invitationSpec: import('./invitations').InvitationSpec;
 *   proposal: Proposal;
 *   offerArgs?: any;
 * }} OfferSpec
 */

/**
 * @typedef {{
 *   logger: {
 *     info: (...args: any[]) => void;
 *     error: (...args: any[]) => void;
 *   };
 *   makeOfferWatcher: import('./offerWatcher.js').MakeOfferWatcher;
 *   invitationFromSpec: ERef<Invitation>;
 * }} ExecutorPowers
 */

/**
 * @typedef {{
 *   method: 'executeOffer';
 *   offer: OfferSpec;
 * }} ExecuteOfferAction
 */

/**
 * @typedef {{
 *   method: 'tryExitOffer';
 *   offerId: OfferId;
 * }} TryExitOfferAction
 */

// Discriminated union. Possible future messages types:
// maybe suggestIssuer for https://github.com/Agoric/agoric-sdk/issues/6132
// setting petnames and adding brands for https://github.com/Agoric/agoric-sdk/issues/6126
/** @typedef {ExecuteOfferAction | TryExitOfferAction} BridgeAction */

/**
 * Purses is an array to support a future requirement of multiple purses per
 * brand.
 *
 * Each map is encoded as an array of entries because a Map doesn't serialize
 * directly. We also considered having a vstorage key for each offer but for now
 * are sticking with this design.
 *
 * Cons
 *
 * - Reserializes previously written results when a new result is added
 * - Optimizes reads though writes are on-chain (~100 machines) and reads are
 *   off-chain (to 1 machine)
 *
 * Pros
 *
 * - Reading all offer results happens much more (>100) often than storing a new
 *   offer result
 * - Reserialization and writes are paid in execution gas, whereas reads are not
 *
 * This design should be revisited if ever batch querying across vstorage keys
 * become cheaper or reads be paid.
 *
 * @typedef {{
 *   purses: { brand: Brand; balance: Amount }[];
 *   offerToUsedInvitation: [offerId: string, usedInvitation: Amount][];
 *   offerToPublicSubscriberPaths: [
 *     offerId: string,
 *     publicTopics: { [subscriberName: string]: string },
 *   ][];
 *   liveOffers: [OfferId, OfferStatus][];
 * }} CurrentWalletRecord
 */

/**
 * @typedef {{ updated: 'offerStatus'; status: OfferStatus }
 *   | { updated: 'balance'; currentAmount: Amount }
 *   | { updated: 'walletAction'; status: { error: string } }} UpdateRecord
 *   Record of an update to the state of this wallet.
 *
 *   Client is responsible for coalescing updates into a current state. See
 *   `coalesceUpdates` utility.
 *
 *   The reason for this burden on the client is that publishing the full history
 *   of offers with each change is untenable.
 *
 *   `balance` update supports forward-compatibility for more than one purse per
 *   brand. An additional key will be needed to disambiguate. For now the brand
 *   in the amount suffices.
 */

/**
 * @typedef {{
 *   brand: Brand;
 *   displayInfo: DisplayInfo;
 *   issuer: Issuer;
 *   petname: import('./types.js').Petname;
 * }} BrandDescriptor
 *   For use by clients to describe brands to users. Includes `displayInfo` to
 *   save a remote call.
 */

/**
 * @typedef {{
 *   address: string;
 *   bank: ERef<import('@agoric/vats/src/vat-bank.js').Bank>;
 *   currentStorageNode: StorageNode;
 *   invitationPurse: Purse<'set', InvitationDetails>;
 *   walletStorageNode: StorageNode;
 * }} UniqueParams
 *
 *
 * @typedef {Pick<MapStore<Brand, BrandDescriptor>, 'has' | 'get' | 'values'>} BrandDescriptorRegistry
 *
 *
 * @typedef {{
 *   agoricNames: ERef<import('@agoric/vats').NameHub>;
 *   registry: BrandDescriptorRegistry;
 *   invitationIssuer: Issuer<'set'>;
 *   invitationBrand: Brand<'set'>;
 *   invitationDisplayInfo: DisplayInfo;
 *   publicMarshaller: Marshaller;
 *   zoe: ERef<ZoeService>;
 * }} SharedParams
 *
 *
 * @typedef {ImmutableState & MutableState} State - `brandPurses` is precious
 *   and closely held. defined as late as possible to reduce its scope.
 *
 *   - `offerToInvitationMakers` is precious and closely held.
 *   - `offerToPublicSubscriberPaths` is precious and closely held.
 *   - `purseBalances` is a cache of what we've received from purses. Held so we can
 *       publish all balances on change.
 *
 *
 * @typedef {Readonly<
 *   UniqueParams & {
 *     paymentQueues: MapStore<Brand, Payment[]>;
 *     offerToInvitationMakers: MapStore<
 *       string,
 *       import('./types.js').InvitationMakers
 *     >;
 *     offerToPublicSubscriberPaths: MapStore<string, Record<string, string>>;
 *     offerToUsedInvitation: MapStore<string, Amount<'set'>>;
 *     purseBalances: MapStore<Purse, Amount>;
 *     updateRecorderKit: import('@agoric/zoe/src/contractSupport/recorder.js').RecorderKit<UpdateRecord>;
 *     currentRecorderKit: import('@agoric/zoe/src/contractSupport/recorder.js').RecorderKit<CurrentWalletRecord>;
 *     liveOffers: MapStore<OfferId, OfferStatus>;
 *     liveOfferSeats: MapStore<OfferId, UserSeat<unknown>>;
 *     liveOfferPayments: MapStore<OfferId, MapStore<Brand, Payment>>;
 *   }
 * >} ImmutableState
 *
 *
 * @typedef {BrandDescriptor & { purse: Purse }} PurseRecord
 *
 * @typedef {{}} MutableState
 */

/**
 * NameHub reverse-lookup, finding 0 or more names for a target value
 *
 * TODO: consider moving to nameHub.js?
 *
 * @param {unknown} target - passable Key
 * @param {ERef<import('@agoric/vats').NameHub>} nameHub
 */
const namesOf = async (target, nameHub) => {
  const entries = await E(nameHub).entries();
  const matches = [];
  for (const [name, candidate] of entries) {
    if (candidate === target) {
      matches.push(name);
    }
  }
  return harden(matches);
};

/**
 * Check that an issuer and its brand belong to each other.
 *
 * TODO: move to ERTP?
 *
 * @param {Issuer} issuer
 * @param {Brand} brand
 * @returns {Promise<boolean>} true iff the the brand and issuer match
 */
const checkMutual = async (issuer, brand) =>
  Promise.all([
    E(issuer)
      .getBrand()
      .then(b => b === brand),
    E(brand).isMyIssuer(issuer),
  ]).then(checks => checks.every(Boolean));

export const BRAND_TO_PURSES_KEY = 'brandToPurses';

const getBrandToPurses = (walletPurses, key) => {
  const brandToPurses = provideLazy(walletPurses, key, _k => {
    /** @type {MapStore<Brand, PurseRecord[]>} */
    const store = makeScalarBigMapStore('purses by brand', {
      durable: true,
    });
    return store;
  });
  return brandToPurses;
};

/**
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {SharedParams} shared
 */
export const prepareSmartWallet = (baggage, shared) => {
  const { registry: _r, ...passableShared } = shared;
  mustMatch(
    harden(passableShared),
    harden({
      agoricNames: M.eref(M.remotable('agoricNames')),
      invitationIssuer: IssuerShape,
      invitationBrand: BrandShape,
      invitationDisplayInfo: DisplayInfoShape,
      publicMarshaller: M.remotable('Marshaller'),
      zoe: M.eref(M.remotable('ZoeService')),
    }),
  );
  const zone = makeDurableZone(baggage);
  const makeRecorderKit = prepareRecorderKit(baggage, shared.publicMarshaller);

  const walletPurses = provide(baggage, BRAND_TO_PURSES_KEY, () => {
    trace('make purses by wallet and save in baggage at', BRAND_TO_PURSES_KEY);
    /** @type {WeakMapStore<unknown, MapStore<Brand, PurseRecord[]>>} */
    const store = makeScalarBigWeakMapStore('purses by wallet', {
      durable: true,
    });
    return store;
  });

  const vowTools = prepareVowTools(zone.subZone('vow'));

  const makeOfferWatcher = prepareOfferWatcher(baggage, vowTools);
  const watchOfferOutcomes = makeWatchOfferOutcomes(vowTools);

  const updateShape = {
    value: AmountShape,
    updateCount: M.bigint(),
  };

  const NotifierShape = M.remotable();
  const amountWatcherGuard = M.interface('paymentWatcher', {
    onFulfilled: M.call(updateShape, NotifierShape).returns(),
    onRejected: M.call(M.any(), NotifierShape).returns(M.promise()),
  });

  const prepareAmountWatcher = () =>
    prepareExoClass(
      baggage,
      'AmountWatcher',
      amountWatcherGuard,
      /**
       * @param {Purse} purse
       * @param {ReturnType<makeWalletWithResolvedStorageNodes>['helper']} helper
       */
      (purse, helper) => ({ purse, helper }),
      {
        /**
         * @param {{ value: Amount; updateCount: bigint | undefined }} updateRecord
         * @param {Notifier<Amount>} notifier
         * @returns {void}
         */
        onFulfilled(updateRecord, notifier) {
          const { helper, purse } = this.state;
          helper.updateBalance(purse, updateRecord.value);
          helper.watchNextBalance(
            this.self,
            notifier,
            updateRecord.updateCount,
          );
        },
        /**
         * @param {unknown} err
         * @returns {Promise<void>}
         */
        onRejected(err) {
          const { helper, purse } = this.state;
          if (isUpgradeDisconnection(err)) {
            return helper.watchPurse(purse); // retry
          }
          helper.logWalletError(`failed amount observer`, err);
          throw err;
        },
      },
    );

  const makeAmountWatcher = prepareAmountWatcher();

  /**
   * @param {UniqueParams} unique
   * @returns {State}
   */
  const initState = unique => {
    // Some validation of inputs.
    mustMatch(
      unique,
      harden({
        address: M.string(),
        bank: M.eref(M.remotable()),
        invitationPurse: PurseShape,
        currentStorageNode: M.eref(StorageNodeShape),
        walletStorageNode: M.eref(StorageNodeShape),
      }),
    );

    const preciousState = {
      // Payments that couldn't be deposited when received.
      // NB: vulnerable to uncapped growth by unpermissioned deposits.
      paymentQueues: makeScalarBigMapStore('payments queues', {
        durable: true,
      }),
      // Invitation amounts to save for persistent lookup
      offerToUsedInvitation: makeScalarBigMapStore(
        'invitation amounts by offer',
        {
          durable: true,
        },
      ),
      // Invitation makers yielded by offer results
      offerToInvitationMakers: makeScalarBigMapStore(
        'invitation makers by offer',
        {
          durable: true,
        },
      ),
      // Public subscribers yielded by offer results
      offerToPublicSubscriberPaths: makeScalarBigMapStore(
        'public subscribers by offer',
        {
          durable: true,
        },
      ),
    };

    /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').RecorderKit<UpdateRecord>} */
    const updateRecorderKit = makeRecorderKit(unique.walletStorageNode);
    // NB: state size must not grow monotonically
    // This is the node that UIs subscribe to for everything they need.
    // e.g. agoric follow :published.wallet.agoric1nqxg4pye30n3trct0hf7dclcwfxz8au84hr3ht
    /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').RecorderKit<CurrentWalletRecord>} */
    const currentRecorderKit = makeRecorderKit(unique.currentStorageNode);

    const nonpreciousState = {
      // What purses have reported on construction and by getCurrentAmountNotifier updates.
      purseBalances: makeScalarBigMapStore('purse balances', { durable: true }),
      updateRecorderKit,
      currentRecorderKit,
      liveOffers: makeScalarBigMapStore('live offers', { durable: true }),
      // Keep seats separate from the offers because we don't want to publish these.
      liveOfferSeats: makeScalarBigMapStore('live offer seats', {
        durable: true,
      }),
      liveOfferPayments: makeScalarBigMapStore('live offer payments', {
        durable: true,
      }),
    };

    return {
      ...unique,
      ...nonpreciousState,
      ...preciousState,
    };
  };

  const behaviorGuards = {
    helper: M.interface('helperFacetI', {
      assertUniqueOfferId: M.call(M.string()).returns(),
      updateBalance: M.call(PurseShape, AmountShape).optional('init').returns(),
      getPurseIfKnownBrand: M.call(BrandShape)
        .optional(M.eref(M.remotable()))
        .returns(M.promise()),
      publishCurrentState: M.call().returns(),
      watchPurse: M.call(M.eref(PurseShape)).returns(M.promise()),
      watchNextBalance: M.call(M.any(), NotifierShape, M.bigint()).returns(),
      updateStatus: M.call(M.any()).returns(),
      addContinuingOffer: M.call(
        M.or(M.number(), M.string()),
        AmountShape,
        M.remotable('InvitationMaker'),
        M.or(M.record(), M.undefined()),
      ).returns(M.promise()),
      purseForBrand: M.call(BrandShape).returns(M.promise()),
      logWalletInfo: M.call().rest(M.arrayOf(M.any())).returns(),
      logWalletError: M.call().rest(M.arrayOf(M.any())).returns(),
      getLiveOfferPayments: M.call().returns(M.remotable('mapStore')),
    }),

    deposit: M.interface('depositFacetI', {
      receive: M.callWhen(M.await(M.eref(PaymentShape))).returns(AmountShape),
    }),
    payments: M.interface('payments support', {
      withdrawGive: M.call(
        AmountKeywordRecordShape,
        M.or(M.number(), M.string()),
      ).returns(PaymentPKeywordRecordShape),
      tryReclaimingWithdrawnPayments: M.call(
        M.or(M.number(), M.string()),
      ).returns(M.promise()),
    }),
    offers: M.interface('offers facet', {
      executeOffer: M.call(shape.OfferSpec).returns(M.promise()),
      tryExitOffer: M.call(M.scalar()).returns(M.promise()),
    }),
    self: M.interface('selfFacetI', {
      handleBridgeAction: M.call(shape.StringCapData, M.boolean()).returns(
        M.promise(),
      ),
      getDepositFacet: M.call().returns(M.remotable()),
      getOffersFacet: M.call().returns(M.remotable()),
      getCurrentSubscriber: M.call().returns(SubscriberShape),
      getUpdatesSubscriber: M.call().returns(SubscriberShape),
      getPublicTopics: M.call().returns(TopicsRecordShape),
    }),
  };

  // TODO move to top level so its type can be exported
  /**
   * Make the durable object to return, but taking some parameters that are
   * awaited by a wrapping function. This is necessary because the class kit
   * construction helpers, `initState` and `finish` run synchronously and the
   * child storage node must be awaited until we have durable promises.
   */
  const makeWalletWithResolvedStorageNodes = prepareExoClassKit(
    baggage,
    'SmartWallet',
    behaviorGuards,
    initState,
    {
      helper: {
        /**
         * Assert this ID is unique with respect to what has been stored. The
         * wallet doesn't store every offer ID but the offers for which it
         * doesn't are unlikely to be impacted by re-use.
         *
         * @type {(id: string) => void}
         */
        assertUniqueOfferId(id) {
          const { facets } = this;
          const {
            liveOffers,
            liveOfferSeats,
            offerToInvitationMakers,
            offerToPublicSubscriberPaths,
            offerToUsedInvitation,
          } = this.state;
          const used =
            liveOffers.has(id) ||
            liveOfferSeats.has(id) ||
            facets.helper.getLiveOfferPayments().has(id) ||
            offerToInvitationMakers.has(id) ||
            offerToPublicSubscriberPaths.has(id) ||
            offerToUsedInvitation.has(id);
          !used || Fail`cannot re-use offer id ${id}`;
        },
        /**
         * @param {Purse} purse
         * @param {Amount<any>} balance
         */
        updateBalance(purse, balance) {
          const { purseBalances, updateRecorderKit } = this.state;
          if (purseBalances.has(purse)) {
            purseBalances.set(purse, balance);
          } else {
            purseBalances.init(purse, balance);
          }
          void updateRecorderKit.recorder.write({
            updated: 'balance',
            currentAmount: balance,
          });
          const { helper } = this.facets;
          helper.publishCurrentState();
        },

        publishCurrentState() {
          const {
            currentRecorderKit,
            offerToUsedInvitation,
            offerToPublicSubscriberPaths,
            purseBalances,
            liveOffers,
          } = this.state;
          void currentRecorderKit.recorder.write({
            purses: [...purseBalances.values()].map(a => ({
              brand: a.brand,
              balance: a,
            })),
            offerToUsedInvitation: [...offerToUsedInvitation.entries()],
            offerToPublicSubscriberPaths: [
              ...offerToPublicSubscriberPaths.entries(),
            ],
            liveOffers: [...liveOffers.entries()],
          });
        },

        /** @type {(purse: ERef<Purse>) => Promise<void>} */
        async watchPurse(purseRef) {
          const { helper } = this.facets;

          // This would seem to fit the observeNotifier() pattern,
          // but purse notifiers are not necessarily durable.
          // If there is an error due to upgrade, retry watchPurse().

          const purse = await purseRef; // promises don't fit in durable storage
          const handler = makeAmountWatcher(purse, helper);

          // publish purse's balance and changes
          const notifier = await E(purse).getCurrentAmountNotifier();
          const startP = E(notifier).getUpdateSince(undefined);
          watchPromise(startP, handler, notifier);
        },

        watchNextBalance(handler, notifier, updateCount) {
          const nextP = E(notifier).getUpdateSince(updateCount);
          watchPromise(nextP, handler, notifier);
        },

        /**
         * Provide a purse given a NameHub of issuers and their brands.
         *
         * We currently support only one NameHub, agoricNames, and hence one
         * purse per brand. But we store an array of them to facilitate a
         * transition to decentralized introductions.
         *
         * @param {Brand} brand
         * @param {ERef<import('@agoric/vats').NameHub>} known - namehub with
         *   brand, issuer branches
         * @returns {Promise<Purse | undefined>} undefined if brand is not known
         */
        async getPurseIfKnownBrand(brand, known) {
          const { helper, self } = this.facets;
          const brandToPurses = getBrandToPurses(walletPurses, self);

          if (brandToPurses.has(brand)) {
            const purses = brandToPurses.get(brand);
            if (purses.length > 0) {
              // UNTIL https://github.com/Agoric/agoric-sdk/issues/6126
              // multiple purses
              return purses[0].purse;
            }
          }

          const found = await namesOf(brand, E(known).lookup('brand'));
          if (found.length === 0) {
            return undefined;
          }
          const [edgeName] = found;
          const issuer = await E(known).lookup('issuer', edgeName);

          // Even though we rely on this nameHub, double-check
          // that the issuer and the brand belong to each other.
          if (!(await checkMutual(issuer, brand))) {
            // if they don't, it's not a "known" brand in a coherent way
            return undefined;
          }

          // Accept the issuer; rely on it in future offers.
          const [displayInfo, purse] = await Promise.all([
            E(issuer).getDisplayInfo(),
            E(issuer).makeEmptyPurse(),
          ]);

          // adopt edgeName as petname
          // NOTE: for decentralized introductions, qualify edgename by nameHub petname
          const petname = edgeName;
          const assetInfo = { petname, brand, issuer, purse, displayInfo };
          appendToStoredArray(brandToPurses, brand, assetInfo);
          // NOTE: when we decentralize introduction of issuers,
          // process queued payments for this brand.

          void helper.watchPurse(purse);
          return purse;
        },

        /** @param {OfferStatus} offerStatus */
        updateStatus(offerStatus) {
          const { state, facets } = this;
          facets.helper.logWalletInfo('offerStatus', offerStatus);

          void state.updateRecorderKit.recorder.write({
            updated: 'offerStatus',
            status: offerStatus,
          });

          if ('numWantsSatisfied' in offerStatus) {
            if (state.liveOfferSeats.has(offerStatus.id)) {
              state.liveOfferSeats.delete(offerStatus.id);
            }

            if (facets.helper.getLiveOfferPayments().has(offerStatus.id)) {
              facets.helper.getLiveOfferPayments().delete(offerStatus.id);
            }

            if (state.liveOffers.has(offerStatus.id)) {
              state.liveOffers.delete(offerStatus.id);
              // This might get skipped in subsequent passes, since we .delete()
              // the first time through
              facets.helper.publishCurrentState();
            }
          }
        },

        /**
         * @param {string} offerId
         * @param {Amount<'set'>} invitationAmount
         * @param {import('./types.js').InvitationMakers} invitationMakers
         * @param {import('./types.js').PublicSubscribers} publicSubscribers
         */
        async addContinuingOffer(
          offerId,
          invitationAmount,
          invitationMakers,
          publicSubscribers,
        ) {
          const { state, facets } = this;

          state.offerToUsedInvitation.init(offerId, invitationAmount);
          state.offerToInvitationMakers.init(offerId, invitationMakers);
          const pathMap = await objectMapStoragePath(publicSubscribers);
          if (pathMap) {
            facets.helper.logWalletInfo('recording pathMap', pathMap);
            state.offerToPublicSubscriberPaths.init(offerId, pathMap);
          }
          facets.helper.publishCurrentState();
        },

        /**
         * @param {Brand} brand
         * @returns {Promise<Purse>}
         */
        async purseForBrand(brand) {
          const { state, facets } = this;
          const { registry, invitationBrand } = shared;

          if (registry.has(brand)) {
            return E(state.bank).getPurse(brand);
          } else if (invitationBrand === brand) {
            return state.invitationPurse;
          }

          const purse = await facets.helper.getPurseIfKnownBrand(
            brand,
            shared.agoricNames,
          );
          if (purse) {
            return purse;
          }
          throw Fail`cannot find/make purse for ${brand}`;
        },
        logWalletInfo(...args) {
          const { state } = this;
          console.info('wallet', state.address, ...args);
        },
        logWalletError(...args) {
          const { state } = this;
          console.error('wallet', state.address, ...args);
        },
        // In new SmartWallets, this is part of state, but we can't add fields
        // to instance state for older SmartWallets, so put it in baggage.
        getLiveOfferPayments() {
          const { state } = this;

          if (state.liveOfferPayments) {
            return state.liveOfferPayments;
          }

          // This will only happen for legacy wallets, before WF incarnation 2
          if (!baggage.has(state.address)) {
            trace(`getLiveOfferPayments adding store for ${state.address}`);
            baggage.init(
              state.address,
              makeScalarBigMapStore('live offer payments', {
                durable: true,
              }),
            );
          }
          return baggage.get(state.address);
        },
      },
      /**
       * Similar to {DepositFacet} but async because it has to look up the
       * purse.
       */
      deposit: {
        /**
         * Put the assets from the payment into the appropriate purse.
         *
         * If the purse doesn't exist, we hold the payment in durable storage.
         *
         * @param {Payment} payment
         * @returns {Promise<Amount>}
         * @throws if there's not yet a purse, though the payment is held to try
         *   again when there is
         */
        async receive(payment) {
          const {
            state,
            facets: { helper },
          } = this;
          const { paymentQueues: queues, bank, invitationPurse } = state;
          const { registry, invitationBrand } = shared;

          const brand = await E(payment).getAllegedBrand();

          // When there is a purse deposit into it
          if (registry.has(brand)) {
            const purse = E(bank).getPurse(brand);
            // @ts-expect-error narrow assetKind to 'nat'
            return E(purse).deposit(payment);
          } else if (invitationBrand === brand) {
            // @ts-expect-error narrow assetKind to 'set'
            return E(invitationPurse).deposit(payment);
          }

          const purse = await helper.getPurseIfKnownBrand(
            brand,
            shared.agoricNames,
          );
          if (purse) {
            return E(purse).deposit(payment);
          }

          // When there is no purse, save the payment into a queue.
          // It's not yet ever read but a future version of the contract can
          appendToStoredArray(queues, brand, payment);
          throw Fail`cannot deposit payment with brand ${brand}: no purse`;
        },
      },

      payments: {
        /**
         * Withdraw the offered amount from the appropriate purse of this
         * wallet.
         *
         * Save its amount in liveOfferPayments in case we need to reclaim the
         * payment.
         *
         * @param {AmountKeywordRecord} give
         * @param {OfferId} offerId
         * @returns {PaymentPKeywordRecord}
         */
        withdrawGive(give, offerId) {
          const { facets } = this;

          /** @type {MapStore<Brand, Payment>} */
          const brandPaymentRecord = makeScalarBigMapStore('paymentToBrand', {
            durable: true,
          });
          facets.helper
            .getLiveOfferPayments()
            .init(offerId, brandPaymentRecord);

          // Add each payment amount to brandPaymentRecord as it is withdrawn. If
          // there's an error later, we can use it to redeposit the correct amount.
          return objectMap(give, async amount => {
            /** @type {Promise<Purse>} */
            const purseP = facets.helper.purseForBrand(amount.brand);
            const paymentP = E(purseP).withdraw(amount);
            void E.when(
              paymentP,
              payment => brandPaymentRecord.init(amount.brand, payment),
              e => {
                // recovery will be handled by tryReclaimingWithdrawnPayments()
                facets.helper.logWalletInfo(
                  `⚠️ Payment withdrawal failed.`,
                  offerId,
                  e,
                );
              },
            );
            return paymentP;
          });
        },

        /**
         * Find the live payments for the offer and deposit them back in the
         * appropriate purses.
         *
         * @param {OfferId} offerId
         * @returns {Promise<Amount[]>}
         */
        async tryReclaimingWithdrawnPayments(offerId) {
          const { facets } = this;

          await null;

          const liveOfferPayments = facets.helper.getLiveOfferPayments();
          if (liveOfferPayments.has(offerId)) {
            const brandPaymentRecord = liveOfferPayments.get(offerId);
            if (!brandPaymentRecord) {
              return [];
            }
            const out = [];
            // Use allSettled to ensure we attempt all the deposits, regardless of
            // individual rejections.
            await Promise.allSettled(
              Array.from(brandPaymentRecord.entries()).map(async ([b, p]) => {
                // Wait for the withdrawal to complete.  This protects against a
                // race when updating paymentToPurse.
                const purseP = facets.helper.purseForBrand(b);

                // Now send it back to the purse.
                return E(purseP)
                  .deposit(p)
                  .then(amt => {
                    out.push(amt);
                  });
              }),
            );
            return harden(out);
          }
          return [];
        },
      },

      offers: {
        /**
         * Take an offer description provided in capData, augment it with
         * payments and call zoe.offer()
         *
         * @param {OfferSpec} offerSpec
         * @returns {Promise<void>} after the offer has been both seated and
         *   exited by Zoe.
         * @throws if any parts of the offer can be determined synchronously to
         *   be invalid
         */
        async executeOffer(offerSpec) {
          const { facets, state } = this;
          const { address, invitationPurse } = state;
          const { zoe, agoricNames } = shared;
          const { invitationBrand, invitationIssuer } = shared;

          facets.helper.assertUniqueOfferId(String(offerSpec.id));

          await null;

          /** @type {UserSeat} */
          let seatRef;
          let watcher;
          try {
            const invitationFromSpec = makeInvitationsHelper(
              zoe,
              agoricNames,
              invitationBrand,
              invitationPurse,
              state.offerToInvitationMakers.get,
            );

            facets.helper.logWalletInfo('starting executeOffer', offerSpec.id);

            // 1. Prepare values and validate synchronously.
            const { proposal } = offerSpec;

            const invitation = invitationFromSpec(offerSpec.invitationSpec);

            const invitationAmount =
              await E(invitationIssuer).getAmountOf(invitation);

            // 2. Begin executing offer
            // No explicit signal to user that we reached here but if anything above
            // failed they'd get an 'error' status update.

            const withdrawnPayments =
              proposal?.give &&
              (await deeplyFulfilledObject(
                facets.payments.withdrawGive(proposal.give, offerSpec.id),
              ));

            seatRef = await E(zoe).offer(
              invitation,
              proposal,
              withdrawnPayments,
              offerSpec.offerArgs,
            );
            facets.helper.logWalletInfo(offerSpec.id, 'seated');

            watcher = makeOfferWatcher(
              facets.helper,
              facets.deposit,
              offerSpec,
              address,
              invitationAmount,
              seatRef,
            );

            state.liveOffers.init(offerSpec.id, offerSpec);
            state.liveOfferSeats.init(offerSpec.id, seatRef);

            // publish the live offers
            facets.helper.publishCurrentState();

            // await so that any errors are caught and handled below
            await watchOfferOutcomes(watcher, seatRef);
          } catch (reason) {
            // This block only runs if the block above fails during one vat incarnation.
            facets.helper.logWalletError('IMMEDIATE OFFER ERROR:', reason);

            // Update status to observers
            if (isUpgradeDisconnection(reason)) {
              // The offer watchers will reconnect. Don't reclaim or exit
              return;
            } else if (watcher) {
              // The watcher's onRejected will updateStatus()
            } else {
              facets.helper.updateStatus({
                error: reason.toString(),
                ...offerSpec,
              });
            }

            // Backstop recovery, in case something very basic fails.
            if (offerSpec?.proposal?.give) {
              facets.payments
                .tryReclaimingWithdrawnPayments(offerSpec.id)
                .catch(e =>
                  facets.helper.logWalletError(
                    'recovery failed reclaiming payments',
                    e,
                  ),
                );
            }

            // XXX tests rely on throwing immediate errors, not covering the
            // error handling in the event the failure is after an upgrade
            throw reason;
          }
        },
        /**
         * Take an offer's id, look up its seat, try to exit.
         *
         * @param {OfferId} offerId
         * @returns {Promise<void>}
         * @throws if the seat can't be found or E(seatRef).tryExit() fails.
         */
        async tryExitOffer(offerId) {
          const { facets } = this;
          const amts = await facets.payments
            .tryReclaimingWithdrawnPayments(offerId)
            .catch(e => {
              facets.helper.logWalletError(
                'recovery failed reclaiming payments',
                e,
              );
              return [];
            });
          if (amts.length > 0) {
            facets.helper.logWalletInfo('reclaimed', amts, 'from', offerId);
          }
          const seatRef = this.state.liveOfferSeats.get(offerId);
          await E(seatRef).tryExit();
        },
      },
      self: {
        /**
         * Umarshals the actionCapData and delegates to the appropriate action
         * handler.
         *
         * @param {import('@endo/marshal').CapData<string | null>} actionCapData
         *   of type BridgeAction
         * @param {boolean} [canSpend]
         * @returns {Promise<void>}
         */
        handleBridgeAction(actionCapData, canSpend = false) {
          const { facets } = this;
          const { offers } = facets;
          const { publicMarshaller } = shared;

          /** @param {Error} err */
          const recordError = err => {
            const { updateRecorderKit } = this.state;
            facets.helper.logWalletError('handleBridgeAction error:', err);
            void updateRecorderKit.recorder.write({
              updated: 'walletAction',
              status: { error: err.message },
            });
          };

          // use E.when to retain distributed stack trace
          return E.when(
            E(publicMarshaller).fromCapData(actionCapData),
            /** @param {BridgeAction} action */
            async action => {
              try {
                switch (action.method) {
                  case 'executeOffer': {
                    canSpend || Fail`executeOffer requires spend authority`;
                    return offers.executeOffer(action.offer);
                  }
                  case 'tryExitOffer': {
                    assert(canSpend, 'tryExitOffer requires spend authority');
                    return offers.tryExitOffer(action.offerId);
                  }
                  default: {
                    throw Fail`invalid handle bridge action ${q(action)}`;
                  }
                }
              } catch (err) {
                // record synchronous error in the action delegator above
                // but leave async rejections alone because the offer handler recorded them
                // with greater detail
                recordError(err);
              }
            },
            // record errors in the unserialize and leave the rejection handled
            recordError,
          );
        },
        getDepositFacet() {
          return this.facets.deposit;
        },
        getOffersFacet() {
          return this.facets.offers;
        },
        /** @deprecated use getPublicTopics */
        getCurrentSubscriber() {
          const { state } = this;
          return state.currentRecorderKit.subscriber;
        },
        /** @deprecated use getPublicTopics */
        getUpdatesSubscriber() {
          const { state } = this;
          return state.updateRecorderKit.subscriber;
        },
        getPublicTopics() {
          const { state } = this;
          const { currentRecorderKit, updateRecorderKit } = state;

          return harden({
            current: {
              description: 'Current state of wallet',
              subscriber: currentRecorderKit.subscriber,
              storagePath: currentRecorderKit.recorder.getStoragePath(),
            },
            updates: {
              description: 'Changes to wallet',
              subscriber: updateRecorderKit.subscriber,
              storagePath: updateRecorderKit.recorder.getStoragePath(),
            },
          });
        },
      },
    },
    {
      finish: ({ state, facets }) => {
        const { invitationPurse } = state;
        const { helper } = facets;

        void helper.watchPurse(invitationPurse);
      },
    },
  );

  /**
   * @param {Omit<
   *   UniqueParams,
   *   'currentStorageNode' | 'walletStorageNode'
   * > & {
   *   walletStorageNode: ERef<StorageNode>;
   * }} uniqueWithoutChildNodes
   */
  const makeSmartWallet = async uniqueWithoutChildNodes => {
    const [walletStorageNode, currentStorageNode] = await Promise.all([
      uniqueWithoutChildNodes.walletStorageNode,
      E(uniqueWithoutChildNodes.walletStorageNode).makeChildNode('current'),
    ]);

    return makeWalletWithResolvedStorageNodes(
      harden({
        ...uniqueWithoutChildNodes,
        currentStorageNode,
        walletStorageNode,
      }),
    ).self;
  };
  return makeSmartWallet;
};
harden(prepareSmartWallet);

/** @typedef {Awaited<ReturnType<ReturnType<typeof prepareSmartWallet>>>} SmartWallet */
