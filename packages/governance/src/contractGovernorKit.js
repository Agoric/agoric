import { Fail } from '@agoric/assert';
import { UnguardedHelperI, makeTracer } from '@agoric/internal';
import { M, prepareExoClassKit } from '@agoric/vat-data';
import { E } from '@endo/eventual-send';
import {
  InvitationShape,
  InstanceHandleShape,
  InstallationShape,
} from '@agoric/zoe/src/typeGuards.js';
import { TimestampShape } from '@agoric/time';
import { setupApiGovernance } from './contractGovernance/governApi.js';
import { setupFilterGovernance } from './contractGovernance/governFilter.js';
import {
  CONTRACT_ELECTORATE,
  setupParamGovernance,
} from './contractGovernance/governParam.js';
import { ClosingRuleShape, ParamChangesSpecShape } from './typeGuards.js';

/**
 * @import {ContractMeta, Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, StandardTerms, ZCF, ZoeService} from '@agoric/zoe';
 * @import {VoteCounterCreatorFacet, VoteCounterPublicFacet, QuestionSpec, OutcomeRecord, AddQuestion, AddQuestionReturn, ClosingRule, GovernableStartFn, LimitedCF, PoserFacet, VoteOnApiInvocation, VoteOnOfferFilter, VoteOnParamChanges} from './types.js';
 */

const trace = makeTracer('CGK', false);

const ContractGovernorKitI = {
  helper: UnguardedHelperI,
  creator: M.interface('Contract Governor Kit creator', {
    replaceElectorate: M.call(InvitationShape).returns(M.promise()),
    voteOnParamChanges: M.call(
      InstallationShape,
      TimestampShape,
      ParamChangesSpecShape,
    ).returns(M.promise()),
    voteOnApiInvocation: M.call(
      M.string(),
      M.arrayOf(M.any()),
      InstallationShape,
      TimestampShape,
    ).returns(M.promise()),
    voteOnOfferFilter: M.call(
      InstallationShape,
      TimestampShape,
      M.arrayOf(M.string()),
    ).returns(M.promise()),
    getCreatorFacet: M.call().returns(M.remotable('ElectorateCreator')),
    getAdminFacet: M.call().returns(M.remotable('ElectorateAdmin')),
    getInstance: M.call().returns(InstanceHandleShape),
    getPublicFacet: M.call().returns(M.remotable('ElectoratePublic')),
  }),
  public: M.interface('Contract Governor Kit public', {
    getElectorate: M.call().returns(M.promise(/* Instance */)),
    getGovernedContract: M.call().returns(InstanceHandleShape),
    validateVoteCounter: M.call(InstanceHandleShape).returns(M.promise()),
    validateElectorate: M.call(InstanceHandleShape).returns(M.promise()),
    validateTimer: M.call(ClosingRuleShape).returns(),
  }),
};

/**
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {{
 *   timer: import('@agoric/time').TimerService,
 *   zoe: ERef<ZoeService>,
 * }} powers
 */
