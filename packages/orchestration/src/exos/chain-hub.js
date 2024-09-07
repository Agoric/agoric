import { Fail, makeError, q } from '@endo/errors';
import { E } from '@endo/far';
import { M } from '@endo/patterns';
import { BrandShape } from '@agoric/ertp/src/typeGuards.js';

import { VowShape } from '@agoric/vow';
import { makeHeapZone } from '@agoric/zone';
import { CosmosChainInfoShape, IBCConnectionInfoShape } from '../typeGuards.js';

/**
 * @import {NameHub} from '@agoric/vats';
 * @import {Vow, VowTools} from '@agoric/vow';
 * @import {Asset as CosmosAssetInfo} from '@chain-registry/types';
 * @import {CosmosChainInfo, IBCConnectionInfo} from '../cosmos-api.js';
 * @import {ChainInfo, KnownChains} from '../chain-info.js';
 * @import {Denom} from '../orchestration-api.js';
 * @import {Remote} from '@agoric/internal';
 * @import {TypedPattern} from '@agoric/internal';
 */

/**
 * If K matches a known chain, narrow the type from generic ChainInfo
 *
 * @template {string} K
 * @typedef {K extends keyof KnownChains
 *   ? ChainInfo & Omit<KnownChains[K], 'connections'>
 *   : ChainInfo} ActualChainInfo
 */

/**
 * @typedef {object} DenomDetail
 * @property {string} baseName - name of issuing chain; e.g. cosmoshub
 * @property {Denom} baseDenom - e.g. uatom
 * @property {string} chainName - name of holding chain; e.g. agoric
 * @property {Brand<'nat'>} [brand] - vbank brand, if registered
 * @see {ChainHub} `registerAsset` method
 */
/** @type {TypedPattern<DenomDetail>} */
export const DenomDetailShape = M.splitRecord(
  { chainName: M.string(), baseName: M.string(), baseDenom: M.string() },
  { brand: BrandShape },
);

/** agoricNames key for ChainInfo hub */
export const CHAIN_KEY = 'chain';
/** namehub for connection info */
export const CONNECTIONS_KEY = 'chainConnection';
/** namehub for assets info */
export const ASSETS_KEY = 'chainAssets';

/**
 * Character used in a connection tuple key to separate the two chain ids. Valid
 * because a chainId can contain only alphanumerics and dash.
 *
 * Vstorage keys can be only alphanumerics, dash or underscore. That leaves
 * underscore as the only valid separator.
 *
 * @see {@link https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md}
 */
const CHAIN_ID_SEPARATOR = '_';

/**
 * The entries of the top-level namehubs in agoricNames are reflected to
 * vstorage. But only the top level. So we combine the 2 chain ids into 1 key.
 * Connections are directionless, so we sort the ids.
 *
 * @param {string} chainId1
 * @param {string} chainId2
 */
export const connectionKey = (chainId1, chainId2) => {
  if (
    chainId1.includes(CHAIN_ID_SEPARATOR) ||
    chainId2.includes(CHAIN_ID_SEPARATOR)
  ) {
    Fail`invalid chain id ${chainId1} or ${chainId2}`;
  }
  return [chainId1, chainId2].sort().join(CHAIN_ID_SEPARATOR);
};

/**
 * Utility to reverse connection info perspective.
 *
 * @param {IBCConnectionInfo} connInfo
 * @returns {IBCConnectionInfo}
 */
export const reverseConnInfo = connInfo => {
  const { transferChannel } = connInfo;
  return {
    id: connInfo.counterparty.connection_id,
    client_id: connInfo.counterparty.client_id,
    counterparty: {
      client_id: connInfo.client_id,
      connection_id: connInfo.id,
      prefix: {
        key_prefix: 'FIXME',
      },
    },
    state: connInfo.state,
    transferChannel: {
      ...transferChannel,
      channelId: transferChannel.counterPartyChannelId,
      counterPartyChannelId: transferChannel.channelId,
      portId: transferChannel.counterPartyPortId,
      counterPartyPortId: transferChannel.portId,
    },
  };
};

/**
 * Convert the info to an undirected form.
 *
 * @param {string} primaryChainId
 * @param {string} counterChainId
 * @param {IBCConnectionInfo} directed
 * @returns {[string, IBCConnectionInfo]}
 */
export const normalizeConnectionInfo = (
  primaryChainId,
  counterChainId,
  directed,
) => {
  const key = connectionKey(primaryChainId, counterChainId);
  if (primaryChainId < counterChainId) {
    return [key, directed];
  } else {
    return [key, reverseConnInfo(directed)];
  }
};

/**
 * Provide a view on the connection from the primary chain's perspective.
 *
 * @param {string} primaryChainId
 * @param {string} counterChainId
 * @param {IBCConnectionInfo} normalized
 */
const denormalizeConnectionInfo = (
  primaryChainId,
  counterChainId,
  normalized,
) => {
  if (primaryChainId < counterChainId) {
    return normalized;
  } else {
    return reverseConnInfo(normalized);
  }
};

