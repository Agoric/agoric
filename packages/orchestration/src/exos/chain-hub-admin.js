/* we expect promises to resolved promptly,  */
/* eslint-disable no-restricted-syntax */
import { heapVowE } from '@agoric/vow/vat.js';
import { M } from '@endo/patterns';
import { CosmosChainInfoShape, DenomDetailShape } from '../typeGuards.js';

/**
 * @import {Zone} from '@agoric/zone';
 * @import {CosmosChainInfo, Denom, IBCConnectionInfo} from '@agoric/orchestration';
 * @import {ChainHub, DenomDetail} from './chain-hub.js';
 */

/**
 * For use with async-flow contracts: can be used as a creator facet that allows
 * developers to add new chain configurations to a local chainHub, in the event
 * the information is not available widely in `agoricNames`.
 *
 * @example
 *
 * ```js
 * const chainHubAdmin = prepareChainHubAdmin(zone, chainHub);
 * chainHubAdmin.initChain(
 *   'hotNewChain',
 *   hotNewChainInfo,
 *   agoricTohotNewChainConnectionInfo,
 * );
 * ```
 *
 * @param {Zone} zone
 * @param {ChainHub} chainHub
 */
export const prepareChainHubAdmin = (zone, chainHub) => {
  const ConnectionInfoShape = M.record(); // TODO
  const makeCreatorFacet = zone.exo(
    'ChainHub Admin',
    M.interface('ChainHub Admin', {
      registerChain: M.callWhen(M.string(), CosmosChainInfoShape)
        .optional(ConnectionInfoShape)
        .returns(M.undefined()),
      registerAsset: M.call(M.string(), DenomDetailShape).returns(M.promise()),
    }),
    {
      /**
       * Register information for a chain
       *
       * @param {string} chainName - must not exist in chainHub
       * @param {CosmosChainInfo} chainInfo
       * @param {IBCConnectionInfo} [connectionInfo] - from Agoric chain
       */
      async registerChain(chainName, chainInfo, connectionInfo) {
        // when() because chainHub methods return vows. If this were inside
        // orchestrate() the membrane would wrap/unwrap automatically.
        const agoricChainInfo = await heapVowE.when(
          chainHub.getChainInfo('agoric'),
        );
        chainHub.registerChain(chainName, chainInfo);
        if (!connectionInfo) {
          console.log('no connection info for', chainName, 'assuming CCTP');
          return;
        }
        chainHub.registerConnection(
          agoricChainInfo.chainId,
          chainInfo.chainId,
          connectionInfo,
        );
      },
      /**
       * Register an asset that may be held on a chain other than the issuing
       * chain.
       *
       * @param {Denom} denom - on the holding chain, whose name is given in
       *   `detail.chainName`
       * @param {DenomDetail} detail - chainName and baseName must be registered
       */
      async registerAsset(denom, detail) {
        // XXX async work necessary before the synchronous call
        await heapVowE.when(chainHub.getChainInfo('agoric'));
        chainHub.registerAsset(denom, detail);
      },
    },
  );
  return makeCreatorFacet;
};

/** @typedef {ReturnType<prepareChainHubAdmin>} ChainHubAdmin */
