// @jessie-check

import '../../exported.js';

import { AmountMath } from '@agoric/ertp';
import '@agoric/governance/exported.js';
import { deeplyFulfilledObject, makeTracer } from '@agoric/internal';
import { makeStorageNodeChild } from '@agoric/internal/src/lib-chainStorage.js';
import { E } from '@endo/far';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { Stable } from '@agoric/internal/src/tokens.js';
import { makeGovernedTerms as makeGovernedATerms } from '../auction/params.js';
import { makeReserveTerms } from '../reserve/params.js';
import { makeGovernedTerms as makeGovernedVFTerms } from '../vaultFactory/params.js';

/** @import {StartedInstanceKit} from '@agoric/zoe/src/zoeService/utils.js' */

const trace = makeTracer('RunEconBehaviors', true);

export const SECONDS_PER_MINUTE = 60n;
export const SECONDS_PER_HOUR = 60n * 60n;
export const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
export const SECONDS_PER_WEEK = 7n * SECONDS_PER_DAY;

/** @import {start as VFStart} from '../vaultFactory/vaultFactory.js' */
/** @typedef {Awaited<ReturnType<VFStart>>['publicFacet']} VaultFactoryPublicFacet */

/**
 * @typedef {object} PSMKit
 * @property {string} label
 * @property {Instance} psm
 * @property {Instance} psmGovernor
 * @property {Awaited<
 *   ReturnType<
 *     Awaited<
 *       ReturnType<import('../psm/psm.js')['start']>
 *     >['creatorFacet']['getLimitedCreatorFacet']
 *   >
 * >} psmCreatorFacet
 * @property {GovernorCreatorFacet<import('../../src/psm/psm.js')['start']>} psmGovernorCreatorFacet
 * @property {AdminFacet<import('../../src/psm/psm.js')['start']>} psmAdminFacet
 */

/** @typedef {GovernanceFacetKit<import('../auction/auctioneer.js').start>} AuctioneerKit */

/**
 * @typedef {WellKnownSpaces & ChainBootstrapSpace & EconomyBootstrapSpace} EconomyBootstrapPowers
 *
 * @typedef {PromiseSpaceOf<{
 *   economicCommitteeKit: CommitteeStartResult;
 *   economicCommitteeCreatorFacet: import('@agoric/governance/src/committee.js').CommitteeElectorateCreatorFacet;
 *   feeDistributorKit: StartedInstanceKit<
 *     typeof import('../feeDistributor.js').start
 *   >;
 *   periodicFeeCollectors: MapStore<
 *     number,
 *     import('../feeDistributor.js').PeriodicFeeCollector
 *   >;
 *   psmKit: MapStore<Brand, PSMKit>;
 *   anchorBalancePayments: MapStore<Brand, Payment<'nat'>>;
 *   econCharterKit: EconCharterStartResult;
 *   reserveKit: GovernanceFacetKit<
 *     import('../reserve/assetReserve.js')['start']
 *   >;
 *   vaultFactoryKit: GovernanceFacetKit<VFStart>;
 *   auctioneerKit: AuctioneerKit;
 *   newAuctioneerKit: AuctioneerKit;
 *   minInitialDebt: NatValue;
 * }>} EconomyBootstrapSpace
 */

/**
 * @typedef {StartedInstanceKit<
 *   import('../econCommitteeCharter.js')['start']
 * >} EconCharterStartResult
 */
/**
 * @typedef {StartedInstanceKit<
 *   import('@agoric/governance/src/committee.js')['start']
 * >} CommitteeStartResult
 */

/**
 * @file A collection of productions, each of which declares inputs and outputs.
 *   Each function is passed a set of powers for reading from and writing to the
 *   vat config.
 *
 *   Each of the things they produce they're responsible for resolving or setting.
 *
 *   In production called by @agoric/vats to bootstrap.
 */

