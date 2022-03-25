// @ts-check

import { makeScalarMap, makeLegacyMap } from '@agoric/store';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { assert, details as X } from '@agoric/assert';
import { toBytes } from './bytes.js';

import '@agoric/store/exported.js';
import './types.js';

/** Compatibility note: this must match what our peers use, so don't change it casually. */
export const ENDPOINT_SEPARATOR = '/';

export const rethrowUnlessMissing = err => {
  // Ugly hack rather than being able to determine if the function
  // exists.
  if (
    !(err instanceof TypeError) ||
    !err.message.match(/target has no method|is not a function$/)
  ) {
    throw err;
  }
  return undefined;
};

/**
 * Create a handled Connection.
 *
 * @param {ConnectionHandler} handler
 * @param {Endpoint} localAddr
 * @param {Endpoint} remoteAddr
 * @param {Set<Closable>} [current=new Set()]
 * @returns {Connection}
 */
export const makeConnection = (
  handler,
  localAddr,
  remoteAddr,
  current = new Set(),
) => {
  let closed;
  /** @type {Set<PromiseRecord<Bytes>>} */
  const pendingAcks = new Set();
  /** @type {Connection} */
  const connection = Far('Connection', {
    getLocalAddress() {
      return localAddr;
    },
    getRemoteAddress() {
      return remoteAddr;
    },
    async close() {
      if (closed) {
        throw closed;
      }
      current.delete(connection);
      closed = Error('Connection closed');
      for (const ackDeferred of [...pendingAcks.values()]) {
        pendingAcks.delete(ackDeferred);
        ackDeferred.reject(closed);
      }
      await E(handler)
        .onClose(connection, undefined, handler)
        .catch(rethrowUnlessMissing);
    },
    async send(data, opts) {
      // console.log('send', data, local === srcHandler);
      if (closed) {
        throw closed;
      }
      const bytes = toBytes(data);
      const ackDeferred = makePromiseKit();
      pendingAcks.add(ackDeferred);
      E(handler)
        .onReceive(connection, bytes, handler, opts)
        .catch(err => {
          rethrowUnlessMissing(err);
          return '';
        })
        .then(
          ack => {
            pendingAcks.delete(ackDeferred);
            ackDeferred.resolve(toBytes(ack));
          },
          err => {
            pendingAcks.delete(ackDeferred);
            ackDeferred.reject(err);
          },
        );
      return ackDeferred.promise;
    },
  });

  current.add(connection);
  E(handler)
    .onOpen(connection, localAddr, remoteAddr, handler)
    .catch(rethrowUnlessMissing);
  return connection;
};

/**
 * @param {ConnectionHandler} handler0
 * @param {Endpoint} addr0
 * @param {ConnectionHandler} handler1
 * @param {Endpoint} addr1
 * @param {WeakSet<Connection>} [current=new WeakSet()]
 * @returns {[Connection, Connection]}
 */
export function crossoverConnection(
  handler0,
  addr0,
  handler1,
  addr1,
  current = new WeakSet(),
) {
  /** @type {Connection[]} */
  const conns = [];
  /** @type {ConnectionHandler[]} */
  const handlers = [handler0, handler1];
  /** @type {Endpoint[]} */
  const addrs = [addr0, addr1];

  function makeHalfConnection(l, r) {
    let closed;
    conns[l] = Far('Connection', {
      getLocalAddress() {
        return addrs[l];
      },
      getRemoteAddress() {
        return addrs[r];
      },
      async send(packetBytes) {
        if (closed) {
          throw closed;
        }
        const ack = await E(handlers[r])
          .onReceive(conns[r], toBytes(packetBytes), handlers[r])
          .catch(rethrowUnlessMissing);
        return toBytes(ack || '');
      },
      async close() {
        if (closed) {
          throw closed;
        }
        closed = Error('Connection closed');
        current.delete(conns[l]);
        await E(handlers[l])
          .onClose(conns[l], undefined, handlers[l])
          .catch(rethrowUnlessMissing);
      },
    });
  }

  makeHalfConnection(0, 1);
  makeHalfConnection(1, 0);

  /**
   * @param {number} l Local side of the connection
   * @param {number} r Remote side of the connection
   */
  function openHalfConnection(l, r) {
    current.add(conns[l]);
    E(handlers[l])
      .onOpen(conns[l], addrs[l], addrs[r], handlers[l])
      .catch(rethrowUnlessMissing);
  }

  openHalfConnection(0, 1);
  openHalfConnection(1, 0);

  const [conn0, conn1] = conns;
  return [conn0, conn1];
}

