import { inspect } from 'node:util';

import type { VowTools } from '@agoric/vow';
import {
  base64ToBytes,
  prepareEchoConnectionKit,
  prepareLoopbackProtocolHandler,
  prepareNetworkPowers,
  preparePortAllocator,
  prepareRouterProtocol,
} from '@agoric/network';
import type { Zone } from '@agoric/zone';
import type {
  IBCChannelID,
  IBCMethod,
  IBCEvent,
  ScopedBridgeManagerMethods,
  IBCConnectionID,
  IBCPortID,
} from '@agoric/vats';
import {
  prepareCallbacks as prepareIBCCallbacks,
  prepareIBCProtocol,
} from '@agoric/vats/src/ibc.js';
import { BridgeId, makeTracer } from '@agoric/internal';
import { E, Far } from '@endo/far';
import type { Guarded } from '@endo/exo';
import { defaultMockAckMap, errorAcknowledgments } from './ibc-mocks.js';
import { decodeProtobufBase64 } from '../tools/protobuf-decoder.js';

const trace = makeTracer('NetworkFakes');

/**
 * Mimic IBC Channel version negotiation
 *
 * As part of the IBC Channel initialization, the version field is negotiated
 * with the host. `version` is a String or JSON string as determined by the IBC
 * Application protol.
 *
 * @param version requested version string
 * @param params mock parameters to add to version string
 * @param params.address for ICS-27, the bech32 address provided by the host
 */
const addParamsIfJsonVersion = (
  version: string,
  params: { address: string },
): string => {
  try {
    const parsed = JSON.parse(version);
    return JSON.stringify({
      ...parsed,
      ...params,
    });
  } catch {
    return version;
  }
};

type ImplementedIBCEvents = 'channelOpenAck' | 'acknowledgementPacket';

export const ibcBridgeMocks: {
  [T in ImplementedIBCEvents]: T extends 'channelOpenAck'
    ? (
        obj: IBCMethod<'startChannelOpenInit'>,
        opts: {
          channelID: IBCChannelID;
          counterpartyChannelID: IBCChannelID;
          mockChainAddress: string;
        },
      ) => IBCEvent<'channelOpenAck'>
    : T extends 'acknowledgementPacket'
      ? (
          obj: IBCMethod<'sendPacket'>,
          opts: { sequence: bigint; acknowledgement: string },
        ) => IBCEvent<'acknowledgementPacket'>
      : never;
} = {
  channelOpenAck: (
    obj: IBCMethod<'startChannelOpenInit'>,
    {
      channelID,
      counterpartyChannelID,
      mockChainAddress,
    }: {
      channelID: IBCChannelID;
      counterpartyChannelID: IBCChannelID;
      mockChainAddress: string;
    },
  ): IBCEvent<'channelOpenAck'> => {
    return {
      type: 'IBC_EVENT',
      blockHeight: 99,
      blockTime: 1711571357,
      event: 'channelOpenAck',
      portID: obj.packet.source_port,
      channelID,
      counterparty: {
        port_id: obj.packet.destination_port,
        channel_id: counterpartyChannelID,
      },
      counterpartyVersion: addParamsIfJsonVersion(obj.version, {
        address: mockChainAddress,
      }),
      connectionHops: obj.hops,
      order: obj.order,
      version: obj.version,
    };
  },

  acknowledgementPacket: (
    obj: IBCMethod<'sendPacket'>,
    opts: { sequence: bigint; acknowledgement: string },
  ): IBCEvent<'acknowledgementPacket'> => {
    const { sequence, acknowledgement } = opts;
    return {
      acknowledgement,
      blockHeight: 289,
      blockTime: 1712180320,
      event: 'acknowledgementPacket',
      packet: {
        data: obj.packet.data,
        destination_channel: obj.packet.destination_channel,
        destination_port: obj.packet.destination_port,
        sequence,
        source_channel: obj.packet.source_channel,
        source_port: obj.packet.source_port,
        timeout_timestamp: 1712183910866313000n,
      },
      relayer: 'agoric1gtkg0g6x8lqc734ht3qe2sdkrfugpdp2h7fuu0',
      type: 'IBC_EVENT',
    };
  },
};

type BridgeEvents = Array<
  | IBCEvent<'channelOpenAck'>
  | IBCEvent<'acknowledgementPacket'>
  | IBCEvent<'channelCloseConfirm'>
  | IBCEvent<'sendPacket'>
