import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { M, mustMatch } from '@agoric/store';
import { AssetKind, makeIssuerKit } from '@agoric/ertp';
import { setup } from '../setupBasicMints.js';
import {
  swap,
  assertIssuerKeywords,
  assertProposalShape,
  swapExact,
  assertNatAssetKind,
  saveAllIssuers,
} from '../../../src/contractSupport/index.js';
import { assertPayoutAmount } from '../../zoeTestHelpers.js';
import { setupZCFTest } from './setupZcfTest.js';
import { makeOffer } from '../makeOffer.js';

test(`zoeHelper with zcf - swap`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: aZcfSeat, userSeat: aUserSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(3n) }, give: { B: simoleans(7n) } }),
    { B: simoleanMint.mintPayment(simoleans(7n)) },
  );
  const { zcfSeat: bZcfSeat, userSeat: bUserSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { B: simoleans(3n) }, give: { A: moola(5n) } }),
    { A: moolaMint.mintPayment(moola(5n)) },
  );
  const message = await swap(zcf, aZcfSeat, bZcfSeat);
  t.is(
    message,
    'The offer has been accepted. Once the contract has been completed, please check your payout',
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await aUserSeat.getPayout('A'),
    moola(3n),
  );
  const seat1PayoutB = await aUserSeat.getPayout('B');
  await assertPayoutAmount(t, simoleanIssuer, seat1PayoutB, simoleans(4n));
  const seat2PayoutB = await bUserSeat.getPayout('B');
  await assertPayoutAmount(t, simoleanIssuer, seat2PayoutB, simoleans(3n));
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await bUserSeat.getPayout('A'),
    moola(2n),
  );
});

test(`zoeHelper with zcf - swap no match`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: aZcfSeat, userSeat: aUserSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(3n) } }),
    { B: simoleanMint.mintPayment(simoleans(3n)) },
  );
  const { zcfSeat: bZcfSeat, userSeat: bUserSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { B: simoleans(43n) }, give: { A: moola(5n) } }),
    { A: moolaMint.mintPayment(moola(5n)) },
  );
  t.throws(
    () => swap(zcf, aZcfSeat, bZcfSeat),
    {
      message:
        'The amount to be subtracted {"brand":"[Alleged: moola brand]","value":"[20n]"} was greater than the allocation\'s amount {"brand":"[Alleged: moola brand]","value":"[5n]"} for the keyword "A"',
    },
    'mismatched offers',
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await aUserSeat.getPayout('A'),
    moola(0n),
  );
  const seat1PayoutB = await aUserSeat.getPayout('B');
  await assertPayoutAmount(t, simoleanIssuer, seat1PayoutB, simoleans(3n));
  const seat2PayoutB = await bUserSeat.getPayout('B');
  await assertPayoutAmount(t, simoleanIssuer, seat2PayoutB, simoleans(0n));
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await bUserSeat.getPayout('A'),
    moola(5n),
  );
});

test(`zcf assertNatAssetKind`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A');
  const { brand } = zcfMint.getIssuerRecord();
  t.notThrows(() => assertNatAssetKind(zcf, brand), 'default');
});

test(`zcf assertNatAssetKind - not natMath`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { brand } = zcfMint.getIssuerRecord();
  t.throws(() => assertNatAssetKind(zcf, brand), {
    message: 'brand must be AssetKind.NAT',
  });
});

test.failing(`zcf assertNatAssetKind - not brand`, async t => {
  const { zcf } = await setupZCFTest();
  const zcfMint = await zcf.makeZCFMint('A', AssetKind.SET);
  const { issuer } = zcfMint.getIssuerRecord();
  // TODO: distinguish non-brands from brands
  // https://github.com/Agoric/agoric-sdk/issues/1800
  t.throws(() => assertNatAssetKind(zcf, issuer), {
    message: /assertNatAssetKind requires a brand, not .*/,
  });
});

test(`zcf assertNatAssetKind - brand not registered`, async t => {
  const { zcf } = await setupZCFTest();
  const { brand } = makeIssuerKit('gelt');
  t.throws(() => assertNatAssetKind(zcf, brand), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /"brand" not found: .*/,
      // / not found: /,
      'key "[Alleged: gelt brand]" not found in collection "brandToIssuerRecord"',
  });
});

