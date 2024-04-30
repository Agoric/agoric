import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import { Fail } from '@agoric/assert';
// eslint-disable-next-line no-unused-vars -- used by typedef
import { CONTRACT_ELECTORATE } from '../src/contractGovernance/governParam.js';
import { makeApiInvocationPositions } from '../src/contractGovernance/governApi.js';

/**
 * @import {Installation, IssuerKeywordRecord, ZCF} from '@agoric/zoe';
 * @import {GovernableStartFn, ParamChangesSpec} from '../src/types.js';
 */

// @file a version of the contractGovernor.js contract simplified for testing.
// It removes the electorate and doesn't try to support legibility.
// It maintains the API for the governed contract (parameters, apis, and filters)
// It adds the ability for tests to update parameters directly.

/**
 * @template {GovernableStartFn} SF Start function of governed contract
 * @param {ZCF<{
 *   timer: import('@agoric/time').TimerService,
 *   governedContractInstallation: Installation<SF>,
 *   governed: {
 *     issuerKeywordRecord?: IssuerKeywordRecord,
 *     terms: {governedParams: {[CONTRACT_ELECTORATE]: import('../src/contractGovernance/typedParamManager.js').InvitationParam }},
 *   }
 * }>} zcf
 * @param {{
 *   governed: Record<string, unknown>
 * }} privateArgs
 */
export const start = async (zcf, privateArgs) => {
  const zoe = zcf.getZoeService();
  const {
    governedContractInstallation,
    governed: {
      issuerKeywordRecord: governedIssuerKeywordRecord,
      terms: contractTerms,
    },
  } = zcf.getTerms();

  // in the fake there's no electionManager to augment the terms
  const augmentedTerms = contractTerms;

  const {
    creatorFacet: governedCF,
    instance: governedInstance,
    /** @type {ReturnType<SF>['publicFacet']} */
    publicFacet: governedPF,
    adminFacet,
  } = await E(zoe).startInstance(
    governedContractInstallation,
    governedIssuerKeywordRecord,
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error -- failed only when not built
    // @ts-ignore xxx governance types https://github.com/Agoric/agoric-sdk/issues/7178
    augmentedTerms,
    privateArgs.governed,
  );

  const paramMgrRetriever = E(governedCF).getParamMgrRetriever();

  // In this fake, the ability to update params is not closely held.
  const limitedCreatorFacet = E(governedCF).getLimitedCreatorFacet();

  /** @param {ParamChangesSpec<any>} paramSpec */
  const changeParams = paramSpec => {
    const paramMgr = E(paramMgrRetriever).get(paramSpec.paramPath);
    return E(paramMgr).updateParams(paramSpec.changes);
  };

  /** @param {Array<string>} strings */
  const setFilters = strings => E(governedCF).setOfferFilter(strings);

  /**
   * @param {string} apiMethodName
   * @param {unknown[]} methodArgs
   */
  const invokeAPI = async (apiMethodName, methodArgs) => {
    const governedNames = await E(governedCF).getGovernedApiNames();
    governedNames.includes(apiMethodName) ||
      Fail`${apiMethodName} is not a governed API.`;

    const { positive } = makeApiInvocationPositions(apiMethodName, methodArgs);
    assert.typeof(apiMethodName, 'string');

    return E(E(governedCF).getGovernedApis())
      [apiMethodName](...methodArgs)
      .then(() => positive);
  };

  const creatorFacet = Far('governor creatorFacet', {
    changeParams,
    invokeAPI,
    setFilters,
    getCreatorFacet: () => limitedCreatorFacet,
    getAdminFacet: () => adminFacet,
    getInstance: () => governedInstance,
    /** @returns {Awaited<ReturnType<SF>>['publicFacet']} */
    getPublicFacet: () => governedPF,
  });

  const publicFacet = Far('contract governor public', {
    getGovernedContract: () => governedInstance,
  });

  return { creatorFacet, publicFacet };
};
harden(start);
/**
 * @template {GovernableStartFn} SF Start function of governed contract
 * @typedef {Awaited<ReturnType<typeof start<SF>>>} PuppetContractGovernorKit<SF>
 */
