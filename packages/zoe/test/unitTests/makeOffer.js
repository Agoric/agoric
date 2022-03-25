// @ts-check

import { E } from '@endo/eventual-send';
import { assert } from '@agoric/assert';

/**
 * @param {ERef<ZoeService>} zoe
 * @param {ZCF} zcf
 * @param {Proposal} [proposal]
 * @param {PaymentPKeywordRecord} [payments]
 * @returns {Promise<{ zcfSeat: ZCFSeat; userSeat: UserSeat }>}
 */
export const makeOffer = async (zoe, zcf, proposal, payments) => {
  let zcfSeat;
  const getSeat = seat => {
    zcfSeat = seat;
  };
  const invitation = await zcf.makeInvitation(getSeat, 'seat');
  const userSeat = await E(zoe).offer(invitation, proposal, payments);
  assert(zcfSeat);
  return { zcfSeat, userSeat };
};
