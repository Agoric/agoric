//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** Data is the vstorage node data. */
export interface Data {
  value: string;
}
export interface DataProtoMsg {
  typeUrl: '/agoric.vstorage.Data';
  value: Uint8Array;
}
/** Data is the vstorage node data. */
export interface DataSDKType {
  value: string;
}
/**
 * Children are the immediate names (just one level deep) of subnodes leading to
 * more data from a given vstorage node.
 */
export interface Children {
  children: string[];
}
export interface ChildrenProtoMsg {
  typeUrl: '/agoric.vstorage.Children';
  value: Uint8Array;
}
/**
 * Children are the immediate names (just one level deep) of subnodes leading to
 * more data from a given vstorage node.
 */
export interface ChildrenSDKType {
  children: string[];
}
function createBaseData(): Data {
  return {
    value: '',
  };
}
export const Data = {
  typeUrl: '/agoric.vstorage.Data',
  encode(
    message: Data,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.value !== '') {
      writer.uint32(10).string(message.value);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Data {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Data {
    return {
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: Data): JsonSafe<Data> {
    const obj: any = {};
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<Data>): Data {
    const message = createBaseData();
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: DataProtoMsg): Data {
    return Data.decode(message.value);
  },
  toProto(message: Data): Uint8Array {
    return Data.encode(message).finish();
  },
  toProtoMsg(message: Data): DataProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.Data',
      value: Data.encode(message).finish(),
    };
  },
};
function createBaseChildren(): Children {
  return {
    children: [],
  };
}
export const Children = {
  typeUrl: '/agoric.vstorage.Children',
  encode(
    message: Children,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.children) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Children {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChildren();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.children.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Children {
    return {
      children: Array.isArray(object?.children)
        ? object.children.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: Children): JsonSafe<Children> {
    const obj: any = {};
    if (message.children) {
      obj.children = message.children.map(e => e);
    } else {
      obj.children = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Children>): Children {
    const message = createBaseChildren();
    message.children = object.children?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: ChildrenProtoMsg): Children {
    return Children.decode(message.value);
  },
  toProto(message: Children): Uint8Array {
    return Children.encode(message).finish();
  },
  toProtoMsg(message: Children): ChildrenProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.Children',
      value: Children.encode(message).finish(),
    };
  },
};
