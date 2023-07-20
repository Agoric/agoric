import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath } from '@agoric/ertp';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import {
  makeRatio,
  makeRatioFromAmounts,
  prepareRecorderKitMakers,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeOffer } from '@agoric/zoe/test/unitTests/makeOffer.js';
import { setup } from '@agoric/zoe/test/unitTests/setupBasicMints.js';
import { setupZCFTest } from '@agoric/zoe/test/unitTests/zcf/setupZcfTest.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';

import { makeMockChainStorageRoot } from '../supports.js';
import { prepareAuctionBook } from '../../src/auction/auctionBook.js';

const buildManualPriceAuthority = initialPrice =>
  makeManualPriceAuthority({
    actualBrandIn: initialPrice.denominator.brand,
    actualBrandOut: initialPrice.numerator.brand,
    timer: buildManualTimer(),
    initialPrice,
  });

const setupBasics = async () => {
  const { moolaKit, moola, simoleanKit, simoleans } = setup();

  const { zoe, zcf } = await setupZCFTest();
  await zcf.saveIssuer(moolaKit.issuer, 'Moola');
  await zcf.saveIssuer(simoleanKit.issuer, 'Sim');
  const baggage = makeScalarBigMapStore('zcfBaggage', { durable: true });

  const marshaller = makeFakeBoard().getReadonlyMarshaller();

  const { makeERecorderKit, makeRecorderKit } = prepareRecorderKitMakers(
    baggage,
    marshaller,
  );
  return {
    moolaKit,
    moola,
    simoleanKit,
    simoleans,
    zoe,
    zcf,
    baggage,
    makeERecorderKit,
    makeRecorderKit,
  };
};

const assembleAuctionBook = async basics => {
  const {
    moolaKit,
    moola,
    simoleanKit,
    simoleans,
    zcf,
    baggage,
    makeRecorderKit,
  } = basics;

  const initialPrice = makeRatioFromAmounts(moola(20n), simoleans(100n));
  const pa = buildManualPriceAuthority(initialPrice);
  const makeAuctionBook = prepareAuctionBook(baggage, zcf, makeRecorderKit);
  const mockChainStorage = makeMockChainStorageRoot();

  const book = await makeAuctionBook(moolaKit.brand, simoleanKit.brand, pa, [
    mockChainStorage.makeChildNode('schedule'),
    mockChainStorage.makeChildNode('bids'),
  ]);
  return { pa, book };
};

test('states', async t => {
  const basics = await setupBasics();
  const { moolaKit, simoleanKit } = basics;
  const { book } = await assembleAuctionBook(basics);

  book.captureOraclePriceForRound();
  book.setStartingRate(makeRatio(90n, moolaKit.brand, 100n));
  t.deepEqual(
    book.getCurrentPrice(),
    makeRatioFromAmounts(
      AmountMath.makeEmpty(moolaKit.brand),
      AmountMath.make(simoleanKit.brand, 100n),
    ),
  );
});

const makeSeatWithAssets = async (zoe, zcf, giveAmount, giveKwd, issuerKit) => {
  const payment = issuerKit.mint.mintPayment(giveAmount);
  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    { give: { [giveKwd]: giveAmount } },
    { [giveKwd]: payment },
  );
  return zcfSeat;
};

test('simple addOffer', async t => {
  const basics = await setupBasics();
  const { moolaKit, moola, simoleanKit, simoleans, zcf, zoe } = basics;

  const zcfSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    moola(100n),
    'Bid',
    moolaKit,
  );

  const donorSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    simoleans(500n),
    'Collateral',
    simoleanKit,
  );
  const { pa, book } = await assembleAuctionBook(basics);
  pa.setPrice(makeRatioFromAmounts(moola(11n), simoleans(10n)));
  await eventLoopIteration();

  book.addAssets(AmountMath.make(simoleanKit.brand, 123n), donorSeat);
  book.captureOraclePriceForRound();
  book.setStartingRate(makeRatio(50n, moolaKit.brand, 100n));

  const tenFor100 = makeRatioFromAmounts(moola(10n), simoleans(100n));
  book.addOffer(
    harden({
      offerPrice: tenFor100,
      maxBuy: simoleans(50n),
    }),
    zcfSeat,
    true,
    0n,
  );

  t.true(book.hasOrders());
  book.exitAllSeats();

  t.false(book.hasOrders());
});

test('getOffers to a price limit', async t => {
  const basics = await setupBasics();
  const { moolaKit, moola, simoleanKit, simoleans, zcf, zoe } = basics;
  const { pa, book } = await assembleAuctionBook(basics);

  const donorSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    simoleans(500n),
    'Collateral',
    simoleanKit,
  );
  pa.setPrice(makeRatioFromAmounts(moola(11n), simoleans(10n)));
  await eventLoopIteration();

  book.addAssets(AmountMath.make(simoleanKit.brand, 123n), donorSeat);
  const zcfSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    moola(100n),
    'Bid',
    moolaKit,
  );

  book.captureOraclePriceForRound();
  book.setStartingRate(makeRatio(50n, moolaKit.brand, 100n));

  const tenPercent = makeRatioFromAmounts(moola(10n), moola(100n));
  book.addOffer(
    harden({
      offerBidScaling: tenPercent,
      maxBuy: simoleans(50n),
    }),
    zcfSeat,
    true,
    0n,
  );

  t.true(book.hasOrders());
  book.exitAllSeats();

  t.false(book.hasOrders());
});

test('Bad keyword', async t => {
  const basics = await setupBasics();
  const { moolaKit, moola, simoleanKit, simoleans, zcf, zoe } = basics;
  const { pa, book } = await assembleAuctionBook(basics);

  const donorSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    simoleans(500n),
    'Collateral',
    simoleanKit,
  );

  pa.setPrice(makeRatioFromAmounts(moola(11n), simoleans(10n)));
  await eventLoopIteration();
  book.addAssets(AmountMath.make(simoleanKit.brand, 123n), donorSeat);

  book.captureOraclePriceForRound();
  book.setStartingRate(makeRatio(50n, moolaKit.brand, 100n));

  const zcfSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    moola(100n),
    'NotBid',
    moolaKit,
  );

  t.throws(
    () =>
      book.addOffer(
        harden({
          offerBidScaling: makeRatioFromAmounts(moola(10n), moola(100n)),
          maxBuy: simoleans(50n),
        }),
        zcfSeat,
        true,
        0n,
      ),
    { message: /give must include "Bid".*/ },
  );
});

test('getOffers w/discount', async t => {
  const basics = await setupBasics();
  const { moolaKit, moola, simoleanKit, simoleans, zcf, zoe } = basics;
  const { pa, book } = await assembleAuctionBook(basics);

  const donorSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    simoleans(500n),
    'Collateral',
    simoleanKit,
  );

  pa.setPrice(makeRatioFromAmounts(moola(11n), simoleans(10n)));
  await eventLoopIteration();
  book.addAssets(AmountMath.make(simoleanKit.brand, 123n), donorSeat);

  book.captureOraclePriceForRound();
  book.setStartingRate(makeRatio(50n, moolaKit.brand, 100n));

  const zcfSeat = await makeSeatWithAssets(
    zoe,
    zcf,
    moola(100n),
    'Bid',
    moolaKit,
  );

  const tenPercent = makeRatioFromAmounts(moola(10n), moola(100n));
  book.addOffer(
    harden({
      offerBidScaling: tenPercent,
      maxBuy: simoleans(50n),
    }),
    zcfSeat,
    true,
    0n,
  );

  t.true(book.hasOrders());
});
