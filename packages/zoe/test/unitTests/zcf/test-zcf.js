// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { Far } from '@endo/marshal';
import { AssetKind, AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { details as X } from '@agoric/assert';
import { makeOffer } from '../makeOffer.js';

import { setup } from '../setupBasicMints.js';
import buildManualTimer from '../../../tools/manualTimer.js';

import { setupZCFTest } from './setupZcfTest.js';
import { assertAmountsEqual } from '../../zoeTestHelpers.js';

test(`zcf.getZoeService`, async t => {
  const { zoe, zcf } = await setupZCFTest();
  const zoeService = await zcf.getZoeService();
  t.is(await E(zoeService).getFeeIssuer(), await E(zoe).getFeeIssuer());
});

test(`zcf.getInstance`, async t => {
  const { zcf, instance } = await setupZCFTest();
  const instanceFromZCF = zcf.getInstance();
  t.is(instance, instanceFromZCF);
});

test(`zcf.getInvitationIssuer`, async t => {
  const { zoe, zcf } = await setupZCFTest();
  const zcfInvitationIssuer = zcf.getInvitationIssuer();
  const zoeInvitationIssuer = await E(zoe).getInvitationIssuer();
  t.is(zcfInvitationIssuer, zoeInvitationIssuer);
});

const testTerms = async (t, zcf, expected) => {
  const zcfTerms = zcf.getTerms();
  t.deepEqual(zcfTerms, expected);
};

test(`zcf.getTerms - empty`, async t => {
  const { zcf } = await setupZCFTest();
  await testTerms(t, zcf, { brands: {}, issuers: {} });
});

test(`zcf.getTerms - custom`, async t => {
  const expected = {
    brands: {},
    issuers: {},
    whatever: 'whatever',
  };
  const issuerKeywordRecord = undefined;
  const customTerms = {
    whatever: 'whatever',
  };
  const { zcf } = await setupZCFTest(issuerKeywordRecord, customTerms);
  await testTerms(t, zcf, expected);
});

test(`zcf.getTerms - standard overwrites custom`, async t => {
  const expected = {
    brands: {},
    issuers: {},
  };
  const issuerKeywordRecord = undefined;
  const customTerms = {
    brands: 'whatever',
  };
  const { zcf } = await setupZCFTest(issuerKeywordRecord, customTerms);
  await testTerms(t, zcf, expected);
});

test(`zcf.getTerms - standard with 2 issuers and custom`, async t => {
  const { moolaKit, simoleanKit } = setup();
  const expected = {
    brands: { A: moolaKit.brand, B: simoleanKit.brand },
    issuers: { A: moolaKit.issuer, B: simoleanKit.issuer },
    whatever: 'whatever',
  };
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const customTerms = {
    whatever: 'whatever',
  };
  const { zcf } = await setupZCFTest(issuerKeywordRecord, customTerms);
  await testTerms(t, zcf, expected);
});

test(`zcf.getTerms & zcf.saveIssuer`, async t => {
  const { moolaKit, simoleanKit, bucksKit } = setup();
  const expected = {
    brands: { A: moolaKit.brand, B: simoleanKit.brand, C: bucksKit.brand },
    issuers: { A: moolaKit.issuer, B: simoleanKit.issuer, C: bucksKit.issuer },
    whatever: 'whatever',
  };
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const customTerms = {
    whatever: 'whatever',
  };
  const { zcf } = await setupZCFTest(issuerKeywordRecord, customTerms);
  await zcf.saveIssuer(bucksKit.issuer, 'C');

  await testTerms(t, zcf, expected);
});

test(`zcf.getBrandForIssuer - from issuerKeywordRecord & zcf.saveIssuer`, async t => {
  const { moolaKit, simoleanKit, bucksKit } = setup();
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const { zcf } = await setupZCFTest(issuerKeywordRecord);
  t.is(zcf.getBrandForIssuer(moolaKit.issuer), moolaKit.brand);
  t.is(zcf.getBrandForIssuer(simoleanKit.issuer), simoleanKit.brand);
  await zcf.saveIssuer(bucksKit.issuer, 'C');
  t.is(zcf.getBrandForIssuer(bucksKit.issuer), bucksKit.brand);
});

test(`zcf.getIssuerForBrand - from issuerKeywordRecord & zcf.saveIssuer`, async t => {
  const { moolaKit, simoleanKit, bucksKit } = setup();
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const { zcf } = await setupZCFTest(issuerKeywordRecord);
  t.is(zcf.getIssuerForBrand(moolaKit.brand), moolaKit.issuer);
  t.is(zcf.getIssuerForBrand(simoleanKit.brand), simoleanKit.issuer);
  await zcf.saveIssuer(bucksKit.issuer, 'C');
  t.is(zcf.getIssuerForBrand(bucksKit.brand), bucksKit.issuer);
});

test(`zcf.assertUniqueKeyword`, async t => {
  const { moolaKit, simoleanKit } = setup();
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const { zcf } = await setupZCFTest(issuerKeywordRecord);
  t.throws(() => zcf.assertUniqueKeyword('A'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /keyword "A" must be unique/,
      /keyword .* must be unique/,
  });
  t.throws(() => zcf.assertUniqueKeyword('B'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /keyword "B" must be unique/,
      /keyword .* must be unique/,
  });
  // Unique, but not a valid Keyword
  t.throws(() => zcf.assertUniqueKeyword('a'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // 'keyword "a" must be an ascii identifier starting with upper case.',
      /keyword .* must be an ascii identifier starting with upper case./,
  });
  t.throws(() => zcf.assertUniqueKeyword('3'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // 'keyword "3" must be an ascii identifier starting with upper case.',
      /keyword .* must be an ascii identifier starting with upper case./,
  });
  zcf.assertUniqueKeyword('MyKeyword');
});

test(`zcf.saveIssuer & zoe.getTerms`, async t => {
  const { moolaKit, simoleanKit, bucksKit } = setup();
  const expected = {
    brands: { A: moolaKit.brand, B: simoleanKit.brand, C: bucksKit.brand },
    issuers: { A: moolaKit.issuer, B: simoleanKit.issuer, C: bucksKit.issuer },
    whatever: 'whatever',
  };
  const issuerKeywordRecord = { A: moolaKit.issuer, B: simoleanKit.issuer };
  const customTerms = {
    whatever: 'whatever',
  };

  const { zcf, instance, zoe } = await setupZCFTest(
    issuerKeywordRecord,
    customTerms,
  );
  await zcf.saveIssuer(bucksKit.issuer, 'C');

  const zoeTerms = await E(zoe).getTerms(instance);
  t.deepEqual(zoeTerms, expected);
});

test(`zcf.saveIssuer - bad issuer`, async t => {
  const { moolaKit } = setup();
  const { zcf } = await setupZCFTest();
  // @ts-ignore deliberate invalid arguments for testing
  await t.throwsAsync(() => zcf.saveIssuer(moolaKit.brand, 'A'), {
    // TODO: improve error message
    // https://github.com/Agoric/agoric-sdk/issues/1701
    message:
      'target has no method "getBrand", has ["getAllegedName","getDisplayInfo","isMyIssuer"]',
  });
});

test(`zcf.saveIssuer - bad issuer, makeEmptyPurse throws`, async t => {
  const { zcf } = await setupZCFTest();
  const brand = Far('brand', {
    // eslint-disable-next-line no-use-before-define
    isMyIssuer: i => i === badIssuer,
    getDisplayInfo: () => ({ decimalPlaces: 6, assetKind: AssetKind.NAT }),
  });
  const badIssuer = Far('issuer', {
    makeEmptyPurse: async () => {
      throw Error('bad issuer');
    },
    getBrand: () => brand,
  });
  await t.throwsAsync(
    // @ts-ignore deliberate invalid arguments for testing
    () => zcf.saveIssuer(badIssuer, 'A'),
    {
      message:
        'A purse could not be created for brand "[Alleged: brand]" because: "[Error: bad issuer]"',
    },
  );
});

test(`zcf.saveIssuer - bad keyword`, async t => {
  const { moolaKit } = setup();
  const { zcf } = await setupZCFTest();
  await t.throwsAsync(
    async () => zcf.saveIssuer(moolaKit.issuer, 'bad keyword'),
    {
      message:
        // Should be able to use more informative error once SES double
        // disclosure bug is fixed. See
        // https://github.com/endojs/endo/pull/640
        //
        // `keyword "bad keyword" must be an ascii identifier starting with upper case.`,
        /keyword .* must be an ascii identifier starting with upper case./,
    },
  );
});

test(`zcf.saveIssuer - args reversed`, async t => {
  const { moolaKit } = setup();
  const { zcf } = await setupZCFTest();
  // TODO: improve error message
  // https://github.com/Agoric/agoric-sdk/issues/1702
  // @ts-ignore deliberate invalid arguments for testing
  await t.throwsAsync(async () => zcf.saveIssuer('A', moolaKit.issuer), {
    message: /.* must be a string/,
  });
});

test(`zcf.makeInvitation - no offerHandler`, async t => {
  const { zcf, zoe } = await setupZCFTest();
  const invitationP = zcf.makeInvitation(undefined, 'myInvitation');
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const isLive = await E(invitationIssuer).isLive(invitationP);
  t.truthy(isLive);
  const seat = E(zoe).offer(invitationP);
  const offerResult = await E(seat).getOfferResult();
  t.is(offerResult, undefined);
});

test(`zcf.makeInvitation - no-op offerHandler`, async t => {
  const { zcf, zoe } = await setupZCFTest();
  const invitationP = zcf.makeInvitation(() => {}, 'myInvitation');
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const isLive = await E(invitationIssuer).isLive(invitationP);
  t.truthy(isLive);
  const seat = E(zoe).offer(invitationP);
  const offerResult = await E(seat).getOfferResult();
  t.is(offerResult, undefined);
});

test(`zcf.makeInvitation - throwing offerHandler`, async t => {
  const { zcf, zoe } = await setupZCFTest();
  const handler = () => {
    throw Error('my error message');
  };
  const invitationP = zcf.makeInvitation(handler, 'myInvitation');
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const isLive = await E(invitationIssuer).isLive(invitationP);
  t.truthy(isLive);
  const seat = E(zoe).offer(invitationP);
  await t.throwsAsync(() => E(seat).getOfferResult(), {
    message: 'my error message',
  });
});

test(`zcf.makeInvitation - no description`, async t => {
  const { zcf } = await setupZCFTest();
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcf.makeInvitation(() => {}), {
    message: /invitations must have a description string: "\[undefined\]"/,
  });
});

