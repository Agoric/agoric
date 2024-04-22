// @ts-check
import { V as E } from '@agoric/vat-data/vow.js';
import { Far } from '@endo/far';

/** @import { AttenuatedNetwork, Orchestration, OrchestrationVat } from '../types' */

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     loadCriticalVat: VatLoader<any>;
 *     networkVat: NetworkVat;
 *   };
 *   produce: {
 *     orchestration: Producer<any>;
 *     orchestrationKit: Producer<any>;
 *     orchestrationVat: Producer<any>;
 *   };
 * }} powers
 * @param {object} options
 * @param {{ orchestrationRef: VatSourceRef }} options.options
 *
 * @typedef {{
 *   orchestration: ERef<OrchestrationVat>;
 * }} OrchestrationVats
 */
export const setupOrchestrationVat = async (
  {
    consume: { loadCriticalVat, networkVat },
    produce: {
      orchestrationVat,
      orchestration,
      orchestrationKit: orchestrationKitP,
    },
  },
  options,
) => {
  const { orchestrationRef } = options.options;
  /** @type {OrchestrationVats} */
  const vats = {
    orchestration: E(loadCriticalVat)('orchestration', orchestrationRef),
  };
  // don't proceed if loadCriticalVat fails
  await Promise.all(Object.values(vats));

  orchestrationVat.reset();
  orchestrationVat.resolve(vats.orchestration);

  await networkVat;
  /** @type {AttenuatedNetwork} */
  const network = Far('Attenuated Network', {
    async getPortAllocator() {
      return E(networkVat).getPortAllocator();
    },
  });

  const newOrchestrationKit = await E(vats.orchestration).makeOrchestration({
    network,
  });

  orchestration.reset();
  orchestration.resolve(newOrchestrationKit.public);
  orchestrationKitP.reset();
  orchestrationKitP.resolve(newOrchestrationKit);
};

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     orchestration: Orchestration;
 *   };
 * }} powers
 * @param {object} _options
 */
export const addOrchestrationToClient = async (
  { consume: { client, orchestration } },
  _options,
) => {
  return E(client).assignBundle([_a => ({ orchestration })]);
};

export const getManifestForOrchestration = (_powers, { orchestrationRef }) => ({
  manifest: {
    [setupOrchestrationVat.name]: {
      consume: {
        loadCriticalVat: true,
        networkVat: true,
      },
      produce: {
        orchestration: 'orchestration',
        orchestrationKit: 'orchestration',
        orchestrationVat: 'orchestration',
      },
    },
  },
  options: {
    orchestrationRef,
  },
});
