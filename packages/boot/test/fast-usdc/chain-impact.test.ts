import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { ExecutionContext, TestFn } from 'ava';

import {
  encodeAddressHook,
  encodeBech32,
} from '@agoric/cosmic-proto/address-hooks.js';
import type { CoreEvalSDKType } from '@agoric/cosmic-proto/agoric/swingset/swingset.js';
import type {
  CctpTxEvidence,
  ContractRecord,
  EvmAddress,
  NobleAddress,
  PoolMetrics,
} from '@agoric/fast-usdc';
import { Offers } from '@agoric/fast-usdc/src/clientSupport.js';
import { configurations } from '@agoric/fast-usdc/src/utils/deploy-config.js';
import { BridgeId } from '@agoric/internal';
import { defaultMarshaller } from '@agoric/internal/src/storage-test-utils.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { buildVTransferEvent } from '@agoric/orchestration/tools/ibc-mocks.js';
import type { OfferSpec } from '@agoric/smart-wallet/src/offers.js';
import type { SnapStoreDebug } from '@agoric/swing-store';
import { makeArchiveSnapshot } from '@agoric/swing-store';
import type { SwingsetController } from '@agoric/swingset-vat/src/controller/controller.js';
import type { BridgeHandler, IBCChannelID } from '@agoric/vats';
import { makePromiseKit } from '@endo/promise-kit';
import { readFile, writeFile } from 'fs/promises';
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import tmp from 'tmp';
import { AckBehavior, makeSwingsetHarness } from '../../tools/supports.js';
import {
  makeWalletFactoryContext,
  type WalletFactoryTestContext,
} from '../bootstrapTests/walletFactory.js';

const nodeRequire = createRequire(import.meta.url);

const test: TestFn<
  WalletFactoryTestContext & {
    harness: ReturnType<typeof makeSwingsetHarness>;
    oracles: TxOracle[];
    toNoble: MockChannel;
    fromNoble: IBCChannelID;
    observations: Array<{ id: unknown } & Record<string, unknown>>;
    writeStats?: (txt: string) => Promise<void>;
    doCoreEval: (specifier: string) => Promise<void>;
  }
> = anyTest;

type SmartWallet = Awaited<
  ReturnType<
    WalletFactoryTestContext['walletFactoryDriver']['provideSmartWallet']
  >
>;

const config = '@agoric/vm-config/decentral-itest-fast-usdc-config.json';
const nobleAgoricChannelId = 'channel-21';

const range = (n: Number) => Array.from(Array(n).keys());
const prefixedRange = (n: Number, pfx: string) =>
  range(n).map(ix => `${pfx}${ix}`);

test.before(async t => {
  const { env } = globalThis.process;
  const fsPowers = { fs, path, tmp };
  const {
    SLOGFILE: slogFile,
    SWINGSET_WORKER_TYPE: defaultManagerType = 'xs-worker', // or 'local',
    STATS_FILE,
    SNAPSHOT_DIR: snapshotDir,
  } = env;
  const harness = makeSwingsetHarness();
  const ctx = await makeWalletFactoryContext(t, config, {
    slogFile,
    defaultManagerType,
    harness,
    ...(snapshotDir
      ? { archiveSnapshot: makeArchiveSnapshot(snapshotDir, fsPowers) }
      : {}),
  });
  const oracles = Object.entries(configurations.MAINNET.oracles).map(
    ([name, addr]) => makeTxOracle(ctx, name, addr),
  );

  const writeStats = STATS_FILE
    ? (txt: string) => writeFile(STATS_FILE, txt)
    : undefined;
  const toNoble = makeIBCChannel(ctx.bridgeUtils, 'channel-62');
  const fromNoble = 'channel-21';

  const { log } = console;
  const doCoreEval = async (specifier: string) => {
    const { EV } = ctx.runUtils;
    const script = await readFile(nodeRequire.resolve(specifier), 'utf-8');
    const eval0: CoreEvalSDKType = { js_code: script, json_permits: 'true' };
    log('executing proposal');
    const bridgeMessage = { type: 'CORE_EVAL', evals: [eval0] };
    const coreEvalBridgeHandler: BridgeHandler = await EV.vat(
      'bootstrap',
    ).consumeItem('coreEvalBridgeHandler');
    await EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);
    log(`proposal executed`);
  };

  t.context = {
    ...ctx,
    harness,
    oracles,
    observations: [],
    writeStats,
    fromNoble,
    toNoble,
    doCoreEval,
  };
});
test.after.always(t => t.context.shutdown?.());