export const prepareContractGovernorKit = (baggage, powers) => {
  // These are produced just-in-time because API governance makes remote calls, which prevent vat restart.
  // The other two could happen during restart but they'd need to have a separate hook, so for consistency
  // they're all lazy.
  /** @type {ReturnType<typeof setupFilterGovernance>} */
  let filterGovernance;
  /** @type {ReturnType<typeof setupParamGovernance>} */
  let paramGovernance;
  /** @type {Awaited<ReturnType<typeof setupApiGovernance>>} */
  let apiGovernance;

  /** @type {any} */
  let poserFacet;

  const makeContractGovernorKit = prepareExoClassKit(
    baggage,
    'ContractGovernorKit',
    ContractGovernorKitI,
    /**
     * @param {import('@agoric/zoe/src/zoeService/utils.js').StartedInstanceKit<GovernableStartFn>} startedInstanceKit
     * @param {LimitedCF<unknown>} limitedCreatorFacet
     */
    (startedInstanceKit, limitedCreatorFacet) => {
      return {
        ...startedInstanceKit,
        limitedCreatorFacet,
        currentInvitation: /** @type {Invitation<unknown, never>?} */ (null),
      };
    },
    {
      helper: {
        /** @type {() => Promise<Instance>} */
        async getElectorateInstance() {
          const { publicFacet } = this.state;
          const invitationAmount =
            await E(publicFacet).getInvitationAmount(CONTRACT_ELECTORATE);
          return invitationAmount.value[0].instance;
        },
        /** @type {() => Promise<PoserFacet>} */
        async getUpdatedPoserFacet() {
          const { creatorFacet } = this.state;
          const newInvitation = await E(
            E(E(creatorFacet).getParamMgrRetriever()).get({
              key: 'governedParams',
            }),
          ).getInternalParamValue(CONTRACT_ELECTORATE);

          if (newInvitation !== this.state.currentInvitation) {
            poserFacet = E(E(powers.zoe).offer(newInvitation)).getOfferResult();
            this.state.currentInvitation = newInvitation;
          }
          return poserFacet;
        },
        async provideApiGovernance() {
          const { timer } = powers;
          const { creatorFacet } = this.state;
          await null;
          if (!apiGovernance) {
            trace('awaiting governed API dependencies');
            const [governedApis, governedNames] = await Promise.all([
              E(creatorFacet).getGovernedApis(),
              E(creatorFacet).getGovernedApiNames(),
            ]);
            trace('setupApiGovernance');
            apiGovernance = governedNames.length
              ? setupApiGovernance(governedApis, governedNames, timer, () =>
                  this.facets.helper.getUpdatedPoserFacet(),
                )
              : {
                  // if we aren't governing APIs, voteOnApiInvocation shouldn't be called
                  voteOnApiInvocation: () => {
                    throw Error('api governance not configured');
                  },
                  createdQuestion: () => false,
                };
          }
          return apiGovernance;
        },
        provideFilterGovernance() {
          if (!filterGovernance) {
            const { timer } = powers;
            const { creatorFacet } = this.state;
            filterGovernance = setupFilterGovernance(
              timer,
              () => this.facets.helper.getUpdatedPoserFacet(),
              creatorFacet,
            );
          }
          return filterGovernance;
        },
        provideParamGovernance() {
          if (!paramGovernance) {
            const { timer } = powers;
            const { creatorFacet, instance } = this.state;
            paramGovernance = setupParamGovernance(
              E(creatorFacet).getParamMgrRetriever(),
              instance,
              timer,
              () => this.facets.helper.getUpdatedPoserFacet(),
            );
          }
          return paramGovernance;
        },
      },
      creator: {
        /**
         * @param {Invitation} poserInvitation
         * @returns {Promise<void>}
         */
        replaceElectorate(poserInvitation) {
          const { creatorFacet } = this.state;
          /** @type {Promise<import('./contractGovernance/typedParamManager.js').TypedParamManager<{'Electorate': 'invitation'}>>} */

          // @ts-expect-error cast
          const paramMgr = E(E(creatorFacet).getParamMgrRetriever()).get({
            key: 'governedParams',
          });

          // TODO use updateElectorate
          return E(paramMgr).updateParams({
            Electorate: poserInvitation,
          });
        },
        /** @type {VoteOnParamChanges} */
        voteOnParamChanges(voteCounterInstallation, deadline, paramSpec) {
          const { helper } = this.facets;
          return helper
            .provideParamGovernance()
            .voteOnParamChanges(voteCounterInstallation, deadline, paramSpec);
        },
        /** @type {VoteOnApiInvocation} */
        voteOnApiInvocation(
          apiMethodName,
          methodArgs,
          voteCounterInstallation,
          deadline,
        ) {
          const { helper } = this.facets;
          return E(helper.provideApiGovernance()).voteOnApiInvocation(
            apiMethodName,
            methodArgs,
            voteCounterInstallation,
            deadline,
          );
        },
        /** @type {VoteOnOfferFilter} */
        voteOnOfferFilter(voteCounterInstallation, deadline, strings) {
          const { helper } = this.facets;
          return helper
            .provideFilterGovernance()
            .voteOnFilter(voteCounterInstallation, deadline, strings);
        },
        getCreatorFacet() {
          return this.state.limitedCreatorFacet;
        },
        getAdminFacet() {
          return this.state.adminFacet;
        },
        getInstance() {
          return this.state.instance;
        },
        getPublicFacet() {
          return this.state.publicFacet;
        },
      },
      public: {
        getElectorate() {
          const { helper } = this.facets;
          return helper.getElectorateInstance();
        },
        getGovernedContract() {
          return this.state.instance;
        },
        /** @param {Instance} counter */
        async validateVoteCounter(counter) {
          const { helper } = this.facets;
          const validators = [
            E.get(helper.provideApiGovernance()),
            helper.provideFilterGovernance(),
            helper.provideParamGovernance(),
          ];
          const checks = await Promise.all(
            validators.map(validate => E(validate.createdQuestion)(counter)),
          );

          checks.some(Boolean) ||
            Fail`VoteCounter was not created by this contractGovernor`;
        },
        /** @param {Instance} regP */
        validateElectorate(regP) {
          const { helper } = this.facets;
          return E.when(regP, async reg => {
            const electorateInstance = await helper.getElectorateInstance();
            assert(
              reg === electorateInstance,
              "Electorate doesn't match my Electorate",
            );
          });
        },
        /** @param {ClosingRule} closingRule */
        validateTimer(closingRule) {
          assert(
            closingRule.timer === powers.timer,
            'closing rule must use my timer',
          );
        },
      },
    },
  );

  return makeContractGovernorKit;
};

/** @typedef {ReturnType<ReturnType<typeof prepareContractGovernorKit>>} ContractGovernorKit */
