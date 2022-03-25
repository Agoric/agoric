// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { E } from '@endo/far';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { makeNotifierKit } from '@agoric/notifier';
import { makeVirtualPurse } from '../src/virtual-purse.js';

const setup = (t, escrowValue = 0n) => {
  const kit = makeIssuerKit('fungible');
  const { brand } = kit;

  /** @type {NotifierRecord<Amount>} */
  const { notifier: balanceNotifier, updater: balanceUpdater } =
    makeNotifierKit();

  /** @type {string} */
  let expectedType = 'none';
  /** @type {Amount} */
  let expectedAmount;

  /** @param {Amount} amt */
  const expected = harden({
    /** @param {Amount} amt */
    pullAmount(amt) {
      expectedType = 'pullAmount';
      expectedAmount = amt;
    },
    pushAmount(amt) {
      expectedType = 'pushAmount';
      expectedAmount = amt;
    },
  });

  /** @type {import('../src/virtual-purse').VirtualPurseController} */
  const vpcontroller = harden({
    async *getBalances(b) {
      t.is(b, brand);
      let record = await balanceNotifier.getUpdateSince();
      while (record.updateCount) {
        yield record.value;
        // eslint-disable-next-line no-await-in-loop
        record = await balanceNotifier.getUpdateSince(record.updateCount);
      }
    },
    async pullAmount(amt) {
      t.is(amt.brand, brand);
      t.is(expectedType, 'pullAmount');
      t.assert(AmountMath.isEqual(amt, expectedAmount));
      expectedType = 'none';
      const bal = await balanceNotifier.getUpdateSince();
      let currentBalance = bal.value;
      currentBalance = AmountMath.subtract(currentBalance, amt);
      balanceUpdater.updateState(currentBalance);
    },
    async pushAmount(amt) {
      t.is(amt.brand, brand);
      t.is(expectedType, 'pushAmount');
      t.assert(AmountMath.isEqual(amt, expectedAmount));
      expectedType = 'none';
      const bal = await balanceNotifier.getUpdateSince();
      let currentBalance = bal.value;
      currentBalance = AmountMath.add(currentBalance, amt);
      balanceUpdater.updateState(currentBalance);
    },
  });

  const vpkit = { brand: kit.brand, issuer: kit.issuer };
  if (escrowValue) {
    const escrowPurse = kit.issuer.makeEmptyPurse();
    const escrowPayment = kit.mint.mintPayment(
      AmountMath.make(kit.brand, escrowValue),
    );
    escrowPurse.deposit(escrowPayment);
    vpkit.escrowPurse = escrowPurse;
  } else {
    vpkit.mint = kit.mint;
  }

  const vpurse = makeVirtualPurse(vpcontroller, kit);
  return { ...kit, balanceUpdater, vpurse, expected };
};

test('makeVirtualPurse', async t => {
  t.plan(16);
  const { expected, balanceUpdater, issuer, mint, brand, vpurse } = setup(t);

  const payment = mint.mintPayment(AmountMath.make(brand, 837n));

  const notifier = E(vpurse).getCurrentAmountNotifier();
  let nextUpdateP = E(notifier).getUpdateSince();

  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdateP;
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), balance),
      `the notifier balance is the same as the purse`,
    );
    nextUpdateP = E(notifier).getUpdateSince(updateCount);
  };

  balanceUpdater.updateState(AmountMath.makeEmpty(brand));
  await checkNotifier();
  t.assert(
    AmountMath.isEqual(
      await E(vpurse).getCurrentAmount(),
      AmountMath.makeEmpty(brand),
    ),
    `empty purse is empty`,
  );
  t.is(await E(vpurse).getAllegedBrand(), brand, `purse's brand is correct`);
  const fungible837 = AmountMath.make(brand, 837n);

  const checkDeposit = async newPurseBalance => {
    t.assert(
      AmountMath.isEqual(newPurseBalance, fungible837),
      `the amount returned is the payment amount`,
    );
    await checkNotifier();
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), fungible837),
      `the new purse balance is the payment's old balance`,
    );
  };

  const performWithdrawal = () => {
    expected.pullAmount(fungible837);
    return E(vpurse).withdraw(fungible837);
  };

  const checkWithdrawal = async newPayment => {
    issuer.getAmountOf(newPayment).then(amount => {
      t.assert(
        AmountMath.isEqual(amount, fungible837),
        `the withdrawn payment has the right balance`,
      );
    });
    await checkNotifier();
    t.assert(
      AmountMath.isEqual(
        await E(vpurse).getCurrentAmount(),
        AmountMath.makeEmpty(brand),
      ),
      `the purse is empty again`,
    );
  };

  expected.pushAmount(fungible837);
  await E(vpurse)
    .deposit(payment, fungible837)
    .then(checkDeposit)
    .then(performWithdrawal)
    .then(checkWithdrawal);
});

