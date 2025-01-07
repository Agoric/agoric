/* eslint-env node */
import fs from 'fs';
import path from 'path';

import { assert, b, Fail } from '@endo/errors';
import { deepCopyJsonable, makeTracer } from '@agoric/internal';
import { mustMatch } from '@agoric/store';
import bundleSource from '@endo/bundle-source';
import { resolve as resolveModuleSpecifier } from 'import-meta-resolve';
import { ManagerType } from '../typeGuards.js';
import { provideBundleCache } from '../../tools/bundleTool.js';
import { kdebugEnable } from '../lib/kdebug.js';
import { insistStorageAPI } from '../lib/storageAPI.js';
import { initializeKernel } from './initializeKernel.js';
import {
  makeWorkerBundleHandler,
  makeXsnapBundleData,
} from './bundle-handler.js';

import '../types-ambient.js';

const trace = makeTracer('IniSwi', false);

/**
 * @param {X[]} xs
 * @param {Y[]} ys
 * @returns {[X, Y][]}
 * @template X, Y
 */
const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]]);
const { keys, values, fromEntries } = Object;
/**
 * @param {Record<string, Promise<V>>} obj
 * @returns {Promise<Record<string, V>>}
 * @template V
 */
const allValues = async obj => {
  const vs = await Promise.all(values(obj));
  return fromEntries(zip(keys(obj), vs));
};

const bundleRelative = async rel =>
  bundleSource(new URL(rel, import.meta.url).pathname);

/**
 * Build the source bundles for the kernel. makeSwingsetController()
 * calls this on each launch, to get the
 * current kernel sources
 */
export async function buildKernelBundle() {
  // this takes about 1.0s on my computer
  const kernelBundle = await bundleRelative('../kernel/kernel.js');
  return harden(kernelBundle);
}

/**
 * Build the source bundles for built-in vats and devices, and for the
 * xsnap vat worker.
 */
export async function buildVatAndDeviceBundles() {
  const bundles = await allValues({
    adminDevice: bundleRelative('../devices/vat-admin/device-vat-admin.js'),
    adminVat: bundleRelative('../vats/vat-admin/vat-vat-admin.js'),
    comms: bundleRelative('../vats/comms/index.js'),
    vattp: bundleRelative('../vats/vattp/vat-vattp.js'),
    timer: bundleRelative('../vats/timer/vat-timer.js'),
  });

  return harden(bundles);
}

// Unit tests can call this to amortize the bundling costs: pass the
// result to initializeSwingset's initializationOptions.kernelBundles
// (for the vat/device/worker bundles), and you can pass .kernelBundle
// individually to makeSwingsetController's
// runtimeOptions.kernelBundle

// Tests can also pass the whole result to buildVatController's
// runtimeOptions.kernelBundles, which will pass it through to both.

export async function buildKernelBundles() {
  trace('buildKernelBundles');
  const bp = buildVatAndDeviceBundles();
  const kp = buildKernelBundle();
  const [vdBundles, kernelBundle] = await Promise.all([bp, kp]);
  return harden({ kernel: kernelBundle, ...vdBundles });
}

/**
 * Scan a directory for files defining the vats to bootstrap for a swingset, and
 * produce a swingset config object for what was found there.  Looks for files
 * with names of the pattern `vat-NAME.js` as well as a file named
 * 'bootstrap.js'.
 *
 * @param {string} basedir  The directory to scan
 * @param {object} [options]
 * @param {boolean} [options.includeDevDependencies] whether to include devDependencies
 * @param {BundleFormat} [options.bundleFormat] the bundle format to use
 * @returns {SwingSetConfig} a swingset config object: {
 *   bootstrap: "bootstrap",
 *   vats: {
 *     NAME: {
 *       sourceSpec: PATHSTRING
 *     }
 *   }
 * }
 *
 * Where NAME is the name of the vat; `sourceSpec` contains the path to the vat with that name.  Note that
 * the `bootstrap` property names the vat that should be used as the bootstrap vat.  Although a swingset
 * configuration can designate any vat as its bootstrap vat, `loadBasedir` will always look for a file named
 * 'bootstrap.js' and use that (note that if there is no 'bootstrap.js', there will be no bootstrap vat).
 *
 * Swingsets defined by scanning a directory in this manner define no devices.
 */
