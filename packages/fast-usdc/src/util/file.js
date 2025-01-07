import { dirname } from 'path';

/** @import { readFile as readAsync } from 'node:fs/promises' */
/** @import { writeFile as writeAsync } from 'node:fs/promises' */
/** @import { mkdirSync } from 'node:fs' */
/** @import { existsSync } from 'node:fs' */

export const makeFile = (
  /** @type {string} */ path,
  /** @type {readAsync} */ readFile,
  /** @type {writeAsync} */ writeFile,
  /** @type {mkdirSync} */ mkdir,
  /** @type {existsSync} */ pathExists,
) => {
  const read = async () => readFile(path, 'utf-8');

  const write = async (/** @type {string} */ data) => {
    const dir = dirname(path);
    if (!pathExists(dir)) {
      mkdir(dir);
    }
    await writeFile(path, data);
  };

  const exists = () => pathExists(path);

  return { read, write, exists, path };
};

/** @typedef {ReturnType<typeof makeFile>} File */
