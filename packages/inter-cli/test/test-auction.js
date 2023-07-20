// @ts-check
/* global globalThis, Buffer */

import '@endo/init';

import anyTest from 'ava';

import { createCommand } from 'commander';
import { makeHttpClient } from '@agoric/casting/src/makeHttpClient.js';
import {
  captureIO,
  replayIO,
} from '@agoric/casting/test/net-access-fixture.js';

import { QueryDataResponse } from '@agoric/cosmic-proto/vstorage/query.js';
import { toBase64 } from '@cosmjs/encoding';
import { addBidCommand } from '../src/commands/auction.js';
import { listBidsRPC } from './rpc-fixture.js';
import { extractCapData } from '../src/lib/boardClient.js';
import { makeBatchQuery } from '../src/lib/vstorage.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<typeof makeTestContext>>>} */
const test = /** @type {any} */ (anyTest);

const RECORDING = false;

const makeTestContext = async () => {
  return { fetch: globalThis.fetch, recording: RECORDING };
};

test.before(async t => {
  t.context = await makeTestContext();
});

/** @typedef {import('commander').Command} Command */

/** @type {(c: Command) => Command[]} */
const subCommands = c => [c, ...c.commands.flatMap(subCommands)];

const usageTest = (words, blurb = 'Command usage:') => {
  test(`FR5: Usage: ${words}`, async t => {
    const argv = `node ${words} --help`.split(' ');

    const out = [];
    const tui = {
      show: (info, _pretty) => {
        out.push(info);
      },
      warn: () => {},
    };
    const program = createCommand('inter-tool');
    const { context: io } = t;
    const rpcClient = makeHttpClient('', io.fetch);
    const cmd = addBidCommand(program, {
      tui,
      getBatchQuery: async () => makeBatchQuery(io.fetch, []),
      makeRpcClient: async () => rpcClient,
    });
    for (const c of subCommands(program)) {
      c.exitOverride();
    }
    cmd.configureOutput({
      writeOut: s => out.push(s),
      writeErr: s => out.push(s),
    });

    await t.throwsAsync(program.parseAsync(argv), { message: /outputHelp/ });
    t.snapshot(out.join('').trim(), blurb);
  });
};
usageTest('inter-tool --help');
usageTest('inter-tool bid --help');
usageTest('inter-tool bid list --help');

test.todo('FR5: --asset');

/**
 * Decode JSON RPC response value from base64 etc.
 *
 * @param {string} req
 * @param {*} x
 */
const responseDetail = (req, x) => {
  const {
    result: {
      response: { value },
    },
  } = x;
  const decoded = Buffer.from(value, 'base64').toString();
  if (req.includes('Query/Children')) {
    // don't mess with protobuf-encoded list of children
    return { value };
  }
  // quick-n-dirty protobuf decoding for a single string message
  const json = decoded.replace(/^[^{]*/, '');
  const resp = QueryDataResponse.fromJSON(JSON.parse(json));
  const { blockHeight } = JSON.parse(resp.value);
  const valueCapData = extractCapData(resp);
  return { valueCapData, valueBlockHeight: blockHeight };
};

/**
 * Reverse the effect of responseDetail for all items in a map.
 *
 * @param {Map<string, *>} webMap
 */
const encodeDetail = webMap => {
  const encode1 = (x, req) => {
    const {
      result: { response },
    } = x;
    if ('value' in response) {
      return x;
    }
    if ('valueCapData' in response) {
      const blockHeight = response.valueBlockHeight;
      const cellValue = JSON.stringify(response.valueCapData);
      const value = JSON.stringify({ blockHeight, values: [cellValue] });
      response.value = toBase64(Buffer.from(JSON.stringify({ value })));
      delete response.valueCapData;
      delete response.valueBlockHeight;
      return x;
    }
    console.warn(`Unknown response`, req);
    return x;
  };
  const out = new Map();
  for (const [req, x] of webMap) {
    out.set(req, Array.isArray(x) ? x.map(encode1) : encode1(x, req));
  }
  return out;
};

test('see all bids for a collateral type', async t => {
  const args = 'node inter-tool bid list';
  t.log(args.replace(/^node /, ''));
  const expected = [
    {
      timestamp: '2023-07-11T17:49:18Z',
      sequence: 1001,
      price: '9.5000 IST/ATOM',
      balance: '500 IST',
      wanted: '1000000 ATOM',
    },
    {
      timestamp: '2023-07-11T23:50:04Z',
      sequence: 1002,
      price: '8.5000 IST/ATOM',
      balance: '300 IST',
      wanted: '1000000 ATOM',
    },
    {
      timestamp: '2023-07-12T03:59:28Z',
      sequence: 1003,
      bidScaling: '90.0000%',
      balance: '200 IST',
      wanted: '1000000 ATOM',
    },
  ];

  const out = [];
  const tui = {
    show: (info, _pretty) => {
      t.log(JSON.stringify(info));
      out.push(info);
    },
    warn: () => {},
  };

  const io = t.context;
  const config = {
    rpcAddrs: ['http://0.0.0.0:26657'],
    chainName: 'agoriclocal',
  };
  const { fetch: fetchMock, web } = io.recording
    ? captureIO(io.fetch)
    : { fetch: replayIO(encodeDetail(listBidsRPC)), web: new Map() };
  const rpcClient = makeHttpClient(config.rpcAddrs[0], fetchMock);

  const prog = createCommand('inter');
  addBidCommand(prog, {
    tui,
    getBatchQuery: async () => makeBatchQuery(fetchMock, config.rpcAddrs),
    makeRpcClient: async () => rpcClient,
  });
  await prog.parseAsync(args.split(' '));

  if (io.recording) {
    // use responseDetail() to make a more clear snapshot / fixture
    const decoded = new Map();
    for (const [req, resp] of web) {
      const xs = Array.isArray(resp) ? resp : [resp];
      for (const x of xs) {
        const detail = responseDetail(req, x);
        delete x.result.response.value;
        Object.assign(x.result.response, detail);
      }
      decoded.set(req, resp);
    }
    t.snapshot(decoded);
  }
  t.deepEqual(out, expected);
});

test.todo('should timestamps really not show timezone?');
test.todo('FR3: show partially filled bids');
test.todo('FR5: --from-bidder, --from-everyone');
test.todo('want should be maxBuy');
test.todo('balance should be give');
test.todo('give should be formatted as keyword record with Bid keyword');
test.todo('price should be a number with implicit brands (?)');
