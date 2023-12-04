// @ts-check
import { E } from '@endo/far';

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     vatAdminSvc: VatAdminSvc;
 *     vatStore: MapStore<
 *       string,
 *       import('@agoric/swingset-vat').CreateVatResults
 *     >;
 *   };
 * }} powers
 * @param {object} opt
 * @param {{ vatAdminRef: VatSourceRef }} opt.options
 */
export const restartVatAdmin = async (
  { vats },
  { options: { vatAdminRef } },
) => {
  console.log(`VAT-ADMIN BUNDLE ID: `, vatAdminRef.bundleID);
  assert(vatAdminRef.bundleID);

  const vatAdmin = await vats.vatAdmin;

  console.log('Awaiting upgradeStaticVat vat-admin');
  await E(vatAdmin).upgradeStaticVat(
    'v2', // supposed vatID of vat-admin vat
    vatAdmin,
    vatAdminRef.bundleID,
  );
  console.log('Completed upgradeStaticVat vat-admin');
};

export const getManifest = (_powers, { vatAdminRef }) => ({
  manifest: {
    [restartVatAdmin.name]: {
      consume: {
        vatAdminSvc: 'vatAdminSvc',
        vatStore: 'vatStore',
      },
      produce: {},
      vats: true,
    },
  },
  options: { vatAdminRef },
});
