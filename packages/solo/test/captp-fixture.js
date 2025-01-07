/* eslint-env node */
import { spawn } from 'child_process';
import WebSocket from 'ws';
import { makeCapTP, E } from '@endo/captp';

import { getAccessToken } from '@agoric/access-token';

// Ensure we're all using the same HandledPromise.
export { E };

export async function makeFixture(PORT, noisy = false) {
  const accessToken = await getAccessToken(PORT);

  let expectedToExit = false;
  let buf = '';
  const stdio = noisy
    ? ['ignore', 'inherit', 'inherit']
    : ['ignore', 'pipe', 'pipe'];
  const cp = spawn('./startsolo.sh', {
    env: { ...process.env, PORT },
    cwd: new URL('./', import.meta.url).pathname,
    stdio,
    detached: true,
  });

  if (!noisy) {
    cp.stdout.on('data', chunk => (buf += chunk.toString('utf-8')));
    cp.stderr.on('data', chunk => {
      const msg = chunk.toString('utf-8');
      if (!msg.match(/^make: \*\*\*.*99/)) {
        // Write chunks that don't describe the exit status.
        process.stderr.write(chunk);
      }
    });
  }

  /** @type {WebSocket} */
  let ws;
  async function connect() {
    process.stdout.write('# connecting');
    async function tryConnect(resolve, reject) {
      process.stdout.write('.');

      /** @type {() => void} */
      let abortCapTP;
      ws = new WebSocket(
        `ws://127.0.0.1:${PORT}/private/captp?accessToken=${accessToken}`,
        {
          origin: `http://localhost:${PORT}`,
        },
      );
      ws.on('open', async () => {
        // Create a CapTP connection.
        const { abort, dispatch, getBootstrap } = makeCapTP(
          'test fixture',
          obj => ws.send(JSON.stringify(obj)),
        );
        abortCapTP = abort;
        ws.on('message', data => {
          dispatch(JSON.parse(data));
        });
        const bootP = getBootstrap();
        // Wait until the chain bundle is loaded, then take a new copy
        // since the chain objects have been added to bootstrap.
        let lastUpdateCount;
        for (;;) {
          process.stdout.write('o');
          const update = await E(E.get(bootP).loadingNotifier).getUpdateSince(
            lastUpdateCount,
          );
          if (
            !update.value.find(subsys => ['agoric', 'wallet'].includes(subsys))
          ) {
            // We didn't find the wallet or agoric waiting.
            break;
          }

          // Still need to wait.
          lastUpdateCount = update.updateCount;
        }

        process.stdout.write('\n');
        resolve(getBootstrap());
      });
      ws.on('error', () => {
        if (abortCapTP) {
          abortCapTP();
          abortCapTP = undefined;
        } else {
          // We didn't connect yet, so retry.
          setTimeout(tryConnect, 1000, resolve, reject);
        }
      });
      ws.on('close', () => {
        if (abortCapTP) {
          abortCapTP();
        }
        ws = undefined;
      });
    }

    return new Promise((resolve, reject) => {
      cp.addListener('exit', code => {
        if (!expectedToExit) {
          // Display all our output.
          console.log(buf);
        }
        // We only reject if the child exits before CapTP is established.
        reject(Error(`CapTP fixture exited with ${code}`));
      });
      void tryConnect(resolve, reject);
    });
  }

  function kill() {
    // Try closing the WebSocket.
    expectedToExit = true;
    if (ws && ws.readyState === ws.OPEN) {
      ws.close();
    }
    // Don't kill on exit anymore, as we're doing it now.
    process.off('exit', kill);
    // console.log('killing!');
    process.kill(-cp.pid, 'SIGTERM');
  }

  process.on('exit', kill);
  process.on('SIGINT', kill);
  process.on('SIGTERM', kill);
  return { homeP: connect(), kill };
}
