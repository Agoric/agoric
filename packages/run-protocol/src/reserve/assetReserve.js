// @ts-check

import { E, Far } from '@endo/far';
import { makeStore } from '@agoric/store';
import { AmountMath } from '@agoric/ertp';
import { handleParamGovernance, ParamTypes } from '@agoric/governance';
import { offerTo } from '@agoric/zoe/src/contractSupport/index.js';
import { makeSubscriptionKit } from '@agoric/notifier';

import { AMM_INSTANCE } from './params.js';
import { makeTracer } from '../makeTracer.js';

const trace = makeTracer('Reserve', true);

const makeLiquidityKeyword = keyword => `${keyword}Liquidity`;

const RunKW = 'RUN';

/**
 * Asset Reserve holds onto assets for the RUN protocol, and can
 * dispense it for various purposes under governance control. It currently
 * supports governance decisions to add liquidity to an AMM pool.
 *
 * This contract has the ability to mint RUN. When adding liquidity to an AMM
 * pool, it takes a specified amount of collateral on hand, and mints new RUN to
 * accompany it, and deposits both into an AMM pool, using the AMM's method that
 * allows the pool balance to be determined based on the contributed funds.
 *
 * @param {ZCF<GovernanceTerms<{AmmInstance: 'instance'}> &
 * {
 *   governedApis: ['addLiquidityToAmmPool'],
 * }
 * >} zcf
 * @param {{feeMintAccess: FeeMintAccess, initialPoserInvitation: Payment}} privateArgs
 */
