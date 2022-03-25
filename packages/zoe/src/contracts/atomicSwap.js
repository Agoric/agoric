// @ts-check

// Eventually will be importable from '@agoric/zoe-contract-support'
import {
  assertIssuerKeywords,
  swap,
  assertProposalShape,
} from '../contractSupport/index.js';

import '../../exported.js';

/**
 * Trade one item for another.
 * https://agoric.com/documentation/zoe/guide/contracts/atomic-swap.html
 *
 * The initial offer is { give: { Asset: A }, want: { Price: B } }. The outcome
 * from the first offer is an invitation for the second party, who should offer
 * { give: { Price: B }, want: { Asset: A } }, with a want amount no greater
 * than the original's give, and a give amount at least as large as the original's want.
 *
 * @param {ZCF} zcf
 */
const start = zcf => {
  assertIssuerKeywords(zcf, harden(['Asset', 'Price']));

  /** @type {OfferHandler} */
  const makeMatchingInvitation = firstSeat => {
    assertProposalShape(firstSeat, {
      give: { Asset: null },
      want: { Price: null },
    });
    const { want, give } = firstSeat.getProposal();

    /** @type {OfferHandler} */
    const matchingSeatOfferHandler = matchingSeat => {
      const swapResult = swap(zcf, firstSeat, matchingSeat);
      zcf.shutdown('Swap completed.');
      return swapResult;
    };

    const matchingSeatInvitation = zcf.makeInvitation(
      matchingSeatOfferHandler,
      'matchOffer',
      {
        asset: give.Asset,
        price: want.Price,
      },
    );
    return matchingSeatInvitation;
  };

  const creatorInvitation = zcf.makeInvitation(
    makeMatchingInvitation,
    'firstOffer',
  );

  return { creatorInvitation };
};

harden(start);
export { start };
