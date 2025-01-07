import { M } from '@endo/patterns';
import { test as rawTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { reincarnate } from '@agoric/swingset-liveslots/tools/setup-vat-data.js';

import { E } from '@endo/far';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';

import { makeNotifierKit } from '@agoric/notifier';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { prepareVirtualPurse } from '../src/virtual-purse.js';

/** @type {import('ava').TestFn<ReturnType<makeTestContext>>} */
const test = rawTest;

const { fakeVomKit } = reincarnate({ relaxDurabilityRules: false });
const makeTestContext = () => {
  return { baggage: fakeVomKit.cm.provideBaggage() };
};

test.before(t => {
  t.context = makeTestContext();
});

/**
 * @param {any} t
 * @param {import('@agoric/zone').Zone} zone
 * @param {bigint} [escrowValue]
 */
const setup = (t, zone, escrowValue = 0n) => {
  const makeVirtualPurse = prepareVirtualPurse(zone);

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

  /** @type {import('../src/virtual-purse.js').VirtualPurseController} */
  const vpcontroller = zone.exo('TestController', undefined, {
    getBalances(b) {
      t.is(b, brand);
      return balanceNotifier;
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
  t.plan(22);
  const { baggage } = t.context;
  const zone = makeDurableZone(baggage).subZone('makeVirtualPurse');

  const { expected, balanceUpdater, issuer, mint, brand, vpurse } = setup(
    t,
    zone,
  );

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

  const performWithdrawal = async () => {
    expected.pullAmount(fungible837);
    return E(vpurse).withdraw(fungible837);
  };

  const checkWithdrawal = async newPayment => {
    await issuer.getAmountOf(newPayment).then(amount => {
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
    .deposit(payment, M.and(fungible837))
    .then(checkDeposit)
    .then(performWithdrawal)
    .then(checkWithdrawal);
});

test('makeVirtualPurse withdraw from escrowPurse', async t => {
  const { baggage } = t.context;
  const zone = makeDurableZone(baggage).subZone('withdraw from escrowPurse');

  t.plan(16);
  const { expected, balanceUpdater, issuer, brand, vpurse } = setup(
    t,
    zone,
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

  const performWithdrawal = async () => {
    expected.pullAmount(fungible837);
    return E(vpurse).withdraw(fungible837);
  };

  const checkWithdrawal = async newPayment => {
    await issuer.getAmountOf(newPayment).then(amount => {
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
  const { baggage } = t.context;
  const zone = makeDurableZone(baggage).subZone('vpurse.deposit');

  t.plan(19);
  const { balanceUpdater, mint, brand, vpurse, expected } = setup(t, zone);
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
  const { baggage } = t.context;
  const zone = makeDurableZone(baggage).subZone('vpurse.deposit promise');

  t.plan(1);
  const { issuer, mint, brand, vpurse } = setup(t, zone);
  const fungible25 = AmountMath.make(brand, 25n);

  const payment = mint.mintPayment(fungible25);
  const exclusivePaymentP = claim(E(issuer).makeEmptyPurse(), payment);

  await t.throwsAsync(
    // @ts-expect-error deliberate invalid arguments for testing
    async () => E(vpurse).deposit(exclusivePaymentP, fungible25),
    {
      message:
        /In "deposit" method of \(VirtualPurseKit purse\): arg 0: .*"\[Promise\]" - Must be a remotable/,
    },
    'failed to reject a promise for a payment',
  );
});

test('vpurse.getDepositFacet', async t => {
  const { baggage } = t.context;
  const zone = makeDurableZone(baggage).subZone('vpurse.getDepositFacet');

  t.plan(11);
  const { balanceUpdater, mint, brand, vpurse, expected } = setup(t, zone);
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
    .then(df => df.receive(payment))
    .then(checkDeposit);
});
