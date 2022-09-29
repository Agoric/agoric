// @ts-check

import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { E, Far } from '@endo/far';

import { makeCopyBag } from '@agoric/store';
import { setupZCFTest } from '@agoric/zoe/test/unitTests/zcf/setupZcfTest.js';
import { makeAttestationFacets } from '../../src/stakeFactory/attestation.js';

/** @type { import('ava').TestFn<ReturnType<typeof makeContext> >} */
const test = unknownTest;
/**
 * @param {Brand<'nat'>} uBrand
 * @param {*} _t for debug logging
 * @returns {StakingAuthority}
 */
export const makeMockLienBridge = (uBrand, _t) => {
  const currentTime = 10n;
  const liened = new Map();
  const empty = AmountMath.make(uBrand, 0n);
  const state = {
    total: AmountMath.make(uBrand, 500n),
    bonded: AmountMath.make(uBrand, 200n),
    locked: AmountMath.make(uBrand, 10n),
    unbonding: AmountMath.make(uBrand, 0n),
  };
  const changeLiened = async (address, delta) => {
    const currentAmount = liened.get(address) || empty;
    const current = AmountMath.getValue(uBrand, currentAmount);
    const changed = current + delta;
    const changedAmount = AmountMath.make(uBrand, changed);
    // t.log('changeLiened:', { address, changedAmount });
    liened.set(address, changedAmount);
    return changedAmount;
  };
  return Far('stakeReporter', {
    increaseLiened: (address, increase) => {
      return changeLiened(address, AmountMath.getValue(uBrand, increase));
    },
    decreaseLiened: (address, decrease) => {
      return changeLiened(address, -1n * AmountMath.getValue(uBrand, decrease));
    },
    getAccountState: (address, _brand) => {
      return harden({
        ...state,
        liened: liened.get(address) || empty,
        currentTime,
      });
    },
  });
};

const makeContext = async t => {
  const { zoe, zcf } = await setupZCFTest();

  const stakeKit = makeIssuerKit(
    'BLD',
    AssetKind.NAT,
    harden({
      decimalPlaces: 6,
    }),
  );
  const uBrand = stakeKit.brand;

  const { publicFacet, creatorFacet } = await makeAttestationFacets(
    zcf,
    uBrand,
    makeMockLienBridge(uBrand, t),
  );

  return {
    zoe,
    stakeKit,
    publicFacet,
    creatorFacet,
  };
};

test.before(async t => {
  const properties = await makeContext(t);
  Object.assign(t.context, properties);
});

test('refuse to attest to more than liened amount', async t => {
  const { stakeKit, creatorFacet } =
    await /** @type { ReturnType<typeof makeContext> } */ (t.context);

  const uBrand = stakeKit.brand;

  const address1 = 'address01'; // note: keep addresses distinct among parallel tests

  const attMaker = await E(creatorFacet).provideAttestationTool(address1);

  const largeAmount = AmountMath.make(uBrand, 1000n);
  await t.throwsAsync(() => E(attMaker).makeAttestation(largeAmount), {
    message:
      'Only {"brand":"[Alleged: BLD brand]","value":"[500n]"} was "unliened", but an attestation was attempted for {"brand":"[Alleged: BLD brand]","value":"[1000n]"}',
  });

  // check that no lien was successful so far
  const liened = await E(creatorFacet).getLiened(address1, uBrand);
  t.deepEqual(liened, AmountMath.makeEmpty(uBrand));
});

test('attestations can be combined and split', async t => {
  const { zoe, stakeKit, publicFacet, creatorFacet } = await t.context;

  const issuer = await E(publicFacet).getIssuer();
  const brand = await E(publicFacet).getBrand();

  const address1 = 'address1';
  const attMaker = await E(creatorFacet).provideAttestationTool(address1);

  const uBrand = stakeKit.brand;
  const stake50 = AmountMath.make(uBrand, 50n);

  // Make a normal lien
  const attest50pmt = await E(attMaker).makeAttestation(stake50);
  const attest50amt = AmountMath.make(brand, makeCopyBag([[address1, 50n]]));
  t.deepEqual(await E(issuer).getAmountOf(attest50pmt), attest50amt);

  t.deepEqual(await E(creatorFacet).getLiened(address1, uBrand), stake50);

  // Make another normal lien
  const stake25 = AmountMath.make(uBrand, 25n);
  const attest25pmt = await E(attMaker).makeAttestation(stake25);

  t.deepEqual(
    await E(issuer).getAmountOf(attest25pmt),
    AmountMath.make(brand, makeCopyBag([['address1', 25n]])),
  );

  t.deepEqual(
    await E(creatorFacet).getLiened(address1, uBrand),
    AmountMath.add(stake50, stake25),
  );

  /** @param {Payment} att */
  const returnAttestation = async att => {
    const invitation = E(publicFacet).makeReturnAttInvitation();
    const attestationAmount = await E(issuer).getAmountOf(att);
    const proposal = harden({ give: { Attestation: attestationAmount } });
    const payments = harden({ Attestation: att });
    const userSeat = E(zoe).offer(invitation, proposal, payments);
    await E(userSeat).getOfferResult();
    const payout = await E(userSeat).getPayouts();
    const amounts = await Promise.all(
      Object.values(payout).map(paymentP => E(issuer).getAmountOf(paymentP)),
    );
    t.true(amounts.every(amount => AmountMath.isEmpty(amount, brand)));
    return userSeat;
  };

  // split the 1st attestation
  const [attest20pmt, attestRestPmt] = await E(issuer).split(
    attest50pmt,
    AmountMath.make(brand, makeCopyBag([[address1, 20n]])),
  );

  // return 1st part
  await returnAttestation(attest20pmt);
  t.deepEqual(
    await E(creatorFacet).getLiened(address1, uBrand),
    AmountMath.make(uBrand, 55n),
  );

  // return 2nd part
  await returnAttestation(attestRestPmt);
  t.deepEqual(await E(creatorFacet).getLiened(address1, uBrand), stake25);

  // Return the original attestation for 25
  const seat = await returnAttestation(attest25pmt);

  // Now the liened Amount should be empty
  t.deepEqual(
    await E(creatorFacet).getLiened(address1, uBrand),
    AmountMath.makeEmpty(uBrand),
  );

  // Returning an empty attestation should be a noop.
  const att0 = await E(seat).getPayout('Attestation');
  const amt0 = await E(issuer).getAmountOf(att0);
  await returnAttestation(att0);
  t.deepEqual(amt0.value.payload, []);
});
