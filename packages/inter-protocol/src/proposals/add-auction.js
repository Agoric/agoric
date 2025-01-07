import { deeplyFulfilledObject, makeTracer } from '@agoric/internal';
import { makeStorageNodeChild } from '@agoric/internal/src/lib-chainStorage.js';
import { Stable } from '@agoric/internal/src/tokens.js';
import { E } from '@endo/far';
import { makeGovernedTerms as makeGovernedATerms } from '../auction/params.js';
import { provideRetiredInstances } from './utils.js';

const trace = makeTracer('NewAuction', true);

/**
 * @typedef {PromiseSpaceOf<{
 *   auctionUpgradeNewInstance: Instance;
 *   auctionUpgradeNewGovCreator: any;
 *   newContractGovBundleId: string;
 *   retiredContractInstances: MapStore<string, Instance>;
 * }>} interlockPowers
 */

/**
 * @param {import('./econ-behaviors.js').EconomyBootstrapPowers &
 *   interlockPowers} powers
 * @param {{
 *   options: {
 *     contractGovernorRef: { bundleID: string };
 *     contractGovernorInstallation: Installation;
 *   };
 * }} options
 */
export const addAuction = async (
  {
    consume: {
      agoricNamesAdmin,
      auctioneerKit: legacyKitP,
      board,
      chainStorage,
      chainTimerService,
      economicCommitteeCreatorFacet: electorateCreatorFacet,
      governedContractKits: governedContractKitsP,
      priceAuthority8400,
      retiredContractInstances: retiredContractInstancesP,
      zoe,
    },
    produce: {
      auctioneerKit: produceAuctioneerKit,
      auctionUpgradeNewInstance,
      auctionUpgradeNewGovCreator,
      newContractGovBundleId,
      retiredContractInstances: produceRetiredInstances,
    },
    instance: {
      consume: { reserve: reserveInstance },
      produce: { auctioneer: auctionInstance },
    },
    installation: {
      consume: { auctioneer: auctioneerInstallationP },
    },
    issuer: {
      consume: { [Stable.symbol]: stableIssuerP },
    },
  },
  {
    options: {
      contractGovernorRef: contractGovernorBundle,
      contractGovernorInstallation,
    },
  },
) => {
  trace('addAuction start');
  const STORAGE_PATH = 'auction';

  const poserInvitationP = E(electorateCreatorFacet).getPoserInvitation();
  const [
    initialPoserInvitation,
    electorateInvitationAmount,
    stableIssuer,
    legacyKit,
    auctioneerInstallation,
  ] = await Promise.all([
    poserInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
    stableIssuerP,
    legacyKitP,
    auctioneerInstallationP,
  ]);

  const retiredInstances = await provideRetiredInstances(
    retiredContractInstancesP,
    produceRetiredInstances,
  );

  const governedContractKits = await governedContractKitsP;
  trace('has', governedContractKits.has(legacyKit.instance));
  if (governedContractKits.has(legacyKit.instance)) {
    // bootstrap tests start having already run this upgrade. Actual upgrades on
    // mainNet or testnets should start with the promiseSpace post upgrade-17,
    // which doesn't have this entry in the map.
    trace(
      '⚠️ WARNING: not expected during chain upgrade.  It IS normal during bootstrap tests',
    );
  } else {
    // @ts-expect-error The original auctioneerKit had everything it needs
    governedContractKits.init(legacyKit.instance, legacyKit);
  }

  // save the auctioneer instance so we can manage it later
  const boardID = await E(board).getId(legacyKit.instance);
  const identifier = `auctioneer-${boardID}`;
  retiredInstances.init(identifier, legacyKit.instance);

  // Each field has an extra layer of type +  value:
  // AuctionStartDelay: { type: 'relativeTime', value: { relValue: 2n, timerBrand: Object [Alleged: timerBrand] {} } }
  /** @type {any} */
  const paramValues = await E(legacyKit.publicFacet).getGovernedParams();
  const params = harden({
    StartFrequency: paramValues.StartFrequency.value,
    ClockStep: paramValues.ClockStep.value,
    StartingRate: paramValues.StartingRate.value,
    LowestRate: paramValues.LowestRate.value,
    DiscountStep: paramValues.DiscountStep.value,
    AuctionStartDelay: paramValues.AuctionStartDelay.value,
    PriceLockPeriod: paramValues.PriceLockPeriod.value,
  });
  const timerBrand = await E(chainTimerService).getTimerBrand();

  const storageNode = await makeStorageNodeChild(chainStorage, STORAGE_PATH);
  const marshaller = await E(board).getReadonlyMarshaller();

  const reservePublicFacet = await E(zoe).getPublicFacet(reserveInstance);

  const auctionTerms = makeGovernedATerms(
    { storageNode, marshaller },
    chainTimerService,
    priceAuthority8400,
    reservePublicFacet,
    {
      ...params,
      ElectorateInvitationAmount: electorateInvitationAmount,
      TimerBrand: timerBrand,
    },
  );

  const governorTerms = await deeplyFulfilledObject(
    harden({
      timer: chainTimerService,
      governedContractInstallation: auctioneerInstallation,
      governed: {
        terms: auctionTerms,
        issuerKeywordRecord: { Bid: stableIssuer },
        storageNode,
        marshaller,
        label: 'auctioneer',
      },
    }),
  );

  const bundleIdFromZoe = await E(zoe).getBundleIDFromInstallation(
    contractGovernorInstallation,
  );
  trace('governor bundle ID', bundleIdFromZoe, contractGovernorBundle.bundleID);

  /** @type {GovernorStartedInstallationKit<typeof auctioneerInstallationP>} */
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

  const [
    governedInstance,
    governedCreatorFacet,
    governedPublicFacet,
    governedAdminFacet,
  ] = await Promise.all([
    E(governorStartResult.creatorFacet).getInstance(),
    E(governorStartResult.creatorFacet).getCreatorFacet(),
    E(governorStartResult.creatorFacet).getPublicFacet(),
    E(governorStartResult.creatorFacet).getAdminFacet(),
  ]);

  const allIssuers = await E(zoe).getIssuers(legacyKit.instance);
  const { Bid: _istIssuer, ...auctionIssuers } = allIssuers;
  await Promise.all(
    Object.keys(auctionIssuers).map(async kwd =>
      E(governedCreatorFacet).addBrand(
        /** @type {Issuer<'nat'>} */ (auctionIssuers[kwd]),
        kwd,
      ),
    ),
  );

  const kit = harden({
    label: 'auctioneer',
    creatorFacet: governedCreatorFacet,
    adminFacet: governedAdminFacet,
    publicFacet: governedPublicFacet,
    instance: governedInstance,

    governor: governorStartResult.instance,
    governorCreatorFacet: governorStartResult.creatorFacet,
    governorAdminFacet: governorStartResult.adminFacet,
  });
  produceAuctioneerKit.reset();
  produceAuctioneerKit.resolve(kit);

  auctionInstance.reset();
  await auctionInstance.resolve(governedInstance);
  // belt and suspenders; the above is supposed to also do this
  await E(E(agoricNamesAdmin).lookupAdmin('instance')).update(
    'auctioneer',
    governedInstance,
  );

  governedContractKits.init(kit.instance, kit);
  auctionUpgradeNewInstance.resolve(governedInstance);
  auctionUpgradeNewGovCreator.resolve(kit.governorCreatorFacet);
  newContractGovBundleId.resolve(contractGovernorBundle.bundleID);
};

