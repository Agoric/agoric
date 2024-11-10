//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * Metadata defines a set of protocol specific data encoded into the ICS27 channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface Metadata {
  /** version defines the ICS27 protocol version */
  version: string;
  /** controller_connection_id is the connection identifier associated with the controller chain */
  controllerConnectionId: string;
  /** host_connection_id is the connection identifier associated with the host chain */
  hostConnectionId: string;
  /**
   * address defines the interchain account address to be fulfilled upon the OnChanOpenTry handshake step
   * NOTE: the address field is empty on the OnChanOpenInit handshake step
   */
  address: string;
  /** encoding defines the supported codec format */
  encoding: string;
  /** tx_type defines the type of transactions the interchain account can execute */
  txType: string;
}
export interface MetadataProtoMsg {
  typeUrl: '/ibc.applications.interchain_accounts.v1.Metadata';
  value: Uint8Array;
}
/**
 * Metadata defines a set of protocol specific data encoded into the ICS27 channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface MetadataSDKType {
  version: string;
  controller_connection_id: string;
  host_connection_id: string;
  address: string;
  encoding: string;
  tx_type: string;
}
function createBaseMetadata(): Metadata {
  return {
    version: '',
    controllerConnectionId: '',
    hostConnectionId: '',
    address: '',
    encoding: '',
    txType: '',
  };
}
export const Metadata = {
  typeUrl: '/ibc.applications.interchain_accounts.v1.Metadata',
  encode(
    message: Metadata,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.version !== '') {
      writer.uint32(10).string(message.version);
    }
    if (message.controllerConnectionId !== '') {
      writer.uint32(18).string(message.controllerConnectionId);
    }
    if (message.hostConnectionId !== '') {
      writer.uint32(26).string(message.hostConnectionId);
    }
    if (message.address !== '') {
      writer.uint32(34).string(message.address);
    }
    if (message.encoding !== '') {
      writer.uint32(42).string(message.encoding);
    }
    if (message.txType !== '') {
      writer.uint32(50).string(message.txType);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Metadata {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = reader.string();
          break;
        case 2:
          message.controllerConnectionId = reader.string();
          break;
        case 3:
          message.hostConnectionId = reader.string();
          break;
        case 4:
          message.address = reader.string();
          break;
        case 5:
          message.encoding = reader.string();
          break;
        case 6:
          message.txType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Metadata {
    return {
      version: isSet(object.version) ? String(object.version) : '',
      controllerConnectionId: isSet(object.controllerConnectionId)
        ? String(object.controllerConnectionId)
        : '',
      hostConnectionId: isSet(object.hostConnectionId)
        ? String(object.hostConnectionId)
        : '',
      address: isSet(object.address) ? String(object.address) : '',
      encoding: isSet(object.encoding) ? String(object.encoding) : '',
      txType: isSet(object.txType) ? String(object.txType) : '',
    };
  },
  toJSON(message: Metadata): JsonSafe<Metadata> {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.controllerConnectionId !== undefined &&
      (obj.controllerConnectionId = message.controllerConnectionId);
    message.hostConnectionId !== undefined &&
      (obj.hostConnectionId = message.hostConnectionId);
    message.address !== undefined && (obj.address = message.address);
    message.encoding !== undefined && (obj.encoding = message.encoding);
    message.txType !== undefined && (obj.txType = message.txType);
    return obj;
  },
  fromPartial(object: Partial<Metadata>): Metadata {
    const message = createBaseMetadata();
    message.version = object.version ?? '';
    message.controllerConnectionId = object.controllerConnectionId ?? '';
    message.hostConnectionId = object.hostConnectionId ?? '';
    message.address = object.address ?? '';
    message.encoding = object.encoding ?? '';
    message.txType = object.txType ?? '';
    return message;
  },
  fromProtoMsg(message: MetadataProtoMsg): Metadata {
    return Metadata.decode(message.value);
  },
  toProto(message: Metadata): Uint8Array {
    return Metadata.encode(message).finish();
  },
  toProtoMsg(message: Metadata): MetadataProtoMsg {
    return {
      typeUrl: '/ibc.applications.interchain_accounts.v1.Metadata',
      value: Metadata.encode(message).finish(),
    };
  },
};
