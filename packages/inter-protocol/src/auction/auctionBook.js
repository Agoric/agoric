/// <reference types="@agoric/internal/exported" />
/// <reference types="@agoric/governance/exported" />
/// <reference types="@agoric/zoe/exported" />

import { Fail } from '@endo/errors';
import { E } from '@endo/captp';
import { AmountMath, RatioShape } from '@agoric/ertp';
import { mustMatch } from '@agoric/store';
import { M, prepareExoClassKit } from '@agoric/vat-data';

import { assertAllDefined, makeTracer } from '@agoric/internal';
import {
  ceilMultiplyBy,
  makeRatioFromAmounts,
  makeRecorderTopic,
  multiplyRatios,
  ratioGTE,
} from '@agoric/zoe/src/contractSupport/index.js';
import { observeNotifier } from '@agoric/notifier';

import { makeNatAmountShape } from '../contractSupport.js';
import { amountsToSettle } from './auctionMath.js';
import { preparePriceBook, prepareScaledBidBook } from './offerBook.js';
import {
  isScaledBidPriceHigher,
  makeBrandedRatioPattern,
  priceFrom,
} from './util.js';

/**
 * @import {Baggage} from '@agoric/vat-data';
 * @import {PriceAuthority} from '@agoric/zoe/tools/types.js';
 * @import {TypedPattern} from '@agoric/internal';
 */

const { makeEmpty } = AmountMath;

const QUOTE_SCALE = 10n ** 9n;

/**
 * @file The book represents the collateral-specific state of an ongoing
 *   auction. It holds the book, the capturedPrice, and the collateralSeat that
 *   has the allocation of assets for sale.
 *
 *   The book contains orders for the collateral. It holds two kinds of orders:
 *
 *   - Prices express the bidding offer in terms of a Bid amount
 *   - ScaledBids express the offer in terms of a discount (or markup) from the most
 *       recent oracle price.
 *
 *   Offers can be added in three ways. 1) When the auction is not active, prices
 *   are automatically added to the appropriate collection. When the auction is
 *   active, 2) if a new offer is at or above the current price, it will be
 *   settled immediately; 2) If the offer is below the current price, it will be
 *   added in the appropriate place and settled when the price reaches that
 *   level.
 */

const trace = makeTracer('AucBook', true);

/**
 * @typedef {{
 *   maxBuy: Amount<'nat'>;
 * } & {
 *   exitAfterBuy?: boolean;
 * } & (
 *     | {
 *         offerPrice: Ratio;
 *       }
 *     | {
 *         offerBidScaling: Ratio;
 *       }
 *   )} OfferSpec
 */
/**
 * @param {Brand<'nat'>} bidBrand
 * @param {Brand<'nat'>} collateralBrand
 */
