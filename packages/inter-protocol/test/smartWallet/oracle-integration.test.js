import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { NonNullish, zip } from '@agoric/internal';
import { AssetKind, makeIssuerKit } from '@agoric/ertp';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { coalesceUpdates } from '@agoric/smart-wallet/src/utils.js';
import { TimeMath } from '@agoric/time';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/far';
import { oracleBrandFeedName } from '../../src/proposals/utils.js';
import { INVITATION_MAKERS_DESC as EC_INVITATION_MAKERS_DESC } from '../../src/econCommitteeCharter.js';
import { INVITATION_MAKERS_DESC as ORACLE_INVITATION_MAKERS_DESC } from '../../src/price/fluxAggregatorKit.js';
import { headValue } from '../supports.js';
import { buildRootObject } from './boot-psm.js';
import {
  currentPurseBalance,
  importBootTestUtils,
  makeDefaultTestContext,
  voteForOpenQuestion,
} from './contexts.js';

/** @import {ZoeManualTimer} from '@agoric/zoe/tools/manualTimer.js'; */

/**
 * @typedef {Awaited<ReturnType<typeof makeDefaultTestContext>> & {
 *   consume: import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers['consume'];
 * }} TestContext
 */
/** @type {import('ava').TestFn<TestContext>} */
const test = anyTest;

const committeeAddress = 'econCommitteeMemberA';

const makeTestSpace = async (log, bundleCache) => {
  const { mockDProxy, mockPsmBootstrapArgs } = await importBootTestUtils(
    log,
    bundleCache,
  );

  const psmParams = {
    anchorAssets: [{ denom: 'ibc/toyusdc', keyword: 'AUSD' }],
    economicCommitteeAddresses: {
      aMember: committeeAddress,
    },
    argv: { bootMsg: {} },
  };

  const psmVatRoot = await buildRootObject(
    {
      logger: log,
      D: mockDProxy,
    },
    psmParams,
  );
  void psmVatRoot.bootstrap(...mockPsmBootstrapArgs());

  // TODO mimic the proposals and manifest of price-feed-proposal and price-feed-core
  // calling ensureOracleBrands and createPriceFeed
  // ensuring a feed for ATOM-USD

  /** @type {ChainBootstrapSpace & NamedVatPowers} */
  // @ts-expect-error cast
  const space = psmVatRoot.getPromiseSpace();
  await eventLoopIteration();

  const timer = buildZoeManualTimer(log);
  space.produce.chainTimerService.resolve(timer);

  /** @type {import('@agoric/inter-protocol/src/proposals/price-feed-proposal.js').PriceFeedOptions} */
  const priceFeedOptions = {
    IN_BRAND_NAME: 'ATOM',
    IN_BRAND_DECIMALS: '6',
    OUT_BRAND_NAME: 'USD',
    OUT_BRAND_DECIMALS: '6',
  };
  /**
   * @param {string} name
   * @param {number | string} decimals
   */
  const ensureOracleBrand = (name, decimals) => {
    const { brand } = makeIssuerKit(name, AssetKind.NAT, {
      decimalPlaces: Number(decimals),
    });
    // @ts-expect-error XXX space lacks oracleBrand
    space.oracleBrand.produce[name].resolve(brand);
  };
  ensureOracleBrand(
    priceFeedOptions.IN_BRAND_NAME,
    priceFeedOptions.IN_BRAND_DECIMALS,
  );
  ensureOracleBrand(
    priceFeedOptions.OUT_BRAND_NAME,
    priceFeedOptions.OUT_BRAND_DECIMALS,
  );

  await eventLoopIteration();

  return space;
};

test.before(async t => {
  // @ts-expect-error cast
  t.context = await makeDefaultTestContext(t, makeTestSpace);
});

/**
 * @param {import('ava').ExecutionContext<TestContext>} t
 * @param {string[]} oracleAddresses
 */
