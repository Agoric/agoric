import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { IBCMethod } from '@agoric/vats';
import {
  MsgTransfer,
  MsgTransferResponse,
} from '@agoric/cosmic-proto/ibc/applications/transfer/v1/tx.js';
import { SIMULATED_ERRORS } from '@agoric/vats/tools/fake-bridge.js';
import { commonSetup } from '../supports.js';
import type { AmountArg, ChainAddress } from '../../src/orchestration-api.js';
import { prepareMakeTestCOAKit } from './make-test-coa-kit.js';
import {
  buildMsgResponseString,
  buildTxPacketString,
  parseOutgoingTxPacket,
} from '../../tools/ibc-mocks.js';

type TestContext = Awaited<ReturnType<typeof commonSetup>>;

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async t => {
  t.context = await commonSetup(t);
});

test('CosmosOrchestrationAccount - send (to addr on same chain)', async t => {
  const {
    bootstrap,
    brands: { ist },
    utils: { inspectDibcBridge },
  } = t.context;
  const makeTestCOAKit = prepareMakeTestCOAKit(t, bootstrap);
  const account = await makeTestCOAKit();
  t.assert(account, 'account is returned');

  const toAddress: ChainAddress = {
    value: 'cosmos99test',
    chainId: 'cosmoshub-4',
    encoding: 'bech32',
  };

  // single send
  t.is(
    await E(account).send(toAddress, {
      value: 10n,
      denom: 'uatom',
    } as AmountArg),
    undefined,
  );

  // simulate timeout error
  await t.throwsAsync(
    E(account).send(toAddress, { value: 504n, denom: 'uatom' } as AmountArg),
    // TODO #9629 decode error messages
    { message: 'ABCI code: 5: error handling packet: see events for details' },
  );

  // ertp amounts not supported
  await t.throwsAsync(
    E(account).send(toAddress, ist.make(10n) as AmountArg),
    // TODO #9211 lookup denom from brand
    { message: 'Brands not currently supported.' },
  );

  // multi-send (sendAll)
  t.is(
    await E(account).sendAll(toAddress, [
      { value: 10n, denom: 'uatom' } as AmountArg,
      { value: 10n, denom: 'ibc/1234' } as AmountArg,
    ]),
    undefined,
  );

  const { bridgeDowncalls } = await inspectDibcBridge();

  t.is(
    bridgeDowncalls.filter(d => d.method === 'sendPacket').length,
    3,
    'sent 2 successful txs and 1 failed. 1 rejected before sending',
  );
});

