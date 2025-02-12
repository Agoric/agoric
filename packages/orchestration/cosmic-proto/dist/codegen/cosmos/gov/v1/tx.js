//@ts-nocheck
import { Any } from '../../../google/protobuf/any.js';
import { Coin } from '../../base/v1beta1/coin.js';
import { VoteOption, WeightedVoteOption, voteOptionFromJSON, voteOptionToJSON, } from './gov.js';
import { TextProposal } from '../v1beta1/gov.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMsgSubmitProposal() {
    return {
        messages: [],
        initialDeposit: [],
        proposer: '',
        metadata: '',
    };
}
export const MsgSubmitProposal = {
    typeUrl: '/cosmos.gov.v1.MsgSubmitProposal',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.initialDeposit) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.proposer !== '') {
            writer.uint32(26).string(message.proposer);
        }
        if (message.metadata !== '') {
            writer.uint32(34).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(Any.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.initialDeposit.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.proposer = reader.string();
                    break;
                case 4:
                    message.metadata = reader.string();
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
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
            initialDeposit: Array.isArray(object?.initialDeposit)
                ? object.initialDeposit.map((e) => Coin.fromJSON(e))
                : [],
            proposer: isSet(object.proposer) ? String(object.proposer) : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        if (message.initialDeposit) {
            obj.initialDeposit = message.initialDeposit.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.initialDeposit = [];
        }
        message.proposer !== undefined && (obj.proposer = message.proposer);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSubmitProposal();
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        message.initialDeposit =
            object.initialDeposit?.map(e => Coin.fromPartial(e)) || [];
        message.proposer = object.proposer ?? '';
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitProposal.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgSubmitProposal',
            value: MsgSubmitProposal.encode(message).finish(),
        };
    },
};
function createBaseMsgSubmitProposalResponse() {
    return {
        proposalId: BigInt(0),
    };
}
export const MsgSubmitProposalResponse = {
    typeUrl: '/cosmos.gov.v1.MsgSubmitProposalResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitProposalResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSubmitProposalResponse();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitProposalResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitProposalResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgSubmitProposalResponse',
            value: MsgSubmitProposalResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgExecLegacyContent() {
    return {
        content: undefined,
        authority: '',
    };
}
export const MsgExecLegacyContent = {
    typeUrl: '/cosmos.gov.v1.MsgExecLegacyContent',
    encode(message, writer = BinaryWriter.create()) {
        if (message.content !== undefined) {
            Any.encode(message.content, writer.uint32(10).fork()).ldelim();
        }
        if (message.authority !== '') {
            writer.uint32(18).string(message.authority);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgExecLegacyContent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.content = Content_InterfaceDecoder(reader);
                    break;
                case 2:
                    message.authority = reader.string();
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
            content: isSet(object.content) ? Any.fromJSON(object.content) : undefined,
            authority: isSet(object.authority) ? String(object.authority) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.content !== undefined &&
            (obj.content = message.content ? Any.toJSON(message.content) : undefined);
        message.authority !== undefined && (obj.authority = message.authority);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgExecLegacyContent();
        message.content =
            object.content !== undefined && object.content !== null
                ? Any.fromPartial(object.content)
                : undefined;
        message.authority = object.authority ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgExecLegacyContent.decode(message.value);
    },
    toProto(message) {
        return MsgExecLegacyContent.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgExecLegacyContent',
            value: MsgExecLegacyContent.encode(message).finish(),
        };
    },
};
function createBaseMsgExecLegacyContentResponse() {
    return {};
}
export const MsgExecLegacyContentResponse = {
    typeUrl: '/cosmos.gov.v1.MsgExecLegacyContentResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgExecLegacyContentResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseMsgExecLegacyContentResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgExecLegacyContentResponse.decode(message.value);
    },
    toProto(message) {
        return MsgExecLegacyContentResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgExecLegacyContentResponse',
            value: MsgExecLegacyContentResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgVote() {
    return {
        proposalId: BigInt(0),
        voter: '',
        option: 0,
        metadata: '',
    };
}
export const MsgVote = {
    typeUrl: '/cosmos.gov.v1.MsgVote',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== '') {
            writer.uint32(18).string(message.voter);
        }
        if (message.option !== 0) {
            writer.uint32(24).int32(message.option);
        }
        if (message.metadata !== '') {
            writer.uint32(34).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVote();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 3:
                    message.option = reader.int32();
                    break;
                case 4:
                    message.metadata = reader.string();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            voter: isSet(object.voter) ? String(object.voter) : '',
            option: isSet(object.option) ? voteOptionFromJSON(object.option) : -1,
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        message.option !== undefined &&
            (obj.option = voteOptionToJSON(message.option));
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgVote();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.voter = object.voter ?? '';
        message.option = object.option ?? 0;
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgVote.decode(message.value);
    },
    toProto(message) {
        return MsgVote.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgVote',
            value: MsgVote.encode(message).finish(),
        };
    },
};
function createBaseMsgVoteResponse() {
    return {};
}
export const MsgVoteResponse = {
    typeUrl: '/cosmos.gov.v1.MsgVoteResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVoteResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseMsgVoteResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgVoteResponse.decode(message.value);
    },
    toProto(message) {
        return MsgVoteResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgVoteResponse',
            value: MsgVoteResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgVoteWeighted() {
    return {
        proposalId: BigInt(0),
        voter: '',
        options: [],
        metadata: '',
    };
}
export const MsgVoteWeighted = {
    typeUrl: '/cosmos.gov.v1.MsgVoteWeighted',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== '') {
            writer.uint32(18).string(message.voter);
        }
        for (const v of message.options) {
            WeightedVoteOption.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.metadata !== '') {
            writer.uint32(34).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVoteWeighted();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 3:
                    message.options.push(WeightedVoteOption.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.metadata = reader.string();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            voter: isSet(object.voter) ? String(object.voter) : '',
            options: Array.isArray(object?.options)
                ? object.options.map((e) => WeightedVoteOption.fromJSON(e))
                : [],
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        if (message.options) {
            obj.options = message.options.map(e => e ? WeightedVoteOption.toJSON(e) : undefined);
        }
        else {
            obj.options = [];
        }
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgVoteWeighted();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.voter = object.voter ?? '';
        message.options =
            object.options?.map(e => WeightedVoteOption.fromPartial(e)) || [];
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgVoteWeighted.decode(message.value);
    },
    toProto(message) {
        return MsgVoteWeighted.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgVoteWeighted',
            value: MsgVoteWeighted.encode(message).finish(),
        };
    },
};
function createBaseMsgVoteWeightedResponse() {
    return {};
}
export const MsgVoteWeightedResponse = {
    typeUrl: '/cosmos.gov.v1.MsgVoteWeightedResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVoteWeightedResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseMsgVoteWeightedResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgVoteWeightedResponse.decode(message.value);
    },
    toProto(message) {
        return MsgVoteWeightedResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgVoteWeightedResponse',
            value: MsgVoteWeightedResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgDeposit() {
    return {
        proposalId: BigInt(0),
        depositor: '',
        amount: [],
    };
}
export const MsgDeposit = {
    typeUrl: '/cosmos.gov.v1.MsgDeposit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.depositor !== '') {
            writer.uint32(18).string(message.depositor);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeposit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.depositor = reader.string();
                    break;
                case 3:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            depositor: isSet(object.depositor) ? String(object.depositor) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.depositor !== undefined && (obj.depositor = message.depositor);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDeposit();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.depositor = object.depositor ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeposit.decode(message.value);
    },
    toProto(message) {
        return MsgDeposit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgDeposit',
            value: MsgDeposit.encode(message).finish(),
        };
    },
};
function createBaseMsgDepositResponse() {
    return {};
}
export const MsgDepositResponse = {
    typeUrl: '/cosmos.gov.v1.MsgDepositResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseMsgDepositResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDepositResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDepositResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1.MsgDepositResponse',
            value: MsgDepositResponse.encode(message).finish(),
        };
    },
};
export const Content_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        case '/cosmos.gov.v1beta1.TextProposal':
            return TextProposal.decode(data.value);
        default:
            return data;
    }
};
//# sourceMappingURL=tx.js.map