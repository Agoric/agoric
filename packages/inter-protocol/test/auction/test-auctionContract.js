import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import '@agoric/zoe/exported.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { documentStorageSchema } from '@agoric/governance/tools/storageDoc.js';
import { deeplyFulfilledObject, makeTracer } from '@agoric/internal';
import { subscribeEach } from '@agoric/notifier';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { TimeMath } from '@agoric/time';
import { makeScalarMapStore } from '@agoric/vat-data/src/index.js';
import {
  makeRatio,
  makeRatioFromAmounts,
} from '@agoric/zoe/src/contractSupport/index.js';
import { assertPayoutAmount } from '@agoric/zoe/test/zoeTestHelpers.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';
import { providePriceAuthorityRegistry } from '@agoric/zoe/tools/priceAuthorityRegistry.js';
import { E } from '@endo/eventual-send';

import {
  setupReserve,
  startAuctioneer,
} from '../../src/proposals/econ-behaviors.js';
import { startEconomicCommittee } from '../../src/proposals/startEconCommittee.js';
import { subscriptionTracker } from '../metrics.js';
import {
  installPuppetGovernance,
  produceInstallations,
  setupBootstrap,
  setUpZoeForTest,
  withAmountUtils,
} from '../supports.js';
import { setUpInstallations } from './tools.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

/**
 * @typedef {Record<string, any> & {
 * bid: IssuerKit & import('../supports.js').AmountUtils,
 * collateral: IssuerKit & import('../supports.js').AmountUtils,
 * zoe: ZoeService,
 * }} Context
 */

/**
 * @typedef {Awaited<ReturnType<subscriptionTracker<import('../../src/auction/auctionBook.js').BookDataNotification>>>} BookDataTracker
 */

const trace = makeTracer('Test AuctContract', false);

const defaultParams = {
  StartFrequency: 40n,
  ClockStep: 5n,
  StartingRate: 10500n,
  LowestRate: 4500n,
  DiscountStep: 2000n,
  AuctionStartDelay: 10n,
  PriceLockPeriod: 3n,
};

const makeTestContext = async () => {
  const { zoe, feeMintAccessP } = await setUpZoeForTest();

  const bid = withAmountUtils(makeIssuerKit('Bid'));
  const collateral = withAmountUtils(makeIssuerKit('Collateral'));

  const installs = await deeplyFulfilledObject(setUpInstallations(zoe));
  const feeMintAccess = await feeMintAccessP;

  trace('makeContext');
  return {
    zoe: await zoe,
    installs,
    run: bid,
    bid,
    feeMintAccess,
    collateral,
  };
};

test.before(async t => {
  t.context = await makeTestContext();
});

/**
 * @param {import('ava').ExecutionContext<Awaited<ReturnType<makeTestContext>>>} t
 * @param {*} params
 */
export const setupServices = async (t, params = defaultParams) => {
  const {
    zoe,
    electorateTerms = { committeeName: 'The Cabal', committeeSize: 1 },
    collateral,
  } = t.context;

  const timer = buildManualTimer();
  await timer.advanceTo(140n);

  const space = await setupBootstrap(t, timer);
  installPuppetGovernance(zoe, space.installation.produce);

  // @ts-expect-error not all installs are needed for auctioneer.
  produceInstallations(space, t.context.installs);

  await startEconomicCommittee(space, electorateTerms);

  await setupReserve(space);
  const { creatorFacet: reserveCF } = await space.consume.reserveKit;

  void E(reserveCF).addIssuer(collateral.issuer, 'Collateral');

  const paBaggage = makeScalarMapStore();
  const { priceAuthority, adminFacet: registry } =
    providePriceAuthorityRegistry(paBaggage);
  space.produce.priceAuthority.resolve(priceAuthority);

  await startAuctioneer(space, { auctionParams: params });
  return { space, timer, registry };
};

/**
 * @param {import('ava').ExecutionContext<Awaited<ReturnType<makeTestContext>>>} t
 * @param {any} [params]
 */
