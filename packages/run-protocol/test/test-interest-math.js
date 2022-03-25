// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio.js';
import { calculateCurrentDebt, reverseInterest } from '../src/interest-math.js';

const runBrand = makeIssuerKit('run').brand;

/**
 * @param {any} t
 * @param {readonly [bigint, bigint, bigint]} input
 * @param {bigint} result
 */
function checkDebt(t, input, result) {
  /** @type {Amount<'nat'>} */
  const debtSnapshot = AmountMath.make(runBrand, input[0]);
  const interestSnapshot = makeRatio(100n + input[1], runBrand);
  const currentCompoundedInterest = makeRatio(100n + input[2], runBrand);
  t.is(
    calculateCurrentDebt(
      debtSnapshot,
      interestSnapshot,
      currentCompoundedInterest,
    ).value,
    result,
  );
}

for (const [input, result] of /** @type {const} */ ([
  // no debt
  [[0n, 0n, 0n], 0n],
  [[0n, 0n, 250n], 0n],

  // some debt
  [[1_000_000n, 0n, 0n], 1_000_000n],
  [[1_000_000n, 0n, 2n], 1_020_000n],

  // some debt and previous interest
  [[1_000_000n, 2n, 0n], 980_392n], // negative interest since snapshot
  [[1_000_000n, 2n, 2n], 1_000_000n],
  [[1_000_000n, 2n, 4n], 1_019_607n],
])) {
  test(
    `calculateCurrentDebt ${input} returns ${result}`,
    checkDebt,
    input,
    result,
  );
}

function checkReverse(t, input, result) {
  /** @type {Amount<'nat'>} */
  const debt = AmountMath.make(runBrand, input[0]);
  const interestApplied = makeRatio(100n + input[1], runBrand);
  t.deepEqual(reverseInterest(debt, interestApplied).value, result);
}

for (const [input, result] of /** @type {const} */ ([
  [[0n, 0n], 0n],
  [[0n, 1n], 0n],

  [[1_000_000n, 0n], 1_000_000n],
  [[1_000_000n, 2n], 980_392n],
  [[1_000_000n, 100n], 500_000n],
])) {
  test(
    `reverseInterest ${input} returns ${result}`,
    checkReverse,
    input,
    result,
  );
}
