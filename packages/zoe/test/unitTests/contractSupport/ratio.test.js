import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import {
  makeRatio,
  makeRatioFromAmounts,
  floorMultiplyBy,
  floorDivideBy,
  ceilMultiplyBy,
  ceilDivideBy,
  invertRatio,
  oneMinus,
  multiplyRatios,
  addRatios,
  quantize,
  multiplyBy,
  subtractRatios,
  parseRatio,
  divideBy,
} from '../../../src/contractSupport/ratio.js';

/**
 * @param {*} t
 * @param {Amount<'nat'>} a1
 * @param {Amount<'nat'>} a2
 * @param {Brand} brand
 */
function amountsEqual(t, a1, a2, brand) {
  const brandEqual = a1.brand === a2.brand;
  const valueEqual = a1.value === a2.value;
  const correctBrand = a1.brand === brand;
  if (brandEqual && valueEqual && correctBrand) {
    t.truthy(brandEqual);
  } else if (brandEqual && correctBrand) {
    t.fail(`expected equal values: ${a1.value} !== ${a2.value}`);
  } else if (valueEqual) {
    t.fail(`Expected brand ${brand}, but got ${a1.brand} and ${a2.brand}`);
  } else if (!brandEqual && !valueEqual && !correctBrand) {
    t.fail(`nothing matches ${a1}, ${a2}, ${brand}`);
  } else {
    t.fail(
      `neither values: (${a1.value}, ${a2.value}) nor brands matched (${brand} expected) ${a1.brand}, ${a2.brand})`,
    );
  }
}

test('ratio - basic (floor)', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const halfDefault = makeRatio(50n, brand);
  const halfPrecise = makeRatio(5000n, brand, 10000n);

  amountsEqual(t, floorMultiplyBy(moe(1333n), halfDefault), moe(666n), brand);
  amountsEqual(
    t,
    floorMultiplyBy(moe(13333333n), halfDefault),
    moe(6666666n),
    brand,
  );
  amountsEqual(t, floorMultiplyBy(moe(1333n), halfPrecise), moe(666n), brand);
  amountsEqual(
    t,
    floorMultiplyBy(moe(13333333n), halfPrecise),
    moe(6666666n),
    brand,
  );
  amountsEqual(t, floorMultiplyBy(moe(0n), halfPrecise), moe(0n), brand);
});

test('ratio - basic (ceil)', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const halfDefault = makeRatio(50n, brand);
  const halfPrecise = makeRatio(5000n, brand, 10000n);

  amountsEqual(t, ceilMultiplyBy(moe(1333n), halfDefault), moe(667n), brand);
  amountsEqual(
    t,
    ceilMultiplyBy(moe(13333333n), halfDefault),
    moe(6666667n),
    brand,
  );
  amountsEqual(t, ceilMultiplyBy(moe(1333n), halfPrecise), moe(667n), brand);
  amountsEqual(
    t,
    ceilMultiplyBy(moe(13333333n), halfPrecise),
    moe(6666667n),
    brand,
  );
  amountsEqual(t, ceilMultiplyBy(moe(0n), halfPrecise), moe(0n), brand);
});

test('ratio - multiplyBy non Amount', t => {
  const { brand } = makeIssuerKit('moe');

  const badAmount = harden({
    value: 3.5,
    brand,
  });
  // @ts-expect-error Incorrect values for testing
  t.throws(() => floorMultiplyBy(badAmount, makeRatio(25n, brand)), {
    message: 'value 3.5 must be an AmountValue, not "number"',
  });
  // @ts-expect-error Incorrect values for testing
  t.throws(() => ceilMultiplyBy(badAmount, makeRatio(25n, brand)), {
    message: 'value 3.5 must be an AmountValue, not "number"',
  });
  // @ts-expect-error Incorrect values for testing
  t.throws(() => floorDivideBy(badAmount, makeRatio(25n, brand)), {
    message: 'value 3.5 must be an AmountValue, not "number"',
  });
  // @ts-expect-error Incorrect values for testing
  t.throws(() => ceilDivideBy(badAmount, makeRatio(25n, brand)), {
    message: 'value 3.5 must be an AmountValue, not "number"',
  });
});

