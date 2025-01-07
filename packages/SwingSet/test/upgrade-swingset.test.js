// @ts-nocheck

// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';

import { initSwingStore } from '@agoric/swing-store';
import { kser } from '@agoric/kmarshal';

import {
  initializeSwingset,
  makeSwingsetController,
  upgradeSwingset,
  buildKernelBundles,
} from '../src/index.js';

test.before(async t => {
  const kernelBundles = await buildKernelBundles();
  t.context.data = { kernelBundles };
});

test('kernel refuses to run with out-of-date DB - v0', async t => {
  const { hostStorage, kernelStorage } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {};
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // now doctor the initial state to make it look like the
  // kernelkeeper v0 schema, just deleting the version key and adding
  // 'initialized'

  t.is(kvStore.get('version'), '3');
  kvStore.delete(`version`);
  kvStore.set('initialized', 'true');
  await commit();

  // Now build a controller around this modified state, which should fail.
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });
});

test('kernel refuses to run with out-of-date DB - v1', async t => {
  const { hostStorage, kernelStorage } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {};
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // now doctor the initial state to make it look like the
  // kernelkeeper v1 schema, by reducing the version key and removing
  // vats.terminated

  t.is(kvStore.get('version'), '3');
  kvStore.set(`version`, '1');
  kvStore.delete('vats.terminated');
  await commit();

  // Now build a controller around this modified state, which should fail.
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });
});

test('kernel refuses to run with out-of-date DB - v2', async t => {
  const { hostStorage, kernelStorage } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {};
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // now doctor the initial state to make it look like the
  // kernelkeeper v2 schema, by reducing the version key and removing
  // vats.terminated

  t.is(kvStore.get('version'), '3');
  kvStore.set(`version`, '2');
  await commit();

  // Now build a controller around this modified state, which should fail.
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });
});

test('upgrade kernel state', async t => {
  const { hostStorage, kernelStorage } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {
    vats: {
      one: {
        sourceSpec: new URL(
          'files-vattp/bootstrap-test-vattp.js',
          import.meta.url,
        ).pathname,
      },
    },
  };
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // now doctor the initial state to make it look like the
  // kernelkeeper v0 schema, with 'kernel.defaultReapInterval' instead
  // of 'kernel.defaultReapDirtThreshold', and
  // 'v1.reapCountdown`/`.reapInterval` . This is cribbed from "dirt
  // upgrade" in test-state.js.
  //
  // our mainnet vats have data like:
  // v5.options|{"workerOptions":{"type":"xsnap","bundleIDs":["b0-5c790a966210b78de758fb442af542714ed96da09db76e0b31d6a237e555fd62","b0-e0d2dafc7e981947b42118e8c950837109683bae56f7b4f5bffa1b67e5c1e768"]},"name":"timer","enableSetup":false,"enablePipelining":false,"enableDisavow":false,"useTranscript":true,"reapInterval":1000,"critical":false}
  // v5.reapCountdown|181
  // v5.reapInterval|1000
  //
  // This is a bit fragile.. there are probably ways to refactor
  // kernelKeeper to make this better, or at least put all the
  // manipulation/simulation code in the same place.

  t.true(kvStore.has('kernel.defaultReapDirtThreshold'));

  t.is(kvStore.get('version'), '3');
  kvStore.delete('version'); // i.e. revert to v0
  kvStore.set('initialized', 'true');
  kvStore.delete('vats.terminated');
  kvStore.delete(`kernel.defaultReapDirtThreshold`);
  kvStore.set(`kernel.defaultReapInterval`, '300');

  const vatIDs = {};
  for (const name of JSON.parse(kvStore.get('vat.names'))) {
    const vatID = kvStore.get(`vat.name.${name}`);
    t.truthy(vatID, name);
    vatIDs[name] = vatID;
    t.true(kvStore.has(`${vatID}.reapDirt`));
    kvStore.delete(`${vatID}.reapDirt`);
    const options = JSON.parse(kvStore.get(`${vatID}.options`));
    t.truthy(options);
    t.truthy(options.reapDirtThreshold);
    delete options.reapDirtThreshold;
    options.reapInterval = 55; // ignored by upgrader, so make it bogus
    kvStore.set(`${vatID}.options`, JSON.stringify(options));
    if (name === 'comms') {
      kvStore.set(`${vatID}.reapInterval`, 'never');
      kvStore.set(`${vatID}.reapCountdown`, 'never');
    } else {
      kvStore.set(`${vatID}.reapInterval`, '100');
      kvStore.set(`${vatID}.reapCountdown`, '70');
      // 100-70 means the new state's dirt.deliveries should be 30
    }
  }

  await commit();

  // confirm that this state is too old for the kernel to use
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });

  // upgrade it
  upgradeSwingset(kernelStorage);

  // now we should be good to go
  const controller = await makeSwingsetController(kernelStorage);
  controller.injectQueuedUpgradeEvents();

  t.true(kvStore.has('kernel.defaultReapDirtThreshold'));
  // the kernel-wide threshold gets a .gcKrefs (to meet our upcoming
  // slow-deletion goals)
  t.deepEqual(JSON.parse(kvStore.get('kernel.defaultReapDirtThreshold')), {
    computrons: 'never',
    deliveries: 300,
    gcKrefs: 20,
  });

  // normal vat has some (computed) accumulated dirt
  t.deepEqual(JSON.parse(kvStore.get(`${vatIDs.one}.reapDirt`)), {
    deliveries: 30,
  });
  // anywhere the vat's upgraded threshold differs from the
  // kernel-wide threshold, .options gets an override value, in this
  // case on deliveries (since 100 !== 300)
  t.deepEqual(
    JSON.parse(kvStore.get(`${vatIDs.one}.options`)).reapDirtThreshold,
    { deliveries: 100 },
  );

  // comms doesn't reap, and doesn't count dirt, and gets a special
  // 'never' marker
  t.deepEqual(JSON.parse(kvStore.get(`${vatIDs.comms}.reapDirt`)), {});
  t.deepEqual(
    JSON.parse(kvStore.get(`${vatIDs.comms}.options`)).reapDirtThreshold,
    { never: true },
  );

  // TODO examine the state, use it

  // TODO check the export-data callbacks
});

