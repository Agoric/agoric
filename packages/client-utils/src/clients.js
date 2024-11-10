/**
 * @import {MinimalNetworkConfig} from '@agoric/client-utils';
 */

import { agoric } from './codegen/index.js';
import { pickEndpoint } from './rpc.js';

/**
 * @typedef {Awaited<ReturnType<typeof agoric.ClientFactory.createRPCQueryClient>>} AgoricQueryClient
 */

/**
 * @param {MinimalNetworkConfig} config
 * @returns {Promise<AgoricQueryClient>}
 */
export const makeAgoricQueryClient = config =>
  agoric.ClientFactory.createRPCQueryClient({
    rpcEndpoint: pickEndpoint(config),
  });
