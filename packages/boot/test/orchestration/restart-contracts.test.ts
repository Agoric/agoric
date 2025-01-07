/** @file Bootstrap test of restarting contracts using orchestration */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';

import { BridgeId } from '@agoric/internal';
import {
  withChainCapabilities,
  type CosmosValidatorAddress,
} from '@agoric/orchestration';
import { buildVTransferEvent } from '@agoric/orchestration/tools/ibc-mocks.js';
import type { UpdateRecord } from '@agoric/smart-wallet/src/smartWallet.js';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import { makeTestAddress } from '@agoric/orchestration/tools/make-test-address.js';
import {
  makeWalletFactoryContext,
  type WalletFactoryTestContext,
} from '../bootstrapTests/walletFactory.js';

const test: TestFn<WalletFactoryTestContext> = anyTest;
test.before(async t => {
  t.context = await makeWalletFactoryContext(
    t,
    '@agoric/vm-config/decentral-itest-orchestration-config.json',
  );
});
test.after.always(async t => t.context.shutdown?.());

test.serial('send-anywhere', async t => {
  const {
    walletFactoryDriver,
    buildProposal,
    evalProposal,
    bridgeUtils: { runInbound },
  } = t.context;

  const { IST } = t.context.agoricNamesRemotes.brand;

  t.log('start send-anywhere');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/init-send-anywhere.js', [
      '--chainInfo',
      JSON.stringify(withChainCapabilities(fetchedChainInfo)),
      '--assetInfo',
      JSON.stringify([
        [
          'uist',
          {
            baseDenom: 'uist',
            baseName: 'agoric',
            chainName: 'agoric',
          },
        ],
      ]),
    ]),
  );

  t.log('making offer');
  const wallet = await walletFactoryDriver.provideSmartWallet('agoric1test');
  // no money in wallet to actually send
  const zero = { brand: IST, value: 0n };
  // send because it won't resolve
  await wallet.sendOffer({
    id: 'send-somewhere',
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['sendAnywhere'],
      callPipe: [['makeSendInvitation']],
    },
    proposal: {
      // @ts-expect-error XXX BoardRemote
      give: { Send: zero },
    },
    offerArgs: {
      // meaningless address
      destAddr: 'cosmos1qy352eufjjmc9c',
      chainName: 'cosmoshub',
    },
  });

  t.like(
    wallet.getCurrentWalletRecord(),
    { liveOffers: [['send-somewhere']] },
    'live offer until we simulate the transfer ack',
  );

  t.log('restart send-anywhere');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/restart-send-anywhere.js'),
  );

  t.like(
    wallet.getLatestUpdateRecord(),
    {
      updated: 'balance',
      currentAmount: { value: [] },
    },
    'no offerStatus updates',
  );

  // simulate ibc/MsgTransfer ack from remote chain, enabling `.transfer()` promise
  // to resolve
  await runInbound(
    BridgeId.VTRANSFER,
    buildVTransferEvent({
      sender: makeTestAddress(),
      target: makeTestAddress(),
      sourceChannel: 'channel-5',
      sequence: '1',
    }),
  );

  const conclusion = wallet.getLatestUpdateRecord();
  t.like(conclusion, {
    updated: 'offerStatus',
    status: {
      id: 'send-somewhere',
      numWantsSatisfied: 1,
      error: undefined,
    },
  });
  if (conclusion.updated !== 'offerStatus') {
    throw new Error('expected offerStatus');
  }
  t.true('result' in conclusion.status, 'transfer vow settled');
});

const validatorAddress: CosmosValidatorAddress = {
  value: 'cosmosvaloper1test',
  chainId: 'gaiatest',
  encoding: 'bech32',
};
const ATOM_DENOM = 'uatom';

// check for key because the value can be `undefined`
const hasResult = (r: UpdateRecord) => {
  assert(r.updated === 'offerStatus');
  return 'result' in r.status;
};

