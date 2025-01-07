// @ts-check

import tmp from 'tmp';
import test from 'ava';

import bundleSource from '@endo/bundle-source';

import {
  initSwingStore,
  openSwingStore,
  isSwingStore,
} from '../src/swingStore.js';

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

async function embundle(filename) {
  const bundleFile = new URL(filename, import.meta.url).pathname;
  const bundle = await bundleSource(bundleFile);
  const bundleID = `b1-${bundle.endoZipBase64Sha512}`;
  return /** @type {const} */ ([bundleID, bundle]);
}

function* iterate(kvStore, start, end) {
  if (kvStore.has(start)) {
    yield start;
  }
  let prev = start;
  while (true) {
    const next = kvStore.getNextKey(prev);
    if (!next || next >= end) {
      break;
    }
    yield next;
    prev = next;
  }
}
harden(iterate);

function makeExportLog() {
  const exportLog = [];
  return {
    callback(updates) {
      exportLog.push(updates);
    },
    getLog() {
      return exportLog;
    },
  };
}

function checkKVState(t, swingstore) {
  const kv = swingstore.debug.dump().kvEntries;
  t.deepEqual(kv, { foo: 'f', foo1: 'f1', foo3: 'f3' });
}

function testKVStore(t, storage, exportLog) {
  const { kvStore, startCrank, endCrank } = storage.kernelStorage;
  startCrank();
  t.falsy(kvStore.has('missing'));
  t.is(kvStore.get('missing'), undefined);

  kvStore.set('foo', 'f');
  t.truthy(kvStore.has('foo'));
  t.is(kvStore.get('foo'), 'f');

  kvStore.set('foo2', 'f2');
  kvStore.set('foo1', 'f1');
  kvStore.set('foo3', 'f3');
  t.is(kvStore.getNextKey('foo'), 'foo1');
  t.is(kvStore.getNextKey('foo1'), 'foo2');
  t.is(kvStore.getNextKey('foo2'), 'foo3');
  t.is(kvStore.getNextKey('foo3'), undefined);
  t.is(kvStore.getNextKey('goo'), undefined);
  t.deepEqual(Array.from(iterate(kvStore, 'foo1', 'foo3')), ['foo1', 'foo2']);
  t.deepEqual(Array.from(iterate(kvStore, 'foo1', 'foo4')), [
    'foo1',
    'foo2',
    'foo3',
  ]);
  endCrank();
  startCrank();

  kvStore.delete('foo2');
  t.falsy(kvStore.has('foo2'));
  t.is(kvStore.get('foo2'), undefined);
  t.is(kvStore.getNextKey('foo1'), 'foo3');
  t.is(kvStore.getNextKey('foo2'), 'foo3');
  endCrank();
  checkKVState(t, storage);
  t.deepEqual(exportLog.getLog(), [
    [
      ['kv.foo', 'f'],
      ['kv.foo1', 'f1'],
      ['kv.foo2', 'f2'],
      ['kv.foo3', 'f3'],
    ],
    [['kv.foo2', null]],
  ]);
}

test('in-memory kvStore read/write', t => {
  const exportLog = makeExportLog();
  const ss1 = initSwingStore(null, { exportCallback: exportLog.callback });
  testKVStore(t, ss1, exportLog);
  const serialized = ss1.debug.serialize();
  const ss2 = initSwingStore(null, { serialized });
  checkKVState(t, ss2);
});

test('persistent kvStore read/write/re-open', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  const exportLog = makeExportLog();
  t.teardown(cleanup);
  t.is(isSwingStore(dbDir), false);
  const ss1 = initSwingStore(dbDir, { exportCallback: exportLog.callback });
  testKVStore(t, ss1, exportLog);
  await ss1.hostStorage.commit();
  await ss1.hostStorage.close();
  t.is(isSwingStore(dbDir), true);

  const ss2 = openSwingStore(dbDir);
  checkKVState(t, ss2);
  await ss2.hostStorage.close();
  t.is(isSwingStore(dbDir), true);
});

test('persistent kvStore maxKeySize write', async t => {
  // Vat collections assume they have 220 characters for their key space.
  // This is based on previous math where LMDB's key size was 511 bytes max
  // and the native UTF-16 encoding of JS strings, minus some overhead
  // for vat store prefixes.
  // However some unicode codepoints may end up serialized as 3 bytes with UTF-8
  // This tests that no matter what, we can write 254 unicode characters in the
  // 0x0800 - 0xFFFF range (single UTF-16 codepoint, but 3 byte UTF-8).

  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  t.is(isSwingStore(dbDir), false);
  const { kernelStorage, hostStorage } = initSwingStore(dbDir);
  kernelStorage.kvStore.set('€'.repeat(254), 'Money!');
  await hostStorage.commit();
  await hostStorage.close();
});