test(`zcf.makeInvitation - non-string description`, async t => {
  const { zcf } = await setupZCFTest();
  // TODO: improve error message
  // https://github.com/Agoric/agoric-sdk/issues/1704
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcf.makeInvitation(() => {}, { something: 'a' }), {
    message: /invitations must have a description string: .*/,
  });
});

test(`zcf.makeInvitation - no customProperties`, async t => {
  const { zcf, zoe, instance, installation } = await setupZCFTest();
  const invitationP = zcf.makeInvitation(() => {}, 'myInvitation');
  const details = await E(zoe).getInvitationDetails(invitationP);
  t.deepEqual(details, {
    description: 'myInvitation',
    handle: details.handle,
    installation,
    instance,
  });
});

test(`zcf.makeInvitation - customProperties`, async t => {
  const { zcf, zoe, instance, installation } = await setupZCFTest();
  const timer = buildManualTimer(console.log);
  const invitationP = zcf.makeInvitation(() => {}, 'myInvitation', {
    whatever: 'whatever',
    timer,
  });
  const details = await E(zoe).getInvitationDetails(invitationP);
  t.deepEqual(details, {
    description: 'myInvitation',
    handle: details.handle,
    installation,
    instance,
    timer,
    whatever: 'whatever',
  });
});

test(`zcf.makeInvitation - customProperties overwritten`, async t => {
  const { zcf, zoe, instance, installation } = await setupZCFTest();
  const invitationP = zcf.makeInvitation(() => {}, 'myInvitation', {
    description: 'whatever',
    installation: 'whatever',
    instance: 'whatever',
  });
  const details = await E(zoe).getInvitationDetails(invitationP);
  t.deepEqual(details, {
    description: 'myInvitation',
    handle: details.handle,
    installation,
    instance,
  });
  t.falsy(typeof details.handle === 'string');
});

