import path from 'path';
import fs from 'fs';
import process from 'process';
import repl from 'repl';
import util from 'util';

import { makeStatLogger } from '@agoric/stat-logger';
import {
  loadSwingsetConfigFile,
  loadBasedir,
  initializeSwingset,
  makeSwingsetController,
} from '@agoric/swingset-vat';
import { buildLoopbox } from '@agoric/swingset-vat/src/devices/loopbox/loopbox.js';
import engineGC from '@agoric/swingset-vat/src/lib-nodejs/engine-gc.js';

import { initSwingStore, openSwingStore } from '@agoric/swing-store';

import { dumpStore } from './dumpstore.js';
import { auditRefCounts } from './auditstore.js';
import {
  organizeBenchmarkStats,
  printBenchmarkStats,
  organizeMainStats,
  printMainStats,
  outputStats,
} from './printStats.js';

const log = console.log;

function p(item) {
  return util.inspect(item, false, null, true);
}

function readClock() {
  return process.hrtime.bigint();
}

function usage() {
  log(`
Command line:
  runner [FLAGS...] CMD [{BASEDIR|--} [ARGS...]]

FLAGS may be:
  --init           - discard any existing saved state at startup
  --initonly       - initialize the swingset but exit without running it
  --lmdb           - runs using LMDB as the data store (default)
  --memdb          - runs using the non-persistent in-memory data store
  --usexs          - run vats using the the XS engine
  --dbdir DIR      - specify where the data store should go (default BASEDIR)
  --dbsize SIZE    - set the LMDB size limit to SIZE megabytes (default 2GB)
  --blockmode      - run in block mode (checkpoint every BLOCKSIZE blocks)
  --blocksize N    - set BLOCKSIZE to N cranks (default 200)
  --logtimes       - log block execution time stats while running
  --logmem         - log memory usage stats after each block
  --logdisk        - log disk space usage stats after each block
  --logstats       - log kernel stats after each block
  --logall         - log kernel stats, block times, memory use, and disk space
  --logtag STR     - tag for stats log file (default "runner")
  --slog FILE      - write swingset log to FILE
  --forcegc        - run garbage collector after each block
  --batchsize N    - set BATCHSIZE to N cranks (default 200)
  --verbose        - output verbose debugging messages as it runs
  --audit          - audit kernel promise reference counts after each crank
  --dump           - dump a kernel state store snapshot after each crank
  --dumpdir DIR    - place kernel state dumps in directory DIR (default ".")
  --dumptag STR    - prefix kernel state dump filenames with STR (default "t")
  --raw            - perform kernel state dumps in raw mode
  --stats          - print a performance stats report at the end of a run
  --statsfile FILE - output performance stats to FILE as a JSON object
  --benchmark N    - perform an N round benchmark after the initial run
  --indirect       - launch swingset from a vat instead of launching directly
  --config FILE    - read swingset config from FILE instead of inferring it

CMD is one of:
  help   - print this helpful usage information
  run    - launches or resumes the configured vats, which run to completion.
  batch  - launch or resume, then run BATCHSIZE cranks or until completion
  step   - steps the configured swingset one crank.
  shell  - starts a simple CLI allowing the swingset to be run or stepped or
           interrogated interactively.

BASEDIR is the base directory for locating the swingset's vat definitions.
  If BASEDIR is omitted or '--' it defaults to the current working directory.

Any remaining args are passed to the swingset's bootstrap vat.
`);
}

function fail(message, printUsage) {
  log(message);
  if (printUsage) {
    usage();
  }
  process.exit(1);
}

