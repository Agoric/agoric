import { E } from '@endo/far';

/**
 * @param { BootstrapPowers & {
 *   consume: {
 *     vatAdminSvc: VatAdminSve,
 *     vatStore: MapStore<string, CreateVatResults>,
 *   }
 * }} powers
 *
 * @param {object} options
 * @param {{zoeRef: VatSourceRef, zcfRef: VatSourceRef}} options.options
 */
export const upgradeZcf = async (
  { consume: { vatAdminSvc, vatStore } },
  options,
) => {
  const { zoeRef, zcfRef } = options.options;

  const zoeBundleCap = await E(vatAdminSvc).getBundleCap(zoeRef.bundleID);

  const { adminNode, root: zoeRoot } = await E(vatStore).get('zoe');

  await E(adminNode).upgrade(zoeBundleCap, {});

  const zoeConfigFacet = await E(zoeRoot).getZoeConfigFacet();
  await E(zoeConfigFacet).updateZcfBundleId(zcfRef.bundleID);
};

export const getManifestForZoe = (_powers, { zoeRef, zcfRef }) => ({
  manifest: {
    [upgradeZcf.name]: {
      consume: {
        vatAdminSvc: 'vatAdminSvc',
        vatStore: 'vatStore',
      },
      produce: {},
    },
  },
  options: {
    zoeRef,
    zcfRef,
  },
});
