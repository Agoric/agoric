import process from 'node:process';
import fs from 'node:fs';

import '@endo/init/pre-bundle-source.js';
import '@endo/init';

// XXX The following four imports are present only to make `tsc` shut up.  They do no actual work.
import '@agoric/vats/exported.js';
import '@agoric/inter-protocol/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/cosmic-swingset/src/launch-chain.js';

import { Fail } from '@agoric/assert';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeAgoricNamesRemotesFromFakeStorage } from '@agoric/vats/tools/board-utils.js';
import { makeSwingsetTestKit } from '@agoric/boot/tools/supports.js';
import {
  makeWalletFactoryDriver,
  makeGovernanceDriver,
} from '@agoric/boot/tools/drivers.js';
import { makeLiquidationTestKit } from '@agoric/boot/tools/liquidation.js';

// When I was a child my family took a lot of roadtrips around California to go
// camping and backpacking and so on.  It was not uncommon in those days (nor is
// it uncommon today) to encounter points of historical interest alongside the
// road.  These would invariably be indicated by the presence of a roadside sign
// saying something like "Historical Landmark 500 ft", followed 500 feet later
// by a pulloff with a stone pedestal with a bronze plaque on it describing
// whatever the heck it was.  At one point we passed one of these and as
// pedantic 10 year olds are wont to do I pointed out to my parents that it was
// the thing of interest itself that was the historical landmark, and that the
// stone pedestal with the bronze plaque on it was not the historical landmark
// but was in fact an historical landmark marker.  It then followed that the
// sign beside the road indicating that one of these was coming up was thus an
// historical landmark marker marker.  I further mused that since these signs
// were clearly not hand painted, somewhere in the bowels of Caltrans there had
// to be a machine which produced these signs, and that machine would be an
// historical landmark marker marker maker.  And, of course, somewhere in the
// world there had to be a company that manufactured these machines (since every
// state would need at least one) and that company would then be an historical
// landmark marker marker maker maker.  I have no idea where in this naming
// taxonomy the name of this module should sit, but it's probably somewhere.

/**
 * The benchmark context object.  The benchmarkerator provides this to
 * benchmarks when they run.
 *
 * @typedef {{
 *    options: Record<string, string>,
 *    argv: string[],
 *    actors: Record<string, import('@agoric/boot/tools/drivers.js').SmartWalletDriver>,
 *    tools: Record<string, unknown>,
 *    title?: string,
 *    rounds?: number,
 *    config?: Record<string, unknown>,
 * }} BenchmarkContext
 *
 * BenchmarkContext:
 *  // Named options from the command line
 *  options: Record<string, string>,
 *
 *  // Other unparsed args from the command line
 *  argv: string[],
 *
 *  // Wallet drivers for the various personae that exist in the test
 *  // environment.  Currently present are 'gov1', 'gov2', and 'gov3' (the
 *  // governance committee); 'atom1' and 'atom2' (ersatz ATOM-USD price feed
 *  // oracles); and 'alice', 'bob', and 'carol' (arbitrary users to participate
 *  // in interactions being exercized)
 *  actors: Record<string, SmartWalletDriver>,
 *
 *  // The label string for the benchmark currently being executed
 *  title: string,
 *
 *  // Functions provided to do things
 *  tools: Record<string, unknown>,
 *
 *  // The number of rounds of this benchmark that will be executed
 *  rounds: number,
 *
 *  // Optional, benchmark-specific configuration information provided by the
 *  // benchmark's `setup` method
 *  config?: Record<string, unknown>,
 *
 *
 * The benchmark object.  The benchmark author supplies this.
 *
 * @typedef {{
 *    setup?: (context: BenchmarkContext) => Promise<Record<string, unknown> | undefined>,
 *    setupRound?: (context: BenchmarkContext, round: number) => Promise<void>,
 *    executeRound: (context: BenchmarkContext, round: number) => Promise<void>,
 *    finishRound?: (context: BenchmarkContext, round: number) => Promise<void>,
 *    finish?: (context: BenchmarkContext) => Promise<void>,
 *    rounds?: number,
 * }} Benchmark
 *
 * Benchmark:
 *   // Optional setup method: do whatever pre-run setup you need to do.  If you
 *   // return a record, it will be included as the `config` property of the
 *   // benchmark context parameter of subsequent calls into the benchmark object.
 *   setup?: (context: BenchmarkContext) => Promise<Record<string, unknown> | undefined>,
 *
 *   // Optional setup method for an individual round.  This is executed as part
 *   // of a benchmark round, just prior to calling the `executeRound` method,
 *   // but does not count towards the timing or resource usage statistics for
 *   // the round itself.  Use this when there is per-round initialization that
 *   // is necessary to execute the round but which should not be considered
 *   // part of the operation being measured.
 *   setupRound?: (context: BenchmarkContext, round: number) => Promise<void>,
 *
 *   // Optional finish method for an individual round.  This is executed as
 *   // part of a benchmark round, just after calling the `executeRound` method,
 *   // but does not count towards the timing or resource usage statistics for
 *   // the round itself.  Use this when there is per-round teardown that is
 *   // necessary after executing the round but which should not be considered
 *   // part of the operation being measured.
 *   finishRound?: (context: BenchmarkContext, round: number) => Promise<void>,
 *
 *   // Run one round of the benchmark
 *   executeRound: (context: BenchmarkContext, round: number) => Promise<void>,
 *
 *   // Optional finish method: do any post-run teardown you need to clean things up.
 *   // Called after all rounds have executed.
 *   finish?: (context: BenchmarkContext) => Promise<void>,
 *
 *   // The number of rounds that will be run if not overridden on the command line.
 *   // Defaults to 1 if not specified.
 *   rounds?: number,
 *
 *
 * The benchmarkerator object.  The benchmarkerator framework supplies this.
 *
 * @typedef {{
 *    addBenchmark: (title: string, benchmark: Benchmark) => void,
 *    run: () => Promise<void>,
 * }} Benchmarkerator
 */

