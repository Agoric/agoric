//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/** ParameterChangeProposal defines a proposal to change one or more parameters. */
export interface ParameterChangeProposal {
  title: string;
  description: string;
  changes: ParamChange[];
}
export interface ParameterChangeProposalProtoMsg {
  typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal';
  value: Uint8Array;
}
/** ParameterChangeProposal defines a proposal to change one or more parameters. */
export interface ParameterChangeProposalSDKType {
  title: string;
  description: string;
  changes: ParamChangeSDKType[];
}
/**
 * ParamChange defines an individual parameter change, for use in
 * ParameterChangeProposal.
 */
export interface ParamChange {
  subspace: string;
  key: string;
  value: string;
}
export interface ParamChangeProtoMsg {
  typeUrl: '/cosmos.params.v1beta1.ParamChange';
  value: Uint8Array;
}
/**
 * ParamChange defines an individual parameter change, for use in
 * ParameterChangeProposal.
 */
export interface ParamChangeSDKType {
  subspace: string;
  key: string;
  value: string;
}
function createBaseParameterChangeProposal(): ParameterChangeProposal {
  return {
    title: '',
    description: '',
    changes: [],
  };
}
export const ParameterChangeProposal = {
  typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
  encode(
    message: ParameterChangeProposal,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.changes) {
      ParamChange.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ParameterChangeProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParameterChangeProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.changes.push(ParamChange.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ParameterChangeProposal {
    return {
      title: isSet(object.title) ? String(object.title) : '',
      description: isSet(object.description) ? String(object.description) : '',
      changes: Array.isArray(object?.changes)
        ? object.changes.map((e: any) => ParamChange.fromJSON(e))
        : [],
    };
  },
  toJSON(message: ParameterChangeProposal): JsonSafe<ParameterChangeProposal> {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined &&
      (obj.description = message.description);
    if (message.changes) {
      obj.changes = message.changes.map(e =>
        e ? ParamChange.toJSON(e) : undefined,
      );
    } else {
      obj.changes = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<ParameterChangeProposal>,
  ): ParameterChangeProposal {
    const message = createBaseParameterChangeProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.changes =
      object.changes?.map(e => ParamChange.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: ParameterChangeProposalProtoMsg,
  ): ParameterChangeProposal {
    return ParameterChangeProposal.decode(message.value);
  },
  toProto(message: ParameterChangeProposal): Uint8Array {
    return ParameterChangeProposal.encode(message).finish();
  },
  toProtoMsg(
    message: ParameterChangeProposal,
  ): ParameterChangeProposalProtoMsg {
    return {
      typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
      value: ParameterChangeProposal.encode(message).finish(),
    };
  },
};
function createBaseParamChange(): ParamChange {
  return {
    subspace: '',
    key: '',
    value: '',
  };
}
export const ParamChange = {
  typeUrl: '/cosmos.params.v1beta1.ParamChange',
  encode(
    message: ParamChange,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.subspace !== '') {
      writer.uint32(10).string(message.subspace);
    }
    if (message.key !== '') {
      writer.uint32(18).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(26).string(message.value);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ParamChange {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamChange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.subspace = reader.string();
          break;
        case 2:
          message.key = reader.string();
          break;
        case 3:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ParamChange {
    return {
      subspace: isSet(object.subspace) ? String(object.subspace) : '',
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: ParamChange): JsonSafe<ParamChange> {
    const obj: any = {};
    message.subspace !== undefined && (obj.subspace = message.subspace);
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<ParamChange>): ParamChange {
    const message = createBaseParamChange();
    message.subspace = object.subspace ?? '';
    message.key = object.key ?? '';
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: ParamChangeProtoMsg): ParamChange {
    return ParamChange.decode(message.value);
  },
  toProto(message: ParamChange): Uint8Array {
    return ParamChange.encode(message).finish();
  },
  toProtoMsg(message: ParamChange): ParamChangeProtoMsg {
    return {
      typeUrl: '/cosmos.params.v1beta1.ParamChange',
      value: ParamChange.encode(message).finish(),
    };
  },
};