/**
 * Get the list of prefixes from longest to shortest.
 *
 * @param {string} addr
 */
export function getPrefixes(addr) {
  const parts = addr.split(ENDPOINT_SEPARATOR);

  /** @type {string[]} */
  const ret = [];
  for (let i = parts.length; i > 0; i -= 1) {
    // Try most specific match.
    const prefix = parts.slice(0, i).join(ENDPOINT_SEPARATOR);
    ret.push(prefix);
  }
  return ret;
}

/**
 * Create a protocol that has a handler.
 *
 * @param {ProtocolHandler} protocolHandler
 * @returns {Protocol} The local capability for connecting and listening
 */
export function makeNetworkProtocol(protocolHandler) {
  /** @type {LegacyMap<Port, Set<Closable>>} */
  // Legacy because we're storing a JS Set
  const currentConnections = makeLegacyMap('port');

  /**
   * Currently must be a single listenHandler. TODO: Do something sensible with
   * multiple handlers?
   *
   * @type {Store<Endpoint, [Port, ListenHandler]>}
   */
  const listening = makeScalarMap('localAddr');

  /** @type {Store<string, Port>} */
  const boundPorts = makeScalarMap('localAddr');

  /** @param {Endpoint} localAddr */
  const bind = async localAddr => {
    // Check if we are underspecified (ends in slash)
    if (localAddr.endsWith(ENDPOINT_SEPARATOR)) {
      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const portID = await E(protocolHandler).generatePortID(
          localAddr,
          protocolHandler,
        );
        const newAddr = `${localAddr}${portID}`;
        if (!boundPorts.has(newAddr)) {
          localAddr = newAddr;
          break;
        }
      }
    }

    /** @enum {number} */
    const RevokeState = {
      NOT_REVOKED: 0,
      REVOKING: 1,
      REVOKED: 2,
    };

    /** @type {RevokeState} */
    let revoked = RevokeState.NOT_REVOKED;
    const openConnections = new Set();

    /** @type {Port} */
    const port = Far('Port', {
      getLocalAddress() {
        // Works even after revoke().
        return localAddr;
      },
      async addListener(listenHandler) {
        assert(!revoked, X`Port ${localAddr} is revoked`);
        assert(listenHandler, X`listenHandler is not defined`, TypeError);
        if (listening.has(localAddr)) {
          // Last one wins.
          const [lport, lhandler] = listening.get(localAddr);
          if (lhandler === listenHandler) {
            return;
          }
          listening.set(localAddr, [port, listenHandler]);
          E(lhandler).onRemove(lport, lhandler).catch(rethrowUnlessMissing);
        } else {
          listening.init(localAddr, [port, listenHandler]);
        }

        // TODO: Check that the listener defines onAccept.

        await E(protocolHandler).onListen(
          port,
          localAddr,
          listenHandler,
          protocolHandler,
        );
        await E(listenHandler)
          .onListen(port, listenHandler)
          .catch(rethrowUnlessMissing);
      },
      async removeListener(listenHandler) {
        assert(listening.has(localAddr), X`Port ${localAddr} is not listening`);
        assert(
          listening.get(localAddr)[1] === listenHandler,
          X`Port ${localAddr} handler to remove is not listening`,
        );
        listening.delete(localAddr);
        await E(protocolHandler).onListenRemove(
          port,
          localAddr,
          listenHandler,
          protocolHandler,
        );
        await E(listenHandler)
          .onRemove(port, listenHandler)
          .catch(rethrowUnlessMissing);
      },
      async connect(remotePort, connectionHandler = {}) {
        assert(!revoked, X`Port ${localAddr} is revoked`);
        /** @type {Endpoint} */
        const dst = harden(remotePort);
        // eslint-disable-next-line no-use-before-define
        const conn = await protocolImpl.outbound(port, dst, connectionHandler);
        if (revoked) {
          E(conn).close();
        } else {
          openConnections.add(conn);
        }
        return conn;
      },
      async revoke() {
        assert(
          revoked !== RevokeState.REVOKED,
          X`Port ${localAddr} is already revoked`,
        );
        revoked = RevokeState.REVOKING;
        await E(protocolHandler).onRevoke(port, localAddr, protocolHandler);
        revoked = RevokeState.REVOKED;

        // Clean up everything we did.
        const ps = [...currentConnections.get(port)].map(conn =>
          E(conn)
            .close()
            .catch(_ => {}),
        );
        if (listening.has(localAddr)) {
          const listener = listening.get(localAddr)[1];
          ps.push(port.removeListener(listener));
        }
        await Promise.all(ps);
        currentConnections.delete(port);
        boundPorts.delete(localAddr);
        return `Port ${localAddr} revoked`;
      },
    });

    await E(protocolHandler).onBind(port, localAddr, protocolHandler);
    boundPorts.init(localAddr, port);
    currentConnections.init(port, new Set());
    return port;
  };

  /** @type {ProtocolImpl} */
  const protocolImpl = Far('ProtocolImpl', {
    bind,
    async inbound(listenAddr, remoteAddr) {
      let lastFailure = Error(`No listeners for ${listenAddr}`);
      for (const listenPrefix of getPrefixes(listenAddr)) {
        if (!listening.has(listenPrefix)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const [port, listener] = listening.get(listenPrefix);
        let localAddr;
        try {
          // See if our protocol is willing to receive this connection.
          // eslint-disable-next-line no-await-in-loop
          const localInstance = await E(protocolHandler)
            .onInstantiate(port, listenPrefix, remoteAddr, protocolHandler)
            .catch(rethrowUnlessMissing);
          localAddr = localInstance
            ? `${listenAddr}/${localInstance}`
            : listenAddr;
        } catch (e) {
          lastFailure = e;
          // eslint-disable-next-line no-continue
          continue;
        }
        // We have a legitimate inbound attempt.
        let consummated;
        const current = currentConnections.get(port);
        const inboundAttempt = Far('InboundAttempt', {
          getLocalAddress() {
            // Return address metadata.
            return localAddr;
          },
          getRemoteAddress() {
            return remoteAddr;
          },
          async close() {
            if (consummated) {
              throw consummated;
            }
            consummated = Error(`Already closed`);
            current.delete(inboundAttempt);
            await E(listener)
              .onReject(port, localAddr, remoteAddr, listener)
              .catch(rethrowUnlessMissing);
          },
          async accept({
            localAddress = localAddr,
            remoteAddress = remoteAddr,
            handler: rchandler,
          }) {
            if (consummated) {
              throw consummated;
            }
            consummated = Error(`Already accepted`);
            current.delete(inboundAttempt);

            const lchandler = await E(listener).onAccept(
              port,
              localAddr,
              remoteAddr,
              listener,
            );

            return crossoverConnection(
              lchandler,
              localAddress,
              rchandler,
              remoteAddress,
              current,
            )[1];
          },
        });
        current.add(inboundAttempt);
        return inboundAttempt;
      }
      throw lastFailure;
    },
    async outbound(port, remoteAddr, lchandler) {
      const localAddr =
        /** @type {string} */
        (await E(port).getLocalAddress());

      // Allocate a local address.
      const initialLocalInstance = await E(protocolHandler)
        .onInstantiate(port, localAddr, remoteAddr, protocolHandler)
        .catch(rethrowUnlessMissing);
      const initialLocalAddr = initialLocalInstance
        ? `${localAddr}/${initialLocalInstance}`
        : localAddr;

      let lastFailure;
      try {
        // Attempt the loopback connection.
        const attempt = await protocolImpl.inbound(
          remoteAddr,
          initialLocalAddr,
        );
        return attempt.accept({ handler: lchandler });
      } catch (e) {
        lastFailure = e;
      }

      const {
        remoteAddress = remoteAddr,
        handler: rchandler,
        localAddress = localAddr,
      } =
        /** @type {Partial<AttemptDescription>} */
        (
          await E(protocolHandler).onConnect(
            port,
            initialLocalAddr,
            remoteAddr,
            lchandler,
            protocolHandler,
          )
        );

      if (!rchandler) {
        throw lastFailure;
      }

      const current = currentConnections.get(port);
      return crossoverConnection(
        lchandler,
        localAddress,
        rchandler,
        remoteAddress,
        current,
      )[0];
    },
  });

  // Wire up the local protocol to the handler.
  E(protocolHandler).onCreate(protocolImpl, protocolHandler);

  // Return the user-facing protocol.
  return Far('binder', { bind });
}

