import { Far } from '@endo/marshal';
import { makeStoredPublisherKit } from '@agoric/notifier';
import { getMethodNames, objectMap } from '@agoric/internal';
import { ignoreContext, prepareExo } from '@agoric/vat-data';
import { keyEQ, M } from '@agoric/store';
import { AmountShape, BrandShape } from '@agoric/ertp';
import { RelativeTimeRecordShape, TimestampRecordShape } from '@agoric/time';
import { E } from '@endo/eventual-send';
import { assertElectorateMatches } from './contractGovernance/paramManager.js';
import { makeParamManagerFromTerms } from './contractGovernance/typedParamManager.js';
import { GovernorFacetShape } from './typeGuards.js';

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {VoteCounterCreatorFacet, VoteCounterPublicFacet, QuestionSpec, OutcomeRecord, AddQuestion, AddQuestionReturn, GovernanceSubscriptionState, GovernanceTerms, GovernedApis, GovernedCreatorFacet, GovernedPublicFacet} from './types.js';
 */

const { Fail, quote: q } = assert;

export const GOVERNANCE_STORAGE_KEY = 'governance';

const publicMixinAPI = harden({
  getSubscription: M.call().returns(M.remotable('StoredSubscription')),
  getGovernedParams: M.call().returns(M.or(M.record(), M.promise())),
  getAmount: M.call().returns(AmountShape),
  getBrand: M.call().returns(BrandShape),
  getInstance: M.call().returns(M.remotable('Instance')),
  getInstallation: M.call().returns(M.remotable('Installation')),
  getInvitationAmount: M.call().returns(M.promise()),
  getNat: M.call().returns(M.bigint()),
  getRatio: M.call().returns(M.record()),
  getString: M.call().returns(M.string()),
  getTimestamp: M.call().returns(TimestampRecordShape),
  getRelativeTime: M.call().returns(RelativeTimeRecordShape),
  getUnknown: M.call().returns(M.any()),
});

/**
 * @param {ZCF<GovernanceTerms<{}> & {}>} zcf
 * @param {import('./contractGovernance/typedParamManager.js').TypedParamManager<any>} paramManager
 */
export const validateElectorate = (zcf, paramManager) => {
  const { governedParams } = zcf.getTerms();
  return E.when(paramManager.getParams(), finishedParams => {
    try {
      keyEQ(governedParams, finishedParams) ||
        Fail`The 'governedParams' term must be an object like ${q(
          finishedParams,
        )}, but was ${q(governedParams)}`;
      assertElectorateMatches(paramManager, governedParams);
    } catch (err) {
      zcf.shutdownWithFailure(err);
    }
  });
};
harden(validateElectorate);

/**
 * Utility function for `makeParamGovernance`.
 *
 * @template {import('./contractGovernance/typedParamManager.js').ParamTypesMap} T
 * @param {ZCF<GovernanceTerms<{}> & {}>} zcf
 * @param {import('./contractGovernance/typedParamManager.js').TypedParamManager<T>} paramManager
 */
