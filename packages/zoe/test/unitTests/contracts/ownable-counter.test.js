import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { GET_METHOD_NAMES } from '@endo/marshal';

import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const root = `${dirname}/ownable-counter.js`;

test('zoe - ownable-counter contract', async t => {
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(fakeVatAdmin);
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const invitationBrand = await E(invitationIssuer).getBrand();

  // Pack the contract.
  const bundle = await bundleSource(root);
  vatAdminState.installBundle('b1-ownable-counter', bundle);
  /** @type {Installation<import('./ownable-counter.js').start>} */
  const installation = await E(zoe).installBundleID('b1-ownable-counter');

  const { creatorFacet: firstCounter, publicFacet: viewCounter } = await E(
    zoe,
  ).startInstance(
    installation,
    undefined,
    undefined,
    harden({
      count: 3n,
    }),
    'c1-ownable-counter',
  );

  await t.throwsAsync(
    // @ts-expect-error method of underlying that ownable doesn't allow
    E(firstCounter).toBeAttenuated(),
    {
      message:
        'target has no method "toBeAttenuated", has ["__getInterfaceGuard__","__getMethodNames__","getInvitationCustomDetails","incr","makeTransferInvitation"]',
    },
  );

  // the following tests could invoke `firstCounter` and `viewCounter`
  // synchronously. But we don't in order to better model the user
  // code that might be remote.

  t.deepEqual(await E(firstCounter)[GET_METHOD_NAMES](), [
    '__getInterfaceGuard__',
    '__getMethodNames__',
    'getInvitationCustomDetails',
    'incr',
    'makeTransferInvitation',
  ]);

  t.is(await E(firstCounter).incr(), 4n);
  t.is(await E(viewCounter).view(), 4n);

  t.deepEqual(await E(firstCounter).getInvitationCustomDetails(), {
    count: 4n,
  });

  const invite = await E(firstCounter).makeTransferInvitation();

  t.deepEqual(await E(firstCounter)[GET_METHOD_NAMES](), [
    '__getInterfaceGuard__',
    '__getMethodNames__',
    'getInvitationCustomDetails',
    'incr',
    'makeTransferInvitation',
  ]);

  await t.throwsAsync(
    async () => E(firstCounter).getInvitationCustomDetails(),
    {
      message: '"OwnableCounter_caretaker" revoked',
    },
  );
  await t.throwsAsync(async () => E(firstCounter).incr(), {
    message: '"OwnableCounter_caretaker" revoked',
  });
  t.is(await E(viewCounter).view(), 4n);

  const inviteAmount = await E(invitationIssuer).getAmountOf(invite);

  t.deepEqual(inviteAmount, {
    brand: invitationBrand,
    value: [
      {
        description: 'transfer',
        installation,
        handle: inviteAmount.value[0].handle,
        instance: inviteAmount.value[0].instance,
        customDetails: {
          count: 4n,
        },
      },
    ],
  });

  const reviveCounterSeat = await E(zoe).offer(invite);

  const counter2 = await E(reviveCounterSeat).getOfferResult();
  t.is(await E(reviveCounterSeat).hasExited(), true);

  t.is(await E(viewCounter).view(), 4n);
  t.deepEqual(await E(counter2).getInvitationCustomDetails(), {
    count: 4n,
  });

  t.is(await E(counter2).incr(), 5n);

  t.is(await E(viewCounter).view(), 5n);
  t.deepEqual(await E(counter2).getInvitationCustomDetails(), {
    count: 5n,
  });
});
