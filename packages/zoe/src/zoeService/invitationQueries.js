// @jessie-check

import { redacted as X, note as errorNote, makeError } from '@endo/errors';
import { E } from '@endo/eventual-send';

export const makeInvitationQueryFns = invitationIssuer => {
  /** @type {GetInvitationDetails} */
  const getInvitationDetails = async invitationP => {
    const onRejected = reason => {
      const err = makeError(
        X`A Zoe invitation is required, not ${invitationP}`,
      );
      errorNote(err, X`Due to ${reason}`);
      throw err;
    };
    return E.get(
      E.get(E(invitationIssuer).getAmountOf(invitationP).catch(onRejected))
        .value,
    )[0];
  };

  /** @type {GetInstance} */
  const getInstance = invitation =>
    E.get(getInvitationDetails(invitation)).instance;

  /** @type {GetInstallation} */
  const getInstallation = invitation =>
    E.get(getInvitationDetails(invitation)).installation;

  return harden({
    getInstance,
    getInstallation,
    getInvitationDetails,
  });
};