const makeAuctionDriver = async (t, params = defaultParams) => {
  const { zoe, bid } = t.context;
  /** @type {MapStore<Brand, { setPrice: (r: Ratio) => void }>} */
  const priceAuthorities = makeScalarMapStore();

  const { space, timer, registry } = await setupServices(t, params);
  // Each driver needs its own mockChainStorage to avoid state pollution between tests
  const mockChainStorage =
    /** @type {import('@agoric/internal/src/storage-test-utils.js').MockChainStorageRoot} */ (
      await space.consume.chainStorage
    );
  const { auctioneerKit: auctioneerKitP, reserveKit } = space.consume;
  const auctioneerKit = await auctioneerKitP;

  const { publicFacet, creatorFacet } = auctioneerKit;

  /**
   * @param {Amount<'nat'>} giveBid
   * @param {Amount<'nat'>} wantCollateral
   * @param {Ratio} [discount]
   * @param {ExitRule | { onBuy: true }} [exitRule]
   * @param {Amount<'nat'>} [proposalWant]
   */
  const bidForCollateralSeat = async (
    giveBid,
    wantCollateral,
    discount = undefined,
    exitRule = undefined,
    proposalWant = undefined,
  ) => {
    // await so any rejection is in this async function instead of Zoe's offer() wrapper
    const bidInvitation = await E(publicFacet).makeBidInvitation(
      wantCollateral.brand,
    );
    const rawProposal = {
      give: { Bid: giveBid },
      // IF we had multiples, the buyer could express an offer-safe want.
      // want: { Collateral: wantCollateral },
    };
    if (proposalWant) {
      rawProposal.want = { Collateral: proposalWant };
    }

    if (exitRule && !('onBuy' in exitRule)) {
      rawProposal.exit = exitRule;
    }
    const proposal = harden(rawProposal);

    const payment = harden({
      Bid: bid.mint.mintPayment(giveBid),
    });
    const offerArgs =
      discount && discount.numerator.brand === discount.denominator.brand
        ? { maxBuy: wantCollateral, offerBidScaling: discount }
        : {
            maxBuy: wantCollateral,
            offerPrice:
              discount || harden(makeRatioFromAmounts(giveBid, wantCollateral)),
          };
    if (exitRule && 'onBuy' in exitRule) {
      offerArgs.exitAfterBuy = true;
    }

    return E(zoe).offer(bidInvitation, proposal, payment, harden(offerArgs));
  };

  const depositCollateral = async (collateralAmount, issuerKit, offerArgs) => {
    const collateralPayment = E(issuerKit.mint).mintPayment(
      harden(collateralAmount),
    );
    const seat = E(zoe).offer(
      E(publicFacet).makeDepositInvitation(),
      harden({
        give: { Collateral: collateralAmount },
      }),
      harden({ Collateral: collateralPayment }),
      offerArgs,
    );
    await eventLoopIteration();

    return seat;
  };

  /** @type {MapStore<Brand,BookDataTracker>} */
  const bookDataTrackers = makeScalarMapStore('trackers');

  /**
   * @param {Brand} brand
   * @returns {Promise<BookDataTracker>}
   */
  const getBookDataTracker = async brand => {
    if (bookDataTrackers.has(brand)) {
      return bookDataTrackers.get(brand);
    }

    /** @type {Promise<BookDataTracker>} */
    const tracker = E.when(
      E(publicFacet).getBookDataUpdates(brand),
      subscription => subscriptionTracker(t, subscribeEach(subscription)),
    );
    // @ts-expect-error I don't know what it wants.
    bookDataTrackers.init(brand, tracker);
    return tracker;
  };

  /**
   * @param {Pick<IssuerKit<'nat'>, 'brand' | 'issuer' | 'mint'>} issuerKit
   * @param {Amount<'nat'>} collateralAmount
   * @param {{ goal: Amount<'nat'> }} [limit]
   */
  const setupCollateralAuction = async (issuerKit, collateralAmount, limit) => {
    const collateralBrand = collateralAmount.brand;

    const pa = makeManualPriceAuthority({
      actualBrandIn: collateralBrand,
      actualBrandOut: bid.brand,
      timer,
      initialPrice: makeRatio(100n, bid.brand, 100n, collateralBrand),
    });
    priceAuthorities.init(collateralBrand, pa);
    await registry.registerPriceAuthority(pa, collateralBrand, bid.brand, true);

    await E(creatorFacet).addBrand(
      issuerKit.issuer,
      collateralBrand.getAllegedName(),
    );

    /** @type {BookDataTracker} */
    const tracker = await getBookDataTracker(collateralBrand);
    await tracker.assertInitial({
      collateralAvailable: AmountMath.makeEmpty(collateralBrand),
      currentPriceLevel: null,
      proceedsRaised: undefined,
      remainingProceedsGoal: null,
      startCollateral: AmountMath.makeEmpty(collateralBrand),
      startPrice: null,
      startProceedsGoal: null,
    });

    return depositCollateral(collateralAmount, issuerKit, limit);
  };

  return {
    mockChainStorage,
    publicFacet,
    creatorFacet,

    /** @type {(subpath: string) => object} */
    getStorageChildBody(subpath) {
      return mockChainStorage.getBody(
        `mockChainStorageRoot.thisPsm.${subpath}`,
      );
    },

    bidForCollateralPayouts(giveBid, wantCollateral, discount) {
      const seat = bidForCollateralSeat(giveBid, wantCollateral, discount);
      return E(seat).getPayouts();
    },
    bidForCollateralSeat(giveBid, wantCollateral, discount, exit, pWant) {
      return bidForCollateralSeat(
        giveBid,
        wantCollateral,
        discount,
        exit,
        pWant,
      );
    },
    setupCollateralAuction,
    async advanceTo(time, wait) {
      await timer.advanceTo(time);
      if (wait) {
        await eventLoopIteration();
      }
    },
    async updatePriceAuthority(newPrice) {
      priceAuthorities.get(newPrice.denominator.brand).setPrice(newPrice);
      await eventLoopIteration();
    },
    depositCollateral,
    getSchedule() {
      return E(publicFacet).getSchedules();
    },
    getTimerService() {
      return timer;
    },
    getScheduleTracker() {
      return E.when(E(publicFacet).getScheduleUpdates(), subscription =>
        subscriptionTracker(t, subscribeEach(subscription)),
      );
    },
    getBookDataTracker(brand) {
      return E.when(E(publicFacet).getBookDataUpdates(brand), subscription =>
        subscriptionTracker(t, subscribeEach(subscription)),
      );
    },
    getReserveBalance(keyword) {
      const reserveCF = E.get(reserveKit).creatorFacet;
      return E.get(E(reserveCF).getAllocations())[keyword];
    },
  };
};

