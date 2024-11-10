//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
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
export interface GetAuthnDescriptorRequest {}
export interface GetAuthnDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest';
  value: Uint8Array;
}
/** GetAuthnDescriptorRequest is the request used for the GetAuthnDescriptor RPC */
export interface GetAuthnDescriptorRequestSDKType {}
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
export interface GetChainDescriptorRequest {}
export interface GetChainDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest';
  value: Uint8Array;
}
/** GetChainDescriptorRequest is the request used for the GetChainDescriptor RPC */
export interface GetChainDescriptorRequestSDKType {}
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
export interface GetCodecDescriptorRequest {}
export interface GetCodecDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest';
  value: Uint8Array;
}
/** GetCodecDescriptorRequest is the request used for the GetCodecDescriptor RPC */
export interface GetCodecDescriptorRequestSDKType {}
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
export interface GetConfigurationDescriptorRequest {}
export interface GetConfigurationDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest';
  value: Uint8Array;
}
/** GetConfigurationDescriptorRequest is the request used for the GetConfigurationDescriptor RPC */
export interface GetConfigurationDescriptorRequestSDKType {}
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
export interface GetQueryServicesDescriptorRequest {}
export interface GetQueryServicesDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest';
  value: Uint8Array;
}
/** GetQueryServicesDescriptorRequest is the request used for the GetQueryServicesDescriptor RPC */
export interface GetQueryServicesDescriptorRequestSDKType {}
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
export interface GetTxDescriptorRequest {}
export interface GetTxDescriptorRequestProtoMsg {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest';
  value: Uint8Array;
}
/** GetTxDescriptorRequest is the request used for the GetTxDescriptor RPC */
export interface GetTxDescriptorRequestSDKType {}
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
function createBaseAppDescriptor(): AppDescriptor {
  return {
    authn: undefined,
    chain: undefined,
    codec: undefined,
    configuration: undefined,
    queryServices: undefined,
    tx: undefined,
  };
}
export const AppDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.AppDescriptor',
  encode(
    message: AppDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authn !== undefined) {
      AuthnDescriptor.encode(message.authn, writer.uint32(10).fork()).ldelim();
    }
    if (message.chain !== undefined) {
      ChainDescriptor.encode(message.chain, writer.uint32(18).fork()).ldelim();
    }
    if (message.codec !== undefined) {
      CodecDescriptor.encode(message.codec, writer.uint32(26).fork()).ldelim();
    }
    if (message.configuration !== undefined) {
      ConfigurationDescriptor.encode(
        message.configuration,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.queryServices !== undefined) {
      QueryServicesDescriptor.encode(
        message.queryServices,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.tx !== undefined) {
      TxDescriptor.encode(message.tx, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): AppDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAppDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authn = AuthnDescriptor.decode(reader, reader.uint32());
          break;
        case 2:
          message.chain = ChainDescriptor.decode(reader, reader.uint32());
          break;
        case 3:
          message.codec = CodecDescriptor.decode(reader, reader.uint32());
          break;
        case 4:
          message.configuration = ConfigurationDescriptor.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.queryServices = QueryServicesDescriptor.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.tx = TxDescriptor.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): AppDescriptor {
    return {
      authn: isSet(object.authn)
        ? AuthnDescriptor.fromJSON(object.authn)
        : undefined,
      chain: isSet(object.chain)
        ? ChainDescriptor.fromJSON(object.chain)
        : undefined,
      codec: isSet(object.codec)
        ? CodecDescriptor.fromJSON(object.codec)
        : undefined,
      configuration: isSet(object.configuration)
        ? ConfigurationDescriptor.fromJSON(object.configuration)
        : undefined,
      queryServices: isSet(object.queryServices)
        ? QueryServicesDescriptor.fromJSON(object.queryServices)
        : undefined,
      tx: isSet(object.tx) ? TxDescriptor.fromJSON(object.tx) : undefined,
    };
  },
  toJSON(message: AppDescriptor): JsonSafe<AppDescriptor> {
    const obj: any = {};
    message.authn !== undefined &&
      (obj.authn = message.authn
        ? AuthnDescriptor.toJSON(message.authn)
        : undefined);
    message.chain !== undefined &&
      (obj.chain = message.chain
        ? ChainDescriptor.toJSON(message.chain)
        : undefined);
    message.codec !== undefined &&
      (obj.codec = message.codec
        ? CodecDescriptor.toJSON(message.codec)
        : undefined);
    message.configuration !== undefined &&
      (obj.configuration = message.configuration
        ? ConfigurationDescriptor.toJSON(message.configuration)
        : undefined);
    message.queryServices !== undefined &&
      (obj.queryServices = message.queryServices
        ? QueryServicesDescriptor.toJSON(message.queryServices)
        : undefined);
    message.tx !== undefined &&
      (obj.tx = message.tx ? TxDescriptor.toJSON(message.tx) : undefined);
    return obj;
  },
  fromPartial(object: Partial<AppDescriptor>): AppDescriptor {
    const message = createBaseAppDescriptor();
    message.authn =
      object.authn !== undefined && object.authn !== null
        ? AuthnDescriptor.fromPartial(object.authn)
        : undefined;
    message.chain =
      object.chain !== undefined && object.chain !== null
        ? ChainDescriptor.fromPartial(object.chain)
        : undefined;
    message.codec =
      object.codec !== undefined && object.codec !== null
        ? CodecDescriptor.fromPartial(object.codec)
        : undefined;
    message.configuration =
      object.configuration !== undefined && object.configuration !== null
        ? ConfigurationDescriptor.fromPartial(object.configuration)
        : undefined;
    message.queryServices =
      object.queryServices !== undefined && object.queryServices !== null
        ? QueryServicesDescriptor.fromPartial(object.queryServices)
        : undefined;
    message.tx =
      object.tx !== undefined && object.tx !== null
        ? TxDescriptor.fromPartial(object.tx)
        : undefined;
    return message;
  },
  fromProtoMsg(message: AppDescriptorProtoMsg): AppDescriptor {
    return AppDescriptor.decode(message.value);
  },
  toProto(message: AppDescriptor): Uint8Array {
    return AppDescriptor.encode(message).finish();
  },
  toProtoMsg(message: AppDescriptor): AppDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.AppDescriptor',
      value: AppDescriptor.encode(message).finish(),
    };
  },
};
function createBaseTxDescriptor(): TxDescriptor {
  return {
    fullname: '',
    msgs: [],
  };
}
export const TxDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.TxDescriptor',
  encode(
    message: TxDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullname !== '') {
      writer.uint32(10).string(message.fullname);
    }
    for (const v of message.msgs) {
      MsgDescriptor.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TxDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTxDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullname = reader.string();
          break;
        case 2:
          message.msgs.push(MsgDescriptor.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TxDescriptor {
    return {
      fullname: isSet(object.fullname) ? String(object.fullname) : '',
      msgs: Array.isArray(object?.msgs)
        ? object.msgs.map((e: any) => MsgDescriptor.fromJSON(e))
        : [],
    };
  },
  toJSON(message: TxDescriptor): JsonSafe<TxDescriptor> {
    const obj: any = {};
    message.fullname !== undefined && (obj.fullname = message.fullname);
    if (message.msgs) {
      obj.msgs = message.msgs.map(e =>
        e ? MsgDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.msgs = [];
    }
    return obj;
  },
  fromPartial(object: Partial<TxDescriptor>): TxDescriptor {
    const message = createBaseTxDescriptor();
    message.fullname = object.fullname ?? '';
    message.msgs = object.msgs?.map(e => MsgDescriptor.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: TxDescriptorProtoMsg): TxDescriptor {
    return TxDescriptor.decode(message.value);
  },
  toProto(message: TxDescriptor): Uint8Array {
    return TxDescriptor.encode(message).finish();
  },
  toProtoMsg(message: TxDescriptor): TxDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.TxDescriptor',
      value: TxDescriptor.encode(message).finish(),
    };
  },
};
function createBaseAuthnDescriptor(): AuthnDescriptor {
  return {
    signModes: [],
  };
}
export const AuthnDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.AuthnDescriptor',
  encode(
    message: AuthnDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.signModes) {
      SigningModeDescriptor.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): AuthnDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthnDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signModes.push(
            SigningModeDescriptor.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): AuthnDescriptor {
    return {
      signModes: Array.isArray(object?.signModes)
        ? object.signModes.map((e: any) => SigningModeDescriptor.fromJSON(e))
        : [],
    };
  },
  toJSON(message: AuthnDescriptor): JsonSafe<AuthnDescriptor> {
    const obj: any = {};
    if (message.signModes) {
      obj.signModes = message.signModes.map(e =>
        e ? SigningModeDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.signModes = [];
    }
    return obj;
  },
  fromPartial(object: Partial<AuthnDescriptor>): AuthnDescriptor {
    const message = createBaseAuthnDescriptor();
    message.signModes =
      object.signModes?.map(e => SigningModeDescriptor.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: AuthnDescriptorProtoMsg): AuthnDescriptor {
    return AuthnDescriptor.decode(message.value);
  },
  toProto(message: AuthnDescriptor): Uint8Array {
    return AuthnDescriptor.encode(message).finish();
  },
  toProtoMsg(message: AuthnDescriptor): AuthnDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.AuthnDescriptor',
      value: AuthnDescriptor.encode(message).finish(),
    };
  },
};
function createBaseSigningModeDescriptor(): SigningModeDescriptor {
  return {
    name: '',
    number: 0,
    authnInfoProviderMethodFullname: '',
  };
}
export const SigningModeDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.SigningModeDescriptor',
  encode(
    message: SigningModeDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.number !== 0) {
      writer.uint32(16).int32(message.number);
    }
    if (message.authnInfoProviderMethodFullname !== '') {
      writer.uint32(26).string(message.authnInfoProviderMethodFullname);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): SigningModeDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSigningModeDescriptor();
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
          message.authnInfoProviderMethodFullname = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SigningModeDescriptor {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      number: isSet(object.number) ? Number(object.number) : 0,
      authnInfoProviderMethodFullname: isSet(
        object.authnInfoProviderMethodFullname,
      )
        ? String(object.authnInfoProviderMethodFullname)
        : '',
    };
  },
  toJSON(message: SigningModeDescriptor): JsonSafe<SigningModeDescriptor> {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.number !== undefined && (obj.number = Math.round(message.number));
    message.authnInfoProviderMethodFullname !== undefined &&
      (obj.authnInfoProviderMethodFullname =
        message.authnInfoProviderMethodFullname);
    return obj;
  },
  fromPartial(object: Partial<SigningModeDescriptor>): SigningModeDescriptor {
    const message = createBaseSigningModeDescriptor();
    message.name = object.name ?? '';
    message.number = object.number ?? 0;
    message.authnInfoProviderMethodFullname =
      object.authnInfoProviderMethodFullname ?? '';
    return message;
  },
  fromProtoMsg(message: SigningModeDescriptorProtoMsg): SigningModeDescriptor {
    return SigningModeDescriptor.decode(message.value);
  },
  toProto(message: SigningModeDescriptor): Uint8Array {
    return SigningModeDescriptor.encode(message).finish();
  },
  toProtoMsg(message: SigningModeDescriptor): SigningModeDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.SigningModeDescriptor',
      value: SigningModeDescriptor.encode(message).finish(),
    };
  },
};
function createBaseChainDescriptor(): ChainDescriptor {
  return {
    id: '',
  };
}
export const ChainDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.ChainDescriptor',
  encode(
    message: ChainDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ChainDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChainDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ChainDescriptor {
    return {
      id: isSet(object.id) ? String(object.id) : '',
    };
  },
  toJSON(message: ChainDescriptor): JsonSafe<ChainDescriptor> {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },
  fromPartial(object: Partial<ChainDescriptor>): ChainDescriptor {
    const message = createBaseChainDescriptor();
    message.id = object.id ?? '';
    return message;
  },
  fromProtoMsg(message: ChainDescriptorProtoMsg): ChainDescriptor {
    return ChainDescriptor.decode(message.value);
  },
  toProto(message: ChainDescriptor): Uint8Array {
    return ChainDescriptor.encode(message).finish();
  },
  toProtoMsg(message: ChainDescriptor): ChainDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.ChainDescriptor',
      value: ChainDescriptor.encode(message).finish(),
    };
  },
};
function createBaseCodecDescriptor(): CodecDescriptor {
  return {
    interfaces: [],
  };
}
export const CodecDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.CodecDescriptor',
  encode(
    message: CodecDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.interfaces) {
      InterfaceDescriptor.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CodecDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCodecDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.interfaces.push(
            InterfaceDescriptor.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CodecDescriptor {
    return {
      interfaces: Array.isArray(object?.interfaces)
        ? object.interfaces.map((e: any) => InterfaceDescriptor.fromJSON(e))
        : [],
    };
  },
  toJSON(message: CodecDescriptor): JsonSafe<CodecDescriptor> {
    const obj: any = {};
    if (message.interfaces) {
      obj.interfaces = message.interfaces.map(e =>
        e ? InterfaceDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.interfaces = [];
    }
    return obj;
  },
  fromPartial(object: Partial<CodecDescriptor>): CodecDescriptor {
    const message = createBaseCodecDescriptor();
    message.interfaces =
      object.interfaces?.map(e => InterfaceDescriptor.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CodecDescriptorProtoMsg): CodecDescriptor {
    return CodecDescriptor.decode(message.value);
  },
  toProto(message: CodecDescriptor): Uint8Array {
    return CodecDescriptor.encode(message).finish();
  },
  toProtoMsg(message: CodecDescriptor): CodecDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.CodecDescriptor',
      value: CodecDescriptor.encode(message).finish(),
    };
  },
};
function createBaseInterfaceDescriptor(): InterfaceDescriptor {
  return {
    fullname: '',
    interfaceAcceptingMessages: [],
    interfaceImplementers: [],
  };
}
export const InterfaceDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceDescriptor',
  encode(
    message: InterfaceDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullname !== '') {
      writer.uint32(10).string(message.fullname);
    }
    for (const v of message.interfaceAcceptingMessages) {
      InterfaceAcceptingMessageDescriptor.encode(
        v!,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    for (const v of message.interfaceImplementers) {
      InterfaceImplementerDescriptor.encode(
        v!,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InterfaceDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInterfaceDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullname = reader.string();
          break;
        case 2:
          message.interfaceAcceptingMessages.push(
            InterfaceAcceptingMessageDescriptor.decode(reader, reader.uint32()),
          );
          break;
        case 3:
          message.interfaceImplementers.push(
            InterfaceImplementerDescriptor.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InterfaceDescriptor {
    return {
      fullname: isSet(object.fullname) ? String(object.fullname) : '',
      interfaceAcceptingMessages: Array.isArray(
        object?.interfaceAcceptingMessages,
      )
        ? object.interfaceAcceptingMessages.map((e: any) =>
            InterfaceAcceptingMessageDescriptor.fromJSON(e),
          )
        : [],
      interfaceImplementers: Array.isArray(object?.interfaceImplementers)
        ? object.interfaceImplementers.map((e: any) =>
            InterfaceImplementerDescriptor.fromJSON(e),
          )
        : [],
    };
  },
  toJSON(message: InterfaceDescriptor): JsonSafe<InterfaceDescriptor> {
    const obj: any = {};
    message.fullname !== undefined && (obj.fullname = message.fullname);
    if (message.interfaceAcceptingMessages) {
      obj.interfaceAcceptingMessages = message.interfaceAcceptingMessages.map(
        e => (e ? InterfaceAcceptingMessageDescriptor.toJSON(e) : undefined),
      );
    } else {
      obj.interfaceAcceptingMessages = [];
    }
    if (message.interfaceImplementers) {
      obj.interfaceImplementers = message.interfaceImplementers.map(e =>
        e ? InterfaceImplementerDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.interfaceImplementers = [];
    }
    return obj;
  },
  fromPartial(object: Partial<InterfaceDescriptor>): InterfaceDescriptor {
    const message = createBaseInterfaceDescriptor();
    message.fullname = object.fullname ?? '';
    message.interfaceAcceptingMessages =
      object.interfaceAcceptingMessages?.map(e =>
        InterfaceAcceptingMessageDescriptor.fromPartial(e),
      ) || [];
    message.interfaceImplementers =
      object.interfaceImplementers?.map(e =>
        InterfaceImplementerDescriptor.fromPartial(e),
      ) || [];
    return message;
  },
  fromProtoMsg(message: InterfaceDescriptorProtoMsg): InterfaceDescriptor {
    return InterfaceDescriptor.decode(message.value);
  },
  toProto(message: InterfaceDescriptor): Uint8Array {
    return InterfaceDescriptor.encode(message).finish();
  },
  toProtoMsg(message: InterfaceDescriptor): InterfaceDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceDescriptor',
      value: InterfaceDescriptor.encode(message).finish(),
    };
  },
};
function createBaseInterfaceImplementerDescriptor(): InterfaceImplementerDescriptor {
  return {
    fullname: '',
    typeUrl: '',
  };
}
export const InterfaceImplementerDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceImplementerDescriptor',
  encode(
    message: InterfaceImplementerDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullname !== '') {
      writer.uint32(10).string(message.fullname);
    }
    if (message.typeUrl !== '') {
      writer.uint32(18).string(message.typeUrl);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InterfaceImplementerDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInterfaceImplementerDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullname = reader.string();
          break;
        case 2:
          message.typeUrl = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InterfaceImplementerDescriptor {
    return {
      fullname: isSet(object.fullname) ? String(object.fullname) : '',
      typeUrl: isSet(object.typeUrl) ? String(object.typeUrl) : '',
    };
  },
  toJSON(
    message: InterfaceImplementerDescriptor,
  ): JsonSafe<InterfaceImplementerDescriptor> {
    const obj: any = {};
    message.fullname !== undefined && (obj.fullname = message.fullname);
    message.typeUrl !== undefined && (obj.typeUrl = message.typeUrl);
    return obj;
  },
  fromPartial(
    object: Partial<InterfaceImplementerDescriptor>,
  ): InterfaceImplementerDescriptor {
    const message = createBaseInterfaceImplementerDescriptor();
    message.fullname = object.fullname ?? '';
    message.typeUrl = object.typeUrl ?? '';
    return message;
  },
  fromProtoMsg(
    message: InterfaceImplementerDescriptorProtoMsg,
  ): InterfaceImplementerDescriptor {
    return InterfaceImplementerDescriptor.decode(message.value);
  },
  toProto(message: InterfaceImplementerDescriptor): Uint8Array {
    return InterfaceImplementerDescriptor.encode(message).finish();
  },
  toProtoMsg(
    message: InterfaceImplementerDescriptor,
  ): InterfaceImplementerDescriptorProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.InterfaceImplementerDescriptor',
      value: InterfaceImplementerDescriptor.encode(message).finish(),
    };
  },
};
function createBaseInterfaceAcceptingMessageDescriptor(): InterfaceAcceptingMessageDescriptor {
  return {
    fullname: '',
    fieldDescriptorNames: [],
  };
}
export const InterfaceAcceptingMessageDescriptor = {
  typeUrl:
    '/cosmos.base.reflection.v2alpha1.InterfaceAcceptingMessageDescriptor',
  encode(
    message: InterfaceAcceptingMessageDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullname !== '') {
      writer.uint32(10).string(message.fullname);
    }
    for (const v of message.fieldDescriptorNames) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InterfaceAcceptingMessageDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInterfaceAcceptingMessageDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullname = reader.string();
          break;
        case 2:
          message.fieldDescriptorNames.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InterfaceAcceptingMessageDescriptor {
    return {
      fullname: isSet(object.fullname) ? String(object.fullname) : '',
      fieldDescriptorNames: Array.isArray(object?.fieldDescriptorNames)
        ? object.fieldDescriptorNames.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(
    message: InterfaceAcceptingMessageDescriptor,
  ): JsonSafe<InterfaceAcceptingMessageDescriptor> {
    const obj: any = {};
    message.fullname !== undefined && (obj.fullname = message.fullname);
    if (message.fieldDescriptorNames) {
      obj.fieldDescriptorNames = message.fieldDescriptorNames.map(e => e);
    } else {
      obj.fieldDescriptorNames = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<InterfaceAcceptingMessageDescriptor>,
  ): InterfaceAcceptingMessageDescriptor {
    const message = createBaseInterfaceAcceptingMessageDescriptor();
    message.fullname = object.fullname ?? '';
    message.fieldDescriptorNames =
      object.fieldDescriptorNames?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(
    message: InterfaceAcceptingMessageDescriptorProtoMsg,
  ): InterfaceAcceptingMessageDescriptor {
    return InterfaceAcceptingMessageDescriptor.decode(message.value);
  },
  toProto(message: InterfaceAcceptingMessageDescriptor): Uint8Array {
    return InterfaceAcceptingMessageDescriptor.encode(message).finish();
  },
  toProtoMsg(
    message: InterfaceAcceptingMessageDescriptor,
  ): InterfaceAcceptingMessageDescriptorProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.InterfaceAcceptingMessageDescriptor',
      value: InterfaceAcceptingMessageDescriptor.encode(message).finish(),
    };
  },
};
function createBaseConfigurationDescriptor(): ConfigurationDescriptor {
  return {
    bech32AccountAddressPrefix: '',
  };
}
export const ConfigurationDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.ConfigurationDescriptor',
  encode(
    message: ConfigurationDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.bech32AccountAddressPrefix !== '') {
      writer.uint32(10).string(message.bech32AccountAddressPrefix);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ConfigurationDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConfigurationDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bech32AccountAddressPrefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConfigurationDescriptor {
    return {
      bech32AccountAddressPrefix: isSet(object.bech32AccountAddressPrefix)
        ? String(object.bech32AccountAddressPrefix)
        : '',
    };
  },
  toJSON(message: ConfigurationDescriptor): JsonSafe<ConfigurationDescriptor> {
    const obj: any = {};
    message.bech32AccountAddressPrefix !== undefined &&
      (obj.bech32AccountAddressPrefix = message.bech32AccountAddressPrefix);
    return obj;
  },
  fromPartial(
    object: Partial<ConfigurationDescriptor>,
  ): ConfigurationDescriptor {
    const message = createBaseConfigurationDescriptor();
    message.bech32AccountAddressPrefix =
      object.bech32AccountAddressPrefix ?? '';
    return message;
  },
  fromProtoMsg(
    message: ConfigurationDescriptorProtoMsg,
  ): ConfigurationDescriptor {
    return ConfigurationDescriptor.decode(message.value);
  },
  toProto(message: ConfigurationDescriptor): Uint8Array {
    return ConfigurationDescriptor.encode(message).finish();
  },
  toProtoMsg(
    message: ConfigurationDescriptor,
  ): ConfigurationDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.ConfigurationDescriptor',
      value: ConfigurationDescriptor.encode(message).finish(),
    };
  },
};
function createBaseMsgDescriptor(): MsgDescriptor {
  return {
    msgTypeUrl: '',
  };
}
export const MsgDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.MsgDescriptor',
  encode(
    message: MsgDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.msgTypeUrl !== '') {
      writer.uint32(10).string(message.msgTypeUrl);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msgTypeUrl = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgDescriptor {
    return {
      msgTypeUrl: isSet(object.msgTypeUrl) ? String(object.msgTypeUrl) : '',
    };
  },
  toJSON(message: MsgDescriptor): JsonSafe<MsgDescriptor> {
    const obj: any = {};
    message.msgTypeUrl !== undefined && (obj.msgTypeUrl = message.msgTypeUrl);
    return obj;
  },
  fromPartial(object: Partial<MsgDescriptor>): MsgDescriptor {
    const message = createBaseMsgDescriptor();
    message.msgTypeUrl = object.msgTypeUrl ?? '';
    return message;
  },
  fromProtoMsg(message: MsgDescriptorProtoMsg): MsgDescriptor {
    return MsgDescriptor.decode(message.value);
  },
  toProto(message: MsgDescriptor): Uint8Array {
    return MsgDescriptor.encode(message).finish();
  },
  toProtoMsg(message: MsgDescriptor): MsgDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.MsgDescriptor',
      value: MsgDescriptor.encode(message).finish(),
    };
  },
};
function createBaseGetAuthnDescriptorRequest(): GetAuthnDescriptorRequest {
  return {};
}
export const GetAuthnDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest',
  encode(
    _: GetAuthnDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetAuthnDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAuthnDescriptorRequest();
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
  fromJSON(_: any): GetAuthnDescriptorRequest {
    return {};
  },
  toJSON(_: GetAuthnDescriptorRequest): JsonSafe<GetAuthnDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<GetAuthnDescriptorRequest>,
  ): GetAuthnDescriptorRequest {
    const message = createBaseGetAuthnDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetAuthnDescriptorRequestProtoMsg,
  ): GetAuthnDescriptorRequest {
    return GetAuthnDescriptorRequest.decode(message.value);
  },
  toProto(message: GetAuthnDescriptorRequest): Uint8Array {
    return GetAuthnDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetAuthnDescriptorRequest,
  ): GetAuthnDescriptorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest',
      value: GetAuthnDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetAuthnDescriptorResponse(): GetAuthnDescriptorResponse {
  return {
    authn: undefined,
  };
}
export const GetAuthnDescriptorResponse = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorResponse',
  encode(
    message: GetAuthnDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authn !== undefined) {
      AuthnDescriptor.encode(message.authn, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetAuthnDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAuthnDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authn = AuthnDescriptor.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetAuthnDescriptorResponse {
    return {
      authn: isSet(object.authn)
        ? AuthnDescriptor.fromJSON(object.authn)
        : undefined,
    };
  },
  toJSON(
    message: GetAuthnDescriptorResponse,
  ): JsonSafe<GetAuthnDescriptorResponse> {
    const obj: any = {};
    message.authn !== undefined &&
      (obj.authn = message.authn
        ? AuthnDescriptor.toJSON(message.authn)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetAuthnDescriptorResponse>,
  ): GetAuthnDescriptorResponse {
    const message = createBaseGetAuthnDescriptorResponse();
    message.authn =
      object.authn !== undefined && object.authn !== null
        ? AuthnDescriptor.fromPartial(object.authn)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetAuthnDescriptorResponseProtoMsg,
  ): GetAuthnDescriptorResponse {
    return GetAuthnDescriptorResponse.decode(message.value);
  },
  toProto(message: GetAuthnDescriptorResponse): Uint8Array {
    return GetAuthnDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetAuthnDescriptorResponse,
  ): GetAuthnDescriptorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorResponse',
      value: GetAuthnDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseGetChainDescriptorRequest(): GetChainDescriptorRequest {
  return {};
}
export const GetChainDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest',
  encode(
    _: GetChainDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetChainDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetChainDescriptorRequest();
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
  fromJSON(_: any): GetChainDescriptorRequest {
    return {};
  },
  toJSON(_: GetChainDescriptorRequest): JsonSafe<GetChainDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<GetChainDescriptorRequest>,
  ): GetChainDescriptorRequest {
    const message = createBaseGetChainDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetChainDescriptorRequestProtoMsg,
  ): GetChainDescriptorRequest {
    return GetChainDescriptorRequest.decode(message.value);
  },
  toProto(message: GetChainDescriptorRequest): Uint8Array {
    return GetChainDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetChainDescriptorRequest,
  ): GetChainDescriptorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest',
      value: GetChainDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetChainDescriptorResponse(): GetChainDescriptorResponse {
  return {
    chain: undefined,
  };
}
export const GetChainDescriptorResponse = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorResponse',
  encode(
    message: GetChainDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chain !== undefined) {
      ChainDescriptor.encode(message.chain, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetChainDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetChainDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chain = ChainDescriptor.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetChainDescriptorResponse {
    return {
      chain: isSet(object.chain)
        ? ChainDescriptor.fromJSON(object.chain)
        : undefined,
    };
  },
  toJSON(
    message: GetChainDescriptorResponse,
  ): JsonSafe<GetChainDescriptorResponse> {
    const obj: any = {};
    message.chain !== undefined &&
      (obj.chain = message.chain
        ? ChainDescriptor.toJSON(message.chain)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetChainDescriptorResponse>,
  ): GetChainDescriptorResponse {
    const message = createBaseGetChainDescriptorResponse();
    message.chain =
      object.chain !== undefined && object.chain !== null
        ? ChainDescriptor.fromPartial(object.chain)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetChainDescriptorResponseProtoMsg,
  ): GetChainDescriptorResponse {
    return GetChainDescriptorResponse.decode(message.value);
  },
  toProto(message: GetChainDescriptorResponse): Uint8Array {
    return GetChainDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetChainDescriptorResponse,
  ): GetChainDescriptorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorResponse',
      value: GetChainDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseGetCodecDescriptorRequest(): GetCodecDescriptorRequest {
  return {};
}
export const GetCodecDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest',
  encode(
    _: GetCodecDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetCodecDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCodecDescriptorRequest();
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
  fromJSON(_: any): GetCodecDescriptorRequest {
    return {};
  },
  toJSON(_: GetCodecDescriptorRequest): JsonSafe<GetCodecDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<GetCodecDescriptorRequest>,
  ): GetCodecDescriptorRequest {
    const message = createBaseGetCodecDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetCodecDescriptorRequestProtoMsg,
  ): GetCodecDescriptorRequest {
    return GetCodecDescriptorRequest.decode(message.value);
  },
  toProto(message: GetCodecDescriptorRequest): Uint8Array {
    return GetCodecDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetCodecDescriptorRequest,
  ): GetCodecDescriptorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest',
      value: GetCodecDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetCodecDescriptorResponse(): GetCodecDescriptorResponse {
  return {
    codec: undefined,
  };
}
export const GetCodecDescriptorResponse = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorResponse',
  encode(
    message: GetCodecDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.codec !== undefined) {
      CodecDescriptor.encode(message.codec, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetCodecDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetCodecDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.codec = CodecDescriptor.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetCodecDescriptorResponse {
    return {
      codec: isSet(object.codec)
        ? CodecDescriptor.fromJSON(object.codec)
        : undefined,
    };
  },
  toJSON(
    message: GetCodecDescriptorResponse,
  ): JsonSafe<GetCodecDescriptorResponse> {
    const obj: any = {};
    message.codec !== undefined &&
      (obj.codec = message.codec
        ? CodecDescriptor.toJSON(message.codec)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetCodecDescriptorResponse>,
  ): GetCodecDescriptorResponse {
    const message = createBaseGetCodecDescriptorResponse();
    message.codec =
      object.codec !== undefined && object.codec !== null
        ? CodecDescriptor.fromPartial(object.codec)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetCodecDescriptorResponseProtoMsg,
  ): GetCodecDescriptorResponse {
    return GetCodecDescriptorResponse.decode(message.value);
  },
  toProto(message: GetCodecDescriptorResponse): Uint8Array {
    return GetCodecDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetCodecDescriptorResponse,
  ): GetCodecDescriptorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorResponse',
      value: GetCodecDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseGetConfigurationDescriptorRequest(): GetConfigurationDescriptorRequest {
  return {};
}
export const GetConfigurationDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest',
  encode(
    _: GetConfigurationDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetConfigurationDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetConfigurationDescriptorRequest();
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
  fromJSON(_: any): GetConfigurationDescriptorRequest {
    return {};
  },
  toJSON(
    _: GetConfigurationDescriptorRequest,
  ): JsonSafe<GetConfigurationDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<GetConfigurationDescriptorRequest>,
  ): GetConfigurationDescriptorRequest {
    const message = createBaseGetConfigurationDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetConfigurationDescriptorRequestProtoMsg,
  ): GetConfigurationDescriptorRequest {
    return GetConfigurationDescriptorRequest.decode(message.value);
  },
  toProto(message: GetConfigurationDescriptorRequest): Uint8Array {
    return GetConfigurationDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetConfigurationDescriptorRequest,
  ): GetConfigurationDescriptorRequestProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest',
      value: GetConfigurationDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetConfigurationDescriptorResponse(): GetConfigurationDescriptorResponse {
  return {
    config: undefined,
  };
}
export const GetConfigurationDescriptorResponse = {
  typeUrl:
    '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorResponse',
  encode(
    message: GetConfigurationDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.config !== undefined) {
      ConfigurationDescriptor.encode(
        message.config,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetConfigurationDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetConfigurationDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.config = ConfigurationDescriptor.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetConfigurationDescriptorResponse {
    return {
      config: isSet(object.config)
        ? ConfigurationDescriptor.fromJSON(object.config)
        : undefined,
    };
  },
  toJSON(
    message: GetConfigurationDescriptorResponse,
  ): JsonSafe<GetConfigurationDescriptorResponse> {
    const obj: any = {};
    message.config !== undefined &&
      (obj.config = message.config
        ? ConfigurationDescriptor.toJSON(message.config)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetConfigurationDescriptorResponse>,
  ): GetConfigurationDescriptorResponse {
    const message = createBaseGetConfigurationDescriptorResponse();
    message.config =
      object.config !== undefined && object.config !== null
        ? ConfigurationDescriptor.fromPartial(object.config)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetConfigurationDescriptorResponseProtoMsg,
  ): GetConfigurationDescriptorResponse {
    return GetConfigurationDescriptorResponse.decode(message.value);
  },
  toProto(message: GetConfigurationDescriptorResponse): Uint8Array {
    return GetConfigurationDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetConfigurationDescriptorResponse,
  ): GetConfigurationDescriptorResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorResponse',
      value: GetConfigurationDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseGetQueryServicesDescriptorRequest(): GetQueryServicesDescriptorRequest {
  return {};
}
export const GetQueryServicesDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest',
  encode(
    _: GetQueryServicesDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetQueryServicesDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetQueryServicesDescriptorRequest();
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
  fromJSON(_: any): GetQueryServicesDescriptorRequest {
    return {};
  },
  toJSON(
    _: GetQueryServicesDescriptorRequest,
  ): JsonSafe<GetQueryServicesDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<GetQueryServicesDescriptorRequest>,
  ): GetQueryServicesDescriptorRequest {
    const message = createBaseGetQueryServicesDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetQueryServicesDescriptorRequestProtoMsg,
  ): GetQueryServicesDescriptorRequest {
    return GetQueryServicesDescriptorRequest.decode(message.value);
  },
  toProto(message: GetQueryServicesDescriptorRequest): Uint8Array {
    return GetQueryServicesDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetQueryServicesDescriptorRequest,
  ): GetQueryServicesDescriptorRequestProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest',
      value: GetQueryServicesDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetQueryServicesDescriptorResponse(): GetQueryServicesDescriptorResponse {
  return {
    queries: undefined,
  };
}
export const GetQueryServicesDescriptorResponse = {
  typeUrl:
    '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorResponse',
  encode(
    message: GetQueryServicesDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.queries !== undefined) {
      QueryServicesDescriptor.encode(
        message.queries,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetQueryServicesDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetQueryServicesDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.queries = QueryServicesDescriptor.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetQueryServicesDescriptorResponse {
    return {
      queries: isSet(object.queries)
        ? QueryServicesDescriptor.fromJSON(object.queries)
        : undefined,
    };
  },
  toJSON(
    message: GetQueryServicesDescriptorResponse,
  ): JsonSafe<GetQueryServicesDescriptorResponse> {
    const obj: any = {};
    message.queries !== undefined &&
      (obj.queries = message.queries
        ? QueryServicesDescriptor.toJSON(message.queries)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetQueryServicesDescriptorResponse>,
  ): GetQueryServicesDescriptorResponse {
    const message = createBaseGetQueryServicesDescriptorResponse();
    message.queries =
      object.queries !== undefined && object.queries !== null
        ? QueryServicesDescriptor.fromPartial(object.queries)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetQueryServicesDescriptorResponseProtoMsg,
  ): GetQueryServicesDescriptorResponse {
    return GetQueryServicesDescriptorResponse.decode(message.value);
  },
  toProto(message: GetQueryServicesDescriptorResponse): Uint8Array {
    return GetQueryServicesDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetQueryServicesDescriptorResponse,
  ): GetQueryServicesDescriptorResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorResponse',
      value: GetQueryServicesDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseGetTxDescriptorRequest(): GetTxDescriptorRequest {
  return {};
}
export const GetTxDescriptorRequest = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest',
  encode(
    _: GetTxDescriptorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetTxDescriptorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTxDescriptorRequest();
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
  fromJSON(_: any): GetTxDescriptorRequest {
    return {};
  },
  toJSON(_: GetTxDescriptorRequest): JsonSafe<GetTxDescriptorRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<GetTxDescriptorRequest>): GetTxDescriptorRequest {
    const message = createBaseGetTxDescriptorRequest();
    return message;
  },
  fromProtoMsg(
    message: GetTxDescriptorRequestProtoMsg,
  ): GetTxDescriptorRequest {
    return GetTxDescriptorRequest.decode(message.value);
  },
  toProto(message: GetTxDescriptorRequest): Uint8Array {
    return GetTxDescriptorRequest.encode(message).finish();
  },
  toProtoMsg(message: GetTxDescriptorRequest): GetTxDescriptorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest',
      value: GetTxDescriptorRequest.encode(message).finish(),
    };
  },
};
function createBaseGetTxDescriptorResponse(): GetTxDescriptorResponse {
  return {
    tx: undefined,
  };
}
export const GetTxDescriptorResponse = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorResponse',
  encode(
    message: GetTxDescriptorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.tx !== undefined) {
      TxDescriptor.encode(message.tx, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): GetTxDescriptorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTxDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tx = TxDescriptor.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetTxDescriptorResponse {
    return {
      tx: isSet(object.tx) ? TxDescriptor.fromJSON(object.tx) : undefined,
    };
  },
  toJSON(message: GetTxDescriptorResponse): JsonSafe<GetTxDescriptorResponse> {
    const obj: any = {};
    message.tx !== undefined &&
      (obj.tx = message.tx ? TxDescriptor.toJSON(message.tx) : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<GetTxDescriptorResponse>,
  ): GetTxDescriptorResponse {
    const message = createBaseGetTxDescriptorResponse();
    message.tx =
      object.tx !== undefined && object.tx !== null
        ? TxDescriptor.fromPartial(object.tx)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: GetTxDescriptorResponseProtoMsg,
  ): GetTxDescriptorResponse {
    return GetTxDescriptorResponse.decode(message.value);
  },
  toProto(message: GetTxDescriptorResponse): Uint8Array {
    return GetTxDescriptorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetTxDescriptorResponse,
  ): GetTxDescriptorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorResponse',
      value: GetTxDescriptorResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryServicesDescriptor(): QueryServicesDescriptor {
  return {
    queryServices: [],
  };
}
export const QueryServicesDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServicesDescriptor',
  encode(
    message: QueryServicesDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.queryServices) {
      QueryServiceDescriptor.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryServicesDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryServicesDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.queryServices.push(
            QueryServiceDescriptor.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryServicesDescriptor {
    return {
      queryServices: Array.isArray(object?.queryServices)
        ? object.queryServices.map((e: any) =>
            QueryServiceDescriptor.fromJSON(e),
          )
        : [],
    };
  },
  toJSON(message: QueryServicesDescriptor): JsonSafe<QueryServicesDescriptor> {
    const obj: any = {};
    if (message.queryServices) {
      obj.queryServices = message.queryServices.map(e =>
        e ? QueryServiceDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.queryServices = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryServicesDescriptor>,
  ): QueryServicesDescriptor {
    const message = createBaseQueryServicesDescriptor();
    message.queryServices =
      object.queryServices?.map(e => QueryServiceDescriptor.fromPartial(e)) ||
      [];
    return message;
  },
  fromProtoMsg(
    message: QueryServicesDescriptorProtoMsg,
  ): QueryServicesDescriptor {
    return QueryServicesDescriptor.decode(message.value);
  },
  toProto(message: QueryServicesDescriptor): Uint8Array {
    return QueryServicesDescriptor.encode(message).finish();
  },
  toProtoMsg(
    message: QueryServicesDescriptor,
  ): QueryServicesDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServicesDescriptor',
      value: QueryServicesDescriptor.encode(message).finish(),
    };
  },
};
function createBaseQueryServiceDescriptor(): QueryServiceDescriptor {
  return {
    fullname: '',
    isModule: false,
    methods: [],
  };
}
export const QueryServiceDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServiceDescriptor',
  encode(
    message: QueryServiceDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullname !== '') {
      writer.uint32(10).string(message.fullname);
    }
    if (message.isModule === true) {
      writer.uint32(16).bool(message.isModule);
    }
    for (const v of message.methods) {
      QueryMethodDescriptor.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryServiceDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryServiceDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullname = reader.string();
          break;
        case 2:
          message.isModule = reader.bool();
          break;
        case 3:
          message.methods.push(
            QueryMethodDescriptor.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryServiceDescriptor {
    return {
      fullname: isSet(object.fullname) ? String(object.fullname) : '',
      isModule: isSet(object.isModule) ? Boolean(object.isModule) : false,
      methods: Array.isArray(object?.methods)
        ? object.methods.map((e: any) => QueryMethodDescriptor.fromJSON(e))
        : [],
    };
  },
  toJSON(message: QueryServiceDescriptor): JsonSafe<QueryServiceDescriptor> {
    const obj: any = {};
    message.fullname !== undefined && (obj.fullname = message.fullname);
    message.isModule !== undefined && (obj.isModule = message.isModule);
    if (message.methods) {
      obj.methods = message.methods.map(e =>
        e ? QueryMethodDescriptor.toJSON(e) : undefined,
      );
    } else {
      obj.methods = [];
    }
    return obj;
  },
  fromPartial(object: Partial<QueryServiceDescriptor>): QueryServiceDescriptor {
    const message = createBaseQueryServiceDescriptor();
    message.fullname = object.fullname ?? '';
    message.isModule = object.isModule ?? false;
    message.methods =
      object.methods?.map(e => QueryMethodDescriptor.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryServiceDescriptorProtoMsg,
  ): QueryServiceDescriptor {
    return QueryServiceDescriptor.decode(message.value);
  },
  toProto(message: QueryServiceDescriptor): Uint8Array {
    return QueryServiceDescriptor.encode(message).finish();
  },
  toProtoMsg(message: QueryServiceDescriptor): QueryServiceDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServiceDescriptor',
      value: QueryServiceDescriptor.encode(message).finish(),
    };
  },
};
function createBaseQueryMethodDescriptor(): QueryMethodDescriptor {
  return {
    name: '',
    fullQueryPath: '',
  };
}
export const QueryMethodDescriptor = {
  typeUrl: '/cosmos.base.reflection.v2alpha1.QueryMethodDescriptor',
  encode(
    message: QueryMethodDescriptor,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.fullQueryPath !== '') {
      writer.uint32(18).string(message.fullQueryPath);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryMethodDescriptor {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryMethodDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.fullQueryPath = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryMethodDescriptor {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      fullQueryPath: isSet(object.fullQueryPath)
        ? String(object.fullQueryPath)
        : '',
    };
  },
  toJSON(message: QueryMethodDescriptor): JsonSafe<QueryMethodDescriptor> {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.fullQueryPath !== undefined &&
      (obj.fullQueryPath = message.fullQueryPath);
    return obj;
  },
  fromPartial(object: Partial<QueryMethodDescriptor>): QueryMethodDescriptor {
    const message = createBaseQueryMethodDescriptor();
    message.name = object.name ?? '';
    message.fullQueryPath = object.fullQueryPath ?? '';
    return message;
  },
  fromProtoMsg(message: QueryMethodDescriptorProtoMsg): QueryMethodDescriptor {
    return QueryMethodDescriptor.decode(message.value);
  },
  toProto(message: QueryMethodDescriptor): Uint8Array {
    return QueryMethodDescriptor.encode(message).finish();
  },
  toProtoMsg(message: QueryMethodDescriptor): QueryMethodDescriptorProtoMsg {
    return {
      typeUrl: '/cosmos.base.reflection.v2alpha1.QueryMethodDescriptor',
      value: QueryMethodDescriptor.encode(message).finish(),
    };
  },
};
