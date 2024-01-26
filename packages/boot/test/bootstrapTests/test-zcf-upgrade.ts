/* eslint @typescript-eslint/no-floating-promises: "warn" */

import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import bundleSource from '@endo/bundle-source';

import processAmbient from 'child_process';
import { promises as fsAmbientPromises } from 'fs';
import path from 'path';

import { BridgeHandler } from '@agoric/vats';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { TestFn } from 'ava';
import {
  matchAmount,
  makeProposalExtractor,
  makeSwingsetTestKit,
} from '../../tools/supports.js';
import { makeZoeDriver } from '../../tools/drivers.js';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const ZCF_PROBE_SRC = './zcfProbe.js';

/**
 * @file Bootstrap test of upgrading ZCF to support atomicRearrange internally.
 *
 *   The goal is to tell Zoe about a new version of ZCF that it should use when
 *   starting new contracts. Zoe wasn't previously configurable for that, so a
 *   prerequisite was to upgrade Zoe to a version that could have its ZCF
 *   updated. To test that we install a contract that can detect the variation
 *   among zcf versions, and run it before, in the middle and after the
 *   upgrades.
 *
 *   0. add a contract that can report on the state of ZCF's support for different
 *        versions of reallocation: staging, helper, and internal.
 *   1. put new Zoe & ZCF bundles on chain
 *   2. upgrade Zoe; return a new facet that supports ZCF update
 *   3. tell Zoe to use new ZCF
 *   4. restart the new contract; verify that the behavior is unchanged.
 *   5. null upgrade the contract; verify that zcf supports internal rearrange.
 *   6. [optional] fully upgrade the contract; verify that it works
 */

export const makeZoeTestContext = async t => {
  console.time('ZoeTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log, 'bundles/zoe', {
    configSpecifier: '@agoric/vm-config/decentral-demo-config.json',
  });

  const { controller, runUtils } = swingsetTestKit;
  console.timeLog('DefaultTestContext', 'swingsetTestKit');
  const { EV } = runUtils;

  await eventLoopIteration();

  // We don't need vaults, but this gets the brand, which is checked somewhere
  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(
    swingsetTestKit.storage,
  );
  console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  const zoeDriver = await makeZoeDriver(swingsetTestKit);
  console.timeLog('DefaultTestContext', 'walletFactoryDriver');

  console.timeEnd('DefaultTestContext');

  const buildProposal = makeProposalExtractor({
    childProcess: processAmbient,
    fs: fsAmbientPromises,
  });

  return {
    ...swingsetTestKit,
    controller,
    agoricNamesRemotes,
    zoeDriver,
    buildProposal,
  };
};

const test = anyTest as TestFn<Awaited<ReturnType<typeof makeZoeTestContext>>>;

test.before(async t => {
  t.context = await makeZoeTestContext(t);
});

test.after.always(t => t.context.shutdown?.());

test('run restart-vats proposal', async t => {
  const { controller, buildProposal, zoeDriver } = t.context;
  const { EV } = t.context.runUtils;

  const buildAndExecuteProposal = async packageSpec => {
    const proposal = await buildProposal(packageSpec);

    for await (const bundle of proposal.bundles) {
      await controller.validateAndInstallBundle(bundle);
    }

    t.log('installed', proposal.bundles.length, 'bundles');

    t.log('launching proposal');
    const bridgeMessage = {
      type: 'CORE_EVAL',
      evals: proposal.evals,
    };

    t.log({ bridgeMessage });
    const coreEvalBridgeHandler: ERef<BridgeHandler> = await EV.vat(
      'bootstrap',
    ).consumeItem('coreEvalBridgeHandler');
    await EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);
  };
  const source = `${dirname}/${ZCF_PROBE_SRC}`;
  const zcfProbeBundle = await bundleSource(source);
  await controller.validateAndInstallBundle(zcfProbeBundle);
  // This test self-sufficiently builds all the artifacts it needs. The test in
  // .../packages/deployment/upgradeTest/upgrade-test-scripts/unreleased-upgrade/zoe-upgrade/
  // needs a bundled copy of ./zcfProbe.js as of the final commit that will be
  // installed on-chain. Uncomment the following line and add
  // `import fs from "fs";` to generate a bundle of the contract.
  // fs.writeFileSync('bundles/prober-contract-bundle.json', JSON.stringify(zcfProbeBundle));

  const brandRecord = await zoeDriver.instantiateProbeContract(zcfProbeBundle);
  const { brand, issuer } = brandRecord;

  t.deepEqual(await zoeDriver.verifyRealloc(), {});

  const ducats = await zoeDriver.faucet();
  const initialAmount = await EV(issuer).getAmountOf(ducats);

  const beforeResult = await zoeDriver.probeReallocation(initialAmount, ducats);
  t.true(beforeResult.stagingResult);
  t.true(beforeResult.helperResult);
  // In this version of the test, we're upgrading from new ZCF to new ZCF
  t.true(beforeResult.internalResult);
  matchAmount(t, (await zoeDriver.verifyRealloc()).Ducats, brand, 3n);

  t.log('building proposal');
  // /////// Upgrading ////////////////////////////////
  await buildAndExecuteProposal('@agoric/builders/scripts/vats/replace-zoe.js');

  t.log('upgrade zoe&zcf proposal executed');
  await zoeDriver.upgradeProbe(zcfProbeBundle);
  const nextDucats = beforeResult.leftoverPayments.Ducats;
  const nextAmount = await EV(issuer).getAmountOf(nextDucats);

  const afterResult = await zoeDriver.probeReallocation(nextAmount, nextDucats);
  t.true(afterResult.stagingResult);
  t.true(afterResult.helperResult);
  t.true(afterResult.internalResult);
  matchAmount(t, (await zoeDriver.verifyRealloc()).Ducats, brand, 6n);
});
