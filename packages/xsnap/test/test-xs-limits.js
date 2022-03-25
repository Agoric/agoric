// XS resource exhaustion tests

import '@endo/init';

// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import * as proc from 'child_process';
import * as os from 'os';

import { xsnap } from '../src/xsnap.js';
import { ExitCode } from '../api.js';

import { options } from './message-tools.js';

const io = { spawn: proc.spawn, os: os.type() }; // WARNING: ambient

test('heap exhaustion: orderly fail-stop', async t => {
  const grow = `
  let stuff = '1234';
  while (true) {
    stuff = stuff + stuff;
  }
  `;
  for (const debug of [false, true]) {
    const vat = xsnap({ ...options(io), meteringLimit: 0, debug });
    t.teardown(() => vat.terminate());
    // eslint-disable-next-line no-await-in-loop
    await t.throwsAsync(vat.evaluate(grow), {
      code: ExitCode.E_NOT_ENOUGH_MEMORY,
    });
  }
});

test('property name space exhaustion: orderly fail-stop', async t => {
  const grow = qty => `
  const objmap = {};
  try {
    for (let ix = 0; ix < ${qty}; ix += 1) {
      const key = \`k\${ix}\`;
      objmap[key] = 1;
      if (!(key in objmap)) {
        throw Error(key);
      }
    }
  } catch (err) {
    // name space exhaustion should not be catchable!
    // spin and fail with "too much computation"
    for (;;) {}
  }
  `;
  for (const debug of [false, true]) {
    const vat = xsnap({ ...options(io), meteringLimit: 0, debug });
    t.teardown(() => vat.terminate());
    t.log({ debug, qty: 31000 });
    // eslint-disable-next-line no-await-in-loop
    await t.notThrowsAsync(vat.evaluate(grow(31000)));
    t.log({ debug, qty: 4000000000 });
    // eslint-disable-next-line no-await-in-loop
    await t.throwsAsync(vat.evaluate(grow(4000000000)), {
      code: ExitCode.E_NO_MORE_KEYS,
    });
  }
});

/** @typedef {[number | undefined, number, string | null]} TestCase */
(() => {
  const grow = qty => `
  const send = it => issueCommand(new TextEncoder().encode(JSON.stringify(it)).buffer);
  let expr = \`"\${Array(${qty}).fill('abcd').join('')}"\`;
  try {
    eval(expr);
    send(expr.length);
  } catch (err) {
    send(err.message);
  }
  `;
  for (const debug of [false, true]) {
    for (const [parserBufferSize, qty, failure] of /** @type {TestCase[]} */ ([
      [undefined, 100, null],
      [undefined, (8192 * 1024) / 4 + 100, 'buffer overflow'],
      [2, 10, null],
      [2, 50000, 'buffer overflow'],
    ])) {
      test(`parser buffer size ${
        parserBufferSize || 'default'
      }k; rep ${qty}; debug ${debug}`, async t => {
        const opts = { ...options(io), meteringLimit: 1e8, debug };
        const vat = xsnap({ ...opts, parserBufferSize });
        t.teardown(() => vat.terminate());
        const expected = failure ? [failure] : [qty * 4 + 2];
        // eslint-disable-next-line no-await-in-loop
        await t.notThrowsAsync(vat.evaluate(grow(qty)));
        t.deepEqual(
          expected,
          opts.messages.map(txt => JSON.parse(txt)),
        );
      });
    }
  }
})();

(() => {
  const challenges = [
    'new Uint8Array(2_130_706_417)',
    'new Uint16Array(1_065_353_209)',
    'new Uint32Array(532_676_605)',
    'new BigUint64Array(266_338_303);',
    'new Array(66_584_576).fill(0)',
    '(new Array(66_584_575).fill(0))[66_584_575] = 0;',
  ];

  for (const statement of challenges) {
    test(`large sizes - abort cluster: ${statement}`, async t => {
      const vat = xsnap(options(io));
      t.teardown(() => vat.terminate());
      // eslint-disable-next-line no-await-in-loop
      await t.throwsAsync(
        vat.evaluate(`
        (() => {
          try {
            // can't catch memory full
            ${statement}\n
          } catch (ignore) {
            // ignore
          }
        })()`),
        { code: ExitCode.E_NOT_ENOUGH_MEMORY },
      );
    });
  }
})();
