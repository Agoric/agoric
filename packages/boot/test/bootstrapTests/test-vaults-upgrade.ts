/* eslint-disable jsdoc/require-param-type, @jessie.js/safe-await-separator */
/**
 * @file Bootstrap test integration vaults with smart-wallet. The tests in this
 *   file are NOT independent; a single `test.before()` handler creates shared
 *   state with `makeSwingsetTestKit` and each test is run serially and assumes
 *   changes from earlier tests.
 */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { Fail, NonNullish } from '@agoric/assert';
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { Far, makeMarshal } from '@endo/marshal';
import { SECONDS_PER_YEAR } from '@agoric/inter-protocol/src/interest.js';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { ExecutionContext, TestFn } from 'ava';
import { type FakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { type EconomyBootstrapSpace } from '@agoric/inter-protocol/src/proposals/econ-behaviors.js';
import { makeSwingsetTestKit } from '../../tools/supports.js';
import { makeWalletFactoryDriver } from '../../tools/drivers.js';

// presently all these tests use one collateral manager
const collateralBrandKey = 'ATOM';

const makeDefaultTestContext = async (
  t: ExecutionContext,
  {
    incarnation = 1,
    logTiming = true,
    storage = undefined as FakeStorageKit | undefined,
  } = {},
) => {
  logTiming && console.time('DefaultTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log, 'bundles/vaults', {
    storage,
  });

  const { readLatest, runUtils } = swingsetTestKit;
  ({ storage } = swingsetTestKit);
  const { EV } = runUtils;
  logTiming && console.timeLog('DefaultTestContext', 'swingsetTestKit');

  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  logTiming && console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  agoricNamesRemotes.brand.ATOM || Fail`ATOM missing from agoricNames`;
  logTiming && console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    storage,
    agoricNamesRemotes,
  );
  logTiming && console.timeLog('DefaultTestContext', 'walletFactoryDriver');

  logTiming && console.timeEnd('DefaultTestContext');

  const readRewardPoolBalance = () => {
    return readLatest('published.vaultFactory.metrics').rewardPoolAllocation
      .Minted?.value;
  };
  const readCollateralMetrics = vaultManagerIndex =>
    readLatest(
      `published.vaultFactory.managers.manager${vaultManagerIndex}.metrics`,
    );

  return {
    ...swingsetTestKit,
    incarnation,
    agoricNamesRemotes,
    readCollateralMetrics,
    readRewardPoolBalance,
    walletFactoryDriver,
  };
};

/**
 * Shared context can be updated by re-bootstrapping, and is placed one property
 * deep so such changes propagate to later tests.
 */
const test = anyTest as TestFn<{
  shared: Awaited<ReturnType<typeof makeDefaultTestContext>>;
}>;
test.before(async t => {
  const shared = await makeDefaultTestContext(t);
  t.context = { shared };
});
test.after.always(t => t.context.shared.shutdown());

