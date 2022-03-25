// @ts-check

import {
  dataToBase64,
  base64ToBytes,
} from '@agoric/swingset-vat/src/vats/network/index.js';
import { makeStore, makeLegacyMap } from '@agoric/store';
import { makePromiseKit } from '@endo/promise-kit';
import { assert, details as X } from '@agoric/assert';
import { Far } from '@endo/far';

import '@agoric/store/exported.js';
import '@agoric/swingset-vat/src/vats/network/types.js';

import { makeWithQueue } from './queue.js';

// CAVEAT: IBC acks cannot be empty, as the Cosmos IAVL tree cannot represent
// empty acknowledgements as distinct from unacknowledged packets.
const DEFAULT_ACKNOWLEDGEMENT = '\x00';

// Default timeout after 10 minutes.
const DEFAULT_PACKET_TIMEOUT_NS = 10n * 60n * 1_000_000_000n;

/** @typedef {import('./bridge').BridgeHandler} BridgeHandler */

/**
 * @typedef {string} IBCPortID
 *
 * @typedef {string} IBCChannelID
 *
 * @typedef {string} IBCConnectionID
 */

/**
 * @typedef {Object} IBCPacket
 * @property {Bytes} [data]
 * @property {IBCChannelID} source_channel
 * @property {IBCPortID} source_port
 * @property {IBCChannelID} destination_channel
 * @property {IBCPortID} destination_port
 */

/**
 * Create a handler for the IBC protocol, both from the network and from the bridge.
 *
 * @param {typeof import('@endo/far').E} E
 * @param {(method: string, params: any) => Promise<any>} rawCallIBCDevice
 * @returns {ProtocolHandler & BridgeHandler} Protocol/Bridge handler
 */