export const ADD_AUCTION_MANIFEST = harden({
  [addAuction.name]: {
    consume: {
      agoricNamesAdmin: true,
      auctioneerKit: true,
      board: true,
      chainStorage: true,
      chainTimerService: true,
      econCharterKit: true,
      economicCommitteeCreatorFacet: true,
      governedContractKits: true,
      priceAuthority8400: true,
      retiredContractInstances: true,
      zoe: true,
    },
    produce: {
      auctioneerKit: true,
      auctionUpgradeNewInstance: true,
      auctionUpgradeNewGovCreator: true,
      newContractGovBundleId: true,
      retiredContractInstances: true,
    },
    instance: {
      consume: { reserve: true },
      produce: { auctioneer: true },
    },
    installation: {
      consume: { contractGovernor: true, auctioneer: true },
    },
    issuer: {
      consume: { [Stable.symbol]: true },
    },
  },
});

/**
 * Add a new auction to a chain that already has one.
 *
 * @param {object} utils
 * @param {any} utils.restoreRef
 * @param {any} addAuctionOptions
 */
export const getManifestForAddAuction = async (
  { restoreRef },
  { auctioneerRef, contractGovernorRef },
) => {
  const contractGovernorInstallation = restoreRef(contractGovernorRef);
  return {
    manifest: ADD_AUCTION_MANIFEST,
    // XXX we should be able to receive contractGovernorInstallation via
    // installations.consume, but the received installation isn't right.
    options: { contractGovernorRef, contractGovernorInstallation },
    installations: {
      auctioneer: restoreRef(auctioneerRef),
      contractGovernor: restoreRef(contractGovernorRef),
    },
  };
};
