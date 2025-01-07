import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { Fail } from '@endo/errors';
import type { AnyJson } from '@agoric/cosmic-proto';
import type { Coin } from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
import { MsgWithdrawDelegatorRewardResponse } from '@agoric/cosmic-proto/cosmos/distribution/v1beta1/tx.js';
import {
  MsgBeginRedelegateResponse,
  MsgDelegate,
  MsgDelegateResponse,
  MsgUndelegateResponse,
} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import { makeFakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeNotifierFromSubscriber } from '@agoric/notifier';
import type { TimestampRecord, TimestampValue } from '@agoric/time';
import { makeScalarBigMapStore, type Baggage } from '@agoric/vat-data';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import { prepareVowTools, heapVowE as E } from '@agoric/vow/vat.js';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/recorder.js';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { decodeBase64, encodeBase64 } from '@endo/base64';
import { Far } from '@endo/far';
import { Timestamp } from '@agoric/cosmic-proto/google/protobuf/timestamp.js';
import { makeNameHubKit } from '@agoric/vats';
import { prepareCosmosOrchestrationAccountKit } from '../src/exos/cosmos-orchestration-account.js';
import type {
  ChainAddress,
  DenomAmount,
  IcaAccount,
  ICQConnection,
} from '../src/types.js';
import { MILLISECONDS_PER_SECOND } from '../src/utils/time.js';
import { makeChainHub } from '../src/exos/chain-hub.js';

/**
 * @param {unknown} response
 * @param {(msg: any) => Any} toProtoMsg
 * @returns {string}
 */
const encodeTxResponse = (response, toProtoMsg) => {
  const protoMsg = toProtoMsg(response);
  const any1 = Any.fromPartial(protoMsg);
  const any2 = Any.fromPartial({ value: Any.encode(any1).finish() });
  const ackStr = encodeBase64(Any.encode(any2).finish());
  return ackStr;
};

const trivialDelegateResponse = encodeTxResponse(
  {},
  MsgDelegateResponse.toProtoMsg,
);

test('MsgDelegateResponse trivial response', t => {
  t.is(
    trivialDelegateResponse,
    'Ei0KKy9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlUmVzcG9uc2U=',
  );
});

const configStaking = {
  acct1: {
    value: 'agoric1spy36ltduehs5dmszfrp792f0k2emcntrql3nx',
    localAddress:
      '/ibc-port/icacontroller-1/ordered/{"version":"ics27-1","controllerConnectionId":"connection-8","hostConnectionId":"connection-649","address":"cosmos1test","encoding":"proto3","txType":"sdk_multi_msg"}/ibc-channel/channel-0',
    remoteAddress:
      '/ibc-hop/connection-8/ibc-port/icahost/ordered/{"version":"ics27-1","controllerConnectionId":"connection-8","hostConnectionId":"connection-649","address":"cosmos1test","encoding":"proto3","txType":"sdk_multi_msg"}/ibc-channel/channel-0',
  },
  validator: {
    value: 'agoric1valoper234',
    encoding: 'bech32',
    chainId: 'agoric-3',
  },
  delegations: {
    agoric1valoper234: { denom: 'uatom', amount: '200' },
  },
  startTime: '2024-06-01T00:00Z',
  completionTime: '2024-06-22T00:00Z',
} as const;

const configRedelegate = {
  validator: {
    value: 'agoric1valoper444',
    encoding: 'bech32',
    chainId: 'atom-test',
  },
  delegations: {
    agoric1valoper234: { denom: 'uatom', amount: '50' },
  },
} as const;

const TICK = 5n * 60n;
const DAY = (60n * 60n * 24n) / TICK;
const DAYf = Number(DAY);

const time = {
  parse: (dateString: string) =>
    BigInt(Date.parse(dateString) / 1000) as TimestampValue,

  format: (ts: TimestampRecord) =>
    new Date(Number(ts.absValue) * 1000).toISOString(),
};

const dateToTimestamp = (date: Date): Timestamp => ({
  seconds: BigInt(date.getTime()) / MILLISECONDS_PER_SECOND,
  nanos: 0,
});

