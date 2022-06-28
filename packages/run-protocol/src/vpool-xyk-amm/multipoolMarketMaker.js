// @ts-check
// @jessie-check

import { makeStore, makeWeakStore } from '@agoric/store';
import { Far } from '@endo/marshal';

import { AssetKind, makeIssuerKit } from '@agoric/ertp';
import { handleParamGovernance, ParamTypes } from '@agoric/governance';
import {
  assertIssuerKeywords,
  offerTo,
} from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/far';
import { makeAddIssuer, makeAddPoolInvitation } from './addPool.js';
import { publicPrices } from './pool.js';
import {
  makeMakeAddLiquidityAtRateInvitation,
  makeMakeAddLiquidityInvitation,
} from './addLiquidity.js';
import { makeMakeRemoveLiquidityInvitation } from './removeLiquidity.js';

import '@agoric/zoe/exported.js';
import { makeMakeCollectFeesInvitation } from '../collectFees.js';
import { makeMakeSwapInvitation } from './swap.js';
import { makeDoublePool } from './doublePool.js';
import {
  POOL_FEE_KEY,
  PROTOCOL_FEE_KEY,
  MIN_INITIAL_POOL_LIQUIDITY_KEY,
} from './params.js';
import { makeTracer } from '../makeTracer.js';
import { makeMetricsPublisherKit } from '../contractSupport.js';

const { quote: q, details: X } = assert;

const trace = makeTracer('XykAmm', false);

/**
 * @typedef {object} MetricsNotification
 * @property {Brand[]} XYK brands of pools that use an X*Y=K pricing policy
 */

/**
 * Multipool AMM is a rewrite of Uniswap that supports multiple liquidity pools,
 * and direct exchanges across pools. Please see the documentation for more:
 * https://agoric.com/documentation/zoe/guide/contracts/multipoolAMM.html It
 * also uses a unique approach to charging fees. Each pool grows on every trade,
 * and a protocolFee is extracted.
 *
 * We expect that this contract will have tens to hundreds of issuers.  Each
 * liquidity pool is between the central token and a secondary token. Secondary
 * tokens can be exchanged with each other, but only through the central
 * token. For example, if X and Y are two token types and C is the central
 * token, a swap giving X and wanting Y would first use the pool (X, C) then the
 * pool (Y, C). There are no liquidity pools directly between two secondary
 * tokens.
 *
 * There should only need to be one instance of this contract, so liquidity can
 * be shared as much as possible.
 *
 * When the contract is instantiated, the central token is specified in the
 * terms. Separate invitations are available by calling methods on the
 * publicFacet for adding and removing liquidity and for making trades. Other
 * publicFacet operations support querying prices and the sizes of pools. New
 * Pools can be created by first calling addIssuer() and then exercising an
 * invitation from addPoolInvitation().
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
 * This contract has two parameters (poolFee and protocolFee) that are
 * managed by governance. The contract calls `handleParamGovernance()` at
 * startup, which allows a contractManager to call for votes that would change
 * the parameter values in a transparent way. When correctly set up, customers
 * with access to this contract's publicFacet can verify the connectivity, and
 * see which Electorate has the ability to vote on changes, and which votes are
 * ongoing or have taken place. If not correctly set up, the validation checks
 * will fail visibly.
 *
 * The initial values of the parameters are provided as poolFeeBP and
 * protocolFeeBP in terms. The poolFee is charged in RUN and each collateral, so
 * it is provided as a bigint. The protocolFee is always charged in RUN, but the
 * initial value is specified as a bigint for consistency.
 *
 * The contract gets the initial values for those parameters from its terms, and
 * thereafter can be seen to only use the values provided by the
 * getter method returned by the paramManager.
 *
 * `handleParamGovernance()` adds several methods to the publicFacet of the
 * contract, and bundles the privateFacet to ensure that governance
 * functionality is only accessible to the contractGovernor.
 *
 * The creatorFacet has one method (makeCollectFeesInvitation, which returns
 * collected fees to the creator). `handleParamGovernance()` adds internal
 * methods used by the contractGovernor. The contractGovernor then has access to
 * those internal methods, and reveals the original AMM creatorFacet to its own
 * creator.
 *
 * @param {ZCF<AMMTerms>} zcf
 * @param {{
 *   initialPoserInvitation: Invitation,
 *   storageNode?: ERef<StorageNode>,
 *   marshaller?: ERef<Marshaller>,
 * }} privateArgs
 */
