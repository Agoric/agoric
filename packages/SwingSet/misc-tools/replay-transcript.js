/* global WeakRef FinalizationRegistry */
/* eslint-disable no-constant-condition */
import fs from 'fs';
// import '@endo/init';
import '../tools/install-ses-debug.js';
import zlib from 'zlib';
import readline from 'readline';
import process from 'process';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { pipeline } from 'stream';
import { performance } from 'perf_hooks';
// eslint-disable-next-line import/no-extraneous-dependencies
import { file as tmpFile, tmpName } from 'tmp';
import bundleSource from '@endo/bundle-source';
import { makeMeasureSeconds } from '@agoric/internal';
import { makeSnapStore } from '@agoric/swing-store';
import { waitUntilQuiescent } from '../src/lib-nodejs/waitUntilQuiescent.js';
import { makeStartXSnap } from '../src/controller/controller.js';
import { makeXsSubprocessFactory } from '../src/kernel/vat-loader/manager-subprocess-xsnap.js';
import { makeLocalVatManagerFactory } from '../src/kernel/vat-loader/manager-local.js';
import { makeNodeSubprocessFactory } from '../src/kernel/vat-loader/manager-subprocess-node.js';
import { startSubprocessWorker } from '../src/lib-nodejs/spawnSubprocessWorker.js';
import { requireIdentical } from '../src/kernel/vat-loader/transcript.js';
import { makeDummyMeterControl } from '../src/kernel/dummyMeterControl.js';
import { makeGcAndFinalize } from '../src/lib-nodejs/gc-and-finalize.js';
import engineGC from '../src/lib-nodejs/engine-gc.js';

// Set the absolute path of the SDK to use for bundling
// This can help if there are symlinks in the path that should be respected
// to match the path of the SDK that produced the initial transcript
// For e.g. set to '/src' if replaying a docker based loadgen transcript
const ABSOLUTE_SDK_PATH = null;

// Rebuild the bundles when starting the replay.
// Disable if bundles were previously extracted form a Kernel DB, or
// to save a few seconds and rely upon previously built versions instead
const REBUILD_BUNDLES = false;

// Enable to continue if snapshot hash doesn't match transcript
const IGNORE_SNAPSHOT_HASH_DIFFERENCES = false;

const FORCED_SNAPSHOT_INITIAL = 2;
const FORCED_SNAPSHOT_INTERVAL = 1000;

// Use a simplified snapstore which derives the snapshot filename from the
// transcript and doesn't compress the snapshot
const USE_CUSTOM_SNAP_STORE = true;

// Enable to output xsnap debug traces corresponding to the transcript replay
const RECORD_XSNAP_TRACE = false;

const pipe = promisify(pipeline);

/** @type {(filename: string) => Promise<string>} */
async function fileHash(filename) {
  const hash = createHash('sha256');
  const input = fs.createReadStream(filename);
  await pipe(input, hash);
  return hash.digest('hex');
}

function makeSnapStoreIO() {
  return {
    createReadStream: fs.createReadStream,
    createWriteStream: fs.createWriteStream,
    fsync: fs.fsync,
    measureSeconds: makeMeasureSeconds(performance.now),
    open: fs.promises.open,
    rename: fs.promises.rename,
    resolve: path.resolve,
    stat: fs.promises.stat,
    tmpFile,
    tmpName,
    unlink: fs.promises.unlink,
  };
}

async function makeBundles() {
  const controllerUrl = new URL(
    `${
      ABSOLUTE_SDK_PATH ? `${ABSOLUTE_SDK_PATH}/packages/SwingSet` : '..'
    }/src/controller/initializeSwingset.js`,
    import.meta.url,
  );

  const srcGE = rel =>
    bundleSource(new URL(rel, controllerUrl).pathname, 'getExport');
  const lockdown = await srcGE(
    '../supervisors/subprocess-xsnap/lockdown-subprocess-xsnap.js',
  );
  const supervisor = await srcGE(
    '../supervisors/subprocess-xsnap/supervisor-subprocess-xsnap.js',
  );
  fs.writeFileSync('lockdown-bundle', JSON.stringify(lockdown));
  fs.writeFileSync('supervisor-bundle', JSON.stringify(supervisor));
  console.log(`xs bundles written`);
}

function compareSyscalls(vatID, originalSyscall, newSyscall) {
  const error = requireIdentical(vatID, originalSyscall, newSyscall);
  if (
    error &&
    JSON.stringify(originalSyscall).indexOf('error:liveSlots') !== -1
  ) {
    return undefined; // Errors are serialized differently, sometimes
  }
  return error;
}

