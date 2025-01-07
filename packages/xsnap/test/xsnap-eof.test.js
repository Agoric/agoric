import test from 'ava';
import * as proc from 'child_process';
import * as os from 'os';
import fs from 'fs';
import { fileURLToPath, URL } from 'url';
import { tmpName } from 'tmp';
import { text } from 'stream/consumers';
import { makePromiseKit } from '@endo/promise-kit';
import { options } from './message-tools.js';
import { xsnap } from '../src/xsnap.js';
import { ExitCode } from '../api.js';

/**
 * @import { Readable, Writable, Duplex } from 'stream'
 */

/**
 * @typedef {Omit<import("child_process").ChildProcess, 'stdio'> &
 *   {
 *     stdin: null;
 *     stdout: Readable;
 *     stderr: Readable;
 *     readonly stdio: [null, Readable, Readable, Duplex, Duplex, undefined, undefined, Duplex, Duplex];
 *   }
 * } XsnapChildProcess
 */

test('xsnap-worker complains while waiting for answer when parent is killed', async t => {
  const exitedPKit = makePromiseKit();

  const child =
    /** @type {import("child_process").ChildProcessWithoutNullStreams} */ (
      proc.fork(
        fileURLToPath(
          new URL(
            './fixture-xsnap-kill-parent-in-handlecommand.js',
            import.meta.url,
          ),
        ),
        { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] },
      )
    );

  const outP = text(child.stdout);
  const errP = text(child.stderr);

  child.on('error', err => {
    exitedPKit.reject(err);
  });

  child.on('exit', (code, signal) => {
    exitedPKit.resolve({ code, signal });
  });

  const [strOut, strErr, { code: nodeExitCode, signal: nodeExitSignal }] =
    await Promise.all([outP, errP, exitedPKit.promise]);

  t.is(strOut, '', 'stdout must be empty');
  t.regex(
    strErr,
    /Has parent died\?/,
    'stderr must contain "Has parent died?"',
  );
  t.is(nodeExitCode, null, 'exit code must be null');
  t.is(nodeExitSignal, 'SIGKILL', 'exit signal must be "SIGKILL"');
});

/**
 * Launch an xsnap vat that responds to every command by issuing an empty
 * request of its own, to be received by the provided `handleCommand`.
 * Returns the vat along with values capturing its surface area (ChildProcess
 * object and exit promise, command input/output streams, and promises for
 * stdout/stderr text).
 *
 * @param {import('../src/xsnap.js').XSnapOptions['handleCommand']} handleCommand
 */
