#!/usr/bin/env node
/* eslint-env node */

/**
 * Simple boilerplate program providing linkage to launch an application written
 * using modules within the as yet not-entirely-ESM-supporting version of
 * NodeJS.
 */

// Now do lockdown.
import '@endo/init';
import { main } from './kerneldump.js';

process.exitCode = 1;
main().then(
  () => {
    process.exitCode = 0;
  },
  error => {
    console.error(error);
  },
);
