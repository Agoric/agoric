/* global globalThis */
// Copyright (C) 2019 Agoric, under Apache License 2.0
// @ts-check
/// <reference types="ses"/>

// This module assumes the existence of a non-standard `assert` host object.
// SES version 0.11.0 introduces this global object and entangles it
// with the `console` host object in scope when it initializes,
// allowing errors, particularly assertion errors, to hide their "details"
// from callers that might catch those errors, then reveal them to the
// underlying console.
// To the extent that this `console` is considered a resource,
// this module must be considered a resource module.

// The assertions re-exported here are defined in
// https://github.com/endojs/endo/blob/master/packages/ses/src/error/assert.js

const { freeze } = Object;

/** @type {import('ses').Assert} */
const globalAssert = globalThis.assert;

if (globalAssert === undefined) {
  throw new Error(
    `Cannot initialize @agoric/assert, missing globalThis.assert, import 'ses' before '@agoric/assert'`,
  );
}

const missing = [
  'fail',
  'equal',
  'typeof',
  'string',
  'note',
  'details',
  'quote',
  'makeAssert',
].filter(name => globalAssert[name] === undefined);
if (missing.length > 0) {
  throw new Error(
    `Cannot initialize @agoric/assert, missing globalThis.assert methods ${missing.join(
      ', ',
    )}`,
  );
}

const { details, quote, makeAssert, Fail } = globalAssert;

export {
  globalAssert as assert,
  details,
  quote,
  makeAssert,
  Fail,
  // conventional aliases
  details as X,
  quote as q,
};

/**
 * @template T
 * @param {T | null | undefined} val
 * @param {string} [optDetails]
 * @returns {T}
 */
export const NonNullish = (val, optDetails = `unexpected ${quote(val)}`) => {
  if (val != null) {
    // This `!= null` idiom checks that `val` is neither `null` nor `undefined`.
    return val;
  }
  assert.fail(optDetails);
};
harden(NonNullish);

/**
 * Prepend the correct indefinite article onto a noun, typically a typeof result
 * e.g., "an Object" vs. "a Number"
 *
 * @deprecated
 * @param {string} str The noun to prepend
 * @returns {string} The noun prepended with a/an
 */
function an(str) {
  str = `${str}`;
  if (str.length >= 1 && 'aeiouAEIOU'.includes(str[0])) {
    return `an ${str}`;
  }
  return `a ${str}`;
}
freeze(an);
export { an };

/**
 * In the `assertFoo`/`isFoo`/`checkFoo` pattern, `checkFoo` has a `check`
 * parameter of type `Checker`. `assertFoo` calls `checkFoo` passes
 * `assertChecker` as the `check` argument. `isFoo` passes `identChecker`
 * as the `check` argument. `identChecker` acts precisely like an
 * identity function, but is typed as a `Checker` to indicate its
 * intended use.
 *
 * @type {import('@endo/marshal').Checker}
 */
export const identChecker = (cond, _details) => cond;
harden(identChecker);
