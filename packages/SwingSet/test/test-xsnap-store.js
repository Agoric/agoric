import '@endo/init';

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { type as osType } from 'os';
import tmp from 'tmp';
import test from 'ava';
import { xsnap } from '@agoric/xsnap';
import { makeSnapStore, makeSnapStoreIO } from '@agoric/swing-store';
import { resolve as importMetaResolve } from 'import-meta-resolve';

const { freeze } = Object;

const ld = (() => {
  /** @param {string} ref */
  // WARNING: ambient
  const resolve = async ref => {
    const parsed = await importMetaResolve(ref, import.meta.url);
    return new URL(parsed).pathname;
  };
  const readFile = fs.promises.readFile;
  return freeze({
    resolve,
    /** @param {string} ref */
    asset: async ref => readFile(await resolve(ref), 'utf-8'),
  });
})();

/** @type {(fn: string, fullSize: number) => number} */
const relativeSize = (fn, fullSize) =>
  Math.round((fs.statSync(fn).size / 1024 / fullSize) * 10) / 10;

const snapSize = {
  raw: 417,
  SESboot: 858,
};

/**
 * @param {string} name
 * @param {(request: Uint8Array) => Promise<Uint8Array>} handleCommand
 * @param {string} script To execute
 */
async function bootWorker(name, handleCommand, script) {
  const worker = xsnap({
    os: osType(),
    spawn,
    handleCommand,
    name,
    stdout: 'inherit',
    stderr: 'inherit',
    // debug: !!env.XSNAP_DEBUG,
  });

  await worker.evaluate(script);
  return worker;
}

/**
 * @param {string} name
 * @param {(request: Uint8Array) => Promise<Uint8Array>} handleCommand
 */
async function bootSESWorker(name, handleCommand) {
  const bootScript = await ld.asset(
    '@agoric/xsnap/dist/bundle-ses-boot.umd.js',
  );
  return bootWorker(name, handleCommand, bootScript);
}

test(`create XS Machine, snapshot (${snapSize.raw} Kb), compress to smaller`, async t => {
  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  t.teardown(() => vat.close());

  const pool = tmp.dirSync({ unsafeCleanup: true });
  t.teardown(() => pool.removeCallback());
  await fs.promises.mkdir(pool.name, { recursive: true });

  const store = makeSnapStore(pool.name, makeSnapStoreIO());

  const h = await store.save(async snapFile => {
    await vat.snapshot(snapFile);
  });

  const zfile = path.resolve(pool.name, `${h}.gz`);
  t.true(
    relativeSize(zfile, snapSize.raw) < 0.5,
    'compressed snapshots are smaller',
  );
});

test('SES bootstrap, save, compress', async t => {
  const vat = await bootSESWorker('ses-boot1', async m => m);
  t.teardown(() => vat.close());

  const pool = tmp.dirSync({ unsafeCleanup: true });
  t.teardown(() => pool.removeCallback());

  const store = makeSnapStore(pool.name, makeSnapStoreIO());

  await vat.evaluate('globalThis.x = harden({a: 1})');

  const h = await store.save(async snapFile => {
    await vat.snapshot(snapFile);
  });

  const zfile = path.resolve(pool.name, `${h}.gz`);
  t.true(
    relativeSize(zfile, snapSize.SESboot) < 0.5,
    'compressed snapshots are smaller',
  );
});

test('create SES worker, save, restore, resume', async t => {
  const pool = tmp.dirSync({ unsafeCleanup: true });
  t.teardown(() => pool.removeCallback());

  const store = makeSnapStore(pool.name, makeSnapStoreIO());

  const vat0 = await bootSESWorker('ses-boot2', async m => m);
  t.teardown(() => vat0.close());
  await vat0.evaluate('globalThis.x = harden({a: 1})');
  const h = await store.save(vat0.snapshot);

  const worker = await store.load(h, async snapshot => {
    const xs = xsnap({ name: 'ses-resume', snapshot, os: osType(), spawn });
    await xs.isReady();
    return xs;
  });
  t.teardown(() => worker.close());
  await worker.evaluate('x.a');
  t.pass();
});

/**
 * The snapshot hashes in this test are, naturally, sensitive to any changes in
 * bundle-ses-boot.umd.js; that is: any changes to the SES shim or to the
 * xsnap-worker supervisor. They are also sensitive to the XS code itself.
 */
test('XS + SES snapshots are long-term deterministic', async t => {
  const pool = tmp.dirSync({ unsafeCleanup: true });
  t.teardown(() => pool.removeCallback());
  t.log({ pool: pool.name });
  await fs.promises.mkdir(pool.name, { recursive: true });
  const store = makeSnapStore(pool.name, makeSnapStoreIO());

  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  t.teardown(() => vat.close());

  const h1 = await store.save(vat.snapshot);
  t.snapshot(h1, 'initial snapshot');

  const bootScript = await ld.asset(
    '@agoric/xsnap/dist/bundle-ses-boot.umd.js',
  );
  await vat.evaluate(bootScript);

  const h2 = await store.save(vat.snapshot);
  t.snapshot(h2, 'after SES boot - sensitive to SES-shim, XS, and supervisor');

  await vat.evaluate('globalThis.x = harden({a: 1})');
  const h3 = await store.save(vat.snapshot);
  t.snapshot(
    h3,
    'after use of harden() - sensitive to SES-shim, XS, and supervisor',
  );

  t.log(`\
This test fails under maintenance of xsnap dependencies.
If these changes are expected, run:
  yarn test --update-snapshots test/test-xsnap-store.js
Then commit the changes in .../snapshots/ path.
`);
});

async function makeTestSnapshot(t) {
  const pool = tmp.dirSync({ unsafeCleanup: true });
  t.teardown(() => pool.removeCallback());
  // t.log({ pool: pool.name });
  await fs.promises.mkdir(pool.name, { recursive: true });
  const store = makeSnapStore(pool.name, makeSnapStoreIO());
  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  const bootScript = await ld.asset(
    '@agoric/xsnap/dist/bundle-ses-boot.umd.js',
  );
  await vat.evaluate(bootScript);
  await vat.evaluate('globalThis.x = harden({a: 1})');
  const hash = await store.save(vat.snapshot);
  await vat.close();
  return hash;
}

test('XS + SES snapshots are short-term deterministic', async t => {
  const h1 = await makeTestSnapshot(t);
  const h2 = await makeTestSnapshot(t);
  t.is(h1, h2);
});
