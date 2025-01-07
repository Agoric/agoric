// @ts-nocheck
import test from 'ava';

import tmp from 'tmp';
import { kunser } from '@agoric/kmarshal';
import {
  initSwingStore,
  openSwingStore,
  makeSwingStoreExporter,
  importSwingStore,
} from '@agoric/swing-store';
import { initializeSwingset, makeSwingsetController } from '../../src/index.js';
import { buildKernelBundle } from '../../src/controller/initializeSwingset.js';

/**
 * @param {string} [prefix]
 * @returns {Promise<[string, () => void]>}
 */
const tmpDir = async prefix =>
  new Promise((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true, prefix }, (err, name, removeCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve([name, removeCallback]);
      }
    });
  });

const bfile = name => new URL(name, import.meta.url).pathname;

test.before(async t => {
  const runtimeOptions = { kernelBundle: await buildKernelBundle() };
  t.context.data = { runtimeOptions };
});

test('state-sync reload', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  const [importDbDir, cleanupImport] = await tmpDir('importtestdb');
  t.teardown(cleanup);
  t.teardown(cleanupImport);

  const config = {
    snapshotInitial: 2,
    // the new pseudo-deliveries ('initialize-worker',
    // 'save-snapshot', and 'load-snapshot' all count against the
    // snapshotInterval. So setting it to 7 will get us 5 actual
    // deliveries between the two snapshot events.
    snapshotInterval: 7,
    defaultReapInterval: 'never',
    defaultManagerType: 'xsnap',
    bundles: {
      bundle: { sourceSpec: bfile('vat-bootstrap-transcript.js') },
    },
    vats: {
      bootstrap: { bundleName: 'bundle' },
    },
    bootstrap: 'bootstrap',
  };

  const { kernelStorage, hostStorage } = initSwingStore(dbDir);
  const { commit } = hostStorage;
  const initOpts = { addComms: false, addVattp: false, addTimer: false };
  await initializeSwingset(config, [], kernelStorage, initOpts);
  await commit();

  const { runtimeOptions } = t.context.data;
  const c1 = await makeSwingsetController(kernelStorage, {}, runtimeOptions);
  t.teardown(c1.shutdown);
  c1.pinVatRoot('bootstrap');
  // const vatID = c1.vatNameToID('bootstrap');

  const doCount = async c => {
    const kpid = c.queueToVatRoot('bootstrap', 'count', [], 'panic');
    await c.run();
    t.is(c.kpStatus(kpid), 'fulfilled');
    return kunser(c.kpResolution(kpid));
  };

  // this should result in a final snapshot on d19, then a short
  // current transcript of just d20 = 'load-snapshot' and d21 =
  // 'message' (count -> 7)
  for (let i = 1; i <= 7; i += 1) {
    const res = await doCount(c1);
    t.is(res, i);
  }

  await commit();
  await c1.shutdown();

  const exporter = makeSwingStoreExporter(dbDir);
  const exportData = new Map();
  for await (const [k, v] of exporter.getExportData()) {
    if (v !== undefined) {
      exportData.set(k, v);
    } else {
      exportData.delete(k);
    }
  }
  const artifacts = new Map();
  for await (const name of exporter.getArtifactNames()) {
    artifacts.set(name, exporter.getArtifact(name));
  }

  const datasetExporter = {
    getExportData: () => [...exportData.entries()],
    getArtifactNames: () => [...artifacts.keys()],
    getArtifact: name => artifacts.get(name),
    close: () => 0,
  };
  const ssi = await importSwingStore(datasetExporter, importDbDir);
  await ssi.hostStorage.commit();
  await ssi.hostStorage.close();
  const ss2 = openSwingStore(importDbDir);
  t.teardown(ss2.hostStorage.close);
  const c2 = await makeSwingsetController(
    ss2.kernelStorage,
    {},
    runtimeOptions,
  );
  t.teardown(c2.shutdown);

  t.is(await doCount(c2), 8);
});
