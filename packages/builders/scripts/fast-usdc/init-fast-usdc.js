// @ts-check
import { makeHelpers } from '@agoric/deploy-script-support';
import { AmountMath } from '@agoric/ertp';
import {
  FastUSDCConfigShape,
  getManifestForFastUSDC,
} from '@agoric/fast-usdc/src/fast-usdc.start.js';
import { toExternalConfig } from '@agoric/fast-usdc/src/utils/config-marshal.js';
import {
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { Far } from '@endo/far';
import { parseArgs } from 'node:util';

/**
 * @import {CoreEvalBuilder, DeployScriptFunction} from '@agoric/deploy-script-support/src/externalTypes.js'
 * @import {ParseArgsConfig} from 'node:util'
 * @import {FastUSDCConfig} from '@agoric/fast-usdc/src/fast-usdc.start.js'
 */

const { keys } = Object;

/**
 * @type {Record<string, Pick<FastUSDCConfig, 'oracles' | 'feedPolicy'>>}
 *
 * TODO: determine OCW operator addresses
 * meanwhile, use price oracle addresses (from updatePriceFeeds.js).
 */
const configurations = {
  A3P_INTEGRATION: {
    oracles: {
      gov1: 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q',
      gov2: 'agoric1wrfh296eu2z34p6pah7q04jjuyj3mxu9v98277',
      gov3: 'agoric1ydzxwh6f893jvpaslmaz6l8j2ulup9a7x8qvvq',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'TODO',
      nobleDomainId: 4,
      chainPolicies: {
        Arbitrum: {
          cctpTokenMessengerAddress:
            '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
          chainId: 42161,
          confirmations: 2,
          nobleContractAddress: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
        },
      },
    },
  },
  MAINNET: {
    oracles: {
      DSRV: 'agoric144rrhh4m09mh7aaffhm6xy223ym76gve2x7y78',
      Stakin: 'agoric19d6gnr9fyp6hev4tlrg87zjrzsd5gzr5qlfq2p',
      '01node': 'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8',
      'Simply Staking': 'agoric1krunjcqfrf7la48zrvdfeeqtls5r00ep68mzkr',
      P2P: 'agoric1n4fcxsnkxe4gj6e24naec99hzmc4pjfdccy5nj',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'channel-21',
      nobleDomainId: 4,
      chainPolicies: {
        Arbitrum: {
          cctpTokenMessengerAddress:
            '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
          chainId: 42161,
          confirmations: 2,
          nobleContractAddress: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
        },
      },
    },
  },
  DEVNET: {
    oracles: {
      DSRV: 'agoric1lw4e4aas9q84tq0q92j85rwjjjapf8dmnllnft',
      Stakin: 'agoric1zj6vrrrjq4gsyr9lw7dplv4vyejg3p8j2urm82',
      '01node': 'agoric1ra0g6crtsy6r3qnpu7ruvm7qd4wjnznyzg5nu4',
      'Simply Staking': 'agoric1qj07c7vfk3knqdral0sej7fa6eavkdn8vd8etf',
      P2P: 'agoric10vjkvkmpp9e356xeh6qqlhrny2htyzp8hf88fk',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'TODO',
      nobleDomainId: 4,
      chainPolicies: {
        Arbitrum: {
          cctpTokenMessengerAddress: '0xTODO',
          chainId: 421614,
          confirmations: 2,
          nobleContractAddress: '0xTODO',
        },
      },
    },
  },
  EMERYNET: {
    oracles: {
      gov1: 'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      gov2: 'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'TODO',
      nobleDomainId: 4,
      chainPolicies: {
        Arbitrum: {
          cctpTokenMessengerAddress: '0xTODO',
          chainId: 421614,
          confirmations: 2,
          nobleContractAddress: '0xTODO',
        },
      },
    },
  },
};

/** @type {ParseArgsConfig['options']} */
const options = {
  flatFee: { type: 'string', default: '0.01' },
  variableRate: { type: 'string', default: '0.01' },
  maxVariableFee: { type: 'string', default: '5' },
  contractRate: { type: 'string', default: '0.2' },
  net: { type: 'string' },
  oracle: { type: 'string', multiple: true },
  usdcDenom: {
    type: 'string',
    default:
      'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
  },
};
const oraclesUsage = 'use --oracle name:address ...';

const feedPolicyUsage = 'use --feedPolicy <policy> ...';

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
            install('@agoric/fast-usdc/src/fast-usdc.contract.ts'),
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
    values: { oracle: oracleArgs, net, usdcDenom, feedPolicy, ...fees },
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

  /** @type {FastUSDCConfig} */
  const config = harden({
    oracles: parseOracleArgs(),
    terms: {
      usdcDenom,
    },
    feeConfig: parseFeeConfigArgs(),
    feedPolicy: parseFeedPolicy(),
  });

  await writeCoreEval('start-fast-usdc', utils =>
    defaultProposalBuilder(utils, config),
  );
};
