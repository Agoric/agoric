import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { SignMode } from '../signing/v1beta1/signing.js';
import { CompactBitArray, type CompactBitArraySDKType } from '../../crypto/multisig/v1beta1/multisig.js';
import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** Tx is the standard type used for broadcasting transactions. */
export interface Tx {
    /** body is the processable content of the transaction */
    body?: TxBody;
    /**
     * auth_info is the authorization related content of the transaction,
     * specifically signers, signer modes and fee
     */
    authInfo?: AuthInfo;
    /**
     * signatures is a list of signatures that matches the length and order of
     * AuthInfo's signer_infos to allow connecting signature meta information like
     * public key and signing mode by position.
     */
    signatures: Uint8Array[];
}
export interface TxProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.Tx';
    value: Uint8Array;
}
/** Tx is the standard type used for broadcasting transactions. */
export interface TxSDKType {
    body?: TxBodySDKType;
    auth_info?: AuthInfoSDKType;
    signatures: Uint8Array[];
}
/**
 * TxRaw is a variant of Tx that pins the signer's exact binary representation
 * of body and auth_info. This is used for signing, broadcasting and
 * verification. The binary `serialize(tx: TxRaw)` is stored in Tendermint and
 * the hash `sha256(serialize(tx: TxRaw))` becomes the "txhash", commonly used
 * as the transaction ID.
 */
export interface TxRaw {
    /**
     * body_bytes is a protobuf serialization of a TxBody that matches the
     * representation in SignDoc.
     */
    bodyBytes: Uint8Array;
    /**
     * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
     * representation in SignDoc.
     */
    authInfoBytes: Uint8Array;
    /**
     * signatures is a list of signatures that matches the length and order of
     * AuthInfo's signer_infos to allow connecting signature meta information like
     * public key and signing mode by position.
     */
    signatures: Uint8Array[];
}
export interface TxRawProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.TxRaw';
    value: Uint8Array;
}
/**
 * TxRaw is a variant of Tx that pins the signer's exact binary representation
 * of body and auth_info. This is used for signing, broadcasting and
 * verification. The binary `serialize(tx: TxRaw)` is stored in Tendermint and
 * the hash `sha256(serialize(tx: TxRaw))` becomes the "txhash", commonly used
 * as the transaction ID.
 */
export interface TxRawSDKType {
    body_bytes: Uint8Array;
    auth_info_bytes: Uint8Array;
    signatures: Uint8Array[];
}
/** SignDoc is the type used for generating sign bytes for SIGN_MODE_DIRECT. */
export interface SignDoc {
    /**
     * body_bytes is protobuf serialization of a TxBody that matches the
     * representation in TxRaw.
     */
    bodyBytes: Uint8Array;
    /**
     * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
     * representation in TxRaw.
     */
    authInfoBytes: Uint8Array;
    /**
     * chain_id is the unique identifier of the chain this transaction targets.
     * It prevents signed transactions from being used on another chain by an
     * attacker
     */
    chainId: string;
    /** account_number is the account number of the account in state */
    accountNumber: bigint;
}
export interface SignDocProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.SignDoc';
    value: Uint8Array;
}
/** SignDoc is the type used for generating sign bytes for SIGN_MODE_DIRECT. */
export interface SignDocSDKType {
    body_bytes: Uint8Array;
    auth_info_bytes: Uint8Array;
    chain_id: string;
    account_number: bigint;
}
/**
 * SignDocDirectAux is the type used for generating sign bytes for
 * SIGN_MODE_DIRECT_AUX.
 *
 * Since: cosmos-sdk 0.46
 */
export interface SignDocDirectAux {
    /**
     * body_bytes is protobuf serialization of a TxBody that matches the
     * representation in TxRaw.
     */
    bodyBytes: Uint8Array;
    /** public_key is the public key of the signing account. */
    publicKey?: Any;
    /**
     * chain_id is the identifier of the chain this transaction targets.
     * It prevents signed transactions from being used on another chain by an
     * attacker.
     */
    chainId: string;
    /** account_number is the account number of the account in state. */
    accountNumber: bigint;
    /** sequence is the sequence number of the signing account. */
    sequence: bigint;
    /**
     * Tip is the optional tip used for transactions fees paid in another denom.
     * It should be left empty if the signer is not the tipper for this
     * transaction.
     *
     * This field is ignored if the chain didn't enable tips, i.e. didn't add the
     * `TipDecorator` in its posthandler.
     */
    tip?: Tip;
}
export interface SignDocDirectAuxProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.SignDocDirectAux';
    value: Uint8Array;
}
/**
 * SignDocDirectAux is the type used for generating sign bytes for
 * SIGN_MODE_DIRECT_AUX.
 *
 * Since: cosmos-sdk 0.46
 */