export function loadBasedir(basedir, options = {}) {
  const { includeDevDependencies = false, bundleFormat = undefined } = options;
  /** @type { SwingSetConfigDescriptor } */
  const vats = {};
  const rVatName = /^vat-(.*)\.js$/s;
  const files = fs.readdirSync(basedir, { withFileTypes: true });
  const vatFiles = files.flatMap(dirent => {
    const file = dirent.name;
    const m = rVatName.exec(file);
    return m && dirent.isFile() ? [{ file, label: m[1] }] : [];
  });
  // eslint-disable-next-line no-shadow,no-nested-ternary
  vatFiles.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
  for (const { file, label } of vatFiles) {
    const vatSourcePath = path.resolve(basedir, file);
    vats[label] = { sourceSpec: vatSourcePath, parameters: {} };
  }
  /** @type {string | void} */
  let bootstrapPath = path.resolve(basedir, 'bootstrap.js');
  try {
    fs.statSync(bootstrapPath);
  } catch (e) {
    // TODO this will catch the case of the file not existing but doesn't check
    // that it's a plain file and not a directory or something else unreadable.
    // Consider putting in a more sophisticated check if this whole directory
    // scanning thing is something we decide we want to have long term.
    bootstrapPath = undefined;
  }
  const config = { vats, includeDevDependencies, format: bundleFormat };
  if (bootstrapPath) {
    vats.bootstrap = {
      sourceSpec: bootstrapPath,
      parameters: {},
    };
    config.bootstrap = 'bootstrap';
  }
  return config;
}

/**
 * Resolve a pathname found in a config descriptor.  First try to resolve it as
 * a module path, and then if that doesn't work try to resolve it as an
 * ordinary path relative to the directory in which the config file was found.
 *
 * @param {string} referrer  URL of file or directory containing the config file
 * @param {string} specPath  Path found in a `sourceSpec` or `bundleSpec` property
 *
 * @returns {Promise<string>} the absolute path corresponding to `specPath` if it can be
 *    determined.
 */
async function resolveSpecFromConfig(referrer, specPath) {
  await null;
  try {
    return new URL(await resolveModuleSpecifier(specPath, referrer)).pathname;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e;
    }
  }
  return new URL(specPath, referrer).pathname;
}

/**
 * Convert each entry in a config descriptor group (`vats`/`bundles`/etc.) to
 * normal form: resolve each pathname to a context-insensitive absolute path and
 * run any other appropriate fixup.
 *
 * @param {SwingSetConfig} config
 * @param {'vats' | 'bundles' | 'devices'} groupName
 * @param {string | undefined} configPath of the containing config file
 * @param {string} referrer URL
 * @param {(entry: SwingSetConfigProperties, name?: string) => void} [fixupEntry]
 *   A function to call on each entry to e.g. add defaults for missing fields
 *   such as vat `parameters`.
 */
async function normalizeConfigDescriptor(
  config,
  groupName,
  configPath,
  referrer,
  fixupEntry,
) {
  const normalizeSpec = async (entry, specKey, name) => {
    const sourcePath = await resolveSpecFromConfig(referrer, entry[specKey]);
    fs.existsSync(sourcePath) ||
      Fail`${sourcePath} for ${b(groupName)}[${name}].${b(specKey)} in ${configPath} config file does not exist`;
    entry[specKey] = sourcePath;
  };

  const jobs = [];
  const desc = config[groupName];
  if (desc) {
    for (const [name, entry] of Object.entries(desc)) {
      fixupEntry?.(entry, name);
      if ('sourceSpec' in entry) {
        jobs.push(normalizeSpec(entry, 'sourceSpec', name));
      }
      if ('bundleSpec' in entry) {
        jobs.push(normalizeSpec(entry, 'bundleSpec', name));
      }
    }
  }
  return Promise.all(jobs);
}

/**
 * @param {SwingSetConfig} config
 * @param {string} [configPath]
 * @returns {Promise<void>}
 * @throws {Error} if the config is invalid
 */