test.serial('re-bootstrap', async t => {
  const oldContext = { ...t.context.shared };
  const { storage } = oldContext;
  t.is(oldContext.incarnation, 1);
  const wd1 =
    await oldContext.walletFactoryDriver.provideSmartWallet('agoric1a');
  t.true(wd1.isNew);
  // eslint-disable-next-line no-unused-vars
  const assertWalletCount = (walletsProvisioned, message) => {
    // eslint-disable-next-line no-unused-vars
    const metrics = oldContext.readLatest('published.provisionPool.metrics');
    // FIXME make wallet provisioning use the provisionPool
    // disabled while wallet provisioning bypasses provisionPool
    // t.like(metrics, { walletsProvisioned }, message);
  };
  // prettier-ignore
  assertWalletCount(1n, 'wallet provisioning must be recorded in provisionPool metrics');

  await oldContext.shutdown();
  const walletPaths = [...storage.data.keys()].filter(path =>
    path.startsWith('published.wallet.'),
  );
  t.true(walletPaths.length > 1, 'wallet data must be in vstorage');
  const preservedFakePath = `${walletPaths.at(-1)}.synthetic.extension`;
  storage.data.set(preservedFakePath, 'saved');
  const doomedFakePaths = ['published.synthetic', 'published.synthetic2.deep'];
  for (const syntheticPath of doomedFakePaths) {
    storage.data.set(syntheticPath, 'doomed');
  }

  const newContext = await makeDefaultTestContext(t, {
    incarnation: oldContext.incarnation + 1,
    logTiming: false,
    storage,
  });
  Object.assign(t.context.shared, newContext);

  t.is(newContext.incarnation, 2);
  await t.throwsAsync(
    oldContext.walletFactoryDriver.provideSmartWallet('agoric1a'),
    undefined,
    'must not be able to use old swingset',
  );
  t.is(
    storage.data.get(preservedFakePath),
    undefined,
    'exported storage subtrees must not be preserved',
  );
  for (const syntheticPath of doomedFakePaths) {
    const msg = `non-exported storage entries must be purged: ${syntheticPath}`;
    t.is(storage.data.get(syntheticPath), undefined, msg);
  }
  // prettier-ignore
  assertWalletCount(1n, 'provisionPool metrics must not be modified by re-bootstrap');
  const wd2 =
    await newContext.walletFactoryDriver.provideSmartWallet('agoric1a');
  t.false(wd2.isNew);
  // prettier-ignore
  assertWalletCount(1n, 'wallet restoration must not affect provisionPool metrics');
  const wd3 =
    await newContext.walletFactoryDriver.provideSmartWallet('agoric1b');
  t.true(wd3.isNew);
  // prettier-ignore
  assertWalletCount(2n, 'new wallet provisioning must update revived provisionPool metrics');
});

test.serial('audit bootstrap exports', async t => {
  const expected = {
    maxExports: 5,
    maxNonDurable: 5,
    ifaces: {
      // in bridgeCoreEval()
      coreHandler: true,
      // in bridgeProvisioner()
      provisioningHandler: true,
      'prioritySenders manager': true,
      // TODO? move to provisioning vat?
      clientCreator: true,
    },
  };

  const { controller } = t.context.shared;
  const kState = controller.dump();

  const myVatID = 'v1';

  const myPromises = kState.promises.filter(
    // @ts-expect-error kernel.dump() .promises type is wrong
    p => p.decider === myVatID,
  );
  t.true(myPromises.length <= 1, 'bootstrap is the decider of only its return');

  const myExports = kState.kernelTable.filter(
    o => o[1] === myVatID && o[2].startsWith('o+'),
  );
  const v1VatTable =
    kState.vatTables.find(vt => vt.vatID === myVatID) || assert.fail();
  const { transcript } = v1VatTable.state;

  const oids = new Set(myExports.map(o => o[2]));
  const oidsDurable = [...oids].filter(o => o.startsWith('o+d'));
  t.log(
    'bootstrap exports:',
    oidsDurable.length,
    'durable',
    oids.size - oidsDurable.length,
    'non-durable',
    oids.size,
    'total',
  );
  t.true(oids.size <= expected.maxExports, 'too many exports');
  t.true(
    oids.size - oidsDurable.length <= expected.maxNonDurable,
    'too many non-durable',
  );

  // Map oid to iface by poring over transcript syscalls
  const toIface = new Map();
  const anObj = Far('obj', {});
  const aPromise = harden(new Promise(() => {}));
  const saveBootstrapIface = (slot, iface) => {
    if (slot.startsWith('p')) return aPromise;
    if (oids.has(slot)) {
      toIface.set(slot, iface);
    }
    return anObj;
  };
  const m = makeMarshal(undefined, saveBootstrapIface);
  for (const oid of oids) {
    for (const [_ix, ev] of transcript) {
      for (const sc of ev.sc) {
        if (sc.s[0] === 'send') {
          const { methargs } = sc.s[2];
          if (!methargs.slots.includes(oid)) continue;
          m.fromCapData(methargs);
          return;
        } else if (sc.s[0] === 'resolve') {
          for (const res of sc.s[1]) {
            const capdata = res[2];
            if (!capdata.slots.includes(oid)) continue;
            m.fromCapData(capdata);
            return;
          }
        }
      }
    }
  }

  const exportedInterfaces = Object.fromEntries(
    [...toIface.values()].map(iface => [iface.replace(/^Alleged: /, ''), true]),
  );

  t.deepEqual(exportedInterfaces, expected.ifaces, 'expected interfaces');
});

