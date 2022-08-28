// @ts-check
import { Stable } from '@agoric/vats/src/tokens.js';
import * as econBehaviors from './econ-behaviors.js';
import * as simBehaviors from './sim-behaviors.js';

export * from './econ-behaviors.js';
export * from './sim-behaviors.js';
// @ts-expect-error Module './econ-behaviors.js' has already exported a member
// named 'EconomyBootstrapPowers'.
export * from './startPSM.js';

export const ECON_COMMITTEE_MANIFEST = harden({
  [econBehaviors.startEconomicCommittee.name]: {
    consume: {
      board: true,
      chainStorage: true,
      zoe: true,
    },
    produce: { economicCommitteeCreatorFacet: 'economicCommittee' },
    installation: {
      consume: { committee: 'zoe' },
    },
    instance: {
      produce: { economicCommittee: 'economicCommittee' },
    },
  },
});

const SHARED_MAIN_MANIFEST = harden({
  [econBehaviors.setupAmm.name]: {
    consume: {
      board: 'board',
      chainStorage: true,
      chainTimerService: 'timer',
      zoe: 'zoe',
      economicCommitteeCreatorFacet: 'economicCommittee',
    },
    produce: {
      ammCreatorFacet: 'amm',
      ammInstanceWithoutReserve: 'amm',
      ammGovernorCreatorFacet: 'amm',
    },
    issuer: { consume: { [Stable.symbol]: 'zoe' } },
    brand: { consume: { [Stable.symbol]: 'zoe' } },
    installation: {
      consume: { contractGovernor: 'zoe', amm: 'zoe' },
    },
    instance: {
      consume: { economicCommittee: 'economicCommittee' },
      produce: { ammGovernor: 'ammGovernor' },
    },
  },
  [econBehaviors.startInterchainPool.name]: {
    consume: { bankManager: 'bank', zoe: 'zoe', agoricNamesAdmin: true },
    installation: {
      consume: { interchainPool: 'zoe' },
    },
    brand: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    issuer: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    instance: {
      consume: { amm: 'amm' },
      produce: { interchainPool: 'interchainPool' },
    },
  },
  [econBehaviors.startVaultFactory.name]: {
    consume: {
      board: 'board',
      chainStorage: true,
      feeMintAccess: 'zoe',
      chainTimerService: 'timer',
      zoe: 'zoe',
      priceAuthority: 'priceAuthority',
      economicCommitteeCreatorFacet: 'economicCommittee',
      reserveCreatorFacet: 'reserve',
    },
    produce: {
      vaultFactoryCreator: 'VaultFactory',
      vaultFactoryGovernorCreator: 'VaultFactory',
      vaultFactoryVoteCreator: 'VaultFactory',
    },
    brand: { consume: { [Stable.symbol]: 'zoe' } },
    oracleBrand: { consume: { USD: true } },
    installation: {
      consume: {
        contractGovernor: 'zoe',
        VaultFactory: 'zoe',
        liquidate: 'zoe',
      },
    },
    instance: {
      consume: {
        amm: 'amm',
        economicCommittee: 'economicCommittee',
        reserve: 'reserve',
      },
      produce: {
        VaultFactory: 'VaultFactory',
        Treasury: 'VaultFactory',
        VaultFactoryGovernor: 'VaultFactoryGovernor',
      },
    },
  },
  [econBehaviors.grantVaultFactoryControl.name]: {
    consume: {
      client: 'provisioning',
      priceAuthorityAdmin: 'priceAuthority',
      vaultFactoryCreator: 'VaultFactory',
    },
  },

  [econBehaviors.setupReserve.name]: {
    consume: {
      ammCreatorFacet: 'amm',
      ammInstanceWithoutReserve: 'amm',
      board: 'board',
      chainStorage: true,
      feeMintAccess: 'zoe',
      chainTimerService: 'timer',
      zoe: 'zoe',
      economicCommitteeCreatorFacet: 'economicCommittee',
    },
    produce: {
      reserveCreatorFacet: 'reserve',
      reserveGovernorCreatorFacet: 'reserve',
      reservePublicFacet: 'reserve',
    },
    issuer: { consume: { [Stable.symbol]: 'zoe' } },
    brand: { consume: { [Stable.symbol]: 'zoe' } },
    installation: {
      consume: { contractGovernor: 'zoe', reserve: 'zoe' },
    },
    instance: {
      consume: { amm: 'amm', economicCommittee: 'economicCommittee' },
      produce: {
        amm: 'amm',
        reserve: 'reserve',
        reserveGovernor: 'ReserveGovernor',
      },
    },
  },

  [econBehaviors.configureVaultFactoryUI.name]: {
    consume: {
      board: true,
      zoe: true,
    },
    issuer: { consume: { [Stable.symbol]: 'zoe' } },
    brand: { consume: { [Stable.symbol]: 'zoe' } },
    installation: {
      consume: {
        amm: 'zoe',
        VaultFactory: 'zoe',
        contractGovernor: 'zoe',
        binaryVoteCounter: 'zoe',
        liquidate: 'zoe',
      },
    },
    instance: {
      consume: { amm: 'amm', VaultFactory: 'VaultFactory' },
    },
    uiConfig: { produce: { Treasury: true, VaultFactory: true } },
  },
});

