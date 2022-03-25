// @ts-check

import { test } from './prepare-test-env-ava.js';
import { makeNotifierKit } from '../src/index.js';
import '../src/types.js';

test('notifier - initial state', async t => {
  /** @type {NotifierRecord<1>} */
  const { notifier, updater } = makeNotifierKit();
  updater.updateState(1);

  const updateDeNovo = await notifier.getUpdateSince();
  const updateFromNonExistent = await notifier.getUpdateSince();

  t.is(updateDeNovo.value, 1, 'state is one');
  t.deepEqual(updateDeNovo, updateFromNonExistent, 'no param same as unknown');
});

test('notifier - single update', async t => {
  t.plan(3);
  /** @type {NotifierRecord<number>} */
  const { notifier, updater } = makeNotifierKit();
  updater.updateState(1);

  const updateDeNovo = await notifier.getUpdateSince();
  t.is(updateDeNovo.value, 1, 'initial state is one');

  const updateInWaiting = notifier.getUpdateSince(updateDeNovo.updateCount);
  const all = Promise.all([updateInWaiting]).then(([update]) => {
    t.is(update.value, 3, 'updated state is eventually three');
  });

  const update2 = await notifier.getUpdateSince();
  t.is(update2.value, 1);
  updater.updateState(3);
  await all;
});

test('notifier - initial update', async t => {
  t.plan(3);
  /** @type {NotifierRecord<number>} */
  const { notifier, updater } = makeNotifierKit(1);

  const updateDeNovo = await notifier.getUpdateSince();
  t.is(updateDeNovo.value, 1, 'initial state is one');

  const updateInWaiting = notifier.getUpdateSince(updateDeNovo.updateCount);
  const all = Promise.all([updateInWaiting]).then(([update]) => {
    t.is(update.value, 3, 'updated state is eventually three');
  });

  const update2 = await notifier.getUpdateSince();
  t.is(update2.value, 1);
  updater.updateState(3);
  await all;
});

test('notifier - update after state change', async t => {
  t.plan(5);
  const { notifier, updater } = makeNotifierKit(1);

  const updateDeNovo = await notifier.getUpdateSince();

  const updateInWaiting = notifier.getUpdateSince(updateDeNovo.updateCount);
  t.is(updateDeNovo.value, 1, 'first state check (1)');
  const all = Promise.all([updateInWaiting]).then(([update1]) => {
    t.is(update1.value, 3, '4th check (delayed) 3');
    const thirdStatePromise = notifier.getUpdateSince(update1.updateCount);
    Promise.all([thirdStatePromise]).then(([update2]) => {
      t.is(update2.value, 5, '5th check (delayed) 5');
    });
  });

  t.is((await notifier.getUpdateSince()).value, 1, '2nd check (1)');
  updater.updateState(3);

  t.is((await notifier.getUpdateSince()).value, 3, '3rd check (3)');
  updater.updateState(5);
  await all;
});

test('notifier - final state', async t => {
  t.plan(6);
  /** @type {NotifierRecord<number | string>} */
  const { notifier, updater } = makeNotifierKit(1);

  const updateDeNovo = await notifier.getUpdateSince();
  const updateInWaiting = notifier.getUpdateSince(updateDeNovo.updateCount);
  t.is(updateDeNovo.value, 1, 'initial state is one');
  const all = Promise.all([updateInWaiting]).then(([update]) => {
    t.is(update.value, 'final', 'state is "final"');
    t.falsy(update.updateCount, 'no handle after close');
    const postFinalUpdate = notifier.getUpdateSince(update.updateCount);
    Promise.all([postFinalUpdate]).then(([after]) => {
      t.is(after.value, 'final', 'stable');
      t.falsy(after.updateCount, 'no handle after close');
    });
  });

  const invalidHandle = await notifier.getUpdateSince();
  t.is(invalidHandle.value, 1, 'still one');
  updater.finish('final');
  await all;
});
