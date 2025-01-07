// @ts-check
import test from 'ava';

import { makeFakeStorageKit } from '../src/storage-test-utils.js';
import { HIGH_PRIORITY_SENDERS } from '../src/chain-storage-paths.js';
import { makePrioritySendersManager } from '../src/priority-senders.js';
import { eventLoopIteration as writesSettled } from '../src/testing-utils.js';

test('basic', async t => {
  const storage = makeFakeStorageKit(HIGH_PRIORITY_SENDERS, {
    sequence: false,
  });
  const manager = makePrioritySendersManager(storage.rootNode);

  const nodeEquals = async (
    /** @type {string} */ address,
    /** @type {string | undefined} */ val,
  ) => {
    await writesSettled();
    const key = `${HIGH_PRIORITY_SENDERS}.${address}`;
    t.deepEqual(storage.data.get(key), val);
  };

  await manager.add('oracles', 'agoric1a');
  await nodeEquals('agoric1a', 'oracles');

  await manager.remove('oracles', 'agoric1a');
  await nodeEquals('agoric1a', undefined);

  await manager.add('oracles', 'agoric1a');
  await nodeEquals('agoric1a', 'oracles');
  await manager.add('ec', 'agoric1a');
  await nodeEquals('agoric1a', 'ec,oracles');

  await manager.add('oracles', 'agoric1b');
  await nodeEquals('agoric1b', 'oracles');

  await manager.remove('oracles', 'agoric1a');
  await nodeEquals('agoric1a', 'ec');
});

test('errors', async t => {
  const storage = makeFakeStorageKit(HIGH_PRIORITY_SENDERS, {
    sequence: false,
  });
  const manager = makePrioritySendersManager(storage.rootNode);

  t.throws(async () => manager.remove('oracles', 'agoric1a'), {
    message: 'address not registered: "agoric1a"',
  });

  await manager.add('oracles', 'agoric1a');
  t.throws(async () => manager.remove('unknown', 'agoric1a'), {
    message: 'namespace "unknown" does not have address "agoric1a"',
  });

  await t.throwsAsync(manager.add('oracles', 'agoric1a'), {
    message: 'namespace "oracles" already has address "agoric1a"',
  });
});

test('normalization', async t => {
  const storage = makeFakeStorageKit(HIGH_PRIORITY_SENDERS, {
    sequence: false,
  });
  const manager = makePrioritySendersManager(storage.rootNode);

  await manager.add('something with spaces', 'addr');
  await manager.add('something with spaces and ()', 'addr');
  await manager.add('this,has,commas,', 'addr');

  await writesSettled();
  t.is(
    storage.data.get(`${HIGH_PRIORITY_SENDERS}.addr`),
    'something_with_spaces,something_with_spaces_and___,this_has_commas_',
  );
});
