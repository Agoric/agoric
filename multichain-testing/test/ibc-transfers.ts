import anyTest from '@endo/ses-ava/prepare-endo.js';
import { execFileSync } from 'node:child_process';
import type { TestFn, ExecutionContext } from 'ava';
import { commonSetup, type SetupContext } from './support.js';
import { createWallet, generateMnemonic } from '../tools/wallet.js';
import { makeQueryClient } from '../tools/query.js';
import { makeAgd, type Agd } from '../tools/agd-lib.js';
import starshipChainInfo from '../starship-chain-info.js';
import type { ForwardInfo } from '@agoric/orchestration';
import { sleep } from '../tools/sleep.js';
import { objectMap } from '@endo/patterns';

const test = anyTest as TestFn<SetupContext>;

test.before(async t => {
  t.context = await commonSetup(t);
});

const queryStrings = {
  msgReceivePacket: {
    agoric: ['--events', 'message.action=/ibc.core.channel.v1.MsgRecvPacket'],
    cosmos: ['--query', "message.action='/ibc.core.channel.v1.MsgRecvPacket'"],
  },
  msgAcknowledgement: {
    agoric: [
      '--events',
      'message.action=/ibc.core.channel.v1.MsgAcknowledgement',
    ],
    cosmos: [
      '--query',
      "message.action='/ibc.core.channel.v1.MsgAcknowledgement'",
    ],
  },
};

// use this on osmosis, cosmoshub as our account name in the keyring
const keyName = 'testuser';

const fundRemote = async (
  t: ExecutionContext<SetupContext>,
  {
    srcChainName,
    destChainName,
    acctAddr,
    qty,
    denom,
  }: {
    srcChainName: string;
    destChainName: string;
    acctAddr: string;
    qty: number;
    denom: string;
  },
) => {
  const { agd, retryUntilCondition, useChain } = t.context;
  const destChainid = useChain(destChainName).chain.chain_id;
  const srcChainId = useChain(srcChainName).chain.chain_id;

  const agoricToOsmosis =
    starshipChainInfo[srcChainName].connections[destChainid].transferChannel;
  t.assert(agoricToOsmosis.channelId);
  const amount = `${qty}${denom}`;
  // agd tx ibc-transfer transfer [src-port] [src-channel] [receiver] [amount] [flags]
  const fundInitial = await agd.tx(
    [
      'ibc-transfer',
      'transfer',
      'transfer',
      agoricToOsmosis.channelId,
      acctAddr,
      amount,
    ],
    {
      chainId: srcChainId,
      from: 'faucet',
      yes: true,
    },
  );
  t.is(fundInitial?.code, 0);
  t.log('Success. TxHash:', fundInitial?.txhash);

  const queryClient = makeQueryClient(
    await useChain(destChainName).getRestEndpoint(),
  );
  const { balances } = await retryUntilCondition(
    () => queryClient.queryBalances(acctAddr),
    ({ balances }) => !!balances.find(x => x.denom.startsWith('ibc/')),
    `${acctAddr} received bld from agoric`,
  );

  t.log('amtOnDest', `${qty}${balances[0].denom}`);
  return { denom: balances[0].denom };
};

const setupSourceWallet = async (
  t: ExecutionContext<SetupContext>,
  { chainName }: { chainName: string },
) => {
  const { retryUntilCondition, useChain } = t.context;

  const chaind = makeAgd({ execFileSync }).withOpts({
    keyringBackend: 'test',
    chainName: chainName,
    broadcastMode: 'sync',
  });
  try {
    chaind.keys.delete(keyName);
  } catch {
    /* key already deleted */
  }
  chaind.keys.add(keyName, generateMnemonic());
  const acctAddr = chaind.keys.showAddress(keyName);
  t.assert(acctAddr);
  t.log('acctAddr', acctAddr);
  // give gas funds to osmosis wallet so it can send tx
  await useChain(chainName).creditFromFaucet(acctAddr);

  const queryClient = makeQueryClient(
    await useChain(chainName).getRestEndpoint(),
  );

  await retryUntilCondition(
    () => queryClient.queryBalances(acctAddr),
    ({ balances }) => !!balances.length,
    `${acctAddr} received funds from faucet`,
  );

  return {
    acctAddr,
    chaind,
  };
};

type QueryRes = { total_count: string; txs: object[] };
const queryPackets = async (binaries: Record<string, Agd>) => {
  const results: Record<string, { recvs: QueryRes; acks: QueryRes }> = {};
  for (const [name, chaind] of Object.entries(binaries)) {
    // perhaps the different is pre/post v0.50 queries?
    const queryType = name === 'agd' ? 'agoric' : 'cosmos';
    const recvs = await chaind.query([
      'txs',
      ...queryStrings.msgReceivePacket[queryType],
    ]);
    const acks = await chaind.query([
      'txs',
      ...queryStrings.msgAcknowledgement[queryType],
    ]);
    results[name] = {
      recvs,
      acks,
    };
  }
  return results;
};

