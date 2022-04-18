// @ts-check

import { E } from '@endo/far';

/** @type {MakeDepositInvitation} */
export const makeDepositInvitation = zoeInvitationPurse => {
  /** @type {DepositInvitation} */
  const depositInvitation = async invitationP => {
    const invitation = await invitationP;
    // Deposit returns the amount deposited
    const invitationAmount = await E(zoeInvitationPurse).deposit(invitation);
    return invitationAmount.value[0];
  };
  return depositInvitation;
};
