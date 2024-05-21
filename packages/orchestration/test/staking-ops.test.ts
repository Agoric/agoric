import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { MsgDelegate } from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import { makeScalarBigMapStore, type Baggage } from '@agoric/vat-data';
import { decodeBase64 } from '@endo/base64';
import { E, Far } from '@endo/far';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import type { TimestampRecord, TimestampValue } from '@agoric/time';
import { makeDurableZone } from '@agoric/zone/durable.js';
import {
  prepareStakingAccountKit,
  trivialDelegateResponse,
} from '../src/exos/stakingAccountKit.js';

import type { ICQConnection } from '../src/types.js';
import { configRedelegate, configStaking, mockAccount } from './mockAccount.js';

test('MsgDelegateResponse trivial response', t => {
  t.is(
    trivialDelegateResponse,
    'Ei0KKy9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRlUmVzcG9uc2U=',
  );
});

const TICK = 5n * 60n;
const DAY = (60n * 60n * 24n) / TICK;
const DAYf = Number(DAY);

const time = {
  parse: (dateString: string) =>
    BigInt(Date.parse(dateString) / 1000) as TimestampValue,

  format: (ts: TimestampRecord) =>
    new Date(Number(ts.absValue) * 1000).toISOString(),
};

const makeScenario = () => {
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
          getOfferResult: () => result,
        });
        return userSeat;
      },
    });
    return { zcf, zoe };
  };

  const makeRecorderKit = () => harden({}) as any;

  const baggage = makeScalarBigMapStore('b1') as Baggage;
  const zone = makeDurableZone(baggage);

  const { delegations, startTime } = configStaking;

  // TODO: when we write to chainStorage, test it.
  //   const { rootNode } = makeFakeStorageKit('mockChainStorageRoot');

  const storageNode = Far('StorageNode', {}) as unknown as StorageNode;

  const icqConnection = Far('ICQConnection', {}) as ICQConnection;

  const timer = buildManualTimer(undefined, time.parse(startTime), {
    timeStep: TICK,
    eventLoopIteration,
  });
  return {
    baggage,
    zone,
    makeRecorderKit,
    ...mockAccount(undefined, delegations),
    storageNode,
    timer,
    icqConnection,
    ...mockZCF(),
  };
};

test('withdrawRewards() on StakingAccountHolder formats message correctly', async t => {
  const s = makeScenario();
  const { account, calls, timer } = s;
  const { makeRecorderKit, storageNode, zcf, icqConnection, zone } = s;
  const make = prepareStakingAccountKit(zone, makeRecorderKit, zcf);

  // Higher fidelity tests below use invitationMakers.
  const { holder } = make(account.getAddress(), 'uatom', {
    account,
    storageNode,
    icqConnection,
    timer,
  });
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
  const { makeRecorderKit, storageNode, zcf, zoe, icqConnection, zone } = s;
  const aBrand = Far('Token') as Brand<'nat'>;
  const makeAccountKit = prepareStakingAccountKit(zone, makeRecorderKit, zcf);

  const { invitationMakers } = makeAccountKit(account.getAddress(), 'uatom', {
    account,
    storageNode,
    icqConnection,
    timer,
  });

  const { validator, delegations } = configStaking;
  {
    const value = BigInt(Object.values(delegations)[0].amount);
    const anAmount = { brand: aBrand, value };
    const toDelegate = await E(invitationMakers).Delegate(validator, anAmount);
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
    const anAmount = { brand: aBrand, value };
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
  const { makeRecorderKit, storageNode, zcf, zoe, icqConnection, zone } = s;
  const makeAccountKit = prepareStakingAccountKit(zone, makeRecorderKit, zcf);

  const { invitationMakers } = makeAccountKit(account.getAddress(), 'uatom', {
    account,
    storageNode,
    icqConnection,
    timer,
  });

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
  const { makeRecorderKit, storageNode, zcf, zoe, icqConnection, zone } = s;
  const makeAccountKit = prepareStakingAccountKit(zone, makeRecorderKit, zcf);

  const { invitationMakers } = makeAccountKit(account.getAddress(), 'uatom', {
    account,
    storageNode,
    icqConnection,
    timer,
  });

  const { validator, delegations } = configStaking;

  const value = BigInt(Object.values(delegations)[0].amount);
  const anAmount = { brand: Far('Token'), value } as Amount<'nat'>;
  const delegation = {
    delegatorAddress: account.getAddress().address,
    shares: `${anAmount.value}`,
    validatorAddress: validator.address,
  };
  const toUndelegate = await E(invitationMakers).Undelegate([delegation]);
  const current = () => E(timer).getCurrentTimestamp().then(time.format);
  t.log(await current(), 'undelegate', delegation.shares);
  const seat = E(zoe).offer(toUndelegate);

  const beforeDone = E(timer)
    .tickN(15 * DAYf)
    .then(() => 15);
  const afterDone = beforeDone.then(() =>
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

test.todo(`delegate; undelegate; collect rewards`);
test.todo('undelegate uses a timer: begin; how long? wait; resolve');
test.todo('undelegate is cancellable - cosmos cancelUnbonding');
