import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';

import buildManualTimer from '../../../tools/manualTimer.js';
import { setup } from '../setupBasicMints.js';
import { setupMixed } from '../setupMixedMints.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const auctionRoot = `${dirname}/../../../src/contracts/auction/index.js`;

test('zoe - secondPriceAuction w/ 3 bids', async t => {
  t.plan(15);
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  const makeAlice = async (timer, moolaPayment) => {
    const moolaPurse = await E(moolaKit.issuer).makeEmptyPurse();
    const simoleanPurse = await E(simoleanKit.issuer).makeEmptyPurse();
    return {
      installCode: async () => {
        // pack the contract
        const bundle = await bundleSource(auctionRoot);
        // install the contract
        vatAdminState.installBundle('b1-auctioneer', bundle);
        const installationP = E(zoe).installBundleID('b1-auctioneer');
        return installationP;
      },
      startInstance: async installation => {
        const issuerKeywordRecord = harden({
          Asset: moolaKit.issuer,
          Ask: simoleanKit.issuer,
        });
        const terms = { timeAuthority: timer, bidDuration: 1n };
        const adminP = E(zoe).startInstance(
          installation,
          issuerKeywordRecord,
          terms,
        );
        return adminP;
      },
      offer: async sellInvitation => {
        const proposal = harden({
          give: { Asset: moola(1n) },
          want: { Ask: simoleans(3n) },
          exit: { waived: null },
        });

        const payments = { Asset: moolaPayment };

        const seat = await E(zoe).offer(sellInvitation, proposal, payments);

        const makeBidInvitationObj = await E(seat).getOfferResult();
        return { seat, makeBidInvitationObj };
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              moola(0n),
              `Alice didn't get any of what she put in`,
            ),
          );

        await E(seat)
          .getPayout('Ask')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              simoleans(7n),
              `Alice got the second price bid, Carol's bid, even though Bob won`,
            ),
          );
      },
    };
  };

  const makeBob = (installation, simoleanPayment) => {
    const moolaPurse = moolaKit.issuer.makeEmptyPurse();
    const simoleanPurse = simoleanKit.issuer.makeEmptyPurse();
    return Far('bob', {
      offer: async untrustedInvitation => {
        const invitationIssuer = await E(zoe).getInvitationIssuer();

        // Bob is able to use the trusted invitationIssuer from Zoe to
        // transform an untrusted invitation that Alice also has access to, to
        // an
        const invitation = await claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const invitationValue = await E(zoe).getInvitationDetails(invitation);

        t.is(
          invitationValue.installation,
          installation,
          'installation is secondPriceAuction',
        );
        t.deepEqual(
          invitationValue.customDetails?.auctionedAssets,
          moola(1n),
          `asset to be auctioned is 1 moola`,
        );
        t.deepEqual(
          invitationValue.customDetails?.minimumBid,
          simoleans(3n),
          `minimum bid is 3 simoleans`,
        );

        t.deepEqual(
          invitationValue.customDetails?.bidDuration,
          1n,
          `auction will be closed after 1 tick according to the timeAuthority`,
        );

        const proposal = harden({
          give: { Bid: simoleans(11n) },
          want: { Asset: moola(1n) },
        });
        const payments = { Bid: simoleanPayment };

        const seat = await E(zoe).offer(invitation, proposal, payments);

        t.is(
          await E(seat).getOfferResult(),
          'The offer has been accepted. Once the contract has been completed, please check your payout',
        );
        return seat;
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, moola(1n), `Bob wins the auction`),
          );

        await E(seat)
          .getPayout('Bid')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              simoleans(4n),
              `Bob gets the difference between the second-price bid (Carol's 7 simoleans) and his bid back`,
            ),
          );
      },
    });
  };

  const makeLosingBidder = (bidAmount, simoleanPayment) => {
    const moolaPurse = moolaKit.issuer.makeEmptyPurse();
    const simoleanPurse = simoleanKit.issuer.makeEmptyPurse();
    return Far('losing bidder', {
      offer: async untrustedInvitation => {
        const invitationIssuer = await E(zoe).getInvitationIssuer();
        const invitation = await claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const proposal = harden({
          give: { Bid: bidAmount },
          want: { Asset: moola(1n) },
        });
        const payments = { Bid: simoleanPayment };

        const seat = await E(zoe).offer(invitation, proposal, payments);

        t.is(
          await E(seat).getOfferResult(),
          'The offer has been accepted. Once the contract has been completed, please check your payout',
        );
        return seat;
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, moola(0n), `didn't win the auction`),
          );

        await E(seat)
          .getPayout('Bid')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, bidAmount, `full refund`),
          );
      },
    });
  };

  // Setup Alice
  const timer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const alice = await makeAlice(timer, moolaKit.mint.mintPayment(moola(1n)));
  const installation = await alice.installCode();

  // Setup Bob, Carol, Dave
  const bob = makeBob(
    installation,
    await simoleanKit.mint.mintPayment(simoleans(11n)),
  );
  const carol = makeLosingBidder(
    simoleans(7n),
    await simoleanKit.mint.mintPayment(simoleans(7n)),
  );
  const dave = makeLosingBidder(
    simoleans(5n),
    await simoleanKit.mint.mintPayment(simoleans(5n)),
  );

  const { creatorInvitation } = await alice.startInstance(installation);

  const { seat: aliceSeat, makeBidInvitationObj } =
    await alice.offer(creatorInvitation);

  const bidInvitation1 = E(makeBidInvitationObj).makeBidInvitation();
  const bidInvitation2 = E(makeBidInvitationObj).makeBidInvitation();
  const bidInvitation3 = E(makeBidInvitationObj).makeBidInvitation();

  // timer ticks before offering, nothing happens
  await timer.tick();

  const bobSeat = await bob.offer(bidInvitation1);
  const carolSeat = await carol.offer(bidInvitation2);
  const daveSeat = await dave.offer(bidInvitation3);
  await timer.tick();

  await Promise.all([
    alice.collectPayout(aliceSeat),
    bob.collectPayout(bobSeat),
    carol.collectPayout(carolSeat),
    dave.collectPayout(daveSeat),
  ]);
});

