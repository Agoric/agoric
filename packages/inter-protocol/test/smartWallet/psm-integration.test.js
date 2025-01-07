import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { E } from '@endo/far';
import { NonNullish } from '@agoric/internal';
import { keyEQ } from '@agoric/store';

import { coalesceUpdates } from '@agoric/smart-wallet/src/utils.js';
import { Stable } from '@agoric/internal/src/tokens.js';
import { INVITATION_MAKERS_DESC } from '../../src/econCommitteeCharter.js';
import { buildRootObject as buildPSMRootObject } from './boot-psm.js';
import {
  currentPurseBalance,
  importBootTestUtils,
  makeDefaultTestContext,
  voteForOpenQuestion,
} from './contexts.js';
import { headValue, sequenceCurrents, withAmountUtils } from '../supports.js';

/**
 * @type {import('ava').TestFn<
 *   Awaited<ReturnType<makeDefaultTestContext>> & {
 *     consume: import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers['consume'];
 *   }
 * >}
 */
const test = anyTest;

const committeeAddress = 'psmTestAddress';

const makePsmTestSpace = async (log, bundleCache) => {
  const { mockDProxy, mockPsmBootstrapArgs } = await importBootTestUtils(
    log,
    bundleCache,
  );
  const psmParams = {
    anchorAssets: [{ denom: 'ibc/toyusdc', keyword: 'AUSD' }],
    economicCommitteeAddresses: { aMember: committeeAddress },
    argv: { bootMsg: {} },
  };

  const psmVatRoot = await buildPSMRootObject(
    {
      logger: log,
      D: mockDProxy,
    },
    psmParams,
  );
  void psmVatRoot.bootstrap(...mockPsmBootstrapArgs());

  return psmVatRoot.getPromiseSpace();
};

test.before(async t => {
  // @ts-expect-error cast
  t.context = await makeDefaultTestContext(t, makePsmTestSpace);
});

test('null swap', async t => {
  const { anchor } = t.context;
  const { agoricNames } = await E.get(t.context.consume);
  const mintedBrand = await E(agoricNames).lookup('brand', 'IST');

  const { getBalanceFor, wallet } =
    await t.context.provideWalletAndBalances('agoric1nullswap');
  const computedState = coalesceUpdates(E(wallet).getUpdatesSubscriber());
  const currents = sequenceCurrents(E(wallet).getCurrentSubscriber());

  /** @type {import('@agoric/smart-wallet/src/invitations.js').AgoricContractInvitationSpec} */
  const invitationSpec = {
    source: 'agoricContract',
    instancePath: ['psm-IST-AUSD'],
    callPipe: [['makeGiveMintedInvitation']],
  };

  const offer = {
    id: 'nullSwap',
    invitationSpec,
    proposal: {
      // empty amounts
      give: { In: AmountMath.makeEmpty(mintedBrand) },
      want: { Out: anchor.makeEmpty() },
    },
  };

  await wallet.getOffersFacet().executeOffer(harden(offer));

  await eventLoopIteration();

  const status = computedState.offerStatuses.get('nullSwap');
  t.is(status?.id, 'nullSwap');
  t.false('error' in NonNullish(status), 'should not have an error');
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(mintedBrand)).value, 0n);

  const index = currents.findIndex(x => {
    return (
      x.liveOffers[0] &&
      x.liveOffers[0][0] === 'nullSwap' &&
      keyEQ(x.liveOffers[0][1], offer)
    );
  });

  t.deepEqual(currents[index - 1].liveOffers, []);
  t.deepEqual(currents[index].liveOffers, [['nullSwap', offer]]);
  t.deepEqual(currents[index + 1].liveOffers, []);
});