test(`zcf saveAllIssuers`, async t => {
  const { zcf } = await setupZCFTest();
  const { issuer, brand } = makeIssuerKit('gelt');
  await saveAllIssuers(zcf, { G: issuer });
  t.is(zcf.getBrandForIssuer(issuer), brand, 'gelt');
});

test(`zcf saveAllIssuers - multiple`, async t => {
  const { zcf } = await setupZCFTest();
  const { issuer: gIssuer, brand: gBrand } = makeIssuerKit('gelt');
  const { issuer: dIssuer, brand: dBrand } = makeIssuerKit('doubloons');
  const { issuer: pIssuer, brand: pBrand } = makeIssuerKit(
    'pieces of eight',
    AssetKind.SET,
  );

  await saveAllIssuers(zcf, { G: gIssuer, D: dIssuer, P: pIssuer });

  t.is(zcf.getBrandForIssuer(gIssuer), gBrand, 'gelt');
  t.is(zcf.getIssuerForBrand(dBrand), dIssuer, 'doubloons');
  t.is(zcf.getBrandForIssuer(pIssuer), pBrand, 'pieces of eight');
});

test(`zcf saveAllIssuers - already known`, async t => {
  const { zcf } = await setupZCFTest();
  const { issuer: kIssuer, brand: kBrand } = makeIssuerKit('krugerrand');

  await saveAllIssuers(zcf, { K: kIssuer });
  t.is(zcf.getBrandForIssuer(kIssuer), kBrand, 'gelt');

  await saveAllIssuers(zcf, { R: kIssuer });
  t.deepEqual(zcf.getTerms().issuers.R, kIssuer);
  t.deepEqual(zcf.getTerms().issuers.K, kIssuer);
  t.is(zcf.getIssuerForBrand(kBrand), kIssuer, 'gelt');
});

test(`zcf saveAllIssuers - duplicate keyword`, async t => {
  const { zcf } = await setupZCFTest();

  const { issuer: pandaIssuer, brand: pandaBrand } = makeIssuerKit('panda');
  await saveAllIssuers(zcf, { P: pandaIssuer });
  t.is(zcf.getBrandForIssuer(pandaIssuer), pandaBrand, 'panda');

  const { issuer: pIssuer, brand: pBrand } = makeIssuerKit(
    'pieces of eight',
    AssetKind.SET,
  );

  await t.notThrowsAsync(
    async () => saveAllIssuers(zcf, { P: pIssuer }),
    'second issuer with same keyword should be ignored.',
  );
  t.is(zcf.getBrandForIssuer(pandaIssuer), pandaBrand, 'gelt');

  t.throws(
    () => zcf.getBrandForIssuer(pIssuer),
    {
      message:
        // Should be able to use more informative error once SES double
        // disclosure bug is fixed. See
        // https://github.com/endojs/endo/pull/640
        //
        // /"issuer" not found: /,
        // /not found: /,
        'key "[Alleged: pieces of eight issuer]" not found in collection "issuerToIssuerRecord"',
    },
    'issuer should not be found',
  );

  t.notThrows(() => assertNatAssetKind(zcf, pandaBrand), 'default');
  t.throws(() => assertNatAssetKind(zcf, pBrand), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /"brand" not found: /,
      // /not found: /,
      'key "[Alleged: pieces of eight brand]" not found in collection "brandToIssuerRecord"',
  });
});

test(`zoeHelper with zcf - assertIssuerKeywords`, async t => {
  const { moolaIssuer, moola, simoleanIssuer, simoleanMint, simoleans } =
    setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(3n) } }),
    { B: simoleanMint.mintPayment(simoleans(3n)) },
  );

  t.throws(
    () => assertIssuerKeywords(zcf, []),
    {
      message: /keywords: .* were not as expected: .*/,
    },
    'empty keywordRecord does not match',
  );
  t.throws(
    () => assertIssuerKeywords(zcf, ['A']),
    {
      message: /keywords: .* were not as expected: .*/,
    },
    'missing keyword from keywordRecord does not match',
  );
  t.throws(
    () => assertIssuerKeywords(zcf, ['A', 'b']),
    {
      message: /keywords: .* were not as expected: .*/,
    },
    'wrong keyword in keywordRecord does not match',
  );
  t.throws(
    () => assertIssuerKeywords(zcf, ['A', 'B', 'C']),
    {
      message: /keywords: .* were not as expected: .*/,
    },
    'extra keywords in keywordRecord does not match',
  );
  t.throws(
    () => assertIssuerKeywords(zcf),
    {
      // host-defined error message differs between node versions and XS. (agoric-sdk/issues/1780)
      message: /undefined|is not iterable/,
    },
    'no expected keywordRecord gets an error',
  );
  t.notThrows(() => assertIssuerKeywords(zcf, ['A', 'B']));
});

