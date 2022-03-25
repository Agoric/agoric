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
  let highestBidSeat = bidSeats[0];
  let activeBidsCount = 0n;

  bidSeats.forEach(bidSeat => {
    if (!bidSeat.hasExited()) {
      activeBidsCount += 1n;
      const bid = bidSeat.getAmountAllocated('Bid', bidBrand);
      // bidSeat is added in time order, in case of a tie, we privilege the earlier.
      // So the later bidder will need a strictly greater bid to win the auction.
      if (
        AmountMath.isGTE(bid, highestBid, bidBrand) &&
        !AmountMath.isEqual(bid, highestBid, bidBrand)
      ) {
        highestBid = bid;
        highestBidSeat = bidSeat;
      }
    }
  });

  if (activeBidsCount === 0n) {
    throw sellSeat.fail(
      new Error(`Could not close auction. No bids were active`),
    );
  }

  // Everyone else gets a refund so their values remain the same.
  highestBidSeat.decrementBy(harden({ Bid: highestBid }));
  sellSeat.incrementBy(harden({ Ask: highestBid }));

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
