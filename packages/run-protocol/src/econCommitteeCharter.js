// @ts-check
// @jessie-check

import '@agoric/governance/src/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/zoe/src/contracts/exported.js';

import { E, Far } from '@endo/far';

/**
 * @file
 *
 * This extremely quick and dirty contract simplifies the process of
 * calling for votes on changes to the economy by gathering the governor creator
 * facets in one place and invokes `voteOnParamChanges` and
 * `voteOnApiInvocation` on each when requested. A cleaner version would
 * validate parameters, constrain deadlines and probably split the ability to
 * call for vote into separate capabilities for finer grain encapsulation.
 */

/**
 * @param {ZCF<{binaryVoteCounterInstallation:Installation}>} zcf
 * @param {{reserve:GovernedContractFacetAccess<unknown>, amm:GovernedCreatorFacet<unknown>, vaults:GovernedCreatorFacet<unknown>}} privateArgs
 */
export const start = async (zcf, privateArgs) => {
  const { binaryVoteCounterInstallation: counter } = zcf.getTerms();
  const { reserve, amm, vaults } = privateArgs;

  /**
   * @param {*} target
   * @param {Record<string, unknown>} params
   * @param {bigint} deadline
   * @param {{paramPath: { key: unknown }}} [path]
   */
  const voteOnParamChanges = (
    target,
    params,
    deadline,
    path = { paramPath: { key: 'governedApi' } },
  ) => {
    return E(target).voteOnParamChanges(counter, deadline, {
      ...path,
      changes: params,
    });
  };

  /**
   * @param {*} target
   * @param {string} method
   * @param {unknown[]} args
   * @param {bigint} deadline
   */
  const voteOnApiInvocation = (target, method, args, deadline) => {
    return E(target).voteOnApiInvocation(method, args, counter, deadline);
  };

  const makeNullInvitation = () => {
    return zcf.makeInvitation(() => {}, 'econCommitteeCharter noop');
  };

  const publicFacet = Far('votingAPI', {
    /**
     * @param {Record<string, unknown>} params
     * @param {bigint} deadline
     */
    voteOnAmmParamChanges: (params, deadline) =>
      voteOnParamChanges(amm, params, deadline),
    /**
     * @param {Record<string, unknown>} params
     * @param {bigint} deadline
     */
    voteOnReserveParamChanges: (params, deadline) =>
      voteOnParamChanges(reserve, params, deadline),
    /**
     * vote on param changes for a vaultManager
     *
     * @param {Record<string, unknown>} params
     * @param {{collateralBrand: Brand}} brand
     * @param {bigint} deadline
     */
    voteOnVaultParamChanges: (params, brand, deadline) =>
      voteOnParamChanges(vaults, params, deadline, {
        paramPath: { key: brand },
      }),
    /**
     * vote on param changes across the vaultFactory
     *
     * @param {Record<string, unknown>} params
     * @param {bigint} deadline
     */
    voteOnVaultFactoryParamChanges: (params, deadline) =>
      voteOnParamChanges(vaults, params, deadline),
    /**
     * @param {Amount[]} amounts
     * @param {bigint} deadline
     */
    voteOnReserveApiInvocation: (amounts, deadline) =>
      voteOnApiInvocation(reserve, 'addLiquidityToAmmPool', amounts, deadline),
    makeNullInvitation,
  });

  return harden({ publicFacet });
};
