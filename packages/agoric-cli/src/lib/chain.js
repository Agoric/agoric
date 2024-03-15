// @ts-check
/* global process */
import { agoric } from '@agoric/cosmic-proto';
import { normalizeBech32 as encodeBech32 } from '@cosmjs/encoding';
import { execFileSync as execFileSyncAmbient } from 'child_process';

const agdBinary = 'agd';

/** @typedef {import('type-fest').Opaque<string>} Bech32 */

/**
 *
 * @param {string} str
 * @returns {Bech32}
 */
const normalizeBech32 = str => /** @type {Bech32} */ (encodeBech32(str));

/** @type {Bech32} */
const b1 = normalizeBech32('b1');
/** @type {Bech32} */
// @ts-expect-error
const b2 = 'b2';

console.log(b1, b2);
/**
 * @param {string} literalOrName
 * @param {{ keyringBackend?: string }} opts
 * @param {{ execFileSync: typeof execFileSyncAmbient }} [io]
 */
export const normalizeAddressWithOptions = (
  literalOrName,
  { keyringBackend = undefined } = {},
  io = { execFileSync: execFileSyncAmbient },
) => {
  try {
    return normalizeBech32(literalOrName);
  } catch (_) {
    // not an address so try as a key
    const backendOpt = keyringBackend
      ? [`--keyring-backend=${keyringBackend}`]
      : [];
    const buff = io.execFileSync(agdBinary, [
      `keys`,
      ...backendOpt,
      `show`,
      `--address`,
      literalOrName,
    ]);
    return normalizeBech32(buff.toString().trim());
  }
};
harden(normalizeAddressWithOptions);

/**
 * @param {ReadonlyArray<string>} swingsetArgs
 * @param {import('./rpc.js').MinimalNetworkConfig & {
 *   from: string,
 *   fees?: string,
 *   dryRun?: boolean,
 *   verbose?: boolean,
 *   keyring?: {home?: string, backend: string}
 *   stdout?: Pick<import('stream').Writable, 'write'>
 *   execFileSync?: typeof import('child_process').execFileSync
 * }} opts
 */
export const execSwingsetTransaction = (swingsetArgs, opts) => {
  const {
    from,
    fees,
    dryRun = false,
    verbose = true,
    keyring = undefined,
    chainName,
    rpcAddrs,
    stdout = process.stdout,
    execFileSync = execFileSyncAmbient,
  } = opts;
  const homeOpt = keyring?.home ? [`--home=${keyring.home}`] : [];
  const backendOpt = keyring?.backend
    ? [`--keyring-backend=${keyring.backend}`]
    : [];
  const feeOpt = fees ? ['--fees', fees] : [];
  const cmd = [`--node=${rpcAddrs[0]}`, `--chain-id=${chainName}`].concat(
    homeOpt,
    backendOpt,
    feeOpt,
    [`--from=${from}`, 'tx', 'swingset'],
    swingsetArgs,
  );

  if (dryRun) {
    stdout.write(`Run this interactive command in shell:\n\n`);
    stdout.write(`${agdBinary} `);
    stdout.write(cmd.join(' '));
    stdout.write('\n');
  } else {
    const yesCmd = cmd.concat(['--yes']);
    if (verbose) console.log('Executing ', yesCmd);
    const out = execFileSync(agdBinary, yesCmd, { encoding: 'utf-8' });

    // agd puts this diagnostic on stdout rather than stderr :-/
    // "Default sign-mode 'direct' not supported by Ledger, using sign-mode 'amino-json'.
    if (out.startsWith('Default sign-mode')) {
      const stripDiagnostic = out.replace(/^Default[^\n]+\n/, '');
      return stripDiagnostic;
    }
    return out;
  }
};
harden(execSwingsetTransaction);

/**
 *
 * @param {import('./rpc.js').MinimalNetworkConfig} net
 * @returns {Promise<import('@agoric/cosmic-proto/dist/codegen/agoric/swingset/swingset').Params>}
 */
export const fetchSwingsetParams = async net => {
  const { rpcAddrs } = net;
  const rpcEndpoint = rpcAddrs[0];
  const client = await agoric.ClientFactory.createRPCQueryClient({
    rpcEndpoint,
  });
  const { params } = await client.agoric.swingset.params();
  return params;
};
harden(fetchSwingsetParams);

/**
 * @param {import('./rpc.js').MinimalNetworkConfig & {
 *   execFileSync: typeof import('child_process').execFileSync,
 *   delay: (ms: number) => Promise<void>,
 *   period?: number,
 *   retryMessage?: string,
 * }} opts
 * @returns {<T>(l: (b: { time: string, height: string }) => Promise<T>) => Promise<T>}
 */
export const pollBlocks = opts => async lookup => {
  const { execFileSync, delay, rpcAddrs, period = 3 * 1000 } = opts;
  const { retryMessage } = opts;

  const nodeArgs = [`--node=${rpcAddrs[0]}`];

  await null; // separate sync prologue

  for (;;) {
    const sTxt = execFileSync(agdBinary, ['status', ...nodeArgs]);
    const status = JSON.parse(sTxt.toString());
    const {
      SyncInfo: { latest_block_time: time, latest_block_height: height },
    } = status;
    try {
      // see await null above
      const result = await lookup({ time, height });
      return result;
    } catch (_err) {
      console.error(
        time,
        retryMessage || 'not in block',
        height,
        'retrying...',
      );
      await delay(period);
    }
  }
};

/**
 * @param {string} txhash
 * @param {import('./rpc.js').MinimalNetworkConfig & {
 *   execFileSync: typeof import('child_process').execFileSync,
 *   delay: (ms: number) => Promise<void>,
 *   period?: number,
 * }} opts
 */
export const pollTx = async (txhash, opts) => {
  const { execFileSync, rpcAddrs, chainName } = opts;

  const nodeArgs = [`--node=${rpcAddrs[0]}`];
  const outJson = ['--output', 'json'];

  const lookup = async () => {
    const out = execFileSync(
      agdBinary,
      [
        'query',
        'tx',
        txhash,
        `--chain-id=${chainName}`,
        ...nodeArgs,
        ...outJson,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    // XXX this type is defined in a .proto file somewhere
    /** @type {{ height: string, txhash: string, code: number, timestamp: string }} */
    const info = JSON.parse(out.toString());
    return info;
  };
  return pollBlocks({ ...opts, retryMessage: 'tx not in block' })(lookup);
};
