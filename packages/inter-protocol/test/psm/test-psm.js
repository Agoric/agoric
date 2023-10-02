import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import '@agoric/zoe/exported.js';
import '../../src/vaultFactory/types-ambient.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { split } from '@agoric/ertp/src/legacy-payment-helpers.js';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import committeeBundle from '@agoric/governance/bundles/bundle-committee.js';
import contractGovernorBundle from '@agoric/governance/bundles/bundle-contractGovernor.js';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import centralSupplyBundle from '@agoric/vats/bundles/bundle-centralSupply.js';
import mintHolderBundle from '@agoric/vats/bundles/bundle-mintHolder.js';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import {
  floorDivideBy,
  floorMultiplyBy,
  makeRatio,
  natSafeMath as NatMath,
} from '@agoric/zoe/src/contractSupport/index.js';

import { NonNullish } from '@agoric/assert';
import { documentStorageSchema } from '@agoric/governance/tools/storageDoc.js';
import { makeTracer } from '@agoric/internal';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeAgoricNamesAccess, makePromiseSpace } from '@agoric/vats';
import {
  produceDiagnostics,
  produceStartUpgradable,
} from '@agoric/vats/src/core/basic-behaviors.js';
import { E, Far } from '@endo/far';
import path from 'path';
import { makeHeapZone } from '@agoric/zone';
import { Stable } from '@agoric/internal/src/tokens.js';
import { makeAnchorAsset, startPSM } from '../../src/proposals/startPSM.js';
import {
  makeMockChainStorageRoot,
  mintRunPayment,
  scale6,
  setUpZoeForTest,
  subscriptionKey,
  withAmountUtils,
} from '../supports.js';
import { anchorAssets, chainStorageEntries } from './psm-storage-fixture.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const pathname = new URL(import.meta.url).pathname;
const dirname = path.dirname(pathname);

const psmRoot = `${dirname}/../../src/psm/psm.js`;
const trace = makeTracer('TestPSM', false);

const BASIS_POINTS = 10000n;
const WantMintedFeeBP = 1n;
const GiveMintedFeeBP = 3n;
const MINT_LIMIT = scale6(20_000_000);

/**
 * Compute the fee for giving an Amount in minted.
 *
 * @param {Amount<'nat'>} minted
 * @returns {Amount<'nat'>}
 */
const minusMintedFee = minted => {
  const feeBP = GiveMintedFeeBP;
  return AmountMath.make(
    minted.brand,
    NatMath.floorDivide(
      NatMath.multiply(minted.value, NatMath.subtract(BASIS_POINTS, feeBP)),
      BASIS_POINTS,
    ),
  );
};

/**
 * Compute the fee in the minted asset of an Amount given in anchor.
 *
 * @param {Amount<'nat'>} anchor
 * @param {Ratio} anchorPerMinted
 * @returns {Amount<'nat'>}
 */
const minusAnchorFee = (anchor, anchorPerMinted) => {
  const minted = floorDivideBy(anchor, anchorPerMinted);
  const feeBP = WantMintedFeeBP;
  return AmountMath.make(
    minted.brand,
    NatMath.floorDivide(
      NatMath.multiply(minted.value, NatMath.subtract(BASIS_POINTS, feeBP)),
      BASIS_POINTS,
    ),
  );
};