const makeTxOracle = (
  ctx: WalletFactoryTestContext,
  name: string,
  addr: string,
) => {
  const { agoricNamesRemotes, walletFactoryDriver: wfd } = ctx;
  const walletSync = makePromiseKit<SmartWallet>();

  return harden({
    async provision() {
      walletSync.resolve(wfd.provideSmartWallet(addr));
      return walletSync.promise;
    },
    async claim() {
      const wallet = await walletSync.promise;
      await wallet.sendOffer({
        id: 'claim-oracle-invitation',
        invitationSpec: {
          source: 'purse',
          instance: agoricNamesRemotes.instance.fastUsdc,
          description: 'oracle operator invitation',
        },
        proposal: {},
      });
    },
    async submit(evidence: CctpTxEvidence, nonce: Number) {
      const wallet = await walletSync.promise;
      const it: OfferSpec = {
        id: `submit-evidence-${nonce}`,
        invitationSpec: {
          source: 'continuing',
          previousOffer: 'claim-oracle-invitation',
          invitationMakerName: 'SubmitEvidence',
          invitationArgs: [evidence],
        },
        proposal: {},
      };
      await wallet.sendOffer(it);
      return it;
    },
  });
};
type TxOracle = ReturnType<typeof makeTxOracle>;

const makeFastUsdcQuery = (ctx: WalletFactoryTestContext) => {
  const { storage } = ctx;
  return harden({
    metrics: () => {
      const metrics: PoolMetrics = defaultMarshaller.fromCapData(
        JSON.parse(storage.getValues('published.fastUsdc.poolMetrics').at(-1)!),
      );
      return metrics;
    },
    contractRecord: () => {
      const { storage } = ctx;
      const values = storage.getValues('published.fastUsdc');
      const it: ContractRecord = JSON.parse(values.at(-1)!);
      return it;
    },
    txStatus: (txHash: string) =>
      storage
        .getValues(`published.fastUsdc.txns.${txHash}`)
        .map(txt => defaultMarshaller.fromCapData(JSON.parse(txt))),
  });
};

const makeLP = (ctx: WalletFactoryTestContext, addr: string) => {
  const { agoricNamesRemotes, walletFactoryDriver: wfd } = ctx;
  const lpP = wfd.provideSmartWallet(addr);

  const pollOffer = async (lp: SmartWallet, id: string) => {
    for (;;) {
      const info = lp.getLatestUpdateRecord();
      if (info.updated !== 'offerStatus') continue;
      if (info.status.id !== id) continue;
      if (info.status.error) throw Error(info.status.error);
      if (info.status.payouts) return info.status;
      await eventLoopIteration();
    }
  };

  return harden({
    async deposit(value: bigint, nonce: number) {
      const offerId = `lp-deposit-${nonce}`;
      const offerSpec = Offers.fastUsdc.Deposit(agoricNamesRemotes, {
        offerId,
        fastLPAmount: BigInt(Math.round(Number(value) * 0.6)), // XXX use poolMetrics?,
        usdcAmount: value,
      });
      const lp = await lpP;
      await lp.sendOffer(offerSpec);
      await pollOffer(lp, offerId);
      return offerSpec;
    },
    async withdraw(value: bigint, nonce: number) {
      const offerId = `lp-withdraw-${nonce}`;
      const offerSpec = Offers.fastUsdc.Withdraw(agoricNamesRemotes, {
        offerId,
        fastLPAmount: value,
        usdcAmount: BigInt(Math.round(Number(value) * 0.9)), // XXX use poolMetrics?
      });
      const lp = await lpP;
      await lp.sendOffer(offerSpec);
      await pollOffer(lp, offerId);
      return offerSpec;
    },
  });
};

const makeCctp = (
  ctx: WalletFactoryTestContext,
  forwardingChannel: IBCChannelID,
  destinationChannel: IBCChannelID,
) => {
  const { runInbound } = ctx.bridgeUtils;

  return harden({
    depositForBurn(
      amount: bigint,
      sender: EvmAddress,
      forwardingAddress: NobleAddress,
      nonce: number,
    ) {
      const hex1 = (nonce * 51).toString(16);
      const hex2 = (nonce * 73).toString(16);
      const txInfo: Omit<CctpTxEvidence, 'aux'> = harden({
        blockHash: `0x${hex2.repeat(64 / hex2.length)}`,
        blockNumber: 21037663n + BigInt(nonce),
        txHash: `0x${hex1.repeat(64 / hex1.length)}`,
        tx: { amount, forwardingAddress, sender },
        chainId: 42161,
      });
      return txInfo;
    },
    async mint(
      amount: bigint,
      sender: string,
      target: string,
      receiver: string,
    ) {
      // in due course, minted USDC arrives
      await runInbound(
        BridgeId.VTRANSFER,

        buildVTransferEvent({
          sequence: '1', // arbitrary; not used
          amount,
          denom: 'uusdc',
          sender,
          target,
          receiver,
          sourceChannel: forwardingChannel,
          destinationChannel,
        }),
      );
    },
  });
};

