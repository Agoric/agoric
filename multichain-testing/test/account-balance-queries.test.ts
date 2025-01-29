import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import type { CosmosChainInfo } from '@agoric/orchestration';
import {
  commonSetup,
  type SetupContextWithWallets,
  chainConfig,
} from './support.js';
import { makeDoOffer } from '../tools/e2e-tools.js';
import chainInfo from '../starship-chain-info.js';
import { MAKE_ACCOUNT_AND_QUERY_BALANCE_TIMEOUT } from './config.js';

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

const queryAccountBalances = test.macro({
  title: (_, chainName: string) => `Query Account Balances on ${chainName}`,
  exec: async (t, chainName: string) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);
    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
    } = t.context;

    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} makeAccountAndGetBalancesQuery offer`);
    const offerId = `${chainName}-makeAccountAndGetBalancesQuery-${Date.now()}`;

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeAccountAndGetBalancesQueryInvitation']],
      },
      offerArgs: { chainName },
      proposal: {},
    });

    const offerResult = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
      ({ status }) => status.id === offerId && (status.result || status.error),
      `${offerId} offer result is in vstorage`,
      MAKE_ACCOUNT_AND_QUERY_BALANCE_TIMEOUT,
    );
    t.log('Account Balances Query Offer Result', offerResult);

    const { icqEnabled } = (chainInfo as Record<string, CosmosChainInfo>)[
      chainName
    ];
    const expectValidResult = icqEnabled || chainName === 'agoric';
    t.log(
      `Expecting offer ${expectValidResult ? 'result' : 'error'} for ${chainName}`,
    );

    const {
      status: { result, error },
    } = offerResult;
    if (expectValidResult) {
      t.is(error, undefined, 'No error observed for supported chain');
      const balances = JSON.parse(result);
      t.truthy(balances, 'Result is parsed successfully');
      t.true(Array.isArray(balances), 'Balances is an array');
      t.is(balances.length, 0, 'Balances are empty');
    } else {
      t.truthy(error, 'Error observed for unsupported chain');
      t.regex(
        error,
        /Queries not available for chain/i,
        'Correct error message for unsupported chain',
      );
    }
  },
});

const queryAccountBalance = test.macro({
  title: (_, chainName: string) => `Query Account Balance on ${chainName}`,
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

    const {
      chainInfo: {
        chain: { staking },
      },
    } = useChain(chainName);
    const denom = staking?.staking_tokens?.[0].denom;
    if (!denom) throw Error(`no denom for ${chainName}`);

    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} makeAccountAndGetBalanceQuery offer`);
    const offerId = `${chainName}-makeAccountAndGetBalanceQuery-${Date.now()}`;

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeAccountAndGetBalanceQueryInvitation']],
      },
      offerArgs: { chainName, denom },
      proposal: {},
    });

    const offerResult = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
      ({ status }) => status.id === offerId && (status.result || status.error),
      `${offerId} offer result is in vstorage`,
      MAKE_ACCOUNT_AND_QUERY_BALANCE_TIMEOUT,
    );
    t.log('Account Balance Query Offer Result', offerResult);
    const { icqEnabled } = (chainInfo as Record<string, CosmosChainInfo>)[
      chainName
    ];

    const expectValidResult = icqEnabled || chainName === 'agoric';
    t.log(
      `Expecting offer ${expectValidResult ? 'result' : 'error'} for ${chainName}`,
    );

    const {
      status: { result, error },
    } = offerResult;
    if (expectValidResult) {
      t.is(error, undefined, 'No error observed for supported chain');
      const parsedBalance = JSON.parse(result);
      t.truthy(parsedBalance, 'Result is parsed successfully');

      t.truthy(parsedBalance, 'Balance object exists');
      t.is(parsedBalance.denom, denom, 'Correct denom in balance');
      t.is(parsedBalance.value, '[0n]', 'Balance amount is 0n');
    } else {
      t.truthy(error, 'Error observed for unsupported chain');
      t.regex(
        error,
        /Queries not available for chain/i,
        'Correct error message for unsupported chain',
      );
    }
  },
});

test.serial(queryAccountBalances, 'osmosis');
test.serial(queryAccountBalances, 'cosmoshub');
test.serial(queryAccountBalances, 'agoric');
test.serial.failing(queryAccountBalance, 'osmosis');
test.serial(queryAccountBalance, 'cosmoshub');
test.serial(queryAccountBalance, 'agoric');
