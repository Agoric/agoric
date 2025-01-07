// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';

import { spawn } from 'child_process';
import fs from 'fs';
import { tmpName } from 'tmp';
import sqlite3 from 'better-sqlite3';
import { makePromiseKit } from '@endo/promise-kit';
import { makeSnapStore, makeSnapStoreIO } from '@agoric/swing-store';

import { makeStartXSnap } from '../src/controller/startXSnap.js';

// controller.js had a bug (#5040) wherein 'meterOpts' were applied
// inconsistently to fresh workers vs ones from snapshot, allowing
// fresh workers more runtime than ones reloaded from snapshot

function handleCommand() {}

function make(snapStore) {
  const pk = makePromiseKit();
  const startXSnap = makeStartXSnap({
    snapStore,
    spawn: (command, args, opts) => {
      pk.resolve(args);
      return spawn(command, args, opts);
    },
    fs,
    tmpName,
    overrideBundles: [], // do not load *any* bundles, not even defaults
  });
  return { p: pk.promise, startXSnap };
}

function checkMetered(t, args, metered) {
  const a = args.join(' ');
  if (metered) {
    // metered workers either have '-l NN' (with NN>0)
    t.notRegex(a, /-l 0/);
  } else {
    // unmetered workers have '-l 0', or omit -l entirely
    const elli = args.indexOf('-l');
    if (elli === -1) {
      t.pass();
    } else {
      t.is(args[elli + 1], '0');
    }
  }
}

async function doTest(t, metered) {
  const db = sqlite3(':memory:');
  const store = makeSnapStore(db, () => {}, makeSnapStoreIO());

  const { p: p1, startXSnap: start1 } = make(store);
  const worker1 = await start1('name', {
    bundleIDs: [],
    handleCommand,
    metered,
  });
  const spawnArgs1 = await p1;
  checkMetered(t, spawnArgs1, metered);
  await worker1.evaluate('1+2');
  t.teardown(async () => worker1.close());

  // now extract a snapshot
  await store.saveSnapshot('vat', 1, worker1.makeSnapshotStream());

  // and load it into a new worker
  const { p: p2, startXSnap: start2 } = make(store);
  const worker2 = await start2('name', {
    bundleIDs: [],
    handleCommand,
    metered,
    init: { from: 'snapStore', vatID: 'vat' },
  });
  const spawnArgs2 = await p2;
  checkMetered(t, spawnArgs2, metered);
  await worker2.evaluate('1+2');
  t.teardown(async () => worker2.close());
}

test('no metering', async t => {
  await doTest(t, false);
});

test('yes metering', async t => {
  await doTest(t, true);
});
