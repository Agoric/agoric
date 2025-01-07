/** @file upgrade network / IBC vat at many points in state machine */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import type { TestFn } from 'ava';
import { createRequire } from 'module';

import type { Baggage } from '@agoric/swingset-liveslots';
import { M, makeScalarBigMapStore } from '@agoric/vat-data';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { makeSwingsetTestKit } from '../../tools/supports.js';

const { entries, assign } = Object;

const PLATFORM_CONFIG = '@agoric/vm-config/decentral-itest-vaults-config.json';

const nodeRequire = createRequire(import.meta.url);
const asset = {
  ibcServerMock: nodeRequire.resolve('./ibcServerMock.js'),
  ibcClientMock: nodeRequire.resolve('./ibcClientMock.js'),
};

export const makeTestContext = async t => {
  console.time('DefaultTestContext');

  const baggage = makeScalarBigMapStore('baggage', {
    keyShape: M.string(),
    durable: true,
  }) as Baggage;
  const zone = makeDurableZone(baggage);

  const bundleDir = 'bundles';
  const bundleCache = await makeNodeBundleCache(
    bundleDir,
    { cacheSourceMaps: false },
    async s => import(s),
  );
  const swingsetTestKit = await makeSwingsetTestKit(t.log, bundleDir, {
    configSpecifier: PLATFORM_CONFIG,
  });
  console.timeLog('DefaultTestContext', 'swingsetTestKit');

  const installation = {} as Record<string, Installation>;
  return { ...swingsetTestKit, bundleCache, installation };
};

const test = anyTest as TestFn<Awaited<ReturnType<typeof makeTestContext>>>;

test.before(async t => {
  t.context = await makeTestContext(t);
});
test.after.always(async t => t.context.shutdown?.());

test.serial('bootstrap produces provisioning vat', async t => {
  const { EV } = t.context.runUtils;
  const provisioning = await EV.vat('bootstrap').consumeItem('provisioning');
  console.timeLog('DefaultTestContext', 'provisioning');
  t.log('provisioning', provisioning);
  t.truthy(provisioning);
});

test.serial('bootstrap launches network, ibc vats', async t => {
  const { EV } = t.context.runUtils;

  t.log('network proposal executed');
  const vatStore = await EV.vat('bootstrap').consumeItem('vatStore');
  t.true(await EV(vatStore).has('ibc'), 'ibc');
  t.true(await EV(vatStore).has('network'), 'network');
});

test.serial('test contracts are installed', async t => {
  const { bundleCache } = t.context;
  const { EV } = t.context.runUtils;
  const zoe: ZoeService = await EV.vat('bootstrap').consumeItem('zoe');
  for (const [name, path] of entries(asset)) {
    const bundle = await bundleCache.load(path, name);
    const installation = await EV(zoe).install(bundle);
    t.truthy(installation);
    assign(t.context.installation, { [name]: installation });
  }
});

const upgradeVats = async (t, EV, vatsToUpgrade) => {
  const vatStore = await EV.vat('bootstrap').consumeItem('vatStore');
  const vatUpgradeInfo =
    await EV.vat('bootstrap').consumeItem('vatUpgradeInfo');
  const vatAdminSvc = await EV.vat('bootstrap').consumeItem('vatAdminSvc');
  for (const vatName of vatsToUpgrade) {
    const { bundleID, bundleName } = await EV(vatUpgradeInfo).get(vatName);
    const bcap = await (bundleID
      ? EV(vatAdminSvc).getBundleCap(bundleID)
      : EV(vatAdminSvc).getNamedBundleCap(bundleName));
    const { adminNode } = await EV(vatStore).get(vatName);
    const result = await EV(adminNode).upgrade(bcap);
    t.log(vatName, result);
    t.true(result.incarnationNumber > 0);
  }
};

test.serial('upgrade at many points in network API flow', async t => {
  const { installation } = t.context;
  const { EV } = t.context.runUtils;
  const portAllocator = await EV.vat('bootstrap').consumeItem('portAllocator');
  const zoe: ZoeService = await EV.vat('bootstrap').consumeItem('zoe');

  const flow = entries({
    startServer: async label => {
      const started = await EV(zoe).startInstance(
        installation.ibcServerMock,
        {},
        {},
        { portAllocator },
      );
      t.truthy(started.creatorFacet, `${label} ibcServerMock`);
      return [label, { server: started.creatorFacet }];
    },
    requestListening: async ([label, opts]) => {
      await EV.sendOnly(opts.server).listen();
      return [label, opts];
    },
    startListening: async ([label, opts]) => {
      await EV.sendOnly(opts.server).dequeue('onListen');
      return [label, opts];
    },
    startClient: async ([label, opts]) => {
      const started = await EV(zoe).startInstance(
        installation.ibcClientMock,
        {},
        {},
        { portAllocator },
      );
      t.truthy(started.creatorFacet, `${label} ibcClientMock`);
      return [label, { ...opts, client: started.creatorFacet }];
    },
    getAddresses: async ([label, opts]) => {
      const serverAddress = await EV(opts.server).getLocalAddress();
      const clientAddress = await EV(opts.client).getLocalAddress();
      t.log(`${label} server ${serverAddress} client ${clientAddress}`);
      return [label, { ...opts, serverAddress }];
    },
    requestConnection: async ([label, opts]) => {
      await EV.sendOnly(opts.client).connect(opts.serverAddress);
      return [label, opts];
    },
    acceptConnection: async ([label, opts]) => {
      await EV.sendOnly(opts.server).dequeue('onAccept');
      return [label, opts];
    },
    openConnection: async ([label, opts]) => {
      await EV.sendOnly(opts.server).dequeue('onOpen');
      return [label, opts];
    },
    sendPacket: async ([label, opts]) => {
      await EV.sendOnly(opts.client).send(label);
      return [label, opts];
    },
    respond: async ([label, opts]) => {
      await EV.sendOnly(opts.server).dequeue('onReceive');
      return [label, opts];
    },
    checkAck: async ([label, opts]) => {
      const ack = await EV(opts.client).getAck();
      t.is(ack, `got ${label}`, `${label} expected echo`);
      return [label, { ...opts, ack }];
    },
    closeConnection: async ([label, opts]) => {
      await EV(opts.client).close();
    },
  });

  const doSteps = async (label, steps, input: unknown = undefined) => {
    await null;
    let result = input;
    for (const [stepName, fn] of steps) {
      await t.notThrowsAsync(async () => {
        result = await fn(result);
      }, `${label} ${stepName} must complete successfully`);
    }
    return result;
  };

  // Sanity check
  await doSteps('pre-upgrade', flow, 'pre-upgrade');

  // For each step, run to just before that point and pause for
  // continuation after upgrade.
  const pausedFlows = [] as Array<{
    result: any;
    remainingSteps: [string, (lastResult: any) => unknown][];
  }>;
  for (let i = 0; i < flow.length; i += 1) {
    const [beforeStepName] = flow[i];
    const result = await doSteps(
      `pre-${beforeStepName}`,
      flow.slice(0, i),
      `pause-before-${beforeStepName}`,
    );
    pausedFlows.push({ result, remainingSteps: flow.slice(i) });
  }

  await upgradeVats(t, EV, ['ibc', 'network']);

  // Verify a complete run post-upgrade.
  await doSteps('post-upgrade', flow, 'post-upgrade');

  // Verify completion of each paused flow.
  for (const { result, remainingSteps } of pausedFlows) {
    const [beforeStepName] = remainingSteps[0];
    await doSteps(`resumed-${beforeStepName}`, remainingSteps, result);
  }
});