test('ratio - onethird', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const oneThird = makeRatioFromAmounts(moe(1n), moe(3n));

  amountsEqual(t, floorMultiplyBy(moe(100000n), oneThird), moe(33333n), brand);
  amountsEqual(t, ceilMultiplyBy(moe(100000n), oneThird), moe(33334n), brand);
});

test('ratio - different brands', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);
  const { brand: astBrand } = makeIssuerKit('ast');
  /** @param {bigint} value */
  const ast = value => AmountMath.make(astBrand, value);

  const convertToMoe = makeRatioFromAmounts(
    moe(1n),
    AmountMath.make(astBrand, 3n),
  );
  amountsEqual(
    t,
    floorMultiplyBy(ast(10000n), convertToMoe),
    moe(3333n),
    brand,
  );
  amountsEqual(t, ceilMultiplyBy(ast(10000n), convertToMoe), moe(3334n), brand);
});

test('ratio - brand mismatch & details', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);
  const { brand: astBrand } = makeIssuerKit('ast');
  /** @param {bigint} value */
  const ast = value => AmountMath.make(astBrand, value);

  const convertToMoe = makeRatioFromAmounts(
    moe(1n),
    AmountMath.make(astBrand, 3n),
  );
  t.throws(() => floorDivideBy(ast(10000n), convertToMoe), {
    message: `amount's brand "[Alleged: ast brand]" must match ratio's numerator "[Alleged: moe brand]"`,
  });
  t.throws(() => ceilDivideBy(ast(10000n), convertToMoe), {
    message: `amount's brand "[Alleged: ast brand]" must match ratio's numerator "[Alleged: moe brand]"`,
  });
  t.throws(() => floorMultiplyBy(moe(10000n), convertToMoe), {
    message: `amount's brand "[Alleged: moe brand]" must match ratio's denominator "[Alleged: ast brand]"`,
  });
  t.throws(() => ceilMultiplyBy(moe(10000n), convertToMoe), {
    message: `amount's brand "[Alleged: moe brand]" must match ratio's denominator "[Alleged: ast brand]"`,
  });
});

test('ratio - larger than 100%', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const fiveThirds = makeRatioFromAmounts(moe(5n), moe(3n));

  // 5/3 * 7777
  amountsEqual(t, floorMultiplyBy(moe(7777n), fiveThirds), moe(12961n), brand);
  amountsEqual(t, ceilMultiplyBy(moe(7777n), fiveThirds), moe(12962n), brand);
});

test('ratio - Nats', t => {
  const { brand } = makeIssuerKit('moe');

  // @ts-expect-error invalid arguments for testing
  t.throws(() => makeRatio(10.1, brand), {
    message: 'value 10.1 must be an AmountValue, not "number"',
  });
});

test('ratio division', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const twoFifths = makeRatioFromAmounts(moe(2n), moe(5n));
  amountsEqual(t, floorDivideBy(moe(100n), twoFifths), moe(250n), brand);
  amountsEqual(t, ceilDivideBy(moe(100n), twoFifths), moe(250n), brand);
  amountsEqual(t, floorMultiplyBy(moe(100n), twoFifths), moe(40n), brand);
  amountsEqual(t, ceilMultiplyBy(moe(100n), twoFifths), moe(40n), brand);
  amountsEqual(t, floorDivideBy(moe(0n), twoFifths), moe(0n), brand);
  amountsEqual(t, ceilDivideBy(moe(0n), twoFifths), moe(0n), brand);
});

