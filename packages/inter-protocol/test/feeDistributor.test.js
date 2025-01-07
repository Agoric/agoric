import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { AmountMath } from '@agoric/ertp';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { setup } from '@agoric/zoe/test/unitTests/setupBasicMints.js';

import { assertPayoutAmount } from '@agoric/zoe/test/zoeTestHelpers.js';
import { E, Far } from '@endo/far';
import { mustMatch } from '@agoric/store';
import { makeFeeDistributor, meta } from '../src/feeDistributor.js';

/** @param {Issuer} feeIssuer */
const makeFakeFeeDepositFacetKit = feeIssuer => {
  const depositPayments = [];

  const feeDepositFacet = {
    async receive(pmt) {
      depositPayments.push(pmt);
      return E(feeIssuer).getAmountOf(pmt);
    },
  };

  const getPayments = async () =>
    // await event loop so the receive() can run
    Promise.resolve(eventLoopIteration()).then(_ => depositPayments);

  return { feeDepositFacet, getPayments };
};

const makeFakeFeeProducer = (makeEmptyPayment = () => {}) => {
  const feePayments = [];
  return Far('feeCollector', {
    collectFees: () => feePayments.shift() || makeEmptyPayment(),

    // tools for the fake:
    pushFees: payment => feePayments.push(payment),
  });
};
/**
 * @param {any} t
 * @param {Promise<Payment[]>} paymentsP
 * @param {number} count
 * @param {any} values
 * @param {Issuer} issuer
 * @param {Brand} brand
 */
const assertPaymentArray = async (
  t,
  paymentsP,
  count,
  values,
  issuer,
  brand,
) => {
  const payments = await paymentsP;
  for (let i = 0; i < count; i += 1) {
    // XXX https://github.com/Agoric/agoric-sdk/issues/5527
    await assertPayoutAmount(
      t,
      issuer,
      payments[i],
      AmountMath.make(brand, values[i]),
    );
  }
};

const makeScenario = async t => {
  const { brands, moolaIssuer: issuer, moolaMint: stableMint } = setup();
  const brand = brands.get('moola');
  const { feeDepositFacet, getPayments } = makeFakeFeeDepositFacetKit(issuer);
  const makeEmptyPayment = () =>
    stableMint.mintPayment(AmountMath.makeEmpty(brand));
  const vaultFactory = makeFakeFeeProducer(makeEmptyPayment);
  const amm = makeFakeFeeProducer(makeEmptyPayment);
  const timerService = buildZoeManualTimer(t.log);
  const { publicFacet, creatorFacet } = await makeFeeDistributor(issuer, {
    timerService,
    collectionInterval: 1n,
    keywordShares: {
      Rewards: 3n,
    },
  });

  return {
    timerService,
    stableMint,
    issuer,
    brand,
    amm,
    vaultFactory,
    getPayments,
    publicFacet,
    creatorFacet,
    feeDepositFacet,
  };
};

test('fee distribution', async t => {
  const {
    timerService,
    stableMint,
    issuer,
    brand,
    amm,
    vaultFactory,
    getPayments,
    creatorFacet,
    feeDepositFacet,
  } = await makeScenario(t);

  const feeCollectors = {
    vaultFactory,
    amm,
  };
  await Promise.all(
    Object.entries(feeCollectors).map(async ([debugName, collector]) => {
      await creatorFacet.startPeriodicCollection(debugName, collector);
    }),
  );

  const rewardsDestination =
    creatorFacet.makeDepositFacetDestination(feeDepositFacet);
  await creatorFacet.setDestinations({ Rewards: rewardsDestination });

  vaultFactory.pushFees(stableMint.mintPayment(AmountMath.make(brand, 500n)));
  amm.pushFees(stableMint.mintPayment(AmountMath.make(brand, 270n)));

  t.deepEqual(await getPayments(), []);

  await timerService.tick();

  await assertPaymentArray(t, getPayments(), 2, [500n, 270n], issuer, brand);
});

