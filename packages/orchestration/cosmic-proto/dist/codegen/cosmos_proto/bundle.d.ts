import * as _17 from './cosmos.js';
export declare const cosmos_proto: {
    scalarTypeFromJSON(object: any): _17.ScalarType;
    scalarTypeToJSON(object: _17.ScalarType): string;
    ScalarType: typeof _17.ScalarType;
    ScalarTypeSDKType: typeof _17.ScalarType;
    InterfaceDescriptor: {
        typeUrl: string;
        encode(message: _17.InterfaceDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _17.InterfaceDescriptor;
        fromJSON(object: any): _17.InterfaceDescriptor;
        toJSON(message: _17.InterfaceDescriptor): import("../json-safe.js").JsonSafe<_17.InterfaceDescriptor>;
        fromPartial(object: Partial<_17.InterfaceDescriptor>): _17.InterfaceDescriptor;
        fromProtoMsg(message: _17.InterfaceDescriptorProtoMsg): _17.InterfaceDescriptor;
        toProto(message: _17.InterfaceDescriptor): Uint8Array;
        toProtoMsg(message: _17.InterfaceDescriptor): _17.InterfaceDescriptorProtoMsg;
    };
    ScalarDescriptor: {
        typeUrl: string;
        encode(message: _17.ScalarDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _17.ScalarDescriptor;
        fromJSON(object: any): _17.ScalarDescriptor;
        toJSON(message: _17.ScalarDescriptor): import("../json-safe.js").JsonSafe<_17.ScalarDescriptor>;
        fromPartial(object: Partial<_17.ScalarDescriptor>): _17.ScalarDescriptor;
        fromProtoMsg(message: _17.ScalarDescriptorProtoMsg): _17.ScalarDescriptor;
        toProto(message: _17.ScalarDescriptor): Uint8Array;
        toProtoMsg(message: _17.ScalarDescriptor): _17.ScalarDescriptorProtoMsg;
    };
};
