// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import { getCopyBagEntries } from '@agoric/store';
import buildManualTimer from '../../../tools/manualTimer.js';
import { eventLoopIteration } from '../../../tools/eventLoopIteration.js';

import { setup } from '../setupBasicMints.js';
import { installationPFromSource } from '../installFromSource.js';
import {
  assertPayoutDeposit,
  assertPayoutAmount,
} from '../../zoeTestHelpers.js';
import { makeFakePriceAuthority } from '../../../tools/fakePriceAuthority.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const fundedCallSpread = `${dirname}/../../../src/contracts/callSpread/fundedCallSpread.js`;
const pricedCallSpread = `${dirname}/../../../src/contracts/callSpread/pricedCallSpread.js`;
const simpleExchange = `${dirname}/../../../src/contracts/simpleExchange.js`;

const makeTestPriceAuthority = (brands, priceList, timer) =>
  makeFakePriceAuthority({
    actualBrandIn: brands.get('simoleans'),
    actualBrandOut: brands.get('moola'),
    priceList,
    timer,
  });

// Underlying is in Simoleans. Collateral, strikePrice and Payout are in bucks.
// AmountValue is in Moola. The price oracle takes an amount in Underlying, and
// gives the value in Moola.
test('fundedCallSpread below Strike1', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    fundedCallSpread,
  );

  // Alice will create and fund a call spread contract, and give the invitations
  // to Bob and Carol. Bob and Carol will promptly schedule collection of funds.
  // The spread will then mature at a low price, and carol will get paid.

  // Setup Alice
  const aliceBucksPayment = bucksMint.mintPayment(bucks(300n));
  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [54, 20, 35, 15, 28],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });

  // Alice creates a fundedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
    Quote: await E(priceAuthority).getQuoteIssuer(
      brands.get('simoleans'),
      brands.get('moola'),
    ),
  });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { customDetails } = await E(zoe).getInvitationDetails(
    creatorInvitation,
  );
  assert(typeof customDetails === 'object');
  const longOptionAmount = customDetails.longAmount;
  const shortOptionAmount = customDetails.shortAmount;

  const aliceProposal = harden({
    want: { LongOption: longOptionAmount, ShortOption: shortOptionAmount },
    give: { Collateral: bucks(300n) },
  });
  const alicePayments = { Collateral: aliceBucksPayment };
  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );
  /** @type {Record<string, Invitation>} */
  // @ts-expect-error Payment is an Invitation
  const { LongOption: bobLongOption, ShortOption: carolShortOption } =
    await aliceSeat.getPayouts();

  const bobOptionSeat = await E(zoe).offer(bobLongOption);
  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(0n),
  );

  const carolOptionSeat = await E(zoe).offer(carolShortOption);
  const carolPayout = carolOptionSeat.getPayout('Collateral');
  const carolDeposit = assertPayoutDeposit(
    t,
    carolPayout,
    carolBucksPurse,
    bucks(300n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await Promise.all([bobDeposit, carolDeposit]);
});

// Underlying is in Simoleans. Collateral, strikePrice and Payout are in bucks.
// AmountValue is in Moola.
test('fundedCallSpread above Strike2', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    fundedCallSpread,
  );

  // Alice will create and fund a call spread contract, and give the invitations
  // to Bob and Carol. Bob and Carol will promptly schedule collection of funds.
  // The spread will then mature at a high price, and bob will get paid.

  // Setup Alice
  const aliceBucksPayment = bucksMint.mintPayment(bucks(300n));
  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [20, 55],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });

  // Alice creates a fundedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
  });

  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { customDetails } = await E(zoe).getInvitationDetails(
    creatorInvitation,
  );
  assert(typeof customDetails === 'object');
  const longOptionAmount = customDetails.longAmount;
  const shortOptionAmount = customDetails.shortAmount;

  const aliceProposal = harden({
    want: { LongOption: longOptionAmount, ShortOption: shortOptionAmount },
    give: { Collateral: bucks(300n) },
  });
  const alicePayments = { Collateral: aliceBucksPayment };
  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );
  /** @type {Record<string, Invitation>} */
  // @ts-expect-error Payment is an Invitation
  const { LongOption: bobLongOption, ShortOption: carolShortOption } =
    await aliceSeat.getPayouts();

  const bobOptionSeat = await E(zoe).offer(bobLongOption);
  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(300n),
  );

  const carolOptionSeat = await E(zoe).offer(carolShortOption);
  const carolPayout = carolOptionSeat.getPayout('Collateral');
  const carolDeposit = assertPayoutDeposit(
    t,
    carolPayout,
    carolBucksPurse,
    bucks(0n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await Promise.all([bobDeposit, carolDeposit]);
});

