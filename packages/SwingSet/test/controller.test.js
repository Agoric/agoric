// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';

import { spawn } from 'child_process';
import { kser, kunser, kslot } from '@agoric/kmarshal';
import { initSwingStore } from '@agoric/swing-store';
import {
  buildVatController,
  loadBasedir,
  initializeSwingset,
  makeSwingsetController,
} from '../src/index.js';
import { makeDummySlogger } from '../src/kernel/slogger.js';
import makeKernelKeeper, {
  CURRENT_SCHEMA_VERSION,
} from '../src/kernel/state/kernelKeeper.js';
import { checkKT } from './util.js';

const emptyVP = kser({});

function removeTriple(arr, a, b, c) {
  for (let i = 0; i < arr.length; i += 1) {
    const elem = arr[i];
    if (elem[0] === a && elem[1] === b && elem[2] === c) {
      arr.splice(i, 1);
      return;
    }
  }
}

test('load empty', async t => {
  const config = {};
  const controller = await buildVatController(config);
  t.teardown(controller.shutdown);
  await controller.run();
  t.truthy(true);
});

async function simpleCall(t) {
  const config = {
    defaultManagerType: 'local',
    vats: {
      vat1: {
        sourceSpec: new URL('vat-controller-1.js', import.meta.url).pathname,
        creationOptions: { enableSetup: true },
      },
    },
  };
  const kernelStorage = initSwingStore().kernelStorage;
  const controller = await buildVatController(config, [], { kernelStorage });
  t.teardown(controller.shutdown);
  const data = controller.dump();
  // note: data.vatTables is sorted by vatID, but we have no particular
  // reason to believe that vat1 will get a lower ID than vatAdmin, because
  // vats are processed in Map.keys() order
  const adminVatID = controller.vatNameToID('vatAdmin');
  const vat1ID = controller.vatNameToID('vat1');
  const commsVatID = controller.vatNameToID('comms');
  const vattpVatID = controller.vatNameToID('vattp');
  const timerVatID = controller.vatNameToID('timer');

  // snoop the bundleID to use
  const stateFor = vatID => {
    const source = JSON.parse(kernelStorage.kvStore.get(`${vatID}.source`));
    const { bundleID } = source;
    const transcript = [
      [
        0,
        {
          d: [
            'initialize-worker',
            {
              source: { bundleID },
              workerOptions: {
                type: 'local',
              },
            },
          ],
          sc: [],
          r: { status: 'ok' },
        },
      ],
    ];
    const state = { transcript };
    return { vatID, state };
  };
  t.deepEqual(data.vatTables, [
    stateFor(adminVatID),
    { vatID: commsVatID, state: { transcript: [] } }, // transcriptless
    stateFor(vattpVatID),
    stateFor(timerVatID),
    stateFor(vat1ID),
  ]);
  // the vatAdmin root is pre-registered
  const vatAdminRoot = ['ko20', adminVatID, 'o+0'];
  t.deepEqual(data.kernelTable, [vatAdminRoot]);

  // vat1:o+0 will map to ko21
  controller.queueToVatRoot('vat1', 'foo', ['args']);
  t.deepEqual(controller.dump().runQueue, []);
  t.deepEqual(controller.dump().acceptanceQueue, [
    { type: 'startVat', vatID: 'v1', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v2', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v3', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v4', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v5', vatParameters: emptyVP },
    {
      msg: {
        methargs: kser(['foo', ['args']]),
        result: 'kp40',
      },
      target: 'ko21',
      type: 'send',
    },
  ]);
  await controller.run();
  const le = controller.dump().log[0];
  t.deepEqual(JSON.parse(le), {
    target: 'o+0',
    method: 'foo',
    args: kser(['args']),
  });

  controller.log('2');
  t.is(controller.dump().log[1], '2');

  // The resulting activity hash is sensitive to a significant amount of
  // code, including the contents of marshal and assert (because they get
  // bundled into e.g. the comms vat source bundle, which is stored in the
  // kvStore during initializeKernel). Testing against the exact hash value
  // would require changing this test each time one of those upstream
  // libraries changed, which is clearly infeasible. Instead, merely check
  // that `controller.getActivityhash()` returns a hash-shaped string.

  const ah = controller.getActivityhash();
  t.is(typeof ah, 'string', ah);
  t.truthy(/^[0-9a-f]{64}$/.test(ah), ah);
}

test('simple call', async t => {
  await simpleCall(t);
});

