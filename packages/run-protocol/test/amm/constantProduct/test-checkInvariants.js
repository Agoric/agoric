// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { AmountMath } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { BASIS_POINTS } from '../../../src/vpool-xyk-amm/constantProduct/defaults.js';
import { setupMintKits } from './setupMints.js';
import {
  pricesForStatedInput,
  pricesForStatedOutput,
} from '../../../src/vpool-xyk-amm/constantProduct/calcSwapPrices.js';
import { checkKInvariantSellingX } from '../../../src/vpool-xyk-amm/constantProduct/invariants.js';
import { getXY } from '../../../src/vpool-xyk-amm/constantProduct/getXY.js';

/**
 * @typedef {Object} SwapPriceArgs
 * @property {Amount} amountGiven
 * @property {PoolAllocation} poolAllocation
 * @property {Amount} [amountWanted]
 * @property {Ratio} protocolFeeRatio
 * @property {Ratio} poolFeeRatio
 */

const prepareRUNInTest = ({
  inputReserve,
  outputReserve,
  inputValue,
  outputValue,
}) => {
  const { run, bld, runKit, bldKit } = setupMintKits();
  const amountGiven = run(inputValue || 0n);
  const poolAllocation = harden({
    Central: run(inputReserve),
    Secondary: bld(outputReserve),
  });
  const amountWanted = bld(outputValue || 0n);
  const protocolFeeRatio = makeRatio(5n, runKit.brand, BASIS_POINTS);
  const poolFeeRatio = makeRatio(25n, bldKit.brand, BASIS_POINTS);

  return harden([
    amountGiven,
    poolAllocation,
    amountWanted,
    protocolFeeRatio,
    poolFeeRatio,
  ]);
};

const prepareRUNOutTest = ({
  inputReserve,
  outputReserve,
  inputValue,
  outputValue,
}) => {
  const { run, bld, runKit, bldKit } = setupMintKits();
  const amountGiven = bld(inputValue || 0n);
  const poolAllocation = harden({
    Central: run(inputReserve),
    Secondary: bld(outputReserve),
  });
  const amountWanted = run(outputValue || 0n);
  const protocolFeeRatio = makeRatio(5n, bldKit.brand, BASIS_POINTS);
  const poolFeeRatio = makeRatio(25n, runKit.brand, BASIS_POINTS);

  return harden([
    amountGiven,
    poolAllocation,
    amountWanted,
    protocolFeeRatio,
    poolFeeRatio,
  ]);
};

function checkGetInput(t, args, result) {
  t.falsy(AmountMath.isEmpty(result.swapperGets));
  t.truthy(AmountMath.isGTE(args[0], result.swapperGives));
  t.truthy(AmountMath.isGTE(result.swapperGets, args[2]));
  t.falsy(AmountMath.isEmpty(result.poolFee));
  t.falsy(AmountMath.isEmpty(result.protocolFee));

  t.deepEqual(
    AmountMath.add(result.xIncrement, result.protocolFee),
    result.swapperGives,
  );
  t.deepEqual(result.yDecrement, result.swapperGets);

  const xyArgs = {
    amountGiven: args[0],
    poolAllocation: args[1],
    amountWanted: args[2],
  };
  const { x, y } = getXY(xyArgs);
  t.truthy(checkKInvariantSellingX(x, y, result.xIncrement, result.yDecrement));
}

function checkGetOutput(t, args, result) {
  t.falsy(AmountMath.isEmpty(result.swapperGets));
  if (!AmountMath.isEmpty(args[0])) {
    t.truthy(AmountMath.isGTE(args[0], result.swapperGives));
  }
  t.truthy(AmountMath.isGTE(result.swapperGets, args[2]));
  t.falsy(AmountMath.isEmpty(result.poolFee));
  t.falsy(AmountMath.isEmpty(result.protocolFee));

  t.deepEqual(
    AmountMath.add(result.xIncrement, result.protocolFee),
    result.swapperGives,
  );
  t.deepEqual(result.yDecrement, result.swapperGets);

  const xyArgs = {
    amountGiven: args[0],
    poolAllocation: args[1],
    amountWanted: args[2],
  };
  const { x, y } = getXY(xyArgs);
  t.truthy(checkKInvariantSellingX(x, y, result.xIncrement, result.yDecrement));
}