test(`zoeHelper with zcf - mustMatch proposal patterns`, async t => {
  const { moola, simoleans } = setup();

  const proposal = harden({
    want: { A: moola(20n) },
    give: { B: simoleans(3n) },
  });

  t.throws(() => mustMatch(proposal, harden([])), {
    message: /.* - Must be: \[\]/,
  });
  t.throws(
    () => mustMatch(proposal, M.split({ want: { C: M.any() } })),
    {
      message:
        'want: {"A":{"brand":"[Alleged: moola brand]","value":"[20n]"}} - Must have missing properties ["C"]',
    },
    'empty keywordRecord does not match',
  );
  t.notThrows(() => mustMatch(proposal, M.split({ want: { A: M.any() } })));
  t.notThrows(() => mustMatch(proposal, M.split({ give: { B: M.any() } })));
  t.throws(
    () => mustMatch(proposal, M.split({ give: { c: M.any() } })),
    {
      message:
        'give: {"B":{"brand":"[Alleged: simoleans brand]","value":"[3n]"}} - Must have missing properties ["c"]',
    },
    'wrong key in keywordRecord does not match',
  );
  t.throws(
    () => mustMatch(proposal, M.split({ exit: { onDemaind: M.any() } })),
    {
      message: '{} - Must have missing properties ["exit"]',
    },
    'missing exit rule',
  );
});

test(`zoeHelper with zcf - assertProposalShape`, async t => {
  const { moolaIssuer, moola, simoleanIssuer, simoleanMint, simoleans } =
    setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(3n) } }),
    { B: simoleanMint.mintPayment(simoleans(3n)) },
  );

  // @ts-expect-error invalid arguments for testing
  t.throws(() => assertProposalShape(zcfSeat, []), {
    message: 'Expected must be an non-array object',
  });
  t.throws(
    () => assertProposalShape(zcfSeat, { want: { C: null } }),
    {
      message: /actual .* did not match expected .*/,
    },
    'empty keywordRecord does not match',
  );
  t.notThrows(() => assertProposalShape(zcfSeat, { want: { A: null } }));
  t.notThrows(() => assertProposalShape(zcfSeat, { give: { B: null } }));
  t.throws(
    () => assertProposalShape(zcfSeat, { give: { c: null } }),
    {
      message: /actual .* did not match expected .*/,
    },
    'wrong key in keywordRecord does not match',
  );
  t.throws(
    () => assertProposalShape(zcfSeat, { exit: { onDemaind: null } }),
    {
      message: /actual .* did not match expected .*/,
    },
    'missing exit rule',
  );
});

const containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

const sameMembers = (arr1, arr2) =>
  containsAll(arr1, arr2) && containsAll(arr2, arr1);

test(`zoeHelper w/zcf - swapExact`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: zcfSeatA, userSeat: userSeatA } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(3n) } }),
    { B: simoleanMint.mintPayment(simoleans(3n)) },
  );
  const { zcfSeat: zcfSeatB, userSeat: userSeatB } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { C: simoleans(3n) }, give: { D: moola(20n) } }),
    { D: moolaMint.mintPayment(moola(20n)) },
  );

  const swapMsg = swapExact(zcf, zcfSeatA, zcfSeatB);

  t.truthy(swapMsg, 'swap succeeded');
  t.truthy(zcfSeatA.hasExited(), 'exit right');
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatA.getPayout('A'),
    moola(20n),
  );
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatA.getPayout('B'),
    simoleans(0n),
  );
  t.truthy(
    sameMembers(Object.getOwnPropertyNames(await userSeatA.getPayouts()), [
      'B',
      'A',
    ]),
  );
  t.truthy(zcfSeatB.hasExited(), 'exit right');
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatB.getPayout('C'),
    simoleans(3n),
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatB.getPayout('D'),
    moola(0n),
  );
  t.truthy(
    sameMembers(Object.getOwnPropertyNames(await userSeatB.getPayouts()), [
      'D',
      'C',
    ]),
  );
});

