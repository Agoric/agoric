import anyTest from '@endo/ses-ava/prepare-endo.js';

import { encodeAddressHook } from '@agoric/cosmic-proto/address-hooks.js';
import type { QueryBalanceResponseSDKType } from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import { AmountMath } from '@agoric/ertp';
import type { USDCProposalShapes } from '@agoric/fast-usdc/src/pool-share-math.js';
import type {
  CctpTxEvidence,
  EvmAddress,
  NobleAddress,
} from '@agoric/fast-usdc/src/types.js';
import { makeTracer } from '@agoric/internal';
import { divideBy, multiplyBy } from '@agoric/zoe/src/contractSupport/ratio.js';
import type { ExecutionContext, TestFn } from 'ava';
import { makeDenomTools } from '../../tools/asset-info.js';
import { makeBlocksIterable } from '../../tools/block-iter.js';
import { makeDoOffer } from '../../tools/e2e-tools.js';
import { makeQueryClient } from '../../tools/query.js';
import { createWallet } from '../../tools/wallet.js';
import { commonSetup } from '../support.js';
import { makeFeedPolicyPartial, oracleMnemonics } from './config.js';
import { agoricNamesQ, fastLPQ, makeTxOracle } from './fu-actors.js';
import { sleep } from '@agoric/client-utils';
import type {
  CosmosChainInfo,
  Denom,
  DenomDetail,
} from '@agoric/orchestration';
import type { IBCConnectionID } from '@agoric/vats';

const { RELAYER_TYPE } = process.env;

const log = makeTracer('MCFU');

const { keys, values } = Object;
const { isGTE, isEmpty, make, subtract } = AmountMath;

const test = anyTest as TestFn<Awaited<ReturnType<typeof makeTestContext>>>;

const accounts = [...keys(oracleMnemonics), 'lp', 'feeDest'];
const contractName = 'fastUsdc';
const contractBuilder =
  '../packages/builders/scripts/fast-usdc/start-fast-usdc.build.js';
const LP_DEPOSIT_AMOUNT = 8_000n * 10n ** 6n;

type QueryClient = ReturnType<typeof makeQueryClient>;

const fuAssetInfo = (assetInfo: string): string => {
  const denomPairs: [Denom, DenomDetail][] = JSON.parse(assetInfo);
  const matchingPair = denomPairs.find(
    ([_, detail]) =>
      detail.chainName === 'agoric' && detail.baseDenom === 'uusdc',
  );
  if (!matchingPair) throw Error('no uusdc on agoric in common assetInfo');
  return JSON.stringify([matchingPair]);
};

const replaceConnectionId = (
  info: Record<string, CosmosChainInfo>,
  primary: string,
  remote: string,
  replacement: IBCConnectionID = 'connection-9999999',
) => {
  const fwd = info[primary].connections![info[remote].chainId];
  const rev = info[remote].connections![info[primary].chainId];
  const revised: Record<string, CosmosChainInfo> = {
    ...info,
    [primary]: {
      ...info[primary],
      connections: {
        ...info[primary].connections,
        [info.noble.chainId]: {
          ...fwd,
          counterparty: {
            ...fwd.counterparty,
            connection_id: replacement,
          },
        },
      },
    },
    [remote]: {
      ...info[remote],
      connections: {
        ...info[remote].connections,
        [info[primary].chainId]: {
          ...rev,
          id: replacement,
        },
      },
    },
  };
  return harden(revised);
};

