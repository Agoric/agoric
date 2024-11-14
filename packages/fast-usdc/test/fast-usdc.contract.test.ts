import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { ExecutionContext } from 'ava';

import { AmountMath } from '@agoric/ertp/src/amountMath.js';
import {
  eventLoopIteration,
  inspectMapStore,
} from '@agoric/internal/src/testing-utils.js';
import {
  divideBy,
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E } from '@endo/far';
import path from 'path';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import { objectMap } from '@endo/patterns';
import { deeplyFulfilledObject } from '@agoric/internal';
import type { Subscriber } from '@agoric/notifier';
import { MockCctpTxEvidences } from './fixtures.js';
import { commonSetup } from './supports.js';
import type { FastUsdcTerms } from '../src/fast-usdc.contract.ts';
import { makeFeeTools } from '../src/utils/fees.js';
import type { PoolMetrics } from '../src/types.js';
import { addressTools } from '../src/utils/address.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractFile = `${dirname}/../src/fast-usdc.contract.ts`;
type StartFn = typeof import('../src/fast-usdc.contract.ts').start;

const { add, isGTE, subtract } = AmountMath;

const getInvitationProperties = async (
  zoe: ZoeService,
  invitation: Invitation,
) => {
  const invitationIssuer = E(zoe).getInvitationIssuer();
  const amount = await E(invitationIssuer).getAmountOf(invitation);
  return amount.value[0];
};

type CommonSetup = Awaited<ReturnType<typeof commonSetup>>;
const startContract = async (
  common: Pick<CommonSetup, 'brands' | 'commonPrivateArgs'>,
) => {
  const {
    brands: { usdc },
    commonPrivateArgs,
  } = common;

  const { zoe, bundleAndInstall } = await setUpZoeForTest({
    setJig: jig => {
      jig.chainHub.registerChain('osmosis', fetchedChainInfo.osmosis);
      jig.chainHub.registerChain('agoric', fetchedChainInfo.agoric);
      // TODO #10445 register noble<>agoric and noble<>osmosis instead
      // for PFM routing. also will need to call `registerAsset`
      jig.chainHub.registerConnection(
        fetchedChainInfo.agoric.chainId,
        fetchedChainInfo.osmosis.chainId,
        fetchedChainInfo.agoric.connections['osmosis-1'],
      );
    },
  });
  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);

  const startKit = await E(zoe).startInstance(
    installation,
    { USDC: usdc.issuer },
    {
      usdcDenom: 'ibc/usdconagoric',
    },
    commonPrivateArgs,
  );

  return { ...startKit, zoe };
};

test('oracle operators have closely-held rights to submit evidence of CCTP transactions', async t => {
  const common = await commonSetup(t);
  const { creatorFacet, zoe } = await startContract(common);

  const operatorId = 'operator-1';

  const opInv = await E(creatorFacet).makeOperatorInvitation(operatorId);

  t.like(await getInvitationProperties(zoe, opInv), {
    description: 'oracle operator invitation',
  });

  const operatorKit = await E(E(zoe).offer(opInv)).getOfferResult();

  t.deepEqual(Object.keys(operatorKit), [
    'admin',
    'invitationMakers',
    'operator',
  ]);

  const e1 = MockCctpTxEvidences.AGORIC_NO_PARAMS();

  {
    const inv = await E(operatorKit.invitationMakers).SubmitEvidence(e1);
    const res = await E(E(zoe).offer(inv)).getOfferResult();
    t.is(res, 'inert; nothing should be expected from this offer');
  }

  // what removeOperator will do
  await E(operatorKit.admin).disable();

  await t.throwsAsync(E(operatorKit.invitationMakers).SubmitEvidence(e1), {
    message: 'submitEvidence for disabled operator',
  });
});

const logAmt = amt => [
  Number(amt.value),
  //   numberWithCommas(Number(amt.value)),
  amt.brand
    .toString()
    .replace(/^\[object Alleged:/, '')
    .replace(/ brand]$/, ''),
];
const scaleAmount = (frac: number, amount: Amount<'nat'>) => {
  const asRatio = parseRatio(frac, amount.brand);
  return multiplyBy(amount, asRatio);
};

