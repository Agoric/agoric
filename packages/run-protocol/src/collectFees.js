// @ts-check
/**
 * Provide shared support for providing access to fees from a service contract.
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} feeSeat
 * @param {Brand} feeBrand
 * @param {string} keyword
 */
export const makeMakeCollectFeesInvitation = (
  zcf,
  feeSeat,
  feeBrand,
  keyword,
) => {
  const handleCollectFeesOffer = seat => {
    const amount = feeSeat.getAmountAllocated(keyword, feeBrand);
    feeSeat.decrementBy(harden({ [keyword]: amount }));
    seat.incrementBy(harden({ RUN: amount }));
    zcf.reallocate(seat, feeSeat);

    seat.exit();
    return `paid out ${amount.value}`;
  };

  const makeCollectFeesInvitation = () =>
    zcf.makeInvitation(handleCollectFeesOffer, 'CollectFees');

  return { makeCollectFeesInvitation };
};