const makeTestContext = async (t: ExecutionContext) => {
  const { setupTestKeys, ...common } = await commonSetup(t, {
    config: `../config.fusdc${RELAYER_TYPE ? '.' + RELAYER_TYPE : ''}.yaml`,
  });
  const {
    chainInfo,
    commonBuilderOpts,
    deleteTestKeys,
    faucetTools,
    provisionSmartWallet,
    startContract,
    useChain,
  } = common;
  await deleteTestKeys(accounts).catch();
  const wallets = await setupTestKeys(accounts, values(oracleMnemonics));
  t.log('setupTestKeys:', wallets);

  // provision oracle wallets first so invitation deposits don't fail
  const oracleWds = await Promise.all(
    keys(oracleMnemonics).map(n =>
      provisionSmartWallet(wallets[n], {
        BLD: 100n,
      }),
    ),
  );

  // calculate denomHash and channelId for privateArgs / builder opts
  const { getTransferChannelId, toDenomHash } = makeDenomTools(chainInfo);
  const usdcDenom = toDenomHash('uusdc', 'noblelocal', 'agoric');
  const usdcOnOsmosis = toDenomHash('uusdc', 'noblelocal', 'osmosis');
  const nobleAgoricChannelId = getTransferChannelId('agoriclocal', 'noble');
  if (!nobleAgoricChannelId) throw new Error('nobleAgoricChannelId not found');
  t.log('nobleAgoricChannelId', nobleAgoricChannelId);
  t.log('usdcDenom', usdcDenom);

  await startContract(contractName, contractBuilder, {
    oracle: keys(oracleMnemonics).map(n => `${n}:${wallets[n]}`),
    usdcDenom,
    feedPolicy: JSON.stringify(makeFeedPolicyPartial(nobleAgoricChannelId)),
    // misconfigured a la https://github.com/Agoric/agoric-sdk/issues/11013
    chainInfo: JSON.stringify(
      replaceConnectionId(
        JSON.parse(commonBuilderOpts.chainInfo),
        'agoric',
        'noble',
        'connection-99999',
      ),
    ),
    assetInfo: fuAssetInfo(commonBuilderOpts.assetInfo),
  });

  // provide faucet funds for LPs
  await faucetTools.fundFaucet([['noble', 'uusdc']]);

  // save an LP in test context
  const lpUser = await provisionSmartWallet(wallets['lp'], {
    USDC: 8_000n,
    BLD: 100n,
  });
  const feeUser = await provisionSmartWallet(wallets['feeDest'], { BLD: 100n });

  const { vstorageClient } = common;
  const api = makeQueryClient(await useChain('agoric').getRestEndpoint());
  const now = () => Date.now();
  const blockIter = makeBlocksIterable({
    api,
    setTimeout,
    clearTimeout,
    now,
  });
  const oKeys = keys(oracleMnemonics);
  const txOracles = oracleWds.map((wd, ix) =>
    makeTxOracle(oKeys[ix], { wd, vstorageClient, blockIter, now }),
  );

  let callCount = 0;
  const makeFakeEvidence = (
    mintAmt: bigint,
    userForwardingAddr: NobleAddress,
    recipientAddress: string,
  ) =>
    harden({
      blockHash:
        '0x90d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee665',
      blockNumber: 21037663n,
      blockTimestamp: 1632340000n,
      txHash: `0xc81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff3875527617${String(callCount++).padStart(2, '0')}`,
      tx: {
        amount: mintAmt,
        forwardingAddress: userForwardingAddr,
        sender: '0x9a9eE9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9' as EvmAddress,
      },
      aux: {
        forwardingChannel: nobleAgoricChannelId,
        recipientAddress,
      },
      chainId: 42161,
    }) as CctpTxEvidence;

  const queryTxStatus = async (txHash: string) => {
    const record = await common.smartWalletKit.readPublished(
      `fastUsdc.txns.${txHash}`,
    );
    if (!record) {
      throw new Error(`no record for ${txHash}`);
    }
    // @ts-expect-error unknown may not have 'status'
    if (!record.status) {
      throw new Error(`no status for ${txHash}`);
    }
    // @ts-expect-error still unknown?
    return record.status;
  };

  const assertTxStatus = async (txHash: string, status: string) =>
    t.notThrowsAsync(() =>
      common.retryUntilCondition(
        () => queryTxStatus(txHash),
        txStatus => {
          log('tx status', txStatus);
          return txStatus === status;
        },
        `${txHash} is ${status}`,
      ),
    );

  const getUsdcDenom = (chainName: string) => {
    switch (chainName) {
      case 'agoric':
        return usdcDenom;
      case 'osmosis':
        return usdcOnOsmosis;
      case 'noble':
        return 'uusdc';
      default:
        throw new Error(`${chainName} not supported in 'getUsdcDenom'`);
    }
  };

  const assertAmtForwarded = (
    queryClient: QueryClient,
    EUD: string,
    eudChain: string,
    mintAmt: bigint,
  ) =>
    t.notThrowsAsync(async () => {
      await common.retryUntilCondition(
        () => queryClient.queryBalance(EUD, getUsdcDenom(eudChain)),
        ({ balance }) => {
          if (!balance) return false; // retry
          const value = BigInt(balance.amount);
          if (value === 0n) return false; // retry
          if (value < mintAmt) {
            throw Error(`fees were deducted: ${value} < ${mintAmt}`);
          }
          t.log('forward done', value, 'uusdc');
          return true;
        },
        `${EUD} forward available from fast-usdc`,
        // this resolves quickly, so _decrease_ the interval so the timing is more apparent
        { retryIntervalMs: 500, maxRetries: 20 },
      );
    });

  return {
    ...common,
    api,
    assertAmtForwarded,
    assertTxStatus,
    feeUser,
    getUsdcDenom,
    lpUser,
    makeFakeEvidence,
    nobleAgoricChannelId,
    oracleWds,
    txOracles,
    usdcOnOsmosis,
    usdcDenom,
    wallets,
  };
};
test.before(async t => (t.context = await makeTestContext(t)));

