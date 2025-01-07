import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { ExecutionContext, TestFn } from 'ava';

import {
  decodeAddressHook,
  encodeAddressHook,
} from '@agoric/cosmic-proto/address-hooks.js';
import { AmountMath } from '@agoric/ertp/src/amountMath.js';
import {
  eventLoopIteration,
  inspectMapStore,
} from '@agoric/internal/src/testing-utils.js';
import {
  makePublishKit,
  observeIteration,
  subscribeEach,
  type Subscriber,
} from '@agoric/notifier';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import { buildVTransferEvent } from '@agoric/orchestration/tools/ibc-mocks.js';
import { makeTestAddress } from '@agoric/orchestration/tools/make-test-address.js';
import { heapVowE as VE } from '@agoric/vow/vat.js';
import {
  divideBy,
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import type { Instance } from '@agoric/zoe/src/zoeService/utils.js';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E } from '@endo/far';
import { matches } from '@endo/patterns';
import { makePromiseKit } from '@endo/promise-kit';
import path from 'path';
import type { OperatorKit } from '../src/exos/operator-kit.js';
import type { FastUsdcSF } from '../src/fast-usdc.contract.js';
import { CctpTxEvidenceShape, PoolMetricsShape } from '../src/type-guards.js';
import type { CctpTxEvidence, FeeConfig, PoolMetrics } from '../src/types.js';
import { makeFeeTools } from '../src/utils/fees.js';
import { MockCctpTxEvidences } from './fixtures.js';
import { commonSetup, uusdcOnAgoric } from './supports.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractFile = `${dirname}/../src/fast-usdc.contract.js`;

const agToNoble = fetchedChainInfo.agoric.connections['noble-1'];

const { add, isGTE, make, subtract, min } = AmountMath;

const getInvitationProperties = async (
  zoe: ZoeService,
  invitation: Invitation,
) => {
  const invitationIssuer = E(zoe).getInvitationIssuer();
  const amount = await E(invitationIssuer).getAmountOf(invitation);
  return amount.value[0];
};

// Spec for Mainnet. Other values are covered in unit tests of TransactionFeed.
const operatorQty = 3;

type CommonSetup = Awaited<ReturnType<typeof commonSetup>>;
const startContract = async (
  common: Pick<CommonSetup, 'brands' | 'commonPrivateArgs' | 'utils'>,
) => {
  const {
    brands: { usdc },
    commonPrivateArgs,
  } = common;

  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  const installation: Installation<FastUsdcSF> =
    await bundleAndInstall(contractFile);

  const startKit = await E(zoe).startInstance(
    installation,
    { USDC: usdc.issuer },
    { usdcDenom: uusdcOnAgoric },
    commonPrivateArgs,
  );

  const terms = await E(zoe).getTerms(startKit.instance);

  const { subscriber: metricsSub } = E.get(
    E.get(E(startKit.publicFacet).getPublicTopics()).poolMetrics,
  );

  const opInvs = await Promise.all(
    [...Array(operatorQty).keys()].map(async opIx =>
      E(startKit.creatorFacet).makeOperatorInvitation(`operator-${opIx}`),
    ),
  );
  await E(startKit.creatorFacet).connectToNoble();
  await E(startKit.creatorFacet).publishAddresses();

  return {
    ...startKit,
    terms,
    zoe,
    metricsSub,
    invitations: { operator: opInvs },
  };
};

