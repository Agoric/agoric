import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { toRequestQueryJson } from '@agoric/cosmic-proto';
import {
  QueryBalanceRequest,
  QueryBalanceResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import {
  MsgDelegate,
  MsgDelegateResponse,
} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import { matches } from '@endo/patterns';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { decodeBase64 } from '@endo/base64';
import type { LocalIbcAddress } from '@agoric/vats/tools/ibc-utils.js';
import { getMethodNames } from '@agoric/internal';
import { Port } from '@agoric/network';
import { commonSetup } from './supports.js';
import { ChainAddressShape } from '../src/typeGuards.js';
import { tryDecodeResponse } from '../src/utils/cosmos.js';

const CHAIN_ID = 'cosmoshub-99';
const HOST_CONNECTION_ID = 'connection-0';
const CONTROLLER_CONNECTION_ID = 'connection-1';

test('makeICQConnection returns an ICQConnection', async t => {
  const {
    bootstrap: { cosmosInterchainService },
  } = await commonSetup(t);

  const icqConnection = await E(cosmosInterchainService).provideICQConnection(
    CONTROLLER_CONNECTION_ID,
  );
  const [localAddr, remoteAddr] = await Promise.all([
    E(icqConnection).getLocalAddress(),
    E(icqConnection).getRemoteAddress(),
  ]);
  t.log(icqConnection, {
    localAddr,
    remoteAddr,
  });
  t.regex(localAddr, /ibc-port\/icqcontroller-\d+/);
  t.regex(
    remoteAddr,
    new RegExp(`/ibc-hop/${CONTROLLER_CONNECTION_ID}`),
    'remote address contains provided connectionId',
  );
  t.regex(
    remoteAddr,
    /icqhost\/unordered\/icq-1/,
    'remote address contains icqhost port, unordered ordering, and icq-1 version string',
  );

  const icqConnection2 = await E(cosmosInterchainService).provideICQConnection(
    CONTROLLER_CONNECTION_ID,
  );
  const localAddr2 = await E(icqConnection2).getLocalAddress();
  t.is(localAddr, localAddr2, 'provideICQConnection is idempotent');

  const [result] = await E(icqConnection).query([
    toRequestQueryJson(
      QueryBalanceRequest.toProtoMsg({
        address: 'cosmos1test',
        denom: 'uatom',
      }),
    ),
  ]);

  t.like(QueryBalanceResponse.decode(decodeBase64(result.key)), {
    balance: { amount: '0', denom: 'uatom' },
  });

  const icqConnection3 = await E(cosmosInterchainService).provideICQConnection(
    CONTROLLER_CONNECTION_ID,
    'icq-2',
  );
  const localAddr3 = await E(icqConnection3).getLocalAddress();
  t.not(
    localAddr3,
    localAddr2,
    'non default version results in a new connection',
  );

  const icqConnection4 = await E(cosmosInterchainService).provideICQConnection(
    CONTROLLER_CONNECTION_ID,
    'icq-2',
  );
  const localAddr4 = await E(icqConnection4).getLocalAddress();
  t.is(localAddr3, localAddr4, 'custom version is idempotent');

  const icqConnection5 = await E(cosmosInterchainService).provideICQConnection(
    'connection-99',
  );
  const localAddr5 = await E(icqConnection5).getLocalAddress();

  const getPortId = (lAddr: LocalIbcAddress) => lAddr.split('/')[2];
  const uniquePortIds = new Set(
    [localAddr, localAddr2, localAddr3, localAddr4, localAddr5].map(getPortId),
  );
  t.regex([...uniquePortIds][0], /icqcontroller-\d+/);
  t.is(uniquePortIds.size, 1, 'all connections share same port');

  await t.throwsAsync(
    // @ts-expect-error icqConnectionKit doesn't have a port method
    () => E(icqConnection).getPort(),
    undefined,
    'ICQConnection Kit does not expose its port',
  );
});

test('makeAccount returns an IcaAccountKit', async t => {
  const {
    bootstrap: { cosmosInterchainService },
  } = await commonSetup(t);

  const account = await E(cosmosInterchainService).makeAccount(
    CHAIN_ID,
    HOST_CONNECTION_ID,
    CONTROLLER_CONNECTION_ID,
  );
  const [localAddr, remoteAddr, chainAddr, port] = await Promise.all([
    E(account).getLocalAddress(),
    E(account).getRemoteAddress(),
    E(account).getAddress(),
    E(account).getPort(),
  ]);
  t.log(account, {
    localAddr,
    remoteAddr,
    chainAddr,
  });
  t.regex(localAddr, /ibc-port\/icacontroller-\d+/);
  t.regex(
    remoteAddr,
    new RegExp(`/ibc-hop/${CONTROLLER_CONNECTION_ID}`),
    'remote address contains provided connectionId',
  );
  t.regex(
    remoteAddr,
    /icahost\/ordered/,
    'remote address contains icahost port, ordered ordering',
  );
  t.regex(
    remoteAddr,
    /"version":"ics27-1"(.*)"encoding":"proto3"/,
    'remote address contains version and encoding in version string',
  );
  t.true(
    (
      ['addListener', 'removeListener', 'connect', 'revoke'] as (keyof Port)[]
    ).every(method => getMethodNames(port).includes(method)),
    'IcaAccountKit returns a Port remotable',
  );

  t.true(matches(chainAddr, ChainAddressShape));
  t.regex(chainAddr.value, /cosmos1test/);

  const delegateMsg = Any.toJSON(
    MsgDelegate.toProtoMsg({
      delegatorAddress: 'cosmos1test',
      validatorAddress: 'cosmosvaloper1test',
      amount: { denom: 'uatom', amount: '10' },
    }),
  );

  const delegateResp = await E(account).executeEncodedTx([delegateMsg]);
  t.deepEqual(
    tryDecodeResponse(delegateResp, MsgDelegateResponse.fromProtoMsg),
    {},
  );

  await E(account).close();
  await t.throwsAsync(
    E(account).executeEncodedTx([delegateMsg]),
    {
      message: 'Connection closed',
    },
    'cannot execute transaction if connection is closed',
  );
});

test('makeAccount accepts opts (version, ordering, encoding)', async t => {
  const {
    bootstrap: { cosmosInterchainService },
  } = await commonSetup(t);

  const account = await E(cosmosInterchainService).makeAccount(
    CHAIN_ID,
    HOST_CONNECTION_ID,
    CONTROLLER_CONNECTION_ID,
    { version: 'ics27-2', ordering: 'unordered', encoding: 'json' },
  );
  const [localAddr, remoteAddr] = await Promise.all([
    E(account).getLocalAddress(),
    E(account).getRemoteAddress(),
  ]);
  t.log({
    localAddr,
    remoteAddr,
  });
  for (const addr of [localAddr, remoteAddr]) {
    t.regex(addr, /unordered/, 'remote address contains unordered ordering');
    t.regex(
      addr,
      /"version":"ics27-2"(.*)"encoding":"json"/,
      'remote address contains version and encoding in version string',
    );
  }
});