const testGetInputPrice = (t, inputs, runIn) => {
  const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
  // @ts-ignore typescript doesn't like param list built by destructuring
  const result = pricesForStatedInput(...args);
  checkGetInput(t, args, result);
};

const testGetInputPriceThrows = (t, inputs, message, runIn) => {
  t.throws(
    _ => {
      const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
      // @ts-ignore typescript doesn't like param list built by destructuring
      return pricesForStatedInput(...args);
    },
    {
      message,
    },
  );
};

const testGetInputPriceNoTrade = (t, inputs, runIn) => {
  const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
  // @ts-ignore typescript doesn't like param list built by destructuring
  const result = pricesForStatedInput(...args);
  t.truthy(AmountMath.isEmpty(result.swapperGets));
  t.truthy(AmountMath.isEmpty(result.swapperGives));
};

const testGetOutputPrice = (t, inputs, runIn) => {
  const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
  // @ts-ignore typescript doesn't like param list built by destructuring
  const result = pricesForStatedOutput(...args);
  checkGetOutput(t, args, result);
};

const getOutputPriceThrows = (t, inputs, message, runIn) => {
  t.throws(
    _ => {
      const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
      // @ts-ignore typescript doesn't like param list built by destructuring
      return pricesForStatedOutput(...args);
    },
    {
      message,
    },
  );
};

const testGetOutputPriceNoTrade = (t, inputs, runIn) => {
  const args = runIn ? prepareRUNInTest(inputs) : prepareRUNOutTest(inputs);
  // @ts-ignore typescript doesn't like param list built by destructuring
  const result = pricesForStatedOutput(...args);
  t.truthy(AmountMath.isEmpty(result.swapperGets));
  t.truthy(AmountMath.isEmpty(result.swapperGives));
};

test('getInputPrice no reserves', t => {
  const input = {
    inputReserve: 0n,
    outputReserve: 0n,
    inputValue: 1n,
  };
  const message =
    '"poolAllocation.Central" must be greater than 0: {"brand":"[Alleged: RUN brand]","value":"[0n]"}';
  testGetInputPriceThrows(t, input, message, true);
  testGetInputPriceThrows(t, input, message, false);
});

