// @ts-check
/* eslint-disable import/no-extraneous-dependencies -- requiring the package itself to check exports map */
import test from 'ava';

import '@endo/init';

import * as index from '@agoric/cosmic-proto';
import * as swingsetMsgs from '@agoric/cosmic-proto/swingset/msgs.js';
import * as swingsetQuery from '@agoric/cosmic-proto/swingset/query.js';
import * as vstorageQuery from '@agoric/cosmic-proto/vstorage/query.js';

test('index', t => {
  t.snapshot(Object.keys(index).sort());
});

test('swingset/msgs', t => {
  t.snapshot(Object.keys(swingsetMsgs).sort());
});

test('swingset/query', t => {
  t.snapshot(Object.keys(swingsetQuery).sort());
});

test('vstorage/query', t => {
  t.snapshot(Object.keys(vstorageQuery).sort());
});

test('agoric', t => {
  t.snapshot(Object.keys(index.agoric).sort());
});

test('cosmos', t => {
  t.snapshot(Object.keys(index.cosmos).sort());
});