const REWARD_MANIFEST = harden({
  [econBehaviors.startRewardDistributor.name]: {
    consume: {
      chainTimerService: true,
      bankManager: true,
      vaultFactoryCreator: true,
      periodicFeeCollectors: true,
      ammCreatorFacet: true,
      stakeFactoryCreatorFacet: true,
      reservePublicFacet: true,
      zoe: true,
    },
    produce: { feeDistributorCreatorFacet: true, periodicFeeCollectors: true },
    instance: { produce: { feeDistributor: true } },
    installation: { consume: { feeDistributor: true } },
    issuer: { consume: { [Stable.symbol]: 'zoe' } },
    brand: { consume: { [Stable.symbol]: 'zoe' } },
  },
});

const STAKE_FACTORY_MANIFEST = harden({
  [econBehaviors.startLienBridge.name]: {
    consume: { bridgeManager: true },
    produce: { lienBridge: true },
    brand: {
      consume: { BLD: 'BLD' },
    },
  },
  [econBehaviors.startStakeFactory.name]: {
    consume: {
      board: 'board',
      chainStorage: true,
      zoe: 'zoe',
      feeMintAccess: 'zoe',
      lienBridge: true,
      client: 'provisioning',
      chainTimerService: 'timer',
      economicCommitteeCreatorFacet: 'economicCommittee',
    },
    produce: {
      stakeFactoryCreatorFacet: 'stakeFactory',
      stakeFactoryGovernorCreatorFacet: 'stakeFactory',
    },
    installation: {
      consume: { contractGovernor: 'zoe', stakeFactory: 'zoe' },
    },
    instance: {
      consume: { economicCommittee: 'economicCommittee' },
      produce: { stakeFactory: 'stakeFactory' },
    },
    brand: {
      consume: { BLD: 'BLD', [Stable.symbol]: 'zoe' },
      produce: { Attestation: 'stakeFactory' },
    },
    issuer: {
      consume: { BLD: 'BLD' },
      produce: { Attestation: 'stakeFactory' },
    },
  },
});

export const SIM_CHAIN_MANIFEST = harden({
  [simBehaviors.fundAMM.name]: {
    consume: {
      centralSupplyBundle: true,
      mintHolderBundle: true,
      chainTimerService: 'timer',
      bldIssuerKit: true,
      feeMintAccess: true,
      loadVat: true,
      mints: 'mints',
      priceAuthorityVat: 'priceAuthority',
      priceAuthorityAdmin: 'priceAuthority',
      vaultFactoryCreator: 'VaultFactory',
      zoe: true,
    },
    installation: {
      consume: { centralSupply: 'zoe' },
    },
    issuer: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    brand: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    instance: {
      consume: { amm: 'amm' },
    },
  },
});

export const getManifestForEconCommittee = (
  { restoreRef },
  { installKeys, econCommitteeOptions },
) => {
  return {
    manifest: ECON_COMMITTEE_MANIFEST,
    installations: {
      contractGovernor: restoreRef(installKeys.contractGovernor),
      committee: restoreRef(installKeys.committee),
      binaryVoteCounter: restoreRef(installKeys.binaryVoteCounter),
    },
    options: {
      econCommitteeOptions,
    },
  };
};

export const getManifestForMain = (
  { restoreRef },
  { installKeys, vaultFactoryControllerAddress, minInitialPoolLiquidity },
) => {
  return {
    manifest: SHARED_MAIN_MANIFEST,
    installations: {
      amm: restoreRef(installKeys.amm),
      VaultFactory: restoreRef(installKeys.vaultFactory),
      feeDistributor: restoreRef(installKeys.feeDistributor),
      liquidate: restoreRef(installKeys.liquidate),
      reserve: restoreRef(installKeys.reserve),
      interchainPool: restoreRef(installKeys.interchainPool),
    },
    options: {
      vaultFactoryControllerAddress,
      minInitialPoolLiquidity,
    },
  };
};

const roleToManifest = harden({
  chain: {
    ...REWARD_MANIFEST,
    ...STAKE_FACTORY_MANIFEST,
  },
  'sim-chain': SIM_CHAIN_MANIFEST,
  client: {},
});

export const getManifestForInterProtocol = (
  { restoreRef },
  {
    ROLE = 'chain',
    econCommitteeOptions,
    installKeys,
    vaultFactoryControllerAddress,
    minInitialPoolLiquidity,
  },
) => {
  const econCommitteeManifest = getManifestForEconCommittee(
    { restoreRef },
    { installKeys, econCommitteeOptions },
  );
  const mainManifest = getManifestForMain(
    { restoreRef },
    {
      installKeys,
      vaultFactoryControllerAddress,
      minInitialPoolLiquidity,
    },
  );
  return {
    manifest: {
      ...econCommitteeManifest.manifest,
      ...mainManifest.manifest,
      ...roleToManifest[ROLE],
    },
    installations: {
      ...econCommitteeManifest.installations,
      ...mainManifest.installations,
      stakeFactory: restoreRef(installKeys.stakeFactory),
    },
    options: {
      ...econCommitteeManifest.options,
      ...mainManifest.options,
      vaultFactoryControllerAddress,
    },
  };
};
