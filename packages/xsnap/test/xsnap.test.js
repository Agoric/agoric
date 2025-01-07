/* global setTimeout, FinalizationRegistry, setImmediate, process */

import test from 'ava';

import { createHash } from 'crypto';
import * as proc from 'child_process';
import * as os from 'os';
import fs from 'fs';
import path from 'path';
import { tmpName } from 'tmp';

import { xsnap } from '../src/xsnap.js';
import { recordXSnap } from '../src/replay.js';
import { ExitCode, ErrorCode } from '../api.js';

import { options, decode, encode, loader } from './message-tools.js';

const io = { spawn: proc.spawn, os: os.type(), fs, tmpName }; // WARNING: ambient
const ld = loader(import.meta.url);

test('evaluate and issueCommand', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.evaluate(
    `issueCommand(new TextEncoder().encode("Hello, World!").buffer);`,
  );
  await vat.close();
  t.deepEqual(opts.messages, ['Hello, World!']);
});

test('evaluate until idle', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.evaluate(`
    (async () => {
      issueCommand(new TextEncoder().encode("Hello, World!").buffer);
    })();
  `);
  await vat.close();
  t.deepEqual(opts.messages, ['Hello, World!']);
});

test('evaluate infinite loop', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  t.teardown(vat.terminate);
  await t.throwsAsync(vat.evaluate(`for (;;) {}`), {
    code: ExitCode.E_TOO_MUCH_COMPUTATION,
    instanceOf: ErrorCode,
  });
  t.deepEqual(opts.messages, []);
});

// TODO: Re-enable when this doesn't take 3.6 seconds.
test('evaluate promise loop', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  t.teardown(vat.terminate);
  await t.throwsAsync(
    vat.evaluate(`
    function f() {
      Promise.resolve().then(f);
    }
    f();
  `),
    {
      code: ExitCode.E_TOO_MUCH_COMPUTATION,
      instanceOf: ErrorCode,
    },
  );
  t.deepEqual(opts.messages, []);
});

test('evaluate and report', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  const result = await vat.evaluate(`(() => {
    const report = {};
    Promise.resolve('hi').then(v => {
      report.result = new TextEncoder().encode(v).buffer;
    });
    return report;
  })()`);
  await vat.close();
  const { reply } = result;
  t.is(decode(reply), 'hi');
});

test('evaluate error', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat
    .evaluate(`***`)
    .then(_ => {
      t.fail('should throw');
    })
    .catch(_ => {
      t.pass();
    });
  await vat.terminate();
});

test('evaluate does not throw on unhandled rejections', async t => {
  const opts = options(io);
  // ISSUE: how to test that they are not entirely unobservable?
  // It's important that we can observe them using xsbug.
  // We can confirm this by running xsbug while running this test.
  for await (const debug of [false, true]) {
    const vat = await xsnap({ ...opts, debug });
    t.teardown(async () => vat.terminate());
    await t.notThrowsAsync(vat.evaluate(`Promise.reject(1)`));
  }
});

test('idle includes setImmediate too', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.evaluate(`
    const send = it => issueCommand(new TextEncoder().encode(it).buffer);
    setImmediate(() => send("end of crank"));
    Promise.resolve("turn 2").then(send);
    send("turn 1");
  `);
  await vat.close();
  t.deepEqual(opts.messages, ['turn 1', 'turn 2', 'end of crank']);
});

test('print - start compartment only', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.evaluate(`
    const send = it => issueCommand(new TextEncoder().encode(it).buffer);
    print('print:', 123);
    try {
      (new Compartment()).evaluate('print("456")');
    } catch (err) {
      send('err:' + err);
    }
  `);
  await vat.close();
  t.is(opts.messages.length, 1);
  t.regex(
    opts.messages[0],
    /^err:ReferenceError: [^:]+: get print: undefined variable$/,
  );
});

