/**
 * @file Stake BLD contract
 */
import { makeTracer } from "@agoric/internal";
import { prepareRecorderKitMakers } from "@agoric/zoe/src/contractSupport/recorder.js";
import { withdrawFromSeat } from "@agoric/zoe/src/contractSupport/zoeHelpers.js";
import { InvitationShape } from "@agoric/zoe/src/typeGuards.js";
import { makeDurableZone } from "@agoric/zone/durable.js";
import { prepareVowTools, heapVowE as E } from "@agoric/vow/vat.js";
import { deeplyFulfilled } from "@endo/marshal";
import { M } from "@endo/patterns";
import { prepareLocalOrchestrationAccountKit } from "../exos/local-orchestration-account.js";
import { makeChainHub } from "../exos/chain-hub.js";

import { withOrchestration } from "../utils/start-helper.js";

/**
 * @import {GuestOf} from '@agoric/async-flow';
 * @import {Orchestrator, LocalAccountMethods, OrchestrationAccountI, OrchestrationFlow} from '../types.js';
 * @import {TimerService} from '@agoric/time';
 * @import {LocalChain} from '@agoric/vats/src/localchain.js';
 * @import {NameHub} from '@agoric/vats';
 * @import {Remote, Vow} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {VBankAssetDetail} from '@agoric/vats/tools/board-utils.js';
 * @import {CosmosInterchainService} from '../exos/cosmos-interchain-service.js';
 * @import {OrchestrationTools} from '../utils/start-helper.js';
 */

/**
 * @typedef {{
 *   localchain: Remote<LocalChain>;
 *   orchestrationService: Remote<CosmosInterchainService>;
 *   storageNode: Remote<StorageNode>;
 *   timerService: Remote<TimerService>;
 *   agoricNames: Remote<NameHub>;
 * }} OrchestrationPowers
 */

const trace = makeTracer("StakeBld");
/**
 *
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {object} ctx
 * @param { ZCF } ctx.zcf
 * @param {ZCFSeat} seat
 * @param {Object} offerArgs
 */

const flow1 = async (orch, { zcf }, seat, offerArgs) => {
  const { give } = seat.getProposal();
  trace("makeStakeBldInvitation", give);
  const holder = await orch.makeLocalAccount();
  const { In } = await deeplyFulfilled(withdrawFromSeat(zcf, seat, give));
  await E(holder).deposit(In);
  seat.exit();
  return holder.asContinuingOffer();
};

/**
 * Orchestration contract to be wrapped by withOrchestration for Zoe
 *
 * @param {ZCF} zcf
 * @param {OrchestrationPowers & {
 *   marshaller: Marshaller;
 * }} privateArgs
 * @param {Zone} zone
 * @param {OrchestrationTools} tools
 */
export const contract = async (
  zcf,
  privateArgs,
  zone,
  { chainHub, orchestrate, vowTools, zoeTools }
) => {
  
  const handle = orchestrate("flow1", { zcf }, flow1);

  // ----------------
  // All `prepare*` calls should go above this line.

  const BLD = zcf.getTerms().brands.In;
  const bldAmountShape = await E(BLD).getAmountShape();

  const publicFacet = zone.exo(
    "StakeBld",
    M.interface("StakeBldI", {
      makeAccount: M.callWhen().returns(M.remotable("LocalChainAccountHolder")),
      makeAccountInvitationMaker: M.callWhen().returns(InvitationShape),
      makeStakeBldInvitation: M.callWhen().returns(InvitationShape),
    }),
    {
      /**
       * Invitation to make an account, initialized with the give's BLD
       */
      makeStakeBldInvitation() {
        return zcf.makeInvitation(
          handle,
          "wantStake",
          undefined,
          M.splitRecord({
            give: { In: bldAmountShape },
          })
        );
      },
      async makeAccount() {
        trace("makeAccount");
        const { holder } = await makeLocalAccountKit();
        return holder;
      },
      /**
       * Invitation to make an account, without any funds
       */
      makeAccountInvitationMaker() {
        trace("makeCreateAccountInvitation");
        return zcf.makeInvitation(async (seat) => {
          seat.exit();
          const { holder } = await makeLocalAccountKit();
          return holder.asContinuingOffer();
        }, "wantLocalChainAccount");
      },
    }
  );

  return { publicFacet };
};

export const start = withOrchestration(contract);
