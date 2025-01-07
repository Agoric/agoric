import { q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import {
  assertContractElectorate,
  assertContractGovernance,
  validateQuestionFromCounter,
  validateQuestionDetails,
  assertBallotConcernsParam,
} from '../../../src/index.js';
import { MALLEABLE_NUMBER } from './governedContract.js';

const build = async (log, zoe) => {
  return Far('voter', {
    createVoter: async (name, invitation) => {
      const seat = E(zoe).offer(invitation);
      const { voter } = E.get(E(seat).getOfferResult());

      return Far(`Voter ${name}`, {
        castBallotFor: async (questionHandle, choice) => {
          log(`Voter ${name} voted for ${q(choice)}`);
          return E(voter).castBallotFor(questionHandle, [choice]);
        },
        /**
         *
         * @param {Instance} counterInstance
         * @param {Instance} governedInstance
         * @param {Instance} electorateInstance
         * @param {Instance} governorInstance
         * @param {Record<string, Installation>} installations
         * @returns {Promise<void>}
         */
        validate: async (
          counterInstance,
          governedInstance,
          electorateInstance,
          governorInstance,
          installations,
        ) => {
          const validateQuestionFromCounterP = validateQuestionFromCounter(
            zoe,
            electorateInstance,
            counterInstance,
          );

          const contractGovernanceP = assertContractGovernance(
            zoe,
            governedInstance,
            governorInstance,
            installations.contractGovernor,
          );

          const [
            questionDetails,
            electorateInstallation,
            voteCounterInstallation,
            governedInstallation,
            governorInstallation,
            validatedQuestion,
            contractGovernance,
          ] = await Promise.all([
            E(E(zoe).getPublicFacet(counterInstance)).getDetails(),
            E(zoe).getInstallationForInstance(electorateInstance),
            E(zoe).getInstallationForInstance(counterInstance),
            E(zoe).getInstallationForInstance(governedInstance),
            E(zoe).getInstallationForInstance(governorInstance),
            validateQuestionFromCounterP,
            contractGovernanceP,
          ]);

          assertBallotConcernsParam(
            harden({
              paramPath: { key: 'governedParams' },
              parameterName: MALLEABLE_NUMBER,
            }),
            questionDetails,
          );
          assert(installations.binaryVoteCounter === voteCounterInstallation);
          assert(installations.governedContract === governedInstallation);
          assert(installations.contractGovernor === governorInstallation);
          assert(installations.committee === electorateInstallation);
          await assertContractElectorate(
            zoe,
            governorInstance,
            electorateInstance,
          );

          await validateQuestionDetails(
            zoe,
            electorateInstance,
            questionDetails,
          );
          assert(validatedQuestion, 'governor failed to validate electorate');
          assert(
            contractGovernance,
            "governor and governed aren't tightly linked",
          );

          log(`Voter ${name} validated all the things`);
        },
      });
    },
  });
};

/**
 * @typedef {ReturnType<Awaited<ReturnType<typeof build>>['createVoter']>} EVatVoter
 */

/** @type {import('@agoric/swingset-vat/src/kernel/vat-loader/types.js').BuildRootObjectForTestVat} */
export const buildRootObject = vatPowers =>
  Far('root', {
    build: async (...args) => build(vatPowers.testLog, ...args),
  });
