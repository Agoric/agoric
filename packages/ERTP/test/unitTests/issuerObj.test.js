import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { E } from '@endo/eventual-send';
import { AssetKind, makeIssuerKit, AmountMath } from '../../src/index.js';
import {
  claim,
  combine,
  split,
  splitMany,
} from '../../src/legacy-payment-helpers.js';

test('issuer.getBrand, brand.isMyIssuer', t => {
  const { issuer, brand } = makeIssuerKit('fungible');
  const myBrand = issuer.getBrand();
  t.assert(myBrand.isMyIssuer(issuer));
  t.is(
    brand,
    myBrand,
    'brand returned from `makeIssuerKit` and from `getBrand` the same',
  );
  t.is(issuer.getAllegedName(), myBrand.getAllegedName());
  t.is(issuer.getAllegedName(), 'fungible');
  t.deepEqual(brand.getDisplayInfo(), { assetKind: AssetKind.NAT });
});

test('brand.getDisplayInfo()', t => {
  const displayInfo = harden({ decimalPlaces: 3 });
  const { brand } = makeIssuerKit('fungible', AssetKind.NAT, displayInfo);
  t.deepEqual(brand.getDisplayInfo(), {
    ...displayInfo,
    assetKind: AssetKind.NAT,
  });
  const display = amount => {
    const { brand: myBrand, value } = amount;
    const { decimalPlaces } = myBrand.getDisplayInfo();
    const valueDisplay = value.toString();
    const length = valueDisplay.length;
    return [
      valueDisplay.slice(0, length - decimalPlaces),
      '.',
      valueDisplay.slice(length - decimalPlaces),
    ].join('');
  };
  t.is(display({ brand, value: 3000 }), '3.000');
});

test('bad display info', t => {
  const displayInfo = harden({ somethingUnexpected: 3 });
  // @ts-expect-error deliberate invalid arguments for testing
  t.throws(() => makeIssuerKit('fungible', AssetKind.NAT, displayInfo), {
    message: 'displayInfo: ...rest: {"somethingUnexpected":3} - Must be: {}',
  });
});

test('empty display info', t => {
  const displayInfo = harden({});
  const { brand } = makeIssuerKit('fungible', AssetKind.NAT, displayInfo);
  t.deepEqual(brand.getDisplayInfo(), {
    ...displayInfo,
    assetKind: AssetKind.NAT,
  });
});

test('issuer.getAssetKind', t => {
  const { issuer } = makeIssuerKit('fungible');
  t.is(issuer.getAssetKind(), AssetKind.NAT);
});

test('issuer.makeEmptyPurse', async t => {
  t.plan(9);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const purse = issuer.makeEmptyPurse();
  const payment = mint.mintPayment(AmountMath.make(brand, 837n));

  const notifier = purse.getCurrentAmountNotifier();
  let nextUpdate = notifier.getUpdateSince();

  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdate;
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), balance),
      `the notifier balance is the same as the purse`,
    );
    nextUpdate = notifier.getUpdateSince(updateCount);
  };

  t.assert(
    AmountMath.isEqual(purse.getCurrentAmount(), AmountMath.makeEmpty(brand)),
    `empty purse is empty`,
  );
  await checkNotifier();
  t.is(purse.getAllegedBrand(), brand, `purse's brand is correct`);
  const fungible837 = AmountMath.make(brand, 837n);

  const checkDeposit = async newPurseBalance => {
    t.assert(
      AmountMath.isEqual(newPurseBalance, fungible837),
      `the balance returned is the purse balance`,
    );
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), fungible837),
      `the new purse balance is the payment's old balance`,
    );
    await checkNotifier();
  };

  const performWithdrawal = () => purse.withdraw(fungible837);

  const checkWithdrawal = async newPayment => {
    await issuer.getAmountOf(newPayment).then(amount => {
      t.assert(
        AmountMath.isEqual(amount, fungible837),
        `the withdrawn payment has the right balance`,
      );
    });
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), AmountMath.makeEmpty(brand)),
      `the purse is empty again`,
    );
    await checkNotifier();
  };

  await E(purse)
    .deposit(payment, fungible837)
    .then(checkDeposit)
    .then(performWithdrawal)
    .then(checkWithdrawal);
});

test('purse.withdraw overdrawn', async t => {
  t.plan(1);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const purse = issuer.makeEmptyPurse();
  const purseBalance = AmountMath.make(brand, 103980n);
  const payment = mint.mintPayment(purseBalance);
  purse.deposit(payment);

  const tooMuch = AmountMath.make(brand, 103981n);

  t.throws(() => purse.withdraw(tooMuch), {
    message:
      'Withdrawal of {"brand":"[Alleged: fungible brand]","value":"[103981n]"} failed because the purse only contained {"brand":"[Alleged: fungible brand]","value":"[103980n]"}',
  });
});

