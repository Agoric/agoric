// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { claim, splitMany } from '@agoric/ertp/src/legacy-payment-helpers.js';

import { setup } from '../setupBasicMints.js';
import { setupNonFungible } from '../setupNonFungibleMints.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const automaticRefundRoot = `${dirname}/../../../src/contracts/automaticRefund.js`;

test('zoe - simplest automaticRefund', async t => {
  // Setup zoe and mints
  const { moolaKit, moola, zoe, vatAdminState } = setup();
  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);
  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(3n));

  // 1: Alice creates an automatic refund instance
  const issuerKeywordRecord = harden({ Contribution: moolaKit.issuer });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
  );

  const aliceProposal = harden({
    give: { Contribution: moola(3n) },
    exit: { onDemand: null },
  });
  const alicePayments = { Contribution: aliceMoolaPayment };

  const seat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );

  const aliceMoolaPayout = await seat.getPayout('Contribution');

  // Alice got back what she put in
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(aliceMoolaPayout),
    aliceProposal.give.Contribution,
    `Alice's payout matches what she put in`,
  );
});

test('zoe - automaticRefund same issuer', async t => {
  // Setup zoe and mints
  const { moolaKit, moola, zoe, vatAdminState } = setup();
  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);
  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(9n));

  // 1: Alice creates an automatic refund instance
  const issuerKeywordRecord = harden({
    Contribution1: moolaKit.issuer,
    Contribution2: moolaKit.issuer,
  });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
  );

  const aliceProposal = harden({
    give: { Contribution2: moola(9n) },
    exit: { onDemand: null },
  });
  const alicePayments = harden({ Contribution2: aliceMoolaPayment });

  const seat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );

  const aliceMoolaPayout = await E(seat).getPayout('Contribution2');

  // Alice got back what she put in
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(aliceMoolaPayout),
    aliceProposal.give.Contribution2,
  );
});