/**
 * Create a ConnectionHandler that just echoes its packets.
 *
 * @returns {ConnectionHandler}
 */
export function makeEchoConnectionHandler() {
  let closed;
  /** @type {Connection} */
  return Far('ConnectionHandler', {
    async onReceive(_connection, bytes, _connectionHandler) {
      if (closed) {
        throw closed;
      }
      return bytes;
    },
    async onClose(_connection, _reason, _connectionHandler) {
      if (closed) {
        throw closed;
      }
      closed = Error('Connection closed');
    },
  });
}

export function makeNonceMaker(prefix = '', suffix = '') {
  let nonce = 0;
  return async () => {
    nonce += 1;
    return `${prefix}${nonce}${suffix}`;
  };
}

/**
 * Create a protocol handler that just connects to itself.
 *
 * @param {ProtocolHandler['onInstantiate']} [onInstantiate]
 * @returns {ProtocolHandler} The localhost handler
 */
export function makeLoopbackProtocolHandler(
  onInstantiate = makeNonceMaker('nonce/'),
) {
  /** @type {Store<string, [Port, ListenHandler]>} */
  const listeners = makeScalarMap('localAddr');

  const makePortID = makeNonceMaker('port');

  return Far('ProtocolHandler', {
    // eslint-disable-next-line no-empty-function
    async onCreate(_impl, _protocolHandler) {
      // TODO
    },
    async generatePortID(_protocolHandler) {
      return makePortID();
    },
    async onBind(_port, _localAddr, _protocolHandler) {
      // TODO: Maybe handle a bind?
    },
    async onConnect(_port, localAddr, remoteAddr, _chandler, protocolHandler) {
      const [lport, lhandler] = listeners.get(remoteAddr);
      const rchandler =
        /** @type {ConnectionHandler} */
        (await E(lhandler).onAccept(lport, remoteAddr, localAddr, lhandler));
      // console.log(`rchandler is`, rchandler);
      const remoteInstance = await E(protocolHandler)
        .onInstantiate(lport, remoteAddr, localAddr, protocolHandler)
        .catch(rethrowUnlessMissing);
      return {
        remoteInstance,
        handler: rchandler,
      };
    },
    onInstantiate,
    async onListen(port, localAddr, listenHandler, _protocolHandler) {
      // TODO: Implement other listener replacement policies.
      if (listeners.has(localAddr)) {
        const lhandler = listeners.get(localAddr)[1];
        if (lhandler !== listenHandler) {
          // Last-one-wins.
          listeners.set(localAddr, [port, listenHandler]);
        }
      } else {
        listeners.init(localAddr, [port, listenHandler]);
      }
    },
    async onListenRemove(port, localAddr, listenHandler, _protocolHandler) {
      const [lport, lhandler] = listeners.get(localAddr);
      assert(lport === port, X`Port does not match listener on ${localAddr}`);
      assert(
        lhandler === listenHandler,
        X`Listen handler does not match listener on ${localAddr}`,
      );
      listeners.delete(localAddr);
    },
    async onRevoke(_port, _localAddr, _protocolHandler) {
      // TODO: maybe clean up?
    },
  });
}
