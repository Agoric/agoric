import { assert, X } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';

/**
 * This contract lets a funder endow a bounty that will pay out if an Oracle
 * reports an event at a deadline. To make a simple contract for a test the
 * contract only pays attention to the event that occurs at the requested
 * deadline. A realistic contract might look more than once, or might accept any
 * positive response before the deadline.
 *
 * @type {ContractStartFn}
 */
import {
  assertProposalShape,
  atomicTransfer,
} from '../../src/contractSupport/index.js';

/** @param {ZCF<any>} zcf */
const start = async zcf => {
  const { oracle, deadline, condition, timer, fee } = zcf.getTerms();

  /** @type {(funderSeat: ZCFSeat) => Promise<Invitation>} */
  async function funder(funderSeat) {
    const endowBounty = harden({
      give: { Bounty: null },
    });
    assertProposalShape(funderSeat, endowBounty);

    function payOffBounty(seat) {
      atomicTransfer(zcf, funderSeat, seat, {
        Bounty: funderSeat.getCurrentAllocation().Bounty,
      });
      seat.exit();
      funderSeat.exit();
      zcf.shutdown('bounty was paid');
    }

    function refundBounty(seat) {
      // funds are already allocated.
      seat.exit();
      funderSeat.exit();
      zcf.shutdown('The bounty was not earned');
    }

    /** @type {(bountySeat: ZCFSeat) => void} */
    function beneficiary(bountySeat) {
      const feeProposal = harden({
        give: { Fee: null },
      });
      assertProposalShape(bountySeat, feeProposal);
      const feeAmount = bountySeat.getCurrentAllocation().Fee;
      AmountMath.isGTE(feeAmount, fee) ||
        assert.fail(X`Fee was required to be at least ${fee}`);

      // The funder gets the fee regardless of the outcome.
      atomicTransfer(zcf, bountySeat, funderSeat, {
        Fee: feeAmount,
      });

      const wakeHandler = Far('wakeHandler', {
        wake: async () => {
          const reply = await E(oracle).query('state');
          if (reply.event === condition) {
            payOffBounty(bountySeat);
          } else {
            refundBounty(bountySeat);
          }
        },
      });
      timer.setWakeup(deadline, wakeHandler);
    }

    return zcf.makeInvitation(beneficiary, 'pay to be the beneficiary');
  }

  const creatorInvitation = zcf.makeInvitation(funder, 'fund a bounty');
  return harden({ creatorInvitation });
};

harden(start);
export { start };
