// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { M, mustMatch, keyEQ } from '@agoric/store';
import { AmountMath, AssetKind, BrandShape } from '@agoric/ertp';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';

import buildManualTimer from '../../../tools/manualTimer.js';
import { setup } from '../setupBasicMints.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const coveredCallRoot = `${dirname}/../../../src/contracts/coveredCall.js`;
const atomicSwapRoot = `${dirname}/../../../src/contracts/atomicSwap.js`;

// Alice makes a covered call and escrows. She shares the invitation to
// Bob. Bob tries to sell the invitation to Dave through a swap. Can Bob
// trick Dave? Can Dave describe what it is that he wants in the swap
// offer pattern?
test('zoe - coveredCall with swap for invitation', async t => {
  t.plan(24);
  // Setup the environment
  const timer = buildManualTimer(t.log);
  const {
    moolaKit,
    simoleanKit,
    bucksKit,
    moola,
    simoleans,
    bucks,
    zoe,
    vatAdminState,
  } = setup();
  // Pack the contract.
  const coveredCallBundle = await bundleSource(coveredCallRoot);

  vatAdminState.installBundle('b1-coveredcall', coveredCallBundle);
  const coveredCallInstallation = await E(zoe).installBundleID(
    'b1-coveredcall',
  );
  const atomicSwapBundle = await bundleSource(atomicSwapRoot);

  vatAdminState.installBundle('b1-atomicswap', atomicSwapBundle);
  const swapInstallationId = await E(zoe).installBundleID('b1-atomicswap');

  // Setup Alice
  // Alice starts with 3 moola
  const aliceMoolaPayment = moolaKit.mint.mintPayment(moola(3n));
  const aliceMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const aliceSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();

  // Setup Bob
  // Bob starts with nothing
  const bobMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const bobSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();
  const bobBucksPurse = bucksKit.issuer.makeEmptyPurse();

  // Setup Dave
  // Dave starts with 1 buck
  const daveSimoleanPayment = simoleanKit.mint.mintPayment(simoleans(7n));
  const daveBucksPayment = bucksKit.mint.mintPayment(bucks(1n));
  const daveMoolaPurse = moolaKit.issuer.makeEmptyPurse();
  const daveSimoleanPurse = simoleanKit.issuer.makeEmptyPurse();
  const daveBucksPurse = bucksKit.issuer.makeEmptyPurse();

  // Alice creates a coveredCall instance of moola for simoleans
  const issuerKeywordRecord = harden({
    UnderlyingAsset: moolaKit.issuer,
    StrikePrice: simoleanKit.issuer,
  });
  const { creatorInvitation: aliceInvitation } = await E(zoe).startInstance(
    coveredCallInstallation,
    issuerKeywordRecord,
  );

  // Alice escrows with Zoe. She specifies her proposal,
  // which includes the amounts she gives and wants as well as the exit
  // conditions. In this case, she choses an exit condition of after
  // the deadline of "100" according to a particular timer. This is
  // meant to be something far in the future, and will not be
  // reached in this test.

  const aliceProposal = harden({
    give: { UnderlyingAsset: moola(3n) },
    want: { StrikePrice: simoleans(7n) },
    exit: {
      afterDeadline: {
        deadline: 100n, // we will not reach this
        timer,
      },
    },
  });
  const alicePayments = { UnderlyingAsset: aliceMoolaPayment };
  // Alice makes an option.
  const aliceSeat = await E(zoe).offer(
    aliceInvitation,
    aliceProposal,
    alicePayments,
  );

  const optionP = E(aliceSeat).getOfferResult();

  // Imagine that Alice sends the invitation to Bob (not done here since
  // this test doesn't actually have separate vats/parties)

  // Bob inspects the invitation payment and checks its information against the
  // questions that he has about whether it is worth being a counter
  // party in the covered call: Did the covered call use the
  // expected covered call installation (code)? Does it use the issuers
  // that he expects (moola and simoleans)?
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const invitationBrand = await E(invitationIssuer).getBrand();
  const bobExclOption = await claim(
    E(invitationIssuer).makeEmptyPurse(),
    optionP,
  );
  const optionAmount = await E(invitationIssuer).getAmountOf(bobExclOption);
  const optionDesc = optionAmount.value[0];
  const { customDetails } = optionDesc;
  assert(typeof customDetails === 'object');

  t.is(optionDesc.installation, coveredCallInstallation);
  t.is(optionDesc.description, 'exerciseOption');
  t.deepEqual(customDetails.underlyingAssets, { UnderlyingAsset: moola(3n) });
  t.deepEqual(customDetails.strikePrice, { StrikePrice: simoleans(7n) });
  t.is(customDetails.expirationDate, 100n);
  t.deepEqual(customDetails.timeAuthority, timer);

  // Let's imagine that Bob wants to create a swap to trade this
  // invitation for bucks.
  const swapIssuerKeywordRecord = harden({
    Asset: invitationIssuer,
    Price: bucksKit.issuer,
  });
  const { creatorInvitation: bobSwapInvitation } = await E(zoe).startInstance(
    swapInstallationId,
    swapIssuerKeywordRecord,
  );

  // Bob wants to swap an invitation with the same amount as his
  // current invitation from Alice. He wants 1 buck in return.
  const bobProposalSwap = harden({
    give: { Asset: await E(invitationIssuer).getAmountOf(bobExclOption) },
    want: { Price: bucks(1n) },
  });

  const bobPayments = harden({ Asset: bobExclOption });

  // Bob escrows his option in the swap
  // Bob makes an offer to the swap with his "higher order" invitation
  const bobSwapSeat = await E(zoe).offer(
    bobSwapInvitation,
    bobProposalSwap,
    bobPayments,
  );

  const daveSwapInvitationP = E(bobSwapSeat).getOfferResult();

  // Bob passes the swap invitation to Dave and tells him the
  // optionAmounts (basically, the description of the option)

  const {
    value: {
      payload: [[{ instance: swapInstance, installation: daveSwapInstallId }]],
    },
  } = await E(invitationIssuer).getAmountOf(daveSwapInvitationP);

  const daveSwapIssuers = await E(zoe).getIssuers(swapInstance);

  // Dave is looking to buy the option to trade his 7 simoleans for
  // 3 moola, and is willing to pay 1 buck for the option. He
  // checks that this instance matches what he wants

  // Did this swap use the correct swap installation? Yes
  t.is(daveSwapInstallId, swapInstallationId);

  // Is this swap for the correct issuers and has no other terms? Yes
  t.truthy(
    keyEQ(
      daveSwapIssuers,
      harden({
        Asset: invitationIssuer,
        Price: bucksKit.issuer,
      }),
    ),
  );

  const optionAmountPattern1 = harden({
    brand: M.any(),
    value: [
      M.splitRecord({
        handle: M.any(),
        instance: M.any(),
        installation: coveredCallInstallation,
        description: 'exerciseOption',
        customDetails: {
          underlyingAssets: { UnderlyingAsset: M.gte(moola(2n)) },
          strikePrice: { StrikePrice: M.lte(simoleans(8n)) },
          timeAuthority: timer,
          expirationDate: M.and(M.gte(50n), M.lte(300n)),
        },
      }),
    ],
  });

  mustMatch(optionAmount, optionAmountPattern1);

  const optionAmountPattern2 = harden({
    brand: BrandShape,
    value: [
      M.splitRecord({
        installation: coveredCallInstallation,
        description: 'exerciseOption',
        customDetails: {
          underlyingAssets: { UnderlyingAsset: M.gte(moola(2n)) },
          strikePrice: { StrikePrice: M.lte(simoleans(8n)) },
          timeAuthority: timer,
          expirationDate: M.and(M.gte(50n), M.lte(300n)),
        },
      }),
    ],
  });

  mustMatch(optionAmount, optionAmountPattern2);

  // What's actually up to be bought? Is it the kind of invitation that
  // Dave wants? What's the price for that invitation? Is it acceptable
  // to Dave? Bob can tell Dave this out of band, and if he lies,
  // Dave's offer will be rejected and he will get a refund. Dave
  // knows this to be true because he knows the swap.

  // Dave escrows his 1 buck with Zoe and forms his proposal
  const daveSwapProposal = harden({
    want: { Asset: optionAmount },
    give: { Price: bucks(1n) },
  });

  const daveSwapPayments = harden({ Price: daveBucksPayment });
  const daveSwapSeat = await E(zoe).offer(
    daveSwapInvitationP,
    daveSwapProposal,
    daveSwapPayments,
  );

  t.is(
    await daveSwapSeat.getOfferResult(),
    'The offer has been accepted. Once the contract has been completed, please check your payout',
  );

  const daveOption = await daveSwapSeat.getPayout('Asset');
  const daveBucksPayout = await daveSwapSeat.getPayout('Price');

  // Dave exercises his option by making an offer to the covered
  // call. First, he escrows with Zoe.

  const daveCoveredCallProposal = harden({
    want: { UnderlyingAsset: moola(3n) },
    give: { StrikePrice: simoleans(7n) },
  });
  const daveCoveredCallPayments = harden({
    StrikePrice: daveSimoleanPayment,
  });
  const daveCoveredCallSeat = await E(zoe).offer(
    daveOption,
    daveCoveredCallProposal,
    daveCoveredCallPayments,
  );

  t.is(
    await E(daveCoveredCallSeat).getOfferResult(),
    `The option was exercised. Please collect the assets in your payout.`,
  );

  // Dave should get 3 moola, Bob should get 1 buck, and Alice
  // get 7 simoleans
  const daveMoolaPayout = await daveCoveredCallSeat.getPayout(
    'UnderlyingAsset',
  );
  const daveSimoleanPayout = await daveCoveredCallSeat.getPayout('StrikePrice');
  const aliceMoolaPayout = await aliceSeat.getPayout('UnderlyingAsset');
  const aliceSimoleanPayout = await aliceSeat.getPayout('StrikePrice');
  const bobInvitationPayout = await bobSwapSeat.getPayout('Asset');
  const bobBucksPayout = await bobSwapSeat.getPayout('Price');

  t.deepEqual(await moolaKit.issuer.getAmountOf(daveMoolaPayout), moola(3n));
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(daveSimoleanPayout),
    simoleans(0n),
  );

  t.deepEqual(await moolaKit.issuer.getAmountOf(aliceMoolaPayout), moola(0n));
  t.deepEqual(
    await simoleanKit.issuer.getAmountOf(aliceSimoleanPayout),
    simoleans(7n),
  );

  t.deepEqual(
    await E(invitationIssuer).getAmountOf(bobInvitationPayout),
    AmountMath.makeEmpty(invitationBrand, AssetKind.SET),
  );
  t.deepEqual(await bucksKit.issuer.getAmountOf(bobBucksPayout), bucks(1n));

  // Alice deposits her payouts
  await aliceMoolaPurse.deposit(aliceMoolaPayout);
  await aliceSimoleanPurse.deposit(aliceSimoleanPayout);

  // Bob deposits his payouts
  await bobBucksPurse.deposit(bobBucksPayout);

  // Dave deposits his payouts
  await daveMoolaPurse.deposit(daveMoolaPayout);
  await daveSimoleanPurse.deposit(daveSimoleanPayout);
  await daveBucksPurse.deposit(daveBucksPayout);

  t.is(aliceMoolaPurse.getCurrentAmount().value, 0n);
  t.is(aliceSimoleanPurse.getCurrentAmount().value, 7n);

  t.is(bobMoolaPurse.getCurrentAmount().value, 0n);
  t.is(bobSimoleanPurse.getCurrentAmount().value, 0n);
  t.is(bobBucksPurse.getCurrentAmount().value, 1n);

  t.is(daveMoolaPurse.getCurrentAmount().value, 3n);
  t.is(daveSimoleanPurse.getCurrentAmount().value, 0n);
  t.is(daveBucksPurse.getCurrentAmount().value, 0n);
});
