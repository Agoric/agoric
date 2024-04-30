// @ts-check

import { E } from '@endo/far';
import { M } from '@endo/patterns';
import { Fail } from '@agoric/assert';
import { toBytes } from './bytes.js';
import { Shape } from './shapes.js';

import '@agoric/store/exported.js';
/// <reference path="./types.js" />
/**
 * @import {VowTools} from '@agoric/vow';
 */

/**
 * Compatibility note: this must match what our peers use, so don't change it
 * casually.
 */
export const ENDPOINT_SEPARATOR = '/';

/** @param {unknown} err */
export const rethrowUnlessMissing = err => {
  // Ugly hack rather than being able to determine if the function
  // exists.
  if (
    !(err instanceof TypeError) ||
    !String(err.message).match(/target has no method|is not a function$/)
  ) {
    throw err;
  }
  return undefined;
};

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
 * @typedef {object} ConnectionOpts
 * @property {Endpoint[]} addrs
 * @property {import('@agoric/vow').Remote<Required<ConnectionHandler>>[]} handlers
 * @property {MapStore<number, Connection>} conns
 * @property {WeakSetStore<Closable>} current
 * @property {0|1} l
 * @property {0|1} r
 */

/**
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {VowTools} powers
 */
const prepareHalfConnection = (zone, { watch }) => {
  const makeHalfConnectionKit = zone.exoClassKit(
    'Connection',
    Shape.ConnectionI,
    /** @param {ConnectionOpts} opts */
    ({ addrs, handlers, conns, current, l, r }) => {
      return {
        addrs,
        handlers,
        conns,
        current,
        l,
        r,
        /** @type {string | undefined} */
        closed: undefined,
      };
    },
    {
      connection: {
        getLocalAddress() {
          const { addrs, l } = this.state;
          return addrs[l];
        },
        getRemoteAddress() {
          const { addrs, r } = this.state;
          return addrs[r];
        },
        /** @param {Bytes} packetBytes */
        async send(packetBytes) {
          const { closed, handlers, r, conns } = this.state;
          if (closed) {
            throw Error(closed);
          }

          const innerVow = watch(
            E(handlers[r]).onReceive(
              conns.get(r),
              toBytes(packetBytes),
              handlers[r],
            ),
            this.facets.openConnectionAckWatcher,
          );
          return watch(innerVow, this.facets.rethrowUnlessMissingWatcher);
        },
        async close() {
          const { closed, current, conns, l, handlers } = this.state;
          if (closed) {
            throw Error(closed);
          }
          this.state.closed = 'Connection closed';
          current.delete(conns.get(l));
          const innerVow = watch(
            E(this.state.handlers[l]).onClose(
              conns.get(l),
              undefined,
              handlers[l],
            ),
            this.facets.sinkWatcher,
          );

          return watch(innerVow, this.facets.rethrowUnlessMissingWatcher);
        },
      },
      openConnectionAckWatcher: {
        onFulfilled(ack) {
          return toBytes(ack || '');
        },
      },
      rethrowUnlessMissingWatcher: {
        onRejected(e) {
          rethrowUnlessMissing(e);
        },
      },
      sinkWatcher: {
        onFulfilled(_value) {
          return undefined;
        },
      },
    },
  );

  const makeHalfConnection = ({ addrs, handlers, conns, current, l, r }) => {
    const { connection } = makeHalfConnectionKit({
      addrs,
      handlers,
      conns,
      current,
      l,
      r,
    });
    return harden(connection);
  };

  return makeHalfConnection;
};

/**
 * @param {import('@agoric/zone').Zone} zone
 * @param {import('@agoric/vow').Remote<Required<ConnectionHandler>>} handler0
 * @param {Endpoint} addr0
 * @param {import('@agoric/vow').Remote<Required<ConnectionHandler>>} handler1
 * @param {Endpoint} addr1
 * @param {(opts: ConnectionOpts) => Connection} makeConnection
 * @param {WeakSetStore<Closable>} [current]
 */
export const crossoverConnection = (
  zone,
  handler0,
  addr0,
  handler1,
  addr1,
  makeConnection,
  current = zone.detached().weakSetStore('crossoverCurrentConnections'),
) => {
  const detached = zone.detached();

  /** @type {MapStore<number, Connection>} */
  const conns = detached.mapStore('addrToConnections');

  /** @type {import('@agoric/vow').Remote<Required<ConnectionHandler>>[]} */
  const handlers = harden([handler0, handler1]);
  /** @type {Endpoint[]} */
  const addrs = harden([addr0, addr1]);

  /**
   * @param {0|1} l
   * @param {0|1} r
   */
  const makeHalfConnection = (l, r) => {
    conns.init(l, makeConnection({ addrs, handlers, conns, current, l, r }));
  };

  /**
   * @param {number} l local side of the connection
   * @param {number} r remote side of the connection
   */
  const openHalfConnection = (l, r) => {
    current.add(conns.get(l));
    E(handlers[l])
      .onOpen(conns.get(l), addrs[l], addrs[r], handlers[l])
      .catch(rethrowUnlessMissing);
  };

  makeHalfConnection(0, 1);
  makeHalfConnection(1, 0);

  openHalfConnection(0, 1);
  openHalfConnection(1, 0);

  return [conns.get(0), conns.get(1)];
};

