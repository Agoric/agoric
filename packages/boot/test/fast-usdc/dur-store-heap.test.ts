import { buildSwingset } from '@agoric/cosmic-swingset/src/launch-chain.js';
import { initSwingStore } from '@agoric/swing-store';
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

test('heap usage of durable setStore', async t => {
  const swingStore = initSwingStore();
  const { kernelStorage, hostStorage } = swingStore;
  const mailboxStorage = new Map();
  const bridgeOutbound = () => {};
  const configPath = nodeRequire.resolve('./dur-store-config.json');
  const { controller, timer, bridgeInbound } = await buildSwingset(
    // @ts-expect-error missing method 'getNextKey'
    mailboxStorage,
    bridgeOutbound,
    kernelStorage,
    configPath,
    [],
    {},
    {
      callerWillEvaluateCoreProposals: false,
      debugName: 'TESTBOOT',
    },
  );

  const snapStore = swingStore.internal.snapStore as unknown as SnapStoreDebug;
  t.teardown(controller.shutdown);

  await controller.run(); // bootstrap
  const vatName = 'store1';
  const vatID = controller.vatNameToID(vatName);

  const mySize = () => {
    for (const snapshot of snapStore.listAllSnapshots()) {
      if (snapshot.inUse && snapshot.vatID === vatID) {
        return { size: snapshot.uncompressedSize, snapPos: snapshot.snapPos };
      }
    }
    throw Error(`no snapshot for ${vatName} / ${vatID}`);
  };
  const initial = mySize();
  let current = initial.size;
  t.log({ vatName, vatID, initial });

  for (let iter = 0; iter < 2000; iter++) {
    controller.queueToVatRoot(vatName, 'see', [`0xABCDE${iter}`]);
    await controller.run();
    const { size, snapPos } = mySize();
    const growth = size - current;
    current = size;
    if (growth > 0 || iter % 500 === 0) {
      t.log(growth, 'growth @', snapPos, ':', current);
    }
    t.true(iter < 100 || growth < 100);
  }
  t.log({ final: current });
});
