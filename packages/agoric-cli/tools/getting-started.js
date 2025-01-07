// @ts-check
/* eslint-env node */

import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { makePromiseKit } from '@endo/promise-kit';
import { request } from 'http';

import { spawn } from 'child_process';

import { makePspawn } from '../src/helpers.js';

const RETRY_BLOCKHEIGHT_SECONDS = 3;
const SOCKET_TIMEOUT_SECONDS = 2;

// TODO: Set this to `true` when `agoric install $DISTTAG` properly updates the
// getting-started workflow's dependencies to current `@endo/*` and Agoric SDK
// from the local registry.
const AGORIC_INSTALL_DISTTAG = false;

const dirname = new URL('./', import.meta.url).pathname;

// To keep in sync with https://docs.agoric.com/guides/getting-started/

// Note that we currently only test:
// agoric init dapp-foo
// yarn install (or agoric install $DISTTAG)
// yarn start:docker
// yarn start:contract
// yarn start:ui

/**
 * @param {string} url
 * @returns {Promise<bigint>}
 */
const getLatestBlockHeight = async url =>
  new Promise((resolve, reject) => {
    const req = request(url, res => {
      if (!res) {
        reject(Error('no result'));
        return;
      }
      const bodyChunks = [];
      res
        .on('data', chunk => bodyChunks.push(chunk))
        .on('end', () => {
          const body = Buffer.concat(bodyChunks).toString('utf8');
          const { statusCode = 0 } = res;
          if (statusCode >= 200 && statusCode < 300) {
            const { result: { sync_info: sync = {} } = {} } = JSON.parse(body);
            if (sync.catching_up === false) {
              resolve(BigInt(sync.latest_block_height));
              return;
            }
          }
          reject(Error(`Cannot get block height: ${statusCode} ${body}`));
        });
    });
    req.setTimeout(SOCKET_TIMEOUT_SECONDS * 1_000);
    req.on('error', reject);
    req.end();
  });

/**
 * Test the "getting started" workflow. Note that this function may be imported
 * by external repositories.
 *
 * @param {import('ava').ExecutionContext} t
 * @param {{ init?: string[], install?: string[] }} [options]
 */
export const gettingStartedWorkflowTest = async (t, options = {}) => {
  const { init: initOptions = [], install: installOptions = [] } = options;
  const pspawn = makePspawn({ spawn });

  // Kill an entire process group.
  const pkill = (cp, signal = 'SIGINT') => process.kill(-cp.pid, signal);

  /** @param {Parameters<typeof pspawn>} args */
  async function pspawnStdout(...args) {
    const ps = pspawn(...args);
    const { stdout } = ps.childProcess;
    if (stdout) {
      stdout.on('data', chunk => {
        process.stdout.write(chunk);
      });
    }
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
  async function myMain(args, opts = {}) {
    return pspawnStdout(agoricCmd[0], [...agoricCmd.slice(1), ...args], {
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env, DEBUG: 'agoric:debug' },
      detached: true,
      ...opts,
    });
  }

  async function yarn(args) {
    return pspawnStdout('yarn', args, {
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

    if (AGORIC_INSTALL_DISTTAG && process.env.AGORIC_INSTALL_OPTIONS) {
      // ==============
      // agoric install $DISTTAG
      const opts = JSON.parse(process.env.AGORIC_INSTALL_OPTIONS);
      installOptions.push(...opts);
      t.is(
        await myMain(['install', ...installOptions]),
        0,
        'agoric install works',
      );
    } else {
      // ==============
      // yarn install
      t.is(await yarn(['install', ...installOptions]), 0, 'yarn install works');
    }

    // ==============
    // yarn start:docker
    t.is(await yarn(['start:docker']), 0, 'yarn start:docker works');

    // ==============
    // wait for the chain to start
    let lastKnownBlockHeight = 2n;
    for (;;) {
      try {
        const currentHeight = await getLatestBlockHeight(
          'http://localhost:26657/status',
        );
        if (currentHeight > lastKnownBlockHeight) {
          const earlierHeight = lastKnownBlockHeight;
          lastKnownBlockHeight = currentHeight;
          if (earlierHeight > 2n && currentHeight > earlierHeight) {
            // We've had at least 3 blocks produced.
            break;
          }
        }
      } catch (e) {
        console.error((e && e.message) || e);
      }

      // Wait a bit and try again.
      await new Promise(resolve =>
        setTimeout(resolve, RETRY_BLOCKHEIGHT_SECONDS * 1_000),
      );
    }

    // ==============
    // yarn start:contract
    t.is(await yarn(['start:contract']), 0, 'yarn start:contract works');

    // ==============
    // yarn start:ui
    const startUiP = yarn(['start:ui']);
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
        req.setTimeout(SOCKET_TIMEOUT_SECONDS * 1_000);
        req.on('error', err => {
          if (!('code' in err) || err.code !== 'ECONNREFUSED') {
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