test.after(async t => {
  const { deleteTestKeys } = t.context;
  deleteTestKeys(accounts);
});

test.serial('oracles accept', async t => {
  const { txOracles, retryUntilCondition } = t.context;

  // ensure we have an unused (or used) oracle invitation in each purse
  let hasAccepted = false;
  for (const op of txOracles) {
    const { detail, usedInvitation } = await op.checkInvitation();
    t.log({ name: op.getName(), hasInvitation: !!detail, usedInvitation });
    t.true(!!detail || usedInvitation, 'has or accepted invitation');
    if (usedInvitation) hasAccepted = true;
  }
  // if the oracles have already accepted, skip the rest of the test this is
  // primarily to facilitate active development but could support testing on
  // images where operator invs are already accepted
  if (hasAccepted) return t.pass();

  // accept oracle operator invitations
  await Promise.all(txOracles.map(op => op.acceptInvitation()));

  for (const op of txOracles) {
    await t.notThrowsAsync(() =>
      retryUntilCondition(
        () => op.checkInvitation(),
        ({ usedInvitation }) => !!usedInvitation,
        `${op.getName()} invitation used`,
        { log },
      ),
    );
  }
});

const toAmt = (
  brand: Brand<'nat'>,
  balance: QueryBalanceResponseSDKType['balance'],
) => make(brand, BigInt(balance?.amount || 0));

test.serial('lp deposits', async t => {
  const { lpUser, retryUntilCondition, vstorageClient, wallets } = t.context;

  const lpDoOffer = makeDoOffer(lpUser);

  const { USDC, FastLP } = await agoricNamesQ(vstorageClient).brands('nat');

  const give = { USDC: make(USDC, LP_DEPOSIT_AMOUNT) };

  const metricsPre = await fastLPQ(vstorageClient).metrics();
  const want = { PoolShare: divideBy(give.USDC, metricsPre.shareWorth) };

  const proposal: USDCProposalShapes['deposit'] = harden({ give, want });
  await lpDoOffer({
    id: `lp-deposit-${Date.now()}`,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeDepositInvitation']],
    },
    proposal,
  });

  await t.notThrowsAsync(() =>
    retryUntilCondition(
      () => fastLPQ(vstorageClient).metrics(),
      ({ shareWorth }) =>
        !isGTE(metricsPre.shareWorth.numerator, shareWorth.numerator),
      'share worth numerator increases from deposit',
      { log },
    ),
  );

  const { useChain } = t.context;
  const queryClient = makeQueryClient(
    await useChain('agoric').getRestEndpoint(),
  );

  await t.notThrowsAsync(() =>
    retryUntilCondition(
      () => queryClient.queryBalance(wallets['lp'], 'ufastlp'),
      ({ balance }) => isGTE(toAmt(FastLP, balance), want.PoolShare),
      'lp has pool shares',
      { log },
    ),
  );
});