test('purse.deposit', async t => {
  t.plan(7);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const fungible0 = AmountMath.makeEmpty(brand);
  const fungible17 = AmountMath.make(brand, 17n);
  const fungible25 = AmountMath.make(brand, 25n);
  const fungibleSum = AmountMath.add(fungible17, fungible25);

  const purse = issuer.makeEmptyPurse();
  const notifier = purse.getCurrentAmountNotifier();
  const payment17 = mint.mintPayment(fungible17);
  const payment25 = mint.mintPayment(fungible25);

  let nextUpdate = notifier.getUpdateSince();

  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdate;
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), balance),
      `the notifier balance is the same as the purse`,
    );
    nextUpdate = notifier.getUpdateSince(updateCount);
  };

  const checkDeposit =
    (expectedOldBalance, expectedNewBalance) => async depositResult => {
      const delta = AmountMath.subtract(expectedNewBalance, expectedOldBalance);
      t.assert(
        AmountMath.isEqual(depositResult, delta),
        `the balance changes by the deposited amount: ${delta.value}`,
      );
      t.assert(
        AmountMath.isEqual(purse.getCurrentAmount(), expectedNewBalance),
        `the new purse balance ${depositResult.value} is the expected amount: ${expectedNewBalance.value}`,
      );
      await checkNotifier();
    };

  await checkNotifier();
  await E(purse)
    .deposit(payment17, fungible17)
    .then(checkDeposit(fungible0, fungible17));
  await E(purse)
    .deposit(payment25, fungible25)
    .then(checkDeposit(fungible17, fungibleSum));
});

test('purse.deposit promise', async t => {
  t.plan(1);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const fungible25 = AmountMath.make(brand, 25n);

  const purse = issuer.makeEmptyPurse();
  const payment = mint.mintPayment(fungible25);
  const exclusivePaymentP = claim(E(issuer).makeEmptyPurse(), payment);

  await t.throwsAsync(
    // @ts-expect-error deliberate invalid arguments for testing
    async () => E(purse).deposit(exclusivePaymentP, fungible25),
    {
      message:
        /In "deposit" method of \(fungible Purse purse\): arg 0: .*"\[Promise\]" - Must be a remotable/,
    },
    'failed to reject a promise for a payment',
  );
});

test('purse.getDepositFacet', async t => {
  t.plan(4);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const fungible25 = AmountMath.make(brand, 25n);

  const purse = issuer.makeEmptyPurse();
  const payment = mint.mintPayment(fungible25);
  const notifier = purse.getCurrentAmountNotifier();

  let nextUpdate = notifier.getUpdateSince();
  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdate;
    nextUpdate = notifier.getUpdateSince(updateCount);
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), balance),
      `the notifier balance is the same as the purse's`,
    );
  };

  const checkDeposit = async newPurseBalance => {
    t.assert(
      AmountMath.isEqual(newPurseBalance, fungible25),
      `the balance returned is the purse balance`,
    );
    t.assert(
      AmountMath.isEqual(purse.getCurrentAmount(), fungible25),
      `the new purse balance is the payment's old balance`,
    );
    await checkNotifier();
  };

  await checkNotifier();
  await E(purse)
    .getDepositFacet()
    .then(depositFacet => depositFacet.receive(payment))
    .then(checkDeposit);
});

test('issuer.burn', async t => {
  t.plan(2);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const payment1 = mint.mintPayment(AmountMath.make(brand, 837n));

  const burntBalance = await E(issuer).burn(
    payment1,
    AmountMath.make(brand, 837n),
  );
  t.assert(
    AmountMath.isEqual(burntBalance, AmountMath.make(brand, 837n)),
    `entire minted payment was burnt`,
  );
  await t.throwsAsync(async () => issuer.getAmountOf(payment1), {
    message: /was not a live payment for brand/,
  });
});

test('issuer.claim', async t => {
  t.plan(3);
  const { issuer, mint, brand } = makeIssuerKit('fungible');
  const payment1 = mint.mintPayment(AmountMath.make(brand, 2n));
  await claim(
    E(issuer).makeEmptyPurse(),
    payment1,
    AmountMath.make(brand, 2n),
  ).then(async newPayment1 => {
    await issuer.getAmountOf(newPayment1).then(amount => {
      t.assert(
        AmountMath.isEqual(amount, AmountMath.make(brand, 2n)),
        `new payment has equal balance to old payment`,
      );
      t.not(newPayment1, payment1, `old payment is different than new payment`);
    });

    return t.throwsAsync(async () => issuer.getAmountOf(payment1), {
      message: /was not a live payment for brand/,
    });
  });
});

test('issuer.splitMany bad amount', async t => {
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const payment = mint.mintPayment(AmountMath.make(brand, 1000n));
  const badAmounts = harden(Array(2).fill(AmountMath.make(brand, 10n)));
  await t.throwsAsync(
    async _ => splitMany(E(issuer).makeEmptyPurse(), payment, badAmounts),
    { message: /rights were not conserved/ },
    'successfully throw if rights are not conserved in proposed new payments',
  );
});

