import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { Params, type ParamsSDKType, BaseAccount, type BaseAccountSDKType, ModuleAccount, type ModuleAccountSDKType } from './auth.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * QueryAccountsRequest is the request type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsRequest {
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryAccountsRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountsRequest';
    value: Uint8Array;
}
/**
 * QueryAccountsRequest is the request type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsRequestSDKType {
    pagination?: PageRequestSDKType;
}
/**
 * QueryAccountsResponse is the response type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsResponse {
    /** accounts are the existing accounts */
    accounts: (BaseAccount & Any)[] | Any[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryAccountsResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountsResponse';
    value: Uint8Array;
}
/**
 * QueryAccountsResponse is the response type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsResponseSDKType {
    accounts: (BaseAccountSDKType | AnySDKType)[];
    pagination?: PageResponseSDKType;
}
/** QueryAccountRequest is the request type for the Query/Account RPC method. */
export interface QueryAccountRequest {
    /** address defines the address to query for. */
    address: string;
}
export interface QueryAccountRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountRequest';
    value: Uint8Array;
}
/** QueryAccountRequest is the request type for the Query/Account RPC method. */
export interface QueryAccountRequestSDKType {
    address: string;
}
/** QueryAccountResponse is the response type for the Query/Account RPC method. */
export interface QueryAccountResponse {
    /** account defines the account of the corresponding address. */
    account?: (BaseAccount & Any) | undefined;
}
export interface QueryAccountResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountResponse';
    value: Uint8Array;
}
/** QueryAccountResponse is the response type for the Query/Account RPC method. */
export interface QueryAccountResponseSDKType {
    account?: BaseAccountSDKType | AnySDKType | undefined;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params defines the parameters of the module. */
    params: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
/**
 * QueryModuleAccountsRequest is the request type for the Query/ModuleAccounts RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryModuleAccountsRequest {
}
export interface QueryModuleAccountsRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsRequest';
    value: Uint8Array;
}
/**
 * QueryModuleAccountsRequest is the request type for the Query/ModuleAccounts RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryModuleAccountsRequestSDKType {
}
/**
 * QueryModuleAccountsResponse is the response type for the Query/ModuleAccounts RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryModuleAccountsResponse {
    accounts: (ModuleAccount & Any)[] | Any[];
}
export interface QueryModuleAccountsResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsResponse';
    value: Uint8Array;
}
/**
 * QueryModuleAccountsResponse is the response type for the Query/ModuleAccounts RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryModuleAccountsResponseSDKType {
    accounts: (ModuleAccountSDKType | AnySDKType)[];
}
/** QueryModuleAccountByNameRequest is the request type for the Query/ModuleAccountByName RPC method. */
export interface QueryModuleAccountByNameRequest {
    name: string;
}
export interface QueryModuleAccountByNameRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameRequest';
    value: Uint8Array;
}
/** QueryModuleAccountByNameRequest is the request type for the Query/ModuleAccountByName RPC method. */
export interface QueryModuleAccountByNameRequestSDKType {
    name: string;
}
/** QueryModuleAccountByNameResponse is the response type for the Query/ModuleAccountByName RPC method. */
export interface QueryModuleAccountByNameResponse {
    account?: (ModuleAccount & Any) | undefined;
}
export interface QueryModuleAccountByNameResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameResponse';
    value: Uint8Array;
}
/** QueryModuleAccountByNameResponse is the response type for the Query/ModuleAccountByName RPC method. */
export interface QueryModuleAccountByNameResponseSDKType {
    account?: ModuleAccountSDKType | AnySDKType | undefined;
}
/**
 * Bech32PrefixRequest is the request type for Bech32Prefix rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Bech32PrefixRequest {
}
export interface Bech32PrefixRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixRequest';
    value: Uint8Array;
}
/**
 * Bech32PrefixRequest is the request type for Bech32Prefix rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Bech32PrefixRequestSDKType {
}
/**
 * Bech32PrefixResponse is the response type for Bech32Prefix rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Bech32PrefixResponse {
    bech32Prefix: string;
}
export interface Bech32PrefixResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixResponse';
    value: Uint8Array;
}
/**
 * Bech32PrefixResponse is the response type for Bech32Prefix rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Bech32PrefixResponseSDKType {
    bech32_prefix: string;
}
/**
 * AddressBytesToStringRequest is the request type for AddressString rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressBytesToStringRequest {
    addressBytes: Uint8Array;
}
export interface AddressBytesToStringRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringRequest';
    value: Uint8Array;
}
/**
 * AddressBytesToStringRequest is the request type for AddressString rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressBytesToStringRequestSDKType {
    address_bytes: Uint8Array;
}
/**
 * AddressBytesToStringResponse is the response type for AddressString rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressBytesToStringResponse {
    addressString: string;
}
export interface AddressBytesToStringResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringResponse';
    value: Uint8Array;
}
/**
 * AddressBytesToStringResponse is the response type for AddressString rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressBytesToStringResponseSDKType {
    address_string: string;
}
/**
 * AddressStringToBytesRequest is the request type for AccountBytes rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressStringToBytesRequest {
    addressString: string;
}
export interface AddressStringToBytesRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesRequest';
    value: Uint8Array;
}
/**
 * AddressStringToBytesRequest is the request type for AccountBytes rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressStringToBytesRequestSDKType {
    address_string: string;
}
/**
 * AddressStringToBytesResponse is the response type for AddressBytes rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressStringToBytesResponse {
    addressBytes: Uint8Array;
}
export interface AddressStringToBytesResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesResponse';
    value: Uint8Array;
}
/**
 * AddressStringToBytesResponse is the response type for AddressBytes rpc method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AddressStringToBytesResponseSDKType {
    address_bytes: Uint8Array;
}
/**
 * QueryAccountAddressByIDRequest is the request type for AccountAddressByID rpc method
 *
 * Since: cosmos-sdk 0.46.2
 */
