import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import type { IBCMethod } from '@agoric/vats';
import {
  MsgTransfer,
  MsgTransferResponse,
} from '@agoric/cosmic-proto/ibc/applications/transfer/v1/tx.js';
import { SIMULATED_ERRORS } from '@agoric/vats/tools/fake-bridge.js';
import {
  QueryAllBalancesRequest,
  QueryAllBalancesResponse,
  QueryBalanceRequest,
  QueryBalanceResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import {
  MsgSend,
  MsgSendResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/tx.js';
import { Coin } from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
import {
  QueryDelegationRequest,
  QueryDelegatorDelegationsRequest,
  QueryUnbondingDelegationRequest,
  QueryDelegatorUnbondingDelegationsRequest,
  QueryRedelegationsRequest,
  QueryDelegationResponse,
  QueryDelegatorDelegationsResponse,
  QueryUnbondingDelegationResponse,
  QueryDelegatorUnbondingDelegationsResponse,
  QueryRedelegationsResponse,
} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/query.js';
import {
  QueryDelegationRewardsRequest,
  QueryDelegationTotalRewardsRequest,
  QueryDelegationRewardsResponse,
  QueryDelegationTotalRewardsResponse,
} from '@agoric/cosmic-proto/cosmos/distribution/v1beta1/query.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import {
  MsgDelegate,
  MsgDelegateResponse,
} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import { withAmountUtils } from '@agoric/zoe/tools/test-utils.js';
import { makeIssuerKit } from '@agoric/ertp';
import { decodeBase64 } from '@endo/base64';
import { commonSetup } from '../supports.js';
import type {
  AmountArg,
  ChainAddress,
  Denom,
} from '../../src/orchestration-api.js';
import { prepareMakeTestCOAKit } from './make-test-coa-kit.js';
import {
  buildMsgResponseString,
  buildQueryPacketString,
  buildQueryResponseString,
  buildTxPacketString,
  parseOutgoingTxPacket,
} from '../../tools/ibc-mocks.js';
import type { CosmosValidatorAddress } from '../../src/cosmos-api.js';
import { protoMsgMocks } from '../ibc-mocks.js';
import fetchedChainInfo from '../../src/fetched-chain-info.js';
import { assetOn } from '../../src/utils/asset.js';

type TestContext = Awaited<ReturnType<typeof commonSetup>>;

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async t => {
  t.context = await commonSetup(t);
});

const [uistOnCosmos] = assetOn(
  'uist',
  'agoric',
  undefined,
  'cosmoshub',
  fetchedChainInfo,
);

test('send (to addr on same chain)', async t => {
  const {
    brands: { ist },
    mocks: { ibcBridge },
    utils: { inspectDibcBridge, populateChainHub },
  } = t.context;
  populateChainHub();
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);
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
    }),
    undefined,
  );

  // register handler for ist bank send
  ibcBridge.addMockAck(
    buildTxPacketString([
      MsgSend.toProtoMsg({
        fromAddress: 'cosmos1test',
        toAddress: 'cosmos99test',
        amount: [
          {
            denom: uistOnCosmos,
            // denom: 'ibc/uisthash',
            amount: '10',
          },
        ],
      }),
    ]),
    buildMsgResponseString(MsgSendResponse, {}),
  );

  t.is(
    await E(account).send(toAddress, {
      denom: uistOnCosmos,
      value: 10n,
    } as AmountArg),
    undefined,
    'send accepts Amount',
  );

  await t.throwsAsync(
    async () => E(account).send(toAddress, ist.make(10n) as AmountArg),
    {
      message:
        "'amountToCoin' not working for \"[Alleged: IST brand]\" until #10449; use 'DenomAmount' for now",
    },
    'TODO #10449 amountToCoin for CosmosOrchestrationAccount',
  );

  // simulate timeout error
  await t.throwsAsync(
    E(account).send(toAddress, { value: 504n, denom: 'uatom' } as AmountArg),
    // TODO #9629 decode error messages
    { message: 'ABCI code: 5: error handling packet: see events for details' },
  );

  // MOO brand not registered
  const moolah = withAmountUtils(makeIssuerKit('MOO'));
  await t.throwsAsync(
    E(account).send(toAddress, moolah.make(10n) as AmountArg),
    {
      // TODO #10449
      // message: 'No denom for brand [object Alleged: MOO brand]',
      message:
        "'amountToCoin' not working for \"[Alleged: MOO brand]\" until #10449; use 'DenomAmount' for now",
    },
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
    4,
    'sent 3 successful txs and 1 failed. 1 rejected before sending',
  );
});

