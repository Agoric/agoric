// @ts-nocheck

import test from 'ava';
import path from 'path';

import { loadBasedir, buildVatController } from '@agoric/swingset-vat';
import bundleSource from '@endo/bundle-source';
// eslint-disable-next-line -- not in the TS project
import zcfBundle from '../../../bundles/bundle-contractFacet.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const CONTRACT_FILES = ['crashingAutoRefund'];
const contractBundles = {};
const generateBundlesP = Promise.all(
  CONTRACT_FILES.map(async contract => {
    const bundle = await bundleSource(`${dirname}/${contract}`);
    contractBundles[contract] = { bundle };
  }),
);

async function main(argv) {
  const config = await loadBasedir(dirname);
  config.vats.zoe = {
    sourceSpec: `${dirname}/../../../../vats/src/vat-zoe.js`,
  };
  config.defaultManagerType = 'xs-worker';
  await generateBundlesP;
  config.bundles = { zcf: { bundle: zcfBundle }, ...contractBundles };
  config.relaxDurabilityRules = true;
  const controller = await buildVatController(config, argv);
  await controller.run();
  const res = controller.dump();
  await controller.shutdown();
  return res;
}

const throwInOfferLog = [
  '=> alice is set up',
  '=> alice.doThrowInHook called',
  'counter: 2',
  'outcome correctly resolves to broken: Error: someException',
  'counter: 4',
  'aliceMoolaPurse: balance {"brand":{},"value":3}',
  'aliceSimoleanPurse: balance {"brand":{},"value":0}',
  'counter: 5',
  'newCounter: 2',
  'Successful refund: The offer was accepted',
  'new Purse: balance {"brand":{},"value":3}',
  'aliceSimoleanPurse: balance {"brand":{},"value":0}',
  'counter: 7',
];

test('ZCF throwing on invitation exercise', async t => {
  const dump = await main(['throwInOfferHook', [3, 0, 0]]);
  t.deepEqual(dump.log, throwInOfferLog);
});

const throwInAPILog = [
  '=> alice is set up',
  '=> alice.doThrowInApiCall called',
  'counter: 3',
  'Swap outcome is an invitation (true).',
  'throwingAPI should throw Error: someException',
  'counter: 5',
  'counter: 6',
  'newCounter: 2',
  'counter: 7',
  'outcome correctly resolves: "The offer has been accepted. Once the contract has been completed, please check your payout"',
  'aliceMoolaPurse: balance {"brand":{},"value":3}',
  'aliceSimoleanPurse: balance {"brand":{},"value":8}',
  'second moolaPurse: balance {"brand":{},"value":2}',
  'second simoleanPurse: balance {"brand":{},"value":4}',
];

test('ZCF throwing in API call', async t => {
  const dump = await main(['throwInApiCall', [5, 12, 0]]);
  t.deepEqual(dump.log, throwInAPILog);
});

const thrownExceptionInStartILog = [
  '=> alice is set up',
  '=> alice.doThrowInStart called',
  'contract creation failed: Error: blowup in makeContract',
  'newCounter: 2',
];

test('throw in makeContract call', async t => {
  const dump = await main(['throwInStart', [3, 0, 0]]);
  t.deepEqual(dump.log, thrownExceptionInStartILog);
});

const happyTerminationLog = [
  '=> alice is set up',
  '=> alice.doHappyTermination called',
  'happy termination saw "Success"',
];

test('happy termination path', async t => {
  const dump = await main(['happyTermination', [3, 0, 0]]);
  t.deepEqual(dump.log, happyTerminationLog);
});

const happyTerminationWOffersLog = [
  '=> alice is set up',
  '=> alice.doHappyTerminationWOffers called',
  'seat has been exited: [object Promise]',
  'Swap outcome rejected before fulfillment: "Error: vat terminated"',
  'happy termination saw "Success"',
  'second moolaPurse: balance {"brand":{},"value":5}',
  'second simoleanPurse: balance {"brand":{},"value":0}',
];

test('happy termination with offers path', async t => {
  const dump = await main(['happyTerminationWOffers', [5, 0, 0]]);
  t.deepEqual(dump.log, happyTerminationWOffersLog);
});

const doHappyTerminationRefusesContactLog = [
  '=> alice is set up',
  '=> alice.doHappyTerminationWOffers called',
  'offer correctly refused: "Error: No further offers are accepted"',
  'happy termination saw "Success"',
  'can\'t make more invitations because "Error: vat terminated"',
];

test('happy termination refuses contact path', async t => {
  const dump = await main(['doHappyTerminationRefusesContact', [5, 0, 0]]);
  t.deepEqual(dump.log, doHappyTerminationRefusesContactLog);
});

const sadTerminationLog = [
  '=> alice is set up',
  '=> alice.doSadTermination called',
  'sad termination saw reject "Sadness"',
];

test('sad termination path', async t => {
  const dump = await main(['sadTermination', [3, 0, 0]]);
  t.deepEqual(dump.log, sadTerminationLog);
});
