import test from 'ava';

import { agd, agoric } from '../cliHelper.js';
import { waitForBlock } from '../commonUpgradeHelpers.js';

test.before(async () => {
  console.log('Wait for upgrade to settle');

  await waitForBlock(5);
});

test('Validate vaults', async t => {
  const vaults = await agd.query(
    'vstorage',
    'children',
    'published.vaultFactory.managers.manager0.vaults',
  );

  t.is(vaults.children.length, 3);

  const metrics = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.metrics',
  );

  t.is(metrics.numActiveVaults, 1);
  t.is(metrics.totalDebt.value, '6030000');
  t.is(metrics.totalCollateral.value, '8000000');

  const vault0 = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.vaults.vault0',
  );
  t.is(vault0.vaultState, 'active');
  t.is(vault0.locked.value, '8000000');
  t.is(vault0.debtSnapshot.debt.value, '6030000');

  const vault1 = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.vaults.vault1',
  );
  t.is(vault1.vaultState, 'closed');
  t.is(vault1.locked.value, '0');
  t.is(vault1.debtSnapshot.debt.value, '0');

  const vault2 = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.vaults.vault2',
  );
  t.is(vault2.vaultState, 'closed');
  t.is(vault2.locked.value, '0');
  t.is(vault2.debtSnapshot.debt.value, '0');
});