test('upgrade non-reaping kernel state', async t => {
  const { hostStorage, kernelStorage } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {};
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // now doctor the initial state to make it look like the
  // kernelkeeper v0 schema, with 'kernel.defaultReapInterval' of 'never'

  t.true(kvStore.has('kernel.defaultReapDirtThreshold'));

  t.is(kvStore.get('version'), '3');
  kvStore.delete('version'); // i.e. revert to v0
  kvStore.set('initialized', 'true');
  kvStore.delete('vats.terminated');
  kvStore.delete(`kernel.defaultReapDirtThreshold`);
  kvStore.set(`kernel.defaultReapInterval`, 'never');

  const vatIDs = {};
  for (const name of JSON.parse(kvStore.get('vat.names'))) {
    const vatID = kvStore.get(`vat.name.${name}`);
    t.truthy(vatID, name);
    vatIDs[name] = vatID;
    t.true(kvStore.has(`${vatID}.reapDirt`));
    kvStore.delete(`${vatID}.reapDirt`);
    const options = JSON.parse(kvStore.get(`${vatID}.options`));
    t.truthy(options);
    t.truthy(options.reapDirtThreshold);
    delete options.reapDirtThreshold;
    options.reapInterval = 'never';
    kvStore.set(`${vatID}.options`, JSON.stringify(options));
    kvStore.set(`${vatID}.reapInterval`, 'never');
    kvStore.set(`${vatID}.reapCountdown`, 'never');
  }
  await commit();

  // confirm that this state is too old for the kernel to use
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });

  // upgrade it
  upgradeSwingset(kernelStorage);

  // now we should be good to go
  const controller = await makeSwingsetController(kernelStorage);
  controller.injectQueuedUpgradeEvents();

  t.true(kvStore.has('kernel.defaultReapDirtThreshold'));
  t.deepEqual(JSON.parse(kvStore.get('kernel.defaultReapDirtThreshold')), {
    computrons: 'never',
    deliveries: 'never',
    gcKrefs: 'never',
  });
});

