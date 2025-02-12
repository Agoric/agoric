//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
export var FieldDescriptorProto_Type;
(function (FieldDescriptorProto_Type) {
    /**
     * TYPE_DOUBLE - 0 is reserved for errors.
     * Order is weird for historical reasons.
     */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_DOUBLE"] = 1] = "TYPE_DOUBLE";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_FLOAT"] = 2] = "TYPE_FLOAT";
    /**
     * TYPE_INT64 - Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT64 if
     * negative values are likely.
     */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_INT64"] = 3] = "TYPE_INT64";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_UINT64"] = 4] = "TYPE_UINT64";
    /**
     * TYPE_INT32 - Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT32 if
     * negative values are likely.
     */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_INT32"] = 5] = "TYPE_INT32";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_FIXED64"] = 6] = "TYPE_FIXED64";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_FIXED32"] = 7] = "TYPE_FIXED32";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_BOOL"] = 8] = "TYPE_BOOL";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_STRING"] = 9] = "TYPE_STRING";
    /**
     * TYPE_GROUP - Tag-delimited aggregate.
     * Group type is deprecated and not supported in proto3. However, Proto3
     * implementations should still be able to parse the group wire format and
     * treat group fields as unknown fields.
     */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_GROUP"] = 10] = "TYPE_GROUP";
    /** TYPE_MESSAGE - Length-delimited aggregate. */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_MESSAGE"] = 11] = "TYPE_MESSAGE";
    /** TYPE_BYTES - New in version 2. */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_BYTES"] = 12] = "TYPE_BYTES";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_UINT32"] = 13] = "TYPE_UINT32";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_ENUM"] = 14] = "TYPE_ENUM";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_SFIXED32"] = 15] = "TYPE_SFIXED32";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_SFIXED64"] = 16] = "TYPE_SFIXED64";
    /** TYPE_SINT32 - Uses ZigZag encoding. */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_SINT32"] = 17] = "TYPE_SINT32";
    /** TYPE_SINT64 - Uses ZigZag encoding. */
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["TYPE_SINT64"] = 18] = "TYPE_SINT64";
    FieldDescriptorProto_Type[FieldDescriptorProto_Type["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FieldDescriptorProto_Type || (FieldDescriptorProto_Type = {}));
export const FieldDescriptorProto_TypeSDKType = FieldDescriptorProto_Type;
export function fieldDescriptorProto_TypeFromJSON(object) {
    switch (object) {
        case 1:
        case 'TYPE_DOUBLE':
            return FieldDescriptorProto_Type.TYPE_DOUBLE;
        case 2:
        case 'TYPE_FLOAT':
            return FieldDescriptorProto_Type.TYPE_FLOAT;
        case 3:
        case 'TYPE_INT64':
            return FieldDescriptorProto_Type.TYPE_INT64;
        case 4:
        case 'TYPE_UINT64':
            return FieldDescriptorProto_Type.TYPE_UINT64;
        case 5:
        case 'TYPE_INT32':
            return FieldDescriptorProto_Type.TYPE_INT32;
        case 6:
        case 'TYPE_FIXED64':
            return FieldDescriptorProto_Type.TYPE_FIXED64;
        case 7:
        case 'TYPE_FIXED32':
            return FieldDescriptorProto_Type.TYPE_FIXED32;
        case 8:
        case 'TYPE_BOOL':
            return FieldDescriptorProto_Type.TYPE_BOOL;
        case 9:
        case 'TYPE_STRING':
            return FieldDescriptorProto_Type.TYPE_STRING;
        case 10:
        case 'TYPE_GROUP':
            return FieldDescriptorProto_Type.TYPE_GROUP;
        case 11:
        case 'TYPE_MESSAGE':
            return FieldDescriptorProto_Type.TYPE_MESSAGE;
        case 12:
        case 'TYPE_BYTES':
            return FieldDescriptorProto_Type.TYPE_BYTES;
        case 13:
        case 'TYPE_UINT32':
            return FieldDescriptorProto_Type.TYPE_UINT32;
        case 14:
        case 'TYPE_ENUM':
            return FieldDescriptorProto_Type.TYPE_ENUM;
        case 15:
        case 'TYPE_SFIXED32':
            return FieldDescriptorProto_Type.TYPE_SFIXED32;
        case 16:
        case 'TYPE_SFIXED64':
            return FieldDescriptorProto_Type.TYPE_SFIXED64;
        case 17:
        case 'TYPE_SINT32':
            return FieldDescriptorProto_Type.TYPE_SINT32;
        case 18:
        case 'TYPE_SINT64':
            return FieldDescriptorProto_Type.TYPE_SINT64;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FieldDescriptorProto_Type.UNRECOGNIZED;
    }
}
export function fieldDescriptorProto_TypeToJSON(object) {
    switch (object) {
        case FieldDescriptorProto_Type.TYPE_DOUBLE:
            return 'TYPE_DOUBLE';
        case FieldDescriptorProto_Type.TYPE_FLOAT:
            return 'TYPE_FLOAT';
        case FieldDescriptorProto_Type.TYPE_INT64:
            return 'TYPE_INT64';
        case FieldDescriptorProto_Type.TYPE_UINT64:
            return 'TYPE_UINT64';
        case FieldDescriptorProto_Type.TYPE_INT32:
            return 'TYPE_INT32';
        case FieldDescriptorProto_Type.TYPE_FIXED64:
            return 'TYPE_FIXED64';
        case FieldDescriptorProto_Type.TYPE_FIXED32:
            return 'TYPE_FIXED32';
        case FieldDescriptorProto_Type.TYPE_BOOL:
            return 'TYPE_BOOL';
        case FieldDescriptorProto_Type.TYPE_STRING:
            return 'TYPE_STRING';
        case FieldDescriptorProto_Type.TYPE_GROUP:
            return 'TYPE_GROUP';
        case FieldDescriptorProto_Type.TYPE_MESSAGE:
            return 'TYPE_MESSAGE';
        case FieldDescriptorProto_Type.TYPE_BYTES:
            return 'TYPE_BYTES';
        case FieldDescriptorProto_Type.TYPE_UINT32:
            return 'TYPE_UINT32';
        case FieldDescriptorProto_Type.TYPE_ENUM:
            return 'TYPE_ENUM';
        case FieldDescriptorProto_Type.TYPE_SFIXED32:
            return 'TYPE_SFIXED32';
        case FieldDescriptorProto_Type.TYPE_SFIXED64:
            return 'TYPE_SFIXED64';
        case FieldDescriptorProto_Type.TYPE_SINT32:
            return 'TYPE_SINT32';
        case FieldDescriptorProto_Type.TYPE_SINT64:
            return 'TYPE_SINT64';
        case FieldDescriptorProto_Type.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var FieldDescriptorProto_Label;
(function (FieldDescriptorProto_Label) {
    /** LABEL_OPTIONAL - 0 is reserved for errors */
    FieldDescriptorProto_Label[FieldDescriptorProto_Label["LABEL_OPTIONAL"] = 1] = "LABEL_OPTIONAL";
    FieldDescriptorProto_Label[FieldDescriptorProto_Label["LABEL_REQUIRED"] = 2] = "LABEL_REQUIRED";
    FieldDescriptorProto_Label[FieldDescriptorProto_Label["LABEL_REPEATED"] = 3] = "LABEL_REPEATED";
    FieldDescriptorProto_Label[FieldDescriptorProto_Label["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FieldDescriptorProto_Label || (FieldDescriptorProto_Label = {}));
export const FieldDescriptorProto_LabelSDKType = FieldDescriptorProto_Label;
export function fieldDescriptorProto_LabelFromJSON(object) {
    switch (object) {
        case 1:
        case 'LABEL_OPTIONAL':
            return FieldDescriptorProto_Label.LABEL_OPTIONAL;
        case 2:
        case 'LABEL_REQUIRED':
            return FieldDescriptorProto_Label.LABEL_REQUIRED;
        case 3:
        case 'LABEL_REPEATED':
            return FieldDescriptorProto_Label.LABEL_REPEATED;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FieldDescriptorProto_Label.UNRECOGNIZED;
    }
}
export function fieldDescriptorProto_LabelToJSON(object) {
    switch (object) {
        case FieldDescriptorProto_Label.LABEL_OPTIONAL:
            return 'LABEL_OPTIONAL';
        case FieldDescriptorProto_Label.LABEL_REQUIRED:
            return 'LABEL_REQUIRED';
        case FieldDescriptorProto_Label.LABEL_REPEATED:
            return 'LABEL_REPEATED';
        case FieldDescriptorProto_Label.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** Generated classes can be optimized for speed or code size. */
export var FileOptions_OptimizeMode;
(function (FileOptions_OptimizeMode) {
    /** SPEED - Generate complete code for parsing, serialization, */
    FileOptions_OptimizeMode[FileOptions_OptimizeMode["SPEED"] = 1] = "SPEED";
    /** CODE_SIZE - etc. */
    FileOptions_OptimizeMode[FileOptions_OptimizeMode["CODE_SIZE"] = 2] = "CODE_SIZE";
    /** LITE_RUNTIME - Generate code using MessageLite and the lite runtime. */
    FileOptions_OptimizeMode[FileOptions_OptimizeMode["LITE_RUNTIME"] = 3] = "LITE_RUNTIME";
    FileOptions_OptimizeMode[FileOptions_OptimizeMode["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FileOptions_OptimizeMode || (FileOptions_OptimizeMode = {}));
export const FileOptions_OptimizeModeSDKType = FileOptions_OptimizeMode;
export function fileOptions_OptimizeModeFromJSON(object) {
    switch (object) {
        case 1:
        case 'SPEED':
            return FileOptions_OptimizeMode.SPEED;
        case 2:
        case 'CODE_SIZE':
            return FileOptions_OptimizeMode.CODE_SIZE;
        case 3:
        case 'LITE_RUNTIME':
            return FileOptions_OptimizeMode.LITE_RUNTIME;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FileOptions_OptimizeMode.UNRECOGNIZED;
    }
}
export function fileOptions_OptimizeModeToJSON(object) {
    switch (object) {
        case FileOptions_OptimizeMode.SPEED:
            return 'SPEED';
        case FileOptions_OptimizeMode.CODE_SIZE:
            return 'CODE_SIZE';
        case FileOptions_OptimizeMode.LITE_RUNTIME:
            return 'LITE_RUNTIME';
        case FileOptions_OptimizeMode.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var FieldOptions_CType;
(function (FieldOptions_CType) {
    /** STRING - Default mode. */
    FieldOptions_CType[FieldOptions_CType["STRING"] = 0] = "STRING";
    FieldOptions_CType[FieldOptions_CType["CORD"] = 1] = "CORD";
    FieldOptions_CType[FieldOptions_CType["STRING_PIECE"] = 2] = "STRING_PIECE";
    FieldOptions_CType[FieldOptions_CType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FieldOptions_CType || (FieldOptions_CType = {}));
export const FieldOptions_CTypeSDKType = FieldOptions_CType;
export function fieldOptions_CTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'STRING':
            return FieldOptions_CType.STRING;
        case 1:
        case 'CORD':
            return FieldOptions_CType.CORD;
        case 2:
        case 'STRING_PIECE':
            return FieldOptions_CType.STRING_PIECE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FieldOptions_CType.UNRECOGNIZED;
    }
}
export function fieldOptions_CTypeToJSON(object) {
    switch (object) {
        case FieldOptions_CType.STRING:
            return 'STRING';
        case FieldOptions_CType.CORD:
            return 'CORD';
        case FieldOptions_CType.STRING_PIECE:
            return 'STRING_PIECE';
        case FieldOptions_CType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var FieldOptions_JSType;
(function (FieldOptions_JSType) {
    /** JS_NORMAL - Use the default type. */
    FieldOptions_JSType[FieldOptions_JSType["JS_NORMAL"] = 0] = "JS_NORMAL";
    /** JS_STRING - Use JavaScript strings. */
    FieldOptions_JSType[FieldOptions_JSType["JS_STRING"] = 1] = "JS_STRING";
    /** JS_NUMBER - Use JavaScript numbers. */
    FieldOptions_JSType[FieldOptions_JSType["JS_NUMBER"] = 2] = "JS_NUMBER";
    FieldOptions_JSType[FieldOptions_JSType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FieldOptions_JSType || (FieldOptions_JSType = {}));
export const FieldOptions_JSTypeSDKType = FieldOptions_JSType;
export function fieldOptions_JSTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'JS_NORMAL':
            return FieldOptions_JSType.JS_NORMAL;
        case 1:
        case 'JS_STRING':
            return FieldOptions_JSType.JS_STRING;
        case 2:
        case 'JS_NUMBER':
            return FieldOptions_JSType.JS_NUMBER;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return FieldOptions_JSType.UNRECOGNIZED;
    }
}
export function fieldOptions_JSTypeToJSON(object) {
    switch (object) {
        case FieldOptions_JSType.JS_NORMAL:
            return 'JS_NORMAL';
        case FieldOptions_JSType.JS_STRING:
            return 'JS_STRING';
        case FieldOptions_JSType.JS_NUMBER:
            return 'JS_NUMBER';
        case FieldOptions_JSType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/**
 * Is this method side-effect-free (or safe in HTTP parlance), or idempotent,
 * or neither? HTTP based RPC implementation may choose GET verb for safe
 * methods, and PUT verb for idempotent methods instead of the default POST.
 */
export var MethodOptions_IdempotencyLevel;
(function (MethodOptions_IdempotencyLevel) {
    MethodOptions_IdempotencyLevel[MethodOptions_IdempotencyLevel["IDEMPOTENCY_UNKNOWN"] = 0] = "IDEMPOTENCY_UNKNOWN";
    /** NO_SIDE_EFFECTS - implies idempotent */
    MethodOptions_IdempotencyLevel[MethodOptions_IdempotencyLevel["NO_SIDE_EFFECTS"] = 1] = "NO_SIDE_EFFECTS";
    /** IDEMPOTENT - idempotent, but may have side effects */
    MethodOptions_IdempotencyLevel[MethodOptions_IdempotencyLevel["IDEMPOTENT"] = 2] = "IDEMPOTENT";
    MethodOptions_IdempotencyLevel[MethodOptions_IdempotencyLevel["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(MethodOptions_IdempotencyLevel || (MethodOptions_IdempotencyLevel = {}));
export const MethodOptions_IdempotencyLevelSDKType = MethodOptions_IdempotencyLevel;
export function methodOptions_IdempotencyLevelFromJSON(object) {
    switch (object) {
        case 0:
        case 'IDEMPOTENCY_UNKNOWN':
            return MethodOptions_IdempotencyLevel.IDEMPOTENCY_UNKNOWN;
        case 1:
        case 'NO_SIDE_EFFECTS':
            return MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS;
        case 2:
        case 'IDEMPOTENT':
            return MethodOptions_IdempotencyLevel.IDEMPOTENT;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return MethodOptions_IdempotencyLevel.UNRECOGNIZED;
    }
}
export function methodOptions_IdempotencyLevelToJSON(object) {
    switch (object) {
        case MethodOptions_IdempotencyLevel.IDEMPOTENCY_UNKNOWN:
            return 'IDEMPOTENCY_UNKNOWN';
        case MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS:
            return 'NO_SIDE_EFFECTS';
        case MethodOptions_IdempotencyLevel.IDEMPOTENT:
            return 'IDEMPOTENT';
        case MethodOptions_IdempotencyLevel.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseFileDescriptorSet() {
    return {
        file: [],
    };
}
export const FileDescriptorSet = {
    typeUrl: '/google.protobuf.FileDescriptorSet',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.file) {
            FileDescriptorProto.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFileDescriptorSet();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.file.push(FileDescriptorProto.decode(reader, reader.uint32()));
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
            file: Array.isArray(object?.file)
                ? object.file.map((e) => FileDescriptorProto.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.file) {
            obj.file = message.file.map(e => e ? FileDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.file = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFileDescriptorSet();
        message.file =
            object.file?.map(e => FileDescriptorProto.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return FileDescriptorSet.decode(message.value);
    },
    toProto(message) {
        return FileDescriptorSet.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.FileDescriptorSet',
            value: FileDescriptorSet.encode(message).finish(),
        };
    },
};
function createBaseFileDescriptorProto() {
    return {
        name: '',
        package: '',
        dependency: [],
        publicDependency: [],
        weakDependency: [],
        messageType: [],
        enumType: [],
        service: [],
        extension: [],
        options: undefined,
        sourceCodeInfo: undefined,
        syntax: '',
    };
}
export const FileDescriptorProto = {
    typeUrl: '/google.protobuf.FileDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.package !== '') {
            writer.uint32(18).string(message.package);
        }
        for (const v of message.dependency) {
            writer.uint32(26).string(v);
        }
        writer.uint32(82).fork();
        for (const v of message.publicDependency) {
            writer.int32(v);
        }
        writer.ldelim();
        writer.uint32(90).fork();
        for (const v of message.weakDependency) {
            writer.int32(v);
        }
        writer.ldelim();
        for (const v of message.messageType) {
            DescriptorProto.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.enumType) {
            EnumDescriptorProto.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.service) {
            ServiceDescriptorProto.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.extension) {
            FieldDescriptorProto.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.options !== undefined) {
            FileOptions.encode(message.options, writer.uint32(66).fork()).ldelim();
        }
        if (message.sourceCodeInfo !== undefined) {
            SourceCodeInfo.encode(message.sourceCodeInfo, writer.uint32(74).fork()).ldelim();
        }
        if (message.syntax !== '') {
            writer.uint32(98).string(message.syntax);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFileDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.package = reader.string();
                    break;
                case 3:
                    message.dependency.push(reader.string());
                    break;
                case 10:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.publicDependency.push(reader.int32());
                        }
                    }
                    else {
                        message.publicDependency.push(reader.int32());
                    }
                    break;
                case 11:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.weakDependency.push(reader.int32());
                        }
                    }
                    else {
                        message.weakDependency.push(reader.int32());
                    }
                    break;
                case 4:
                    message.messageType.push(DescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.enumType.push(EnumDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.service.push(ServiceDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.extension.push(FieldDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.options = FileOptions.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.sourceCodeInfo = SourceCodeInfo.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.syntax = reader.string();
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
            name: isSet(object.name) ? String(object.name) : '',
            package: isSet(object.package) ? String(object.package) : '',
            dependency: Array.isArray(object?.dependency)
                ? object.dependency.map((e) => String(e))
                : [],
            publicDependency: Array.isArray(object?.publicDependency)
                ? object.publicDependency.map((e) => Number(e))
                : [],
            weakDependency: Array.isArray(object?.weakDependency)
                ? object.weakDependency.map((e) => Number(e))
                : [],
            messageType: Array.isArray(object?.messageType)
                ? object.messageType.map((e) => DescriptorProto.fromJSON(e))
                : [],
            enumType: Array.isArray(object?.enumType)
                ? object.enumType.map((e) => EnumDescriptorProto.fromJSON(e))
                : [],
            service: Array.isArray(object?.service)
                ? object.service.map((e) => ServiceDescriptorProto.fromJSON(e))
                : [],
            extension: Array.isArray(object?.extension)
                ? object.extension.map((e) => FieldDescriptorProto.fromJSON(e))
                : [],
            options: isSet(object.options)
                ? FileOptions.fromJSON(object.options)
                : undefined,
            sourceCodeInfo: isSet(object.sourceCodeInfo)
                ? SourceCodeInfo.fromJSON(object.sourceCodeInfo)
                : undefined,
            syntax: isSet(object.syntax) ? String(object.syntax) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.package !== undefined && (obj.package = message.package);
        if (message.dependency) {
            obj.dependency = message.dependency.map(e => e);
        }
        else {
            obj.dependency = [];
        }
        if (message.publicDependency) {
            obj.publicDependency = message.publicDependency.map(e => Math.round(e));
        }
        else {
            obj.publicDependency = [];
        }
        if (message.weakDependency) {
            obj.weakDependency = message.weakDependency.map(e => Math.round(e));
        }
        else {
            obj.weakDependency = [];
        }
        if (message.messageType) {
            obj.messageType = message.messageType.map(e => e ? DescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.messageType = [];
        }
        if (message.enumType) {
            obj.enumType = message.enumType.map(e => e ? EnumDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.enumType = [];
        }
        if (message.service) {
            obj.service = message.service.map(e => e ? ServiceDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.service = [];
        }
        if (message.extension) {
            obj.extension = message.extension.map(e => e ? FieldDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.extension = [];
        }
        message.options !== undefined &&
            (obj.options = message.options
                ? FileOptions.toJSON(message.options)
                : undefined);
        message.sourceCodeInfo !== undefined &&
            (obj.sourceCodeInfo = message.sourceCodeInfo
                ? SourceCodeInfo.toJSON(message.sourceCodeInfo)
                : undefined);
        message.syntax !== undefined && (obj.syntax = message.syntax);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFileDescriptorProto();
        message.name = object.name ?? '';
        message.package = object.package ?? '';
        message.dependency = object.dependency?.map(e => e) || [];
        message.publicDependency = object.publicDependency?.map(e => e) || [];
        message.weakDependency = object.weakDependency?.map(e => e) || [];
        message.messageType =
            object.messageType?.map(e => DescriptorProto.fromPartial(e)) || [];
        message.enumType =
            object.enumType?.map(e => EnumDescriptorProto.fromPartial(e)) || [];
        message.service =
            object.service?.map(e => ServiceDescriptorProto.fromPartial(e)) || [];
        message.extension =
            object.extension?.map(e => FieldDescriptorProto.fromPartial(e)) || [];
        message.options =
            object.options !== undefined && object.options !== null
                ? FileOptions.fromPartial(object.options)
                : undefined;
        message.sourceCodeInfo =
            object.sourceCodeInfo !== undefined && object.sourceCodeInfo !== null
                ? SourceCodeInfo.fromPartial(object.sourceCodeInfo)
                : undefined;
        message.syntax = object.syntax ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return FileDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return FileDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.FileDescriptorProto',
            value: FileDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseDescriptorProto() {
    return {
        name: '',
        field: [],
        extension: [],
        nestedType: [],
        enumType: [],
        extensionRange: [],
        oneofDecl: [],
        options: undefined,
        reservedRange: [],
        reservedName: [],
    };
}
export const DescriptorProto = {
    typeUrl: '/google.protobuf.DescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        for (const v of message.field) {
            FieldDescriptorProto.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.extension) {
            FieldDescriptorProto.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.nestedType) {
            DescriptorProto.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.enumType) {
            EnumDescriptorProto.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.extensionRange) {
            DescriptorProto_ExtensionRange.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.oneofDecl) {
            OneofDescriptorProto.encode(v, writer.uint32(66).fork()).ldelim();
        }
        if (message.options !== undefined) {
            MessageOptions.encode(message.options, writer.uint32(58).fork()).ldelim();
        }
        for (const v of message.reservedRange) {
            DescriptorProto_ReservedRange.encode(v, writer.uint32(74).fork()).ldelim();
        }
        for (const v of message.reservedName) {
            writer.uint32(82).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.field.push(FieldDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.extension.push(FieldDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.nestedType.push(DescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.enumType.push(EnumDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.extensionRange.push(DescriptorProto_ExtensionRange.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.oneofDecl.push(OneofDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.options = MessageOptions.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.reservedRange.push(DescriptorProto_ReservedRange.decode(reader, reader.uint32()));
                    break;
                case 10:
                    message.reservedName.push(reader.string());
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
            name: isSet(object.name) ? String(object.name) : '',
            field: Array.isArray(object?.field)
                ? object.field.map((e) => FieldDescriptorProto.fromJSON(e))
                : [],
            extension: Array.isArray(object?.extension)
                ? object.extension.map((e) => FieldDescriptorProto.fromJSON(e))
                : [],
            nestedType: Array.isArray(object?.nestedType)
                ? object.nestedType.map((e) => DescriptorProto.fromJSON(e))
                : [],
            enumType: Array.isArray(object?.enumType)
                ? object.enumType.map((e) => EnumDescriptorProto.fromJSON(e))
                : [],
            extensionRange: Array.isArray(object?.extensionRange)
                ? object.extensionRange.map((e) => DescriptorProto_ExtensionRange.fromJSON(e))
                : [],
            oneofDecl: Array.isArray(object?.oneofDecl)
                ? object.oneofDecl.map((e) => OneofDescriptorProto.fromJSON(e))
                : [],
            options: isSet(object.options)
                ? MessageOptions.fromJSON(object.options)
                : undefined,
            reservedRange: Array.isArray(object?.reservedRange)
                ? object.reservedRange.map((e) => DescriptorProto_ReservedRange.fromJSON(e))
                : [],
            reservedName: Array.isArray(object?.reservedName)
                ? object.reservedName.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        if (message.field) {
            obj.field = message.field.map(e => e ? FieldDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.field = [];
        }
        if (message.extension) {
            obj.extension = message.extension.map(e => e ? FieldDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.extension = [];
        }
        if (message.nestedType) {
            obj.nestedType = message.nestedType.map(e => e ? DescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.nestedType = [];
        }
        if (message.enumType) {
            obj.enumType = message.enumType.map(e => e ? EnumDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.enumType = [];
        }
        if (message.extensionRange) {
            obj.extensionRange = message.extensionRange.map(e => e ? DescriptorProto_ExtensionRange.toJSON(e) : undefined);
        }
        else {
            obj.extensionRange = [];
        }
        if (message.oneofDecl) {
            obj.oneofDecl = message.oneofDecl.map(e => e ? OneofDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.oneofDecl = [];
        }
        message.options !== undefined &&
            (obj.options = message.options
                ? MessageOptions.toJSON(message.options)
                : undefined);
        if (message.reservedRange) {
            obj.reservedRange = message.reservedRange.map(e => e ? DescriptorProto_ReservedRange.toJSON(e) : undefined);
        }
        else {
            obj.reservedRange = [];
        }
        if (message.reservedName) {
            obj.reservedName = message.reservedName.map(e => e);
        }
        else {
            obj.reservedName = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDescriptorProto();
        message.name = object.name ?? '';
        message.field =
            object.field?.map(e => FieldDescriptorProto.fromPartial(e)) || [];
        message.extension =
            object.extension?.map(e => FieldDescriptorProto.fromPartial(e)) || [];
        message.nestedType =
            object.nestedType?.map(e => DescriptorProto.fromPartial(e)) || [];
        message.enumType =
            object.enumType?.map(e => EnumDescriptorProto.fromPartial(e)) || [];
        message.extensionRange =
            object.extensionRange?.map(e => DescriptorProto_ExtensionRange.fromPartial(e)) || [];
        message.oneofDecl =
            object.oneofDecl?.map(e => OneofDescriptorProto.fromPartial(e)) || [];
        message.options =
            object.options !== undefined && object.options !== null
                ? MessageOptions.fromPartial(object.options)
                : undefined;
        message.reservedRange =
            object.reservedRange?.map(e => DescriptorProto_ReservedRange.fromPartial(e)) || [];
        message.reservedName = object.reservedName?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return DescriptorProto.decode(message.value);
    },
    toProto(message) {
        return DescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.DescriptorProto',
            value: DescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseDescriptorProto_ExtensionRange() {
    return {
        start: 0,
        end: 0,
        options: undefined,
    };
}
export const DescriptorProto_ExtensionRange = {
    typeUrl: '/google.protobuf.ExtensionRange',
    encode(message, writer = BinaryWriter.create()) {
        if (message.start !== 0) {
            writer.uint32(8).int32(message.start);
        }
        if (message.end !== 0) {
            writer.uint32(16).int32(message.end);
        }
        if (message.options !== undefined) {
            ExtensionRangeOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDescriptorProto_ExtensionRange();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.start = reader.int32();
                    break;
                case 2:
                    message.end = reader.int32();
                    break;
                case 3:
                    message.options = ExtensionRangeOptions.decode(reader, reader.uint32());
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
            start: isSet(object.start) ? Number(object.start) : 0,
            end: isSet(object.end) ? Number(object.end) : 0,
            options: isSet(object.options)
                ? ExtensionRangeOptions.fromJSON(object.options)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.start !== undefined && (obj.start = Math.round(message.start));
        message.end !== undefined && (obj.end = Math.round(message.end));
        message.options !== undefined &&
            (obj.options = message.options
                ? ExtensionRangeOptions.toJSON(message.options)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDescriptorProto_ExtensionRange();
        message.start = object.start ?? 0;
        message.end = object.end ?? 0;
        message.options =
            object.options !== undefined && object.options !== null
                ? ExtensionRangeOptions.fromPartial(object.options)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DescriptorProto_ExtensionRange.decode(message.value);
    },
    toProto(message) {
        return DescriptorProto_ExtensionRange.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.ExtensionRange',
            value: DescriptorProto_ExtensionRange.encode(message).finish(),
        };
    },
};
function createBaseDescriptorProto_ReservedRange() {
    return {
        start: 0,
        end: 0,
    };
}
export const DescriptorProto_ReservedRange = {
    typeUrl: '/google.protobuf.ReservedRange',
    encode(message, writer = BinaryWriter.create()) {
        if (message.start !== 0) {
            writer.uint32(8).int32(message.start);
        }
        if (message.end !== 0) {
            writer.uint32(16).int32(message.end);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDescriptorProto_ReservedRange();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.start = reader.int32();
                    break;
                case 2:
                    message.end = reader.int32();
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
            start: isSet(object.start) ? Number(object.start) : 0,
            end: isSet(object.end) ? Number(object.end) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.start !== undefined && (obj.start = Math.round(message.start));
        message.end !== undefined && (obj.end = Math.round(message.end));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDescriptorProto_ReservedRange();
        message.start = object.start ?? 0;
        message.end = object.end ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return DescriptorProto_ReservedRange.decode(message.value);
    },
    toProto(message) {
        return DescriptorProto_ReservedRange.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.ReservedRange',
            value: DescriptorProto_ReservedRange.encode(message).finish(),
        };
    },
};
function createBaseExtensionRangeOptions() {
    return {
        uninterpretedOption: [],
    };
}
export const ExtensionRangeOptions = {
    typeUrl: '/google.protobuf.ExtensionRangeOptions',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseExtensionRangeOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseExtensionRangeOptions();
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ExtensionRangeOptions.decode(message.value);
    },
    toProto(message) {
        return ExtensionRangeOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.ExtensionRangeOptions',
            value: ExtensionRangeOptions.encode(message).finish(),
        };
    },
};
function createBaseFieldDescriptorProto() {
    return {
        name: '',
        number: 0,
        label: 1,
        type: 1,
        typeName: '',
        extendee: '',
        defaultValue: '',
        oneofIndex: 0,
        jsonName: '',
        options: undefined,
    };
}
export const FieldDescriptorProto = {
    typeUrl: '/google.protobuf.FieldDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.number !== 0) {
            writer.uint32(24).int32(message.number);
        }
        if (message.label !== 1) {
            writer.uint32(32).int32(message.label);
        }
        if (message.type !== 1) {
            writer.uint32(40).int32(message.type);
        }
        if (message.typeName !== '') {
            writer.uint32(50).string(message.typeName);
        }
        if (message.extendee !== '') {
            writer.uint32(18).string(message.extendee);
        }
        if (message.defaultValue !== '') {
            writer.uint32(58).string(message.defaultValue);
        }
        if (message.oneofIndex !== 0) {
            writer.uint32(72).int32(message.oneofIndex);
        }
        if (message.jsonName !== '') {
            writer.uint32(82).string(message.jsonName);
        }
        if (message.options !== undefined) {
            FieldOptions.encode(message.options, writer.uint32(66).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFieldDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 3:
                    message.number = reader.int32();
                    break;
                case 4:
                    message.label = reader.int32();
                    break;
                case 5:
                    message.type = reader.int32();
                    break;
                case 6:
                    message.typeName = reader.string();
                    break;
                case 2:
                    message.extendee = reader.string();
                    break;
                case 7:
                    message.defaultValue = reader.string();
                    break;
                case 9:
                    message.oneofIndex = reader.int32();
                    break;
                case 10:
                    message.jsonName = reader.string();
                    break;
                case 8:
                    message.options = FieldOptions.decode(reader, reader.uint32());
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
            name: isSet(object.name) ? String(object.name) : '',
            number: isSet(object.number) ? Number(object.number) : 0,
            label: isSet(object.label)
                ? fieldDescriptorProto_LabelFromJSON(object.label)
                : -1,
            type: isSet(object.type)
                ? fieldDescriptorProto_TypeFromJSON(object.type)
                : -1,
            typeName: isSet(object.typeName) ? String(object.typeName) : '',
            extendee: isSet(object.extendee) ? String(object.extendee) : '',
            defaultValue: isSet(object.defaultValue)
                ? String(object.defaultValue)
                : '',
            oneofIndex: isSet(object.oneofIndex) ? Number(object.oneofIndex) : 0,
            jsonName: isSet(object.jsonName) ? String(object.jsonName) : '',
            options: isSet(object.options)
                ? FieldOptions.fromJSON(object.options)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.number !== undefined && (obj.number = Math.round(message.number));
        message.label !== undefined &&
            (obj.label = fieldDescriptorProto_LabelToJSON(message.label));
        message.type !== undefined &&
            (obj.type = fieldDescriptorProto_TypeToJSON(message.type));
        message.typeName !== undefined && (obj.typeName = message.typeName);
        message.extendee !== undefined && (obj.extendee = message.extendee);
        message.defaultValue !== undefined &&
            (obj.defaultValue = message.defaultValue);
        message.oneofIndex !== undefined &&
            (obj.oneofIndex = Math.round(message.oneofIndex));
        message.jsonName !== undefined && (obj.jsonName = message.jsonName);
        message.options !== undefined &&
            (obj.options = message.options
                ? FieldOptions.toJSON(message.options)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFieldDescriptorProto();
        message.name = object.name ?? '';
        message.number = object.number ?? 0;
        message.label = object.label ?? 1;
        message.type = object.type ?? 1;
        message.typeName = object.typeName ?? '';
        message.extendee = object.extendee ?? '';
        message.defaultValue = object.defaultValue ?? '';
        message.oneofIndex = object.oneofIndex ?? 0;
        message.jsonName = object.jsonName ?? '';
        message.options =
            object.options !== undefined && object.options !== null
                ? FieldOptions.fromPartial(object.options)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return FieldDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return FieldDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.FieldDescriptorProto',
            value: FieldDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseOneofDescriptorProto() {
    return {
        name: '',
        options: undefined,
    };
}
export const OneofDescriptorProto = {
    typeUrl: '/google.protobuf.OneofDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.options !== undefined) {
            OneofOptions.encode(message.options, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOneofDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.options = OneofOptions.decode(reader, reader.uint32());
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
            name: isSet(object.name) ? String(object.name) : '',
            options: isSet(object.options)
                ? OneofOptions.fromJSON(object.options)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.options !== undefined &&
            (obj.options = message.options
                ? OneofOptions.toJSON(message.options)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseOneofDescriptorProto();
        message.name = object.name ?? '';
        message.options =
            object.options !== undefined && object.options !== null
                ? OneofOptions.fromPartial(object.options)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return OneofDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return OneofDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.OneofDescriptorProto',
            value: OneofDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseEnumDescriptorProto() {
    return {
        name: '',
        value: [],
        options: undefined,
        reservedRange: [],
        reservedName: [],
    };
}
export const EnumDescriptorProto = {
    typeUrl: '/google.protobuf.EnumDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        for (const v of message.value) {
            EnumValueDescriptorProto.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.options !== undefined) {
            EnumOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.reservedRange) {
            EnumDescriptorProto_EnumReservedRange.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.reservedName) {
            writer.uint32(42).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEnumDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.value.push(EnumValueDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.options = EnumOptions.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.reservedRange.push(EnumDescriptorProto_EnumReservedRange.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.reservedName.push(reader.string());
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
            name: isSet(object.name) ? String(object.name) : '',
            value: Array.isArray(object?.value)
                ? object.value.map((e) => EnumValueDescriptorProto.fromJSON(e))
                : [],
            options: isSet(object.options)
                ? EnumOptions.fromJSON(object.options)
                : undefined,
            reservedRange: Array.isArray(object?.reservedRange)
                ? object.reservedRange.map((e) => EnumDescriptorProto_EnumReservedRange.fromJSON(e))
                : [],
            reservedName: Array.isArray(object?.reservedName)
                ? object.reservedName.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        if (message.value) {
            obj.value = message.value.map(e => e ? EnumValueDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.value = [];
        }
        message.options !== undefined &&
            (obj.options = message.options
                ? EnumOptions.toJSON(message.options)
                : undefined);
        if (message.reservedRange) {
            obj.reservedRange = message.reservedRange.map(e => e ? EnumDescriptorProto_EnumReservedRange.toJSON(e) : undefined);
        }
        else {
            obj.reservedRange = [];
        }
        if (message.reservedName) {
            obj.reservedName = message.reservedName.map(e => e);
        }
        else {
            obj.reservedName = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEnumDescriptorProto();
        message.name = object.name ?? '';
        message.value =
            object.value?.map(e => EnumValueDescriptorProto.fromPartial(e)) || [];
        message.options =
            object.options !== undefined && object.options !== null
                ? EnumOptions.fromPartial(object.options)
                : undefined;
        message.reservedRange =
            object.reservedRange?.map(e => EnumDescriptorProto_EnumReservedRange.fromPartial(e)) || [];
        message.reservedName = object.reservedName?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return EnumDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return EnumDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.EnumDescriptorProto',
            value: EnumDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseEnumDescriptorProto_EnumReservedRange() {
    return {
        start: 0,
        end: 0,
    };
}
export const EnumDescriptorProto_EnumReservedRange = {
    typeUrl: '/google.protobuf.EnumReservedRange',
    encode(message, writer = BinaryWriter.create()) {
        if (message.start !== 0) {
            writer.uint32(8).int32(message.start);
        }
        if (message.end !== 0) {
            writer.uint32(16).int32(message.end);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEnumDescriptorProto_EnumReservedRange();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.start = reader.int32();
                    break;
                case 2:
                    message.end = reader.int32();
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
            start: isSet(object.start) ? Number(object.start) : 0,
            end: isSet(object.end) ? Number(object.end) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.start !== undefined && (obj.start = Math.round(message.start));
        message.end !== undefined && (obj.end = Math.round(message.end));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEnumDescriptorProto_EnumReservedRange();
        message.start = object.start ?? 0;
        message.end = object.end ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return EnumDescriptorProto_EnumReservedRange.decode(message.value);
    },
    toProto(message) {
        return EnumDescriptorProto_EnumReservedRange.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.EnumReservedRange',
            value: EnumDescriptorProto_EnumReservedRange.encode(message).finish(),
        };
    },
};
function createBaseEnumValueDescriptorProto() {
    return {
        name: '',
        number: 0,
        options: undefined,
    };
}
export const EnumValueDescriptorProto = {
    typeUrl: '/google.protobuf.EnumValueDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.number !== 0) {
            writer.uint32(16).int32(message.number);
        }
        if (message.options !== undefined) {
            EnumValueOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEnumValueDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.number = reader.int32();
                    break;
                case 3:
                    message.options = EnumValueOptions.decode(reader, reader.uint32());
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
            name: isSet(object.name) ? String(object.name) : '',
            number: isSet(object.number) ? Number(object.number) : 0,
            options: isSet(object.options)
                ? EnumValueOptions.fromJSON(object.options)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.number !== undefined && (obj.number = Math.round(message.number));
        message.options !== undefined &&
            (obj.options = message.options
                ? EnumValueOptions.toJSON(message.options)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEnumValueDescriptorProto();
        message.name = object.name ?? '';
        message.number = object.number ?? 0;
        message.options =
            object.options !== undefined && object.options !== null
                ? EnumValueOptions.fromPartial(object.options)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return EnumValueDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return EnumValueDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.EnumValueDescriptorProto',
            value: EnumValueDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseServiceDescriptorProto() {
    return {
        name: '',
        method: [],
        options: undefined,
    };
}
export const ServiceDescriptorProto = {
    typeUrl: '/google.protobuf.ServiceDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        for (const v of message.method) {
            MethodDescriptorProto.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.options !== undefined) {
            ServiceOptions.encode(message.options, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseServiceDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.method.push(MethodDescriptorProto.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.options = ServiceOptions.decode(reader, reader.uint32());
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
            name: isSet(object.name) ? String(object.name) : '',
            method: Array.isArray(object?.method)
                ? object.method.map((e) => MethodDescriptorProto.fromJSON(e))
                : [],
            options: isSet(object.options)
                ? ServiceOptions.fromJSON(object.options)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        if (message.method) {
            obj.method = message.method.map(e => e ? MethodDescriptorProto.toJSON(e) : undefined);
        }
        else {
            obj.method = [];
        }
        message.options !== undefined &&
            (obj.options = message.options
                ? ServiceOptions.toJSON(message.options)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseServiceDescriptorProto();
        message.name = object.name ?? '';
        message.method =
            object.method?.map(e => MethodDescriptorProto.fromPartial(e)) || [];
        message.options =
            object.options !== undefined && object.options !== null
                ? ServiceOptions.fromPartial(object.options)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ServiceDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return ServiceDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.ServiceDescriptorProto',
            value: ServiceDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseMethodDescriptorProto() {
    return {
        name: '',
        inputType: '',
        outputType: '',
        options: undefined,
        clientStreaming: false,
        serverStreaming: false,
    };
}
export const MethodDescriptorProto = {
    typeUrl: '/google.protobuf.MethodDescriptorProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.inputType !== '') {
            writer.uint32(18).string(message.inputType);
        }
        if (message.outputType !== '') {
            writer.uint32(26).string(message.outputType);
        }
        if (message.options !== undefined) {
            MethodOptions.encode(message.options, writer.uint32(34).fork()).ldelim();
        }
        if (message.clientStreaming === true) {
            writer.uint32(40).bool(message.clientStreaming);
        }
        if (message.serverStreaming === true) {
            writer.uint32(48).bool(message.serverStreaming);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMethodDescriptorProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.inputType = reader.string();
                    break;
                case 3:
                    message.outputType = reader.string();
                    break;
                case 4:
                    message.options = MethodOptions.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.clientStreaming = reader.bool();
                    break;
                case 6:
                    message.serverStreaming = reader.bool();
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
            name: isSet(object.name) ? String(object.name) : '',
            inputType: isSet(object.inputType) ? String(object.inputType) : '',
            outputType: isSet(object.outputType) ? String(object.outputType) : '',
            options: isSet(object.options)
                ? MethodOptions.fromJSON(object.options)
                : undefined,
            clientStreaming: isSet(object.clientStreaming)
                ? Boolean(object.clientStreaming)
                : false,
            serverStreaming: isSet(object.serverStreaming)
                ? Boolean(object.serverStreaming)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.inputType !== undefined && (obj.inputType = message.inputType);
        message.outputType !== undefined && (obj.outputType = message.outputType);
        message.options !== undefined &&
            (obj.options = message.options
                ? MethodOptions.toJSON(message.options)
                : undefined);
        message.clientStreaming !== undefined &&
            (obj.clientStreaming = message.clientStreaming);
        message.serverStreaming !== undefined &&
            (obj.serverStreaming = message.serverStreaming);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMethodDescriptorProto();
        message.name = object.name ?? '';
        message.inputType = object.inputType ?? '';
        message.outputType = object.outputType ?? '';
        message.options =
            object.options !== undefined && object.options !== null
                ? MethodOptions.fromPartial(object.options)
                : undefined;
        message.clientStreaming = object.clientStreaming ?? false;
        message.serverStreaming = object.serverStreaming ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MethodDescriptorProto.decode(message.value);
    },
    toProto(message) {
        return MethodDescriptorProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.MethodDescriptorProto',
            value: MethodDescriptorProto.encode(message).finish(),
        };
    },
};
function createBaseFileOptions() {
    return {
        javaPackage: '',
        javaOuterClassname: '',
        javaMultipleFiles: false,
        javaGenerateEqualsAndHash: false,
        javaStringCheckUtf8: false,
        optimizeFor: 1,
        goPackage: '',
        ccGenericServices: false,
        javaGenericServices: false,
        pyGenericServices: false,
        phpGenericServices: false,
        deprecated: false,
        ccEnableArenas: false,
        objcClassPrefix: '',
        csharpNamespace: '',
        swiftPrefix: '',
        phpClassPrefix: '',
        phpNamespace: '',
        phpMetadataNamespace: '',
        rubyPackage: '',
        uninterpretedOption: [],
    };
}
export const FileOptions = {
    typeUrl: '/google.protobuf.FileOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.javaPackage !== '') {
            writer.uint32(10).string(message.javaPackage);
        }
        if (message.javaOuterClassname !== '') {
            writer.uint32(66).string(message.javaOuterClassname);
        }
        if (message.javaMultipleFiles === true) {
            writer.uint32(80).bool(message.javaMultipleFiles);
        }
        if (message.javaGenerateEqualsAndHash === true) {
            writer.uint32(160).bool(message.javaGenerateEqualsAndHash);
        }
        if (message.javaStringCheckUtf8 === true) {
            writer.uint32(216).bool(message.javaStringCheckUtf8);
        }
        if (message.optimizeFor !== 1) {
            writer.uint32(72).int32(message.optimizeFor);
        }
        if (message.goPackage !== '') {
            writer.uint32(90).string(message.goPackage);
        }
        if (message.ccGenericServices === true) {
            writer.uint32(128).bool(message.ccGenericServices);
        }
        if (message.javaGenericServices === true) {
            writer.uint32(136).bool(message.javaGenericServices);
        }
        if (message.pyGenericServices === true) {
            writer.uint32(144).bool(message.pyGenericServices);
        }
        if (message.phpGenericServices === true) {
            writer.uint32(336).bool(message.phpGenericServices);
        }
        if (message.deprecated === true) {
            writer.uint32(184).bool(message.deprecated);
        }
        if (message.ccEnableArenas === true) {
            writer.uint32(248).bool(message.ccEnableArenas);
        }
        if (message.objcClassPrefix !== '') {
            writer.uint32(290).string(message.objcClassPrefix);
        }
        if (message.csharpNamespace !== '') {
            writer.uint32(298).string(message.csharpNamespace);
        }
        if (message.swiftPrefix !== '') {
            writer.uint32(314).string(message.swiftPrefix);
        }
        if (message.phpClassPrefix !== '') {
            writer.uint32(322).string(message.phpClassPrefix);
        }
        if (message.phpNamespace !== '') {
            writer.uint32(330).string(message.phpNamespace);
        }
        if (message.phpMetadataNamespace !== '') {
            writer.uint32(354).string(message.phpMetadataNamespace);
        }
        if (message.rubyPackage !== '') {
            writer.uint32(362).string(message.rubyPackage);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFileOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.javaPackage = reader.string();
                    break;
                case 8:
                    message.javaOuterClassname = reader.string();
                    break;
                case 10:
                    message.javaMultipleFiles = reader.bool();
                    break;
                case 20:
                    message.javaGenerateEqualsAndHash = reader.bool();
                    break;
                case 27:
                    message.javaStringCheckUtf8 = reader.bool();
                    break;
                case 9:
                    message.optimizeFor = reader.int32();
                    break;
                case 11:
                    message.goPackage = reader.string();
                    break;
                case 16:
                    message.ccGenericServices = reader.bool();
                    break;
                case 17:
                    message.javaGenericServices = reader.bool();
                    break;
                case 18:
                    message.pyGenericServices = reader.bool();
                    break;
                case 42:
                    message.phpGenericServices = reader.bool();
                    break;
                case 23:
                    message.deprecated = reader.bool();
                    break;
                case 31:
                    message.ccEnableArenas = reader.bool();
                    break;
                case 36:
                    message.objcClassPrefix = reader.string();
                    break;
                case 37:
                    message.csharpNamespace = reader.string();
                    break;
                case 39:
                    message.swiftPrefix = reader.string();
                    break;
                case 40:
                    message.phpClassPrefix = reader.string();
                    break;
                case 41:
                    message.phpNamespace = reader.string();
                    break;
                case 44:
                    message.phpMetadataNamespace = reader.string();
                    break;
                case 45:
                    message.rubyPackage = reader.string();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            javaPackage: isSet(object.javaPackage) ? String(object.javaPackage) : '',
            javaOuterClassname: isSet(object.javaOuterClassname)
                ? String(object.javaOuterClassname)
                : '',
            javaMultipleFiles: isSet(object.javaMultipleFiles)
                ? Boolean(object.javaMultipleFiles)
                : false,
            javaGenerateEqualsAndHash: isSet(object.javaGenerateEqualsAndHash)
                ? Boolean(object.javaGenerateEqualsAndHash)
                : false,
            javaStringCheckUtf8: isSet(object.javaStringCheckUtf8)
                ? Boolean(object.javaStringCheckUtf8)
                : false,
            optimizeFor: isSet(object.optimizeFor)
                ? fileOptions_OptimizeModeFromJSON(object.optimizeFor)
                : -1,
            goPackage: isSet(object.goPackage) ? String(object.goPackage) : '',
            ccGenericServices: isSet(object.ccGenericServices)
                ? Boolean(object.ccGenericServices)
                : false,
            javaGenericServices: isSet(object.javaGenericServices)
                ? Boolean(object.javaGenericServices)
                : false,
            pyGenericServices: isSet(object.pyGenericServices)
                ? Boolean(object.pyGenericServices)
                : false,
            phpGenericServices: isSet(object.phpGenericServices)
                ? Boolean(object.phpGenericServices)
                : false,
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            ccEnableArenas: isSet(object.ccEnableArenas)
                ? Boolean(object.ccEnableArenas)
                : false,
            objcClassPrefix: isSet(object.objcClassPrefix)
                ? String(object.objcClassPrefix)
                : '',
            csharpNamespace: isSet(object.csharpNamespace)
                ? String(object.csharpNamespace)
                : '',
            swiftPrefix: isSet(object.swiftPrefix) ? String(object.swiftPrefix) : '',
            phpClassPrefix: isSet(object.phpClassPrefix)
                ? String(object.phpClassPrefix)
                : '',
            phpNamespace: isSet(object.phpNamespace)
                ? String(object.phpNamespace)
                : '',
            phpMetadataNamespace: isSet(object.phpMetadataNamespace)
                ? String(object.phpMetadataNamespace)
                : '',
            rubyPackage: isSet(object.rubyPackage) ? String(object.rubyPackage) : '',
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.javaPackage !== undefined &&
            (obj.javaPackage = message.javaPackage);
        message.javaOuterClassname !== undefined &&
            (obj.javaOuterClassname = message.javaOuterClassname);
        message.javaMultipleFiles !== undefined &&
            (obj.javaMultipleFiles = message.javaMultipleFiles);
        message.javaGenerateEqualsAndHash !== undefined &&
            (obj.javaGenerateEqualsAndHash = message.javaGenerateEqualsAndHash);
        message.javaStringCheckUtf8 !== undefined &&
            (obj.javaStringCheckUtf8 = message.javaStringCheckUtf8);
        message.optimizeFor !== undefined &&
            (obj.optimizeFor = fileOptions_OptimizeModeToJSON(message.optimizeFor));
        message.goPackage !== undefined && (obj.goPackage = message.goPackage);
        message.ccGenericServices !== undefined &&
            (obj.ccGenericServices = message.ccGenericServices);
        message.javaGenericServices !== undefined &&
            (obj.javaGenericServices = message.javaGenericServices);
        message.pyGenericServices !== undefined &&
            (obj.pyGenericServices = message.pyGenericServices);
        message.phpGenericServices !== undefined &&
            (obj.phpGenericServices = message.phpGenericServices);
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        message.ccEnableArenas !== undefined &&
            (obj.ccEnableArenas = message.ccEnableArenas);
        message.objcClassPrefix !== undefined &&
            (obj.objcClassPrefix = message.objcClassPrefix);
        message.csharpNamespace !== undefined &&
            (obj.csharpNamespace = message.csharpNamespace);
        message.swiftPrefix !== undefined &&
            (obj.swiftPrefix = message.swiftPrefix);
        message.phpClassPrefix !== undefined &&
            (obj.phpClassPrefix = message.phpClassPrefix);
        message.phpNamespace !== undefined &&
            (obj.phpNamespace = message.phpNamespace);
        message.phpMetadataNamespace !== undefined &&
            (obj.phpMetadataNamespace = message.phpMetadataNamespace);
        message.rubyPackage !== undefined &&
            (obj.rubyPackage = message.rubyPackage);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFileOptions();
        message.javaPackage = object.javaPackage ?? '';
        message.javaOuterClassname = object.javaOuterClassname ?? '';
        message.javaMultipleFiles = object.javaMultipleFiles ?? false;
        message.javaGenerateEqualsAndHash =
            object.javaGenerateEqualsAndHash ?? false;
        message.javaStringCheckUtf8 = object.javaStringCheckUtf8 ?? false;
        message.optimizeFor = object.optimizeFor ?? 1;
        message.goPackage = object.goPackage ?? '';
        message.ccGenericServices = object.ccGenericServices ?? false;
        message.javaGenericServices = object.javaGenericServices ?? false;
        message.pyGenericServices = object.pyGenericServices ?? false;
        message.phpGenericServices = object.phpGenericServices ?? false;
        message.deprecated = object.deprecated ?? false;
        message.ccEnableArenas = object.ccEnableArenas ?? false;
        message.objcClassPrefix = object.objcClassPrefix ?? '';
        message.csharpNamespace = object.csharpNamespace ?? '';
        message.swiftPrefix = object.swiftPrefix ?? '';
        message.phpClassPrefix = object.phpClassPrefix ?? '';
        message.phpNamespace = object.phpNamespace ?? '';
        message.phpMetadataNamespace = object.phpMetadataNamespace ?? '';
        message.rubyPackage = object.rubyPackage ?? '';
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return FileOptions.decode(message.value);
    },
    toProto(message) {
        return FileOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.FileOptions',
            value: FileOptions.encode(message).finish(),
        };
    },
};
function createBaseMessageOptions() {
    return {
        messageSetWireFormat: false,
        noStandardDescriptorAccessor: false,
        deprecated: false,
        mapEntry: false,
        uninterpretedOption: [],
    };
}
export const MessageOptions = {
    typeUrl: '/google.protobuf.MessageOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.messageSetWireFormat === true) {
            writer.uint32(8).bool(message.messageSetWireFormat);
        }
        if (message.noStandardDescriptorAccessor === true) {
            writer.uint32(16).bool(message.noStandardDescriptorAccessor);
        }
        if (message.deprecated === true) {
            writer.uint32(24).bool(message.deprecated);
        }
        if (message.mapEntry === true) {
            writer.uint32(56).bool(message.mapEntry);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMessageOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messageSetWireFormat = reader.bool();
                    break;
                case 2:
                    message.noStandardDescriptorAccessor = reader.bool();
                    break;
                case 3:
                    message.deprecated = reader.bool();
                    break;
                case 7:
                    message.mapEntry = reader.bool();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            messageSetWireFormat: isSet(object.messageSetWireFormat)
                ? Boolean(object.messageSetWireFormat)
                : false,
            noStandardDescriptorAccessor: isSet(object.noStandardDescriptorAccessor)
                ? Boolean(object.noStandardDescriptorAccessor)
                : false,
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            mapEntry: isSet(object.mapEntry) ? Boolean(object.mapEntry) : false,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.messageSetWireFormat !== undefined &&
            (obj.messageSetWireFormat = message.messageSetWireFormat);
        message.noStandardDescriptorAccessor !== undefined &&
            (obj.noStandardDescriptorAccessor = message.noStandardDescriptorAccessor);
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        message.mapEntry !== undefined && (obj.mapEntry = message.mapEntry);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMessageOptions();
        message.messageSetWireFormat = object.messageSetWireFormat ?? false;
        message.noStandardDescriptorAccessor =
            object.noStandardDescriptorAccessor ?? false;
        message.deprecated = object.deprecated ?? false;
        message.mapEntry = object.mapEntry ?? false;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MessageOptions.decode(message.value);
    },
    toProto(message) {
        return MessageOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.MessageOptions',
            value: MessageOptions.encode(message).finish(),
        };
    },
};
function createBaseFieldOptions() {
    return {
        ctype: 1,
        packed: false,
        jstype: 1,
        lazy: false,
        deprecated: false,
        weak: false,
        uninterpretedOption: [],
    };
}
export const FieldOptions = {
    typeUrl: '/google.protobuf.FieldOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.ctype !== 1) {
            writer.uint32(8).int32(message.ctype);
        }
        if (message.packed === true) {
            writer.uint32(16).bool(message.packed);
        }
        if (message.jstype !== 1) {
            writer.uint32(48).int32(message.jstype);
        }
        if (message.lazy === true) {
            writer.uint32(40).bool(message.lazy);
        }
        if (message.deprecated === true) {
            writer.uint32(24).bool(message.deprecated);
        }
        if (message.weak === true) {
            writer.uint32(80).bool(message.weak);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFieldOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.ctype = reader.int32();
                    break;
                case 2:
                    message.packed = reader.bool();
                    break;
                case 6:
                    message.jstype = reader.int32();
                    break;
                case 5:
                    message.lazy = reader.bool();
                    break;
                case 3:
                    message.deprecated = reader.bool();
                    break;
                case 10:
                    message.weak = reader.bool();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            ctype: isSet(object.ctype)
                ? fieldOptions_CTypeFromJSON(object.ctype)
                : -1,
            packed: isSet(object.packed) ? Boolean(object.packed) : false,
            jstype: isSet(object.jstype)
                ? fieldOptions_JSTypeFromJSON(object.jstype)
                : -1,
            lazy: isSet(object.lazy) ? Boolean(object.lazy) : false,
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            weak: isSet(object.weak) ? Boolean(object.weak) : false,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.ctype !== undefined &&
            (obj.ctype = fieldOptions_CTypeToJSON(message.ctype));
        message.packed !== undefined && (obj.packed = message.packed);
        message.jstype !== undefined &&
            (obj.jstype = fieldOptions_JSTypeToJSON(message.jstype));
        message.lazy !== undefined && (obj.lazy = message.lazy);
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        message.weak !== undefined && (obj.weak = message.weak);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFieldOptions();
        message.ctype = object.ctype ?? 1;
        message.packed = object.packed ?? false;
        message.jstype = object.jstype ?? 1;
        message.lazy = object.lazy ?? false;
        message.deprecated = object.deprecated ?? false;
        message.weak = object.weak ?? false;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return FieldOptions.decode(message.value);
    },
    toProto(message) {
        return FieldOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.FieldOptions',
            value: FieldOptions.encode(message).finish(),
        };
    },
};
function createBaseOneofOptions() {
    return {
        uninterpretedOption: [],
    };
}
export const OneofOptions = {
    typeUrl: '/google.protobuf.OneofOptions',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOneofOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseOneofOptions();
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return OneofOptions.decode(message.value);
    },
    toProto(message) {
        return OneofOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.OneofOptions',
            value: OneofOptions.encode(message).finish(),
        };
    },
};
function createBaseEnumOptions() {
    return {
        allowAlias: false,
        deprecated: false,
        uninterpretedOption: [],
    };
}
export const EnumOptions = {
    typeUrl: '/google.protobuf.EnumOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.allowAlias === true) {
            writer.uint32(16).bool(message.allowAlias);
        }
        if (message.deprecated === true) {
            writer.uint32(24).bool(message.deprecated);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEnumOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.allowAlias = reader.bool();
                    break;
                case 3:
                    message.deprecated = reader.bool();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            allowAlias: isSet(object.allowAlias) ? Boolean(object.allowAlias) : false,
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.allowAlias !== undefined && (obj.allowAlias = message.allowAlias);
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEnumOptions();
        message.allowAlias = object.allowAlias ?? false;
        message.deprecated = object.deprecated ?? false;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return EnumOptions.decode(message.value);
    },
    toProto(message) {
        return EnumOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.EnumOptions',
            value: EnumOptions.encode(message).finish(),
        };
    },
};
function createBaseEnumValueOptions() {
    return {
        deprecated: false,
        uninterpretedOption: [],
    };
}
export const EnumValueOptions = {
    typeUrl: '/google.protobuf.EnumValueOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deprecated === true) {
            writer.uint32(8).bool(message.deprecated);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEnumValueOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.deprecated = reader.bool();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEnumValueOptions();
        message.deprecated = object.deprecated ?? false;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return EnumValueOptions.decode(message.value);
    },
    toProto(message) {
        return EnumValueOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.EnumValueOptions',
            value: EnumValueOptions.encode(message).finish(),
        };
    },
};
function createBaseServiceOptions() {
    return {
        deprecated: false,
        uninterpretedOption: [],
    };
}
export const ServiceOptions = {
    typeUrl: '/google.protobuf.ServiceOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deprecated === true) {
            writer.uint32(264).bool(message.deprecated);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseServiceOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 33:
                    message.deprecated = reader.bool();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseServiceOptions();
        message.deprecated = object.deprecated ?? false;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ServiceOptions.decode(message.value);
    },
    toProto(message) {
        return ServiceOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.ServiceOptions',
            value: ServiceOptions.encode(message).finish(),
        };
    },
};
function createBaseMethodOptions() {
    return {
        deprecated: false,
        idempotencyLevel: 1,
        uninterpretedOption: [],
    };
}
export const MethodOptions = {
    typeUrl: '/google.protobuf.MethodOptions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deprecated === true) {
            writer.uint32(264).bool(message.deprecated);
        }
        if (message.idempotencyLevel !== 1) {
            writer.uint32(272).int32(message.idempotencyLevel);
        }
        for (const v of message.uninterpretedOption) {
            UninterpretedOption.encode(v, writer.uint32(7994).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMethodOptions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 33:
                    message.deprecated = reader.bool();
                    break;
                case 34:
                    message.idempotencyLevel = reader.int32();
                    break;
                case 999:
                    message.uninterpretedOption.push(UninterpretedOption.decode(reader, reader.uint32()));
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
            deprecated: isSet(object.deprecated) ? Boolean(object.deprecated) : false,
            idempotencyLevel: isSet(object.idempotencyLevel)
                ? methodOptions_IdempotencyLevelFromJSON(object.idempotencyLevel)
                : -1,
            uninterpretedOption: Array.isArray(object?.uninterpretedOption)
                ? object.uninterpretedOption.map((e) => UninterpretedOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.deprecated !== undefined && (obj.deprecated = message.deprecated);
        message.idempotencyLevel !== undefined &&
            (obj.idempotencyLevel = methodOptions_IdempotencyLevelToJSON(message.idempotencyLevel));
        if (message.uninterpretedOption) {
            obj.uninterpretedOption = message.uninterpretedOption.map(e => e ? UninterpretedOption.toJSON(e) : undefined);
        }
        else {
            obj.uninterpretedOption = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMethodOptions();
        message.deprecated = object.deprecated ?? false;
        message.idempotencyLevel = object.idempotencyLevel ?? 1;
        message.uninterpretedOption =
            object.uninterpretedOption?.map(e => UninterpretedOption.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MethodOptions.decode(message.value);
    },
    toProto(message) {
        return MethodOptions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.MethodOptions',
            value: MethodOptions.encode(message).finish(),
        };
    },
};
function createBaseUninterpretedOption() {
    return {
        name: [],
        identifierValue: '',
        positiveIntValue: BigInt(0),
        negativeIntValue: BigInt(0),
        doubleValue: 0,
        stringValue: new Uint8Array(),
        aggregateValue: '',
    };
}
export const UninterpretedOption = {
    typeUrl: '/google.protobuf.UninterpretedOption',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.name) {
            UninterpretedOption_NamePart.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.identifierValue !== '') {
            writer.uint32(26).string(message.identifierValue);
        }
        if (message.positiveIntValue !== BigInt(0)) {
            writer.uint32(32).uint64(message.positiveIntValue);
        }
        if (message.negativeIntValue !== BigInt(0)) {
            writer.uint32(40).int64(message.negativeIntValue);
        }
        if (message.doubleValue !== 0) {
            writer.uint32(49).double(message.doubleValue);
        }
        if (message.stringValue.length !== 0) {
            writer.uint32(58).bytes(message.stringValue);
        }
        if (message.aggregateValue !== '') {
            writer.uint32(66).string(message.aggregateValue);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUninterpretedOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.name.push(UninterpretedOption_NamePart.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.identifierValue = reader.string();
                    break;
                case 4:
                    message.positiveIntValue = reader.uint64();
                    break;
                case 5:
                    message.negativeIntValue = reader.int64();
                    break;
                case 6:
                    message.doubleValue = reader.double();
                    break;
                case 7:
                    message.stringValue = reader.bytes();
                    break;
                case 8:
                    message.aggregateValue = reader.string();
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
            name: Array.isArray(object?.name)
                ? object.name.map((e) => UninterpretedOption_NamePart.fromJSON(e))
                : [],
            identifierValue: isSet(object.identifierValue)
                ? String(object.identifierValue)
                : '',
            positiveIntValue: isSet(object.positiveIntValue)
                ? BigInt(object.positiveIntValue.toString())
                : BigInt(0),
            negativeIntValue: isSet(object.negativeIntValue)
                ? BigInt(object.negativeIntValue.toString())
                : BigInt(0),
            doubleValue: isSet(object.doubleValue) ? Number(object.doubleValue) : 0,
            stringValue: isSet(object.stringValue)
                ? bytesFromBase64(object.stringValue)
                : new Uint8Array(),
            aggregateValue: isSet(object.aggregateValue)
                ? String(object.aggregateValue)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.name) {
            obj.name = message.name.map(e => e ? UninterpretedOption_NamePart.toJSON(e) : undefined);
        }
        else {
            obj.name = [];
        }
        message.identifierValue !== undefined &&
            (obj.identifierValue = message.identifierValue);
        message.positiveIntValue !== undefined &&
            (obj.positiveIntValue = (message.positiveIntValue || BigInt(0)).toString());
        message.negativeIntValue !== undefined &&
            (obj.negativeIntValue = (message.negativeIntValue || BigInt(0)).toString());
        message.doubleValue !== undefined &&
            (obj.doubleValue = message.doubleValue);
        message.stringValue !== undefined &&
            (obj.stringValue = base64FromBytes(message.stringValue !== undefined
                ? message.stringValue
                : new Uint8Array()));
        message.aggregateValue !== undefined &&
            (obj.aggregateValue = message.aggregateValue);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUninterpretedOption();
        message.name =
            object.name?.map(e => UninterpretedOption_NamePart.fromPartial(e)) || [];
        message.identifierValue = object.identifierValue ?? '';
        message.positiveIntValue =
            object.positiveIntValue !== undefined && object.positiveIntValue !== null
                ? BigInt(object.positiveIntValue.toString())
                : BigInt(0);
        message.negativeIntValue =
            object.negativeIntValue !== undefined && object.negativeIntValue !== null
                ? BigInt(object.negativeIntValue.toString())
                : BigInt(0);
        message.doubleValue = object.doubleValue ?? 0;
        message.stringValue = object.stringValue ?? new Uint8Array();
        message.aggregateValue = object.aggregateValue ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return UninterpretedOption.decode(message.value);
    },
    toProto(message) {
        return UninterpretedOption.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.UninterpretedOption',
            value: UninterpretedOption.encode(message).finish(),
        };
    },
};
function createBaseUninterpretedOption_NamePart() {
    return {
        namePart: '',
        isExtension: false,
    };
}
export const UninterpretedOption_NamePart = {
    typeUrl: '/google.protobuf.NamePart',
    encode(message, writer = BinaryWriter.create()) {
        if (message.namePart !== '') {
            writer.uint32(10).string(message.namePart);
        }
        if (message.isExtension === true) {
            writer.uint32(16).bool(message.isExtension);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUninterpretedOption_NamePart();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.namePart = reader.string();
                    break;
                case 2:
                    message.isExtension = reader.bool();
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
            namePart: isSet(object.namePart) ? String(object.namePart) : '',
            isExtension: isSet(object.isExtension)
                ? Boolean(object.isExtension)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.namePart !== undefined && (obj.namePart = message.namePart);
        message.isExtension !== undefined &&
            (obj.isExtension = message.isExtension);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUninterpretedOption_NamePart();
        message.namePart = object.namePart ?? '';
        message.isExtension = object.isExtension ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return UninterpretedOption_NamePart.decode(message.value);
    },
    toProto(message) {
        return UninterpretedOption_NamePart.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.NamePart',
            value: UninterpretedOption_NamePart.encode(message).finish(),
        };
    },
};
function createBaseSourceCodeInfo() {
    return {
        location: [],
    };
}
export const SourceCodeInfo = {
    typeUrl: '/google.protobuf.SourceCodeInfo',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.location) {
            SourceCodeInfo_Location.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSourceCodeInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.location.push(SourceCodeInfo_Location.decode(reader, reader.uint32()));
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
            location: Array.isArray(object?.location)
                ? object.location.map((e) => SourceCodeInfo_Location.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.location) {
            obj.location = message.location.map(e => e ? SourceCodeInfo_Location.toJSON(e) : undefined);
        }
        else {
            obj.location = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSourceCodeInfo();
        message.location =
            object.location?.map(e => SourceCodeInfo_Location.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return SourceCodeInfo.decode(message.value);
    },
    toProto(message) {
        return SourceCodeInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.SourceCodeInfo',
            value: SourceCodeInfo.encode(message).finish(),
        };
    },
};
function createBaseSourceCodeInfo_Location() {
    return {
        path: [],
        span: [],
        leadingComments: '',
        trailingComments: '',
        leadingDetachedComments: [],
    };
}
export const SourceCodeInfo_Location = {
    typeUrl: '/google.protobuf.Location',
    encode(message, writer = BinaryWriter.create()) {
        writer.uint32(10).fork();
        for (const v of message.path) {
            writer.int32(v);
        }
        writer.ldelim();
        writer.uint32(18).fork();
        for (const v of message.span) {
            writer.int32(v);
        }
        writer.ldelim();
        if (message.leadingComments !== '') {
            writer.uint32(26).string(message.leadingComments);
        }
        if (message.trailingComments !== '') {
            writer.uint32(34).string(message.trailingComments);
        }
        for (const v of message.leadingDetachedComments) {
            writer.uint32(50).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSourceCodeInfo_Location();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.path.push(reader.int32());
                        }
                    }
                    else {
                        message.path.push(reader.int32());
                    }
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.span.push(reader.int32());
                        }
                    }
                    else {
                        message.span.push(reader.int32());
                    }
                    break;
                case 3:
                    message.leadingComments = reader.string();
                    break;
                case 4:
                    message.trailingComments = reader.string();
                    break;
                case 6:
                    message.leadingDetachedComments.push(reader.string());
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
            path: Array.isArray(object?.path)
                ? object.path.map((e) => Number(e))
                : [],
            span: Array.isArray(object?.span)
                ? object.span.map((e) => Number(e))
                : [],
            leadingComments: isSet(object.leadingComments)
                ? String(object.leadingComments)
                : '',
            trailingComments: isSet(object.trailingComments)
                ? String(object.trailingComments)
                : '',
            leadingDetachedComments: Array.isArray(object?.leadingDetachedComments)
                ? object.leadingDetachedComments.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.path) {
            obj.path = message.path.map(e => Math.round(e));
        }
        else {
            obj.path = [];
        }
        if (message.span) {
            obj.span = message.span.map(e => Math.round(e));
        }
        else {
            obj.span = [];
        }
        message.leadingComments !== undefined &&
            (obj.leadingComments = message.leadingComments);
        message.trailingComments !== undefined &&
            (obj.trailingComments = message.trailingComments);
        if (message.leadingDetachedComments) {
            obj.leadingDetachedComments = message.leadingDetachedComments.map(e => e);
        }
        else {
            obj.leadingDetachedComments = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSourceCodeInfo_Location();
        message.path = object.path?.map(e => e) || [];
        message.span = object.span?.map(e => e) || [];
        message.leadingComments = object.leadingComments ?? '';
        message.trailingComments = object.trailingComments ?? '';
        message.leadingDetachedComments =
            object.leadingDetachedComments?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return SourceCodeInfo_Location.decode(message.value);
    },
    toProto(message) {
        return SourceCodeInfo_Location.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.Location',
            value: SourceCodeInfo_Location.encode(message).finish(),
        };
    },
};
function createBaseGeneratedCodeInfo() {
    return {
        annotation: [],
    };
}
export const GeneratedCodeInfo = {
    typeUrl: '/google.protobuf.GeneratedCodeInfo',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.annotation) {
            GeneratedCodeInfo_Annotation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGeneratedCodeInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.annotation.push(GeneratedCodeInfo_Annotation.decode(reader, reader.uint32()));
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
            annotation: Array.isArray(object?.annotation)
                ? object.annotation.map((e) => GeneratedCodeInfo_Annotation.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.annotation) {
            obj.annotation = message.annotation.map(e => e ? GeneratedCodeInfo_Annotation.toJSON(e) : undefined);
        }
        else {
            obj.annotation = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGeneratedCodeInfo();
        message.annotation =
            object.annotation?.map(e => GeneratedCodeInfo_Annotation.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GeneratedCodeInfo.decode(message.value);
    },
    toProto(message) {
        return GeneratedCodeInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.GeneratedCodeInfo',
            value: GeneratedCodeInfo.encode(message).finish(),
        };
    },
};
function createBaseGeneratedCodeInfo_Annotation() {
    return {
        path: [],
        sourceFile: '',
        begin: 0,
        end: 0,
    };
}
export const GeneratedCodeInfo_Annotation = {
    typeUrl: '/google.protobuf.Annotation',
    encode(message, writer = BinaryWriter.create()) {
        writer.uint32(10).fork();
        for (const v of message.path) {
            writer.int32(v);
        }
        writer.ldelim();
        if (message.sourceFile !== '') {
            writer.uint32(18).string(message.sourceFile);
        }
        if (message.begin !== 0) {
            writer.uint32(24).int32(message.begin);
        }
        if (message.end !== 0) {
            writer.uint32(32).int32(message.end);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGeneratedCodeInfo_Annotation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.path.push(reader.int32());
                        }
                    }
                    else {
                        message.path.push(reader.int32());
                    }
                    break;
                case 2:
                    message.sourceFile = reader.string();
                    break;
                case 3:
                    message.begin = reader.int32();
                    break;
                case 4:
                    message.end = reader.int32();
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
            path: Array.isArray(object?.path)
                ? object.path.map((e) => Number(e))
                : [],
            sourceFile: isSet(object.sourceFile) ? String(object.sourceFile) : '',
            begin: isSet(object.begin) ? Number(object.begin) : 0,
            end: isSet(object.end) ? Number(object.end) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.path) {
            obj.path = message.path.map(e => Math.round(e));
        }
        else {
            obj.path = [];
        }
        message.sourceFile !== undefined && (obj.sourceFile = message.sourceFile);
        message.begin !== undefined && (obj.begin = Math.round(message.begin));
        message.end !== undefined && (obj.end = Math.round(message.end));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGeneratedCodeInfo_Annotation();
        message.path = object.path?.map(e => e) || [];
        message.sourceFile = object.sourceFile ?? '';
        message.begin = object.begin ?? 0;
        message.end = object.end ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return GeneratedCodeInfo_Annotation.decode(message.value);
    },
    toProto(message) {
        return GeneratedCodeInfo_Annotation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.Annotation',
            value: GeneratedCodeInfo_Annotation.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=descriptor.js.map