/**
 * @param {import('@agoric/zone').Zone} zone
 * @param {(opts: ConnectionOpts) => Connection} makeConnection
 * @param {VowTools} powers
 */
const prepareInboundAttempt = (zone, makeConnection, { watch }) => {
  const makeInboundAttemptKit = zone.exoClassKit(
    'InboundAttempt',
    Shape.InboundAttemptI,
    /**
     * @param {object} opts
     * @param {string} opts.localAddr
     * @param {string} opts.remoteAddr
     * @param {MapStore<Port, SetStore<Closable>>} opts.currentConnections
     * @param {string} opts.listenPrefix
     * @param {MapStore<Endpoint, [Port, import('@agoric/vow').Remote<Required<ListenHandler>>]>} opts.listening
     */
    ({
      localAddr,
      remoteAddr,
      currentConnections,
      listenPrefix,
      listening,
    }) => {
      /** @type {string | undefined} */
      let consummated;

      return {
        localAddr,
        remoteAddr,
        consummated,
        currentConnections,
        listenPrefix,
        listening,
      };
    },
    {
      inboundAttempt: {
        getLocalAddress() {
          // Return address metadata.
          return this.state.localAddr;
        },
        getRemoteAddress() {
          return this.state.remoteAddr;
        },
        async close() {
          const { consummated, localAddr, remoteAddr } = this.state;
          const { listening, listenPrefix, currentConnections } = this.state;

          if (consummated) {
            throw Error(consummated);
          }
          this.state.consummated = 'Already closed';

          const [port, listener] = listening.get(listenPrefix);

          const current = currentConnections.get(port);
          current.delete(this.facets.inboundAttempt);

          const innerVow = watch(
            E(listener).onReject(port, localAddr, remoteAddr, listener),
            this.facets.sinkWatcher,
          );

          return watch(innerVow, this.facets.rethrowUnlessMissingWatcher);
        },
        /**
         * @param {object} opts
         * @param {string} [opts.localAddress]
         * @param {string} [opts.remoteAddress]
         * @param {import('@agoric/vow').Remote<ConnectionHandler>} opts.handler
         */
        async accept({ localAddress, remoteAddress, handler: rchandler }) {
          const { consummated, localAddr, remoteAddr } = this.state;
          const { listening, listenPrefix, currentConnections } = this.state;
          if (consummated) {
            throw Error(consummated);
          }

          if (localAddress === undefined) {
            localAddress = localAddr;
          }
          this.state.consummated = `${localAddress} Already accepted`;

          if (remoteAddress === undefined) {
            remoteAddress = remoteAddr;
          }

          const [port, listener] = listening.get(listenPrefix);
          const current = currentConnections.get(port);

          current.delete(this.facets.inboundAttempt);

          return watch(
            E(listener).onAccept(port, localAddress, remoteAddress, listener),
            this.facets.inboundAttemptAcceptWatcher,
            {
              localAddress,
              rchandler,
              remoteAddress,
              current,
            },
          );
        },
      },
      inboundAttemptAcceptWatcher: {
        onFulfilled(lchandler, watchContext) {
          const { localAddress, rchandler, remoteAddress, current } =
            watchContext;

          return crossoverConnection(
            zone,
            /** @type {import('@agoric/vow').Remote<Required<ConnectionHandler>>} */ (
              lchandler
            ),
            localAddress,
            /** @type {import('@agoric/vow').Remote<Required<ConnectionHandler>>} */ (
              rchandler
            ),
            remoteAddress,
            makeConnection,
            current,
          )[1];
        },
      },
      rethrowUnlessMissingWatcher: {
        onRejected(e) {
          rethrowUnlessMissing(e);
        },
      },
      sinkWatcher: {
        onFulfilled(_value) {
          return undefined;
        },
      },
    },
  );

  const makeInboundAttempt = ({
    localAddr,
    remoteAddr,
    currentConnections,
    listenPrefix,
    listening,
  }) => {
    const { inboundAttempt } = makeInboundAttemptKit({
      localAddr,
      remoteAddr,
      currentConnections,
      listenPrefix,
      listening,
    });

    return harden(inboundAttempt);
  };

  return makeInboundAttempt;
};

