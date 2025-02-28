/** @file core-eval to 1) update ChainInfo 2) re-request the Noble ICA `intermediateRecipient` */

import { E } from '@endo/far';
import { makeTracer } from '@agoric/internal';

const trace = makeTracer('FUSD-2', true);

// avoid importing all of @agoric/ertp
/** @type {typeof import('@agoric/ertp').AmountMath.make} */
// @ts-expect-error AssetKind conditionals aren't captured
const make = (brand, value) => harden({ brand, value });
/** @type {typeof import('@agoric/zoe/src/contractSupport/ratio').makeRatio} */
const makeRatio = (numerator, numeratorBrand, denominator = 100n) =>
  harden({
    numerator: make(numeratorBrand, numerator),
    denominator: make(numeratorBrand, denominator),
  });

/**
 * @import {CopyRecord} from '@endo/pass-style'
 * @import {IBCConnectionInfo} from '@agoric/orchestration'
 * @import {ManifestBundleRef} from '@agoric/deploy-script-support/src/externalTypes.js'
 * @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js'
 * @import {FastUSDCCorePowers} from './start-fast-usdc.core.js'
 * @import {ContractRecord, FeeConfig} from './types.js'
 */

/**
 * Update feeConfig.variableRate to 0.5%, i.e. 5n/1000n
 *
 * @param {FeeConfig} feeConfigPre
 * @param {Brand<'nat'>} usdcBrand
 * @param {Ratio} [variableRate]
 * @returns {FeeConfig}
 */
const updateFeeConfig = (
  feeConfigPre,
  usdcBrand,
  variableRate = makeRatio(5n, usdcBrand, 1000n),
) => harden({ ...feeConfigPre, variableRate });

/**
 * @typedef {object} UpdateOpts
 * @property {IBCConnectionInfo} [agoricToNoble]
 * @property {{bundleID: BundleID}} [fastUsdcCode]
 */

const config = /** @type {const} */ ({
  MAINNET: {
    agoricToNoble: {
      id: 'connection-72',
      client_id: '07-tendermint-77',
      counterparty: {
        client_id: '07-tendermint-32',
        connection_id: 'connection-38', // was: connection-40
      },
      state: 3,
      transferChannel: {
        channelId: 'channel-62',
        portId: 'transfer',
        counterPartyChannelId: 'channel-21',
        counterPartyPortId: 'transfer',
        ordering: 0,
        state: 3,
        version: 'ics20-1',
      },
    },
  },
});
harden(config);

/**
 * @param {BootstrapPowers & FastUSDCCorePowers} powers
 * @param {object} [config]
 * @param {UpdateOpts} [config.options]
 */
export const updateNobleICA = async (
  { consume: { chainStorage, fastUsdcKit }, produce },
  { options = {} } = {},
) => {
  trace('options', options);
  const {
    agoricToNoble = config.MAINNET.agoricToNoble,
    fastUsdcCode = assert.fail('missing bundleID'),
  } = options;
  const kitPre = await fastUsdcKit;
  const { adminFacet, creatorFacet, publicFacet } = kitPre;
  trace('got privateArgs', Object.keys(kitPre.privateArgs));

  const { brand: usdcBrand } = kitPre.privateArgs.feeConfig.flat;
  // TODO: update agoricToNoble in kitPost.privateArgs.chainInfo too
  const kitPost = harden({
    ...kitPre,
    privateArgs: {
      ...kitPre.privateArgs,
      feeConfig: updateFeeConfig(kitPre.privateArgs.feeConfig, usdcBrand),
    },
  });
  const upgraded = await E(adminFacet).upgradeContract(
    fastUsdcCode.bundleID,
    kitPost.privateArgs,
  );
  trace(upgraded);
  produce.fastUsdcKit.reset();
  produce.fastUsdcKit.resolve(kitPost);

  const { agoric, noble } = kitPre.privateArgs.chainInfo;
  const nobleICAaddr = await E(creatorFacet).connectToNoble(
    agoric.chainId,
    noble.chainId,
    agoricToNoble,
  );
  trace('noble ICA', nobleICAaddr);

  // publish ICA addr with the other addresses
  const contractName = 'fastUsdc';
  const contractNode = E(chainStorage)?.makeChildNode(contractName);
  const { addresses } = await E(publicFacet).getStaticInfo();
  /** @type {ContractRecord} */
  const addrs = { ...addresses, nobleICA: nobleICAaddr.value };
  void E(contractNode)?.setValue(JSON.stringify(addrs));
};

/**
 * @param {unknown} _utils
 * @param {{
 *   installKeys: { fastUsdc: ERef<ManifestBundleRef> };
 *   options: Omit<UpdateOpts, 'fastUsdcCode'> & CopyRecord;
 * }} opts
 */
export const getManifestForUpdateNobleICA = (
  _utils,
  { installKeys, options },
) => {
  return {
    /** @type {BootstrapManifest} */
    manifest: {
      [updateNobleICA.name]: {
        consume: { chainStorage: true, fastUsdcKit: true },
        produce: { fastUsdcKit: true },
      },
    },
    options: { ...options, fastUsdcCode: installKeys.fastUsdc },
  };
};
