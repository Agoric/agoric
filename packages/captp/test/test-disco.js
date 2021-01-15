import '@agoric/install-ses';
import { Remotable } from '@agoric/marshal';
import test from 'ava';
import { E, makeCapTP } from '../lib/captp';

test('try disconnecting captp', async t => {
  const objs = [];
  const rejected = [];
  const { getBootstrap, abort } = makeCapTP(
    'us',
    obj => objs.push(obj),
    // TODO Can we avoid the function wrapper? makeCapTP does the needed test
    () =>
      Remotable('Alleged: test hello', undefined, {
        method() {
          return 'hello';
        },
      }),
    {
      onReject(e) {
        rejected.push(e);
      },
    },
  );
  t.deepEqual(objs, [], 'expected no messages');
  const bs = getBootstrap();
  const ps = [];
  ps.push(
    t.throwsAsync(
      E.G(bs).prop,
      { instanceOf: Error },
      'rejected get after disconnect',
    ),
  );
  ps.push(
    t.throwsAsync(
      E(bs).method(),
      { instanceOf: Error },
      'rejected method after disconnect',
    ),
  );
  t.deepEqual(
    objs,
    [{ type: 'CTP_BOOTSTRAP', questionID: 1, epoch: 0 }],
    'expected bootstrap messages',
  );
  ps.push(
    t.throwsAsync(bs, { instanceOf: Error }, 'rejected after disconnect'),
  );
  abort();
  await t.throwsAsync(
    getBootstrap(),
    { instanceOf: Error },
    'rejected disconnected bootstrap',
  );
  t.deepEqual(
    objs,
    [
      { type: 'CTP_BOOTSTRAP', questionID: 1, epoch: 0 },
      { type: 'CTP_DISCONNECT', reason: undefined, epoch: 0 },
    ],
    'expected clean disconnect',
  );
  await Promise.all(ps);
});

test('try aborting captp with reason', async t => {
  const objs = [];
  const rejected = [];
  const { getBootstrap, abort } = makeCapTP(
    'us',
    obj => objs.push(obj),
    // TODO Can we avoid the function wrapper? makeCapTP does the needed test
    () =>
      Remotable('Alleged: test hello', undefined, {
        method() {
          return 'hello';
        },
      }),
    {
      onReject(e) {
        rejected.push(e);
      },
    },
  );
  t.deepEqual(objs, [], 'expected no messages');
  const bs = getBootstrap();
  const ps = [];
  ps.push(
    t.throwsAsync(
      E.G(bs).prop,
      { instanceOf: Error },
      'rejected get after disconnect',
    ),
  );
  ps.push(
    t.throwsAsync(
      E(bs).method(),
      { instanceOf: Error },
      'rejected method after disconnect',
    ),
  );
  t.deepEqual(
    objs,
    [{ type: 'CTP_BOOTSTRAP', questionID: 1, epoch: 0 }],
    'expected bootstrap messages',
  );
  ps.push(
    t.throwsAsync(bs, { instanceOf: Error }, 'rejected after disconnect'),
  );
  const aborted = {
    type: 'CTP_DISCONNECT',
    reason: Error('something'),
    epoch: 0,
  };
  abort(aborted.reason);
  await t.throwsAsync(
    getBootstrap(),
    { instanceOf: Error },
    'rejected disconnected bootstrap',
  );
  t.deepEqual(
    objs,
    [{ type: 'CTP_BOOTSTRAP', questionID: 1, epoch: 0 }, aborted],
    'expected unclean disconnect',
  );
  await Promise.all(ps);
  t.deepEqual(rejected, [aborted.reason], 'error disconnect');
});
