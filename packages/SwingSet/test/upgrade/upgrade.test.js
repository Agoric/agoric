// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../../tools/prepare-test-env-ava.js';

import { assert } from '@endo/errors';
import bundleSource from '@endo/bundle-source';
import { objectMap } from '@agoric/internal';
import { kser, kunser, krefOf } from '@agoric/kmarshal';
import { initSwingStore } from '@agoric/swing-store';
import { parseReachableAndVatSlot } from '../../src/kernel/state/reachable.js';
import { parseVatSlot } from '../../src/lib/parseVatSlots.js';
import {
  buildKernelBundles,
  initializeSwingset,
  makeSwingsetController,
} from '../../src/index.js';
import { bundleOpts, restartVatAdminVat } from '../util.js';

const bfile = name => new URL(name, import.meta.url).pathname;

test.before(async t => {
  const kernelBundles = await buildKernelBundles();
  /** @type {any} */ (t.context).data = { kernelBundles };
});

// eslint-disable-next-line no-unused-vars
const dumpState = (debug, vatID) => {
  const s = debug.dump().kvEntries;
  const keys = Array.from(Object.keys(s)).sort();
  for (const k of keys) {
    if (k.startsWith(`${vatID}.vs.`)) {
      console.log(k, s[k]);
    }
  }
};

/**
 * @param {string} bootstrapVatPath
 * @param {KernelOptions & {
 *  staticVatPaths?: Record<string, string>,
 *  bundlePaths?: Record<string, string>,
 * }} [options]
 * @returns {SwingSetConfig}
 */
const makeConfigFromPaths = (bootstrapVatPath, options = {}) => {
  const { staticVatPaths = {}, bundlePaths = {}, ...kernelOptions } = options;
  /**
   * @param {Record<string, string>} paths
   * @returns {Record<string, {sourceSpec: string}>}
   */
  const specsFromPaths = paths => {
    const entries = Object.entries(paths).map(([name, path]) => [
      name,
      { sourceSpec: bfile(path) },
    ]);
    return Object.fromEntries(entries);
  };
  assert(!Object.hasOwn(staticVatPaths, 'bootstrap'));
  const vats = specsFromPaths({
    bootstrap: bootstrapVatPath,
    ...staticVatPaths,
  });
  const bundles = specsFromPaths(bundlePaths);
  return {
    includeDevDependencies: true, // for vat-data
    ...kernelOptions,
    bootstrap: 'bootstrap',
    vats,
    bundles,
  };
};

/**
 * @param {import('ava').ExecutionContext} t
 * @param {object} bundleData
 * @param {SwingSetConfig} config
 * @param {object} [options]
 * @param {object} [options.extraRuntimeOpts]
 * Refcount incrementing should be manual,
 * see https://github.com/Agoric/agoric-sdk/issues/7213
 * @returns {Promise<{
 *   controller: EReturn<typeof makeSwingsetController>,
 *   kvStore: KVStore,
 *   messageToVat: (vatName: string, method: string, ...args: unknown[]) => Promise<unknown>,
 *   messageToVatAndRetain: (vatName: string, method: string, ...args: unknown[]) => Promise<unknown>,
 *   messageToObject: (target: unknown, method: string, ...args: unknown[]) => Promise<unknown>,
 *   messageToObjectAndRetain: (target: unknown, method: string, ...args: unknown[]) => Promise<unknown>,
 * }>}
 */
const initKernelForTest = async (t, bundleData, config, options = {}) => {
  const { kernelStorage } = initSwingStore();
  const { kvStore } = kernelStorage;
  const { extraRuntimeOpts, holdObjectRefs = true } = options;
  const { initOpts, runtimeOpts } = bundleOpts(bundleData, extraRuntimeOpts);
  await initializeSwingset(config, [], kernelStorage, initOpts);
  const c = await makeSwingsetController(kernelStorage, {}, runtimeOpts);
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');
  await c.run();
  const awaitRun = async (kpid, kpResolutionOptions) => {
    await c.run();
    const status = c.kpStatus(kpid);
    if (status === 'fulfilled') {
      const result = c.kpResolution(kpid, kpResolutionOptions);
      return kunser(result);
    }
    assert(status === 'rejected');
    const err = c.kpResolution(kpid, kpResolutionOptions);
    throw kunser(err);
  };
  const makeRun = kpResolutionOptions => {
    const messageToVat = async (vatName, method, ...args) => {
      const kpid = c.queueToVatRoot(vatName, method, args);
      return awaitRun(kpid, kpResolutionOptions);
    };
    const messageToObject = async (target, method, ...args) => {
      const kpid = c.queueToVatObject(target, method, args);
      return awaitRun(kpid, kpResolutionOptions);
    };
    return [messageToVat, messageToObject];
  };
  const [messageToVat, messageToObject] = makeRun({ incref: holdObjectRefs });
  const [messageToVatAndRetain, messageToObjectAndRetain] = makeRun({
    incref: true,
  });
  return {
    controller: c,
    kvStore,
    messageToVat,
    messageToVatAndRetain,
    messageToObject,
    messageToObjectAndRetain,
  };
};