test('ratio inverse', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);

  const twoFifths = makeRatioFromAmounts(moe(2n), moe(5n));
  const fiveHalves = invertRatio(twoFifths);

  amountsEqual(t, floorDivideBy(moe(100n), fiveHalves), moe(40n), brand);
  amountsEqual(t, ceilDivideBy(moe(100n), fiveHalves), moe(40n), brand);
  amountsEqual(t, floorMultiplyBy(moe(100n), fiveHalves), moe(250n), brand);
  amountsEqual(t, ceilMultiplyBy(moe(100n), fiveHalves), moe(250n), brand);
});

test('ratio bad inputs', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);
  // @ts-expect-error invalid arguments for testing
  t.throws(() => makeRatio(-3, brand), {
    message: 'value -3 must be an AmountValue, not "number"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => makeRatio(3n, brand, 100.5), {
    message: 'value 100.5 must be an AmountValue, not "number"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => makeRatioFromAmounts(3n, moe(30n)), {
    message: '"brand" "[undefined]" must be a remotable, not "undefined"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => floorMultiplyBy(37, makeRatioFromAmounts(moe(3n), moe(5n))), {
    message: '"brand" "[undefined]" must be a remotable, not "undefined"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => ceilMultiplyBy(37, makeRatioFromAmounts(moe(3n), moe(5n))), {
    message: '"brand" "[undefined]" must be a remotable, not "undefined"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => floorDivideBy(makeRatioFromAmounts(moe(3n), moe(5n)), 37), {
    message: '"brand" "[undefined]" must be a remotable, not "undefined"',
  });
  // @ts-expect-error invalid arguments for testing
  t.throws(() => ceilDivideBy(makeRatioFromAmounts(moe(3n), moe(5n)), 37), {
    message: '"brand" "[undefined]" must be a remotable, not "undefined"',
  });
  t.throws(() => makeRatio(3n, brand, 0n), {
    message: /No infinite ratios! Denominator was 0/,
  });
  t.throws(() => makeRatioFromAmounts(moe(37n), moe(0n)), {
    message: /No infinite ratios! Denominator was 0/,
  });
  t.throws(() => makeRatioFromAmounts(moe(37n), moe(0n)), {
    message: /No infinite ratios! Denominator was 0/,
  });
});

test('ratio bad inputs w/brand names', t => {
  const { brand } = makeIssuerKit('moe');
  /** @param {bigint} value */
  const moe = value => AmountMath.make(brand, value);
  t.throws(() => makeRatio(3n, brand, 0n), {
    message: 'No infinite ratios! Denominator was 0 "[Alleged: moe brand]"',
  });
  t.throws(() => makeRatioFromAmounts(moe(37n), moe(0n)), {
    message: 'No infinite ratios! Denominator was 0 "[Alleged: moe brand]"',
  });
  t.throws(() => makeRatioFromAmounts(moe(37n), moe(0n)), {
    message: 'No infinite ratios! Denominator was 0 "[Alleged: moe brand]"',
  });
});