test.serial('open vault', async t => {
  console.time('open vault');

  const {
    incarnation,
    readRewardPoolBalance,
    readCollateralMetrics,
    walletFactoryDriver,
  } = t.context.shared;
  t.is(incarnation, 2);
  t.falsy(readRewardPoolBalance());

  const wd = await walletFactoryDriver.provideSmartWallet('agoric1a');
  t.false(wd.isNew);

  await wd.executeOfferMaker(Offers.vaults.OpenVault, {
    offerId: 'open1',
    collateralBrandKey,
    wantMinted: 5.0,
    giveCollateral: 9.0,
  });
  console.timeLog('open vault', 'executed offer');

  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: { id: 'open1', numWantsSatisfied: 1 },
  });

  t.is(readRewardPoolBalance(), 25000n);
  t.like(readCollateralMetrics(0), {
    numActiveVaults: 1,
    totalCollateral: { value: 9000000n },
    totalDebt: { value: 5025000n },
  });
  console.timeEnd('open vault');
});

test.serial('restart vaultFactory', async t => {
  const { runUtils, readCollateralMetrics } = t.context.shared;
  const { EV } = runUtils;
  const vaultFactoryKit = await (EV.vat('bootstrap').consumeItem(
    'vaultFactoryKit',
  ) as EconomyBootstrapSpace['consume']['vaultFactoryKit']);

  // @ts-expect-error cast XXX missing from type
  const { privateArgs } = vaultFactoryKit;
  console.log('reused privateArgs', privateArgs, vaultFactoryKit);

  const vfAdminFacet = await EV(
    vaultFactoryKit.governorCreatorFacet,
  ).getAdminFacet();

  const keyMetrics = {
    numActiveVaults: 1,
    totalCollateral: { value: 9000000n },
    totalDebt: { value: 5025000n },
  };
  t.like(readCollateralMetrics(0), keyMetrics);
  t.log('awaiting VaultFactory restartContract');
  const upgradeResult = await EV(vfAdminFacet).restartContract(privateArgs);
  t.deepEqual(upgradeResult, { incarnationNumber: 1 });
  t.like(readCollateralMetrics(0), keyMetrics); // unchanged
});

test.serial('restart contractGovernor', async t => {
  const { EV } = t.context.shared.runUtils;
  const vaultFactoryKit = await (EV.vat('bootstrap').consumeItem(
    'vaultFactoryKit',
  ) as EconomyBootstrapSpace['consume']['vaultFactoryKit']);

  const { governorAdminFacet } = vaultFactoryKit;
  // has no privateArgs of its own. the privateArgs.governed is only for the
  // contract startInstance. any changes to those privateArgs have to happen
  // through a restart or upgrade using the governed contract's adminFacet
  const privateArgs = undefined;

  t.log('awaiting CG restartContract');
  const upgradeResult =
    await EV(governorAdminFacet).restartContract(privateArgs);
  t.deepEqual(upgradeResult, { incarnationNumber: 1 });
});

test.serial('open vault 2', async t => {
  const { readRewardPoolBalance, walletFactoryDriver } = t.context.shared;
  t.is(readRewardPoolBalance(), 25000n);

  const wd = await walletFactoryDriver.provideSmartWallet('agoric1a');

  await wd.executeOfferMaker(Offers.vaults.OpenVault, {
    offerId: 'open2',
    collateralBrandKey,
    // small, won't be liquidated
    wantMinted: 5.0,
    giveCollateral: 100.0,
  });
  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: {
      id: 'open2',
      numWantsSatisfied: 1,
    },
  });

  // balance goes up as before restart (doubles because same wantMinted)
  t.is(readRewardPoolBalance(), 50000n);
});

