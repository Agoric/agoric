// @ts-check
import '@agoric/swingset-liveslots/tools/prepare-test-env.js';

import anyTest from 'ava';
import { spawn as ambientSpawn } from 'child_process';
import { promises as fsPromises } from 'fs';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import path from 'path';

import { extractCoreProposalBundles } from '@agoric/deploy-script-support/src/extract-proposal.js';
import { mustMatch } from '@agoric/store';
import { loadSwingsetConfigFile, shape as ssShape } from '@agoric/swingset-vat';
import { provideBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';

const importConfig = async configName =>
  importMetaResolve(`@agoric/vm-config/${configName}`, import.meta.url).then(
    u => new URL(u).pathname,
  );

const test =
  /** @type {import('ava').TestFn<Awaited<ReturnType<typeof makeTestContext>>>}} */ (
    anyTest
  );

const PROD_CONFIG_FILES = [
  'decentral-main-vaults-config.json',
  'decentral-itest-vaults-config.json',
];

const CONFIG_FILES = [
  'decentral-core-config.json', // TODO: remove mints from core-config
  'decentral-demo-config.json',
  'decentral-devnet-config.json',
  ...PROD_CONFIG_FILES,
];

const NON_UPGRADEABLE_VATS = ['pegasus', 'mints'];

/**
 * @param {string} bin
 * @param {{ spawn: typeof import('child_process').spawn }} io
 */
export const pspawn =
  (bin, { spawn }) =>
  (args = [], opts = {}) => {
    /** @type {ReturnType<typeof import('child_process').spawn> | undefined} */
    let child;
    const exit = new Promise((resolve, reject) => {
      // console.debug('spawn', bin, args, { cwd: makefileDir, ...opts });
      child = spawn(bin, args, opts);
      child.addListener('exit', code => {
        if (code !== 0) {
          reject(Error(`exit ${code} from: ${bin} ${args}`));
          return;
        }
        resolve(0);
      });
    });
    return { child: child || assert.fail(), exit };
  };

//#region NOTE: confine ambient authority to test.before
const makeTestContext = async () => {
  const pathname = new URL(import.meta.url).pathname;
  const dirname = path.dirname(pathname);
  const pathResolve = (...ps) => path.join(dirname, ...ps);

  const cacheDir = pathResolve('..', 'bundles');
  const bundleCache = await provideBundleCache(
    cacheDir,
    {},
    async s => import(s),
  );

  const vizTool = pathResolve('..', 'tools', 'authorityViz.js');
  const runViz = pspawn(vizTool, { spawn: ambientSpawn });

  return {
    bundleCache,
    cacheDir,
    pathResolve,
    basename: path.basename,
    runViz,
  };
};

test.before(async t => {
  t.context = await makeTestContext();
});
//#endregion

test('Bootstrap SwingSet config file syntax', async t => {
  await Promise.all(
    CONFIG_FILES.map(async f => {
      const txt = await fsPromises.readFile(await importConfig(f), 'utf-8');
      const config = harden(JSON.parse(txt));
      t.notThrows(() => mustMatch(config, ssShape.SwingSetConfig), f);
    }),
  );
});

const noLog = () => {};

const hashCode = s => {
  let hash = 0;
  let i;
  let chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i += 1) {
    chr = s.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const checkBundle = async (t, sourceSpec, seen, name, configSpec) => {
  const { bundleCache, basename } = t.context;

  const targetName = `${hashCode(sourceSpec)}-${basename(sourceSpec, '.js')}`;

  // t.log('checking bundle path', name, spec.sourceSpec);
  for (const vatName of NON_UPGRADEABLE_VATS) {
    if (targetName.includes(vatName)) {
      t.fail(`${configSpec} bundle ${sourceSpec} not upgradeable`);
    }
  }

  if (!seen.has(targetName)) {
    seen.add(targetName);

    t.log(configSpec, ': check bundle:', name, basename(sourceSpec));
    await bundleCache.load(sourceSpec, targetName, noLog);
    const meta = await bundleCache.validate(targetName);
    t.truthy(meta, name);

    for (const item of meta.contents) {
      if (item.relativePath.includes('magic-cookie-test-only')) {
        t.fail(`${configSpec} bundle ${name}: ${item.relativePath}`);
      }
    }
  }
};

test('no test-only code is in production configs', async t => {
  const { entries } = Object;

  const seen = new Set();

  for await (const configSpec of PROD_CONFIG_FILES) {
    t.log('checking config', configSpec);
    const fullPath = await importConfig(configSpec);
    const config = await loadSwingsetConfigFile(fullPath);
    if (!config) throw t.truthy(config, configSpec); // if/throw refines type
    const { bundles } = config;
    if (!bundles) throw t.truthy(bundles, configSpec);

    for await (const [name, spec] of entries(bundles)) {
      if (!('sourceSpec' in spec)) throw t.fail();

      await checkBundle(t, spec.sourceSpec, seen, name, configSpec);
    }
  }
});

test('no test-only code is in production proposals', async t => {
  const seen = new Set();

  for await (const configSpec of PROD_CONFIG_FILES) {
    t.log('checking config', configSpec);
    const getProposals = async () => {
      const fullPath = await importConfig(configSpec);
      const config = await loadSwingsetConfigFile(fullPath);
      if (!config) throw t.truthy(config, configSpec); // if/throw refines type
      const { coreProposals } = /** @type {any} */ (config);
      return coreProposals || [];
    };

    const coreProposals = await getProposals();
    const { bundles } = await extractCoreProposalBundles(coreProposals);

    const { entries } = Object;
    for await (const [name, spec] of entries(bundles)) {
      await checkBundle(t, spec.sourceSpec, seen, name, configSpec);
    }
  }
});

test('bootstrap permit visualization snapshot', async t => {
  const { runViz } = t.context;

  const cmd = runViz(['@agoric/vm-config/decentral-itest-vaults-config.json']);
  const output = async () => {
    const parts = [];
    cmd.child.stdout?.on('data', chunk => parts.push(chunk));
    await cmd.exit;
    return parts.join('');
  };
  const diagram = await output();
  t.snapshot(diagram);
});