test('multiply ratios', t => {
  const { brand: moeBrand } = makeIssuerKit('moe');

  /** @param {bigint} value */
  const moe = value => AmountMath.make(moeBrand, value);

  const twoFifthsMM = makeRatioFromAmounts(moe(2n), moe(5n));
  const fiveSixthsMM = makeRatioFromAmounts(moe(5n), moe(6n));
  t.deepEqual(
    makeRatio(10n, moeBrand, 30n, moeBrand),
    multiplyRatios(fiveSixthsMM, twoFifthsMM),
  );

  const { brand: larryBrand } = makeIssuerKit('larry');

  /** @param {bigint} value */
  const larry = value => AmountMath.make(larryBrand, value);

  const twoFifthsML = makeRatioFromAmounts(moe(2n), larry(5n));
  const fiveSixthsML = makeRatioFromAmounts(moe(5n), larry(6n));

  const twoFifthsLM = makeRatioFromAmounts(larry(2n), moe(5n));
  const fiveSixthsLM = makeRatioFromAmounts(larry(5n), moe(6n));

  const twoFifthsLL = makeRatioFromAmounts(larry(2n), larry(5n));
  const fiveSixthsLL = makeRatioFromAmounts(larry(5n), larry(6n));

  t.deepEqual(
    makeRatio(10n, moeBrand, 30n, moeBrand),
    multiplyRatios(fiveSixthsML, twoFifthsLM),
  );
  t.deepEqual(
    makeRatio(10n, larryBrand, 30n, larryBrand),
    multiplyRatios(fiveSixthsLM, twoFifthsML),
  );
  t.deepEqual(
    makeRatio(10n, moeBrand, 30n, moeBrand),
    multiplyRatios(fiveSixthsMM, twoFifthsLL),
  );
  t.deepEqual(
    makeRatio(10n, larryBrand, 30n, larryBrand),
    multiplyRatios(fiveSixthsLL, twoFifthsMM),
  );

  t.deepEqual(
    makeRatio(10n, moeBrand, 30n, larryBrand),
    multiplyRatios(fiveSixthsML, twoFifthsMM),
  );
  t.deepEqual(
    makeRatio(10n, moeBrand, 30n, larryBrand),
    multiplyRatios(fiveSixthsML, twoFifthsLL),
  );
  t.deepEqual(
    makeRatio(10n, larryBrand, 30n, moeBrand),
    multiplyRatios(fiveSixthsLM, twoFifthsLL),
  );
  t.deepEqual(
    makeRatio(10n, larryBrand, 30n, moeBrand),
    multiplyRatios(fiveSixthsLM, twoFifthsMM),
  );

  t.throws(() => multiplyRatios(fiveSixthsML, twoFifthsML), {
    message: /must cancel out/,
  });
  t.throws(() => multiplyRatios(fiveSixthsLM, twoFifthsLM), {
    message: /must cancel out/,
  });
});

test('add ratios', t => {
  const { brand: moeBrand } = makeIssuerKit('moe');

  /** @param {bigint} value */
  const moe = value => AmountMath.make(moeBrand, value);

  const twoFifthsMM = makeRatioFromAmounts(moe(2n), moe(5n));
  const fiveSixthsMM = makeRatioFromAmounts(moe(5n), moe(6n));
  t.deepEqual(
    makeRatio(37n, moeBrand, 30n, moeBrand),
    addRatios(fiveSixthsMM, twoFifthsMM),
  );

  const { brand: larryBrand } = makeIssuerKit('larry');

  /** @param {bigint} value */
  const larry = value => AmountMath.make(larryBrand, value);

  const twoFifthsLL = makeRatioFromAmounts(larry(2n), larry(5n));
  const fiveSixthsLL = makeRatioFromAmounts(larry(5n), larry(6n));
  t.deepEqual(
    makeRatio(37n, larryBrand, 30n, larryBrand),
    addRatios(fiveSixthsLL, twoFifthsLL),
  );

  const twoFifthsLM = makeRatioFromAmounts(larry(2n), moe(5n));
  const fiveSixthsLM = makeRatioFromAmounts(larry(5n), moe(6n));
  t.deepEqual(
    makeRatio(37n, larryBrand, 30n, moeBrand),
    addRatios(fiveSixthsLM, twoFifthsLM),
  );

  t.throws(() => addRatios(fiveSixthsMM, twoFifthsLL), {
    message: /numerator brands must match/,
  });
  t.throws(() => addRatios(fiveSixthsLM, twoFifthsLL), {
    message: /denominator brands must match/,
  });
});

