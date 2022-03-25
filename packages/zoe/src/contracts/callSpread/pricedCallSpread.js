// @ts-check

import '../../../exported.js';
import './types.js';

import { assert, details as X } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';
import {
  assertProposalShape,
  depositToSeat,
  assertNatAssetKind,
  makeRatio,
  ceilMultiplyBy,
} from '../../contractSupport/index.js';
import { makePayoffHandler } from './payoffHandler.js';
import { Position } from './position.js';

const PERCENT_BASE = 100n;
const BASIS_POINTS = 10000n;

/**
 * This contract implements a fully collateralized call spread. This is a
 * combination of a call option bought at one strike price and a second call
 * option sold at a higher price. The invitations are produced in pairs. The
 * creatorFacet has a method makeInvitationPair(longCollateralShare) whose
 * argument must be a number between 0 and 100. makeInvitationPair() returns two
 * invitations which require depositing amounts summing to the settlement amount
 * in the proportions longCollateralShare and (100 - longCollateralShare) to
 * redeem the respective options/invitations. (They are returned under the
 * Keyword 'Option'.) The options are ERTP invitations that are suitable for resale.
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
 *
 * @param {ZCF<{
 *   strikePrice1: Amount;
 *   strikePrice2: Amount;
 *   settlementAmount: Amount;
 *   priceAuthority: PriceAuthority;
 *   expiration: bigint;
 *   underlyingAmount: Amount;
 * }>} zcf
 */
const start = zcf => {
  const { brands, strikePrice1, strikePrice2, settlementAmount } =
    zcf.getTerms();
  assertNatAssetKind(zcf, brands.Collateral);
  assertNatAssetKind(zcf, brands.Strike);
  // notice that we don't assert that the Underlying is fungible.

  assert(
    AmountMath.isGTE(strikePrice2, strikePrice1),
    X`strikePrice2 must be greater than strikePrice1`,
  );

  zcf.saveIssuer(zcf.getInvitationIssuer(), 'Options');

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

  async function makeOptionInvitation(position, deposit) {
    const option = payoffHandler.makeOptionInvitation(position);
    const invitationIssuer = zcf.getInvitationIssuer();
    const payment = harden({ Option: option });
    const spreadAmount = harden({
      Option: await E(invitationIssuer).getAmountOf(option),
    });
    // AWAIT ////

    await depositToSeat(zcf, collateralSeat, spreadAmount, payment);
    // AWAIT ////

    /** @type {OfferHandler} */
    const optionPosition = depositSeat => {
      assertProposalShape(depositSeat, {
        give: { Collateral: null },
        want: { Option: null },
        exit: { onDemand: null },
      });

      const {
        give: { Collateral: newCollateral },
        want: { Option: desiredOption },
      } = depositSeat.getProposal();

      // assert that the allocation includes the amount of collateral required
      assert(
        AmountMath.isEqual(newCollateral, deposit),
        X`Collateral required: ${deposit.value}`,
      );

      // assert that the requested option was the right one.
      assert(
        spreadAmount.Option.value[0].instance ===
          desiredOption.value[0].instance,
        X`wanted option not a match`,
      );

      depositSeat.incrementBy(collateralSeat.decrementBy(harden(spreadAmount)));
      collateralSeat.incrementBy(
        depositSeat.decrementBy(harden({ Collateral: newCollateral })),
      );

      zcf.reallocate(collateralSeat, depositSeat);
      depositSeat.exit();
    };

    return zcf.makeInvitation(optionPosition, `call spread ${position}`, {
      position,
      collateral: deposit.value,
      option: spreadAmount.Option,
    });
  }

  // TODO(2282): change the API so the caller can provide share in basis points
  //  rather than percent
  function makeInvitationPair(longCollateralShare) {
    const longPercent = makeRatio(
      (longCollateralShare * BASIS_POINTS) / PERCENT_BASE,
      brands.Collateral,
      BASIS_POINTS,
    );

    // if there's round-off, the long side pays the extra fraction
    const longRequired = ceilMultiplyBy(settlementAmount, longPercent);
    const shortRequired = AmountMath.subtract(settlementAmount, longRequired);
    const longInvitation = makeOptionInvitation(Position.LONG, longRequired);
    const shortInvitation = makeOptionInvitation(Position.SHORT, shortRequired);
    payoffHandler.schedulePayoffs();
    return { longInvitation, shortInvitation };
  }

  const creatorFacet = Far('creatorFacet', { makeInvitationPair });
  return harden({ creatorFacet });
};

harden(start);
export { start };
