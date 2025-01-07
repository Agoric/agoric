/* eslint-env node */
import chalk from 'chalk';
import { createHash } from 'crypto';
import path from 'path';
import { createRequire } from 'module';

import { Nat, isNat } from '@endo/nat';
import { untilTrue } from '@agoric/internal';

import {
  CENTRAL_DENOM,
  STAKING_DENOM,
  finishTendermintConfig,
  finishCosmosGenesis,
  finishCosmosApp,
} from './chain-config.js';

import { makePspawn, getSDKBinaries } from './helpers.js';

const require = createRequire(import.meta.url);

const terminalOnlyFlags = (...flags) => {
  if (process.stdout.isTTY && process.stdin.isTTY) {
    return flags;
  }
  return [];
};

const PROVISION_COINS = [
  `1000000000000000${STAKING_DENOM}`,
  `5000000000000000${CENTRAL_DENOM}`,
  `100provisionpass`,
  `100sendpacketpass`,
  `1000000000000ibc/toyatom`, // ATOM
  `1000000000000ibc/toyellie`, // AUSD
  `1000000000000ibc/toyusdc`, // USDC
  `1000000000000ibc/toyollie`, // USDT
].join(',');
const DELEGATE0_COINS = `50000000${STAKING_DENOM}`;
const SOLO_COINS = `13000000${STAKING_DENOM},500000000${CENTRAL_DENOM}`;
const CHAIN_ID = 'agoriclocal';

const SERVERS_ROOT_DIR = '_agstate/agoric-servers';
const FAKE_CHAIN_DELAY =
  process.env.FAKE_CHAIN_DELAY === undefined
    ? 0
    : Number(process.env.FAKE_CHAIN_DELAY);
const PORT = process.env.PORT || 8000;
const HOST_PORT = process.env.HOST_PORT || PORT;
const CHAIN_PORT = process.env.CHAIN_PORT || 26657;
const DEFAULT_NETCONFIG = 'https://testnet.agoric.net/network-config';

const GAS_ADJUSTMENT = '1.2';