test('zoe - secondPriceAuction - alice tries to exit', async t => {
  t.plan(12);
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(1n));
  const aliceMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const aliceSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Setup Bob
  const bobSimoleanPayment = simoleanKit.mint.mintPayment(simoleans(11n));
  const bobMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const bobSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Setup Carol
  const carolSimoleanPayment = simoleanKit.mint.mintPayment(simoleans(8n));

  // Alice creates a secondPriceAuction instance

  // Pack the contract.
  const bundle = await bundleSource(auctionRoot);

  vatAdminState.installBundle('b1-auctioneer', bundle);
  const installation = await E(zoe).installBundleID('b1-auctioneer');
  const issuerKeywordRecord = harden({
    Asset: moolaKit.issuer,
    Ask: simoleanKit.issuer,
  });
  const timer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const terms = harden({ timeAuthority: timer, bidDuration: 1n });
  const { creatorInvitation: aliceInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  // Alice escrows with zoe
  const aliceProposal = harden({
    give: { Asset: moola(1n) },
    want: { Ask: simoleans(3n) },
    exit: { waived: null },
  });
  const alicePayments = harden({ Asset: aliceMoolaPayment });

  assert(!!aliceInvitation);
  // Alice initializes the auction
  const aliceSeat = await E(zoe).offer(
    aliceInvitation,
    aliceProposal,
    alicePayments,
  );
  const makeInvitationObj = await E(aliceSeat).getOfferResult();

  const bobInvitation = await E(makeInvitationObj).makeBidInvitation();

  // Alice tries to exit, but cannot
  await t.throwsAsync(
    async () => E(aliceSeat).tryExit(),
    { message: /Only seats with the exit rule "onDemand" can exit at will/ },
    `alice can't exit`,
  );

  // timer ticks before offering, nothing happens
  await timer.tick();

  // Alice gives Bob the invitation

  const bobProposal = harden({
    want: { Asset: moola(1n) },
    give: { Bid: simoleans(11n) },
  });
  const bobPayments = harden({ Bid: bobSimoleanPayment });

  // Bob escrows with zoe
  // Bob bids
  const bobSeat = await E(zoe).offer(bobInvitation, bobProposal, bobPayments);

  t.is(
    await E(bobSeat).getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
  );

  // Bob exits early, but this does not stop the auction.
  await E(bobSeat).tryExit();
  const bobMoolaPayout = await bobSeat.getPayout('Asset');
  const bobSimoleanPayout = await bobSeat.getPayout('Bid');

  const carolInvitation = await E(makeInvitationObj).makeBidInvitation();

  const carolProposal = harden({
    want: { Asset: moola(1n) },
    give: { Bid: simoleans(8n) },
  });
  const carolPayments = harden({ Bid: carolSimoleanPayment });

  // Carol bids
  const carolSeat = await E(zoe).offer(
    carolInvitation,
    carolProposal,
    carolPayments,
  );

  await timer.tick();

  const aliceMoolaPayout = await aliceSeat.getPayout('Asset');
  const aliceSimoleanPayout = await aliceSeat.getPayout('Ask');

  const carolMoolaPayout = await carolSeat.getPayout('Asset');
  const carolSimoleanPayout = await carolSeat.getPayout('Bid');

  // Alice (the creator of the auction) gets Carol's simoleans and
  // carol gets the assets.
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(aliceMoolaPayout),
    moola(0n),
    `alice has no moola`,
  );

  // Alice got Carol's simoleans
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(aliceSimoleanPayout),
    simoleans(8n),
  );

  // Alice deposits her payout to ensure she can
  await aliceMoolaPurse.deposit(aliceMoolaPayout);
  await aliceSimoleanPurse.deposit(aliceSimoleanPayout);

  // Bob gets a refund
  t.deepEqual(await moolaKit.issuer.getAmountOf(bobMoolaPayout), moola(0n));
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(bobSimoleanPayout),
    bobProposal.give.Bid,
  );

  // Bob deposits his payout to ensure he can
  await bobMoolaPurse.deposit(bobMoolaPayout);
  await bobSimoleanPurse.deposit(bobSimoleanPayout);

  // Carol gets the assets and all her simoleans are taken to pay
  // Alice
  t.deepEqual(await moolaKit.issuer.getAmountOf(carolMoolaPayout), moola(1n));
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(carolSimoleanPayout),
    simoleans(0n),
  );

  // Assert that the correct refunds were received.
  t.is(aliceMoolaPurse.getCurrentAmount().value, 0n);
  t.is(aliceSimoleanPurse.getCurrentAmount().value, 8n);
  t.is(bobMoolaPurse.getCurrentAmount().value, 0n);
  t.is(bobSimoleanPurse.getCurrentAmount().value, 11n);
});

