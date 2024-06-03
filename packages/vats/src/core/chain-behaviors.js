/* global globalThis */
import { allValues, BridgeId as BRIDGE_ID } from '@agoric/internal';
import * as STORAGE_PATH from '@agoric/internal/src/chain-storage-paths.js';
import { makePrioritySendersManager } from '@agoric/internal/src/priority-senders.js';
import {
  makeNotifierKit,
  makeSubscriptionKit,
  observeIteration,
} from '@agoric/notifier';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { prepareRecorderKit } from '@agoric/zoe/src/contractSupport/recorder.js';
import * as farExports from '@endo/far';
import { E, Far } from '@endo/far';
import { importBundle } from '@endo/import-bundle';
import { makePromiseKit } from '@endo/promise-kit';
import { PowerFlags } from '../walletFlags.js';
import { BASIC_BOOTSTRAP_PERMITS } from './basic-behaviors.js';
import { agoricNamesReserved, callProperties, extractPowers } from './utils.js';

const { Fail } = assert;
const { keys } = Object;

/**
 * This registers the code triggered by `agd tx gov submit-proposal
 * swingset-core-eval permit.json code.js`. It is the "big hammer" governance
 * that allows code.js access to all powers permitted by permit.json.
 *
 * @param {BootstrapPowers} allPowers
 */
export const bridgeCoreEval = async allPowers => {
  // We need all of the powers to be available to the evaluator, but we only
  // need the bridgeManager to install our handler.
  const {
    vatPowers: { D },
    consume: { bridgeManager: bridgeManagerP },
    produce: { coreEvalBridgeHandler },
  } = allPowers;

  const endowments = {
    VatData: globalThis.VatData,
    console,
    assert,
    Base64: globalThis.Base64, // Present only on XSnap
    URL: globalThis.URL, // Absent only on XSnap
  };

  /** @param {BundleCap} bundleCap */
  const evaluateBundleCap = async bundleCap => {
    const bundle = await D(bundleCap).getBundle();
    const imported = await importBundle(bundle, { endowments });
    return imported;
  };
  harden(evaluateBundleCap);

  // Register a coreEval handler over the bridge.
  const handler = Far('coreHandler', {
    async fromBridge(obj) {
      switch (obj.type) {
        case 'CORE_EVAL': {
          /** @type {import('@agoric/cosmic-proto/swingset/swingset.js').CoreEvalProposalSDKType} */
          const { evals } = obj;
          return Promise.all(
            evals.map(({ json_permits: jsonPermit, js_code: code }) =>
              // Run in a new turn to avoid crosstalk of the evaluations.
              Promise.resolve()
                .then(() => {
                  const permit = JSON.parse(jsonPermit);
                  const powers = extractPowers(permit, {
                    evaluateBundleCap,
                    ...allPowers,
                  });

                  // Inspired by ../repl.js:
                  const globals = harden({
                    ...allPowers.modules,
                    ...farExports,
                    ...endowments,
                  });

                  // Evaluate the code in the context of the globals.
                  const compartment = new Compartment(globals);
                  harden(compartment.globalThis);
                  const behavior = compartment.evaluate(code);
                  return behavior(powers);
                })
                .catch(err => {
                  console.error('CORE_EVAL failed:', err);
                  throw err;
                }),
            ),
          ).then(_ => {});
        }
        default: {
          throw Fail`Unrecognized request ${obj.type}`;
        }
      }
    },
  });
  coreEvalBridgeHandler.resolve(handler);

  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    // Not running with a bridge.
    return;
  }
  await E(bridgeManager).register(BRIDGE_ID.CORE, handler);
};
harden(bridgeCoreEval);

/**
 * @param {BootstrapPowers} powers
 */
export const makeProvisioner = async ({
  consume: { clientCreator, loadCriticalVat },
  vats: { comms, vattp },
  produce: { provisioning },
}) => {
  const provisionerVat = await E(loadCriticalVat)('provisioning');
  await E(provisionerVat).register(clientCreator, comms, vattp);
  provisioning.resolve(provisionerVat);
};
harden(makeProvisioner);

/** @param {BootstrapPowers} powers */
export const noProvisioner = async ({ produce: { provisioning } }) => {
  provisioning.resolve(undefined);
};
harden(noProvisioner);

