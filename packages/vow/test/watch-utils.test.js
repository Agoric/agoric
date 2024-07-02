// @ts-check
import test from 'ava';

import { makeHeapZone } from '@agoric/base-zone/heap.js';

import { prepareVowTools } from '../src/tools.js';

test('allVows waits for a single vow to complete', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseP = Promise.resolve('promise');
  const vowA = watch(testPromiseP);

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
  const vowA = watch(testPromiseAP);
  const vowB = watch(testPromiseBP);
  const vowC = watch(testPromiseCP);

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
  const vowA = watch(testPromiseAP);
  const vowB = watch(testPromiseBP);
  const vowC = watch(kit.vow);

  // test promie A and B should already be resolved.
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
  const vowA = watch(testPromiseAP);
  const vowB = watch(testPromiseBP);
  const vowC = watch(testPromiseCP);

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
  const vowA = watch(testPromiseAP);
  const vowB = watch(testPromiseBP);
  const resultA = allVows([vowA, vowB]);

  const testPromiseCP = Promise.resolve('promiseC');
  const vowC = when(watch(testPromiseCP));
  const resultB = await when(allVows([resultA, vowC]));

  t.is(resultB.length, 2);
  t.like(resultB, [['promiseA', 'promiseB'], 'promiseC']);
});

test('allVows - works with just promises', async t => {
  const zone = makeHeapZone();
  const { when, allVows } = prepareVowTools(zone);

  const result = await when(
    allVows([Promise.resolve('promiseA'), Promise.resolve('promiseB')]),
  );
  t.is(result.length, 2);
  t.like(result, ['promiseA', 'promiseB']);
});

test('allVows - watch promises mixed with vows', async t => {
  const zone = makeHeapZone();
  const { watch, when, allVows } = prepareVowTools(zone);

  const testPromiseP = Promise.resolve('vow');
  const vowA = watch(testPromiseP);

  const result = await when(allVows([vowA, Promise.resolve('promise')]));
  t.is(result.length, 2);
  t.like(result, ['vow', 'promise']);
});

test('asPromise converts a vow to a promise', async t => {
  const zone = makeHeapZone();
  const { watch, asPromise } = prepareVowTools(zone);

  const testPromiseP = Promise.resolve('test value');
  const vow = watch(testPromiseP);

  const result = await asPromise(vow);
  t.is(result, 'test value');
});

test('asPromise handles vow rejection', async t => {
  const zone = makeHeapZone();
  const { watch, asPromise } = prepareVowTools(zone);

  const testPromiseP = Promise.reject(new Error('test error'));
  const vow = watch(testPromiseP);

  await t.throwsAsync(asPromise(vow), { message: 'test error' });
});

test('asPromise accepts and resolves promises', async t => {
  const zone = makeHeapZone();
  const { asPromise } = prepareVowTools(zone);

  const p = Promise.resolve('a promise');
  const result = await asPromise(p);
  t.is(result, 'a promise');
});

test('asPromise handles watcher arguments', async t => {
  const zone = makeHeapZone();
  const { watch, asPromise } = prepareVowTools(zone);

  const testPromiseP = Promise.resolve('watcher test');
  const vow = watch(testPromiseP);

  let watcherCalled = false;
  const watcher = {
    onFulfilled(value, ctx) {
      watcherCalled = true;
      t.is(value, 'watcher test');
      t.deepEqual(ctx, ['ctx']);
      return value;
    },
  };

  const result = await asPromise(vow, watcher, ['ctx']);
  t.is(result, 'watcher test');
  t.true(watcherCalled);
});
