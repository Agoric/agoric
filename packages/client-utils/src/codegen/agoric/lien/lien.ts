//@ts-nocheck
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Lien contains the lien state of a particular account. */
export interface Lien {
  /** coins holds the amount liened */
  coins: Coin[];
  /**
   * delegated tracks the net amount delegated for non-vesting accounts,
   * or zero coins for vesting accounts.
   * (Vesting accounts have their own fields to track delegation.)
   */
  delegated: Coin[];
}
export interface LienProtoMsg {
  typeUrl: '/agoric.lien.Lien';
  value: Uint8Array;
}
/** Lien contains the lien state of a particular account. */
export interface LienSDKType {
  coins: CoinSDKType[];
  delegated: CoinSDKType[];
}
function createBaseLien(): Lien {
  return {
    coins: [],
    delegated: [],
  };
}
export const Lien = {
  typeUrl: '/agoric.lien.Lien',
  encode(
    message: Lien,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.delegated) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Lien {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLien();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.delegated.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Lien {
    return {
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromJSON(e))
        : [],
      delegated: Array.isArray(object?.delegated)
        ? object.delegated.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(message: Lien): JsonSafe<Lien> {
    const obj: any = {};
    if (message.coins) {
      obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.coins = [];
    }
    if (message.delegated) {
      obj.delegated = message.delegated.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.delegated = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Lien>): Lien {
    const message = createBaseLien();
    message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
    message.delegated = object.delegated?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: LienProtoMsg): Lien {
    return Lien.decode(message.value);
  },
  toProto(message: Lien): Uint8Array {
    return Lien.encode(message).finish();
  },
  toProtoMsg(message: Lien): LienProtoMsg {
    return {
      typeUrl: '/agoric.lien.Lien',
      value: Lien.encode(message).finish(),
    };
  },
};
