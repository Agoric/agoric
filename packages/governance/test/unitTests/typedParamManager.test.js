import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeStoredPublisherKit } from '@agoric/notifier';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { setupZCFTest } from '@agoric/zoe/test/unitTests/zcf/setupZcfTest.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { ParamTypes } from '../../src/index.js';
import {
  makeParamManager,
  makeParamManagerFromTerms,
  makeParamManagerSync,
} from '../../src/contractGovernance/typedParamManager.js';

const drachmaKit = makeIssuerKit('drachma');
const drachmaBrand = drachmaKit.brand;

test('types', async t => {
  t.throws(() =>
    makeParamManagerSync(makeStoredPublisherKit(), {
      // @ts-expect-error invalid value for the declared type
      BrokenBrand: [ParamTypes.BRAND, 'not a brand'],

      BrokenInvitation: [
        // @ts-expect-error not supported in makeParamManagerSync
        'invitation',
        undefined,
      ],
    }),
  );
  const mgr = makeParamManagerSync(makeStoredPublisherKit(), {
    Working: [ParamTypes.NAT, 0n],
  });
  mgr.getWorking().valueOf();
  await t.throwsAsync(async () =>
    mgr.updateParams({ Working: 'not a bigint' }),
  );
});

test('makeParamManagerFromTerms', async t => {
  const terms = harden({
    governedParams: {
      Mmr: { type: 'nat', value: makeRatio(150n, drachmaKit.brand) },
    },
  });
  const issuerKeywordRecord = harden({
    Ignore: drachmaKit.issuer,
  });
  const { zcf } = await setupZCFTest(issuerKeywordRecord, terms);

  const paramManager = await makeParamManagerFromTerms(
    makeStoredPublisherKit(),
    // @ts-expect-error missing governance terms
    zcf,
    { Electorate: zcf.makeInvitation(() => null, 'mock poser invitation') },
    {
      Mmr: 'ratio',
    },
  );
  t.deepEqual(paramManager.getMmr(), terms.governedParams.Mmr.value);
});

test('readonly', async t => {
  const drachmas = AmountMath.make(drachmaBrand, 37n);
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Collateral: [ParamTypes.BRAND, drachmaBrand],
    Amt: [ParamTypes.AMOUNT, drachmas],
  });
  const getters = paramManager.readonly();
  t.is(paramManager.getCollateral, getters.getCollateral);
  t.is(paramManager.getAmt, getters.getAmt);
});

test('two parameters', async t => {
  const drachmas = AmountMath.make(drachmaBrand, 37n);
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Collateral: [ParamTypes.BRAND, drachmaBrand],
    Amt: [ParamTypes.AMOUNT, drachmas],
  });

  t.is(paramManager.getCollateral(), drachmaBrand);
  t.is(paramManager.readonly().getCollateral(), drachmaBrand);
  t.deepEqual(paramManager.getAmt(), drachmas);
  t.deepEqual(
    await paramManager.getParams(),
    harden({
      Collateral: {
        type: ParamTypes.BRAND,
        value: drachmaBrand,
      },
      Amt: {
        type: ParamTypes.AMOUNT,
        value: drachmas,
      },
    }),
  );
});

test('Amount', async t => {
  const { brand: floorBrand } = makeIssuerKit('floor wax');
  const { brand: dessertBrand } = makeIssuerKit('dessertTopping');
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Shimmer: [ParamTypes.AMOUNT, AmountMath.make(floorBrand, 2n)],
  });
  t.deepEqual(paramManager.getShimmer(), AmountMath.make(floorBrand, 2n));

  await paramManager.updateParams({ Shimmer: AmountMath.make(floorBrand, 5n) });
  t.deepEqual(paramManager.getShimmer(), AmountMath.make(floorBrand, 5n));

  await t.throwsAsync(
    async () => paramManager.updateParams({ Shimmer: 'fear,loathing' }),
    {
      message: 'Expected an Amount for "Shimmer", got: "fear,loathing"',
    },
  );

  await t.throwsAsync(
    async () =>
      paramManager.updateParams({
        Shimmer: AmountMath.make(dessertBrand, 20n),
      }),
    {
      message:
        'The brand in the allegedAmount {"brand":"[Alleged: dessertTopping brand]","value":"[20n]"} in \'coerce\' didn\'t match the specified brand "[Alleged: floor wax brand]".',
    },
  );

  await t.throwsAsync(
    async () => paramManager.updateParams({ Shimmer: 'fear,loathing' }),
    {
      message: 'Expected an Amount for "Shimmer", got: "fear,loathing"',
    },
  );
});

