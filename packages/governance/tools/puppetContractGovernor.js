import { Fail } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

// eslint-disable-next-line no-unused-vars -- used by typedef
import { CONTRACT_ELECTORATE } from '../src/contractGovernance/governParam.js';
import { makeApiInvocationPositions } from '../src/contractGovernance/governApi.js';

/**
 * @import {Passable, RemotableObject} from '@endo/pass-style';
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
    // @ts-expect-error xxx governance types https://github.com/Agoric/agoric-sdk/issues/7178
    augmentedTerms,
    privateArgs.governed,
  );

  const paramMgrRetriever = E(governedCF).getParamMgrRetriever();

  // In this fake, the ability to update params is not closely held.
  const limitedCreatorFacet = E(governedCF).getLimitedCreatorFacet();

  /** @param {ParamChangesSpec<any>} paramSpec */
  const changeParams = async paramSpec => {
    const paramMgr = E(paramMgrRetriever).get(paramSpec.paramPath);
    return E(paramMgr).updateParams(paramSpec.changes);
  };

  /** @param {Array<string>} strings */
  const setFilters = async strings => E(governedCF).setOfferFilter(strings);

  /**
   * @param {string} apiMethodName
   * @param {Passable[]} methodArgs
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
    getCreatorFacet: async () => limitedCreatorFacet,
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
