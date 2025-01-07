// @jessie-check
/// <reference types="@agoric/governance/exported" />
/// <reference types="@agoric/zoe/exported" />

import { M, mustMatch } from '@agoric/store';
import { TimestampShape } from '@agoric/time';
import { prepareExo, provideDurableMapStore } from '@agoric/vat-data';
import {
  InstallationShape,
  InstanceHandleShape,
} from '@agoric/zoe/src/typeGuards.js';
import { E } from '@endo/far';

/**
 * @file This contract makes it possible for those who govern contracts to call
 *   for votes on changes. A more complete implementation would validate
 *   parameters, constrain deadlines and possibly split the ability to call for
 *   votes into separate capabilities for finer grain encapsulation.
 */

export const INVITATION_MAKERS_DESC = 'charter member invitation';

/**
 * @typedef {object} ParamChangesOfferArgs
 * @property {bigint} deadline
 * @property {Instance} instance
 * @property {Record<string, unknown>} params
 * @property {{ paramPath: unknown }} [path] paramPath is determined by contract
 */
const ParamChangesOfferArgsShape = M.splitRecord(
  {
    deadline: TimestampShape,
    instance: InstanceHandleShape,
    params: M.recordOf(M.string(), M.any()),
  },
  {
    path: { paramPath: { key: M.any() } },
  },
);

/** @type {ContractMeta<typeof start>} */
export const meta = {
  customTermsShape: {
    binaryVoteCounterInstallation: InstallationShape,
  },
  upgradability: 'canUpgrade',
};
harden(meta);

/**
 * @param {ZCF<{ binaryVoteCounterInstallation: Installation }>} zcf
 * @param {undefined} privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { binaryVoteCounterInstallation: counter } = zcf.getTerms();
  /** @type {MapStore<Instance, GovernorCreatorFacet<any>>} */
  const instanceToGovernor = provideDurableMapStore(
    baggage,
    'instanceToGovernor',
  );

  const makeParamInvitation = async () => {
    /**
     * @param {ZCFSeat} seat
     * @param {ParamChangesOfferArgs} args
     */
    const voteOnParamChanges = async (seat, args) => {
      mustMatch(args, ParamChangesOfferArgsShape);
      seat.exit();

      const {
        params,
        instance,
        deadline,
        path = { paramPath: { key: 'governedApi' } },
      } = args;
      const governor = instanceToGovernor.get(instance);
      return E(governor).voteOnParamChanges(counter, deadline, {
        ...path,
        // @ts-expect-error XXX
        changes: params,
      });
    };

    return zcf.makeInvitation(voteOnParamChanges, 'vote on param changes');
  };

  const makeOfferFilterInvitation = async (instance, strings, deadline) => {
    const voteOnOfferFilterHandler = async seat => {
      seat.exit();

      const governor = instanceToGovernor.get(instance);
      return E(governor).voteOnOfferFilter(counter, deadline, strings);
    };

    return zcf.makeInvitation(voteOnOfferFilterHandler, 'vote on offer filter');
  };

  /**
   * @param {Instance} instance
   * @param {string} methodName
   * @param {string[]} methodArgs
   * @param {import('@agoric/time').TimestampValue} deadline
   */
  const makeApiInvocationInvitation = async (
    instance,
    methodName,
    methodArgs,
    deadline,
  ) => {
    const handler = async seat => {
      seat.exit();

      const governor = instanceToGovernor.get(instance);
      return E(governor).voteOnApiInvocation(
        methodName,
        methodArgs,
        counter,
        deadline,
      );
    };
    return zcf.makeInvitation(handler, 'vote on API invocation');
  };

  const MakerI = M.interface('Charter InvitationMakers', {
    VoteOnParamChange: M.call().returns(M.promise()),
    VoteOnPauseOffers: M.call(
      InstanceHandleShape,
      M.arrayOf(M.string()),
      TimestampShape,
    ).returns(M.promise()),
    VoteOnApiCall: M.call(
      InstanceHandleShape,
      M.string(),
      M.arrayOf(M.any()),
      TimestampShape,
    ).returns(M.promise()),
  });

  // durable so that when this contract is upgraded this ocap held
  // by committee members (from their invitations) stay capable
  const invitationMakers = prepareExo(
    baggage,
    'Charter Invitation Makers',
    MakerI,
    {
      VoteOnParamChange: makeParamInvitation,
      VoteOnPauseOffers: makeOfferFilterInvitation,
      VoteOnApiCall: makeApiInvocationInvitation,
    },
  );

  const charterMemberHandler = seat => {
    seat.exit();
    return harden({ invitationMakers });
  };

  const CharterCreatorI = M.interface('Charter creatorFacet', {
    addInstance: M.call(InstanceHandleShape, M.any())
      .optional(M.string())
      .returns(),
    makeCharterMemberInvitation: M.call().returns(M.promise()),
  });

  const creatorFacet = prepareExo(
    baggage,
    'Charter creatorFacet',
    CharterCreatorI,
    {
      /**
       * @param {Instance} governedInstance
       * @param {GovernorCreatorFacet<any>} governorFacet
       * @param {string} [label] for diagnostic use only
       */
      addInstance: (governedInstance, governorFacet, label) => {
        console.log('charter: adding instance', label);
        instanceToGovernor.init(governedInstance, governorFacet);
      },
      makeCharterMemberInvitation: async () =>
        zcf.makeInvitation(charterMemberHandler, INVITATION_MAKERS_DESC),
    },
  );

  return harden({ creatorFacet });
};
harden(start);
