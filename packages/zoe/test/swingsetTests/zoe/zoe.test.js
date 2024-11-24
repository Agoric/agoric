// @ts-nocheck
import test from 'ava';
import path from 'path';
import { buildVatController, buildKernelBundles } from '@agoric/swingset-vat';
import bundleSource from '@endo/bundle-source';
// eslint-disable-next-line -- not in the TS project
import zcfBundle from '../../../bundles/bundle-contractFacet.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const CONTRACT_FILES = [
  'automaticRefund',
  'autoswap',
  'coveredCall',
  {
    contractPath: 'auction/index',
    bundleName: 'secondPriceAuction',
  },
  'atomicSwap',
  'simpleExchange',
  'sellItems',
  'mintAndSellNFT',
  'otcDesk',
];

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
      const source = `${dirname}/../../../src/contracts/${contractPath}.js`;
      const bundle = await bundleSource(source);
      contractBundles[bundleName] = { bundle };
      contractNames.push(bundleName);
    }),
  );
  const bundles = { zcf: { bundle: zcfBundle }, ...contractBundles };
  const step3 = Date.now();

  const vats = {};
  await Promise.all(
    ['alice', 'bob', 'carol', 'dave'].map(async name => {
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
  const config = { bootstrap: 'bootstrap', vats, bundles };
  config.defaultManagerType = 'xs-worker';
  config.relaxDurabilityRules = true;

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

test.serial('zoe - automaticRefund - valid inputs', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 17, 0],
  ];
  const dump = await main(t, ['automaticRefundOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - coveredCall - valid inputs', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 7, 0],
  ];
  const dump = await main(t, ['coveredCallOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - swapForOption - valid inputs', async t => {
  const startingValues = [
    [3, 0, 0], // Alice starts with 3 moola
    [0, 0, 0], // Bob starts with nothing
    [0, 0, 0], // Carol starts with nothing
    [0, 7, 1], // Dave starts with 7 simoleans and 1 buck
  ];
  const dump = await main(t, ['swapForOptionOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - secondPriceAuction - valid inputs', async t => {
  const startingValues = [
    [1, 0, 0],
    [0, 11, 0],
    [0, 7, 0],
    [0, 5, 0],
  ];
  const dump = await main(t, ['secondPriceAuctionOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - atomicSwap - valid inputs', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 7, 0],
  ];
  const dump = await main(t, ['atomicSwapOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - simpleExchange - valid inputs', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 7, 0],
  ];
  const dump = await main(t, ['simpleExchangeOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - simpleExchange - state Update', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 24, 0],
  ];
  const dump = await main(t, ['simpleExchangeNotifier', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - autoswap - valid inputs', async t => {
  const startingValues = [
    [10, 5, 0],
    [3, 7, 0],
  ];
  const dump = await main(t, ['autoswapOk', startingValues]);
  t.snapshot(dump.log);
});

test.serial('zoe - sellTickets - valid inputs', async t => {
  const startingValues = [
    [0, 0, 0],
    [22, 0, 0],
  ];
  const dump = await main(t, ['sellTicketsOk', startingValues]);
  t.snapshot(dump.log);
});

test('zoe - otcDesk - valid inputs', async t => {
  const startingValues = [
    [10000, 10000, 10000],
    [10000, 10000, 10000],
  ];
  const dump = await main(t, ['otcDeskOk', startingValues]);
  t.snapshot(dump.log);
});

const expectedBadTimerLog = [
  '=> alice and bob are set up',
  '=> alice.doBadTimer called',
  'is a zoe invitation: true',
  'aliceMoolaPurse: balance {"brand":{},"value":3}',
  'aliceSimoleanPurse: balance {"brand":{},"value":0}',
];

// TODO: Unskip. See https://github.com/Agoric/agoric-sdk/issues/1625
test.skip('zoe - bad timer', async t => {
  const startingValues = [
    [3, 0, 0],
    [0, 0, 0],
  ];
  const dump = await main(t, ['badTimer', startingValues]);
  t.deepEqual(dump.log, expectedBadTimerLog);
});

test.serial('zoe - shutdown autoswap', async t => {
  const startingValues = [
    [10, 5, 0],
    [3, 7, 0],
  ];
  const dump = await main(t, ['shutdownAutoswap', startingValues]);
  t.snapshot(dump.log);
});
