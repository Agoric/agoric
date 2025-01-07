import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { makeIssuerKit, AmountMath } from '../../src/index.js';
import { combine, split } from '../../src/legacy-payment-helpers.js';

const { isEqual } = AmountMath;

// See https://github.com/Agoric/agoric-sdk/pull/7113#discussion_r1136255069
test('no lost assets on non-atomic combine failure', async t => {
  const { issuer, mint, brand } = makeIssuerKit('precious');
  const recoveryPurse = issuer.makeEmptyPurse();
  /** @param {bigint} num */
  const precious = num => AmountMath.make(brand, num);
  const payment1 = mint.mintPayment(precious(39n));
  const payment2 = payment1; // "accidental" aliasing
  await t.throwsAsync(
    async () => combine(recoveryPurse, [payment1, payment2]),
    {
      message:
        /^".*" was not a live payment for brand ".*". It could be a used-up payment, a payment for another brand, or it might not be a payment at all.$/,
    },
  );

  const live = await issuer.isLive(payment1);
  t.assert(!live); // demonstrates non-failure atomicity
  t.assert(isEqual(recoveryPurse.getCurrentAmount(), precious(39n)));
});

// See https://github.com/Agoric/agoric-sdk/pull/7113#discussion_r1136249574
test('no lost assets on non-atomic split failure', async t => {
  const { issuer, mint, brand } = makeIssuerKit('precious');
  const recoveryPurse = issuer.makeEmptyPurse();
  /** @param {bigint} num */
  const precious = num => AmountMath.make(brand, num);
  const srcPayment = mint.mintPayment(precious(78n));
  await t.throwsAsync(
    async () => split(recoveryPurse, srcPayment, precious(100n)),
    {
      message: '-22 is negative',
    },
  );

  const live = await issuer.isLive(srcPayment);
  t.assert(!live); // demonstrates non-failure atomicity
  t.assert(isEqual(recoveryPurse.getCurrentAmount(), precious(78n)));
});