/**
 * https://github.com/noble-assets/forwarding/blob/main/types/account.go#L19
 *
 * @param channel
 * @param recipient
 * @param fallback
 */
const deriveNobleForwardingAddress = (
  channel: IBCChannelID,
  recipient: string,
  fallback: string,
) => {
  if (fallback) throw Error('not supported');
  const out: NobleAddress = `noble1${channel}${recipient.slice(-30)}`;
  return out;
};

const makeUA = (
  address: EvmAddress,
  settlementAccount: string,
  nobleAgoricChannelId: IBCChannelID,
  fastQ: ReturnType<typeof makeFastUsdcQuery>,
  cctp: ReturnType<typeof makeCctp>,
  oracles: TxOracle[],
) => {
  return harden({
    async advance(
      t: ExecutionContext,
      amount: bigint,
      EUD: string,
      nonce: number,
    ) {
      const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
      const forwardingAddress = deriveNobleForwardingAddress(
        nobleAgoricChannelId,
        recipientAddress,
        '',
      );
      const txInfo = cctp.depositForBurn(
        amount,
        address,
        forwardingAddress,
        nonce,
      );
      const evidence: CctpTxEvidence = {
        ...txInfo,
        aux: { forwardingChannel: nobleAgoricChannelId, recipientAddress },
      };

      // TODO: connect this to the CCTP contract?
      await Promise.all(oracles.map(o => o.submit(evidence, nonce)));

      t.like(fastQ.txStatus(evidence.txHash), [
        { status: 'OBSERVED' },
        { status: 'ADVANCING' },
      ]);

      return { recipientAddress, forwardingAddress, evidence };
    },
  });
};

const makeIBCChannel = (
  bridgeUtils: WalletFactoryTestContext['bridgeUtils'],
  sourceChannel: IBCChannelID,
) => {
  const { runInbound } = bridgeUtils;
  let sequence = 0;
  return harden({
    async ack(sender: string) {
      await runInbound(
        BridgeId.VTRANSFER,
        buildVTransferEvent({
          sender,
          target: sender,
          sourceChannel,
          sequence: `${(sequence += 1)}`,
        }),
      );
    },
  });
};
type MockChannel = ReturnType<typeof makeIBCChannel>;

const makeSimulation = async (
  ctx: WalletFactoryTestContext,
  toNoble: MockChannel,
  oracles: TxOracle[],
) => {
  const cctp = makeCctp(ctx, nobleAgoricChannelId, 'channel-62');

  const fastQ = makeFastUsdcQuery(ctx);
  const lps = range(3).map(ix =>
    makeLP(ctx, encodeBech32('agoric', [100, ix])),
  );
  const { settlementAccount, poolAccount } = fastQ.contractRecord();
  const users = prefixedRange(5, `0xFEED`).map(addr =>
    makeUA(
      addr as EvmAddress,
      settlementAccount,
      nobleAgoricChannelId,
      fastQ,
      cctp,
      oracles,
    ),
  );

  return harden({
    oracles,
    lps,
    users,
    async iteration(t: ExecutionContext, iter: number) {
      const lpIx = iter % lps.length;
      const lp = lps[lpIx];
      await lp.deposit(BigInt((lpIx + 1) * 2000) * 1_000_000n, iter);

      const {
        shareWorth: { numerator: poolBeforeAdvance },
      } = await fastQ.metrics();
      const part = Number(poolBeforeAdvance.value) / users.length;

      const who = iter % users.length;
      const webUI = users[who];
      const destAddr = encodeBech32('dydx', [1, 2, 3, who, iter]);
      const amount = BigInt(Math.round(part * (1 - who * 0.1)));

      const { recipientAddress, forwardingAddress, evidence } =
        await webUI.advance(t, amount, destAddr, iter * users.length + who);

      await toNoble.ack(poolAccount);
      await eventLoopIteration();

      // in due course, minted USDC arrives
      await cctp.mint(
        amount,
        forwardingAddress,
        settlementAccount,
        recipientAddress,
      );
      await eventLoopIteration();
      t.like(fastQ.txStatus(evidence.txHash), [
        { status: 'OBSERVED' },
        { status: 'ADVANCING' },
        { status: 'ADVANCED' },
        { status: 'DISBURSED' },
      ]);

      await eventLoopIteration();

      const beforeWithdraw = await fastQ.metrics();
      if (beforeWithdraw.encumberedBalance.value > 0n) {
        throw t.fail(`still encumbered: ${beforeWithdraw.encumberedBalance}`);
      }
      const partWd =
        Number(beforeWithdraw.shareWorth.numerator.value) / lps.length;
      // 0.8 to avoid: Withdrawal of X failed because the purse only contained Y
      const amountWd = BigInt(Math.round(partWd * (0.8 - lpIx * 0.1)));
      // XXX simulate failed withrawals?
      await lp.withdraw(amountWd, iter);
    },
  });
};

