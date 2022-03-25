// @ts-check

import { makeWeakStore } from '@agoric/store';
import { Far } from '@endo/marshal';

import { AssetKind, makeIssuerKit } from '@agoric/ertp';
import {
  assertElectorateMatches,
  handleParamGovernance,
} from '@agoric/governance';

import { assertIssuerKeywords } from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/far';
import { makeAddPool } from './pool.js';
import {
  makeMakeAddLiquidityInvitation,
  makeMakeAddLiquidityAtRateInvitation,
} from './addLiquidity.js';
import { makeMakeRemoveLiquidityInvitation } from './removeLiquidity.js';

import '@agoric/zoe/exported.js';
import { makeMakeCollectFeesInvitation } from './collectFees.js';
import { makeMakeSwapInvitation } from './swap.js';
import { makeDoublePool } from './doublePool.js';
import {
  makeAmmParamManager,
  POOL_FEE_KEY,
  PROTOCOL_FEE_KEY,
} from './params.js';

const { quote: q, details: X } = assert;
/**
 * Multipool AMM is a rewrite of Uniswap that supports multiple liquidity pools,
 * and direct exchanges across pools. Please see the documentation for more:
 * https://agoric.com/documentation/zoe/guide/contracts/multipoolAMM.html It
 * also uses a unique approach to charging fees. Each pool grows on every trade,
 * and a protocolFee is extracted.
 *
 * We expect that this contract will have tens to hundreds of issuers. Each
 * liquidity pool is between the central token and a secondary token. Secondary
 * tokens can be exchanged with each other, but only through the central token.
 * For example, if X and Y are two token types and C is the central token, a
 * swap giving X and wanting Y would first use the pool (X, C) then the pool (Y,
 * C). There are no liquidity pools directly between two secondary tokens.
 *
 * There should only need to be one instance of this contract, so liquidity can
 * be shared as much as possible.
 *
 * When the contract is instantiated, the central token is specified in the
 * terms. Separate invitations are available by calling methods on the
 * publicFacet for adding and removing liquidity and for making trades. Other
 * publicFacet operations support querying prices and the sizes of pools. New
 * Pools can be created with addPool().
 *
 * When making trades or requesting prices, the caller must specify either a
 * maximum input amount (swapIn, getInputPrice) or a minimum output amount
 * (swapOut, getOutPutPrice) or both. For swaps, the required keywords are `In`
 * for the trader's `give` amount, and `Out` for the trader's `want` amount.
 * getInputPrice and getOutputPrice each take two Amounts. The price functions
 * return both amountIn (which may be lower than the original amount) and
 * amountOut (which may be higher). When both prices are specified, no swap will
 * be made (and no price provided) if both restrictions can't be honored.
 *
 * When adding and removing liquidity, the keywords are Central, Secondary, and
 * Liquidity. adding liquidity has Central and Secondary in the `give` section,
 * while removing liquidity has `want` and `give` swapped.
 *
 * Transactions that don't require an invitation include addPool and the
 * queries: getInputPrice, getOutputPrice, getPoolAllocation,
 * getLiquidityIssuer, and getLiquiditySupply.
 *
 * This contract has two parameters (poolFee and protocolFee) that are managed
 * by governance. The contract calls `handleParamGovernance()` at startup, which
 * allows a contractManager to call for votes that would change the parameter
 * values in a transparent way. When correctly set up, customers with access to
 * this contract's publicFacet can verify the connectivity, and see which
 * Electorate has the ability to vote on changes, and which votes are ongoing or
 * have taken place. If not correctly set up, the validation checks will fail visibly.
 *
 * The initial values of the parameters are provided as poolFeeBP and
 * protocolFeeBP in terms. The poolFee is charged in RUN and each collateral, so
 * it is provided as a bigint. The protocolFee is always charged in RUN, but the
 * initial value is specified as a bigint for consistency.
 *
 * The contract gets the initial values for those parameters from its terms, and
 * thereafter can be seen to only use the values provided by the getter method
 * returned by the paramManager.
 *
 * `handleParamGovernance()` adds several methods to the publicFacet of the
 * contract, and bundles the privateFacet to ensure that governance
 * functionality is only accessible to the contractGovernor.
 *
 * The creatorFacet has one method (makeCollectFeesInvitation, which returns
 * collected fees to the creator). `handleParamGovernance()` adds internal
 * methods used by the contractGovernor. The contractGovernor then has access to
 * those internal methods, and reveals the original AMM creatorFacet to its own creator.
 *
 * @param {ZCF<AMMTerms>} zcf
 * @param {{ initialPoserInvitation: Invitation }} privateArgs
 */
