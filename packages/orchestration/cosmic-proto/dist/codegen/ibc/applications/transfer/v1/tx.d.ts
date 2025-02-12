import { Coin, type CoinSDKType } from '../../../../cosmos/base/v1beta1/coin.js';
import { Height, type HeightSDKType } from '../../../core/client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * MsgTransfer defines a msg to transfer fungible tokens (i.e Coins) between
 * ICS20 enabled chains. See ICS Spec here:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface MsgTransfer {
    /** the port on which the packet will be sent */
    sourcePort: string;
    /** the channel by which the packet will be sent */
    sourceChannel: string;
    /** the tokens to be transferred */
    token: Coin;
    /** the sender address */
    sender: string;
    /** the recipient address on the destination chain */
    receiver: string;
    /**
     * Timeout height relative to the current block height.
     * The timeout is disabled when set to 0.
     */
    timeoutHeight: Height;
    /**
     * Timeout timestamp in absolute nanoseconds since unix epoch.
     * The timeout is disabled when set to 0.
     */
    timeoutTimestamp: bigint;
    /** optional memo */
    memo: string;
}
export interface MsgTransferProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer';
    value: Uint8Array;
}
/**
 * MsgTransfer defines a msg to transfer fungible tokens (i.e Coins) between
 * ICS20 enabled chains. See ICS Spec here:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface MsgTransferSDKType {
    source_port: string;
    source_channel: string;
    token: CoinSDKType;
    sender: string;
    receiver: string;
    timeout_height: HeightSDKType;
    timeout_timestamp: bigint;
    memo: string;
}
/** MsgTransferResponse defines the Msg/Transfer response type. */
export interface MsgTransferResponse {
    /** sequence number of the transfer packet sent */
    sequence: bigint;
}
export interface MsgTransferResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransferResponse';
    value: Uint8Array;
}
/** MsgTransferResponse defines the Msg/Transfer response type. */
export interface MsgTransferResponseSDKType {
    sequence: bigint;
}
export declare const MsgTransfer: {
    typeUrl: string;
    encode(message: MsgTransfer, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgTransfer;
    fromJSON(object: any): MsgTransfer;
    toJSON(message: MsgTransfer): JsonSafe<MsgTransfer>;
    fromPartial(object: Partial<MsgTransfer>): MsgTransfer;
    fromProtoMsg(message: MsgTransferProtoMsg): MsgTransfer;
    toProto(message: MsgTransfer): Uint8Array;
    toProtoMsg(message: MsgTransfer): MsgTransferProtoMsg;
};
export declare const MsgTransferResponse: {
    typeUrl: string;
    encode(message: MsgTransferResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgTransferResponse;
    fromJSON(object: any): MsgTransferResponse;
    toJSON(message: MsgTransferResponse): JsonSafe<MsgTransferResponse>;
    fromPartial(object: Partial<MsgTransferResponse>): MsgTransferResponse;
    fromProtoMsg(message: MsgTransferResponseProtoMsg): MsgTransferResponse;
    toProto(message: MsgTransferResponse): Uint8Array;
    toProtoMsg(message: MsgTransferResponse): MsgTransferResponseProtoMsg;
};