// Gratuitous change so I can create an otherwise identical PR

const testNullUpgrade = async (t, defaultManagerType) => {
  const config = makeConfigFromPaths('../../tools/bootstrap-relay.js', {
    defaultManagerType,
    defaultReapInterval: 'never',
    bundlePaths: {
      exporter: '../vat-exporter.js',
    },
  });
  const { messageToVat, messageToObject } = await initKernelForTest(
    t,
    t.context.data,
    config,
  );

  const exporterRoot = await messageToVat('bootstrap', 'createVat', {
    name: 'exporter',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v1' },
  });
  t.is(await messageToObject(exporterRoot, 'getVersion'), 'v1');
  const counter = await messageToObject(exporterRoot, 'getDurableCounter');
  const val1 = await messageToObject(counter, 'increment');
  t.is(val1, 1);
  await messageToVat('bootstrap', 'upgradeVat', {
    name: 'exporter',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v2' },
  });
  t.is(await messageToObject(exporterRoot, 'getVersion'), 'v2');
  const val2 = await messageToObject(counter, 'increment');
  t.is(val2, 2);
};

test('null upgrade - local', async t => {
  return testNullUpgrade(t, 'local');
});

test('null upgrade - xsnap', async t => {
  return testNullUpgrade(t, 'xs-worker');
});

test('kernel sends bringOutYourDead for vat upgrade', async t => {
  const config = makeConfigFromPaths('../../tools/bootstrap-relay.js', {
    defaultReapInterval: 'never',
    snapshotInitial: 10000, // effectively disabled
    snapshotInterval: 10000, // effectively disabled
    staticVatPaths: {
      staticVat: '../vat-exporter.js',
    },
    bundlePaths: {
      exporter: '../vat-exporter.js',
    },
  });
  let isSlogging = false;
  const deliveries = [];
  const deliverySpy = slogEntry => {
    if (isSlogging && slogEntry.type === 'deliver') {
      deliveries.push(slogEntry);
    }
  };
  const { controller, kvStore, messageToVat, messageToObject } =
    await initKernelForTest(t, t.context.data, config, {
      extraRuntimeOpts: { slogSender: deliverySpy },
    });

  // ava t.like does not support array shapes, but object analogs are fine
  const arrayShape = sparseArr => Object.fromEntries(Object.entries(sparseArr));
  const capDataShape = obj => {
    const capData = kser(obj);
    const { body, ..._slotsEtc } = capData;
    return { body };
  };
  // Kernel deliveries are [type, ...args] arrays.
  const deliveryShape = (deliveryNum, kdShape) => {
    return { deliveryNum, kd: arrayShape(kdShape) };
  };
  const messageDeliveryShape = (deliveryNum, method, args, resultKpid) => {
    const methargs = capDataShape([method, args]);
    const messageShape = resultKpid
      ? { methargs, result: resultKpid }
      : { methargs };
    // sparse array to ignore target kref
    // eslint-disable-next-line no-sparse-arrays
    return deliveryShape(deliveryNum, ['message', , messageShape]);
  };

  // Null-upgrade the static vat with some messages before and after
  // to catch any unexpected BOYD.
  const staticVatID = controller.vatNameToID('staticVat');
  const bundle = await bundleSource(config.vats.staticVat.sourceSpec);
  const bundleID = await controller.validateAndInstallBundle(bundle);
  isSlogging = true;
  const staticVatV1 = await messageToVat('staticVat', 'getVersion');
  t.is(staticVatV1, undefined);
  const staticVatUpgradeKpid = controller.upgradeStaticVat(
    'staticVat',
    false,
    bundleID,
    {
      vatParameters: { version: 'v2' },
    },
  );
  await controller.run();
  t.is(controller.kpStatus(staticVatUpgradeKpid), 'fulfilled');
  const staticVatV2 = await messageToVat('staticVat', 'getVersion');
  t.is(staticVatV2, 'v2');
  isSlogging = false;

  const staticVatDeliveries = deliveries.filter(
    slogEntry => slogEntry.vatID === staticVatID,
  );
  const expectedDeliveries = [
    // 0: initialize-worker
    // 1: startVat
    messageDeliveryShape(2n, 'getVersion', []),
    deliveryShape(3n, ['bringOutYourDead']),
    // 4: shutdown-worker
    // 5: initialize-worker
    deliveryShape(6n, ['startVat']),
    messageDeliveryShape(7n, 'getVersion', []),
  ];
  t.like(staticVatDeliveries, arrayShape(expectedDeliveries));
  t.is(staticVatDeliveries.length, expectedDeliveries.length);

  // Repeat the process with a dynamic vat.
  const dynamicVat = await messageToVat('bootstrap', 'createVat', {
    name: 'dynamicVat',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v1' },
  });
  const dynamicVatKref = krefOf(dynamicVat);
  const dynamicVatID = kvStore.get(`${dynamicVatKref}.owner`); // probably 'v7'
  isSlogging = true;
  const dynamicVatV1 = await messageToObject(dynamicVat, 'getVersion');
  t.is(dynamicVatV1, 'v1');
  await messageToVat('bootstrap', 'upgradeVat', {
    name: 'dynamicVat',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v2' },
  });
  const dynamicVatV2 = await messageToObject(dynamicVat, 'getVersion');
  t.is(dynamicVatV2, 'v2');
  isSlogging = false;

  const dynamicVatDeliveries = deliveries.filter(
    slogEntry => slogEntry.vatID === dynamicVatID,
  );
  t.like(dynamicVatDeliveries, arrayShape(expectedDeliveries));
  t.is(dynamicVatDeliveries.length, expectedDeliveries.length);
});

