// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';

import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';

import { makeZoeKit } from '../../../src/zoeService/zoe.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const mintPaymentsRoot = `${dirname}/../../../src/contracts/mintPayments.js`;

test('zoe - mint payments', async t => {
  t.plan(2);
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);

  const makeAlice = () => {
    return {
      installCode: async () => {
        // pack the contract
        const bundle = await bundleSource(mintPaymentsRoot);
        // install the contract
        vatAdminState.installBundle('b1-mintpayments', bundle);
        const installationP = E(zoe).installBundleID('b1-mintpayments');
        return installationP;
      },
      startInstance: async installation => {
        const adminP = E(zoe).startInstance(installation);
        return adminP;
      },
    };
  };

  const makeBob = installation => {
    return {
      offer: async untrustedInvitation => {
        const invitationIssuer = E(zoe).getInvitationIssuer();
        const invitation = claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const {
          value: {
            payload: [[invitationValue]],
          },
        } = await E(invitationIssuer).getAmountOf(invitation);

        t.is(
          invitationValue.installation,
          installation,
          'installation is mintPayment',
        );

        const { instance } = invitationValue;

        const seat = await E(zoe).offer(invitation);

        const paymentP = E(seat).getPayout('Token');

        // Let's get the tokenIssuer from the contract so we can evaluate
        // what we get as our payout
        const publicFacet = await E(zoe).getPublicFacet(instance);
        const tokenIssuer = await E(publicFacet).getTokenIssuer();
        const tokenBrand = await E(tokenIssuer).getBrand();

        const tokens1000 = await AmountMath.make(tokenBrand, 1000n);
        const tokenPayoutAmount = await E(tokenIssuer).getAmountOf(paymentP);

        // Bob got 1000 tokens
        t.deepEqual(tokenPayoutAmount, tokens1000);
      },
    };
  };

  // Setup Alice
  const alice = await makeAlice();
  const installation = await alice.installCode();
  const { creatorFacet } = await E(alice).startInstance(installation);
  const invitation = E(creatorFacet).makeInvitation(1000n);

  // Setup Bob
  const bob = makeBob(installation);
  await bob.offer(invitation);
});

test('zoe - mint payments with unrelated give and want', async t => {
  t.plan(3);
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);
  const moolaKit = makeIssuerKit('moola');
  const simoleanKit = makeIssuerKit('simolean');

  const makeAlice = () => {
    return {
      installCode: async () => {
        // pack the contract
        const bundle = await bundleSource(mintPaymentsRoot);
        // install the contract
        vatAdminState.installBundle('b1-mintpayments', bundle);
        const installationP = E(zoe).installBundleID('b1-mintpayments');
        return installationP;
      },
      startInstance: async installation => {
        const issuerKeywordRecord = harden({
          Asset: moolaKit.issuer,
          Price: simoleanKit.issuer,
        });
        const adminP = await E(zoe).startInstance(
          installation,
          issuerKeywordRecord,
        );
        return adminP;
      },
    };
  };

  const makeBob = (installation, moolaPayment) => {
    return {
      offer: async untrustedInvitation => {
        const invitationIssuer = E(zoe).getInvitationIssuer();
        const invitation = claim(
          E(invitationIssuer).makeEmptyPurse(),
          untrustedInvitation,
        );

        const {
          value: {
            payload: [[invitationValue]],
          },
        } = await E(invitationIssuer).getAmountOf(invitation);

        t.is(
          invitationValue.installation,
          installation,
          'installation is mintPayment',
        );

        const { instance } = invitationValue;

        const proposal = harden({
          give: { Asset: AmountMath.make(moolaKit.brand, 10n) },
          want: { Price: AmountMath.make(simoleanKit.brand, 100n) },
        });
        const paymentKeywordRecord = harden({
          Asset: moolaPayment,
        });
        const seat = await E(zoe).offer(
          invitation,
          proposal,
          paymentKeywordRecord,
        );

        const tokenPaymentP = E(seat).getPayout('Token');
        const moolaRefundP = E(seat).getPayout('Asset');

        // Let's get the tokenIssuer from the contract so we can evaluate
        // what we get as our payout
        const publicFacet = await E(zoe).getPublicFacet(instance);
        const tokenIssuer = await E(publicFacet).getTokenIssuer();
        const tokenBrand = await E(tokenIssuer).getBrand();

        const tokens1000 = await AmountMath.make(tokenBrand, 1000n);
        const tokenPayoutAmount = await E(tokenIssuer).getAmountOf(
          tokenPaymentP,
        );

        // Bob got 1000 tokens
        t.deepEqual(tokenPayoutAmount, tokens1000);

        // Got refunded all the moola given
        t.deepEqual(
          await E(moolaKit.issuer).getAmountOf(moolaRefundP),
          AmountMath.make(moolaKit.brand, 10n),
        );
      },
    };
  };

  // Setup Alice
  const alice = await makeAlice();
  const installation = await alice.installCode();
  const { creatorFacet } = await E(alice).startInstance(installation);
  const invitation = E(creatorFacet).makeInvitation(1000n);

  // Setup Bob
  const bob = makeBob(
    installation,
    moolaKit.mint.mintPayment(AmountMath.make(moolaKit.brand, 10n)),
  );
  await bob.offer(invitation);
});
