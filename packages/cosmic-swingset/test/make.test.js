// @ts-check
import anyTest from 'ava';
import fs from 'fs/promises';
// Use ambient authority only in test.before()
import { spawn as ambientSpawn } from 'child_process';
import * as ambientPath from 'path';

import { makeScenario2, pspawn } from './scenario2.js';
import { stderr } from 'process';

/** @type {import('ava').TestFn<Awaited<ReturnType<typeof makeTestContext>>>} */
const test = anyTest;

const makeTestContext = async t => {
  const filename = new URL(import.meta.url).pathname;
  const dirname = ambientPath.dirname(filename);
  const makefileDir = ambientPath.join(dirname, '..');

  const io = { spawn: ambientSpawn, cwd: makefileDir };
  const pspawnMake = pspawn('make', io);
  const pspawnAgd = pspawn('../../bin/agd', io);
  const scenario2 = makeScenario2({ pspawnMake, pspawnAgd, log: t.log });
  return { scenario2, pspawnAgd, pspawnMake };
};

test.before(async t => {
  t.context = await makeTestContext(t);
  await t.context.scenario2.setup();
});

test.serial('make and exec', async t => {
  // Note: the test harness discards the (voluminous) log messages
  // emitted by the kernel and vats. You can run `make scenario2-setup
  // scenario2-run-chain-to-halt` manually, to see them all.
  const { pspawnAgd, scenario2 } = t.context;
  t.log('exec agd');
  t.is(await pspawnAgd([]).exit, 0, 'exec agd exits successfully');
  t.log('run chain to halt');
  t.is(
    await scenario2.runToHalt(),
    0,
    'make scenario2-run-chain-to-halt is successful',
  );
  t.log('resume chain and halt');
  t.is(
    await scenario2.runToHalt(),
    0,
    'make scenario2-run-chain-to-halt succeeds again',
  );
  t.log('export');
  t.is(await scenario2.export(), 0, 'export exits successfully');
});

test.serial('integration test: rosetta CI', async t => {
  // Resume the chain... and concurrently, start a faucet AND run the rosetta-cli tests
  const { scenario2 } = t.context;

  // Run the chain until error or rosetta-cli exits.
  const chain = scenario2.spawnMake(['scenario2-run-chain'], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const rosetta = scenario2.spawnMake(['scenario2-run-rosetta-ci']);
  const cleanup = async () => {
    chain.kill();
    rosetta.kill();
    await Promise.allSettled([chain.exit, rosetta.exit]);
  };
  t.teardown(cleanup);

  const code = await Promise.race([
    rosetta.exit,
    // Don't leave behind an unhandled rejection, but still treat winning this
    // race as a failure.
    chain.exit.then(c => `chain exited unexpectedly with code ${c}`),
  ]);
  t.is(code, 0, 'make scenario2-run-rosetta-ci is successful');
});

/** @type {import('ava').Macro<[description: string, verifier?: any], any>} */
const walletProvisioning = test.macro({
  title(_, description, _verifier) {
    return description;
  },
  async exec(t, _description, verifier) {
    const retryCountMax = 5;
    // Resume the chain... and concurrently, start a faucet AND run the rosetta-cli tests
    const { pspawnAgd, scenario2 } = t.context;

    // Run the chain until error or rosetta-cli exits.
    const chain = scenario2.spawnMake(['scenario2-run-chain'], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    const fundPool = scenario2.spawnMake(['wait-for-cosmos', 'fund-provision-pool']);
    const cleanup = async () => {
      chain.kill();
      fundPool.kill();
      await Promise.allSettled([chain.exit, fundPool.exit]);
    };
    t.teardown(cleanup);

    const fundPoolExitCode = await Promise.race([
      fundPool.exit,
      // Don't leave behind an unhandled rejection, but still treat winning this
      // race as a failure.
      chain.exit.then(c => `chain exited unexpectedly with code ${c}`),
    ]);

    t.is(fundPoolExitCode, 0, 'make fund-provision-pool is successful');

    const soloAddr = await fs.readFile('t1/8000/ag-cosmos-helper-address', 'utf-8');

    const checkWalletExists = async (address) => {
      const { stdout, exit } = pspawnAgd(['query', '-ojson', 'vstorage', 'path', `published.wallet.${address}`]);
      try {
        await exit;
      } catch (e) {
        t.log(e);
        return false;
      }
      t.log('query vstorage path published.wallet exits successfully');
      const { value } = JSON.parse(stdout);
      return !!value;
    }

    t.false(await checkWalletExists(soloAddr));

    const provisionAcct = scenario2.spawnMake(['wait-for-cosmos', 'provision-acct', `ACCT_ADDR=${soloAddr}`]);

    const cleanupProvisionAcct = async () => {
      provisionAcct.kill();
      await provisionAcct.exit;
    };
    t.teardown(cleanupProvisionAcct);

    const provisionExitCode = await Promise.race([
      provisionAcct.exit,
      // Don't leave behind an unhandled rejection, but still treat winning this
      // race as a failure.
      chain.exit.then(c => `chain exited unexpectedly with code ${c}`),
    ]);

    t.is(provisionExitCode, 0, 'make provision-acct is successful');

    // Wait for the wallet to be published
    // XXX: This is a temporary solution to wait for the wallet to be published
    // until we have a better way to do it.
    let retryCount = 0;
    while (retryCount < retryCountMax) {
      if (await checkWalletExists(soloAddr)) {
        t.pass('wallet is published');
        break;
      }
      retryCount++;
      const waitForCosmos = scenario2.spawnMake(['wait-for-cosmos']);
      assert.equal(await waitForCosmos.exit, 0);
    }
    t.true(retryCount < retryCountMax, `wallet is published within ${retryCount} retries out of ${retryCountMax}`);
  }
});

test.serial(walletProvisioning, 'wallet provisioning');
