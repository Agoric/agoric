import fs from 'fs';
import { bundlePaths, hashPaths } from './paths.js';

const read = async (name, path) => {
  return fs.promises.readFile(path, { encoding: 'utf-8' }).catch(err => {
    console.error(`unable to read supervisor ${name} at ${path}`);
    console.error(
      `perhaps run 'yarn build' in @agoric/swingset-xsnap-supervisor`,
    );
    throw err;
  });
};

/**
 * @returns { Promise<string> }
 */
export const getSupervisorBundleSHA256 = async () => {
  const path = hashPaths.supervisor;
  return read('hash', path).then(data => data.trim());
};

/**
 * @typedef {{ moduleFormat: string, source: string, sourceMap: [string] }} Bundle
 * @returns { Promise<Bundle> }
 */
export const getSupervisorBundle = async () => {
  const path = bundlePaths.supervisor;
  return read('bundle', path).then(bundleString => JSON.parse(bundleString));
};