test.serial('adjust balance of vault opened before restart', async t => {
  const { readCollateralMetrics, readRewardPoolBalance, walletFactoryDriver } =
    t.context.shared;
  t.is(readRewardPoolBalance(), 50000n);

  const wd = await walletFactoryDriver.provideSmartWallet('agoric1a');

  // unchanged since before restart
  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: { id: 'open2', numWantsSatisfied: 1 },
  });

  t.log('adjust to brink of liquidation');
  await wd.executeOfferMaker(
    Offers.vaults.AdjustBalances,
    {
      offerId: 'adjust1',
      collateralBrandKey,
      // collateralization ratio allows: 63462857n
      wantMinted: 63.0 - 5.0,
    },
    'open1',
  );
  t.like(wd.getLatestUpdateRecord(), {
    updated: 'offerStatus',
    status: {
      id: 'adjust1',
      numWantsSatisfied: 1,
    },
  });
  // sanity check
  t.like(readCollateralMetrics(0), {
    numActiveVaults: 2,
    numLiquidatingVaults: 0,
  });
});

// charge interest to force a liquidation and verify it starts
test.serial('force liquidation', async t => {
  const {
    advanceTimeBy,
    jumpTimeTo,
    readCollateralMetrics,
    readRewardPoolBalance,
  } = t.context.shared;

  // advance a year to drive interest charges
  await jumpTimeTo(SECONDS_PER_YEAR);
  // accrues massively
  t.is(readRewardPoolBalance(), 683693581n);
  t.like(readCollateralMetrics(0), {
    numActiveVaults: 2,
    totalDebt: { value: 68340000n },
  });

  // liquidation will have been skipped because time skipped ahead
  // so now advance slowly
  await advanceTimeBy(1, 'hours');
  t.like(readCollateralMetrics(0), {
    numActiveVaults: 2,
    numLiquidatingVaults: 0,
  });
  await advanceTimeBy(1, 'hours');
  t.like(readCollateralMetrics(0), {
    liquidatingCollateral: { value: 9_000_000n },
    liquidatingDebt: { value: 696_421_994n },
    numActiveVaults: 1,
    numLiquidatingVaults: 1,
  });

  await advanceTimeBy(1, 'hours');
  t.like(readCollateralMetrics(0), {
    numActiveVaults: 1,
    numLiquidatingVaults: 1,
    numLiquidationsAborted: 1,
    numLiquidationsCompleted: 0,
  });
});

