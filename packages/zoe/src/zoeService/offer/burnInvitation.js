// @jessie-check

import { Fail, assert, X, makeError, annotateError } from '@endo/errors';
import { E } from '@endo/eventual-send';

/**
 * Burn the invitation, assert that only one invitation was burned,
 * and extract and return the instanceHandle and invitationHandle
 *
 * @param {Issuer} invitationIssuer
 * @param {ERef<Payment>} invitation
 * @returns {Promise<{
 *   instanceHandle: Instance,
 *   invitationHandle: InvitationHandle,
 * }>}
 */
export const burnInvitation = async (invitationIssuer, invitation) => {
  const handleRejected = reason => {
    const err = makeError(X`A Zoe invitation is required, not ${invitation}`);
    annotateError(err, X`Due to ${reason}`);
    throw err;
  };
  const handleFulfilled = invitationAmount => {
    const invitationValue = invitationAmount.value;
    assert(Array.isArray(invitationValue));
    invitationValue.length === 1 ||
      Fail`Only one invitation can be redeemed at a time`;
    const [{ instance: instanceHandle, handle: invitationHandle }] =
      invitationValue;
    return harden({
      instanceHandle,
      invitationHandle,
    });
  };

  return E.when(
    invitationIssuer.burn(invitation),
    handleFulfilled,
    handleRejected,
  );
};
