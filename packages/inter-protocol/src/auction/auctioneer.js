import '@agoric/governance/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/zoe/src/contracts/exported.js';

import { AmountMath, AmountShape, BrandShape } from '@agoric/ertp';
import { handleParamGovernance } from '@agoric/governance';
import { BASIS_POINTS, makeTracer } from '@agoric/internal';
import { prepareDurablePublishKit } from '@agoric/notifier';
import { mustMatch } from '@agoric/store';
import { appendToStoredArray } from '@agoric/store/src/stores/store-utils.js';
import { M, provideDurableMapStore } from '@agoric/vat-data';
import {
  atomicRearrange,
  ceilDivideBy,
  ceilMultiplyBy,
  defineERecorderKit,
  defineRecorderKit,
  floorDivideBy,
  floorMultiplyBy,
  makeRatio,
  makeRatioFromAmounts,
  makeRecorderTopic,
  natSafeMath,
  prepareRecorder,
  provideEmptySeat,
  offerTo,
} from '@agoric/zoe/src/contractSupport/index.js';
import { FullProposalShape } from '@agoric/zoe/src/typeGuards.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import { makeNatAmountShape } from '../contractSupport.js';
import { makeOfferSpecShape, prepareAuctionBook } from './auctionBook.js';
import { auctioneerParamTypes } from './params.js';
import { makeScheduler } from './scheduler.js';
import { AuctionState } from './util.js';

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

const { Fail, quote: q } = assert;
const { add, multiply } = natSafeMath;

const trace = makeTracer('Auction', true);

/**
 * @file
 * In this file, 'Bid' is the name of the ERTP issuer used to purchase
 * collateral from various issuers. It's too confusing to also use Bid as a verb
 * or a description of amounts offered, so we've tried to find alternatives in
 * all those cases.
 */

const MINIMUM_BID_GIVE = 1n;

/**
 * @param {NatValue} rate
 * @param {Brand<'nat'>} bidBrand
 * @param {Brand<'nat'>} collateralBrand
 */
const makeBPRatio = (rate, bidBrand, collateralBrand = bidBrand) =>
  makeRatioFromAmounts(
    AmountMath.make(bidBrand, rate),
    AmountMath.make(collateralBrand, BASIS_POINTS),
  );

/**
 * The auction sold some amount of collateral, and raised a certain amount of
 * Bid. The excess collateral was returned as `unsoldCollateral`. The Bid amount
 * collected from the auction participants is `proceeds`.
 * Return a set of transfers for atomicRearrange() that distribute
 * `unsoldCollateral` and `proceeds` proportionally to each seat's deposited
 * amount. Any uneven split should be allocated to the reserve.
 *
 * @param {Amount} unsoldCollateral
 * @param {Amount} proceeds
 * @param {{seat: ZCFSeat, amount: Amount<'nat'>, goal: Amount<'nat'>}[]} deposits
 * @param {ZCFSeat} collateralSeat
 * @param {ZCFSeat} bidHoldingSeat seat with the Bid allocation to be distributed
 * @param {string} collateralKeyword The Reserve will hold multiple collaterals,
 *      so they need distinct keywords
 * @param {ZCFSeat} reserveSeat
 * @param {Brand} brand
 */
