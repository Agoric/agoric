// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '../../tools/prepare-test-env-ava.js';

import { kslot, kser } from '@agoric/kmarshal';
import { initSwingStore } from '@agoric/swing-store';
import { initializeSwingset, makeSwingsetController } from '../../src/index.js';
import {
  crankCounter,
  computronCounter,
  wallClockWaiter,
} from '../../src/lib/runPolicies.js';

async function testCranks(t, mode) {
  /** @type {SwingSetConfig} */
  const config = {
    defaultReapInterval: 'never',
    vats: {
      left: {
        sourceSpec: new URL('vat-policy-left.js', import.meta.url).pathname,
      },
      right: {
        sourceSpec: new URL('vat-policy-right.js', import.meta.url).pathname,
      },
    },
    defaultManagerType: 'xs-worker',
  };
  const kernelStorage = initSwingStore().kernelStorage;
  await initializeSwingset(config, [], kernelStorage);
  const c = await makeSwingsetController(kernelStorage);
  t.teardown(c.shutdown);
  c.pinVatRoot('left');
  const rightKref = c.pinVatRoot('right');
  const rightID = c.vatNameToID('right');
  await c.run();

  if (mode === 'messages' || mode === 'wallclock') {
    // The 'message' mode sends doMessage() to left, which makes left send
    // doMessage() to right, which makes right send doMessage() to left, etc.
    // This uses four cranks per cycle, since each doMessage() also has a
    // return promise that must be resolved.
    c.queueToVatRoot(
      'left',
      'doMessage',
      [kslot(rightKref), 'disabled'],
      'ignore',
    );
  } else if (mode === 'resolutions') {
    // This triggers a back-and-forth cycle of promise resolution, which uses
    // two cranks per cycle. The setup takes three cranks.
    c.queueToVatRoot('left', 'startPromise', [kslot(rightKref)], 'ignore');
  } else if (mode === 'computrons') {
    // Use doMessage() like above, but once every 10 cycles, do enough extra
    // CPU to trigger a computron-limiting policy.
    c.queueToVatRoot('left', 'doMessage', [kslot(rightKref), 0], 'ignore');
  } else {
    throw Error(`unknown mode ${mode}`);
  }

  let oldCrankNum = parseInt(kernelStorage.kvStore.get('crankNumber'), 10);
  function elapsedCranks() {
    const newCrankNum = parseInt(kernelStorage.kvStore.get('crankNumber'), 10);
    const elapsed = newCrankNum - oldCrankNum;
    oldCrankNum = newCrankNum;
    return elapsed;
  }

  let more;

  if (mode === 'messages' || mode === 'resolutions') {
    more = await c.run(crankCounter(15, 0, true));
    t.truthy(more, 'vat was supposed to run forever');
    t.is(elapsedCranks(), 15);

    more = await c.run(crankCounter(2, 0, true));
    t.truthy(more, 'vat was supposed to run forever');
    t.is(elapsedCranks(), 2);

    more = await c.run(crankCounter(16, 0, true));
    t.truthy(more, 'vat was supposed to run forever');
    t.is(elapsedCranks(), 16);
  } else if (mode === 'computrons') {
    // the doMessage cycle has four steps:
    // 1: normal delivery (122k-134k computrons)
    // 2: notify (22k computrons)
    // 3: normal delivery
    // 4: notify

    // and takes about 300k per cycle. But every 5th time we do step 3, it
    // does an extra 5.7M computrons. The cumulative computron count just
    // before that point should be about 1.3M, and after should be 7M, so by
    // setting a threshold of 4M, we should finish c.run() just after that
    // extra-compute step.
    await c.run(computronCounter(4_000_000n));
    t.is(elapsedCranks(), 35);
    const ckey = `${rightID}.vs.vc.1.sseqnum`;
    const seqnum = JSON.parse(kernelStorage.kvStore.get(ckey));
    t.deepEqual(seqnum, kser(5));
  } else if (mode === 'wallclock') {
    const startMS = Date.now();
    // On an idle system, this does about 120 cranks per second when run
    // alone. When the rest of test-run-policy.js is running in parallel, it
    // does about 100 cps.
    more = await c.run(wallClockWaiter(1.0));
    t.truthy(more, 'vat was supposed to run forever');
    const elapsedMS = Date.now() - startMS;
    const elapsed = elapsedMS / 1000;
    // console.log(`elapsed`, elapsed, more);
    t.true(elapsed < 200.0, `time distort: ${elapsed} >= 200.0s`);
  }
}

test('run policy - cranks - messages', async t => testCranks(t, 'messages'));
test('run policy - cranks - resolutions', async t =>
  testCranks(t, 'resolutions'));
test('run policy - computrons', async t => testCranks(t, 'computrons'));
test('run policy - wallclock', async t => testCranks(t, 'wallclock'));