// we test this direction of swap because wanting anchor would require the PSM to have anchor in it first
test('want stable', async t => {
  const { anchor } = t.context;
  const { agoricNames } = await E.get(t.context.consume);

  const swapSize = 10_000n;

  t.log('Start the PSM to ensure brands are registered');
  const stableBrand = await E(agoricNames).lookup('brand', Stable.symbol);

  const { getBalanceFor, wallet } =
    await t.context.provideWalletAndBalances('agoric1wantstable');

  const offersFacet = wallet.getOffersFacet();
  t.assert(offersFacet, 'undefined offersFacet');

  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);

  t.log('Fund the wallet');
  assert(anchor.mint);
  const payment = anchor.mint.mintPayment(anchor.make(swapSize));
  await wallet.getDepositFacet().receive(payment);

  t.log('Execute the swap');
  /** @type {import('@agoric/smart-wallet/src/invitations.js').AgoricContractInvitationSpec} */
  const invitationSpec = {
    source: 'agoricContract',
    instancePath: ['psm-IST-AUSD'],
    callPipe: [['makeWantMintedInvitation']],
  };

  await offersFacet.executeOffer({
    id: 1,
    invitationSpec,
    proposal: {
      give: { In: anchor.make(swapSize) },
      want: {},
    },
  });
  await eventLoopIteration();
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(stableBrand)).value, swapSize); // assume 0% fee
});

test('want stable (insufficient funds)', async t => {
  const { anchor } = t.context;
  const { agoricNames } = await E.get(t.context.consume);

  const anchorFunding = 10_000n;

  t.log('Start the PSM to ensure brands are registered');
  const stableBrand = await E(agoricNames).lookup('brand', Stable.symbol);

  const { getBalanceFor, wallet } = await t.context.provideWalletAndBalances(
    'agoric1wantstableInsufficient',
  );
  const computedState = coalesceUpdates(E(wallet).getUpdatesSubscriber());

  const offersFacet = wallet.getOffersFacet();
  t.assert(offersFacet, 'undefined offersFacet');

  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);

  t.log('Fund the wallet insufficiently');
  assert(anchor.mint);
  const payment = anchor.mint.mintPayment(anchor.make(anchorFunding));
  await wallet.getDepositFacet().receive(payment);

  t.log('Execute the swap');
  /** @type {import('@agoric/smart-wallet/src/invitations.js').AgoricContractInvitationSpec} */
  const invitationSpec = {
    source: 'agoricContract',
    instancePath: ['psm-IST-AUSD'],
    callPipe: [['makeWantMintedInvitation']],
  };

  await t.throwsAsync(
    offersFacet.executeOffer({
      id: 'insufficientFunds',
      invitationSpec,
      proposal: {
        give: { In: anchor.make(anchorFunding * 2n) }, // twice the available funds
        want: {},
      },
    }),
  );
  await eventLoopIteration();
  t.is(await E.get(getBalanceFor(anchor.brand)).value, anchorFunding); // remains after failure
  t.is(await E.get(getBalanceFor(stableBrand)).value, 0n);
  const msg =
    'Withdrawal of {"brand":"[Alleged: AUSD brand]","value":"[20000n]"} failed because the purse only contained {"brand":"[Alleged: AUSD brand]","value":"[10000n]"}';
  const status = computedState.offerStatuses.get('insufficientFunds');
  t.is(status?.error, `Error: ${msg}`);
});