const distributeProportionalShares = (
  unsoldCollateral,
  proceeds,
  deposits,
  collateralSeat,
  bidHoldingSeat,
  collateralKeyword,
  reserveSeat,
  brand,
) => {
  const totalCollDeposited = deposits.reduce((prev, { amount }) => {
    return AmountMath.add(prev, amount);
  }, AmountMath.makeEmpty(brand));

  const collShare = makeRatioFromAmounts(unsoldCollateral, totalCollDeposited);
  const currShare = makeRatioFromAmounts(proceeds, totalCollDeposited);
  /** @type {import('@agoric/zoe/src/contractSupport/atomicTransfer.js').TransferPart[]} */
  const transfers = [];
  let proceedsLeft = proceeds;
  let collateralLeft = unsoldCollateral;

  // each depositor gets a share that equals their amount deposited
  // divided by the total deposited multiplied by the Bid and
  // collateral being distributed.
  for (const { seat, amount } of deposits.values()) {
    const currPortion = floorMultiplyBy(amount, currShare);
    proceedsLeft = AmountMath.subtract(proceedsLeft, currPortion);
    const collPortion = floorMultiplyBy(amount, collShare);
    collateralLeft = AmountMath.subtract(collateralLeft, collPortion);
    transfers.push([bidHoldingSeat, seat, { Bid: currPortion }]);
    transfers.push([collateralSeat, seat, { Collateral: collPortion }]);
  }

  transfers.push([bidHoldingSeat, reserveSeat, { Bid: proceedsLeft }]);

  if (!AmountMath.isEmpty(collateralLeft)) {
    transfers.push([
      collateralSeat,
      reserveSeat,
      { Collateral: collateralLeft },
      { [collateralKeyword]: collateralLeft },
    ]);
  }

  return transfers;
};

/**
 * The auction sold some amount of collateral, and raised a certain amount of
 * Bid. The excess collateral was returned as `unsoldCollateral`. The Bid amount
 * collected from the auction participants is `proceeds`.
 * Return a set of transfers for atomicRearrange() that distribute
 * `unsoldCollateral` and `proceeds` proportionally to each seat's deposited
 * amount. Any uneven split should be allocated to the reserve.
 *
 * This function is exported for testability, and is not expected to be used
 * outside the contract below.
 *
 * Some or all of the depositors may have specified a goal amount.
 *  * A if none did, return collateral and Bid prorated to deposits.
 *  * B if proceeds < proceedsGoal everyone gets prorated amounts of both.
 *  * C if proceeds matches proceedsGoal, everyone gets the Bid they
 *    asked for, plus enough collateral to reach the same proportional payout.
 *    If any depositor's goal amount exceeded their share of the total,
 *    we'll fall back to the first approach.
 *  * D if proceeds > proceedsGoal && all depositors specified a limit,
 *    all depositors get their goal first, then we distribute the
 *    remainder (collateral and Bid) to get the same proportional payout.
 *  * E if proceeds > proceedsGoal && some depositors didn't specify a
 *    limit, depositors who did will get their goal first, then we distribute
 *    the remainder (collateral and Bid) to get the same proportional
 *    payout. If any depositor's goal amount exceeded their share of the
 *    total, we'll fall back as above.
 * Think of it this way: those who specified a limit want as much collateral
 * back as possible, consistent with raising a certain amount of Bid. Those
 * who didn't specify a limit are trying to sell collateral, and would prefer to
 * have as much as possible converted to Bid.
 *
 * @param {Amount<'nat'>} unsoldCollateral
 * @param {Amount<'nat'>} proceeds
 * @param {{seat: ZCFSeat, amount: Amount<'nat'>, goal: Amount<'nat'>}[]} deposits
 * @param {ZCFSeat} collateralSeat
 * @param {ZCFSeat} bidHoldingSeat seat with the Bid allocation to be distributed
 * @param {string} collateralKeyword The Reserve will hold multiple collaterals,
 *      so they need distinct keywords
 * @param {ZCFSeat} reserveSeat
 * @param {Brand} brand
 */
