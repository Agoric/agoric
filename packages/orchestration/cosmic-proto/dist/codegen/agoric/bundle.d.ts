import * as _0 from './lien/genesis.js';
import * as _1 from './lien/lien.js';
import * as _2 from './swingset/genesis.js';
import * as _3 from './swingset/msgs.js';
import * as _4 from './swingset/query.js';
import * as _5 from './swingset/swingset.js';
import * as _6 from './vbank/genesis.js';
import * as _8 from './vbank/query.js';
import * as _9 from './vbank/vbank.js';
import * as _10 from './vibc/msgs.js';
import * as _11 from './vlocalchain/vlocalchain.js';
import * as _12 from './vstorage/genesis.js';
import * as _13 from './vstorage/query.js';
import * as _14 from './vstorage/vstorage.js';
import * as _15 from './vtransfer/genesis.js';
export declare namespace agoric {
    const lien: {
        Lien: {
            typeUrl: string;
            encode(message: _1.Lien, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _1.Lien;
            fromJSON(object: any): _1.Lien;
            toJSON(message: _1.Lien): import("../json-safe.js").JsonSafe<_1.Lien>;
            fromPartial(object: Partial<_1.Lien>): _1.Lien;
            fromProtoMsg(message: _1.LienProtoMsg): _1.Lien;
            toProto(message: _1.Lien): Uint8Array;
            toProtoMsg(message: _1.Lien): _1.LienProtoMsg;
        };
        GenesisState: {
            typeUrl: string;
            encode(message: _0.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _0.GenesisState;
            fromJSON(object: any): _0.GenesisState;
            toJSON(message: _0.GenesisState): import("../json-safe.js").JsonSafe<_0.GenesisState>;
            fromPartial(object: Partial<_0.GenesisState>): _0.GenesisState;
            fromProtoMsg(message: _0.GenesisStateProtoMsg): _0.GenesisState;
            toProto(message: _0.GenesisState): Uint8Array;
            toProtoMsg(message: _0.GenesisState): _0.GenesisStateProtoMsg;
        };
        AccountLien: {
            typeUrl: string;
            encode(message: _0.AccountLien, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _0.AccountLien;
            fromJSON(object: any): _0.AccountLien;
            toJSON(message: _0.AccountLien): import("../json-safe.js").JsonSafe<_0.AccountLien>;
            fromPartial(object: Partial<_0.AccountLien>): _0.AccountLien;
            fromProtoMsg(message: _0.AccountLienProtoMsg): _0.AccountLien;
            toProto(message: _0.AccountLien): Uint8Array;
            toProtoMsg(message: _0.AccountLien): _0.AccountLienProtoMsg;
        };
    };
    const swingset: {
        CoreEvalProposal: {
            typeUrl: string;
            encode(message: _5.CoreEvalProposal, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.CoreEvalProposal;
            fromJSON(object: any): _5.CoreEvalProposal;
            toJSON(message: _5.CoreEvalProposal): import("../json-safe.js").JsonSafe<_5.CoreEvalProposal>;
            fromPartial(object: Partial<_5.CoreEvalProposal>): _5.CoreEvalProposal;
            fromProtoMsg(message: _5.CoreEvalProposalProtoMsg): _5.CoreEvalProposal;
            toProto(message: _5.CoreEvalProposal): Uint8Array;
            toProtoMsg(message: _5.CoreEvalProposal): _5.CoreEvalProposalProtoMsg;
        };
        CoreEval: {
            typeUrl: string;
            encode(message: _5.CoreEval, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.CoreEval;
            fromJSON(object: any): _5.CoreEval;
            toJSON(message: _5.CoreEval): import("../json-safe.js").JsonSafe<_5.CoreEval>;
            fromPartial(object: Partial<_5.CoreEval>): _5.CoreEval;
            fromProtoMsg(message: _5.CoreEvalProtoMsg): _5.CoreEval;
            toProto(message: _5.CoreEval): Uint8Array;
            toProtoMsg(message: _5.CoreEval): _5.CoreEvalProtoMsg;
        };
        Params: {
            typeUrl: string;
            encode(message: _5.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.Params;
            fromJSON(object: any): _5.Params;
            toJSON(message: _5.Params): import("../json-safe.js").JsonSafe<_5.Params>;
            fromPartial(object: Partial<_5.Params>): _5.Params;
            fromProtoMsg(message: _5.ParamsProtoMsg): _5.Params;
            toProto(message: _5.Params): Uint8Array;
            toProtoMsg(message: _5.Params): _5.ParamsProtoMsg;
        };
        State: {
            typeUrl: string;
            encode(message: _5.State, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.State;
            fromJSON(object: any): _5.State;
            toJSON(message: _5.State): import("../json-safe.js").JsonSafe<_5.State>;
            fromPartial(object: Partial<_5.State>): _5.State;
            fromProtoMsg(message: _5.StateProtoMsg): _5.State;
            toProto(message: _5.State): Uint8Array;
            toProtoMsg(message: _5.State): _5.StateProtoMsg;
        };
        StringBeans: {
            typeUrl: string;
            encode(message: _5.StringBeans, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.StringBeans;
            fromJSON(object: any): _5.StringBeans;
            toJSON(message: _5.StringBeans): import("../json-safe.js").JsonSafe<_5.StringBeans>;
            fromPartial(object: Partial<_5.StringBeans>): _5.StringBeans;
            fromProtoMsg(message: _5.StringBeansProtoMsg): _5.StringBeans;
            toProto(message: _5.StringBeans): Uint8Array;
            toProtoMsg(message: _5.StringBeans): _5.StringBeansProtoMsg;
        };
        PowerFlagFee: {
            typeUrl: string;
            encode(message: _5.PowerFlagFee, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.PowerFlagFee;
            fromJSON(object: any): _5.PowerFlagFee;
            toJSON(message: _5.PowerFlagFee): import("../json-safe.js").JsonSafe<_5.PowerFlagFee>;
            fromPartial(object: Partial<_5.PowerFlagFee>): _5.PowerFlagFee;
            fromProtoMsg(message: _5.PowerFlagFeeProtoMsg): _5.PowerFlagFee;
            toProto(message: _5.PowerFlagFee): Uint8Array;
            toProtoMsg(message: _5.PowerFlagFee): _5.PowerFlagFeeProtoMsg;
        };
        QueueSize: {
            typeUrl: string;
            encode(message: _5.QueueSize, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.QueueSize;
            fromJSON(object: any): _5.QueueSize;
            toJSON(message: _5.QueueSize): import("../json-safe.js").JsonSafe<_5.QueueSize>;
            fromPartial(object: Partial<_5.QueueSize>): _5.QueueSize;
            fromProtoMsg(message: _5.QueueSizeProtoMsg): _5.QueueSize;
            toProto(message: _5.QueueSize): Uint8Array;
            toProtoMsg(message: _5.QueueSize): _5.QueueSizeProtoMsg;
        };
        UintMapEntry: {
            typeUrl: string;
            encode(message: _5.UintMapEntry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.UintMapEntry;
            fromJSON(object: any): _5.UintMapEntry;
            toJSON(message: _5.UintMapEntry): import("../json-safe.js").JsonSafe<_5.UintMapEntry>;
            fromPartial(object: Partial<_5.UintMapEntry>): _5.UintMapEntry;
            fromProtoMsg(message: _5.UintMapEntryProtoMsg): _5.UintMapEntry;
            toProto(message: _5.UintMapEntry): Uint8Array;
            toProtoMsg(message: _5.UintMapEntry): _5.UintMapEntryProtoMsg;
        };
        Egress: {
            typeUrl: string;
            encode(message: _5.Egress, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.Egress;
            fromJSON(object: any): _5.Egress;
            toJSON(message: _5.Egress): import("../json-safe.js").JsonSafe<_5.Egress>;
            fromPartial(object: Partial<_5.Egress>): _5.Egress;
            fromProtoMsg(message: _5.EgressProtoMsg): _5.Egress;
            toProto(message: _5.Egress): Uint8Array;
            toProtoMsg(message: _5.Egress): _5.EgressProtoMsg;
        };
        SwingStoreArtifact: {
            typeUrl: string;
            encode(message: _5.SwingStoreArtifact, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _5.SwingStoreArtifact;
            fromJSON(object: any): _5.SwingStoreArtifact;
            toJSON(message: _5.SwingStoreArtifact): import("../json-safe.js").JsonSafe<_5.SwingStoreArtifact>;
            fromPartial(object: Partial<_5.SwingStoreArtifact>): _5.SwingStoreArtifact;
            fromProtoMsg(message: _5.SwingStoreArtifactProtoMsg): _5.SwingStoreArtifact;
            toProto(message: _5.SwingStoreArtifact): Uint8Array;
            toProtoMsg(message: _5.SwingStoreArtifact): _5.SwingStoreArtifactProtoMsg;
        };
        QueryParamsRequest: {
            typeUrl: string;
            encode(_: _4.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryParamsRequest;
            fromJSON(_: any): _4.QueryParamsRequest;
            toJSON(_: _4.QueryParamsRequest): import("../json-safe.js").JsonSafe<_4.QueryParamsRequest>;
            fromPartial(_: Partial<_4.QueryParamsRequest>): _4.QueryParamsRequest;
            fromProtoMsg(message: _4.QueryParamsRequestProtoMsg): _4.QueryParamsRequest;
            toProto(message: _4.QueryParamsRequest): Uint8Array;
            toProtoMsg(message: _4.QueryParamsRequest): _4.QueryParamsRequestProtoMsg;
        };
        QueryParamsResponse: {
            typeUrl: string;
            encode(message: _4.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryParamsResponse;
            fromJSON(object: any): _4.QueryParamsResponse;
            toJSON(message: _4.QueryParamsResponse): import("../json-safe.js").JsonSafe<_4.QueryParamsResponse>;
            fromPartial(object: Partial<_4.QueryParamsResponse>): _4.QueryParamsResponse;
            fromProtoMsg(message: _4.QueryParamsResponseProtoMsg): _4.QueryParamsResponse;
            toProto(message: _4.QueryParamsResponse): Uint8Array;
            toProtoMsg(message: _4.QueryParamsResponse): _4.QueryParamsResponseProtoMsg;
        };
        QueryEgressRequest: {
            typeUrl: string;
            encode(message: _4.QueryEgressRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryEgressRequest;
            fromJSON(object: any): _4.QueryEgressRequest;
            toJSON(message: _4.QueryEgressRequest): import("../json-safe.js").JsonSafe<_4.QueryEgressRequest>;
            fromPartial(object: Partial<_4.QueryEgressRequest>): _4.QueryEgressRequest;
            fromProtoMsg(message: _4.QueryEgressRequestProtoMsg): _4.QueryEgressRequest;
            toProto(message: _4.QueryEgressRequest): Uint8Array;
            toProtoMsg(message: _4.QueryEgressRequest): _4.QueryEgressRequestProtoMsg;
        };
        QueryEgressResponse: {
            typeUrl: string;
            encode(message: _4.QueryEgressResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryEgressResponse;
            fromJSON(object: any): _4.QueryEgressResponse;
            toJSON(message: _4.QueryEgressResponse): import("../json-safe.js").JsonSafe<_4.QueryEgressResponse>;
            fromPartial(object: Partial<_4.QueryEgressResponse>): _4.QueryEgressResponse;
            fromProtoMsg(message: _4.QueryEgressResponseProtoMsg): _4.QueryEgressResponse;
            toProto(message: _4.QueryEgressResponse): Uint8Array;
            toProtoMsg(message: _4.QueryEgressResponse): _4.QueryEgressResponseProtoMsg;
        };
        QueryMailboxRequest: {
            typeUrl: string;
            encode(message: _4.QueryMailboxRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryMailboxRequest;
            fromJSON(object: any): _4.QueryMailboxRequest;
            toJSON(message: _4.QueryMailboxRequest): import("../json-safe.js").JsonSafe<_4.QueryMailboxRequest>;
            fromPartial(object: Partial<_4.QueryMailboxRequest>): _4.QueryMailboxRequest;
            fromProtoMsg(message: _4.QueryMailboxRequestProtoMsg): _4.QueryMailboxRequest;
            toProto(message: _4.QueryMailboxRequest): Uint8Array;
            toProtoMsg(message: _4.QueryMailboxRequest): _4.QueryMailboxRequestProtoMsg;
        };
        QueryMailboxResponse: {
            typeUrl: string;
            encode(message: _4.QueryMailboxResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _4.QueryMailboxResponse;
            fromJSON(object: any): _4.QueryMailboxResponse;
            toJSON(message: _4.QueryMailboxResponse): import("../json-safe.js").JsonSafe<_4.QueryMailboxResponse>;
            fromPartial(object: Partial<_4.QueryMailboxResponse>): _4.QueryMailboxResponse;
            fromProtoMsg(message: _4.QueryMailboxResponseProtoMsg): _4.QueryMailboxResponse;
            toProto(message: _4.QueryMailboxResponse): Uint8Array;
            toProtoMsg(message: _4.QueryMailboxResponse): _4.QueryMailboxResponseProtoMsg;
        };
        MsgDeliverInbound: {
            typeUrl: string;
            encode(message: _3.MsgDeliverInbound, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgDeliverInbound;
            fromJSON(object: any): _3.MsgDeliverInbound;
            toJSON(message: _3.MsgDeliverInbound): import("../json-safe.js").JsonSafe<_3.MsgDeliverInbound>;
            fromPartial(object: Partial<_3.MsgDeliverInbound>): _3.MsgDeliverInbound;
            fromProtoMsg(message: _3.MsgDeliverInboundProtoMsg): _3.MsgDeliverInbound;
            toProto(message: _3.MsgDeliverInbound): Uint8Array;
            toProtoMsg(message: _3.MsgDeliverInbound): _3.MsgDeliverInboundProtoMsg;
        };
        MsgDeliverInboundResponse: {
            typeUrl: string;
            encode(_: _3.MsgDeliverInboundResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgDeliverInboundResponse;
            fromJSON(_: any): _3.MsgDeliverInboundResponse;
            toJSON(_: _3.MsgDeliverInboundResponse): import("../json-safe.js").JsonSafe<_3.MsgDeliverInboundResponse>;
            fromPartial(_: Partial<_3.MsgDeliverInboundResponse>): _3.MsgDeliverInboundResponse;
            fromProtoMsg(message: _3.MsgDeliverInboundResponseProtoMsg): _3.MsgDeliverInboundResponse;
            toProto(message: _3.MsgDeliverInboundResponse): Uint8Array;
            toProtoMsg(message: _3.MsgDeliverInboundResponse): _3.MsgDeliverInboundResponseProtoMsg;
        };
        MsgWalletAction: {
            typeUrl: string;
            encode(message: _3.MsgWalletAction, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgWalletAction;
            fromJSON(object: any): _3.MsgWalletAction;
            toJSON(message: _3.MsgWalletAction): import("../json-safe.js").JsonSafe<_3.MsgWalletAction>;
            fromPartial(object: Partial<_3.MsgWalletAction>): _3.MsgWalletAction;
            fromProtoMsg(message: _3.MsgWalletActionProtoMsg): _3.MsgWalletAction;
            toProto(message: _3.MsgWalletAction): Uint8Array;
            toProtoMsg(message: _3.MsgWalletAction): _3.MsgWalletActionProtoMsg;
        };
        MsgWalletActionResponse: {
            typeUrl: string;
            encode(_: _3.MsgWalletActionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgWalletActionResponse;
            fromJSON(_: any): _3.MsgWalletActionResponse;
            toJSON(_: _3.MsgWalletActionResponse): import("../json-safe.js").JsonSafe<_3.MsgWalletActionResponse>;
            fromPartial(_: Partial<_3.MsgWalletActionResponse>): _3.MsgWalletActionResponse;
            fromProtoMsg(message: _3.MsgWalletActionResponseProtoMsg): _3.MsgWalletActionResponse;
            toProto(message: _3.MsgWalletActionResponse): Uint8Array;
            toProtoMsg(message: _3.MsgWalletActionResponse): _3.MsgWalletActionResponseProtoMsg;
        };
        MsgWalletSpendAction: {
            typeUrl: string;
            encode(message: _3.MsgWalletSpendAction, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgWalletSpendAction;
            fromJSON(object: any): _3.MsgWalletSpendAction;
            toJSON(message: _3.MsgWalletSpendAction): import("../json-safe.js").JsonSafe<_3.MsgWalletSpendAction>;
            fromPartial(object: Partial<_3.MsgWalletSpendAction>): _3.MsgWalletSpendAction;
            fromProtoMsg(message: _3.MsgWalletSpendActionProtoMsg): _3.MsgWalletSpendAction;
            toProto(message: _3.MsgWalletSpendAction): Uint8Array;
            toProtoMsg(message: _3.MsgWalletSpendAction): _3.MsgWalletSpendActionProtoMsg;
        };
        MsgWalletSpendActionResponse: {
            typeUrl: string;
            encode(_: _3.MsgWalletSpendActionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgWalletSpendActionResponse;
            fromJSON(_: any): _3.MsgWalletSpendActionResponse;
            toJSON(_: _3.MsgWalletSpendActionResponse): import("../json-safe.js").JsonSafe<_3.MsgWalletSpendActionResponse>;
            fromPartial(_: Partial<_3.MsgWalletSpendActionResponse>): _3.MsgWalletSpendActionResponse;
            fromProtoMsg(message: _3.MsgWalletSpendActionResponseProtoMsg): _3.MsgWalletSpendActionResponse;
            toProto(message: _3.MsgWalletSpendActionResponse): Uint8Array;
            toProtoMsg(message: _3.MsgWalletSpendActionResponse): _3.MsgWalletSpendActionResponseProtoMsg;
        };
        MsgProvision: {
            typeUrl: string;
            encode(message: _3.MsgProvision, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgProvision;
            fromJSON(object: any): _3.MsgProvision;
            toJSON(message: _3.MsgProvision): import("../json-safe.js").JsonSafe<_3.MsgProvision>;
            fromPartial(object: Partial<_3.MsgProvision>): _3.MsgProvision;
            fromProtoMsg(message: _3.MsgProvisionProtoMsg): _3.MsgProvision;
            toProto(message: _3.MsgProvision): Uint8Array;
            toProtoMsg(message: _3.MsgProvision): _3.MsgProvisionProtoMsg;
        };
        MsgProvisionResponse: {
            typeUrl: string;
            encode(_: _3.MsgProvisionResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgProvisionResponse;
            fromJSON(_: any): _3.MsgProvisionResponse;
            toJSON(_: _3.MsgProvisionResponse): import("../json-safe.js").JsonSafe<_3.MsgProvisionResponse>;
            fromPartial(_: Partial<_3.MsgProvisionResponse>): _3.MsgProvisionResponse;
            fromProtoMsg(message: _3.MsgProvisionResponseProtoMsg): _3.MsgProvisionResponse;
            toProto(message: _3.MsgProvisionResponse): Uint8Array;
            toProtoMsg(message: _3.MsgProvisionResponse): _3.MsgProvisionResponseProtoMsg;
        };
        MsgInstallBundle: {
            typeUrl: string;
            encode(message: _3.MsgInstallBundle, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgInstallBundle;
            fromJSON(object: any): _3.MsgInstallBundle;
            toJSON(message: _3.MsgInstallBundle): import("../json-safe.js").JsonSafe<_3.MsgInstallBundle>;
            fromPartial(object: Partial<_3.MsgInstallBundle>): _3.MsgInstallBundle;
            fromProtoMsg(message: _3.MsgInstallBundleProtoMsg): _3.MsgInstallBundle;
            toProto(message: _3.MsgInstallBundle): Uint8Array;
            toProtoMsg(message: _3.MsgInstallBundle): _3.MsgInstallBundleProtoMsg;
        };
        MsgInstallBundleResponse: {
            typeUrl: string;
            encode(_: _3.MsgInstallBundleResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _3.MsgInstallBundleResponse;
            fromJSON(_: any): _3.MsgInstallBundleResponse;
            toJSON(_: _3.MsgInstallBundleResponse): import("../json-safe.js").JsonSafe<_3.MsgInstallBundleResponse>;
            fromPartial(_: Partial<_3.MsgInstallBundleResponse>): _3.MsgInstallBundleResponse;
            fromProtoMsg(message: _3.MsgInstallBundleResponseProtoMsg): _3.MsgInstallBundleResponse;
            toProto(message: _3.MsgInstallBundleResponse): Uint8Array;
            toProtoMsg(message: _3.MsgInstallBundleResponse): _3.MsgInstallBundleResponseProtoMsg;
        };
        GenesisState: {
            typeUrl: string;
            encode(message: _2.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _2.GenesisState;
            fromJSON(object: any): _2.GenesisState;
            toJSON(message: _2.GenesisState): import("../json-safe.js").JsonSafe<_2.GenesisState>;
            fromPartial(object: Partial<_2.GenesisState>): _2.GenesisState;
            fromProtoMsg(message: _2.GenesisStateProtoMsg): _2.GenesisState;
            toProto(message: _2.GenesisState): Uint8Array;
            toProtoMsg(message: _2.GenesisState): _2.GenesisStateProtoMsg;
        };
        SwingStoreExportDataEntry: {
            typeUrl: string;
            encode(message: _2.SwingStoreExportDataEntry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _2.SwingStoreExportDataEntry;
            fromJSON(object: any): _2.SwingStoreExportDataEntry;
            toJSON(message: _2.SwingStoreExportDataEntry): import("../json-safe.js").JsonSafe<_2.SwingStoreExportDataEntry>;
            fromPartial(object: Partial<_2.SwingStoreExportDataEntry>): _2.SwingStoreExportDataEntry;
            fromProtoMsg(message: _2.SwingStoreExportDataEntryProtoMsg): _2.SwingStoreExportDataEntry;
            toProto(message: _2.SwingStoreExportDataEntry): Uint8Array;
            toProtoMsg(message: _2.SwingStoreExportDataEntry): _2.SwingStoreExportDataEntryProtoMsg;
        };
    };
    const vbank: {
        Params: {
            typeUrl: string;
            encode(message: _9.Params, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _9.Params;
            fromJSON(object: any): _9.Params;
            toJSON(message: _9.Params): import("../json-safe.js").JsonSafe<_9.Params>;
            fromPartial(object: Partial<_9.Params>): _9.Params;
            fromProtoMsg(message: _9.ParamsProtoMsg): _9.Params;
            toProto(message: _9.Params): Uint8Array;
            toProtoMsg(message: _9.Params): _9.ParamsProtoMsg;
        };
        State: {
            typeUrl: string;
            encode(message: _9.State, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _9.State;
            fromJSON(object: any): _9.State;
            toJSON(message: _9.State): import("../json-safe.js").JsonSafe<_9.State>;
            fromPartial(object: Partial<_9.State>): _9.State;
            fromProtoMsg(message: _9.StateProtoMsg): _9.State;
            toProto(message: _9.State): Uint8Array;
            toProtoMsg(message: _9.State): _9.StateProtoMsg;
        };
        QueryParamsRequest: {
            typeUrl: string;
            encode(_: _8.QueryParamsRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _8.QueryParamsRequest;
            fromJSON(_: any): _8.QueryParamsRequest;
            toJSON(_: _8.QueryParamsRequest): import("../json-safe.js").JsonSafe<_8.QueryParamsRequest>;
            fromPartial(_: Partial<_8.QueryParamsRequest>): _8.QueryParamsRequest;
            fromProtoMsg(message: _8.QueryParamsRequestProtoMsg): _8.QueryParamsRequest;
            toProto(message: _8.QueryParamsRequest): Uint8Array;
            toProtoMsg(message: _8.QueryParamsRequest): _8.QueryParamsRequestProtoMsg;
        };
        QueryParamsResponse: {
            typeUrl: string;
            encode(message: _8.QueryParamsResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _8.QueryParamsResponse;
            fromJSON(object: any): _8.QueryParamsResponse;
            toJSON(message: _8.QueryParamsResponse): import("../json-safe.js").JsonSafe<_8.QueryParamsResponse>;
            fromPartial(object: Partial<_8.QueryParamsResponse>): _8.QueryParamsResponse;
            fromProtoMsg(message: _8.QueryParamsResponseProtoMsg): _8.QueryParamsResponse;
            toProto(message: _8.QueryParamsResponse): Uint8Array;
            toProtoMsg(message: _8.QueryParamsResponse): _8.QueryParamsResponseProtoMsg;
        };
        QueryStateRequest: {
            typeUrl: string;
            encode(_: _8.QueryStateRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _8.QueryStateRequest;
            fromJSON(_: any): _8.QueryStateRequest;
            toJSON(_: _8.QueryStateRequest): import("../json-safe.js").JsonSafe<_8.QueryStateRequest>;
            fromPartial(_: Partial<_8.QueryStateRequest>): _8.QueryStateRequest;
            fromProtoMsg(message: _8.QueryStateRequestProtoMsg): _8.QueryStateRequest;
            toProto(message: _8.QueryStateRequest): Uint8Array;
            toProtoMsg(message: _8.QueryStateRequest): _8.QueryStateRequestProtoMsg;
        };
        QueryStateResponse: {
            typeUrl: string;
            encode(message: _8.QueryStateResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _8.QueryStateResponse;
            fromJSON(object: any): _8.QueryStateResponse;
            toJSON(message: _8.QueryStateResponse): import("../json-safe.js").JsonSafe<_8.QueryStateResponse>;
            fromPartial(object: Partial<_8.QueryStateResponse>): _8.QueryStateResponse;
            fromProtoMsg(message: _8.QueryStateResponseProtoMsg): _8.QueryStateResponse;
            toProto(message: _8.QueryStateResponse): Uint8Array;
            toProtoMsg(message: _8.QueryStateResponse): _8.QueryStateResponseProtoMsg;
        };
        GenesisState: {
            typeUrl: string;
            encode(message: _6.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _6.GenesisState;
            fromJSON(object: any): _6.GenesisState;
            toJSON(message: _6.GenesisState): import("../json-safe.js").JsonSafe<_6.GenesisState>;
            fromPartial(object: Partial<_6.GenesisState>): _6.GenesisState;
            fromProtoMsg(message: _6.GenesisStateProtoMsg): _6.GenesisState;
            toProto(message: _6.GenesisState): Uint8Array;
            toProtoMsg(message: _6.GenesisState): _6.GenesisStateProtoMsg;
        };
    };
    const vibc: {
        MsgSendPacket: {
            typeUrl: string;
            encode(message: _10.MsgSendPacket, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _10.MsgSendPacket;
            fromJSON(object: any): _10.MsgSendPacket;
            toJSON(message: _10.MsgSendPacket): import("../json-safe.js").JsonSafe<_10.MsgSendPacket>;
            fromPartial(object: Partial<_10.MsgSendPacket>): _10.MsgSendPacket;
            fromProtoMsg(message: _10.MsgSendPacketProtoMsg): _10.MsgSendPacket;
            toProto(message: _10.MsgSendPacket): Uint8Array;
            toProtoMsg(message: _10.MsgSendPacket): _10.MsgSendPacketProtoMsg;
        };
        MsgSendPacketResponse: {
            typeUrl: string;
            encode(_: _10.MsgSendPacketResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _10.MsgSendPacketResponse;
            fromJSON(_: any): _10.MsgSendPacketResponse;
            toJSON(_: _10.MsgSendPacketResponse): import("../json-safe.js").JsonSafe<_10.MsgSendPacketResponse>;
            fromPartial(_: Partial<_10.MsgSendPacketResponse>): _10.MsgSendPacketResponse;
            fromProtoMsg(message: _10.MsgSendPacketResponseProtoMsg): _10.MsgSendPacketResponse;
            toProto(message: _10.MsgSendPacketResponse): Uint8Array;
            toProtoMsg(message: _10.MsgSendPacketResponse): _10.MsgSendPacketResponseProtoMsg;
        };
    };
    const vlocalchain: {
        CosmosTx: {
            typeUrl: string;
            encode(message: _11.CosmosTx, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _11.CosmosTx;
            fromJSON(object: any): _11.CosmosTx;
            toJSON(message: _11.CosmosTx): import("../json-safe.js").JsonSafe<_11.CosmosTx>;
            fromPartial(object: Partial<_11.CosmosTx>): _11.CosmosTx;
            fromProtoMsg(message: _11.CosmosTxProtoMsg): _11.CosmosTx;
            toProto(message: _11.CosmosTx): Uint8Array;
            toProtoMsg(message: _11.CosmosTx): _11.CosmosTxProtoMsg;
        };
        QueryRequest: {
            typeUrl: string;
            encode(message: _11.QueryRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _11.QueryRequest;
            fromJSON(object: any): _11.QueryRequest;
            toJSON(message: _11.QueryRequest): import("../json-safe.js").JsonSafe<_11.QueryRequest>;
            fromPartial(object: Partial<_11.QueryRequest>): _11.QueryRequest;
            fromProtoMsg(message: _11.QueryRequestProtoMsg): _11.QueryRequest;
            toProto(message: _11.QueryRequest): Uint8Array;
            toProtoMsg(message: _11.QueryRequest): _11.QueryRequestProtoMsg;
        };
        QueryResponse: {
            typeUrl: string;
            encode(message: _11.QueryResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _11.QueryResponse;
            fromJSON(object: any): _11.QueryResponse;
            toJSON(message: _11.QueryResponse): import("../json-safe.js").JsonSafe<_11.QueryResponse>;
            fromPartial(object: Partial<_11.QueryResponse>): _11.QueryResponse;
            fromProtoMsg(message: _11.QueryResponseProtoMsg): _11.QueryResponse;
            toProto(message: _11.QueryResponse): Uint8Array;
            toProtoMsg(message: _11.QueryResponse): _11.QueryResponseProtoMsg;
        };
        QueryResponses: {
            typeUrl: string;
            encode(message: _11.QueryResponses, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _11.QueryResponses;
            fromJSON(object: any): _11.QueryResponses;
            toJSON(message: _11.QueryResponses): import("../json-safe.js").JsonSafe<_11.QueryResponses>;
            fromPartial(object: Partial<_11.QueryResponses>): _11.QueryResponses;
            fromProtoMsg(message: _11.QueryResponsesProtoMsg): _11.QueryResponses;
            toProto(message: _11.QueryResponses): Uint8Array;
            toProtoMsg(message: _11.QueryResponses): _11.QueryResponsesProtoMsg;
        };
    };
    const vstorage: {
        Data: {
            typeUrl: string;
            encode(message: _14.Data, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _14.Data;
            fromJSON(object: any): _14.Data;
            toJSON(message: _14.Data): import("../json-safe.js").JsonSafe<_14.Data>;
            fromPartial(object: Partial<_14.Data>): _14.Data;
            fromProtoMsg(message: _14.DataProtoMsg): _14.Data;
            toProto(message: _14.Data): Uint8Array;
            toProtoMsg(message: _14.Data): _14.DataProtoMsg;
        };
        Children: {
            typeUrl: string;
            encode(message: _14.Children, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _14.Children;
            fromJSON(object: any): _14.Children;
            toJSON(message: _14.Children): import("../json-safe.js").JsonSafe<_14.Children>;
            fromPartial(object: Partial<_14.Children>): _14.Children;
            fromProtoMsg(message: _14.ChildrenProtoMsg): _14.Children;
            toProto(message: _14.Children): Uint8Array;
            toProtoMsg(message: _14.Children): _14.ChildrenProtoMsg;
        };
        QueryDataRequest: {
            typeUrl: string;
            encode(message: _13.QueryDataRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryDataRequest;
            fromJSON(object: any): _13.QueryDataRequest;
            toJSON(message: _13.QueryDataRequest): import("../json-safe.js").JsonSafe<_13.QueryDataRequest>;
            fromPartial(object: Partial<_13.QueryDataRequest>): _13.QueryDataRequest;
            fromProtoMsg(message: _13.QueryDataRequestProtoMsg): _13.QueryDataRequest;
            toProto(message: _13.QueryDataRequest): Uint8Array;
            toProtoMsg(message: _13.QueryDataRequest): _13.QueryDataRequestProtoMsg;
        };
        QueryDataResponse: {
            typeUrl: string;
            encode(message: _13.QueryDataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryDataResponse;
            fromJSON(object: any): _13.QueryDataResponse;
            toJSON(message: _13.QueryDataResponse): import("../json-safe.js").JsonSafe<_13.QueryDataResponse>;
            fromPartial(object: Partial<_13.QueryDataResponse>): _13.QueryDataResponse;
            fromProtoMsg(message: _13.QueryDataResponseProtoMsg): _13.QueryDataResponse;
            toProto(message: _13.QueryDataResponse): Uint8Array;
            toProtoMsg(message: _13.QueryDataResponse): _13.QueryDataResponseProtoMsg;
        };
        QueryCapDataRequest: {
            typeUrl: string;
            encode(message: _13.QueryCapDataRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryCapDataRequest;
            fromJSON(object: any): _13.QueryCapDataRequest;
            toJSON(message: _13.QueryCapDataRequest): import("../json-safe.js").JsonSafe<_13.QueryCapDataRequest>;
            fromPartial(object: Partial<_13.QueryCapDataRequest>): _13.QueryCapDataRequest;
            fromProtoMsg(message: _13.QueryCapDataRequestProtoMsg): _13.QueryCapDataRequest;
            toProto(message: _13.QueryCapDataRequest): Uint8Array;
            toProtoMsg(message: _13.QueryCapDataRequest): _13.QueryCapDataRequestProtoMsg;
        };
        QueryCapDataResponse: {
            typeUrl: string;
            encode(message: _13.QueryCapDataResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryCapDataResponse;
            fromJSON(object: any): _13.QueryCapDataResponse;
            toJSON(message: _13.QueryCapDataResponse): import("../json-safe.js").JsonSafe<_13.QueryCapDataResponse>;
            fromPartial(object: Partial<_13.QueryCapDataResponse>): _13.QueryCapDataResponse;
            fromProtoMsg(message: _13.QueryCapDataResponseProtoMsg): _13.QueryCapDataResponse;
            toProto(message: _13.QueryCapDataResponse): Uint8Array;
            toProtoMsg(message: _13.QueryCapDataResponse): _13.QueryCapDataResponseProtoMsg;
        };
        QueryChildrenRequest: {
            typeUrl: string;
            encode(message: _13.QueryChildrenRequest, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryChildrenRequest;
            fromJSON(object: any): _13.QueryChildrenRequest;
            toJSON(message: _13.QueryChildrenRequest): import("../json-safe.js").JsonSafe<_13.QueryChildrenRequest>;
            fromPartial(object: Partial<_13.QueryChildrenRequest>): _13.QueryChildrenRequest;
            fromProtoMsg(message: _13.QueryChildrenRequestProtoMsg): _13.QueryChildrenRequest;
            toProto(message: _13.QueryChildrenRequest): Uint8Array;
            toProtoMsg(message: _13.QueryChildrenRequest): _13.QueryChildrenRequestProtoMsg;
        };
        QueryChildrenResponse: {
            typeUrl: string;
            encode(message: _13.QueryChildrenResponse, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _13.QueryChildrenResponse;
            fromJSON(object: any): _13.QueryChildrenResponse;
            toJSON(message: _13.QueryChildrenResponse): import("../json-safe.js").JsonSafe<_13.QueryChildrenResponse>;
            fromPartial(object: Partial<_13.QueryChildrenResponse>): _13.QueryChildrenResponse;
            fromProtoMsg(message: _13.QueryChildrenResponseProtoMsg): _13.QueryChildrenResponse;
            toProto(message: _13.QueryChildrenResponse): Uint8Array;
            toProtoMsg(message: _13.QueryChildrenResponse): _13.QueryChildrenResponseProtoMsg;
        };
        GenesisState: {
            typeUrl: string;
            encode(message: _12.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _12.GenesisState;
            fromJSON(object: any): _12.GenesisState;
            toJSON(message: _12.GenesisState): import("../json-safe.js").JsonSafe<_12.GenesisState>;
            fromPartial(object: Partial<_12.GenesisState>): _12.GenesisState;
            fromProtoMsg(message: _12.GenesisStateProtoMsg): _12.GenesisState;
            toProto(message: _12.GenesisState): Uint8Array;
            toProtoMsg(message: _12.GenesisState): _12.GenesisStateProtoMsg;
        };
        DataEntry: {
            typeUrl: string;
            encode(message: _12.DataEntry, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _12.DataEntry;
            fromJSON(object: any): _12.DataEntry;
            toJSON(message: _12.DataEntry): import("../json-safe.js").JsonSafe<_12.DataEntry>;
            fromPartial(object: Partial<_12.DataEntry>): _12.DataEntry;
            fromProtoMsg(message: _12.DataEntryProtoMsg): _12.DataEntry;
            toProto(message: _12.DataEntry): Uint8Array;
            toProtoMsg(message: _12.DataEntry): _12.DataEntryProtoMsg;
        };
    };
    const vtransfer: {
        GenesisState: {
            typeUrl: string;
            encode(message: _15.GenesisState, writer?: import("../binary.js").BinaryWriter): import("../binary.js").BinaryWriter;
            decode(input: import("../binary.js").BinaryReader | Uint8Array, length?: number): _15.GenesisState;
            fromJSON(object: any): _15.GenesisState;
            toJSON(message: _15.GenesisState): import("../json-safe.js").JsonSafe<_15.GenesisState>;
            fromPartial(object: Partial<_15.GenesisState>): _15.GenesisState;
            fromProtoMsg(message: _15.GenesisStateProtoMsg): _15.GenesisState;
            toProto(message: _15.GenesisState): Uint8Array;
            toProtoMsg(message: _15.GenesisState): _15.GenesisStateProtoMsg;
        };
    };
}
