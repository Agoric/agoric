import { assert } from '@agoric/assert';
import {
  M,
  prepareExo,
  prepareKind,
  provideDurableWeakMapStore,
} from '@agoric/vat-data';
import {
  InstallationShape,
  InstanceHandleShape,
  UnwrappedInstallationShape,
} from '../typeGuards.js';

const { Fail, quote: q } = assert;

/** @typedef { import('@agoric/swingset-vat').BundleCap} BundleCap */
/** @typedef { import('@agoric/swingset-vat').BundleID} BundleID */
/** @import {Baggage} from '@agoric/vat-data' */

/**
 * @param {GetBundleCapForID} getBundleCapForID
 * @param {Baggage} zoeBaggage
 */
export const makeInstallationStorage = (getBundleCapForID, zoeBaggage) => {
  /** @type {WeakMapStore<Installation, { bundleCap: BundleCap, bundleID: BundleID }>} */
  const installationsBundleCap = provideDurableWeakMapStore(
    zoeBaggage,
    'installationsBundleCap',
  );
  /** @type {WeakMapStore<Installation, SourceBundle>} */
  const installationsBundle = provideDurableWeakMapStore(
    zoeBaggage,
    'installationsBundle',
  );

  /** @type {(bundleLabel: string) => Installation<unknown>} */
  const makeBundleIDInstallation = prepareKind(
    zoeBaggage,
    'BundleIDInstallation',
    bundleLabel => ({ bundleLabel }),
    {
      getBundle: _context => Fail`bundleID-based Installation`,
      getBundleLabel: ({ state: { bundleLabel } }) => bundleLabel,
    },
  );

  /** @type {(bundle: SourceBundle, bundleLabel?: string) => Installation<unknown>} */
  const makeBundleInstallation = prepareKind(
    zoeBaggage,
    'BundleInstallation',
    (bundle, bundleLabel) => ({ bundle, bundleLabel }),
    {
      getBundle: ({ state: { bundle } }) => bundle,
      getBundleLabel: ({ state: { bundleLabel } }) => bundleLabel,
    },
  );

  /**
   * Create an installation from a bundle ID or a full bundle. If we are
   * given a bundle ID, wait for the corresponding code bundle to be received
   * by the swingset kernel, then store its bundlecap. The code is currently
   * evaluated each time it is used to make a new instance of a contract.
   * When SwingSet supports zygotes, the code will be evaluated once when
   * creating a zcfZygote, then the start() function will be called each time
   * an instance is started.
   */

  /** @type {InstallBundle} */
  const installSourceBundle = async (bundle, bundleLabel) => {
    typeof bundle === 'object' || Fail`a bundle must be provided`;
    /** @type {Installation} */
    bundle || Fail`a bundle must be provided`;
    const installation = makeBundleInstallation(bundle, bundleLabel);
    installationsBundle.init(installation, bundle);
    return installation;
  };

  const InstallationStorageI = M.interface('InstallationStorage', {
    installBundle: M.call(
      M.or(
        InstanceHandleShape,
        M.recordOf(M.string(), M.string({ stringLengthLimit: Infinity })),
      ),
    )
      .optional(M.string())
      .returns(M.promise()),
    installBundleID: M.call(M.string())
      .optional(M.string())
      .returns(M.promise()),
    unwrapInstallation: M.callWhen(M.await(InstallationShape)).returns(
      UnwrappedInstallationShape,
    ),
    getBundleIDFromInstallation: M.callWhen(M.await(InstallationShape)).returns(
      M.eref(M.string()),
    ),
  });

  const installationStorage = prepareExo(
    zoeBaggage,
    'InstallationStorage',
    InstallationStorageI,
    {
      async installBundle(allegedBundle, bundleLabel) {
        // @ts-expect-error TS doesn't understand context
        const { self } = this;
        // Bundle is a very open-ended type and we must decide here whether to
        // treat it as either a HashBundle or SourceBundle. So we have to
        // inspect it.
        typeof allegedBundle === 'object' || Fail`a bundle must be provided`;
        allegedBundle !== null || Fail`a bundle must be provided`;
        const { moduleFormat } = allegedBundle;
        if (moduleFormat === 'endoZipBase64Sha512') {
          const { endoZipBase64Sha512 } = allegedBundle;
          typeof endoZipBase64Sha512 === 'string' ||
            Fail`bundle endoZipBase64Sha512 must be a string, got ${q(
              endoZipBase64Sha512,
            )}`;
          return self.installBundleID(`b1-${endoZipBase64Sha512}`, bundleLabel);
        }
        return installSourceBundle(allegedBundle, bundleLabel);
      },
      async installBundleID(bundleID, bundleLabel = bundleID.slice(0, 9)) {
        typeof bundleID === 'string' || Fail`a bundle ID must be provided`;
        typeof bundleLabel === 'string' ||
          Fail`a bundle label must be a string`;

        // this waits until someone tells the host application to store the
        // bundle into the kernel, with controller.validateAndInstallBundle()
        const bundleCap = await getBundleCapForID(bundleID);
        // AWAIT

        const installation = makeBundleIDInstallation(bundleLabel);
        installationsBundleCap.init(
          installation,
          harden({ bundleCap, bundleID }),
        );
        return installation;
      },
      unwrapInstallation(installation) {
        if (installationsBundleCap.has(installation)) {
          const { bundleCap, bundleID } =
            installationsBundleCap.get(installation);
          return { bundleCap, bundleID, installation };
        } else if (installationsBundle.has(installation)) {
          const bundle = installationsBundle.get(installation);
          return { bundle, installation };
        } else {
          throw Fail`${installation} was not a valid installation`;
        }
      },
      async getBundleIDFromInstallation(allegedInstallation) {
        // @ts-expect-error TS doesn't understand context
        const { self } = this;
        const { bundleID } = await self.unwrapInstallation(allegedInstallation);
        // AWAIT
        bundleID || Fail`installation does not have a bundle ID`;
        return bundleID;
      },
    },
  );

  return installationStorage;
};
