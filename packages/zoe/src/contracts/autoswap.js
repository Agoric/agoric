// @ts-check

import { Far } from '@endo/marshal';
import { assert } from '@agoric/assert';
import { AmountMath, isNatValue } from '@agoric/ertp';

// Eventually will be importable from '@agoric/zoe-contract-support'
import {
  getInputPrice,
  getOutputPrice,
  calcLiqValueToMint,
  calcValueToRemove,
  assertProposalShape,
  assertNatAssetKind,
  calcSecondaryRequired,
} from '../contractSupport/index.js';

import '../../exported.js';

/**
 * Autoswap is a rewrite of Uniswap. Please see the documentation for more
 * https://agoric.com/documentation/zoe/guide/contracts/autoswap.html
 *
 * When the contract is instantiated, the two tokens (Central and Secondary) are
 * specified in the issuerKeywordRecord. There is no behavioral difference
 * between the two when trading; the names were chosen for consistency with our
 * constant product AMM. When trading, use the keywords In and Out to specify
 * the amount to be paid in, and the amount to be received.
 *
 * When adding or removing liquidity, the amounts deposited must be in
 * proportion to the current balances in the pool. The amount of the Central
 * asset is used as the basis. The Secondary assets must be added in proportion.
 * If less Secondary is provided than required, we refuse the offer. If more is
 * provided than is required, we return the excess.
 *
 * Before trading can take place, it is necessary to add liquidity using
 * makeAddLiquidityInvitation(). Separate invitations are available for adding
 * and removing liquidity, and for doing swaps. Other API operations support
 * price checks and checking the size of the liquidity pool.
 *
 * The swap operation requires either the input amount or the output amount to
 * be specified. makeSwapInInvitation treats the give amount as definitive,
 * while makeSwapOutInvitation honors the want amount. With swapIn, a want
 * amount can be specified, and if the offer can't be satisfied, the offer will
 * be refunded. Similarly with swapOut, the want amount will be satisfied if
 * possible. If more is provided as the give amount than necessary, the excess
 * will be refunded. If not enough is provided, the offer will be refunded.
 *
 * The publicFacet can make new invitations (makeSwapInInvitation,
 * makeSwapOutInvitation, makeAddLiquidityInvitation, and
 * makeRemoveLiquidityInvitation), tell how much would be paid for a given input
 * (getInputPrice), or how much would be earned by depositing a specified amount
 * (getOutputPrice). In addition, there are requests for the LiquidityIssuer
 * (getLiquidityIssuer), the current outstanding liquidity (getLiquiditySupply),
 * and the current balances in the pool (getPoolAllocation).
 *
 * @param {ZCF} zcf
 */
