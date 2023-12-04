import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifest } from '@agoric/vats/src/proposals/restart-vat-admin-proposal.js';

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').ProposalBuilder} */
export const defaultProposalBuilder = async ({ publishRef, install }) =>
  harden({
    sourceSpec: '@agoric/vats/src/proposals/restart-vat-admin-proposal.js',
    getManifestCall: [
      getManifest.name,
      {
        vatAdminRef: publishRef(
          // The vat is defined in @agoric/swingset-vats (packages/SwingSet )
          // but this proposal is in @agoric/vats because it depends on the
          // VatAdminSvc made there.
          install('@agoric/swingset-vat/src/vats/vat-admin/vat-vat-admin.js'),
        ),
      },
    ],
  });

export default async (homeP, endowments) => {
  const { writeCoreProposal } = await makeHelpers(homeP, endowments);
  // restart the vat named 'vat-admin'
  await writeCoreProposal('restart-vat-admin', defaultProposalBuilder);
};