test('gc - start compartment only', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.evaluate(`
    gc();
    const send = it => issueCommand(new TextEncoder().encode(it).buffer);
    gc();
    try {
      (new Compartment()).evaluate('gc()');
    } catch (err) {
      send('err:' + err);
    }
  `);
  await vat.close();
  t.is(opts.messages.length, 1);
  t.regex(
    opts.messages[0],
    /^err:ReferenceError: [^:]+: get gc: undefined variable$/,
  );
});

test('run script until idle', async t => {
  const opts = options(io);
  const vat = await xsnap(opts);
  await vat.execute(ld.resolve('fixture-xsnap-script.js'));
  await vat.close();
  t.deepEqual(opts.messages, ['Hello, World!']);
});

test('issueCommand is synchronous inside, async outside', async t => {
  const messages = [];
  async function handleCommand(request) {
    const number = +decode(request);
    await Promise.resolve(null);
    messages.push(number);
    await Promise.resolve(null);
    return encode(`${number + 1}`);
  }
  const vat = await xsnap({ ...options(io), handleCommand });
  await vat.evaluate(`
    const response = issueCommand(new TextEncoder().encode('0').buffer);
    const number = +new TextDecoder().decode(response);
    issueCommand(new TextEncoder().encode(String(number + 1)).buffer);
  `);
  await vat.close();
  t.deepEqual(messages, [0, 2]);
});

test('deliver a message', async t => {
  const messages = [];
  async function handleCommand(message) {
    messages.push(+decode(message));
    return new Uint8Array();
  }
  const vat = await xsnap({ ...options(io), handleCommand });
  await vat.evaluate(`
    function handleCommand(message) {
      const number = +new TextDecoder().decode(message);
      issueCommand(new TextEncoder().encode(String(number + 1)).buffer);
    };
  `);
  await vat.issueStringCommand('0');
  await vat.issueStringCommand('1');
  await vat.issueStringCommand('2');
  await vat.close();
  t.deepEqual(messages, [1, 2, 3]);
});

test('receive a response', async t => {
  const messages = [];
  async function handleCommand(message) {
    messages.push(+decode(message));
    return new Uint8Array();
  }
  const vat = await xsnap({ ...options(io), handleCommand });
  await vat.evaluate(`
    function handleCommand(message) {
      const number = +new TextDecoder().decode(message);
      return new TextEncoder().encode(String(number + 1)).buffer;
    };
  `);
  t.is((await vat.issueStringCommand('0')).reply, '1');
  t.is((await vat.issueStringCommand('1')).reply, '2');
  t.is((await vat.issueStringCommand('2')).reply, '3');
  await vat.close();
});

function* count(end, start = 0, stride = 1) {
  for (; start < end; start += stride) {
    yield start;
  }
}

test('serialize concurrent messages', async t => {
  const messages = [];
  async function handleCommand(message) {
    messages.push(+decode(message));
    return new Uint8Array();
  }
  const vat = await xsnap({ ...options(io), handleCommand });
  await vat.evaluate(`
    globalThis.handleCommand = message => {
      const number = +new TextDecoder().decode(message);
      issueCommand(new TextEncoder().encode(String(number + 1)).buffer);
    };
  `);
  await Promise.all(
    [...count(100)].map(async n => vat.issueStringCommand(`${n}`)),
  );
  await vat.close();
  t.deepEqual([...count(101, 1)], messages);
});

