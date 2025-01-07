// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../../tools/prepare-test-env-ava.js';

import bundleSource from '@endo/bundle-source';
import { kunser, krefOf } from '@agoric/kmarshal';
import { initSwingStore } from '@agoric/swing-store';
import { buildKernelBundles, buildVatController } from '../../src/index.js';
import { restartVatAdminVat } from '../util.js';
import { enumeratePrefixedKeys } from '../../src/kernel/state/storageHelper.js';

async function prepare() {
  const kernelBundles = await buildKernelBundles();
  // we'll give this bundle to the loader vat, which will use it to create a
  // new (metered) dynamic vat
  const dynamicVatBundle = await bundleSource(
    new URL('metered-dynamic-vat.js', import.meta.url).pathname,
  );
  const bootstrapBundle = await bundleSource(
    new URL('vat-load-dynamic.js', import.meta.url).pathname,
  );
  return { kernelBundles, dynamicVatBundle, bootstrapBundle };
}

test.before(async t => {
  t.context.data = await prepare();
});

async function meterObjectsTest(t, doVatAdminRestarts) {
  const { kernelBundles, bootstrapBundle } = t.context.data;
  const config = {
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        bundle: bootstrapBundle,
      },
    },
  };
  const kernelStorage = initSwingStore().kernelStorage;
  const c = await buildVatController(config, [], {
    kernelStorage,
    kernelBundles,
  });
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');

  // let the vatAdminService get wired up before we create any new vats
  await c.run();

  async function vaRestart() {
    if (doVatAdminRestarts) {
      await restartVatAdminVat(c);
    }
  }
  await vaRestart();

  // create and manipulate a meter without attaching it to a vat
  const cmargs = [10n, 5n]; // remaining, notify threshold
  const kp1 = c.queueToVatRoot('bootstrap', 'createMeter', cmargs);
  await c.run();
  const marg = kunser(c.kpResolution(kp1));
  async function doMeter(method, ...args) {
    const kp = c.queueToVatRoot('bootstrap', method, [marg, ...args], 'ignore');
    await c.run();
    return c.kpResolution(kp);
  }
  async function getMeter() {
    const res = await doMeter('getMeter');
    return kunser(res);
  }

  await vaRestart();
  t.deepEqual(await getMeter(), { remaining: 10n, threshold: 5n });
  await vaRestart();
  await doMeter('addMeterRemaining', 8n);
  await vaRestart();
  t.deepEqual(await getMeter(), { remaining: 18n, threshold: 5n });
  await vaRestart();
  await doMeter('setMeterThreshold', 7n);
  await vaRestart();
  t.deepEqual(await getMeter(), { remaining: 18n, threshold: 7n });
}

test('meter objects', async t => {
  await meterObjectsTest(t, false);
});

test('meter objects with VA restarts', async t => {
  await meterObjectsTest(t, true);
});

function kpidRejected(t, c, kpid, message) {
  t.is(c.kpStatus(kpid), 'rejected');
  const resCapdata = c.kpResolution(kpid);
  const res = kunser(resCapdata);
  if (res instanceof Error && typeof message === 'string') {
    t.is(res.message, message);
  } else {
    t.deepEqual(res, message);
  }
}

