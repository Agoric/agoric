#!/usr/bin/env node
// @ts-check
import '@endo/init/legacy.js';

import process from 'node:process';
import assert from 'node:assert/strict';

import { makeAgoricQueryClient } from '../dist/clients.js';

const config = {
  rpcAddrs: ['https://emerynet.rpc.agoric.net:443'],
  chainName: 'agoric-3',
};

const testMain = async () => {
  const client = await makeAgoricQueryClient(config);
  const { params } = await client.agoric.swingset.params();
  assert.deepEqual(Object.keys(params).sort(), [
    'beansPerUnit',
    'bootstrapVatConfig',
    'feeUnitPrice',
    'powerFlagFees',
    'queueMax',
  ]);
  console.log('✅ SwingSet params query successful');
};

process.exitCode = 1;
testMain().then(
  () => {
    process.exitCode = 0;
  },
  err => {
    console.error('Failed with', err);
    process.exit(process.exitCode || 1);
  },
);
