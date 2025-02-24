import { decodeAddressHook } from '@agoric/cosmic-proto/address-hooks.js';
import { AmountMath } from '@agoric/ertp';
import { assertAllDefined, makeTracer } from '@agoric/internal';
import { AnyNatAmountShape, ChainAddressShape } from '@agoric/orchestration';
import { pickFacet } from '@agoric/vat-data';
import { VowShape } from '@agoric/vow';
import { E } from '@endo/far';
import { M, mustMatch } from '@endo/patterns';
import { Fail, q } from '@endo/errors';
import {
  AddressHookShape,
  EvmHashShape,
  EvidenceWithRiskShape,
} from '../type-guards.js';
import { makeFeeTools } from '../utils/fees.js';

/**
 * @import {HostInterface} from '@agoric/async-flow';
 * @import {Amount, Brand} from '@agoric/ertp';
 * @import {TypedPattern} from '@agoric/internal'
 * @import {NatAmount} from '@agoric/ertp';
 * @import {ChainAddress, ChainHub, Denom, OrchestrationAccount} from '@agoric/orchestration';
 * @import {ZoeTools} from '@agoric/orchestration/src/utils/zoe-tools.js';
 * @import {VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {AddressHook, EvmHash, FeeConfig, LogFn, NobleAddress, EvidenceWithRisk} from '../types.js';
 * @import {StatusManager} from './status-manager.js';
 * @import {LiquidityPoolKit} from './liquidity-pool.js';
 */

/**
 * @typedef {{
 *  chainHub: ChainHub;
 *  feeConfig: FeeConfig;
 *  log?: LogFn;
 *  statusManager: StatusManager;
 *  usdc: { brand: Brand<'nat'>; denom: Denom; };
 *  vowTools: VowTools;
 *  zcf: ZCF;
 *  zoeTools: ZoeTools;
 * }} AdvancerKitPowers
 */

/** @type {TypedPattern<AdvancerVowCtx>} */
const AdvancerVowCtxShape = M.splitRecord(
  {
    fullAmount: AnyNatAmountShape,
    advanceAmount: AnyNatAmountShape,
    destination: ChainAddressShape,
    forwardingAddress: M.string(),
    txHash: EvmHashShape,
    toIntermediate: M.opt(M.boolean()),
  },
  { tmpSeat: M.remotable() },
);

/** type guards internal to the AdvancerKit */
const AdvancerKitI = harden({
  advancer: M.interface('AdvancerI', {
    handleTransactionEvent: M.callWhen(EvidenceWithRiskShape).returns(),
    setIntermediateRecipient: M.call(ChainAddressShape).returns(),
  }),
  depositHandler: M.interface('DepositHandlerI', {
    onFulfilled: M.call(M.undefined(), AdvancerVowCtxShape).returns(VowShape),
    onRejected: M.call(M.error(), AdvancerVowCtxShape).returns(),
  }),
  transferHandler: M.interface('TransferHandlerI', {
    onFulfilled: M.call(M.undefined(), AdvancerVowCtxShape).returns(
      M.undefined(),
    ),
    onRejected: M.call(M.error(), AdvancerVowCtxShape).returns(M.undefined()),
  }),
  withdrawHandler: M.interface('WithdrawHandlerI', {
    onFulfilled: M.call(M.undefined(), {
      advanceAmount: AnyNatAmountShape,
      tmpReturnSeat: M.remotable(),
    }).returns(M.undefined()),
    onRejected: M.call(M.error(), {
      advanceAmount: AnyNatAmountShape,
      tmpReturnSeat: M.remotable(),
    }).returns(M.undefined()),
  }),
});

/**
 * Address hooks only deal in strings, so see if we can parse
 * chainId to an integer.
 * @param {string} chainId
 */
const formatChainId = chainId => {
  const asInt = parseInt(chainId, 10);
  return !Number.isNaN(asInt) ? asInt : chainId;
};

