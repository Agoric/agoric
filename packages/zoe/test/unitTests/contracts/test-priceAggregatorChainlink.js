// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';

import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { makeZoeKit } from '../../../src/zoeService/zoe.js';
import buildManualTimer from '../../../tools/manualTimer.js';

import '../../../exported.js';
import '../../../src/contracts/exported.js';

/**
 * @callback MakeFakePriceOracle
 * @param {ExecutionContext} t
 * @param {bigint} [valueOut]
 * @returns {Promise<OracleKit & { instance: Instance }>}
 */

/**
 * @typedef {Object} TestContext
 * @property {ZoeService} zoe
 * @property {MakeFakePriceOracle} makeFakePriceOracle
 * @property {(
 *   POLL_INTERVAL: bigint,
 * ) => Promise<PriceAggregatorKit & { instance: Instance }>} makeMedianAggregator
 * @property {Amount} feeAmount
 * @property {IssuerKit} link
 *
 * @typedef {import('ava').ExecutionContext<TestContext>} ExecutionContext
 */

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const oraclePath = `${dirname}/../../../src/contracts/oracle.js`;
const aggregatorPath = `${dirname}/../../../src/contracts/priceAggregatorChainlink.js`;

test.before(
  'setup aggregator and oracles',
  /** @param {ExecutionContext} ot */ async ot => {
    // Outside of tests, we should use the long-lived Zoe on the
    // testnet. In this test, we must create a new Zoe.
    const { admin, vatAdminState } = makeFakeVatAdmin();
    const { zoeService: zoe } = makeZoeKit(admin);

    // Pack the contracts.
    const oracleBundle = await bundleSource(oraclePath);
    const aggregatorBundle = await bundleSource(aggregatorPath);

    // Install the contract on Zoe, getting an installation. We can
    // use this installation to look up the code we installed. Outside
    // of tests, we can also send the installation to someone
    // else, and they can use it to create a new contract instance
    // using the same code.
    vatAdminState.installBundle('b1-oracle', oracleBundle);
    const oracleInstallation = await E(zoe).installBundleID('b1-oracle');
    vatAdminState.installBundle('b1-aggregator', aggregatorBundle);
    const aggregatorInstallation = await E(zoe).installBundleID(
      'b1-aggregator',
    );

    const link = makeIssuerKit('$LINK', AssetKind.NAT);
    const usd = makeIssuerKit('$USD', AssetKind.NAT);

    /** @type {MakeFakePriceOracle} */
    const makeFakePriceOracle = async (t, valueOut = undefined) => {
      /** @type {OracleHandler} */
      const oracleHandler = Far('OracleHandler', {
        async onQuery({ increment }, _fee) {
          valueOut += increment;
          return harden({
            reply: `${valueOut}`,
            requiredFee: AmountMath.makeEmpty(link.brand),
          });
        },
        onError(query, reason) {
          console.error('query', query, 'failed with', reason);
        },
        onReply(_query, _reply) {},
      });

      /** @type {OracleStartFnResult} */
      const startResult = await E(zoe).startInstance(
        oracleInstallation,
        { Fee: link.issuer },
        { oracleDescription: 'myOracle' },
      );
      const creatorFacet = await E(startResult.creatorFacet).initialize({
        oracleHandler,
      });

      return harden({
        ...startResult,
        creatorFacet,
      });
    };

    const quote = makeIssuerKit('quote', AssetKind.SET);
    /** @param {RelativeTime} POLL_INTERVAL */

    const makeChainlinkAggregator = async (
      maxSubmissionCount,
      minSubmissionCount,
      restartDelay,
      timeout,
      description,
      minSubmissionValue,
      maxSubmissionValue,
    ) => {
      const timer = buildManualTimer(() => {});

      const aggregator = await E(zoe).startInstance(
        aggregatorInstallation,
        { In: link.issuer, Out: usd.issuer },
        {
          timer,
          maxSubmissionCount,
          minSubmissionCount,
          restartDelay,
          timeout,
          description,
          minSubmissionValue,
          maxSubmissionValue,
        },
      );
      await E(aggregator.creatorFacet).initializeQuoteMint(quote.mint);
      return aggregator;
    };
    ot.context.zoe = zoe;
    ot.context.makeFakePriceOracle = makeFakePriceOracle;
    ot.context.makeChainlinkAggregator = makeChainlinkAggregator;
  },
);

test('basic', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 2;
  const restartDelay = 5;
  const timeout = 10;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: basic consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '300' });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.roundId, 1n);
  t.deepEqual(round1Attempt1.answer, 200n);

  // ----- round 2: check restartDelay implementation
  // since oracle A initialized the last round, it CANNOT start another round before
  // the restartDelay, which means its submission will be IGNORED. this means the median
  // should ONLY be between the OracleB and C values, which is why it is 25000
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '1000' });
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '2000' });
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '3000' });
  await oracleTimer.tick();

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt2.answer, 200n);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.deepEqual(round2Attempt1.answer, 2500n);

  // ----- round 3: check oracle submission order
  // unlike the previus test, if C initializes, all submissions should be recorded,
  // which means the median will be the expected 5000 here
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 3, data: '5000' });
  await E(pricePushAdminA).pushResult({ roundId: 3, data: '4000' });
  await E(pricePushAdminB).pushResult({ roundId: 3, data: '6000' });
  await oracleTimer.tick();

  const round1Attempt3 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt3.answer, 200n);
  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.deepEqual(round3Attempt1.answer, 5000n);
});

