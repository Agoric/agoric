import { test } from '../../tools/prepare-test-env-ava.js';

// eslint-disable-next-line import/order
import { kunser } from '@agoric/kmarshal';
import { loadBasedir, buildVatController } from '../../src/index.js';

const expected = [
  ['B good', 'C good', 'F good', 'three good', 'exit good', 'exitWF good'],
  'rp3 good',
];

async function makeController(managerType) {
  const config = await loadBasedir(new URL('./', import.meta.url).pathname);
  config.vats.target.creationOptions = {
    managerType,
    enableDisavow: true,
  };
  const canCallNow = true;
  config.vats.target.parameters = { canCallNow };
  config.devices = {
    add: {
      sourceSpec: new URL('device-add.js', import.meta.url).pathname,
      creationOptions: {
        unendowed: true,
      },
    },
  };
  const c = await buildVatController(config, []);
  return c;
}

async function workerTest(managerType, t) {
  const c = await makeController(managerType);
  t.teardown(c.shutdown);

  await c.run();
  t.is(c.kpStatus(c.bootstrapResult), 'fulfilled');
  t.deepEqual(c.dump().log, ['testLog works']);
  t.deepEqual(kunser(c.kpResolution(c.bootstrapResult)), expected);
}

test('local vat manager', async t => {
  await workerTest('local', t);
});

test('xsnap vat manager', async t => {
  await workerTest('xsnap', t);
});

test('xs vat manager alias', async t => {
  await workerTest('xs-worker', t);
});

test('node-subprocess vat manager', async t => {
  await workerTest('node-subprocess', t);
});

function nodeVatConfig(managerType) {
  return {
    bootstrap: 'bootstrap',
    vats: {
      bootstrap: {
        sourceSpec: new URL('bootstrap-node.js', import.meta.url).pathname,
        creationOptions: {
          managerType,
          nodeOptions: ['--inspect'],
        },
      },
    },
  };
}

test('accept node command-line args for node worker', async t => {
  const config = nodeVatConfig('node-subprocess');
  const c = await buildVatController(config, []);
  t.teardown(c.shutdown);
  await c.run();
  t.is(c.kpStatus(c.bootstrapResult), 'fulfilled');
  t.deepEqual(kunser(c.kpResolution(c.bootstrapResult)), 'ok');
});

test('reject node command-line args for non-node worker', async t => {
  const config = nodeVatConfig('xsnap');
  await t.throwsAsync(async () => buildVatController(config, []), {
    message: "nodeOptions requires managerType 'node-subprocess'",
  });
});
