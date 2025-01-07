/* global setImmediate */
import { makePromiseKit } from '@endo/promise-kit';

// This can only be imported from the Start Compartment, where 'setImmediate'
// is available.

export async function waitUntilQuiescent() {
  // the delivery might cause some number of (native) Promises to be
  // created and resolved, so we use the IO queue to detect when the
  // Promise queue is empty. The IO queue (setImmediate and setTimeout) is
  // lower-priority than the Promise queue on browsers and Node 11, but on
  // Node 10 it is higher. So this trick requires Node 11.
  // https://jsblog.insiderattack.net/new-changes-to-timers-and-microtasks-from-node-v11-0-0-and-above-68d112743eb3
  /** @type {import('@endo/promise-kit').PromiseKit<void>} */
  const { promise: queueEmptyP, resolve } = makePromiseKit();
  setImmediate(() => resolve());
  return queueEmptyP;
}
