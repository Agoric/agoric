import test from 'ava';

import { agd, agoric, agops } from '../cliHelper.js';
import { GOV1ADDR, SDK_ROOT } from '../constants.js';
import { installBundles, runZcfUpgrade, runProber } from './actions.js';
import { adjustVault, closeVault, mintIST, openVault } from '../econHelpers.js';

test.before(async t => {
  await mintIST(GOV1ADDR, 12340000000, 10000, 2000);

  const bundlesData = [
    {
      name: 'Zcf-upgrade',
      filePath: `${SDK_ROOT}/packages/zoe/src/contractFacet/vatRoot.js`,
    },
    {
      name: 'Zoe-upgrade',
      filePath: `${SDK_ROOT}/packages/vats/src/vat-zoe.js`,
    },
    {
      name: 'prober-contract',
      filePath: `${SDK_ROOT}/packages/boot/test/bootstrapTests/zcfProbe.js`,
    },
  ];

  // @ts-expect-error
  t.context.bundleIds = await installBundles(bundlesData);
});

test.serial('Open Vaults', async t => {
  const currentVaults = await agops.vaults('list', '--from', GOV1ADDR);
  t.is(currentVaults.length, 4);

  await openVault(GOV1ADDR, 7, 11);
  await adjustVault(GOV1ADDR, 'vault5', { giveMinted: 1.5 });
  await adjustVault(GOV1ADDR, 'vault5', { giveCollateral: 2.0 });
  await closeVault(GOV1ADDR, 'vault5', 5.75);

  const vault5 = await agoric.follow(
    '-lF',
    ':published.vaultFactory.managers.manager0.vaults.vault5',
  );
  t.is(vault5.vaultState, 'closed');
  t.is(vault5.locked.value, '0');
  t.is(vault5.debtSnapshot.debt.value, '0');
});

test.serial('Run Prober (first time)', async t => {
  // @ts-expect-error
  await runProber(t.context.bundleIds['prober-contract']);
  const data = await agd.query('vstorage', 'data', 'published.prober-asid9a');
  const value = JSON.parse(data.value);
  t.is(value.values[0], 'false');
});

test.serial('Upgrade Zoe and ZCF', async t => {
  await runZcfUpgrade(
    // @ts-expect-error
    t.context.bundleIds['Zcf-upgrade'],
    // @ts-expect-error
    t.context.bundleIds['Zoe-upgrade'],
  );

  t.pass();
});

test.serial('Run Prober (second time)', async t => {
  // @ts-expect-error
  await runProber(t.context.bundleIds['prober-contract']);

  const data = await agd.query('vstorage', 'data', 'published.prober-asid9a');
  const value = JSON.parse(data.value);
  t.is(value.values[0], 'true');
});