/**
 * @param {import('ava').ExecutionContext} t
 * @param {ManagerType} defaultManagerType
 * @param {object} [options]
 * @param {boolean} [options.restartVatAdmin]
 * @param {boolean} [options.suppressGC]
 */
const testUpgrade = async (t, defaultManagerType, options = {}) => {
  const { restartVatAdmin: doVatAdminRestart = false, suppressGC = false } =
    options;
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType,
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  /** @type {object} */
  const { data: bundleData } = t.context;
  if (suppressGC) {
    config.defaultReapInterval = 'never';

    // @ts-expect-error reapInterval is valid
    config.vats.bootstrap.reapInterval = 1;
  }
  const {
    controller: c,
    kvStore,
    messageToVat,
    messageToVatAndRetain,
  } = await initKernelForTest(t, bundleData, config, {
    holdObjectRefs: false,
  });

  /**
   * @param {object} presence
   * @param {string} [iface]
   * @returns {string} kref
   */
  const verifyPresence = (presence, iface = undefined) => {
    const kref = krefOf(presence);
    t.truthy(kref);
    if (iface) {
      t.is(presence.iface(), iface);
    }
    return kref;
  };

  const marker = await messageToVatAndRetain('bootstrap', 'getMarker');
  const markerKref = verifyPresence(marker, 'marker'); // probably 'ko26'

  // fetch all the "import sensors": exported by bootstrap, imported by
  // the upgraded vat. We'll determine their krefs and later query the
  // upgraded vat to see if it's still importing them or not
  const sensors = /** @type {[unknown, ...object]} */ (
    await messageToVatAndRetain('bootstrap', 'getImportSensors')
  );
  const sensorKrefs = [
    'skip0',
    ...sensors.slice(1).map(obj => verifyPresence(obj)),
  ];

  if (doVatAdminRestart) {
    await restartVatAdminVat(c);
  }

  // create initial version
  /** @type {any} */
  const v1result = await messageToVat('bootstrap', 'buildV1');
  t.like(v1result, {
    version: 'v1',
    youAre: 'v1',
    data: ['some', 'data'],
  });
  const v1MarkerKref = verifyPresence(v1result.marker, 'marker');
  t.is(v1MarkerKref, markerKref);
  // grab the promises that should be rejected
  const v1p1Kref = verifyPresence(v1result.p1);
  const v1p2Kref = verifyPresence(v1result.p2);
  const v1p1wKref = verifyPresence(v1result.p1w);
  const v1p2wKref = verifyPresence(v1result.p2w);
  const v1p3Kref = verifyPresence(v1result.p3);
  c.kpRegisterInterest(v1p1wKref);
  c.kpRegisterInterest(v1p2wKref);
  // grab krefs for the exported durable/virtual objects to check their abandonment
  const retainedKrefs = objectMap(v1result.retain, obj => verifyPresence(obj));
  const retainedNames = 'dur1 vir2 vir5 vir7 vc1 vc3 dc4 rem1 rem2 rem3'.split(
    ' ',
  );
  t.deepEqual(Object.keys(retainedKrefs).sort(), retainedNames.sort());
  const { dur1: dur1Kref, vir2: vir2Kref } = retainedKrefs;

  // use the kvStore to support assertions about exported durable/virtual vrefs
  const vatID = kvStore.get(`${dur1Kref}.owner`); // probably 'v6'
  // dumpState(debug, vatID);
  const getCListEntry = kref => kvStore.get(`${vatID}.c.${kref}`);
  const getVref = kref => {
    const entry = getCListEntry(kref);
    return parseReachableAndVatSlot(entry).vatSlot;
  };
  const vomHas = vref => kvStore.has(`${vatID}.vs.vom.${vref}`);
  const dur1Vref = getVref(dur1Kref);
  t.is(parseVatSlot(dur1Vref).subid, 1n);
  const durPrefix = dur1Vref.slice(0, -1); // everything before the trailing '1'
  const durVref = i => `${durPrefix}${i}`;
  const vir2Vref = getVref(vir2Kref);
  t.is(parseVatSlot(vir2Vref).subid, 2n);
  const virPrefix = vir2Vref.slice(0, -1); // everything before the trailing '2'
  const virVref = i => `${virPrefix}${i}`;
  const collectableVrefs = [virVref(1), durVref(2), virVref(39), durVref(39)];
  /**
   * @param {string} when
   * @param {object} expectations
   * @param {boolean} expectations.afterGC
   * @param {string[]} [expectations.stillOwned]
   */
  const verifyObjectTracking = (when, expectations) => {
    const { afterGC, stillOwned = retainedNames } = expectations;
    // imported object reachability
    for (let i = 1; i < sensorKrefs.length; i += 1) {
      const entry = getCListEntry(sensorKrefs[i]);
      if (i === 39 && afterGC) {
        // import-39 is ignored
        t.is(entry, undefined, `import-39 is retired ${when}`);
        continue;
      }
      const { isReachable } = parseReachableAndVatSlot(entry);
      if (i === 32) {
        // import-32 is a WeakMap key that is initialized in v1 and
        // probed in v2 by bootstrap-scripted-upgrade.js "upgradeV2";
        // it should be reachable iff GC is suppressed
        t.is(isReachable, suppressGC, `import-32 reachability ${when}`);
      } else {
        // reachability of all other imports should be retained
        // by object references
        t.is(isReachable, true, `import-${i} reachability ${when}`);
      }
    }
    // exported object ownership
    for (const name of retainedNames) {
      const owner = kvStore.get(`${retainedKrefs[name]}.owner`);
      const expectedOwner = stillOwned.includes(name) ? vatID : undefined;
      t.is(owner, expectedOwner, `${name} ownership ${when}`);
    }
    // liveslots vom tracking
    t.true(vomHas(durVref(1)));
    t.true(vomHas(virVref(2)));
    for (const vref of collectableVrefs) {
      const present = vomHas(vref);
      t.is(present, !afterGC, `${vref} must be collected by GC ${when}`);
    }
  };

  if (doVatAdminRestart) {
    await restartVatAdminVat(c);
  }
  verifyObjectTracking('before upgrade', { afterGC: !suppressGC });

  // now perform the upgrade
  /** @type {any} */
  const v2result = await messageToVat('bootstrap', 'upgradeV2');
  // dumpState(debug, vatID);
  t.like(v2result, {
    version: 'v2',
    youAre: 'v2',
    data: ['some', 'data'],
    remoerr: Error('vat terminated'),
  });
  t.deepEqual(v2result.upgradeResult, { incarnationNumber: 1 });
  const v2MarkerKref = verifyPresence(v2result.marker, 'marker');
  t.deepEqual(v2MarkerKref, v1MarkerKref);

  // newDur (the first Durandal instance created in vat-ulrik-2)
  // should get a new vref, because the per-Kind instance counter
  // should persist and pick up where it left off. If that was broken,
  // newDur would have the same vref as dur1 (the first Durandal
  // instance created in vat-ulrik-1). And since it's durable, the
  // c-list entry will still exist, so we'll see the same kref as
  // before.
  const newDurKref = verifyPresence(v2result.newDur);
  t.not(newDurKref, dur1Kref);

  // The old version's non-durable promises should be rejected. The
  // original kpids will be GCed. Bug #9039 failed to GC them.
  t.is(kvStore.get(`${v1p1Kref}.refCount`), undefined);
  t.is(kvStore.get(`${v1p2Kref}.refCount`), undefined);
  t.is(kvStore.get(`${vatID}.c.${v1p1Kref}`), undefined);
  t.is(kvStore.get(`${vatID}.c.${v1p2Kref}`), undefined);
  t.is(kvStore.get(`${v1p1Kref}.state`), undefined);
  t.is(kvStore.get(`${v1p2Kref}.state`), undefined);
  // but vat-bootstrap wraps them (with Promise.all() so we can
  // examine their rejection data.
  t.is(c.kpStatus(v1p1wKref), 'rejected');
  const vatUpgradedError = {
    name: 'vatUpgraded',
    upgradeMessage: 'test upgrade',
    incarnationNumber: 0,
  };
  t.deepEqual(kunser(c.kpResolution(v1p1wKref)), vatUpgradedError);
  t.is(c.kpStatus(v1p2wKref), 'rejected');
  t.deepEqual(kunser(c.kpResolution(v1p2wKref)), vatUpgradedError);

  // The local-promise watcher should have fired. If vat-upgrade is
  // too aggressive about removing c-list entries (i.e. it doesn't
  // check for self-subscription first), the kernel-provoked
  // dispatch.notify won't be delivered, and the new incarnation won't
  // fire the durable watcher.
  t.deepEqual(v2result.watcherResult, ['reject', vatUpgradedError]);
  // and the promise it was watching should be GCed
  t.is(kvStore.get(`${v1p3Kref}.refCount`), undefined);

  // verify export abandonment/garbage collection/etc.
  // This used to be MUCH more extensive, but GC was cut to the bone
  // in commits like 91480dee8e48ae26c39c420febf73b93deba6ea5
  // basically reverting 1cfbeaa3c925d0f8502edfb313ecb12a1cab5eac
  // (see also #5342 and #6650, and #7244 for tests to restore).
  // It can be restored once we add back correct sophisticated logic
  // by e.g. having liveslots sweep the database when restoring a vat.
  verifyObjectTracking('after upgrade', {
    afterGC: true,
    stillOwned: ['dur1', 'dc4'],
  });
};