const makeTestContext = async (t: ExecutionContext) => {
  const common = await commonSetup(t);
  await E(common.mocks.ibcBridge).setAddressPrefix('noble');

  const startKit = await startContract(common);

  const { transferBridge } = common.mocks;
  const evm = makeEVM();

  const { inspectBankBridge, inspectLocalBridge } = common.utils;
  const snapshot = () => ({
    bank: inspectBankBridge().length,
    local: inspectLocalBridge().length,
  });
  const since = ix => ({
    bank: inspectBankBridge().slice(ix.bank),
    local: inspectLocalBridge().slice(ix.local),
  });

  const sync = {
    ocw: makePromiseKit<Awaited<ReturnType<typeof makeOracleOperator>>[]>(),
    lp: makePromiseKit<Record<string, ReturnType<typeof makeLP>>>(),
  };

  const { brands, utils } = common;
  const { bankManager } = common.bootstrap;
  const receiveUSDCAt = async (addr: string, amount: NatValue) => {
    const pmt = await utils.pourPayment(make(brands.usdc.brand, amount));
    const purse = E(E(bankManager).getBankForAddress(addr)).getPurse(
      brands.usdc.brand,
    );
    return E(purse).deposit(pmt);
  };

  const accountsData = common.bootstrap.storage.data.get('fun');
  const { settlementAccount, poolAccount } = JSON.parse(
    JSON.parse(accountsData!).values[0],
  );
  t.is(settlementAccount, 'agoric1qyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqc09z0g');
  t.is(poolAccount, 'agoric1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp7zqht');
  const mint = async (e: CctpTxEvidence) => {
    const rxd = await receiveUSDCAt(settlementAccount, e.tx.amount);
    await VE(transferBridge).fromBridge(
      buildVTransferEvent({
        receiver: e.aux.recipientAddress,
        target: settlementAccount,
        sourceChannel: agToNoble.transferChannel.counterPartyChannelId,
        denom: 'uusdc',
        amount: e.tx.amount,
        sender: e.tx.forwardingAddress,
      }),
    );
    await eventLoopIteration(); // let settler do work
    return rxd;
  };

  return {
    bridges: { snapshot, since },
    common,
    evm,
    mint,
    startKit,
    sync,
    addresses: { settlementAccount, poolAccount },
  };
};

type FucContext = Awaited<ReturnType<typeof makeTestContext>>;
const test = anyTest as TestFn<FucContext>;
test.before(async t => (t.context = await makeTestContext(t)));

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
  const installation: Installation<FastUsdcSF> =
    await bundleAndInstall(contractFile);

  await E(zoe).startInstance(
    installation,
    { USDC: usdc.issuer },
    { usdcDenom: uusdcOnAgoric },
    commonPrivateArgs,
  );

  const tree = inspectMapStore(contractBaggage);
  t.snapshot(tree, 'contract baggage after start');
});

test('getStaticInfo', async t => {
  const { startKit } = t.context;
  const { publicFacet } = startKit;

  t.deepEqual(await E(publicFacet).getStaticInfo(), {
    addresses: {
      poolAccount: makeTestAddress(),
      settlementAccount: makeTestAddress(1),
    },
  });
});

const purseOf =
  (issuer: Issuer, { pourPayment }) =>
  async (value: bigint) => {
    const brand = await E(issuer).getBrand();
    const purse = E(issuer).makeEmptyPurse();
    const pmt = await pourPayment(make(brand, value));
    await E(purse).deposit(pmt);
    return purse;
  };

const makeOracleOperator = async (
  opInv: Invitation<OperatorKit>,
  txSubscriber: Subscriber<TxWithRisk>,
  zoe: ZoeService,
  t: ExecutionContext,
) => {
  let done = 0;
  const failures = [] as any[];
  t.like(await getInvitationProperties(zoe, opInv), {
    description: 'oracle operator invitation',
  });

  // operator only gets `.invitationMakers`
  // but for testing, we need `.admin` too. UNTIL #?????
  const operatorKit = await E(E(zoe).offer(opInv)).getOfferResult();
  t.deepEqual(Object.keys(operatorKit), [
    'admin',
    'invitationMakers',
    'operator',
  ]);
  const { invitationMakers } = operatorKit;

  let active = true;

  return harden({
    watch: () => {
      void observeIteration(subscribeEach(txSubscriber), {
        updateState: async ({ evidence, isRisk }) => {
          if (!active) {
            return;
          }
          // KLUDGE: tx wouldn't include aux. OCW looks it up
          return E.when(
            E(invitationMakers).SubmitEvidence(
              evidence,
              isRisk ? { risksIdentified: ['RISK1'] } : {},
            ),
            async inv =>
              E.when(E(E(zoe).offer(inv)).getOfferResult(), res => {
                t.is(res, 'inert; nothing should be expected from this offer');
                done += 1;
              }),
            reason => {
              failures.push(reason.message);
            },
          );
        },
      });
    },
    getDone: () => done,
    getFailures: () => harden([...failures]),
    // operator only gets .invitationMakers
    getKit: () => operatorKit,
    setActive: flag => {
      active = flag;
    },
  });
};

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

