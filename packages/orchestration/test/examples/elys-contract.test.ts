import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { heapVowE as VE } from '@agoric/vow/vat.js';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E, passStyleOf } from '@endo/far';
import { Nat } from '@endo/nat';
import { M, mustMatch } from '@endo/patterns';
import { createRequire } from 'module';
import { ChainAddressShape } from '../../src/typeGuards.js';
import { buildVTransferEvent } from '../../tools/ibc-mocks.js';
import { commonSetup } from '../supports.js';
import type { CoinSDKType } from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
import {
  buildTxPacketString,
  buildMsgResponseString,
} from '../../tools/ibc-mocks.js';
import {
  MsgTransfer,
  MsgTransferResponse,
} from '@agoric/cosmic-proto/ibc/applications/transfer/v1/tx.js';
import type { IBCEvent } from '@agoric/vats';
import type { ChainAddress } from '../../src/orchestration-api.js';
import { MsgLiquidStakeResponse } from '../../cosmic-proto/dist/codegen/stride/stakeibc/tx.js';
import { MsgSendResponse } from '@agoric/cosmic-proto/cosmos/bank/v1beta1/tx.js';

const nodeRequire = createRequire(import.meta.url);

const contractName = 'elysStrideContract';
const contractFile = nodeRequire.resolve('../../src/examples/elys.contract.js');
type StartFn = typeof import('../../src/examples/elys.contract.js').start;

const deposit = async (
  coins: CoinSDKType,
  source_channel: any,
  sender: string,
  receiver: ChainAddress,
  transferBridge
) => {
  await E(transferBridge).fromBridge(
    buildVTransferEvent({
      receiver: receiver.value,
      target: receiver.value,
      sourceChannel: source_channel,
      denom: coins.denom,
      amount: Nat(BigInt(coins.amount)),
      sender,
    }),
  );
  await eventLoopIteration();
};

test('Failing case: IBC transfer from host to stride chain fails, user receives token at host chain address', async t => {
  const {
    bootstrap: { storage },
    commonPrivateArgs,
    mocks: { transferBridge, ibcBridge, },
    utils: { inspectLocalBridge,inspectDibcBridge, transmitTransferAck },
  } = await commonSetup(t);

  const { zoe, bundleAndInstall } = await setUpZoeForTest();

  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);
  t.is(passStyleOf(installation), 'remotable');

  const storageNode = await E(storage.rootNode).makeChildNode(contractName);

  const myContract = await E(zoe).startInstance(
    installation,
    undefined,
    {},
    { ...commonPrivateArgs, storageNode },
  );
  t.notThrows(() =>
    mustMatch(
      myContract,
      M.splitRecord({
        instance: M.remotable(),
        publicFacet: M.remotable(),
        creatorFacet: M.remotable(),
      }),
    ),
  );

  const agorichookAddress = await E(myContract.publicFacet).getLocalAddress();
  t.log('agorichookAddress', agorichookAddress);

  t.notThrows(() => mustMatch(agorichookAddress, ChainAddressShape));

  // send atom for stride liquid staking
  await t.notThrowsAsync(
    deposit(
      { amount: '10', denom: 'uatom' },
      'channel-405',
      'cosmos175c7xwly7nwycghwww87x83h56tdkjxzjfv55d',
      agorichookAddress,
      transferBridge
    ),
  );

  const { messages, address: execAddr } = inspectLocalBridge().at(-1);
  t.is(messages?.length, 1, 'transfer message sent');
  t.like(
    messages[0],
    {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      receiver: 'cosmos1test2',
      sender: execAddr,
      sourceChannel: 'channel-5',
      token: {
        amount: '10',
      },
    },
    'tokens transferred from LOA to COA',
  );

  // MsgSend response from host ICA to users address on host 10 uatom
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ21vS0hDOWpiM050YjNNdVltRnVheTUyTVdKbGRHRXhMazF6WjFObGJtUVNTZ29NWTI5emJXOXpNWFJsYzNReUVpMWpiM050YjNNeE56VmpOM2gzYkhrM2JuZDVZMmRvZDNkM09EZDRPRE5vTlRaMFpHdHFlSHBxWm5ZMU5XUWFDd29GZFdGMGIyMFNBakV3IiwibWVtbyI6IiJ9',
    buildMsgResponseString(MsgSendResponse, {}),
  );
  
  await transmitTransferAck();
});