// local workers (under V8 and AVA) are notoriously flaky for GC
// behavior, even with test.serial, so run these tests only under XS

test('vat upgrade - xsnap', async t => {
  return testUpgrade(t, 'xs-worker', { restartVatAdmin: false });
});
test('vat upgrade - xsnap with VA restarts', async t => {
  return testUpgrade(t, 'xs-worker', { restartVatAdmin: true });
});
test('vat upgrade - xsnap without automatic GC', async t => {
  return testUpgrade(t, 'xs-worker', { suppressGC: true });
});

test('vat upgrade - omit vatParameters', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  // create initial version
  const result = await messageToVat(
    'bootstrap',
    'doUpgradeWithoutVatParameters',
  );
  t.deepEqual(result, [undefined, undefined]);
});

test('non-durable exports are abandoned by upgrade of liveslots vat', async t => {
  const config = makeConfigFromPaths('../../tools/bootstrap-relay.js', {
    defaultManagerType: 'xs-worker',
    bundlePaths: {
      exporter: '../vat-exporter.js',
    },
  });
  const { controller, messageToVat, messageToObject } = await initKernelForTest(
    t,
    t.context.data,
    config,
  );

  const exporterRoot = await messageToVat('bootstrap', 'createVat', {
    name: 'exporter',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v1' },
  });
  t.is(await messageToObject(exporterRoot, 'getVersion'), 'v1');

  // Export some objects.
  const counterGetters = {
    ephCounter: 'getEphemeralCounter',
    virCounter: 'getVirtualCounter',
    durCounter: 'getDurableCounter',
  };
  /** @type {Record<string, { presence: unknown, kref: string }>} */
  const counters = {};
  const runIncrement = presence => messageToObject(presence, 'increment');
  for (const [name, methodName] of Object.entries(counterGetters)) {
    const counter = await messageToObject(exporterRoot, methodName);
    const val = await runIncrement(counter);
    t.is(val, 1, `initial increment of ${name}`);
    const counterRef = await messageToVat(
      'bootstrap',
      'awaitVatObject',
      counter,
    );
    const kref = krefOf(counterRef);
    counters[name] = { presence: counter, kref };
  }

  // Check kernel state for `objects` rows like [kref, vatID, ...] and
  // `kernelTable` rows like [kref, vatID, vref].
  const { kernelTable: kt1, objects: rc1 } = controller.dump();
  const findRowByKref = (rows, searchKref) =>
    rows.find(([kref]) => kref === searchKref);
  const findExportByKref = (rows, searchKref) =>
    rows.find(
      ([kref, _vatID, vref]) => kref === searchKref && vref.startsWith('o+'),
    );
  const ephCounterRC1 = findRowByKref(rc1, counters.ephCounter.kref);
  const virCounterRC1 = findRowByKref(rc1, counters.virCounter.kref);
  const durCounterRC1 = findRowByKref(rc1, counters.durCounter.kref);
  const ephCounterExport1 = findExportByKref(kt1, counters.ephCounter.kref);
  const virCounterExport1 = findExportByKref(kt1, counters.virCounter.kref);
  const durCounterExport1 = findExportByKref(kt1, counters.durCounter.kref);
  t.truthy(ephCounterRC1?.[1]);
  t.truthy(virCounterRC1?.[1]);
  t.truthy(durCounterRC1?.[1]);
  t.truthy(ephCounterExport1);
  t.truthy(virCounterExport1);
  t.truthy(durCounterExport1);

  // Upgrade and then check new kernel state for `objects` rows like
  // [kref, vatID | null, ...] and `kernelTable` rows like [kref, vatID, vref].
  await messageToVat('bootstrap', 'upgradeVat', {
    name: 'exporter',
    bundleCapName: 'exporter',
    vatParameters: { version: 'v2' },
  });
  const { kernelTable: kt2, objects: rc2 } = controller.dump();
  const ephCounterRC2 = findRowByKref(rc2, counters.ephCounter.kref);
  const virCounterRC2 = findRowByKref(rc2, counters.virCounter.kref);
  const durCounterRC2 = findRowByKref(rc2, counters.durCounter.kref);
  const ephCounterExport2 = findExportByKref(kt2, counters.ephCounter.kref);
  const virCounterExport2 = findExportByKref(kt2, counters.virCounter.kref);
  const durCounterExport2 = findExportByKref(kt2, counters.durCounter.kref);
  t.is(ephCounterRC2?.[1], null, 'ephemeral counter must be abandoned');
  t.is(virCounterRC2?.[1], null, 'merely virtual counter must be abandoned');
  t.is(
    durCounterRC2?.[1],
    durCounterRC1?.[1],
    'durable counter must not be abandoned',
  );
  t.is(
    ephCounterExport2,
    undefined,
    'ephemeral counter export must be dropped',
  );
  t.is(
    virCounterExport2,
    undefined,
    'merely virtual counter export must be dropped',
  );
  t.deepEqual(
    durCounterExport2,
    durCounterExport1,
    'durable counter export must be preserved',
  );

  // Verify post-upgrade behavior.
  t.is(await messageToObject(exporterRoot, 'getVersion'), 'v2');
  await t.throwsAsync(
    () => runIncrement(counters.ephCounter.presence),
    { message: 'vat terminated' },
    'message to ephemeral object from previous incarnation must go splat',
  );
  await t.throwsAsync(
    () => runIncrement(counters.virCounter.presence),
    { message: 'vat terminated' },
    'message to non-durable virtual object from previous incarnation must go splat',
  );
  t.is(
    await runIncrement(counters.durCounter.presence),
    2,
    'message to durable object from previous incarnation must work with preserved state',
  );
});

