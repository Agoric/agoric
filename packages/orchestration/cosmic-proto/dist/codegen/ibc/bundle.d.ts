import * as _87 from './applications/interchain_accounts/controller/v1/controller.js';
import * as _88 from './applications/interchain_accounts/controller/v1/query.js';
import * as _89 from './applications/interchain_accounts/controller/v1/tx.js';
import * as _90 from './applications/interchain_accounts/genesis/v1/genesis.js';
import * as _91 from './applications/interchain_accounts/host/v1/host.js';
import * as _92 from './applications/interchain_accounts/host/v1/query.js';
import * as _93 from './applications/interchain_accounts/v1/account.js';
import * as _94 from './applications/interchain_accounts/v1/metadata.js';
import * as _95 from './applications/interchain_accounts/v1/packet.js';
import * as _96 from './applications/transfer/v1/authz.js';
import * as _97 from './applications/transfer/v1/genesis.js';
import * as _98 from './applications/transfer/v1/query.js';
import * as _99 from './applications/transfer/v1/transfer.js';
import * as _100 from './applications/transfer/v1/tx.js';
import * as _101 from './applications/transfer/v2/packet.js';
import * as _102 from './core/channel/v1/channel.js';
import * as _103 from './core/channel/v1/genesis.js';
import * as _104 from './core/channel/v1/query.js';
import * as _105 from './core/channel/v1/tx.js';
import * as _106 from './core/client/v1/client.js';
import * as _107 from './core/client/v1/genesis.js';
import * as _108 from './core/client/v1/query.js';
import * as _109 from './core/client/v1/tx.js';
import * as _110 from './core/commitment/v1/commitment.js';
import * as _111 from './core/connection/v1/connection.js';
import * as _112 from './core/connection/v1/genesis.js';
import * as _113 from './core/connection/v1/query.js';
import * as _114 from './core/connection/v1/tx.js';
import * as _115 from './lightclients/localhost/v1/localhost.js';
import * as _116 from './lightclients/solomachine/v1/solomachine.js';
import * as _117 from './lightclients/solomachine/v2/solomachine.js';
import * as _118 from './lightclients/tendermint/v1/tendermint.js';
export declare namespace ibc {
    namespace applications {
        namespace interchain_accounts {
            namespace controller {
                const v1: {
                    MsgRegisterInterchainAccount: {
                        typeUrl: string;
                        encode(message: _89.MsgRegisterInterchainAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _89.MsgRegisterInterchainAccount;
                        fromJSON(object: any): _89.MsgRegisterInterchainAccount;
                        toJSON(message: _89.MsgRegisterInterchainAccount): import("../json-safe.js").JsonSafe<_89.MsgRegisterInterchainAccount>;
                        fromPartial(object: Partial<_89.MsgRegisterInterchainAccount>): _89.MsgRegisterInterchainAccount;
                        fromProtoMsg(message: _89.MsgRegisterInterchainAccountProtoMsg): _89.MsgRegisterInterchainAccount;
                        toProto(message: _89.MsgRegisterInterchainAccount): Uint8Array;
                        toProtoMsg(message: _89.MsgRegisterInterchainAccount): _89.MsgRegisterInterchainAccountProtoMsg;
                    };
                    MsgRegisterInterchainAccountResponse: {
                        typeUrl: string;
                        encode(message: _89.MsgRegisterInterchainAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _89.MsgRegisterInterchainAccountResponse;
                        fromJSON(object: any): _89.MsgRegisterInterchainAccountResponse;
                        toJSON(message: _89.MsgRegisterInterchainAccountResponse): import("../json-safe.js").JsonSafe<_89.MsgRegisterInterchainAccountResponse>;
                        fromPartial(object: Partial<_89.MsgRegisterInterchainAccountResponse>): _89.MsgRegisterInterchainAccountResponse;
                        fromProtoMsg(message: _89.MsgRegisterInterchainAccountResponseProtoMsg): _89.MsgRegisterInterchainAccountResponse;
                        toProto(message: _89.MsgRegisterInterchainAccountResponse): Uint8Array;
                        toProtoMsg(message: _89.MsgRegisterInterchainAccountResponse): _89.MsgRegisterInterchainAccountResponseProtoMsg;
                    };
                    MsgSendTx: {
                        typeUrl: string;
                        encode(message: _89.MsgSendTx, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _89.MsgSendTx;
                        fromJSON(object: any): _89.MsgSendTx;
                        toJSON(message: _89.MsgSendTx): import("../json-safe.js").JsonSafe<_89.MsgSendTx>;
                        fromPartial(object: Partial<_89.MsgSendTx>): _89.MsgSendTx;
                        fromProtoMsg(message: _89.MsgSendTxProtoMsg): _89.MsgSendTx;
                        toProto(message: _89.MsgSendTx): Uint8Array;
                        toProtoMsg(message: _89.MsgSendTx): _89.MsgSendTxProtoMsg;
                    };
                    MsgSendTxResponse: {
                        typeUrl: string;
                        encode(message: _89.MsgSendTxResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _89.MsgSendTxResponse;
                        fromJSON(object: any): _89.MsgSendTxResponse;
                        toJSON(message: _89.MsgSendTxResponse): import("../json-safe.js").JsonSafe<_89.MsgSendTxResponse>;
                        fromPartial(object: Partial<_89.MsgSendTxResponse>): _89.MsgSendTxResponse;
                        fromProtoMsg(message: _89.MsgSendTxResponseProtoMsg): _89.MsgSendTxResponse;
                        toProto(message: _89.MsgSendTxResponse): Uint8Array;
                        toProtoMsg(message: _89.MsgSendTxResponse): _89.MsgSendTxResponseProtoMsg;
                    };
                    QueryInterchainAccountRequest: {
                        typeUrl: string;
                        encode(message: _88.QueryInterchainAccountRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _88.QueryInterchainAccountRequest;
                        fromJSON(object: any): _88.QueryInterchainAccountRequest;
                        toJSON(message: _88.QueryInterchainAccountRequest): import("../json-safe.js").JsonSafe<_88.QueryInterchainAccountRequest>;
                        fromPartial(object: Partial<_88.QueryInterchainAccountRequest>): _88.QueryInterchainAccountRequest;
                        fromProtoMsg(message: _88.QueryInterchainAccountRequestProtoMsg): _88.QueryInterchainAccountRequest;
                        toProto(message: _88.QueryInterchainAccountRequest): Uint8Array;
                        toProtoMsg(message: _88.QueryInterchainAccountRequest): _88.QueryInterchainAccountRequestProtoMsg;
                    };
                    QueryInterchainAccountResponse: {
                        typeUrl: string;
                        encode(message: _88.QueryInterchainAccountResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _88.QueryInterchainAccountResponse;
                        fromJSON(object: any): _88.QueryInterchainAccountResponse;
                        toJSON(message: _88.QueryInterchainAccountResponse): import("../json-safe.js").JsonSafe<_88.QueryInterchainAccountResponse>;
                        fromPartial(object: Partial<_88.QueryInterchainAccountResponse>): _88.QueryInterchainAccountResponse;
                        fromProtoMsg(message: _88.QueryInterchainAccountResponseProtoMsg): _88.QueryInterchainAccountResponse;
                        toProto(message: _88.QueryInterchainAccountResponse): Uint8Array;
                        toProtoMsg(message: _88.QueryInterchainAccountResponse): _88.QueryInterchainAccountResponseProtoMsg;
                    };
                    QueryParamsRequest: {
                        typeUrl: string;
                        encode(_: _88.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _88.QueryParamsRequest;
                        fromJSON(_: any): _88.QueryParamsRequest;
                        toJSON(_: _88.QueryParamsRequest): import("../json-safe.js").JsonSafe<_88.QueryParamsRequest>;
                        fromPartial(_: Partial<_88.QueryParamsRequest>): _88.QueryParamsRequest;
                        fromProtoMsg(message: _88.QueryParamsRequestProtoMsg): _88.QueryParamsRequest;
                        toProto(message: _88.QueryParamsRequest): Uint8Array;
                        toProtoMsg(message: _88.QueryParamsRequest): _88.QueryParamsRequestProtoMsg;
                    };
                    QueryParamsResponse: {
                        typeUrl: string;
                        encode(message: _88.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _88.QueryParamsResponse;
                        fromJSON(object: any): _88.QueryParamsResponse;
                        toJSON(message: _88.QueryParamsResponse): import("../json-safe.js").JsonSafe<_88.QueryParamsResponse>;
                        fromPartial(object: Partial<_88.QueryParamsResponse>): _88.QueryParamsResponse;
                        fromProtoMsg(message: _88.QueryParamsResponseProtoMsg): _88.QueryParamsResponse;
                        toProto(message: _88.QueryParamsResponse): Uint8Array;
                        toProtoMsg(message: _88.QueryParamsResponse): _88.QueryParamsResponseProtoMsg;
                    };
                    Params: {
                        typeUrl: string;
                        encode(message: _87.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _87.Params;
                        fromJSON(object: any): _87.Params;
                        toJSON(message: _87.Params): import("../json-safe.js").JsonSafe<_87.Params>;
                        fromPartial(object: Partial<_87.Params>): _87.Params;
                        fromProtoMsg(message: _87.ParamsProtoMsg): _87.Params;
                        toProto(message: _87.Params): Uint8Array;
                        toProtoMsg(message: _87.Params): _87.ParamsProtoMsg;
                    };
                };
            }
            namespace genesis {
                const v1: {
                    GenesisState: {
                        typeUrl: string;
                        encode(message: _90.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _90.GenesisState;
                        fromJSON(object: any): _90.GenesisState;
                        toJSON(message: _90.GenesisState): import("../json-safe.js").JsonSafe<_90.GenesisState>;
                        fromPartial(object: Partial<_90.GenesisState>): _90.GenesisState;
                        fromProtoMsg(message: _90.GenesisStateProtoMsg): _90.GenesisState;
                        toProto(message: _90.GenesisState): Uint8Array;
                        toProtoMsg(message: _90.GenesisState): _90.GenesisStateProtoMsg;
                    };
                    ControllerGenesisState: {
                        typeUrl: string;
                        encode(message: _90.ControllerGenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _90.ControllerGenesisState;
                        fromJSON(object: any): _90.ControllerGenesisState;
                        toJSON(message: _90.ControllerGenesisState): import("../json-safe.js").JsonSafe<_90.ControllerGenesisState>;
                        fromPartial(object: Partial<_90.ControllerGenesisState>): _90.ControllerGenesisState;
                        fromProtoMsg(message: _90.ControllerGenesisStateProtoMsg): _90.ControllerGenesisState;
                        toProto(message: _90.ControllerGenesisState): Uint8Array;
                        toProtoMsg(message: _90.ControllerGenesisState): _90.ControllerGenesisStateProtoMsg;
                    };
                    HostGenesisState: {
                        typeUrl: string;
                        encode(message: _90.HostGenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _90.HostGenesisState;
                        fromJSON(object: any): _90.HostGenesisState;
                        toJSON(message: _90.HostGenesisState): import("../json-safe.js").JsonSafe<_90.HostGenesisState>;
                        fromPartial(object: Partial<_90.HostGenesisState>): _90.HostGenesisState;
                        fromProtoMsg(message: _90.HostGenesisStateProtoMsg): _90.HostGenesisState;
                        toProto(message: _90.HostGenesisState): Uint8Array;
                        toProtoMsg(message: _90.HostGenesisState): _90.HostGenesisStateProtoMsg;
                    };
                    ActiveChannel: {
                        typeUrl: string;
                        encode(message: _90.ActiveChannel, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _90.ActiveChannel;
                        fromJSON(object: any): _90.ActiveChannel;
                        toJSON(message: _90.ActiveChannel): import("../json-safe.js").JsonSafe<_90.ActiveChannel>;
                        fromPartial(object: Partial<_90.ActiveChannel>): _90.ActiveChannel;
                        fromProtoMsg(message: _90.ActiveChannelProtoMsg): _90.ActiveChannel;
                        toProto(message: _90.ActiveChannel): Uint8Array;
                        toProtoMsg(message: _90.ActiveChannel): _90.ActiveChannelProtoMsg;
                    };
                    RegisteredInterchainAccount: {
                        typeUrl: string;
                        encode(message: _90.RegisteredInterchainAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _90.RegisteredInterchainAccount;
                        fromJSON(object: any): _90.RegisteredInterchainAccount;
                        toJSON(message: _90.RegisteredInterchainAccount): import("../json-safe.js").JsonSafe<_90.RegisteredInterchainAccount>;
                        fromPartial(object: Partial<_90.RegisteredInterchainAccount>): _90.RegisteredInterchainAccount;
                        fromProtoMsg(message: _90.RegisteredInterchainAccountProtoMsg): _90.RegisteredInterchainAccount;
                        toProto(message: _90.RegisteredInterchainAccount): Uint8Array;
                        toProtoMsg(message: _90.RegisteredInterchainAccount): _90.RegisteredInterchainAccountProtoMsg;
                    };
                };
            }
            namespace host {
                const v1: {
                    QueryParamsRequest: {
                        typeUrl: string;
                        encode(_: _92.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _92.QueryParamsRequest;
                        fromJSON(_: any): _92.QueryParamsRequest;
                        toJSON(_: _92.QueryParamsRequest): import("../json-safe.js").JsonSafe<_92.QueryParamsRequest>;
                        fromPartial(_: Partial<_92.QueryParamsRequest>): _92.QueryParamsRequest;
                        fromProtoMsg(message: _92.QueryParamsRequestProtoMsg): _92.QueryParamsRequest;
                        toProto(message: _92.QueryParamsRequest): Uint8Array;
                        toProtoMsg(message: _92.QueryParamsRequest): _92.QueryParamsRequestProtoMsg;
                    };
                    QueryParamsResponse: {
                        typeUrl: string;
                        encode(message: _92.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _92.QueryParamsResponse;
                        fromJSON(object: any): _92.QueryParamsResponse;
                        toJSON(message: _92.QueryParamsResponse): import("../json-safe.js").JsonSafe<_92.QueryParamsResponse>;
                        fromPartial(object: Partial<_92.QueryParamsResponse>): _92.QueryParamsResponse;
                        fromProtoMsg(message: _92.QueryParamsResponseProtoMsg): _92.QueryParamsResponse;
                        toProto(message: _92.QueryParamsResponse): Uint8Array;
                        toProtoMsg(message: _92.QueryParamsResponse): _92.QueryParamsResponseProtoMsg;
                    };
                    Params: {
                        typeUrl: string;
                        encode(message: _91.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                        decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _91.Params;
                        fromJSON(object: any): _91.Params;
                        toJSON(message: _91.Params): import("../json-safe.js").JsonSafe<_91.Params>;
                        fromPartial(object: Partial<_91.Params>): _91.Params;
                        fromProtoMsg(message: _91.ParamsProtoMsg): _91.Params;
                        toProto(message: _91.Params): Uint8Array;
                        toProtoMsg(message: _91.Params): _91.ParamsProtoMsg;
                    };
                };
            }
            const v1: {
                typeFromJSON(object: any): _95.Type;
                typeToJSON(object: _95.Type): string;
                Type: typeof _95.Type;
                TypeSDKType: typeof _95.Type;
                InterchainAccountPacketData: {
                    typeUrl: string;
                    encode(message: _95.InterchainAccountPacketData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _95.InterchainAccountPacketData;
                    fromJSON(object: any): _95.InterchainAccountPacketData;
                    toJSON(message: _95.InterchainAccountPacketData): import("../json-safe.js").JsonSafe<_95.InterchainAccountPacketData>;
                    fromPartial(object: Partial<_95.InterchainAccountPacketData>): _95.InterchainAccountPacketData;
                    fromProtoMsg(message: _95.InterchainAccountPacketDataProtoMsg): _95.InterchainAccountPacketData;
                    toProto(message: _95.InterchainAccountPacketData): Uint8Array;
                    toProtoMsg(message: _95.InterchainAccountPacketData): _95.InterchainAccountPacketDataProtoMsg;
                };
                CosmosTx: {
                    typeUrl: string;
                    encode(message: _95.CosmosTx, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _95.CosmosTx;
                    fromJSON(object: any): _95.CosmosTx;
                    toJSON(message: _95.CosmosTx): import("../json-safe.js").JsonSafe<_95.CosmosTx>;
                    fromPartial(object: Partial<_95.CosmosTx>): _95.CosmosTx;
                    fromProtoMsg(message: _95.CosmosTxProtoMsg): _95.CosmosTx;
                    toProto(message: _95.CosmosTx): Uint8Array;
                    toProtoMsg(message: _95.CosmosTx): _95.CosmosTxProtoMsg;
                };
                Metadata: {
                    typeUrl: string;
                    encode(message: _94.Metadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _94.Metadata;
                    fromJSON(object: any): _94.Metadata;
                    toJSON(message: _94.Metadata): import("../json-safe.js").JsonSafe<_94.Metadata>;
                    fromPartial(object: Partial<_94.Metadata>): _94.Metadata;
                    fromProtoMsg(message: _94.MetadataProtoMsg): _94.Metadata;
                    toProto(message: _94.Metadata): Uint8Array;
                    toProtoMsg(message: _94.Metadata): _94.MetadataProtoMsg;
                };
                InterchainAccount: {
                    typeUrl: string;
                    encode(message: _93.InterchainAccount, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _93.InterchainAccount;
                    fromJSON(object: any): _93.InterchainAccount;
                    toJSON(message: _93.InterchainAccount): import("../json-safe.js").JsonSafe<_93.InterchainAccount>;
                    fromPartial(object: Partial<_93.InterchainAccount>): _93.InterchainAccount;
                    fromProtoMsg(message: _93.InterchainAccountProtoMsg): _93.InterchainAccount;
                    toProto(message: _93.InterchainAccount): Uint8Array;
                    toProtoMsg(message: _93.InterchainAccount): _93.InterchainAccountProtoMsg;
                };
            };
        }
        namespace transfer {
            const v1: {
                MsgTransfer: {
                    typeUrl: string;
                    encode(message: _100.MsgTransfer, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _100.MsgTransfer;
                    fromJSON(object: any): _100.MsgTransfer;
                    toJSON(message: _100.MsgTransfer): import("../json-safe.js").JsonSafe<_100.MsgTransfer>;
                    fromPartial(object: Partial<_100.MsgTransfer>): _100.MsgTransfer;
                    fromProtoMsg(message: _100.MsgTransferProtoMsg): _100.MsgTransfer;
                    toProto(message: _100.MsgTransfer): Uint8Array;
                    toProtoMsg(message: _100.MsgTransfer): _100.MsgTransferProtoMsg;
                };
                MsgTransferResponse: {
                    typeUrl: string;
                    encode(message: _100.MsgTransferResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _100.MsgTransferResponse;
                    fromJSON(object: any): _100.MsgTransferResponse;
                    toJSON(message: _100.MsgTransferResponse): import("../json-safe.js").JsonSafe<_100.MsgTransferResponse>;
                    fromPartial(object: Partial<_100.MsgTransferResponse>): _100.MsgTransferResponse;
                    fromProtoMsg(message: _100.MsgTransferResponseProtoMsg): _100.MsgTransferResponse;
                    toProto(message: _100.MsgTransferResponse): Uint8Array;
                    toProtoMsg(message: _100.MsgTransferResponse): _100.MsgTransferResponseProtoMsg;
                };
                DenomTrace: {
                    typeUrl: string;
                    encode(message: _99.DenomTrace, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _99.DenomTrace;
                    fromJSON(object: any): _99.DenomTrace;
                    toJSON(message: _99.DenomTrace): import("../json-safe.js").JsonSafe<_99.DenomTrace>;
                    fromPartial(object: Partial<_99.DenomTrace>): _99.DenomTrace;
                    fromProtoMsg(message: _99.DenomTraceProtoMsg): _99.DenomTrace;
                    toProto(message: _99.DenomTrace): Uint8Array;
                    toProtoMsg(message: _99.DenomTrace): _99.DenomTraceProtoMsg;
                };
                Params: {
                    typeUrl: string;
                    encode(message: _99.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _99.Params;
                    fromJSON(object: any): _99.Params;
                    toJSON(message: _99.Params): import("../json-safe.js").JsonSafe<_99.Params>;
                    fromPartial(object: Partial<_99.Params>): _99.Params;
                    fromProtoMsg(message: _99.ParamsProtoMsg): _99.Params;
                    toProto(message: _99.Params): Uint8Array;
                    toProtoMsg(message: _99.Params): _99.ParamsProtoMsg;
                };
                QueryDenomTraceRequest: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomTraceRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomTraceRequest;
                    fromJSON(object: any): _98.QueryDenomTraceRequest;
                    toJSON(message: _98.QueryDenomTraceRequest): import("../json-safe.js").JsonSafe<_98.QueryDenomTraceRequest>;
                    fromPartial(object: Partial<_98.QueryDenomTraceRequest>): _98.QueryDenomTraceRequest;
                    fromProtoMsg(message: _98.QueryDenomTraceRequestProtoMsg): _98.QueryDenomTraceRequest;
                    toProto(message: _98.QueryDenomTraceRequest): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomTraceRequest): _98.QueryDenomTraceRequestProtoMsg;
                };
                QueryDenomTraceResponse: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomTraceResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomTraceResponse;
                    fromJSON(object: any): _98.QueryDenomTraceResponse;
                    toJSON(message: _98.QueryDenomTraceResponse): import("../json-safe.js").JsonSafe<_98.QueryDenomTraceResponse>;
                    fromPartial(object: Partial<_98.QueryDenomTraceResponse>): _98.QueryDenomTraceResponse;
                    fromProtoMsg(message: _98.QueryDenomTraceResponseProtoMsg): _98.QueryDenomTraceResponse;
                    toProto(message: _98.QueryDenomTraceResponse): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomTraceResponse): _98.QueryDenomTraceResponseProtoMsg;
                };
                QueryDenomTracesRequest: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomTracesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomTracesRequest;
                    fromJSON(object: any): _98.QueryDenomTracesRequest;
                    toJSON(message: _98.QueryDenomTracesRequest): import("../json-safe.js").JsonSafe<_98.QueryDenomTracesRequest>;
                    fromPartial(object: Partial<_98.QueryDenomTracesRequest>): _98.QueryDenomTracesRequest;
                    fromProtoMsg(message: _98.QueryDenomTracesRequestProtoMsg): _98.QueryDenomTracesRequest;
                    toProto(message: _98.QueryDenomTracesRequest): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomTracesRequest): _98.QueryDenomTracesRequestProtoMsg;
                };
                QueryDenomTracesResponse: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomTracesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomTracesResponse;
                    fromJSON(object: any): _98.QueryDenomTracesResponse;
                    toJSON(message: _98.QueryDenomTracesResponse): import("../json-safe.js").JsonSafe<_98.QueryDenomTracesResponse>;
                    fromPartial(object: Partial<_98.QueryDenomTracesResponse>): _98.QueryDenomTracesResponse;
                    fromProtoMsg(message: _98.QueryDenomTracesResponseProtoMsg): _98.QueryDenomTracesResponse;
                    toProto(message: _98.QueryDenomTracesResponse): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomTracesResponse): _98.QueryDenomTracesResponseProtoMsg;
                };
                QueryParamsRequest: {
                    typeUrl: string;
                    encode(_: _98.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryParamsRequest;
                    fromJSON(_: any): _98.QueryParamsRequest;
                    toJSON(_: _98.QueryParamsRequest): import("../json-safe.js").JsonSafe<_98.QueryParamsRequest>;
                    fromPartial(_: Partial<_98.QueryParamsRequest>): _98.QueryParamsRequest;
                    fromProtoMsg(message: _98.QueryParamsRequestProtoMsg): _98.QueryParamsRequest;
                    toProto(message: _98.QueryParamsRequest): Uint8Array;
                    toProtoMsg(message: _98.QueryParamsRequest): _98.QueryParamsRequestProtoMsg;
                };
                QueryParamsResponse: {
                    typeUrl: string;
                    encode(message: _98.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryParamsResponse;
                    fromJSON(object: any): _98.QueryParamsResponse;
                    toJSON(message: _98.QueryParamsResponse): import("../json-safe.js").JsonSafe<_98.QueryParamsResponse>;
                    fromPartial(object: Partial<_98.QueryParamsResponse>): _98.QueryParamsResponse;
                    fromProtoMsg(message: _98.QueryParamsResponseProtoMsg): _98.QueryParamsResponse;
                    toProto(message: _98.QueryParamsResponse): Uint8Array;
                    toProtoMsg(message: _98.QueryParamsResponse): _98.QueryParamsResponseProtoMsg;
                };
                QueryDenomHashRequest: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomHashRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomHashRequest;
                    fromJSON(object: any): _98.QueryDenomHashRequest;
                    toJSON(message: _98.QueryDenomHashRequest): import("../json-safe.js").JsonSafe<_98.QueryDenomHashRequest>;
                    fromPartial(object: Partial<_98.QueryDenomHashRequest>): _98.QueryDenomHashRequest;
                    fromProtoMsg(message: _98.QueryDenomHashRequestProtoMsg): _98.QueryDenomHashRequest;
                    toProto(message: _98.QueryDenomHashRequest): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomHashRequest): _98.QueryDenomHashRequestProtoMsg;
                };
                QueryDenomHashResponse: {
                    typeUrl: string;
                    encode(message: _98.QueryDenomHashResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryDenomHashResponse;
                    fromJSON(object: any): _98.QueryDenomHashResponse;
                    toJSON(message: _98.QueryDenomHashResponse): import("../json-safe.js").JsonSafe<_98.QueryDenomHashResponse>;
                    fromPartial(object: Partial<_98.QueryDenomHashResponse>): _98.QueryDenomHashResponse;
                    fromProtoMsg(message: _98.QueryDenomHashResponseProtoMsg): _98.QueryDenomHashResponse;
                    toProto(message: _98.QueryDenomHashResponse): Uint8Array;
                    toProtoMsg(message: _98.QueryDenomHashResponse): _98.QueryDenomHashResponseProtoMsg;
                };
                QueryEscrowAddressRequest: {
                    typeUrl: string;
                    encode(message: _98.QueryEscrowAddressRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryEscrowAddressRequest;
                    fromJSON(object: any): _98.QueryEscrowAddressRequest;
                    toJSON(message: _98.QueryEscrowAddressRequest): import("../json-safe.js").JsonSafe<_98.QueryEscrowAddressRequest>;
                    fromPartial(object: Partial<_98.QueryEscrowAddressRequest>): _98.QueryEscrowAddressRequest;
                    fromProtoMsg(message: _98.QueryEscrowAddressRequestProtoMsg): _98.QueryEscrowAddressRequest;
                    toProto(message: _98.QueryEscrowAddressRequest): Uint8Array;
                    toProtoMsg(message: _98.QueryEscrowAddressRequest): _98.QueryEscrowAddressRequestProtoMsg;
                };
                QueryEscrowAddressResponse: {
                    typeUrl: string;
                    encode(message: _98.QueryEscrowAddressResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _98.QueryEscrowAddressResponse;
                    fromJSON(object: any): _98.QueryEscrowAddressResponse;
                    toJSON(message: _98.QueryEscrowAddressResponse): import("../json-safe.js").JsonSafe<_98.QueryEscrowAddressResponse>;
                    fromPartial(object: Partial<_98.QueryEscrowAddressResponse>): _98.QueryEscrowAddressResponse;
                    fromProtoMsg(message: _98.QueryEscrowAddressResponseProtoMsg): _98.QueryEscrowAddressResponse;
                    toProto(message: _98.QueryEscrowAddressResponse): Uint8Array;
                    toProtoMsg(message: _98.QueryEscrowAddressResponse): _98.QueryEscrowAddressResponseProtoMsg;
                };
                GenesisState: {
                    typeUrl: string;
                    encode(message: _97.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _97.GenesisState;
                    fromJSON(object: any): _97.GenesisState;
                    toJSON(message: _97.GenesisState): import("../json-safe.js").JsonSafe<_97.GenesisState>;
                    fromPartial(object: Partial<_97.GenesisState>): _97.GenesisState;
                    fromProtoMsg(message: _97.GenesisStateProtoMsg): _97.GenesisState;
                    toProto(message: _97.GenesisState): Uint8Array;
                    toProtoMsg(message: _97.GenesisState): _97.GenesisStateProtoMsg;
                };
                Allocation: {
                    typeUrl: string;
                    encode(message: _96.Allocation, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _96.Allocation;
                    fromJSON(object: any): _96.Allocation;
                    toJSON(message: _96.Allocation): import("../json-safe.js").JsonSafe<_96.Allocation>;
                    fromPartial(object: Partial<_96.Allocation>): _96.Allocation;
                    fromProtoMsg(message: _96.AllocationProtoMsg): _96.Allocation;
                    toProto(message: _96.Allocation): Uint8Array;
                    toProtoMsg(message: _96.Allocation): _96.AllocationProtoMsg;
                };
                TransferAuthorization: {
                    typeUrl: string;
                    encode(message: _96.TransferAuthorization, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _96.TransferAuthorization;
                    fromJSON(object: any): _96.TransferAuthorization;
                    toJSON(message: _96.TransferAuthorization): import("../json-safe.js").JsonSafe<_96.TransferAuthorization>;
                    fromPartial(object: Partial<_96.TransferAuthorization>): _96.TransferAuthorization;
                    fromProtoMsg(message: _96.TransferAuthorizationProtoMsg): _96.TransferAuthorization;
                    toProto(message: _96.TransferAuthorization): Uint8Array;
                    toProtoMsg(message: _96.TransferAuthorization): _96.TransferAuthorizationProtoMsg;
                };
            };
            const v2: {
                FungibleTokenPacketData: {
                    typeUrl: string;
                    encode(message: _101.FungibleTokenPacketData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _101.FungibleTokenPacketData;
                    fromJSON(object: any): _101.FungibleTokenPacketData;
                    toJSON(message: _101.FungibleTokenPacketData): import("../json-safe.js").JsonSafe<_101.FungibleTokenPacketData>;
                    fromPartial(object: Partial<_101.FungibleTokenPacketData>): _101.FungibleTokenPacketData;
                    fromProtoMsg(message: _101.FungibleTokenPacketDataProtoMsg): _101.FungibleTokenPacketData;
                    toProto(message: _101.FungibleTokenPacketData): Uint8Array;
                    toProtoMsg(message: _101.FungibleTokenPacketData): _101.FungibleTokenPacketDataProtoMsg;
                };
            };
        }
    }
    namespace core {
        namespace channel {
            const v1: {
                responseResultTypeFromJSON(object: any): _105.ResponseResultType;
                responseResultTypeToJSON(object: _105.ResponseResultType): string;
                ResponseResultType: typeof _105.ResponseResultType;
                ResponseResultTypeSDKType: typeof _105.ResponseResultType;
                MsgChannelOpenInit: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenInit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenInit;
                    fromJSON(object: any): _105.MsgChannelOpenInit;
                    toJSON(message: _105.MsgChannelOpenInit): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenInit>;
                    fromPartial(object: Partial<_105.MsgChannelOpenInit>): _105.MsgChannelOpenInit;
                    fromProtoMsg(message: _105.MsgChannelOpenInitProtoMsg): _105.MsgChannelOpenInit;
                    toProto(message: _105.MsgChannelOpenInit): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenInit): _105.MsgChannelOpenInitProtoMsg;
                };
                MsgChannelOpenInitResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenInitResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenInitResponse;
                    fromJSON(object: any): _105.MsgChannelOpenInitResponse;
                    toJSON(message: _105.MsgChannelOpenInitResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenInitResponse>;
                    fromPartial(object: Partial<_105.MsgChannelOpenInitResponse>): _105.MsgChannelOpenInitResponse;
                    fromProtoMsg(message: _105.MsgChannelOpenInitResponseProtoMsg): _105.MsgChannelOpenInitResponse;
                    toProto(message: _105.MsgChannelOpenInitResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenInitResponse): _105.MsgChannelOpenInitResponseProtoMsg;
                };
                MsgChannelOpenTry: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenTry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenTry;
                    fromJSON(object: any): _105.MsgChannelOpenTry;
                    toJSON(message: _105.MsgChannelOpenTry): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenTry>;
                    fromPartial(object: Partial<_105.MsgChannelOpenTry>): _105.MsgChannelOpenTry;
                    fromProtoMsg(message: _105.MsgChannelOpenTryProtoMsg): _105.MsgChannelOpenTry;
                    toProto(message: _105.MsgChannelOpenTry): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenTry): _105.MsgChannelOpenTryProtoMsg;
                };
                MsgChannelOpenTryResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenTryResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenTryResponse;
                    fromJSON(object: any): _105.MsgChannelOpenTryResponse;
                    toJSON(message: _105.MsgChannelOpenTryResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenTryResponse>;
                    fromPartial(object: Partial<_105.MsgChannelOpenTryResponse>): _105.MsgChannelOpenTryResponse;
                    fromProtoMsg(message: _105.MsgChannelOpenTryResponseProtoMsg): _105.MsgChannelOpenTryResponse;
                    toProto(message: _105.MsgChannelOpenTryResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenTryResponse): _105.MsgChannelOpenTryResponseProtoMsg;
                };
                MsgChannelOpenAck: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenAck, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenAck;
                    fromJSON(object: any): _105.MsgChannelOpenAck;
                    toJSON(message: _105.MsgChannelOpenAck): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenAck>;
                    fromPartial(object: Partial<_105.MsgChannelOpenAck>): _105.MsgChannelOpenAck;
                    fromProtoMsg(message: _105.MsgChannelOpenAckProtoMsg): _105.MsgChannelOpenAck;
                    toProto(message: _105.MsgChannelOpenAck): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenAck): _105.MsgChannelOpenAckProtoMsg;
                };
                MsgChannelOpenAckResponse: {
                    typeUrl: string;
                    encode(_: _105.MsgChannelOpenAckResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenAckResponse;
                    fromJSON(_: any): _105.MsgChannelOpenAckResponse;
                    toJSON(_: _105.MsgChannelOpenAckResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenAckResponse>;
                    fromPartial(_: Partial<_105.MsgChannelOpenAckResponse>): _105.MsgChannelOpenAckResponse;
                    fromProtoMsg(message: _105.MsgChannelOpenAckResponseProtoMsg): _105.MsgChannelOpenAckResponse;
                    toProto(message: _105.MsgChannelOpenAckResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenAckResponse): _105.MsgChannelOpenAckResponseProtoMsg;
                };
                MsgChannelOpenConfirm: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelOpenConfirm, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenConfirm;
                    fromJSON(object: any): _105.MsgChannelOpenConfirm;
                    toJSON(message: _105.MsgChannelOpenConfirm): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenConfirm>;
                    fromPartial(object: Partial<_105.MsgChannelOpenConfirm>): _105.MsgChannelOpenConfirm;
                    fromProtoMsg(message: _105.MsgChannelOpenConfirmProtoMsg): _105.MsgChannelOpenConfirm;
                    toProto(message: _105.MsgChannelOpenConfirm): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenConfirm): _105.MsgChannelOpenConfirmProtoMsg;
                };
                MsgChannelOpenConfirmResponse: {
                    typeUrl: string;
                    encode(_: _105.MsgChannelOpenConfirmResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelOpenConfirmResponse;
                    fromJSON(_: any): _105.MsgChannelOpenConfirmResponse;
                    toJSON(_: _105.MsgChannelOpenConfirmResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelOpenConfirmResponse>;
                    fromPartial(_: Partial<_105.MsgChannelOpenConfirmResponse>): _105.MsgChannelOpenConfirmResponse;
                    fromProtoMsg(message: _105.MsgChannelOpenConfirmResponseProtoMsg): _105.MsgChannelOpenConfirmResponse;
                    toProto(message: _105.MsgChannelOpenConfirmResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelOpenConfirmResponse): _105.MsgChannelOpenConfirmResponseProtoMsg;
                };
                MsgChannelCloseInit: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelCloseInit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelCloseInit;
                    fromJSON(object: any): _105.MsgChannelCloseInit;
                    toJSON(message: _105.MsgChannelCloseInit): import("../json-safe.js").JsonSafe<_105.MsgChannelCloseInit>;
                    fromPartial(object: Partial<_105.MsgChannelCloseInit>): _105.MsgChannelCloseInit;
                    fromProtoMsg(message: _105.MsgChannelCloseInitProtoMsg): _105.MsgChannelCloseInit;
                    toProto(message: _105.MsgChannelCloseInit): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelCloseInit): _105.MsgChannelCloseInitProtoMsg;
                };
                MsgChannelCloseInitResponse: {
                    typeUrl: string;
                    encode(_: _105.MsgChannelCloseInitResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelCloseInitResponse;
                    fromJSON(_: any): _105.MsgChannelCloseInitResponse;
                    toJSON(_: _105.MsgChannelCloseInitResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelCloseInitResponse>;
                    fromPartial(_: Partial<_105.MsgChannelCloseInitResponse>): _105.MsgChannelCloseInitResponse;
                    fromProtoMsg(message: _105.MsgChannelCloseInitResponseProtoMsg): _105.MsgChannelCloseInitResponse;
                    toProto(message: _105.MsgChannelCloseInitResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelCloseInitResponse): _105.MsgChannelCloseInitResponseProtoMsg;
                };
                MsgChannelCloseConfirm: {
                    typeUrl: string;
                    encode(message: _105.MsgChannelCloseConfirm, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelCloseConfirm;
                    fromJSON(object: any): _105.MsgChannelCloseConfirm;
                    toJSON(message: _105.MsgChannelCloseConfirm): import("../json-safe.js").JsonSafe<_105.MsgChannelCloseConfirm>;
                    fromPartial(object: Partial<_105.MsgChannelCloseConfirm>): _105.MsgChannelCloseConfirm;
                    fromProtoMsg(message: _105.MsgChannelCloseConfirmProtoMsg): _105.MsgChannelCloseConfirm;
                    toProto(message: _105.MsgChannelCloseConfirm): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelCloseConfirm): _105.MsgChannelCloseConfirmProtoMsg;
                };
                MsgChannelCloseConfirmResponse: {
                    typeUrl: string;
                    encode(_: _105.MsgChannelCloseConfirmResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgChannelCloseConfirmResponse;
                    fromJSON(_: any): _105.MsgChannelCloseConfirmResponse;
                    toJSON(_: _105.MsgChannelCloseConfirmResponse): import("../json-safe.js").JsonSafe<_105.MsgChannelCloseConfirmResponse>;
                    fromPartial(_: Partial<_105.MsgChannelCloseConfirmResponse>): _105.MsgChannelCloseConfirmResponse;
                    fromProtoMsg(message: _105.MsgChannelCloseConfirmResponseProtoMsg): _105.MsgChannelCloseConfirmResponse;
                    toProto(message: _105.MsgChannelCloseConfirmResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgChannelCloseConfirmResponse): _105.MsgChannelCloseConfirmResponseProtoMsg;
                };
                MsgRecvPacket: {
                    typeUrl: string;
                    encode(message: _105.MsgRecvPacket, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgRecvPacket;
                    fromJSON(object: any): _105.MsgRecvPacket;
                    toJSON(message: _105.MsgRecvPacket): import("../json-safe.js").JsonSafe<_105.MsgRecvPacket>;
                    fromPartial(object: Partial<_105.MsgRecvPacket>): _105.MsgRecvPacket;
                    fromProtoMsg(message: _105.MsgRecvPacketProtoMsg): _105.MsgRecvPacket;
                    toProto(message: _105.MsgRecvPacket): Uint8Array;
                    toProtoMsg(message: _105.MsgRecvPacket): _105.MsgRecvPacketProtoMsg;
                };
                MsgRecvPacketResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgRecvPacketResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgRecvPacketResponse;
                    fromJSON(object: any): _105.MsgRecvPacketResponse;
                    toJSON(message: _105.MsgRecvPacketResponse): import("../json-safe.js").JsonSafe<_105.MsgRecvPacketResponse>;
                    fromPartial(object: Partial<_105.MsgRecvPacketResponse>): _105.MsgRecvPacketResponse;
                    fromProtoMsg(message: _105.MsgRecvPacketResponseProtoMsg): _105.MsgRecvPacketResponse;
                    toProto(message: _105.MsgRecvPacketResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgRecvPacketResponse): _105.MsgRecvPacketResponseProtoMsg;
                };
                MsgTimeout: {
                    typeUrl: string;
                    encode(message: _105.MsgTimeout, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgTimeout;
                    fromJSON(object: any): _105.MsgTimeout;
                    toJSON(message: _105.MsgTimeout): import("../json-safe.js").JsonSafe<_105.MsgTimeout>;
                    fromPartial(object: Partial<_105.MsgTimeout>): _105.MsgTimeout;
                    fromProtoMsg(message: _105.MsgTimeoutProtoMsg): _105.MsgTimeout;
                    toProto(message: _105.MsgTimeout): Uint8Array;
                    toProtoMsg(message: _105.MsgTimeout): _105.MsgTimeoutProtoMsg;
                };
                MsgTimeoutResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgTimeoutResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgTimeoutResponse;
                    fromJSON(object: any): _105.MsgTimeoutResponse;
                    toJSON(message: _105.MsgTimeoutResponse): import("../json-safe.js").JsonSafe<_105.MsgTimeoutResponse>;
                    fromPartial(object: Partial<_105.MsgTimeoutResponse>): _105.MsgTimeoutResponse;
                    fromProtoMsg(message: _105.MsgTimeoutResponseProtoMsg): _105.MsgTimeoutResponse;
                    toProto(message: _105.MsgTimeoutResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgTimeoutResponse): _105.MsgTimeoutResponseProtoMsg;
                };
                MsgTimeoutOnClose: {
                    typeUrl: string;
                    encode(message: _105.MsgTimeoutOnClose, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgTimeoutOnClose;
                    fromJSON(object: any): _105.MsgTimeoutOnClose;
                    toJSON(message: _105.MsgTimeoutOnClose): import("../json-safe.js").JsonSafe<_105.MsgTimeoutOnClose>;
                    fromPartial(object: Partial<_105.MsgTimeoutOnClose>): _105.MsgTimeoutOnClose;
                    fromProtoMsg(message: _105.MsgTimeoutOnCloseProtoMsg): _105.MsgTimeoutOnClose;
                    toProto(message: _105.MsgTimeoutOnClose): Uint8Array;
                    toProtoMsg(message: _105.MsgTimeoutOnClose): _105.MsgTimeoutOnCloseProtoMsg;
                };
                MsgTimeoutOnCloseResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgTimeoutOnCloseResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgTimeoutOnCloseResponse;
                    fromJSON(object: any): _105.MsgTimeoutOnCloseResponse;
                    toJSON(message: _105.MsgTimeoutOnCloseResponse): import("../json-safe.js").JsonSafe<_105.MsgTimeoutOnCloseResponse>;
                    fromPartial(object: Partial<_105.MsgTimeoutOnCloseResponse>): _105.MsgTimeoutOnCloseResponse;
                    fromProtoMsg(message: _105.MsgTimeoutOnCloseResponseProtoMsg): _105.MsgTimeoutOnCloseResponse;
                    toProto(message: _105.MsgTimeoutOnCloseResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgTimeoutOnCloseResponse): _105.MsgTimeoutOnCloseResponseProtoMsg;
                };
                MsgAcknowledgement: {
                    typeUrl: string;
                    encode(message: _105.MsgAcknowledgement, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgAcknowledgement;
                    fromJSON(object: any): _105.MsgAcknowledgement;
                    toJSON(message: _105.MsgAcknowledgement): import("../json-safe.js").JsonSafe<_105.MsgAcknowledgement>;
                    fromPartial(object: Partial<_105.MsgAcknowledgement>): _105.MsgAcknowledgement;
                    fromProtoMsg(message: _105.MsgAcknowledgementProtoMsg): _105.MsgAcknowledgement;
                    toProto(message: _105.MsgAcknowledgement): Uint8Array;
                    toProtoMsg(message: _105.MsgAcknowledgement): _105.MsgAcknowledgementProtoMsg;
                };
                MsgAcknowledgementResponse: {
                    typeUrl: string;
                    encode(message: _105.MsgAcknowledgementResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _105.MsgAcknowledgementResponse;
                    fromJSON(object: any): _105.MsgAcknowledgementResponse;
                    toJSON(message: _105.MsgAcknowledgementResponse): import("../json-safe.js").JsonSafe<_105.MsgAcknowledgementResponse>;
                    fromPartial(object: Partial<_105.MsgAcknowledgementResponse>): _105.MsgAcknowledgementResponse;
                    fromProtoMsg(message: _105.MsgAcknowledgementResponseProtoMsg): _105.MsgAcknowledgementResponse;
                    toProto(message: _105.MsgAcknowledgementResponse): Uint8Array;
                    toProtoMsg(message: _105.MsgAcknowledgementResponse): _105.MsgAcknowledgementResponseProtoMsg;
                };
                QueryChannelRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelRequest;
                    fromJSON(object: any): _104.QueryChannelRequest;
                    toJSON(message: _104.QueryChannelRequest): import("../json-safe.js").JsonSafe<_104.QueryChannelRequest>;
                    fromPartial(object: Partial<_104.QueryChannelRequest>): _104.QueryChannelRequest;
                    fromProtoMsg(message: _104.QueryChannelRequestProtoMsg): _104.QueryChannelRequest;
                    toProto(message: _104.QueryChannelRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelRequest): _104.QueryChannelRequestProtoMsg;
                };
                QueryChannelResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelResponse;
                    fromJSON(object: any): _104.QueryChannelResponse;
                    toJSON(message: _104.QueryChannelResponse): import("../json-safe.js").JsonSafe<_104.QueryChannelResponse>;
                    fromPartial(object: Partial<_104.QueryChannelResponse>): _104.QueryChannelResponse;
                    fromProtoMsg(message: _104.QueryChannelResponseProtoMsg): _104.QueryChannelResponse;
                    toProto(message: _104.QueryChannelResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelResponse): _104.QueryChannelResponseProtoMsg;
                };
                QueryChannelsRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelsRequest;
                    fromJSON(object: any): _104.QueryChannelsRequest;
                    toJSON(message: _104.QueryChannelsRequest): import("../json-safe.js").JsonSafe<_104.QueryChannelsRequest>;
                    fromPartial(object: Partial<_104.QueryChannelsRequest>): _104.QueryChannelsRequest;
                    fromProtoMsg(message: _104.QueryChannelsRequestProtoMsg): _104.QueryChannelsRequest;
                    toProto(message: _104.QueryChannelsRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelsRequest): _104.QueryChannelsRequestProtoMsg;
                };
                QueryChannelsResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelsResponse;
                    fromJSON(object: any): _104.QueryChannelsResponse;
                    toJSON(message: _104.QueryChannelsResponse): import("../json-safe.js").JsonSafe<_104.QueryChannelsResponse>;
                    fromPartial(object: Partial<_104.QueryChannelsResponse>): _104.QueryChannelsResponse;
                    fromProtoMsg(message: _104.QueryChannelsResponseProtoMsg): _104.QueryChannelsResponse;
                    toProto(message: _104.QueryChannelsResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelsResponse): _104.QueryChannelsResponseProtoMsg;
                };
                QueryConnectionChannelsRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryConnectionChannelsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryConnectionChannelsRequest;
                    fromJSON(object: any): _104.QueryConnectionChannelsRequest;
                    toJSON(message: _104.QueryConnectionChannelsRequest): import("../json-safe.js").JsonSafe<_104.QueryConnectionChannelsRequest>;
                    fromPartial(object: Partial<_104.QueryConnectionChannelsRequest>): _104.QueryConnectionChannelsRequest;
                    fromProtoMsg(message: _104.QueryConnectionChannelsRequestProtoMsg): _104.QueryConnectionChannelsRequest;
                    toProto(message: _104.QueryConnectionChannelsRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryConnectionChannelsRequest): _104.QueryConnectionChannelsRequestProtoMsg;
                };
                QueryConnectionChannelsResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryConnectionChannelsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryConnectionChannelsResponse;
                    fromJSON(object: any): _104.QueryConnectionChannelsResponse;
                    toJSON(message: _104.QueryConnectionChannelsResponse): import("../json-safe.js").JsonSafe<_104.QueryConnectionChannelsResponse>;
                    fromPartial(object: Partial<_104.QueryConnectionChannelsResponse>): _104.QueryConnectionChannelsResponse;
                    fromProtoMsg(message: _104.QueryConnectionChannelsResponseProtoMsg): _104.QueryConnectionChannelsResponse;
                    toProto(message: _104.QueryConnectionChannelsResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryConnectionChannelsResponse): _104.QueryConnectionChannelsResponseProtoMsg;
                };
                QueryChannelClientStateRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelClientStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelClientStateRequest;
                    fromJSON(object: any): _104.QueryChannelClientStateRequest;
                    toJSON(message: _104.QueryChannelClientStateRequest): import("../json-safe.js").JsonSafe<_104.QueryChannelClientStateRequest>;
                    fromPartial(object: Partial<_104.QueryChannelClientStateRequest>): _104.QueryChannelClientStateRequest;
                    fromProtoMsg(message: _104.QueryChannelClientStateRequestProtoMsg): _104.QueryChannelClientStateRequest;
                    toProto(message: _104.QueryChannelClientStateRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelClientStateRequest): _104.QueryChannelClientStateRequestProtoMsg;
                };
                QueryChannelClientStateResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelClientStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelClientStateResponse;
                    fromJSON(object: any): _104.QueryChannelClientStateResponse;
                    toJSON(message: _104.QueryChannelClientStateResponse): import("../json-safe.js").JsonSafe<_104.QueryChannelClientStateResponse>;
                    fromPartial(object: Partial<_104.QueryChannelClientStateResponse>): _104.QueryChannelClientStateResponse;
                    fromProtoMsg(message: _104.QueryChannelClientStateResponseProtoMsg): _104.QueryChannelClientStateResponse;
                    toProto(message: _104.QueryChannelClientStateResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelClientStateResponse): _104.QueryChannelClientStateResponseProtoMsg;
                };
                QueryChannelConsensusStateRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelConsensusStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelConsensusStateRequest;
                    fromJSON(object: any): _104.QueryChannelConsensusStateRequest;
                    toJSON(message: _104.QueryChannelConsensusStateRequest): import("../json-safe.js").JsonSafe<_104.QueryChannelConsensusStateRequest>;
                    fromPartial(object: Partial<_104.QueryChannelConsensusStateRequest>): _104.QueryChannelConsensusStateRequest;
                    fromProtoMsg(message: _104.QueryChannelConsensusStateRequestProtoMsg): _104.QueryChannelConsensusStateRequest;
                    toProto(message: _104.QueryChannelConsensusStateRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelConsensusStateRequest): _104.QueryChannelConsensusStateRequestProtoMsg;
                };
                QueryChannelConsensusStateResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryChannelConsensusStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryChannelConsensusStateResponse;
                    fromJSON(object: any): _104.QueryChannelConsensusStateResponse;
                    toJSON(message: _104.QueryChannelConsensusStateResponse): import("../json-safe.js").JsonSafe<_104.QueryChannelConsensusStateResponse>;
                    fromPartial(object: Partial<_104.QueryChannelConsensusStateResponse>): _104.QueryChannelConsensusStateResponse;
                    fromProtoMsg(message: _104.QueryChannelConsensusStateResponseProtoMsg): _104.QueryChannelConsensusStateResponse;
                    toProto(message: _104.QueryChannelConsensusStateResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryChannelConsensusStateResponse): _104.QueryChannelConsensusStateResponseProtoMsg;
                };
                QueryPacketCommitmentRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketCommitmentRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketCommitmentRequest;
                    fromJSON(object: any): _104.QueryPacketCommitmentRequest;
                    toJSON(message: _104.QueryPacketCommitmentRequest): import("../json-safe.js").JsonSafe<_104.QueryPacketCommitmentRequest>;
                    fromPartial(object: Partial<_104.QueryPacketCommitmentRequest>): _104.QueryPacketCommitmentRequest;
                    fromProtoMsg(message: _104.QueryPacketCommitmentRequestProtoMsg): _104.QueryPacketCommitmentRequest;
                    toProto(message: _104.QueryPacketCommitmentRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketCommitmentRequest): _104.QueryPacketCommitmentRequestProtoMsg;
                };
                QueryPacketCommitmentResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketCommitmentResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketCommitmentResponse;
                    fromJSON(object: any): _104.QueryPacketCommitmentResponse;
                    toJSON(message: _104.QueryPacketCommitmentResponse): import("../json-safe.js").JsonSafe<_104.QueryPacketCommitmentResponse>;
                    fromPartial(object: Partial<_104.QueryPacketCommitmentResponse>): _104.QueryPacketCommitmentResponse;
                    fromProtoMsg(message: _104.QueryPacketCommitmentResponseProtoMsg): _104.QueryPacketCommitmentResponse;
                    toProto(message: _104.QueryPacketCommitmentResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketCommitmentResponse): _104.QueryPacketCommitmentResponseProtoMsg;
                };
                QueryPacketCommitmentsRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketCommitmentsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketCommitmentsRequest;
                    fromJSON(object: any): _104.QueryPacketCommitmentsRequest;
                    toJSON(message: _104.QueryPacketCommitmentsRequest): import("../json-safe.js").JsonSafe<_104.QueryPacketCommitmentsRequest>;
                    fromPartial(object: Partial<_104.QueryPacketCommitmentsRequest>): _104.QueryPacketCommitmentsRequest;
                    fromProtoMsg(message: _104.QueryPacketCommitmentsRequestProtoMsg): _104.QueryPacketCommitmentsRequest;
                    toProto(message: _104.QueryPacketCommitmentsRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketCommitmentsRequest): _104.QueryPacketCommitmentsRequestProtoMsg;
                };
                QueryPacketCommitmentsResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketCommitmentsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketCommitmentsResponse;
                    fromJSON(object: any): _104.QueryPacketCommitmentsResponse;
                    toJSON(message: _104.QueryPacketCommitmentsResponse): import("../json-safe.js").JsonSafe<_104.QueryPacketCommitmentsResponse>;
                    fromPartial(object: Partial<_104.QueryPacketCommitmentsResponse>): _104.QueryPacketCommitmentsResponse;
                    fromProtoMsg(message: _104.QueryPacketCommitmentsResponseProtoMsg): _104.QueryPacketCommitmentsResponse;
                    toProto(message: _104.QueryPacketCommitmentsResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketCommitmentsResponse): _104.QueryPacketCommitmentsResponseProtoMsg;
                };
                QueryPacketReceiptRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketReceiptRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketReceiptRequest;
                    fromJSON(object: any): _104.QueryPacketReceiptRequest;
                    toJSON(message: _104.QueryPacketReceiptRequest): import("../json-safe.js").JsonSafe<_104.QueryPacketReceiptRequest>;
                    fromPartial(object: Partial<_104.QueryPacketReceiptRequest>): _104.QueryPacketReceiptRequest;
                    fromProtoMsg(message: _104.QueryPacketReceiptRequestProtoMsg): _104.QueryPacketReceiptRequest;
                    toProto(message: _104.QueryPacketReceiptRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketReceiptRequest): _104.QueryPacketReceiptRequestProtoMsg;
                };
                QueryPacketReceiptResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketReceiptResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketReceiptResponse;
                    fromJSON(object: any): _104.QueryPacketReceiptResponse;
                    toJSON(message: _104.QueryPacketReceiptResponse): import("../json-safe.js").JsonSafe<_104.QueryPacketReceiptResponse>;
                    fromPartial(object: Partial<_104.QueryPacketReceiptResponse>): _104.QueryPacketReceiptResponse;
                    fromProtoMsg(message: _104.QueryPacketReceiptResponseProtoMsg): _104.QueryPacketReceiptResponse;
                    toProto(message: _104.QueryPacketReceiptResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketReceiptResponse): _104.QueryPacketReceiptResponseProtoMsg;
                };
                QueryPacketAcknowledgementRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketAcknowledgementRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketAcknowledgementRequest;
                    fromJSON(object: any): _104.QueryPacketAcknowledgementRequest;
                    toJSON(message: _104.QueryPacketAcknowledgementRequest): import("../json-safe.js").JsonSafe<_104.QueryPacketAcknowledgementRequest>;
                    fromPartial(object: Partial<_104.QueryPacketAcknowledgementRequest>): _104.QueryPacketAcknowledgementRequest;
                    fromProtoMsg(message: _104.QueryPacketAcknowledgementRequestProtoMsg): _104.QueryPacketAcknowledgementRequest;
                    toProto(message: _104.QueryPacketAcknowledgementRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketAcknowledgementRequest): _104.QueryPacketAcknowledgementRequestProtoMsg;
                };
                QueryPacketAcknowledgementResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketAcknowledgementResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketAcknowledgementResponse;
                    fromJSON(object: any): _104.QueryPacketAcknowledgementResponse;
                    toJSON(message: _104.QueryPacketAcknowledgementResponse): import("../json-safe.js").JsonSafe<_104.QueryPacketAcknowledgementResponse>;
                    fromPartial(object: Partial<_104.QueryPacketAcknowledgementResponse>): _104.QueryPacketAcknowledgementResponse;
                    fromProtoMsg(message: _104.QueryPacketAcknowledgementResponseProtoMsg): _104.QueryPacketAcknowledgementResponse;
                    toProto(message: _104.QueryPacketAcknowledgementResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketAcknowledgementResponse): _104.QueryPacketAcknowledgementResponseProtoMsg;
                };
                QueryPacketAcknowledgementsRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketAcknowledgementsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketAcknowledgementsRequest;
                    fromJSON(object: any): _104.QueryPacketAcknowledgementsRequest;
                    toJSON(message: _104.QueryPacketAcknowledgementsRequest): import("../json-safe.js").JsonSafe<_104.QueryPacketAcknowledgementsRequest>;
                    fromPartial(object: Partial<_104.QueryPacketAcknowledgementsRequest>): _104.QueryPacketAcknowledgementsRequest;
                    fromProtoMsg(message: _104.QueryPacketAcknowledgementsRequestProtoMsg): _104.QueryPacketAcknowledgementsRequest;
                    toProto(message: _104.QueryPacketAcknowledgementsRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketAcknowledgementsRequest): _104.QueryPacketAcknowledgementsRequestProtoMsg;
                };
                QueryPacketAcknowledgementsResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryPacketAcknowledgementsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryPacketAcknowledgementsResponse;
                    fromJSON(object: any): _104.QueryPacketAcknowledgementsResponse;
                    toJSON(message: _104.QueryPacketAcknowledgementsResponse): import("../json-safe.js").JsonSafe<_104.QueryPacketAcknowledgementsResponse>;
                    fromPartial(object: Partial<_104.QueryPacketAcknowledgementsResponse>): _104.QueryPacketAcknowledgementsResponse;
                    fromProtoMsg(message: _104.QueryPacketAcknowledgementsResponseProtoMsg): _104.QueryPacketAcknowledgementsResponse;
                    toProto(message: _104.QueryPacketAcknowledgementsResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryPacketAcknowledgementsResponse): _104.QueryPacketAcknowledgementsResponseProtoMsg;
                };
                QueryUnreceivedPacketsRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryUnreceivedPacketsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryUnreceivedPacketsRequest;
                    fromJSON(object: any): _104.QueryUnreceivedPacketsRequest;
                    toJSON(message: _104.QueryUnreceivedPacketsRequest): import("../json-safe.js").JsonSafe<_104.QueryUnreceivedPacketsRequest>;
                    fromPartial(object: Partial<_104.QueryUnreceivedPacketsRequest>): _104.QueryUnreceivedPacketsRequest;
                    fromProtoMsg(message: _104.QueryUnreceivedPacketsRequestProtoMsg): _104.QueryUnreceivedPacketsRequest;
                    toProto(message: _104.QueryUnreceivedPacketsRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryUnreceivedPacketsRequest): _104.QueryUnreceivedPacketsRequestProtoMsg;
                };
                QueryUnreceivedPacketsResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryUnreceivedPacketsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryUnreceivedPacketsResponse;
                    fromJSON(object: any): _104.QueryUnreceivedPacketsResponse;
                    toJSON(message: _104.QueryUnreceivedPacketsResponse): import("../json-safe.js").JsonSafe<_104.QueryUnreceivedPacketsResponse>;
                    fromPartial(object: Partial<_104.QueryUnreceivedPacketsResponse>): _104.QueryUnreceivedPacketsResponse;
                    fromProtoMsg(message: _104.QueryUnreceivedPacketsResponseProtoMsg): _104.QueryUnreceivedPacketsResponse;
                    toProto(message: _104.QueryUnreceivedPacketsResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryUnreceivedPacketsResponse): _104.QueryUnreceivedPacketsResponseProtoMsg;
                };
                QueryUnreceivedAcksRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryUnreceivedAcksRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryUnreceivedAcksRequest;
                    fromJSON(object: any): _104.QueryUnreceivedAcksRequest;
                    toJSON(message: _104.QueryUnreceivedAcksRequest): import("../json-safe.js").JsonSafe<_104.QueryUnreceivedAcksRequest>;
                    fromPartial(object: Partial<_104.QueryUnreceivedAcksRequest>): _104.QueryUnreceivedAcksRequest;
                    fromProtoMsg(message: _104.QueryUnreceivedAcksRequestProtoMsg): _104.QueryUnreceivedAcksRequest;
                    toProto(message: _104.QueryUnreceivedAcksRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryUnreceivedAcksRequest): _104.QueryUnreceivedAcksRequestProtoMsg;
                };
                QueryUnreceivedAcksResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryUnreceivedAcksResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryUnreceivedAcksResponse;
                    fromJSON(object: any): _104.QueryUnreceivedAcksResponse;
                    toJSON(message: _104.QueryUnreceivedAcksResponse): import("../json-safe.js").JsonSafe<_104.QueryUnreceivedAcksResponse>;
                    fromPartial(object: Partial<_104.QueryUnreceivedAcksResponse>): _104.QueryUnreceivedAcksResponse;
                    fromProtoMsg(message: _104.QueryUnreceivedAcksResponseProtoMsg): _104.QueryUnreceivedAcksResponse;
                    toProto(message: _104.QueryUnreceivedAcksResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryUnreceivedAcksResponse): _104.QueryUnreceivedAcksResponseProtoMsg;
                };
                QueryNextSequenceReceiveRequest: {
                    typeUrl: string;
                    encode(message: _104.QueryNextSequenceReceiveRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryNextSequenceReceiveRequest;
                    fromJSON(object: any): _104.QueryNextSequenceReceiveRequest;
                    toJSON(message: _104.QueryNextSequenceReceiveRequest): import("../json-safe.js").JsonSafe<_104.QueryNextSequenceReceiveRequest>;
                    fromPartial(object: Partial<_104.QueryNextSequenceReceiveRequest>): _104.QueryNextSequenceReceiveRequest;
                    fromProtoMsg(message: _104.QueryNextSequenceReceiveRequestProtoMsg): _104.QueryNextSequenceReceiveRequest;
                    toProto(message: _104.QueryNextSequenceReceiveRequest): Uint8Array;
                    toProtoMsg(message: _104.QueryNextSequenceReceiveRequest): _104.QueryNextSequenceReceiveRequestProtoMsg;
                };
                QueryNextSequenceReceiveResponse: {
                    typeUrl: string;
                    encode(message: _104.QueryNextSequenceReceiveResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _104.QueryNextSequenceReceiveResponse;
                    fromJSON(object: any): _104.QueryNextSequenceReceiveResponse;
                    toJSON(message: _104.QueryNextSequenceReceiveResponse): import("../json-safe.js").JsonSafe<_104.QueryNextSequenceReceiveResponse>;
                    fromPartial(object: Partial<_104.QueryNextSequenceReceiveResponse>): _104.QueryNextSequenceReceiveResponse;
                    fromProtoMsg(message: _104.QueryNextSequenceReceiveResponseProtoMsg): _104.QueryNextSequenceReceiveResponse;
                    toProto(message: _104.QueryNextSequenceReceiveResponse): Uint8Array;
                    toProtoMsg(message: _104.QueryNextSequenceReceiveResponse): _104.QueryNextSequenceReceiveResponseProtoMsg;
                };
                GenesisState: {
                    typeUrl: string;
                    encode(message: _103.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _103.GenesisState;
                    fromJSON(object: any): _103.GenesisState;
                    toJSON(message: _103.GenesisState): import("../json-safe.js").JsonSafe<_103.GenesisState>;
                    fromPartial(object: Partial<_103.GenesisState>): _103.GenesisState;
                    fromProtoMsg(message: _103.GenesisStateProtoMsg): _103.GenesisState;
                    toProto(message: _103.GenesisState): Uint8Array;
                    toProtoMsg(message: _103.GenesisState): _103.GenesisStateProtoMsg;
                };
                PacketSequence: {
                    typeUrl: string;
                    encode(message: _103.PacketSequence, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _103.PacketSequence;
                    fromJSON(object: any): _103.PacketSequence;
                    toJSON(message: _103.PacketSequence): import("../json-safe.js").JsonSafe<_103.PacketSequence>;
                    fromPartial(object: Partial<_103.PacketSequence>): _103.PacketSequence;
                    fromProtoMsg(message: _103.PacketSequenceProtoMsg): _103.PacketSequence;
                    toProto(message: _103.PacketSequence): Uint8Array;
                    toProtoMsg(message: _103.PacketSequence): _103.PacketSequenceProtoMsg;
                };
                stateFromJSON(object: any): _102.State;
                stateToJSON(object: _102.State): string;
                orderFromJSON(object: any): _102.Order;
                orderToJSON(object: _102.Order): string;
                State: typeof _102.State;
                StateSDKType: typeof _102.State;
                Order: typeof _102.Order;
                OrderSDKType: typeof _102.Order;
                Channel: {
                    typeUrl: string;
                    encode(message: _102.Channel, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.Channel;
                    fromJSON(object: any): _102.Channel;
                    toJSON(message: _102.Channel): import("../json-safe.js").JsonSafe<_102.Channel>;
                    fromPartial(object: Partial<_102.Channel>): _102.Channel;
                    fromProtoMsg(message: _102.ChannelProtoMsg): _102.Channel;
                    toProto(message: _102.Channel): Uint8Array;
                    toProtoMsg(message: _102.Channel): _102.ChannelProtoMsg;
                };
                IdentifiedChannel: {
                    typeUrl: string;
                    encode(message: _102.IdentifiedChannel, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.IdentifiedChannel;
                    fromJSON(object: any): _102.IdentifiedChannel;
                    toJSON(message: _102.IdentifiedChannel): import("../json-safe.js").JsonSafe<_102.IdentifiedChannel>;
                    fromPartial(object: Partial<_102.IdentifiedChannel>): _102.IdentifiedChannel;
                    fromProtoMsg(message: _102.IdentifiedChannelProtoMsg): _102.IdentifiedChannel;
                    toProto(message: _102.IdentifiedChannel): Uint8Array;
                    toProtoMsg(message: _102.IdentifiedChannel): _102.IdentifiedChannelProtoMsg;
                };
                Counterparty: {
                    typeUrl: string;
                    encode(message: _102.Counterparty, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.Counterparty;
                    fromJSON(object: any): _102.Counterparty;
                    toJSON(message: _102.Counterparty): import("../json-safe.js").JsonSafe<_102.Counterparty>;
                    fromPartial(object: Partial<_102.Counterparty>): _102.Counterparty;
                    fromProtoMsg(message: _102.CounterpartyProtoMsg): _102.Counterparty;
                    toProto(message: _102.Counterparty): Uint8Array;
                    toProtoMsg(message: _102.Counterparty): _102.CounterpartyProtoMsg;
                };
                Packet: {
                    typeUrl: string;
                    encode(message: _102.Packet, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.Packet;
                    fromJSON(object: any): _102.Packet;
                    toJSON(message: _102.Packet): import("../json-safe.js").JsonSafe<_102.Packet>;
                    fromPartial(object: Partial<_102.Packet>): _102.Packet;
                    fromProtoMsg(message: _102.PacketProtoMsg): _102.Packet;
                    toProto(message: _102.Packet): Uint8Array;
                    toProtoMsg(message: _102.Packet): _102.PacketProtoMsg;
                };
                PacketState: {
                    typeUrl: string;
                    encode(message: _102.PacketState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.PacketState;
                    fromJSON(object: any): _102.PacketState;
                    toJSON(message: _102.PacketState): import("../json-safe.js").JsonSafe<_102.PacketState>;
                    fromPartial(object: Partial<_102.PacketState>): _102.PacketState;
                    fromProtoMsg(message: _102.PacketStateProtoMsg): _102.PacketState;
                    toProto(message: _102.PacketState): Uint8Array;
                    toProtoMsg(message: _102.PacketState): _102.PacketStateProtoMsg;
                };
                PacketId: {
                    typeUrl: string;
                    encode(message: _102.PacketId, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.PacketId;
                    fromJSON(object: any): _102.PacketId;
                    toJSON(message: _102.PacketId): import("../json-safe.js").JsonSafe<_102.PacketId>;
                    fromPartial(object: Partial<_102.PacketId>): _102.PacketId;
                    fromProtoMsg(message: _102.PacketIdProtoMsg): _102.PacketId;
                    toProto(message: _102.PacketId): Uint8Array;
                    toProtoMsg(message: _102.PacketId): _102.PacketIdProtoMsg;
                };
                Acknowledgement: {
                    typeUrl: string;
                    encode(message: _102.Acknowledgement, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _102.Acknowledgement;
                    fromJSON(object: any): _102.Acknowledgement;
                    toJSON(message: _102.Acknowledgement): import("../json-safe.js").JsonSafe<_102.Acknowledgement>;
                    fromPartial(object: Partial<_102.Acknowledgement>): _102.Acknowledgement;
                    fromProtoMsg(message: _102.AcknowledgementProtoMsg): _102.Acknowledgement;
                    toProto(message: _102.Acknowledgement): Uint8Array;
                    toProtoMsg(message: _102.Acknowledgement): _102.AcknowledgementProtoMsg;
                };
            };
        }
        namespace client {
            const v1: {
                MsgCreateClient: {
                    typeUrl: string;
                    encode(message: _109.MsgCreateClient, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgCreateClient;
                    fromJSON(object: any): _109.MsgCreateClient;
                    toJSON(message: _109.MsgCreateClient): import("../json-safe.js").JsonSafe<_109.MsgCreateClient>;
                    fromPartial(object: Partial<_109.MsgCreateClient>): _109.MsgCreateClient;
                    fromProtoMsg(message: _109.MsgCreateClientProtoMsg): _109.MsgCreateClient;
                    toProto(message: _109.MsgCreateClient): Uint8Array;
                    toProtoMsg(message: _109.MsgCreateClient): _109.MsgCreateClientProtoMsg;
                };
                MsgCreateClientResponse: {
                    typeUrl: string;
                    encode(_: _109.MsgCreateClientResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgCreateClientResponse;
                    fromJSON(_: any): _109.MsgCreateClientResponse;
                    toJSON(_: _109.MsgCreateClientResponse): import("../json-safe.js").JsonSafe<_109.MsgCreateClientResponse>;
                    fromPartial(_: Partial<_109.MsgCreateClientResponse>): _109.MsgCreateClientResponse;
                    fromProtoMsg(message: _109.MsgCreateClientResponseProtoMsg): _109.MsgCreateClientResponse;
                    toProto(message: _109.MsgCreateClientResponse): Uint8Array;
                    toProtoMsg(message: _109.MsgCreateClientResponse): _109.MsgCreateClientResponseProtoMsg;
                };
                MsgUpdateClient: {
                    typeUrl: string;
                    encode(message: _109.MsgUpdateClient, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgUpdateClient;
                    fromJSON(object: any): _109.MsgUpdateClient;
                    toJSON(message: _109.MsgUpdateClient): import("../json-safe.js").JsonSafe<_109.MsgUpdateClient>;
                    fromPartial(object: Partial<_109.MsgUpdateClient>): _109.MsgUpdateClient;
                    fromProtoMsg(message: _109.MsgUpdateClientProtoMsg): _109.MsgUpdateClient;
                    toProto(message: _109.MsgUpdateClient): Uint8Array;
                    toProtoMsg(message: _109.MsgUpdateClient): _109.MsgUpdateClientProtoMsg;
                };
                MsgUpdateClientResponse: {
                    typeUrl: string;
                    encode(_: _109.MsgUpdateClientResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgUpdateClientResponse;
                    fromJSON(_: any): _109.MsgUpdateClientResponse;
                    toJSON(_: _109.MsgUpdateClientResponse): import("../json-safe.js").JsonSafe<_109.MsgUpdateClientResponse>;
                    fromPartial(_: Partial<_109.MsgUpdateClientResponse>): _109.MsgUpdateClientResponse;
                    fromProtoMsg(message: _109.MsgUpdateClientResponseProtoMsg): _109.MsgUpdateClientResponse;
                    toProto(message: _109.MsgUpdateClientResponse): Uint8Array;
                    toProtoMsg(message: _109.MsgUpdateClientResponse): _109.MsgUpdateClientResponseProtoMsg;
                };
                MsgUpgradeClient: {
                    typeUrl: string;
                    encode(message: _109.MsgUpgradeClient, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgUpgradeClient;
                    fromJSON(object: any): _109.MsgUpgradeClient;
                    toJSON(message: _109.MsgUpgradeClient): import("../json-safe.js").JsonSafe<_109.MsgUpgradeClient>;
                    fromPartial(object: Partial<_109.MsgUpgradeClient>): _109.MsgUpgradeClient;
                    fromProtoMsg(message: _109.MsgUpgradeClientProtoMsg): _109.MsgUpgradeClient;
                    toProto(message: _109.MsgUpgradeClient): Uint8Array;
                    toProtoMsg(message: _109.MsgUpgradeClient): _109.MsgUpgradeClientProtoMsg;
                };
                MsgUpgradeClientResponse: {
                    typeUrl: string;
                    encode(_: _109.MsgUpgradeClientResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgUpgradeClientResponse;
                    fromJSON(_: any): _109.MsgUpgradeClientResponse;
                    toJSON(_: _109.MsgUpgradeClientResponse): import("../json-safe.js").JsonSafe<_109.MsgUpgradeClientResponse>;
                    fromPartial(_: Partial<_109.MsgUpgradeClientResponse>): _109.MsgUpgradeClientResponse;
                    fromProtoMsg(message: _109.MsgUpgradeClientResponseProtoMsg): _109.MsgUpgradeClientResponse;
                    toProto(message: _109.MsgUpgradeClientResponse): Uint8Array;
                    toProtoMsg(message: _109.MsgUpgradeClientResponse): _109.MsgUpgradeClientResponseProtoMsg;
                };
                MsgSubmitMisbehaviour: {
                    typeUrl: string;
                    encode(message: _109.MsgSubmitMisbehaviour, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgSubmitMisbehaviour;
                    fromJSON(object: any): _109.MsgSubmitMisbehaviour;
                    toJSON(message: _109.MsgSubmitMisbehaviour): import("../json-safe.js").JsonSafe<_109.MsgSubmitMisbehaviour>;
                    fromPartial(object: Partial<_109.MsgSubmitMisbehaviour>): _109.MsgSubmitMisbehaviour;
                    fromProtoMsg(message: _109.MsgSubmitMisbehaviourProtoMsg): _109.MsgSubmitMisbehaviour;
                    toProto(message: _109.MsgSubmitMisbehaviour): Uint8Array;
                    toProtoMsg(message: _109.MsgSubmitMisbehaviour): _109.MsgSubmitMisbehaviourProtoMsg;
                };
                MsgSubmitMisbehaviourResponse: {
                    typeUrl: string;
                    encode(_: _109.MsgSubmitMisbehaviourResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _109.MsgSubmitMisbehaviourResponse;
                    fromJSON(_: any): _109.MsgSubmitMisbehaviourResponse;
                    toJSON(_: _109.MsgSubmitMisbehaviourResponse): import("../json-safe.js").JsonSafe<_109.MsgSubmitMisbehaviourResponse>;
                    fromPartial(_: Partial<_109.MsgSubmitMisbehaviourResponse>): _109.MsgSubmitMisbehaviourResponse;
                    fromProtoMsg(message: _109.MsgSubmitMisbehaviourResponseProtoMsg): _109.MsgSubmitMisbehaviourResponse;
                    toProto(message: _109.MsgSubmitMisbehaviourResponse): Uint8Array;
                    toProtoMsg(message: _109.MsgSubmitMisbehaviourResponse): _109.MsgSubmitMisbehaviourResponseProtoMsg;
                };
                QueryClientStateRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStateRequest;
                    fromJSON(object: any): _108.QueryClientStateRequest;
                    toJSON(message: _108.QueryClientStateRequest): import("../json-safe.js").JsonSafe<_108.QueryClientStateRequest>;
                    fromPartial(object: Partial<_108.QueryClientStateRequest>): _108.QueryClientStateRequest;
                    fromProtoMsg(message: _108.QueryClientStateRequestProtoMsg): _108.QueryClientStateRequest;
                    toProto(message: _108.QueryClientStateRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStateRequest): _108.QueryClientStateRequestProtoMsg;
                };
                QueryClientStateResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStateResponse;
                    fromJSON(object: any): _108.QueryClientStateResponse;
                    toJSON(message: _108.QueryClientStateResponse): import("../json-safe.js").JsonSafe<_108.QueryClientStateResponse>;
                    fromPartial(object: Partial<_108.QueryClientStateResponse>): _108.QueryClientStateResponse;
                    fromProtoMsg(message: _108.QueryClientStateResponseProtoMsg): _108.QueryClientStateResponse;
                    toProto(message: _108.QueryClientStateResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStateResponse): _108.QueryClientStateResponseProtoMsg;
                };
                QueryClientStatesRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStatesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStatesRequest;
                    fromJSON(object: any): _108.QueryClientStatesRequest;
                    toJSON(message: _108.QueryClientStatesRequest): import("../json-safe.js").JsonSafe<_108.QueryClientStatesRequest>;
                    fromPartial(object: Partial<_108.QueryClientStatesRequest>): _108.QueryClientStatesRequest;
                    fromProtoMsg(message: _108.QueryClientStatesRequestProtoMsg): _108.QueryClientStatesRequest;
                    toProto(message: _108.QueryClientStatesRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStatesRequest): _108.QueryClientStatesRequestProtoMsg;
                };
                QueryClientStatesResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStatesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStatesResponse;
                    fromJSON(object: any): _108.QueryClientStatesResponse;
                    toJSON(message: _108.QueryClientStatesResponse): import("../json-safe.js").JsonSafe<_108.QueryClientStatesResponse>;
                    fromPartial(object: Partial<_108.QueryClientStatesResponse>): _108.QueryClientStatesResponse;
                    fromProtoMsg(message: _108.QueryClientStatesResponseProtoMsg): _108.QueryClientStatesResponse;
                    toProto(message: _108.QueryClientStatesResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStatesResponse): _108.QueryClientStatesResponseProtoMsg;
                };
                QueryConsensusStateRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStateRequest;
                    fromJSON(object: any): _108.QueryConsensusStateRequest;
                    toJSON(message: _108.QueryConsensusStateRequest): import("../json-safe.js").JsonSafe<_108.QueryConsensusStateRequest>;
                    fromPartial(object: Partial<_108.QueryConsensusStateRequest>): _108.QueryConsensusStateRequest;
                    fromProtoMsg(message: _108.QueryConsensusStateRequestProtoMsg): _108.QueryConsensusStateRequest;
                    toProto(message: _108.QueryConsensusStateRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStateRequest): _108.QueryConsensusStateRequestProtoMsg;
                };
                QueryConsensusStateResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStateResponse;
                    fromJSON(object: any): _108.QueryConsensusStateResponse;
                    toJSON(message: _108.QueryConsensusStateResponse): import("../json-safe.js").JsonSafe<_108.QueryConsensusStateResponse>;
                    fromPartial(object: Partial<_108.QueryConsensusStateResponse>): _108.QueryConsensusStateResponse;
                    fromProtoMsg(message: _108.QueryConsensusStateResponseProtoMsg): _108.QueryConsensusStateResponse;
                    toProto(message: _108.QueryConsensusStateResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStateResponse): _108.QueryConsensusStateResponseProtoMsg;
                };
                QueryConsensusStatesRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStatesRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStatesRequest;
                    fromJSON(object: any): _108.QueryConsensusStatesRequest;
                    toJSON(message: _108.QueryConsensusStatesRequest): import("../json-safe.js").JsonSafe<_108.QueryConsensusStatesRequest>;
                    fromPartial(object: Partial<_108.QueryConsensusStatesRequest>): _108.QueryConsensusStatesRequest;
                    fromProtoMsg(message: _108.QueryConsensusStatesRequestProtoMsg): _108.QueryConsensusStatesRequest;
                    toProto(message: _108.QueryConsensusStatesRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStatesRequest): _108.QueryConsensusStatesRequestProtoMsg;
                };
                QueryConsensusStatesResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStatesResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStatesResponse;
                    fromJSON(object: any): _108.QueryConsensusStatesResponse;
                    toJSON(message: _108.QueryConsensusStatesResponse): import("../json-safe.js").JsonSafe<_108.QueryConsensusStatesResponse>;
                    fromPartial(object: Partial<_108.QueryConsensusStatesResponse>): _108.QueryConsensusStatesResponse;
                    fromProtoMsg(message: _108.QueryConsensusStatesResponseProtoMsg): _108.QueryConsensusStatesResponse;
                    toProto(message: _108.QueryConsensusStatesResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStatesResponse): _108.QueryConsensusStatesResponseProtoMsg;
                };
                QueryConsensusStateHeightsRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStateHeightsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStateHeightsRequest;
                    fromJSON(object: any): _108.QueryConsensusStateHeightsRequest;
                    toJSON(message: _108.QueryConsensusStateHeightsRequest): import("../json-safe.js").JsonSafe<_108.QueryConsensusStateHeightsRequest>;
                    fromPartial(object: Partial<_108.QueryConsensusStateHeightsRequest>): _108.QueryConsensusStateHeightsRequest;
                    fromProtoMsg(message: _108.QueryConsensusStateHeightsRequestProtoMsg): _108.QueryConsensusStateHeightsRequest;
                    toProto(message: _108.QueryConsensusStateHeightsRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStateHeightsRequest): _108.QueryConsensusStateHeightsRequestProtoMsg;
                };
                QueryConsensusStateHeightsResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryConsensusStateHeightsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryConsensusStateHeightsResponse;
                    fromJSON(object: any): _108.QueryConsensusStateHeightsResponse;
                    toJSON(message: _108.QueryConsensusStateHeightsResponse): import("../json-safe.js").JsonSafe<_108.QueryConsensusStateHeightsResponse>;
                    fromPartial(object: Partial<_108.QueryConsensusStateHeightsResponse>): _108.QueryConsensusStateHeightsResponse;
                    fromProtoMsg(message: _108.QueryConsensusStateHeightsResponseProtoMsg): _108.QueryConsensusStateHeightsResponse;
                    toProto(message: _108.QueryConsensusStateHeightsResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryConsensusStateHeightsResponse): _108.QueryConsensusStateHeightsResponseProtoMsg;
                };
                QueryClientStatusRequest: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStatusRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStatusRequest;
                    fromJSON(object: any): _108.QueryClientStatusRequest;
                    toJSON(message: _108.QueryClientStatusRequest): import("../json-safe.js").JsonSafe<_108.QueryClientStatusRequest>;
                    fromPartial(object: Partial<_108.QueryClientStatusRequest>): _108.QueryClientStatusRequest;
                    fromProtoMsg(message: _108.QueryClientStatusRequestProtoMsg): _108.QueryClientStatusRequest;
                    toProto(message: _108.QueryClientStatusRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStatusRequest): _108.QueryClientStatusRequestProtoMsg;
                };
                QueryClientStatusResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryClientStatusResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientStatusResponse;
                    fromJSON(object: any): _108.QueryClientStatusResponse;
                    toJSON(message: _108.QueryClientStatusResponse): import("../json-safe.js").JsonSafe<_108.QueryClientStatusResponse>;
                    fromPartial(object: Partial<_108.QueryClientStatusResponse>): _108.QueryClientStatusResponse;
                    fromProtoMsg(message: _108.QueryClientStatusResponseProtoMsg): _108.QueryClientStatusResponse;
                    toProto(message: _108.QueryClientStatusResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryClientStatusResponse): _108.QueryClientStatusResponseProtoMsg;
                };
                QueryClientParamsRequest: {
                    typeUrl: string;
                    encode(_: _108.QueryClientParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientParamsRequest;
                    fromJSON(_: any): _108.QueryClientParamsRequest;
                    toJSON(_: _108.QueryClientParamsRequest): import("../json-safe.js").JsonSafe<_108.QueryClientParamsRequest>;
                    fromPartial(_: Partial<_108.QueryClientParamsRequest>): _108.QueryClientParamsRequest;
                    fromProtoMsg(message: _108.QueryClientParamsRequestProtoMsg): _108.QueryClientParamsRequest;
                    toProto(message: _108.QueryClientParamsRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryClientParamsRequest): _108.QueryClientParamsRequestProtoMsg;
                };
                QueryClientParamsResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryClientParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryClientParamsResponse;
                    fromJSON(object: any): _108.QueryClientParamsResponse;
                    toJSON(message: _108.QueryClientParamsResponse): import("../json-safe.js").JsonSafe<_108.QueryClientParamsResponse>;
                    fromPartial(object: Partial<_108.QueryClientParamsResponse>): _108.QueryClientParamsResponse;
                    fromProtoMsg(message: _108.QueryClientParamsResponseProtoMsg): _108.QueryClientParamsResponse;
                    toProto(message: _108.QueryClientParamsResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryClientParamsResponse): _108.QueryClientParamsResponseProtoMsg;
                };
                QueryUpgradedClientStateRequest: {
                    typeUrl: string;
                    encode(_: _108.QueryUpgradedClientStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryUpgradedClientStateRequest;
                    fromJSON(_: any): _108.QueryUpgradedClientStateRequest;
                    toJSON(_: _108.QueryUpgradedClientStateRequest): import("../json-safe.js").JsonSafe<_108.QueryUpgradedClientStateRequest>;
                    fromPartial(_: Partial<_108.QueryUpgradedClientStateRequest>): _108.QueryUpgradedClientStateRequest;
                    fromProtoMsg(message: _108.QueryUpgradedClientStateRequestProtoMsg): _108.QueryUpgradedClientStateRequest;
                    toProto(message: _108.QueryUpgradedClientStateRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryUpgradedClientStateRequest): _108.QueryUpgradedClientStateRequestProtoMsg;
                };
                QueryUpgradedClientStateResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryUpgradedClientStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryUpgradedClientStateResponse;
                    fromJSON(object: any): _108.QueryUpgradedClientStateResponse;
                    toJSON(message: _108.QueryUpgradedClientStateResponse): import("../json-safe.js").JsonSafe<_108.QueryUpgradedClientStateResponse>;
                    fromPartial(object: Partial<_108.QueryUpgradedClientStateResponse>): _108.QueryUpgradedClientStateResponse;
                    fromProtoMsg(message: _108.QueryUpgradedClientStateResponseProtoMsg): _108.QueryUpgradedClientStateResponse;
                    toProto(message: _108.QueryUpgradedClientStateResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryUpgradedClientStateResponse): _108.QueryUpgradedClientStateResponseProtoMsg;
                };
                QueryUpgradedConsensusStateRequest: {
                    typeUrl: string;
                    encode(_: _108.QueryUpgradedConsensusStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryUpgradedConsensusStateRequest;
                    fromJSON(_: any): _108.QueryUpgradedConsensusStateRequest;
                    toJSON(_: _108.QueryUpgradedConsensusStateRequest): import("../json-safe.js").JsonSafe<_108.QueryUpgradedConsensusStateRequest>;
                    fromPartial(_: Partial<_108.QueryUpgradedConsensusStateRequest>): _108.QueryUpgradedConsensusStateRequest;
                    fromProtoMsg(message: _108.QueryUpgradedConsensusStateRequestProtoMsg): _108.QueryUpgradedConsensusStateRequest;
                    toProto(message: _108.QueryUpgradedConsensusStateRequest): Uint8Array;
                    toProtoMsg(message: _108.QueryUpgradedConsensusStateRequest): _108.QueryUpgradedConsensusStateRequestProtoMsg;
                };
                QueryUpgradedConsensusStateResponse: {
                    typeUrl: string;
                    encode(message: _108.QueryUpgradedConsensusStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _108.QueryUpgradedConsensusStateResponse;
                    fromJSON(object: any): _108.QueryUpgradedConsensusStateResponse;
                    toJSON(message: _108.QueryUpgradedConsensusStateResponse): import("../json-safe.js").JsonSafe<_108.QueryUpgradedConsensusStateResponse>;
                    fromPartial(object: Partial<_108.QueryUpgradedConsensusStateResponse>): _108.QueryUpgradedConsensusStateResponse;
                    fromProtoMsg(message: _108.QueryUpgradedConsensusStateResponseProtoMsg): _108.QueryUpgradedConsensusStateResponse;
                    toProto(message: _108.QueryUpgradedConsensusStateResponse): Uint8Array;
                    toProtoMsg(message: _108.QueryUpgradedConsensusStateResponse): _108.QueryUpgradedConsensusStateResponseProtoMsg;
                };
                GenesisState: {
                    typeUrl: string;
                    encode(message: _107.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _107.GenesisState;
                    fromJSON(object: any): _107.GenesisState;
                    toJSON(message: _107.GenesisState): import("../json-safe.js").JsonSafe<_107.GenesisState>;
                    fromPartial(object: Partial<_107.GenesisState>): _107.GenesisState;
                    fromProtoMsg(message: _107.GenesisStateProtoMsg): _107.GenesisState;
                    toProto(message: _107.GenesisState): Uint8Array;
                    toProtoMsg(message: _107.GenesisState): _107.GenesisStateProtoMsg;
                };
                GenesisMetadata: {
                    typeUrl: string;
                    encode(message: _107.GenesisMetadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _107.GenesisMetadata;
                    fromJSON(object: any): _107.GenesisMetadata;
                    toJSON(message: _107.GenesisMetadata): import("../json-safe.js").JsonSafe<_107.GenesisMetadata>;
                    fromPartial(object: Partial<_107.GenesisMetadata>): _107.GenesisMetadata;
                    fromProtoMsg(message: _107.GenesisMetadataProtoMsg): _107.GenesisMetadata;
                    toProto(message: _107.GenesisMetadata): Uint8Array;
                    toProtoMsg(message: _107.GenesisMetadata): _107.GenesisMetadataProtoMsg;
                };
                IdentifiedGenesisMetadata: {
                    typeUrl: string;
                    encode(message: _107.IdentifiedGenesisMetadata, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _107.IdentifiedGenesisMetadata;
                    fromJSON(object: any): _107.IdentifiedGenesisMetadata;
                    toJSON(message: _107.IdentifiedGenesisMetadata): import("../json-safe.js").JsonSafe<_107.IdentifiedGenesisMetadata>;
                    fromPartial(object: Partial<_107.IdentifiedGenesisMetadata>): _107.IdentifiedGenesisMetadata;
                    fromProtoMsg(message: _107.IdentifiedGenesisMetadataProtoMsg): _107.IdentifiedGenesisMetadata;
                    toProto(message: _107.IdentifiedGenesisMetadata): Uint8Array;
                    toProtoMsg(message: _107.IdentifiedGenesisMetadata): _107.IdentifiedGenesisMetadataProtoMsg;
                };
                IdentifiedClientState: {
                    typeUrl: string;
                    encode(message: _106.IdentifiedClientState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.IdentifiedClientState;
                    fromJSON(object: any): _106.IdentifiedClientState;
                    toJSON(message: _106.IdentifiedClientState): import("../json-safe.js").JsonSafe<_106.IdentifiedClientState>;
                    fromPartial(object: Partial<_106.IdentifiedClientState>): _106.IdentifiedClientState;
                    fromProtoMsg(message: _106.IdentifiedClientStateProtoMsg): _106.IdentifiedClientState;
                    toProto(message: _106.IdentifiedClientState): Uint8Array;
                    toProtoMsg(message: _106.IdentifiedClientState): _106.IdentifiedClientStateProtoMsg;
                };
                ConsensusStateWithHeight: {
                    typeUrl: string;
                    encode(message: _106.ConsensusStateWithHeight, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.ConsensusStateWithHeight;
                    fromJSON(object: any): _106.ConsensusStateWithHeight;
                    toJSON(message: _106.ConsensusStateWithHeight): import("../json-safe.js").JsonSafe<_106.ConsensusStateWithHeight>;
                    fromPartial(object: Partial<_106.ConsensusStateWithHeight>): _106.ConsensusStateWithHeight;
                    fromProtoMsg(message: _106.ConsensusStateWithHeightProtoMsg): _106.ConsensusStateWithHeight;
                    toProto(message: _106.ConsensusStateWithHeight): Uint8Array;
                    toProtoMsg(message: _106.ConsensusStateWithHeight): _106.ConsensusStateWithHeightProtoMsg;
                };
                ClientConsensusStates: {
                    typeUrl: string;
                    encode(message: _106.ClientConsensusStates, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.ClientConsensusStates;
                    fromJSON(object: any): _106.ClientConsensusStates;
                    toJSON(message: _106.ClientConsensusStates): import("../json-safe.js").JsonSafe<_106.ClientConsensusStates>;
                    fromPartial(object: Partial<_106.ClientConsensusStates>): _106.ClientConsensusStates;
                    fromProtoMsg(message: _106.ClientConsensusStatesProtoMsg): _106.ClientConsensusStates;
                    toProto(message: _106.ClientConsensusStates): Uint8Array;
                    toProtoMsg(message: _106.ClientConsensusStates): _106.ClientConsensusStatesProtoMsg;
                };
                ClientUpdateProposal: {
                    typeUrl: string;
                    encode(message: _106.ClientUpdateProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.ClientUpdateProposal;
                    fromJSON(object: any): _106.ClientUpdateProposal;
                    toJSON(message: _106.ClientUpdateProposal): import("../json-safe.js").JsonSafe<_106.ClientUpdateProposal>;
                    fromPartial(object: Partial<_106.ClientUpdateProposal>): _106.ClientUpdateProposal;
                    fromProtoMsg(message: _106.ClientUpdateProposalProtoMsg): _106.ClientUpdateProposal;
                    toProto(message: _106.ClientUpdateProposal): Uint8Array;
                    toProtoMsg(message: _106.ClientUpdateProposal): _106.ClientUpdateProposalProtoMsg;
                };
                UpgradeProposal: {
                    typeUrl: string;
                    encode(message: _106.UpgradeProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.UpgradeProposal;
                    fromJSON(object: any): _106.UpgradeProposal;
                    toJSON(message: _106.UpgradeProposal): import("../json-safe.js").JsonSafe<_106.UpgradeProposal>;
                    fromPartial(object: Partial<_106.UpgradeProposal>): _106.UpgradeProposal;
                    fromProtoMsg(message: _106.UpgradeProposalProtoMsg): _106.UpgradeProposal;
                    toProto(message: _106.UpgradeProposal): Uint8Array;
                    toProtoMsg(message: _106.UpgradeProposal): _106.UpgradeProposalProtoMsg;
                };
                Height: {
                    typeUrl: string;
                    encode(message: _106.Height, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.Height;
                    fromJSON(object: any): _106.Height;
                    toJSON(message: _106.Height): import("../json-safe.js").JsonSafe<_106.Height>;
                    fromPartial(object: Partial<_106.Height>): _106.Height;
                    fromProtoMsg(message: _106.HeightProtoMsg): _106.Height;
                    toProto(message: _106.Height): Uint8Array;
                    toProtoMsg(message: _106.Height): _106.HeightProtoMsg;
                };
                Params: {
                    typeUrl: string;
                    encode(message: _106.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _106.Params;
                    fromJSON(object: any): _106.Params;
                    toJSON(message: _106.Params): import("../json-safe.js").JsonSafe<_106.Params>;
                    fromPartial(object: Partial<_106.Params>): _106.Params;
                    fromProtoMsg(message: _106.ParamsProtoMsg): _106.Params;
                    toProto(message: _106.Params): Uint8Array;
                    toProtoMsg(message: _106.Params): _106.ParamsProtoMsg;
                };
            };
        }
        namespace commitment {
            const v1: {
                MerkleRoot: {
                    typeUrl: string;
                    encode(message: _110.MerkleRoot, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _110.MerkleRoot;
                    fromJSON(object: any): _110.MerkleRoot;
                    toJSON(message: _110.MerkleRoot): import("../json-safe.js").JsonSafe<_110.MerkleRoot>;
                    fromPartial(object: Partial<_110.MerkleRoot>): _110.MerkleRoot;
                    fromProtoMsg(message: _110.MerkleRootProtoMsg): _110.MerkleRoot;
                    toProto(message: _110.MerkleRoot): Uint8Array;
                    toProtoMsg(message: _110.MerkleRoot): _110.MerkleRootProtoMsg;
                };
                MerklePrefix: {
                    typeUrl: string;
                    encode(message: _110.MerklePrefix, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _110.MerklePrefix;
                    fromJSON(object: any): _110.MerklePrefix;
                    toJSON(message: _110.MerklePrefix): import("../json-safe.js").JsonSafe<_110.MerklePrefix>;
                    fromPartial(object: Partial<_110.MerklePrefix>): _110.MerklePrefix;
                    fromProtoMsg(message: _110.MerklePrefixProtoMsg): _110.MerklePrefix;
                    toProto(message: _110.MerklePrefix): Uint8Array;
                    toProtoMsg(message: _110.MerklePrefix): _110.MerklePrefixProtoMsg;
                };
                MerklePath: {
                    typeUrl: string;
                    encode(message: _110.MerklePath, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _110.MerklePath;
                    fromJSON(object: any): _110.MerklePath;
                    toJSON(message: _110.MerklePath): import("../json-safe.js").JsonSafe<_110.MerklePath>;
                    fromPartial(object: Partial<_110.MerklePath>): _110.MerklePath;
                    fromProtoMsg(message: _110.MerklePathProtoMsg): _110.MerklePath;
                    toProto(message: _110.MerklePath): Uint8Array;
                    toProtoMsg(message: _110.MerklePath): _110.MerklePathProtoMsg;
                };
                MerkleProof: {
                    typeUrl: string;
                    encode(message: _110.MerkleProof, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _110.MerkleProof;
                    fromJSON(object: any): _110.MerkleProof;
                    toJSON(message: _110.MerkleProof): import("../json-safe.js").JsonSafe<_110.MerkleProof>;
                    fromPartial(object: Partial<_110.MerkleProof>): _110.MerkleProof;
                    fromProtoMsg(message: _110.MerkleProofProtoMsg): _110.MerkleProof;
                    toProto(message: _110.MerkleProof): Uint8Array;
                    toProtoMsg(message: _110.MerkleProof): _110.MerkleProofProtoMsg;
                };
            };
        }
        namespace connection {
            const v1: {
                MsgConnectionOpenInit: {
                    typeUrl: string;
                    encode(message: _114.MsgConnectionOpenInit, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenInit;
                    fromJSON(object: any): _114.MsgConnectionOpenInit;
                    toJSON(message: _114.MsgConnectionOpenInit): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenInit>;
                    fromPartial(object: Partial<_114.MsgConnectionOpenInit>): _114.MsgConnectionOpenInit;
                    fromProtoMsg(message: _114.MsgConnectionOpenInitProtoMsg): _114.MsgConnectionOpenInit;
                    toProto(message: _114.MsgConnectionOpenInit): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenInit): _114.MsgConnectionOpenInitProtoMsg;
                };
                MsgConnectionOpenInitResponse: {
                    typeUrl: string;
                    encode(_: _114.MsgConnectionOpenInitResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenInitResponse;
                    fromJSON(_: any): _114.MsgConnectionOpenInitResponse;
                    toJSON(_: _114.MsgConnectionOpenInitResponse): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenInitResponse>;
                    fromPartial(_: Partial<_114.MsgConnectionOpenInitResponse>): _114.MsgConnectionOpenInitResponse;
                    fromProtoMsg(message: _114.MsgConnectionOpenInitResponseProtoMsg): _114.MsgConnectionOpenInitResponse;
                    toProto(message: _114.MsgConnectionOpenInitResponse): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenInitResponse): _114.MsgConnectionOpenInitResponseProtoMsg;
                };
                MsgConnectionOpenTry: {
                    typeUrl: string;
                    encode(message: _114.MsgConnectionOpenTry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenTry;
                    fromJSON(object: any): _114.MsgConnectionOpenTry;
                    toJSON(message: _114.MsgConnectionOpenTry): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenTry>;
                    fromPartial(object: Partial<_114.MsgConnectionOpenTry>): _114.MsgConnectionOpenTry;
                    fromProtoMsg(message: _114.MsgConnectionOpenTryProtoMsg): _114.MsgConnectionOpenTry;
                    toProto(message: _114.MsgConnectionOpenTry): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenTry): _114.MsgConnectionOpenTryProtoMsg;
                };
                MsgConnectionOpenTryResponse: {
                    typeUrl: string;
                    encode(_: _114.MsgConnectionOpenTryResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenTryResponse;
                    fromJSON(_: any): _114.MsgConnectionOpenTryResponse;
                    toJSON(_: _114.MsgConnectionOpenTryResponse): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenTryResponse>;
                    fromPartial(_: Partial<_114.MsgConnectionOpenTryResponse>): _114.MsgConnectionOpenTryResponse;
                    fromProtoMsg(message: _114.MsgConnectionOpenTryResponseProtoMsg): _114.MsgConnectionOpenTryResponse;
                    toProto(message: _114.MsgConnectionOpenTryResponse): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenTryResponse): _114.MsgConnectionOpenTryResponseProtoMsg;
                };
                MsgConnectionOpenAck: {
                    typeUrl: string;
                    encode(message: _114.MsgConnectionOpenAck, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenAck;
                    fromJSON(object: any): _114.MsgConnectionOpenAck;
                    toJSON(message: _114.MsgConnectionOpenAck): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenAck>;
                    fromPartial(object: Partial<_114.MsgConnectionOpenAck>): _114.MsgConnectionOpenAck;
                    fromProtoMsg(message: _114.MsgConnectionOpenAckProtoMsg): _114.MsgConnectionOpenAck;
                    toProto(message: _114.MsgConnectionOpenAck): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenAck): _114.MsgConnectionOpenAckProtoMsg;
                };
                MsgConnectionOpenAckResponse: {
                    typeUrl: string;
                    encode(_: _114.MsgConnectionOpenAckResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenAckResponse;
                    fromJSON(_: any): _114.MsgConnectionOpenAckResponse;
                    toJSON(_: _114.MsgConnectionOpenAckResponse): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenAckResponse>;
                    fromPartial(_: Partial<_114.MsgConnectionOpenAckResponse>): _114.MsgConnectionOpenAckResponse;
                    fromProtoMsg(message: _114.MsgConnectionOpenAckResponseProtoMsg): _114.MsgConnectionOpenAckResponse;
                    toProto(message: _114.MsgConnectionOpenAckResponse): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenAckResponse): _114.MsgConnectionOpenAckResponseProtoMsg;
                };
                MsgConnectionOpenConfirm: {
                    typeUrl: string;
                    encode(message: _114.MsgConnectionOpenConfirm, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenConfirm;
                    fromJSON(object: any): _114.MsgConnectionOpenConfirm;
                    toJSON(message: _114.MsgConnectionOpenConfirm): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenConfirm>;
                    fromPartial(object: Partial<_114.MsgConnectionOpenConfirm>): _114.MsgConnectionOpenConfirm;
                    fromProtoMsg(message: _114.MsgConnectionOpenConfirmProtoMsg): _114.MsgConnectionOpenConfirm;
                    toProto(message: _114.MsgConnectionOpenConfirm): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenConfirm): _114.MsgConnectionOpenConfirmProtoMsg;
                };
                MsgConnectionOpenConfirmResponse: {
                    typeUrl: string;
                    encode(_: _114.MsgConnectionOpenConfirmResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _114.MsgConnectionOpenConfirmResponse;
                    fromJSON(_: any): _114.MsgConnectionOpenConfirmResponse;
                    toJSON(_: _114.MsgConnectionOpenConfirmResponse): import("../json-safe.js").JsonSafe<_114.MsgConnectionOpenConfirmResponse>;
                    fromPartial(_: Partial<_114.MsgConnectionOpenConfirmResponse>): _114.MsgConnectionOpenConfirmResponse;
                    fromProtoMsg(message: _114.MsgConnectionOpenConfirmResponseProtoMsg): _114.MsgConnectionOpenConfirmResponse;
                    toProto(message: _114.MsgConnectionOpenConfirmResponse): Uint8Array;
                    toProtoMsg(message: _114.MsgConnectionOpenConfirmResponse): _114.MsgConnectionOpenConfirmResponseProtoMsg;
                };
                QueryConnectionRequest: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionRequest;
                    fromJSON(object: any): _113.QueryConnectionRequest;
                    toJSON(message: _113.QueryConnectionRequest): import("../json-safe.js").JsonSafe<_113.QueryConnectionRequest>;
                    fromPartial(object: Partial<_113.QueryConnectionRequest>): _113.QueryConnectionRequest;
                    fromProtoMsg(message: _113.QueryConnectionRequestProtoMsg): _113.QueryConnectionRequest;
                    toProto(message: _113.QueryConnectionRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionRequest): _113.QueryConnectionRequestProtoMsg;
                };
                QueryConnectionResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionResponse;
                    fromJSON(object: any): _113.QueryConnectionResponse;
                    toJSON(message: _113.QueryConnectionResponse): import("../json-safe.js").JsonSafe<_113.QueryConnectionResponse>;
                    fromPartial(object: Partial<_113.QueryConnectionResponse>): _113.QueryConnectionResponse;
                    fromProtoMsg(message: _113.QueryConnectionResponseProtoMsg): _113.QueryConnectionResponse;
                    toProto(message: _113.QueryConnectionResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionResponse): _113.QueryConnectionResponseProtoMsg;
                };
                QueryConnectionsRequest: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionsRequest;
                    fromJSON(object: any): _113.QueryConnectionsRequest;
                    toJSON(message: _113.QueryConnectionsRequest): import("../json-safe.js").JsonSafe<_113.QueryConnectionsRequest>;
                    fromPartial(object: Partial<_113.QueryConnectionsRequest>): _113.QueryConnectionsRequest;
                    fromProtoMsg(message: _113.QueryConnectionsRequestProtoMsg): _113.QueryConnectionsRequest;
                    toProto(message: _113.QueryConnectionsRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionsRequest): _113.QueryConnectionsRequestProtoMsg;
                };
                QueryConnectionsResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionsResponse;
                    fromJSON(object: any): _113.QueryConnectionsResponse;
                    toJSON(message: _113.QueryConnectionsResponse): import("../json-safe.js").JsonSafe<_113.QueryConnectionsResponse>;
                    fromPartial(object: Partial<_113.QueryConnectionsResponse>): _113.QueryConnectionsResponse;
                    fromProtoMsg(message: _113.QueryConnectionsResponseProtoMsg): _113.QueryConnectionsResponse;
                    toProto(message: _113.QueryConnectionsResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionsResponse): _113.QueryConnectionsResponseProtoMsg;
                };
                QueryClientConnectionsRequest: {
                    typeUrl: string;
                    encode(message: _113.QueryClientConnectionsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryClientConnectionsRequest;
                    fromJSON(object: any): _113.QueryClientConnectionsRequest;
                    toJSON(message: _113.QueryClientConnectionsRequest): import("../json-safe.js").JsonSafe<_113.QueryClientConnectionsRequest>;
                    fromPartial(object: Partial<_113.QueryClientConnectionsRequest>): _113.QueryClientConnectionsRequest;
                    fromProtoMsg(message: _113.QueryClientConnectionsRequestProtoMsg): _113.QueryClientConnectionsRequest;
                    toProto(message: _113.QueryClientConnectionsRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryClientConnectionsRequest): _113.QueryClientConnectionsRequestProtoMsg;
                };
                QueryClientConnectionsResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryClientConnectionsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryClientConnectionsResponse;
                    fromJSON(object: any): _113.QueryClientConnectionsResponse;
                    toJSON(message: _113.QueryClientConnectionsResponse): import("../json-safe.js").JsonSafe<_113.QueryClientConnectionsResponse>;
                    fromPartial(object: Partial<_113.QueryClientConnectionsResponse>): _113.QueryClientConnectionsResponse;
                    fromProtoMsg(message: _113.QueryClientConnectionsResponseProtoMsg): _113.QueryClientConnectionsResponse;
                    toProto(message: _113.QueryClientConnectionsResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryClientConnectionsResponse): _113.QueryClientConnectionsResponseProtoMsg;
                };
                QueryConnectionClientStateRequest: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionClientStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionClientStateRequest;
                    fromJSON(object: any): _113.QueryConnectionClientStateRequest;
                    toJSON(message: _113.QueryConnectionClientStateRequest): import("../json-safe.js").JsonSafe<_113.QueryConnectionClientStateRequest>;
                    fromPartial(object: Partial<_113.QueryConnectionClientStateRequest>): _113.QueryConnectionClientStateRequest;
                    fromProtoMsg(message: _113.QueryConnectionClientStateRequestProtoMsg): _113.QueryConnectionClientStateRequest;
                    toProto(message: _113.QueryConnectionClientStateRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionClientStateRequest): _113.QueryConnectionClientStateRequestProtoMsg;
                };
                QueryConnectionClientStateResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionClientStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionClientStateResponse;
                    fromJSON(object: any): _113.QueryConnectionClientStateResponse;
                    toJSON(message: _113.QueryConnectionClientStateResponse): import("../json-safe.js").JsonSafe<_113.QueryConnectionClientStateResponse>;
                    fromPartial(object: Partial<_113.QueryConnectionClientStateResponse>): _113.QueryConnectionClientStateResponse;
                    fromProtoMsg(message: _113.QueryConnectionClientStateResponseProtoMsg): _113.QueryConnectionClientStateResponse;
                    toProto(message: _113.QueryConnectionClientStateResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionClientStateResponse): _113.QueryConnectionClientStateResponseProtoMsg;
                };
                QueryConnectionConsensusStateRequest: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionConsensusStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionConsensusStateRequest;
                    fromJSON(object: any): _113.QueryConnectionConsensusStateRequest;
                    toJSON(message: _113.QueryConnectionConsensusStateRequest): import("../json-safe.js").JsonSafe<_113.QueryConnectionConsensusStateRequest>;
                    fromPartial(object: Partial<_113.QueryConnectionConsensusStateRequest>): _113.QueryConnectionConsensusStateRequest;
                    fromProtoMsg(message: _113.QueryConnectionConsensusStateRequestProtoMsg): _113.QueryConnectionConsensusStateRequest;
                    toProto(message: _113.QueryConnectionConsensusStateRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionConsensusStateRequest): _113.QueryConnectionConsensusStateRequestProtoMsg;
                };
                QueryConnectionConsensusStateResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionConsensusStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionConsensusStateResponse;
                    fromJSON(object: any): _113.QueryConnectionConsensusStateResponse;
                    toJSON(message: _113.QueryConnectionConsensusStateResponse): import("../json-safe.js").JsonSafe<_113.QueryConnectionConsensusStateResponse>;
                    fromPartial(object: Partial<_113.QueryConnectionConsensusStateResponse>): _113.QueryConnectionConsensusStateResponse;
                    fromProtoMsg(message: _113.QueryConnectionConsensusStateResponseProtoMsg): _113.QueryConnectionConsensusStateResponse;
                    toProto(message: _113.QueryConnectionConsensusStateResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionConsensusStateResponse): _113.QueryConnectionConsensusStateResponseProtoMsg;
                };
                QueryConnectionParamsRequest: {
                    typeUrl: string;
                    encode(_: _113.QueryConnectionParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionParamsRequest;
                    fromJSON(_: any): _113.QueryConnectionParamsRequest;
                    toJSON(_: _113.QueryConnectionParamsRequest): import("../json-safe.js").JsonSafe<_113.QueryConnectionParamsRequest>;
                    fromPartial(_: Partial<_113.QueryConnectionParamsRequest>): _113.QueryConnectionParamsRequest;
                    fromProtoMsg(message: _113.QueryConnectionParamsRequestProtoMsg): _113.QueryConnectionParamsRequest;
                    toProto(message: _113.QueryConnectionParamsRequest): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionParamsRequest): _113.QueryConnectionParamsRequestProtoMsg;
                };
                QueryConnectionParamsResponse: {
                    typeUrl: string;
                    encode(message: _113.QueryConnectionParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _113.QueryConnectionParamsResponse;
                    fromJSON(object: any): _113.QueryConnectionParamsResponse;
                    toJSON(message: _113.QueryConnectionParamsResponse): import("../json-safe.js").JsonSafe<_113.QueryConnectionParamsResponse>;
                    fromPartial(object: Partial<_113.QueryConnectionParamsResponse>): _113.QueryConnectionParamsResponse;
                    fromProtoMsg(message: _113.QueryConnectionParamsResponseProtoMsg): _113.QueryConnectionParamsResponse;
                    toProto(message: _113.QueryConnectionParamsResponse): Uint8Array;
                    toProtoMsg(message: _113.QueryConnectionParamsResponse): _113.QueryConnectionParamsResponseProtoMsg;
                };
                GenesisState: {
                    typeUrl: string;
                    encode(message: _112.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _112.GenesisState;
                    fromJSON(object: any): _112.GenesisState;
                    toJSON(message: _112.GenesisState): import("../json-safe.js").JsonSafe<_112.GenesisState>;
                    fromPartial(object: Partial<_112.GenesisState>): _112.GenesisState;
                    fromProtoMsg(message: _112.GenesisStateProtoMsg): _112.GenesisState;
                    toProto(message: _112.GenesisState): Uint8Array;
                    toProtoMsg(message: _112.GenesisState): _112.GenesisStateProtoMsg;
                };
                stateFromJSON(object: any): _111.State;
                stateToJSON(object: _111.State): string;
                State: typeof _111.State;
                StateSDKType: typeof _111.State;
                ConnectionEnd: {
                    typeUrl: string;
                    encode(message: _111.ConnectionEnd, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.ConnectionEnd;
                    fromJSON(object: any): _111.ConnectionEnd;
                    toJSON(message: _111.ConnectionEnd): import("../json-safe.js").JsonSafe<_111.ConnectionEnd>;
                    fromPartial(object: Partial<_111.ConnectionEnd>): _111.ConnectionEnd;
                    fromProtoMsg(message: _111.ConnectionEndProtoMsg): _111.ConnectionEnd;
                    toProto(message: _111.ConnectionEnd): Uint8Array;
                    toProtoMsg(message: _111.ConnectionEnd): _111.ConnectionEndProtoMsg;
                };
                IdentifiedConnection: {
                    typeUrl: string;
                    encode(message: _111.IdentifiedConnection, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.IdentifiedConnection;
                    fromJSON(object: any): _111.IdentifiedConnection;
                    toJSON(message: _111.IdentifiedConnection): import("../json-safe.js").JsonSafe<_111.IdentifiedConnection>;
                    fromPartial(object: Partial<_111.IdentifiedConnection>): _111.IdentifiedConnection;
                    fromProtoMsg(message: _111.IdentifiedConnectionProtoMsg): _111.IdentifiedConnection;
                    toProto(message: _111.IdentifiedConnection): Uint8Array;
                    toProtoMsg(message: _111.IdentifiedConnection): _111.IdentifiedConnectionProtoMsg;
                };
                Counterparty: {
                    typeUrl: string;
                    encode(message: _111.Counterparty, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.Counterparty;
                    fromJSON(object: any): _111.Counterparty;
                    toJSON(message: _111.Counterparty): import("../json-safe.js").JsonSafe<_111.Counterparty>;
                    fromPartial(object: Partial<_111.Counterparty>): _111.Counterparty;
                    fromProtoMsg(message: _111.CounterpartyProtoMsg): _111.Counterparty;
                    toProto(message: _111.Counterparty): Uint8Array;
                    toProtoMsg(message: _111.Counterparty): _111.CounterpartyProtoMsg;
                };
                ClientPaths: {
                    typeUrl: string;
                    encode(message: _111.ClientPaths, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.ClientPaths;
                    fromJSON(object: any): _111.ClientPaths;
                    toJSON(message: _111.ClientPaths): import("../json-safe.js").JsonSafe<_111.ClientPaths>;
                    fromPartial(object: Partial<_111.ClientPaths>): _111.ClientPaths;
                    fromProtoMsg(message: _111.ClientPathsProtoMsg): _111.ClientPaths;
                    toProto(message: _111.ClientPaths): Uint8Array;
                    toProtoMsg(message: _111.ClientPaths): _111.ClientPathsProtoMsg;
                };
                ConnectionPaths: {
                    typeUrl: string;
                    encode(message: _111.ConnectionPaths, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.ConnectionPaths;
                    fromJSON(object: any): _111.ConnectionPaths;
                    toJSON(message: _111.ConnectionPaths): import("../json-safe.js").JsonSafe<_111.ConnectionPaths>;
                    fromPartial(object: Partial<_111.ConnectionPaths>): _111.ConnectionPaths;
                    fromProtoMsg(message: _111.ConnectionPathsProtoMsg): _111.ConnectionPaths;
                    toProto(message: _111.ConnectionPaths): Uint8Array;
                    toProtoMsg(message: _111.ConnectionPaths): _111.ConnectionPathsProtoMsg;
                };
                Version: {
                    typeUrl: string;
                    encode(message: _111.Version, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.Version;
                    fromJSON(object: any): _111.Version;
                    toJSON(message: _111.Version): import("../json-safe.js").JsonSafe<_111.Version>;
                    fromPartial(object: Partial<_111.Version>): _111.Version;
                    fromProtoMsg(message: _111.VersionProtoMsg): _111.Version;
                    toProto(message: _111.Version): Uint8Array;
                    toProtoMsg(message: _111.Version): _111.VersionProtoMsg;
                };
                Params: {
                    typeUrl: string;
                    encode(message: _111.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _111.Params;
                    fromJSON(object: any): _111.Params;
                    toJSON(message: _111.Params): import("../json-safe.js").JsonSafe<_111.Params>;
                    fromPartial(object: Partial<_111.Params>): _111.Params;
                    fromProtoMsg(message: _111.ParamsProtoMsg): _111.Params;
                    toProto(message: _111.Params): Uint8Array;
                    toProtoMsg(message: _111.Params): _111.ParamsProtoMsg;
                };
            };
        }
    }
    namespace lightclients {
        namespace localhost {
            const v1: {
                ClientState: {
                    typeUrl: string;
                    encode(message: _115.ClientState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _115.ClientState;
                    fromJSON(object: any): _115.ClientState;
                    toJSON(message: _115.ClientState): import("../json-safe.js").JsonSafe<_115.ClientState>;
                    fromPartial(object: Partial<_115.ClientState>): _115.ClientState;
                    fromProtoMsg(message: _115.ClientStateProtoMsg): _115.ClientState;
                    toProto(message: _115.ClientState): Uint8Array;
                    toProtoMsg(message: _115.ClientState): _115.ClientStateProtoMsg;
                };
            };
        }
        namespace solomachine {
            const v1: {
                dataTypeFromJSON(object: any): _116.DataType;
                dataTypeToJSON(object: _116.DataType): string;
                DataType: typeof _116.DataType;
                DataTypeSDKType: typeof _116.DataType;
                ClientState: {
                    typeUrl: string;
                    encode(message: _116.ClientState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ClientState;
                    fromJSON(object: any): _116.ClientState;
                    toJSON(message: _116.ClientState): import("../json-safe.js").JsonSafe<_116.ClientState>;
                    fromPartial(object: Partial<_116.ClientState>): _116.ClientState;
                    fromProtoMsg(message: _116.ClientStateProtoMsg): _116.ClientState;
                    toProto(message: _116.ClientState): Uint8Array;
                    toProtoMsg(message: _116.ClientState): _116.ClientStateProtoMsg;
                };
                ConsensusState: {
                    typeUrl: string;
                    encode(message: _116.ConsensusState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ConsensusState;
                    fromJSON(object: any): _116.ConsensusState;
                    toJSON(message: _116.ConsensusState): import("../json-safe.js").JsonSafe<_116.ConsensusState>;
                    fromPartial(object: Partial<_116.ConsensusState>): _116.ConsensusState;
                    fromProtoMsg(message: _116.ConsensusStateProtoMsg): _116.ConsensusState;
                    toProto(message: _116.ConsensusState): Uint8Array;
                    toProtoMsg(message: _116.ConsensusState): _116.ConsensusStateProtoMsg;
                };
                Header: {
                    typeUrl: string;
                    encode(message: _116.Header, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.Header;
                    fromJSON(object: any): _116.Header;
                    toJSON(message: _116.Header): import("../json-safe.js").JsonSafe<_116.Header>;
                    fromPartial(object: Partial<_116.Header>): _116.Header;
                    fromProtoMsg(message: _116.HeaderProtoMsg): _116.Header;
                    toProto(message: _116.Header): Uint8Array;
                    toProtoMsg(message: _116.Header): _116.HeaderProtoMsg;
                };
                Misbehaviour: {
                    typeUrl: string;
                    encode(message: _116.Misbehaviour, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.Misbehaviour;
                    fromJSON(object: any): _116.Misbehaviour;
                    toJSON(message: _116.Misbehaviour): import("../json-safe.js").JsonSafe<_116.Misbehaviour>;
                    fromPartial(object: Partial<_116.Misbehaviour>): _116.Misbehaviour;
                    fromProtoMsg(message: _116.MisbehaviourProtoMsg): _116.Misbehaviour;
                    toProto(message: _116.Misbehaviour): Uint8Array;
                    toProtoMsg(message: _116.Misbehaviour): _116.MisbehaviourProtoMsg;
                };
                SignatureAndData: {
                    typeUrl: string;
                    encode(message: _116.SignatureAndData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.SignatureAndData;
                    fromJSON(object: any): _116.SignatureAndData;
                    toJSON(message: _116.SignatureAndData): import("../json-safe.js").JsonSafe<_116.SignatureAndData>;
                    fromPartial(object: Partial<_116.SignatureAndData>): _116.SignatureAndData;
                    fromProtoMsg(message: _116.SignatureAndDataProtoMsg): _116.SignatureAndData;
                    toProto(message: _116.SignatureAndData): Uint8Array;
                    toProtoMsg(message: _116.SignatureAndData): _116.SignatureAndDataProtoMsg;
                };
                TimestampedSignatureData: {
                    typeUrl: string;
                    encode(message: _116.TimestampedSignatureData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.TimestampedSignatureData;
                    fromJSON(object: any): _116.TimestampedSignatureData;
                    toJSON(message: _116.TimestampedSignatureData): import("../json-safe.js").JsonSafe<_116.TimestampedSignatureData>;
                    fromPartial(object: Partial<_116.TimestampedSignatureData>): _116.TimestampedSignatureData;
                    fromProtoMsg(message: _116.TimestampedSignatureDataProtoMsg): _116.TimestampedSignatureData;
                    toProto(message: _116.TimestampedSignatureData): Uint8Array;
                    toProtoMsg(message: _116.TimestampedSignatureData): _116.TimestampedSignatureDataProtoMsg;
                };
                SignBytes: {
                    typeUrl: string;
                    encode(message: _116.SignBytes, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.SignBytes;
                    fromJSON(object: any): _116.SignBytes;
                    toJSON(message: _116.SignBytes): import("../json-safe.js").JsonSafe<_116.SignBytes>;
                    fromPartial(object: Partial<_116.SignBytes>): _116.SignBytes;
                    fromProtoMsg(message: _116.SignBytesProtoMsg): _116.SignBytes;
                    toProto(message: _116.SignBytes): Uint8Array;
                    toProtoMsg(message: _116.SignBytes): _116.SignBytesProtoMsg;
                };
                HeaderData: {
                    typeUrl: string;
                    encode(message: _116.HeaderData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.HeaderData;
                    fromJSON(object: any): _116.HeaderData;
                    toJSON(message: _116.HeaderData): import("../json-safe.js").JsonSafe<_116.HeaderData>;
                    fromPartial(object: Partial<_116.HeaderData>): _116.HeaderData;
                    fromProtoMsg(message: _116.HeaderDataProtoMsg): _116.HeaderData;
                    toProto(message: _116.HeaderData): Uint8Array;
                    toProtoMsg(message: _116.HeaderData): _116.HeaderDataProtoMsg;
                };
                ClientStateData: {
                    typeUrl: string;
                    encode(message: _116.ClientStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ClientStateData;
                    fromJSON(object: any): _116.ClientStateData;
                    toJSON(message: _116.ClientStateData): import("../json-safe.js").JsonSafe<_116.ClientStateData>;
                    fromPartial(object: Partial<_116.ClientStateData>): _116.ClientStateData;
                    fromProtoMsg(message: _116.ClientStateDataProtoMsg): _116.ClientStateData;
                    toProto(message: _116.ClientStateData): Uint8Array;
                    toProtoMsg(message: _116.ClientStateData): _116.ClientStateDataProtoMsg;
                };
                ConsensusStateData: {
                    typeUrl: string;
                    encode(message: _116.ConsensusStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ConsensusStateData;
                    fromJSON(object: any): _116.ConsensusStateData;
                    toJSON(message: _116.ConsensusStateData): import("../json-safe.js").JsonSafe<_116.ConsensusStateData>;
                    fromPartial(object: Partial<_116.ConsensusStateData>): _116.ConsensusStateData;
                    fromProtoMsg(message: _116.ConsensusStateDataProtoMsg): _116.ConsensusStateData;
                    toProto(message: _116.ConsensusStateData): Uint8Array;
                    toProtoMsg(message: _116.ConsensusStateData): _116.ConsensusStateDataProtoMsg;
                };
                ConnectionStateData: {
                    typeUrl: string;
                    encode(message: _116.ConnectionStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ConnectionStateData;
                    fromJSON(object: any): _116.ConnectionStateData;
                    toJSON(message: _116.ConnectionStateData): import("../json-safe.js").JsonSafe<_116.ConnectionStateData>;
                    fromPartial(object: Partial<_116.ConnectionStateData>): _116.ConnectionStateData;
                    fromProtoMsg(message: _116.ConnectionStateDataProtoMsg): _116.ConnectionStateData;
                    toProto(message: _116.ConnectionStateData): Uint8Array;
                    toProtoMsg(message: _116.ConnectionStateData): _116.ConnectionStateDataProtoMsg;
                };
                ChannelStateData: {
                    typeUrl: string;
                    encode(message: _116.ChannelStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.ChannelStateData;
                    fromJSON(object: any): _116.ChannelStateData;
                    toJSON(message: _116.ChannelStateData): import("../json-safe.js").JsonSafe<_116.ChannelStateData>;
                    fromPartial(object: Partial<_116.ChannelStateData>): _116.ChannelStateData;
                    fromProtoMsg(message: _116.ChannelStateDataProtoMsg): _116.ChannelStateData;
                    toProto(message: _116.ChannelStateData): Uint8Array;
                    toProtoMsg(message: _116.ChannelStateData): _116.ChannelStateDataProtoMsg;
                };
                PacketCommitmentData: {
                    typeUrl: string;
                    encode(message: _116.PacketCommitmentData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.PacketCommitmentData;
                    fromJSON(object: any): _116.PacketCommitmentData;
                    toJSON(message: _116.PacketCommitmentData): import("../json-safe.js").JsonSafe<_116.PacketCommitmentData>;
                    fromPartial(object: Partial<_116.PacketCommitmentData>): _116.PacketCommitmentData;
                    fromProtoMsg(message: _116.PacketCommitmentDataProtoMsg): _116.PacketCommitmentData;
                    toProto(message: _116.PacketCommitmentData): Uint8Array;
                    toProtoMsg(message: _116.PacketCommitmentData): _116.PacketCommitmentDataProtoMsg;
                };
                PacketAcknowledgementData: {
                    typeUrl: string;
                    encode(message: _116.PacketAcknowledgementData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.PacketAcknowledgementData;
                    fromJSON(object: any): _116.PacketAcknowledgementData;
                    toJSON(message: _116.PacketAcknowledgementData): import("../json-safe.js").JsonSafe<_116.PacketAcknowledgementData>;
                    fromPartial(object: Partial<_116.PacketAcknowledgementData>): _116.PacketAcknowledgementData;
                    fromProtoMsg(message: _116.PacketAcknowledgementDataProtoMsg): _116.PacketAcknowledgementData;
                    toProto(message: _116.PacketAcknowledgementData): Uint8Array;
                    toProtoMsg(message: _116.PacketAcknowledgementData): _116.PacketAcknowledgementDataProtoMsg;
                };
                PacketReceiptAbsenceData: {
                    typeUrl: string;
                    encode(message: _116.PacketReceiptAbsenceData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.PacketReceiptAbsenceData;
                    fromJSON(object: any): _116.PacketReceiptAbsenceData;
                    toJSON(message: _116.PacketReceiptAbsenceData): import("../json-safe.js").JsonSafe<_116.PacketReceiptAbsenceData>;
                    fromPartial(object: Partial<_116.PacketReceiptAbsenceData>): _116.PacketReceiptAbsenceData;
                    fromProtoMsg(message: _116.PacketReceiptAbsenceDataProtoMsg): _116.PacketReceiptAbsenceData;
                    toProto(message: _116.PacketReceiptAbsenceData): Uint8Array;
                    toProtoMsg(message: _116.PacketReceiptAbsenceData): _116.PacketReceiptAbsenceDataProtoMsg;
                };
                NextSequenceRecvData: {
                    typeUrl: string;
                    encode(message: _116.NextSequenceRecvData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _116.NextSequenceRecvData;
                    fromJSON(object: any): _116.NextSequenceRecvData;
                    toJSON(message: _116.NextSequenceRecvData): import("../json-safe.js").JsonSafe<_116.NextSequenceRecvData>;
                    fromPartial(object: Partial<_116.NextSequenceRecvData>): _116.NextSequenceRecvData;
                    fromProtoMsg(message: _116.NextSequenceRecvDataProtoMsg): _116.NextSequenceRecvData;
                    toProto(message: _116.NextSequenceRecvData): Uint8Array;
                    toProtoMsg(message: _116.NextSequenceRecvData): _116.NextSequenceRecvDataProtoMsg;
                };
            };
            const v2: {
                dataTypeFromJSON(object: any): _117.DataType;
                dataTypeToJSON(object: _117.DataType): string;
                DataType: typeof _117.DataType;
                DataTypeSDKType: typeof _117.DataType;
                ClientState: {
                    typeUrl: string;
                    encode(message: _117.ClientState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ClientState;
                    fromJSON(object: any): _117.ClientState;
                    toJSON(message: _117.ClientState): import("../json-safe.js").JsonSafe<_117.ClientState>;
                    fromPartial(object: Partial<_117.ClientState>): _117.ClientState;
                    fromProtoMsg(message: _117.ClientStateProtoMsg): _117.ClientState;
                    toProto(message: _117.ClientState): Uint8Array;
                    toProtoMsg(message: _117.ClientState): _117.ClientStateProtoMsg;
                };
                ConsensusState: {
                    typeUrl: string;
                    encode(message: _117.ConsensusState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ConsensusState;
                    fromJSON(object: any): _117.ConsensusState;
                    toJSON(message: _117.ConsensusState): import("../json-safe.js").JsonSafe<_117.ConsensusState>;
                    fromPartial(object: Partial<_117.ConsensusState>): _117.ConsensusState;
                    fromProtoMsg(message: _117.ConsensusStateProtoMsg): _117.ConsensusState;
                    toProto(message: _117.ConsensusState): Uint8Array;
                    toProtoMsg(message: _117.ConsensusState): _117.ConsensusStateProtoMsg;
                };
                Header: {
                    typeUrl: string;
                    encode(message: _117.Header, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.Header;
                    fromJSON(object: any): _117.Header;
                    toJSON(message: _117.Header): import("../json-safe.js").JsonSafe<_117.Header>;
                    fromPartial(object: Partial<_117.Header>): _117.Header;
                    fromProtoMsg(message: _117.HeaderProtoMsg): _117.Header;
                    toProto(message: _117.Header): Uint8Array;
                    toProtoMsg(message: _117.Header): _117.HeaderProtoMsg;
                };
                Misbehaviour: {
                    typeUrl: string;
                    encode(message: _117.Misbehaviour, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.Misbehaviour;
                    fromJSON(object: any): _117.Misbehaviour;
                    toJSON(message: _117.Misbehaviour): import("../json-safe.js").JsonSafe<_117.Misbehaviour>;
                    fromPartial(object: Partial<_117.Misbehaviour>): _117.Misbehaviour;
                    fromProtoMsg(message: _117.MisbehaviourProtoMsg): _117.Misbehaviour;
                    toProto(message: _117.Misbehaviour): Uint8Array;
                    toProtoMsg(message: _117.Misbehaviour): _117.MisbehaviourProtoMsg;
                };
                SignatureAndData: {
                    typeUrl: string;
                    encode(message: _117.SignatureAndData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.SignatureAndData;
                    fromJSON(object: any): _117.SignatureAndData;
                    toJSON(message: _117.SignatureAndData): import("../json-safe.js").JsonSafe<_117.SignatureAndData>;
                    fromPartial(object: Partial<_117.SignatureAndData>): _117.SignatureAndData;
                    fromProtoMsg(message: _117.SignatureAndDataProtoMsg): _117.SignatureAndData;
                    toProto(message: _117.SignatureAndData): Uint8Array;
                    toProtoMsg(message: _117.SignatureAndData): _117.SignatureAndDataProtoMsg;
                };
                TimestampedSignatureData: {
                    typeUrl: string;
                    encode(message: _117.TimestampedSignatureData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.TimestampedSignatureData;
                    fromJSON(object: any): _117.TimestampedSignatureData;
                    toJSON(message: _117.TimestampedSignatureData): import("../json-safe.js").JsonSafe<_117.TimestampedSignatureData>;
                    fromPartial(object: Partial<_117.TimestampedSignatureData>): _117.TimestampedSignatureData;
                    fromProtoMsg(message: _117.TimestampedSignatureDataProtoMsg): _117.TimestampedSignatureData;
                    toProto(message: _117.TimestampedSignatureData): Uint8Array;
                    toProtoMsg(message: _117.TimestampedSignatureData): _117.TimestampedSignatureDataProtoMsg;
                };
                SignBytes: {
                    typeUrl: string;
                    encode(message: _117.SignBytes, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.SignBytes;
                    fromJSON(object: any): _117.SignBytes;
                    toJSON(message: _117.SignBytes): import("../json-safe.js").JsonSafe<_117.SignBytes>;
                    fromPartial(object: Partial<_117.SignBytes>): _117.SignBytes;
                    fromProtoMsg(message: _117.SignBytesProtoMsg): _117.SignBytes;
                    toProto(message: _117.SignBytes): Uint8Array;
                    toProtoMsg(message: _117.SignBytes): _117.SignBytesProtoMsg;
                };
                HeaderData: {
                    typeUrl: string;
                    encode(message: _117.HeaderData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.HeaderData;
                    fromJSON(object: any): _117.HeaderData;
                    toJSON(message: _117.HeaderData): import("../json-safe.js").JsonSafe<_117.HeaderData>;
                    fromPartial(object: Partial<_117.HeaderData>): _117.HeaderData;
                    fromProtoMsg(message: _117.HeaderDataProtoMsg): _117.HeaderData;
                    toProto(message: _117.HeaderData): Uint8Array;
                    toProtoMsg(message: _117.HeaderData): _117.HeaderDataProtoMsg;
                };
                ClientStateData: {
                    typeUrl: string;
                    encode(message: _117.ClientStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ClientStateData;
                    fromJSON(object: any): _117.ClientStateData;
                    toJSON(message: _117.ClientStateData): import("../json-safe.js").JsonSafe<_117.ClientStateData>;
                    fromPartial(object: Partial<_117.ClientStateData>): _117.ClientStateData;
                    fromProtoMsg(message: _117.ClientStateDataProtoMsg): _117.ClientStateData;
                    toProto(message: _117.ClientStateData): Uint8Array;
                    toProtoMsg(message: _117.ClientStateData): _117.ClientStateDataProtoMsg;
                };
                ConsensusStateData: {
                    typeUrl: string;
                    encode(message: _117.ConsensusStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ConsensusStateData;
                    fromJSON(object: any): _117.ConsensusStateData;
                    toJSON(message: _117.ConsensusStateData): import("../json-safe.js").JsonSafe<_117.ConsensusStateData>;
                    fromPartial(object: Partial<_117.ConsensusStateData>): _117.ConsensusStateData;
                    fromProtoMsg(message: _117.ConsensusStateDataProtoMsg): _117.ConsensusStateData;
                    toProto(message: _117.ConsensusStateData): Uint8Array;
                    toProtoMsg(message: _117.ConsensusStateData): _117.ConsensusStateDataProtoMsg;
                };
                ConnectionStateData: {
                    typeUrl: string;
                    encode(message: _117.ConnectionStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ConnectionStateData;
                    fromJSON(object: any): _117.ConnectionStateData;
                    toJSON(message: _117.ConnectionStateData): import("../json-safe.js").JsonSafe<_117.ConnectionStateData>;
                    fromPartial(object: Partial<_117.ConnectionStateData>): _117.ConnectionStateData;
                    fromProtoMsg(message: _117.ConnectionStateDataProtoMsg): _117.ConnectionStateData;
                    toProto(message: _117.ConnectionStateData): Uint8Array;
                    toProtoMsg(message: _117.ConnectionStateData): _117.ConnectionStateDataProtoMsg;
                };
                ChannelStateData: {
                    typeUrl: string;
                    encode(message: _117.ChannelStateData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.ChannelStateData;
                    fromJSON(object: any): _117.ChannelStateData;
                    toJSON(message: _117.ChannelStateData): import("../json-safe.js").JsonSafe<_117.ChannelStateData>;
                    fromPartial(object: Partial<_117.ChannelStateData>): _117.ChannelStateData;
                    fromProtoMsg(message: _117.ChannelStateDataProtoMsg): _117.ChannelStateData;
                    toProto(message: _117.ChannelStateData): Uint8Array;
                    toProtoMsg(message: _117.ChannelStateData): _117.ChannelStateDataProtoMsg;
                };
                PacketCommitmentData: {
                    typeUrl: string;
                    encode(message: _117.PacketCommitmentData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.PacketCommitmentData;
                    fromJSON(object: any): _117.PacketCommitmentData;
                    toJSON(message: _117.PacketCommitmentData): import("../json-safe.js").JsonSafe<_117.PacketCommitmentData>;
                    fromPartial(object: Partial<_117.PacketCommitmentData>): _117.PacketCommitmentData;
                    fromProtoMsg(message: _117.PacketCommitmentDataProtoMsg): _117.PacketCommitmentData;
                    toProto(message: _117.PacketCommitmentData): Uint8Array;
                    toProtoMsg(message: _117.PacketCommitmentData): _117.PacketCommitmentDataProtoMsg;
                };
                PacketAcknowledgementData: {
                    typeUrl: string;
                    encode(message: _117.PacketAcknowledgementData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.PacketAcknowledgementData;
                    fromJSON(object: any): _117.PacketAcknowledgementData;
                    toJSON(message: _117.PacketAcknowledgementData): import("../json-safe.js").JsonSafe<_117.PacketAcknowledgementData>;
                    fromPartial(object: Partial<_117.PacketAcknowledgementData>): _117.PacketAcknowledgementData;
                    fromProtoMsg(message: _117.PacketAcknowledgementDataProtoMsg): _117.PacketAcknowledgementData;
                    toProto(message: _117.PacketAcknowledgementData): Uint8Array;
                    toProtoMsg(message: _117.PacketAcknowledgementData): _117.PacketAcknowledgementDataProtoMsg;
                };
                PacketReceiptAbsenceData: {
                    typeUrl: string;
                    encode(message: _117.PacketReceiptAbsenceData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.PacketReceiptAbsenceData;
                    fromJSON(object: any): _117.PacketReceiptAbsenceData;
                    toJSON(message: _117.PacketReceiptAbsenceData): import("../json-safe.js").JsonSafe<_117.PacketReceiptAbsenceData>;
                    fromPartial(object: Partial<_117.PacketReceiptAbsenceData>): _117.PacketReceiptAbsenceData;
                    fromProtoMsg(message: _117.PacketReceiptAbsenceDataProtoMsg): _117.PacketReceiptAbsenceData;
                    toProto(message: _117.PacketReceiptAbsenceData): Uint8Array;
                    toProtoMsg(message: _117.PacketReceiptAbsenceData): _117.PacketReceiptAbsenceDataProtoMsg;
                };
                NextSequenceRecvData: {
                    typeUrl: string;
                    encode(message: _117.NextSequenceRecvData, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _117.NextSequenceRecvData;
                    fromJSON(object: any): _117.NextSequenceRecvData;
                    toJSON(message: _117.NextSequenceRecvData): import("../json-safe.js").JsonSafe<_117.NextSequenceRecvData>;
                    fromPartial(object: Partial<_117.NextSequenceRecvData>): _117.NextSequenceRecvData;
                    fromProtoMsg(message: _117.NextSequenceRecvDataProtoMsg): _117.NextSequenceRecvData;
                    toProto(message: _117.NextSequenceRecvData): Uint8Array;
                    toProtoMsg(message: _117.NextSequenceRecvData): _117.NextSequenceRecvDataProtoMsg;
                };
            };
        }
        namespace tendermint {
            const v1: {
                ClientState: {
                    typeUrl: string;
                    encode(message: _118.ClientState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _118.ClientState;
                    fromJSON(object: any): _118.ClientState;
                    toJSON(message: _118.ClientState): import("../json-safe.js").JsonSafe<_118.ClientState>;
                    fromPartial(object: Partial<_118.ClientState>): _118.ClientState;
                    fromProtoMsg(message: _118.ClientStateProtoMsg): _118.ClientState;
                    toProto(message: _118.ClientState): Uint8Array;
                    toProtoMsg(message: _118.ClientState): _118.ClientStateProtoMsg;
                };
                ConsensusState: {
                    typeUrl: string;
                    encode(message: _118.ConsensusState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _118.ConsensusState;
                    fromJSON(object: any): _118.ConsensusState;
                    toJSON(message: _118.ConsensusState): import("../json-safe.js").JsonSafe<_118.ConsensusState>;
                    fromPartial(object: Partial<_118.ConsensusState>): _118.ConsensusState;
                    fromProtoMsg(message: _118.ConsensusStateProtoMsg): _118.ConsensusState;
                    toProto(message: _118.ConsensusState): Uint8Array;
                    toProtoMsg(message: _118.ConsensusState): _118.ConsensusStateProtoMsg;
                };
                Misbehaviour: {
                    typeUrl: string;
                    encode(message: _118.Misbehaviour, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _118.Misbehaviour;
                    fromJSON(object: any): _118.Misbehaviour;
                    toJSON(message: _118.Misbehaviour): import("../json-safe.js").JsonSafe<_118.Misbehaviour>;
                    fromPartial(object: Partial<_118.Misbehaviour>): _118.Misbehaviour;
                    fromProtoMsg(message: _118.MisbehaviourProtoMsg): _118.Misbehaviour;
                    toProto(message: _118.Misbehaviour): Uint8Array;
                    toProtoMsg(message: _118.Misbehaviour): _118.MisbehaviourProtoMsg;
                };
                Header: {
                    typeUrl: string;
                    encode(message: _118.Header, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _118.Header;
                    fromJSON(object: any): _118.Header;
                    toJSON(message: _118.Header): import("../json-safe.js").JsonSafe<_118.Header>;
                    fromPartial(object: Partial<_118.Header>): _118.Header;
                    fromProtoMsg(message: _118.HeaderProtoMsg): _118.Header;
                    toProto(message: _118.Header): Uint8Array;
                    toProtoMsg(message: _118.Header): _118.HeaderProtoMsg;
                };
                Fraction: {
                    typeUrl: string;
                    encode(message: _118.Fraction, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
                    decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _118.Fraction;
                    fromJSON(object: any): _118.Fraction;
                    toJSON(message: _118.Fraction): import("../json-safe.js").JsonSafe<_118.Fraction>;
                    fromPartial(object: Partial<_118.Fraction>): _118.Fraction;
                    fromProtoMsg(message: _118.FractionProtoMsg): _118.Fraction;
                    toProto(message: _118.Fraction): Uint8Array;
                    toProtoMsg(message: _118.Fraction): _118.FractionProtoMsg;
                };
            };
        }
    }
}
