// @ts-check
import assert from 'node:assert';

const { freeze } = Object;

const kubectlBinary = 'kubectl';

const chainToBinary = {
  agoric: 'agd',
  cosmoshub: 'gaiad',
  osmosis: 'osmosisd',
  noble: 'nobled',
};

const binaryArgs = (chainName = 'agoric') => [
  'exec',
  '-i',
  `${chainName}local-genesis-0`,
  '-c',
  'validator',
  '--tty=false',
  '--',
  chainToBinary[chainName],
];

/**
 * @param {Record<string, string | string[] | undefined>} record - e.g. { color: 'blue' }
 * @returns {string[]} - e.g. ['--color', 'blue']
 */
export const flags = record => {
  // TODO? support --yes with boolean?

  /** @type {[string, string][]} */
  // @ts-expect-error undefined is filtered out
  const skipUndef = Object.entries(record).filter(([_k, v]) => v !== undefined);
  return skipUndef.flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.flatMap(v => [`--${key}`, v]);
    }
    return [`--${key}`, value];
  });
};

/**
 * @callback ExecSync
 * @param {string} file
 * @param {string[]} args
 * @param {{ encoding: 'utf-8' } & { [k: string]: unknown }} opts
 * @returns {string}
 */

/**
 * @param {{ execFileSync: ExecSync }} io
 */
export const makeAgd = ({ execFileSync }) => {
  /**
   * @param { {
   *       home?: string;
   *       keyringBackend?: string;
   *       rpcAddrs?: string[];
   *       chainName?: string;
   *       broadcastMode?: 'block' | 'sync' | 'async';
   *     }} opts
   */
  const make = ({
    home,
    keyringBackend,
    rpcAddrs,
    chainName = 'agoric',
    broadcastMode = 'block',
  } = {}) => {
    const keyringArgs = flags({ home, 'keyring-backend': keyringBackend });
    if (rpcAddrs) {
      assert.equal(
        rpcAddrs.length,
        1,
        'XXX rpcAddrs must contain only one entry',
      );
    }
    const nodeArgs = flags({ node: rpcAddrs && rpcAddrs[0] });

    /**
     * @param {string[]} args
     * @param {*} [opts]
     */
    const exec = (
      args,
      opts = { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    ) => execFileSync(kubectlBinary, [...binaryArgs(chainName), ...args], opts);

    const outJson = flags({ output: 'json' });

    const ro = freeze({
      status: async () => JSON.parse(exec([...nodeArgs, 'status'])),
      /**
       * @param {| [kind: 'gov', domain: string, ...rest: any]
       *         | [kind: 'tx', txhash: string]
       *         | [mod: 'vstorage', kind: 'data' | 'children', path: string]
       *         | [kind: 'txs', ...rest: any]
       * } qArgs
       */
      query: async qArgs => {
        const args = ['query', ...qArgs, ...nodeArgs, ...outJson];
        console.log(`$$$ ${chainToBinary[chainName]}`, ...args);
        const out = exec(args, {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });

        try {
          return JSON.parse(out);
        } catch (e) {
          console.error(e);
          console.info('output:', out);
        }
      },
    });
    const nameHub = freeze({
      /**
       * NOTE: synchronous I/O
       *
       * @param {string[]} path
       */
      lookup: (...path) => {
        if (!Array.isArray(path)) {
          // TODO: use COND || Fail``
          throw TypeError();
        }
        if (path.length !== 1) {
          throw Error(`path length limited to 1: ${path.length}`);
        }
        const [name] = path;
        const txt = exec(['keys', 'show', `--address`, name, ...keyringArgs]);
        return txt.trim();
      },
    });
    const rw = freeze({
      /**
       * TODO: gas
       * @param {string[]} txArgs
       * @param {{ chainId: string; from: string; yes?: boolean, fees?: string }} opts
       */
      tx: async (txArgs, { chainId, from, yes, fees }) => {
        const args = [
          'tx',
          ...txArgs,
          ...nodeArgs,
          ...keyringArgs,
          ...flags({ 'chain-id': chainId, from }),
          ...flags({
            'broadcast-mode': broadcastMode,
            gas: 'auto',
            'gas-adjustment': '1.4',
          }),
          ...(fees ? ['--fees', fees] : []),
          ...(yes ? ['--yes'] : []),
          ...outJson,
        ];
        console.log(`$$$ ${chainToBinary[chainName]}`, ...args);
        const out = exec(args, { stdio: ['ignore', 'pipe', 'ignore'] });
        try {
          // XXX approximate type
          /** @type {{ height: string, txhash: string, code: number, codespace: string, raw_log: string }} */
          const detail = JSON.parse(out);
          if (detail.code !== 0) {
            throw Error(detail.raw_log);
          }
          return detail;
        } catch (e) {
          console.error(e);
          console.info('output:', out);
        }
      },
      ...ro,
      ...nameHub,
      readOnly: () => ro,
      nameHub: () => nameHub,
      keys: {
        /**
         * @param {string} name
         * @param {string} mnemonic
         */
        add: (name, mnemonic) => {
          return execFileSync(
            kubectlBinary,
            [
              ...binaryArgs(chainName),
              ...keyringArgs,
              'keys',
              'add',
              name,
              '--recover',
            ],
            {
              encoding: 'utf-8',
              input: mnemonic,
              stdio: ['pipe', 'pipe', 'ignore'],
            },
          ).toString();
        },
        /** @param {string} name key name in keyring */
        showAddress: name => {
          return execFileSync(
            kubectlBinary,
            [
              ...binaryArgs(chainName),
              'keys',
              'show',
              name,
              '-a',
              ...keyringArgs,
            ],
            {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'ignore'],
            },
          )
            .toString()
            .trim();
        },
        /** @param {string} name */
        delete: name => {
          return exec([...keyringArgs, 'keys', 'delete', name, '-y'], {
            stdio: ['pipe', 'pipe', 'ignore'],
          });
        },
      },
      /**
       * @param {Record<string, unknown>} opts
       */
      withOpts: opts => make({ home, keyringBackend, rpcAddrs, ...opts }),
    });
    return rw;
  };
  return make();
};

/** @typedef {ReturnType<typeof makeAgd>} Agd */

/** @param {{ execFileSync: typeof import('child_process').execFileSync, log: typeof console.log }} powers */
export const makeCopyFiles = (
  { execFileSync, log },
  {
    podName = 'agoriclocal-genesis-0',
    containerName = 'validator',
    destDir = '/tmp/contracts',
  } = {},
) => {
  /** @param {string[]} paths } */
  return paths => {
    // Create the destination directory if it doesn't exist
    execFileSync(
      kubectlBinary,
      `exec -i ${podName} -c ${containerName} -- mkdir -p ${destDir}`.split(
        ' ',
      ),
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    for (const path of paths) {
      execFileSync(
        kubectlBinary,
        `cp ${path} ${podName}:${destDir}/ -c ${containerName}`.split(' '),
        { stdio: ['ignore', 'pipe', 'ignore'] },
      );
      log(`Copied ${path} to ${destDir} in pod ${podName}`);
    }
    const lsOutput = execFileSync(
      kubectlBinary,
      `exec -i ${podName} -c ${containerName}  -- ls ${destDir}`.split(' '),
      { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf-8' },
    );
    log(`ls ${destDir}:\n${lsOutput}`);
    return lsOutput;
  };
};
