// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';

/**
 * Tests zcf.registerFeeMint
 *
 * @type {ContractStartFn<
 *   undefined,
 *   { getMintedAmount: unknown; getMintedPayout: unknown }
 * >}
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

  const creatorFacet = harden({
    getMintedAmount: () => zcfSeat.getAmountAllocated('Winnings'),
    getMintedPayout: () => {
      zcfSeat.exit();
      return E(userSeat).getPayout('Winnings');
    },
  });

  // @ts-expect-error creatorFacet not Far(), should it be?
  return harden({ creatorFacet });
};

harden(start);
export { start };
