/**
 * @file The goal of this test is to show that #9982 is fixed
 * We change a parameter so that provideParamGovernance() is called once, and
 * paramGoverance has been set. Then upgrade vaultFactory, so any ephemeral
 * objects from the contract held by the governor are gone, then try to change
 * param again, to show that the bug is fixedd.
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
import { updateVaultManagerParams } from '../tools/changeVaultParams.js';

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

const outcome = {
  bids: [{ payouts: { Bid: 0, Collateral: 1.800828 } }],
};

test('restart vaultFactory, change params', async t => {
  const { runUtils, gd, agoricNamesRemotes } = t.context;
  const { EV } = runUtils;
  const vaultFactoryKit =
    await EV.vat('bootstrap').consumeItem('vaultFactoryKit');

  const { ATOM } = agoricNamesRemotes.brand;
  ATOM || Fail`ATOM missing from agoricNames`;

  const reserveKit = await EV.vat('bootstrap').consumeItem('reserveKit');
  const bootstrapVat = EV.vat('bootstrap');
  const electorateCreatorFacet = await bootstrapVat.consumeItem(
    'economicCommitteeCreatorFacet',
  );

  const poserInvitation = await EV(electorateCreatorFacet).getPoserInvitation();
  const creatorFacet1 = await EV.get(reserveKit).creatorFacet;
  const shortfallInvitation =
    await EV(creatorFacet1).makeShortfallReportingInvitation();

  const zoe: ZoeService = await EV.vat('bootstrap').consumeItem('zoe');
  const brands = await EV(zoe).getBrands(vaultFactoryKit.instance);
  const getDebtLimitValue = async () => {
    const params = await EV(vaultFactoryKit.publicFacet).getGovernedParams({
      collateralBrand: brands.ATOM,
    });

    // @ts-expect-error getGovernedParams doesn't declare these fields
    return params.DebtLimit.value.value;
  };

  // Change the value of a param before the upgrade so paramGovernance is set
  t.is(await getDebtLimitValue(), 1_000_000_000n);
  await updateVaultManagerParams(t, gd, ATOM, 50_000_000n);

  t.is(await getDebtLimitValue(), 50_000_000n);

  const privateArgs = {
    // @ts-expect-error cast XXX missing from type
    ...vaultFactoryKit.privateArgs,
    initialPoserInvitation: poserInvitation,
    initialShortfallInvitation: shortfallInvitation,
  };

  const vfAdminFacet = await EV(
    vaultFactoryKit.governorCreatorFacet,
  ).getAdminFacet();

  t.log('awaiting VaultFactory restartContract');
  const upgradeResult = await EV(vfAdminFacet).restartContract(privateArgs);
  t.deepEqual(upgradeResult, { incarnationNumber: 1 });

  await updateVaultManagerParams(t, gd, ATOM, 150_000_000n);
  t.is(await getDebtLimitValue(), 150_000_000n);
});
