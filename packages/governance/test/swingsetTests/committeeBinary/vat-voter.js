import { q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import { makeNotifierFromSubscriber, observeNotifier } from '@agoric/notifier';
import { keyEQ } from '@agoric/store';

/**
 * @import {CommitteeElectoratePublic, Issue} from '../../../src/types.js';
 */

/**
 * @param {(msg: any)=> void} log
 * @param {Issue} issue
 * @param {ERef<CommitteeElectoratePublic>} electoratePublicFacet
 * @param {Record<string, Instance>} instances
 */
const verify = async (log, issue, electoratePublicFacet, instances) => {
  const questionHandles = await E(electoratePublicFacet).getOpenQuestions();
  const detailsP = questionHandles.map(async h => {
    const question = E(electoratePublicFacet).getQuestion(h);
    return E(question).getDetails();
  });
  const detailsPlural = await Promise.all(detailsP);
  const details = detailsPlural.find(d => keyEQ(d.issue, issue));
  assert(details);

  const { positions, method, issue: iss, maxChoices } = details;
  log(`verify question from instance: ${q(issue)}, ${q(positions)}, ${method}`);
  const c = await E(electoratePublicFacet).getName();
  log(`Verify: q: ${q(iss)}, max: ${maxChoices}, committee: ${c}`);
  const electorateInstance = await E(electoratePublicFacet).getInstance();
  log(
    `Verify instances: electorate: ${
      electorateInstance === instances.electorateInstance
    }, counter: ${details.counterInstance === instances.counterInstance}`,
  );
};

/**
 * @param {(msg: any)=> void} log
 * @param {ZoeService} zoe
 */
const build = async (log, zoe) => {
  return Far('voter', {
    createVoter: async (name, invitation, choice) => {
      /** @type {import('@agoric/zoe/src/zoeService/utils.js').Instance<typeof import('@agoric/governance/src/committee.js').start>} */
      const electorateInstance = await E(zoe).getInstance(invitation);
      const electoratePublicFacet = E(zoe).getPublicFacet(electorateInstance);
      const seat = E(zoe).offer(invitation);
      const { voter } = E.get(E(seat).getOfferResult());
      void E.when(E(seat).getPayouts(), async () => {
        void E.when(E(seat).hasExited(), exited => {
          log(`Seat ${name} ${exited ? 'has exited' : 'is open'}`);
        });
      });

      const votingObserver = Far('voting observer', {
        updateState: details => {
          log(`${name} voted for ${q(choice)}`);
          return E(voter).castBallotFor(details.questionHandle, [choice]);
        },
      });
      const subscriber = E(electoratePublicFacet).getQuestionSubscriber();
      void observeNotifier(
        makeNotifierFromSubscriber(subscriber),
        votingObserver,
      );

      return Far(`Voter ${name}`, {
        verifyBallot: async (question, instances) =>
          verify(log, question, electoratePublicFacet, instances),
      });
    },
    createMultiVoter: async (name, invitation, choices) => {
      const electorateInstance = await E(zoe).getInstance(invitation);
      /** @type {Promise<CommitteeElectoratePublic>} electoratePublicFacet */
      const electoratePublicFacet = E(zoe).getPublicFacet(electorateInstance);
      const seat = E(zoe).offer(invitation);
      const { voter } = E.get(E(seat).getOfferResult());

      const voteMap = new Map();
      for (const [issue, position] of choices) {
        voteMap.set(issue.text, position);
      }
      const votingObserver = Far('voting observer', {
        updateState: details => {
          const choice = voteMap.get(details.issue.text);
          log(`${name} voted on ${q(details.issue)} for ${q(choice)}`);
          return E(voter).castBallotFor(details.questionHandle, [choice]);
        },
      });
      const subscriber = E(electoratePublicFacet).getQuestionSubscriber();
      void observeNotifier(
        makeNotifierFromSubscriber(subscriber),
        votingObserver,
      );

      return Far(`Voter ${name}`, {
        verifyBallot: async (question, instances) =>
          verify(log, question, electoratePublicFacet, instances),
      });
    },
  });
};

/** @type {import('@agoric/swingset-vat/src/kernel/vat-loader/types.js').BuildRootObjectForTestVat} */
export const buildRootObject = vatPowers =>
  Far('root', {
    /** @param {ZoeService} zoe */
    build: async zoe => build(vatPowers.testLog, zoe),
  });