test(`zcf.makeZCFMint - no keyword`, async t => {
  const { zcf } = await setupZCFTest();
  // @ts-ignore deliberate invalid arguments for testing
  await t.throwsAsync(() => zcf.makeZCFMint(), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /"\[undefined\]" must be a string/,
      /.* must be a string/,
  });
});

test(`zcf.makeZCFMint - keyword already in use`, async t => {
  const { moolaIssuer } = setup();
  const { zcf } = await setupZCFTest({ A: moolaIssuer });
  await t.throwsAsync(() => zcf.makeZCFMint('A'), {
    message: 'keyword "A" must be unique',
  });
});

test(`zcf.makeZCFMint - bad keyword`, async t => {
  const { zcf } = await setupZCFTest();
  await t.throwsAsync(() => zcf.makeZCFMint('a'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // 'keyword "a" must be an ascii identifier starting with upper case.',
      /keyword .* must be an ascii identifier starting with upper case./,
  });
});

test(`zcf.makeZCFMint - not a math kind`, async t => {
  const { zcf } = await setupZCFTest();
  // @ts-ignore deliberate invalid arguments for testing
  await t.throwsAsync(() => zcf.makeZCFMint('A', 'whatever'), {
    message:
      /The assetKind "whatever" must be one of \["copyBag","copySet","nat","set"\]/,
  });
});

test(`zcf.makeZCFMint - NAT`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.NAT);
  const issuerRecord = zcfMint.getIssuerRecord();
  const expected = {
    issuers: { A: issuerRecord.issuer },
    brands: { A: issuerRecord.brand },
  };
  await testTerms(t, zcf, expected);
  t.is(issuerRecord.assetKind, AssetKind.NAT);
  t.deepEqual(issuerRecord.brand.getDisplayInfo(), {
    assetKind: AssetKind.NAT,
  });
});

test(`zcf.makeZCFMint - SET`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const issuerRecord = zcfMint.getIssuerRecord();
  const expected = {
    issuers: { A: issuerRecord.issuer },
    brands: { A: issuerRecord.brand },
  };
  await testTerms(t, zcf, expected);
  t.is(issuerRecord.assetKind, AssetKind.SET);
});

test(`zcf.makeZCFMint - mintGains - no args`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcfMint.mintGains(), {
    message:
      '"keywordRecord" "[undefined]" must be a pass-by-copy record, not "undefined"',
  });
});

test(`zcf.makeZCFMint - mintGains - no seat`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.NAT);
  const { brand } = zcfMint.getIssuerRecord();
  const zcfSeat = zcfMint.mintGains(harden({ A: AmountMath.make(brand, 4n) }));
  t.truthy(zcfSeat);
  assertAmountsEqual(
    t,
    zcfSeat.getAmountAllocated('A', brand),
    AmountMath.make(brand, 4n),
  );
});

test(`zcf.makeZCFMint - mintGains - no gains`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { zcfSeat } = zcf.makeEmptySeatKit();
  // TODO: create seat if one is not provided
  // https://github.com/Agoric/agoric-sdk/issues/1696
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcfMint.mintGains(undefined, zcfSeat), {
    message:
      '"keywordRecord" "[undefined]" must be a pass-by-copy record, not "undefined"',
  });
});

test(`zcf.makeZCFMint - burnLosses - no args`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcfMint.burnLosses(), {
    message:
      '"keywordRecord" "[undefined]" must be a pass-by-copy record, not "undefined"',
  });
});

test(`zcf.makeZCFMint - burnLosses - no losses`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { zcfSeat } = zcf.makeEmptySeatKit();
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcfMint.burnLosses(undefined, zcfSeat), {
    message:
      '"keywordRecord" "[undefined]" must be a pass-by-copy record, not "undefined"',
  });
});

test(`zcf.makeZCFMint - mintGains - wrong brand`, async t => {
  const { moola, moolaIssuer } = setup();
  const { zcf } = await setupZCFTest({ Moola: moolaIssuer });

  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { zcfSeat } = zcf.makeEmptySeatKit();
  t.throws(() => zcfMint.mintGains(harden({ Moola: moola(3n) }), zcfSeat), {
    message: `amount's brand "[Alleged: moola brand]" did not match expected brand "[Alleged: A brand]"`,
  });
});