test('timeout', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 2;
  const restartDelay = 2;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: basic consensus w/ ticking: should work EXACTLY the same
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '300' });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.roundId, 1n);
  t.deepEqual(round1Attempt1.answer, 200n);

  // ----- round 2: check restartDelay implementation
  // timeout behavior is, if more ticks pass than the timeout param (5 here), the round is
  // considered "timedOut," at which point, the values are simply copied from the previous round
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '2000' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick(); // --- should time out here
  await E(pricePushAdminC).pushResult({ roundId: 3, data: '1000' });
  await E(pricePushAdminA).pushResult({ roundId: 3, data: '3000' });

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt2.answer, 200n);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.deepEqual(round2Attempt1.answer, 200n);
  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.deepEqual(round3Attempt1.answer, 2000n);
});

test('issue check', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 2;
  const restartDelay = 2;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: ignore too low valyes
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '50' }); // should be IGNORED
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '300' });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.answer, 250n);

  // ----- round 2: ignore too high values
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '20000' });
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '1000' });
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '3000' });
  await oracleTimer.tick();

  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.deepEqual(round2Attempt1.answer, 2000n);
});

test('supersede', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 2;
  const restartDelay = 1;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: round 1 is NOT supersedable when 3 submits, meaning it will be ignored
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '300' });
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.answer, 150n);

  // ----- round 2: oracle C's value from before should have been IGNORED
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '2000' });
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '1000' });
  await oracleTimer.tick();

  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.deepEqual(round2Attempt1.answer, 1500n);

  // ----- round 3: oracle C should NOT be able to supersede round 3
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 4, data: '1000' });

  try {
    await E(aggregator.creatorFacet).getRoundData(4);
  } catch (error) {
    t.deepEqual(error.message, 'No data present');
  }
});

test('interleaved', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 3;
  const minSubmissionCount = 3; // requires ALL the oracles for consensus in this case
  const restartDelay = 1;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: we now need unanimous submission for a round for it to have consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '300' });
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await oracleTimer.tick();

  try {
    await E(aggregator.creatorFacet).getRoundData(1);
  } catch (error) {
    t.deepEqual(error.message, 'No data present');
  }

  // ----- round 2: interleaved round submission -- just making sure this works
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '300' });
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '2000' });
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '1000' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 3, data: '9000' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '3000' }); // assumes oracle C is going for a resubmission
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 3, data: '5000' });
  await oracleTimer.tick();

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);

  t.deepEqual(round1Attempt2.answer, 200n);
  t.deepEqual(round2Attempt1.answer, 2000n);

  try {
    await E(aggregator.creatorFacet).getRoundData(3);
  } catch (error) {
    t.deepEqual(error.message, 'No data present');
  }

  // ----- round 3/4: complicated supersedable case
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  // round 3 is NOT yet supersedeable (since no value present and not yet timed out), so these should fail
  await E(pricePushAdminA).pushResult({ roundId: 4, data: '4000' });
  await E(pricePushAdminB).pushResult({ roundId: 4, data: '5000' });
  await E(pricePushAdminC).pushResult({ roundId: 4, data: '6000' });
  await oracleTimer.tick(); // --- round 3 has NOW timed out, meaning it is now supersedable

  try {
    await E(aggregator.creatorFacet).getRoundData(3);
  } catch (error) {
    t.deepEqual(error.message, 'No data present');
  }

  try {
    await E(aggregator.creatorFacet).getRoundData(4);
  } catch (error) {
    t.deepEqual(error.message, 'No data present');
  }

  // so NOW we should be able to submit round 4, and round 3 should just be copied from round 2
  await E(pricePushAdminA).pushResult({ roundId: 4, data: '4000' });
  await E(pricePushAdminB).pushResult({ roundId: 4, data: '5000' });
  await E(pricePushAdminC).pushResult({ roundId: 4, data: '6000' });
  await oracleTimer.tick();

  const round3Attempt3 = await E(aggregator.creatorFacet).getRoundData(3);
  const round4Attempt2 = await E(aggregator.creatorFacet).getRoundData(4);

  t.deepEqual(round3Attempt3.answer, 2000n);
  t.deepEqual(round4Attempt2.answer, 5000n);

  // ----- round 5: ping-ponging should be possible (although this is an unlikely pernicious case)
  await E(pricePushAdminC).pushResult({ roundId: 5, data: '1000' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 6, data: '1000' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 7, data: '1000' });

  const round5Attempt1 = await E(aggregator.creatorFacet).getRoundData(5);
  const round6Attempt1 = await E(aggregator.creatorFacet).getRoundData(6);

  t.deepEqual(round5Attempt1.answer, 5000n);
  t.deepEqual(round6Attempt1.answer, 5000n);
});