/** @param {EconomyBootstrapPowers} powers */
export const setupReserve = async ({
  consume: {
    board,
    feeMintAccess: feeMintAccessP,
    chainStorage,
    chainTimerService,
    diagnostics,
    zoe,
    economicCommitteeCreatorFacet: committeeCreator,
  },
  produce: { reserveKit },
  issuer: {
    consume: { [Stable.symbol]: centralIssuer },
  },
  instance: {
    produce: { reserve: reserveInstanceProducer, reserveGovernor },
  },
  installation: {
    consume: {
      contractGovernor: governorInstallation,
      reserve: reserveInstallation,
    },
  },
}) => {
  const STORAGE_PATH = 'reserve';
  trace('setupReserve');
  const poserInvitationP = E(committeeCreator).getPoserInvitation();

  const [poserInvitation, poserInvitationAmount, feeMintAccess] =
    await Promise.all([
      poserInvitationP,
      E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
      feeMintAccessP,
    ]);

  const storageNode = await makeStorageNodeChild(chainStorage, STORAGE_PATH);
  const marshaller = await E(board).getReadonlyMarshaller();

  const reserveTerms = makeReserveTerms(poserInvitationAmount);

  const reserveGovernorTerms = await deeplyFulfilledObject(
    harden({
      timer: chainTimerService,
      governedContractInstallation: reserveInstallation,
      governed: {
        terms: reserveTerms,
        issuerKeywordRecord: { Central: centralIssuer },
        label: 'reserve',
      },
    }),
  );
  const privateArgs = {
    governed: {
      feeMintAccess,
      initialPoserInvitation: poserInvitation,
      marshaller,
      storageNode,
    },
  };
  /** @type {GovernorStartedInstallationKit<typeof reserveInstallation>} */
  const g = await E(zoe).startInstance(
    governorInstallation,
    {},
    reserveGovernorTerms,
    privateArgs,
    'reserve.governor',
  );

  const [creatorFacet, publicFacet, instance] = await Promise.all([
    E(g.creatorFacet).getCreatorFacet(),
    E(g.creatorFacet).getPublicFacet(),
    E(g.publicFacet).getGovernedContract(),
  ]);

  reserveKit.resolve(
    harden({
      label: 'AssetReserve',
      instance,
      publicFacet,
      creatorFacet,
      adminFacet: g.adminFacet,

      governor: g.instance,
      governorCreatorFacet: g.creatorFacet,
      governorAdminFacet: g.adminFacet,
    }),
  );
  await E(diagnostics).savePrivateArgs(instance, privateArgs.governed);
  await E(diagnostics).savePrivateArgs(g.instance, privateArgs);

  reserveInstanceProducer.resolve(instance);
  reserveGovernor.resolve(g.instance);

  return reserveInstallation;
};

/**
 * @param {EconomyBootstrapPowers['consume']} consume
 * @param {object} config
 * @param {InterestTiming} [config.interestTiming]
 * @param {object} [config.options]
 * @param {string} [config.options.referencedUi]
 * @param {Amount<'nat'>} minInitialDebt
 */
export const setupVaultFactoryArguments = async (
  consume,
  {
    interestTiming = {
      chargingPeriod: SECONDS_PER_HOUR,
      recordingPeriod: SECONDS_PER_DAY,
    },
    options: { referencedUi } = {},
  } = {},
  minInitialDebt,
) => {
  const STORAGE_PATH = 'vaultFactory';
  trace('setupVaultFactory');

  const {
    board,
    chainStorage,
    chainTimerService,
    priceAuthority,
    zoe,
    feeMintAccess: feeMintAccessP,
    economicCommitteeCreatorFacet: electorateCreatorFacet,
    reserveKit,
    auctioneerKit,
  } = consume;

  const poserInvitationP = E(electorateCreatorFacet).getPoserInvitation();
  const shortfallInvitationP = E(
    E.get(reserveKit).creatorFacet,
  ).makeShortfallReportingInvitation();

  const [
    initialPoserInvitation,
    poserInvitationAmount,
    initialShortfallInvitation,
    shortfallInvitationAmount,
    feeMintAccess,
    auctioneerPublicFacet,
  ] = await Promise.all([
    poserInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
    shortfallInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(shortfallInvitationP),
    feeMintAccessP,
    E.get(auctioneerKit).publicFacet,
  ]);

  const reservePublicFacet = await E.get(reserveKit).publicFacet;
  const storageNode = await makeStorageNodeChild(chainStorage, STORAGE_PATH);
  const marshaller = await E(board).getReadonlyMarshaller();

  const vaultFactoryTerms = makeGovernedVFTerms({
    priceAuthority,
    auctioneerPublicFacet,
    reservePublicFacet,
    interestTiming,
    timer: chainTimerService,
    electorateInvitationAmount: poserInvitationAmount,
    minInitialDebt,
    bootstrapPaymentValue: 0n,
    shortfallInvitationAmount,
    referencedUi,
  });

  const vaultFactoryPrivateArgs = {
    feeMintAccess,
    initialPoserInvitation,
    initialShortfallInvitation,
    marshaller,
    storageNode,
  };

  return { vaultFactoryTerms, vaultFactoryPrivateArgs };
};