const ChainIdArgShape = M.or(
  M.string(),
  M.splitRecord(
    {
      chainId: M.string(),
    },
    undefined,
    M.any(),
  ),
);

const ChainHubI = M.interface('ChainHub', {
  registerChain: M.call(M.string(), CosmosChainInfoShape).returns(),
  getChainInfo: M.call(M.string()).returns(VowShape),
  registerConnection: M.call(
    M.string(),
    M.string(),
    IBCConnectionInfoShape,
  ).returns(),
  getConnectionInfo: M.call(ChainIdArgShape, ChainIdArgShape).returns(VowShape),
  getChainsAndConnection: M.call(M.string(), M.string()).returns(VowShape),
  registerAsset: M.call(M.string(), DenomDetailShape).returns(),
  getAsset: M.call(M.string()).returns(M.or(DenomDetailShape, M.undefined())),
  getDenom: M.call(BrandShape).returns(M.or(M.string(), M.undefined())),
});

/**
 * Make a new ChainHub in the zone (or in the heap if no zone is provided).
 *
 * The resulting object is an Exo singleton. It has no precious state. It's only
 * state is a cache of queries to agoricNames and whatever info was provided in
 * registration calls. When you need a newer version you can simply make a hub
 * hub and repeat the registrations.
 *
 * @param {Remote<NameHub>} agoricNames
 * @param {VowTools} vowTools
 */
