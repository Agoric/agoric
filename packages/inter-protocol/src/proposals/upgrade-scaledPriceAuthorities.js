import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';

const trace = makeTracer('upgradeScaledPA', true);

/**
 * @param {ChainBootstrapSpace} powers
 * @param {{ options: { scaledPARef: { bundleID: string } } }} options
 */
export const upgradeScaledPriceAuthorities = async (
  {
    consume: {
      agoricNamesAdmin,
      contractKits: contractKitsP,
      instancePrivateArgs: instancePrivateArgsP,
      zoe,
    },
  },
  { options },
) => {
  trace('start');
  const { scaledPARef } = options;
  await null;

  const bundleID = scaledPARef.bundleID;
  if (scaledPARef && bundleID) {
    await E.when(
      E(zoe).installBundleID(bundleID),
      async installation =>
        E(E(agoricNamesAdmin).lookupAdmin('installation')).update(
          'scaledPriceAuthority',
          installation,
        ),
      err =>
        console.error(
          `🚨 failed to update scaledPriceAuthority installation`,
          err,
        ),
    );
  }

  const [contractKits, instancePrivateArgs] = await Promise.all([
    contractKitsP,
    instancePrivateArgsP,
  ]);
  /** @type {StartedInstanceKit<any>[]} */
  const scaledPAKitEntries = Array.from(contractKits.values()).filter(
    kit => kit.label && kit.label.match(/scaledPriceAuthority/),
  );

  for (const kitEntry of scaledPAKitEntries) {
    const { instance } = kitEntry;
    const privateArgs = instancePrivateArgs.get(instance);
    trace('upgrade scaledPriceAuthority', kitEntry.label);
    await E(kitEntry.adminFacet).upgradeContract(bundleID, privateArgs);
  }
};

const t = 'upgradeScaledPriceAuthority';
export const getManifestForUpgradeScaledPriceAuthorities = async (
  _ign,
  upgradeSPAOptions,
) => ({
  manifest: {
    [upgradeScaledPriceAuthorities.name]: {
      consume: {
        agoricNamesAdmin: t,
        contractKits: t,
        instancePrivateArgs: t,
        zoe: t,
      },
      instance: {
        produce: t,
      },
    },
  },
  options: { ...upgradeSPAOptions },
});
