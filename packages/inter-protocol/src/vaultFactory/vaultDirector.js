/// <reference types="@agoric/governance/exported" />
/// <reference types="@agoric/zoe/exported" />

import { Fail, q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath, AmountShape, BrandShape, IssuerShape } from '@agoric/ertp';
import {
  GovernorFacetShape,
  InvitationShape,
} from '@agoric/governance/src/typeGuards.js';
import { makeTracer } from '@agoric/internal';
import { M, mustMatch } from '@agoric/store';
import {
  prepareExoClassKit,
  provide,
  provideDurableMapStore,
} from '@agoric/vat-data';
import { assertKeywordName } from '@agoric/zoe/src/cleanProposal.js';
import {
  makeRecorderTopic,
  provideEmptySeat,
  SubscriberShape,
  TopicsRecordShape,
  unitAmount,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeCollectFeesInvitation } from '../collectFees.js';
import {
  setWakeupsForNextAuction,
  watchForGovernanceChange,
} from './liquidation.js';
import {
  provideVaultParamManagers,
  SHORTFALL_INVITATION_KEY,
  vaultParamPattern,
} from './params.js';
import {
  prepareVaultManagerKit,
  provideAndStartVaultManagerKits,
} from './vaultManager.js';

/**
 * @import {TypedPattern} from '@agoric/internal';
 */

const trace = makeTracer('VD', true);

/**
 * @typedef {{
 *   collaterals: Brand[];
 *   rewardPoolAllocation: AmountKeywordRecord;
 * }} MetricsNotification
 *
 *
 * @typedef {Readonly<{}>} ImmutableState
 *
 * @typedef {{}} MutableState
 *
 * @typedef {ImmutableState & MutableState} State
 *
 * @typedef {{
 *   burnDebt: BurnDebt;
 *   getGovernedParams: (
 *     collateralBrand: Brand,
 *   ) => import('./vaultManager.js').GovernedParamGetters;
 *   mintAndTransfer: MintAndTransfer;
 *   getShortfallReporter: () => Promise<
 *     import('../reserve/assetReserve.js').ShortfallReporter
 *   >;
 * }} FactoryPowersFacet
 *
 *
 * @typedef {Readonly<{
 *   state: State;
 * }>} MethodContext
 *
 * @typedef {import('@agoric/governance/src/contractGovernance/typedParamManager.js').TypedParamManager<
 *     import('./params.js').VaultDirectorParams
 *   >} VaultDirectorParamManager
 */

const shortfallInvitationKey = 'shortfallInvitation';

// If one manager/token fails, we don't want that to block possible success for
// others, so we .catch() and log separately.
//
// exported for testing
export const makeAllManagersDo = (collateralManagers, vaultManagers) => {
  /** @param {(vm: VaultManager) => void} fn */
  return fn => {
    for (const managerIndex of collateralManagers.values()) {
      Promise.resolve(vaultManagers.get(managerIndex).self)
        .then(vm => fn(vm))
        .catch(e => trace('🚨ERROR: allManagersDo', e));
    }
  };
};

/**
 * @param {import('@agoric/swingset-liveslots').Baggage} baggage
 * @param {import('./vaultFactory.js').VaultFactoryZCF} zcf
 * @param {VaultDirectorParamManager} directorParamManager
 * @param {ZCFMint<'nat'>} debtMint
 * @param {ERef<import('@agoric/time').TimerService>} timer
 * @param {ERef<import('../auction/auctioneer.js').AuctioneerPublicFacet>} auctioneer
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<Marshaller>} marshaller
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeERecorderKit} makeERecorderKit
 * @param {Record<string, import('./params.js').VaultManagerParamOverrides>} managerParams
 */
