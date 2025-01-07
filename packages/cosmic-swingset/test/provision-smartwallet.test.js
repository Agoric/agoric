/* global setTimeout */
import test from 'ava';

// Use ambient authority only in test.before()
import { spawn as ambientSpawn } from 'child_process';
import * as ambientPath from 'path';
import * as ambientFs from 'fs';

import { VBankAccount } from '@agoric/internal';
import { makeScenario2, makeWalletTool, pspawn } from './scenario2.js';

// module account address for 'vbank/provision'; aka "megz"
//
// It seems to be some sort of hash of the name, 'vbank/provision'.
// Lack of documentation is a known issue:
// https://github.com/cosmos/cosmos-sdk/issues/8411
//
// In `startWalletFactory.js` we have:
// `E(bankManager).getModuleAccountAddress('vbank/provision')`
// Then in `vat-bank.js` we have a `VBANK_GET_MODULE_ACCOUNT_ADDRESS`
// call across the bridge to golang; `vbank.go` handles it
// by way of `GetModuleAccountAddress` which calls into the cosmos-sdk
// `x/auth` module... over hill and dale, we seem to end up
// with `crypto.AddressHash([]byte(name))` at
// https://github.com/cosmos/cosmos-sdk/blob/512953cd689fd96ef454e424c81c1a0da5782074/x/auth/types/account.go#L158
//
// Whether this implementation is even correct seems to be
// at issue:
// ModuleAccount addresses don't follow ADR-028
// https://github.com/cosmos/cosmos-sdk/issues/13782 Nov 2022
const provisionPoolModuleAccount = VBankAccount.provision.address;

test.before(async t => {
  const filename = new URL(import.meta.url).pathname;
  const dirname = ambientPath.dirname(filename);
  const makefileDir = ambientPath.join(dirname, '..');

  const delay = async ms => new Promise(resolve => setTimeout(resolve, ms));

  const io = { spawn: ambientSpawn, cwd: makefileDir };
  const pspawnMake = pspawn('make', io);
  const pspawnAgd = pspawn('bin/ag-chain-cosmos', io);
  const scenario2 = makeScenario2({ pspawnMake, pspawnAgd, log: t.log });
  const walletTool = makeWalletTool({
    runMake: scenario2.runMake,
    pspawnAgd,
    delay,
    log: t.log,
  });
  await scenario2.setup();

  const { readFile } = ambientFs.promises;
  const readItem = async f => readFile(f, 'utf-8').then(line => line.trim());
  const soloAddr = await readItem('./t1/8000/ag-cosmos-helper-address');
  const bootstrapAddr = await readItem('./t1/bootstrap-address');
  // console.debug('scenario2 addresses', { soloAddr, bootstrapAddr });

  t.context = { scenario2, walletTool, pspawnAgd, bootstrapAddr, soloAddr };
});

// SKIP: struggling with timing issues resulting in one of...
// Error: cannot grab 250000uist coins: 0uist is smaller than 250000uist: insufficient funds
// error: code = NotFound desc = account agoric1mhu... not found
// Sometimes I can get this test to work alone, but not
// if run with the test above.
// TODO: https://github.com/Agoric/agoric-sdk/issues/6766
test.skip('integration test: smart wallet provision', async t => {
  // @ts-expect-error context has unknown type
  const { scenario2, walletTool, soloAddr } = t.context;

  const enoughBlocksToProvision = 7;
  const provision = async () => {
    // idea: scenario2.waitForBlock(2, true); // let bootstrap account settle down.
    // idea: console.log('bootstrap ready', scenario2.queryBalance(bootstrapAddr));
    t.log('Fund pool with USDC');
    await walletTool.fundAccount(
      provisionPoolModuleAccount,
      `${234e6}ibc/toyusdc`,
    );
    t.log('Fund user account with some BLD');
    await walletTool.fundAccount(soloAddr, `${123e6}ubld`);
    t.log('Provision smart wallet');
    await walletTool.provisionMine(soloAddr, soloAddr);

    await walletTool.waitForBlock(
      'provision to finish',
      enoughBlocksToProvision,
      true,
    );
    return walletTool.queryBalance(soloAddr);
  };

  const queryGrace = 6; // time to query state before shutting down
  const [_run, addrQ] = await Promise.all([
    scenario2.runToHalt({
      BLOCKS_TO_RUN: enoughBlocksToProvision + queryGrace,
    }),
    provision(),
  ]);

  t.log('verify 10BLD spent, 0.25 IST received');
  t.deepEqual(addrQ.balances, [
    { amount: `${(123 - 10) * 1e6}`, denom: 'ubld' },
    { amount: `${0.25 * 1e6}`, denom: 'uist' },
  ]);
});
