import * as _119 from './v1/genesis.js';
import * as _120 from './v1/icq.js';
import * as _121 from './v1/packet.js';
import * as _122 from './v1/query.js';
import * as _123 from './v1/tx.js';
export declare namespace icq {
    const v1: {
        MsgUpdateParams: {
            typeUrl: string;
            encode(message: _123.MsgUpdateParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _123.MsgUpdateParams;
            fromJSON(object: any): _123.MsgUpdateParams;
            toJSON(message: _123.MsgUpdateParams): import("../json-safe.js").JsonSafe<_123.MsgUpdateParams>;
            fromPartial(object: Partial<_123.MsgUpdateParams>): _123.MsgUpdateParams;
            fromProtoMsg(message: _123.MsgUpdateParamsProtoMsg): _123.MsgUpdateParams;
            toProto(message: _123.MsgUpdateParams): Uint8Array;
            toProtoMsg(message: _123.MsgUpdateParams): _123.MsgUpdateParamsProtoMsg;
        };
        MsgUpdateParamsResponse: {
            typeUrl: string;
            encode(_: _123.MsgUpdateParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _123.MsgUpdateParamsResponse;
            fromJSON(_: any): _123.MsgUpdateParamsResponse;
            toJSON(_: _123.MsgUpdateParamsResponse): import("../json-safe.js").JsonSafe<_123.MsgUpdateParamsResponse>;
            fromPartial(_: Partial<_123.MsgUpdateParamsResponse>): _123.MsgUpdateParamsResponse;
            fromProtoMsg(message: _123.MsgUpdateParamsResponseProtoMsg): _123.MsgUpdateParamsResponse;
            toProto(message: _123.MsgUpdateParamsResponse): Uint8Array;
            toProtoMsg(message: _123.MsgUpdateParamsResponse): _123.MsgUpdateParamsResponseProtoMsg;
        };
        QueryParamsRequest: {
            typeUrl: string;
            encode(_: _122.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _122.QueryParamsRequest;
            fromJSON(_: any): _122.QueryParamsRequest;
            toJSON(_: _122.QueryParamsRequest): import("../json-safe.js").JsonSafe<_122.QueryParamsRequest>;
            fromPartial(_: Partial<_122.QueryParamsRequest>): _122.QueryParamsRequest;
            fromProtoMsg(message: _122.QueryParamsRequestProtoMsg): _122.QueryParamsRequest;
            toProto(message: _122.QueryParamsRequest): Uint8Array;
            toProtoMsg(message: _122.QueryParamsRequest): _122.QueryParamsRequestProtoMsg;
        };
        QueryParamsResponse: {
            typeUrl: string;
            encode(message: _122.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _122.QueryParamsResponse;
            fromJSON(object: any): _122.QueryParamsResponse;
            toJSON(message: _122.QueryParamsResponse): import("../json-safe.js").JsonSafe<_122.QueryParamsResponse>;
            fromPartial(object: Partial<_122.QueryParamsResponse>): _122.QueryParamsResponse;
            fromProtoMsg(message: _122.QueryParamsResponseProtoMsg): _122.QueryParamsResponse;
            toProto(message: _122.QueryParamsResponse): Uint8Array;
            toProtoMsg(message: _122.QueryParamsResponse): _122.QueryParamsResponseProtoMsg;
        };
        InterchainQueryPacketData: {
            typeUrl: string;
            encode(message: _121.InterchainQueryPacketData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _121.InterchainQueryPacketData;
            fromJSON(object: any): _121.InterchainQueryPacketData;
            toJSON(message: _121.InterchainQueryPacketData): import("../json-safe.js").JsonSafe<_121.InterchainQueryPacketData>;
            fromPartial(object: Partial<_121.InterchainQueryPacketData>): _121.InterchainQueryPacketData;
            fromProtoMsg(message: _121.InterchainQueryPacketDataProtoMsg): _121.InterchainQueryPacketData;
            toProto(message: _121.InterchainQueryPacketData): Uint8Array;
            toProtoMsg(message: _121.InterchainQueryPacketData): _121.InterchainQueryPacketDataProtoMsg;
        };
        InterchainQueryPacketAck: {
            typeUrl: string;
            encode(message: _121.InterchainQueryPacketAck, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _121.InterchainQueryPacketAck;
            fromJSON(object: any): _121.InterchainQueryPacketAck;
            toJSON(message: _121.InterchainQueryPacketAck): import("../json-safe.js").JsonSafe<_121.InterchainQueryPacketAck>;
            fromPartial(object: Partial<_121.InterchainQueryPacketAck>): _121.InterchainQueryPacketAck;
            fromProtoMsg(message: _121.InterchainQueryPacketAckProtoMsg): _121.InterchainQueryPacketAck;
            toProto(message: _121.InterchainQueryPacketAck): Uint8Array;
            toProtoMsg(message: _121.InterchainQueryPacketAck): _121.InterchainQueryPacketAckProtoMsg;
        };
        CosmosQuery: {
            typeUrl: string;
            encode(message: _121.CosmosQuery, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _121.CosmosQuery;
            fromJSON(object: any): _121.CosmosQuery;
            toJSON(message: _121.CosmosQuery): import("../json-safe.js").JsonSafe<_121.CosmosQuery>;
            fromPartial(object: Partial<_121.CosmosQuery>): _121.CosmosQuery;
            fromProtoMsg(message: _121.CosmosQueryProtoMsg): _121.CosmosQuery;
            toProto(message: _121.CosmosQuery): Uint8Array;
            toProtoMsg(message: _121.CosmosQuery): _121.CosmosQueryProtoMsg;
        };
        CosmosResponse: {
            typeUrl: string;
            encode(message: _121.CosmosResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _121.CosmosResponse;
            fromJSON(object: any): _121.CosmosResponse;
            toJSON(message: _121.CosmosResponse): import("../json-safe.js").JsonSafe<_121.CosmosResponse>;
            fromPartial(object: Partial<_121.CosmosResponse>): _121.CosmosResponse;
            fromProtoMsg(message: _121.CosmosResponseProtoMsg): _121.CosmosResponse;
            toProto(message: _121.CosmosResponse): Uint8Array;
            toProtoMsg(message: _121.CosmosResponse): _121.CosmosResponseProtoMsg;
        };
        Params: {
            typeUrl: string;
            encode(message: _120.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _120.Params;
            fromJSON(object: any): _120.Params;
            toJSON(message: _120.Params): import("../json-safe.js").JsonSafe<_120.Params>;
            fromPartial(object: Partial<_120.Params>): _120.Params;
            fromProtoMsg(message: _120.ParamsProtoMsg): _120.Params;
            toProto(message: _120.Params): Uint8Array;
            toProtoMsg(message: _120.Params): _120.ParamsProtoMsg;
        };
        GenesisState: {
            typeUrl: string;
            encode(message: _119.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _119.GenesisState;
            fromJSON(object: any): _119.GenesisState;
            toJSON(message: _119.GenesisState): import("../json-safe.js").JsonSafe<_119.GenesisState>;
            fromPartial(object: Partial<_119.GenesisState>): _119.GenesisState;
            fromProtoMsg(message: _119.GenesisStateProtoMsg): _119.GenesisState;
            toProto(message: _119.GenesisState): Uint8Array;
            toProtoMsg(message: _119.GenesisState): _119.GenesisStateProtoMsg;
        };
    };
}
