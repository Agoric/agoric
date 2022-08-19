// @ts-check
import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import binaryVoteCounterBundle from '@agoric/governance/bundles/bundle-binaryVoteCounter.js';
import committeeBundle from '@agoric/governance/bundles/bundle-committee.js';
import contractGovernorBundle from '@agoric/governance/bundles/bundle-contractGovernor.js';
import { makeCopyBag, objectMap } from '@agoric/store';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import centralSupplyBundle from '@agoric/vats/bundles/bundle-centralSupply.js';
import mintHolderBundle from '@agoric/vats/bundles/bundle-mintHolder.js';
import {
  makeAgoricNamesAccess,
  makePromiseSpace,
} from '@agoric/vats/src/core/utils.js';
import { makeBoard } from '@agoric/vats/src/lib-board.js';
import { Stable } from '@agoric/vats/src/tokens.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { E, Far } from '@endo/far';
import { deeplyFulfilled } from '@endo/marshal';
import {
  startEconomicCommittee,
  startStakeFactory,
} from '../../src/proposals/econ-behaviors.js';
import { ManagerKW as KW } from '../../src/stakeFactory/constants.js';
import {
  makeVoterTool,
  mintRunPayment,
  makeMockChainStorageRoot,
  setUpZoeForTest,
  subscriptionKey,
} from '../supports.js';

// 8	Partial repayment from reward stream - TODO
// TODO: #4728 case 9: Extending LoC - unbonded (FAIL)

// skipping:
// 10	Partial repay - insufficient funds (FAIL) - Zoe prevents this
// 12	Add collateral - lots of test harness for little gain
// 13	Add collateral - CR increase ok

const contractRoots = {
  stakeFactory: './src/stakeFactory/stakeFactory.js',
  faker: './test/stakeFactory/attestationFaker.js',
};

const { entries } = Object;
const { details: X } = assert;

const SECONDS_PER_HOUR = 60n * 60n;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;

const micro = harden({
  unit: 1_000_000n,
  displayInfo: { decimalPlaces: 6 },
});

/**
 * @typedef {{
 *   zoe: ZoeService,
 *   feeMintAccess: FeeMintAccess,
 *   issuer: Record<'IST' | 'BLD', Issuer<'nat'>>,
 *   brand: Record<'IST' | 'BLD', Brand<'nat'>>,
 *   installation: {
 *     stakeFactory: Installation<typeof import('../../src/stakeFactory/stakeFactory.js').start>,
 *     faker: Installation,
 *     committee: Installation,
 *     contractGovernor: Installation,
 *     binaryVoteCounter: Installation,
 *     centralSupply: Installation,
 *   },
 * }} StakeFactoryTestContext
 */
/** @type {import('ava').TestFn<StakeFactoryTestContext>} */
const test = unknownTest;

test.before(async t => {
  // ava sets cwd to package root
  console.time('bundling');
  const bc = await unsafeMakeBundleCache('bundles/');
  const bundles = {
    stakeFactory: await bc.load(contractRoots.stakeFactory, 'stakeFactory'),
    faker: await bc.load(contractRoots.faker, 'faker'),
  };
  t.log(
    'bundled:',
    objectMap(bundles, b => b.endoZipBase64.length),
  );
  console.timeEnd('bundling');

  const { zoe, feeMintAccess } = await setUpZoeForTest(() => {});
  const bld = makeIssuerKit('BLD', AssetKind.NAT, micro.displayInfo);
  const issuer = {
    [Stable.symbol]: await E(zoe).getFeeIssuer(),
    BLD: bld.issuer,
  };
  const brand = {
    [Stable.symbol]: E(issuer.IST).getBrand(),
    BLD: bld.brand,
  };
  const govInstalls = {
    committee: E(zoe).install(committeeBundle),
    contractGovernor: E(zoe).install(contractGovernorBundle),
    binaryVoteCounter: E(zoe).install(binaryVoteCounterBundle),
  };
  const installation = {
    stakeFactory: E(zoe).install(bundles.stakeFactory),
    faker: E(zoe).install(bundles.faker),
    centralSupply: E(zoe).install(centralSupplyBundle),
    mintHolder: E(zoe).install(mintHolderBundle),
    ...govInstalls,
  };

  t.context = await deeplyFulfilled(
    harden({
      zoe,
      feeMintAccess,
      issuer,
      brand,
      installation,
    }),
  );
});

