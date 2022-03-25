// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AssetKind, AmountMath, isNatValue } from '@agoric/ertp';
import { makeNotifierKit } from '@agoric/notifier';

import {
  calcLiqValueToMint,
  calcValueToRemove,
  calcSecondaryRequired,
} from '@agoric/zoe/src/contractSupport/index.js';

import '@agoric/zoe/exported.js';
import { makePriceAuthority } from './priceAuthority.js';
import { makeSinglePool } from './singlePool.js';

const { details: X } = assert;

// Pools represent a single pool of liquidity. Price calculations and trading
// happen in a wrapper class that knows whether the proposed trade involves a
// single pool or multiple hops.

/**
 * @param {ZCF} zcf
 * @param {(brand: Brand) => boolean} isInSecondaries
 * @param {(brand: Brand, pool: XYKPool) => void} initPool
 * @param {Brand} centralBrand
 * @param {ERef<Timer>} timer
 * @param {IssuerKit} quoteIssuerKit
 * @param {() => bigint} getProtocolFeeBP - Retrieve governed protocol fee value
 * @param {() => bigint} getPoolFeeBP - Retrieve governed pool fee value
 * @param {ZCFSeat} protocolSeat
 */
export const makeAddPool = (
  zcf,
  isInSecondaries,
  initPool,
  centralBrand,
  timer,
  quoteIssuerKit,
  getProtocolFeeBP,
  getPoolFeeBP,
  protocolSeat,
) => {
  const makePool = (liquidityZcfMint, poolSeat, secondaryBrand) => {
    let liqTokenSupply = 0n;

    const { brand: liquidityBrand, issuer: liquidityIssuer } =
      liquidityZcfMint.getIssuerRecord();
    const { notifier, updater } = makeNotifierKit();

    const updateState = pool =>
      // TODO: when governance can change the interest rate, include it here
      updater.updateState({
        central: pool.getCentralAmount(),
        secondary: pool.getSecondaryAmount(),
      });

    const addLiquidityActual = (
      pool,
      zcfSeat,
      secondaryAmount,
      poolCentralAmount,
      feeSeat,
    ) => {
      // addLiquidity can't be called until the pool has been created. We verify
      // that the asset is NAT before creating a pool.

      const liquidityValueOut = calcLiqValueToMint(
        liqTokenSupply,
        zcfSeat.getStagedAllocation().Central.value,
        poolCentralAmount.value,
      );

      const liquidityAmountOut = AmountMath.make(
        liquidityBrand,
        liquidityValueOut,
      );
      liquidityZcfMint.mintGains(
        harden({ Liquidity: liquidityAmountOut }),
        poolSeat,
      );
      liqTokenSupply += liquidityValueOut;

      poolSeat.incrementBy(
        zcfSeat.decrementBy(
          harden({
            Central: zcfSeat.getStagedAllocation().Central,
            Secondary: secondaryAmount,
          }),
        ),
      );

      zcfSeat.incrementBy(
        poolSeat.decrementBy(harden({ Liquidity: liquidityAmountOut })),
      );
      if (feeSeat) {
        zcf.reallocate(poolSeat, zcfSeat, feeSeat);
      } else {
        zcf.reallocate(poolSeat, zcfSeat);
      }
      zcfSeat.exit();
      updateState(pool);
      return 'Added liquidity.';
    };

    /** @type {XYKPool} */
    const pool = Far('pool', {
      getLiquiditySupply: () => liqTokenSupply,
      getLiquidityIssuer: () => liquidityIssuer,
      getPoolSeat: () => poolSeat,
      getCentralAmount: () =>
        poolSeat.getAmountAllocated('Central', centralBrand),
      getSecondaryAmount: () =>
        poolSeat.getAmountAllocated('Secondary', secondaryBrand),

      addLiquidity: zcfSeat => {
        const centralIn = zcfSeat.getStagedAllocation().Central;
        assert(isNatValue(centralIn.value), 'User Central');
        const secondaryIn = zcfSeat.getStagedAllocation().Secondary;
        assert(isNatValue(secondaryIn.value), 'User Secondary');

        if (liqTokenSupply === 0n) {
          return addLiquidityActual(pool, zcfSeat, secondaryIn, centralIn);
        }

        const centralPoolAmount = pool.getCentralAmount();
        const secondaryPoolAmount = pool.getSecondaryAmount();
        assert(isNatValue(centralPoolAmount.value), 'Pool Central');
        assert(isNatValue(secondaryPoolAmount.value), 'Pool Secondary');

        // To calculate liquidity, we'll need to calculate alpha from the primary
        // token's value before, and the value that will be added to the pool
        const secondaryRequired = AmountMath.make(
          secondaryBrand,
          calcSecondaryRequired(
            centralIn.value,
            centralPoolAmount.value,
            secondaryPoolAmount.value,
            secondaryIn.value,
          ),
        );

        // Central was specified precisely so offer must provide enough secondary.
        assert(
          AmountMath.isGTE(secondaryIn, secondaryRequired),
          'insufficient Secondary deposited',
        );

        return addLiquidityActual(pool, zcfSeat, secondaryRequired, centralIn);
      },
      removeLiquidity: userSeat => {
        const liquidityIn = userSeat.getAmountAllocated(
          'Liquidity',
          liquidityBrand,
        );
        const liquidityValueIn = liquidityIn.value;
        assert(isNatValue(liquidityValueIn), 'User Liquidity');
        const centralTokenAmountOut = AmountMath.make(
          centralBrand,
          calcValueToRemove(
            liqTokenSupply,
            pool.getCentralAmount().value,
            liquidityValueIn,
          ),
        );

        const tokenKeywordAmountOut = AmountMath.make(
          secondaryBrand,
          calcValueToRemove(
            liqTokenSupply,
            pool.getSecondaryAmount().value,
            liquidityValueIn,
          ),
        );

        liqTokenSupply -= liquidityValueIn;

        poolSeat.incrementBy(
          userSeat.decrementBy(harden({ Liquidity: liquidityIn })),
        );
        userSeat.incrementBy(
          poolSeat.decrementBy(
            harden({
              Central: centralTokenAmountOut,
              Secondary: tokenKeywordAmountOut,
            }),
          ),
        );
        zcf.reallocate(userSeat, poolSeat);

        userSeat.exit();
        updateState(pool);
        return 'Liquidity successfully removed.';
      },
      getNotifier: () => notifier,
      updateState: () => updateState(pool),
      // eslint-disable-next-line no-use-before-define
      getToCentralPriceAuthority: () => toCentralPriceAuthority,
      // eslint-disable-next-line no-use-before-define
      getFromCentralPriceAuthority: () => fromCentralPriceAuthority,
      // eslint-disable-next-line no-use-before-define
      getVPool: () => vPool,
    });

    const vPool = makeSinglePool(
      zcf,
      pool,
      getProtocolFeeBP,
      getPoolFeeBP,
      protocolSeat,
      addLiquidityActual,
    );

    const getInputPriceForPA = (amountIn, brandOut) =>
      vPool.externalFacet.getInputPrice(
        amountIn,
        AmountMath.makeEmpty(brandOut),
      );
    const getOutputPriceForPA = (brandIn, amountout) =>
      vPool.externalFacet.getInputPrice(
        AmountMath.makeEmpty(brandIn),
        amountout,
      );

    const toCentralPriceAuthority = makePriceAuthority(
      getInputPriceForPA,
      getOutputPriceForPA,
      secondaryBrand,
      centralBrand,
      timer,
      zcf,
      notifier,
      quoteIssuerKit,
    );
    const fromCentralPriceAuthority = makePriceAuthority(
      getInputPriceForPA,
      getOutputPriceForPA,
      centralBrand,
      secondaryBrand,
      timer,
      zcf,
      notifier,
      quoteIssuerKit,
    );

    return pool;
  };

  /**
   * Allows users to add new liquidity pools. `secondaryIssuer` and its keyword
   * must not have been already used
   *
   * @param {Issuer} secondaryIssuer
   * @param {Keyword} keyword - Will be used in the terms.issuers for the
   *   contract, but not used otherwise
   */
  const addPool = async (secondaryIssuer, keyword) => {
    const liquidityKeyword = `${keyword}Liquidity`;
    zcf.assertUniqueKeyword(liquidityKeyword);

    const [secondaryAssetKind, secondaryBrand] = await Promise.all([
      E(secondaryIssuer).getAssetKind(),
      E(secondaryIssuer).getBrand(),
    ]);

    assert(
      !isInSecondaries(secondaryBrand),
      X`issuer ${secondaryIssuer} already has a pool`,
    );
    assert(
      secondaryAssetKind === AssetKind.NAT,
      X`${keyword} asset not fungible (must use NAT math)`,
    );

    // COMMIT POINT
    // We've checked all the foreseeable exceptions (except
    // zcf.assertUniqueKeyword(keyword), which will be checked by saveIssuer()
    // before proceeding), so we can do the work now.
    await zcf.saveIssuer(secondaryIssuer, keyword);
    const liquidityZCFMint = await zcf.makeZCFMint(
      liquidityKeyword,
      AssetKind.NAT,
      harden({ decimalPlaces: 6 }),
    );
    const { zcfSeat: poolSeat } = zcf.makeEmptySeatKit();
    const pool = makePool(liquidityZCFMint, poolSeat, secondaryBrand);
    initPool(secondaryBrand, pool);
    return liquidityZCFMint.getIssuerRecord().issuer;
  };

  return addPool;
};
