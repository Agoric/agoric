import anyTest from 'ava';
import path from 'path';
import { buildVatController, buildKernelBundles } from '@agoric/swingset-vat';
import bundleSource from '@endo/bundle-source';
// eslint-disable-next-line -- not in the TS project
import zcfBundle from '../../../bundles/bundle-contractFacet.js';

// offerArgsUsageContract is just used as a generic contract for the
// purpose of registering a feeBrand before any zcfMint for the
// feeBrand is made
const CONTRACT_FILES = ['runMintContract', 'offerArgsUsageContract'];

const dirname = path.dirname(new URL(import.meta.url).pathname);

/** @type {import('ava').TestFn<{ data: { kernelBundles: any, config: any } }>} */
const test = anyTest;

test.before(async t => {
  const start = Date.now();
  const kernelBundles = await buildKernelBundles();
  const step2 = Date.now();
  const contractBundles = {};
  const contractNames = [];
  await Promise.all(
    CONTRACT_FILES.map(async settings => {
      let bundleName;
      let contractPath;
      if (typeof settings === 'string') {
        bundleName = settings;
        contractPath = settings;
      } else {
        ({ bundleName, contractPath } = settings);
      }
      const source = `${dirname}/../../${contractPath}`;
      const bundle = await bundleSource(source);
      contractBundles[bundleName] = { bundle };
      contractNames.push(bundleName);
    }),
  );
  const step3 = Date.now();

  const vats = {};
  await Promise.all(
    ['alice'].map(async name => {
      const source = `${dirname}/vat-${name}.js`;
      const bundle = await bundleSource(source);
      vats[name] = { bundle };
    }),
  );
  vats.zoe = {
    sourceSpec: `${dirname}/../../../../vats/src/vat-zoe.js`,
  };
  const bootstrapSource = `${dirname}/bootstrap.js`;
  vats.bootstrap = {
    bundle: await bundleSource(bootstrapSource),
    parameters: { contractNames }, // argv will be added to this
  };
  const config = { bootstrap: 'bootstrap', vats };
  config.bundles = { zcf: { bundle: zcfBundle }, ...contractBundles };
  config.defaultManagerType = 'xs-worker';

  const step4 = Date.now();
  const ktime = `${(step2 - start) / 1000}s kernel`;
  const ctime = `${(step3 - step2) / 1000}s contracts`;
  const vtime = `${(step4 - step3) / 1000}s vats`;
  const ttime = `${(step4 - start) / 1000}s total`;
  console.log(`bundling: ${ktime}, ${ctime}, ${vtime}, ${ttime}`);

  t.context.data = { kernelBundles, config };
});

async function main(t, argv) {
  const { kernelBundles, config } = t.context.data;
  const controller = await buildVatController(config, argv, { kernelBundles });
  t.teardown(controller.shutdown);
  await controller.run();
  return controller.dump();
}

const expected = [
  'starting runMintTest',
  '{"RUN":{}}',
  'first instance started',
  'second instance started',
  'first payment minted',
  'second payment minted',
  '{"brand":{},"value":10}',
  '{"brand":{},"value":10}',
];

test.serial('zcfMint for RUN, multiple contracts', async t => {
  const dump = await main(t);
  t.deepEqual(dump.log, expected);
});
