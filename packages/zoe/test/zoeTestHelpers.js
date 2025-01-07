import { q } from '@endo/errors';
import { E } from '@endo/eventual-send';

import { AmountMath, assertValueGetHelpers } from '@agoric/ertp';

export const assertAmountsEqual = async (t, amount, expected, label = '') => {
  harden(amount);
  harden(expected);
  const l = label ? `${label} ` : '';
  const brandsEqual = amount.brand === expected.brand;
  const helper = assertValueGetHelpers(expected.value);
  const valueKindsEqual = assertValueGetHelpers(amount.value) === helper;
  const valuesEqual =
    valueKindsEqual && helper.doIsEqual(amount.value, expected.value);

  let msg;
  if (!brandsEqual && !valuesEqual) {
    // prettier-ignore
    msg = `${l}Brands and values must match: got ${q(amount)}, expected ${q(expected)}`;
    t.deepEqual(amount, expected, msg) !== true || t.fail(msg);
  } else if (!brandsEqual) {
    // prettier-ignore
    msg = `${l}Brands must match: got ${amount.brand}, expected ${expected.brand}`;
    t.is(amount.brand, expected.brand, msg) !== true || t.fail(msg);
  } else if (!valueKindsEqual) {
    // prettier-ignore
    msg = `${l}Asset kinds must match: got ${q(amount.value)}, expected ${q(expected.value)}`;
    t.deepEqual(amount.value, expected.value, msg) !== true || t.fail(msg);
  } else if (!valuesEqual) {
    // prettier-ignore
    msg = `${l}Values must match: got ${q(amount.value)}, expected ${q(expected.value)}`;
    t.deepEqual(amount.value, expected.value, msg) !== true || t.fail(msg);
  } else {
    t.truthy(AmountMath.isEqual(amount, expected), l);
  }
  const resultP = msg
    ? Promise.reject(Error(msg))
    : Promise.resolve(label || true);
  resultP.catch(() => {});
  return resultP;
};

export const assertPayoutAmount = async (
  t,
  issuer,
  payout,
  expectedAmount,
  label = '',
) => {
  const amount = await E(issuer).getAmountOf(payout);
  return assertAmountsEqual(t, amount, expectedAmount, label);
};

// Returns a promise that can be awaited in tests to ensure the check completes.
export const assertPayoutDeposit = (t, payout, purse, amount) => {
  return payout.then(payment => {
    E(purse)
      .deposit(payment)
      .then(async payoutAmount =>
        assertAmountsEqual(
          t,
          payoutAmount,
          amount,
          `payout was ${payoutAmount.value}, expected ${amount}.value`,
        ),
      );
  });
};

export const assertOfferResult = (t, seat, expected, msg = expected) => {
  E(seat)
    .getOfferResult()
    .then(
      result => t.is(result, expected, msg),
      e => t.fail(`expecting offer result to be ${expected}, ${e}`),
    );
};

export const assertRejectedOfferResult = (
  t,
  seat,
  expected,
  msg = `offer result rejects as expected`,
) => t.throwsAsync(() => E(seat).getOfferResult(), expected, msg);
