// @ts-check

import { Far } from '@endo/marshal';

import '../../exported.js';

/**
 * This is a very trivial contract to explain and test Zoe. AutomaticRefund just
 * gives you back what you put in. AutomaticRefund tells Zoe to complete the
 * offer, which gives the user their payout through Zoe. Other contracts will
 * use these same steps, but they will have more sophisticated logic and interfaces.
 *
 * Since the contract doesn't attempt any reallocation, the offer can contain
 * anything in `give` and `want`. The amount in `give` will be returned, and
 * `want` will be ignored.
 *
 * @param {ZCF} zcf
 */
const start = zcf => {
  let offersCount = 0n;

  /** @type {OfferHandler} */
  const refund = seat => {
    offersCount += 1n;
    seat.exit();
    return `The offer was accepted`;
  };
  const makeRefundInvitation = () => zcf.makeInvitation(refund, 'getRefund');

  const publicFacet = Far('publicFacet', {
    getOffersCount: () => offersCount,
    makeInvitation: makeRefundInvitation,
  });

  const creatorInvitation = makeRefundInvitation();

  return harden({ creatorInvitation, publicFacet });
};

harden(start);
export { start };