export interface SignDocDirectAuxSDKType {
    body_bytes: Uint8Array;
    public_key?: AnySDKType;
    chain_id: string;
    account_number: bigint;
    sequence: bigint;
    tip?: TipSDKType;
}
/** TxBody is the body of a transaction that all signers sign over. */
export interface TxBody {
    /**
     * messages is a list of messages to be executed. The required signers of
     * those messages define the number and order of elements in AuthInfo's
     * signer_infos and Tx's signatures. Each required signer address is added to
     * the list only the first time it occurs.
     * By convention, the first required signer (usually from the first message)
     * is referred to as the primary signer and pays the fee for the whole
     * transaction.
     */
    messages: Any[];
    /**
     * memo is any arbitrary note/comment to be added to the transaction.
     * WARNING: in clients, any publicly exposed text should not be called memo,
     * but should be called `note` instead (see https://github.com/cosmos/cosmos-sdk/issues/9122).
     */
    memo: string;
    /**
     * timeout is the block height after which this transaction will not
     * be processed by the chain
     */
    timeoutHeight: bigint;
    /**
     * extension_options are arbitrary options that can be added by chains
     * when the default options are not sufficient. If any of these are present
     * and can't be handled, the transaction will be rejected
     */
    extensionOptions: Any[];
    /**
     * extension_options are arbitrary options that can be added by chains
     * when the default options are not sufficient. If any of these are present
     * and can't be handled, they will be ignored
     */
    nonCriticalExtensionOptions: Any[];
}
export interface TxBodyProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.TxBody';
    value: Uint8Array;
}
/** TxBody is the body of a transaction that all signers sign over. */
export interface TxBodySDKType {
    messages: AnySDKType[];
    memo: string;
    timeout_height: bigint;
    extension_options: AnySDKType[];
    non_critical_extension_options: AnySDKType[];
}
/**
 * AuthInfo describes the fee and signer modes that are used to sign a
 * transaction.
 */
export interface AuthInfo {
    /**
     * signer_infos defines the signing modes for the required signers. The number
     * and order of elements must match the required signers from TxBody's
     * messages. The first element is the primary signer and the one which pays
     * the fee.
     */
    signerInfos: SignerInfo[];
    /**
     * Fee is the fee and gas limit for the transaction. The first signer is the
     * primary signer and the one which pays the fee. The fee can be calculated
     * based on the cost of evaluating the body and doing signature verification
     * of the signers. This can be estimated via simulation.
     */
    fee?: Fee;
    /**
     * Tip is the optional tip used for transactions fees paid in another denom.
     *
     * This field is ignored if the chain didn't enable tips, i.e. didn't add the
     * `TipDecorator` in its posthandler.
     *
     * Since: cosmos-sdk 0.46
     */
    tip?: Tip;
}
export interface AuthInfoProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.AuthInfo';
    value: Uint8Array;
}
/**
 * AuthInfo describes the fee and signer modes that are used to sign a
 * transaction.
 */
export interface AuthInfoSDKType {
    signer_infos: SignerInfoSDKType[];
    fee?: FeeSDKType;
    tip?: TipSDKType;
}
/**
 * SignerInfo describes the public key and signing mode of a single top-level
 * signer.
 */
export interface SignerInfo {
    /**
     * public_key is the public key of the signer. It is optional for accounts
     * that already exist in state. If unset, the verifier can use the required \
     * signer address for this position and lookup the public key.
     */
    publicKey?: Any;
    /**
     * mode_info describes the signing mode of the signer and is a nested
     * structure to support nested multisig pubkey's
     */
    modeInfo?: ModeInfo;
    /**
     * sequence is the sequence of the account, which describes the
     * number of committed transactions signed by a given address. It is used to
     * prevent replay attacks.
     */
    sequence: bigint;
}
export interface SignerInfoProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.SignerInfo';
    value: Uint8Array;
}
/**
 * SignerInfo describes the public key and signing mode of a single top-level
 * signer.
 */
