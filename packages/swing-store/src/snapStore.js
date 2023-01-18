// @ts-check
import { Buffer } from 'buffer';
import { createHash } from 'crypto';
import { finished as finishedCallback, Readable } from 'stream';
import { promisify } from 'util';
import { createGzip, createGunzip } from 'zlib';
import { assert, details as d } from '@agoric/assert';
import {
  aggregateTryFinally,
  fsStreamReady,
  PromiseAllOrErrors,
} from '@agoric/internal';

/**
 * @typedef {object} SnapshotResult
 * @property {string} hash sha256 hash of (uncompressed) snapshot
 * @property {number} rawByteCount size of (uncompressed) snapshot
 * @property {number} rawSaveSeconds time to save (uncompressed) snapshot
 * @property {number} compressedByteCount size of (compressed) snapshot
 * @property {number} compressSeconds time to compress and save snapshot
 */

/**
 * @typedef {object} SnapshotInfo
 * @property {number} endPos
 * @property {string} hash
 * @property {number} uncompressedSize
 * @property {number} compressedSize
 */

/**
 * @typedef {{
 *   hasHash: (vatID: string, hash: string) => boolean,
 *   loadSnapshot: <T>(vatID: string, loadRaw: (filePath: string) => Promise<T>) => Promise<T>,
 *   saveSnapshot: (vatID: string, endPos: number, saveRaw: (filePath: string) => Promise<void>) => Promise<SnapshotResult>,
 *   deleteVatSnapshots: (vatID: string) => void,
 *   deleteAllUnusedSnapshots: () => void,
 *   deleteSnapshotByHash: (vatID: string, hash: string) => void,
 *   getSnapshotInfo: (vatID: string) => SnapshotInfo,
 * }} SnapStore
 */

/** @type {AssertFail} */
function fail() {
  assert.fail('snapStore not available in ephemeral swingStore');
}

/**
 * This is a polyfill for the `buffer` function from Node's
 * 'stream/consumers' package, which unfortunately only exists in newer versions
 * of Node.
 *
 * @param {AsyncIterable<Buffer>} inStream
 */
