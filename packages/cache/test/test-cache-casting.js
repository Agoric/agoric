// @ts-nocheck
// eslint-disable-next-line import/order
import { test } from '@agoric/casting/test/prepare-test-env-ava.js';

import { delay, makeLeader, makeCastingSpec } from '@agoric/casting';
import { startFakeServer } from '@agoric/casting/test/fake-rpc-server.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeFakeMarshaller } from '@agoric/notifier/tools/testSupports.js';
import { E } from '@endo/far';
import { makeCastingClientCoordinator } from '../src/store.js';

// eslint-disable-next-line import/no-extraneous-dependencies -- XXX
import { makeCache } from '../src/cache.js';

test.before(t => {
  t.context.cleanups = [];
  t.context.startServer = startFakeServer;
});

test.after(t => {
  // Populated by fake-rpc-server
  t.context.cleanups.map(cleanup => cleanup());
});

test('cache read', async t => {
  const initialCache = { price: 1n };
  const marshaller = makeFakeMarshaller();
  const PORT = await t.context.startServer(
    t,
    [initialCache, initialCache],
    marshaller,
  );

  // The rest of this test is taken almost verbatim from the README.md, with
  // some minor modifications (testLeaderOptions and deepEqual).
  const leader = await makeLeader(`http://localhost:${PORT}/network-config`, {
    retryCallback: null, // fail fast, no retries
    keepPolling: () =>
      delay(200).then(() => {
        console.log('keepPolling cb');
        return true;
      }), // poll really quickly
    jitter: null, // no jitter
  });

  const castingSpec = makeCastingSpec(':mailbox.agoric1foobarbaz');
  const coordinator = makeCastingClientCoordinator(
    leader,
    castingSpec,
    {
      proof: 'none',
      unserializer: marshaller,
    },
    t.log,
  );
  const cache = await makeCache(coordinator);

  t.is(await cache('absent'), undefined);
  t.is(await cache('price'), initialCache.price);
  t.is(await cache('price'), initialCache.price);
  // TODO update cache state
});
