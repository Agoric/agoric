import { RequestQuery } from './codegen/tendermint/abci/types.js';
import type { Bech32PrefixRequest, Bech32PrefixResponse } from './codegen/cosmos/auth/v1beta1/query.js';
import type { QueryAllBalancesRequest, QueryAllBalancesResponse, QueryBalanceRequest, QueryBalanceRequestProtoMsg, QueryBalanceResponse } from './codegen/cosmos/bank/v1beta1/query.js';
import type { MsgSend, MsgSendResponse } from './codegen/cosmos/bank/v1beta1/tx.js';
import type { MsgDelegate, MsgDelegateResponse, MsgUndelegate, MsgUndelegateResponse } from './codegen/cosmos/staking/v1beta1/tx.js';
import type { Any } from './codegen/google/protobuf/any.js';
import type { MsgTransfer, MsgTransferResponse } from './codegen/ibc/applications/transfer/v1/tx.js';
import type { JsonSafe } from './codegen/index.js';
/**
 * The result of Any.toJSON(). Exported at top level as a convenience
 * for a very common import.
 */
export type AnyJson = JsonSafe<Any>;
export type Proto3Shape = {
    '/cosmos.bank.v1beta1.MsgSend': MsgSend;
    '/cosmos.bank.v1beta1.MsgSendResponse': MsgSendResponse;
    '/cosmos.bank.v1beta1.QueryAllBalancesRequest': QueryAllBalancesRequest;
    '/cosmos.bank.v1beta1.QueryAllBalancesResponse': QueryAllBalancesResponse;
    '/cosmos.bank.v1beta1.QueryBalanceRequest': QueryBalanceRequest;
    '/cosmos.bank.v1beta1.QueryBalanceResponse': QueryBalanceResponse;
    '/cosmos.staking.v1beta1.MsgDelegate': MsgDelegate;
    '/cosmos.staking.v1beta1.MsgDelegateResponse': MsgDelegateResponse;
    '/cosmos.staking.v1beta1.MsgUndelegate': MsgUndelegate;
    '/cosmos.staking.v1beta1.MsgUndelegateResponse': MsgUndelegateResponse;
    '/ibc.applications.transfer.v1.MsgTransfer': MsgTransfer;
    '/ibc.applications.transfer.v1.MsgTransferResponse': MsgTransferResponse;
    '/cosmos.auth.v1beta1.Bech32PrefixRequest': Bech32PrefixRequest;
    '/cosmos.auth.v1beta1.Bech32PrefixResponse': Bech32PrefixResponse;
};
/**
 * The encoding introduced in Protobuf 3 for Any that can be serialized to JSON.
 *
 * Technically JSON is a string, a notation encoding a JSON object. So this is
 * more accurately "JSON-ifiable" but we don't expect anyone to confuse this
 * type with a string.
 */
export type TypedJson<T extends unknown | keyof Proto3Shape = unknown> = T extends keyof Proto3Shape ? Proto3Shape[T] & {
    '@type': T;
} : {
    '@type': string;
};
/** General pattern for Request that has a corresponding Response */
type RequestTypeUrl<Base extends string> = `/${Base}Request`;
/** Pattern specific to Msg sends, in which "Msg" without "Response" implies it's a request */
type TxMessageTypeUrl<Package extends string, Name extends Capitalize<string>> = `/${Package}.Msg${Name}`;
export type ResponseTo<T extends TypedJson> = T['@type'] extends RequestTypeUrl<infer Base> ? TypedJson<`/${Base}Response`> : T['@type'] extends TxMessageTypeUrl<infer Package, infer Name> ? TypedJson<`/${Package}.Msg${Name}Response`> : TypedJson;
export declare const typedJson: <T extends keyof Proto3Shape>(typeStr: T, obj: Proto3Shape[T]) => TypedJson<T>;
export declare const typeUrlToGrpcPath: (typeUrl: Any["typeUrl"]) => string;
type RequestQueryOpts = Partial<Omit<RequestQuery, 'path' | 'data'>>;
export declare const toRequestQueryJson: (msg: Any | QueryBalanceRequestProtoMsg, opts?: RequestQueryOpts) => {
    data: string;
    path: string;
    height: string;
    prove: boolean;
};
export {};
