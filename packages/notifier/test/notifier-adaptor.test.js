import { test } from './prepare-test-env-ava.js';

import {
  makeAsyncIterableFromNotifier,
  makeNotifierFromAsyncIterable,
  observeIteration,
  observeNotifier,
} from '../src/index.js';
import {
  finiteStream,
  explodingStream,
  testEnding,
  testManualConsumer,
  testAutoConsumer,
  makeTestIterationObserver,
} from './iterable-testing-tools.js';

// /////////////// Self test the testing tools for consistency /////////////////

test('async iterator - manual finishes', async t => {
  const p = testManualConsumer(t, finiteStream, false);
  return testEnding(t, p, false);
});

test('async iterator - manual fails', async t => {
  const p = testManualConsumer(t, explodingStream, false);
  return testEnding(t, p, true);
});

test('async iterator - for await finishes', async t => {
  const p = testAutoConsumer(t, finiteStream, false);
  return testEnding(t, p, false);
});

test('async iterator - for await fails', async t => {
  const p = testAutoConsumer(t, explodingStream, false);
  return testEnding(t, p, true);
});

test('observeIteration - update from iterator finishes', async t => {
  const u = makeTestIterationObserver(t, false, false);
  return observeIteration(finiteStream, u);
});

test('observeIteration - update from iterator fails', async t => {
  const u = makeTestIterationObserver(t, false, true);
  return observeIteration(explodingStream, u);
});

test('observeIteration - synchronous throw from observer stops hard', async t => {
  t.plan(2);
  await t.throwsAsync(
    async () =>
      observeIteration(finiteStream, {
        updateState: state => {
          t.is(state, 1);
          throw Error('sync propagates');
        },
        finish: state => {
          t.fail(`unexpected finish with state ${state}`);
        },
        fail: reason => {
          // @ts-expect-error cast
          t.is(reason.message, 'sync propagates');
        },
      }),
    { message: 'sync propagates' },
  );
});

test('observeIteration - rejection from observer does nothing', async t => {
  const u = makeTestIterationObserver(t, true, false);
  const handledRejection = async reason => {
    const r = Promise.reject(reason);
    r.catch(() => {});
    return r;
  };
  await observeIteration(finiteStream, {
    ...u,
    updateState: async state => {
      u.updateState(state);
      return handledRejection(
        Error('updateState rejection does not propagate'),
      );
    },
    finish: async state => {
      u.finish(state);
      return handledRejection(Error('finish rejection does not propagate'));
    },
    fail: async reason => {
      u.fail(reason);
      return handledRejection(Error('fail rejection does not propagate'));
    },
  });
});

// /////////////////////////////// NotifierKit /////////////////////////////////

test('notifier adaptor - manual finishes', async t => {
  const n = makeNotifierFromAsyncIterable(finiteStream);
  const finiteUpdates = makeAsyncIterableFromNotifier(n);
  const p = testManualConsumer(t, finiteUpdates, true);
  return testEnding(t, p, false);
});

test('notifier adaptor - manual fails', async t => {
  const n = makeNotifierFromAsyncIterable(explodingStream);
  const explodingUpdates = makeAsyncIterableFromNotifier(n);
  const p = testManualConsumer(t, explodingUpdates, true);
  return testEnding(t, p, true);
});

test('notifier adaptor - for await finishes', async t => {
  const n = makeNotifierFromAsyncIterable(finiteStream);
  const finiteUpdates = makeAsyncIterableFromNotifier(n);
  const p = testAutoConsumer(t, finiteUpdates, true);
  return testEnding(t, p, false);
});

test('notifier adaptor - for await fails', async t => {
  const n = makeNotifierFromAsyncIterable(explodingStream);
  const explodingUpdates = makeAsyncIterableFromNotifier(n);
  const p = testAutoConsumer(t, explodingUpdates, true);
  return testEnding(t, p, true);
});

test('notifier adaptor - update from notifier finishes', async t => {
  const u = makeTestIterationObserver(t, true, false);
  const n = makeNotifierFromAsyncIterable(finiteStream);
  return observeNotifier(n, u);
});

test('notifier adaptor - update from notifier fails', async t => {
  const u = makeTestIterationObserver(t, true, true);
  const n = makeNotifierFromAsyncIterable(explodingStream);
  return observeNotifier(n, u);
});
