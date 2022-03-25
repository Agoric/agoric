/* global process */
// @ts-check
import fs from 'fs';
import path from 'path';

import { resolve as resolveModuleSpecifier } from 'import-meta-resolve';
import { assert, details as X } from '@agoric/assert';
import bundleSource from '@endo/bundle-source';

import '../types-ambient.js';
import { insistStorageAPI } from '../lib/storageAPI.js';
import { initializeKernel } from './initializeKernel.js';
import { kdebugEnable } from '../lib/kdebug.js';

/**
 * @template X, Y
 * @param {X[]} xs
 * @param {Y[]} ys
 * @returns {[X, Y][]}
 */
const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]]);
const { keys, values, fromEntries } = Object;
/**
 * @template V
 * @param {Record<string, Promise<V>>} obj
 * @returns {Promise<Record<string, V>>}
 */
const allValues = async obj =>
  fromEntries(zip(keys(obj), await Promise.all(values(obj))));

/**
 * Build the source bundles for the kernel and xsnap vat worker.
 *
 * @param {Object} [options]
 * @param {ModuleFormat} [options.bundleFormat]
 */
export async function buildKernelBundles(options = {}) {
  // this takes 2.7s on my computer

  const { bundleFormat = undefined } = options;

  const src = rel =>
    bundleSource(new URL(rel, import.meta.url).pathname, {
      format: bundleFormat,
    });
  const srcGE = rel =>
    bundleSource(new URL(rel, import.meta.url).pathname, {
      format: 'getExport',
    });

  const bundles = await allValues({
    kernel: src('../kernel/kernel.js'),
    adminDevice: src('../devices/vat-admin/device-vat-admin.js'),
    adminVat: src('../vats/vat-admin/vat-vat-admin.js'),
    comms: src('../vats/comms/index.js'),
    vattp: src('../vats/vattp/vat-vattp.js'),
    timer: src('../vats/timer/vat-timer.js'),

    lockdown: srcGE(
      '../supervisors/subprocess-xsnap/lockdown-subprocess-xsnap.js',
    ),
    supervisor: srcGE(
      '../supervisors/subprocess-xsnap/supervisor-subprocess-xsnap.js',
    ),
  });

  return harden(bundles);
}

function byName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

/**
 * Scan a directory for files defining the vats to bootstrap for a swingset, and
 * produce a swingset config object for what was found there. Looks for files
 * with names of the pattern `vat-NAME.js` as well as a file named 'bootstrap.js'.
 *
 * @param {string} basedir The directory to scan
 * @param {Object} [options]
 * @param {boolean} [options.includeDevDependencies] Whether to include devDependencies
 * @param {ModuleFormat} [options.bundleFormat] The bundle format to use
 * @returns {SwingSetConfig} A swingset config object: { bootstrap: "bootstrap",
 *   vats: { NAME: { sourceSpec: PATHSTRING } } }
 *
 *   Where NAME is the name of the vat; `sourceSpec` contains the path to the vat
 *   with that name. Note that the `bootstrap` property names the vat that
 *   should be used as the bootstrap vat. Although a swingset configuration can
 *   designate any vat as its bootstrap vat, `loadBasedir` will always look for
 *   a file named 'bootstrap.js' and use that (note that if there is no
 *   'bootstrap.js', there will be no bootstrap vat).
 *
 *   Swingsets defined by scanning a directory in this manner define no devices.
 */
