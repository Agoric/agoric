// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@endo/init';
// eslint-disable-next-line import/no-extraneous-dependencies
import rawTest from 'ava';
import path from 'path';
import { buildVatController, buildKernelBundles } from '@agoric/swingset-vat';
import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import zcfBundle from '@agoric/zoe/bundles/bundle-contractFacet.js';

import liquidateMinimumBundle from '../../../bundles/bundle-liquidateMinimum.js';
import ammBundle from '../../../bundles/bundle-amm.js';
import vaultFactoryBundle from '../../../bundles/bundle-vaultFactory.js';
import committeeBundle from '../../../bundles/bundle-committee.js';
import contractGovernorBundle from '../../../bundles/bundle-contractGovernor.js';
import binaryVoteCounterBundle from '../../../bundles/bundle-binaryVoteCounter.js';

/**
 * @type {import('ava').TestInterface<{
 *   data: { kernelBundles: any; config: any };
 * }>}
 */
/** @type {any} */
const test = rawTest;

/**
 * @param {Record<string, unknown>} contractBundles
 * @param {string[]} vatNames
 * @returns {Promise<SwingSetConfig>}
 */
export const buildSwingSetConfig = async (contractBundles, vatNames) => {
  const filename = new URL(import.meta.url).pathname;
  const dirname = path.dirname(filename);

  const vatNameToSource = vatNames.map(name => {
    const source = `${dirname}/vat-${name}.js`;
    return [name, source];
  });
  const bootstrapSource = `${dirname}/bootstrap.js`;
  vatNameToSource.push(['bootstrap', bootstrapSource]);

  const bundles = await Promise.all(
    vatNameToSource.map(([_, source]) => bundleSource(source)),
  );

  /** @type {SwingSetConfigDescriptor} */
  const vats = {};
  [...vatNames, 'bootstrap'].forEach(
    (name, index) => (vats[name] = { bundle: bundles[index] }),
  );
  vats.bootstrap.parameters = { contractBundles };

  const config = { bootstrap: 'bootstrap', vats };
  config.bundles = { zcf: { bundle: zcfBundle } };
  config.defaultManagerType = 'xs-worker';
  return config;
};

test.before(async t => {
  const kernelBundles = await buildKernelBundles();

  const contractBundles = {
    liquidateMinimum: liquidateMinimumBundle,
    amm: ammBundle,
    vaultFactory: vaultFactoryBundle,
    committee: committeeBundle,
    contractGovernor: contractGovernorBundle,
    binaryVoteCounter: binaryVoteCounterBundle,
  };

  const vatNames = ['alice', 'zoe', 'priceAuthority', 'owner'];

  const config = await buildSwingSetConfig(contractBundles, vatNames);

  t.context.data = { kernelBundles, config };
});

async function main(t, argv) {
  const { kernelBundles, config } = t.context.data;
  const controller = buildVatController(config, argv, { kernelBundles });
  await E(controller).run();
  return E(controller).dump();
}

// NB: yarn build if changing any of the contract bundles under test
test.serial('vaultFactory', async t => {
  const startingValues = [[100], [1000]]; // [aliceValues, ownerValues]
  const dump = await main(t, ['oneLoanWithInterest', startingValues]);
  t.snapshot(dump.log);
});
