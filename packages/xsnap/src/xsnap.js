/* global process */
// @ts-check
/* eslint no-await-in-loop: ["off"] */

/** @typedef {typeof import('child_process').spawn} Spawn */

/**
 * @template T
 * @typedef {import('./defer').Deferred<T>} Deferred
 */

import { makeNetstringReader, makeNetstringWriter } from '@endo/netstring';
import { makeNodeReader, makeNodeWriter } from '@endo/stream-node';
import { ErrorCode, ErrorSignal, ErrorMessage, METER_TYPE } from '../api.js';
import { defer } from './defer.js';

// This will need adjustment, but seems to be fine for a start.
export const DEFAULT_CRANK_METERING_LIMIT = 1e8;

const OK = '.'.charCodeAt(0);
const ERROR = '!'.charCodeAt(0);
const QUERY = '?'.charCodeAt(0);

const OK_SEPARATOR = 1;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const { freeze } = Object;

/**
 * @param {Uint8Array} arg
 * @returns {Uint8Array}
 */
function echoCommand(arg) {
  return arg;
}

/**
 * @param {XSnapOptions} options
 *
 * @typedef {Object} XSnapOptions
 * @property {string} os
 * @property {Spawn} spawn
 * @property {(request: Uint8Array) => Promise<Uint8Array>} [handleCommand]
 * @property {string} [name]
 * @property {boolean} [debug]
 * @property {number} [parserBufferSize] In kB (must be an integer)
 * @property {string} [snapshot]
 * @property {'ignore' | 'inherit'} [stdout]
 * @property {'ignore' | 'inherit'} [stderr]
 * @property {number} [meteringLimit]
 * @property {Record<string, string>} [env]
 */
