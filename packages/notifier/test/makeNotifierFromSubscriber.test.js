import { test } from './prepare-test-env-ava.js';

import {
  makePublishKit,
  makeNotifierFromSubscriber,
  makeNotifierKit,
} from '../src/index.js';
import {
  delayByTurns,
  invertPromiseSettlement,
} from './iterable-testing-tools.js';

/** @param {{conclusionMethod: 'finish' | 'fail', conclusionValue: any}} config */
const makeBatchPublishKit = ({ conclusionMethod, conclusionValue }) => {
  const { publisher, subscriber } = makePublishKit();

  // Publish in power-of-two batches: [1], [2], [3, 4], [5, 6, 7, 8], ...
  let nextValue = 1;
  let nextBatchSize = 1;
  let done = false;
  const initialize = () => {
    publisher.publish(nextValue);
    nextValue += 1;
  };
  const publishNextBatch = () => {
    if (done) {
      return;
    }
    for (let i = 0; i < nextBatchSize; i += 1) {
      publisher.publish(nextValue);
      nextValue += 1;
    }
    nextBatchSize *= 2;
    if (nextValue > 64) {
      done = true;
      if (conclusionMethod === 'fail') {
        publisher.fail(conclusionValue);
      } else {
        publisher.finish(conclusionValue);
      }
    }
  };

  return { initialize, publishNextBatch, subscriber };
};

test('makeNotifierFromSubscriber(finishes) - for-await-of iteration', async t => {
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'finish',
    conclusionValue: 'done',
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  initialize();

  const results = [];
  for await (const result of notifier) {
    results.push(result);
    publishNextBatch();
  }

  t.deepEqual(
    results,
    [1, 2, 4, 8, 16, 32],
    'only the last of values published between iteration steps should be observed',
  );
});

test('makeNotifierFromSubscriber(finishes) - getUpdateSince', async t => {
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'finish',
    conclusionValue: 'done',
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  initialize();

  const results = [];
  let updateCount;
  while (true) {
    const result = await notifier.getUpdateSince(updateCount);
    ({ updateCount } = result);
    results.push(result.value);
    t.deepEqual(await notifier.getUpdateSince(), result);
    if (updateCount === undefined) {
      break;
    }
    await publishNextBatch();
  }

  t.deepEqual(
    results,
    [1, 2, 4, 8, 16, 32, 'done'],
    'only the last of values published between iteration steps should be observed',
  );
  t.deepEqual(await notifier.getUpdateSince(), {
    value: 'done',
    updateCount: undefined,
  });
});

test('makeNotifierFromSubscriber(fails) - for-await-of iteration', async t => {
  const failure = Error('failure');
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'fail',
    conclusionValue: failure,
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  initialize();

  const results = [];
  try {
    for await (const result of notifier) {
      results.push(result);
      publishNextBatch();
    }
    throw Error('for-await-of completed successfully');
  } catch (err) {
    t.is(err, failure, 'for-await-of should throw the failure value');
  }

  t.deepEqual(
    results,
    [1, 2, 4, 8, 16, 32],
    'only the last of values published between iteration steps should be observed',
  );
});

test('makeNotifierFromSubscriber(fails) - getUpdateSince', async t => {
  const failure = Error('failure');
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'fail',
    conclusionValue: failure,
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  initialize();

  const results = [];
  let updateCount;
  try {
    while (true) {
      const result = await notifier.getUpdateSince(updateCount);
      ({ updateCount } = result);
      results.push(result.value);
      t.deepEqual(await notifier.getUpdateSince(), result);
      if (updateCount === undefined) {
        break;
      }
      await publishNextBatch();
    }
    throw Error('for-await-of completed successfully');
  } catch (err) {
    t.is(err, failure, 'await should throw the failure value');
  }

  t.deepEqual(
    results,
    [1, 2, 4, 8, 16, 32],
    'only the last of values published between iteration steps should be observed',
  );
  await t.throwsAsync(async () => notifier.getUpdateSince(), { is: failure });
});

test('makeNotifierKit - getUpdateSince timing', async t => {
  const { notifier, updater } = makeNotifierKit();
  const results = [];
  const firstP = notifier.getUpdateSince();
  void firstP.then(_ => results.push('first'));

  await delayByTurns(2);
  t.deepEqual(results, [], 'no results yet');
  updater.updateState('first');
  await delayByTurns(2);
  t.deepEqual(results, ['first'], 'first promise should resolve');
});