export const setupBootstrap = async (t, timer = buildManualTimer(t.log)) => {
  const { zoe, installation } = t.context;

  const space = /** @type {any} */ (makePromiseSpace(t.log));
  const { produce, consume } =
    /** @type { import('../../src/proposals/econ-behaviors.js').StakeFactoryBootstrapPowers } */ (
      space
    );

  produce.chainTimerService.resolve(timer);
  produce.zoe.resolve(zoe);

  const { agoricNames, spaces } = makeAgoricNamesAccess();
  produce.agoricNames.resolve(agoricNames);

  for (const contract of [
    'centralSupply',
    'contractGovernor',
    'committee',
    'binaryVoteCounter',
  ]) {
    spaces.installation.produce[contract].resolve(installation[contract]);
  }

  return { produce, consume, ...spaces };
};

const mockChain = genesisData => {
  let currentTime = 50n;

  /** @type {Map<string, bigint>} */
  const bankBalance = new Map();
  /** @type {Map<string, bigint>} */
  const liened = new Map();
  /** @type {Map<string, bigint>} */
  const bonded = new Map();
  /** @type {(addr: string, map: Map<string, bigint>) => bigint} */
  const qty = (addr, map) => map.get(addr) || 0n;

  const max = (x, y) => (x > y ? x : y);

  const it = Far('simulator', {
    send: (src, dest, n) => {
      assert.typeof(dest, 'string');
      assert.typeof(n, 'bigint');
      const b = (bankBalance.get(src) || 0n) - n;
      assert(b >= 0n);
      bankBalance.set(src, b);
      bankBalance.set(dest, (bankBalance.get(dest) || 0n) + n);
    },
    stake: (addr, ustake) => {
      bonded.set(addr, (bonded.get(addr) || 0n) + ustake);
    },
    slash: (addr, ustake) => {
      bonded.set(addr, max(0n, (bonded.get(addr) || 0n) - ustake));
    },
    /** @param {Brand<'nat'>} stakingBrand */
    makeLienBridge: stakingBrand => {
      /** @param {bigint} v */
      const ubld = v => AmountMath.make(stakingBrand, v);
      /** @type {(addr: string, delta: bigint) => Promise<Amount<'nat'>>} */
      const changeLiened = async (address, delta) => {
        const current = qty(address, liened);
        const value = current + delta;
        liened.set(address, value);
        return ubld(value);
      };

      /** @type {StakingAuthority} */
      const authority = Far('stakeReporter', {
        /**
         * @param {string} address
         * @param {Amount<'nat'>} increase
         */
        increaseLiened: (address, increase) => {
          const delta = AmountMath.getValue(stakingBrand, increase);
          return changeLiened(address, delta);
        },
        /**
         * @param {string} address
         * @param {Amount<'nat'>} decrease
         */
        decreaseLiened: (address, decrease) => {
          const delta = -1n * AmountMath.getValue(stakingBrand, decrease);
          return changeLiened(address, delta);
        },
        /**
         * @param {string} address
         * @param {Brand} brand
         */
        getAccountState: (address, brand) => {
          assert.equal(brand, stakingBrand, X`unexpected brand: ${brand}`);
          assert(bankBalance.has(address), X`no such account: ${address}`);

          currentTime += 10n;
          return harden({
            total: ubld(qty(address, bankBalance)),
            bonded: ubld(qty(address, bonded)),
            locked: ubld(0n),
            liened: ubld(qty(address, liened)),
            unbonding: ubld(0n),
            currentTime: (currentTime += 3n),
          });
        },
      });
      return authority;
    },
    provisionAccount: (name, src) => {
      return harden({
        getName: () => name,
        getAddress: () => src,
        sendTo: (dest, n) => it.send(src, dest, n),
        stake: n => it.stake(src, n),
      });
    },
  });

  entries(genesisData).forEach(([addr, value]) => bankBalance.set(addr, value));
  return it;
};