const log = console.log;

const argv = process.argv.slice(2);

let commandLineRounds;
let verbose = false;
let help = false;
let outputFile;
let slogFile;
/** @type ManagerType */
let defaultManagerType = 'xs-worker';
const options = {};
const benchmarkPatts = [];

const readClock = () => process.hrtime.bigint();

const usage = () => {
  log(`
${process.argv[0]} ${process.argv[1]} [FLAGS] [-- [ARGS...]]

FLAGS may be:
  -r N
  --rounds N        - execute N rounds of each benchmark

  -b PATT
  --benchmark PATT  - only execute benchmarks matching PATT (may be specified more than once)

  -v
  --verbose         - output verbose debugging messages as it runs

  -c NAME VAL
  --config NAME VAL - set named configuration option NAME to VAL

  --vat-type TYPE   - use the specified vat manager type rather than the default 'xs-worker'

  -l
  --local           - shorthand for '--vat-type local'
                      (less realistic perf numbers but faster and easier to debug)

  -n
  --node            - shorthand for '--vat-type node-subprocess'
                      (similar to --local, but enables per-vat profiling and debugging in v8)

  -x
  --xs              - shorthand for '--vat-type xs-worker'
                      (the default; provided for completeness)

  -p VATID
  --profile VATID   - turn on CPU profile for vat VATID (may be repeated for multiple vats)

  -d VATID
  --debug VATID     - turn on debugging for vat VATID (may be repeated for multiple vats)

  -s PATH
  --slog PATH       - output a slog file into a file named PATH

  -o PATH
  --output PATH     - output JSON-formatted benchmark data into a file named PATH

  -h
  --help            - output this helpful usage information and then exit

additional ARGS are passed to the benchmark in the context.argv array
`);
};

const fail = (message, printUsage) => {
  log(message);
  if (printUsage) {
    usage();
  }
  process.exit(1);
};

