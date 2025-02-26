import sqlite3 from 'better-sqlite3';
import process, { exit } from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

let showDebug = false;

function err(x) {
  console.error('Error: ', x);
}

function die(x) {
  err(x);
  exit(1);
}

function warn(x) {
  console.warn('Warning: ', x);
}

function log(x) {
  console.log(x);
}

function dbg(x) {
  if (showDebug) console.debug('Debug: ', x);
}

// empty strings and zeroes are falsy... ;(
function isSet(x) {
  return x !== undefined && x !== null;
}

const argv = yargs(hideBin(process.argv))
  .command(
    '$0 <sourceDbPath> <destDbPath>',
    'Database management CLI tool',
    args => {
      args
        .positional('sourceDbPath', {
          type: 'string',
          default: null,
          describe: 'Path to the source database',
        })
        .positional('destDbPath', {
          type: 'string',
          default: null,
          describe: 'Path to the destination database',
        })
        .option('backup', {
          type: 'boolean',
          default: null,
          describe:
            'Perform a full backup of the source database to the destination. Destination file must not exist.',
        })
        .option('transcripts', {
          type: 'string',
          default: null,
          describe:
            'Copy transcripts. Use `--transcripts=all` to copy all transcripts and transcriptSpans.',
        })
        .option('bundles', {
          type: 'string',
          default: null,
          describe:
            'Copy bundles. Use `--bundles=all` to copy all bundles or specify a comma-separated list of bundleIDs.',
        })
        .option('snapshots', {
          type: 'string',
          default: null,
          describe:
            'Copy snapshots. Use `--snapshots=all`/`--snapshots=inuse` to copy all/in-use snapshots, or filter using startPos and endPos.',
        })
        .option('stats', {
          type: 'boolean',
          default: null,
          describe:
            'Print stats for each database: source before operation(s) and destination after.',
        })
        .option('vats', {
          type: 'string',
          default: null,
          describe:
            'Filter by vatID. Specify a comma-separated list of vatIDs or use `--vats=all` to include all.',
        })
        .option('startPos', {
          type: 'number',
          default: null,
          describe: 'Include items with position >= startPos.',
        })
        .option('endPos', {
          type: 'number',
          default: null,
          describe: 'Include items with position <= endPos.',
        })
        .option('debug', {
          type: 'boolean',
          default: null,
          describe: 'Produce debug output.',
        })
        .option('help', {
          alias: 'h',
          type: 'boolean',
          default: null,
          describe: 'Show help.',
        });
    },
  )
  .help().argv;

/**
 * Updates bundleFilter based on content of transcriptItems
 *
 * @param {Set<string>} filter  - filter set
 * @param {{
 *          vatID: string,
 *          position: number,
 *          item: string,
 *          incarnation: number,
 *          }} item             - transcriptItem
 */
function updateBundleFilter(filter, item) {
  const decoded = item?.item ? JSON.parse(item.item) : null;
  const type = decoded?.d?.[0];
  // TODO: are there any other message types that refer to bundles that we care about?
  // "message": "bundleInstalled" ?
  // "message": "waitForBundleCap" ?
  // "message": "getBundleCap" ?
  if (type === 'initialize-worker') {
    const bundleID = decoded?.d?.[1]?.source?.bundleID;
    if (bundleID) filter.add(bundleID);

    const bundles = decoded?.d?.[1]?.workerOptions?.bundleIDs;
    if (bundles) bundles.map(bundle => filter.add(bundle));
    dbg(`updateBundleFilter: ${type}: ${bundleID} ${bundles?.join(' ')}`);
  }
}

/**
 * Updates snapFilter based on content of transcriptItems
 *
 * @param {Set<string>} filter  - filter set
 * @param {{
 *          vatID: string,
 *          position: number,
 *          item: string,
 *          incarnation: number,
 *          }} item             - transcriptItem
 */
function updateSnapFilter(filter, item) {
  const decoded = item?.item ? JSON.parse(item.item) : null;
  const type = decoded?.d?.[0];

  if (type === 'load-snapshot') {
    const snapID = decoded?.d?.[1]?.snapshotID;
    dbg(`updateSnapFilter: ${type}: ${snapID}`);
    if (snapID) filter.add(snapID);
  } else if (type === 'save-snapshot') {
    const snapID = decoded?.r?.snapshotID;
    dbg(`updateSnapFilter: ${type}: ${snapID}`);
    if (snapID) filter.add(snapID);
  }
}