test(`zcf.makeZCFMint - burnLosses - wrong brand`, async t => {
  const { moola, moolaIssuer } = setup();
  const { zcf } = await setupZCFTest({ Moola: moolaIssuer });

  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { zcfSeat } = zcf.makeEmptySeatKit();
  t.throws(() => zcfMint.burnLosses(harden({ Moola: moola(3n) }), zcfSeat), {
    message: `amount's brand "[Alleged: moola brand]" did not match expected brand "[Alleged: A brand]"`,
  });
});

test(`zcf.makeZCFMint - mintGains - right issuer`, async t => {
  const { zcf } = await setupZCFTest();

  const zcfMint = await zcf.makeZCFMint('A');
  const { brand } = zcfMint.getIssuerRecord();
  const { zcfSeat } = zcf.makeEmptySeatKit();
  const zcfSeat2 = zcfMint.mintGains(
    harden({ A: AmountMath.make(brand, 4n) }),
    zcfSeat,
  );
  t.is(zcfSeat2, zcfSeat);
  assertAmountsEqual(
    t,
    zcfSeat.getAmountAllocated('A', brand),
    AmountMath.make(brand, 4n),
  );
});

test(`zcf.makeZCFMint - burnLosses - right issuer`, async t => {
  const { zcf } = await setupZCFTest();

  const zcfMint = await zcf.makeZCFMint('A');
  const { brand } = zcfMint.getIssuerRecord();
  const { zcfSeat } = zcf.makeEmptySeatKit();
  const zcfSeat2 = zcfMint.mintGains(
    harden({ A: AmountMath.make(brand, 4n) }),
    zcfSeat,
  );
  t.is(zcfSeat2, zcfSeat);
  assertAmountsEqual(
    t,
    zcfSeat.getAmountAllocated('A', brand),
    AmountMath.make(brand, 4n),
  );
  // TODO: return a seat?
  // https://github.com/Agoric/agoric-sdk/issues/1709
  const result = zcfMint.burnLosses(
    harden({ A: AmountMath.make(brand, 1n) }),
    zcfSeat,
  );
  t.is(result, undefined);
  assertAmountsEqual(
    t,
    zcfSeat.getAmountAllocated('A', brand),
    AmountMath.make(brand, 3n),
  );
});

test(`zcf.makeZCFMint - mintGains - seat exited`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A');
  const { brand } = zcfMint.getIssuerRecord();
  const { zcfSeat } = zcf.makeEmptySeatKit();
  zcfSeat.exit();
  t.throws(
    () => zcfMint.mintGains(harden({ A: AmountMath.make(brand, 4n) }), zcfSeat),
    {
      message: `zcfSeat must be active to mint gains for the zcfSeat`,
    },
  );
});

test(`zcf.makeZCFMint - burnLosses - seat exited`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A');
  const { brand } = zcfMint.getIssuerRecord();
  const { zcfSeat } = zcf.makeEmptySeatKit();
  const zcfSeat2 = zcfMint.mintGains(
    harden({ A: AmountMath.make(brand, 4n) }),
    zcfSeat,
  );
  t.is(zcfSeat2, zcfSeat);
  assertAmountsEqual(
    t,
    zcfSeat.getAmountAllocated('A', brand),
    AmountMath.make(brand, 4n),
  );
  zcfSeat.exit();
  t.throws(
    () =>
      zcfMint.burnLosses(harden({ A: AmountMath.make(brand, 1n) }), zcfSeat),
    {
      message: `zcfSeat must be active to burn losses from the zcfSeat`,
    },
  );
});

test(`zcf.makeZCFMint - displayInfo`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint(
    'A',
    AssetKind.NAT,
    harden({
      decimalPlaces: 3,
    }),
  );
  const issuerRecord = zcfMint.getIssuerRecord();
  const expected = {
    issuers: { A: issuerRecord.issuer },
    brands: { A: issuerRecord.brand },
  };
  await testTerms(t, zcf, expected);
  t.is(issuerRecord.brand.getDisplayInfo().decimalPlaces, 3);
});

const similarToNormalZCFSeat = async (t, emptySeat, normalSeat) => {
  // Note: not exhaustive
  t.deepEqual(Object.keys(emptySeat), Object.keys(normalSeat));
  t.deepEqual(emptySeat.getProposal(), normalSeat.getProposal());
  t.deepEqual(
    emptySeat.getCurrentAllocation(),
    normalSeat.getCurrentAllocation(),
  );
  t.is(emptySeat.hasExited(), normalSeat.hasExited());
};

const similarToNormalUserSeat = async (t, emptySeat, normalSeat) => {
  // Note: not exhaustive
  t.deepEqual(Object.keys(emptySeat), Object.keys(normalSeat));
  t.deepEqual(await emptySeat.getProposal(), await normalSeat.getProposal());
  t.deepEqual(
    await emptySeat.getCurrentAllocation(),
    await normalSeat.getCurrentAllocation(),
  );
  t.is(await emptySeat.hasExited(), await normalSeat.hasExited());
  t.is(await emptySeat.getOfferResult(), await normalSeat.getOfferResult());
};

test(`zcf.makeEmptySeatKit`, async t => {
  const { zcf, zoe } = await setupZCFTest();
  const result = zcf.makeEmptySeatKit();
  t.deepEqual(Object.keys(result), ['zcfSeat', 'userSeat']);
  const { zcfSeat: zcfSeatActual, userSeat: userSeatActualP } = result;
  const { zcfSeat: zcfSeatExpected, userSeat: userSeatExpected } =
    await makeOffer(zoe, zcf);
  await similarToNormalZCFSeat(t, zcfSeatActual, zcfSeatExpected);
  const userSeatActual = await userSeatActualP;
  await similarToNormalUserSeat(t, userSeatActual, userSeatExpected);
  // Currently seats made with the "makeEmptySeatKit" method cannot
  // have any give or want because we cannot yet escrow or reallocate
  // assets as part of the offer.
  // TODO: add `give` and `want` to seats made on the contract/ZCF side
  // https://github.com/Agoric/agoric-sdk/issues/1724
});

