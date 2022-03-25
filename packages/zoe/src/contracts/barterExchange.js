// @ts-check

import { Far } from '@endo/marshal';
import { makeLegacyMap } from '@agoric/store';
import '../../exported.js';

// Eventually will be importable from '@agoric/zoe-contract-support'
import { satisfies } from '../contractSupport/index.js';

/**
 * This Barter Exchange accepts offers to trade arbitrary goods for other
 * things. It doesn't require registration of Issuers. If two offers satisfy
 * each other, it exchanges the specified amounts in each side's want clause.
 * https://agoric.com/documentation/zoe/guide/contracts/barter-exchange.html
 *
 * The Barter Exchange only accepts offers that look like { give: { In: amount
 * }, want: { Out: amount} } The want amount will be matched, while the give
 * amount is a maximum. Each successful trader gets their `want` and may trade
 * with counter-parties who specify any amount up to their specified `give`.
 *
 * @param {ZCF} zcf
 */
const start = zcf => {
  // bookOrders is a Map of Maps. The first key is the brand of the offer's
  // GIVE, and the second key is the brand of its WANT. For each offer, we
  // store its handle and the amounts for `give` and `want`.
  //
  // Legacy Because we're storing a genuine JS Map
  const bookOrders = makeLegacyMap('bookOrders');

  function lookupBookOrders(brandIn, brandOut) {
    if (!bookOrders.has(brandIn)) {
      bookOrders.init(brandIn, new Map());
    }
    const ordersMap = bookOrders.get(brandIn);
    let ordersArray = ordersMap.get(brandOut);
    if (!ordersArray) {
      ordersArray = [];
      ordersMap.set(brandOut, ordersArray);
    }
    return ordersArray;
  }

  function findMatchingTrade(newDetails, orders) {
    return orders.find(order => {
      return (
        satisfies(zcf, newDetails.seat, { Out: order.amountIn }) &&
        satisfies(zcf, order.seat, { Out: newDetails.amountIn })
      );
    });
  }

  function removeFromOrders(offerDetails) {
    const orders = lookupBookOrders(
      offerDetails.amountIn.brand,
      offerDetails.amountOut.brand,
    );
    orders.splice(orders.indexOf(offerDetails), 1);
  }

  function tradeWithMatchingOffer(offerDetails) {
    const orders = lookupBookOrders(
      offerDetails.amountOut.brand,
      offerDetails.amountIn.brand,
    );
    const matchingTrade = findMatchingTrade(offerDetails, orders);
    if (matchingTrade) {
      // reallocate by giving each side what it wants
      offerDetails.seat.decrementBy(harden({ In: matchingTrade.amountOut }));
      matchingTrade.seat.incrementBy(harden({ Out: matchingTrade.amountOut }));

      matchingTrade.seat.decrementBy(harden({ In: offerDetails.amountOut }));
      offerDetails.seat.incrementBy(harden({ Out: offerDetails.amountOut }));

      zcf.reallocate(offerDetails.seat, matchingTrade.seat);
      removeFromOrders(matchingTrade);
      offerDetails.seat.exit();
      matchingTrade.seat.exit();

      return true;
    }
    return false;
  }

  function addToBook(offerDetails) {
    const orders = lookupBookOrders(
      offerDetails.amountIn.brand,
      offerDetails.amountOut.brand,
    );
    orders.push(offerDetails);
  }

  function extractOfferDetails(seat) {
    const {
      give: { In: amountIn },
      want: { Out: amountOut },
    } = seat.getProposal();

    return {
      seat,
      amountIn,
      amountOut,
    };
  }

  /** @type {OfferHandler} */
  const exchangeOfferHandler = seat => {
    const offerDetails = extractOfferDetails(seat);

    if (!tradeWithMatchingOffer(offerDetails)) {
      addToBook(offerDetails);
    }

    return 'Trade completed.';
  };

  const publicFacet = Far('publicFacet', {
    makeInvitation: () => zcf.makeInvitation(exchangeOfferHandler, 'exchange'),
  });

  return { publicFacet };
};

harden(start);
export { start };
