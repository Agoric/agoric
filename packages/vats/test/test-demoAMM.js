// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';

import {
  AMMDemoState,
  ammPoolRunDeposits,
  decimal,
  DecimalPlaces,
  poolRates,
  showAmount,
  showBrand,
  splitAllCentralPayments,
} from '../src/demoIssuers.js';

/** @param {bigint} n */
const showRUN = n => `${decimal(n, 6)} RUN`;

test('urun -> RUN formatting test utility', t => {
  t.is(showRUN(123456789n), '123.456789 RUN', 'RUN decimal point');
  t.is(showRUN(1234567890n), '1_234.56789 RUN', 'thousands separators');
  t.is(showRUN(3286010000000000n), '3_286_010_000 RUN', 'regression 1');
});

test('ammPoolRunDeposits: check total, WETH', t => {
  const actual = ammPoolRunDeposits(AMMDemoState);
  // t.log(actual);
  t.deepEqual(showRUN(actual.ammTotal), '3_380_790_000 RUN');
  t.deepEqual(showRUN(actual.balances.WETH), '3_286_010_000 RUN');
});

test('splitAllCentralPayments: count entries, spot check', async t => {
  const central = makeIssuerKit('RUN', 'nat', harden({ decimalPlaces: 6 }));
  const deposits = ammPoolRunDeposits(AMMDemoState);
  const bootstrapPayment = central.mint.mintPayment(
    AmountMath.make(central.brand, deposits.ammTotal),
  );
  const actual = await splitAllCentralPayments(
    bootstrapPayment,
    deposits.balances,
    central,
  );
  // t.log(actual);
  t.is(actual.ATOM.amount.brand, central.brand);
  t.deepEqual(showAmount(actual.ATOM.amount), '33_280_000 RUN');
  t.deepEqual(Object.keys(actual), ['BLD', 'ATOM', 'WETH', 'LINK', 'USDC']);
});

test('poolRates: spot check WETH', t => {
  const central = makeIssuerKit('RUN', 'nat', harden({ decimalPlaces: 6 }));
  const weth = makeIssuerKit('WETH', 'nat', harden({ decimalPlaces: 18 }));
  const kits = { RUN: central, WETH: weth };
  const { rates, initialValue } = poolRates(
    'WETH',
    AMMDemoState.WETH,
    kits,
    central,
  );

  t.is(decimal(initialValue, DecimalPlaces.WETH), '1_000_000');
  t.is((AMMDemoState.WETH.config || {}).collateralValue, 1_000_000n);

  t.is(showBrand(rates.interestRate.numerator.brand), 'RUN');
  t.is(showAmount(rates.interestRate.numerator), '0.00025 RUN');

  const showRatio = ({ numerator, denominator }) =>
    numerator.brand === denominator.brand
      ? `${decimal(
          (numerator.value *
            10n ** BigInt(DecimalPlaces[showBrand(numerator.brand)])) /
            denominator.value,
          DecimalPlaces[showBrand(numerator.brand)],
        )}`
      : `${showAmount(numerator)} / ${showAmount(denominator)}`;
  const expected = {
    initialPrice: '3_286.01 RUN / 1 WETH',
    initialMargin: '1.5',
    liquidationMargin: '1.25',
    interestRate: '0.025',
    loanFee: '0.0001',
  };
  Object.entries(expected).forEach(([prop, val]) =>
    t.is(showRatio(rates[prop]), val),
  );
});
