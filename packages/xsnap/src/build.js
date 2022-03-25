#!/usr/bin/env node
/* global process */
// @ts-check
import * as childProcessTop from 'child_process';
import fsTop from 'fs';
import osTop from 'os';

const { freeze } = Object;

/** @param {string} path */
const asset = path => new URL(path, import.meta.url).pathname;

const ModdableSDK = {
  MODDABLE: asset('../moddable'),
  /** @type {Record<string, { path: string; make?: string }>} */
  platforms: {
    Linux: { path: 'lin' },
    Darwin: { path: 'mac' },
    Windows_NT: { path: 'win', make: 'nmake' },
  },
  buildGoals: ['release', 'debug'],
};

/**
 * Adapt spawn to Promises style.
 *
 * @param {string} command
 * @param {{
 *   spawn: typeof import('child_process').spawn;
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
        reject(new Error(`${command} error ${err}`));
      });
      child.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`${command} exited with code ${code}`));
        }
      });
    });

  return freeze({
    /**
     * @param {string[]} args
     * @param {{ cwd?: string }} [opts]
     */
    run: (args, opts) => {
      const { cwd = '.' } = opts || {};
      const child = spawn(command, args, {
        cwd,
        stdio: ['inherit', 'inherit', 'inherit'],
      });
      return wait(child);
    },
    /**
     * @param {string[]} args
     * @param {{ cwd?: string }} [opts]
     */
    pipe: (args, opts) => {
      const { cwd = '.' } = opts || {};
      const child = spawn(command, args, {
        cwd,
        stdio: ['inherit', 'pipe', 'inherit'],
      });
      let output = '';
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', data => {
        output += data.toString();
      });
      return wait(child).then(() => output);
    },
  });
}

/**
 * @param {string} path
 * @param {string} repoUrl
 * @param {{ git: ReturnType<typeof makeCLI> }} io
 */
const makeSubmodule = (path, repoUrl, { git }) => {
  /** @param {string} text */
  const parseStatus = text =>
    text
      .split('\n')
      // From `git submodule --help`:
      // Show the status of the submodules. This will print the SHA-1 of the
      // currently checked out commit for each submodule, along with the
      // submodule path and the output of git describe for the SHA-1. Each
      // SHA-1 will possibly be prefixed with - if the submodule is not
      // initialized, + if the currently checked out submodule commit does
      // not match the SHA-1 found in the index of the containing repository
      // and U if the submodule has merge conflicts.
      //
      // We discovered that in other cases, the prefix is a single space.
      .map(line => [line[0], ...line.slice(1).split(' ', 3)])
      .map(([prefix, hash, statusPath, describe]) => ({
        prefix,
        hash,
        path: statusPath,
        describe,
      }));

  return freeze({
    path,
    clone: async () => git.run(['clone', repoUrl, path]),
    /** @param {string} commitHash */
    checkout: async commitHash =>
      git.run(['checkout', commitHash], { cwd: path }),
    init: async () => git.run(['submodule', 'update', '--init', '--checkout']),
    status: async () =>
      git.pipe(['submodule', 'status', path]).then(parseStatus),
    /** @param {string} leaf */
    config: async leaf => {
      // git rev-parse --show-toplevel
      const top = await git
        .pipe(['rev-parse', '--show-toplevel'])
        .then(l => l.trimEnd());
      // assume full paths
      const name = path.slice(top.length + 1);
      // git config -f ../../.gitmodules --get submodule."$name".url
      const value = await git
        .pipe([
          'config',
          '-f',
          `${top}/.gitmodules`,
          '--get',
          `submodule.${name}.${leaf}`,
        ])
        .then(l => l.trimEnd());
      return value;
    },
  });
};

/**
 * @param {string[]} args
 * @param {{
 *   env: Record<string, string | undefined>;
 *   stdout: typeof process.stdout;
 *   spawn: typeof import('child_process').spawn;
 *   fs: {
 *     existsSync: typeof import('fs').existsSync;
 *     readFile: typeof import('fs').promises.readFile;
 *   };
 *   os: {
 *     type: typeof import('os').type;
 *   };
 * }} io
 */
async function main(args, { env, stdout, spawn, fs, os }) {
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

  if (args.includes('--show-env')) {
    for (const submodule of submodules) {
      const { path, envPrefix, commitHash } = submodule;
      if (!commitHash) {
        // We need to glean the commitHash and url from Git.
        const sm = makeSubmodule(path, '?', { git });
        // eslint-disable-next-line no-await-in-loop
        const [[{ hash }], url] = await Promise.all([
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
      if (!fs.existsSync(submodule.path)) {
        // eslint-disable-next-line no-await-in-loop
        await submodule.clone();
      }
      // eslint-disable-next-line no-await-in-loop
      await submodule.checkout(commitHash);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await submodule.init();
    }
  }

  const pjson = await fs.readFile(asset('../package.json'), 'utf-8');
  const pkg = JSON.parse(pjson);

  const platform = ModdableSDK.platforms[os.type()];
  if (!platform) {
    throw new Error(`Unsupported OS found: ${os.type()}`);
  }

  const make = makeCLI(platform.make || 'make', { spawn });
  for (const goal of ModdableSDK.buildGoals) {
    // eslint-disable-next-line no-await-in-loop
    await make.run(
      [
        `MODDABLE=${ModdableSDK.MODDABLE}`,
        `GOAL=${goal}`,
        `XSNAP_VERSION=${pkg.version}`,
        '-f',
        'xsnap-worker.mk',
      ],
      {
        cwd: `xsnap-native/xsnap/makefiles/${platform.path}`,
      },
    );
  }
}

main(process.argv.slice(2), {
  env: { ...process.env },
  stdout: process.stdout,
  spawn: childProcessTop.spawn,
  fs: {
    readFile: fsTop.promises.readFile,
    existsSync: fsTop.existsSync,
  },
  os: {
    type: osTop.type,
  },
}).catch(e => {
  console.error(e);
  process.exit(1);
});