const makeLpTools = (
  t: ExecutionContext,
  common: Pick<CommonSetup, 'brands' | 'utils'>,
  {
    zoe,
    terms,
    subscriber,
    publicFacet,
  }: {
    zoe: ZoeService;
    subscriber: ERef<Subscriber<PoolMetrics>>;
    publicFacet: StartedInstanceKit<StartFn>['publicFacet'];
    terms: StandardTerms & FastUsdcTerms;
  },
) => {
  const {
    brands: { usdc },
    utils,
  } = common;
  const makeLP = (name, usdcPurse: ERef<Purse>) => {
    const sharePurse = E(terms.issuers.PoolShares).makeEmptyPurse();
    let deposited = AmountMath.makeEmpty(usdc.brand);
    const me = harden({
      deposit: async (qty: bigint) => {
        const {
          value: { shareWorth },
        } = await E(subscriber).getUpdateSince();
        const give = { USDC: usdc.make(qty) };
        const proposal = harden({
          give,
          want: { PoolShare: divideBy(give.USDC, shareWorth) },
        });
        t.log(name, 'deposits', ...logAmt(proposal.give.USDC));
        const toDeposit = await E(publicFacet).makeDepositInvitation();
        const payments = { USDC: await E(usdcPurse).withdraw(give.USDC) };
        const payout = await E(zoe)
          .offer(toDeposit, proposal, payments)
          .then(seat => E(seat).getPayout('PoolShare'))
          .then(pmt => E(sharePurse).deposit(pmt))
          .then(a => a as Amount<'nat'>);
        t.log(name, 'deposit payout', ...logAmt(payout));
        t.true(isGTE(payout, proposal.want.PoolShare));
        deposited = add(deposited, give.USDC);
      },

      withdraw: async (portion: number) => {
        const myShares = await E(sharePurse)
          .getCurrentAmount()
          .then(a => a as Amount<'nat'>);
        const give = { PoolShare: scaleAmount(portion, myShares) };
        const {
          value: { shareWorth },
        } = await E(subscriber).getUpdateSince();
        const myUSDC = multiplyBy(myShares, shareWorth);
        const myFees = subtract(myUSDC, deposited);
        t.log(name, 'sees fees earned', ...logAmt(myFees));
        const proposal = harden({
          give,
          want: { USDC: multiplyBy(give.PoolShare, shareWorth) },
        });
        const pct = portion * 100;
        t.log(name, 'withdraws', pct, '%:', ...logAmt(proposal.give.PoolShare));
        const toWithdraw = await E(publicFacet).makeWithdrawInvitation();
        const usdcPmt = await E(sharePurse)
          .withdraw(proposal.give.PoolShare)
          .then(pmt => E(zoe).offer(toWithdraw, proposal, { PoolShare: pmt }))
          .then(seat => E(seat).getPayout('USDC'));
        const amt = await E(usdcPurse).deposit(usdcPmt);
        t.log(name, 'withdraw payout', ...logAmt(amt));
        t.true(isGTE(amt, proposal.want.USDC));
      },
    });
    return me;
  };
  const purseOf = (value: bigint) =>
    E(terms.issuers.USDC)
      .makeEmptyPurse()
      .then(async p => {
        const pmt = await utils.pourPayment(usdc.make(value));
        await p.deposit(pmt);
        return p;
      });
  return { makeLP, purseOf };
};

