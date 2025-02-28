// @ts-check
import anyTest from 'ava';
import fs from 'fs/promises';
// Use ambient authority only in test.before()
import { spawn as ambientSpawn } from 'child_process';
import * as ambientPath from 'path';

import { stderr } from 'process';
import { makeScenario2, makeWalletTool, pspawn } from './scenario2.js';

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

/** @type {import('ava').Macro<[title: string, verifier?: any], any>} */
const walletProvisioning = test.macro({
  title(_, title, _verifier) {
    return title;
  },
  async exec(t, _title, _verifier) {
    const retryCountMax = 5;
    // Resume the chain... and concurrently, start a faucet AND run the rosetta-cli tests
    const { pspawnAgd, scenario2 } = t.context;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const { query, waitForBlock } = makeWalletTool({
      pspawnAgd,
      runMake: scenario2.runMake,
      log: t.log,
      delay,
    });

    // Run the chain until error or rosetta-cli exits.
    const chain = scenario2.spawnMake(['scenario2-run-chain'], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    await waitForBlock('chain bootstrap', 1);

    const fundPool = scenario2.spawnMake(['fund-provision-pool']);
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

    const soloAddr = (
      await fs.readFile('t1/8000/ag-cosmos-helper-address', 'utf-8')
    ).trimEnd();

    const checkWalletExists = async address => {
      try {
        const { value } = await query([
          '--output=json',
          'vstorage',
          'path',
          `published.wallet.${address}`,
        ]);
        t.log('query vstorage path published.wallet exits successfully');
        return !!value;
      } catch (e) {
        t.log(e);
        return false;
      }
    };

    t.false(
      await checkWalletExists(soloAddr),
      `${soloAddr} wallet doesn't exist yet`,
    );

    await waitForBlock('after funding', 1, true);
    const provisionAcct = scenario2.spawnMake(
      ['provision-acct', `ACCT_ADDR=${soloAddr}`],
      { stdio: ['ignore', 'inherit', 'inherit'] },
    );

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
        t.log(`provisioned wallet ${soloAddr} is published`);
        break;
      }
      retryCount += 1;
      await waitForBlock(
        `${retryCount}/${retryCountMax} waiting for wallet provisioning`,
        1,
        true,
      );
    }
    t.true(
      retryCount < retryCountMax,
      `wallet is provisioned within ${retryCount} retries out of ${retryCountMax}`,
    );
  },
});

test.serial(walletProvisioning, 'wallet provisioning');
