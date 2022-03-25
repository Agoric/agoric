// @ts-check

import '../../../exported.js';
import './types.js';

import { assert, details as X } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';
import { E } from '@endo/eventual-send';
import { AmountMath } from '@agoric/ertp';
import {
  assertProposalShape,
  depositToSeat,
  assertNatAssetKind,
} from '../../contractSupport/index.js';
import { makePayoffHandler } from './payoffHandler.js';
import { Position } from './position.js';

/**
 * This contract implements a fully collateralized call spread. This is a
 * combination of a call option bought at one strike price and a second call
 * option sold at a higher price. The invitations are produced in pairs, and the
 * instance creator escrows upfront all collateral that will be paid out. The
 * individual options are ERTP invitations that are suitable for resale.
 *
 * This option contract is settled financially. There is no requirement that the
 * creator have ownership of the underlying asset at the start, and the
 * beneficiaries shouldn't expect to take delivery at closing.
 *
 * The issuerKeywordRecord specifies the issuers for three keywords: Underlying,
 * Strike, and Collateral. The payout is in Collateral. Strike amounts are used
 * for the price oracle's quotes as to the value of the Underlying, as well as
 * the strike prices in the terms.
 *
 * The creatorInvitation has customProperties that include the amounts of the
 * two options as longAmount and shortAmount. When the creatorInvitation is
 * exercised, the payout includes the two option positions, which are themselves
 * invitations which can be exercised for free, and provide the option payouts
 * with the keyword Collateral.
 *
 * Terms include: `timer` is a timer, and must be recognized by
 * `priceAuthority`. `expiration` is a time recognized by the `timer`.
 * `underlyingAmount` is passed to `priceAuthority`. It could be an NFT or a
 * fungible amount. `strikePrice2` must be greater than `strikePrice1`.
 * `settlementAmount` is the amount deposited by the funder and split between
 * the holders of the options. It uses Collateral. `priceAuthority` is an oracle
 * that has a timer so it can respond to requests for prices as of a stated
 * time. After the deadline, it will issue a PriceQuote giving the value of the
 * underlying asset in the strike currency.
 *
 * Future enhancements:
 *
 * - Issue multiple option pairs with the same expiration from a single instance
 * - Increase the precision of the calculations. (use Ratios with denominator.value=10000)
 */

/**
 * @param {ZCF<{
 *   strikePrice1: Amount;
 *   strikePrice2: Amount;
 *   settlementAmount: Amount;
 *   priceAuthority: PriceAuthority;
 *   expiration: bigint;
 *   underlyingAmount: Amount;
 * }>} zcf
 */
const start = async zcf => {
  const { brands, strikePrice1, strikePrice2, settlementAmount } =
    zcf.getTerms();
  assertNatAssetKind(zcf, brands.Collateral);
  assertNatAssetKind(zcf, brands.Strike);
  // notice that we don't assert that the Underlying is fungible.

  assert(
    AmountMath.isGTE(strikePrice2, strikePrice1),
    X`strikePrice2 must be greater than strikePrice1`,
  );

  await zcf.saveIssuer(zcf.getInvitationIssuer(), 'Options');

  // We will create the two options early and allocate them to this seat.
  const { zcfSeat: collateralSeat } = zcf.makeEmptySeatKit();

  // Since the seats for the payout of the settlement aren't created until the
  // invitations for the options themselves are exercised, we don't have those
  // seats at the time of creation of the options, so we use Promises, and
  // allocate the payouts when those promises resolve.
  /** @type {Record<PositionKind, PromiseRecord<ZCFSeat>>} */
  const seatPromiseKits = {
    [Position.LONG]: makePromiseKit(),
    [Position.SHORT]: makePromiseKit(),
  };

  /** @type {PayoffHandler} */
  const payoffHandler = makePayoffHandler(zcf, seatPromiseKits, collateralSeat);

  async function makeFundedPairInvitation() {
    const pair = {
      LongOption: payoffHandler.makeOptionInvitation(Position.LONG),
      ShortOption: payoffHandler.makeOptionInvitation(Position.SHORT),
    };
    const invitationIssuer = zcf.getInvitationIssuer();
    const [longAmount, shortAmount] = await Promise.all([
      E(invitationIssuer).getAmountOf(pair.LongOption),
      E(invitationIssuer).getAmountOf(pair.ShortOption),
    ]);
    const amounts = { LongOption: longAmount, ShortOption: shortAmount };
    await depositToSeat(zcf, collateralSeat, amounts, pair);
    // AWAIT ////

    /** @type {OfferHandler} */
    const createOptionsHandler = creatorSeat => {
      assertProposalShape(creatorSeat, {
        give: { Collateral: null },
        want: { LongOption: null, ShortOption: null },
      });
      collateralSeat.incrementBy(
        creatorSeat.decrementBy(harden({ Collateral: settlementAmount })),
      );
      creatorSeat.incrementBy(
        collateralSeat.decrementBy(
          harden({
            LongOption: longAmount,
            ShortOption: shortAmount,
          }),
        ),
      );
      zcf.reallocate(collateralSeat, creatorSeat);
      payoffHandler.schedulePayoffs();
      creatorSeat.exit();
    };

    const custom = harden({
      longAmount,
      shortAmount,
    });
    return zcf.makeInvitation(createOptionsHandler, `call spread pair`, custom);
  }

  return harden({ creatorInvitation: makeFundedPairInvitation() });
};

harden(start);
export { start };
