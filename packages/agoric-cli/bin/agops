#!/usr/bin/env node
// @ts-check
// @jessie-check

/* global fetch, setTimeout */

import '@endo/init/pre.js';

import '@agoric/casting/node-fetch-shim.js';
import '@endo/init';

import { E } from '@endo/far';

import { execFileSync } from 'child_process';
import path from 'path';
import process from 'process';
import anylogger from 'anylogger';
import { Command, CommanderError, createCommand } from 'commander';
import { makeOracleCommand } from './commands/oracle.js';
import { makeEconomicCommiteeCommand } from './commands/ec.js';
import { makePsmCommand } from './commands/psm.js';
import { makeReserveCommand } from './commands/reserve.js';
import { makeVaultsCommand } from './commands/vaults.js';
import { makePerfCommand } from './commands/perf.js';
import { makeInterCommand } from './commands/inter.js';
import { makeAuctionCommand } from './commands/auction.js';
import { makeTestCommand } from './commands/test-upgrade.js';

const logger = anylogger('agops');
const progname = path.basename(process.argv[1]);

const program = new Command();
program.name(progname).version('unversioned');

program.addCommand(makeOracleCommand(logger));
program.addCommand(makeEconomicCommiteeCommand(logger));
program.addCommand(makePerfCommand(logger));
program.addCommand(makePsmCommand(logger));
program.addCommand(makeVaultsCommand(logger));

/**
 * XXX Threading I/O powers has gotten a bit jumbled.
 *
 * Perhaps a more straightforward approach would be:
 *
 *  - makeTUI({ stdout, stderr, logger })
 *    where tui.show(data) prints data as JSON to stdout
 *    and tui.warn() and tui.error() log ad-hoc to stderr
 *  - makeQueryClient({ fetch })
 *    with q.withConfig(networkConfig)
 *    and q.vstorage.get('published...') (no un-marshaling)
 *    and q.pollBlocks(), q.pollTx()
 *    also, printing the progress message should be done
 *    in the lookup callback
 *  - makeBoardClient(queryClient)
 *    with b.readLatestHead('published...')
 *  - makeKeyringNames({ execFileSync })
 *    with names.lookup('gov1') -> 'agoric1...'
 *    and names.withBackend('test')
 *    and names.withHome('~/.agoric')
 *  - makeSigner({ execFileSync })
 *    signer.sendSwingsetTx()
 */
const procIO = {
  env: { ...process.env },
  stdout: process.stdout,
  stderr: process.stderr,
  createCommand,
  execFileSync,
  now: () => Date.now(),
  setTimeout,
};

program.addCommand(makeReserveCommand(logger, procIO));
program.addCommand(makeAuctionCommand(logger, { ...procIO, fetch }));
program.addCommand(makeInterCommand(procIO, { fetch }));
program.addCommand(makeTestCommand(procIO, { fetch }));

E.when(program.parseAsync(process.argv), undefined, err => {
  if (err instanceof CommanderError) {
    console.error(err.message);
  } else {
    console.error(err); // CRASH! show stack trace
  }
  process.exit(1);
});