export const buffer = async inStream => {
  const chunks = [];
  for await (const chunk of inStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

/** @type {SnapStore} */
export const ephemeralSnapStore = {
  hasHash: fail,
  loadSnapshot: fail,
  saveSnapshot: fail,
  deleteVatSnapshots: fail,
  deleteAllUnusedSnapshots: fail,
  deleteSnapshotByHash: fail,
  getSnapshotInfo: fail,
};

const finished = promisify(finishedCallback);

const { freeze } = Object;

const noPath = /** @type {import('fs').PathLike} */ (
  /** @type {unknown} */ (undefined)
);

/**
 * @param {*} db
 * @param {{
 *   createReadStream: typeof import('fs').createReadStream,
 *   createWriteStream: typeof import('fs').createWriteStream,
 *   measureSeconds: ReturnType<typeof import('@agoric/internal').makeMeasureSeconds>,
 *   open: typeof import('fs').promises.open,
 *   stat: typeof import('fs').promises.stat,
 *   tmpFile: typeof import('tmp').file,
 *   tmpName: typeof import('tmp').tmpName,
 *   unlink: typeof import('fs').promises.unlink,
 * }} io
 * @param {object} [options]
 * @param {boolean | undefined} [options.keepSnapshots]
 * @returns {SnapStore}
 */
export function makeSnapStore(
  db,
  {
    createReadStream,
    createWriteStream,
    measureSeconds,
    stat,
    tmpFile,
    tmpName,
    unlink,
  },
  { keepSnapshots = false } = {},
) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      vatID TEXT,
      endPos INTEGER,
      inUse INTEGER,
      hash TEXT,
      uncompressedSize INTEGER,
      compressedSize INTEGER,
      compressedSnapshot BLOB,
      PRIMARY KEY (vatID, endPos)
    )
  `);

  /** @type {(opts: unknown) => Promise<string>} */
  const ptmpName = promisify(tmpName);

  // Manually promisify `tmpFile` to preserve its post-`error` callback arguments.
  const ptmpFile = (options = {}) => {
    return new Promise((resolve, reject) => {
      tmpFile(options, (err, path, fd, cleanupCallback) => {
        if (err) {
          reject(err);
        } else {
          resolve({ path, fd, cleanup: cleanupCallback });
        }
      });
    });
  };

  const sqlDeleteAllUnusedSnapshots = db.prepare(`
    DELETE FROM snapshots
    WHERE inUse = 0
  `);

  function deleteAllUnusedSnapshots() {
    sqlDeleteAllUnusedSnapshots.run();
  }

  const sqlStopUsingLastSnapshot = db.prepare(`
    UPDATE snapshots
    SET inUse = 0
    WHERE inUse = 1 AND vatID = ?
  `);

  const sqlSaveSnapshot = db.prepare(`
    INSERT OR REPLACE INTO snapshots
      (vatID, endPos, inUse, hash, uncompressedSize, compressedSize, compressedSnapshot)
    VALUES (?, ?, 1, ?, ?, ?, ?)
  `);

  /**
   * Generates a new XS heap snapshot, stores a gzipped copy of it into the
   * snapshots table, and reports information about the process, including
   * snapshot size and timing metrics.
   *
   * @param {string} vatID
   * @param {number} endPos
   * @param {(filePath: string) => Promise<void>} saveRaw
   * @returns {Promise<SnapshotResult>}
   */
  async function saveSnapshot(vatID, endPos, saveRaw) {
    const cleanup = [];
    return aggregateTryFinally(
      async () => {
        // TODO: Refactor to use tmpFile rather than tmpName.
        const tmpSnapPath = await ptmpName({ template: 'save-raw-XXXXXX.xss' });
        cleanup.push(() => unlink(tmpSnapPath));
        const { duration: rawSaveSeconds } = await measureSeconds(async () =>
          saveRaw(tmpSnapPath),
        );
        const { size: rawByteCount } = await stat(tmpSnapPath);

        // Perform operations that read snapshot data in parallel.
        // We still serialize the stat and opening of tmpSnapPath
        // and creation of tmpGzPath for readability, but we could
        // parallelize those as well if the cost is significant.
        const snapReader = createReadStream(tmpSnapPath);
        cleanup.push(() => {
          snapReader.destroy();
        });

        await fsStreamReady(snapReader);

        const hashStream = createHash('sha256');
        const gzip = createGzip();
        let compressedByteCount = 0;

        const { result: hash, duration: compressSeconds } =
          await measureSeconds(async () => {
            snapReader.pipe(hashStream);
            const compressedSnapshot = await buffer(snapReader.pipe(gzip));
            await finished(snapReader);

            const h = hashStream.digest('hex');
            sqlStopUsingLastSnapshot.run(vatID);
            if (!keepSnapshots) {
              deleteAllUnusedSnapshots();
            }
            compressedByteCount = compressedSnapshot.length;
            sqlSaveSnapshot.run(
              vatID,
              endPos,
              h,
              rawByteCount,
              compressedByteCount,
              compressedSnapshot,
            );

            return h;
          });

        return freeze({
          hash,
          rawByteCount,
          rawSaveSeconds,
          compressSeconds,
          compressedByteCount,
        });
      },
      async () => {
        await PromiseAllOrErrors(
          cleanup.reverse().map(fn => Promise.resolve().then(() => fn())),
        );
      },
    );
  }

  const sqlHasHash = db.prepare(`
    SELECT COUNT(*)
    FROM snapshots
    WHERE vatID = ? AND hash = ?
  `);
  sqlHasHash.pluck(true);

  /**
   * @param {string} vatID
   * @param {string} hash
   * @returns {boolean}
   */
  function hasHash(vatID, hash) {
    return !!sqlHasHash.get(vatID, hash);
  }

  const sqlLoadSnapshot = db.prepare(`
    SELECT hash, compressedSnapshot
    FROM snapshots
    WHERE vatID = ?
    ORDER BY endPos DESC
    LIMIT 1
  `);

  /**
   * Loads the most recent snapshot for a given vat.
   *
   * @param {string} vatID
   * @param {(filePath: string) => Promise<T>} loadRaw
   * @template T
   */
  async function loadSnapshot(vatID, loadRaw) {
    const cleanup = [];
    return aggregateTryFinally(
      async () => {
        const loadInfo = sqlLoadSnapshot.get(vatID);
        assert(loadInfo, `no snapshot available for vat ${vatID}`);
        const { hash, compressedSnapshot } = loadInfo;
        const gzReader = Readable.from(compressedSnapshot);
        cleanup.push(() => gzReader.destroy());
        const snapReader = gzReader.pipe(createGunzip());

        const {
          path,
          fd,
          cleanup: tmpCleanup,
        } = await ptmpFile({ template: `load-${hash}-XXXXXX.xss` });
        cleanup.push(tmpCleanup);
        const snapWriter = createWriteStream(noPath, {
          fd,
          autoClose: false,
        });
        cleanup.push(() => snapWriter.close());

        await fsStreamReady(snapWriter);
        const hashStream = createHash('sha256');
        snapReader.pipe(hashStream);
        snapReader.pipe(snapWriter);

        await Promise.all([finished(gzReader), finished(snapWriter)]);
        const h = hashStream.digest('hex');
        h === hash || assert.fail(d`actual hash ${h} !== expected ${hash}`);
        const snapWriterClose = cleanup.pop();
        snapWriterClose();

        return loadRaw(path);
      },
      async () => {
        await PromiseAllOrErrors(
          cleanup.reverse().map(fn => Promise.resolve().then(() => fn())),
        );
      },
    );
  }

  const sqlGetSnapshotInfo = db.prepare(`
    SELECT endPos, hash, uncompressedSize, compressedSize
    FROM snapshots
    WHERE vatID = ?
    ORDER BY endPos DESC
    LIMIT 1
  `);

  function getSnapshotInfo(vatID) {
    return /** @type {SnapshotInfo} */ (sqlGetSnapshotInfo.get(vatID));
  }

  const sqlDeleteVatSnapshots = db.prepare(`
    DELETE FROM snapshots
    WHERE vatID = ?
  `);

  /**
   * @param {string} vatID
   */
  function deleteVatSnapshots(vatID) {
    sqlDeleteVatSnapshots.run(vatID);
  }

  const sqlDeleteSnapshotByHash = db.prepare(`
    DELETE FROM snapshots
    WHERE vatID = ? AND hash = ?
  `);

  /**
   * @param {string} vatID
   * @param {string} hash
   */
  function deleteSnapshotByHash(vatID, hash) {
    sqlDeleteSnapshotByHash.run(vatID, hash);
  }

  return freeze({
    loadSnapshot,
    saveSnapshot,
    deleteVatSnapshots,
    getSnapshotInfo,

    hasHash,
    deleteAllUnusedSnapshots,
    deleteSnapshotByHash,
  });
}