const assertPayouts = async (
  t,
  seat,
  bid,
  collateral,
  bidValue,
  collateralValue,
) => {
  const { Collateral: collateralPayout, Bid: bidPayout } = await E(
    seat,
  ).getPayouts();

  if (!bidPayout) {
    bidValue === 0n ||
      t.fail(
        `bidValue must be zero when no bid is paid out ${collateralValue}`,
      );
  } else {
    await assertPayoutAmount(
      t,
      bid.issuer,
      bidPayout,
      bid.make(bidValue),
      'bid payout',
    );
  }

  if (!collateralPayout) {
    collateralValue === 0n ||
      t.fail(
        `collateralValue must be zero when no collateral is paid out ${collateralValue}`,
      );
  } else {
    await assertPayoutAmount(
      t,
      collateral.issuer,
      collateralPayout,
      collateral.make(collateralValue),
      'collateral payout',
    );
  }
};

test.serial('priced bid recorded', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));

  const seat = await driver.bidForCollateralSeat(
    bid.make(100n),
    collateral.make(200n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
});

test.serial('discount bid recorded', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));

  const seat = await driver.bidForCollateralSeat(
    bid.make(20n),
    collateral.make(200n),
    makeRatioFromAmounts(bid.make(10n), bid.make(100n)),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
});

test.serial('priced bid settled', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );
  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);

  await driver.advanceTo(170n);

  const seat = await driver.bidForCollateralSeat(
    bid.make(250n),
    collateral.make(200n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');

  await assertPayouts(t, seat, bid, collateral, 19n, 200n);
});

test.serial('discount bid settled', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);
  await driver.advanceTo(170n);

  const seat = await driver.bidForCollateralSeat(
    bid.make(250n),
    collateral.make(200n),
    makeRatioFromAmounts(bid.make(120n), bid.make(100n)),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  await driver.advanceTo(180n);

  // 250 - 200 * (1.1 * 1.05)
  await assertPayouts(t, seat, bid, collateral, 250n - 231n, 200n);
});

test.serial('Excessive want in proposal', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);
  await driver.advanceTo(170n);

  const seat = await driver.bidForCollateralSeat(
    bid.make(250n),
    collateral.make(5000n),
    makeRatioFromAmounts(bid.make(120n), bid.make(100n)),
    undefined,
    collateral.make(5000n),
  );
  await t.throwsAsync(() => E(seat).getOfferResult(), {
    message: 'seat has been exited',
  });

  const update = await E(E(seat).getExitSubscriber()).getUpdateSince();
  t.is(update.value, 'unable to satisfy want');
  await assertPayouts(t, seat, bid, collateral, 250n, 0n);
});

test.serial('discount bid exit onBuy', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);
  await driver.advanceTo(170n);

  const seat = await driver.bidForCollateralSeat(
    bid.make(2000n),
    collateral.make(200n),
    makeRatioFromAmounts(bid.make(120n), bid.make(100n)),
    { onBuy: true },
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  await driver.advanceTo(180n);

  // 250 - 200 * (1.1 * 1.05)
  await assertPayouts(t, seat, bid, collateral, 2000n - 231n, 200n);
});

