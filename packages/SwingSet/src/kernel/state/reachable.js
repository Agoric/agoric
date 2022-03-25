import { assert, details as X } from '@agoric/assert';

export function parseReachableAndVatSlot(value) {
  assert.typeof(value, 'string', X`non-string value: ${value}`);
  const flag = value.slice(0, 1);
  assert.equal(value.slice(1, 2), ' ');
  const vatSlot = value.slice(2);
  /** @type {boolean} */
  let isReachable;
  if (flag === 'R') {
    isReachable = true;
  } else if (flag === '_') {
    isReachable = false;
  } else {
    assert(`flag (${flag}) must be 'R' or '_'`);
  }
  return { isReachable, vatSlot };
}
harden(parseReachableAndVatSlot);

export function buildReachableAndVatSlot(isReachable, vatSlot) {
  return `${isReachable ? 'R' : '_'} ${vatSlot}`;
}
harden(buildReachableAndVatSlot);
