// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../../../tools/prepare-test-env-ava.js';

import { kser, kunser } from '@agoric/kmarshal';
import { initSwingStore } from '@agoric/swing-store';

import {
  loadSwingsetConfigFile,
  buildKernelBundles,
} from '../../../src/index.js';
import { enumeratePrefixedKeys } from '../../../src/kernel/state/storageHelper.js';
import { buildTestVatController } from '../../../tools/test-vat-controller.js';
import { restartVatAdminVat } from '../../util.js';

test.before(async t => {
  const kernelBundles = await buildKernelBundles();
  t.context.data = { kernelBundles };
});

// Note: all tests in this file create a kernel, which (under
// SWINGSET_WORKER_TYPE=xs-worker) launches 5 or 6 xsnap-worker
// processes for the brief duration of the test. There are (as of
// 19-jul-2022) 32 tests, and if we allowed AVA to run all of them in
// parallel, that causes about 170 simultaneous workers (in addition
// to any other test programs currently running). We've observed CI
// failures that appear to be the Linux OOM Killer taking out the AVA
// worker handling this file, due to memory pressure coming from the
// large number of simultaneous xsnap workers. To avoid this, we use
// `test.serial()` instead of `test()` for all of them, which slows
// the test but reduces the peak memory pressure considerably.

