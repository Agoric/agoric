import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { makeQueryClient } from '../../tools/query.js';
import { createWallet } from '../../tools/wallet.js';
import { commonSetup } from '../support.js';

const test = anyTest as TestFn<Record<string, never>>;

const walletScenario = test.macro({
  title: (_, chainName: string) =>
    `create a wallet and get tokens on ${chainName}`,
  exec: async (t, chainName: string) => {
    const { useChain, retryUntilCondition } = await commonSetup(t);

    const { bech32_prefix, staking } = useChain(chainName).chain;
    const wallet = await createWallet(bech32_prefix);
    const addr = (await wallet.getAccounts())[0].address;
    t.regex(addr, new RegExp(`^${bech32_prefix}1`));
    t.log('Made temp wallet:', addr);

    const apiUrl = await useChain(chainName).getRestEndpoint();
    const queryClient = makeQueryClient(apiUrl);
    t.log('Made query client');

    const { balances } = await queryClient.queryBalances(addr);
    t.log('Beginning balances:', balances);
    t.deepEqual(balances, []);

    const { creditFromFaucet } = useChain(chainName);
    t.log('Requesting faucet funds');

    await creditFromFaucet(addr);
    // XXX needed to avoid race condition between faucet POST and LCD Query
    // see https://github.com/cosmology-tech/starship/issues/417
    const { balances: updatedBalances } = await retryUntilCondition(
      () => queryClient.queryBalances(addr),
      ({ balances }) => !!balances.length,
      `${chainName} balance available from faucet`,
    );

    const expectedDenom = staking?.staking_tokens?.[0]?.denom;
    t.assert(expectedDenom, 'expected denom found in registry');
    t.like(updatedBalances, [{ denom: expectedDenom, amount: '10000000000' }]);
    t.log('Updated balances:', updatedBalances);

    const bondDenom =
      useChain(chainName).chain.staking?.staking_tokens?.[0].denom;
    t.truthy(bondDenom, 'bond denom found');
    const { balance } = await queryClient.queryBalance(addr, bondDenom!);
    t.deepEqual(balance, { denom: bondDenom, amount: '10000000000' });
  },
});

test(walletScenario, 'osmosis');
test(walletScenario, 'cosmoshub');
test(walletScenario, 'agoric');
