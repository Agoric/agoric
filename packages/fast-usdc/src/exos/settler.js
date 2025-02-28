import { AmountMath } from '@agoric/ertp';
import { assertAllDefined, makeTracer } from '@agoric/internal';
import { CosmosChainAddressShape } from '@agoric/orchestration';
import { atob } from '@endo/base64';
import { E } from '@endo/far';
import { M } from '@endo/patterns';

import { decodeAddressHook } from '@agoric/cosmic-proto/address-hooks.js';
import { PendingTxStatus } from '../constants.js';
import { makeFeeTools } from '../utils/fees.js';
import {
  CctpTxEvidenceShape,
  EvmHashShape,
  makeNatAmountShape,
} from '../type-guards.js';
import { asMultiset } from '../utils/store.js';

/**
 * @import {FungibleTokenPacketData} from '@agoric/cosmic-proto/ibc/applications/transfer/v2/packet.js';
 * @import {Amount, Brand, NatValue, Payment} from '@agoric/ertp';
 * @import {AccountId, Denom, OrchestrationAccount, ChainHub, CosmosChainAddress} from '@agoric/orchestration';
 * @import {WithdrawToSeat} from '@agoric/orchestration/src/utils/zoe-tools'
 * @import {IBCChannelID, IBCPacket, VTransferIBCEvent} from '@agoric/vats';
 * @import {Zone} from '@agoric/zone';
 * @import {HostOf, HostInterface} from '@agoric/async-flow';
 * @import {TargetRegistration} from '@agoric/vats/src/bridge-target.js';
 * @import {NobleAddress, LiquidityPoolKit, FeeConfig, EvmHash, LogFn, CctpTxEvidence} from '../types.js';
 * @import {StatusManager} from './status-manager.js';
 */

/**
 * @param {IBCPacket} data
 * @param {string} remoteDenom
 * @returns {{ nfa: NobleAddress, amount: bigint, EUD: string } | {error: object[]}}
 */
const decodeEventPacket = ({ data }, remoteDenom) => {
  // NB: may not be a FungibleTokenPacketData or even JSON
  /** @type {FungibleTokenPacketData} */
  let tx;
  try {
    tx = JSON.parse(atob(data));
  } catch (e) {
    return { error: ['could not parse packet data', data] };
  }

  // given the sourceChannel check, we can be certain of this cast
  const nfa = /** @type {NobleAddress} */ (tx.sender);

  if (tx.denom !== remoteDenom) {
    const { denom: actual } = tx;
    return { error: ['unexpected denom', { actual, expected: remoteDenom }] };
  }

  let EUD;
  try {
    ({ EUD } = decodeAddressHook(tx.receiver).query);
    if (!EUD) {
      return { error: ['no EUD parameter', tx.receiver] };
    }
    if (typeof EUD !== 'string') {
      return { error: ['EUD is not a string', EUD] };
    }
  } catch (e) {
    return { error: ['no query params', tx.receiver] };
  }

  let amount;
  try {
    amount = BigInt(tx.amount);
  } catch (e) {
    return { error: ['invalid amount', tx.amount] };
  }

  return { nfa, amount, EUD };
};
harden(decodeEventPacket);

/**
 * NOTE: not meant to be parsable.
 *
 * @param {NobleAddress} addr
 * @param {bigint} amount
 */
const makeMintedEarlyKey = (addr, amount) =>
  `pendingTx:${JSON.stringify([addr, String(amount)])}`;

/** @param {Brand<'nat'>} USDC */
export const makeAdvanceDetailsShape = USDC =>
  harden({
    destination: CosmosChainAddressShape,
    forwardingAddress: M.string(),
    fullAmount: makeNatAmountShape(USDC),
    txHash: EvmHashShape,
  });

export const stateShape = harden({
  repayer: M.remotable('Repayer'),
  settlementAccount: M.remotable('Account'),
  registration: M.or(M.undefined(), M.remotable('Registration')),
  sourceChannel: M.string(),
  remoteDenom: M.string(),
  mintedEarly: M.remotable('mintedEarly'),
  intermediateRecipient: M.opt(CosmosChainAddressShape),
});

/**
 * @param {Zone} zone
 * @param {object} caps
 * @param {StatusManager} caps.statusManager
 * @param {Brand<'nat'>} caps.USDC
 * @param {Pick<ZCF, 'makeEmptySeatKit' | 'atomicRearrange'>} caps.zcf
 * @param {FeeConfig} caps.feeConfig
 * @param {HostOf<WithdrawToSeat>} caps.withdrawToSeat
 * @param {import('@agoric/vow').VowTools} caps.vowTools
 * @param {ChainHub} caps.chainHub
 * @param {LogFn} [caps.log]
 */