test('CosmosOrchestrationAccount - transfer', async t => {
  const {
    brands: { ist },
    bootstrap,
    utils: { inspectDibcBridge },
    mocks: { ibcBridge },
  } = t.context;

  const mockIbcTransfer = {
    sourcePort: 'transfer',
    sourceChannel: 'channel-536',
    token: {
      denom: 'ibc/uusdchash',
      amount: '10',
    },
    sender: 'cosmos1test',
    receiver: 'noble1test',
    timeoutHeight: {
      revisionHeight: 0n,
      revisionNumber: 0n,
    },
    timeoutTimestamp: 300000000000n, // 5 mins in ns
    memo: '',
  };
  const buildMocks = () => {
    const toTransferTxPacket = (msg: MsgTransfer) =>
      buildTxPacketString([MsgTransfer.toProtoMsg(msg)]);

    const defaultTransfer = toTransferTxPacket(mockIbcTransfer);
    const customTimeoutHeight = toTransferTxPacket({
      ...mockIbcTransfer,
      timeoutHeight: {
        revisionHeight: 1000n,
        revisionNumber: 1n,
      },
      timeoutTimestamp: 0n,
    });
    const customTimeoutTimestamp = toTransferTxPacket({
      ...mockIbcTransfer,
      timeoutTimestamp: 999n,
    });
    const customTimeout = toTransferTxPacket({
      ...mockIbcTransfer,
      timeoutHeight: {
        revisionHeight: 5000n,
        revisionNumber: 5n,
      },
      timeoutTimestamp: 5000n,
    });
    const customMemo = toTransferTxPacket({
      ...mockIbcTransfer,
      memo: JSON.stringify({ custom: 'pfm memo' }),
    });

    const transferResp = buildMsgResponseString(MsgTransferResponse, {
      sequence: 0n,
    });
    return {
      [defaultTransfer]: transferResp,
      [customTimeoutHeight]: transferResp,
      [customTimeoutTimestamp]: transferResp,
      [customTimeout]: transferResp,
      [customMemo]: transferResp,
    };
  };
  ibcBridge.setMockAck(buildMocks());

  const getAndDecodeLatestPacket = async () => {
    await eventLoopIteration();
    const { bridgeDowncalls } = await inspectDibcBridge();
    const latest = bridgeDowncalls[
      bridgeDowncalls.length - 1
    ] as IBCMethod<'sendPacket'>;
    const { messages } = parseOutgoingTxPacket(latest.packet.data);
    return MsgTransfer.decode(messages[0].value);
  };

  t.log('Make account on cosmoshub');
  const makeTestCOAKit = prepareMakeTestCOAKit(t, bootstrap);
  const account = await makeTestCOAKit();

  t.log('Send tokens from cosmoshub to noble');
  const mockDestination: ChainAddress = {
    value: 'noble1test',
    chainId: 'noble-1',
    encoding: 'bech32',
  };
  const mockAmountArg: AmountArg = { value: 10n, denom: 'ibc/uusdchash' };
  const res = E(account).transfer(mockAmountArg, mockDestination);
  await eventLoopIteration();

  t.deepEqual(
    await getAndDecodeLatestPacket(),
    mockIbcTransfer,
    'outgoing transfer msg matches expected default mock',
  );
  t.is(await res, undefined, 'transfer returns undefined');

  t.log('transfer accepts custom memo');
  await E(account).transfer(mockAmountArg, mockDestination, {
    memo: JSON.stringify({ custom: 'pfm memo' }),
  });
  t.like(
    await getAndDecodeLatestPacket(),
    {
      memo: '{"custom":"pfm memo"}',
    },
    'accepts custom memo',
  );

  t.log('transfer accepts custom timeoutHeight');
  await E(account).transfer(mockAmountArg, mockDestination, {
    timeoutHeight: {
      revisionHeight: 1000n,
      revisionNumber: 1n,
    },
  });
  t.like(
    await getAndDecodeLatestPacket(),
    {
      timeoutHeight: {
        revisionHeight: 1000n,
        revisionNumber: 1n,
      },
      timeoutTimestamp: 0n,
    },
    "accepts custom timeoutHeight and doesn't set timeoutTimestamp",
  );

  t.log('transfer accepts custom timeoutTimestamp');
  await E(account).transfer(mockAmountArg, mockDestination, {
    timeoutTimestamp: 999n,
  });
  t.like(
    await getAndDecodeLatestPacket(),
    {
      timeoutTimestamp: 999n,
      timeoutHeight: {
        revisionHeight: 0n,
        revisionNumber: 0n,
      },
    },
    "accepts custom timeoutTimestamp and doesn't set timeoutHeight",
  );

  t.log('transfer accepts custom timeoutHeight and timeoutTimestamp');
  await E(account).transfer(mockAmountArg, mockDestination, {
    timeoutHeight: {
      revisionHeight: 5000n,
      revisionNumber: 5n,
    },
    timeoutTimestamp: 5000n,
  });
  t.like(
    await getAndDecodeLatestPacket(),
    {
      timeoutHeight: {
        revisionHeight: 5000n,
        revisionNumber: 5n,
      },
      timeoutTimestamp: 5000n,
    },
    'accepts custom timeoutHeight and timeoutTimestamp',
  );

  t.log('transfer throws if connection is not in its chainHub');
  await t.throwsAsync(
    E(account).transfer(mockAmountArg, {
      ...mockDestination,
      chainId: 'unknown-1',
    }),
    {
      message: 'connection not found: cosmoshub-4<->unknown-1',
    },
  );

  t.log("transfer doesn't support ERTP brands yet. see #9211");
  await t.throwsAsync(E(account).transfer(ist.make(10n), mockDestination), {
    message: 'Brands not currently supported.',
  });

  t.log('transfer timeout error recieved and handled from the bridge');
  await t.throwsAsync(
    E(account).transfer(
      { ...mockAmountArg, value: SIMULATED_ERRORS.TIMEOUT },
      mockDestination,
    ),
    {
      message: 'ABCI code: 5: error handling packet: see events for details',
    },
  );
  t.like(
    await getAndDecodeLatestPacket(),
    {
      token: {
        amount: String(SIMULATED_ERRORS.TIMEOUT),
      },
    },
    'timeout error received from the bridge',
  );
});

test('CosmosOrchestrationAccount - not yet implemented', async t => {
  const { bootstrap } = await commonSetup(t);
  const makeTestCOAKit = prepareMakeTestCOAKit(t, bootstrap);
  const account = await makeTestCOAKit();
  const mockAmountArg: AmountArg = { value: 10n, denom: 'uatom' };

  await t.throwsAsync(E(account).getBalances(), {
    message: 'not yet implemented',
  });
  await t.throwsAsync(E(account).transferSteps(mockAmountArg, null as any), {
    message: 'not yet implemented',
  });
  await t.throwsAsync(E(account).withdrawRewards(), {
    message: 'Not Implemented. Try using withdrawReward.',
  });
});
