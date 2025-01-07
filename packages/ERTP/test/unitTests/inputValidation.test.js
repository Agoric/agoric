import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AssetKind, makeIssuerKit, AmountMath } from '../../src/index.js';
import { claim, combine } from '../../src/legacy-payment-helpers.js';

/** @import {Amount, Issuer} from '../../src/types.js' */

test('makeIssuerKit bad allegedName', async t => {
  // @ts-expect-error Intentional wrong type for testing
  t.throws(() => makeIssuerKit(harden({})), { message: `{} must be a string` });
  // @ts-expect-error Intentional wrong type for testing
  t.throws(() => makeIssuerKit({}), {
    message: `{} must be a string`,
  });
});

test('makeIssuerKit bad assetKind', async t => {
  // @ts-expect-error Intentional wrong type for testing
  t.throws(() => makeIssuerKit('myTokens', 'somethingWrong'), {
    message:
      'The assetKind "somethingWrong" must be one of ["copyBag","copySet","nat","set"]',
  });
});

test('makeIssuerKit bad displayInfo.decimalPlaces', async t => {
  t.throws(
    () =>
      makeIssuerKit(
        'myTokens',
        AssetKind.NAT,
        // @ts-expect-error Intentional wrong type for testing
        harden({ decimalPlaces: 'hello' }),
      ),
    {
      message: 'displayInfo: decimalPlaces?: "hello" - Must be >= -100',
    },
  );

  t.throws(
    () =>
      makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: 9.2 })),
    { message: 'decimalPlaces 9.2 is not a safe integer' },
  );

  t.assert(
    makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: 9 })),
  );

  t.throws(
    () =>
      makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: -0.1 })),
    { message: 'decimalPlaces -0.1 is not a safe integer' },
  );

  t.assert(
    makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: -1 })),
  );

  t.throws(
    () =>
      makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: 101 })),
    {
      message: 'displayInfo: decimalPlaces?: 101 - Must be <= 100',
    },
  );

  t.throws(
    () =>
      makeIssuerKit('myTokens', AssetKind.NAT, harden({ decimalPlaces: -101 })),
    {
      message: 'displayInfo: decimalPlaces?: -101 - Must be >= -100',
    },
  );
});

test('makeIssuerKit bad displayInfo.assetKind', async t => {
  t.throws(
    () =>
      makeIssuerKit(
        'myTokens',
        AssetKind.NAT,
        // @ts-expect-error Intentional wrong type for testing
        harden({
          assetKind: 'something',
        }),
      ),
    {
      message:
        'displayInfo: assetKind?: "something" - Must match one of ["nat","set","copySet","copyBag"]',
    },
  );
});

test('makeIssuerKit bad displayInfo.whatever', async t => {
  t.throws(
    () =>
      makeIssuerKit(
        'myTokens',
        AssetKind.NAT,
        // @ts-expect-error Intentional wrong type for testing
        harden({
          whatever: 'something',
        }),
      ),
    {
      message: 'displayInfo: ...rest: {"whatever":"something"} - Must be: {}',
    },
  );
});

test('makeIssuerKit malicious displayInfo', async t => {
  t.throws(
    () =>
      makeIssuerKit(
        'myTokens',
        AssetKind.NAT,
        // @ts-expect-error Intentional wrong type for testing
        'badness',
      ),
    {
      message: 'displayInfo: string "badness" - Must be a copyRecord',
    },
  );
});

// Note: because optShutdownWithFailure should never be able to be
// reached, we can't easily test that pathway.
test('makeIssuerKit bad optShutdownWithFailure', async t => {
  t.throws(
    // @ts-expect-error Intentional wrong type for testing
    () => makeIssuerKit('myTokens', AssetKind.NAT, undefined, 'not a function'),
    {
      message: '"not a function" must be a function',
    },
  );
});

test('brand.isMyIssuer bad issuer', async t => {
  const { brand } = makeIssuerKit('myTokens');
  // @ts-expect-error Intentional wrong type for testing
  await t.throwsAsync(async () => brand.isMyIssuer('not an issuer'), {
    message:
      /In "isMyIssuer" method of \(myTokens brand\): arg 0: .*"not an issuer" - Must be a remotable/,
  });
  const fakeIssuer = /** @type {Issuer<'nat'>} */ (
    /** @type {unknown} */ (Far('myTokens issuer', {}))
  );
  const result = await brand.isMyIssuer(fakeIssuer);
  t.false(result);
});

// Tested in the context of an issuer.claim call, as assertLivePayment is not
// exported
test('assertLivePayment', async t => {
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const { mint: mintB, brand: brandB } = makeIssuerKit('fungibleB');

  const paymentB = E(mintB).mintPayment(AmountMath.make(brandB, 837n));

  // payment is of the wrong brand
  await t.throwsAsync(async () => claim(E(issuer).makeEmptyPurse(), paymentB), {
    message:
      '"[Alleged: fungibleB payment]" was not a live payment for brand "[Alleged: fungible brand]". It could be a used-up payment, a payment for another brand, or it might not be a payment at all.',
  });

  // payment is used up
  const payment = E(mint).mintPayment(AmountMath.make(brand, 10n));
  // use up payment
  await claim(E(issuer).makeEmptyPurse(), payment);

  await t.throwsAsync(async () => claim(E(issuer).makeEmptyPurse(), payment), {
    message:
      '"[Alleged: fungible payment]" was not a live payment for brand "[Alleged: fungible brand]". It could be a used-up payment, a payment for another brand, or it might not be a payment at all.',
  });
});

test('issuer.combine bad payments array', async t => {
  const { issuer } = makeIssuerKit('fungible');
  const notAnArray = {
    length: 2,
    split: () => {},
  };
  // @ts-expect-error Intentional wrong type for testing

  await t.throwsAsync(
    async () => combine(E(issuer).makeEmptyPurse(), notAnArray),
    {
      message: 'srcPaymentsPs is not iterable',
    },
  );

  const notAnArray2 = Far('notAnArray2', {
    length: () => 2,
    split: () => {},
  });
  // @ts-expect-error Intentional wrong type for testing
  await t.throwsAsync(
    async () => combine(E(issuer).makeEmptyPurse(), notAnArray2),
    {
      message: 'srcPaymentsPs is not iterable',
    },
  );
});

test('amount with accessor properties', async t => {
  const { brand } = makeIssuerKit('token');
  const makeAmount = () => {
    const amount = { brand };
    let checked = false;
    // Create an amount where the first time `value` is accessed, 1 is
    // returned, but afterwards 1 million is returned. Might be a nice
    // attack to withdraw a lot more than allowed.
    Object.defineProperty(amount, 'value', {
      get() {
        if (checked) {
          return 1_000_000n;
        } else {
          checked = true;
          return 1n;
        }
      },
    });
    return harden(amount);
  };

  const amount = makeAmount();

  t.throws(() => AmountMath.coerce(brand, /** @type {Amount} */ (amount)), {
    message: /"value" must not be an accessor property/,
  });
});