test(`zcfSeat from zcf.makeEmptySeatKit - only these properties exist`, async t => {
  const expectedMethods = [
    'exit',
    'fail',
    'getAmountAllocated',
    'getCurrentAllocation',
    'getStagedAllocation',
    'getNotifier',
    'getProposal',
    'hasExited',
    'isOfferSafe',
    'incrementBy',
    'decrementBy',
    'clear',
    'hasStagedAllocation',
  ];
  const { zcf } = await setupZCFTest();
  const makeZCFSeat = () => zcf.makeEmptySeatKit().zcfSeat;
  const seat = makeZCFSeat();
  t.deepEqual(Object.getOwnPropertyNames(seat).sort(), expectedMethods.sort());
});

test(`zcfSeat.getProposal from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const makeZCFSeat = () => zcf.makeEmptySeatKit().zcfSeat;
  const seat = makeZCFSeat();
  t.deepEqual(seat.getProposal(), {
    exit: {
      onDemand: null,
    },
    give: {},
    want: {},
  });
});

test(`zcfSeat.hasExited, exit from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  t.falsy(zcfSeat.hasExited());
  zcfSeat.exit();
  t.truthy(zcfSeat.hasExited());
  t.truthy(await E(userSeat).hasExited());
  t.deepEqual(await E(userSeat).getPayouts(), {});
});

test(`zcfSeat.hasExited, fail from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  t.falsy(zcfSeat.hasExited());
  const msg = `this is the error message`;
  const err = zcfSeat.fail(Error(msg));
  t.is(err.message, msg);
  t.truthy(zcfSeat.hasExited());
  t.truthy(await E(userSeat).hasExited());
  t.deepEqual(await E(userSeat).getPayouts(), {});
});

test(`zcfSeat.isOfferSafe from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { moola } = setup();
  const { zcfSeat } = zcf.makeEmptySeatKit();
  // Anything is offer safe with no want or give
  // @ts-ignore deliberate invalid arguments for testing
  t.truthy(zcfSeat.isOfferSafe());
  t.truthy(zcfSeat.isOfferSafe({ Moola: moola(0n) }));
  t.truthy(zcfSeat.isOfferSafe({ Moola: moola(10n) }));
});

/**
 * @param {ZCF} zcf
 * @param {Keyword} zcfMintKeyword
 * @param {ZCFSeat} zcfSeat
 * @param {Keyword} gainsKeyword
 * @param {AmountValue} gainsValue
 * @returns {Promise<IssuerRecord>}
 */
const allocateEasy = async (
  zcf,
  zcfMintKeyword,
  zcfSeat,
  gainsKeyword,
  gainsValue,
) => {
  // Mint some gains to change the allocation.
  const zcfMint = await zcf.makeZCFMint(zcfMintKeyword);
  const { brand } = zcfMint.getIssuerRecord();
  zcfMint.mintGains(
    harden({ [gainsKeyword]: AmountMath.make(brand, gainsValue) }),
    zcfSeat,
  );
  return zcfMint.getIssuerRecord();
};

test(`zcfSeat.getNotifier`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  const notifier = zcfSeat.getNotifier();
  // These are different notifiers
  t.not(notifier, await E(userSeat).getNotifier());

  // Mint some gains to change the allocation.
  const { brand: brand1 } = await allocateEasy(zcf, 'Stuff', zcfSeat, 'A', 3n);
  t.deepEqual(await notifier.getUpdateSince(2), {
    updateCount: 3,
    value: {
      A: {
        brand: brand1,
        value: 3n,
      },
    },
  });

  const { brand: brand2 } = await allocateEasy(zcf, 'Stuff2', zcfSeat, 'B', 6n);
  t.deepEqual(await notifier.getUpdateSince(3), {
    updateCount: 4,
    value: {
      A: {
        brand: brand1,
        value: 3n,
      },
      B: {
        brand: brand2,
        value: 6n,
      },
    },
  });

  zcfSeat.exit();

  t.deepEqual(await notifier.getUpdateSince(4), {
    updateCount: undefined,
    value: undefined,
  });
});

test(`zcfSeat.getCurrentAllocation from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();

  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    await E(userSeat).getCurrentAllocation(),
  );
  t.deepEqual(zcfSeat.getCurrentAllocation(), {});

  // Mint some gains to change the allocation.
  const { brand: brand1 } = await allocateEasy(zcf, 'Stuff', zcfSeat, 'A', 3n);

  t.deepEqual(zcfSeat.getCurrentAllocation(), {
    A: {
      brand: brand1,
      value: 3n,
    },
  });

  // Again, mint some gains to change the allocation.
  const { brand: brand2 } = await allocateEasy(zcf, 'Stuff2', zcfSeat, 'B', 6n);

  t.deepEqual(zcfSeat.getCurrentAllocation(), {
    A: {
      brand: brand1,
      value: 3n,
    },
    B: {
      brand: brand2,
      value: 6n,
    },
  });

  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    await E(userSeat).getCurrentAllocation(),
  );
});

test(`zcfSeat.getAmountAllocated from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat } = zcf.makeEmptySeatKit();

  // Mint some gains to change the allocation.
  const { brand: brand1 } = await allocateEasy(zcf, 'Stuff', zcfSeat, 'A', 3n);

  assertAmountsEqual(t, zcfSeat.getAmountAllocated('A', brand1), {
    brand: brand1,
    value: 3n,
  });

  // Again, mint some gains to change the allocation.
  const { brand: brand2 } = await allocateEasy(zcf, 'Stuff2', zcfSeat, 'B', 6n);

  assertAmountsEqual(t, zcfSeat.getAmountAllocated('B'), {
    brand: brand2,
    value: 6n,
  });

  assertAmountsEqual(t, zcfSeat.getAmountAllocated('B', brand2), {
    brand: brand2,
    value: 6n,
  });

  t.throws(() => zcfSeat.getAmountAllocated('DoesNotExist'), {
    message: `A brand must be supplied when the keyword is not defined`,
  });
});

