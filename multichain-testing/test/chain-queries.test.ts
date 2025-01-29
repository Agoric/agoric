import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import {
  QueryBalanceRequest,
  QueryBalanceResponse,
  QueryAllBalancesRequest,
  QueryAllBalancesResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import { toRequestQueryJson, typedJson } from '@agoric/cosmic-proto';
import { decodeBase64 } from '@endo/base64';
import {
  commonSetup,
  type SetupContextWithWallets,
  chainConfig,
  FAUCET_POUR,
} from './support.js';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { createWallet } from '../tools/wallet.js';
import { makeQueryClient } from '../tools/query.js';

const test = anyTest as TestFn<SetupContextWithWallets>;

const accounts = ['osmosis', 'cosmoshub', 'agoric'];

const contractName = 'queryFlows';
const contractBuilder =
  '../packages/builders/scripts/testing/start-query-flows.js';

test.before(async t => {
  const { deleteTestKeys, setupTestKeys, ...rest } = await commonSetup(t);
  await deleteTestKeys(accounts).catch();
  const wallets = await setupTestKeys(accounts);
  t.context = { ...rest, wallets, deleteTestKeys };
  const { startContract } = rest;
  await startContract(contractName, contractBuilder);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  deleteTestKeys(accounts);
});

const queryICQChain = test.macro({
  title: (_, chainName: string) => `Send ICQ Query on ${chainName}`,
  exec: async (t, chainName: string) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);
    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
    } = t.context;

    const { creditFromFaucet, chainInfo, getRestEndpoint } =
      useChain(chainName);
    const { staking, bech32_prefix } = chainInfo.chain;
    const denom = staking?.staking_tokens?.[0].denom;
    if (!denom) throw Error(`no denom for ${chainName}`);

    t.log(
      'Set up wallet with tokens so we have a wallet with balance to query',
    );
    const wallet = await createWallet(bech32_prefix);
    const { address } = (await wallet.getAccounts())[0];
    await creditFromFaucet(address);

    const remoteQueryClient = makeQueryClient(await getRestEndpoint());
    await retryUntilCondition(
      () => remoteQueryClient.queryBalances(address),
      ({ balances }) => Number(balances?.[0]?.amount) > 0,
      `Faucet balances found for ${address}`,
    );

    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} sendICQQuery offer`);
    const offerId = `${chainName}-sendICQQuery-${Date.now()}`;

    const balanceQuery = toRequestQueryJson(
      QueryBalanceRequest.toProtoMsg({
        address,
        denom,
      }),
    );
    const allBalanceQuery = toRequestQueryJson(
      QueryAllBalancesRequest.toProtoMsg({
        address,
      }),
    );

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeSendICQQueryInvitation']],
      },
      offerArgs: { chainName, msgs: [balanceQuery, allBalanceQuery] },
      proposal: {},
    });

    const offerResult = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
      ({ status }) => status.id === offerId && (status.result || status.error),
      `${offerId} offer result is in vstorage`,
      {
        maxRetries: 15,
      },
    );
    t.log('ICQ Query Offer Result', offerResult);
    const {
      status: { result, error },
    } = offerResult;
    t.is(error, undefined, 'No error observed');

    const [balanceQueryResult, allBalanceQueryResult] = JSON.parse(result);

    t.is(balanceQueryResult.code, 0, 'balance query was successful');
    const balanceQueryResultDecoded = QueryBalanceResponse.decode(
      decodeBase64(balanceQueryResult.key),
    );
    t.log('balanceQueryResult', balanceQueryResultDecoded);
    t.deepEqual(balanceQueryResultDecoded, {
      balance: {
        amount: String(FAUCET_POUR),
        denom,
      },
    });

    t.is(allBalanceQueryResult.code, 0, 'allBalances query was successful');
    const allBalanceQueryResultDecoded = QueryAllBalancesResponse.decode(
      decodeBase64(allBalanceQueryResult.key),
    );
    t.log('allBalanceQueryResult', allBalanceQueryResultDecoded);
    t.like(allBalanceQueryResultDecoded, {
      balances: [
        {
          amount: String(FAUCET_POUR),
          denom,
        },
      ],
    });
  },
});

const queryChainWithoutICQ = test.macro({
  title: (_, chainName: string) =>
    `Attempt Query on chain with ICQ ${chainName}`,
  exec: async (t, chainName: string) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);
    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
    } = t.context;

    const { chainInfo } = useChain(chainName);
    const { staking, chain_id } = chainInfo.chain;
    const denom = staking?.staking_tokens?.[0].denom;
    if (!denom) throw Error(`no denom for ${chainName}`);

    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} sendICQQuery offer (unsupported)`);
    const offerId = `${chainName}-sendICQQuery-${Date.now()}`;

    const balanceQuery = toRequestQueryJson(
      QueryBalanceRequest.toProtoMsg({
        address: 'cosmos1234',
        denom,
      }),
    );

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeSendICQQueryInvitation']],
      },
      offerArgs: { chainName, msgs: [balanceQuery] },
      proposal: {},
    });

    const offerResult = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
      ({ status }) => status.id === offerId && (status.result || status.error),
      `${offerId} continuing invitation is in vstorage`,
      {
        maxRetries: 10,
      },
    );
    t.is(
      offerResult.status.error,
      `Error: Queries not available for chain "${chain_id}"`,
      'Queries not available error returned',
    );
  },
});

