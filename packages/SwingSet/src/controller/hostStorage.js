// @ts-check
import { initSwingStore, openSwingStore } from '@agoric/swing-store';

/*
The "Storage API" is a set of functions { has, getKeys, get, set, delete } that
work on string keys and accept string values.  A lot of kernel-side code
expects to get an object which implements the Storage API, which is usually
associated with a write-back buffer wrapper.

A more sophisticated host will build a hostDB that writes changes to disk
directly.
*/

/**
 * Helper function to initialize the appropriate storage objects for the kernel
 *
 * @param {boolean} initialize If true, initialize a new store; if false, open
 *   an existing one
 * @param {string | undefined} kernelStateDBDir Pathname to the LMDB database
 *   directory or undefined to create a volatile in-memory store
 * @returns {HostStore} A host store as described by the parameters
 */
export function provideHostStorage(
  initialize = true,
  kernelStateDBDir = undefined,
) {
  let swingStore;
  if (kernelStateDBDir) {
    if (initialize) {
      swingStore = initSwingStore(kernelStateDBDir);
    } else {
      swingStore = openSwingStore(kernelStateDBDir);
    }
  } else {
    swingStore = initSwingStore(null);
  }
  return {
    kvStore: swingStore.kvStore,
    streamStore: swingStore.streamStore,
  };
}
