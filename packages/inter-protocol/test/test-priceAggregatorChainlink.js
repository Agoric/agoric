// eslint-disable-next-line import/no-extraneous-dependencies
import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';

import {
  eventLoopIteration,
  makeFakeMarshaller,
} from '@agoric/notifier/tools/testSupports.js';
import { makeMockChainStorageRoot } from '@agoric/vats/tools/storage-test-utils.js';
import { subscribeEach } from '@agoric/notifier';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe/src/zoeService/zoe.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<typeof makeContext>>>} */
const test = unknownTest;

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const aggregatorPath = `${dirname}/../src/price/priceAggregatorChainlink.js`;

const defaultConfig = {
  maxSubmissionCount: 1000,
  minSubmissionCount: 2,
  restartDelay: 5n,
  timeout: 10,
  minSubmissionValue: 100n,
  maxSubmissionValue: 10000n,
};

const link = makeIssuerKit(
  '$LINK',
  AssetKind.NAT,
  harden({ decimalPlaces: 6 }),
);
const usd = makeIssuerKit('$USD', AssetKind.NAT, harden({ decimalPlaces: 2 }));

/**
 *
 * @param {Promise<StoredSubscriber<unknown>>} subscriber
 */
export const subscriberSubkey = subscriber => {
  return E(subscriber)
    .getStoreKey()
    .then(storeKey => storeKey.storeSubkey);
};

const makeContext = async () => {
  // Outside of tests, we should use the long-lived Zoe on the
  // testnet. In this test, we must create a new Zoe.
  const { admin, vatAdminState } = makeFakeVatAdmin();
  const { zoeService: zoe } = makeZoeKit(admin);

  // Pack the contracts.
  const aggregatorBundle = await bundleSource(aggregatorPath);

  // Install the contract on Zoe, getting an installation. We can
  // use this installation to look up the code we installed. Outside
  // of tests, we can also send the installation to someone
  // else, and they can use it to create a new contract instance
  // using the same code.
  vatAdminState.installBundle('b1-aggregator', aggregatorBundle);
  /** @type {Installation<import('../src/price/priceAggregatorChainlink.js').start>} */
  const aggregatorInstallation = await E(zoe).installBundleID('b1-aggregator');

  /** @param {typeof defaultConfig} config */
  async function makeChainlinkAggregator(config) {
    const {
      maxSubmissionCount,
      maxSubmissionValue,
      minSubmissionCount,
      minSubmissionValue,
      restartDelay,
      timeout,
    } = config;

    // ??? why do we need the Far here and not in VaultFactory tests?
    const marshaller = Far('fake marshaller', { ...makeFakeMarshaller() });
    const mockStorageRoot = makeMockChainStorageRoot();
    const storageNode = E(mockStorageRoot).makeChildNode('priceAggregator');

    const timer = buildManualTimer(() => {});

    const aggregator = await E(zoe).startInstance(
      aggregatorInstallation,
      undefined,
      {
        timer,
        brandIn: link.brand,
        brandOut: usd.brand,
        maxSubmissionCount,
        minSubmissionCount,
        restartDelay,
        timeout,
        minSubmissionValue,
        maxSubmissionValue,
      },
      {
        marshaller,
        storageNode: E(storageNode).makeChildNode('LINK-USD_price_feed'),
      },
    );
    return { ...aggregator, mockStorageRoot };
  }

  return { link, makeChainlinkAggregator, usd, zoe };
};

test.before('setup aggregator and oracles', async t => {
  t.context = await makeContext();
});

test('basic', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator(defaultConfig);
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: basic consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 300n });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.roundId, 1n);
  t.is(round1Attempt1.answer, 200n);

  // ----- round 2: check restartDelay implementation
  // since oracle A initialized the last round, it CANNOT start another round before
  // the restartDelay, which means its submission will be IGNORED. this means the median
  // should ONLY be between the OracleB and C values, which is why it is 25000
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 1000n }),
    { message: 'round not accepting submissions' },
  );
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 2000n });
  await E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 3000n });
  await oracleTimer.tick();

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt2.answer, 200n);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.is(round2Attempt1.answer, 2500n);

  // ----- round 3: check oracle submission order
  // unlike the previous test, if C initializes, all submissions should be recorded,
  // which means the median will be the expected 5000 here
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 3, unitPrice: 5000n });
  await E(pricePushAdminA).pushPrice({ roundId: 3, unitPrice: 4000n });
  await E(pricePushAdminB).pushPrice({ roundId: 3, unitPrice: 6000n });
  await oracleTimer.tick();

  const round1Attempt3 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt3.answer, 200n);
  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.is(round3Attempt1.answer, 5000n);
});