test('zoe with automaticRefund', async t => {
  t.plan(11);
  // Setup zoe and mints
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(3n));
  const aliceMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const aliceSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Setup Bob
  const bobMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const bobSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();
  const bobSimoleanPayment = simoleanKit.mint.mintPayment(simoleans(17n));

  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);

  // 1: Alice creates an automatic refund instance
  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');
  const issuerKeywordRecord = harden({
    Contribution1: moolaKit.issuer,
    Contribution2: simoleanKit.issuer,
  });
  const { creatorInvitation: aliceInvitation, publicFacet } = await E(
    zoe,
  ).startInstance(installation, issuerKeywordRecord);

  // 2: Alice escrows with zoe
  const aliceProposal = harden({
    give: { Contribution1: moola(3n) },
    want: { Contribution2: simoleans(7n) },
    exit: { onDemand: null },
  });
  const alicePayments = { Contribution1: aliceMoolaPayment };

  // Alice gets a seat back.
  //
  // In the 'automaticRefund' trivial contract, you just get your
  // payments back when you make an offer. The offerResult is simply
  // the string 'The offer was accepted'
  const aliceSeat = await E(zoe).offer(
    aliceInvitation,
    aliceProposal,
    alicePayments,
  );

  const bobInvitation = await E(publicFacet).makeInvitation();
  const count = await E(publicFacet).getOffersCount();
  t.is(count, 1n);

  // Imagine that Alice has shared the bobInvitation with Bob. He
  // will do a claim on the invitation with the Zoe invitation issuer and
  // will check that the installation and terms match what he
  // expects
  const exclusBobInvitation = await claim(
    E(invitationIssuer).makeEmptyPurse(),
    bobInvitation,
  );

  const {
    value: {
      payload: [[bobInvitationValue]],
    },
  } = await E(invitationIssuer).getAmountOf(exclusBobInvitation);
  t.is(bobInvitationValue.installation, installation);

  // bob wants to know what issuers this contract is about and in
  // what order. Is it what he expects?
  const bobIssuers = await E(zoe).getIssuers(bobInvitationValue.instance);
  t.deepEqual(bobIssuers, {
    Contribution1: moolaKit.issuer,
    Contribution2: simoleanKit.issuer,
  });

  // 6: Bob also wants to get an automaticRefund (why? we don't
  // know) so he escrows his offer payments and makes a proposal.
  const bobProposal = harden({
    give: { Contribution2: simoleans(17n) },
    want: { Contribution1: moola(15n) },
    exit: { onDemand: null },
  });
  const bobPayments = { Contribution2: bobSimoleanPayment };

  // Bob also gets a seat back
  const bobSeat = await E(zoe).offer(
    exclusBobInvitation,
    bobProposal,
    bobPayments,
  );

  t.is(await E(aliceSeat).getOfferResult(), 'The offer was accepted');
  t.is(await E(bobSeat).getOfferResult(), 'The offer was accepted');

  // These promise resolve when the offer completes, but it may
  // still take longer for a remote issuer to actually make the
  // payments, so we need to wait for those promises to resolve
  // separately.

  // offer completes
  const aliceMoolaPayout = await aliceSeat.getPayout('Contribution1');
  const aliceSimoleanPayout = await aliceSeat.getPayout('Contribution2');

  const bobMoolaPayout = await bobSeat.getPayout('Contribution1');
  const bobSimoleanPayout = await bobSeat.getPayout('Contribution2');

  // Alice got back what she put in
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(aliceMoolaPayout),
    aliceProposal.give.Contribution1,
  );

  // Alice didn't get any of what she wanted
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(aliceSimoleanPayout),
    simoleans(0n),
  );

  // 9: Alice deposits her refund to ensure she can
  await aliceMoolaPurse.deposit(aliceMoolaPayout);
  await aliceSimoleanPurse.deposit(aliceSimoleanPayout);

  // 10: Bob deposits his refund to ensure he can
  await bobMoolaPurse.deposit(bobMoolaPayout);
  await bobSimoleanPurse.deposit(bobSimoleanPayout);

  // Assert that the correct refund was achieved.
  // Alice had 3 moola and 0 simoleans.
  // Bob had 0 moola and 7 simoleans.
  t.is(aliceMoolaPurse.getCurrentAmount().value, 3n);
  t.is(aliceSimoleanPurse.getCurrentAmount().value, 0n);
  t.is(bobMoolaPurse.getCurrentAmount().value, 0n);
  t.is(bobSimoleanPurse.getCurrentAmount().value, 17n);
});

test('multiple instances of automaticRefund for the same Zoe', async t => {
  t.plan(6);
  // Setup zoe and mints
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(30n));
  const moola10 = moola(10n);
  const aliceMoolaPayments = await splitMany(
    moolaKit.issuer.makeEmptyPurse(),
    aliceMoolaPayment,
    harden([moola10, moola10, moola10]),
  );

  // Alice creates 3 automatic refund instances
  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);

  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');
  const issuerKeywordRecord = harden({
    ContributionA: moolaKit.issuer,
    ContributionB: simoleanKit.issuer,
  });
  const { creatorInvitation: aliceInvitation1, publicFacet: publicFacet1 } =
    await E(zoe).startInstance(installation, issuerKeywordRecord);

  const { creatorInvitation: aliceInvitation2, publicFacet: publicFacet2 } =
    await E(zoe).startInstance(installation, issuerKeywordRecord);

  const { creatorInvitation: aliceInvitation3, publicFacet: publicFacet3 } =
    await E(zoe).startInstance(installation, issuerKeywordRecord);

  const aliceProposal = harden({
    give: { ContributionA: moola(10n) },
    want: { ContributionB: simoleans(7n) },
  });

  const seat1 = await E(zoe).offer(
    aliceInvitation1,
    aliceProposal,
    harden({ ContributionA: aliceMoolaPayments[0] }),
  );

  const seat2 = await E(zoe).offer(
    aliceInvitation2,
    aliceProposal,
    harden({ ContributionA: aliceMoolaPayments[1] }),
  );

  const seat3 = await E(zoe).offer(
    aliceInvitation3,
    aliceProposal,
    harden({ ContributionA: aliceMoolaPayments[2] }),
  );

  const moolaPayout1 = await seat1.getPayout('ContributionA');
  const moolaPayout2 = await seat2.getPayout('ContributionA');
  const moolaPayout3 = await seat3.getPayout('ContributionA');

  // Ensure that she got what she put in for each
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(moolaPayout1),
    aliceProposal.give.ContributionA,
  );
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(moolaPayout2),
    aliceProposal.give.ContributionA,
  );
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(moolaPayout3),
    aliceProposal.give.ContributionA,
  );

  // Ensure that the number of offers received by each instance is one
  t.is(await E(publicFacet1).getOffersCount(), 1n);
  t.is(await E(publicFacet2).getOffersCount(), 1n);
  t.is(await E(publicFacet3).getOffersCount(), 1n);
});

