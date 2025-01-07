// @ts-check
import { makeHelpers } from '@agoric/deploy-script-support';
import { AmountMath } from '@agoric/ertp';
import {
  FastUSDCConfigShape,
  getManifestForFastUSDC,
} from '@agoric/fast-usdc/src/fast-usdc.start.js';
import { toExternalConfig } from '@agoric/fast-usdc/src/utils/config-marshal.js';
import { configurations } from '@agoric/fast-usdc/src/utils/deploy-config.js';
import {
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { Far } from '@endo/far';
import { parseArgs } from 'node:util';

/**
 * @import {CoreEvalBuilder, DeployScriptFunction} from '@agoric/deploy-script-support/src/externalTypes.js'
 * @import {ParseArgsConfig} from 'node:util'
 * @import {FastUSDCConfig} from '@agoric/fast-usdc/src/types.js'
 */

const { keys } = Object;

/** @type {ParseArgsConfig['options']} */
const options = {
  flatFee: { type: 'string', default: '0.01' },
  variableRate: { type: 'string', default: '0.01' },
  maxVariableFee: { type: 'string', default: '5' },
  contractRate: { type: 'string', default: '0.2' },
  net: { type: 'string' },
  oracle: { type: 'string', multiple: true },
  feedPolicy: { type: 'string' },
  usdcDenom: {
    type: 'string',
    default:
      'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
  },
  chainInfo: { type: 'string' },
  assetInfo: { type: 'string' },
  noNoble: { type: 'boolean', default: false },
};
const oraclesUsage = 'use --oracle name:address ...';

const feedPolicyUsage = 'use --feedPolicy <policy> ...';

const chainInfoUsage = 'use --chainInfo {chainName:CosmosChainInfo, ...}';
const assetInfoUsage =
  'use --assetInfo { denom:DenomInfo & {brandKey?: string} ... }';

/**
 * @typedef {{
 *   flatFee: string;
 *   variableRate: string;
 *   maxVariableFee: string;
 *   contractRate: string;
 *   net?: string;
 *   oracle?: string[];
 *   usdcDenom: string;
 *   feedPolicy?: string;
 *   chainInfo?: string;
 *   assetInfo?: string;
 *   noNoble: boolean;
 * }} FastUSDCOpts
 */

const crossVatContext = /** @type {const} */ ({
  /** @type {Brand<'nat'>} */
  USDC: Far('USDC Brand'),
});
const { USDC } = crossVatContext;
const USDC_DECIMALS = 6;
const unit = AmountMath.make(USDC, 10n ** BigInt(USDC_DECIMALS));

/** @type {CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  /** @type {FastUSDCConfig} */ config,
) => {
  return harden({
    sourceSpec: '@agoric/fast-usdc/src/fast-usdc.start.js',
    /** @type {[string, Parameters<typeof getManifestForFastUSDC>[1]]} */
    getManifestCall: [
      getManifestForFastUSDC.name,
      {
        options: toExternalConfig(config, crossVatContext, FastUSDCConfigShape),
        installKeys: {
          fastUsdc: publishRef(
            install('@agoric/fast-usdc/src/fast-usdc.contract.js'),
          ),
        },
      },
    ],
  });
};

/** @type {DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  const { scriptArgs } = endowments;

  /** @type {{ values: FastUSDCOpts }} */
  // @ts-expect-error ensured by options
  const {
    values: {
      oracle: oracleArgs,
      net,
      usdcDenom,
      feedPolicy,
      chainInfo,
      assetInfo,
      noNoble,
      ...fees
    },
  } = parseArgs({ args: scriptArgs, options });

  const parseFeedPolicy = () => {
    if (net) {
      if (!(net in configurations)) {
        throw Error(`${net} not in ${keys(configurations)}`);
      }
      return configurations[net].feedPolicy;
    }
    if (!feedPolicy) throw Error(feedPolicyUsage);
    return JSON.parse(feedPolicy);
  };

  const parseOracleArgs = () => {
    if (net) {
      if (!(net in configurations)) {
        throw Error(`${net} not in ${keys(configurations)}`);
      }
      return configurations[net].oracles;
    }
    if (!oracleArgs) throw Error(oraclesUsage);
    return Object.fromEntries(
      oracleArgs.map(arg => {
        const result = arg.match(/(?<name>[^:]+):(?<address>.+)/);
        if (!(result && result.groups)) throw Error(oraclesUsage);
        const { name, address } = result.groups;
        return [name, address];
      }),
    );
  };

  /** @param {string} numeral */
  const toAmount = numeral => multiplyBy(unit, parseRatio(numeral, USDC));
  /** @param {string} numeral */
  const toRatio = numeral => parseRatio(numeral, USDC);
  const parseFeeConfigArgs = () => {
    const { flatFee, variableRate, maxVariableFee, contractRate } = fees;
    return {
      flat: toAmount(flatFee),
      variableRate: toRatio(variableRate),
      maxVariable: toAmount(maxVariableFee),
      contractRate: toRatio(contractRate),
    };
  };

  const parseChainInfo = () => {
    if (net) {
      if (!(net in configurations)) {
        throw Error(`${net} not in ${keys(configurations)}`);
      }
      return configurations[net].chainInfo;
    }
    if (!chainInfo) throw Error(chainInfoUsage);
    return JSON.parse(chainInfo);
  };
  const parseAssetInfo = () => {
    if (net) {
      if (!(net in configurations)) {
        throw Error(`${net} not in ${keys(configurations)}`);
      }
      return configurations[net].assetInfo;
    }
    if (!assetInfo) throw Error(assetInfoUsage);
    return JSON.parse(assetInfo);
  };

  /** @type {FastUSDCConfig} */
  const config = harden({
    oracles: parseOracleArgs(),
    terms: {
      usdcDenom,
    },
    feeConfig: parseFeeConfigArgs(),
    feedPolicy: parseFeedPolicy(),
    chainInfo: parseChainInfo(),
    assetInfo: parseAssetInfo(),
    noNoble,
  });

  await writeCoreEval('start-fast-usdc', async utils =>
    defaultProposalBuilder(utils, config),
  );
};