const setupFeedWithWallets = async (t, oracleAddresses) => {
  const { agoricNames } = t.context.consume;

  const wallets = await Promise.all(
    oracleAddresses.map(async addr => t.context.simpleProvideWallet(addr)),
  );

  const oracleWallets = Object.fromEntries(zip(oracleAddresses, wallets));

  await t.context.simpleCreatePriceFeed(oracleAddresses, 'ATOM', 'USD');

  /**
   * @type {import('@agoric/zoe/src/zoeService/utils.js').Instance<
   *   import('@agoric/inter-protocol/src/price/fluxAggregatorContract.js').start
   * >}
   */
  const governedPriceAggregator = await E(agoricNames).lookup(
    'instance',
    oracleBrandFeedName('ATOM', 'USD'),
  );

  return { oracleWallets, governedPriceAggregator };
};

let acceptInvitationCounter = 0;
const acceptInvitation = async (wallet, priceAggregator) => {
  acceptInvitationCounter += 1;
  const id = `acceptInvitation${acceptInvitationCounter}`;
  /** @type {import('@agoric/smart-wallet/src/invitations.js').PurseInvitationSpec} */
  const getInvMakersSpec = {
    source: 'purse',
    instance: priceAggregator,
    description: ORACLE_INVITATION_MAKERS_DESC,
  };
  await wallet.getOffersFacet().executeOffer({
    id,
    invitationSpec: getInvMakersSpec,
    proposal: {},
  });
  // wait for it to settle
  await eventLoopIteration();
  return id;
};

let pushPriceCounter = 0;
/**
 * @param {import('@agoric/smart-wallet/src/smartWallet.js').SmartWallet} wallet
 * @param {string} adminOfferId
 * @param {import('@agoric/inter-protocol/src/price/roundsManager.js').PriceRound} priceRound
 * @returns {Promise<string>} offer id
 */
const pushPrice = async (wallet, adminOfferId, priceRound) => {
  /** @type {import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec} */
  const proposeInvitationSpec = {
    source: 'continuing',
    previousOffer: adminOfferId,
    invitationMakerName: 'PushPrice',
    invitationArgs: harden([priceRound]),
  };

  pushPriceCounter += 1;
  const id = `pushPrice${pushPriceCounter}`;
  await wallet.getOffersFacet().executeOffer({
    id,
    invitationSpec: proposeInvitationSpec,
    proposal: {},
  });
  await eventLoopIteration();
  return id;
};

// The tests are serial because they mutate shared state

test.serial('invitations', async t => {
  const operatorAddress = 'agoric1invitationTest';
  const wallet = await t.context.simpleProvideWallet(operatorAddress);
  const computedState = coalesceUpdates(E(wallet).getUpdatesSubscriber());

  // this returns wallets, but we need the updates subscriber to start before the price feed starts
  // so we provision the wallet earlier above
  const { governedPriceAggregator } = await setupFeedWithWallets(t, [
    operatorAddress,
  ]);

  /**
   * get invitation details the way a user would
   *
   * @param {string} desc
   * @param {number} len
   * @param {any} balances XXX please improve this
   * @returns {Promise<[{ description: string; instance: Instance }]>}
   */
  const getInvitationFor = async (desc, len, balances) => {
    await eventLoopIteration();
    /** @type {Amount<'set'>} */
    const invitationsAmount = NonNullish(
      balances.get(t.context.invitationBrand),
    );
    t.is(invitationsAmount?.value.length, len);
    // @ts-expect-error TS can't tell that it's going to satisfy the @returns.
    return invitationsAmount.value.filter(i => i.description === desc);
  };

  const proposeInvitationDetails = await getInvitationFor(
    ORACLE_INVITATION_MAKERS_DESC,
    1,
    computedState.balances,
  );

  t.is(proposeInvitationDetails[0].description, ORACLE_INVITATION_MAKERS_DESC);
  t.is(
    proposeInvitationDetails[0].instance,
    governedPriceAggregator,
    'priceAggregator',
  );

  // The purse has the invitation to get the makers

  /** @type {import('@agoric/smart-wallet/src/invitations.js').PurseInvitationSpec} */
  const getInvMakersSpec = {
    source: 'purse',
    instance: governedPriceAggregator,
    description: ORACLE_INVITATION_MAKERS_DESC,
  };

  const id = '33';
  await wallet.getOffersFacet().executeOffer({
    id,
    invitationSpec: getInvMakersSpec,
    proposal: {},
  });

  const currentSub = E(wallet).getCurrentSubscriber();
  /** @type {import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord} */
  const currentState = await headValue(currentSub);
  t.deepEqual(
    currentState.offerToUsedInvitation.map(([k, _]) => k),
    [id],
  );
  const usedInvitations = new Map(currentState.offerToUsedInvitation);
  t.is(
    usedInvitations.get(id)?.value[0].description,
    ORACLE_INVITATION_MAKERS_DESC,
  );
});

