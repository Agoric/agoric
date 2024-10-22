import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { commonSetup, type SetupContext, chainConfig } from './support.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['agoric', 'cosmoshub', 'osmosis']; // one account for each scenario

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

const makeAccountScenario = test.macro({
  title: (_, chainName: string) => `Create account on ${chainName}`,
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
    t.log(`${chainName} makeAccount offer`);
    const offerId = `${chainName}-makeAccount-${Date.now()}`;

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeOrchAccountInvitation']],
      },
      offerArgs: { chainName },
      proposal: {},
    });
    // TODO fix above so we don't have to poll for the offer result to be published
    // https://github.com/Agoric/agoric-sdk/issues/9643
    const currentWalletRecord = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
      ({ offerToPublicSubscriberPaths }) =>
        Object.fromEntries(offerToPublicSubscriberPaths)[offerId],
      `${offerId} continuing invitation is in vstorage`,
    );

    const offerToPublicSubscriberMap = Object.fromEntries(
      currentWalletRecord.offerToPublicSubscriberPaths,
    );

    const address = offerToPublicSubscriberMap[offerId]?.account
      .split('.')
      .pop();
    t.log('Got address:', address);
    t.regex(
      address,
      new RegExp(`^${config.expectedAddressPrefix}1`),
      `address for ${chainName} is valid`,
    );

    const latestWalletUpdate = await vstorageClient.queryData(
      `published.wallet.${agoricAddr}`,
    );
    t.log('latest wallet update', latestWalletUpdate);
    t.like(
      latestWalletUpdate.status,
      {
        id: offerId,
        numWantsSatisfied: 1,
        result: 'UNPUBLISHED',
        error: undefined,
      },
      'wallet offer satisfied without errors',
    );
  },
});

test.serial(makeAccountScenario, 'agoric');
test.serial(makeAccountScenario, 'cosmoshub');
test.serial(makeAccountScenario, 'osmosis');
