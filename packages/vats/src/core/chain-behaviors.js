// @ts-check
import { E, Far } from '@endo/far';
import * as farExports from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import {
  makeNotifierKit,
  makeSubscriptionKit,
  observeIteration,
} from '@agoric/notifier';
import {
  governanceBundles,
  economyBundles,
  ammBundle,
} from '@agoric/run-protocol/src/importedBundles.js';
import pegasusBundle from '@agoric/pegasus/bundles/bundle-pegasus.js';
import { CONTRACT_NAME as PEGASUS_NAME } from '@agoric/pegasus/src/install-on-chain.js';
import {
  makeLoopbackProtocolHandler,
  makeEchoConnectionHandler,
  makeNonceMaker,
} from '@agoric/swingset-vat/src/vats/network/index.js';

import * as Collect from '@agoric/run-protocol/src/collect.js';
import { makeBridgeManager as makeBridgeManagerKit } from '../bridge.js';
import * as BRIDGE_ID from '../bridge-ids.js';

import { callProperties, extractPowers } from './utils.js';
import { makeNameHubKit } from '../nameHub.js';

export { installOnChain as installPegasusOnChain } from '@agoric/pegasus/src/install-on-chain.js';

const { details: X } = assert;
const { keys } = Object;

const NUM_IBC_PORTS_PER_CLIENT = 3;

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
    consume: { bridgeManager: bridgeManagerP },
  } = allPowers;
  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    // Not running with a bridge.
    return;
  }

  // Register a coreEval handler over the bridge.
  const handler = Far('coreHandler', {
    async fromBridge(_srcID, obj) {
      switch (obj.type) {
        case 'CORE_EVAL': {
          /**
           * Type defined by
           * `agoric-sdk/golang/cosmos/proto/agoric/swingset/swingset.proto` CoreEval.
           *
           * @type {{ evals: { json_permits: string; js_code: string }[] }}
           */
          const { evals } = obj;
          return Promise.all(
            evals.map(({ json_permits: jsonPermit, js_code: code }) =>
              // Run in a new turn to avoid crosstalk of the evaluations.
              Promise.resolve().then(() => {
                const permit = JSON.parse(jsonPermit);
                const powers = extractPowers(permit, allPowers);

                // Inspired by ../repl.js:
                const globals = harden({
                  ...allPowers.modules,
                  ...farExports,
                  assert,
                  console,
                });

                // Evaluate the code in the context of the globals.
                const compartment = new Compartment(globals);
                harden(compartment.globalThis);
                const behavior = compartment.evaluate(code);
                return behavior(powers);
              }),
            ),
          );
        }
        default:
          assert.fail(X`Unrecognized request ${obj.type}`);
      }
    },
  });
  await E(bridgeManager).register(BRIDGE_ID.CORE, handler);
};
harden(bridgeCoreEval);

/**
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<ProvisioningVat>> };
 * }} powers
 */
export const makeProvisioner = async ({
  consume: { clientCreator, loadVat },
  vats: { comms, vattp },
  produce: { provisioning },
}) => {
  const provisionerVat = E(loadVat)('provisioning');
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
            );
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
 * @param {{ template: Record<string, unknown> }} config
 */
