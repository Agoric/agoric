import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';

import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { setup } from '../setupBasicMints.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const automaticRefundRoot = `${dirname}/brokenAutoRefund.js`;

test('zoe - brokenAutomaticRefund', async t => {
  t.plan(1);
  // Setup zoe and mints
  const { moolaKit } = setup();
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(fakeVatAdmin);
  // Pack the contract.
  const bundle = await bundleSource(automaticRefundRoot);
  vatAdminState.installBundle('b1-brokenAutomaticRefund', bundle);
  const installation = await E(zoe).installBundleID('b1-brokenAutomaticRefund');

  const issuerKeywordRecord = harden({ Contribution: moolaKit.issuer });

  // Alice tries to create an instance, but the contract is badly
  // written.
  await t.throwsAsync(
    async () => E(zoe).startInstance(installation, issuerKeywordRecord),
    { message: 'The contract did not correctly return a creatorInvitation' },
    'startInstance should have thrown',
  );
});