let stillScanningArgs = true;
const profileVats = [];
const debugVats = [];
while (argv[0] && stillScanningArgs) {
  const flag = argv.shift();
  switch (flag) {
    case '-r':
    case '--rounds':
      commandLineRounds = Number(argv.shift());
      break;
    case '-b':
    case '--benchmark':
      benchmarkPatts.push(argv.shift());
      break;
    case '-v':
    case '--verbose':
      verbose = true;
      break;
    case '-o':
    case '--output':
      outputFile = argv.shift();
      break;
    case '--vat-type': {
      const type = argv.shift();
      if (
        type !== 'local' &&
        type !== 'xs-worker' &&
        type !== 'xsnap' &&
        type !== 'node-subprocess'
      ) {
        fail(`invalid vat manager type ${type}`);
      } else {
        defaultManagerType = type;
      }
      break;
    }
    case '-l':
    case '--local':
      defaultManagerType = 'local';
      break;
    case '-n':
    case '--node':
      defaultManagerType = 'node-subprocess';
      break;
    case '-x':
    case '--xs':
      defaultManagerType = 'xs-worker';
      break;
    case '-?':
    case '-h':
    case '--help':
      help = true;
      break;
    case '-p':
    case '--profile':
      profileVats.push(argv.shift());
      break;
    case '-d':
    case '--debug':
      debugVats.push(argv.shift());
      break;
    case '-s':
    case '--slog':
      slogFile = argv.shift();
      break;
    case '-c':
    case '--config': {
      const optionName = argv.shift();
      const optionValue = argv.shift();
      options[optionName] = optionValue;
      break;
    }
    case '--':
      stillScanningArgs = false;
      break;
    default:
      fail(`invalid command line option ${flag}`, true);
      break;
  }
}

if (defaultManagerType === 'local') {
  if (profileVats.length > 0) {
    fail(`per-vat profiling not supported under vat type 'local'`);
  }
  if (debugVats.length > 0) {
    fail(`per-vat debugging not supported under vat type 'local'`);
  }
}

harden(options);

if (help) {
  usage();
  process.exit(0);
}

/**
 * Test if a given benchmark should be included in the benchmarks that get run.
 *
 * @param {string} title  The title of the benchmark in question
 *
 * @returns {boolean} true iff the benchmark should be run this time through.
 */
const shouldIncludeBenchmark = title => {
  if (benchmarkPatts.length === 0) {
    return true;
  }
  for (const patt of benchmarkPatts) {
    if (title.match(patt)) {
      return true;
    }
  }
  return false;
};

/**
 * Test if a given kernel stats key is one of the main keys or a subsidiary key.
 *
 * @param {string} key  The key in question
 *
 * @returns {boolean} true iff the key is one of the main keys.
 */
const isMainKey = key =>
  !key.endsWith('Max') && !key.endsWith('Up') && !key.endsWith('Down');

/**
 * Return a string representation of a number with 3 digits of precision to the
 * right of the decimal point -- unless it's an integer, in which case, in the
 * interest of visual clarity, replace the fractional part with spaces.
 *
 * @param {number} n  The number to format
 *
 * @returns {string} a prettily formatted representation of `n`
 */
const pn = n => n.toFixed(3).replace(/[.]000$/, '    ');

const printSetupStats = stats => {
  const w1 = 32;
  const h1 = `${'Stat'.padEnd(w1)}`;
  const d1 = `${''.padEnd(w1, '-')}`;

  const w2 = 9;
  const h2 = `${'Value'.padStart(w2)}`;
  const d2 = ` ${''.padStart(w2 - 1, '-')}`;

  const w3 = 9;
  const h3 = `${'Incs'.padStart(w3)}`;
  const d3 = ` ${''.padStart(w3 - 1, '-')}`;

  const w4 = 9;
  const h4 = `${'Decs'.padStart(w4)}`;
  const d4 = ` ${''.padStart(w4 - 1, '-')}`;

  const w5 = 9;
  const h5 = `${'MaxValue'.padStart(w5)}`;
  const d5 = ` ${''.padStart(w5 - 1, '-')}`;

  const w6 = 8;
  const h6 = ` ${'PerCrank'.padStart(w6)}`;
  const d6 = ` ${''.padStart(w6, '-')}`;

  const perTag = stats.timePerCrank
    ? ` (${stats.timePerCrank.toFixed(3)}/crank)`
    : '';
  log(`${stats.cranks} cranks in ${stats.elapsedTime}ns${perTag}`);
  log(`${h1} ${h2} ${h3} ${h4} ${h5} ${h6}`);
  log(`${d1} ${d2} ${d3} ${d4} ${d5} ${d6}`);

  const data = stats.data;
  for (const [key, entry] of Object.entries(data)) {
    const col1 = `${key.padEnd(w1)}`;

    const col2 = `${String(entry.value).padStart(w2)}`;

    const v3 = entry.up !== undefined ? entry.up : '';
    const col3 = `${String(v3).padStart(w3)}`;

    const v4 = entry.down !== undefined ? entry.down : '';
    const col4 = `${String(v4).padStart(w4)}`;

    const v5 = entry.max !== undefined ? entry.max : '';
    const col5 = `${String(v5).padStart(w5)}`;

    const col6 = `${pn(entry.value / stats.cranks).padStart(w6)}`;

    log(`${col1} ${col2} ${col3} ${col4} ${col5}  ${col6}`);
  }
};