/** @enum {number} */
const RevokeState = /** @type {const} */ ({
  NOT_REVOKED: 0,
  REVOKING: 1,
  REVOKED: 2,
});

/**
 * @param {import('@agoric/zone').Zone} zone
 * @param {VowTools} powers
 */
const preparePort = (zone, powers) => {
  const makeIncapable = zone.exoClass('Incapable', undefined, () => ({}), {});

  const { watch, allVows } = powers;

  /**
   * @param {object} opts
   * @param {Endpoint} opts.localAddr
   * @param {MapStore<Endpoint, [Port, import('@agoric/vow').Remote<Required<ListenHandler>>]>} opts.listening
   * @param {SetStore<import('@agoric/vow').Remote<Connection>>} opts.openConnections
   * @param {MapStore<Port, SetStore<Closable>>} opts.currentConnections
   * @param {MapStore<string, Port>} opts.boundPorts
   * @param {import('@agoric/vow').Remote<ProtocolHandler>} opts.protocolHandler
   * @param {Remote<ProtocolImpl>} opts.protocolImpl
   */
  const initPort = ({
    localAddr,
    listening,
    openConnections,
    currentConnections,
    boundPorts,
    protocolHandler,
    protocolImpl,
  }) => {
    return {
      listening,
      openConnections,
      currentConnections,
      boundPorts,
      localAddr,
      protocolHandler,
      protocolImpl,
      /** @type {RevokeState | undefined} */
      revoked: undefined,
    };
  };

  const makePortKit = zone.exoClassKit('Port', Shape.PortI, initPort, {
    port: {
      getLocalAddress() {
        // Works even after revoke().
        return this.state.localAddr;
      },
      /** @param {import('@agoric/vow').Remote<ListenHandler>} listenHandler */
      async addListener(listenHandler) {
        const { revoked, listening, localAddr, protocolHandler } = this.state;

        !revoked || Fail`Port ${this.state.localAddr} is revoked`;
        listenHandler || Fail`listenHandler is not defined`;

        if (listening.has(localAddr)) {
          // Last one wins.
          const [lport, lhandler] = listening.get(localAddr);
          if (lhandler === listenHandler) {
            return;
          }
          listening.set(localAddr, [
            this.facets.port,
            /** @type {Remote<Required<ListenHandler>>} */ (listenHandler),
          ]);
          E(lhandler).onRemove(lport, lhandler).catch(rethrowUnlessMissing);
        } else {
          listening.init(
            localAddr,
            harden([
              this.facets.port,
              /** @type {Remote<Required<ListenHandler>>} */ (listenHandler),
            ]),
          );
        }

        // ASSUME: that the listener defines onAccept.

        const innerVow = watch(
          E(protocolHandler).onListen(
            this.facets.port,
            localAddr,
            listenHandler,
            protocolHandler,
          ),
          this.facets.portAddListenerWatcher,
          { listenHandler },
        );
        return watch(innerVow, this.facets.rethrowUnlessMissingWatcher);
      },
      /** @param {Remote<ListenHandler>} listenHandler */
      async removeListener(listenHandler) {
        const { listening, localAddr, protocolHandler } = this.state;
        listening.has(localAddr) || Fail`Port ${localAddr} is not listening`;
        listening.get(localAddr)[1] === listenHandler ||
          Fail`Port ${localAddr} handler to remove is not listening`;
        listening.delete(localAddr);

        const innerVow = watch(
          E(protocolHandler).onListenRemove(
            this.facets.port,
            localAddr,
            listenHandler,
            protocolHandler,
          ),
          this.facets.portRemoveListenerWatcher,
          { listenHandler },
        );
        return watch(innerVow, this.facets.rethrowUnlessMissingWatcher);
      },
      /**
       * @param {Endpoint} remotePort
       * @param {Remote<ConnectionHandler>} [connectionHandler]
       */
      async connect(
        remotePort,
        connectionHandler = /** @type {Remote<ConnectionHandler>} */ (
          makeIncapable()
        ),
      ) {
        const { revoked, localAddr, protocolImpl } = this.state;

        !revoked || Fail`Port ${localAddr} is revoked`;
        /** @type {Endpoint} */
        const dst = harden(remotePort);
        return watch(
          E(protocolImpl).outbound(this.facets.port, dst, connectionHandler),
          this.facets.portConnectWatcher,
          { revoked },
        );
      },
      async revoke() {
        const { revoked, localAddr } = this.state;
        const { protocolHandler } = this.state;

        revoked !== RevokeState.REVOKED ||
          Fail`Port ${localAddr} is already revoked`;

        this.state.revoked = RevokeState.REVOKING;

        const revokeVow = watch(
          E(protocolHandler).onRevoke(
            this.facets.port,
            localAddr,
            protocolHandler,
          ),
          this.facets.portRevokeWatcher,
        );

        return watch(revokeVow, this.facets.portRevokeCleanupWatcher);
      },
    },
    portAddListenerWatcher: {
      onFulfilled(_value, watcherContext) {
        const { listenHandler } = watcherContext;
        return E(listenHandler).onListen(this.facets.port, listenHandler);
      },
    },
    portRemoveListenerWatcher: {
      onFulfilled(_value, watcherContext) {
        const { listenHandler } = watcherContext;
        return E(listenHandler).onRemove(this.facets.port, listenHandler);
      },
    },
    portConnectWatcher: {
      onFulfilled(conn, watchContext) {
        const { revoked } = watchContext;
        const { openConnections } = this.state;

        if (revoked) {
          void E(conn).close();
        } else {
          openConnections.add(conn);
        }
        return conn;
      },
    },
    portRevokeWatcher: {
      onFulfilled(_value) {
        const { currentConnections, listening, localAddr } = this.state;
        const port = this.facets.port;

        // Clean up everything we did.
        const values = [...currentConnections.get(port).values()];

        /** @type {import('@agoric/vow').Specimen[]} */
        const ps = [];

        ps.push(
          ...values.map(conn =>
            watch(E(conn).close(), this.facets.sinkWatcher),
          ),
        );

        if (listening.has(localAddr)) {
          const listener = listening.get(localAddr)[1];
          ps.push(port.removeListener(listener));
        }

        return watch(allVows(ps), this.facets.rethrowUnlessMissingWatcher);
      },
    },
    sinkWatcher: {
      onFulfilled() {
        return undefined;
      },
      onRejected() {
        return undefined;
      },
    },
    portRevokeCleanupWatcher: {
      onFulfilled(_value) {
        const { currentConnections, boundPorts, localAddr } = this.state;

        this.state.revoked = RevokeState.REVOKED;

        currentConnections.delete(this.facets.port);
        boundPorts.delete(localAddr);
      },
    },
    rethrowUnlessMissingWatcher: {
      onRejected(e) {
        rethrowUnlessMissing(e);
      },
    },
  });

  const makePort = ({
    localAddr,
    listening,
    openConnections,
    currentConnections,
    boundPorts,
    protocolHandler,
    protocolImpl,
  }) => {
    const { port } = makePortKit({
      localAddr,
      listening,
      openConnections,
      currentConnections,
      boundPorts,
      protocolHandler,
      protocolImpl,
    });
    return harden(port);
  };

  return makePort;
};