test(`zcfSeat.incrementBy, decrementBy, zcf.reallocate from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat: zcfSeat1 } = zcf.makeEmptySeatKit();
  const { zcfSeat: zcfSeat2 } = zcf.makeEmptySeatKit();

  const issuerRecord1 = await allocateEasy(zcf, 'Stuff', zcfSeat1, 'A', 6n);
  const six = AmountMath.make(issuerRecord1.brand, 6n);
  zcfSeat1.decrementBy(harden({ A: six }));
  zcfSeat2.incrementBy(harden({ B: six }));

  zcf.reallocate(zcfSeat1, zcfSeat2);

  t.deepEqual(zcfSeat1.getCurrentAllocation(), {
    A: AmountMath.make(issuerRecord1.brand, 0n),
  });
  t.deepEqual(zcfSeat2.getCurrentAllocation(), {
    B: AmountMath.make(issuerRecord1.brand, 6n),
  });
});

test(`userSeat from zcf.makeEmptySeatKit - only these properties exist`, async t => {
  const expectedMethods = [
    'getCurrentAllocation',
    'getProposal',
    'getPayouts',
    'getPayout',
    'getOfferResult',
    'hasExited',
    'tryExit',
    'getNotifier',
  ];
  const { zcf } = await setupZCFTest();
  const { userSeat: userSeatP } = zcf.makeEmptySeatKit();
  const userSeat = await userSeatP;
  // Note: these tests will fail if Zoe is actually in a different
  // vat, since userSeat would be a presence.
  t.deepEqual(Object.keys(userSeat), expectedMethods);
});

test(`userSeat.getProposal from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const makeUserSeat = async () => zcf.makeEmptySeatKit().userSeat;
  const userSeat = await makeUserSeat();
  t.deepEqual(await E(userSeat).getProposal(), {
    exit: {
      onDemand: null,
    },
    give: {},
    want: {},
  });
});

test(`userSeat.tryExit from zcf.makeEmptySeatKit - onDemand`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  t.falsy(zcfSeat.hasExited());
  await E(userSeat).tryExit();
  t.truthy(zcfSeat.hasExited());
  t.truthy(await E(userSeat).hasExited());
  t.deepEqual(await E(userSeat).getPayouts(), {});
});

test(`userSeat.tryExit from zcf.makeEmptySeatKit - waived`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit({ waived: null });
  t.falsy(zcfSeat.hasExited());
  await t.throwsAsync(() => E(userSeat).tryExit(), {
    message: 'Only seats with the exit rule "onDemand" can exit at will',
  });
  t.falsy(zcfSeat.hasExited());
  t.falsy(await E(userSeat).hasExited());
});

test(`userSeat.tryExit from zcf.makeEmptySeatKit - afterDeadline`, async t => {
  const { zcf } = await setupZCFTest();
  const timer = buildManualTimer(console.log);
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit({
    afterDeadline: { timer, deadline: 1n },
  });
  t.falsy(zcfSeat.hasExited());
  await t.throwsAsync(() => E(userSeat).tryExit(), {
    message: 'Only seats with the exit rule "onDemand" can exit at will',
  });
  t.falsy(zcfSeat.hasExited());
  t.falsy(await E(userSeat).hasExited());
  timer.tick();

  // Note: the wake call doesn't happen immediately so we must wait
  const payouts = await E(userSeat).getPayouts();
  t.truthy(zcfSeat.hasExited());
  t.truthy(await E(userSeat).hasExited());
  t.deepEqual(payouts, {});
});

test(`userSeat.getCurrentAllocation from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();

  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    await E(userSeat).getCurrentAllocation(),
  );
  t.deepEqual(await E(userSeat).getCurrentAllocation(), {});

  // Mint some gains to change the allocation.
  const { brand: brand1 } = await allocateEasy(zcf, 'Stuff', zcfSeat, 'A', 3n);

  t.deepEqual(await E(userSeat).getCurrentAllocation(), {
    A: {
      brand: brand1,
      value: 3n,
    },
  });

  // Again, mint some gains to change the allocation.
  const { brand: brand2 } = await allocateEasy(zcf, 'Stuff2', zcfSeat, 'B', 6n);

  t.deepEqual(await E(userSeat).getCurrentAllocation(), {
    A: {
      brand: brand1,
      value: 3n,
    },
    B: {
      brand: brand2,
      value: 6n,
    },
  });

  t.deepEqual(
    zcfSeat.getCurrentAllocation(),
    await E(userSeat).getCurrentAllocation(),
  );
});

test(`userSeat.getOfferResult from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { userSeat } = zcf.makeEmptySeatKit();
  const result = await E(userSeat).getOfferResult();
  t.is(result, undefined);
});