const organizeSetupStats = (rawStats, elapsedTime, cranks) => {
  const stats = {
    elapsedTime,
    cranks,
    timePerCrank: cranks ? elapsedTime / cranks : 0,
    data: {},
  };
  for (const [key, value] of Object.entries(rawStats)) {
    if (isMainKey(key)) {
      const upKey = `${key}Up`;
      const downKey = `${key}Down`;
      const maxKey = `${key}Max`;
      stats.data[key] = {
        value,
        up: rawStats[upKey],
        down: rawStats[downKey],
        max: rawStats[maxKey],
        perCrank: value / cranks,
      };
    }
  }
  return stats;
};

const printBenchmarkStats = stats => {
  const cpr = pn(stats.cranksPerRound).trim();
  log(
    `${stats.cranks} cranks over ${stats.rounds} rounds (${cpr} cranks/round)`,
  );
  if (stats.cranks > 0) {
    log(
      // prettier-ignore
      `${stats.cranks} cranks in ${stats.elapsedTime}ns (${stats.timePerCrank.toFixed(3)}/crank})`,
    );
  }
  log(
    // prettier-ignore
    `${stats.rounds} rounds in ${stats.elapsedTime}ns (${stats.timePerRound.toFixed(3)}/round})`,
  );

  // There are lots of temp variables used here simply so things lay out cleanly
  // in the source text.  Don't try to read too much meaning into the names themselves.
  const wc1 = 32;
  const hc1 = `${'Counter'.padEnd(wc1)}`;
  const dc1 = `${''.padEnd(wc1, '-')}`;

  const wc2 = 6;
  const hc2 = `${'Total'.padStart(wc2)}`;
  const dc2 = ` ${''.padStart(wc2 - 1, '-')}`;

  const wc3 = 10;
  const hc3 = `${'PerRound'.padStart(wc3)}`;
  const dc3 = ` ${''.padStart(wc3 - 1, '-')}`;

  log(``);
  log(`${hc1} ${hc2} ${hc3}`);
  log(`${dc1} ${dc2} ${dc3}`);
  for (const [key, entry] of Object.entries(stats.counters)) {
    const col1 = `${key.padEnd(wc1)}`;
    const col2 = `${String(entry.delta).padStart(wc2)}`;
    const col3 = `${pn(entry.deltaPerRound).padStart(wc3)}`;
    log(`${col1} ${col2} ${col3}`);
  }

  const wg1 = 32;
  const hg1 = `${'Gauge'.padEnd(wg1)}`;
  const dg1 = `${''.padEnd(wg1, '-')}`;

  const wg2 = 6;
  const hg2 = `${'Start'.padStart(wg2)}`;
  const dg2 = ` ${''.padStart(wg2 - 1, '-')}`;

  const wg3 = 6;
  const hg3 = `${'End'.padStart(wg3)}`;
  const dg3 = ` ${''.padStart(wg3 - 1, '-')}`;

  const wg4 = 6;
  const hg4 = `${'Delta'.padStart(wg4)}`;
  const dg4 = ` ${''.padStart(wg4 - 1, '-')}`;

  const wg5 = 9;
  const hg5 = `${'PerRound'.padStart(wg5)}`;
  const dg5 = ` ${''.padStart(wg5 - 1, '-')}`;

  log(``);
  log(`${hg1} ${hg2} ${hg3} ${hg4} ${hg5}`);
  log(`${dg1} ${dg2} ${dg3} ${dg4} ${dg5}`);
  for (const [key, entry] of Object.entries(stats.gauges)) {
    const col1 = `${key.padEnd(wg1)}`;
    const col2 = `${String(entry.start).padStart(wg2)}`;
    const col3 = `${String(entry.end).padStart(wg3)}`;
    const delta = entry.end - entry.start;
    const col4 = `${String(delta).padStart(wg4)}`;
    const col5 = `${pn(delta / stats.rounds).padStart(wg5)}`;
    log(`${col1} ${col2} ${col3} ${col4} ${col5}`);
  }
};

