//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseParameterChangeProposal() {
    return {
        $typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
        title: '',
        description: '',
        changes: [],
    };
}
export const ParameterChangeProposal = {
    typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        for (const v of message.changes) {
            ParamChange.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            changes: Array.isArray(object?.changes)
                ? object.changes.map((e) => ParamChange.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        if (message.changes) {
            obj.changes = message.changes.map(e => e ? ParamChange.toJSON(e) : undefined);
        }
        else {
            obj.changes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParameterChangeProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.changes =
            object.changes?.map(e => ParamChange.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ParameterChangeProposal.decode(message.value);
    },
    toProto(message) {
        return ParameterChangeProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
            value: ParameterChangeProposal.encode(message).finish(),
        };
    },
};
function createBaseParamChange() {
    return {
        subspace: '',
        key: '',
        value: '',
    };
}
export const ParamChange = {
    typeUrl: '/cosmos.params.v1beta1.ParamChange',
    encode(message, writer = BinaryWriter.create()) {
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
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            subspace: isSet(object.subspace) ? String(object.subspace) : '',
            key: isSet(object.key) ? String(object.key) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.subspace !== undefined && (obj.subspace = message.subspace);
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParamChange();
        message.subspace = object.subspace ?? '';
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ParamChange.decode(message.value);
    },
    toProto(message) {
        return ParamChange.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.params.v1beta1.ParamChange',
            value: ParamChange.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=params.js.map