export interface SignerInfoSDKType {
    public_key?: AnySDKType;
    mode_info?: ModeInfoSDKType;
    sequence: bigint;
}
/** ModeInfo describes the signing mode of a single or nested multisig signer. */
export interface ModeInfo {
    /** single represents a single signer */
    single?: ModeInfo_Single;
    /** multi represents a nested multisig signer */
    multi?: ModeInfo_Multi;
}
export interface ModeInfoProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.ModeInfo';
    value: Uint8Array;
}
/** ModeInfo describes the signing mode of a single or nested multisig signer. */
export interface ModeInfoSDKType {
    single?: ModeInfo_SingleSDKType;
    multi?: ModeInfo_MultiSDKType;
}
/**
 * Single is the mode info for a single signer. It is structured as a message
 * to allow for additional fields such as locale for SIGN_MODE_TEXTUAL in the
 * future
 */
export interface ModeInfo_Single {
    /** mode is the signing mode of the single signer */
    mode: SignMode;
}
export interface ModeInfo_SingleProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.Single';
    value: Uint8Array;
}
/**
 * Single is the mode info for a single signer. It is structured as a message
 * to allow for additional fields such as locale for SIGN_MODE_TEXTUAL in the
 * future
 */
export interface ModeInfo_SingleSDKType {
    mode: SignMode;
}
/** Multi is the mode info for a multisig public key */
export interface ModeInfo_Multi {
    /** bitarray specifies which keys within the multisig are signing */
    bitarray?: CompactBitArray;
    /**
     * mode_infos is the corresponding modes of the signers of the multisig
     * which could include nested multisig public keys
     */
    modeInfos: ModeInfo[];
}
export interface ModeInfo_MultiProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.Multi';
    value: Uint8Array;
}
/** Multi is the mode info for a multisig public key */
export interface ModeInfo_MultiSDKType {
    bitarray?: CompactBitArraySDKType;
    mode_infos: ModeInfoSDKType[];
}
/**
 * Fee includes the amount of coins paid in fees and the maximum
 * gas to be used by the transaction. The ratio yields an effective "gasprice",
 * which must be above some miminum to be accepted into the mempool.
 */
export interface Fee {
    /** amount is the amount of coins to be paid as a fee */
    amount: Coin[];
    /**
     * gas_limit is the maximum gas that can be used in transaction processing
     * before an out of gas error occurs
     */
    gasLimit: bigint;
    /**
     * if unset, the first signer is responsible for paying the fees. If set, the specified account must pay the fees.
     * the payer must be a tx signer (and thus have signed this field in AuthInfo).
     * setting this field does *not* change the ordering of required signers for the transaction.
     */
    payer: string;
    /**
     * if set, the fee payer (either the first signer or the value of the payer field) requests that a fee grant be used
     * to pay fees instead of the fee payer's own balance. If an appropriate fee grant does not exist or the chain does
     * not support fee grants, this will fail
     */
    granter: string;
}
export interface FeeProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.Fee';
    value: Uint8Array;
}
/**
 * Fee includes the amount of coins paid in fees and the maximum
 * gas to be used by the transaction. The ratio yields an effective "gasprice",
 * which must be above some miminum to be accepted into the mempool.
 */
export interface FeeSDKType {
    amount: CoinSDKType[];
    gas_limit: bigint;
    payer: string;
    granter: string;
}
/**
 * Tip is the tip used for meta-transactions.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Tip {
    /** amount is the amount of the tip */
    amount: Coin[];
    /** tipper is the address of the account paying for the tip */
    tipper: string;
}
export interface TipProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.Tip';
    value: Uint8Array;
}
/**
 * Tip is the tip used for meta-transactions.
 *
 * Since: cosmos-sdk 0.46
 */