const prepareVaultDirector = (
  baggage,
  zcf,
  directorParamManager,
  debtMint,
  timer,
  auctioneer,
  storageNode,
  marshaller,
  makeRecorderKit,
  makeERecorderKit,
  managerParams,
) => {
  /** @type {import('../reserve/assetReserve.js').ShortfallReporter} */
  let shortfallReporter;

  /** For holding newly minted tokens until transferred */
  const { zcfSeat: mintSeat } = zcf.makeEmptySeatKit();

  const rewardPoolSeat = provideEmptySeat(zcf, baggage, 'rewardPoolSeat');

  /** @type {MapStore<Brand, number>} index of manager for the given collateral */
  const collateralManagers = provideDurableMapStore(
    baggage,
    'collateralManagers',
  );

  // Non-durable map because param managers aren't durable.
  // In the event they're needed they can be reconstructed from contract terms and off-chain data.
  /** a powerful object; can modify parameters */
  const vaultParamManagers = provideVaultParamManagers(
    baggage,
    marshaller,
    managerParams,
  );

  const metricsNode = E(storageNode).makeChildNode('metrics');

  const metricsKit = makeERecorderKit(
    metricsNode,
    /** @type {TypedPattern<MetricsNotification>} */ (M.any()),
  );

  const managersNode = E(storageNode).makeChildNode('managers');

  /** @returns {MetricsNotification} */
  const sampleMetrics = () => {
    return harden({
      collaterals: Array.from(collateralManagers.keys()),
      rewardPoolAllocation: rewardPoolSeat.getCurrentAllocation(),
    });
  };
  const writeMetrics = async () =>
    E(metricsKit.recorderP).write(sampleMetrics());

  const updateShortfallReporter = async () => {
    const oldInvitation = baggage.has(shortfallInvitationKey)
      ? baggage.get(shortfallInvitationKey)
      : undefined;

    const newInvitation = await directorParamManager.getInternalParamValue(
      SHORTFALL_INVITATION_KEY,
    );

    if (newInvitation === oldInvitation) {
      shortfallReporter ||
        Fail`updateShortFallReported called with repeat invitation and no prior shortfallReporter`;
      return;
    }

    // Update the values
    const zoe = zcf.getZoeService();
    // @ts-expect-error cast
    shortfallReporter = E(E(zoe).offer(newInvitation)).getOfferResult();
    if (oldInvitation === undefined) {
      baggage.init(shortfallInvitationKey, newInvitation);
    } else {
      baggage.set(shortfallInvitationKey, newInvitation);
    }
  };

  const factoryPowers = Far('vault factory powers', {
    /**
     * Get read-only params for this manager and its director. This grants all
     * managers access to params from all managers. It's not POLA but it's a
     * public authority and it reduces the number of distinct power objects to
     * create.
     *
     * @param {Brand} brand
     */
    getGovernedParams: brand => {
      const vaultParamManager = vaultParamManagers.get(brand);
      return Far('vault manager param manager', {
        // merge director and manager params
        ...directorParamManager.readonly(),
        ...vaultParamManager.readonly(),
        // redeclare these getters as to specify the kind of the Amount
        getMinInitialDebt: /** @type {() => Amount<'nat'>} */ (
          directorParamManager.readonly().getMinInitialDebt
        ),
        getDebtLimit: /** @type {() => Amount<'nat'>} */ (
          vaultParamManager.readonly().getDebtLimit
        ),
      });
    },

    /**
     * Let the manager add rewards to the rewardPoolSeat without exposing the
     * rewardPoolSeat to them.
     *
     * @type {MintAndTransfer}
     */
    mintAndTransfer: (mintReceiver, toMint, fee, nonMintTransfers) => {
      const kept = AmountMath.subtract(toMint, fee);
      debtMint.mintGains(harden({ Minted: toMint }), mintSeat);
      /** @type {TransferPart[]} */
      const transfers = [
        ...nonMintTransfers,
        [mintSeat, rewardPoolSeat, { Minted: fee }],
        [mintSeat, mintReceiver, { Minted: kept }],
      ];
      try {
        zcf.atomicRearrange(harden(transfers));
      } catch (e) {
        console.error('mintAndTransfer failed to rearrange', e);
        // If the rearrange fails, burn the newly minted tokens.
        // Assume this won't fail because it relies on the internal mint.
        // (Failure would imply much larger problems.)
        debtMint.burnLosses(harden({ Minted: toMint }), mintSeat);
        throw e;
      }
      void writeMetrics();
    },
    getShortfallReporter: async () => {
      await updateShortfallReporter();
      return shortfallReporter;
    },
    /**
     * @param {Amount<'nat'>} toBurn
     * @param {ZCFSeat} seat
     */
    burnDebt: (toBurn, seat) => {
      debtMint.burnLosses(harden({ Minted: toBurn }), seat);
    },
  });

  const makeVaultManagerKit = prepareVaultManagerKit(baggage, {
    makeERecorderKit,
    makeRecorderKit,
    marshaller,
    factoryPowers,
    zcf,
  });

  const vaultManagers = provideAndStartVaultManagerKits(baggage);

  /** @type {(brand: Brand) => VaultManager} */
  const managerForCollateral = brand => {
    const managerIndex = collateralManagers.get(brand);
    const manager = vaultManagers.get(managerIndex).self;
    manager || Fail`no manager ${managerIndex} for collateral ${brand}`;
    return manager;
  };

  // TODO helper to make all the topics at once
  const topics = harden({
    metrics: makeRecorderTopic('Vault Factory metrics', metricsKit),
  });

  const allManagersDo = makeAllManagersDo(collateralManagers, vaultManagers);

  const makeWaker = (name, func) => {
    return Far(name, {
      wake: timestamp => func(timestamp),
    });
  };

  /** @returns {State} */
  const initState = () => {
    return {};
  };

  /**
   * "Director" of the vault factory, overseeing "vault managers".
   *
   * @param {import('./vaultFactory.js').VaultFactoryZCF} zcf
   * @param {VaultDirectorParamManager} directorParamManager
   * @param {ZCFMint<'nat'>} debtMint
   */
  const makeVaultDirector = prepareExoClassKit(
    baggage,
    'VaultDirector',
    {
      creator: M.interface('creator', {
        ...GovernorFacetShape,
      }),
      machine: M.interface('machine', {
        addVaultType: M.call(IssuerShape, M.string(), M.record()).returns(
          M.promise(),
        ),
        makeCollectFeesInvitation: M.call().returns(M.promise()),
        getRewardAllocation: M.call().returns({ Minted: AmountShape }),
        makePriceLockWaker: M.call().returns(M.remotable('TimerWaker')),
        makeLiquidationWaker: M.call().returns(M.remotable('TimerWaker')),
        makeReschedulerWaker: M.call().returns(M.remotable('TimerWaker')),
        setShortfallReporter: M.call(InvitationShape).returns(M.promise()),
      }),
      public: M.interface('public', {
        getCollateralManager: M.call(BrandShape).returns(M.remotable()),
        getDebtIssuer: M.call().returns(IssuerShape),
        getSubscription: M.call({ collateralBrand: BrandShape }).returns(
          SubscriberShape,
        ),
        getElectorateSubscription: M.call().returns(SubscriberShape),
        getGovernedParams: M.callWhen({ collateralBrand: BrandShape }).returns(
          M.record(),
        ),
        getDirectorGovernedParams: M.call().returns(M.promise()),
        getInvitationAmount: M.call(M.string()).returns(AmountShape),
        getPublicTopics: M.call().returns(TopicsRecordShape),
      }),
      helper: M.interface('helper', {
        resetWakeupsForNextAuction: M.call().returns(M.promise()),
        start: M.call().returns(M.promise()),
      }),
    },
    initState,
    {
      creator: {
        getParamMgrRetriever: () =>
          Far('paramManagerRetriever', {
            /** @param {VaultFactoryParamPath} paramPath */
            get: (
              paramPath = { key: /** @type {const} */ 'governedParams' },
            ) => {
              if (paramPath.key === 'governedParams') {
                return directorParamManager;
              } else if (paramPath.key.collateralBrand) {
                return vaultParamManagers.get(paramPath.key.collateralBrand);
              } else {
                assert.fail('Unsupported paramPath');
              }
            },
          }),
        /** @param {string} name */
        getInvitation(name) {
          return directorParamManager.getInternalParamValue(name);
        },
        getLimitedCreatorFacet() {
          return this.facets.machine;
        },
        /** @returns {ERef<GovernedApis>} */
        getGovernedApis() {
          // @ts-expect-error cast
          return Far('governedAPIs', {});
        },
        getGovernedApiNames() {
          return harden([]);
        },
        setOfferFilter: async strings => zcf.setOfferFilter(strings),
      },
      machine: {
        // TODO move this under governance #3924
        /**
         * @param {Issuer<'nat'>} collateralIssuer
         * @param {Keyword} collateralKeyword
         * @param {VaultManagerParamValues} initialParamValues
         */
        async addVaultType(
          collateralIssuer,
          collateralKeyword,
          initialParamValues,
        ) {
          trace('addVaultType', collateralKeyword, initialParamValues);
          mustMatch(collateralIssuer, M.remotable(), 'collateralIssuer');
          assertKeywordName(collateralKeyword);
          mustMatch(
            initialParamValues,
            vaultParamPattern,
            'initialParamValues',
          );
          await zcf.saveIssuer(collateralIssuer, collateralKeyword);
          const collateralBrand = zcf.getBrandForIssuer(collateralIssuer);
          // We create only one vault per collateralType.
          !collateralManagers.has(collateralBrand) ||
            Fail`Collateral brand ${q(collateralBrand)} has already been added`;

          // zero-based index of the manager being made
          const managerIndex = vaultManagers.length();
          const managerId = `manager${managerIndex}`;
          const managerStorageNode =
            await E(managersNode).makeChildNode(managerId);

          vaultParamManagers.addParamManager(
            collateralBrand,
            managerStorageNode,
            initialParamValues,
          );

          const startTimeStamp = await E(timer).getCurrentTimestamp();

          const collateralUnit = await unitAmount(collateralBrand);

          const kit = await makeVaultManagerKit({
            debtMint,
            collateralBrand,
            collateralUnit,
            descriptionScope: managerId,
            startTimeStamp,
            storageNode: managerStorageNode,
          });
          vaultManagers.add(kit);
          vaultManagers.length() - 1 === managerIndex ||
            Fail`mismatch VaultManagerKit count`;
          const { self: vm } = kit;
          vm || Fail`no vault`;
          collateralManagers.init(collateralBrand, managerIndex);
          void writeMetrics();
          return vm;
        },
        makeCollectFeesInvitation() {
          return makeCollectFeesInvitation(
            zcf,
            rewardPoolSeat,
            debtMint.getIssuerRecord().brand,
            'Minted',
          );
        },
        // XXX accessors for tests
        getRewardAllocation() {
          return rewardPoolSeat.getCurrentAllocation();
        },

        makeLiquidationWaker() {
          return makeWaker('liquidationWaker', _timestamp => {
            // XXX floating promise
            allManagersDo(async vm => vm.liquidateVaults(auctioneer));
          });
        },
        makeReschedulerWaker() {
          const { facets } = this;
          return makeWaker('reschedulerWaker', () => {
            void facets.helper.resetWakeupsForNextAuction();
          });
        },
        makePriceLockWaker() {
          return makeWaker('priceLockWaker', () => {
            allManagersDo(vm => vm.lockOraclePrices());
          });
        },
        async setShortfallReporter(newInvitation) {
          const zoe = zcf.getZoeService();
          shortfallReporter = await E(
            E(zoe).offer(newInvitation),
          ).getOfferResult();
        },
      },
      public: {
        /** @param {Brand} brandIn */
        getCollateralManager(brandIn) {
          collateralManagers.has(brandIn) ||
            Fail`Not a supported collateral type ${brandIn}`;
          /** @type {VaultManager} */
          return managerForCollateral(brandIn).getPublicFacet();
        },
        getDebtIssuer() {
          return debtMint.getIssuerRecord().issuer;
        },
        /**
         * subscription for the paramManager for a particular vaultManager
         *
         * @param {{ collateralBrand: Brand }} selector
         */
        getSubscription({ collateralBrand }) {
          return vaultParamManagers.get(collateralBrand).getSubscription();
        },
        getPublicTopics() {
          return topics;
        },
        /** subscription for the paramManager for the vaultFactory's electorate */
        getElectorateSubscription() {
          return directorParamManager.getSubscription();
        },
        /**
         * Note this works only for a collateral manager. For the director use,
         * `getDirectorGovernedParams`
         *
         * @param {{ collateralBrand: Brand }} selector
         */
        getGovernedParams({ collateralBrand }) {
          // TODO use named getters of TypedParamManager
          return vaultParamManagers.get(collateralBrand).getParams();
        },
        getDirectorGovernedParams() {
          return directorParamManager.getParams();
        },
        /** @param {string} name */
        getInvitationAmount(name) {
          return directorParamManager.getInvitationAmount(name);
        },
      },
      helper: {
        resetWakeupsForNextAuction() {
          const { facets } = this;

          const priceLockWaker = facets.machine.makePriceLockWaker();
          const liquidationWaker = facets.machine.makeLiquidationWaker();
          const rescheduleWaker = facets.machine.makeReschedulerWaker();
          return setWakeupsForNextAuction(
            auctioneer,
            timer,
            priceLockWaker,
            liquidationWaker,
            rescheduleWaker,
          );
        },
        /** Start non-durable processes (or restart if needed after vat restart) */
        async start() {
          const { helper, machine } = this.facets;

          await helper.resetWakeupsForNextAuction();
          updateShortfallReporter().catch(err =>
            console.error(
              '🛠️ updateShortfallReporter failed during start(); repair by updating governance',
              err,
            ),
          );
          // independent of the other one which can be canceled
          const rescheduleWaker = machine.makeReschedulerWaker();
          void watchForGovernanceChange(auctioneer, timer, rescheduleWaker);
        },
      },
    },
  );
  return makeVaultDirector;
};
harden(prepareVaultDirector);

/**
 * Prepare the VaultDirector kind, get or make the singleton
 *
 * @type {(
 *   ...pvdArgs: Parameters<typeof prepareVaultDirector>
 * ) => ReturnType<ReturnType<typeof prepareVaultDirector>>}
 */
export const provideDirector = (...args) => {
  const makeVaultDirector = prepareVaultDirector(...args);

  const [baggage] = args;

  return provide(baggage, 'director', makeVaultDirector);
};
harden(provideDirector);
