// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { E, Far, passStyleOf } from '@endo/far';
import bundleSource from '@endo/bundle-source';
import {
  makeFakeVatAdmin,
  zcfBundleCap,
} from '@agoric/zoe/tools/fakeVatAdmin.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';

import { makeZoeKit } from '@agoric/zoe';
import { buildRootObject } from '../src/core/boot.js';
import { buildRootObject as buildPSMRootObject } from '../src/core/boot-psm.js';
import { bridgeCoreEval } from '../src/core/chain-behaviors.js';
import { makePromiseSpace } from '../src/core/utils.js';
import { buildRootObject as bankRoot } from '../src/vat-bank.js';
import { buildRootObject as boardRoot } from '../src/vat-board.js';
import { buildRootObject as ibcRoot } from '../src/vat-ibc.js';
import { buildRootObject as mintsRoot } from '../src/vat-mints.js';
import { buildRootObject as networkRoot } from '../src/vat-network.js';
import { buildRootObject as priceAuthorityRoot } from '../src/vat-priceAuthority.js';
import { buildRootObject as provisioningRoot } from '../src/vat-provisioning.js';
import { buildRootObject as zoeRoot } from '../src/vat-zoe.js';

import { devices } from './devices.js';

const vatRoots = {
  bank: bankRoot,
  board: boardRoot,
  ibc: ibcRoot,
  mints: mintsRoot,
  network: networkRoot,
  priceAuthority: priceAuthorityRoot,
  provisioning: provisioningRoot,
  zoe: zoeRoot,
};

const noop = () => {};

const makeMock = t =>
  harden({
    devices: {
      command: /** @type { any } */ ({ registerInboundHandler: noop }),
      mailbox: /** @type { any } */ ({
        registerInboundHandler: noop,
      }),
      timer: /** @type { any } */ ({}),
      plugin: /** @type { any } */ ({ registerReceiver: noop }),
      ...devices,
    },
    vats: {
      vattp: /** @type { any } */ (
        Far('vattp', {
          registerMailboxDevice: noop,
          addRemote: () => harden({}),
        })
      ),
      comms: Far('comms', {
        addRemote: noop,
        addEgress: noop,
        addIngress: async () =>
          harden({
            getConfiguration: () => harden({ _: 'client configuration' }),
          }),
      }),
      http: { setPresences: noop, setCommandDevice: noop },
      spawner: {
        buildSpawner: () => harden({ _: 'spawner' }),
      },
      timer: Far('TimerVat', {
        createTimerService: async () => buildManualTimer(t.log),
      }),
      uploads: { getUploads: () => harden({ _: 'uploads' }) },

      network: Far('network', {
        registerProtocolHandler: noop,
        bind: () => harden({ addListener: noop }),
      }),
    },
  });

const mockSwingsetVats = mock => {
  const { admin: fakeVatAdmin } = makeFakeVatAdmin(() => {});
  const fakeBundleCaps = new Map(); // {} -> name
  const getNamedBundleCap = name => {
    const bundleCap = harden({});
    fakeBundleCaps.set(bundleCap, name);
    return bundleCap;
  };
  const getBundleIDByName = name => `b1-${name}`;
  const getBundleCap = id => devices.vatAdmin.getBundleCap(id);

  const createVat = (bundleCap, options) => {
    const name = fakeBundleCaps.get(bundleCap);
    assert(name);
    switch (name) {
      case 'zcf':
        return fakeVatAdmin.createVat(zcfBundleCap, options);
      default: {
        const buildRoot = vatRoots[name];
        if (!buildRoot) {
          throw Error(`TODO: load vat ${name}`);
        }
        const vatParameters = { ...options?.vatParameters };
        if (name === 'zoe') {
          // basic-behaviors.js:buildZoe() provides hard-coded zcf BundleName
          // and vat-zoe.js ignores vatParameters, but this would be the
          // preferred way to pass the name.
          vatParameters.zcfBundleName = 'zcf';
        }
        return { root: buildRoot({}, vatParameters), admin: {} };
      }
    }
  };
  const createVatByName = name => {
    const bundleCap = getNamedBundleCap(name);
    return createVat(bundleCap);
  };

  const vats = {
    ...mock.vats,
    vatAdmin: /** @type { any } */ ({
      createVatAdminService: () =>
        Far('vatAdminSvc', {
          getNamedBundleCap,
          createVat,
          createVatByName,
          getBundleIDByName,
          getBundleCap,
          waitForBundleCap: getBundleCap,
        }),
    }),
  };
  return vats;
};