const makeLP = async (
  name: string,
  usdcPurse: ERef<Purse>,
  zoe: ZoeService,
  instance: Instance<FastUsdcSF>,
) => {
  const publicFacet = E(zoe).getPublicFacet(instance);
  const { subscriber } = E.get(
    E.get(E(publicFacet).getPublicTopics()).poolMetrics,
  );
  const terms = await E(zoe).getTerms(instance);
  const { USDC } = terms.brands;
  const sharePurse = E(terms.issuers.PoolShares).makeEmptyPurse();
  let investment = AmountMath.makeEmpty(USDC);
  const me = harden({
    deposit: async (t: ExecutionContext, qty: bigint) => {
      const {
        value: { shareWorth },
      } = await E(subscriber).getUpdateSince();
      const give = { USDC: make(USDC, qty) };
      const proposal = harden({
        give,
        want: { PoolShare: divideBy(give.USDC, shareWorth) },
      });
      t.log(name, 'deposits', ...logAmt(proposal.give.USDC));
      const toDeposit = await E(publicFacet).makeDepositInvitation();
      const payments = { USDC: await E(usdcPurse).withdraw(give.USDC) };
      const payout = await E(zoe)
        .offer(toDeposit, proposal, payments)
        .then(async seat => E(seat).getPayout('PoolShare'))
        .then(async pmt => E(sharePurse).deposit(pmt))
        .then(a => a as Amount<'nat'>);
      t.log(name, 'deposit payout', ...logAmt(payout));
      t.true(isGTE(payout, proposal.want.PoolShare));
      investment = add(investment, give.USDC);
    },

    withdraw: async (t: ExecutionContext, portion: number) => {
      const myShares = await E(sharePurse)
        .getCurrentAmount()
        .then(a => a as Amount<'nat'>);
      const give = { PoolShare: scaleAmount(portion, myShares) };
      const {
        value: { shareWorth },
      } = await E(subscriber).getUpdateSince();
      const myUSDC = multiplyBy(myShares, shareWorth);
      const myFees = subtract(myUSDC, investment);
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
        .then(async pmt =>
          E(zoe).offer(toWithdraw, proposal, { PoolShare: pmt }),
        )
        .then(async seat => E(seat).getPayout('USDC'));
      const amt = await E(usdcPurse).deposit(usdcPmt);
      t.log(name, 'withdraw payout', ...logAmt(amt));
      t.true(isGTE(amt, proposal.want.USDC));
      // min() in case things changed between checking metrics and withdrawing
      investment = subtract(investment, min(amt, investment));
      return amt;
    },
  });
  return me;
};

const makeEVM = (template = MockCctpTxEvidences.AGORIC_PLUS_OSMO()) => {
  let nonce = 0;

  const makeTx = (
    amount: bigint,
    recipientAddress: string,
    nonceOverride?: number,
  ): CctpTxEvidence => {
    nonce += 1;

    const tx: CctpTxEvidence = harden({
      ...template,
      txHash: `0x00000${nonceOverride || nonce}`,
      blockNumber: template.blockNumber + BigInt(nonceOverride || nonce),
      tx: { ...template.tx, amount },
      // KLUDGE: CCTP doesn't know about aux; it would be added by OCW
      aux: { ...template.aux, recipientAddress },
    });
    return tx;
  };

  const txPub = makePublishKit<TxWithRisk>();

  return harden({ cctp: { makeTx }, txPub });
};