const writeAndReadSnapshot = async (t, snapshotUseFs) => {
  const messages = [];
  async function handleCommand(message) {
    messages.push(decode(message));
    return new Uint8Array();
  }

  const vat0 = await xsnap({ ...options(io), handleCommand, snapshotUseFs });
  await vat0.evaluate(`
    globalThis.hello = "Hello, World!";
  `);

  const vat1 = await xsnap({
    ...options(io),
    handleCommand,
    snapshotStream: vat0.makeSnapshotStream(),
    snapshotUseFs: true,
  });
  await vat1.evaluate(`
    issueCommand(new TextEncoder().encode(hello).buffer);
  `);
  await vat1.close();

  await vat0.evaluate(`
    globalThis.hello += " Bienvenue!";
  `);

  const snapshotStream2 = vat0.makeSnapshotStream();
  const vat2 = await xsnap({
    ...options(io),
    handleCommand,
    snapshotStream: snapshotStream2,
  });
  await vat2.evaluate(`
    issueCommand(new TextEncoder().encode(hello).buffer);
  `);
  await vat2.close();

  await vat0.close();
  t.deepEqual(['Hello, World!', 'Hello, World! Bienvenue!'], messages);
};
test('write and read snapshot (use FS)', writeAndReadSnapshot, true);
test('write and read snapshot (use stream)', writeAndReadSnapshot, false);

test('produce golden snapshot hashes', async t => {
  t.log(`\
The snapshot hashes produced by this test were created from this package's
version of xsnap compiled for and run on Agoric's supported (within-consensus)
platforms.

The snapshot will change (and the test will fail) if xsnap or this platform
is not compatible with this predefined consensus.  This is likely to happen
in the future when xsnap is upgraded, in which case there will need to be
special accommodation for the new version, not just generating new golden
hashes.
`);
  const toEvals = [
    [`no evaluations`, ''],
    [
      `smallish safeInteger multiplication doesn't spill to XS_NUMBER_KIND`,
      `globalThis.bazinga = 100; globalThis.bazinga *= 1_000_000;`,
    ],
  ];
  for await (const [description, toEval] of toEvals) {
    t.log(description);
    const messages = [];
    async function handleCommand(message) {
      messages.push(decode(message));
      return new Uint8Array();
    }

    const vat0 = await xsnap({
      ...options(io),
      handleCommand,
      snapshotUseFs: false,
    });
    if (toEval) {
      await vat0.evaluate(toEval);
    }

    const hash = createHash('sha256');
    for await (const buf of vat0.makeSnapshotStream()) {
      hash.update(buf);
    }
    await vat0.close();

    const hexHash = hash.digest('hex');
    t.log(`${description} produces golden hash ${hexHash}`);
    // eslint-disable-next-line ava/assertion-arguments -- xxx, use macros
    t.snapshot(hexHash, description);
    t.deepEqual(messages, [], `${description} messages`);
  }
});

test('execute immediately after makeSnapshotStream', async t => {
  const messages = [];
  async function handleCommand(message) {
    messages.push(decode(message));
    return new Uint8Array();
  }

  const vat0 = await xsnap({ ...options(io), handleCommand });
  void vat0.evaluate(`
    globalThis.when = 'before';
  `);
  const snapshotStream = vat0.makeSnapshotStream();

  void vat0.evaluate(`
    globalThis.when = 'after';
  `);

  const vat1 = await xsnap({
    ...options(io),
    handleCommand,
    snapshotStream,
  });
  await vat0.close();
  void vat1.evaluate(`
    issueCommand(new TextEncoder().encode(when).buffer);
  `);
  await vat1.close();

  t.deepEqual(messages, ['before']);
});

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('fail to send command to already-closed xsnap worker', async t => {
  const vat = await xsnap({ ...options(io) });
  await vat.close();
  await vat.evaluate(``).catch(err => {
    t.is(err.message, 'xsnap test worker exited');
  });
});

test('fail to send command to already-terminated xsnap worker', async t => {
  const vat = await xsnap({ ...options(io) });
  await vat.terminate();
  await vat.evaluate(``).catch(err => {
    t.is(err.message, 'xsnap test worker exited due to signal SIGTERM');
  });
});

test('fail to send command to terminated xsnap worker', async t => {
  const vat = await xsnap({ ...options(io), meteringLimit: 0 });
  const hang = t.throwsAsync(vat.evaluate(`for (;;) {}`), {
    instanceOf: Error,
    message: /^(write EPIPE|xsnap test worker exited due to signal SIGTERM)$/,
  });

  await vat.terminate();
  await hang;
});