async function doTestBootstrap(t, doPin) {
  const config = await loadBasedir(
    new URL('basedir-controller-2', import.meta.url).pathname,
  );
  if (doPin) {
    config.pinBootstrapRoot = true;
  }
  const c = await buildVatController(config);
  t.teardown(c.shutdown);

  // figure out kernel object ID of bootstrap root object
  const bootstrapVatID = c.vatNameToID('bootstrap');
  const kernelTable = c.dump().kernelTable;
  let rootKobjID;
  for (const [kID, vatID, vobjID] of kernelTable) {
    if (vatID === bootstrapVatID && vobjID === 'o+0') {
      rootKobjID = kID;
      break;
    }
  }
  t.truthy(rootKobjID);

  await c.run();

  // after run, if bootstrap root is pinned, it will be there, if not, not
  const objects = c.dump().objects;
  let reachableRoot = false;
  for (const [kID, _vatID, reachable] of objects) {
    if (kID === rootKobjID) {
      reachableRoot = !!reachable;
      break;
    }
  }
  t.is(reachableRoot, doPin);

  const kpid = c.queueToVatRoot('bootstrap', 'doMore');
  await c.run();
  const status = c.kpStatus(kpid);
  const result = c.kpResolution(kpid);

  if (doPin) {
    // if pinned, second message will have been handled
    t.deepEqual(status, 'fulfilled');
    t.deepEqual(c.dump().log, [
      'buildRootObject called',
      'bootstrap called',
      'more stuff',
    ]);
  } else {
    // if not pinned, second message will go splat
    t.deepEqual(status, 'rejected');
    // If we don't pin the bootstrap root, then it will be GC'd after it
    // finishes done processing the 'bootstrap' message.  This means that when
    // the 'doMore' message is delivered it will be addressed to an object (o+0)
    // whose vref doesn't (any longer) exist.  In normal operation this is a
    // thing that cannot happen, since, to send the message in the first place
    // the sender (which would normally be another vat) needs the target vref,
    // which in turn requires that the target object would have to be exported,
    // which in turn means that the object could not have been GC'd since export
    // bumps the refcount.  Consequently, receiving a message addressed to a
    // vref that doesn't exist means something terrible has gone wrong so the
    // kernel will kill the vat if that happens.  But since `queueToVatRoot` has
    // the root object vref, 'o+0', hardcoded into it as a string, it manages to
    // violate the invariant; this kills the receiving vat, meaning that the GC
    // symptom we see from the here is a "vat terminated" rejection
    t.deepEqual(kunser(result), Error('vat terminated'));
  }
}

test('bootstrap', async t => {
  await doTestBootstrap(t, true);
});

test('bootstrap without pin', async t => {
  await doTestBootstrap(t, false);
});

test('XS bootstrap', async t => {
  const config = await loadBasedir(
    new URL('basedir-controller-2', import.meta.url).pathname,
  );
  config.defaultManagerType = 'xs-worker';
  const kernelStorage = initSwingStore().kernelStorage;
  const c = await buildVatController(config, [], { kernelStorage });
  t.teardown(c.shutdown);
  await c.run();
  t.deepEqual(c.dump().log, ['buildRootObject called', 'bootstrap called']);
  t.is(
    kernelStorage.kvStore.get('kernel.defaultManagerType'),
    'xsnap',
    'defaultManagerType is saved by kernelKeeper',
  );
  const vatID = c.vatNameToID('bootstrap');
  const options = JSON.parse(kernelStorage.kvStore.get(`${vatID}.options`));
  t.is(
    options.workerOptions.type,
    'xsnap',
    'managerType gets recorded for the bootstrap vat',
  );
});

test('static vats are unmetered on XS', async t => {
  const kernelStorage = initSwingStore().kernelStorage;
  const config = await loadBasedir(
    new URL('basedir-controller-2', import.meta.url).pathname,
  );
  config.defaultManagerType = 'xs-worker';
  await initializeSwingset(config, [], kernelStorage);
  const limited = [];
  const c = await makeSwingsetController(
    kernelStorage,
    {},
    {
      spawn(command, args, options) {
        limited.push(args.includes('-l'));
        return spawn(command, args, options);
      },
      warehousePolicy: {
        restartWorkerOnSnapshot: false,
      },
    },
  );
  t.teardown(c.shutdown);
  await c.run();
  t.deepEqual(c.dump().log, ['buildRootObject called', 'bootstrap called']);
  t.deepEqual(limited, [false, false, false, false]);
});

