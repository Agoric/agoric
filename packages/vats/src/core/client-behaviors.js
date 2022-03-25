// @ts-check
import { E, Far } from '@endo/far';
import { makePluginManager } from '@agoric/swingset-vat/src/vats/plugin-manager.js';
import { deeplyFulfilled } from '@endo/marshal';
import { observeNotifier } from '@agoric/notifier';
import { registerNetworkProtocols } from './chain-behaviors.js';

export { makeVatsFromBundles } from './basic-behaviors.js';

const { details: X } = assert;

const PROVISIONER_INDEX = 1;

function makeVattpFrom(vats) {
  const { vattp, comms } = vats;
  return Far('vattp', {
    makeNetworkHost(allegedName, console = undefined) {
      return E(vattp).makeNetworkHost(allegedName, comms, console);
    },
  });
}

// objects that live in the client's solo vat. Some services should only
// be in the DApp environment (or only in end-user), but we're not yet
// making a distinction, so the user also gets them.
/**
 * @param {SoloVats & SwingsetVats} vats
 * @param {SoloDevices} devices
 * @param {ERef<VatAdminSvc>} vatAdminSvc
 * @param {{ [prop: string]: any; D: DProxy }} vatPowers
 */
async function createLocalBundle(vats, devices, vatAdminSvc, vatPowers) {
  // This will eventually be a vat spawning service. Only needed by dev
  // environments.
  const spawner = E(vats.spawner).buildSpawner(vatAdminSvc);

  const localTimerService = E(vats.timer).createTimerService(devices.timer);

  // Needed for DApps, maybe for user clients.
  const scratch = E(vats.uploads).getUploads();

  // Only create the plugin manager if the device exists.
  let plugin;
  if (devices.plugin) {
    // @ts-expect-error conflicting D() types
    plugin = makePluginManager(devices.plugin, vatPowers);
  }

  // This will allow dApp developers to register in their api/deploy.js
  const httpRegCallback = Far('httpRegCallback', {
    doneLoading(subsystems) {
      return E(vats.http).doneLoading(subsystems);
    },
    send(obj, connectionHandles) {
      return E(vats.http).send(obj, connectionHandles);
    },
    registerURLHandler(handler, path) {
      return E(vats.http).registerURLHandler(handler, path);
    },
    registerAPIHandler(handler) {
      return E(vats.http).registerURLHandler(handler, '/api');
    },
    async registerWallet(wallet, privateWallet, privateWalletBridge) {
      await Promise.all([
        E(vats.http).registerURLHandler(privateWallet, '/private/wallet'),
        E(vats.http).registerURLHandler(
          privateWalletBridge,
          '/private/wallet-bridge',
        ),
        E(vats.http).setWallet(wallet),
      ]);
    },
  });

  const bundleP = harden({
    ...(plugin ? { plugin } : {}),
    scratch,
    spawner,
    localTimerService,
    network: vats.network,
    http: httpRegCallback,
    vattp: makeVattpFrom(vats),
  });
  /** @type {typeof bundleP} */
  const bundle = deeplyFulfilled(bundleP);
  return bundle;
}

/**
 * @param {BootDevices<SoloDevices> &
 *   BootstrapSpace & {
 *     vatParameters: BootstrapVatParams;
 *     vats: SwingsetVats & SoloVats;
 *   }} powers
 */
export const startClient = async ({
  vatParameters: {
    argv: { FIXME_GCI },
  },
  devices,
  vats,
  vatPowers,
  consume: { vatAdminSvc },
}) => {
  let localBundle;
  let chainBundle;
  let deprecated = {};

  // Tell the http server about our presences.  This can be called in
  // any order (whether localBundle and/or chainBundle are set or not).
  const updatePresences = () =>
    E(vats.http).setPresences(localBundle, chainBundle, deprecated);

  const { D } = vatPowers;
  async function setupCommandDevice(httpVat, cmdDevice, roles) {
    await E(httpVat).setCommandDevice(cmdDevice, roles);
    D(cmdDevice).registerInboundHandler(httpVat);
  }
  const addLocalPresences = async () => {
    await registerNetworkProtocols(vats, undefined);

    await setupCommandDevice(vats.http, devices.command, {
      client: true,
    });
    localBundle = await createLocalBundle(
      vats,
      devices,
      vatAdminSvc,
      vatPowers,
    );

    // TODO: Remove this alias when we can.
    deprecated = harden({ ...deprecated, uploads: localBundle.scratch });
    await updatePresences();
  };

  async function addRemote(addr) {
    const { transmitter, setReceiver } = await E(vats.vattp).addRemote(addr);
    await E(vats.comms).addRemote(addr, transmitter, setReceiver);
  }

  const addChainPresences = async () => {
    assert(FIXME_GCI, X`client must be given GCI`);
    await addRemote(FIXME_GCI);
    // addEgress(..., index, ...) is called in vat-provisioning.
    const chainProvider = E(vats.comms).addIngress(
      FIXME_GCI,
      PROVISIONER_INDEX,
    );

    // Observe any configuration changes and update the chain bundle
    // accordingly.
    const configNotifier = await E(chainProvider).getConfiguration();
    await observeNotifier(configNotifier, {
      updateState(state) {
        const { clientHome } = state;
        chainBundle = clientHome;
        updatePresences();
      },
    });
  };

  // We race to add presences, regardless of order.  This allows a solo
  // REPL to be useful even if only some of the presences have loaded.
  await Promise.all([addLocalPresences(), addChainPresences()]);
};
harden(startClient);
