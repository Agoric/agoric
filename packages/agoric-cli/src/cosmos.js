import chalk from 'chalk';
import path from 'path';
import { makePspawn, getSDKBinaries } from './helpers.js';

const filename = new URL(import.meta.url).pathname;

export default async function cosmosMain(progname, rawArgs, powers, opts) {
  const IMAGE = `ghcr.io/agoric/agoric-sdk`;
  const { anylogger, fs, spawn, process } = powers;
  const log = anylogger('agoric:cosmos');

  const popts = opts;

  const pspawnEnv = { ...process.env };
  if (popts.verbose > 1) {
    // Enable verbose logs.
    pspawnEnv.DEBUG = 'agoric:info';
  } else if (!popts.verbose) {
    // Disable more logs.
    pspawnEnv.DEBUG = 'agoric:none';
  }

  const pspawn = makePspawn({ env: pspawnEnv, log, spawn, chalk });

  function helper(args, hopts = undefined) {
    if (!opts.dockerTag) {
      const sdkPrefixes = {};
      if (!opts.sdk) {
        const agoricPrefix = path.resolve(`node_modules/@agoric`);
        sdkPrefixes.goPfx = agoricPrefix;
        sdkPrefixes.jsPfx = agoricPrefix;
      }

      // Use the locally-built binaries.
      const { cosmosHelper, cosmosClientBuild } = getSDKBinaries(sdkPrefixes);
      return fs
        .stat(cosmosHelper)
        .then(
          () => 0,
          async e => {
            if (e.code === 'ENOENT') {
              // Build the client helper.
              log.warn('Building the Cosmos client helper...');
              const ps = pspawn(
                cosmosClientBuild[0],
                cosmosClientBuild.slice(1),
                {
                  cwd: path.dirname(filename),
                  stdio: ['ignore', 'pipe', 'inherit'],
                },
              );
              // Ensure the build doesn't mess up stdout.
              ps.childProcess.stdout?.pipe(process.stderr);
              return ps;
            }
            throw e;
          },
        )
        .then(async code => {
          if (code !== 0) {
            throw Error(`Cosmos client helper build failed with code ${code}`);
          }
          return pspawn(cosmosHelper, args, hopts);
        });
    }

    // Don't allocate a TTY if we're not talking to one.
    const ttyFlag = process.stdin.isTTY && process.stdout.isTTY ? '-it' : '-i';

    return pspawn(
      'docker',
      [
        'run',
        `--volume=agoric-state:/root/.agoric`,
        '--rm',
        ttyFlag,
        '--entrypoint=agd',
        `${IMAGE}:${opts.dockerTag}`,
        ...args,
      ],
      hopts,
    );
  }

  const exitStatus = await (popts.pull && pspawn('docker', ['pull', IMAGE]));
  if (exitStatus) {
    return exitStatus;
  }

  return helper(rawArgs.slice(1));
}
