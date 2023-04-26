import { assert, details as X, Fail } from '@agoric/assert';
import { E } from '@endo/eventual-send';
import { getCopyBagEntries } from '@agoric/store';
import { AmountMath } from '@agoric/ertp';

/**
 * @param {Amount} invitationAmount
 * @param {Brand} [invitationBrand]
 * If `invitationBrand` is provided, use it for further validation. Otherwise
 * proceed assuming that `invitationAmount.brand` is the correct
 * `invitationBrand`.
 */
export const getInvitationAmountDetails = (
  invitationAmount,
  invitationBrand = invitationAmount.brand,
) => {
  const value = AmountMath.getValue(invitationBrand, invitationAmount);

  // We rely on `getCopyBagEntries` to validate that `value` is a
  // well formed CopyBag, so we don't need to check the type first.
  // @ts-expect-error
  const entries = getCopyBagEntries(value);
  entries.length === 1 ||
    Fail`Expected description of only one invitation: ${invitationAmount}`;
  entries[0][1] === 1n ||
    Fail`Expected invitation to be non-fungile: ${invitationAmount}`;
  return entries[0][0];
};
harden(getInvitationAmountDetails);

/** @param {Issuer<'copyBag'>} invitationIssuer */
export const makeInvitationQueryFns = invitationIssuer => {
  /** @type {GetInvitationDetails} */
  const getInvitationDetails = async invitationP => {
    const onRejected = reason => {
      const err = assert.error(
        X`A Zoe invitation is required, not ${invitationP}`,
      );
      assert.note(err, X`Due to ${reason}`);
      throw err;
    };
    const amtP = E(invitationIssuer).getAmountOf(invitationP).catch(onRejected);
    return E.when(amtP, amt => getInvitationAmountDetails(amt));
  };

  /** @type {GetInstance} */
  const getInstance = invitationP =>
    E.get(getInvitationDetails(invitationP)).instance;

  /** @type {GetInstallation} */
  const getInstallation = invitationP =>
    E.get(getInvitationDetails(invitationP)).installation;

  return harden({
    getInstance,
    getInstallation,
    getInvitationDetails,
  });
};