const makeScenario = () => {
  const mockAccount = (
    addr = 'agoric1234',
    delegations = {} as Record<string, Coin>,
  ) => {
    const calls = [] as Array<{ msgs: AnyJson[] }>;

    const simulate = {
      '/cosmos.staking.v1beta1.MsgDelegate': _m => {
        const response = MsgDelegateResponse.fromPartial({});
        return encodeTxResponse(response, MsgDelegateResponse.toProtoMsg);
      },

      '/cosmos.staking.v1beta1.MsgBeginRedelegate': _m => {
        const response = MsgBeginRedelegateResponse.fromPartial({
          completionTime: dateToTimestamp(new Date('2025-12-17T03:24:00Z')),
        });
        return encodeTxResponse(
          response,
          MsgBeginRedelegateResponse.toProtoMsg,
        );
      },

      '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': m => {
        console.log('simulate withdraw', m);
        const rewards = Object.values(delegations).map(({ denom, amount }) => ({
          denom,
          amount: `${Number(amount) / 100}`,
        }));
        const response = {
          amount: rewards,
        } as MsgWithdrawDelegatorRewardResponse;

        return encodeTxResponse(
          response,
          MsgWithdrawDelegatorRewardResponse.toProtoMsg,
        );
      },

      '/cosmos.staking.v1beta1.MsgUndelegate': _m => {
        const { completionTime } = configStaking;
        const response = MsgUndelegateResponse.fromPartial({
          completionTime: dateToTimestamp(new Date(completionTime)),
        });
        return encodeTxResponse(response, MsgUndelegateResponse.toProtoMsg);
      },
    };

    const chainAddress: ChainAddress = harden({
      value: addr,
      encoding: 'bech32',
      chainId: 'mock-1',
    });

    const account: IcaAccount = Far('MockAccount', {
      getAddress: () => chainAddress,
      executeEncodedTx: async msgs => {
        assert.equal(msgs.length, 1);
        const { typeUrl } = msgs[0];
        const doMessage = simulate[typeUrl];
        assert(doMessage, `unknown ${typeUrl}`);
        await null;
        calls.push({ msgs });
        return doMessage(msgs[0]);
      },
      executeTx: () => Fail`mock`,
      deactivate: () => Fail`mock`,
      getLocalAddress: () => configStaking.acct1.localAddress,
      getRemoteAddress: () => configStaking.acct1.remoteAddress,
      getPort: () => Fail`mock`,
      reactivate: () => Fail`mock`,
    });
    return { account, calls };
  };

  const mockZCF = () => {
    const toHandler = new Map();
    const zcf: ZCF = harden({
      // @ts-expect-error mock
      makeInvitation: async (handler, _desc, _c, _patt) => {
        const invitation = Far('Invitation', {}) as unknown as Invitation;
        toHandler.set(invitation, handler);
        return invitation;
      },
    });
    const zoe = harden({
      offer(invitation) {
        const handler = toHandler.get(invitation);
        const zcfSeat = harden({
          exit() {},
        });
        const result = Promise.resolve(null).then(() => handler(zcfSeat));
        const userSeat = harden({
          getOfferResult: async () => result,
        });
        return userSeat;
      },
    });
    return { zcf, zoe };
  };

  const baggage = makeScalarBigMapStore('b1') as Baggage;
  const zone = makeDurableZone(baggage);
  const marshaller = makeFakeBoard().getReadonlyMarshaller();
  const { makeRecorderKit } = prepareRecorderKitMakers(baggage, marshaller);

  const { delegations, startTime } = configStaking;

  const { rootNode } = makeFakeStorageKit('stakingOpsTest', {
    sequence: false,
  });

  const vowTools = prepareVowTools(zone.subZone('VowTools'));

  const icqConnection = Far('ICQConnection', {}) as ICQConnection;

  const timer = buildZoeManualTimer(undefined, time.parse(startTime), {
    timeStep: TICK,
    eventLoopIteration,
  });
  const { nameHub: agoricNames } = makeNameHubKit();

  const chainHub = makeChainHub(
    zone.subZone('chainHub'),
    agoricNames,
    vowTools,
  );

  return {
    baggage,
    zone,
    makeRecorderKit,
    ...mockAccount(undefined, delegations),
    storageNode: rootNode,
    timer,
    icqConnection,
    vowTools,
    chainHub,
    ...mockZCF(),
    agoricNames,
  };
};

