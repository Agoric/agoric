import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import type { Any } from './codegen/google/protobuf/any.js';
import { agoricProtoRegistry } from './codegen/index.js';
import type { TypedJson } from './helpers.js';

export * from './codegen/index.js';

export * from './helpers.js';

/**
 *
 * @returns the registry that getSigningAgoricClientOptions() returns but without aminoTypes
 */
export const makeAgoricRegistry = () => {
  return new Registry([...defaultRegistryTypes, ...agoricProtoRegistry]);
};

/**
 * @see {@link https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/any.proto}
 * @param [registry]
 */
export const makeProtoConverter = (
  registry: Registry = makeAgoricRegistry(),
) => {
  const convertToJson = (protoAny: Any): TypedJson<any> => {
    const fields = registry.decode(protoAny);
    return { '@type': protoAny.typeUrl, ...fields };
  };
  return convertToJson;
};
