/**
 * @file cribbed from
 *   packages/zoe/test/swingsetTests/upgradeCoveredCall/test-coveredCall-service-upgrade.js
 */
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { test as anyTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { buildVatController } from '@agoric/swingset-vat';

/**
 * @type {import('ava').TestFn<{}>}
 */
const test = anyTest;

const bfile = name => new URL(name, import.meta.url).pathname;
const importSpec = async spec =>
  importMetaResolve(spec, import.meta.url).then(u => new URL(u).pathname);

test('upgrade mintHolder', async t => {
  /** @type {SwingSetConfig} */
  const config = harden({
    bootstrap: 'bootstrap',
    vats: {
      // TODO refactor to use bootstrap-relay.js
      bootstrap: { sourceSpec: bfile('./bootstrap.js') },
      zoe: { sourceSpec: await importSpec('@agoric/vats/src/vat-zoe.js') },
    },
    bundles: {
      zcf: {
        sourceSpec: await importSpec('@agoric/zoe/contractFacet.js'),
      },
      mintHolder: {
        sourceSpec: await importSpec('@agoric/vats/src/mintHolder.js'),
      },
    },
  });
  // console.debug('config', JSON.stringify(config, null, 2));

  const c = await buildVatController(config);
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');
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
  const [v1status] = await run('startV1', []);
  t.is(v1status, 'fulfilled');

  t.log('now perform the upgrade');
  const [v2status] = await run('upgradeV1', []);
  t.is(v2status, 'fulfilled');
});
