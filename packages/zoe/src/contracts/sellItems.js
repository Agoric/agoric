// @ts-check

import { assert, details as X } from '@agoric/assert';
import { Far } from '@endo/marshal';
import { Nat } from '@agoric/nat';
import { AmountMath } from '@agoric/ertp';
import { makeNotifierKit, observeNotifier } from '@agoric/notifier';
import {
  assertIssuerKeywords,
  defaultAcceptanceMsg,
  assertProposalShape,
  assertNatAssetKind,
} from '../contractSupport/index.js';

import '../../exported.js';

/**
 * Sell items in exchange for money. Items may be fungible or non-fungible and
 * multiple items may be bought at once. Money must be fungible.
 *
 * The `pricePerItem` is to be set in the terms. It is expected that all items
 * are sold for the same uniform price.
 *
 * The initial offer should be { give: { Items: items } }, accompanied by terms
 * as described above. Buyers use offers that match { want: { Items: items }
 * give: { Money: m } }. The items provided should match particular items that
 * the seller still has available to sell, and the money should be pricePerItem
 * times the number of items requested.
 *
 * When all the items have been sold, the contract will terminate, triggering
 * the creator's payout. If the creator has an onDemand exit clause, they can
 * exit early to collect their winnings. The remaining items will still be
 * available for sale, but the creator won't be able to collect later earnings.
 *
 * @param {ZCF<{ pricePerItem: Amount<'nat'> }>} zcf
 */
const start = zcf => {
  const { pricePerItem, issuers, brands } = zcf.getTerms();
  const allKeywords = ['Items', 'Money'];
  assertIssuerKeywords(zcf, harden(allKeywords));
  assertNatAssetKind(zcf, pricePerItem.brand);

  let sellerSeat;

  const { notifier: availableItemsNotifier, updater: availableItemsUpdater } =
    makeNotifierKit();

  const sell = seat => {
    sellerSeat = seat;

    observeNotifier(
      sellerSeat.getNotifier(),
      harden({
        updateState: sellerSeatAllocation =>
          availableItemsUpdater.updateState(
            sellerSeatAllocation && sellerSeatAllocation.Items,
          ),
        finish: sellerSeatAllocation => {
          availableItemsUpdater.finish(
            sellerSeatAllocation && sellerSeatAllocation.Items,
          );
        },
        fail: reason => availableItemsUpdater.fail(reason),
      }),
    );
    return defaultAcceptanceMsg;
  };

  const getAvailableItems = () => {
    assert(sellerSeat && !sellerSeat.hasExited(), X`no items are for sale`);
    return sellerSeat.getAmountAllocated('Items');
  };

  const getAvailableItemsNotifier = () => availableItemsNotifier;

  const buy = buyerSeat => {
    assertProposalShape(buyerSeat, {
      want: { Items: null },
      give: { Money: null },
    });
    const currentItemsForSale = sellerSeat.getAmountAllocated('Items');
    const providedMoney = buyerSeat.getAmountAllocated('Money');

    const {
      want: { Items: wantedItems },
    } = buyerSeat.getProposal();

    // Check that the wanted items are still for sale.
    if (!AmountMath.isGTE(currentItemsForSale, wantedItems)) {
      const rejectMsg = `Some of the wanted items were not available for sale`;
      throw buyerSeat.fail(new Error(rejectMsg));
    }

    // All items are the same price.
    const totalCost = AmountMath.make(
      brands.Money,
      pricePerItem.value * Nat(wantedItems.value.length),
    );

    // Check that the money provided to pay for the items is greater than the totalCost.
    assert(
      AmountMath.isGTE(providedMoney, totalCost),
      X`More money (${totalCost}) is required to buy these items`,
    );

    // Reallocate.
    sellerSeat.incrementBy(
      buyerSeat.decrementBy(harden({ Money: providedMoney })),
    );
    buyerSeat.incrementBy(
      sellerSeat.decrementBy(harden({ Items: wantedItems })),
    );
    zcf.reallocate(buyerSeat, sellerSeat);

    // The buyer's offer has been processed.
    buyerSeat.exit();

    if (AmountMath.isEmpty(getAvailableItems())) {
      zcf.shutdown('All items sold.');
    }
    return defaultAcceptanceMsg;
  };

  const makeBuyerInvitation = () => {
    const itemsAmount = sellerSeat.getAmountAllocated('Items');
    assert(
      sellerSeat && !AmountMath.isEmpty(itemsAmount),
      X`no items are for sale`,
    );
    return zcf.makeInvitation(buy, 'buyer');
  };

  /** @type {SellItemsPublicFacet} */
  const publicFacet = Far('SellItemsPublicFacet', {
    getAvailableItems,
    getAvailableItemsNotifier,
    getItemsIssuer: () => issuers.Items,
    makeBuyerInvitation,
  });

  /** @type {SellItemsCreatorFacet} */
  const creatorFacet = Far('SellItemsCreatorFacet', {
    makeBuyerInvitation,
    getAvailableItems: publicFacet.getAvailableItems,
    getItemsIssuer: publicFacet.getItemsIssuer,
  });

  const creatorInvitation = zcf.makeInvitation(sell, 'seller');

  return harden({ creatorFacet, creatorInvitation, publicFacet });
};

harden(start);
export { start };
