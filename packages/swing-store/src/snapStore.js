// @ts-check
import { createHash } from 'crypto';
import { pipeline } from 'stream';
import { createGzip, createGunzip } from 'zlib';
import { assert, details as d } from '@agoric/assert';
import { promisify } from 'util';

const pipe = promisify(pipeline);

const { freeze } = Object;

const noPath = /** @type {import('fs').PathLike} */ (
  /** @type {unknown} */ (undefined)
);

/**
 *
 * @param {import("fs").ReadStream | import("fs").WriteStream} stream
 * @returns {Promise<void>}
 */
export const fsStreamReady = stream =>
  new Promise((resolve, reject) => {
    if (stream.destroyed) {
      reject(new Error('Stream already destroyed'));
      return;
    }

    if (!stream.pending) {
      resolve();
      return;
    }

    const onReady = () => {
      cleanup(); // eslint-disable-line no-use-before-define
      resolve();
    };

    /** @param {Error} err */
    const onError = err => {
      cleanup(); // eslint-disable-line no-use-before-define
      reject(err);
    };

    const cleanup = () => {
      stream.off('ready', onReady);
      stream.off('error', onError);
    };

    stream.on('ready', onReady);
    stream.on('error', onError);
  });

/**
 * @param {string} root
 * @param {{
 *   tmpName: typeof import('tmp').tmpName,
 *   createReadStream: typeof import('fs').createReadStream,
 *   createWriteStream: typeof import('fs').createWriteStream,
 *   open: typeof import('fs').promises.open,
 *   resolve: typeof import('path').resolve,
 *   rename: typeof import('fs').promises.rename,
 *   stat: typeof import('fs').promises.stat,
 *   unlink: typeof import('fs').promises.unlink,
 * }} io
 * @param {object} [options]
 * @param {boolean | undefined} [options.keepSnapshots]
 */
export function makeSnapStore(
  root,
  {
    tmpName,
    createReadStream,
    createWriteStream,
    open,
    resolve,
    rename,
    stat,
    unlink,
  },
  { keepSnapshots = false } = {},
) {
  /** @type {(opts: unknown) => Promise<string>} */
  const ptmpName = promisify(tmpName);
  /**
   * @param {(name: string) => Promise<T>} thunk
   * @param {string=} prefix
   * @returns {Promise<T>}
   * @template T
   */
  async function withTempName(thunk, prefix = 'tmp') {
    const name = await ptmpName({
      tmpdir: root,
      template: `${prefix}-XXXXXX.xss`,
    });
    let result;
    try {
      result = await thunk(name);
    } finally {
      try {
        await unlink(name);
      } catch (ignore) {
        // ignore
      }
    }
    return result;
  }

  /**
   * @param {string} dest basename, relative to root
   * @param { (name: string) => Promise<void> } thunk
   * @returns { Promise<{ filename: string, size: number }> }
   */
  async function atomicWrite(dest, thunk) {
    assert(!dest.includes('/'));
    const tmp = await ptmpName({ tmpdir: root, template: 'atomic-XXXXXX' });
    let result;
    try {
      await thunk(tmp);
      const target = resolve(root, dest);
      await rename(tmp, target);
      const stats = await stat(target);
      result = { filename: target, size: stats.size };
    } finally {
      try {
        await unlink(tmp);
      } catch (ignore) {
        // ignore
      }
    }
    return result;
  }

  /**
   * @param {string} input
   * @param {NodeJS.ReadWriteStream} f
   * @param {string} output
   * @param {object} [options]
   * @param {boolean} [options.flush]
   */
  async function filter(input, f, output, { flush = false } = {}) {
    const [source, destination] = await Promise.all([
      open(input, 'r'),
      open(output, 'wx'),
    ]);
    const sourceStream = createReadStream(noPath, {
      fd: source.fd,
      autoClose: false,
    });
    const destinationStream = createWriteStream(noPath, {
      fd: destination.fd,
      autoClose: false,
    });
    try {
      await Promise.all([
        fsStreamReady(sourceStream),
        fsStreamReady(destinationStream),
      ]);
      await pipe(sourceStream, f, destinationStream);
      if (flush) {
        await destination.sync();
      }
    } finally {
      await Promise.all([destination.close(), source.close()]);
    }
  }

  /** @type {(filename: string) => Promise<string>} */
  async function fileHash(filename) {
    const hash = createHash('sha256');
    const input = createReadStream(filename);
    await fsStreamReady(input);
    await pipe(input, hash);
    return hash.digest('hex');
  }

  /** @param {unknown} hash */
  function hashPath(hash) {
    assert.typeof(hash, 'string');
    assert(!hash.includes('/'));
    return resolve(root, `${hash}.gz`);
  }

  /** @type { Set<string> } */
  const toDelete = new Set();

  /**
   * @param {(fn: string) => Promise<void>} saveRaw
   * @returns {Promise<string>} sha256 hash of (uncompressed) snapshot
   */
  async function save(saveRaw) {
    return withTempName(async snapFile => {
      await saveRaw(snapFile);
      const stats = await stat(snapFile);
      const rawsize = stats.size;
      const h = await fileHash(snapFile);
      if (toDelete.has(h)) {
        toDelete.delete(h);
      }
      // console.log('save', { snapFile, h });
      const fileStat = await stat(hashPath(h)).catch(e => {
        if (e.code === 'ENOENT') {
          return undefined;
        }
        throw e;
      });
      if (fileStat) {
        return h;
      }
      const res = await atomicWrite(`${h}.gz`, gztmp =>
        filter(snapFile, createGzip(), gztmp, { flush: true }),
      );
      // TODO: remove once #5419 is resolved
      console.log(
        `XS snapshot written to ${res.filename} : ${res.size} bytes compressed, ${rawsize} raw`,
      );
      return h;
    }, 'save-raw');
  }

  /**
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  function has(hash) {
    return stat(hashPath(hash))
      .then(_stats => true)
      .catch(err => {
        if (err.code === 'ENOENT') {
          return false;
        }
        throw err;
      });
  }

  /**
   * @param {string} hash
   * @param {(fn: string) => Promise<T>} loadRaw
   * @template T
   */
  async function load(hash, loadRaw) {
    return withTempName(async raw => {
      await filter(hashPath(hash), createGunzip(), raw);
      const actual = await fileHash(raw);
      // console.log('load', { raw, hash });
      assert.equal(actual, hash, d`actual hash ${actual} !== expected ${hash}`);
      // be sure to await loadRaw before exiting withTempName
      const result = await loadRaw(raw);
      return result;
    }, `${hash}-load`);
  }

  /**
   * @param {string} hash
   */
  function prepareToDelete(hash) {
    hashPath(hash); // check constraints early
    toDelete.add(hash);
  }

  async function commitDeletes(ignoreErrors = false) {
    const errors = [];

    await Promise.all(
      [...toDelete].map(async hash => {
        const fullPath = hashPath(hash);
        try {
          if (keepSnapshots !== true) {
            await unlink(fullPath);
          }
          toDelete.delete(hash);
        } catch (error) {
          if (ignoreErrors) {
            toDelete.delete(hash);
          } else {
            errors.push(error);
          }
        }
      }),
    );

    if (errors.length) {
      throw Error(JSON.stringify(errors));
    }
  }

  return freeze({ has, load, save, prepareToDelete, commitDeletes });
}
