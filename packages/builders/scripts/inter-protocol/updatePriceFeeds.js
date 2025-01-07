import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifestForPriceFeeds } from '@agoric/inter-protocol/src/proposals/deploy-price-feeds.js';

/** @import {PriceFeedConfig} from '@agoric/inter-protocol/src/proposals/deploy-price-feeds.js'; */

/** @type {Record<string, PriceFeedConfig>} */
const configurations = {
  A3P_INTEGRATION: {
    oracleAddresses: [
      'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q', // GOV1
      'agoric1wrfh296eu2z34p6pah7q04jjuyj3mxu9v98277', // GOV2
      'agoric1ydzxwh6f893jvpaslmaz6l8j2ulup9a7x8qvvq', // GOV3
    ],
    inBrandNames: ['ATOM', 'stATOM'],
  },
  MAINNET: {
    oracleAddresses: [
      'agoric144rrhh4m09mh7aaffhm6xy223ym76gve2x7y78', // DSRV
      'agoric19d6gnr9fyp6hev4tlrg87zjrzsd5gzr5qlfq2p', // Stakin
      'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8', // 01node
      'agoric1krunjcqfrf7la48zrvdfeeqtls5r00ep68mzkr', // Simply Staking
      'agoric1n4fcxsnkxe4gj6e24naec99hzmc4pjfdccy5nj', // P2P
    ],
    inBrandNames: ['ATOM', 'stATOM', 'stOSMO', 'stTIA', 'stkATOM'],
    contractTerms: { minSubmissionCount: 3 },
  },
  DEVNET: {
    oracleAddresses: [
      'agoric1lw4e4aas9q84tq0q92j85rwjjjapf8dmnllnft', // DSRV
      'agoric1zj6vrrrjq4gsyr9lw7dplv4vyejg3p8j2urm82', // Stakin
      'agoric1ra0g6crtsy6r3qnpu7ruvm7qd4wjnznyzg5nu4', // 01node
      'agoric1qj07c7vfk3knqdral0sej7fa6eavkdn8vd8etf', // Simply Staking
      'agoric10vjkvkmpp9e356xeh6qqlhrny2htyzp8hf88fk', // P2P
    ],
    inBrandNames: ['ATOM', 'stTIA', 'stkATOM', 'dATOM'],
  },
  EMERYNET: {
    oracleAddresses: [
      'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce', // GOV1
      'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang', // GOV2
    ],
    inBrandNames: ['ATOM', 'stATOM', 'stOSMO', 'stTIA', 'stkATOM'],
  },
  BOOT_TEST: {
    oracleAddresses: [
      'agoric144rrhh4m09mh7aaffhm6xy223ym76gve2x7y78', // DSRV
      'agoric19d6gnr9fyp6hev4tlrg87zjrzsd5gzr5qlfq2p', // Stakin
      'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8', // 01node
      'agoric1krunjcqfrf7la48zrvdfeeqtls5r00ep68mzkr', // Simply Staking
      'agoric1n4fcxsnkxe4gj6e24naec99hzmc4pjfdccy5nj', // P2P
    ],
    inBrandNames: ['ATOM'],
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
  const { oracleAddresses, inBrandNames, contractTerms } = config;
  console.log(
    'Generating price feeds update proposal with config',
    JSON.stringify({ oracleAddresses, inBrandNames, contractTerms }),
  );
  return harden({
    sourceSpec: '@agoric/inter-protocol/src/proposals/deploy-price-feeds.js',
    getManifestCall: [
      getManifestForPriceFeeds.name,
      {
        oracleAddresses,
        inBrandNames,
        contractTerms,
        priceAggregatorRef: publishRef(
          install(
            '@agoric/inter-protocol/src/price/fluxAggregatorContract.js',
            '../bundles/bundle-fluxAggregatorKit.js',
          ),
        ),
        scaledPARef: publishRef(
          install(
            '@agoric/zoe/src/contracts/scaledPriceAuthority.js',
            '../bundles/bundle-scaledPriceAuthority.js',
          ),
        ),
      },
    ],
  });
};

const Usage = `agoric run updatePriceFeeds.js ${[...knownVariants, '<json-config>'].join(' | ')}`;

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;
  const variantOrConfig = scriptArgs?.[0];
  console.log('updatePriceFeeds.js', variantOrConfig);

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

  await writeCoreEval(
    `gov-price-feeds-${opts.variant || 'from-config'}`,
    async utils => defaultProposalBuilder(utils, opts),
  );
};
