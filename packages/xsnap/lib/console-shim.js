/* global globalThis, print */

import inspect from './object-inspect.js';

const printAll = (...args) => {
  // Though xsnap doesn't have a whole console, it does have print().
  //
  // We use inspect to render non-string arguments to strings.
  //
  // eslint-disable-next-line no-restricted-globals
  print(...args.map(v => (typeof v === 'string' ? v : inspect(v))));
};

const noop = _ => {};

/**
 * Since SES expects (requires?) a console, provide one based on xsnap's print.
 * Note that this runs in the start compartment, before lockdown.
 *
 * See https://github.com/Agoric/agoric-sdk/issues/2146
 */
const console = {
  debug: printAll,
  log: printAll,
  info: printAll,
  warn: printAll,
  error: printAll,

  trace: noop,
  dirxml: noop,
  group: noop,
  groupCollapsed: noop,
  groupEnd: noop,

  assert: noop,
  timeLog: noop,

  clear: noop,
  count: noop,
  countReset: noop,
  dir: noop,

  table: noop,
  time: noop,
  timeEnd: noop,
  profile: noop,
  profileEnd: noop,
  timeStamp: noop,
};

globalThis.console = console;