test.serial('admin price', async t => {
  const operatorAddress = 'adminPriceAddress';
  const { zoe } = t.context.consume;

  const { oracleWallets, governedPriceAggregator } = await setupFeedWithWallets(
    t,
    [operatorAddress],
  );
  const wallet = oracleWallets[operatorAddress];
  await eventLoopIteration();
  const adminOfferId = await acceptInvitation(wallet, governedPriceAggregator);

  // Push a new price result /////////////////////////

  /** @type {import('@agoric/inter-protocol/src/price/roundsManager.js').PriceRound} */
  const result = { roundId: 1, unitPrice: 123n };

  await pushPrice(wallet, adminOfferId, result);

  // Verify price result

  const manualTimer = /** @type {Promise<ZoeManualTimer>} */ (
    t.context.consume.chainTimerService
  );
  const timerBrand = await E(manualTimer).getTimerBrand();
  const toTS = val => TimeMath.coerceTimestampRecord(val, timerBrand);
  // trigger an aggregation (POLL_INTERVAL=1n in context)
  // Can only get out of round 1 after more than roundTimeoutDuration (10s)
  await E(manualTimer).tickN(12);

  const result2 = { roundId: 2, unitPrice: 123n };
  await pushPrice(wallet, adminOfferId, result2);
  await E(manualTimer).tickN(1);

  const paPublicFacet = E(zoe).getPublicFacet(governedPriceAggregator);

  const publicTopics = await E(paPublicFacet).getPublicTopics();
  const latestRoundSubscriber = publicTopics.latestRound.subscriber;

  t.deepEqual((await latestRoundSubscriber.subscribeAfter()).head.value, {
    roundId: 2n,
    startedAt: toTS(12n),
    startedBy: 'adminPriceAddress',
  });
});

test.serial('errors', async t => {
  const operatorAddress = 'badInputsAddress';

  const { oracleWallets, governedPriceAggregator: priceAggregator } =
    await setupFeedWithWallets(t, [operatorAddress]);
  const wallet = oracleWallets[operatorAddress];
  await eventLoopIteration();
  const adminOfferId = await acceptInvitation(wallet, priceAggregator);

  // TODO move to smart-wallet package when it has sufficient test supports
  acceptInvitationCounter -= 1; // try again with same id
  await t.throwsAsync(acceptInvitation(wallet, priceAggregator), {
    message: `cannot re-use offer id "acceptInvitation${acceptInvitationCounter}"`,
  });

  const computedState = coalesceUpdates(E(wallet).getUpdatesSubscriber());

  const walletPushPrice = async priceRound => {
    const offerId = await pushPrice(wallet, adminOfferId, priceRound);
    return computedState.offerStatuses.get(offerId);
  };
  await eventLoopIteration();

  // Invalid priceRound argument
  await t.throwsAsync(
    walletPushPrice({
      roundId: 1,
      unitPrice: 1,
    }),
    {
      message:
        'In "pushPrice" method of (OracleKit oracle): arg 0: unitPrice: number 1 - Must be a bigint',
    },
  );

  await eventLoopIteration();

  // Success, round starts
  t.like(
    await walletPushPrice({
      roundId: 1,
      unitPrice: 1n,
    }),
    {
      error: undefined,
      numWantsSatisfied: 1,
    },
  );
  await eventLoopIteration();

  // Invalid attempt to push again to the same round
  await t.throwsAsync(
    walletPushPrice({
      roundId: 1,
      unitPrice: 1n,
    }),
    {
      message: 'cannot report on previous rounds',
    },
  );
});