test('transfer', async t => {
  const {
    brands: { ist },
    facadeServices: { chainHub },
    utils: { inspectDibcBridge, populateChainHub },
    mocks: { ibcBridge },
  } = t.context;
  populateChainHub();

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

    const uistTransfer = toTransferTxPacket({
      ...mockIbcTransfer,
      token: {
        denom: 'uist',
        amount: '10',
      },
    });

    const umooTransfer = toTransferTxPacket({
      ...mockIbcTransfer,
      token: {
        denom: 'umoo',
        amount: '10',
      },
    });

    return {
      [defaultTransfer]: transferResp,
      [customTimeoutHeight]: transferResp,
      [customTimeoutTimestamp]: transferResp,
      [customTimeout]: transferResp,
      [customMemo]: transferResp,
      [uistTransfer]: transferResp,
      [umooTransfer]: transferResp,
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
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);
  const account = await makeTestCOAKit();

  t.log('Send tokens from cosmoshub to noble');
  const mockDestination: ChainAddress = {
    value: 'noble1test',
    chainId: 'noble-1',
    encoding: 'bech32',
  };
  const mockAmountArg: AmountArg = { value: 10n, denom: 'ibc/uusdchash' };
  const res = E(account).transfer(mockDestination, mockAmountArg);
  await eventLoopIteration();

  t.deepEqual(
    await getAndDecodeLatestPacket(),
    mockIbcTransfer,
    'outgoing transfer msg matches expected default mock',
  );
  t.is(await res, undefined, 'transfer returns undefined');

  t.log('transfer accepts custom memo');
  await E(account).transfer(mockDestination, mockAmountArg, {
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
  await E(account).transfer(mockDestination, mockAmountArg, {
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
  await E(account).transfer(mockDestination, mockAmountArg, {
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
  await E(account).transfer(mockDestination, mockAmountArg, {
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
    E(account).transfer(
      {
        ...mockDestination,
        chainId: 'unknown-1',
      },
      mockAmountArg,
    ),
    {
      message: 'connection not found: cosmoshub-4<->unknown-1',
    },
  );

  const moolah = withAmountUtils(makeIssuerKit('MOO'));
  t.log('transfer throws if asset is not in its chainHub');
  await t.throwsAsync(E(account).transfer(mockDestination, moolah.make(10n)), {
    // TODO #10449
    // message: 'No denom for brand [object Alleged: MOO brand]',
    message:
      "'amountToCoin' not working for \"[Alleged: MOO brand]\" until #10449; use 'DenomAmount' for now",
  });
  chainHub.registerAsset('umoo', {
    baseDenom: 'umoo',
    baseName: 'agoric',
    brand: moolah.brand,
    chainName: 'agoric',
  });
  // uses umooTransfer mock above
  await E(account).transfer(
    mockDestination,
    // moolah.make(10n), // TODO #10449 restore
    { denom: 'umoo', value: 10n },
  );

  t.log('transfer timeout error recieved and handled from the bridge');
  await t.throwsAsync(
    E(account).transfer(mockDestination, {
      ...mockAmountArg,
      value: SIMULATED_ERRORS.TIMEOUT,
    }),
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

test('getBalance and getBalances', async t => {
  const {
    mocks: { ibcBridge },
  } = t.context;
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);

  const buildMocks = () => {
    const makeBalanceReq = (
      address: ChainAddress['value'] = 'osmo1test',
      denom: Denom = 'uosmo',
    ) =>
      buildQueryPacketString([
        QueryBalanceRequest.toProtoMsg({
          address,
          denom,
        }),
      ]);
    const makeAllBalanceReq = (address: ChainAddress['value'] = 'osmo1test') =>
      buildQueryPacketString([
        QueryAllBalancesRequest.toProtoMsg({
          address,
        }),
      ]);
    const makeBalanceResp = (
      balance: Coin = { denom: 'usomo', amount: '10' },
    ) =>
      buildQueryResponseString(QueryBalanceResponse, {
        balance,
      });
    const makeAllBalanceResp = (balances: Coin[] = []) =>
      buildQueryResponseString(QueryAllBalancesResponse, {
        balances,
      });

    return {
      [makeBalanceReq()]: makeBalanceResp({
        denom: 'uosmo',
        amount: '10',
      }),
      [makeAllBalanceReq()]: makeAllBalanceResp([
        {
          denom: 'uosmo',
          amount: '10',
        },
      ]),
      [makeBalanceReq('osmo1test1')]: makeBalanceResp({
        denom: 'uosmo',
        amount: '0',
      }),
      [makeAllBalanceReq('osmo1test1')]: makeAllBalanceResp(),
    };
  };
  t.log('setting mockAckMap for osmosis balance queries');
  ibcBridge.setMockAck(buildMocks());
  t.log('set address prefix to osmo');
  ibcBridge.setAddressPrefix('osmo');

  {
    t.log('osmo1test mocked to have a 10 uosmo balance');
    const account = await makeTestCOAKit({
      chainId: 'osmosis-1',
      icqEnabled: true,
    });
    t.assert(account, 'account is returned');

    t.deepEqual(await E(account).getBalance('uosmo'), {
      denom: 'uosmo',
      value: 10n,
    });
    t.deepEqual(await E(account).getBalances(), [
      { denom: 'uosmo', value: 10n },
    ]);
  }

  {
    t.log('osmo1test1 mocked to have no balances');
    const account = await makeTestCOAKit({
      chainId: 'osmosis-1',
      icqEnabled: true,
    });
    t.assert(account, 'account is returned');
    t.deepEqual(await E(account).getBalance('uosmo'), {
      denom: 'uosmo',
      value: 0n,
    });
    t.deepEqual(await E(account).getBalances(), []);
  }

  {
    t.log('cosmoshub does not support balance queries');
    t.log('set address prefix to cosmos');
    ibcBridge.setAddressPrefix('cosmos');
    const account = await makeTestCOAKit();
    await t.throwsAsync(E(account).getBalance('uatom'), {
      message: 'Queries not available for chain "cosmoshub-4"',
    });
    await t.throwsAsync(E(account).getBalances(), {
      message: 'Queries not available for chain "cosmoshub-4"',
    });
  }
});

test('StakingAccountQueries', async t => {
  const {
    mocks: { ibcBridge },
  } = t.context;
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);

  const buildMocks = () => {
    const mockValidator: CosmosValidatorAddress = {
      value: 'cosmosvaloper1xyz',
      chainId: 'cosmoshub-4',
      encoding: 'bech32',
    };

    const makeDelegationReq = () =>
      buildQueryPacketString([
        QueryDelegationRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
          validatorAddr: mockValidator.value,
        }),
      ]);

    const makeDelegationsReq = () =>
      buildQueryPacketString([
        QueryDelegatorDelegationsRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
        }),
      ]);

    const makeUnbondingDelegationReq = () =>
      buildQueryPacketString([
        QueryUnbondingDelegationRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
          validatorAddr: mockValidator.value,
        }),
      ]);

    const makeUnbondingDelegationsReq = () =>
      buildQueryPacketString([
        QueryDelegatorUnbondingDelegationsRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
        }),
      ]);

    const makeRedelegationReq = () =>
      buildQueryPacketString([
        QueryRedelegationsRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
          srcValidatorAddr: mockValidator.value,
          // XXX need to provide dstValidatorAddr
          dstValidatorAddr: mockValidator.value,
        }),
      ]);

    const makeRedelegationsReq = () =>
      buildQueryPacketString([
        QueryRedelegationsRequest.toProtoMsg({
          delegatorAddr: 'cosmos1test',
          // Protobufs require these to be strings but they can be empty
          srcValidatorAddr: '',
          dstValidatorAddr: '',
        }),
      ]);

    const makeRewardReq = () =>
      buildQueryPacketString([
        QueryDelegationRewardsRequest.toProtoMsg({
          delegatorAddress: 'cosmos1test',
          validatorAddress: mockValidator.value,
        }),
      ]);

    const makeRewardsReq = () =>
      buildQueryPacketString([
        QueryDelegationTotalRewardsRequest.toProtoMsg({
          delegatorAddress: 'cosmos1test',
        }),
      ]);

    return {
      [makeDelegationReq()]: buildQueryResponseString(QueryDelegationResponse, {
        delegationResponse: {
          delegation: {
            delegatorAddress: 'cosmos1test',
            validatorAddress: mockValidator.value,
            shares: '1000000',
          },
          balance: { denom: 'uatom', amount: '1000000' },
        },
      }),
      [makeDelegationsReq()]: buildQueryResponseString(
        QueryDelegatorDelegationsResponse,
        {
          delegationResponses: [
            {
              delegation: {
                delegatorAddress: 'cosmos1test',
                validatorAddress: mockValidator.value,
                shares: '1000000',
              },
              balance: { denom: 'uatom', amount: '1000000' },
            },
          ],
        },
      ),
      [makeUnbondingDelegationReq()]: buildQueryResponseString(
        QueryUnbondingDelegationResponse,
        {
          unbond: {
            delegatorAddress: 'cosmos1test',
            validatorAddress: mockValidator.value,
            entries: [
              {
                creationHeight: 100n,
                completionTime: { seconds: 1672531200n, nanos: 0 },
                initialBalance: '2000000',
                balance: '1900000',
              },
            ],
          },
        },
      ),
      [makeUnbondingDelegationsReq()]: buildQueryResponseString(
        QueryDelegatorUnbondingDelegationsResponse,
        {
          unbondingResponses: [
            {
              delegatorAddress: 'cosmos1test',
              validatorAddress: mockValidator.value,
              entries: [
                {
                  creationHeight: 100n,
                  completionTime: { seconds: 1672531200n, nanos: 0 },
                  initialBalance: '2000000',
                  balance: '1900000',
                },
              ],
            },
          ],
        },
      ),
      [makeRedelegationReq()]: buildQueryResponseString(
        QueryRedelegationsResponse,
        {
          redelegationResponses: [
            {
              redelegation: {
                delegatorAddress: 'cosmos1test',
                validatorSrcAddress: mockValidator.value,
                validatorDstAddress: 'cosmosvaloper1abc',
                entries: [
                  {
                    creationHeight: 200n,
                    completionTime: { seconds: 1675209600n, nanos: 0 },
                    initialBalance: '3000000',
                    sharesDst: '2900000',
                  },
                ],
              },
              entries: [
                {
                  redelegationEntry: {
                    creationHeight: 200n,
                    completionTime: { seconds: 1675209600n, nanos: 0 },
                    initialBalance: '3000000',
                    sharesDst: '2900000',
                  },
                  balance: '2900000',
                },
              ],
            },
          ],
        },
      ),
      [makeRedelegationsReq()]: buildQueryResponseString(
        QueryRedelegationsResponse,
        {
          redelegationResponses: [
            {
              redelegation: {
                delegatorAddress: 'cosmos1test',
                validatorSrcAddress: '',
                validatorDstAddress: '',
                entries: [
                  {
                    creationHeight: 200n,
                    completionTime: { seconds: 1675209600n, nanos: 0 },
                    initialBalance: '3000000',
                    sharesDst: '2900000',
                  },
                ],
              },
              entries: [
                {
                  redelegationEntry: {
                    creationHeight: 200n,
                    completionTime: { seconds: 1675209600n, nanos: 0 },
                    initialBalance: '3000000',
                    sharesDst: '2900000',
                  },
                  balance: '2900000',
                },
              ],
            },
          ],
        },
      ),
      [makeRewardReq()]: buildQueryResponseString(
        QueryDelegationRewardsResponse,
        {
          rewards: [
            {
              denom: 'uatom',
              // Rewards may be fractional, from operations like inflation
              amount: '500000.01',
            },
          ],
        },
      ),
      [makeRewardsReq()]: buildQueryResponseString(
        QueryDelegationTotalRewardsResponse,
        {
          rewards: [
            {
              validatorAddress: mockValidator.value,
              reward: [{ denom: 'uatom', amount: '500000' }],
            },
          ],
          total: [{ denom: 'uatom', amount: '500000' }],
        },
      ),
    };
  };

  ibcBridge.setMockAck(buildMocks());
  ibcBridge.setAddressPrefix('cosmos');

  const account = await makeTestCOAKit({
    chainId: 'cosmoshub-4',
    icqEnabled: true,
  });
  t.assert(account, 'account is returned');

  const mockValidator: CosmosValidatorAddress = {
    value: 'cosmosvaloper1xyz',
    chainId: 'cosmoshub-4',
    encoding: 'bech32',
  };

  // Test getDelegation
  const delegationResult = await E(account).getDelegation(mockValidator);
  t.deepEqual(delegationResult, {
    amount: { denom: 'uatom', value: 1000000n },
    delegator: {
      chainId: 'cosmoshub-4',
      encoding: 'bech32',
      value: 'cosmos1test',
    },
    validator: {
      chainId: 'cosmoshub-4',
      encoding: 'bech32',
      value: mockValidator.value,
    },
  });

  // Test getDelegations
  const delegationsResult = await E(account).getDelegations();
  t.deepEqual(delegationsResult, [
    {
      amount: { denom: 'uatom', value: 1000000n },

      delegator: {
        chainId: 'cosmoshub-4',
        encoding: 'bech32',
        value: 'cosmos1test',
      },
      validator: {
        chainId: 'cosmoshub-4',
        encoding: 'bech32',
        value: mockValidator.value,
      },
    },
  ]);

  // Test getUnbondingDelegation
  const unbondingDelegationResult =
    await E(account).getUnbondingDelegation(mockValidator);
  t.deepEqual(unbondingDelegationResult, {
    delegatorAddress: 'cosmos1test',
    validatorAddress: mockValidator.value,
    entries: [
      {
        creationHeight: 100n,
        completionTime: { seconds: 1672531200n, nanos: 0 },
        initialBalance: '2000000',
        balance: '1900000',
      },
    ],
  });

  // Test getUnbondingDelegations
  const unbondingDelegationsResult = await E(account).getUnbondingDelegations();
  t.deepEqual(unbondingDelegationsResult, [
    {
      delegatorAddress: 'cosmos1test',
      validatorAddress: mockValidator.value,
      entries: [
        {
          creationHeight: 100n,
          completionTime: { seconds: 1672531200n, nanos: 0 },
          initialBalance: '2000000',
          balance: '1900000',
        },
      ],
    },
  ]);

  // Test getRedelegations
  const redelegationsResult = await E(account).getRedelegations();
  t.deepEqual(redelegationsResult, [
    {
      redelegation: {
        delegatorAddress: 'cosmos1test',
        validatorSrcAddress: '',
        validatorDstAddress: '',
        entries: [
          {
            creationHeight: 200n,
            completionTime: { seconds: 1675209600n, nanos: 0 },
            initialBalance: '3000000',
            sharesDst: '2900000',
          },
        ],
      },
      entries: [
        {
          redelegationEntry: {
            creationHeight: 200n,
            completionTime: { seconds: 1675209600n, nanos: 0 },
            initialBalance: '3000000',
            sharesDst: '2900000',
          },
          balance: '2900000',
        },
      ],
    },
  ]);

  // Test getReward
  const rewardResult = await E(account).getReward(mockValidator);
  t.deepEqual(rewardResult, [{ denom: 'uatom', value: 500000n }]);

  // Test getRewards
  const rewardsResult = await E(account).getRewards();
  t.deepEqual(rewardsResult, {
    rewards: [
      {
        validator: {
          encoding: 'bech32',
          value: mockValidator.value,
          chainId: 'cosmoshub-4',
        },
        reward: [{ denom: 'uatom', value: 500000n }],
      },
    ],
    total: [{ denom: 'uatom', value: 500000n }],
  });
});