test('abnormal termination', async t => {
  const vat = await xsnap({ ...options(io), meteringLimit: 0 });
  const hang = t.throwsAsync(vat.evaluate(`for (;;) {}`), {
    instanceOf: Error,
    message: 'xsnap test worker exited due to signal SIGTERM',
  });

  // Allow the evaluate command to flush.
  await delay(10);
  await vat.terminate();
  await hang;
});

test('normal close of pathological script', async t => {
  const vat = await xsnap({ ...options(io), meteringLimit: 0 });
  const hang = vat.evaluate(`for (;;) {}`).then(
    () => t.fail('command should not complete'),
    err => {
      t.is(err.message, 'xsnap test worker exited due to signal SIGTERM');
    },
  );
  // Allow the evaluate command to flush.
  await delay(10);
  // Close must timeout and the evaluation command
  // must hang.
  await Promise.race([vat.close().then(() => t.fail()), hang, delay(10)]);
  await vat.terminate();
  await hang;
});

async function runToGC() {
  let collected = false;
  const fr = new FinalizationRegistry(() => {
    collected = true;
  });
  fr.register({}, undefined);
  const trashCan = [];

  let qty;
  for (qty = 0; !collected; qty += 1) {
    await new Promise(setImmediate);
    trashCan.push(Array(10_000).map(() => ({})));
  }
  return qty;
}

function pickXSnap(env = process.env) {
  let doXSnap = xsnap;
  const { XSNAP_TEST_RECORD } = env;
  if (XSNAP_TEST_RECORD) {
    console.log('SwingSet xs-worker tracing:', { XSNAP_TEST_RECORD });
    let serial = 0;
    doXSnap = async opts => {
      const workerTrace =
        path.resolve(XSNAP_TEST_RECORD, String(serial)) + path.sep;
      serial += 1;
      fs.mkdirSync(workerTrace, { recursive: true });
      return recordXSnap(opts, workerTrace, {
        writeFileSync: fs.writeFileSync,
      });
    };
  }
  return doXSnap;
}

test('GC after snapshot vs restore', async t => {
  const xsnapr = pickXSnap();

  const opts = { ...options(io), name: 'original', meteringLimit: 0 };
  const worker = await xsnapr(opts);
  t.teardown(worker.terminate);

  await worker.evaluate(`
  globalThis.send = it => issueCommand(new TextEncoder().encode(JSON.stringify(it)).buffer);
  globalThis.runToGC = (${runToGC});
  runToGC();
  // bloat the heap
  send(Array.from(Array(2_000_000).keys()).length)
  `);

  const nextGC = async (w, o) => {
    await w.evaluate(`runToGC().then(send)`);
    const workToGC = JSON.parse(o.messages.pop());
    t.log({ name: w.name, workToGC });
    return workToGC;
  };

  const beforeClone = await nextGC(worker, opts);

  const snapshotStream = worker.makeSnapshotStream();

  const optClone = { ...options(io), name: 'clone', snapshotStream };
  const clone = await xsnapr(optClone);
  await clone.isReady();
  t.log('cloned');
  t.teardown(clone.terminate);

  let workerGC = beforeClone;
  let cloneGC = workerGC;
  let iters = 0;

  while (workerGC === cloneGC && iters < 3) {
    workerGC = await nextGC(worker, opts);
    cloneGC = await nextGC(clone, optClone);
    iters += 1;
  }
  t.log({ beforeClone, workerGC, cloneGC, iters });
  t.is(workerGC, cloneGC);
});

test('bad option.name', async t => {
  const opts = Object.freeze({ ...options(io), name: '--sneaky' });
  await t.throwsAsync(async () => xsnap(opts), {
    message: /cannot start with hyphen/,
  });
});