const makeTestContext = async () => {
  const bundleCache = await unsafeMakeBundleCache('bundles/');
  const psmBundle = await bundleCache.load(psmRoot, 'psm');
  const { zoe, feeMintAccessP } = await setUpZoeForTest();
  const feeMintAccess = await feeMintAccessP;

  const mintedIssuer = await E(zoe).getFeeIssuer();
  /** @type {IssuerKit<'nat'>} */
  // @ts-expect-error missing IssuerKit properties not needed in the test
  const mintedKit = {
    issuer: mintedIssuer,
    brand: await E(mintedIssuer).getBrand(),
  };
  const minted = withAmountUtils(mintedKit);
  const anchor = withAmountUtils(makeIssuerKit('aUSD'));

  const installs = {
    contractGovernor: await E(zoe).install(contractGovernorBundle),
    committeeInstall: await E(zoe).install(committeeBundle),
    psm: await E(zoe).install(psmBundle),
    centralSupply: await E(zoe).install(centralSupplyBundle),
    mintHolder: await E(zoe).install(mintHolderBundle),
  };

  const board = makeFakeBoard();
  const marshaller = board.getReadonlyMarshaller();

  const chainStorage = makeMockChainStorageRoot();
  const { creatorFacet: committeeCreator } = await E(zoe).startInstance(
    installs.committeeInstall,
    harden({}),
    {
      committeeName: 'Demos',
      committeeSize: 1,
    },
    {
      storageNode: chainStorage.makeChildNode('thisCommittee'),
      marshaller,
    },
  );

  const initialPoserInvitation = await E(committeeCreator).getPoserInvitation();
  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    initialPoserInvitation,
  );

  return {
    bundles: { psmBundle },
    zoe: await zoe,
    feeMintAccess,
    economicCommitteeCreatorFacet: committeeCreator,
    initialPoserInvitation,
    chainStorage,
    minted,
    anchor,
    installs,
    board,
    marshaller,
    terms: {
      anchorBrand: anchor.brand,
      anchorPerMinted: makeRatio(100n, anchor.brand, 100n, minted.brand),
      electionManager: Far('mock election manager instance'),
      governedParams: {
        [CONTRACT_ELECTORATE]: {
          type: ParamTypes.INVITATION,
          value: invitationAmount,
        },
        GiveMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(GiveMintedFeeBP, minted.brand, BASIS_POINTS),
        },
        MintLimit: { type: ParamTypes.AMOUNT, value: minted.make(MINT_LIMIT) },
        WantMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(WantMintedFeeBP, minted.brand, BASIS_POINTS),
        },
      },
    },
  };
};

test.before(async t => {
  t.context = await makeTestContext();
});

/**
 * @param {import('ava').ExecutionContext<
 *   Awaited<ReturnType<makeTestContext>>
 * >} t
 * @param {{}} [customTerms]
 */
async function makePsmDriver(t, customTerms) {
  const {
    zoe,
    feeMintAccess,
    initialPoserInvitation,
    terms,
    installs: { psm: psmInstall },
    anchor,
  } = t.context;

  // Each driver needs its own to avoid state pollution between tests
  const mockChainStorage = makeMockChainStorageRoot();

  /** @type {Awaited<ReturnType<import('../../src/psm/psm.js').start>>} */
  const { creatorFacet, publicFacet } = await E(zoe).startInstance(
    psmInstall,
    harden({ AUSD: anchor.issuer }),
    { ...terms, ...customTerms },
    harden({
      feeMintAccess,
      initialPoserInvitation,
      storageNode: mockChainStorage
        .makeChildNode('psm')
        .makeChildNode('IST')
        .makeChildNode('AUSD'),
      marshaller: makeFakeBoard().getReadonlyMarshaller(),
    }),
  );

  /**
   * @param {Amount<'nat'>} giveAnchor
   * @param {Amount<'nat'>} [wantMinted]
   */
  const swapAnchorForMintedSeat = async (giveAnchor, wantMinted) => {
    const seat = E(zoe).offer(
      E(publicFacet).makeWantMintedInvitation(),
      harden({
        give: { In: giveAnchor },
        ...(wantMinted ? { want: { Out: wantMinted } } : {}),
      }),
      harden({ In: anchor.mint.mintPayment(giveAnchor) }),
    );
    await eventLoopIteration();
    return seat;
  };

  /**
   * @param {Amount<'nat'>} giveRun
   * @param {Payment<'nat'>} runPayment
   * @param {Amount<'nat'>} [wantAnchor]
   */
  const swapMintedForAnchorSeat = async (giveRun, runPayment, wantAnchor) => {
    const seat = E(zoe).offer(
      E(publicFacet).makeGiveMintedInvitation(),
      harden({
        give: { In: giveRun },
        ...(wantAnchor ? { want: { Out: wantAnchor } } : {}),
      }),
      harden({ In: runPayment }),
    );
    await eventLoopIteration();
    return seat;
  };

  return {
    mockChainStorage,
    publicFacet,

    /** @param {Amount<'nat'>} expected */
    async assertPoolBalance(expected) {
      const balance = await E(publicFacet).getPoolBalance();
      t.deepEqual(balance, expected);
    },

    /** @type {(subpath: string) => object} */
    getStorageChildBody(subpath) {
      return mockChainStorage.getBody(
        `mockChainStorageRoot.psm.IST.AUSD.${subpath}`,
      );
    },

    async getFeePayout() {
      const limitedCreatorFacet = E(creatorFacet).getLimitedCreatorFacet();
      const collectFeesSeat = await E(zoe).offer(
        await E(limitedCreatorFacet).makeCollectFeesInvitation(),
      );
      await E(collectFeesSeat).getOfferResult();
      const feePayoutAmount = await E.get(
        E(collectFeesSeat).getFinalAllocation(),
      ).Fee;
      return feePayoutAmount;
    },

    /**
     * @param {Amount<'nat'>} giveAnchor
     * @param {Amount<'nat'>} [wantMinted]
     */
    async swapAnchorForMinted(giveAnchor, wantMinted) {
      const seat = swapAnchorForMintedSeat(giveAnchor, wantMinted);
      return E(seat).getPayouts();
    },
    swapAnchorForMintedSeat,

    /**
     * @param {Amount<'nat'>} giveAnchor
     * @param {Amount<'nat'>} [wantMinted]
     */
    async swapAnchorForMintedErrors(giveAnchor, wantMinted) {
      const seat = swapAnchorForMintedSeat(giveAnchor, wantMinted);
      return seat;
    },

    /**
     * @param {Amount<'nat'>} giveRun
     * @param {Payment<'nat'>} runPayment
     * @param {Amount<'nat'>} [wantAnchor]
     */
    async swapMintedForAnchor(giveRun, runPayment, wantAnchor) {
      const seat = swapMintedForAnchorSeat(giveRun, runPayment, wantAnchor);
      return E(seat).getPayouts();
    },
    swapMintedForAnchorSeat,
  };
}

