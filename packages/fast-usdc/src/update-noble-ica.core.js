/** @file core-eval to 1) update ChainInfo 2) re-request the Noble ICA `intermediateRecipient` */

import { E } from '@endo/far';
import { makeTracer } from '@agoric/internal';

const trace = makeTracer('FUSD-2', true);

/**
 * @import {CopyRecord} from '@endo/pass-style'
 * @import {IBCConnectionInfo} from '@agoric/orchestration'
 * @import {ManifestBundleRef} from '@agoric/deploy-script-support/src/externalTypes.js'
 * @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js'
 * @import {FastUSDCCorePowers} from './start-fast-usdc.core.js'
 * @import {ContractRecord} from './types.js'
 */

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
  { consume: { chainStorage, fastUsdcKit } },
  { options = {} } = {},
) => {
  trace('options', options);
  const {
    agoricToNoble = config.MAINNET.agoricToNoble,
    fastUsdcCode = assert.fail('missing bundleID'),
  } = options;
  const { adminFacet, creatorFacet, privateArgs, publicFacet } =
    await fastUsdcKit;
  trace('upgradeContract follows with privateArgs:', Object.keys(privateArgs));
  const upgraded = await E(adminFacet).upgradeContract(
    fastUsdcCode.bundleID,
    privateArgs,
  );
  trace(`DON'T PANIC if you see "CORE_EVAL failed" from v1 above. See #11013`);
  trace('fastUsdc upgraded', upgraded);

  const { agoric, noble } = privateArgs.chainInfo;
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
      },
    },
    options: { ...options, fastUsdcCode: installKeys.fastUsdc },
  };
};
