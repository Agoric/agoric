// @ts-check
import { assertProposalShape } from '@agoric/zoe/src/contractSupport/index.js';

import '@agoric/zoe/exported.js';
import { AmountMath } from '@agoric/ertp';

/**
 * @param {ZCF} zcf
 * @param {(brandIn: Brand, brandOut: Brand) => VirtualPool} provideVPool
 */
export const makeMakeSwapInvitation = (zcf, provideVPool) => {
  /**
   * trade with a stated amountIn.
   *
   * @param {ZCFSeat} seat
   * @param {{ stopAfter: Amount }} args
   */
  const swapIn = (seat, args) => {
    assertProposalShape(seat, {
      give: { In: null },
      want: { Out: null },
    });
    const {
      give: { In: amountIn },
      want: { Out: amountOut },
    } = seat.getProposal();
    if (args) {
      AmountMath.coerce(amountOut.brand, args.stopAfter);
      // TODO check that there are no other keys
    }

    const pool = provideVPool(amountIn.brand, amountOut.brand);
    let prices;
    const stopAfter = args && args.stopAfter;
    if (stopAfter) {
      AmountMath.coerce(amountOut.brand, stopAfter);
      prices = pool.getPriceForOutput(amountIn, stopAfter);
    }
    if (!prices || !AmountMath.isGTE(prices.swapperGets, stopAfter)) {
      // `amountIn` is not enough to sell for stopAfter so just sell it all
      prices = pool.getPriceForInput(amountIn, amountOut);
    }
    assert.equal(amountIn.brand, prices.swapperGives.brand);
    return pool.allocateGainsAndLosses(seat, prices);
  };

  // trade with a stated amount out.
  const swapOut = seat => {
    assertProposalShape(seat, {
      give: { In: null },
      want: { Out: null },
    });
    const {
      give: { In: amountIn },
      want: { Out: amountOut },
    } = seat.getProposal();
    const pool = provideVPool(amountIn.brand, amountOut.brand);
    const prices = pool.getPriceForOutput(amountIn, amountOut);
    return pool.allocateGainsAndLosses(seat, prices);
  };

  const makeSwapInInvitation = () =>
    zcf.makeInvitation(swapIn, 'autoswap swapIn');

  const makeSwapOutInvitation = () =>
    zcf.makeInvitation(swapOut, 'autoswap swapOut');

  return { makeSwapInInvitation, makeSwapOutInvitation };
};
