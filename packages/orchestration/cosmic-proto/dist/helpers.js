import { RequestQuery } from './codegen/tendermint/abci/types.js';
export const typedJson = (typeStr, obj) => {
    return {
        '@type': typeStr,
        ...obj,
    };
};
const QUERY_REQ_TYPEURL_RE = /^\/(?<serviceName>\w+(?:\.\w+)*)\.Query(?<methodName>\w+)Request$/;
export const typeUrlToGrpcPath = (typeUrl) => {
    const match = typeUrl.match(QUERY_REQ_TYPEURL_RE);
    if (!(match && match.groups)) {
        throw TypeError(`Invalid typeUrl: ${typeUrl}. Must be a Query Request.`);
    }
    const { serviceName, methodName } = match.groups;
    return `/${serviceName}.Query/${methodName}`;
};
export const toRequestQueryJson = (msg, opts = {}) => RequestQuery.toJSON(RequestQuery.fromPartial({
    path: typeUrlToGrpcPath(msg.typeUrl),
    data: msg.value,
    ...opts,
}));
//# sourceMappingURL=helpers.js.map