test('params one installation', async t => {
  const terms = harden({
    mmr: makeRatio(150n, drachmaKit.brand),
  });
  const issuerKeywordRecord = harden({
    Ignore: drachmaKit.issuer,
  });
  const { zcf } = await setupZCFTest(issuerKeywordRecord, terms);

  /** @type {Installation} */
  // @ts-expect-error mock
  const installationHandle = Far('fake Installation', {
    getBundle: () => ({ obfuscated: 42 }),
  });

  const paramManager = await makeParamManager(
    makeStoredPublisherKit(),
    {
      PName: ['installation', installationHandle],
    },
    zcf,
  );

  t.deepEqual(paramManager.getPName(), installationHandle);
  await t.throwsAsync(
    async () => paramManager.updateParams({ PName: 18.1 }),
    {
      message: 'value for "PName" must be an Installation, was 18.1',
    },
    'value should be an installation',
  );
  /** @type {Installation} */
  // @ts-expect-error mock
  const handle2 = Far('another fake Installation', {
    getBundle: () => ({ condensed: '() => {})' }),
  });
  await paramManager.updateParams({ PName: handle2 });
  t.deepEqual(paramManager.getPName(), handle2);

  t.deepEqual(
    await paramManager.getParams(),
    harden({
      PName: {
        type: ParamTypes.INSTALLATION,
        value: handle2,
      },
    }),
  );
});

test('params one instance', async t => {
  const instanceKey = 'Instance';
  // this is sufficient for the current type check. When we add
  // isInstallation() (#3344), we'll need to make a mockZoe.
  const instanceHandle = makeHandle(instanceKey);

  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    PName: ['instance', instanceHandle],
  });

  t.deepEqual(paramManager.getPName(), instanceHandle);
  await t.throwsAsync(
    async () => paramManager.updateParams({ PName: 18.1 }),
    {
      message: 'value for "PName" must be an Instance, was 18.1',
    },
    'value should be an instance',
  );
  const handle2 = makeHandle(instanceKey);
  await paramManager.updateParams({ PName: handle2 });
  t.deepEqual(paramManager.getPName(), handle2);

  t.deepEqual(
    await paramManager.getParams(),
    harden({
      PName: {
        type: ParamTypes.INSTANCE,
        value: handle2,
      },
    }),
  );
});

test('Invitation', async t => {
  const terms = harden({
    mmr: makeRatio(150n, drachmaKit.brand),
  });

  const issuerKeywordRecord = harden({
    Ignore: drachmaKit.issuer,
  });

  const { instance, zcf, zoe } = await setupZCFTest(issuerKeywordRecord, terms);

  /** @type {Invitation} */
  const invitation = await E(E(zoe).getPublicFacet(instance)).makeInvitation();

  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    invitation,
  );

  const drachmaAmount = AmountMath.make(drachmaBrand, 37n);
  const paramManager = await makeParamManager(
    makeStoredPublisherKit(),
    {
      Collateral: [ParamTypes.BRAND, drachmaBrand],
      Amt: [ParamTypes.AMOUNT, drachmaAmount],
      Invite: ['invitation', invitation],
    },
    zcf,
  );

  t.is(paramManager.getCollateral(), drachmaBrand);
  t.is(paramManager.getAmt(), drachmaAmount);
  // XXX UNTIL https://github.com/Agoric/agoric-sdk/issues/4343
  await eventLoopIteration();
  const invitationActualAmount = paramManager.getInvite().value;
  t.deepEqual(invitationActualAmount, invitationAmount.value);
  // @ts-expect-error XXX
  t.is(invitationActualAmount[0].description, 'simple');

  t.is(await paramManager.getInternalParamValue('Invite'), invitation);

  t.deepEqual(
    await paramManager.getParams(),
    harden({
      Amt: {
        type: ParamTypes.AMOUNT,
        value: drachmaAmount,
      },
      Collateral: {
        type: ParamTypes.BRAND,
        value: drachmaBrand,
      },
      Invite: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
    }),
  );
});

