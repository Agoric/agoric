import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';

import { setup } from '../setupBasicMints.js';
import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { depositToSeat } from '../../../src/contractSupport/zoeHelpers.js';
import { makeOffer } from '../makeOffer.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractRoot = `${dirname}/../zcf/zcfTesterContract.js`;

async function setupContract(moolaIssuer, bucksIssuer) {
  /** @type {any} */
  let testJig;
  const setJig = jig => {
    testJig = jig;
  };
  const fakeVatAdmin = makeFakeVatAdmin(setJig);
  const zoe = makeZoeForTest(fakeVatAdmin.admin);

  // pack the contract
  const contractBundle = await bundleSource(contractRoot);
  fakeVatAdmin.vatAdminState.installBundle('b1-contract', contractBundle);

  // install the contract
  const installation = await E(zoe).installBundleID('b1-contract');

  // Alice creates an instance
  const issuerKeywordRecord = harden({
    Pixels: moolaIssuer,
    Money: bucksIssuer,
  });

  await E(zoe).startInstance(installation, issuerKeywordRecord);

  /** @type {ZCF} */
  const zcf = testJig.zcf;
  return { zoe, zcf };
}

test(`depositToSeat - groundZero`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
  );
  const newBucks = bucksMint.mintPayment(bucks(2n));
  await depositToSeat(zcf, zcfSeat, { B: bucks(2n) }, { B: newBucks });
  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    { A: moola(0n), B: bucks(7n) },
    'should add deposit',
  );
});

test(`depositToSeat - keyword variations`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
  );
  const newBucks = bucksMint.mintPayment(bucks(2n));
  await depositToSeat(zcf, zcfSeat, { C: bucks(2n) }, { C: newBucks });
  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    { A: moola(0n), B: bucks(5n), C: bucks(2n) },
    'should add deposit',
  );
});

test(`depositToSeat - mismatched keywords`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
  );
  const newBucks = bucksMint.mintPayment(bucks(2n));
  await t.throwsAsync(
    async () => depositToSeat(zcf, zcfSeat, { C: bucks(2n) }, { D: newBucks }),
    {
      message:
        'The "D" keyword in the paymentKeywordRecord was not a keyword in proposal.give, which had keywords: ["C"]',
    },
    'mismatched keywords',
  );
  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    { A: moola(0n), B: bucks(5n) },
    'should add deposit',
  );
});
