// @ts-check

/**
 * @typedef {string | Buffer | ArrayBuffer} Data
 *
 * @typedef {string} Bytes
 */

/**
 * @typedef {string} Endpoint A local or remote address See multiaddr.js for an
 *   opinionated router implementation
 */

/**
 * @typedef {Object} Closable A closable object
 * @property {() => Promise<void>} close Terminate the object
 */

/**
 * @typedef {Object} Protocol The network Protocol
 * @property {(prefix: Endpoint) => Promise<Port>} bind Claim a port, or if
 *   ending in ENDPOINT_SEPARATOR, a fresh name
 */

/**
 * @typedef {Object} Port A port that has been bound to a protocol
 * @property {() => Endpoint} getLocalAddress Get the locally bound name of this port
 * @property {(acceptHandler: ListenHandler) => Promise<void>} addListener
 *   Begin accepting incoming connections
 * @property {(
 *   remote: Endpoint,
 *   connectionHandler?: ConnectionHandler,
 * ) => Promise<Connection>} connect
 *   Make an outbound connection
 * @property {(acceptHandler: ListenHandler) => Promise<void>} removeListener
 *   Remove the currently-bound listener
 * @property {() => void} revoke Deallocate the port entirely, removing all
 *   listeners and closing all active connections
 */

/**
 * @typedef {Object} ListenHandler A handler for incoming connections
 * @property {(port: Port, l: ListenHandler) => Promise<void>} [onListen] The
 *   listener has been registered
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   l: ListenHandler,
 * ) => Promise<ConnectionHandler>} onAccept
 *   A new connection is incoming
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   l: ListenHandler,
 * ) => Promise<void>} [onReject]
 *   The connection was rejected
 * @property {(port: Port, rej: any, l: ListenHandler) => Promise<void>} [onError]
 *   There was an error while listening
 * @property {(port: Port, l: ListenHandler) => Promise<void>} [onRemove] The
 *   listener has been removed
 */

/**
 * @typedef {Object} Connection
 * @property {(
 *   packetBytes: Data,
 *   opts?: Record<string, any>,
 * ) => Promise<Bytes>} send
 *   Send a packet on the connection
 * @property {() => Promise<void>} close Close both ends of the connection
 * @property {() => Endpoint} getLocalAddress Get the locally bound name of this
 *   connection
 * @property {() => Endpoint} getRemoteAddress Get the name of the counterparty
 */

/**
 * @typedef {Object} ConnectionHandler A handler for a given Connection
 * @property {(
 *   connection: Connection,
 *   localAddr: Endpoint,
 *   remoteAddr: Endpoint,
 *   c: ConnectionHandler,
 * ) => void} [onOpen]
 *   The connection has been opened
 * @property {(
 *   connection: Connection,
 *   packetBytes: Bytes,
 *   c: ConnectionHandler,
 *   opts?: Record<string, any>,
 * ) => Promise<Data>} [onReceive]
 *   The connection received a packet
 * @property {(
 *   connection: Connection,
 *   reason?: CloseReason,
 *   c?: ConnectionHandler,
 * ) => Promise<void>} [onClose]
 *   The connection has been closed
 *
 * @typedef {any | null} CloseReason The reason a connection was closed
 */

/**
 * @typedef {Object} AttemptDescription
 * @property {ConnectionHandler} handler
 * @property {Endpoint} [remoteAddress]
 * @property {Endpoint} [localAddress]
 */

/**
 * @typedef {Object} ProtocolHandler A handler for things the protocol
 *   implementation will invoke
 * @property {(protocol: ProtocolImpl, p: ProtocolHandler) => Promise<void>} onCreate
 *   This protocol is created
 * @property {(localAddr: Endpoint, p: ProtocolHandler) => Promise<string>} generatePortID
 *   Create a fresh port identifier for this protocol
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   p: ProtocolHandler,
 * ) => Promise<void>} onBind
 *   A port will be bound
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   listenHandler: ListenHandler,
 *   p: ProtocolHandler,
 * ) => Promise<void>} onListen
 *   A port was listening
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   listenHandler: ListenHandler,
 *   p: ProtocolHandler,
 * ) => Promise<void>} onListenRemove
 *   A port listener has been reset
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   remote: Endpoint,
 *   p: ProtocolHandler,
 * ) => Promise<Endpoint>} [onInstantiate]
 *   Return unique suffix for local address
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   remote: Endpoint,
 *   c: ConnectionHandler,
 *   p: ProtocolHandler,
 * ) => Promise<AttemptDescription>} onConnect
 *   A port initiates an outbound connection
 * @property {(
 *   port: Port,
 *   localAddr: Endpoint,
 *   p: ProtocolHandler,
 * ) => Promise<void>} onRevoke
 *   The port is being completely destroyed
 *
 * @typedef {Object} InboundAttempt An inbound connection attempt
 * @property {(desc: AttemptDescription) => Promise<Connection>} accept
 *   Establish the connection
 * @property {() => Endpoint} getLocalAddress Return the local address for this attempt
 * @property {() => Endpoint} getRemoteAddress Return the remote address for this attempt
 * @property {() => Promise<void>} close Abort the attempt
 *
 * @typedef {Object} ProtocolImpl Things the protocol can do for us
 * @property {(prefix: Endpoint) => Promise<Port>} bind Claim a port, or if
 *   ending in ENDPOINT_SEPARATOR, a fresh name
 * @property {(
 *   listenAddr: Endpoint,
 *   remoteAddr: Endpoint,
 * ) => Promise<InboundAttempt>} inbound
 *   Make an attempt to connect into this protocol
 * @property {(
 *   port: Port,
 *   remoteAddr: Endpoint,
 *   connectionHandler: ConnectionHandler,
 * ) => Promise<Connection>} outbound
 *   Create an outbound connection
 */
