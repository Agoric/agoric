import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { AmountMath } from '@agoric/ertp';

import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const root = `${dirname}/two-invitations.js`;

test('plural invitation details', async t => {
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(fakeVatAdmin);
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  // Pack the contract.
  const bundle = await bundleSource(root);
  vatAdminState.installBundle('a1-two-invitations', bundle);
  const installation = await E(zoe).installBundleID('a1-two-invitations');

  const { creatorFacet: twoInvitations } = await E(zoe).startInstance(
    installation,
    undefined,
    undefined,
    undefined,
    'a1-two-invitations',
  );

  const i1 = await E(twoInvitations).get1();
  const i2 = await E(twoInvitations).get2();

  const i1Amount = await E(invitationIssuer).getAmountOf(i1);
  const i2Amount = await E(invitationIssuer).getAmountOf(i2);
  const bothAmount = AmountMath.add(i1Amount, i2Amount);

  const i1Detail = await E(zoe).getInvitationDetails(i1);
  const i2Detail = await E(zoe).getInvitationDetails(i2);

  t.deepEqual(i1Detail, {
    ...i1Detail,
    description: 'invite1',
    customDetails: {
      i: 1,
    },
  });

  t.deepEqual(i2Detail, {
    ...i2Detail,
    description: 'invite2',
    customDetails: {
      i: 2,
    },
  });

  const invitePurse = E(invitationIssuer).makeEmptyPurse();
  t.true(await E(invitationIssuer).isLive(i1));
  t.true(await E(invitationIssuer).isLive(i2));

  await E(invitePurse).deposit(i1);
  await E(invitePurse).deposit(i2);

  t.false(await E(invitationIssuer).isLive(i1));
  t.false(await E(invitationIssuer).isLive(i2));

  const bothPayment = await E(invitePurse).withdraw(bothAmount);

  await t.throwsAsync(async () => E(zoe).getInvitationDetails(bothPayment), {
    message: 'Expected exactly 1 invitation, not 2',
  });
});