test('Failing case: Liquid stake on stride fails, user receives token at stride chain address', async t => {
  const {
    bootstrap: { storage },
    commonPrivateArgs,
    mocks: { transferBridge, ibcBridge, },
    utils: { inspectLocalBridge,inspectDibcBridge, transmitTransferAck },
  } = await commonSetup(t);


  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  t.log('contract deployment', contractName);

  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);
  t.is(passStyleOf(installation), 'remotable');

  const storageNode = await E(storage.rootNode).makeChildNode(contractName);
  

  const myContract = await E(zoe).startInstance(
    installation,
    undefined, // issuers
    {}, // terms
    { ...commonPrivateArgs, storageNode },
  );
  t.notThrows(() =>
    mustMatch(
      myContract,
      M.splitRecord({
        instance: M.remotable(),
        publicFacet: M.remotable(),
        creatorFacet: M.remotable(),
      }),
    ),
  );

  const agorichookAddress = await E(myContract.publicFacet).getLocalAddress();
  t.log('agorichookAddress', agorichookAddress);

  t.notThrows(() => mustMatch(agorichookAddress, ChainAddressShape));

  // send atom for stride liquid staking
  await t.notThrowsAsync(
    deposit(
      { amount: '10', denom: 'uatom' },
      'channel-405',
      'cosmos175c7xwly7nwycghwww87x83h56tdkjxzjfv55d',
      agorichookAddress,
      transferBridge
    ),
  );

  const { messages, address: execAddr } = inspectLocalBridge().at(-1);
  t.is(messages?.length, 1, 'transfer message sent');
  t.like(
    messages[0],
    {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      receiver: 'cosmos1test2',
      sender: execAddr,
      sourceChannel: 'channel-5',
      token: {
        amount: '10',
      },
    },
    'tokens transferred from LOA to COA',
  );

  // Move uatom to users stride address response
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ3FrQkNod3ZZMjl6Ylc5ekxtSmhibXN1ZGpGaVpYUmhNUzVOYzJkVFpXNWtFb2dCQ2d0amIzTnRiM014ZEdWemRCSXRjM1J5YVdSbE1UYzFZemQ0ZDJ4NU4yNTNlV05uYUhkM2R6ZzNlRGd6YURVMmRHUnJhbmg2TTNwMlozRndHa29LUkdsaVl5OUNRekZFUTBNek5EbEZPRGhGUkRnME9FSTRNa0kxUWpnNU9VVkNSVVZEUlVJM1FqVTNRemd4TnpWQk1qWTFNRVkzT1RneU5UZzFNREl5TmprMFFVRTBFZ0l4TUE9PSIsIm1lbW8iOiIifQ==',
    buildMsgResponseString(MsgSendResponse, {}),
  );
  
  // ack for transfer of atom from hub to stride
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ25VS0tTOXBZbU11WVhCd2JHbGpZWFJwYjI1ekxuUnlZVzV6Wm1WeUxuWXhMazF6WjFSeVlXNXpabVZ5RWtnS0NIUnlZVzV6Wm1WeUVndGphR0Z1Ym1Wc0xUTTVNUm9MQ2dWMVlYUnZiUklDTVRBaURHTnZjMjF2Y3pGMFpYTjBNaW9MWTI5emJXOXpNWFJsYzNReUFEaUE4SkxMM1FnPSIsIm1lbW8iOiIifQ==',
    buildMsgResponseString(MsgTransferResponse, { sequence: 1n }),
  );
  
  await transmitTransferAck();

  const acknowledgements = (await inspectDibcBridge()).bridgeEvents;

  for(const ack of acknowledgements){
    t.log("acknowledgement ", ack as IBCEvent<'acknowledgementPacket'>)
  }
});

