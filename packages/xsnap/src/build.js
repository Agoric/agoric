#!/usr/bin/env node
/* eslint-env node */
import * as childProcessTop from 'child_process';
import { fileURLToPath } from 'url';
import fsTop from 'fs';
import osTop from 'os';

const { freeze } = Object;

/** @param {string} path */
const asset = path => fileURLToPath(new URL(path, import.meta.url));

/** @param {Promise<unknown>} p */
const isRejected = p =>
  p.then(
    () => false,
    () => true,
  );

/** @typedef {{ path: string, make?: string }} ModdablePlatform */

const ModdableSDK = {
  MODDABLE: asset('../moddable'),
  /** @type { Record<string, ModdablePlatform>} */
  platforms: {
    Linux: { path: 'lin' },
    Darwin: { path: 'mac' },
    Windows_NT: { path: 'win', make: 'nmake' },
  },
  buildGoals: ['release', 'debug'],
};

/**
 * Create promise-returning functions for asynchronous execution of no-input
 * commands.
 *
 * @param {string} command
 * @param {{
 *   spawn: typeof import('child_process').spawn,
 * }} io
 */
function makeCLI(command, { spawn }) {
  /** @param {import('child_process').ChildProcess} child */
  const wait = child =>
    new Promise((resolve, reject) => {
      child.on('close', () => {
        resolve(undefined);
      });
      child.on('error', err => {
        reject(Error(`${command} error ${err}`));
      });
      child.on('exit', code => {
        if (code !== 0) {
          reject(Error(`${command} exited with code ${code}`));
        }
      });
    });

  return freeze({
    /**
     * Run the command, writing directly to stdout and stderr.
     *
     * @param {string[]} args
     * @param {{ cwd?: string }} [opts]
     */
    run: (args, opts) => {
      const { cwd = '.' } = opts || {};
      const child = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'inherit', 'inherit'],
      });
      return wait(child);
    },
    /**
     * Run the command, writing directly to stderr but capturing and returning
     * stdout.
     *
     * @param {string[]} args
     * @param {{ cwd?: string, fullOutput?: boolean }} [opts]
     * @returns {Promise<string>} command output, stripped of trailing
     *   whitespace unless option "fullOutput" is true
     */
    pipe: async (args, opts) => {
      const { cwd = '.', fullOutput = false } = opts || {};
      const child = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      const chunks = [];
      child.stdout.on('data', chunk => chunks.push(chunk));
      await wait(child);
      const output = Buffer.concat(chunks).toString('utf8');
      return fullOutput ? output : output.trimEnd();
    },
  });
}

/**
 * @param {string} path
 * @param {string} repoUrl
 * @param {{ git: ReturnType<typeof makeCLI> }} io
 */
const makeSubmodule = (path, repoUrl, { git }) => {
  return freeze({
    path,
    clone: async () => git.run(['clone', repoUrl, path]),
    /** @param {string} commitHash */
    checkout: async commitHash =>
      git.run(['checkout', commitHash], { cwd: path }),
    init: async () => git.run(['submodule', 'update', '--init', '--checkout']),
    status: async () => {
      const line = await git.pipe(['submodule', 'status', path]);
      // From `git submodule --help`:
      // status [--cached] [--recursive] [--] [<path>...]
      //     Show the status of the submodules. This will print the SHA-1 of the
      //     currently checked out commit for each submodule, along with the
      //     submodule path and the output of git describe for the SHA-1. Each
      //     SHA-1 will possibly be prefixed with - if the submodule is not
      //     initialized, + if the currently checked out submodule commit does
      //     not match the SHA-1 found in the index of the containing repository
      //     and U if the submodule has merge conflicts.
      //
      // We discovered that in other cases, the prefix is a single space.
      const prefix = line[0];
      const [hash, statusPath, ...describe] = line.slice(1).split(' ');
      return {
        prefix,
        hash,
        path: statusPath,
        describe: describe.join(' '),
      };
    },
    /**
     * Read a specific configuration value for this submodule (e.g., "path" or
     * "url") from the top-level .gitmodules.
     *
     * @param {string} leaf
     */
    config: async leaf => {
      // git rev-parse --show-toplevel
      const repoRoot = await git.pipe(['rev-parse', '--show-toplevel']);
      if (!path.startsWith(`${repoRoot}/`)) {
        throw Error(
          `Expected submodule path ${path} to be a subdirectory of repository ${repoRoot}`,
        );
      }
      const relativePath = path.slice(repoRoot.length + 1);
      // git config -f ../../.gitmodules --get submodule.${relativePath}.${leaf}
      const value = await git.pipe([
        'config',
        '-f',
        `${repoRoot}/.gitmodules`,
        '--get',
        `submodule.${relativePath}.${leaf}`,
      ]);
      return value;
    },
  });
};