test('v3 upgrade', async t => {
  // exercise the remediation code for bug #9039
  const { hostStorage, kernelStorage, debug } = initSwingStore();
  const { commit } = hostStorage;
  const { kvStore } = kernelStorage;
  const config = {};
  await initializeSwingset(config, [], kernelStorage, t.context.data);
  await commit();

  // doctor the initial state to inject #9039 problems, then check
  // that upgrade applies the expected fixes. We pretend that
  // v1-vatAdmin was upgraded and left some promises lying around.

  const vatID = kvStore.get('vat.name.vatAdmin');
  t.truthy(vatID);

  const disconnectionObject = {
    name: 'vatUpgraded',
    upgradeMessage: 'test upgrade',
    incarnationNumber: 0,
  };
  const dccd = kser(disconnectionObject);

  t.is(kvStore.get('version'), '3');
  kvStore.set('version', '2'); // revert to v2
  const runQueue = [];
  const acceptanceQueue = [];
  const nextID = Number(kvStore.get('kp.nextID'));
  const p1 = `kp${nextID}`;
  const p2 = `kp${nextID + 1}`;
  const p3 = `kp${nextID + 2}`;
  const p4 = `kp${nextID + 3}`;
  const p5 = `kp${nextID + 4}`;
  const p6 = `kp${nextID + 5}`;
  kvStore.set('kp.nextID', `${nextID + 6}`);

  // first promise "was" known only to the upgraded vat, but not
  // self-subscribed, so no notify was sent: remediated
  kvStore.set(`${p1}.state`, 'rejected');
  kvStore.set(`${p1}.data.body`, dccd.body);
  kvStore.set(`${p1}.data.slots`, '');
  kvStore.set(`${p1}.refCount`, '1');
  kvStore.set(`${vatID}.c.${p1}`, 'R p+90');
  kvStore.set(`${vatID}.c.p+90`, p1);

  // second promise was also only known to upgraded vat, but we
  // pretend it was self-subscribed, and the notify is still sitting
  // in the run-queue: ignored
  kvStore.set(`${p2}.state`, 'rejected');
  kvStore.set(`${p2}.data.body`, dccd.body);
  kvStore.set(`${p2}.data.slots`, '');
  kvStore.set(`${p2}.refCount`, '2'); // c-list, runQueue
  kvStore.set(`${vatID}.c.${p2}`, 'R p+91');
  kvStore.set(`${vatID}.c.p+91`, p2);
  runQueue.push({ type: 'notify', vatID, kpid: p2 });

  // third promise is only known to upgraded vat, but self-subscribed,
  // and the notify is still sitting in the acceptance queue: ignored
  kvStore.set(`${p3}.state`, 'rejected');
  kvStore.set(`${p3}.data.body`, dccd.body);
  kvStore.set(`${p3}.data.slots`, '');
  kvStore.set(`${p3}.refCount`, '2'); // c-list, acceptanceQueue
  kvStore.set(`${vatID}.c.${p3}`, 'R p+92');
  kvStore.set(`${vatID}.c.p+92`, p3);
  acceptanceQueue.push({ type: 'notify', vatID, kpid: p3 });

  // fourth promise has additional references, still remediated
  kvStore.set(`${p4}.state`, 'rejected');
  kvStore.set(`${p4}.data.body`, dccd.body);
  kvStore.set(`${p4}.data.slots`, '');
  // note: we aren't being specific about *where* the other reference
  // is coming from. A plausible source is an argument of a message
  // queued to some other unresolved promise. A non-plausible one is
  // in the c-list of some other vat (as a settled promise that one
  // should have gotten a notify too, assuming they were subscribed,
  // and they shouldn't be not subscribed). If the refcounts were
  // stored in a DB with more runtime checking, we'd be creating an
  // illegal situation here, but it's not.
  kvStore.set(`${p4}.refCount`, '2'); // c-list, other
  kvStore.set(`${vatID}.c.${p4}`, 'R p+93');
  kvStore.set(`${vatID}.c.p+93`, p4);

  // fifth promise is fulfilled, not rejected, without a notify:
  // remediated (even though strictly speaking 9039 is about rejected
  // promises)
  kvStore.set(`${p5}.state`, 'fulfilled');
  kvStore.set(`${p5}.data.body`, '#{}');
  kvStore.set(`${p5}.data.slots`, '');
  kvStore.set(`${p5}.refCount`, '1');
  kvStore.set(`${vatID}.c.${p5}`, 'R p+95');
  kvStore.set(`${vatID}.c.p+95`, p5);

  // sixth promise is unresolved: ignored
  kvStore.set(`${p6}.state`, 'unresolved');
  kvStore.set(`${p6}.subscribers`, '');
  kvStore.set(`${p6}.queue.nextID`, `0`);
  kvStore.set(`${p6}.refCount`, `1`);
  kvStore.set(`${p6}.decider`, vatID);
  kvStore.set(`${vatID}.c.${p6}`, 'R p+96');
  kvStore.set(`${vatID}.c.p+96`, p6);

  // now update queues

  // eslint-disable-next-line prefer-const
  let [runHead, runTail] = JSON.parse(kvStore.get('runQueue'));
  for (const m of runQueue) {
    kvStore.set(`runQueue.${runTail}`, JSON.stringify(m));
    runTail += 1;
  }
  kvStore.set('runQueue', JSON.stringify([runHead, runTail]));

  // eslint-disable-next-line prefer-const
  let [accHead, accTail] = JSON.parse(kvStore.get('acceptanceQueue'));
  for (const m of acceptanceQueue) {
    kvStore.set(`acceptanceQueue.${accTail}`, JSON.stringify(m));
    accTail += 1;
  }
  kvStore.set('acceptanceQueue', JSON.stringify([accHead, accTail]));

  const stats = JSON.parse(kvStore.get('kernelStats'));
  stats.runQueueLength += runQueue.length;
  stats.runQueueLengthUp += runQueue.length;
  stats.runQueueLengthMax = runQueue.length;
  stats.acceptanceQueueLength += acceptanceQueue.length;
  stats.acceptanceQueueLengthUp += acceptanceQueue.length;
  stats.acceptanceQueueLengthMax = acceptanceQueue.length;
  kvStore.set('kernelStats', JSON.stringify(stats));

  await commit();

  const data = { ...debug.dump().kvEntries };

  // confirm that this state is too old for the kernel to use
  await t.throwsAsync(async () => makeSwingsetController(kernelStorage), {
    message: /kernel DB is too old/,
  });

  // upgrade it
  const { modified } = upgradeSwingset(kernelStorage);
  t.true(modified);

  // there should be `upgradeEvents` in the kvStore
  const expected = [
    { type: 'notify', vatID, kpid: p1 },
    { type: 'notify', vatID, kpid: p4 },
    { type: 'notify', vatID, kpid: p5 },
  ];
  t.deepEqual(JSON.parse(kvStore.get('upgradeEvents')), expected);

  // DB updated, now we should be ready to build the controller
  const controller = await makeSwingsetController(kernelStorage);

  // but the events remain until the controller is told to inject them
  t.deepEqual(JSON.parse(kvStore.get('upgradeEvents')), expected);

  // and then they're removed
  controller.injectQueuedUpgradeEvents();
  t.is(kvStore.get('upgradeEvents'), undefined);

  // check state by mutating our dumped copy and then comparing
  // against a new dump

  t.deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 });
  // expect notifies for p1/p4/p5 in acceptance queue
  const [head, tail] = JSON.parse(kvStore.get('acceptanceQueue'));
  t.is(head, accHead);
  t.is(tail, accTail + 3);
  data.acceptanceQueue = JSON.stringify([accHead, accTail + 3]);
  // note: we aren't JSON-parsing the entries, so this depends upon
  // the properties being assigned in this exact order
  const np1 = JSON.stringify({ type: 'notify', vatID, kpid: p1 });
  data[`acceptanceQueue.${tail - 3}`] = np1;
  const np4 = JSON.stringify({ type: 'notify', vatID, kpid: p4 });
  data[`acceptanceQueue.${tail - 2}`] = np4;
  const np5 = JSON.stringify({ type: 'notify', vatID, kpid: p5 });
  data[`acceptanceQueue.${tail - 1}`] = np5;

  // note: the in-RAM copy of kernelStats will have the elevated
  // acceptance-queue counters, but these are not written to the
  // kvStore until a crank is executed, so the data we're comparing
  // won't see them
  //
  // stats = JSON.parse(data.kernelStats);
  // stats.acceptanceQueueLength += 3;
  // stats.acceptanceQueueLengthUp += 3;
  // stats.acceptanceQueueLengthMax = stats.acceptanceQueueLength;
  // data.kernelStats = JSON.stringify(stats);

  // the refcounts should now be one larger, because of the queued
  // notifies
  data[`${p1}.refCount`] = '2';
  data[`${p2}.refCount`] = '2';
  data[`${p3}.refCount`] = '2';
  data[`${p4}.refCount`] = '3';
  data[`${p5}.refCount`] = '2';
  data[`${p6}.refCount`] = '1';

  // the version is bumped, indicating we don't need to perform this
  // remediation again (because the bug is fixed and we won't be
  // creating similar corruption in the future)
  data.version = '3';

  // no other state changes are expected

  const newData = { ...debug.dump().kvEntries };
  t.deepEqual(data, newData);
});