/** @param {BootstrapPowers} powers */
export const bridgeProvisioner = async ({
  consume: {
    provisioning: provisioningP,
    provisionBridgeManager: provisionBridgeManagerP,
    provisionWalletBridgeManager: provisionWalletBridgeManagerP,
  },
}) => {
  const [provisioning, provisionBridgeManager, provisionWalletBridgeManager] =
    await Promise.all([
      provisioningP,
      provisionBridgeManagerP,
      provisionWalletBridgeManagerP,
    ]);
  if (!provisionBridgeManager || !provisionWalletBridgeManager) {
    return;
  }

  // Register a provisioning handler over the bridge.
  const handler = provisioning
    ? Far('provisioningHandler', {
        async fromBridge(obj) {
          switch (obj.type) {
            case 'PLEASE_PROVISION': {
              const { nickname, address, powerFlags: rawPowerFlags } = obj;
              const powerFlags = rawPowerFlags || [];
              let provisionP;
              if (powerFlags.includes(PowerFlags.SMART_WALLET)) {
                // Only provision a smart wallet.
                provisionP = E(provisionWalletBridgeManager).fromBridge(obj);
              } else {
                // Provision a mailbox and REPL.
                provisionP = E(provisioning).pleaseProvision(
                  nickname,
                  address,
                  powerFlags,
                );
              }
              return provisionP
                .catch(e =>
                  console.error(
                    `Error provisioning ${nickname} ${address}:`,
                    e,
                  ),
                )
                .then(_ => {});
            }
            default: {
              throw Fail`Unrecognized request ${obj.type}`;
            }
          }
        },
      })
    : provisionWalletBridgeManager;
  await E(provisionBridgeManager).initHandler(handler);
};
harden(bridgeProvisioner);

/**
 * @param {Record<string, unknown>} pattern
 * @param {Record<string, unknown>} specimen
 */
const missingKeys = (pattern, specimen) =>
  keys(pattern).filter(k => !keys(specimen).includes(k));

/**
 * @param {BootstrapSpace} powers
 * @param {{ template?: Record<string, unknown> }} config
 */
export const setupClientManager = async (
  { produce: { client, clientCreator: clientCreatorP } },
  {
    template = {
      agoricNames: true,
      bank: true,
      namesByAddress: true,
      myAddressNameAdmin: true,
      board: true,
      faucet: true,
      zoe: true,
    },
  } = {},
) => {
  // Create a subscription of chain configurations.
  /** @type {SubscriptionRecord<PropertyMaker[]>} */
  const { subscription, publication } = makeSubscriptionKit();

  /** @type {ClientManager} */
  const clientManager = Far('chainClientManager', {
    assignBundle: newPropertyMakers => {
      // Write the property makers to the cache, and update the subscription.
      publication.updateState(newPropertyMakers);
    },
  });

  /** @type {ClientCreator} */
  const clientCreator = Far('clientCreator', {
    createUserBundle: (nickname, clientAddress, powerFlags) => {
      const c = E(clientCreator).createClientFacet(
        nickname,
        clientAddress,
        powerFlags,
      );
      return E(c).getChainBundle();
    },
    createClientFacet: async (_nickname, clientAddress, powerFlags) => {
      /** @type {Record<string, unknown>} */
      let clientHome = {};
      const bundleReady = makePromiseKit();

      const makeUpdatedConfiguration = async (newPropertyMakers = []) => {
        // Specialize the property makers with the client address.
        const newProperties = callProperties(
          newPropertyMakers,
          clientAddress,
          powerFlags,
        );
        clientHome = { ...clientHome, ...newProperties };

        const todo = missingKeys(template, clientHome);
        if (todo.length === 0) {
          bundleReady.resolve(undefined);
        }

        return harden({ clientAddress, clientHome });
      };

      // Publish new configurations.
      const newConfig = await makeUpdatedConfiguration([]);
      const { notifier, updater } = makeNotifierKit(newConfig);

      /** @type {ClientFacet} */
      const clientFacet = Far('chainProvisioner', {
        getChainBundle: () =>
          bundleReady.promise.then(_ => allValues(clientHome)),
        getConfiguration: () => notifier,
      });

      void observeIteration(subscription, {
        updateState(newPropertyMakers) {
          makeUpdatedConfiguration(newPropertyMakers)
            .then(x => updater.updateState(x))
            .catch(reason => console.error(reason)); // TODO: catch and log OK?
        },
      });

      return clientFacet;
    },
  });

  clientCreatorP.resolve(clientCreator);
  client.resolve(clientManager);
};
harden(setupClientManager);

/** @param {BootstrapPowers} powers */
export const startTimerService = async ({
  devices: { timer: timerDevice },
  vats: { timer: timerVat },
  consume: { client },
  produce: { chainTimerService: produceTimer },
  brand: {
    produce: { timer },
  },
}) => {
  const chainTimerService = E(timerVat).createTimerService(timerDevice);
  produceTimer.resolve(chainTimerService);
  timer.resolve(E(chainTimerService).getTimerBrand());
  return E(client).assignBundle([_addr => ({ chainTimerService })]);
};
harden(startTimerService);

