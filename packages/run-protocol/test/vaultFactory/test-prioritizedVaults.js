/* global setImmediate */
// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import '@agoric/zoe/exported.js';

import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio.js';
import { makePromiseKit } from '@endo/promise-kit';

import {
  currentDebtToCollateral,
  makePrioritizedVaults,
} from '../../src/vaultFactory/prioritizedVaults.js';
import { makeFakeInnerVault } from '../supports.js';

/** @typedef {import('../../src/vaultFactory/vault.js').InnerVault} InnerVault */

// Some notifier updates aren't propogating sufficiently quickly for the tests.
// This invocation (thanks to Warner) waits for all promises that can fire to
// have all their callbacks run
async function waitForPromisesToSettle() {
  const pk = makePromiseKit();
  setImmediate(pk.resolve);
  return pk.promise;
}

function makeCollector() {
  /** @type {Ratio[]} */
  const ratios = [];

  /** @param {[string, InnerVault]} record */
  function lookForRatio([_, vault]) {
    ratios.push(currentDebtToCollateral(vault));
  }

  return {
    lookForRatio,
    getPercentages: () => ratios.map(r => Number(r.numerator.value)),
  };
}

function makeRescheduler() {
  let called = false;

  async function fakeReschedule() {
    called = true;
    return called;
  }

  return {
    called: () => called,
    resetCalled: () => (called = false),
    fakeReschedule,
  };
}

const { brand } = makeIssuerKit('ducats');
const percent = n => makeRatio(BigInt(n), brand);

test('add to vault', async t => {
  const rescheduler = makeRescheduler();
  const vaults = makePrioritizedVaults(rescheduler.fakeReschedule);
  vaults.addVault(
    'id-fakeVaultKit',
    makeFakeInnerVault('id-fakeVaultKit', AmountMath.make(brand, 130n)),
  );
  const collector = makeCollector();
  // ??? why doesn't this work?
  // mapIterable(
  //   vaults.entriesPrioritizedGTE(makeRatio(1n, brand, 10n)),
  //   collector.lookForRatio,
  // );
  Array.from(vaults.entriesPrioritizedGTE(makeRatio(1n, brand, 10n))).map(
    collector.lookForRatio,
  );

  t.deepEqual(collector.getPercentages(), [130], 'expected vault');
  t.truthy(rescheduler.called(), 'should call reschedule()');
});

test('updates', async t => {
  const rescheduler = makeRescheduler();
  const vaults = makePrioritizedVaults(rescheduler.fakeReschedule);

  vaults.addVault(
    'id-fakeVault1',
    makeFakeInnerVault('id-fakeVault1', AmountMath.make(brand, 20n)),
  );

  vaults.addVault(
    'id-fakeVault2',
    makeFakeInnerVault('id-fakeVault2', AmountMath.make(brand, 80n)),
  );

  await waitForPromisesToSettle();

  const collector = makeCollector();
  rescheduler.resetCalled();
  Array.from(vaults.entriesPrioritizedGTE(makeRatio(1n, brand, 10n))).map(
    collector.lookForRatio,
  );
  t.deepEqual(collector.getPercentages(), [80, 20]);
  t.falsy(rescheduler.called(), 'second vault did not call reschedule()');
});

test('update changes ratio', async t => {
  const rescheduler = makeRescheduler();
  const vaults = makePrioritizedVaults(rescheduler.fakeReschedule);

  const fakeVault1 = makeFakeInnerVault(
    'id-fakeVault1',
    AmountMath.make(brand, 20n),
  );
  vaults.addVault('id-fakeVault1', fakeVault1);

  vaults.addVault(
    'id-fakeVault2',
    makeFakeInnerVault('id-fakeVault2', AmountMath.make(brand, 80n)),
  );

  await waitForPromisesToSettle();

  t.deepEqual(Array.from(Array.from(vaults.entries()).map(([k, _v]) => k)), [
    'fbff4000000000000:id-fakeVault2',
    'fc014000000000000:id-fakeVault1',
  ]);

  t.deepEqual(vaults.highestRatio(), percent(80));

  // update the fake debt of the vault and then refresh priority queue
  fakeVault1.setDebt(AmountMath.make(brand, 95n));
  vaults.refreshVaultPriority(
    AmountMath.make(brand, 20n),
    AmountMath.make(brand, 100n), // default collateral of makeFakeVaultKit
    'id-fakeVault1',
  );

  await waitForPromisesToSettle();
  t.deepEqual(vaults.highestRatio(), percent(95));

  const newCollector = makeCollector();
  rescheduler.resetCalled();
  Array.from(vaults.entriesPrioritizedGTE(percent(90))).map(
    newCollector.lookForRatio,
  );
  t.deepEqual(
    newCollector.getPercentages(),
    [95],
    'only one is higher than 90%',
  );
  t.deepEqual(vaults.highestRatio(), percent(95));
  t.falsy(rescheduler.called(), 'foreach does not trigger rescheduler'); // change from previous implementation
});

