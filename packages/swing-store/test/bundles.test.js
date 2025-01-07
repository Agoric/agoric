// @ts-check
import test from 'ava';
import tmp from 'tmp';
import { Buffer } from 'buffer';
import { createSHA256 } from '../src/hasher.js';
import { initSwingStore } from '../src/swingStore.js';
import { makeSwingStoreExporter } from '../src/exporter.js';
import { importSwingStore } from '../src/importer.js';
import { buffer } from '../src/util.js';

function makeB0ID(bundle) {
  return `b0-${createSHA256(JSON.stringify(bundle)).finish()}`;
}

test('b0 format', t => {
  const { kernelStorage } = initSwingStore();
  const { bundleStore } = kernelStorage;

  /** @type {import('../src/bundleStore.js').Bundle} */
  const b0A = { moduleFormat: 'nestedEvaluate', source: '1+1' };
  const idA = makeB0ID(b0A);
  bundleStore.addBundle(idA, b0A);
  t.truthy(bundleStore.hasBundle(idA));
  t.deepEqual(bundleStore.getBundle(idA), b0A);

  const idBogus = `${idA}bogus`;
  t.throws(() => bundleStore.addBundle(idBogus, b0A), {
    message: /does not match bundle/,
  });
  t.falsy(bundleStore.hasBundle(idBogus));

  /** @type {import('../src/bundleStore.js').Bundle} */
  const b0B = { moduleFormat: 'getExport', source: '1+1' };
  const idB = makeB0ID(b0B);
  t.throws(() => bundleStore.addBundle(idB, b0B), {
    message: /unsupported b0- module format "getExport"/,
  });
});

function makeExportCallback() {
  const exportData = new Map();
  return {
    exportData,
    exportCallback(updates) {
      for (const [key, value] of updates) {
        if (value !== undefined) {
          exportData.set(key, value);
        } else {
          exportData.delete(key);
        }
      }
    },
  };
}

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

const collectArray = async iter => {
  const items = [];
  for await (const item of iter) {
    items.push(item);
  }
  return items;
};

test('b0 export', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  const { exportData, exportCallback } = makeExportCallback();
  const { kernelStorage, hostStorage } = initSwingStore(dbDir, {
    exportCallback,
  });
  const { bundleStore } = kernelStorage;

  /** @type {import('../src/bundleStore.js').Bundle} */
  const b0A = { moduleFormat: 'nestedEvaluate', source: '1+1' };
  const idA = makeB0ID(b0A);
  bundleStore.addBundle(idA, b0A);
  await hostStorage.commit();
  t.is(exportData.get(`bundle.${idA}`), idA);

  const exporter = makeSwingStoreExporter(dbDir);
  const exportData2 = new Map();
  for await (const [key, value] of exporter.getExportData()) {
    exportData2.set(key, value);
  }
  t.is(exportData2.get(`bundle.${idA}`), idA);

  const names = await collectArray(exporter.getArtifactNames());
  t.deepEqual(names, [`bundle.${idA}`]);
  const artifact = await buffer(exporter.getArtifact(names[0]));
  t.is(artifact.toString(), JSON.stringify(b0A));
});

test('b0 import', async t => {
  const b0A = { moduleFormat: 'nestedEvaluate', source: '1+1' };
  const idA = makeB0ID(b0A);
  const nameA = `bundle.${idA}`;
  const exporter = {
    getHostKV(_key) {
      return undefined;
    },
    async *getExportData() {
      yield /** @type {const} */ ([nameA, idA]);
    },
    async *getArtifact(name) {
      t.is(name, nameA);
      yield Buffer.from(JSON.stringify(b0A));
    },
    async *getArtifactNames() {
      yield* [nameA];
    },
    close: async () => undefined,
  };
  const ss = await importSwingStore(exporter);
  t.teardown(ss.hostStorage.close);
  await ss.hostStorage.commit();
  const serialized = ss.debug.serialize();
  const { kernelStorage } = initSwingStore(null, { serialized });
  const { bundleStore } = kernelStorage;
  t.truthy(bundleStore.hasBundle(idA));
  t.deepEqual(bundleStore.getBundle(idA), b0A);
});

test('b0 bad import', async t => {
  const b0A = { moduleFormat: 'nestedEvaluate', source: '1+1' };
  const b0Abogus = { moduleFormat: 'nestedEvaluate', source: '1+2' };
  const idA = makeB0ID(b0A);
  const nameA = `bundle.${idA}`;
  const exporter = {
    getHostKV(_key) {
      return undefined;
    },
    async *getExportData() {
      yield /** @type {const} */ ([nameA, idA]);
    },
    async *getArtifact(name) {
      t.is(name, nameA);
      yield Buffer.from(JSON.stringify(b0Abogus));
    },
    async *getArtifactNames() {
      yield* [nameA];
    },
    close: async () => undefined,
  };
  await t.throwsAsync(async () => importSwingStore(exporter), {
    message: /does not match bundle artifact/,
  });
});

test('unknown format', t => {
  const { kernelStorage } = initSwingStore();
  const { bundleStore } = kernelStorage;
  const unknownID = 'b1999-whoa-futuristic';
  /** @import {Bundle} from '../src/bundleStore.js' */
  t.throws(() => bundleStore.addBundle(unknownID, /** @type {Bundle} */ ({})), {
    message: /unsupported BundleID/,
  });
});