test('subtract ratios', t => {
  const { brand: moeBrand } = makeIssuerKit('moe');

  /** @param {bigint} value */
  const moe = value => AmountMath.make(moeBrand, value);

  const twoFifthsMM = makeRatioFromAmounts(moe(2n), moe(5n));
  const fiveSixthsMM = makeRatioFromAmounts(moe(5n), moe(6n));
  t.deepEqual(
    makeRatio(13n, moeBrand, 30n, moeBrand),
    subtractRatios(fiveSixthsMM, twoFifthsMM),
  );

  const { brand: larryBrand } = makeIssuerKit('larry');

  /** @param {bigint} value */
  const larry = value => AmountMath.make(larryBrand, value);

  const twoFifthsLL = makeRatioFromAmounts(larry(2n), larry(5n));
  const fiveSixthsLL = makeRatioFromAmounts(larry(5n), larry(6n));
  t.deepEqual(
    makeRatio(13n, larryBrand, 30n, larryBrand),
    subtractRatios(fiveSixthsLL, twoFifthsLL),
  );

  const twoFifthsLM = makeRatioFromAmounts(larry(2n), moe(5n));
  const fiveSixthsLM = makeRatioFromAmounts(larry(5n), moe(6n));
  t.deepEqual(
    makeRatio(13n, larryBrand, 30n, moeBrand),
    subtractRatios(fiveSixthsLM, twoFifthsLM),
  );

  t.throws(() => subtractRatios(fiveSixthsMM, twoFifthsLL), {
    message: /numerator brands must match/,
  });
  t.throws(() => subtractRatios(fiveSixthsLM, twoFifthsLL), {
    message: /denominator brands must match/,
  });
});

test('ratio - rounding', t => {
  const { brand } = makeIssuerKit('moe');
  const moe = value => AmountMath.make(brand, value);

  /**
   * @param {bigint} numerator
   * @param {bigint} divisor
   * @param {bigint} expected
   * @param {*} method
   */
  const assertRounding = (numerator, divisor, expected, method) => {
    const ratio = makeRatioFromAmounts(moe(1n), moe(divisor));
    amountsEqual(t, method(moe(numerator), ratio), moe(expected), brand);
  };

  // from table in https://en.wikipedia.org/wiki/IEEE_754#Rounding_rules
  assertRounding(23n, 2n, 11n, floorMultiplyBy);
  assertRounding(23n, 2n, 12n, multiplyBy);
  assertRounding(23n, 2n, 12n, ceilMultiplyBy);
  assertRounding(25n, 2n, 12n, floorMultiplyBy);
  assertRounding(25n, 2n, 12n, multiplyBy);
  assertRounding(25n, 2n, 13n, ceilMultiplyBy);

  // 23 / 12 = 1.9
  const twelve = makeRatioFromAmounts(moe(12n), moe(1n));
  amountsEqual(t, floorDivideBy(moe(23n), twelve), moe(1n), brand);
  amountsEqual(t, ceilDivideBy(moe(23n), twelve), moe(2n), brand);
  amountsEqual(t, divideBy(moe(23n), twelve), moe(2n), brand);

  // banker's rounding
  const divideByTen = n =>
    divideBy(moe(n), makeRatioFromAmounts(moe(10n), moe(1n)));
  amountsEqual(t, divideByTen(114n), moe(11n), brand); // 11.4 -> 11
  amountsEqual(t, divideByTen(115n), moe(12n), brand); // 11.5 -> 12
  amountsEqual(t, divideByTen(125n), moe(12n), brand); // 12.5 -> 12
  amountsEqual(t, divideByTen(126n), moe(13n), brand); // 12.6 -> 13
});

test('ratio - oneMinus', t => {
  const { brand } = makeIssuerKit('moe');
  const moe = value => AmountMath.make(brand, value);
  const oneThird = makeRatioFromAmounts(moe(1n), moe(3n));
  const twoThirds = oneMinus(oneThird);

  t.deepEqual(twoThirds, makeRatio(2n, brand, 3n));

  // @ts-expect-error invalid arguments for testing
  t.throws(() => oneMinus(moe(3n)), {
    message:
      'Parameter must be a Ratio record, but {"brand":"[Alleged: moe brand]","value":"[3n]"} has "brand"',
  });
  t.throws(() => oneMinus(makeRatioFromAmounts(moe(30n), moe(20n))), {
    message: /Parameter must be less than or equal to 1: .*/,
  });
});

// Rounding
const { brand } = makeIssuerKit('moe');