/**
 * Resolve after a delay in milliseconds.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = async ms =>
  new Promise(resolve => setTimeout(() => resolve(), ms));

export default async function startMain(progname, rawArgs, powers, opts) {
  const { anylogger, fs, spawn, now, process } = powers;
  const log = anylogger('agoric:start');

  const SDK_IMAGE = `ghcr.io/agoric/agoric-sdk:${opts.dockerTag}`;
  const SOLO_IMAGE = `ghcr.io/agoric/cosmic-swingset-solo:${opts.dockerTag}`;

  const pspawnEnv = { ...process.env };
  if (opts.verbose > 1) {
    // Loudly verbose logs (nondeterministic).
    pspawnEnv.DEBUG = 'agoric:debug,SwingSet:vat,SwingSet:ls';
  } else if (opts.verbose) {
    // Verbose vat logs (nondeterministic).
    pspawnEnv.DEBUG = 'agoric:info,SwingSet:vat,SwingSet:ls';
  }

  const pspawn = makePspawn({ env: pspawnEnv, spawn, log, chalk });

  // Turn on some debugging options.
  const nodeDebugEnv = { ...pspawnEnv };
  if (opts.debug) {
    nodeDebugEnv.NODE_OPTIONS = '--inspect-brk';
    nodeDebugEnv.SWINGSET_WORKER_TYPE = 'local';
  }

  const sdkPrefixes = {};
  if (!opts.sdk) {
    const agoricPrefix = path.resolve(`node_modules/@agoric`);
    sdkPrefixes.goPfx = agoricPrefix;
    sdkPrefixes.jsPfx = agoricPrefix;
  }

  let keysSpawn;
  if (!opts.dockerTag) {
    const { cosmosHelper } = getSDKBinaries(sdkPrefixes);
    keysSpawn = async (args, ...rest) =>
      pspawn(cosmosHelper, [`--home=_agstate/keys`, ...args], ...rest);
  } else {
    keysSpawn = async (args, ...rest) =>
      pspawn(
        'docker',
        [
          'run',
          `--volume=${process.cwd()}:/usr/src/dapp`,
          `--rm`,
          ...terminalOnlyFlags(`-it`),
          `--entrypoint=agd`,
          SDK_IMAGE,
          `--home=/usr/src/dapp/_agstate/keys`,
          ...args,
        ],
        ...rest,
      );
  }

  // Translate {inspectBrk: brkOpt} into [`--inspect-brk=${brkOpt}`]
  const debugOpts = [];
  for (const [prop, value] of Object.entries(opts)) {
    if (prop.startsWith('inspect')) {
      const name = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (value === true) {
        debugOpts.push(`--${name}`);
      } else {
        debugOpts.push(`--${name}=${value}`);
      }
    }
  }

  const capture = (spawner, args, show = false) => {
    const statusOut = [
      spawner(args, { stdio: ['inherit', 'pipe', 'inherit'] }),
      '',
    ];
    statusOut[0].childProcess.stdout.on('data', chunk => {
      if (show) {
        process.stdout.write(chunk);
      }
      statusOut[1] += chunk.toString('utf-8');
    });
    return statusOut;
  };

  const showKey = keyName =>
    capture(keysSpawn, [
      'keys',
      'show',
      keyName,
      '-a',
      '--keyring-backend=test',
    ]);

  const exists = async file => {
    await null;
    try {
      await fs.stat(file);
      return true;
    } catch (e) {
      return false;
    }
  };

  const rmVerbose = async filePath => {
    log(chalk.green(`removing ${filePath}`));
    // rm is available on all the unix-likes, so use it for speed.
    await pspawn('rm', ['-rf', filePath]);
  };

  let agSolo;
  let agSoloBuild;
  if (opts.dockerTag) {
    agSolo = `ag-solo`;
  } else {
    ({ agSolo, agSoloBuild } = getSDKBinaries(sdkPrefixes));
  }

  async function startFakeChain(profileName, _startArgs, popts) {
    const fakeDelay =
      popts.delay === undefined ? FAKE_CHAIN_DELAY : Number(popts.delay);

    const serverDir = `${SERVERS_ROOT_DIR}/${profileName}`;

    await null;
    if (popts.reset) {
      await rmVerbose(serverDir);
    }

    if (!opts.dockerTag) {
      const soloExists = await exists('node_modules/@agoric/solo');
      if (!soloExists) {
        log.error(`you must first run '${progname} install'`);
        return 1;
      }
    }

    if (opts.pull || opts.rebuild) {
      if (!opts.dockerTag && agSoloBuild) {
        const exitStatus = await pspawn(agSoloBuild[0], agSoloBuild.slice(1));
        if (exitStatus) {
          return exitStatus;
        }
      }
    }

    const fakeGCI = 'sim-chain';
    const serverExists = await exists(serverDir);
    if (!serverExists) {
      log(chalk.yellow(`initializing ${profileName}`));
      await pspawn(
        agSolo,
        ['init', profileName, '--egresses=fake', `--webport=${HOST_PORT}`],
        {
          cwd: SERVERS_ROOT_DIR,
        },
      );
    }

    if (fakeDelay >= 0) {
      log(chalk.yellow(`setting sim chain with ${fakeDelay} second delay`));
      await pspawn(
        agSolo,
        ['set-fake-chain', `--delay=${fakeDelay}`, fakeGCI],
        {
          cwd: serverDir,
        },
      );
    }

    if (!popts.restart) {
      // Don't actually run the chain.
      return 0;
    }

    const ps = pspawn(agSolo, [...debugOpts, 'start'], {
      cwd: serverDir,
      env: nodeDebugEnv,
    });
    process.on('SIGINT', () => ps.childProcess.kill('SIGINT'));
    return ps;
  }

  async function startLocalChain(profileName, startArgs, popts) {
    const portNum = startArgs[0] === undefined ? CHAIN_PORT : startArgs[0];
    const portNumNat = isNat(Number(portNum)) ? Nat(Number(portNum)) : 0n;
    if (
      `${portNum}` !== `${portNumNat}` ||
      portNumNat <= 0 ||
      portNumNat > 0xffff
    ) {
      log.error(`Argument to local-chain must be a valid port number`);
      return 1;
    }

    const { cosmosChain, cosmosChainBuild } = getSDKBinaries(sdkPrefixes);
    await null;
    if (popts.pull || popts.rebuild) {
      if (popts.dockerTag) {
        const exitStatus = await pspawn('docker', ['pull', SDK_IMAGE]);
        if (exitStatus !== 0) {
          return exitStatus;
        }
      } else {
        const exitStatus = await pspawn(
          cosmosChainBuild[0],
          cosmosChainBuild.slice(1),
        );
        if (exitStatus !== 0) {
          return exitStatus;
        }
      }
    }

    const serverDir = `${SERVERS_ROOT_DIR}/${profileName}-${portNum}`;
    if (popts.reset) {
      await rmVerbose(serverDir);
    }

    /** @type {(args: string[], spawnOpts?: Parameters<typeof pspawn>[2], dockerArgs?: string[]) => ReturnType<pspawn>} */
    let chainSpawn;
    if (!popts.dockerTag) {
      chainSpawn = async (args, spawnOpts) =>
        pspawn(cosmosChain, [...args, `--home=${serverDir}`], spawnOpts);
    } else {
      chainSpawn = async (args, spawnOpts, dockerArgs = []) =>
        pspawn(
          'docker',
          [
            'run',
            `--volume=${process.cwd()}:/usr/src/dapp`,
            `--rm`,
            ...dockerArgs,
            ...terminalOnlyFlags(`-it`),
            SDK_IMAGE,
            ...args,
            `--home=/usr/src/dapp/${serverDir}`,
          ],
          spawnOpts,
        );
    }

    const serverExists = await exists(serverDir);
    if (!serverExists) {
      const exitStatus = await chainSpawn([
        'init',
        'local-chain',
        `--chain-id=${CHAIN_ID}`,
      ]);
      if (exitStatus) {
        return exitStatus;
      }
    }

    // Get or create the essential addresses.
    const addrs = {};
    for (const keyName of ['provision', 'delegate0']) {
      let statusOut = showKey(keyName);
      const exitStatusOut = await statusOut[0];
      if (exitStatusOut) {
        const exitStatus = await keysSpawn([
          'keys',
          'add',
          keyName,
          '--keyring-backend=test',
        ]);
        if (exitStatus) {
          return exitStatus;
        }
        statusOut = showKey(keyName);
        const status2 = await statusOut[0];
        if (status2) {
          return status2;
        }
      }
      addrs[keyName] = statusOut[1].trimRight();
    }

    const genesisFile = `${serverDir}/config/genesis.json`;
    const stampExists = await exists(`${genesisFile}.stamp`);
    if (!stampExists) {
      let exitStatus;
      exitStatus = await chainSpawn([
        'add-genesis-account',
        addrs.provision,
        PROVISION_COINS,
      ]);
      if (exitStatus) {
        return exitStatus;
      }
      exitStatus = await chainSpawn([
        'add-genesis-account',
        addrs.delegate0,
        DELEGATE0_COINS,
      ]);
      if (exitStatus) {
        return exitStatus;
      }

      const keysHome = opts.dockerTag
        ? `/usr/src/dapp/_agstate/keys`
        : `_agstate/keys`;
      exitStatus = await chainSpawn([
        'gentx',
        'delegate0',
        `--keyring-dir=${keysHome}`,
        '--keyring-backend=test',
        `--chain-id=${CHAIN_ID}`,
        DELEGATE0_COINS,
      ]);
      if (exitStatus) {
        return exitStatus;
      }
      exitStatus = await chainSpawn(['collect-gentxs']);
      if (exitStatus) {
        return exitStatus;
      }
      exitStatus = await chainSpawn(['validate-genesis']);
      if (exitStatus) {
        return exitStatus;
      }
      exitStatus = await fs.writeFile(`${genesisFile}.stamp`, `${now()}`);
      if (exitStatus) {
        return exitStatus;
      }
    }

    // Complete the genesis file and launch the chain.
    log('read ag-chain-cosmos config');
    const configFile = `${serverDir}/config/config.toml`;
    const appFile = `${serverDir}/config/app.toml`;
    const [genesisJson, configToml, appToml] = await Promise.all([
      fs.readFile(genesisFile, 'utf-8'),
      fs.readFile(configFile, 'utf-8'),
      fs.readFile(appFile, 'utf-8'),
    ]);
    const newGenesisJson = finishCosmosGenesis({
      genesisJson,
    });
    const newConfigToml = finishTendermintConfig({
      configToml,
      portNum,
    });
    const newAppToml = finishCosmosApp({
      appToml,
      portNum,
    });

    const create = (fileName, contents) => {
      log('create', fileName);
      return fs.writeFile(fileName, contents);
    };

    // Calculate the GCI for the updated genesis.json.
    const hashFile = `${genesisFile}.sha256`;
    const gci = createHash('sha256').update(newGenesisJson).digest('hex');

    // Save all the files to disk.
    await Promise.all([
      create(appFile, newAppToml),
      create(configFile, newConfigToml),
      create(genesisFile, newGenesisJson),
      create(hashFile, gci),
    ]);

    if (!popts.restart) {
      // Don't actually run the chain.
      return 0;
    }

    return chainSpawn(
      [...debugOpts, 'start'],
      {
        env: nodeDebugEnv,
      },
      // Accessible via either localhost or host.docker.internal
      [`--publish=127.0.0.1:${portNum}:${portNum}`, `--name=agoric-n0`],
    );
  }

  async function startLocalSolo(profileName, startArgs, popts) {
    const portNum = startArgs[0] === undefined ? PORT : startArgs[0];
    const provisionPowers = startArgs[1] === undefined ? [] : [startArgs[1]];
    const portNumNat = isNat(Number(portNum)) ? Nat(Number(portNum)) : 0n;
    if (
      `${portNum}` !== `${portNumNat}` ||
      portNumNat <= 0 ||
      portNumNat > 0xffff
    ) {
      log.error(`Argument to local-solo must be a valid port number`);
      return 1;
    }

    const serverDir = `${SERVERS_ROOT_DIR}/${profileName}-${portNum}`;

    const { cosmosClientBuild } = getSDKBinaries(sdkPrefixes);
    await null;
    if (popts.pull || popts.rebuild) {
      if (popts.dockerTag) {
        const exitStatus = await pspawn('docker', ['pull', SDK_IMAGE]);
        if (exitStatus !== 0) {
          return exitStatus;
        }
      } else {
        const exitStatus = await pspawn(
          cosmosClientBuild[0],
          cosmosClientBuild.slice(1),
        );
        if (exitStatus !== 0) {
          return exitStatus;
        }
      }
    }

    if (popts.dockerTag && popts.pull) {
      const exitStatus = await pspawn('docker', ['pull', SDK_IMAGE]);
      if (exitStatus) {
        return exitStatus;
      }
    }

    if (popts.reset) {
      await rmVerbose(serverDir);
    }

    /** @type {(args: string[], spawnOpts?: Parameters<typeof pspawn>[2], dockerArgs?: string[]) => ReturnType<pspawn>} */
    let soloSpawn;
    if (!popts.dockerTag) {
      soloSpawn = async (args, spawnOpts) => pspawn(agSolo, args, spawnOpts);
    } else {
      soloSpawn = async (args, spawnOpts, dockerArgs = []) =>
        pspawn(
          'docker',
          [
            'run',
            `--volume=${process.cwd()}:/usr/src/dapp`,
            `--volume=${process.env.HOME}/.agoric:/root/.agoric`,
            `-eAG_SOLO_BASEDIR=/usr/src/dapp/${serverDir}`,
            `--rm`,
            ...terminalOnlyFlags(`-it`),
            `--entrypoint=ag-solo`,
            ...dockerArgs,
            SOLO_IMAGE,
            ...args,
          ],
          spawnOpts,
        );
    }

    const serverExists = await exists(serverDir);
    // Initialise the solo directory and key.
    if (!serverExists) {
      const initArgs = [`--webport=${portNum}`];
      if (opts.dockerTag) {
        initArgs.push(`--webhost=0.0.0.0`);
      }
      const exitStatus = await soloSpawn(
        ['init', serverDir, ...initArgs],
        undefined,
        [`--workdir=/usr/src/dapp`],
      );
      if (exitStatus) {
        return exitStatus;
      }
    }

    // Create the full economy chain config.
    const agServerResolve = spec =>
      require.resolve(spec, { paths: [serverDir] });
    const coreConfigPath = agServerResolve(
      '@agoric/vm-config/decentral-core-config.json',
    );
    const economyTemplPath = agServerResolve(
      '@agoric/cosmic-swingset/economy-template.json',
    );
    const [rawSoloAddr, coreConfigJson, economyTemplJson] = await Promise.all([
      fs.readFile(`${serverDir}/ag-cosmos-helper-address`, 'utf-8'),
      fs.readFile(coreConfigPath, 'utf-8'),
      fs.readFile(economyTemplPath, 'utf-8'),
    ]);
    const soloAddr = rawSoloAddr.trimRight();
    const economyProposals = JSON.parse(
      economyTemplJson.replace(/@PRIMARY_ADDRESS@/g, soloAddr),
    );
    const economyConfig = JSON.parse(coreConfigJson);
    economyConfig.coreProposals = economyProposals;
    await fs.writeFile(
      `${serverDir}/decentral-economy-config.json`,
      JSON.stringify(economyConfig, null, 2),
    );

    if (!opts.restart) {
      return 0;
    }

    const gciFile = `${SERVERS_ROOT_DIR}/local-chain-${CHAIN_PORT}/config/genesis.json.sha256`;
    process.stdout.write(`Waiting for local-chain-${CHAIN_PORT} to start...`);
    let hasGci = false;
    for await (const _ of untilTrue(() => hasGci)) {
      process.stdout.write('.');

      await new Promise((resolve, reject) => {
        fs.stat(gciFile).then(
          _2 => {
            hasGci = true;
            resolve(true);
          },
          e => {
            if (!e || e.code !== 'ENOENT') {
              reject(e);
            } else {
              setTimeout(resolve, 3000);
            }
          },
        );
      });
    }
    process.stdout.write('\n');

    const spawnOpts = {};
    if (!popts.dockerTag) {
      spawnOpts.cwd = serverDir;
    }

    const rpcAddrs = [`localhost:${CHAIN_PORT}`];
    if (popts.dockerTag) {
      rpcAddrs.push(`host.docker.internal:${CHAIN_PORT}`);
    }

    let exitStatus;

    // Provision the ag-solo, if necessary.
    let bestRpcAddr;
    for await (const _ of untilTrue(() => bestRpcAddr)) {
      for await (const rpcAddr of rpcAddrs) {
        exitStatus = await keysSpawn([
          'query',
          'swingset',
          'egress',
          soloAddr,
          `--chain-id=${CHAIN_ID}`,
          `--node=tcp://${rpcAddr}`,
        ]);
        if (exitStatus) {
          const provCmds = [
            // We need to provision our address.
            [
              'tx',
              'swingset',
              'provision-one',
              '-ojson',
              '--keyring-backend=test',
              '--from=provision',
              '--gas=auto',
              `--gas-adjustment=${GAS_ADJUSTMENT}`,
              '--broadcast-mode=block',
              '--yes',
              `--chain-id=${CHAIN_ID}`,
              `--node=tcp://${rpcAddr}`,
              `local-solo-${portNum}`,
              soloAddr,
              ...provisionPowers,
            ],
            // Then send it some coins.
            [
              'tx',
              'bank',
              'send',
              '-ojson',
              '--keyring-backend=test',
              '--gas=auto',
              `--gas-adjustment=${GAS_ADJUSTMENT}`,
              '--broadcast-mode=block',
              '--yes',
              `--chain-id=${CHAIN_ID}`,
              `--node=tcp://${rpcAddr}`,
              'provision',
              soloAddr,
              SOLO_COINS,
            ],
          ];
          for (/* await */ const cmd of provCmds) {
            const statusOut = capture(keysSpawn, cmd, true);
            exitStatus = await statusOut[0];
            if (!exitStatus) {
              const json = statusOut[1].replace(/^gas estimate: \d+$/m, '');
              try {
                const ret = JSON.parse(json);
                if (ret.code !== 0) {
                  exitStatus = 2;
                }
              } catch (e) {
                console.error(`Cannot parse JSON:`, e, json);
                exitStatus = 99;
              }
            }
            if (exitStatus) {
              break;
            }
          }
        }
        if (!exitStatus) {
          bestRpcAddr = rpcAddr;
          break;
        }
      }
      if (!bestRpcAddr) {
        await delay(2000);
      }
    }
    if (exitStatus) {
      return exitStatus;
    }

    const file = await fs.readFile(gciFile, 'utf-8');
    // Connect to the chain.
    const gci = file.trimRight();
    exitStatus = await soloSpawn(
      ['set-gci-ingress', `--chainID=${CHAIN_ID}`, gci, bestRpcAddr],
      spawnOpts,
    );
    if (exitStatus) {
      return exitStatus;
    }

    // Now actually start the solo.
    return soloSpawn(['start'], { ...spawnOpts, env: nodeDebugEnv }, [
      `--publish=127.0.0.1:${portNum}:${portNum}`,
    ]);
  }

  async function startTestnetDocker(profileName, startArgs, popts) {
    await null;
    if (popts.dockerTag && popts.pull) {
      const exitStatus = await pspawn('docker', ['pull', SOLO_IMAGE]);
      if (exitStatus) {
        return exitStatus;
      }
    }

    const port = startArgs[0] || PORT;
    const netconfig = startArgs[1] || DEFAULT_NETCONFIG;
    const serverDir = `${SERVERS_ROOT_DIR}/${profileName}-${port}`;

    if (popts.reset) {
      await rmVerbose(serverDir);
    }

    const setupRun = async (...bonusArgs) =>
      pspawn('docker', [
        'run',
        `-p127.0.0.1:${HOST_PORT}:${port}`,
        `--volume=${process.cwd()}:/usr/src/dapp`,
        `-eAG_SOLO_BASEDIR=/usr/src/dapp/${serverDir}`,
        `--rm`,
        ...terminalOnlyFlags(`-it`),
        SOLO_IMAGE,
        `--webport=${port}`,
        `--webhost=0.0.0.0`,
        ...bonusArgs,
      ]);

    return setupRun('setup', `--netconfig=${netconfig}`);
  }

  async function startTestnetSdk(profileName, startArgs, popts) {
    const port = startArgs[0] || PORT;
    const netconfig = startArgs[1] || DEFAULT_NETCONFIG;
    const serverDir = `${SERVERS_ROOT_DIR}/${profileName}-${port}`;

    await null;
    if (popts.reset) {
      await rmVerbose(serverDir);
    }

    const setupRun = async (...bonusArgs) =>
      pspawn(agSolo, [`--webport=${port}`, ...bonusArgs], {
        env: { ...pspawnEnv, AG_SOLO_BASEDIR: serverDir },
      });

    return setupRun('setup', `--netconfig=${netconfig}`);
  }

  const profiles = {
    __proto__: null,
    dev: startFakeChain,
    'local-chain': startLocalChain,
    'local-solo': startLocalSolo,
    testnet: opts.dockerTag ? startTestnetDocker : startTestnetSdk,
  };

  const [_command = 'start', profileName = 'dev', ...args] = rawArgs;
  const startFn = profiles[profileName];
  if (!startFn) {
    const profileNames = Object.keys(profiles).join(', ');
    log.error(
      `unrecognized profile name ${profileName}; use one of: ${profileNames}`,
    );
    return 1;
  }

  return startFn(profileName, args, opts);
}