/**
 * @typedef {{
 *  fullAmount: NatAmount;
 *  advanceAmount: NatAmount;
 *  destination: ChainAddress;
 *  forwardingAddress: NobleAddress;
 *  txHash: EvmHash;
 *  toIntermediate?: boolean;
 * }} AdvancerVowCtx
 */

/**
 * @typedef {{
 *   notifier: import('./settler.js').SettlerKit['notifier'];
 *   borrower: LiquidityPoolKit['borrower'];
 *   poolAccount: HostInterface<OrchestrationAccount<{chainId: 'agoric'}>>;
 *   settlementAddress: ChainAddress;
 *   intermediateRecipientAddress?: ChainAddress;
 * }} AdvancerConfig
 */

/** @typedef {AdvancerConfig & { intermediateRecipient: OrchestrationAccount<{chainId: 'noble-1'}> | undefined }} AdvancerState */

export const stateShape = harden({
  notifier: M.remotable(),
  borrower: M.remotable(),
  poolAccount: M.remotable(),
  intermediateRecipient: M.opt(M.remotable()),
  intermediateRecipientAddress: M.opt(ChainAddressShape),
  settlementAddress: M.opt(ChainAddressShape),
});

/**
 * @param {Zone} zone
 * @param {AdvancerKitPowers} caps
 */
