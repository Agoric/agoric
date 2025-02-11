/** @file Bootstrap test of restarting contracts using orchestration */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { withChainCapabilities } from '@agoric/orchestration';
import {
  makeWalletFactoryContext,
  type WalletFactoryTestContext,
} from '../bootstrapTests/walletFactory.js';
import { minimalChainInfos } from '../tools/chainInfo.js';

const test: TestFn<WalletFactoryTestContext> = anyTest;
test.before(async t => {
  t.context = await makeWalletFactoryContext(
    t,
    '@agoric/vm-config/decentral-itest-orchestration-config.json',
  );
});
test.after.always(t => t.context.shutdown?.());

/**
 * This test core-evals an installation of the axelarGmp contract that
 * initiates an IBC Transfer.
 */
test('start axelarGmp and send an offer', async t => {
  const {
    walletFactoryDriver,
    bridgeUtils: { runInbound },
    buildProposal,
    evalProposal,
    storage,
  } = t.context;

  const { IST } = t.context.agoricNamesRemotes.brand;

  t.log('start axelarGmp');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/init-axelar-gmp.js', [
      '--chainInfo',
      JSON.stringify(withChainCapabilities(minimalChainInfos)),
      '--assetInfo',
      JSON.stringify([
        [
          'uist',
          {
            baseDenom: 'uist',
            baseName: 'agoric',
            chainName: 'agoric',
          },
        ],
      ]),
    ]),
  );

  t.log('making offer');
  const wallet = await walletFactoryDriver.provideSmartWallet('agoric1test');
  // no money in wallet to actually send
  const zero = { brand: IST, value: 0n };
  // send because it won't resolve
  await wallet.sendOffer({
    id: 'invokeEVMContract',
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['axelarGmp'],
      callPipe: [['makeSendInvitation']],
    },
    proposal: {
      // @ts-expect-error XXX BoardRemote
      give: { Send: zero },
    },
    offerArgs: {
      destAddr: '0x20E68F6c276AC6E297aC46c84Ab260928276691D',
      type: 1,
      destinationEVMChain: 'ethereum',
      gasAmount: 33,
      contractInvocationPayload: [1, 0, 0, 1, 1],
    },
  });

  const getLogged = () =>
    JSON.parse(storage.data.get('published.axelarGmp.log')!).values;

  // This log shows the flow started, but didn't get past the IBC Transfer settlement
  t.deepEqual(getLogged(), [
    'initiating sendIt',
    'got info for denoms: ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9, ibc/toyatom, ibc/toyusdc, ubld, uist',
    'got info for chain: osmosis-1',
    'completed transfer to localAccount',
    'payload received',
  ]);
});