/**
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {VowTools} powers
 */
const prepareBinder = (zone, powers) => {
  const makeConnection = prepareHalfConnection(zone, powers);

  const { watch } = powers;

  const makeInboundAttempt = prepareInboundAttempt(
    zone,
    makeConnection,
    powers,
  );

  const makePort = preparePort(zone, powers);

  const detached = zone.detached();

  const makeFullBinderKit = zone.exoClassKit(
    'binder',
    {
      protocolImpl: Shape.ProtocolImplI,
      binder: M.interface('Binder', {
        bindPort: M.callWhen(Shape.Endpoint).returns(Shape.Vow$(Shape.Port)),
      }),
      binderInboundInstantiateWatcher: M.interface(
        'BinderInboundInstantiateWatcher',
        {
          onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderInboundInstantiateCatchWatcher: M.interface(
        'BinderInboundInstantiateCatchWatcher',
        {
          onRejected: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderOutboundInstantiateWatcher: M.interface(
        'BinderOutboundInstantiateWatcher',
        {
          onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderOutboundConnectWatcher: M.interface(
        'BinderOutboundConnectWatcher',
        {
          onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderOutboundCatchWatcher: M.interface('BinderOutboundCatchWatcher', {
        onRejected: M.call(M.any()).rest(M.any()).returns(M.any()),
      }),
      binderOutboundInboundWatcher: M.interface(
        'BinderOutboundInboundWatcher',
        {
          onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderOutboundAcceptWatcher: M.interface('BinderOutboundAcceptWatcher', {
        onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
      }),
      binderBindGeneratePortWatcher: M.interface(
        'BinderBindGeneratePortWatcher',
        {
          onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
        },
      ),
      binderPortWatcher: M.interface('BinderPortWatcher', {
        onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
      }),
      binderBindWatcher: M.interface('BinderBindWatcher', {
        onFulfilled: M.call(M.any()).rest(M.any()).returns(M.any()),
      }),
      rethrowUnlessMissingWatcher: M.interface('RethrowUnlessMissingWatcher', {
        onRejected: M.call(M.any()).rest(M.any()).returns(M.any()),
      }),
    },
    /**
     * @param {object} opts
     * @param {MapStore<Port, SetStore<Closable>>} opts.currentConnections
     * @param {MapStore<string, Port>} opts.boundPorts
     * @param {MapStore<Endpoint, [Port, Remote<Required<ListenHandler>>]>} opts.listening
     * @param {Remote<ProtocolHandler>} opts.protocolHandler
     */
    ({ currentConnections, boundPorts, listening, protocolHandler }) => {
      /** @type {SetStore<Connection>} */
      const openConnections = detached.setStore('openConnections');

      return {
        currentConnections,
        boundPorts,
        listening,
        revoked: RevokeState.NOT_REVOKED,
        openConnections,
        protocolHandler,
      };
    },
    {
      protocolImpl: {
        /**
         * @param {Endpoint} listenAddr
         * @param {Endpoint} remoteAddr
         */
        async inbound(listenAddr, remoteAddr) {
          const { listening, protocolHandler } = this.state;

          const prefixes = getPrefixes(listenAddr);
          let listenPrefixIndex = 0;
          let listenPrefix;

          while (listenPrefixIndex < prefixes.length) {
            listenPrefix = prefixes[listenPrefixIndex];
            if (!listening.has(listenPrefix)) {
              listenPrefixIndex += 1;
              continue;
            }

            break;
          }

          if (listenPrefixIndex >= prefixes.length) {
            throw Error(`No listeners for ${listenAddr}`);
          }

          const [port] = listening.get(/** @type {string} **/ (listenPrefix));

          const innerVow = watch(
            E(
              /** @type {Remote<Required<ProtocolHandler>>} */ (
                protocolHandler
              ),
            ).onInstantiate(
              /** @type {Port} **/ (port),
              prefixes[listenPrefixIndex],
              remoteAddr,
              protocolHandler,
            ),
            this.facets.binderInboundInstantiateWatcher,
            {
              listenAddr,
              remoteAddr,
              port,
              listenPrefixIndex,
            },
          );

          return watch(
            innerVow,
            this.facets.binderInboundInstantiateCatchWatcher,
            {
              listenPrefixIndex,
              listenAddr,
              remoteAddr,
              lastFailure: Error(`No listeners for ${listenAddr}`),
            },
          );
        },
        /**
         * @param {Port} port
         * @param {Endpoint} remoteAddr
         * @param {ConnectionHandler} lchandler
         */
        async outbound(port, remoteAddr, lchandler) {
          const { protocolHandler } = this.state;

          const localAddr = await E(port).getLocalAddress();

          // Allocate a local address.
          const instantiateInnerVow = watch(
            E(
              /** @type {Remote<Required<ProtocolHandler>>} */ (
                protocolHandler
              ),
            ).onInstantiate(port, localAddr, remoteAddr, protocolHandler),
            this.facets.binderOutboundInstantiateWatcher,
            {
              port,
              localAddr,
              remoteAddr,
              protocolHandler,
            },
          );

          const instantiateVow = watch(
            instantiateInnerVow,
            this.facets.rethrowUnlessMissingWatcher,
          );

          const attemptVow = watch(
            instantiateVow,
            this.facets.binderOutboundInboundWatcher,
            {
              localAddr,
              remoteAddr,
            },
          );
          const acceptedVow = watch(
            attemptVow,
            this.facets.binderOutboundAcceptWatcher,
            {
              handler: lchandler,
            },
          );

          return watch(acceptedVow, this.facets.binderOutboundCatchWatcher, {
            port,
            remoteAddr,
            lchandler,
            localAddr,
          });
        },
        async bindPort(localAddr) {
          return this.facets.binder.bindPort(localAddr);
        },
      },
      binder: {
        /** @param {string} localAddr */
        async bindPort(localAddr) {
          const { protocolHandler } = this.state;

          // Check if we are underspecified (ends in slash)
          const underspecified = localAddr.endsWith(ENDPOINT_SEPARATOR);

          const localAddrVow = watch(
            E(protocolHandler).generatePortID(localAddr, protocolHandler),
            this.facets.binderBindGeneratePortWatcher,
            {
              underspecified,
              localAddr,
            },
          );

          return watch(localAddrVow, this.facets.binderBindWatcher);
        },
      },
      binderInboundInstantiateWatcher: {
        onFulfilled(localInstance, watchContext) {
          const { listenAddr, remoteAddr, port, listenPrefixIndex } =
            watchContext;
          const { listening, currentConnections } = this.state;
          const prefixes = getPrefixes(listenAddr);

          const localAddr = localInstance
            ? `${listenAddr}/${localInstance}`
            : listenAddr;
          const current = currentConnections.get(port);
          const inboundAttempt = makeInboundAttempt({
            localAddr,
            remoteAddr,
            currentConnections,
            listenPrefix: prefixes[listenPrefixIndex],
            listening,
          });

          current.add(inboundAttempt);
          return inboundAttempt;
        },
      },
      binderInboundInstantiateCatchWatcher: {
        onRejected(e, watchContext) {
          let { lastFailure, listenPrefixIndex } = watchContext;

          try {
            rethrowUnlessMissing(e);
          } catch (innerE) {
            lastFailure = innerE;
          }

          const { listenAddr, remoteAddr } = watchContext;

          const { listening, protocolHandler } = this.state;

          const prefixes = getPrefixes(listenAddr);

          let listenPrefix;

          listenPrefixIndex += 1;

          while (listenPrefixIndex < prefixes.length) {
            listenPrefix = prefixes[listenPrefixIndex];
            if (!listening.has(listenPrefix)) {
              listenPrefixIndex += 1;
              continue;
            }

            break;
          }

          if (listenPrefixIndex >= prefixes.length) {
            throw lastFailure;
          }

          const [port] = listening.get(/** @type {string} */ (listenPrefix));

          const innerVow = watch(
            E(
              /** @type {Remote<Required<ProtocolHandler>>} */ (
                protocolHandler
              ),
            ).onInstantiate(
              port,
              prefixes[listenPrefixIndex],
              remoteAddr,
              protocolHandler,
            ),
            this.facets.binderInboundInstantiateWatcher,
            {
              listenAddr,
              remoteAddr,
              port,
              listenPrefixIndex,
            },
          );

          return watch(
            innerVow,
            this.facets.binderInboundInstantiateCatchWatcher,
            {
              ...watchContext,
              lastFailure,
              listenPrefixIndex,
            },
          );
        },
      },
      binderOutboundInstantiateWatcher: {
        onFulfilled(localInstance, watchContext) {
          const { localAddr } = watchContext;

          return localInstance ? `${localAddr}/${localInstance}` : localAddr;
        },
      },
      binderOutboundConnectWatcher: {
        onFulfilled(
          {
            handler: rchandler,
            remoteAddress: negotiatedRemoteAddress,
            localAddress: negotiatedLocalAddress,
          },
          watchContext,
        ) {
          const {
            lastFailure,
            lchandler,
            localAddr: requestedLocalAddress,
            remoteAddr: requestedRemoteAddress,
            port,
          } = watchContext;

          const { currentConnections } = this.state;

          if (!rchandler) {
            throw lastFailure;
          }

          const current = currentConnections.get(port);

          return crossoverConnection(
            zone,
            /** @type {import('@agoric/vow').Remote<Required<ConnectionHandler>>} */ (
              lchandler
            ),
            negotiatedLocalAddress || requestedLocalAddress,
            /** @type {import('@agoric/vow').Remote<Required<ConnectionHandler>>} */ (
              rchandler
            ),
            negotiatedRemoteAddress || requestedRemoteAddress,
            makeConnection,
            current,
          )[0];
        },
      },
      binderOutboundCatchWatcher: {
        onRejected(e, watchContext) {
          let lastFailure;

          try {
            rethrowUnlessMissing(e);
          } catch (innerE) {
            lastFailure = innerE;
          }

          const { port, remoteAddr, lchandler, localAddr } = watchContext;

          const { protocolHandler } = this.state;

          const connectVow = watch(
            E(protocolHandler).onConnect(
              port,
              localAddr,
              remoteAddr,
              lchandler,
              protocolHandler,
            ),
          );

          return watch(connectVow, this.facets.binderOutboundConnectWatcher, {
            lastFailure,
            remoteAddr,
            localAddr,
            lchandler,
            port,
          });
        },
      },
      binderOutboundInboundWatcher: {
        onFulfilled(initialLocalAddress, watchContext) {
          const { remoteAddr, localAddr } = watchContext;

          if (initialLocalAddress === undefined) {
            initialLocalAddress = localAddr;
          }

          // Attempt the loopback connection.
          return this.facets.protocolImpl.inbound(
            remoteAddr,
            initialLocalAddress,
          );
        },
      },
      binderOutboundAcceptWatcher: {
        onFulfilled(attempt, watchContext) {
          const { handler } = watchContext;
          return E(attempt).accept({ handler });
        },
      },
      binderBindGeneratePortWatcher: {
        onFulfilled(portID, watchContext) {
          const { localAddr, underspecified } = watchContext;
          const { protocolHandler, boundPorts } = this.state;

          if (!underspecified) {
            return localAddr;
          }

          const newAddr = `${localAddr}${portID}`;
          if (!boundPorts.has(newAddr)) {
            return newAddr;
          }
          return watch(
            E(protocolHandler).generatePortID(localAddr, protocolHandler),
            this.facets.binderBindGeneratePortWatcher,
            watchContext,
          );
        },
      },
      binderPortWatcher: {
        onFulfilled(_value, watchContext) {
          const { port, localAddr } = watchContext;
          const { boundPorts, currentConnections } = this.state;

          boundPorts.init(localAddr, port);
          currentConnections.init(
            port,
            zone.detached().setStore('connections'),
          );
          return port;
        },
      },
      binderBindWatcher: {
        onFulfilled(localAddr) {
          const {
            boundPorts,
            listening,
            openConnections,
            currentConnections,
            protocolHandler,
          } = this.state;

          if (boundPorts.has(localAddr)) {
            return boundPorts.get(localAddr);
          }

          const port = makePort({
            localAddr,
            listening,
            openConnections,
            currentConnections,
            boundPorts,
            protocolHandler,
            protocolImpl: this.facets.protocolImpl,
          });

          return watch(
            E(protocolHandler).onBind(port, localAddr, protocolHandler),
            this.facets.binderPortWatcher,
            {
              port,
              localAddr,
            },
          );
        },
      },
      rethrowUnlessMissingWatcher: {
        onRejected(e) {
          rethrowUnlessMissing(e);
        },
      },
    },
  );

  const makeBinderKit = ({
    currentConnections,
    boundPorts,
    listening,
    protocolHandler,
  }) => {
    const { protocolImpl, binder } = makeFullBinderKit({
      currentConnections,
      boundPorts,
      listening,
      protocolHandler,
    });
    return harden({ protocolImpl, binder });
  };
  return makeBinderKit;
};

/**
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {VowTools} powers
 */
export const prepareNetworkProtocol = (zone, powers) => {
  const makeBinderKit = prepareBinder(zone, powers);

  /**
   * @param {Remote<ProtocolHandler>} protocolHandler
   * @returns {Protocol}
   */
  const makeNetworkProtocol = protocolHandler => {
    const detached = zone.detached();

    /** @type {MapStore<Port, SetStore<Closable>>} */
    const currentConnections = detached.mapStore('portToCurrentConnections');

    /** @type {MapStore<string, Port>} */
    const boundPorts = detached.mapStore('addrToPort');

    /** @type {MapStore<Endpoint, [Port, Remote<Required<ListenHandler>>]>} */
    const listening = detached.mapStore('listening');

    const { binder, protocolImpl } = makeBinderKit({
      currentConnections,
      boundPorts,
      listening,
      protocolHandler,
    });

    // Wire up the local protocol to the handler.
    void E(protocolHandler).onCreate(protocolImpl, protocolHandler);
    return binder;
  };

  return makeNetworkProtocol;
};

/**
 * Create a ConnectionHandler that just echoes its packets.
 *
 * @param {import('@agoric/base-zone').Zone} zone
 */
export const prepareEchoConnectionKit = zone => {
  const makeEchoConnectionKit = zone.exoClassKit(
    'EchoConnectionKit',
    {
      handler: M.interface('ConnectionHandler', {
        onReceive: M.callWhen(
          Shape.Connection,
          Shape.Bytes,
          Shape.ConnectionHandler,
        )
          .optional(Shape.Opts)
          .returns(Shape.Data),
        onClose: M.callWhen(Shape.Connection)
          .optional(M.any(), Shape.ConnectionHandler)
          .returns(M.undefined()),
      }),
      listener: M.interface('Listener', {
        onListen: M.callWhen(Shape.Port, Shape.ListenHandler).returns(
          Shape.Vow$(M.undefined()),
        ),
        onAccept: M.callWhen(
          Shape.Port,
          Shape.Endpoint,
          Shape.Endpoint,
          Shape.ListenHandler,
        ).returns(Shape.Vow$(Shape.ConnectionHandler)),
      }),
    },
    () => {
      return {
        /** @type {string | undefined} */
        closed: undefined,
      };
    },
    {
      handler: {
        /**
         * @param {Connection} _connection
         * @param {Bytes} bytes
         * @param {ConnectionHandler} _connectionHandler
         */
        async onReceive(_connection, bytes, _connectionHandler) {
          const { closed } = this.state;

          if (closed) {
            throw Error(closed);
          }
          return bytes;
        },
        /**
         * @param {Connection} _connection
         * @param {CloseReason} [_reason]
         * @param {ConnectionHandler} [_connectionHandler]
         */
        async onClose(_connection, _reason, _connectionHandler) {
          const { closed } = this.state;

          if (closed) {
            throw Error(closed);
          }

          this.state.closed = 'Connection closed';
        },
      },
      listener: {
        async onAccept(_port, _localAddr, _remoteAddr, _listenHandler) {
          return this.facets.handler;
        },
        async onListen(port, _listenHandler) {
          console.debug(`listening on echo port: ${port}`);
        },
      },
    },
  );

  return makeEchoConnectionKit;
};

/**
 * Create a protocol handler that just connects to itself.
 *
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {VowTools} powers
 */
export function prepareLoopbackProtocolHandler(zone, { watch, allVows }) {
  const detached = zone.detached();

  /** @param {string} [instancePrefix] */
  const initHandler = (instancePrefix = 'nonce/') => {
    /** @type {MapStore<string, [Remote<Port>, Remote<Required<ListenHandler>>]>} */
    const listeners = detached.mapStore('localAddr');

    return {
      listeners,
      portNonce: 0n,
      instancePrefix,
      instanceNonce: 0n,
    };
  };

  const makeLoopbackProtocolHandlerKit = zone.exoClassKit(
    'ProtocolHandler',
    Shape.ProtocolHandlerI,
    /** @param {string} [instancePrefix] */
    initHandler,
    {
      protocolHandler: {
        async onCreate(_impl, _protocolHandler) {
          // noop
        },
        async generatePortID(_localAddr, _protocolHandler) {
          this.state.portNonce += 1n;
          return `port${this.state.portNonce}`;
        },
        async onBind(_port, _localAddr, _protocolHandler) {
          // noop, for now; Maybe handle a bind?
        },
        /**
         * @param {*} _port
         * @param {Endpoint} localAddr
         * @param {Endpoint} remoteAddr
         * @returns {PromiseVow<AttemptDescription>}}
         */
        async onConnect(_port, localAddr, remoteAddr) {
          const { listeners } = this.state;
          const [lport, lhandler] = listeners.get(remoteAddr);

          const acceptVow = watch(
            E(lhandler).onAccept(lport, remoteAddr, localAddr, lhandler),
            this.facets.protocolHandlerAcceptWatcher,
          );

          const instantiateInnerVow = watch(
            E(this.facets.protocolHandler).onInstantiate(
              lport,
              remoteAddr,
              localAddr,
              this.facets.protocolHandler,
            ),
            this.facets.protocolHandlerInstantiateWatcher,
          );

          const instantiateVow = watch(
            instantiateInnerVow,
            this.facets.rethrowUnlessMissingWatcher,
          );
          return watch(
            allVows([acceptVow, instantiateVow]),
            this.facets.protocolHandlerConnectWatcher,
          );
        },
        async onInstantiate(_port, _localAddr, _remote, _protocol) {
          const { instancePrefix } = this.state;
          this.state.instanceNonce += 1n;
          return `${instancePrefix}${this.state.instanceNonce}`;
        },
        async onListen(port, localAddr, listenHandler, _protocolHandler) {
          const { listeners } = this.state;

          // This implementation has a simple last-one-wins replacement policy.
          // Other handlers might use different policies.
          if (listeners.has(localAddr)) {
            const lhandler = listeners.get(localAddr)[1];
            if (lhandler !== listenHandler) {
              listeners.set(
                localAddr,
                harden([
                  port,
                  /** @type {Remote<Required<ListenHandler>>} */ (
                    listenHandler
                  ),
                ]),
              );
            }
          } else {
            listeners.init(
              localAddr,
              harden([
                port,
                /** @type {Remote<Required<ListenHandler>>} */ (listenHandler),
              ]),
            );
          }
        },
        /**
         * @param {Remote<Port>} port
         * @param {Endpoint} localAddr
         * @param {Remote<ListenHandler>} listenHandler
         * @param {*} _protocolHandler
         */
        async onListenRemove(port, localAddr, listenHandler, _protocolHandler) {
          const { listeners } = this.state;
          const [lport, lhandler] = listeners.get(localAddr);
          lport === port || Fail`Port does not match listener on ${localAddr}`;
          lhandler === listenHandler ||
            Fail`Listen handler does not match listener on ${localAddr}`;
          listeners.delete(localAddr);
        },
        async onRevoke(_port, _localAddr, _protocolHandler) {
          // This is an opportunity to clean up resources.
        },
      },
      protocolHandlerAcceptWatcher: {
        onFulfilled(rchandler) {
          return rchandler;
        },
      },
      protocolHandlerConnectWatcher: {
        onFulfilled(results) {
          return {
            remoteInstance: results[0],
            handler: results[1],
          };
        },
      },
      protocolHandlerInstantiateWatcher: {
        onFulfilled(remoteInstance) {
          return remoteInstance;
        },
      },
      rethrowUnlessMissingWatcher: {
        onRejected(e) {
          rethrowUnlessMissing(e);
        },
      },
    },
  );

  /** @param {string} [instancePrefix] */
  const makeLoopbackProtocolHandler = instancePrefix => {
    const { protocolHandler } = makeLoopbackProtocolHandlerKit(instancePrefix);
    return harden(protocolHandler);
  };

  return makeLoopbackProtocolHandler;
}
