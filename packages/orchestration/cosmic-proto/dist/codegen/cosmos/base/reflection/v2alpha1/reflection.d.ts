import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** AppDescriptor describes a cosmos-sdk based application */
export interface AppDescriptor {
    /**
     * AuthnDescriptor provides information on how to authenticate transactions on the application
     * NOTE: experimental and subject to change in future releases.
     */
    authn?: AuthnDescriptor;
    /** chain provides the chain descriptor */
    chain?: ChainDescriptor;
    /** codec provides metadata information regarding codec related types */
    codec?: CodecDescriptor;
    /** configuration provides metadata information regarding the sdk.Config type */
    configuration?: ConfigurationDescriptor;
    /** query_services provides metadata information regarding the available queriable endpoints */
    queryServices?: QueryServicesDescriptor;
    /** tx provides metadata information regarding how to send transactions to the given application */
    tx?: TxDescriptor;
}
export interface AppDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.AppDescriptor';
    value: Uint8Array;
}
/** AppDescriptor describes a cosmos-sdk based application */
export interface AppDescriptorSDKType {
    authn?: AuthnDescriptorSDKType;
    chain?: ChainDescriptorSDKType;
    codec?: CodecDescriptorSDKType;
    configuration?: ConfigurationDescriptorSDKType;
    query_services?: QueryServicesDescriptorSDKType;
    tx?: TxDescriptorSDKType;
}
/** TxDescriptor describes the accepted transaction type */
export interface TxDescriptor {
    /**
     * fullname is the protobuf fullname of the raw transaction type (for instance the tx.Tx type)
     * it is not meant to support polymorphism of transaction types, it is supposed to be used by
     * reflection clients to understand if they can handle a specific transaction type in an application.
     */
    fullname: string;
    /** msgs lists the accepted application messages (sdk.Msg) */
    msgs: MsgDescriptor[];
}
export interface TxDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.TxDescriptor';
    value: Uint8Array;
}
/** TxDescriptor describes the accepted transaction type */
export interface TxDescriptorSDKType {
    fullname: string;
    msgs: MsgDescriptorSDKType[];
}
/**
 * AuthnDescriptor provides information on how to sign transactions without relying
 * on the online RPCs GetTxMetadata and CombineUnsignedTxAndSignatures
 */
export interface AuthnDescriptor {
    /** sign_modes defines the supported signature algorithm */
    signModes: SigningModeDescriptor[];
}
export interface AuthnDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.AuthnDescriptor';
    value: Uint8Array;
}
/**
 * AuthnDescriptor provides information on how to sign transactions without relying
 * on the online RPCs GetTxMetadata and CombineUnsignedTxAndSignatures
 */
export interface AuthnDescriptorSDKType {
    sign_modes: SigningModeDescriptorSDKType[];
}
/**
 * SigningModeDescriptor provides information on a signing flow of the application
 * NOTE(fdymylja): here we could go as far as providing an entire flow on how
 * to sign a message given a SigningModeDescriptor, but it's better to think about
 * this another time
 */
export interface SigningModeDescriptor {
    /** name defines the unique name of the signing mode */
    name: string;
    /** number is the unique int32 identifier for the sign_mode enum */
    number: number;
    /**
     * authn_info_provider_method_fullname defines the fullname of the method to call to get
     * the metadata required to authenticate using the provided sign_modes
     */
    authnInfoProviderMethodFullname: string;
}
export interface SigningModeDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.SigningModeDescriptor';
    value: Uint8Array;
}
/**
 * SigningModeDescriptor provides information on a signing flow of the application
 * NOTE(fdymylja): here we could go as far as providing an entire flow on how
 * to sign a message given a SigningModeDescriptor, but it's better to think about
 * this another time
 */
