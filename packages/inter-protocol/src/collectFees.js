// @jessie-check

import { atomicTransfer } from '@agoric/zoe/src/contractSupport/index.js';

/**
 * Provide shared support for providing access to fees from a service contract.
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} feeSeat
 * @param {Brand} feeBrand
 * @param {string} keyword
 * @returns {Promise<Invitation<string>>}
 */
export const makeCollectFeesInvitation = async (
  zcf,
  feeSeat,
  feeBrand,
  keyword,
) => {
  const collectFees = seat => {
    const amount = feeSeat.getAmountAllocated(keyword, feeBrand);
    atomicTransfer(zcf, feeSeat, seat, { [keyword]: amount }, { Fee: amount });

    seat.exit();
    return `paid out ${amount.value}`;
  };

  return zcf.makeInvitation(collectFees, 'collect fees');
};
