import '@agoric/governance/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/zoe/src/contracts/exported.js';

import { AmountMath, AmountShape, BrandShape } from '@agoric/ertp';
import { handleParamGovernance } from '@agoric/governance';
import { BASIS_POINTS, makeTracer } from '@agoric/internal';
import { mustMatch } from '@agoric/store';
import { appendToStoredArray } from '@agoric/store/src/stores/store-utils.js';
import { M, provideDurableMapStore } from '@agoric/vat-data';
import {
  atomicRearrange,
  floorMultiplyBy,
  makeRatio,
  makeRatioFromAmounts,
  natSafeMath,
  provideEmptySeat,
} from '@agoric/zoe/src/contractSupport/index.js';
import { FullProposalShape } from '@agoric/zoe/src/typeGuards.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeNatAmountShape } from '../contractSupport.js';
import { makeBidSpecShape, prepareAuctionBook } from './auctionBook.js';
import { auctioneerParamTypes } from './params.js';
import { makeScheduler } from './scheduler.js';
import { AuctionState } from './util.js';

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

const { Fail, quote: q } = assert;

const trace = makeTracer('Auction', false);

/**
 *
 * @param {NatValue} rate
 * @param {Brand<'nat'>} currencyBrand
 * @param {Brand<'nat'>} collateralBrand
 */
const makeBPRatio = (rate, currencyBrand, collateralBrand = currencyBrand) =>
  makeRatioFromAmounts(
    AmountMath.make(currencyBrand, rate),
    AmountMath.make(collateralBrand, BASIS_POINTS),
  );

/**
 * Return a set of transfers for atomicRearrange() that distribute
 * collateralRaised and currencyRaised proportionally to each seat's deposited
 * amount. Any uneven split should be allocated to the reserve.
 *
 * This function is exported for testability, and is not expected to be used
 * outside the contract below.
 *
 * @param {Amount} collateralRaised
 * @param {Amount} currencyRaised
 * @param {{seat: ZCFSeat, amount: Amount<"nat">}[]} deposits
 * @param {ZCFSeat} collateralSeat
 * @param {ZCFSeat} currencySeat
 * @param {string} collateralKeyword
 * @param {ZCFSeat} reserveSeat
 * @param {Brand} brand
 */
export const distributeProportionalShares = (
  collateralRaised,
  currencyRaised,
  deposits,
  collateralSeat,
  currencySeat,
  collateralKeyword,
  reserveSeat,
  brand,
) => {
  const totalCollDeposited = deposits.reduce((prev, { amount }) => {
    return AmountMath.add(prev, amount);
  }, AmountMath.makeEmpty(brand));

  const collShare = makeRatioFromAmounts(collateralRaised, totalCollDeposited);
  const currShare = makeRatioFromAmounts(currencyRaised, totalCollDeposited);
  /** @type {import('@agoric/zoe/src/contractSupport/atomicTransfer.js').TransferPart[]} */
  const transfers = [];
  let currencyLeft = currencyRaised;
  let collateralLeft = collateralRaised;

  // each depositor gets a share that equals their amount deposited
  // divided by the total deposited multiplied by the currency and
  // collateral being distributed.
  for (const { seat, amount } of deposits.values()) {
    const currPortion = floorMultiplyBy(amount, currShare);
    currencyLeft = AmountMath.subtract(currencyLeft, currPortion);
    const collPortion = floorMultiplyBy(amount, collShare);
    collateralLeft = AmountMath.subtract(collateralLeft, collPortion);
    transfers.push([currencySeat, seat, { Currency: currPortion }]);
    transfers.push([collateralSeat, seat, { Collateral: collPortion }]);
  }

  // TODO(#7117) The leftovers should go to the reserve, and should be visible.
  transfers.push([currencySeat, reserveSeat, { Currency: currencyLeft }]);

  // There will be multiple collaterals, so they can't all use the same keyword
  transfers.push([
    collateralSeat,
    reserveSeat,
    { Collateral: collateralLeft },
    { [collateralKeyword]: collateralLeft },
  ]);
  return transfers;
};