export interface SigningModeDescriptorSDKType {
    name: string;
    number: number;
    authn_info_provider_method_fullname: string;
}
/** ChainDescriptor describes chain information of the application */
export interface ChainDescriptor {
    /** id is the chain id */
    id: string;
}
export interface ChainDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.ChainDescriptor';
    value: Uint8Array;
}
/** ChainDescriptor describes chain information of the application */
export interface ChainDescriptorSDKType {
    id: string;
}
/** CodecDescriptor describes the registered interfaces and provides metadata information on the types */
export interface CodecDescriptor {
    /** interfaces is a list of the registerted interfaces descriptors */
    interfaces: InterfaceDescriptor[];
}
export interface CodecDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.CodecDescriptor';
    value: Uint8Array;
}
/** CodecDescriptor describes the registered interfaces and provides metadata information on the types */
export interface CodecDescriptorSDKType {
    interfaces: InterfaceDescriptorSDKType[];
}
/** InterfaceDescriptor describes the implementation of an interface */
export interface InterfaceDescriptor {
    /** fullname is the name of the interface */
    fullname: string;
    /**
     * interface_accepting_messages contains information regarding the proto messages which contain the interface as
     * google.protobuf.Any field
     */
    interfaceAcceptingMessages: InterfaceAcceptingMessageDescriptor[];
    /** interface_implementers is a list of the descriptors of the interface implementers */
    interfaceImplementers: InterfaceImplementerDescriptor[];
}
export interface InterfaceDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceDescriptor';
    value: Uint8Array;
}
/** InterfaceDescriptor describes the implementation of an interface */
export interface InterfaceDescriptorSDKType {
    fullname: string;
    interface_accepting_messages: InterfaceAcceptingMessageDescriptorSDKType[];
    interface_implementers: InterfaceImplementerDescriptorSDKType[];
}
/** InterfaceImplementerDescriptor describes an interface implementer */
export interface InterfaceImplementerDescriptor {
    /** fullname is the protobuf queryable name of the interface implementer */
    fullname: string;
    /**
     * type_url defines the type URL used when marshalling the type as any
     * this is required so we can provide type safe google.protobuf.Any marshalling and
     * unmarshalling, making sure that we don't accept just 'any' type
     * in our interface fields
     */
    typeUrl: string;
}
export interface InterfaceImplementerDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceImplementerDescriptor';
    value: Uint8Array;
}
/** InterfaceImplementerDescriptor describes an interface implementer */
export interface InterfaceImplementerDescriptorSDKType {
    fullname: string;
    type_url: string;
}
/**
 * InterfaceAcceptingMessageDescriptor describes a protobuf message which contains
 * an interface represented as a google.protobuf.Any
 */
export interface InterfaceAcceptingMessageDescriptor {
    /** fullname is the protobuf fullname of the type containing the interface */
    fullname: string;
    /**
     * field_descriptor_names is a list of the protobuf name (not fullname) of the field
     * which contains the interface as google.protobuf.Any (the interface is the same, but
     * it can be in multiple fields of the same proto message)
     */
    fieldDescriptorNames: string[];
}
export interface InterfaceAcceptingMessageDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceAcceptingMessageDescriptor';
    value: Uint8Array;
}
/**
 * InterfaceAcceptingMessageDescriptor describes a protobuf message which contains
 * an interface represented as a google.protobuf.Any
 */
