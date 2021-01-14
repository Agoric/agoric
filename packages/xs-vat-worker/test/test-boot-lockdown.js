import test from 'ava';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { xsnap } from '@agoric/xsnap';

const dist = async name =>
  fs.promises.readFile(path.join(__filename, '..', '..', 'dist', name));

const decoder = new TextDecoder();

const xsnapOptions = {
  spawn: childProcess.spawn,
  os: os.type(),
};

test('bootstrap to SES lockdown', async t => {
  const bootScript = await dist('bootstrap.umd.js');
  const messages = [];
  async function handleCommand(message) {
    messages.push(decoder.decode(message));
    return new Uint8Array();
  }
  const name = 'SES lockdown worker';
  const vat = xsnap({ ...xsnapOptions, handleCommand, name });
  await vat.evaluate(bootScript);
  t.deepEqual([], messages);

  const SESinfo = '[typeof harden, typeof Compartment]';
  const toBytes = expr =>
    `new TextEncoder().encode(JSON.stringify(${expr})).buffer`;
  await vat.evaluate(`issueCommand(${toBytes(SESinfo)});`);
  await vat.close();
  t.deepEqual(['["function","function"]'], messages);
});