// Underlying is in Simoleans. Collateral, strikePrice and Payout are in bucks.
// AmountValue is in Moola.
test('fundedCallSpread, mid-strike', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    fundedCallSpread,
  );

  // Alice will create and fund a call spread contract, and give the invitations
  // to Bob and Carol. Bob and Carol will promptly schedule collection of funds.
  // The spread will then mature, and both will get paid.

  // Setup Alice
  const aliceBucksPayment = bucksMint.mintPayment(bucks(300n));
  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [20, 45],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });
  // Alice creates a fundedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
  });

  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { customDetails } = await E(zoe).getInvitationDetails(
    creatorInvitation,
  );
  assert(typeof customDetails === 'object');
  const longOptionAmount = customDetails.longAmount;
  const shortOptionAmount = customDetails.shortAmount;

  const aliceProposal = harden({
    want: { LongOption: longOptionAmount, ShortOption: shortOptionAmount },
    give: { Collateral: bucks(300n) },
  });
  const alicePayments = { Collateral: aliceBucksPayment };
  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );
  /** @type {Record<string, Invitation>} */
  // @ts-expect-error Payment is an Invitation
  const { LongOption: bobLongOption, ShortOption: carolShortOption } =
    await aliceSeat.getPayouts();

  const bobOptionSeat = await E(zoe).offer(bobLongOption);
  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(225n),
  );

  const carolOptionSeat = await E(zoe).offer(carolShortOption);
  const carolPayout = carolOptionSeat.getPayout('Collateral');
  const carolDeposit = assertPayoutDeposit(
    t,
    carolPayout,
    carolBucksPurse,
    bucks(75n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await Promise.all([bobDeposit, carolDeposit]);
});

// Underlying is in Simoleans. Collateral, strikePrice and Payout are in bucks.
// AmountValue is in Moola. Carol waits to collect until after settlement
test('fundedCallSpread, late exercise', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    fundedCallSpread,
  );

  // Alice will create and fund a call spread contract, and give the invitations
  // to Bob and Carol. Bob and Carol will promptly schedule collection of funds.
  // The spread will then mature, and both will get paid.

  // Setup Alice
  const aliceBucksPayment = bucksMint.mintPayment(bucks(300n));
  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [20, 45],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });

  // Alice creates a fundedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
  });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { customDetails } = await E(zoe).getInvitationDetails(
    creatorInvitation,
  );
  assert(typeof customDetails === 'object');
  const aliceProposal = harden({
    want: {
      LongOption: customDetails.longAmount,
      ShortOption: customDetails.shortAmount,
    },
    give: { Collateral: bucks(300n) },
  });
  const alicePayments = { Collateral: aliceBucksPayment };
  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );
  /** @type {Record<string, Invitation>} */
  // @ts-expect-error Payment is an Invitation
  const { LongOption: bobLongOption, ShortOption: carolShortOption } =
    await aliceSeat.getPayouts();

  const bobOptionSeat = await E(zoe).offer(bobLongOption);
  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(225n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();

  const carolOptionSeat = await E(zoe).offer(carolShortOption);
  const carolPayout = await carolOptionSeat.getPayout('Collateral');
  const carolDepositAmount = await E(carolBucksPurse).deposit(carolPayout);
  await t.deepEqual(
    carolDepositAmount,
    bucks(75n),
    `payout was ${carolDepositAmount.value}, expected 75`,
  );
  await Promise.all([bobDeposit]);
});

