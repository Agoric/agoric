import { makeTracer } from '@agoric/internal';
import { registerChainsAndAssets } from '../utils/chain-hub-helper.js';
import { withOrchestration } from '../utils/start-helper.js';
import { prepareStrideStakingTap } from './elys-contract-tap-kit.js';
import * as flows from './elys-contract.flow.js';
import { E } from '@endo/far';

const trace = makeTracer('ContractInstantiation');

const interfaceTODO = undefined;
/**
 * @import {Zone} from '@agoric/zone';
 * @import {OrchestrationPowers, OrchestrationTools} from '../utils/start-helper.js';
 * @import {CosmosChainInfo, Denom, DenomDetail} from '../types.js';
 */

/**
 * To be wrapped with `withOrchestration`.
 *
 * @param {ZCF} zcf
 * @param {OrchestrationPowers & {
 *   marshaller: Marshaller;
 *   chainInfo?: Record<string, CosmosChainInfo>;
 *   assetInfo?: [Denom, DenomDetail & { brandKey?: string }][];
 * }} privateArgs
 * @param {Zone} zone
 * @param {OrchestrationTools} tools
 */
const contract = async (
  zcf,
  privateArgs,
  zone,
  { chainHub, orchestrateAll, vowTools }, // orchestration tools
) => {
  const makeStrideStakingTap = prepareStrideStakingTap(
    zone.subZone('strideStakingTap'),
    vowTools,
  );

  const { makeICAHookAccounts } = orchestrateAll(flows, {
    makeStrideStakingTap,
    chainHub,
  });

  registerChainsAndAssets(
    chainHub,
    zcf.getTerms().brands,
    privateArgs.chainInfo,
    privateArgs.assetInfo,
  );

  const passablesupportedHostChains = zone.mapStore('supportedHostChains');
  const stDenomOnElysTohostToAgoricChannelMap = zone.mapStore(
    'stDenomOnElysToHostChannelMap',
  );

  const icaAndLocalAccount = zone.makeOnce('icaAndLocalAccount', _key =>
    makeICAHookAccounts({
      chainNames: allowedChains,
      supportedHostChains: passablesupportedHostChains,
      stDenomOnElysTohostToAgoricChannelMap,
    }),
  );

  const { when } = vowTools;

  return {
    publicFacet: zone.exo('Public', interfaceTODO, {
      getLocalAddress: () => E(when(icaAndLocalAccount)).getAddress(),
    }),
    creatorFacet: zone.exo('MyCreator', undefined, {}),
  };
};

export const start = withOrchestration(contract);
harden(start);

// TODO: Send these params during initialisation of the contract
const allowedChains = ['cosmoshub'];
harden(allowedChains);