/**
 * @param {BootDevices<ChainDevices> & BootstrapSpace} powers
 */
export const makeBridgeManager = async ({
  consume: { loadCriticalVat },
  devices: { bridge },
  produce: {
    bridgeManager: bridgeManagerP,
    provisionBridgeManager,
    provisionWalletBridgeManager,
    walletBridgeManager,
  },
}) => {
  if (!bridge) {
    console.warn(
      'Running without a bridge device; this is not an actual chain.',
    );
    bridgeManagerP.resolve(undefined);
    provisionBridgeManager.resolve(undefined);
    provisionWalletBridgeManager.resolve(undefined);
    walletBridgeManager.resolve(undefined);
    return;
  }
  const vat = E(loadCriticalVat)('bridge');
  const bridgeManager = E(vat).provideManagerForBridge(bridge);
  bridgeManagerP.resolve(bridgeManager);
  provisionBridgeManager.resolve(
    E(bridgeManager).register(BRIDGE_ID.PROVISION),
  );
  provisionWalletBridgeManager.resolve(
    E(bridgeManager).register(BRIDGE_ID.PROVISION_SMART_WALLET),
  );
  walletBridgeManager.resolve(E(bridgeManager).register(BRIDGE_ID.WALLET));
};
harden(makeBridgeManager);

/**
 * @param {BootstrapSpace} powers
 */
export const makeChainStorage = async ({
  consume: { loadCriticalVat, bridgeManager: bridgeManagerP },
  produce: {
    chainStorage: chainStorageP,
    storageBridgeManager: storageBridgeManagerP,
  },
}) => {
  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    console.warn('Cannot support chainStorage without an actual chain.');
    chainStorageP.resolve(null);
    // @ts-expect-error expects value or undefined
    storageBridgeManagerP.resolve(null);
    return;
  }

  /** @type {import('../types.js').ScopedBridgeManager<'storage'>} */
  // @ts-expect-error XXX EProxy
  const storageBridgeManager = E(bridgeManager).register(BRIDGE_ID.STORAGE);
  storageBridgeManagerP.resolve(storageBridgeManager);

  const vat = E(loadCriticalVat)('bridge');
  const rootNodeP = E(vat).makeBridgedChainStorageRoot(
    storageBridgeManager,
    STORAGE_PATH.CUSTOM,
    { sequence: true },
  );
  chainStorageP.resolve(rootNodeP);
};

/**
 * @param {BootstrapSpace} powers
 */
export const produceHighPrioritySendersManager = async ({
  consume: { loadCriticalVat, storageBridgeManager: storageBridgeManagerP },
  produce: { highPrioritySendersManager: managerP },
}) => {
  const storageBridgeManager = await storageBridgeManagerP;
  if (!storageBridgeManager) {
    console.warn(
      'Cannot provide highPrioritySendersManager without an actual chain.',
    );
    managerP.resolve(null);
    return;
  }

  const sendersNode = E(
    E(loadCriticalVat)('bridge'),
  ).makeBridgedChainStorageRoot(
    storageBridgeManager,
    STORAGE_PATH.HIGH_PRIORITY_SENDERS,
    { sequence: false },
  );

  /**
   * NB: this is a non-durable Far object. If the bootstrap vat (where this
   * object is made) were to be terminated, the object references to this would
   * be severed.
   *
   * See {@link ./README.md bootstrap documentation} for implications. If the
   * bootstrap vat is replaced, the new bootstrap config must be made using
   * state extracted from IAVL. Contracts holding this manager will need to be
   * updated with the new object, which can be done with an upgrade (regular or
   * null) with the new object in privateArgs.
   */
  const manager = makePrioritySendersManager(sendersNode);

  managerP.resolve(manager);
};

/** @param {BootstrapPowers & NamedVatPowers} powers */
export const publishAgoricNamesToChainStorage = async ({
  consume: { chainStorage: rootP },
  namedVat: {
    consume: { agoricNames, board: vatBoard },
  },
}) => {
  const root = await rootP;
  if (!root) {
    console.warn('no chainStorage: not publishing agoricNames');
    return;
  }
  const nameStorage = E(root).makeChildNode('agoricNames');
  await E(agoricNames).publishNameHubs(
    nameStorage,
    vatBoard,
    keys(agoricNamesReserved),
  );
};