const start = async (zcf, privateArgs) => {
  /**
   * This contract must have a "Central" keyword and issuer in the IssuerKeywordRecord.
   *
   * @typedef {{
   *   brands: { Central: Brand };
   *   issuers: {};
   *   timer: TimerService;
   *   electionManager: VoteOnParamChange;
   *   poolFeeBP: BasisPoints; // portion of the fees that go into the pool
   *   protocolFeeBP: BasisPoints; // portion of the fees that are shared with validators
   *   main: {
   *     PoolFee: ParamRecord<'nat'>;
   *     ProtocolFee: ParamRecord<'nat'>;
   *     Electorate: ParamRecord<'invitation'>;
   *   };
   * }} AMMTerms
   *
   * @typedef {bigint} BasisPoints -- hundredths of a percent
   */
  const {
    brands: { Central: centralBrand },
    timer,
    main: {
      [POOL_FEE_KEY]: poolFeeParam,
      [PROTOCOL_FEE_KEY]: protocolFeeParam,
      ...otherGovernedTerms
    },
  } = zcf.getTerms();
  assertIssuerKeywords(zcf, ['Central']);
  assert(centralBrand !== undefined, X`centralBrand must be present`);

  const { initialPoserInvitation } = privateArgs;

  const [paramManager, centralDisplayInfo] = await Promise.all([
    makeAmmParamManager(
      zcf.getZoeService(),
      poolFeeParam.value,
      protocolFeeParam.value,
      initialPoserInvitation,
    ),
    E(centralBrand).getDisplayInfo(),
  ]);

  assert.equal(
    centralDisplayInfo.assetKind,
    AssetKind.NAT,
    X`Central must be of kind ${q(AssetKind.NAT)}, not ${q(
      centralDisplayInfo.assetKind,
    )}`,
  );

  const { wrapPublicFacet, wrapCreatorFacet } = handleParamGovernance(
    zcf,
    paramManager,
  );

  assertElectorateMatches(paramManager, otherGovernedTerms);

  /** @type {WeakStore<Brand, XYKPool>} */
  const secondaryBrandToPool = makeWeakStore('secondaryBrand');
  const getPool = secondaryBrandToPool.get;
  const initPool = secondaryBrandToPool.init;
  const isSecondary = secondaryBrandToPool.has;

  const quoteIssuerKit = makeIssuerKit('Quote', AssetKind.SET);

  // For now, this seat collects protocol fees. It needs to be connected to
  // something that will extract the fees.
  const { zcfSeat: protocolSeat } = zcf.makeEmptySeatKit();

  const getLiquiditySupply = brand => getPool(brand).getLiquiditySupply();
  const getLiquidityIssuer = brand => getPool(brand).getLiquidityIssuer();
  const addPool = makeAddPool(
    zcf,
    isSecondary,
    initPool,
    centralBrand,
    timer,
    quoteIssuerKit,
    paramManager.getProtocolFee,
    paramManager.getPoolFee,
    protocolSeat,
  );
  const getPoolAllocation = brand => {
    return getPool(brand).getPoolSeat().getCurrentAllocation();
  };

  const getPriceAuthorities = brand => {
    const pool = getPool(brand);
    return {
      toCentral: pool.getToCentralPriceAuthority(),
      fromCentral: pool.getFromCentralPriceAuthority(),
    };
  };

  /**
   * @param {Brand} brandIn
   * @param {Brand} brandOut
   * @returns {VPoolWrapper<unknown>}
   */
  const provideVPool = (brandIn, brandOut) => {
    if (isSecondary(brandIn) && isSecondary(brandOut)) {
      return makeDoublePool(
        zcf,
        getPool(brandIn),
        getPool(brandOut),
        paramManager.getProtocolFee,
        paramManager.getPoolFee,
        protocolSeat,
      );
    }

    const pool = isSecondary(brandOut) ? getPool(brandOut) : getPool(brandIn);
    return pool.getVPool();
  };

  const getInputPrice = (amountIn, amountOut) => {
    const pool = provideVPool(amountIn.brand, amountOut.brand).externalFacet;
    return pool.getInputPrice(amountIn, amountOut);
  };
  const getOutputPrice = (amountIn, amountOut) => {
    const pool = provideVPool(amountIn.brand, amountOut.brand).externalFacet;
    return pool.getOutputPrice(amountIn, amountOut);
  };

  const { makeSwapInInvitation, makeSwapOutInvitation } =
    makeMakeSwapInvitation(zcf, provideVPool);
  const makeAddLiquidityInvitation = makeMakeAddLiquidityInvitation(
    zcf,
    getPool,
  );
  const makeAddLiquidityAtRateInvitation = makeMakeAddLiquidityAtRateInvitation(
    zcf,
    getPool,
    provideVPool,
    protocolSeat,
  );

  const makeRemoveLiquidityInvitation = makeMakeRemoveLiquidityInvitation(
    zcf,
    getPool,
  );

  const { makeCollectFeesInvitation } = makeMakeCollectFeesInvitation(
    zcf,
    protocolSeat,
    centralBrand,
  );

  /** @type {XYKAMMPublicFacet} */
  const publicFacet = wrapPublicFacet(
    Far('AMM public facet', {
      addPool,
      getPoolAllocation,
      getLiquidityIssuer,
      getLiquiditySupply,
      getInputPrice,
      getOutputPrice,
      makeSwapInvitation: makeSwapInInvitation,
      makeSwapInInvitation,
      makeSwapOutInvitation,
      makeAddLiquidityInvitation,
      makeAddLiquidityAtRateInvitation,
      makeRemoveLiquidityInvitation,
      getQuoteIssuer: () => quoteIssuerKit.issuer,
      getPriceAuthorities,
      getAllPoolBrands: () =>
        Object.values(zcf.getTerms().brands).filter(isSecondary),
      getProtocolPoolBalance: () => protocolSeat.getCurrentAllocation(),
    }),
  );

  /** @type {GovernedCreatorFacet<any>} */
  const creatorFacet = wrapCreatorFacet(
    Far('AMM Fee Collector facet', {
      makeCollectFeesInvitation,
    }),
  );
  return harden({ publicFacet, creatorFacet });
};

harden(start);
export { start };
