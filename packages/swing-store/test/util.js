import { Buffer } from 'node:buffer';
import tmp from 'tmp';
import { createSHA256 } from '../src/hasher.js';

/**
 * @param {string} [prefix]
 * @returns {Promise<[string, () => void]>}
 */
export const tmpDir = async prefix =>
  new Promise((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true, prefix }, (err, name, removeCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve([name, removeCallback]);
      }
    });
  });

export async function* getSnapshotStream(contents) {
  yield Buffer.from(contents);
}
harden(getSnapshotStream);

export function makeB0ID(bundle) {
  return `b0-${createSHA256(JSON.stringify(bundle)).finish()}`;
}