const start = async (zcf, privateArgs) => {
  /**
   * This contract must have a "Central" keyword and issuer in the
   * IssuerKeywordRecord.
   */
  const {
    brands: { Central: centralBrand },
    timer,
  } = zcf.getTerms();
  assertIssuerKeywords(zcf, ['Central']);
  assert(centralBrand !== undefined, X`centralBrand must be present`);

  const [
    { augmentPublicFacet, makeGovernorFacet, params },
    centralDisplayInfo,
  ] = await Promise.all([
    handleParamGovernance(
      zcf,
      privateArgs.initialPoserInvitation,
      {
        [POOL_FEE_KEY]: ParamTypes.NAT,
        [PROTOCOL_FEE_KEY]: ParamTypes.NAT,
        [MIN_INITIAL_POOL_LIQUIDITY_KEY]: ParamTypes.AMOUNT,
      },
      privateArgs.storageNode,
      privateArgs.marshaller,
    ),
    E(centralBrand).getDisplayInfo(),
    privateArgs.storageNode,
    privateArgs.marshaller,
  ]);

  assert.equal(
    centralDisplayInfo.assetKind,
    AssetKind.NAT,
    X`Central must be of kind ${q(AssetKind.NAT)}, not ${q(
      centralDisplayInfo.assetKind,
    )}`,
  );

  /** @type {Store<Brand,PoolFacets>} */
  const secondaryBrandToPool = makeStore('secondaryBrandToPool');
  const getPool = brand => secondaryBrandToPool.get(brand).pool;
  const getPoolHelper = brand => secondaryBrandToPool.get(brand).helper;
  const initPool = secondaryBrandToPool.init;
  // XXX a brand can be in secondaryBrandToLiquidityMint and return false for this check
  // if it's called between addIssuer and addPool
  const isSecondary = secondaryBrandToPool.has;

  // The liquidityBrand has to exist to allow the addPool Offer to specify want
  /** @type {WeakStore<Brand,ZCFMint>} */
  const secondaryBrandToLiquidityMint = makeWeakStore(
    'secondaryBrandToLiquidityMint',
  );

  const quoteIssuerKit = makeIssuerKit('Quote', AssetKind.SET);

  const { metricsPublication, metricsSubscription } = makeMetricsPublisherKit(
    privateArgs.storageNode,
    privateArgs.marshaller,
  );
  const updateMetrics = () => {
    metricsPublication.updateState(
      harden({ XYK: Array.from(secondaryBrandToPool.keys()) }),
    );
  };
  updateMetrics();

  // For now, this seat collects protocol fees. It needs to be connected to
  // something that will extract the fees.
  const { zcfSeat: protocolSeat } = zcf.makeEmptySeatKit();

  /** @type {AssetReservePublicFacet=} */
  let reserveFacet;
  /**
   * @param {Brand} secondaryBrand
   * @param {ZCFSeat} reserveLiquidityTokenSeat
   * @param {Keyword} liquidityKeyword
   * @returns {Promise<void>} up to caller whether to await or handle rejections
   */
  const handlePoolAdded = async (
    secondaryBrand,
    reserveLiquidityTokenSeat,
    liquidityKeyword,
  ) => {
    trace('handlePoolAdded', { secondaryBrand, liquidityKeyword });
    updateMetrics();

    assert(reserveFacet, 'Missing reserveFacet');
    assert(reserveLiquidityTokenSeat, 'Missing reserveLiquidityTokenSeat');

    const secondaryIssuer = await zcf.getIssuerForBrand(secondaryBrand);
    trace('ensuring reserve has the liquidity issuer', {
      secondaryBrand,
      secondaryIssuer,
    });
    await E(reserveFacet).addLiquidityIssuer(secondaryIssuer);

    trace(
      `move ${liquidityKeyword} to the reserve`,
      reserveLiquidityTokenSeat.getCurrentAllocation(),
    );
    const addCollateral = await E(reserveFacet).makeAddCollateralInvitation();
    const proposal = harden({
      give: {
        Collateral:
          reserveLiquidityTokenSeat.getCurrentAllocation()[liquidityKeyword],
      },
    });
    const { deposited, userSeatPromise } = await offerTo(
      zcf,
      addCollateral,
      harden({ [liquidityKeyword]: 'Collateral' }),
      proposal,
      reserveLiquidityTokenSeat,
    );
    const deposits = await deposited;
    trace('handlePoolAdded deposited', deposits);
    await E(userSeatPromise).getOfferResult();
    reserveLiquidityTokenSeat.exit();
    trace('handlePoolAdded done');
  };

  /** @param {Brand} brand */
  const getLiquidityIssuer = brand =>
    secondaryBrandToLiquidityMint.get(brand).getIssuerRecord().issuer;
  /** @param {Brand} brand */
  const getLiquiditySupply = brand => getPool(brand).getLiquiditySupply();

  /** @param {Brand} brand */
  const getSecondaryIssuer = brand => {
    assert(
      secondaryBrandToLiquidityMint.has(brand),
      'Brand not a secondary of the AMM',
    );
    return zcf.getIssuerForBrand(brand);
  };
  const poolStorageNode = await (privateArgs.storageNode &&
    E(privateArgs.storageNode).getChildNode(
      // NB: the set of pools grows monotonically
      `pool${secondaryBrandToPool.getSize()}`,
    ));
  const addPoolInvitation = makeAddPoolInvitation(
    zcf,
    initPool,
    centralBrand,
    timer,
    quoteIssuerKit,
    params,
    protocolSeat,
    secondaryBrandToLiquidityMint,
    handlePoolAdded,
    poolStorageNode,
    privateArgs.marshaller,
  );
  const addIssuer = makeAddIssuer(
    zcf,
    isSecondary,
    secondaryBrandToLiquidityMint,
    () => {
      assert(reserveFacet, 'Must first resolveReserveFacet');
      return E(reserveFacet).addIssuerFromAmm;
    },
  );

  /** @param {Brand} brand */
  const getPoolAllocation = brand =>
    getPool(brand).getPoolSeat().getCurrentAllocation();

  const getPriceAuthorities = brand => {
    const pool = getPool(brand);
    return {
      toCentral: pool.getToCentralPriceAuthority(),
      fromCentral: pool.getFromCentralPriceAuthority(),
    };
  };

  /** @param {Brand} brand */
  const getPoolMetrics = brand => getPool(brand).getMetrics();

  /**
   * @param {Brand} brandIn
   * @param {Brand} [brandOut]
   * @returns {VirtualPool}
   */
  const provideVPool = (brandIn, brandOut) => {
    if (!brandOut) {
      return getPool(brandIn).getVPool();
    }

    if (isSecondary(brandIn) && isSecondary(brandOut)) {
      return makeDoublePool(
        zcf,
        getPool(brandIn),
        getPool(brandOut),
        params.getProtocolFee,
        params.getPoolFee,
        protocolSeat,
      );
    }

    const pool = isSecondary(brandOut) ? getPool(brandOut) : getPool(brandIn);
    return pool.getVPool();
  };

  const getInputPrice = (amountIn, amountOut) => {
    const pool = provideVPool(amountIn.brand, amountOut.brand);
    return publicPrices(pool.getPriceForInput(amountIn, amountOut));
  };

  const getOutputPrice = (amountIn, amountOut) => {
    const pool = provideVPool(amountIn.brand, amountOut.brand);
    return publicPrices(pool.getPriceForOutput(amountIn, amountOut));
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
    getPoolHelper,
  );

  const makeRemoveLiquidityInvitation = makeMakeRemoveLiquidityInvitation(
    zcf,
    getPool,
  );

  const { makeCollectFeesInvitation } = makeMakeCollectFeesInvitation(
    zcf,
    protocolSeat,
    centralBrand,
    'RUN',
  );

  /** @type {GovernedPublicFacet<XYKAMMPublicFacet>} */
  const publicFacet = augmentPublicFacet(
    Far('AMM public facet', {
      addPoolInvitation,
      addIssuer,
      getPoolAllocation,
      getLiquidityIssuer,
      getLiquiditySupply,
      getInputPrice,
      getOutputPrice,
      getSecondaryIssuer,
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
      getMetrics: () => metricsSubscription,
      getPoolMetrics,
    }),
  );

  /** @type {GovernedCreatorFacet<*>} */
  const creatorFacet = makeGovernorFacet(
    Far('AMM Fee Collector facet', {
      makeCollectFeesInvitation,
      /**
       * Must be called before adding pools. Not provided at contract start time due to cyclic dependency.
       *
       * @param {AssetReservePublicFacet} facet
       */
      resolveReserveFacet: facet => {
        assert(!reserveFacet, 'reserveFacet already resolved');
        reserveFacet = facet;
      },
    }),
  );
  return harden({ publicFacet, creatorFacet });
};

harden(start);
export { start };

/**
 * @typedef {object} AMMParamGetters
 * @property {() => NatValue} getPoolFee
 * @property {() => NatValue} getProtocolFee
 * @property {() => Amount<'nat'>} getMinInitialPoolLiquidity
 * @property {() => Amount} getElectorate
 */

/**
 * @typedef { bigint } BasisPoints -- hundredths of a percent
 *
 * @typedef {GovernanceTerms<{
 *   PoolFee: 'nat',
 *   ProtocolFee: 'nat',
 *   MinInitialPoolLiquidity: 'amount',
 * }> & {
 *   brands: { Central: Brand },
 *   issuers: {},
 *   timer: TimerService,
 *   poolFeeBP: BasisPoints, // portion of the fees that go into the pool
 *   protocolFeeBP: BasisPoints, // portion of the fees that are shared with validators
 * }} AMMTerms
 */
