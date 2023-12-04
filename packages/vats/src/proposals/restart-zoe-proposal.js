import { E } from '@endo/far';

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     vatAdminSvc: VatAdminSvc;
 *     vatStore: MapStore<string, CreateVatResults>;
 *   };
 * }} powers
 * @param {object} options
 * @param {{ zoeRef: VatSourceRef; zcfRef: VatSourceRef }} options.options
 */
export const nullUpgradeZoe = async (
  { consume: { vatAdminSvc, vatStore } },
  options,
) => {
  const { zoeRef } = options.options;

  const zoeBundleCap = await E(vatAdminSvc).getBundleCap(zoeRef.bundleID);
  console.log(`ZOE BUNDLE ID: `, zoeRef.bundleID);

  const { adminNode } = await E(vatStore).get('zoe');

  await E(adminNode).upgrade(zoeBundleCap, {});
};

export const getManifestForUpgradingZoe = (_powers, { zoeRef }) => ({
  manifest: {
    [nullUpgradeZoe.name]: {
      consume: {
        vatAdminSvc: 'vatAdminSvc',
        vatStore: 'vatStore',
      },
      produce: {},
    },
  },
  options: { zoeRef },
});