// serial because dynamicConfig is shared across tests
test.serial('priced bid insufficient collateral added', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(20n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);
  t.is(schedules.nextAuctionSchedule?.endTime.absValue, 185n);
  await driver.advanceTo(167n);

  const seat = await driver.bidForCollateralSeat(
    bid.make(240n),
    collateral.make(200n),
    undefined,
    { afterDeadline: { timer: driver.getTimerService(), deadline: 185n } },
  );
  await driver.advanceTo(170n);
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(175n);
  await driver.advanceTo(180n);
  await driver.advanceTo(185n);

  t.true(await E(seat).hasExited());

  //  240n - 20n * (115n / 100n)
  await assertPayouts(t, seat, bid, collateral, 216n, 20n);
});

// serial because dynamicConfig is shared across tests
test.serial('priced bid recorded then settled with price drop', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const seat = await driver.bidForCollateralSeat(
    bid.make(116n),
    collateral.make(100n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');

  await driver.advanceTo(170n);
  const schedules = await driver.getSchedule();
  assert(schedules.liveAuctionSchedule);
  t.is(schedules.liveAuctionSchedule.startTime.absValue, 170n);
  t.is(schedules.liveAuctionSchedule.endTime.absValue, 185n);

  await driver.advanceTo(184n);
  await driver.advanceTo(185n);
  t.true(await E(seat).hasExited());
  await driver.advanceTo(190n);

  await assertPayouts(t, seat, bid, collateral, 0n, 100n);
});

test.serial('priced bid settled auction price below bid', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(1000n));
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);
  await driver.advanceTo(170n);

  // overbid for current price
  const seat = await driver.bidForCollateralSeat(
    bid.make(2240n),
    collateral.make(200n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');

  t.true(await E(seat).hasExited());
  await driver.advanceTo(185n);

  await assertPayouts(t, seat, bid, collateral, 2009n, 200n);
});

// serial because dynamicConfig is shared across tests
test.serial('complete auction liquidator gets proceeds', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    // 1.1 * 1.05 * 200
    bid.make(231n),
    collateral.make(200n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  t.true(await E(seat).hasExited());

  await assertPayouts(t, seat, bid, collateral, 0n, 200n);

  await assertPayouts(t, liqSeat, bid, collateral, 231n, 800n);
});

// serial because dynamicConfig is shared across tests
test.serial('complete auction limit on amountRaised', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(500n),
    { goal: AmountMath.make(bid.brand, 200n) },
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(200n),
    collateral.make(173n),
    makeRatioFromAmounts(bid.make(150n), bid.make(100n)),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  t.true(await E(seat).hasExited());

  await assertPayouts(t, seat, bid, collateral, 0n, 173n);

  await assertPayouts(t, liqSeat, bid, collateral, 200n, 327n);
});

// serial because dynamicConfig is shared across tests
test.serial('multiple Depositors, not all assets are sold', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeatA = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  const liqSeatB = await driver.depositCollateral(
    collateral.make(500n),
    collateral,
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeatA).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(1200n),
    collateral.make(1000n),
  );

  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  t.true(await E(seat).hasExited());

  // 1500 Collateral was put up for auction by  two bidders (1000 and 500). One
  // bidder offered 1200 bid for 1000 collateral. So one seller gets 66% of
  // the proceeds, and the other 33%. The price authority quote was 110, and the
  // goods were sold in the first auction round at 105%. So the proceeds were
  // 1155. The bidder gets 45 bid back. The two sellers split 1155 and the
  // 500 returned collateral. The auctioneer sets the remainder aside.
  await assertPayouts(t, seat, bid, collateral, 45n, 1000n);
  await assertPayouts(t, liqSeatA, bid, collateral, 770n, 333n);
  await assertPayouts(t, liqSeatB, bid, collateral, 385n, 166n);

  const balance = await driver.getReserveBalance('Collateral');
  t.deepEqual(balance, collateral.make(1n));
});

// serial because dynamicConfig is shared across tests
test.serial('multiple Depositors, with goal', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeatA = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  const liqSeatB = await driver.depositCollateral(
    collateral.make(500n),
    collateral,
    { goal: bid.make(300n) },
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeatA).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(1500n),
    collateral.make(1000n),
  );

  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  await E(seat).tryExit();
  t.true(await E(seat).hasExited());

  // 1500 Collateral was put up for auction by two depositors (1000 and 500), so
  // one seller gets 66% of the proceeds, and the other 33%. The price authority
  // quote was 1.1, and the goods were sold in the first auction round at 105%.
  // At those rates, 900 pays for 799 collateral. The sellers pro-rate 900 and
  // the returned collateral. The auctioneer sets the remainder aside.
  await assertPayouts(t, seat, bid, collateral, 600n, 779n);
  await assertPayouts(t, liqSeatA, bid, collateral, 600n, 480n);
  await assertPayouts(t, liqSeatB, bid, collateral, 300n, 239n);

  const balance = await driver.getReserveBalance('Collateral');
  t.deepEqual(balance, collateral.make(2n));
});

