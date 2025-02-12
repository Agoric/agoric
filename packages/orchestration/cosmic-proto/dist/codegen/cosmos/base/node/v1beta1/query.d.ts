import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** ConfigRequest defines the request structure for the Config gRPC query. */
export interface ConfigRequest {
}
export interface ConfigRequestProtoMsg {
    typeUrl: '/cosmos.base.node.v1beta1.ConfigRequest';
    value: Uint8Array;
}
/** ConfigRequest defines the request structure for the Config gRPC query. */
export interface ConfigRequestSDKType {
}
/** ConfigResponse defines the response structure for the Config gRPC query. */
export interface ConfigResponse {
    minimumGasPrice: string;
}
export interface ConfigResponseProtoMsg {
    typeUrl: '/cosmos.base.node.v1beta1.ConfigResponse';
    value: Uint8Array;
}
/** ConfigResponse defines the response structure for the Config gRPC query. */
export interface ConfigResponseSDKType {
    minimum_gas_price: string;
}
export declare const ConfigRequest: {
    typeUrl: string;
    encode(_: ConfigRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConfigRequest;
    fromJSON(_: any): ConfigRequest;
    toJSON(_: ConfigRequest): JsonSafe<ConfigRequest>;
    fromPartial(_: Partial<ConfigRequest>): ConfigRequest;
    fromProtoMsg(message: ConfigRequestProtoMsg): ConfigRequest;
    toProto(message: ConfigRequest): Uint8Array;
    toProtoMsg(message: ConfigRequest): ConfigRequestProtoMsg;
};
export declare const ConfigResponse: {
    typeUrl: string;
    encode(message: ConfigResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConfigResponse;
    fromJSON(object: any): ConfigResponse;
    toJSON(message: ConfigResponse): JsonSafe<ConfigResponse>;
    fromPartial(object: Partial<ConfigResponse>): ConfigResponse;
    fromProtoMsg(message: ConfigResponseProtoMsg): ConfigResponse;
    toProto(message: ConfigResponse): Uint8Array;
    toProtoMsg(message: ConfigResponse): ConfigResponseProtoMsg;
};