/**
 * We pass around evidence along with a flag to indicate whether it should be
 * treated as risky for testing purposes.
 */
interface TxWithRisk {
  evidence: CctpTxEvidence;
  isRisk: boolean;
}

const makeCustomer = (
  who: string,
  cctp: ReturnType<typeof makeEVM>['cctp'],
  txPublisher: Publisher<TxWithRisk>,
  feeConfig: FeeConfig, // TODO: get from vstorage (or at least: a subscriber)
) => {
  const USDC = feeConfig.flat.brand;
  const feeTools = makeFeeTools(feeConfig);
  const sent = [] as TxWithRisk[];

  const me = harden({
    checkPoolAvailable: async (
      t: ExecutionContext,
      want: NatValue,
      metricsSub: ERef<Subscriber<PoolMetrics>>,
    ) => {
      const { value: m } = await E(metricsSub).getUpdateSince();
      const { numerator: poolBalance } = m.shareWorth; // XXX awkward API?
      const enough = poolBalance.value > want;
      t.log(who, 'sees', poolBalance.value, enough ? '>' : 'NOT >', want);
      return enough;
    },
    sendFast: async (
      t: ExecutionContext<FucContext>,
      amount: bigint,
      EUD: string,
      isRisk = false,
      nonceOverride?: number,
    ) => {
      const { storage } = t.context.common.bootstrap;
      const accountsData = storage.data.get('fun');
      const { settlementAccount } = JSON.parse(
        JSON.parse(accountsData!).values[0],
      );
      const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
      // KLUDGE: UI would ask noble for a forwardingAddress
      // "cctp" here has some noble stuff mixed in.
      const tx = cctp.makeTx(amount, recipientAddress, nonceOverride);
      t.log(who, 'signs CCTP for', amount, 'uusdc w/EUD:', EUD);
      txPublisher.publish({ evidence: tx, isRisk });
      sent.push({ evidence: tx, isRisk });
      await eventLoopIteration();
      return tx;
    },
    checkSent: (
      t: ExecutionContext<FucContext>,
      { bank = [] as any[], local = [] as any[] } = {},
      forward?: unknown,
    ) => {
      const next = sent.shift();
      if (!next) throw t.fail('nothing sent');
      const { evidence } = next;

      // C3 - Contract MUST calculate AdvanceAmount by ...
      // Mostly, see unit tests for calculateAdvance, calculateSplit
      const toReceive = forward
        ? { value: evidence.tx.amount }
        : feeTools.calculateAdvance(AmountMath.make(USDC, evidence.tx.amount));

      if (forward) {
        t.log(who, 'waits for fallback / forward');
        t.deepEqual(bank, []); // no vbank GIVE / GRAB
      }

      const { EUD } = decodeAddressHook(evidence.aux.recipientAddress).query;

      const myMsg = local.find(lm => {
        if (lm.type !== 'VLOCALCHAIN_EXECUTE_TX') return false;
        const [ibcTransferMsg] = lm.messages;
        // support advances to noble + other chains
        const receiver =
          ibcTransferMsg.receiver === 'noble1test' // intermediateRecipient value
            ? JSON.parse(ibcTransferMsg.memo).forward.receiver
            : ibcTransferMsg.receiver;
        return (
          ibcTransferMsg['@type'] ===
            '/ibc.applications.transfer.v1.MsgTransfer' && receiver === EUD
        );
      });
      if (!myMsg) {
        if (forward) return;
        throw t.fail(`no MsgTransfer to ${EUD}`);
      }
      const { poolAccount } = t.context.addresses;
      t.is(myMsg.address, poolAccount, 'advance sent from pool account');
      const [ibcTransferMsg] = myMsg.messages;
      // C4 - Contract MUST release funds to the end user destination address
      // in response to invocation by the off-chain watcher that
      // an acceptable Fast USDC Transaction has been initiated.
      t.deepEqual(
        ibcTransferMsg.token,
        { amount: String(toReceive.value), denom: uusdcOnAgoric },
        'C4',
      );
      t.log(who, 'sees', ibcTransferMsg.token, 'sending to', EUD);
      if (!(EUD as string).startsWith('noble')) {
        t.like(
          JSON.parse(ibcTransferMsg.memo),
          {
            forward: {
              receiver: EUD,
            },
          },
          'PFM receiver is EUD',
        );
      } else {
        t.like(ibcTransferMsg, { receiver: EUD });
      }
      t.is(
        ibcTransferMsg.sourceChannel,
        fetchedChainInfo.agoric.connections['noble-1'].transferChannel
          .channelId,
        'expect routing through Noble',
      );
    },
  });
  return me;
};