test('LP deposits, earns fees, withdraws', async t => {
  const common = await commonSetup(t);
  const {
    commonPrivateArgs,
    brands: { usdc },
    utils,
  } = common;

  const { instance, creatorFacet, publicFacet, zoe } =
    await startContract(common);
  const terms = await E(zoe).getTerms(instance);

  const { subscriber } = E.get(
    E.get(E(publicFacet).getPublicTopics()).poolMetrics,
  );

  const { makeLP, purseOf } = makeLpTools(t, common, {
    publicFacet,
    subscriber,
    terms,
    zoe,
  });
  const lps = {
    alice: makeLP('Alice', purseOf(60n)),
    bob: makeLP('Bob', purseOf(50n)),
  };

  await Promise.all([lps.alice.deposit(60n), lps.bob.deposit(40n)]);

  {
    t.log('simulate borrow and repay so pool accrues fees');
    const feeTools = makeFeeTools(commonPrivateArgs.feeConfig);
    const requestedAmount = usdc.make(50n);
    const splits = feeTools.calculateSplit(requestedAmount);

    const amt = await E(creatorFacet).testBorrow({ USDC: splits.Principal });
    t.deepEqual(
      amt.USDC,
      splits.Principal,
      'testBorrow returns requested amount',
    );
    const repayPayments = await deeplyFulfilledObject(
      objectMap(splits, utils.pourPayment),
    );
    const remaining = await E(creatorFacet).testRepay(splits, repayPayments);
    for (const r of Object.values(remaining)) {
      t.is(r.value, 0n, 'testRepay consumes all payments');
    }
  }
  await Promise.all([lps.alice.withdraw(0.2), lps.bob.withdraw(0.8)]);
});

test('LP borrow', async t => {
  const common = await commonSetup(t);
  const {
    brands: { usdc },
  } = common;

  const { instance, creatorFacet, publicFacet, zoe } =
    await startContract(common);
  const terms = await E(zoe).getTerms(instance);

  const { subscriber } = E.get(
    E.get(E(publicFacet).getPublicTopics()).poolMetrics,
  );

  const { makeLP, purseOf } = makeLpTools(t, common, {
    publicFacet,
    subscriber,
    terms,
    zoe,
  });
  const lps = {
    alice: makeLP('Alice', purseOf(100n)),
  };
  // seed pool with funds
  await lps.alice.deposit(100n);

  const { value } = await E(subscriber).getUpdateSince();
  const { shareWorth, encumberedBalance } = value;
  const poolSeatAllocation = subtract(
    subtract(shareWorth.numerator, encumberedBalance),
    usdc.make(1n),
  );
  t.log('Attempting to borrow entire pool seat allocation', poolSeatAllocation);
  await t.throwsAsync(
    E(creatorFacet).testBorrow({ USDC: poolSeatAllocation }),
    {
      message: /Cannot borrow/,
    },
    'borrow fails when requested equals pool seat allocation',
  );

  await t.throwsAsync(
    E(creatorFacet).testBorrow({ USDC: usdc.make(200n) }),
    {
      message: /Cannot borrow/,
    },
    'borrow fails when requested exceeds pool seat allocation',
  );

  await t.throwsAsync(E(creatorFacet).testBorrow({ USDC: usdc.make(0n) }), {
    message: /arg 1: USDC: value: "\[0n\]" - Must be >= "\[1n\]"/,
  });

  await t.throwsAsync(
    E(creatorFacet).testBorrow(
      // @ts-expect-error intentionally incorrect KW
      { Fee: usdc.make(1n) },
    ),
    {
      message: /Must have missing properties \["USDC"\]/,
    },
  );

  // LPs can still withdraw (contract did not shutdown)
  await lps.alice.withdraw(0.5);

  const amt = await E(creatorFacet).testBorrow({ USDC: usdc.make(30n) });
  t.deepEqual(amt, { USDC: usdc.make(30n) }, 'borrow succeeds');

  await eventLoopIteration();
  t.like(await E(subscriber).getUpdateSince(), {
    value: {
      encumberedBalance: {
        value: 30n,
      },
      totalBorrows: {
        value: 30n,
      },
      totalRepays: {
        value: 0n,
      },
    },
  });
});