function generateIndirectConfig(baseConfig) {
  const config = {
    bootstrap: 'launcher',
    bundles: {},
    vats: {
      launcher: {
        sourceSpec: new URL('vat-launcher.js', import.meta.url).pathname,
        parameters: {
          config: {
            bootstrap: baseConfig.bootstrap,
            vats: {},
          },
        },
      },
    },
  };
  if (baseConfig.vats) {
    for (const vatName of Object.keys(baseConfig.vats)) {
      const baseVat = { ...baseConfig.vats[vatName] };
      let newBundleName = `bundle-${vatName}`;
      if (baseVat.sourceSpec) {
        config.bundles[newBundleName] = { sourceSpec: baseVat.sourceSpec };
        delete baseVat.sourceSpec;
      } else if (baseVat.bundleSpec) {
        config.bundles[newBundleName] = { bundleSpec: baseVat.bundleSpec };
        delete baseVat.bundleSpec;
      } else if (baseVat.bundle) {
        config.bundles[newBundleName] = { bundle: baseVat.bundle };
        delete baseVat.bundle;
      } else if (baseVat.bundleName) {
        newBundleName = baseVat.bundleName;
        config.bundles[newBundleName] = baseConfig.bundles[baseVat.bundleName];
      } else {
        fail(`this can't happen`);
      }
      baseVat.bundleName = newBundleName;
      config.vats.launcher.parameters.config.vats[vatName] = baseVat;
    }
  }
  if (baseConfig.bundles) {
    for (const bundleName of Object.keys(baseConfig.bundles)) {
      config.bundles[bundleName] = baseConfig.bundles[bundleName];
    }
  }
  return config;
}

/* eslint-disable no-use-before-define */

