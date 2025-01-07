import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';

/**
 * @param {ZCF} zcf
 * @param {{feeMintAccess: FeeMintAccess}} privateArgs
 */
const start = async (zcf, privateArgs) => {
  const runMint = await zcf.registerFeeMint('RUN', privateArgs.feeMintAccess);

  const run10 = AmountMath.make(runMint.getIssuerRecord().brand, 10n);

  const creatorFacet = Far('creatorFacet', {
    mintRun: async () => {
      const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
      runMint.mintGains(harden({ RUN: run10 }), zcfSeat);
      zcfSeat.exit();
      return E(userSeat).getPayout('RUN');
    },
  });
  return harden({ creatorFacet });
};
harden(start);
export { start };
