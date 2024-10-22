import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { AmountMath } from '@agoric/ertp';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { makeQueryClient } from '../tools/query.js';
import { commonSetup, type SetupContext } from './support.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['cosmoshub', 'osmosis'];

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

const portfolioAccountScenario = test.macro({
  title: (_, remoteChain: string) =>
    `Deposit and withdraw to ICA on ${remoteChain} via Portfolio Account`,
  exec: async (t, chainName: string) => {
    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
    } = t.context;

    const agoricAddr = wallets[chainName];
    const wdUser = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 1000n,
    });
    t.log(`Provisioned Agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser);

    // Create portfolio holder account for agoric and remoteChain
    const makePortfolioAcctOfferId = `makePortfolioAccount-${chainName}-${Date.now()}`;
    await doOffer({
      id: makePortfolioAcctOfferId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makePortfolioAccountInvitation']],
      },
      offerArgs: {
        chainNames: ['agoric', chainName],
      },
      proposal: {},
    });

    const { offerToPublicSubscriberPaths } = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
      ({ offerToPublicSubscriberPaths }) =>
        Object.fromEntries(offerToPublicSubscriberPaths)[
          makePortfolioAcctOfferId
        ],
      'Portfolio account creation offer result is in vstorage',
    );

    // TODO type `offerToPublicSubscriberPaths` #10214 (PortfolioHolder)
    const accountPaths = Object.fromEntries(offerToPublicSubscriberPaths)[
      makePortfolioAcctOfferId
    ];
    t.truthy(accountPaths.agoric, 'Agoric account path returned');
    t.truthy(accountPaths[chainName], `${chainName} account path returned`);

    const agoricLcaAddress = accountPaths.agoric.split('.').at(-1);
    const remoteIcaAddress = accountPaths[chainName].split('.').at(-1);
    t.truthy(agoricLcaAddress, 'Agoric LCA address is in storage path');
    t.truthy(remoteIcaAddress, `${chainName} ICA address is in storage path`);

    // Get IST brand
    const brands = await vstorageClient.queryData(
      'published.agoricNames.brand',
    );
    const istBrand = Object.fromEntries(brands).IST;

    // Setup query clients
    const agoricApiUrl = await useChain('agoric').getRestEndpoint();
    const agoricQueryClient = makeQueryClient(agoricApiUrl);
    const remoteChainInfo = useChain(chainName);
    const remoteQueryClient = makeQueryClient(
      await remoteChainInfo.getRestEndpoint(),
    );

    // Deposit funds to Agoric account
    const depositAmount = AmountMath.make(istBrand, 500n);
    const depositOfferId = `deposit-portfolio-${chainName}-${Date.now()}`;
    await doOffer({
      id: depositOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: makePortfolioAcctOfferId,
        invitationMakerName: 'Proxying',
        invitationArgs: ['agoric', 'Deposit'],
      },
      offerArgs: {},
      proposal: {
        give: { Asset: depositAmount },
      },
    });

    // Verify deposit
    const agoricAccountBalance = await retryUntilCondition(
      () => agoricQueryClient.queryBalance(agoricLcaAddress, 'uist'),
      ({ balance }) => balance?.denom === 'uist' && balance?.amount === '500',
      'Deposit reflected in Agoric account balance',
    );
    t.deepEqual(
      agoricAccountBalance.balance,
      { denom: 'uist', amount: '500' },
      'Correct amount deposited to Agoric account',
    );

    // IBC Transfer funds to remoteChain account
    const remoteChainId = remoteChainInfo.chain.chain_id;
    const ibcTransferOfferId = `transfer-to-${chainName}-${Date.now()}`;
    await doOffer({
      id: ibcTransferOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: makePortfolioAcctOfferId,
        invitationMakerName: 'Proxying',
        invitationArgs: ['agoric', 'Transfer'],
      },
      offerArgs: {
        amount: { denom: 'uist', value: 500n },
        destination: {
          chainId: remoteChainId,
          value: remoteIcaAddress,
          encoding: 'bech32,',
        },
      },
      proposal: {},
    });

    const remoteBalances = await retryUntilCondition(
      () => remoteQueryClient.queryBalances(remoteIcaAddress),
      ({ balances }) => balances.length > 0,
      `IBC transfer reflected in ${chainName} account balance`,
    );
    t.log(`${remoteIcaAddress} Balances`, remoteBalances.balances);
    // there are no other funds in the account, so we can safely assume its IST
    // consider looking up the expected denom
    t.like(remoteBalances, {
      balances: [
        {
          amount: '500',
        },
      ],
    });

    // Transfer funds back to Agoric
    // TODO #9966 use IST brand and let contract perform denom lookup
    const istRemoteDenom = remoteBalances.balances[0].denom;
    const transferBackOfferId = `transfer-back-${chainName}-${Date.now()}`;
    await doOffer({
      id: transferBackOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: makePortfolioAcctOfferId,
        invitationMakerName: 'Proxying',
        invitationArgs: [chainName, 'Transfer'],
      },
      offerArgs: {
        // TODO #9966 use IST brand and let contract perform denom lookup
        amount: { denom: istRemoteDenom, value: 500n },
        destination: {
          chainId: 'agoriclocal',
          value: agoricLcaAddress,
          encoding: 'bech32,',
        },
      },
      proposal: {},
    });

    // Verify funds are back in Agoric account
    const updatedAgoricAccountBalance = await retryUntilCondition(
      () => agoricQueryClient.queryBalance(agoricLcaAddress, 'uist'),
      ({ balance }) => balance?.denom === 'uist' && balance?.amount === '500',
      'IBC transfer back reflected in Agoric account balance',
    );
    t.deepEqual(
      updatedAgoricAccountBalance.balance,
      { denom: 'uist', amount: '500' },
      'Correct amount transferred back to Agoric account',
    );

    // Withdraw funds from Agoric account
    const withdrawAmount = AmountMath.make(istBrand, 500n);
    const withdrawOfferId = `withdraw-${chainName}-${Date.now()}`;
    await doOffer({
      id: withdrawOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: makePortfolioAcctOfferId,
        invitationMakerName: 'Proxying',
        invitationArgs: ['agoric', 'Withdraw'],
      },
      offerArgs: {},
      proposal: {
        want: { Asset: withdrawAmount },
      },
    });

    // Verify withdrawal
    const finalAgoricAccountBalance = await agoricQueryClient.queryBalance(
      agoricLcaAddress,
      'uist',
    );
    t.deepEqual(
      finalAgoricAccountBalance.balance,
      { denom: 'uist', amount: '0' },
      'All funds withdrawn from Agoric account',
    );

    // Verify smart wallet balance
    // faucet - provision rebate - deposit + withdraw
    const driverExpectedBalance = 1_000_000_000n + 250_000n - 500n + 500n;
    const driverBalanceAfterWithdraw = await agoricQueryClient.queryBalance(
      agoricAddr,
      'uist',
    );
    t.deepEqual(
      driverBalanceAfterWithdraw.balance,
      { denom: 'uist', amount: String(driverExpectedBalance) },
      'All funds returned to smart wallet',
    );
  },
});

test(portfolioAccountScenario, 'osmosis');
test(portfolioAccountScenario, 'cosmoshub');
