#! /usr/bin/env node
/* global setInterval */

import '@endo/init';

import fs from 'fs';
import path from 'path';
import temp from 'temp';
import process from 'process';
import { exec, spawn } from 'child_process';
import inquirer from 'inquirer';
import fetch from 'node-fetch';

import { running } from './run.js';
import { setup } from './setup.js';
import * as files from './files.js';
import deploy from './main.js';

process.on('SIGINT', () => process.exit(-1));
deploy(process.argv[1], process.argv.splice(2), {
  env: process.env,
  rd: files.reading(fs, path),
  wr: files.writing(fs, path, temp),
  setup: setup({ resolve: path.resolve, env: process.env, setInterval }),
  running: running(process, { exec, process, spawn }),
  inquirer,
  fetch,
}).then(
  res => process.exit(res || 0),
  rej => {
    console.error(`error running ag-setup-cosmos:`, rej);
    process.exit(1);
  },
);
