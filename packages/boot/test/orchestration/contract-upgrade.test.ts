/** @file Bootstrap test of restarting contracts using orchestration */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { TestFn } from 'ava';

import {
  makeWalletFactoryContext,
  type WalletFactoryTestContext,
} from '../bootstrapTests/walletFactory.js';

const test: TestFn<WalletFactoryTestContext> = anyTest;
test.before(async t => {
  t.context = await makeWalletFactoryContext(
    t,
    '@agoric/vm-config/decentral-itest-orchestration-config.json',
  );
});
test.after.always(t => t.context.shutdown?.());

/**
 * This test core-evals a buggy installation of the sendAnywhere contract by
 * giving it a faulty `agoricNames` service with a lookup() function returns a
 * promise that never resolves.
 *
 * Because the send-anywhere flow requires a lookup(), it waits forever. This
 * gives us a point at which we can upgrade the vat with a working agoricNames
 * and see that the flow continues from that point.
 */
test('resume', async t => {
  const {
    walletFactoryDriver,
    buildProposal,
    evalProposal,
    storage,
    bridgeUtils: { inboundVTransferEvent },
  } = t.context;

  const { IST } = t.context.agoricNamesRemotes.brand;

  t.log('start sendAnywhere');
  await evalProposal(
    buildProposal(
      '@agoric/builders/scripts/testing/start-buggy-sendAnywhere.js',
    ),
  );

  t.log('making offer');
  const wallet = await walletFactoryDriver.provideSmartWallet('agoric1test');
  // no money in wallet to actually send
  const zero = { brand: IST, value: 0n };
  // send because it won't resolve
  await wallet.sendOffer({
    id: 'send-somewhere',
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['sendAnywhere'],
      callPipe: [['makeSendInvitation']],
    },
    proposal: {
      // @ts-expect-error XXX BoardRemote
      give: { Send: zero },
    },
    offerArgs: { destAddr: 'cosmos1whatever', chainName: 'cosmoshub' },
  });

  // XXX golden test
  const getLogged = () =>
    JSON.parse(storage.data.get('published.sendAnywhere.log')!).values;

  // This log shows the flow started, but didn't get past the name lookup
  t.deepEqual(getLogged(), ['sending {0} from cosmoshub to cosmos1whatever']);

  t.log('upgrade sendAnywhere with fix');
  await evalProposal(
    buildProposal('@agoric/builders/scripts/testing/fix-buggy-sendAnywhere.js'),
  );

  await inboundVTransferEvent({
    sourceChannel: 'channel-5',
    // @ts-expect-error fixme
    sequence: '1',
  });

  // Gets much farther
  t.deepEqual(getLogged(), [
    'sending {0} from cosmoshub to cosmos1whatever',
    'got info for denoms: ibc/toyatom, ibc/toyusdc, ubld, uist',
    'got info for chain: cosmoshub cosmoshub-4',
    'completed transfer to localAccount',
    'completed transfer to cosmos1whatever',
    'transfer complete, seat exited',
  ]);
});