export const distributeProportionalSharesWithLimits = (
  unsoldCollateral,
  proceeds,
  deposits,
  collateralSeat,
  bidHoldingSeat,
  collateralKeyword,
  reserveSeat,
  brand,
) => {
  trace('distributeProportionally with limits');
  // unmatched is the sum of the deposits by those who didn't specify a goal
  const [collDeposited, proceedsGoal, unmatchedDeposits] = deposits.reduce(
    (prev, { amount, goal }) => {
      const nextDeposit = AmountMath.add(prev[0], amount);
      const [proceedsSum, unmatchedSum] = goal
        ? [AmountMath.add(goal, prev[1]), prev[2]]
        : [prev[1], AmountMath.add(prev[2], amount)];
      return [nextDeposit, proceedsSum, unmatchedSum];
    },
    [
      AmountMath.makeEmpty(brand),
      AmountMath.makeEmptyFromAmount(proceeds),
      AmountMath.makeEmpty(brand),
    ],
  );

  const distributeProportionally = () =>
    distributeProportionalShares(
      unsoldCollateral,
      proceeds,
      deposits,
      collateralSeat,
      bidHoldingSeat,
      collateralKeyword,
      reserveSeat,
      brand,
    );

  // cases A and B
  if (
    AmountMath.isEmpty(proceedsGoal) ||
    !AmountMath.isGTE(proceeds, proceedsGoal)
  ) {
    return distributeProportionally();
  }

  // Calculate multiplier for collateral that gives total value each depositor
  // should get.
  //
  // The average price of collateral is proceeds / CollateralSold.
  // The value of Collateral is Price * unsoldCollateral.
  // The overall total value to be distributed is
  //     Proceeds + collateralValue.
  // Each depositor should get bid and collateral that sum to the overall
  // total value multiplied by the ratio of that depositor's collateral
  // deposited to all the collateral deposited.
  //
  // To improve the resolution of the result, we only divide once, so we
  // multiply each depositor's collateral remaining by this expression.
  //
  //        collSold * proceeds  +  proceeds * unsoldCollateral
  //         -----------------------------------------------------------
  //                   collSold * totalCollDeposit
  //
  // If you do the dimension analysis, we'll multiply collateral by a ratio
  // representing Bid/collateral.

  // average value of collateral is collateralSold / proceeds
  const collateralSold = AmountMath.subtract(collDeposited, unsoldCollateral);
  const numeratorValue = add(
    multiply(collateralSold.value, proceeds.value),
    multiply(unsoldCollateral.value, proceeds.value),
  );
  const denominatorValue = multiply(collateralSold.value, collDeposited.value);
  const totalValueRatio = makeRatioFromAmounts(
    AmountMath.make(proceeds.brand, numeratorValue),
    AmountMath.make(brand, denominatorValue),
  );

  const avgPrice = makeRatioFromAmounts(proceeds, collateralSold);

  // Allocate the proceedsGoal amount to depositors who specified it. Add
  // collateral to reach their share. Then see what's left, and allocate it
  // among the remaining depositors. Escape to distributeProportionalShares if
  // anything doesn't work.
  /** @type {import('@agoric/zoe/src/contractSupport/atomicTransfer.js').TransferPart[]} */
  const transfers = [];
  let proceedsLeft = proceeds;
  let collateralLeft = unsoldCollateral;

  // case C
  if (AmountMath.isEqual(proceedsGoal, proceeds)) {
    // each depositor gets a share that equals their amount deposited
    // multiplied by totalValueRatio computed above.

    for (const { seat, amount, goal } of deposits.values()) {
      const depositorValue = floorMultiplyBy(amount, totalValueRatio);
      if (goal === null || AmountMath.isGTE(depositorValue, goal)) {
        let valueNeeded = depositorValue;
        if (goal !== null && !AmountMath.isEmpty(goal)) {
          proceedsLeft = AmountMath.subtract(proceedsLeft, goal);
          transfers.push([bidHoldingSeat, seat, { Bid: goal }]);
          valueNeeded = AmountMath.subtract(depositorValue, goal);
        }

        const collateralToAdd = floorDivideBy(valueNeeded, avgPrice);
        collateralLeft = AmountMath.subtract(collateralLeft, collateralToAdd);
        transfers.push([collateralSeat, seat, { Collateral: collateralToAdd }]);
      } else {
        // This depositor asked for more than their share.
        // ignore `transfers` and distribute everything proportionally.
        return distributeProportionally();
      }
    }
  } else {
    // Cases D & E. Proceeds > proceedsGoal, so those who specified a limit
    // receive at least their target.

    const collateralValue = floorMultiplyBy(unsoldCollateral, avgPrice);
    const totalDistributableValue = AmountMath.add(proceeds, collateralValue);
    // The share for those who specified a limit is proportional to their
    // collateral. ceiling because it's a lower limit on the restrictive branch
    const limitedShare = ceilMultiplyBy(
      AmountMath.subtract(collDeposited, unmatchedDeposits),
      makeRatioFromAmounts(totalDistributableValue, collDeposited),
    );

    // if proceedsGoal + value of unsoldCollateral >= limitedShare then those
    // who specified a limit can get all the excess over their limit in
    // collateral. Others share whatever is left.
    // If proceedsGoal + unsoldCollateral < limitedShare then those who
    // specified share all the collateral, and everyone gets Bid to cover
    // the remainder of their share.
    const limitedGetMaxCollateral = AmountMath.isGTE(
      AmountMath.add(proceedsGoal, collateralValue),
      limitedShare,
    );

    const calcNotLimitedCollateralShare = () => {
      if (limitedGetMaxCollateral) {
        // those who limited will get limitedShare - proceedsGoal in collateral
        const ltdCollatValue = AmountMath.subtract(limitedShare, proceedsGoal);
        const ltdCollatShare = ceilDivideBy(ltdCollatValue, avgPrice);
        // the unlimited will get the remainder of the collateral
        return AmountMath.subtract(unsoldCollateral, ltdCollatShare);
      } else {
        return AmountMath.makeEmpty(brand);
      }
    };
    const notLimitedCollateralShare = calcNotLimitedCollateralShare();

    for (const { seat, amount, goal } of deposits.values()) {
      const depositorValue = floorMultiplyBy(amount, totalValueRatio);

      const addRemainderInBid = collateralAdded => {
        const collateralVal = ceilMultiplyBy(collateralAdded, avgPrice);
        /** @type {Amount<'nat'>} XXX for package depth type resolution */
        const valueNeeded = AmountMath.subtract(depositorValue, collateralVal);

        proceedsLeft = AmountMath.subtract(proceedsLeft, valueNeeded);
        transfers.push([bidHoldingSeat, seat, { Bid: valueNeeded }]);
      };

      if (goal === null || AmountMath.isEmpty(goal)) {
        const collateralShare = floorMultiplyBy(
          notLimitedCollateralShare,
          makeRatioFromAmounts(amount, unmatchedDeposits),
        );
        collateralLeft = AmountMath.subtract(collateralLeft, collateralShare);
        addRemainderInBid(collateralShare);
        transfers.push([collateralSeat, seat, { Collateral: collateralShare }]);
      } else if (limitedGetMaxCollateral) {
        proceedsLeft = AmountMath.subtract(proceedsLeft, goal);
        transfers.push([bidHoldingSeat, seat, { Bid: goal }]);

        const valueNeeded = AmountMath.subtract(depositorValue, goal);
        const collateralToAdd = floorDivideBy(valueNeeded, avgPrice);
        collateralLeft = AmountMath.subtract(collateralLeft, collateralToAdd);
        transfers.push([collateralSeat, seat, { Collateral: collateralToAdd }]);
      } else {
        // There's not enough collateral to completely cover the gap above
        // the proceedsGoal amount, so each depositor gets a proportional share
        // of unsoldCollateral plus enough Bid to reach their share.
        const collateralShare = floorMultiplyBy(
          unsoldCollateral,
          makeRatioFromAmounts(amount, collDeposited),
        );
        collateralLeft = AmountMath.subtract(collateralLeft, collateralShare);
        addRemainderInBid(collateralShare);
        transfers.push([collateralSeat, seat, { Collateral: collateralShare }]);
      }
    }
  }

  transfers.push([bidHoldingSeat, reserveSeat, { Bid: proceedsLeft }]);

  if (!AmountMath.isEmpty(collateralLeft)) {
    transfers.push([
      collateralSeat,
      reserveSeat,
      { Collateral: collateralLeft },
      { [collateralKeyword]: collateralLeft },
    ]);
  }
  return transfers;
};