test(`zoeHelper w/zcf - swapExact w/shortage`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: zcfSeatA, userSeat: userSeatA } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(10n) } }),
    { B: simoleanMint.mintPayment(simoleans(10n)) },
  );
  const { zcfSeat: zcfSeatB, userSeat: userSeatB } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { C: simoleans(10n) }, give: { D: moola(15n) } }),
    { D: moolaMint.mintPayment(moola(15n)) },
  );

  t.throws(() => swapExact(zcf, zcfSeatA, zcfSeatB), {
    message:
      'rights were not conserved for brand "[Alleged: moola brand]" "[15n]" != "[20n]"',
  });
  t.truthy(zcfSeatA.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatA.getPayout('A'),
    moola(0n),
  );
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatA.getPayout('B'),
    simoleans(10n),
  );
  t.truthy(zcfSeatB.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatB.getPayout('C'),
    simoleans(0n),
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatB.getPayout('D'),
    moola(15n),
  );
});

test(`zoeHelper w/zcf - swapExact w/excess`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: zcfSeatA, userSeat: userSeatA } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(10n) } }),
    { B: simoleanMint.mintPayment(simoleans(10n)) },
  );
  const { zcfSeat: zcfSeatB, userSeat: userSeatB } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { C: simoleans(10n) }, give: { D: moola(40n) } }),
    { D: moolaMint.mintPayment(moola(40n)) },
  );

  t.throws(() => swapExact(zcf, zcfSeatA, zcfSeatB), {
    message:
      'rights were not conserved for brand "[Alleged: moola brand]" "[40n]" != "[20n]"',
  });
  t.truthy(zcfSeatA.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatA.getPayout('A'),
    moola(0n),
  );
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatA.getPayout('B'),
    simoleans(10n),
  );
  t.truthy(zcfSeatB.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatB.getPayout('C'),
    simoleans(0n),
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatB.getPayout('D'),
    moola(40n),
  );
});

test(`zoeHelper w/zcf - swapExact w/extra payments`, async t => {
  const {
    moolaIssuer,
    moola,
    moolaMint,
    simoleanIssuer,
    simoleanMint,
    simoleans,
  } = setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat: zcfSeatA, userSeat: userSeatA } = await makeOffer(
    zoe,
    zcf,
    harden({ give: { B: simoleans(10n) } }),
    { B: simoleanMint.mintPayment(simoleans(10n)) },
  );
  const { zcfSeat: zcfSeatB, userSeat: userSeatB } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { C: simoleans(10n) }, give: { D: moola(40n) } }),
    { D: moolaMint.mintPayment(moola(40n)) },
  );

  t.throws(() => swapExact(zcf, zcfSeatA, zcfSeatB), {
    message:
      'rights were not conserved for brand "[Alleged: moola brand]" "[40n]" != "[0n]"',
  });
  t.truthy(zcfSeatA.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatA.getPayout('B'),
    simoleans(10n),
  );
  t.truthy(zcfSeatB.hasExited(), 'fail right');
  await assertPayoutAmount(
    t,
    simoleanIssuer,
    await userSeatB.getPayout('C'),
    simoleans(0n),
  );
  await assertPayoutAmount(
    t,
    moolaIssuer,
    await userSeatB.getPayout('D'),
    moola(40n),
  );
});

test(`zcf/zoeHelper - mustMatch proposal pattern w/bad Expected`, async t => {
  const { moola, simoleans } = setup();

  const proposal = harden({
    want: { A: moola(20n) },
    give: { B: simoleans(3n) },
  });

  t.throws(() => mustMatch(proposal, M.split({ give: { B: moola(3n) } })), {
    message: /.* - Must be: .*/,
  });
});

test(`zcf/zoeHelper - assertProposalShape w/bad Expected`, async t => {
  const { moolaIssuer, moola, simoleanIssuer, simoleanMint, simoleans } =
    setup();
  const issuerKeywordRecord = { A: moolaIssuer, B: simoleanIssuer };
  const { zoe, zcf } = await setupZCFTest(issuerKeywordRecord);

  const { zcfSeat } = await makeOffer(
    zoe,
    zcf,
    harden({ want: { A: moola(20n) }, give: { B: simoleans(3n) } }),
    { B: simoleanMint.mintPayment(simoleans(3n)) },
  );

  // @ts-expect-error purposeful type violation to test enforcement
  t.throws(() => assertProposalShape(zcfSeat, { give: { B: moola(3n) } }), {
    message: /The value of the expected record must be null but was .*/,
  });
});