test('larger', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 3;
  const restartDelay = 1;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);
  const priceOracleD = await makeFakePriceOracle(t);
  const priceOracleE = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );
  const pricePushAdminD = await E(aggregator.creatorFacet).initOracle(
    priceOracleD.instance,
  );
  const pricePushAdminE = await E(aggregator.creatorFacet).initOracle(
    priceOracleE.instance,
  );

  // ----- round 1: usual case
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '1000' });
  await oracleTimer.tick();
  await E(pricePushAdminD).pushResult({ roundId: 3, data: '3000' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminE).pushResult({ roundId: 1, data: '300' });

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.answer, 200n);

  // ----- round 2: ignore late arrival
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '600' });
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '500' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 3, data: '1000' });
  await oracleTimer.tick();
  await E(pricePushAdminD).pushResult({ roundId: 1, data: '500' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '1000' });
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '700' }); // this should be IGNORED since oracle C has already sent round 2

  const round1Attempt2 = await E(aggregator.creatorFacet).getRoundData(1);
  const round2Attempt1 = await E(aggregator.creatorFacet).getRoundData(2);
  t.deepEqual(round1Attempt2.answer, 250n);
  t.deepEqual(round2Attempt1.answer, 600n);
});

test('suggest', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const maxSubmissionCount = 1000;
  const minSubmissionCount = 3;
  const restartDelay = 1;
  const timeout = 5;
  const description = 'Chainlink oracles';
  const minSubmissionValue = 100;
  const maxSubmissionValue = 10000;

  const aggregator = await t.context.makeChainlinkAggregator(
    maxSubmissionCount,
    minSubmissionCount,
    restartDelay,
    timeout,
    description,
    minSubmissionValue,
    maxSubmissionValue,
  );
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const priceOracleA = await makeFakePriceOracle(t);
  const priceOracleB = await makeFakePriceOracle(t);
  const priceOracleC = await makeFakePriceOracle(t);

  const pricePushAdminA = await E(aggregator.creatorFacet).initOracle(
    priceOracleA.instance,
  );
  const pricePushAdminB = await E(aggregator.creatorFacet).initOracle(
    priceOracleB.instance,
  );
  const pricePushAdminC = await E(aggregator.creatorFacet).initOracle(
    priceOracleC.instance,
  );

  // ----- round 1: basic consensus
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 1, data: '100' });
  await E(pricePushAdminB).pushResult({ roundId: 1, data: '200' });
  await E(pricePushAdminC).pushResult({ roundId: 1, data: '300' });
  await oracleTimer.tick();

  const round1Attempt1 = await E(aggregator.creatorFacet).getRoundData(1);
  t.deepEqual(round1Attempt1.roundId, 1n);
  t.deepEqual(round1Attempt1.answer, 200n);

  // ----- round 2: add a new oracle and confirm the suggested round is correct
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: 2, data: '1000' });
  const oracleCSuggestion = await E(aggregator.creatorFacet).oracleRoundState(
    priceOracleC.instance,
    1n,
  );

  t.deepEqual(oracleCSuggestion.eligibleForSpecificRound, false);
  t.deepEqual(oracleCSuggestion.queriedRoundId, 1n);
  t.deepEqual(oracleCSuggestion.oracleCount, 3);

  const oracleBSuggestion = await E(aggregator.creatorFacet).oracleRoundState(
    priceOracleB.instance,
    0n,
  );

  t.deepEqual(oracleBSuggestion.eligibleForSpecificRound, false);
  t.deepEqual(oracleBSuggestion.queriedRoundId, 2n);
  t.deepEqual(oracleBSuggestion.oracleCount, 3);

  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: 2, data: '2000' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminC).pushResult({ roundId: 2, data: '3000' });

  const oracleASuggestion = await E(aggregator.creatorFacet).oracleRoundState(
    priceOracleA.instance,
    0n,
  );

  t.deepEqual(oracleASuggestion.eligibleForSpecificRound, true);
  t.deepEqual(oracleASuggestion.queriedRoundId, 3n);
  t.deepEqual(oracleASuggestion.startedAt, 0n); // round 3 hasn't yet started, so it should be zeroed

  // ----- round 3: try using suggested round
  await E(pricePushAdminC).pushResult({ roundId: 3, data: '100' });
  await oracleTimer.tick();
  await E(pricePushAdminA).pushResult({ roundId: undefined, data: '200' });
  await oracleTimer.tick();
  await oracleTimer.tick();
  await E(pricePushAdminB).pushResult({ roundId: undefined, data: '300' });

  const round3Attempt1 = await E(aggregator.creatorFacet).getRoundData(3);
  t.deepEqual(round3Attempt1.roundId, 3n);
  t.deepEqual(round3Attempt1.answer, 200n);
});
