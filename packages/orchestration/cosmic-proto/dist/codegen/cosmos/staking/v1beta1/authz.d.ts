import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * AuthorizationType defines the type of staking module authorization type
 *
 * Since: cosmos-sdk 0.43
 */
export declare enum AuthorizationType {
    /** AUTHORIZATION_TYPE_UNSPECIFIED - AUTHORIZATION_TYPE_UNSPECIFIED specifies an unknown authorization type */
    AUTHORIZATION_TYPE_UNSPECIFIED = 0,
    /** AUTHORIZATION_TYPE_DELEGATE - AUTHORIZATION_TYPE_DELEGATE defines an authorization type for Msg/Delegate */
    AUTHORIZATION_TYPE_DELEGATE = 1,
    /** AUTHORIZATION_TYPE_UNDELEGATE - AUTHORIZATION_TYPE_UNDELEGATE defines an authorization type for Msg/Undelegate */
    AUTHORIZATION_TYPE_UNDELEGATE = 2,
    /** AUTHORIZATION_TYPE_REDELEGATE - AUTHORIZATION_TYPE_REDELEGATE defines an authorization type for Msg/BeginRedelegate */
    AUTHORIZATION_TYPE_REDELEGATE = 3,
    UNRECOGNIZED = -1
}
export declare const AuthorizationTypeSDKType: typeof AuthorizationType;
export declare function authorizationTypeFromJSON(object: any): AuthorizationType;
export declare function authorizationTypeToJSON(object: AuthorizationType): string;
/**
 * StakeAuthorization defines authorization for delegate/undelegate/redelegate.
 *
 * Since: cosmos-sdk 0.43
 */
export interface StakeAuthorization {
    $typeUrl?: '/cosmos.staking.v1beta1.StakeAuthorization';
    /**
     * max_tokens specifies the maximum amount of tokens can be delegate to a validator. If it is
     * empty, there is no spend limit and any amount of coins can be delegated.
     */
    maxTokens?: Coin;
    /**
     * allow_list specifies list of validator addresses to whom grantee can delegate tokens on behalf of granter's
     * account.
     */
    allowList?: StakeAuthorization_Validators;
    /** deny_list specifies list of validator addresses to whom grantee can not delegate tokens. */
    denyList?: StakeAuthorization_Validators;
    /** authorization_type defines one of AuthorizationType. */
    authorizationType: AuthorizationType;
}
export interface StakeAuthorizationProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization';
    value: Uint8Array;
}
/**
 * StakeAuthorization defines authorization for delegate/undelegate/redelegate.
 *
 * Since: cosmos-sdk 0.43
 */
export interface StakeAuthorizationSDKType {
    $typeUrl?: '/cosmos.staking.v1beta1.StakeAuthorization';
    max_tokens?: CoinSDKType;
    allow_list?: StakeAuthorization_ValidatorsSDKType;
    deny_list?: StakeAuthorization_ValidatorsSDKType;
    authorization_type: AuthorizationType;
}
/** Validators defines list of validator addresses. */
export interface StakeAuthorization_Validators {
    address: string[];
}
export interface StakeAuthorization_ValidatorsProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Validators';
    value: Uint8Array;
}
/** Validators defines list of validator addresses. */
export interface StakeAuthorization_ValidatorsSDKType {
    address: string[];
}
export declare const StakeAuthorization: {
    typeUrl: string;
    encode(message: StakeAuthorization, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): StakeAuthorization;
    fromJSON(object: any): StakeAuthorization;
    toJSON(message: StakeAuthorization): JsonSafe<StakeAuthorization>;
    fromPartial(object: Partial<StakeAuthorization>): StakeAuthorization;
    fromProtoMsg(message: StakeAuthorizationProtoMsg): StakeAuthorization;
    toProto(message: StakeAuthorization): Uint8Array;
    toProtoMsg(message: StakeAuthorization): StakeAuthorizationProtoMsg;
};
export declare const StakeAuthorization_Validators: {
    typeUrl: string;
    encode(message: StakeAuthorization_Validators, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): StakeAuthorization_Validators;
    fromJSON(object: any): StakeAuthorization_Validators;
    toJSON(message: StakeAuthorization_Validators): JsonSafe<StakeAuthorization_Validators>;
    fromPartial(object: Partial<StakeAuthorization_Validators>): StakeAuthorization_Validators;
    fromProtoMsg(message: StakeAuthorization_ValidatorsProtoMsg): StakeAuthorization_Validators;
    toProto(message: StakeAuthorization_Validators): Uint8Array;
    toProtoMsg(message: StakeAuthorization_Validators): StakeAuthorization_ValidatorsProtoMsg;
};
