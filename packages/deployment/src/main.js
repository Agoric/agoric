/* eslint-disable no-await-in-loop */
import djson from 'deterministic-json';
import { createHash } from 'crypto';
import chalk from 'chalk';
import parseArgs from 'minimist';
import { assert, details as X } from '@agoric/assert';
import { doInit } from './init.js';
import { shellMetaRegexp, shellEscape } from './run.js';
import { streamFromString } from './files.js';
import { SSH_TYPE, DEFAULT_BOOT_TOKENS } from './setup.js';

const PROVISION_DIR = 'provision';
const COSMOS_DIR = 'ag-chain-cosmos';
const DWEB_DIR = 'dweb';
const SECONDS_BETWEEN_BLOCKS = 5;
const DEFAULT_SWINGSET_PROMETHEUS_PORT = 9464;

// We now use Cloudflare, not dweb.
const ALL_NODES_DWEB = false;

const isPublicRpc = (roles, cluster) => {
  if (Object.values(roles).includes('peer')) {
    // We have some marked as "peer", so only advertise them.
    return roles[cluster] === 'peer';
  }
  // Advertise all validators.
  return roles[cluster] === 'validator';
};
const isPersistentPeer = isPublicRpc;

const dirname = new URL('./', import.meta.url).pathname;

const makeGuardFile =
  ({ rd, wr }) =>
  async (file, maker) => {
    if (await rd.exists(file)) {
      return 0;
    }
    const parent = rd.dirname(file);
    await wr.mkdir(parent, { recursive: true });
    let made = false;
    const ret = await maker(async contents => {
      await wr.createFile(file, contents);
      made = true;
    });
    if (!made) {
      if (!ret) {
        // Create a timestamp by default.
        await wr.createFile(file, String(new Date()));
      } else {
        // They failed.
        throw ret;
      }
    }
    return ret;
  };

const waitForStatus =
  ({ setup, running }) =>
  async (user, host, service, doRetry, acceptFn) => {
    const hostArgs = host ? [`-l${host}`] : [];
    const serviceArgs = service ? [`-eservice=${service}`] : [];
    let retryNum = 0;
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      await doRetry(retryNum);
      let buf = '';
      // eslint-disable-next-line no-await-in-loop
      const code = await running.doRun(
        setup.playbook('status', `-euser=${user}`, ...hostArgs, ...serviceArgs),
        undefined,
        chunk => {
          running.stdout.write(chunk);
          buf += String(chunk);
        },
      );
      const accepted = acceptFn(buf, code);
      if (accepted !== undefined) {
        return accepted;
      }
      retryNum += 1;
    }
  };

const provisionOutput = async ({ rd, wr, running }) => {
  const jsonFile = `${PROVISION_DIR}/terraform-output.json`;
  await makeGuardFile({ rd, wr })(jsonFile, async makeFile => {
    const json = await running.needBacktick(`terraform output -json`);
    await makeFile(json);
  });
  const json = String(await rd.readFile(jsonFile));
  return JSON.parse(json);
};

