import { AmountMath, AmountShape, RatioShape } from '@agoric/ertp';
import {
  fromOnly,
  toOnly,
  makeRecorderTopic,
  RecorderKitShape,
  TopicsRecordShape,
} from '@agoric/zoe/src/contractSupport/index.js';
import { SeatShape } from '@agoric/zoe/src/typeGuards.js';
import { M } from '@endo/patterns';
import { Fail, q } from '@endo/errors';
import { TransferPartShape } from '@agoric/zoe/src/contractSupport/atomicTransfer.js';
import {
  borrowCalc,
  checkPoolBalance,
  depositCalc,
  makeParity,
  repayCalc,
  withdrawCalc,
} from '../pool-share-math.js';
import {
  makeNatAmountShape,
  makeProposalShapes,
  PoolMetricsShape,
} from '../type-guards.js';

/**
 * @import {Amount, Brand, Payment} from '@agoric/ertp';
 * @import {Zone} from '@agoric/zone';
 * @import {Remote} from '@agoric/internal'
 * @import {StorageNode} from '@agoric/internal/src/lib-chainStorage.js'
 * @import {MakeRecorderKit} from '@agoric/zoe/src/contractSupport/recorder.js'
 * @import {USDCProposalShapes, ShareWorth} from '../pool-share-math.js'
 * @import {PoolStats} from '../types.js';
 */

const { add, isGTE, makeEmpty } = AmountMath;

/**
 * @typedef {{
 *  Principal: Amount<'nat'>;
 *  PoolFee: Amount<'nat'>;
 *  ContractFee: Amount<'nat'>;
 * }} RepayAmountKWR
 */

/**
 * @typedef {{
 *  Principal: Payment<'nat'>;
 *  PoolFee: Payment<'nat'>;
 *  ContractFee: Payment<'nat'>;
 * }} RepayPaymentKWR
 */

export const stateShape = harden({
  encumberedBalance: AmountShape,
  feeSeat: M.remotable(),
  poolStats: M.record(),
  poolMetricsRecorderKit: RecorderKitShape,
  poolSeat: M.remotable(),
  PoolShares: M.remotable(),
  proposalShapes: {
    deposit: M.pattern(),
    withdraw: M.pattern(),
    withdrawFees: M.pattern(),
  },
  shareMint: M.remotable(),
  shareWorth: RatioShape,
});

/**
 * @param {Zone} zone
 * @param {ZCF} zcf
 * @param {Brand<'nat'>} USDC
 * @param {{
 *   makeRecorderKit: MakeRecorderKit;
 * }} tools
 */