const bootstrapStakeFactory = async (t, timer) => {
  const { feeMintAccess, brand, issuer, installation } = t.context;

  const chain = mockChain({ addr1a: 1_000_000_000n * micro.unit });
  const lienBridge = chain.makeLienBridge(brand.BLD);

  const space = await setupBootstrap(t, timer);
  const { produce, brand: brandS, issuer: issuerS } = space;
  produce.feeMintAccess.resolve(feeMintAccess);
  produce.lienBridge.resolve(lienBridge);
  produce.chainTimerService.resolve(timer);
  brandS.produce.BLD.resolve(brand.BLD);
  brandS.produce.IST.resolve(brand.IST);
  issuerS.produce.BLD.resolve(issuer.BLD);
  issuerS.produce.IST.resolve(issuer.IST);
  space.installation.produce.stakeFactory.resolve(installation.stakeFactory);

  const mockClient = harden({
    assignBundle: _fns => {
      // t.log('assignBundle:', fns);
    },
  });
  produce.client.resolve(mockClient);

  produce.chainStorage.resolve(makeMockChainStorageRoot());
  produce.board.resolve(makeBoard());

  await Promise.all([
    startEconomicCommittee(space, {
      options: {
        econCommitteeOptions: {
          committeeName: 'Me, myself, and I',
          committeeSize: 1,
        },
      },
    }),
    startStakeFactory(space),
  ]);
  return { chain, space };
};

const makeWalletMaker = creatorFacet => {
  const makeWallet = src => {
    const attMaker = E(creatorFacet).provideAttestationMaker(src);
    return harden({ attMaker });
  };
  return makeWallet;
};

test('wrap liened amount', async t => {
  const timer = buildManualTimer(t.log, 0n, 1n);

  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume, instance } = space;
  const { zoe, stakeFactoryCreatorFacet: creatorFacet } = consume;
  const { stakeFactory: stakeFactoryinstance } = instance.consume;
  const walletMaker = makeWalletMaker(creatorFacet);
  const bob = chain.provisionAccount('Bob', 'addr1b');

  // Bob introduces himself to the Agoric JS VM.
  const bobWallet = walletMaker(bob.getAddress());

  const {
    brands: { [KW.Attestation]: attBrand },
  } = await E(zoe).getTerms(await stakeFactoryinstance);

  const bldBrand = await space.brand.consume.BLD;
  const bldValue = 2_000n * micro.unit;
  const bldAmount = AmountMath.make(bldBrand, bldValue);
  const attAmount = await E(bobWallet.attMaker).wrapLienedAmount(bldAmount);

  t.deepEqual(
    attAmount,
    AmountMath.make(attBrand, makeCopyBag([['addr1b', bldValue]])),
  );
});

test('unwrap liened amount', async t => {
  const timer = buildManualTimer(t.log, 0n, 1n);

  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume, instance } = space;
  const { zoe, stakeFactoryCreatorFacet: creatorFacet } = consume;
  const { stakeFactory: stakeFactoryinstance } = instance.consume;
  const walletMaker = makeWalletMaker(creatorFacet);
  const bob = chain.provisionAccount('Bob', 'addr1b');

  // Bob introduces himself to the Agoric JS VM.
  const bobWallet = walletMaker(bob.getAddress());

  const {
    brands: { [KW.Attestation]: attBrand },
  } = await E(zoe).getTerms(await stakeFactoryinstance);

  const bldBrand = await space.brand.consume.BLD;
  const bldValue = 2_000n * micro.unit;
  const bldAmount = AmountMath.make(bldBrand, bldValue);

  const lienedAmount = AmountMath.make(
    attBrand,
    makeCopyBag([['addr1b', bldValue]]),
  );

  const unwrapped = await E(bobWallet.attMaker).unwrapLienedAmount(
    lienedAmount,
  );

  t.deepEqual(unwrapped, bldAmount);
});

test('stakeFactory API usage', async t => {
  const timer = buildManualTimer(t.log, 0n, 1n);

  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume } = space;
  const { zoe, stakeFactoryCreatorFacet: creatorFacet } = consume;
  const runBrand = await space.brand.consume.IST;
  const bldBrand = await space.brand.consume.BLD;
  const runIssuer = await space.issuer.consume.IST;
  const publicFacet = E(zoe).getPublicFacet(
    space.instance.consume.stakeFactory,
  );

  const founder = chain.provisionAccount('Alice', 'addr1a');
  const bob = chain.provisionAccount('Bob', 'addr1b');
  founder.sendTo('addr1b', 5_000n * micro.unit);
  bob.stake(3_000n * micro.unit);

  const walletMaker = makeWalletMaker(creatorFacet);

  // Bob introduces himself to the Agoric JS VM.
  const bobWallet = walletMaker(bob.getAddress());

  // Bob gets a lien against 2k of his 3k staked BLD.
  const bobToLien = AmountMath.make(bldBrand, 2_000n * micro.unit);
  const attPmt = E(bobWallet.attMaker).makeAttestation(bobToLien);
  const stakeFactoryTerms = await E(zoe).getTerms(
    await space.instance.consume.stakeFactory,
  );
  const {
    issuers: { [KW.Attestation]: attIssuer },
  } = stakeFactoryTerms;
  const attAmt = await E(attIssuer).getAmountOf(attPmt);

  // Bob borrows 200 RUN against the lien.
  const proposal = harden({
    give: { [KW.Attestation]: attAmt },
    want: { [KW.Debt]: AmountMath.make(runBrand, 200n * micro.unit) },
  });
  const seat = E(zoe).offer(
    E(publicFacet).makeLoanInvitation(),
    proposal,
    harden({ [KW.Attestation]: attPmt }),
  );
  const runPmt = E(seat).getPayout(KW.Debt);
  const actual = await E(runIssuer).getAmountOf(runPmt);
  t.deepEqual(actual, proposal.want[KW.Debt]);
});