test('makeAccount() writes to storage', async t => {
  const s = makeScenario();
  const { account, timer } = s;
  const {
    makeRecorderKit,
    storageNode,
    zcf,
    icqConnection,
    vowTools,
    chainHub,
    zone,
  } = s;
  const make = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService: timer,
    vowTools,
    zcf,
  });

  const { holder } = make(
    {
      chainAddress: account.getAddress(),
      localAddress: account.getLocalAddress(),
      remoteAddress: account.getRemoteAddress(),
    },
    {
      account,
      storageNode,
      icqConnection,
      timer,
    },
  );
  const { publicSubscribers } = await E.when(holder.asContinuingOffer());
  const accountNotifier = makeNotifierFromSubscriber(
    // @ts-expect-error the promise from `subscriber.getUpdateSince` can't be used in a flow
    publicSubscribers.account.subscriber,
  );
  const storageUpdate = await E(accountNotifier).getUpdateSince();
  t.deepEqual(storageUpdate, {
    updateCount: 1n,
    value: {
      localAddress: configStaking.acct1.localAddress,
      remoteAddress: configStaking.acct1.remoteAddress,
    },
  });
});

test('withdrawRewards() on StakingAccountHolder formats message correctly', async t => {
  const s = makeScenario();
  const { account, calls, timer } = s;
  const {
    makeRecorderKit,
    storageNode,
    zcf,
    icqConnection,
    vowTools,
    chainHub,
    zone,
  } = s;
  const make = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService: timer,
    vowTools,
    zcf,
  });

  // Higher fidelity tests below use invitationMakers.
  const { holder } = make(
    {
      chainAddress: account.getAddress(),
      localAddress: account.getLocalAddress(),
      remoteAddress: account.getRemoteAddress(),
    },
    {
      account,
      storageNode,
      icqConnection,
      timer,
    },
  );
  const { validator } = configStaking;
  const actual = await E(holder).withdrawReward(validator);
  t.deepEqual(actual, [{ denom: 'uatom', value: 2n }]);
  const msg = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: 'CgphZ29yaWMxMjM0EhFhZ29yaWMxdmFsb3BlcjIzNA==',
  };
  t.deepEqual(calls, [{ msgs: [msg] }]);
});

test(`delegate; redelegate using invitationMakers`, async t => {
  const s = makeScenario();
  const { account, calls, timer } = s;
  const {
    makeRecorderKit,
    storageNode,
    zcf,
    zoe,
    icqConnection,
    vowTools,
    chainHub,
    zone,
  } = s;
  const makeAccountKit = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService: timer,
    vowTools,
    zcf,
  });

  const { invitationMakers } = makeAccountKit(
    {
      chainAddress: account.getAddress(),
      localAddress: account.getLocalAddress(),
      remoteAddress: account.getRemoteAddress(),
    },
    {
      account,
      storageNode,
      icqConnection,
      timer,
    },
  );

  const { validator, delegations } = configStaking;
  {
    const value = BigInt(Object.values(delegations)[0].amount);
    const anAmountArg = { denom: 'uatom', value };
    const toDelegate = await E(invitationMakers).Delegate(
      validator,
      anAmountArg,
    );
    const seat = E(zoe).offer(toDelegate);
    const result = await E(seat).getOfferResult();

    t.deepEqual(result, undefined);
    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: 'CgphZ29yaWMxMjM0EhFhZ29yaWMxdmFsb3BlcjIzNBoMCgV1YXRvbRIDMjAw',
    };
    t.deepEqual(calls, [{ msgs: [msg] }]);

    // That msg.value looked odd in a protobuf tool. Let's double-check.
    t.deepEqual(MsgDelegate.decode(decodeBase64(msg.value)), {
      amount: {
        amount: '200',
        denom: 'uatom',
      },
      delegatorAddress: 'agoric1234',
      validatorAddress: 'agoric1valoper234',
    });
    t.is(msg.typeUrl, MsgDelegate.typeUrl);

    // clear calls
    calls.splice(0, calls.length);
  }

  {
    const { validator: dst } = configRedelegate;
    const value = BigInt(Object.values(configRedelegate.delegations)[0].amount);
    const anAmount = { denom: 'uatom', value };
    const toRedelegate = await E(invitationMakers).Redelegate(
      validator,
      dst,
      anAmount,
    );
    const seat = E(zoe).offer(toRedelegate);
    const result = await E(seat).getOfferResult();

    t.deepEqual(result, undefined);
    const msg = {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value:
        'CgphZ29yaWMxMjM0EhFhZ29yaWMxdmFsb3BlcjIzNBoRYWdvcmljMXZhbG9wZXI0NDQiCwoFdWF0b20SAjUw',
    };
    t.deepEqual(calls, [{ msgs: [msg] }]);
  }
});