export const prepareSettler = (
  zone,
  {
    chainHub,
    feeConfig,
    log = makeTracer('Settler', true),
    statusManager,
    USDC,
    vowTools,
    withdrawToSeat,
    zcf,
  },
) => {
  assertAllDefined({ statusManager });
  return zone.exoClassKit(
    'Fast USDC Settler',
    {
      creator: M.interface('SettlerCreatorI', {
        monitorMintingDeposits: M.callWhen().returns(M.any()),
        setIntermediateRecipient: M.call(CosmosChainAddressShape).returns(),
      }),
      tap: M.interface('SettlerTapI', {
        receiveUpcall: M.call(M.record()).returns(M.promise()),
      }),
      notifier: M.interface('SettlerNotifyI', {
        notifyAdvancingResult: M.call(
          makeAdvanceDetailsShape(USDC),
          M.boolean(),
        ).returns(),
        checkMintedEarly: M.call(
          CctpTxEvidenceShape,
          CosmosChainAddressShape,
        ).returns(M.boolean()),
      }),
      self: M.interface('SettlerSelfI', {
        addMintedEarly: M.call(M.string(), M.nat()).returns(),
        disburse: M.call(EvmHashShape, M.nat()).returns(M.promise()),
        forward: M.call(EvmHashShape, M.nat(), M.string()).returns(),
      }),
      transferHandler: M.interface('SettlerTransferI', {
        onFulfilled: M.call(M.undefined(), M.string()).returns(),
        onRejected: M.call(M.error(), M.string()).returns(),
      }),
    },
    /**
     * @param {{
     *   sourceChannel: IBCChannelID;
     *   remoteDenom: Denom;
     *   repayer: LiquidityPoolKit['repayer'];
     *   settlementAccount: HostInterface<OrchestrationAccount<{ chainId: 'agoric' }>>
     *   intermediateRecipient?: CosmosChainAddress;
     * }} config
     */
    config => {
      log('config', config);
      return {
        ...config,
        // make sure the state record has this property, perhaps with an undefined value
        intermediateRecipient: config.intermediateRecipient,
        /** @type {HostInterface<TargetRegistration>|undefined} */
        registration: undefined,
        /** @type {MapStore<ReturnType<typeof makeMintedEarlyKey>, number>} */
        mintedEarly: zone.detached().mapStore('mintedEarly'),
      };
    },
    {
      creator: {
        async monitorMintingDeposits() {
          const { settlementAccount } = this.state;
          const registration = await vowTools.when(
            settlementAccount.monitorTransfers(this.facets.tap),
          );
          assert.typeof(registration, 'object');
          this.state.registration = registration;
        },
        /** @param {CosmosChainAddress} intermediateRecipient */
        setIntermediateRecipient(intermediateRecipient) {
          this.state.intermediateRecipient = intermediateRecipient;
        },
      },
      tap: {
        /** @param {VTransferIBCEvent} event */
        async receiveUpcall(event) {
          log('upcall event', event.packet.sequence, event.blockTime);
          const { sourceChannel, remoteDenom } = this.state;
          const { packet } = event;
          if (packet.source_channel !== sourceChannel) {
            const { source_channel: actual } = packet;
            log('unexpected channel', { actual, expected: sourceChannel });
            return;
          }

          const decoded = decodeEventPacket(event.packet, remoteDenom);
          if ('error' in decoded) {
            log('invalid event packet', decoded.error);
            return;
          }

          const { nfa, amount, EUD } = decoded;
          const { self } = this.facets;
          const found = statusManager.dequeueStatus(nfa, amount);
          log('dequeued', found, 'for', nfa, amount);
          switch (found?.status) {
            case PendingTxStatus.Advanced:
              return self.disburse(found.txHash, amount);

            case PendingTxStatus.Advancing:
              log('⚠️ tap: minted while advancing', nfa, amount);
              self.addMintedEarly(nfa, amount);
              return;

            case PendingTxStatus.Observed:
            case PendingTxStatus.AdvanceSkipped:
            case PendingTxStatus.AdvanceFailed:
              return self.forward(found.txHash, amount, EUD);

            case undefined:
            default:
              log('⚠️ tap: minted before observed', nfa, amount);
              // XXX consider capturing in vstorage
              // we would need a new key, as this does not have a txHash
              self.addMintedEarly(nfa, amount);
          }
        },
      },
      notifier: {
        /**
         * @param {object} ctx
         * @param {EvmHash} ctx.txHash
         * @param {NobleAddress} ctx.forwardingAddress
         * @param {Amount<'nat'>} ctx.fullAmount
         * @param {CosmosChainAddress} ctx.destination
         * @param {boolean} success
         * @returns {void}
         */
        notifyAdvancingResult(
          { txHash, forwardingAddress, fullAmount, destination },
          success,
        ) {
          const { mintedEarly } = this.state;
          const { value: fullValue } = fullAmount;
          const key = makeMintedEarlyKey(forwardingAddress, fullValue);
          if (mintedEarly.has(key)) {
            asMultiset(mintedEarly).remove(key);
            statusManager.advanceOutcomeForMintedEarly(txHash, success);
            if (success) {
              void this.facets.self.disburse(txHash, fullValue);
            } else {
              void this.facets.self.forward(
                txHash,
                fullValue,
                destination.value,
              );
            }
          } else {
            statusManager.advanceOutcome(forwardingAddress, fullValue, success);
          }
        },
        /**
         * @param {CctpTxEvidence} evidence
         * @param {CosmosChainAddress} destination
         * @returns {boolean}
         * @throws {Error} if minted early, so advancer doesn't advance
         */
        checkMintedEarly(evidence, destination) {
          const {
            tx: { forwardingAddress, amount },
            txHash,
          } = evidence;
          const key = makeMintedEarlyKey(forwardingAddress, amount);
          const { mintedEarly } = this.state;
          if (mintedEarly.has(key)) {
            log(
              'matched minted early key, initiating forward',
              forwardingAddress,
              amount,
            );
            asMultiset(mintedEarly).remove(key);
            statusManager.advanceOutcomeForUnknownMint(evidence);
            void this.facets.self.forward(txHash, amount, destination.value);
            return true;
          }
          return false;
        },
      },
      self: {
        /**
         * Helper function to track a minted-early transaction by incrementing or initializing its counter
         * @param {NobleAddress} address
         * @param {NatValue} amount
         */
        addMintedEarly(address, amount) {
          const key = makeMintedEarlyKey(address, amount);
          const { mintedEarly } = this.state;
          asMultiset(mintedEarly).add(key);
        },
        /**
         * @param {EvmHash} txHash
         * @param {NatValue} fullValue
         */
        async disburse(txHash, fullValue) {
          const { repayer, settlementAccount } = this.state;
          const received = AmountMath.make(USDC, fullValue);
          const { zcfSeat: settlingSeat } = zcf.makeEmptySeatKit();
          const { calculateSplit } = makeFeeTools(feeConfig);
          const split = calculateSplit(received);
          log('disbursing', split);

          // If this throws, which arguably can't occur since we don't ever
          // withdraw more than has been deposited (as denoted by
          // `FungibleTokenPacketData`), funds will remain in the
          // `settlementAccount`. A remediation can occur in a future upgrade.
          await vowTools.when(
            withdrawToSeat(
              // @ts-expect-error LocalAccountMethods vs OrchestrationAccount
              settlementAccount,
              settlingSeat,
              harden({ In: received }),
            ),
          );
          zcf.atomicRearrange(
            harden([[settlingSeat, settlingSeat, { In: received }, split]]),
          );
          repayer.repay(settlingSeat, split);
          settlingSeat.exit();

          // update status manager, marking tx `DISBURSED`
          statusManager.disbursed(txHash, split);
        },
        /**
         * @param {EvmHash} txHash
         * @param {NatValue} fullValue
         * @param {string} EUD
         */
        forward(txHash, fullValue, EUD) {
          const { settlementAccount, intermediateRecipient } = this.state;

          /** @type {AccountId | null} */
          const dest = (() => {
            try {
              return chainHub.resolveAccountId(EUD);
            } catch (e) {
              log('⚠️ forward transfer failed!', e, txHash);
              statusManager.forwarded(txHash, false);
              return null;
            }
          })();
          if (!dest) return;

          const txfrV = E(settlementAccount).transfer(
            dest,
            AmountMath.make(USDC, fullValue),
            { forwardOpts: { intermediateRecipient } },
          );
          void vowTools.watch(txfrV, this.facets.transferHandler, txHash);
        },
      },
      transferHandler: {
        /**
         * @param {unknown} _result
         * @param {EvmHash} txHash
         */
        onFulfilled(_result, txHash) {
          // update status manager, marking tx `FORWARDED` without fee split
          statusManager.forwarded(txHash, true);
        },
        /**
         * @param {unknown} reason
         * @param {EvmHash} txHash
         */
        onRejected(reason, txHash) {
          // funds remain in `settlementAccount` and must be recovered via a
          // contract upgrade
          log('🚨 forward transfer rejected!', reason, txHash);
          // update status manager, flagging a terminal state that needs to be
          // manual intervention or a code update to remediate
          statusManager.forwarded(txHash, false);
        },
      },
    },
    {
      stateShape,
    },
  );
};
harden(prepareSettler);

// Expose the whole kit because the contract needs `creatorFacet` and the Advancer needs `notifier`
/** @typedef {ReturnType<ReturnType<typeof prepareSettler>>} SettlerKit */