test('Failing case: IBC transfer of statom from stride to elys chain fails, user receives sttoken at stride chain address', async t => {
  const {
    bootstrap: { storage },
    commonPrivateArgs,
    mocks: { transferBridge, ibcBridge, },
    utils: { inspectLocalBridge,inspectDibcBridge, transmitTransferAck },
  } = await commonSetup(t);


  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  t.log('contract deployment', contractName);

  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);
  t.is(passStyleOf(installation), 'remotable');

  const storageNode = await E(storage.rootNode).makeChildNode(contractName);

  const myContract = await E(zoe).startInstance(
    installation,
    undefined, // issuers
    {}, // terms
    { ...commonPrivateArgs, storageNode },
  );
  t.notThrows(() =>
    mustMatch(
      myContract,
      M.splitRecord({
        instance: M.remotable(),
        publicFacet: M.remotable(),
        creatorFacet: M.remotable(),
      }),
    ),
  );

  const agorichookAddress = await E(myContract.publicFacet).getLocalAddress();
  t.log('agorichookAddress', agorichookAddress);

  t.notThrows(() => mustMatch(agorichookAddress, ChainAddressShape));

  // send atom for stride liquid staking
  await t.notThrowsAsync(
    deposit(
      { amount: '10', denom: 'uatom' },
      'channel-405',
      'cosmos175c7xwly7nwycghwww87x83h56tdkjxzjfv55d',
      agorichookAddress,
      transferBridge
    ),
  );

  const { messages, address: execAddr } = inspectLocalBridge().at(-1);
  t.is(messages?.length, 1, 'transfer message sent');
  t.like(
    messages[0],
    {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      receiver: 'cosmos1test2',
      sender: execAddr,
      sourceChannel: 'channel-5',
      token: {
        amount: '10',
      },
    },
    'tokens transferred from LOA to COA',
  );

  // Liquid stake response from stride
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ2pzS0h5OXpkSEpwWkdVdWMzUmhhMlZwWW1NdVRYTm5UR2x4ZFdsa1UzUmhhMlVTR0FvTFkyOXpiVzl6TVhSbGMzUVNBakV3R2dWMVlYUnZiUT09IiwibWVtbyI6IiJ9',
    buildMsgResponseString(MsgLiquidStakeResponse, {stToken: {denom: 'statom', amount: '1800000'}}),
  );
  // ack for transfer of atom from hub to stride
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ25VS0tTOXBZbU11WVhCd2JHbGpZWFJwYjI1ekxuUnlZVzV6Wm1WeUxuWXhMazF6WjFSeVlXNXpabVZ5RWtnS0NIUnlZVzV6Wm1WeUVndGphR0Z1Ym1Wc0xUTTVNUm9MQ2dWMVlYUnZiUklDTVRBaURHTnZjMjF2Y3pGMFpYTjBNaW9MWTI5emJXOXpNWFJsYzNReUFEaUE4SkxMM1FnPSIsIm1lbW8iOiIifQ==',
    buildMsgResponseString(MsgTransferResponse, { sequence: 1n }),
  );
  // ack for transfer of statom from stride ICA to stride user address
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ204S0hDOWpiM050YjNNdVltRnVheTUyTVdKbGRHRXhMazF6WjFObGJtUVNUd29MWTI5emJXOXpNWFJsYzNRU0xYTjBjbWxrWlRFM05XTTNlSGRzZVRkdWQzbGpaMmgzZDNjNE4zZzRNMmcxTm5Sa2EycDRlak42ZG1keGNCb1JDZ1p6ZEdGMGIyMFNCekU0TURBd01EQT0iLCJtZW1vIjoiIn0=',
    buildMsgResponseString(MsgSendResponse, { sequence: 1n }),
  );
  
  await transmitTransferAck();

  const acknowledgements = (await inspectDibcBridge()).bridgeEvents;

  for(const ack of acknowledgements){
    t.log("acknowledgement ", ack as IBCEvent<'acknowledgementPacket'>)
  }
});

