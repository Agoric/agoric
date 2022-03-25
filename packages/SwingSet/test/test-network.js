// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';

import { makePromiseKit } from '@endo/promise-kit';
import { Far } from '@endo/marshal';

import {
  parse,
  unparse,
  makeEchoConnectionHandler,
  makeLoopbackProtocolHandler,
  makeNetworkProtocol,
  makeRouter,
} from '../src/vats/network/index.js';

// eslint-disable-next-line no-constant-condition
const log = false ? console.log : () => {};

/**
 * @param {any} t
 * @returns {import('../src/vats/network').ProtocolHandler} A testing handler
 */
const makeProtocolHandler = t => {
  /** @type {import('../src/vats/network').ListenHandler} */
  let l;
  let lp;
  let nonce = 0;
  return Far('ProtocolHandler', {
    async onCreate(_protocol, _impl) {
      log('created', _protocol, _impl);
    },
    async generatePortID() {
      nonce += 1;
      return `${nonce}`;
    },
    async onBind(port, localAddr) {
      t.assert(port, `port is supplied to onBind`);
      t.assert(localAddr, `local address is supplied to onBind`);
    },
    async onConnect(port, localAddr, remoteAddr) {
      t.assert(port, `port is tracked in onConnect`);
      t.assert(localAddr, `local address is supplied to onConnect`);
      t.assert(remoteAddr, `remote address is supplied to onConnect`);
      if (lp) {
        return l
          .onAccept(lp, localAddr, remoteAddr, l)
          .then(ch => [localAddr, ch]);
      }
      return { handler: makeEchoConnectionHandler() };
    },
    async onListen(port, localAddr, listenHandler) {
      t.assert(port, `port is tracked in onListen`);
      t.assert(localAddr, `local address is supplied to onListen`);
      t.assert(listenHandler, `listen handler is tracked in onListen`);
      lp = port;
      l = listenHandler;
      log('listening', port.getLocalAddress(), listenHandler);
    },
    async onListenRemove(port, localAddr, listenHandler) {
      t.assert(port, `port is tracked in onListen`);
      t.assert(localAddr, `local address is supplied to onListen`);
      t.is(listenHandler, l, `listenHandler is tracked in onListenRemove`);
      l = undefined;
      lp = undefined;
      log('port done listening', port.getLocalAddress());
    },
    async onRevoke(port, localAddr) {
      t.assert(port, `port is tracked in onRevoke`);
      t.assert(localAddr, `local address is supplied to onRevoke`);
      log('port done revoking', port.getLocalAddress());
    },
  });
};

test('handled protocol', async t => {
  const protocol = makeNetworkProtocol(makeProtocolHandler(t));

  const closed = makePromiseKit();
  const port = await protocol.bind('/ibc/*/ordered');
  await port.connect(
    '/ibc/*/ordered/echo',
    Far('ProtocolHandler', {
      async onOpen(connection, localAddr, remoteAddr) {
        t.is(localAddr, '/ibc/*/ordered');
        t.is(remoteAddr, '/ibc/*/ordered/echo');
        const ack = await connection.send('ping');
        // log(ack);
        t.is(`${ack}`, 'ping', 'received pong');
        connection.close();
      },
      async onClose(_connection, reason) {
        t.is(reason, undefined, 'no close reason');
        closed.resolve();
      },
      async onReceive(_connection, bytes) {
        t.is(`${bytes}`, 'ping');
        return 'pong';
      },
    }),
  );
  await closed.promise;
  await port.revoke();
});

test('protocol connection listen', async t => {
  const protocol = makeNetworkProtocol(makeProtocolHandler(t));

  const closed = makePromiseKit();

  const port = await protocol.bind('/net/ordered/ordered/some-portname');

  /** @type {import('../src/vats/network').ListenHandler} */
  const listener = Far('listener', {
    async onListen(p, listenHandler) {
      t.is(p, port, `port is tracked in onListen`);
      t.assert(listenHandler, `listenHandler is tracked in onListen`);
    },
    async onAccept(p, localAddr, remoteAddr, listenHandler) {
      t.assert(localAddr, `local address is passed to onAccept`);
      t.assert(remoteAddr, `remote address is passed to onAccept`);
      t.is(p, port, `port is tracked in onAccept`);
      t.is(listenHandler, listener, `listenHandler is tracked in onAccept`);
      let handler;
      return harden({
        async onOpen(connection, _localAddr, _remoteAddr, connectionHandler) {
          t.assert(connectionHandler, `connectionHandler is tracked in onOpen`);
          handler = connectionHandler;
          const ack = await connection.send('ping');
          t.is(`${ack}`, 'ping', 'received pong');
          connection.close();
        },
        async onClose(c, reason, connectionHandler) {
          t.is(
            connectionHandler,
            handler,
            `connectionHandler is tracked in onClose`,
          );
          handler = undefined;
          t.assert(c, 'connection is passed to onClose');
          t.is(reason, undefined, 'no close reason');
          closed.resolve();
        },
        async onReceive(c, packet, connectionHandler) {
          t.is(
            connectionHandler,
            handler,
            `connectionHandler is tracked in onReceive`,
          );
          t.assert(c, 'connection is passed to onReceive');
          t.is(`${packet}`, 'ping', 'expected ping');
          return 'pong';
        },
      });
    },
    async onError(p, rej, listenHandler) {
      t.is(p, port, `port is tracked in onError`);
      t.is(listenHandler, listener, `listenHandler is tracked in onError`);
      t.isNot(rej, rej, 'unexpected error');
    },
    async onRemove(p, listenHandler) {
      t.is(listenHandler, listener, `listenHandler is tracked in onRemove`);
      t.is(p, port, `port is passed to onReset`);
    },
  });

  await port.addListener(listener);

  const port2 = await protocol.bind('/net/ordered');
  const connectionHandler = makeEchoConnectionHandler();
  await port2.connect(
    '/net/ordered/ordered/some-portname',
    Far('connectionHandlerWithOpen', {
      ...connectionHandler,
      async onOpen(connection, localAddr, remoteAddr, c) {
        if (connectionHandler.onOpen) {
          await connectionHandler.onOpen(connection, localAddr, remoteAddr, c);
        }
        connection.send('ping');
      },
    }),
  );

  await closed.promise;

  await port.removeListener(listener);
  await port.revoke();
});

