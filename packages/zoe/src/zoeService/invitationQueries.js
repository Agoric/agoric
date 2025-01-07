// @jessie-check

import { X, Fail, q, makeError, annotateError } from '@endo/errors';
import { E } from '@endo/eventual-send';

export const makeInvitationQueryFns = invitationIssuer => {
  /** @type {GetInvitationDetails} */
  const getInvitationDetails = async invitationP => {
    const onRejected = reason => {
      const err = makeError(
        X`A Zoe invitation is required, not ${invitationP}`,
      );
      annotateError(err, X`Due to ${reason}`);
      throw err;
    };
    const invAmount = await E(invitationIssuer)
      .getAmountOf(invitationP)
      .catch(onRejected);
    (Array.isArray(invAmount.value) && invAmount.value.length === 1) ||
      Fail`Expected exactly 1 invitation, not ${q(invAmount.value.length)}`;
    return invAmount.value[0];
  };

  /** @type {GetInstance} */
  const getInstance = async invitation =>
    E.get(getInvitationDetails(invitation)).instance;

  /** @type {GetInstallation} */
  const getInstallation = async invitation =>
    E.get(getInvitationDetails(invitation)).installation;

  return harden({
    getInstance,
    getInstallation,
    getInvitationDetails,
  });
};