export function loadBasedir(basedir, options = {}) {
  const { includeDevDependencies = false, bundleFormat = undefined } = options;
  /** @type {SwingSetConfigDescriptor} */
  const vats = {};
  const subs = fs.readdirSync(basedir, { withFileTypes: true });
  subs.sort(byName);
  subs.forEach(dirent => {
    if (
      dirent.name.startsWith('vat-') &&
      dirent.name.endsWith('.js') &&
      dirent.isFile()
    ) {
      const name = dirent.name.slice('vat-'.length, -'.js'.length);
      const vatSourcePath = path.resolve(basedir, dirent.name);
      vats[name] = { sourceSpec: vatSourcePath, parameters: {} };
    }
  });
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
 * Resolve a pathname found in a config descriptor. First try to resolve it as a
 * module path, and then if that doesn't work try to resolve it as an ordinary
 * path relative to the directory in which the config file was found.
 *
 * @param {string} referrer URL of file or directory containing the config file
 * @param {string} specPath Path found in a `sourceSpec` or `bundleSpec` property
 * @returns {Promise<string>} The absolute path corresponding to `specPath` if
 *   it can be determined.
 */
async function resolveSpecFromConfig(referrer, specPath) {
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
 * For each entry in a config descriptor (i.e, `vats`, `bundles`, etc), convert
 * it to normal form: resolve each pathname to a context-insensitive absolute
 * path and make sure it has a `parameters` property if it's supposed to.
 *
 * @param {SwingSetConfigDescriptor | void} desc The config descriptor to be normalized.
 * @param {string} referrer The pathname of the file or directory in which the
 *   config file was found
 * @param {boolean} expectParameters `true` if the entries should have
 *   parameters (for example, `true` for `vats` but `false` for bundles).
 */
async function normalizeConfigDescriptor(desc, referrer, expectParameters) {
  const normalizeSpec = async (entry, key) => {
    return resolveSpecFromConfig(referrer, entry[key]).then(spec => {
      entry[key] = spec;
    });
  };

  const jobs = [];
  if (desc) {
    for (const name of Object.keys(desc)) {
      const entry = desc[name];
      if ('sourceSpec' in entry) {
        jobs.push(normalizeSpec(entry, 'sourceSpec'));
      }
      if ('bundleSpec' in entry) {
        jobs.push(normalizeSpec(entry, 'bundleSpec'));
      }
      if (expectParameters && !entry.parameters) {
        entry.parameters = {};
      }
    }
  }
  return Promise.all(jobs);
}

/**
 * Read and parse a swingset config file and return it in normalized form.
 *
 * @param {string} configPath Path to the config file to be processed
 * @returns {Promise<SwingSetConfig | null>} The contained config object, in
 *   normalized form, or null if the requested config file did not exist.
 * @throws {Error} If the file existed but was inaccessible, malformed, or
 *   otherwise invalid.
 */
export async function loadSwingsetConfigFile(configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const referrer = new URL(
      configPath,
      `file:///${process.cwd()}/`,
    ).toString();
    await normalizeConfigDescriptor(config.vats, referrer, true);
    await normalizeConfigDescriptor(config.bundles, referrer, false);
    // await normalizeConfigDescriptor(config.devices, referrer, true); // TODO: represent devices
    assert(config.bootstrap, X`no designated bootstrap vat in ${configPath}`);
    assert(
      config.vats && config.vats[config.bootstrap],
      X`bootstrap vat ${config.bootstrap} not found in ${configPath}`,
    );
    return config;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    } else {
      throw e;
    }
  }
}

export function swingsetIsInitialized(hostStorage) {
  return !!hostStorage.kvStore.get('initialized');
}

/**
 * @typedef {{
 *   kernelBundles?: Record<string, string>;
 *   verbose?: boolean;
 *   addVatAdmin?: boolean;
 *   addComms?: boolean;
 *   addVattp?: boolean;
 *   addTimer?: boolean;
 * }} InitializationOptions
 */

/**
 * @param {SwingSetConfig} config
 * @param {string[]} argv
 * @param {HostStore} hostStorage
 * @param {InitializationOptions} initializationOptions
 * @param {{ env?: Record<string, string | undefined> }} runtimeOptions
 */
