import { assert } from '@agoric/assert';

import { createHash } from 'crypto';

/**
 * @typedef {(initial: ?string) => {
 *   add: (more: string) => void;
 *   finish: () => string;
 * }} CreateSHA256
 */

/** @type {CreateSHA256} */
function createSHA256(initial = undefined) {
  const hash = createHash('sha256');
  let done = false;
  function add(more) {
    assert(!done);
    hash.update(more);
  }
  function finish() {
    assert(!done);
    done = true;
    return hash.digest('hex');
  }
  if (initial) {
    add(initial);
  }
  return harden({ add, finish });
}
harden(createSHA256);
export { createSHA256 };