// serial because dynamicConfig is shared across tests
test.serial('multiple Depositors, exit onBuy', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeatA = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  const liqSeatB = await driver.depositCollateral(
    collateral.make(500n),
    collateral,
    { goal: bid.make(300n) },
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeatA).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(1500n),
    collateral.make(1000n),
    undefined,
    { onBuy: true },
  );

  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n);
  await eventLoopIteration();
  await driver.advanceTo(175n);
  await eventLoopIteration();
  await driver.advanceTo(180n);
  await eventLoopIteration();
  await driver.advanceTo(185n);
  await eventLoopIteration();

  t.true(await E(seat).hasExited());

  // 1500 Collateral was put up for auction by two depositors (1000 and 500), so
  // one seller gets 66% of the proceeds, and the other 33%. The price authority
  // quote was 1.1, and the goods were sold in the first auction round at 105%.
  // At those rates, 900 pays for 799 collateral. The sellers pro-rate 900 and
  // the returned collateral. The auctioneer sets the remainder aside.
  await assertPayouts(t, seat, bid, collateral, 600n, 779n);
  await assertPayouts(t, liqSeatA, bid, collateral, 600n, 480n);
  await assertPayouts(t, liqSeatB, bid, collateral, 300n, 239n);

  const balance = await driver.getReserveBalance('Collateral');
  t.deepEqual(balance, collateral.make(2n));
});

// serial because dynamicConfig is shared across tests
test.serial('multiple Depositors, all assets are sold', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeatA = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  const liqSeatB = await driver.depositCollateral(
    collateral.make(500n),
    collateral,
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeatA).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(1800n),
    collateral.make(1500n),
  );

  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  t.true(await E(seat).hasExited());

  // 1500 Collateral was put up for auction by  two bidders (1000 and 500). One
  // bidder offered 1800 bid for all the collateral. The sellers get 66%
  // and 33% of the proceeds. The price authority quote was 110, and the goods
  // were sold in the first auction round at 105%. So the proceeds were
  // 1733 The bidder gets 67 bid back. The two sellers split 1733. The
  // auctioneer sets the remainder aside.
  await assertPayouts(t, seat, bid, collateral, 67n, 1500n);
  await assertPayouts(t, liqSeatA, bid, collateral, 1155n, 0n);
  await assertPayouts(t, liqSeatB, bid, collateral, 577n, 0n);
});

// serial because dynamicConfig is shared across tests
test.serial('onDemand exit', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(100n),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const exitingSeat = await driver.bidForCollateralSeat(
    bid.make(250n),
    collateral.make(200n),
    undefined,
    { onDemand: null },
  );

  t.is(await E(exitingSeat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(exitingSeat).hasExited());

  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n, 'wait');
  await driver.advanceTo(180n, 'wait');
  await driver.advanceTo(185n, 'wait');

  t.false(await E(exitingSeat).hasExited());

  await E(exitingSeat).tryExit();
  t.true(await E(exitingSeat).hasExited());

  await assertPayouts(t, exitingSeat, bid, collateral, 134n, 100n);
  await assertPayouts(t, liqSeat, bid, collateral, 116n, 0n);
});

