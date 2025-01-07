import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';

import { setup } from '../setupBasicMints.js';
import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { offerTo, swapExact } from '../../../src/contractSupport/zoeHelpers.js';
import { makeOffer } from '../makeOffer.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractRoot = `${dirname}/../zcf/zcfTesterContract.js`;

const setupContract = async (moolaIssuer, bucksIssuer) => {
  const instanceToZCF = new Map();
  const setJig = jig => {
    instanceToZCF.set(jig.instance, jig.zcf);
  };
  const fakeVatAdmin = makeFakeVatAdmin(setJig);
  const zoe = makeZoeForTest(fakeVatAdmin.admin);

  // pack the contract
  const bundle = await bundleSource(contractRoot);
  fakeVatAdmin.vatAdminState.installBundle('b1-contract', bundle);
  // install the contract
  const installation = await E(zoe).installBundleID('b1-contract');

  // Create TWO instances of the zcfTesterContract which have
  // different keywords
  const issuerKeywordRecord1 = harden({
    TokenJ: moolaIssuer,
    TokenK: bucksIssuer,
  });

  const issuerKeywordRecord2 = harden({
    TokenL: moolaIssuer,
    TokenM: bucksIssuer,
  });

  // contract instance A
  const { instance: instanceA } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord1,
  );

  // contract instance B
  const { instance: instanceB } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord2,
  );

  // instanceToZCF a map containing both instances as keys and zcfs as
  // values
  return { zoe, instanceToZCF, instanceA, instanceB };
};

test(`offerTo - basic usage`, async t => {
  const { moola, moolaIssuer, moolaMint, bucksMint, bucks, bucksIssuer } =
    setup();
  const { zoe, instanceToZCF, instanceA, instanceB } = await setupContract(
    moolaIssuer,
    bucksIssuer,
  );

  const zcfA = instanceToZCF.get(instanceA);
  const zcfB = instanceToZCF.get(instanceB);

  // Make an offer from contract A to contract B from a seat in
  // contract A, and deposit the winnings in a different seat on contract A.

  // Create a fromSeat on contract instance A that starts with 5 bucks
  // under keyword TokenK

  const { zcfSeat: fromSeatContractA } = await makeOffer(
    zoe,
    zcfA,
    harden({ want: harden({}), give: { TokenK: bucks(5n) } }),
    harden({ TokenK: bucksMint.mintPayment(bucks(5n)) }),
  );

  // Create a seat in contract instance B to exchange with.

  const { zcfSeat: contractBCollateralSeat } = await makeOffer(
    zoe,
    zcfB,
    harden({ want: { TokenM: bucks(5n) }, give: { TokenL: moola(10n) } }),
    harden({ TokenL: moolaMint.mintPayment(moola(10n)) }),
  );

  // create an invitation for contract instance B. This offer will
  // take the 5 bucks and give 10 moola in exchange.

  const successMsg = 'offer to contractB successful';

  const proposalBShape = harden({
    give: {
      TokenM: bucksIssuer.getBrand().getAmountShape(),
    },
    want: {
      TokenL: moolaIssuer.getBrand().getAmountShape(),
    },
    // multiples: 1n,
    exit: {
      onDemand: null,
    },
  });

  const offerHandler = seat => {
    swapExact(zcfB, contractBCollateralSeat, seat);
    return successMsg;
  };
  const contractBInvitation = zcfB.makeInvitation(
    offerHandler,
    'contractB invitation',
    undefined,
    proposalBShape,
  );

  // Map the keywords in contract A to the keywords in contract B
  const keywordMapping = harden({
    TokenJ: 'TokenL',
    TokenK: 'TokenM',
  });

  const proposal = harden({
    give: {
      TokenM: bucks(5n),
    },
    want: {
      TokenL: moola(10n),
    },
  });

  const { zcfSeat: toSeatContractA } = zcfA.makeEmptySeatKit();
  t.deepEqual(toSeatContractA.getCurrentAllocation(), {});

  const { userSeatPromise: contractBUserSeat, deposited } = await offerTo(
    zcfA,
    contractBInvitation,
    keywordMapping,
    proposal,
    fromSeatContractA,
    toSeatContractA,
  );

  await deposited;
  // The toSeat successfully got the payout from the offer to Contract
  // Instance B
  t.deepEqual(toSeatContractA.getCurrentAllocation(), {
    TokenJ: moola(10n),
    TokenK: bucks(0n),
  });

  // The offerResult is as expected
  t.is(await E(contractBUserSeat).getOfferResult(), successMsg);
});

