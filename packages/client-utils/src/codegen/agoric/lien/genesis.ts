//@ts-nocheck
import { Lien, type LienSDKType } from './lien.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/** The initial or exported state. */
export interface GenesisState {
  liens: AccountLien[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/agoric.lien.GenesisState';
  value: Uint8Array;
}
/** The initial or exported state. */
export interface GenesisStateSDKType {
  liens: AccountLienSDKType[];
}
/** The lien on a particular account */
export interface AccountLien {
  /** Account address, bech32-encoded. */
  address: string;
  /** The liened amount. Should be nonzero. */
  lien?: Lien;
}
export interface AccountLienProtoMsg {
  typeUrl: '/agoric.lien.AccountLien';
  value: Uint8Array;
}
/** The lien on a particular account */
export interface AccountLienSDKType {
  address: string;
  lien?: LienSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    liens: [],
  };
}
export const GenesisState = {
  typeUrl: '/agoric.lien.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.liens) {
      AccountLien.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liens.push(AccountLien.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GenesisState {
    return {
      liens: Array.isArray(object?.liens)
        ? object.liens.map((e: any) => AccountLien.fromJSON(e))
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    if (message.liens) {
      obj.liens = message.liens.map(e =>
        e ? AccountLien.toJSON(e) : undefined,
      );
    } else {
      obj.liens = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.liens = object.liens?.map(e => AccountLien.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: '/agoric.lien.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseAccountLien(): AccountLien {
  return {
    address: '',
    lien: undefined,
  };
}
export const AccountLien = {
  typeUrl: '/agoric.lien.AccountLien',
  encode(
    message: AccountLien,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.lien !== undefined) {
      Lien.encode(message.lien, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): AccountLien {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccountLien();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.lien = Lien.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): AccountLien {
    return {
      address: isSet(object.address) ? String(object.address) : '',
      lien: isSet(object.lien) ? Lien.fromJSON(object.lien) : undefined,
    };
  },
  toJSON(message: AccountLien): JsonSafe<AccountLien> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.lien !== undefined &&
      (obj.lien = message.lien ? Lien.toJSON(message.lien) : undefined);
    return obj;
  },
  fromPartial(object: Partial<AccountLien>): AccountLien {
    const message = createBaseAccountLien();
    message.address = object.address ?? '';
    message.lien =
      object.lien !== undefined && object.lien !== null
        ? Lien.fromPartial(object.lien)
        : undefined;
    return message;
  },
  fromProtoMsg(message: AccountLienProtoMsg): AccountLien {
    return AccountLien.decode(message.value);
  },
  toProto(message: AccountLien): Uint8Array {
    return AccountLien.encode(message).finish();
  },
  toProtoMsg(message: AccountLien): AccountLienProtoMsg {
    return {
      typeUrl: '/agoric.lien.AccountLien',
      value: AccountLien.encode(message).finish(),
    };
  },
};
