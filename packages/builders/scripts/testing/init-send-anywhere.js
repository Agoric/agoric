import { makeHelpers } from '@agoric/deploy-script-support';
import {
  getManifest,
  startSendAnywhere,
} from '@agoric/orchestration/src/proposals/start-send-anywhere.js';
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
) =>
  harden({
    sourceSpec: '@agoric/orchestration/src/proposals/start-send-anywhere.js',
    getManifestCall: [
      getManifest.name,
      {
        installationRef: publishRef(
          install(
            '@agoric/orchestration/src/examples/send-anywhere.contract.js',
          ),
        ),
        options,
      },
    ],
  });

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

  await writeCoreEval(startSendAnywhere.name, async utils =>
    defaultProposalBuilder(utils, opts),
  );
};
