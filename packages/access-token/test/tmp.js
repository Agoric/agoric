import tmp from 'tmp';

/**
 * @param {string} [prefix]
 * @returns {Promise<[string, () => void]>}
 */
export const tmpDir = async prefix =>
  new Promise((resolve, reject) => {
    // We use `unsafeCleanup` because we want to remove the directory even if it
    // still contains files.
    const unsafeCleanup = true;
    tmp.dir({ unsafeCleanup, prefix }, (err, name, removeCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve([name, removeCallback]);
      }
    });
  });