>;

type BridgeDowncalls = Array<
  | IBCMethod<'startChannelOpenInit'>
  | IBCMethod<'startChannelCloseInit'>
  | IBCMethod<'bindPort'>
  | IBCMethod<'sendPacket'>
>;

/**
 * Make a fake IBC Bridge, extended from the dibc ScopedBridgeManager.
 *
 * Has extra `setMockAck` and `setAddressPrefix` met
 *
 * @param zone
 */
export const makeFakeIBCBridge = (
  zone: Zone,
): Guarded<
  ScopedBridgeManagerMethods<'dibc'> & {
    addMockAck: (msgData: string, ackData: string) => void;
    setMockAck: (mockAckMap: Record<string, string>) => void;
    setAddressPrefix: (addressPrefix: string) => void;
    inspectDibcBridge: () => {
      bridgeEvents: BridgeEvents;
      bridgeDowncalls: BridgeDowncalls;
    };
  }
> => {
  let bridgeHandler: any;
  /**
   * Intended to mock an individual account's sequence, but is global for all
   * accounts.
   * XXX teach this about IBCConnections and store sequence on a
   * per-channel basis.
   * @type {bigint}
   */
  let ibcSequenceNonce = 0n;
  /**
   * The number of channels created. Currently used as a proxy to increment
   * fake account addresses and channels.
   * @type {nubmer}
   */
  let channelCount = 0;
  let icaAccountCount = 0;
  let bech32Prefix = 'cosmos';

  /**
   * Keep track channels requested by remote chain. Used as a proxy for
   * counterpaty channel ids
   */
  const remoteChannelMap: Record<IBCConnectionID, number> = {};

  /**
   * Packet byte string map of requests to responses
   * @type {Record<string, string>}
   */
  let mockAckMap = defaultMockAckMap;
  let bridgeEvents: BridgeEvents = [];
  let bridgeDowncalls: BridgeDowncalls = [];

  /**
   * Store remote mock addresses that have been distributed.
   * If there's a `channelOpenInit` request for a PortId:ConnnectionId
   * pair that's been previously established, let's reuse it to mimic
   * the behavior of the ICS-27 protocol.
   */
  type AddressKey = `${IBCPortID}:${IBCConnectionID}`;
  const getAddressKey = (
    obj: IBCMethod<'startChannelOpenInit'>,
  ): AddressKey => {
    return `${obj.packet.source_port as IBCPortID}:${obj.hops[0] as IBCConnectionID}`;
  };
  const addressMap = new Map<AddressKey, string>();

  return zone.exo('Fake IBC Bridge Manager', undefined, {
    getBridgeId: () => BridgeId.DIBC,
    toBridge: async obj => {
      trace(
        'toBridge',
        obj,
        obj.packet?.data ? base64ToBytes(obj.packet.data) : undefined,
      );
      if (obj.type === 'IBC_METHOD') {
        bridgeDowncalls = bridgeDowncalls.concat(obj);
        switch (obj.method) {
          case 'startChannelOpenInit': {
            const connectionChannelCount = remoteChannelMap[obj.hops[0]] || 0;
            const addressKey = getAddressKey(obj);
            let mockChainAddress;
            if (addressMap.has(addressKey)) {
              mockChainAddress = addressMap.get(addressKey);
            } else {
              mockChainAddress =
                icaAccountCount > 0
                  ? `${bech32Prefix}1test${icaAccountCount}`
                  : `${bech32Prefix}1test`;
              addressMap.set(addressKey, mockChainAddress);
            }
            const ackEvent = ibcBridgeMocks.channelOpenAck(obj, {
              mockChainAddress,
              channelID: `channel-${channelCount}`,
              counterpartyChannelID: `channel-${connectionChannelCount}`,
            });
            bridgeHandler?.fromBridge(ackEvent);
            bridgeEvents = bridgeEvents.concat(ackEvent);
            channelCount += 1;
            if (obj.packet.source_port.includes('icacontroller')) {
              icaAccountCount += 1;
            }
            remoteChannelMap[obj.hops[0]] = connectionChannelCount + 1;
            return undefined;
          }
          case 'sendPacket': {
            const mockAckMapHasData = obj.packet.data in mockAckMap;
            if (!mockAckMapHasData) {
              trace(
                `sendPacket acking err because no mock ack for b64 data key: '${obj.packet.data}'`,
              );
              try {
                const decoded = decodeProtobufBase64(
                  JSON.parse(base64ToBytes(obj.packet.data)).data,
                );
                trace(
                  'Fix the source of this request or define a ack mapping for it:',
                  inspect(decoded, { depth: null }),
                );
              } catch (err) {
                trace('Could not decode packet data', err);
              }
            }
            const ackEvent = ibcBridgeMocks.acknowledgementPacket(obj, {
              sequence: ibcSequenceNonce,
              acknowledgement: mockAckMapHasData
                ? mockAckMap[obj.packet.data]
                : errorAcknowledgments.error5,
            });
            bridgeEvents = bridgeEvents.concat(ackEvent);
            ibcSequenceNonce += 1n;
            bridgeHandler?.fromBridge(ackEvent);
            return ackEvent.packet;
          }
          default:
            return undefined;
        }
      }
      return undefined;
    },
    fromBridge: async obj => {
      trace('fromBridge', obj);
      bridgeEvents = bridgeEvents.concat(obj);
      if (!bridgeHandler) throw Error('no handler!');
      return bridgeHandler.fromBridge(obj);
    },
    initHandler: handler => {
      if (bridgeHandler) throw Error('already init');
      bridgeHandler = handler;
    },
    setHandler: handler => {
      if (!bridgeHandler) throw Error('must init first');
      bridgeHandler = handler;
    },
    /**
     * Set a map of requests to responses to simulate different scenarios. Defaults to `defaultMockAckMap`.
     * See `@agoric/orchestration/tools/ibc-mocks.js` for helpers to build this map.
     *
     * @param ackMap
     */
    setMockAck: (ackMap: typeof mockAckMap) => {
      trace('setMockAck', ackMap);
      mockAckMap = ackMap;
    },
    addMockAck: (msgData: string, ackData: string) => {
      trace('addMockAck', msgData, ackData);
      mockAckMap[msgData] = ackData;
    },
    /**
     * Set a new bech32 prefix for the mocked ICA channel. Defaults to `cosmos`.
     *
     * @param newPrefix
     */
    setAddressPrefix: (newPrefix: typeof bech32Prefix) => {
      trace('setAddressPrefix', newPrefix);
      bech32Prefix = newPrefix;
    },
    /**
     * for debugging and testing
     */
    inspectDibcBridge() {
      return { bridgeEvents, bridgeDowncalls };
    },
  });
};