test(`offerTo - violates offer safety of fromSeat`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, instanceToZCF, instanceA, instanceB } = await setupContract(
    moolaIssuer,
    bucksIssuer,
  );

  const zcfA = instanceToZCF.get(instanceA);
  const zcfB = instanceToZCF.get(instanceB);

  // Make an offer from contract A to contract B from a seat in
  // contract A, and deposit the winnings in a different seat on contract A.

  // Create a fromSeat on contract instance A that starts with 5 bucks
  // under keyword TokenK

  const { zcfSeat: fromSeatContractA } = await makeOffer(
    zoe,
    zcfA,
    // Actually enforce offer safety
    harden({ want: { TokenJ: moola(3n) }, give: { TokenK: bucks(5n) } }),
    harden({ TokenK: bucksMint.mintPayment(bucks(5n)) }),
  );

  const offerHandler = () => {};
  const contractBInvitation = zcfB.makeInvitation(
    offerHandler,
    'contractB invitation',
  );

  // Map the keywords in contract A to the keywords in contract B
  const keywordMapping = harden({
    TokenJ: 'TokenL',
    TokenK: 'TokenM',
  });

  const proposal = harden({
    give: {
      TokenM: bucks(5n),
    },
    want: {
      TokenL: moola(10n),
    },
  });

  const { zcfSeat: toSeatContractA } = zcfA.makeEmptySeatKit();
  t.deepEqual(toSeatContractA.getCurrentAllocation(), {});

  await t.throwsAsync(
    async () =>
      offerTo(
        zcfA,
        contractBInvitation,
        keywordMapping,
        proposal,
        fromSeatContractA,
        toSeatContractA,
      ),
    {
      message:
        /Offer safety was violated by the proposed allocation: {"Token[JK]":{"brand":"\[Alleged: .* brand]","value":"\[0n]"},"Token[KJ]":{"brand":"\[Alleged: .* brand]","value":"\[0n]"}}. Proposal was/,
    },
  );

  t.deepEqual(fromSeatContractA.getCurrentAllocation(), {
    TokenJ: moola(0n),
    TokenK: bucks(5n),
  });
  t.falsy(fromSeatContractA.hasExited());
});

test(`throws handler errors during getOfferResult`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, instanceToZCF, instanceA, instanceB } = await setupContract(
    moolaIssuer,
    bucksIssuer,
  );

  const zcfA = instanceToZCF.get(instanceA);
  const zcfB = instanceToZCF.get(instanceB);

  // Make an offer from contract A to contract B from a seat in
  // contract A, and deposit the winnings in a different seat on contract A.

  // Create a fromSeat on contract instance A that starts with 5 bucks
  // under keyword TokenK

  const { zcfSeat: fromSeatContractA } = await makeOffer(
    zoe,
    zcfA,
    harden({ want: harden({}), give: { TokenK: bucks(5n) } }),
    harden({ TokenK: bucksMint.mintPayment(bucks(5n)) }),
  );

  const contractBInvitation = zcfB.makeInvitation(
    () => assert.fail('🚨'),
    'contractB invitation',
  );

  // Map the keywords in contract A to the keywords in contract B
  const keywordMapping = harden({
    TokenJ: 'TokenL',
    TokenK: 'TokenM',
  });

  const proposal = harden({
    give: {
      TokenM: bucks(5n),
    },
    want: {
      TokenL: moola(10n),
    },
  });

  const { zcfSeat: toSeatContractA } = zcfA.makeEmptySeatKit();

  // doesn't call the broken handler yet
  const { userSeatPromise: contractBUserSeat, deposited } = await offerTo(
    zcfA,
    contractBInvitation,
    keywordMapping,
    proposal,
    fromSeatContractA,
    toSeatContractA,
  );

  // doesn't call the broken handler yet
  await deposited;
  await contractBUserSeat;

  // only getOfferResult calls the broken handler
  try {
    await E(contractBUserSeat).getOfferResult();
  } catch (e) {
    t.is(e.message, '🚨');
  }
});