test('issuer.splitMany good amount', async t => {
  t.plan(11);
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const oldPayment = mint.mintPayment(AmountMath.make(brand, 100n));
  const goodAmounts = Array(10).fill(AmountMath.make(brand, 10n));

  const checkPayments = async splitPayments => {
    const amounts = await Promise.all(
      splitPayments.map(async payment => issuer.getAmountOf(payment)),
    );
    for (const amount of amounts) {
      t.deepEqual(
        amount,
        AmountMath.make(brand, 10n),
        `split payment has right balance`,
      );
    }
    await t.throwsAsync(
      async () => issuer.getAmountOf(oldPayment),
      { message: /was not a live payment for brand/ },
      `oldPayment no longer exists`,
    );
  };

  await splitMany(
    E(issuer).makeEmptyPurse(),
    oldPayment,
    harden(goodAmounts),
  ).then(checkPayments);
});

test('issuer.split bad amount', async t => {
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const { brand: otherBrand } = makeIssuerKit('other fungible');
  const payment = mint.mintPayment(AmountMath.make(brand, 1000n));
  await t.throwsAsync(
    async _ =>
      split(
        E(issuer).makeEmptyPurse(),
        payment,
        AmountMath.make(otherBrand, 10n),
      ),
    {
      message:
        'Brands in left "[Alleged: fungible brand]" and right "[Alleged: other fungible brand]" should match but do not',
    },
  );
});

test('issuer.split good amount', async t => {
  t.plan(3);
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const oldPayment = mint.mintPayment(AmountMath.make(brand, 20n));

  const checkPayments = async splitPayments => {
    const amounts = await Promise.all(
      splitPayments.map(async payment => issuer.getAmountOf(payment)),
    );
    for (const amount of amounts) {
      t.deepEqual(
        amount,
        AmountMath.make(brand, 10n),
        `split payment has right balance`,
      );
    }
    await t.throwsAsync(
      async () => issuer.getAmountOf(oldPayment),
      {
        message: `"[Alleged: fungible payment]" was not a live payment for brand "[Alleged: fungible brand]". It could be a used-up payment, a payment for another brand, or it might not be a payment at all.`,
      },
      `oldPayment no longer exists`,
    );
  };

  await split(
    E(issuer).makeEmptyPurse(),
    oldPayment,
    AmountMath.make(brand, 10n),
  ).then(checkPayments);
});

test('issuer.combine good payments', async t => {
  t.plan(101);
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const payments = [];
  for (let i = 0; i < 100; i += 1) {
    payments.push(mint.mintPayment(AmountMath.make(brand, 1n)));
  }
  harden(payments);

  const checkCombinedPayment = async combinedPayment => {
    const amount = await issuer.getAmountOf(combinedPayment);
    t.deepEqual(
      amount,
      AmountMath.make(brand, 100n),
      `combined payment equal to the original payments total`,
    );

    await Promise.all(
      payments.map(async payment =>
        t.throwsAsync(
          async () => issuer.getAmountOf(payment),
          { message: /was not a live payment for brand/ },
          `original payments no longer exist`,
        ),
      ),
    );
  };
  await combine(E(issuer).makeEmptyPurse(), payments).then(
    checkCombinedPayment,
  );
});

test('issuer.combine array of promises', async t => {
  t.plan(1);
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const paymentsP = [];
  for (let i = 0; i < 100; i += 1) {
    const freshPayment = mint.mintPayment(AmountMath.make(brand, 1n));
    const paymentP = claim(issuer.makeEmptyPurse(), freshPayment);
    paymentsP.push(paymentP);
  }
  void harden(paymentsP);

  const checkCombinedResult = async paymentP =>
    issuer.getAmountOf(paymentP).then(pAmount => {
      t.is(pAmount.value, 100n);
    });

  await combine(E(issuer).makeEmptyPurse(), paymentsP).then(
    checkCombinedResult,
  );
});

test('issuer.combine bad payments', async t => {
  const { mint, issuer, brand } = makeIssuerKit('fungible');
  const { mint: otherMint, brand: otherBrand } =
    makeIssuerKit('other fungible');
  const payments = [];
  for (let i = 0; i < 100; i += 1) {
    payments.push(mint.mintPayment(AmountMath.make(brand, 1n)));
  }
  const otherPayment = otherMint.mintPayment(AmountMath.make(otherBrand, 10n));
  payments.push(otherPayment);
  harden(payments);

  await t.throwsAsync(
    async () => combine(E(issuer).makeEmptyPurse(), payments),
    {
      message:
        /^"\[Alleged: other fungible payment\]" was not a live payment for brand "\[Alleged: fungible brand\]"./,
    },
  );
});