test('govern offerFilter', async t => {
  const { anchor, invitationBrand } = t.context;
  const { agoricNames, psmKit, zoe } = await E.get(t.context.consume);

  const { psm: psmInstance } = await E(psmKit).get(anchor.brand);

  const wallet = await t.context.simpleProvideWallet(committeeAddress);
  const computedState = coalesceUpdates(
    E(wallet).getUpdatesSubscriber(),
    invitationBrand,
  );
  const currentSub = E(wallet).getCurrentSubscriber();

  const offersFacet = wallet.getOffersFacet();

  const econCharter = await E(agoricNames).lookup(
    'instance',
    'econCommitteeCharter',
  );
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
   * @param {any} balances XXX please improve this
   * @returns {Promise<[{ description: string; instance: Instance }]>}
   */
  const getInvitationFor = async (desc, len, balances) =>
    // @ts-expect-error TS can't tell that it's going to satisfy the @returns.
    E(E(zoe).getInvitationIssuer())
      .getBrand()
      .then(brand => {
        t.is(
          brand,
          invitationBrand,
          'invitation brand from context matches zoe',
        );
        /** @type {InvitationAmount} */
        const invitationsAmount = NonNullish(balances.get(brand));
        t.is(invitationsAmount?.value.length, len, 'invitation count');
        return invitationsAmount.value.filter(i => i.description === desc);
      });

  const proposeInvitationDetails = await getInvitationFor(
    INVITATION_MAKERS_DESC,
    2,
    computedState.balances,
  );

  t.is(proposeInvitationDetails[0].description, INVITATION_MAKERS_DESC);
  t.is(proposeInvitationDetails[0].instance, econCharter, 'econCharter');
  t.is(
    // @ts-expect-error cast amount kind
    currentPurseBalance(await headValue(currentSub), invitationBrand).length,
    2,
    'two invitations deposited',
  );

  // The purse has the invitation to get the makers ///////////

  /** @type {import('@agoric/smart-wallet/src/invitations.js').PurseInvitationSpec} */
  const getInvMakersSpec = {
    source: 'purse',
    instance: econCharter,
    description: INVITATION_MAKERS_DESC,
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
  const voteInvitationDetails = await getInvitationFor(
    'Voter0',
    1,
    computedState.balances,
  );
  t.is(voteInvitationDetails.length, 1);
  const voteInvitationDetail = voteInvitationDetails[0];
  t.is(voteInvitationDetail.description, 'Voter0');
  t.is(voteInvitationDetail.instance, economicCommittee);

  /** @type {import('@agoric/smart-wallet/src/invitations.js').PurseInvitationSpec} */
  const getCommitteeInvMakersSpec = {
    source: 'purse',
    instance: economicCommittee,
    description: 'Voter0',
  };

  await offersFacet.executeOffer({
    id: 'acceptVoterOID',
    invitationSpec: getCommitteeInvMakersSpec,
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
  // acceptEcInvitationOID tested above
  usedInvitations = new Map(currentState.offerToUsedInvitation);
  t.is(usedInvitations.get('acceptVoterOID')?.value[0].description, 'Voter0');

  // Call for a vote ////////////////////////////////

  /** @type {import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec} */
  const proposeInvitationSpec = {
    source: 'continuing',
    previousOffer: 'acceptEcInvitationOID',
    invitationMakerName: 'VoteOnPauseOffers',
    invitationArgs: harden([psmInstance, ['wantStable'], 2n]),
  };

  await offersFacet.executeOffer({
    id: 'proposeVoteOnPauseOffers',
    invitationSpec: proposeInvitationSpec,
    proposal: {},
  });
  await eventLoopIteration();

  // vote /////////////////////////

  const committeePublic = E(zoe).getPublicFacet(economicCommittee);

  await offersFacet.executeOffer({
    id: 'voteForPauseOffers',
    invitationSpec: await voteForOpenQuestion(
      committeePublic,
      'acceptVoterOID',
    ),
    proposal: {},
  });
  await eventLoopIteration();

  // can't advance the clock, so the vote won't close. Call it enuf that the
  // vote didn't raise an error.
});

// XXX belongs in smart-wallet package, but needs lots of set-up that's handy here.
test('deposit multiple payments to unknown brand', async t => {
  const rial = withAmountUtils(makeIssuerKit('rial'));

  const wallet = await t.context.simpleProvideWallet('agoric1queue');

  // assume that if the call succeeds then it's in durable storage.
  for await (const amt of [1n, 2n]) {
    const payment = rial.mint.mintPayment(rial.make(amt));
    await t.throwsAsync(wallet.getDepositFacet().receive(harden(payment)), {
      message: /cannot deposit .*: no purse/,
    });
  }
});

// related to recovering dropped Payments

// XXX belongs in smart-wallet package, but needs lots of set-up that's handy here.
test('recover when some withdrawals succeed and others fail', async t => {
  const { fromEntries } = Object;
  const { make } = AmountMath;
  const { anchor } = t.context;
  const { agoricNames, bankManager } = t.context.consume;
  const getBalance = async (addr, brand) => {
    const bank = E(bankManager).getBankForAddress(addr);
    const purse = E(bank).getPurse(brand);
    return E(purse).getCurrentAmount();
  };
  const namedBrands = async kws =>
    Promise.all(
      kws.map(async kw =>
        E(agoricNames)
          .lookup('brand', kw)
          .then(b => [kw, b]),
      ),
    ).then(fromEntries);

  t.log('Johnny has 10 AUSD');
  const jAddr = 'addrForJohnny';
  const smartWallet = await t.context.simpleProvideWallet(jAddr);
  await E(E(smartWallet).getDepositFacet()).receive(
    // @ts-expect-error FarRef grumble
    E(anchor.mint).mintPayment(make(anchor.brand, 10n)),
  );
  t.deepEqual(await getBalance(jAddr, anchor.brand), make(anchor.brand, 10n));

  t.log('He accidentally offers 10 BLD as well in a trade for IST');
  const instance = await E(agoricNames).lookup('instance', 'psm-IST-AUSD');
  const brand = await namedBrands(['BLD', 'IST']);
  const proposal = harden({
    give: { Anchor: make(anchor.brand, 10n), Oops: make(brand.BLD, 10n) },
    want: { Proceeds: make(brand.IST, 1n) },
  });
  await t.throwsAsync(
    E(smartWallet.getOffersFacet()).executeOffer({
      id: 'recover',
      invitationSpec: {
        source: 'contract',
        instance,
        publicInvitationMaker: 'makeWantMintedInvitation',
        invitationArgs: [],
      },
      proposal,
    }),
  );

  t.log('He still has 10 AUSD');
  t.deepEqual(await getBalance(jAddr, anchor.brand), make(anchor.brand, 10n));
});

// TODO move to smart-wallet package when it has sufficient test supports
test('agoricName invitation source errors', async t => {
  const { anchor } = t.context;
  const { agoricNames } = await E.get(t.context.consume);
  const mintedBrand = await E(agoricNames).lookup('brand', 'IST');

  const { getBalanceFor, wallet } =
    await t.context.provideWalletAndBalances('agoric1nullswap');

  await t.throwsAsync(
    wallet.getOffersFacet().executeOffer({
      id: 'missing property',
      // @ts-expect-error intentional violation
      invitationSpec: {
        source: 'agoricContract',
        instancePath: ['psm-IST-AUSD'],
        // callPipe: [['makeGiveMintedInvitation']],
      },
      proposal: {},
    }),
    {
      message:
        // TODO The pattern is here only as a temporary measure to tolerate
        // the property order being sorted and not.
        /\{("instancePath":\["psm-IST-AUSD"\]|,|"source":"agoricContract"){3}\} - Must have missing properties \["callPipe"\]/,
    },
  );
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(mintedBrand)).value, 0n);

  await t.throwsAsync(
    wallet.getOffersFacet().executeOffer({
      id: 'bad namepath',
      invitationSpec: {
        source: 'agoricContract',
        instancePath: ['not-present'],
        callPipe: [['makeGiveMintedInvitation']],
      },
      proposal: {},
    }),
    { message: '"nameKey" not found: "not-present"' },
  );
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(mintedBrand)).value, 0n);

  await t.throwsAsync(
    wallet.getOffersFacet().executeOffer({
      id: 'method typo',
      invitationSpec: {
        source: 'agoricContract',
        instancePath: ['psm-IST-AUSD'],
        callPipe: [['makeGiveMintedInvitation ']],
      },
      proposal: {},
    }),
    {
      message: /target has no method "makeGiveMintedInvitation ", has \[.*\]/,
    },
  );
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(mintedBrand)).value, 0n);

  await t.throwsAsync(
    wallet.getOffersFacet().executeOffer({
      id: 'long pipe',
      invitationSpec: {
        source: 'agoricContract',
        instancePath: ['psm-IST-AUSD'],
        callPipe: [
          ['zoe.getPublicFacet'],
          ['makeGiveMintedInvitation'],
          ['excessiveCall'],
        ],
      },
      proposal: {},
    }),
    {
      message: 'callPipe longer than MAX_PIPE_LENGTH=2',
    },
  );
  t.is(await E.get(getBalanceFor(anchor.brand)).value, 0n);
  t.is(await E.get(getBalanceFor(mintedBrand)).value, 0n);
});

test.todo('bad offer schema');
test.todo('not enough funds');
test.todo(
  'a faulty issuer that never returns and additional offers can still flow',
);