export const makeChainHub = (agoricNames, vowTools) => {
  const zone = makeHeapZone();
  /** @type {MapStore<string, CosmosChainInfo>} */
  const chainInfos = zone.mapStore('chainInfos', {
    keyShape: M.string(),
    valueShape: CosmosChainInfoShape,
  });
  /** @type {MapStore<string, IBCConnectionInfo>} */
  const connectionInfos = zone.mapStore('connectionInfos', {
    keyShape: M.string(),
    valueShape: IBCConnectionInfoShape,
  });

  /** @type {MapStore<string, DenomDetail>} */
  const denomDetails = zone.mapStore('denom', {
    keyShape: M.string(),
    valueShape: DenomDetailShape,
  });
  /** @type {MapStore<Brand, string>} */
  const brandDenoms = zone.mapStore('brandDenom', {
    keyShape: BrandShape,
    valueShape: M.string(),
  });

  const lookupChainInfo = vowTools.retriable(
    zone,
    'lookupChainInfo',
    /** @param {string} chainName */
    // eslint-disable-next-line no-restricted-syntax -- TODO more exact rules for vow best practices
    async chainName => {
      await null;
      try {
        const chainInfo = await E(agoricNames).lookup(CHAIN_KEY, chainName);
        // It may have been set by another concurrent call
        // TODO consider makeAtomicProvider for vows
        if (!chainInfos.has(chainName)) {
          chainInfos.init(chainName, chainInfo);
        }
        return chainInfo;
      } catch (e) {
        console.error('lookupChainInfo', chainName, 'error', e);
        throw makeError(`chain not found:${chainName}`);
      }
    },
  );

  const lookupConnectionInfo = vowTools.retriable(
    zone,
    'lookupConnectionInfo',
    /**
     * @param {string} chainId1
     * @param {string} chainId2
     */
    // eslint-disable-next-line no-restricted-syntax -- TODO more exact rules for vow best practices
    async (chainId1, chainId2) => {
      await null;
      const key = connectionKey(chainId1, chainId2);
      try {
        const connectionInfo = await E(agoricNames).lookup(
          CONNECTIONS_KEY,
          key,
        );
        // It may have been set by another concurrent call
        // TODO consider makeAtomicProvider for vows
        if (!connectionInfos.has(key)) {
          connectionInfos.init(key, connectionInfo);
        }

        return denormalizeConnectionInfo(chainId1, chainId2, connectionInfo);
      } catch (e) {
        console.error('lookupConnectionInfo', chainId1, chainId2, 'error', e);
        throw makeError(`connection not found: ${chainId1}<->${chainId2}`);
      }
    },
  );

  /* eslint-disable no-use-before-define -- chainHub defined below */
  const lookupChainsAndConnection = vowTools.retriable(
    zone,
    'lookupChainsAndConnection',
    /**
     * @template {string} C1
     * @template {string} C2
     * @param {C1} primaryName
     * @param {C2} counterName
     * @returns {Promise<
     *   [ActualChainInfo<C1>, ActualChainInfo<C2>, IBCConnectionInfo]
     * >}
     */
    // eslint-disable-next-line no-restricted-syntax -- TODO more exact rules for vow best practices
    async (primaryName, counterName) => {
      const [primary, counter] = await vowTools.asPromise(
        vowTools.allVows([
          chainHub.getChainInfo(primaryName),
          chainHub.getChainInfo(counterName),
        ]),
      );
      const connectionInfo = await vowTools.asPromise(
        chainHub.getConnectionInfo(primary, counter),
      );
      return /** @type {[ActualChainInfo<C1>, ActualChainInfo<C2>, IBCConnectionInfo]} */ ([
        primary,
        counter,
        connectionInfo,
      ]);
    },
  );

  const chainHub = zone.exo('ChainHub', ChainHubI, {
    /**
     * Register a new chain. The name will override a name in well known chain
     * names.
     *
     * If a durable zone was not provided, registration will not survive a
     * reincarnation of the vat. Then if the chain is not yet in the well known
     * names at that point, it will have to be registered again. In an unchanged
     * contract `start` the call will happen again naturally.
     *
     * @param {string} name
     * @param {CosmosChainInfo} chainInfo
     */
    registerChain(name, chainInfo) {
      chainInfos.init(name, chainInfo);
    },
    /**
     * @template {string} K
     * @param {K} chainName
     * @returns {Vow<ActualChainInfo<K>>}
     */
    getChainInfo(chainName) {
      // Either from registerChain or memoized remote lookup()
      if (chainInfos.has(chainName)) {
        return /** @type {Vow<ActualChainInfo<K>>} */ (
          vowTools.asVow(() => chainInfos.get(chainName))
        );
      }

      return lookupChainInfo(chainName);
    },
    /**
     * @param {string} primaryChainId
     * @param {string} counterpartyChainId
     * @param {IBCConnectionInfo} connectionInfo from primary to counterparty
     */
    registerConnection(primaryChainId, counterpartyChainId, connectionInfo) {
      const [key, normalized] = normalizeConnectionInfo(
        primaryChainId,
        counterpartyChainId,
        connectionInfo,
      );
      connectionInfos.init(key, normalized);
    },

    /**
     * @param {string | { chainId: string }} primary the primary chain
     * @param {string | { chainId: string }} counter the counterparty chain
     * @returns {Vow<IBCConnectionInfo>}
     */
    getConnectionInfo(primary, counter) {
      const primaryId = typeof primary === 'string' ? primary : primary.chainId;
      const counterId = typeof counter === 'string' ? counter : counter.chainId;
      const key = connectionKey(primaryId, counterId);
      if (connectionInfos.has(key)) {
        return vowTools.asVow(() =>
          denormalizeConnectionInfo(
            primaryId,
            counterId,
            connectionInfos.get(key),
          ),
        );
      }

      return lookupConnectionInfo(primaryId, counterId);
    },

    /**
     * @template {string} C1
     * @template {string} C2
     * @param {C1} primaryName the primary chain name
     * @param {C2} counterName the counterparty chain name
     * @returns {Vow<
     *   [ActualChainInfo<C1>, ActualChainInfo<C2>, IBCConnectionInfo]
     * >}
     */
    getChainsAndConnection(primaryName, counterName) {
      // @ts-expect-error XXX generic parameter propagation
      return lookupChainsAndConnection(primaryName, counterName);
    },

    /**
     * Register an asset that may be held on a chain other than the issuing
     * chain.
     *
     * @param {Denom} denom - on the holding chain, whose name is given in
     *   `detail.chainName`
     * @param {DenomDetail} detail - chainName and baseName must be registered
     */
    registerAsset(denom, detail) {
      const { chainName, baseName } = detail;
      chainInfos.has(chainName) ||
        Fail`must register chain ${q(chainName)} first`;
      chainInfos.has(baseName) ||
        Fail`must register chain ${q(baseName)} first`;
      denomDetails.init(denom, detail);
      if (detail.brand) {
        brandDenoms.init(detail.brand, denom);
      }
    },
    /**
     * Retrieve holding, issuing chain names etc. for a denom.
     *
     * @param {Denom} denom
     * @returns {DenomDetail | undefined}
     */
    getAsset(denom) {
      if (denomDetails.has(denom)) {
        return denomDetails.get(denom);
      }
      return undefined;
    },
    /**
     * Retrieve denom (string) for a Brand.
     *
     * @param {Brand} brand
     * @returns {Denom | undefined}
     */
    getDenom(brand) {
      if (brandDenoms.has(brand)) {
        return brandDenoms.get(brand);
      }
      return undefined;
    },
  });

  return chainHub;
};
/** @typedef {ReturnType<typeof makeChainHub>} ChainHub */

/**
 * @param {ChainHub} chainHub
 * @param {string} name
 * @param {CosmosAssetInfo[]} assets
 */
export const registerAssets = (chainHub, name, assets) => {
  for (const { base, traces } of assets) {
    const native = !traces;
    native || traces.length === 1 || Fail`unexpected ${traces.length} traces`;
    const [chainName, baseName, baseDenom] = native
      ? [name, name, base]
      : [
          name,
          traces[0].counterparty.chain_name,
          traces[0].counterparty.base_denom,
        ];
    chainHub.registerAsset(base, { chainName, baseName, baseDenom });
  }
};
