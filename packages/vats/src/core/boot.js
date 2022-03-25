// @ts-check
import { E, Far } from '@endo/far';

import {
  extractPowers,
  makeAgoricNamesAccess,
  makePromiseSpace,
} from './utils.js';
import {
  CLIENT_BOOTSTRAP_MANIFEST,
  CHAIN_BOOTSTRAP_MANIFEST,
  SIM_CHAIN_BOOTSTRAP_MANIFEST,
  CHAIN_POST_BOOT_MANIFEST,
  SIM_CHAIN_POST_BOOT_MANIFEST,
} from './manifest.js';

import * as behaviors from './behaviors.js';
import * as simBehaviors from './sim-behaviors.js';
import * as clientBehaviors from './client-behaviors.js';
import * as utils from './utils.js';

const { entries } = Object;
const { details: X, quote: q } = assert;

// Choose a manifest based on runtime configured argv.ROLE.
const roleToManifest = harden({
  chain: CHAIN_BOOTSTRAP_MANIFEST,
  'sim-chain': SIM_CHAIN_BOOTSTRAP_MANIFEST,
  client: CLIENT_BOOTSTRAP_MANIFEST,
});
const roleToBehaviors = harden({
  'sim-chain': { ...behaviors, ...simBehaviors },
  // copy to avoid trying to harden a module namespace
  client: { ...clientBehaviors },
});
const roleToGovernanceActions = harden({
  chain: CHAIN_POST_BOOT_MANIFEST,
  'sim-chain': SIM_CHAIN_POST_BOOT_MANIFEST,
  client: {},
});

/**
 * Build root object of the bootstrap vat.
 *
 * @param {{
 *   D: DProxy;
 * }} vatPowers
 * @param {{
 *   argv: { ROLE: string };
 *   bootstrapManifest?: Record<string, Record<string, unknown>>;
 *   governanceActions?: boolean;
 * }} vatParameters
 */
const buildRootObject = (vatPowers, vatParameters) => {
  // @ts-expect-error no TS defs for rickety test scaffolding
  const log = vatPowers.logger || console.info;
  const { produce, consume } = makePromiseSpace(log);
  const { agoricNames, spaces } = makeAgoricNamesAccess(log);
  produce.agoricNames.resolve(agoricNames);

  const {
    argv: { ROLE },
    bootstrapManifest,
  } = vatParameters;
  console.debug(`${ROLE} bootstrap starting`);

  const bootManifest = bootstrapManifest || roleToManifest[ROLE];
  const bootBehaviors = roleToBehaviors[ROLE] || behaviors;
  assert(bootManifest, X`no configured bootstrapManifest for role ${ROLE}`);
  assert(bootBehaviors, X`no configured bootstrapBehaviors for role ${ROLE}`);

  return Far('bootstrap', {
    /**
     * Bootstrap vats and devices.
     *
     * @param {SwingsetVats} vats
     * @param {SoloDevices | ChainDevices} devices
     */
    bootstrap: async (vats, devices) => {
      // Complete SwingSet wiring.
      const { D } = vatPowers;
      D(devices.mailbox).registerInboundHandler(vats.vattp);
      await E(vats.vattp).registerMailboxDevice(devices.mailbox);

      /** @param {Record<string, Record<string, unknown>>} manifest */
      const runBehaviors = manifest => {
        // TODO: Aspires to be BootstrapPowers, but it's too specific.
        const allPowers = harden({
          vatPowers,
          vatParameters,
          vats,
          devices,
          produce,
          consume,
          ...spaces,
          runBehaviors,
          // These module namespaces might be useful for core eval governance.
          modules: {
            clientBehaviors: { ...clientBehaviors },
            simBehaviors: { ...simBehaviors },
            behaviors: { ...behaviors },
            utils: { ...utils },
          },
        });
        return Promise.all(
          entries(manifest).map(([name, permit]) =>
            Promise.resolve().then(() => {
              const powers = extractPowers(permit, allPowers);
              const config = vatParameters[name];
              log(`bootstrap: ${name}(${q(permit)})`);
              assert(
                name in bootBehaviors,
                `${name} not in ${Object.keys(bootBehaviors).join(',')}`,
              );
              return bootBehaviors[name](powers, config);
            }),
          ),
        );
      };

      await runBehaviors(bootManifest);
      if (vatParameters.governanceActions) {
        const actions = roleToGovernanceActions[ROLE];
        await runBehaviors(actions);
      }
    },
  });
};

harden({ buildRootObject });
export { buildRootObject };