test('setKeywordShares', async t => {
  const {
    timerService,
    stableMint,
    issuer,
    brand,
    amm,
    vaultFactory,
    getPayments,
    publicFacet,
    creatorFacet,
    feeDepositFacet,
  } = await makeScenario(t);

  const feeCollectors = {
    vaultFactory,
    amm,
  };
  await Promise.all(
    Object.entries(feeCollectors).map(async ([debugName, collector]) => {
      await creatorFacet.startPeriodicCollection(debugName, collector);
    }),
  );

  const { feeDepositFacet: deposit2, getPayments: getPayments2 } =
    makeFakeFeeDepositFacetKit(issuer);
  const rewardsDestination =
    creatorFacet.makeDepositFacetDestination(feeDepositFacet);
  const reserveDestination = creatorFacet.makeDepositFacetDestination(deposit2);

  t.deepEqual(publicFacet.getKeywordShares(), { Rewards: 3n });
  await creatorFacet.setKeywordShares(
    harden({
      Reserve: 4n,
      Rewards: 1n,
    }),
  );
  t.deepEqual(publicFacet.getKeywordShares(), { Reserve: 4n, Rewards: 1n });

  await creatorFacet.setDestinations({
    Rewards: rewardsDestination,
    Reserve: reserveDestination,
  });

  vaultFactory.pushFees(stableMint.mintPayment(AmountMath.make(brand, 500n)));
  amm.pushFees(stableMint.mintPayment(AmountMath.make(brand, 270n)));

  t.deepEqual(await getPayments(), []);

  await timerService.tick();

  await assertPaymentArray(t, getPayments(), 2, [100n, 54n], issuer, brand);
  await assertPaymentArray(t, getPayments2(), 2, [400n, 216n], issuer, brand);
});

test('fee distribution, leftovers', async t => {
  const { brands, moolaIssuer: issuer, moolaMint: stableMint } = setup();
  const brand = brands.get('moola');
  const { feeDepositFacet, getPayments } = makeFakeFeeDepositFacetKit(issuer);
  const makeEmptyPayment = () =>
    stableMint.mintPayment(AmountMath.makeEmpty(brand));
  const vaultFactory = makeFakeFeeProducer(makeEmptyPayment);
  const amm = makeFakeFeeProducer(makeEmptyPayment);
  const timerService = buildZoeManualTimer(t.log);
  const { creatorFacet } = await makeFeeDistributor(issuer, {
    timerService,
    collectionInterval: 1n,
    keywordShares: {
      Rewards: 6n,
    },
  });

  const feeCollectors = {
    vaultFactory,
    amm,
  };
  await Promise.all(
    Object.entries(feeCollectors).map(async ([debugName, collector]) => {
      await creatorFacet.startPeriodicCollection(debugName, collector);
    }),
  );

  const rewardsDestination =
    creatorFacet.makeDepositFacetDestination(feeDepositFacet);
  await creatorFacet.setDestinations({ Rewards: rewardsDestination });

  vaultFactory.pushFees(stableMint.mintPayment(AmountMath.make(brand, 12n)));
  amm.pushFees(stableMint.mintPayment(AmountMath.make(brand, 8n)));

  t.deepEqual(await getPayments(), []);

  await timerService.tick();

  await assertPaymentArray(t, getPayments(), 2, [12n, 8n], issuer, brand);

  // Pay them again
  vaultFactory.pushFees(stableMint.mintPayment(AmountMath.make(brand, 13n)));
  amm.pushFees(stableMint.mintPayment(AmountMath.make(brand, 7n)));

  await timerService.tick();

  await assertPaymentArray(
    t,
    getPayments().then(p => p.slice(2)),
    2,
    [13n, 7n],
    issuer,
    brand,
  );
});

test('feeDistributor custom terms shape catches non-Nat bigint', t => {
  const timerService = Far('MockTimer', {});
  t.throws(
    () =>
      mustMatch(
        harden({
          keywordShares: { Reserve: -1n },
          timerService,
          collectionInterval: 2n,
        }),
        meta.customTermsShape,
      ),
    { message: 'keywordShares: Reserve: [1]: "[-1n]" - Must be non-negative' },
  );
});