async function spawnReflectiveWorker(handleCommand) {
  const exitedPKit = makePromiseKit();
  /** @type {XsnapChildProcess | undefined} */
  let xsnapProcess;

  /** @type {typeof import('child_process').spawn} */
  const spawnSpy = (...args) => {
    // @ts-expect-error overloaded signature
    const cp = proc.spawn(...args);
    xsnapProcess = cp;
    return cp;
  };

  const io = { spawn: spawnSpy, os: os.type(), fs, tmpName };
  const vat = await xsnap({
    ...options(io),
    handleCommand,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  await vat.evaluate(
    'function handleCommand(message) { issueCommand(new Uint8Array().buffer); };',
  );

  assert(xsnapProcess);

  const toXsnap = xsnapProcess.stdio[3];
  const fromXsnap = xsnapProcess.stdio[4];
  const stderrP = text(xsnapProcess.stderr);
  const stdoutP = text(xsnapProcess.stdout);

  xsnapProcess.on('error', err => {
    exitedPKit.reject(err);
  });

  xsnapProcess.on('exit', (code, signal) => {
    exitedPKit.resolve({ code, signal });
  });

  return {
    vat,
    xsnapProcess,
    toXsnap,
    fromXsnap,
    stdoutP,
    stderrP,
    exitedP: exitedPKit.promise,
  };
}

/**
 * @typedef {Awaited<ReturnType<spawnReflectiveWorker>>} ReflectiveWorker
 */

/**
 * @param {ReflectiveWorker} worker
 * @param {(worker: ReflectiveWorker) => Promise<unknown>} beforeWait
 * @param {(worker: ReflectiveWorker) => Promise<unknown>} afterWait
 */
async function expectTermination(worker, beforeWait, afterWait) {
  let beforeWaitError;
  let afterWaitError;
  const { stdoutP, stderrP, exitedP } = worker;

  try {
    // this may error out since we are intentionally
    // breaking communications with the worker
    await beforeWait(worker); // vat.issueStringCommand('0');
  } catch (err) {
    beforeWaitError = err;
  }

  // wait for the worker to exit
  const [strOut, strErr, { code: vatExitCode, signal: vatExitSignal }] =
    await Promise.all([stdoutP, stderrP, exitedP]);

  try {
    // this may error out since vat has died.
    await afterWait(worker); // vat.close();
  } catch (err) {
    afterWaitError = err;
  }
  return {
    beforeWaitError,
    afterWaitError,
    strOut,
    strErr,
    vatExitCode,
    vatExitSignal,
  };
}

function verifyStdError(t, results, expectedStderr) {
  const {
    beforeWaitError,
    afterWaitError,
    strOut,
    strErr,
    vatExitCode,
    vatExitSignal,
  } = results;

  t.not(beforeWaitError, undefined, 'issueCommand() must produce an error');
  t.not(afterWaitError, undefined, 'vat.close() must produce an error');
  t.is(vatExitSignal, null, 'vat exit signal must be null');
  t.is(
    vatExitCode,
    ExitCode.E_IO_ERROR,
    'vat exit code must indicate an IO error',
  );
  t.is(strOut, '', 'stdout must be empty');
  t.is(strErr, expectedStderr, 'stderr must indicate expected error');
}

const testInterruption = test.macro(
  /**
   * @param {import('ava').ExecutionContext} t
   * @param {(worker: ReflectiveWorker) => Promise<unknown>} beforeWait
   * @param {(worker: ReflectiveWorker, message: Uint8Array) => Promise<Uint8Array>} onRequest
   * @param {(worker: ReflectiveWorker) => Promise<unknown>} afterWait
   * @param {(t: import('ava').ExecutionContext, results: Awaited<ReturnType<expectTermination>>) => void} verifyResults
   */
  async (t, beforeWait, onRequest, afterWait, verifyResults) => {
    const handleCommand = async message => {
      return onRequest(worker, message);
    };
    const worker = await spawnReflectiveWorker(handleCommand);
    const results = await expectTermination(worker, beforeWait, afterWait);
    verifyResults(t, results);
  },
);

test(
  'xsnap-worker complains while trying to READ a query answer when pipes are closed',
  testInterruption,
  async worker => worker.vat.issueStringCommand('0'),
  async function onRequest(worker, _message) {
    // the worker is blocked on read here, so closing "toXsnap" pipe
    // should cause an immediate read error on worker side.
    worker.toXsnap.end();
    worker.toXsnap.destroy();
    return new Uint8Array();
  },
  async worker => worker.vat.close(),
  (t, results) =>
    verifyStdError(t, results, 'Got EOF on netstring read. Has parent died?\n'),
);

test(
  'xsnap-worker complains while trying to WRITE a command result when pipes are closed',
  testInterruption,
  async worker => worker.vat.issueStringCommand('0'),
  async function onRequest(worker, _message) {
    // The worker is blocked on read here, so closing "fromXsnap" pipe
    // does not cause an immediate exit. However, an attempt to send an
    // answer back to us will cause a write error with a SIGPIPE.
    worker.fromXsnap.end();
    worker.fromXsnap.destroy();
    return new Uint8Array();
  },
  async worker => worker.vat.close(),
  (t, results) =>
    verifyStdError(t, results, 'Caught SIGPIPE. Has parent died?\n'),
);

test(
  'xsnap-worker exits quietly when pipes are closed in quiescent state (waiting to READ a command)',
  testInterruption,
  async worker => {
    // Simulating an orderly shutdown in quiescent state by closing both pipes.
    // The worker is blocked on read here, so we should close "fromXsnap" pipe first
    worker.fromXsnap.end();
    worker.fromXsnap.destroy();
    worker.toXsnap.end();
    worker.toXsnap.destroy();
  },
  async function onRequest(_worker, _message) {
    throw new Error('handleCommand() / onRequest() must never trigger');
  },
  async worker => worker.vat.close(),
  (t, results) => {
    const {
      beforeWaitError,
      afterWaitError,
      strOut,
      strErr,
      vatExitCode,
      vatExitSignal,
    } = results;

    t.is(beforeWaitError, undefined, 'worker pipes must close without error');
    t.is(afterWaitError, undefined, 'vat.close() must not produce an error');
    t.is(vatExitSignal, null, 'vat exit signal must be null');
    t.is(
      vatExitCode,
      ExitCode.E_SUCCESS,
      'vat exit code must indicate success',
    );
    t.is(strOut, '', 'stdout must be empty');
    t.is(strErr, '', 'stderr must be empty');
  },
);

test(
  'xsnap-worker complains while trying to WRITE a query when pipes are closed',
  testInterruption,
  async worker => {
    // The worker is blocked on reading a command here, so we close "fromXsnap" pipe before
    // issuing a command. This will trigger worker's handleCommand(), which will
    // attempt to issueCommand() (query) back to us.
    worker.fromXsnap.end();
    worker.fromXsnap.destroy();
    await worker.vat.issueStringCommand('0');
  },
  async function onRequest(_worker, _message) {
    throw new Error('handleCommand() / onRequest() must never trigger');
  },
  async worker => worker.vat.close(),
  (t, results) =>
    verifyStdError(t, results, 'Caught SIGPIPE. Has parent died?\n'),
);
