// @ts-check

import {
  assertProposalShape,
  calcSecondaryRequired,
  natSafeMath,
} from '@agoric/zoe/src/contractSupport/index.js';
import { AmountMath } from '@agoric/ertp';

import '@agoric/zoe/exported.js';

const { add, multiply } = natSafeMath;
/**
 * @param {ContractFacet} zcf
 * @param {(brand: Brand) => XYKPool} getPool
 */
export const makeMakeAddLiquidityInvitation = (zcf, getPool) => {
  const addLiquidity = seat => {
    assertProposalShape(seat, {
      give: {
        Central: null,
        Secondary: null,
      },
      want: { Liquidity: null },
    });
    // Get the brand of the secondary token so we can identify the liquidity pool.
    const secondaryBrand = seat.getProposal().give.Secondary.brand;
    const pool = getPool(secondaryBrand);
    return pool.addLiquidity(seat);
  };

  const makeAddLiquidityInvitation = () =>
    zcf.makeInvitation(addLiquidity, 'multipool amm add liquidity');

  return makeAddLiquidityInvitation;
};

/**
 * The pool has poolX and poolY currently. The user wants to add liquidity of
 * giveX and giveY, but the ratios are probably not the same. We want to adjust
 * the pool to have the ratio (poolX + giveX) / (poolY + giveY), without
 * changing K, the product of the two sides.
 *
 * Calculate targetX and targetY, which multiply to the same product as
 * poolX * poolY, but are in the ratio we'll end at. From this we can produce
 * a proposed trade that maintains K, but changes the ratio, so we can add
 * liquidity at the desired ratio.
 *
 * endX = poolX + giveX;   endY = poolY + giveY
 * desiredRatio = endX / endY
 * targetY = sqrt(startK / desiredRatio)
 * targetX = desiredRatio * targetY
 *   so targetK equals startK because we square targetY
 * targetK = targetX * targetY = desiredRatio * (startK / desiredRatio)
 *
 * Since startK/endK is less than one, and we have to worry about early loss of
 * precision, we round and convert to bigint as the last step
 *
 * @param {Amount} poolX
 * @param {Amount} poolY
 * @param {Amount} giveX
 * @param {Amount} giveY
 * @returns {{newX: Amount, newY: Amount }}
 */
export const balancesToReachRatio = (poolX, poolY, giveX, giveY) => {
  const startK = multiply(poolX.value, poolY.value);
  const endX = add(poolX.value, giveX.value);
  const endY = add(poolY.value, giveY.value);
  const desiredRatio = Number(endX) / Number(endY);
  const targetY = Math.sqrt(Number(startK) / desiredRatio);
  const targetX = targetY * desiredRatio;

  return {
    newX: AmountMath.make(poolX.brand, BigInt(Math.trunc(targetX))),
    newY: AmountMath.make(poolY.brand, BigInt(Math.trunc(targetY))),
  };
};

export const makeMakeAddLiquidityAtRateInvitation = (
  zcf,
  getPool,
  provideVPool,
  feeSeat,
) => {
  const addLiquidityAtRate = seat => {
    assertProposalShape(seat, {
      give: {
        Central: null,
        Secondary: null,
      },
      want: { Liquidity: null },
    });

    const giveAlloc = seat.getProposal().give;
    const secondaryAmount = giveAlloc.Secondary;
    const secondaryBrand = secondaryAmount.brand;
    const centralBrand = giveAlloc.Central.brand;
    const pool = getPool(secondaryBrand);
    // Step 1: trade to adjust the pool's price
    //   A  figure out the ratio of the inputs
    //   B  figure out how X*Y changes to reach that ratio (ignoring fees)
    const centralPoolAmount = pool.getCentralAmount();
    const secondaryPoolAmount = pool.getSecondaryAmount();

    if (
      AmountMath.isEmpty(centralPoolAmount) &&
      AmountMath.isEmpty(secondaryPoolAmount)
    ) {
      return pool.addLiquidity(seat);
    }

    const { newX: newCentral, newY: newSecondary } = balancesToReachRatio(
      centralPoolAmount,
      secondaryPoolAmount,
      giveAlloc.Central,
      giveAlloc.Secondary,
    );

    const vPool = provideVPool(secondaryBrand).internalFacet;
    const poolSeat = pool.getPoolSeat();
    function transferForTrade(prices, incrementKey, decrementKey) {
      seat.decrementBy(harden({ [incrementKey]: prices.swapperGives }));
      seat.incrementBy(harden({ [decrementKey]: prices.swapperGets }));
      feeSeat.incrementBy(harden({ RUN: prices.protocolFee }));
      poolSeat.incrementBy(harden({ [incrementKey]: prices.xIncrement }));
      poolSeat.decrementBy(harden({ [decrementKey]: prices.yDecrement }));
    }

    //   1C  Stage the changes for the trade
    if (AmountMath.isGTE(newCentral, centralPoolAmount)) {
      const prices = vPool.getPriceForOutput(
        AmountMath.makeEmpty(centralBrand),
        AmountMath.subtract(secondaryPoolAmount, newSecondary),
      );
      transferForTrade(prices, 'Central', 'Secondary');
    } else {
      const prices = vPool.getPriceForInput(
        AmountMath.subtract(newSecondary, secondaryPoolAmount),
        AmountMath.makeEmpty(centralBrand),
      );
      transferForTrade(prices, 'Secondary', 'Central');
    }

    // Step 2: add remaining liquidity
    const stagedAllocation = poolSeat.getStagedAllocation();
    const centralPoolAfterTrade = stagedAllocation.Central;
    const secondaryPoolAfterTrade = stagedAllocation.Secondary;
    const userAllocation = seat.getStagedAllocation();

    const secondaryRequired = AmountMath.make(
      secondaryBrand,
      calcSecondaryRequired(
        userAllocation.Central.value,
        centralPoolAfterTrade.value,
        secondaryPoolAfterTrade.value,
        userAllocation.Secondary.value,
      ),
    );

    return vPool.addLiquidityActual(
      pool,
      seat,
      secondaryRequired,
      poolSeat.getStagedAllocation().Central,
      feeSeat,
    );
  };

  const makeAddLiquidityInvitation = () =>
    zcf.makeInvitation(
      addLiquidityAtRate,
      'multipool amm add liquidity at rate',
    );

  return makeAddLiquidityInvitation;
};
