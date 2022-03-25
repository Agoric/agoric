// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import '@endo/init';

import * as proc from 'child_process';
import * as os from 'os';
import * as fs from 'fs';

import { xsnap } from '../src/xsnap.js';

import { options, loader } from './message-tools.js';

const io = { spawn: proc.spawn, os: os.type() }; // WARNING: ambient
const ld = loader(import.meta.url, fs.promises.readFile);

/**
 * @param {string} name
 * @param {string} script To execute
 * @param {boolean} [savePrinted]
 */
async function bootWorker(name, script, savePrinted = false) {
  const opts = options(io);
  const worker = xsnap({ ...opts, name });

  const preface = savePrinted
    ? `
    globalThis.printed = [];
    const rawPrint = print;
    globalThis.print = (...args) => {
      rawPrint(...args);
      printed.push(args);
    }
  `
    : 'null';
  await worker.evaluate(preface);

  await worker.evaluate(script);
  await worker.evaluate(`
    const encoder = new TextEncoder();
    const send = msg => issueCommand(encoder.encode(JSON.stringify(msg)).buffer);
    globalThis.send = send;
  `);
  return { worker, opts };
}

/**
 * @param {string} name
 * @param {boolean} [savePrinted]
 */
async function bootSESWorker(name, savePrinted = false) {
  const bootScript = await ld.asset('../dist/bundle-ses-boot.umd.js');
  return bootWorker(name, bootScript, savePrinted);
}

test('bootstrap to SES lockdown', async t => {
  const bootScript = await ld.asset('../dist/bundle-ses-boot.umd.js');
  const opts = options(io);
  const name = 'SES lockdown worker';
  const vat = xsnap({ ...opts, name });
  await vat.evaluate(bootScript);
  t.deepEqual([], opts.messages);

  await vat.evaluate(`
    const encoder = new TextEncoder();
    globalThis.send = msg => issueCommand(encoder.encode(JSON.stringify(msg)).buffer);
  `);
  await vat.evaluate(`
    send([ typeof harden, typeof Compartment, typeof HandledPromise ]);
  `);
  await vat.close();
  t.deepEqual(['["function","function","function"]'], opts.messages);
});

test('child compartment cannot access start powers', async t => {
  const { worker: vat, opts } = await bootSESWorker(t.title);

  const script = await ld.asset('escapeCompartment.js');
  await vat.evaluate(script);
  await vat.close();

  // Temporarily tolerate Endo behavior before and after
  // https://github.com/endojs/endo/pull/822
  // TODO Simplify once depending on SES post #822
  // t.deepEqual(opts.messages, [
  //   'err was TypeError: Function.prototype.constructor is not a valid constructor.',
  // ]);
  t.assert(
    opts.messages[0] === 'err was TypeError: Not available' ||
      opts.messages[0] ===
        'err was TypeError: Function.prototype.constructor is not a valid constructor.',
  );
});

test('SES deep stacks work on xsnap', async t => {
  const { worker: vat, opts } = await bootSESWorker(t.title);
  await vat.evaluate(`
    const encoder = new TextEncoder();
    const send = msg => issueCommand(encoder.encode(JSON.stringify(msg)).buffer);

    const err = Error('msg');
    send('stack' in err);
    const msg = getStackString(err);
    send(msg);
  `);
  const [stackInErr, msg] = opts.messages.map(s => JSON.parse(s));
  t.assert(!stackInErr);
  t.is(typeof msg, 'string');
  t.assert(msg.length >= 1);
});

test('TextDecoder under xsnap handles TypedArray and subarrays', async t => {
  const { worker: vat, opts } = await bootSESWorker(t.title);
  await vat.evaluate(`
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const send = msg => issueCommand(encoder.encode(JSON.stringify(msg)).buffer);

    const string = '0123456789';
    const bytes = encoder.encode(string).subarray(1, 4);
    send(bytes instanceof Uint8Array);
    send(ArrayBuffer.isView(bytes));
    const restring = decoder.decode(bytes);
    send(restring === string.slice(1, 4));
  `);
  for (const pass of opts.messages.map(s => JSON.parse(s))) {
    t.assert(pass);
  }
});

test('console - symbols', async t => {
  // our console-shim.js handles Symbol specially
  const { worker: vat, opts } = await bootSESWorker(t.title);
  t.deepEqual([], opts.messages);
  await vat.evaluate(`
    const encoder = new TextEncoder();
    globalThis.send = msg => issueCommand(encoder.encode(JSON.stringify(msg)).buffer);
    console.log('console:', 123);
    console.log('console:', Symbol('anonymous'));
    console.log('console:', Symbol.for('registered'));
    send('ok');
  `);
  await vat.close();
  t.deepEqual(['"ok"'], opts.messages);
});

test('console - objects should include detail', async t => {
  function runInWorker() {
    // This was getting logged as [object Object]
    const richStructure = {
      prop1: ['elem1a', 'elem1b'],
      prop2: ['elem2a', 'elem2b'],
    };

    // Let's check the rest of these while we're at it.
    const primitive = [
      undefined,
      null,
      true,
      false,
      123,
      'abc',
      123n,
      Symbol('x'),
    ];
    const compound = [
      richStructure,
      new ArrayBuffer(10),
      new Promise(_r => null),
      new Error('oops!'),
    ];
    const { details: X } = assert;

    try {
      assert.fail(X`assertion text ${richStructure}`);
    } catch (e) {
      console.error(e);
    }
    console.log('primitive:', ...primitive);
    console.log('compound:', ...compound);
  }

  // start a worker with the SES shim plus a global that captures args to print()
  const { worker, opts } = await bootSESWorker(t.title, true);

  await worker.evaluate(`(${runInWorker})()`);

  // send all args to print(), which come from console methods
  // filter stack traces so that we're insensitive to line number changes
  // filter lockdown warnings
  await worker.evaluate(`
  const isStackTrace = args => args[0].startsWith('Error: ');
  const isLockdownWarning = args => args[0].startsWith('Removing intrinsics.');
  const relevant = args => (args.length && !isStackTrace(args) && !isLockdownWarning(args));
  const argStrings = args => args.map(a => a.toString());
  send(printed.filter(relevant).map(argStrings));
  `);
  t.deepEqual(
    opts.messages.map(s => JSON.parse(s)),
    [
      [
        ['(Error#1)'],
        [
          'Error#1:',
          'assertion text',
          `{ prop1: [ 'elem1a', 'elem1b' ], prop2: [ 'elem2a', 'elem2b' ] }`,
        ],
        [
          'primitive:',
          'undefined',
          'null',
          'true',
          'false',
          '123',
          'abc',
          '123n',
          'Symbol(x)',
        ],
        [
          'compound:',
          `{ prop1: [ 'elem1a', 'elem1b' ], prop2: [ 'elem2a', 'elem2b' ] }`,
          `ArrayBuffer [ArrayBuffer] {}`,
          'Promise [Promise] {}',
          '(Error#2)',
        ],
        ['Error#2:', 'oops!'],
      ],
    ],
  );
});
