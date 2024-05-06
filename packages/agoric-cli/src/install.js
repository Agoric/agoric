/* global process Buffer */
import path from 'path';
import chalk from 'chalk';
import { makePspawn } from './helpers.js';
import DEFAULT_SDK_PACKAGE_NAMES from './sdk-package-names.js';

const REQUIRED_AGORIC_START_PACKAGES = [
  '@agoric/solo',
  '@agoric/cosmic-swingset',
];

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

export default async function installMain(progname, rawArgs, powers, opts) {
  const { anylogger, fs, spawn } = powers;
  const log = anylogger('agoric:install');

  const forceSdkVersion = !!rawArgs[1];

  // Notify the preinstall guard that we are running.
  process.env.AGORIC_INSTALL = 'true';

  // Node 16 requires this to be set for C++ addons to compile.
  if (process.env.CXXFLAGS === undefined) {
    process.env.CXXFLAGS = '-std=c++14';
  }

  const pspawn = makePspawn({ log, spawn, chalk });

  async function getWorktreePackagePaths(cwd = '.', map = new Map()) {
    // TODO use Arborist like get-sdk-package-names.js does
    // run `yarn workspaces info` to get the list of directories to
    // use, instead of a hard-coded list
    const p = pspawn('yarn', ['workspaces', '--silent', 'info'], {
      cwd,
      stdio: ['inherit', 'pipe', 'inherit'],
    });
    const stdout = [];
    p.childProcess.stdout.on('data', out => stdout.push(out));
    await p;
    const d = JSON.parse(Buffer.concat(stdout).toString('utf-8'));
    for (const [name, { location }] of Object.entries(d)) {
      map.set(name, path.resolve(cwd, location));
    }
    return map;
  }

  let subdirs;
  const workTrees = ['.'];
  let sdkWorktree;
  /** @type {Map<string, string>} */
  const sdkPackageToPath = new Map();

  const yarnInstallEachWorktree = async (phase, ...flags) => {
    for await (const workTree of workTrees) {
      log.info(`yarn install ${phase} in ${workTree}`);
      const yarnInstall = await pspawn('yarn', ['install', ...flags], {
        stdio: 'inherit',
        cwd: workTree,
      });
      if (yarnInstall) {
        throw Error(`yarn install ${phase} failed in ${workTree}`);
      }
    }
  };

  /**
   * @param {boolean} forceVersion
   */
  const updateSdkVersion = async forceVersion => {
    // Prune the old version (removing potentially stale on-disk and yarn.lock
    // packages), and update on-disk and yarn.lock packages to the new version.
    // This is the most efficient way to fetch `forceVersion` fresh from the NPM
    // registry, in case it has changed (dist-tags are wont to point to
    // different packages over time).
    const addPackagesTodo = [];
    const prunePackagesTodo = [];

    await Promise.all(
      subdirs.map(async subdir => {
        // Prune, then update all the SDK package versions.
        const pjson = `${subdir}/package.json`;
        const packageJSON = await fs
          .readFile(pjson, 'utf-8')
          .catch(_ => undefined);
        if (!packageJSON) {
          return;
        }
        const updatedPackageDescriptor = JSON.parse(packageJSON);
        const prunedPackageDescriptor = { ...updatedPackageDescriptor };
        let needsPruning = false;
        for (const depSection of ['dependencies', 'devDependencies']) {
          const updatedDeps = updatedPackageDescriptor[depSection];
          if (updatedDeps) {
            const prunedDeps = { ...updatedDeps };
            prunedPackageDescriptor[depSection] = prunedDeps;
            for (const pkg of Object.keys(updatedDeps)) {
              if (sdkPackageToPath.has(pkg)) {
                if (updatedDeps[pkg] === forceVersion) {
                  // We need to remove the old package and `yarn install` to
                  // prune the old dependencies both from disk and also the
                  // `yarn.lock`.  Only after that can we write the new deps and
                  // run `yarn install` again to update disk and `yarn.lock`.
                  delete prunedDeps[pkg];
                  needsPruning = true;
                }
                updatedDeps[pkg] = forceVersion;
              }
            }
          }
        }
        // Ensure the top-level package has the `agoric start` dependencies.
        if (subdir === '.') {
          for (const pkg of REQUIRED_AGORIC_START_PACKAGES) {
            const updatedDevDeps =
              updatedPackageDescriptor.devDependencies || {};
            if (!updatedDevDeps[pkg]) {
              updatedDevDeps[pkg] = forceVersion;
              updatedPackageDescriptor.devDependencies = updatedDevDeps;
            }
          }
        }

        // Ensure we update the package.json before exiting.
        const updatePackageJson = async () => {
          // Don't update on exit anymore.
          // eslint-disable-next-line no-use-before-define
          process.off('beforeExit', updatePackageJsonOnExit);
          log.info(`updating ${pjson}`);
          await fs.writeFile(
            pjson,
            `${JSON.stringify(updatedPackageDescriptor, null, 2)}\n`,
          );
        };
        const updatePackageJsonOnExit = () => {
          // Prevent unhandled rejections.
          updatePackageJson().catch(e =>
            log.error(`Cannot update ${pjson}:`, e),
          );
        };
        addPackagesTodo.push(updatePackageJson);
        if (needsPruning) {
          prunePackagesTodo.push(async () => {
            // Update on exit, in case we are interrupted.
            process.on('beforeExit', updatePackageJsonOnExit);
            // Remove the old packages.
            log.info(`pruning ${pjson}`);
            await fs.writeFile(
              pjson,
              `${JSON.stringify(prunedPackageDescriptor, null, 2)}\n`,
            );
          });
        }
      }),
    );

    let prunedP;
    if (prunePackagesTodo.length) {
      // Run all the package+yarn.lock removal tasks in parallel.
      prunedP = Promise.allSettled(
        prunePackagesTodo.map(async prune => prune()),
      )
        .then(results => {
          // After all have settled, throw any errors.
          const failures = results.filter(
            ({ status }) => status !== 'fulfilled',
          );
          if (failures.length) {
            throw AggregateError(
              failures.map(({ reason }) => reason),
              'Failed to prune',
            );
          }
        })
        .then(async () =>
          yarnInstallEachWorktree('pruning', '--ignore-scripts'),
        );
    } else {
      // Nothing to prune, so just skip this step.
      prunedP = Promise.resolve();
    }

    // Ensure we do all the package.json+yarn.lock additions after any necessary
    // pruning, even if there are failures.
    await prunedP.finally(() =>
      // Ensure the package.jsons are installed with the fresh version information.
      Promise.allSettled(addPackagesTodo.map(async update => update())),
    );
  };

  const dappPackageJSON = await fs
    .readFile(`package.json`, 'utf-8')
    .then(data => JSON.parse(data))
    .catch(err => {
      log('error reading', `package.json`, err);
      throw err;
    });
  if (dappPackageJSON.useWorkspaces) {
    const workdirs = await getWorktreePackagePaths().then(pp => [
      ...pp.values(),
    ]);
    sdkWorktree = workdirs.find(subd => subd === 'agoric-sdk');
    subdirs = ['.', ...workdirs.filter(subd => subd !== 'agoric-sdk')];

    // Add 'ui' directory by default, if it exists.
    if (!subdirs.find(subd => subd === 'ui')) {
      const uiPackageJSON = await fs.readFile(`ui/package.json`, 'utf-8').then(
        data => JSON.parse(data),
        _err => ({}),
      );
      if (uiPackageJSON.name) {
        subdirs.push('ui');
        workTrees.push('ui');
      }
    }
  } else {
    const subdirPackageJsonExists = async subd => {
      const exists = await fs.stat(`${subd}/package.json`).catch(_ => false);
      return exists && subd;
    };
    const existingSubdirs = await Promise.all(
      ['.', '_agstate/agoric-servers', 'contract', 'api', 'ui']
        .sort()
        .map(subdirPackageJsonExists),
    );
    subdirs = existingSubdirs.filter(subd => subd);
  }

  if (opts.sdk) {
    const sdkRoot = path.resolve(dirname, `../../..`);
    await getWorktreePackagePaths(sdkRoot, sdkPackageToPath);

    // Link the SDK.
    if (sdkWorktree) {
      await fs.unlink(sdkWorktree).catch(_ => {});
      await fs.symlink(sdkRoot, sdkWorktree);
    }

    const removeNodeModulesSymlinks = async subdir => {
      const nm = `${subdir}/node_modules`;
      log(chalk.bold.green(`removing ${nm} link`));
      await fs.unlink(nm).catch(_ => {});

      // Remove all the package links.
      // This is needed to prevent yarn errors when installing new versions of
      // linked modules (like `@agoric/zoe`).
      await Promise.all(
        [...sdkPackageToPath.keys()].map(async pjName =>
          fs.unlink(`${nm}/${pjName}`).catch(_ => {}),
        ),
      );
    };
    await Promise.all(subdirs.map(removeNodeModulesSymlinks));
  } else {
    for (const name of DEFAULT_SDK_PACKAGE_NAMES) {
      sdkPackageToPath.set(name, null);
    }
  }

  if (forceSdkVersion !== undefined) {
    // We need to update the SDK version in the package.jsons and `yarn.lock`.
    await updateSdkVersion(forceSdkVersion);
  }

  await yarnInstallEachWorktree('updates');

  if (sdkWorktree || !opts.sdk) {
    log.info(chalk.bold.green('Done installing without SDK links'));
    return 0;
  }

  // Create symlinks to the SDK packages.
  await Promise.all(
    [...sdkPackageToPath.entries()].map(async ([pjName, dir]) => {
      await pspawn('yarn', ['unlink', pjName]);
      return pspawn('yarn', ['link'], {
        stdio: 'inherit',
        cwd: dir,
      });
    }),
  );

  const sdkPackages = [...sdkPackageToPath.keys()].sort();
  for await (const subdir of subdirs) {
    const exists = await fs.stat(`${subdir}/package.json`).catch(_ => false);
    const exitStatus = await (exists &&
      pspawn('yarn', ['link', ...sdkPackages], {
        stdio: 'inherit',
        cwd: subdir,
      }));
    if (exitStatus) {
      log.error('Cannot yarn link', ...sdkPackages);
      return 1;
    }
  }

  log.info(chalk.bold.green('Done installing with SDK links'));
  return 0;
}