test('extra offer keywords are rejected', async t => {
  const timer = buildManualTimer(t.log, 0n, SECONDS_PER_DAY);

  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume } = space;
  const { zoe, stakeFactoryCreatorFacet: creatorFacet } = consume;
  const runBrand = await space.brand.consume.IST;
  const bldBrand = await space.brand.consume.BLD;
  const publicFacet = E(zoe).getPublicFacet(
    space.instance.consume.stakeFactory,
  );

  const founder = chain.provisionAccount('Alice', 'addr1a');
  const bob = chain.provisionAccount('Bob', 'addr1b');
  founder.sendTo('addr1b', 5_000n * micro.unit);
  bob.stake(3_000n * micro.unit);

  const walletMaker = makeWalletMaker(creatorFacet);

  // Bob introduces himself to the Agoric JS VM.
  const bobWallet = walletMaker(bob.getAddress());

  // Bob gets a lien against 2k of his 3k staked BLD.
  const bobToLien = AmountMath.make(bldBrand, 2_000n * micro.unit);
  const attPmt = E(bobWallet.attMaker).makeAttestation(bobToLien);
  const {
    issuers: { [KW.Attestation]: attIssuer },
  } = await E(zoe).getTerms(await space.instance.consume.stakeFactory);
  const attAmt = await E(attIssuer).getAmountOf(attPmt);

  // Bob borrows 200 RUN against the lien.
  const proposal = harden({
    give: { [KW.Attestation]: attAmt },
    want: {
      [KW.Debt]: AmountMath.make(runBrand, 199n * micro.unit),
      Pony: AmountMath.make(runBrand, 1n * micro.unit),
    },
  });
  const seat = E(zoe).offer(
    E(publicFacet).makeLoanInvitation(),
    proposal,
    harden({ [KW.Attestation]: attPmt }),
  );
  await t.throwsAsync(E(seat).getOfferResult(), {
    message: /Pony.*did not match/,
  });
});

/**
 * @param {StartFaker['publicFacet']} faker
 * @param {Brand} bldBrand
 * @returns {Promise<[Amount, Payment]>}
 *
 * @param { (faker: ERef<StartFaker['publicFacet']>, bldBrand: Brand)
 *            => Promise<[Amount, Payment]> } [mockAttestation]
 *
 * @typedef {ReturnType<typeof import('./attestationFaker.js').start>} StartFaker
 * @typedef { [bigint, bigint] } Rational
 */
test('forged Attestation fails', async t => {
  const timer = buildManualTimer(t.log, 0n, 1n);

  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume } = space;
  const { zoe } = consume;
  const runBrand = await space.brand.consume.IST;
  const bldBrand = await space.brand.consume.BLD;
  const publicFacet = E(zoe).getPublicFacet(
    space.instance.consume.stakeFactory,
  );

  const {
    installation: { faker: fakerInstallation },
  } = t.context;
  const faker = E.get(E(zoe).startInstance(fakerInstallation)).publicFacet;

  const founder = chain.provisionAccount('Alice', 'addr1a');
  const mallory = chain.provisionAccount('Mallory', 'addr1m');
  founder.sendTo('addr1m', 5_000n * micro.unit);
  mallory.stake(3_000n * micro.unit);

  // Mallory forges a lien against 2k of his 3k staked BLD.
  const malloryToLien = AmountMath.make(bldBrand, 2_000n * micro.unit);
  const attPmt = E(faker).fakeAttestation('addr1m', malloryToLien);

  const attIssuer = E(faker).getIssuer();
  const attAmt = await E(attIssuer).getAmountOf(attPmt);

  // Mallory tries to borrow 200 RUN against the forged lien.
  const proposal = harden({
    give: { [KW.Attestation]: attAmt },
    want: { [KW.Debt]: AmountMath.make(runBrand, 200n * micro.unit) },
  });
  const seat = E(zoe).offer(
    E(publicFacet).makeLoanInvitation(),
    proposal,
    harden({ [KW.Attestation]: attPmt }),
  );
  await t.throwsAsync(E(seat).getOfferResult());
});