/**
 * @typedef {{
 *   url: string,
 *   path: string,
 *   commitHash?: string,
 *   envPrefix: string,
 * }} SubmoduleDescriptor
 */

/**
 * @param {SubmoduleDescriptor[]} submodules
 * @param {{
 *   git: ReturnType<typeof makeCLI>,
 *   stdout: typeof process.stdout,
 * }} io
 */
const showEnv = async (submodules, { git, stdout }) => {
  await null;
  for (const desc of submodules) {
    const { path, envPrefix } = desc;
    let { url, commitHash } = desc;
    if (!commitHash) {
      // We need to glean the commitHash and url from Git.
      const submodule = makeSubmodule(path, '?', { git });
      const [{ hash }, gitUrl] = await Promise.all([
        submodule.status(),
        submodule.config('url'),
      ]);
      commitHash = hash;
      url = gitUrl;
    }
    stdout.write(`${envPrefix}URL=${url}\n`);
    stdout.write(`${envPrefix}COMMIT_HASH=${commitHash}\n`);
  }
};

/**
 * @param {SubmoduleDescriptor[]} submodules
 * @param {{
 *   fs: Pick<typeof import('fs'), 'existsSync' | 'rmdirSync'>,
 *   git: ReturnType<typeof makeCLI>,
 * }} io
 */
const updateSubmodules = async (submodules, { fs, git }) => {
  await null;
  for (const { url, path, commitHash } of submodules) {
    const submodule = makeSubmodule(path, url, { git });

    if (!commitHash) {
      await submodule.init();
    } else {
      // Do the moral equivalent of submodule update when explicitly overriding.
      try {
        fs.rmdirSync(submodule.path);
      } catch (_e) {
        // ignore
      }
      if (!fs.existsSync(submodule.path)) {
        await submodule.clone();
      }
      await submodule.checkout(commitHash);
    }
  }
};

/**
 * @param {ModdablePlatform} platform
 * @param {boolean} force
 * @param {{
 *   fs: Pick<typeof import('fs'), 'existsSync'> &
 *     Pick<typeof import('fs').promises, 'readFile' | 'writeFile'>,
 *   make: ReturnType<typeof makeCLI>,
 * }} io
 */
const buildXsnap = async (platform, force, { fs, make }) => {
  const pjson = await fs.readFile(asset('../package.json'), 'utf-8');
  const pkg = JSON.parse(pjson);

  const configEnvs = [
    `XSNAP_VERSION=${pkg.version}`,
    `CC=cc "-D__has_builtin(x)=1"`,
  ];

  const configEnvFile = asset('../build.config.env');
  const existingConfigEnvs = fs.existsSync(configEnvFile)
    ? await fs.readFile(configEnvFile, 'utf-8')
    : '';

  const expectedConfigEnvs = configEnvs.concat('').join('\n');
  if (force || existingConfigEnvs.trim() !== expectedConfigEnvs.trim()) {
    await fs.writeFile(configEnvFile, expectedConfigEnvs);
  }

  for (const goal of ModdableSDK.buildGoals) {
    await make.run(
      [
        `MODDABLE=${ModdableSDK.MODDABLE}`,
        `GOAL=${goal}`,
        // Any other configuration variables that affect the build output
        // should be placed in `configEnvs` to force a rebuild if they change
        ...configEnvs,
        `EXTRA_DEPS=${configEnvFile}`,
        '-f',
        'xsnap-worker.mk',
      ],
      {
        cwd: `xsnap-native/xsnap/makefiles/${platform.path}`,
      },
    );
  }
};

