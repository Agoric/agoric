import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';

import { setup } from './setupBasicMints.js';
import { makeZoeForTest } from '../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../tools/fakeVatAdmin.js';
import {
  depositToSeat,
  withdrawFromSeat,
} from '../../src/contractSupport/index.js';
import { assertPayoutAmount } from '../zoeTestHelpers.js';
import { makeOffer } from './makeOffer.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractRoot = `${dirname}/zcf/zcfTesterContract.js`;

const setupContract = async (moolaIssuer, bucksIssuer) => {
  /** @type {ZCF} */
  let zcf;
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin(jig => {
    zcf = jig.zcf;
  });
  const zoe = makeZoeForTest(fakeVatAdmin);

  // pack the contract
  const bundle = await bundleSource(contractRoot);
  vatAdminState.installBundle('b1-contract', bundle);
  // install the contract
  const installation = await E(zoe).installBundleID('b1-contract');

  // Alice creates an instance
  const issuerKeywordRecord = harden({
    Pixels: moolaIssuer,
    Money: bucksIssuer,
  });

  await E(zoe).startInstance(installation, issuerKeywordRecord);

  // @ts-expect-error may be used before being defined
  return { zoe, zcf };
};

const description = 'offerSeat for test';

test(`blockedOffers - deny`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);
  await zcf.setOfferFilter(['offerSeat for test']);

  await t.throwsAsync(
    async () =>
      makeOffer(
        zoe,
        zcf,
        harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
        harden({ B: bucksMint.mintPayment(bucks(5n)) }),
        undefined,
        description,
      ),
    { message: `not accepting offer with description "${description}"` },
  );
});

test(`blockedOffers - prefix`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);
  await zcf.setOfferFilter(['offerSeat for:']);

  await t.throwsAsync(
    async () =>
      makeOffer(
        zoe,
        zcf,
        harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
        harden({ B: bucksMint.mintPayment(bucks(5n)) }),
        undefined,
        'offerSeat for: test',
      ),
    { message: `not accepting offer with description "offerSeat for: test"` },
  );
});

test(`blockedOffers - allow empty`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
    undefined,
    description,
  );

  const newBucks = bucksMint.mintPayment(bucks(2n));
  await depositToSeat(zcf, zcfSeat, { C: bucks(2n) }, { C: newBucks });
  const promises = await withdrawFromSeat(zcf, zcfSeat, { C: bucks(2n) });

  await assertPayoutAmount(t, bucksIssuer, promises.C, bucks(2n), 'C is 2');
});

test(`blockedOffers - allow`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);
  await zcf.setOfferFilter(['seats', 'simple', 'offer:']);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
    undefined,
    description,
  );

  const newBucks = bucksMint.mintPayment(bucks(2n));
  await depositToSeat(zcf, zcfSeat, { C: bucks(2n) }, { C: newBucks });
  const promises = await withdrawFromSeat(zcf, zcfSeat, { C: bucks(2n) });

  await assertPayoutAmount(t, bucksIssuer, promises.C, bucks(2n), 'C is 2');
});

test(`blockedOffers - allow not blocked by incomplete prefix`, async t => {
  const { moola, moolaIssuer, bucksMint, bucks, bucksIssuer } = setup();
  const { zoe, zcf } = await setupContract(moolaIssuer, bucksIssuer);
  await zcf.setOfferFilter(['seats', 'simple', 'offer', 'offer:']);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: bucks(5n) } }),
    harden({ B: bucksMint.mintPayment(bucks(5n)) }),
    undefined,
    'offerSeat for test',
  );

  const newBucks = bucksMint.mintPayment(bucks(2n));
  await depositToSeat(zcf, zcfSeat, { C: bucks(2n) }, { C: newBucks });
  const promises = await withdrawFromSeat(zcf, zcfSeat, { C: bucks(2n) });

  await assertPayoutAmount(t, bucksIssuer, promises.C, bucks(2n), 'C is 2');
});
