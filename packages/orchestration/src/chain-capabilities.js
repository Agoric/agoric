/**
 * @file Contains ChainInfo that not available from a well-known chain registry.
 *
 *   Info last verified Jan. 21 2025
 */

import { objectMap } from '@endo/patterns';

/** @import {CosmosChainInfo, KnownChains} from '@agoric/orchestration'; */

/**
 * Chains with the async-icq (icq-1) module available.
 *
 * @satisfies {Partial<Record<keyof KnownChains, boolean>>}
 */
const IcqEnabled = /** @type {const} */ ({
  omniflixhub: true,
  osmosis: true,
});
harden(IcqEnabled);

/**
 * Chains with the packet-forward-middleware module available.
 *
 * @satisfies {Partial<Record<keyof KnownChains, boolean>>}
 */
const PfmEnabled = /** @type {const} */ ({
  agoric: true,
  celestia: true,
  cosmoshub: true,
  juno: true,
  neutron: true,
  noble: true,
  omniflixhub: true,
  osmosis: true,
  secretnetwork: true,
  stargaze: true,
  stride: true,
  umee: true,
});
harden(PfmEnabled);

const IcaEnabled = /** @type {const} */ ({
  agoric: true,
  celestia: true,
  cosmoshub: true,
  dydx: true,
  juno: true,
  neutron: true,
  noble: true,
  omniflixhub: true,
  osmosis: true,
  secretnetwork: true,
  stargaze: true,
  stride: true,
  umee: true,
});
harden(IcaEnabled);

const cctpDomains = /** @type {const} */ ({
  noble: 4,
});
harden(cctpDomains);

/**
 * @param {Record<string, CosmosChainInfo>} chainInfo
 * @param {{
 *   PfmEnabled: Record<string, boolean>;
 *   IcqEnabled: Record<string, boolean>;
 *   IcaEnabled: Record<string, boolean>;
 *   cctpDomains: Record<string, number>;
 * }} [opts]
 */
export const withChainCapabilities = (
  chainInfo,
  opts = {
    PfmEnabled,
    IcqEnabled,
    IcaEnabled,
    cctpDomains,
  },
) => {
  return objectMap(chainInfo, (info, name) => ({
    ...info,
    pfmEnabled: !!opts.PfmEnabled[name],
    icqEnabled: !!opts.IcqEnabled[name],
    icaEnabled: !!opts.IcqEnabled[name],
    ...(cctpDomains[name] ? { cctpDestinationDomain: cctpDomains[name] } : {}),
  }));
};
