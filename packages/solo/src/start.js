// @ts-check
/* eslint-env node */
import fs from 'fs';
import url from 'url';
import path from 'path';
import temp from 'temp';
import { fork } from 'child_process';
import { promisify } from 'util';
import { resolve as importMetaResolve } from 'import-meta-resolve';
// import { createHash } from 'crypto';

import createRequire from 'esm';

import anylogger from 'anylogger';

// import connect from 'lotion-connect';
// import djson from 'deterministic-json';

import { assert, Fail } from '@endo/errors';
import { makeSlogSender, tryFlushSlogSender } from '@agoric/telemetry';
import {
  loadSwingsetConfigFile,
  buildCommand,
  swingsetIsInitialized,
  initializeSwingset,
  makeSwingsetController,
  buildMailboxStateMap,
  buildMailbox,
  buildPlugin,
  buildTimer,
  exportMailboxData,
  makeEphemeralMailboxStorage,
} from '@agoric/swingset-vat';
import { openSwingStore } from '@agoric/swing-store';
import { makeWithQueue } from '@agoric/internal/src/queue.js';
import { makeShutdown } from '@agoric/internal/src/node/shutdown.js';
import {
  makeDefaultMeterProvider,
  getTelemetryProviders,
  makeSlogCallbacks,
  exportKernelStats,
} from '@agoric/cosmic-swingset/src/kernel-stats.js';

import { deliver, addDeliveryTarget } from './outbound.js';
// import { connectToPipe } from './pipe.js';
import { makeHTTPListener } from './web.js';

import { connectToChain } from './chain-cosmos-sdk.js';

const log = anylogger('start');

// FIXME: Needed for legacy plugins.
const esmRequire = createRequire(/** @type {any} */ ({}));

let swingSetRunning = false;

const fsWrite = promisify(fs.write);
const fsClose = promisify(fs.close);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);

const atomicReplaceFile = async (filename, contents) => {
  const info = await new Promise((resolve, reject) => {
    temp.open(
      {
        dir: path.dirname(filename),
        prefix: `${path.basename(filename)}.`,
      },
      (err, inf) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(inf);
      },
    );
  });
  try {
    // Write the contents, close, and rename.
    await fsWrite(info.fd, contents);
    await fsClose(info.fd);
    await rename(info.path, filename);
  } catch (e) {
    // Unlink on error.
    try {
      await unlink(info.path);
    } catch (e2) {
      // do nothing, we're already failing
    }
    throw e;
  }
};

const neverStop = () => {
  return harden({
    emptyCrank: () => true,
    vatCreated: () => true,
    crankComplete: () => true,
    crankFailed: () => true,
  });
};