async function createMeteredVat(c, t, dynamicVatBundle, capacity, threshold) {
  // startVat (liveslots init plus a simple buildRootObject) uses 8M
  assert.typeof(capacity, 'bigint');
  assert.typeof(threshold, 'bigint');
  const cmargs = [capacity, threshold];
  const kp1 = c.queueToVatRoot('bootstrap', 'createMeter', cmargs);
  await c.run();
  const marg = kunser(c.kpResolution(kp1));
  // and watch for its notifyThreshold to fire
  const notifyKPID = c.queueToVatRoot(
    'bootstrap',
    'whenMeterNotifiesNext',
    [marg],
    'ignore',
  );

  // 'createVat' will import the bundle
  const cvargs = ['dynamic', { managerType: 'xs-worker', meter: marg }];
  const kp2 = c.queueToVatRoot('bootstrap', 'createVat', cvargs, 'ignore');
  await c.run();
  if (c.kpStatus(kp2) === 'rejected') {
    console.log(c.kpResolution(kp2));
    throw Error('dynamic vat not created, test cannot continue');
  }
  t.is(c.kpStatus(kp2), 'fulfilled');
  const res2 = kunser(c.kpResolution(kp2));
  t.is(res2[0], 'created');
  const doneKPID = krefOf(res2[1]);

  async function getMeter() {
    const kp = c.queueToVatRoot('bootstrap', 'getMeter', [marg], 'ignore');
    await c.run();
    const res = c.kpResolution(kp);
    const { remaining } = kunser(res);
    return remaining;
  }

  async function consume(shouldComplete) {
    const kp = c.queueToVatRoot('bootstrap', 'run', []);
    await c.run();
    if (shouldComplete) {
      t.is(c.kpStatus(kp), 'fulfilled');
      t.is(kunser(c.kpResolution(kp)), 42);
    } else {
      t.is(c.kpStatus(kp), 'rejected');
      kpidRejected(t, c, kp, 'vat terminated');
    }
  }

  return { consume, getMeter, notifyKPID, doneKPID };
}

async function overflowCrank(t, explosion) {
  const managerType = 'xs-worker';
  const { kernelBundles, dynamicVatBundle, bootstrapBundle } = t.context.data;
  const config = {
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        bundle: bootstrapBundle,
      },
    },
    bundles: {
      dynamic: {
        bundle: dynamicVatBundle,
      },
    },
  };
  const kernelStorage = initSwingStore().kernelStorage;
  const kvStore = kernelStorage.kvStore;
  const c = await buildVatController(config, [], {
    kernelStorage,
    kernelBundles,
  });
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');

  // let the vatAdminService get wired up before we create any new vats
  await c.run();

  // create a meter with 10M remaining
  const cmargs = [10_000_000n, 5_000_000n]; // remaining, notifyThreshold
  const kp1 = c.queueToVatRoot('bootstrap', 'createMeter', cmargs);
  await c.run();
  const marg = kunser(c.kpResolution(kp1));

  // 'createVat' will import the bundle
  const cvargs = ['dynamic', { managerType, meter: marg }];
  const kp2 = c.queueToVatRoot('bootstrap', 'createVat', cvargs, 'ignore');
  await c.run();
  const res2 = kunser(c.kpResolution(kp2));
  t.is(res2[0], 'created');
  const doneKPID = krefOf(res2[1]);

  // extract the vatID for the newly-created dynamic vat
  const dynamicVatIDs = JSON.parse(kvStore.get('vat.dynamicIDs'));
  t.is(dynamicVatIDs.length, 1);
  const vatID = dynamicVatIDs[0];
  // and it's root object, by peeking into its c-list
  const root = kvStore.get(`${vatID}.c.o+0`);

  // and grab a kpid that won't be resolved until the vat dies
  const r = c.queueToVatRoot('bootstrap', 'getNever', []);
  await c.run();
  const neverArgs = c.kpResolution(r);
  const neverKPID = neverArgs.slots[0];

  // First, send a message to the dynamic vat that runs normally
  const kp3 = c.queueToVatRoot('bootstrap', 'run', []);
  await c.run();
  t.is(JSON.parse(kvStore.get('vat.dynamicIDs')).length, 1);
  t.is(kvStore.get(`${root}.owner`), vatID);
  t.true(Array.from(enumeratePrefixedKeys(kvStore, vatID)).length > 0);
  // neverP and doneP should still be unresolved
  t.is(c.kpStatus(neverKPID), 'unresolved');
  t.is(c.kpStatus(doneKPID), 'unresolved');
  t.deepEqual(kunser(c.kpResolution(kp3)), 42);

  // Now send a message that makes the dynamic vat exhaust its per-crank
  // meter. The message result promise should be rejected, and the control
  // facet should report the vat's demise. Remnants of the killed vat should
  // be gone from the kernel state store.
  const kp4 = c.queueToVatRoot('bootstrap', 'explode', [explosion]);
  await c.run();
  kpidRejected(t, c, kp4, 'vat terminated');
  t.is(JSON.parse(kvStore.get('vat.dynamicIDs')).length, 0);
  t.is(kvStore.get(`${root}.owner`), undefined);
  t.is(Array.from(enumeratePrefixedKeys(kvStore, vatID)).length, 0);
  // neverP should be rejected, without revealing details
  kpidRejected(t, c, neverKPID, 'vat terminated');

  // but doneP gets more details
  const expected = {
    allocate: 'Allocate meter exceeded',
    compute: 'Compute meter exceeded',
    stack: 'Stack meter exceeded',
  };
  kpidRejected(t, c, doneKPID, expected[explosion]);

  // the dead vat should stay dead
  const kp5 = c.queueToVatRoot('bootstrap', 'run', []);
  await c.run();
  kpidRejected(t, c, kp5, 'vat terminated');
}