type ChainPacketCounts = Record<
  string,
  {
    recvs: number;
    acks: number;
  }
>;

const recordPackets = async (
  binaries: Record<string, Agd>,
  iteration: `q${number}`,
): Promise<ChainPacketCounts> => {
  const q = await queryPackets(binaries);
  const counts = objectMap(q, val => ({
    recvs: Number(val.recvs.total_count),
    acks: Number(val.acks.total_count),
  }));
  console.log(`${iteration} counts`, counts);
  return counts;
};

const diffPacketCounts = (
  current: ChainPacketCounts,
  previous: ChainPacketCounts,
): ChainPacketCounts => {
  return objectMap(current, (val, key) => ({
    recvs: val.recvs - previous[key].recvs,
    acks: val.acks - previous[key].acks,
  }));
};

test('pfm: osmosis -> agoric -> cosmoshub', async t => {
  const { agd, retryUntilCondition, useChain } = t.context;
  const { acctAddr: osmosisAddr, chaind: osmosisd } = await setupSourceWallet(
    t,
    {
      chainName: 'osmosis',
    },
  );

  const gaiad = makeAgd({ execFileSync }).withOpts({
    chainName: 'cosmoshub',
  });
  const binaries = {
    osmosisd,
    agd,
    gaiad,
  };

  await sleep(10_000); // wait for acks
  const q0 = await recordPackets(binaries, 'q0');

  const { denom: denomOnOsmosis } = await fundRemote(t, {
    acctAddr: osmosisAddr,
    destChainName: 'osmosis',
    srcChainName: 'agoric',
    qty: 100,
    denom: 'ubld',
  });

  await sleep(10_000); // wait for acks
  const q1 = await recordPackets(binaries, 'q1');
  const p1Diff = diffPacketCounts(q1, q0);
  t.like(
    p1Diff,
    {
      osmosisd: { recvs: 1, acks: 0 },
      agd: { recvs: 0, acks: 1 },
      gaiad: { recvs: 0, acks: 0 },
    },
    'Initial transfer packet counts incorrect',
  );

  const cosmosChainId = useChain('cosmoshub').chain.chain_id;
  const agoricChainId = useChain('agoric').chain.chain_id;
  const osmosisChainId = useChain('osmosis').chain.chain_id;

  const cosmosWallet = await createWallet('cosmos');
  const cosmosAddr = (await cosmosWallet.getAccounts())[0].address;
  t.log('Made cosmos wallet:', cosmosAddr);

  const osmosisToAgoric =
    starshipChainInfo.osmosis.connections[agoricChainId].transferChannel;
  const agoricToCosmos =
    starshipChainInfo.agoric.connections[cosmosChainId].transferChannel;
  const forwardInfo: ForwardInfo = {
    forward: {
      channel: agoricToCosmos.channelId,
      port: 'transfer',
      receiver: cosmosAddr,
      retries: 2,
      timeout: '1m',
    },
  };

  // intermediary receiver for PFM transfer
  const agoricAddr = (await (await createWallet('agoric')).getAccounts())[0]
    .address;

  // agd tx ibc-transfer transfer [src-port] [src-channel] [receiver] [amount] [flags]
  const pfmThroughAgoric = await osmosisd.tx(
    [
      'ibc-transfer',
      'transfer',
      'transfer',
      osmosisToAgoric.channelId,
      agoricAddr,
      `50${denomOnOsmosis}`,
      '--memo',
      `${JSON.stringify(forwardInfo)}`,
      // consider --packet-timeout-timestamp. default is 10mins
    ],
    {
      chainId: osmosisChainId,
      from: keyName,
      yes: true,
      fees: '200000uosmo',
    },
  );
  t.is(pfmThroughAgoric?.code, 0);
  t.log('PFM Transfer success. Tx:', pfmThroughAgoric?.txhash);

  const cosmosQueryClient = makeQueryClient(
    await useChain('cosmoshub').getRestEndpoint(),
  );

  // TODO, wait until these events are observed instead of sleeping
  await sleep(18_000); // wait for acks
  const q2 = await recordPackets(binaries, 'q2');

  const p2Diff = diffPacketCounts(q2, q1);
  t.deepEqual(
    p2Diff,
    {
      osmosisd: { recvs: 0, acks: 1 }, // Should receive ack from Agoric
      agd: { recvs: 1, acks: 1 }, // Receives from Osmosis, gets ack from Cosmos
      gaiad: { recvs: 1, acks: 0 }, // Receives forwarded packet
    },
    'PFM transfer packet counts incorrect',
  );

  const { balances: cosmosBalances } = await retryUntilCondition(
    () => cosmosQueryClient.queryBalances(cosmosAddr),
    ({ balances }) => !!balances.length,
    `${cosmosAddr} received bld from osmosis`,
  );
  t.log('cosmosBalances', cosmosBalances);

  osmosisd.keys.delete(keyName);
});
