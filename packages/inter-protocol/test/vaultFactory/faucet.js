import { Far } from '@endo/marshal';
import { assertProposalShape } from '@agoric/zoe/src/contractSupport/index.js';

/**
 * A Faucet providing Minted so we can provide initial liquidity where it's
 * needed.
 *
 * @param {ZCF} zcf
 * @param {{ feeMintAccess: FeeMintAccess }} privateArgs
 */
export async function start(zcf, { feeMintAccess }) {
  const stableMint = await zcf.registerFeeMint('RUN', feeMintAccess);

  async function makeFaucetInvitation() {
    /** @param {ZCFSeat} seat */
    async function faucetHook(seat) {
      assertProposalShape(seat, { want: { RUN: null } });

      const {
        want: { RUN: stableAmount },
      } = seat.getProposal();
      stableMint.mintGains(harden({ RUN: stableAmount }), seat);
      seat.exit();
      return `success ${stableAmount.value}`;
    }

    return zcf.makeInvitation(faucetHook, 'provide RUN');
  }

  const creatorFacet = Far('faucetInvitationMaker', { makeFaucetInvitation });
  return harden({ creatorFacet });
}