const approxEqual = (t, actual, expected, epsilon) => {
  const { min, max, subtract, isGTE } = AmountMath;
  if (isGTE(epsilon, subtract(max(actual, expected), min(actual, expected)))) {
    t.pass();
  } else {
    t.deepEqual(actual, expected);
  }
};

const makeWorld = async t => {
  const timer = buildManualTimer(t.log, 0n, SECONDS_PER_DAY);
  const { chain, space } = await bootstrapStakeFactory(t, timer);
  const { consume } = space;

  const { zoe, stakeFactoryCreatorFacet, lienBridge } = consume;
  const { IST: runIssuer } = space.issuer.consume;
  const [bldBrand, runBrand] = await Promise.all([
    space.brand.consume.BLD,
    space.brand.consume.IST,
  ]);
  const { stakeFactory: stakeFactoryinstance } = space.instance.consume;
  const stakeFactory = {
    instance: stakeFactoryinstance,
    publicFacet: E(zoe).getPublicFacet(stakeFactoryinstance),
    creatorFacet: stakeFactoryCreatorFacet,
  };

  const counter = await space.installation.consume.binaryVoteCounter;
  const committee = makeVoterTool(
    zoe,
    space.consume.economicCommitteeCreatorFacet,
    // @ts-expect-error TODO: add stakeFactoryGovernorCreatorFacet to vats/src/types.js
    space.consume.stakeFactoryGovernorCreatorFacet,
    counter,
  );

  const {
    issuers: { [KW.Attestation]: attIssuer },
    brands: { [KW.Attestation]: attBrand },
  } = await E(zoe).getTerms(await stakeFactory.instance);

  /** @param {Payment} att */
  const returnAttestation = async att => {
    const invitation = E(stakeFactory.publicFacet).makeReturnAttInvitation();
    const attestationAmount = await E(attIssuer).getAmountOf(att);
    const proposal = harden({ give: { [KW.Attestation]: attestationAmount } });
    const payments = harden({ [KW.Attestation]: att });
    const userSeat = E(zoe).offer(invitation, proposal, payments);
    return E(userSeat).getOfferResult();
  };

  const founder = chain.provisionAccount('founder', 'addr1a');
  const bob = chain.provisionAccount('Bob', 'addr1b');

  const walletMaker = makeWalletMaker(stakeFactory.creatorFacet);

  // Bob introduces himself to the Agoric JS VM.
  const bobWallet = walletMaker(bob.getAddress());

  const attPurse = E(attIssuer).makeEmptyPurse();
  const runPurse = E(runIssuer).makeEmptyPurse();
  const rewardPurse = E(runIssuer).makeEmptyPurse();
  const epsilon = AmountMath.make(runBrand, micro.unit / 5n);

  await E(rewardPurse).deposit(
    await mintRunPayment(500n * micro.unit, {
      centralSupply: E(zoe).install(centralSupplyBundle),
      feeMintAccess: consume.feeMintAccess,
      zoe,
    }),
  );

  let offerResult;
  const driver = harden({
    buyBLD: n => founder.sendTo(bob.getAddress(), n * micro.unit),
    stakeBLD: n => bob.stake(n * micro.unit),
    slash: n => chain.slash(bob.getAddress(), n * micro.unit),
    // FIXME test result relies on awaiting each tick
    // timer.tickN() awaits only the last tick
    waitDays: async n => {
      for (let i = 0; i < n; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await timer.tick();
      }
    },
    lienBLD: async target => {
      const current = await E(bobWallet.attMaker).getAccountState(
        bob.getAddress(),
        bldBrand,
      );
      const delta = AmountMath.subtract(
        AmountMath.make(bldBrand, target * micro.unit),
        current.liened,
      );
      const attPmt = await E(bobWallet.attMaker).makeAttestation(delta);
      await E(attPurse).deposit(attPmt);
    },
    checkBLDStaked: async expected => {
      const actual = await E(lienBridge).getAccountState(
        bob.getAddress(),
        bldBrand,
      );
      t.deepEqual(
        actual.bonded,
        AmountMath.make(bldBrand, expected * micro.unit),
      );
    },
    checkBLDLiened: async expected => {
      const actual = await E(lienBridge).getAccountState(
        bob.getAddress(),
        bldBrand,
      );
      t.deepEqual(
        actual.liened,
        AmountMath.make(bldBrand, expected * micro.unit),
      );
    },
    borrowRUN: async n => {
      const attAmt = await E(attPurse).getCurrentAmount();
      const attPmt = await E(attPurse).withdraw(attAmt);
      const proposal = harden({
        give: { [KW.Attestation]: attAmt },
        want: { [KW.Debt]: AmountMath.make(runBrand, n * micro.unit) },
      });
      const seat = E(zoe).offer(
        E(stakeFactory.publicFacet).makeLoanInvitation(),
        proposal,
        harden({ [KW.Attestation]: attPmt }),
      );
      const runPmt = await E(seat).getPayout(KW.Debt);
      await E(runPurse).deposit(runPmt);
      offerResult = await E(seat).getOfferResult();
    },
    earnRUNReward: async n => {
      const amt = AmountMath.make(runBrand, n * micro.unit);
      const pmt = await E(rewardPurse).withdraw(amt);
      await E(runPurse).deposit(pmt);
    },
    borrowMoreRUN: async n => {
      assert(offerResult, 'no offerResult; borrowRUN first?');
      const runAmt = AmountMath.make(runBrand, n * micro.unit);
      const attAmt = await E(attPurse).getCurrentAmount();
      const attPmt = await E(attPurse).withdraw(attAmt);
      const proposal = harden({
        give: { [KW.Attestation]: attAmt },
        want: { [KW.Debt]: runAmt },
      });
      const seat = E(zoe).offer(
        E(offerResult.invitationMakers).AdjustBalances(),
        proposal,
        harden({ [KW.Attestation]: attPmt }),
      );
      await E(seat).getOfferResult(); // check for errors
      const runPmt = await E(seat).getPayout(KW.Debt);
      await E(runPurse).deposit(runPmt);
    },
    unlienBLD: async n => {
      assert(offerResult, 'no offerResult; borrowRUN first?');
      const attAmt = AmountMath.make(
        attBrand,
        makeCopyBag([[bob.getAddress(), n * micro.unit]]),
      );
      const proposal = harden({
        want: { [KW.Attestation]: attAmt },
      });
      const seat = E(zoe).offer(
        E(offerResult.invitationMakers).AdjustBalances(),
        proposal,
      );
      await E(seat).getOfferResult(); // check for errors
      const attBack = await E(seat).getPayout(KW.Attestation);
      await returnAttestation(attBack);
    },
    payDownRUN: async value => {
      assert(offerResult, 'no offerResult; borrowRUN first?');
      const runAmt = AmountMath.make(runBrand, value * micro.unit);
      const runPmt = await E(runPurse).withdraw(runAmt);
      const proposal = harden({
        give: { [KW.Debt]: runAmt },
      });
      const seat = E(zoe).offer(
        E(offerResult.invitationMakers).AdjustBalances(),
        proposal,
        harden({ [KW.Debt]: runPmt }),
      );
      await E(seat).getOfferResult(); // check for errors
    },
    payToUnlien: async ([pay, unlien]) => {
      assert(offerResult, 'no offerResult; borrowRUN first?');
      const proposal = harden({
        give: { [KW.Debt]: AmountMath.make(runBrand, pay * micro.unit) },
        want: {
          [KW.Attestation]: AmountMath.make(
            attBrand,
            makeCopyBag([[bob.getAddress(), unlien * micro.unit]]),
          ),
        },
      });
      const runPmt = await E(runPurse).withdraw(proposal.give[KW.Debt]);
      const seat = E(zoe).offer(
        E(offerResult.invitationMakers).AdjustBalances(),
        proposal,
        harden({ [KW.Debt]: runPmt }),
      );
      await E(seat).getOfferResult(); // check for errors
      const attBack = await E(seat).getPayout(KW.Attestation);
      await returnAttestation(attBack);
    },
    payoffRUN: async value => {
      assert(offerResult, 'no offerResult; borrowRUN first?');
      const proposal = harden({
        give: { [KW.Debt]: AmountMath.make(runBrand, value * micro.unit) },
        want: {
          // TODO: want amount should match amount liened
          [KW.Attestation]: AmountMath.makeEmpty(attBrand, AssetKind.COPY_BAG),
        },
      });
      const runPayment = await E(runPurse).withdraw(proposal.give[KW.Debt]);
      const seat = await E(zoe).offer(
        E(offerResult.invitationMakers).CloseVault(),
        proposal,
        harden({ [KW.Debt]: runPayment }),
      );
      await E(seat).getOfferResult(); // 'RUN line of credit closed'
      const attBack = await E(seat).getPayout(KW.Attestation);
      const runPmt = await E(seat).getPayout(KW.Debt);
      await returnAttestation(attBack);
      await E(runPurse).deposit(runPmt);
    },
    checkRUNBalance: async target => {
      const actual = await E(runPurse).getCurrentAmount();
      approxEqual(
        t,
        actual,
        AmountMath.make(runBrand, target * micro.unit),
        epsilon,
      );
    },
    checkRUNDebt: async expected => {
      const { vault } = offerResult;
      const debt = await E(vault).getCurrentDebt();
      approxEqual(
        t,
        debt,
        AmountMath.make(runBrand, expected * micro.unit),
        epsilon,
      );
    },
    setMintingRatio: async newRunToBld => {
      /** @type {(r: Rational, b?: Brand) => Ratio} */
      const pairToRatio = ([n, d], brand2 = undefined) =>
        makeRatio(n, runBrand, d, brand2);
      const newValue = pairToRatio(newRunToBld, bldBrand);

      const deadline = 3n * SECONDS_PER_DAY;
      const { cast, outcome } = await E(committee).changeParam(
        harden({
          paramPath: { key: 'governedParams' },
          changes: { MintingRatio: newValue },
        }),
        deadline,
      );
      await cast;
      await E(timer).tick();
      await E(timer).tick();
      await E(timer).tick();
      await outcome;
    },
  });

  return driver;
};

