import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { assert } from '@endo/errors';
import { resolve as importMetaResolve } from 'import-meta-resolve';

import { buildVatController } from '@agoric/swingset-vat';
import {
  wfV1BundleName,
  wfV2BundleName,
} from './bootstrap-walletFactory-service-upgrade.js';

// so paths can be expresssed relative to this file and made absolute
const bfile = name => new URL(name, import.meta.url).pathname;

const importSpec = async spec =>
  importMetaResolve(spec, import.meta.url).then(u => new URL(u).pathname);

test('walletFactory service upgrade', async t => {
  /** @type {SwingSetConfig} */
  const config = {
    bundleCachePath: 'bundles/',
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        // TODO refactor to use bootstrap-relay.js
        sourceSpec: bfile('bootstrap-walletFactory-service-upgrade.js'),
      },
      zoe: { sourceSpec: await importSpec('@agoric/vats/src/vat-zoe.js') },
    },
    bundles: {
      zcf: {
        sourceSpec: await importSpec(
          '@agoric/zoe/src/contractFacet/vatRoot.js',
        ),
      },
      automaticRefund: {
        sourceSpec: await importSpec(
          '@agoric/zoe/src/contracts/automaticRefund.js',
        ),
      },
      [wfV1BundleName]: {
        sourceSpec: bfile('../../../src/walletFactory.js'),
      },
      [wfV2BundleName]: { sourceSpec: bfile('walletFactory-V2.js') },
    },
  };

  t.log('buildVatController');
  const c = await buildVatController(config);
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');
  t.log('run controller');
  await c.run();

  const run = async (name, args = []) => {
    assert(Array.isArray(args));
    const kpid = c.queueToVatRoot('bootstrap', name, args);
    await c.run();
    const status = c.kpStatus(kpid);
    const capdata = c.kpResolution(kpid);
    return [status, capdata];
  };

  t.log('create initial version');
  const [v1status] = await run('buildV1', []);
  t.is(v1status, 'fulfilled');

  t.log('use a wallet to make an offer');
  const [v1ostatus] = await run('testOfferV1', []);
  t.is(v1ostatus, 'fulfilled');

  t.log('perform null upgrade');
  const [null1status] = await run('nullUpgradeV1', []);
  t.is(null1status, 'fulfilled');

  t.log('now perform the V2 upgrade');
  const [v2status] = await run('upgradeV2', []);
  t.is(v2status, 'fulfilled');

  t.log('make an offer after upgrade');
  const [v2ostatus] = await run('testOfferV2', []);
  t.is(v2ostatus, 'fulfilled');
});
