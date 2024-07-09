#!/usr/bin/env node
/* eslint-env node */
import * as childProcessTop from 'child_process';
import { fileURLToPath } from 'url';
import fsTop from 'fs';
import osTop from 'os';

const { freeze } = Object;

/** @param {string} path */
const asset = path => fileURLToPath(new URL(path, import.meta.url));

const ModdableSDK = {
  MODDABLE: asset('../moddable'),
  /** @type { Record<string, { path: string, make?: string }>} */
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
 * @param {boolean} showEnv
 * @param {{
 *   env: Record<string, string | undefined>,
 *   stdout: typeof process.stdout,
 *   spawn: typeof import('child_process').spawn,
 *   fs: {
 *     existsSync: typeof import('fs').existsSync,
 *     rmdirSync: typeof import('fs').rmdirSync,
 *     readFile: typeof import('fs').promises.readFile,
 *   },
 * }} io
 */
const updateSubmodules = async (showEnv, { env, stdout, spawn, fs }) => {
  const git = makeCLI('git', { spawn });

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

  await null;
  if (showEnv) {
    for (const submodule of submodules) {
      const { path, envPrefix, commitHash } = submodule;
      if (!commitHash) {
        // We need to glean the commitHash and url from Git.
        const sm = makeSubmodule(path, '?', { git });
        const [{ hash }, url] = await Promise.all([
          sm.status(),
          sm.config('url'),
        ]);
        submodule.commitHash = hash;
        submodule.url = url;
      }
      stdout.write(`${envPrefix}URL=${submodule.url}\n`);
      stdout.write(`${envPrefix}COMMIT_HASH=${submodule.commitHash}\n`);
    }
    return;
  }

  for (const { url, path, commitHash } of submodules) {
    const submodule = makeSubmodule(path, url, { git });

    // Allow overriding of the checked-out version of the submodule.
    if (commitHash) {
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
    } else {
      await submodule.init();
    }
  }
};

/**
 * @param {{
 *   spawn: typeof import('child_process').spawn,
 *   fs: {
 *     existsSync: typeof import('fs').existsSync,
 *     rmdirSync: typeof import('fs').rmdirSync,
 *     readFile: typeof import('fs').promises.readFile,
 *     writeFile: typeof import('fs').promises.writeFile,
 *   },
 *   os: {
 *     type: typeof import('os').type,
 *   }
 * }} io
 * @param {object} [options]
 * @param {boolean} [options.forceBuild]
 */
const makeXsnap = async ({ spawn, fs, os }, { forceBuild = false } = {}) => {
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
  if (forceBuild || existingConfigEnvs.trim() !== expectedConfigEnvs.trim()) {
    await fs.writeFile(configEnvFile, expectedConfigEnvs);
  }

  const platform = ModdableSDK.platforms[os.type()];
  if (!platform) {
    throw Error(`Unsupported OS found: ${os.type()}`);
  }

  const make = makeCLI(platform.make || 'make', { spawn });
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
 *   fs: {
 *     existsSync: typeof import('fs').existsSync,
 *     rmdirSync: typeof import('fs').rmdirSync,
 *     readFile: typeof import('fs').promises.readFile,
 *     writeFile: typeof import('fs').promises.writeFile,
 *   },
 *   os: {
 *     type: typeof import('os').type,
 *   }
 * }} io
 */
async function main(args, { env, stdout, spawn, fs, os }) {
  // I solemnly swear I will do no synchronous work followed by a variable
  // number turns of the event loop.
  await null;

  const osType = os.type();
  const platform = {
    Linux: 'lin',
    Darwin: 'mac',
    // Windows_NT: 'win', // One can dream.
  }[osType];
  if (platform === undefined) {
    throw Error(`xsnap does not support platform ${osType}`);
  }

  // If this is a working copy of xsnap in a checkout of agoric-sdk, we need to
  // either clone or update submodules.
  // Otherwise, we are running from an extracted npm tarball and we should not
  // attempt to update Git submodules and should make the binary from the
  // published source.
  //
  // These steps will avoid rebuilding native xsnap in the common case for end
  // users.
  //
  //                    ||      | X    || git
  //                    || X    | X    || make
  //                    || ---- | ---- || ----
  // | bin | src | .git || pack | work ||
  // | --- | --- | ---- || ---- | ---- ||
  // |     |     |      ||      | X    ||
  // |     |     | X    ||      |      ||
  // |     | X   |      || X    |      ||
  // |     | X   | X    ||      | X    ||
  // | X   |     |      ||      |      ||
  // | X   |     | X    ||      |      ||
  // | X   | X   |      || X    |      ||
  // | X   | X   | X    ||      | X    ||
  //
  // We build both release and debug, so checking for one should suffice.
  // XXX This will need to account for the .exe extension if we recover support
  // for Windows.
  const hasBin = fs.existsSync(
    asset(`../xsnap-native/xsnap/build/bin/${platform}/release/xsnap-worker`),
  );
  let hasSource = fs.existsSync(asset('../moddable/xs/includes/xs.h'));
  const hasGit = fs.existsSync(asset('../moddable/.git'));
  const isWorkingCopy = hasGit || (!hasSource && !hasBin);
  const showEnv = args.includes('--show-env');

  if (isWorkingCopy || showEnv) {
    if (showEnv && !isWorkingCopy) {
      throw Error('XSnap requires a working copy and git to --show-env');
    }
    await updateSubmodules(showEnv, { env, stdout, spawn, fs });
    hasSource = true;
  }

  if (!showEnv) {
    if (hasSource) {
      // Force a rebuild if for some reason the binary is out of date
      // Since the make checks may not always detect that situation
      let forceBuild = !hasBin;
      if (hasBin) {
        const npm = makeCLI('npm', { spawn });
        await npm
          .run(['run', '-s', 'check-version'], { cwd: asset('..') })
          .catch(() => {
            forceBuild = true;
          });
      }
      await makeXsnap({ spawn, fs, os }, { forceBuild });
    } else if (!hasBin) {
      throw Error(
        'XSnap has neither sources nor a pre-built binary. Docker? .dockerignore? npm files?',
      );
    }
  }
}

const run = () =>
  main(process.argv.slice(2), {
    env: { ...process.env },
    stdout: process.stdout,
    spawn: childProcessTop.spawn,
    fs: {
      readFile: fsTop.promises.readFile,
      writeFile: fsTop.promises.writeFile,
      existsSync: fsTop.existsSync,
      rmdirSync: fsTop.rmdirSync,
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
