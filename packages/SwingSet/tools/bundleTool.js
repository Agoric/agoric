import { makeNodeBundleCache as wrappedMaker } from '@endo/bundle-source/cache.js';
import styles from 'ansi-styles'; // less authority than 'chalk'

export const makeNodeBundleCache = async (dest, options, loadModule, pid) => {
  const log = (...args) => {
    const flattened = args.map(arg =>
      // Don't print stack traces.
      arg instanceof Error ? arg.message : arg,
    );
    console.log(
      // Make all messages prefixed and dim.
      `${styles.dim.open}[bundleTool]`,
      ...flattened,
      styles.dim.close,
    );
  };
  return wrappedMaker(dest, { log, ...options }, loadModule, pid);
};

/** @type {Map<string, ReturnType<typeof makeNodeBundleCache>>} */
const providedCaches = new Map();

/**
 * Make a new bundle cache for the destination. If there is already one for that
 * destination, return it.
 *
 * @param {string} dest
 * @param {{ format?: string, dev?: boolean }} options
 * @param {(id: string) => Promise<any>} loadModule
 * @param {number} [pid]
 */
export const provideBundleCache = (dest, options, loadModule, pid) => {
  const uniqueDest = [dest, options.format, options.dev].join('-');
  let bundleCache = providedCaches.get(uniqueDest);
  if (!bundleCache) {
    bundleCache = makeNodeBundleCache(dest, options, loadModule, pid);
    providedCaches.set(uniqueDest, bundleCache);
  }
  return bundleCache;
};
harden(provideBundleCache);

export const unsafeMakeBundleCache = dest =>
  makeNodeBundleCache(dest, {}, s => import(s));
