// @ts-check
import { text } from 'node:stream/consumers';

const { freeze, entries } = Object;

const onlyStderr = ['ignore', 'ignore', 'inherit'];
const noOutput = ['ignore', 'ignore', 'ignore'];
// const noisyDebug = ['ignore', 'inherit', 'inherit'];

export const pspawn = (bin, { spawn, cwd }) => {
  return (args = [], opts = {}) => {
    /** @type {import('child_process').ChildProcess} */
    let child;
    const exit = new Promise((resolve, reject) => {
      // When stderr is otherwise ignored, spy on it for inclusion in error messages.
      /** @type {Promise<string> | undefined} */
      let stderrP;
      // https://nodejs.org/docs/latest/api/child_process.html#optionsstdio
      let { stdio = 'pipe' } = opts;
      if (stdio === 'ignore' || stdio[2] === 'ignore') {
        stdio = typeof stdio === 'string' ? [stdio, stdio, stdio] : [...stdio];
        stdio[2] = 'pipe';
      } else {
        // The caller is not ignoring stderr, so we pretend it is empty here.
        stderrP = Promise.resolve('');
      }
      const resolvedOpts = { cwd, ...opts, stdio };
      // console.debug('spawn', bin, args, resolvedOpts);
      child = spawn(bin, args, resolvedOpts);
      if (!stderrP) {
        assert(child.stderr);
        stderrP = text(child.stderr);
        child.stderr = null;
      }
      child.addListener('exit', async code => {
        if (code !== 0) {
          let msg = `exit ${code} from command: ${bin} ${args}`;
          const errStr = await stderrP;
          if (errStr) {
            const errTail = errStr.split('\n').slice(-3);
            msg = `${msg}\n${errTail.map(line => `  ${line}`).join('\n')}`;
          }
          reject(Error(msg));
          return;
        }
        resolve(0);
      });
    });
    const kill = sig => {
      try {
        child.kill(sig);
      } catch (e) {
        if (e.code !== 'ERSCH') {
          throw e;
        }
      }
    };

    // @ts-expect-error child is set in the Promise constructor
    return { kill, child, exit };
  };
};

/**
 * Shared state for tests using scenario2 chain in ../
 *
 * @param {object} io
 * @param {*} io.pspawnMake promise-style spawn of 'make' with cwd set
 * @param {*} io.pspawnAgd promise-style spawn of 'agd' with cwd set
 * @param {typeof console.log} io.log
 */
export const makeScenario2 = ({ pspawnMake, pspawnAgd, log }) => {
  const runMake = (args, opts = { stdio: onlyStderr }) => {
    // console.debug('make', ...args);
    log('make', ...args);

    return pspawnMake(args, opts).exit;
  };

  const spawnMake = (args, opts = { stdio: onlyStderr }) => {
    log('make', ...args);
    return pspawnMake(args, opts);
  };

  // {X: 1} => ['X=1'], using JSON.stringify to mitigate injection risks.
  const bind = obj =>
    entries(obj)
      .filter(([_n, v]) => typeof v !== 'undefined')
      .map(([n, v]) => [`${n}=${JSON.stringify(v)}`])
      .flat();

  return freeze({
    runMake,
    spawnMake,
    setup: () => runMake(['scenario2-setup'], { stdio: noOutput }),
    runToHalt: ({
      BLOCKS_TO_RUN = undefined,
      INITIAL_HEIGHT = undefined,
    } = {}) =>
      runMake([
        'scenario2-run-chain-to-halt',
        ...bind({ BLOCKS_TO_RUN, INITIAL_HEIGHT }),
      ]),
    runRosettaCI: async () => {
      return runMake(['scenario2-run-rosetta-ci'], { stdio: onlyStderr });
    },
    export: () =>
      pspawnAgd(
        ['export', '--home=t1/n0', '--export-dir=t1/n0/genesis-export'],
        { stdio: onlyStderr },
      ).exit,
  });
};

/**
 * Wallet utilities for scenario2.
 *
 * @param {object} io
 * @param {*} io.runMake from makeScenario2 above
 * @param {*} io.pspawnAgd as to makeScenario2 above
 * @param {(ms: number) => Promise<void>} io.delay
 * @param {typeof console.log} io.log
 */
export const makeWalletTool = ({ runMake, pspawnAgd, delay, log }) => {
  /**
   * @param {string[]} args
   * @returns {Promise<any>} JSON.parse of stdout of `ag-chain-cosmos query <...args>`
   * @throws if agd exits non-0 or gives empty output
   */
  const query = async args => {
    const parts = [];
    const cmd = pspawnAgd(['query', ...args]);
    cmd.child.stdout.on('data', chunk => parts.push(chunk));
    await cmd.exit;
    const txt = parts.join('').trim();
    if (txt === '') {
      throw Error(`empty output from: query ${args}`);
    }
    return JSON.parse(txt);
  };

  const queryBalance = async addr =>
    query(['bank', 'balances', addr, '--output', 'json']).then(b => {
      console.log(addr, b);
      return b;
    });

  let currentHeight;
  const waitForBlock = async (why, targetHeight, relative = false) => {
    if (relative) {
      if (typeof currentHeight === 'undefined') {
        throw Error('cannot use relative before starting');
      }
      targetHeight += currentHeight;
    }
    for (;;) {
      try {
        const info = await query(['block']);
        currentHeight = Number(info?.block?.header?.height);
        if (currentHeight >= targetHeight) {
          log(info?.block?.header?.time, ' block ', currentHeight);
          return currentHeight;
        }
        console.log(why, ':', currentHeight, '<', targetHeight, '5 sec...');
      } catch (reason) {
        console.warn(why, '2:', reason?.message, '5sec...');
      }
      await delay(5000);
    }
  };

  // one tx per block per address
  const myTurn = new Map(); // addr -> blockHeight
  const waitMyTurn = async (why, addr) => {
    const lastTurn = myTurn.get(addr) || 0;
    const nextHeight = await waitForBlock(why, lastTurn + 1);
    myTurn.set(addr, nextHeight);
  };

  // {X: 1} => ['X=1'], using JSON.stringify to mitigate injection risks.
  const bind = obj =>
    entries(obj)
      .filter(([_n, v]) => typeof v !== 'undefined')
      .map(([n, v]) => [`${n}=${JSON.stringify(v)}`])
      .flat();

  return freeze({
    query,
    queryBalance,
    waitForBlock,
    fundAccount: async (ACCT_ADDR, FUNDS) => {
      const a4 = ACCT_ADDR.slice(-4);
      await waitMyTurn(`fund ${a4}`, 'bootstrap');
      await runMake([...bind({ ACCT_ADDR, FUNDS }), 'fund-acct']);
      await waitForBlock(`${a4}'s funds to appear`, 2, true);
      return queryBalance(ACCT_ADDR);
    },
    provisionMine: async ACCT_ADDR =>
      waitMyTurn('provision', ACCT_ADDR).then(() =>
        runMake([...bind({ ACCT_ADDR }), 'provision-my-acct']),
      ),
  });
};
