// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';

import { makeZoeKit } from '../../../../src/zoeService/zoe.js';
import { makeFakeVatAdmin } from '../../../../tools/fakeVatAdmin.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const attestationRoot = `${dirname}/../../../../src/contracts/attestation/attestation.js`;

test('attestation contract basic tests', async t => {
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const bundle = await bundleSource(attestationRoot);
  vatAdminState.installBundle('b1-contract', bundle);

  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);
  const installation = await E(zoe).installBundleID('b1-contract');

  const bldIssuerKit = makeIssuerKit(
    'BLD',
    AssetKind.NAT,
    harden({
      decimalPlaces: 6,
    }),
  );
  const uBrand = bldIssuerKit.brand;
  const uIssuer = bldIssuerKit.issuer;

  const issuerKeywordRecord = harden({ Underlying: uIssuer });

  let currentTime = 10n;

  const mockAuthority = Far(
    'stakeReporter',
    /**
     * @type {{
     *   getAccountState: (
     *     address: Address,
     *     brand: Brand,
     *   ) => {
     *     total: Amount;
     *     bonded: Amount;
     *     locked: Amount;
     *     currentTime: Timestamp;
     *   };
     * }}
     */ ({
      getAccountState: (_address, _brand) => {
        return harden({
          total: AmountMath.make(uBrand, 500n),
          bonded: AmountMath.make(uBrand, 200n),
          locked: AmountMath.make(uBrand, 10n),
          currentTime,
        });
      },
    }),
  );

  const customTerms = harden({
    returnableAttName: 'BldAttLoc',
  });

  const { publicFacet, creatorFacet } = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    customTerms,
  );

  await E(creatorFacet).addAuthority(mockAuthority);
  const brand = await E(publicFacet).getBrand();
  const issuer = await E(publicFacet).getIssuer();

  const address1 = 'address1';

  /** @type {AttMaker} */
  const attMaker = await E(creatorFacet).getAttMaker(address1);

  // Try to make a lien greater than the total
  const largeAmount = AmountMath.make(uBrand, 1000n);
  await t.throwsAsync(() => E(attMaker).makeAttestation(largeAmount), {
    message:
      'Only {"brand":"[Alleged: BLD brand]","value":"[500n]"} was unliened, but an attestation was attempted for {"brand":"[Alleged: BLD brand]","value":"[1000n]"}',
  });

  const amount50 = AmountMath.make(uBrand, 50n);

  // check that no lien was successful so far
  const liened = await E(creatorFacet).getLiened(address1, currentTime, uBrand);
  t.deepEqual(liened, AmountMath.makeEmpty(uBrand));

  // Make a normal lien
  const returnable1 = await E(attMaker).makeAttestation(amount50);

  t.deepEqual(
    await E(issuer).getAmountOf(returnable1),
    AmountMath.make(
      brand,
      harden([
        {
          address: 'address1',
          amountLiened: amount50,
        },
      ]),
    ),
  );

  const liened2 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened2, amount50);

  // Make another normal lien

  const amount25 = AmountMath.make(uBrand, 25n);
  const returnable2 = await E(attMaker).makeAttestation(amount25);

  t.deepEqual(
    await E(issuer).getAmountOf(returnable2),
    AmountMath.make(
      brand,
      harden([
        {
          address: 'address1',
          amountLiened: amount25,
        },
      ]),
    ),
  );

  const liened3 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened3, AmountMath.add(amount50, amount25));

  const returnAttestation = async att => {
    const invitation = E(publicFacet).makeReturnAttInvitation();
    const attestationAmount = await E(issuer).getAmountOf(att);
    const proposal = harden({ give: { Attestation: attestationAmount } });
    const payments = harden({ Attestation: att });
    const userSeat = E(zoe).offer(invitation, proposal, payments);
    const payout = await E(userSeat).getPayouts();
    const amounts = await Promise.all(
      Object.values(payout).map(paymentP => E(issuer).getAmountOf(paymentP)),
    );
    t.true(amounts.every(amount => AmountMath.isEmpty(amount, brand)));
    return userSeat;
  };

  // Return returnable1 for 50 bld
  await returnAttestation(returnable1);

  // Total liened amount is reduced
  const liened4 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened4, amount25);

  // Move the currentTime forward so the shortExpiration attestation
  // expires (50 bld)
  currentTime = 16n;
  const liened5 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened5, amount25); // the amount50 lien expired, leaving 25

  // Move the currentTime forward so the longExpiration attestation
  // expires. This should not change the total liened because there is
  // an outstanding returnable attestation
  currentTime = 101n;
  const liened6 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened6, amount25);

  // Return the last returnable attestation for 25
  await returnAttestation(returnable2);

  // Now the liened Amount should be empty
  const liened7 = await E(creatorFacet).getLiened(
    address1,
    currentTime,
    uBrand,
  );
  t.deepEqual(liened7, AmountMath.makeEmpty(uBrand));
});

// TODO: test with various unexpected or strange values from
// E(stakeReporter).getAccountState(). Possibly better suited as a unit test
// with `assertPrerequisites`