test('timeout', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    restartDelay: 2n,
    timeout: 5,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: basic consensus w/ ticking: should work EXACTLY the same
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 300n });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.roundId, 1n);
  t.is(round1Attempt1.answer, 200n);

  // ----- round 2: check restartDelay implementation
  // timeout behavior is, if more ticks pass than the timeout param (5 here), the round is
  // considered "timedOut," at which point, the values are simply copied from the previous round
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 2000n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick(); // --- should time out here
  await E(pricePushAdminC).pushPrice({ roundId: 3, unitPrice: 1000n });
  await E(pricePushAdminA).pushPrice({ roundId: 3, unitPrice: 3000n });

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt2.answer, 200n);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.is(round2Attempt1.answer, 200n);
  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.is(round3Attempt1.answer, 2000n);
});

test('issue check', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    restartDelay: 2n,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: ignore too low values
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 50n }),
    {
      message: 'value below minSubmissionValue 100',
    },
  );
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 300n });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.answer, 250n);

  // ----- round 2: ignore too high values
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 20000n }),
    { message: 'value above maxSubmissionValue 10000' },
  );
  await E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 1000n });
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 3000n });
  await oracleTimer.tick();

  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.is(round2Attempt1.answer, 2000n);
});

test('supersede', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    restartDelay: 1n,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: round 1 is NOT supersedable when 3 submits, meaning it will be ignored
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 300n }),
    {
      message: 'previous round not supersedable',
    },
  );
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.answer, 150n);

  // ----- round 2: oracle C's value from before should have been IGNORED
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 2000n });
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 1000n });
  await oracleTimer.tick();

  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.is(round2Attempt1.answer, 1500n);

  // ----- round 3: oracle C should NOT be able to supersede round 3
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 4, unitPrice: 1000n }),
    { message: 'invalid round to report' },
  );

  try {
    await E(aggregator.creatorFacet).getRoundData(4);
  } catch (error) {
    t.is(error.message, 'No data present');
  }
});

test('interleaved', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    maxSubmissionCount: 3,
    minSubmissionCount: 3, // requires ALL the oracles for consensus in this case
    restartDelay: 1n,
    timeout: 5,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: we now need unanimous submission for a round for it to have consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 300n }),
    {
      message: 'previous round not supersedable',
    },
  );
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await oracleTimer.tick();

  try {
    await E(aggregator.creatorFacet).getRoundData(1);
  } catch (error) {
    t.is(error.message, 'No data present');
  }

  // ----- round 2: interleaved round submission -- just making sure this works
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 300n });
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 2000n });
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 1000n });
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 3, unitPrice: 9000n }),
    { message: 'previous round not supersedable' },
  );
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 3000n }); // assumes oracle C is going for a resubmission
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 3, unitPrice: 5000n });
  await oracleTimer.tick();

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);

  t.is(round1Attempt2.answer, 200n);
  t.is(round2Attempt1.answer, 2000n);

  try {
    await E(aggregator.creatorFacet).getRoundData(3);
  } catch (error) {
    t.is(error.message, 'No data present');
  }

  // ----- round 3/4: complicated supersedable case
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  // round 3 is NOT yet supersedeable (since no value present and not yet timed out), so these should fail
  await t.throwsAsync(
    E(pricePushAdminA).pushPrice({ roundId: 4, unitPrice: 4000n }),
    { message: 'round not accepting submissions' },
  );
  await E(pricePushAdminB).pushPrice({ roundId: 4, unitPrice: 5000n });
  await E(pricePushAdminC).pushPrice({ roundId: 4, unitPrice: 6000n });
  await oracleTimer.tick(); // --- round 3 has NOW timed out, meaning it is now supersedable

  try {
    await E(aggregator.creatorFacet).getRoundData(3);
  } catch (error) {
    t.is(error.message, 'No data present');
  }

  try {
    await E(aggregator.creatorFacet).getRoundData(4);
  } catch (error) {
    t.is(error.message, 'No data present');
  }

  // so NOW we should be able to submit round 4, and round 3 should just be copied from round 2
  await E(pricePushAdminA).pushPrice({ roundId: 4, unitPrice: 4000n });
  await t.throwsAsync(
    E(pricePushAdminB).pushPrice({ roundId: 4, unitPrice: 5000n }),
    { message: /cannot report on previous rounds/ },
  );
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 4, unitPrice: 6000n }),
    { message: /cannot report on previous rounds/ },
  );
  await oracleTimer.tick();

  const round3Attempt3 = await E(aggregator.creatorFacet).getRoundData(3);
  const round4Attempt2 = await E(aggregator.creatorFacet).getRoundData(4);

  t.is(round3Attempt3.answer, 2000n);
  t.is(round4Attempt2.answer, 5000n);

  // ----- round 5: ping-ponging should be possible (although this is an unlikely pernicious case)
  await E(pricePushAdminC).pushPrice({ roundId: 5, unitPrice: 1000n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 6, unitPrice: 1000n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 7, unitPrice: 1000n });

  const round5Attempt1 = await E(aggregator.creatorFacet).getRoundData(5);
  const round6Attempt1 = await E(aggregator.creatorFacet).getRoundData(6);

  t.is(round5Attempt1.answer, 5000n);
  t.is(round6Attempt1.answer, 5000n);
});

