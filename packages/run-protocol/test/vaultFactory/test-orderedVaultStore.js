// @ts-check
// Must be first to set up globals
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';
import { makeOrderedVaultStore } from '../../src/vaultFactory/orderedVaultStore.js';
import { fromVaultKey } from '../../src/vaultFactory/storeUtils.js';

const brand = Far('brand');

const mockVault = (runCount, collateralCount) => {
  const debtAmount = AmountMath.make(brand, runCount);
  const collateralAmount = AmountMath.make(brand, collateralCount);

  return Far('vault', {
    getCurrentDebt: () => debtAmount,
    getCollateralAmount: () => collateralAmount,
  });
};

const BIGGER_INT = BigInt(Number.MAX_VALUE) + 1n;
/**
 * Records to be inserted in this order. Jumbled to verify insertion order invariance.
 *
 * @type {[string, bigint, bigint][]}
 */
const fixture = [
  ['vault-E', 40n, 100n],
  ['vault-F', 50n, 100n],
  ['vault-M', 1n, 1000n],
  ['vault-Y', BIGGER_INT, BIGGER_INT],
  ['vault-Z-withoutdebt', 0n, 100n],
  ['vault-A-underwater', 1000n, 100n],
  ['vault-B', 101n, 1000n],
  // because the C vaults all have same ratio, order among them is not defined
  ['vault-C1', 100n, 1000n],
  ['vault-C2', 200n, 2000n],
  ['vault-C3', 300n, 3000n],
  ['vault-D', 30n, 100n],
];

test('ordering', t => {
  const vaults = makeOrderedVaultStore();

  for (const [vaultId, runCount, collateralCount] of fixture) {
    const vault = mockVault(runCount, collateralCount);
    // @ts-expect-error mock
    vaults.addVault(vaultId, vault);
  }
  const contents = Array.from(vaults.entries());
  const vaultIds = contents.map(([k, _v]) => fromVaultKey(k)[1]);
  // keys were ordered matching the fixture's ordering of vaultId
  t.deepEqual(vaultIds, vaultIds.sort());
});

test('uniqueness', t => {
  const vaults = makeOrderedVaultStore();

  for (const [vaultId, runCount, collateralCount] of fixture) {
    const vault = mockVault(runCount, collateralCount);
    // @ts-expect-error mock
    vaults.addVault(vaultId, vault);
  }
  const numberParts = Array.from(vaults.entries()).map(
    ([k, _v]) => k.split(':')[0],
  );
  const uniqueNumberParts = Array.from(new Set(numberParts));
  t.is(uniqueNumberParts.length, 9); // of 11, three have the same ratio
});
