// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import {
  makeFakeVatAdmin,
  zcfBundleCap,
} from '@agoric/zoe/tools/fakeVatAdmin.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { E, Far } from '@endo/far';

import { buildRootObject } from '../src/core/boot.js';
import { buildRootObject as bankRoot } from '../src/vat-bank.js';
import { buildRootObject as boardRoot } from '../src/vat-board.js';
import { buildRootObject as mintsRoot } from '../src/vat-mints.js';
import { buildRootObject as networkRoot } from '../src/vat-network.js';
import { buildRootObject as priceAuthorityRoot } from '../src/vat-priceAuthority.js';
import { buildRootObject as provisioningRoot } from '../src/vat-provisioning.js';
import { buildRootObject as zoeRoot } from '../src/vat-zoe.js';

const vatRoots = {
  bank: bankRoot,
  board: boardRoot,
  mints: mintsRoot,
  network: networkRoot,
  priceAuthority: priceAuthorityRoot,
  provisioning: provisioningRoot,
  zoe: zoeRoot,
};

const noop = () => {};

const mock = {
  devices: {
    command: /** @type {any} */ ({ registerInboundHandler: noop }),
    mailbox: /** @type {any} */ ({
      registerInboundHandler: noop,
    }),
    vatAdmin: /** @type {any} */ ({}),
    timer: /** @type {any} */ ({}),
    plugin: /** @type {any} */ ({ registerReceiver: noop }),
  },
  vats: {
    vattp: /** @type {any} */ (
      Far('vattp', {
        registerMailboxDevice: noop,
        addRemote: () => ({}),
      })
    ),
    comms: Far('comms', {
      addRemote: noop,
      addEgress: noop,
      addIngress: async () => ({
        getConfiguration: () => ({ _: 'client configuration' }),
      }),
    }),
    http: { setPresences: noop, setCommandDevice: noop },
    spawner: {
      buildSpawner: () => ({ _: 'spawner' }),
    },
    timer: Far('TimerVat', {
      createTimerService: async () => buildManualTimer(console.log),
    }),
    uploads: { getUploads: () => ({ _: 'uploads' }) },

    network: Far('network', {
      registerProtocolHandler: noop,
      bind: () => ({ addListener: noop }),
    }),
  },
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
    const createVat = bundleCap => {
      const name = fakeBundleCaps.get(bundleCap);
      assert(name);
      switch (name) {
        case 'zcf':
          return fakeVatAdmin.createVat(zcfBundleCap);
        default: {
          const buildRoot = vatRoots[name];
          if (!buildRoot) {
            throw Error(`TODO: load vat ${name}`);
          }
          const vatParameters = {};
          if (name === 'zoe') {
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
      vatAdmin: /** @type {any} */ ({
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
