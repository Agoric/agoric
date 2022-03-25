// @ts-check

import { E } from '@endo/eventual-send';
import { assert } from '@agoric/assert';
import { Far } from '@endo/marshal';
import {
  offerTo,
  saveAllIssuers,
  assertProposalShape,
} from '../contractSupport/index.js';

import '../../exported.js';

/**
 * This contract is inspired by the description of an OTC Desk smart contract in
 * this article:
 * https://medium.com/dragonfly-research/unbundling-uniswap-the-future-of-on-chain-market-making-1c7d6948d570
 *
 * The creator of this contract instance can take three actions: add inventory,
 * remove inventory, and make quotes for potential trading partners.
 *
 * To add inventory, the creator of the contract instance can call
 * `E(creatorFacet).makeAddInventoryInvitation(issuerKeywordRecord)` and receive
 * an invitation to add inventory. In this call, they must pass in an
 * issuerKeywordRecord of any issuers they wish to add inventory for, if these
 * issuers have not yet been saved to ZCF. When actually escrowing the inventory
 * as an offer, the proposal must not `want` anything. All of the newly escrowed
 * inventory is taken and reallocated to the marketMakerSeat in the contract.
 *
 * To remove inventory, the creator of the contract instance can call
 * `E(creatorFacet).makeRemoveInventoryInvitation()` and receive an invitation
 * to remove inventory. When making an offer to remove inventory, the proposal
 * should specify the `want`, which will be removed, but should not give anything.
 *
 * To make a quote, the creator can call `E(creatorFacet).makeQuote(price,
 * assets, timeAuthority, deadline)`. `price` and `assets` are
 * amountKeywordRecords that will be used in the coveredCall. The assets are the
 * underlyingAssets in the call option, and the price is used as the
 * strikePrice. The timeAuthority should be a timer, and the deadline can be any
 * time understood by the timer. The quote will be cancelled after the deadline.
 * `makeQuote` returns a covered call option that can be given away for free or
 * sold. Importantly, if the recipient chooses to exercise the option, they can
 * verify that the goods being offered are already escrowed, and the trade is
 * guaranteed to succeed if their proposal matches the quote.
 *
 * @param {ZCF<Record<string, any>>} zcf
 */
const start = zcf => {
  const { coveredCallInstallation } = zcf.getTerms();
  const { zcfSeat: marketMakerSeat } = zcf.makeEmptySeatKit();
  const zoe = zcf.getZoeService();

  /**
   * Make a quote using the current inventory and receive a covered call option
   * that can be freely given or sold to someone else.
   *
   * @param {AmountKeywordRecord} price
   * @param {AmountKeywordRecord} assets
   * @param {Timer} timeAuthority
   * @param {any} deadline
   * @returns {Promise<Payment>}
   */
  const makeQuote = async (price, assets, timeAuthority, deadline) => {
    const { creatorInvitation } = await E(zoe).startInstance(
      coveredCallInstallation,
      zcf.getTerms().issuers,
    );
    const shouldBeInvitationMsg = `The covered call instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);
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

    const { userSeatPromise: coveredCallUserSeat } = await offerTo(
      zcf,
      creatorInvitation,
      undefined,
      proposal,
      marketMakerSeat,
    );

    const option = E(coveredCallUserSeat).getOfferResult();
    return option;
  };

  const addInventory = seat => {
    assertProposalShape(seat, { want: {} });
    // Take everything in this seat and add it to the marketMakerSeat
    marketMakerSeat.incrementBy(
      seat.decrementBy(harden(seat.getCurrentAllocation())),
    );
    zcf.reallocate(marketMakerSeat, seat);
    seat.exit();
    return 'Inventory added';
  };

  const removeInventory = seat => {
    assertProposalShape(seat, { give: {} });
    const { want } = seat.getProposal();
    seat.incrementBy(marketMakerSeat.decrementBy(harden(want)));
    zcf.reallocate(marketMakerSeat, seat);
    seat.exit();
    return 'Inventory removed';
  };

  const creatorFacet = Far('creatorFacet', {
    /**
     * The inventory can be added in bulk before any quotes are made or can be
     * added immediately before a quote.
     *
     * @param {IssuerKeywordRecord} [issuerKeywordRecord]
     * @returns {Promise<Payment>}
     */
    makeAddInventoryInvitation: async (issuerKeywordRecord = harden({})) => {
      await saveAllIssuers(zcf, issuerKeywordRecord);
      return zcf.makeInvitation(addInventory, 'addInventory');
    },
    /**
     * The inventory can be removed at any time, since the inventory used for
     * active quotes is escrowed separately within the coveredCall instance.
     *
     * @returns {Promise<Payment>}
     */
    makeRemoveInventoryInvitation: () => {
      return zcf.makeInvitation(removeInventory, 'removeInventory');
    },
    makeQuote,
  });

  return harden({ creatorFacet });
};

export { start };
