// @ts-check
const t = 'makeCoreProposalBehavior';

/**
 * TODO import these from @agoric/vats when the types are better managed
 *
 * @typedef {*} ChainBootstrapSpace
 * @typedef {*} BootstrapPowers
 */

// These permits limit the powers passed to the `behavior` function returned by
// `makeCoreProposalBehavior`.
export const permits = {
  consume: { agoricNamesAdmin: t, vatAdminSvc: t, zoe: t },
  evaluateBundleCap: t,
  installation: { produce: t },
  modules: { utils: { runModuleBehaviors: t } },
};

/**
 * Create a behavior for a core-eval proposal.
 *
 * We rely on directly stringifying this function to leverage our JS toolchain
 * for catching bugs.  Thus, this maker must not reference any other modules or
 * definitions.
 *
 * @param {object} opts
 * @param {import('./externalTypes.js').ManifestBundleRef} opts.manifestBundleRef
 * @param {[methodName: string, ...args: unknown[]]} opts.getManifestCall
 * @param {Record<string, Record<string, unknown>>} [opts.overrideManifest]
 * @param {typeof import('@endo/far').E} opts.E
 * @param {(...args: unknown[]) => void} [opts.log]
 * @param {(ref: import('./externalTypes.js').ManifestBundleRef) => Promise<import('@agoric/zoe/src/zoeService/utils.js').Installation<unknown>>} [opts.restoreRef]
 * @returns {(vatPowers: unknown) => Promise<unknown>}
 */
export const makeCoreProposalBehavior = ({
  manifestBundleRef,
  getManifestCall: [manifestGetterName, ...manifestGetterArgs],
  overrideManifest,
  E,
  log = console.info,
  restoreRef: overrideRestoreRef,
}) => {
  const { entries, fromEntries } = Object;

  /**
   * Given an object whose properties may be promise-valued, return a promise
   * for an analogous object in which each such value has been replaced with its
   * fulfillment.
   * This is a non-recursive form of endo `deeplyFulfilled`.
   *
   * @template T
   * @param {{[K in keyof T]: (T[K] | Promise<T[K]>)}} obj
   * @returns {Promise<T>}
   */
  const shallowlyFulfilled = async obj => {
    if (!obj) {
      return obj;
    }
    const awaitedEntries = await Promise.all(
      entries(obj).map(async ([key, valueP]) => {
        const value = await valueP;
        return [key, value];
      }),
    );
    return fromEntries(awaitedEntries);
  };

  const makeRestoreRef = (vatAdminSvc, zoe) => {
    /** @type {(ref: import('./externalTypes.js').ManifestBundleRef) => Promise<Installation<unknown>>} */
    const defaultRestoreRef = async bundleRef => {
      // extract-proposal.js creates these records, and bundleName is
      // the optional name under which the bundle was installed into
      // config.bundles
      const bundleIdP =
        'bundleName' in bundleRef
          ? E(vatAdminSvc).getBundleIDByName(bundleRef.bundleName)
          : bundleRef.bundleID;
      const bundleID = await bundleIdP;
      const label = bundleID.slice(0, 8);
      return E(zoe).installBundleID(bundleID, label);
    };
    return defaultRestoreRef;
  };

  /** @param {ChainBootstrapSpace & BootstrapPowers & { evaluateBundleCap: any }} powers */
  const behavior = async powers => {
    // NOTE: If updating any of these names extracted from `powers`, you must
    // change `permits` above to reflect their accessibility.
    const {
      consume: { vatAdminSvc, zoe, agoricNamesAdmin },
      evaluateBundleCap,
      installation: { produce: produceInstallations },
      modules: {
        utils: { runModuleBehaviors },
      },
    } = powers;

    // Get the on-chain installation containing the manifest and behaviors.
    log('evaluateBundleCap', {
      manifestBundleRef,
      manifestGetterName,
      vatAdminSvc,
    });
    let bcapP;
    if ('bundleName' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getNamedBundleCap(manifestBundleRef.bundleName);
    } else if ('bundleID' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getBundleCap(manifestBundleRef.bundleID);
    } else {
      const keys = Reflect.ownKeys(manifestBundleRef).map(key =>
        typeof key === 'string' ? JSON.stringify(key) : String(key),
      );
      const keysStr = `[${keys.join(', ')}]`;
      throw Error(
        `bundleRef must have own bundleName or bundleID, missing in ${keysStr}`,
      );
    }
    const bundleCap = await bcapP;

    const installationNS = await evaluateBundleCap(bundleCap);

    // Get the manifest and its metadata.
    log('execute', {
      manifestGetterName,
      bundleExports: Object.keys(installationNS),
    });
    const restoreRef = overrideRestoreRef || makeRestoreRef(vatAdminSvc, zoe);
    const {
      manifest,
      options: rawOptions,
      installations: rawInstallations,
    } = await installationNS[manifestGetterName](
      harden({ restoreRef }),
      ...manifestGetterArgs,
    );

    // Await promises in the returned options and installations records.
    const [options, installations] = await Promise.all(
      [rawOptions, rawInstallations].map(shallowlyFulfilled),
    );

    // Publish the installations for our dependencies.
    const installAdmin = E(agoricNamesAdmin).lookupAdmin('installation');
    await Promise.all(
      entries(installations || {}).map(([key, value]) => {
        produceInstallations[key].resolve(value);
        return E(installAdmin).update(key, value);
      }),
    );

    // Evaluate the manifest.
    return runModuleBehaviors({
      allPowers: powers,
      behaviors: installationNS,
      manifest: overrideManifest || manifest,
      makeConfig: (name, _permit) => {
        log('coreProposal:', name);
        return { options };
      },
    });
  };

  return behavior;
};

export const makeEnactCoreProposalsFromBundleRef =
  ({ makeCoreProposalArgs, E }) =>
  async powers => {
    await Promise.all(
      makeCoreProposalArgs.map(async ({ ref, call, overrideManifest }) => {
        const subBehavior = makeCoreProposalBehavior({
          manifestBundleRef: ref,
          getManifestCall: call,
          overrideManifest,
          E,
        });
        return subBehavior(powers);
      }),
    );
  };
