import { Buffer } from 'buffer';
import './lockdown.js';

import { makeMarshal } from '@endo/marshal';

import express from 'express';
// import morgan from 'morgan';

import { toAscii, toBase64 } from '@cosmjs/encoding';

const chainName = 'fakeChain';

let lastPort = 8989;

/**
 * @param {number} min
 * @param {number} max
 * @param {number} n
 */
const clamp = (min, max, n) => Math.max(min, Math.min(max, n));

const fakeStatusResult = {
  node_info: {
    protocol_version: {
      p2p: '7',
      block: '10',
      app: '0',
    },
    id: '5576458aef205977e18fd50b274e9b5d9014525a',
    listen_addr: 'tcp://0.0.0.0:26656',
    network: 'cosmoshub-2',
    version: '0.32.1',
    channels: '4020212223303800',
    moniker: 'moniker-node',
    other: {
      tx_index: 'on',
      rpc_address: 'tcp://0.0.0.0:26657',
    },
  },
  sync_info: {
    latest_block_hash:
      '790BA84C3545FCCC49A5C629CEE6EA58A6E875C3862175BDC11EE7AF54703501',
    latest_app_hash:
      'C9AEBB441B787D9F1D846DE51F3826F4FD386108B59B08239653ABF59455C3F8',
    latest_block_height: '1262196',
    latest_block_time: '2019-08-01T11:52:22.818762194Z',
    earliest_block_hash:
      '790BA84C3545FCCC49A5C629CEE6EA58A6E875C3862175BDC11EE7AF54703501',
    earliest_app_hash:
      'C9AEBB441B787D9F1D846DE51F3826F4FD386108B59B08239653ABF59455C3F8',
    earliest_block_height: '1262196',
    earliest_block_time: '2019-08-01T11:52:22.818762194Z',
    max_leader_block_height: '1262196',
    catching_up: false,
    total_synced_time: '1000000000',
    remaining_time: '0',
    total_snapshots: '10',
    chunk_process_avg_time: '1000000000',
    snapshot_height: '1262196',
    snapshot_chunks_count: '10',
    snapshot_chunks_total: '100',
    backfilled_blocks: '10',
    backfill_blocks_total: '100',
  },
  validator_info: {
    address: '5D6A51A8E9899C44079C6AF90618BA0369070E6E',
    pub_key: {
      type: 'tendermint/PubKeyEd25519',
      value: 'A6DoBUypNtUAyEHWtQ9bFjfNg8Bo9CrnkUGl6k6OHN4=',
    },
    voting_power: '0',
  },
};

/** @typedef {Partial<import('ava').ExecutionContext<{cleanups: Array<() => void>}>> & {context}} FakeServerTestContext */
/**
 * @param {FakeServerTestContext} t
 * @param {Array<{any}>} fakeValues
 * @param {object} [options]
 * @param {Marshaller} [options.marshaller]
 * @param {number} [options.batchSize] count of stream-cell results per response, or 0/absent to return lone naked values
 */
export const startFakeServer = async (t, fakeValues, options = {}) => {
  const { log = console.log } = t;
  lastPort += 1;
  const PORT = lastPort;
  const { marshaller = makeMarshal(), batchSize = 0 } = options;
  return new Promise(resolve => {
    log('starting http server on port', PORT);
    const app = express();
    // app.use(morgan());
    app.use((req, _res, next) => {
      log('request', req.method, req.url);
      next();
    });
    app.use(express.json());
    app.get('/bad-network-config', (req, res) => {
      res.json({
        chainName,
        rpcAddrs: 'not an array',
      });
    });
    app.get('/network-config', (req, res) => {
      res.json({
        chainName,
        rpcAddrs: [`http://localhost:${PORT}/tendermint-rpc`],
      });
    });

    const dataPrefix = new Uint8Array([0]);
    const encode = obj => {
      const str = JSON.stringify(obj);
      const ascii = toAscii(str);
      const buf = new Uint8Array(dataPrefix.length + ascii.length);
      buf.set(dataPrefix);
      buf.set(ascii, dataPrefix.length);
      return toBase64(buf);
    };
    const fakeBlocksStartHeight = 74863;
    let blockHeight = fakeBlocksStartHeight;
    app.post('/tendermint-rpc', (req, res) => {
      log('received', req.path, req.body, req.params);
      const reply = result => {
        log('response', result);
        res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          result,
        });
      };
      log('req.body', req.body);
      switch (req.body.method) {
        case 'status': {
          reply(fakeStatusResult);
          break;
        }
        case 'abci_info': {
          const result = {
            response: {
              data: 'agoric',
              version: '0.32.1',
              last_block_height: blockHeight,
              last_block_app_hash: '',
            },
          };
          reply(result);
          break;
        }
        case 'abci_query': {
          const desiredHeight = req.body.height ?? blockHeight;
          const values = [];
          for (
            let batchIndex = 0;
            batchIndex < Math.max(1, batchSize);
            batchIndex += 1
          ) {
            const fakeIndex = clamp(
              0,
              fakeValues.length - 1,
              desiredHeight - fakeBlocksStartHeight + batchIndex,
            );
            values.push(fakeValues[fakeIndex]);
          }
          let responseValue;
          if (batchSize > 0) {
            // Return a JSON stream cell.
            const serializedValues = values.map(val =>
              JSON.stringify(marshaller.toCapData(val)),
            );
            responseValue = {
              blockHeight: String(desiredHeight - 1),
              values: serializedValues,
            };
          } else {
            // Return a single naked value.
            responseValue = marshaller.toCapData(values[0]);
          }
          const responseValueBase64 = encode(responseValue);
          const result = {
            response: {
              code: 0,
              log: '',
              info: '',
              index: '0',
              key: Buffer.from(
                'swingset/data:mailbox.agoric1foobarbaz',
              ).toString('base64'),
              value: responseValueBase64,
              proofOps: null,
              height: String(blockHeight),
              codespace: '',
            },
          };
          reply(result);
          break;
        }
        default: {
          res.sendStatus(400);
        }
      }
    });
    const controller = {
      advance(offset) {
        blockHeight += offset;
      },
    };
    const listener = app.listen(PORT, () => {
      log('started http server on', PORT);
      const cleanup = () => {
        log('shutting down http server on', PORT);
        listener.close();
      };
      t.context.cleanups.push(cleanup);
      resolve({ controller, PORT });
    });
  });
};