test.serial('reconfigure: fix noble ICA', async t => {
  const { startContract, commonBuilderOpts } = t.context;
  const builder =
    '../packages/builders/scripts/fast-usdc/fast-usdc-reconfigure.build.js';

  const chainInfo = JSON.parse(commonBuilderOpts.chainInfo) as Record<
    string,
    CosmosChainInfo
  >;
  const { chainId: nobleChainId } = chainInfo.noble;
  const agoricToNoble = chainInfo.agoric.connections?.[nobleChainId];

  await startContract(
    contractName,
    builder,
    { agoricToNoble: JSON.stringify(agoricToNoble) },
    { skipInstanceCheck: true },
  );

  const { vstorageClient, retryUntilCondition } = t.context;

  await retryUntilCondition(
    () => fastLPQ(vstorageClient).info(),
    info => 'nobleICA' in info,
    `${contractName} nobleICA is available`,
  );
});

const advanceAndSettleScenario = test.macro({
  title: (_, mintAmt: bigint, eudChain: string) =>
    `advance ${mintAmt} uusdc to ${eudChain} and settle`,
  exec: async (t, mintAmt: bigint, eudChain: string) => {
    const {
      api,
      assertTxStatus,
      getUsdcDenom,
      makeFakeEvidence,
      nobleTools,
      nobleAgoricChannelId,
      retryUntilCondition,
      txOracles,
      useChain,
      vstorageClient,
    } = t.context;

    // EUD wallet on the specified chain
    const eudWallet = await createWallet(
      useChain(eudChain).chain.bech32_prefix,
    );
    const EUD = (await eudWallet.getAccounts())[0].address;
    t.log(`EUD wallet created: ${EUD}`);

    // parameterize agoric address
    const { settlementAccount } = await vstorageClient.queryData(
      `published.${contractName}`,
    );
    t.log('settlementAccount address', settlementAccount);

    const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
    t.log('recipientAddress', recipientAddress);

    // register forwarding address on noble
    const txRes = nobleTools.registerForwardingAcct(
      nobleAgoricChannelId,
      recipientAddress,
    );
    t.is(txRes?.code, 0, 'registered forwarding account');

    const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
      nobleAgoricChannelId,
      recipientAddress,
    );
    t.log('got forwardingAddress', userForwardingAddr);

    const evidence = makeFakeEvidence(
      mintAmt,
      userForwardingAddr,
      recipientAddress,
    );

    log('User initiates EVM burn:', evidence.txHash);
    const { block: initialBlock } = await api.queryBlock();
    console.time(`UX->${eudChain}`);
    console.timeLog(
      `UX->${eudChain}`,
      'initial block',
      initialBlock.header.height,
      initialBlock.header.time,
    );

    // submit evidences
    await Promise.all(
      txOracles.map(async o => {
        const { block } = await o.submit(evidence);
        console.timeLog(`UX->${eudChain}`, o.getName(), block);
      }),
    );
    console.timeLog(`UX->${eudChain}`, 'submitted x', txOracles.length);

    const queryClient = makeQueryClient(
      await useChain(eudChain).getRestEndpoint(),
    );

    let finalBlock;
    await t.notThrowsAsync(async () => {
      const q = await retryUntilCondition(
        () => queryClient.queryBalance(EUD, getUsdcDenom(eudChain)),
        ({ balance }) => {
          if (!balance) return false; // retry
          const value = BigInt(balance.amount);
          if (value >= mintAmt) {
            throw Error(`no fees were deducted: ${value} >= ${mintAmt}`);
          }
          if (value === 0n) return false; // retry
          t.log('advance done', value, 'uusdc');
          return true;
        },
        `${EUD} advance available from fast-usdc`,
        // this resolves quickly, so _decrease_ the interval so the timing is more apparent
        { retryIntervalMs: 500, maxRetries: 20 },
      );
      console.timeLog(`UX->${eudChain}`, 'rxd', q.balance?.amount);
      ({ block: finalBlock } = await api.queryBlock());
      console.timeLog(
        `UX->${eudChain}`,
        'final block',
        finalBlock.header.height,
        finalBlock.header.time,
      );
    });
    console.timeEnd(`UX->${eudChain}`);
    const blockDur =
      Number(finalBlock.header.height) - Number(initialBlock.header.height);
    const MAIN_BLOCK_SECS = 7;
    const MAIN_MAX_DUR = 120; // product requirement: 2 min
    const MARGIN_OF_ERROR = 0.2;
    const mainWallClockEstimate = blockDur * MAIN_BLOCK_SECS;
    t.log({
      initialHeight: initialBlock.header.height,
      finalHeight: finalBlock.header.height,
      blockDur,
      mainWallClockEstimate,
    });
    t.true(mainWallClockEstimate * (1 + MARGIN_OF_ERROR) <= MAIN_MAX_DUR);

    await assertTxStatus(evidence.txHash, 'ADVANCED');
    log('Advance completed, waiting for mint...');

    nobleTools.mockCctpMint(mintAmt, userForwardingAddr);
    await t.notThrowsAsync(() =>
      retryUntilCondition(
        () => fastLPQ(vstorageClient).metrics(),
        ({ encumberedBalance }) =>
          encumberedBalance && isEmpty(encumberedBalance),
        'encumberedBalance returns to 0',
      ),
    );

    await assertTxStatus(evidence.txHash, 'DISBURSED');
  },
});