test('makeNotifierFromSubscriber - getUpdateSince timing', async t => {
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'finish',
    conclusionValue: 'done',
  });
  const notifier = makeNotifierFromSubscriber(subscriber);

  const sequence = [];
  const firstP = notifier.getUpdateSince();
  void firstP.then(_ => sequence.push('resolve firstP'));
  const firstP2 = notifier.getUpdateSince();
  void firstP2.then(_ => sequence.push('resolve firstP2'));

  await delayByTurns(2);
  t.deepEqual(
    sequence,
    [],
    'getUpdateSince() should not settle before a value is published',
  );

  initialize();
  await delayByTurns(2);
  t.deepEqual(
    sequence,
    ['resolve firstP', 'resolve firstP2'],
    'getUpdateSince() should settle after a value is published',
  );

  publishNextBatch();
  t.like(
    await Promise.all([firstP, firstP2]),
    { ...[{ value: 1 }, { value: 1 }], length: 2 },
    'early getUpdateSince() should settle to the first result',
  );
  t.like(
    await notifier.getUpdateSince(),
    { value: 2 },
    'getUpdateSince() should settle to the latest result',
  );

  publishNextBatch();
  const lateResult = await notifier.getUpdateSince();
  t.like(
    lateResult,
    { value: 4 },
    'getUpdateSince() should settle to a just-published result',
  );

  const pendingResultP = notifier.getUpdateSince(lateResult.updateCount);
  publishNextBatch();
  t.like(
    await Promise.all([
      pendingResultP,
      notifier.getUpdateSince(),
      notifier.getUpdateSince(),
    ]),
    { ...[{ value: 8 }, { value: 8 }, { value: 8 }], length: 3 },
    'getUpdateSince(latestUpdateCount) should settle to the next result',
  );

  publishNextBatch();
  publishNextBatch();
  t.like(
    await notifier.getUpdateSince(lateResult.updateCount),
    { value: 32 },
    'getUpdateSince(oldUpdateCount) should settle to the latest result',
  );
});

test('makeNotifierFromSubscriber - updateCount validation', async t => {
  const { subscriber } = makeBatchPublishKit({
    conclusionMethod: 'finish',
    conclusionValue: 'done',
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  await t.throwsAsync(async () => notifier.getUpdateSince(1n));
});

test('makeNotifierFromSubscriber - getUpdateSince() result identity', async t => {
  const { initialize, publishNextBatch, subscriber } = makeBatchPublishKit({
    conclusionMethod: 'finish',
    conclusionValue: 'done',
  });
  const notifier = makeNotifierFromSubscriber(subscriber);
  const firstP = notifier.getUpdateSince();
  const firstP2 = notifier.getUpdateSince();
  t.not(firstP, firstP2, 'early getUpdateSince() promises should be distinct');

  initialize();
  const [firstResult, firstResult2] = await Promise.all([firstP, firstP2]);
  let { updateCount } = firstResult;
  t.deepEqual(
    new Set([
      firstResult,
      firstResult2,
      ...(await Promise.all([
        notifier.getUpdateSince(),
        notifier.getUpdateSince(),
      ])),
      await notifier.getUpdateSince(),
    ]),
    new Set([firstResult]),
    'first results should be identical',
  );

  const secondP = notifier.getUpdateSince(updateCount);
  const secondP2 = notifier.getUpdateSince(updateCount);
  t.not(
    secondP,
    secondP2,
    'getUpdateSince(updateCount) promises should be distinct',
  );

  publishNextBatch();
  const [secondResult, secondResult2] = await Promise.all([secondP, secondP2]);
  t.deepEqual(
    new Set([
      secondResult,
      secondResult2,
      ...(await Promise.all([
        notifier.getUpdateSince(),
        notifier.getUpdateSince(updateCount),
      ])),
      await notifier.getUpdateSince(),
    ]),
    new Set([secondResult]),
    'late results should be identical',
  );

  t.not(
    notifier.getUpdateSince(),
    notifier.getUpdateSince(),
    'late getUpdateSince() promises should be distinct',
  );
  t.not(
    notifier.getUpdateSince(),
    notifier.getUpdateSince(updateCount),
    'getUpdateSince() promises should be distinct from getUpdateSince(updateCount) promises',
  );

  let previousResult = secondResult;
  let finalResultP;
  let finalResult;
  while (updateCount) {
    finalResultP = notifier.getUpdateSince(updateCount);
    publishNextBatch();
    finalResult = await finalResultP;
    ({ updateCount } = finalResult);
    if (updateCount) {
      previousResult = finalResult;
    }
  }
  t.deepEqual(
    new Set([
      finalResult,
      ...(await Promise.all([
        notifier.getUpdateSince(),
        notifier.getUpdateSince(updateCount),
      ])),
      await notifier.getUpdateSince(previousResult.updateCount),
      await notifier.getUpdateSince(),
    ]),
    new Set([finalResult]),
    'final results should be identical',
  );

  const { publisher, subscriber: failureSubscriber } = makePublishKit();
  const failureNotifier = makeNotifierFromSubscriber(failureSubscriber);
  publisher.publish('first value');
  ({ updateCount } = await failureNotifier.getUpdateSince());
  const failureP = failureNotifier.getUpdateSince();
  const failureP2 = failureNotifier.getUpdateSince();
  const failure = Error('failure');
  publisher.fail(failure);
  t.deepEqual(
    new Set(
      await Promise.all(
        [
          failureP,
          failureP2,
          failureNotifier.getUpdateSince(),
          failureNotifier.getUpdateSince(updateCount),
          failureNotifier.getUpdateSince(),
        ].map(invertPromiseSettlement),
      ),
    ),
    new Set([failure]),
    'failure results should be identical',
  );
});