/**
 * Prints out row counts for each table in the database.
 * @param {Database} db - The SQLite database.
 */
function getStats(db) {
  try {
    log(`${db.name}:`);

    // Query to fetch all table names in the database
    const tablesQuery = `
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%';
      `;

    const tables = db.prepare(tablesQuery).all();

    if (tables.length === 0) {
      log('No tables found in the database.');
      return;
    }

    log(`Table\tRows`);
    // Fetch row counts for each table
    for (const { name } of tables) {
      const countQuery = `SELECT COUNT(*) AS count FROM ${name}`;
      const { count } = db.prepare(countQuery).get();
      log(`${name}\t${count}`);
    }
  } catch (error) {
    err(error.message);
  } finally {
    log(''); // log a blank line to improve output readability
  }
}

async function maybeDoBackup(backup, srcDb, destDbPath) {
  // a sacraficial gift to gods of ESlint...
  await 0;

  if (!isSet(backup)) return;

  log('Performing backup, this may take a while...');
  try {
    await srcDb.backup(destDbPath);
    log('Backup completed successfully.\n');
    // fall through for --stats option
  } catch (error) {
    die(error.message);
  }
}

async function main() {
  const {
    sourceDbPath,
    destDbPath,
    backup,
    transcripts,
    bundles,
    snapshots,
    stats,
    vats,
    startPos,
    endPos,
    debug,
  } = argv;
  showDebug = debug;

  /*
   * Filters:
   *
   * Multiple filters applied to further restrict the selection, a
   * logical "and" operation. A null value of a filter variable means no
   * filtering to be performed on that particular criteria.
   *
   * A pre-populated Set selects only what is included in the set.
   * Some empty sets can be populated automatically with heuristics when
   * "auto" is specified. An empty set that makes it empty all the way
   * to actual selection will result in an empty set (no items selected)
   */
  const vatFilter =
    isSet(vats) && vats !== 'all'
      ? new Set(vats.split(',').filter(x => x !== ''))
      : null;
  const startFilter = isSet(startPos) ? startPos : null; // startPos could be 0
  const endFilter = isSet(endPos) ? endPos : null; // endPos could be 0

  const snapFilter =
    isSet(snapshots) && snapshots !== 'all' && snapshots !== 'inuse'
      ? new Set(
          snapshots !== 'auto'
            ? snapshots.split(',').filter(x => x !== '')
            : [],
        )
      : null;

  const bundleFilter =
    isSet(bundles) && bundles !== 'all'
      ? new Set(
          bundles !== 'auto' ? bundles.split(',').filter(x => x !== '') : [],
        )
      : null;

  let didWork = false;

  // sanity checking
  if (bundles === '')
    die('--bundles option requires some bundle ID[s], "all", or "auto".');

  if (bundles === 'auto' && !isSet(transcripts))
    die('--bundles=auto requires --transcripts');

  if (snapshots === '' && !vats)
    die(
      '--snapshots option requires --vats or be set to snapshot ID[s], "all", or "auto".',
    );

  if (snapshots === 'auto' && !isSet(transcripts))
    die('--snapshots=auto requires --transcripts');

  if (transcripts === '' && !vats)
    die('--transcripts option requires --vats or be set to "all"');

  if (vats === '') die('--vats option requires some vat ID[s] or "all".');

  if (vatFilter && vatFilter.size !== 1 && (startFilter || endFilter))
    die('--startPos and --endPos require a single vat ID in --vats option.');

  if (
    isSet(backup) &&
    (isSet(transcripts) ||
      isSet(bundles) ||
      isSet(snapshots) ||
      isSet(vats) ||
      isSet(startPos) ||
      isSet(endPos))
  )
    die('--backup can only be combined with --stats option.');

  const srcDb = sqlite3(sourceDbPath, { readonly: true });

  // first await cannot be nested, so here we go...
  await maybeDoBackup(backup, srcDb, destDbPath);

  const destDb = sqlite3(destDbPath, { fileMustExist: false });

  try {
    srcDb.prepare('BEGIN TRANSACTION').run();
    destDb.prepare('BEGIN TRANSACTION').run();

    if (stats) {
      getStats(srcDb);
      getStats(destDb);
    }

    // filter transactions first so bundle/snapshot filters can be populated for "auto" option
    if (isSet(transcripts)) {
      didWork = true;
      log('Copying transcripts...');
      if (transcripts === 'all' && (startFilter || endFilter))
        warn('--transcripts=all overrides --startPos / --endPos');

      let items = [];
      let spans = [];

      // skip query if we have an empty set of vats
      if (vatFilter === null || vatFilter.size !== 0) {
        const sqlVatFilter = vatFilter
          ? `AND vatID IN (${[...vatFilter].map(() => '?').join(',')})`
          : '';

        const transcriptItemsQuery = `SELECT * FROM transcriptItems WHERE 1=1
            ${sqlVatFilter}
            ${startFilter ? 'AND position >= ?' : ''}
            ${endFilter ? 'AND position <= ?' : ''}`;

        const transcriptSpansQuery = `SELECT * FROM transcriptSpans WHERE 1=1
            ${sqlVatFilter}
            ${startFilter ? 'AND endPos >= ?' : ''}
            ${endFilter ? 'AND startPos <= ?' : ''}`;

        dbg(`transcripts = ${transcripts};`);
        dbg(`vatFilter.size = ${vatFilter?.size};`);
        dbg(`startFilter = ${startFilter};`);
        dbg(`endFilter = ${endFilter};`);
        dbg(`transcriptItemsQuery = ${transcriptItemsQuery};`);
        dbg(`transcriptSpansQuery = ${transcriptSpansQuery};`);

        const sqlArgs = [
          ...(vatFilter || []),
          ...(startFilter ? [startFilter] : []),
          ...(endFilter ? [endFilter] : []),
        ].filter(x => isSet(x)); // allow for zeroes

        items = srcDb.prepare(transcriptItemsQuery).all(...sqlArgs);
        spans = srcDb.prepare(transcriptSpansQuery).all(...sqlArgs);
      }

      // create tables regardless of whether any items had been found or not
      destDb.exec(`CREATE TABLE IF NOT EXISTS transcriptItems (
        vatID TEXT, position INTEGER, item TEXT, incarnation INTEGER, PRIMARY KEY (vatID, position)
      )`);
      destDb.exec(`CREATE TABLE IF NOT EXISTS transcriptSpans (
        vatID TEXT, startPos INTEGER, endPos INTEGER, hash TEXT, isCurrent INTEGER CHECK (isCurrent = 1), incarnation INTEGER,
        PRIMARY KEY (vatID, startPos), UNIQUE (vatID, isCurrent)
      )`);

      destDb.exec(
        `CREATE INDEX IF NOT EXISTS currentTranscriptIndex ON transcriptSpans (vatID, isCurrent)`,
      );

      const insertTranscriptItems = destDb.prepare(
        `INSERT OR IGNORE INTO transcriptItems (vatID, position, item, incarnation) VALUES (?, ?, ?, ?)`,
      );
      const insertTranscriptSpans = destDb.prepare(
        `INSERT OR IGNORE INTO transcriptSpans (vatID, startPos, endPos, hash, isCurrent, incarnation) VALUES (?, ?, ?, ?, ?, ?)`,
      );

      // insert items into new DB and add relevant bundles/snapshots to filters, if needed
      for (const item of items) {
        insertTranscriptItems.run(
          item.vatID,
          item.position,
          item.item,
          item.incarnation,
        );

        if (bundleFilter && bundles === 'auto')
          updateBundleFilter(bundleFilter, item);

        if (snapFilter && snapshots === 'auto')
          updateSnapFilter(snapFilter, item);
      }

      for (const span of spans) {
        insertTranscriptSpans.run(
          span.vatID,
          span.startPos,
          span.endPos,
          span.hash,
          span.isCurrent,
          span.incarnation,
        );
      }

      log(
        `${spans.length}/${items.length} transcript spans/items copied successfully.\n`,
      );
    }

    if (isSet(bundles)) {
      // TODO: update bundle filter for --bundles=auto option
      didWork = true;
      log('Copying bundles...');

      let bundlesData = [];

      // skip query if bundleFilter contains an empty set
      if (bundleFilter === null || bundleFilter.size !== 0) {
        const bundleQuery = bundleFilter
          ? `SELECT * FROM bundles WHERE bundleID IN (${[...bundleFilter].map(() => '?').join(',')})`
          : 'SELECT * FROM bundles';

        dbg(`bundles = ${bundles};`);
        dbg(`bundleFilter.size = ${bundleFilter?.size};`);
        dbg(`bundleQuery = ${bundleQuery};`);

        bundlesData = srcDb.prepare(bundleQuery).all(...(bundleFilter || []));
      }
      destDb.exec(`CREATE TABLE IF NOT EXISTS bundles (
        bundleID TEXT, bundle BLOB, PRIMARY KEY (bundleID)
      )`);

      const insertBundles = destDb.prepare(
        `INSERT OR IGNORE INTO bundles (bundleID, bundle) VALUES (?, ?)`,
      );
      for (const bundle of bundlesData) {
        insertBundles.run(bundle.bundleID, bundle.bundle);
      }

      console.log(`${bundlesData.length} bundles copied successfully.\n`);
    }

    if (isSet(snapshots)) {
      didWork = true;
      log('Copying snapshots...');
      if (isSet(vats) && (snapshots === 'all' || snapshots === 'auto'))
        warn(`--snapshots=${snapshots}, ignoring --vats filter`);

      if (snapshots === 'all' && (isSet(startFilter) || isSet(endFilter)))
        warn('--snapshots=all overrides --startPos / --endPos');

      let snapshotsData = [];
      // skip query if snapFilter or vatFilet contains an empty set
      if (
        (snapFilter === null || snapFilter.size !== 0) &&
        (vatFilter === null || vatFilter.size !== 0)
      ) {
        const snapshotsQuery =
          snapshots === 'all'
            ? 'SELECT * FROM snapshots'
            : `SELECT * FROM snapshots WHERE 1=1
        ${vatFilter ? `AND vatID IN (${[...vatFilter].map(() => '?').join(',')})` : ''}
        ${snapFilter ? `AND hash IN (${[...snapFilter].map(() => '?').join(',')})` : ''}
        ${startFilter ? 'AND snapPos >= ?' : ''}
        ${endFilter ? 'AND snapPos <= ?' : ''}
        ${snapshots === 'inuse' ? 'AND inUse = 1' : ''}`;

        dbg(`snapshots = ${snapshots};`);
        dbg(`snapFilter.size = ${snapFilter?.size};`);
        dbg(`snapshotsQuery = ${snapshotsQuery};`);

        const sqlArgs =
          snapshots === 'all'
            ? []
            : [
                ...(vatFilter || []),
                ...(snapFilter || []),
                ...(startFilter ? [startFilter] : []),
                ...(endFilter ? [endFilter] : []),
              ].filter(x => isSet(x)); // allow for zeroes

        snapshotsData = srcDb.prepare(snapshotsQuery).all(...sqlArgs);
      }
      destDb.exec(`CREATE TABLE IF NOT EXISTS snapshots (
        vatID TEXT, snapPos INTEGER, inUse INTEGER CHECK(inUse = 1), hash TEXT, uncompressedSize INTEGER,
        compressedSize INTEGER, compressedSnapshot BLOB, PRIMARY KEY (vatID, snapPos)
      )`);

      const insertSnapshots = destDb.prepare(
        `INSERT OR IGNORE INTO snapshots (vatID, snapPos, inUse, hash, uncompressedSize, compressedSize, compressedSnapshot) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );

      for (const snapshot of snapshotsData) {
        insertSnapshots.run(
          snapshot.vatID,
          snapshot.snapPos,
          snapshot.inUse,
          snapshot.hash,
          snapshot.uncompressedSize,
          snapshot.compressedSize,
          snapshot.compressedSnapshot,
        );
      }
      log(`${snapshotsData.length} snapshots copied successfully.\n`);
    }

    if (stats && didWork) getStats(destDb);

    destDb.prepare('COMMIT').run();
  } catch (error) {
    err(error.message);
    destDb.prepare('ROLLBACK').run();
    throw error;
  } finally {
    srcDb.prepare('ROLLBACK').run();
    srcDb.close();
    destDb.close();
  }
}

main().catch(error => {
  die(error.message);
});