const argvByRole = {
  chain: {
    ROLE: 'chain',
  },
  'sim-chain': {
    ROLE: 'sim-chain',
    FIXME_GCI: 'fake GCI',
    hardcodedClientAddresses: ['a1'],
  },
  client: {
    ROLE: 'client',
    FIXME_GCI: 'fake GCI',
    hardcodedClientAddresses: ['a1'],
  },
};
const testRole = (ROLE, governanceActions) => {
  test(`test manifest permits: ${ROLE} gov: ${governanceActions}`, async t => {
    const mock = makeMock(t);
    const root = buildRootObject(
      // @ts-expect-error Device<T> is a little goofy
      { D: d => d, logger: t.log },
      { argv: argvByRole[ROLE], governanceActions },
    );

    const fakeVatAdmin = makeFakeVatAdmin(() => {}).admin;
    const fakeBundleCaps = new Map(); // {} -> name
    const getNamedBundleCap = name => {
      const bundleCap = harden({});
      fakeBundleCaps.set(bundleCap, name);
      return bundleCap;
    };
    const createVat = (bundleCap, options) => {
      const name = fakeBundleCaps.get(bundleCap);
      assert(name);
      switch (name) {
        case 'zcf':
          return fakeVatAdmin.createVat(zcfBundleCap, options);
        default: {
          const buildRoot = vatRoots[name];
          if (!buildRoot) {
            throw Error(`TODO: load vat ${name}`);
          }
          const vatParameters = { ...options?.vatParameters };
          if (name === 'zoe') {
            // basic-behaviors.js:buildZoe() provides hard-coded zcf BundleName
            // and vat-zoe.js ignores vatParameters, but this would be the
            // preferred way to pass the name.
            vatParameters.zcfBundleName = 'zcf';
          }
          return { root: buildRoot({}, vatParameters), admin: {} };
        }
      }
    };
    const createVatByName = name => {
      const bundleCap = getNamedBundleCap(name);
      return createVat(bundleCap);
    };

    const vats = {
      ...mock.vats,
      vatAdmin: /** @type { any } */ ({
        createVatAdminService: () =>
          Far('vatAdminSvc', { getNamedBundleCap, createVat, createVatByName }),
      }),
    };
    const actual = await E(root).bootstrap(vats, mock.devices);
    t.deepEqual(actual, undefined);
  });
};

testRole('client', false);
testRole('chain', false);
testRole('chain', true);
testRole('sim-chain', false);
testRole('sim-chain', true);

test('evaluateInstallation is available to core eval', async t => {
  let handler;
  const modulePath = new URL('../src/core/utils.js', import.meta.url).pathname;
  const { produce, consume } = makePromiseSpace(t.log);

  const prepare = async () => {
    const bridgeManager = {
      register: (name, fn) => {
        handler = fn;
      },
    };

    const { zoeService } = makeZoeKit(makeFakeVatAdmin(() => {}).admin);

    const theBoard = boardRoot().getBoard();
    const bundle = await bundleSource(modulePath);

    const installation = await E(zoeService).install(bundle);
    const instId = await E(theBoard).getId(installation);

    produce.zoe.resolve(zoeService);
    produce.board.resolve(theBoard);
    produce.bridgeManager.resolve(bridgeManager);
    return instId;
  };

  const instId = await prepare();

  // @ts-expect-error
  await bridgeCoreEval({ produce, consume });
  t.truthy(handler);

  const produceThing = async ({
    consume: { board },
    produce: { thing },
    evaluateInstallation,
  }) => {
    const id = 'REPLACE_WITH_BOARD_ID';
    const inst = await E(board).getValue(id);
    const ns = await evaluateInstallation(inst);
    thing.resolve(ns);
  };

  const bridgeMessage = {
    type: 'CORE_EVAL',
    evals: [
      {
        json_permits: 'true',
        js_code: `${produceThing}`.replace('REPLACE_WITH_BOARD_ID', instId),
      },
    ],
  };
  t.log({ bridgeMessage });

  // @ts-expect-error
  await E(handler).fromBridge('arbitrary srcID', bridgeMessage);
  const actual = await consume.thing;

  // @ts-expect-error
  t.deepEqual(typeof actual.extract, 'function');
});

test('bootstrap provides a way to pass items to CORE_EVAL', async t => {
  const root = buildRootObject(
    // @ts-expect-error Device<T> is a little goofy
    { D: d => d, logger: t.log },
    { argv: argvByRole.chain, governanceActions: false },
  );

  await E(root).produceItem('swissArmyKnife', [1, 2, 3]);
  t.deepEqual(await E(root).consumeItem('swissArmyKnife'), [1, 2, 3]);
  await E(root).resetItem('swissArmyKnife');
  await E(root).produceItem('swissArmyKnife', 4);
  t.deepEqual(await E(root).consumeItem('swissArmyKnife'), 4);
});

const psmParams = {
  anchorAssets: [{ denom: 'ibc/toyusdc' }],
  economicCommitteeAddresses: [],
  argv: { bootMsg: {} },
};

test(`PSM-only bootstrap`, async t => {
  const mock = makeMock(t);
  const root = buildPSMRootObject(
    // @ts-expect-error Device<T> is a little goofy
    { D: d => d, logger: t.log },
    psmParams,
  );

  const vats = mockSwingsetVats(mock);
  const actual = await E(root).bootstrap(vats, mock.devices);
  t.deepEqual(actual, undefined);

  const agoricNames = E(root).consumeItem('agoricNames');
  const instance = await E(agoricNames).lookup('instance', 'psm');
  t.is(passStyleOf(instance), 'remotable');
});

test('PSM-only bootstrap provides a way to pass items to CORE_EVAL', async t => {
  const root = buildPSMRootObject(
    // @ts-expect-error Device<T> is a little goofy
    { D: d => d, logger: t.log },
    psmParams,
  );

  await E(root).produceItem('swissArmyKnife', [1, 2, 3]);
  t.deepEqual(await E(root).consumeItem('swissArmyKnife'), [1, 2, 3]);
  await E(root).resetItem('swissArmyKnife');
  await E(root).produceItem('swissArmyKnife', 4);
  t.deepEqual(await E(root).consumeItem('swissArmyKnife'), 4);
});
