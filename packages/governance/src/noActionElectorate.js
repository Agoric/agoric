import { makePublishKit } from '@agoric/notifier';
import { makePromiseKit } from '@endo/promise-kit';
import { makeExo } from '@agoric/store';
import { EmptyProposalShape } from '@agoric/zoe/src/typeGuards.js';

import { ElectoratePublicI, ElectorateCreatorI } from './typeGuards.js';

/**
 * @import {Handle, ContractStartFn, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {ElectoratePublic, ElectorateCreatorFacet} from './types.js';
 */

/**
 * This Electorate visibly has no members, takes no votes, and approves no
 * changes.
 *
 *  @type {ContractStartFn<ElectoratePublic, ElectorateCreatorFacet>}
 */
const start = zcf => {
  const { subscriber } = makePublishKit();

  const publicFacet = makeExo('publicFacet', ElectoratePublicI, {
    getQuestionSubscriber() {
      return subscriber;
    },
    getOpenQuestions() {
      /** @type {Handle<'Question'>[]} */
      const noQuestions = [];
      const questionsPromise = makePromiseKit();
      questionsPromise.resolve(noQuestions);
      return questionsPromise.promise;
    },
    getName() {
      return 'no Action electorate';
    },
    getInstance() {
      return zcf.getInstance();
    },
    getQuestion(_instance, _question) {
      throw Error(`noActionElectorate doesn't have questions.`);
    },
  });

  const creatorFacet = makeExo('creatorFacet', ElectorateCreatorI, {
    getPoserInvitation() {
      return zcf.makeInvitation(
        () => {},
        `noActionElectorate doesn't allow posing questions`,
        undefined,
        EmptyProposalShape,
      );
    },
    addQuestion(_instance, _question) {
      throw Error(`noActionElectorate doesn't add questions.`);
    },
    getVoterInvitations() {
      throw Error(`No Action Electorate doesn't have invitations.`);
    },
    getQuestionSubscriber() {
      return subscriber;
    },
    getPublicFacet() {
      return publicFacet;
    },
  });

  return { publicFacet, creatorFacet };
};

harden(start);
export { start };
