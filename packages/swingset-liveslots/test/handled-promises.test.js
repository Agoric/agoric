import test from 'ava';

import { Fail } from '@endo/errors';
import { Far } from '@endo/marshal';
import { M } from '@agoric/store';
import { makePromiseKit } from '@endo/promise-kit';
// Disabled to avoid circular dependencies.
// import { makeStoreUtils } from '@agoric/vat-data/src/vat-data-bindings.js';
// import { makeExoUtils } from '@agoric/vat-data/src/exo-utils.js';
import { kslot, kser } from '@agoric/kmarshal';
import { setupTestLiveslots } from './liveslots-helpers.js';
import { makeResolve, makeReject } from './util.js';
import { makeExoUtils } from './exo-utils.js';

// eslint-disable-next-line no-unused-vars
const compareEntriesByKey = ([ka], [kb]) => (ka < kb ? -1 : 1);

// cf. packages/SwingSet/test/vat-durable-promise-watcher.js
const buildPromiseWatcherRootObject = (vatPowers, vatParameters, baggage) => {
  const { VatData } = vatPowers;
  const { watchPromise } = VatData;
  const { prepareExo } = makeExoUtils(VatData);
  // const { makeScalarBigMapStore } = makeStoreUtils(VatData);
  const PromiseWatcherI = M.interface('ExtraArgPromiseWatcher', {
    onFulfilled: M.call(M.any(), M.string()).returns(),
    onRejected: M.call(M.any(), M.string()).returns(),
  });
  const watchResolutions = new Map();
  const watcher = prepareExo(
    baggage,
    // No longer ignoring, but the name is set in stone in `kvStoreDataV1`
    'DurablePromiseIgnorer',
    PromiseWatcherI,
    {
      onFulfilled(value, name) {
        watchResolutions.set(name, { status: 'fulfilled', value });
      },
      onRejected(reason, name) {
        watchResolutions.set(name, { status: 'rejected', reason });
      },
    },
  );

  const knownPromises = new Map();

  const root = Far('root', {
    getPromise: name => {
      const promise = knownPromises.get(name);
      promise || Fail`promise doesn't exists: ${name}`;
      return { promise };
    },
    importPromise: (name, promise) => {
      !knownPromises.has(name) || Fail`promise already exists: ${name}`;
      knownPromises.set(name, promise);
      return `imported promise: ${name}`;
    },
    createLocalPromise: (name, fulfillment, rejection) => {
      !knownPromises.has(name) || Fail`promise already exists: ${name}`;
      const { promise, resolve, reject } = makePromiseKit();
      if (fulfillment !== undefined) {
        resolve(fulfillment);
      } else if (rejection !== undefined) {
        reject(rejection);
      }
      knownPromises.set(name, promise);
      return `created local promise: ${name}`;
    },
    watchPromise: name => {
      knownPromises.has(name) || Fail`promise not found: ${name}`;
      watchPromise(knownPromises.get(name), watcher, name);
      return `watched promise: ${name}`;
    },
    getWatchResolution: name => {
      return watchResolutions.get(name);
    },
  });

  const startOperations = vatParameters?.startOperations || [];
  for (const [method, ...args] of startOperations) {
    root[method](...args);
  }

  return root;
};
const kvStoreDataV1 = Object.entries({
  baggageID: 'o+d6/1',
  idCounters: '{"exportID":11,"collectionID":5,"promiseID":9}',
  kindIDID: '1',
  storeKindIDTable:
    '{"scalarMapStore":2,"scalarWeakMapStore":3,"scalarSetStore":4,"scalarWeakSetStore":5,"scalarDurableMapStore":6,"scalarDurableWeakMapStore":7,"scalarDurableSetStore":8,"scalarDurableWeakSetStore":9}',
  'vc.1.sDurablePromiseIgnorer_kindHandle':
    '{"body":"#\\"$0.Alleged: kind\\"","slots":["o+d1/10"]}',
  'vc.1.sthe_DurablePromiseIgnorer':
    '{"body":"#\\"$0.Alleged: DurablePromiseIgnorer\\"","slots":["o+d10/1"]}',
  'vc.1.|entryCount': '2',
  'vc.1.|nextOrdinal': '1',
  'vc.1.|schemata':
    '{"label":"baggage","body":"#{\\"keyShape\\":{\\"#tag\\":\\"match:string\\",\\"payload\\":[]}}","slots":[]}',
  // non-durable
  // 'vc.2.sp+6': '{"body":"#\\"&0\\"","slots":["p+6"]}',
  // 'vc.2.|entryCount': '1',
  // 'vc.2.|nextOrdinal': '1',
  // 'vc.2.|schemata': '{"label":"promiseRegistrations","body":"#{\\"keyShape\\":{\\"#tag\\":\\"match:scalar\\",\\"payload\\":\\"#undefined\\"}}","slots":[]}',
  'vc.3.|entryCount': '0',
  'vc.3.|nextOrdinal': '1',
  'vc.3.|schemata':
    '{"label":"promiseWatcherByKind","body":"#{\\"keyShape\\":{\\"#tag\\":\\"match:scalar\\",\\"payload\\":\\"#undefined\\"}}","slots":[]}',
  'vc.4.sp+6':
    '{"body":"#[[\\"$0.Alleged: DurablePromiseIgnorer\\",\\"orphaned\\"]]","slots":["o+d10/1"]}',
  'vc.4.sp-8':
    '{"body":"#[[\\"$0.Alleged: DurablePromiseIgnorer\\",\\"unresolved\\"]]","slots":["o+d10/1"]}',
  'vc.4.sp-9':
    '{"body":"#[[\\"$0.Alleged: DurablePromiseIgnorer\\",\\"late-rejected\\"]]","slots":["o+d10/1"]}',
  'vc.4.|entryCount': '3',
  'vc.4.|nextOrdinal': '1',
  'vc.4.|schemata':
    '{"label":"watchedPromises","body":"#{\\"keyShape\\":{\\"#tag\\":\\"match:and\\",\\"payload\\":[{\\"#tag\\":\\"match:scalar\\",\\"payload\\":\\"#undefined\\"},{\\"#tag\\":\\"match:string\\",\\"payload\\":[]}]}}","slots":[]}',
  'vom.dkind.10.descriptor':
    '{"kindID":"10","tag":"DurablePromiseIgnorer","unfaceted":true}',
  'vom.dkind.10.nextID': '2',
  'vom.o+d10/1': '{}',
  'vom.rc.o+d1/10': '1',
  'vom.rc.o+d10/1': '3',
  'vom.rc.o+d6/1': '1',
  'vom.rc.o+d6/3': '1',
  'vom.rc.o+d6/4': '1',
  watchedPromiseTableID: 'o+d6/4',
  watcherTableID: 'o+d6/3',
});
const kvStoreDataV1VpidsToReject = ['p+6', 'p-9'];
const kvStoreDataV1KeysToDelete = ['vc.4.sp+6', 'vc.4.sp-9'];
const kvStoreDataV1VpidsToKeep = ['p-8'];
const kvStoreDataV1KeysToKeep = ['vc.4.sp-8'];

