// @ts-check
import test from 'ava';

import { makeHeapZone } from '@agoric/base-zone/heap.js';

import { prepareVowTools } from '../src/tools.js';

test('allVows waits for a single vow to complete', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseP = Promise.resolve('promise');
  const vowA = when(watch(testPromiseP));

  const result = await when(allVows([vowA]));
  t.is(result.length, 1);
  t.is(result[0], 'promise');
});

test('allVows waits for an array of vows to complete', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseAP = Promise.resolve('promiseA');
  const testPromiseBP = Promise.resolve('promiseB');
  const testPromiseCP = Promise.resolve('promiseC');
  const vowA = when(watch(testPromiseAP));
  const vowB = when(watch(testPromiseBP));
  const vowC = when(watch(testPromiseCP));

  const result = await when(allVows([vowA, vowB, vowC]));
  t.is(result.length, 3);
  t.like(result, ['promiseA', 'promiseB', 'promiseC']);
});

test('allVows returns vows in order', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows, makeVowKit } = prepareVowTools(zone);
  const kit = makeVowKit();

  const testPromiseAP = Promise.resolve('promiseA');
  const testPromiseBP = Promise.resolve('promiseB');
  const vowA = when(watch(testPromiseAP));
  const vowB = when(watch(testPromiseBP));
  const vowC = when(watch(kit.vow));

  // test promise A and B should already be resolved.
  kit.resolver.resolve('promiseC');

  const result = await when(allVows([vowA, vowC, vowB]));
  t.is(result.length, 3);
  t.like(result, ['promiseA', 'promiseC', 'promiseB']);
});

test('allVows rejects upon first rejection', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseAP = Promise.resolve('promiseA');
  const testPromiseBP = Promise.reject(Error('rejectedA'));
  const testPromiseCP = Promise.reject(Error('rejectedB'));
  const vowA = when(watch(testPromiseAP));
  const vowB = when(watch(testPromiseBP));
  const vowC = when(watch(testPromiseCP));

  const watcher = zone.exo('RejectionWatcher', undefined, {
    onRejected(e) {
      t.is(e.message, 'rejectedA');
    },
  });

  await when(watch(allVows([vowA, vowB, vowC]), watcher));
});

test('allVows can accept vows awaiting other vows', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseAP = Promise.resolve('promiseA');
  const testPromiseBP = Promise.resolve('promiseB');
  const vowA = when(watch(testPromiseAP));
  const vowB = when(watch(testPromiseBP));
  const resultA = allVows([vowA, vowB]);

  const testPromiseCP = Promise.resolve('promiseC');
  const vowC = when(watch(testPromiseCP));
  const resultB = await when(allVows([resultA, vowC]));

  t.is(resultB.length, 2);
  t.like(resultB, [['promiseA', 'promiseB'], 'promiseC']);
});