test('non-durable exports are abandoned by upgrade of non-liveslots vat', async t => {
  const config = makeConfigFromPaths('../../tools/bootstrap-relay.js', {
    defaultManagerType: 'xs-worker',
  });
  config.vats.exporter = {
    sourceSpec: bfile('../vat-direct.js'),
    parameters: { vatName: 'exporter' },
    creationOptions: { enableSetup: true },
  };
  config.vats.observer = {
    sourceSpec: bfile('../vat-direct.js'),
    parameters: { vatName: 'observer' },
    creationOptions: { enableSetup: true },
  };
  const { controller, kvStore, messageToVat } = await initKernelForTest(
    t,
    t.context.data,
    config,
    { holdObjectRefs: false },
  );

  const exporterVatID = controller.vatNameToID('exporter');

  // Export two objects from exporter to observer,
  // one to be held strongly and the other weakly.
  const observer = await messageToVat('bootstrap', 'getVatRoot', 'observer');
  const strongObj = await messageToVat('exporter', 'exportFakeObject');
  await messageToVat('exporter', 'syscall-send', observer, 'acceptImports', [
    strongObj,
  ]);
  const weakObj = await messageToVat('exporter', 'exportFakeObject');
  await messageToVat(
    'exporter',
    'syscall-send',
    observer,
    'acceptWeakImports',
    [weakObj],
  );

  // Verify kernel tracking of the objects.
  const strongKref = krefOf(strongObj);
  t.is(kvStore.get(`${strongKref}.owner`), exporterVatID);
  t.is(
    kvStore.get(`${strongKref}.refCount`),
    '1,1',
    'strong observation must increment both reachable and recognizable ref counts',
  );
  const weakKref = krefOf(weakObj);
  t.is(kvStore.get(`${weakKref}.owner`), exporterVatID);
  t.is(
    kvStore.get(`${weakKref}.refCount`),
    '0,1',
    'weak observation must increment recognizable but not reachable ref counts',
  );

  // Null-upgrade exporter and verify updated kernel tracking.
  const bundle = await bundleSource(config.vats.exporter.sourceSpec);
  const bundleID = await controller.validateAndInstallBundle(bundle);
  const upgradeKpid = controller.upgradeStaticVat('exporter', false, bundleID, {
    vatParameters: config.vats.exporter.parameters,
  });
  await controller.run();
  t.is(controller.kpStatus(upgradeKpid), 'fulfilled');
  t.is(kvStore.get(`${strongKref}.owner`), undefined);
  t.is(kvStore.get(`${weakKref}.owner`), undefined);
  t.is(
    kvStore.get(`${strongKref}.refCount`),
    '1,1',
    'strong observation of abandoned object retains ref counts',
  );
  t.is(
    kvStore.get(`${weakKref}.refCount`),
    undefined,
    'unreachable abandoned object is forgotten',
  );
});