test('simple trades', async t => {
  const { terms, minted, anchor } = t.context;
  const driver = await makePsmDriver(t);

  const giveAnchor = anchor.units(200);

  const runPayouts = await driver.swapAnchorForMinted(giveAnchor);
  const expectedRun = minusAnchorFee(giveAnchor, terms.anchorPerMinted);
  const actualRun = await E(minted.issuer).getAmountOf(runPayouts.Out);
  t.deepEqual(actualRun, expectedRun);
  await driver.assertPoolBalance(giveAnchor);

  const giveRun = minted.units(100);
  trace('get minted', { giveRun, expectedRun, actualRun });
  const [runPayment, _moreRun] = await split(
    E(minted.issuer).makeEmptyPurse(),
    runPayouts.Out,
    giveRun,
  );
  const anchorPayouts = await driver.swapMintedForAnchor(giveRun, runPayment);
  const actualAnchor = await E(anchor.issuer).getAmountOf(anchorPayouts.Out);
  const expectedAnchor = AmountMath.make(
    anchor.brand,
    minusMintedFee(giveRun).value,
  );
  t.deepEqual(actualAnchor, expectedAnchor);
  await driver.assertPoolBalance(
    AmountMath.subtract(giveAnchor, expectedAnchor),
  );
  trace('get anchor', { runGive: giveRun, expectedRun, actualAnchor });

  // Check the fees
  // 1BP per anchor = 30000n plus 3BP per minted = 20000n
  const feePayoutAmount = await driver.getFeePayout();
  const expectedFee = AmountMath.make(minted.brand, 50000n);
  trace('Reward Fee', { feePayoutAmount, expectedFee });
  t.truthy(AmountMath.isEqual(feePayoutAmount, expectedFee));
});

test('limit', async t => {
  const { anchor } = t.context;

  const driver = await makePsmDriver(t);

  const initialPool = AmountMath.make(anchor.brand, 1n);
  await driver.swapAnchorForMinted(initialPool);
  await driver.assertPoolBalance(initialPool);

  trace('test going over limit');
  const give = anchor.make(MINT_LIMIT);
  const seat = await driver.swapAnchorForMintedErrors(give);
  await t.throwsAsync(async () => E(seat).getOfferResult());

  const paymentPs = await E(seat).getPayouts();
  trace('gone over limit');
  // We should get 0 Minted  and all our anchor back
  t.falsy(paymentPs.Out);
  const anchorReturn = await paymentPs.In;
  const actualAnchor = await E(anchor.issuer).getAmountOf(anchorReturn);
  t.deepEqual(actualAnchor, give);
  // The pool should be unchanged
  await driver.assertPoolBalance(initialPool);
});