// serial because dynamicConfig is shared across tests
test.serial('onDeadline exit, with chainStorage RPC snapshot', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);
  const timerBrand = await E(driver.getTimerService()).getTimerBrand();

  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(100n),
  );

  /** @type {BookDataTracker} */
  const bookTracker = await driver.getBookDataTracker(collateral.brand);
  await bookTracker.assertInitial({
    collateralAvailable: collateral.make(100n),
    currentPriceLevel: null,
    proceedsRaised: undefined,
    remainingProceedsGoal: null,
    startCollateral: collateral.make(100n),
    startPrice: null,
    startProceedsGoal: null,
  });

  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const scheduleTracker = await driver.getScheduleTracker();
  await scheduleTracker.assertInitial({
    activeStartTime: null,
    nextDescendingStepTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
    nextStartTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
  });

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  await scheduleTracker.assertChange({
    activeStartTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
    nextStartTime: { absValue: 210n },
  });

  const exitingSeat = await driver.bidForCollateralSeat(
    bid.make(250n),
    collateral.make(200n),
    undefined,
    { afterDeadline: { timer: driver.getTimerService(), deadline: 185n } },
  );

  t.is(await E(exitingSeat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(exitingSeat).hasExited());

  await driver.bidForCollateralSeat(
    bid.make(200n),
    collateral.make(250n),
    undefined,
  );
  driver.bidForCollateralSeat(
    bid.make(20n),
    collateral.make(200n),
    makeRatioFromAmounts(bid.make(50n), bid.make(100n)),
  );
  driver.bidForCollateralSeat(
    bid.make(40n),
    collateral.make(2000n),
    makeRatioFromAmounts(bid.make(80n), bid.make(100n)),
  );

  await bookTracker.assertChange({
    startPrice: makeRatioFromAmounts(
      bid.make(1_100_000_000n),
      collateral.make(1_000_000_000n),
    ),
  });

  await driver.advanceTo(170n, 'wait');
  await bookTracker.assertChange({});
  await bookTracker.assertChange({});

  await bookTracker.assertChange({
    collateralAvailable: { value: 0n },
    currentPriceLevel: makeRatioFromAmounts(
      bid.make(11_550_000_000_000n),
      collateral.make(10_000_000_000_000n),
    ),
  });
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 175n },
  });

  await driver.advanceTo(175n, 'wait');
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 180n },
  });
  await bookTracker.assertChange({});
  await bookTracker.assertChange({});
  await bookTracker.assertChange({
    currentPriceLevel: { numerator: { value: 9_350_000_000_000n } },
  });

  const doc = {
    node: 'auction',
    owner: 'the auctioneer contract',
    pattern: 'mockChainStorageRoot.auction',
    replacement: 'published.auction',
  };
  await documentStorageSchema(t, driver.mockChainStorage, doc);

  await driver.advanceTo(180n, 'wait');
  await bookTracker.assertChange({
    currentPriceLevel: { numerator: { value: 7_150_000_000_000n } },
  });
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 185n },
  });

  await driver.advanceTo(185n, 'wait');
  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: 210n },
  });
  await bookTracker.assertChange({
    currentPriceLevel: { numerator: { value: 4_950_000_000_000n } },
  });

  t.true(await E(exitingSeat).hasExited());

  await assertPayouts(t, exitingSeat, bid, collateral, 134n, 100n);
  await assertPayouts(t, liqSeat, bid, collateral, 116n, 0n);

  await driver.advanceTo(186n, 'wait');
  await scheduleTracker.assertNoUpdate();
  await bookTracker.assertNoUpdate();

  await driver.advanceTo(210n, 'wait');
  await scheduleTracker.assertChange({
    activeStartTime: TimeMath.coerceTimestampRecord(210n, timerBrand),
    nextDescendingStepTime: { absValue: 215n },
    nextStartTime: { absValue: 250n },
  });
  await bookTracker.assertChange({
    startCollateral: { value: 0n },
    currentPriceLevel: null,
    startPrice: null,
  });
  await bookTracker.assertChange({
    startPrice: makeRatioFromAmounts(
      bid.make(1_100_000_000n),
      collateral.make(1_000_000_000n),
    ),
  });
  await bookTracker.assertChange({
    currentPriceLevel: makeRatioFromAmounts(
      bid.make(11_550_000_000_000n),
      collateral.make(10_000_000_000_000n),
    ),
  });
});

test.serial('add assets to open auction', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);
  const timerBrand = await E(driver.getTimerService()).getTimerBrand();

  // One seller deposits 1000 collateral
  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const bookTracker = await driver.getBookDataTracker(collateral.brand);
  await bookTracker.assertInitial({
    collateralAvailable: collateral.make(1000n),
    currentPriceLevel: null,
    proceedsRaised: undefined,
    remainingProceedsGoal: null,
    startCollateral: collateral.make(1000n),
    startPrice: null,
    startProceedsGoal: null,
  });
  const scheduleTracker = await driver.getScheduleTracker();
  await scheduleTracker.assertInitial({
    activeStartTime: null,
    nextDescendingStepTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
    nextStartTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
  });

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  // bids for half of 1000 + 2000 collateral.
  const bidderSeat1 = await driver.bidForCollateralSeat(
    // 1.1 * 1.05 * 500
    bid.make(578n),
    collateral.make(500n),
  );
  t.is(await E(bidderSeat1).getOfferResult(), 'Your bid has been accepted');

  await bookTracker.assertChange({});

  // price lock period before auction start
  await driver.advanceTo(167n);
  await bookTracker.assertChange({
    startPrice: makeRatioFromAmounts(
      bid.make(1_100_000_000n),
      collateral.make(1_000_000_000n),
    ),
  });
  await scheduleTracker.assertChange({
    activeStartTime: TimeMath.coerceTimestampRecord(170n, timerBrand),
    nextStartTime: { absValue: 210n },
  });

  await driver.advanceTo(170n);
  await bookTracker.assertChange({
    collateralAvailable: { value: 500n },
    currentPriceLevel: makeRatioFromAmounts(
      bid.make(11_550_000_000_000n),
      collateral.make(10_000_000_000_000n),
    ),
  });
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 175n },
  });
  // bidder gets collateral
  await assertPayouts(t, bidderSeat1, bid, collateral, 0n, 500n);

  // seller deposits 2000
  const liqSeat2 = await driver.depositCollateral(
    collateral.make(2000n),
    collateral,
    { goal: bid.make(1000n) },
  );
  const resultL2 = await E(liqSeat2).getOfferResult();
  t.is(resultL2, 'deposited');
  await bookTracker.assertChange({
    collateralAvailable: { value: 2500n },
    startCollateral: { value: 3000n },
    startProceedsGoal: bid.make(1250n),
    remainingProceedsGoal: bid.make(1250n),
  });

  await driver.advanceTo(180n);
  await bookTracker.assertChange({
    currentPriceLevel: { numerator: { value: 9_350_000_000_000n } },
  });
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 185n },
  });

  await driver.advanceTo(185n);
  await bookTracker.assertChange({
    currentPriceLevel: { numerator: { value: 7_150_000_000_000n } },
  });

  await driver.advanceTo(190n);
  await bookTracker.assertChange({
    currentPriceLevel: null,
    startPrice: null,
    startCollateral: { value: 0n },
    remainingProceedsGoal: null,
    startProceedsGoal: null,
  });
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 210n },
    activeStartTime: null,
  });

  // sellers split proceeds and refund 2:1
  await assertPayouts(t, liqSeat, bid, collateral, 192n, 833n);
  await assertPayouts(t, liqSeat2, bid, collateral, 385n, 1666n);
});