export const prepareLiquidityPoolKit = (zone, zcf, USDC, tools) => {
  return zone.exoClassKit(
    'Liquidity Pool',
    {
      borrower: M.interface('borrower', {
        borrow: M.call(SeatShape, makeNatAmountShape(USDC, 1n)).returns(),
        returnToPool: M.call(SeatShape, makeNatAmountShape(USDC, 1n)).returns(),
      }),
      repayer: M.interface('repayer', {
        repay: M.call(
          TransferPartShape,
          harden({
            Principal: makeNatAmountShape(USDC, 1n),
            PoolFee: makeNatAmountShape(USDC, 0n),
            ContractFee: makeNatAmountShape(USDC, 0n),
          }),
        ).returns(),
      }),
      external: M.interface('external', {
        publishPoolMetrics: M.call().returns(),
      }),
      depositHandler: M.interface('depositHandler', {
        handle: M.call(SeatShape, M.any()).returns(M.promise()),
      }),
      withdrawHandler: M.interface('withdrawHandler', {
        handle: M.call(SeatShape, M.any()).returns(M.promise()),
      }),
      withdrawFeesHandler: M.interface('withdrawFeesHandler', {
        handle: M.call(SeatShape, M.any()).returns(M.promise()),
      }),
      public: M.interface('public', {
        makeDepositInvitation: M.call().returns(M.promise()),
        makeWithdrawInvitation: M.call().returns(M.promise()),
        getPublicTopics: M.call().returns(TopicsRecordShape),
      }),
      feeRecipient: M.interface('feeRecipient', {
        getContractFeeBalance: M.call().returns(AmountShape),
        makeWithdrawFeesInvitation: M.call().returns(M.promise()),
      }),
    },
    /**
     * @param {ZCFMint<'nat'>} shareMint
     * @param {Remote<StorageNode>} node
     */
    (shareMint, node) => {
      const { brand: PoolShares } = shareMint.getIssuerRecord();
      const proposalShapes = makeProposalShapes({ USDC, PoolShares });
      const shareWorth = makeParity(USDC, PoolShares);
      const { zcfSeat: poolSeat } = zcf.makeEmptySeatKit();
      const { zcfSeat: feeSeat } = zcf.makeEmptySeatKit();
      const poolMetricsRecorderKit = tools.makeRecorderKit(
        node,
        PoolMetricsShape,
      );
      const encumberedBalance = makeEmpty(USDC);
      /** @type {PoolStats} */
      const poolStats = harden({
        totalBorrows: makeEmpty(USDC),
        totalContractFees: makeEmpty(USDC),
        totalPoolFees: makeEmpty(USDC),
        totalRepays: makeEmpty(USDC),
      });
      return {
        /** used for `checkPoolBalance` invariant. aka 'outstanding borrows' */
        encumberedBalance,
        feeSeat,
        poolStats,
        poolMetricsRecorderKit,
        poolSeat,
        PoolShares,
        proposalShapes,
        shareMint,
        shareWorth,
      };
    },
    {
      borrower: {
        /**
         * @param {ZCFSeat} toSeat
         * @param {Amount<'nat'>} amount
         */
        borrow(toSeat, amount) {
          const { encumberedBalance, poolSeat, poolStats } = this.state;

          // Validate amount is available in pool
          const post = borrowCalc(
            amount,
            poolSeat.getAmountAllocated('USDC', USDC),
            encumberedBalance,
            poolStats,
          );

          // COMMIT POINT
          // UNTIL #10684: ability to terminate an incarnation w/o terminating the contract
          zcf.atomicRearrange(harden([[poolSeat, toSeat, { USDC: amount }]]));

          Object.assign(this.state, post);
          this.facets.external.publishPoolMetrics();
        },
        /**
         * If something fails during advance, return funds to the pool.
         *
         * @param {ZCFSeat} borrowSeat
         * @param {Amount<'nat'>} amount
         */
        returnToPool(borrowSeat, amount) {
          const returnAmounts = harden({
            Principal: amount,
            PoolFee: makeEmpty(USDC),
            ContractFee: makeEmpty(USDC),
          });
          const borrowSeatAllocation = borrowSeat.getCurrentAllocation();
          isGTE(borrowSeatAllocation.USDC, amount) ||
            Fail`⚠️ borrowSeatAllocation ${q(borrowSeatAllocation)} less than amountKWR ${q(amount)}`;

          const transferSourcePart = fromOnly(borrowSeat, { USDC: amount });
          this.facets.repayer.repay(transferSourcePart, returnAmounts);
          borrowSeat.exit();
        },
      },
      repayer: {
        /**
         * @param {TransferPart} sourceTransfer
         * @param {RepayAmountKWR} split
         */
        repay(sourceTransfer, split) {
          const {
            encumberedBalance,
            feeSeat,
            poolSeat,
            poolStats,
            shareWorth,
          } = this.state;
          checkPoolBalance(
            poolSeat.getCurrentAllocation(),
            shareWorth,
            encumberedBalance,
          );
          // Validate Principal <= encumberedBalance and produce poolStats after
          const post = repayCalc(
            shareWorth,
            split,
            encumberedBalance,
            poolStats,
          );

          // COMMIT POINT
          // UNTIL #10684: ability to terminate an incarnation w/o terminating the contract
          zcf.atomicRearrange(
            harden([
              sourceTransfer,
              toOnly(poolSeat, { USDC: add(split.PoolFee, split.Principal) }),
              toOnly(feeSeat, { USDC: split.ContractFee }),
            ]),
          );

          Object.assign(this.state, post);
          this.facets.external.publishPoolMetrics();
        },
      },
      external: {
        publishPoolMetrics() {
          const { poolStats, shareWorth, encumberedBalance } = this.state;
          const { recorder } = this.state.poolMetricsRecorderKit;
          // Consumers of this .write() are off-chain / outside the VM.
          // And there's no way to recover from a failed write.
          // So don't await.
          void recorder.write({
            encumberedBalance,
            shareWorth,
            ...poolStats,
          });
        },
      },

      depositHandler: {
        /** @param {ZCFSeat} lp */
        async handle(lp) {
          const { shareWorth, shareMint, poolSeat, encumberedBalance } =
            this.state;
          const { external } = this.facets;

          /** @type {USDCProposalShapes['deposit']} */
          // @ts-expect-error ensured by proposalShape
          const proposal = lp.getProposal();
          checkPoolBalance(
            poolSeat.getCurrentAllocation(),
            shareWorth,
            encumberedBalance,
          );
          const post = depositCalc(shareWorth, proposal);

          // COMMIT POINT
          const mint = shareMint.mintGains(post.payouts);
          try {
            this.state.shareWorth = post.shareWorth;
            zcf.atomicRearrange(
              harden([
                // zoe guarantees lp has proposal.give allocated
                [lp, poolSeat, proposal.give],
                // mintGains() above establishes that mint has post.payouts
                [mint, lp, post.payouts],
              ]),
            );
          } catch (cause) {
            // UNTIL #10684: ability to terminate an incarnation w/o terminating the contract
            throw new Error('🚨 cannot commit deposit', { cause });
          } finally {
            lp.exit();
            mint.exit();
          }
          external.publishPoolMetrics();
        },
      },
      withdrawHandler: {
        /** @param {ZCFSeat} lp */
        async handle(lp) {
          const { shareWorth, shareMint, poolSeat, encumberedBalance } =
            this.state;
          const { external } = this.facets;

          /** @type {USDCProposalShapes['withdraw']} */
          // @ts-expect-error ensured by proposalShape
          const proposal = lp.getProposal();
          const { zcfSeat: burn } = zcf.makeEmptySeatKit();
          const post = withdrawCalc(
            shareWorth,
            proposal,
            poolSeat.getCurrentAllocation(),
            encumberedBalance,
          );

          // COMMIT POINT
          try {
            this.state.shareWorth = post.shareWorth;
            zcf.atomicRearrange(
              harden([
                // zoe guarantees lp has proposal.give allocated
                [lp, burn, proposal.give],
                // checkPoolBalance() + withdrawCalc() guarantee poolSeat has enough
                [poolSeat, lp, post.payouts],
              ]),
            );
            shareMint.burnLosses(proposal.give, burn);
          } catch (cause) {
            // UNTIL #10684: ability to terminate an incarnation w/o terminating the contract
            throw new Error('🚨 cannot commit withdraw', { cause });
          } finally {
            lp.exit();
            burn.exit();
          }
          external.publishPoolMetrics();
        },
      },
      withdrawFeesHandler: {
        /** @param {ZCFSeat} seat */
        async handle(seat) {
          const { feeSeat } = this.state;

          const { want } = seat.getProposal();
          const available = feeSeat.getAmountAllocated('USDC', want.USDC.brand);
          isGTE(available, want.USDC) ||
            Fail`cannot withdraw ${want.USDC}; only ${available} available`;

          // COMMIT POINT
          zcf.atomicRearrange(harden([[feeSeat, seat, want]]));
          seat.exit();
        },
      },
      public: {
        makeDepositInvitation() {
          return zcf.makeInvitation(
            this.facets.depositHandler,
            'Deposit',
            undefined,
            this.state.proposalShapes.deposit,
          );
        },
        makeWithdrawInvitation() {
          return zcf.makeInvitation(
            this.facets.withdrawHandler,
            'Withdraw',
            undefined,
            this.state.proposalShapes.withdraw,
          );
        },
        getPublicTopics() {
          const { poolMetricsRecorderKit } = this.state;
          return {
            poolMetrics: makeRecorderTopic(
              'poolMetrics',
              poolMetricsRecorderKit,
            ),
          };
        },
      },
      feeRecipient: {
        getContractFeeBalance() {
          const { feeSeat } = this.state;
          /** @type {Amount<'nat'>} */
          const balance = feeSeat.getCurrentAllocation().USDC;
          return balance;
        },
        makeWithdrawFeesInvitation() {
          return zcf.makeInvitation(
            this.facets.withdrawFeesHandler,
            'Withdraw Fees',
            undefined,
            this.state.proposalShapes.withdrawFees,
          );
        },
      },
    },
    {
      finish: ({ facets: { external } }) => {
        void external.publishPoolMetrics();
      },
      stateShape,
    },
  );
};
harden(prepareLiquidityPoolKit);

/**
 * @typedef {ReturnType<ReturnType<typeof prepareLiquidityPoolKit>>} LiquidityPoolKit
 */
