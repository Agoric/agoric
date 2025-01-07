/* eslint-env node */
/* We make exceptions for test code. This is a test utility. */
/* eslint no-await-in-loop: ["off"] */

import '@endo/init';

import * as childProcess from 'child_process';
import fs from 'fs';
import { tmpName } from 'tmp';
import * as os from 'os';
import * as readline from 'readline';
import { makePromiseKit } from '@endo/promise-kit';
import { xsnap } from './xsnap.js';

/** @import {PromiseKit} from '@endo/promise-kit' */

const decoder = new TextDecoder();

async function main() {
  const xsnapOptions = {
    spawn: childProcess.spawn,
    fs: { ...fs, ...fs.promises, tmpName },
    os: os.type(),
    meteringLimit: 0,
  };

  /**
   * For the purposes of the REPL, the only command is effectively `print`.
   *
   * @param {Uint8Array} message
   * @returns {Promise<Uint8Array>}
   */
  async function handleCommand(message) {
    console.log(decoder.decode(message));
    return new Uint8Array();
  }

  const rl = readline.createInterface({
    input: /** @type {NodeJS.ReadableStream} */ (process.stdin),
    output: process.stdout,
  });

  let vat = await xsnap({ ...xsnapOptions, handleCommand });

  await vat.evaluate(`
    const compartment = new Compartment({
      TextEncoder,
      TextDecoder,
      Base64
    });
    function handleCommand(request) {
      const command = new TextDecoder().decode(request);
      let result = compartment.evaluate(command);
      if (result === undefined) {
        result = null;
      }
      issueCommand(new TextEncoder().encode(JSON.stringify(result, null, 4)).buffer);
    }
  `);

  /**
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async function ask(prompt) {
    const { promise, resolve } = /** @type {PromiseKit<string>} */ (
      makePromiseKit()
    );
    rl.question(prompt, resolve);
    return promise;
  }

  for (;;) {
    const answer = await ask('xs> ');
    if (answer === 'exit' || answer === 'quit') {
      break;
    } else if (answer === 'load') {
      const file = await ask('file> ');
      await vat.close();
      const snapshotStream = fs.createReadStream(file);
      vat = await xsnap({
        ...xsnapOptions,
        handleCommand,
        snapshotStream,
        snapshotDescription: file,
      });
    } else if (answer === 'save') {
      const file = await ask('file> ');
      await fs.promises.writeFile(file, vat.makeSnapshotStream(file));
    } else {
      await vat.issueStringCommand(answer);
    }
  }

  rl.close();
  return vat.close();
}

await main().catch(err => console.log(err));