test('not yet implemented', async t => {
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);
  const account = await makeTestCOAKit();
  const mockAmountArg: AmountArg = { value: 10n, denom: 'uatom' };

  await t.throwsAsync(E(account).transferSteps(mockAmountArg, null as any), {
    message: 'not yet implemented',
  });
  await t.throwsAsync(E(account).withdrawRewards(), {
    message: 'Not Implemented. Try using withdrawReward.',
  });
});

test('executeEncodedTx', async t => {
  const makeTestCOAKit = prepareMakeTestCOAKit(t, t.context);
  const account = await makeTestCOAKit();

  const delegateMsgSuccess = Any.toJSON(
    MsgDelegate.toProtoMsg({
      delegatorAddress: 'cosmos1test',
      validatorAddress: 'cosmosvaloper1test',
      amount: { denom: 'uatom', amount: '10' },
    }),
  );

  const res = await E(account).executeEncodedTx([delegateMsgSuccess]);
  t.is(
    res,
    'Ei0KKy9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlUmVzcG9uc2U=', // cosmos.staking.v1beta1.MsgDelegateResponse
    'delegateMsgSuccess',
  );
  const decodedRes = MsgDelegateResponse.decode(decodeBase64(res));
  t.deepEqual(decodedRes, {}, 'MsgDelegate returns MsgDelegateResponse');

  t.context.mocks.ibcBridge.addMockAck(
    // Delegate 100 ubld from cosmos1test to cosmosvaloper1test observed in console, timeoutHeight: 6n
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ2xVS0l5OWpiM050YjNNdWMzUmhhMmx1Wnk1Mk1XSmxkR0V4TGsxelowUmxiR1ZuWVhSbEVpNEtDMk52YzIxdmN6RjBaWE4wRWhKamIzTnRiM04yWVd4dmNHVnlNWFJsYzNRYUN3b0ZkV0YwYjIwU0FqRXdHQVk9IiwibWVtbyI6IiJ9',
    protoMsgMocks.delegate.ack,
  );
  t.is(
    await E(account).executeEncodedTx([delegateMsgSuccess], {
      timeoutHeight: 6n,
    }),
    'Ei0KKy9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlUmVzcG9uc2U=', // cosmos.staking.v1beta1.MsgDelegateResponse
    'delegateMsgSuccess',
  );
});