const start = async (zcf, privateArgs) => {
  /**
   * Used to look up the unique keyword for each brand, including RUN.
   *
   * @type {MapStore<Brand, Keyword>}
   */
  const keywordForBrand = makeStore('keywords');
  /**
   * Used to look up the brands for keywords, excluding RUN because it's a special case.
   *
   * @type {MapStore<Keyword, [brand: Brand, liquidityBrand: Brand]>}
   */
  const brandForKeyword = makeStore('brands');

  const { augmentPublicFacet, makeGovernorFacet, params } =
    await handleParamGovernance(zcf, privateArgs.initialPoserInvitation, {
      [AMM_INSTANCE]: ParamTypes.INSTANCE,
    });

  /** @type {Promise<XYKAMMPublicFacet>} */
  const ammPublicFacet = E(zcf.getZoeService()).getPublicFacet(
    params.getAmmInstance(),
  );

  /** @type {ZCFMint} */
  const runMint = await zcf.registerFeeMint(RunKW, privateArgs.feeMintAccess);
  const runKit = runMint.getIssuerRecord();
  keywordForBrand.init(runKit.brand, RunKW);
  // no need to saveIssuer() b/c registerFeeMint does it

  /**
   * @param {Issuer} issuer
   * @param {string} keyword
   */
  const addIssuer = async (issuer, keyword) => {
    const brand = await E(issuer).getBrand();
    assert(
      keyword !== RunKW && brand !== runKit.brand,
      `${RunKW} is a special case handled by the reserve contract`,
    );

    const liquidityIssuer = E(ammPublicFacet).getLiquidityIssuer(brand);
    const liquidityBrand = await E(liquidityIssuer).getBrand();

    brandForKeyword.init(keyword, [brand, liquidityBrand]);
    keywordForBrand.init(brand, keyword);
    return Promise.all([
      zcf.saveIssuer(issuer, keyword),
      zcf.saveIssuer(liquidityIssuer, makeLiquidityKeyword(keyword)),
    ]);
  };

  const getKeywordForBrand = brand => {
    assert(
      keywordForBrand.has(brand),
      `Issuer not defined for brand ${brand}; first call addIssuer()`,
    );
    return keywordForBrand.get(brand);
  };

  // We keep the associated liquidity tokens in the same seat
  const { zcfSeat: collateralSeat } = zcf.makeEmptySeatKit();
  const getAllocations = () => {
    return collateralSeat.getCurrentAllocation();
  };

  // Anyone can deposit collateral to the reserve.
  const addCollateralHook = async seat => {
    const {
      give: { Collateral: amountIn },
    } = seat.getProposal();

    const collateralKeyword = getKeywordForBrand(amountIn.brand);
    seat.decrementBy(harden({ Collateral: amountIn }));
    collateralSeat.incrementBy(harden({ [collateralKeyword]: amountIn }));

    zcf.reallocate(collateralSeat, seat);
    seat.exit();

    trace('received collateral', amountIn);
    return 'added Collateral to the Reserve';
  };

  const makeAddCollateralInvitation = () =>
    zcf.makeInvitation(addCollateralHook, 'Add Collateral');

  const { brand: runBrand } = await E(runMint).getIssuerRecord();
  const { publication: metricsPublication, subscription: metricsSubscription } =
    makeSubscriptionKit();

  // shortfall in Vaults due to liquidations less than debt. This value can be
  // reduced by various actions which burn IST.
  let vaultShortfall = AmountMath.makeEmpty(runBrand);

  const updateMetrics = () => {
    const metrics = harden({
      allocations: getAllocations(),
      shortfall: vaultShortfall,
    });
    metricsPublication.updateState(metrics);
  };
  updateMetrics();

  const addLiquidationShortfall = shortfall => {
    vaultShortfall = AmountMath.add(vaultShortfall, shortfall);
    updateMetrics();
  };
  // TODO(#5299): add something that calls this
  // eslint-disable-next-line no-unused-vars
  const reduceLiquidationShortfall = reduction => {
    if (AmountMath.isGTE(reduction, vaultShortfall)) {
      vaultShortfall = AmountMath.makeEmptyFromAmount(vaultShortfall);
    } else {
      vaultShortfall = AmountMath.subtract(vaultShortfall, reduction);
    }
    updateMetrics();
  };

  // Takes collateral from the reserve, mints RUN to accompany it, and uses both
  // to add Liquidity to a pool in the AMM.
  const addLiquidityToAmmPool = async (collateralAmount, runAmount) => {
    // verify we have the funds
    const collateralKeyword = getKeywordForBrand(collateralAmount.brand);
    if (
      !AmountMath.isGTE(
        collateralSeat.getCurrentAllocation()[collateralKeyword],
        collateralAmount,
      )
    ) {
      throw new Error('insufficient reserves for that transaction');
    }

    // create the RUN
    const offerToSeat = runMint.mintGains(harden({ RUN: runAmount }));
    offerToSeat.incrementBy(
      collateralSeat.decrementBy(
        harden({
          [collateralKeyword]: collateralAmount,
        }),
      ),
    );
    zcf.reallocate(collateralSeat, offerToSeat);

    // Add RUN and collateral to the AMM
    const invitation = await E(
      ammPublicFacet,
    ).makeAddLiquidityAtRateInvitation();
    const mapping = harden({
      RUN: 'Central',
      [collateralKeyword]: 'Secondary',
    });

    const [_, liqBrand] = brandForKeyword.get(collateralKeyword);
    const proposal = harden({
      give: {
        Central: runAmount,
        Secondary: collateralAmount,
      },
      want: { Liquidity: AmountMath.makeEmpty(liqBrand) },
    });

    // chain await the completion of both the offer and the `deposited` promise
    await E.get(offerTo(zcf, invitation, mapping, proposal, offerToSeat))
      .deposited;

    // transfer from userSeat to LiquidityToken holdings
    const liquidityAmount = offerToSeat.getCurrentAllocation();
    const liquidityKeyword = makeLiquidityKeyword(collateralKeyword);

    offerToSeat.decrementBy(
      harden({
        Liquidity: liquidityAmount.Liquidity,
      }),
    );
    collateralSeat.incrementBy(
      harden({
        [liquidityKeyword]: liquidityAmount.Liquidity,
      }),
    );
    zcf.reallocate(offerToSeat, collateralSeat);
  };

  const getShortfallReportInvitation = () => {
    const shortfallReportOffer = () => {
      return Far('shortfallReporter', {
        addLiquidationShortfall,
        // currently exposed for testing. Maybe it only gets called internally?
        reduceLiquidationShortfall,
      });
    };

    return zcf.makeInvitation(
      shortfallReportOffer,
      'getFacetForReportingShortfalls',
    );
  };

  const creatorFacet = makeGovernorFacet(
    {
      makeAddCollateralInvitation,
      // add makeRedeemLiquidityTokensInvitation later. For now just store them
      getAllocations,
      addIssuer,
      getShortfallReportInvitation,
      getMetrics: () => metricsSubscription,
    },
    { addLiquidityToAmmPool },
  );

  const publicFacet = augmentPublicFacet(
    Far('Collateral Reserve public', {
      makeAddCollateralInvitation,
    }),
  );

  return harden({ creatorFacet, publicFacet });
};

harden(start);

export { start };

/**
 * @typedef {object} ShortfallReporter
 * @property {(shortfall: Amount) => void} addLiquidationShortfall
 */

/** @typedef {Awaited<ReturnType<typeof start>>['publicFacet']} AssetReservePublicFacet */
/** @typedef {Awaited<ReturnType<typeof start>>['creatorFacet']} AssetReserveCreatorFacet */