test('past-incarnation watched promises', async t => {
  const S = 'settlement';
  // Anchor promise counters upon which the other assertions depend.
  const firstPImport = 9;
  // cf. src/liveslots.js:initialIDCounters
  const firstPExport = 5;

  const startImportedP = firstPImport - 2;

  const v1StartOperations = [
    ['createLocalPromise', 'start orphaned'],
    ['watchPromise', 'start orphaned'],
    ['createLocalPromise', 'start fulfilled', S],
    ['watchPromise', 'start fulfilled'],
    ['importPromise', 'start imported', kslot(`p-${startImportedP}`)],
    ['watchPromise', 'start imported'],
  ];
  const kvStore = new Map();
  let {
    v,
    dispatch,
    dispatchMessage: rawDispatch,
  } = await setupTestLiveslots(
    t,
    buildPromiseWatcherRootObject,
    'durable-promise-watcher',
    {
      kvStore,
      nextPromiseImportNumber: firstPImport,
      vatParameters: { startOperations: v1StartOperations },
    },
  );
  let vatLogs = v.log;

  let lastPImport = firstPImport - 1;
  let lastPExport = firstPExport - 1;
  let dispatches = 0;
  const exportedPromises = new Set();
  const v1OrphanedPExports = [];
  const nextPImport = () => (lastPImport += 1);
  const nextPExport = () => (lastPExport += 1);
  /** @type {typeof rawDispatch} */
  const dispatchMessage = async (...args) => {
    dispatches += 1;
    return rawDispatch(...args);
  };
  const recordExportedPromise = name => {
    exportedPromises.add(name);
    return name;
  };
  // Ignore vatstore syscalls.
  const getDispatchLogs = () =>
    vatLogs.splice(0).filter(m => !m.type.startsWith('vatstore'));
  const settlementMessage = (vpid, rejected, value) => ({
    type: 'resolve',
    resolutions: [[vpid, rejected, kser(value)]],
  });
  const fulfillmentMessage = (vpid, value) =>
    settlementMessage(vpid, false, value);
  const rejectionMessage = (vpid, value) =>
    settlementMessage(vpid, true, value);
  const subscribeMessage = vpid => ({
    type: 'subscribe',
    target: vpid,
  });

  // startVat logs
  v1OrphanedPExports.push(nextPExport());
  recordExportedPromise('start orphaned');
  v1OrphanedPExports.push(nextPExport());
  recordExportedPromise('start fulfilled');
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p-${startImportedP}`),
    subscribeMessage(`p+${lastPExport - 1}`),
    subscribeMessage(`p+${lastPExport}`),
    fulfillmentMessage(`p+${lastPExport}`, S),
  ]);
  await dispatchMessage('createLocalPromise', 'exported', S);
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, 'created local promise: exported'),
  ]);
  await dispatchMessage('getPromise', recordExportedPromise('exported'));
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      promise: kslot(`p+${nextPExport()}`),
    }),
    fulfillmentMessage(`p+${lastPExport}`, S),
  ]);
  const importedP = firstPImport - 1;
  await dispatchMessage('importPromise', 'imported', kslot(`p-${importedP}`));
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p-${importedP}`),
    fulfillmentMessage(`p-${nextPImport()}`, 'imported promise: imported'),
  ]);
  await dispatchMessage('createLocalPromise', 'orphaned');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, 'created local promise: orphaned'),
  ]);
  await dispatchMessage('createLocalPromise', 'orphaned exported');
  await dispatchMessage(
    'getPromise',
    recordExportedPromise('orphaned exported'),
  );
  const orphanedExportedP = nextPExport();
  v1OrphanedPExports.push(orphanedExportedP);
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(
      `p-${nextPImport()}`,
      'created local promise: orphaned exported',
    ),
    fulfillmentMessage(`p-${nextPImport()}`, {
      promise: kslot(`p+${orphanedExportedP}`),
    }),
  ]);
  await dispatchMessage('createLocalPromise', 'fulfilled', S);
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(
      `p-${nextPImport()}`,
      'created local promise: fulfilled',
    ),
  ]);
  await dispatchMessage('createLocalPromise', 'rejected', undefined, S);
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, 'created local promise: rejected'),
  ]);
  t.is(
    lastPImport - firstPImport + 1,
    dispatches,
    `imported ${dispatches} promises (1 per dispatch)`,
  );
  t.is(
    lastPExport - firstPExport + 1,
    exportedPromises.size,
    `exported ${exportedPromises.size} promises: ${[...exportedPromises].join(', ')}`,
  );

  await dispatchMessage('watchPromise', recordExportedPromise('orphaned'));
  v1OrphanedPExports.push(nextPExport());
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p+${lastPExport}`),
    fulfillmentMessage(`p-${nextPImport()}`, 'watched promise: orphaned'),
  ]);
  await dispatchMessage('watchPromise', recordExportedPromise('fulfilled'));
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p+${nextPExport()}`),
    fulfillmentMessage(`p-${nextPImport()}`, 'watched promise: fulfilled'),
    fulfillmentMessage(`p+${lastPExport}`, S),
  ]);
  await dispatchMessage('watchPromise', recordExportedPromise('rejected'));
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p+${nextPExport()}`),
    fulfillmentMessage(`p-${nextPImport()}`, 'watched promise: rejected'),
    rejectionMessage(`p+${lastPExport}`, S),
  ]);
  await dispatchMessage('watchPromise', 'imported');
  t.deepEqual(getDispatchLogs(), [
    // no subscribe, we already did at import
    fulfillmentMessage(`p-${nextPImport()}`, 'watched promise: imported'),
  ]);
  await dispatchMessage('getWatchResolution', 'fulfilled');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: S,
    }),
  ]);
  await dispatchMessage('getWatchResolution', 'rejected');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'rejected',
      reason: S,
    }),
  ]);
  await dispatchMessage('getWatchResolution', 'start fulfilled');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: S,
    }),
  ]);

  t.is(
    lastPImport - firstPImport + 1,
    dispatches,
    `imported ${dispatches} promises (1 per dispatch)`,
  );
  t.is(
    lastPExport - firstPExport + 1,
    exportedPromises.size,
    `exported ${exportedPromises.size} promises: ${[...exportedPromises].join(', ')}`,
  );

  // Simulate upgrade by starting from the non-empty kvStore.
  // t.log(Object.fromEntries([...kvStore.entries()].sort(compareEntriesByKey)));
  const clonedStore = new Map(kvStore);
  const startImported2P = firstPImport - 3;
  const v2StartOperations = [
    ['importPromise', 'start imported 2', kslot(`p-${startImported2P}`)], // import of new promise
    ['importPromise', 'imported', kslot(`p-${importedP}`)], // import previously imported and watched promise
    ['importPromise', 'orphaned exported', kslot(`p+${orphanedExportedP}`)], // import previously exported but unwatched promise
    ['watchPromise', 'orphaned exported'],
  ];
  ({
    v,
    dispatch,
    dispatchMessage: rawDispatch,
  } = await setupTestLiveslots(
    t,
    buildPromiseWatcherRootObject,
    'durable-promise-watcher-v2',
    {
      kvStore: clonedStore,
      nextPromiseImportNumber: lastPImport + 1,
      vatParameters: { startOperations: v2StartOperations },
    },
  ));
  vatLogs = v.log;

  // startVat logs
  t.deepEqual(getDispatchLogs(), [
    subscribeMessage(`p-${startImported2P}`),
    subscribeMessage(`p-${importedP}`),
    subscribeMessage(`p+${orphanedExportedP}`),
  ]);
  // Simulate kernel rejection of promises orphaned by termination/upgrade of their decider vat.
  const expectedDeletions = [...clonedStore.entries()].filter(entry =>
    entry[1].includes('orphaned'),
  );
  t.true(expectedDeletions.length >= 1);
  for (const orphanedPExport of v1OrphanedPExports) {
    await dispatch(
      makeReject(`p+${orphanedPExport}`, kser('tomorrow never came')),
    );
  }
  await dispatchMessage('getWatchResolution', 'orphaned');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'rejected',
      reason: 'tomorrow never came',
    }),
  ]);
  await dispatchMessage('getWatchResolution', 'start orphaned');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'rejected',
      reason: 'tomorrow never came',
    }),
  ]);
  await dispatchMessage('getWatchResolution', 'orphaned exported');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'rejected',
      reason: 'tomorrow never came',
    }),
  ]);
  for (const [key, value] of expectedDeletions) {
    t.false(clonedStore.has(key), `entry should be removed: ${key}: ${value}`);
  }
  // Simulate resolution of imported promises watched in previous incarnation
  await dispatch(makeResolve(`p-${importedP}`, kser(undefined)));
  await dispatchMessage('getWatchResolution', 'imported');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: undefined,
    }),
  ]);
  await dispatch(makeResolve(`p-${startImportedP}`, kser(undefined)));
  await dispatchMessage('getWatchResolution', 'start imported');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: undefined,
    }),
  ]);
  await dispatch(makeResolve(`p-${startImported2P}`, kser(undefined)));
  await dispatchMessage('getWatchResolution', 'start imported 2');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, undefined),
  ]);
  // simulate resolution of imported promise watched after resolution
  await dispatchMessage('watchPromise', 'start imported 2');
  t.deepEqual(getDispatchLogs(), [
    // Promise was previously resolved, so it is re-exported
    subscribeMessage(`p+${nextPExport()}`),
    fulfillmentMessage(
      `p-${nextPImport()}`,
      'watched promise: start imported 2',
    ),
    fulfillmentMessage(`p+${lastPExport}`, undefined),
  ]);
  await dispatchMessage('getWatchResolution', 'start imported 2');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: undefined,
    }),
  ]);

  // Verify that the data is still in loadable condition.
  const finalClonedStore = new Map(clonedStore);
  ({
    v,
    dispatch,
    dispatchMessage: rawDispatch,
  } = await setupTestLiveslots(
    t,
    buildPromiseWatcherRootObject,
    'durable-promise-watcher-final',
    { kvStore: finalClonedStore, nextPromiseImportNumber: lastPImport + 1 },
  ));
  vatLogs = v.log;
  vatLogs.length = 0;
  await dispatchMessage('createLocalPromise', 'final', S);
  await dispatchMessage('watchPromise', 'final');
  await dispatchMessage('getWatchResolution', 'final');
  t.deepEqual(getDispatchLogs(), [
    fulfillmentMessage(`p-${nextPImport()}`, 'created local promise: final'),
    subscribeMessage(`p+${nextPExport()}`),
    fulfillmentMessage(`p-${nextPImport()}`, 'watched promise: final'),
    fulfillmentMessage(`p+${lastPExport}`, S),
    fulfillmentMessage(`p-${nextPImport()}`, {
      status: 'fulfilled',
      value: S,
    }),
  ]);
});

test('past-incarnation watched promises from original-format kvStore', async t => {
  const kvStore = new Map(kvStoreDataV1);
  for (const key of [
    ...kvStoreDataV1KeysToDelete,
    ...kvStoreDataV1KeysToKeep,
  ]) {
    t.true(kvStore.has(key), `key must be initially present: ${key}`);
  }

  let { v, dispatch, dispatchMessage } = await setupTestLiveslots(
    t,
    buildPromiseWatcherRootObject,
    'durable-promise-watcher',
    { kvStore, nextPromiseImportNumber: 100 },
  );
  let vatLogs = v.log;
  for (const vpid of kvStoreDataV1VpidsToReject) {
    await dispatch(makeReject(vpid, kser('tomorrow never came')));
  }
  for (const key of kvStoreDataV1KeysToDelete) {
    t.false(kvStore.has(key), `key should be removed: ${key}`);
  }
  for (const key of kvStoreDataV1KeysToKeep) {
    t.true(kvStore.has(key), `key should remain: ${key}`);
  }

  // Verify that the data is still in loadable condition.
  const finalClonedStore = new Map(kvStore);
  // eslint-disable-next-line no-unused-vars
  ({ v, dispatch, dispatchMessage } = await setupTestLiveslots(
    t,
    buildPromiseWatcherRootObject,
    'durable-promise-watcher-final',
    { kvStore: finalClonedStore, nextPromiseImportNumber: 200 },
  ));
  vatLogs = v.log;
  vatLogs.length = 0;
  for (const vpid of kvStoreDataV1VpidsToKeep) {
    await dispatch(makeResolve(vpid, kser('finally')));
  }
  for (const key of kvStoreDataV1KeysToKeep) {
    t.false(finalClonedStore.has(key), `key should be removed: ${key}`);
  }
});
