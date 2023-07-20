import '@agoric/governance/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/zoe/src/contracts/exported.js';

import { AmountMath } from '@agoric/ertp';
import { mustMatch } from '@agoric/store';
import {
  M,
  prepareExoClassKit,
  provideDurableMapStore,
} from '@agoric/vat-data';

import { assertAllDefined, makeTracer } from '@agoric/internal';
import {
  atomicRearrange,
  ceilMultiplyBy,
  floorDivideBy,
  makeRatioFromAmounts,
  makeRecorderTopic,
  multiplyRatios,
  ratioGTE,
} from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/captp';
import { observeNotifier } from '@agoric/notifier';

import { makeNatAmountShape } from '../contractSupport.js';
import { preparePriceBook, prepareScaledBidBook } from './offerBook.js';
import {
  isScaledBidPriceHigher,
  makeBrandedRatioPattern,
  priceFrom,
} from './util.js';

const { Fail } = assert;
const { makeEmpty } = AmountMath;

const DEFAULT_DECIMALS = 9;

/**
 * @file The book represents the collateral-specific state of an ongoing
 * auction. It holds the book, the capturedPrice, and the collateralSeat that has
 * the allocation of assets for sale.
 *
 * The book contains orders for the collateral. It holds two kinds of
 * orders:
 *   - Prices express the bidding offer in terms of a Bid amount
 *   - ScaledBids express the offer in terms of a discount (or markup) from the
 *     most recent oracle price.
 *
 * Offers can be added in three ways. 1) When the auction is not active, prices
 * are automatically added to the appropriate collection. When the auction is
 * active, 2) if a new offer is at or above the current price, it will be
 * settled immediately; 2) If the offer is below the current price, it will be
 * added in the appropriate place and settled when the price reaches that level.
 */

const trace = makeTracer('AucBook', true);

/**
 * @typedef {{
 *   maxBuy: Amount<'nat'>
 * } & {
 *   exitAfterBuy?: boolean,
 * } & ({
 *   offerPrice: Ratio,
 * } | {
 *    offerBidScaling: Ratio,
 * })} OfferSpec
 */
/**
 * @param {Brand<'nat'>} bidBrand
 * @param {Brand<'nat'>} collateralBrand
 */
export const makeOfferSpecShape = (bidBrand, collateralBrand) => {
  const bidAmountShape = makeNatAmountShape(bidBrand, 0n);
  const collateralAmountShape = makeNatAmountShape(collateralBrand, 0n);
  return M.splitRecord(
    { maxBuy: collateralAmountShape },
    {
      exitAfterBuy: M.boolean(),
      // xxx should have exactly one of these properties
      offerPrice: makeBrandedRatioPattern(
        bidAmountShape,
        collateralAmountShape,
      ),
      offerBidScaling: makeBrandedRatioPattern(bidAmountShape, bidAmountShape),
    },
  );
};

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

/**
 * @typedef {object} BookDataNotification
 *
 * @property {Ratio         | null}      startPrice identifies the priceAuthority and price
 * @property {Ratio         | null}      currentPriceLevel the price at the current auction tier
 * @property {Amount<'nat'> | null}      startProceedsGoal The proceeds the sellers were targeting to raise
 * @property {Amount<'nat'> | null}      remainingProceedsGoal The remainder of
 *     the proceeds the sellers were targeting to raise
 * @property {Amount<'nat'> | undefined} proceedsRaised The proceeds raised so far in the auction
 * @property {Amount<'nat'>}             startCollateral How much collateral was
 *    available for sale at the start. (If more is deposited later, it'll be
 *    added in.)
 * @property {Amount<'nat'> | null}      collateralAvailable The amount of collateral remaining
 */

/**
 * @typedef {object} ScaledBidData
 *
 * @property {Amount<'nat'>} balance
 * @property {Ratio} bidScaling
 * @property {NatValue} sequence
 * @property {Timestamp} timestamp
 * @property {Amount<'nat'>} wanted
 * @property {boolean} exitAfterBuy
 */