const testTranscriptStore = test.macro({
  title(prefix = '', { ephemeral, keepTranscripts }) {
    const type = ephemeral ? 'in-memory' : 'persistent';
    const detail = keepTranscripts ? 'with retention' : 'without retention';
    return `${prefix.replace(/.$/, '$& ')}${type} transcriptStore ${detail}`;
  },
  async exec(t, { ephemeral, keepTranscripts }) {
    let dbDir = null;
    if (!ephemeral) {
      const [tmpPath, cleanup] = await tmpDir('testdb');
      t.teardown(cleanup);
      t.is(isSwingStore(tmpPath), false);
      dbDir = tmpPath;
    }

    const exportLog = makeExportLog();
    const { kernelStorage, hostStorage } = initSwingStore(dbDir, {
      exportCallback: exportLog.callback,
      keepTranscripts,
    });
    const { transcriptStore } = kernelStorage;
    const { commit, close } = hostStorage;

    transcriptStore.initTranscript('st1');
    transcriptStore.initTranscript('st2');
    transcriptStore.addItem('st1', 'zeroth');
    await transcriptStore.rolloverSpan('st1');
    transcriptStore.addItem('st1', 'first');
    transcriptStore.addItem('st1', 'second');
    await transcriptStore.rolloverSpan('st1');
    transcriptStore.addItem('st1', 'third');
    transcriptStore.addItem('st2', 'oneth');
    transcriptStore.addItem('st1', 'fourth');
    transcriptStore.addItem('st2', 'twoth');
    transcriptStore.addItem('st2', 'threeth');
    transcriptStore.addItem('st2', 'fourst');
    const reader1a = transcriptStore.readSpan('st1', 0);
    const reader1b = transcriptStore.readSpan('st1', 1);
    if (keepTranscripts) {
      t.deepEqual(Array.from(reader1a), ['zeroth']);
      t.deepEqual(Array.from(reader1b), ['first', 'second']);
    } else {
      const fna = async () => Array.from(reader1a);
      const fnb = async () => Array.from(reader1b);
      await t.throwsAsync(fna, undefined, 'pruned spans must not be readable');
      await t.throwsAsync(fnb, undefined, 'pruned spans must not be readable');
    }
    const reader2 = transcriptStore.readSpan('st2', 0);
    t.deepEqual(Array.from(reader2), ['oneth', 'twoth', 'threeth', 'fourst']);

    t.throws(() => transcriptStore.readSpan('st2', 3), {
      message: 'no transcript span for "st2" at 3',
    });

    const reader1alt = transcriptStore.readSpan('st1');
    t.deepEqual(Array.from(reader1alt), ['third', 'fourth']);
    const reader1alt2 = transcriptStore.readSpan('st1', 3);
    t.deepEqual(Array.from(reader1alt2), ['third', 'fourth']);

    transcriptStore.initTranscript('empty');
    const readerEmpty = transcriptStore.readSpan('empty');
    t.deepEqual(Array.from(readerEmpty), []);

    t.throws(() => transcriptStore.readSpan('nonexistent'), {
      message: 'no current transcript for "nonexistent"',
    });

    await commit();
    t.deepEqual(exportLog.getLog(), [
      [
        [
          'transcript.empty.current',
          '{"vatID":"empty","startPos":0,"endPos":0,"hash":"43e6be43a3a34d60c0ebeb8498b5849b094fc20fc68483a7aeb3624fa10f79f6","isCurrent":1,"incarnation":0}',
        ],
        [
          'transcript.st1.0',
          '{"vatID":"st1","startPos":0,"endPos":1,"hash":"92d0cf6ecd39b60b4e32dc65d4c6f343495928cb041f25b19e2825b17f4daa9a","isCurrent":0,"incarnation":0}',
        ],
        [
          'transcript.st1.1',
          '{"vatID":"st1","startPos":1,"endPos":3,"hash":"d385c43882cfb5611d255e362a9a98626ba4e55dfc308fc346c144c696ae734e","isCurrent":0,"incarnation":0}',
        ],
        [
          'transcript.st1.current',
          '{"vatID":"st1","startPos":3,"endPos":5,"hash":"789342fab468506c624c713c46953992f53a7eaae390d634790d791636b96cab","isCurrent":1,"incarnation":0}',
        ],
        [
          'transcript.st2.current',
          '{"vatID":"st2","startPos":0,"endPos":4,"hash":"45de7ae9d2be34148f9cf3000052e5d1374932d663442fe9f39a342d221cebf1","isCurrent":1,"incarnation":0}',
        ],
      ],
    ]);
    await close();
  },
});