test('fundedCallSpread, sell options', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    fundedCallSpread,
  );
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  // Alice will create and fund a call spread contract, and sell the invitations
  // to Bob and Carol. Bob and Carol will promptly schedule collection of funds.
  // The spread will then mature, and both will get paid.

  // Setup Alice
  const aliceBucksPayment = bucksMint.mintPayment(bucks(300n));
  const aliceBucksPurse = bucksIssuer.makeEmptyPurse();
  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  const bobBucksPayment = bucksMint.mintPayment(bucks(200n));
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();
  const carolBucksPayment = bucksMint.mintPayment(bucks(100n));

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [20, 45],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });

  // Alice creates a fundedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
  });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { customDetails } = await E(zoe).getInvitationDetails(
    creatorInvitation,
  );
  assert(typeof customDetails === 'object');
  const longOptionAmount = customDetails.longAmount;
  const shortOptionAmount = customDetails.shortAmount;

  const aliceProposal = harden({
    want: { LongOption: longOptionAmount, ShortOption: shortOptionAmount },
    give: { Collateral: bucks(300n) },
  });
  const alicePayments = { Collateral: aliceBucksPayment };
  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );
  const { LongOption: longOption, ShortOption: shortOption } =
    await aliceSeat.getPayouts();

  const exchangeInstallation = await installationPFromSource(
    zoe,
    vatAdminState,
    simpleExchange,
  );
  const { publicFacet: exchangePublic } = await E(zoe).startInstance(
    exchangeInstallation,
    {
      Asset: invitationIssuer,
      Price: bucksIssuer,
    },
  );

  // Alice offers to sell the long invitation
  const aliceLongInvitation = E(exchangePublic).makeInvitation();
  const proposalLong = harden({
    give: { Asset: longOptionAmount },
    want: { Price: bucks(200n) },
  });
  const aliceSellLongSeat = await E(zoe).offer(
    aliceLongInvitation,
    proposalLong,
    {
      Asset: longOption,
    },
  );
  const aliceLong = assertPayoutDeposit(
    t,
    aliceSellLongSeat.getPayout('Price'),
    aliceBucksPurse,
    bucks(200n),
  );

  // Alice offers to sell the short invitation
  const aliceShortInvitation = E(exchangePublic).makeInvitation();
  const proposalShort = harden({
    give: { Asset: shortOptionAmount },
    want: { Price: bucks(100n) },
  });
  const aliceSellShortSeat = await E(zoe).offer(
    aliceShortInvitation,
    proposalShort,
    { Asset: shortOption },
  );
  const aliceShort = assertPayoutDeposit(
    t,
    aliceSellShortSeat.getPayout('Price'),
    carolBucksPurse,
    bucks(100n),
  );

  // Bob buys the long invitation
  const bobLongInvitation = E(exchangePublic).makeInvitation();
  const bobProposal = harden({
    give: { Price: bucks(200n) },
    want: { Asset: longOptionAmount },
  });
  const bobBuySeat = await E(zoe).offer(bobLongInvitation, bobProposal, {
    Price: bobBucksPayment,
  });
  const longInvitationPayout = await bobBuySeat.getPayout('Asset');
  await assertPayoutAmount(
    t,
    invitationIssuer,
    longInvitationPayout,
    longOptionAmount,
  );
  const bobOptionSeat = await E(zoe).offer(longInvitationPayout);
  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(225n),
  );

  // Carol buys the Short invitation
  const carolShortInvitation = E(exchangePublic).makeInvitation();
  const carolProposal = harden({
    give: { Price: bucks(100n) },
    want: { Asset: shortOptionAmount },
  });
  const carolBuySeat = await E(zoe).offer(carolShortInvitation, carolProposal, {
    Price: carolBucksPayment,
  });
  const ShortInvitationPayout = await carolBuySeat.getPayout('Asset');
  await assertPayoutAmount(
    t,
    invitationIssuer,
    ShortInvitationPayout,
    shortOptionAmount,
  );
  const carolOptionSeat = await E(zoe).offer(ShortInvitationPayout);
  const carolPayout = carolOptionSeat.getPayout('Collateral');
  const carolDeposit = assertPayoutDeposit(
    t,
    carolPayout,
    carolBucksPurse,
    bucks(75n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await Promise.all([aliceLong, aliceShort, bobDeposit, carolDeposit]);
});