test('LP repay', async t => {
  const common = await commonSetup(t);
  const {
    commonPrivateArgs,
    brands: { usdc },
    utils,
  } = common;

  const { instance, creatorFacet, publicFacet, zoe } =
    await startContract(common);
  const terms = await E(zoe).getTerms(instance);

  const { subscriber } = E.get(
    E.get(E(publicFacet).getPublicTopics()).poolMetrics,
  );
  const feeTools = makeFeeTools(commonPrivateArgs.feeConfig);
  const { makeLP, purseOf } = makeLpTools(t, common, {
    publicFacet,
    subscriber,
    terms,
    zoe,
  });
  const lps = {
    alice: makeLP('Alice', purseOf(100n)),
  };
  // seed pool with funds
  await lps.alice.deposit(100n);

  // borrow funds from pool to increase encumbered balance
  await E(creatorFacet).testBorrow({ USDC: usdc.make(50n) });

  {
    t.log('cannot repay more than encumbered balance');
    const repayAmounts = feeTools.calculateSplit(usdc.make(100n));
    const repayPayments = await deeplyFulfilledObject(
      objectMap(repayAmounts, utils.pourPayment),
    );
    await t.throwsAsync(
      E(creatorFacet).testRepay(repayAmounts, repayPayments),
      {
        message: /Cannot repay. Principal .* exceeds encumberedBalance/,
      },
    );
  }

  {
    const pmt = utils.pourPayment(usdc.make(50n));
    await t.throwsAsync(
      E(creatorFacet).testRepay(
        // @ts-expect-error intentionally incorrect KWR
        { USDC: usdc.make(50n) },
        { USDC: pmt },
      ),
      {
        message:
          /Must have missing properties \["Principal","PoolFee","ContractFee"\]/,
      },
    );
  }
  {
    const pmt = utils.pourPayment(usdc.make(50n));
    await t.throwsAsync(
      E(creatorFacet).testRepay(
        // @ts-expect-error intentionally incorrect KWR
        { Principal: usdc.make(50n) },
        { Principal: pmt },
      ),
      {
        message: /Must have missing properties \["PoolFee","ContractFee"\]/,
      },
    );
  }
  {
    const amts = {
      Principal: usdc.make(0n),
      ContractFee: usdc.make(0n),
      PoolFee: usdc.make(0n),
    };
    const pmts = await deeplyFulfilledObject(
      objectMap(amts, utils.pourPayment),
    );
    await t.throwsAsync(E(creatorFacet).testRepay(amts, pmts), {
      message: /arg 1: Principal: value: "\[0n\]" - Must be >= "\[1n\]"/,
    });
  }

  {
    t.log('repay fails when amounts do not match seat allocation');
    const amts = {
      Principal: usdc.make(25n),
      ContractFee: usdc.make(1n),
      PoolFee: usdc.make(2n),
    };
    const pmts = await deeplyFulfilledObject(
      harden({
        Principal: utils.pourPayment(usdc.make(24n)),
        ContractFee: utils.pourPayment(usdc.make(1n)),
        PoolFee: utils.pourPayment(usdc.make(2n)),
      }),
    );
    await t.throwsAsync(E(creatorFacet).testRepay(amts, pmts), {
      message: /Cannot repay. From seat allocation .* does not equal amounts/,
    });
  }

  {
    t.log('repay succeeds with no Pool or Contract Fee');
    const amts = {
      Principal: usdc.make(25n),
      ContractFee: usdc.make(0n),
      PoolFee: usdc.make(0n),
    };
    const pmts = await deeplyFulfilledObject(
      objectMap(amts, utils.pourPayment),
    );
    const repayResult = await E(creatorFacet).testRepay(amts, pmts);

    for (const r of Object.values(repayResult)) {
      t.is(r.value, 0n, 'testRepay consumes all payments');
    }
  }

  const amts = {
    Principal: usdc.make(25n),
    ContractFee: usdc.make(1n),
    PoolFee: usdc.make(2n),
  };
  const pmts = await deeplyFulfilledObject(objectMap(amts, utils.pourPayment));
  const repayResult = await E(creatorFacet).testRepay(amts, pmts);

  for (const r of Object.values(repayResult)) {
    t.is(r.value, 0n, 'testRepay consumes all payments');
  }

  await eventLoopIteration();
  t.like(await E(subscriber).getUpdateSince(), {
    value: {
      encumberedBalance: {
        value: 0n,
      },
      totalBorrows: {
        value: 50n,
      },
      totalRepays: {
        value: 50n,
      },
      totalContractFees: {
        value: 1n,
      },
      totalPoolFees: {
        value: 2n,
      },
      shareWorth: {
        numerator: {
          value: 103n, // 100n (alice lp) + 1n (dust) + 2n (pool fees)
        },
      },
    },
  });

  // LPs can still withdraw (contract did not shutdown)
  await lps.alice.withdraw(1);
});