/**
 * @param {ZCF<GovernanceTerms<typeof auctioneerParamTypes> & {
 *   timerService: import('@agoric/time/src/types').TimerService,
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

  /** @type {MapStore<Brand, import('./auctionBook.js').AuctionBook>} */
  const books = provideDurableMapStore(baggage, 'auctionBooks');
  /** @type {MapStore<Brand, Array<{ seat: ZCFSeat, amount: Amount<'nat'>}>>} */
  const deposits = provideDurableMapStore(baggage, 'deposits');
  /** @type {MapStore<Brand, Keyword>} */
  const brandToKeyword = provideDurableMapStore(baggage, 'brandToKeyword');

  const reserveFunds = provideEmptySeat(zcf, baggage, 'collateral');

  const makeAuctionBook = prepareAuctionBook(baggage, zcf);

  /**
   *
   * @param {ZCFSeat} seat
   * @param {Amount<'nat'>} amount
   */
  const addDeposit = (seat, amount) => {
    appendToStoredArray(deposits, amount.brand, { seat, amount });
  };

  // Called "discount" rate even though it can be above or below 100%.
  /** @type {NatValue} */
  let currentDiscountRateBP;

  const distributeProceeds = () => {
    for (const brand of deposits.keys()) {
      const book = books.get(brand);
      const { collateralSeat, currencySeat } = book.getSeats();

      const depositsForBrand = deposits.get(brand);
      if (depositsForBrand.length === 1) {
        // send it all to the one
        const liqSeat = depositsForBrand[0].seat;

        atomicRearrange(
          zcf,
          harden([
            [collateralSeat, liqSeat, collateralSeat.getCurrentAllocation()],
            [currencySeat, liqSeat, currencySeat.getCurrentAllocation()],
          ]),
        );
        liqSeat.exit();
        deposits.set(brand, []);
      } else if (depositsForBrand.length > 1) {
        const collProceeds = collateralSeat.getCurrentAllocation().Collateral;
        const currProceeds = currencySeat.getCurrentAllocation().Currency;
        const transfers = distributeProportionalShares(
          collProceeds,
          currProceeds,
          depositsForBrand,
          collateralSeat,
          currencySeat,
          brandToKeyword.get(brand),
          reserveFunds,
          brand,
        );
        atomicRearrange(zcf, harden(transfers));

        for (const { seat } of depositsForBrand) {
          seat.exit();
        }
        deposits.set(brand, []);
      }
    }
  };

  const { augmentPublicFacet, creatorMixin, makeFarGovernorFacet, params } =
    await handleParamGovernance(
      zcf,
      privateArgs.initialPoserInvitation,
      auctioneerParamTypes,
      privateArgs.storageNode,
      privateArgs.marshaller,
    );

  const tradeEveryBook = () => {
    const bidScalingRatio = makeRatio(
      currentDiscountRateBP,
      brands.Currency,
      BASIS_POINTS,
    );

    for (const book of books.values()) {
      book.settleAtNewRate(bidScalingRatio);
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
      distributeProceeds();
    },
    startRound() {
      trace('startRound');

      currentDiscountRateBP = params.getStartingRate();
      for (const book of books.values()) {
        book.lockOraclePriceForRound();
        book.setStartingRate(
          makeBPRatio(currentDiscountRateBP, brands.Currency),
        );
      }

      tradeEveryBook();
    },
  });

  // @ts-expect-error types are correct. How to convince TS?
  const scheduler = await makeScheduler(driver, timer, params, timerBrand);
  const isActive = () => scheduler.getAuctionState() === AuctionState.ACTIVE;

  /**
   * @param {ZCFSeat} zcfSeat
   */
  const depositOfferHandler = zcfSeat => {
    const { Collateral: collateralAmount } = zcfSeat.getCurrentAllocation();
    const book = books.get(collateralAmount.brand);
    trace(`deposited ${q(collateralAmount)}`);
    book.addAssets(collateralAmount, zcfSeat);
    addDeposit(zcfSeat, collateralAmount);
    return 'deposited';
  };

  const getDepositInvitation = () =>
    zcf.makeInvitation(
      depositOfferHandler,
      'deposit Collateral',
      undefined,
      M.splitRecord({ give: { Collateral: AmountShape } }),
    );

  const bidProposalShape = M.splitRecord(
    {
      give: { Currency: makeNatAmountShape(brands.Currency) },
    },
    {
      want: M.or({ Collateral: AmountShape }, {}),
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
        const bidSpecShape = makeBidSpecShape(brands.Currency, collateralBrand);
        /**
         * @param {ZCFSeat} zcfSeat
         * @param {import('./auctionBook.js').BidSpec} bidSpec
         */
        const newBidHandler = (zcfSeat, bidSpec) => {
          // xxx consider having Zoe guard the offerArgs with a provided shape
          mustMatch(bidSpec, bidSpecShape);
          const auctionBook = books.get(collateralBrand);
          auctionBook.addOffer(bidSpec, zcfSeat, isActive());
          return 'Your bid has been accepted';
        };

        return zcf.makeInvitation(
          newBidHandler,
          'new bid',
          {},
          bidProposalShape,
        );
      },
      getSchedules() {
        return E(scheduler).getSchedule();
      },
      getDepositInvitation,
      ...params,
    }),
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

        const newBook = await makeAuctionBook(
          brands.Currency,
          brand,
          priceAuthority,
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
      ...creatorMixin,
    }),
  );

  return { publicFacet, creatorFacet };
};

/** @typedef {ContractOf<typeof start>} AuctioneerContract */
/** @typedef {AuctioneerContract['publicFacet']} AuctioneerPublicFacet */
/** @typedef {AuctioneerContract['creatorFacet']} AuctioneerCreatorFacet */
// xxx the governance types should handle this automatically
/** @typedef {ReturnType<AuctioneerContract['creatorFacet']['getLimitedCreatorFacet']>} AuctioneerLimitedCreatorFacet */

export const AuctionPFShape = M.remotable('Auction Public Facet');