// test both addOracles and removeOracles in same test to reuse the lengthy EC setup
test.serial('govern oracles list', async t => {
  const { invitationBrand } = t.context;

  const newOracle = 'agoric1OracleB';

  const { agoricNames, zoe } = await E.get(t.context.consume);
  const wallet = await t.context.simpleProvideWallet(committeeAddress);
  const computedState = coalesceUpdates(E(wallet).getUpdatesSubscriber());
  const currentSub = E(wallet).getCurrentSubscriber();

  const offersFacet = wallet.getOffersFacet();

  const econCharter = await E(agoricNames).lookup(
    'instance',
    'econCommitteeCharter',
  );
  /**
   * @type {import('@agoric/zoe/src/zoeService/utils.js').Instance<
   *   import('@agoric/governance/src/committee.js')['start']
   * >}
   */
  const economicCommittee = await E(agoricNames).lookup(
    'instance',
    'economicCommittee',
  );
  await eventLoopIteration();

  /**
   * get invitation details the way a user would
   *
   * @param {string} desc
   * @param {number} len
   * @param {{ get: (b: Brand) => Amount | undefined }} balances
   * @returns {Promise<[{ description: string; instance: Instance }]>}
   */
  const getInvitationFor = async (desc, len, balances) =>
    E(E(zoe).getInvitationIssuer())
      .getBrand()
      .then(brand => {
        /** @type {any} */
        const invitationsAmount = balances.get(brand);
        t.is(invitationsAmount?.value.length, len);
        return invitationsAmount.value.filter(i => i.description === desc);
      });

  const proposeInvitationDetails = await getInvitationFor(
    EC_INVITATION_MAKERS_DESC,
    2,
    computedState.balances,
  );

  t.is(proposeInvitationDetails[0].description, EC_INVITATION_MAKERS_DESC);
  t.is(proposeInvitationDetails[0].instance, econCharter, 'econCharter');
  t.is(
    // @ts-expect-error cast amount kind
    currentPurseBalance(await headValue(currentSub), invitationBrand).length,
    2,
    'two invitations deposited',
  );

  // Accept the EC invitation makers ///////////
  {
    /** @type {import('@agoric/smart-wallet/src/invitations.js').PurseInvitationSpec} */
    const getInvMakersSpec = {
      source: 'purse',
      instance: econCharter,
      description: EC_INVITATION_MAKERS_DESC,
    };

    await offersFacet.executeOffer({
      id: 'acceptEcInvitationOID',
      invitationSpec: getInvMakersSpec,
      proposal: {},
    });

    /** @type {import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord} */
    let currentState = await headValue(currentSub);
    t.is(
      // @ts-expect-error cast amount kind
      currentPurseBalance(currentState, invitationBrand).length,
      1,
      'one invitation consumed, one left',
    );
    t.deepEqual(
      currentState.offerToUsedInvitation.map(([k, _]) => k),
      ['acceptEcInvitationOID'],
    );
    let usedInvitations = new Map(currentState.offerToUsedInvitation);
    t.is(
      usedInvitations.get('acceptEcInvitationOID')?.value[0].description,
      'charter member invitation',
    );
    await offersFacet.executeOffer({
      id: 'acceptVoterOID',
      invitationSpec: {
        source: 'purse',
        instance: economicCommittee,
        description: 'Voter0',
      },
      proposal: {},
    });
    currentState = await headValue(currentSub);
    t.is(
      // @ts-expect-error cast amount kind
      currentPurseBalance(currentState, invitationBrand).length,
      0,
      'last invitation consumed, none left',
    );
    t.deepEqual(
      currentState.offerToUsedInvitation.map(([k, _]) => k),
      ['acceptEcInvitationOID', 'acceptVoterOID'],
    );
    // 'acceptEcInvitationOID' tested above
    usedInvitations = new Map(currentState.offerToUsedInvitation);
    t.is(usedInvitations.get('acceptVoterOID')?.value[0].description, 'Voter0');
  }

  const feed = await E(agoricNames).lookup(
    'instance',
    oracleBrandFeedName('ATOM', 'USD'),
  );
  t.assert(feed);

  // Call for a vote to addOracles ////////////////////////////////
  {
    /** @type {import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec} */
    const proposeInvitationSpec = {
      source: 'continuing',
      previousOffer: 'acceptEcInvitationOID',
      invitationMakerName: 'VoteOnApiCall',
      invitationArgs: harden([feed, 'addOracles', [[newOracle]], 15n]),
    };

    await offersFacet.executeOffer({
      id: 'proposeAddOracles',
      invitationSpec: proposeInvitationSpec,
      proposal: {},
    });
    await eventLoopIteration();
  }

  const committeePublic = E(zoe).getPublicFacet(economicCommittee);
  /** @type {ERef<ZoeManualTimer>} */
  // @ts-expect-error cast mock
  const timer = t.context.consume.chainTimerService;

  // vote to addOracles /////////////////////////
  await offersFacet.executeOffer({
    id: '',
    invitationSpec: await voteForOpenQuestion(
      committeePublic,
      'acceptVoterOID',
    ),
    proposal: {},
  });
  // pass time to exceed the voting deadline
  await E(timer).tickN(10);

  // accept deposit /////////////////////////

  const oracleWallet = await t.context.simpleProvideWallet(newOracle);
  const oracleWalletComputedState = coalesceUpdates(
    E(oracleWallet).getUpdatesSubscriber(),
  );
  await eventLoopIteration();
  {
    const oracleInvitationDetails = await getInvitationFor(
      ORACLE_INVITATION_MAKERS_DESC,
      1,
      oracleWalletComputedState.balances,
    );
    t.log(oracleInvitationDetails);

    t.is(oracleInvitationDetails[0].description, ORACLE_INVITATION_MAKERS_DESC);
    t.is(oracleInvitationDetails[0].instance, feed, 'matches feed instance');
  }
  const oracleOfferId = await acceptInvitation(oracleWallet, feed);
  t.is(oracleOfferId, 'acceptInvitation3');

  // Call for a vote to removeOracles ////////////////////////////////
  {
    /** @type {import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec} */
    const proposeInvitationSpec = {
      source: 'continuing',
      previousOffer: 'acceptEcInvitationOID',
      invitationMakerName: 'VoteOnApiCall',
      // XXX deadline 20n >> 2n before
      invitationArgs: harden([feed, 'removeOracles', [[newOracle]], 25n]),
    };

    await offersFacet.executeOffer({
      id: 'proposeRemoveOracles',
      invitationSpec: proposeInvitationSpec,
      proposal: {},
    });
    await eventLoopIteration();
  }

  // vote to removeOracles /////////////////////////
  await offersFacet.executeOffer({
    id: 'removeOraclesOID',
    invitationSpec: await voteForOpenQuestion(
      committeePublic,
      'acceptVoterOID',
    ),
    proposal: {},
  });
  // wait for vote to resolve
  await E(timer).tickN(20);

  // verify removed oracle can no longer PushPrice /////////////////////////
  await t.throwsAsync(
    pushPrice(oracleWallet, oracleOfferId, {
      roundId: 1,
      unitPrice: 123n,
    }),
    { message: 'pushPrice for disabled oracle' },
  );
});