test('borrowing past the debt limit', async t => {
  const driver = await makeWorld(t);

  // provide ample BLD
  await driver.buyBLD(100_000_000n);
  await driver.stakeBLD(100_000_000n);
  await driver.lienBLD(100_000_000n);

  // XXX assumes debt limit of 1_000_000_000_000n
  const threshold = 1_000_000_000_000n / micro.unit;

  await t.throwsAsync(driver.borrowRUN(threshold), {
    message:
      // XXX brittle string to fail if numeric parameters change
      'Minting {"brand":"[Alleged: IST brand]","value":"[1020000000000n]"} past {"brand":"[Alleged: IST brand]","value":"[0n]"} would hit total debt limit {"brand":"[Alleged: IST brand]","value":"[1000000000000n]"}',
  });
});

test('Borrow, pay off', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await d.stakeBLD(80000n);
  await d.lienBLD(8000n);
  await d.borrowRUN(1000n);
  await d.checkRUNBalance(1000n);
  await d.earnRUNReward(25n);
  await d.payoffRUN(1020n);
  await d.checkRUNDebt(0n);
  await d.checkBLDLiened(0n);
  await d.checkRUNBalance(5n);
});

test('Starting LoC', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(9000n);
  await d.stakeBLD(9000n);
  await d.checkBLDLiened(0n);
  await d.checkRUNBalance(0n);
  await d.lienBLD(6000n);
  await d.borrowRUN(100n);
  await d.checkRUNDebt(102n);
  await d.checkBLDLiened(6000n);
  await d.checkRUNBalance(100n);
  await d.borrowMoreRUN(100n);
  await d.checkRUNBalance(200n);
  await d.checkRUNDebt(204n);
  await d.checkBLDLiened(6000n);
  await d.stakeBLD(5000n);
  await d.lienBLD(8000n);
  await d.checkBLDLiened(8000n);
  await d.borrowMoreRUN(1400n);
  await d.checkRUNDebt(1632n);
  await d.borrowMoreRUN(0n);
});