/**
 * @param {EconomyBootstrapPowers} powers
 * @param {object} config
 * @param {InterestTiming} [config.interestTiming]
 * @param {object} [config.options]
 * @param {string} [config.options.referencedUi]
 * @param {bigint} minInitialDebt
 */
export const startVaultFactory = async (
  {
    consume,
    produce: { vaultFactoryKit },
    brand: {
      consume: { [Stable.symbol]: centralBrandP },
    },
    instance: { produce: instanceProduce },
    installation: {
      consume: {
        VaultFactory: vaultFactoryInstallation,
        contractGovernor: contractGovernorInstallation,
      },
    },
  },
  config,
  minInitialDebt = 5_000_000n,
) => {
  trace('startVaultFactory');

  const centralBrand = await centralBrandP;

  const { vaultFactoryTerms, vaultFactoryPrivateArgs } =
    await setupVaultFactoryArguments(
      consume,
      config,
      AmountMath.make(centralBrand, minInitialDebt),
    );

  const governorTerms = await deeplyFulfilledObject(
    harden({
      timer: consume.chainTimerService,
      governedContractInstallation: vaultFactoryInstallation,
      governed: {
        terms: vaultFactoryTerms,
        issuerKeywordRecord: {},
        label: 'vaultFactory',
      },
    }),
  );

  /**
   * @type {GovernorStartedInstallationKit<
   *   typeof vaultFactoryInstallation
   * >}
   */
  const g = await E(consume.zoe).startInstance(
    contractGovernorInstallation,
    undefined,
    governorTerms,
    harden({
      electorateCreatorFacet: consume.economicCommitteeCreatorFacet,
      governed: vaultFactoryPrivateArgs,
    }),
    'vaultFactory.governor',
  );

  const [vaultFactoryInstance, vaultFactoryCreator, publicFacet, adminFacet] =
    await Promise.all([
      E(g.creatorFacet).getInstance(),
      E(g.creatorFacet).getCreatorFacet(),
      E(g.creatorFacet).getPublicFacet(),
      E(g.creatorFacet).getAdminFacet(),
    ]);

  // XXX omitting the governor
  await E(consume.diagnostics).savePrivateArgs(
    vaultFactoryInstance,
    vaultFactoryPrivateArgs,
  );

  vaultFactoryKit.resolve(
    harden({
      label: 'VaultFactory',
      creatorFacet: vaultFactoryCreator,
      adminFacet,
      publicFacet,
      instance: vaultFactoryInstance,

      governor: g.instance,
      governorAdminFacet: g.adminFacet,
      governorCreatorFacet: g.creatorFacet,

      // XXX try refactoring to use savePrivateArgs
      privateArgs: vaultFactoryPrivateArgs,
    }),
  );

  // Advertise the installations, instances in agoricNames.
  instanceProduce.VaultFactory.resolve(vaultFactoryInstance);
  instanceProduce.VaultFactoryGovernor.resolve(g.instance);
};