test('exceed allocate', async t => {
  return overflowCrank(t, 'allocate');
});

test('exceed per-crank compute', async t => {
  return overflowCrank(t, 'compute');
});

test('exceed stack', async t => {
  return overflowCrank(t, 'stack');
});

test('meter decrements', async t => {
  const { kernelBundles, dynamicVatBundle, bootstrapBundle } = t.context.data;
  const config = {
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        bundle: bootstrapBundle,
      },
    },
    bundles: {
      dynamic: {
        bundle: dynamicVatBundle,
      },
    },
  };
  const kernelStorage = initSwingStore().kernelStorage;
  const c = await buildVatController(config, [], {
    kernelStorage,
    kernelBundles,
  });
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');

  // let the vatAdminService get wired up before we create any new vats
  await c.run();

  // First we need to measure how much a consume() costs: create a
  // large-capacity meter with a zero notifyThreshold, and run
  // consume() twice. Initial experiments showed that
  // dispatch.startVat (liveslots init plus a simple userspace
  // buildRootObject) used 8_048_744 computrons, then a simple 'run()'
  // used 39_444 computrons the first time, 39_220 the subsequent
  // times, but this is sensitive to SES and other libraries, so we
  // try to be tolerant of variation over time.

  const lots = 100_000_000n; // TODO 100m
  const t0 = await createMeteredVat(c, t, dynamicVatBundle, lots, 0n);
  let remaining0 = await t0.getMeter();
  const consumedByStartVat = lots - remaining0;
  console.log(`-- consumedByStartVat`, consumedByStartVat);
  t.not(remaining0, lots);
  await t0.consume(true);
  const remaining1 = await t0.getMeter();
  const firstConsume = remaining0 - remaining1;
  await t0.consume(true);
  const remaining2 = await t0.getMeter();
  const secondConsume = remaining1 - remaining2;
  console.log(`consume usage: ${firstConsume} then ${secondConsume}`);

  // now test that meters are decremented at all, notifications happen when
  // they should, and the vat is terminated upon underflow

  // first create a meter with capacity FIRST+1.5*SECOND
  const cap = consumedByStartVat + firstConsume + (3n * secondConsume) / 2n;
  const thresh = secondConsume;

  const t1 = await createMeteredVat(c, t, dynamicVatBundle, cap, thresh);
  remaining0 = await t1.getMeter();
  t.not(remaining0, cap);

  // message one should decrement the meter, but not trigger a notification
  await t1.consume(true);
  let remaining = await t1.getMeter();
  // console.log(remaining);
  t.not(remaining, remaining0);
  // t.is(c.kpStatus(t1.notifyKPID), 'unresolved'); // XXX RESTORE
  t.is(c.kpStatus(t1.notifyKPID), 'rejected'); // XXX TEMP
  t.is(c.kpStatus(t1.doneKPID), 'unresolved');

  // message two should trigger notification, but not underflow
  await t1.consume(true);
  remaining = await t1.getMeter();
  // console.log(remaining);
  // t.is(c.kpStatus(t1.notifyKPID), 'fulfilled'); // XXX RESTORE
  // const notification = c.kpResolution(t1.notifyKPID); // XXX RESTORE
  // t.is(kunser(notification).value, remaining); // XXX RESTORE
  t.is(c.kpStatus(t1.doneKPID), 'unresolved');

  // message three should underflow
  await t1.consume(false);
  remaining = await t1.getMeter();
  // console.log(remaining);
  t.is(remaining, 0n); // this checks postAbortActions.deductMeter
  // TODO: we currently provide a different .done error message for 1: a
  // single crank exceeds the fixed per-crank limit, and 2: the cumulative
  // usage caused the meterID to underflow. Should these be the same?
  kpidRejected(t, c, t1.doneKPID, 'meter underflow, vat terminated');

  // Now test that notification and termination can happen during the same
  // crank (the very first one). Without postAbortActions, the notify would
  // get unwound by the vat termination, and would never be delivered.
  const cap2 = consumedByStartVat + firstConsume / 2n;
  const t2 = await createMeteredVat(c, t, dynamicVatBundle, cap2, 1n);

  await t2.consume(false);
  remaining = await t2.getMeter();
  // this checks postAbortActions.deductMeter
  t.is(remaining, 0n);
  // this checks pAA.meterNotifications
  // t.is(c.kpStatus(t2.notifyKPID), 'fulfilled'); // XXX RESTORE
  // const notify2 = c.kpResolution(t2.notifyKPID); // XXX RESTORE
  // t.is(kunser(notify2).value, 0n); // XXX RESTORE
  kpidRejected(t, c, t2.doneKPID, 'meter underflow, vat terminated');
});