test.serial('OCW operators redeem invitations and start watching', async t => {
  const {
    startKit: { zoe, invitations },
    evm: { txPub },
    sync,
  } = t.context;
  const operators = await Promise.all(
    invitations.operator.map(async opInv => {
      const op = makeOracleOperator(opInv, txPub.subscriber, zoe, t);
      await E(op).watch();
      return op;
    }),
  );
  sync.ocw.resolve(operators);
});

// XXX: replace test.serial() with promise synchronization?

test.serial('C25 - LPs can deposit USDC', async t => {
  const {
    startKit: { zoe, instance, metricsSub },
    common: {
      utils,
      brands: { usdc },
    },
    sync,
  } = t.context;
  const usdcPurse = purseOf(usdc.issuer, utils);
  // C25 - MUST support multiple liquidity providers
  const lp = {
    lp50: makeLP('Logan', usdcPurse(50_000_000n), zoe, instance),
    lp200: makeLP('Larry', usdcPurse(200_000_000n), zoe, instance),
  };

  const {
    value: {
      shareWorth: { numerator: balance0 },
    },
  } = await E(metricsSub).getUpdateSince();

  await Promise.all([
    E(lp.lp200).deposit(t, 200_000_000n),
    E(lp.lp50).deposit(t, 50_000_000n),
  ]);

  sync.lp.resolve(lp);
  const {
    value: {
      shareWorth: { numerator: poolBalance },
    },
  } = await E(metricsSub).getUpdateSince();
  t.deepEqual(poolBalance, make(usdc.brand, 250_000_000n + balance0.value));
});

test.serial('Contract skips advance when risks identified', async t => {
  const {
    common: {
      commonPrivateArgs: { feeConfig },
      utils: { transmitTransferAck },
    },
    evm: { cctp, txPub },
    startKit: { metricsSub },
    bridges: { snapshot, since },
    mint,
  } = t.context;
  const custEmpty = makeCustomer('Skippy', cctp, txPub.publisher, feeConfig);
  const bridgePos = snapshot();
  const sent = await custEmpty.sendFast(t, 1_000_000n, 'osmo123', true);
  const bridgeTraffic = since(bridgePos);
  await mint(sent);
  custEmpty.checkSent(t, bridgeTraffic, 'forward');
  t.log('No advancement, just settlement');
  await transmitTransferAck(); // ack IBC transfer for forward
});

