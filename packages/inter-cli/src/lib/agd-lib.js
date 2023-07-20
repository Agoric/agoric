// @ts-check
// @jessie-check

const { freeze } = Object;

const agdBinary = 'agd';

/** @param {{ execFileSync: typeof import('child_process').execFileSync }} io */
export const makeAgd = ({ execFileSync }) => {
  console.warn('XXX is sync IO essential?');

  /** @param {{ home?: string, keyringBackend?: string, rpcAddrs?: string[] }} keyringOpts */
  const make = ({ home, keyringBackend, rpcAddrs } = {}) => {
    const keyringArgs = [
      ...(home ? ['--home', home] : []),
      ...(keyringBackend ? [`--keyring-backend`, keyringBackend] : []),
    ];
    console.warn('XXX: rpcAddrs after [0] are ignored');
    const nodeArgs = [...(rpcAddrs ? [`--node`, rpcAddrs[0]] : [])];

    const l = a => {
      console.log(a); // XXX unilateral logging by a library... iffy
      return a;
    };
    /**
     * @param {string[]} args
     * @param {*} [opts]
     */
    const exec = (args, opts) =>
      execFileSync(agdBinary, l(args), opts).toString();

    const outJson = ['--output', 'json'];

    const ro = freeze({
      status: async () => JSON.parse(exec([...nodeArgs, 'status'])),
      /**
       * @param {[kind: 'tx', txhash: string]} qArgs
       */
      query: async qArgs => {
        const out = await exec(['query', ...qArgs, ...nodeArgs, ...outJson], {
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        return JSON.parse(out);
      },
    });
    const nameHub = freeze({
      /**
       * @param {string[]} path
       * NOTE: synchronous I/O
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
       *
       * @param {string[]} txArgs
       * @param {{ chainId: string, from: string, yes?: boolean }} opts
       */
      tx: async (txArgs, { chainId, from, yes }) => {
        const yesArg = yes ? ['--yes'] : [];
        const args = [
          ...nodeArgs,
          ...[`--chain-id`, chainId],
          ...keyringArgs,
          ...[`--from`, from],
          'tx',
          ...txArgs,
          ...['--broadcast-mode', 'block'],
          ...yesArg,
          ...outJson,
        ];
        const out = exec(args);
        return JSON.parse(out);
      },
      ...ro,
      ...nameHub,
      readOnly: () => ro,
      nameHub: () => nameHub,
      withOpts: opts => make({ home, keyringBackend, rpcAddrs, ...opts }),
    });
    return rw;
  };
  return make();
};