test('limit is for minted', async t => {
  const { minted, anchor } = t.context;
  // only 50 minted allowed per anchor
  const anchorPerMinted = makeRatio(50n, anchor.brand, 100n, minted.brand);
  const driver = await makePsmDriver(t, { anchorPerMinted });

  trace('test going over limit');
  const giveTooMuch = anchor.make(MINT_LIMIT);
  const seat1 = await driver.swapAnchorForMintedSeat(giveTooMuch);
  await t.throwsAsync(
    () => E(seat1).getOfferResult(),
    {
      message: 'Request would exceed mint limit',
    },
    'limit is enforced on the Minted rather than Anchor',
  );

  trace('test right at limit');
  const give = anchor.make(MINT_LIMIT / 2n);
  await t.notThrowsAsync(
    driver.swapAnchorForMinted(give),
    'swap at minted limit',
  );
});

/**
 * @type {[
 *   kind: 'want' | 'give',
 *   give: number,
 *   want: number,
 *   ok: boolean,
 *   wants?: number,
 * ][]}
 */
const trades = [
  ['give', 200, 190, false],
  ['want', 101, 100, true, 1],
  ['give', 50, 50, false],
  ['give', 51, 50, true, 1],
];

test('mix of trades: failures do not prevent later service', async t => {
  const {
    terms,
    minted,
    anchor,
    feeMintAccess,
    zoe,
    installs: { centralSupply },
  } = t.context;
  const driver = await makePsmDriver(t);

  const ist100 = await mintRunPayment(scale6(500), {
    centralSupply,
    feeMintAccess,
    zoe,
  });

  assert(anchor.issuer);
  const anchorPurse = await E(anchor.issuer).makeEmptyPurse();
  const mintedPurse = await E(minted.issuer).makeEmptyPurse();
  await E(mintedPurse).deposit(ist100);

  const wantMinted = async (ix, give, want, ok, wants) => {
    t.log('wantMinted', ix, give, want, ok, wants);
    const giveAnchor = anchor.units(give);
    const wantAmt = minted.units(want);
    const seat = await driver.swapAnchorForMintedSeat(giveAnchor, wantAmt);
    if (!ok) {
      await t.throwsAsync(E(seat).getOfferResult());
      return;
    }
    await E(seat).getOfferResult();
    t.is(await E(seat).numWantsSatisfied(), wants);
    if (wants === 0) {
      return;
    }
    const runPayouts = await E(seat).getPayouts();
    const expectedRun = minusAnchorFee(giveAnchor, terms.anchorPerMinted);
    const actualRun = await E(mintedPurse).deposit(await runPayouts.Out);
    t.deepEqual(actualRun, expectedRun);
  };

  const giveMinted = async (ix, give, want, ok, wants) => {
    t.log('giveMinted', ix, give, want, ok, wants);
    const giveRun = minted.units(give);
    const runPayment = await E(mintedPurse).withdraw(giveRun);
    const wantAmt = anchor.units(want);
    const seat = await driver.swapMintedForAnchorSeat(
      giveRun,
      runPayment,
      wantAmt,
    );
    const anchorPayouts = await E(seat).getPayouts();
    if (!ok) {
      await t.throwsAsync(E(seat).getOfferResult());
      return;
    }
    await E(seat).getOfferResult();

    t.is(await E(seat).numWantsSatisfied(), wants);
    if (wants === 0) {
      return;
    }
    const actualAnchor = await E(anchorPurse).deposit(await anchorPayouts.Out);
    const expectedAnchor = AmountMath.make(
      anchor.brand,
      minusMintedFee(giveRun).value,
    );
    t.deepEqual(actualAnchor, expectedAnchor);
  };

  let ix = 0;
  for (const [kind, give, want, ok, wants] of trades) {
    switch (kind) {
      case 'give':
        await giveMinted(ix, give, want, ok, wants);
        break;
      case 'want':
        await wantMinted(ix, give, want, ok, wants);
        break;
      default:
        assert.fail(kind);
    }
    ix += 1;
  }
});