test(`userSeat.getNotifier`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  const notifier = await E(userSeat).getNotifier();

  // Mint some gains to change the allocation.
  const { brand: brand1 } = await allocateEasy(zcf, 'Stuff', zcfSeat, 'A', 3n);
  t.deepEqual(await notifier.getUpdateSince(), {
    updateCount: 3,
    value: {
      A: {
        brand: brand1,
        value: 3n,
      },
    },
  });

  const { brand: brand2 } = await allocateEasy(zcf, 'Stuff2', zcfSeat, 'B', 6n);
  t.deepEqual(await notifier.getUpdateSince(2), {
    updateCount: 4,
    value: {
      A: {
        brand: brand1,
        value: 3n,
      },
      B: {
        brand: brand2,
        value: 6n,
      },
    },
  });

  zcfSeat.exit();

  t.deepEqual(await notifier.getUpdateSince(4), {
    updateCount: undefined,
    value: undefined,
  });
});

test(`userSeat.getPayouts, getPayout from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();

  // Mint some gains to change the allocation.
  const { brand: brand1, issuer: issuer1 } = await allocateEasy(
    zcf,
    'Stuff',
    zcfSeat,
    'A',
    3n,
  );

  // Again, mint some gains to change the allocation.
  const { brand: brand2, issuer: issuer2 } = await allocateEasy(
    zcf,
    'Stuff2',
    zcfSeat,
    'B',
    6n,
  );

  t.deepEqual(await E(userSeat).getCurrentAllocation(), {
    A: {
      brand: brand1,
      value: 3n,
    },
    B: {
      brand: brand2,
      value: 6n,
    },
  });

  zcfSeat.exit();

  const payoutPs = await E(userSeat).getPayouts();
  const payoutAP = E(userSeat).getPayout('A');
  const payoutBP = E(userSeat).getPayout('B');

  t.deepEqual(await payoutPs.A, await payoutAP);
  t.deepEqual(await payoutPs.B, await payoutBP);

  assertAmountsEqual(t, await E(issuer1).getAmountOf(payoutAP), {
    brand: brand1,
    value: 3n,
  });
  assertAmountsEqual(t, await E(issuer2).getAmountOf(payoutBP), {
    brand: brand2,
    value: 6n,
  });
});

test(`userSeat.getPayout() should throw from zcf.makeEmptySeatKit`, async t => {
  const { zcf } = await setupZCFTest();
  const { userSeat } = zcf.makeEmptySeatKit();
  // @ts-ignore deliberate invalid arguments for testing
  await t.throwsAsync(() => E(userSeat).getPayout(), {
    message: 'A keyword must be provided',
  });
});

test(`zcf.reallocate < 2 seats`, async t => {
  const { zcf } = await setupZCFTest();
  // @ts-ignore deliberate invalid arguments for testing
  t.throws(() => zcf.reallocate(), {
    message: 'reallocating must be done over two or more seats',
  });
});

test(`zcf.reallocate 3 seats, rights conserved`, async t => {
  const { moolaKit, simoleanKit, moola, simoleans } = setup();
  const { zoe, zcf } = await setupZCFTest({
    Moola: moolaKit.issuer,
    Simoleans: simoleanKit.issuer,
  });

  const { zcfSeat: zcfSeat1 } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: simoleans(2n) }, give: { B: moola(3n) } }),
    harden({ B: moolaKit.mint.mintPayment(moola(3n)) }),
  );
  const { zcfSeat: zcfSeat2 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(2n) },
      give: { Whatever2: simoleans(2n) },
    }),
    harden({ Whatever2: simoleanKit.mint.mintPayment(simoleans(2n)) }),
  );

  const { zcfSeat: zcfSeat3 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(1n) },
    }),
  );
  zcfSeat1.decrementBy(harden({ B: moola(3n) }));
  zcfSeat3.incrementBy(harden({ Whatever: moola(1n) }));
  zcfSeat2.incrementBy(harden({ Whatever: moola(2n) }));

  zcfSeat2.decrementBy(harden({ Whatever2: simoleans(2n) }));
  zcfSeat1.incrementBy(harden({ A: simoleans(2n) }));

  zcf.reallocate(zcfSeat1, zcfSeat2, zcfSeat3);
  t.deepEqual(zcfSeat1.getCurrentAllocation(), {
    A: simoleans(2n),
    B: moola(0n),
  });

  t.deepEqual(zcfSeat2.getCurrentAllocation(), {
    Whatever: moola(2n),
    Whatever2: simoleans(0n),
  });

  t.deepEqual(zcfSeat3.getCurrentAllocation(), {
    Whatever: moola(1n),
  });
});

test(`zcf.reallocate 3 seats, some not staged`, async t => {
  const { moolaKit, simoleanKit, moola, simoleans } = setup();
  const { zoe, zcf } = await setupZCFTest({
    Moola: moolaKit.issuer,
    Simoleans: simoleanKit.issuer,
  });

  const { zcfSeat: zcfSeat1 } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: simoleans(2n) }, give: { B: moola(3n) } }),
    harden({ B: moolaKit.mint.mintPayment(moola(3n)) }),
  );
  const { zcfSeat: zcfSeat2 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(2n) },
      give: { Whatever2: simoleans(2n) },
    }),
    harden({ Whatever2: simoleanKit.mint.mintPayment(simoleans(2n)) }),
  );

  const { zcfSeat: zcfSeat3 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(1n) },
    }),
  );

  zcfSeat1.incrementBy(
    harden({
      A: simoleans(100n),
    }),
  );

  t.throws(() => zcf.reallocate(zcfSeat1, zcfSeat2, zcfSeat3), {
    message:
      'Reallocate failed because a seat had no staged allocation. Please add or subtract from the seat and then reallocate.',
  });

  t.deepEqual(zcfSeat1.getCurrentAllocation(), {
    A: simoleans(0n),
    B: moola(3n),
  });
  t.deepEqual(zcfSeat2.getCurrentAllocation(), {
    Whatever: moola(0n),
    Whatever2: simoleans(2n),
  });
  t.deepEqual(zcfSeat3.getCurrentAllocation(), { Whatever: moola(0n) });
});

test(`zcf.reallocate 3 seats, rights NOT conserved`, async t => {
  const { moolaKit, simoleanKit, moola, simoleans } = setup();
  const { zoe, zcf } = await setupZCFTest({
    Moola: moolaKit.issuer,
    Simoleans: simoleanKit.issuer,
  });

  const { zcfSeat: zcfSeat1 } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: simoleans(2n) }, give: { B: moola(3n) } }),
    harden({ B: moolaKit.mint.mintPayment(moola(3n)) }),
  );
  const { zcfSeat: zcfSeat2 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(2n) },
      give: { Whatever2: simoleans(2n) },
    }),
    harden({ Whatever2: simoleanKit.mint.mintPayment(simoleans(2n)) }),
  );

  const { zcfSeat: zcfSeat3 } = await makeOffer(
    zoe,
    zcf,
    harden({
      want: { Whatever: moola(1n) },
    }),
  );

  zcfSeat2.decrementBy(harden({ Whatever2: simoleans(2n) }));
  // This does not conserve rights in the slightest
  zcfSeat1.incrementBy(
    harden({
      A: simoleans(100n),
    }),
  );
  zcfSeat3.incrementBy(harden({ Whatever: moola(1n) }));

  t.throws(() => zcf.reallocate(zcfSeat1, zcfSeat2, zcfSeat3), {
    message: /rights were not conserved for brand .*/,
  });

  t.deepEqual(zcfSeat1.getCurrentAllocation(), {
    A: simoleans(0n),
    B: moola(3n),
  });
  t.deepEqual(zcfSeat2.getCurrentAllocation(), {
    Whatever: moola(0n),
    Whatever2: simoleans(2n),
  });
  t.deepEqual(zcfSeat3.getCurrentAllocation(), { Whatever: moola(0n) });
});

test(`zcf.shutdown - userSeat exits`, async t => {
  const { zoe, zcf } = await setupZCFTest();
  const { userSeat } = await makeOffer(zoe, zcf);
  zcf.shutdown('so long');
  t.deepEqual(await E(userSeat).getPayouts(), {});
  t.truthy(await E(userSeat).hasExited());
});

test(`zcf.shutdown - zcfSeat exits`, async t => {
  const { zoe, zcf } = await setupZCFTest();
  const { zcfSeat, userSeat } = await makeOffer(zoe, zcf);
  t.falsy(zcfSeat.hasExited());
  await t.falsy(await E(userSeat).hasExited());
  zcf.shutdown('done');
  t.truthy(zcfSeat.hasExited());
  t.truthy(await E(userSeat).hasExited());
});

test(`zcf.shutdown - no further offers accepted`, async t => {
  const { zoe, zcf, vatAdminState } = await setupZCFTest();
  const invitation = await zcf.makeInvitation(() => {}, 'seat');
  zcf.shutdown('sayonara');
  await t.throwsAsync(() => E(zoe).offer(invitation), {
    message: 'No further offers are accepted',
  });
  t.is(vatAdminState.getExitMessage(), 'sayonara');
  t.falsy(vatAdminState.getExitWithFailure());
});

test(`zcf.shutdownWithFailure - no further offers accepted`, async t => {
  const { zoe, zcf, vatAdminState } = await setupZCFTest();
  const invitation = await zcf.makeInvitation(() => {}, 'seat');
  zcf.shutdownWithFailure(Error(`And don't come back`));
  await t.throwsAsync(() => E(zoe).offer(invitation), {
    message: 'No further offers are accepted',
  });
  t.is(vatAdminState.getExitMessage().message, `And don't come back`);
  t.truthy(vatAdminState.getExitWithFailure());
});