export const makeClientManager = async (
  { produce: { client, clientCreator: clientCreatorP } },
  { template } = {
    template: {
      agoricNames: true,
      bank: true,
      namesByAddress: true,
      myAddressNameAdmin: true,
      board: true,
      faucet: true,
      zoe: true,
    },
  },
) => {
  // Create a subscription of chain configurations.
  /** @type {SubscriptionRecord<PropertyMakers>} */
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
    createClientFacet: async (_nickname, clientAddress, _powerFlags) => {
      /** @type {Record<string, unknown>} */
      let clientHome = {};
      const bundleReady = makePromiseKit();

      const makeUpdatedConfiguration = async (newPropertyMakers = []) => {
        // Specialize the property makers with the client address.
        const newProperties = callProperties(newPropertyMakers, clientAddress);
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
harden(makeClientManager);

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
 * No free lunch on chain
 *
 * @param {BootstrapPowers} powers
 */
export const connectChainFaucet = async ({ consume: { client } }) => {
  const faucet = Far('faucet', { tapFaucet: () => harden([]) });

  return E(client).assignBundle([_addr => ({ faucet })]);
};
harden(connectChainFaucet);

// XXX: move shareBootContractBundles belongs in basic-behaviors.js
/** @param {BootstrapPowers} powers */
export const shareBootContractBundles = async ({
  produce: {
    centralSupplyBundle: centralP,
    pegasusBundle: pegasusP,
    mintHolderBundle,
  },
}) => {
  centralP.resolve(economyBundles.centralSupply);
  mintHolderBundle.resolve(economyBundles.mintHolder);
  pegasusP.resolve(pegasusBundle);
};

/** @param {BootstrapPowers} powers */
export const shareEconomyBundles = async ({
  produce: { ammBundle: ammP, vaultBundles, governanceBundles: govP },
}) => {
  govP.resolve(governanceBundles);
  ammP.resolve(ammBundle);
  vaultBundles.resolve({
    VaultFactory: economyBundles.VaultFactory,
    liquidate: economyBundles.liquidate,
  });
};
harden(shareEconomyBundles);

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
    dibcBridgeManager.register('dibc', ibcHandler);
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
 * @param {NetVats} vats
 * @param {any} pegasus
 * @param {NameAdmin} pegasusConnectionsAdmin
 */
const addPegasusTransferPort = async (
  vats,
  pegasus,
  pegasusConnectionsAdmin,
) => {
  const port = await E(vats.network).bind('/ibc-port/pegasus');

  const { handler, subscription } = await E(pegasus).makePegasusConnectionKit();
  observeIteration(subscription, {
    updateState(connectionState) {
      const { localAddr, actions } = connectionState;
      if (actions) {
        // We're open and ready for business.
        pegasusConnectionsAdmin.update(localAddr, connectionState);
      } else {
        // We're closed.
        pegasusConnectionsAdmin.delete(localAddr);
      }
    },
  });
  return E(port).addListener(
    Far('listener', {
      async onAccept(_port, _localAddr, _remoteAddr, _listenHandler) {
        return handler;
      },
      async onListen(p, _listenHandler) {
        console.debug(`Listening on Pegasus transfer port: ${p}`);
      },
    }),
  );
};

/**
 * @param {BootstrapPowers & {
 *   consume: { loadVat: VatLoader<any> };
 * }} powers
 *   // TODO: why doesn't overloading VatLoader work???
 *
 * @typedef {((name: 'network') => NetworkVat) & ((name: 'ibc') => IBCVat)} VatLoader2
 *
 * @typedef {{
 *   network: NetworkVat;
 *   ibc: IBCVat;
 *   provisioning: ProvisioningVat;
 * }} NetVats
 */
export const setupNetworkProtocols = async ({
  consume: { client, loadVat, bridgeManager, zoe, provisioning },
  produce: { pegasusConnections, pegasusConnectionsAdmin },
  instance: {
    consume: { [PEGASUS_NAME]: pegasusInstance },
  },
}) => {
  /** @type {NetVats} */
  const vats = {
    network: E(loadVat)('network'),
    ibc: E(loadVat)('ibc'),
    provisioning,
  };

  const { nameHub, nameAdmin } = makeNameHubKit();
  pegasusConnections.resolve(nameHub);
  pegasusConnectionsAdmin.resolve(nameAdmin);
  const [dibcBridgeManager, pegasus] = await Promise.all([
    bridgeManager,
    E(zoe).getPublicFacet(pegasusInstance),
  ]);

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
  return Promise.all([
    addPegasusTransferPort(vats, pegasus, nameAdmin),
    E(client).assignBundle([_a => ({ ibcport: makePorts() })]),
  ]);
};