const organizeRoundsStats = (rounds, perRoundStats) => {
  let elapsedTime = 0;
  let cranks = 0;
  for (const { start, end } of perRoundStats) {
    elapsedTime += Number(end.time - start.time);
    cranks += end.cranks - start.cranks;
  }
  const stats = {
    elapsedTime,
    cranks,
    rounds,
    timePerCrank: cranks ? elapsedTime / cranks : 0,
    timePerRound: elapsedTime / rounds,
    cranksPerRound: cranks / rounds,
    perRoundStats,
    counters: {},
    gauges: {},
  };

  // Note: the following assumes stats records all have the same keys.
  const first = perRoundStats[0].start.rawStats;
  const last = perRoundStats[perRoundStats.length - 1].end.rawStats;
  for (const key of Object.keys(first)) {
    if (isMainKey(key)) {
      if (Object.hasOwn(first, `${key}Max`)) {
        stats.gauges[key] = {
          start: first[key],
          end: last[key],
        };
      } else {
        let delta = 0;
        for (const { start, end } of perRoundStats) {
          delta += Number(end.rawStats[key] - start.rawStats[key]);
        }
        stats.counters[key] = {
          delta,
          deltaPerRound: delta / rounds,
        };
      }
    }
  }
  return stats;
};

/**
 * Produce a new benchmarkerator object.
 *
 * Note: Most likely you do not need to use this, as this the benchmarkerator is
 * typically a singleton.  But we provide it just in case...
 *
 * @returns {Promise<Benchmarkerator>}
 */