/** Command line utility to run a swingset for development and testing purposes. */
export async function main() {
  const argv = process.argv.slice(2);

  let forceReset = false;
  let dbMode = '--lmdb';
  let blockSize = 200;
  let batchSize = 200;
  let blockMode = false;
  let logTimes = false;
  let logMem = false;
  let logDisk = false;
  let logStats = false;
  let logTag = 'runner';
  let slogFile = null;
  let forceGC = false;
  let verbose = false;
  let doDumps = false;
  let doAudits = false;
  let dumpDir = '.';
  let dumpTag = 't';
  let rawMode = false;
  let shouldPrintStats = false;
  let launchIndirectly = false;
  let benchmarkRounds = 0;
  let configPath = null;
  let statsFile = null;
  let dbDir = null;
  let dbSize = 0;
  let initOnly = false;
  let useXS = false;

  while (argv[0] && argv[0].startsWith('-')) {
    const flag = argv.shift();
    switch (flag) {
      case '--init':
        forceReset = true;
        break;
      case '--noinit':
        forceReset = false;
        break;
      case '--initonly':
        forceReset = true;
        initOnly = true;
        break;
      case '--logtimes':
        logTimes = true;
        break;
      case '--logmem':
        logMem = true;
        break;
      case '--logdisk':
        logDisk = true;
        break;
      case '--logstats':
        logStats = true;
        break;
      case '--logall':
        logTimes = true;
        logMem = true;
        logDisk = true;
        logStats = true;
        break;
      case '--logtag':
        logTag = argv.shift();
        break;
      case '--slog':
        slogFile = argv.shift();
        break;
      case '--config':
        configPath = argv.shift();
        break;
      case '--forcegc':
        forceGC = true;
        break;
      case '--blockmode':
        blockMode = true;
        break;
      case '--blocksize':
        blockSize = Number(argv.shift());
        break;
      case '--batchsize':
        batchSize = Number(argv.shift());
        break;
      case '--benchmark':
        benchmarkRounds = Number(argv.shift());
        break;
      case '--dump':
        doDumps = true;
        break;
      case '--dumpdir':
        dumpDir = argv.shift();
        doDumps = true;
        break;
      case '--dumptag':
        dumpTag = argv.shift();
        doDumps = true;
        break;
      case '--dbdir':
        dbDir = argv.shift();
        break;
      case '--dbsize':
        dbSize = Number(argv.shift());
        break;
      case '--raw':
        rawMode = true;
        doDumps = true;
        break;
      case '--stats':
        shouldPrintStats = true;
        break;
      case '--statsfile':
        statsFile = argv.shift();
        break;
      case '--indirect':
        launchIndirectly = true;
        break;
      case '--audit':
        doAudits = true;
        break;
      case '--memdb':
      case '--lmdb':
        dbMode = flag;
        break;
      case '--usexs':
      case '--useXS':
        useXS = true;
        break;
      case '-v':
      case '--verbose':
        verbose = true;
        break;
      default:
        fail(`invalid flag ${flag}`, true);
    }
  }

  const command = argv.shift();
  if (
    command !== 'run' &&
    command !== 'shell' &&
    command !== 'step' &&
    command !== 'batch' &&
    command !== 'help'
  ) {
    fail(`'${command}' is not a valid runner command`, true);
  }
  if (command === 'help') {
    usage();
    process.exit(0);
  }

  if (forceGC) {
    if (!logMem) {
      log('Warning: --forcegc without --logmem may be a mistake');
    }
  }

  // Prettier demands that the conditional not be parenthesized.  Prettier is wrong.
  // prettier-ignore
  let basedir = (argv[0] === '--' || argv[0] === undefined) ? '.' : argv.shift();
  const bootstrapArgv = argv[0] === '--' ? argv.slice(1) : argv;

  let config;
  if (configPath) {
    config = await loadSwingsetConfigFile(configPath);
    if (config === null) {
      fail(`config file ${configPath} not found`);
    }
    basedir = path.dirname(configPath);
  } else {
    config = loadBasedir(basedir);
  }
  const deviceEndowments = {};
  if (config.loopboxSenders) {
    const { loopboxSrcPath, loopboxEndowments } = buildLoopbox('immediate');
    config.devices = {
      loopbox: {
        sourceSpec: loopboxSrcPath,
        parameters: {
          senders: config.loopboxSenders,
        },
      },
    };
    delete config.loopboxSenders;
    deviceEndowments.loopbox = { ...loopboxEndowments };
  }
  if (useXS) {
    config.defaultManagerType = 'xs-worker';
  } else {
    config.defaultManagerType = 'local';
  }
  if (launchIndirectly) {
    config = generateIndirectConfig(config);
  }

  let swingStore;
  switch (dbMode) {
    case '--memdb':
      if (dbDir) {
        fail('--dbdir only valid with --lmdb');
      }
      if (dbSize) {
        fail('--dbsize only valid with --lmdb');
      }
      swingStore = initSwingStore(null);
      break;
    case '--lmdb': {
      if (!dbDir) {
        dbDir = basedir;
      }
      const kernelStateDBDir = path.join(dbDir, 'swingset-kernel-state');
      const dbOptions = {};
      if (dbSize) {
        dbOptions.mapSize = dbSize * 1024 * 1024;
      }
      if (forceReset) {
        swingStore = initSwingStore(kernelStateDBDir, dbOptions);
      } else {
        swingStore = openSwingStore(kernelStateDBDir, dbOptions);
      }
      break;
    }
    default:
      fail(`invalid database mode ${dbMode}`, true);
  }
  const runtimeOptions = {};
  if (verbose) {
    runtimeOptions.verbose = true;
  }
  if (slogFile) {
    runtimeOptions.slogFile = slogFile;
    if (forceReset) {
      try {
        fs.unlinkSync(slogFile);
      } catch (e) {
        if (e.code !== 'ENOENT') {
          fail(`${e}`);
        }
      }
    }
  }
  let bootstrapResult;
  const hostStorage = {
    kvStore: swingStore.kvStore,
    streamStore: swingStore.streamStore,
  };
  if (forceReset) {
    bootstrapResult = await initializeSwingset(
      config,
      bootstrapArgv,
      hostStorage,
      { verbose },
      runtimeOptions,
    );
    swingStore.commit();
    if (initOnly) {
      swingStore.close();
      return;
    }
  }
  const controller = await makeSwingsetController(
    hostStorage,
    deviceEndowments,
    runtimeOptions,
  );
  if (benchmarkRounds > 0) {
    // Pin the vat root that will run benchmark rounds so it'll still be there
    // when it comes time to run them.
    controller.pinVatRoot(launchIndirectly ? 'launcher' : 'bootstrap');
  }

  let blockNumber = 0;
  let statLogger = null;
  if (logTimes || logMem || logDisk) {
    let headers = ['block', 'steps'];
    if (logTimes) {
      headers.push('btime', 'ctime');
    }
    if (logMem) {
      headers = headers.concat(['rss', 'heapTotal', 'heapUsed', 'external']);
    }
    if (logDisk) {
      headers.push('disk');
    }
    if (logStats) {
      const statNames = Object.keys(controller.getStats());
      headers = headers.concat(statNames);
    }
    statLogger = makeStatLogger(logTag, headers);
  }

  let mainStats;
  let benchmarkStats;

  let crankNumber = 0;
  switch (command) {
    case 'run': {
      await commandRun(0, blockMode);
      break;
    }
    case 'batch': {
      await commandRun(batchSize, blockMode);
      break;
    }
    case 'step': {
      try {
        const steps = await controller.step();
        swingStore.commit();
        swingStore.close();
        log(`runner stepped ${steps} crank${steps === 1 ? '' : 's'}`);
      } catch (err) {
        kernelFailure(err);
      }
      break;
    }
    case 'shell': {
      const cli = repl.start({
        prompt: 'runner> ',
        replMode: repl.REPL_MODE_STRICT,
      });
      cli.on('exit', () => {
        swingStore.close();
      });
      cli.context.dump2 = () => controller.dump();
      cli.defineCommand('commit', {
        help: 'Commit current kernel state to persistent storage',
        action: () => {
          swingStore.commit();
          log('committed');
          cli.displayPrompt();
        },
      });
      cli.defineCommand('dump', {
        help: 'Dump the kernel tables',
        action: () => {
          const d = controller.dump();
          log('Kernel Table:');
          log(p(d.kernelTable));
          log('Promises:');
          log(p(d.promises));
          log('Run Queue:');
          log(p(d.runQueue));
          cli.displayPrompt();
        },
      });
      cli.defineCommand('block', {
        help: 'Execute a block of <n> cranks, without commit',
        action: async requestedSteps => {
          const steps = await runBlock(requestedSteps, false);
          log(`executed ${steps} cranks in block`);
          cli.displayPrompt();
        },
      });
      cli.defineCommand('benchmark', {
        help: 'Run <n> rounds of the benchmark protocol',
        action: async rounds => {
          const [steps, deltaT] = await runBenchmark(rounds);
          log(`benchmark ${rounds} rounds, ${steps} cranks in ${deltaT} ns`);
          cli.displayPrompt();
        },
      });
      cli.defineCommand('run', {
        help: 'Crank until the run queue is empty, without commit',
        action: async () => {
          const [steps, deltaT] = await runBatch(0, false);
          log(`ran ${steps} cranks in ${deltaT} ns`);
          cli.displayPrompt();
        },
      });
      cli.defineCommand('step', {
        help: 'Step the swingset one crank, without commit',
        action: async () => {
          try {
            const steps = await controller.step();
            log(steps ? 'stepped one crank' : "didn't step, queue is empty");
            cli.displayPrompt();
          } catch (err) {
            kernelFailure(err);
          }
        },
      });
      break;
    }
    default:
      fail(`invalid command ${command}`);
  }
  if (statLogger) {
    statLogger.close();
  }
  controller.shutdown();

  function getCrankNumber() {
    return Number(swingStore.kvStore.get('crankNumber'));
  }

  function kernelStateDump() {
    const dumpPath = `${dumpDir}/${dumpTag}${crankNumber}`;
    dumpStore(swingStore, dumpPath, rawMode);
  }

  async function runBenchmark(rounds) {
    const cranksPre = getCrankNumber();
    const rawStatsPre = controller.getStats();
    const args = { body: '[]', slots: [] };
    let totalSteps = 0;
    let totalDeltaT = 0n;
    for (let i = 0; i < rounds; i += 1) {
      const roundResult = controller.queueToVatRoot(
        launchIndirectly ? 'launcher' : 'bootstrap',
        'runBenchmarkRound',
        args,
        'ignore',
      );
      // eslint-disable-next-line no-await-in-loop
      const [steps, deltaT] = await runBatch(0, true);
      const status = controller.kpStatus(roundResult);
      if (status === 'unresolved') {
        log(`benchmark round ${i + 1} did not finish`);
      } else {
        const resolution = JSON.stringify(controller.kpResolution(roundResult));
        log(`benchmark round ${i + 1} ${status}: ${resolution}`);
      }
      totalSteps += steps;
      totalDeltaT += deltaT;
    }
    const cranksPost = getCrankNumber();
    const rawStatsPost = controller.getStats();
    benchmarkStats = organizeBenchmarkStats(
      rawStatsPre,
      rawStatsPost,
      cranksPost - cranksPre,
      rounds,
    );
    printBenchmarkStats(benchmarkStats);
    return [totalSteps, totalDeltaT];
  }

  async function runBlock(requestedSteps, doCommit) {
    const blockStartTime = readClock();
    let actualSteps = 0;
    if (verbose) {
      log('==> running block');
    }
    while (requestedSteps > 0) {
      requestedSteps -= 1;
      try {
        // eslint-disable-next-line no-await-in-loop
        const stepped = await controller.step();
        if (stepped < 1) {
          break;
        }
        crankNumber += stepped;
        actualSteps += stepped;
      } catch (err) {
        kernelFailure(err);
      }
      if (doDumps) {
        kernelStateDump();
      }
      if (doAudits) {
        auditRefCounts(swingStore.kvStore);
      }
      if (verbose) {
        log(`===> end of crank ${crankNumber}`);
      }
    }
    const commitStartTime = readClock();
    if (doCommit) {
      swingStore.commit();
    }
    const blockEndTime = readClock();
    if (forceGC) {
      engineGC();
    }
    if (statLogger) {
      blockNumber += 1;
      let data = [blockNumber, actualSteps];
      if (logTimes) {
        data.push(blockEndTime - blockStartTime);
        data.push(blockEndTime - commitStartTime);
      }
      if (logMem) {
        const mem = process.memoryUsage();
        data = data.concat([
          mem.rss,
          mem.heapTotal,
          mem.heapUsed,
          mem.external,
        ]);
      }
      if (logDisk) {
        const diskUsage = dbMode === '--lmdb' ? swingStore.diskUsage() : 0;
        data.push(diskUsage);
      }
      if (logStats) {
        data = data.concat(Object.values(controller.getStats()));
      }
      statLogger.log(data);
    }
    return actualSteps;
  }

  async function runBatch(stepLimit, doCommit) {
    const startTime = readClock();
    let totalSteps = 0;
    let steps;
    const runAll = stepLimit === 0;
    do {
      // eslint-disable-next-line no-await-in-loop
      steps = await runBlock(blockSize, doCommit);
      totalSteps += steps;
      stepLimit -= steps;
    } while ((runAll || stepLimit > 0) && steps >= blockSize);
    return [totalSteps, readClock() - startTime];
  }

  function kernelFailure(err) {
    log(`kernel failure in crank ${crankNumber}: ${err}`, err);
    process.exit(1);
  }

  async function commandRun(stepLimit, runInBlockMode) {
    if (doDumps) {
      kernelStateDump();
    }
    if (doAudits) {
      auditRefCounts(swingStore.kvStore);
    }

    let [totalSteps, deltaT] = await runBatch(stepLimit, runInBlockMode);
    if (!runInBlockMode) {
      swingStore.commit();
    }
    const cranks = getCrankNumber();
    const rawStats = controller.getStats();
    mainStats = organizeMainStats(rawStats, cranks);
    if (shouldPrintStats) {
      printMainStats(mainStats);
    }
    if (benchmarkRounds > 0) {
      const [moreSteps, moreDeltaT] = await runBenchmark(benchmarkRounds);
      totalSteps += moreSteps;
      deltaT += moreDeltaT;
    }
    if (bootstrapResult) {
      const status = controller.kpStatus(bootstrapResult);
      if (status === 'unresolved') {
        log('bootstrap result still pending');
      } else if (status === 'unknown') {
        log(`bootstrap result ${bootstrapResult} is unknown to the kernel`);
        bootstrapResult = null;
      } else {
        const resolution = JSON.stringify(
          controller.kpResolution(bootstrapResult),
        );
        log(`bootstrap result ${status}: ${resolution}`);
        bootstrapResult = null;
      }
    }
    swingStore.close();
    if (statsFile) {
      outputStats(statsFile, mainStats, benchmarkStats);
    }
    if (totalSteps) {
      const per = deltaT / BigInt(totalSteps);
      log(
        `runner finished ${totalSteps} cranks in ${deltaT} ns (${per}/crank)`,
      );
    } else {
      log(`runner finished replay in ${deltaT} ns`);
    }
  }
}
