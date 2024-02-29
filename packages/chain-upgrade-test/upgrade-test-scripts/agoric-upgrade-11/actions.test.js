import test from 'ava';

import { agoric, agops } from '../cliHelper.js';
import { GOV1ADDR } from '../constants.js';
import { openVault, adjustVault, closeVault } from '../econHelpers.js';

test.serial('Open Vaults', async t => {
  const currentVaults = await agops.vaults('list', '--from', GOV1ADDR);
  t.is(currentVaults.length, 2);

  await openVault(GOV1ADDR, 7, 11);
  await adjustVault(GOV1ADDR, 'vault3', { giveMinted: 1.5 });
  await adjustVault(GOV1ADDR, 'vault3', { giveCollateral: 2.0 });
  await closeVault(GOV1ADDR, 'vault3', 5.75);

  const vault3 = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.vaults.vault3',
  );
  t.is(vault3.vaultState, 'closed');
  t.is(vault3.locked.value, '0');
  t.is(vault3.debtSnapshot.debt.value, '0');
});
