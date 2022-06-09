// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { Far } from '@endo/marshal';
import { makeScalarMap } from '@agoric/store';

import { charge, makeEstimator } from '../../../src/vpool-xyk-amm/estimate.js';
import { withAmountUtils } from '../../supports.js';
import {
  pricesForStatedInput,
  pricesForStatedOutput,
} from '../../../src/vpool-xyk-amm/constantProduct/calcSwapPrices.js';
import { BASIS_POINTS } from '../../../src/vpool-xyk-amm/constantProduct/defaults.js';

const Million = 1000_000n;
const DEFAULT_2_POOLS = [
  [Million, Million],
  [Million, Million],
];
const DEFAULT_3_POOLS = [
  [Million, Million],
  [Million, Million],
  [Million, Million],
];

const makePools = (issuerKits, poolValues) => {
  const centralBrand = issuerKits[0].brand;
  const pools = makeScalarMap('poolBrand');
  for (let i = 1; i < issuerKits.length; i += 1) {
    const brand = issuerKits[i].brand;
    const pool = Far(`pool ${brand.getAllegedName()}`, {
      getCentralAmount: () => AmountMath.make(centralBrand, poolValues[i][0]),
      getSecondaryAmount: () => AmountMath.make(brand, poolValues[i][1]),
    });
    pools.init(brand, pool);
  }
  return pools;
};

const getInputPrices = (centralBrand, amountGiven, brandOut, pools, fees) => {
  const pool =
    brandOut === centralBrand
      ? pools.get(amountGiven.brand)
      : pools.get(brandOut);
  const poolAllocation = {
    Central: pool.getCentralAmount(),
    Secondary: pool.getSecondaryAmount(),
  };
  return pricesForStatedInput(
    amountGiven,
    poolAllocation,
    AmountMath.makeEmpty(brandOut),
    makeRatio(fees.protocolFeeBP, centralBrand, BASIS_POINTS),
    makeRatio(fees.poolFeeBP, poolAllocation.Secondary.brand, BASIS_POINTS),
  );
};

const getOutputPrices = (centralBrand, brandIn, amountWanted, pools, fees) => {
  const pool =
    brandIn === centralBrand
      ? pools.get(amountWanted.brand)
      : pools.get(brandIn);
  const poolAllocation = {
    Central: pool.getCentralAmount(),
    Secondary: pool.getSecondaryAmount(),
  };

  return pricesForStatedOutput(
    AmountMath.makeEmpty(brandIn),
    poolAllocation,
    amountWanted,
    makeRatio(fees.protocolFeeBP, centralBrand, BASIS_POINTS),
    makeRatio(fees.poolFeeBP, poolAllocation.Secondary.brand, BASIS_POINTS),
  );
};

function buildRates(protocolFeeBP, poolFeeBP, slippageBP) {
  return { protocolFeeBP, poolFeeBP, slippageBP };
}

test('estimate simple swapIn toCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_2_POOLS);
  const rates = buildRates(30n, 20n, 200n);

  const amountGiven = edge.make(1000n);
  const brandOut = central.brand;
  const expected = getInputPrices(
    central.brand,
    amountGiven,
    brandOut,
    pools,
    rates,
  );

  const estimator = makeEstimator(brandOut, rates);
  t.deepEqual(
    estimator.estimateProceeds(amountGiven, brandOut, pools),
    AmountMath.subtract(
      expected.swapperGets,
      charge(rates.slippageBP, expected.swapperGets),
    ),
  );
});

test('estimate simple swapIn fromCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_2_POOLS);
  const rates = buildRates(30n, 20n, 200n);

  const amountGiven = central.make(1000n);
  const brandOut = edge.brand;
  const expected = getInputPrices(
    central.brand,
    amountGiven,
    brandOut,
    pools,
    rates,
  );

  const estimator = makeEstimator(amountGiven.brand, rates);
  t.deepEqual(
    estimator.estimateProceeds(amountGiven, brandOut, pools),
    AmountMath.subtract(
      expected.swapperGets,
      charge(rates.slippageBP, expected.swapperGets),
    ),
  );
});

test('estimate simple swapOut fromCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(30n, 20n, 200n);

  const brandIn = central.brand;
  const amountWanted = edge.make(1000n);

  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate simple swapOut toCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(30n, 20n, 200n);

  const brandIn = edge.brand;
  const amountWanted = central.make(1000n);

  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high ProtocolFee fromCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(3000n, 20n, 200n);

  const brandIn = central.brand;
  const amountWanted = edge.make(1000n);

  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high ProtocolFee toCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(3000n, 20n, 200n);

  const brandIn = edge.brand;
  const amountWanted = central.make(1000n);

  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high poolFee fromCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(300n, 2000n, 200n);

  const brandIn = central.brand;
  const amountWanted = edge.make(1000n);
  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high poolFee toCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(300n, 2000n, 200n);

  const brandIn = edge.brand;
  const amountWanted = central.make(1000n);
  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high slippage fromCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(30n, 20n, 500n);

  const brandIn = central.brand;
  const amountWanted = edge.make(1000n);
  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});

test('estimate swapOut high slippage toCentral', t => {
  const central = withAmountUtils(makeIssuerKit('central'));
  const edge = withAmountUtils(makeIssuerKit('edge'));
  const pools = makePools([central, edge], DEFAULT_3_POOLS);
  const rates = buildRates(30n, 20n, 500n);

  const brandIn = edge.brand;
  const amountWanted = central.make(1000n);
  const expected = getOutputPrices(
    central.brand,
    brandIn,
    amountWanted,
    pools,
    rates,
  );

  const estimator = makeEstimator(central.brand, rates);
  t.deepEqual(
    estimator.estimateRequired(brandIn, amountWanted, pools),
    AmountMath.add(
      expected.swapperGives,
      charge(rates.slippageBP, expected.swapperGives),
    ),
  );
});
