// @ts-check
/* eslint-env node */

import { X } from '@endo/errors';
import { makePromiseKit } from '@endo/promise-kit';
import { E, makeCapTP } from '@endo/captp';
import { makeLeaderFromRpcAddresses } from '@agoric/casting';
import path from 'path';
import http from 'http';
import inquirer from 'inquirer';
import { SigningStargateClient } from '@cosmjs/stargate';
import { whileTrue } from '@agoric/internal';

import { getAccessToken } from '@agoric/access-token';

import {
  makeBundlePublisher,
  makeCosmosBundlePublisher,
  makeHttpBundlePublisher,
} from './publish.js';
import { makeJsonHttpClient } from './json-http-client-node.js';
import { makeScriptLoader } from './scripts.js';

// note: CapTP has its own HandledPromise instantiation, and the contract
// must use the same one that CapTP uses. We achieve this by not bundling
// captp, and doing a (non-isolated) dynamic import of the deploy script
// below, so everything uses the same module table. The eventual-send that
// our captp uses will the same as the one the deploy script imports, so
// they'll get identical HandledPromise objects.

// TODO: clean this up: neither captp nor eventual-send will export
// HandledPromise, eventual-send should behave a shims, whoever imports it
// first will cause HandledPromise to be added to globalThis. And actually
// HandledPromise will go away in favor of globalThis.Promise.delegate

const RETRY_DELAY_MS = 1000;

const getPort = u =>
  u.port || (['https:', 'wss:'].includes(u.protocol) ? '443' : '80');

const connectAndRun = async (
  wsurl,
  main,
  { need, provide },
  { makeWebSocket, now, console },
) => {
  let connected = false;
  let progressDot = '.';
  const exit = makePromiseKit();
  let progressTimer = null;

  const sendJSON = (ws, obj) => {
    if (ws.readyState !== ws.OPEN) {
      return;
    }
    const body = JSON.stringify(obj);
    console.debug('sendJSON', body.slice(0, 200));
    ws.send(body);
  };

  const retryWebsocket = async () => {
    if (!progressTimer) {
      process.stdout.write(`Open CapTP connection to ${wsurl}...`);
      progressDot = '.';
      progressTimer = setInterval(
        () => process.stdout.write(progressDot),
        1000,
      );
    }

    const accessToken = await getAccessToken(
      `${wsurl.hostname}:${getPort(wsurl)}`,
    );

    // For a WebSocket we need to put the token in the query string.
    assert.typeof(accessToken, 'string');
    const wsWebkey = `${wsurl}?accessToken=${encodeURIComponent(accessToken)}`;

    const ws = makeWebSocket(wsWebkey, { origin: wsurl.origin });
    ws.on('open', () => {
      const tryOnOpen = async () => {
        connected = true;
        console.debug('Connected to CapTP!');
        // Help disambiguate connections.
        const epoch = now();
        const { dispatch, getBootstrap } = makeCapTP(
          'bundle',
          obj => sendJSON(ws, obj),
          undefined,
          {
            epoch,
          },
        );
        ws.on('message', data => {
          try {
            const obj = JSON.parse(data);
            console.debug('receiving', data.slice(0, 200));
            if (obj.type === 'CTP_ERROR') {
              throw obj.error;
            }
            dispatch(obj);
          } catch (e) {
            console.error('server error processing message', data, e);
            exit.reject(e);
          }
        });

        // Wait for the chain to become ready.
        let bootP = getBootstrap();
        let lastUpdateCount;
        let stillLoading = [...need].sort();
        progressDot = 'o';
        for await (const _ of whileTrue(() => stillLoading.length)) {
          // Wait for the notifier to report a new state.
          process.stdout.write(progressDot);
          console.debug('need:', stillLoading.join(', '));
          const update = await E(E.get(bootP).loadingNotifier).getUpdateSince(
            lastUpdateCount,
          );
          lastUpdateCount = update.updateCount;

          // Skip the deploy if our provides are not needed.
          let needsProvide = !provide.length;
          const notNeeded = [];
          for (const dep of provide) {
            if (update.value.includes(dep)) {
              needsProvide = true;
            } else {
              notNeeded.push(dep);
            }
          }
          if (!needsProvide) {
            console.info(`Don't need our provides: ${notNeeded.join(', ')}`);
            exit.resolve(0);
            return;
          }

          const nextLoading = [];
          for (const dep of stillLoading) {
            if (update.value.includes(dep)) {
              // A dependency is still loading.
              nextLoading.push(dep);
            }
          }
          stillLoading = nextLoading;
        }

        clearInterval(progressTimer);
        process.stdout.write('\n');
        console.debug(JSON.stringify(need), 'loaded');
        // Take a new copy, since the chain objects have been added to bootstrap.
        bootP = getBootstrap();

        await main({ home: bootP });

        const doneLoading = async () => {
          if (!provide.length) {
            return;
          }
          console.debug('provide:', provide.join(', '));
          await E(E.get(E.get(bootP).local).http).doneLoading(provide);
        };
        await doneLoading();

        console.debug('Done!');
        ws.close();
        exit.resolve(0);
      };
      tryOnOpen().catch(e => {
        exit.reject(e);
        ws.close();
      });
    });
    ws.on('close', (_code, _reason) => {
      console.debug('connection closed');
      if (connected) {
        exit.resolve(1);
      }
    });
    ws.on('error', e => {
      if (e.code === 'ECONNREFUSED' && !connected) {
        // Retry in a little bit.
        setTimeout(
          async () => retryWebsocket().catch(exit.reject),
          RETRY_DELAY_MS,
        );
        return;
      }
      exit.reject(e);
    });
  };
  // Start the retry process.
  return retryWebsocket().then(async () => exit.promise);
};