export async function initializeSwingset(
  config,
  argv = [],
  hostStorage,
  initializationOptions = {},
  runtimeOptions = {},
) {
  const kvStore = hostStorage.kvStore;
  insistStorageAPI(kvStore);

  assert(
    !swingsetIsInitialized(hostStorage),
    X`kernel store already initialized`,
  );

  // copy config so we can safely mess with it even if it's shared or hardened
  config = JSON.parse(JSON.stringify(config));
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

  // Override the worker type if specified by the caller, to avoid having to
  // edit the config just to run everything under a different manager.
  const defaultManagerType = SWINGSET_WORKER_TYPE || config.defaultManagerType;
  switch (defaultManagerType) {
    case 'local':
    case 'nodeWorker':
    case 'node-subprocess':
    case 'xs-worker':
    case 'xs-worker-no-gc':
      config.defaultManagerType = defaultManagerType;
      break;
    case undefined:
      config.defaultManagerType = 'local';
      break;
    default:
      assert.fail(X`unknown manager type ${defaultManagerType}`);
  }

  const {
    kernelBundles = await buildKernelBundles({
      bundleFormat: config.bundleFormat,
    }),
    verbose,
    addVatAdmin = true,
    addComms = true,
    addVattp = true,
    addTimer = true,
  } = initializationOptions;

  kvStore.set('kernelBundle', JSON.stringify(kernelBundles.kernel));
  kvStore.set('lockdownBundle', JSON.stringify(kernelBundles.lockdown));
  kvStore.set('supervisorBundle', JSON.stringify(kernelBundles.supervisor));

  if (config.bootstrap && argv) {
    const bootConfig = config.vats[config.bootstrap];
    if (bootConfig) {
      if (!bootConfig.parameters) {
        bootConfig.parameters = {};
      }
      bootConfig.parameters.argv = argv;
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
        reapInterval: 'never',
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

  // The host application gives us
  // config.[vats|devices].NAME.[bundle|bundleSpec|sourceSpec|bundleName] .
  // The 'bundleName' option points into
  // config.bundles.BUNDLENAME.[bundle|bundleSpec|sourceSpec] , which can
  // also include arbitrary named bundles that will be made available to
  // E(vatAdminService).getNamedBundleCap(bundleName) ,and temporarily as
  // E(vatAdminService).createVatByName(bundleName)

  // The 'kconfig' we pass through to initializeKernel has
  // kconfig.[vats|devices].NAME.bundleID and
  // kconfig.namedBundleIDs.BUNDLENAME=bundleID , which both point into
  // kconfig.idToBundle.BUNDLEID=bundle

  async function getBundle(desc, mode, nameToBundle) {
    if (mode === 'bundle') {
      return desc.bundle;
    } else if (mode === 'bundleSpec') {
      return JSON.parse(fs.readFileSync(desc.bundleSpec).toString());
    } else if (mode === 'sourceSpec') {
      return bundleSource(desc.sourceSpec, {
        dev: config.includeDevDependencies,
        format: config.bundleFormat,
      });
    } else if (mode === 'bundleName') {
      assert(nameToBundle, `cannot use .bundleName in config.bundles`);
      const bundle = nameToBundle[desc.bundleName];
      assert(bundle, `unknown bundleName ${desc.bundleName}`);
      return bundle;
    }
    throw Error(`unknown mode ${mode}`);
  }

  // fires with BundleWithID: { ...bundle, id }
  async function addBundleID(bundle) {
    if (bundle.id) {
      // during config, we believe bundle.id, but not at runtime!
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
  async function processDesc(desc, nameToBundle) {
    const allModes = ['bundle', 'bundleSpec', 'sourceSpec', 'bundleName'];
    const modes = allModes.filter(mode => mode in desc);
    assert(
      modes.length === 1,
      `need =1 of bundle/bundleSpec/sourceSpec/bundleName, got ${modes}`,
    );
    const mode = modes[0];
    return getBundle(desc, mode, nameToBundle)
      .then(addBundleID)
      .then(bundleWithID => {
        // replace original .sourceSpec/etc with a uniform .bundleID
        delete desc[mode];
        desc.bundleID = bundleWithID.id;
        return bundleWithID;
      });
  }

  async function processGroup(groupName, nameToBundle) {
    const group = config[groupName] || {};
    const names = Array.from(Object.keys(group));
    const processP = names.map(name =>
      processDesc(group[name], nameToBundle).catch(err => {
        throw Error(`config.${groupName}.${name}: ${err.message}`);
      }),
    );
    const bundlesWithID = await Promise.all(processP);
    const newNameToBundle = {};
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

  const [nameToBundle, idToNamedBundle] = await processGroup('bundles');
  const [_1, idToVatBundle] = await processGroup('vats', nameToBundle);
  const [_2, idToDeviceBundle] = await processGroup('devices', nameToBundle);
  /** @type {SwingSetKernelConfig} */
  const kconfig = {
    ...config,
    namedBundleIDs: {},
    idToBundle: {
      ...idToNamedBundle,
      ...idToVatBundle,
      ...idToDeviceBundle,
    },
  };
  for (const name of Object.keys(nameToBundle)) {
    kconfig.namedBundleIDs[name] = nameToBundle[name].id;
  }
  delete kconfig.bundles;

  if (verbose) {
    kdebugEnable(true);
  }
  return initializeKernel(kconfig, hostStorage);
}
