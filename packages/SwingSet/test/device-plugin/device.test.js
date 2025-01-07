// @ts-nocheck
import { test } from '../../tools/prepare-test-env-ava.js';

// eslint-disable-next-line import/order
import { initSwingStore } from '@agoric/swing-store';

import {
  swingsetIsInitialized,
  initializeSwingset,
  makeSwingsetController,
} from '../../src/index.js';
import { buildBridge } from '../../src/devices/bridge/bridge.js';
import { buildPlugin } from '../../src/devices/plugin/plugin.js';

test.before('initialize storage', t => {
  t.context.kernelStorage = initSwingStore().kernelStorage;
});

async function setupVatController(t) {
  const inputQueue = [];
  const queueThunkForKernel = async thunk => {
    inputQueue.push(thunk);
  };

  const importPlugin = async mod => {
    t.is(mod, 'pingpong');
    return import('./pingpong.js');
  };
  const plugin = buildPlugin(
    new URL('./', import.meta.url).pathname,
    importPlugin,
    queueThunkForKernel,
  );
  const bridge = buildBridge();
  const deviceEndowments = {
    plugin: { ...plugin.endowments },
    bridge: { ...bridge.endowments },
  };

  if (!swingsetIsInitialized(t.context.kernelStorage)) {
    const config = {
      bootstrap: 'bootstrap',
      vats: {
        bootstrap: {
          sourceSpec: new URL('bootstrap.js', import.meta.url).pathname,
        },
        bridge: {
          sourceSpec: new URL('vat-bridge.js', import.meta.url).pathname,
        },
      },
      devices: {
        plugin: {
          sourceSpec: plugin.srcPath,
        },
        bridge: {
          sourceSpec: bridge.srcPath,
        },
      },
    };
    await initializeSwingset(config, ['plugin'], t.context.kernelStorage);
  }
  const c = await makeSwingsetController(
    t.context.kernelStorage,
    deviceEndowments,
  );
  t.teardown(c.shutdown);
  const cycle = async () => {
    await c.run();
    while (inputQueue.length) {
      inputQueue.shift()();
      await c.run();
    }
  };
  return { bridge, cycle, dump: c.dump, plugin, queueThunkForKernel };
}

test.serial('plugin first time', async t => {
  const { bridge, cycle, dump, queueThunkForKernel } =
    await setupVatController(t);

  void queueThunkForKernel(() => bridge.deliverInbound('pingpong'));
  await cycle();

  t.deepEqual(dump().log, [
    'starting plugin test',
    'installing pingPongP',
    'starting pingpong test',
    'pingpong reply = Whoopie Agoric!',
  ]);
});

// NOTE: the following test CANNOT be run standalone. It requires execution of
// the prior test to establish its necessary starting state.  This is a bad
// practice and should be fixed.  It's not bad enough to warrant fixing right
// now, but worth flagging with this comment as a help to anyone else who gets
// tripped up by it.

test.serial('plugin after restart', async t => {
  const { bridge, cycle, dump, plugin, queueThunkForKernel } =
    await setupVatController(t);

  plugin.reset();
  void queueThunkForKernel(() => bridge.deliverInbound('pingpong'));
  await cycle();

  t.deepEqual(dump().log, [
    'starting plugin test',
    'installing pingPongP',
    'starting pingpong test',
    'pingpong reply = Whoopie Agoric!',
    'starting pingpong test',
    'pingpong reply = Whoopie Agoric!',
  ]);
});