test.serial(advanceAndSettleScenario, LP_DEPOSIT_AMOUNT / 4n, 'osmosis');
test.serial(advanceAndSettleScenario, LP_DEPOSIT_AMOUNT / 8n, 'noble');
test.serial(advanceAndSettleScenario, LP_DEPOSIT_AMOUNT / 5n, 'agoric');

test.serial('advance failed', async t => {
  const mintAmt = LP_DEPOSIT_AMOUNT / 10n;
  const {
    assertTxStatus,
    makeFakeEvidence,
    nobleTools,
    nobleAgoricChannelId,
    txOracles,
    vstorageClient,
  } = t.context;

  // EUD wallet on the specified chain
  const eudWallet = await createWallet('unreachable');
  const EUD = (await eudWallet.getAccounts())[0].address;
  t.log(`EUD wallet created: ${EUD}`);

  // parameterize agoric address
  const { settlementAccount } = await vstorageClient.queryData(
    `published.${contractName}`,
  );
  t.log('settlementAccount address', settlementAccount);

  const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
  t.log('recipientAddress', recipientAddress);

  // register forwarding address on noble
  const txRes = nobleTools.registerForwardingAcct(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.is(txRes?.code, 0, 'registered forwarding account');

  const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.log('got forwardingAddress', userForwardingAddr);

  const evidence = makeFakeEvidence(
    mintAmt,
    userForwardingAddr,
    recipientAddress,
  );

  t.log('User initiates EVM burn:', evidence.txHash);
  // submit evidences
  await Promise.all(txOracles.map(async o => o.submit(evidence)));

  await assertTxStatus(evidence.txHash, 'ADVANCE_FAILED');

  nobleTools.mockCctpMint(mintAmt, userForwardingAddr);

  await assertTxStatus(evidence.txHash, 'FORWARD_FAILED');
});

test.serial('lp withdraws', async t => {
  const {
    lpUser,
    retryUntilCondition,
    useChain,
    usdcDenom,
    vstorageClient,
    wallets,
  } = t.context;
  const queryClient = makeQueryClient(
    await useChain('agoric').getRestEndpoint(),
  );
  const lpDoOffer = makeDoOffer(lpUser);
  const { FastLP } = await agoricNamesQ(vstorageClient).brands('nat');
  t.log('FastLP brand', FastLP);

  const metricsPre = await fastLPQ(vstorageClient).metrics();

  const { balance: lpCoins } = await queryClient.queryBalance(
    wallets['lp'],
    'ufastlp',
  );
  const give = { PoolShare: toAmt(FastLP, lpCoins) };
  t.log('give', give, lpCoins);

  const { balance: usdcCoinsPre } = await queryClient.queryBalance(
    wallets['lp'],
    usdcDenom,
  );
  t.log('usdc coins pre', usdcCoinsPre);

  const want = { USDC: multiplyBy(give.PoolShare, metricsPre.shareWorth) };
  t.log('want', want);

  const proposal: USDCProposalShapes['withdraw'] = harden({ give, want });
  await lpDoOffer({
    id: `lp-withdraw-${Date.now()}`,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeWithdrawInvitation']],
    },
    proposal,
  });

  await t.notThrowsAsync(() =>
    retryUntilCondition(
      () => queryClient.queryBalance(wallets['lp'], 'ufastlp'),
      ({ balance }) => isEmpty(toAmt(FastLP, balance)),
      'lp no longer has pool shares',
      { log },
    ),
  );

  const USDC = want.USDC.brand;
  await t.notThrowsAsync(() =>
    retryUntilCondition(
      () => queryClient.queryBalance(wallets['lp'], usdcDenom),
      ({ balance }) =>
        !isGTE(
          make(USDC, LP_DEPOSIT_AMOUNT),
          subtract(toAmt(USDC, balance), toAmt(USDC, usdcCoinsPre)),
        ),
      "lp's USDC balance increases",
      { log },
    ),
  );
});

