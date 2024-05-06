/* global process setTimeout setInterval clearInterval */

import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { makePromiseKit } from '@endo/promise-kit';
import { request } from 'http';

import { spawn } from 'child_process';

import { makePspawn } from '../src/helpers.js';

const TIMEOUT_SECONDS = 3 * 60;

const dirname = new URL('./', import.meta.url).pathname;

// To keep in sync with https://docs.agoric.com/guides/getting-started/

// Note that we currently only test:
// agoric init dapp-foo
// yarn install
// yarn start:docker
// yarn start:contract
// yarn start:ui

export const gettingStartedWorkflowTest = async (t, options = {}) => {
  const { init: initOptions = [] } = options;
  const pspawn = makePspawn({ spawn });

  // Kill an entire process group.
  const pkill = (cp, signal = 'SIGINT') => process.kill(-cp.pid, signal);

  function pspawnStdout(...args) {
    const ps = pspawn(...args);
    ps.childProcess.stdout.on('data', chunk => {
      process.stdout.write(chunk);
    });
    // ps.childProcess.unref();
    return ps;
  }

  const defaultAgoricCmd = () => {
    // Run all main programs with the '--sdk' flag if we are in agoric-sdk.
    const extraArgs = fs.existsSync(`${dirname}/../../cosmic-swingset`)
      ? ['--sdk']
      : [];
    const localCli = path.join(dirname, '..', 'bin', 'agoric');
    return [localCli, ...extraArgs];
  };
  const { AGORIC_CMD = JSON.stringify(defaultAgoricCmd()) } = process.env;
  const agoricCmd = JSON.parse(AGORIC_CMD);
  function myMain(args, opts = {}) {
    return pspawnStdout(agoricCmd[0], [...agoricCmd.slice(1), ...args], {
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env, DEBUG: 'agoric:debug' },
      detached: true,
      ...opts,
    });
  }

  /** @param {string[]} args */
  function yarn(args) {
    return pspawnStdout('yarn', args, {
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env },
      detached: true,
    });
  }

  /** @param {string[]} args */
  function npmRun(args) {
    return pspawnStdout('npm', ['run', ...args], {
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env },
      detached: true,
    });
  }

  const olddir = process.cwd();
  const { name } = tmp.dirSync({
    unsafeCleanup: true,
    prefix: 'agoric-cli-test-',
  });

  const finalizers = [];
  const runFinalizers = sig => {
    while (finalizers.length) {
      const f = finalizers.shift();
      try {
        f();
      } catch (e) {
        console.log(e);
      }
    }
    if (sig) {
      // We're dying due to signal.
      process.exit(1);
    }
  };

  await null;
  try {
    process.on('SIGINT', runFinalizers);
    process.on('exit', runFinalizers);
    process.chdir(name);

    // ==============
    // agoric init dapp-foo
    if (process.env.AGORIC_INIT_OPTIONS) {
      const opts = JSON.parse(process.env.AGORIC_INIT_OPTIONS);
      initOptions.push(...opts);
    }
    t.is(
      await myMain(['init', ...initOptions, 'dapp-foo']),
      0,
      'init dapp-foo works',
    );
    process.chdir('dapp-foo');

    // ==============
    // yarn install
    t.is(await yarn(['install']), 0, 'yarn install works');

    // ==============
    // yarn start:docker
    t.is(await npmRun(['start:docker']), 0, 'yarn start:docker works');

    // XXX: use abci_info endpoint to get block height
    // sleep to let contract start
    await new Promise(resolve => setTimeout(resolve, TIMEOUT_SECONDS));

    // ==============
    // yarn start:contract
    t.is(await npmRun(['start:contract']), 0, 'yarn start:contract works');

    // ==============
    // yarn start:ui
    const startUiP = npmRun(['start:ui']);
    finalizers.push(() => pkill(startUiP.childProcess, 'SIGINT'));
    const uiListening = makePromiseKit();
    let retries = 0;
    const ival = setInterval(() => {
      try {
        const resolve = status => {
          clearInterval(ival);
          uiListening.resolve(status);
        };

        retries += 1;
        if (retries > 8) {
          resolve('too many retries');
          return;
        }

        const req = request('http://localhost:5173/', _res => {
          resolve('listening');
        });
        req.setTimeout(2000);
        req.on('error', err => {
          if (err.code !== 'ECONNREFUSED') {
            resolve(`Cannot connect to UI server: ${err}`);
          }
        });
        req.end();
      } catch (e) {
        console.error('cannot make request', e);
      }
    }, 3000);
    t.is(
      await Promise.race([startUiP, uiListening.promise]),
      'listening',
      `yarn start:ui succeeded`,
    );
    clearInterval(ival);
  } finally {
    runFinalizers();
    process.off('SIGINT', runFinalizers);
    process.chdir(olddir);
  }
};