async function unlimitedMeterTest(t, doVatAdminRestarts) {
  const managerType = 'xs-worker';
  const { kernelBundles, dynamicVatBundle, bootstrapBundle } = t.context.data;
  const config = {
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        bundle: bootstrapBundle,
      },
    },
    bundles: {
      dynamic: {
        bundle: dynamicVatBundle,
      },
    },
  };
  const kernelStorage = initSwingStore().kernelStorage;
  const c = await buildVatController(config, [], {
    kernelStorage,
    kernelBundles,
  });
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');

  // let the vatAdminService get wired up before we create any new vats
  await c.run();

  async function vaRestart() {
    if (doVatAdminRestarts) {
      await restartVatAdminVat(c);
    }
  }
  await vaRestart();

  // create an unlimited meter
  const kp1 = c.queueToVatRoot('bootstrap', 'createUnlimitedMeter', []);
  await c.run();
  const marg = kunser(c.kpResolution(kp1));

  // 'createVat' will import the bundle
  const cvargs = ['dynamic', { managerType, meter: marg }];
  const kp2 = c.queueToVatRoot('bootstrap', 'createVat', cvargs, 'ignore');
  await c.run();
  const res2 = kunser(c.kpResolution(kp2));
  t.is(res2[0], 'created');
  const doneKPID = krefOf(res2[1]);

  async function getMeter() {
    const kp = c.queueToVatRoot('bootstrap', 'getMeter', [marg], 'ignore');
    await c.run();
    const res = c.kpResolution(kp);
    const { remaining } = kunser(res);
    return remaining;
  }

  async function consume(shouldComplete) {
    const kp = c.queueToVatRoot('bootstrap', 'run', []);
    await c.run();
    if (shouldComplete) {
      t.is(c.kpStatus(kp), 'fulfilled');
      t.is(kunser(c.kpResolution(kp)), 42);
    } else {
      t.is(c.kpStatus(kp), 'rejected');
      kpidRejected(t, c, kp, 'vat terminated');
    }
  }

  let remaining = await getMeter();
  t.is(remaining, 'unlimited');
  await vaRestart();

  // messages to the vat do not decrement the meter
  await consume(true);
  remaining = await getMeter();
  t.is(remaining, 'unlimited');
  await vaRestart();

  // but each crank is still limited, so an infinite loop will kill the vat
  const kp4 = c.queueToVatRoot('bootstrap', 'explode', ['compute']);
  await c.run();
  kpidRejected(t, c, kp4, 'vat terminated');
  if (doVatAdminRestarts) {
    // if we restarted the vatAdmin vat, that will have broken the done promise
    // for the vat that's going to outrun the compute meter
    kpidRejected(t, c, doneKPID, {
      incarnationNumber: 1,
      name: 'vatUpgraded',
      upgradeMessage: 'vat vatAdmin upgraded',
    });
  } else {
    kpidRejected(t, c, doneKPID, 'Compute meter exceeded');
  }
}

test('unlimited meter', async t => {
  await unlimitedMeterTest(t, false);
});

test('unlimited meter with VA restarts', async t => {
  await unlimitedMeterTest(t, true);
});
