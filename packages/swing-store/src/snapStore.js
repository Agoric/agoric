// @ts-check
import { createHash } from 'crypto';
import { finished as finishedCallback, PassThrough, Readable } from 'stream';
import { promisify } from 'util';
import { createGzip, createGunzip } from 'zlib';
import { Fail, q } from '@endo/errors';
import { withDeferredCleanup } from '@agoric/internal';
import { buffer } from './util.js';

/**
 * @typedef {object} SnapshotResult
 * @property {string} hash sha256 hash of (uncompressed) snapshot
 * @property {number} uncompressedSize size of (uncompressed) snapshot
 * @property {number} dbSaveSeconds time to write snapshot in DB
 * @property {number} compressedSize size of (compressed) snapshot
 * @property {number} compressSeconds time to generate and compress the snapshot
 * @property {number} [archiveWriteSeconds] time to write an archive to disk (if applicable)
 */

/**
 * @typedef {object} SnapshotInfo
 * @property {number} snapPos
 * @property {string} hash
 * @property {number} uncompressedSize
 * @property {number} compressedSize
 */

/**
 * @import {AnyIterableIterator} from './exporter.js'
 */

/**
 * @typedef { import('./exporter.js').SwingStoreExporter } SwingStoreExporter
 * @typedef { import('./internal.js').ArtifactMode } ArtifactMode
 *
 * @typedef {{
 *   loadSnapshot: (vatID: string) => AsyncIterableIterator<Uint8Array>,
 *   saveSnapshot: (vatID: string, snapPos: number, snapshotStream: AsyncIterable<Uint8Array>) => Promise<SnapshotResult>,
 *   deleteAllUnusedSnapshots: () => void,
 *   deleteVatSnapshots: (vatID: string, budget?: number) => { done: boolean, cleanups: number },
 *   stopUsingLastSnapshot: (vatID: string) => void,
 *   getSnapshotInfo: (vatID: string) => SnapshotInfo,
 * }} SnapStore
 *
 * @typedef {{
 *   exportSnapshot: (name: string) => AsyncIterableIterator<Uint8Array>,
 *   getExportRecords: (includeHistorical: boolean) => IterableIterator<readonly [key: string, value: string]>,
 *   getArtifactNames: (artifactMode: ArtifactMode) => AsyncIterableIterator<string>,
 *   importSnapshotRecord: (key: string, value: string) => void,
 *   populateSnapshot: (name: string, makeChunkIterator: () => AnyIterableIterator<Uint8Array>, options: { artifactMode: ArtifactMode }) => Promise<void>,
 *   assertComplete: (checkMode: Omit<ArtifactMode, 'debug'>) => void,
 *   repairSnapshotRecord: (key: string, value: string) => void,
 * }} SnapStoreInternal
 *
 * @typedef {object} SnapshotRow
 * @property {string} vatID
 * @property {number} snapPos
 * @property {string} [hash]
 * @property {number | null} [inUse]
 * @property {number} uncompressedSize
 * @property {number} compressedSize
 *
 * @typedef {{
 *   hasHash: (vatID: string, hash: string) => boolean,
 *   listAllSnapshots: () => Generator<SnapshotRow,void,any>,
 *   dumpSnapshots: (includeHistorical?: boolean) => {},
 *   deleteSnapshotByHash: (vatID: string, hash: string) => void,
 * }} SnapStoreDebug
 *
 */

const finished = promisify(finishedCallback);

/**
 * @param {*} db
 * @param {() => void} ensureTxn
 * @param {{
 *   measureSeconds: ReturnType<typeof import('@agoric/internal').makeMeasureSeconds>,
 * }} io
 * @param {(key: string, value: string | undefined) => void} noteExport
 * @param {object} [options]
 * @param {boolean | undefined} [options.keepSnapshots]
 * @param {(name: string, compressedData: Parameters<import('stream').Readable.from>[0]) => Promise<void>} [options.archiveSnapshot]
 * @returns {SnapStore & SnapStoreInternal & SnapStoreDebug}
 */
