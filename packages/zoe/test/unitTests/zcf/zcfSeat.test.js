import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';

import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { setup } from '../setupBasicMints.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractRoot = `${dirname}/zcfTesterContract.js`;

test(`zoe - zcfSeat.fail() doesn't throw`, async t => {
  const { moolaIssuer, simoleanIssuer } = setup();
  let testJig;
  const setJig = jig => {
    testJig = jig;
  };
  const { admin: fakeVatAdminSvc, vatAdminState } = makeFakeVatAdmin(setJig);
  const zoe = makeZoeForTest(fakeVatAdminSvc);

  // pack the contract
  const bundle = await bundleSource(contractRoot);
  // install the contract
  vatAdminState.installBundle('b1-zcftester', bundle);
  const installation = await E(zoe).installBundleID('b1-zcftester');

  // Alice creates an instance
  const issuerKeywordRecord = harden({
    Pixels: moolaIssuer,
    Money: simoleanIssuer,
  });

  // eslint-disable-next-line no-unused-vars
  const { creatorFacet } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
  );

  // The contract uses the testJig so the contractFacet
  // is available here for testing purposes
  /** @type {ZCF} */
  // @ts-expect-error cast
  const zcf = testJig.zcf;

  let firstSeat;

  const grabSeat = seat => {
    firstSeat = seat;
    return 'ok';
  };

  const failSeat = secondSeat => {
    firstSeat.fail(Error('first seat failed'));
    throw secondSeat.fail(Error('second seat failed'));
  };

  const invitation1 = await zcf.makeInvitation(grabSeat, 'seat1');
  const invitation2 = await zcf.makeInvitation(failSeat, 'seat2');

  const userSeat1 = await E(zoe).offer(invitation1);
  const userSeat2 = await E(zoe).offer(invitation2);

  const result = await E(userSeat1).getOfferResult();
  t.is(result, 'ok', `userSeat1 offer result`);

  const payouts = await E(userSeat2).getPayouts();
  t.deepEqual(payouts, {});

  await t.throwsAsync(E(userSeat2).getOfferResult(), {
    message: 'second seat failed',
  });
  await t.throwsAsync(async () => E(userSeat1).tryExit(), {
    message: 'Cannot exit; seat has already exited',
  });
  t.falsy(vatAdminState.getHasExited());
});