const start = async zcf => {
  // Create a local liquidity mint and issuer.
  const liquidityMint = await zcf.makeZCFMint('Liquidity');
  // AWAIT  ////////////////////

  const { issuer: liquidityIssuer, brand: liquidityBrand } =
    liquidityMint.getIssuerRecord();
  let liqTokenSupply = 0n;

  // In order to get all the brands, we must call zcf.getTerms() after
  // we create the liquidityIssuer
  const { brands } = zcf.getTerms();
  Object.values(brands).forEach(brand => assertNatAssetKind(zcf, brand));
  /** @type {Map<Brand, Keyword>} */
  const brandToKeyword = new Map(
    Object.entries(brands).map(([keyword, brand]) => [brand, keyword]),
  );
  /**
   * @param {Brand} brand
   * @returns {string}
   */
  const getPoolKeyword = brand => {
    assert(brandToKeyword.has(brand), 'getPoolKeyword: brand not found');
    const keyword = brandToKeyword.get(brand);
    assert.typeof(keyword, 'string');
    return keyword;
  };

  const { zcfSeat: poolSeat } = zcf.makeEmptySeatKit();
  const getPoolAmount = brand => {
    const keyword = getPoolKeyword(brand);
    return poolSeat.getAmountAllocated(keyword, brand);
  };

  function consummate(tradeAmountIn, tradeAmountOut, swapSeat) {
    swapSeat.decrementBy(harden({ In: tradeAmountIn }));
    poolSeat.incrementBy(
      harden({
        [getPoolKeyword(tradeAmountIn.brand)]: tradeAmountIn,
      }),
    );

    poolSeat.decrementBy(
      harden({
        [getPoolKeyword(tradeAmountOut.brand)]: tradeAmountOut,
      }),
    );
    swapSeat.incrementBy(harden({ Out: tradeAmountOut }));

    zcf.reallocate(swapSeat, poolSeat);

    swapSeat.exit();
    return `Swap successfully completed.`;
  }

  const assertSwapProposal = seat =>
    assertProposalShape(seat, {
      want: { Out: null },
      give: { In: null },
    });

  /**
   * Swap one asset for another. In specifies the asset being provided and Out
   * specifies the wanted asset. The amount of Out returned is calculated based
   * on the In amount. If the calculation produces a value less than the
   * specified want, the trade will fail in offer safety.
   *
   * @type {OfferHandler}
   */
  const swapInHandler = swapSeat => {
    assertSwapProposal(swapSeat);
    assert(
      !AmountMath.isEmpty(getPoolAmount(brands.Central)),
      `Pool not initialized`,
    );

    const {
      give: { In: amountIn },
      want: { Out: wantedAmountOut },
    } = swapSeat.getProposal();

    assert(isNatValue(amountIn.value));

    const outputValue = getInputPrice(
      amountIn.value,
      getPoolAmount(amountIn.brand).value,
      getPoolAmount(wantedAmountOut.brand).value,
    );
    const tradeAmountOut = AmountMath.make(wantedAmountOut.brand, outputValue);
    return consummate(amountIn, tradeAmountOut, swapSeat);
  };

  /**
   * Swap one asset for another. In specifies the asset being provided and Out
   * specifies the wanted asset. The In amount is calculated based on the Out
   * amount. If the In amount provided is insufficient the trade is refused.
   *
   * @type {OfferHandler}
   */
  const swapOutHandler = swapSeat => {
    assertSwapProposal(swapSeat);
    assert(
      !AmountMath.isEmpty(getPoolAmount(brands.Central)),
      'Pool not initialized',
    );

    const {
      give: { In: amountIn },
      want: { Out: wantedAmountOut },
    } = swapSeat.getProposal();

    assert(isNatValue(wantedAmountOut.value));

    const tradePrice = getOutputPrice(
      wantedAmountOut.value,
      getPoolAmount(amountIn.brand).value,
      getPoolAmount(wantedAmountOut.brand).value,
    );
    assert(tradePrice <= amountIn.value, 'amountIn insufficient');
    const tradeAmountIn = AmountMath.make(amountIn.brand, tradePrice);

    return consummate(tradeAmountIn, wantedAmountOut, swapSeat);
  };

  const addLiquidity = (seat, secondaryAmount) => {
    const userAllocation = seat.getCurrentAllocation();
    const centralPool = getPoolAmount(brands.Central).value;
    const centralIn = userAllocation.Central.value;
    const liquidityValueOut = calcLiqValueToMint(
      liqTokenSupply,
      centralIn,
      /** @type {bigint} */ (centralPool),
    );
    const liquidityAmountOut = AmountMath.make(
      liquidityBrand,
      liquidityValueOut,
    );
    liquidityMint.mintGains(
      harden({ Liquidity: liquidityAmountOut }),
      poolSeat,
    );
    liqTokenSupply += liquidityValueOut;

    const liquidityDeposited = {
      Central: AmountMath.make(brands.Central, centralIn),
      Secondary: secondaryAmount,
    };
    poolSeat.incrementBy(seat.decrementBy(harden(liquidityDeposited)));
    seat.incrementBy(
      poolSeat.decrementBy(harden({ Liquidity: liquidityAmountOut })),
    );

    zcf.reallocate(poolSeat, seat);

    seat.exit();
    return 'Added liquidity.';
  };

  const initiateLiquidity = liqSeat => {
    const userAllocation = liqSeat.getCurrentAllocation();
    return addLiquidity(liqSeat, userAllocation.Secondary);
  };

  /**
   * Add liquidity. We use the amount of the Central asset as the basis, and
   * require that Secondary assets be added in proportion. If less Secondary is
   * provided than required, we refuse the offer. If more is provided than is
   * required, we return the excess.
   *
   * If this is the first time liquidity was added, we accept all of both
   * Primary and Secondary, to establish the initial trading ratio. In this
   * case, we create liquidity equal to the value of Central asset contributed.
   *
   * @type {OfferHandler}
   */
  const addLiquidityHandler = liqSeat => {
    assertProposalShape(liqSeat, {
      give: { Central: null, Secondary: null },
      want: { Liquidity: null },
    });
    if (AmountMath.isEmpty(getPoolAmount(brands.Central))) {
      return initiateLiquidity(liqSeat);
    }

    const userAllocation = liqSeat.getCurrentAllocation();
    const secondaryIn = userAllocation.Secondary;

    assert(isNatValue(userAllocation.Central.value));
    assert(isNatValue(secondaryIn.value));

    // To calculate liquidity, we'll need to calculate alpha from the primary
    // token's value before, and the value that will be added to the pool
    const secondaryOut = AmountMath.make(
      secondaryIn.brand,
      calcSecondaryRequired(
        userAllocation.Central.value,
        getPoolAmount(brands.Central).value,
        getPoolAmount(brands.Secondary).value,
        secondaryIn.value,
      ),
    );

    // Central was specified precisely so offer must provide enough secondary.
    assert(
      AmountMath.isGTE(secondaryIn, secondaryOut),
      'insufficient Secondary deposited',
    );

    return addLiquidity(liqSeat, secondaryOut);
  };

  /** @type {OfferHandler} */
  const removeLiquidityHandler = removeLiqSeat => {
    assertProposalShape(removeLiqSeat, {
      want: { Central: null, Secondary: null },
      give: { Liquidity: null },
    });
    // TODO (hibbert) should we burn tokens?
    const userAllocation = removeLiqSeat.getCurrentAllocation();
    const liquidityValueIn = userAllocation.Liquidity.value;
    assert(isNatValue(liquidityValueIn));

    const newUserCentralAmount = AmountMath.make(
      brands.Central,
      calcValueToRemove(
        liqTokenSupply,
        getPoolAmount(brands.Central).value,
        liquidityValueIn,
      ),
    );
    const newUserSecondaryAmount = AmountMath.make(
      brands.Secondary,
      calcValueToRemove(
        liqTokenSupply,
        getPoolAmount(brands.Secondary).value,
        liquidityValueIn,
      ),
    );

    liqTokenSupply -= liquidityValueIn;

    const liquidityRemoved = {
      Central: newUserCentralAmount,
      Secondary: newUserSecondaryAmount,
    };

    poolSeat.incrementBy(
      removeLiqSeat.decrementBy(
        harden({ Liquidity: userAllocation.Liquidity }),
      ),
    );

    removeLiqSeat.incrementBy(poolSeat.decrementBy(harden(liquidityRemoved)));

    zcf.reallocate(poolSeat, removeLiqSeat);

    removeLiqSeat.exit();
    return 'Liquidity successfully removed.';
  };

  const makeAddLiquidityInvitation = () =>
    zcf.makeInvitation(addLiquidityHandler, 'autoswap add liquidity');

  const makeRemoveLiquidityInvitation = () =>
    zcf.makeInvitation(removeLiquidityHandler, 'autoswap remove liquidity');

  const makeSwapInInvitation = () =>
    zcf.makeInvitation(swapInHandler, 'autoswap swap');

  const makeSwapOutInvitation = () =>
    zcf.makeInvitation(swapOutHandler, 'autoswap swap');

  /**
   * `getOutputForGivenInput` calculates the result of a trade, given a certain
   * amount of digital assets in.
   *
   * @param {Amount} amountIn - The amount of digital assets to be sent in
   * @param {Brand} brandOut - The brand of asset desired
   */
  const getOutputForGivenInput = (amountIn, brandOut) => {
    const inputReserve = getPoolAmount(amountIn.brand).value;
    const outputReserve = getPoolAmount(brandOut).value;
    assert(isNatValue(amountIn.value));
    if (AmountMath.isEmpty(amountIn)) {
      return AmountMath.makeEmpty(brandOut);
    }
    const outputValue = getInputPrice(
      amountIn.value,
      inputReserve,
      outputReserve,
    );
    return AmountMath.make(brandOut, outputValue);
  };

  /**
   * `getInputForGivenOutput` calculates the amount of assets required to be
   * provided in order to obtain a specified gain.
   *
   * @param {Amount} amountOut - The amount of digital assets desired
   * @param {Brand} brandIn - The brand of asset desired
   */
  const getInputForGivenOutput = (amountOut, brandIn) => {
    const inputReserve = getPoolAmount(brandIn).value;
    const outputReserve = getPoolAmount(amountOut.brand).value;
    assert(isNatValue(amountOut.value));
    if (AmountMath.isEmpty(amountOut)) {
      return AmountMath.makeEmpty(brandIn);
    }
    const outputValue = getOutputPrice(
      amountOut.value,
      inputReserve,
      outputReserve,
    );
    return AmountMath.make(brandIn, outputValue);
  };

  const getPoolAllocation = poolSeat.getCurrentAllocation;

  /** @type {AutoswapPublicFacet} */
  const publicFacet = Far('publicFacet', {
    getInputPrice: getOutputForGivenInput,
    getOutputPrice: getInputForGivenOutput,
    getLiquidityIssuer: () => liquidityIssuer,
    getLiquiditySupply: () => liqTokenSupply,
    getPoolAllocation,
    makeSwapInvitation: makeSwapInInvitation,
    makeSwapInInvitation,
    makeSwapOutInvitation,
    makeAddLiquidityInvitation,
    makeRemoveLiquidityInvitation,
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
