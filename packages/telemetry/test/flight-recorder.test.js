import fs from 'node:fs';
import { promisify } from 'node:util';
import tmp from 'tmp';
import { test } from './prepare-test-env-ava.js';

import {
  makeSimpleCircularBuffer,
  makeSlogSenderFromBuffer,
} from '../src/flight-recorder.js';

// Factored this way to support multiple implementations, which at one point there were
const bufferTests = test.macro(
  /**
   *
   * @param {*} t
   * @param {{makeBuffer: Function}} input
   */
  async (t, input) => {
    const BUFFER_SIZE = 512;

    const {
      name: tmpFile,
      fd,
      removeCallback,
    } = tmp.fileSync({ detachDescriptor: true });
    t.teardown(removeCallback);
    const fileHandle = /** @type {import('fs/promises').FileHandle} */ ({
      close: promisify(fs.close.bind(fs, fd)),
    });
    const { readCircBuf, writeCircBuf } = await input.makeBuffer({
      circularBufferSize: BUFFER_SIZE,
      circularBufferFilename: tmpFile,
    });
    const slogSender = makeSlogSenderFromBuffer({ fileHandle, writeCircBuf });
    t.teardown(slogSender.shutdown);
    slogSender({ type: 'start' });
    await slogSender.forceFlush();
    t.is(fs.readFileSync(tmpFile, { encoding: 'utf8' }).length, BUFFER_SIZE);

    const len0 = new Uint8Array(BigUint64Array.BYTES_PER_ELEMENT);
    const { done: done0 } = readCircBuf(len0);
    t.false(done0, 'readCircBuf should not be done');
    const dv0 = new DataView(len0.buffer);
    const buf0 = new Uint8Array(Number(dv0.getBigUint64(0)));
    const { done: done0b } = readCircBuf(buf0, len0.byteLength);
    t.false(done0b, 'readCircBuf should not be done');
    const buf0Str = new TextDecoder().decode(buf0);
    t.is(buf0Str, `\n{"type":"start"}`, `start compare failed`);

    const last = 500;
    for (let i = 0; i < last; i += 1) {
      slogSender({ type: 'iteration', iteration: i });
      await slogSender.forceFlush();
      t.is(
        fs.readFileSync(tmpFile, { encoding: 'utf8' }).length,
        BUFFER_SIZE,
        `iteration ${i} length mismatch`,
      );
    }

    let offset = 0;
    const len1 = new Uint8Array(BigUint64Array.BYTES_PER_ELEMENT);
    for (let i = 490; i < last; i += 1) {
      const { done: done1 } = readCircBuf(len1, offset);
      offset += len1.byteLength;
      t.false(done1, `readCircBuf ${i} should not be done`);
      const dv1 = new DataView(len1.buffer);
      const buf1 = new Uint8Array(Number(dv1.getBigUint64(0)));
      const { done: done1b } = readCircBuf(buf1, offset);
      offset += buf1.byteLength;
      t.false(done1b, `readCircBuf ${i} should not be done`);
      const buf1Str = new TextDecoder().decode(buf1);
      t.is(
        buf1Str,
        `\n{"type":"iteration","iteration":${i}}`,
        `iteration ${i} compare failed`,
      );
    }

    const { done: done2 } = readCircBuf(len1, offset);
    t.assert(done2, `readCircBuf ${last} should be done`);

    slogSender(null, 'PRE-SERIALIZED');
    await slogSender.forceFlush();
    t.truthy(fs.readFileSync(tmpFile).includes('PRE-SERIALIZED'));
  },
);

test('simple', bufferTests, {
  makeBuffer: makeSimpleCircularBuffer,
});