export const prepareAdvancerKit = (
  zone,
  {
    chainHub,
    feeConfig,
    log = makeTracer('Advancer', true),
    statusManager,
    usdc,
    vowTools: { watch, when },
    zcf,
    zoeTools: { localTransfer, withdrawToSeat },
  },
) => {
  assertAllDefined({
    chainHub,
    feeConfig,
    statusManager,
    watch,
    when,
  });
  const feeTools = makeFeeTools(feeConfig);
  /** @param {bigint} value */
  const toAmount = value => AmountMath.make(usdc.brand, value);

  return zone.exoClassKit(
    'Fast USDC Advancer',
    AdvancerKitI,
    /**
     * @param {AdvancerConfig} config
     */
    config =>
      /** @type {AdvancerState}*/ (
        harden({
          ...config,
          intermediateRecipient: undefined,
          // make sure the state record has this property, perhaps with an undefined value
          intermediateRecipientAddress: config.intermediateRecipientAddress,
        })
      ),
    {
      advancer: {
        /**
         * Must perform a status update for every observed transaction.
         *
         * We do not expect any callers to depend on the settlement of
         * `handleTransactionEvent` - errors caught are communicated to the
         * `StatusManager` - so we don't need to concern ourselves with
         * preserving the vow chain for callers.
         *
         * @param {EvidenceWithRisk} evidenceWithRisk
         */
        async handleTransactionEvent({ evidence, risk }) {
          await null;
          try {
            if (statusManager.hasBeenObserved(evidence)) {
              log('txHash already seen:', evidence.txHash);
              return;
            }

            if (risk.risksIdentified?.length) {
              log('risks identified, skipping advance');
              statusManager.skipAdvance(evidence, risk.risksIdentified);
              return;
            }
            const { settlementAddress } = this.state;
            const { recipientAddress } = evidence.aux;
            const decoded = decodeAddressHook(recipientAddress);
            mustMatch(decoded, AddressHookShape);
            if (decoded.baseAddress !== settlementAddress.value) {
              throw Fail`⚠️ baseAddress of address hook ${q(decoded.baseAddress)} does not match the expected address ${q(settlementAddress.value)}`;
            }
            const { EUD, CID } = /** @type {AddressHook['query']} */ (
              decoded.query
            );
            log(`decoded EUD: ${EUD}, CID: ${CID}`);

            const destination = CID
              ? harden({
                  value: EUD,
                  chainId: formatChainId(CID),
                  // note: omitting encoding
                })
              : // only works for bech32 addrs; throws if prefix is not found in ChainHub
                chainHub.makeChainAddress(EUD);

            const fullAmount = toAmount(evidence.tx.amount);
            const { borrower, notifier, poolAccount } = this.state;
            // do not advance if we've already received a mint/settlement
            const mintedEarly = notifier.checkMintedEarly(
              evidence,
              destination,
            );
            if (mintedEarly) return;

            // throws if requested does not exceed fees
            const advanceAmount = feeTools.calculateAdvance(fullAmount);

            const { zcfSeat: tmpSeat } = zcf.makeEmptySeatKit();
            // throws if the pool has insufficient funds
            borrower.borrow(tmpSeat, advanceAmount);

            // this cannot throw since `.isSeen()` is called in the same turn
            statusManager.advance(evidence);

            const depositV = localTransfer(
              tmpSeat,
              // @ts-expect-error LocalAccountMethods vs OrchestrationAccount
              poolAccount,
              harden({ USDC: advanceAmount }),
            );
            void watch(depositV, this.facets.depositHandler, {
              advanceAmount,
              destination,
              forwardingAddress: evidence.tx.forwardingAddress,
              fullAmount,
              tmpSeat,
              txHash: evidence.txHash,
            });
          } catch (error) {
            log('Advancer error:', error);
            statusManager.skipAdvance(evidence, [error.message]);
          }
        },
        /** 
         * @param {OrchestrationAccount<{chainId: 'noble-1'}>} intermediateRecipient
          @param {ChainAddress} intermediateRecipientAddress */
        setIntermediateRecipient(
          intermediateRecipient,
          intermediateRecipientAddress,
        ) {
          this.state.intermediateRecipient = intermediateRecipient;
          this.state.intermediateRecipientAddress =
            intermediateRecipientAddress;
        },
      },
      depositHandler: {
        /**
         * @param {undefined} result
         * @param {AdvancerVowCtx & { tmpSeat: ZCFSeat }} ctx
         */
        onFulfilled(result, ctx) {
          const {
            poolAccount,
            intermediateRecipientAddress,
            settlementAddress,
          } = this.state;
          const { destination, advanceAmount, tmpSeat, ...detail } = ctx;
          tmpSeat.exit();
          const amount = harden({
            denom: usdc.denom,
            value: advanceAmount.value,
          });

          // TODO: use destination.chainId to determine if non-cosmos/ibc from ChainInfo
          // either: ecosystem: 'evm', 'solana', 'cosmos' etc, or maybe assert connections.length?
          // use absence of encoding: 'bech32' for now
          const toIntermediate = destination.encoding !== 'bech32';

          if (!intermediateRecipientAddress)
            throw Fail`no 'intermediateRecipientAddress' found`;
          const transferDest = toIntermediate
            ? intermediateRecipientAddress
            : destination;

          /**
           * To agoric (`type: local`): use bank/Send
           * To `type:cosmos`: use .transfer to EUD (PFM might be autogen'ed)
           * To `type:evm|cosmos`: 1) use .transfer to NobleICA (intermediateRecipient, or a new ICA?)
           * and 2) call depositForBurn with EUD as destination
           */
          const transferOrSendV =
            destination.chainId === settlementAddress.chainId
              ? E(poolAccount).send(destination, amount)
              : E(poolAccount).transfer(transferDest, amount, {
                  forwardOpts: {
                    intermediateRecipient: intermediateRecipientAddress,
                  },
                });

          return watch(transferOrSendV, this.facets.transferHandler, {
            destination,
            advanceAmount,
            ...detail,
            // something to indicate we need to call depositForBurn
            toIntermediate,
          });
        },
        /**
         * We do not expect this to be a common failure. it should only occur
         * if USDC is not registered in vbank or the tmpSeat has less than
         * `advanceAmount`.
         *
         * If we do hit this path, we return funds to the Liquidity Pool and
         * notify of Advancing failure.
         *
         * @param {Error} error
         * @param {AdvancerVowCtx & { tmpSeat: ZCFSeat }} ctx
         */
        onRejected(error, { tmpSeat, advanceAmount, ...restCtx }) {
          log(
            '⚠️ deposit to localOrchAccount failed, attempting to return payment to LP',
            error,
          );
          try {
            const { borrower, notifier } = this.state;
            notifier.notifyAdvancingResult(restCtx, false);
            borrower.returnToPool(tmpSeat, advanceAmount);
            tmpSeat.exit();
          } catch (e) {
            log('🚨 deposit to localOrchAccount failure recovery failed', e);
          }
        },
      },
      transferHandler: {
        /**
         * @param {undefined} result
         * @param {AdvancerVowCtx} ctx
         */
        onFulfilled(result, ctx) {
          const { intermediateRecipient, notifier } = this.state;
          const { advanceAmount, destination, toIntermediate, ...detail } = ctx;
          if (toIntermediate) {
            if (!intermediateRecipient)
              throw Fail`no 'intermediateRecipient' found`;
            const depositForBurnV = E(intermediateRecipient).depositForBurn(
              destination,
              harden({ denom: 'uusdc', value: advanceAmount.value }),
            );
            return watch(
              depositForBurnV,
              // TODO: worth a separate Settler handler, as $ won't be in the advancer account?
              this.facets.transferHandler,
              {
                ...ctx,
                toIntermediate: false, // so we don't call depositForBurn twice
              },
            );
          }
          log('Advance succeeded', { advanceAmount, destination });
          // During development, due to a bug, this call threw.
          // The failure was silent (no diagnostics) due to:
          //  - #10576 Vows do not report unhandled rejections
          // For now, the advancer kit relies on consistency between
          // notify, statusManager, and callers of handleTransactionEvent().
          // TODO: revisit #10576 during #10510
          notifier.notifyAdvancingResult({ destination, ...detail }, true);
        },
        /**
         * @param {Error} error
         * @param {AdvancerVowCtx} ctx
         */
        onRejected(error, ctx) {
          const { notifier, poolAccount } = this.state;
          log('Advance failed', error);
          const { advanceAmount, ...restCtx } = ctx;
          notifier.notifyAdvancingResult(restCtx, false);
          const { zcfSeat: tmpReturnSeat } = zcf.makeEmptySeatKit();
          const withdrawV = withdrawToSeat(
            // @ts-expect-error LocalAccountMethods vs OrchestrationAccount
            poolAccount,
            tmpReturnSeat,
            harden({ USDC: advanceAmount }),
          );
          void watch(withdrawV, this.facets.withdrawHandler, {
            advanceAmount,
            tmpReturnSeat,
          });
        },
      },
      withdrawHandler: {
        /**
         *
         * @param {undefined} result
         * @param {{ advanceAmount: Amount<'nat'>; tmpReturnSeat: ZCFSeat; }} ctx
         */
        onFulfilled(result, { advanceAmount, tmpReturnSeat }) {
          const { borrower } = this.state;
          try {
            borrower.returnToPool(tmpReturnSeat, advanceAmount);
          } catch (e) {
            // If we reach here, the unused advance funds will remain in `tmpReturnSeat`
            // and must be retrieved from recovery sets.
            log(
              `🚨 return ${q(advanceAmount)} to pool failed. funds remain on "tmpReturnSeat"`,
              e,
            );
          }
          tmpReturnSeat.exit();
        },
        /**
         * @param {Error} error
         * @param {{ advanceAmount: Amount<'nat'>; tmpReturnSeat: ZCFSeat; }} ctx
         */
        onRejected(error, { advanceAmount, tmpReturnSeat }) {
          log(
            `🚨 withdraw ${q(advanceAmount)} from "poolAccount" to return to pool failed`,
            error,
          );
          // If we reach here, the unused advance funds will remain in the `poolAccount`.
          // A contract update will be required to return them to the LiquidityPool.
          tmpReturnSeat.exit();
        },
      },
    },
    {
      stateShape,
    },
  );
};
harden(prepareAdvancerKit);

/**
 * @param {Zone} zone
 * @param {AdvancerKitPowers} caps
 */
export const prepareAdvancer = (zone, caps) => {
  const makeAdvancerKit = prepareAdvancerKit(zone, caps);
  return pickFacet(makeAdvancerKit, 'advancer');
};
harden(prepareAdvancer);
