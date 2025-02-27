// @ts-nocheck
/* global globalThis */

import { spawn } from 'child_process';
import fs from 'fs';
import { tmpName } from 'tmp';
import { type as osType } from 'os';
import sqlite3 from 'better-sqlite3';
import test from 'ava';
import { makeMeasureSeconds } from '@agoric/internal';
import { xsnap } from '@agoric/xsnap';
import { getLockdownBundle } from '@agoric/xsnap-lockdown';
import { makeSnapStore, makeSnapStoreIO } from '@agoric/swing-store';

const makeMockSnapStoreIO = () => ({
  ...makeSnapStoreIO(),
  measureSeconds: makeMeasureSeconds(() => 0),
});

const getBootScript = () =>
  getLockdownBundle().then(bundle => `(${bundle.source}\n)()`.trim());

/** @type {(compressedSize: number, fullSize: number) => number} */
const relativeSize = (compressedSize, fullSize) =>
  Math.round((compressedSize / 1024 / fullSize) * 10) / 10;

const snapSize = {
  raw: 417,
  SESboot: 858,
};

/**
 * @param {string} name
 * @param {(request:Uint8Array) => Promise<Uint8Array>} handleCommand
 * @param {string} script to execute
 */
async function bootWorker(name, handleCommand, script) {
  const worker = await xsnap({
    os: osType(),
    fs: { ...fs, ...fs.promises, tmpName },
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
 * @param {(request:Uint8Array) => Promise<Uint8Array>} handleCommand
 */
async function bootSESWorker(name, handleCommand) {
  const bootScript = await getBootScript();
  return bootWorker(name, handleCommand, bootScript);
}

test(`create XS Machine, snapshot (${snapSize.raw} Kb), compress to smaller`, async t => {
  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  t.teardown(() => vat.close());

  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeMockSnapStoreIO());

  const { compressedSize } = await store.saveSnapshot(
    'vat0',
    1,
    vat.makeSnapshotStream(),
  );

  t.log({ compressedSize, uncompressedSize: snapSize.raw });

  t.true(
    relativeSize(compressedSize, snapSize.raw) < 0.60,
    'compressed snapshots are smaller',
  );
});

test('SES bootstrap, save, compress', async t => {
  const vat = await bootSESWorker('ses-boot1', async m => m);
  t.teardown(() => vat.close());

  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeMockSnapStoreIO());

  await vat.evaluate('globalThis.x = harden({a: 1})');

  const { compressedSize } = await store.saveSnapshot(
    'vat0',
    1,
    vat.makeSnapshotStream(),
  );

  t.true(
    relativeSize(compressedSize, snapSize.SESboot) < 0.75,
    'compressed snapshots are smaller',
  );
});

test('create SES worker, save, restore, resume', async t => {
  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeMockSnapStoreIO());

  const vat0 = await bootSESWorker('ses-boot2', async m => m);
  t.teardown(() => vat0.close());
  await vat0.evaluate('globalThis.x = harden({a: 1})');
  await store.saveSnapshot('vat0', 1, vat0.makeSnapshotStream());

  const snapshotStream = store.loadSnapshot('vat0');

  const worker = await xsnap({
    name: 'ses-resume',
    snapshotStream,
    os: osType(),
    spawn,
    fs: { ...fs, ...fs.promises, tmpName },
  });
  await worker.isReady();
  t.teardown(() => worker.close());
  await worker.evaluate('x.a');
  t.pass();
});

/**
 * The snapshot hashes in this test are, naturally,
 * sensitive to any changes in bundle-ses-boot.umd.js;
 * that is: any changes to the SES shim or to the
 * xsnap-worker supervisor.
 * They are also sensitive to the XS code itself.
 */
test('XS + SES snapshots are long-term deterministic', async t => {
  const ENDO_BRANCH = globalThis.process?.env?.ENDO_BRANCH;
  if (ENDO_BRANCH && ENDO_BRANCH !== 'NOPE') {
    t.log(`Skipping test on ENDO_BRANCH=${ENDO_BRANCH}`);
    t.pass();
    return;
  }

  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeMockSnapStoreIO());

  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  t.teardown(() => vat.close());

  const {
    filePath: _path1,
    compressedSize: _csize1,
    ...info1
  } = await store.saveSnapshot('vat0', 1, vat.makeSnapshotStream());
  t.snapshot(info1, 'initial snapshot');

  const bootScript = await getBootScript();
  await vat.evaluate(bootScript);

  const {
    filePath: _path2,
    compressedSize: _csize2,
    ...info2
  } = await store.saveSnapshot('vat0', 2, vat.makeSnapshotStream());
  t.snapshot(
    info2,
    'after SES boot - sensitive to SES-shim, XS, and supervisor',
  );

  await vat.evaluate('globalThis.x = harden({a: 1})');
  const {
    filePath: _path3,
    compressedSize: _csize3,
    ...info3
  } = await store.saveSnapshot('vat0', 3, vat.makeSnapshotStream());
  t.snapshot(
    info3,
    'after use of harden() - sensitive to SES-shim, XS, and supervisor',
  );

  t.log(`\
This test fails under maintenance of xsnap dependencies.
If these changes are expected, run:
  yarn test --update-snapshots test/xsnap-store.test.js
Then commit the changes in .../snapshots/ path.
`);
});

async function makeTestSnapshot() {
  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeMockSnapStoreIO());
  const vat = await bootWorker('xs1', async m => m, '1 + 1');
  const bootScript = await getBootScript();
  await vat.evaluate(bootScript);
  await vat.evaluate('globalThis.x = harden({a: 1})');
  const info = await store.saveSnapshot('vat0', 1, vat.makeSnapshotStream());
  await vat.close();
  return info;
}

test('XS + SES snapshots are short-term deterministic', async t => {
  const info1 = await makeTestSnapshot(t);
  const info2 = await makeTestSnapshot(t);
  t.deepEqual(info1, info2);
});
