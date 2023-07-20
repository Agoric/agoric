#!/bin/env node
// @ts-check
// @jessie-check
/* global globalThis */

import '@endo/init';
import process from 'process';

import anylogger from 'anylogger';
import { createCommand, CommanderError } from 'commander';

import { makeHttpClient } from '@agoric/casting/src/makeHttpClient.js';

import { makeTUI } from './lib/tui.js';
import { addBidCommand } from './commands/auction.js';
import { getNetworkConfig } from './lib/networkConfig.js';
import { makeBatchQuery } from './lib/vstorage.js';

const DISCLAIMER =
  'Source code licensed under Apache 2.0. Use at your own risk.';

/**
 * Create and run the inter command,
 * portioning out authority as needed.
 */
const main = async () => {
  const logger = anylogger('inter');
  const tui = makeTUI({ stdout: process.stdout, logger });

  const { env } = process;
  env.ACK_IST_RISK || tui.warn(DISCLAIMER);

  let config;
  // NOTE: delay getNetworkConfig() and all other I/O
  // until a command .action() is run
  const provideConfig = async () => {
    await null;
    if (config) return config;
    config = await getNetworkConfig(env, { fetch: globalThis.fetch });
    return config;
  };

  const pick = xs => xs[Math.floor(Math.random() * xs.length)];

  // cosmjs-based RPC client is only used for .Children()
  const makeRpcClient = () =>
    provideConfig().then(c => {
      const rpcAddr = pick(c.rpcAddrs);
      return makeHttpClient(rpcAddr, globalThis.fetch);
    });

  // cosmjs/protobuf tooling doesn't support batch query,
  // so we re-implement it using fetch().
  const getBatchQuery = () =>
    provideConfig().then(({ rpcAddrs }) =>
      makeBatchQuery(globalThis.fetch, rpcAddrs),
    );

  const interCmd = createCommand('inter-tool').description(
    'Inter Protocol auction bid query',
  );
  addBidCommand(interCmd, { tui, getBatchQuery, makeRpcClient });

  try {
    interCmd.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof CommanderError) {
      console.error(err.message);
    } else {
      console.error(err); // CRASH! show stack trace
    }
    process.exit(1);
  }
};

main();
