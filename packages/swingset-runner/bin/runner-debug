#!/usr/bin/env -S node --inspect-brk
/* eslint-env node */

/**
 * Simple boilerplate program providing linkage to launch an application written using modules within the
 * as yet not-entirely-ESM-supporting version of NodeJS.
 */

import '@endo/init/pre.js';

// Now do lockdown.
import '@endo/init';
import { main } from './main.js';

process.exitCode = 1;
main().then(
  () => {
    process.exitCode = 0;
  },
  error => {
    console.error(error);
  },
);
