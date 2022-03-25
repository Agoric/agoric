// @ts-check

import { AmountMath } from '@agoric/ertp';

/**
 * @param {ZCF} zcf
 * @param {ZCFSeat} sellSeat
 * @param {ZCFSeat[]} bidSeats
 */
export const calcWinnerAndClose = (zcf, sellSeat, bidSeats) => {
  const {
    give: { Asset: assetAmount },
    want: { Ask: minBid },
  } = sellSeat.getProposal();

  const bidBrand = minBid.brand;
  const emptyBid = AmountMath.makeEmpty(bidBrand);

  let highestBid = emptyBid;
  let secondHighestBid = emptyBid;
  let highestBidSeat = bidSeats[0];
  let activeBidsCount = 0n;

  bidSeats.forEach(bidSeat => {
    if (!bidSeat.hasExited()) {
      activeBidsCount += 1n;
      const bid = bidSeat.getAmountAllocated('Bid', bidBrand);
      // If the bid is greater than the highestBid, it's the new highestBid
      if (AmountMath.isGTE(bid, highestBid, bidBrand)) {
        secondHighestBid = highestBid;
        highestBid = bid;
        highestBidSeat = bidSeat;
      } else if (AmountMath.isGTE(bid, secondHighestBid, bidBrand)) {
        // If the bid is not greater than the highest bid, but is greater
        // than the second highest bid, it is the new second highest bid.
        secondHighestBid = bid;
      }
    }
  });

  if (activeBidsCount === 0n) {
    throw sellSeat.fail(
      new Error(`Could not close auction. No bids were active`),
    );
  }

  if (activeBidsCount === 1n) {
    secondHighestBid = highestBid;
  }

  // Everyone else gets a refund so their values remain the same.
  highestBidSeat.decrementBy(harden({ Bid: secondHighestBid }));
  sellSeat.incrementBy(harden({ Ask: secondHighestBid }));

  sellSeat.decrementBy(harden({ Asset: assetAmount }));
  highestBidSeat.incrementBy(harden({ Asset: assetAmount }));

  zcf.reallocate(sellSeat, highestBidSeat);
  sellSeat.exit();
  bidSeats.forEach(bidSeat => {
    if (!bidSeat.hasExited()) {
      bidSeat.exit();
    }
  });
  zcf.shutdown('Auction closed.');
};