/**
 * @param {string[]} args
 * @param {{
 *   env: Record<string, string | undefined>,
 *   stdout: typeof process.stdout,
 *   spawn: typeof import('child_process').spawn,
 *   fs: Pick<typeof import('fs'), 'existsSync' | 'rmdirSync'> &
 *     Pick<typeof import('fs').promises, 'readFile' | 'writeFile'>,
 *   os: Pick<typeof import('os'), 'type'>,
 * }} io
 */
async function main(args, { env, stdout, spawn, fs, os }) {
  // I solemnly swear I will do no synchronous work followed by a variable
  // number turns of the event loop.
  await null;

  const osType = os.type();
  const platform = ModdableSDK.platforms[osType];
  if (!platform) {
    throw Error(`xsnap does not support OS ${osType}`);
  }

  const git = makeCLI('git', { spawn });
  const make = makeCLI(platform.make || 'make', { spawn });

  // When changing/adding entries here, make sure to search the whole project
  // for `@@AGORIC_DOCKER_SUBMODULES@@`
  const submodules = [
    {
      url: env.MODDABLE_URL || 'https://github.com/agoric-labs/moddable.git',
      path: ModdableSDK.MODDABLE,
      commitHash: env.MODDABLE_COMMIT_HASH,
      envPrefix: 'MODDABLE_',
    },
    {
      url:
        env.XSNAP_NATIVE_URL || 'https://github.com/agoric-labs/xsnap-pub.git',
      path: asset('../xsnap-native'),
      commitHash: env.XSNAP_NATIVE_COMMIT_HASH,
      envPrefix: 'XSNAP_NATIVE_',
    },
  ];

  // We build both release and debug executables, so checking for only the
  // former is fine.
  // XXX This will need to account for the .exe extension if we recover support
  // for Windows.
  const bin = asset(
    `../xsnap-native/xsnap/build/bin/${platform.path}/release/xsnap-worker`,
  );
  const hasBin = fs.existsSync(bin);
  const hasSource = fs.existsSync(asset('../moddable/xs/includes/xs.h'));
  const hasGit = fs.existsSync(asset('../moddable/.git'));

  // If a git submodule is present or source files and prebuilt executables are
  // both absent, consider ourselves to be in an active git checkout (as opposed
  // to e.g. an extracted npm tarball).
  const isWorkingCopy = hasGit || (!hasSource && !hasBin);

  // --show-env reports submodule status without making changes.
  if (args.includes('--show-env')) {
    if (!isWorkingCopy) {
      throw Error('XSnap requires a working copy and git to --show-env');
    }
    await showEnv(submodules, { git, stdout });
    return;
  }

  // Fetch/update source files via `git submodule` as appropriate.
  if (isWorkingCopy) {
    await updateSubmodules(submodules, { fs, git });
  }

  // If we now have source files, (re)build from them.
  // Otherwise, require presence of a previously-built executable.
  if (hasSource || isWorkingCopy) {
    // Force a rebuild if for some reason the binary is out of date
    // since the make checks may not always detect that situation.
    const npm = makeCLI('npm', { spawn });
    const force = await (!hasBin ||
      isRejected(
        npm.run(['run', '-s', 'check-version'], { cwd: asset('..') }),
      ));
    await buildXsnap(platform, force, { fs, make });
  } else if (!hasBin) {
    throw Error(
      'XSnap has neither sources nor a pre-built binary. Docker? .dockerignore? npm files?',
    );
  }
}

const run = () =>
  main(process.argv.slice(2), {
    env: { ...process.env },
    stdout: process.stdout,
    spawn: childProcessTop.spawn,
    fs: {
      existsSync: fsTop.existsSync,
      rmdirSync: fsTop.rmdirSync,
      readFile: fsTop.promises.readFile,
      writeFile: fsTop.promises.writeFile,
    },
    os: {
      type: osTop.type,
    },
  });

process.exitCode = 1;
run().then(
  () => {
    process.exitCode = 0;
  },
  err => {
    console.error('Failed with', err);
    process.exit(process.exitCode || 1);
  },
);