/**
 * @deprecated use reflectAgoricNamesToChainStorage
 * @param {BootstrapPowers} powers
 * @param {{
 *   options?: {
 *     agoricNamesOptions?: {
 *       topLevel?: string[];
 *     };
 *   };
 * }} config
 */
export const publishAgoricNames = async (
  { consume: { agoricNamesAdmin, board, chainStorage: rootP } },
  { options: { agoricNamesOptions } = {} } = {},
) => {
  const root = await rootP;
  if (!root) {
    console.warn('cannot publish agoricNames without chainStorage');
    return;
  }
  const nameStorage = E(root).makeChildNode('agoricNames');
  const marshaller = E(board).getPublishingMarshaller();

  // XXX will fail upon restart, but so would the makeStoredPublishKit this is replacing
  // Since we expect the bootstrap vat to be replaced instead of upgraded this should be
  // fine. See {@link ./README.md bootstrap documentation} for details.
  const fakeBaggage = makeScalarBigMapStore(
    'fake baggage for AgoricNames kinds',
  );
  const makeRecorderKit = prepareRecorderKit(fakeBaggage, marshaller);

  // brand, issuer, ...
  const { topLevel = keys(agoricNamesReserved) } = agoricNamesOptions || {};
  await Promise.all(
    topLevel.map(async kind => {
      const kindAdmin = await E(agoricNamesAdmin).lookupAdmin(kind);

      const kindNode = await E(nameStorage).makeChildNode(kind);
      const { recorder } = makeRecorderKit(kindNode);
      kindAdmin.onUpdate(recorder);
      return recorder.write([]);
    }),
  );
};

/**
 * no free lunch on chain
 *
 * @param {BootstrapPowers} powers
 */
export const connectChainFaucet = async ({ consume: { client } }) => {
  const faucet = Far('faucet', { tapFaucet: () => harden([]) });

  return E(client).assignBundle([_addr => ({ faucet })]);
};
harden(connectChainFaucet);

/** @type {import('./lib-boot.js').BootstrapManifest} */
export const SHARED_CHAIN_BOOTSTRAP_MANIFEST = {
  ...BASIC_BOOTSTRAP_PERMITS,

  [bridgeCoreEval.name]: true, // Needs all the powers.
  [makeBridgeManager.name]: {
    consume: { loadCriticalVat: true },
    devices: { bridge: 'kernel' },
    produce: {
      bridgeManager: 'bridge',
      provisionBridgeManager: 'bridge',
      provisionWalletBridgeManager: 'bridge',
      walletBridgeManager: 'bridge',
    },
  },
  [startTimerService.name]: {
    devices: {
      timer: 'kernel',
    },
    vats: {
      timer: 'timer',
    },
    consume: { client: true },
    produce: {
      chainTimerService: 'timer',
    },
    brand: { produce: { timer: 'timer' } },
    home: { produce: { chainTimerService: 'timer' } },
  },
  [makeChainStorage.name]: {
    consume: { loadCriticalVat: true, bridgeManager: true },
    produce: {
      chainStorage: 'bridge',
      storageBridgeManager: 'bridge',
    },
  },
  [produceHighPrioritySendersManager.name]: {
    consume: { loadCriticalVat: true, storageBridgeManager: true },
    produce: {
      highPrioritySendersManager: 'bridge',
    },
  },
  [publishAgoricNamesToChainStorage.name]: {
    consume: { chainStorage: 'chainStorage' },
    namedVat: {
      consume: { agoricNames: 'agoricNames', board: 'board' },
    },
  },
  [makeProvisioner.name]: {
    consume: {
      loadCriticalVat: true,
      clientCreator: true,
    },
    produce: {
      provisioning: 'provisioning',
    },
    vats: {
      comms: 'comms',
      vattp: 'vattp',
    },
  },
  [bridgeProvisioner.name]: {
    consume: {
      provisioning: true,
      bridgeManager: 'bridge',
      provisionBridgeManager: 'bridge',
      provisionWalletBridgeManager: 'bridge',
    },
  },
  [setupClientManager.name]: {
    produce: {
      client: true,
      clientCreator: true,
    },
  },
};
harden(SHARED_CHAIN_BOOTSTRAP_MANIFEST);

/** @type {import('./lib-boot.js').BootstrapManifest} */
export const CHAIN_BOOTSTRAP_MANIFEST = harden({
  ...SHARED_CHAIN_BOOTSTRAP_MANIFEST,
  [connectChainFaucet.name]: {
    consume: {
      client: true,
    },
    home: { produce: { faucet: true } },
  },
});