test('larger', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    minSubmissionCount: 3,
    restartDelay: 1n,
    timeout: 5,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );
  const pricePushAdminD = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleD',
  );
  const pricePushAdminE = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleE',
  );

  // ----- round 1: usual case
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 1000n }),
    { message: 'previous round not supersedable' },
  );
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminD).pushPrice({ roundId: 3, unitPrice: 3000n }),
    { message: 'invalid round to report' },
  );
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminE).pushPrice({ roundId: 1, unitPrice: 300n });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.answer, 200n);

  // ----- round 2: ignore late arrival
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 600n });
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 500n });
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 3, unitPrice: 1000n }),
    { message: 'previous round not supersedable' },
  );
  await oracleTimer.tick();
  await E(pricePushAdminD).pushPrice({ roundId: 1, unitPrice: 500n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 1000n });
  await oracleTimer.tick();
  await t.throwsAsync(
    E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 700n }),
    // oracle C has already sent round 2
    { message: 'cannot report on previous rounds' },
  );

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.is(round1Attempt2.answer, 250n);
  t.is(round2Attempt1.answer, 600n);
});

test('suggest', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    minSubmissionCount: 3,
    restartDelay: 1n,
    timeout: 5,
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleC',
  );

  // ----- round 1: basic consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });
  await E(pricePushAdminC).pushPrice({ roundId: 1, unitPrice: 300n });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.roundId, 1n);
  t.is(round1Attempt1.answer, 200n);

  // ----- round 2: add a new oracle and confirm the suggested round is correct
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 1000n });

  t.deepEqual(
    await E(aggregator.creatorFacet).oracleRoundState(
      'agorice1priceOracleC',
      1n,
    ),
    {
      eligibleForSpecificRound: false,
      oracleCount: 3,
      latestSubmission: 300n,
      queriedRoundId: 1n,
      roundTimeout: 5,
      startedAt: 1n,
    },
  );

  t.deepEqual(
    await E(aggregator.creatorFacet).oracleRoundState(
      'agorice1priceOracleB',
      0n,
    ),
    {
      eligibleForSpecificRound: false,
      oracleCount: 3,
      latestSubmission: 1000n,
      queriedRoundId: 2n,
      roundTimeout: 5,
      startedAt: 3n,
    },
  );

  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 2000n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushPrice({ roundId: 2, unitPrice: 3000n });

  t.deepEqual(
    await E(aggregator.creatorFacet).oracleRoundState(
      'agorice1priceOracleA',
      0n,
    ),
    {
      eligibleForSpecificRound: true,
      oracleCount: 3,
      latestSubmission: 2000n,
      queriedRoundId: 3n,
      roundTimeout: 0,
      startedAt: 0n, // round 3 hasn't yet started, so it should be zeroed
    },
  );

  // ----- round 3: try using suggested round
  await E(pricePushAdminC).pushPrice({ roundId: 3, unitPrice: 100n });
  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: undefined, unitPrice: 200n });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminB).pushPrice({ roundId: undefined, unitPrice: 300n });

  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.is(round3Attempt1.roundId, 3n);
  t.is(round3Attempt1.answer, 200n);
});

