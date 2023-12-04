/** @file Bootstrap test of restarting (almost) all vats */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';

import processAmbient from 'child_process';
import { promises as fsAmbientPromises } from 'fs';

import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { TestFn } from 'ava';
import { BridgeHandler } from '@agoric/vats';
import type { EconomyBootstrapSpace } from '@agoric/inter-protocol/src/proposals/econ-behaviors.js';
import {
  makeProposalExtractor,
  makeSwingsetTestKit,
} from '../../tools/supports.ts';
import { makeWalletFactoryDriver } from '../../tools/drivers.ts';

const { Fail } = assert;

// XXX shouldn't need any econ stuff
const PLATFORM_CONFIG = '@agoric/vm-config/decentral-itest-vaults-config.json';

export const makeTestContext = async t => {
  console.time('DefaultTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log, 'bundles/vaults', {
    configSpecifier: PLATFORM_CONFIG,
  });

  const { EV } = swingsetTestKit.runUtils;

  // XXX wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');

  await eventLoopIteration();

  const buildProposal = makeProposalExtractor({
    childProcess: processAmbient,
    fs: fsAmbientPromises,
  });

  return {
    ...swingsetTestKit,
    buildProposal,
  };
};

const test = anyTest as TestFn<Awaited<ReturnType<typeof makeTestContext>>>;

test.before(async t => {
  t.context = await makeTestContext(t);
});
test.after.always(t => t.context.shutdown?.());

test('restart vat-admin vat', async t => {
  const { buildAndExecuteProposal } = t.context;
  // restart vat-admin
  await buildAndExecuteProposal(
    '@agoric/builders/scripts/vats/restart-vat-admin.js',
  );
});
