//@ts-nocheck
import { BaseAccount, } from '../../../../cosmos/auth/v1beta1/auth.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseInterchainAccount() {
    return {
        $typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccount',
        baseAccount: undefined,
        accountOwner: '',
    };
}
export const InterchainAccount = {
    typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseAccount !== undefined) {
            BaseAccount.encode(message.baseAccount, writer.uint32(10).fork()).ldelim();
        }
        if (message.accountOwner !== '') {
            writer.uint32(18).string(message.accountOwner);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterchainAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseAccount = BaseAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.accountOwner = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            baseAccount: isSet(object.baseAccount)
                ? BaseAccount.fromJSON(object.baseAccount)
                : undefined,
            accountOwner: isSet(object.accountOwner)
                ? String(object.accountOwner)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseAccount !== undefined &&
            (obj.baseAccount = message.baseAccount
                ? BaseAccount.toJSON(message.baseAccount)
                : undefined);
        message.accountOwner !== undefined &&
            (obj.accountOwner = message.accountOwner);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterchainAccount();
        message.baseAccount =
            object.baseAccount !== undefined && object.baseAccount !== null
                ? BaseAccount.fromPartial(object.baseAccount)
                : undefined;
        message.accountOwner = object.accountOwner ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return InterchainAccount.decode(message.value);
    },
    toProto(message) {
        return InterchainAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccount',
            value: InterchainAccount.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=account.js.map