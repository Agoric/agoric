// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import {
  validateQuestionFromCounter,
  assertContractElectorate,
  assertBallotConcernsParam,
} from '@agoric/governance';

const { details: X, quote: q } = assert;

const build = async (log, zoe) => {
  return Far('voter', {
    createVoter: async (name, invitation) => {
      const seat = E(zoe).offer(invitation);
      const voteFacet = E(seat).getOfferResult();

      return Far(`Voter ${name}`, {
        castBallotFor: async (handle, choice) => {
          log(`Voter ${name} cast a ballot for ${q(choice)}`);
          return E(voteFacet).castBallotFor(handle, [choice]);
        },
        validate: async (
          counterInstance,
          governedInstance,
          electorateInstance,
          governorInstance,
          issue,
          installations,
        ) => {
          const governedTermsP = E(zoe).getTerms(governedInstance);
          const electionManagerP = E.get(governedTermsP).electionManager;

          const counterPublicP = E(zoe).getPublicFacet(counterInstance);
          const ballotDetailsP = E(counterPublicP).getDetails();

          const [electionManager, ballotDetails] = await Promise.all([
            electionManagerP,
            ballotDetailsP,
          ]);

          await validateQuestionFromCounter(
            zoe,
            electorateInstance,
            counterInstance,
          );

          const governorMatches = electionManager === governorInstance;
          log(
            `governor from governed ${
              governorMatches ? 'matches' : 'does not match'
            } governor instance`,
          );

          assertBallotConcernsParam(issue.paramSpec, ballotDetails);

          await assertContractElectorate(
            zoe,
            governorInstance,
            electorateInstance,
          );

          const [
            counterInstallation,
            governorInstallation,
            electorateInstallation,
            governedInstallation,
          ] = await Promise.all([
            E(zoe).getInstallationForInstance(counterInstance),
            E(zoe).getInstallationForInstance(governorInstance),
            E(zoe).getInstallationForInstance(electorateInstance),
            E(zoe).getInstallationForInstance(governedInstance),
          ]);
          assert(
            counterInstallation === installations.counter,
            X`counterInstallation should match`,
          );
          assert(
            governorInstallation === installations.governor,
            X`governor Installation should match`,
          );
          assert(
            electorateInstallation === installations.electorate,
            X`electorate Installation should match`,
          );
          assert(
            governedInstallation === installations.vaultFactory,
            X`vaultFactory Installation should match`,
          );
        },
      });
    },
  });
};

export const buildRootObject = vatPowers =>
  Far('root', {
    build: (...args) => build(vatPowers.testLog, ...args),
  });