test.serial(
  'upgrade facet for all contracts, vats are saved durably',
  async t => {
    const {
      controller,
      runUtils: { EV },
      swingStore,
    } = t.context.shared;
    const kState = controller.dump();
    const { kernelTable, vatTables } = kState;

    t.log('find contracts, vats known to SwingSet');
    // see comment atop kernelKeeper.js for schema
    const vatOptions = vatID =>
      JSON.parse(
        NonNullish(
          swingStore.kernelStorage.kvStore.get(`${vatID}.options`),
          vatID,
        ),
      );
    const vatNames = Object.fromEntries(
      vatTables.map(vt => [vt.vatID, vatOptions(vt.vatID).name]),
    );
    const vatNamed = name =>
      Object.keys(vatNames).find(vatID => vatNames[vatID] === name) ||
      assert.fail();
    const zoeVat = vatNamed('zoe');

    t.log('discharge obligations by finding upgrade powers');
    const todo = Object.fromEntries(Object.entries(vatNames));
    // vats created by swingset before bootstrap starts
    const swingsetVats = [
      'bootstrap',
      'comms',
      'vatAdmin',
      'vattp',
      'timer',
    ].map(vatNamed);
    for (const vatID of swingsetVats) {
      delete todo[vatID];
    }

    // TODO? test that powerStore is in baggage?
    // by inspection, we see that it is:
    // [ "v1.vs.vc.1.sBootstrap Powers", "{\"body\":\"#\\\"$0.Alleged: mapStore\\\"\",\"slots\":[\"o+d6/5\"]}",]

    const powerStore: MapStore =
      await EV.vat('bootstrap').consumeItem('powerStore');

    const getStoreSnapshot = async (name: string) =>
      EV.vat('bootstrap').snapshotStore(
        await EV(powerStore).get(name),
      ) as Promise<[any, any][]>;

    const contractKits = await getStoreSnapshot('contractKits');
    // TODO refactor the entries to go into governedContractKits too (so the latter is sufficient to test)
    const psmKit = await getStoreSnapshot('psmKit');
    const governedContractKits = await getStoreSnapshot('governedContractKits');
    const vatStore = await getStoreSnapshot('vatStore');

    /**
     * Map refs to objects and find a vat containing one of them.
     *
     * @param refs
     * @param exclude don't report hits from these vatIDs
     */
    const findVat = async (
      refs: Record<string, unknown>,
      exclude = [zoeVat],
    ) => {
      const mapped = {} as Record<string, any>;
      for await (const [prop, presence] of Object.entries(refs)) {
        if (!presence) {
          continue;
        }
        const obj = await EV.vat('bootstrap').awaitVatObject(presence);
        mapped[prop] = obj;
      }
      for (const obj of Object.values(mapped)) {
        const [_k, vatID, _oid] = kernelTable.find(
          row => row[0] === obj.getKref() && row[2].startsWith('o+'),
        );
        if (!exclude.includes(vatID)) {
          return { vatID, mapped };
        }
      }
      console.warn(`no vat found for`, refs);
      return { vatID: undefined, mapped: {} };
    };

    for await (const [_instance, kit] of [
      ...contractKits,
      ...governedContractKits,
      ...psmKit,
    ]) {
      t.truthy(kit.adminFacet || kit.psmAdminFacet, kit.label);
      const { creatorFacet, publicFacet, psmCreatorFacet } = kit;
      const { vatID, mapped } = await findVat({
        creatorFacet,
        publicFacet,
        psmCreatorFacet,
      });
      console.log(
        'kit',
        { ...kit, ...mapped },
        'has adminFacet of contract vat:',
        vatID,
        vatNames[vatID],
      );
      delete todo[vatID];
    }

    for await (const [_instance, kit] of [...governedContractKits, ...psmKit]) {
      t.truthy(kit.adminFacet || kit.psmAdminFacet, kit.label);
      const { governorCreatorFacet, psmGovernorCreatorFacet } = kit;
      const { vatID, mapped } = await findVat({
        governorCreatorFacet,
        psmGovernorCreatorFacet,
      });
      console.log(
        'kit',
        { ...kit, ...mapped },
        'has adminFacet of contract governor vat:',
        vatID,
        vatNames[vatID],
      );
      delete todo[vatID];
    }

    for await (const [name, info] of vatStore) {
      t.truthy(info.adminNode, name);
      const { root } = info;
      const { vatID, mapped } = await findVat({ root }, swingsetVats);
      if (vatID) {
        console.log(
          'kit',
          { name, ...info, ...mapped },
          'has adminNode of non-contract vat:',
          vatID,
          vatNames[vatID],
        );
        delete todo[vatID];
      }
    }

    t.deepEqual(todo, {});
  },
);

// Will be part of https://github.com/Agoric/agoric-sdk/issues/5200
// For now upon restart the values are reset to the terms under which the contract started.
// When it comes time to upgrade the vaultFactory contract we'll have at least these options:
// 1. Make the new version allow some privateArgs to specify the parameter state.
// 2. Have EC disable offers until they can update parameters as needed.
test.todo('governance changes maintained after restart');