test('validate config.defaultManagerType', async t => {
  const config = await loadBasedir(
    new URL('basedir-controller-2', import.meta.url).pathname,
  );
  config.defaultManagerType = 'XYZ';
  await t.throwsAsync(buildVatController(config, undefined, { env: {} }), {
    message: /XYZ/,
  });
});

test.serial('bootstrap export', async t => {
  const config = await loadBasedir(
    new URL('basedir-controller-3', import.meta.url).pathname,
  );
  config.defaultManagerType = 'xs-worker';
  const c = await buildVatController(config);
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');
  const vatAdminVatID = c.vatNameToID('vatAdmin');
  const vatAdminDevID = c.deviceNameToID('vatAdmin');
  const commsVatID = c.vatNameToID('comms');
  const vatTPVatID = c.vatNameToID('vattp');
  const timerVatID = c.vatNameToID('timer');
  const bootstrapVatID = c.vatNameToID('bootstrap');
  const leftVatID = c.vatNameToID('left');
  const rightVatID = c.vatNameToID('right');
  // console.log(c.dump());
  // console.log('SLOTS: ', c.dump().runQueue[0].slots);

  // The expected kernel object indices. There's no guarantee that these will
  // be assigned in any particular order, so each time we add a built-in vat,
  // they tend to get shuffled and this test must be updated. TODO: find a
  // better test, probably by sorting the list of vats by their vatID, and
  // then asserting that their root objects are assigned `koNN` numbers in
  // matching order.
  const vatAdminSvc = 'ko20';
  const boot0 = 'ko21';
  const comms0 = 'ko22';
  const left0 = 'ko23';
  const right0 = 'ko24';
  const timer0 = 'ko25';
  const vattp0 = 'ko26';
  const adminDev = 'kd30';
  const kt = [
    [adminDev, vatAdminDevID, 'd+0'],
    [boot0, bootstrapVatID, 'o+0'],
    [left0, leftVatID, 'o+0'],
    [right0, rightVatID, 'o+0'],
    [vatAdminSvc, vatAdminVatID, 'o+0'],
    [comms0, commsVatID, 'o+0'],
    [vattp0, vatTPVatID, 'o+0'],
    [timer0, timerVatID, 'o+0'],
  ];
  checkKT(t, c, kt);

  t.deepEqual(c.dump().runQueue, []);
  t.deepEqual(c.dump().acceptanceQueue, [
    { type: 'startVat', vatID: 'v1', vatParameters: kser({ argv: [] }) },
    { type: 'startVat', vatID: 'v2', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v3', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v4', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v5', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v6', vatParameters: emptyVP },
    { type: 'startVat', vatID: 'v7', vatParameters: emptyVP },
    {
      msg: {
        result: 'kp40',
        methargs: kser([
          'bootstrap',
          [
            {
              bootstrap: kslot(boot0, 'root'),
              comms: kslot(comms0, 'root'),
              left: kslot(left0, 'root'),
              right: kslot(right0, 'root'),
              timer: kslot(timer0, 'root'),
              vatAdmin: kslot(vatAdminSvc, 'root'),
              vattp: kslot(vattp0, 'root'),
            },
            {
              vatAdmin: kslot(adminDev, 'device'),
            },
          ],
        ]),
      },
      target: boot0,
      type: 'send',
    },
  ]);

  // this test was designed before GC and acceptance queues, and wants to
  // single-step the kernel, but doesn't care about the GC action steps,
  // or the temporary acceptance queue, so we use this helper function
  async function stepGC() {
    while (c.dump().gcActions.length) {
      await c.step();
    }
    while (c.dump().reapQueue.length) {
      await c.step();
    }
    while (c.dump().acceptanceQueue.length) {
      await c.step();
    }
    await c.step(); // the non- GC action
  }

  t.deepEqual(c.dump().log, []);
  for (let i = 0; i < 7; i += 1) {
    await stepGC(); // vat starts
  }
  // console.log('--- c.step() running bootstrap.obj0.bootstrap');
  await stepGC(); // message bootstrap
  // kernel promise for result of the foo() that bootstrap sends to vat-left
  const fooP = 'kp41';
  t.deepEqual(c.dump().log, ['bootstrap.obj0.bootstrap()']);
  kt.push([comms0, bootstrapVatID, 'o-50']);
  kt.push([left0, bootstrapVatID, 'o-51']);
  kt.push([right0, bootstrapVatID, 'o-52']);
  kt.push([timer0, bootstrapVatID, 'o-53']);
  kt.push([vatAdminSvc, bootstrapVatID, 'o-54']);
  kt.push([vattp0, bootstrapVatID, 'o-55']);
  kt.push([fooP, bootstrapVatID, 'p+5']);
  kt.push([adminDev, bootstrapVatID, 'd-70']);
  // checkKT(t, c, kt); // disabled due to cross-engine GC variation

  t.deepEqual(c.dump().runQueue, []);
  t.deepEqual(c.dump().acceptanceQueue, [
    {
      type: 'send',
      target: left0,
      msg: {
        methargs: kser(['foo', [1, kslot(right0, 'root')]]),
        result: fooP,
      },
    },
  ]);

  await stepGC(); // dropExports
  await stepGC(); // message foo
  const barP = 'kp42';
  t.deepEqual(c.dump().log, ['bootstrap.obj0.bootstrap()', 'left.foo 1']);
  kt.push([right0, leftVatID, 'o-50']);
  kt.push([barP, leftVatID, 'p+5']);
  // checkKT(t, c, kt); // disabled due to cross-engine GC variation

  t.deepEqual(c.dump().runQueue, []);
  t.deepEqual(c.dump().acceptanceQueue, [
    {
      type: 'send',
      target: right0,
      msg: {
        methargs: kser(['bar', [2, kslot(right0, 'root')]]),
        result: barP,
      },
    },
    { type: 'notify', vatID: bootstrapVatID, kpid: fooP },
  ]);

  await stepGC(); // message bar

  t.deepEqual(c.dump().log, [
    'bootstrap.obj0.bootstrap()',
    'left.foo 1',
    'right.obj0.bar 2 true',
  ]);

  // checkKT(t, c, kt); // disabled due to cross-engine GC variation

  t.deepEqual(c.dump().runQueue, [
    { type: 'notify', vatID: bootstrapVatID, kpid: fooP },
  ]);
  t.deepEqual(c.dump().acceptanceQueue, [
    { type: 'notify', vatID: leftVatID, kpid: barP },
  ]);

  await stepGC(); // notify

  t.deepEqual(c.dump().log, [
    'bootstrap.obj0.bootstrap()',
    'left.foo 1',
    'right.obj0.bar 2 true',
  ]);
  removeTriple(kt, fooP, bootstrapVatID, 'p+5'); // pruned promise

  // retired imports from bootstrap vat
  removeTriple(kt, vatAdminSvc, bootstrapVatID, 'o-54');
  removeTriple(kt, comms0, bootstrapVatID, 'o-50');
  removeTriple(kt, left0, bootstrapVatID, 'o-51');
  removeTriple(kt, right0, bootstrapVatID, 'o-52');
  removeTriple(kt, timer0, bootstrapVatID, 'o-53');
  removeTriple(kt, vattp0, bootstrapVatID, 'o-55');
  // checkKT(t, c, kt); // disabled due to cross-engine GC variation

  t.deepEqual(c.dump().runQueue, [
    { type: 'notify', vatID: leftVatID, kpid: barP },
  ]);
  t.deepEqual(c.dump().acceptanceQueue, []);

  await stepGC(); // notify

  t.deepEqual(c.dump().log, [
    'bootstrap.obj0.bootstrap()',
    'left.foo 1',
    'right.obj0.bar 2 true',
  ]);

  // that pushes several higher-priority GC dropExports onto the queue as
  // everything gets dropped
  await c.run();

  removeTriple(kt, barP, leftVatID, 'p+5'); // pruned promise

  // everybody else folds up and goes home
  removeTriple(kt, comms0, commsVatID, 'o+0');
  removeTriple(kt, left0, leftVatID, 'o+0');
  removeTriple(kt, right0, leftVatID, 'o-50');
  removeTriple(kt, right0, rightVatID, 'o+0');
  removeTriple(kt, timer0, timerVatID, 'o+0');
  removeTriple(kt, vattp0, vatTPVatID, 'o+0');
  checkKT(t, c, kt);
});

test('comms vat does not BOYD', async t => {
  const config = {};
  const kernelStorage = initSwingStore().kernelStorage;
  const controller = await buildVatController(config, [], { kernelStorage });
  t.teardown(controller.shutdown);
  const k = makeKernelKeeper(
    kernelStorage,
    CURRENT_SCHEMA_VERSION,
    makeDummySlogger({}),
  );
  const commsVatID = k.getVatIDForName('comms');
  t.deepEqual(
    JSON.parse(k.kvStore.get(`${commsVatID}.options`)).reapDirtThreshold,
    { never: true },
  );
});
