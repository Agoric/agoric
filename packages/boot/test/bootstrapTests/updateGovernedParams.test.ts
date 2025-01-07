/**
 * @file  The goal of this test is to ensure that governance can update params
 * after an upgrade. There was a point when the contractGovernor kept trying to
 * use the old paramManager which was ephemeral and no longer useable.
 *
 * 1. enter a bid
 * 2. force prices to drop so a vault liquidates
 * 3. verify that the bidder gets the liquidated assets.
 */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import type { TestFn } from 'ava';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { Fail } from '@endo/errors';

import { makeSwingsetTestKit } from '../../tools/supports.js';
import {
  makeGovernanceDriver,
  makeWalletFactoryDriver,
} from '../../tools/drivers.js';
import {
  updateVaultDirectorParams,
  updateVaultManagerParams,
} from '../tools/changeVaultParams.js';

const makeDefaultTestContext = async t => {
  console.time('DefaultTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log);

  const { runUtils, storage } = swingsetTestKit;
  console.timeLog('DefaultTestContext', 'swingsetTestKit');
  const { EV } = runUtils;

  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(
    swingsetTestKit.storage,
  );
  agoricNamesRemotes.brand.ATOM || Fail`ATOM missing from agoricNames`;
  console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    storage,
    agoricNamesRemotes,
  );
  console.timeLog('DefaultTestContext', 'walletFactoryDriver');

  console.timeEnd('DefaultTestContext');

  const gd = await makeGovernanceDriver(
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    [
      'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
      'agoric1w8wktaur4zf8qmmtn3n7x3r0jhsjkjntcm3u6h',
    ],
  );

  return { ...swingsetTestKit, agoricNamesRemotes, gd };
};

const test = anyTest as TestFn<
  Awaited<ReturnType<typeof makeDefaultTestContext>>
>;

test.before(async t => {
  t.context = await makeDefaultTestContext(t);
});
test.after.always(async t => {
  return t.context.shutdown && t.context.shutdown();
});

test('modify manager & director params; update vats, check', async t => {
  const { agoricNamesRemotes, evalProposal, buildProposal, gd } = t.context;

  const { ATOM } = agoricNamesRemotes.brand;
  ATOM || Fail`ATOM missing from agoricNames`;

  const { EV } = t.context.runUtils;
  const zoe: ZoeService = await EV.vat('bootstrap').consumeItem('zoe');
  const vaultFactoryKit =
    await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  const brands = await EV(zoe).getBrands(vaultFactoryKit.instance);

  // /// Modify Manager params ///////////////
  t.log('modify manager params');
  const getDebtLimitValue = async () => {
    const params = await EV(vaultFactoryKit.publicFacet).getGovernedParams({
      collateralBrand: brands.ATOM,
    });

    // @ts-expect-error getGovernedParams doesn't declare these fields
    return params.DebtLimit.value.value;
  };

  t.is(await getDebtLimitValue(), 1_000_000_000n);
  await updateVaultManagerParams(t, gd, ATOM, 50_000_000n);

  t.is(await getDebtLimitValue(), 50_000_000n);

  // /// Modify Director params ///////////////
  t.log('modify director params');
  const directorPF = vaultFactoryKit.publicFacet;
  const subscriptionPre = await EV(directorPF).getElectorateSubscription();

  const iteratorP = await EV(subscriptionPre)[Symbol.asyncIterator]();
  let next = await EV(iteratorP).next();

  const ORIGINAL_GUI =
    'bafybeidvpbtlgefi3ptuqzr2fwfyfjqfj6onmye63ij7qkrb4yjxekdh3e';

  t.is(next.value.current.ReferencedUI.value, ORIGINAL_GUI);

  const SOME_GUI = 'someGUIHASH';
  await updateVaultDirectorParams(t, gd, SOME_GUI);

  next = await EV(iteratorP).next();
  t.is(next.value.current.ReferencedUI.value, SOME_GUI);

  const ANOTHER_GUI = 'anotherGUIHASH';
  await updateVaultDirectorParams(t, gd, ANOTHER_GUI);

  next = await EV(iteratorP).next();
  t.is(next.value.current.ReferencedUI.value, ANOTHER_GUI);

  // /// run the coreEval ///////////////
  t.log('upgrade priceFeeds, vaults, and auctions');
  const priceFeedBuilder =
    '@agoric/builders/scripts/inter-protocol/updatePriceFeeds.js';
  const coreEvals = await Promise.all([
    buildProposal(priceFeedBuilder, ['BOOT_TEST']),
    buildProposal('@agoric/builders/scripts/vats/upgradeVaults.js'),
    buildProposal('@agoric/builders/scripts/vats/add-auction.js'),
  ]);
  const combined = {
    evals: coreEvals.flatMap(e => e.evals),
    bundles: coreEvals.flatMap(e => e.bundles),
  };
  t.log('evaluating', coreEvals.length, 'scripts');
  await evalProposal(combined);

  // verify manager params restored to latest value
  t.is(await getDebtLimitValue(), 50_000_000n);

  // verify director params restored to latest value
  const subscriptionPost = await EV(directorPF).getElectorateSubscription();
  const { head } = await EV(subscriptionPost).subscribeAfter();
  t.is(head.value.current.ReferencedUI.value, ANOTHER_GUI);
});