const getResourceUsageStats = (
  controller: SwingsetController,
  data: Map<string, string>,
) => {
  const stats = controller.getStats();
  const { promiseQueuesLength, kernelPromises, kernelObjects, clistEntries } =
    stats;

  const { size: vstorageEntries } = data;
  const { length: vstorageTotalSize } = JSON.stringify([...data.entries()]);
  const { length: vstorageFusdcSize } = JSON.stringify(
    [...data.entries()].filter(e => e[0].startsWith('published.fastUsdc')),
  );
  const { length: vstorageWalletSize } = JSON.stringify(
    [...data.entries()].filter(e => e[0].startsWith('published.wallet')),
  );

  return harden({
    promiseQueuesLength,
    kernelPromises,
    kernelObjects,
    clistEntries,
    vstorageEntries,
    vstorageTotalSize,
    vstorageFusdcSize,
    vstorageWalletSize,
  });
};

test.serial('access relevant kernel stats after bootstrap', async t => {
  const { controller, observations, storage } = t.context;
  const relevant = getResourceUsageStats(controller, storage.data);
  t.log('relevant kernel stats', relevant);
  t.truthy(relevant);
  observations.push({ id: 'post-boot', ...relevant });
});

test.serial(
  'access uncompressedSize of heap snapshots of vats (WIP)',
  async t => {
    const { controller, swingStore } = t.context;

    const snapStore = swingStore.internal
      .snapStore as unknown as SnapStoreDebug;

    await controller.reapAllVats(); // force GC
    await controller.run(); // clear any reactions
    const active: string[] = [];
    for (const snapshot of snapStore.listAllSnapshots()) {
      const { vatID, uncompressedSize } = snapshot;
      t.log({ vatID, uncompressedSize });
      t.log('TODO: filter by active', snapshot);
      active.push(vatID);
    }
    t.log('active vats', active);
    t.pass();
  },
);

test.serial('oracles provision before contract deployment', async t => {
  const { oracles } = t.context;
  const [watcher0] = await Promise.all(oracles.map(o => o.provision()));
  t.truthy(watcher0);

  const { controller, observations, storage } = t.context;
  observations.push({
    id: 'post-ocw-provision',
    ...getResourceUsageStats(controller, storage.data),
  });
});

test.serial('start-fast-usdc', async t => {
  const {
    agoricNamesRemotes,
    bridgeUtils,
    buildProposal,
    evalProposal,
    refreshAgoricNamesRemotes,
  } = t.context;

  // inbound `startChannelOpenInit` responses immediately.
  // needed since the Fusdc StartFn relies on an ICA being created
  bridgeUtils.setAckBehavior(
    BridgeId.DIBC,
    'startChannelOpenInit',
    AckBehavior.Immediate,
  );
  bridgeUtils.setBech32Prefix('noble');

  const materials = buildProposal(
    '@agoric/builders/scripts/fast-usdc/start-fast-usdc.build.js',
    ['--net', 'MAINNET'],
  );
  await evalProposal(materials);
  refreshAgoricNamesRemotes();
  t.truthy(agoricNamesRemotes.instance.fastUsdc);

  const { controller, observations, storage } = t.context;
  observations.push({
    id: 'post-start-fast-usdc',
    ...getResourceUsageStats(controller, storage.data),
  });
});

test.serial('oracles accept invitations', async t => {
  const { oracles } = t.context;
  await t.notThrowsAsync(Promise.all(oracles.map(o => o.claim())));

  const { controller, observations, storage } = t.context;
  observations.push({
    id: 'post-ocws-claim-invitations',
    ...getResourceUsageStats(controller, storage.data),
  });
});

