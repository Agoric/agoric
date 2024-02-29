import test from 'ava';

import {
  provisionWallet,
  implementNewAuctionParams,
  raiseDebtCeiling,
  pushPrice,
} from './actions.js';
import { agd, agoric, agops } from '../cliHelper.js';
import { GOV1ADDR, GOV2ADDR } from '../constants.js';
import { getUser, newOfferId, waitForBlock } from '../commonUpgradeHelpers.js';
import { submitDeliverInbound } from './upgradeHelpers.js';
import { openVault, adjustVault, closeVault } from '../econHelpers.js';

const START_FREQUENCY = 600; // StartFrequency: 600s (auction runs every 10m)
const CLOCK_STEP = 20; // ClockStep: 20s (ensures auction completes in time)
const PRICE_LOCK_PERIOD = 300;
const oraclesAddresses = [GOV1ADDR, GOV2ADDR];

test.before(async t => {
  await waitForBlock(2);
  await submitDeliverInbound('user1');

  const oracles = [];
  for (const oracle of oraclesAddresses) {
    const offerId = await newOfferId();
    oracles.push({ address: oracle, id: offerId });
  }

  t.context.oracles = oracles;
});

test.serial('Ensure user2 provisioned', async t => {
  await provisionWallet('user2');

  const user2Address = await getUser('user2');
  const data = await agd.query(
    'vstorage',
    'data',
    `published.wallet.${user2Address}`,
  );

  t.not(data.value, '');
});

test.serial('Ensure auction params have changed', async t => {
  await implementNewAuctionParams(
    GOV1ADDR,
    t.context.oracles,
    START_FREQUENCY,
    CLOCK_STEP,
    PRICE_LOCK_PERIOD,
  );

  const govParams = await agoric.follow('-lF', ':published.auction.governance');
  t.is(govParams.current.ClockStep.value.relValue, CLOCK_STEP.toString());
  t.is(
    govParams.current.StartFrequency.value.relValue,
    START_FREQUENCY.toString(),
  );
});

test.serial('Ensure debt ceiling raised', async t => {
  await raiseDebtCeiling(GOV1ADDR);
  const params = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.governance',
  );
  t.is(params.current.DebtLimit.value.value, '123000000000000');
});

test.serial('Update oracle prices', async t => {
  await pushPrice(t.context.oracles, 12.01);

  t.pass();
});

test.serial('Open Vaults', async t => {
  const currentVaults = await agops.vaults('list', '--from', GOV1ADDR);
  t.is(currentVaults.length, 0);

  const vaults = [
    { mint: 5.0, collateral: 9.0 },
    { mint: 6.0, collateral: 10.0 },
  ];

  for (const vault of vaults) {
    await openVault(GOV1ADDR, vault.mint, vault.collateral);
  }

  await adjustVault(GOV1ADDR, 'vault0', { wantCollateral: 1.0 });
  await adjustVault(GOV1ADDR, 'vault0', { wantMinted: 1.0 });
  await closeVault(GOV1ADDR, 'vault1', 6.06);

  const user2 = await getUser('user2');
  await openVault(user2, 7, 11);
  await adjustVault(user2, 'vault2', { giveMinted: 1.5 });
  await adjustVault(user2, 'vault2', { giveCollateral: 2.0 });
  await closeVault(user2, 'vault2', 5.75);

  t.pass();
});