test('baggage', async t => {
  const {
    brands: { usdc },
    commonPrivateArgs,
  } = await commonSetup(t);

  let contractBaggage;
  const setJig = ({ baggage }) => {
    contractBaggage = baggage;
  };

  const { zoe, bundleAndInstall } = await setUpZoeForTest({ setJig });
  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);

  await E(zoe).startInstance(
    installation,
    { USDC: usdc.issuer },
    {
      usdcDenom: 'ibc/usdconagoric',
    },
    commonPrivateArgs,
  );

  const tree = inspectMapStore(contractBaggage);
  t.snapshot(tree, 'contract baggage after start');
});

test('advancing happy path', async t => {
  const common = await commonSetup(t);
  const {
    brands: { usdc },
    commonPrivateArgs,
    utils: { inspectLocalBridge, inspectBankBridge, transmitTransferAck },
  } = common;

  const { instance, publicFacet, zoe } = await startContract(common);
  const terms = await E(zoe).getTerms(instance);
  const { subscriber } = E.get(
    E.get(E(publicFacet).getPublicTopics()).poolMetrics,
  );
  const feeTools = makeFeeTools(commonPrivateArgs.feeConfig);
  const { makeLP, purseOf } = makeLpTools(t, common, {
    publicFacet,
    subscriber,
    terms,
    zoe,
  });

  const evidence = await E(MockCctpTxEvidences.AGORIC_PLUS_OSMO)();

  // seed pool with funds
  const alice = makeLP('Alice', purseOf(evidence.tx.amount));
  await alice.deposit(evidence.tx.amount);

  // the invitation maker itself pushes the evidence
  const inv = await E(publicFacet).makeTestPushInvitation(evidence);
  const seat = await E(zoe).offer(inv);
  t.is(
    await E(seat).getOfferResult(),
    'inert; nothing should be expected from this offer',
  );

  // calculate advance net of fees
  const expectedAdvance = feeTools.calculateAdvance(
    usdc.make(evidence.tx.amount),
  );
  t.log('Expecting to observe advance of', expectedAdvance);

  await eventLoopIteration(); // let Advancer do work

  // advance sent from PoolSeat to PoolAccount
  t.deepEqual(inspectBankBridge().at(-1), {
    amount: String(expectedAdvance.value),
    denom: 'ibc/usdconagoric',
    recipient: 'agoric1fakeLCAAddress',
    type: 'VBANK_GIVE',
  });

  // ibc transfer sent over localChain bridge
  const localBridgeMsg = inspectLocalBridge().at(-1);
  const ibcTransferMsg = localBridgeMsg.messages[0];
  t.is(ibcTransferMsg['@type'], '/ibc.applications.transfer.v1.MsgTransfer');

  const expectedReceiver = addressTools.getQueryParams(
    evidence.aux.recipientAddress,
  ).EUD;
  t.is(ibcTransferMsg.receiver, expectedReceiver, 'sent to correct address');
  t.deepEqual(ibcTransferMsg.token, {
    amount: String(expectedAdvance.value),
    denom: 'ibc/usdconagoric',
  });

  // TODO #10445 expect PFM memo
  t.is(ibcTransferMsg.memo, '', 'TODO expecting PFM memo');

  // TODO #10445 expect routing through noble, not osmosis
  t.is(
    ibcTransferMsg.sourceChannel,
    fetchedChainInfo.agoric.connections['osmosis-1'].transferChannel.channelId,
    'TODO expecting routing through Noble',
  );

  await transmitTransferAck();
  // Nothing we can check here, unless we want to inspect calls to `trace`.
  // `test/exos/advancer.test.ts` covers calls to `log: LogFn` with mocks.
  // This is still helpful to call, so we can observe "Advance transfer
  // fulfilled" in the test output.
});