export default async function deployMain(progname, rawArgs, powers, opts) {
  const { anylogger, now, fs } = powers;
  const console = anylogger('agoric:deploy');

  const allowUnsafePlugins = opts.allowUnsafePlugins;
  const promptForUnsafePlugins = async () => {
    if (!allowUnsafePlugins) {
      return;
    }
    const { yesReally } = await inquirer.prompt([
      {
        name: 'yesReally',
        message: `Enable unsafe (unconfined) plugins for this deployment?  Type 'yes' if you are sure:`,
        default: 'no',
      },
    ]);
    if (yesReally !== 'yes') {
      console.error(
        `Aborting (if you wish to continue unsafely, you must type 'yes' exactly)!`,
      );
      process.exit(1);
    }
  };
  await promptForUnsafePlugins();

  const scripts = rawArgs.slice(1);
  const provide = opts.provide
    .split(',')
    .map(dep => dep.trim())
    .filter(dep => dep)
    .sort();

  const sdkPrefixes = {};
  if (!opts.sdk) {
    // TODO importMetaResolve should be more reliable.
    const agoricPrefix = path.resolve(`node_modules/@agoric`);
    sdkPrefixes.goPfx = agoricPrefix;
    sdkPrefixes.jsPfx = agoricPrefix;
  }

  const need = opts.need
    .split(',')
    .map(dep => dep.trim())
    .filter(dep => dep && !provide.includes(dep))
    .sort();

  const match = opts.hostport.match(/^(.*):(\d+)$/);
  const host = match ? match[1] : 'localhost';
  const port = match ? match[2] : '8000';

  const wsurl = opts.hostport.includes('//')
    ? new URL(opts.hostport, 'ws://localhost:8000')
    : new URL(`ws://${host}:${port}`);

  assert.equal(wsurl.pathname, '/', X`${opts.hostport} cannot contain a path`);
  wsurl.pathname = '/private/captp';

  const jsonHttpCall = makeJsonHttpClient({ http });

  const listConnections = async () => {
    const accessToken = await getAccessToken(
      `${wsurl.hostname}:${getPort(wsurl)}`,
    );

    const { ok, connections } = await jsonHttpCall({
      hostname: host,
      port,
      method: 'GET',
      path: `/connections?accessToken=${encodeURIComponent(accessToken)}`,
    });
    assert(
      ok === true,
      `Expected JSON body "ok" property to be true for HTTP request for chain connections`,
    );
    return connections;
  };

  const getDefaultConnection = async () => {
    let connections = await listConnections();

    const filterOptions = {
      __proto__: null,
      local: ['http'],
      sim: ['fake-chain'],
      cosmos: ['chain-cosmos-sdk'],
    };
    const defaultFilter = [...filterOptions.sim, ...filterOptions.cosmos];
    filterOptions.agoric = defaultFilter;

    let filterChoice = defaultFilter;
    if (opts.target !== undefined) {
      filterChoice = filterOptions[opts.target];
      assert(
        filterChoice !== undefined,
        `Invalid --target ${opts.target}, must be one of agoric, cosmos, sim, or local`,
      );
    }

    connections = connections.filter(({ type }) => filterChoice.includes(type));

    assert(
      connections.length > 0,
      `Cannot find any chain connections in local solo.`,
    );
    if (connections.length === 1) {
      return connections[0];
    }
    assert(
      process.stdin.isTTY,
      `Multiple connection options. Please use the --target flag or an interactive terminal.`,
    );
    console.log('\nConnection options:');
    const lookup = new Map(
      connections.map((connection, index) => {
        console.log(`${index + 1}.`, connection);
        return [`${index + 1}`, connection];
      }),
    );
    const { connectionNumber } = await inquirer.prompt({
      name: 'connectionNumber',
      message: 'Please choose a connection to publish to',
      choices: [...lookup.keys()],
    });
    const connection = lookup.get(connectionNumber);
    console.log({ connection });
    return connection;
  };

  const publishBundleCosmos = makeCosmosBundlePublisher({
    connectWithSigner: SigningStargateClient.connectWithSigner,
    pathResolve: path.resolve,
    readFile: fs.readFile,
    random: Math.random,
  });
  const publishBundleHttp = makeHttpBundlePublisher({
    getAccessToken,
    jsonHttpCall,
  });
  const publishBundle = makeBundlePublisher({
    getDefaultConnection,
    publishBundleCosmos,
    publishBundleHttp,
  });

  let cachedLeader;
  const makeDefaultLeader = async leaderOptions => {
    if (cachedLeader) {
      return cachedLeader;
    }
    const conn = await getDefaultConnection();
    const { type, rpcAddresses } = conn;
    assert.equal(
      type,
      'chain-cosmos-sdk',
      X`${type} doesn't support casting followers`,
    );
    cachedLeader = makeLeaderFromRpcAddresses(rpcAddresses, leaderOptions);
    return cachedLeader;
  };

  const endowments = {
    now,
    makeDefaultLeader,
    publishBundle,
    listConnections,
  };
  if (opts.scriptArgs) {
    endowments.scriptArgs = opts.scriptArgs;
  }
  const runScripts = makeScriptLoader(
    scripts,
    { allowUnsafePlugins, progname, rawArgs, endowments },
    { fs, console },
  );

  return connectAndRun(
    wsurl,
    runScripts,
    { need, provide },
    {
      makeWebSocket: powers.makeWebSocket,
      console,
      now,
    },
  );
}