test('ratio - quantize', t => {
  /** @type {Array<[numBefore: bigint, denBefore: bigint, numAfter: bigint, denAfter: bigint]>} */
  const cases = [
    [1n, 1n, 1n, 1n],
    [10n, 10n, 10n, 10n],
    [2n * 10n ** 9n, 1n * 10n ** 9n, 20n, 10n],

    [12345n, 123n, 10037n, 10n ** 2n],
    [12345n, 123n, 1004n, 10n ** 1n],
    [12345n, 123n, 100n, 10n ** 0n],

    [12345n, 12345n, 100n, 100n],
  ];

  for (const [
    numBefore,
    denBefore,
    numAfter,
    target,
    denAfter = target,
  ] of cases) {
    const before = makeRatio(numBefore, brand, denBefore, brand);
    const after = makeRatio(numAfter, brand, denAfter, brand);
    t.deepEqual(
      quantize(before, denAfter),
      after,
      `${numBefore}/${denBefore} quantized to ${denAfter} should be ${numAfter}/${denAfter}`,
    );
  }
});

test('ratio - quantize - leave it alone', t => {
  const cases = [
    [12345n, 123n, 10n ** 5n, 12345n, 123n],
    [12345n, 123n, 10n ** 4n, 12345n, 123n],
    [12345n, 123n, 10n ** 3n, 12345n, 123n],

    [12345n, 12345n, 100_000n, 12345n, 12345n],
    [12345n, 12345n, 10n ** 15n, 12345n, 12345n],
  ];

  for (const [numPre, denPre, qTarget, numAfter, denAfter] of cases) {
    const before = makeRatio(numPre, brand, denPre, brand);
    const after = makeRatio(numAfter, brand, denAfter, brand);
    t.deepEqual(
      quantize(before, qTarget),
      after,
      `${numPre}/${denPre} quantized to ${qTarget} should be ${numAfter}/${denAfter}`,
    );
  }
});

test('ratio - parse', t => {
  const { brand: moeBrand } = makeIssuerKit('moe');
  const { brand: larryBrand } = makeIssuerKit('larry');

  t.deepEqual(
    parseRatio(1024.93803, moeBrand),
    makeRatio(102493803n, moeBrand, 10n ** 5n, moeBrand),
  );

  t.deepEqual(
    parseRatio(1024.93803, moeBrand, larryBrand),
    makeRatio(102493803n, moeBrand, 10n ** 5n, larryBrand),
  );
  t.deepEqual(parseRatio('123400', moeBrand), makeRatio(123400n, moeBrand, 1n));

  t.deepEqual(
    parseRatio('123.456', larryBrand),
    makeRatio(123456n, larryBrand, 10n ** 3n),
  );

  t.deepEqual(
    parseRatio(1, moeBrand, larryBrand),
    makeRatio(1n, moeBrand, 1n, larryBrand),
  );

  t.deepEqual(
    parseRatio('0.000039', moeBrand),
    makeRatio(39n, moeBrand, 10n ** 6n),
  );

  t.deepEqual(
    parseRatio('0.000039100', larryBrand, moeBrand),
    makeRatio(39100n, larryBrand, 10n ** 9n, moeBrand),
  );

  t.throws(() => parseRatio(-1024.93803, moeBrand), {
    message: /Invalid numeric data/,
  });
  t.throws(() => parseRatio('abc', moeBrand), {
    message: /Invalid numeric data/,
  });

  // It's floats that have roundoff errors, but we properly parse and propagate
  // those errors.
  t.deepEqual(
    parseRatio(0.1 + 0.2, moeBrand),
    makeRatio(30000000000000004n, moeBrand, 100000000000000000n, moeBrand),
  );
  t.deepEqual(
    parseRatio(Number.MAX_SAFE_INTEGER + 1, moeBrand),
    makeRatio(9007199254740992n, moeBrand, 1n, moeBrand),
  );
  t.deepEqual(
    parseRatio(Number.MAX_SAFE_INTEGER + 2, moeBrand),
    makeRatio(9007199254740992n, moeBrand, 1n, moeBrand),
  );
});