export function xsnap(options) {
  const {
    os,
    spawn,
    name = '<unnamed xsnap worker>',
    handleCommand = echoCommand,
    debug = false,
    parserBufferSize = undefined,
    snapshot = undefined,
    stdout = 'ignore',
    stderr = 'ignore',
    meteringLimit = DEFAULT_CRANK_METERING_LIMIT,
    env = process.env,
  } = options;

  const platform = {
    Linux: 'lin',
    Darwin: 'mac',
    Windows_NT: 'win',
  }[os];

  if (platform === undefined) {
    throw new Error(`xsnap does not support platform ${os}`);
  }

  let bin = new URL(
    `../xsnap-native/xsnap/build/bin/${platform}/${
      debug ? 'debug' : 'release'
    }/xsnap-worker`,
    import.meta.url,
  ).pathname;

  /** @type {Deferred<void>} */
  const vatExit = defer();

  let args = [name];
  if (snapshot) {
    args.push('-r', snapshot);
  }
  if (meteringLimit) {
    args.push('-l', `${meteringLimit}`);
  }
  if (parserBufferSize) {
    args.push('-s', `${parserBufferSize}`);
  }

  if (env.XSNAP_DEBUG_RR) {
    args = [bin, ...args];
    bin = 'rr';
    console.log('XSNAP_DEBUG_RR', { bin, args });
  }
  const xsnapProcess = spawn(bin, args, {
    stdio: ['ignore', stdout, stderr, 'pipe', 'pipe'],
  });

  xsnapProcess.on('exit', (code, signal) => {
    if (code === 0) {
      vatExit.resolve();
    } else if (signal !== null) {
      const reason = new ErrorSignal(
        signal,
        `${name} exited due to signal ${signal}`,
      );
      vatExit.reject(reason);
    } else if (code === null) {
      throw TypeError('null code???');
    } else {
      const reason = new ErrorCode(
        code,
        `${name} exited: ${ErrorMessage[code] || 'unknown error'}`,
      );
      vatExit.reject(reason);
    }
  });

  const vatCancelled = vatExit.promise.then(() => {
    throw Error(`${name} exited`);
  });

  const writer = xsnapProcess.stdio[3];
  const reader = xsnapProcess.stdio[4];

  const messagesToXsnap = makeNetstringWriter(
    makeNodeWriter(/** @type {import('stream').Writable} */ (writer)),
  );
  const messagesFromXsnap = makeNetstringReader(
    makeNodeReader(/** @type {import('stream').Readable} */ (reader)),
  );

  /** @type {Promise<void>} */
  let baton = Promise.resolve();

  /**
   * @template T
   * @typedef {Object} RunResult
   * @property {T} reply
   * @property {{
   *   meterType: string;
   *   allocate: number | null;
   *   compute: number | null;
   * }} meterUsage
   */

  /** @returns {Promise<RunResult<Uint8Array>>} */
  async function runToIdle() {
    for (;;) {
      const iteration = await messagesFromXsnap.next(undefined);
      if (iteration.done) {
        xsnapProcess.kill();
        return vatCancelled;
      }
      const { value: message } = iteration;
      if (message.byteLength === 0) {
        // A protocol error kills the xsnap child process and breaks the baton
        // chain with a terminal error.
        xsnapProcess.kill();
        throw new Error('xsnap protocol error: received empty message');
      } else if (message[0] === OK) {
        let meterInfo = { compute: null, allocate: null };
        const meterSeparator = message.indexOf(OK_SEPARATOR, 1);
        if (meterSeparator >= 0) {
          // The message is `.meterdata\1reply`.
          const meterData = message.slice(1, meterSeparator);
          // We parse the meter data as JSON
          meterInfo = JSON.parse(decoder.decode(meterData));
          // assert(typeof meterInfo === 'object');
        }
        const meterUsage = {
          meterType: METER_TYPE,
          ...meterInfo,
        };
        // console.log('have meterUsage', meterUsage);
        return {
          reply: message.subarray(meterSeparator < 0 ? 1 : meterSeparator + 1),
          meterUsage,
        };
      } else if (message[0] === ERROR) {
        throw new Error(
          `Uncaught exception in ${name}: ${decoder.decode(
            message.subarray(1),
          )}`,
        );
      } else if (message[0] === QUERY) {
        await messagesToXsnap.next(await handleCommand(message.subarray(1)));
      }
    }
  }

  /**
   * @param {string} code
   * @returns {Promise<RunResult<Uint8Array>>}
   */
  async function evaluate(code) {
    const result = baton.then(async () => {
      await messagesToXsnap.next(encoder.encode(`e${code}`));
      return runToIdle();
    });
    baton = result.then(() => {}).catch(() => {});
    return Promise.race([vatCancelled, result]);
  }

  /**
   * @param {string} fileName
   * @returns {Promise<void>}
   */
  async function execute(fileName) {
    const result = baton.then(async () => {
      await messagesToXsnap.next(encoder.encode(`s${fileName}`));
      await runToIdle();
    });
    baton = result.catch(() => {});
    return Promise.race([vatCancelled, result]);
  }

  /**
   * @param {string} fileName
   * @returns {Promise<void>}
   */
  async function importModule(fileName) {
    const result = baton.then(async () => {
      await messagesToXsnap.next(encoder.encode(`m${fileName}`));
      await runToIdle();
    });
    baton = result.catch(() => {});
    return Promise.race([vatCancelled, result]);
  }

  /** @returns {Promise<void>} */
  async function isReady() {
    const result = baton.then(async () => {
      await messagesToXsnap.next(encoder.encode(`R`));
      await runToIdle();
    });
    baton = result.catch(() => {});
    return Promise.race([vatCancelled, result]);
  }

  /**
   * @param {Uint8Array} message
   * @returns {Promise<RunResult<Uint8Array>>}
   */
  async function issueCommand(message) {
    const result = baton.then(async () => {
      const request = new Uint8Array(message.length + 1);
      request[0] = QUERY;
      request.set(message, 1);
      await messagesToXsnap.next(request);
      return runToIdle();
    });
    baton = result.then(
      () => {},
      () => {},
    );
    return Promise.race([vatCancelled, result]);
  }

  /**
   * @param {string} message
   * @returns {Promise<RunResult<string>>}
   */
  async function issueStringCommand(message) {
    const result = await issueCommand(encoder.encode(message));
    return { ...result, reply: decoder.decode(result.reply) };
  }

  /**
   * @param {string} file
   * @returns {Promise<void>}
   */
  async function writeSnapshot(file) {
    const result = baton.then(async () => {
      await messagesToXsnap.next(encoder.encode(`w${file}`));
      await runToIdle();
    });
    baton = result.catch(() => {});
    return Promise.race([vatExit.promise, baton]);
  }

  /** @returns {Promise<void>} */
  async function close() {
    baton = baton.then(async () => {
      await messagesToXsnap.return(undefined);
      throw new Error(`${name} closed`);
    });
    baton.catch(() => {}); // Suppress Node.js unhandled exception warning.
    return vatExit.promise;
  }

  /** @returns {Promise<void>} */
  async function terminate() {
    xsnapProcess.kill();
    baton = Promise.reject(new Error(`${name} terminated`));
    baton.catch(() => {}); // Suppress Node.js unhandled exception warning.
    // Mute the vatExit exception: it is expected.
    return vatExit.promise.catch(() => {});
  }

  return freeze({
    name,
    issueCommand,
    issueStringCommand,
    isReady,
    close,
    terminate,
    evaluate,
    execute,
    import: importModule,
    snapshot: writeSnapshot,
  });
}
