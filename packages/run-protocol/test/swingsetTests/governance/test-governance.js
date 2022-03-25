// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@endo/init';
// eslint-disable-next-line import/no-extraneous-dependencies
import rawTest from 'ava';
import { buildVatController, buildKernelBundles } from '@agoric/swingset-vat';
import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import path from 'path';
import zcfBundle from '@agoric/zoe/bundles/bundle-contractFacet.js';
import {
  governanceBundles,
  economyBundles,
} from '../../../src/importedBundles.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

/**
 * @type {import('ava').TestInterface<{
 *   data: { kernelBundles: any; config: any };
 * }>}
 */
/** @type {any} */
const test = rawTest;

test.before(async t => {
  const kernelBundles = await buildKernelBundles();

  const contractBundles = {
    liquidateMinimum: economyBundles.liquidate,
    amm: economyBundles.amm,
    vaultFactory: economyBundles.VaultFactory,
    committee: governanceBundles.committee,
    contractGovernor: governanceBundles.contractGovernor,
    binaryVoteCounter: governanceBundles.binaryVoteCounter,
  };

  const vatNames = ['alice', 'owner', 'priceAuthority', 'voter', 'zoe'];
  const vatNameToSource = vatNames.map(name => {
    const source = `${dirname}/vat-${name}.js`;
    return [name, source];
  });
  const bootstrapSource = `${dirname}/bootstrap.js`;
  vatNameToSource.push(['bootstrap', bootstrapSource]);

  const bundles = await Promise.all(
    vatNameToSource.map(([_, source]) => bundleSource(source)),
  );
  const vats = {};
  [...vatNames, 'bootstrap'].forEach(
    (name, index) => (vats[name] = { bundle: bundles[index] }),
  );

  vats.bootstrap.parameters = { contractBundles };

  const config = { bootstrap: 'bootstrap', vats };
  config.bundles = { zcf: { bundle: zcfBundle } };
  config.defaultManagerType = 'xs-worker';

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