test('Extending LoC - CR increases (FAIL)', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await d.stakeBLD(80000n);
  await d.lienBLD(8000n);
  await d.borrowRUN(1000n);
  await d.setMintingRatio([16n, 100n]);
  await t.throwsAsync(async () => d.borrowMoreRUN(500n));
  await d.checkRUNBalance(1000n);
  await d.checkBLDLiened(8000n);
  await d.earnRUNReward(25n);
  await d.payoffRUN(1021n);
  await d.checkRUNDebt(0n);
  await d.checkBLDLiened(0n);
});

test('test borrow zero', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await d.stakeBLD(80000n);
  await d.lienBLD(8000n);
  await t.throwsAsync(async () => d.borrowRUN(0n));
});

test('test zero amounts', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await d.stakeBLD(80000n);
  await d.lienBLD(8000n);
  await t.throwsAsync(async () => d.borrowRUN(0n));
});

test('test payoff zero', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await d.stakeBLD(80000n);
  await d.lienBLD(8000n);
  await d.borrowRUN(200n);
  await t.throwsAsync(async () => d.payoffRUN(200n));
});

test('test no Lien', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(10000n);
  await d.stakeBLD(80000n);
  await t.throwsAsync(async () => d.lienBLD(0n));
});

test('test no Stake', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(80000n);
  await t.throwsAsync(async () => d.lienBLD(8000n));
});