export async function normalizeConfig(config, configPath) {
  const base = `file://${process.cwd()}/`;
  const referrer = configPath
    ? new URL(configPath, base).href
    : new URL(base).href;
  const fixupVat = vat => (vat.parameters ||= {});
  await Promise.all([
    normalizeConfigDescriptor(config, 'vats', configPath, referrer, fixupVat),
    normalizeConfigDescriptor(config, 'bundles', configPath, referrer),
    // TODO: represent devices
    // normalizeConfigDescriptor(config, 'devices', configPath, referrer),
  ]);
  config.bootstrap ||
    Fail`no designated bootstrap vat in ${configPath} config file`;
  (config.vats && config.vats[/** @type {string} */ (config.bootstrap)]) ||
    Fail`bootstrap vat ${config.bootstrap} not found in ${configPath} config file`;
}

/**
 * Read and normalize a swingset config file.
 *
 * @param {string} configPath
 * @returns {Promise<SwingSetConfig | null>} the normalized config,
 *   or null if the file did not exist
 */
export async function loadSwingsetConfigFile(configPath) {
  await null;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    await normalizeConfig(config, configPath);
    return config;
  } catch (e) {
    console.error(`failed to load ${configPath}`);
    if (e.code === 'ENOENT') {
      return null;
    } else {
      throw e;
    }
  }
}

export function swingsetIsInitialized(kernelStorage) {
  return !!(
    kernelStorage.kvStore.get('version') ||
    kernelStorage.kvStore.get('initialized')
  );
}

/**
 * @param {Record<string, any>} obj
 * @param {(string|undefined)[]} [firsts]
 * @returns {Record<string, any>}
 */
