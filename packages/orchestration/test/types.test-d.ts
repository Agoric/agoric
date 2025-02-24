/**
 * @file pure types types, no runtime, ignored by Ava
 */

import type { HostInterface, HostOf } from '@agoric/async-flow';
import { type AnyJson, type JsonSafe, typedJson } from '@agoric/cosmic-proto';
import type {
  QueryAllBalancesResponse,
  QueryBalanceResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import type { MsgDelegateResponse } from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import type { ResponseQuery } from '@agoric/cosmic-proto/tendermint/abci/types.js';
import type { Vow, VowTools } from '@agoric/vow';
import type { ResolvedPublicTopic } from '@agoric/zoe/src/contractSupport/topics.js';
import type { Passable } from '@endo/marshal';
import { expectAssignable, expectNotType, expectType } from 'tsd';
import type { TxBody } from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx.js';
import type {
  TargetApp,
  TargetRegistration,
} from '@agoric/vats/src/bridge-target.js';
import { prepareCosmosOrchestrationAccount } from '../src/exos/cosmos-orchestration-account.js';
import type { LocalOrchestrationAccountKit } from '../src/exos/local-orchestration-account.js';
import type { OrchestrationFacade } from '../src/facade.js';
import type {
  AmountArg,
  Chain,
  ChainAddress,
  ChainInfo,
  CosmosChainInfo,
  CosmosValidatorAddress,
  DenomAmount,
  OrchestrationAccount,
  Orchestrator,
  StakingAccountActions,
} from '../src/types.js';
import type { ResolvedContinuingOfferResult } from '../src/utils/zoe-tools.js';

const anyVal = null as any;

const vt: VowTools = null as any;

const validatorAddr = {
  chainId: 'agoric3',
  value: 'agoric1valoperhello',
  encoding: 'bech32',
} as const;
expectType<CosmosValidatorAddress>(validatorAddr);

const chainAddr = {
  chainId: 'agoric-3',
  value: 'agoric1pleab',
  encoding: 'bech32',
} as const;
expectType<ChainAddress>(chainAddr);
expectNotType<CosmosValidatorAddress>(chainAddr);

{
  // @ts-expect-error
  const notVa: CosmosValidatorAddress = chainAddr;
}

{
  const lcak: LocalOrchestrationAccountKit = null as any;
  const results = await lcak.holder.executeTx([
    typedJson('/cosmos.staking.v1beta1.MsgDelegate', {
      amount: {
        amount: '1',
        denom: 'ubld',
      },
      validatorAddress: 'agoric1valoperhello',
      delegatorAddress: 'agoric1pleab',
    }),
    typedJson('/cosmos.bank.v1beta1.QueryAllBalancesRequest', {
      address: 'agoric1pleab',
    }),
  ] as const);
  expectType<MsgDelegateResponse>(results[0]);
  expectType<QueryAllBalancesResponse>(results[1]);
}

// CosmosOrchestrationAccount interfaces
{
  const makeCosmosOrchestrationAccount = prepareCosmosOrchestrationAccount(
    anyVal,
    anyVal,
  );
  makeCosmosOrchestrationAccount(
    anyVal,
    anyVal,
  ) satisfies HostInterface<StakingAccountActions>;
}

// HostOf
{
  type PromiseFn = () => Promise<number>;
  type SyncFn = () => number;

  type VowFn = HostOf<PromiseFn>;
  type StillSyncFn = HostOf<SyncFn>;

  // Use type assertion instead of casting
  const vowFn: VowFn = (() => ({}) as Vow<number>) as VowFn;
  expectType<() => Vow<number>>(vowFn);

  const syncFn: StillSyncFn = (() => 42) as StillSyncFn;
  expectType<() => number>(syncFn);

  // Negative test
  expectNotType<() => Promise<number>>(vowFn);

  const getDenomInfo: HostOf<Orchestrator['getDenomInfo']> = null as any;
  const chainHostOf = getDenomInfo('uatom', 'cosmoshub').chain;
  expectType<Vow<any>>(chainHostOf.getChainInfo());
}

{
  // HostInterface

  const chain: Chain<ChainInfo> = null as any;
  expectType<Promise<ChainInfo>>(chain.getChainInfo());
  const chainHostInterface: HostInterface<Chain<ChainInfo>> = null as any;
  expectType<Vow<ChainInfo>>(chainHostInterface.getChainInfo());

  const publicTopicRecord: HostInterface<
    Record<string, ResolvedPublicTopic<unknown>>
  > = {
    someTopic: {
      subscriber: null as any,
      storagePath: 'published.somewhere',
    },
  };
  // @ts-expect-error the promise from `subscriber.getUpdateSince` can't be used in a flow
  expectType<Record<string, ResolvedPublicTopic<unknown>>>(publicTopicRecord);
}

// HostOf with TransferSteps
{
  type TransferStepsVow = HostOf<OrchestrationAccount<any>['transferSteps']>;

  const transferStepsVow: TransferStepsVow = (...args: any[]): Vow<any> =>
    ({}) as any;
  expectType<(...args: any[]) => Vow<any>>(transferStepsVow);
}

// VowifyAll
{
  type PromiseObject = {
    foo: () => Promise<number>;
    bar: (x: string) => Promise<boolean>;
    bizz: () => Record<string, number>;
  };

  type VowObject = HostInterface<PromiseObject>;

  const vowObject: VowObject = {
    foo: () => ({}) as Vow<number>,
    bar: (x: string) => ({}) as Vow<boolean>,
    bizz: () => ({ foo: 1 }),
  };

  expectType<{
    foo: () => Vow<number>;
    bar: (x: string) => Vow<boolean>;
    bizz: () => Record<string, number>;
  }>(vowObject);
}

{
  // orchestrate()

  const facade: OrchestrationFacade = null as any;
  const echo = <T extends number>(orc: Orchestrator, ctx: undefined, num: T) =>
    num;
  // @ts-expect-error requires an async function
  facade.orchestrate('name', undefined, echo);

  const slowEcho = <T extends number>(
    orc: Orchestrator,
    ctx: undefined,
    num: T,
  ) => Promise.resolve(num);
  {
    const h = facade.orchestrate('name', undefined, slowEcho);
    // TODO keep the return type as Vow<T>
    expectType<(num: number) => Vow<number>>(h);
    expectType<Vow<number>>(h(42));
    // @ts-expect-error literal not carried, widened to number
    expectType<Vow<42>>(h(42));
  }

  const makeOfferResult = () =>
    Promise.resolve({} as ResolvedContinuingOfferResult);
  {
    const h = facade.orchestrate('name', undefined, makeOfferResult);
    expectType<Vow<ResolvedContinuingOfferResult>>(h());
  }
}

// Test LocalChain.query()
{
  type ChainFacade = Chain<{ chainId: 'agoriclocal' }>;
  const localChain: ChainFacade = null as any;
  const results = localChain.query([
    typedJson('/cosmos.bank.v1beta1.QueryBalanceRequest', {
      address: 'agoric1pleab',
      denom: 'ubld',
    }),
    typedJson('/cosmos.bank.v1beta1.QueryAllBalancesRequest', {
      address: 'agoric1pleab',
    }),
  ] as const);

  expectType<ReturnType<ChainFacade['query']>>(results);
  expectType<{ reply: JsonSafe<QueryBalanceResponse> }>(results[0]);
  expectType<{ reply: JsonSafe<QueryAllBalancesResponse> }>(results[1]);
}

// Test RemoteCosmosChain.query() (icqEnabled: true)
{
  type ChainFacade = Chain<CosmosChainInfo & { icqEnabled: true }>;
  const remoteChain: ChainFacade = null as any;
  const results = remoteChain.query([
    {
      path: '/cosmos.staking.v1beta1.Query/Delegation',
      data: 'base64bytes=',
      height: '1',
      prove: true,
    },
    {
      path: '/cosmos.bank.v1beta1.Query/Balance',
      data: 'base64bytes=',
      height: '1',
      prove: true,
    },
  ] as const);

  expectType<ReturnType<ChainFacade['query']>>(results);
  expectType<JsonSafe<ResponseQuery>>(results[0]);
  expectType<JsonSafe<ResponseQuery>>(results[1]);
}

// Test RemoteCosmosChain.query() (icqEnabled: false)
{
  type ChainFacade = Chain<CosmosChainInfo>;
  const remoteChain: ChainFacade = null as any;

  expectType<never>(remoteChain.query);

  // @ts-expect-error query will throw an error
  const results = remoteChain.query([
    {
      path: '/cosmos.bank.v1beta1.Query/Balance',
      data: 'base64bytes=',
      height: '1',
      prove: true,
    },
  ] as const);
}

{
  const addr = {
    chainId: 'chainId',
    encoding: 'bech32',
    value: 'agoric1valoperfoo',
  };
  expectAssignable<Passable>(addr);
  const denomAmount = { denom: 'bld', value: 10n };
  expectAssignable<Passable>(denomAmount);

  // XXX when these types are interfaces this test fails.
  // TODO https://github.com/Agoric/agoric-sdk/issues/9822
  expectAssignable<Passable>(addr as CosmosValidatorAddress);
  expectAssignable<Passable>(denomAmount as DenomAmount);
}

// Test LocalAccountMethods
{
  type ChainFacade = Chain<CosmosChainInfo & { chainId: 'agoric-3' }>;
  const remoteChain: ChainFacade = null as any;

  const account = await remoteChain.makeAccount();

  // Verify monitorTransfers is available
  expectType<(tap: TargetApp) => Promise<TargetRegistration>>(
    account.monitorTransfers,
  );

  // Verify StakingAccountActions are available (StakingAccountQueries not yet supported)
  expectType<
    (validator: CosmosValidatorAddress, amount: AmountArg) => Promise<void>
  >(account.delegate);

  // @ts-expect-error executeEncodedTx not available on localAccount
  expectType<() => Promise<string>>(account.executeEncodedTx);
}

// Test CosmosChainAccountMethods
{
  type ChainFacade = Chain<
    CosmosChainInfo & {
      chainId: 'cosmoshub-4';
      stakingTokens: [{ denom: 'uatom' }];
    }
  >;
  const remoteChain: ChainFacade = null as any;

  const account = await remoteChain.makeAccount();

  // Verify executeEncodedTx is available
  expectType<
    (
      msgs: AnyJson[],
      opts?: Partial<Omit<TxBody, 'messages'>>,
    ) => Promise<string>
  >(account.executeEncodedTx);

  // Verify delegate is available via stakingTokens parameter
  expectType<
    (validator: CosmosValidatorAddress, amount: AmountArg) => Promise<void>
  >(account.delegate);

  expectType<(destination: ChainAddress, amount: AmountArg) => Promise<void>>(
    // @ts-expect-error `depositForBurn` only available for noble
    account.depositForBurn,
  );
}

// Test NobleAccountMethods
{
  type ChainFacade = Chain<
    CosmosChainInfo & {
      chainId: 'noble-1';
    }
  >;
  const remoteChain: ChainFacade = null as any;
  const account = await remoteChain.makeAccount();

  expectType<(destination: ChainAddress, amount: AmountArg) => Promise<void>>(
    account.depositForBurn,
  );

  // Verify delegate is not available (no stakingTokens parameter)
  expectType<
    (validator: CosmosValidatorAddress, amount: AmountArg) => Promise<void>
    // @ts-expect-error StakingMethods not available on noble
  >(account.delegate);
}
