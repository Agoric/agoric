import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';

import { startScaledPriceAuthority } from './addAssetToVault.js';
import { scaledPriceFeedName } from './utils.js';

const trace = makeTracer('replaceScaledPA', true);

/**
 * @param {BootstrapPowers} powers
 * @param {object} config
 * @param {object} config.options
 */
export const replaceScaledPriceAuthority = async (powers, { options }) => {
  const {
    instance: { produce: produceInstance },
  } = powers;
  const { issuerName } = options.interchainAssetOptions;

  const spaKit = await startScaledPriceAuthority(powers, { options });

  const label = scaledPriceFeedName(issuerName);
  produceInstance[label].reset();

  // publish into agoricNames. This must stay after registerPriceAuthority,
  // which is called by startScaledPriceAuthority()
  produceInstance[label].resolve(spaKit.instance);
};

/**
 * Look up the existing assets known to auctions, and replace the corresponding
 * scaledPriceAuthorities. The existing contracts will be left behind to be
 * cleaned up later.
 *
 * @param {ChainBootstrapSpace & BootstrapPowers} powers
 * @param {{ options: { scaledPARef: { bundleID: string } } }} options
 */
export const replaceScaledPriceAuthorities = async (powers, { options }) => {
  trace('start');
  const {
    consume: {
      agoricNamesAdmin,
      agoricNames,
      contractKits: contractKitsP,
      zoe,
    },
  } = powers;

  const { scaledPARef } = options;

  const installationsAdmin = E(agoricNamesAdmin).lookupAdmin('installation');
  const [spaInstallation, contractKits] = await Promise.all([
    E(E(installationsAdmin).readonly()).lookup('scaledPriceAuthority'),
    contractKitsP,
  ]);

  const bundleID = scaledPARef.bundleID;
  if (scaledPARef && bundleID) {
    await E.when(
      E(zoe).installBundleID(bundleID),
      async installation =>
        E(installationsAdmin).update('scaledPriceAuthority', installation),
      err =>
        console.error(
          `🚨 failed to update scaledPriceAuthority installation`,
          err,
        ),
    );
    trace('installed scaledPriceAuthority bundle', bundleID);
  }

  // Ask Zoe for the installation for each kit's instance, and return all the
  // kits where that matches the given installation.
  async function maybeSPAKit(kit) {
    const installation = await E(zoe).getInstallationForInstance(kit.instance);
    return spaInstallation === installation ? [kit] : [];
  }
  const scaledPAKits = (
    await Promise.all([...contractKits.values()].map(maybeSPAKit))
  ).flat();

  const namedBrands = await E(E(agoricNames).lookup('brand')).entries();

  for (const kitEntry of scaledPAKits) {
    const { instance } = kitEntry;
    const terms = await E(powers.consume.zoe).getTerms(instance);
    const { brand } = terms.scaleIn.denominator;
    const entry = namedBrands.find(([_k, v]) => v === brand);
    assert(entry, 'unable to find issuerName for ', brand);
    const issuerName = entry[0];
    await replaceScaledPriceAuthority(powers, {
      options: { interchainAssetOptions: { issuerName } },
    });
  }
};

const t = 'replaceScaledPriceAuthority';
export const getManifestForReplaceScaledPriceAuthorities = async (
  _ign,
  upgradeSPAOptions,
) => ({
  manifest: {
    [replaceScaledPriceAuthorities.name]: {
      consume: {
        // //// Widely known  ////
        agoricNames: t,
        priceAuthority: t,
        startUpgradable: t,
        zoe: t,

        // //// closely held, powerful ////
        agoricNamesAdmin: t,
        contractKits: t,
        priceAuthorityAdmin: t,
      },
      instance: {
        // This is a right to add/replace any instance. That we update only the
        // relevant ones must be verified by inspection.
        produce: t,
      },
    },
  },
  options: { ...upgradeSPAOptions },
});
