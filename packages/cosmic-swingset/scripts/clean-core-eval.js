#! /usr/bin/env node
/* global globalThis */
/* eslint-env node */
import '@endo/init/debug.js';
import * as farExports from '@endo/far';
import { isEntrypoint } from '../src/helpers/is-entrypoint.js';

export const compartmentEvaluate = code => {
  // const permit = true;
  // const powers = {};
  const modules = {}; // TODO

  // Inspired by ../repl.js:
  const globals = harden({
    ...modules,
    ...farExports,
    // See https://github.com/Agoric/agoric-sdk/issues/9515
    assert: globalThis.assert,
    console: {
      // Ensure we don't pollute stdout.
      debug: console.warn,
      log: console.warn,
      info: console.warn,
      warn: console.warn,
      error: console.error,
    },
  });

  // Evaluate the code in the context of the globals.
  const compartment = new Compartment(globals);
  harden(compartment.globalThis);
  return compartment.evaluate(code);
};

export const htmlStartCommentPattern = new RegExp(`(${'<'})(!--)`, 'g');
export const htmlEndCommentPattern = new RegExp(`(--)(${'>'})`, 'g');
export const importPattern = new RegExp(
  '(^|[^.])\\bimport(\\s*(?:\\(|/[/*]))',
  'g',
);

// Neutralize HTML comments and import expressions.
export const defangEvaluableCode = code =>
  code
    .replace(importPattern, '$1import\\$2') // avoid SES_IMPORT_REJECTED
    .replace(htmlStartCommentPattern, '$1\\$2') // avoid SES_HTML_COMMENT_REJECTED
    .replace(htmlEndCommentPattern, '$1\\$2'); // avoid SES_HTML_COMMENT_REJECTED

export const main = async (argv, { readFile, stdout }) => {
  const [_node, _script, fn] = argv;
  if (fn === undefined) {
    console.error(`Usage: ${_script} <filename>`);
    process.exit(1);
  }
  const text = await readFile(fn, 'utf-8');
  const clean = defangEvaluableCode(text);
  const withURL = `${clean}\n//# sourceURL=${fn}\n`;

  // end-of-line whitespace disrupts YAML formatting
  const trimmed = withURL.replace(/[\r\t ]+$/gm, '');
  compartmentEvaluate(trimmed);
  stdout.write(trimmed);
};

if (isEntrypoint(import.meta.url)) {
  void farExports.E.when(import('fs/promises'), async fsp =>
    main([...process.argv], {
      readFile: fsp.readFile,
      stdout: process.stdout,
    }),
  ).catch(err => {
    process.exitCode = 1;
    console.error(err);
  });
}
