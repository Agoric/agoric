import { provideBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { E, makeLoopback } from '@endo/captp';
import { makeDurableZoeKit } from '../src/zoeService/zoe.js';
import fakeVatAdmin, { makeFakeVatAdmin } from './fakeVatAdmin.js';

/**
 * @param {VatAdminSvc} [vatAdminSvc]
 */
export const makeZoeKitForTest = (vatAdminSvc = fakeVatAdmin) => {
  return makeDurableZoeKit({
    vatAdminSvc,
    zoeBaggage: makeScalarBigMapStore('zoe baggage', { durable: true }),
  });
};

/**
 * @param {VatAdminSvc} [vatAdminSvc]
 */
export const makeZoeForTest = vatAdminSvc =>
  makeZoeKitForTest(vatAdminSvc).zoeService;

/**
 * Returns promises for `zoe` and the `feeMintAccess`.
 * Provide testing versions of capabilities for Zoe contracts.
 *
 * @template {object} [T=any]
 * @param {object} options
 * @param {(jig: T) => void} [options.setJig]
 * @param {FeeIssuerConfig} [options.feeIssuerConfig]
 * @param {VatAdminSvc} [options.vatAdminSvc]
 * @param {boolean} [options.useNearRemote]
 */
export const setUpZoeForTest = async ({
  setJig = () => {},
  feeIssuerConfig,
  vatAdminSvc,
  useNearRemote = false,
} = {}) => {
  const { makeFar, makeNear } = makeLoopback('zoeTest');

  /** @type {ReturnType<typeof makeFakeVatAdmin>['vatAdminState'] | undefined} */
  let vatAdminState;
  if (!vatAdminSvc) {
    ({ admin: vatAdminSvc, vatAdminState } = makeFakeVatAdmin(
      setJig,
      useNearRemote ? makeNear : undefined,
    ));
  }
  const { zoeService, feeMintAccess } = await makeFar(
    makeDurableZoeKit({
      vatAdminSvc,
      feeIssuerConfig,
      zoeBaggage: makeScalarBigMapStore('zoe baggage', { durable: true }),
    }),
  );

  /**
   * Load the path from a bundle cache and install it.
   *
   * @param {string} path
   * @returns {Promise<Installation>}
   */
  const bundleAndInstall = async path => {
    const bundleCache = await provideBundleCache('bundles', {}, s => import(s));
    const bundle = await bundleCache.load(path);
    const id = `b1-${path}`;
    assert(vatAdminState, 'installBundle called before vatAdminState defined');
    vatAdminState.installBundle(id, bundle);
    return E(zoeService).installBundleID(id);
  };

  return {
    zoe: zoeService,
    feeMintAccessP: feeMintAccess,
    bundleAndInstall,
    vatAdminSvc,
    vatAdminState,
  };
};
harden(setUpZoeForTest);