test.serial('STORY01: advancing happy path for 100 USDC', async t => {
  const {
    common: {
      bootstrap: { storage },
      brands: { usdc },
      commonPrivateArgs: { feeConfig },
      utils: { inspectBankBridge, transmitTransferAck },
    },
    evm: { cctp, txPub },
    startKit: { metricsSub },
    bridges: { snapshot, since },
    mint,
  } = t.context;
  const cust1 = makeCustomer('Carl', cctp, txPub.publisher, feeConfig);

  const bridgePos = snapshot();
  const sent1 = await cust1.sendFast(t, 108_000_000n, 'osmo1234advanceHappy');
  await transmitTransferAck(); // ack IBC transfer for advance
  const expectedTransitions = [
    { evidence: sent1, status: 'OBSERVED' },
    { status: 'ADVANCING' },
    { status: 'ADVANCED' },
  ];
  t.deepEqual(
    storage.getDeserialized(`fun.txns.${sent1.txHash}`),
    expectedTransitions,
  );

  const { calculateAdvance, calculateSplit } = makeFeeTools(feeConfig);
  const expectedAdvance = calculateAdvance(usdc.make(sent1.tx.amount));
  t.log('advancer sent to PoolAccount', expectedAdvance);
  t.deepEqual(inspectBankBridge().at(-1), {
    amount: String(expectedAdvance.value),
    denom: uusdcOnAgoric,
    recipient: makeTestAddress(),
    type: 'VBANK_GIVE',
  });

  cust1.checkSent(t, since(bridgePos));

  const emptyMetrics = {
    encumberedBalance: usdc.makeEmpty(),
    shareWorth: {
      numerator: usdc.make(1n),
      denominator: { value: 1n },
    },
    totalBorrows: usdc.makeEmpty(),
    totalContractFees: usdc.makeEmpty(),
    totalPoolFees: usdc.makeEmpty(),
    totalRepays: usdc.makeEmpty(),
  };
  const par250 = {
    numerator: usdc.make(250_000_001n),
    denominator: { value: 250_000_001n },
  };

  t.like(
    await E(metricsSub)
      .getUpdateSince()
      .then(r => r.value),
    {
      ...emptyMetrics,
      encumberedBalance: expectedAdvance,
      shareWorth: par250,
      totalBorrows: expectedAdvance,
    },
    'metrics while advancing',
  );

  await mint(sent1);

  // C8 - "Contract MUST be able to initialize settlement process when Noble mints USDC."
  // The metrics are a useful proxy, but the contract could lie.
  // The real test of whether the contract turns minted funds into liquidity is
  // the ability to advance the funds (in later tests).
  const split = calculateSplit(usdc.make(sent1.tx.amount));
  t.like(
    await E(metricsSub)
      .getUpdateSince()
      .then(r => r.value),
    {
      ...emptyMetrics,
      shareWorth: {
        ...par250,
        numerator: add(par250.numerator, split.PoolFee),
      },
      totalBorrows: { value: 105839999n },
      totalContractFees: { value: 432000n },
      totalPoolFees: { value: 1728001n },
      totalRepays: { value: 105839999n },
    },
    'metrics after advancing',
  );

  t.deepEqual(storage.getDeserialized(`fun.txns.${sent1.txHash}`), [
    ...expectedTransitions,
    { split, status: 'DISBURSED' },
  ]);
});

// most likely in exo unit tests
test.todo(
  'C21 - Contract MUST log / timestamp each step in the transaction flow',
);

test.serial('STORY03: see accounting metrics', async t => {
  const {
    common: {
      brands: { usdc },
    },
    startKit: { metricsSub },
  } = t.context;
  const { value: metrics } = await E(metricsSub).getUpdateSince();

  t.log(metrics);
  t.true(matches(metrics, PoolMetricsShape));
});
test.todo('document metrics storage schema');
test.todo('get metrics from vstorage');

test.serial('STORY05: LP collects fees on 100 USDC', async t => {
  const {
    sync,
    common: {
      brands: { usdc },
    },
  } = t.context;

  const lp = await sync.lp.promise;
  const got = await E(lp.lp200).withdraw(t, 0.5); // redeem 1/2 my shares

  // C3 - Contract MUST calculate ...
  // Mostly, see unit tests for calculateAdvance, calculateSplit
  // TODO: add a feeTools unit test for the magic number below.
  t.deepEqual(got, add(usdc.units(100), usdc.make(691_200n)));

  await E(lp.lp200).deposit(t, 100_000_000n); // put all but the fees back in
});

