//@ts-nocheck
import { Validator } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseAddValidatorsProposal() {
    return {
        title: '',
        description: '',
        hostZone: '',
        validators: [],
        deposit: '',
    };
}
export const AddValidatorsProposal = {
    typeUrl: '/stride.stakeibc.AddValidatorsProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.hostZone !== '') {
            writer.uint32(26).string(message.hostZone);
        }
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(34).fork()).ldelim();
        }
        if (message.deposit !== '') {
            writer.uint32(42).string(message.deposit);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddValidatorsProposal();
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
                    message.hostZone = reader.string();
                    break;
                case 4:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.deposit = reader.string();
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
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
            deposit: isSet(object.deposit) ? String(object.deposit) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.deposit !== undefined && (obj.deposit = message.deposit);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddValidatorsProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.hostZone = object.hostZone ?? '';
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        message.deposit = object.deposit ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return AddValidatorsProposal.decode(message.value);
    },
    toProto(message) {
        return AddValidatorsProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.AddValidatorsProposal',
            value: AddValidatorsProposal.encode(message).finish(),
        };
    },
};
function createBaseToggleLSMProposal() {
    return {
        title: '',
        description: '',
        hostZone: '',
        enabled: false,
        deposit: '',
    };
}
export const ToggleLSMProposal = {
    typeUrl: '/stride.stakeibc.ToggleLSMProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.hostZone !== '') {
            writer.uint32(26).string(message.hostZone);
        }
        if (message.enabled === true) {
            writer.uint32(32).bool(message.enabled);
        }
        if (message.deposit !== '') {
            writer.uint32(42).string(message.deposit);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseToggleLSMProposal();
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
                    message.hostZone = reader.string();
                    break;
                case 4:
                    message.enabled = reader.bool();
                    break;
                case 5:
                    message.deposit = reader.string();
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
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            enabled: isSet(object.enabled) ? Boolean(object.enabled) : false,
            deposit: isSet(object.deposit) ? String(object.deposit) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        message.enabled !== undefined && (obj.enabled = message.enabled);
        message.deposit !== undefined && (obj.deposit = message.deposit);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseToggleLSMProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.hostZone = object.hostZone ?? '';
        message.enabled = object.enabled ?? false;
        message.deposit = object.deposit ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ToggleLSMProposal.decode(message.value);
    },
    toProto(message) {
        return ToggleLSMProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.ToggleLSMProposal',
            value: ToggleLSMProposal.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=gov.js.map