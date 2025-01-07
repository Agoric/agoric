import fs from 'fs';
import { bundlePaths, hashPaths } from './paths.js';

const read = async (name, path) => {
  return fs.promises.readFile(path, { encoding: 'utf-8' }).catch(err => {
    console.error(`unable to read lockdown ${name} at ${path}`);
    console.error(`perhaps run 'yarn build' in @agoric/xsnap-lockdown`);
    throw err;
  });
};

/**
 * @returns { Promise<string> }
 */
export const getLockdownBundleSHA256 = async () => {
  const path = hashPaths.lockdown;
  return read('hash', path).then(data => data.trim());
};

/**
 * @param { boolean } debug
 * @typedef {{ moduleFormat: string, source: string, sourceMap: [string] }} Bundle
 * @returns { Promise<Bundle> }
 */
const getBundle = async debug => {
  const path = debug ? bundlePaths.lockdownDebug : bundlePaths.lockdown;
  return read('bundle', path).then(bundleString => JSON.parse(bundleString));
};

export const getLockdownBundle = async () => getBundle(false);
export const getDebugLockdownBundle = async () => getBundle(true);