function sortObjectProperties(obj, firsts = []) {
  const sorted = [...firsts, ...Object.keys(obj).sort()];
  const result = {};
  for (const prop of sorted) {
    if (prop && !Object.hasOwn(result, prop) && Object.hasOwn(obj, prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
}

/**
 * @typedef {{ kernelBundles?: Record<string, Bundle>, verbose?: boolean,
 *              addVatAdmin?: boolean, addComms?: boolean, addVattp?: boolean,
 *              addTimer?: boolean,
 *            }} InitializationOptions
 */

/**
 * @param {SwingSetConfig} config
 * @param {unknown} bootstrapArgs
 * @param {SwingStoreKernelStorage} kernelStorage
 * @param {InitializationOptions} initializationOptions
 * @param {{ env?: Record<string, string | undefined >,
 *           bundleHandler?: import('./bundle-handler.js').BundleHandler,
 *         }} runtimeOptions
 * @returns {Promise<string | undefined>} KPID of the bootstrap message result promise
 */
export async function initializeSwingset(
  config,
  bootstrapArgs,
  kernelStorage,
  initializationOptions = {},
  runtimeOptions = {},
) {
  const kvStore = kernelStorage.kvStore;
  insistStorageAPI(kvStore);
  !swingsetIsInitialized(kernelStorage) ||
    Fail`kernel store already initialized`;
  const {
    bundleHandler = makeWorkerBundleHandler(
      kernelStorage.bundleStore,
      makeXsnapBundleData(),
    ),
  } = runtimeOptions;

  // copy config so we can safely mess with it even if it's shared or hardened
  config = deepCopyJsonable(config);
  if (!config.bundles) {
    config.bundles = {};
  }
  if (!config.vats) {
    config.vats = {};
  }
  if (!config.devices) {
    config.devices = {};
  }

  // Use ambient process.env only if caller did not specify.
  const { env: { SWINGSET_WORKER_TYPE } = process.env } = runtimeOptions;

  // The worker/manager type used by each vat is controlled by a
  // hierarchy of settings.
  //
  // * config.vats.NAME.creationOptions.managerType (highest priority, but
  //                                                 only for static vats)
  // * config.defaultManagerType (applies to both static and dynamic vats)
  // * env.SWINGSET_WORKER_TYPE
  // * use a 'local' worker (lowest priority)
  //
  // The environment variable allows us to run a batch of unit tests
  // under a different worker (e.g. 'yarn test:xs'), without editing
  // all their config records individually. `config.defaultManagerType`
  // has a higher priority so that tests which require a specific
  // worker (e.g. which exercise XS heap snapshots, or metering) can
  // override the env var, so they won't break under `yarn test:xs`.

  if (!config.defaultManagerType) {
    config.defaultManagerType = /** @type {any} */ (
      SWINGSET_WORKER_TYPE || 'local'
    );
  }
  if (config.defaultManagerType === 'xs-worker') {
    // 'xs-worker' is an alias accepted for now
    config.defaultManagerType = 'xsnap'; // but 'xsnap' is preferred
  }
  mustMatch(config.defaultManagerType, ManagerType);

  const obtainKernelBundles = async () =>
    initializationOptions.kernelBundles || buildVatAndDeviceBundles();
  const kernelBundles = await obtainKernelBundles();
  const {
    verbose,
    addVatAdmin = true,
    addComms = true,
    addVattp = true,
    addTimer = true,
  } = initializationOptions;

  if (config.bootstrap && bootstrapArgs) {
    const bootConfig = config.vats[config.bootstrap];
    if (bootConfig) {
      if (!bootConfig.parameters) {
        bootConfig.parameters = {};
      }
      bootConfig.parameters.argv = bootstrapArgs;
    }
  }

  if (addVatAdmin) {
    // vatAdmin and bundle devices are given endowments by the kernel itself
    config.vats.vatAdmin = {
      bundle: kernelBundles.adminVat,
    };
    config.devices.vatAdmin = {
      bundle: kernelBundles.adminDevice,
    };
  }

  if (addComms) {
    // comms vat is added automatically, but TODO: bootstraps must still
    // connect it to vat-tp. TODO: test-message-patterns builds two comms and
    // two vattps, must handle somehow.
    config.vats.comms = {
      bundle: kernelBundles.comms,
      creationOptions: {
        enablePipelining: true,
        // The use of setup rather than buildRootObject requires
        // a local worker. We have no plans to support setup on
        // non-local workers any time soon.
        enableSetup: true,
        managerType: 'local',
        useTranscript: false,
        neverReap: true,
      },
    };
  }

  if (addVattp) {
    // vat-tp is added automatically, but TODO: bootstraps must still connect
    // it to comms
    config.vats.vattp = {
      bundle: kernelBundles.vattp,
    };
  }

  if (addTimer) {
    // timer wrapper vat is added automatically, but TODO: bootstraps must
    // still provide a timer device, and connect it to the wrapper vat
    config.vats.timer = {
      bundle: kernelBundles.timer,
    };
  }

  const bundleCache = await (config.bundleCachePath
    ? provideBundleCache(
        config.bundleCachePath,
        { dev: config.includeDevDependencies, format: config.bundleFormat },
        async s => import(s),
      )
    : null);

  /**
   * The host application gives us
   * config.[vats|devices].NAME.[bundle|bundleSpec|sourceSpec|bundleName] .
   * The 'bundleName' option points into
   * config.bundles.BUNDLENAME.[bundle|bundleSpec|sourceSpec] , which can
   * also include arbitrary named bundles that will be made available to
   * E(vatAdminService).getNamedBundleCap(bundleName) ,and temporarily as
   * E(vatAdminService).createVatByName(bundleName)
   *
   * The 'kconfig' we pass through to initializeKernel has
   * kconfig.[vats|devices].NAME.bundleID and
   * kconfig.namedBundleIDs.BUNDLENAME=bundleID , which both point into
   * kconfig.idToBundle.BUNDLEID=bundle
   *
   * @param {SwingSetConfigProperties | { bundleName: string }} desc
   * @param {Record<string, *>} [nameToBundle]
   */
  async function getBundle(desc, nameToBundle) {
    trace(
      'getBundle',
      Object.keys(desc),
      // @ts-expect-error optional
      desc.moduleFormat,
      // @ts-expect-error optional
      desc.endoZipBase64Sha512 || desc.sourceSpec,
    );

    // shape validated by caller
    if ('bundle' in desc) {
      return desc.bundle;
    } else if ('bundleSpec' in desc) {
      return JSON.parse(fs.readFileSync(desc.bundleSpec).toString());
    } else if ('sourceSpec' in desc) {
      if (bundleCache) {
        return bundleCache.load(desc.sourceSpec);
      }
      return bundleSource(desc.sourceSpec, {
        dev: config.includeDevDependencies,
        format: config.bundleFormat,
      });
    } else if ('bundleName' in desc) {
      if (!nameToBundle) {
        throw Fail`cannot use .bundleName in config.bundles`;
      }
      const bundle = nameToBundle[desc.bundleName];
      bundle || Fail`unknown bundleName ${desc.bundleName}`;
      return bundle;
    }
    throw Error(`unknown mode in desc`, desc);
  }

  // fires with BundleWithID: { ...bundle, id }
  /**
   * @param {EndoZipBase64Bundle & {id?: string}} bundle
   * @returns {Promise<EndoZipBase64Bundle & {id: string}>} bundle
   */
  async function addBundleID(bundle) {
    if ('id' in bundle) {
      // during config, we believe bundle.id, but not at runtime!
      // @ts-expect-error cast
      return bundle;
    }
    const { endoZipBase64Sha512 } = bundle;
    assert.typeof(endoZipBase64Sha512, 'string');
    return {
      ...bundle,
      id: `b1-${endoZipBase64Sha512}`,
    };
  }

  // fires with BundleWithID: { ...bundle, id }

  /**
   *
   * @param {(SwingSetConfigProperties | { bundleName: string }) & {bundleID?: string }} desc
   * @param {Record<string, EndoZipBase64Bundle>} [nameToBundle]
   */
  async function processDesc(desc, nameToBundle) {
    const allModes = /** @type {const} */ ([
      'bundle',
      'bundleSpec',
      'sourceSpec',
      'bundleName',
    ]);
    const modes = allModes.filter(mode => mode in desc);
    modes.length === 1 ||
      Fail`need =1 of bundle/bundleSpec/sourceSpec/bundleName, got ${modes}`;
    const mode = modes[0];
    return getBundle(desc, nameToBundle)
      .then(addBundleID)
      .then(bundleWithID => {
        // replace original .sourceSpec/etc with a uniform .bundleID
        delete desc[mode];
        desc.bundleID = bundleWithID.id;
        return bundleWithID;
      });
  }

  /**
   * @param {string} groupName
   * @param {Record<string, EndoZipBase64Bundle>} [nameToBundle]
   */
  async function processGroup(groupName, nameToBundle) {
    const group = config[groupName] || {};
    const names = Object.keys(group).sort();
    const processP = names.map(async name =>
      processDesc(group[name], nameToBundle).catch(err => {
        throw Error(`config.${groupName}.${name}: ${err.message}`);
      }),
    );
    const bundlesWithID = await Promise.all(processP);
    /** @type {Record<string, EndoZipBase64Bundle & { id: string }>} */
    const newNameToBundle = {};
    /** @type {Record<string, EndoZipBase64Bundle & { id: string }>} */
    const idToBundle = {};
    for (let i = 0; i < names.length; i += 1) {
      const name = names[i];
      const bundle = bundlesWithID[i];
      const id = bundle.id;
      newNameToBundle[name] = bundle;
      idToBundle[id] = bundle;
    }
    return [newNameToBundle, idToBundle];
  }

  // for each config.bundles.NAME, do whatever bundling/reading is necessary
  // to get a bundle and bundleID, and return both the name->bundleID record
  // (to populate config.namedBundles) and the bundleID->bundle record (to
  // install the actual bundles)

  config.bundles = sortObjectProperties(config.bundles);
  config.vats = sortObjectProperties(config.vats, [
    config.bootstrap,
    'vatAdmin',
    'comms',
    'vattp',
    'timer',
  ]);
  config.devices = sortObjectProperties(config.devices);
  const [nameToBundle, idToNamedBundle] = await processGroup('bundles');
  const [_1, idToVatBundle] = await processGroup('vats', nameToBundle);
  const [_2, idToDeviceBundle] = await processGroup('devices', nameToBundle);
  /** @type { SwingSetKernelConfig } */
  const kconfig = {
    ...config,
    namedBundleIDs: {},
    idToBundle: sortObjectProperties({
      ...idToNamedBundle,
      ...idToVatBundle,
      ...idToDeviceBundle,
    }),
  };
  for (const name of Object.keys(nameToBundle)) {
    kconfig.namedBundleIDs[name] = nameToBundle[name].id;
  }
  delete kconfig.bundles;

  if (verbose) {
    kdebugEnable(true);
  }

  const kopts = { bundleHandler };
  // returns the kpid of the bootstrap() result
  const bootKpid = await initializeKernel(kconfig, kernelStorage, kopts);
  return bootKpid;
}