test('Happy Flow: input atom at agoric receives statom on elys', async t => {
  const {
    bootstrap: { storage },
    commonPrivateArgs,
    mocks: { transferBridge, ibcBridge, },
    utils: { inspectLocalBridge,inspectDibcBridge, transmitTransferAck },
  } = await commonSetup(t);


  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  t.log('contract deployment', contractName);

  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);
  t.is(passStyleOf(installation), 'remotable');

  const storageNode = await E(storage.rootNode).makeChildNode(contractName);
  

  const myContract = await E(zoe).startInstance(
    installation,
    undefined, // issuers
    {}, // terms
    { ...commonPrivateArgs, storageNode },
  );
  t.notThrows(() =>
    mustMatch(
      myContract,
      M.splitRecord({
        instance: M.remotable(),
        publicFacet: M.remotable(),
        creatorFacet: M.remotable(),
      }),
    ),
  );

  const agorichookAddress = await E(myContract.publicFacet).getLocalAddress();
  t.log('agorichookAddress', agorichookAddress);

  t.notThrows(() => mustMatch(agorichookAddress, ChainAddressShape));

  // send atom for stride liquid staking
  await t.notThrowsAsync(
    deposit(
      { amount: '10', denom: 'uatom' },
      'channel-405',
      'cosmos175c7xwly7nwycghwww87x83h56tdkjxzjfv55d',
      agorichookAddress,
      transferBridge
    ),
  );

  const { messages, address: execAddr } = inspectLocalBridge().at(-1);
  t.is(messages?.length, 1, 'transfer message sent');
  t.like(
    messages[0],
    {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      receiver: 'cosmos1test2',
      sender: execAddr,
      sourceChannel: 'channel-5',
      token: {
        amount: '10',
      },
    },
    'tokens transferred from LOA to COA',
  );

  // Liquid stake response from stride
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ2pzS0h5OXpkSEpwWkdVdWMzUmhhMlZwWW1NdVRYTm5UR2x4ZFdsa1UzUmhhMlVTR0FvTFkyOXpiVzl6TVhSbGMzUVNBakV3R2dWMVlYUnZiUT09IiwibWVtbyI6IiJ9',
    buildMsgResponseString(MsgLiquidStakeResponse, {stToken: {denom: 'statom', amount: '1800000'}}),
  );
  // ack for transfer of atom from hub to stride
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ25VS0tTOXBZbU11WVhCd2JHbGpZWFJwYjI1ekxuUnlZVzV6Wm1WeUxuWXhMazF6WjFSeVlXNXpabVZ5RWtnS0NIUnlZVzV6Wm1WeUVndGphR0Z1Ym1Wc0xUTTVNUm9MQ2dWMVlYUnZiUklDTVRBaURHTnZjMjF2Y3pGMFpYTjBNaW9MWTI5emJXOXpNWFJsYzNReUFEaUE4SkxMM1FnPSIsIm1lbW8iOiIifQ==',
    buildMsgResponseString(MsgTransferResponse, { sequence: 1n }),
  );
  // ack for transfer of statom from stride to elys
  ibcBridge.addMockAck(
    'eyJ0eXBlIjoxLCJkYXRhIjoiQ3BvQkNpa3ZhV0pqTG1Gd2NHeHBZMkYwYVc5dWN5NTBjbUZ1YzJabGNpNTJNUzVOYzJkVWNtRnVjMlpsY2hKdENnaDBjbUZ1YzJabGNoSUxZMmhoYm01bGJDMDVPVGthRVFvR2MzUmhkRzl0RWdjeE9EQXdNREF3SWd0amIzTnRiM014ZEdWemRDb3JaV3g1Y3pFM05XTTNlSGRzZVRkdWQzbGpaMmgzZDNjNE4zZzRNMmcxTm5Sa2EycDRlbXBtTkc1bE1ESUFPSUR3a3N2ZENBPT0iLCJtZW1vIjoiIn0=',
    buildMsgResponseString(MsgTransferResponse, { sequence: 1n }),
  );
  
  await transmitTransferAck();

  const acknowledgements = (await inspectDibcBridge()).bridgeEvents;

  for(const ack of acknowledgements){
    t.log("acknowledgement ", ack as IBCEvent<'acknowledgementPacket'>)
  }
});