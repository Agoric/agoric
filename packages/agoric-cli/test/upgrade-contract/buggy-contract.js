import { AmountMath } from '@agoric/ertp';
import { makeDurableZone } from '@agoric/zone/durable.js';

/**
 * @param {ZCF} zcf
 * @param {*} _privateArgs
 * @param {MapStore<any, any>} baggage
 */
export const start = async (zcf, _privateArgs, baggage) => {
  const zone = makeDurableZone(baggage);

  const zcfMint = await zcf.makeZCFMint('GoodStuff');
  const { brand } = zcfMint.getIssuerRecord();
  baggage.init('myMint', zcfMint);

  /** @type {OfferHandler} */
  const offerHandler = seat => {
    const amount = AmountMath.make(brand, 32n);
    // NB: this is the bug.  We should be minting to the seat, not throwing it
    // away.
    zcfMint.mintGains(harden({ Tokens: amount }));
    seat.exit();
    return 'Congratulations, free tokens!';
  };

  return harden({
    publicFacet: zone.exo('PublicFacet', undefined, {
      makeInvitation: async () => {
        return zcf.makeInvitation(offerHandler, 'free tokens');
      },
    }),
  });
};
