/* eslint-disable @jessie.js/no-nested-await */
/* global process, setInterval, clearInterval */
// @ts-check
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { Command } from 'commander';
import opener from 'opener';
import { assert, details as X } from '@agoric/assert';
import {
  DEFAULT_KEEP_POLLING_SECONDS,
  DEFAULT_JITTER_SECONDS,
} from '@agoric/casting';
import { makeMyAgoricDir } from '@agoric/access-token';
import cosmosMain from './cosmos.js';
import deployMain from './deploy.js';
import publishMain from './main-publish.js';
import initMain, { makeInitCommand } from './init.js';
import installMain from './install.js';
import setDefaultsMain from './set-defaults.js';
import startMain from './start.js';
import followMain from './follow.js';
import { makeOpenCommand, makeTUI } from './open.js';
import { makeWalletCommand } from './commands/wallet.js';

const STAMP = '_agstate';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

/**
 * @param {string} progname
 * @param {string[]} rawArgs
 * @param {object} powers
 * @param {typeof import('anylogger').default} powers.anylogger
 * @param {typeof import('fs/promises')} powers.fs
 * @param {typeof import('fs')} powers.fsSync
 */
const main = async (progname, rawArgs, powers) => {
  const { anylogger, fs, fsSync } = powers;
  const log = anylogger('agoric');

  const program = new Command();

  async function isNotBasedir() {
    try {
      await fs.stat(STAMP);
      return false;
    } catch (e) {
      log.error(`current directory wasn't created by '${progname} init'`);
      program.help();
    }
    return true;
  }

  // This seems to be the only way to propagate the exit code.
  const procExit = code => process.exit(code || 0);

  program.storeOptionsAsProperties(false);

  const pj = await fs.readFile(`${dirname}/../package.json`, 'utf-8');
  const pkg = JSON.parse(pj);
  program.name(pkg.name).version(pkg.version);

  program
    .option('--sdk', 'use the Agoric SDK containing this program')
    .option('--no-sdk', 'do not use the Agoric SDK containing this program')
    .option('--docker-tag <tag>', 'image tag to use for Docker containers')
    .option(
      '-v, --verbose',
      'verbosity that can be increased',
      (_value, previous) => previous + 1,
      0,
    );

  // Add each of the commands.
  program
    .command('cosmos <command...>')
    .description('client for an Agoric Cosmos chain')
    .action(async (command, cmd) => {
      const opts = { ...program.opts(), ...cmd.opts() };
      return cosmosMain(progname, ['cosmos', ...command], powers, opts).then(
        procExit,
      );
    });

  const { randomBytes } = crypto;
  const baseDir = makeMyAgoricDir(path.join(os.homedir(), '.agoric'), {
    fs: fsSync,
  });
  const tui = makeTUI(
    { stdout: process.stdout, stderr: process.stderr },
    { setInterval, clearInterval },
  );
  program.addCommand(makeOpenCommand({ opener, baseDir, tui, randomBytes }));

  program.addComman(
    makeInitCommand().action(async (project, cmd) => {
      const opts = { ...program.opts(), ...cmd.opts() };
      return initMain(progname, ['init', project], powers, opts).then(procExit);
    }),
  );

  program
    .command('set-defaults <program> <config-dir>')
    .description('update the configuration files for <program> in <config-dir>')
    .option(
      '--enable-cors',
      'open RPC and API endpoints to all cross-origin requests',
      false,
    )
    .option(
      '--export-metrics',
      'open ports to export Prometheus metrics',
      false,
    )
    .option(
      '--import-from <dir>',
      'import the exported configuration from <dir>',
    )
    .option(
      '--persistent-peers <addrs>',
      'set the config.toml p2p.persistent_peers value',
      '',
    )
    .option('--seeds <addrs>', 'set the config.toml p2p.seeds value', '')
    .option(
      '--unconditional-peer-ids <ids>',
      'set the config.toml p2p.unconditional_peer_ids value',
      '',
    )
    .action(async (prog, configDir, cmd) => {
      const opts = { ...program.opts(), ...cmd.opts() };
      return setDefaultsMain(
        progname,
        ['set-defaults', prog, configDir],
        powers,
        opts,
      ).then(procExit);
    });

  program
    .command('install [force-sdk-version]')
    .description('install Dapp dependencies')
    .action(async (forceSdkVersion, cmd) => {
      await isNotBasedir();
      const opts = { ...program.opts(), ...cmd.opts() };
      return installMain(
        progname,
        ['install', forceSdkVersion],
        powers,
        opts,
      ).then(procExit);
    });

  program
    .command('follow <path-spec...>')
    .description('follow an Agoric Casting leader')
    .option(
      '--proof <strict | optimistic | none>',
      'set proof mode',
      value => {
        assert(
          ['strict', 'optimistic', 'none'].includes(value),
          X`--proof must be one of 'strict', 'optimistic', or 'none'`,
          TypeError,
        );
        return value;
      },
      'optimistic',
    )
    .option(
      '--sleep <seconds>',
      'sleep <seconds> between polling (may be fractional)',
      value => {
        const num = Number(value);
        assert.equal(`${num}`, value, X`--sleep must be a number`, TypeError);
        return num;
      },
      DEFAULT_KEEP_POLLING_SECONDS,
    )
    .option(
      '--jitter <max-seconds>',
      'jitter up to <max-seconds> (may be fractional)',
      value => {
        const num = Number(value);
        assert.equal(`${num}`, value, X`--jitter must be a number`, TypeError);
        return num;
      },
      DEFAULT_JITTER_SECONDS,
    )
    .option(
      '-o, --output <format>',
      'value output format',
      value => {
        assert(
          [
            'hex',
            'justin',
            'justinlines',
            'json',
            'jsonlines',
            'text',
          ].includes(value),
          X`--output must be one of 'hex', 'justin', 'justinlines', 'json', 'jsonlines', or 'text'`,
          TypeError,
        );
        return value;
      },
      'justin',
    )
    .option(
      '-l, --lossy',
      'show only the most recent value for each sample interval',
    )
    .option(
      '-b, --block-height',
      'show first block height when each value was stored',
    )
    .option(
      '-c, --current-block-height',
      'show current block height when each value is reported',
    )
    .option('-B, --bootstrap <config>', 'network bootstrap configuration')
    .action(async (pathSpecs, cmd) => {
      const opts = { ...program.opts(), ...cmd.opts() };
      return followMain(progname, ['follow', ...pathSpecs], powers, opts).then(
        procExit,
      );
    });

  const addRunOptions = cmd =>
    cmd
      .option(
        '--allow-unsafe-plugins',
        `CAREFUL: installed Agoric VM plugins will also have all your user's privileges`,
        false,
      )
      .option(
        '--hostport <host:port>',
        'host and port to connect to VM',
        '127.0.0.1:8000',
      )
      .option(
        '--need <subsystems>',
        'comma-separated names of subsystems to wait for',
        'local,agoric,wallet',
      )
      .option(
        '--provide <subsystems>',
        'comma-separated names of subsystems this script initializes',
        '',
      );

  addRunOptions(
    program
      .command('run <script> [script-args...]')
      .description(
        'run a script with all your user privileges against the local Agoric VM',
      ),
  ).action(async (script, scriptArgs, cmd) => {
    const opts = { ...program.opts(), ...cmd.opts(), scriptArgs };
    return deployMain(progname, ['run', script], powers, opts).then(procExit);
  });

  addRunOptions(
    program
      .command('deploy [script...]')
      .option(
        '--target <target>',
        'One of agoric, local, cosmos, or sim',
        'agoric',
      )
      .description(
        'run multiple scripts with all your user privileges against the local Agoric VM',
      ),
  ).action(async (scripts, cmd) => {
    const opts = { ...program.opts(), ...cmd.opts() };
    return deployMain(progname, ['deploy', ...scripts], powers, opts).then(
      procExit,
    );
  });

  addRunOptions(
    program
      .command('publish [bundle...]')
      .option(
        '-n, --node <rpcAddress>',
        '[required] A bare IPv4 address or fully qualified URL of an RPC node',
      )
      .option(
        '-h, --home <directory>',
        "[required] Path to the directory containing ag-solo-mnemonic, for the publisher's wallet mnemonic",
      )
      .option(
        '-c, --chain-id <chainID>',
        'The ID of the destination chain, if not simply "agoric"',
      )
      .description('publish a bundle to a Cosmos chain'),
  ).action(async (bundles, cmd) => {
    const opts = { ...program.opts(), ...cmd.opts() };
    return publishMain(progname, ['publish', ...bundles], powers, opts).then(
      procExit,
    );
  });

  program.addCommand(await makeWalletCommand());

  program
    .command('start [profile] [args...]')
    .description(
      `\
start an Agoric VM

agoric start - runs the default profile (dev)
agoric start dev -- [initArgs] - simulated chain and solo VM
agoric start local-chain [portNum] -- [initArgs] - local chain
agoric start local-solo [portNum] [provisionPowers] - local solo VM
`,
    )
    .option('-d, --debug', 'run in JS debugger mode')
    .option('--reset', 'clear all VM state before starting')
    .option('--no-restart', 'do not actually start the VM')
    .option('--pull', 'for Docker-based VM, pull the image before running')
    .option('--rebuild', 'rebuild VM dependencies before running')
    .option(
      '--delay [seconds]',
      'delay for simulated chain to process messages',
    )
    .option(
      '--inspect [host[:port]]',
      'activate inspector on host:port (default: "127.0.0.1:9229")',
    )
    .option(
      '--inspect-brk [host[:port]]',
      'activate inspector on host:port and break at start of script (default: "127.0.0.1:9229")',
    )
    .option(
      '--wallet <package>',
      'install the wallet from NPM package <package>',
      '@agoric/wallet-frontend',
    )
    .action(async (profile, args, cmd) => {
      await isNotBasedir();
      const opts = { ...program.opts(), ...cmd.opts() };
      return startMain(
        progname,
        ['start', profile, ...args],
        powers,
        opts,
      ).then(procExit);
    });

  // Throw an error instead of exiting directly.
  program.exitOverride();

  // Hack: cosmos arguments are always unparsed.
  const cosmosIndex = rawArgs.indexOf('cosmos');
  if (cosmosIndex >= 0) {
    rawArgs.splice(cosmosIndex + 1, 0, '--');
  }

  try {
    await program.parseAsync(rawArgs, { from: 'user' });
  } catch (e) {
    if (e && e.name === 'CommanderError') {
      return e.exitCode;
    }
    throw e;
  }
  return 0;
};

export default main;
