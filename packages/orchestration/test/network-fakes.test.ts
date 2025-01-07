import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { makeHeapZone } from '@agoric/zone';
import { getInterfaceOf } from '@endo/far';
import { prepareVowTools } from '@agoric/vow';
import { setupFakeNetwork } from './network-fakes.js';
import { makeICAChannelAddress } from '../src/utils/address.js';

const test = anyTest as TestFn<ReturnType<typeof setupFakeNetwork>>;

test.before(async t => {
  const zone = makeHeapZone();
  const vowTools = prepareVowTools(zone.subZone('vow'));
  t.context = setupFakeNetwork(zone, { vowTools });
  await t.context.setupIBCProtocol();
});

test('echo connection', async t => {
  const { portAllocator, networkVat } = t.context;

  // Allocate an echo port
  const echoPort = await E(portAllocator).allocateCustomIBCPort('echo');
  t.is(await E(echoPort).getLocalAddress(), '/ibc-port/custom-echo');

  // Create and add an echo listener
  const { listener } = await E(networkVat).makeEchoConnectionKit();
  await E(echoPort).addListener(listener);

  // Connect to the echo port
  const connection = await E(echoPort).connect('/ibc-port/custom-echo');

  // Send and receive a message
  const message = JSON.stringify({ value: 'Echoooo!' });
  const response = await E(connection).send(message);
  t.is(response, message, 'Echo returns the same message');
});

test('port allocator', async t => {
  const { portAllocator } = t.context;
  const customPort = await E(portAllocator).allocateCustomIBCPort('test-port');
  t.is(await E(customPort).getLocalAddress(), '/ibc-port/custom-test-port');
});

test('ibc connection', async t => {
  const { portAllocator } = t.context;

  // allocate ICA controller port and connect to remote chain
  const icaPort = await E(portAllocator).allocateICAControllerPort();
  const icaConnection = await E(icaPort).connect(
    makeICAChannelAddress('connection-0', 'connection-0'),
  );
  t.is(getInterfaceOf(icaConnection), 'Alleged: Connection connection');
  t.regex(
    await E(icaConnection).getRemoteAddress(),
    /icahost(.*)address":"cosmos1test/,
  );

  // send a message and get an error in return
  t.regex(
    await E(icaConnection).send('fake packet bytes string'),
    /error(.*)ABCI code: 5: error handling packet/,
  );

  // closed connections cannot send packets
  await E(icaConnection).close();
  await t.throwsAsync(
    async () => E(icaConnection).send('fake packet bytes string'),
    {
      message: 'Connection closed',
    },
  );
});