test('makeVirtualPurse withdraw from escrowPurse', async t => {
  t.plan(11);
  const { expected, balanceUpdater, issuer, brand, vpurse } = setup(
    t,
    987654321n,
  );

  const notifier = E(vpurse).getCurrentAmountNotifier();
  let nextUpdateP = E(notifier).getUpdateSince();

  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdateP;
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), balance),
      `the notifier balance is the same as the purse`,
    );
    nextUpdateP = E(notifier).getUpdateSince(updateCount);
  };

  balanceUpdater.updateState(AmountMath.makeEmpty(brand));
  await checkNotifier();
  t.assert(
    AmountMath.isEqual(
      await E(vpurse).getCurrentAmount(),
      AmountMath.makeEmpty(brand),
    ),
    `empty purse is empty`,
  );
  t.is(await E(vpurse).getAllegedBrand(), brand, `purse's brand is correct`);
  const fungible837 = AmountMath.make(brand, 837n);

  // Synthesize the balance update.
  balanceUpdater.updateState(fungible837);
  await checkNotifier();

  const performWithdrawal = () => {
    expected.pullAmount(fungible837);
    return E(vpurse).withdraw(fungible837);
  };

  const checkWithdrawal = async newPayment => {
    issuer.getAmountOf(newPayment).then(amount => {
      t.assert(
        AmountMath.isEqual(amount, fungible837),
        `the withdrawn payment has the right balance`,
      );
    });
    await checkNotifier();
    t.assert(
      AmountMath.isEqual(
        await E(vpurse).getCurrentAmount(),
        AmountMath.makeEmpty(brand),
      ),
      `the purse is empty again`,
    );
  };

  await performWithdrawal().then(checkWithdrawal);
});

test('vpurse.deposit', async t => {
  t.plan(14);
  const { balanceUpdater, mint, brand, vpurse, expected } = setup(t);
  const fungible0 = AmountMath.makeEmpty(brand);
  const fungible17 = AmountMath.make(brand, 17n);
  const fungible25 = AmountMath.make(brand, 25n);
  const fungibleSum = AmountMath.add(fungible17, fungible25);

  const notifier = E(vpurse).getCurrentAmountNotifier();
  const payment17 = mint.mintPayment(fungible17);
  const payment25 = mint.mintPayment(fungible25);

  let nextUpdate = E(notifier).getUpdateSince();

  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdate;
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), balance),
      `the notifier balance is the same as the purse`,
    );
    nextUpdate = E(notifier).getUpdateSince(updateCount);
  };

  const checkDeposit =
    (expectedOldBalance, expectedNewBalance) => async depositResult => {
      const delta = AmountMath.subtract(expectedNewBalance, expectedOldBalance);
      t.assert(
        AmountMath.isEqual(depositResult, delta),
        `the balance changes by the deposited amount: ${delta.value}`,
      );
      await checkNotifier();
      t.assert(
        AmountMath.isEqual(
          await E(vpurse).getCurrentAmount(),
          expectedNewBalance,
        ),
        `the new purse balance ${depositResult.value} is the expected amount: ${expectedNewBalance.value}`,
      );
    };

  balanceUpdater.updateState(AmountMath.makeEmpty(brand));
  await checkNotifier();
  expected.pushAmount(fungible17);
  await E(vpurse)
    .deposit(payment17, fungible17)
    .then(checkDeposit(fungible0, fungible17));
  expected.pushAmount(fungible25);
  await E(vpurse)
    .deposit(payment25, fungible25)
    .then(checkDeposit(fungible17, fungibleSum));
});

test('vpurse.deposit promise', async t => {
  t.plan(2);
  const { issuer, mint, brand, vpurse } = setup(t);
  const fungible25 = AmountMath.make(brand, 25n);

  const payment = mint.mintPayment(fungible25);
  const exclusivePaymentP = E(issuer).claim(payment);

  await t.throwsAsync(
    // @ts-ignore deliberate invalid arguments for testing
    () => E(vpurse).deposit(exclusivePaymentP, fungible25),
    { message: /deposit does not accept promises/ },
    'failed to reject a promise for a payment',
  );
});

test('vpurse.getDepositFacet', async t => {
  t.plan(8);
  const { balanceUpdater, mint, brand, vpurse, expected } = setup(t);
  const fungible25 = AmountMath.make(brand, 25n);

  const payment = mint.mintPayment(fungible25);
  const notifier = await E(vpurse).getCurrentAmountNotifier();

  let nextUpdate = E(notifier).getUpdateSince();
  const checkNotifier = async () => {
    const { value: balance, updateCount } = await nextUpdate;
    nextUpdate = E(notifier).getUpdateSince(updateCount);
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), balance),
      `the notifier balance is the same as the purse's`,
    );
  };

  const checkDeposit = async newPurseBalance => {
    t.assert(
      AmountMath.isEqual(newPurseBalance, fungible25),
      `the balance returned is the purse balance`,
    );
    await checkNotifier();
    t.assert(
      AmountMath.isEqual(await E(vpurse).getCurrentAmount(), fungible25),
      `the new purse balance is the payment's old balance`,
    );
  };

  balanceUpdater.updateState(AmountMath.makeEmpty(brand));
  await checkNotifier();
  expected.pushAmount(fungible25);
  await E(vpurse)
    .getDepositFacet()
    .then(({ receive }) => receive(payment))
    .then(checkDeposit);
});