export interface InterfaceAcceptingMessageDescriptorSDKType {
    fullname: string;
    field_descriptor_names: string[];
}
/** ConfigurationDescriptor contains metadata information on the sdk.Config */
export interface ConfigurationDescriptor {
    /** bech32_account_address_prefix is the account address prefix */
    bech32AccountAddressPrefix: string;
}
export interface ConfigurationDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.ConfigurationDescriptor';
    value: Uint8Array;
}
/** ConfigurationDescriptor contains metadata information on the sdk.Config */
export interface ConfigurationDescriptorSDKType {
    bech32_account_address_prefix: string;
}
/** MsgDescriptor describes a cosmos-sdk message that can be delivered with a transaction */
export interface MsgDescriptor {
    /** msg_type_url contains the TypeURL of a sdk.Msg. */
    msgTypeUrl: string;
}
export interface MsgDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.MsgDescriptor';
    value: Uint8Array;
}
/** MsgDescriptor describes a cosmos-sdk message that can be delivered with a transaction */
export interface MsgDescriptorSDKType {
    msg_type_url: string;
}
/** GetAuthnDescriptorRequest is the request used for the GetAuthnDescriptor RPC */
export interface GetAuthnDescriptorRequest {
}
export interface GetAuthnDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest';
    value: Uint8Array;
}
/** GetAuthnDescriptorRequest is the request used for the GetAuthnDescriptor RPC */
export interface GetAuthnDescriptorRequestSDKType {
}
/** GetAuthnDescriptorResponse is the response returned by the GetAuthnDescriptor RPC */
export interface GetAuthnDescriptorResponse {
    /** authn describes how to authenticate to the application when sending transactions */
    authn?: AuthnDescriptor;
}
export interface GetAuthnDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorResponse';
    value: Uint8Array;
}
/** GetAuthnDescriptorResponse is the response returned by the GetAuthnDescriptor RPC */
export interface GetAuthnDescriptorResponseSDKType {
    authn?: AuthnDescriptorSDKType;
}
/** GetChainDescriptorRequest is the request used for the GetChainDescriptor RPC */
export interface GetChainDescriptorRequest {
}
export interface GetChainDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest';
    value: Uint8Array;
}
/** GetChainDescriptorRequest is the request used for the GetChainDescriptor RPC */
export interface GetChainDescriptorRequestSDKType {
}
/** GetChainDescriptorResponse is the response returned by the GetChainDescriptor RPC */
export interface GetChainDescriptorResponse {
    /** chain describes application chain information */
    chain?: ChainDescriptor;
}
export interface GetChainDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorResponse';
    value: Uint8Array;
}
/** GetChainDescriptorResponse is the response returned by the GetChainDescriptor RPC */
export interface GetChainDescriptorResponseSDKType {
    chain?: ChainDescriptorSDKType;
}
/** GetCodecDescriptorRequest is the request used for the GetCodecDescriptor RPC */
export interface GetCodecDescriptorRequest {
}
export interface GetCodecDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest';
    value: Uint8Array;
}
/** GetCodecDescriptorRequest is the request used for the GetCodecDescriptor RPC */
export interface GetCodecDescriptorRequestSDKType {
}
/** GetCodecDescriptorResponse is the response returned by the GetCodecDescriptor RPC */
export interface GetCodecDescriptorResponse {
    /** codec describes the application codec such as registered interfaces and implementations */
    codec?: CodecDescriptor;
}
export interface GetCodecDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorResponse';
    value: Uint8Array;
}
/** GetCodecDescriptorResponse is the response returned by the GetCodecDescriptor RPC */
export interface GetCodecDescriptorResponseSDKType {
    codec?: CodecDescriptorSDKType;
}
/** GetConfigurationDescriptorRequest is the request used for the GetConfigurationDescriptor RPC */
export interface GetConfigurationDescriptorRequest {
}
export interface GetConfigurationDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest';
    value: Uint8Array;
}
/** GetConfigurationDescriptorRequest is the request used for the GetConfigurationDescriptor RPC */
export interface GetConfigurationDescriptorRequestSDKType {
}
/** GetConfigurationDescriptorResponse is the response returned by the GetConfigurationDescriptor RPC */
export interface GetConfigurationDescriptorResponse {
    /** config describes the application's sdk.Config */
    config?: ConfigurationDescriptor;
}
export interface GetConfigurationDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorResponse';
    value: Uint8Array;
}
/** GetConfigurationDescriptorResponse is the response returned by the GetConfigurationDescriptor RPC */
export interface GetConfigurationDescriptorResponseSDKType {
    config?: ConfigurationDescriptorSDKType;
}
/** GetQueryServicesDescriptorRequest is the request used for the GetQueryServicesDescriptor RPC */
export interface GetQueryServicesDescriptorRequest {
}
export interface GetQueryServicesDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest';
    value: Uint8Array;
}
/** GetQueryServicesDescriptorRequest is the request used for the GetQueryServicesDescriptor RPC */
export interface GetQueryServicesDescriptorRequestSDKType {
}
/** GetQueryServicesDescriptorResponse is the response returned by the GetQueryServicesDescriptor RPC */
export interface GetQueryServicesDescriptorResponse {
    /** queries provides information on the available queryable services */
    queries?: QueryServicesDescriptor;
}
export interface GetQueryServicesDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorResponse';
    value: Uint8Array;
}
/** GetQueryServicesDescriptorResponse is the response returned by the GetQueryServicesDescriptor RPC */
export interface GetQueryServicesDescriptorResponseSDKType {
    queries?: QueryServicesDescriptorSDKType;
}
/** GetTxDescriptorRequest is the request used for the GetTxDescriptor RPC */
export interface GetTxDescriptorRequest {
}
export interface GetTxDescriptorRequestProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest';
    value: Uint8Array;
}
/** GetTxDescriptorRequest is the request used for the GetTxDescriptor RPC */
export interface GetTxDescriptorRequestSDKType {
}
/** GetTxDescriptorResponse is the response returned by the GetTxDescriptor RPC */
export interface GetTxDescriptorResponse {
    /**
     * tx provides information on msgs that can be forwarded to the application
     * alongside the accepted transaction protobuf type
     */
    tx?: TxDescriptor;
}
export interface GetTxDescriptorResponseProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorResponse';
    value: Uint8Array;
}
/** GetTxDescriptorResponse is the response returned by the GetTxDescriptor RPC */
export interface GetTxDescriptorResponseSDKType {
    tx?: TxDescriptorSDKType;
}
/** QueryServicesDescriptor contains the list of cosmos-sdk queriable services */
export interface QueryServicesDescriptor {
    /** query_services is a list of cosmos-sdk QueryServiceDescriptor */
    queryServices: QueryServiceDescriptor[];
}
export interface QueryServicesDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServicesDescriptor';
    value: Uint8Array;
}
/** QueryServicesDescriptor contains the list of cosmos-sdk queriable services */
export interface QueryServicesDescriptorSDKType {
    query_services: QueryServiceDescriptorSDKType[];
}
/** QueryServiceDescriptor describes a cosmos-sdk queryable service */
export interface QueryServiceDescriptor {
    /** fullname is the protobuf fullname of the service descriptor */
    fullname: string;
    /** is_module describes if this service is actually exposed by an application's module */
    isModule: boolean;
    /** methods provides a list of query service methods */
    methods: QueryMethodDescriptor[];
}
export interface QueryServiceDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServiceDescriptor';
    value: Uint8Array;
}
/** QueryServiceDescriptor describes a cosmos-sdk queryable service */
export interface QueryServiceDescriptorSDKType {
    fullname: string;
    is_module: boolean;
    methods: QueryMethodDescriptorSDKType[];
}
/**
 * QueryMethodDescriptor describes a queryable method of a query service
 * no other info is provided beside method name and tendermint queryable path
 * because it would be redundant with the grpc reflection service
 */
