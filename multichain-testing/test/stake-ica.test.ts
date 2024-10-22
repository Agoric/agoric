import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { commonSetup, type SetupContext, FAUCET_POUR } from './support.js';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { makeQueryClient } from '../tools/query.js';
import { sleep } from '../tools/sleep.js';
import { STAKING_REWARDS_TIMEOUT } from './config.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['user1', 'user2'];

test.before(async t => {
  t.context = await commonSetup(t, accounts);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  await deleteTestKeys(accounts);
});

interface StakeIcaScenario {
  chain: string;
  chainId: string;
  contractName: string;
  denom: string;
  expectedAddressPrefix: string;
  /** path to contract proposal builder. must create a plan.json */
  builder: string;
  wallet: string;
}

const stakeScenario = test.macro(async (t, scenario: StakeIcaScenario) => {
  const {
    wallets,
    provisionSmartWallet,
    vstorageClient,
    retryUntilCondition,
    useChain,
    startContract,
  } = t.context;

  await startContract(scenario.contractName, scenario.builder);
  const wdUser1 = await provisionSmartWallet(wallets[scenario.wallet], {
    BLD: 100n,
    IST: 100n,
  });
  t.log(`provisioning agoric smart wallet for ${wallets[scenario.wallet]}`);

  const doOffer = makeDoOffer(wdUser1);
  t.log(`${scenario.contractName} makeAccountInvitationMaker offer`);
  const makeAccountofferId = `makeAccount-${Date.now()}`;

  // FIXME we get payouts but not an offer result; it times out
  // chain logs shows an UNPUBLISHED result
  await doOffer({
    id: makeAccountofferId,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [scenario.contractName],
      callPipe: [['makeAccountInvitationMaker']],
    },
    proposal: {},
  });
  // t.is(await _offerResult, 'UNPUBLISHED', 'representation of continuing offer');

  // XXX fix above so we don't have to wait for the offer result to be published
  const { offerToPublicSubscriberPaths: makeAccountPublicSubscriberPaths } =
    await retryUntilCondition(
      () =>
        vstorageClient.queryData(
          `published.wallet.${wallets[scenario.wallet]}.current`,
        ),
      ({ offerToPublicSubscriberPaths }) =>
        !!offerToPublicSubscriberPaths.length,
      'makeAccount offer result is in vstorage',
    );

  t.log(makeAccountPublicSubscriberPaths[0]);
  t.regex(makeAccountPublicSubscriberPaths[0][0], /makeAccount/);

  const address = makeAccountPublicSubscriberPaths?.[0]?.[1]?.account
    .split('.')
    .pop();
  t.log('Got address:', address);
  t.regex(
    address,
    new RegExp(`^${scenario.expectedAddressPrefix}1`),
    `address for ${scenario.chain} is valid`,
  );

  const { creditFromFaucet, getRestEndpoint } = useChain(scenario.chain);
  const queryClient = makeQueryClient(await getRestEndpoint());

  t.log(`Requesting faucet funds for ${address}`);
  // XXX fails intermittently until https://github.com/cosmology-tech/starship/issues/417
  await creditFromFaucet(address);

  const { balances } = await retryUntilCondition(
    () => queryClient.queryBalances(address),
    ({ balances }) => !!balances.length,
    `${scenario.chain} faucet funds available`,
  );
  t.log('Updated balances:', balances);
  t.like(
    balances,
    [{ denom: scenario.denom, amount: String(FAUCET_POUR) }],
    'faucet balances available',
  );

  t.log('Delegate offer from continuing inv');
  const delegateOfferId = `delegate-${Date.now()}`;
  const { validators } = await queryClient.queryValidators();
  const validatorAddress = validators[0]?.operator_address;
  t.truthy(validatorAddress, 'found a validator to delegate to');
  t.log({ validatorAddress }, 'found a validator to delegate to');
  const validatorChainAddress = {
    value: validatorAddress,
    chainId: scenario.chainId,
    encoding: 'bech32',
  };
  await doOffer({
    id: delegateOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountofferId,
      invitationMakerName: 'Delegate',
      invitationArgs: [
        validatorChainAddress,
        { denom: scenario.denom, value: FAUCET_POUR },
      ],
    },
    proposal: {},
  });

  const latestWalletUpdate = await vstorageClient.queryData(
    `published.wallet.${wallets[scenario.wallet]}`,
  );
  t.log('latest wallet update', latestWalletUpdate);
  t.like(
    latestWalletUpdate.status,
    {
      id: delegateOfferId,
      error: undefined,
      numWantsSatisfied: 1,
    },
    `${scenario.chain} delegate offer satisfied without errors`,
  );
  // query remote chain to verify delegations
  const { delegation_responses } = await retryUntilCondition(
    () => queryClient.queryDelegations(address),
    ({ delegation_responses }) => !!delegation_responses.length,
    `delegations visible on ${scenario.chain}`,
  );
  t.log('delegation balance', delegation_responses[0]?.balance);
  t.like(
    delegation_responses[0].balance,
    { denom: scenario.denom, amount: String(FAUCET_POUR) },
    'delegations balance',
  );

  t.log('querying available rewards');
  const { total } = await retryUntilCondition(
    () => queryClient.queryRewards(address),
    ({ total }) => {
      return Number(total?.[0]?.amount) > 0;
    },
    `rewards available on ${scenario.chain}`,
    STAKING_REWARDS_TIMEOUT,
  );
  t.log('reward:', total[0]);
  t.log('WithrawReward offer from continuing inv');
  const withdrawRewardOfferId = `reward-${Date.now()}`;
  // funds are withdrawn to ICA, not the seat
  await doOffer({
    id: withdrawRewardOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountofferId,
      invitationMakerName: 'WithdrawReward',
      invitationArgs: [validatorChainAddress],
    },
    proposal: {},
  });

  const { balances: rewards } = await retryUntilCondition(
    () => queryClient.queryBalances(address),
    ({ balances }) =>
      Number(balances?.[0]?.amount) >= Math.floor(Number(total?.[0]?.amount)),
    'claimed rewards available',
  );
  t.log('Balance after claiming rewards:', rewards);

  const TOKENS_TO_UNDELEGATE = 50n;
  t.log('Undelegate offer from continuing inv');
  const undelegateOfferId = `undelegate-${Date.now()}`;
  await doOffer({
    id: undelegateOfferId,
    invitationSpec: {
      source: 'continuing',
      previousOffer: makeAccountofferId,
      invitationMakerName: 'Undelegate',
      invitationArgs: [
        [
          {
            validator: validatorChainAddress,
            amount: {
              denom: scenario.denom,
              value: TOKENS_TO_UNDELEGATE,
            },
          },
        ],
      ],
    },
    proposal: {},
  });

  const { unbonding_responses } = await retryUntilCondition(
    () => queryClient.queryUnbonding(address),
    ({ unbonding_responses }) => !!unbonding_responses.length,
    `unbonding_responses visible on ${scenario.chain}`,
  );
  t.log('unbonding_responses:', unbonding_responses[0].entries);
  t.is(
    unbonding_responses[0].entries[0].balance,
    String(TOKENS_TO_UNDELEGATE),
    'undelegating 50 shares in progress',
  );

  // might be greater than `rewards`, due to delay between query and claim rewards tx
  const { balances: currentBalances } =
    await queryClient.queryBalances(address);
  t.log('Current Balance:', currentBalances[0]);

  console.log('waiting for unbonding period');
  // XXX reference `120000` from chain state + `maxClockSkew`
  await sleep(120000);
  const { balances: rewardsWithUndelegations } = await retryUntilCondition(
    () => queryClient.queryBalances(address),
    ({ balances }) => {
      const expectedBalance =
        Number(currentBalances[0].amount) + Number(TOKENS_TO_UNDELEGATE);
      return Number(balances?.[0]?.amount) >= expectedBalance;
    },
    'claimed rewards available',
  );
  t.log('Final Balance:', rewardsWithUndelegations[0]);
});

test.serial('send wallet offers stakeAtom contract', stakeScenario, {
  chain: 'cosmoshub',
  chainId: 'gaialocal',
  contractName: 'stakeAtom',
  denom: 'uatom',
  expectedAddressPrefix: 'cosmos',
  builder: '../packages/builders/scripts/orchestration/init-stakeAtom.js',
  wallet: 'user1',
});

test.serial('send wallet offers to stakeOsmo contract', stakeScenario, {
  chain: 'osmosis',
  chainId: 'osmosislocal',
  contractName: 'stakeOsmo',
  denom: 'uosmo',
  expectedAddressPrefix: 'osmo',
  builder: '../packages/builders/scripts/orchestration/init-stakeOsmo.js',
  wallet: 'user2',
});
