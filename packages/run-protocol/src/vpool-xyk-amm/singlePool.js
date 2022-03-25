// @ts-check

import { Far } from '@endo/marshal';
import { makeFeeRatio } from './constantProduct/calcFees.js';
import {
  pricesForStatedInput,
  pricesForStatedOutput,
} from './constantProduct/calcSwapPrices.js';

/**
 * @param {ZCF} zcf
 * @param {XYKPool} pool
 * @param {() => bigint} getProtocolFeeBP - Retrieve governed protocol fee value
 * @param {() => bigint} getPoolFeeBP - Retrieve governed pool fee value
 * @param {ZCFSeat} feeSeat
 * @param {AddLiquidityActual} addLiquidityActual
 * @returns {VPoolWrapper<SinglePoolInternalFacet>}
 */
export const makeSinglePool = (
  zcf,
  pool,
  getProtocolFeeBP,
  getPoolFeeBP,
  feeSeat,
  addLiquidityActual,
) => {
  const secondaryBrand = pool.getSecondaryAmount().brand;
  const centralBrand = pool.getCentralAmount().brand;
  const getPools = () => ({
    Central: pool.getCentralAmount(),
    Secondary: pool.getSecondaryAmount(),
  });
  const publicPrices = prices => ({
    amountIn: prices.swapperGives,
    amountOut: prices.swapperGets,
  });

  const allocateGainsAndLosses = (inBrand, prices, seat) => {
    const poolSeat = pool.getPoolSeat();
    seat.decrementBy(harden({ In: prices.swapperGives }));
    seat.incrementBy(harden({ Out: prices.swapperGets }));
    feeSeat.incrementBy(harden({ RUN: prices.protocolFee }));

    if (inBrand === secondaryBrand) {
      poolSeat.decrementBy(harden({ Central: prices.yDecrement }));
      poolSeat.incrementBy(harden({ Secondary: prices.xIncrement }));
    } else {
      poolSeat.decrementBy(harden({ Secondary: prices.yDecrement }));
      poolSeat.incrementBy(harden({ Central: prices.xIncrement }));
    }

    zcf.reallocate(poolSeat, seat, feeSeat);
    seat.exit();
    pool.updateState();
    return `Swap successfully completed.`;
  };

  const getPriceForInput = (amountIn, amountOut) => {
    return pricesForStatedInput(
      amountIn,
      getPools(),
      amountOut,
      makeFeeRatio(getProtocolFeeBP(), centralBrand),
      makeFeeRatio(getPoolFeeBP(), amountOut.brand),
    );
  };

  const swapIn = (seat, amountIn, amountOut) => {
    const prices = getPriceForInput(amountIn, amountOut);
    return allocateGainsAndLosses(amountIn.brand, prices, seat);
  };

  const getPriceForOutput = (amountIn, amountOut) => {
    return pricesForStatedOutput(
      amountIn,
      getPools(),
      amountOut,
      makeFeeRatio(getProtocolFeeBP(), centralBrand),
      makeFeeRatio(getPoolFeeBP(), amountIn.brand),
    );
  };
  const swapOut = (seat, amountIn, amountOut) => {
    const prices = getPriceForOutput(amountIn, amountOut);
    return allocateGainsAndLosses(amountIn.brand, prices, seat);
  };

  /** @type {VPool} */
  const externalFacet = Far('single pool', {
    getInputPrice: (amountIn, amountOut) =>
      publicPrices(getPriceForInput(amountIn, amountOut)),
    getOutputPrice: (amountIn, amountOut) =>
      publicPrices(getPriceForOutput(amountIn, amountOut)),
    swapIn,
    swapOut,
  });

  const internalFacet = Far('single pool', {
    getPriceForInput,
    getPriceForOutput,
    addLiquidityActual,
  });

  return { externalFacet, internalFacet };
};