test('removals', async t => {
  const rescheduler = makeRescheduler();
  const vaults = makePrioritizedVaults(rescheduler.fakeReschedule);

  // Add fakes 1,2,3
  vaults.addVault(
    'id-fakeVault1',
    makeFakeInnerVault('id-fakeVault1', AmountMath.make(brand, 150n)),
  );
  vaults.addVault(
    'id-fakeVault2',
    makeFakeInnerVault('id-fakeVault2', AmountMath.make(brand, 130n)),
  );
  vaults.addVault(
    'id-fakeVault3',
    makeFakeInnerVault('id-fakeVault3', AmountMath.make(brand, 140n)),
  );

  // remove fake 3
  rescheduler.resetCalled();
  vaults.removeVaultByAttributes(
    AmountMath.make(brand, 140n),
    AmountMath.make(brand, 100n), // default collateral of makeFakeVaultKit
    'id-fakeVault3',
  );
  t.falsy(rescheduler.called());
  t.deepEqual(vaults.highestRatio(), percent(150), 'should be 150');

  // remove fake 1
  rescheduler.resetCalled();
  vaults.removeVaultByAttributes(
    AmountMath.make(brand, 150n),
    AmountMath.make(brand, 100n), // default collateral of makeFakeVaultKit
    'id-fakeVault1',
  );
  t.falsy(rescheduler.called(), 'should not call reschedule on removal');
  t.deepEqual(vaults.highestRatio(), percent(130), 'should be 130');

  t.throws(() =>
    vaults.removeVaultByAttributes(
      AmountMath.make(brand, 150n),
      AmountMath.make(brand, 100n),
      'id-fakeVault1',
    ),
  );
});

test('highestRatio', async t => {
  const reschedulePriceCheck = makeRescheduler();
  const vaults = makePrioritizedVaults(reschedulePriceCheck.fakeReschedule);

  vaults.addVault(
    'id-fakeVault1',
    makeFakeInnerVault('id-fakeVault1', AmountMath.make(brand, 30n)),
  );
  const cr1 = percent(30);
  t.deepEqual(vaults.highestRatio(), cr1);

  const fakeVault6 = makeFakeInnerVault(
    'id-fakeVault6',
    AmountMath.make(brand, 50n),
  );
  vaults.addVault('id-fakeVault6', fakeVault6);
  const cr6 = percent(50);
  t.deepEqual(vaults.highestRatio(), cr6);

  vaults.addVault(
    'id-fakeVault3',
    makeFakeInnerVault('id-fakeVault3', AmountMath.make(brand, 40n)),
  );

  // sanity check ordering
  t.deepEqual(
    Array.from(vaults.entries()).map(([k, _v]) => k),
    [
      'fc000000000000000:id-fakeVault6',
      'fc004000000000000:id-fakeVault3',
      'fc00aaaaaaaaaaaab:id-fakeVault1',
    ],
  );

  const debtsOverThreshold = [];
  Array.from(vaults.entriesPrioritizedGTE(percent(45))).map(([_key, vault]) =>
    debtsOverThreshold.push([
      vault.getCurrentDebt(),
      vault.getCollateralAmount(),
    ]),
  );

  t.deepEqual(debtsOverThreshold, [
    [fakeVault6.getCurrentDebt(), fakeVault6.getCollateralAmount()],
  ]);
  t.deepEqual(vaults.highestRatio(), percent(50), 'expected 50% to be highest');
});