test('anchor is 2x minted', async t => {
  const { minted, anchor } = t.context;
  const anchorPerMinted = makeRatio(200n, anchor.brand, 100n, minted.brand);
  const driver = await makePsmDriver(t, { anchorPerMinted });

  const giveAnchor = anchor.units(400);
  const runPayouts = await driver.swapAnchorForMinted(giveAnchor);

  const expectedRun = minusAnchorFee(giveAnchor, anchorPerMinted);
  const actualRun = await E(minted.issuer).getAmountOf(runPayouts.Out);
  t.deepEqual(actualRun, expectedRun);

  await driver.assertPoolBalance(giveAnchor);

  const giveRun = minted.units(100);
  trace('get minted ratio', { giveRun, expectedRun, actualRun });
  const [runPayment, _moreRun] = await split(
    E(minted.issuer).makeEmptyPurse(),
    runPayouts.Out,
    giveRun,
  );
  const anchorPayouts = await driver.swapMintedForAnchor(giveRun, runPayment);
  const actualAnchor = await E(anchor.issuer).getAmountOf(anchorPayouts.Out);
  const expectedAnchor = floorMultiplyBy(
    minusMintedFee(giveRun),
    anchorPerMinted,
  );
  t.deepEqual(actualAnchor, expectedAnchor);
  await driver.assertPoolBalance(
    AmountMath.subtract(giveAnchor, expectedAnchor),
  );
  trace('get anchor', { runGive: giveRun, expectedRun, actualAnchor });
});

test('governance', async t => {
  const driver = await makePsmDriver(t);
  t.is(
    await subscriptionKey(E(driver.publicFacet).getSubscription()),
    'mockChainStorageRoot.psm.IST.AUSD.governance',
  );

  t.like(driver.getStorageChildBody('governance'), {
    current: {
      Electorate: { type: 'invitation' },
      GiveMintedFee: { type: 'ratio' },
      MintLimit: { type: 'amount' },
      WantMintedFee: { type: 'ratio' },
    },
  });
});

test('metrics, with snapshot', async t => {
  const driver = await makePsmDriver(t);
  const publicTopics = await E(driver.publicFacet).getPublicTopics();
  t.like(publicTopics, {
    metrics: { description: 'PSM metrics' },
  });
  t.is(
    await publicTopics.metrics.storagePath,
    'mockChainStorageRoot.psm.IST.AUSD.metrics',
  );

  const { anchor, minted } = t.context;
  // Test keys and brands, then assume they don't change
  t.deepEqual(Object.keys(driver.getStorageChildBody('metrics')), [
    'anchorPoolBalance',
    'feePoolBalance',
    'mintedPoolBalance',
    'totalAnchorProvided',
    'totalMintedProvided',
  ]);
  t.like(driver.getStorageChildBody('metrics'), {
    anchorPoolBalance: { brand: Far('aUSD brand'), value: 0n },
    feePoolBalance: { brand: Far('IST brand'), value: 0n },
    mintedPoolBalance: {
      brand: Far('IST brand'),
      value: 0n,
    },
    totalAnchorProvided: {
      brand: Far('aUSD brand'),
      value: 0n,
    },
    totalMintedProvided: {
      brand: Far('IST brand'),
      value: 0n,
    },
  });
  const giveAnchor = anchor.units(200);

  // grow the pool
  const mintedPayouts = await driver.swapAnchorForMinted(giveAnchor);
  t.like(driver.getStorageChildBody('metrics'), {
    anchorPoolBalance: {
      value: giveAnchor.value,
    },
    feePoolBalance: { value: 20_000n },
    mintedPoolBalance: {
      brand: Far('IST brand'),
      value: giveAnchor.value,
    },
    totalAnchorProvided: {
      value: 0n,
    },
    totalMintedProvided: {
      value: giveAnchor.value,
    },
  });

  // no change
  await driver.swapAnchorForMinted(anchor.make(0n));
  t.like(driver.getStorageChildBody('metrics'), {
    anchorPoolBalance: {
      value: giveAnchor.value,
    },
    feePoolBalance: { value: 20_000n },
    mintedPoolBalance: {
      brand: Far('IST brand'),
      value: giveAnchor.value,
    },
    totalAnchorProvided: {
      value: 0n,
    },
    totalMintedProvided: {
      value: giveAnchor.value,
    },
  });

  // get anchor
  const giveMinted = minted.units(100);
  const [runPayment, _moreRun] = await split(
    E(minted.issuer).makeEmptyPurse(),
    mintedPayouts.Out,
    giveMinted,
  );
  const fee = 30_000n;
  await driver.swapMintedForAnchor(giveMinted, runPayment);
  t.like(driver.getStorageChildBody('metrics'), {
    anchorPoolBalance: {
      value: giveMinted.value + fee,
    },
    feePoolBalance: { value: 50_000n },
    mintedPoolBalance: {
      brand: Far('IST brand'),
      value: giveAnchor.value - giveMinted.value + fee,
    },
    totalAnchorProvided: {
      value: giveMinted.value - fee,
    },
    totalMintedProvided: {
      value: giveAnchor.value,
    },
  });

  const doc = {
    node: 'psm',
    owner: 'a tree of PSM contract instances',
  };
  await documentStorageSchema(t, driver.mockChainStorage, doc);
});