export function makeSnapStore(
  db,
  ensureTxn,
  { measureSeconds },
  noteExport = () => {},
  { keepSnapshots = false, archiveSnapshot } = {},
) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      vatID TEXT,
      snapPos INTEGER,
      inUse INTEGER CHECK(inUse = 1),
      hash TEXT,
      uncompressedSize INTEGER,
      compressedSize INTEGER,
      compressedSnapshot BLOB,
      PRIMARY KEY (vatID, snapPos),
      UNIQUE (vatID, inUse)
    )
  `);

  // NOTE: there are two versions of this schema. The original, which
  // we'll call "version 1A", has a:
  //   CHECK(compressedSnapshot is not null or inUse is null)
  // in the table. Version 1B is missing that constraint. Any DB
  // created by the original code will use 1A. Any DB created by the
  // new version will use 1B. The import process needs to temporarily
  // violate that check, but any DB created by `importSwingStore` is
  // (by definition) new, so it will use 1B, which doesn't enforce the
  // check. We expect to implement schema migration
  // (https://github.com/Agoric/agoric-sdk/issues/8089) soon, which
  // will upgrade both 1A and 1B to "version 2", which will omit the
  // check (in addition to any other changes we need at that point)

  // pruned snapshots will have compressedSnapshot of NULL, and might
  // also have NULL for uncompressedSize and compressedSize

  const sqlDeleteAllUnusedSnapshots = db.prepare(`
    DELETE FROM snapshots
    WHERE inUse is null
  `);

  /**
   * Delete all extant snapshots from the snapstore that are not currently in
   * use by some vat.
   */
  function deleteAllUnusedSnapshots() {
    ensureTxn();
    sqlDeleteAllUnusedSnapshots.run();

    // NOTE: this is more than pruning the snapshot data, it deletes
    // the metadata/hash as well, making it impossible to safely
    // repopulate the snapshot data from an untrusted source. We need
    // to replace this with a method that merely nulls out the
    // 'compressedSnapshot' field.
  }

  function snapshotArtifactName(rec) {
    return `snapshot.${rec.vatID}.${rec.snapPos}`;
  }

  function snapshotMetadataKey(rec) {
    return `snapshot.${rec.vatID}.${rec.snapPos}`;
  }

  function currentSnapshotMetadataKey(rec) {
    return `snapshot.${rec.vatID}.current`;
  }

  /**
   * @param {string} vatID
   * @param {number} snapPos
   * @param {string} [hash]
   * @param {number | null} [inUse]
   */
  function snapshotRec(vatID, snapPos, hash, inUse) {
    return { vatID, snapPos, hash, inUse: inUse ? 1 : 0 };
  }

  const sqlGetPriorSnapshotInfo = db.prepare(`
    SELECT snapPos, hash
    FROM snapshots
    WHERE vatID = ? AND inUse = 1
  `);

  const sqlClearLastSnapshot = db.prepare(`
    UPDATE snapshots
    SET inUse = null, compressedSnapshot = null
    WHERE inUse = 1 AND vatID = ?
  `);

  const sqlStopUsingLastSnapshot = db.prepare(`
    UPDATE snapshots
    SET inUse = null
    WHERE inUse = 1 AND vatID = ?
  `);

  function stopUsingLastSnapshot(vatID) {
    // idempotent
    ensureTxn();
    const oldInfo = sqlGetPriorSnapshotInfo.get(vatID);
    if (oldInfo) {
      const rec = snapshotRec(vatID, oldInfo.snapPos, oldInfo.hash, 0);
      noteExport(snapshotMetadataKey(rec), JSON.stringify(rec));
      noteExport(currentSnapshotMetadataKey(rec), undefined);
      if (keepSnapshots) {
        sqlStopUsingLastSnapshot.run(vatID);
      } else {
        sqlClearLastSnapshot.run(vatID);
      }
    }
  }

  const sqlSaveSnapshot = db.prepare(`
    INSERT OR REPLACE INTO snapshots
      (vatID, snapPos, inUse, hash, uncompressedSize, compressedSize, compressedSnapshot)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  /**
   * Generates a new XS heap snapshot, stores a gzipped copy of it into the
   * snapshots table (and also to an archiveSnapshot callback if provided for
   * e.g. disk archival), and reports information about the process, including
   * snapshot size and timing metrics.
   *
   * @param {string} vatID
   * @param {number} snapPos
   * @param {AsyncIterable<Uint8Array>} snapshotStream
   * @returns {Promise<SnapshotResult>}
   */
  async function saveSnapshot(vatID, snapPos, snapshotStream) {
    return withDeferredCleanup(async addCleanup => {
      const hashStream = createHash('sha256');
      const gzip = createGzip();
      let compressedSize = 0;
      let uncompressedSize = 0;

      const { duration: compressSeconds, result: compressedSnapshot } =
        await measureSeconds(async () => {
          const snapReader = Readable.from(snapshotStream);
          const destroyReader = promisify(snapReader.destroy.bind(snapReader));
          addCleanup(() => destroyReader(null));
          snapReader.on('data', chunk => {
            uncompressedSize += chunk.length;
          });
          snapReader.pipe(hashStream);
          const compressedSnapshotData = await buffer(snapReader.pipe(gzip));
          await finished(snapReader);
          return compressedSnapshotData;
        });
      const hash = hashStream.digest('hex');
      const rec = snapshotRec(vatID, snapPos, hash, 1);
      const exportKey = snapshotMetadataKey(rec);

      const { duration: dbSaveSeconds } = await measureSeconds(async () => {
        ensureTxn();
        stopUsingLastSnapshot(vatID);
        compressedSize = compressedSnapshot.length;
        sqlSaveSnapshot.run(
          vatID,
          snapPos,
          1,
          hash,
          uncompressedSize,
          compressedSize,
          compressedSnapshot,
        );
        noteExport(exportKey, JSON.stringify(rec));
        noteExport(currentSnapshotMetadataKey(rec), snapshotArtifactName(rec));
      });

      let archiveWriteSeconds;
      if (archiveSnapshot) {
        ({ duration: archiveWriteSeconds } = await measureSeconds(async () => {
          await archiveSnapshot(exportKey, compressedSnapshot);
        }));
      }

      return harden({
        hash,
        uncompressedSize,
        compressSeconds,
        dbSaveSeconds,
        archiveWriteSeconds,
        compressedSize,
      });
    });
  }

  const sqlGetSnapshot = db.prepare(`
    SELECT compressedSnapshot, inUse
    FROM snapshots
    WHERE vatID = ? AND snapPos = ?
  `);

  /**
   * Read a snapshot and return it as a stream of data suitable for export to
   * another store.
   *
   * Snapshot artifact names should be strings of the form:
   *   `snapshot.${vatID}.${startPos}`
   *
   * @param {string} name
   * @returns {AsyncIterableIterator<Uint8Array>}
   */
  function exportSnapshot(name) {
    typeof name === 'string' || Fail`artifact name must be a string`;
    const parts = name.split('.');
    const [type, vatID, pos] = parts;
    // prettier-ignore
    (parts.length === 3 && type === 'snapshot') ||
      Fail`expected artifact name of the form 'snapshot.{vatID}.{snapPos}', saw ${q(name)}`;
    const snapPos = Number(pos);
    const snapshotInfo = sqlGetSnapshot.get(vatID, snapPos);
    snapshotInfo || Fail`snapshot ${q(name)} not available`;
    const { compressedSnapshot } = snapshotInfo;
    compressedSnapshot || Fail`artifact ${q(name)} is not available`;
    // weird construct here is because we need to be able to throw before the generator starts
    async function* exporter() {
      const gzReader = Readable.from(compressedSnapshot);
      const unzipper = createGunzip();
      const snapshotReader = gzReader.pipe(unzipper);
      yield* snapshotReader;
    }
    harden(exporter);
    return exporter();
  }

  const sqlLoadSnapshot = db.prepare(`
    SELECT hash, compressedSnapshot
    FROM snapshots
    WHERE vatID = ? AND inUse = 1
  `);

  /**
   * Loads the most recent snapshot for a given vat.
   *
   * @param {string} vatID
   * @returns {AsyncGenerator<Uint8Array, void, undefined>}
   */
  async function* loadSnapshot(vatID) {
    const loadInfo = sqlLoadSnapshot.get(vatID);
    loadInfo || Fail`no snapshot available for vat ${q(vatID)}`;
    const { hash: snapshotID, compressedSnapshot } = loadInfo;
    compressedSnapshot || Fail`no snapshot available for vat ${q(vatID)}`;
    const gzReader = Readable.from(compressedSnapshot);
    const snapReader = gzReader.pipe(createGunzip());
    const hashStream = createHash('sha256');
    const output = new PassThrough();
    snapReader.pipe(hashStream);
    snapReader.pipe(output);

    await null;
    try {
      yield* output;
    } finally {
      gzReader.destroy();
      await finished(gzReader);
      const hash = hashStream.digest('hex');
      hash === snapshotID ||
        Fail`actual hash ${q(hash)} !== expected ${q(snapshotID)}`;
    }
  }
  harden(loadSnapshot);

  const sqlDeleteVatSnapshots = db.prepare(`
    DELETE FROM snapshots
    WHERE vatID = ?
  `);

  const sqlDeleteOneVatSnapshot = db.prepare(`
    DELETE FROM snapshots
    WHERE vatID = ? AND snapPos = ?
  `);

  const sqlGetSnapshotList = db.prepare(`
    SELECT snapPos
    FROM snapshots
    WHERE vatID = ?
    ORDER BY snapPos
  `);

  const sqlGetSnapshotListLimited = db.prepare(`
    SELECT snapPos, inUse
    FROM snapshots
    WHERE vatID = ?
    ORDER BY snapPos DESC
    LIMIT ?
  `);

  /**
   * @param {string} vatID
   * @returns {boolean}
   */
  function hasSnapshots(vatID) {
    // the LIMIT 1 means we aren't really getting all entries
    return sqlGetSnapshotListLimited.all(vatID, 1).length > 0;
  }

  /**
   * Delete some or all snapshots for a given vat (for use when, e.g.,
   * a vat is terminated)
   *
   * @param {string} vatID
   * @param {number} [budget]
   * @returns {{ done: boolean, cleanups: number }}
   */
  function deleteVatSnapshots(vatID, budget = Infinity) {
    ensureTxn();
    const deleteAll = budget === Infinity;
    assert(deleteAll || budget >= 1, 'budget must be undefined or positive');
    // We can't use .iterate because noteExport can write to the DB,
    // and overlapping queries are not supported.
    const deletions = deleteAll
      ? sqlGetSnapshotList.all(vatID)
      : sqlGetSnapshotListLimited.all(vatID, budget);
    let clearCurrent = deleteAll;
    for (const deletion of deletions) {
      clearCurrent ||= deletion.inUse;
      const { snapPos } = deletion;
      const exportRec = snapshotRec(vatID, snapPos, undefined);
      noteExport(snapshotMetadataKey(exportRec), undefined);
      // Budgeted deletion must delete rows one by one,
      // but full deletion is handled all at once after this loop.
      if (!deleteAll) {
        sqlDeleteOneVatSnapshot.run(vatID, snapPos);
      }
    }
    if (deleteAll) {
      sqlDeleteVatSnapshots.run(vatID);
    }
    if (clearCurrent) {
      noteExport(currentSnapshotMetadataKey({ vatID }), undefined);
    }
    return {
      done: deleteAll || deletions.length === 0 || !hasSnapshots(vatID),
      cleanups: deletions.length,
    };
  }

  const sqlGetSnapshotInfo = db.prepare(`
    SELECT snapPos, hash, uncompressedSize, compressedSize
    FROM snapshots
    WHERE vatID = ? AND inUse = 1
  `);

  /**
   * Find out everything there is to know about a given vat's current snapshot
   * aside from the snapshot blob itself.
   *
   * @param {string} vatID
   *
   * @returns {SnapshotInfo}
   */
  function getSnapshotInfo(vatID) {
    return /** @type {SnapshotInfo} */ (sqlGetSnapshotInfo.get(vatID));
  }

  const sqlHasHash = db.prepare(`
    SELECT COUNT(*)
    FROM snapshots
    WHERE vatID = ? AND hash = ?
  `);
  sqlHasHash.pluck(true);

  /**
   * Test if a vat has a specific snapshot identified by its hash.
   *
   * Note: this is for use by testing and debugging code; normal clients of
   * snapStore shouldn't call this.
   *
   * @param {string} vatID
   * @param {string} hash
   *
   * @returns {boolean}
   */
  function hasHash(vatID, hash) {
    return !!sqlHasHash.get(vatID, hash);
  }

  const sqlDeleteSnapshotByHash = db.prepare(`
    DELETE FROM snapshots
    WHERE vatID = ? AND hash = ?
  `);

  /**
   * Delete a specific snapshot identified by its hash.
   *
   * Note: this is for use by testing and debugging code; normal clients of
   * snapStore shouldn't call this.
   *
   * @param {string} vatID
   * @param {string} hash
   */
  function deleteSnapshotByHash(vatID, hash) {
    ensureTxn();
    sqlDeleteSnapshotByHash.run(vatID, hash);
  }

  const sqlGetSnapshotMetadata = db.prepare(`
    SELECT vatID, snapPos, hash, uncompressedSize, compressedSize, inUse
    FROM snapshots
    WHERE inUse IS ?
    ORDER BY vatID, snapPos
  `);

  const sqlGetAvailableSnapshots = db.prepare(`
    SELECT vatID, snapPos, hash, uncompressedSize, compressedSize, inUse
    FROM snapshots
    WHERE inUse IS ? AND compressedSnapshot is not NULL
    ORDER BY vatID, snapPos
  `);

  /**
   * Obtain artifact metadata records for snapshots contained in this store.
   *
   * @param {boolean} includeHistorical  If true, include all metadata that is
   *   present in the store regardless of its currency; if false, only include
   *   the metadata that is part of the swingset's active operational state.
   *
   * Note: in the currently anticipated operational mode, this flag should
   * always be set to `true`, because *all* snapshot metadata is, for now,
   * considered part of the consensus set.  This metadata is being retained for
   * diagnostic purposes and as a hedge against possible future need.  While
   * such a need seems highly unlikely, the future is uncertain and it will be
   * easier to purge this data later than to recover it if it is lost.  However,
   * the flag itself is present in case future operational policy allows for
   * pruning historical metadata, for example after further analysis and
   * practical experience tells us that it will not be needed.
   *
   * @yields {readonly [key: string, value: string]}
   * @returns {IterableIterator<readonly [key: string, value: string]>}
   */
  function* getExportRecords(includeHistorical = true) {
    for (const rec of sqlGetSnapshotMetadata.iterate(1)) {
      const exportRec = snapshotRec(rec.vatID, rec.snapPos, rec.hash, 1);
      const exportKey = snapshotMetadataKey(rec);
      yield [exportKey, JSON.stringify(exportRec)];
      yield [currentSnapshotMetadataKey(rec), snapshotArtifactName(rec)];
    }
    if (includeHistorical) {
      for (const rec of sqlGetSnapshotMetadata.iterate(null)) {
        const exportRec = snapshotRec(rec.vatID, rec.snapPos, rec.hash, 0);
        yield [snapshotMetadataKey(rec), JSON.stringify(exportRec)];
      }
    }
  }
  harden(getExportRecords);

  async function* getArtifactNames(artifactMode) {
    for (const rec of sqlGetAvailableSnapshots.iterate(1)) {
      yield snapshotArtifactName(rec);
    }
    if (artifactMode === 'debug') {
      for (const rec of sqlGetAvailableSnapshots.iterate(null)) {
        yield snapshotArtifactName(rec);
      }
    }
  }
  harden(getArtifactNames);

  const sqlAddSnapshotRecord = db.prepare(`
    INSERT INTO snapshots (vatID, snapPos, hash, inUse)
    VALUES (?, ?, ?, ?)
  `);

  function importSnapshotRecord(key, value) {
    ensureTxn();
    const [tag, ...pieces] = key.split('.');
    assert.equal(tag, 'snapshot');
    const [_vatID, endPos] = pieces;
    if (endPos === 'current') {
      // metadata['snapshot.v1.current'] = 'snapshot.v1.5' , i.e. it
      // points to the name of the current artifact. We could
      // conceivably remember this and compare it against the .inUse
      // property of that record, but it's not worth the effort (we
      // might encounter the records in either order).
      return;
    }
    const metadata = JSON.parse(value);
    const { vatID, snapPos, hash, inUse } = metadata;
    vatID || Fail`snapshot metadata missing vatID: ${metadata}`;
    snapPos !== undefined ||
      Fail`snapshot metadata missing snapPos: ${metadata}`;
    hash || Fail`snapshot metadata missing hash: ${metadata}`;
    inUse !== undefined || Fail`snapshot metadata missing inUse: ${metadata}`;

    sqlAddSnapshotRecord.run(vatID, snapPos, hash, inUse ? 1 : null);
  }

  const sqlGetSnapshotHashFor = db.prepare(`
    SELECT hash, inUse
    FROM snapshots
    WHERE vatID = ? AND snapPos = ?
  `);

  function repairSnapshotRecord(key, value) {
    ensureTxn();
    const [tag, keyVatID, keySnapPos] = key.split('.');
    assert.equal(tag, 'snapshot');
    if (keySnapPos === 'current') {
      // "snapshot.${vatID}.current" entries are meta-metadata: they
      // point to the metadata key of the current snapshot, to avoid
      // the need for an expensive search
      return;
    }
    const metadata = JSON.parse(value);
    const { vatID, snapPos, hash, inUse } = metadata;
    assert.equal(keyVatID, vatID);
    assert.equal(Number(keySnapPos), snapPos);
    const existing = sqlGetSnapshotHashFor.get(vatID, snapPos);
    if (existing) {
      if (
        Boolean(existing.inUse) !== Boolean(inUse) ||
        existing.hash !== hash
      ) {
        throw Fail`repairSnapshotRecord metadata mismatch: ${existing} vs ${metadata}`;
      }
    } else {
      sqlAddSnapshotRecord.run(vatID, snapPos, hash, inUse ? 1 : null);
    }
  }

  const sqlPopulateSnapshot = db.prepare(`
    UPDATE snapshots SET
      uncompressedSize = ?, compressedSize = ?, compressedSnapshot = ?
    WHERE vatID = ? AND snapPos = ?
  `);

  /**
   * @param {string} name  Artifact name of the snapshot
   * @param {() => AnyIterableIterator<Uint8Array>} makeChunkIterator  get an iterator of snapshot byte chunks
   * @param {object} options
   * @param {ArtifactMode} options.artifactMode
   * @returns {Promise<void>}
   */
  async function populateSnapshot(name, makeChunkIterator, options) {
    ensureTxn();
    const { artifactMode } = options;
    const parts = name.split('.');
    const [type, vatID, rawEndPos] = parts;
    // prettier-ignore
    parts.length === 3 && type === 'snapshot' ||
      Fail`expected snapshot name of the form 'snapshot.{vatID}.{snapPos}', saw '${q(name)}'`;
    const snapPos = Number(rawEndPos);
    const metadata =
      sqlGetSnapshotHashFor.get(vatID, snapPos) ||
      Fail`no metadata for snapshot ${name}`;

    if (!metadata.inUse && artifactMode !== 'debug') {
      return; // ignore old snapshots
    }

    const artifactChunks = makeChunkIterator();
    const inStream = Readable.from(artifactChunks);
    let uncompressedSize = 0;
    inStream.on('data', chunk => (uncompressedSize += chunk.length));
    const hashStream = createHash('sha256');
    const gzip = createGzip();
    inStream.pipe(hashStream);
    inStream.pipe(gzip);
    const compressedArtifact = await buffer(gzip);
    await finished(inStream);
    const hash = hashStream.digest('hex');

    // validate against the previously-established metadata
    // prettier-ignore
    metadata.hash === hash ||
      Fail`snapshot ${q(name)} hash is ${q(hash)}, metadata says ${q(metadata.hash)}`;

    sqlPopulateSnapshot.run(
      uncompressedSize,
      compressedArtifact.length,
      compressedArtifact,
      vatID,
      snapPos,
    );
  }

  const sqlListPrunedCurrentSnapshots = db.prepare(`
    SELECT vatID FROM snapshots
      WHERE inUse = 1 AND compressedSnapshot IS NULL
      ORDER BY vatID
  `);
  sqlListPrunedCurrentSnapshots.pluck();

  function assertComplete(checkMode) {
    assert(checkMode !== 'debug', checkMode);
    // every 'inUse' snapshot must be populated
    const vatIDs = sqlListPrunedCurrentSnapshots.all();
    if (vatIDs.length) {
      throw Fail`current snapshots are pruned for vats ${vatIDs.join(',')}`;
    }
  }

  const sqlListAllSnapshots = db.prepare(`
    SELECT vatID, snapPos, inUse, hash, uncompressedSize, compressedSize
    FROM snapshots
    ORDER BY vatID, snapPos
  `);

  /**
   * debug function to list all snapshots
   *
   * @returns {Generator<SnapshotRow, void, any>}
   */
  function* listAllSnapshots() {
    yield* sqlListAllSnapshots.iterate();
  }
  harden(listAllSnapshots);

  const sqlDumpCurrentSnapshots = db.prepare(`
    SELECT vatID, snapPos, hash, compressedSnapshot, inUse
    FROM snapshots
    WHERE inUse = 1
    ORDER BY vatID, snapPos
  `);

  const sqlDumpAllSnapshots = db.prepare(`
    SELECT vatID, snapPos, hash, compressedSnapshot, inUse
    FROM snapshots
    ORDER BY vatID, snapPos
  `);

  /**
   * debug function to dump active snapshots
   *
   * @param {boolean} [includeHistorical]
   */
  function dumpSnapshots(includeHistorical = true) {
    const sql = includeHistorical
      ? sqlDumpAllSnapshots
      : sqlDumpCurrentSnapshots;
    const dump = {};
    for (const row of sql.iterate()) {
      const { vatID, snapPos, hash, compressedSnapshot, inUse } = row;
      if (!dump[vatID]) {
        dump[vatID] = [];
      }
      dump[vatID].push({
        snapPos,
        hash,
        compressedSnapshot,
        inUse: inUse ? 1 : 0,
      });
    }
    return dump;
  }

  return harden({
    saveSnapshot,
    loadSnapshot,
    deleteAllUnusedSnapshots,
    deleteVatSnapshots,
    stopUsingLastSnapshot,
    getSnapshotInfo,

    getExportRecords,
    getArtifactNames,
    exportSnapshot,

    importSnapshotRecord,
    populateSnapshot,
    assertComplete,
    repairSnapshotRecord,

    hasHash,
    listAllSnapshots,
    dumpSnapshots,
    deleteSnapshotByHash,
  });
}