export interface QueryAccountAddressByIDRequest {
    /**
     * id is the account number of the address to be queried. This field
     * should have been an uint64 (like all account numbers), and will be
     * updated to uint64 in a future version of the auth query.
     */
    id: bigint;
}
export interface QueryAccountAddressByIDRequestProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDRequest';
    value: Uint8Array;
}
/**
 * QueryAccountAddressByIDRequest is the request type for AccountAddressByID rpc method
 *
 * Since: cosmos-sdk 0.46.2
 */
export interface QueryAccountAddressByIDRequestSDKType {
    id: bigint;
}
/**
 * QueryAccountAddressByIDResponse is the response type for AccountAddressByID rpc method
 *
 * Since: cosmos-sdk 0.46.2
 */
export interface QueryAccountAddressByIDResponse {
    accountAddress: string;
}
export interface QueryAccountAddressByIDResponseProtoMsg {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDResponse';
    value: Uint8Array;
}
/**
 * QueryAccountAddressByIDResponse is the response type for AccountAddressByID rpc method
 *
 * Since: cosmos-sdk 0.46.2
 */
export interface QueryAccountAddressByIDResponseSDKType {
    account_address: string;
}
export declare const QueryAccountsRequest: {
    typeUrl: string;
    encode(message: QueryAccountsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountsRequest;
    fromJSON(object: any): QueryAccountsRequest;
    toJSON(message: QueryAccountsRequest): JsonSafe<QueryAccountsRequest>;
    fromPartial(object: Partial<QueryAccountsRequest>): QueryAccountsRequest;
    fromProtoMsg(message: QueryAccountsRequestProtoMsg): QueryAccountsRequest;
    toProto(message: QueryAccountsRequest): Uint8Array;
    toProtoMsg(message: QueryAccountsRequest): QueryAccountsRequestProtoMsg;
};
export declare const QueryAccountsResponse: {
    typeUrl: string;
    encode(message: QueryAccountsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountsResponse;
    fromJSON(object: any): QueryAccountsResponse;
    toJSON(message: QueryAccountsResponse): JsonSafe<QueryAccountsResponse>;
    fromPartial(object: Partial<QueryAccountsResponse>): QueryAccountsResponse;
    fromProtoMsg(message: QueryAccountsResponseProtoMsg): QueryAccountsResponse;
    toProto(message: QueryAccountsResponse): Uint8Array;
    toProtoMsg(message: QueryAccountsResponse): QueryAccountsResponseProtoMsg;
};
export declare const QueryAccountRequest: {
    typeUrl: string;
    encode(message: QueryAccountRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountRequest;
    fromJSON(object: any): QueryAccountRequest;
    toJSON(message: QueryAccountRequest): JsonSafe<QueryAccountRequest>;
    fromPartial(object: Partial<QueryAccountRequest>): QueryAccountRequest;
    fromProtoMsg(message: QueryAccountRequestProtoMsg): QueryAccountRequest;
    toProto(message: QueryAccountRequest): Uint8Array;
    toProtoMsg(message: QueryAccountRequest): QueryAccountRequestProtoMsg;
};
export declare const QueryAccountResponse: {
    typeUrl: string;
    encode(message: QueryAccountResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountResponse;
    fromJSON(object: any): QueryAccountResponse;
    toJSON(message: QueryAccountResponse): JsonSafe<QueryAccountResponse>;
    fromPartial(object: Partial<QueryAccountResponse>): QueryAccountResponse;
    fromProtoMsg(message: QueryAccountResponseProtoMsg): QueryAccountResponse;
    toProto(message: QueryAccountResponse): Uint8Array;
    toProtoMsg(message: QueryAccountResponse): QueryAccountResponseProtoMsg;
};
export declare const QueryParamsRequest: {
    typeUrl: string;
    encode(_: QueryParamsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsRequest;
    fromJSON(_: any): QueryParamsRequest;
    toJSON(_: QueryParamsRequest): JsonSafe<QueryParamsRequest>;
    fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest;
    fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest;
    toProto(message: QueryParamsRequest): Uint8Array;
    toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg;
};
export declare const QueryParamsResponse: {
    typeUrl: string;
    encode(message: QueryParamsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsResponse;
    fromJSON(object: any): QueryParamsResponse;
    toJSON(message: QueryParamsResponse): JsonSafe<QueryParamsResponse>;
    fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse;
    fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse;
    toProto(message: QueryParamsResponse): Uint8Array;
    toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg;
};
export declare const QueryModuleAccountsRequest: {
    typeUrl: string;
    encode(_: QueryModuleAccountsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAccountsRequest;
    fromJSON(_: any): QueryModuleAccountsRequest;
    toJSON(_: QueryModuleAccountsRequest): JsonSafe<QueryModuleAccountsRequest>;
    fromPartial(_: Partial<QueryModuleAccountsRequest>): QueryModuleAccountsRequest;
    fromProtoMsg(message: QueryModuleAccountsRequestProtoMsg): QueryModuleAccountsRequest;
    toProto(message: QueryModuleAccountsRequest): Uint8Array;
    toProtoMsg(message: QueryModuleAccountsRequest): QueryModuleAccountsRequestProtoMsg;
};
export declare const QueryModuleAccountsResponse: {
    typeUrl: string;
    encode(message: QueryModuleAccountsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAccountsResponse;
    fromJSON(object: any): QueryModuleAccountsResponse;
    toJSON(message: QueryModuleAccountsResponse): JsonSafe<QueryModuleAccountsResponse>;
    fromPartial(object: Partial<QueryModuleAccountsResponse>): QueryModuleAccountsResponse;
    fromProtoMsg(message: QueryModuleAccountsResponseProtoMsg): QueryModuleAccountsResponse;
    toProto(message: QueryModuleAccountsResponse): Uint8Array;
    toProtoMsg(message: QueryModuleAccountsResponse): QueryModuleAccountsResponseProtoMsg;
};
export declare const QueryModuleAccountByNameRequest: {
    typeUrl: string;
    encode(message: QueryModuleAccountByNameRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAccountByNameRequest;
    fromJSON(object: any): QueryModuleAccountByNameRequest;
    toJSON(message: QueryModuleAccountByNameRequest): JsonSafe<QueryModuleAccountByNameRequest>;
    fromPartial(object: Partial<QueryModuleAccountByNameRequest>): QueryModuleAccountByNameRequest;
    fromProtoMsg(message: QueryModuleAccountByNameRequestProtoMsg): QueryModuleAccountByNameRequest;
    toProto(message: QueryModuleAccountByNameRequest): Uint8Array;
    toProtoMsg(message: QueryModuleAccountByNameRequest): QueryModuleAccountByNameRequestProtoMsg;
};
export declare const QueryModuleAccountByNameResponse: {
    typeUrl: string;
    encode(message: QueryModuleAccountByNameResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAccountByNameResponse;
    fromJSON(object: any): QueryModuleAccountByNameResponse;
    toJSON(message: QueryModuleAccountByNameResponse): JsonSafe<QueryModuleAccountByNameResponse>;
    fromPartial(object: Partial<QueryModuleAccountByNameResponse>): QueryModuleAccountByNameResponse;
    fromProtoMsg(message: QueryModuleAccountByNameResponseProtoMsg): QueryModuleAccountByNameResponse;
    toProto(message: QueryModuleAccountByNameResponse): Uint8Array;
    toProtoMsg(message: QueryModuleAccountByNameResponse): QueryModuleAccountByNameResponseProtoMsg;
};
export declare const Bech32PrefixRequest: {
    typeUrl: string;
    encode(_: Bech32PrefixRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Bech32PrefixRequest;
    fromJSON(_: any): Bech32PrefixRequest;
    toJSON(_: Bech32PrefixRequest): JsonSafe<Bech32PrefixRequest>;
    fromPartial(_: Partial<Bech32PrefixRequest>): Bech32PrefixRequest;
    fromProtoMsg(message: Bech32PrefixRequestProtoMsg): Bech32PrefixRequest;
    toProto(message: Bech32PrefixRequest): Uint8Array;
    toProtoMsg(message: Bech32PrefixRequest): Bech32PrefixRequestProtoMsg;
};
export declare const Bech32PrefixResponse: {
    typeUrl: string;
    encode(message: Bech32PrefixResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Bech32PrefixResponse;
    fromJSON(object: any): Bech32PrefixResponse;
    toJSON(message: Bech32PrefixResponse): JsonSafe<Bech32PrefixResponse>;
    fromPartial(object: Partial<Bech32PrefixResponse>): Bech32PrefixResponse;
    fromProtoMsg(message: Bech32PrefixResponseProtoMsg): Bech32PrefixResponse;
    toProto(message: Bech32PrefixResponse): Uint8Array;
    toProtoMsg(message: Bech32PrefixResponse): Bech32PrefixResponseProtoMsg;
};
export declare const AddressBytesToStringRequest: {
    typeUrl: string;
    encode(message: AddressBytesToStringRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddressBytesToStringRequest;
    fromJSON(object: any): AddressBytesToStringRequest;
    toJSON(message: AddressBytesToStringRequest): JsonSafe<AddressBytesToStringRequest>;
    fromPartial(object: Partial<AddressBytesToStringRequest>): AddressBytesToStringRequest;
    fromProtoMsg(message: AddressBytesToStringRequestProtoMsg): AddressBytesToStringRequest;
    toProto(message: AddressBytesToStringRequest): Uint8Array;
    toProtoMsg(message: AddressBytesToStringRequest): AddressBytesToStringRequestProtoMsg;
};
export declare const AddressBytesToStringResponse: {
    typeUrl: string;
    encode(message: AddressBytesToStringResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddressBytesToStringResponse;
    fromJSON(object: any): AddressBytesToStringResponse;
    toJSON(message: AddressBytesToStringResponse): JsonSafe<AddressBytesToStringResponse>;
    fromPartial(object: Partial<AddressBytesToStringResponse>): AddressBytesToStringResponse;
    fromProtoMsg(message: AddressBytesToStringResponseProtoMsg): AddressBytesToStringResponse;
    toProto(message: AddressBytesToStringResponse): Uint8Array;
    toProtoMsg(message: AddressBytesToStringResponse): AddressBytesToStringResponseProtoMsg;
};
export declare const AddressStringToBytesRequest: {
    typeUrl: string;
    encode(message: AddressStringToBytesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddressStringToBytesRequest;
    fromJSON(object: any): AddressStringToBytesRequest;
    toJSON(message: AddressStringToBytesRequest): JsonSafe<AddressStringToBytesRequest>;
    fromPartial(object: Partial<AddressStringToBytesRequest>): AddressStringToBytesRequest;
    fromProtoMsg(message: AddressStringToBytesRequestProtoMsg): AddressStringToBytesRequest;
    toProto(message: AddressStringToBytesRequest): Uint8Array;
    toProtoMsg(message: AddressStringToBytesRequest): AddressStringToBytesRequestProtoMsg;
};
export declare const AddressStringToBytesResponse: {
    typeUrl: string;
    encode(message: AddressStringToBytesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddressStringToBytesResponse;
    fromJSON(object: any): AddressStringToBytesResponse;
    toJSON(message: AddressStringToBytesResponse): JsonSafe<AddressStringToBytesResponse>;
    fromPartial(object: Partial<AddressStringToBytesResponse>): AddressStringToBytesResponse;
    fromProtoMsg(message: AddressStringToBytesResponseProtoMsg): AddressStringToBytesResponse;
    toProto(message: AddressStringToBytesResponse): Uint8Array;
    toProtoMsg(message: AddressStringToBytesResponse): AddressStringToBytesResponseProtoMsg;
};
export declare const QueryAccountAddressByIDRequest: {
    typeUrl: string;
    encode(message: QueryAccountAddressByIDRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountAddressByIDRequest;
    fromJSON(object: any): QueryAccountAddressByIDRequest;
    toJSON(message: QueryAccountAddressByIDRequest): JsonSafe<QueryAccountAddressByIDRequest>;
    fromPartial(object: Partial<QueryAccountAddressByIDRequest>): QueryAccountAddressByIDRequest;
    fromProtoMsg(message: QueryAccountAddressByIDRequestProtoMsg): QueryAccountAddressByIDRequest;
    toProto(message: QueryAccountAddressByIDRequest): Uint8Array;
    toProtoMsg(message: QueryAccountAddressByIDRequest): QueryAccountAddressByIDRequestProtoMsg;
};
export declare const QueryAccountAddressByIDResponse: {
    typeUrl: string;
    encode(message: QueryAccountAddressByIDResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAccountAddressByIDResponse;
    fromJSON(object: any): QueryAccountAddressByIDResponse;
    toJSON(message: QueryAccountAddressByIDResponse): JsonSafe<QueryAccountAddressByIDResponse>;
    fromPartial(object: Partial<QueryAccountAddressByIDResponse>): QueryAccountAddressByIDResponse;
    fromProtoMsg(message: QueryAccountAddressByIDResponseProtoMsg): QueryAccountAddressByIDResponse;
    toProto(message: QueryAccountAddressByIDResponse): Uint8Array;
    toProtoMsg(message: QueryAccountAddressByIDResponse): QueryAccountAddressByIDResponseProtoMsg;
};
export declare const AccountI_InterfaceDecoder: (input: BinaryReader | Uint8Array) => BaseAccount | Any;
export declare const ModuleAccountI_InterfaceDecoder: (input: BinaryReader | Uint8Array) => ModuleAccount | Any;