// No longer valid as of removing stopVat per #6650
test.failing('failed upgrade - relaxed durable rules', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    relaxDurabilityRules: true,
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  // create initial version
  await messageToVat('bootstrap', 'buildV1');

  // upgrade should fail
  await t.throwsAsync(messageToVat('bootstrap', 'upgradeV2'), {
    instanceOf: Error,
    message: /vat-upgrade failure/,
  });
});

test('failed upgrade - lost kind', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  // create initial version
  const v1result = await messageToVat('bootstrap', 'buildV1WithLostKind');
  t.deepEqual(v1result, ['ping 1']);

  // upgrade should fail, get rewound
  console.log(`note: expect a 'defineDurableKind not called' error below`);
  const events = await messageToVat('bootstrap', 'upgradeV2WhichLosesKind');
  t.is(events[0], 'ping 2');

  // The v2 vat starts with a 'ping from v2' (which will be unwound).
  // Then v2 finishes startVat without reattaching all kinds, so v2 is
  // unwound.  Then the `E(ulrikAdmin).upgrade()` promise rejects,
  // pushing the error onto 'events'

  const e = events[1];
  t.truthy(e instanceof Error);
  t.regex(e.message, /vat-upgrade failure/);

  // then upgradeV2WhichLosesKind sends pingback() to the vat, which should
  // arrive on the newly-restored v1, and push 'ping 3' onto events

  t.is(events[2], 'ping 3');

  // if the failed upgrade didn't put v1 back, then the pingback()
  // will be delivered to v2, and would push 'ping 21'

  // if v1 wasn't restored properly, then the pingback() might push
  // 'ping 2' again instead of 'ping 3'

  // TODO: who should see the details of what v2 did wrong? calling
  // vat? only the console?
});

