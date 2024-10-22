import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { AmountMath } from '@agoric/ertp';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { makeQueryClient } from '../tools/query.js';
import { commonSetup, type SetupContext } from './support.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['user1'];

const contractName = 'basicFlows';
const contractBuilder =
  '../packages/builders/scripts/orchestration/init-basic-flows.js';

test.before(async t => {
  t.context = await commonSetup(t, accounts);
  const { startContract } = t.context;
  await startContract(contractName, contractBuilder);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  await deleteTestKeys(accounts);
});

test('Deposit IST to orchAccount and then withdraw', async t => {
  const {
    wallets,
    provisionSmartWallet,
    vstorageClient,
    retryUntilCondition,
    useChain,
  } = t.context;

  // Provision the Agoric smart wallet
  const agoricAddr = wallets.user1;
  const wdUser = await provisionSmartWallet(agoricAddr, {
    BLD: 100n,
    IST: 1000n,
  });
  t.log(`Provisioned Agoric smart wallet for ${agoricAddr}`);

  const doOffer = makeDoOffer(wdUser);

  // Create orchAccount
  const makeAccountOfferId = `makeAccount-${Date.now()}`;
  await doOffer({
    id: makeAccountOfferId,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeOrchAccountInvitation']],
    },
    offerArgs: { chainName: 'agoric' },
    proposal: {},
  });

  // Wait for the orchAccount to be created
  const { offerToPublicSubscriberPaths } = await retryUntilCondition(
    () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
    ({ offerToPublicSubscriberPaths }) =>
      Object.fromEntries(offerToPublicSubscriberPaths)[makeAccountOfferId],
    'makeAccount offer result is in vstorage',
  );

  // TODO type `offerToPublicSubscriberPaths` #10214 (OrchAccount)
  const accountStoragePath = Object.fromEntries(offerToPublicSubscriberPaths)[
    makeAccountOfferId
  ]!.account;
  const lcaAddress = accountStoragePath.split('.').at(-1);
  t.truthy(lcaAddress, 'Account address is in storage path');

  // Get IST brand
  const brands = await vstorageClient.queryData('published.agoricNames.brand');
  const istBrand = Object.fromEntries(brands).IST;

  // Deposit IST to orchAccount
  const depositAmount = AmountMath.make(istBrand, 500n);
  const depositOfferId = `deposit-${Date.now()}`;
  await doOffer({
    id: depositOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountOfferId,
      invitationMakerName: 'Deposit',
    },
    offerArgs: {},
    proposal: {
      give: { Asset: depositAmount },
    },
  });

  // Verify deposit
  const apiUrl = await useChain('agoric').getRestEndpoint();
  const queryClient = makeQueryClient(apiUrl);

  const lcaBalanceAfterDeposit = await retryUntilCondition(
    () => queryClient.queryBalance(lcaAddress, 'uist'),
    ({ balance }) => balance?.denom === 'uist' && balance?.amount === '500',
    'Deposit reflected in localOrchAccount balance',
  );
  t.deepEqual(lcaBalanceAfterDeposit.balance, { denom: 'uist', amount: '500' });

  // Withdraw IST from orchAccount
  const withdrawAmount = AmountMath.make(istBrand, 300n);
  const withdrawOfferId = `withdraw-${Date.now()}`;
  await doOffer({
    id: withdrawOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountOfferId,
      invitationMakerName: 'Withdraw',
    },
    offerArgs: {},
    proposal: {
      want: { Asset: withdrawAmount },
    },
  });

  // Verify withdrawal
  const lcaBalanceAfterWithdraw = await retryUntilCondition(
    () => queryClient.queryBalance(lcaAddress, 'uist'),
    ({ balance }) => balance?.denom === 'uist' && balance?.amount === '200',
    'Withdraw reflected in localOrchAccount balance',
  );
  t.deepEqual(lcaBalanceAfterWithdraw.balance, {
    denom: 'uist',
    amount: '200',
  });

  // faucet - provision rebate - deposit + withdraw
  const driverExpectedBalance = 1_000_000_000n + 250_000n - 500n + 300n;
  const driverBalanceAfterWithdraw = await retryUntilCondition(
    () => queryClient.queryBalance(agoricAddr, 'uist'),
    ({ balance }) =>
      balance?.denom === 'uist' &&
      balance?.amount === String(driverExpectedBalance),
    'Withdraw reflected in driverAccount balance',
  );
  t.deepEqual(driverBalanceAfterWithdraw.balance, {
    denom: 'uist',
    amount: String(driverExpectedBalance),
  });
});

test.todo('Deposit and Withdraw ATOM/OSMO to localOrchAccount via offer #9966');

test('Attempt to withdraw more than available balance', async t => {
  const { wallets, provisionSmartWallet, vstorageClient, retryUntilCondition } =
    t.context;

  // Provision the Agoric smart wallet
  const agoricAddr = wallets.user1;
  const wdUser = await provisionSmartWallet(agoricAddr, {
    BLD: 100n,
    IST: 1000n,
  });
  t.log(`Provisioned Agoric smart wallet for ${agoricAddr}`);

  const doOffer = makeDoOffer(wdUser);

  // Create orchAccount
  const makeAccountOfferId = `makeLocalAccount-${Date.now()}`;
  await doOffer({
    id: makeAccountOfferId,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeOrchAccountInvitation']],
    },
    offerArgs: { chainName: 'agoric' },
    proposal: {},
  });

  // Wait for the orchAccount to be created
  const { offerToPublicSubscriberPaths } = await retryUntilCondition(
    () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
    ({ offerToPublicSubscriberPaths }) =>
      Object.fromEntries(offerToPublicSubscriberPaths)[makeAccountOfferId],
    `${makeAccountOfferId} offer result is in vstorage`,
  );

  const accountStoragePath = Object.fromEntries(offerToPublicSubscriberPaths)[
    makeAccountOfferId
  ]?.account;
  const lcaAddress = accountStoragePath.split('.').at(-1);
  t.truthy(lcaAddress, 'Account address is in storage path');

  // Get IST brand
  const brands = await vstorageClient.queryData('published.agoricNames.brand');
  const istBrand = Object.fromEntries(brands).IST;

  // Attempt to withdraw more than available balance
  const excessiveWithdrawAmount = AmountMath.make(istBrand, 200n);
  const withdrawOfferId = `withdraw-error-${Date.now()}`;
  await doOffer({
    id: withdrawOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountOfferId,
      invitationMakerName: 'Withdraw',
    },
    offerArgs: {},
    proposal: {
      want: { Asset: excessiveWithdrawAmount },
    },
  });

  // Verify that the withdrawal failed
  const offerResult = await retryUntilCondition(
    () => vstorageClient.queryData(`published.wallet.${agoricAddr}`),
    ({ status }) => status.id === withdrawOfferId && status.error !== undefined,
    'Withdrawal offer error is in vstorage',
  );
  t.is(
    offerResult.status.error,
    'Error: One or more withdrawals failed ["[Error: cannot grab 200uist coins: 0uist is smaller than 200uist: insufficient funds]"]',
  );
});