/**
 * @param {ZCF<GovernanceTerms<typeof auctioneerParamTypes> & {
 *   timerService: import('@agoric/time/src/types').TimerService,
 *   reservePublicFacet: AssetReservePublicFacet,
 *   priceAuthority: PriceAuthority
 * }>} zcf
 * @param {{
 *   initialPoserInvitation: Invitation,
 *   storageNode: StorageNode,
 *   marshaller: Marshaller
 * }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { brands, timerService: timer, priceAuthority } = zcf.getTerms();
  timer || Fail`Timer must be in Auctioneer terms`;
  const timerBrand = await E(timer).getTimerBrand();

  const bidAmountShape = { brand: brands.Bid, value: M.nat() };

  /** @type {MapStore<Brand, import('./auctionBook.js').AuctionBook>} */
  const books = provideDurableMapStore(baggage, 'auctionBooks');
  /** @type {MapStore<Brand, Array<{ seat: ZCFSeat, amount: Amount<'nat'>, goal: Amount<'nat'>}>>} */
  const deposits = provideDurableMapStore(baggage, 'deposits');
  /** @type {MapStore<Brand, Keyword>} */
  const brandToKeyword = provideDurableMapStore(baggage, 'brandToKeyword');

  const reserveSeat = provideEmptySeat(zcf, baggage, 'collateral');

  let bookCounter = 0;

  const makeDurablePublishKit = prepareDurablePublishKit(
    baggage,
    'Auction publish kit',
  );
  const makeRecorder = prepareRecorder(baggage, privateArgs.marshaller);

  const makeRecorderKit = defineRecorderKit({
    makeRecorder,
    makeDurablePublishKit,
  });

  const makeAuctionBook = prepareAuctionBook(baggage, zcf, makeRecorderKit);

  const makeERecorderKit = defineERecorderKit({
    makeRecorder,
    makeDurablePublishKit,
  });
  const scheduleKit = makeERecorderKit(
    E(privateArgs.storageNode).makeChildNode('schedule'),
    /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').TypedMatcher<import('./scheduler.js').ScheduleNotification>} */ (
      M.any()
    ),
  );

  /**
   * @param {ZCFSeat} seat
   * @param {Amount<'nat'>} amount
   * @param {Amount<'nat'> | null} goal
   */
  const addDeposit = (seat, amount, goal = null) => {
    appendToStoredArray(deposits, amount.brand, harden({ seat, amount, goal }));
  };

  const sendToReserve = keyword => {
    const { reservePublicFacet } = zcf.getTerms();

    const amount = reserveSeat.getCurrentAllocation()[keyword];
    if (!amount || AmountMath.isEmpty(amount)) {
      return;
    }

    const invitation = E(reservePublicFacet).makeAddCollateralInvitation();
    // don't wait for a response
    void E.when(invitation, invite => {
      const proposal = { give: { Collateral: amount } };
      void offerTo(
        zcf,
        invite,
        { [keyword]: 'Collateral' },
        proposal,
        reserveSeat,
      );
    });
  };

  // Called "discount" rate even though it can be above or below 100%.
  /** @type {NatValue} */
  let currentDiscountRateBP;

  const distributeProceeds = () => {
    for (const brand of deposits.keys()) {
      const book = books.get(brand);
      const { collateralSeat, bidHoldingSeat } = book.getSeats();

      const depositsForBrand = deposits.get(brand);
      if (depositsForBrand.length === 1) {
        // send it all to the one
        const liqSeat = depositsForBrand[0].seat;

        atomicRearrange(
          zcf,
          harden([
            [collateralSeat, liqSeat, collateralSeat.getCurrentAllocation()],
            [bidHoldingSeat, liqSeat, bidHoldingSeat.getCurrentAllocation()],
          ]),
        );
        liqSeat.exit();
        deposits.set(brand, []);
      } else if (depositsForBrand.length > 1) {
        const collProceeds = collateralSeat.getCurrentAllocation().Collateral;
        const currProceeds =
          bidHoldingSeat.getCurrentAllocation().Bid ||
          AmountMath.makeEmpty(brands.Bid);
        const transfers = distributeProportionalSharesWithLimits(
          collProceeds,
          currProceeds,
          depositsForBrand,
          collateralSeat,
          bidHoldingSeat,
          brandToKeyword.get(brand),
          reserveSeat,
          brand,
        );
        atomicRearrange(zcf, harden(transfers));

        for (const { seat } of depositsForBrand) {
          seat.exit();
        }

        sendToReserve(brandToKeyword.get(brand));
        deposits.set(brand, []);
      }
    }
  };

  const { augmentPublicFacet, makeFarGovernorFacet, params } =
    await handleParamGovernance(
      zcf,
      privateArgs.initialPoserInvitation,
      auctioneerParamTypes,
      privateArgs.storageNode,
      privateArgs.marshaller,
    );

  const tradeEveryBook = () => {
    const offerScalingRatio = makeRatio(
      currentDiscountRateBP,
      brands.Bid,
      BASIS_POINTS,
    );

    for (const book of books.values()) {
      book.settleAtNewRate(offerScalingRatio);
    }
  };

  const driver = Far('Auctioneer', {
    reducePriceAndTrade: () => {
      trace('reducePriceAndTrade');

      natSafeMath.isGTE(currentDiscountRateBP, params.getDiscountStep()) ||
        Fail`rates must fall ${currentDiscountRateBP}`;

      currentDiscountRateBP = natSafeMath.subtract(
        currentDiscountRateBP,
        params.getDiscountStep(),
      );

      tradeEveryBook();
    },
    finalize: () => {
      trace('finalize');

      for (const book of books.values()) {
        book.endAuction();
      }
      distributeProceeds();
    },
    startRound() {
      trace('startRound');

      currentDiscountRateBP = params.getStartingRate();
      for (const book of books.values()) {
        book.setStartingRate(makeBPRatio(currentDiscountRateBP, brands.Bid));
      }

      tradeEveryBook();
    },
    capturePrices() {
      for (const book of books.values()) {
        book.captureOraclePriceForRound();
      }
    },
  });

  // eslint-disable-next-line no-use-before-define
  const isActive = () => scheduler.getAuctionState() === AuctionState.ACTIVE;

  /**
   * @param {ZCFSeat} zcfSeat
   * @param {{ goal: Amount<'nat'>}} offerArgs
   */
  const depositOfferHandler = (zcfSeat, offerArgs) => {
    const goalMatcher = M.or(undefined, { goal: bidAmountShape });
    mustMatch(offerArgs, harden(goalMatcher));
    const { Collateral: collateralAmount } = zcfSeat.getCurrentAllocation();
    const book = books.get(collateralAmount.brand);
    trace(`deposited ${q(collateralAmount)} goal: ${q(offerArgs?.goal)}`);

    book.addAssets(collateralAmount, zcfSeat, offerArgs?.goal);
    addDeposit(zcfSeat, collateralAmount, offerArgs?.goal);
    return 'deposited';
  };

  const makeDepositInvitation = () =>
    zcf.makeInvitation(
      depositOfferHandler,
      'deposit Collateral',
      undefined,
      M.splitRecord({ give: { Collateral: AmountShape } }),
    );

  const biddingProposalShape = M.splitRecord(
    {
      give: {
        Bid: makeNatAmountShape(brands.Bid, MINIMUM_BID_GIVE),
      },
    },
    {
      maxBuy: M.or({ Collateral: AmountShape }, {}),
      exit: FullProposalShape.exit,
    },
  );

  const publicFacet = augmentPublicFacet(
    harden({
      /** @param {Brand<'nat'>} collateralBrand */
      makeBidInvitation(collateralBrand) {
        mustMatch(collateralBrand, BrandShape);
        books.has(collateralBrand) ||
          Fail`No book for brand ${collateralBrand}`;
        const offerSpecShape = makeOfferSpecShape(brands.Bid, collateralBrand);
        /**
         * @param {ZCFSeat} zcfSeat
         * @param {import('./auctionBook.js').OfferSpec} offerSpec
         */
        const newBidHandler = async (zcfSeat, offerSpec) => {
          // xxx consider having Zoe guard the offerArgs with a provided shape
          mustMatch(offerSpec, offerSpecShape);
          const auctionBook = books.get(collateralBrand);
          const timestamp = await E(timer).getCurrentTimestamp();
          auctionBook.addOffer(offerSpec, zcfSeat, isActive(), timestamp);
          return 'Your bid has been accepted';
        };

        return zcf.makeInvitation(
          newBidHandler,
          'new bidding offer',
          {},
          biddingProposalShape,
        );
      },
      getSchedules() {
        // eslint-disable-next-line no-use-before-define
        return scheduler.getSchedule();
      },
      getScheduleUpdates() {
        return scheduleKit.subscriber;
      },
      getBookDataUpdates(brand) {
        return books.get(brand).getDataUpdates();
      },
      getPublicTopics(brand) {
        if (brand) {
          return books.get(brand).getPublicTopics();
        }

        return {
          schedule: makeRecorderTopic('Auction schedule', scheduleKit),
        };
      },
      makeDepositInvitation,
      ...params,
    }),
  );

  const scheduler = await E.when(scheduleKit.recorderP, scheduleRecorder =>
    makeScheduler(
      driver,
      timer,
      // @ts-expect-error types are correct. How to convince TS?
      params,
      timerBrand,
      scheduleRecorder,
      publicFacet.getSubscription(),
    ),
  );

  const creatorFacet = makeFarGovernorFacet(
    Far('Auctioneer creatorFacet', {
      /**
       * @param {Issuer} issuer
       * @param {Keyword} kwd
       */
      async addBrand(issuer, kwd) {
        zcf.assertUniqueKeyword(kwd);
        !baggage.has(kwd) ||
          Fail`cannot add brand with keyword ${kwd}. it's in use`;
        const { brand } = await zcf.saveIssuer(issuer, kwd);

        const bookId = `book${bookCounter}`;
        bookCounter += 1;

        const bookNodeP = E(privateArgs.storageNode).makeChildNode(bookId);
        const [scheduleNode, bidsNode] = await Promise.all([
          bookNodeP,
          E(bookNodeP).makeChildNode('schedule'),
          E(bookNodeP).makeChildNode('bids'),
        ]);

        const newBook = await makeAuctionBook(
          brands.Bid,
          brand,
          priceAuthority,
          [scheduleNode, bidsNode],
        );

        // These three store.init() calls succeed or fail atomically
        deposits.init(brand, harden([]));
        books.init(brand, newBook);
        brandToKeyword.init(brand, kwd);
      },
      /** @returns {Promise<import('./scheduler.js').FullSchedule>} */
      getSchedule() {
        return E(scheduler).getSchedule();
      },
    }),
  );

  return { publicFacet, creatorFacet };
};

/** @typedef {ContractOf<typeof start>} AuctioneerContract */
/** @typedef {AuctioneerContract['publicFacet']} AuctioneerPublicFacet */
/** @typedef {AuctioneerContract['creatorFacet']} AuctioneerCreatorFacet */

export const AuctionPFShape = M.remotable('Auction Public Facet');
