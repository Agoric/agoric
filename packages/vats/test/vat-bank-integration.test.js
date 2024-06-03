import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { makeScalarMapStore } from '@agoric/vat-data';

import { E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { observeIteration } from '@agoric/notifier';
import { makeHeapZone } from '@agoric/zone';
import { buildRootObject } from '../src/vat-bank.js';
import {
  mintInitialSupply,
  addBankAssets,
  installBootContracts,
  produceStartUpgradable,
  produceDiagnostics,
} from '../src/core/basic-behaviors.js';
import { makeAgoricNamesAccess } from '../src/core/utils.js';
import { makePromiseSpace } from '../src/core/promise-space.js';
import { makePopulatedFakeVatAdmin } from '../tools/boot-test-utils.js';

test('mintInitialSupply, addBankAssets bootstrap actions', async t => {
  // Supply bootstrap prerequisites.
  const space = /** @type {any} */ (makePromiseSpace(t.log));
  /**
   * @type {BootstrapPowers}
   */
  const { produce, consume } = space;
  const { agoricNames, agoricNamesAdmin, spaces } =
    await makeAgoricNamesAccess();
  produce.agoricNames.resolve(agoricNames);
  produce.agoricNamesAdmin.resolve(agoricNamesAdmin);

  const { vatAdminService } = makePopulatedFakeVatAdmin();
  const { zoeService, feeMintAccess: fma } = makeZoeKitForTest(vatAdminService);
  produce.zoe.resolve(zoeService);
  produce.feeMintAccess.resolve(fma);
  produce.vatAdminSvc.resolve(vatAdminService);
  await installBootContracts({
    consume,
    produce,
    ...spaces,
  });

  // Genesis RUN supply: 50
  const bootMsg = {
    type: 'INIT@@',
    chainID: 'ag',
    storagePort: 1,
    supplyCoins: [{ amount: '50000000', denom: 'uist' }],
    swingsetPort: 4,
    vbankPort: 2,
    vibcPort: 3,
  };

  // Now run the function under test.
  await mintInitialSupply({
    vatParameters: {
      argv: {
        bootMsg,
        hardcodedClientAddresses: [],
        FIXME_GCI: '',
        PROVISIONER_INDEX: 1,
      },
    },
    zone: makeHeapZone(),
    consume,
    produce,
    devices: /** @type {any} */ ({}),
    vats: /** @type {any} */ ({}),
    vatPowers: /** @type {any} */ ({}),
    runBehaviors: /** @type {any} */ ({}),
    modules: /** @type {any} */ ({}),
    ...spaces,
  });

  // check results: initialSupply
  const runIssuer = await E(zoeService).getFeeIssuer();
  const runBrand = await E(runIssuer).getBrand();
  const pmt = await consume.initialSupply;
  const amt = await E(runIssuer).getAmountOf(pmt);
  t.deepEqual(
    amt,
    { brand: runBrand, value: 50_000_000n },
    'initialSupply of 50 RUN',
  );

  const loadCriticalVat = async name => {
    assert.equal(name, 'bank');
    return E(buildRootObject)(
      null,
      null,
      makeScalarMapStore('addAssets baggage'),
    );
  };
  produce.loadCriticalVat.resolve(loadCriticalVat);
  produce.bridgeManager.resolve(undefined);

  const zone = makeHeapZone();
  await Promise.all([
    produceDiagnostics({ produce }),
    produceStartUpgradable({ zone, consume, produce, ...spaces }),
    addBankAssets({ consume, produce, ...spaces }),
  ]);

  // check results: bankManager assets
  const assets = E(consume.bankManager).getAssetSubscription();
  const expected = ['BLD', 'IST'];
  const seen = new Set();
  const done = makePromiseKit();
  void observeIteration(assets, {
    updateState: asset => {
      seen.add(asset.issuerName);
      if (asset.issuerName === 'IST') {
        t.is(asset.issuer, runIssuer);
      }
      if (seen.size === expected.length) {
        done.resolve(seen);
      }
    },
  });
  await done.promise;
  t.deepEqual([...seen].sort(), expected);
});