test('loopback protocol', async t => {
  const protocol = makeNetworkProtocol(makeLoopbackProtocolHandler());

  const closed = makePromiseKit();

  const port = await protocol.bind('/loopback/foo');

  /** @type {import('../src/vats/network').ListenHandler} */
  const listener = Far('listener', {
    async onAccept(_p, _localAddr, _remoteAddr, _listenHandler) {
      return harden({
        async onReceive(c, packet, _connectionHandler) {
          t.is(`${packet}`, 'ping', 'expected ping');
          return 'pingack';
        },
      });
    },
  });
  await port.addListener(listener);

  const port2 = await protocol.bind('/loopback/bar');
  await port2.connect(
    port.getLocalAddress(),
    Far('opener', {
      async onOpen(c, localAddr, remoteAddr, _connectionHandler) {
        t.is(localAddr, '/loopback/bar/nonce/1');
        t.is(remoteAddr, '/loopback/foo/nonce/2');
        const pingack = await c.send('ping');
        t.is(pingack, 'pingack', 'expected pingack');
        closed.resolve();
      },
    }),
  );

  await closed.promise;

  await port.removeListener(listener);
});

test('routing', async t => {
  const router = makeRouter();
  t.deepEqual(router.getRoutes('/if/local'), [], 'get routes matches none');
  router.register('/if/', 'a');
  t.deepEqual(
    router.getRoutes('/if/foo'),
    [['/if/', 'a']],
    'get routes matches prefix',
  );
  router.register('/if/foo', 'b');
  t.deepEqual(
    router.getRoutes('/if/foo'),
    [
      ['/if/foo', 'b'],
      ['/if/', 'a'],
    ],
    'get routes matches all',
  );
  t.deepEqual(
    router.getRoutes('/if/foob'),
    [['/if/', 'a']],
    'get routes needs separator',
  );
  router.register('/ibc/*/ordered', 'c');
  t.deepEqual(
    router.getRoutes('/if/foo'),
    [
      ['/if/foo', 'b'],
      ['/if/', 'a'],
    ],
    'get routes avoids nonmatching paths',
  );
  t.deepEqual(
    router.getRoutes('/ibc/*/ordered'),
    [['/ibc/*/ordered', 'c']],
    'direct match',
  );
  t.deepEqual(
    router.getRoutes('/ibc/*/ordered/zot'),
    [['/ibc/*/ordered', 'c']],
    'prefix matches',
  );
  t.deepEqual(router.getRoutes('/ibc/*/barfo'), [], 'no match');

  t.throws(
    () => router.unregister('/ibc/*/ordered', 'a'),
    { message: /Router is not registered/ },
    'unregister fails for no match',
  );
  router.unregister('/ibc/*/ordered', 'c');
  t.deepEqual(
    router.getRoutes('/ibc/*/ordered'),
    [],
    'no match after unregistration',
  );
});

test('multiaddr', async t => {
  t.deepEqual(parse('/if/local'), [['if', 'local']]);
  t.deepEqual(parse('/zot'), [['zot']]);
  t.deepEqual(parse('/zot/foo/bar/baz/bot'), [
    ['zot', 'foo'],
    ['bar', 'baz'],
    ['bot'],
  ]);
  for (const str of ['', 'foobar']) {
    t.throws(
      () => parse(str),
      { message: /Error parsing Multiaddr/ },
      `expected failure of ${str}`,
    );
  }
  for (const str of ['/', '//', '/foo', '/foobib/bar', '/k1/v1/k2/v2/k3/v3']) {
    t.is(
      unparse(parse(str)),
      str,
      `round-trip of ${JSON.stringify(str)} matches`,
    );
  }
});
