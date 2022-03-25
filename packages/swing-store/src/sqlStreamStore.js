// @ts-check
import path from 'path';
import sqlite3ambient from 'better-sqlite3';
import { assert, details as X, q } from '@agoric/assert';

const STREAM_START = { itemCount: 0 };
/** @typedef {import('./swingStore').StreamPosition} StreamPosition */

/**
 * @param {unknown} streamName
 * @returns {asserts streamName is string}
 */
function insistStreamName(streamName) {
  assert.typeof(streamName, 'string');
  assert(streamName.match(/^[-\w]+$/), X`invalid stream name ${q(streamName)}`);
  return undefined;
}

/**
 * @param {unknown} position
 * @returns {asserts position is StreamPosition}
 */
function insistStreamPosition(position) {
  assert.typeof(position, 'object');
  assert(position);
  assert.typeof(position.itemCount, 'number');
  assert(position.itemCount >= 0);
  return undefined;
}

/**
 * @param {string} dbDir
 * @param {{ sqlite3?: typeof import('better-sqlite3') }} [io]
 */
export function sqlStreamStore(dbDir, io) {
  const { sqlite3 = sqlite3ambient } = io || {};
  const filePath = path.join(dbDir, 'streams.sqlite');
  const db = sqlite3(
    filePath,
    // { verbose: console.log },
  );
  db.exec(`
    CREATE TABLE IF NOT EXISTS streamItem (
      streamName TEXT,
      position INTEGER,
      item TEXT,
      PRIMARY KEY (streamName, position)
    )
  `);

  const streamStatus = new Map();

  /**
   * @param {string} streamName
   * @param {StreamPosition} startPosition
   * @param {StreamPosition} endPosition
   */
  function readStream(streamName, startPosition, endPosition) {
    insistStreamName(streamName);
    assert(
      !streamStatus.get(streamName),
      X`can't read stream ${q(streamName)} because it's already in use`,
    );
    insistStreamPosition(startPosition);
    insistStreamPosition(endPosition);
    assert(
      startPosition.itemCount <= endPosition.itemCount,
      X`${q(startPosition.itemCount)} <= ${q(endPosition.itemCount)}}`,
    );

    function* reader() {
      const query = db.prepare(`
        SELECT item
        FROM streamItem
        WHERE streamName = ? AND position >= ? AND position < ?
        ORDER BY position
      `);
      for (const { item } of query.iterate(
        streamName,
        startPosition.itemCount,
        endPosition.itemCount,
      )) {
        assert(
          streamStatus.get(streamName) === 'reading',
          X`can't read stream ${q(streamName)}, it's been closed`,
        );
        yield item;
      }
      streamStatus.delete(streamName);
    }

    assert(
      !streamStatus.has(streamName),
      X`can't read stream ${q(streamName)} because it's already in use`,
    );

    if (startPosition.itemCount === endPosition.itemCount) {
      return [];
    }

    streamStatus.set(streamName, 'reading');

    return reader();
  }

  /**
   * @param {string} streamName
   * @param {string} item
   * @param {StreamPosition} position
   */
  const writeStreamItem = (streamName, item, position) => {
    insistStreamName(streamName);
    insistStreamPosition(position);

    assert(
      !streamStatus.get(streamName),
      X`can't write stream ${q(streamName)} because it's already in use`,
    );

    db.prepare(
      `
      INSERT INTO streamItem (streamName, item, position)
        VALUES (?, ?, ?)
        ON CONFLICT(streamName, position) DO UPDATE SET item = ?
      `,
    ).run(streamName, item, position.itemCount, item);
    return { itemCount: position.itemCount + 1 };
  };

  /** @param {string} streamName */
  const closeStream = streamName => {
    insistStreamName(streamName);
    streamStatus.delete(streamName);
  };

  const commit = () => {
    // We use the sqlite3 auto-commit API: every command automatically starts
    // a new transaction if one is not already in effect, and every
    // automatically-started transaction is committed when the last SQL
    // statement finishes. https://sqlite.org/lang_transaction.html
  };

  return harden({
    writeStreamItem,
    readStream,
    closeStream,
    commit,
    STREAM_START,
  });
}
