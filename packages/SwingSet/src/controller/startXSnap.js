import path from 'path';
import { Fail } from '@endo/errors';
import { type as osType } from 'os';
import { xsnap, recordXSnap } from '@agoric/xsnap';

const NETSTRING_MAX_CHUNK_SIZE = 12_000_000;

/**
 * @typedef {object} StartXSnapInitFromBundlesDetails
 * @property {'bundles'} from
 *
 * TODO: Move bundleIDs here
 */

/**
 * @typedef {object} StartXSnapInitFromSnapshotStreamDetails
 * @property {'snapshotStream'} from
 * @property {AsyncIterable<Uint8Array>} snapshotStream
 * @property {string} [snapshotDescription]
 */

/**
 * @typedef {object} StartXSnapInitFromSnapStoreDetails
 * @property {'snapStore'} from
 * @property {string} vatID
 *
 * TODO: transition to direct snapshot stream, and remove this option
 */

/** @typedef {StartXSnapInitFromBundlesDetails | StartXSnapInitFromSnapshotStreamDetails | StartXSnapInitFromSnapStoreDetails} StartXSnapInitDetails */

/** @typedef {ReturnType<typeof makeStartXSnap>} StartXSnap */

/**
 * @param {{
 *   bundleHandler: import('./bundle-handler.js').BundleHandler,
 *   snapStore?: import('@agoric/swing-store').SnapStore,
 *   spawn: typeof import('child_process').spawn
 *   fs: import('fs'),
 *   tmpName: import('tmp')['tmpName'],
 *   debug?: boolean,
 *   workerTraceRootPath?: string,
 *   overrideBundles?: import('../types-external.js').Bundle[],
 *   profileVats?: string[],
 *   debugVats?: string[],
 * }} options
 */
export function makeStartXSnap(options) {
  // our job is to simply curry some authorities and settings into the
  // 'startXSnap' function we return
  const {
    spawn,
    fs,
    tmpName,
    bundleHandler, // required unless bundleIDs is empty
    snapStore,
    workerTraceRootPath,
    overrideBundles,
    profileVats = [],
    debugVats = [],
    debug = false,
  } = options;

  let doXSnap = xsnap;

  if (workerTraceRootPath) {
    let serial = 0;
    const makeNextTraceDir = () => {
      const rel = `${workerTraceRootPath}/${serial}`;
      const workerTrace = path.resolve(rel) + path.sep;
      serial += 1;
      return workerTrace;
    };
    doXSnap = async opts => {
      const workerTraceDir = makeNextTraceDir();
      console.log('SwingSet xsnap worker tracing:', { workerTraceDir });
      fs.mkdirSync(workerTraceDir, { recursive: true });
      return recordXSnap(opts, workerTraceDir, {
        writeFileSync: fs.writeFileSync,
      });
    };
  }

  /** @type { import('@agoric/xsnap/src/xsnap.js').XSnapOptions } */
  const xsnapOpts = {
    os: osType(),
    fs: { ...fs, ...fs.promises, tmpName },
    spawn,
    stdout: 'inherit',
    stderr: 'inherit',
    debug,
    netstringMaxChunkSize: NETSTRING_MAX_CHUNK_SIZE,
  };

  /** @param {StartXSnapInitDetails} initDetails */
  function getSnapshotLoadOptions(initDetails) {
    switch (initDetails.from) {
      case 'bundles':
        return undefined;

      case 'snapStore': {
        if (!snapStore) {
          // Fallback to load from bundles
          return undefined;
        }

        const { vatID } = initDetails;
        const { hash: snapshotID, snapPos } = snapStore.getSnapshotInfo(vatID);
        // console.log('startXSnap from', { snapshotID });
        const snapshotStream = snapStore.loadSnapshot(vatID);
        const snapshotDescription = `${vatID}-${snapPos}-${snapshotID}`;
        return { snapshotStream, snapshotDescription };
      }

      case 'snapshotStream': {
        const { snapshotStream, snapshotDescription } = initDetails;
        return { snapshotStream, snapshotDescription };
      }

      default:
        // @ts-expect-error exhaustive check
        throw Fail`Unexpected xsnap init type ${initDetails.type}`;
    }
  }

  /**
   * @param {string} name
   * @param {object} details
   * @param {import('../types-external.js').BundleID[]} details.bundleIDs
   * @param {string} details.vatID
   * @param {(request: Uint8Array) => Promise<Uint8Array>} details.handleCommand
   * @param {boolean} [details.metered]
   * @param {StartXSnapInitDetails} [details.init]
   */
  async function startXSnap(
    name,
    {
      bundleIDs,
      vatID,
      handleCommand,
      metered,
      init: initDetails = { from: 'bundles' },
    },
  ) {
    if (profileVats.includes(vatID)) {
      Fail`startXSnap: not yet supporting profiling for vat ${vatID}`;
    }
    if (debugVats.includes(vatID)) {
      Fail`startXSnap: not yet supporting debugging for vat ${vatID}`;
    }
    const meterOpts = metered ? {} : { meteringLimit: 0 };
    const snapshotLoadOpts = getSnapshotLoadOptions(initDetails);
    await null;
    if (snapshotLoadOpts) {
      const xs = await doXSnap({
        name,
        handleCommand,
        ...snapshotLoadOpts,
        ...meterOpts,
        ...xsnapOpts,
      });
      await xs.isReady();
      return xs;
    }
    // console.log('fresh xsnap', { snapStore: snapStore });
    const worker = await doXSnap({
      handleCommand,
      name,
      ...meterOpts,
      ...xsnapOpts,
    });

    let bundles;
    if (overrideBundles) {
      bundles = overrideBundles; // ignore the usual bundles
    } else {
      const bundlePs = bundleIDs.map(async id => bundleHandler.getBundle(id));
      bundles = await Promise.all(bundlePs);
    }

    for (const bundle of bundles) {
      const { moduleFormat } = bundle;
      if (moduleFormat !== 'getExport' && moduleFormat !== 'nestedEvaluate') {
        throw Fail`unexpected moduleFormat: ${moduleFormat}`;
      }
      await worker.evaluate(`(${bundle.source}\n)()`.trim());
    }
    return worker;
  }
  return startXSnap;
}
