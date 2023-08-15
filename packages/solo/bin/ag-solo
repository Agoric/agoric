#! /usr/bin/env node

import '@endo/init/pre-bundle-source.js';

// Needed for legacy plugin support (dapp-oracle, for one).
import 'esm';

// we need to enable Math.random as a workaround for 'brace-expansion' module
// (dep chain: temp->glob->minimatch->brace-expansion)
import '@endo/init';

import process from 'process';
import path from 'path';

// Configure logs.
import '@agoric/cosmic-swingset/src/anylogger-agoric.js';
import solo from './main.js';

const baseprog = path.basename(process.argv[1]);
solo(baseprog, process.argv.slice(2)).then(
  res => process.exit(res || 0),
  reason => {
    console.error(`error running ag-solo:`, reason);
    process.exit(1);
  },
);
