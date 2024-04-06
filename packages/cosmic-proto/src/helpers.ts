import type { QueryAllBalancesRequest } from './codegen/cosmos/bank/v1beta1/query.js';
import type { MsgSend } from './codegen/cosmos/bank/v1beta1/tx.js';
import type { MsgDelegate } from './codegen/cosmos/staking/v1beta1/tx.js';

// TODO codegen this by modifying Telescope
export type Proto3Shape = {
  '/cosmos.bank.v1beta1.MsgSend': MsgSend;
  '/cosmos.bank.v1beta1.QueryAllBalancesRequest': QueryAllBalancesRequest;
  '/cosmos.staking.v1beta1.MsgDelegate': MsgDelegate;
};

/**
 * The encoding introduced in Protobuf 3 for Any that can be serialized to JSON.
 *
 * Technically JSON is a string, a notation encoding a JSON object. So this is
 * more accurately "JSON-ifiable" but we don't expect anyone to confuse this
 * type with a string.
 */
export type TypedJson<T extends unknown | keyof Proto3Shape = unknown> =
  T extends unknown
    ? { '@type': string }
    : T extends keyof Proto3Shape
      ? Proto3Shape[T] & {
          '@type': T;
        }
      : never;

export const typedJson = <T extends keyof Proto3Shape>(
  typeStr: T,
  obj: Proto3Shape[T],
) => {
  return {
    '@type': typeStr,
    ...obj,
  } as TypedJson<T>;
};