export const jsonPairs = harden([
  // Justin is the same as the JSON encoding but without unnecessary quoting
  ['[1,2]', '[1,2]'],
  ['{"foo":1}', '{foo:1}'],
  ['{"a":1,"b":2}', '{a:1,b:2}'],
  ['{"a":1,"b":{"c":3}}', '{a:1,b:{c:3}}'],
  ['true', 'true'],
  ['1', '1'],
  ['"abc"', '"abc"'],
  ['null', 'null'],

  // Primitives not representable in JSON
  ['{"@qclass":"undefined"}', 'undefined'],
  ['{"@qclass":"NaN"}', 'NaN'],
  ['{"@qclass":"Infinity"}', 'Infinity'],
  ['{"@qclass":"-Infinity"}', '-Infinity'],
  ['{"@qclass":"bigint","digits":"4"}', '4n'],
  ['{"@qclass":"bigint","digits":"9007199254740993"}', '9007199254740993n'],
  ['{"@qclass":"symbol","name":"@@asyncIterator"}', 'Symbol.asyncIterator'],
  ['{"@qclass":"symbol","name":"@@match"}', 'Symbol.match'],
  ['{"@qclass":"symbol","name":"foo"}', 'Symbol.for("foo")'],
  ['{"@qclass":"symbol","name":"@@@@foo"}', 'Symbol.for("@@foo")'],

  // Arrays and objects
  ['[{"@qclass":"undefined"}]', '[undefined]'],
  ['{"foo":{"@qclass":"undefined"}}', '{foo:undefined}'],
  ['{"@qclass":"error","message":"","name":"Error"}', 'Error("")'],
  [
    '{"@qclass":"error","message":"msg","name":"ReferenceError"}',
    'ReferenceError("msg")',
  ],

  // The one case where JSON is not a semantic subset of JS
  ['{"__proto__":8}', '{["__proto__"]:8}'],

  // The Hilbert Hotel is always tricky
  ['{"@qclass":"hilbert","original":8}', '{"@qclass":8}'],
  ['{"@qclass":"hilbert","original":"@qclass"}', '{"@qclass":"@qclass"}'],
  [
    '{"@qclass":"hilbert","original":{"@qclass":"hilbert","original":8}}',
    '{"@qclass":{"@qclass":8}}',
  ],
  [
    '{"@qclass":"hilbert","original":{"@qclass":"hilbert","original":8,"rest":{"foo":"foo1"}},"rest":{"bar":{"@qclass":"hilbert","original":{"@qclass":"undefined"}}}}',
    '{"@qclass":{"@qclass":8,foo:"foo1"},bar:{"@qclass":undefined}}',
  ],

  // tagged
  ['{"@qclass":"tagged","tag":"x","payload":8}', 'makeTagged("x",8)'],
  [
    '{"@qclass":"tagged","tag":"x","payload":{"@qclass":"undefined"}}',
    'makeTagged("x",undefined)',
  ],

  // Slots
  [
    '[{"@qclass":"slot","iface":"Alleged: for testing Justin","index":0}]',
    '[slot(0,"Alleged: for testing Justin")]',
  ],
  // Tests https://github.com/endojs/endo/issues/1185 fix
  [
    '[{"@qclass":"slot","iface":"Alleged: for testing Justin","index":0},{"@qclass":"slot","index":0}]',
    '[slot(0,"Alleged: for testing Justin"),slot(0)]',
  ],
]);

export const develop = async () => {
  const { unserialize } = makeMarshal();
  const fakeValues = harden(
    jsonPairs.map(([jsonMarshalled]) =>
      unserialize({ body: jsonMarshalled, slots: [] }),
    ),
  );
  const mockT = /** @type {FakeServerTestContext} */ (
    /** @type {unknown} */ ({
      log: console.log,
      context: { cleanups: [] },
    })
  );
  const { PORT } = await startFakeServer(mockT, [...fakeValues]);
  console.log(
    `Try this in another terminal:
    agoric follow :fake.path --bootstrap=http://localhost:${PORT}/network-config --sleep=0.5 --proof=none`,
  );
  console.warn(`Control-C to interrupt...`);
  // Wait forever.
  await new Promise(() => {});
};
