// @ts-check

import { AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';
import { makeFeeRatio } from './constantProduct/calcFees';
import {
  pricesForStatedInput,
  pricesForStatedOutput,
} from './constantProduct/calcSwapPrices.js';

const { details: X } = assert;

// Price calculations and swap using a pair of pools. Both pools map between RUN
// and some collateral. We arrange the trades so collateralInPool will have
// collateral added and collateralOutPool subtracted. When traders specify an
// input price, that brand will be the inPool; when they specify the output
// price that brand is the outPool.

const publicPrices = prices => {
  return { amountIn: prices.swapperGives, amountOut: prices.swapperGets };
};

/**
 * @param {ZCF} zcf
 * @param {XYKPool} collateralInPool
 * @param {XYKPool} collateralOutPool
 * @param {() => bigint} getProtocolFeeBP - Retrieve governed protocol fee value
 * @param {() => bigint} getPoolFeeBP - Retrieve governed pool fee value
 * @param {ZCFSeat} feeSeat
 * @returns {VPoolWrapper<VPoolInternalFacet>}
 */
export const makeDoublePool = (
  zcf,
  collateralInPool,
  collateralOutPool,
  getProtocolFeeBP,
  getPoolFeeBP,
  feeSeat,
) => {
  const inCentral = collateralInPool.getCentralAmount();
  const inSecondary = collateralInPool.getSecondaryAmount();

  const outCentral = collateralOutPool.getCentralAmount();
  const outSecondary = collateralOutPool.getSecondaryAmount();

  const inAllocation = { Central: inCentral, Secondary: inSecondary };
  const outAllocation = { Central: outCentral, Secondary: outSecondary };

  const centralBrand = inCentral.brand;
  const emptyCentralAmount = AmountMath.makeEmpty(centralBrand);
  assert(
    centralBrand === outCentral.brand,
    X`The central brands on the two pools must match: ${centralBrand}, ${outCentral.brand}`,
  );

  const allocateGainsAndLosses = (seat, prices) => {
    const inPoolSeat = collateralInPool.getPoolSeat();
    const outPoolSeat = collateralOutPool.getPoolSeat();

    seat.decrementBy(harden({ In: prices.swapperGives }));
    inPoolSeat.decrementBy(harden({ Central: prices.inPoolDecrement }));
    outPoolSeat.decrementBy(harden({ Secondary: prices.outPoolDecrement }));
    seat.incrementBy(harden({ Out: prices.swapperGets }));
    inPoolSeat.incrementBy(harden({ Secondary: prices.inPoolIncrement }));
    outPoolSeat.incrementBy(harden({ Central: prices.outPoolIncrement }));
    feeSeat.incrementBy(harden({ RUN: prices.protocolFee }));

    zcf.reallocate(outPoolSeat, inPoolSeat, feeSeat, seat);
    seat.exit();
    collateralInPool.updateState();
    collateralOutPool.updateState();
    return `Swap successfully completed.`;
  };

  const getPriceForInput = (amountIn, amountOut) => {
    const protocolFeeRatio = makeFeeRatio(getProtocolFeeBP(), centralBrand);
    const poolFeeRatioCentral = makeFeeRatio(getPoolFeeBP(), centralBrand);
    const poolFeeRatioAmountOut = makeFeeRatio(getPoolFeeBP(), amountOut.brand);

    // We must do two consecutive swapInPrice() calls,
    // followed by a call to swapOutPrice().
    // 1) from amountIn to the central token, which tells us how much central
    //  would be provided for amountIn,
    // 2) from that amount of central to brandOut, which tells us how much of
    //  brandOut will be provided as well as the minimum price in central
    //  tokens, then finally
    // 3) call swapOutPrice() to see if the same proceeds can be purchased for
    //  less.
    // Notice that in the second call, the original amountOut is used, and in
    // the third call, the original amountIn is used.
    const interimInpoolPrices = pricesForStatedInput(
      amountIn,
      inAllocation,
      emptyCentralAmount,
      protocolFeeRatio,
      poolFeeRatioCentral,
    );
    const outPoolPrices = pricesForStatedInput(
      interimInpoolPrices.swapperGets,
      outAllocation,
      amountOut,
      protocolFeeRatio,
      poolFeeRatioAmountOut,
    );
    const finalInPoolPrices = pricesForStatedOutput(
      amountIn,
      inAllocation,
      outPoolPrices.swapperGives,
      protocolFeeRatio,
      poolFeeRatioCentral,
    );
    return harden({
      swapperGives: finalInPoolPrices.swapperGives,
      swapperGets: outPoolPrices.swapperGets,
      inPoolIncrement: finalInPoolPrices.xIncrement,
      inPoolDecrement: finalInPoolPrices.yDecrement,
      outPoolIncrement: outPoolPrices.xIncrement,
      outPoolDecrement: outPoolPrices.yDecrement,
      protocolFee: AmountMath.add(
        finalInPoolPrices.protocolFee,
        outPoolPrices.protocolFee,
      ),
    });
  };

  const getInputPrice = (amountIn, amountOut) => {
    return publicPrices(getPriceForInput(amountIn, amountOut));
  };

  const swapIn = (seat, amountIn, amountOut) => {
    const prices = getPriceForInput(amountIn, amountOut);
    return allocateGainsAndLosses(seat, prices);
  };

  const getPriceForOutput = (amountIn, amountOut) => {
    const protocolFeeRatio = makeFeeRatio(getProtocolFeeBP(), centralBrand);
    const poolFeeRatioCentral = makeFeeRatio(getPoolFeeBP(), centralBrand);
    const poolFeeRatioAmountIn = makeFeeRatio(getPoolFeeBP(), amountIn.brand);

    // We must do two consecutive swapOutPrice() calls, followed by a call to
    // swapInPrice().
    // 1) from amountOut to the central token, which tells us how much central
    //  is required to obtain amountOut,
    // 2) from that amount of central to brandIn, which tells us how much of
    //  brandIn is required as well as the max proceeds in central tokens, then
    //  finally
    // 3) call swapInPrice() to see if those central proceeds could purchase
    //  larger amount
    // Notice that the amountIn parameter to the first call to swapOutPrice
    // specifies an empty amount. This is interpreted as "no limit", which is
    // necessary since we can't guess a reasonable maximum of the central token.
    const interimOutpoolPrices = pricesForStatedOutput(
      emptyCentralAmount,
      outAllocation,
      amountOut,
      protocolFeeRatio,
      poolFeeRatioCentral,
    );
    const inpoolPrices = pricesForStatedOutput(
      amountIn,
      inAllocation,
      interimOutpoolPrices.swapperGets,
      protocolFeeRatio,
      poolFeeRatioAmountIn,
    );
    const finalOutpoolPrices = pricesForStatedInput(
      inpoolPrices.swapperGives,
      outAllocation,
      amountOut,
      protocolFeeRatio,
      poolFeeRatioCentral,
    );
    return harden({
      swapperGives: inpoolPrices.swapperGives,
      swapperGets: finalOutpoolPrices.swapperGets,
      inPoolIncrement: inpoolPrices.xIncrement,
      inPoolDecrement: inpoolPrices.yDecrement,
      outPoolIncrement: finalOutpoolPrices.xIncrement,
      outPoolDecrement: finalOutpoolPrices.yDecrement,
      protocolFee: AmountMath.add(
        finalOutpoolPrices.protocolFee,
        inpoolPrices.protocolFee,
      ),
    });
  };

  const getOutputPrice = (amountIn, amountOut) => {
    return publicPrices(getPriceForOutput(amountIn, amountOut));
  };
  const swapOut = (seat, amountIn, amountOut) => {
    const prices = getPriceForOutput(amountIn, amountOut);
    return allocateGainsAndLosses(seat, prices);
  };

  const externalFacet = Far('double pool', {
    getInputPrice,
    getOutputPrice,
    swapIn,
    swapOut,
  });

  const internalFacet = Far('single pool', {
    getPriceForInput,
    getPriceForOutput,
  });

  return { externalFacet, internalFacet };
};