export const makeBenchmarkerator = async () => {
  const benchmarks = new Map();

  if (slogFile) {
    // Kernel slogger will append to the slog file if it already exists, but
    // here we don't want that because repeat runs would result in confusing
    // slog output due to crank numbers, vat IDs, krefs, and vrefs all resetting
    // with each run.
    fs.unlinkSync(slogFile);
  }
  const setupStartTime = readClock();
  const swingsetTestKit = await makeSwingsetTestKit(console.log, undefined, {
    defaultManagerType,
    verbose,
    profileVats,
    debugVats,
    slogFile,
  });
  const {
    runUtils,
    storage: chainStorage,
    shutdown,
    controller,
    getCrankNumber,
  } = swingsetTestKit;
  const { EV } = runUtils;

  // Wait for ATOM to make it into agoricNames
  // E(bootstrap).consumeItem('vaultFactoryKit');
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes =
    makeAgoricNamesRemotesFromFakeStorage(chainStorage);

  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    chainStorage,
    agoricNamesRemotes,
  );

  const governanceDriver = await makeGovernanceDriver(
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    [
      'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
      'agoric1w8wktaur4zf8qmmtn3n7x3r0jhsjkjntcm3u6h',
    ],
  );

  const liquidationTestKit = await makeLiquidationTestKit({
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    governanceDriver,
    // @ts-expect-error missing 'skip' property of real Ava like
    t: { like: () => {} }, // XXX noop
  });

  const actors = {
    atom1: await walletFactoryDriver.provideSmartWallet(
      'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
    ),
    atom2: await walletFactoryDriver.provideSmartWallet(
      'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
    ),
    alice: await walletFactoryDriver.provideSmartWallet('agoric1alice'),
    bob: await walletFactoryDriver.provideSmartWallet('agoric1bob'),
    carol: await walletFactoryDriver.provideSmartWallet('agoric1carol'),
  };
  let idx = 1;
  for (const gov of governanceDriver.ecMembers) {
    actors[`gov${idx}`] = gov;
    idx += 1;
  }

  const setupEndTime = readClock();
  const setupCranks = getCrankNumber();
  const setupRawStats = controller.getStats();
  const setupElapsedTime = Number(setupEndTime - setupStartTime);
  const setupStats = organizeSetupStats(
    setupRawStats,
    setupElapsedTime,
    setupCranks,
  );
  log('-'.repeat(70));
  log(`Setup stats:`);
  printSetupStats(setupStats);
  log('-'.repeat(70));
  const benchmarkReport = { setup: setupStats };
  const tools = {
    ...swingsetTestKit,
    ...liquidationTestKit,
    walletFactoryDriver,
  };

  const context = { options, argv, actors, tools };

  /**
   * Add a benchmark to the set being run by an execution of the benchmark
   * framework.
   *
   * @param {string} title - string identifying the benchmark.  Used for logging
   *    and execution control.
   * @param {Benchmark} benchmark - the benchmark itself
   */
  const addBenchmark = (title, benchmark) => {
    typeof title === 'string' || Fail`benchmark title must be a string`;
    if (benchmark.setup) {
      typeof benchmark.setup === 'function' ||
        Fail`benchmark setup must be a function`;
    }
    if (benchmark.setupRound) {
      typeof benchmark.setupRound === 'function' ||
        Fail`benchmark setupRound must be a function`;
    }
    benchmark.executeRound ||
      Fail`no executeRound function for benchmark ${title}`;
    if (benchmark.finishRound) {
      typeof benchmark.finishRound === 'function' ||
        Fail`benchmark finishRound must be a function`;
    }
    typeof benchmark.executeRound === 'function' ||
      Fail`benchmark executeRound must be a function`;
    if (benchmark.finish) {
      typeof benchmark.finish === 'function' ||
        Fail`benchmark finish must be a function`;
    }
    if (benchmark.rounds !== undefined) {
      typeof benchmark.rounds === 'number' ||
        Fail`benchmark rounds must be a number`;
    }
    benchmarks.set(title, benchmark);
  };

  /**
   * Execute the benchmarks.
   */
  const run = async () => {
    /** @type {object} */
    const benchmarkContext = { ...context };
    await null;
    for (const [title, benchmark] of benchmarks.entries()) {
      if (!shouldIncludeBenchmark(title)) {
        continue;
      }
      benchmarkContext.title = title;
      const rounds = commandLineRounds || benchmark.rounds || 1;
      benchmarkContext.rounds = rounds;
      if (benchmark.setup) {
        log(`Benchmark "${title}" setup:`);
        benchmarkContext.config = await benchmark.setup(benchmarkContext);
      } else {
        log(`Benchmark "${title}" no setup function configured`);
      }
      log('-'.repeat(70));
      const perRoundStats = [];
      for (let round = 1; round <= rounds; round += 1) {
        if (benchmark.setupRound) {
          await benchmark.setupRound(benchmarkContext, round);
        }
        const start = {
          rawStats: controller.getStats(),
          time: readClock(),
          cranks: getCrankNumber(),
        };
        log(`Benchmark "${title}" round ${round} start crank ${start.cranks}`);
        await benchmark.executeRound(benchmarkContext, round);
        const end = {
          rawStats: controller.getStats(),
          time: readClock(),
          cranks: getCrankNumber(),
        };
        log(`Benchmark "${title}" round ${round} end crank ${end.cranks - 1}`);
        log('-'.repeat(70));
        perRoundStats.push({ start, end });
        if (benchmark.finishRound) {
          await benchmark.finishRound(benchmarkContext, round);
        }
      }
      const benchmarkStats = organizeRoundsStats(rounds, perRoundStats);
      log(`Benchmark "${title}" stats:`);
      printBenchmarkStats(benchmarkStats);
      benchmarkReport[title] = benchmarkStats;
      log('-'.repeat(70));
      if (benchmark.finish) {
        log(`Benchmark "${title}" setup:`);
        await benchmark.finish(benchmarkContext);
      } else {
        log(`Benchmark "${title}" no finish function configured`);
      }
    }
    await eventLoopIteration();
    await shutdown();
    if (outputFile) {
      fs.writeFileSync(
        outputFile,
        JSON.stringify(
          benchmarkReport,
          (_key, value) => (typeof value === 'bigint' ? Number(value) : value),
          2,
        ),
      );
    }
  };

  return {
    addBenchmark,
    run,
  };
};

/**
 * The normal singleton benchmarkerator.
 */
// eslint-disable-next-line @jessie.js/safe-await-separator
export const bench = await makeBenchmarkerator();
