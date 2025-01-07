/**
 * @file An example of how to leverage basic functionality of the Orchestration
 *   API with async-flow. Each offer returning a ContinuingOfferResult, with
 *   invitationMakers for Delegate, WithdrawRewards, Transfer, etc.
 */
import { makeTracer } from '@agoric/internal';
import { M, mustMatch } from '@endo/patterns';

const trace = makeTracer('BasicFlows');

/**
 * @import {OrchestrationAccount, OrchestrationFlow, Orchestrator} from '@agoric/orchestration';
 * @import {ResolvedPublicTopic} from '@agoric/zoe/src/contractSupport/topics.js';
 * @import {MakePortfolioHolder} from '../exos/portfolio-holder-kit.js';
 */

/**
 * Create an OrchestrationAccount for a specific chain and return a continuing
 * offer with invitations makers for Delegate, WithdrawRewards, Transfer, etc.
 *
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {any} _ctx
 * @param {ZCFSeat} seat
 * @param {{ chainName: string }} offerArgs
 */
export const makeOrchAccount = async (orch, _ctx, seat, { chainName }) => {
  trace('makeOrchAccount', chainName);
  seat.exit(); // no funds exchanged
  mustMatch(chainName, M.string());
  const remoteChain = await orch.getChain(chainName);
  const orchAccount = await remoteChain.makeAccount();
  return orchAccount.asContinuingOffer();
};
harden(makeOrchAccount);

/**
 * Create accounts on multiple chains and return them in a single continuing
 * offer with invitations makers for Delegate, WithdrawRewards, Transfer, etc.
 * Calls to the underlying invitationMakers are proxied through the `Proxying`
 * invitation maker.
 *
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {object} ctx
 * @param {MakePortfolioHolder} ctx.makePortfolioHolder
 * @param {ZCFSeat} seat
 * @param {{ chainNames: string[] }} offerArgs
 */
export const makePortfolioAccount = async (
  orch,
  { makePortfolioHolder },
  seat,
  { chainNames },
) => {
  trace('makePortfolioAccount', chainNames);
  seat.exit(); // no funds exchanged
  mustMatch(chainNames, M.arrayOf(M.string()));
  const allChains = await Promise.all(
    chainNames.map(async n => orch.getChain(n)),
  );
  const allAccounts = await Promise.all(
    allChains.map(async c => c.makeAccount()),
  );

  const accountEntries = harden(
    /** @type {[string, OrchestrationAccount<any>][]} */ (
      chainNames.map((chainName, index) => [chainName, allAccounts[index]])
    ),
  );
  const publicTopicEntries = harden(
    /** @type {[string, ResolvedPublicTopic<unknown>][]} */ (
      await Promise.all(
        accountEntries.map(async ([name, account]) => {
          const { account: topicRecord } = await account.getPublicTopics();
          return [name, topicRecord];
        }),
      )
    ),
  );
  const portfolioHolder = makePortfolioHolder(
    accountEntries,
    publicTopicEntries,
  );

  return portfolioHolder.asContinuingOffer();
};
harden(makePortfolioAccount);