test.serial('With 250 available, 3 race to get ~100', async t => {
  const {
    bridges: { snapshot, since },
    evm: { cctp, txPub },
    common: {
      commonPrivateArgs: { feeConfig },
      utils: { transmitTransferAck },
    },
    startKit: { metricsSub },
    mint,
  } = t.context;

  const cust = {
    racer1: makeCustomer('Racer1', cctp, txPub.publisher, feeConfig),
    racer2: makeCustomer('Racer2', cctp, txPub.publisher, feeConfig),
    racer3: makeCustomer('Racer3', cctp, txPub.publisher, feeConfig),
  };

  await cust.racer3.checkPoolAvailable(t, 125_000_000n, metricsSub);

  const bridgePos = snapshot();
  const [sent1, sent2, sent3] = await Promise.all([
    cust.racer1.sendFast(t, 110_000_000n, 'osmo1234a'),
    cust.racer2.sendFast(t, 120_000_000n, 'osmo1234b'),
    cust.racer3.sendFast(t, 125_000_000n, 'osmo1234c'),
  ]);
  cust.racer1.checkSent(t, since(bridgePos));
  cust.racer2.checkSent(t, since(bridgePos));
  // TODO/WIP: cust.racer3.checkSent(t, since(bridgePos), 'forward - LP depleted');
  await transmitTransferAck();
  await transmitTransferAck();
  await transmitTransferAck();
  await Promise.all([mint(sent1), mint(sent2), mint(sent3)]);
});

test.serial('STORY05(cont): LPs withdraw all liquidity', async t => {
  const {
    sync,
    common: {
      brands: { usdc },
    },
  } = t.context;

  const lp = await sync.lp.promise;
  const [a, b] = await Promise.all([
    E(lp.lp200).withdraw(t, 1),
    E(lp.lp50).withdraw(t, 1),
  ]);
  t.log({ a, b, sum: add(a, b) });
  t.truthy(a);
  t.truthy(b);
});

test.serial('STORY09: insufficient liquidity: no FastUSDC option', async t => {
  // STORY09 - As the Fast USDC end user,
  // I should see the option to use Fast USDC unavailable
  // on the UI (and unusable) if there are not funds in the
  // MarketMaker’s account
  const {
    common: {
      commonPrivateArgs: { feeConfig },
    },
    evm: { cctp, txPub },
    startKit: { metricsSub },
  } = t.context;
  const early = makeCustomer('Unice', cctp, txPub.publisher, feeConfig);
  const available = await early.checkPoolAvailable(t, 5_000_000n, metricsSub);
  t.false(available);
});

test.serial('C20 - Contract MUST function with an empty pool', async t => {
  const {
    common: {
      commonPrivateArgs: { feeConfig },
      utils: { transmitTransferAck },
    },
    evm: { cctp, txPub },
    bridges: { snapshot, since },
    mint,
  } = t.context;
  const custEmpty = makeCustomer('Earl', cctp, txPub.publisher, feeConfig);
  const bridgePos = snapshot();
  const sent = await custEmpty.sendFast(t, 150_000_000n, 'osmo123');
  const bridgeTraffic = since(bridgePos);
  await mint(sent);
  custEmpty.checkSent(t, bridgeTraffic, 'forward');
  t.log('No advancement, just settlement');
  await transmitTransferAck(); // ack IBC transfer for forward
});

test.todo('C18 - forward - MUST log and alert these incidents');

