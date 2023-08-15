#! /usr/bin/env node
/* global process */
// frcat - print out the contents of a flight recorder
// NOTE: this only works on inactive recorder files where the writer has terminated

import '@endo/init';

import { makeMemoryMappedCircularBuffer } from './flight-recorder.js';

const main = async () => {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    throw Error('no flight-recorder.bin files specified');
  }

  for await (const file of files) {
    const { readCircBuf } = await makeMemoryMappedCircularBuffer({
      circularBufferFilename: file,
      circularBufferSize: 0,
    });

    let offset = 0;
    for (;;) {
      const lenBuf = new Uint8Array(BigUint64Array.BYTES_PER_ELEMENT);
      const { done } = readCircBuf(lenBuf, offset);
      if (done) {
        break;
      }
      offset += lenBuf.byteLength;
      const dv = new DataView(lenBuf.buffer);
      const len = Number(dv.getBigUint64(0));

      const { done: done2, value: buf } = readCircBuf(
        new Uint8Array(len),
        offset,
      );
      if (done2) {
        break;
      }
      offset += len;
      const bufStr = new TextDecoder().decode(buf);
      if (bufStr[0] === '\n') {
        process.stdout.write(bufStr.slice(1));
      } else {
        process.stdout.write(bufStr);
      }
      if (process.stdout.write('\n')) {
        continue;
      }

      // If the buffer is full, wait for stdout to drain.
      await new Promise(resolve => process.stdout.once('drain', resolve));
    }
  }
};

process.exitCode = 1;
main().then(
  () => {
    process.exitCode = 0;
  },
  err => {
    console.error('Failed with', err);
    process.exit(process.exitCode || 1);
  },
);
