import { provideDurableMapStore } from '@agoric/vat-data';
import {
  AssetKind,
  makeDurableIssuerKit,
  prepareIssuerKit,
} from '@agoric/ertp';
import { InvitationElementShape } from '../typeGuards.js';

const ZOE_INVITATION_KIT = 'ZoeInvitationKit';

/**
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {ShutdownWithFailure | undefined} shutdownZoeVat
 */
export const prepareInvitationKit = (baggage, shutdownZoeVat = undefined) => {
  /** @type {IssuerKit<'copyBag'> | undefined} */
  let invitationKit;

  const invitationKitBaggage = provideDurableMapStore(
    baggage,
    ZOE_INVITATION_KIT,
  );
  if (!invitationKitBaggage.has(ZOE_INVITATION_KIT)) {
    invitationKit = makeDurableIssuerKit(
      invitationKitBaggage,
      'Zoe Invitation',
      AssetKind.COPY_BAG,
      undefined,
      shutdownZoeVat,
      { elementShape: InvitationElementShape },
    );
    invitationKitBaggage.init(ZOE_INVITATION_KIT, invitationKit);
  } else {
    invitationKit = prepareIssuerKit(invitationKitBaggage);
  }

  return harden({
    invitationIssuer: invitationKit.issuer,
    invitationKit,
  });
};