export interface TipSDKType {
    amount: CoinSDKType[];
    tipper: string;
}
/**
 * AuxSignerData is the intermediary format that an auxiliary signer (e.g. a
 * tipper) builds and sends to the fee payer (who will build and broadcast the
 * actual tx). AuxSignerData is not a valid tx in itself, and will be rejected
 * by the node if sent directly as-is.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AuxSignerData {
    /**
     * address is the bech32-encoded address of the auxiliary signer. If using
     * AuxSignerData across different chains, the bech32 prefix of the target
     * chain (where the final transaction is broadcasted) should be used.
     */
    address: string;
    /**
     * sign_doc is the SIGN_MODE_DIRECT_AUX sign doc that the auxiliary signer
     * signs. Note: we use the same sign doc even if we're signing with
     * LEGACY_AMINO_JSON.
     */
    signDoc?: SignDocDirectAux;
    /** mode is the signing mode of the single signer. */
    mode: SignMode;
    /** sig is the signature of the sign doc. */
    sig: Uint8Array;
}
export interface AuxSignerDataProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.AuxSignerData';
    value: Uint8Array;
}
/**
 * AuxSignerData is the intermediary format that an auxiliary signer (e.g. a
 * tipper) builds and sends to the fee payer (who will build and broadcast the
 * actual tx). AuxSignerData is not a valid tx in itself, and will be rejected
 * by the node if sent directly as-is.
 *
 * Since: cosmos-sdk 0.46
 */
