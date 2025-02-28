// @ts-check
/* eslint-env node */
/// <reference types="ses" />

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Fail } from '@endo/errors';
import { serializeSlogObj } from './serialize-slog-obj.js';

/**
 * @import {EReturn} from '@endo/far';
 */

export const DEFAULT_CBUF_SIZE = 100 * 1024 * 1024;
export const DEFAULT_CBUF_FILE = 'flight-recorder.bin';
export const SLOG_MAGIC = 0x41472d534c4f4721n; // 'AG-SLOG!'

const I_MAGIC = 0 * BigUint64Array.BYTES_PER_ELEMENT;
const I_ARENA_SIZE = 1 * BigUint64Array.BYTES_PER_ELEMENT;
const I_CIRC_START = 2 * BigUint64Array.BYTES_PER_ELEMENT;
const I_CIRC_END = 3 * BigUint64Array.BYTES_PER_ELEMENT;
const I_ARENA_START = 4 * BigUint64Array.BYTES_PER_ELEMENT;

const RECORD_HEADER_SIZE = BigUint64Array.BYTES_PER_ELEMENT;

/**
 * Initializes a circular buffer with the given size, creating the buffer file if it doesn't exist or is not large enough.
 *
 * @param {string} bufferFile - the file path for the circular buffer
 * @param {number} circularBufferSize - the size of the circular buffer
 * @returns {Promise<bigint>} the size of the initialized circular buffer
 */
const initializeCircularBuffer = async (bufferFile, circularBufferSize) => {
  // If the file doesn't exist, or is not large enough, create it.
  const stbuf = await fsp.stat(bufferFile).catch(e => {
    if (e.code === 'ENOENT') {
      return undefined;
    }
    throw e;
  });
  const arenaSize = BigInt(circularBufferSize - I_ARENA_START);

  if (stbuf && stbuf.size >= I_ARENA_START) {
    // Header already exists.
    return arenaSize;
  }

  // Write the header.
  const headerBuf = new Uint8Array(I_ARENA_START);
  const header = new DataView(headerBuf.buffer);
  header.setBigUint64(I_MAGIC, SLOG_MAGIC);
  header.setBigUint64(I_ARENA_SIZE, arenaSize);
  header.setBigUint64(I_CIRC_START, 0n);
  header.setBigUint64(I_CIRC_END, 0n);

  await fsp.mkdir(path.dirname(bufferFile), { recursive: true });
  await fsp.writeFile(bufferFile, headerBuf);

  if (stbuf && stbuf.size >= circularBufferSize) {
    // File is big enough.
    return arenaSize;
  }

  // Increase the file size.
  await fsp.truncate(bufferFile, circularBufferSize);
  return arenaSize;
};

/** @typedef {EReturn<typeof makeSimpleCircularBuffer>} CircularBuffer */

/**
 *
 * @param {bigint} arenaSize
 * @param {DataView} header
 * @param {(outbuf: Uint8Array, readStart: number, firstReadLength: number) => void} readRecord
 * @param {(record: Uint8Array, firstWriteLength: number, circEnd: bigint) => Promise<void>} writeRecord
 */
function makeCircBufMethods(arenaSize, header, readRecord, writeRecord) {
  const readCircBuf = (outbuf, offset = 0) => {
    offset + outbuf.byteLength <= arenaSize ||
      Fail`Reading past end of circular buffer`;

    // Read the data to the end of the arena.
    let firstReadLength = outbuf.byteLength;
    const circStart = header.getBigUint64(I_CIRC_START);
    const circEnd = header.getBigUint64(I_CIRC_END);
    const readStart = (Number(circStart) + offset) % Number(arenaSize);
    if (circStart > circEnd) {
      // The data is wrapped around the end of the arena, like BBB---AAA
      firstReadLength = Math.min(
        firstReadLength,
        Number(arenaSize) - readStart,
      );
      if (readStart >= circEnd && readStart < circStart) {
        return { done: true, value: undefined };
      }
    } else if (readStart < circStart || readStart >= circEnd) {
      // The data is contiguous, like ---AAABBB---
      return { done: true, value: undefined };
    }
    readRecord(outbuf, readStart, firstReadLength);
    return { done: false, value: outbuf };
  };

  /** @type {(data: Uint8Array) => Promise<void>} */
  const writeCircBuf = async data => {
    if (RECORD_HEADER_SIZE + data.byteLength > arenaSize) {
      // The data is too big to fit in the arena, so skip it.
      const tooBigRecord = JSON.stringify({
        type: 'slog-record-too-big',
        snippet: new TextDecoder().decode(data.subarray(0, 20)),
      });
      data = new TextEncoder().encode(tooBigRecord);
    }

    if (RECORD_HEADER_SIZE + data.byteLength > arenaSize) {
      // Silently drop, it just doesn't fit.
      return;
    }

    // Allocate for the data and a header
    const record = new Uint8Array(RECORD_HEADER_SIZE + data.byteLength);
    // Set the data, after the header
    record.set(data, RECORD_HEADER_SIZE);

    // Set the size in the header
    const lengthPrefix = new DataView(record.buffer);
    lengthPrefix.setBigUint64(0, BigInt(data.byteLength));

    // Check if we need to wrap around.
    /** @type {bigint} */
    let capacity;
    let circStart = header.getBigUint64(I_CIRC_START);
    const circEnd = header.getBigUint64(I_CIRC_END);
    if (circStart <= circEnd) {
      // ---AAAABBBB----
      capacity = arenaSize - circEnd + circStart;
    } else {
      // BBB---AAAA
      capacity = circStart - circEnd;
    }

    // Advance the start pointer until we have space to write the record.
    let overlap = BigInt(record.byteLength) - capacity;
    while (overlap > 0n) {
      const startRecordLength = new Uint8Array(RECORD_HEADER_SIZE);
      const { done } = readCircBuf(startRecordLength);
      if (done) {
        break;
      }

      const dv = new DataView(startRecordLength.buffer);
      const totalRecordLength =
        BigInt(startRecordLength.byteLength) + // size of the length field
        dv.getBigUint64(0); // size of the record

      circStart = (circStart + totalRecordLength) % arenaSize;
      header.setBigUint64(I_CIRC_START, circStart);
      overlap -= totalRecordLength;
    }

    // Append the record.
    let firstWriteLength = record.byteLength;
    if (circStart < circEnd) {
      // May need to wrap, it's ---AAAABBBB---
      firstWriteLength = Math.min(
        firstWriteLength,
        Number(arenaSize - circEnd),
      );
    }

    header.setBigUint64(
      I_CIRC_END,
      (circEnd + BigInt(record.byteLength)) % arenaSize,
    );

    return writeRecord(record, firstWriteLength, circEnd);
  };

  return { readCircBuf, writeCircBuf };
}

