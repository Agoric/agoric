// @ts-check

import { assert } from '@agoric/assert';
import { M, fit } from '@agoric/store';
import '../../exported.js';

// Eventually will be importable from '@agoric/zoe-contract-support'
import { swapExact } from '../contractSupport/index.js';
import { isAfterDeadlineExitRule } from '../typeGuards.js';

/**
 * A call option is the right (but not the obligation) to buy digital assets at
 * a pre-determined price, called the strike price. This call option is
 * "covered," meaning that the owner of the digital assets must put the assets
 * in escrow. This guarantees that the assets can be transferred without relying
 * on the owner of the digital assets to keep their promise.
 *
 * https://agoric.com/documentation/zoe/guide/contracts/covered-call.html
 *
 * The call option has an expiration date, when the opportunity is cancelled.
 * The owner of the digital assets cannot remove the assets from escrow before
 * the expiration date.
 *
 * The `creatorInvitation` of this contract is an invitation to escrow the
 * underlying assets. The proposal to escrow assets can have any `give` and
 * `want` with any keywords. Any number of assets of different brands can be
 * escrowed under different keywords. The proposal must have an exit record with
 * the key "afterDeadline": { give: { ... }, want: { ... }, exit: {
 * afterDeadline: { deadline: time, timer: myTimer } }, }
 *
 * This deadline serves as the expiration date for the covered call option.
 * After this deadline, if the option has not been exercised, the underlying
 * assets are automatically paid out to the creator of the contract as a refund.
 *
 * After the owner of the digital assets escrows the assets in the initial
 * offer, they receive a seat. The payout for this seat will either be a refund
 * of the underlying assets (as mentioned above) or payments in the amount of
 * the strike price. Zoe's enforcement of offer safety guarantees that the
 * payout is either a refund or payments in the amount of the strike price,
 * regardless of whether this contract is buggy.
 *
 * The offerResult of this initial seat resolves to the call option itself: an
 * inspectable invitation to buy the underlying assets. The call option
 * invitation has this additional information in the value: {expirationDate,
 * timeAuthority, underlyingAssets, strikePrice }
 *
 * The invitation itself can be traded as a valuable digital asset: a covered call option.
 *
 * The recipient of a covered call option (buying it on some other exchange or
 * through some other trading contract) can exercise the option before the
 * deadline by using the option as an invitation to this contract, paying the
 * strike price and receiving the underlying assets. The recipient of a covered
 * call option can use whatever keywords they wish, as long as they give the
 * strike price as specified in the invitation value, and want the underlying
 * assets exactly.
 *
 * @param {ZCF} zcf
 */
const start = zcf => {
  const sellSeatExpiredMsg = `The covered call option is expired.`;

  /** @type {OfferHandler} */
  const makeOption = sellSeat => {
    fit(sellSeat.getProposal(), M.split({ exit: { afterDeadline: M.any() } }));
    const sellSeatExitRule = sellSeat.getProposal().exit;
    assert(
      isAfterDeadlineExitRule(sellSeatExitRule),
      `the seller must have an afterDeadline exitRule, but instead had ${sellSeatExitRule}`,
    );

    const exerciseOption = buySeat => {
      assert(!sellSeat.hasExited(), sellSeatExpiredMsg);
      try {
        swapExact(zcf, sellSeat, buySeat);
      } catch (err) {
        console.log(
          'Swap failed. Please make sure your offer has the same underlyingAssets and strikePrice as specified in the invitation details. The keywords should not matter.',
        );
        throw err;
      }
      zcf.shutdown('Swap completed.');
      return `The option was exercised. Please collect the assets in your payout.`;
    };

    const customProps = harden({
      expirationDate: sellSeatExitRule.afterDeadline.deadline,
      timeAuthority: sellSeatExitRule.afterDeadline.timer,
      underlyingAssets: sellSeat.getProposal().give,
      strikePrice: sellSeat.getProposal().want,
    });
    return zcf.makeInvitation(exerciseOption, 'exerciseOption', customProps);
  };

  const creatorInvitation = zcf.makeInvitation(makeOption, 'makeCallOption');

  return harden({ creatorInvitation });
};

harden(start);
export { start };