test('decimals', async t => {
  const { zoe } = t.context;

  // unitAmountIn defaults to 1n of the brandIn, link
  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    minSubmissionCount: 1,
    minSubmissionValue: 1n,
    restartDelay: 0n, // let the one oracle run each round
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);
  // ensure non-zero block time
  await oracleTimer.tick();

  const priceAuthority = await E(aggregator.publicFacet).getPriceAuthority();

  const oracle = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );

  const priceSubscriber = await E(aggregator.publicFacet).getSubscriber();
  const eachPrice = subscribeEach(priceSubscriber)[Symbol.asyncIterator]();

  {
    await E(oracle).pushPrice({ roundId: 1, unitPrice: 1n });
    await oracleTimer.tick();
    t.like((await eachPrice.next()).value, {
      amountIn: { brand: link.brand, value: 1n },
      amountOut: { brand: usd.brand, value: 1n },
    });

    const quote = await E(priceAuthority).quoteGiven(
      // link has 6 decimals places but unitAmountIn was 1n,
      // so this is a quote for 0.000123 link
      AmountMath.make(link.brand, 123n),
      usd.brand,
    );
    t.deepEqual(
      quote.quoteAmount.value[0].amountOut,
      // unit price was 1n so the same for USD.
      // since `usd` has 2 places, this is $1.23
      AmountMath.make(usd.brand, 123n),
    );
  }

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.is(round1Attempt1.answer, 1n);

  {
    await E(oracle).pushPrice({ roundId: 2, unitPrice: 100n });
    t.like((await eachPrice.next()).value, {
      amountIn: { brand: link.brand, value: 1n },
      amountOut: { brand: usd.brand, value: 100n },
    });
    const quote = await E(priceAuthority).quoteGiven(
      // link has 6 decimals places but unitAmountIn was 1n,
      // so this is a quote for 0.000123 link
      AmountMath.make(link.brand, 123n),
      usd.brand,
    );
    t.deepEqual(
      quote.quoteAmount.value[0].amountOut,
      // since `usd` has 2 places, this is $123.00
      AmountMath.make(usd.brand, 12300n),
    );
  }
});

test('notifications', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeChainlinkAggregator({
    ...defaultConfig,
    maxSubmissionCount: 1000,
    restartDelay: 1n, // have to alternate to start rounds
  });
  /** @type {{ timer: ManualTimer }} */
  // @ts-expect-error cast
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleA',
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    'agorice1priceOracleB',
  );

  const latestRoundSubscriber = await E(
    aggregator.publicFacet,
  ).getRoundStartNotifier();
  const eachLatestRound = subscribeEach(latestRoundSubscriber)[
    Symbol.asyncIterator
  ]();

  await oracleTimer.tick();
  await E(pricePushAdminA).pushPrice({ roundId: 1, unitPrice: 100n });
  t.deepEqual((await eachLatestRound.next()).value, {
    roundId: 1n,
    startedAt: 1n,
  });
  await E(pricePushAdminB).pushPrice({ roundId: 1, unitPrice: 200n });

  await eventLoopIteration();
  t.deepEqual(
    aggregator.mockStorageRoot.getBody(
      'mockChainStorageRoot.priceAggregator.LINK-USD_price_feed',
    ),
    {
      amountIn: { brand: { iface: 'Alleged: $LINK brand' }, value: 1n },
      amountOut: {
        brand: { iface: 'Alleged: $USD brand' },
        value: 150n, // AVG(100, 200)
      },
      timer: { iface: 'Alleged: ManualTimer' },
      timestamp: 1n,
    },
  );

  await t.throwsAsync(
    E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 1000n }),
    { message: 'round not accepting submissions' },
  );
  // A started last round so fails to start next round
  t.deepEqual(
    // subscribe fresh because the iterator won't advance yet
    (await latestRoundSubscriber.subscribeAfter()).head.value,
    {
      roundId: 1n,
      startedAt: 1n,
    },
  );
  // B gets to start it
  await E(pricePushAdminB).pushPrice({ roundId: 2, unitPrice: 1000n });
  // now it's roundId=2
  t.deepEqual((await eachLatestRound.next()).value, {
    roundId: 2n,
    startedAt: 1n,
  });
  // A joins in
  await E(pricePushAdminA).pushPrice({ roundId: 2, unitPrice: 1000n });
  // writes to storage
  t.deepEqual(
    aggregator.mockStorageRoot.getBody(
      'mockChainStorageRoot.priceAggregator.LINK-USD_price_feed.latestRound',
    ),
    { roundId: 2n, startedAt: 1n },
  );

  await eventLoopIteration();
  t.deepEqual(
    aggregator.mockStorageRoot.getBody(
      'mockChainStorageRoot.priceAggregator.LINK-USD_price_feed',
    ),
    {
      amountIn: { brand: { iface: 'Alleged: $LINK brand' }, value: 1n },
      amountOut: {
        brand: { iface: 'Alleged: $USD brand' },
        value: 1000n, // AVG(1000, 1000)
      },
      timer: { iface: 'Alleged: ManualTimer' },
      timestamp: 1n,
    },
  );

  // A can start again
  await E(pricePushAdminA).pushPrice({ roundId: 3, unitPrice: 1000n });
  t.deepEqual((await eachLatestRound.next()).value, {
    roundId: 3n,
    startedAt: 1n,
  });
  // no new price yet publishable
});

test('storage keys', async t => {
  const { publicFacet } = await t.context.makeChainlinkAggregator(
    defaultConfig,
  );

  t.is(
    await subscriberSubkey(E(publicFacet).getSubscriber()),
    'fake:mockChainStorageRoot.priceAggregator.LINK-USD_price_feed',
  );
});