/**
 * Grant access to the VaultFactory creatorFacet to up to one user based on
 * address.
 *
 * @param {EconomyBootstrapPowers} powers
 * @param {object} [root0]
 * @param {object} [root0.options]
 * @param {string} [root0.options.vaultFactoryControllerAddress]
 */
export const grantVaultFactoryControl = async (
  { consume: { client, priceAuthorityAdmin, vaultFactoryKit } },
  { options: { vaultFactoryControllerAddress } = {} } = {},
) => {
  await E(client).assignBundle([
    addr => ({
      vaultFactoryCreatorFacet:
        typeof vaultFactoryControllerAddress === 'string' &&
        addr === vaultFactoryControllerAddress
          ? E.get(vaultFactoryKit).creatorFacet
          : undefined,
      priceAuthorityAdminFacet:
        typeof vaultFactoryControllerAddress === 'string' &&
        addr === vaultFactoryControllerAddress
          ? priceAuthorityAdmin
          : undefined,
    }),
  ]);
};
harden(grantVaultFactoryControl);

/**
 * Start the reward distributor.
 *
 * @param {EconomyBootstrapPowers} powers
 */
export const startRewardDistributor = async ({
  consume: {
    chainTimerService,
    bankManager,
    vaultFactoryKit,
    periodicFeeCollectors,
    reserveKit,
    zoe,
  },
  produce: { feeDistributorKit, periodicFeeCollectors: periodicFeeCollectorsP },
  instance: {
    produce: { feeDistributor: feeDistributorP },
  },
  installation: {
    consume: { feeDistributor },
  },
  issuer: {
    consume: { [Stable.symbol]: centralIssuerP },
  },
  brand: {
    consume: { [Stable.symbol]: centralBrandP },
  },
}) => {
  trace('startRewardDistributor');
  const timerService = await chainTimerService;
  const feeDistributorTerms = await deeplyFulfilledObject(
    harden({
      timerService,
      collectionInterval: 1n * SECONDS_PER_HOUR,
      keywordShares: {
        RewardDistributor: 0n,
        Reserve: 1n,
      },
    }),
  );

  const [centralIssuer, centralBrand] = await Promise.all([
    centralIssuerP,
    centralBrandP,
  ]);

  const rewardDistributorDepositFacet = await E(bankManager)
    .getRewardDistributorDepositFacet(Stable.denom, {
      issuer: centralIssuer,
      brand: centralBrand,
    })
    .catch(e => {
      console.error('Cannot create fee collector deposit facet', e);
      return undefined;
    });

  /**
   * @type {StartedInstanceKit<
   *   typeof import('@agoric/inter-protocol/src/feeDistributor.js').start
   * >}
   */
  const instanceKit = await E(zoe).startInstance(
    feeDistributor,
    { Fee: centralIssuer },
    feeDistributorTerms,
    undefined,
    'feeDistributor',
  );
  await E(instanceKit.creatorFacet).setDestinations({
    ...(rewardDistributorDepositFacet && {
      RewardDistributor: E(
        instanceKit.creatorFacet,
      ).makeDepositFacetDestination(rewardDistributorDepositFacet),
    }),
    Reserve: E(instanceKit.creatorFacet).makeOfferDestination(
      zoe,
      'Collateral',
      E.get(reserveKit).publicFacet,
      'makeAddCollateralInvitation',
    ),
  });

  feeDistributorKit.resolve(
    harden({ ...instanceKit, label: 'feeDistributor' }),
  );
  feeDistributorP.resolve(instanceKit.instance);

  // Initialize the periodic collectors list if we don't have one.
  periodicFeeCollectorsP.resolve(
    makeScalarBigMapStore('periodicCollectors', { durable: true }),
  );
  const periodicCollectors = await periodicFeeCollectors;

  const collectorKit = {
    vaultFactory: E.get(vaultFactoryKit).creatorFacet,
  };
  await Promise.all(
    Object.entries(collectorKit).map(async ([debugName, collectorFacet]) => {
      const collector = E(instanceKit.creatorFacet).makeContractFeeCollector(
        zoe,
        collectorFacet,
      );
      const periodicCollector = await E(
        instanceKit.creatorFacet,
      ).startPeriodicCollection(debugName, collector);
      periodicCollectors.init(periodicCollectors.getSize(), periodicCollector);
    }),
  );
};
harden(startRewardDistributor);

