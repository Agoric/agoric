#!/usr/bin/env node
// @jessie-check

/* global process */

import '@endo/init/pre.js';
import 'esm';
import '@agoric/casting/node-fetch-shim.js';
import '@endo/init';

import path from 'path';
import WebSocket from 'ws';
import { spawn } from 'child_process';
import rawFs from 'fs';
import os from 'os';

// Configure logs.
import './anylogger-agoric.js';
import anylogger from 'anylogger';

import main from './main.js';

const fs = rawFs.promises;
const log = anylogger('agoric');
const progname = path.basename(process.argv[1]);

const stdout = str => process.stdout.write(str);
const makeWebSocket = (...args) => new WebSocket(...args);

const rawArgs = process.argv.slice(2);
main(progname, rawArgs, {
  anylogger,
  stdout,
  makeWebSocket,
  fs,
  now: Date.now,
  os,
  process,
  spawn,
}).then(
  res => {
    if (Number.isSafeInteger(res)) {
      process.exitCode = res;
    }
  },
  rej => {
    log.error(rej);
    if (!process.exitCode) {
      process.exitCode = 2;
    }
  },
);
