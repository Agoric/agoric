import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

/**
 * Tests zcf.registerFeeMint
 *
 * @param {ZCF} zcf
 * @param {{
 *   feeMintAccess: FeeMintAccess;
 * }} privateArgs
 */
const start = async (zcf, privateArgs) => {
  // make the `zcf` and `instance` available to the tests
  const instance = zcf.getInstance();
  zcf.setTestJig(() => harden({ instance }));

  const RUNZCFMint = await zcf.registerFeeMint(
    'RUN',
    privateArgs.feeMintAccess,
  );
  const { brand: RUNBrand } = RUNZCFMint.getIssuerRecord();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  RUNZCFMint.mintGains(
    harden({
      Winnings: AmountMath.make(RUNBrand, 10n),
    }),
    zcfSeat,
  );

  const creatorFacet = Far('mint creator facet', {
    getMintedAmount: () => zcfSeat.getAmountAllocated('Winnings'),
    getMintedPayout: async () => {
      zcfSeat.exit();
      return E(userSeat).getPayout('Winnings');
    },
  });

  return harden({ creatorFacet });
};

harden(start);
export { start };
