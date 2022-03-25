import sqlite3ambient from 'better-sqlite3';
import tmpambient from 'tmp';

/** @param {{ sqlite3?: typeof sqlite3ambient; tmp?: typeof tmpambient }} [io] */
export const makeTempKVDatabase = io => {
  const { sqlite3 = sqlite3ambient, tmp = tmpambient } = io || {};

  const tmpfile = tmp.fileSync({
    prefix: 'slog-to-otel-',
    postfix: '.sqlite3',
  });
  const db = sqlite3(tmpfile.name);
  db.exec(`
    CREATE TABLE IF NOT EXISTS kind_kv (
      kind TEXT,
      key TEXT,
      value TEXT,
      PRIMARY KEY (kind, key)
    )`);
  return db;
};

/**
 * @param {string} kind
 * @param {sqlite3ambient.Database} [db]
 */
export const makeKVStringStore = (kind, db = makeTempKVDatabase()) => {
  /** @type {Pick<LegacyMap<string, string>, 'get' | 'has' | 'init'>} */
  const serialisingStore = harden({
    get: key => {
      const it = db
        .prepare(`SELECT value FROM kind_kv WHERE kind = ? AND key = ?`)
        .iterate(kind, key);
      const { done, value } = it.next();
      if (!done) {
        it.return && it.return();
      }
      // console.log({ serialised: value });
      return value.value;
    },
    has: key => {
      const it = db
        .prepare(
          `SELECT COUNT(value) AS cnt FROM kind_kv WHERE kind = ? AND key = ?`,
        )
        .iterate(kind, key);
      const { value } = it.next();
      it.return && it.return();
      // console.log({ count: value });
      return value && value.cnt > 0;
    },
    init: (key, value) => {
      const changes = db
        .prepare(`INSERT INTO kind_kv (kind, key, value) VALUES (?, ?, ?)`)
        .run(kind, key, value).changes;
      if (changes < 1) {
        throw Error(`no changes after one insert of ${kind} ${key}`);
      }
    },
  });
  return serialisingStore;
};