async function doTerminateNonCritical(
  t,
  deadVatID,
  mode,
  dynamic,
  reference,
  extraMessage = [],
  doVatAdminRestart = false,
) {
  const configPath = new URL('swingset-terminate.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const kernelStorage = initSwingStore().kernelStorage;
  const controller = await buildTestVatController(config, [], {
    ...t.context.data,
    kernelStorage,
  });
  t.teardown(controller.shutdown);
  t.is(controller.kpStatus(controller.bootstrapResult), 'unresolved');
  const preProbe = kernelStorage.kvStore.get(`${deadVatID}.options`);
  if (!dynamic) {
    t.truthy(preProbe);
  }
  controller.pinVatRoot('bootstrap');
  await controller.run();

  if (doVatAdminRestart) {
    await restartVatAdminVat(controller);
  }

  controller.queueToVatRoot('bootstrap', 'setupTestVat', [false, dynamic]);
  await controller.run();

  if (doVatAdminRestart) {
    await restartVatAdminVat(controller);
  }

  const kpid = controller.queueToVatRoot('bootstrap', 'performTest', [mode]);
  await controller.run();
  t.is(controller.kpStatus(kpid), 'fulfilled');
  t.deepEqual(controller.kpResolution(kpid), kser('test done'));

  const staticDone = dynamic ? [] : ['done'];
  const dynamicDone = dynamic ? [...reference, 'done'] : [];
  t.deepEqual(controller.dump().log, [
    'FOO 1',
    'count1 FOO SAYS 1',
    'QUERY 2',
    'GOT QUERY 2',
    'ANSWER 2',
    'query2 2',
    ...staticDone,
    'QUERY 3',
    'GOT QUERY 3',
    ...extraMessage,
    'foreverP.catch Error: vat terminated',
    'query3P.catch Error: vat terminated',
    'afterForeverP.catch Error: vat terminated',
    'foo4P.catch Error: vat terminated',
    ...dynamicDone,
  ]);
  const postProbe = kernelStorage.kvStore.get(`${deadVatID}.options`);
  t.is(postProbe, undefined);
}

async function doTerminateCritical(
  t,
  deadVatID,
  mode,
  dynamic,
  doVatAdminRestart = false,
) {
  const configPath = new URL('swingset-terminate.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const kernelStorage = initSwingStore().kernelStorage;
  const controller = await buildTestVatController(config, [], {
    ...t.context.data,
    kernelStorage,
  });
  t.teardown(controller.shutdown);
  t.is(controller.kpStatus(controller.bootstrapResult), 'unresolved');
  const preProbe = kernelStorage.kvStore.get(`${deadVatID}.options`);
  if (!dynamic) {
    t.truthy(preProbe);
  }
  controller.pinVatRoot('bootstrap');
  await controller.run();

  if (doVatAdminRestart) {
    await restartVatAdminVat(controller);
  }

  if (dynamic) {
    controller.queueToVatRoot('bootstrap', 'setupCriticalVatKey');
    await controller.run();
  }

  if (doVatAdminRestart) {
    await restartVatAdminVat(controller);
  }

  controller.queueToVatRoot('bootstrap', 'setupTestVat', [true, dynamic]);
  await controller.run();

  if (doVatAdminRestart) {
    await restartVatAdminVat(controller);
  }

  const kpid = controller.queueToVatRoot('bootstrap', 'performTest', [mode]);
  const err = await t.throwsAsync(() => controller.run());
  const thrown = kunser({ body: err.message, slots: [] });
  if (typeof thrown === 'string') {
    t.is(thrown, mode);
  } else {
    t.is(thrown.message, mode);
  }
  t.is(controller.kpStatus(kpid), dynamic ? 'unresolved' : 'fulfilled');
  // the kernel is supposed to crash before deleting vNN.options,
  // although strictly speaking it doesn't matter because the host is
  // supposed to crash too, abandoning the uncommitted swingstore
  // changes
  const postProbe = kernelStorage.kvStore.get(`${deadVatID}.options`);
  t.truthy(postProbe);
}

test.serial('terminate (dynamic, non-critical)', async t => {
  await doTerminateNonCritical(
    t,
    'v8',
    'kill',
    true,
    [
      'termP.catch Error: vatAdminService rejecting attempt to perform "terminateWithFailure"() on non-running vat "v8"',
      'done exception kill (Error=false)',
    ],
    [],
    false,
  );
});

test.serial('terminate (dynamic, non-critical) with VA restarts', async t => {
  await doTerminateNonCritical(
    t,
    'v8',
    'kill',
    true,
    [
      'termP.catch Error: vatAdminService rejecting attempt to perform "terminateWithFailure"() on non-running vat "v8"',
      'done exception kill (Error=false)',
    ],
    [],
    true,
  );
});

// no test 'terminate (static, non-critical)' because static vats can't be killed

test.serial('terminate (dynamic, critical)', async t => {
  await doTerminateCritical(t, 'v8', 'kill', true, false);
});

test.serial('terminate (dynamic, critical) with VA restarts', async t => {
  await doTerminateCritical(t, 'v8', 'kill', true, true);
});

// no test 'terminate (static, critical)' because static vats can't be killed

test.serial(
  'exit happy path simple result (dynamic, non-critical)',
  async t => {
    await doTerminateNonCritical(t, 'v8', 'happy', true, [
      'done result happy (Error=false)',
    ]);
  },
);

test.serial('exit happy path simple result (static, non-critical)', async t => {
  await doTerminateNonCritical(t, 'v7', 'happy', false, [
    'done result happy (Error=false)',
  ]);
});

test.serial('exit happy path simple result (dynamic, critical)', async t => {
  await doTerminateCritical(t, 'v8', 'happy', true);
});

test.serial('exit happy path simple result (static, critical)', async t => {
  await doTerminateCritical(t, 'v6', 'happy', false);
});

test.serial(
  'exit happy path complex result (dynamic, non-critical)',
  async t => {
    await doTerminateNonCritical(t, 'v8', 'exceptionallyHappy', true, [
      'done result Error: exceptionallyHappy (Error=true)',
    ]);
  },
);

test.serial(
  'exit happy path complex result (static, non-critical)',
  async t => {
    await doTerminateNonCritical(t, 'v7', 'exceptionallyHappy', false, [
      'done result Error: exceptionallyHappy (Error=true)',
    ]);
  },
);

test.serial('exit happy path complex result (dynamic, critical)', async t => {
  await doTerminateCritical(t, 'v8', 'exceptionallyHappy', true);
});

test.serial('exit happy path complex result (static, critical)', async t => {
  await doTerminateCritical(t, 'v6', 'exceptionallyHappy', false);
});

test.serial('exit sad path simple result (dynamic, non-critical)', async t => {
  await doTerminateNonCritical(t, 'v8', 'sad', true, [
    'done exception sad (Error=false)',
  ]);
});

test.serial('exit sad path simple result (static, non-critical)', async t => {
  await doTerminateNonCritical(t, 'v7', 'sad', false, [
    'done exception sad (Error=false)',
  ]);
});

test.serial('exit sad path simple result (dynamic, critical)', async t => {
  await doTerminateCritical(t, 'v8', 'sad', true);
});

test.serial('exit sad path simple result (static, critical)', async t => {
  await doTerminateCritical(t, 'v6', 'sad', false);
});

test.serial('exit sad path complex result (dynamic, non-critical)', async t => {
  await doTerminateNonCritical(t, 'v8', 'exceptionallySad', true, [
    'done exception Error: exceptionallySad (Error=true)',
  ]);
});

test.serial('exit sad path complex result (static, non-critical)', async t => {
  await doTerminateNonCritical(t, 'v7', 'exceptionallySad', false, [
    'done exception Error: exceptionallySad (Error=true)',
  ]);
});

test.serial('exit sad path complex result (dynamic, critical)', async t => {
  await doTerminateCritical(t, 'v8', 'exceptionallySad', true);
});

test.serial('exit sad path complex result (static, critical)', async t => {
  await doTerminateCritical(t, 'v6', 'exceptionallySad', false);
});

test.serial(
  'exit happy path with ante-mortem message (dynamic, non-critical)',
  async t => {
    await doTerminateNonCritical(
      t,
      'v8',
      'happyTalkFirst',
      true,
      ['done result happyTalkFirst (Error=false)'],
      ['GOT QUERY not dead quite yet'],
    );
  },
);

test.serial(
  'exit happy path with ante-mortem message (static, non-critical)',
  async t => {
    await doTerminateNonCritical(
      t,
      'v7',
      'happyTalkFirst',
      false,
      ['done result happyTalkFirst (Error=false)'],
      ['GOT QUERY not dead quite yet'],
    );
  },
);

test.serial(
  'exit happy path with ante-mortem message (dynamic, critical)',
  async t => {
    await doTerminateCritical(t, 'v8', 'happyTalkFirst', true);
  },
);

test.serial(
  'exit happy path with ante-mortem message (static, critical)',
  async t => {
    await doTerminateCritical(t, 'v6', 'happyTalkFirst', false);
  },
);

test.serial(
  'exit sad path with ante-mortem message (dynamic, non-critical)',
  async t => {
    await doTerminateNonCritical(
      t,
      'v8',
      'sadTalkFirst',
      true,
      ['done exception Error: sadTalkFirst (Error=true)'],
      // The following would be observed on the happy path but explicitly should
      // *not* be observed here
      // ['GOT QUERY not dead quite yet'],
    );
  },
);

test.serial(
  'exit sad path with ante-mortem message (static, non-critical)',
  async t => {
    await doTerminateNonCritical(
      t,
      'v7',
      'sadTalkFirst',
      false,
      ['done exception Error: sadTalkFirst (Error=true)'],
      // The following would be observed on the happy path but explicitly should
      // *not* be observed here
      // ['GOT QUERY not dead quite yet'],
    );
  },
);

test.serial(
  'exit sad path with ante-mortem message (dynamic, critical)',
  async t => {
    await doTerminateCritical(t, 'v8', 'sadTalkFirst', true);
  },
);

test.serial(
  'exit sad path with ante-mortem message (static, critical)',
  async t => {
    await doTerminateCritical(t, 'v6', 'sadTalkFirst', false);
  },
);

test.serial('exit with presence', async t => {
  const configPath = new URL('swingset-die-with-presence.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const controller = await buildTestVatController(config, [], t.context.data);
  t.teardown(controller.shutdown);
  await controller.run();
  t.deepEqual(controller.dump().log, [
    'preparing dynamic vat',
    'done message: your ad here',
    'talkback from beyond?',
    'done',
  ]);
});

test.serial('dispatches to the dead do not harm kernel', async t => {
  const configPath = new URL('swingset-speak-to-dead.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';

  const ss1 = initSwingStore();
  {
    const c1 = await buildTestVatController(config, [], {
      kernelStorage: ss1.kernelStorage,
      kernelBundles: t.context.data.kernelBundles,
    });
    t.teardown(c1.shutdown);
    c1.pinVatRoot('bootstrap');
    await c1.run();
    t.deepEqual(c1.kpResolution(c1.bootstrapResult), kser('bootstrap done'));
    t.deepEqual(c1.dump().log, [
      'w: p1 = before',
      `w: I ate'nt dead`,
      'b: p1b = I so resolve',
      'b: p2b fails Error: vat terminated',
      'done: Error: arbitrary reason',
    ]);
  }
  const serialized = ss1.debug.serialize();
  const ss2 = initSwingStore(null, { serialized });
  {
    const c2 = await buildTestVatController(config, [], {
      kernelStorage: ss2.kernelStorage,
      kernelBundles: t.context.data.kernelBundles,
    });
    t.teardown(c2.shutdown);
    const r2 = c2.queueToVatRoot('bootstrap', 'speakAgain', [], 'panic');
    await c2.run();
    t.is(c2.kpStatus(r2), 'fulfilled');
    t.deepEqual(c2.dump().log, [
      'b: p1b = I so resolve',
      'b: p2b fails Error: vat terminated',
      'done: Error: arbitrary reason',
      'm: live 2 failed: Error: vat terminated',
    ]);
  }
});

test.serial('invalid criticalVatKey causes vat creation to fail', async t => {
  const configPath = new URL('swingset-bad-vat-key.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const controller = await buildTestVatController(config, [], t.context.data);
  t.teardown(controller.shutdown);
  await t.throwsAsync(() => controller.run(), {
    message: /invalid criticalVatKey/,
  });
});

test.serial('dead vat state removed', async t => {
  const configPath = new URL('swingset-die-cleanly.json', import.meta.url)
    .pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const { kernelStorage, debug } = initSwingStore();

  const controller = await buildTestVatController(config, [], {
    kernelStorage,
    kernelBundles: t.context.data.kernelBundles,
  });
  t.teardown(controller.shutdown);
  controller.pinVatRoot('bootstrap');
  await controller.run();
  t.deepEqual(
    controller.kpResolution(controller.bootstrapResult),
    kser('bootstrap done'),
  );
  const { kvStore } = kernelStorage;
  t.is(kvStore.get('vat.dynamicIDs'), '["v6"]');
  t.is(kvStore.get('ko26.owner'), 'v6');
  t.is(Array.from(enumeratePrefixedKeys(kvStore, 'v6.')).length > 10, true);
  // find the two promises in the new vat's c-list, they should both
  // have refCount=2 (one for bootstrap, one for the dynamic vat)
  let decidedKPID;
  let subscribedKPID;
  for (const key of enumeratePrefixedKeys(kvStore, 'v6.')) {
    if (key.startsWith('v6.c.kp')) {
      const kpid = key.slice('v6.c.'.length);
      const refCount = Number(kvStore.get(`${kpid}.refCount`));
      const decider = kvStore.get(`${kpid}.decider`);
      if (decider === 'v6') {
        decidedKPID = kpid;
      } else {
        subscribedKPID = kpid;
      }
      t.is(refCount, 2, `${kpid}.refCount=${refCount}, not 2`);
    }
  }
  const beforeDump = debug.dump(true);
  t.truthy(beforeDump.transcripts.v6);
  t.truthy(beforeDump.snapshots.v6);

  controller.queueToVatRoot('bootstrap', 'phase2', []);
  await controller.run();
  t.is(kvStore.get('vat.dynamicIDs'), '[]');
  t.is(kvStore.get('ko26.owner'), undefined);
  t.is(Array.from(enumeratePrefixedKeys(kvStore, 'v6.')).length, 0);
  const afterDump = debug.dump(true);
  t.falsy(afterDump.transcripts.v6);
  t.falsy(afterDump.snapshots.v6);
  // the promise that v6 was deciding will be removed from v6's
  // c-list, rejected by the kernel, and the reject notification to
  // vat-bootstrap will remove it from that c-list, so the end state
  // should be no references, and a completely deleted kernel promise
  // table entry
  t.is(kvStore.get(`${decidedKPID}.refCount`), undefined);
  // the promise that v6 received from vat-bootstrap should be removed
  // from v6's c-list, but it is still being exported by
  // vat-bootstrap, so the refcount should finish at 1
  t.is(kvStore.get(`${subscribedKPID}.refCount`), '1');
});

test.serial('terminate with presence', async t => {
  const configPath = new URL(
    'swingset-terminate-with-presence.json',
    import.meta.url,
  ).pathname;
  const config = await loadSwingsetConfigFile(configPath);
  config.defaultReapInterval = 'never';
  const controller = await buildTestVatController(config, [], t.context.data);
  t.teardown(controller.shutdown);
  await controller.run();
  t.deepEqual(controller.dump().log, [
    'FOO 1',
    'vat ready FOO SAYS 1',
    'foreverP.catch Error: vat terminated',
    'termP.then undefined',
    'doneP.catch because true',
  ]);
});
