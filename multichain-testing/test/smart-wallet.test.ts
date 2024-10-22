import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { makeQueryClient } from '../tools/query.js';
import { commonSetup, type SetupContext } from './support.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['user1'];

test.before(async t => {
  t.context = await commonSetup(t, accounts);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  await deleteTestKeys();
});

test('provision smart wallet', async t => {
  const { wallets, provisionSmartWallet, vstorageClient, useChain } = t.context;

  const wallet = await provisionSmartWallet(wallets.user1, { BLD: 100n });
  t.log('wallet', wallet);

  const walletCurrent = await vstorageClient.queryData(
    `published.wallet.${wallets.user1}.current`,
  );
  t.like(walletCurrent, { liveOffers: [], offerToPublicSubscriberPaths: [] });

  const agQueryClient = makeQueryClient(
    await useChain('agoric').getRestEndpoint(),
  );
  const { balances } = await agQueryClient.queryBalances(wallets.user1);
  t.deepEqual(
    balances,
    [
      { denom: 'ubld', amount: String(90_000_000n) },
      { denom: 'uist', amount: String(250_000n) },
    ],
    'faucet request minus 10 BLD, plus 0.25 IST provisioning credit',
  );
  t.log({ [wallets.user1]: balances });
});