test.serial('distribute FastUSDC contract fees', async t => {
  const io = t.context;
  const queryClient = makeQueryClient(
    await io.useChain('agoric').getRestEndpoint(),
  );
  const builder =
    '../packages/builders/scripts/fast-usdc/fast-usdc-fees.build.js';

  const opts = {
    destinationAddress: io.wallets['feeDest'],
    feePortion: 0.25,
  };
  t.log('build, run proposal to distribute fees', opts);
  await io.deployBuilder(builder, {
    ...opts,
    feePortion: `${opts.feePortion}`,
  });

  const { balance } = await io.retryUntilCondition(
    () => queryClient.queryBalance(opts.destinationAddress, io.usdcDenom),
    ({ balance }) => !!balance && BigInt(balance.amount) > 0n,
    `fees received at ${opts.destinationAddress}`,
  );
  t.log('fees received', balance);
  t.truthy(balance?.amount);
});

test.serial('insufficient LP funds; forward path', async t => {
  const eudChain = 'osmosis';
  const mintAmt = LP_DEPOSIT_AMOUNT * 2n;
  const {
    assertAmtForwarded,
    assertTxStatus,
    makeFakeEvidence,
    nobleTools,
    nobleAgoricChannelId,
    txOracles,
    useChain,
    vstorageClient,
  } = t.context;

  // EUD wallet on the specified chain
  const eudWallet = await createWallet(useChain(eudChain).chain.bech32_prefix);
  const EUD = (await eudWallet.getAccounts())[0].address;
  t.log(`EUD wallet created: ${EUD}`);

  // parameterize agoric address
  const { settlementAccount } = await vstorageClient.queryData(
    `published.${contractName}`,
  );
  t.log('settlementAccount address', settlementAccount);

  const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
  t.log('recipientAddress', recipientAddress);

  // register forwarding address on noble
  const txRes = nobleTools.registerForwardingAcct(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.is(txRes?.code, 0, 'registered forwarding account');

  const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.log('got forwardingAddress', userForwardingAddr);

  const evidence = makeFakeEvidence(
    mintAmt,
    userForwardingAddr,
    recipientAddress,
  );

  t.log('User initiates EVM burn:', evidence.txHash);
  // submit evidences
  await Promise.all(txOracles.map(async o => o.submit(evidence)));

  const queryClient = makeQueryClient(
    await useChain(eudChain).getRestEndpoint(),
  );

  await assertTxStatus(evidence.txHash, 'ADVANCE_SKIPPED');

  nobleTools.mockCctpMint(mintAmt, userForwardingAddr);

  await assertTxStatus(evidence.txHash, 'FORWARDED');
  await assertAmtForwarded(queryClient, EUD, eudChain, mintAmt);
});

test.serial('minted before observed; forward path', async t => {
  const eudChain = 'osmosis';
  const mintAmt = LP_DEPOSIT_AMOUNT / 10n;
  const {
    assertAmtForwarded,
    assertTxStatus,
    makeFakeEvidence,
    nobleTools,
    nobleAgoricChannelId,
    txOracles,
    useChain,
    vstorageClient,
  } = t.context;

  // EUD wallet on the specified chain
  const eudWallet = await createWallet(useChain(eudChain).chain.bech32_prefix);
  const EUD = (await eudWallet.getAccounts())[0].address;
  t.log(`EUD wallet created: ${EUD}`);

  // parameterize agoric address
  const { settlementAccount } = await vstorageClient.queryData(
    `published.${contractName}`,
  );
  t.log('settlementAccount address', settlementAccount);

  const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
  t.log('recipientAddress', recipientAddress);

  // register forwarding address on noble
  const txRes = nobleTools.registerForwardingAcct(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.is(txRes?.code, 0, 'registered forwarding account');

  const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.log('got forwardingAddress', userForwardingAddr);

  const evidence = makeFakeEvidence(
    mintAmt,
    userForwardingAddr,
    recipientAddress,
  );

  const queryClient = makeQueryClient(
    await useChain(eudChain).getRestEndpoint(),
  );

  t.log(`UX->${eudChain}`, 'minting before evidence observed');
  nobleTools.mockCctpMint(mintAmt, userForwardingAddr);
  // Wait for mint to complete before submitting evidence
  await sleep(5000, { log: t.log, setTimeout });

  // submit evidences
  await Promise.all(txOracles.map(o => o.submit(evidence)));
  t.log(`UX->${eudChain}`, 'submitted x', txOracles.length);

  await assertTxStatus(evidence.txHash, 'FORWARDED');
  await assertAmtForwarded(queryClient, EUD, eudChain, mintAmt);
});

test.serial('insufficient LP funds and forward failed', async t => {
  const mintAmt = LP_DEPOSIT_AMOUNT * 2n;
  const {
    api,
    assertTxStatus,
    getUsdcDenom,
    makeFakeEvidence,
    nobleTools,
    nobleAgoricChannelId,
    txOracles,
    vstorageClient,
  } = t.context;

  // EUD wallet on the specified chain
  const eudWallet = await createWallet('invalideud');
  const EUD = (await eudWallet.getAccounts())[0].address;
  t.log(`EUD wallet created: ${EUD}`);

  // parameterize agoric address
  const { settlementAccount } = await vstorageClient.queryData(
    `published.${contractName}`,
  );
  t.log('settlementAccount address', settlementAccount);

  const querySettlementAccountBalance = async () =>
    (await api.queryBalance(settlementAccount, getUsdcDenom('agoric'))).balance;
  const startingSettlementBalance = await querySettlementAccountBalance();
  t.log(
    'starting settlementAccount balance',
    startingSettlementBalance?.amount,
    startingSettlementBalance?.denom,
  );

  const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
  t.log('recipientAddress', recipientAddress);

  // register forwarding address on noble
  const txRes = nobleTools.registerForwardingAcct(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.is(txRes?.code, 0, 'registered forwarding account');

  const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
    nobleAgoricChannelId,
    recipientAddress,
  );
  t.log('got forwardingAddress', userForwardingAddr);

  const evidence = makeFakeEvidence(
    mintAmt,
    userForwardingAddr,
    recipientAddress,
  );

  // submit evidences
  await Promise.all(txOracles.map(async o => o.submit(evidence)));

  await assertTxStatus(evidence.txHash, 'ADVANCE_SKIPPED');

  nobleTools.mockCctpMint(mintAmt, userForwardingAddr);

  await assertTxStatus(evidence.txHash, 'FORWARD_FAILED');

  const endingSettlementAccountBalance = await querySettlementAccountBalance();
  t.log(
    'ending settlementAccount balance',
    endingSettlementAccountBalance?.amount,
    endingSettlementAccountBalance?.denom,
  );
  t.is(
    BigInt(endingSettlementAccountBalance?.amount ?? '0'),
    BigInt(startingSettlementBalance?.amount ?? '0') + mintAmt,
  );
});

test.todo('mint while Advancing; still Disbursed');