// Collateral quote is 1.1.  Asset quote is .25.  1000 C, and 500 A available.
// Prices will start with a 1.05 multiplier, and fall by .2 at each of 4 steps,
// so prices will be 1.05, .85, .65, .45, and .25.
//
// serial because dynamicConfig is shared across tests
test.serial('multiple collaterals', async t => {
  const { collateral, bid } = t.context;

  const params = defaultParams;
  params.LowestRate = 2500n;

  const driver = await makeAuctionDriver(t, params);
  const asset = withAmountUtils(makeIssuerKit('Asset'));

  const collatLiqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(1000n),
  );
  const assetLiqSeat = await driver.setupCollateralAuction(
    asset,
    asset.make(500n),
  );

  t.is(await E(collatLiqSeat).getOfferResult(), 'deposited');
  t.is(await E(assetLiqSeat).getOfferResult(), 'deposited');

  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(25n), asset.make(100n)),
  );

  // offers 290 for up to 300 at 1.1 * .875, so will trigger at the first discount
  const price = makeRatioFromAmounts(bid.make(950n), collateral.make(1000n));
  const bidderSeat1C = await driver.bidForCollateralSeat(
    bid.make(265n),
    collateral.make(300n),
    price,
  );
  t.is(await E(bidderSeat1C).getOfferResult(), 'Your bid has been accepted');
  driver.getTimerService().getCurrentTimestamp();

  // offers up to 500 for 2000 at 1.1 * 75%, so will trigger at second discount step
  const scale2C = makeRatioFromAmounts(bid.make(75n), bid.make(100n));
  const bidderSeat2C = await driver.bidForCollateralSeat(
    bid.make(500n),
    collateral.make(2000n),
    scale2C,
  );
  t.is(await E(bidderSeat2C).getOfferResult(), 'Your bid has been accepted');

  // offers 50 for 200 at .25 * 50% discount, so triggered at third step
  const scale1A = makeRatioFromAmounts(bid.make(50n), bid.make(100n));
  const bidderSeat1A = await driver.bidForCollateralSeat(
    bid.make(23n),
    asset.make(200n),
    scale1A,
  );
  t.is(await E(bidderSeat1A).getOfferResult(), 'Your bid has been accepted');

  // offers 100 for 300 at .25 * 33%, so triggered at fourth step
  const price2A = makeRatioFromAmounts(bid.make(100n), asset.make(1000n));
  const bidderSeat2A = await driver.bidForCollateralSeat(
    bid.make(19n),
    asset.make(300n),
    price2A,
  );
  t.is(await E(bidderSeat2A).getOfferResult(), 'Your bid has been accepted');

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 170n);

  await driver.advanceTo(150n);
  await driver.advanceTo(170n, 'wait');
  await driver.advanceTo(175n);

  t.true(await E(bidderSeat1C).hasExited());

  await assertPayouts(t, bidderSeat1C, bid, collateral, 0n, 283n);
  t.false(await E(bidderSeat2C).hasExited());

  await driver.advanceTo(180n);
  t.true(await E(bidderSeat2C).hasExited());
  await assertPayouts(t, bidderSeat2C, bid, collateral, 0n, 699n);
  t.false(await E(bidderSeat1A).hasExited());

  await driver.advanceTo(185n);
  t.true(await E(bidderSeat1A).hasExited());
  await assertPayouts(t, bidderSeat1A, bid, asset, 0n, 200n);
  t.false(await E(bidderSeat2A).hasExited());

  await driver.advanceTo(190n);
  t.true(await E(bidderSeat2A).hasExited());
  await assertPayouts(t, bidderSeat2A, bid, asset, 0n, 300n);
});

