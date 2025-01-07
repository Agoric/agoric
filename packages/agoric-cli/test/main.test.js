/* global globalThis */
import '@endo/init/pre.js';
import 'esm';
import '@endo/init/debug.js';
import test from 'ava';
import fs from 'fs';
import anylogger from 'anylogger';

import main from '../src/main.js';

test('sanity', async t => {
  const stubAnylogger = () => {
    const l = () => {};
    for (const level of Object.keys(anylogger.levels)) {
      l[level] = () => {};
    }
    return l;
  };
  const myMain = async args => {
    const oldConsole = console;
    try {
      // @ts-expect-error
      globalThis.console = stubAnylogger();
      return main('foo', args, {
        anylogger: stubAnylogger,
        stdout: () => {},
        fs: { readFile: fs.promises.readFile },
      });
    } finally {
      globalThis.console = oldConsole;
    }
  };
  t.is(await myMain(['help']), 0, 'help exits zero');
  t.is(await myMain(['--help']), 0, '--help exits zero');
  t.is(await myMain(['--version']), 0, '--version exits zero');
  t.is(await myMain(['zorgar']), 1, 'unknown command fails');
});
