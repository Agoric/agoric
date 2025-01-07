import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { Far } from '@endo/marshal';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';

import { burnInvitation } from '../../../src/zoeService/offer/burnInvitation.js';

test('burnInvitation', async t => {
  const mockInvitationKit = makeIssuerKit('mockInvitation', AssetKind.SET);

  const instanceHandle = Far('handle', {});
  const invitationHandle = Far('handle', {});

  const invitation = mockInvitationKit.mint.mintPayment(
    AmountMath.make(
      mockInvitationKit.brand,
      harden([{ instance: instanceHandle, handle: invitationHandle }]),
    ),
  );

  t.deepEqual(await burnInvitation(mockInvitationKit.issuer, invitation), {
    instanceHandle,
    invitationHandle,
  });
});

test('burnInvitation - not an invitation', async t => {
  const mockInvitationKit = makeIssuerKit('mockInvitation', AssetKind.SET);

  await t.throwsAsync(
    // @ts-expect-error invalid payment for the purposes of testing
    async () => burnInvitation(mockInvitationKit.issuer, undefined),
    { message: 'A Zoe invitation is required, not "[undefined]"' },
  );
});

test('burnInvitation - invitation already used', async t => {
  const mockInvitationKit = makeIssuerKit('mockInvitation', AssetKind.SET);

  const instanceHandle = Far('handle', {});
  const invitationHandle = Far('handle', {});

  const invitation = mockInvitationKit.mint.mintPayment(
    AmountMath.make(
      mockInvitationKit.brand,
      harden([{ instance: instanceHandle, handle: invitationHandle }]),
    ),
  );

  t.deepEqual(await burnInvitation(mockInvitationKit.issuer, invitation), {
    instanceHandle,
    invitationHandle,
  });

  await t.throwsAsync(
    async () => burnInvitation(mockInvitationKit.issuer, invitation),
    {
      message:
        'A Zoe invitation is required, not "[Alleged: mockInvitation payment]"',
    },
  );
});

test('burnInvitation - multiple invitations', async t => {
  const mockInvitationKit = makeIssuerKit('mockInvitation', AssetKind.SET);

  const instanceHandle = Far('handle', {});
  const invitationHandle1 = Far('handle', {});
  const invitationHandle2 = Far('handle', {});

  const invitations = mockInvitationKit.mint.mintPayment(
    AmountMath.make(
      mockInvitationKit.brand,
      harden([
        { instance: instanceHandle, handle: invitationHandle1 },
        { instance: instanceHandle, handle: invitationHandle2 },
      ]),
    ),
  );

  await t.throwsAsync(
    async () => burnInvitation(mockInvitationKit.issuer, invitations),
    {
      message: 'Only one invitation can be redeemed at a time',
    },
  );
});