test(`withdraw rewards using invitationMakers`, async t => {
  const s = makeScenario();
  const { account, calls, timer } = s;
  const {
    makeRecorderKit,
    storageNode,
    zcf,
    zoe,
    icqConnection,
    vowTools,
    chainHub,
    zone,
  } = s;
  const makeAccountKit = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService: timer,
    vowTools,
    zcf,
  });

  const { invitationMakers } = makeAccountKit(
    {
      chainAddress: account.getAddress(),
      localAddress: account.getLocalAddress(),
      remoteAddress: account.getRemoteAddress(),
    },
    {
      account,
      storageNode,
      icqConnection,
      timer,
    },
  );

  const { validator } = configStaking;
  const toWithdraw = await E(invitationMakers).WithdrawReward(validator);
  const seat = E(zoe).offer(toWithdraw);
  const result = await E(seat).getOfferResult();

  t.deepEqual(result, [{ denom: 'uatom', value: 2n }]);
  const msg = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: 'CgphZ29yaWMxMjM0EhFhZ29yaWMxdmFsb3BlcjIzNA==',
  };
  t.deepEqual(calls, [{ msgs: [msg] }]);
});

test(`undelegate waits for unbonding period`, async t => {
  const s = makeScenario();
  const { account, calls, timer } = s;
  const {
    makeRecorderKit,
    storageNode,
    zcf,
    zoe,
    icqConnection,
    vowTools,
    chainHub,
    zone,
  } = s;
  const makeAccountKit = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService: timer,
    vowTools,
    zcf,
  });

  const { invitationMakers } = makeAccountKit(
    {
      chainAddress: account.getAddress(),
      localAddress: account.getLocalAddress(),
      remoteAddress: account.getRemoteAddress(),
    },
    {
      account,
      storageNode,
      icqConnection,
      timer,
    },
  );

  const { validator, delegations } = configStaking;

  const { denom, amount } = Object.values(delegations)[0];
  const delegation = {
    amount: { denom, value: BigInt(amount) } as DenomAmount,
    validator,
  };
  const toUndelegate = await E(invitationMakers).Undelegate([delegation]);
  const current = async () => E(timer).getCurrentTimestamp().then(time.format);
  t.log(await current(), 'undelegate', delegation.amount.value);
  const seat = E(zoe).offer(toUndelegate);

  const beforeDone = E(timer)
    .tickN(15 * DAYf)
    .then(() => 15);
  const afterDone = beforeDone.then(async () =>
    E(timer)
      .tickN(10 * DAYf)
      .then(() => 25),
  );
  const resultP = E(seat).getOfferResult();
  const notTooSoon = await Promise.race([beforeDone, resultP]);
  t.log(await current(), 'not too soon?', notTooSoon === 15);
  t.is(notTooSoon, 15);
  const result = await Promise.race([resultP, afterDone]);
  t.log(await current(), 'in time?', result === undefined);
  t.deepEqual(result, undefined);

  const msg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: 'CgphZ29yaWMxMjM0EhFhZ29yaWMxdmFsb3BlcjIzNBoMCgV1YXRvbRIDMjAw',
  };
  t.deepEqual(calls, [{ msgs: [msg] }]);
});

test.todo('undelegate is cancellable - cosmos cancelUnbonding');