test.skip('LP deposits (independent of iterations)', async t => {
  const fastQ = makeFastUsdcQuery(t.context);
  const lp = makeLP(t.context, 'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8');
  const { proposal, id } = await lp.deposit(150_000_000n, 123);

  const {
    shareWorth: { numerator: poolBalance },
  } = fastQ.metrics();
  t.true(poolBalance.value >= proposal.give.USDC.value);

  const { controller, observations, storage } = t.context;
  observations.push({
    id,
    kernel: getResourceUsageStats(controller, storage.data),
  });
});

test.skip('makes usdc advance, mint (independent of iterations)', async t => {
  const { oracles, toNoble } = t.context;
  const fastQ = makeFastUsdcQuery(t.context);
  const cctp = makeCctp(t.context, nobleAgoricChannelId, 'channel-62');

  const { settlementAccount, poolAccount } = fastQ.contractRecord();
  const webUI = makeUA(
    '0xDEADBEEF' as EvmAddress,
    settlementAccount,
    nobleAgoricChannelId,
    fastQ,
    cctp,
    oracles,
  );

  const destAddr = 'dydx1anything';
  const { recipientAddress, forwardingAddress, evidence } = await webUI.advance(
    t,
    15_000_000n,
    destAddr,
    100,
  );
  const amount = 15_000_000n;

  await toNoble.ack(poolAccount);
  await eventLoopIteration();

  const { controller, observations, storage } = t.context;
  observations.push({
    id: `post-advance`,
    ...getResourceUsageStats(controller, storage.data),
  });

  // in due course, minted USDC arrives
  await cctp.mint(
    amount,
    forwardingAddress,
    settlementAccount,
    recipientAddress,
  );
  await eventLoopIteration();
  t.like(fastQ.txStatus(evidence.txHash), [
    { status: 'OBSERVED' },
    { status: 'ADVANCING' },
    { status: 'ADVANCED' },
    { status: 'DISBURSED' },
  ]);
  observations.push({
    id: `post-mint`,
    ...getResourceUsageStats(controller, storage.data),
  });
});

test.skip('prune vstorage (independent of iterations)', async t => {
  const { doCoreEval, observations, controller, storage } = t.context;
  await doCoreEval('@agoric/fast-usdc/scripts/delete-completed-txs.js');
  observations.push({
    id: `post-prune`,
    ...getResourceUsageStats(controller, storage.data),
  });
  t.pass();
});

test.serial('iterate simulation several times', async t => {
  const { controller, observations, oracles, storage, toNoble } = t.context;
  const { doCoreEval, harness, swingStore } = t.context;
  const { updateNewCellBlockHeight } = storage;
  const sim = await makeSimulation(t.context, toNoble, oracles);

  await writeFile('kernel-0.json', JSON.stringify(controller.dump(), null, 2));

  harness.useRunPolicy(true); // start tracking computrons
  harness.resetRunPolicy(); // never mind computrons from bootstrap
  const snapStore = swingStore.internal.snapStore as unknown as SnapStoreDebug;

  for (const ix of range(9)) {
    updateNewCellBlockHeight(); // look at only the latest value written
    await sim.iteration(t, ix);

    const computrons = harness.totalComputronCount();
    const snapshots = [...snapStore.listAllSnapshots()];
    observations.push({
      id: `iter-${ix}`,
      time: Date.now(),
      computrons,
      snapshots,
      ...getResourceUsageStats(controller, storage.data),
    });
    harness.resetRunPolicy(); // stay under block budget

    // force GC and prune vstorage at regular intervals
    if (ix % 4 === 0) {
      await doCoreEval('@agoric/fast-usdc/scripts/delete-completed-txs.js');
      controller.reapAllVats();
      await controller.run();
      const { kernelTable } = controller.dump();

      observations.push({
        id: `post-prune-${ix}`,
        time: Date.now(),
        kernelTable,
        ...getResourceUsageStats(controller, storage.data),
      });
    }
  }

  await writeFile('kernel-1.json', JSON.stringify(controller.dump(), null, 2));
});

const stringifyBigint = (_p, v) => (typeof v === 'bigint' ? `${v}` : v);

test.serial('analyze observations', async t => {
  const { observations, writeStats } = t.context;
  if (writeStats) {
    const lines = observations.map(
      (o, ix) => JSON.stringify({ ix, ...o }, stringifyBigint) + '\n',
    );
    await writeStats(lines.join(''));
  }
  t.pass();
});
