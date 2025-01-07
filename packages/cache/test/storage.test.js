// Must be first to set up globals
import '@agoric/zoe/tools/prepare-test-env.js';

import test from 'ava';
import { makeChainStorageRoot } from '@agoric/internal/src/lib-chainStorage.js';

import { Far, makeMarshal } from '@endo/marshal';
import { M } from '@agoric/store';
import { makeCache } from '../src/cache.js';
import { makeChainStorageCoordinator } from '../src/store.js';

const makeSimpleMarshaller = () => {
  const vals = [];
  const fromVal = val => {
    vals.push(val);
    return vals.length - 1;
  };
  const toVal = slot => vals[slot];
  return makeMarshal(fromVal, toVal, {
    serializeBodyFormat: 'smallcaps',
    marshalSaveError: err => {
      throw err;
    },
  });
};
harden(makeSimpleMarshaller);

const setup = () => {
  const storageNodeState = {};
  const chainStorage = makeChainStorageRoot(
    Far('ToStorage', message => {
      assert(message.method === 'set');
      assert(message.args.length === 1);
      const [[path, value]] = message.args;
      assert(path === 'cache');
      storageNodeState.cache = value;
    }),
    'cache',
  );
  const cache = makeCache(
    makeChainStorageCoordinator(chainStorage, makeSimpleMarshaller()),
  );
  return { cache, storageNodeState };
};

test('makeChainStorageCoordinator with non-remote values', async t => {
  const { cache, storageNodeState } = setup();

  t.is(await cache('brandName', 'barbosa'), 'barbosa');
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"brandName\\"","slots":[]}': {
      body: '#{"generation":"+1","value":"barbosa"}',
      slots: [],
    },
  });

  // One-time initialization (of 'frotz')
  t.is(await cache('frotz', 'default'), 'default');
  const afterFirstFrotz = {
    '{"body":"#\\"brandName\\"","slots":[]}': {
      body: '#{"generation":"+1","value":"barbosa"}',
      slots: [],
    },
    '{"body":"#\\"frotz\\"","slots":[]}': {
      body: '#{"generation":"+1","value":"default"}',
      slots: [],
    },
  };
  t.deepEqual(JSON.parse(storageNodeState.cache), afterFirstFrotz);
  // no change
  t.is(await cache('frotz', 'ignored'), 'default');
  t.deepEqual(JSON.parse(storageNodeState.cache), afterFirstFrotz);

  // cache more complex Passable
  const complexPassable = {
    str: 'string',
    big: 1n,
    num: 53,
    arr: ['hi', 'there'],
  };
  t.deepEqual(
    await cache(['complex', 'passable'], complexPassable),
    complexPassable,
  );
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    ...afterFirstFrotz,
    '{"body":"#[\\"complex\\",\\"passable\\"]","slots":[]}': {
      body: '#{"generation":"+1","value":{"arr":["hi","there"],"big":"+1","num":53,"str":"string"}}',
      slots: [],
    },
  });
});

test('makeChainStorageCoordinator with remote values', async t => {
  const { cache, storageNodeState } = setup();

  const farThing = Far('farThing', { getAllegedName: () => 'dollaz' });

  t.is(await cache('brand', farThing), farThing);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"brand\\"","slots":[]}': {
      body: '#{"generation":"+1","value":"$0.Alleged: farThing"}',
      slots: [0],
    },
  });
});

test('makeChainStorageCoordinator with updater', async t => {
  const { cache, storageNodeState } = setup();

  const increment = async (counter = 0) => Promise.resolve(counter + 1);

  // Initial
  t.is(await cache('counter', increment), 1);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+1","value":1}',
      slots: [],
    },
  });

  // Again without a pattern
  t.is(await cache('counter', increment), 1);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+1","value":1}',
      slots: [],
    },
  });

  // Again with a matching pattern
  t.is(await cache('counter', increment, M.any()), 2);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+2","value":2}',
      slots: [],
    },
  });
});

test('makeChainStorageCoordinator with remote updater', async t => {
  const { cache, storageNodeState } = setup();

  let counter = 0;
  const counterObj = Far('counterObj', {
    increment: () => {
      return (counter += 1);
    },
  });

  // Initial
  t.is(await cache('counter', counterObj.increment), 1);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+1","value":1}',
      slots: [],
    },
  });

  // Again without a pattern, doesn't increment
  t.is(await cache('counter', counterObj.increment), 1);
  t.is(counter, 1);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+1","value":1}',
      slots: [],
    },
  });

  // Again with a matching pattern
  t.is(await cache('counter', counterObj.increment, M.any()), 2);
  t.is(counter, 2);
  t.deepEqual(Object.keys(storageNodeState), ['cache']);
  t.deepEqual(JSON.parse(storageNodeState.cache), {
    '{"body":"#\\"counter\\"","slots":[]}': {
      body: '#{"generation":"+2","value":2}',
      slots: [],
    },
  });
});