const main = async (progname, rawArgs, powers) => {
  const { env, rd, wr, setup, running, inquirer, fetch } = powers;
  const { _: args, ...opts } = parseArgs(rawArgs, {
    boolean: ['version', 'help'],
    stopEarly: true,
  });

  // This is needed for hyphenated group names not to trigger Ansible.
  env.ANSIBLE_TRANSFORM_INVALID_GROUP_CHARS = 'ignore';

  const trimReadFile = async file =>
    String(await rd.readFile(file)).trimRight();
  const guardFile = makeGuardFile({ rd, wr });
  const { doRun, needDoRun, needBacktick, setSilent, cwd, chdir, stdout } =
    running;

  const reMain = async reArgs => {
    const displayArgs = [progname, ...args];
    console.error('$', ...displayArgs.map(shellEscape));
    return main(progname, reArgs, powers);
  };

  const needReMain = async reArgs => {
    const code = await reMain(reArgs);
    assert.equal(code, 0, X`Unexpected exit: ${code}`);
  };

  const initHint = () => {
    const adir = cwd();
    console.error(`\

NOTE: to manage the ${adir} setup directory, do
  export AG_SETUP_COSMOS_HOME=${adir}
or
  cd ${adir}
and run ${progname} subcommands`);
  };
  const help = () =>
    console.log(`\
Usage: ${progname} [command] [...args]

Notable commands:

bootstrap        automatic setup (idempotent)
destroy          unprovision a setup, so that it can be bootstrapped again
help             display this message
init             initialize a chain setup directory
provision        create network nodes to match this setup
run              run a shell command on a set of nodes
play             run an Ansible playbook on the nodes
rolling-restart  restart each node one at a time
show-config      display the client connection parameters
`);
  const inited = async (cmd = `${progname} init`, ...files) => {
    files = [...files, 'ansible.cfg', 'vars.tf'];
    try {
      const ps = files.map(path => rd.stat(path));
      await Promise.all(ps);
    } catch (e) {
      throw Error(
        `${cwd()} does not appear to be a directory created by \`${cmd}'`,
      );
    }
  };

  const cmd = args[0];
  if (setup.SETUP_HOME) {
    // Switch to the chain home.
    switch (cmd) {
      case 'bootstrap':
      case 'init':
      case 'destroy':
      case 'show-config':
      case 'ssh':
        break;
      default:
        if (cwd() !== setup.SETUP_HOME) {
          await chdir(setup.SETUP_HOME);
        }
        break;
    }
  }

  if (opts.help) {
    help();
    return 0;
  }

  switch (cmd) {
    case 'help': {
      help();
      break;
    }
    case 'bootstrap': {
      const {
        _: subArgs,
        'boot-tokens': bootTokens,
        ...subOpts
      } = parseArgs(args.slice(1), {
        default: {
          'boot-tokens': DEFAULT_BOOT_TOKENS,
        },
        string: ['bump', 'import-from', 'genesis'],
        stopEarly: true,
      });

      const dir = setup.SETUP_HOME;
      if (await rd.exists(`${dir}/network.txt`)) {
        // Change to directory.
        await chdir(dir);
      } else {
        // NOTE: init automatically changes directory.
        await needReMain([
          'init',
          dir,
          ...(env.AG_SETUP_COSMOS_NAME ? [env.AG_SETUP_COSMOS_NAME] : []),
        ]);
      }

      await guardFile(`${PROVISION_DIR}/hosts`, async makeFile => {
        await needReMain(['provision', '-auto-approve']);
        const hosts = await needBacktick(`${shellEscape(progname)} show-hosts`);
        await makeFile(hosts);
      });

      await guardFile(`${PROVISION_DIR}/ssh_known_hosts.stamp`, async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const code = await reMain(['play', 'update_known_hosts']);
          if (code === 0) {
            break;
          } else if (code !== 2) {
            return code;
          }
          await setup.sleep(10, 'for hosts to boot SSH');
        }
        return 0;
      });

      // Prepare all the machines.
      await guardFile(`${PROVISION_DIR}/prepare.stamp`, () =>
        needReMain(['play', 'prepare-machine']),
      );

      switch (subArgs[0]) {
        case undefined: {
          await wr.createFile('boot-tokens.txt', bootTokens);
          const bootOpts = [];
          for (const propagate of ['bump', 'import-from', 'genesis']) {
            const val = subOpts[propagate];
            if (val !== undefined) {
              bootOpts.push(`--${propagate}=${val}`);
            }
          }
          await needReMain(['bootstrap-cosmos', ...bootOpts]);
          break;
        }
        default: {
          assert.fail(X`Unrecognized bootstrap argument ${subArgs[0]}`);
        }
      }
      break;
    }

    case 'bump-chain-version': {
      await inited();
      const subArgs = args.slice(1);
      const versionFile = `chain-version.txt`;

      let epoch = '0';
      if (await rd.exists(versionFile)) {
        const vstr = await trimReadFile(versionFile);
        const match = vstr.match(/^(\d+)/);
        epoch = match[1] || '0';
      }

      let versionKind = subArgs[0];
      if (subArgs[0] === undefined || String(subArgs[0]) === 'true') {
        // Default bump.
        versionKind = 'epoch';
      }

      switch (versionKind) {
        case 'epoch':
          epoch = Number(epoch) + 1;
          break;

        case 'none':
        case undefined:
          break;

        default:
          assert(
            versionKind.match(/^[1-9]/),
            X`${versionKind} is not one of "epoch", or NNN`,
          );
      }

      let vstr = `${epoch}`;
      if (versionKind.match(/^[1-9]/)) {
        vstr = versionKind;
      }
      console.log(vstr);
      await wr.createFile(versionFile, vstr);
      break;
    }

    case 'bootstrap-cosmos': {
      await inited();
      // eslint-disable-next-line no-unused-vars
      const { _: subArgs, ...subOpts } = parseArgs(args.slice(1), {
        string: ['bump', 'import-from', 'genesis'],
        stopEarly: true,
      });

      // See where we're importing the chain state from.
      const importFlags = [];
      const importFrom = subOpts['import-from'];
      if (importFrom) {
        if (importFrom.startsWith('node') && !importFrom.endsWith('/')) {
          // Export from all nodes.
          await needReMain(['play', 'export-genesis']);
        }

        // Add the exported prefix if not absolute.
        const absImportFrom = rd.resolve(
          `${setup.SETUP_HOME}/exported`,
          importFrom,
        );
        importFlags.push(`--import-from=${absImportFrom}`);
      }

      if (subOpts.bump !== undefined) {
        const bumpOpts = subOpts.bump ? [subOpts.bump] : [];
        await needReMain(['bump-chain-version', ...bumpOpts]);
      }

      // Make sure the version file exists.
      await guardFile(`chain-version.txt`, makeFile => makeFile('1'));

      // Assign the chain name.
      let chainName;
      let genJSON;
      if (subOpts.genesis) {
        // Fetch the specified genesis, don't generate it.
        const loc = new URL(subOpts.genesis, `file://${cwd()}`);
        if (loc.protocol === 'file:') {
          genJSON = await trimReadFile(loc.pathname);
        } else {
          const res = await fetch(subOpts.genesis);
          const js = await res.json();
          if (js && js.jsonrpc) {
            genJSON = JSON.stringify(js.result.genesis);
          } else {
            genJSON = JSON.stringify(js);
          }
        }

        const genesis = JSON.parse(genJSON);
        chainName = genesis.chain_id;
      } else {
        const networkName = await trimReadFile('network.txt');
        const chainVersion = await trimReadFile('chain-version.txt');
        chainName = `${networkName}-${chainVersion}`;
      }
      const currentChainName = await trimReadFile(
        `${COSMOS_DIR}/chain-name.txt`,
      ).catch(_ => undefined);

      if (subOpts.bump !== undefined || currentChainName !== chainName) {
        // We don't have matching parameters, so restart the chain.
        // Stop the chain services.
        await reMain(['play', 'stop', '-eservice=ag-chain-cosmos']);
        await reMain(['play', 'stop', '-eservice=dweb']);

        // Blow away cosmos state.
        await needDoRun(['rm', '-rf', COSMOS_DIR]);
      }
      await guardFile(`${COSMOS_DIR}/chain-name.txt`, async makeFile => {
        await makeFile(chainName);
      });

      // Bootstrap the chain nodes.
      await guardFile(`${COSMOS_DIR}/prepare.stamp`, () =>
        needReMain(['play', 'prepare-cosmos']),
      );

      // If the canonical genesis exists, use it.
      await guardFile(`${COSMOS_DIR}/genesis.stamp`, async () => {
        await wr.mkdir(`${COSMOS_DIR}/data`, { recursive: true });
        let pr;
        if (genJSON) {
          pr = wr.createFile(`${COSMOS_DIR}/data/genesis.json`, genJSON);
        } else {
          pr = needReMain(['play', 'cosmos-genesis']);
        }
        await pr;
      });

      await guardFile(`${COSMOS_DIR}/set-defaults.stamp`, async () => {
        await needReMain(['play', 'cosmos-clone-config']);

        const agoricCli = rd.resolve(dirname, `../../agoric-cli/bin/agoric`);

        // Apply the Agoric set-defaults to all the .dst dirs.
        const files = await rd.readdir(`${COSMOS_DIR}/data`);
        const dsts = files.filter(fname => fname.endsWith('.dst'));
        const peers = await needBacktick(`${shellEscape(progname)} show-peers`);
        const seeds = await needBacktick(`${shellEscape(progname)} show-seeds`);
        const allIds = await needBacktick(
          `${shellEscape(progname)} show-all-ids`,
        );
        const hasPeers = dsts.find(dst => dst.startsWith('peer'));
        await Promise.all(
          dsts.map(async dst => {
            // Update the config.toml and genesis.json.
            const corsFlags = [];
            if (hasPeers && dst.startsWith('peer')) {
              // Some "peers", and this is one of them.
              corsFlags.push('--enable-cors');
            } else if (!hasPeers && dst.startsWith('validator')) {
              // No "peers", and this is a validator.
              corsFlags.push('--enable-cors');
            }
            await needDoRun([
              agoricCli,
              `set-defaults`,
              `ag-chain-cosmos`,
              `--persistent-peers=${peers}`,
              ...corsFlags,
              `--seeds=${seeds}`,
              `--unconditional-peer-ids=${allIds}`,
              ...importFlags,
              `${COSMOS_DIR}/data/${dst}`,
            ]);
            if (dst !== 'validator0.dst') {
              return;
            }
            await guardFile(
              `${COSMOS_DIR}/data/genesis.json`,
              async makeGenesis => {
                // Make a canonical copy of the genesis.json if there isn't one.
                const data = await rd.readFile(
                  `${COSMOS_DIR}/data/${dst}/genesis.json`,
                );
                await makeGenesis(data);
              },
            );
          }),
        );
      });

      const peersFile = `${COSMOS_DIR}/data/peers.txt`;
      await guardFile(peersFile, async makeFile => {
        const peers = await needBacktick(`${shellEscape(progname)} show-peers`);
        await makeFile(peers);
      });

      await guardFile(`${COSMOS_DIR}/install.stamp`, () =>
        needReMain(['play', 'install-cosmos']),
      );

      let SWINGSET_PROMETHEUS_PORT;
      if (await rd.exists(`prometheus-tendermint.txt`)) {
        SWINGSET_PROMETHEUS_PORT = DEFAULT_SWINGSET_PROMETHEUS_PORT;
      }
      const serviceLines = [
        `Environment=SLOGFILE=.ag-chain-cosmos/data/chain.slog`,
      ];
      if (SWINGSET_PROMETHEUS_PORT) {
        serviceLines.push(
          `Environment="OTEL_EXPORTER_PROMETHEUS_PORT=${SWINGSET_PROMETHEUS_PORT}"`,
        );
      }
      for (const envName of [
        'VAULT_FACTORY_CONTROLLER_ADDR',
        'CHAIN_BOOTSTRAP_VAT_CONFIG',
        'SLOGSENDER',
        'XSNAP_TEST_RECORD',
        'SWING_STORE_TRACE',
        'XSNAP_KEEP_SNAPSHOTS',
        'NODE_HEAP_SNAPSHOTS',
      ]) {
        if (env[envName]) {
          serviceLines.push(`Environment="${envName}=${env[envName]}"`);
        }
      }
      const agChainCosmosEnvironment = [
        `-eserviceLines=${shellEscape(serviceLines.join('\n'))}`,
      ];
      await guardFile(`${COSMOS_DIR}/service.stamp`, () =>
        needReMain([
          'play',
          'install',
          `-eexecline=${shellEscape(
            `/usr/local/bin/ag-chain-cosmos start ${
              env.AG_COSMOS_START_ARGS ?? '--log_level=warn'
            }`,
          )}`,
          ...agChainCosmosEnvironment,
        ]),
      );

      await guardFile(`${COSMOS_DIR}/start.stamp`, () =>
        needReMain(['play', 'start']),
      );

      await needReMain(['wait-for-any']);

      // Add the bootstrap validators.
      if (!importFrom) {
        await guardFile(`${COSMOS_DIR}/validators.stamp`, () =>
          needReMain(['play', 'cosmos-validators']),
        );
      }

      console.error(
        chalk.black.bgGreenBright.bold(
          'Your Agoric Cosmos chain is now running!',
        ),
      );
      await needReMain(['dweb']);
      break;
    }

    case 'dweb': {
      await inited();
      const cfg = await needBacktick(`${shellEscape(progname)} show-config`);
      stdout.write(`${chalk.yellow(cfg)}\n`);

      await wr.mkdir(`${DWEB_DIR}/data`, { recursive: true });
      await wr.createFile(`${DWEB_DIR}/data/cosmos-chain.json`, cfg);

      const rpcAddrs = await needBacktick(
        `${shellEscape(progname)} show-rpcaddrs`,
      );
      const match = rpcAddrs.match(/^([^,]+):\d+(,|$)/);

      let execline = `npx http-server ./public`;
      let dwebHost;
      const cert = `dweb.crt`;
      const key = `dweb.key`;
      if ((await rd.exists(cert)) && (await rd.exists(key))) {
        execline += ` --port=443 --ssl`;
        execline += ` --cert=${shellEscape(cert)}`;
        execline += ` --key=${shellEscape(key)}`;
        dwebHost = `https://${match[1]}`;
      } else {
        execline += ` --port=80`;
        dwebHost = `http://${match[1]}`;
      }

      await reMain(['play', 'stop', '-eservice=dweb']);

      // Copy the needed files to the web server.
      await needReMain([
        'play',
        'dweb-copy',
        `-eexecline=${shellEscape(execline)}`,
      ]);

      await needReMain([
        'play',
        'install',
        '-eservice=dweb',
        `-eexecline=/home/dweb/start.sh`,
        `-eserviceLines=AmbientCapabilities=CAP_NET_BIND_SERVICE`,
      ]);

      await needReMain(['play', 'start', '-eservice=dweb']);

      initHint();

      console.error(
        `Use the following to provision:
${chalk.yellow.bold(`ag-setup-solo --netconfig='${dwebHost}/network-config'`)}
`,
      );
      break;
    }

    case 'show-faucet-address':
    case 'add-egress':
    case 'add-delegate': {
      await inited();
      await needDoRun(['./faucet-helper.sh', ...args]);
      break;
    }

    case 'show-chain-name': {
      await inited();
      const chainName = await trimReadFile(`${COSMOS_DIR}/chain-name.txt`);
      stdout.write(chainName);
      break;
    }

    case 'ssh': {
      const [host, ...sshArgs] = args.slice(1);
      assert(host, X`Need: [host]`);

      setSilent(true);
      await chdir(setup.SETUP_HOME);
      await inited();
      const json = await needBacktick(
        `ansible-inventory --host=${shellEscape(host)}`,
      );
      const obj = JSON.parse(json);
      const node = obj.ansible_host || host;
      const user = obj.ansible_ssh_user || 'root';
      const pkey = obj.ansible_ssh_private_key_file;

      const sshCmd = ['ssh', `-oUserKnownHostsFile=provision/ssh_known_hosts`];
      if (pkey) {
        sshCmd.push(`-i${pkey}`);
      }
      sshCmd.push(`${user}@${node}`);
      sshCmd.push(...sshArgs);
      await needDoRun(sshCmd);
      break;
    }

    case 'show-config': {
      setSilent(true);
      await chdir(setup.SETUP_HOME);
      await inited();
      const [chainName, gci, peers, rpcAddrs, seeds] = await Promise.all(
        [
          'show-chain-name',
          'show-gci',
          'show-peers',
          'show-rpcaddrs',
          'show-seeds',
        ].map(subcmd =>
          needBacktick([progname, subcmd].map(shellEscape).join(' ')),
        ),
      );
      const obj = {
        chainName,
        gci,
        peers: peers.split(','),
        rpcAddrs: rpcAddrs.split(','),
        seeds: seeds.split(','),
      };
      stdout.write(`${JSON.stringify(obj, undefined, 2)}\n`);
      break;
    }

    case 'rolling-restart': {
      let [...hosts] = args.slice(1);
      await inited();

      if (hosts.length === 0) {
        hosts = ['all'];
      }

      // Expand the hosts into nodes.
      const nodeSet = new Set();
      for (const host of hosts) {
        const hostLines = await needBacktick(
          `ansible --list-hosts ${shellEscape(host)}`,
        );
        hostLines
          .split('\n')
          .slice(1)
          .forEach(h => nodeSet.add(h.trim()));
      }

      const nodes = [...nodeSet.keys()].sort();
      assert(nodes.length > 0, X`Need at least one node`);

      for (const node of nodes) {
        const nodePlaybook = (book, ...pbargs) =>
          setup.playbook(book, '-l', node, ...pbargs);
        await needDoRun(nodePlaybook('restart'));
        await needDoRun([progname, 'wait-for-any', node]);
      }
      break;
    }

    case 'wait-for-any': {
      let [host] = args.slice(1);
      await inited();

      if (!host) {
        host = 'validator';
      }

      // Detect when blocks are being produced.
      const height = await waitForStatus({ setup, running })(
        'ag-chain-cosmos', // user
        host, // host
        'ag-chain-cosmos', // service
        _retries =>
          setup.sleep(
            SECONDS_BETWEEN_BLOCKS + 1,
            `to check if ${chalk.underline(host)} has committed a block`,
          ),
        (buf, code) => {
          if (buf === '' && code === 1) {
            // No status information.  Probably an empty inventory label.
            return true;
          }
          const match = buf.match(
            /( block-manager: block ([1-9]\d*) commit|Committed state.*module=state.*height=([1-9]\d*))/,
          );
          if (match) {
            return match[2] || match[3];
          }
          return undefined;
        },
      );

      const atLeast = host.match(/^node\d+/) ? '' : `At least one of `;
      console.error(
        chalk.greenBright(
          `${atLeast}${chalk.underline(
            host,
          )} is up-and-running (committed block height=${height})`,
        ),
      );
      break;
    }

    case 'new-account': {
      const [user, passwd] = args.slice(1);
      const stdin = passwd
        ? streamFromString(`${passwd}\n${passwd}\n`)
        : 'inherit';
      await needDoRun(['agd', 'keys', 'add', user], stdin);
      break;
    }

    case 'show-rpcaddrs': {
      await inited();
      const prov = await provisionOutput({ rd, wr, running });

      let rpcaddrs = '';
      let sep = '';
      for (const CLUSTER of Object.keys(prov.public_ips.value)) {
        if (!isPublicRpc(prov.roles.value, CLUSTER)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const ips = prov.public_ips.value[CLUSTER];
        const PORT = 26657;
        for (const IP of ips) {
          rpcaddrs += `${sep}${IP}:${PORT}`;
          sep = ',';
        }
      }

      stdout.write(rpcaddrs);
      break;
    }

    case 'show-seeds':
    case 'show-peers':
    case 'show-all-ids': {
      await inited();

      const prov = await provisionOutput({ rd, wr, running });
      const publicIps = [];
      const publicPorts = [];
      const hosts = [];
      let selector;
      switch (cmd) {
        case 'show-seeds': {
          selector = placement => prov.roles.value[placement] === 'seed';
          break;
        }
        case 'show-peers': {
          selector = placement => isPersistentPeer(prov.roles.value, placement);
          break;
        }
        case 'show-all-ids': {
          selector = _placement => true;
          break;
        }
        default: {
          assert.fail(X`Unrecognized show command ${cmd}`);
        }
      }

      for (const CLUSTER of Object.keys(prov.public_ips.value)) {
        if (!selector(CLUSTER)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const ips = prov.public_ips.value[CLUSTER];
        const offset = Number(prov.offsets.value[CLUSTER]);
        for (let i = 0; i < ips.length; i += 1) {
          publicIps.push(ips[i]);
          hosts.push(`${prov.roles.value[CLUSTER]}${offset + i}`);
        }
      }

      const DEFAULT_PORT = 26656;

      let ret = '';
      let sep = '';
      for (let i = 0; i < hosts.length; i += 1) {
        // Read the node-id file for this node.
        const host = hosts[i];
        const idPath = `${COSMOS_DIR}/data/${host}/node-id`;

        const raw = await trimReadFile(idPath);
        const ID = String(raw);

        assert(ID, X`${idPath} must contain a node ${ID}`);
        assert(
          ID.match(/^[a-f0-9]+/),
          X`${idPath} contains an invalid ID ${ID}`,
        );
        if (cmd.endsWith('-ids')) {
          ret += `${sep}${ID}`;
        } else {
          const IP = publicIps[i];
          assert(IP, X`${idPath} does not correspond to a Terraform public IP`);
          const PORT = publicPorts[i] || DEFAULT_PORT;
          ret += `${sep}${ID}@${IP}:${PORT}`;
        }
        sep = ',';
      }
      stdout.write(ret);
      break;
    }

    case 'show-gci': {
      const genesis = await rd.readFile(`${COSMOS_DIR}/data/genesis.json`);
      const s = djson.stringify(JSON.parse(String(genesis)));
      const gci = createHash('sha256').update(s).digest('hex');
      stdout.write(gci);
      break;
    }

    case 'destroy': {
      let [dir] = args.slice(1);
      if (!dir) {
        dir = setup.SETUP_HOME;
      }
      assert(dir, X`Need: [dir]`);

      // Unprovision terraform.
      await chdir(dir);

      if (await rd.exists(`.terraform`)) {
        // Terraform will prompt.
        await needDoRun(['terraform', 'destroy']);
      } else {
        const { CONFIRM } = await inquirer.prompt([
          {
            type: 'input',
            name: 'CONFIRM',
            default: 'no',
            message: `Type "yes" if you are sure you want to reset ${dir} state:`,
          },
        ]);
        assert.equal(CONFIRM, 'yes', X`Aborting due to user request`);
      }

      // We no longer are provisioned or have Cosmos.
      await needDoRun(['rm', '-rf', COSMOS_DIR, PROVISION_DIR]);
      break;
    }

    case 'init': {
      await doInit({ env, rd, wr, running, setup, inquirer, fetch, parseArgs })(
        progname,
        args,
      );
      initHint();
      break;
    }

    case 'provision': {
      await inited();

      // Remove everything that provisioning affects.
      await needDoRun(['rm', '-rf', PROVISION_DIR]);

      // It is always safe to init.
      await needDoRun(['terraform', 'init']);

      // Apply the provisioning plan.
      await needDoRun(['terraform', 'apply', ...args.slice(1)]);
      break;
    }

    case 'show-hosts': {
      const SSH_PRIVATE_KEY_FILE = rd.resolve(`id_${SSH_TYPE}`);
      await inited(`${progname} init`, SSH_PRIVATE_KEY_FILE);
      const prov = await provisionOutput({ rd, wr, running });
      const out = stdout;
      const prefixLines = (str, prefix) => {
        const allLines = str.split('\n');
        if (allLines[allLines.length - 1] === '') {
          allLines.pop();
        }
        return allLines.reduce(
          (prior, line) => `${prior + prefix + line}\n`,
          '',
        );
      };
      const indent = (str, nspaces) => prefixLines(str, ' '.repeat(nspaces));

      const byGroup = {};
      const makeGroup = name => {
        const beginBlock = `\
${name}:
  hosts:
`;
        byGroup[name] = beginBlock;
        return hostBlock => (byGroup[name] += indent(hostBlock, 4));
      };

      const addAll = makeGroup('all');
      const addChainCosmos = makeGroup('ag-chain-cosmos', 4);
      const addDweb = makeGroup('dweb', 4);
      const addRole = {};
      for (const provider of Object.keys(prov.public_ips.value).sort()) {
        const addProvider = makeGroup(provider, 4);
        const ips = prov.public_ips.value[provider];
        const offset = Number(prov.offsets.value[provider]);
        const role = prov.roles.value[provider];
        if (!addRole[role]) {
          addRole[role] = makeGroup(role, 4);
        }
        const keyFile = rd.resolve(
          rd.dirname(SSH_PRIVATE_KEY_FILE),
          `${provider}-${rd.basename(SSH_PRIVATE_KEY_FILE)}`,
        );
        for (let instance = 0; instance < ips.length; instance += 1) {
          const ip = ips[instance];
          const node = `${role}${offset + instance}`;
          let roleParams = '';
          if (role === 'validator') {
            // These are the validator params.
            roleParams = `
  moniker: Agoric${offset + instance}
  website: https://testnet.agoric.net
  identity: https://keybase.io/team/agoric.testnet.validators`;
          }
          const host = `\
${node}:${roleParams}
  provider: ${provider}
  ansible_host: ${ip}
  ansible_ssh_user: root
  ansible_ssh_private_key_file: '${keyFile}'
  ansible_python_interpreter: /usr/bin/python`;
          addProvider(host);

          addAll(host);

          // We add all the cosmos nodes to ag-chain-cosmos.
          addChainCosmos(host);

          if (ALL_NODES_DWEB) {
            // Install the decentralised web on all the hosts.
            addDweb(host);
          }

          // Add the role-specific group.
          addRole[role](host);
        }
      }
      out.write(byGroup.all);
      out.write('  children:\n');
      for (const group of Object.keys(byGroup).sort()) {
        if (group !== 'all') {
          out.write(indent(byGroup[group], 4));
        }
      }
      break;
    }

    case 'play': {
      const [pb, ...pbargs] = args.slice(1);
      assert(pb, X`Need: [playbook name]`);
      assert(
        pb.match(/^\w[-\w]*$/),
        X`[playbook] ${JSON.stringify(pb)} must be a word`,
      );
      await inited();
      return doRun(setup.playbook(pb, ...pbargs));
    }

    case 'run': {
      const [host, ...subcmd] = args.slice(1);
      assert(host && subcmd.length !== 0, X`Need: [host] [cmd...]`);
      await inited();
      let runArg;
      if (subcmd.length === 1) {
        if (subcmd[0].match(shellMetaRegexp)) {
          // Already contains metacharacters.
          runArg = `sh -c ${shellEscape(subcmd[0])}`;
        } else {
          [runArg] = subcmd;
        }
      } else {
        // Need to escape each argument individually.
        const escapedArgs = cmd.map(shellEscape);
        runArg = `sh -c ${shellEscape(escapedArgs.join(' '))}`;
      }
      const run = ['ansible', '-f10', host, '-a', runArg];
      await needDoRun(run);
      break;
    }

    default:
      assert.fail(X`Unknown command ${cmd}; try \`${progname} help'`);
  }
  return 0;
};

export default main;
