import { E, Far } from '@endo/far';
import { makeNotifierKit } from '@agoric/notifier';
import {
  makeSyncMethodCallback,
  prepareGuardedAttenuator,
} from '@agoric/internal/src/callback.js';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { provide } from '@agoric/vat-data';
import {
  NameHubIKit,
  prepareMixinMyAddress,
  prepareNameHubKit,
} from './nameHub.js';

// This vat contains the controller-side provisioning service. To enable local
// testing, it is loaded by both the controller and other ag-solo vat machines.

/** @param {import('@agoric/zone').Zone} zone */
const prepareSpecializedNameAdmin = zone => {
  const mixinMyAddress = prepareMixinMyAddress(zone);

  /**
   * @type {import('@agoric/internal/src/callback.js').MakeAttenuator<
   *   import('./types.js').NamesByAddressAdmin
   * >}
   */
  const specialize = prepareGuardedAttenuator(zone, NameHubIKit.nameAdmin, {
    tag: 'NamesByAddressAdmin',
  });

  const makeOverrideFacet = zone.exoClass(
    'NamesByAddressAdminFacet',
    undefined, // TODO: interface guard. same as nameAdmin?
    /** @param {import('./types.js').NameAdmin} nameAdmin */
    nameAdmin => ({ nameAdmin }),
    {
      /**
       * @param {string} address
       * @param {string[]} [reserved]
       * @returns {Promise<{
       *   nameHub: import('./types.js').NameHub;
       *   nameAdmin: import('./types.js').MyAddressNameAdmin;
       * }>}
       */
      async provideChild(address, reserved) {
        const { nameAdmin } = this.state;
        const child = await nameAdmin.provideChild(address, reserved);
        return {
          nameHub: child.nameHub,
          nameAdmin: mixinMyAddress(child.nameAdmin, address),
        };
      },
      /** @param {string} address */
      async lookupAdmin(address) {
        const { nameAdmin } = this.state;
        // XXX relies on callers not to provide other admins via update()
        // TODO: enforce?

        /** @type {import('./types.js').MyAddressNameAdmin} */

        // @ts-expect-error cast
        const myAdmin = nameAdmin.lookupAdmin(address);
        return myAdmin;
      },
    },
  );

  /** @param {import('./types.js').NameAdmin} nameAdmin */
  const makeMyAddressNameAdmin = nameAdmin => {
    const overrideFacet = makeOverrideFacet(nameAdmin);
    return specialize({
      target: nameAdmin,
      overrides: {
        provideChild: makeSyncMethodCallback(overrideFacet, 'provideChild'),
        lookupAdmin: makeSyncMethodCallback(overrideFacet, 'lookupAdmin'),
      },
    });
  };

  return makeMyAddressNameAdmin;
};

/**
 * @param {unknown} _vatPowers
 * @param {unknown} _vatParameters
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export function buildRootObject(_vatPowers, _vatParameters, baggage) {
  const zone = makeDurableZone(baggage);
  const makeNameHubKit = prepareNameHubKit(zone);
  const makeNamesByAddressAdmin = prepareSpecializedNameAdmin(zone);

  const nameHubKit = provide(baggage, 'nameHubKit', () => makeNameHubKit());
  const namesByAddressAdmin = makeNamesByAddressAdmin(nameHubKit.nameAdmin);

  // xxx end-user ag-solo provisioning stuff (devnet only)
  /** @type {ERef<ClientCreator>} */
  let bundler;
  /** @type {CommsVatRoot} */
  let comms;
  /** @type {VattpVat} */
  let vattp;

  /**
   * @param {ERef<ClientCreator>} b
   * @param {CommsVatRoot} c
   * @param {VattpVat} v
   */
  async function register(b, c, v) {
    bundler = b;
    comms = c;
    vattp = v;
  }

  /**
   * @param {string} nickname
   * @param {string} address
   * @param {string[]} powerFlags
   */
  async function pleaseProvision(nickname, address, powerFlags) {
    /** @type {ERef<ClientFacet>} */
    let clientFacet;
    const fetch = Far('fetch', {
      async getChainBundle() {
        console.warn('getting chain bundle');
        return E(clientFacet).getChainBundle();
      },
      getConfiguration() {
        console.warn('getting configuration');
        return E(clientFacet).getConfiguration();
      },
    });

    // Add a remote and egress for the pubkey.
    const { transmitter, setReceiver } = await E(vattp).addRemote(address);
    await E(comms).addRemote(address, transmitter, setReceiver);

    const INDEX = 1;
    await E(comms).addEgress(address, INDEX, fetch);

    // Do this here so that any side-effects don't happen unless
    // the egress has been successfully added.
    clientFacet = E(bundler)
      .createClientFacet(nickname, address, powerFlags || [])
      .catch(e => {
        console.warn(`Failed to create client facet:`, e);
        // Emulate with existing createUserBundle.
        const chainBundle = E(bundler).createUserBundle(
          nickname,
          address,
          powerFlags || [],
        );
        // Update the notifier when the chainBundle resolves.
        const { notifier, updater } = makeNotifierKit();
        void E.when(chainBundle, clientHome => {
          updater.updateState(harden({ clientHome, clientAddress: address }));
        });
        return Far('emulatedClientFacet', {
          getChainBundle: async () => chainBundle,
          getConfiguration: () => notifier,
        });
      });

    return { ingressIndex: INDEX };
  }

  return Far('root', {
    register,
    pleaseProvision,
    getNamesByAddressKit: () =>
      harden({ namesByAddress: nameHubKit.nameHub, namesByAddressAdmin }),
  });
}
