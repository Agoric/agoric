/* global globalThis */
// @ts-check
import { E, Far } from '@endo/far';
import * as farExports from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import {
  makeNotifierKit,
  makeStoredPublishKit,
  makeSubscriptionKit,
  observeIteration,
} from '@agoric/notifier';
import {
  makeLoopbackProtocolHandler,
  makeEchoConnectionHandler,
  makeNonceMaker,
} from '@agoric/swingset-vat/src/vats/network/index.js';
import { importBundle } from '@endo/import-bundle';
import * as Collect from '@agoric/inter-protocol/src/collect.js';

import { makeBridgeManager as makeBridgeManagerKit } from '../bridge.js';
import * as BRIDGE_ID from '../bridge-ids.js';
import * as STORAGE_PATH from '../chain-storage-paths.js';

import { agoricNamesReserved, callProperties, extractPowers } from './utils.js';

const { details: X } = assert;
const { keys } = Object;

const NUM_IBC_PORTS_PER_CLIENT = 3;

/**
 * This registers the code triggered by `agd tx gov submit-proposal
 * swingset-core-eval permit.json code.js`.  It is the "big hammer" governance
 * that allows code.js access to all powers permitted by permit.json.
 *
 * @param {BootstrapPowers} allPowers
 */
export const bridgeCoreEval = async allPowers => {
  // We need all of the powers to be available to the evaluator, but we only
  // need the bridgeManager to install our handler.
  const {
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
  /** @param {Installation} installation */
  const evaluateInstallation = async installation => {
    const bundle = await E(installation).getBundle();
    const imported = await importBundle(bundle, { endowments });
    return imported;
  };
  harden(evaluateInstallation);

  // Register a coreEval handler over the bridge.
  const handler = Far('coreHandler', {
    async fromBridge(_srcID, obj) {
      switch (obj.type) {
        case 'CORE_EVAL': {
          /**
           * Type defined by `agoric-sdk/golang/cosmos/proto/agoric/swingset/swingset.proto` CoreEval.
           *
           * @type {{ evals: { json_permits: string, js_code: string }[]}}
           */
          const { evals } = obj;
          return Promise.all(
            evals.map(({ json_permits: jsonPermit, js_code: code }) =>
              // Run in a new turn to avoid crosstalk of the evaluations.
              Promise.resolve()
                .then(() => {
                  const permit = JSON.parse(jsonPermit);
                  const powers = extractPowers(permit, {
                    evaluateInstallation,
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
        default:
          assert.fail(X`Unrecognized request ${obj.type}`);
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
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<ProvisioningVat>> }
 * }} powers
 */
export const makeProvisioner = async ({
  consume: { clientCreator, loadVat },
  vats: { comms, vattp },
  produce: { provisioning },
}) => {
  const provisionerVat = await E(loadVat)('provisioning');
  await E(provisionerVat).register(clientCreator, comms, vattp);
  provisioning.resolve(provisionerVat);
};
harden(makeProvisioner);

/** @param {BootstrapPowers} powers */
export const bridgeProvisioner = async ({
  consume: { provisioning, bridgeManager: bridgeManagerP },
}) => {
  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    return;
  }

  // Register a provisioning handler over the bridge.
  const handler = Far('provisioningHandler', {
    async fromBridge(_srcID, obj) {
      switch (obj.type) {
        case 'PLEASE_PROVISION': {
          const { nickname, address, powerFlags } = obj;
          return E(provisioning)
            .pleaseProvision(nickname, address, powerFlags)
            .catch(e =>
              console.error(`Error provisioning ${nickname} ${address}:`, e),
            )
            .then(_ => {});
        }
        default:
          assert.fail(X`Unrecognized request ${obj.type}`);
      }
    },
  });
  await E(bridgeManager).register(BRIDGE_ID.PROVISION, handler);
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
          bundleReady.promise.then(_ => Collect.allValues(clientHome)),
        getConfiguration: () => notifier,
      });

      observeIteration(subscription, {
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
}) => {
  const chainTimerService = E(timerVat).createTimerService(timerDevice);
  produceTimer.resolve(chainTimerService);
  return E(client).assignBundle([_addr => ({ chainTimerService })]);
};
harden(startTimerService);

/** @param {BootDevices<ChainDevices> & BootstrapSpace} powers */
export const makeBridgeManager = async ({
  devices: { bridge },
  vatPowers: { D },
  produce: { bridgeManager },
}) => {
  const myBridge = bridge ? makeBridgeManagerKit(E, D, bridge) : undefined;
  if (!myBridge) {
    console.warn(
      'Running without a bridge device; this is not an actual chain.',
    );
  }
  bridgeManager.resolve(myBridge);
};
harden(makeBridgeManager);

/**
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<ChainStorageVat>> }
 * }} powers
 */
export const makeChainStorage = async ({
  consume: { bridgeManager: bridgeManagerP, loadVat },
  produce: { chainStorage: chainStorageP },
}) => {
  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    console.warn('Cannot support chainStorage without an actual chain.');
    chainStorageP.resolve(null);
    return;
  }

  const ROOT_PATH = STORAGE_PATH.CUSTOM;

  const vat = E(loadVat)('chainStorage');
  const rootNodeP = E(vat).makeBridgedChainStorageRoot(
    bridgeManager,
    BRIDGE_ID.STORAGE,
    ROOT_PATH,
    { sequence: true },
  );
  chainStorageP.resolve(rootNodeP);
};

/**
 * @param {BootstrapPowers} powers
 * @param {{ options?: {agoricNamesOptions?: {
 *   topLevel?: string[]
 * }}}} config
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

  // brand, issuer, ...
  const { topLevel = keys(agoricNamesReserved) } = agoricNamesOptions || {};
  await Promise.all(
    topLevel.map(async kind => {
      const kindAdmin = await E(agoricNamesAdmin).lookupAdmin(kind);

      const kindNode = await E(nameStorage).makeChildNode(kind);
      const { publisher } = makeStoredPublishKit(kindNode, marshaller);
      publisher.publish([]);
      kindAdmin.onUpdate(publisher.publish);
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

/**
 * @param {SoloVats | NetVats} vats
 * @param {OptionalBridgeManager} dibcBridgeManager
 */
export const registerNetworkProtocols = async (vats, dibcBridgeManager) => {
  const ps = [];
  // Every vat has a loopback device.
  ps.push(
    E(vats.network).registerProtocolHandler(
      ['/local'],
      makeLoopbackProtocolHandler(),
    ),
  );
  if (dibcBridgeManager) {
    assert('ibc' in vats);
    // We have access to the bridge, and therefore IBC.
    const callbacks = Far('callbacks', {
      downcall(method, obj) {
        return dibcBridgeManager.toBridge(BRIDGE_ID.DIBC, {
          ...obj,
          type: 'IBC_METHOD',
          method,
        });
      },
    });
    const ibcHandler = await E(vats.ibc).createInstance(callbacks);
    dibcBridgeManager.register(BRIDGE_ID.DIBC, ibcHandler);
    ps.push(
      E(vats.network).registerProtocolHandler(
        ['/ibc-port', '/ibc-hop'],
        ibcHandler,
      ),
    );
  } else {
    const loHandler = makeLoopbackProtocolHandler(
      makeNonceMaker('ibc-channel/channel-'),
    );
    ps.push(E(vats.network).registerProtocolHandler(['/ibc-port'], loHandler));
  }
  await Promise.all(ps);

  // Add an echo listener on our ibc-port network (whether real or virtual).
  const echoPort = await E(vats.network).bind('/ibc-port/echo');

  return E(echoPort).addListener(
    Far('listener', {
      async onAccept(_port, _localAddr, _remoteAddr, _listenHandler) {
        return harden(makeEchoConnectionHandler());
      },
      async onListen(port, _listenHandler) {
        console.debug(`listening on echo port: ${port}`);
      },
    }),
  );
};

/**
 * @param { BootstrapPowers & {
 *   consume: { loadVat: VatLoader<any> }
 *   produce: { networkVat: Producer<any> }
 * }} powers
 *
 * // TODO: why doesn't overloading VatLoader work???
 * @typedef { ((name: 'network') => NetworkVat) &
 *            ((name: 'ibc') => IBCVat) } VatLoader2
 *
 * @typedef {{ network: NetworkVat, ibc: IBCVat, provisioning: ProvisioningVat}} NetVats
 */
export const setupNetworkProtocols = async ({
  consume: { client, loadVat, bridgeManager, provisioning },
  produce: { networkVat },
}) => {
  /** @type { NetVats } */
  const vats = {
    network: E(loadVat)('network'),
    ibc: E(loadVat)('ibc'),
    provisioning,
  };
  // don't proceed if loadVat fails
  await Promise.all(Object.values(vats));

  networkVat.reset();
  networkVat.resolve(vats.network);
  const dibcBridgeManager = await bridgeManager;

  const makePorts = async () => {
    // Bind to some fresh ports (unspecified name) on the IBC implementation
    // and provide them for the user to have.
    const ibcportP = [];
    for (let i = 0; i < NUM_IBC_PORTS_PER_CLIENT; i += 1) {
      const port = E(vats.network).bind('/ibc-port/');
      ibcportP.push(port);
    }
    return Promise.all(ibcportP);
  };

  // Note: before we add the pegasus transfer port,
  // we need to finish registering handlers for
  // ibc-port etc.
  await registerNetworkProtocols(vats, dibcBridgeManager);
  return E(client).assignBundle([_a => ({ ibcport: makePorts() })]);
};