test.serial('Send Local Query from chain object', async t => {
  const { wallets, provisionSmartWallet, vstorageClient, retryUntilCondition } =
    t.context;

  const agoricAddr = wallets['agoric'];
  const wdUser1 = await provisionSmartWallet(agoricAddr, {
    BLD: 100n,
    IST: 100n,
  });
  const expectedBalances = [
    {
      denom: 'ubld',
      amount: '90000000', // 100n * (10n ** 6n) - smart wallet provision
    },
    {
      denom: 'uist',
      amount: '100250000', // 100n * (10n ** 6n) + smart wallet credit
    },
  ];
  t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

  const doOffer = makeDoOffer(wdUser1);
  t.log('sendLocalQuery offer');
  const offerId = `agoric-sendLocalQuery-${Date.now()}`;

  const allBalancesProto3JsonQuery = typedJson(
    '/cosmos.bank.v1beta1.QueryAllBalancesRequest',
    {
      address: agoricAddr,
    },
  );
  const balanceProto3JsonQuery = typedJson(
    '/cosmos.bank.v1beta1.QueryBalanceRequest',
    {
      address: agoricAddr,
      denom: 'ubld',
    },
  );

  await doOffer({
    id: offerId,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeSendLocalQueryInvitation']],
    },
    offerArgs: {
      msgs: [allBalancesProto3JsonQuery, balanceProto3JsonQuery],
    },
    proposal: {},
  });

  const offerResult = await retryUntilCondition(
    () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
    ({ status }) => status.id === offerId && (status.result || status.error),
    `${offerId} continuing invitation is in vstorage`,
    {
      maxRetries: 10,
    },
  );

  const parsedResults = JSON.parse(offerResult.status.result);
  t.truthy(parsedResults[0].height, 'query height is returned');
  t.is(parsedResults[0].error, '', 'error is empty');
  t.like(
    parsedResults[0].reply,
    {
      balances: expectedBalances,
    },
    'QueryAllBalances result is returned',
  );
  t.deepEqual(
    parsedResults[1].reply,
    {
      '@type': '/cosmos.bank.v1beta1.QueryBalanceResponse',
      balance: expectedBalances[0],
    },
    'QueryBalance result is returned',
  );
});

test.serial.failing(queryICQChain, 'osmosis');
test.serial(queryChainWithoutICQ, 'cosmoshub');
