import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifestForUpgradingMintHolder } from '@agoric/vats/src/proposals/upgrade-mintHolder-proposal.js';

const configurations = {
  A3P_INTEGRATION: {
    labelList: [
      'USDC_axl',
      'USDT_grv',
      'DAI_axl',
      'DAI_grv',
      'stATOM',
      'USDC_grv',
      'ATOM',
      'USDT_axl',
      'USDC',
      'BLD',
    ],
  },
  MAINNET: {
    labelList: [
      'USDT',
      'USDT_axl',
      'USDT_grv',
      'USDC',
      'USDC_axl',
      'USDC_grv',
      'DAI_axl',
      'DAI_grv',
      'ATOM',
      'stATOM',
      'stkATOM',
      'stTIA',
      'stOSMO',
    ],
  },
  DEVNET: {
    labelList: [
      'stATOM3',
      'stATOM',
      'dATOM',
      'stOSMO',
      'stkATOM',
      'stATOM2',
      'STOSMO',
      'stTIA',
      'ATOM',
      'AUSD',
      'USDT_grv',
      'USDC_axl',
      'USDC_grv',
      'USDT_axl',
      'BLD',
    ],
  },
  EMERYNET: {
    labelList: [
      'ATOM',
      'USDT',
      'DAI_axl',
      'DAI_grv',
      'USDC_axl',
      'stOSMO',
      'stATOM',
      'stkATOM',
      'stOSMO2',
      'ToyUSD',
      'BLD',
    ],
  },
};

const { keys } = Object;
const knownVariants = keys(configurations);

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async ({ publishRef, install }, opts) => {
  const config = opts.config || configurations[opts.variant];
  if (!config) {
    const error = `Unknown variant "${opts.variant}". Expected one of ${knownVariants.join(', ')}`;
    console.error(error);
    throw Error(error);
  }
  const { labelList } = config;

  return harden({
    sourceSpec: '@agoric/vats/src/proposals/upgrade-mintHolder-proposal.js',
    getManifestCall: [
      getManifestForUpgradingMintHolder.name,
      {
        labelList,
        contractRef: publishRef(install('@agoric/vats/src/mintHolder.js')),
      },
    ],
  });
};

const Usage = `agoric run upgrade-mintHolder.js ${[...knownVariants, '<json-config>'].join(' | ')}`;

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;
  const variantOrConfig = scriptArgs?.[0];
  console.log('upgrade-mintHolder', variantOrConfig);

  const opts = {};

  if (typeof variantOrConfig === 'string') {
    if (variantOrConfig[0] === '{') {
      try {
        opts.config = JSON.parse(variantOrConfig);
      } catch (err) {
        throw Error(`Failed to parse config argument ${variantOrConfig}`);
      }
    } else {
      opts.variant = variantOrConfig;
    }
  } else {
    console.error(Usage);
    throw Error(Usage);
  }

  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  await writeCoreEval(`upgrade-mintHolder`, async utils =>
    defaultProposalBuilder(utils, opts),
  );
};