/**
 * @param {{
 *   circularBufferSize?: number,
 *   stateDir?: string,
 *   circularBufferFilename?: string
 * }} opts
 */
export const makeSimpleCircularBuffer = async ({
  circularBufferSize = DEFAULT_CBUF_SIZE,
  stateDir = '/tmp',
  circularBufferFilename,
}) => {
  const filename = circularBufferFilename || `${stateDir}/${DEFAULT_CBUF_FILE}`;

  const newArenaSize = await initializeCircularBuffer(
    filename,
    circularBufferSize,
  );

  const file = await fsp.open(filename, 'r+');

  const headerBuffer = Buffer.alloc(I_ARENA_START);

  await file.read({
    buffer: headerBuffer,
    length: I_ARENA_START,
    position: 0,
  });
  const header = new DataView(headerBuffer.buffer);

  // Detect the arena size from the header, if not initialized.
  const hdrArenaSize = header.getBigUint64(I_ARENA_SIZE);
  const arenaSize = newArenaSize || hdrArenaSize;

  const hdrMagic = header.getBigUint64(I_MAGIC);
  SLOG_MAGIC === hdrMagic ||
    Fail`${filename} is not a slog buffer; wanted magic ${SLOG_MAGIC}, got ${hdrMagic}`;
  arenaSize === hdrArenaSize ||
    Fail`${filename} arena size mismatch; wanted ${arenaSize}, got ${hdrArenaSize}`;

  /** @type {(outbuf: Uint8Array, readStart: number, firstReadLength: number) => void} */
  const readRecord = (outbuf, readStart, firstReadLength) => {
    const bytesRead = fs.readSync(file.fd, outbuf, {
      length: firstReadLength,
      position: Number(readStart) + I_ARENA_START,
    });
    assert.equal(bytesRead, firstReadLength, 'Too few bytes read');

    if (bytesRead < outbuf.byteLength) {
      fs.readSync(file.fd, outbuf, {
        offset: firstReadLength,
        length: outbuf.byteLength - firstReadLength,
        position: I_ARENA_START,
      });
    }
  };

  /**
   * Writes to the file, offset by the header size. Also updates the file header.
   *
   * @param {Uint8Array} record
   * @param {number} firstWriteLength
   * @param {bigint} circEnd
   */
  const writeRecord = async (record, firstWriteLength, circEnd) => {
    await file.write(
      record,
      // TS saying options bag not available
      0,
      firstWriteLength,
      I_ARENA_START + Number(circEnd),
    );
    if (firstWriteLength < record.byteLength) {
      // Write to the beginning of the arena.
      await file.write(
        record,
        firstWriteLength,
        record.byteLength - firstWriteLength,
        I_ARENA_START,
      );
    }

    // Write out the updated file header.
    // This is somewhat independent of writing the record itself, but it needs
    // updating each time a record is written.
    await file.write(headerBuffer, undefined, undefined, 0);
  };

  return {
    fileHandle: file,
    ...makeCircBufMethods(arenaSize, header, readRecord, writeRecord),
  };
};

/**
 *
 * @param {Pick<CircularBuffer, 'fileHandle' | 'writeCircBuf'>} circBuf
 */
export const makeSlogSenderFromBuffer = ({ fileHandle, writeCircBuf }) => {
  /** @type {Promise<void>} */
  let toWrite = Promise.resolve();
  const writeJSON = (obj, serialized = serializeSlogObj(obj)) => {
    // Prepend a newline so that the file can be more easily manipulated.
    const data = new TextEncoder().encode(`\n${serialized}`);
    // console.log('have obj', obj, data);
    toWrite = toWrite.then(() => writeCircBuf(data));
  };
  return Object.assign(writeJSON, {
    forceFlush: async () => {
      await toWrite;
    },
    shutdown: async () => {
      await toWrite;
      await fileHandle.close();
    },
    usesJsonObject: true,
  });
};

/**
 * Loaded dynamically by makeSlogSender()
 *
 * @type {import('./index.js').MakeSlogSender}
 */
export const makeSlogSender = async opts => {
  const { fileHandle, writeCircBuf } = await makeSimpleCircularBuffer(opts);
  return makeSlogSenderFromBuffer({ fileHandle, writeCircBuf });
};
