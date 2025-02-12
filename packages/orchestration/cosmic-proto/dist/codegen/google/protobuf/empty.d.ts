import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * A generic empty message that you can re-use to avoid defining duplicated
 * empty messages in your APIs. A typical example is to use it as the request
 * or the response type of an API method. For instance:
 *
 *     service Foo {
 *       rpc Bar(google.protobuf.Empty) returns (google.protobuf.Empty);
 *     }
 *
 * The JSON representation for `Empty` is empty JSON object `{}`.
 */
export interface Empty {
}
export interface EmptyProtoMsg {
    typeUrl: '/google.protobuf.Empty';
    value: Uint8Array;
}
/**
 * A generic empty message that you can re-use to avoid defining duplicated
 * empty messages in your APIs. A typical example is to use it as the request
 * or the response type of an API method. For instance:
 *
 *     service Foo {
 *       rpc Bar(google.protobuf.Empty) returns (google.protobuf.Empty);
 *     }
 *
 * The JSON representation for `Empty` is empty JSON object `{}`.
 */
export interface EmptySDKType {
}
export declare const Empty: {
    typeUrl: string;
    encode(_: Empty, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Empty;
    fromJSON(_: any): Empty;
    toJSON(_: Empty): JsonSafe<Empty>;
    fromPartial(_: Partial<Empty>): Empty;
    fromProtoMsg(message: EmptyProtoMsg): Empty;
    toProto(message: Empty): Uint8Array;
    toProtoMsg(message: Empty): EmptyProtoMsg;
};
