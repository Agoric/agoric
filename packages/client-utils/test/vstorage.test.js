/* eslint-env node */
// @ts-check
import test from 'ava';
import { makeVStorage } from '../src/vstorage.js';

/** @type {any} */
const fetch = async () => Promise.resolve({});

test('readFully can be used without instance binding', async t => {
  const vstorage = makeVStorage({ fetch }, { chainName: '', rpcAddrs: [''] });
  const { readFully } = vstorage;

  // Mock implementation to avoid actual network calls
  vstorage.readAt = async () => ({ blockHeight: 0, values: ['test'] });

  // This would throw if readFully required 'this' binding
  await t.notThrowsAsync(async () => readFully('some/path'));
});
