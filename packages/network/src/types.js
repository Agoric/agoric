// @ts-check

/** @import {PromiseVow, Remote} from '@agoric/vow'; */

/**
 * @template {import('@endo/exo').Methods} M
 * @template {(...args: any[]) => any} I
 * @typedef {M & ThisType<{ self: import('@endo/exo').Guarded<M>, state: ReturnType<I> }>} ExoClassMethods
 * Rearrange the exo types to make a cast of the methods (M) and init function (I) to a specific type.
 */

/**
 * @typedef {string} Bytes Each character code carries 8-bit octets.  Eventually we want to use passable Uint8Arrays.
 */

/**
 * @typedef {string} Endpoint A local or remote address See multiaddr.js for an
 *   opinionated router implementation
 */

/**
 * @typedef {object} Closable A closable object
 * @property {() => PromiseVow<void>} close Terminate the object
 */

/**
 * @typedef {object} Protocol The network Protocol
 * @property {(prefix: Endpoint) => PromiseVow<Port>} bindPort Claim a port, or if
 *   ending in ENDPOINT_SEPARATOR, a fresh name
 */

/**
 * @typedef {object} Port A port that has been bound to a protocol
 * @property {() => Endpoint} getLocalAddress Get the locally bound name of this
 *   port
 * @property {(acceptHandler: Remote<ListenHandler>) => PromiseVow<void>} addListener
 *   Begin accepting incoming connections
 * @property {(
 *   remote: Endpoint,
 *   connectionHandler?: Remote<ConnectionHandler>,
 * ) => PromiseVow<Connection>} connect
 *   Make an outbound connection
 * @property {(acceptHandler: Remote<ListenHandler>) => PromiseVow<void>} removeListener
 *   Remove the currently-bound listener
 * @property {() => PromiseVow<void>} revoke Deallocate the port entirely, removing all
 *   listeners and closing all active connections
 */

/**
 * @typedef {object} ListenHandler A handler for incoming connections
 * @property {(port: Remote<Port>, l: Remote<ListenHandler>) => PromiseVow<void>} [onListen] The listener has been registered
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   l: Remote<ListenHandler>,
 * ) => PromiseVow<Remote<ConnectionHandler>>} onAccept
 *   A new connection is incoming
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   l: Remote<ListenHandler>,
 * ) => PromiseVow<void>} [onReject]
 *   The connection was rejected
 * @property {(port: Remote<Port>, rej: any, l: Remote<ListenHandler>) => PromiseVow<void>} [onError]
 *   There was an error while listening
 * @property {(port: Remote<Port>, l: Remote<ListenHandler>) => PromiseVow<void>} [onRemove] The
 *   listener has been removed
 */

/**
 * @typedef {object} Connection
 * @property {(
 *   packetBytes: Bytes,
 *   opts?: Record<string, any>,
 * ) => PromiseVow<Bytes>} send
 *   Send a packet on the connection
 * @property {() => PromiseVow<void>} close Close both ends of the connection
 * @property {() => Endpoint} getLocalAddress Get the locally bound name of this
 *   connection
 * @property {() => Endpoint} getRemoteAddress Get the name of the counterparty
 */

/**
 * @typedef {object} ConnectionHandler A handler for a given Connection
 * @property {(
 *   connection: Remote<Connection>,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   c: Remote<ConnectionHandler>,
 * ) => PromiseVow<void>} [onOpen]
 *   The connection has been opened
 * @property {(
 *   connection: Remote<Connection>,
 *   ack: Bytes,
 *   c: Remote<ConnectionHandler>,
 *   opts?: Record<string, any>,
 * ) => PromiseVow<Bytes>} [onReceive]
 *   The connection received a packet
 * @property {(
 *   connection: Remote<Connection>,
 *   reason?: CloseReason,
 *   c?: Remote<ConnectionHandler>,
 * ) => PromiseVow<void>} [onClose]
 *   The connection has been closed
 *
 * @typedef {any | null} CloseReason The reason a connection was closed
 */

/**
 * @typedef {object} AttemptDescription
 * @property {Remote<ConnectionHandler>} handler
 * @property {Endpoint} [remoteAddress]
 * @property {Endpoint} [localAddress]
 */

/**
 * @typedef {object} ProtocolHandler A handler for things the protocol
 *   implementation will invoke
 * @property {(protocol: Remote<ProtocolImpl>, p: Remote<ProtocolHandler>) => PromiseVow<void>} onCreate
 *   This protocol is created
 * @property {(localAddr: Endpoint, p: Remote<ProtocolHandler>) => PromiseVow<string>} generatePortID
 *   Create a fresh port identifier for this protocol
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<void>} onBind
 *   A port will be bound
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   listenHandler: Remote<ListenHandler>,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<void>} onListen
 *   A port was listening
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   listenHandler: Remote<ListenHandler>,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<void>} onListenRemove
 *   A port listener has been reset
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   remote: Endpoint,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<Endpoint>} [onInstantiate]
 *   Return unique suffix for local address
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   remote: Endpoint,
 *   c: Remote<ConnectionHandler>,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<AttemptDescription>} onConnect
 *   A port initiates an outbound connection
 * @property {(
 *   port: Remote<Port>,
 *   localAddr: Endpoint,
 *   p: Remote<ProtocolHandler>,
 * ) => PromiseVow<void>} onRevoke
 *   The port is being completely destroyed
 *
 * @typedef {object} InboundAttempt An inbound connection attempt
 * @property {(desc: AttemptDescription) => PromiseVow<Connection>} accept
 *   Establish the connection
 * @property {() => Endpoint} getLocalAddress Return the local address for this
 *   attempt
 * @property {() => Endpoint} getRemoteAddress Return the remote address for
 *   this attempt
 * @property {() => PromiseVow<void>} close Abort the attempt
 *
 * @typedef {object} ProtocolImpl Things the protocol can do for us
 * @property {(prefix: Endpoint) => PromiseVow<Remote<Port>>} bindPort Claim a port, or if
 *   ending in ENDPOINT_SEPARATOR, a fresh name
 * @property {(
 *   listenAddr: Endpoint,
 *   remoteAddr: Endpoint,
 * ) => PromiseVow<InboundAttempt>} inbound
 *   Make an attempt to connect into this protocol
 * @property {(
 *   port: Remote<Port>,
 *   remoteAddr: Endpoint,
 *   connectionHandler: Remote<ConnectionHandler>,
 * ) => PromiseVow<Connection>} outbound
 *   Create an outbound connection
 */