test.serial('Settlement for unknown transaction (operator down)', async t => {
  const {
    sync,
    bridges: { snapshot, since },
    evm: { cctp, txPub },
    common: {
      bootstrap: { storage },
      commonPrivateArgs: { feeConfig },
      mocks: { transferBridge },
      utils: { transmitTransferAck },
    },
    mint,
    addresses,
  } = t.context;
  const operators = await sync.ocw.promise;

  // Simulate 2 of 3 operators being unavailable
  operators[0].setActive(false);
  operators[1].setActive(false);

  const opDown = makeCustomer('Otto', cctp, txPub.publisher, feeConfig);

  const bridgePos = snapshot();
  const EUD = 'osmo10tt0';
  const mintAmt = 5_000_000n;
  const sent = await opDown.sendFast(t, mintAmt, EUD);
  await mint(sent);
  const bridgeTraffic = since(bridgePos);

  t.like(
    bridgeTraffic.bank,
    [
      {
        amount: String(mintAmt),
        sender: 'faucet',
        type: 'VBANK_GRAB',
      },
      {
        amount: String(mintAmt),
        recipient: 'agoric1qyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqc09z0g',
        type: 'VBANK_GIVE',
      },
    ],
    '20 USDC arrive at the settlement account',
  );

  await transmitTransferAck();
  t.deepEqual(bridgeTraffic.local, [], 'no IBC transfers');

  // activate oracles and submit evidence; expect Settler to forward (slow path)
  // 'C12 - Contract MUST only pay back the Pool (fees) only if they started the advance before USDC is minted',
  operators[0].setActive(true);
  operators[1].setActive(true);
  // set the 3rd operator to inactive so it doesn't report a 2nd time
  operators[2].setActive(false);

  // compute nonce from initial report so a new txId is not generated by `sendFast` helper
  const nonce = Number(sent.txHash.slice(2));
  await opDown.sendFast(t, mintAmt, EUD, false, nonce);

  const [outgoingForward] = since(bridgePos).local;
  t.like(outgoingForward, {
    type: 'VLOCALCHAIN_EXECUTE_TX',
    address: addresses.settlementAccount,
    messages: [
      {
        '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      },
    ],
  });
  const [outgoingForwardMessage] = outgoingForward.messages;
  t.is(
    outgoingForwardMessage.token.amount,
    String(sent.tx.amount),
    'full amount is transferred via `.forward()`',
  );

  const forwardInfo = JSON.parse(outgoingForwardMessage.memo).forward;
  t.is(forwardInfo.receiver, EUD, 'receiver is osmo10tt0');

  // in lieu of transmitTransferAck so we can set a nonce that matches our initial Advance
  await E(transferBridge).fromBridge(
    buildVTransferEvent({
      receiver: outgoingForwardMessage.receiver,
      sender: outgoingForwardMessage.sender,
      target: outgoingForwardMessage.sender,
      sourceChannel: outgoingForwardMessage.sourceChannel,
      sequence: BigInt(nonce),
      denom: outgoingForwardMessage.token.denom,
      amount: BigInt(outgoingForwardMessage.token.amount),
    }),
  );
  await eventLoopIteration();

  t.deepEqual(storage.getDeserialized(`fun.txns.${sent.txHash}`), [
    { evidence: sent, status: 'OBSERVED' },
    { status: 'FORWARDED' },
  ]);
});

test.serial('mint received while ADVANCING', async t => {
  // Settler should `disburse` on Transfer success
  const {
    bridges: { snapshot, since },
    common: {
      commonPrivateArgs: { feeConfig },
      utils,
      brands: { usdc },
      bootstrap: { storage },
    },
    evm: { cctp, txPub },
    mint,
    startKit: { zoe, instance, metricsSub },
  } = t.context;

  t.log('top of liquidity pool');
  const usdcPurse = purseOf(usdc.issuer, utils);
  const lp999 = makeLP('Leo ', usdcPurse(999_000_000n), zoe, instance);
  await E(lp999).deposit(t, 999_000_000n);

  const earlySettle = makeCustomer('Earl E.', cctp, txPub.publisher, feeConfig);
  const bridgePos = snapshot();

  await earlySettle.checkPoolAvailable(t, 5_000_000n, metricsSub);
  const sent = await earlySettle.sendFast(t, 5_000_000n, 'osmo1earl3');
  await eventLoopIteration();
  earlySettle.checkSent(t, since(bridgePos));

  await mint(sent);
  // mint received before Advance transfer settles
  await utils.transmitTransferAck();

  const split = makeFeeTools(feeConfig).calculateSplit(usdc.make(5_000_000n));
  t.deepEqual(storage.getDeserialized(`fun.txns.${sent.txHash}`), [
    { evidence: sent, status: 'OBSERVED' },
    { status: 'ADVANCING' },
    { status: 'ADVANCED' },
    { split, status: 'DISBURSED' },
  ]);
});

test.todo(
  'fee levels MUST be visible to external parties - i.e., written to public storage',
);