// TODO: test stopVat failure

test('failed upgrade - explode', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  // create initial version
  const v1result = await messageToVat('bootstrap', 'buildV1WithPing');
  t.deepEqual(v1result, ['hello from v1', 'ping 1']);

  // upgrade should fail, error returned in array
  const events = await messageToVat('bootstrap', 'upgradeV2WhichExplodes');
  const e = events[0];
  t.truthy(e instanceof Error);
  t.regex(e.message, /vat-upgrade failure/);
  // bootstrap sends pingback() to the vat post-upgrade, which sends
  // back an event with the current counter value. If we restored
  // ulrik-1 correctly, we'll get '2'. If we're still talking to
  // ulrik-2, we'd see '21'. If we somehow rewound ulrik-1 to the
  // beginning, we'd see '1'.
  t.is(events[1], true); // e instanceof Error
  t.is(events[2], true); // /vat-upgrade failure/.test(e.message)
  t.is(events[3], 'ping 2');

  // TODO: who should see the details of what v2 did wrong? calling
  // vat? only the console?
});

async function testKindMode(t, v1mode, v2mode, complaint) {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  // create initial version
  await messageToVat('bootstrap', 'buildV1KindModeTest', v1mode);

  // upgrade
  const resultP = messageToVat('bootstrap', 'upgradeV2KindModeTest', v2mode);
  if (!complaint) {
    await resultP;
    t.pass();
    return;
  }
  console.log(`note: expect a '${complaint}' error below`);
  // TODO: who should see the details of what v2 did wrong? calling
  // vat? only the console?
  await t.throwsAsync(resultP, {
    instanceOf: Error,
    message: /vat-upgrade failure/,
  });
}

test('facet kind redefinition - succeed on single-single', async t => {
  await testKindMode(t, 'single', 'single', false);
});

test('facet kind redefinition - succeed on exact facet match', async t => {
  await testKindMode(t, 'multi', 'multi-foo-bar', false);
});

test('facet kind redefinition - succeed on facet order mismatch', async t => {
  await testKindMode(t, 'multi', 'multi-bar-foo', false);
});

test('facet kind redefinition - succeed on new facet (early1)', async t => {
  await testKindMode(t, 'multi', 'multi-foo-bar-arf', false);
});

test('facet kind redefinition - succeed on new facet (early2)', async t => {
  await testKindMode(t, 'multi', 'multi-arf-foo-bar', false);
});

test('facet kind redefinition - succeed on new facet (late)', async t => {
  await testKindMode(t, 'multi', 'multi-foo-bar-baz', false);
});