// serial because dynamicConfig is shared across tests
test.serial('multiple bidders at one auction step', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const { nextAuctionSchedule } = await driver.getSchedule();

  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(300n),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  assert(nextAuctionSchedule?.startTime.absValue);
  let now = nextAuctionSchedule.startTime.absValue - 3n;
  await driver.advanceTo(now);
  const seat1 = await driver.bidForCollateralSeat(
    // 1.1 * 1.05 * 200
    bid.make(231n),
    collateral.make(200n),
  );
  t.is(await E(seat1).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat1).hasExited());

  // higher bid, later
  const seat2 = await driver.bidForCollateralSeat(
    // 1.1 * 1.05 * 200
    bid.make(232n),
    collateral.make(200n),
  );

  // regression test for getCurrentAllocation() bug
  await driver.bidForCollateralSeat(bid.make(210n), collateral.make(200n));

  assert(nextAuctionSchedule.startTime.absValue);
  now = nextAuctionSchedule.startTime.absValue;
  await driver.advanceTo(now, 'wait');

  now += 5n;
  await driver.advanceTo(now, 'wait');

  now += 5n;
  await driver.advanceTo(now, 'wait');

  now += 5n;
  await driver.advanceTo(now, 'wait');

  now += 5n;
  await driver.advanceTo(now, 'wait');

  t.true(await E(seat1).hasExited());
  t.false(await E(seat2).hasExited());
  await E(seat2).tryExit();

  t.true(await E(seat2).hasExited());

  await assertPayouts(t, seat1, bid, collateral, 0n, 200n);
  await assertPayouts(t, seat2, bid, collateral, 116n, 100n);

  t.true(await E(liqSeat).hasExited());
  await assertPayouts(t, liqSeat, bid, collateral, 347n, 0n);
});

test('deposit unregistered collateral', async t => {
  const asset = withAmountUtils(makeIssuerKit('Asset'));
  const driver = await makeAuctionDriver(t);

  await t.throwsAsync(() => driver.depositCollateral(asset.make(500n), asset), {
    message:
      /key "\[Alleged: Asset brand\]" not found in collection "brandToIssuerRecord"/,
  });
});

test('bid on unregistered collateral', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await t.throwsAsync(
    driver.bidForCollateralSeat(
      bid.make(100n),
      collateral.make(200n), // re-use this brand, which isn't collateral
    ),
    { message: 'No book for brand "[Alleged: Collateral brand]"' },
  );
});

test('bid zero', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  await driver.setupCollateralAuction(collateral, collateral.make(300n));

  await t.throwsAsync(
    driver.bidForCollateralSeat(
      bid.make(0n),
      collateral.make(200n), // re-use this brand, which isn't collateral
    ),
    {
      message:
        '"new bidding offer" proposal: give: Bid: value: "[0n]" - Must be >= "[1n]"',
    },
  );
});

test.serial('time jumps forward', async t => {
  const { collateral, bid } = t.context;
  const driver = await makeAuctionDriver(t);

  const depositCollateral = 1000n;
  const bidOffered = 200n;
  const liqSeat = await driver.setupCollateralAuction(
    collateral,
    collateral.make(depositCollateral),
  );
  await driver.updatePriceAuthority(
    makeRatioFromAmounts(bid.make(11n), collateral.make(10n)),
  );

  const result = await E(liqSeat).getOfferResult();
  t.is(result, 'deposited');

  await driver.advanceTo(167n);
  const seat = await driver.bidForCollateralSeat(
    bid.make(bidOffered),
    collateral.make(300n),
  );
  t.is(await E(seat).getOfferResult(), 'Your bid has been accepted');
  t.false(await E(seat).hasExited());

  await driver.advanceTo(170n, 'wait');

  // jump past end of auction
  await driver.advanceTo(1500n, 'wait');

  t.false(await E(seat).hasExited());
  await E(seat).tryExit();
  t.true(await E(seat).hasExited());

  await assertPayouts(t, seat, bid, collateral, bidOffered, 0n);
  await assertPayouts(t, liqSeat, bid, collateral, 0n, depositCollateral);

  const schedules = await driver.getSchedule();
  t.is(schedules.nextAuctionSchedule?.startTime.absValue, 1570n);
  t.is(schedules.liveAuctionSchedule?.startTime.absValue, 1530n);
  t.is(schedules.liveAuctionSchedule?.endTime.absValue, 1550n);
});
