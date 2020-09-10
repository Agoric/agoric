// @ts-check

import { E } from '@agoric/eventual-send';
import { assert } from '@agoric/assert';
import { trade, depositToSeat, withdrawFromSeat } from '../contractSupport';

import '../../exported';

/**
 * The creator gets a creatorFacet that allows them to add inventory, make quotes and
 * create specific invitations to exercise those quotes.
 * @type {ContractStartFn}
 */
const start = zcf => {
  const { zcfSeat: marketMakerSeat } = zcf.makeEmptySeatKit();
  const zoeService = zcf.getZoeService();
  const { coveredCallInstallation } = zcf.getTerms();
  const zoe = zcf.getZoeService();

  const makeQuote = async (price, assets, timeAuthority, deadline) => {
    const { creatorInvitation } = await E(zoeService).startInstance(
      coveredCallInstallation,
      zcf.getTerms().issuers,
    );
    assert(
      creatorInvitation !== undefined,
      `The covered call instance did not return a creatorInvitation`,
    );
    const proposal = harden({
      give: assets,
      want: price,
      exit: {
        afterDeadline: {
          deadline,
          timer: timeAuthority,
        },
      },
    });

    const payments = await withdrawFromSeat(zcf, marketMakerSeat, assets);
    const sellerUserSeat = await E(zoe).offer(
      creatorInvitation,
      proposal,
      payments,
    );

    E(sellerUserSeat)
      .getPayouts()
      .then(async payoutPayments => {
        try {
          await depositToSeat(zcf, marketMakerSeat, price, payoutPayments);
        } catch (err) {
          console.log(err);
          // It might be a refund instead.
          await depositToSeat(zcf, marketMakerSeat, assets, payoutPayments);
        }
      });
    const option = E(sellerUserSeat).getOfferResult();

    return option;
  };

  const addInventory = seat => {
    // Take everything in this seat and add it to the marketMakerSeat
    trade(
      zcf,
      { seat: marketMakerSeat, gains: seat.getCurrentAllocation() },
      { seat, gains: {} },
    );
    seat.exit();
    return 'Inventory added';
  };

  const removeInventory = seat => {
    const { want } = seat.getProposal();
    trade(zcf, { seat: marketMakerSeat, gains: {} }, { seat, gains: want });
    seat.exit();
    return 'Inventory removed';
  };

  const creatorFacet = {
    // The inventory can be added in bulk before any quotes are made
    // or can be added immediately before a quote.
    makeAddInventoryInvitation: async (issuerKeywordRecord = undefined) => {
      const { issuers } = zcf.getTerms();
      const issuersPSaved = Object.entries(issuerKeywordRecord).map(
        ([keyword, issuer]) => {
          // If the keyword does not yet exist, add it and the
          // associated issuer.
          if (issuers.keyword === undefined) {
            return zcf.saveIssuer(issuer, keyword);
          }
          return undefined;
        },
      );
      await Promise.all(issuersPSaved);
      return zcf.makeInvitation(addInventory, 'addInventory');
    },
    makeRemoveInventoryInvitation: () =>
      zcf.makeInvitation(removeInventory, 'removeInventory'),
    makeQuote,
  };

  return harden({ creatorFacet });
};

export { start };