// relative timings:
// 3.8s v8-false, 27.5s v8-gc
// 10.8s xs-no-gc, 15s xs-gc
const worker = 'xs-worker';

async function replay(transcriptFile) {
  let vatID; // we learn this from the first line of the transcript
  let factory;

  let loadSnapshotID = null;
  let saveSnapshotID = null;
  let lastTranscriptNum;
  const snapshotOverrideMap = new Map();

  const snapshotActivityFd = fs.openSync('snapshot-activity.jsonl', 'a');

  const fakeKernelKeeper = {
    provideVatKeeper: _vatID => ({
      addToTranscript: () => undefined,
      getLastSnapshot: () => loadSnapshotID && { snapshotID: loadSnapshotID },
    }),
    getRelaxDurabilityRules: () => false,
  };
  const kernelSlog = {
    write() {},
    delivery: () => () => undefined,
    syscall: () => () => undefined,
  };
  const snapStore = USE_CUSTOM_SNAP_STORE
    ? {
        async save(saveRaw) {
          const snapFile = `${saveSnapshotID || 'unknown'}.xss`;
          await saveRaw(snapFile);
          const hash = await fileHash(snapFile);
          const filePath = `${hash}.xss`;
          await fs.promises.rename(snapFile, filePath);
          return { hash, filePath };
        },
        async load(hash, loadRaw) {
          const snapFile = `${hash}.xss`;
          return loadRaw(snapFile);
        },
      }
    : makeSnapStore(process.cwd(), makeSnapStoreIO());
  const testLog = undefined;
  const meterControl = makeDummyMeterControl();
  const gcTools = harden({
    WeakRef,
    FinalizationRegistry,
    waitUntilQuiescent,
    gcAndFinalize: makeGcAndFinalize(engineGC),
    meterControl,
  });
  const allVatPowers = { testLog };
  let xsnapPID;

  if (worker === 'xs-worker') {
    // eslint-disable-next-line no-constant-condition
    if (REBUILD_BUNDLES) {
      console.log(`creating xsnap helper bundles`);
      await makeBundles();
      console.log(`xsnap helper bundles created`);
    }
    const bundles = [
      JSON.parse(fs.readFileSync('lockdown-bundle')),
      JSON.parse(fs.readFileSync('supervisor-bundle')),
    ];
    const env = {};
    if (RECORD_XSNAP_TRACE) {
      env.XSNAP_TEST_RECORD = process.cwd();
    }

    const capturePIDSpawn = (...args) => {
      const child = spawn(...args);
      xsnapPID = child.pid;
      return child;
    };
    const startXSnap = makeStartXSnap(bundles, {
      snapStore,
      env,
      spawn: capturePIDSpawn,
    });
    factory = makeXsSubprocessFactory({
      kernelKeeper: fakeKernelKeeper,
      kernelSlog,
      startXSnap,
      testLog,
    });
  } else if (worker === 'local') {
    factory = makeLocalVatManagerFactory({
      allVatPowers,
      kernelKeeper: fakeKernelKeeper,
      vatEndowments: {},
      gcTools,
      kernelSlog,
    });
  } else if (worker === 'node-subprocess') {
    // this worker type cannot do blocking syscalls like vatstoreGet, so it's
    // kind of useless for vats that use virtual objects
    function startSubprocessWorkerNode() {
      const supercode = new URL(
        '../src/supervisors/subprocess-node/supervisor-subprocess-node.js',
        import.meta.url,
      ).pathname;
      return startSubprocessWorker(process.execPath, ['-r', 'esm', supercode]);
    }
    factory = makeNodeSubprocessFactory({
      startSubprocessWorker: startSubprocessWorkerNode,
      kernelKeeper: fakeKernelKeeper,
      kernelSlog,
      testLog,
    });
  } else {
    throw Error(`unhandled worker type ${worker}`);
  }

  let vatParameters;
  let vatSourceBundle;
  let manager;

  const createManager = async () => {
    const managerOptions = {
      sourcedConsole: console,
      vatParameters,
      compareSyscalls,
      useTranscript: true,
    };
    const vatSyscallHandler = undefined;
    manager = await factory.createFromBundle(
      vatID,
      vatSourceBundle,
      managerOptions,
      {},
      vatSyscallHandler,
    );
  };

  let transcriptF = fs.createReadStream(transcriptFile);
  if (transcriptFile.endsWith('.gz')) {
    transcriptF = transcriptF.pipe(zlib.createGunzip());
  }
  const lines = readline.createInterface({ input: transcriptF });
  let lineNumber = 1;
  for await (const line of lines) {
    if (lineNumber % 1000 === 0) {
      console.log(` (slog line ${lineNumber})`);
    }
    lineNumber += 1;
    const data = JSON.parse(line);
    if (data.type === 'heap-snapshot-load') {
      if (manager) {
        await manager.shutdown();
        manager = null;
      }
      loadSnapshotID = data.snapshotID;
      if (snapshotOverrideMap.has(loadSnapshotID)) {
        loadSnapshotID = snapshotOverrideMap.get(loadSnapshotID);
      }
      if (data.vatID) {
        vatID = data.vatID;
      }
      await createManager();
      console.log(
        `created manager from snapshot ${loadSnapshotID}, worker PID: ${xsnapPID}`,
      );
      fs.writeSync(
        snapshotActivityFd,
        `${JSON.stringify({
          transcriptFile,
          type: 'load',
          xsnapPID,
          vatID,
          snapshotID: data.snapshotID,
          loadSnapshotID,
        })}\n`,
      );
      loadSnapshotID = null;
    } else if (!manager) {
      if (data.type !== 'create-vat') {
        throw Error(
          `first line of transcript was not a create-vat or heap-snapshot-load`,
        );
      }
      ({ vatParameters, vatSourceBundle } = data);
      vatID = data.vatID;
      await createManager();
      console.log(
        `manager created from bundle source, worker PID: ${xsnapPID}`,
      );
      fs.writeSync(
        snapshotActivityFd,
        `${JSON.stringify({
          transcriptFile,
          type: 'create',
          xsnapPID,
          vatID,
        })}\n`,
      );
    } else if (data.type === 'heap-snapshot-save') {
      saveSnapshotID = data.snapshotID;
      const { hash } = await manager.makeSnapshot(snapStore);
      snapshotOverrideMap.set(saveSnapshotID, hash);
      fs.writeSync(
        snapshotActivityFd,
        `${JSON.stringify({
          transcriptFile,
          type: 'save',
          xsnapPID,
          vatID,
          transcriptNum: lastTranscriptNum,
          snapshotID: hash,
          saveSnapshotID,
        })}\n`,
      );
      if (hash !== saveSnapshotID) {
        const errorMessage = `Snapshot hash does not match. ${hash} !== ${saveSnapshotID}`;
        if (IGNORE_SNAPSHOT_HASH_DIFFERENCES) {
          console.warn(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      } else {
        console.log(`made snapshot ${hash}`);
      }
      saveSnapshotID = null;
    } else {
      const { transcriptNum, d: delivery, syscalls } = data;
      lastTranscriptNum = transcriptNum;
      // syscalls = [{ d, response }, ..]
      // console.log(`replaying:`);
      console.log(
        `delivery ${transcriptNum} (L ${lineNumber}):`,
        JSON.stringify(delivery).slice(0, 200),
      );
      // for (const s of syscalls) {
      //   // s.response = 'nope';
      //   console.log(
      //     ` syscall:`,
      //     s.response[0],
      //     JSON.stringify(s.d).slice(0, 200),
      //     JSON.stringify(s.response[1]).slice(0, 200),
      //   );
      // }
      await manager.replayOneDelivery(delivery, syscalls, transcriptNum);
      // console.log(`dr`, dr);

      // enable this to write periodic snapshots, for #5975 leak
      if (
        FORCED_SNAPSHOT_INTERVAL &&
        (transcriptNum - FORCED_SNAPSHOT_INITIAL) % FORCED_SNAPSHOT_INTERVAL ===
          0
      ) {
        const { hash } = await manager.makeSnapshot(snapStore);
        fs.writeSync(
          snapshotActivityFd,
          `${JSON.stringify({
            transcriptFile,
            type: 'save',
            xsnapPID,
            vatID,
            transcriptNum,
            snapshotID: hash,
          })}\n`,
        );
        console.log(`made snapshot ${hash} for delivery ${transcriptNum}`);
      }
    }
  }

  lines.close();
  fs.closeSync(snapshotActivityFd);
  if (manager) {
    await manager.shutdown();
  }
}

async function run() {
  const args = process.argv.slice(2);
  console.log(`argv`, args);
  if (args.length < 1) {
    console.log(`replay-transcript.js transcript.sst`);
    return;
  }
  const [transcriptFile] = args;
  console.log(`using transcript ${transcriptFile}`);
  await replay(transcriptFile);
}

run().catch(err => console.log('RUN ERR', err));
