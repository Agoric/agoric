import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import type { TestFn } from 'ava';

import { Fail } from '@endo/errors';
import type { start as stakeBldStart } from '@agoric/orchestration/src/examples/stake-bld.contract.js';
import type { Instance } from '@agoric/zoe/src/zoeService/utils.js';
import { SIMULATED_ERRORS } from '@agoric/vats/tools/fake-bridge.js';
import {
  makeWalletFactoryContext,
  type WalletFactoryTestContext,
} from './walletFactory.js';

const test: TestFn<WalletFactoryTestContext> = anyTest;

test.before(async t => {
  t.context = await makeWalletFactoryContext(
    t,
    '@agoric/vm-config/decentral-itest-orchestration-config.json',
  );
});
test.after.always(async t => t.context.shutdown?.());

test.serial('stakeBld', async t => {
  const {
    agoricNamesRemotes,
    buildProposal,
    evalProposal,
    refreshAgoricNamesRemotes,
  } = t.context;

  // start-stakeBld depends on this. Sanity check in case the context changes.
  const { BLD } = agoricNamesRemotes.brand;
  BLD || Fail`BLD missing from agoricNames`;

  await evalProposal(
    buildProposal('@agoric/builders/scripts/orchestration/init-stakeBld.js'),
  );
  // update now that stakeBld is instantiated
  refreshAgoricNamesRemotes();

  const stakeBld = agoricNamesRemotes.instance.stakeBld as Instance<
    typeof stakeBldStart
  >;
  t.truthy(stakeBld);

  const wd = await t.context.walletFactoryDriver.provideSmartWallet(
    'agoric1testStakeBld',
  );

  await wd.executeOffer({
    id: 'request-stake',
    invitationSpec: {
      source: 'agoricContract',
      instancePath: ['stakeBld'],
      callPipe: [['makeStakeBldInvitation']],
    },
    proposal: {
      give: {
        // @ts-expect-error XXX BoardRemote
        In: { brand: BLD, value: 10n },
      },
    },
  });

  const current = wd.getCurrentWalletRecord();
  const latest = wd.getLatestUpdateRecord();
  t.like(current, {
    offerToPublicSubscriberPaths: [
      // TODO publish something useful
      ['request-stake', { account: 'published.stakeBld' }],
    ],
  });
  t.like(latest, {
    status: { id: 'request-stake', numWantsSatisfied: 1 },
  });

  await wd.executeOffer({
    id: 'request-delegate',
    invitationSpec: {
      source: 'continuing',
      previousOffer: 'request-stake',
      invitationMakerName: 'Delegate',
      invitationArgs: ['agoric1validator1', { brand: BLD, value: 10n }],
    },
    proposal: {
      give: {
        // @ts-expect-error XXX BoardRemote
        In: { brand: BLD, value: 10n },
      },
    },
  });
  t.like(wd.getLatestUpdateRecord(), {
    status: { id: 'request-delegate', numWantsSatisfied: 1 },
  });

  await t.throwsAsync(
    wd.executeOffer({
      id: 'request-delegate-504',
      invitationSpec: {
        source: 'continuing',
        previousOffer: 'request-stake',
        invitationMakerName: 'Delegate',
        invitationArgs: [
          'agoric1validator1',
          { brand: BLD, value: SIMULATED_ERRORS.TIMEOUT },
        ],
      },
      proposal: {
        give: {
          // @ts-expect-error XXX BoardRemote
          In: { brand: BLD, value: SIMULATED_ERRORS.TIMEOUT },
        },
      },
    }),
    // TODO propagate error message through bridge
    // FIXME should receive "simulated packet timeout" error
    // { message: 'simulated packet timeout' },
  );

  await wd.executeOffer({
    id: 'bank-send',
    invitationSpec: {
      source: 'continuing',
      previousOffer: 'request-stake',
      invitationMakerName: 'Send',
    },
    proposal: {},
    offerArgs: {
      toAccount: {
        value: 'agoric1EOAAccAddress',
        chainId: 'agoriclocal',
        encoding: 'bech32',
      },
      amount: { denom: 'ibc/1234', value: 10n },
    },
  });
  t.like(wd.getLatestUpdateRecord(), {
    status: { id: 'bank-send', numWantsSatisfied: 1 },
  });

  await wd.executeOffer({
    id: 'bank-sendAll',
    invitationSpec: {
      source: 'continuing',
      previousOffer: 'request-stake',
      invitationMakerName: 'SendAll',
    },
    proposal: {},
    offerArgs: {
      toAccount: {
        value: 'agoric1EOAAccAddress',
        chainId: 'agoriclocal',
        encoding: 'bech32',
      },
      amounts: [
        { denom: 'uatom', value: 10n },
        { denom: 'ibc/1234', value: 10n },
      ],
    },
  });
  t.like(wd.getLatestUpdateRecord(), {
    status: { id: 'bank-sendAll', numWantsSatisfied: 1 },
  });

  await t.throwsAsync(
    wd.executeOffer({
      id: 'bank-send-fail',
      invitationSpec: {
        source: 'continuing',
        previousOffer: 'request-stake',
        invitationMakerName: 'Send',
      },
      proposal: {},
      offerArgs: {
        toAccount: {
          value: 'agoric1EOAAccAddress',
          chainId: 'agoriclocal',
          encoding: 'bech32',
        },
        amount: {
          denom: 'ibc/1234',
          value: SIMULATED_ERRORS.BAD_REQUEST,
        },
      },
    }),
  );
});