/**
 * @typedef {object} PricedBidData
 *
 * @property {Amount<'nat'>} balance
 * @property {Ratio} price
 * @property {NatValue} sequence
 * @property {Timestamp} timestamp
 * @property {Amount<'nat'>} wanted
 * @property {boolean} exitAfterBuy
 */

/**
 * @typedef {object} BidDataNotification
 *
 * @property {Array<ScaledBidData>} scaledBids
 * @property {Array<PricedBidData>} pricedBids
 */

/**
 * @param {Baggage} baggage
 * @param {ZCF} zcf
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 */
export const prepareAuctionBook = (baggage, zcf, makeRecorderKit) => {
  const bidDataKits = provideDurableMapStore(baggage, 'bidDataKits');
  const makeScaledBidBook = prepareScaledBidBook(baggage, makeRecorderKit);
  const makePriceBook = preparePriceBook(baggage, makeRecorderKit);

  const AuctionBookStateShape = harden({
    collateralBrand: M.any(),
    collateralSeat: M.any(),
    collateralAmountShape: M.any(),
    bidBrand: M.any(),
    bidHoldingSeat: M.any(),
    bidAmountShape: M.any(),
    priceAuthority: M.any(),
    updatingOracleQuote: M.any(),
    bookDataKit: M.any(),
    bidDataKits: M.any(),
    bidsDataKit: M.any(),
    priceBook: M.any(),
    scaledBidBook: M.any(),
    startCollateral: M.any(),
    startProceedsGoal: M.any(),
    capturedPriceForRound: M.any(),
    curAuctionPrice: M.any(),
    remainingProceedsGoal: M.any(),
  });

  const makeAuctionBookKit = prepareExoClassKit(
    baggage,
    'AuctionBook',
    undefined,
    /**
     * @param {Brand<'nat'>} bidBrand
     * @param {Brand<'nat'>} collateralBrand
     * @param {PriceAuthority} pAuthority
     * @param {Array<StorageNode>} nodes
     */
    (bidBrand, collateralBrand, pAuthority, nodes) => {
      assertAllDefined({ bidBrand, collateralBrand, pAuthority });
      const zeroBid = makeEmpty(bidBrand);
      const zeroRatio = makeRatioFromAmounts(
        zeroBid,
        AmountMath.make(collateralBrand, 1n),
      );

      // these don't have to be durable, since we're currently assuming that upgrade
      // from a quiescent state is sufficient. When the auction is quiescent, there
      // may be offers in the book, but these seats will be empty, with all assets
      // returned to the funders.
      const { zcfSeat: collateralSeat } = zcf.makeEmptySeatKit();
      const { zcfSeat: bidHoldingSeat } = zcf.makeEmptySeatKit();
      const [scheduleNode, bidsNode] = nodes;

      const bidAmountShape = makeNatAmountShape(bidBrand, 0n);
      const collateralAmountShape = makeNatAmountShape(collateralBrand, 0n);

      const scaledBidBook = makeScaledBidBook(
        makeBrandedRatioPattern(bidAmountShape, bidAmountShape),
        collateralBrand,
        bidsNode,
      );

      const priceBook = makePriceBook(
        makeBrandedRatioPattern(bidAmountShape, collateralAmountShape),
        collateralBrand,
        bidsNode,
      );

      const bookDataKit = makeRecorderKit(
        scheduleNode,
        /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').TypedMatcher<BookDataNotification>} */ (
          M.any()
        ),
      );
      const bidsDataKit = makeRecorderKit(
        bidsNode,
        /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').TypedMatcher<BidDataNotification>} */ (
          M.any()
        ),
      );

      return {
        collateralBrand,
        collateralSeat,
        collateralAmountShape,
        bidBrand,
        bidHoldingSeat,
        bidAmountShape,

        priceAuthority: pAuthority,
        updatingOracleQuote: zeroRatio,

        bookDataKit,
        bidDataKits,
        bidsDataKit,

        priceBook,
        scaledBidBook,
        /**
         * Set to empty at the end of an auction. It increases when
         * `addAssets()` is called
         */
        startCollateral: AmountMath.makeEmpty(collateralBrand),

        /**
         * Null indicates no limit; empty indicates limit exhausted. It is reset
         * at the end of each auction. It increases when `addAssets()` is called
         * with a goal.
         *
         * @type {Amount<'nat'> | null}
         */
        startProceedsGoal: null,

        /**
         * Assigned a value to capture the price and reset to null at the end of
         * each auction.
         *
         * @type {Ratio | null}
         */
        capturedPriceForRound: null,

        /**
         * non-null during auctions. It is assigned a value at the beginning of
         * each descending step, and reset at the end of the auction.
         *
         * @type {Ratio | null}
         */
        curAuctionPrice: null,

        /**
         * null outside of auctions. during an auction null indicates no limit;
         * empty indicates limit exhausted
         *
         * @type {Amount<'nat'> | null}
         */
        remainingProceedsGoal: null,
      };
    },
    {
      helper: {
        /**
         * remove the key from the appropriate book, indicated by whether the price
         * is defined.
         *
         * @param {string} key
         * @param {Ratio | undefined} price
         */
        removeFromItsBook(key, price) {
          const { priceBook, scaledBidBook } = this.state;
          if (price) {
            priceBook.delete(key);
          } else {
            scaledBidBook.delete(key);
          }
        },

        /**
         * Update the entry in the appropriate book, indicated by whether the price
         * is defined.
         *
         * @param {string} key
         * @param {Amount} collateralSold
         * @param {Ratio | undefined} price
         */
        updateItsBook(key, collateralSold, price) {
          const { priceBook, scaledBidBook } = this.state;
          if (price) {
            priceBook.updateReceived(key, collateralSold);
          } else {
            scaledBidBook.updateReceived(key, collateralSold);
          }
        },

        /**
         * Settle with seat. The caller is responsible for updating the book, if any.
         *
         * @param {ZCFSeat} seat
         * @param {Amount<'nat'>} collateralWanted
         */
        settle(seat, collateralWanted) {
          const { collateralSeat, collateralBrand } = this.state;
          const { Bid: bidAlloc } = seat.getCurrentAllocation();
          const { Collateral: collateralAvailable } =
            collateralSeat.getCurrentAllocation();
          if (!collateralAvailable || AmountMath.isEmpty(collateralAvailable)) {
            return makeEmpty(collateralBrand);
          }

          /** @type {Amount<'nat'>} */
          const initialCollateralTarget = AmountMath.min(
            collateralWanted,
            collateralAvailable,
          );

          const { curAuctionPrice, bidHoldingSeat, remainingProceedsGoal } =
            this.state;
          curAuctionPrice !== null ||
            Fail`auctionPrice must be set before each round`;
          assert(curAuctionPrice);

          const proceedsNeeded = ceilMultiplyBy(
            initialCollateralTarget,
            curAuctionPrice,
          );
          if (AmountMath.isEmpty(proceedsNeeded)) {
            seat.fail(Error('price fell to zero'));
            return makeEmpty(collateralBrand);
          }

          const minProceedsTarget = AmountMath.min(proceedsNeeded, bidAlloc);
          const proceedsLimit = remainingProceedsGoal
            ? AmountMath.min(remainingProceedsGoal, minProceedsTarget)
            : minProceedsTarget;
          const isRaiseLimited =
            remainingProceedsGoal ||
            !AmountMath.isGTE(proceedsLimit, proceedsNeeded);

          const [proceedsTarget, collateralTarget] = isRaiseLimited
            ? [proceedsLimit, floorDivideBy(proceedsLimit, curAuctionPrice)]
            : [minProceedsTarget, initialCollateralTarget];

          const { Collateral } = seat.getProposal().want;
          if (Collateral && AmountMath.isGTE(Collateral, collateralTarget)) {
            seat.exit('unable to satisfy want');
          }

          atomicRearrange(
            zcf,
            harden([
              [collateralSeat, seat, { Collateral: collateralTarget }],
              [seat, bidHoldingSeat, { Bid: proceedsTarget }],
            ]),
          );

          if (remainingProceedsGoal) {
            this.state.remainingProceedsGoal = AmountMath.subtract(
              remainingProceedsGoal,
              proceedsTarget,
            );
          }

          trace('settle', {
            collateralTarget,
            proceedsTarget,
            remainingProceedsGoal: this.state.remainingProceedsGoal,
          });

          return collateralTarget;
        },

        /**
         *  Accept an offer expressed as a price. If the auction is active, attempt to
         *  buy collateral. If any of the offer remains add it to the book.
         *
         *  @param {ZCFSeat} seat
         *  @param {Ratio} price
         *  @param {Amount<'nat'>} maxBuy
         *  @param {Timestamp} timestamp
         *  @param {object} opts
         *  @param {boolean} opts.trySettle
         *  @param {boolean} [opts.exitAfterBuy]
         */
        acceptPriceOffer(
          seat,
          price,
          maxBuy,
          timestamp,
          { trySettle, exitAfterBuy = false },
        ) {
          const { priceBook, curAuctionPrice } = this.state;
          const { helper } = this.facets;
          trace(this.state.collateralBrand, 'acceptPrice');

          const settleIfPriceExists = () => {
            if (curAuctionPrice !== null) {
              return trySettle && ratioGTE(price, curAuctionPrice)
                ? helper.settle(seat, maxBuy)
                : AmountMath.makeEmptyFromAmount(maxBuy);
            } else {
              return AmountMath.makeEmptyFromAmount(maxBuy);
            }
          };
          const collateralSold = settleIfPriceExists();

          const stillWant = AmountMath.subtract(maxBuy, collateralSold);
          if (
            (exitAfterBuy && !AmountMath.isEmpty(collateralSold)) ||
            AmountMath.isEmpty(stillWant) ||
            AmountMath.isEmpty(seat.getCurrentAllocation().Bid)
          ) {
            seat.exit();
          } else {
            trace('added Offer ', price, stillWant.value);
            priceBook.add(seat, price, stillWant, exitAfterBuy, timestamp);
            helper.publishBidData();
          }

          void helper.publishBookData();
        },

        /**
         *  Accept an offer expressed as a discount (or markup). If the auction is
         *  active, attempt to buy collateral. If any of the offer remains add it to
         *  the book.
         *
         *  @param {ZCFSeat} seat
         *  @param {Ratio} bidScaling
         *  @param {Amount<'nat'>} maxBuy
         *  @param {Timestamp} timestamp
         *  @param {object} opts
         *  @param {boolean} opts.trySettle
         *  @param {boolean} [opts.exitAfterBuy]
         */
        acceptScaledBidOffer(
          seat,
          bidScaling,
          maxBuy,
          timestamp,
          { trySettle, exitAfterBuy = false },
        ) {
          trace(this.state.collateralBrand, 'accept scaledBid offer');
          const { curAuctionPrice, capturedPriceForRound, scaledBidBook } =
            this.state;
          const { helper } = this.facets;

          const settleIfPricesDefined = () => {
            if (
              curAuctionPrice &&
              capturedPriceForRound &&
              trySettle &&
              isScaledBidPriceHigher(
                bidScaling,
                curAuctionPrice,
                capturedPriceForRound,
              )
            ) {
              return helper.settle(seat, maxBuy);
            }
            return AmountMath.makeEmptyFromAmount(maxBuy);
          };
          const collateralSold = settleIfPricesDefined();

          const stillWant = AmountMath.subtract(maxBuy, collateralSold);
          if (
            (exitAfterBuy && !AmountMath.isEmpty(collateralSold)) ||
            AmountMath.isEmpty(stillWant) ||
            AmountMath.isEmpty(seat.getCurrentAllocation().Bid)
          ) {
            seat.exit();
          } else {
            scaledBidBook.add(
              seat,
              bidScaling,
              stillWant,
              exitAfterBuy,
              timestamp,
            );
            void helper.publishBidData();
          }

          void helper.publishBookData();
        },
        publishBidData() {
          const { state } = this;
          state.scaledBidBook.publishOffers();
          state.priceBook.publishOffers();
        },
        publishBookData() {
          const { state } = this;

          const allocation = state.collateralSeat.getCurrentAllocation();
          const collateralAvailable =
            'Collateral' in allocation
              ? allocation.Collateral
              : makeEmpty(state.collateralBrand);

          const bookData = harden({
            startPrice: state.capturedPriceForRound,
            startProceedsGoal: state.startProceedsGoal,
            remainingProceedsGoal: state.remainingProceedsGoal,
            proceedsRaised: allocation.Bid,
            startCollateral: state.startCollateral,
            collateralAvailable,
            currentPriceLevel: state.curAuctionPrice,
          });

          return state.bookDataKit.recorder.write(bookData);
        },
      },
      self: {
        /**
         * @param {Amount<'nat'>} assetAmount
         * @param {ZCFSeat} sourceSeat
         * @param {Amount<'nat'>} [proceedsGoal] an amount that the depositor
         *    would like to raise. The auction is requested to not sell more
         *    collateral than required to raise that much. The auctioneer might
         *    sell more if there is more than one supplier of collateral, and
         *    they request inconsistent limits.
         */
        addAssets(assetAmount, sourceSeat, proceedsGoal) {
          const { state, facets } = this;
          trace('add assets', { assetAmount, proceedsGoal });
          const { collateralBrand, collateralSeat, startProceedsGoal } = state;

          // When adding assets, the new ratio of totalCollectionGoal to collateral
          // allocation will be the larger of the existing ratio and the ratio
          // implied by the new deposit. Add the new collateral and raise
          // startProceedsGoal so it's proportional to the new ratio. This can
          // result in raising more Bid than one depositor wanted, but
          // that's better than not selling as much as the other desired.

          const allocation = collateralSeat.getCurrentAllocation();
          const curCollateral =
            'Collateral' in allocation
              ? allocation.Collateral
              : makeEmpty(collateralBrand);

          // when neither proceedsGoal nor startProceedsGoal is defined, we don't need an
          // update and the call immediately below won't invoke this function.
          const calcTargetRatio = () => {
            if (startProceedsGoal && !proceedsGoal) {
              return makeRatioFromAmounts(startProceedsGoal, curCollateral);
            } else if (!startProceedsGoal && proceedsGoal) {
              return makeRatioFromAmounts(proceedsGoal, assetAmount);
            } else if (startProceedsGoal && proceedsGoal) {
              const curRatio = makeRatioFromAmounts(
                startProceedsGoal,
                AmountMath.add(curCollateral, assetAmount),
              );
              const newRatio = makeRatioFromAmounts(proceedsGoal, assetAmount);
              return ratioGTE(newRatio, curRatio) ? newRatio : curRatio;
            }

            throw Fail`calcTargetRatio called with !remainingProceedsGoal && !proceedsGoal`;
          };

          if (proceedsGoal || startProceedsGoal) {
            const nextProceedsGoal = ceilMultiplyBy(
              AmountMath.add(curCollateral, assetAmount),
              calcTargetRatio(),
            );

            if (
              state.remainingProceedsGoal !== null ||
              // XXX use this as an indication that the auction is active
              state.curAuctionPrice !== null
            ) {
              const incrementToGoal = state.startProceedsGoal
                ? AmountMath.subtract(nextProceedsGoal, state.startProceedsGoal)
                : nextProceedsGoal;

              state.remainingProceedsGoal = state.remainingProceedsGoal
                ? AmountMath.add(state.remainingProceedsGoal, incrementToGoal)
                : incrementToGoal;
            }

            state.startProceedsGoal = nextProceedsGoal;
          }

          atomicRearrange(
            zcf,
            harden([[sourceSeat, collateralSeat, { Collateral: assetAmount }]]),
          );

          state.startCollateral = state.startCollateral
            ? AmountMath.add(state.startCollateral, assetAmount)
            : assetAmount;
          void facets.helper.publishBookData();
        },
        /** @type {(reduction: Ratio) => void} */
        settleAtNewRate(reduction) {
          const { state, facets } = this;

          trace(this.state.collateralBrand, 'settleAtNewRate', reduction);
          const { capturedPriceForRound, priceBook, scaledBidBook } = state;
          capturedPriceForRound !== null ||
            Fail`price must be captured before auction starts`;
          assert(capturedPriceForRound);

          state.curAuctionPrice = multiplyRatios(
            reduction,
            capturedPriceForRound,
          );
          // extract after it's set in state
          const { curAuctionPrice } = state;

          const pricedOffers = priceBook.offersAbove(curAuctionPrice);
          const scaledBidOffers = scaledBidBook.offersAbove(reduction);

          const compareValues = (v1, v2) => {
            if (v1 < v2) {
              return -1;
            } else if (v1 === v2) {
              return 0;
            } else {
              return 1;
            }
          };
          trace(`settling`, pricedOffers.length, scaledBidOffers.length);
          // requested price or BidScaling gives no priority beyond specifying which
          // round the order will be serviced in.
          const prioritizedOffers = [...pricedOffers, ...scaledBidOffers].sort(
            (a, b) => compareValues(a[1].seqNum, b[1].seqNum),
          );

          const { remainingProceedsGoal } = state;
          const { helper } = facets;
          for (const [key, seatRecord] of prioritizedOffers) {
            const { seat, price: p, wanted, exitAfterBuy } = seatRecord;
            if (
              remainingProceedsGoal &&
              AmountMath.isEmpty(remainingProceedsGoal)
            ) {
              break;
            } else if (seat.hasExited()) {
              helper.removeFromItsBook(key, p);
            } else {
              const collateralSold = helper.settle(seat, wanted);

              const alloc = seat.getCurrentAllocation();
              if (
                (exitAfterBuy && !AmountMath.isEmpty(collateralSold)) ||
                AmountMath.isEmpty(alloc.Bid) ||
                ('Collateral' in alloc &&
                  AmountMath.isGTE(alloc.Collateral, wanted))
              ) {
                seat.exit();
                helper.removeFromItsBook(key, p);
              } else if (!AmountMath.isGTE(collateralSold, wanted)) {
                helper.updateItsBook(key, collateralSold, p);
              }
            }
          }

          void facets.helper.publishBookData();
          void facets.helper.publishBidData();
        },
        getCurrentPrice() {
          return this.state.curAuctionPrice;
        },
        hasOrders() {
          const { scaledBidBook, priceBook } = this.state;
          return scaledBidBook.hasOrders() || priceBook.hasOrders();
        },
        captureOraclePriceForRound() {
          const { facets, state } = this;

          trace(`capturing oracle price `, state.updatingOracleQuote);
          state.capturedPriceForRound = state.updatingOracleQuote;
          void facets.helper.publishBookData();
        },

        setStartingRate(rate) {
          const { capturedPriceForRound } = this.state;
          capturedPriceForRound !== null ||
            Fail`capturedPriceForRound must be set before each round`;
          assert(capturedPriceForRound);

          trace(
            'set startPrice',
            capturedPriceForRound,
            this.state.startProceedsGoal,
          );
          this.state.remainingProceedsGoal = this.state.startProceedsGoal;
          this.state.curAuctionPrice = multiplyRatios(
            capturedPriceForRound,
            rate,
          );
        },
        /**
         * @param {OfferSpec} offerSpec
         * @param {ZCFSeat} seat
         * @param {boolean} trySettle
         * @param {Timestamp} timestamp
         */
        addOffer(offerSpec, seat, trySettle, timestamp) {
          const { bidBrand, collateralBrand } = this.state;
          const offerSpecShape = makeOfferSpecShape(bidBrand, collateralBrand);

          mustMatch(offerSpec, offerSpecShape);
          const { give } = seat.getProposal();
          const { bidAmountShape } = this.state;
          mustMatch(give.Bid, bidAmountShape, 'give must include "Bid"');

          const { helper } = this.facets;
          const { exitAfterBuy } = offerSpec;
          if ('offerPrice' in offerSpec) {
            return helper.acceptPriceOffer(
              seat,
              offerSpec.offerPrice,
              offerSpec.maxBuy,
              timestamp,
              {
                trySettle,
                exitAfterBuy,
              },
            );
          } else if ('offerBidScaling' in offerSpec) {
            return helper.acceptScaledBidOffer(
              seat,
              offerSpec.offerBidScaling,
              offerSpec.maxBuy,
              timestamp,
              {
                trySettle,
                exitAfterBuy,
              },
            );
          } else {
            throw Fail`Offer was neither a price nor a scaledBid`;
          }
        },
        getSeats() {
          const { collateralSeat, bidHoldingSeat } = this.state;
          return { collateralSeat, bidHoldingSeat };
        },
        exitAllSeats() {
          const { priceBook, scaledBidBook } = this.state;
          priceBook.exitAllSeats();
          scaledBidBook.exitAllSeats();
        },
        endAuction() {
          trace('endAuction');
          const { state, facets } = this;

          state.startCollateral = AmountMath.makeEmpty(state.collateralBrand);

          state.capturedPriceForRound = null;
          state.curAuctionPrice = null;
          state.remainingProceedsGoal = null;
          state.startProceedsGoal = null;
          void facets.helper.publishBookData();
        },
        getDataUpdates() {
          return this.state.bookDataKit.subscriber;
        },
        getPublicTopics() {
          return {
            bookData: makeRecorderTopic(
              'Auction schedule',
              this.state.bookDataKit,
            ),
            bids: makeRecorderTopic('Auction Bids', this.state.bidsDataKit),
          };
        },
      },
    },
    {
      finish: ({ state, facets }) => {
        const { collateralBrand, bidBrand, priceAuthority } = state;
        assertAllDefined({ collateralBrand, bidBrand, priceAuthority });
        void E.when(
          E(collateralBrand).getDisplayInfo(),
          ({ decimalPlaces = DEFAULT_DECIMALS }) => {
            // TODO(#6946) use this to keep a current price that can be published in state.
            const quoteNotifier = E(priceAuthority).makeQuoteNotifier(
              AmountMath.make(collateralBrand, 10n ** BigInt(decimalPlaces)),
              bidBrand,
            );
            void observeNotifier(quoteNotifier, {
              updateState: quote => {
                trace(
                  `BOOK notifier ${priceFrom(quote).numerator.value}/${
                    priceFrom(quote).denominator.value
                  }`,
                );
                state.updatingOracleQuote = priceFrom(quote);
              },
              fail: reason => {
                throw Error(
                  `auction observer of ${collateralBrand} failed: ${reason}`,
                );
              },
              finish: done => {
                throw Error(
                  `auction observer for ${collateralBrand} died: ${done}`,
                );
              },
            });
          },
        );
        void facets.helper.publishBookData();
        void facets.helper.publishBidData();
      },
      stateShape: AuctionBookStateShape,
    },
  );

  /** @type {(...args: Parameters<typeof makeAuctionBookKit>) => ReturnType<typeof makeAuctionBookKit>['self']} */
  const makeAuctionBook = (...args) => makeAuctionBookKit(...args).self;
  return makeAuctionBook;
};
harden(prepareAuctionBook);

/** @typedef {ReturnType<ReturnType<typeof prepareAuctionBook>>} AuctionBook */
