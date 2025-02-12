import * as _18 from './auth/v1beta1/auth.js';
import * as _19 from './auth/v1beta1/genesis.js';
import * as _20 from './auth/v1beta1/query.js';
import * as _21 from './authz/v1beta1/authz.js';
import * as _22 from './authz/v1beta1/event.js';
import * as _23 from './authz/v1beta1/genesis.js';
import * as _24 from './authz/v1beta1/query.js';
import * as _25 from './authz/v1beta1/tx.js';
import * as _26 from './bank/v1beta1/authz.js';
import * as _27 from './bank/v1beta1/bank.js';
import * as _28 from './bank/v1beta1/genesis.js';
import * as _29 from './bank/v1beta1/query.js';
import * as _30 from './bank/v1beta1/tx.js';
import * as _31 from './base/abci/v1beta1/abci.js';
import * as _32 from './base/node/v1beta1/query.js';
import * as _33 from './base/query/v1beta1/pagination.js';
import * as _34 from './base/reflection/v2alpha1/reflection.js';
import * as _35 from './base/v1beta1/coin.js';
import * as _36 from './crypto/ed25519/keys.js';
import * as _37 from './crypto/hd/v1/hd.js';
import * as _38 from './crypto/keyring/v1/record.js';
import * as _39 from './crypto/multisig/keys.js';
import * as _40 from './crypto/secp256k1/keys.js';
import * as _41 from './crypto/secp256r1/keys.js';
import * as _42 from './distribution/v1beta1/distribution.js';
import * as _43 from './distribution/v1beta1/genesis.js';
import * as _44 from './distribution/v1beta1/query.js';
import * as _45 from './distribution/v1beta1/tx.js';
import * as _46 from './feegrant/v1beta1/feegrant.js';
import * as _47 from './feegrant/v1beta1/genesis.js';
import * as _48 from './feegrant/v1beta1/query.js';
import * as _49 from './feegrant/v1beta1/tx.js';
import * as _50 from './gov/v1/genesis.js';
import * as _51 from './gov/v1/gov.js';
import * as _52 from './gov/v1/query.js';
import * as _53 from './gov/v1/tx.js';
import * as _54 from './gov/v1beta1/genesis.js';
import * as _55 from './gov/v1beta1/gov.js';
import * as _56 from './gov/v1beta1/query.js';
import * as _57 from './gov/v1beta1/tx.js';
import * as _58 from './group/v1/events.js';
import * as _59 from './group/v1/genesis.js';
import * as _60 from './group/v1/query.js';
import * as _61 from './group/v1/tx.js';
import * as _62 from './group/v1/types.js';
import * as _63 from './mint/v1beta1/genesis.js';
import * as _64 from './mint/v1beta1/mint.js';
import * as _65 from './mint/v1beta1/query.js';
import * as _66 from './params/v1beta1/params.js';
import * as _67 from './params/v1beta1/query.js';
import * as _68 from './staking/v1beta1/authz.js';
import * as _69 from './staking/v1beta1/genesis.js';
import * as _70 from './staking/v1beta1/query.js';
import * as _71 from './staking/v1beta1/staking.js';
import * as _72 from './staking/v1beta1/tx.js';
import * as _73 from './tx/signing/v1beta1/signing.js';
import * as _74 from './tx/v1beta1/service.js';
import * as _75 from './tx/v1beta1/tx.js';
import * as _76 from './upgrade/v1beta1/query.js';
import * as _77 from './upgrade/v1beta1/tx.js';
import * as _78 from './upgrade/v1beta1/upgrade.js';
import * as _79 from './vesting/v1beta1/tx.js';
import * as _80 from './vesting/v1beta1/vesting.js';
export declare namespace cosmos {
    namespace auth {
        const v1beta1: {
            QueryAccountsRequest: {
                typeUrl: string;
                encode(message: _20.QueryAccountsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountsRequest;
                fromJSON(object: any): _20.QueryAccountsRequest;
                toJSON(message: _20.QueryAccountsRequest): import("../json-safe.js").JsonSafe<_20.QueryAccountsRequest>;
                fromPartial(object: Partial<_20.QueryAccountsRequest>): _20.QueryAccountsRequest;
                fromProtoMsg(message: _20.QueryAccountsRequestProtoMsg): _20.QueryAccountsRequest;
                toProto(message: _20.QueryAccountsRequest): Uint8Array;
                toProtoMsg(message: _20.QueryAccountsRequest): _20.QueryAccountsRequestProtoMsg;
            };
            QueryAccountsResponse: {
                typeUrl: string;
                encode(message: _20.QueryAccountsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountsResponse;
                fromJSON(object: any): _20.QueryAccountsResponse;
                toJSON(message: _20.QueryAccountsResponse): import("../json-safe.js").JsonSafe<_20.QueryAccountsResponse>;
                fromPartial(object: Partial<_20.QueryAccountsResponse>): _20.QueryAccountsResponse;
                fromProtoMsg(message: _20.QueryAccountsResponseProtoMsg): _20.QueryAccountsResponse;
                toProto(message: _20.QueryAccountsResponse): Uint8Array;
                toProtoMsg(message: _20.QueryAccountsResponse): _20.QueryAccountsResponseProtoMsg;
            };
            QueryAccountRequest: {
                typeUrl: string;
                encode(message: _20.QueryAccountRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountRequest;
                fromJSON(object: any): _20.QueryAccountRequest;
                toJSON(message: _20.QueryAccountRequest): import("../json-safe.js").JsonSafe<_20.QueryAccountRequest>;
                fromPartial(object: Partial<_20.QueryAccountRequest>): _20.QueryAccountRequest;
                fromProtoMsg(message: _20.QueryAccountRequestProtoMsg): _20.QueryAccountRequest;
                toProto(message: _20.QueryAccountRequest): Uint8Array;
                toProtoMsg(message: _20.QueryAccountRequest): _20.QueryAccountRequestProtoMsg;
            };
            QueryAccountResponse: {
                typeUrl: string;
                encode(message: _20.QueryAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountResponse;
                fromJSON(object: any): _20.QueryAccountResponse;
                toJSON(message: _20.QueryAccountResponse): import("../json-safe.js").JsonSafe<_20.QueryAccountResponse>;
                fromPartial(object: Partial<_20.QueryAccountResponse>): _20.QueryAccountResponse;
                fromProtoMsg(message: _20.QueryAccountResponseProtoMsg): _20.QueryAccountResponse;
                toProto(message: _20.QueryAccountResponse): Uint8Array;
                toProtoMsg(message: _20.QueryAccountResponse): _20.QueryAccountResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(_: _20.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryParamsRequest;
                fromJSON(_: any): _20.QueryParamsRequest;
                toJSON(_: _20.QueryParamsRequest): import("../json-safe.js").JsonSafe<_20.QueryParamsRequest>;
                fromPartial(_: Partial<_20.QueryParamsRequest>): _20.QueryParamsRequest;
                fromProtoMsg(message: _20.QueryParamsRequestProtoMsg): _20.QueryParamsRequest;
                toProto(message: _20.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _20.QueryParamsRequest): _20.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _20.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryParamsResponse;
                fromJSON(object: any): _20.QueryParamsResponse;
                toJSON(message: _20.QueryParamsResponse): import("../json-safe.js").JsonSafe<_20.QueryParamsResponse>;
                fromPartial(object: Partial<_20.QueryParamsResponse>): _20.QueryParamsResponse;
                fromProtoMsg(message: _20.QueryParamsResponseProtoMsg): _20.QueryParamsResponse;
                toProto(message: _20.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _20.QueryParamsResponse): _20.QueryParamsResponseProtoMsg;
            };
            QueryModuleAccountsRequest: {
                typeUrl: string;
                encode(_: _20.QueryModuleAccountsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryModuleAccountsRequest;
                fromJSON(_: any): _20.QueryModuleAccountsRequest;
                toJSON(_: _20.QueryModuleAccountsRequest): import("../json-safe.js").JsonSafe<_20.QueryModuleAccountsRequest>;
                fromPartial(_: Partial<_20.QueryModuleAccountsRequest>): _20.QueryModuleAccountsRequest;
                fromProtoMsg(message: _20.QueryModuleAccountsRequestProtoMsg): _20.QueryModuleAccountsRequest;
                toProto(message: _20.QueryModuleAccountsRequest): Uint8Array;
                toProtoMsg(message: _20.QueryModuleAccountsRequest): _20.QueryModuleAccountsRequestProtoMsg;
            };
            QueryModuleAccountsResponse: {
                typeUrl: string;
                encode(message: _20.QueryModuleAccountsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryModuleAccountsResponse;
                fromJSON(object: any): _20.QueryModuleAccountsResponse;
                toJSON(message: _20.QueryModuleAccountsResponse): import("../json-safe.js").JsonSafe<_20.QueryModuleAccountsResponse>;
                fromPartial(object: Partial<_20.QueryModuleAccountsResponse>): _20.QueryModuleAccountsResponse;
                fromProtoMsg(message: _20.QueryModuleAccountsResponseProtoMsg): _20.QueryModuleAccountsResponse;
                toProto(message: _20.QueryModuleAccountsResponse): Uint8Array;
                toProtoMsg(message: _20.QueryModuleAccountsResponse): _20.QueryModuleAccountsResponseProtoMsg;
            };
            QueryModuleAccountByNameRequest: {
                typeUrl: string;
                encode(message: _20.QueryModuleAccountByNameRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryModuleAccountByNameRequest;
                fromJSON(object: any): _20.QueryModuleAccountByNameRequest;
                toJSON(message: _20.QueryModuleAccountByNameRequest): import("../json-safe.js").JsonSafe<_20.QueryModuleAccountByNameRequest>;
                fromPartial(object: Partial<_20.QueryModuleAccountByNameRequest>): _20.QueryModuleAccountByNameRequest;
                fromProtoMsg(message: _20.QueryModuleAccountByNameRequestProtoMsg): _20.QueryModuleAccountByNameRequest;
                toProto(message: _20.QueryModuleAccountByNameRequest): Uint8Array;
                toProtoMsg(message: _20.QueryModuleAccountByNameRequest): _20.QueryModuleAccountByNameRequestProtoMsg;
            };
            QueryModuleAccountByNameResponse: {
                typeUrl: string;
                encode(message: _20.QueryModuleAccountByNameResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryModuleAccountByNameResponse;
                fromJSON(object: any): _20.QueryModuleAccountByNameResponse;
                toJSON(message: _20.QueryModuleAccountByNameResponse): import("../json-safe.js").JsonSafe<_20.QueryModuleAccountByNameResponse>;
                fromPartial(object: Partial<_20.QueryModuleAccountByNameResponse>): _20.QueryModuleAccountByNameResponse;
                fromProtoMsg(message: _20.QueryModuleAccountByNameResponseProtoMsg): _20.QueryModuleAccountByNameResponse;
                toProto(message: _20.QueryModuleAccountByNameResponse): Uint8Array;
                toProtoMsg(message: _20.QueryModuleAccountByNameResponse): _20.QueryModuleAccountByNameResponseProtoMsg;
            };
            Bech32PrefixRequest: {
                typeUrl: string;
                encode(_: _20.Bech32PrefixRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.Bech32PrefixRequest;
                fromJSON(_: any): _20.Bech32PrefixRequest;
                toJSON(_: _20.Bech32PrefixRequest): import("../json-safe.js").JsonSafe<_20.Bech32PrefixRequest>;
                fromPartial(_: Partial<_20.Bech32PrefixRequest>): _20.Bech32PrefixRequest;
                fromProtoMsg(message: _20.Bech32PrefixRequestProtoMsg): _20.Bech32PrefixRequest;
                toProto(message: _20.Bech32PrefixRequest): Uint8Array;
                toProtoMsg(message: _20.Bech32PrefixRequest): _20.Bech32PrefixRequestProtoMsg;
            };
            Bech32PrefixResponse: {
                typeUrl: string;
                encode(message: _20.Bech32PrefixResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.Bech32PrefixResponse;
                fromJSON(object: any): _20.Bech32PrefixResponse;
                toJSON(message: _20.Bech32PrefixResponse): import("../json-safe.js").JsonSafe<_20.Bech32PrefixResponse>;
                fromPartial(object: Partial<_20.Bech32PrefixResponse>): _20.Bech32PrefixResponse;
                fromProtoMsg(message: _20.Bech32PrefixResponseProtoMsg): _20.Bech32PrefixResponse;
                toProto(message: _20.Bech32PrefixResponse): Uint8Array;
                toProtoMsg(message: _20.Bech32PrefixResponse): _20.Bech32PrefixResponseProtoMsg;
            };
            AddressBytesToStringRequest: {
                typeUrl: string;
                encode(message: _20.AddressBytesToStringRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.AddressBytesToStringRequest;
                fromJSON(object: any): _20.AddressBytesToStringRequest;
                toJSON(message: _20.AddressBytesToStringRequest): import("../json-safe.js").JsonSafe<_20.AddressBytesToStringRequest>;
                fromPartial(object: Partial<_20.AddressBytesToStringRequest>): _20.AddressBytesToStringRequest;
                fromProtoMsg(message: _20.AddressBytesToStringRequestProtoMsg): _20.AddressBytesToStringRequest;
                toProto(message: _20.AddressBytesToStringRequest): Uint8Array;
                toProtoMsg(message: _20.AddressBytesToStringRequest): _20.AddressBytesToStringRequestProtoMsg;
            };
            AddressBytesToStringResponse: {
                typeUrl: string;
                encode(message: _20.AddressBytesToStringResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.AddressBytesToStringResponse;
                fromJSON(object: any): _20.AddressBytesToStringResponse;
                toJSON(message: _20.AddressBytesToStringResponse): import("../json-safe.js").JsonSafe<_20.AddressBytesToStringResponse>;
                fromPartial(object: Partial<_20.AddressBytesToStringResponse>): _20.AddressBytesToStringResponse;
                fromProtoMsg(message: _20.AddressBytesToStringResponseProtoMsg): _20.AddressBytesToStringResponse;
                toProto(message: _20.AddressBytesToStringResponse): Uint8Array;
                toProtoMsg(message: _20.AddressBytesToStringResponse): _20.AddressBytesToStringResponseProtoMsg;
            };
            AddressStringToBytesRequest: {
                typeUrl: string;
                encode(message: _20.AddressStringToBytesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.AddressStringToBytesRequest;
                fromJSON(object: any): _20.AddressStringToBytesRequest;
                toJSON(message: _20.AddressStringToBytesRequest): import("../json-safe.js").JsonSafe<_20.AddressStringToBytesRequest>;
                fromPartial(object: Partial<_20.AddressStringToBytesRequest>): _20.AddressStringToBytesRequest;
                fromProtoMsg(message: _20.AddressStringToBytesRequestProtoMsg): _20.AddressStringToBytesRequest;
                toProto(message: _20.AddressStringToBytesRequest): Uint8Array;
                toProtoMsg(message: _20.AddressStringToBytesRequest): _20.AddressStringToBytesRequestProtoMsg;
            };
            AddressStringToBytesResponse: {
                typeUrl: string;
                encode(message: _20.AddressStringToBytesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.AddressStringToBytesResponse;
                fromJSON(object: any): _20.AddressStringToBytesResponse;
                toJSON(message: _20.AddressStringToBytesResponse): import("../json-safe.js").JsonSafe<_20.AddressStringToBytesResponse>;
                fromPartial(object: Partial<_20.AddressStringToBytesResponse>): _20.AddressStringToBytesResponse;
                fromProtoMsg(message: _20.AddressStringToBytesResponseProtoMsg): _20.AddressStringToBytesResponse;
                toProto(message: _20.AddressStringToBytesResponse): Uint8Array;
                toProtoMsg(message: _20.AddressStringToBytesResponse): _20.AddressStringToBytesResponseProtoMsg;
            };
            QueryAccountAddressByIDRequest: {
                typeUrl: string;
                encode(message: _20.QueryAccountAddressByIDRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountAddressByIDRequest;
                fromJSON(object: any): _20.QueryAccountAddressByIDRequest;
                toJSON(message: _20.QueryAccountAddressByIDRequest): import("../json-safe.js").JsonSafe<_20.QueryAccountAddressByIDRequest>;
                fromPartial(object: Partial<_20.QueryAccountAddressByIDRequest>): _20.QueryAccountAddressByIDRequest;
                fromProtoMsg(message: _20.QueryAccountAddressByIDRequestProtoMsg): _20.QueryAccountAddressByIDRequest;
                toProto(message: _20.QueryAccountAddressByIDRequest): Uint8Array;
                toProtoMsg(message: _20.QueryAccountAddressByIDRequest): _20.QueryAccountAddressByIDRequestProtoMsg;
            };
            QueryAccountAddressByIDResponse: {
                typeUrl: string;
                encode(message: _20.QueryAccountAddressByIDResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _20.QueryAccountAddressByIDResponse;
                fromJSON(object: any): _20.QueryAccountAddressByIDResponse;
                toJSON(message: _20.QueryAccountAddressByIDResponse): import("../json-safe.js").JsonSafe<_20.QueryAccountAddressByIDResponse>;
                fromPartial(object: Partial<_20.QueryAccountAddressByIDResponse>): _20.QueryAccountAddressByIDResponse;
                fromProtoMsg(message: _20.QueryAccountAddressByIDResponseProtoMsg): _20.QueryAccountAddressByIDResponse;
                toProto(message: _20.QueryAccountAddressByIDResponse): Uint8Array;
                toProtoMsg(message: _20.QueryAccountAddressByIDResponse): _20.QueryAccountAddressByIDResponseProtoMsg;
            };
            AccountI_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _18.BaseAccount | import("../google/protobuf/any.js").Any;
            ModuleAccountI_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _18.ModuleAccount | import("../google/protobuf/any.js").Any;
            GenesisState: {
                typeUrl: string;
                encode(message: _19.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _19.GenesisState;
                fromJSON(object: any): _19.GenesisState;
                toJSON(message: _19.GenesisState): import("../json-safe.js").JsonSafe<_19.GenesisState>;
                fromPartial(object: Partial<_19.GenesisState>): _19.GenesisState;
                fromProtoMsg(message: _19.GenesisStateProtoMsg): _19.GenesisState;
                toProto(message: _19.GenesisState): Uint8Array;
                toProtoMsg(message: _19.GenesisState): _19.GenesisStateProtoMsg;
            };
            BaseAccount: {
                typeUrl: string;
                encode(message: _18.BaseAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _18.BaseAccount;
                fromJSON(object: any): _18.BaseAccount;
                toJSON(message: _18.BaseAccount): import("../json-safe.js").JsonSafe<_18.BaseAccount>;
                fromPartial(object: Partial<_18.BaseAccount>): _18.BaseAccount;
                fromProtoMsg(message: _18.BaseAccountProtoMsg): _18.BaseAccount;
                toProto(message: _18.BaseAccount): Uint8Array;
                toProtoMsg(message: _18.BaseAccount): _18.BaseAccountProtoMsg;
            };
            ModuleAccount: {
                typeUrl: string;
                encode(message: _18.ModuleAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _18.ModuleAccount;
                fromJSON(object: any): _18.ModuleAccount;
                toJSON(message: _18.ModuleAccount): import("../json-safe.js").JsonSafe<_18.ModuleAccount>;
                fromPartial(object: Partial<_18.ModuleAccount>): _18.ModuleAccount;
                fromProtoMsg(message: _18.ModuleAccountProtoMsg): _18.ModuleAccount;
                toProto(message: _18.ModuleAccount): Uint8Array;
                toProtoMsg(message: _18.ModuleAccount): _18.ModuleAccountProtoMsg;
            };
            Params: {
                typeUrl: string;
                encode(message: _18.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _18.Params;
                fromJSON(object: any): _18.Params;
                toJSON(message: _18.Params): import("../json-safe.js").JsonSafe<_18.Params>;
                fromPartial(object: Partial<_18.Params>): _18.Params;
                fromProtoMsg(message: _18.ParamsProtoMsg): _18.Params;
                toProto(message: _18.Params): Uint8Array;
                toProtoMsg(message: _18.Params): _18.ParamsProtoMsg;
            };
        };
    }
    namespace authz {
        const v1beta1: {
            MsgGrant: {
                typeUrl: string;
                encode(message: _25.MsgGrant, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgGrant;
                fromJSON(object: any): _25.MsgGrant;
                toJSON(message: _25.MsgGrant): import("../json-safe.js").JsonSafe<_25.MsgGrant>;
                fromPartial(object: Partial<_25.MsgGrant>): _25.MsgGrant;
                fromProtoMsg(message: _25.MsgGrantProtoMsg): _25.MsgGrant;
                toProto(message: _25.MsgGrant): Uint8Array;
                toProtoMsg(message: _25.MsgGrant): _25.MsgGrantProtoMsg;
            };
            MsgExecResponse: {
                typeUrl: string;
                encode(message: _25.MsgExecResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgExecResponse;
                fromJSON(object: any): _25.MsgExecResponse;
                toJSON(message: _25.MsgExecResponse): import("../json-safe.js").JsonSafe<_25.MsgExecResponse>;
                fromPartial(object: Partial<_25.MsgExecResponse>): _25.MsgExecResponse;
                fromProtoMsg(message: _25.MsgExecResponseProtoMsg): _25.MsgExecResponse;
                toProto(message: _25.MsgExecResponse): Uint8Array;
                toProtoMsg(message: _25.MsgExecResponse): _25.MsgExecResponseProtoMsg;
            };
            MsgExec: {
                typeUrl: string;
                encode(message: _25.MsgExec, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgExec;
                fromJSON(object: any): _25.MsgExec;
                toJSON(message: _25.MsgExec): import("../json-safe.js").JsonSafe<_25.MsgExec>;
                fromPartial(object: Partial<_25.MsgExec>): _25.MsgExec;
                fromProtoMsg(message: _25.MsgExecProtoMsg): _25.MsgExec;
                toProto(message: _25.MsgExec): Uint8Array;
                toProtoMsg(message: _25.MsgExec): _25.MsgExecProtoMsg;
            };
            MsgGrantResponse: {
                typeUrl: string;
                encode(_: _25.MsgGrantResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgGrantResponse;
                fromJSON(_: any): _25.MsgGrantResponse;
                toJSON(_: _25.MsgGrantResponse): import("../json-safe.js").JsonSafe<_25.MsgGrantResponse>;
                fromPartial(_: Partial<_25.MsgGrantResponse>): _25.MsgGrantResponse;
                fromProtoMsg(message: _25.MsgGrantResponseProtoMsg): _25.MsgGrantResponse;
                toProto(message: _25.MsgGrantResponse): Uint8Array;
                toProtoMsg(message: _25.MsgGrantResponse): _25.MsgGrantResponseProtoMsg;
            };
            MsgRevoke: {
                typeUrl: string;
                encode(message: _25.MsgRevoke, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgRevoke;
                fromJSON(object: any): _25.MsgRevoke;
                toJSON(message: _25.MsgRevoke): import("../json-safe.js").JsonSafe<_25.MsgRevoke>;
                fromPartial(object: Partial<_25.MsgRevoke>): _25.MsgRevoke;
                fromProtoMsg(message: _25.MsgRevokeProtoMsg): _25.MsgRevoke;
                toProto(message: _25.MsgRevoke): Uint8Array;
                toProtoMsg(message: _25.MsgRevoke): _25.MsgRevokeProtoMsg;
            };
            MsgRevokeResponse: {
                typeUrl: string;
                encode(_: _25.MsgRevokeResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _25.MsgRevokeResponse;
                fromJSON(_: any): _25.MsgRevokeResponse;
                toJSON(_: _25.MsgRevokeResponse): import("../json-safe.js").JsonSafe<_25.MsgRevokeResponse>;
                fromPartial(_: Partial<_25.MsgRevokeResponse>): _25.MsgRevokeResponse;
                fromProtoMsg(message: _25.MsgRevokeResponseProtoMsg): _25.MsgRevokeResponse;
                toProto(message: _25.MsgRevokeResponse): Uint8Array;
                toProtoMsg(message: _25.MsgRevokeResponse): _25.MsgRevokeResponseProtoMsg;
            };
            Sdk_Msg_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => import("../google/protobuf/any.js").Any;
            Authz_Authorization_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => import("../google/protobuf/any.js").Any;
            QueryGrantsRequest: {
                typeUrl: string;
                encode(message: _24.QueryGrantsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGrantsRequest;
                fromJSON(object: any): _24.QueryGrantsRequest;
                toJSON(message: _24.QueryGrantsRequest): import("../json-safe.js").JsonSafe<_24.QueryGrantsRequest>;
                fromPartial(object: Partial<_24.QueryGrantsRequest>): _24.QueryGrantsRequest;
                fromProtoMsg(message: _24.QueryGrantsRequestProtoMsg): _24.QueryGrantsRequest;
                toProto(message: _24.QueryGrantsRequest): Uint8Array;
                toProtoMsg(message: _24.QueryGrantsRequest): _24.QueryGrantsRequestProtoMsg;
            };
            QueryGrantsResponse: {
                typeUrl: string;
                encode(message: _24.QueryGrantsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGrantsResponse;
                fromJSON(object: any): _24.QueryGrantsResponse;
                toJSON(message: _24.QueryGrantsResponse): import("../json-safe.js").JsonSafe<_24.QueryGrantsResponse>;
                fromPartial(object: Partial<_24.QueryGrantsResponse>): _24.QueryGrantsResponse;
                fromProtoMsg(message: _24.QueryGrantsResponseProtoMsg): _24.QueryGrantsResponse;
                toProto(message: _24.QueryGrantsResponse): Uint8Array;
                toProtoMsg(message: _24.QueryGrantsResponse): _24.QueryGrantsResponseProtoMsg;
            };
            QueryGranterGrantsRequest: {
                typeUrl: string;
                encode(message: _24.QueryGranterGrantsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGranterGrantsRequest;
                fromJSON(object: any): _24.QueryGranterGrantsRequest;
                toJSON(message: _24.QueryGranterGrantsRequest): import("../json-safe.js").JsonSafe<_24.QueryGranterGrantsRequest>;
                fromPartial(object: Partial<_24.QueryGranterGrantsRequest>): _24.QueryGranterGrantsRequest;
                fromProtoMsg(message: _24.QueryGranterGrantsRequestProtoMsg): _24.QueryGranterGrantsRequest;
                toProto(message: _24.QueryGranterGrantsRequest): Uint8Array;
                toProtoMsg(message: _24.QueryGranterGrantsRequest): _24.QueryGranterGrantsRequestProtoMsg;
            };
            QueryGranterGrantsResponse: {
                typeUrl: string;
                encode(message: _24.QueryGranterGrantsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGranterGrantsResponse;
                fromJSON(object: any): _24.QueryGranterGrantsResponse;
                toJSON(message: _24.QueryGranterGrantsResponse): import("../json-safe.js").JsonSafe<_24.QueryGranterGrantsResponse>;
                fromPartial(object: Partial<_24.QueryGranterGrantsResponse>): _24.QueryGranterGrantsResponse;
                fromProtoMsg(message: _24.QueryGranterGrantsResponseProtoMsg): _24.QueryGranterGrantsResponse;
                toProto(message: _24.QueryGranterGrantsResponse): Uint8Array;
                toProtoMsg(message: _24.QueryGranterGrantsResponse): _24.QueryGranterGrantsResponseProtoMsg;
            };
            QueryGranteeGrantsRequest: {
                typeUrl: string;
                encode(message: _24.QueryGranteeGrantsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGranteeGrantsRequest;
                fromJSON(object: any): _24.QueryGranteeGrantsRequest;
                toJSON(message: _24.QueryGranteeGrantsRequest): import("../json-safe.js").JsonSafe<_24.QueryGranteeGrantsRequest>;
                fromPartial(object: Partial<_24.QueryGranteeGrantsRequest>): _24.QueryGranteeGrantsRequest;
                fromProtoMsg(message: _24.QueryGranteeGrantsRequestProtoMsg): _24.QueryGranteeGrantsRequest;
                toProto(message: _24.QueryGranteeGrantsRequest): Uint8Array;
                toProtoMsg(message: _24.QueryGranteeGrantsRequest): _24.QueryGranteeGrantsRequestProtoMsg;
            };
            QueryGranteeGrantsResponse: {
                typeUrl: string;
                encode(message: _24.QueryGranteeGrantsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _24.QueryGranteeGrantsResponse;
                fromJSON(object: any): _24.QueryGranteeGrantsResponse;
                toJSON(message: _24.QueryGranteeGrantsResponse): import("../json-safe.js").JsonSafe<_24.QueryGranteeGrantsResponse>;
                fromPartial(object: Partial<_24.QueryGranteeGrantsResponse>): _24.QueryGranteeGrantsResponse;
                fromProtoMsg(message: _24.QueryGranteeGrantsResponseProtoMsg): _24.QueryGranteeGrantsResponse;
                toProto(message: _24.QueryGranteeGrantsResponse): Uint8Array;
                toProtoMsg(message: _24.QueryGranteeGrantsResponse): _24.QueryGranteeGrantsResponseProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _23.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _23.GenesisState;
                fromJSON(object: any): _23.GenesisState;
                toJSON(message: _23.GenesisState): import("../json-safe.js").JsonSafe<_23.GenesisState>;
                fromPartial(object: Partial<_23.GenesisState>): _23.GenesisState;
                fromProtoMsg(message: _23.GenesisStateProtoMsg): _23.GenesisState;
                toProto(message: _23.GenesisState): Uint8Array;
                toProtoMsg(message: _23.GenesisState): _23.GenesisStateProtoMsg;
            };
            EventGrant: {
                typeUrl: string;
                encode(message: _22.EventGrant, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _22.EventGrant;
                fromJSON(object: any): _22.EventGrant;
                toJSON(message: _22.EventGrant): import("../json-safe.js").JsonSafe<_22.EventGrant>;
                fromPartial(object: Partial<_22.EventGrant>): _22.EventGrant;
                fromProtoMsg(message: _22.EventGrantProtoMsg): _22.EventGrant;
                toProto(message: _22.EventGrant): Uint8Array;
                toProtoMsg(message: _22.EventGrant): _22.EventGrantProtoMsg;
            };
            EventRevoke: {
                typeUrl: string;
                encode(message: _22.EventRevoke, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _22.EventRevoke;
                fromJSON(object: any): _22.EventRevoke;
                toJSON(message: _22.EventRevoke): import("../json-safe.js").JsonSafe<_22.EventRevoke>;
                fromPartial(object: Partial<_22.EventRevoke>): _22.EventRevoke;
                fromProtoMsg(message: _22.EventRevokeProtoMsg): _22.EventRevoke;
                toProto(message: _22.EventRevoke): Uint8Array;
                toProtoMsg(message: _22.EventRevoke): _22.EventRevokeProtoMsg;
            };
            GenericAuthorization: {
                typeUrl: string;
                encode(message: _21.GenericAuthorization, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _21.GenericAuthorization;
                fromJSON(object: any): _21.GenericAuthorization;
                toJSON(message: _21.GenericAuthorization): import("../json-safe.js").JsonSafe<_21.GenericAuthorization>;
                fromPartial(object: Partial<_21.GenericAuthorization>): _21.GenericAuthorization;
                fromProtoMsg(message: _21.GenericAuthorizationProtoMsg): _21.GenericAuthorization;
                toProto(message: _21.GenericAuthorization): Uint8Array;
                toProtoMsg(message: _21.GenericAuthorization): _21.GenericAuthorizationProtoMsg;
            };
            Grant: {
                typeUrl: string;
                encode(message: _21.Grant, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _21.Grant;
                fromJSON(object: any): _21.Grant;
                toJSON(message: _21.Grant): import("../json-safe.js").JsonSafe<_21.Grant>;
                fromPartial(object: Partial<_21.Grant>): _21.Grant;
                fromProtoMsg(message: _21.GrantProtoMsg): _21.Grant;
                toProto(message: _21.Grant): Uint8Array;
                toProtoMsg(message: _21.Grant): _21.GrantProtoMsg;
            };
            GrantAuthorization: {
                typeUrl: string;
                encode(message: _21.GrantAuthorization, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _21.GrantAuthorization;
                fromJSON(object: any): _21.GrantAuthorization;
                toJSON(message: _21.GrantAuthorization): import("../json-safe.js").JsonSafe<_21.GrantAuthorization>;
                fromPartial(object: Partial<_21.GrantAuthorization>): _21.GrantAuthorization;
                fromProtoMsg(message: _21.GrantAuthorizationProtoMsg): _21.GrantAuthorization;
                toProto(message: _21.GrantAuthorization): Uint8Array;
                toProtoMsg(message: _21.GrantAuthorization): _21.GrantAuthorizationProtoMsg;
            };
            GrantQueueItem: {
                typeUrl: string;
                encode(message: _21.GrantQueueItem, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _21.GrantQueueItem;
                fromJSON(object: any): _21.GrantQueueItem;
                toJSON(message: _21.GrantQueueItem): import("../json-safe.js").JsonSafe<_21.GrantQueueItem>;
                fromPartial(object: Partial<_21.GrantQueueItem>): _21.GrantQueueItem;
                fromProtoMsg(message: _21.GrantQueueItemProtoMsg): _21.GrantQueueItem;
                toProto(message: _21.GrantQueueItem): Uint8Array;
                toProtoMsg(message: _21.GrantQueueItem): _21.GrantQueueItemProtoMsg;
            };
            Authorization_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _21.GenericAuthorization | _26.SendAuthorization | _68.StakeAuthorization | import("../ibc/applications/transfer/v1/authz.js").TransferAuthorization | import("../google/protobuf/any.js").Any;
        };
    }
    namespace bank {
        const v1beta1: {
            MsgSend: {
                typeUrl: string;
                encode(message: _30.MsgSend, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _30.MsgSend;
                fromJSON(object: any): _30.MsgSend;
                toJSON(message: _30.MsgSend): import("../json-safe.js").JsonSafe<_30.MsgSend>;
                fromPartial(object: Partial<_30.MsgSend>): _30.MsgSend;
                fromProtoMsg(message: _30.MsgSendProtoMsg): _30.MsgSend;
                toProto(message: _30.MsgSend): Uint8Array;
                toProtoMsg(message: _30.MsgSend): _30.MsgSendProtoMsg;
            };
            MsgSendResponse: {
                typeUrl: string;
                encode(_: _30.MsgSendResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _30.MsgSendResponse;
                fromJSON(_: any): _30.MsgSendResponse;
                toJSON(_: _30.MsgSendResponse): import("../json-safe.js").JsonSafe<_30.MsgSendResponse>;
                fromPartial(_: Partial<_30.MsgSendResponse>): _30.MsgSendResponse;
                fromProtoMsg(message: _30.MsgSendResponseProtoMsg): _30.MsgSendResponse;
                toProto(message: _30.MsgSendResponse): Uint8Array;
                toProtoMsg(message: _30.MsgSendResponse): _30.MsgSendResponseProtoMsg;
            };
            MsgMultiSend: {
                typeUrl: string;
                encode(message: _30.MsgMultiSend, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _30.MsgMultiSend;
                fromJSON(object: any): _30.MsgMultiSend;
                toJSON(message: _30.MsgMultiSend): import("../json-safe.js").JsonSafe<_30.MsgMultiSend>;
                fromPartial(object: Partial<_30.MsgMultiSend>): _30.MsgMultiSend;
                fromProtoMsg(message: _30.MsgMultiSendProtoMsg): _30.MsgMultiSend;
                toProto(message: _30.MsgMultiSend): Uint8Array;
                toProtoMsg(message: _30.MsgMultiSend): _30.MsgMultiSendProtoMsg;
            };
            MsgMultiSendResponse: {
                typeUrl: string;
                encode(_: _30.MsgMultiSendResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _30.MsgMultiSendResponse;
                fromJSON(_: any): _30.MsgMultiSendResponse;
                toJSON(_: _30.MsgMultiSendResponse): import("../json-safe.js").JsonSafe<_30.MsgMultiSendResponse>;
                fromPartial(_: Partial<_30.MsgMultiSendResponse>): _30.MsgMultiSendResponse;
                fromProtoMsg(message: _30.MsgMultiSendResponseProtoMsg): _30.MsgMultiSendResponse;
                toProto(message: _30.MsgMultiSendResponse): Uint8Array;
                toProtoMsg(message: _30.MsgMultiSendResponse): _30.MsgMultiSendResponseProtoMsg;
            };
            QueryBalanceRequest: {
                typeUrl: string;
                encode(message: _29.QueryBalanceRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryBalanceRequest;
                fromJSON(object: any): _29.QueryBalanceRequest;
                toJSON(message: _29.QueryBalanceRequest): import("../json-safe.js").JsonSafe<_29.QueryBalanceRequest>;
                fromPartial(object: Partial<_29.QueryBalanceRequest>): _29.QueryBalanceRequest;
                fromProtoMsg(message: _29.QueryBalanceRequestProtoMsg): _29.QueryBalanceRequest;
                toProto(message: _29.QueryBalanceRequest): Uint8Array;
                toProtoMsg(message: _29.QueryBalanceRequest): _29.QueryBalanceRequestProtoMsg;
            };
            QueryBalanceResponse: {
                typeUrl: string;
                encode(message: _29.QueryBalanceResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryBalanceResponse;
                fromJSON(object: any): _29.QueryBalanceResponse;
                toJSON(message: _29.QueryBalanceResponse): import("../json-safe.js").JsonSafe<_29.QueryBalanceResponse>;
                fromPartial(object: Partial<_29.QueryBalanceResponse>): _29.QueryBalanceResponse;
                fromProtoMsg(message: _29.QueryBalanceResponseProtoMsg): _29.QueryBalanceResponse;
                toProto(message: _29.QueryBalanceResponse): Uint8Array;
                toProtoMsg(message: _29.QueryBalanceResponse): _29.QueryBalanceResponseProtoMsg;
            };
            QueryAllBalancesRequest: {
                typeUrl: string;
                encode(message: _29.QueryAllBalancesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryAllBalancesRequest;
                fromJSON(object: any): _29.QueryAllBalancesRequest;
                toJSON(message: _29.QueryAllBalancesRequest): import("../json-safe.js").JsonSafe<_29.QueryAllBalancesRequest>;
                fromPartial(object: Partial<_29.QueryAllBalancesRequest>): _29.QueryAllBalancesRequest;
                fromProtoMsg(message: _29.QueryAllBalancesRequestProtoMsg): _29.QueryAllBalancesRequest;
                toProto(message: _29.QueryAllBalancesRequest): Uint8Array;
                toProtoMsg(message: _29.QueryAllBalancesRequest): _29.QueryAllBalancesRequestProtoMsg;
            };
            QueryAllBalancesResponse: {
                typeUrl: string;
                encode(message: _29.QueryAllBalancesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryAllBalancesResponse;
                fromJSON(object: any): _29.QueryAllBalancesResponse;
                toJSON(message: _29.QueryAllBalancesResponse): import("../json-safe.js").JsonSafe<_29.QueryAllBalancesResponse>;
                fromPartial(object: Partial<_29.QueryAllBalancesResponse>): _29.QueryAllBalancesResponse;
                fromProtoMsg(message: _29.QueryAllBalancesResponseProtoMsg): _29.QueryAllBalancesResponse;
                toProto(message: _29.QueryAllBalancesResponse): Uint8Array;
                toProtoMsg(message: _29.QueryAllBalancesResponse): _29.QueryAllBalancesResponseProtoMsg;
            };
            QuerySpendableBalancesRequest: {
                typeUrl: string;
                encode(message: _29.QuerySpendableBalancesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QuerySpendableBalancesRequest;
                fromJSON(object: any): _29.QuerySpendableBalancesRequest;
                toJSON(message: _29.QuerySpendableBalancesRequest): import("../json-safe.js").JsonSafe<_29.QuerySpendableBalancesRequest>;
                fromPartial(object: Partial<_29.QuerySpendableBalancesRequest>): _29.QuerySpendableBalancesRequest;
                fromProtoMsg(message: _29.QuerySpendableBalancesRequestProtoMsg): _29.QuerySpendableBalancesRequest;
                toProto(message: _29.QuerySpendableBalancesRequest): Uint8Array;
                toProtoMsg(message: _29.QuerySpendableBalancesRequest): _29.QuerySpendableBalancesRequestProtoMsg;
            };
            QuerySpendableBalancesResponse: {
                typeUrl: string;
                encode(message: _29.QuerySpendableBalancesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QuerySpendableBalancesResponse;
                fromJSON(object: any): _29.QuerySpendableBalancesResponse;
                toJSON(message: _29.QuerySpendableBalancesResponse): import("../json-safe.js").JsonSafe<_29.QuerySpendableBalancesResponse>;
                fromPartial(object: Partial<_29.QuerySpendableBalancesResponse>): _29.QuerySpendableBalancesResponse;
                fromProtoMsg(message: _29.QuerySpendableBalancesResponseProtoMsg): _29.QuerySpendableBalancesResponse;
                toProto(message: _29.QuerySpendableBalancesResponse): Uint8Array;
                toProtoMsg(message: _29.QuerySpendableBalancesResponse): _29.QuerySpendableBalancesResponseProtoMsg;
            };
            QueryTotalSupplyRequest: {
                typeUrl: string;
                encode(message: _29.QueryTotalSupplyRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryTotalSupplyRequest;
                fromJSON(object: any): _29.QueryTotalSupplyRequest;
                toJSON(message: _29.QueryTotalSupplyRequest): import("../json-safe.js").JsonSafe<_29.QueryTotalSupplyRequest>;
                fromPartial(object: Partial<_29.QueryTotalSupplyRequest>): _29.QueryTotalSupplyRequest;
                fromProtoMsg(message: _29.QueryTotalSupplyRequestProtoMsg): _29.QueryTotalSupplyRequest;
                toProto(message: _29.QueryTotalSupplyRequest): Uint8Array;
                toProtoMsg(message: _29.QueryTotalSupplyRequest): _29.QueryTotalSupplyRequestProtoMsg;
            };
            QueryTotalSupplyResponse: {
                typeUrl: string;
                encode(message: _29.QueryTotalSupplyResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryTotalSupplyResponse;
                fromJSON(object: any): _29.QueryTotalSupplyResponse;
                toJSON(message: _29.QueryTotalSupplyResponse): import("../json-safe.js").JsonSafe<_29.QueryTotalSupplyResponse>;
                fromPartial(object: Partial<_29.QueryTotalSupplyResponse>): _29.QueryTotalSupplyResponse;
                fromProtoMsg(message: _29.QueryTotalSupplyResponseProtoMsg): _29.QueryTotalSupplyResponse;
                toProto(message: _29.QueryTotalSupplyResponse): Uint8Array;
                toProtoMsg(message: _29.QueryTotalSupplyResponse): _29.QueryTotalSupplyResponseProtoMsg;
            };
            QuerySupplyOfRequest: {
                typeUrl: string;
                encode(message: _29.QuerySupplyOfRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QuerySupplyOfRequest;
                fromJSON(object: any): _29.QuerySupplyOfRequest;
                toJSON(message: _29.QuerySupplyOfRequest): import("../json-safe.js").JsonSafe<_29.QuerySupplyOfRequest>;
                fromPartial(object: Partial<_29.QuerySupplyOfRequest>): _29.QuerySupplyOfRequest;
                fromProtoMsg(message: _29.QuerySupplyOfRequestProtoMsg): _29.QuerySupplyOfRequest;
                toProto(message: _29.QuerySupplyOfRequest): Uint8Array;
                toProtoMsg(message: _29.QuerySupplyOfRequest): _29.QuerySupplyOfRequestProtoMsg;
            };
            QuerySupplyOfResponse: {
                typeUrl: string;
                encode(message: _29.QuerySupplyOfResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QuerySupplyOfResponse;
                fromJSON(object: any): _29.QuerySupplyOfResponse;
                toJSON(message: _29.QuerySupplyOfResponse): import("../json-safe.js").JsonSafe<_29.QuerySupplyOfResponse>;
                fromPartial(object: Partial<_29.QuerySupplyOfResponse>): _29.QuerySupplyOfResponse;
                fromProtoMsg(message: _29.QuerySupplyOfResponseProtoMsg): _29.QuerySupplyOfResponse;
                toProto(message: _29.QuerySupplyOfResponse): Uint8Array;
                toProtoMsg(message: _29.QuerySupplyOfResponse): _29.QuerySupplyOfResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(_: _29.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryParamsRequest;
                fromJSON(_: any): _29.QueryParamsRequest;
                toJSON(_: _29.QueryParamsRequest): import("../json-safe.js").JsonSafe<_29.QueryParamsRequest>;
                fromPartial(_: Partial<_29.QueryParamsRequest>): _29.QueryParamsRequest;
                fromProtoMsg(message: _29.QueryParamsRequestProtoMsg): _29.QueryParamsRequest;
                toProto(message: _29.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _29.QueryParamsRequest): _29.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _29.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryParamsResponse;
                fromJSON(object: any): _29.QueryParamsResponse;
                toJSON(message: _29.QueryParamsResponse): import("../json-safe.js").JsonSafe<_29.QueryParamsResponse>;
                fromPartial(object: Partial<_29.QueryParamsResponse>): _29.QueryParamsResponse;
                fromProtoMsg(message: _29.QueryParamsResponseProtoMsg): _29.QueryParamsResponse;
                toProto(message: _29.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _29.QueryParamsResponse): _29.QueryParamsResponseProtoMsg;
            };
            QueryDenomsMetadataRequest: {
                typeUrl: string;
                encode(message: _29.QueryDenomsMetadataRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomsMetadataRequest;
                fromJSON(object: any): _29.QueryDenomsMetadataRequest;
                toJSON(message: _29.QueryDenomsMetadataRequest): import("../json-safe.js").JsonSafe<_29.QueryDenomsMetadataRequest>;
                fromPartial(object: Partial<_29.QueryDenomsMetadataRequest>): _29.QueryDenomsMetadataRequest;
                fromProtoMsg(message: _29.QueryDenomsMetadataRequestProtoMsg): _29.QueryDenomsMetadataRequest;
                toProto(message: _29.QueryDenomsMetadataRequest): Uint8Array;
                toProtoMsg(message: _29.QueryDenomsMetadataRequest): _29.QueryDenomsMetadataRequestProtoMsg;
            };
            QueryDenomsMetadataResponse: {
                typeUrl: string;
                encode(message: _29.QueryDenomsMetadataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomsMetadataResponse;
                fromJSON(object: any): _29.QueryDenomsMetadataResponse;
                toJSON(message: _29.QueryDenomsMetadataResponse): import("../json-safe.js").JsonSafe<_29.QueryDenomsMetadataResponse>;
                fromPartial(object: Partial<_29.QueryDenomsMetadataResponse>): _29.QueryDenomsMetadataResponse;
                fromProtoMsg(message: _29.QueryDenomsMetadataResponseProtoMsg): _29.QueryDenomsMetadataResponse;
                toProto(message: _29.QueryDenomsMetadataResponse): Uint8Array;
                toProtoMsg(message: _29.QueryDenomsMetadataResponse): _29.QueryDenomsMetadataResponseProtoMsg;
            };
            QueryDenomMetadataRequest: {
                typeUrl: string;
                encode(message: _29.QueryDenomMetadataRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomMetadataRequest;
                fromJSON(object: any): _29.QueryDenomMetadataRequest;
                toJSON(message: _29.QueryDenomMetadataRequest): import("../json-safe.js").JsonSafe<_29.QueryDenomMetadataRequest>;
                fromPartial(object: Partial<_29.QueryDenomMetadataRequest>): _29.QueryDenomMetadataRequest;
                fromProtoMsg(message: _29.QueryDenomMetadataRequestProtoMsg): _29.QueryDenomMetadataRequest;
                toProto(message: _29.QueryDenomMetadataRequest): Uint8Array;
                toProtoMsg(message: _29.QueryDenomMetadataRequest): _29.QueryDenomMetadataRequestProtoMsg;
            };
            QueryDenomMetadataResponse: {
                typeUrl: string;
                encode(message: _29.QueryDenomMetadataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomMetadataResponse;
                fromJSON(object: any): _29.QueryDenomMetadataResponse;
                toJSON(message: _29.QueryDenomMetadataResponse): import("../json-safe.js").JsonSafe<_29.QueryDenomMetadataResponse>;
                fromPartial(object: Partial<_29.QueryDenomMetadataResponse>): _29.QueryDenomMetadataResponse;
                fromProtoMsg(message: _29.QueryDenomMetadataResponseProtoMsg): _29.QueryDenomMetadataResponse;
                toProto(message: _29.QueryDenomMetadataResponse): Uint8Array;
                toProtoMsg(message: _29.QueryDenomMetadataResponse): _29.QueryDenomMetadataResponseProtoMsg;
            };
            QueryDenomOwnersRequest: {
                typeUrl: string;
                encode(message: _29.QueryDenomOwnersRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomOwnersRequest;
                fromJSON(object: any): _29.QueryDenomOwnersRequest;
                toJSON(message: _29.QueryDenomOwnersRequest): import("../json-safe.js").JsonSafe<_29.QueryDenomOwnersRequest>;
                fromPartial(object: Partial<_29.QueryDenomOwnersRequest>): _29.QueryDenomOwnersRequest;
                fromProtoMsg(message: _29.QueryDenomOwnersRequestProtoMsg): _29.QueryDenomOwnersRequest;
                toProto(message: _29.QueryDenomOwnersRequest): Uint8Array;
                toProtoMsg(message: _29.QueryDenomOwnersRequest): _29.QueryDenomOwnersRequestProtoMsg;
            };
            DenomOwner: {
                typeUrl: string;
                encode(message: _29.DenomOwner, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.DenomOwner;
                fromJSON(object: any): _29.DenomOwner;
                toJSON(message: _29.DenomOwner): import("../json-safe.js").JsonSafe<_29.DenomOwner>;
                fromPartial(object: Partial<_29.DenomOwner>): _29.DenomOwner;
                fromProtoMsg(message: _29.DenomOwnerProtoMsg): _29.DenomOwner;
                toProto(message: _29.DenomOwner): Uint8Array;
                toProtoMsg(message: _29.DenomOwner): _29.DenomOwnerProtoMsg;
            };
            QueryDenomOwnersResponse: {
                typeUrl: string;
                encode(message: _29.QueryDenomOwnersResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _29.QueryDenomOwnersResponse;
                fromJSON(object: any): _29.QueryDenomOwnersResponse;
                toJSON(message: _29.QueryDenomOwnersResponse): import("../json-safe.js").JsonSafe<_29.QueryDenomOwnersResponse>;
                fromPartial(object: Partial<_29.QueryDenomOwnersResponse>): _29.QueryDenomOwnersResponse;
                fromProtoMsg(message: _29.QueryDenomOwnersResponseProtoMsg): _29.QueryDenomOwnersResponse;
                toProto(message: _29.QueryDenomOwnersResponse): Uint8Array;
                toProtoMsg(message: _29.QueryDenomOwnersResponse): _29.QueryDenomOwnersResponseProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _28.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _28.GenesisState;
                fromJSON(object: any): _28.GenesisState;
                toJSON(message: _28.GenesisState): import("../json-safe.js").JsonSafe<_28.GenesisState>;
                fromPartial(object: Partial<_28.GenesisState>): _28.GenesisState;
                fromProtoMsg(message: _28.GenesisStateProtoMsg): _28.GenesisState;
                toProto(message: _28.GenesisState): Uint8Array;
                toProtoMsg(message: _28.GenesisState): _28.GenesisStateProtoMsg;
            };
            Balance: {
                typeUrl: string;
                encode(message: _28.Balance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _28.Balance;
                fromJSON(object: any): _28.Balance;
                toJSON(message: _28.Balance): import("../json-safe.js").JsonSafe<_28.Balance>;
                fromPartial(object: Partial<_28.Balance>): _28.Balance;
                fromProtoMsg(message: _28.BalanceProtoMsg): _28.Balance;
                toProto(message: _28.Balance): Uint8Array;
                toProtoMsg(message: _28.Balance): _28.BalanceProtoMsg;
            };
            Params: {
                typeUrl: string;
                encode(message: _27.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.Params;
                fromJSON(object: any): _27.Params;
                toJSON(message: _27.Params): import("../json-safe.js").JsonSafe<_27.Params>;
                fromPartial(object: Partial<_27.Params>): _27.Params;
                fromProtoMsg(message: _27.ParamsProtoMsg): _27.Params;
                toProto(message: _27.Params): Uint8Array;
                toProtoMsg(message: _27.Params): _27.ParamsProtoMsg;
            };
            SendEnabled: {
                typeUrl: string;
                encode(message: _27.SendEnabled, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.SendEnabled;
                fromJSON(object: any): _27.SendEnabled;
                toJSON(message: _27.SendEnabled): import("../json-safe.js").JsonSafe<_27.SendEnabled>;
                fromPartial(object: Partial<_27.SendEnabled>): _27.SendEnabled;
                fromProtoMsg(message: _27.SendEnabledProtoMsg): _27.SendEnabled;
                toProto(message: _27.SendEnabled): Uint8Array;
                toProtoMsg(message: _27.SendEnabled): _27.SendEnabledProtoMsg;
            };
            Input: {
                typeUrl: string;
                encode(message: _27.Input, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.Input;
                fromJSON(object: any): _27.Input;
                toJSON(message: _27.Input): import("../json-safe.js").JsonSafe<_27.Input>;
                fromPartial(object: Partial<_27.Input>): _27.Input;
                fromProtoMsg(message: _27.InputProtoMsg): _27.Input;
                toProto(message: _27.Input): Uint8Array;
                toProtoMsg(message: _27.Input): _27.InputProtoMsg;
            };
            Output: {
                typeUrl: string;
                encode(message: _27.Output, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.Output;
                fromJSON(object: any): _27.Output;
                toJSON(message: _27.Output): import("../json-safe.js").JsonSafe<_27.Output>;
                fromPartial(object: Partial<_27.Output>): _27.Output;
                fromProtoMsg(message: _27.OutputProtoMsg): _27.Output;
                toProto(message: _27.Output): Uint8Array;
                toProtoMsg(message: _27.Output): _27.OutputProtoMsg;
            };
            Supply: {
                typeUrl: string;
                encode(message: _27.Supply, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.Supply;
                fromJSON(object: any): _27.Supply;
                toJSON(message: _27.Supply): import("../json-safe.js").JsonSafe<_27.Supply>;
                fromPartial(object: Partial<_27.Supply>): _27.Supply;
                fromProtoMsg(message: _27.SupplyProtoMsg): _27.Supply;
                toProto(message: _27.Supply): Uint8Array;
                toProtoMsg(message: _27.Supply): _27.SupplyProtoMsg;
            };
            DenomUnit: {
                typeUrl: string;
                encode(message: _27.DenomUnit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.DenomUnit;
                fromJSON(object: any): _27.DenomUnit;
                toJSON(message: _27.DenomUnit): import("../json-safe.js").JsonSafe<_27.DenomUnit>;
                fromPartial(object: Partial<_27.DenomUnit>): _27.DenomUnit;
                fromProtoMsg(message: _27.DenomUnitProtoMsg): _27.DenomUnit;
                toProto(message: _27.DenomUnit): Uint8Array;
                toProtoMsg(message: _27.DenomUnit): _27.DenomUnitProtoMsg;
            };
            Metadata: {
                typeUrl: string;
                encode(message: _27.Metadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _27.Metadata;
                fromJSON(object: any): _27.Metadata;
                toJSON(message: _27.Metadata): import("../json-safe.js").JsonSafe<_27.Metadata>;
                fromPartial(object: Partial<_27.Metadata>): _27.Metadata;
                fromProtoMsg(message: _27.MetadataProtoMsg): _27.Metadata;
                toProto(message: _27.Metadata): Uint8Array;
                toProtoMsg(message: _27.Metadata): _27.MetadataProtoMsg;
            };
            SendAuthorization: {
                typeUrl: string;
                encode(message: _26.SendAuthorization, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _26.SendAuthorization;
                fromJSON(object: any): _26.SendAuthorization;
                toJSON(message: _26.SendAuthorization): import("../json-safe.js").JsonSafe<_26.SendAuthorization>;
                fromPartial(object: Partial<_26.SendAuthorization>): _26.SendAuthorization;
                fromProtoMsg(message: _26.SendAuthorizationProtoMsg): _26.SendAuthorization;
                toProto(message: _26.SendAuthorization): Uint8Array;
                toProtoMsg(message: _26.SendAuthorization): _26.SendAuthorizationProtoMsg;
            };
        };
    }
    namespace base {
        namespace abci {
            const v1beta1: {
                TxResponse: {
                    typeUrl: string;
                    encode(message: _31.TxResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.TxResponse;
                    fromJSON(object: any): _31.TxResponse;
                    toJSON(message: _31.TxResponse): import("../json-safe.js").JsonSafe<_31.TxResponse>;
                    fromPartial(object: Partial<_31.TxResponse>): _31.TxResponse;
                    fromProtoMsg(message: _31.TxResponseProtoMsg): _31.TxResponse;
                    toProto(message: _31.TxResponse): Uint8Array;
                    toProtoMsg(message: _31.TxResponse): _31.TxResponseProtoMsg;
                };
                ABCIMessageLog: {
                    typeUrl: string;
                    encode(message: _31.ABCIMessageLog, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.ABCIMessageLog;
                    fromJSON(object: any): _31.ABCIMessageLog;
                    toJSON(message: _31.ABCIMessageLog): import("../json-safe.js").JsonSafe<_31.ABCIMessageLog>;
                    fromPartial(object: Partial<_31.ABCIMessageLog>): _31.ABCIMessageLog;
                    fromProtoMsg(message: _31.ABCIMessageLogProtoMsg): _31.ABCIMessageLog;
                    toProto(message: _31.ABCIMessageLog): Uint8Array;
                    toProtoMsg(message: _31.ABCIMessageLog): _31.ABCIMessageLogProtoMsg;
                };
                StringEvent: {
                    typeUrl: string;
                    encode(message: _31.StringEvent, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.StringEvent;
                    fromJSON(object: any): _31.StringEvent;
                    toJSON(message: _31.StringEvent): import("../json-safe.js").JsonSafe<_31.StringEvent>;
                    fromPartial(object: Partial<_31.StringEvent>): _31.StringEvent;
                    fromProtoMsg(message: _31.StringEventProtoMsg): _31.StringEvent;
                    toProto(message: _31.StringEvent): Uint8Array;
                    toProtoMsg(message: _31.StringEvent): _31.StringEventProtoMsg;
                };
                Attribute: {
                    typeUrl: string;
                    encode(message: _31.Attribute, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.Attribute;
                    fromJSON(object: any): _31.Attribute;
                    toJSON(message: _31.Attribute): import("../json-safe.js").JsonSafe<_31.Attribute>;
                    fromPartial(object: Partial<_31.Attribute>): _31.Attribute;
                    fromProtoMsg(message: _31.AttributeProtoMsg): _31.Attribute;
                    toProto(message: _31.Attribute): Uint8Array;
                    toProtoMsg(message: _31.Attribute): _31.AttributeProtoMsg;
                };
                GasInfo: {
                    typeUrl: string;
                    encode(message: _31.GasInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.GasInfo;
                    fromJSON(object: any): _31.GasInfo;
                    toJSON(message: _31.GasInfo): import("../json-safe.js").JsonSafe<_31.GasInfo>;
                    fromPartial(object: Partial<_31.GasInfo>): _31.GasInfo;
                    fromProtoMsg(message: _31.GasInfoProtoMsg): _31.GasInfo;
                    toProto(message: _31.GasInfo): Uint8Array;
                    toProtoMsg(message: _31.GasInfo): _31.GasInfoProtoMsg;
                };
                Result: {
                    typeUrl: string;
                    encode(message: _31.Result, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.Result;
                    fromJSON(object: any): _31.Result;
                    toJSON(message: _31.Result): import("../json-safe.js").JsonSafe<_31.Result>;
                    fromPartial(object: Partial<_31.Result>): _31.Result;
                    fromProtoMsg(message: _31.ResultProtoMsg): _31.Result;
                    toProto(message: _31.Result): Uint8Array;
                    toProtoMsg(message: _31.Result): _31.ResultProtoMsg;
                };
                SimulationResponse: {
                    typeUrl: string;
                    encode(message: _31.SimulationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.SimulationResponse;
                    fromJSON(object: any): _31.SimulationResponse;
                    toJSON(message: _31.SimulationResponse): import("../json-safe.js").JsonSafe<_31.SimulationResponse>;
                    fromPartial(object: Partial<_31.SimulationResponse>): _31.SimulationResponse;
                    fromProtoMsg(message: _31.SimulationResponseProtoMsg): _31.SimulationResponse;
                    toProto(message: _31.SimulationResponse): Uint8Array;
                    toProtoMsg(message: _31.SimulationResponse): _31.SimulationResponseProtoMsg;
                };
                MsgData: {
                    typeUrl: string;
                    encode(message: _31.MsgData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.MsgData;
                    fromJSON(object: any): _31.MsgData;
                    toJSON(message: _31.MsgData): import("../json-safe.js").JsonSafe<_31.MsgData>;
                    fromPartial(object: Partial<_31.MsgData>): _31.MsgData;
                    fromProtoMsg(message: _31.MsgDataProtoMsg): _31.MsgData;
                    toProto(message: _31.MsgData): Uint8Array;
                    toProtoMsg(message: _31.MsgData): _31.MsgDataProtoMsg;
                };
                TxMsgData: {
                    typeUrl: string;
                    encode(message: _31.TxMsgData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.TxMsgData;
                    fromJSON(object: any): _31.TxMsgData;
                    toJSON(message: _31.TxMsgData): import("../json-safe.js").JsonSafe<_31.TxMsgData>;
                    fromPartial(object: Partial<_31.TxMsgData>): _31.TxMsgData;
                    fromProtoMsg(message: _31.TxMsgDataProtoMsg): _31.TxMsgData;
                    toProto(message: _31.TxMsgData): Uint8Array;
                    toProtoMsg(message: _31.TxMsgData): _31.TxMsgDataProtoMsg;
                };
                SearchTxsResult: {
                    typeUrl: string;
                    encode(message: _31.SearchTxsResult, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _31.SearchTxsResult;
                    fromJSON(object: any): _31.SearchTxsResult;
                    toJSON(message: _31.SearchTxsResult): import("../json-safe.js").JsonSafe<_31.SearchTxsResult>;
                    fromPartial(object: Partial<_31.SearchTxsResult>): _31.SearchTxsResult;
                    fromProtoMsg(message: _31.SearchTxsResultProtoMsg): _31.SearchTxsResult;
                    toProto(message: _31.SearchTxsResult): Uint8Array;
                    toProtoMsg(message: _31.SearchTxsResult): _31.SearchTxsResultProtoMsg;
                };
            };
        }
        namespace node {
            const v1beta1: {
                ConfigRequest: {
                    typeUrl: string;
                    encode(_: _32.ConfigRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _32.ConfigRequest;
                    fromJSON(_: any): _32.ConfigRequest;
                    toJSON(_: _32.ConfigRequest): import("../json-safe.js").JsonSafe<_32.ConfigRequest>;
                    fromPartial(_: Partial<_32.ConfigRequest>): _32.ConfigRequest;
                    fromProtoMsg(message: _32.ConfigRequestProtoMsg): _32.ConfigRequest;
                    toProto(message: _32.ConfigRequest): Uint8Array;
                    toProtoMsg(message: _32.ConfigRequest): _32.ConfigRequestProtoMsg;
                };
                ConfigResponse: {
                    typeUrl: string;
                    encode(message: _32.ConfigResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _32.ConfigResponse;
                    fromJSON(object: any): _32.ConfigResponse;
                    toJSON(message: _32.ConfigResponse): import("../json-safe.js").JsonSafe<_32.ConfigResponse>;
                    fromPartial(object: Partial<_32.ConfigResponse>): _32.ConfigResponse;
                    fromProtoMsg(message: _32.ConfigResponseProtoMsg): _32.ConfigResponse;
                    toProto(message: _32.ConfigResponse): Uint8Array;
                    toProtoMsg(message: _32.ConfigResponse): _32.ConfigResponseProtoMsg;
                };
            };
        }
        namespace query {
            const v1beta1: {
                PageRequest: {
                    typeUrl: string;
                    encode(message: _33.PageRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _33.PageRequest;
                    fromJSON(object: any): _33.PageRequest;
                    toJSON(message: _33.PageRequest): import("../json-safe.js").JsonSafe<_33.PageRequest>;
                    fromPartial(object: Partial<_33.PageRequest>): _33.PageRequest;
                    fromProtoMsg(message: _33.PageRequestProtoMsg): _33.PageRequest;
                    toProto(message: _33.PageRequest): Uint8Array;
                    toProtoMsg(message: _33.PageRequest): _33.PageRequestProtoMsg;
                };
                PageResponse: {
                    typeUrl: string;
                    encode(message: _33.PageResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _33.PageResponse;
                    fromJSON(object: any): _33.PageResponse;
                    toJSON(message: _33.PageResponse): import("../json-safe.js").JsonSafe<_33.PageResponse>;
                    fromPartial(object: Partial<_33.PageResponse>): _33.PageResponse;
                    fromProtoMsg(message: _33.PageResponseProtoMsg): _33.PageResponse;
                    toProto(message: _33.PageResponse): Uint8Array;
                    toProtoMsg(message: _33.PageResponse): _33.PageResponseProtoMsg;
                };
            };
        }
        namespace reflection {
            const v2alpha1: {
                AppDescriptor: {
                    typeUrl: string;
                    encode(message: _34.AppDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.AppDescriptor;
                    fromJSON(object: any): _34.AppDescriptor;
                    toJSON(message: _34.AppDescriptor): import("../json-safe.js").JsonSafe<_34.AppDescriptor>;
                    fromPartial(object: Partial<_34.AppDescriptor>): _34.AppDescriptor;
                    fromProtoMsg(message: _34.AppDescriptorProtoMsg): _34.AppDescriptor;
                    toProto(message: _34.AppDescriptor): Uint8Array;
                    toProtoMsg(message: _34.AppDescriptor): _34.AppDescriptorProtoMsg;
                };
                TxDescriptor: {
                    typeUrl: string;
                    encode(message: _34.TxDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.TxDescriptor;
                    fromJSON(object: any): _34.TxDescriptor;
                    toJSON(message: _34.TxDescriptor): import("../json-safe.js").JsonSafe<_34.TxDescriptor>;
                    fromPartial(object: Partial<_34.TxDescriptor>): _34.TxDescriptor;
                    fromProtoMsg(message: _34.TxDescriptorProtoMsg): _34.TxDescriptor;
                    toProto(message: _34.TxDescriptor): Uint8Array;
                    toProtoMsg(message: _34.TxDescriptor): _34.TxDescriptorProtoMsg;
                };
                AuthnDescriptor: {
                    typeUrl: string;
                    encode(message: _34.AuthnDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.AuthnDescriptor;
                    fromJSON(object: any): _34.AuthnDescriptor;
                    toJSON(message: _34.AuthnDescriptor): import("../json-safe.js").JsonSafe<_34.AuthnDescriptor>;
                    fromPartial(object: Partial<_34.AuthnDescriptor>): _34.AuthnDescriptor;
                    fromProtoMsg(message: _34.AuthnDescriptorProtoMsg): _34.AuthnDescriptor;
                    toProto(message: _34.AuthnDescriptor): Uint8Array;
                    toProtoMsg(message: _34.AuthnDescriptor): _34.AuthnDescriptorProtoMsg;
                };
                SigningModeDescriptor: {
                    typeUrl: string;
                    encode(message: _34.SigningModeDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.SigningModeDescriptor;
                    fromJSON(object: any): _34.SigningModeDescriptor;
                    toJSON(message: _34.SigningModeDescriptor): import("../json-safe.js").JsonSafe<_34.SigningModeDescriptor>;
                    fromPartial(object: Partial<_34.SigningModeDescriptor>): _34.SigningModeDescriptor;
                    fromProtoMsg(message: _34.SigningModeDescriptorProtoMsg): _34.SigningModeDescriptor;
                    toProto(message: _34.SigningModeDescriptor): Uint8Array;
                    toProtoMsg(message: _34.SigningModeDescriptor): _34.SigningModeDescriptorProtoMsg;
                };
                ChainDescriptor: {
                    typeUrl: string;
                    encode(message: _34.ChainDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.ChainDescriptor;
                    fromJSON(object: any): _34.ChainDescriptor;
                    toJSON(message: _34.ChainDescriptor): import("../json-safe.js").JsonSafe<_34.ChainDescriptor>;
                    fromPartial(object: Partial<_34.ChainDescriptor>): _34.ChainDescriptor;
                    fromProtoMsg(message: _34.ChainDescriptorProtoMsg): _34.ChainDescriptor;
                    toProto(message: _34.ChainDescriptor): Uint8Array;
                    toProtoMsg(message: _34.ChainDescriptor): _34.ChainDescriptorProtoMsg;
                };
                CodecDescriptor: {
                    typeUrl: string;
                    encode(message: _34.CodecDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.CodecDescriptor;
                    fromJSON(object: any): _34.CodecDescriptor;
                    toJSON(message: _34.CodecDescriptor): import("../json-safe.js").JsonSafe<_34.CodecDescriptor>;
                    fromPartial(object: Partial<_34.CodecDescriptor>): _34.CodecDescriptor;
                    fromProtoMsg(message: _34.CodecDescriptorProtoMsg): _34.CodecDescriptor;
                    toProto(message: _34.CodecDescriptor): Uint8Array;
                    toProtoMsg(message: _34.CodecDescriptor): _34.CodecDescriptorProtoMsg;
                };
                InterfaceDescriptor: {
                    typeUrl: string;
                    encode(message: _34.InterfaceDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.InterfaceDescriptor;
                    fromJSON(object: any): _34.InterfaceDescriptor;
                    toJSON(message: _34.InterfaceDescriptor): import("../json-safe.js").JsonSafe<_34.InterfaceDescriptor>;
                    fromPartial(object: Partial<_34.InterfaceDescriptor>): _34.InterfaceDescriptor;
                    fromProtoMsg(message: _34.InterfaceDescriptorProtoMsg): _34.InterfaceDescriptor;
                    toProto(message: _34.InterfaceDescriptor): Uint8Array;
                    toProtoMsg(message: _34.InterfaceDescriptor): _34.InterfaceDescriptorProtoMsg;
                };
                InterfaceImplementerDescriptor: {
                    typeUrl: string;
                    encode(message: _34.InterfaceImplementerDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.InterfaceImplementerDescriptor;
                    fromJSON(object: any): _34.InterfaceImplementerDescriptor;
                    toJSON(message: _34.InterfaceImplementerDescriptor): import("../json-safe.js").JsonSafe<_34.InterfaceImplementerDescriptor>;
                    fromPartial(object: Partial<_34.InterfaceImplementerDescriptor>): _34.InterfaceImplementerDescriptor;
                    fromProtoMsg(message: _34.InterfaceImplementerDescriptorProtoMsg): _34.InterfaceImplementerDescriptor;
                    toProto(message: _34.InterfaceImplementerDescriptor): Uint8Array;
                    toProtoMsg(message: _34.InterfaceImplementerDescriptor): _34.InterfaceImplementerDescriptorProtoMsg;
                };
                InterfaceAcceptingMessageDescriptor: {
                    typeUrl: string;
                    encode(message: _34.InterfaceAcceptingMessageDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.InterfaceAcceptingMessageDescriptor;
                    fromJSON(object: any): _34.InterfaceAcceptingMessageDescriptor;
                    toJSON(message: _34.InterfaceAcceptingMessageDescriptor): import("../json-safe.js").JsonSafe<_34.InterfaceAcceptingMessageDescriptor>;
                    fromPartial(object: Partial<_34.InterfaceAcceptingMessageDescriptor>): _34.InterfaceAcceptingMessageDescriptor;
                    fromProtoMsg(message: _34.InterfaceAcceptingMessageDescriptorProtoMsg): _34.InterfaceAcceptingMessageDescriptor;
                    toProto(message: _34.InterfaceAcceptingMessageDescriptor): Uint8Array;
                    toProtoMsg(message: _34.InterfaceAcceptingMessageDescriptor): _34.InterfaceAcceptingMessageDescriptorProtoMsg;
                };
                ConfigurationDescriptor: {
                    typeUrl: string;
                    encode(message: _34.ConfigurationDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.ConfigurationDescriptor;
                    fromJSON(object: any): _34.ConfigurationDescriptor;
                    toJSON(message: _34.ConfigurationDescriptor): import("../json-safe.js").JsonSafe<_34.ConfigurationDescriptor>;
                    fromPartial(object: Partial<_34.ConfigurationDescriptor>): _34.ConfigurationDescriptor;
                    fromProtoMsg(message: _34.ConfigurationDescriptorProtoMsg): _34.ConfigurationDescriptor;
                    toProto(message: _34.ConfigurationDescriptor): Uint8Array;
                    toProtoMsg(message: _34.ConfigurationDescriptor): _34.ConfigurationDescriptorProtoMsg;
                };
                MsgDescriptor: {
                    typeUrl: string;
                    encode(message: _34.MsgDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.MsgDescriptor;
                    fromJSON(object: any): _34.MsgDescriptor;
                    toJSON(message: _34.MsgDescriptor): import("../json-safe.js").JsonSafe<_34.MsgDescriptor>;
                    fromPartial(object: Partial<_34.MsgDescriptor>): _34.MsgDescriptor;
                    fromProtoMsg(message: _34.MsgDescriptorProtoMsg): _34.MsgDescriptor;
                    toProto(message: _34.MsgDescriptor): Uint8Array;
                    toProtoMsg(message: _34.MsgDescriptor): _34.MsgDescriptorProtoMsg;
                };
                GetAuthnDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetAuthnDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetAuthnDescriptorRequest;
                    fromJSON(_: any): _34.GetAuthnDescriptorRequest;
                    toJSON(_: _34.GetAuthnDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetAuthnDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetAuthnDescriptorRequest>): _34.GetAuthnDescriptorRequest;
                    fromProtoMsg(message: _34.GetAuthnDescriptorRequestProtoMsg): _34.GetAuthnDescriptorRequest;
                    toProto(message: _34.GetAuthnDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetAuthnDescriptorRequest): _34.GetAuthnDescriptorRequestProtoMsg;
                };
                GetAuthnDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetAuthnDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetAuthnDescriptorResponse;
                    fromJSON(object: any): _34.GetAuthnDescriptorResponse;
                    toJSON(message: _34.GetAuthnDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetAuthnDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetAuthnDescriptorResponse>): _34.GetAuthnDescriptorResponse;
                    fromProtoMsg(message: _34.GetAuthnDescriptorResponseProtoMsg): _34.GetAuthnDescriptorResponse;
                    toProto(message: _34.GetAuthnDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetAuthnDescriptorResponse): _34.GetAuthnDescriptorResponseProtoMsg;
                };
                GetChainDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetChainDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetChainDescriptorRequest;
                    fromJSON(_: any): _34.GetChainDescriptorRequest;
                    toJSON(_: _34.GetChainDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetChainDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetChainDescriptorRequest>): _34.GetChainDescriptorRequest;
                    fromProtoMsg(message: _34.GetChainDescriptorRequestProtoMsg): _34.GetChainDescriptorRequest;
                    toProto(message: _34.GetChainDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetChainDescriptorRequest): _34.GetChainDescriptorRequestProtoMsg;
                };
                GetChainDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetChainDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetChainDescriptorResponse;
                    fromJSON(object: any): _34.GetChainDescriptorResponse;
                    toJSON(message: _34.GetChainDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetChainDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetChainDescriptorResponse>): _34.GetChainDescriptorResponse;
                    fromProtoMsg(message: _34.GetChainDescriptorResponseProtoMsg): _34.GetChainDescriptorResponse;
                    toProto(message: _34.GetChainDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetChainDescriptorResponse): _34.GetChainDescriptorResponseProtoMsg;
                };
                GetCodecDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetCodecDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetCodecDescriptorRequest;
                    fromJSON(_: any): _34.GetCodecDescriptorRequest;
                    toJSON(_: _34.GetCodecDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetCodecDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetCodecDescriptorRequest>): _34.GetCodecDescriptorRequest;
                    fromProtoMsg(message: _34.GetCodecDescriptorRequestProtoMsg): _34.GetCodecDescriptorRequest;
                    toProto(message: _34.GetCodecDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetCodecDescriptorRequest): _34.GetCodecDescriptorRequestProtoMsg;
                };
                GetCodecDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetCodecDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetCodecDescriptorResponse;
                    fromJSON(object: any): _34.GetCodecDescriptorResponse;
                    toJSON(message: _34.GetCodecDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetCodecDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetCodecDescriptorResponse>): _34.GetCodecDescriptorResponse;
                    fromProtoMsg(message: _34.GetCodecDescriptorResponseProtoMsg): _34.GetCodecDescriptorResponse;
                    toProto(message: _34.GetCodecDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetCodecDescriptorResponse): _34.GetCodecDescriptorResponseProtoMsg;
                };
                GetConfigurationDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetConfigurationDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetConfigurationDescriptorRequest;
                    fromJSON(_: any): _34.GetConfigurationDescriptorRequest;
                    toJSON(_: _34.GetConfigurationDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetConfigurationDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetConfigurationDescriptorRequest>): _34.GetConfigurationDescriptorRequest;
                    fromProtoMsg(message: _34.GetConfigurationDescriptorRequestProtoMsg): _34.GetConfigurationDescriptorRequest;
                    toProto(message: _34.GetConfigurationDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetConfigurationDescriptorRequest): _34.GetConfigurationDescriptorRequestProtoMsg;
                };
                GetConfigurationDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetConfigurationDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetConfigurationDescriptorResponse;
                    fromJSON(object: any): _34.GetConfigurationDescriptorResponse;
                    toJSON(message: _34.GetConfigurationDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetConfigurationDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetConfigurationDescriptorResponse>): _34.GetConfigurationDescriptorResponse;
                    fromProtoMsg(message: _34.GetConfigurationDescriptorResponseProtoMsg): _34.GetConfigurationDescriptorResponse;
                    toProto(message: _34.GetConfigurationDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetConfigurationDescriptorResponse): _34.GetConfigurationDescriptorResponseProtoMsg;
                };
                GetQueryServicesDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetQueryServicesDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetQueryServicesDescriptorRequest;
                    fromJSON(_: any): _34.GetQueryServicesDescriptorRequest;
                    toJSON(_: _34.GetQueryServicesDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetQueryServicesDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetQueryServicesDescriptorRequest>): _34.GetQueryServicesDescriptorRequest;
                    fromProtoMsg(message: _34.GetQueryServicesDescriptorRequestProtoMsg): _34.GetQueryServicesDescriptorRequest;
                    toProto(message: _34.GetQueryServicesDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetQueryServicesDescriptorRequest): _34.GetQueryServicesDescriptorRequestProtoMsg;
                };
                GetQueryServicesDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetQueryServicesDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetQueryServicesDescriptorResponse;
                    fromJSON(object: any): _34.GetQueryServicesDescriptorResponse;
                    toJSON(message: _34.GetQueryServicesDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetQueryServicesDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetQueryServicesDescriptorResponse>): _34.GetQueryServicesDescriptorResponse;
                    fromProtoMsg(message: _34.GetQueryServicesDescriptorResponseProtoMsg): _34.GetQueryServicesDescriptorResponse;
                    toProto(message: _34.GetQueryServicesDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetQueryServicesDescriptorResponse): _34.GetQueryServicesDescriptorResponseProtoMsg;
                };
                GetTxDescriptorRequest: {
                    typeUrl: string;
                    encode(_: _34.GetTxDescriptorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetTxDescriptorRequest;
                    fromJSON(_: any): _34.GetTxDescriptorRequest;
                    toJSON(_: _34.GetTxDescriptorRequest): import("../json-safe.js").JsonSafe<_34.GetTxDescriptorRequest>;
                    fromPartial(_: Partial<_34.GetTxDescriptorRequest>): _34.GetTxDescriptorRequest;
                    fromProtoMsg(message: _34.GetTxDescriptorRequestProtoMsg): _34.GetTxDescriptorRequest;
                    toProto(message: _34.GetTxDescriptorRequest): Uint8Array;
                    toProtoMsg(message: _34.GetTxDescriptorRequest): _34.GetTxDescriptorRequestProtoMsg;
                };
                GetTxDescriptorResponse: {
                    typeUrl: string;
                    encode(message: _34.GetTxDescriptorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.GetTxDescriptorResponse;
                    fromJSON(object: any): _34.GetTxDescriptorResponse;
                    toJSON(message: _34.GetTxDescriptorResponse): import("../json-safe.js").JsonSafe<_34.GetTxDescriptorResponse>;
                    fromPartial(object: Partial<_34.GetTxDescriptorResponse>): _34.GetTxDescriptorResponse;
                    fromProtoMsg(message: _34.GetTxDescriptorResponseProtoMsg): _34.GetTxDescriptorResponse;
                    toProto(message: _34.GetTxDescriptorResponse): Uint8Array;
                    toProtoMsg(message: _34.GetTxDescriptorResponse): _34.GetTxDescriptorResponseProtoMsg;
                };
                QueryServicesDescriptor: {
                    typeUrl: string;
                    encode(message: _34.QueryServicesDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.QueryServicesDescriptor;
                    fromJSON(object: any): _34.QueryServicesDescriptor;
                    toJSON(message: _34.QueryServicesDescriptor): import("../json-safe.js").JsonSafe<_34.QueryServicesDescriptor>;
                    fromPartial(object: Partial<_34.QueryServicesDescriptor>): _34.QueryServicesDescriptor;
                    fromProtoMsg(message: _34.QueryServicesDescriptorProtoMsg): _34.QueryServicesDescriptor;
                    toProto(message: _34.QueryServicesDescriptor): Uint8Array;
                    toProtoMsg(message: _34.QueryServicesDescriptor): _34.QueryServicesDescriptorProtoMsg;
                };
                QueryServiceDescriptor: {
                    typeUrl: string;
                    encode(message: _34.QueryServiceDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.QueryServiceDescriptor;
                    fromJSON(object: any): _34.QueryServiceDescriptor;
                    toJSON(message: _34.QueryServiceDescriptor): import("../json-safe.js").JsonSafe<_34.QueryServiceDescriptor>;
                    fromPartial(object: Partial<_34.QueryServiceDescriptor>): _34.QueryServiceDescriptor;
                    fromProtoMsg(message: _34.QueryServiceDescriptorProtoMsg): _34.QueryServiceDescriptor;
                    toProto(message: _34.QueryServiceDescriptor): Uint8Array;
                    toProtoMsg(message: _34.QueryServiceDescriptor): _34.QueryServiceDescriptorProtoMsg;
                };
                QueryMethodDescriptor: {
                    typeUrl: string;
                    encode(message: _34.QueryMethodDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _34.QueryMethodDescriptor;
                    fromJSON(object: any): _34.QueryMethodDescriptor;
                    toJSON(message: _34.QueryMethodDescriptor): import("../json-safe.js").JsonSafe<_34.QueryMethodDescriptor>;
                    fromPartial(object: Partial<_34.QueryMethodDescriptor>): _34.QueryMethodDescriptor;
                    fromProtoMsg(message: _34.QueryMethodDescriptorProtoMsg): _34.QueryMethodDescriptor;
                    toProto(message: _34.QueryMethodDescriptor): Uint8Array;
                    toProtoMsg(message: _34.QueryMethodDescriptor): _34.QueryMethodDescriptorProtoMsg;
                };
            };
        }
        const v1beta1: {
            Coin: {
                typeUrl: string;
                encode(message: _35.Coin, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _35.Coin;
                fromJSON(object: any): _35.Coin;
                toJSON(message: _35.Coin): import("../json-safe.js").JsonSafe<_35.Coin>;
                fromPartial(object: Partial<_35.Coin>): _35.Coin;
                fromProtoMsg(message: _35.CoinProtoMsg): _35.Coin;
                toProto(message: _35.Coin): Uint8Array;
                toProtoMsg(message: _35.Coin): _35.CoinProtoMsg;
            };
            DecCoin: {
                typeUrl: string;
                encode(message: _35.DecCoin, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _35.DecCoin;
                fromJSON(object: any): _35.DecCoin;
                toJSON(message: _35.DecCoin): import("../json-safe.js").JsonSafe<_35.DecCoin>;
                fromPartial(object: Partial<_35.DecCoin>): _35.DecCoin;
                fromProtoMsg(message: _35.DecCoinProtoMsg): _35.DecCoin;
                toProto(message: _35.DecCoin): Uint8Array;
                toProtoMsg(message: _35.DecCoin): _35.DecCoinProtoMsg;
            };
            IntProto: {
                typeUrl: string;
                encode(message: _35.IntProto, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _35.IntProto;
                fromJSON(object: any): _35.IntProto;
                toJSON(message: _35.IntProto): import("../json-safe.js").JsonSafe<_35.IntProto>;
                fromPartial(object: Partial<_35.IntProto>): _35.IntProto;
                fromProtoMsg(message: _35.IntProtoProtoMsg): _35.IntProto;
                toProto(message: _35.IntProto): Uint8Array;
                toProtoMsg(message: _35.IntProto): _35.IntProtoProtoMsg;
            };
            DecProto: {
                typeUrl: string;
                encode(message: _35.DecProto, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _35.DecProto;
                fromJSON(object: any): _35.DecProto;
                toJSON(message: _35.DecProto): import("../json-safe.js").JsonSafe<_35.DecProto>;
                fromPartial(object: Partial<_35.DecProto>): _35.DecProto;
                fromProtoMsg(message: _35.DecProtoProtoMsg): _35.DecProto;
                toProto(message: _35.DecProto): Uint8Array;
                toProtoMsg(message: _35.DecProto): _35.DecProtoProtoMsg;
            };
        };
    }
    namespace crypto {
        const ed25519: {
            PubKey: {
                typeUrl: string;
                encode(message: _36.PubKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _36.PubKey;
                fromJSON(object: any): _36.PubKey;
                toJSON(message: _36.PubKey): import("../json-safe.js").JsonSafe<_36.PubKey>;
                fromPartial(object: Partial<_36.PubKey>): _36.PubKey;
                fromProtoMsg(message: _36.PubKeyProtoMsg): _36.PubKey;
                toProto(message: _36.PubKey): Uint8Array;
                toProtoMsg(message: _36.PubKey): _36.PubKeyProtoMsg;
            };
            PrivKey: {
                typeUrl: string;
                encode(message: _36.PrivKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _36.PrivKey;
                fromJSON(object: any): _36.PrivKey;
                toJSON(message: _36.PrivKey): import("../json-safe.js").JsonSafe<_36.PrivKey>;
                fromPartial(object: Partial<_36.PrivKey>): _36.PrivKey;
                fromProtoMsg(message: _36.PrivKeyProtoMsg): _36.PrivKey;
                toProto(message: _36.PrivKey): Uint8Array;
                toProtoMsg(message: _36.PrivKey): _36.PrivKeyProtoMsg;
            };
        };
        namespace hd {
            const v1: {
                BIP44Params: {
                    typeUrl: string;
                    encode(message: _37.BIP44Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _37.BIP44Params;
                    fromJSON(object: any): _37.BIP44Params;
                    toJSON(message: _37.BIP44Params): import("../json-safe.js").JsonSafe<_37.BIP44Params>;
                    fromPartial(object: Partial<_37.BIP44Params>): _37.BIP44Params;
                    fromProtoMsg(message: _37.BIP44ParamsProtoMsg): _37.BIP44Params;
                    toProto(message: _37.BIP44Params): Uint8Array;
                    toProtoMsg(message: _37.BIP44Params): _37.BIP44ParamsProtoMsg;
                };
            };
        }
        namespace keyring {
            const v1: {
                Record: {
                    typeUrl: string;
                    encode(message: _38.Record, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _38.Record;
                    fromJSON(object: any): _38.Record;
                    toJSON(message: _38.Record): import("../json-safe.js").JsonSafe<_38.Record>;
                    fromPartial(object: Partial<_38.Record>): _38.Record;
                    fromProtoMsg(message: _38.RecordProtoMsg): _38.Record;
                    toProto(message: _38.Record): Uint8Array;
                    toProtoMsg(message: _38.Record): _38.RecordProtoMsg;
                };
                Record_Local: {
                    typeUrl: string;
                    encode(message: _38.Record_Local, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _38.Record_Local;
                    fromJSON(object: any): _38.Record_Local;
                    toJSON(message: _38.Record_Local): import("../json-safe.js").JsonSafe<_38.Record_Local>;
                    fromPartial(object: Partial<_38.Record_Local>): _38.Record_Local;
                    fromProtoMsg(message: _38.Record_LocalProtoMsg): _38.Record_Local;
                    toProto(message: _38.Record_Local): Uint8Array;
                    toProtoMsg(message: _38.Record_Local): _38.Record_LocalProtoMsg;
                };
                Record_Ledger: {
                    typeUrl: string;
                    encode(message: _38.Record_Ledger, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _38.Record_Ledger;
                    fromJSON(object: any): _38.Record_Ledger;
                    toJSON(message: _38.Record_Ledger): import("../json-safe.js").JsonSafe<_38.Record_Ledger>;
                    fromPartial(object: Partial<_38.Record_Ledger>): _38.Record_Ledger;
                    fromProtoMsg(message: _38.Record_LedgerProtoMsg): _38.Record_Ledger;
                    toProto(message: _38.Record_Ledger): Uint8Array;
                    toProtoMsg(message: _38.Record_Ledger): _38.Record_LedgerProtoMsg;
                };
                Record_Multi: {
                    typeUrl: string;
                    encode(_: _38.Record_Multi, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _38.Record_Multi;
                    fromJSON(_: any): _38.Record_Multi;
                    toJSON(_: _38.Record_Multi): import("../json-safe.js").JsonSafe<_38.Record_Multi>;
                    fromPartial(_: Partial<_38.Record_Multi>): _38.Record_Multi;
                    fromProtoMsg(message: _38.Record_MultiProtoMsg): _38.Record_Multi;
                    toProto(message: _38.Record_Multi): Uint8Array;
                    toProtoMsg(message: _38.Record_Multi): _38.Record_MultiProtoMsg;
                };
                Record_Offline: {
                    typeUrl: string;
                    encode(_: _38.Record_Offline, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _38.Record_Offline;
                    fromJSON(_: any): _38.Record_Offline;
                    toJSON(_: _38.Record_Offline): import("../json-safe.js").JsonSafe<_38.Record_Offline>;
                    fromPartial(_: Partial<_38.Record_Offline>): _38.Record_Offline;
                    fromProtoMsg(message: _38.Record_OfflineProtoMsg): _38.Record_Offline;
                    toProto(message: _38.Record_Offline): Uint8Array;
                    toProtoMsg(message: _38.Record_Offline): _38.Record_OfflineProtoMsg;
                };
            };
        }
        const multisig: {
            LegacyAminoPubKey: {
                typeUrl: string;
                encode(message: _39.LegacyAminoPubKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _39.LegacyAminoPubKey;
                fromJSON(object: any): _39.LegacyAminoPubKey;
                toJSON(message: _39.LegacyAminoPubKey): import("../json-safe.js").JsonSafe<_39.LegacyAminoPubKey>;
                fromPartial(object: Partial<_39.LegacyAminoPubKey>): _39.LegacyAminoPubKey;
                fromProtoMsg(message: _39.LegacyAminoPubKeyProtoMsg): _39.LegacyAminoPubKey;
                toProto(message: _39.LegacyAminoPubKey): Uint8Array;
                toProtoMsg(message: _39.LegacyAminoPubKey): _39.LegacyAminoPubKeyProtoMsg;
            };
        };
        const secp256k1: {
            PubKey: {
                typeUrl: string;
                encode(message: _40.PubKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _40.PubKey;
                fromJSON(object: any): _40.PubKey;
                toJSON(message: _40.PubKey): import("../json-safe.js").JsonSafe<_40.PubKey>;
                fromPartial(object: Partial<_40.PubKey>): _40.PubKey;
                fromProtoMsg(message: _40.PubKeyProtoMsg): _40.PubKey;
                toProto(message: _40.PubKey): Uint8Array;
                toProtoMsg(message: _40.PubKey): _40.PubKeyProtoMsg;
            };
            PrivKey: {
                typeUrl: string;
                encode(message: _40.PrivKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _40.PrivKey;
                fromJSON(object: any): _40.PrivKey;
                toJSON(message: _40.PrivKey): import("../json-safe.js").JsonSafe<_40.PrivKey>;
                fromPartial(object: Partial<_40.PrivKey>): _40.PrivKey;
                fromProtoMsg(message: _40.PrivKeyProtoMsg): _40.PrivKey;
                toProto(message: _40.PrivKey): Uint8Array;
                toProtoMsg(message: _40.PrivKey): _40.PrivKeyProtoMsg;
            };
        };
        const secp256r1: {
            PubKey: {
                typeUrl: string;
                encode(message: _41.PubKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _41.PubKey;
                fromJSON(object: any): _41.PubKey;
                toJSON(message: _41.PubKey): import("../json-safe.js").JsonSafe<_41.PubKey>;
                fromPartial(object: Partial<_41.PubKey>): _41.PubKey;
                fromProtoMsg(message: _41.PubKeyProtoMsg): _41.PubKey;
                toProto(message: _41.PubKey): Uint8Array;
                toProtoMsg(message: _41.PubKey): _41.PubKeyProtoMsg;
            };
            PrivKey: {
                typeUrl: string;
                encode(message: _41.PrivKey, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _41.PrivKey;
                fromJSON(object: any): _41.PrivKey;
                toJSON(message: _41.PrivKey): import("../json-safe.js").JsonSafe<_41.PrivKey>;
                fromPartial(object: Partial<_41.PrivKey>): _41.PrivKey;
                fromProtoMsg(message: _41.PrivKeyProtoMsg): _41.PrivKey;
                toProto(message: _41.PrivKey): Uint8Array;
                toProtoMsg(message: _41.PrivKey): _41.PrivKeyProtoMsg;
            };
        };
    }
    namespace distribution {
        const v1beta1: {
            MsgSetWithdrawAddress: {
                typeUrl: string;
                encode(message: _45.MsgSetWithdrawAddress, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgSetWithdrawAddress;
                fromJSON(object: any): _45.MsgSetWithdrawAddress;
                toJSON(message: _45.MsgSetWithdrawAddress): import("../json-safe.js").JsonSafe<_45.MsgSetWithdrawAddress>;
                fromPartial(object: Partial<_45.MsgSetWithdrawAddress>): _45.MsgSetWithdrawAddress;
                fromProtoMsg(message: _45.MsgSetWithdrawAddressProtoMsg): _45.MsgSetWithdrawAddress;
                toProto(message: _45.MsgSetWithdrawAddress): Uint8Array;
                toProtoMsg(message: _45.MsgSetWithdrawAddress): _45.MsgSetWithdrawAddressProtoMsg;
            };
            MsgSetWithdrawAddressResponse: {
                typeUrl: string;
                encode(_: _45.MsgSetWithdrawAddressResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgSetWithdrawAddressResponse;
                fromJSON(_: any): _45.MsgSetWithdrawAddressResponse;
                toJSON(_: _45.MsgSetWithdrawAddressResponse): import("../json-safe.js").JsonSafe<_45.MsgSetWithdrawAddressResponse>;
                fromPartial(_: Partial<_45.MsgSetWithdrawAddressResponse>): _45.MsgSetWithdrawAddressResponse;
                fromProtoMsg(message: _45.MsgSetWithdrawAddressResponseProtoMsg): _45.MsgSetWithdrawAddressResponse;
                toProto(message: _45.MsgSetWithdrawAddressResponse): Uint8Array;
                toProtoMsg(message: _45.MsgSetWithdrawAddressResponse): _45.MsgSetWithdrawAddressResponseProtoMsg;
            };
            MsgWithdrawDelegatorReward: {
                typeUrl: string;
                encode(message: _45.MsgWithdrawDelegatorReward, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgWithdrawDelegatorReward;
                fromJSON(object: any): _45.MsgWithdrawDelegatorReward;
                toJSON(message: _45.MsgWithdrawDelegatorReward): import("../json-safe.js").JsonSafe<_45.MsgWithdrawDelegatorReward>;
                fromPartial(object: Partial<_45.MsgWithdrawDelegatorReward>): _45.MsgWithdrawDelegatorReward;
                fromProtoMsg(message: _45.MsgWithdrawDelegatorRewardProtoMsg): _45.MsgWithdrawDelegatorReward;
                toProto(message: _45.MsgWithdrawDelegatorReward): Uint8Array;
                toProtoMsg(message: _45.MsgWithdrawDelegatorReward): _45.MsgWithdrawDelegatorRewardProtoMsg;
            };
            MsgWithdrawDelegatorRewardResponse: {
                typeUrl: string;
                encode(message: _45.MsgWithdrawDelegatorRewardResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgWithdrawDelegatorRewardResponse;
                fromJSON(object: any): _45.MsgWithdrawDelegatorRewardResponse;
                toJSON(message: _45.MsgWithdrawDelegatorRewardResponse): import("../json-safe.js").JsonSafe<_45.MsgWithdrawDelegatorRewardResponse>;
                fromPartial(object: Partial<_45.MsgWithdrawDelegatorRewardResponse>): _45.MsgWithdrawDelegatorRewardResponse;
                fromProtoMsg(message: _45.MsgWithdrawDelegatorRewardResponseProtoMsg): _45.MsgWithdrawDelegatorRewardResponse;
                toProto(message: _45.MsgWithdrawDelegatorRewardResponse): Uint8Array;
                toProtoMsg(message: _45.MsgWithdrawDelegatorRewardResponse): _45.MsgWithdrawDelegatorRewardResponseProtoMsg;
            };
            MsgWithdrawValidatorCommission: {
                typeUrl: string;
                encode(message: _45.MsgWithdrawValidatorCommission, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgWithdrawValidatorCommission;
                fromJSON(object: any): _45.MsgWithdrawValidatorCommission;
                toJSON(message: _45.MsgWithdrawValidatorCommission): import("../json-safe.js").JsonSafe<_45.MsgWithdrawValidatorCommission>;
                fromPartial(object: Partial<_45.MsgWithdrawValidatorCommission>): _45.MsgWithdrawValidatorCommission;
                fromProtoMsg(message: _45.MsgWithdrawValidatorCommissionProtoMsg): _45.MsgWithdrawValidatorCommission;
                toProto(message: _45.MsgWithdrawValidatorCommission): Uint8Array;
                toProtoMsg(message: _45.MsgWithdrawValidatorCommission): _45.MsgWithdrawValidatorCommissionProtoMsg;
            };
            MsgWithdrawValidatorCommissionResponse: {
                typeUrl: string;
                encode(message: _45.MsgWithdrawValidatorCommissionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgWithdrawValidatorCommissionResponse;
                fromJSON(object: any): _45.MsgWithdrawValidatorCommissionResponse;
                toJSON(message: _45.MsgWithdrawValidatorCommissionResponse): import("../json-safe.js").JsonSafe<_45.MsgWithdrawValidatorCommissionResponse>;
                fromPartial(object: Partial<_45.MsgWithdrawValidatorCommissionResponse>): _45.MsgWithdrawValidatorCommissionResponse;
                fromProtoMsg(message: _45.MsgWithdrawValidatorCommissionResponseProtoMsg): _45.MsgWithdrawValidatorCommissionResponse;
                toProto(message: _45.MsgWithdrawValidatorCommissionResponse): Uint8Array;
                toProtoMsg(message: _45.MsgWithdrawValidatorCommissionResponse): _45.MsgWithdrawValidatorCommissionResponseProtoMsg;
            };
            MsgFundCommunityPool: {
                typeUrl: string;
                encode(message: _45.MsgFundCommunityPool, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgFundCommunityPool;
                fromJSON(object: any): _45.MsgFundCommunityPool;
                toJSON(message: _45.MsgFundCommunityPool): import("../json-safe.js").JsonSafe<_45.MsgFundCommunityPool>;
                fromPartial(object: Partial<_45.MsgFundCommunityPool>): _45.MsgFundCommunityPool;
                fromProtoMsg(message: _45.MsgFundCommunityPoolProtoMsg): _45.MsgFundCommunityPool;
                toProto(message: _45.MsgFundCommunityPool): Uint8Array;
                toProtoMsg(message: _45.MsgFundCommunityPool): _45.MsgFundCommunityPoolProtoMsg;
            };
            MsgFundCommunityPoolResponse: {
                typeUrl: string;
                encode(_: _45.MsgFundCommunityPoolResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _45.MsgFundCommunityPoolResponse;
                fromJSON(_: any): _45.MsgFundCommunityPoolResponse;
                toJSON(_: _45.MsgFundCommunityPoolResponse): import("../json-safe.js").JsonSafe<_45.MsgFundCommunityPoolResponse>;
                fromPartial(_: Partial<_45.MsgFundCommunityPoolResponse>): _45.MsgFundCommunityPoolResponse;
                fromProtoMsg(message: _45.MsgFundCommunityPoolResponseProtoMsg): _45.MsgFundCommunityPoolResponse;
                toProto(message: _45.MsgFundCommunityPoolResponse): Uint8Array;
                toProtoMsg(message: _45.MsgFundCommunityPoolResponse): _45.MsgFundCommunityPoolResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(_: _44.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryParamsRequest;
                fromJSON(_: any): _44.QueryParamsRequest;
                toJSON(_: _44.QueryParamsRequest): import("../json-safe.js").JsonSafe<_44.QueryParamsRequest>;
                fromPartial(_: Partial<_44.QueryParamsRequest>): _44.QueryParamsRequest;
                fromProtoMsg(message: _44.QueryParamsRequestProtoMsg): _44.QueryParamsRequest;
                toProto(message: _44.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _44.QueryParamsRequest): _44.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _44.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryParamsResponse;
                fromJSON(object: any): _44.QueryParamsResponse;
                toJSON(message: _44.QueryParamsResponse): import("../json-safe.js").JsonSafe<_44.QueryParamsResponse>;
                fromPartial(object: Partial<_44.QueryParamsResponse>): _44.QueryParamsResponse;
                fromProtoMsg(message: _44.QueryParamsResponseProtoMsg): _44.QueryParamsResponse;
                toProto(message: _44.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _44.QueryParamsResponse): _44.QueryParamsResponseProtoMsg;
            };
            QueryValidatorOutstandingRewardsRequest: {
                typeUrl: string;
                encode(message: _44.QueryValidatorOutstandingRewardsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorOutstandingRewardsRequest;
                fromJSON(object: any): _44.QueryValidatorOutstandingRewardsRequest;
                toJSON(message: _44.QueryValidatorOutstandingRewardsRequest): import("../json-safe.js").JsonSafe<_44.QueryValidatorOutstandingRewardsRequest>;
                fromPartial(object: Partial<_44.QueryValidatorOutstandingRewardsRequest>): _44.QueryValidatorOutstandingRewardsRequest;
                fromProtoMsg(message: _44.QueryValidatorOutstandingRewardsRequestProtoMsg): _44.QueryValidatorOutstandingRewardsRequest;
                toProto(message: _44.QueryValidatorOutstandingRewardsRequest): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorOutstandingRewardsRequest): _44.QueryValidatorOutstandingRewardsRequestProtoMsg;
            };
            QueryValidatorOutstandingRewardsResponse: {
                typeUrl: string;
                encode(message: _44.QueryValidatorOutstandingRewardsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorOutstandingRewardsResponse;
                fromJSON(object: any): _44.QueryValidatorOutstandingRewardsResponse;
                toJSON(message: _44.QueryValidatorOutstandingRewardsResponse): import("../json-safe.js").JsonSafe<_44.QueryValidatorOutstandingRewardsResponse>;
                fromPartial(object: Partial<_44.QueryValidatorOutstandingRewardsResponse>): _44.QueryValidatorOutstandingRewardsResponse;
                fromProtoMsg(message: _44.QueryValidatorOutstandingRewardsResponseProtoMsg): _44.QueryValidatorOutstandingRewardsResponse;
                toProto(message: _44.QueryValidatorOutstandingRewardsResponse): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorOutstandingRewardsResponse): _44.QueryValidatorOutstandingRewardsResponseProtoMsg;
            };
            QueryValidatorCommissionRequest: {
                typeUrl: string;
                encode(message: _44.QueryValidatorCommissionRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorCommissionRequest;
                fromJSON(object: any): _44.QueryValidatorCommissionRequest;
                toJSON(message: _44.QueryValidatorCommissionRequest): import("../json-safe.js").JsonSafe<_44.QueryValidatorCommissionRequest>;
                fromPartial(object: Partial<_44.QueryValidatorCommissionRequest>): _44.QueryValidatorCommissionRequest;
                fromProtoMsg(message: _44.QueryValidatorCommissionRequestProtoMsg): _44.QueryValidatorCommissionRequest;
                toProto(message: _44.QueryValidatorCommissionRequest): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorCommissionRequest): _44.QueryValidatorCommissionRequestProtoMsg;
            };
            QueryValidatorCommissionResponse: {
                typeUrl: string;
                encode(message: _44.QueryValidatorCommissionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorCommissionResponse;
                fromJSON(object: any): _44.QueryValidatorCommissionResponse;
                toJSON(message: _44.QueryValidatorCommissionResponse): import("../json-safe.js").JsonSafe<_44.QueryValidatorCommissionResponse>;
                fromPartial(object: Partial<_44.QueryValidatorCommissionResponse>): _44.QueryValidatorCommissionResponse;
                fromProtoMsg(message: _44.QueryValidatorCommissionResponseProtoMsg): _44.QueryValidatorCommissionResponse;
                toProto(message: _44.QueryValidatorCommissionResponse): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorCommissionResponse): _44.QueryValidatorCommissionResponseProtoMsg;
            };
            QueryValidatorSlashesRequest: {
                typeUrl: string;
                encode(message: _44.QueryValidatorSlashesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorSlashesRequest;
                fromJSON(object: any): _44.QueryValidatorSlashesRequest;
                toJSON(message: _44.QueryValidatorSlashesRequest): import("../json-safe.js").JsonSafe<_44.QueryValidatorSlashesRequest>;
                fromPartial(object: Partial<_44.QueryValidatorSlashesRequest>): _44.QueryValidatorSlashesRequest;
                fromProtoMsg(message: _44.QueryValidatorSlashesRequestProtoMsg): _44.QueryValidatorSlashesRequest;
                toProto(message: _44.QueryValidatorSlashesRequest): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorSlashesRequest): _44.QueryValidatorSlashesRequestProtoMsg;
            };
            QueryValidatorSlashesResponse: {
                typeUrl: string;
                encode(message: _44.QueryValidatorSlashesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryValidatorSlashesResponse;
                fromJSON(object: any): _44.QueryValidatorSlashesResponse;
                toJSON(message: _44.QueryValidatorSlashesResponse): import("../json-safe.js").JsonSafe<_44.QueryValidatorSlashesResponse>;
                fromPartial(object: Partial<_44.QueryValidatorSlashesResponse>): _44.QueryValidatorSlashesResponse;
                fromProtoMsg(message: _44.QueryValidatorSlashesResponseProtoMsg): _44.QueryValidatorSlashesResponse;
                toProto(message: _44.QueryValidatorSlashesResponse): Uint8Array;
                toProtoMsg(message: _44.QueryValidatorSlashesResponse): _44.QueryValidatorSlashesResponseProtoMsg;
            };
            QueryDelegationRewardsRequest: {
                typeUrl: string;
                encode(message: _44.QueryDelegationRewardsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegationRewardsRequest;
                fromJSON(object: any): _44.QueryDelegationRewardsRequest;
                toJSON(message: _44.QueryDelegationRewardsRequest): import("../json-safe.js").JsonSafe<_44.QueryDelegationRewardsRequest>;
                fromPartial(object: Partial<_44.QueryDelegationRewardsRequest>): _44.QueryDelegationRewardsRequest;
                fromProtoMsg(message: _44.QueryDelegationRewardsRequestProtoMsg): _44.QueryDelegationRewardsRequest;
                toProto(message: _44.QueryDelegationRewardsRequest): Uint8Array;
                toProtoMsg(message: _44.QueryDelegationRewardsRequest): _44.QueryDelegationRewardsRequestProtoMsg;
            };
            QueryDelegationRewardsResponse: {
                typeUrl: string;
                encode(message: _44.QueryDelegationRewardsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegationRewardsResponse;
                fromJSON(object: any): _44.QueryDelegationRewardsResponse;
                toJSON(message: _44.QueryDelegationRewardsResponse): import("../json-safe.js").JsonSafe<_44.QueryDelegationRewardsResponse>;
                fromPartial(object: Partial<_44.QueryDelegationRewardsResponse>): _44.QueryDelegationRewardsResponse;
                fromProtoMsg(message: _44.QueryDelegationRewardsResponseProtoMsg): _44.QueryDelegationRewardsResponse;
                toProto(message: _44.QueryDelegationRewardsResponse): Uint8Array;
                toProtoMsg(message: _44.QueryDelegationRewardsResponse): _44.QueryDelegationRewardsResponseProtoMsg;
            };
            QueryDelegationTotalRewardsRequest: {
                typeUrl: string;
                encode(message: _44.QueryDelegationTotalRewardsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegationTotalRewardsRequest;
                fromJSON(object: any): _44.QueryDelegationTotalRewardsRequest;
                toJSON(message: _44.QueryDelegationTotalRewardsRequest): import("../json-safe.js").JsonSafe<_44.QueryDelegationTotalRewardsRequest>;
                fromPartial(object: Partial<_44.QueryDelegationTotalRewardsRequest>): _44.QueryDelegationTotalRewardsRequest;
                fromProtoMsg(message: _44.QueryDelegationTotalRewardsRequestProtoMsg): _44.QueryDelegationTotalRewardsRequest;
                toProto(message: _44.QueryDelegationTotalRewardsRequest): Uint8Array;
                toProtoMsg(message: _44.QueryDelegationTotalRewardsRequest): _44.QueryDelegationTotalRewardsRequestProtoMsg;
            };
            QueryDelegationTotalRewardsResponse: {
                typeUrl: string;
                encode(message: _44.QueryDelegationTotalRewardsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegationTotalRewardsResponse;
                fromJSON(object: any): _44.QueryDelegationTotalRewardsResponse;
                toJSON(message: _44.QueryDelegationTotalRewardsResponse): import("../json-safe.js").JsonSafe<_44.QueryDelegationTotalRewardsResponse>;
                fromPartial(object: Partial<_44.QueryDelegationTotalRewardsResponse>): _44.QueryDelegationTotalRewardsResponse;
                fromProtoMsg(message: _44.QueryDelegationTotalRewardsResponseProtoMsg): _44.QueryDelegationTotalRewardsResponse;
                toProto(message: _44.QueryDelegationTotalRewardsResponse): Uint8Array;
                toProtoMsg(message: _44.QueryDelegationTotalRewardsResponse): _44.QueryDelegationTotalRewardsResponseProtoMsg;
            };
            QueryDelegatorValidatorsRequest: {
                typeUrl: string;
                encode(message: _44.QueryDelegatorValidatorsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegatorValidatorsRequest;
                fromJSON(object: any): _44.QueryDelegatorValidatorsRequest;
                toJSON(message: _44.QueryDelegatorValidatorsRequest): import("../json-safe.js").JsonSafe<_44.QueryDelegatorValidatorsRequest>;
                fromPartial(object: Partial<_44.QueryDelegatorValidatorsRequest>): _44.QueryDelegatorValidatorsRequest;
                fromProtoMsg(message: _44.QueryDelegatorValidatorsRequestProtoMsg): _44.QueryDelegatorValidatorsRequest;
                toProto(message: _44.QueryDelegatorValidatorsRequest): Uint8Array;
                toProtoMsg(message: _44.QueryDelegatorValidatorsRequest): _44.QueryDelegatorValidatorsRequestProtoMsg;
            };
            QueryDelegatorValidatorsResponse: {
                typeUrl: string;
                encode(message: _44.QueryDelegatorValidatorsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegatorValidatorsResponse;
                fromJSON(object: any): _44.QueryDelegatorValidatorsResponse;
                toJSON(message: _44.QueryDelegatorValidatorsResponse): import("../json-safe.js").JsonSafe<_44.QueryDelegatorValidatorsResponse>;
                fromPartial(object: Partial<_44.QueryDelegatorValidatorsResponse>): _44.QueryDelegatorValidatorsResponse;
                fromProtoMsg(message: _44.QueryDelegatorValidatorsResponseProtoMsg): _44.QueryDelegatorValidatorsResponse;
                toProto(message: _44.QueryDelegatorValidatorsResponse): Uint8Array;
                toProtoMsg(message: _44.QueryDelegatorValidatorsResponse): _44.QueryDelegatorValidatorsResponseProtoMsg;
            };
            QueryDelegatorWithdrawAddressRequest: {
                typeUrl: string;
                encode(message: _44.QueryDelegatorWithdrawAddressRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegatorWithdrawAddressRequest;
                fromJSON(object: any): _44.QueryDelegatorWithdrawAddressRequest;
                toJSON(message: _44.QueryDelegatorWithdrawAddressRequest): import("../json-safe.js").JsonSafe<_44.QueryDelegatorWithdrawAddressRequest>;
                fromPartial(object: Partial<_44.QueryDelegatorWithdrawAddressRequest>): _44.QueryDelegatorWithdrawAddressRequest;
                fromProtoMsg(message: _44.QueryDelegatorWithdrawAddressRequestProtoMsg): _44.QueryDelegatorWithdrawAddressRequest;
                toProto(message: _44.QueryDelegatorWithdrawAddressRequest): Uint8Array;
                toProtoMsg(message: _44.QueryDelegatorWithdrawAddressRequest): _44.QueryDelegatorWithdrawAddressRequestProtoMsg;
            };
            QueryDelegatorWithdrawAddressResponse: {
                typeUrl: string;
                encode(message: _44.QueryDelegatorWithdrawAddressResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryDelegatorWithdrawAddressResponse;
                fromJSON(object: any): _44.QueryDelegatorWithdrawAddressResponse;
                toJSON(message: _44.QueryDelegatorWithdrawAddressResponse): import("../json-safe.js").JsonSafe<_44.QueryDelegatorWithdrawAddressResponse>;
                fromPartial(object: Partial<_44.QueryDelegatorWithdrawAddressResponse>): _44.QueryDelegatorWithdrawAddressResponse;
                fromProtoMsg(message: _44.QueryDelegatorWithdrawAddressResponseProtoMsg): _44.QueryDelegatorWithdrawAddressResponse;
                toProto(message: _44.QueryDelegatorWithdrawAddressResponse): Uint8Array;
                toProtoMsg(message: _44.QueryDelegatorWithdrawAddressResponse): _44.QueryDelegatorWithdrawAddressResponseProtoMsg;
            };
            QueryCommunityPoolRequest: {
                typeUrl: string;
                encode(_: _44.QueryCommunityPoolRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryCommunityPoolRequest;
                fromJSON(_: any): _44.QueryCommunityPoolRequest;
                toJSON(_: _44.QueryCommunityPoolRequest): import("../json-safe.js").JsonSafe<_44.QueryCommunityPoolRequest>;
                fromPartial(_: Partial<_44.QueryCommunityPoolRequest>): _44.QueryCommunityPoolRequest;
                fromProtoMsg(message: _44.QueryCommunityPoolRequestProtoMsg): _44.QueryCommunityPoolRequest;
                toProto(message: _44.QueryCommunityPoolRequest): Uint8Array;
                toProtoMsg(message: _44.QueryCommunityPoolRequest): _44.QueryCommunityPoolRequestProtoMsg;
            };
            QueryCommunityPoolResponse: {
                typeUrl: string;
                encode(message: _44.QueryCommunityPoolResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _44.QueryCommunityPoolResponse;
                fromJSON(object: any): _44.QueryCommunityPoolResponse;
                toJSON(message: _44.QueryCommunityPoolResponse): import("../json-safe.js").JsonSafe<_44.QueryCommunityPoolResponse>;
                fromPartial(object: Partial<_44.QueryCommunityPoolResponse>): _44.QueryCommunityPoolResponse;
                fromProtoMsg(message: _44.QueryCommunityPoolResponseProtoMsg): _44.QueryCommunityPoolResponse;
                toProto(message: _44.QueryCommunityPoolResponse): Uint8Array;
                toProtoMsg(message: _44.QueryCommunityPoolResponse): _44.QueryCommunityPoolResponseProtoMsg;
            };
            DelegatorWithdrawInfo: {
                typeUrl: string;
                encode(message: _43.DelegatorWithdrawInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.DelegatorWithdrawInfo;
                fromJSON(object: any): _43.DelegatorWithdrawInfo;
                toJSON(message: _43.DelegatorWithdrawInfo): import("../json-safe.js").JsonSafe<_43.DelegatorWithdrawInfo>;
                fromPartial(object: Partial<_43.DelegatorWithdrawInfo>): _43.DelegatorWithdrawInfo;
                fromProtoMsg(message: _43.DelegatorWithdrawInfoProtoMsg): _43.DelegatorWithdrawInfo;
                toProto(message: _43.DelegatorWithdrawInfo): Uint8Array;
                toProtoMsg(message: _43.DelegatorWithdrawInfo): _43.DelegatorWithdrawInfoProtoMsg;
            };
            ValidatorOutstandingRewardsRecord: {
                typeUrl: string;
                encode(message: _43.ValidatorOutstandingRewardsRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.ValidatorOutstandingRewardsRecord;
                fromJSON(object: any): _43.ValidatorOutstandingRewardsRecord;
                toJSON(message: _43.ValidatorOutstandingRewardsRecord): import("../json-safe.js").JsonSafe<_43.ValidatorOutstandingRewardsRecord>;
                fromPartial(object: Partial<_43.ValidatorOutstandingRewardsRecord>): _43.ValidatorOutstandingRewardsRecord;
                fromProtoMsg(message: _43.ValidatorOutstandingRewardsRecordProtoMsg): _43.ValidatorOutstandingRewardsRecord;
                toProto(message: _43.ValidatorOutstandingRewardsRecord): Uint8Array;
                toProtoMsg(message: _43.ValidatorOutstandingRewardsRecord): _43.ValidatorOutstandingRewardsRecordProtoMsg;
            };
            ValidatorAccumulatedCommissionRecord: {
                typeUrl: string;
                encode(message: _43.ValidatorAccumulatedCommissionRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.ValidatorAccumulatedCommissionRecord;
                fromJSON(object: any): _43.ValidatorAccumulatedCommissionRecord;
                toJSON(message: _43.ValidatorAccumulatedCommissionRecord): import("../json-safe.js").JsonSafe<_43.ValidatorAccumulatedCommissionRecord>;
                fromPartial(object: Partial<_43.ValidatorAccumulatedCommissionRecord>): _43.ValidatorAccumulatedCommissionRecord;
                fromProtoMsg(message: _43.ValidatorAccumulatedCommissionRecordProtoMsg): _43.ValidatorAccumulatedCommissionRecord;
                toProto(message: _43.ValidatorAccumulatedCommissionRecord): Uint8Array;
                toProtoMsg(message: _43.ValidatorAccumulatedCommissionRecord): _43.ValidatorAccumulatedCommissionRecordProtoMsg;
            };
            ValidatorHistoricalRewardsRecord: {
                typeUrl: string;
                encode(message: _43.ValidatorHistoricalRewardsRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.ValidatorHistoricalRewardsRecord;
                fromJSON(object: any): _43.ValidatorHistoricalRewardsRecord;
                toJSON(message: _43.ValidatorHistoricalRewardsRecord): import("../json-safe.js").JsonSafe<_43.ValidatorHistoricalRewardsRecord>;
                fromPartial(object: Partial<_43.ValidatorHistoricalRewardsRecord>): _43.ValidatorHistoricalRewardsRecord;
                fromProtoMsg(message: _43.ValidatorHistoricalRewardsRecordProtoMsg): _43.ValidatorHistoricalRewardsRecord;
                toProto(message: _43.ValidatorHistoricalRewardsRecord): Uint8Array;
                toProtoMsg(message: _43.ValidatorHistoricalRewardsRecord): _43.ValidatorHistoricalRewardsRecordProtoMsg;
            };
            ValidatorCurrentRewardsRecord: {
                typeUrl: string;
                encode(message: _43.ValidatorCurrentRewardsRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.ValidatorCurrentRewardsRecord;
                fromJSON(object: any): _43.ValidatorCurrentRewardsRecord;
                toJSON(message: _43.ValidatorCurrentRewardsRecord): import("../json-safe.js").JsonSafe<_43.ValidatorCurrentRewardsRecord>;
                fromPartial(object: Partial<_43.ValidatorCurrentRewardsRecord>): _43.ValidatorCurrentRewardsRecord;
                fromProtoMsg(message: _43.ValidatorCurrentRewardsRecordProtoMsg): _43.ValidatorCurrentRewardsRecord;
                toProto(message: _43.ValidatorCurrentRewardsRecord): Uint8Array;
                toProtoMsg(message: _43.ValidatorCurrentRewardsRecord): _43.ValidatorCurrentRewardsRecordProtoMsg;
            };
            DelegatorStartingInfoRecord: {
                typeUrl: string;
                encode(message: _43.DelegatorStartingInfoRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.DelegatorStartingInfoRecord;
                fromJSON(object: any): _43.DelegatorStartingInfoRecord;
                toJSON(message: _43.DelegatorStartingInfoRecord): import("../json-safe.js").JsonSafe<_43.DelegatorStartingInfoRecord>;
                fromPartial(object: Partial<_43.DelegatorStartingInfoRecord>): _43.DelegatorStartingInfoRecord;
                fromProtoMsg(message: _43.DelegatorStartingInfoRecordProtoMsg): _43.DelegatorStartingInfoRecord;
                toProto(message: _43.DelegatorStartingInfoRecord): Uint8Array;
                toProtoMsg(message: _43.DelegatorStartingInfoRecord): _43.DelegatorStartingInfoRecordProtoMsg;
            };
            ValidatorSlashEventRecord: {
                typeUrl: string;
                encode(message: _43.ValidatorSlashEventRecord, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.ValidatorSlashEventRecord;
                fromJSON(object: any): _43.ValidatorSlashEventRecord;
                toJSON(message: _43.ValidatorSlashEventRecord): import("../json-safe.js").JsonSafe<_43.ValidatorSlashEventRecord>;
                fromPartial(object: Partial<_43.ValidatorSlashEventRecord>): _43.ValidatorSlashEventRecord;
                fromProtoMsg(message: _43.ValidatorSlashEventRecordProtoMsg): _43.ValidatorSlashEventRecord;
                toProto(message: _43.ValidatorSlashEventRecord): Uint8Array;
                toProtoMsg(message: _43.ValidatorSlashEventRecord): _43.ValidatorSlashEventRecordProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _43.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _43.GenesisState;
                fromJSON(object: any): _43.GenesisState;
                toJSON(message: _43.GenesisState): import("../json-safe.js").JsonSafe<_43.GenesisState>;
                fromPartial(object: Partial<_43.GenesisState>): _43.GenesisState;
                fromProtoMsg(message: _43.GenesisStateProtoMsg): _43.GenesisState;
                toProto(message: _43.GenesisState): Uint8Array;
                toProtoMsg(message: _43.GenesisState): _43.GenesisStateProtoMsg;
            };
            Params: {
                typeUrl: string;
                encode(message: _42.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.Params;
                fromJSON(object: any): _42.Params;
                toJSON(message: _42.Params): import("../json-safe.js").JsonSafe<_42.Params>;
                fromPartial(object: Partial<_42.Params>): _42.Params;
                fromProtoMsg(message: _42.ParamsProtoMsg): _42.Params;
                toProto(message: _42.Params): Uint8Array;
                toProtoMsg(message: _42.Params): _42.ParamsProtoMsg;
            };
            ValidatorHistoricalRewards: {
                typeUrl: string;
                encode(message: _42.ValidatorHistoricalRewards, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorHistoricalRewards;
                fromJSON(object: any): _42.ValidatorHistoricalRewards;
                toJSON(message: _42.ValidatorHistoricalRewards): import("../json-safe.js").JsonSafe<_42.ValidatorHistoricalRewards>;
                fromPartial(object: Partial<_42.ValidatorHistoricalRewards>): _42.ValidatorHistoricalRewards;
                fromProtoMsg(message: _42.ValidatorHistoricalRewardsProtoMsg): _42.ValidatorHistoricalRewards;
                toProto(message: _42.ValidatorHistoricalRewards): Uint8Array;
                toProtoMsg(message: _42.ValidatorHistoricalRewards): _42.ValidatorHistoricalRewardsProtoMsg;
            };
            ValidatorCurrentRewards: {
                typeUrl: string;
                encode(message: _42.ValidatorCurrentRewards, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorCurrentRewards;
                fromJSON(object: any): _42.ValidatorCurrentRewards;
                toJSON(message: _42.ValidatorCurrentRewards): import("../json-safe.js").JsonSafe<_42.ValidatorCurrentRewards>;
                fromPartial(object: Partial<_42.ValidatorCurrentRewards>): _42.ValidatorCurrentRewards;
                fromProtoMsg(message: _42.ValidatorCurrentRewardsProtoMsg): _42.ValidatorCurrentRewards;
                toProto(message: _42.ValidatorCurrentRewards): Uint8Array;
                toProtoMsg(message: _42.ValidatorCurrentRewards): _42.ValidatorCurrentRewardsProtoMsg;
            };
            ValidatorAccumulatedCommission: {
                typeUrl: string;
                encode(message: _42.ValidatorAccumulatedCommission, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorAccumulatedCommission;
                fromJSON(object: any): _42.ValidatorAccumulatedCommission;
                toJSON(message: _42.ValidatorAccumulatedCommission): import("../json-safe.js").JsonSafe<_42.ValidatorAccumulatedCommission>;
                fromPartial(object: Partial<_42.ValidatorAccumulatedCommission>): _42.ValidatorAccumulatedCommission;
                fromProtoMsg(message: _42.ValidatorAccumulatedCommissionProtoMsg): _42.ValidatorAccumulatedCommission;
                toProto(message: _42.ValidatorAccumulatedCommission): Uint8Array;
                toProtoMsg(message: _42.ValidatorAccumulatedCommission): _42.ValidatorAccumulatedCommissionProtoMsg;
            };
            ValidatorOutstandingRewards: {
                typeUrl: string;
                encode(message: _42.ValidatorOutstandingRewards, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorOutstandingRewards;
                fromJSON(object: any): _42.ValidatorOutstandingRewards;
                toJSON(message: _42.ValidatorOutstandingRewards): import("../json-safe.js").JsonSafe<_42.ValidatorOutstandingRewards>;
                fromPartial(object: Partial<_42.ValidatorOutstandingRewards>): _42.ValidatorOutstandingRewards;
                fromProtoMsg(message: _42.ValidatorOutstandingRewardsProtoMsg): _42.ValidatorOutstandingRewards;
                toProto(message: _42.ValidatorOutstandingRewards): Uint8Array;
                toProtoMsg(message: _42.ValidatorOutstandingRewards): _42.ValidatorOutstandingRewardsProtoMsg;
            };
            ValidatorSlashEvent: {
                typeUrl: string;
                encode(message: _42.ValidatorSlashEvent, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorSlashEvent;
                fromJSON(object: any): _42.ValidatorSlashEvent;
                toJSON(message: _42.ValidatorSlashEvent): import("../json-safe.js").JsonSafe<_42.ValidatorSlashEvent>;
                fromPartial(object: Partial<_42.ValidatorSlashEvent>): _42.ValidatorSlashEvent;
                fromProtoMsg(message: _42.ValidatorSlashEventProtoMsg): _42.ValidatorSlashEvent;
                toProto(message: _42.ValidatorSlashEvent): Uint8Array;
                toProtoMsg(message: _42.ValidatorSlashEvent): _42.ValidatorSlashEventProtoMsg;
            };
            ValidatorSlashEvents: {
                typeUrl: string;
                encode(message: _42.ValidatorSlashEvents, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.ValidatorSlashEvents;
                fromJSON(object: any): _42.ValidatorSlashEvents;
                toJSON(message: _42.ValidatorSlashEvents): import("../json-safe.js").JsonSafe<_42.ValidatorSlashEvents>;
                fromPartial(object: Partial<_42.ValidatorSlashEvents>): _42.ValidatorSlashEvents;
                fromProtoMsg(message: _42.ValidatorSlashEventsProtoMsg): _42.ValidatorSlashEvents;
                toProto(message: _42.ValidatorSlashEvents): Uint8Array;
                toProtoMsg(message: _42.ValidatorSlashEvents): _42.ValidatorSlashEventsProtoMsg;
            };
            FeePool: {
                typeUrl: string;
                encode(message: _42.FeePool, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.FeePool;
                fromJSON(object: any): _42.FeePool;
                toJSON(message: _42.FeePool): import("../json-safe.js").JsonSafe<_42.FeePool>;
                fromPartial(object: Partial<_42.FeePool>): _42.FeePool;
                fromProtoMsg(message: _42.FeePoolProtoMsg): _42.FeePool;
                toProto(message: _42.FeePool): Uint8Array;
                toProtoMsg(message: _42.FeePool): _42.FeePoolProtoMsg;
            };
            CommunityPoolSpendProposal: {
                typeUrl: string;
                encode(message: _42.CommunityPoolSpendProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.CommunityPoolSpendProposal;
                fromJSON(object: any): _42.CommunityPoolSpendProposal;
                toJSON(message: _42.CommunityPoolSpendProposal): import("../json-safe.js").JsonSafe<_42.CommunityPoolSpendProposal>;
                fromPartial(object: Partial<_42.CommunityPoolSpendProposal>): _42.CommunityPoolSpendProposal;
                fromProtoMsg(message: _42.CommunityPoolSpendProposalProtoMsg): _42.CommunityPoolSpendProposal;
                toProto(message: _42.CommunityPoolSpendProposal): Uint8Array;
                toProtoMsg(message: _42.CommunityPoolSpendProposal): _42.CommunityPoolSpendProposalProtoMsg;
            };
            DelegatorStartingInfo: {
                typeUrl: string;
                encode(message: _42.DelegatorStartingInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.DelegatorStartingInfo;
                fromJSON(object: any): _42.DelegatorStartingInfo;
                toJSON(message: _42.DelegatorStartingInfo): import("../json-safe.js").JsonSafe<_42.DelegatorStartingInfo>;
                fromPartial(object: Partial<_42.DelegatorStartingInfo>): _42.DelegatorStartingInfo;
                fromProtoMsg(message: _42.DelegatorStartingInfoProtoMsg): _42.DelegatorStartingInfo;
                toProto(message: _42.DelegatorStartingInfo): Uint8Array;
                toProtoMsg(message: _42.DelegatorStartingInfo): _42.DelegatorStartingInfoProtoMsg;
            };
            DelegationDelegatorReward: {
                typeUrl: string;
                encode(message: _42.DelegationDelegatorReward, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.DelegationDelegatorReward;
                fromJSON(object: any): _42.DelegationDelegatorReward;
                toJSON(message: _42.DelegationDelegatorReward): import("../json-safe.js").JsonSafe<_42.DelegationDelegatorReward>;
                fromPartial(object: Partial<_42.DelegationDelegatorReward>): _42.DelegationDelegatorReward;
                fromProtoMsg(message: _42.DelegationDelegatorRewardProtoMsg): _42.DelegationDelegatorReward;
                toProto(message: _42.DelegationDelegatorReward): Uint8Array;
                toProtoMsg(message: _42.DelegationDelegatorReward): _42.DelegationDelegatorRewardProtoMsg;
            };
            CommunityPoolSpendProposalWithDeposit: {
                typeUrl: string;
                encode(message: _42.CommunityPoolSpendProposalWithDeposit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _42.CommunityPoolSpendProposalWithDeposit;
                fromJSON(object: any): _42.CommunityPoolSpendProposalWithDeposit;
                toJSON(message: _42.CommunityPoolSpendProposalWithDeposit): import("../json-safe.js").JsonSafe<_42.CommunityPoolSpendProposalWithDeposit>;
                fromPartial(object: Partial<_42.CommunityPoolSpendProposalWithDeposit>): _42.CommunityPoolSpendProposalWithDeposit;
                fromProtoMsg(message: _42.CommunityPoolSpendProposalWithDepositProtoMsg): _42.CommunityPoolSpendProposalWithDeposit;
                toProto(message: _42.CommunityPoolSpendProposalWithDeposit): Uint8Array;
                toProtoMsg(message: _42.CommunityPoolSpendProposalWithDeposit): _42.CommunityPoolSpendProposalWithDepositProtoMsg;
            };
        };
    }
    namespace feegrant {
        const v1beta1: {
            MsgGrantAllowance: {
                typeUrl: string;
                encode(message: _49.MsgGrantAllowance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _49.MsgGrantAllowance;
                fromJSON(object: any): _49.MsgGrantAllowance;
                toJSON(message: _49.MsgGrantAllowance): import("../json-safe.js").JsonSafe<_49.MsgGrantAllowance>;
                fromPartial(object: Partial<_49.MsgGrantAllowance>): _49.MsgGrantAllowance;
                fromProtoMsg(message: _49.MsgGrantAllowanceProtoMsg): _49.MsgGrantAllowance;
                toProto(message: _49.MsgGrantAllowance): Uint8Array;
                toProtoMsg(message: _49.MsgGrantAllowance): _49.MsgGrantAllowanceProtoMsg;
            };
            MsgGrantAllowanceResponse: {
                typeUrl: string;
                encode(_: _49.MsgGrantAllowanceResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _49.MsgGrantAllowanceResponse;
                fromJSON(_: any): _49.MsgGrantAllowanceResponse;
                toJSON(_: _49.MsgGrantAllowanceResponse): import("../json-safe.js").JsonSafe<_49.MsgGrantAllowanceResponse>;
                fromPartial(_: Partial<_49.MsgGrantAllowanceResponse>): _49.MsgGrantAllowanceResponse;
                fromProtoMsg(message: _49.MsgGrantAllowanceResponseProtoMsg): _49.MsgGrantAllowanceResponse;
                toProto(message: _49.MsgGrantAllowanceResponse): Uint8Array;
                toProtoMsg(message: _49.MsgGrantAllowanceResponse): _49.MsgGrantAllowanceResponseProtoMsg;
            };
            MsgRevokeAllowance: {
                typeUrl: string;
                encode(message: _49.MsgRevokeAllowance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _49.MsgRevokeAllowance;
                fromJSON(object: any): _49.MsgRevokeAllowance;
                toJSON(message: _49.MsgRevokeAllowance): import("../json-safe.js").JsonSafe<_49.MsgRevokeAllowance>;
                fromPartial(object: Partial<_49.MsgRevokeAllowance>): _49.MsgRevokeAllowance;
                fromProtoMsg(message: _49.MsgRevokeAllowanceProtoMsg): _49.MsgRevokeAllowance;
                toProto(message: _49.MsgRevokeAllowance): Uint8Array;
                toProtoMsg(message: _49.MsgRevokeAllowance): _49.MsgRevokeAllowanceProtoMsg;
            };
            MsgRevokeAllowanceResponse: {
                typeUrl: string;
                encode(_: _49.MsgRevokeAllowanceResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _49.MsgRevokeAllowanceResponse;
                fromJSON(_: any): _49.MsgRevokeAllowanceResponse;
                toJSON(_: _49.MsgRevokeAllowanceResponse): import("../json-safe.js").JsonSafe<_49.MsgRevokeAllowanceResponse>;
                fromPartial(_: Partial<_49.MsgRevokeAllowanceResponse>): _49.MsgRevokeAllowanceResponse;
                fromProtoMsg(message: _49.MsgRevokeAllowanceResponseProtoMsg): _49.MsgRevokeAllowanceResponse;
                toProto(message: _49.MsgRevokeAllowanceResponse): Uint8Array;
                toProtoMsg(message: _49.MsgRevokeAllowanceResponse): _49.MsgRevokeAllowanceResponseProtoMsg;
            };
            FeeAllowanceI_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _46.BasicAllowance | _46.PeriodicAllowance | _46.AllowedMsgAllowance | import("../google/protobuf/any.js").Any;
            QueryAllowanceRequest: {
                typeUrl: string;
                encode(message: _48.QueryAllowanceRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowanceRequest;
                fromJSON(object: any): _48.QueryAllowanceRequest;
                toJSON(message: _48.QueryAllowanceRequest): import("../json-safe.js").JsonSafe<_48.QueryAllowanceRequest>;
                fromPartial(object: Partial<_48.QueryAllowanceRequest>): _48.QueryAllowanceRequest;
                fromProtoMsg(message: _48.QueryAllowanceRequestProtoMsg): _48.QueryAllowanceRequest;
                toProto(message: _48.QueryAllowanceRequest): Uint8Array;
                toProtoMsg(message: _48.QueryAllowanceRequest): _48.QueryAllowanceRequestProtoMsg;
            };
            QueryAllowanceResponse: {
                typeUrl: string;
                encode(message: _48.QueryAllowanceResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowanceResponse;
                fromJSON(object: any): _48.QueryAllowanceResponse;
                toJSON(message: _48.QueryAllowanceResponse): import("../json-safe.js").JsonSafe<_48.QueryAllowanceResponse>;
                fromPartial(object: Partial<_48.QueryAllowanceResponse>): _48.QueryAllowanceResponse;
                fromProtoMsg(message: _48.QueryAllowanceResponseProtoMsg): _48.QueryAllowanceResponse;
                toProto(message: _48.QueryAllowanceResponse): Uint8Array;
                toProtoMsg(message: _48.QueryAllowanceResponse): _48.QueryAllowanceResponseProtoMsg;
            };
            QueryAllowancesRequest: {
                typeUrl: string;
                encode(message: _48.QueryAllowancesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowancesRequest;
                fromJSON(object: any): _48.QueryAllowancesRequest;
                toJSON(message: _48.QueryAllowancesRequest): import("../json-safe.js").JsonSafe<_48.QueryAllowancesRequest>;
                fromPartial(object: Partial<_48.QueryAllowancesRequest>): _48.QueryAllowancesRequest;
                fromProtoMsg(message: _48.QueryAllowancesRequestProtoMsg): _48.QueryAllowancesRequest;
                toProto(message: _48.QueryAllowancesRequest): Uint8Array;
                toProtoMsg(message: _48.QueryAllowancesRequest): _48.QueryAllowancesRequestProtoMsg;
            };
            QueryAllowancesResponse: {
                typeUrl: string;
                encode(message: _48.QueryAllowancesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowancesResponse;
                fromJSON(object: any): _48.QueryAllowancesResponse;
                toJSON(message: _48.QueryAllowancesResponse): import("../json-safe.js").JsonSafe<_48.QueryAllowancesResponse>;
                fromPartial(object: Partial<_48.QueryAllowancesResponse>): _48.QueryAllowancesResponse;
                fromProtoMsg(message: _48.QueryAllowancesResponseProtoMsg): _48.QueryAllowancesResponse;
                toProto(message: _48.QueryAllowancesResponse): Uint8Array;
                toProtoMsg(message: _48.QueryAllowancesResponse): _48.QueryAllowancesResponseProtoMsg;
            };
            QueryAllowancesByGranterRequest: {
                typeUrl: string;
                encode(message: _48.QueryAllowancesByGranterRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowancesByGranterRequest;
                fromJSON(object: any): _48.QueryAllowancesByGranterRequest;
                toJSON(message: _48.QueryAllowancesByGranterRequest): import("../json-safe.js").JsonSafe<_48.QueryAllowancesByGranterRequest>;
                fromPartial(object: Partial<_48.QueryAllowancesByGranterRequest>): _48.QueryAllowancesByGranterRequest;
                fromProtoMsg(message: _48.QueryAllowancesByGranterRequestProtoMsg): _48.QueryAllowancesByGranterRequest;
                toProto(message: _48.QueryAllowancesByGranterRequest): Uint8Array;
                toProtoMsg(message: _48.QueryAllowancesByGranterRequest): _48.QueryAllowancesByGranterRequestProtoMsg;
            };
            QueryAllowancesByGranterResponse: {
                typeUrl: string;
                encode(message: _48.QueryAllowancesByGranterResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _48.QueryAllowancesByGranterResponse;
                fromJSON(object: any): _48.QueryAllowancesByGranterResponse;
                toJSON(message: _48.QueryAllowancesByGranterResponse): import("../json-safe.js").JsonSafe<_48.QueryAllowancesByGranterResponse>;
                fromPartial(object: Partial<_48.QueryAllowancesByGranterResponse>): _48.QueryAllowancesByGranterResponse;
                fromProtoMsg(message: _48.QueryAllowancesByGranterResponseProtoMsg): _48.QueryAllowancesByGranterResponse;
                toProto(message: _48.QueryAllowancesByGranterResponse): Uint8Array;
                toProtoMsg(message: _48.QueryAllowancesByGranterResponse): _48.QueryAllowancesByGranterResponseProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _47.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _47.GenesisState;
                fromJSON(object: any): _47.GenesisState;
                toJSON(message: _47.GenesisState): import("../json-safe.js").JsonSafe<_47.GenesisState>;
                fromPartial(object: Partial<_47.GenesisState>): _47.GenesisState;
                fromProtoMsg(message: _47.GenesisStateProtoMsg): _47.GenesisState;
                toProto(message: _47.GenesisState): Uint8Array;
                toProtoMsg(message: _47.GenesisState): _47.GenesisStateProtoMsg;
            };
            BasicAllowance: {
                typeUrl: string;
                encode(message: _46.BasicAllowance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _46.BasicAllowance;
                fromJSON(object: any): _46.BasicAllowance;
                toJSON(message: _46.BasicAllowance): import("../json-safe.js").JsonSafe<_46.BasicAllowance>;
                fromPartial(object: Partial<_46.BasicAllowance>): _46.BasicAllowance;
                fromProtoMsg(message: _46.BasicAllowanceProtoMsg): _46.BasicAllowance;
                toProto(message: _46.BasicAllowance): Uint8Array;
                toProtoMsg(message: _46.BasicAllowance): _46.BasicAllowanceProtoMsg;
            };
            PeriodicAllowance: {
                typeUrl: string;
                encode(message: _46.PeriodicAllowance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _46.PeriodicAllowance;
                fromJSON(object: any): _46.PeriodicAllowance;
                toJSON(message: _46.PeriodicAllowance): import("../json-safe.js").JsonSafe<_46.PeriodicAllowance>;
                fromPartial(object: Partial<_46.PeriodicAllowance>): _46.PeriodicAllowance;
                fromProtoMsg(message: _46.PeriodicAllowanceProtoMsg): _46.PeriodicAllowance;
                toProto(message: _46.PeriodicAllowance): Uint8Array;
                toProtoMsg(message: _46.PeriodicAllowance): _46.PeriodicAllowanceProtoMsg;
            };
            AllowedMsgAllowance: {
                typeUrl: string;
                encode(message: _46.AllowedMsgAllowance, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _46.AllowedMsgAllowance;
                fromJSON(object: any): _46.AllowedMsgAllowance;
                toJSON(message: _46.AllowedMsgAllowance): import("../json-safe.js").JsonSafe<_46.AllowedMsgAllowance>;
                fromPartial(object: Partial<_46.AllowedMsgAllowance>): _46.AllowedMsgAllowance;
                fromProtoMsg(message: _46.AllowedMsgAllowanceProtoMsg): _46.AllowedMsgAllowance;
                toProto(message: _46.AllowedMsgAllowance): Uint8Array;
                toProtoMsg(message: _46.AllowedMsgAllowance): _46.AllowedMsgAllowanceProtoMsg;
            };
            Grant: {
                typeUrl: string;
                encode(message: _46.Grant, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _46.Grant;
                fromJSON(object: any): _46.Grant;
                toJSON(message: _46.Grant): import("../json-safe.js").JsonSafe<_46.Grant>;
                fromPartial(object: Partial<_46.Grant>): _46.Grant;
                fromProtoMsg(message: _46.GrantProtoMsg): _46.Grant;
                toProto(message: _46.Grant): Uint8Array;
                toProtoMsg(message: _46.Grant): _46.GrantProtoMsg;
            };
        };
    }
    namespace gov {
        const v1: {
            MsgSubmitProposal: {
                typeUrl: string;
                encode(message: _53.MsgSubmitProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgSubmitProposal;
                fromJSON(object: any): _53.MsgSubmitProposal;
                toJSON(message: _53.MsgSubmitProposal): import("../json-safe.js").JsonSafe<_53.MsgSubmitProposal>;
                fromPartial(object: Partial<_53.MsgSubmitProposal>): _53.MsgSubmitProposal;
                fromProtoMsg(message: _53.MsgSubmitProposalProtoMsg): _53.MsgSubmitProposal;
                toProto(message: _53.MsgSubmitProposal): Uint8Array;
                toProtoMsg(message: _53.MsgSubmitProposal): _53.MsgSubmitProposalProtoMsg;
            };
            MsgSubmitProposalResponse: {
                typeUrl: string;
                encode(message: _53.MsgSubmitProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgSubmitProposalResponse;
                fromJSON(object: any): _53.MsgSubmitProposalResponse;
                toJSON(message: _53.MsgSubmitProposalResponse): import("../json-safe.js").JsonSafe<_53.MsgSubmitProposalResponse>;
                fromPartial(object: Partial<_53.MsgSubmitProposalResponse>): _53.MsgSubmitProposalResponse;
                fromProtoMsg(message: _53.MsgSubmitProposalResponseProtoMsg): _53.MsgSubmitProposalResponse;
                toProto(message: _53.MsgSubmitProposalResponse): Uint8Array;
                toProtoMsg(message: _53.MsgSubmitProposalResponse): _53.MsgSubmitProposalResponseProtoMsg;
            };
            MsgExecLegacyContent: {
                typeUrl: string;
                encode(message: _53.MsgExecLegacyContent, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgExecLegacyContent;
                fromJSON(object: any): _53.MsgExecLegacyContent;
                toJSON(message: _53.MsgExecLegacyContent): import("../json-safe.js").JsonSafe<_53.MsgExecLegacyContent>;
                fromPartial(object: Partial<_53.MsgExecLegacyContent>): _53.MsgExecLegacyContent;
                fromProtoMsg(message: _53.MsgExecLegacyContentProtoMsg): _53.MsgExecLegacyContent;
                toProto(message: _53.MsgExecLegacyContent): Uint8Array;
                toProtoMsg(message: _53.MsgExecLegacyContent): _53.MsgExecLegacyContentProtoMsg;
            };
            MsgExecLegacyContentResponse: {
                typeUrl: string;
                encode(_: _53.MsgExecLegacyContentResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgExecLegacyContentResponse;
                fromJSON(_: any): _53.MsgExecLegacyContentResponse;
                toJSON(_: _53.MsgExecLegacyContentResponse): import("../json-safe.js").JsonSafe<_53.MsgExecLegacyContentResponse>;
                fromPartial(_: Partial<_53.MsgExecLegacyContentResponse>): _53.MsgExecLegacyContentResponse;
                fromProtoMsg(message: _53.MsgExecLegacyContentResponseProtoMsg): _53.MsgExecLegacyContentResponse;
                toProto(message: _53.MsgExecLegacyContentResponse): Uint8Array;
                toProtoMsg(message: _53.MsgExecLegacyContentResponse): _53.MsgExecLegacyContentResponseProtoMsg;
            };
            MsgVote: {
                typeUrl: string;
                encode(message: _53.MsgVote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgVote;
                fromJSON(object: any): _53.MsgVote;
                toJSON(message: _53.MsgVote): import("../json-safe.js").JsonSafe<_53.MsgVote>;
                fromPartial(object: Partial<_53.MsgVote>): _53.MsgVote;
                fromProtoMsg(message: _53.MsgVoteProtoMsg): _53.MsgVote;
                toProto(message: _53.MsgVote): Uint8Array;
                toProtoMsg(message: _53.MsgVote): _53.MsgVoteProtoMsg;
            };
            MsgVoteResponse: {
                typeUrl: string;
                encode(_: _53.MsgVoteResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgVoteResponse;
                fromJSON(_: any): _53.MsgVoteResponse;
                toJSON(_: _53.MsgVoteResponse): import("../json-safe.js").JsonSafe<_53.MsgVoteResponse>;
                fromPartial(_: Partial<_53.MsgVoteResponse>): _53.MsgVoteResponse;
                fromProtoMsg(message: _53.MsgVoteResponseProtoMsg): _53.MsgVoteResponse;
                toProto(message: _53.MsgVoteResponse): Uint8Array;
                toProtoMsg(message: _53.MsgVoteResponse): _53.MsgVoteResponseProtoMsg;
            };
            MsgVoteWeighted: {
                typeUrl: string;
                encode(message: _53.MsgVoteWeighted, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgVoteWeighted;
                fromJSON(object: any): _53.MsgVoteWeighted;
                toJSON(message: _53.MsgVoteWeighted): import("../json-safe.js").JsonSafe<_53.MsgVoteWeighted>;
                fromPartial(object: Partial<_53.MsgVoteWeighted>): _53.MsgVoteWeighted;
                fromProtoMsg(message: _53.MsgVoteWeightedProtoMsg): _53.MsgVoteWeighted;
                toProto(message: _53.MsgVoteWeighted): Uint8Array;
                toProtoMsg(message: _53.MsgVoteWeighted): _53.MsgVoteWeightedProtoMsg;
            };
            MsgVoteWeightedResponse: {
                typeUrl: string;
                encode(_: _53.MsgVoteWeightedResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgVoteWeightedResponse;
                fromJSON(_: any): _53.MsgVoteWeightedResponse;
                toJSON(_: _53.MsgVoteWeightedResponse): import("../json-safe.js").JsonSafe<_53.MsgVoteWeightedResponse>;
                fromPartial(_: Partial<_53.MsgVoteWeightedResponse>): _53.MsgVoteWeightedResponse;
                fromProtoMsg(message: _53.MsgVoteWeightedResponseProtoMsg): _53.MsgVoteWeightedResponse;
                toProto(message: _53.MsgVoteWeightedResponse): Uint8Array;
                toProtoMsg(message: _53.MsgVoteWeightedResponse): _53.MsgVoteWeightedResponseProtoMsg;
            };
            MsgDeposit: {
                typeUrl: string;
                encode(message: _53.MsgDeposit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgDeposit;
                fromJSON(object: any): _53.MsgDeposit;
                toJSON(message: _53.MsgDeposit): import("../json-safe.js").JsonSafe<_53.MsgDeposit>;
                fromPartial(object: Partial<_53.MsgDeposit>): _53.MsgDeposit;
                fromProtoMsg(message: _53.MsgDepositProtoMsg): _53.MsgDeposit;
                toProto(message: _53.MsgDeposit): Uint8Array;
                toProtoMsg(message: _53.MsgDeposit): _53.MsgDepositProtoMsg;
            };
            MsgDepositResponse: {
                typeUrl: string;
                encode(_: _53.MsgDepositResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _53.MsgDepositResponse;
                fromJSON(_: any): _53.MsgDepositResponse;
                toJSON(_: _53.MsgDepositResponse): import("../json-safe.js").JsonSafe<_53.MsgDepositResponse>;
                fromPartial(_: Partial<_53.MsgDepositResponse>): _53.MsgDepositResponse;
                fromProtoMsg(message: _53.MsgDepositResponseProtoMsg): _53.MsgDepositResponse;
                toProto(message: _53.MsgDepositResponse): Uint8Array;
                toProtoMsg(message: _53.MsgDepositResponse): _53.MsgDepositResponseProtoMsg;
            };
            Content_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _55.TextProposal | import("../google/protobuf/any.js").Any;
            QueryProposalRequest: {
                typeUrl: string;
                encode(message: _52.QueryProposalRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryProposalRequest;
                fromJSON(object: any): _52.QueryProposalRequest;
                toJSON(message: _52.QueryProposalRequest): import("../json-safe.js").JsonSafe<_52.QueryProposalRequest>;
                fromPartial(object: Partial<_52.QueryProposalRequest>): _52.QueryProposalRequest;
                fromProtoMsg(message: _52.QueryProposalRequestProtoMsg): _52.QueryProposalRequest;
                toProto(message: _52.QueryProposalRequest): Uint8Array;
                toProtoMsg(message: _52.QueryProposalRequest): _52.QueryProposalRequestProtoMsg;
            };
            QueryProposalResponse: {
                typeUrl: string;
                encode(message: _52.QueryProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryProposalResponse;
                fromJSON(object: any): _52.QueryProposalResponse;
                toJSON(message: _52.QueryProposalResponse): import("../json-safe.js").JsonSafe<_52.QueryProposalResponse>;
                fromPartial(object: Partial<_52.QueryProposalResponse>): _52.QueryProposalResponse;
                fromProtoMsg(message: _52.QueryProposalResponseProtoMsg): _52.QueryProposalResponse;
                toProto(message: _52.QueryProposalResponse): Uint8Array;
                toProtoMsg(message: _52.QueryProposalResponse): _52.QueryProposalResponseProtoMsg;
            };
            QueryProposalsRequest: {
                typeUrl: string;
                encode(message: _52.QueryProposalsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryProposalsRequest;
                fromJSON(object: any): _52.QueryProposalsRequest;
                toJSON(message: _52.QueryProposalsRequest): import("../json-safe.js").JsonSafe<_52.QueryProposalsRequest>;
                fromPartial(object: Partial<_52.QueryProposalsRequest>): _52.QueryProposalsRequest;
                fromProtoMsg(message: _52.QueryProposalsRequestProtoMsg): _52.QueryProposalsRequest;
                toProto(message: _52.QueryProposalsRequest): Uint8Array;
                toProtoMsg(message: _52.QueryProposalsRequest): _52.QueryProposalsRequestProtoMsg;
            };
            QueryProposalsResponse: {
                typeUrl: string;
                encode(message: _52.QueryProposalsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryProposalsResponse;
                fromJSON(object: any): _52.QueryProposalsResponse;
                toJSON(message: _52.QueryProposalsResponse): import("../json-safe.js").JsonSafe<_52.QueryProposalsResponse>;
                fromPartial(object: Partial<_52.QueryProposalsResponse>): _52.QueryProposalsResponse;
                fromProtoMsg(message: _52.QueryProposalsResponseProtoMsg): _52.QueryProposalsResponse;
                toProto(message: _52.QueryProposalsResponse): Uint8Array;
                toProtoMsg(message: _52.QueryProposalsResponse): _52.QueryProposalsResponseProtoMsg;
            };
            QueryVoteRequest: {
                typeUrl: string;
                encode(message: _52.QueryVoteRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryVoteRequest;
                fromJSON(object: any): _52.QueryVoteRequest;
                toJSON(message: _52.QueryVoteRequest): import("../json-safe.js").JsonSafe<_52.QueryVoteRequest>;
                fromPartial(object: Partial<_52.QueryVoteRequest>): _52.QueryVoteRequest;
                fromProtoMsg(message: _52.QueryVoteRequestProtoMsg): _52.QueryVoteRequest;
                toProto(message: _52.QueryVoteRequest): Uint8Array;
                toProtoMsg(message: _52.QueryVoteRequest): _52.QueryVoteRequestProtoMsg;
            };
            QueryVoteResponse: {
                typeUrl: string;
                encode(message: _52.QueryVoteResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryVoteResponse;
                fromJSON(object: any): _52.QueryVoteResponse;
                toJSON(message: _52.QueryVoteResponse): import("../json-safe.js").JsonSafe<_52.QueryVoteResponse>;
                fromPartial(object: Partial<_52.QueryVoteResponse>): _52.QueryVoteResponse;
                fromProtoMsg(message: _52.QueryVoteResponseProtoMsg): _52.QueryVoteResponse;
                toProto(message: _52.QueryVoteResponse): Uint8Array;
                toProtoMsg(message: _52.QueryVoteResponse): _52.QueryVoteResponseProtoMsg;
            };
            QueryVotesRequest: {
                typeUrl: string;
                encode(message: _52.QueryVotesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryVotesRequest;
                fromJSON(object: any): _52.QueryVotesRequest;
                toJSON(message: _52.QueryVotesRequest): import("../json-safe.js").JsonSafe<_52.QueryVotesRequest>;
                fromPartial(object: Partial<_52.QueryVotesRequest>): _52.QueryVotesRequest;
                fromProtoMsg(message: _52.QueryVotesRequestProtoMsg): _52.QueryVotesRequest;
                toProto(message: _52.QueryVotesRequest): Uint8Array;
                toProtoMsg(message: _52.QueryVotesRequest): _52.QueryVotesRequestProtoMsg;
            };
            QueryVotesResponse: {
                typeUrl: string;
                encode(message: _52.QueryVotesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryVotesResponse;
                fromJSON(object: any): _52.QueryVotesResponse;
                toJSON(message: _52.QueryVotesResponse): import("../json-safe.js").JsonSafe<_52.QueryVotesResponse>;
                fromPartial(object: Partial<_52.QueryVotesResponse>): _52.QueryVotesResponse;
                fromProtoMsg(message: _52.QueryVotesResponseProtoMsg): _52.QueryVotesResponse;
                toProto(message: _52.QueryVotesResponse): Uint8Array;
                toProtoMsg(message: _52.QueryVotesResponse): _52.QueryVotesResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(message: _52.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryParamsRequest;
                fromJSON(object: any): _52.QueryParamsRequest;
                toJSON(message: _52.QueryParamsRequest): import("../json-safe.js").JsonSafe<_52.QueryParamsRequest>;
                fromPartial(object: Partial<_52.QueryParamsRequest>): _52.QueryParamsRequest;
                fromProtoMsg(message: _52.QueryParamsRequestProtoMsg): _52.QueryParamsRequest;
                toProto(message: _52.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _52.QueryParamsRequest): _52.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _52.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryParamsResponse;
                fromJSON(object: any): _52.QueryParamsResponse;
                toJSON(message: _52.QueryParamsResponse): import("../json-safe.js").JsonSafe<_52.QueryParamsResponse>;
                fromPartial(object: Partial<_52.QueryParamsResponse>): _52.QueryParamsResponse;
                fromProtoMsg(message: _52.QueryParamsResponseProtoMsg): _52.QueryParamsResponse;
                toProto(message: _52.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _52.QueryParamsResponse): _52.QueryParamsResponseProtoMsg;
            };
            QueryDepositRequest: {
                typeUrl: string;
                encode(message: _52.QueryDepositRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryDepositRequest;
                fromJSON(object: any): _52.QueryDepositRequest;
                toJSON(message: _52.QueryDepositRequest): import("../json-safe.js").JsonSafe<_52.QueryDepositRequest>;
                fromPartial(object: Partial<_52.QueryDepositRequest>): _52.QueryDepositRequest;
                fromProtoMsg(message: _52.QueryDepositRequestProtoMsg): _52.QueryDepositRequest;
                toProto(message: _52.QueryDepositRequest): Uint8Array;
                toProtoMsg(message: _52.QueryDepositRequest): _52.QueryDepositRequestProtoMsg;
            };
            QueryDepositResponse: {
                typeUrl: string;
                encode(message: _52.QueryDepositResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryDepositResponse;
                fromJSON(object: any): _52.QueryDepositResponse;
                toJSON(message: _52.QueryDepositResponse): import("../json-safe.js").JsonSafe<_52.QueryDepositResponse>;
                fromPartial(object: Partial<_52.QueryDepositResponse>): _52.QueryDepositResponse;
                fromProtoMsg(message: _52.QueryDepositResponseProtoMsg): _52.QueryDepositResponse;
                toProto(message: _52.QueryDepositResponse): Uint8Array;
                toProtoMsg(message: _52.QueryDepositResponse): _52.QueryDepositResponseProtoMsg;
            };
            QueryDepositsRequest: {
                typeUrl: string;
                encode(message: _52.QueryDepositsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryDepositsRequest;
                fromJSON(object: any): _52.QueryDepositsRequest;
                toJSON(message: _52.QueryDepositsRequest): import("../json-safe.js").JsonSafe<_52.QueryDepositsRequest>;
                fromPartial(object: Partial<_52.QueryDepositsRequest>): _52.QueryDepositsRequest;
                fromProtoMsg(message: _52.QueryDepositsRequestProtoMsg): _52.QueryDepositsRequest;
                toProto(message: _52.QueryDepositsRequest): Uint8Array;
                toProtoMsg(message: _52.QueryDepositsRequest): _52.QueryDepositsRequestProtoMsg;
            };
            QueryDepositsResponse: {
                typeUrl: string;
                encode(message: _52.QueryDepositsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryDepositsResponse;
                fromJSON(object: any): _52.QueryDepositsResponse;
                toJSON(message: _52.QueryDepositsResponse): import("../json-safe.js").JsonSafe<_52.QueryDepositsResponse>;
                fromPartial(object: Partial<_52.QueryDepositsResponse>): _52.QueryDepositsResponse;
                fromProtoMsg(message: _52.QueryDepositsResponseProtoMsg): _52.QueryDepositsResponse;
                toProto(message: _52.QueryDepositsResponse): Uint8Array;
                toProtoMsg(message: _52.QueryDepositsResponse): _52.QueryDepositsResponseProtoMsg;
            };
            QueryTallyResultRequest: {
                typeUrl: string;
                encode(message: _52.QueryTallyResultRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryTallyResultRequest;
                fromJSON(object: any): _52.QueryTallyResultRequest;
                toJSON(message: _52.QueryTallyResultRequest): import("../json-safe.js").JsonSafe<_52.QueryTallyResultRequest>;
                fromPartial(object: Partial<_52.QueryTallyResultRequest>): _52.QueryTallyResultRequest;
                fromProtoMsg(message: _52.QueryTallyResultRequestProtoMsg): _52.QueryTallyResultRequest;
                toProto(message: _52.QueryTallyResultRequest): Uint8Array;
                toProtoMsg(message: _52.QueryTallyResultRequest): _52.QueryTallyResultRequestProtoMsg;
            };
            QueryTallyResultResponse: {
                typeUrl: string;
                encode(message: _52.QueryTallyResultResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _52.QueryTallyResultResponse;
                fromJSON(object: any): _52.QueryTallyResultResponse;
                toJSON(message: _52.QueryTallyResultResponse): import("../json-safe.js").JsonSafe<_52.QueryTallyResultResponse>;
                fromPartial(object: Partial<_52.QueryTallyResultResponse>): _52.QueryTallyResultResponse;
                fromProtoMsg(message: _52.QueryTallyResultResponseProtoMsg): _52.QueryTallyResultResponse;
                toProto(message: _52.QueryTallyResultResponse): Uint8Array;
                toProtoMsg(message: _52.QueryTallyResultResponse): _52.QueryTallyResultResponseProtoMsg;
            };
            voteOptionFromJSON(object: any): _51.VoteOption;
            voteOptionToJSON(object: _51.VoteOption): string;
            proposalStatusFromJSON(object: any): _51.ProposalStatus;
            proposalStatusToJSON(object: _51.ProposalStatus): string;
            VoteOption: typeof _51.VoteOption;
            VoteOptionSDKType: typeof _51.VoteOption;
            ProposalStatus: typeof _51.ProposalStatus;
            ProposalStatusSDKType: typeof _51.ProposalStatus;
            WeightedVoteOption: {
                typeUrl: string;
                encode(message: _51.WeightedVoteOption, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.WeightedVoteOption;
                fromJSON(object: any): _51.WeightedVoteOption;
                toJSON(message: _51.WeightedVoteOption): import("../json-safe.js").JsonSafe<_51.WeightedVoteOption>;
                fromPartial(object: Partial<_51.WeightedVoteOption>): _51.WeightedVoteOption;
                fromProtoMsg(message: _51.WeightedVoteOptionProtoMsg): _51.WeightedVoteOption;
                toProto(message: _51.WeightedVoteOption): Uint8Array;
                toProtoMsg(message: _51.WeightedVoteOption): _51.WeightedVoteOptionProtoMsg;
            };
            Deposit: {
                typeUrl: string;
                encode(message: _51.Deposit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.Deposit;
                fromJSON(object: any): _51.Deposit;
                toJSON(message: _51.Deposit): import("../json-safe.js").JsonSafe<_51.Deposit>;
                fromPartial(object: Partial<_51.Deposit>): _51.Deposit;
                fromProtoMsg(message: _51.DepositProtoMsg): _51.Deposit;
                toProto(message: _51.Deposit): Uint8Array;
                toProtoMsg(message: _51.Deposit): _51.DepositProtoMsg;
            };
            Proposal: {
                typeUrl: string;
                encode(message: _51.Proposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.Proposal;
                fromJSON(object: any): _51.Proposal;
                toJSON(message: _51.Proposal): import("../json-safe.js").JsonSafe<_51.Proposal>;
                fromPartial(object: Partial<_51.Proposal>): _51.Proposal;
                fromProtoMsg(message: _51.ProposalProtoMsg): _51.Proposal;
                toProto(message: _51.Proposal): Uint8Array;
                toProtoMsg(message: _51.Proposal): _51.ProposalProtoMsg;
            };
            TallyResult: {
                typeUrl: string;
                encode(message: _51.TallyResult, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.TallyResult;
                fromJSON(object: any): _51.TallyResult;
                toJSON(message: _51.TallyResult): import("../json-safe.js").JsonSafe<_51.TallyResult>;
                fromPartial(object: Partial<_51.TallyResult>): _51.TallyResult;
                fromProtoMsg(message: _51.TallyResultProtoMsg): _51.TallyResult;
                toProto(message: _51.TallyResult): Uint8Array;
                toProtoMsg(message: _51.TallyResult): _51.TallyResultProtoMsg;
            };
            Vote: {
                typeUrl: string;
                encode(message: _51.Vote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.Vote;
                fromJSON(object: any): _51.Vote;
                toJSON(message: _51.Vote): import("../json-safe.js").JsonSafe<_51.Vote>;
                fromPartial(object: Partial<_51.Vote>): _51.Vote;
                fromProtoMsg(message: _51.VoteProtoMsg): _51.Vote;
                toProto(message: _51.Vote): Uint8Array;
                toProtoMsg(message: _51.Vote): _51.VoteProtoMsg;
            };
            DepositParams: {
                typeUrl: string;
                encode(message: _51.DepositParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.DepositParams;
                fromJSON(object: any): _51.DepositParams;
                toJSON(message: _51.DepositParams): import("../json-safe.js").JsonSafe<_51.DepositParams>;
                fromPartial(object: Partial<_51.DepositParams>): _51.DepositParams;
                fromProtoMsg(message: _51.DepositParamsProtoMsg): _51.DepositParams;
                toProto(message: _51.DepositParams): Uint8Array;
                toProtoMsg(message: _51.DepositParams): _51.DepositParamsProtoMsg;
            };
            VotingParams: {
                typeUrl: string;
                encode(message: _51.VotingParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.VotingParams;
                fromJSON(object: any): _51.VotingParams;
                toJSON(message: _51.VotingParams): import("../json-safe.js").JsonSafe<_51.VotingParams>;
                fromPartial(object: Partial<_51.VotingParams>): _51.VotingParams;
                fromProtoMsg(message: _51.VotingParamsProtoMsg): _51.VotingParams;
                toProto(message: _51.VotingParams): Uint8Array;
                toProtoMsg(message: _51.VotingParams): _51.VotingParamsProtoMsg;
            };
            TallyParams: {
                typeUrl: string;
                encode(message: _51.TallyParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _51.TallyParams;
                fromJSON(object: any): _51.TallyParams;
                toJSON(message: _51.TallyParams): import("../json-safe.js").JsonSafe<_51.TallyParams>;
                fromPartial(object: Partial<_51.TallyParams>): _51.TallyParams;
                fromProtoMsg(message: _51.TallyParamsProtoMsg): _51.TallyParams;
                toProto(message: _51.TallyParams): Uint8Array;
                toProtoMsg(message: _51.TallyParams): _51.TallyParamsProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _50.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _50.GenesisState;
                fromJSON(object: any): _50.GenesisState;
                toJSON(message: _50.GenesisState): import("../json-safe.js").JsonSafe<_50.GenesisState>;
                fromPartial(object: Partial<_50.GenesisState>): _50.GenesisState;
                fromProtoMsg(message: _50.GenesisStateProtoMsg): _50.GenesisState;
                toProto(message: _50.GenesisState): Uint8Array;
                toProtoMsg(message: _50.GenesisState): _50.GenesisStateProtoMsg;
            };
        };
        const v1beta1: {
            MsgSubmitProposal: {
                typeUrl: string;
                encode(message: _57.MsgSubmitProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgSubmitProposal;
                fromJSON(object: any): _57.MsgSubmitProposal;
                toJSON(message: _57.MsgSubmitProposal): import("../json-safe.js").JsonSafe<_57.MsgSubmitProposal>;
                fromPartial(object: Partial<_57.MsgSubmitProposal>): _57.MsgSubmitProposal;
                fromProtoMsg(message: _57.MsgSubmitProposalProtoMsg): _57.MsgSubmitProposal;
                toProto(message: _57.MsgSubmitProposal): Uint8Array;
                toProtoMsg(message: _57.MsgSubmitProposal): _57.MsgSubmitProposalProtoMsg;
            };
            MsgSubmitProposalResponse: {
                typeUrl: string;
                encode(message: _57.MsgSubmitProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgSubmitProposalResponse;
                fromJSON(object: any): _57.MsgSubmitProposalResponse;
                toJSON(message: _57.MsgSubmitProposalResponse): import("../json-safe.js").JsonSafe<_57.MsgSubmitProposalResponse>;
                fromPartial(object: Partial<_57.MsgSubmitProposalResponse>): _57.MsgSubmitProposalResponse;
                fromProtoMsg(message: _57.MsgSubmitProposalResponseProtoMsg): _57.MsgSubmitProposalResponse;
                toProto(message: _57.MsgSubmitProposalResponse): Uint8Array;
                toProtoMsg(message: _57.MsgSubmitProposalResponse): _57.MsgSubmitProposalResponseProtoMsg;
            };
            MsgVote: {
                typeUrl: string;
                encode(message: _57.MsgVote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgVote;
                fromJSON(object: any): _57.MsgVote;
                toJSON(message: _57.MsgVote): import("../json-safe.js").JsonSafe<_57.MsgVote>;
                fromPartial(object: Partial<_57.MsgVote>): _57.MsgVote;
                fromProtoMsg(message: _57.MsgVoteProtoMsg): _57.MsgVote;
                toProto(message: _57.MsgVote): Uint8Array;
                toProtoMsg(message: _57.MsgVote): _57.MsgVoteProtoMsg;
            };
            MsgVoteResponse: {
                typeUrl: string;
                encode(_: _57.MsgVoteResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgVoteResponse;
                fromJSON(_: any): _57.MsgVoteResponse;
                toJSON(_: _57.MsgVoteResponse): import("../json-safe.js").JsonSafe<_57.MsgVoteResponse>;
                fromPartial(_: Partial<_57.MsgVoteResponse>): _57.MsgVoteResponse;
                fromProtoMsg(message: _57.MsgVoteResponseProtoMsg): _57.MsgVoteResponse;
                toProto(message: _57.MsgVoteResponse): Uint8Array;
                toProtoMsg(message: _57.MsgVoteResponse): _57.MsgVoteResponseProtoMsg;
            };
            MsgVoteWeighted: {
                typeUrl: string;
                encode(message: _57.MsgVoteWeighted, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgVoteWeighted;
                fromJSON(object: any): _57.MsgVoteWeighted;
                toJSON(message: _57.MsgVoteWeighted): import("../json-safe.js").JsonSafe<_57.MsgVoteWeighted>;
                fromPartial(object: Partial<_57.MsgVoteWeighted>): _57.MsgVoteWeighted;
                fromProtoMsg(message: _57.MsgVoteWeightedProtoMsg): _57.MsgVoteWeighted;
                toProto(message: _57.MsgVoteWeighted): Uint8Array;
                toProtoMsg(message: _57.MsgVoteWeighted): _57.MsgVoteWeightedProtoMsg;
            };
            MsgVoteWeightedResponse: {
                typeUrl: string;
                encode(_: _57.MsgVoteWeightedResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgVoteWeightedResponse;
                fromJSON(_: any): _57.MsgVoteWeightedResponse;
                toJSON(_: _57.MsgVoteWeightedResponse): import("../json-safe.js").JsonSafe<_57.MsgVoteWeightedResponse>;
                fromPartial(_: Partial<_57.MsgVoteWeightedResponse>): _57.MsgVoteWeightedResponse;
                fromProtoMsg(message: _57.MsgVoteWeightedResponseProtoMsg): _57.MsgVoteWeightedResponse;
                toProto(message: _57.MsgVoteWeightedResponse): Uint8Array;
                toProtoMsg(message: _57.MsgVoteWeightedResponse): _57.MsgVoteWeightedResponseProtoMsg;
            };
            MsgDeposit: {
                typeUrl: string;
                encode(message: _57.MsgDeposit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgDeposit;
                fromJSON(object: any): _57.MsgDeposit;
                toJSON(message: _57.MsgDeposit): import("../json-safe.js").JsonSafe<_57.MsgDeposit>;
                fromPartial(object: Partial<_57.MsgDeposit>): _57.MsgDeposit;
                fromProtoMsg(message: _57.MsgDepositProtoMsg): _57.MsgDeposit;
                toProto(message: _57.MsgDeposit): Uint8Array;
                toProtoMsg(message: _57.MsgDeposit): _57.MsgDepositProtoMsg;
            };
            MsgDepositResponse: {
                typeUrl: string;
                encode(_: _57.MsgDepositResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _57.MsgDepositResponse;
                fromJSON(_: any): _57.MsgDepositResponse;
                toJSON(_: _57.MsgDepositResponse): import("../json-safe.js").JsonSafe<_57.MsgDepositResponse>;
                fromPartial(_: Partial<_57.MsgDepositResponse>): _57.MsgDepositResponse;
                fromProtoMsg(message: _57.MsgDepositResponseProtoMsg): _57.MsgDepositResponse;
                toProto(message: _57.MsgDepositResponse): Uint8Array;
                toProtoMsg(message: _57.MsgDepositResponse): _57.MsgDepositResponseProtoMsg;
            };
            Content_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => _55.TextProposal | import("../google/protobuf/any.js").Any;
            QueryProposalRequest: {
                typeUrl: string;
                encode(message: _56.QueryProposalRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryProposalRequest;
                fromJSON(object: any): _56.QueryProposalRequest;
                toJSON(message: _56.QueryProposalRequest): import("../json-safe.js").JsonSafe<_56.QueryProposalRequest>;
                fromPartial(object: Partial<_56.QueryProposalRequest>): _56.QueryProposalRequest;
                fromProtoMsg(message: _56.QueryProposalRequestProtoMsg): _56.QueryProposalRequest;
                toProto(message: _56.QueryProposalRequest): Uint8Array;
                toProtoMsg(message: _56.QueryProposalRequest): _56.QueryProposalRequestProtoMsg;
            };
            QueryProposalResponse: {
                typeUrl: string;
                encode(message: _56.QueryProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryProposalResponse;
                fromJSON(object: any): _56.QueryProposalResponse;
                toJSON(message: _56.QueryProposalResponse): import("../json-safe.js").JsonSafe<_56.QueryProposalResponse>;
                fromPartial(object: Partial<_56.QueryProposalResponse>): _56.QueryProposalResponse;
                fromProtoMsg(message: _56.QueryProposalResponseProtoMsg): _56.QueryProposalResponse;
                toProto(message: _56.QueryProposalResponse): Uint8Array;
                toProtoMsg(message: _56.QueryProposalResponse): _56.QueryProposalResponseProtoMsg;
            };
            QueryProposalsRequest: {
                typeUrl: string;
                encode(message: _56.QueryProposalsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryProposalsRequest;
                fromJSON(object: any): _56.QueryProposalsRequest;
                toJSON(message: _56.QueryProposalsRequest): import("../json-safe.js").JsonSafe<_56.QueryProposalsRequest>;
                fromPartial(object: Partial<_56.QueryProposalsRequest>): _56.QueryProposalsRequest;
                fromProtoMsg(message: _56.QueryProposalsRequestProtoMsg): _56.QueryProposalsRequest;
                toProto(message: _56.QueryProposalsRequest): Uint8Array;
                toProtoMsg(message: _56.QueryProposalsRequest): _56.QueryProposalsRequestProtoMsg;
            };
            QueryProposalsResponse: {
                typeUrl: string;
                encode(message: _56.QueryProposalsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryProposalsResponse;
                fromJSON(object: any): _56.QueryProposalsResponse;
                toJSON(message: _56.QueryProposalsResponse): import("../json-safe.js").JsonSafe<_56.QueryProposalsResponse>;
                fromPartial(object: Partial<_56.QueryProposalsResponse>): _56.QueryProposalsResponse;
                fromProtoMsg(message: _56.QueryProposalsResponseProtoMsg): _56.QueryProposalsResponse;
                toProto(message: _56.QueryProposalsResponse): Uint8Array;
                toProtoMsg(message: _56.QueryProposalsResponse): _56.QueryProposalsResponseProtoMsg;
            };
            QueryVoteRequest: {
                typeUrl: string;
                encode(message: _56.QueryVoteRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryVoteRequest;
                fromJSON(object: any): _56.QueryVoteRequest;
                toJSON(message: _56.QueryVoteRequest): import("../json-safe.js").JsonSafe<_56.QueryVoteRequest>;
                fromPartial(object: Partial<_56.QueryVoteRequest>): _56.QueryVoteRequest;
                fromProtoMsg(message: _56.QueryVoteRequestProtoMsg): _56.QueryVoteRequest;
                toProto(message: _56.QueryVoteRequest): Uint8Array;
                toProtoMsg(message: _56.QueryVoteRequest): _56.QueryVoteRequestProtoMsg;
            };
            QueryVoteResponse: {
                typeUrl: string;
                encode(message: _56.QueryVoteResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryVoteResponse;
                fromJSON(object: any): _56.QueryVoteResponse;
                toJSON(message: _56.QueryVoteResponse): import("../json-safe.js").JsonSafe<_56.QueryVoteResponse>;
                fromPartial(object: Partial<_56.QueryVoteResponse>): _56.QueryVoteResponse;
                fromProtoMsg(message: _56.QueryVoteResponseProtoMsg): _56.QueryVoteResponse;
                toProto(message: _56.QueryVoteResponse): Uint8Array;
                toProtoMsg(message: _56.QueryVoteResponse): _56.QueryVoteResponseProtoMsg;
            };
            QueryVotesRequest: {
                typeUrl: string;
                encode(message: _56.QueryVotesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryVotesRequest;
                fromJSON(object: any): _56.QueryVotesRequest;
                toJSON(message: _56.QueryVotesRequest): import("../json-safe.js").JsonSafe<_56.QueryVotesRequest>;
                fromPartial(object: Partial<_56.QueryVotesRequest>): _56.QueryVotesRequest;
                fromProtoMsg(message: _56.QueryVotesRequestProtoMsg): _56.QueryVotesRequest;
                toProto(message: _56.QueryVotesRequest): Uint8Array;
                toProtoMsg(message: _56.QueryVotesRequest): _56.QueryVotesRequestProtoMsg;
            };
            QueryVotesResponse: {
                typeUrl: string;
                encode(message: _56.QueryVotesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryVotesResponse;
                fromJSON(object: any): _56.QueryVotesResponse;
                toJSON(message: _56.QueryVotesResponse): import("../json-safe.js").JsonSafe<_56.QueryVotesResponse>;
                fromPartial(object: Partial<_56.QueryVotesResponse>): _56.QueryVotesResponse;
                fromProtoMsg(message: _56.QueryVotesResponseProtoMsg): _56.QueryVotesResponse;
                toProto(message: _56.QueryVotesResponse): Uint8Array;
                toProtoMsg(message: _56.QueryVotesResponse): _56.QueryVotesResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(message: _56.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryParamsRequest;
                fromJSON(object: any): _56.QueryParamsRequest;
                toJSON(message: _56.QueryParamsRequest): import("../json-safe.js").JsonSafe<_56.QueryParamsRequest>;
                fromPartial(object: Partial<_56.QueryParamsRequest>): _56.QueryParamsRequest;
                fromProtoMsg(message: _56.QueryParamsRequestProtoMsg): _56.QueryParamsRequest;
                toProto(message: _56.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _56.QueryParamsRequest): _56.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _56.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryParamsResponse;
                fromJSON(object: any): _56.QueryParamsResponse;
                toJSON(message: _56.QueryParamsResponse): import("../json-safe.js").JsonSafe<_56.QueryParamsResponse>;
                fromPartial(object: Partial<_56.QueryParamsResponse>): _56.QueryParamsResponse;
                fromProtoMsg(message: _56.QueryParamsResponseProtoMsg): _56.QueryParamsResponse;
                toProto(message: _56.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _56.QueryParamsResponse): _56.QueryParamsResponseProtoMsg;
            };
            QueryDepositRequest: {
                typeUrl: string;
                encode(message: _56.QueryDepositRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryDepositRequest;
                fromJSON(object: any): _56.QueryDepositRequest;
                toJSON(message: _56.QueryDepositRequest): import("../json-safe.js").JsonSafe<_56.QueryDepositRequest>;
                fromPartial(object: Partial<_56.QueryDepositRequest>): _56.QueryDepositRequest;
                fromProtoMsg(message: _56.QueryDepositRequestProtoMsg): _56.QueryDepositRequest;
                toProto(message: _56.QueryDepositRequest): Uint8Array;
                toProtoMsg(message: _56.QueryDepositRequest): _56.QueryDepositRequestProtoMsg;
            };
            QueryDepositResponse: {
                typeUrl: string;
                encode(message: _56.QueryDepositResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryDepositResponse;
                fromJSON(object: any): _56.QueryDepositResponse;
                toJSON(message: _56.QueryDepositResponse): import("../json-safe.js").JsonSafe<_56.QueryDepositResponse>;
                fromPartial(object: Partial<_56.QueryDepositResponse>): _56.QueryDepositResponse;
                fromProtoMsg(message: _56.QueryDepositResponseProtoMsg): _56.QueryDepositResponse;
                toProto(message: _56.QueryDepositResponse): Uint8Array;
                toProtoMsg(message: _56.QueryDepositResponse): _56.QueryDepositResponseProtoMsg;
            };
            QueryDepositsRequest: {
                typeUrl: string;
                encode(message: _56.QueryDepositsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryDepositsRequest;
                fromJSON(object: any): _56.QueryDepositsRequest;
                toJSON(message: _56.QueryDepositsRequest): import("../json-safe.js").JsonSafe<_56.QueryDepositsRequest>;
                fromPartial(object: Partial<_56.QueryDepositsRequest>): _56.QueryDepositsRequest;
                fromProtoMsg(message: _56.QueryDepositsRequestProtoMsg): _56.QueryDepositsRequest;
                toProto(message: _56.QueryDepositsRequest): Uint8Array;
                toProtoMsg(message: _56.QueryDepositsRequest): _56.QueryDepositsRequestProtoMsg;
            };
            QueryDepositsResponse: {
                typeUrl: string;
                encode(message: _56.QueryDepositsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryDepositsResponse;
                fromJSON(object: any): _56.QueryDepositsResponse;
                toJSON(message: _56.QueryDepositsResponse): import("../json-safe.js").JsonSafe<_56.QueryDepositsResponse>;
                fromPartial(object: Partial<_56.QueryDepositsResponse>): _56.QueryDepositsResponse;
                fromProtoMsg(message: _56.QueryDepositsResponseProtoMsg): _56.QueryDepositsResponse;
                toProto(message: _56.QueryDepositsResponse): Uint8Array;
                toProtoMsg(message: _56.QueryDepositsResponse): _56.QueryDepositsResponseProtoMsg;
            };
            QueryTallyResultRequest: {
                typeUrl: string;
                encode(message: _56.QueryTallyResultRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryTallyResultRequest;
                fromJSON(object: any): _56.QueryTallyResultRequest;
                toJSON(message: _56.QueryTallyResultRequest): import("../json-safe.js").JsonSafe<_56.QueryTallyResultRequest>;
                fromPartial(object: Partial<_56.QueryTallyResultRequest>): _56.QueryTallyResultRequest;
                fromProtoMsg(message: _56.QueryTallyResultRequestProtoMsg): _56.QueryTallyResultRequest;
                toProto(message: _56.QueryTallyResultRequest): Uint8Array;
                toProtoMsg(message: _56.QueryTallyResultRequest): _56.QueryTallyResultRequestProtoMsg;
            };
            QueryTallyResultResponse: {
                typeUrl: string;
                encode(message: _56.QueryTallyResultResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _56.QueryTallyResultResponse;
                fromJSON(object: any): _56.QueryTallyResultResponse;
                toJSON(message: _56.QueryTallyResultResponse): import("../json-safe.js").JsonSafe<_56.QueryTallyResultResponse>;
                fromPartial(object: Partial<_56.QueryTallyResultResponse>): _56.QueryTallyResultResponse;
                fromProtoMsg(message: _56.QueryTallyResultResponseProtoMsg): _56.QueryTallyResultResponse;
                toProto(message: _56.QueryTallyResultResponse): Uint8Array;
                toProtoMsg(message: _56.QueryTallyResultResponse): _56.QueryTallyResultResponseProtoMsg;
            };
            voteOptionFromJSON(object: any): _55.VoteOption;
            voteOptionToJSON(object: _55.VoteOption): string;
            proposalStatusFromJSON(object: any): _55.ProposalStatus;
            proposalStatusToJSON(object: _55.ProposalStatus): string;
            VoteOption: typeof _55.VoteOption;
            VoteOptionSDKType: typeof _55.VoteOption;
            ProposalStatus: typeof _55.ProposalStatus;
            ProposalStatusSDKType: typeof _55.ProposalStatus;
            WeightedVoteOption: {
                typeUrl: string;
                encode(message: _55.WeightedVoteOption, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.WeightedVoteOption;
                fromJSON(object: any): _55.WeightedVoteOption;
                toJSON(message: _55.WeightedVoteOption): import("../json-safe.js").JsonSafe<_55.WeightedVoteOption>;
                fromPartial(object: Partial<_55.WeightedVoteOption>): _55.WeightedVoteOption;
                fromProtoMsg(message: _55.WeightedVoteOptionProtoMsg): _55.WeightedVoteOption;
                toProto(message: _55.WeightedVoteOption): Uint8Array;
                toProtoMsg(message: _55.WeightedVoteOption): _55.WeightedVoteOptionProtoMsg;
            };
            TextProposal: {
                typeUrl: string;
                encode(message: _55.TextProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.TextProposal;
                fromJSON(object: any): _55.TextProposal;
                toJSON(message: _55.TextProposal): import("../json-safe.js").JsonSafe<_55.TextProposal>;
                fromPartial(object: Partial<_55.TextProposal>): _55.TextProposal;
                fromProtoMsg(message: _55.TextProposalProtoMsg): _55.TextProposal;
                toProto(message: _55.TextProposal): Uint8Array;
                toProtoMsg(message: _55.TextProposal): _55.TextProposalProtoMsg;
            };
            Deposit: {
                typeUrl: string;
                encode(message: _55.Deposit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.Deposit;
                fromJSON(object: any): _55.Deposit;
                toJSON(message: _55.Deposit): import("../json-safe.js").JsonSafe<_55.Deposit>;
                fromPartial(object: Partial<_55.Deposit>): _55.Deposit;
                fromProtoMsg(message: _55.DepositProtoMsg): _55.Deposit;
                toProto(message: _55.Deposit): Uint8Array;
                toProtoMsg(message: _55.Deposit): _55.DepositProtoMsg;
            };
            Proposal: {
                typeUrl: string;
                encode(message: _55.Proposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.Proposal;
                fromJSON(object: any): _55.Proposal;
                toJSON(message: _55.Proposal): import("../json-safe.js").JsonSafe<_55.Proposal>;
                fromPartial(object: Partial<_55.Proposal>): _55.Proposal;
                fromProtoMsg(message: _55.ProposalProtoMsg): _55.Proposal;
                toProto(message: _55.Proposal): Uint8Array;
                toProtoMsg(message: _55.Proposal): _55.ProposalProtoMsg;
            };
            TallyResult: {
                typeUrl: string;
                encode(message: _55.TallyResult, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.TallyResult;
                fromJSON(object: any): _55.TallyResult;
                toJSON(message: _55.TallyResult): import("../json-safe.js").JsonSafe<_55.TallyResult>;
                fromPartial(object: Partial<_55.TallyResult>): _55.TallyResult;
                fromProtoMsg(message: _55.TallyResultProtoMsg): _55.TallyResult;
                toProto(message: _55.TallyResult): Uint8Array;
                toProtoMsg(message: _55.TallyResult): _55.TallyResultProtoMsg;
            };
            Vote: {
                typeUrl: string;
                encode(message: _55.Vote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.Vote;
                fromJSON(object: any): _55.Vote;
                toJSON(message: _55.Vote): import("../json-safe.js").JsonSafe<_55.Vote>;
                fromPartial(object: Partial<_55.Vote>): _55.Vote;
                fromProtoMsg(message: _55.VoteProtoMsg): _55.Vote;
                toProto(message: _55.Vote): Uint8Array;
                toProtoMsg(message: _55.Vote): _55.VoteProtoMsg;
            };
            DepositParams: {
                typeUrl: string;
                encode(message: _55.DepositParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.DepositParams;
                fromJSON(object: any): _55.DepositParams;
                toJSON(message: _55.DepositParams): import("../json-safe.js").JsonSafe<_55.DepositParams>;
                fromPartial(object: Partial<_55.DepositParams>): _55.DepositParams;
                fromProtoMsg(message: _55.DepositParamsProtoMsg): _55.DepositParams;
                toProto(message: _55.DepositParams): Uint8Array;
                toProtoMsg(message: _55.DepositParams): _55.DepositParamsProtoMsg;
            };
            VotingParams: {
                typeUrl: string;
                encode(message: _55.VotingParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.VotingParams;
                fromJSON(object: any): _55.VotingParams;
                toJSON(message: _55.VotingParams): import("../json-safe.js").JsonSafe<_55.VotingParams>;
                fromPartial(object: Partial<_55.VotingParams>): _55.VotingParams;
                fromProtoMsg(message: _55.VotingParamsProtoMsg): _55.VotingParams;
                toProto(message: _55.VotingParams): Uint8Array;
                toProtoMsg(message: _55.VotingParams): _55.VotingParamsProtoMsg;
            };
            TallyParams: {
                typeUrl: string;
                encode(message: _55.TallyParams, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _55.TallyParams;
                fromJSON(object: any): _55.TallyParams;
                toJSON(message: _55.TallyParams): import("../json-safe.js").JsonSafe<_55.TallyParams>;
                fromPartial(object: Partial<_55.TallyParams>): _55.TallyParams;
                fromProtoMsg(message: _55.TallyParamsProtoMsg): _55.TallyParams;
                toProto(message: _55.TallyParams): Uint8Array;
                toProtoMsg(message: _55.TallyParams): _55.TallyParamsProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _54.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _54.GenesisState;
                fromJSON(object: any): _54.GenesisState;
                toJSON(message: _54.GenesisState): import("../json-safe.js").JsonSafe<_54.GenesisState>;
                fromPartial(object: Partial<_54.GenesisState>): _54.GenesisState;
                fromProtoMsg(message: _54.GenesisStateProtoMsg): _54.GenesisState;
                toProto(message: _54.GenesisState): Uint8Array;
                toProtoMsg(message: _54.GenesisState): _54.GenesisStateProtoMsg;
            };
        };
    }
    namespace group {
        const v1: {
            voteOptionFromJSON(object: any): _62.VoteOption;
            voteOptionToJSON(object: _62.VoteOption): string;
            proposalStatusFromJSON(object: any): _62.ProposalStatus;
            proposalStatusToJSON(object: _62.ProposalStatus): string;
            proposalExecutorResultFromJSON(object: any): _62.ProposalExecutorResult;
            proposalExecutorResultToJSON(object: _62.ProposalExecutorResult): string;
            VoteOption: typeof _62.VoteOption;
            VoteOptionSDKType: typeof _62.VoteOption;
            ProposalStatus: typeof _62.ProposalStatus;
            ProposalStatusSDKType: typeof _62.ProposalStatus;
            ProposalExecutorResult: typeof _62.ProposalExecutorResult;
            ProposalExecutorResultSDKType: typeof _62.ProposalExecutorResult;
            Member: {
                typeUrl: string;
                encode(message: _62.Member, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.Member;
                fromJSON(object: any): _62.Member;
                toJSON(message: _62.Member): import("../json-safe.js").JsonSafe<_62.Member>;
                fromPartial(object: Partial<_62.Member>): _62.Member;
                fromProtoMsg(message: _62.MemberProtoMsg): _62.Member;
                toProto(message: _62.Member): Uint8Array;
                toProtoMsg(message: _62.Member): _62.MemberProtoMsg;
            };
            MemberRequest: {
                typeUrl: string;
                encode(message: _62.MemberRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.MemberRequest;
                fromJSON(object: any): _62.MemberRequest;
                toJSON(message: _62.MemberRequest): import("../json-safe.js").JsonSafe<_62.MemberRequest>;
                fromPartial(object: Partial<_62.MemberRequest>): _62.MemberRequest;
                fromProtoMsg(message: _62.MemberRequestProtoMsg): _62.MemberRequest;
                toProto(message: _62.MemberRequest): Uint8Array;
                toProtoMsg(message: _62.MemberRequest): _62.MemberRequestProtoMsg;
            };
            ThresholdDecisionPolicy: {
                typeUrl: string;
                encode(message: _62.ThresholdDecisionPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.ThresholdDecisionPolicy;
                fromJSON(object: any): _62.ThresholdDecisionPolicy;
                toJSON(message: _62.ThresholdDecisionPolicy): import("../json-safe.js").JsonSafe<_62.ThresholdDecisionPolicy>;
                fromPartial(object: Partial<_62.ThresholdDecisionPolicy>): _62.ThresholdDecisionPolicy;
                fromProtoMsg(message: _62.ThresholdDecisionPolicyProtoMsg): _62.ThresholdDecisionPolicy;
                toProto(message: _62.ThresholdDecisionPolicy): Uint8Array;
                toProtoMsg(message: _62.ThresholdDecisionPolicy): _62.ThresholdDecisionPolicyProtoMsg;
            };
            PercentageDecisionPolicy: {
                typeUrl: string;
                encode(message: _62.PercentageDecisionPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.PercentageDecisionPolicy;
                fromJSON(object: any): _62.PercentageDecisionPolicy;
                toJSON(message: _62.PercentageDecisionPolicy): import("../json-safe.js").JsonSafe<_62.PercentageDecisionPolicy>;
                fromPartial(object: Partial<_62.PercentageDecisionPolicy>): _62.PercentageDecisionPolicy;
                fromProtoMsg(message: _62.PercentageDecisionPolicyProtoMsg): _62.PercentageDecisionPolicy;
                toProto(message: _62.PercentageDecisionPolicy): Uint8Array;
                toProtoMsg(message: _62.PercentageDecisionPolicy): _62.PercentageDecisionPolicyProtoMsg;
            };
            DecisionPolicyWindows: {
                typeUrl: string;
                encode(message: _62.DecisionPolicyWindows, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.DecisionPolicyWindows;
                fromJSON(object: any): _62.DecisionPolicyWindows;
                toJSON(message: _62.DecisionPolicyWindows): import("../json-safe.js").JsonSafe<_62.DecisionPolicyWindows>;
                fromPartial(object: Partial<_62.DecisionPolicyWindows>): _62.DecisionPolicyWindows;
                fromProtoMsg(message: _62.DecisionPolicyWindowsProtoMsg): _62.DecisionPolicyWindows;
                toProto(message: _62.DecisionPolicyWindows): Uint8Array;
                toProtoMsg(message: _62.DecisionPolicyWindows): _62.DecisionPolicyWindowsProtoMsg;
            };
            GroupInfo: {
                typeUrl: string;
                encode(message: _62.GroupInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.GroupInfo;
                fromJSON(object: any): _62.GroupInfo;
                toJSON(message: _62.GroupInfo): import("../json-safe.js").JsonSafe<_62.GroupInfo>;
                fromPartial(object: Partial<_62.GroupInfo>): _62.GroupInfo;
                fromProtoMsg(message: _62.GroupInfoProtoMsg): _62.GroupInfo;
                toProto(message: _62.GroupInfo): Uint8Array;
                toProtoMsg(message: _62.GroupInfo): _62.GroupInfoProtoMsg;
            };
            GroupMember: {
                typeUrl: string;
                encode(message: _62.GroupMember, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.GroupMember;
                fromJSON(object: any): _62.GroupMember;
                toJSON(message: _62.GroupMember): import("../json-safe.js").JsonSafe<_62.GroupMember>;
                fromPartial(object: Partial<_62.GroupMember>): _62.GroupMember;
                fromProtoMsg(message: _62.GroupMemberProtoMsg): _62.GroupMember;
                toProto(message: _62.GroupMember): Uint8Array;
                toProtoMsg(message: _62.GroupMember): _62.GroupMemberProtoMsg;
            };
            GroupPolicyInfo: {
                typeUrl: string;
                encode(message: _62.GroupPolicyInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.GroupPolicyInfo;
                fromJSON(object: any): _62.GroupPolicyInfo;
                toJSON(message: _62.GroupPolicyInfo): import("../json-safe.js").JsonSafe<_62.GroupPolicyInfo>;
                fromPartial(object: Partial<_62.GroupPolicyInfo>): _62.GroupPolicyInfo;
                fromProtoMsg(message: _62.GroupPolicyInfoProtoMsg): _62.GroupPolicyInfo;
                toProto(message: _62.GroupPolicyInfo): Uint8Array;
                toProtoMsg(message: _62.GroupPolicyInfo): _62.GroupPolicyInfoProtoMsg;
            };
            Proposal: {
                typeUrl: string;
                encode(message: _62.Proposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.Proposal;
                fromJSON(object: any): _62.Proposal;
                toJSON(message: _62.Proposal): import("../json-safe.js").JsonSafe<_62.Proposal>;
                fromPartial(object: Partial<_62.Proposal>): _62.Proposal;
                fromProtoMsg(message: _62.ProposalProtoMsg): _62.Proposal;
                toProto(message: _62.Proposal): Uint8Array;
                toProtoMsg(message: _62.Proposal): _62.ProposalProtoMsg;
            };
            TallyResult: {
                typeUrl: string;
                encode(message: _62.TallyResult, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.TallyResult;
                fromJSON(object: any): _62.TallyResult;
                toJSON(message: _62.TallyResult): import("../json-safe.js").JsonSafe<_62.TallyResult>;
                fromPartial(object: Partial<_62.TallyResult>): _62.TallyResult;
                fromProtoMsg(message: _62.TallyResultProtoMsg): _62.TallyResult;
                toProto(message: _62.TallyResult): Uint8Array;
                toProtoMsg(message: _62.TallyResult): _62.TallyResultProtoMsg;
            };
            Vote: {
                typeUrl: string;
                encode(message: _62.Vote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _62.Vote;
                fromJSON(object: any): _62.Vote;
                toJSON(message: _62.Vote): import("../json-safe.js").JsonSafe<_62.Vote>;
                fromPartial(object: Partial<_62.Vote>): _62.Vote;
                fromProtoMsg(message: _62.VoteProtoMsg): _62.Vote;
                toProto(message: _62.Vote): Uint8Array;
                toProtoMsg(message: _62.Vote): _62.VoteProtoMsg;
            };
            Cosmos_groupv1DecisionPolicy_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => import("../google/protobuf/any.js").Any;
            execFromJSON(object: any): _61.Exec;
            execToJSON(object: _61.Exec): string;
            Exec: typeof _61.Exec;
            ExecSDKType: typeof _61.Exec;
            MsgCreateGroup: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroup, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroup;
                fromJSON(object: any): _61.MsgCreateGroup;
                toJSON(message: _61.MsgCreateGroup): import("../json-safe.js").JsonSafe<_61.MsgCreateGroup>;
                fromPartial(object: Partial<_61.MsgCreateGroup>): _61.MsgCreateGroup;
                fromProtoMsg(message: _61.MsgCreateGroupProtoMsg): _61.MsgCreateGroup;
                toProto(message: _61.MsgCreateGroup): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroup): _61.MsgCreateGroupProtoMsg;
            };
            MsgCreateGroupResponse: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroupResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroupResponse;
                fromJSON(object: any): _61.MsgCreateGroupResponse;
                toJSON(message: _61.MsgCreateGroupResponse): import("../json-safe.js").JsonSafe<_61.MsgCreateGroupResponse>;
                fromPartial(object: Partial<_61.MsgCreateGroupResponse>): _61.MsgCreateGroupResponse;
                fromProtoMsg(message: _61.MsgCreateGroupResponseProtoMsg): _61.MsgCreateGroupResponse;
                toProto(message: _61.MsgCreateGroupResponse): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroupResponse): _61.MsgCreateGroupResponseProtoMsg;
            };
            MsgUpdateGroupMembers: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupMembers, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupMembers;
                fromJSON(object: any): _61.MsgUpdateGroupMembers;
                toJSON(message: _61.MsgUpdateGroupMembers): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupMembers>;
                fromPartial(object: Partial<_61.MsgUpdateGroupMembers>): _61.MsgUpdateGroupMembers;
                fromProtoMsg(message: _61.MsgUpdateGroupMembersProtoMsg): _61.MsgUpdateGroupMembers;
                toProto(message: _61.MsgUpdateGroupMembers): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupMembers): _61.MsgUpdateGroupMembersProtoMsg;
            };
            MsgUpdateGroupMembersResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupMembersResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupMembersResponse;
                fromJSON(_: any): _61.MsgUpdateGroupMembersResponse;
                toJSON(_: _61.MsgUpdateGroupMembersResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupMembersResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupMembersResponse>): _61.MsgUpdateGroupMembersResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupMembersResponseProtoMsg): _61.MsgUpdateGroupMembersResponse;
                toProto(message: _61.MsgUpdateGroupMembersResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupMembersResponse): _61.MsgUpdateGroupMembersResponseProtoMsg;
            };
            MsgUpdateGroupAdmin: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupAdmin, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupAdmin;
                fromJSON(object: any): _61.MsgUpdateGroupAdmin;
                toJSON(message: _61.MsgUpdateGroupAdmin): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupAdmin>;
                fromPartial(object: Partial<_61.MsgUpdateGroupAdmin>): _61.MsgUpdateGroupAdmin;
                fromProtoMsg(message: _61.MsgUpdateGroupAdminProtoMsg): _61.MsgUpdateGroupAdmin;
                toProto(message: _61.MsgUpdateGroupAdmin): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupAdmin): _61.MsgUpdateGroupAdminProtoMsg;
            };
            MsgUpdateGroupAdminResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupAdminResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupAdminResponse;
                fromJSON(_: any): _61.MsgUpdateGroupAdminResponse;
                toJSON(_: _61.MsgUpdateGroupAdminResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupAdminResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupAdminResponse>): _61.MsgUpdateGroupAdminResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupAdminResponseProtoMsg): _61.MsgUpdateGroupAdminResponse;
                toProto(message: _61.MsgUpdateGroupAdminResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupAdminResponse): _61.MsgUpdateGroupAdminResponseProtoMsg;
            };
            MsgUpdateGroupMetadata: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupMetadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupMetadata;
                fromJSON(object: any): _61.MsgUpdateGroupMetadata;
                toJSON(message: _61.MsgUpdateGroupMetadata): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupMetadata>;
                fromPartial(object: Partial<_61.MsgUpdateGroupMetadata>): _61.MsgUpdateGroupMetadata;
                fromProtoMsg(message: _61.MsgUpdateGroupMetadataProtoMsg): _61.MsgUpdateGroupMetadata;
                toProto(message: _61.MsgUpdateGroupMetadata): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupMetadata): _61.MsgUpdateGroupMetadataProtoMsg;
            };
            MsgUpdateGroupMetadataResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupMetadataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupMetadataResponse;
                fromJSON(_: any): _61.MsgUpdateGroupMetadataResponse;
                toJSON(_: _61.MsgUpdateGroupMetadataResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupMetadataResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupMetadataResponse>): _61.MsgUpdateGroupMetadataResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupMetadataResponseProtoMsg): _61.MsgUpdateGroupMetadataResponse;
                toProto(message: _61.MsgUpdateGroupMetadataResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupMetadataResponse): _61.MsgUpdateGroupMetadataResponseProtoMsg;
            };
            MsgCreateGroupPolicy: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroupPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroupPolicy;
                fromJSON(object: any): _61.MsgCreateGroupPolicy;
                toJSON(message: _61.MsgCreateGroupPolicy): import("../json-safe.js").JsonSafe<_61.MsgCreateGroupPolicy>;
                fromPartial(object: Partial<_61.MsgCreateGroupPolicy>): _61.MsgCreateGroupPolicy;
                fromProtoMsg(message: _61.MsgCreateGroupPolicyProtoMsg): _61.MsgCreateGroupPolicy;
                toProto(message: _61.MsgCreateGroupPolicy): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroupPolicy): _61.MsgCreateGroupPolicyProtoMsg;
            };
            MsgCreateGroupPolicyResponse: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroupPolicyResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroupPolicyResponse;
                fromJSON(object: any): _61.MsgCreateGroupPolicyResponse;
                toJSON(message: _61.MsgCreateGroupPolicyResponse): import("../json-safe.js").JsonSafe<_61.MsgCreateGroupPolicyResponse>;
                fromPartial(object: Partial<_61.MsgCreateGroupPolicyResponse>): _61.MsgCreateGroupPolicyResponse;
                fromProtoMsg(message: _61.MsgCreateGroupPolicyResponseProtoMsg): _61.MsgCreateGroupPolicyResponse;
                toProto(message: _61.MsgCreateGroupPolicyResponse): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroupPolicyResponse): _61.MsgCreateGroupPolicyResponseProtoMsg;
            };
            MsgUpdateGroupPolicyAdmin: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupPolicyAdmin, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyAdmin;
                fromJSON(object: any): _61.MsgUpdateGroupPolicyAdmin;
                toJSON(message: _61.MsgUpdateGroupPolicyAdmin): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyAdmin>;
                fromPartial(object: Partial<_61.MsgUpdateGroupPolicyAdmin>): _61.MsgUpdateGroupPolicyAdmin;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyAdminProtoMsg): _61.MsgUpdateGroupPolicyAdmin;
                toProto(message: _61.MsgUpdateGroupPolicyAdmin): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyAdmin): _61.MsgUpdateGroupPolicyAdminProtoMsg;
            };
            MsgCreateGroupWithPolicy: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroupWithPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroupWithPolicy;
                fromJSON(object: any): _61.MsgCreateGroupWithPolicy;
                toJSON(message: _61.MsgCreateGroupWithPolicy): import("../json-safe.js").JsonSafe<_61.MsgCreateGroupWithPolicy>;
                fromPartial(object: Partial<_61.MsgCreateGroupWithPolicy>): _61.MsgCreateGroupWithPolicy;
                fromProtoMsg(message: _61.MsgCreateGroupWithPolicyProtoMsg): _61.MsgCreateGroupWithPolicy;
                toProto(message: _61.MsgCreateGroupWithPolicy): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroupWithPolicy): _61.MsgCreateGroupWithPolicyProtoMsg;
            };
            MsgCreateGroupWithPolicyResponse: {
                typeUrl: string;
                encode(message: _61.MsgCreateGroupWithPolicyResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgCreateGroupWithPolicyResponse;
                fromJSON(object: any): _61.MsgCreateGroupWithPolicyResponse;
                toJSON(message: _61.MsgCreateGroupWithPolicyResponse): import("../json-safe.js").JsonSafe<_61.MsgCreateGroupWithPolicyResponse>;
                fromPartial(object: Partial<_61.MsgCreateGroupWithPolicyResponse>): _61.MsgCreateGroupWithPolicyResponse;
                fromProtoMsg(message: _61.MsgCreateGroupWithPolicyResponseProtoMsg): _61.MsgCreateGroupWithPolicyResponse;
                toProto(message: _61.MsgCreateGroupWithPolicyResponse): Uint8Array;
                toProtoMsg(message: _61.MsgCreateGroupWithPolicyResponse): _61.MsgCreateGroupWithPolicyResponseProtoMsg;
            };
            MsgUpdateGroupPolicyAdminResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupPolicyAdminResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyAdminResponse;
                fromJSON(_: any): _61.MsgUpdateGroupPolicyAdminResponse;
                toJSON(_: _61.MsgUpdateGroupPolicyAdminResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyAdminResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupPolicyAdminResponse>): _61.MsgUpdateGroupPolicyAdminResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyAdminResponseProtoMsg): _61.MsgUpdateGroupPolicyAdminResponse;
                toProto(message: _61.MsgUpdateGroupPolicyAdminResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyAdminResponse): _61.MsgUpdateGroupPolicyAdminResponseProtoMsg;
            };
            MsgUpdateGroupPolicyDecisionPolicy: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupPolicyDecisionPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyDecisionPolicy;
                fromJSON(object: any): _61.MsgUpdateGroupPolicyDecisionPolicy;
                toJSON(message: _61.MsgUpdateGroupPolicyDecisionPolicy): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyDecisionPolicy>;
                fromPartial(object: Partial<_61.MsgUpdateGroupPolicyDecisionPolicy>): _61.MsgUpdateGroupPolicyDecisionPolicy;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyDecisionPolicyProtoMsg): _61.MsgUpdateGroupPolicyDecisionPolicy;
                toProto(message: _61.MsgUpdateGroupPolicyDecisionPolicy): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyDecisionPolicy): _61.MsgUpdateGroupPolicyDecisionPolicyProtoMsg;
            };
            MsgUpdateGroupPolicyDecisionPolicyResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupPolicyDecisionPolicyResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyDecisionPolicyResponse;
                fromJSON(_: any): _61.MsgUpdateGroupPolicyDecisionPolicyResponse;
                toJSON(_: _61.MsgUpdateGroupPolicyDecisionPolicyResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyDecisionPolicyResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupPolicyDecisionPolicyResponse>): _61.MsgUpdateGroupPolicyDecisionPolicyResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyDecisionPolicyResponseProtoMsg): _61.MsgUpdateGroupPolicyDecisionPolicyResponse;
                toProto(message: _61.MsgUpdateGroupPolicyDecisionPolicyResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyDecisionPolicyResponse): _61.MsgUpdateGroupPolicyDecisionPolicyResponseProtoMsg;
            };
            MsgUpdateGroupPolicyMetadata: {
                typeUrl: string;
                encode(message: _61.MsgUpdateGroupPolicyMetadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyMetadata;
                fromJSON(object: any): _61.MsgUpdateGroupPolicyMetadata;
                toJSON(message: _61.MsgUpdateGroupPolicyMetadata): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyMetadata>;
                fromPartial(object: Partial<_61.MsgUpdateGroupPolicyMetadata>): _61.MsgUpdateGroupPolicyMetadata;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyMetadataProtoMsg): _61.MsgUpdateGroupPolicyMetadata;
                toProto(message: _61.MsgUpdateGroupPolicyMetadata): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyMetadata): _61.MsgUpdateGroupPolicyMetadataProtoMsg;
            };
            MsgUpdateGroupPolicyMetadataResponse: {
                typeUrl: string;
                encode(_: _61.MsgUpdateGroupPolicyMetadataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgUpdateGroupPolicyMetadataResponse;
                fromJSON(_: any): _61.MsgUpdateGroupPolicyMetadataResponse;
                toJSON(_: _61.MsgUpdateGroupPolicyMetadataResponse): import("../json-safe.js").JsonSafe<_61.MsgUpdateGroupPolicyMetadataResponse>;
                fromPartial(_: Partial<_61.MsgUpdateGroupPolicyMetadataResponse>): _61.MsgUpdateGroupPolicyMetadataResponse;
                fromProtoMsg(message: _61.MsgUpdateGroupPolicyMetadataResponseProtoMsg): _61.MsgUpdateGroupPolicyMetadataResponse;
                toProto(message: _61.MsgUpdateGroupPolicyMetadataResponse): Uint8Array;
                toProtoMsg(message: _61.MsgUpdateGroupPolicyMetadataResponse): _61.MsgUpdateGroupPolicyMetadataResponseProtoMsg;
            };
            MsgSubmitProposal: {
                typeUrl: string;
                encode(message: _61.MsgSubmitProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgSubmitProposal;
                fromJSON(object: any): _61.MsgSubmitProposal;
                toJSON(message: _61.MsgSubmitProposal): import("../json-safe.js").JsonSafe<_61.MsgSubmitProposal>;
                fromPartial(object: Partial<_61.MsgSubmitProposal>): _61.MsgSubmitProposal;
                fromProtoMsg(message: _61.MsgSubmitProposalProtoMsg): _61.MsgSubmitProposal;
                toProto(message: _61.MsgSubmitProposal): Uint8Array;
                toProtoMsg(message: _61.MsgSubmitProposal): _61.MsgSubmitProposalProtoMsg;
            };
            MsgSubmitProposalResponse: {
                typeUrl: string;
                encode(message: _61.MsgSubmitProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgSubmitProposalResponse;
                fromJSON(object: any): _61.MsgSubmitProposalResponse;
                toJSON(message: _61.MsgSubmitProposalResponse): import("../json-safe.js").JsonSafe<_61.MsgSubmitProposalResponse>;
                fromPartial(object: Partial<_61.MsgSubmitProposalResponse>): _61.MsgSubmitProposalResponse;
                fromProtoMsg(message: _61.MsgSubmitProposalResponseProtoMsg): _61.MsgSubmitProposalResponse;
                toProto(message: _61.MsgSubmitProposalResponse): Uint8Array;
                toProtoMsg(message: _61.MsgSubmitProposalResponse): _61.MsgSubmitProposalResponseProtoMsg;
            };
            MsgWithdrawProposal: {
                typeUrl: string;
                encode(message: _61.MsgWithdrawProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgWithdrawProposal;
                fromJSON(object: any): _61.MsgWithdrawProposal;
                toJSON(message: _61.MsgWithdrawProposal): import("../json-safe.js").JsonSafe<_61.MsgWithdrawProposal>;
                fromPartial(object: Partial<_61.MsgWithdrawProposal>): _61.MsgWithdrawProposal;
                fromProtoMsg(message: _61.MsgWithdrawProposalProtoMsg): _61.MsgWithdrawProposal;
                toProto(message: _61.MsgWithdrawProposal): Uint8Array;
                toProtoMsg(message: _61.MsgWithdrawProposal): _61.MsgWithdrawProposalProtoMsg;
            };
            MsgWithdrawProposalResponse: {
                typeUrl: string;
                encode(_: _61.MsgWithdrawProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgWithdrawProposalResponse;
                fromJSON(_: any): _61.MsgWithdrawProposalResponse;
                toJSON(_: _61.MsgWithdrawProposalResponse): import("../json-safe.js").JsonSafe<_61.MsgWithdrawProposalResponse>;
                fromPartial(_: Partial<_61.MsgWithdrawProposalResponse>): _61.MsgWithdrawProposalResponse;
                fromProtoMsg(message: _61.MsgWithdrawProposalResponseProtoMsg): _61.MsgWithdrawProposalResponse;
                toProto(message: _61.MsgWithdrawProposalResponse): Uint8Array;
                toProtoMsg(message: _61.MsgWithdrawProposalResponse): _61.MsgWithdrawProposalResponseProtoMsg;
            };
            MsgVote: {
                typeUrl: string;
                encode(message: _61.MsgVote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgVote;
                fromJSON(object: any): _61.MsgVote;
                toJSON(message: _61.MsgVote): import("../json-safe.js").JsonSafe<_61.MsgVote>;
                fromPartial(object: Partial<_61.MsgVote>): _61.MsgVote;
                fromProtoMsg(message: _61.MsgVoteProtoMsg): _61.MsgVote;
                toProto(message: _61.MsgVote): Uint8Array;
                toProtoMsg(message: _61.MsgVote): _61.MsgVoteProtoMsg;
            };
            MsgVoteResponse: {
                typeUrl: string;
                encode(_: _61.MsgVoteResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgVoteResponse;
                fromJSON(_: any): _61.MsgVoteResponse;
                toJSON(_: _61.MsgVoteResponse): import("../json-safe.js").JsonSafe<_61.MsgVoteResponse>;
                fromPartial(_: Partial<_61.MsgVoteResponse>): _61.MsgVoteResponse;
                fromProtoMsg(message: _61.MsgVoteResponseProtoMsg): _61.MsgVoteResponse;
                toProto(message: _61.MsgVoteResponse): Uint8Array;
                toProtoMsg(message: _61.MsgVoteResponse): _61.MsgVoteResponseProtoMsg;
            };
            MsgExec: {
                typeUrl: string;
                encode(message: _61.MsgExec, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgExec;
                fromJSON(object: any): _61.MsgExec;
                toJSON(message: _61.MsgExec): import("../json-safe.js").JsonSafe<_61.MsgExec>;
                fromPartial(object: Partial<_61.MsgExec>): _61.MsgExec;
                fromProtoMsg(message: _61.MsgExecProtoMsg): _61.MsgExec;
                toProto(message: _61.MsgExec): Uint8Array;
                toProtoMsg(message: _61.MsgExec): _61.MsgExecProtoMsg;
            };
            MsgExecResponse: {
                typeUrl: string;
                encode(message: _61.MsgExecResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgExecResponse;
                fromJSON(object: any): _61.MsgExecResponse;
                toJSON(message: _61.MsgExecResponse): import("../json-safe.js").JsonSafe<_61.MsgExecResponse>;
                fromPartial(object: Partial<_61.MsgExecResponse>): _61.MsgExecResponse;
                fromProtoMsg(message: _61.MsgExecResponseProtoMsg): _61.MsgExecResponse;
                toProto(message: _61.MsgExecResponse): Uint8Array;
                toProtoMsg(message: _61.MsgExecResponse): _61.MsgExecResponseProtoMsg;
            };
            MsgLeaveGroup: {
                typeUrl: string;
                encode(message: _61.MsgLeaveGroup, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgLeaveGroup;
                fromJSON(object: any): _61.MsgLeaveGroup;
                toJSON(message: _61.MsgLeaveGroup): import("../json-safe.js").JsonSafe<_61.MsgLeaveGroup>;
                fromPartial(object: Partial<_61.MsgLeaveGroup>): _61.MsgLeaveGroup;
                fromProtoMsg(message: _61.MsgLeaveGroupProtoMsg): _61.MsgLeaveGroup;
                toProto(message: _61.MsgLeaveGroup): Uint8Array;
                toProtoMsg(message: _61.MsgLeaveGroup): _61.MsgLeaveGroupProtoMsg;
            };
            MsgLeaveGroupResponse: {
                typeUrl: string;
                encode(_: _61.MsgLeaveGroupResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _61.MsgLeaveGroupResponse;
                fromJSON(_: any): _61.MsgLeaveGroupResponse;
                toJSON(_: _61.MsgLeaveGroupResponse): import("../json-safe.js").JsonSafe<_61.MsgLeaveGroupResponse>;
                fromPartial(_: Partial<_61.MsgLeaveGroupResponse>): _61.MsgLeaveGroupResponse;
                fromProtoMsg(message: _61.MsgLeaveGroupResponseProtoMsg): _61.MsgLeaveGroupResponse;
                toProto(message: _61.MsgLeaveGroupResponse): Uint8Array;
                toProtoMsg(message: _61.MsgLeaveGroupResponse): _61.MsgLeaveGroupResponseProtoMsg;
            };
            QueryGroupInfoRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupInfoRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupInfoRequest;
                fromJSON(object: any): _60.QueryGroupInfoRequest;
                toJSON(message: _60.QueryGroupInfoRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupInfoRequest>;
                fromPartial(object: Partial<_60.QueryGroupInfoRequest>): _60.QueryGroupInfoRequest;
                fromProtoMsg(message: _60.QueryGroupInfoRequestProtoMsg): _60.QueryGroupInfoRequest;
                toProto(message: _60.QueryGroupInfoRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupInfoRequest): _60.QueryGroupInfoRequestProtoMsg;
            };
            QueryGroupInfoResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupInfoResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupInfoResponse;
                fromJSON(object: any): _60.QueryGroupInfoResponse;
                toJSON(message: _60.QueryGroupInfoResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupInfoResponse>;
                fromPartial(object: Partial<_60.QueryGroupInfoResponse>): _60.QueryGroupInfoResponse;
                fromProtoMsg(message: _60.QueryGroupInfoResponseProtoMsg): _60.QueryGroupInfoResponse;
                toProto(message: _60.QueryGroupInfoResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupInfoResponse): _60.QueryGroupInfoResponseProtoMsg;
            };
            QueryGroupPolicyInfoRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupPolicyInfoRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPolicyInfoRequest;
                fromJSON(object: any): _60.QueryGroupPolicyInfoRequest;
                toJSON(message: _60.QueryGroupPolicyInfoRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupPolicyInfoRequest>;
                fromPartial(object: Partial<_60.QueryGroupPolicyInfoRequest>): _60.QueryGroupPolicyInfoRequest;
                fromProtoMsg(message: _60.QueryGroupPolicyInfoRequestProtoMsg): _60.QueryGroupPolicyInfoRequest;
                toProto(message: _60.QueryGroupPolicyInfoRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPolicyInfoRequest): _60.QueryGroupPolicyInfoRequestProtoMsg;
            };
            QueryGroupPolicyInfoResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupPolicyInfoResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPolicyInfoResponse;
                fromJSON(object: any): _60.QueryGroupPolicyInfoResponse;
                toJSON(message: _60.QueryGroupPolicyInfoResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupPolicyInfoResponse>;
                fromPartial(object: Partial<_60.QueryGroupPolicyInfoResponse>): _60.QueryGroupPolicyInfoResponse;
                fromProtoMsg(message: _60.QueryGroupPolicyInfoResponseProtoMsg): _60.QueryGroupPolicyInfoResponse;
                toProto(message: _60.QueryGroupPolicyInfoResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPolicyInfoResponse): _60.QueryGroupPolicyInfoResponseProtoMsg;
            };
            QueryGroupMembersRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupMembersRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupMembersRequest;
                fromJSON(object: any): _60.QueryGroupMembersRequest;
                toJSON(message: _60.QueryGroupMembersRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupMembersRequest>;
                fromPartial(object: Partial<_60.QueryGroupMembersRequest>): _60.QueryGroupMembersRequest;
                fromProtoMsg(message: _60.QueryGroupMembersRequestProtoMsg): _60.QueryGroupMembersRequest;
                toProto(message: _60.QueryGroupMembersRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupMembersRequest): _60.QueryGroupMembersRequestProtoMsg;
            };
            QueryGroupMembersResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupMembersResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupMembersResponse;
                fromJSON(object: any): _60.QueryGroupMembersResponse;
                toJSON(message: _60.QueryGroupMembersResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupMembersResponse>;
                fromPartial(object: Partial<_60.QueryGroupMembersResponse>): _60.QueryGroupMembersResponse;
                fromProtoMsg(message: _60.QueryGroupMembersResponseProtoMsg): _60.QueryGroupMembersResponse;
                toProto(message: _60.QueryGroupMembersResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupMembersResponse): _60.QueryGroupMembersResponseProtoMsg;
            };
            QueryGroupsByAdminRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupsByAdminRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsByAdminRequest;
                fromJSON(object: any): _60.QueryGroupsByAdminRequest;
                toJSON(message: _60.QueryGroupsByAdminRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupsByAdminRequest>;
                fromPartial(object: Partial<_60.QueryGroupsByAdminRequest>): _60.QueryGroupsByAdminRequest;
                fromProtoMsg(message: _60.QueryGroupsByAdminRequestProtoMsg): _60.QueryGroupsByAdminRequest;
                toProto(message: _60.QueryGroupsByAdminRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsByAdminRequest): _60.QueryGroupsByAdminRequestProtoMsg;
            };
            QueryGroupsByAdminResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupsByAdminResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsByAdminResponse;
                fromJSON(object: any): _60.QueryGroupsByAdminResponse;
                toJSON(message: _60.QueryGroupsByAdminResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupsByAdminResponse>;
                fromPartial(object: Partial<_60.QueryGroupsByAdminResponse>): _60.QueryGroupsByAdminResponse;
                fromProtoMsg(message: _60.QueryGroupsByAdminResponseProtoMsg): _60.QueryGroupsByAdminResponse;
                toProto(message: _60.QueryGroupsByAdminResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsByAdminResponse): _60.QueryGroupsByAdminResponseProtoMsg;
            };
            QueryGroupPoliciesByGroupRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupPoliciesByGroupRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPoliciesByGroupRequest;
                fromJSON(object: any): _60.QueryGroupPoliciesByGroupRequest;
                toJSON(message: _60.QueryGroupPoliciesByGroupRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupPoliciesByGroupRequest>;
                fromPartial(object: Partial<_60.QueryGroupPoliciesByGroupRequest>): _60.QueryGroupPoliciesByGroupRequest;
                fromProtoMsg(message: _60.QueryGroupPoliciesByGroupRequestProtoMsg): _60.QueryGroupPoliciesByGroupRequest;
                toProto(message: _60.QueryGroupPoliciesByGroupRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPoliciesByGroupRequest): _60.QueryGroupPoliciesByGroupRequestProtoMsg;
            };
            QueryGroupPoliciesByGroupResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupPoliciesByGroupResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPoliciesByGroupResponse;
                fromJSON(object: any): _60.QueryGroupPoliciesByGroupResponse;
                toJSON(message: _60.QueryGroupPoliciesByGroupResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupPoliciesByGroupResponse>;
                fromPartial(object: Partial<_60.QueryGroupPoliciesByGroupResponse>): _60.QueryGroupPoliciesByGroupResponse;
                fromProtoMsg(message: _60.QueryGroupPoliciesByGroupResponseProtoMsg): _60.QueryGroupPoliciesByGroupResponse;
                toProto(message: _60.QueryGroupPoliciesByGroupResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPoliciesByGroupResponse): _60.QueryGroupPoliciesByGroupResponseProtoMsg;
            };
            QueryGroupPoliciesByAdminRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupPoliciesByAdminRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPoliciesByAdminRequest;
                fromJSON(object: any): _60.QueryGroupPoliciesByAdminRequest;
                toJSON(message: _60.QueryGroupPoliciesByAdminRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupPoliciesByAdminRequest>;
                fromPartial(object: Partial<_60.QueryGroupPoliciesByAdminRequest>): _60.QueryGroupPoliciesByAdminRequest;
                fromProtoMsg(message: _60.QueryGroupPoliciesByAdminRequestProtoMsg): _60.QueryGroupPoliciesByAdminRequest;
                toProto(message: _60.QueryGroupPoliciesByAdminRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPoliciesByAdminRequest): _60.QueryGroupPoliciesByAdminRequestProtoMsg;
            };
            QueryGroupPoliciesByAdminResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupPoliciesByAdminResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupPoliciesByAdminResponse;
                fromJSON(object: any): _60.QueryGroupPoliciesByAdminResponse;
                toJSON(message: _60.QueryGroupPoliciesByAdminResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupPoliciesByAdminResponse>;
                fromPartial(object: Partial<_60.QueryGroupPoliciesByAdminResponse>): _60.QueryGroupPoliciesByAdminResponse;
                fromProtoMsg(message: _60.QueryGroupPoliciesByAdminResponseProtoMsg): _60.QueryGroupPoliciesByAdminResponse;
                toProto(message: _60.QueryGroupPoliciesByAdminResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupPoliciesByAdminResponse): _60.QueryGroupPoliciesByAdminResponseProtoMsg;
            };
            QueryProposalRequest: {
                typeUrl: string;
                encode(message: _60.QueryProposalRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryProposalRequest;
                fromJSON(object: any): _60.QueryProposalRequest;
                toJSON(message: _60.QueryProposalRequest): import("../json-safe.js").JsonSafe<_60.QueryProposalRequest>;
                fromPartial(object: Partial<_60.QueryProposalRequest>): _60.QueryProposalRequest;
                fromProtoMsg(message: _60.QueryProposalRequestProtoMsg): _60.QueryProposalRequest;
                toProto(message: _60.QueryProposalRequest): Uint8Array;
                toProtoMsg(message: _60.QueryProposalRequest): _60.QueryProposalRequestProtoMsg;
            };
            QueryProposalResponse: {
                typeUrl: string;
                encode(message: _60.QueryProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryProposalResponse;
                fromJSON(object: any): _60.QueryProposalResponse;
                toJSON(message: _60.QueryProposalResponse): import("../json-safe.js").JsonSafe<_60.QueryProposalResponse>;
                fromPartial(object: Partial<_60.QueryProposalResponse>): _60.QueryProposalResponse;
                fromProtoMsg(message: _60.QueryProposalResponseProtoMsg): _60.QueryProposalResponse;
                toProto(message: _60.QueryProposalResponse): Uint8Array;
                toProtoMsg(message: _60.QueryProposalResponse): _60.QueryProposalResponseProtoMsg;
            };
            QueryProposalsByGroupPolicyRequest: {
                typeUrl: string;
                encode(message: _60.QueryProposalsByGroupPolicyRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryProposalsByGroupPolicyRequest;
                fromJSON(object: any): _60.QueryProposalsByGroupPolicyRequest;
                toJSON(message: _60.QueryProposalsByGroupPolicyRequest): import("../json-safe.js").JsonSafe<_60.QueryProposalsByGroupPolicyRequest>;
                fromPartial(object: Partial<_60.QueryProposalsByGroupPolicyRequest>): _60.QueryProposalsByGroupPolicyRequest;
                fromProtoMsg(message: _60.QueryProposalsByGroupPolicyRequestProtoMsg): _60.QueryProposalsByGroupPolicyRequest;
                toProto(message: _60.QueryProposalsByGroupPolicyRequest): Uint8Array;
                toProtoMsg(message: _60.QueryProposalsByGroupPolicyRequest): _60.QueryProposalsByGroupPolicyRequestProtoMsg;
            };
            QueryProposalsByGroupPolicyResponse: {
                typeUrl: string;
                encode(message: _60.QueryProposalsByGroupPolicyResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryProposalsByGroupPolicyResponse;
                fromJSON(object: any): _60.QueryProposalsByGroupPolicyResponse;
                toJSON(message: _60.QueryProposalsByGroupPolicyResponse): import("../json-safe.js").JsonSafe<_60.QueryProposalsByGroupPolicyResponse>;
                fromPartial(object: Partial<_60.QueryProposalsByGroupPolicyResponse>): _60.QueryProposalsByGroupPolicyResponse;
                fromProtoMsg(message: _60.QueryProposalsByGroupPolicyResponseProtoMsg): _60.QueryProposalsByGroupPolicyResponse;
                toProto(message: _60.QueryProposalsByGroupPolicyResponse): Uint8Array;
                toProtoMsg(message: _60.QueryProposalsByGroupPolicyResponse): _60.QueryProposalsByGroupPolicyResponseProtoMsg;
            };
            QueryVoteByProposalVoterRequest: {
                typeUrl: string;
                encode(message: _60.QueryVoteByProposalVoterRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVoteByProposalVoterRequest;
                fromJSON(object: any): _60.QueryVoteByProposalVoterRequest;
                toJSON(message: _60.QueryVoteByProposalVoterRequest): import("../json-safe.js").JsonSafe<_60.QueryVoteByProposalVoterRequest>;
                fromPartial(object: Partial<_60.QueryVoteByProposalVoterRequest>): _60.QueryVoteByProposalVoterRequest;
                fromProtoMsg(message: _60.QueryVoteByProposalVoterRequestProtoMsg): _60.QueryVoteByProposalVoterRequest;
                toProto(message: _60.QueryVoteByProposalVoterRequest): Uint8Array;
                toProtoMsg(message: _60.QueryVoteByProposalVoterRequest): _60.QueryVoteByProposalVoterRequestProtoMsg;
            };
            QueryVoteByProposalVoterResponse: {
                typeUrl: string;
                encode(message: _60.QueryVoteByProposalVoterResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVoteByProposalVoterResponse;
                fromJSON(object: any): _60.QueryVoteByProposalVoterResponse;
                toJSON(message: _60.QueryVoteByProposalVoterResponse): import("../json-safe.js").JsonSafe<_60.QueryVoteByProposalVoterResponse>;
                fromPartial(object: Partial<_60.QueryVoteByProposalVoterResponse>): _60.QueryVoteByProposalVoterResponse;
                fromProtoMsg(message: _60.QueryVoteByProposalVoterResponseProtoMsg): _60.QueryVoteByProposalVoterResponse;
                toProto(message: _60.QueryVoteByProposalVoterResponse): Uint8Array;
                toProtoMsg(message: _60.QueryVoteByProposalVoterResponse): _60.QueryVoteByProposalVoterResponseProtoMsg;
            };
            QueryVotesByProposalRequest: {
                typeUrl: string;
                encode(message: _60.QueryVotesByProposalRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVotesByProposalRequest;
                fromJSON(object: any): _60.QueryVotesByProposalRequest;
                toJSON(message: _60.QueryVotesByProposalRequest): import("../json-safe.js").JsonSafe<_60.QueryVotesByProposalRequest>;
                fromPartial(object: Partial<_60.QueryVotesByProposalRequest>): _60.QueryVotesByProposalRequest;
                fromProtoMsg(message: _60.QueryVotesByProposalRequestProtoMsg): _60.QueryVotesByProposalRequest;
                toProto(message: _60.QueryVotesByProposalRequest): Uint8Array;
                toProtoMsg(message: _60.QueryVotesByProposalRequest): _60.QueryVotesByProposalRequestProtoMsg;
            };
            QueryVotesByProposalResponse: {
                typeUrl: string;
                encode(message: _60.QueryVotesByProposalResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVotesByProposalResponse;
                fromJSON(object: any): _60.QueryVotesByProposalResponse;
                toJSON(message: _60.QueryVotesByProposalResponse): import("../json-safe.js").JsonSafe<_60.QueryVotesByProposalResponse>;
                fromPartial(object: Partial<_60.QueryVotesByProposalResponse>): _60.QueryVotesByProposalResponse;
                fromProtoMsg(message: _60.QueryVotesByProposalResponseProtoMsg): _60.QueryVotesByProposalResponse;
                toProto(message: _60.QueryVotesByProposalResponse): Uint8Array;
                toProtoMsg(message: _60.QueryVotesByProposalResponse): _60.QueryVotesByProposalResponseProtoMsg;
            };
            QueryVotesByVoterRequest: {
                typeUrl: string;
                encode(message: _60.QueryVotesByVoterRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVotesByVoterRequest;
                fromJSON(object: any): _60.QueryVotesByVoterRequest;
                toJSON(message: _60.QueryVotesByVoterRequest): import("../json-safe.js").JsonSafe<_60.QueryVotesByVoterRequest>;
                fromPartial(object: Partial<_60.QueryVotesByVoterRequest>): _60.QueryVotesByVoterRequest;
                fromProtoMsg(message: _60.QueryVotesByVoterRequestProtoMsg): _60.QueryVotesByVoterRequest;
                toProto(message: _60.QueryVotesByVoterRequest): Uint8Array;
                toProtoMsg(message: _60.QueryVotesByVoterRequest): _60.QueryVotesByVoterRequestProtoMsg;
            };
            QueryVotesByVoterResponse: {
                typeUrl: string;
                encode(message: _60.QueryVotesByVoterResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryVotesByVoterResponse;
                fromJSON(object: any): _60.QueryVotesByVoterResponse;
                toJSON(message: _60.QueryVotesByVoterResponse): import("../json-safe.js").JsonSafe<_60.QueryVotesByVoterResponse>;
                fromPartial(object: Partial<_60.QueryVotesByVoterResponse>): _60.QueryVotesByVoterResponse;
                fromProtoMsg(message: _60.QueryVotesByVoterResponseProtoMsg): _60.QueryVotesByVoterResponse;
                toProto(message: _60.QueryVotesByVoterResponse): Uint8Array;
                toProtoMsg(message: _60.QueryVotesByVoterResponse): _60.QueryVotesByVoterResponseProtoMsg;
            };
            QueryGroupsByMemberRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupsByMemberRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsByMemberRequest;
                fromJSON(object: any): _60.QueryGroupsByMemberRequest;
                toJSON(message: _60.QueryGroupsByMemberRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupsByMemberRequest>;
                fromPartial(object: Partial<_60.QueryGroupsByMemberRequest>): _60.QueryGroupsByMemberRequest;
                fromProtoMsg(message: _60.QueryGroupsByMemberRequestProtoMsg): _60.QueryGroupsByMemberRequest;
                toProto(message: _60.QueryGroupsByMemberRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsByMemberRequest): _60.QueryGroupsByMemberRequestProtoMsg;
            };
            QueryGroupsByMemberResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupsByMemberResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsByMemberResponse;
                fromJSON(object: any): _60.QueryGroupsByMemberResponse;
                toJSON(message: _60.QueryGroupsByMemberResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupsByMemberResponse>;
                fromPartial(object: Partial<_60.QueryGroupsByMemberResponse>): _60.QueryGroupsByMemberResponse;
                fromProtoMsg(message: _60.QueryGroupsByMemberResponseProtoMsg): _60.QueryGroupsByMemberResponse;
                toProto(message: _60.QueryGroupsByMemberResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsByMemberResponse): _60.QueryGroupsByMemberResponseProtoMsg;
            };
            QueryTallyResultRequest: {
                typeUrl: string;
                encode(message: _60.QueryTallyResultRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryTallyResultRequest;
                fromJSON(object: any): _60.QueryTallyResultRequest;
                toJSON(message: _60.QueryTallyResultRequest): import("../json-safe.js").JsonSafe<_60.QueryTallyResultRequest>;
                fromPartial(object: Partial<_60.QueryTallyResultRequest>): _60.QueryTallyResultRequest;
                fromProtoMsg(message: _60.QueryTallyResultRequestProtoMsg): _60.QueryTallyResultRequest;
                toProto(message: _60.QueryTallyResultRequest): Uint8Array;
                toProtoMsg(message: _60.QueryTallyResultRequest): _60.QueryTallyResultRequestProtoMsg;
            };
            QueryTallyResultResponse: {
                typeUrl: string;
                encode(message: _60.QueryTallyResultResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryTallyResultResponse;
                fromJSON(object: any): _60.QueryTallyResultResponse;
                toJSON(message: _60.QueryTallyResultResponse): import("../json-safe.js").JsonSafe<_60.QueryTallyResultResponse>;
                fromPartial(object: Partial<_60.QueryTallyResultResponse>): _60.QueryTallyResultResponse;
                fromProtoMsg(message: _60.QueryTallyResultResponseProtoMsg): _60.QueryTallyResultResponse;
                toProto(message: _60.QueryTallyResultResponse): Uint8Array;
                toProtoMsg(message: _60.QueryTallyResultResponse): _60.QueryTallyResultResponseProtoMsg;
            };
            QueryGroupsRequest: {
                typeUrl: string;
                encode(message: _60.QueryGroupsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsRequest;
                fromJSON(object: any): _60.QueryGroupsRequest;
                toJSON(message: _60.QueryGroupsRequest): import("../json-safe.js").JsonSafe<_60.QueryGroupsRequest>;
                fromPartial(object: Partial<_60.QueryGroupsRequest>): _60.QueryGroupsRequest;
                fromProtoMsg(message: _60.QueryGroupsRequestProtoMsg): _60.QueryGroupsRequest;
                toProto(message: _60.QueryGroupsRequest): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsRequest): _60.QueryGroupsRequestProtoMsg;
            };
            QueryGroupsResponse: {
                typeUrl: string;
                encode(message: _60.QueryGroupsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _60.QueryGroupsResponse;
                fromJSON(object: any): _60.QueryGroupsResponse;
                toJSON(message: _60.QueryGroupsResponse): import("../json-safe.js").JsonSafe<_60.QueryGroupsResponse>;
                fromPartial(object: Partial<_60.QueryGroupsResponse>): _60.QueryGroupsResponse;
                fromProtoMsg(message: _60.QueryGroupsResponseProtoMsg): _60.QueryGroupsResponse;
                toProto(message: _60.QueryGroupsResponse): Uint8Array;
                toProtoMsg(message: _60.QueryGroupsResponse): _60.QueryGroupsResponseProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _59.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _59.GenesisState;
                fromJSON(object: any): _59.GenesisState;
                toJSON(message: _59.GenesisState): import("../json-safe.js").JsonSafe<_59.GenesisState>;
                fromPartial(object: Partial<_59.GenesisState>): _59.GenesisState;
                fromProtoMsg(message: _59.GenesisStateProtoMsg): _59.GenesisState;
                toProto(message: _59.GenesisState): Uint8Array;
                toProtoMsg(message: _59.GenesisState): _59.GenesisStateProtoMsg;
            };
            EventCreateGroup: {
                typeUrl: string;
                encode(message: _58.EventCreateGroup, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventCreateGroup;
                fromJSON(object: any): _58.EventCreateGroup;
                toJSON(message: _58.EventCreateGroup): import("../json-safe.js").JsonSafe<_58.EventCreateGroup>;
                fromPartial(object: Partial<_58.EventCreateGroup>): _58.EventCreateGroup;
                fromProtoMsg(message: _58.EventCreateGroupProtoMsg): _58.EventCreateGroup;
                toProto(message: _58.EventCreateGroup): Uint8Array;
                toProtoMsg(message: _58.EventCreateGroup): _58.EventCreateGroupProtoMsg;
            };
            EventUpdateGroup: {
                typeUrl: string;
                encode(message: _58.EventUpdateGroup, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventUpdateGroup;
                fromJSON(object: any): _58.EventUpdateGroup;
                toJSON(message: _58.EventUpdateGroup): import("../json-safe.js").JsonSafe<_58.EventUpdateGroup>;
                fromPartial(object: Partial<_58.EventUpdateGroup>): _58.EventUpdateGroup;
                fromProtoMsg(message: _58.EventUpdateGroupProtoMsg): _58.EventUpdateGroup;
                toProto(message: _58.EventUpdateGroup): Uint8Array;
                toProtoMsg(message: _58.EventUpdateGroup): _58.EventUpdateGroupProtoMsg;
            };
            EventCreateGroupPolicy: {
                typeUrl: string;
                encode(message: _58.EventCreateGroupPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventCreateGroupPolicy;
                fromJSON(object: any): _58.EventCreateGroupPolicy;
                toJSON(message: _58.EventCreateGroupPolicy): import("../json-safe.js").JsonSafe<_58.EventCreateGroupPolicy>;
                fromPartial(object: Partial<_58.EventCreateGroupPolicy>): _58.EventCreateGroupPolicy;
                fromProtoMsg(message: _58.EventCreateGroupPolicyProtoMsg): _58.EventCreateGroupPolicy;
                toProto(message: _58.EventCreateGroupPolicy): Uint8Array;
                toProtoMsg(message: _58.EventCreateGroupPolicy): _58.EventCreateGroupPolicyProtoMsg;
            };
            EventUpdateGroupPolicy: {
                typeUrl: string;
                encode(message: _58.EventUpdateGroupPolicy, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventUpdateGroupPolicy;
                fromJSON(object: any): _58.EventUpdateGroupPolicy;
                toJSON(message: _58.EventUpdateGroupPolicy): import("../json-safe.js").JsonSafe<_58.EventUpdateGroupPolicy>;
                fromPartial(object: Partial<_58.EventUpdateGroupPolicy>): _58.EventUpdateGroupPolicy;
                fromProtoMsg(message: _58.EventUpdateGroupPolicyProtoMsg): _58.EventUpdateGroupPolicy;
                toProto(message: _58.EventUpdateGroupPolicy): Uint8Array;
                toProtoMsg(message: _58.EventUpdateGroupPolicy): _58.EventUpdateGroupPolicyProtoMsg;
            };
            EventSubmitProposal: {
                typeUrl: string;
                encode(message: _58.EventSubmitProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventSubmitProposal;
                fromJSON(object: any): _58.EventSubmitProposal;
                toJSON(message: _58.EventSubmitProposal): import("../json-safe.js").JsonSafe<_58.EventSubmitProposal>;
                fromPartial(object: Partial<_58.EventSubmitProposal>): _58.EventSubmitProposal;
                fromProtoMsg(message: _58.EventSubmitProposalProtoMsg): _58.EventSubmitProposal;
                toProto(message: _58.EventSubmitProposal): Uint8Array;
                toProtoMsg(message: _58.EventSubmitProposal): _58.EventSubmitProposalProtoMsg;
            };
            EventWithdrawProposal: {
                typeUrl: string;
                encode(message: _58.EventWithdrawProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventWithdrawProposal;
                fromJSON(object: any): _58.EventWithdrawProposal;
                toJSON(message: _58.EventWithdrawProposal): import("../json-safe.js").JsonSafe<_58.EventWithdrawProposal>;
                fromPartial(object: Partial<_58.EventWithdrawProposal>): _58.EventWithdrawProposal;
                fromProtoMsg(message: _58.EventWithdrawProposalProtoMsg): _58.EventWithdrawProposal;
                toProto(message: _58.EventWithdrawProposal): Uint8Array;
                toProtoMsg(message: _58.EventWithdrawProposal): _58.EventWithdrawProposalProtoMsg;
            };
            EventVote: {
                typeUrl: string;
                encode(message: _58.EventVote, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventVote;
                fromJSON(object: any): _58.EventVote;
                toJSON(message: _58.EventVote): import("../json-safe.js").JsonSafe<_58.EventVote>;
                fromPartial(object: Partial<_58.EventVote>): _58.EventVote;
                fromProtoMsg(message: _58.EventVoteProtoMsg): _58.EventVote;
                toProto(message: _58.EventVote): Uint8Array;
                toProtoMsg(message: _58.EventVote): _58.EventVoteProtoMsg;
            };
            EventExec: {
                typeUrl: string;
                encode(message: _58.EventExec, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventExec;
                fromJSON(object: any): _58.EventExec;
                toJSON(message: _58.EventExec): import("../json-safe.js").JsonSafe<_58.EventExec>;
                fromPartial(object: Partial<_58.EventExec>): _58.EventExec;
                fromProtoMsg(message: _58.EventExecProtoMsg): _58.EventExec;
                toProto(message: _58.EventExec): Uint8Array;
                toProtoMsg(message: _58.EventExec): _58.EventExecProtoMsg;
            };
            EventLeaveGroup: {
                typeUrl: string;
                encode(message: _58.EventLeaveGroup, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventLeaveGroup;
                fromJSON(object: any): _58.EventLeaveGroup;
                toJSON(message: _58.EventLeaveGroup): import("../json-safe.js").JsonSafe<_58.EventLeaveGroup>;
                fromPartial(object: Partial<_58.EventLeaveGroup>): _58.EventLeaveGroup;
                fromProtoMsg(message: _58.EventLeaveGroupProtoMsg): _58.EventLeaveGroup;
                toProto(message: _58.EventLeaveGroup): Uint8Array;
                toProtoMsg(message: _58.EventLeaveGroup): _58.EventLeaveGroupProtoMsg;
            };
            EventProposalPruned: {
                typeUrl: string;
                encode(message: _58.EventProposalPruned, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _58.EventProposalPruned;
                fromJSON(object: any): _58.EventProposalPruned;
                toJSON(message: _58.EventProposalPruned): import("../json-safe.js").JsonSafe<_58.EventProposalPruned>;
                fromPartial(object: Partial<_58.EventProposalPruned>): _58.EventProposalPruned;
                fromProtoMsg(message: _58.EventProposalPrunedProtoMsg): _58.EventProposalPruned;
                toProto(message: _58.EventProposalPruned): Uint8Array;
                toProtoMsg(message: _58.EventProposalPruned): _58.EventProposalPrunedProtoMsg;
            };
        };
    }
    namespace mint {
        const v1beta1: {
            QueryParamsRequest: {
                typeUrl: string;
                encode(_: _65.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryParamsRequest;
                fromJSON(_: any): _65.QueryParamsRequest;
                toJSON(_: _65.QueryParamsRequest): import("../json-safe.js").JsonSafe<_65.QueryParamsRequest>;
                fromPartial(_: Partial<_65.QueryParamsRequest>): _65.QueryParamsRequest;
                fromProtoMsg(message: _65.QueryParamsRequestProtoMsg): _65.QueryParamsRequest;
                toProto(message: _65.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _65.QueryParamsRequest): _65.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _65.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryParamsResponse;
                fromJSON(object: any): _65.QueryParamsResponse;
                toJSON(message: _65.QueryParamsResponse): import("../json-safe.js").JsonSafe<_65.QueryParamsResponse>;
                fromPartial(object: Partial<_65.QueryParamsResponse>): _65.QueryParamsResponse;
                fromProtoMsg(message: _65.QueryParamsResponseProtoMsg): _65.QueryParamsResponse;
                toProto(message: _65.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _65.QueryParamsResponse): _65.QueryParamsResponseProtoMsg;
            };
            QueryInflationRequest: {
                typeUrl: string;
                encode(_: _65.QueryInflationRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryInflationRequest;
                fromJSON(_: any): _65.QueryInflationRequest;
                toJSON(_: _65.QueryInflationRequest): import("../json-safe.js").JsonSafe<_65.QueryInflationRequest>;
                fromPartial(_: Partial<_65.QueryInflationRequest>): _65.QueryInflationRequest;
                fromProtoMsg(message: _65.QueryInflationRequestProtoMsg): _65.QueryInflationRequest;
                toProto(message: _65.QueryInflationRequest): Uint8Array;
                toProtoMsg(message: _65.QueryInflationRequest): _65.QueryInflationRequestProtoMsg;
            };
            QueryInflationResponse: {
                typeUrl: string;
                encode(message: _65.QueryInflationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryInflationResponse;
                fromJSON(object: any): _65.QueryInflationResponse;
                toJSON(message: _65.QueryInflationResponse): import("../json-safe.js").JsonSafe<_65.QueryInflationResponse>;
                fromPartial(object: Partial<_65.QueryInflationResponse>): _65.QueryInflationResponse;
                fromProtoMsg(message: _65.QueryInflationResponseProtoMsg): _65.QueryInflationResponse;
                toProto(message: _65.QueryInflationResponse): Uint8Array;
                toProtoMsg(message: _65.QueryInflationResponse): _65.QueryInflationResponseProtoMsg;
            };
            QueryAnnualProvisionsRequest: {
                typeUrl: string;
                encode(_: _65.QueryAnnualProvisionsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryAnnualProvisionsRequest;
                fromJSON(_: any): _65.QueryAnnualProvisionsRequest;
                toJSON(_: _65.QueryAnnualProvisionsRequest): import("../json-safe.js").JsonSafe<_65.QueryAnnualProvisionsRequest>;
                fromPartial(_: Partial<_65.QueryAnnualProvisionsRequest>): _65.QueryAnnualProvisionsRequest;
                fromProtoMsg(message: _65.QueryAnnualProvisionsRequestProtoMsg): _65.QueryAnnualProvisionsRequest;
                toProto(message: _65.QueryAnnualProvisionsRequest): Uint8Array;
                toProtoMsg(message: _65.QueryAnnualProvisionsRequest): _65.QueryAnnualProvisionsRequestProtoMsg;
            };
            QueryAnnualProvisionsResponse: {
                typeUrl: string;
                encode(message: _65.QueryAnnualProvisionsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _65.QueryAnnualProvisionsResponse;
                fromJSON(object: any): _65.QueryAnnualProvisionsResponse;
                toJSON(message: _65.QueryAnnualProvisionsResponse): import("../json-safe.js").JsonSafe<_65.QueryAnnualProvisionsResponse>;
                fromPartial(object: Partial<_65.QueryAnnualProvisionsResponse>): _65.QueryAnnualProvisionsResponse;
                fromProtoMsg(message: _65.QueryAnnualProvisionsResponseProtoMsg): _65.QueryAnnualProvisionsResponse;
                toProto(message: _65.QueryAnnualProvisionsResponse): Uint8Array;
                toProtoMsg(message: _65.QueryAnnualProvisionsResponse): _65.QueryAnnualProvisionsResponseProtoMsg;
            };
            Minter: {
                typeUrl: string;
                encode(message: _64.Minter, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _64.Minter;
                fromJSON(object: any): _64.Minter;
                toJSON(message: _64.Minter): import("../json-safe.js").JsonSafe<_64.Minter>;
                fromPartial(object: Partial<_64.Minter>): _64.Minter;
                fromProtoMsg(message: _64.MinterProtoMsg): _64.Minter;
                toProto(message: _64.Minter): Uint8Array;
                toProtoMsg(message: _64.Minter): _64.MinterProtoMsg;
            };
            Params: {
                typeUrl: string;
                encode(message: _64.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _64.Params;
                fromJSON(object: any): _64.Params;
                toJSON(message: _64.Params): import("../json-safe.js").JsonSafe<_64.Params>;
                fromPartial(object: Partial<_64.Params>): _64.Params;
                fromProtoMsg(message: _64.ParamsProtoMsg): _64.Params;
                toProto(message: _64.Params): Uint8Array;
                toProtoMsg(message: _64.Params): _64.ParamsProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _63.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _63.GenesisState;
                fromJSON(object: any): _63.GenesisState;
                toJSON(message: _63.GenesisState): import("../json-safe.js").JsonSafe<_63.GenesisState>;
                fromPartial(object: Partial<_63.GenesisState>): _63.GenesisState;
                fromProtoMsg(message: _63.GenesisStateProtoMsg): _63.GenesisState;
                toProto(message: _63.GenesisState): Uint8Array;
                toProtoMsg(message: _63.GenesisState): _63.GenesisStateProtoMsg;
            };
        };
    }
    namespace params {
        const v1beta1: {
            QueryParamsRequest: {
                typeUrl: string;
                encode(message: _67.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _67.QueryParamsRequest;
                fromJSON(object: any): _67.QueryParamsRequest;
                toJSON(message: _67.QueryParamsRequest): import("../json-safe.js").JsonSafe<_67.QueryParamsRequest>;
                fromPartial(object: Partial<_67.QueryParamsRequest>): _67.QueryParamsRequest;
                fromProtoMsg(message: _67.QueryParamsRequestProtoMsg): _67.QueryParamsRequest;
                toProto(message: _67.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _67.QueryParamsRequest): _67.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _67.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _67.QueryParamsResponse;
                fromJSON(object: any): _67.QueryParamsResponse;
                toJSON(message: _67.QueryParamsResponse): import("../json-safe.js").JsonSafe<_67.QueryParamsResponse>;
                fromPartial(object: Partial<_67.QueryParamsResponse>): _67.QueryParamsResponse;
                fromProtoMsg(message: _67.QueryParamsResponseProtoMsg): _67.QueryParamsResponse;
                toProto(message: _67.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _67.QueryParamsResponse): _67.QueryParamsResponseProtoMsg;
            };
            QuerySubspacesRequest: {
                typeUrl: string;
                encode(_: _67.QuerySubspacesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _67.QuerySubspacesRequest;
                fromJSON(_: any): _67.QuerySubspacesRequest;
                toJSON(_: _67.QuerySubspacesRequest): import("../json-safe.js").JsonSafe<_67.QuerySubspacesRequest>;
                fromPartial(_: Partial<_67.QuerySubspacesRequest>): _67.QuerySubspacesRequest;
                fromProtoMsg(message: _67.QuerySubspacesRequestProtoMsg): _67.QuerySubspacesRequest;
                toProto(message: _67.QuerySubspacesRequest): Uint8Array;
                toProtoMsg(message: _67.QuerySubspacesRequest): _67.QuerySubspacesRequestProtoMsg;
            };
            QuerySubspacesResponse: {
                typeUrl: string;
                encode(message: _67.QuerySubspacesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _67.QuerySubspacesResponse;
                fromJSON(object: any): _67.QuerySubspacesResponse;
                toJSON(message: _67.QuerySubspacesResponse): import("../json-safe.js").JsonSafe<_67.QuerySubspacesResponse>;
                fromPartial(object: Partial<_67.QuerySubspacesResponse>): _67.QuerySubspacesResponse;
                fromProtoMsg(message: _67.QuerySubspacesResponseProtoMsg): _67.QuerySubspacesResponse;
                toProto(message: _67.QuerySubspacesResponse): Uint8Array;
                toProtoMsg(message: _67.QuerySubspacesResponse): _67.QuerySubspacesResponseProtoMsg;
            };
            Subspace: {
                typeUrl: string;
                encode(message: _67.Subspace, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _67.Subspace;
                fromJSON(object: any): _67.Subspace;
                toJSON(message: _67.Subspace): import("../json-safe.js").JsonSafe<_67.Subspace>;
                fromPartial(object: Partial<_67.Subspace>): _67.Subspace;
                fromProtoMsg(message: _67.SubspaceProtoMsg): _67.Subspace;
                toProto(message: _67.Subspace): Uint8Array;
                toProtoMsg(message: _67.Subspace): _67.SubspaceProtoMsg;
            };
            ParameterChangeProposal: {
                typeUrl: string;
                encode(message: _66.ParameterChangeProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _66.ParameterChangeProposal;
                fromJSON(object: any): _66.ParameterChangeProposal;
                toJSON(message: _66.ParameterChangeProposal): import("../json-safe.js").JsonSafe<_66.ParameterChangeProposal>;
                fromPartial(object: Partial<_66.ParameterChangeProposal>): _66.ParameterChangeProposal;
                fromProtoMsg(message: _66.ParameterChangeProposalProtoMsg): _66.ParameterChangeProposal;
                toProto(message: _66.ParameterChangeProposal): Uint8Array;
                toProtoMsg(message: _66.ParameterChangeProposal): _66.ParameterChangeProposalProtoMsg;
            };
            ParamChange: {
                typeUrl: string;
                encode(message: _66.ParamChange, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _66.ParamChange;
                fromJSON(object: any): _66.ParamChange;
                toJSON(message: _66.ParamChange): import("../json-safe.js").JsonSafe<_66.ParamChange>;
                fromPartial(object: Partial<_66.ParamChange>): _66.ParamChange;
                fromProtoMsg(message: _66.ParamChangeProtoMsg): _66.ParamChange;
                toProto(message: _66.ParamChange): Uint8Array;
                toProtoMsg(message: _66.ParamChange): _66.ParamChangeProtoMsg;
            };
        };
    }
    namespace staking {
        const v1beta1: {
            MsgCreateValidator: {
                typeUrl: string;
                encode(message: _72.MsgCreateValidator, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgCreateValidator;
                fromJSON(object: any): _72.MsgCreateValidator;
                toJSON(message: _72.MsgCreateValidator): import("../json-safe.js").JsonSafe<_72.MsgCreateValidator>;
                fromPartial(object: Partial<_72.MsgCreateValidator>): _72.MsgCreateValidator;
                fromProtoMsg(message: _72.MsgCreateValidatorProtoMsg): _72.MsgCreateValidator;
                toProto(message: _72.MsgCreateValidator): Uint8Array;
                toProtoMsg(message: _72.MsgCreateValidator): _72.MsgCreateValidatorProtoMsg;
            };
            MsgCreateValidatorResponse: {
                typeUrl: string;
                encode(_: _72.MsgCreateValidatorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgCreateValidatorResponse;
                fromJSON(_: any): _72.MsgCreateValidatorResponse;
                toJSON(_: _72.MsgCreateValidatorResponse): import("../json-safe.js").JsonSafe<_72.MsgCreateValidatorResponse>;
                fromPartial(_: Partial<_72.MsgCreateValidatorResponse>): _72.MsgCreateValidatorResponse;
                fromProtoMsg(message: _72.MsgCreateValidatorResponseProtoMsg): _72.MsgCreateValidatorResponse;
                toProto(message: _72.MsgCreateValidatorResponse): Uint8Array;
                toProtoMsg(message: _72.MsgCreateValidatorResponse): _72.MsgCreateValidatorResponseProtoMsg;
            };
            MsgEditValidator: {
                typeUrl: string;
                encode(message: _72.MsgEditValidator, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgEditValidator;
                fromJSON(object: any): _72.MsgEditValidator;
                toJSON(message: _72.MsgEditValidator): import("../json-safe.js").JsonSafe<_72.MsgEditValidator>;
                fromPartial(object: Partial<_72.MsgEditValidator>): _72.MsgEditValidator;
                fromProtoMsg(message: _72.MsgEditValidatorProtoMsg): _72.MsgEditValidator;
                toProto(message: _72.MsgEditValidator): Uint8Array;
                toProtoMsg(message: _72.MsgEditValidator): _72.MsgEditValidatorProtoMsg;
            };
            MsgEditValidatorResponse: {
                typeUrl: string;
                encode(_: _72.MsgEditValidatorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgEditValidatorResponse;
                fromJSON(_: any): _72.MsgEditValidatorResponse;
                toJSON(_: _72.MsgEditValidatorResponse): import("../json-safe.js").JsonSafe<_72.MsgEditValidatorResponse>;
                fromPartial(_: Partial<_72.MsgEditValidatorResponse>): _72.MsgEditValidatorResponse;
                fromProtoMsg(message: _72.MsgEditValidatorResponseProtoMsg): _72.MsgEditValidatorResponse;
                toProto(message: _72.MsgEditValidatorResponse): Uint8Array;
                toProtoMsg(message: _72.MsgEditValidatorResponse): _72.MsgEditValidatorResponseProtoMsg;
            };
            MsgDelegate: {
                typeUrl: string;
                encode(message: _72.MsgDelegate, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgDelegate;
                fromJSON(object: any): _72.MsgDelegate;
                toJSON(message: _72.MsgDelegate): import("../json-safe.js").JsonSafe<_72.MsgDelegate>;
                fromPartial(object: Partial<_72.MsgDelegate>): _72.MsgDelegate;
                fromProtoMsg(message: _72.MsgDelegateProtoMsg): _72.MsgDelegate;
                toProto(message: _72.MsgDelegate): Uint8Array;
                toProtoMsg(message: _72.MsgDelegate): _72.MsgDelegateProtoMsg;
            };
            MsgDelegateResponse: {
                typeUrl: string;
                encode(_: _72.MsgDelegateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgDelegateResponse;
                fromJSON(_: any): _72.MsgDelegateResponse;
                toJSON(_: _72.MsgDelegateResponse): import("../json-safe.js").JsonSafe<_72.MsgDelegateResponse>;
                fromPartial(_: Partial<_72.MsgDelegateResponse>): _72.MsgDelegateResponse;
                fromProtoMsg(message: _72.MsgDelegateResponseProtoMsg): _72.MsgDelegateResponse;
                toProto(message: _72.MsgDelegateResponse): Uint8Array;
                toProtoMsg(message: _72.MsgDelegateResponse): _72.MsgDelegateResponseProtoMsg;
            };
            MsgBeginRedelegate: {
                typeUrl: string;
                encode(message: _72.MsgBeginRedelegate, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgBeginRedelegate;
                fromJSON(object: any): _72.MsgBeginRedelegate;
                toJSON(message: _72.MsgBeginRedelegate): import("../json-safe.js").JsonSafe<_72.MsgBeginRedelegate>;
                fromPartial(object: Partial<_72.MsgBeginRedelegate>): _72.MsgBeginRedelegate;
                fromProtoMsg(message: _72.MsgBeginRedelegateProtoMsg): _72.MsgBeginRedelegate;
                toProto(message: _72.MsgBeginRedelegate): Uint8Array;
                toProtoMsg(message: _72.MsgBeginRedelegate): _72.MsgBeginRedelegateProtoMsg;
            };
            MsgBeginRedelegateResponse: {
                typeUrl: string;
                encode(message: _72.MsgBeginRedelegateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgBeginRedelegateResponse;
                fromJSON(object: any): _72.MsgBeginRedelegateResponse;
                toJSON(message: _72.MsgBeginRedelegateResponse): import("../json-safe.js").JsonSafe<_72.MsgBeginRedelegateResponse>;
                fromPartial(object: Partial<_72.MsgBeginRedelegateResponse>): _72.MsgBeginRedelegateResponse;
                fromProtoMsg(message: _72.MsgBeginRedelegateResponseProtoMsg): _72.MsgBeginRedelegateResponse;
                toProto(message: _72.MsgBeginRedelegateResponse): Uint8Array;
                toProtoMsg(message: _72.MsgBeginRedelegateResponse): _72.MsgBeginRedelegateResponseProtoMsg;
            };
            MsgUndelegate: {
                typeUrl: string;
                encode(message: _72.MsgUndelegate, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgUndelegate;
                fromJSON(object: any): _72.MsgUndelegate;
                toJSON(message: _72.MsgUndelegate): import("../json-safe.js").JsonSafe<_72.MsgUndelegate>;
                fromPartial(object: Partial<_72.MsgUndelegate>): _72.MsgUndelegate;
                fromProtoMsg(message: _72.MsgUndelegateProtoMsg): _72.MsgUndelegate;
                toProto(message: _72.MsgUndelegate): Uint8Array;
                toProtoMsg(message: _72.MsgUndelegate): _72.MsgUndelegateProtoMsg;
            };
            MsgUndelegateResponse: {
                typeUrl: string;
                encode(message: _72.MsgUndelegateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgUndelegateResponse;
                fromJSON(object: any): _72.MsgUndelegateResponse;
                toJSON(message: _72.MsgUndelegateResponse): import("../json-safe.js").JsonSafe<_72.MsgUndelegateResponse>;
                fromPartial(object: Partial<_72.MsgUndelegateResponse>): _72.MsgUndelegateResponse;
                fromProtoMsg(message: _72.MsgUndelegateResponseProtoMsg): _72.MsgUndelegateResponse;
                toProto(message: _72.MsgUndelegateResponse): Uint8Array;
                toProtoMsg(message: _72.MsgUndelegateResponse): _72.MsgUndelegateResponseProtoMsg;
            };
            MsgCancelUnbondingDelegation: {
                typeUrl: string;
                encode(message: _72.MsgCancelUnbondingDelegation, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgCancelUnbondingDelegation;
                fromJSON(object: any): _72.MsgCancelUnbondingDelegation;
                toJSON(message: _72.MsgCancelUnbondingDelegation): import("../json-safe.js").JsonSafe<_72.MsgCancelUnbondingDelegation>;
                fromPartial(object: Partial<_72.MsgCancelUnbondingDelegation>): _72.MsgCancelUnbondingDelegation;
                fromProtoMsg(message: _72.MsgCancelUnbondingDelegationProtoMsg): _72.MsgCancelUnbondingDelegation;
                toProto(message: _72.MsgCancelUnbondingDelegation): Uint8Array;
                toProtoMsg(message: _72.MsgCancelUnbondingDelegation): _72.MsgCancelUnbondingDelegationProtoMsg;
            };
            MsgCancelUnbondingDelegationResponse: {
                typeUrl: string;
                encode(_: _72.MsgCancelUnbondingDelegationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _72.MsgCancelUnbondingDelegationResponse;
                fromJSON(_: any): _72.MsgCancelUnbondingDelegationResponse;
                toJSON(_: _72.MsgCancelUnbondingDelegationResponse): import("../json-safe.js").JsonSafe<_72.MsgCancelUnbondingDelegationResponse>;
                fromPartial(_: Partial<_72.MsgCancelUnbondingDelegationResponse>): _72.MsgCancelUnbondingDelegationResponse;
                fromProtoMsg(message: _72.MsgCancelUnbondingDelegationResponseProtoMsg): _72.MsgCancelUnbondingDelegationResponse;
                toProto(message: _72.MsgCancelUnbondingDelegationResponse): Uint8Array;
                toProtoMsg(message: _72.MsgCancelUnbondingDelegationResponse): _72.MsgCancelUnbondingDelegationResponseProtoMsg;
            };
            Cosmos_cryptoPubKey_InterfaceDecoder: (input: import("../binary.js").BinaryReader | Uint8Array) => import("../google/protobuf/any.js").Any;
            bondStatusFromJSON(object: any): _71.BondStatus;
            bondStatusToJSON(object: _71.BondStatus): string;
            BondStatus: typeof _71.BondStatus;
            BondStatusSDKType: typeof _71.BondStatus;
            HistoricalInfo: {
                typeUrl: string;
                encode(message: _71.HistoricalInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.HistoricalInfo;
                fromJSON(object: any): _71.HistoricalInfo;
                toJSON(message: _71.HistoricalInfo): import("../json-safe.js").JsonSafe<_71.HistoricalInfo>;
                fromPartial(object: Partial<_71.HistoricalInfo>): _71.HistoricalInfo;
                fromProtoMsg(message: _71.HistoricalInfoProtoMsg): _71.HistoricalInfo;
                toProto(message: _71.HistoricalInfo): Uint8Array;
                toProtoMsg(message: _71.HistoricalInfo): _71.HistoricalInfoProtoMsg;
            };
            CommissionRates: {
                typeUrl: string;
                encode(message: _71.CommissionRates, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.CommissionRates;
                fromJSON(object: any): _71.CommissionRates;
                toJSON(message: _71.CommissionRates): import("../json-safe.js").JsonSafe<_71.CommissionRates>;
                fromPartial(object: Partial<_71.CommissionRates>): _71.CommissionRates;
                fromProtoMsg(message: _71.CommissionRatesProtoMsg): _71.CommissionRates;
                toProto(message: _71.CommissionRates): Uint8Array;
                toProtoMsg(message: _71.CommissionRates): _71.CommissionRatesProtoMsg;
            };
            Commission: {
                typeUrl: string;
                encode(message: _71.Commission, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Commission;
                fromJSON(object: any): _71.Commission;
                toJSON(message: _71.Commission): import("../json-safe.js").JsonSafe<_71.Commission>;
                fromPartial(object: Partial<_71.Commission>): _71.Commission;
                fromProtoMsg(message: _71.CommissionProtoMsg): _71.Commission;
                toProto(message: _71.Commission): Uint8Array;
                toProtoMsg(message: _71.Commission): _71.CommissionProtoMsg;
            };
            Description: {
                typeUrl: string;
                encode(message: _71.Description, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Description;
                fromJSON(object: any): _71.Description;
                toJSON(message: _71.Description): import("../json-safe.js").JsonSafe<_71.Description>;
                fromPartial(object: Partial<_71.Description>): _71.Description;
                fromProtoMsg(message: _71.DescriptionProtoMsg): _71.Description;
                toProto(message: _71.Description): Uint8Array;
                toProtoMsg(message: _71.Description): _71.DescriptionProtoMsg;
            };
            Validator: {
                typeUrl: string;
                encode(message: _71.Validator, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Validator;
                fromJSON(object: any): _71.Validator;
                toJSON(message: _71.Validator): import("../json-safe.js").JsonSafe<_71.Validator>;
                fromPartial(object: Partial<_71.Validator>): _71.Validator;
                fromProtoMsg(message: _71.ValidatorProtoMsg): _71.Validator;
                toProto(message: _71.Validator): Uint8Array;
                toProtoMsg(message: _71.Validator): _71.ValidatorProtoMsg;
            };
            ValAddresses: {
                typeUrl: string;
                encode(message: _71.ValAddresses, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.ValAddresses;
                fromJSON(object: any): _71.ValAddresses;
                toJSON(message: _71.ValAddresses): import("../json-safe.js").JsonSafe<_71.ValAddresses>;
                fromPartial(object: Partial<_71.ValAddresses>): _71.ValAddresses;
                fromProtoMsg(message: _71.ValAddressesProtoMsg): _71.ValAddresses;
                toProto(message: _71.ValAddresses): Uint8Array;
                toProtoMsg(message: _71.ValAddresses): _71.ValAddressesProtoMsg;
            };
            DVPair: {
                typeUrl: string;
                encode(message: _71.DVPair, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.DVPair;
                fromJSON(object: any): _71.DVPair;
                toJSON(message: _71.DVPair): import("../json-safe.js").JsonSafe<_71.DVPair>;
                fromPartial(object: Partial<_71.DVPair>): _71.DVPair;
                fromProtoMsg(message: _71.DVPairProtoMsg): _71.DVPair;
                toProto(message: _71.DVPair): Uint8Array;
                toProtoMsg(message: _71.DVPair): _71.DVPairProtoMsg;
            };
            DVPairs: {
                typeUrl: string;
                encode(message: _71.DVPairs, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.DVPairs;
                fromJSON(object: any): _71.DVPairs;
                toJSON(message: _71.DVPairs): import("../json-safe.js").JsonSafe<_71.DVPairs>;
                fromPartial(object: Partial<_71.DVPairs>): _71.DVPairs;
                fromProtoMsg(message: _71.DVPairsProtoMsg): _71.DVPairs;
                toProto(message: _71.DVPairs): Uint8Array;
                toProtoMsg(message: _71.DVPairs): _71.DVPairsProtoMsg;
            };
            DVVTriplet: {
                typeUrl: string;
                encode(message: _71.DVVTriplet, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.DVVTriplet;
                fromJSON(object: any): _71.DVVTriplet;
                toJSON(message: _71.DVVTriplet): import("../json-safe.js").JsonSafe<_71.DVVTriplet>;
                fromPartial(object: Partial<_71.DVVTriplet>): _71.DVVTriplet;
                fromProtoMsg(message: _71.DVVTripletProtoMsg): _71.DVVTriplet;
                toProto(message: _71.DVVTriplet): Uint8Array;
                toProtoMsg(message: _71.DVVTriplet): _71.DVVTripletProtoMsg;
            };
            DVVTriplets: {
                typeUrl: string;
                encode(message: _71.DVVTriplets, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.DVVTriplets;
                fromJSON(object: any): _71.DVVTriplets;
                toJSON(message: _71.DVVTriplets): import("../json-safe.js").JsonSafe<_71.DVVTriplets>;
                fromPartial(object: Partial<_71.DVVTriplets>): _71.DVVTriplets;
                fromProtoMsg(message: _71.DVVTripletsProtoMsg): _71.DVVTriplets;
                toProto(message: _71.DVVTriplets): Uint8Array;
                toProtoMsg(message: _71.DVVTriplets): _71.DVVTripletsProtoMsg;
            };
            Delegation: {
                typeUrl: string;
                encode(message: _71.Delegation, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Delegation;
                fromJSON(object: any): _71.Delegation;
                toJSON(message: _71.Delegation): import("../json-safe.js").JsonSafe<_71.Delegation>;
                fromPartial(object: Partial<_71.Delegation>): _71.Delegation;
                fromProtoMsg(message: _71.DelegationProtoMsg): _71.Delegation;
                toProto(message: _71.Delegation): Uint8Array;
                toProtoMsg(message: _71.Delegation): _71.DelegationProtoMsg;
            };
            UnbondingDelegation: {
                typeUrl: string;
                encode(message: _71.UnbondingDelegation, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.UnbondingDelegation;
                fromJSON(object: any): _71.UnbondingDelegation;
                toJSON(message: _71.UnbondingDelegation): import("../json-safe.js").JsonSafe<_71.UnbondingDelegation>;
                fromPartial(object: Partial<_71.UnbondingDelegation>): _71.UnbondingDelegation;
                fromProtoMsg(message: _71.UnbondingDelegationProtoMsg): _71.UnbondingDelegation;
                toProto(message: _71.UnbondingDelegation): Uint8Array;
                toProtoMsg(message: _71.UnbondingDelegation): _71.UnbondingDelegationProtoMsg;
            };
            UnbondingDelegationEntry: {
                typeUrl: string;
                encode(message: _71.UnbondingDelegationEntry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.UnbondingDelegationEntry;
                fromJSON(object: any): _71.UnbondingDelegationEntry;
                toJSON(message: _71.UnbondingDelegationEntry): import("../json-safe.js").JsonSafe<_71.UnbondingDelegationEntry>;
                fromPartial(object: Partial<_71.UnbondingDelegationEntry>): _71.UnbondingDelegationEntry;
                fromProtoMsg(message: _71.UnbondingDelegationEntryProtoMsg): _71.UnbondingDelegationEntry;
                toProto(message: _71.UnbondingDelegationEntry): Uint8Array;
                toProtoMsg(message: _71.UnbondingDelegationEntry): _71.UnbondingDelegationEntryProtoMsg;
            };
            RedelegationEntry: {
                typeUrl: string;
                encode(message: _71.RedelegationEntry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.RedelegationEntry;
                fromJSON(object: any): _71.RedelegationEntry;
                toJSON(message: _71.RedelegationEntry): import("../json-safe.js").JsonSafe<_71.RedelegationEntry>;
                fromPartial(object: Partial<_71.RedelegationEntry>): _71.RedelegationEntry;
                fromProtoMsg(message: _71.RedelegationEntryProtoMsg): _71.RedelegationEntry;
                toProto(message: _71.RedelegationEntry): Uint8Array;
                toProtoMsg(message: _71.RedelegationEntry): _71.RedelegationEntryProtoMsg;
            };
            Redelegation: {
                typeUrl: string;
                encode(message: _71.Redelegation, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Redelegation;
                fromJSON(object: any): _71.Redelegation;
                toJSON(message: _71.Redelegation): import("../json-safe.js").JsonSafe<_71.Redelegation>;
                fromPartial(object: Partial<_71.Redelegation>): _71.Redelegation;
                fromProtoMsg(message: _71.RedelegationProtoMsg): _71.Redelegation;
                toProto(message: _71.Redelegation): Uint8Array;
                toProtoMsg(message: _71.Redelegation): _71.RedelegationProtoMsg;
            };
            Params: {
                typeUrl: string;
                encode(message: _71.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Params;
                fromJSON(object: any): _71.Params;
                toJSON(message: _71.Params): import("../json-safe.js").JsonSafe<_71.Params>;
                fromPartial(object: Partial<_71.Params>): _71.Params;
                fromProtoMsg(message: _71.ParamsProtoMsg): _71.Params;
                toProto(message: _71.Params): Uint8Array;
                toProtoMsg(message: _71.Params): _71.ParamsProtoMsg;
            };
            DelegationResponse: {
                typeUrl: string;
                encode(message: _71.DelegationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.DelegationResponse;
                fromJSON(object: any): _71.DelegationResponse;
                toJSON(message: _71.DelegationResponse): import("../json-safe.js").JsonSafe<_71.DelegationResponse>;
                fromPartial(object: Partial<_71.DelegationResponse>): _71.DelegationResponse;
                fromProtoMsg(message: _71.DelegationResponseProtoMsg): _71.DelegationResponse;
                toProto(message: _71.DelegationResponse): Uint8Array;
                toProtoMsg(message: _71.DelegationResponse): _71.DelegationResponseProtoMsg;
            };
            RedelegationEntryResponse: {
                typeUrl: string;
                encode(message: _71.RedelegationEntryResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.RedelegationEntryResponse;
                fromJSON(object: any): _71.RedelegationEntryResponse;
                toJSON(message: _71.RedelegationEntryResponse): import("../json-safe.js").JsonSafe<_71.RedelegationEntryResponse>;
                fromPartial(object: Partial<_71.RedelegationEntryResponse>): _71.RedelegationEntryResponse;
                fromProtoMsg(message: _71.RedelegationEntryResponseProtoMsg): _71.RedelegationEntryResponse;
                toProto(message: _71.RedelegationEntryResponse): Uint8Array;
                toProtoMsg(message: _71.RedelegationEntryResponse): _71.RedelegationEntryResponseProtoMsg;
            };
            RedelegationResponse: {
                typeUrl: string;
                encode(message: _71.RedelegationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.RedelegationResponse;
                fromJSON(object: any): _71.RedelegationResponse;
                toJSON(message: _71.RedelegationResponse): import("../json-safe.js").JsonSafe<_71.RedelegationResponse>;
                fromPartial(object: Partial<_71.RedelegationResponse>): _71.RedelegationResponse;
                fromProtoMsg(message: _71.RedelegationResponseProtoMsg): _71.RedelegationResponse;
                toProto(message: _71.RedelegationResponse): Uint8Array;
                toProtoMsg(message: _71.RedelegationResponse): _71.RedelegationResponseProtoMsg;
            };
            Pool: {
                typeUrl: string;
                encode(message: _71.Pool, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _71.Pool;
                fromJSON(object: any): _71.Pool;
                toJSON(message: _71.Pool): import("../json-safe.js").JsonSafe<_71.Pool>;
                fromPartial(object: Partial<_71.Pool>): _71.Pool;
                fromProtoMsg(message: _71.PoolProtoMsg): _71.Pool;
                toProto(message: _71.Pool): Uint8Array;
                toProtoMsg(message: _71.Pool): _71.PoolProtoMsg;
            };
            QueryValidatorsRequest: {
                typeUrl: string;
                encode(message: _70.QueryValidatorsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorsRequest;
                fromJSON(object: any): _70.QueryValidatorsRequest;
                toJSON(message: _70.QueryValidatorsRequest): import("../json-safe.js").JsonSafe<_70.QueryValidatorsRequest>;
                fromPartial(object: Partial<_70.QueryValidatorsRequest>): _70.QueryValidatorsRequest;
                fromProtoMsg(message: _70.QueryValidatorsRequestProtoMsg): _70.QueryValidatorsRequest;
                toProto(message: _70.QueryValidatorsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorsRequest): _70.QueryValidatorsRequestProtoMsg;
            };
            QueryValidatorsResponse: {
                typeUrl: string;
                encode(message: _70.QueryValidatorsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorsResponse;
                fromJSON(object: any): _70.QueryValidatorsResponse;
                toJSON(message: _70.QueryValidatorsResponse): import("../json-safe.js").JsonSafe<_70.QueryValidatorsResponse>;
                fromPartial(object: Partial<_70.QueryValidatorsResponse>): _70.QueryValidatorsResponse;
                fromProtoMsg(message: _70.QueryValidatorsResponseProtoMsg): _70.QueryValidatorsResponse;
                toProto(message: _70.QueryValidatorsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorsResponse): _70.QueryValidatorsResponseProtoMsg;
            };
            QueryValidatorRequest: {
                typeUrl: string;
                encode(message: _70.QueryValidatorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorRequest;
                fromJSON(object: any): _70.QueryValidatorRequest;
                toJSON(message: _70.QueryValidatorRequest): import("../json-safe.js").JsonSafe<_70.QueryValidatorRequest>;
                fromPartial(object: Partial<_70.QueryValidatorRequest>): _70.QueryValidatorRequest;
                fromProtoMsg(message: _70.QueryValidatorRequestProtoMsg): _70.QueryValidatorRequest;
                toProto(message: _70.QueryValidatorRequest): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorRequest): _70.QueryValidatorRequestProtoMsg;
            };
            QueryValidatorResponse: {
                typeUrl: string;
                encode(message: _70.QueryValidatorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorResponse;
                fromJSON(object: any): _70.QueryValidatorResponse;
                toJSON(message: _70.QueryValidatorResponse): import("../json-safe.js").JsonSafe<_70.QueryValidatorResponse>;
                fromPartial(object: Partial<_70.QueryValidatorResponse>): _70.QueryValidatorResponse;
                fromProtoMsg(message: _70.QueryValidatorResponseProtoMsg): _70.QueryValidatorResponse;
                toProto(message: _70.QueryValidatorResponse): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorResponse): _70.QueryValidatorResponseProtoMsg;
            };
            QueryValidatorDelegationsRequest: {
                typeUrl: string;
                encode(message: _70.QueryValidatorDelegationsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorDelegationsRequest;
                fromJSON(object: any): _70.QueryValidatorDelegationsRequest;
                toJSON(message: _70.QueryValidatorDelegationsRequest): import("../json-safe.js").JsonSafe<_70.QueryValidatorDelegationsRequest>;
                fromPartial(object: Partial<_70.QueryValidatorDelegationsRequest>): _70.QueryValidatorDelegationsRequest;
                fromProtoMsg(message: _70.QueryValidatorDelegationsRequestProtoMsg): _70.QueryValidatorDelegationsRequest;
                toProto(message: _70.QueryValidatorDelegationsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorDelegationsRequest): _70.QueryValidatorDelegationsRequestProtoMsg;
            };
            QueryValidatorDelegationsResponse: {
                typeUrl: string;
                encode(message: _70.QueryValidatorDelegationsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorDelegationsResponse;
                fromJSON(object: any): _70.QueryValidatorDelegationsResponse;
                toJSON(message: _70.QueryValidatorDelegationsResponse): import("../json-safe.js").JsonSafe<_70.QueryValidatorDelegationsResponse>;
                fromPartial(object: Partial<_70.QueryValidatorDelegationsResponse>): _70.QueryValidatorDelegationsResponse;
                fromProtoMsg(message: _70.QueryValidatorDelegationsResponseProtoMsg): _70.QueryValidatorDelegationsResponse;
                toProto(message: _70.QueryValidatorDelegationsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorDelegationsResponse): _70.QueryValidatorDelegationsResponseProtoMsg;
            };
            QueryValidatorUnbondingDelegationsRequest: {
                typeUrl: string;
                encode(message: _70.QueryValidatorUnbondingDelegationsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorUnbondingDelegationsRequest;
                fromJSON(object: any): _70.QueryValidatorUnbondingDelegationsRequest;
                toJSON(message: _70.QueryValidatorUnbondingDelegationsRequest): import("../json-safe.js").JsonSafe<_70.QueryValidatorUnbondingDelegationsRequest>;
                fromPartial(object: Partial<_70.QueryValidatorUnbondingDelegationsRequest>): _70.QueryValidatorUnbondingDelegationsRequest;
                fromProtoMsg(message: _70.QueryValidatorUnbondingDelegationsRequestProtoMsg): _70.QueryValidatorUnbondingDelegationsRequest;
                toProto(message: _70.QueryValidatorUnbondingDelegationsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorUnbondingDelegationsRequest): _70.QueryValidatorUnbondingDelegationsRequestProtoMsg;
            };
            QueryValidatorUnbondingDelegationsResponse: {
                typeUrl: string;
                encode(message: _70.QueryValidatorUnbondingDelegationsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryValidatorUnbondingDelegationsResponse;
                fromJSON(object: any): _70.QueryValidatorUnbondingDelegationsResponse;
                toJSON(message: _70.QueryValidatorUnbondingDelegationsResponse): import("../json-safe.js").JsonSafe<_70.QueryValidatorUnbondingDelegationsResponse>;
                fromPartial(object: Partial<_70.QueryValidatorUnbondingDelegationsResponse>): _70.QueryValidatorUnbondingDelegationsResponse;
                fromProtoMsg(message: _70.QueryValidatorUnbondingDelegationsResponseProtoMsg): _70.QueryValidatorUnbondingDelegationsResponse;
                toProto(message: _70.QueryValidatorUnbondingDelegationsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryValidatorUnbondingDelegationsResponse): _70.QueryValidatorUnbondingDelegationsResponseProtoMsg;
            };
            QueryDelegationRequest: {
                typeUrl: string;
                encode(message: _70.QueryDelegationRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegationRequest;
                fromJSON(object: any): _70.QueryDelegationRequest;
                toJSON(message: _70.QueryDelegationRequest): import("../json-safe.js").JsonSafe<_70.QueryDelegationRequest>;
                fromPartial(object: Partial<_70.QueryDelegationRequest>): _70.QueryDelegationRequest;
                fromProtoMsg(message: _70.QueryDelegationRequestProtoMsg): _70.QueryDelegationRequest;
                toProto(message: _70.QueryDelegationRequest): Uint8Array;
                toProtoMsg(message: _70.QueryDelegationRequest): _70.QueryDelegationRequestProtoMsg;
            };
            QueryDelegationResponse: {
                typeUrl: string;
                encode(message: _70.QueryDelegationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegationResponse;
                fromJSON(object: any): _70.QueryDelegationResponse;
                toJSON(message: _70.QueryDelegationResponse): import("../json-safe.js").JsonSafe<_70.QueryDelegationResponse>;
                fromPartial(object: Partial<_70.QueryDelegationResponse>): _70.QueryDelegationResponse;
                fromProtoMsg(message: _70.QueryDelegationResponseProtoMsg): _70.QueryDelegationResponse;
                toProto(message: _70.QueryDelegationResponse): Uint8Array;
                toProtoMsg(message: _70.QueryDelegationResponse): _70.QueryDelegationResponseProtoMsg;
            };
            QueryUnbondingDelegationRequest: {
                typeUrl: string;
                encode(message: _70.QueryUnbondingDelegationRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryUnbondingDelegationRequest;
                fromJSON(object: any): _70.QueryUnbondingDelegationRequest;
                toJSON(message: _70.QueryUnbondingDelegationRequest): import("../json-safe.js").JsonSafe<_70.QueryUnbondingDelegationRequest>;
                fromPartial(object: Partial<_70.QueryUnbondingDelegationRequest>): _70.QueryUnbondingDelegationRequest;
                fromProtoMsg(message: _70.QueryUnbondingDelegationRequestProtoMsg): _70.QueryUnbondingDelegationRequest;
                toProto(message: _70.QueryUnbondingDelegationRequest): Uint8Array;
                toProtoMsg(message: _70.QueryUnbondingDelegationRequest): _70.QueryUnbondingDelegationRequestProtoMsg;
            };
            QueryUnbondingDelegationResponse: {
                typeUrl: string;
                encode(message: _70.QueryUnbondingDelegationResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryUnbondingDelegationResponse;
                fromJSON(object: any): _70.QueryUnbondingDelegationResponse;
                toJSON(message: _70.QueryUnbondingDelegationResponse): import("../json-safe.js").JsonSafe<_70.QueryUnbondingDelegationResponse>;
                fromPartial(object: Partial<_70.QueryUnbondingDelegationResponse>): _70.QueryUnbondingDelegationResponse;
                fromProtoMsg(message: _70.QueryUnbondingDelegationResponseProtoMsg): _70.QueryUnbondingDelegationResponse;
                toProto(message: _70.QueryUnbondingDelegationResponse): Uint8Array;
                toProtoMsg(message: _70.QueryUnbondingDelegationResponse): _70.QueryUnbondingDelegationResponseProtoMsg;
            };
            QueryDelegatorDelegationsRequest: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorDelegationsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorDelegationsRequest;
                fromJSON(object: any): _70.QueryDelegatorDelegationsRequest;
                toJSON(message: _70.QueryDelegatorDelegationsRequest): import("../json-safe.js").JsonSafe<_70.QueryDelegatorDelegationsRequest>;
                fromPartial(object: Partial<_70.QueryDelegatorDelegationsRequest>): _70.QueryDelegatorDelegationsRequest;
                fromProtoMsg(message: _70.QueryDelegatorDelegationsRequestProtoMsg): _70.QueryDelegatorDelegationsRequest;
                toProto(message: _70.QueryDelegatorDelegationsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorDelegationsRequest): _70.QueryDelegatorDelegationsRequestProtoMsg;
            };
            QueryDelegatorDelegationsResponse: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorDelegationsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorDelegationsResponse;
                fromJSON(object: any): _70.QueryDelegatorDelegationsResponse;
                toJSON(message: _70.QueryDelegatorDelegationsResponse): import("../json-safe.js").JsonSafe<_70.QueryDelegatorDelegationsResponse>;
                fromPartial(object: Partial<_70.QueryDelegatorDelegationsResponse>): _70.QueryDelegatorDelegationsResponse;
                fromProtoMsg(message: _70.QueryDelegatorDelegationsResponseProtoMsg): _70.QueryDelegatorDelegationsResponse;
                toProto(message: _70.QueryDelegatorDelegationsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorDelegationsResponse): _70.QueryDelegatorDelegationsResponseProtoMsg;
            };
            QueryDelegatorUnbondingDelegationsRequest: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorUnbondingDelegationsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorUnbondingDelegationsRequest;
                fromJSON(object: any): _70.QueryDelegatorUnbondingDelegationsRequest;
                toJSON(message: _70.QueryDelegatorUnbondingDelegationsRequest): import("../json-safe.js").JsonSafe<_70.QueryDelegatorUnbondingDelegationsRequest>;
                fromPartial(object: Partial<_70.QueryDelegatorUnbondingDelegationsRequest>): _70.QueryDelegatorUnbondingDelegationsRequest;
                fromProtoMsg(message: _70.QueryDelegatorUnbondingDelegationsRequestProtoMsg): _70.QueryDelegatorUnbondingDelegationsRequest;
                toProto(message: _70.QueryDelegatorUnbondingDelegationsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorUnbondingDelegationsRequest): _70.QueryDelegatorUnbondingDelegationsRequestProtoMsg;
            };
            QueryDelegatorUnbondingDelegationsResponse: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorUnbondingDelegationsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorUnbondingDelegationsResponse;
                fromJSON(object: any): _70.QueryDelegatorUnbondingDelegationsResponse;
                toJSON(message: _70.QueryDelegatorUnbondingDelegationsResponse): import("../json-safe.js").JsonSafe<_70.QueryDelegatorUnbondingDelegationsResponse>;
                fromPartial(object: Partial<_70.QueryDelegatorUnbondingDelegationsResponse>): _70.QueryDelegatorUnbondingDelegationsResponse;
                fromProtoMsg(message: _70.QueryDelegatorUnbondingDelegationsResponseProtoMsg): _70.QueryDelegatorUnbondingDelegationsResponse;
                toProto(message: _70.QueryDelegatorUnbondingDelegationsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorUnbondingDelegationsResponse): _70.QueryDelegatorUnbondingDelegationsResponseProtoMsg;
            };
            QueryRedelegationsRequest: {
                typeUrl: string;
                encode(message: _70.QueryRedelegationsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryRedelegationsRequest;
                fromJSON(object: any): _70.QueryRedelegationsRequest;
                toJSON(message: _70.QueryRedelegationsRequest): import("../json-safe.js").JsonSafe<_70.QueryRedelegationsRequest>;
                fromPartial(object: Partial<_70.QueryRedelegationsRequest>): _70.QueryRedelegationsRequest;
                fromProtoMsg(message: _70.QueryRedelegationsRequestProtoMsg): _70.QueryRedelegationsRequest;
                toProto(message: _70.QueryRedelegationsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryRedelegationsRequest): _70.QueryRedelegationsRequestProtoMsg;
            };
            QueryRedelegationsResponse: {
                typeUrl: string;
                encode(message: _70.QueryRedelegationsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryRedelegationsResponse;
                fromJSON(object: any): _70.QueryRedelegationsResponse;
                toJSON(message: _70.QueryRedelegationsResponse): import("../json-safe.js").JsonSafe<_70.QueryRedelegationsResponse>;
                fromPartial(object: Partial<_70.QueryRedelegationsResponse>): _70.QueryRedelegationsResponse;
                fromProtoMsg(message: _70.QueryRedelegationsResponseProtoMsg): _70.QueryRedelegationsResponse;
                toProto(message: _70.QueryRedelegationsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryRedelegationsResponse): _70.QueryRedelegationsResponseProtoMsg;
            };
            QueryDelegatorValidatorsRequest: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorValidatorsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorValidatorsRequest;
                fromJSON(object: any): _70.QueryDelegatorValidatorsRequest;
                toJSON(message: _70.QueryDelegatorValidatorsRequest): import("../json-safe.js").JsonSafe<_70.QueryDelegatorValidatorsRequest>;
                fromPartial(object: Partial<_70.QueryDelegatorValidatorsRequest>): _70.QueryDelegatorValidatorsRequest;
                fromProtoMsg(message: _70.QueryDelegatorValidatorsRequestProtoMsg): _70.QueryDelegatorValidatorsRequest;
                toProto(message: _70.QueryDelegatorValidatorsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorValidatorsRequest): _70.QueryDelegatorValidatorsRequestProtoMsg;
            };
            QueryDelegatorValidatorsResponse: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorValidatorsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorValidatorsResponse;
                fromJSON(object: any): _70.QueryDelegatorValidatorsResponse;
                toJSON(message: _70.QueryDelegatorValidatorsResponse): import("../json-safe.js").JsonSafe<_70.QueryDelegatorValidatorsResponse>;
                fromPartial(object: Partial<_70.QueryDelegatorValidatorsResponse>): _70.QueryDelegatorValidatorsResponse;
                fromProtoMsg(message: _70.QueryDelegatorValidatorsResponseProtoMsg): _70.QueryDelegatorValidatorsResponse;
                toProto(message: _70.QueryDelegatorValidatorsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorValidatorsResponse): _70.QueryDelegatorValidatorsResponseProtoMsg;
            };
            QueryDelegatorValidatorRequest: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorValidatorRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorValidatorRequest;
                fromJSON(object: any): _70.QueryDelegatorValidatorRequest;
                toJSON(message: _70.QueryDelegatorValidatorRequest): import("../json-safe.js").JsonSafe<_70.QueryDelegatorValidatorRequest>;
                fromPartial(object: Partial<_70.QueryDelegatorValidatorRequest>): _70.QueryDelegatorValidatorRequest;
                fromProtoMsg(message: _70.QueryDelegatorValidatorRequestProtoMsg): _70.QueryDelegatorValidatorRequest;
                toProto(message: _70.QueryDelegatorValidatorRequest): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorValidatorRequest): _70.QueryDelegatorValidatorRequestProtoMsg;
            };
            QueryDelegatorValidatorResponse: {
                typeUrl: string;
                encode(message: _70.QueryDelegatorValidatorResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryDelegatorValidatorResponse;
                fromJSON(object: any): _70.QueryDelegatorValidatorResponse;
                toJSON(message: _70.QueryDelegatorValidatorResponse): import("../json-safe.js").JsonSafe<_70.QueryDelegatorValidatorResponse>;
                fromPartial(object: Partial<_70.QueryDelegatorValidatorResponse>): _70.QueryDelegatorValidatorResponse;
                fromProtoMsg(message: _70.QueryDelegatorValidatorResponseProtoMsg): _70.QueryDelegatorValidatorResponse;
                toProto(message: _70.QueryDelegatorValidatorResponse): Uint8Array;
                toProtoMsg(message: _70.QueryDelegatorValidatorResponse): _70.QueryDelegatorValidatorResponseProtoMsg;
            };
            QueryHistoricalInfoRequest: {
                typeUrl: string;
                encode(message: _70.QueryHistoricalInfoRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryHistoricalInfoRequest;
                fromJSON(object: any): _70.QueryHistoricalInfoRequest;
                toJSON(message: _70.QueryHistoricalInfoRequest): import("../json-safe.js").JsonSafe<_70.QueryHistoricalInfoRequest>;
                fromPartial(object: Partial<_70.QueryHistoricalInfoRequest>): _70.QueryHistoricalInfoRequest;
                fromProtoMsg(message: _70.QueryHistoricalInfoRequestProtoMsg): _70.QueryHistoricalInfoRequest;
                toProto(message: _70.QueryHistoricalInfoRequest): Uint8Array;
                toProtoMsg(message: _70.QueryHistoricalInfoRequest): _70.QueryHistoricalInfoRequestProtoMsg;
            };
            QueryHistoricalInfoResponse: {
                typeUrl: string;
                encode(message: _70.QueryHistoricalInfoResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryHistoricalInfoResponse;
                fromJSON(object: any): _70.QueryHistoricalInfoResponse;
                toJSON(message: _70.QueryHistoricalInfoResponse): import("../json-safe.js").JsonSafe<_70.QueryHistoricalInfoResponse>;
                fromPartial(object: Partial<_70.QueryHistoricalInfoResponse>): _70.QueryHistoricalInfoResponse;
                fromProtoMsg(message: _70.QueryHistoricalInfoResponseProtoMsg): _70.QueryHistoricalInfoResponse;
                toProto(message: _70.QueryHistoricalInfoResponse): Uint8Array;
                toProtoMsg(message: _70.QueryHistoricalInfoResponse): _70.QueryHistoricalInfoResponseProtoMsg;
            };
            QueryPoolRequest: {
                typeUrl: string;
                encode(_: _70.QueryPoolRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryPoolRequest;
                fromJSON(_: any): _70.QueryPoolRequest;
                toJSON(_: _70.QueryPoolRequest): import("../json-safe.js").JsonSafe<_70.QueryPoolRequest>;
                fromPartial(_: Partial<_70.QueryPoolRequest>): _70.QueryPoolRequest;
                fromProtoMsg(message: _70.QueryPoolRequestProtoMsg): _70.QueryPoolRequest;
                toProto(message: _70.QueryPoolRequest): Uint8Array;
                toProtoMsg(message: _70.QueryPoolRequest): _70.QueryPoolRequestProtoMsg;
            };
            QueryPoolResponse: {
                typeUrl: string;
                encode(message: _70.QueryPoolResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryPoolResponse;
                fromJSON(object: any): _70.QueryPoolResponse;
                toJSON(message: _70.QueryPoolResponse): import("../json-safe.js").JsonSafe<_70.QueryPoolResponse>;
                fromPartial(object: Partial<_70.QueryPoolResponse>): _70.QueryPoolResponse;
                fromProtoMsg(message: _70.QueryPoolResponseProtoMsg): _70.QueryPoolResponse;
                toProto(message: _70.QueryPoolResponse): Uint8Array;
                toProtoMsg(message: _70.QueryPoolResponse): _70.QueryPoolResponseProtoMsg;
            };
            QueryParamsRequest: {
                typeUrl: string;
                encode(_: _70.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryParamsRequest;
                fromJSON(_: any): _70.QueryParamsRequest;
                toJSON(_: _70.QueryParamsRequest): import("../json-safe.js").JsonSafe<_70.QueryParamsRequest>;
                fromPartial(_: Partial<_70.QueryParamsRequest>): _70.QueryParamsRequest;
                fromProtoMsg(message: _70.QueryParamsRequestProtoMsg): _70.QueryParamsRequest;
                toProto(message: _70.QueryParamsRequest): Uint8Array;
                toProtoMsg(message: _70.QueryParamsRequest): _70.QueryParamsRequestProtoMsg;
            };
            QueryParamsResponse: {
                typeUrl: string;
                encode(message: _70.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _70.QueryParamsResponse;
                fromJSON(object: any): _70.QueryParamsResponse;
                toJSON(message: _70.QueryParamsResponse): import("../json-safe.js").JsonSafe<_70.QueryParamsResponse>;
                fromPartial(object: Partial<_70.QueryParamsResponse>): _70.QueryParamsResponse;
                fromProtoMsg(message: _70.QueryParamsResponseProtoMsg): _70.QueryParamsResponse;
                toProto(message: _70.QueryParamsResponse): Uint8Array;
                toProtoMsg(message: _70.QueryParamsResponse): _70.QueryParamsResponseProtoMsg;
            };
            GenesisState: {
                typeUrl: string;
                encode(message: _69.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _69.GenesisState;
                fromJSON(object: any): _69.GenesisState;
                toJSON(message: _69.GenesisState): import("../json-safe.js").JsonSafe<_69.GenesisState>;
                fromPartial(object: Partial<_69.GenesisState>): _69.GenesisState;
                fromProtoMsg(message: _69.GenesisStateProtoMsg): _69.GenesisState;
                toProto(message: _69.GenesisState): Uint8Array;
                toProtoMsg(message: _69.GenesisState): _69.GenesisStateProtoMsg;
            };
            LastValidatorPower: {
                typeUrl: string;
                encode(message: _69.LastValidatorPower, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _69.LastValidatorPower;
                fromJSON(object: any): _69.LastValidatorPower;
                toJSON(message: _69.LastValidatorPower): import("../json-safe.js").JsonSafe<_69.LastValidatorPower>;
                fromPartial(object: Partial<_69.LastValidatorPower>): _69.LastValidatorPower;
                fromProtoMsg(message: _69.LastValidatorPowerProtoMsg): _69.LastValidatorPower;
                toProto(message: _69.LastValidatorPower): Uint8Array;
                toProtoMsg(message: _69.LastValidatorPower): _69.LastValidatorPowerProtoMsg;
            };
            authorizationTypeFromJSON(object: any): _68.AuthorizationType;
            authorizationTypeToJSON(object: _68.AuthorizationType): string;
            AuthorizationType: typeof _68.AuthorizationType;
            AuthorizationTypeSDKType: typeof _68.AuthorizationType;
            StakeAuthorization: {
                typeUrl: string;
                encode(message: _68.StakeAuthorization, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _68.StakeAuthorization;
                fromJSON(object: any): _68.StakeAuthorization;
                toJSON(message: _68.StakeAuthorization): import("../json-safe.js").JsonSafe<_68.StakeAuthorization>;
                fromPartial(object: Partial<_68.StakeAuthorization>): _68.StakeAuthorization;
                fromProtoMsg(message: _68.StakeAuthorizationProtoMsg): _68.StakeAuthorization;
                toProto(message: _68.StakeAuthorization): Uint8Array;
                toProtoMsg(message: _68.StakeAuthorization): _68.StakeAuthorizationProtoMsg;
            };
            StakeAuthorization_Validators: {
                typeUrl: string;
                encode(message: _68.StakeAuthorization_Validators, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _68.StakeAuthorization_Validators;
                fromJSON(object: any): _68.StakeAuthorization_Validators;
                toJSON(message: _68.StakeAuthorization_Validators): import("../json-safe.js").JsonSafe<_68.StakeAuthorization_Validators>;
                fromPartial(object: Partial<_68.StakeAuthorization_Validators>): _68.StakeAuthorization_Validators;
                fromProtoMsg(message: _68.StakeAuthorization_ValidatorsProtoMsg): _68.StakeAuthorization_Validators;
                toProto(message: _68.StakeAuthorization_Validators): Uint8Array;
                toProtoMsg(message: _68.StakeAuthorization_Validators): _68.StakeAuthorization_ValidatorsProtoMsg;
            };
        };
    }
    namespace tx {
        namespace signing {
            const v1beta1: {
                signModeFromJSON(object: any): _73.SignMode;
                signModeToJSON(object: _73.SignMode): string;
                SignMode: typeof _73.SignMode;
                SignModeSDKType: typeof _73.SignMode;
                SignatureDescriptors: {
                    typeUrl: string;
                    encode(message: _73.SignatureDescriptors, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _73.SignatureDescriptors;
                    fromJSON(object: any): _73.SignatureDescriptors;
                    toJSON(message: _73.SignatureDescriptors): import("../json-safe.js").JsonSafe<_73.SignatureDescriptors>;
                    fromPartial(object: Partial<_73.SignatureDescriptors>): _73.SignatureDescriptors;
                    fromProtoMsg(message: _73.SignatureDescriptorsProtoMsg): _73.SignatureDescriptors;
                    toProto(message: _73.SignatureDescriptors): Uint8Array;
                    toProtoMsg(message: _73.SignatureDescriptors): _73.SignatureDescriptorsProtoMsg;
                };
                SignatureDescriptor: {
                    typeUrl: string;
                    encode(message: _73.SignatureDescriptor, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _73.SignatureDescriptor;
                    fromJSON(object: any): _73.SignatureDescriptor;
                    toJSON(message: _73.SignatureDescriptor): import("../json-safe.js").JsonSafe<_73.SignatureDescriptor>;
                    fromPartial(object: Partial<_73.SignatureDescriptor>): _73.SignatureDescriptor;
                    fromProtoMsg(message: _73.SignatureDescriptorProtoMsg): _73.SignatureDescriptor;
                    toProto(message: _73.SignatureDescriptor): Uint8Array;
                    toProtoMsg(message: _73.SignatureDescriptor): _73.SignatureDescriptorProtoMsg;
                };
                SignatureDescriptor_Data: {
                    typeUrl: string;
                    encode(message: _73.SignatureDescriptor_Data, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _73.SignatureDescriptor_Data;
                    fromJSON(object: any): _73.SignatureDescriptor_Data;
                    toJSON(message: _73.SignatureDescriptor_Data): import("../json-safe.js").JsonSafe<_73.SignatureDescriptor_Data>;
                    fromPartial(object: Partial<_73.SignatureDescriptor_Data>): _73.SignatureDescriptor_Data;
                    fromProtoMsg(message: _73.SignatureDescriptor_DataProtoMsg): _73.SignatureDescriptor_Data;
                    toProto(message: _73.SignatureDescriptor_Data): Uint8Array;
                    toProtoMsg(message: _73.SignatureDescriptor_Data): _73.SignatureDescriptor_DataProtoMsg;
                };
                SignatureDescriptor_Data_Single: {
                    typeUrl: string;
                    encode(message: _73.SignatureDescriptor_Data_Single, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _73.SignatureDescriptor_Data_Single;
                    fromJSON(object: any): _73.SignatureDescriptor_Data_Single;
                    toJSON(message: _73.SignatureDescriptor_Data_Single): import("../json-safe.js").JsonSafe<_73.SignatureDescriptor_Data_Single>;
                    fromPartial(object: Partial<_73.SignatureDescriptor_Data_Single>): _73.SignatureDescriptor_Data_Single;
                    fromProtoMsg(message: _73.SignatureDescriptor_Data_SingleProtoMsg): _73.SignatureDescriptor_Data_Single;
                    toProto(message: _73.SignatureDescriptor_Data_Single): Uint8Array;
                    toProtoMsg(message: _73.SignatureDescriptor_Data_Single): _73.SignatureDescriptor_Data_SingleProtoMsg;
                };
                SignatureDescriptor_Data_Multi: {
                    typeUrl: string;
                    encode(message: _73.SignatureDescriptor_Data_Multi, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _73.SignatureDescriptor_Data_Multi;
                    fromJSON(object: any): _73.SignatureDescriptor_Data_Multi;
                    toJSON(message: _73.SignatureDescriptor_Data_Multi): import("../json-safe.js").JsonSafe<_73.SignatureDescriptor_Data_Multi>;
                    fromPartial(object: Partial<_73.SignatureDescriptor_Data_Multi>): _73.SignatureDescriptor_Data_Multi;
                    fromProtoMsg(message: _73.SignatureDescriptor_Data_MultiProtoMsg): _73.SignatureDescriptor_Data_Multi;
                    toProto(message: _73.SignatureDescriptor_Data_Multi): Uint8Array;
                    toProtoMsg(message: _73.SignatureDescriptor_Data_Multi): _73.SignatureDescriptor_Data_MultiProtoMsg;
                };
            };
        }
        const v1beta1: {
            Tx: {
                typeUrl: string;
                encode(message: _75.Tx, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.Tx;
                fromJSON(object: any): _75.Tx;
                toJSON(message: _75.Tx): import("../json-safe.js").JsonSafe<_75.Tx>;
                fromPartial(object: Partial<_75.Tx>): _75.Tx;
                fromProtoMsg(message: _75.TxProtoMsg): _75.Tx;
                toProto(message: _75.Tx): Uint8Array;
                toProtoMsg(message: _75.Tx): _75.TxProtoMsg;
            };
            TxRaw: {
                typeUrl: string;
                encode(message: _75.TxRaw, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.TxRaw;
                fromJSON(object: any): _75.TxRaw;
                toJSON(message: _75.TxRaw): import("../json-safe.js").JsonSafe<_75.TxRaw>;
                fromPartial(object: Partial<_75.TxRaw>): _75.TxRaw;
                fromProtoMsg(message: _75.TxRawProtoMsg): _75.TxRaw;
                toProto(message: _75.TxRaw): Uint8Array;
                toProtoMsg(message: _75.TxRaw): _75.TxRawProtoMsg;
            };
            SignDoc: {
                typeUrl: string;
                encode(message: _75.SignDoc, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.SignDoc;
                fromJSON(object: any): _75.SignDoc;
                toJSON(message: _75.SignDoc): import("../json-safe.js").JsonSafe<_75.SignDoc>;
                fromPartial(object: Partial<_75.SignDoc>): _75.SignDoc;
                fromProtoMsg(message: _75.SignDocProtoMsg): _75.SignDoc;
                toProto(message: _75.SignDoc): Uint8Array;
                toProtoMsg(message: _75.SignDoc): _75.SignDocProtoMsg;
            };
            SignDocDirectAux: {
                typeUrl: string;
                encode(message: _75.SignDocDirectAux, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.SignDocDirectAux;
                fromJSON(object: any): _75.SignDocDirectAux;
                toJSON(message: _75.SignDocDirectAux): import("../json-safe.js").JsonSafe<_75.SignDocDirectAux>;
                fromPartial(object: Partial<_75.SignDocDirectAux>): _75.SignDocDirectAux;
                fromProtoMsg(message: _75.SignDocDirectAuxProtoMsg): _75.SignDocDirectAux;
                toProto(message: _75.SignDocDirectAux): Uint8Array;
                toProtoMsg(message: _75.SignDocDirectAux): _75.SignDocDirectAuxProtoMsg;
            };
            TxBody: {
                typeUrl: string;
                encode(message: _75.TxBody, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.TxBody;
                fromJSON(object: any): _75.TxBody;
                toJSON(message: _75.TxBody): import("../json-safe.js").JsonSafe<_75.TxBody>;
                fromPartial(object: Partial<_75.TxBody>): _75.TxBody;
                fromProtoMsg(message: _75.TxBodyProtoMsg): _75.TxBody;
                toProto(message: _75.TxBody): Uint8Array;
                toProtoMsg(message: _75.TxBody): _75.TxBodyProtoMsg;
            };
            AuthInfo: {
                typeUrl: string;
                encode(message: _75.AuthInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.AuthInfo;
                fromJSON(object: any): _75.AuthInfo;
                toJSON(message: _75.AuthInfo): import("../json-safe.js").JsonSafe<_75.AuthInfo>;
                fromPartial(object: Partial<_75.AuthInfo>): _75.AuthInfo;
                fromProtoMsg(message: _75.AuthInfoProtoMsg): _75.AuthInfo;
                toProto(message: _75.AuthInfo): Uint8Array;
                toProtoMsg(message: _75.AuthInfo): _75.AuthInfoProtoMsg;
            };
            SignerInfo: {
                typeUrl: string;
                encode(message: _75.SignerInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.SignerInfo;
                fromJSON(object: any): _75.SignerInfo;
                toJSON(message: _75.SignerInfo): import("../json-safe.js").JsonSafe<_75.SignerInfo>;
                fromPartial(object: Partial<_75.SignerInfo>): _75.SignerInfo;
                fromProtoMsg(message: _75.SignerInfoProtoMsg): _75.SignerInfo;
                toProto(message: _75.SignerInfo): Uint8Array;
                toProtoMsg(message: _75.SignerInfo): _75.SignerInfoProtoMsg;
            };
            ModeInfo: {
                typeUrl: string;
                encode(message: _75.ModeInfo, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.ModeInfo;
                fromJSON(object: any): _75.ModeInfo;
                toJSON(message: _75.ModeInfo): import("../json-safe.js").JsonSafe<_75.ModeInfo>;
                fromPartial(object: Partial<_75.ModeInfo>): _75.ModeInfo;
                fromProtoMsg(message: _75.ModeInfoProtoMsg): _75.ModeInfo;
                toProto(message: _75.ModeInfo): Uint8Array;
                toProtoMsg(message: _75.ModeInfo): _75.ModeInfoProtoMsg;
            };
            ModeInfo_Single: {
                typeUrl: string;
                encode(message: _75.ModeInfo_Single, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.ModeInfo_Single;
                fromJSON(object: any): _75.ModeInfo_Single;
                toJSON(message: _75.ModeInfo_Single): import("../json-safe.js").JsonSafe<_75.ModeInfo_Single>;
                fromPartial(object: Partial<_75.ModeInfo_Single>): _75.ModeInfo_Single;
                fromProtoMsg(message: _75.ModeInfo_SingleProtoMsg): _75.ModeInfo_Single;
                toProto(message: _75.ModeInfo_Single): Uint8Array;
                toProtoMsg(message: _75.ModeInfo_Single): _75.ModeInfo_SingleProtoMsg;
            };
            ModeInfo_Multi: {
                typeUrl: string;
                encode(message: _75.ModeInfo_Multi, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.ModeInfo_Multi;
                fromJSON(object: any): _75.ModeInfo_Multi;
                toJSON(message: _75.ModeInfo_Multi): import("../json-safe.js").JsonSafe<_75.ModeInfo_Multi>;
                fromPartial(object: Partial<_75.ModeInfo_Multi>): _75.ModeInfo_Multi;
                fromProtoMsg(message: _75.ModeInfo_MultiProtoMsg): _75.ModeInfo_Multi;
                toProto(message: _75.ModeInfo_Multi): Uint8Array;
                toProtoMsg(message: _75.ModeInfo_Multi): _75.ModeInfo_MultiProtoMsg;
            };
            Fee: {
                typeUrl: string;
                encode(message: _75.Fee, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.Fee;
                fromJSON(object: any): _75.Fee;
                toJSON(message: _75.Fee): import("../json-safe.js").JsonSafe<_75.Fee>;
                fromPartial(object: Partial<_75.Fee>): _75.Fee;
                fromProtoMsg(message: _75.FeeProtoMsg): _75.Fee;
                toProto(message: _75.Fee): Uint8Array;
                toProtoMsg(message: _75.Fee): _75.FeeProtoMsg;
            };
            Tip: {
                typeUrl: string;
                encode(message: _75.Tip, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.Tip;
                fromJSON(object: any): _75.Tip;
                toJSON(message: _75.Tip): import("../json-safe.js").JsonSafe<_75.Tip>;
                fromPartial(object: Partial<_75.Tip>): _75.Tip;
                fromProtoMsg(message: _75.TipProtoMsg): _75.Tip;
                toProto(message: _75.Tip): Uint8Array;
                toProtoMsg(message: _75.Tip): _75.TipProtoMsg;
            };
            AuxSignerData: {
                typeUrl: string;
                encode(message: _75.AuxSignerData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _75.AuxSignerData;
                fromJSON(object: any): _75.AuxSignerData;
                toJSON(message: _75.AuxSignerData): import("../json-safe.js").JsonSafe<_75.AuxSignerData>;
                fromPartial(object: Partial<_75.AuxSignerData>): _75.AuxSignerData;
                fromProtoMsg(message: _75.AuxSignerDataProtoMsg): _75.AuxSignerData;
                toProto(message: _75.AuxSignerData): Uint8Array;
                toProtoMsg(message: _75.AuxSignerData): _75.AuxSignerDataProtoMsg;
            };
            orderByFromJSON(object: any): _74.OrderBy;
            orderByToJSON(object: _74.OrderBy): string;
            broadcastModeFromJSON(object: any): _74.BroadcastMode;
            broadcastModeToJSON(object: _74.BroadcastMode): string;
            OrderBy: typeof _74.OrderBy;
            OrderBySDKType: typeof _74.OrderBy;
            BroadcastMode: typeof _74.BroadcastMode;
            BroadcastModeSDKType: typeof _74.BroadcastMode;
            GetTxsEventRequest: {
                typeUrl: string;
                encode(message: _74.GetTxsEventRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetTxsEventRequest;
                fromJSON(object: any): _74.GetTxsEventRequest;
                toJSON(message: _74.GetTxsEventRequest): import("../json-safe.js").JsonSafe<_74.GetTxsEventRequest>;
                fromPartial(object: Partial<_74.GetTxsEventRequest>): _74.GetTxsEventRequest;
                fromProtoMsg(message: _74.GetTxsEventRequestProtoMsg): _74.GetTxsEventRequest;
                toProto(message: _74.GetTxsEventRequest): Uint8Array;
                toProtoMsg(message: _74.GetTxsEventRequest): _74.GetTxsEventRequestProtoMsg;
            };
            GetTxsEventResponse: {
                typeUrl: string;
                encode(message: _74.GetTxsEventResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetTxsEventResponse;
                fromJSON(object: any): _74.GetTxsEventResponse;
                toJSON(message: _74.GetTxsEventResponse): import("../json-safe.js").JsonSafe<_74.GetTxsEventResponse>;
                fromPartial(object: Partial<_74.GetTxsEventResponse>): _74.GetTxsEventResponse;
                fromProtoMsg(message: _74.GetTxsEventResponseProtoMsg): _74.GetTxsEventResponse;
                toProto(message: _74.GetTxsEventResponse): Uint8Array;
                toProtoMsg(message: _74.GetTxsEventResponse): _74.GetTxsEventResponseProtoMsg;
            };
            BroadcastTxRequest: {
                typeUrl: string;
                encode(message: _74.BroadcastTxRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.BroadcastTxRequest;
                fromJSON(object: any): _74.BroadcastTxRequest;
                toJSON(message: _74.BroadcastTxRequest): import("../json-safe.js").JsonSafe<_74.BroadcastTxRequest>;
                fromPartial(object: Partial<_74.BroadcastTxRequest>): _74.BroadcastTxRequest;
                fromProtoMsg(message: _74.BroadcastTxRequestProtoMsg): _74.BroadcastTxRequest;
                toProto(message: _74.BroadcastTxRequest): Uint8Array;
                toProtoMsg(message: _74.BroadcastTxRequest): _74.BroadcastTxRequestProtoMsg;
            };
            BroadcastTxResponse: {
                typeUrl: string;
                encode(message: _74.BroadcastTxResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.BroadcastTxResponse;
                fromJSON(object: any): _74.BroadcastTxResponse;
                toJSON(message: _74.BroadcastTxResponse): import("../json-safe.js").JsonSafe<_74.BroadcastTxResponse>;
                fromPartial(object: Partial<_74.BroadcastTxResponse>): _74.BroadcastTxResponse;
                fromProtoMsg(message: _74.BroadcastTxResponseProtoMsg): _74.BroadcastTxResponse;
                toProto(message: _74.BroadcastTxResponse): Uint8Array;
                toProtoMsg(message: _74.BroadcastTxResponse): _74.BroadcastTxResponseProtoMsg;
            };
            SimulateRequest: {
                typeUrl: string;
                encode(message: _74.SimulateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.SimulateRequest;
                fromJSON(object: any): _74.SimulateRequest;
                toJSON(message: _74.SimulateRequest): import("../json-safe.js").JsonSafe<_74.SimulateRequest>;
                fromPartial(object: Partial<_74.SimulateRequest>): _74.SimulateRequest;
                fromProtoMsg(message: _74.SimulateRequestProtoMsg): _74.SimulateRequest;
                toProto(message: _74.SimulateRequest): Uint8Array;
                toProtoMsg(message: _74.SimulateRequest): _74.SimulateRequestProtoMsg;
            };
            SimulateResponse: {
                typeUrl: string;
                encode(message: _74.SimulateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.SimulateResponse;
                fromJSON(object: any): _74.SimulateResponse;
                toJSON(message: _74.SimulateResponse): import("../json-safe.js").JsonSafe<_74.SimulateResponse>;
                fromPartial(object: Partial<_74.SimulateResponse>): _74.SimulateResponse;
                fromProtoMsg(message: _74.SimulateResponseProtoMsg): _74.SimulateResponse;
                toProto(message: _74.SimulateResponse): Uint8Array;
                toProtoMsg(message: _74.SimulateResponse): _74.SimulateResponseProtoMsg;
            };
            GetTxRequest: {
                typeUrl: string;
                encode(message: _74.GetTxRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetTxRequest;
                fromJSON(object: any): _74.GetTxRequest;
                toJSON(message: _74.GetTxRequest): import("../json-safe.js").JsonSafe<_74.GetTxRequest>;
                fromPartial(object: Partial<_74.GetTxRequest>): _74.GetTxRequest;
                fromProtoMsg(message: _74.GetTxRequestProtoMsg): _74.GetTxRequest;
                toProto(message: _74.GetTxRequest): Uint8Array;
                toProtoMsg(message: _74.GetTxRequest): _74.GetTxRequestProtoMsg;
            };
            GetTxResponse: {
                typeUrl: string;
                encode(message: _74.GetTxResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetTxResponse;
                fromJSON(object: any): _74.GetTxResponse;
                toJSON(message: _74.GetTxResponse): import("../json-safe.js").JsonSafe<_74.GetTxResponse>;
                fromPartial(object: Partial<_74.GetTxResponse>): _74.GetTxResponse;
                fromProtoMsg(message: _74.GetTxResponseProtoMsg): _74.GetTxResponse;
                toProto(message: _74.GetTxResponse): Uint8Array;
                toProtoMsg(message: _74.GetTxResponse): _74.GetTxResponseProtoMsg;
            };
            GetBlockWithTxsRequest: {
                typeUrl: string;
                encode(message: _74.GetBlockWithTxsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetBlockWithTxsRequest;
                fromJSON(object: any): _74.GetBlockWithTxsRequest;
                toJSON(message: _74.GetBlockWithTxsRequest): import("../json-safe.js").JsonSafe<_74.GetBlockWithTxsRequest>;
                fromPartial(object: Partial<_74.GetBlockWithTxsRequest>): _74.GetBlockWithTxsRequest;
                fromProtoMsg(message: _74.GetBlockWithTxsRequestProtoMsg): _74.GetBlockWithTxsRequest;
                toProto(message: _74.GetBlockWithTxsRequest): Uint8Array;
                toProtoMsg(message: _74.GetBlockWithTxsRequest): _74.GetBlockWithTxsRequestProtoMsg;
            };
            GetBlockWithTxsResponse: {
                typeUrl: string;
                encode(message: _74.GetBlockWithTxsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _74.GetBlockWithTxsResponse;
                fromJSON(object: any): _74.GetBlockWithTxsResponse;
                toJSON(message: _74.GetBlockWithTxsResponse): import("../json-safe.js").JsonSafe<_74.GetBlockWithTxsResponse>;
                fromPartial(object: Partial<_74.GetBlockWithTxsResponse>): _74.GetBlockWithTxsResponse;
                fromProtoMsg(message: _74.GetBlockWithTxsResponseProtoMsg): _74.GetBlockWithTxsResponse;
                toProto(message: _74.GetBlockWithTxsResponse): Uint8Array;
                toProtoMsg(message: _74.GetBlockWithTxsResponse): _74.GetBlockWithTxsResponseProtoMsg;
            };
        };
    }
    namespace upgrade {
        const v1beta1: {
            Plan: {
                typeUrl: string;
                encode(message: _78.Plan, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _78.Plan;
                fromJSON(object: any): _78.Plan;
                toJSON(message: _78.Plan): import("../json-safe.js").JsonSafe<_78.Plan>;
                fromPartial(object: Partial<_78.Plan>): _78.Plan;
                fromProtoMsg(message: _78.PlanProtoMsg): _78.Plan;
                toProto(message: _78.Plan): Uint8Array;
                toProtoMsg(message: _78.Plan): _78.PlanProtoMsg;
            };
            SoftwareUpgradeProposal: {
                typeUrl: string;
                encode(message: _78.SoftwareUpgradeProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _78.SoftwareUpgradeProposal;
                fromJSON(object: any): _78.SoftwareUpgradeProposal;
                toJSON(message: _78.SoftwareUpgradeProposal): import("../json-safe.js").JsonSafe<_78.SoftwareUpgradeProposal>;
                fromPartial(object: Partial<_78.SoftwareUpgradeProposal>): _78.SoftwareUpgradeProposal;
                fromProtoMsg(message: _78.SoftwareUpgradeProposalProtoMsg): _78.SoftwareUpgradeProposal;
                toProto(message: _78.SoftwareUpgradeProposal): Uint8Array;
                toProtoMsg(message: _78.SoftwareUpgradeProposal): _78.SoftwareUpgradeProposalProtoMsg;
            };
            CancelSoftwareUpgradeProposal: {
                typeUrl: string;
                encode(message: _78.CancelSoftwareUpgradeProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _78.CancelSoftwareUpgradeProposal;
                fromJSON(object: any): _78.CancelSoftwareUpgradeProposal;
                toJSON(message: _78.CancelSoftwareUpgradeProposal): import("../json-safe.js").JsonSafe<_78.CancelSoftwareUpgradeProposal>;
                fromPartial(object: Partial<_78.CancelSoftwareUpgradeProposal>): _78.CancelSoftwareUpgradeProposal;
                fromProtoMsg(message: _78.CancelSoftwareUpgradeProposalProtoMsg): _78.CancelSoftwareUpgradeProposal;
                toProto(message: _78.CancelSoftwareUpgradeProposal): Uint8Array;
                toProtoMsg(message: _78.CancelSoftwareUpgradeProposal): _78.CancelSoftwareUpgradeProposalProtoMsg;
            };
            ModuleVersion: {
                typeUrl: string;
                encode(message: _78.ModuleVersion, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _78.ModuleVersion;
                fromJSON(object: any): _78.ModuleVersion;
                toJSON(message: _78.ModuleVersion): import("../json-safe.js").JsonSafe<_78.ModuleVersion>;
                fromPartial(object: Partial<_78.ModuleVersion>): _78.ModuleVersion;
                fromProtoMsg(message: _78.ModuleVersionProtoMsg): _78.ModuleVersion;
                toProto(message: _78.ModuleVersion): Uint8Array;
                toProtoMsg(message: _78.ModuleVersion): _78.ModuleVersionProtoMsg;
            };
            MsgSoftwareUpgrade: {
                typeUrl: string;
                encode(message: _77.MsgSoftwareUpgrade, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _77.MsgSoftwareUpgrade;
                fromJSON(object: any): _77.MsgSoftwareUpgrade;
                toJSON(message: _77.MsgSoftwareUpgrade): import("../json-safe.js").JsonSafe<_77.MsgSoftwareUpgrade>;
                fromPartial(object: Partial<_77.MsgSoftwareUpgrade>): _77.MsgSoftwareUpgrade;
                fromProtoMsg(message: _77.MsgSoftwareUpgradeProtoMsg): _77.MsgSoftwareUpgrade;
                toProto(message: _77.MsgSoftwareUpgrade): Uint8Array;
                toProtoMsg(message: _77.MsgSoftwareUpgrade): _77.MsgSoftwareUpgradeProtoMsg;
            };
            MsgSoftwareUpgradeResponse: {
                typeUrl: string;
                encode(_: _77.MsgSoftwareUpgradeResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _77.MsgSoftwareUpgradeResponse;
                fromJSON(_: any): _77.MsgSoftwareUpgradeResponse;
                toJSON(_: _77.MsgSoftwareUpgradeResponse): import("../json-safe.js").JsonSafe<_77.MsgSoftwareUpgradeResponse>;
                fromPartial(_: Partial<_77.MsgSoftwareUpgradeResponse>): _77.MsgSoftwareUpgradeResponse;
                fromProtoMsg(message: _77.MsgSoftwareUpgradeResponseProtoMsg): _77.MsgSoftwareUpgradeResponse;
                toProto(message: _77.MsgSoftwareUpgradeResponse): Uint8Array;
                toProtoMsg(message: _77.MsgSoftwareUpgradeResponse): _77.MsgSoftwareUpgradeResponseProtoMsg;
            };
            MsgCancelUpgrade: {
                typeUrl: string;
                encode(message: _77.MsgCancelUpgrade, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _77.MsgCancelUpgrade;
                fromJSON(object: any): _77.MsgCancelUpgrade;
                toJSON(message: _77.MsgCancelUpgrade): import("../json-safe.js").JsonSafe<_77.MsgCancelUpgrade>;
                fromPartial(object: Partial<_77.MsgCancelUpgrade>): _77.MsgCancelUpgrade;
                fromProtoMsg(message: _77.MsgCancelUpgradeProtoMsg): _77.MsgCancelUpgrade;
                toProto(message: _77.MsgCancelUpgrade): Uint8Array;
                toProtoMsg(message: _77.MsgCancelUpgrade): _77.MsgCancelUpgradeProtoMsg;
            };
            MsgCancelUpgradeResponse: {
                typeUrl: string;
                encode(_: _77.MsgCancelUpgradeResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _77.MsgCancelUpgradeResponse;
                fromJSON(_: any): _77.MsgCancelUpgradeResponse;
                toJSON(_: _77.MsgCancelUpgradeResponse): import("../json-safe.js").JsonSafe<_77.MsgCancelUpgradeResponse>;
                fromPartial(_: Partial<_77.MsgCancelUpgradeResponse>): _77.MsgCancelUpgradeResponse;
                fromProtoMsg(message: _77.MsgCancelUpgradeResponseProtoMsg): _77.MsgCancelUpgradeResponse;
                toProto(message: _77.MsgCancelUpgradeResponse): Uint8Array;
                toProtoMsg(message: _77.MsgCancelUpgradeResponse): _77.MsgCancelUpgradeResponseProtoMsg;
            };
            QueryCurrentPlanRequest: {
                typeUrl: string;
                encode(_: _76.QueryCurrentPlanRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryCurrentPlanRequest;
                fromJSON(_: any): _76.QueryCurrentPlanRequest;
                toJSON(_: _76.QueryCurrentPlanRequest): import("../json-safe.js").JsonSafe<_76.QueryCurrentPlanRequest>;
                fromPartial(_: Partial<_76.QueryCurrentPlanRequest>): _76.QueryCurrentPlanRequest;
                fromProtoMsg(message: _76.QueryCurrentPlanRequestProtoMsg): _76.QueryCurrentPlanRequest;
                toProto(message: _76.QueryCurrentPlanRequest): Uint8Array;
                toProtoMsg(message: _76.QueryCurrentPlanRequest): _76.QueryCurrentPlanRequestProtoMsg;
            };
            QueryCurrentPlanResponse: {
                typeUrl: string;
                encode(message: _76.QueryCurrentPlanResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryCurrentPlanResponse;
                fromJSON(object: any): _76.QueryCurrentPlanResponse;
                toJSON(message: _76.QueryCurrentPlanResponse): import("../json-safe.js").JsonSafe<_76.QueryCurrentPlanResponse>;
                fromPartial(object: Partial<_76.QueryCurrentPlanResponse>): _76.QueryCurrentPlanResponse;
                fromProtoMsg(message: _76.QueryCurrentPlanResponseProtoMsg): _76.QueryCurrentPlanResponse;
                toProto(message: _76.QueryCurrentPlanResponse): Uint8Array;
                toProtoMsg(message: _76.QueryCurrentPlanResponse): _76.QueryCurrentPlanResponseProtoMsg;
            };
            QueryAppliedPlanRequest: {
                typeUrl: string;
                encode(message: _76.QueryAppliedPlanRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryAppliedPlanRequest;
                fromJSON(object: any): _76.QueryAppliedPlanRequest;
                toJSON(message: _76.QueryAppliedPlanRequest): import("../json-safe.js").JsonSafe<_76.QueryAppliedPlanRequest>;
                fromPartial(object: Partial<_76.QueryAppliedPlanRequest>): _76.QueryAppliedPlanRequest;
                fromProtoMsg(message: _76.QueryAppliedPlanRequestProtoMsg): _76.QueryAppliedPlanRequest;
                toProto(message: _76.QueryAppliedPlanRequest): Uint8Array;
                toProtoMsg(message: _76.QueryAppliedPlanRequest): _76.QueryAppliedPlanRequestProtoMsg;
            };
            QueryAppliedPlanResponse: {
                typeUrl: string;
                encode(message: _76.QueryAppliedPlanResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryAppliedPlanResponse;
                fromJSON(object: any): _76.QueryAppliedPlanResponse;
                toJSON(message: _76.QueryAppliedPlanResponse): import("../json-safe.js").JsonSafe<_76.QueryAppliedPlanResponse>;
                fromPartial(object: Partial<_76.QueryAppliedPlanResponse>): _76.QueryAppliedPlanResponse;
                fromProtoMsg(message: _76.QueryAppliedPlanResponseProtoMsg): _76.QueryAppliedPlanResponse;
                toProto(message: _76.QueryAppliedPlanResponse): Uint8Array;
                toProtoMsg(message: _76.QueryAppliedPlanResponse): _76.QueryAppliedPlanResponseProtoMsg;
            };
            QueryUpgradedConsensusStateRequest: {
                typeUrl: string;
                encode(message: _76.QueryUpgradedConsensusStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryUpgradedConsensusStateRequest;
                fromJSON(object: any): _76.QueryUpgradedConsensusStateRequest;
                toJSON(message: _76.QueryUpgradedConsensusStateRequest): import("../json-safe.js").JsonSafe<_76.QueryUpgradedConsensusStateRequest>;
                fromPartial(object: Partial<_76.QueryUpgradedConsensusStateRequest>): _76.QueryUpgradedConsensusStateRequest;
                fromProtoMsg(message: _76.QueryUpgradedConsensusStateRequestProtoMsg): _76.QueryUpgradedConsensusStateRequest;
                toProto(message: _76.QueryUpgradedConsensusStateRequest): Uint8Array;
                toProtoMsg(message: _76.QueryUpgradedConsensusStateRequest): _76.QueryUpgradedConsensusStateRequestProtoMsg;
            };
            QueryUpgradedConsensusStateResponse: {
                typeUrl: string;
                encode(message: _76.QueryUpgradedConsensusStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryUpgradedConsensusStateResponse;
                fromJSON(object: any): _76.QueryUpgradedConsensusStateResponse;
                toJSON(message: _76.QueryUpgradedConsensusStateResponse): import("../json-safe.js").JsonSafe<_76.QueryUpgradedConsensusStateResponse>;
                fromPartial(object: Partial<_76.QueryUpgradedConsensusStateResponse>): _76.QueryUpgradedConsensusStateResponse;
                fromProtoMsg(message: _76.QueryUpgradedConsensusStateResponseProtoMsg): _76.QueryUpgradedConsensusStateResponse;
                toProto(message: _76.QueryUpgradedConsensusStateResponse): Uint8Array;
                toProtoMsg(message: _76.QueryUpgradedConsensusStateResponse): _76.QueryUpgradedConsensusStateResponseProtoMsg;
            };
            QueryModuleVersionsRequest: {
                typeUrl: string;
                encode(message: _76.QueryModuleVersionsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryModuleVersionsRequest;
                fromJSON(object: any): _76.QueryModuleVersionsRequest;
                toJSON(message: _76.QueryModuleVersionsRequest): import("../json-safe.js").JsonSafe<_76.QueryModuleVersionsRequest>;
                fromPartial(object: Partial<_76.QueryModuleVersionsRequest>): _76.QueryModuleVersionsRequest;
                fromProtoMsg(message: _76.QueryModuleVersionsRequestProtoMsg): _76.QueryModuleVersionsRequest;
                toProto(message: _76.QueryModuleVersionsRequest): Uint8Array;
                toProtoMsg(message: _76.QueryModuleVersionsRequest): _76.QueryModuleVersionsRequestProtoMsg;
            };
            QueryModuleVersionsResponse: {
                typeUrl: string;
                encode(message: _76.QueryModuleVersionsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryModuleVersionsResponse;
                fromJSON(object: any): _76.QueryModuleVersionsResponse;
                toJSON(message: _76.QueryModuleVersionsResponse): import("../json-safe.js").JsonSafe<_76.QueryModuleVersionsResponse>;
                fromPartial(object: Partial<_76.QueryModuleVersionsResponse>): _76.QueryModuleVersionsResponse;
                fromProtoMsg(message: _76.QueryModuleVersionsResponseProtoMsg): _76.QueryModuleVersionsResponse;
                toProto(message: _76.QueryModuleVersionsResponse): Uint8Array;
                toProtoMsg(message: _76.QueryModuleVersionsResponse): _76.QueryModuleVersionsResponseProtoMsg;
            };
            QueryAuthorityRequest: {
                typeUrl: string;
                encode(_: _76.QueryAuthorityRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryAuthorityRequest;
                fromJSON(_: any): _76.QueryAuthorityRequest;
                toJSON(_: _76.QueryAuthorityRequest): import("../json-safe.js").JsonSafe<_76.QueryAuthorityRequest>;
                fromPartial(_: Partial<_76.QueryAuthorityRequest>): _76.QueryAuthorityRequest;
                fromProtoMsg(message: _76.QueryAuthorityRequestProtoMsg): _76.QueryAuthorityRequest;
                toProto(message: _76.QueryAuthorityRequest): Uint8Array;
                toProtoMsg(message: _76.QueryAuthorityRequest): _76.QueryAuthorityRequestProtoMsg;
            };
            QueryAuthorityResponse: {
                typeUrl: string;
                encode(message: _76.QueryAuthorityResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _76.QueryAuthorityResponse;
                fromJSON(object: any): _76.QueryAuthorityResponse;
                toJSON(message: _76.QueryAuthorityResponse): import("../json-safe.js").JsonSafe<_76.QueryAuthorityResponse>;
                fromPartial(object: Partial<_76.QueryAuthorityResponse>): _76.QueryAuthorityResponse;
                fromProtoMsg(message: _76.QueryAuthorityResponseProtoMsg): _76.QueryAuthorityResponse;
                toProto(message: _76.QueryAuthorityResponse): Uint8Array;
                toProtoMsg(message: _76.QueryAuthorityResponse): _76.QueryAuthorityResponseProtoMsg;
            };
        };
    }
    namespace vesting {
        const v1beta1: {
            BaseVestingAccount: {
                typeUrl: string;
                encode(message: _80.BaseVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.BaseVestingAccount;
                fromJSON(object: any): _80.BaseVestingAccount;
                toJSON(message: _80.BaseVestingAccount): import("../json-safe.js").JsonSafe<_80.BaseVestingAccount>;
                fromPartial(object: Partial<_80.BaseVestingAccount>): _80.BaseVestingAccount;
                fromProtoMsg(message: _80.BaseVestingAccountProtoMsg): _80.BaseVestingAccount;
                toProto(message: _80.BaseVestingAccount): Uint8Array;
                toProtoMsg(message: _80.BaseVestingAccount): _80.BaseVestingAccountProtoMsg;
            };
            ContinuousVestingAccount: {
                typeUrl: string;
                encode(message: _80.ContinuousVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.ContinuousVestingAccount;
                fromJSON(object: any): _80.ContinuousVestingAccount;
                toJSON(message: _80.ContinuousVestingAccount): import("../json-safe.js").JsonSafe<_80.ContinuousVestingAccount>;
                fromPartial(object: Partial<_80.ContinuousVestingAccount>): _80.ContinuousVestingAccount;
                fromProtoMsg(message: _80.ContinuousVestingAccountProtoMsg): _80.ContinuousVestingAccount;
                toProto(message: _80.ContinuousVestingAccount): Uint8Array;
                toProtoMsg(message: _80.ContinuousVestingAccount): _80.ContinuousVestingAccountProtoMsg;
            };
            DelayedVestingAccount: {
                typeUrl: string;
                encode(message: _80.DelayedVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.DelayedVestingAccount;
                fromJSON(object: any): _80.DelayedVestingAccount;
                toJSON(message: _80.DelayedVestingAccount): import("../json-safe.js").JsonSafe<_80.DelayedVestingAccount>;
                fromPartial(object: Partial<_80.DelayedVestingAccount>): _80.DelayedVestingAccount;
                fromProtoMsg(message: _80.DelayedVestingAccountProtoMsg): _80.DelayedVestingAccount;
                toProto(message: _80.DelayedVestingAccount): Uint8Array;
                toProtoMsg(message: _80.DelayedVestingAccount): _80.DelayedVestingAccountProtoMsg;
            };
            Period: {
                typeUrl: string;
                encode(message: _80.Period, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.Period;
                fromJSON(object: any): _80.Period;
                toJSON(message: _80.Period): import("../json-safe.js").JsonSafe<_80.Period>;
                fromPartial(object: Partial<_80.Period>): _80.Period;
                fromProtoMsg(message: _80.PeriodProtoMsg): _80.Period;
                toProto(message: _80.Period): Uint8Array;
                toProtoMsg(message: _80.Period): _80.PeriodProtoMsg;
            };
            PeriodicVestingAccount: {
                typeUrl: string;
                encode(message: _80.PeriodicVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.PeriodicVestingAccount;
                fromJSON(object: any): _80.PeriodicVestingAccount;
                toJSON(message: _80.PeriodicVestingAccount): import("../json-safe.js").JsonSafe<_80.PeriodicVestingAccount>;
                fromPartial(object: Partial<_80.PeriodicVestingAccount>): _80.PeriodicVestingAccount;
                fromProtoMsg(message: _80.PeriodicVestingAccountProtoMsg): _80.PeriodicVestingAccount;
                toProto(message: _80.PeriodicVestingAccount): Uint8Array;
                toProtoMsg(message: _80.PeriodicVestingAccount): _80.PeriodicVestingAccountProtoMsg;
            };
            PermanentLockedAccount: {
                typeUrl: string;
                encode(message: _80.PermanentLockedAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.PermanentLockedAccount;
                fromJSON(object: any): _80.PermanentLockedAccount;
                toJSON(message: _80.PermanentLockedAccount): import("../json-safe.js").JsonSafe<_80.PermanentLockedAccount>;
                fromPartial(object: Partial<_80.PermanentLockedAccount>): _80.PermanentLockedAccount;
                fromProtoMsg(message: _80.PermanentLockedAccountProtoMsg): _80.PermanentLockedAccount;
                toProto(message: _80.PermanentLockedAccount): Uint8Array;
                toProtoMsg(message: _80.PermanentLockedAccount): _80.PermanentLockedAccountProtoMsg;
            };
            ClawbackVestingAccount: {
                typeUrl: string;
                encode(message: _80.ClawbackVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _80.ClawbackVestingAccount;
                fromJSON(object: any): _80.ClawbackVestingAccount;
                toJSON(message: _80.ClawbackVestingAccount): import("../json-safe.js").JsonSafe<_80.ClawbackVestingAccount>;
                fromPartial(object: Partial<_80.ClawbackVestingAccount>): _80.ClawbackVestingAccount;
                fromProtoMsg(message: _80.ClawbackVestingAccountProtoMsg): _80.ClawbackVestingAccount;
                toProto(message: _80.ClawbackVestingAccount): Uint8Array;
                toProtoMsg(message: _80.ClawbackVestingAccount): _80.ClawbackVestingAccountProtoMsg;
            };
            MsgCreateVestingAccount: {
                typeUrl: string;
                encode(message: _79.MsgCreateVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreateVestingAccount;
                fromJSON(object: any): _79.MsgCreateVestingAccount;
                toJSON(message: _79.MsgCreateVestingAccount): import("../json-safe.js").JsonSafe<_79.MsgCreateVestingAccount>;
                fromPartial(object: Partial<_79.MsgCreateVestingAccount>): _79.MsgCreateVestingAccount;
                fromProtoMsg(message: _79.MsgCreateVestingAccountProtoMsg): _79.MsgCreateVestingAccount;
                toProto(message: _79.MsgCreateVestingAccount): Uint8Array;
                toProtoMsg(message: _79.MsgCreateVestingAccount): _79.MsgCreateVestingAccountProtoMsg;
            };
            MsgCreateVestingAccountResponse: {
                typeUrl: string;
                encode(_: _79.MsgCreateVestingAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreateVestingAccountResponse;
                fromJSON(_: any): _79.MsgCreateVestingAccountResponse;
                toJSON(_: _79.MsgCreateVestingAccountResponse): import("../json-safe.js").JsonSafe<_79.MsgCreateVestingAccountResponse>;
                fromPartial(_: Partial<_79.MsgCreateVestingAccountResponse>): _79.MsgCreateVestingAccountResponse;
                fromProtoMsg(message: _79.MsgCreateVestingAccountResponseProtoMsg): _79.MsgCreateVestingAccountResponse;
                toProto(message: _79.MsgCreateVestingAccountResponse): Uint8Array;
                toProtoMsg(message: _79.MsgCreateVestingAccountResponse): _79.MsgCreateVestingAccountResponseProtoMsg;
            };
            MsgCreatePermanentLockedAccount: {
                typeUrl: string;
                encode(message: _79.MsgCreatePermanentLockedAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreatePermanentLockedAccount;
                fromJSON(object: any): _79.MsgCreatePermanentLockedAccount;
                toJSON(message: _79.MsgCreatePermanentLockedAccount): import("../json-safe.js").JsonSafe<_79.MsgCreatePermanentLockedAccount>;
                fromPartial(object: Partial<_79.MsgCreatePermanentLockedAccount>): _79.MsgCreatePermanentLockedAccount;
                fromProtoMsg(message: _79.MsgCreatePermanentLockedAccountProtoMsg): _79.MsgCreatePermanentLockedAccount;
                toProto(message: _79.MsgCreatePermanentLockedAccount): Uint8Array;
                toProtoMsg(message: _79.MsgCreatePermanentLockedAccount): _79.MsgCreatePermanentLockedAccountProtoMsg;
            };
            MsgCreatePermanentLockedAccountResponse: {
                typeUrl: string;
                encode(_: _79.MsgCreatePermanentLockedAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreatePermanentLockedAccountResponse;
                fromJSON(_: any): _79.MsgCreatePermanentLockedAccountResponse;
                toJSON(_: _79.MsgCreatePermanentLockedAccountResponse): import("../json-safe.js").JsonSafe<_79.MsgCreatePermanentLockedAccountResponse>;
                fromPartial(_: Partial<_79.MsgCreatePermanentLockedAccountResponse>): _79.MsgCreatePermanentLockedAccountResponse;
                fromProtoMsg(message: _79.MsgCreatePermanentLockedAccountResponseProtoMsg): _79.MsgCreatePermanentLockedAccountResponse;
                toProto(message: _79.MsgCreatePermanentLockedAccountResponse): Uint8Array;
                toProtoMsg(message: _79.MsgCreatePermanentLockedAccountResponse): _79.MsgCreatePermanentLockedAccountResponseProtoMsg;
            };
            MsgCreatePeriodicVestingAccount: {
                typeUrl: string;
                encode(message: _79.MsgCreatePeriodicVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreatePeriodicVestingAccount;
                fromJSON(object: any): _79.MsgCreatePeriodicVestingAccount;
                toJSON(message: _79.MsgCreatePeriodicVestingAccount): import("../json-safe.js").JsonSafe<_79.MsgCreatePeriodicVestingAccount>;
                fromPartial(object: Partial<_79.MsgCreatePeriodicVestingAccount>): _79.MsgCreatePeriodicVestingAccount;
                fromProtoMsg(message: _79.MsgCreatePeriodicVestingAccountProtoMsg): _79.MsgCreatePeriodicVestingAccount;
                toProto(message: _79.MsgCreatePeriodicVestingAccount): Uint8Array;
                toProtoMsg(message: _79.MsgCreatePeriodicVestingAccount): _79.MsgCreatePeriodicVestingAccountProtoMsg;
            };
            MsgCreatePeriodicVestingAccountResponse: {
                typeUrl: string;
                encode(_: _79.MsgCreatePeriodicVestingAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreatePeriodicVestingAccountResponse;
                fromJSON(_: any): _79.MsgCreatePeriodicVestingAccountResponse;
                toJSON(_: _79.MsgCreatePeriodicVestingAccountResponse): import("../json-safe.js").JsonSafe<_79.MsgCreatePeriodicVestingAccountResponse>;
                fromPartial(_: Partial<_79.MsgCreatePeriodicVestingAccountResponse>): _79.MsgCreatePeriodicVestingAccountResponse;
                fromProtoMsg(message: _79.MsgCreatePeriodicVestingAccountResponseProtoMsg): _79.MsgCreatePeriodicVestingAccountResponse;
                toProto(message: _79.MsgCreatePeriodicVestingAccountResponse): Uint8Array;
                toProtoMsg(message: _79.MsgCreatePeriodicVestingAccountResponse): _79.MsgCreatePeriodicVestingAccountResponseProtoMsg;
            };
            MsgCreateClawbackVestingAccount: {
                typeUrl: string;
                encode(message: _79.MsgCreateClawbackVestingAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreateClawbackVestingAccount;
                fromJSON(object: any): _79.MsgCreateClawbackVestingAccount;
                toJSON(message: _79.MsgCreateClawbackVestingAccount): import("../json-safe.js").JsonSafe<_79.MsgCreateClawbackVestingAccount>;
                fromPartial(object: Partial<_79.MsgCreateClawbackVestingAccount>): _79.MsgCreateClawbackVestingAccount;
                fromProtoMsg(message: _79.MsgCreateClawbackVestingAccountProtoMsg): _79.MsgCreateClawbackVestingAccount;
                toProto(message: _79.MsgCreateClawbackVestingAccount): Uint8Array;
                toProtoMsg(message: _79.MsgCreateClawbackVestingAccount): _79.MsgCreateClawbackVestingAccountProtoMsg;
            };
            MsgCreateClawbackVestingAccountResponse: {
                typeUrl: string;
                encode(_: _79.MsgCreateClawbackVestingAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgCreateClawbackVestingAccountResponse;
                fromJSON(_: any): _79.MsgCreateClawbackVestingAccountResponse;
                toJSON(_: _79.MsgCreateClawbackVestingAccountResponse): import("../json-safe.js").JsonSafe<_79.MsgCreateClawbackVestingAccountResponse>;
                fromPartial(_: Partial<_79.MsgCreateClawbackVestingAccountResponse>): _79.MsgCreateClawbackVestingAccountResponse;
                fromProtoMsg(message: _79.MsgCreateClawbackVestingAccountResponseProtoMsg): _79.MsgCreateClawbackVestingAccountResponse;
                toProto(message: _79.MsgCreateClawbackVestingAccountResponse): Uint8Array;
                toProtoMsg(message: _79.MsgCreateClawbackVestingAccountResponse): _79.MsgCreateClawbackVestingAccountResponseProtoMsg;
            };
            MsgClawback: {
                typeUrl: string;
                encode(message: _79.MsgClawback, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgClawback;
                fromJSON(object: any): _79.MsgClawback;
                toJSON(message: _79.MsgClawback): import("../json-safe.js").JsonSafe<_79.MsgClawback>;
                fromPartial(object: Partial<_79.MsgClawback>): _79.MsgClawback;
                fromProtoMsg(message: _79.MsgClawbackProtoMsg): _79.MsgClawback;
                toProto(message: _79.MsgClawback): Uint8Array;
                toProtoMsg(message: _79.MsgClawback): _79.MsgClawbackProtoMsg;
            };
            MsgClawbackResponse: {
                typeUrl: string;
                encode(_: _79.MsgClawbackResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgClawbackResponse;
                fromJSON(_: any): _79.MsgClawbackResponse;
                toJSON(_: _79.MsgClawbackResponse): import("../json-safe.js").JsonSafe<_79.MsgClawbackResponse>;
                fromPartial(_: Partial<_79.MsgClawbackResponse>): _79.MsgClawbackResponse;
                fromProtoMsg(message: _79.MsgClawbackResponseProtoMsg): _79.MsgClawbackResponse;
                toProto(message: _79.MsgClawbackResponse): Uint8Array;
                toProtoMsg(message: _79.MsgClawbackResponse): _79.MsgClawbackResponseProtoMsg;
            };
            MsgReturnGrants: {
                typeUrl: string;
                encode(message: _79.MsgReturnGrants, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgReturnGrants;
                fromJSON(object: any): _79.MsgReturnGrants;
                toJSON(message: _79.MsgReturnGrants): import("../json-safe.js").JsonSafe<_79.MsgReturnGrants>;
                fromPartial(object: Partial<_79.MsgReturnGrants>): _79.MsgReturnGrants;
                fromProtoMsg(message: _79.MsgReturnGrantsProtoMsg): _79.MsgReturnGrants;
                toProto(message: _79.MsgReturnGrants): Uint8Array;
                toProtoMsg(message: _79.MsgReturnGrants): _79.MsgReturnGrantsProtoMsg;
            };
            MsgReturnGrantsResponse: {
                typeUrl: string;
                encode(_: _79.MsgReturnGrantsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _79.MsgReturnGrantsResponse;
                fromJSON(_: any): _79.MsgReturnGrantsResponse;
                toJSON(_: _79.MsgReturnGrantsResponse): import("../json-safe.js").JsonSafe<_79.MsgReturnGrantsResponse>;
                fromPartial(_: Partial<_79.MsgReturnGrantsResponse>): _79.MsgReturnGrantsResponse;
                fromProtoMsg(message: _79.MsgReturnGrantsResponseProtoMsg): _79.MsgReturnGrantsResponse;
                toProto(message: _79.MsgReturnGrantsResponse): Uint8Array;
                toProtoMsg(message: _79.MsgReturnGrantsResponse): _79.MsgReturnGrantsResponseProtoMsg;
            };
        };
    }
}