/**
 * @param {EconomyBootstrapPowers} powers
 * @param {object} config
 * @param {any} [config.auctionParams]
 */
export const startAuctioneer = async (
  {
    consume: {
      zoe,
      board,
      chainTimerService,
      priceAuthority,
      chainStorage,
      economicCommitteeCreatorFacet: electorateCreatorFacet,
    },
    produce: { auctioneerKit },
    instance: {
      produce: { auctioneer: auctionInstance },
      consume: { reserve: reserveInstance },
    },
    installation: {
      consume: {
        auctioneer: auctionInstallation,
        contractGovernor: contractGovernorInstallation,
      },
    },
    issuer: {
      consume: { [Stable.symbol]: stableIssuerP },
    },
  },
  {
    auctionParams = {
      StartFrequency: 1n * SECONDS_PER_HOUR,
      ClockStep: 3n * SECONDS_PER_MINUTE,
      StartingRate: 10500n,
      LowestRate: 6500n,
      DiscountStep: 500n,
      AuctionStartDelay: 2n,
      PriceLockPeriod: SECONDS_PER_HOUR / 2n,
    },
  } = {},
) => {
  trace('startAuctioneer');
  const STORAGE_PATH = 'auction';

  const poserInvitationP = E(electorateCreatorFacet).getPoserInvitation();

  const [initialPoserInvitation, electorateInvitationAmount, stableIssuer] =
    await Promise.all([
      poserInvitationP,
      E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
      stableIssuerP,
    ]);

  const timerBrand = await E(chainTimerService).getTimerBrand();

  const storageNode = await makeStorageNodeChild(chainStorage, STORAGE_PATH);
  const marshaller = await E(board).getReadonlyMarshaller();

  const reservePublicFacet = await E(zoe).getPublicFacet(reserveInstance);

  const auctionTerms = makeGovernedATerms(
    { storageNode, marshaller },
    chainTimerService,
    priceAuthority,
    reservePublicFacet,
    {
      ...auctionParams,
      ElectorateInvitationAmount: electorateInvitationAmount,
      TimerBrand: timerBrand,
    },
  );

  const governorTerms = await deeplyFulfilledObject(
    harden({
      timer: chainTimerService,
      governedContractInstallation: auctionInstallation,
      governed: {
        terms: auctionTerms,
        issuerKeywordRecord: { Bid: stableIssuer },
        storageNode,
        marshaller,
        label: 'auctioneer',
      },
    }),
  );

  /** @type {GovernorStartedInstallationKit<typeof auctionInstallation>} */
  const governorStartResult = await E(zoe).startInstance(
    contractGovernorInstallation,
    undefined,
    governorTerms,
    harden({
      electorateCreatorFacet,
      governed: {
        initialPoserInvitation,
        storageNode,
        marshaller,
      },
    }),
    'auctioneer.governor',
  );

  const [governedInstance, governedCreatorFacet, governedPublicFacet] =
    await Promise.all([
      E(governorStartResult.creatorFacet).getInstance(),
      E(governorStartResult.creatorFacet).getCreatorFacet(),
      E(governorStartResult.creatorFacet).getPublicFacet(),
    ]);

  auctioneerKit.resolve(
    harden({
      label: 'auctioneer',
      creatorFacet: governedCreatorFacet,
      adminFacet: governorStartResult.adminFacet,
      publicFacet: governedPublicFacet,
      instance: governedInstance,

      governor: governorStartResult.instance,
      governorCreatorFacet: governorStartResult.creatorFacet,
      governorAdminFacet: governorStartResult.adminFacet,
    }),
  );

  auctionInstance.resolve(governedInstance);
};
