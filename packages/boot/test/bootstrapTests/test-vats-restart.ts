/** @file Bootstrap test of restarting (almost) all vats */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';

import processAmbient from 'child_process';
import { promises as fsAmbientPromises } from 'fs';

import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { TestFn } from 'ava';
import { BridgeHandler } from '@agoric/vats';
import type { EconomyBootstrapSpace } from '@agoric/inter-protocol/src/proposals/econ-behaviors.js';
import {
  makeProposalExtractor,
  makeSwingsetTestKit,
} from '../../tools/supports.ts';
import { makeWalletFactoryDriver } from '../../tools/drivers.ts';

const { Fail } = assert;

// main/production config doesn't have initialPrice, upon which 'open vaults' depends
const PLATFORM_CONFIG = '@agoric/vm-config/decentral-itest-vaults-config.json';

export const makeTestContext = async t => {
  console.time('DefaultTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log, 'bundles/vaults', {
    configSpecifier: PLATFORM_CONFIG,
  });

  const { runUtils, storage } = swingsetTestKit;
  console.timeLog('DefaultTestContext', 'swingsetTestKit');
  const { EV } = runUtils;

  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  await eventLoopIteration();

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(
    swingsetTestKit.storage,
  );
  agoricNamesRemotes.brand.ATOM || Fail`ATOM brand not yet defined`;
  console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    storage,
    agoricNamesRemotes,
  );
  console.timeLog('DefaultTestContext', 'walletFactoryDriver');

  console.timeEnd('DefaultTestContext');

  return {
    ...swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
  };
};

const test = anyTest as TestFn<Awaited<ReturnType<typeof makeTestContext>>>;

// presently all these tests use one collateral manager
const collateralBrandKey = 'ATOM';

test.before(async t => {
  t.context = await makeTestContext(t);
});
test.after.always(t => t.context.shutdown?.());

const walletAddr = 'agoric1a';

test.serial('open vault', async t => {
  const { walletFactoryDriver } = t.context;

  const wd = await walletFactoryDriver.provideSmartWallet(walletAddr);
  t.true(wd.isNew);

  await wd.executeOfferMaker(Offers.vaults.OpenVault, {
    offerId: 'open1',
    collateralBrandKey,
    wantMinted: 5.0,
    giveCollateral: 9.0,
  });

  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: { id: 'open1', numWantsSatisfied: 1 },
  });
});

test.serial('run network vat proposal', async t => {
  const { buildProposal, evalProposal } = t.context;

  t.log('building network proposal');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/vats/init-network.js'),
  );

  t.pass(); // reached here without throws
});

test.serial('register network protocol before upgrade', async t => {
  const { EV } = t.context.runUtils;
  const net = await EV.vat('bootstrap').consumeItem('networkVat');
  const h1 = await EV(net).makeLoopbackProtocolHandler();

  t.log('register P1');
  await EV(net).registerProtocolHandler(['P1'], h1);

  t.log('register P1 again? No.');
  await t.throwsAsync(EV(net).registerProtocolHandler(['P1'], h1), {
    message: /key "P1" already registered/,
  });
});

test.serial('run restart-vats proposal', async t => {
  const { controller, buildProposal, evalProposal } = t.context;

  t.log('building proposal');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/vats/restart-vats.js'),
  );

  t.pass(); // reached here without throws
});

test.serial('networkVat registrations are durable', async t => {
  const { EV } = t.context.runUtils;
  const net = await EV.vat('bootstrap').consumeItem('networkVat');

  const h2 = await EV(net).makeLoopbackProtocolHandler();
  t.log('register P1 again? No.');
  await t.throwsAsync(EV(net).registerProtocolHandler(['P1'], h2), {
    message: /key "P1" already registered/,
  });

  t.log('IBC protocol handler already registered?');
  await t.throwsAsync(
    EV(net).registerProtocolHandler(['/ibc-port', '/ibc-hop'], h2),
    {
      message: /key "\/ibc-port" already registered in collection "prefix"/,
    },
  );
});

test.serial('read metrics', async t => {
  const { EV } = t.context.runUtils;

  const vaultFactoryKit: Awaited<
    EconomyBootstrapSpace['consume']['vaultFactoryKit']
  > = await EV.vat('bootstrap').consumeItem('vaultFactoryKit');

  const vfTopics = await EV(vaultFactoryKit.publicFacet).getPublicTopics();

  const vfMetricsPath = await EV.get(vfTopics.metrics).storagePath;
  t.is(vfMetricsPath, 'published.vaultFactory.metrics');

  await t.throwsAsync(
    EV(vfTopics.metrics.subscriber).getUpdateSince(),
    undefined,
    'reconnecting subscriber not expected to work',
  );
});

test.serial('open second vault', async t => {
  const { walletFactoryDriver } = t.context;

  const wd = await walletFactoryDriver.provideSmartWallet(walletAddr);
  t.false(wd.isNew);

  await wd.executeOfferMaker(Offers.vaults.OpenVault, {
    offerId: 'open2',
    collateralBrandKey,
    wantMinted: 5.0,
    giveCollateral: 9.0,
  });

  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: { id: 'open2', numWantsSatisfied: 1 },
  });
});
