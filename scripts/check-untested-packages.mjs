#! /usr/bin/env node
/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
// eslint-disable-next-line import/no-relative-packages -- okay for dev script
import { listWorkspaces } from '../packages/agoric-cli/src/lib/packageManager.js';

const parent = new URL('..', import.meta.url).pathname;

const testYaml = path.resolve(
  parent,
  '.github/workflows/test-all-packages.yml',
);
console.log('Reading', testYaml);
const testYamlContent = fs.readFileSync(testYaml, 'utf-8');

console.log('Searching for "cd <location> && yarn test"...');
let status = 0;
for (const { name: pkg, location } of listWorkspaces({ execFileSync })) {
  const cmd = `cd ${location} && yarn \${{ steps.vars.outputs.test }}`;
  if (!testYamlContent.includes(cmd)) {
    console.error(`Cannot find ${location} (${pkg})`);
    status = 1;
  }
}

console.log(status ? 'Failed!' : 'Succeeded!');
process.exit(status);
