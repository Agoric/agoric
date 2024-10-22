import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { commonSetup, type SetupContext, chainConfig } from './support.js';
import { createWallet } from '../tools/wallet.js';
import { AmountMath } from '@agoric/ertp';
import { makeQueryClient } from '../tools/query.js';
import type { Amount } from '@agoric/ertp/src/types.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['osmosis1', 'osmosis2', 'cosmoshub1', 'cosmoshub2'];

const contractName = 'sendAnywhere';
const contractBuilder =
  '../packages/builders/scripts/testing/start-send-anywhere.js';

test.before(async t => {
  t.context = await commonSetup(t, accounts);
  const { startContract } = t.context;
  await startContract(contractName, contractBuilder);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  await deleteTestKeys(accounts);
});

const sendAnywhereScenario = test.macro({
  title: (_, chainName: string, acctIdx: number) =>
    `send-anywhere ${chainName}${acctIdx}`,
  exec: async (t, chainName: string, acctIdx: number) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);

    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
    } = t.context;

    t.log('Create a receiving wallet for the send-anywhere transfer');
    const chain = useChain(chainName).chain;

    t.log('Create an agoric smart wallet to initiate send-anywhere transfer');
    const agoricAddr = wallets[`${chainName}${acctIdx}`];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100_000n,
      IST: 100_000n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);

    const brands = await vstorageClient.queryData(
      'published.agoricNames.brand',
    );
    const istBrand = Object.fromEntries(brands).IST;

    const apiUrl = await useChain(chainName).getRestEndpoint();
    const queryClient = makeQueryClient(apiUrl);
    t.log(`Made ${chainName} query client`);

    const doSendAnywhere = async (amount: Amount) => {
      t.log(`Sending ${amount.value} ${amount.brand}.`);
      const wallet = await createWallet(chain.bech32_prefix);
      const receiver = {
        chainId: chain.chain_id,
        value: (await wallet.getAccounts())[0].address,
        encoding: 'bech32',
      };
      t.log('Will send payment to:', receiver);
      t.log(`${chainName}  offer`);
      const offerId = `${chainName}-makeSendInvitation-${Date.now()}`;
      await doOffer({
        id: offerId,
        invitationSpec: {
          source: 'agoricContract',
          instancePath: [contractName],
          callPipe: [['makeSendInvitation']],
        },
        offerArgs: { destAddr: receiver.value, chainName },
        proposal: { give: { Send: amount } },
      });

      const { balances } = await retryUntilCondition(
        () => queryClient.queryBalances(receiver.value),
        ({ balances }) => 'amount' in balances[0],
        `${receiver.value} ${amount.value} balance available from send-anywhere`,
      );

      t.log(`${receiver.value} Balances`, balances);
      t.like(balances, [
        {
          // XXX consider verifying uist hash
          amount: String(amount.value),
        },
      ]);
    };

    const makeRandomValue = (min: number, max: number) =>
      BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
    // send 3 offers from each account. different values help distinguish
    // one offer/result from another.
    const offerAmounts = [
      makeRandomValue(1, 33),
      makeRandomValue(34, 66),
      makeRandomValue(67, 100),
    ];
    console.log(`${agoricAddr} offer amounts:`, offerAmounts);

    for (const value of offerAmounts) {
      await doSendAnywhere(AmountMath.make(istBrand, value));
    }
  },
});

test.serial(sendAnywhereScenario, 'osmosis', 1);
test.serial(sendAnywhereScenario, 'osmosis', 2);
test.serial(sendAnywhereScenario, 'cosmoshub', 1);
test.serial(sendAnywhereScenario, 'cosmoshub', 2);
