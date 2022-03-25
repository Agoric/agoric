// @ts-check

/**
 * @param {ZCF} zcf
 * @param {ZCFSeat} feeSeat
 * @param {Brand} runBrand
 */
export const makeMakeCollectFeesInvitation = (zcf, feeSeat, runBrand) => {
  /** @param {ZCFSeat} seat */
  const collectFees = async seat => {
    seat.incrementBy(
      feeSeat.decrementBy(
        harden({ RUN: feeSeat.getAmountAllocated('RUN', runBrand) }),
      ),
    );
    const totalTransferred = seat.getStagedAllocation().RUN;

    zcf.reallocate(feeSeat, seat);
    seat.exit();

    return `paid out ${totalTransferred.value}`;
  };

  const makeCollectFeesInvitation = () =>
    zcf.makeInvitation(collectFees, 'collect Fees');

  return { makeCollectFeesInvitation };
};