test(testTranscriptStore, { ephemeral: true, keepTranscripts: true });
test(testTranscriptStore, { ephemeral: true, keepTranscripts: false });
test(testTranscriptStore, { ephemeral: false, keepTranscripts: true });
test(testTranscriptStore, { ephemeral: false, keepTranscripts: false });

test('transcriptStore abort', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  const { kernelStorage, hostStorage } = initSwingStore(dbDir);
  const { transcriptStore } = kernelStorage;
  const { commit, close } = hostStorage;

  transcriptStore.initTranscript('st1');
  transcriptStore.addItem('st1', 'first');
  await commit(); // really write 'first'

  transcriptStore.initTranscript('st2');
  transcriptStore.addItem('st2', 'second');
  // abort is close without commit
  await close();

  const { transcriptStore: ss2 } = openSwingStore(dbDir).kernelStorage;
  const reader = ss2.readSpan('st1', 0);
  t.deepEqual(Array.from(reader), ['first']); // and not 'second'
});

async function testBundleStore(t, dbDir) {
  const exportLog = makeExportLog();
  const { kernelStorage, hostStorage } = initSwingStore(dbDir, {
    exportCallback: exportLog.callback,
  });
  const { bundleStore } = kernelStorage;
  const { commit, close } = hostStorage;

  const [bundleID1, bundle1] = await embundle('./faux-module.js');
  const [bundleID2, bundle2] = await embundle('./bohr-module.js');

  t.falsy(bundleStore.hasBundle(bundleID1));
  t.falsy(bundleStore.hasBundle(bundleID2));
  t.falsy(bundleStore.hasBundle('b1-obviouslyfake'));

  bundleStore.addBundle(bundleID1, bundle1);
  bundleStore.addBundle(bundleID2, bundle2);

  t.truthy(bundleStore.hasBundle(bundleID1));
  t.truthy(bundleStore.hasBundle(bundleID2));
  t.falsy(bundleStore.hasBundle('b1-obviouslyfake'));

  bundleStore.deleteBundle(bundleID1);

  t.falsy(bundleStore.hasBundle(bundleID1));
  t.truthy(bundleStore.hasBundle(bundleID2));
  t.falsy(bundleStore.hasBundle('b1-obviouslyfake'));

  const rebundle2 = bundleStore.getBundle(bundleID2);
  t.deepEqual(bundle2, rebundle2);
  await commit();
  await close();
}

test('in-memory bundleStore read/write', async t => {
  await testBundleStore(t, null);
});

test('persistent bundleStore read/write', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  t.is(isSwingStore(dbDir), false);
  await testBundleStore(t, dbDir);
});

test('close will abort transaction', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  const ss1 = initSwingStore(dbDir);
  ss1.kernelStorage.kvStore.set('key1', 'value');
  await ss1.hostStorage.commit();
  ss1.kernelStorage.kvStore.set('key2', 'value');
  // no commit, so ought to abort the 'key2' addition
  await ss1.hostStorage.close();

  const ss2 = openSwingStore(dbDir);
  const { kvStore } = ss2.kernelStorage;
  t.is(kvStore.get('key1'), 'value');
  t.truthy(kvStore.has('key1'));
  t.is(kvStore.get('key2'), undefined);
  t.falsy(kvStore.has('key2'));
});

test('savepoints', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  const ss1 = initSwingStore(dbDir);
  ss1.kernelStorage.startCrank();
  ss1.kernelStorage.kvStore.set('key', 'value1');
  ss1.kernelStorage.establishCrankSavepoint('sp1');
  ss1.kernelStorage.kvStore.set('key', 'value2');
  ss1.kernelStorage.establishCrankSavepoint('sp2');
  ss1.kernelStorage.kvStore.set('key', 'value3');
  ss1.kernelStorage.rollbackCrank('sp1');
  ss1.kernelStorage.endCrank();
  await ss1.hostStorage.commit();
  await ss1.hostStorage.close();

  const ss2 = openSwingStore(dbDir);
  t.is(ss2.kernelStorage.kvStore.get('key'), 'value1');
});

test('savepoints do not automatically commit', async t => {
  const [dbDir, cleanup] = await tmpDir('testdb');
  t.teardown(cleanup);
  const ss1 = initSwingStore(dbDir);
  ss1.kernelStorage.startCrank();
  ss1.kernelStorage.establishCrankSavepoint('sp1');
  ss1.kernelStorage.kvStore.set('key', 'value1');
  // #8423 meant this .endCrank() accidentally did a commit()
  ss1.kernelStorage.endCrank();
  await ss1.hostStorage.close();

  const ss2 = openSwingStore(dbDir);
  t.false(ss2.kernelStorage.kvStore.has('key'));
});