export const makeOfferSpecShape = (bidBrand, collateralBrand) => {
  const bidAmountShape = makeNatAmountShape(bidBrand);
  const collateralAmountShape = makeNatAmountShape(collateralBrand);
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

/**
 * @typedef {object} BookDataNotification
 * @property {Ratio | null} startPrice identifies the priceAuthority and price
 * @property {Ratio | null} currentPriceLevel the price at the current auction
 *   tier
 * @property {Amount<'nat'> | null} startProceedsGoal The proceeds the sellers
 *   were targeting to raise
 * @property {Amount<'nat'> | null} remainingProceedsGoal The remainder of the
 *   proceeds the sellers were targeting to raise
 * @property {Amount<'nat'> | undefined} proceedsRaised The proceeds raised so
 *   far in the auction
 * @property {Amount<'nat'>} startCollateral How much collateral was available
 *   for sale at the start. (If more is deposited later, it'll be added in.)
 * @property {Amount<'nat'> | null} collateralAvailable The amount of collateral
 *   remaining
 */

/**
 * @param {Baggage} baggage
 * @param {ZCF} zcf
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 */
export const prepareAuctionBook = (baggage, zcf, makeRecorderKit) => {
  const makeScaledBidBook = prepareScaledBidBook(baggage);
  const makePriceBook = preparePriceBook(baggage);
  // Brands that have or are making active quoteNotifier Observers
  const observedBrands = new Set();

  const AuctionBookStateShape = harden({
    collateralBrand: M.any(),
    collateralSeat: M.any(),
    collateralAmountShape: M.any(),
    bidBrand: M.any(),
    bidHoldingSeat: M.any(),
    bidAmountShape: M.any(),
    priceAuthority: M.any(),
    updatingOracleQuote: M.or(RatioShape, M.null()),
    bookDataKit: M.any(),
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
     * @param {StorageNode} node
     */
    (bidBrand, collateralBrand, pAuthority, node) => {
      assertAllDefined({ bidBrand, collateralBrand, pAuthority });

      // these don't have to be durable, since we're currently assuming that upgrade
      // from a quiescent state is sufficient. When the auction is quiescent, there
      // may be offers in the book, but these seats will be empty, with all assets
      // returned to the funders.
      const { zcfSeat: collateralSeat } = zcf.makeEmptySeatKit();
      const { zcfSeat: bidHoldingSeat } = zcf.makeEmptySeatKit();

      const bidAmountShape = makeNatAmountShape(bidBrand);
      const collateralAmountShape = makeNatAmountShape(collateralBrand);
      const scaledBidBook = makeScaledBidBook(
        makeBrandedRatioPattern(bidAmountShape, bidAmountShape),
        collateralBrand,
      );

      const priceBook = makePriceBook(
        makeBrandedRatioPattern(bidAmountShape, collateralAmountShape),
        collateralBrand,
      );

      const bookDataKit = makeRecorderKit(
        node,
        /** @type {TypedPattern<BookDataNotification>} */ (M.any()),
      );

      return {
        collateralBrand,
        collateralSeat,
        collateralAmountShape,
        bidBrand,
        bidHoldingSeat,
        bidAmountShape,

        priceAuthority: pAuthority,
        updatingOracleQuote: /** @type {Ratio | null} */ (null),

        bookDataKit,

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
         * remove the key from the appropriate book, indicated by whether the
         * price is defined.
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
         * Update the entry in the appropriate book, indicated by whether the
         * price is defined.
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
         * Settle with seat. The caller is responsible for updating the book, if
         * any.
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

          const { curAuctionPrice, bidHoldingSeat, remainingProceedsGoal } =
            this.state;
          curAuctionPrice !== null ||
            Fail`auctionPrice must be set before each round`;
          assert(curAuctionPrice);

          const { proceedsExpected, proceedsTarget, collateralTarget } =
            amountsToSettle(
              {
                bidAlloc,
                collateralWanted,
                collateralAvailable,
                curAuctionPrice,
                remainingProceedsGoal,
              },
              trace,
            );

          if (proceedsExpected === null) {
            seat.fail(Error('price fell to zero'));
            return makeEmpty(collateralBrand);
          }

          // check that the requested amount could be satisfied
          const { Collateral } = seat.getProposal().want;
          if (Collateral && AmountMath.isGTE(Collateral, collateralTarget)) {
            seat.exit('unable to satisfy want');
          }

          zcf.atomicRearrange(
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

          trace('settled', {
            collateralTarget,
            proceedsTarget,
            remainingProceedsGoal: this.state.remainingProceedsGoal,
          });

          return collateralTarget;
        },

        /**
         * Accept an offer expressed as a price. If the auction is active,
         * attempt to buy collateral. If any of the offer remains add it to the
         * book.
         *
         * @param {ZCFSeat} seat
         * @param {Ratio} price
         * @param {Amount<'nat'>} maxBuy
         * @param {object} opts
         * @param {boolean} opts.trySettle
         * @param {boolean} [opts.exitAfterBuy]
         */
        acceptPriceOffer(
          seat,
          price,
          maxBuy,
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
            priceBook.add(seat, price, stillWant, exitAfterBuy);
          }

          void helper.publishBookData();
        },

        /**
         * Accept an offer expressed as a discount (or markup). If the auction
         * is active, attempt to buy collateral. If any of the offer remains add
         * it to the book.
         *
         * @param {ZCFSeat} seat
         * @param {Ratio} bidScaling
         * @param {Amount<'nat'>} maxBuy
         * @param {object} opts
         * @param {boolean} opts.trySettle
         * @param {boolean} [opts.exitAfterBuy]
         */
        acceptScaledBidOffer(
          seat,
          bidScaling,
          maxBuy,
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
            scaledBidBook.add(seat, bidScaling, stillWant, exitAfterBuy);
          }

          void helper.publishBookData();
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
        // Ensure that there is an observer monitoring the quoteNotifier. We
        // assume that all failure modes for quoteNotifier eventually lead to
        // fail or finish.
        ensureQuoteNotifierObserved() {
          const { state, facets } = this;
          const { collateralBrand, bidBrand, priceAuthority } = state;

          if (observedBrands.has(collateralBrand)) {
            return;
          }
          observedBrands.add(collateralBrand);
          trace('observing');

          const quoteNotifierP = E(priceAuthority).makeQuoteNotifier(
            AmountMath.make(collateralBrand, QUOTE_SCALE),
            bidBrand,
          );

          void E.when(
            quoteNotifierP,
            async quoteNotifier =>
              observeNotifier(quoteNotifier, {
                updateState: quote => {
                  trace(
                    `BOOK notifier ${priceFrom(quote).numerator.value}/${
                      priceFrom(quote).denominator.value
                    }`,
                  );
                  state.updatingOracleQuote = priceFrom(quote);
                },
                fail: reason => {
                  trace(
                    `Failure from quoteNotifier (${reason}) setting to null`,
                  );
                  // lack of quote will trigger restart
                  state.updatingOracleQuote = null;
                  observedBrands.delete(collateralBrand);
                },
                finish: done => {
                  trace(
                    `quoteNotifier invoked finish(${done}). setting quote to null`,
                  );
                  // lack of quote will trigger restart
                  state.updatingOracleQuote = null;
                  observedBrands.delete(collateralBrand);
                },
              }),
            e => {
              trace('makeQuoteNotifier failed, resetting', e);
              state.updatingOracleQuote = null;
              observedBrands.delete(collateralBrand);
            },
          );

          void facets.helper.publishBookData();
        },
      },
      self: {
        /**
         * @param {Amount<'nat'>} assetAmount
         * @param {ZCFSeat} sourceSeat
         * @param {Amount<'nat'>} [proceedsGoal] an amount that the depositor
         *   would like to raise. The auction is requested to not sell more
         *   collateral than required to raise that much. The auctioneer might
         *   sell more if there is more than one supplier of collateral, and
         *   they request inconsistent limits.
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

          zcf.atomicRearrange(
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
          if (!capturedPriceForRound) {
            console.error(
              `⚠️No price for ${this.state.collateralBrand}, skipping auction.`,
            );
            return;
          }

          state.curAuctionPrice = multiplyRatios(
            reduction,
            capturedPriceForRound,
          );
          // extract after it's set in state
          const { curAuctionPrice } = state;

          const pricedOffers = priceBook.offersAbove(curAuctionPrice);
          const scaledBidOffers = scaledBidBook.offersAbove(reduction);

          // requested price or BidScaling gives no priority beyond specifying which
          // round the order will be serviced in.
          const prioritizedOffers = [...pricedOffers, ...scaledBidOffers].sort(
            (a, b) => Number(a[1].seqNum - b[1].seqNum),
          );

          trace(
            `settling ${prioritizedOffers.length} offers at ${curAuctionPrice} (priced ${pricedOffers.length}, scaled ${scaledBidOffers.length}) `,
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
          if (!state.updatingOracleQuote) {
            // if the price feed has died (or hasn't been started for this
            // incarnation), (re)start it.
            facets.helper.ensureQuoteNotifierObserved();
            return;
          }

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
         */
        addOffer(offerSpec, seat, trySettle) {
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
          };
        },
      },
    },
    {
      finish: ({ state, facets }) => {
        const { collateralBrand, bidBrand, priceAuthority } = state;
        assertAllDefined({ collateralBrand, bidBrand, priceAuthority });

        facets.helper.ensureQuoteNotifierObserved();
      },
      stateShape: AuctionBookStateShape,
    },
  );

  /**
   * @type {(
   *   ...args: Parameters<typeof makeAuctionBookKit>
   * ) => ReturnType<typeof makeAuctionBookKit>['self']}
   */
  const makeAuctionBook = (...args) => makeAuctionBookKit(...args).self;
  return makeAuctionBook;
};
harden(prepareAuctionBook);

/** @typedef {ReturnType<ReturnType<typeof prepareAuctionBook>>} AuctionBook */