export interface QueryMethodDescriptor {
    /** name is the protobuf name (not fullname) of the method */
    name: string;
    /**
     * full_query_path is the path that can be used to query
     * this method via tendermint abci.Query
     */
    fullQueryPath: string;
}
export interface QueryMethodDescriptorProtoMsg {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryMethodDescriptor';
    value: Uint8Array;
}
/**
 * QueryMethodDescriptor describes a queryable method of a query service
 * no other info is provided beside method name and tendermint queryable path
 * because it would be redundant with the grpc reflection service
 */
export interface QueryMethodDescriptorSDKType {
    name: string;
    full_query_path: string;
}
export declare const AppDescriptor: {
    typeUrl: string;
    encode(message: AppDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AppDescriptor;
    fromJSON(object: any): AppDescriptor;
    toJSON(message: AppDescriptor): JsonSafe<AppDescriptor>;
    fromPartial(object: Partial<AppDescriptor>): AppDescriptor;
    fromProtoMsg(message: AppDescriptorProtoMsg): AppDescriptor;
    toProto(message: AppDescriptor): Uint8Array;
    toProtoMsg(message: AppDescriptor): AppDescriptorProtoMsg;
};
export declare const TxDescriptor: {
    typeUrl: string;
    encode(message: TxDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TxDescriptor;
    fromJSON(object: any): TxDescriptor;
    toJSON(message: TxDescriptor): JsonSafe<TxDescriptor>;
    fromPartial(object: Partial<TxDescriptor>): TxDescriptor;
    fromProtoMsg(message: TxDescriptorProtoMsg): TxDescriptor;
    toProto(message: TxDescriptor): Uint8Array;
    toProtoMsg(message: TxDescriptor): TxDescriptorProtoMsg;
};
export declare const AuthnDescriptor: {
    typeUrl: string;
    encode(message: AuthnDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AuthnDescriptor;
    fromJSON(object: any): AuthnDescriptor;
    toJSON(message: AuthnDescriptor): JsonSafe<AuthnDescriptor>;
    fromPartial(object: Partial<AuthnDescriptor>): AuthnDescriptor;
    fromProtoMsg(message: AuthnDescriptorProtoMsg): AuthnDescriptor;
    toProto(message: AuthnDescriptor): Uint8Array;
    toProtoMsg(message: AuthnDescriptor): AuthnDescriptorProtoMsg;
};
export declare const SigningModeDescriptor: {
    typeUrl: string;
    encode(message: SigningModeDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SigningModeDescriptor;
    fromJSON(object: any): SigningModeDescriptor;
    toJSON(message: SigningModeDescriptor): JsonSafe<SigningModeDescriptor>;
    fromPartial(object: Partial<SigningModeDescriptor>): SigningModeDescriptor;
    fromProtoMsg(message: SigningModeDescriptorProtoMsg): SigningModeDescriptor;
    toProto(message: SigningModeDescriptor): Uint8Array;
    toProtoMsg(message: SigningModeDescriptor): SigningModeDescriptorProtoMsg;
};
export declare const ChainDescriptor: {
    typeUrl: string;
    encode(message: ChainDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ChainDescriptor;
    fromJSON(object: any): ChainDescriptor;
    toJSON(message: ChainDescriptor): JsonSafe<ChainDescriptor>;
    fromPartial(object: Partial<ChainDescriptor>): ChainDescriptor;
    fromProtoMsg(message: ChainDescriptorProtoMsg): ChainDescriptor;
    toProto(message: ChainDescriptor): Uint8Array;
    toProtoMsg(message: ChainDescriptor): ChainDescriptorProtoMsg;
};
export declare const CodecDescriptor: {
    typeUrl: string;
    encode(message: CodecDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CodecDescriptor;
    fromJSON(object: any): CodecDescriptor;
    toJSON(message: CodecDescriptor): JsonSafe<CodecDescriptor>;
    fromPartial(object: Partial<CodecDescriptor>): CodecDescriptor;
    fromProtoMsg(message: CodecDescriptorProtoMsg): CodecDescriptor;
    toProto(message: CodecDescriptor): Uint8Array;
    toProtoMsg(message: CodecDescriptor): CodecDescriptorProtoMsg;
};
export declare const InterfaceDescriptor: {
    typeUrl: string;
    encode(message: InterfaceDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterfaceDescriptor;
    fromJSON(object: any): InterfaceDescriptor;
    toJSON(message: InterfaceDescriptor): JsonSafe<InterfaceDescriptor>;
    fromPartial(object: Partial<InterfaceDescriptor>): InterfaceDescriptor;
    fromProtoMsg(message: InterfaceDescriptorProtoMsg): InterfaceDescriptor;
    toProto(message: InterfaceDescriptor): Uint8Array;
    toProtoMsg(message: InterfaceDescriptor): InterfaceDescriptorProtoMsg;
};
export declare const InterfaceImplementerDescriptor: {
    typeUrl: string;
    encode(message: InterfaceImplementerDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterfaceImplementerDescriptor;
    fromJSON(object: any): InterfaceImplementerDescriptor;
    toJSON(message: InterfaceImplementerDescriptor): JsonSafe<InterfaceImplementerDescriptor>;
    fromPartial(object: Partial<InterfaceImplementerDescriptor>): InterfaceImplementerDescriptor;
    fromProtoMsg(message: InterfaceImplementerDescriptorProtoMsg): InterfaceImplementerDescriptor;
    toProto(message: InterfaceImplementerDescriptor): Uint8Array;
    toProtoMsg(message: InterfaceImplementerDescriptor): InterfaceImplementerDescriptorProtoMsg;
};
export declare const InterfaceAcceptingMessageDescriptor: {
    typeUrl: string;
    encode(message: InterfaceAcceptingMessageDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterfaceAcceptingMessageDescriptor;
    fromJSON(object: any): InterfaceAcceptingMessageDescriptor;
    toJSON(message: InterfaceAcceptingMessageDescriptor): JsonSafe<InterfaceAcceptingMessageDescriptor>;
    fromPartial(object: Partial<InterfaceAcceptingMessageDescriptor>): InterfaceAcceptingMessageDescriptor;
    fromProtoMsg(message: InterfaceAcceptingMessageDescriptorProtoMsg): InterfaceAcceptingMessageDescriptor;
    toProto(message: InterfaceAcceptingMessageDescriptor): Uint8Array;
    toProtoMsg(message: InterfaceAcceptingMessageDescriptor): InterfaceAcceptingMessageDescriptorProtoMsg;
};
export declare const ConfigurationDescriptor: {
    typeUrl: string;
    encode(message: ConfigurationDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConfigurationDescriptor;
    fromJSON(object: any): ConfigurationDescriptor;
    toJSON(message: ConfigurationDescriptor): JsonSafe<ConfigurationDescriptor>;
    fromPartial(object: Partial<ConfigurationDescriptor>): ConfigurationDescriptor;
    fromProtoMsg(message: ConfigurationDescriptorProtoMsg): ConfigurationDescriptor;
    toProto(message: ConfigurationDescriptor): Uint8Array;
    toProtoMsg(message: ConfigurationDescriptor): ConfigurationDescriptorProtoMsg;
};
export declare const MsgDescriptor: {
    typeUrl: string;
    encode(message: MsgDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDescriptor;
    fromJSON(object: any): MsgDescriptor;
    toJSON(message: MsgDescriptor): JsonSafe<MsgDescriptor>;
    fromPartial(object: Partial<MsgDescriptor>): MsgDescriptor;
    fromProtoMsg(message: MsgDescriptorProtoMsg): MsgDescriptor;
    toProto(message: MsgDescriptor): Uint8Array;
    toProtoMsg(message: MsgDescriptor): MsgDescriptorProtoMsg;
};
export declare const GetAuthnDescriptorRequest: {
    typeUrl: string;
    encode(_: GetAuthnDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetAuthnDescriptorRequest;
    fromJSON(_: any): GetAuthnDescriptorRequest;
    toJSON(_: GetAuthnDescriptorRequest): JsonSafe<GetAuthnDescriptorRequest>;
    fromPartial(_: Partial<GetAuthnDescriptorRequest>): GetAuthnDescriptorRequest;
    fromProtoMsg(message: GetAuthnDescriptorRequestProtoMsg): GetAuthnDescriptorRequest;
    toProto(message: GetAuthnDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetAuthnDescriptorRequest): GetAuthnDescriptorRequestProtoMsg;
};
export declare const GetAuthnDescriptorResponse: {
    typeUrl: string;
    encode(message: GetAuthnDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetAuthnDescriptorResponse;
    fromJSON(object: any): GetAuthnDescriptorResponse;
    toJSON(message: GetAuthnDescriptorResponse): JsonSafe<GetAuthnDescriptorResponse>;
    fromPartial(object: Partial<GetAuthnDescriptorResponse>): GetAuthnDescriptorResponse;
    fromProtoMsg(message: GetAuthnDescriptorResponseProtoMsg): GetAuthnDescriptorResponse;
    toProto(message: GetAuthnDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetAuthnDescriptorResponse): GetAuthnDescriptorResponseProtoMsg;
};
export declare const GetChainDescriptorRequest: {
    typeUrl: string;
    encode(_: GetChainDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetChainDescriptorRequest;
    fromJSON(_: any): GetChainDescriptorRequest;
    toJSON(_: GetChainDescriptorRequest): JsonSafe<GetChainDescriptorRequest>;
    fromPartial(_: Partial<GetChainDescriptorRequest>): GetChainDescriptorRequest;
    fromProtoMsg(message: GetChainDescriptorRequestProtoMsg): GetChainDescriptorRequest;
    toProto(message: GetChainDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetChainDescriptorRequest): GetChainDescriptorRequestProtoMsg;
};
export declare const GetChainDescriptorResponse: {
    typeUrl: string;
    encode(message: GetChainDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetChainDescriptorResponse;
    fromJSON(object: any): GetChainDescriptorResponse;
    toJSON(message: GetChainDescriptorResponse): JsonSafe<GetChainDescriptorResponse>;
    fromPartial(object: Partial<GetChainDescriptorResponse>): GetChainDescriptorResponse;
    fromProtoMsg(message: GetChainDescriptorResponseProtoMsg): GetChainDescriptorResponse;
    toProto(message: GetChainDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetChainDescriptorResponse): GetChainDescriptorResponseProtoMsg;
};
export declare const GetCodecDescriptorRequest: {
    typeUrl: string;
    encode(_: GetCodecDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetCodecDescriptorRequest;
    fromJSON(_: any): GetCodecDescriptorRequest;
    toJSON(_: GetCodecDescriptorRequest): JsonSafe<GetCodecDescriptorRequest>;
    fromPartial(_: Partial<GetCodecDescriptorRequest>): GetCodecDescriptorRequest;
    fromProtoMsg(message: GetCodecDescriptorRequestProtoMsg): GetCodecDescriptorRequest;
    toProto(message: GetCodecDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetCodecDescriptorRequest): GetCodecDescriptorRequestProtoMsg;
};
export declare const GetCodecDescriptorResponse: {
    typeUrl: string;
    encode(message: GetCodecDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetCodecDescriptorResponse;
    fromJSON(object: any): GetCodecDescriptorResponse;
    toJSON(message: GetCodecDescriptorResponse): JsonSafe<GetCodecDescriptorResponse>;
    fromPartial(object: Partial<GetCodecDescriptorResponse>): GetCodecDescriptorResponse;
    fromProtoMsg(message: GetCodecDescriptorResponseProtoMsg): GetCodecDescriptorResponse;
    toProto(message: GetCodecDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetCodecDescriptorResponse): GetCodecDescriptorResponseProtoMsg;
};
export declare const GetConfigurationDescriptorRequest: {
    typeUrl: string;
    encode(_: GetConfigurationDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetConfigurationDescriptorRequest;
    fromJSON(_: any): GetConfigurationDescriptorRequest;
    toJSON(_: GetConfigurationDescriptorRequest): JsonSafe<GetConfigurationDescriptorRequest>;
    fromPartial(_: Partial<GetConfigurationDescriptorRequest>): GetConfigurationDescriptorRequest;
    fromProtoMsg(message: GetConfigurationDescriptorRequestProtoMsg): GetConfigurationDescriptorRequest;
    toProto(message: GetConfigurationDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetConfigurationDescriptorRequest): GetConfigurationDescriptorRequestProtoMsg;
};
export declare const GetConfigurationDescriptorResponse: {
    typeUrl: string;
    encode(message: GetConfigurationDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetConfigurationDescriptorResponse;
    fromJSON(object: any): GetConfigurationDescriptorResponse;
    toJSON(message: GetConfigurationDescriptorResponse): JsonSafe<GetConfigurationDescriptorResponse>;
    fromPartial(object: Partial<GetConfigurationDescriptorResponse>): GetConfigurationDescriptorResponse;
    fromProtoMsg(message: GetConfigurationDescriptorResponseProtoMsg): GetConfigurationDescriptorResponse;
    toProto(message: GetConfigurationDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetConfigurationDescriptorResponse): GetConfigurationDescriptorResponseProtoMsg;
};
export declare const GetQueryServicesDescriptorRequest: {
    typeUrl: string;
    encode(_: GetQueryServicesDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetQueryServicesDescriptorRequest;
    fromJSON(_: any): GetQueryServicesDescriptorRequest;
    toJSON(_: GetQueryServicesDescriptorRequest): JsonSafe<GetQueryServicesDescriptorRequest>;
    fromPartial(_: Partial<GetQueryServicesDescriptorRequest>): GetQueryServicesDescriptorRequest;
    fromProtoMsg(message: GetQueryServicesDescriptorRequestProtoMsg): GetQueryServicesDescriptorRequest;
    toProto(message: GetQueryServicesDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetQueryServicesDescriptorRequest): GetQueryServicesDescriptorRequestProtoMsg;
};
export declare const GetQueryServicesDescriptorResponse: {
    typeUrl: string;
    encode(message: GetQueryServicesDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetQueryServicesDescriptorResponse;
    fromJSON(object: any): GetQueryServicesDescriptorResponse;
    toJSON(message: GetQueryServicesDescriptorResponse): JsonSafe<GetQueryServicesDescriptorResponse>;
    fromPartial(object: Partial<GetQueryServicesDescriptorResponse>): GetQueryServicesDescriptorResponse;
    fromProtoMsg(message: GetQueryServicesDescriptorResponseProtoMsg): GetQueryServicesDescriptorResponse;
    toProto(message: GetQueryServicesDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetQueryServicesDescriptorResponse): GetQueryServicesDescriptorResponseProtoMsg;
};
export declare const GetTxDescriptorRequest: {
    typeUrl: string;
    encode(_: GetTxDescriptorRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxDescriptorRequest;
    fromJSON(_: any): GetTxDescriptorRequest;
    toJSON(_: GetTxDescriptorRequest): JsonSafe<GetTxDescriptorRequest>;
    fromPartial(_: Partial<GetTxDescriptorRequest>): GetTxDescriptorRequest;
    fromProtoMsg(message: GetTxDescriptorRequestProtoMsg): GetTxDescriptorRequest;
    toProto(message: GetTxDescriptorRequest): Uint8Array;
    toProtoMsg(message: GetTxDescriptorRequest): GetTxDescriptorRequestProtoMsg;
};
export declare const GetTxDescriptorResponse: {
    typeUrl: string;
    encode(message: GetTxDescriptorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxDescriptorResponse;
    fromJSON(object: any): GetTxDescriptorResponse;
    toJSON(message: GetTxDescriptorResponse): JsonSafe<GetTxDescriptorResponse>;
    fromPartial(object: Partial<GetTxDescriptorResponse>): GetTxDescriptorResponse;
    fromProtoMsg(message: GetTxDescriptorResponseProtoMsg): GetTxDescriptorResponse;
    toProto(message: GetTxDescriptorResponse): Uint8Array;
    toProtoMsg(message: GetTxDescriptorResponse): GetTxDescriptorResponseProtoMsg;
};
export declare const QueryServicesDescriptor: {
    typeUrl: string;
    encode(message: QueryServicesDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryServicesDescriptor;
    fromJSON(object: any): QueryServicesDescriptor;
    toJSON(message: QueryServicesDescriptor): JsonSafe<QueryServicesDescriptor>;
    fromPartial(object: Partial<QueryServicesDescriptor>): QueryServicesDescriptor;
    fromProtoMsg(message: QueryServicesDescriptorProtoMsg): QueryServicesDescriptor;
    toProto(message: QueryServicesDescriptor): Uint8Array;
    toProtoMsg(message: QueryServicesDescriptor): QueryServicesDescriptorProtoMsg;
};
export declare const QueryServiceDescriptor: {
    typeUrl: string;
    encode(message: QueryServiceDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryServiceDescriptor;
    fromJSON(object: any): QueryServiceDescriptor;
    toJSON(message: QueryServiceDescriptor): JsonSafe<QueryServiceDescriptor>;
    fromPartial(object: Partial<QueryServiceDescriptor>): QueryServiceDescriptor;
    fromProtoMsg(message: QueryServiceDescriptorProtoMsg): QueryServiceDescriptor;
    toProto(message: QueryServiceDescriptor): Uint8Array;
    toProtoMsg(message: QueryServiceDescriptor): QueryServiceDescriptorProtoMsg;
};
export declare const QueryMethodDescriptor: {
    typeUrl: string;
    encode(message: QueryMethodDescriptor, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryMethodDescriptor;
    fromJSON(object: any): QueryMethodDescriptor;
    toJSON(message: QueryMethodDescriptor): JsonSafe<QueryMethodDescriptor>;
    fromPartial(object: Partial<QueryMethodDescriptor>): QueryMethodDescriptor;
    fromProtoMsg(message: QueryMethodDescriptorProtoMsg): QueryMethodDescriptor;
    toProto(message: QueryMethodDescriptor): Uint8Array;
    toProtoMsg(message: QueryMethodDescriptor): QueryMethodDescriptorProtoMsg;
};
