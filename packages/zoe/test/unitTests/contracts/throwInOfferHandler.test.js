import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractRoot = `${dirname}/throwInOfferHandler.js`;

test('throw in offerHandler', async t => {
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(fakeVatAdmin);

  // pack the contract
  const bundle = await bundleSource(contractRoot);
  // install the contract
  vatAdminState.installBundle('b1-throw', bundle);
  const installation = await E(zoe).installBundleID('b1-throw');

  const { creatorFacet } = await E(zoe).startInstance(installation);

  const throwInOfferHandlerInvitation =
    E(creatorFacet).makeThrowInOfferHandlerInvitation();

  const throwInDepositToSeatInvitation =
    E(creatorFacet).makeThrowInDepositToSeatInvitation();

  const throwsInOfferHandlerSeat = E(zoe).offer(throwInOfferHandlerInvitation);

  const throwsInOfferHandlerResult = E(
    throwsInOfferHandlerSeat,
  ).getOfferResult();

  // Uncomment below to see what the user would see
  // await throwsInOfferHandlerResult;

  await t.throwsAsync(async () => throwsInOfferHandlerResult, {
    message: 'error thrown in offerHandler in contract',
  });

  const throwsInDepositToSeatSeat = E(zoe).offer(
    throwInDepositToSeatInvitation,
  );

  const throwsInDepositToSeatResult = E(
    throwsInDepositToSeatSeat,
  ).getOfferResult();

  // Uncomment below to see what the user would see
  // await throwsInDepositToSeatResult;

  // TODO: make this logging more informative, including information
  // about the error originating in the offerHandler in depositToSeat

  // Currently the entirety of the log is:

  // "Rejected promise returned by test. Reason:
  // Error {
  //   message: /"brand" not found: .*/,
  // }
  // › makeDetailedError (/Users/katesills/code/agoric-sdk/node_modules/ses/dist/ses.cjs:3437:17)
  // › fail (/Users/katesills/code/agoric-sdk/node_modules/ses/dist/ses.cjs:3582:19)
  // › baseAssert (/Users/katesills/code/agoric-sdk/node_modules/ses/dist/ses.cjs:3600:13)
  // › assertKeyExists (/Users/katesills/code/agoric-sdk/packages/store/src/weak-store.js:19:5)
  // › Object.get [as getByBrand] (/Users/katesills/code/agoric-sdk/packages/store/src/weak-store.js:27:7)
  // › getAmountMath (src/zoeService/zoe.js:44:46)
  // › src/cleanProposal.js:65:5
  // › Array.map (<anonymous>)
  // › coerceAmountKeywordRecord (src/cleanProposal.js:64:34)
  // › cleanProposal (src/cleanProposal.js:116:10)
  // › src/zoeService/zoe.js:408:28"

  await t.throwsAsync(async () => throwsInDepositToSeatResult, {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /"brand" not found: .*/,
      'key "[Alleged: token brand]" not found in collection "brandToIssuerRecord"',
  });
});