export function makeIBCProtocolHandler(E, rawCallIBCDevice) {
  // Nonce for creating port identifiers.
  let lastPortID = 0;

  const callIBCDevice = (method, params) => {
    console.info('IBC downcall', method, params);
    return rawCallIBCDevice(method, params);
  };
  /** @type {Store<string, Promise<Connection>>} */
  const channelKeyToConnP = makeStore('CHANNEL:PORT');

  /**
   * @typedef {Object} Counterparty
   * @property {string} port_id
   * @property {string} channel_id
   *
   * @typedef {Object} ConnectingInfo
   * @property {'ORDERED' | 'UNORDERED'} order
   * @property {string[]} connectionHops
   * @property {string} portID
   * @property {string} channelID
   * @property {Counterparty} counterparty
   * @property {string} version
   *
   * @typedef {PromiseRecord<AttemptDescription>} OnConnectP
   *
   * @typedef {Omit<ConnectingInfo, 'counterparty' | 'channelID'> & {
   *   localAddr: Endpoint;
   *   onConnectP: OnConnectP;
   *   counterparty: { port_id: string };
   * }} Outbound
   */

  /** @type {LegacyMap<string, Outbound[]>} */
  // Legacy because it holds a mutable Javascript Array
  const srcPortToOutbounds = makeLegacyMap('SRC-PORT');

  /** @type {Store<string, ConnectingInfo>} */
  const channelKeyToInfo = makeStore('CHANNEL:PORT');

  /** @type {Store<string, Promise<InboundAttempt>>} */
  const channelKeyToAttemptP = makeStore('CHANNEL:PORT');

  /** @type {LegacyMap<string, LegacyMap<number, PromiseRecord<Bytes>>>} */
  // Legacy because it holds a LegacyMap
  const channelKeyToSeqAck = makeLegacyMap('CHANNEL:PORT');

  /**
   * Send a packet out via the IBC device.
   *
   * @param {IBCPacket} packet
   * @param {LegacyMap<number, PromiseRecord<Bytes>>} seqToAck
   * @param {bigint} [relativeTimeoutNs]
   */
  async function ibcSendPacket(
    packet,
    seqToAck,
    relativeTimeoutNs = DEFAULT_PACKET_TIMEOUT_NS,
  ) {
    // Make a kernel call to do the send.
    const fullPacket = await callIBCDevice('sendPacket', {
      packet,
      relativeTimeoutNs,
    });

    // Extract the actual sequence number from the return.
    const { sequence } = fullPacket;

    /** @type {PromiseRecord<Bytes>} */
    const ackDeferred = makePromiseKit();

    // Register the ack resolver/rejector with this sequence number.
    seqToAck.init(sequence, ackDeferred);
    return ackDeferred.promise;
  }

  /**
   * @param {string} channelID
   * @param {string} portID
   * @param {string} rChannelID
   * @param {string} rPortID
   * @param {'ORDERED' | 'UNORDERED'} order
   * @returns {ConnectionHandler}
   */
  function makeIBCConnectionHandler(
    channelID,
    portID,
    rChannelID,
    rPortID,
    order,
  ) {
    const channelKey = `${channelID}:${portID}`;
    // Legacy because it holds a PromiseRecord
    const seqToAck = makeLegacyMap('SEQUENCE');
    channelKeyToSeqAck.init(channelKey, seqToAck);

    /**
     * @param {Connection} _conn
     * @param {Bytes} packetBytes
     * @param {ConnectionHandler} _handler
     * @param {Object} root0
     * @param {bigint} [root0.relativeTimeoutNs]
     * @returns {Promise<Bytes>} Acknowledgement data
     */
    let onReceive = async (
      _conn,
      packetBytes,
      _handler,
      { relativeTimeoutNs } = {},
    ) => {
      // console.error(`Remote IBC Handler ${portID} ${channelID}`);
      const packet = {
        source_port: portID,
        source_channel: channelID,
        destination_port: rPortID,
        destination_channel: rChannelID,
        data: dataToBase64(packetBytes),
      };
      return ibcSendPacket(packet, seqToAck, relativeTimeoutNs);
    };

    if (order === 'ORDERED') {
      // We set up a queue on the receiver to enforce ordering.
      const withChannelReceiveQueue = makeWithQueue();
      onReceive = withChannelReceiveQueue(onReceive);
    }

    return Far('IBCConnectionHandler', {
      async onOpen(conn, localAddr, remoteAddr, _handler) {
        console.debug(
          'onOpen Remote IBC Connection',
          channelID,
          portID,
          localAddr,
          remoteAddr,
        );
        const connP = E.resolve(conn);
        channelKeyToConnP.init(channelKey, connP);
      },
      onReceive,
      async onClose(_conn, _reason, _handler) {
        const packet = {
          source_port: portID,
          source_channel: channelID,
        };
        await callIBCDevice('startChannelCloseInit', { packet });
        const rejectReason = Error('Connection closed');
        for (const ackDeferred of seqToAck.values()) {
          ackDeferred.reject(rejectReason);
        }
        channelKeyToSeqAck.delete(channelKey);
      },
    });
  }

  /** @param {string} localAddr */
  const localAddrToPortID = localAddr => {
    const m = localAddr.match(/^\/ibc-port\/([-a-zA-Z0-9._+#[\]<>]+)$/);
    if (!m) {
      throw TypeError(
        `Invalid port specification ${localAddr}; expected "/ibc-port/PORT"`,
      );
    }
    return m[1];
  };

  /** @type {ProtocolImpl} */
  let protocolImpl;

  /**
   * @typedef {Object} OutboundCircuitRecord
   * @property {IBCConnectionID} dst
   * @property {'ORDERED' | 'UNORDERED'} order
   * @property {string} version
   * @property {IBCPacket} packet
   * @property {PromiseRecord<ConnectionHandler>} deferredHandler
   */

  /** @type {LegacyMap<Port, Set<PromiseRecord<ConnectionHandler>>>} */
  // Legacy because it holds a raw JavaScript Set
  const portToPendingConns = makeLegacyMap('Port');

  /** @type {ProtocolHandler} */
  const protocol = Far('IBCProtocolHandler', {
    async onCreate(impl, _protocolHandler) {
      console.debug('IBC onCreate');
      protocolImpl = impl;
    },
    async onInstantiate() {
      // The IBC channel is not known until after handshake.
      return '';
    },
    async generatePortID(_localAddr, _protocolHandler) {
      lastPortID += 1;
      return `port-${lastPortID}`;
    },
    async onBind(port, localAddr, _protocolHandler) {
      const portID = localAddrToPortID(localAddr);
      portToPendingConns.init(port, new Set());
      const packet = {
        source_port: portID,
      };
      return callIBCDevice('bindPort', { packet });
    },
    async onConnect(port, localAddr, remoteAddr, _chandler, _protocolHandler) {
      console.debug('IBC onConnect', localAddr, remoteAddr);
      const portID = localAddrToPortID(localAddr);
      const pendingConns = portToPendingConns.get(port);

      const match = remoteAddr.match(
        /^(\/ibc-hop\/[^/]+)*\/ibc-port\/([^/]+)\/(ordered|unordered)\/([^/]+)$/s,
      );
      if (!match) {
        throw TypeError(
          `Remote address ${remoteAddr} must be '(/ibc-hop/CONNECTION)*/ibc-port/PORT/(ordered|unordered)/VERSION'`,
        );
      }

      const hops = [];
      let h = match[1];
      while (h) {
        const m = h.match(/^\/ibc-hop\/([^/]+)/);
        if (!m) {
          throw Error(
            `internal: ${JSON.stringify(h)} did not begin with "/ibc-hop/XXX"`,
          );
        }
        h = h.substr(m[0].length);
        hops.push(m[1]);
      }

      // Generate a circuit.
      const rPortID = match[2];
      const order = match[3] === 'ordered' ? 'ORDERED' : 'UNORDERED';
      const version = match[4];

      const onConnectP = makePromiseKit();

      pendingConns.add(onConnectP);
      /** @type {Outbound[]} */
      let outbounds;
      if (srcPortToOutbounds.has(portID)) {
        outbounds = [...srcPortToOutbounds.get(portID)];
      } else {
        outbounds = [];
        srcPortToOutbounds.init(portID, outbounds);
      }
      outbounds.push({
        portID,
        counterparty: { port_id: rPortID },
        connectionHops: hops,
        order,
        version,
        onConnectP,
        localAddr,
      });

      // Initialise the channel, which automatic relayers should pick up.
      const packet = {
        source_port: portID,
        destination_port: rPortID,
      };

      await callIBCDevice('startChannelOpenInit', {
        packet,
        order,
        hops,
        version,
      });

      return onConnectP.promise;
    },
    async onListen(_port, localAddr, _listenHandler) {
      console.debug('IBC onListen', localAddr);
    },
    async onListenRemove(_port, localAddr, _listenHandler) {
      console.debug('IBC onListenRemove', localAddr);
    },
    async onRevoke(port, localAddr, _protocolHandler) {
      console.debug('IBC onRevoke', localAddr);
      const pendingConns = portToPendingConns.get(port);
      portToPendingConns.delete(port);
      const revoked = Error(`Port ${localAddr} revoked`);
      for (const onConnectP of pendingConns.values()) {
        onConnectP.reject(revoked);
      }
    },
  });

  return Far('IBCProtocolHandler', {
    ...protocol,
    async fromBridge(srcID, obj) {
      console.info('IBC fromBridge', srcID, obj);
      switch (obj.event) {
        case 'channelOpenTry': {
          // They're (more or less politely) asking if we are listening, so make an attempt.
          const {
            channelID,
            portID,
            counterparty: { port_id: rPortID, channel_id: rChannelID },
            connectionHops: hops,
            order,
            version,
            counterpartyVersion: rVersion,
          } = obj;

          const localAddr = `/ibc-port/${portID}/${order.toLowerCase()}/${version}`;
          const ibcHops = hops.map(hop => `/ibc-hop/${hop}`).join('/');
          const remoteAddr = `${ibcHops}/ibc-port/${rPortID}/${order.toLowerCase()}/${rVersion}/ibc-channel/${rChannelID}`;

          // See if we allow an inbound attempt for this address pair (without
          // rejecting).
          const attemptP = E(protocolImpl).inbound(localAddr, remoteAddr);

          // Tell what version string we negotiated.
          const attemptedLocal = await E(attemptP).getLocalAddress();
          const match = attemptedLocal.match(
            // Match:  ... /ORDER/VERSION ...
            new RegExp('^(/[^/]+/[^/]+)*/(ordered|unordered)/([^/]+)(/|$)'),
          );

          const channelKey = `${channelID}:${portID}`;
          if (!match) {
            throw Error(
              `${channelKey}: cannot determine version from attempted local address ${attemptedLocal}`,
            );
          }
          const negotiatedVersion = match[3];

          channelKeyToAttemptP.init(channelKey, attemptP);
          channelKeyToInfo.init(channelKey, obj);

          try {
            if (negotiatedVersion !== version) {
              // Too late; the relayer gave us a version we didn't like.
              throw Error(
                `${channelKey}: negotiated version was ${negotiatedVersion}; rejecting ${version}`,
              );
            }
          } catch (e) {
            // Clean up after our failed attempt.
            channelKeyToAttemptP.delete(channelKey);
            channelKeyToInfo.delete(channelKey);
            E(attemptP).close();
            throw e;
          }
          break;
        }

        case 'channelOpenAck': {
          // Complete the pending outbound connection.
          const {
            portID,
            channelID,
            counterparty: { port_id: rPortID, channel_id: rChannelID },
            counterpartyVersion: rVersion,
            connectionHops: rHops,
          } = obj;
          const outbounds = srcPortToOutbounds.has(portID)
            ? srcPortToOutbounds.get(portID)
            : [];
          const oidx = outbounds.findIndex(
            ({ counterparty: { port_id: iPortID }, connectionHops: iHops }) => {
              if (iPortID !== rPortID) {
                return false;
              }
              if (iHops.length !== rHops.length) {
                return false;
              }
              for (let i = 0; i < iHops.length; i += 1) {
                if (iHops[i] !== rHops[i]) {
                  return false;
                }
              }
              return true;
            },
          );

          assert(oidx >= 0, X`${portID}: did not expect channelOpenAck`);
          const { onConnectP, localAddr, ...chanInfo } = outbounds[oidx];
          outbounds.splice(oidx, 1);
          if (outbounds.length === 0) {
            srcPortToOutbounds.delete(portID);
          }

          // Finish the outbound connection.
          const ibcHops = rHops.map(hop => `/ibc-hop/${hop}`).join('/');
          const remoteAddress = `${ibcHops}/ibc-port/${rPortID}/${chanInfo.order.toLowerCase()}/${rVersion}/ibc-channel/${rChannelID}`;
          const localAddress = `${localAddr}/ibc-channel/${channelID}`;
          const rchandler = makeIBCConnectionHandler(
            channelID,
            portID,
            rChannelID,
            rPortID,
            chanInfo.order,
          );
          onConnectP.resolve({
            localAddress,
            remoteAddress,
            handler: rchandler,
          });
          break;
        }

        case 'channelOpenConfirm': {
          const { portID, channelID } = obj;
          const channelKey = `${channelID}:${portID}`;
          assert(
            channelKeyToAttemptP.has(channelKey),
            X`${channelKey}: did not expect channelOpenConfirm`,
          );
          const attemptP = channelKeyToAttemptP.get(channelKey);
          channelKeyToAttemptP.delete(channelKey);

          // We have the information from our inbound connection, so complete it.
          const {
            order,
            counterparty: { port_id: rPortID, channel_id: rChannelID },
          } = channelKeyToInfo.get(channelKey);
          channelKeyToInfo.delete(channelKey);

          // Accept the attempt.
          const rchandler = makeIBCConnectionHandler(
            channelID,
            portID,
            rChannelID,
            rPortID,
            order,
          );
          const localAddr = await E(attemptP).getLocalAddress();
          E(attemptP).accept({
            localAddress: `${localAddr}/ibc-channel/${channelID}`,
            handler: rchandler,
          });
          break;
        }

        case 'receivePacket': {
          const { packet } = obj;
          const {
            data: data64,
            destination_port: portID,
            destination_channel: channelID,
          } = packet;
          const channelKey = `${channelID}:${portID}`;
          const connP = channelKeyToConnP.get(channelKey);
          const data = base64ToBytes(data64);

          await E(connP)
            .send(data)
            .then(ack => {
              const realAck = ack || DEFAULT_ACKNOWLEDGEMENT;
              const ack64 = dataToBase64(realAck);
              return callIBCDevice('receiveExecuted', { packet, ack: ack64 });
            })
            .catch(e => console.error(e));
          break;
        }

        case 'acknowledgementPacket': {
          const { packet, acknowledgement } = obj;
          const {
            sequence,
            source_channel: channelID,
            source_port: portID,
          } = packet;
          const channelKey = `${channelID}:${portID}`;
          const seqToAck = channelKeyToSeqAck.get(channelKey);
          const ackDeferred = seqToAck.get(sequence);
          ackDeferred.resolve(base64ToBytes(acknowledgement));
          seqToAck.delete(sequence);
          break;
        }

        case 'timeoutPacket': {
          const { packet } = obj;
          const {
            sequence,
            source_channel: channelID,
            source_port: portID,
          } = packet;
          const channelKey = `${channelID}:${portID}`;
          const seqToAck = channelKeyToSeqAck.get(channelKey);
          const ackDeferred = seqToAck.get(sequence);
          ackDeferred.reject(Error(`Packet timed out`));
          seqToAck.delete(sequence);
          break;
        }

        case 'channelCloseInit':
        case 'channelCloseConfirm': {
          const { portID, channelID } = obj;
          const channelKey = `${channelID}:${portID}`;
          if (channelKeyToConnP.has(channelKey)) {
            const connP = channelKeyToConnP.get(channelKey);
            channelKeyToConnP.delete(channelKey);
            E(connP).close();
          }
          break;
        }

        case 'sendPacket': {
          const { packet, relativeTimeoutNs } = obj;
          const { source_port: portID, source_channel: channelID } = packet;
          const channelKey = `${channelID}:${portID}`;
          const seqToAck = channelKeyToSeqAck.get(channelKey);
          ibcSendPacket(packet, seqToAck, relativeTimeoutNs).then(
            ack => console.info('Manual packet', packet, 'acked:', ack),
            e => console.warn('Manual packet', packet, 'failed:', e),
          );
          break;
        }

        default:
          console.error('Unexpected IBC_EVENT', obj.event);
          assert.fail(X`unrecognized method ${obj.event}`, TypeError);
      }
    },
  });
}
