#!/usr/bin/env node

import '@endo/init/pre-bundle-source.js';
import '@endo/init';
import process from 'process';
import repl from 'repl';
import util from 'util';
import { loadBasedir, buildVatController } from '../src/index.js';
import { buildLoopbox } from '../src/devices/loopbox/loopbox.js';

function deepLog(item) {
  console.log(util.inspect(item, false, null, true));
}

async function main() {
  const argv = process.argv.splice(2);
  let withSES = true;
  if (argv[0] === '--no-ses') {
    withSES = false;
    argv.shift();
  }
  const command = argv.shift();
  if (command !== 'run' && command !== 'shell') {
    throw Error(`use 'vat run' or 'vat shell', not 'vat ${command}'`);
  }
  const basedir =
    argv[0] === '--' || argv[0] === undefined ? '.' : argv.shift();
  const vatArgv = argv[0] === '--' ? argv.slice(1) : argv;

  assert(basedir);
  const config = await loadBasedir(basedir);
  const { loopboxSrcPath, loopboxEndowments } = buildLoopbox('immediate');
  config.devices = [['loopbox', loopboxSrcPath, loopboxEndowments]];

  // @ts-expect-error expects string[], not boolean, in second position
  const controller = await buildVatController(config, withSES, vatArgv);
  if (command === 'run') {
    await controller.run();
    console.log('= vat finished');
  } else if (command === 'shell') {
    const r = repl.start({ prompt: 'vat> ', replMode: repl.REPL_MODE_STRICT });
    r.context.dump = () => {
      const d = controller.dump();
      console.log('Kernel Table:');
      deepLog(d.kernelTable);
      console.log('Promises:');
      deepLog(d.promises);
      console.log('Run Queue:');
      deepLog(d.runQueue);
      console.log('Acceptance Queue:');
      deepLog(d.acceptanceQueue);
    };
    r.context.dump2 = () => controller.dump();
    r.context.run = () => {
      console.log('run!');
      return controller.run();
    };
    r.context.step = () => {
      console.log('step!');
      return controller.step();
    };
  }
}

void main();