const err1 = `durable kind " kind " facets (..) is missing .. from original definition ..`;

test('facet kind redefinition - fail on missing facets', async t => {
  await testKindMode(t, 'multi', 'multi-foo', err1);
});

test('facet kind redefinition - fail on single- to multi-facet redefinition', async t => {
  await testKindMode(t, 'single', 'multi-foo', err1);
});

test('facet kind redefinition - fail on multi- to single-facet redefinition', async t => {
  await testKindMode(t, 'multi-foo', 'single', err1);
});

test('failed upgrade - unknown options', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const { messageToVat } = await initKernelForTest(t, t.context.data, config);

  await t.throwsAsync(messageToVat('bootstrap', 'doUpgradeWithBadOption'), {
    instanceOf: Error,
    message: /upgrade\(\) received unknown options: "bad"/,
  });
});

test('failed vatAdmin upgrade - bad replacement code', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
    },
  });
  const { controller: c, messageToVat } = await initKernelForTest(
    t,
    t.context.data,
    config,
  );

  const badVABundle = await bundleSource(
    new URL('./vat-junk.js', import.meta.url).pathname,
  );
  const bundleID = await c.validateAndInstallBundle(badVABundle);
  const kpid = c.upgradeStaticVat('vatAdmin', true, bundleID, {});
  await c.run();
  const vaUpgradeStatus = c.kpStatus(kpid);
  const vaUpgradeResult = kunser(c.kpResolution(kpid));

  t.is(vaUpgradeStatus, 'rejected');
  t.truthy(vaUpgradeResult instanceof Error);
  t.regex(vaUpgradeResult.message, /vat-upgrade failure/);

  // Now try doing something that uses vatAdmin to verify that original vatAdmin is intact.
  const v1result = await messageToVat('bootstrap', 'buildV1');
  // Just a taste to verify that the create went right; other tests check the rest
  t.deepEqual(v1result.data, ['some', 'data']);
});

test('vat upgrade retains vatParameters', async t => {
  const config = makeConfigFromPaths('bootstrap-scripted-upgrade.js', {
    defaultManagerType: 'xs-worker',
    defaultReapInterval: 'never',
    bundlePaths: {
      ulrik1: 'vat-ulrik-1.js',
      ulrik2: 'vat-ulrik-2.js',
    },
  });
  const kft = await initKernelForTest(t, t.context.data, config);
  const { controller: c, kvStore } = kft;

  // create initial version
  const kpid1 = c.queueToVatRoot('bootstrap', 'buildV1WithVatParameters', []);
  await c.run();
  // incref=false to keep it from adding a refcount to the marker
  const params1 = kunser(c.kpResolution(kpid1, { incref: false }));
  // Free kpid1, else it will hold an extra refcount on the
  // marker. The c.kpResolution() decremented the kpid1 refcount to 0,
  // but we need to provoke a call to processRefcounts(), which only
  // happens at end-of-crank
  c.queueToVatRoot('bootstrap', 'nop', []);
  // BOYD to get vat-admin to drop it's copy of the marker
  c.reapAllVats();
  await c.run();

  t.is(params1.number, 1);
  const marker = params1.marker;
  t.deepEqual(params1, { number: 1, marker });
  const kref = marker.getKref();

  // confirm the vatParameters were recorded in kvStore
  const vatID = JSON.parse(kvStore.get('vat.dynamicIDs'))[0];
  const vp1cd = kvStore.get(`${vatID}.vatParameters`);
  const vp1 = kunser(JSON.parse(vp1cd));
  t.is(vp1.number, 1);
  t.is(vp1.marker.getKref(), kref);

  // Ideally, the refcount should be 2: one for the importing vat's
  // c-list, and a second for the retained vNN.vatParameters. But it
  // will also get a refcount from device-vat-admin, as a conduit for
  // the upgrade() call, because devices don't do GC.

  t.is(kvStore.get(`${kref}.refCount`), '3,3');

  // upgrade
  const kpid2 = c.queueToVatRoot('bootstrap', 'upgradeV2WithVatParameters', []);
  await c.run();
  const params2 = kunser(c.kpResolution(kpid2, { incref: false }));
  c.queueToVatRoot('bootstrap', 'nop', []);
  c.reapAllVats();
  await c.run();

  t.is(params2.number, 2);
  t.is(params2.marker.getKref(), kref);
  // kvStore should now hold the new vatParameters
  const vp2cd = kvStore.get(`${vatID}.vatParameters`);
  const vp2 = kunser(JSON.parse(vp2cd));
  t.is(vp2.number, 2);
  t.is(vp2.marker.getKref(), kref);

  // same refcount: the old retained vatParameters should be swapped
  // out
  t.is(kvStore.get(`${kref}.refCount`), '3,3');
});