test('pricedCallSpread, mid-strike', async t => {
  const {
    moolaIssuer,
    simoleanIssuer,
    moola,
    simoleans,
    bucksIssuer,
    bucksMint,
    bucks,
    zoe,
    brands,
    vatAdminState,
  } = setup();
  const installation = await installationPFromSource(
    zoe,
    vatAdminState,
    pricedCallSpread,
  );

  // Alice will create a call spread contract, and give the invitations
  // to Bob and Carol. Bob and Carol will fund and exercise, then promptly
  // schedule collection of funds. The spread will then mature, and both will
  // get paid.

  // Setup Bob
  const bobBucksPurse = bucksIssuer.makeEmptyPurse();
  const bobBucksPayment = bucksMint.mintPayment(bucks(225n));
  // Setup Carol
  const carolBucksPurse = bucksIssuer.makeEmptyPurse();
  const carolBucksPayment = bucksMint.mintPayment(bucks(75n));

  const manualTimer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const priceAuthority = await makeTestPriceAuthority(
    brands,
    [20, 45, 45, 45, 45, 45, 45],
    manualTimer,
  );
  // underlying is 2 Simoleans, strike range is 30-50 (doubled)
  const terms = harden({
    expiration: 2n,
    underlyingAmount: simoleans(2n),
    priceAuthority,
    strikePrice1: moola(60n),
    strikePrice2: moola(100n),
    settlementAmount: bucks(300n),
    timer: manualTimer,
  });
  // Alice creates a pricedCallSpread instance
  const issuerKeywordRecord = harden({
    Underlying: simoleanIssuer,
    Collateral: bucksIssuer,
    Strike: moolaIssuer,
  });
  const { creatorFacet } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );
  const invitationPair = await E(creatorFacet).makeInvitationPair(75n);
  const { longInvitation, shortInvitation } = invitationPair;

  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const longAmount = await E(invitationIssuer).getAmountOf(longInvitation);
  const shortAmount = await E(invitationIssuer).getAmountOf(shortInvitation);

  const longOptionValue = getCopyBagEntries(longAmount.value)[0][0];
  t.is('long', longOptionValue.customDetails?.position);
  const longOption = longOptionValue.customDetails?.option;

  // Bob makes an offer for the long option
  const bobProposal = harden({
    want: { Option: longOption },
    give: { Collateral: bucks(longOptionValue.customDetails?.collateral) },
  });
  const bobFundingSeat = await E(zoe).offer(await longInvitation, bobProposal, {
    Collateral: bobBucksPayment,
  });
  // bob gets an option, and exercises it for the payout
  const bobOption = await bobFundingSeat.getPayout('Option');
  const bobOptionSeat = await E(zoe).offer(bobOption);

  const bobPayout = bobOptionSeat.getPayout('Collateral');
  const bobDeposit = assertPayoutDeposit(
    t,
    bobPayout,
    bobBucksPurse,
    bucks(225n),
  );

  const shortOptionValue = getCopyBagEntries(shortAmount.value)[0][0];
  t.is('short', shortOptionValue.customDetails?.position);
  const shortOption = shortOptionValue.customDetails?.option;

  // carol makes an offer for the short option
  const carolProposal = harden({
    want: { Option: shortOption },
    give: { Collateral: bucks(shortOptionValue.customDetails?.collateral) },
  });
  const carolFundingSeat = await E(zoe).offer(
    await shortInvitation,
    carolProposal,
    {
      Collateral: carolBucksPayment,
    },
  );
  // carol gets an option, and exercises it for the payout
  const carolOption = await carolFundingSeat.getPayout('Option');
  const carolOptionSeat = await E(zoe).offer(carolOption);

  const carolPayout = carolOptionSeat.getPayout('Collateral');
  const carolDeposit = assertPayoutDeposit(
    t,
    carolPayout,
    carolBucksPurse,
    bucks(75n),
  );

  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await E(manualTimer).tick();
  await Promise.all([bobDeposit, carolDeposit]);
});