test('wrong give giveMintedInvitation', async t => {
  const { zoe, anchor } = t.context;
  const { publicFacet } = await makePsmDriver(t);
  const giveAnchor = anchor.units(200);
  await t.throwsAsync(
    () =>
      E(zoe).offer(
        E(publicFacet).makeGiveMintedInvitation(),
        harden({ give: { In: giveAnchor } }),
        harden({ In: NonNullish(anchor.mint).mintPayment(giveAnchor) }),
      ),
    {
      message:
        '"giveMinted" proposal: give: In: brand: "[Alleged: aUSD brand]" - Must be: "[Alleged: IST brand]"',
    },
  );
});

test('wrong give wantMintedInvitation', async t => {
  const {
    minted,
    feeMintAccess,
    zoe,
    installs: { centralSupply },
  } = t.context;
  const { publicFacet } = await makePsmDriver(t);
  const istValue = scale6(100);
  const giveIST = AmountMath.make(minted.brand, istValue);
  const istPayment = await mintRunPayment(istValue, {
    centralSupply,
    feeMintAccess,
    zoe,
  });
  await t.throwsAsync(
    () =>
      E(zoe).offer(
        E(publicFacet).makeWantMintedInvitation(),
        harden({ give: { In: giveIST } }),
        harden({ In: istPayment }),
      ),
    {
      message:
        '"wantMinted" proposal: give: In: brand: "[Alleged: IST brand]" - Must be: "[Alleged: aUSD brand]"',
    },
  );
});

test('extra give wantMintedInvitation', async t => {
  const { zoe, anchor } = t.context;
  const { publicFacet } = await makePsmDriver(t);
  const giveAnchor = anchor.units(200);
  const mint = NonNullish(anchor.mint);
  await t.throwsAsync(
    () =>
      E(zoe).offer(
        E(publicFacet).makeWantMintedInvitation(),
        harden({ give: { In: giveAnchor, Extra: giveAnchor } }),
        harden({
          In: mint.mintPayment(giveAnchor),
          Extra: mint.mintPayment(giveAnchor),
        }),
      ),
    {
      message:
        /"wantMinted" proposal: .* - Must not have unexpected properties: \["Extra"\]/,
    },
  );
});

// XXX copied (with minor tweak) from packages/inter-protocol/test/test-gov-collateral.js
const makeMockBankManager = t => {
  /** @type {BankManager} */
  const bankManager = Far('mock BankManager', {
    getAssetSubscription: () => assert.fail('not impl'),
    getModuleAccountAddress: () => assert.fail('not impl'),
    getRewardDistributorDepositFacet: () =>
      Far('depositFacet', {
        receive: () => /** @type {any} */ (null),
      }),
    addAsset: async (denom, keyword, proposedName, kit) => {
      t.log('addAsset', { denom, keyword, issuer: `${kit.issuer}` });
      t.truthy(kit.mint);
    },
    getBankForAddress: () => assert.fail('not impl'),
  });
  return bankManager;
};