test('zoe - secondPriceAuction - all bidders try to exit', async t => {
  t.plan(10);
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(1n));
  const aliceMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const aliceSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Setup Bob
  const bobSimoleanPayment = simoleanKit.mint.mintPayment(simoleans(11n));
  const bobMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const bobSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Alice creates a secondPriceAuction instance

  // Pack the contract.
  const bundle = await bundleSource(auctionRoot);
  vatAdminState.installBundle('b1-auctioneer', bundle);
  const installation = await E(zoe).installBundleID('b1-auctioneer');
  const issuerKeywordRecord = harden({
    Asset: moolaKit.issuer,
    Ask: simoleanKit.issuer,
  });
  const timer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const terms = harden({ timeAuthority: timer, bidDuration: 1n });
  const { creatorInvitation: aliceInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  // Alice escrows with zoe
  const aliceProposal = harden({
    give: { Asset: moola(1n) },
    want: { Ask: simoleans(3n) },
    exit: { waived: null },
  });
  const alicePayments = harden({ Asset: aliceMoolaPayment });

  assert(!!aliceInvitation, 'Alice invitation must be presented');
  // Alice initializes the auction
  const aliceSeat = await E(zoe).offer(
    aliceInvitation,
    aliceProposal,
    alicePayments,
  );
  const makeInvitationObj = await E(aliceSeat).getOfferResult();

  const bobInvitation = await E(makeInvitationObj).makeBidInvitation();

  // Alice tries to exit, but cannot
  await t.throwsAsync(
    async () => E(aliceSeat).tryExit(),
    { message: /Only seats with the exit rule "onDemand" can exit at will/ },
    `alice can't exit`,
  );

  // timer ticks before offering, nothing happens
  await timer.tick();

  // Alice gives Bob the invitation

  const bobProposal = harden({
    want: { Asset: moola(1n) },
    give: { Bid: simoleans(11n) },
  });
  const bobPayments = harden({ Bid: bobSimoleanPayment });

  // Bob escrows with zoe
  // Bob bids
  const bobSeat = await E(zoe).offer(bobInvitation, bobProposal, bobPayments);

  t.is(
    await E(bobSeat).getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
  );

  // Bob exits early, but this does not stop the auction.
  await E(bobSeat).tryExit();
  const bobMoolaPayout = await bobSeat.getPayout('Asset');
  const bobSimoleanPayout = await bobSeat.getPayout('Bid');

  await timer.tick();

  // no active bidders, the auction should fail
  const aliceMoolaPayout = await aliceSeat.getPayout('Asset');
  const aliceSimoleanPayout = await aliceSeat.getPayout('Ask');

  t.deepEqual(
    await moolaKit.issuer.getAmountOf(aliceMoolaPayout),
    moola(1n),
    `alice should keep moola`,
  );

  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(aliceSimoleanPayout),
    simoleans(0n),
    `alic has no simolean`,
  );

  // Alice deposits her payout to ensure she can
  await aliceMoolaPurse.deposit(aliceMoolaPayout);
  await aliceSimoleanPurse.deposit(aliceSimoleanPayout);

  // Bob gets a refund
  t.deepEqual(await moolaKit.issuer.getAmountOf(bobMoolaPayout), moola(0n));
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(bobSimoleanPayout),
    bobProposal.give.Bid,
  );

  // Bob deposits his payout to ensure he can
  await bobMoolaPurse.deposit(bobMoolaPayout);
  await bobSimoleanPurse.deposit(bobSimoleanPayout);

  // Assert that the correct refunds were received.
  t.is(aliceMoolaPurse.getCurrentAmount().value, 1n);
  t.is(aliceSimoleanPurse.getCurrentAmount().value, 0n);
  t.is(bobMoolaPurse.getCurrentAmount().value, 0n);
  t.is(bobSimoleanPurse.getCurrentAmount().value, 11n);
});