test('getInputPrice ok 2', t => {
  const input = {
    inputReserve: 5984n,
    outputReserve: 3028n,
    inputValue: 1398n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice ok 2w/output', t => {
  const input = {
    inputReserve: 5984n,
    outputReserve: 3028n,
    inputValue: 1398n,
    outputValue: 572n,
  };
  testGetInputPriceNoTrade(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice outLimit', t => {
  const input = {
    inputReserve: 9348n,
    outputReserve: 2983n,
    inputValue: 828n,
    outputValue: 350n,
  };
  testGetInputPriceNoTrade(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice ok 3', t => {
  const input = {
    inputReserve: 8160n,
    outputReserve: 7743n,
    inputValue: 6635n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice ok 4', t => {
  const input = {
    inputReserve: 10n,
    outputReserve: 10n,
    inputValue: 1000n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice ok 5', t => {
  const input = {
    inputReserve: 100n,
    outputReserve: 50n,
    inputValue: 17n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice zero outputValue', t => {
  const input = {
    inputReserve: 100n,
    outputReserve: 50n,
    inputValue: 17n,
    outputValue: 0n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice ok 6', t => {
  const input = {
    inputReserve: 43n,
    outputReserve: 117n,
    inputValue: 7n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice negative', t => {
  const input = {
    inputReserve: 43n,
    outputReserve: 117n,
    inputValue: -7n,
  };
  const message = 'value "[-7n]" must be a natural number';
  testGetInputPriceThrows(t, input, message, true);
  testGetInputPriceThrows(t, input, message, false);
});

test('getInputPrice bad reserve 1', t => {
  const input = {
    inputReserve: 43n,
    outputReserve: 0n,
    inputValue: 347n,
  };
  const message =
    '"poolAllocation.Secondary" must be greater than 0: {"brand":"[Alleged: BLD brand]","value":"[0n]"}';
  testGetInputPriceThrows(t, input, message, true);
  testGetInputPriceThrows(t, input, message, false);
});

test('getInputPrice bad reserve 2', t => {
  const input = {
    inputReserve: 0n,
    outputReserve: 50n,
    inputValue: 828n,
  };
  const message =
    '"poolAllocation.Central" must be greater than 0: {"brand":"[Alleged: RUN brand]","value":"[0n]"}';
  testGetInputPriceThrows(t, input, message, true);
  testGetInputPriceThrows(t, input, message, false);
});

test('getInputPrice zero input', t => {
  const input = {
    inputReserve: 320n,
    outputReserve: 50n,
    inputValue: 0n,
    outputValue: 0n,
  };
  testGetInputPriceNoTrade(t, input, true);
  testGetInputPriceNoTrade(t, input, false);
});

test('getOutputPrice zero output', t => {
  const input = {
    inputReserve: 320n,
    outputReserve: 50n,
    inputValue: 0n,
    outputValue: 0n,
  };
  testGetOutputPriceNoTrade(t, input, true);
  testGetOutputPriceNoTrade(t, input, false);
});

test('getInputPrice big product', t => {
  const input = {
    inputReserve: 100_000_000n,
    outputReserve: 100_000_000n,
    inputValue: 1000n,
    outputValue: 50n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getInputPrice README example', t => {
  const input = {
    inputReserve: 40_000_000n,
    outputReserve: 3_000_000n,
    inputValue: 30_000n,
    outputValue: 2000n,
  };
  testGetInputPrice(t, input, true);
  testGetInputPrice(t, input, false);
});

test('getOutputPrice ok', t => {
  const input = {
    inputReserve: 43n,
    outputReserve: 117n,
    outputValue: 37n,
  };
  testGetOutputPrice(t, input, true);
  testGetOutputPrice(t, input, false);
});

test('getOutputPrice zero output reserve', t => {
  const input = {
    inputReserve: 43n,
    outputReserve: 0n,
    outputValue: 37n,
  };
  const message =
    '"poolAllocation.Secondary" must be greater than 0: {"brand":"[Alleged: BLD brand]","value":"[0n]"}';
  getOutputPriceThrows(t, input, message, true);
  getOutputPriceThrows(t, input, message, false);
});

test('getOutputPrice zero input reserve', t => {
  const input = {
    inputReserve: 0n,
    outputReserve: 92n,
    outputValue: 37n,
  };
  const message =
    '"poolAllocation.Central" must be greater than 0: {"brand":"[Alleged: RUN brand]","value":"[0n]"}';
  getOutputPriceThrows(t, input, message, true);
  getOutputPriceThrows(t, input, message, false);
});

test('getOutputPrice too much output', t => {
  const input = {
    inputReserve: 1132n,
    outputReserve: 1024n,
    outputValue: 20923n,
  };
  testGetOutputPriceNoTrade(t, input, true);
  testGetOutputPriceNoTrade(t, input, false);
});

test('getOutputPrice too much output 2', t => {
  const input = {
    inputReserve: 1132n,
    outputReserve: 345n,
    outputValue: 345n,
  };
  testGetOutputPriceNoTrade(t, input, true);
  testGetOutputPrice(t, input, false);
});

test('getOutputPrice zero inputValue', t => {
  const input = {
    inputReserve: 1132n,
    outputReserve: 3145n,
    inputValue: 0n,
    outputValue: 345n,
  };
  testGetOutputPrice(t, input, true);
  testGetOutputPrice(t, input, false);
});

test('getOutputPrice big product', t => {
  const input = {
    inputReserve: 100_000_000n,
    outputReserve: 100_000_000n,
    outputValue: 1000n,
  };
  testGetOutputPrice(t, input, true);
  testGetOutputPrice(t, input, false);
});

test('getOutputPrice minimum price', t => {
  const input = {
    inputReserve: 1n,
    outputReserve: 10n,
    outputValue: 1n,
  };
  testGetOutputPrice(t, input, true);
  testGetOutputPriceNoTrade(t, input, false);
});

test('getOutputPrice large values, in/out', t => {
  const input = {
    inputReserve: 1_192_432n,
    outputReserve: 3_298_045n,
    inputValue: 13_435n,
    outputValue: 3_435n,
  };
  testGetOutputPrice(t, input, true);
  testGetOutputPrice(t, input, false);
});