test('restore PSM: startPSM with previous metrics, params', async t => {
  /** @type {import('../../src/proposals/econ-behaviors').EconomyBootstrapPowers} */
  // @ts-expect-error mock
  const { produce, consume } = makePromiseSpace();
  const { agoricNames, agoricNamesAdmin, spaces } =
    await makeAgoricNamesAccess();
  const { zoe } = t.context;

  // Prep bootstrap space
  {
    const zone = makeHeapZone();
    await produceDiagnostics({ produce });
    // @ts-expect-error Doesnt actually require all bootstrap powers
    await produceStartUpgradable({ zone, consume, produce });

    const {
      installs,
      board,
      minted,
      feeMintAccess,
      economicCommitteeCreatorFacet,
      chainStorage,
    } = t.context;

    const provisionPoolStartResult = harden({
      creatorFacet: {
        initPSM: (brand, psm) => t.log('initPSM', { brand, psm }),
      },
    });

    const econCharterKit = harden({
      creatorFacet: {
        addInstance: (psm, creatorFacet, instance) =>
          t.log('addInstance', { psm, creatorFacet, instance }),
      },
    });

    for (const [name, value] of Object.entries({
      agoricNamesAdmin,
      board,
      chainStorage,
      zoe,
      feeMintAccess,
      economicCommitteeCreatorFacet,
      econCharterKit,
      provisionPoolStartResult,
      bankManager: makeMockBankManager(t),
      chainTimerService: null, // not used in this test
    })) {
      produce[name].resolve(value);
    }

    for (const [name, installation] of Object.entries(installs)) {
      spaces.installation.produce[name].resolve(installation);
    }

    spaces.brand.produce[Stable.symbol].resolve(minted.brand);
  }

  const powers = {
    vatParameters: { chainStorageEntries, anchorAssets },
    produce,
    consume,
    ...spaces,
  };

  // Run code under test
  await Promise.all([
    ...anchorAssets.map(anchorOptions =>
      makeAnchorAsset(powers, {
        options: { anchorOptions },
      }),
    ),
    ...anchorAssets.map(anchorOptions =>
      startPSM(powers, {
        options: { anchorOptions },
      }),
    ),
  ]);

  // Check results: USDC_axl metrics, params
  const stableIssuer = E(zoe).getFeeIssuer();
  const stableBrand = await E(stableIssuer).getBrand();
  {
    const anchorBrand = await agoricNames.lookup('brand', 'USDC_axl');
    const expected = {
      metrics: {
        anchorPoolBalance: { brand: anchorBrand, value: 487_464_281_410n },
        feePoolBalance: { brand: stableBrand, value: 0n },
        mintedPoolBalance: { brand: stableBrand, value: 487_464_281_410n },
        totalAnchorProvided: { brand: anchorBrand, value: 4_327_825_824_427n },
        totalMintedProvided: { brand: stableBrand, value: 4_815_290_105_837n },
      },
      params: {
        GiveMintedFee: {
          type: 'ratio',
          value: {
            numerator: { brand: stableBrand, value: 0n },
            denominator: { brand: stableBrand, value: 10_000n },
          },
        },
        MintLimit: {
          type: 'amount',
          value: { brand: stableBrand, value: 1_000_000_000_000n },
        },
        WantMintedFee: {
          type: 'ratio',
          value: {
            numerator: { brand: stableBrand, value: 0n },
            denominator: { brand: stableBrand, value: 10_000n },
          },
        },
      },
    };

    const instance0 = await E(E(agoricNamesAdmin).readonly()).lookup(
      'instance',
      'psm-IST-USDC_axl',
    );
    /** @type {ERef<import('../../src/psm/psm.js').PsmPublicFacet>} */
    const pf0 = E(zoe).getPublicFacet(instance0);

    const { value: contractMetrics } = await E(
      E(pf0).getMetrics(),
    ).getUpdateSince();
    t.deepEqual(contractMetrics, expected.metrics);

    const contractParams = await E(pf0).getGovernedParams();

    /** @param {ParamStateRecord} p */
    const omitElectorate = ({ Electorate: _, ...params }) => params;
    t.deepEqual(omitElectorate(contractParams), expected.params);
  }

  // Check USDT fees
  {
    const expected = { brand: stableBrand, value: 58_732_736n };
    const anchorBrand = await agoricNames.lookup('brand', 'USDT_axl');
    const instance1 = await E(E(agoricNamesAdmin).readonly()).lookup(
      'instance',
      'psm-IST-USDT_axl',
    );
    /** @type {ERef<import('../../src/psm/psm.js').PsmPublicFacet>} */
    const pf1 = E(zoe).getPublicFacet(instance1);

    const { value: contractMetrics } = await E(
      E(pf1).getMetrics(),
    ).getUpdateSince();
    t.deepEqual(contractMetrics.feePoolBalance, expected);

    // actually collect the fees and see how much we got
    const psmKit = await consume.psmKit;
    const { psmCreatorFacet } = psmKit.get(anchorBrand);
    const seat = E(zoe).offer(E(psmCreatorFacet).makeCollectFeesInvitation());
    const pmt = await E.get(E(seat).getPayouts()).Fee;
    const amt = await E(stableIssuer).getAmountOf(pmt);
    t.deepEqual(amt, { brand: stableBrand, value: expected.value });
  }
});