test('two Nats', async t => {
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Acres: [ParamTypes.NAT, 50n],
    SpeedLimit: [ParamTypes.NAT, 299_792_458n],
  });

  t.is(paramManager.getAcres(), 50n);
  t.is(paramManager.getSpeedLimit(), 299_792_458n);

  await t.throwsAsync(
    async () => paramManager.updateParams({ SpeedLimit: 300000000 }),
    {
      message: '300000000 must be a bigint',
    },
  );

  await t.throwsAsync(
    async () => paramManager.updateParams({ SpeedLimit: -37n }),
    {
      message: '-37 is negative',
    },
  );
});

test('Ratio', async t => {
  const unitlessBrand = makeIssuerKit('unitless').brand;

  const ratio = makeRatio(16180n, unitlessBrand, 10_000n);
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Acres: [ParamTypes.NAT, 50n],
    GoldenRatio: ['ratio', ratio],
  });
  t.is(paramManager.getGoldenRatio(), ratio);

  const morePrecise = makeRatio(1618033n, unitlessBrand, 1_000_000n);
  await paramManager.updateParams({ GoldenRatio: morePrecise });
  t.is(paramManager.getGoldenRatio(), morePrecise);

  await t.throwsAsync(
    async () => paramManager.updateParams({ GoldenRatio: 300000000 }),
    {
      message: '"ratio" 300000000 must be a pass-by-copy record, not "number"',
    },
  );

  const anotherBrand = makeIssuerKit('arbitrary').brand;

  await t.throwsAsync(
    async () =>
      paramManager.updateParams({
        GoldenRatio: makeRatio(16180n, anotherBrand, 10_000n),
      }),
    {
      message:
        'Numerator brand for "GoldenRatio" must be "[Alleged: unitless brand]"',
    },
  );
});

test('Strings', async t => {
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Acres: [ParamTypes.NAT, 50n],
    OurWeapons: ['string', 'fear'],
  });
  t.is(paramManager.getOurWeapons(), 'fear');

  await paramManager.updateParams({ OurWeapons: 'fear,surprise' });
  t.is(paramManager.getOurWeapons(), 'fear,surprise');
  await t.throwsAsync(
    async () => paramManager.updateParams({ OurWeapons: 300000000 }),
    {
      message: '300000000 must be a string',
    },
  );
});

test('Unknown', async t => {
  const paramManager = makeParamManagerSync(makeStoredPublisherKit(), {
    Label: ['string', 'birthday'],
    Surprise: ['unknown', 'party'],
  });
  t.is(paramManager.getSurprise(), 'party');

  await paramManager.updateParams({ Surprise: 'gift' });
  t.is(paramManager.getSurprise(), 'gift');
  await paramManager.updateParams({ Surprise: ['gift', 'party'] });
  t.deepEqual(paramManager.getSurprise(), ['gift', 'party']);
});

test('makeParamManagerFromTerms overrides', async t => {
  const terms = harden({
    governedParams: {
      Mmr: { type: 'nat', value: makeRatio(150n, drachmaKit.brand) },
    },
  });
  const issuerKeywordRecord = harden({
    Ignore: drachmaKit.issuer,
  });
  const { zcf } = await setupZCFTest(issuerKeywordRecord, terms);

  const paramManager = await makeParamManagerFromTerms(
    makeStoredPublisherKit(),
    // @ts-expect-error missing governance terms
    zcf,
    { Electorate: zcf.makeInvitation(() => null, 'mock poser invitation') },
    {
      Mmr: 'ratio',
    },
    { Mmr: makeRatio(100n, drachmaKit.brand) },
  );
  t.deepEqual(paramManager.getMmr().numerator.value, 100n);
});
