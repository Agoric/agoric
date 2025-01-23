import { test as anyTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { makeSwingsetTestKit } from '../../tools/supports.js';

// A more minimal set would be better. We need governance, but not econ vats.
const PLATFORM_CONFIG = '@agoric/vm-config/decentral-main-vaults-config.json';

const makeDefaultTestContext = async t => {
  const swingsetTestKit = await makeSwingsetTestKit(t.log, undefined, {
    configSpecifier: PLATFORM_CONFIG,
  });
  const { runUtils } = swingsetTestKit;
  const { EV } = runUtils;

  // We need to poke at bootstrap vat and wait for results to allow
  // SwingSet to finish its boot process before we start the test
  const zoe: ZoeService = await EV.vat('bootstrap').consumeItem('zoe');

  return { ...swingsetTestKit };
};

const test = anyTest as TestFn<
  Awaited<ReturnType<typeof makeDefaultTestContext>>
>;

test.before(async t => {
  t.context = await makeDefaultTestContext(t);
});

test.after.always(t => {
  return t.context.shutdown && t.context.shutdown();
});

test(`Create a contract via core-eval and kill it via core-eval by boardID `, async t => {
  const TEST_CONTRACT_LABEL = 'testContractLabel';
  const { runUtils, buildProposal, evalProposal } = t.context;
  const { EV } = runUtils;

  // create a contract via core-eval
  const testContractProposalArgs = [TEST_CONTRACT_LABEL];
  const creatorProposalMaterials = buildProposal(
    '@agoric/governance/test/swingsetTests/contractGovernor/add-governedContract.js',
    testContractProposalArgs,
  );
  await evalProposal(creatorProposalMaterials);

  const { boardID, publicFacet } =
    await EV.vat('bootstrap').consumeItem(TEST_CONTRACT_LABEL);
  console.log({ boardID });

  // confirming the contract actually works
  const num = await EV(publicFacet).getNum();
  t.is(num, 602214090000000000000000n);

  // killing via terminate-governed-instance
  const targets = [`${boardID}:${TEST_CONTRACT_LABEL}`];
  console.log({ targets });

  const terminatorProposalMaterials = buildProposal(
    '@agoric/builders/scripts/vats/terminate-governed-instance.js',
    targets,
  );
  await evalProposal(terminatorProposalMaterials);

  // confirm the contract is no longer there
  await t.throwsAsync(() => EV(publicFacet).getNum(), {
    message: 'vat terminated',
  });
});
