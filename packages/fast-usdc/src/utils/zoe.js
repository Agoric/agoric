import { makeTracer } from '@agoric/internal';

const trace = makeTracer('ZoeUtils');

/**
 * Used for "continuing offer" invitations in which the caller does not need
 * anything in return. In those cases there is no Zoe offer safety and the
 * invitation making function can perform the request itself.
 *
 * But smart-wallet expects an invitation maker to make an invitation, so this
 * function abstracts making such an inert invitation and logs consistently when
 * it is used.
 *
 * When this is used by an invitation maker that performs the operation, receiving
 * one of these invitations is evidence that the operation took place.
 *
 * @param {ZCF} zcf
 * @param {string} description @see {@link ZCF.makeInvitation}
 * @returns {() => Promise<Invitation>} an arg-less invitation maker
 */
export const defineInertInvitation = (zcf, description) => {
  return async () =>
    zcf.makeInvitation(seat => {
      trace(`ℹ️ An offer was made on an inert invitation for ${description}`);
      seat.exit();
      return 'inert; nothing should be expected from this offer';
    }, description);
};