export const setupFakeNetwork = (
  zone: Zone,
  { vowTools }: { vowTools: VowTools },
) => {
  const powers = prepareNetworkPowers(zone, vowTools);
  const makeRouterProtocol = prepareRouterProtocol(zone, powers);
  const makePortAllocator = preparePortAllocator(zone, powers);
  const makeLoopbackProtocolHandler = prepareLoopbackProtocolHandler(
    zone,
    vowTools,
  );
  const makeEchoConnectionKit = prepareEchoConnectionKit(zone);
  const makeIBCProtocolHandler = prepareIBCProtocol(zone, vowTools);

  const protocol = makeRouterProtocol();
  const portAllocator = makePortAllocator({ protocol });
  const ibcBridge = makeFakeIBCBridge(zone);

  const networkVat = Far('vat-network', {
    registerProtocolHandler: (prefixes, handler) =>
      protocol.registerProtocolHandler(prefixes, handler),
    makeLoopbackProtocolHandler,
    makeEchoConnectionKit,
    unregisterProtocolHandler: (prefix, handler) =>
      protocol.unregisterProtocolHandler(prefix, handler),
    getPortAllocator: () => portAllocator,
  });

  const ibcVat = Far('vat-ibc', {
    makeCallbacks: prepareIBCCallbacks(zone),
    createHandlers(callbacks) {
      const ibcHandler = makeIBCProtocolHandler(callbacks);
      return harden(ibcHandler);
    },
  });

  const setupIBCProtocol = async () => {
    const callbacks = await E(ibcVat).makeCallbacks(ibcBridge);
    const { protocolHandler, bridgeHandler } =
      await E(ibcVat).createHandlers(callbacks);
    await E(ibcBridge).initHandler(bridgeHandler);
    await E(networkVat).registerProtocolHandler(
      ['/ibc-port', '/ibc-hop'],
      protocolHandler,
    );
  };

  return {
    portAllocator,
    protocol,
    ibcBridge,
    networkVat,
    ibcVat,
    setupIBCProtocol,
  };
};