// Three bidders with (fungible) moola bid for a CryptoCat
test('zoe - secondPriceAuction non-fungible asset', async t => {
  t.plan(30);
  const {
    ccIssuer,
    moolaIssuer,
    ccMint,
    moolaMint,
    cryptoCats,
    moola,
    zoe,
    vatAdminState,
  } = setupMixed();
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  // Setup Alice
  const aliceCcPayment = ccMint.mintPayment(cryptoCats(harden(['Felix'])));
  const aliceCcPurse = ccIssuer.makeEmptyPurse();
  const aliceMoolaPurse = moolaIssuer.makeEmptyPurse();

  // Setup Bob
  const bobMoolaPayment = moolaMint.mintPayment(moola(11n));
  const bobCcPurse = ccIssuer.makeEmptyPurse();
  const bobMoolaPurse = moolaIssuer.makeEmptyPurse();

  // Setup Carol
  const carolMoolaPayment = moolaMint.mintPayment(moola(7n));
  const carolCcPurse = ccIssuer.makeEmptyPurse();
  const carolMoolaPurse = moolaIssuer.makeEmptyPurse();

  // Setup Dave
  const daveMoolaPayment = moolaMint.mintPayment(moola(5n));
  const daveCcPurse = ccIssuer.makeEmptyPurse();
  const daveMoolaPurse = moolaIssuer.makeEmptyPurse();

  // Alice creates a secondPriceAuction instance

  // Pack the contract.
  const bundle = await bundleSource(auctionRoot);
  vatAdminState.installBundle('b1-auctioneer', bundle);
  const installation = await E(zoe).installBundleID('b1-auctioneer');
  const issuerKeywordRecord = harden({
    Asset: ccIssuer,
    Ask: moolaIssuer,
  });
  const timer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const terms = harden({ timeAuthority: timer, bidDuration: 1n });
  const { creatorInvitation: aliceInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  // Alice escrows with zoe
  const aliceProposal = harden({
    give: { Asset: cryptoCats(harden(['Felix'])) },
    want: { Ask: moola(3n) },
    exit: { waived: null },
  });
  const alicePayments = { Asset: aliceCcPayment };

  assert(!!aliceInvitation);
  // Alice initializes the auction
  const aliceSeat = await E(zoe).offer(
    aliceInvitation,
    aliceProposal,
    alicePayments,
  );
  const makeBidInvitationObj = await E(aliceSeat).getOfferResult();
  const bobInvitation = E(makeBidInvitationObj).makeBidInvitation();
  const carolInvitation = E(makeBidInvitationObj).makeBidInvitation();
  const daveInvitation = E(makeBidInvitationObj).makeBidInvitation();

  // Alice spreads the invitations far and wide and Bob decides he
  // wants to participate in the auction.
  const bobExclusiveInvitation = await claim(
    E(invitationIssuer).makeEmptyPurse(),
    bobInvitation,
  );
  const bobInvitationValue = await E(zoe).getInvitationDetails(
    bobExclusiveInvitation,
  );

  const bobIssuers = await E(zoe).getIssuers(bobInvitationValue.instance);

  t.is(bobInvitationValue.installation, installation, 'bobInstallationId');
  t.deepEqual(bobIssuers, { Asset: ccIssuer, Ask: moolaIssuer }, 'bobIssuers');
  t.deepEqual(
    bobInvitationValue.customDetails?.minimumBid,
    moola(3n),
    'minimumBid',
  );
  t.deepEqual(
    bobInvitationValue.customDetails?.auctionedAssets,
    cryptoCats(harden(['Felix'])),
    'assets',
  );

  const bobProposal = harden({
    give: { Bid: moola(11n) },
    want: { Asset: cryptoCats(harden(['Felix'])) },
  });
  const bobPayments = { Bid: bobMoolaPayment };

  // Bob escrows with zoe
  // Bob bids
  const bobSeat = await E(zoe).offer(
    bobExclusiveInvitation,
    bobProposal,
    bobPayments,
  );

  t.is(
    await E(bobSeat).getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
    'bobOutcome',
  );

  // Carol decides to bid for the one cc

  const carolExclusiveInvitation = await claim(
    E(invitationIssuer).makeEmptyPurse(),
    carolInvitation,
  );
  const carolInvitationValue = await E(zoe).getInvitationDetails(
    carolExclusiveInvitation,
  );

  const carolIssuers = await E(zoe).getIssuers(carolInvitationValue.instance);

  t.is(carolInvitationValue.installation, installation, 'carolInstallationId');
  t.deepEqual(
    carolIssuers,
    { Asset: ccIssuer, Ask: moolaIssuer },
    'carolIssuers',
  );
  t.deepEqual(
    carolInvitationValue.customDetails?.minimumBid,
    moola(3n),
    'carolMinimumBid',
  );
  t.deepEqual(
    carolInvitationValue.customDetails?.auctionedAssets,
    cryptoCats(harden(['Felix'])),
    'carolAuctionedAssets',
  );

  const carolProposal = harden({
    give: { Bid: moola(7n) },
    want: { Asset: cryptoCats(harden(['Felix'])) },
  });
  const carolPayments = { Bid: carolMoolaPayment };

  // Carol escrows with zoe
  // Carol bids
  const carolSeat = await E(zoe).offer(
    carolExclusiveInvitation,
    carolProposal,
    carolPayments,
  );

  t.is(
    await E(carolSeat).getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
    'carolOutcome',
  );

  // Dave decides to bid for the one moola
  const daveExclusiveInvitation = await claim(
    E(invitationIssuer).makeEmptyPurse(),
    daveInvitation,
  );
  const daveInvitationValue = await E(zoe).getInvitationDetails(
    daveExclusiveInvitation,
  );

  const daveIssuers = await E(zoe).getIssuers(daveInvitationValue.instance);

  t.is(daveInvitationValue.installation, installation, 'daveInstallation');
  t.deepEqual(
    daveIssuers,
    { Asset: ccIssuer, Ask: moolaIssuer },
    'daveIssuers',
  );
  t.deepEqual(
    daveInvitationValue.customDetails?.minimumBid,
    moola(3n),
    'daveMinimumBid',
  );
  t.deepEqual(
    daveInvitationValue.customDetails?.auctionedAssets,
    cryptoCats(harden(['Felix'])),
    'daveAssets',
  );

  const daveProposal = harden({
    give: { Bid: moola(5n) },
    want: { Asset: cryptoCats(harden(['Felix'])) },
  });
  const davePayments = { Bid: daveMoolaPayment };

  // Dave escrows with zoe
  // Dave bids
  const daveSeat = await E(zoe).offer(
    daveExclusiveInvitation,
    daveProposal,
    davePayments,
  );

  t.is(
    await E(daveSeat).getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
    'daveOutcome',
  );

  await timer.tick();

  const aliceCcPayout = await aliceSeat.getPayout('Asset');
  const aliceMoolaPayout = await aliceSeat.getPayout('Ask');

  const bobCcPayout = await bobSeat.getPayout('Asset');
  const bobMoolaPayout = await bobSeat.getPayout('Bid');

  const carolCcPayout = await carolSeat.getPayout('Asset');
  const carolMoolaPayout = await carolSeat.getPayout('Bid');

  const daveCcPayout = await daveSeat.getPayout('Asset');
  const daveMoolaPayout = await daveSeat.getPayout('Bid');

  // Alice (the creator of the auction) gets back the second highest bid
  t.deepEqual(
    await moolaIssuer.getAmountOf(aliceMoolaPayout),
    carolProposal.give.Bid,
    `alice gets carol's bid`,
  );

  // Alice didn't get any of what she put in
  t.deepEqual(
    await ccIssuer.getAmountOf(aliceCcPayout),
    cryptoCats(harden([])),
    `alice gets nothing of what she put in`,
  );

  // Alice deposits her payout to ensure she can
  await aliceCcPurse.deposit(aliceCcPayout);
  await aliceMoolaPurse.deposit(aliceMoolaPayout);

  // Bob (the winner of the auction) gets the one moola and the
  // difference between his bid and the price back
  t.deepEqual(
    await ccIssuer.getAmountOf(bobCcPayout),
    cryptoCats(harden(['Felix'])),
    `bob is the winner`,
  );
  t.deepEqual(
    await moolaIssuer.getAmountOf(bobMoolaPayout),
    moola(4n),
    `bob gets difference back`,
  );

  // Bob deposits his payout to ensure he can
  await bobCcPurse.deposit(bobCcPayout);
  await bobMoolaPurse.deposit(bobMoolaPayout);

  // Carol gets a full refund
  t.deepEqual(
    await ccIssuer.getAmountOf(carolCcPayout),
    cryptoCats(harden([])),
    `carol doesn't win`,
  );
  t.deepEqual(
    await moolaIssuer.getAmountOf(carolMoolaPayout),
    carolProposal.give.Bid,
    `carol gets a refund`,
  );

  // Carol deposits her payout to ensure she can
  await carolCcPurse.deposit(carolCcPayout);
  await carolMoolaPurse.deposit(carolMoolaPayout);

  // Dave gets a full refund
  t.deepEqual(
    await moolaIssuer.getAmountOf(daveMoolaPayout),
    daveProposal.give.Bid,
    `dave gets a refund`,
  );

  // Dave deposits his payout to ensure he can
  await daveCcPurse.deposit(daveCcPayout);
  await daveMoolaPurse.deposit(daveMoolaPayout);

  // Assert that the correct payout were received.
  // Alice had 1 CryptoCat and an empty CryptoCat purse.
  // Bob had an empty CryptoCat purse and 11 moola.
  // Carol had an empty CryptoCat purse and 7 moola.
  // Dave had an empty CryptoCat purse and 5 moola.

  // Now, they should have:
  // Alice: an empty CryptoCat purse and 7 moola
  // Bob: the CryptoCat and 4 moola
  // Carol: an empty CryptoCat purse and 7 moola
  // Dave: an empty CryptoCat purse and 5 moola
  t.deepEqual(aliceCcPurse.getCurrentAmount().value, []);
  t.is(aliceMoolaPurse.getCurrentAmount().value, 7n);
  t.deepEqual(bobCcPurse.getCurrentAmount().value, ['Felix']);
  t.is(bobMoolaPurse.getCurrentAmount().value, 4n);
  t.deepEqual(carolCcPurse.getCurrentAmount().value, []);
  t.is(carolMoolaPurse.getCurrentAmount().value, 7n);
  t.deepEqual(daveCcPurse.getCurrentAmount().value, []);
  t.is(daveMoolaPurse.getCurrentAmount().value, 5n);
});

test('zoe - firstPriceAuction w/ 3 bids', async t => {
  t.plan(15);
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  const makeAlice = async (timer, moolaPayment) => {
    const moolaPurse = await E(moolaKit.issuer).makeEmptyPurse();
    const simoleanPurse = await E(simoleanKit.issuer).makeEmptyPurse();
    return {
      installCode: async () => {
        // pack the contract
        const bundle = await bundleSource(auctionRoot);
        // install the contract
        vatAdminState.installBundle('b1-auctioneer', bundle);
        const installationP = E(zoe).installBundleID('b1-auctioneer');
        return installationP;
      },
      startInstance: async installation => {
        const issuerKeywordRecord = harden({
          Asset: moolaKit.issuer,
          Ask: simoleanKit.issuer,
        });
        const terms = {
          timeAuthority: timer,
          bidDuration: 1n,
          winnerPriceOption: 'first-price',
        };
        const adminP = E(zoe).startInstance(
          installation,
          issuerKeywordRecord,
          terms,
        );
        return adminP;
      },
      offer: async sellInvitation => {
        const proposal = harden({
          give: { Asset: moola(1n) },
          want: { Ask: simoleans(3n) },
          exit: { waived: null },
        });

        const payments = { Asset: moolaPayment };

        const seat = await E(zoe).offer(sellInvitation, proposal, payments);

        const makeBidInvitationObj = await E(seat).getOfferResult();
        return { seat, makeBidInvitationObj };
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              moola(0n),
              `Alice didn't get any of what she put in`,
            ),
          );

        await E(seat)
          .getPayout('Ask')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              simoleans(11n),
              `Alice got the first price bid, which is Bob`,
            ),
          );
      },
    };
  };

  const makeBob = (installation, simoleanPayment) => {
    const moolaPurse = moolaKit.issuer.makeEmptyPurse();
    const simoleanPurse = simoleanKit.issuer.makeEmptyPurse();
    return Far('bob', {
      offer: async untrustedInvitation => {
        const invitationIssuer = await E(zoe).getInvitationIssuer();

        // Bob is able to use the trusted invitationIssuer from Zoe to
        // transform an untrusted invitation that Alice also has access to, to
        // an
        const invitation = await claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const invitationValue = await E(zoe).getInvitationDetails(invitation);

        t.is(
          invitationValue.installation,
          installation,
          'installation is secondPriceAuction',
        );
        t.deepEqual(
          invitationValue.customDetails?.auctionedAssets,
          moola(1n),
          `asset to be auctioned is 1 moola`,
        );
        t.deepEqual(
          invitationValue.customDetails?.minimumBid,
          simoleans(3n),
          `minimum bid is 3 simoleans`,
        );

        t.deepEqual(
          invitationValue.customDetails?.bidDuration,
          1n,
          `auction will be closed after 1 tick according to the timeAuthority`,
        );

        const proposal = harden({
          give: { Bid: simoleans(11n) },
          want: { Asset: moola(1n) },
        });
        const payments = { Bid: simoleanPayment };

        const seat = await E(zoe).offer(invitation, proposal, payments);

        t.is(
          await E(seat).getOfferResult(),
          'The offer has been accepted. Once the contract has been completed, please check your payout',
        );
        return seat;
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, moola(1n), `Bob wins the auction`),
          );

        await E(seat)
          .getPayout('Bid')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(
              amountDeposited,
              simoleans(0n),
              `Bob gets the difference between his bid back`,
            ),
          );
      },
    });
  };

  const makeLosingBidder = (bidAmount, simoleanPayment) => {
    const moolaPurse = moolaKit.issuer.makeEmptyPurse();
    const simoleanPurse = simoleanKit.issuer.makeEmptyPurse();
    return Far('losing bidder', {
      offer: async untrustedInvitation => {
        const invitationIssuer = await E(zoe).getInvitationIssuer();
        const invitation = await claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const proposal = harden({
          give: { Bid: bidAmount },
          want: { Asset: moola(1n) },
        });
        const payments = { Bid: simoleanPayment };

        const seat = await E(zoe).offer(invitation, proposal, payments);

        t.is(
          await E(seat).getOfferResult(),
          'The offer has been accepted. Once the contract has been completed, please check your payout',
        );
        return seat;
      },
      collectPayout: async seat => {
        await E(seat)
          .getPayout('Asset')
          .then(payment => moolaPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, moola(0n), `didn't win the auction`),
          );

        await E(seat)
          .getPayout('Bid')
          .then(payment => simoleanPurse.deposit(payment))
          .then(amountDeposited =>
            t.deepEqual(amountDeposited, bidAmount, `full refund`),
          );
      },
    });
  };

  // Setup Alice
  const timer = buildManualTimer(t.log, 0n, { eventLoopIteration });
  const alice = await makeAlice(timer, moolaKit.mint.mintPayment(moola(1n)));
  const installation = await alice.installCode();

  // Setup Bob, Carol, Dave
  const bob = makeBob(
    installation,
    await simoleanKit.mint.mintPayment(simoleans(11n)),
  );
  const carol = makeLosingBidder(
    simoleans(7n),
    await simoleanKit.mint.mintPayment(simoleans(7n)),
  );
  const dave = makeLosingBidder(
    simoleans(5n),
    await simoleanKit.mint.mintPayment(simoleans(5n)),
  );

  const { creatorInvitation } = await alice.startInstance(installation);

  const { seat: aliceSeat, makeBidInvitationObj } =
    await alice.offer(creatorInvitation);

  const bidInvitation1 = E(makeBidInvitationObj).makeBidInvitation();
  const bidInvitation2 = E(makeBidInvitationObj).makeBidInvitation();
  const bidInvitation3 = E(makeBidInvitationObj).makeBidInvitation();

  // timer ticks before offering, nothing happens
  await timer.tick();

  const bobSeat = await bob.offer(bidInvitation1);
  const carolSeat = await carol.offer(bidInvitation2);
  const daveSeat = await dave.offer(bidInvitation3);
  await timer.tick();

  await Promise.all([
    alice.collectPayout(aliceSeat),
    bob.collectPayout(bobSeat),
    carol.collectPayout(carolSeat),
    dave.collectPayout(daveSeat),
  ]);
});
