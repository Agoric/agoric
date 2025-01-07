#!/usr/bin/env node
import '@endo/init';
import process from 'process';
import { spawn } from 'child_process';
import { type as osType } from 'os';
import { promises as fsp } from 'fs';
import path from 'path';
import glob from 'glob';
import bundleSource from '@endo/bundle-source';

import { main, makeBundleResolve } from './avaXS.js';

Promise.resolve()
  .then(async _ =>
    main(process.argv.slice(2), {
      bundleSource,
      spawn,
      osType,
      readFile: fsp.readFile,
      resolve: makeBundleResolve(path),
      basename: path.basename,
      dirname: path.dirname,
      glob,
    }),
  )
  .then(status => {
    process.exit(status);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
