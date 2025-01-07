import { makeHelpers } from '@agoric/deploy-script-support';
import { startBasicFlows } from '@agoric/orchestration/src/proposals/start-basic-flows.js';
import { parseArgs } from 'node:util';

/**
 * @import {ParseArgsConfig} from 'node:util'
 */

/** @type {ParseArgsConfig['options']} */
const parserOpts = {
  chainInfo: { type: 'string' },
  assetInfo: { type: 'string' },
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  options,
) => {
  return harden({
    sourceSpec: '@agoric/orchestration/src/proposals/start-basic-flows.js',
    getManifestCall: [
      'getManifestForContract',
      {
        installKeys: {
          basicFlows: publishRef(
            install(
              '@agoric/orchestration/src/examples/basic-flows.contract.js',
            ),
          ),
        },
        options,
      },
    ],
  });
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;

  const {
    values: { chainInfo, assetInfo },
  } = parseArgs({
    args: scriptArgs,
    options: parserOpts,
  });

  const parseChainInfo = () => {
    if (typeof chainInfo !== 'string') return undefined;
    return JSON.parse(chainInfo);
  };
  const parseAssetInfo = () => {
    if (typeof assetInfo !== 'string') return undefined;
    return JSON.parse(assetInfo);
  };
  const opts = harden({
    chainInfo: parseChainInfo(),
    assetInfo: parseAssetInfo(),
  });

  const { writeCoreEval } = await makeHelpers(homeP, endowments);

  await writeCoreEval(startBasicFlows.name, async utils =>
    defaultProposalBuilder(utils, opts),
  );
};