const TELEMETRY_SERVICE_NAME = 'solo';
const buildSwingset = async (
  kernelStateDBDir,
  mailboxStateFile,
  argv,
  broadcast,
  defaultManagerType,
) => {
  const initialMailboxState = JSON.parse(
    fs.readFileSync(mailboxStateFile, 'utf8'),
  );

  const mailboxStorage = makeEphemeralMailboxStorage(initialMailboxState);
  const mbs = buildMailboxStateMap(mailboxStorage);
  const mb = buildMailbox(mbs);
  const cm = buildCommand(broadcast);
  const timer = buildTimer();
  const withInputQueue = makeWithQueue();
  const queueThunkForKernel = withInputQueue(async thunk => {
    thunk();
    await processKernel();
  });

  const pluginDir = path.resolve('./plugins');
  fs.mkdirSync(pluginDir, { recursive: true });
  const pluginsPrefix = `${pluginDir}${path.sep}`;
  const importPlugin = async mod => {
    // Ensure they can't traverse out of the plugins prefix.
    const pluginFile = path.resolve(pluginsPrefix, mod);
    pluginFile.startsWith(pluginsPrefix) ||
      Fail`Cannot load ${pluginFile} plugin; outside of ${pluginDir}`;

    // TODO: Detect the module type and use the appropriate loader, just like
    // `agoric deploy`.
    return esmRequire(pluginFile);
  };

  const plugin = buildPlugin(pluginDir, importPlugin, queueThunkForKernel);

  const config = await loadSwingsetConfigFile(
    url.fileURLToPath(new URL('../solo-config.json', import.meta.url)),
  );
  assert(config);
  config.devices = {
    mailbox: {
      sourceSpec: mb.srcPath,
    },
    command: {
      sourceSpec: cm.srcPath,
    },
    timer: {
      sourceSpec: timer.srcPath,
    },
    plugin: {
      sourceSpec: plugin.srcPath,
    },
  };
  const deviceEndowments = {
    mailbox: { ...mb.endowments },
    command: { ...cm.endowments },
    timer: { ...timer.endowments },
    plugin: { ...plugin.endowments },
  };

  const soloEnv = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k]) => k.match(/^SOLO_/)) // narrow to SOLO_ prefixes. e.g. SOLO_SLOGFILE
      .map(([k, v]) => [k.replace(/^SOLO_/, ''), v]), // Replace SOLO_ controls with chain version.
  );
  const env = {
    ...process.env,
    ...soloEnv,
  };
  const { metricsProvider = makeDefaultMeterProvider() } =
    getTelemetryProviders({
      console,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

  const { SWING_STORE_TRACE, XSNAP_KEEP_SNAPSHOTS } = env;

  const defaultTraceFile = path.resolve(kernelStateDBDir, 'store-trace.log');
  let swingStoreTraceFile;
  switch (SWING_STORE_TRACE) {
    case '0':
    case 'false':
      break;
    case '1':
    case 'true':
      swingStoreTraceFile = defaultTraceFile;
      break;
    default:
      if (SWING_STORE_TRACE) {
        swingStoreTraceFile = path.resolve(SWING_STORE_TRACE);
      }
  }

  const keepSnapshots =
    XSNAP_KEEP_SNAPSHOTS === '1' || XSNAP_KEEP_SNAPSHOTS === 'true';

  const { kernelStorage, hostStorage } = openSwingStore(kernelStateDBDir, {
    traceFile: swingStoreTraceFile,
    keepSnapshots,
  });

  // Not to be confused with the gas model, this meter is for OpenTelemetry.
  const metricMeter = metricsProvider.getMeter('ag-solo');
  const slogCallbacks = makeSlogCallbacks({
    metricMeter,
  });

  if (!swingsetIsInitialized(kernelStorage)) {
    if (defaultManagerType && !config.defaultManagerType) {
      config.defaultManagerType = defaultManagerType;
    }
    await initializeSwingset(config, argv, kernelStorage);
  }
  const slogSender = await makeSlogSender({
    stateDir: kernelStateDBDir,
    serviceName: TELEMETRY_SERVICE_NAME,
    env,
  });
  const controller = await makeSwingsetController(
    kernelStorage,
    deviceEndowments,
    { env, slogCallbacks, slogSender },
  );

  const { crankScheduler } = exportKernelStats({
    controller,
    metricMeter,
    log: console,
  });

  async function saveState() {
    const ms = JSON.stringify(exportMailboxData(mailboxStorage));
    await atomicReplaceFile(mailboxStateFile, ms);
    await hostStorage.commit();
  }

  function deliverOutbound() {
    deliver(mailboxStorage);
  }

  const policy = neverStop();

  async function processKernel() {
    await crankScheduler(policy);
    if (!swingSetRunning) {
      return;
    }
    await saveState();
    deliverOutbound();
    await tryFlushSlogSender(slogSender, { env, log: console.warn });
  }

  // Use the input queue to make sure it doesn't overlap with
  // other inbound messages.
  const queuedDeliverInboundToMbx = withInputQueue(
    async function deliverInboundToMbx(sender, messages, ack) {
      Array.isArray(messages) || Fail`inbound given non-Array: ${messages}`;
      // console.debug(`deliverInboundToMbx`, messages, ack);
      await null;
      if (mb.deliverInbound(sender, messages, ack)) {
        await processKernel();
      }
    },
  );

  // Use the input queue to make sure it doesn't overlap with
  // other inbound messages.
  const queuedBoxedDeliverInboundCommand = withInputQueue(
    async function deliverInboundCommand(obj) {
      // this promise could take an arbitrarily long time to resolve, so don't
      // wait on it
      const p = cm.inboundCommand(obj);

      // Register a handler in this turn so that we don't get complaints about
      // asynchronously-handled callbacks.
      p.catch(_ => {});

      // The turn passes...
      await processKernel();

      // We box the promise, so that this queue isn't stalled.
      // The queue protects the above cm.inboundCommand and
      // processKernel calls.
      //
      // The promise to the box is resolved as the return value of
      // this function (which releases the input queue shortly after
      // the processKernel call has completed).
      //
      // The caller can determine if they want to wait for the
      // unboxed promise (which represents the results of the inbound
      // command), which may not ever resolve.
      return [
        p.catch(e => {
          // Rethrow any inboundCommand rejection in the new turn so that our
          // caller must handle it (or be an unhandledRejection).
          throw e;
        }),
      ];
    },
  );

  // Our typical user will always want to wait for the results of
  // the boxed promise, so by default, extract it and await it.
  const queuedDeliverInboundCommand = async obj =>
    queuedBoxedDeliverInboundCommand(obj).then(async ([p]) => p);

  let intervalMillis;

  // Use the input queue to make sure it doesn't overlap with
  // other inbound messages.
  const queuedMoveTimeForward = withInputQueue(
    async function moveTimeForward() {
      const now = Date.now();
      await null;
      try {
        if (timer.poll(now)) {
          await processKernel();
          log.debug(`timer-provoked kernel crank complete ${now}`);
        }
      } catch (err) {
        log.error(`timer-provoked kernel crank failed at ${now}:`, err);
      } finally {
        // We only rearm the timeout if moveTimeForward has completed, to
        // make sure we don't have two copies of controller.run() executing
        // at the same time.
        setTimeout(queuedMoveTimeForward, intervalMillis);
      }
    },
  );

  // now let the bootstrap functions run
  await processKernel();

  const { validateAndInstallBundle } = controller;

  return {
    deliverInboundToMbx: queuedDeliverInboundToMbx,
    deliverInboundCommand: queuedDeliverInboundCommand,
    deliverOutbound,
    startTimer: interval => {
      intervalMillis = interval;
      setTimeout(queuedMoveTimeForward, intervalMillis);
    },
    resetOutdatedState: withInputQueue(async () => {
      plugin.reset();
      return processKernel();
    }),
    validateAndInstallBundle,
  };
};

const deployWallet = async ({ agWallet, deploys, hostport }) => {
  if (!hostport || !deploys.length) {
    return;
  }

  // This part only runs if there were wallet deploys to do.
  const resolvedDeploys = deploys.map(dep => path.resolve(agWallet, dep));

  const resolvedUrl = await importMetaResolve(
    'agoric/src/entrypoint.js',
    import.meta.url,
  );
  const agoricCli = new URL(resolvedUrl).pathname;

  // Use the same verbosity as our caller did for us.
  let verbosity;
  const DEBUG_LIST = (process.env.DEBUG || '').split(',');
  if (
    DEBUG_LIST.find(selector => ['agoric:debug', 'agoric'].includes(selector))
  ) {
    verbosity = ['-vv'];
  } else if (DEBUG_LIST.includes('agoric:info') || process.env.DEBUG === '') {
    verbosity = [];
  } else {
    verbosity = ['-v'];
  }

  // Launch the agoric wallet deploys (if any).  The assumption is that the CLI
  // runs correctly under the same version of the JS engine we're currently
  // using.

  // We turn off NODE_OPTIONS in case the user is debugging.
  const { NODE_OPTIONS: _ignore, ...noOptionsEnv } = process.env;
  const cp = fork(
    agoricCli,
    [
      `deploy`,
      ...verbosity,
      `--provide=wallet`,
      `--hostport=${hostport}`,
      ...resolvedDeploys,
    ],
    { stdio: 'inherit', env: noOptionsEnv },
  );
  const { registerShutdown } = makeShutdown();
  const unregisterShutdown = registerShutdown(() => cp.kill('SIGTERM'));
  cp.on('close', () => unregisterShutdown());
};

const start = async (basedir, argv) => {
  const mailboxStateFile = path.resolve(
    basedir,
    'swingset-kernel-mailbox.json',
  );

  // Where necessary, add the solo's working directory to each connection
  // described in its connections.json, such that they have enough information
  // for a deploy script to pass along to publishBundle.
  const rawConnectionsPath = path.join(basedir, 'connections.json');
  const rawConnections = JSON.parse(
    fs.readFileSync(rawConnectionsPath, 'utf8'),
  );
  Array.isArray(rawConnections) ||
    Fail`Invalid connections.json: must be a JSON array, at ${rawConnectionsPath}`;
  const homeDirectory = process.cwd();
  const connections = rawConnections.map(connection => {
    if (['chain-cosmos-sdk', 'fake-chain'].includes(connection.type)) {
      return { ...connection, homeDirectory };
    }
    return connection;
  });

  let broadcastJSON;
  function broadcast(obj) {
    if (broadcastJSON) {
      broadcastJSON(obj);
    } else {
      log.error(`Called broadcast before HTTP listener connected.`);
    }
  }

  const { wallet, defaultManagerType } = JSON.parse(
    fs.readFileSync('options.json', 'utf-8'),
  );

  const stateDBDir = path.join(basedir, 'swingset-kernel-state');

  // FIXME: Replace this functionality with per-connection bootstrap code.
  const getLegacyGCI = () => {
    for (const c of connections) {
      switch (c.type) {
        case 'chain-cosmos-sdk':
        case 'fake-chain':
          return { FIXME_GCI: c.GCI };
        default:
      }
    }
    return undefined;
  };

  const d = await buildSwingset(
    stateDBDir,
    mailboxStateFile,
    { ...getLegacyGCI(), ...argv },
    broadcast,
    defaultManagerType,
  );

  const {
    deliverInboundToMbx,
    deliverInboundCommand,
    deliverOutbound,
    startTimer,
    resetOutdatedState,
    validateAndInstallBundle,
  } = d;

  // Start timer here!
  startTimer(800);
  await resetOutdatedState();

  // Remove wallet traces.
  await unlink('html/wallet').catch(_ => {});

  const packageUrl = await importMetaResolve(
    `${wallet}/package.json`,
    import.meta.url,
  );
  // Find the wallet.
  const pjs = new URL(packageUrl).pathname;
  const { 'agoric-wallet': { htmlBasedir = 'ui/build', deploy = [] } = {} } =
    JSON.parse(fs.readFileSync(pjs, 'utf-8'));

  const htmlBasePath = String(htmlBasedir).replace(
    /^\.\.\/\.\.\/node_modules\//,
    '',
  );

  const agWallet = path.dirname(pjs);
  const agWalletHtmlUrl = await importMetaResolve(htmlBasePath, packageUrl);
  const agWalletHtml = new URL(agWalletHtmlUrl).pathname;

  let hostport;
  await Promise.all(
    connections.map(async c => {
      await null;
      switch (c.type) {
        case 'chain-cosmos-sdk':
          {
            log(`adding follower/sender for GCI ${c.GCI}`);
            // c.rpcAddresses are strings of host:port for the RPC ports of several
            // chain nodes
            const deliverator = await connectToChain(
              basedir,
              c.GCI,
              c.rpcAddresses,
              c.myAddr,
              deliverInboundToMbx,
              c.chainID,
            );
            addDeliveryTarget(c.GCI, deliverator);
          }
          break;
        case 'http': {
          log(`adding HTTP/WS listener on ${c.host}:${c.port}`);
          !broadcastJSON || Fail`duplicate type=http in connections.json`;
          hostport = `${c.host}:${c.port}`;
          broadcastJSON = await makeHTTPListener(
            basedir,
            c.port,
            c.host,
            deliverInboundCommand,
            agWalletHtml,
            validateAndInstallBundle,
            connections,
          );
          break;
        }
        default: {
          Fail`unknown connection type in ${c}`;
        }
      }
    }),
  );

  log.info(`swingset running`);
  swingSetRunning = true;
  deliverOutbound();

  const deploys = typeof deploy === 'string' ? [deploy] : deploy;
  await deployWallet({ agWallet, deploys, hostport });

  const whenHellFreezesOver = new Promise(() => {});
  return whenHellFreezesOver;
};

export default start;
