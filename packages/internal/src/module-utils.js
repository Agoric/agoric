import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { search } from '@endo/compartment-mapper';
import { Fail } from '@endo/errors';

/**
 * Given a file URL, return a deep import specifier that starts with the
 * specifier for its containing module (e.g., the deep import specifier for this
 * file is expected to be "@agoric/internal/src/module-utils.js").
 *
 * @param {string} fileUrl
 * @returns {Promise<string>}
 */
export const getSpecifier = async fileUrl => {
  new URL(fileUrl); // validates fileUrl
  const read = async location => {
    const path = fileURLToPath(new URL(location, fileUrl));
    return readFile(path);
  };
  const searchResult = await search(read, fileUrl);
  const { packageDescriptorText, moduleSpecifier } = searchResult;
  const { name } = JSON.parse(packageDescriptorText);
  name || Fail`containing package must have a name`;
  return `${name}/${moduleSpecifier.replace(/^\.\//, '')}`;
};
harden(getSpecifier);
