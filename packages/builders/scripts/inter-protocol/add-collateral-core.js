/* eslint-env node */
import { makeHelpers } from '@agoric/deploy-script-support';

import { getManifestForAddAssetToVault } from '@agoric/inter-protocol/src/proposals/addAssetToVault.js';
import { getManifestForPsm } from '@agoric/inter-protocol/src/proposals/startPSM.js';
import { makeInstallCache } from '@agoric/inter-protocol/src/proposals/utils.js';

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install: install0, wrapInstall },
  {
    debtLimitValue = undefined,
    interestRateValue = undefined,
    interchainAssetOptions = /** @type {object} */ ({}),
  } = {},
  { env = process.env } = {},
) => {
  /** @type {import('@agoric/inter-protocol/src/proposals/addAssetToVault.js').InterchainAssetOptions} */
  const {
    issuerBoardId = env.INTERCHAIN_ISSUER_BOARD_ID,
    denom = env.INTERCHAIN_DENOM,
    keyword = 'ATOM',
    issuerName = keyword,
    oracleBrand = issuerName,
    decimalPlaces = 6,
    proposedName = issuerName,
    initialPrice = undefined,
  } = interchainAssetOptions;

  if (!denom) {
    assert(issuerBoardId, 'INTERCHAIN_ISSUER_BOARD_ID is required');
  }

  const install = wrapInstall ? wrapInstall(install0) : install0;

  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/addAssetToVault.js',
    getManifestCall: [
      getManifestForAddAssetToVault.name,
      {
        debtLimitValue: debtLimitValue && BigInt(debtLimitValue),
        interestRateValue: interestRateValue && BigInt(interestRateValue),
        interchainAssetOptions: {
          denom,
          issuerBoardId,
          decimalPlaces,
          initialPrice,
          keyword,
          issuerName,
          proposedName,
          oracleBrand,
        },
        scaledPriceAuthorityRef: publishRef(
          install(
            '@agoric/zoe/src/contracts/scaledPriceAuthority.js',
            '../bundles/bundle-scaledPriceAuthority.js',
            { persist: true },
          ),
        ),
      },
    ],
  });
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const psmProposalBuilder = async (
  { publishRef, install: install0, wrapInstall },
  { anchorOptions = /** @type {object} */ ({}) } = {},
  { env = process.env } = {},
) => {
  const { denom = env.ANCHOR_DENOM, decimalPlaces = 6 } = anchorOptions;

  assert(denom, 'ANCHOR_DENOM is required');

  const install = wrapInstall ? wrapInstall(install0) : install0;

  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/startPSM.js',
    getManifestCall: [
      getManifestForPsm.name,
      {
        anchorOptions: {
          ...anchorOptions,
          denom,
          decimalPlaces,
        },
        installKeys: {
          psm: publishRef(
            install(
              '@agoric/inter-protocol/src/psm/psm.js',
              '../bundles/bundle-psm.js',
            ),
          ),
          mintHolder: publishRef(
            install(
              '@agoric/vats/src/mintHolder.js',
              '../../vats/bundles/bundle-mintHolder.js',
            ),
          ),
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

  await writeCoreEval('gov-add-collateral', defaultProposalBuilder);
  await writeCoreEval('gov-start-psm', async opts =>
    psmProposalBuilder({
      ...opts,
      // @ts-expect-error XXX makeInstallCache types
      wrapInstall: tool.wrapInstall,
    }),
  );
};