const facetHelpers = (zcf, paramManager) => {
  // validate async to wait for params to be finished
  // UNTIL https://github.com/Agoric/agoric-sdk/issues/4343
  void validateElectorate(zcf, paramManager);

  const typedAccessors = {
    getAmount: paramManager.getAmount,
    getBrand: paramManager.getBrand,
    getInstance: paramManager.getInstance,
    getInstallation: paramManager.getInstallation,
    getInvitationAmount: paramManager.getInvitationAmount,
    getNat: paramManager.getNat,
    getRatio: paramManager.getRatio,
    getString: paramManager.getString,
    getTimestamp: paramManager.getTimestamp,
    getRelativeTime: paramManager.getRelativeTime,
    getUnknown: paramManager.getUnknown,
  };

  const commonPublicMethods = {
    getSubscription: () => paramManager.getSubscription(),
    getGovernedParams: () => paramManager.getParams(),
  };

  /**
   * Add required methods to publicFacet
   *
   * @template {{}} PF public facet
   * @param {PF} originalPublicFacet
   * @returns {GovernedPublicFacet<PF>}
   */
  const augmentPublicFacet = originalPublicFacet => {
    return Far('publicFacet', {
      ...originalPublicFacet,
      ...commonPublicMethods,
      ...typedAccessors,
    });
  };

  /**
   * Add required methods to publicFacet, for a virtual/durable contract
   *
   * @param {OPF} originalPublicFacet
   * @template {{}} OPF
   */
  const augmentVirtualPublicFacet = originalPublicFacet => {
    return Far('publicFacet', {
      ...originalPublicFacet,
      ...commonPublicMethods,
      ...objectMap(typedAccessors, ignoreContext),
    });
  };

  /**
   * @template {{}} CF
   * @param {CF} limitedCreatorFacet
   * @param {Record<string, (...any) => unknown>} [governedApis]
   * @returns {GovernedCreatorFacet<CF>}
   */
  const makeFarGovernorFacet = (limitedCreatorFacet, governedApis = {}) => {
    const governorFacet = Far('governorFacet', {
      getParamMgrRetriever: () =>
        Far('paramRetriever', { get: () => paramManager }),
      getInvitation: name => paramManager.getInternalParamValue(name),
      getLimitedCreatorFacet: () => limitedCreatorFacet,
      // The contract provides a facet with the APIs that can be invoked by
      // governance
      /** @type {() => GovernedApis} */
      getGovernedApis: () => Far('governedAPIs', governedApis),
      // The facet returned by getGovernedApis is Far, so we can't see what
      // methods it has. There's no clean way to have contracts specify the APIs
      // without also separately providing their names.
      getGovernedApiNames: () => Object.keys(governedApis),
      setOfferFilter: strings => zcf.setOfferFilter(strings),
    });

    // exclusively for contractGovernor, which only reveals limitedCreatorFacet
    return governorFacet;
  };

  /**
   * @template {{}} CF
   * @param {CF} originalCreatorFacet
   * @param {{}} [governedApis]
   * @returns {GovernedCreatorFacet<CF>}
   */
  const makeGovernorFacet = (originalCreatorFacet, governedApis = {}) => {
    return makeFarGovernorFacet(originalCreatorFacet, governedApis);
  };

  /**
   * Add required methods to a creatorFacet for a durable contract.
   *
   * @see {makeDurableGovernorFacet}
   *
   * @template {{ [methodName: string]: (context?: unknown, ...rest: unknown[]) => unknown}} LCF
   * @param {LCF} limitedCreatorFacet
   */
  const makeVirtualGovernorFacet = limitedCreatorFacet => {
    /** @type {import('@agoric/swingset-liveslots').FunctionsPlusContext<unknown, GovernedCreatorFacet<limitedCreatorFacet>>} */
    const governorFacet = harden({
      getParamMgrRetriever: () =>
        Far('paramRetriever', { get: () => paramManager }),
      getInvitation: (_context, /** @type {string} */ name) =>
        paramManager.getInternalParamValue(name),
      getLimitedCreatorFacet: ({ facets }) => facets.limitedCreatorFacet,
      // The contract provides a facet with the APIs that can be invoked by
      // governance
      getGovernedApis: ({ facets }) => facets.governedApis,
      // The facet returned by getGovernedApis is Far, so we can't see what
      // methods it has. There's no clean way to have contracts specify the APIs
      // without also separately providing their names.
      getGovernedApiNames: ({ facets }) =>
        getMethodNames(facets.governedApis || {}),
      setOfferFilter: (_context, strings) => zcf.setOfferFilter(strings),
    });

    return { governorFacet, limitedCreatorFacet };
  };

  /**
   * Add required methods to a creatorFacet for a durable contract.
   *
   * @see {makeVirtualGovernorFacet}
   *
   * @template CF
   * @param {import('@agoric/vat-data').Baggage} baggage
   * @param {CF} limitedCreatorFacet
   * @param {Record<string, (...any) => unknown>} [governedApis]
   */
  const makeDurableGovernorFacet = (
    baggage,
    limitedCreatorFacet,
    governedApis = {},
  ) => {
    const governorFacet = prepareExo(
      baggage,
      'governorFacet',
      M.interface('governorFacet', GovernorFacetShape),
      {
        getParamMgrRetriever: () =>
          Far('paramRetriever', { get: () => paramManager }),
        getInvitation: name => paramManager.getInternalParamValue(name),
        getLimitedCreatorFacet: () => limitedCreatorFacet,
        // The contract provides a facet with the APIs that can be invoked by
        // governance
        /** @type {() => GovernedApis} */
        getGovernedApis: () => Far('governedAPIs', governedApis),
        // The facet returned by getGovernedApis is Far, so we can't see what
        // methods it has. There's no clean way to have contracts specify the APIs
        // without also separately providing their names.
        getGovernedApiNames: () => Object.keys(governedApis || {}),
        setOfferFilter: strings => zcf.setOfferFilter(strings),
      },
    );

    return { governorFacet, limitedCreatorFacet };
  };

  return harden({
    publicMixin: {
      ...commonPublicMethods,
      ...typedAccessors,
    },
    augmentPublicFacet,
    augmentVirtualPublicFacet,
    makeGovernorFacet,

    makeFarGovernorFacet,
    makeVirtualGovernorFacet,
    makeDurableGovernorFacet,

    params: paramManager.readonly(),
  });
};

/**
 * Helper for the 90% of contracts that will have only a single set of
 * parameters. Using this for managed parameters, a contract only has to
 *
 * - Define the parameter template, which includes name, type and value
 * - Add any methods needed in the public and creator facets.
 *
 * It's also crucial that the governed contract not interact with the product of
 * makeGovernorFacet(). The wrapped creatorFacet has the power to change
 * parameter values, and the governance guarantees only hold if they're not used
 * directly by the governed contract.
 *
 * @template {import('./contractGovernance/typedParamManager.js').ParamTypesMap} M
 *   Map of types of custom governed terms
 * @param {ZCF<GovernanceTerms<M>>} zcf
 * @param {Invitation} initialPoserInvitation
 * @param {M} paramTypesMap
 * @param {ERef<StorageNode>} [storageNode]
 * @param {ERef<Marshaller>} [marshaller]
 */
const handleParamGovernance = (
  zcf,
  initialPoserInvitation,
  paramTypesMap,
  storageNode,
  marshaller,
) => {
  /** @type {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} */
  const publisherKit = makeStoredPublisherKit(
    storageNode,
    marshaller,
    GOVERNANCE_STORAGE_KEY,
  );
  const paramManager = makeParamManagerFromTerms(
    publisherKit,
    zcf,
    { Electorate: initialPoserInvitation },
    paramTypesMap,
  );

  return facetHelpers(zcf, paramManager);
};

harden(handleParamGovernance);

export { handleParamGovernance, publicMixinAPI };
