// @ts-check

import { assert } from '@agoric/assert';
import { Far } from '@endo/marshal';

/**
 * Create an opaque handle object.
 *
 * @template {string} H
 * @param {H} handleType The string literal type of the handle
 * @returns {Handle<H>}
 */
export const makeHandle = handleType => {
  // This assert ensures that handleType is referenced.
  assert.typeof(handleType, 'string', 'handleType must be a string');
  // Return the intersection type (really just an empty object).
  return /** @type {Handle<H>} */ (Far(`${handleType}Handle`));
};
