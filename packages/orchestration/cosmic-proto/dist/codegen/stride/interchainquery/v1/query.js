//@ts-nocheck
import { Query } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import {} from '../../../json-safe.js';
function createBaseQueryPendingQueriesRequest() {
    return {};
}
export const QueryPendingQueriesRequest = {
    typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryPendingQueriesRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseQueryPendingQueriesRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryPendingQueriesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryPendingQueriesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest',
            value: QueryPendingQueriesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryPendingQueriesResponse() {
    return {
        pendingQueries: [],
    };
}
export const QueryPendingQueriesResponse = {
    typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.pendingQueries) {
            Query.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryPendingQueriesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pendingQueries.push(Query.decode(reader, reader.uint32()));
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
            pendingQueries: Array.isArray(object?.pendingQueries)
                ? object.pendingQueries.map((e) => Query.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.pendingQueries) {
            obj.pendingQueries = message.pendingQueries.map(e => e ? Query.toJSON(e) : undefined);
        }
        else {
            obj.pendingQueries = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryPendingQueriesResponse();
        message.pendingQueries =
            object.pendingQueries?.map(e => Query.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryPendingQueriesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryPendingQueriesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesResponse',
            value: QueryPendingQueriesResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map