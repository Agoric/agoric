/* eslint-env node */
/**
 * @file can be run with `agoric deploy` after a chain is running (depends on
 *   chain state) Only works with "local" chain and not sim-chain b/c it needs
 *   governance votes (n/a on sim-chain).
 */
import { makeHelpers } from '@agoric/deploy-script-support';
import { objectMap } from '@agoric/internal';

import {
  getManifestForInterProtocol,
  getManifestForEconCommittee,
  getManifestForMain,
} from '@agoric/inter-protocol/src/proposals/core-proposal.js';
import { makeInstallCache } from '@agoric/inter-protocol/src/proposals/utils.js';

// TODO end inter-package filesystem references https://github.com/Agoric/agoric-sdk/issues/8178

/** @type {Record<string, Record<string, [string, string]>>} */
const installKeyGroups = {
  econCommittee: {
    contractGovernor: [
      '@agoric/governance/src/contractGovernor.js',
      '../../governance/bundles/bundle-contractGovernor.js',
    ],
    committee: [
      '@agoric/governance/src/committee.js',
      '../../governance/bundles/bundle-committee.js',
    ],
    binaryVoteCounter: [
      '@agoric/governance/src/binaryVoteCounter.js',
      '../../governance/bundles/bundle-binaryVoteCounter.js',
    ],
  },
  main: {
    auctioneer: [
      '@agoric/inter-protocol/src/auction/auctioneer.js',
      '../../inter-protocol/bundles/bundle-auctioneer.js',
    ],
    vaultFactory: [
      '@agoric/inter-protocol/src/vaultFactory/vaultFactory.js',
      '../../inter-protocol/bundles/bundle-vaultFactory.js',
    ],
    feeDistributor: [
      '@agoric/inter-protocol/src/feeDistributor.js',
      '../../inter-protocol/bundles/bundle-feeDistributor.js',
    ],
    reserve: [
      '@agoric/inter-protocol/src/reserve/assetReserve.js',
      '../../inter-protocol/bundles/bundle-reserve.js',
    ],
  },
};

/**
 * @template I
 * @template R
 * @param {object} opts
 * @param {(i: I) => R} opts.publishRef
 * @param {(m: string, b: string, opts?: any) => I} opts.install
 * @param {<T>(f: T) => T} [opts.wrapInstall]
 * @param {object} [options]
 * @param {{ committeeName?: string; committeeSize?: number }} [options.econCommitteeOptions]
 */
export const committeeProposalBuilder = async (
  { publishRef, install: install0, wrapInstall },
  { econCommitteeOptions } = {},
) => {
  const install = wrapInstall ? wrapInstall(install0) : install0;

  /** @param {Record<string, [string, string]>} group */
  const publishGroup = group =>
    objectMap(group, ([mod, bundle]) =>
      publishRef(install(mod, bundle, { persist: true })),
    );
  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/core-proposal.js',
    getManifestCall: [
      getManifestForEconCommittee.name,
      {
        econCommitteeOptions,
        installKeys: {
          ...publishGroup(installKeyGroups.econCommittee),
        },
      },
    ],
  });
};

/**
 * @template I
 * @template R
 * @param {object} opts
 * @param {(i: I) => R} opts.publishRef
 * @param {(m: string, b: string, opts?: any) => I} opts.install
 * @param {<T>(f: T) => T} [opts.wrapInstall]
 */
export const mainProposalBuilder = async ({
  publishRef,
  install: install0,
  wrapInstall,
}) => {
  const { VAULT_FACTORY_CONTROLLER_ADDR } = process.env;

  const install = wrapInstall ? wrapInstall(install0) : install0;

  const persist = true;
  /** @param {Record<string, [string, string]>} group */
  const publishGroup = group =>
    objectMap(group, ([mod, bundle]) =>
      publishRef(install(mod, bundle, { persist })),
    );
  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/core-proposal.js',
    getManifestCall: [
      getManifestForMain.name,
      {
        vaultFactoryControllerAddress: VAULT_FACTORY_CONTROLLER_ADDR,
        installKeys: {
          ...publishGroup(installKeyGroups.main),
        },
      },
    ],
  });
};

// Build proposal for sim-chain etc.
/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  options = {},
  { env = process.env } = {},
) => {
  /** @param {string | undefined} s */
  const optBigInt = s => s && BigInt(s);
  const {
    vaultFactoryControllerAddress = env.VAULT_FACTORY_CONTROLLER_ADDR,
    minInitialPoolLiquidity = env.MIN_INITIAL_POOL_LIQUIDITY,
    referencedUi,
    anchorOptions: {
      anchorDenom = env.ANCHOR_DENOM,
      anchorDecimalPlaces = '6',
      anchorKeyword = 'AUSD',
      anchorProposedName = anchorKeyword,
      initialPrice = undefined,
    } = {},
    econCommitteeOptions: {
      committeeSize: econCommitteeSize = env.ECON_COMMITTEE_SIZE || '3',
    } = {},
  } = options;

  /** @param {Record<string, [string, string]>} group */
  const publishGroup = group =>
    objectMap(group, async ([mod, bundle]) => publishRef(install(mod, bundle)));

  const anchorOptions = anchorDenom && {
    denom: anchorDenom,
    decimalPlaces: parseInt(anchorDecimalPlaces, 10),
    initialPrice,
    keyword: anchorKeyword,
    proposedName: anchorProposedName,
  };

  const econCommitteeOptions = {
    committeeSize: parseInt(econCommitteeSize, 10),
  };

  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/core-proposal.js',
    getManifestCall: [
      getManifestForInterProtocol.name,
      {
        vaultFactoryControllerAddress,
        minInitialPoolLiquidity: optBigInt(minInitialPoolLiquidity),
        referencedUi,
        anchorOptions,
        econCommitteeOptions,
        installKeys: {
          ...publishGroup(installKeyGroups.econCommittee),
          ...publishGroup(installKeyGroups.main),
        },
      },
    ],
  });
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { writeCoreEval } = await makeHelpers(homeP, endowments);

  const tool = await makeInstallCache(homeP, {
    loadBundle: async spec => import(spec),
  });
  await Promise.all([
    writeCoreEval('gov-econ-committee', async opts =>
      // @ts-expect-error XXX makeInstallCache types
      committeeProposalBuilder({ ...opts, wrapInstall: tool.wrapInstall }),
    ),
    writeCoreEval('gov-amm-vaults-etc', async opts =>
      // @ts-expect-error XXX makeInstallCache types
      mainProposalBuilder({ ...opts, wrapInstall: tool.wrapInstall }),
    ),
  ]);
  await tool.saveCache();
};