// Tests restart but not of an orchestration() flow
test.serial('stakeAtom', async t => {
  const {
    buildProposal,
    evalProposal,
    agoricNamesRemotes,
    bridgeUtils: { flushInboundQueue },
    readLatest,
  } = t.context;

  await evalProposal(
    buildProposal('@agoric/builders/scripts/orchestration/init-stakeAtom.js'),
  );

  const wd = await t.context.walletFactoryDriver.provideSmartWallet(
    'agoric1testStakAtom',
  );

  await wd.sendOffer({
    id: 'request-account',
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['stakeAtom'],
      callPipe: [['makeAccountInvitationMaker']],
    },
    proposal: {},
  });
  // cosmos1test is from ibc/mocks.js
  const accountPath = 'published.stakeAtom.accounts.cosmos1test';
  t.throws(() => readLatest(accountPath));
  t.is(await flushInboundQueue(), 1);
  t.deepEqual(readLatest(accountPath), {
    localAddress:
      '/ibc-port/icacontroller-1/ordered/{"version":"ics27-1","controllerConnectionId":"connection-8","hostConnectionId":"connection-649","address":"cosmos1test","encoding":"proto3","txType":"sdk_multi_msg"}/ibc-channel/channel-1',
    remoteAddress:
      '/ibc-hop/connection-8/ibc-port/icahost/ordered/{"version":"ics27-1","controllerConnectionId":"connection-8","hostConnectionId":"connection-649","address":"cosmos1test","encoding":"proto3","txType":"sdk_multi_msg"}/ibc-channel/channel-1',
  });
  // request-account is complete

  const { ATOM } = agoricNamesRemotes.brand;
  assert(ATOM);

  await wd.sendOffer({
    id: 'request-delegate',
    invitationSpec: {
      source: 'continuing',
      previousOffer: 'request-account',
      invitationMakerName: 'Delegate',
      invitationArgs: [validatorAddress, { denom: ATOM_DENOM, value: 10n }],
    },
    proposal: {},
  });
  // no result yet because the IBC incoming messages haven't arrived
  // and won't until we flush.
  t.false(hasResult(wd.getLatestUpdateRecord()));

  t.log('restart stakeAtom');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/restart-stakeAtom.js'),
  );

  t.is(await flushInboundQueue(), 1);
  t.true(hasResult(wd.getLatestUpdateRecord()));
});

// Tests restart of an orchestration() flow while an IBC response is pending.
//
// TODO consider testing this pausing during any pending IBC message. It'll need
// to fresh contract state on each iteration, and since this is a bootstrap test
// that means either restarting bootstrap or starting a new contract and
// restarting that one. For them to share bootstrap they'll each need a unique
// instance name, which will require paramatizing the the two builders scripts
// and the two core-eval functions.
test.serial('basicFlows', async t => {
  const {
    walletFactoryDriver,
    buildProposal,
    evalProposal,
    bridgeUtils: { getInboundQueueLength, flushInboundQueue },
  } = t.context;

  t.log('start basicFlows');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/orchestration/init-basic-flows.js'),
  );

  t.log('making offer');
  const wallet = await walletFactoryDriver.provideSmartWallet('agoric1test');
  const id1 = 'make-orch-account';
  // send because it won't resolve
  await wallet.sendOffer({
    id: id1,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['basicFlows'],
      callPipe: [['makeOrchAccountInvitation']],
    },
    proposal: {},
    offerArgs: {
      chainName: 'cosmoshub',
    },
  });
  // no errors and no result yet
  t.like(wallet.getLatestUpdateRecord(), {
    status: {
      id: id1,
      error: undefined,
      numWantsSatisfied: 1,
      payouts: {},
      result: undefined, // no property
    },
  });
  t.is(getInboundQueueLength(), 1);

  const id2 = 'makePortfolio';
  await wallet.sendOffer({
    id: id2,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['basicFlows'],
      callPipe: [['makePortfolioAccountInvitation']],
    },
    proposal: {},
    offerArgs: {
      chainNames: ['agoric', 'cosmoshub', 'osmosis'],
    },
  });
  // no errors and no result yet
  t.like(wallet.getLatestUpdateRecord(), {
    status: {
      id: id2,
      error: undefined,
      numWantsSatisfied: 1,
      payouts: {},
      result: undefined, // no property
    },
  });
  // 3x ICA Channel Opens, 1x ICQ Channel Open
  t.is(getInboundQueueLength(), 4);

  t.log('restart basicFlows');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/restart-basic-flows.js'),
  );

  t.log('flush and verify results');
  const beforeFlush = wallet.getLatestUpdateRecord();
  t.like(beforeFlush, {
    status: {
      result: undefined,
    },
  });
  t.is(await flushInboundQueue(1), 1);
  t.like(wallet.getLatestUpdateRecord(), {
    status: {
      id: id1,
      error: undefined,
      result: 'UNPUBLISHED',
    },
  });
  t.is(await flushInboundQueue(3), 3);
  t.like(wallet.getLatestUpdateRecord(), {
    status: {
      id: id2,
      error: undefined,
      result: 'UNPUBLISHED',
    },
  });
});
