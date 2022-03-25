// @ts-check

import '../../../exported.js';
import './types.js';

import { E } from '@endo/eventual-send';
import { AmountMath } from '@agoric/ertp';
import { getAmountOut, ceilMultiplyBy } from '../../contractSupport/index.js';
import { Position } from './position.js';
import { calculateShares } from './calculateShares.js';

/**
 * MakePayoffHandler returns an object with methods that are useful for
 * callSpread contracts.
 *
 * @param {ZCF<Record<string, any>>} zcf
 * @param {Record<PositionKind, PromiseRecord<ZCFSeat>>} seatPromiseKits
 * @param {ZCFSeat} collateralSeat
 * @returns {PayoffHandler}
 */
function makePayoffHandler(zcf, seatPromiseKits, collateralSeat) {
  const terms = zcf.getTerms();
  const {
    brands: { Strike: strikeBrand, Collateral: collateralBrand },
  } = terms;
  let seatsExited = 0;

  /** @type {MakeOptionInvitation} */
  function makeOptionInvitation(position) {
    return zcf.makeInvitation(
      // All we do at the time of exercise is resolve the promise.
      seat => seatPromiseKits[position].resolve(seat),
      `collect ${position} payout`,
      {
        position,
      },
    );
  }

  function reallocateToSeat(seatPromise, seatPortion) {
    seatPromise.then(seat => {
      seat.incrementBy(
        collateralSeat.decrementBy(harden({ Collateral: seatPortion })),
      );
      zcf.reallocate(seat, collateralSeat);
      seat.exit();
      seatsExited += 1;
      const remainder = collateralSeat.getAmountAllocated('Collateral');
      if (AmountMath.isEmpty(remainder, collateralBrand) && seatsExited === 2) {
        zcf.shutdown('contract has been settled');
      }
    });
  }

  function payoffOptions(quoteAmount) {
    const strike1 = terms.strikePrice1;
    const strike2 = terms.strikePrice2;
    const { longShare } = calculateShares(
      collateralBrand,
      quoteAmount,
      strike1,
      strike2,
    );
    const totalCollateral = terms.settlementAmount;
    // round in favor of the long position
    const longPortion = ceilMultiplyBy(totalCollateral, longShare);
    const shortPortion = AmountMath.subtract(totalCollateral, longPortion);

    // either offer might be exercised late, so we pay the two seats separately.
    reallocateToSeat(seatPromiseKits[Position.LONG].promise, longPortion);
    reallocateToSeat(seatPromiseKits[Position.SHORT].promise, shortPortion);
  }

  function schedulePayoffs() {
    E(terms.priceAuthority)
      .quoteAtTime(terms.expiration, terms.underlyingAmount, strikeBrand)
      .then(priceQuote => payoffOptions(getAmountOut(priceQuote)));
  }

  /** @type {PayoffHandler} */
  const handler = harden({
    schedulePayoffs,
    makeOptionInvitation,
  });
  return handler;
}

harden(makePayoffHandler);
export { makePayoffHandler };