export interface AuxSignerDataSDKType {
    address: string;
    sign_doc?: SignDocDirectAuxSDKType;
    mode: SignMode;
    sig: Uint8Array;
}
export declare const Tx: {
    typeUrl: string;
    encode(message: Tx, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Tx;
    fromJSON(object: any): Tx;
    toJSON(message: Tx): JsonSafe<Tx>;
    fromPartial(object: Partial<Tx>): Tx;
    fromProtoMsg(message: TxProtoMsg): Tx;
    toProto(message: Tx): Uint8Array;
    toProtoMsg(message: Tx): TxProtoMsg;
};
export declare const TxRaw: {
    typeUrl: string;
    encode(message: TxRaw, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TxRaw;
    fromJSON(object: any): TxRaw;
    toJSON(message: TxRaw): JsonSafe<TxRaw>;
    fromPartial(object: Partial<TxRaw>): TxRaw;
    fromProtoMsg(message: TxRawProtoMsg): TxRaw;
    toProto(message: TxRaw): Uint8Array;
    toProtoMsg(message: TxRaw): TxRawProtoMsg;
};
export declare const SignDoc: {
    typeUrl: string;
    encode(message: SignDoc, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SignDoc;
    fromJSON(object: any): SignDoc;
    toJSON(message: SignDoc): JsonSafe<SignDoc>;
    fromPartial(object: Partial<SignDoc>): SignDoc;
    fromProtoMsg(message: SignDocProtoMsg): SignDoc;
    toProto(message: SignDoc): Uint8Array;
    toProtoMsg(message: SignDoc): SignDocProtoMsg;
};
export declare const SignDocDirectAux: {
    typeUrl: string;
    encode(message: SignDocDirectAux, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SignDocDirectAux;
    fromJSON(object: any): SignDocDirectAux;
    toJSON(message: SignDocDirectAux): JsonSafe<SignDocDirectAux>;
    fromPartial(object: Partial<SignDocDirectAux>): SignDocDirectAux;
    fromProtoMsg(message: SignDocDirectAuxProtoMsg): SignDocDirectAux;
    toProto(message: SignDocDirectAux): Uint8Array;
    toProtoMsg(message: SignDocDirectAux): SignDocDirectAuxProtoMsg;
};
export declare const TxBody: {
    typeUrl: string;
    encode(message: TxBody, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TxBody;
    fromJSON(object: any): TxBody;
    toJSON(message: TxBody): JsonSafe<TxBody>;
    fromPartial(object: Partial<TxBody>): TxBody;
    fromProtoMsg(message: TxBodyProtoMsg): TxBody;
    toProto(message: TxBody): Uint8Array;
    toProtoMsg(message: TxBody): TxBodyProtoMsg;
};
export declare const AuthInfo: {
    typeUrl: string;
    encode(message: AuthInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AuthInfo;
    fromJSON(object: any): AuthInfo;
    toJSON(message: AuthInfo): JsonSafe<AuthInfo>;
    fromPartial(object: Partial<AuthInfo>): AuthInfo;
    fromProtoMsg(message: AuthInfoProtoMsg): AuthInfo;
    toProto(message: AuthInfo): Uint8Array;
    toProtoMsg(message: AuthInfo): AuthInfoProtoMsg;
};
export declare const SignerInfo: {
    typeUrl: string;
    encode(message: SignerInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SignerInfo;
    fromJSON(object: any): SignerInfo;
    toJSON(message: SignerInfo): JsonSafe<SignerInfo>;
    fromPartial(object: Partial<SignerInfo>): SignerInfo;
    fromProtoMsg(message: SignerInfoProtoMsg): SignerInfo;
    toProto(message: SignerInfo): Uint8Array;
    toProtoMsg(message: SignerInfo): SignerInfoProtoMsg;
};
export declare const ModeInfo: {
    typeUrl: string;
    encode(message: ModeInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ModeInfo;
    fromJSON(object: any): ModeInfo;
    toJSON(message: ModeInfo): JsonSafe<ModeInfo>;
    fromPartial(object: Partial<ModeInfo>): ModeInfo;
    fromProtoMsg(message: ModeInfoProtoMsg): ModeInfo;
    toProto(message: ModeInfo): Uint8Array;
    toProtoMsg(message: ModeInfo): ModeInfoProtoMsg;
};
export declare const ModeInfo_Single: {
    typeUrl: string;
    encode(message: ModeInfo_Single, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ModeInfo_Single;
    fromJSON(object: any): ModeInfo_Single;
    toJSON(message: ModeInfo_Single): JsonSafe<ModeInfo_Single>;
    fromPartial(object: Partial<ModeInfo_Single>): ModeInfo_Single;
    fromProtoMsg(message: ModeInfo_SingleProtoMsg): ModeInfo_Single;
    toProto(message: ModeInfo_Single): Uint8Array;
    toProtoMsg(message: ModeInfo_Single): ModeInfo_SingleProtoMsg;
};
export declare const ModeInfo_Multi: {
    typeUrl: string;
    encode(message: ModeInfo_Multi, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ModeInfo_Multi;
    fromJSON(object: any): ModeInfo_Multi;
    toJSON(message: ModeInfo_Multi): JsonSafe<ModeInfo_Multi>;
    fromPartial(object: Partial<ModeInfo_Multi>): ModeInfo_Multi;
    fromProtoMsg(message: ModeInfo_MultiProtoMsg): ModeInfo_Multi;
    toProto(message: ModeInfo_Multi): Uint8Array;
    toProtoMsg(message: ModeInfo_Multi): ModeInfo_MultiProtoMsg;
};
export declare const Fee: {
    typeUrl: string;
    encode(message: Fee, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Fee;
    fromJSON(object: any): Fee;
    toJSON(message: Fee): JsonSafe<Fee>;
    fromPartial(object: Partial<Fee>): Fee;
    fromProtoMsg(message: FeeProtoMsg): Fee;
    toProto(message: Fee): Uint8Array;
    toProtoMsg(message: Fee): FeeProtoMsg;
};
export declare const Tip: {
    typeUrl: string;
    encode(message: Tip, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Tip;
    fromJSON(object: any): Tip;
    toJSON(message: Tip): JsonSafe<Tip>;
    fromPartial(object: Partial<Tip>): Tip;
    fromProtoMsg(message: TipProtoMsg): Tip;
    toProto(message: Tip): Uint8Array;
    toProtoMsg(message: Tip): TipProtoMsg;
};
export declare const AuxSignerData: {
    typeUrl: string;
    encode(message: AuxSignerData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AuxSignerData;
    fromJSON(object: any): AuxSignerData;
    toJSON(message: AuxSignerData): JsonSafe<AuxSignerData>;
    fromPartial(object: Partial<AuxSignerData>): AuxSignerData;
    fromProtoMsg(message: AuxSignerDataProtoMsg): AuxSignerData;
    toProto(message: AuxSignerData): Uint8Array;
    toProtoMsg(message: AuxSignerData): AuxSignerDataProtoMsg;
};