test('Partial repayment - CR remains the same', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(10000n);
  await d.stakeBLD(10000n);
  await d.lienBLD(10000n);
  await d.borrowRUN(1000n);
  await d.payDownRUN(50n);
  await d.checkRUNBalance(950n);
  await d.checkRUNDebt(970n);
});

test('Partial repayment - CR increases*', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(10000n);
  await d.stakeBLD(10000n);
  await d.lienBLD(400n);
  await d.borrowRUN(100n);
  await d.setMintingRatio([16n, 100n]);
  await d.payDownRUN(5n);
  await d.checkRUNBalance(95n);
  await d.checkBLDLiened(400n);
});

test('Partial repay - unbonded ok', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(800n);
  await d.lienBLD(800n);
  await d.borrowRUN(100n);
  await d.slash(700n);
  await d.checkBLDLiened(800n);
  await d.checkRUNBalance(100n);
  await d.payDownRUN(50n);
  await d.checkRUNBalance(50n);
  await d.checkBLDLiened(800n);
  await d.checkBLDStaked(100n);
});

test('Add collateral - more BLD required (FAIL)', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(100n);
  await t.throwsAsync(async () => d.borrowMoreRUN(200n));
  await d.checkRUNBalance(100n);
  await d.checkBLDLiened(800n);
});

test('Lower collateral', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(100n);
  await d.unlienBLD(350n);
  await d.checkRUNBalance(100n);
  await d.checkBLDLiened(450n);
});

test('Lower collateral - CR increase (FAIL)', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(100n);
  await d.setMintingRatio([16n, 100n]);
  await t.throwsAsync(async () => d.unlienBLD(400n));
  await d.checkBLDLiened(800n);
});

test('Lower collateral - unbonded ok', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.earnRUNReward(5n);
  await d.lienBLD(800n);
  await d.borrowRUN(100n);
  await d.slash(770n);
  await d.checkBLDLiened(800n);
  await d.unlienBLD(375n);
  await d.checkRUNBalance(105n);
  await d.checkBLDLiened(425n);
  await d.setMintingRatio([16n, 100n]);
  await d.payoffRUN(103n);
  await d.checkRUNBalance(3n);
  await d.checkBLDLiened(0n);
});

test('Lower collateral by paying off DEBT', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(190n);
  await d.payToUnlien([100n, 300n]);
  await d.checkBLDLiened(500n);
});

test('Watch interest accrue', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(190n);
  await d.checkRUNDebt(194n);
  await d.waitDays(90);
  await d.checkRUNDebt(195n);
});

test('payoff more than you owe', async t => {
  const d = await makeWorld(t);
  await d.buyBLD(1000n);
  await d.stakeBLD(1000n);
  await d.lienBLD(800n);
  await d.borrowRUN(190n);
  await d.checkRUNDebt(194n);
  await d.earnRUNReward(20n);
  await d.payoffRUN(200n);
  await d.checkRUNDebt(0n);
  await d.checkBLDLiened(0n);
  await d.checkRUNBalance(16n);
});

test('storage keys', async t => {
  const {
    space: { consume, instance },
  } = await bootstrapStakeFactory(t);
  const { zoe } = consume;
  const publicFacet = await E(zoe).getPublicFacet(
    instance.consume.stakeFactory,
  );

  t.is(
    await subscriptionKey(E(publicFacet).getSubscription()),
    'mockChainStorageRoot.stakeFactory.governance',
  );
});