test('zoe - alice tries to complete after completion has already occurred', async t => {
  t.plan(6);
  // Setup zoe and mints
  const { moolaKit, simoleanKit, moola, simoleans, zoe, vatAdminState } =
    setup();

  // Setup Alice
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(3n));
  const aliceMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const aliceSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);
  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');
  const issuerKeywordRecord = harden({
    ContributionA: moolaKit.issuer,
    ContributionB: simoleanKit.issuer,
  });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
  );

  const aliceProposal = harden({
    give: { ContributionA: moola(3n) },
    want: { ContributionB: simoleans(7n) },
  });
  const alicePayments = { ContributionA: aliceMoolaPayment };

  const aliceSeat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );

  t.is(await E(aliceSeat).getOfferResult(), 'The offer was accepted');

  await t.throwsAsync(() => E(aliceSeat).tryExit(), {
    message: /seat has (already|been) exited/,
  });

  const moolaPayout = await aliceSeat.getPayout('ContributionA');
  const simoleanPayout = await aliceSeat.getPayout('ContributionB');

  // Alice got back what she put in
  t.deepEqual(
    await moolaKit.issuer.getAmountOf(moolaPayout),
    aliceProposal.give.ContributionA,
  );

  // Alice didn't get any of what she wanted
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(simoleanPayout),
    simoleans(0n),
  );

  // 9: Alice deposits her refund to ensure she can
  await aliceMoolaPurse.deposit(moolaPayout);
  await aliceSimoleanPurse.deposit(simoleanPayout);

  // Assert that the correct refund was achieved.
  // Alice had 3 moola and 0 simoleans.
  t.is(aliceMoolaPurse.getCurrentAmount().value, 3n);
  t.is(aliceSimoleanPurse.getCurrentAmount().value, 0n);
});

test('zoe - automaticRefund non-fungible', async t => {
  t.plan(1);
  // Setup zoe and mints
  const { ccIssuer, ccMint, cryptoCats, zoe, vatAdminState } =
    setupNonFungible();

  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);
  vatAdminState.installBundle('b1-automaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-automaticRefund');

  // Setup Alice
  const aliceCcPayment = ccMint.mintPayment(cryptoCats(harden(['tigger'])));

  // 1: Alice creates an automatic refund instance
  const issuerKeywordRecord = harden({ Contribution: ccIssuer });
  const { creatorInvitation } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
  );

  const aliceProposal = harden({
    give: { Contribution: cryptoCats(harden(['tigger'])) },
    exit: { onDemand: null },
  });
  const alicePayments = { Contribution: aliceCcPayment };

  const seat = await E(zoe).offer(
    creatorInvitation,
    aliceProposal,
    alicePayments,
  );

  const aliceCcPayout = await seat.getPayout('Contribution');

  // Alice got back what she put in
  t.deepEqual(
    await ccIssuer.getAmountOf(aliceCcPayout),
    aliceProposal.give.Contribution,
  );
});