test(`zcf.assert - no further offers accepted`, async t => {
  const { zoe, zcf, vatAdminState } = await setupZCFTest();
  const invitation = await zcf.makeInvitation(() => {}, 'seat');
  t.throws(() => zcf.assert(false, X`And do not come back`), {
    message: /And do not come back/,
  });
  await t.throwsAsync(() => E(zoe).offer(invitation), {
    message: 'No further offers are accepted',
  });
  t.deepEqual(vatAdminState.getExitMessage(), Error(`And do not come back`));
  t.truthy(vatAdminState.getExitWithFailure());
});

test(`zcf.stopAcceptingOffers`, async t => {
  const { zoe, zcf } = await setupZCFTest();
  const invitation1 = await zcf.makeInvitation(() => {}, 'seat');
  const invitation2 = await zcf.makeInvitation(() => {}, 'seat');

  const invitationIssuer = await E(zoe).getInvitationIssuer();
  t.truthy(await E(invitationIssuer).isLive(invitation1));
  t.truthy(await E(invitationIssuer).isLive(invitation2));
  const seat = E(zoe).offer(invitation1);
  const offerResult = await E(seat).getOfferResult();
  t.is(offerResult, undefined);

  t.falsy(await E(invitationIssuer).isLive(invitation1));
  await zcf.stopAcceptingOffers();
  t.truthy(await E(invitationIssuer).isLive(invitation2));
  await t.throwsAsync(
    () => E(zoe).offer(invitation2),
    { message: 'No further offers are accepted' },
    `can't make further offers`,
  );

  t.deepEqual(
    await E(seat).getCurrentAllocation(),
    {},
    'can still query live seat',
  );
});
