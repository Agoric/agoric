/** @file Use-object for the owner of a staking account */
import { toRequestQueryJson } from '@agoric/cosmic-proto';
import {
  QueryBalanceRequest,
  QueryBalanceResponse,
} from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
import {
  MsgWithdrawDelegatorReward,
  MsgWithdrawDelegatorRewardResponse,
} from '@agoric/cosmic-proto/cosmos/distribution/v1beta1/tx.js';
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
  MsgUndelegateResponse,
} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/tx.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import { MsgSend } from '@agoric/cosmic-proto/cosmos/bank/v1beta1/tx.js';
import { MsgTransfer } from '@agoric/cosmic-proto/ibc/applications/transfer/v1/tx.js';
import { makeTracer } from '@agoric/internal';
import { Shape as NetworkShape } from '@agoric/network';
import { M } from '@agoric/vat-data';
import { VowShape } from '@agoric/vow';
import { decodeBase64 } from '@endo/base64';
import { Fail } from '@endo/errors';
import { E } from '@endo/far';
import {
  AmountArgShape,
  ChainAddressShape,
  DelegationShape,
  DenomAmountShape,
  IBCTransferOptionsShape,
} from '../typeGuards.js';
import { maxClockSkew, tryDecodeResponse } from '../utils/cosmos.js';
import { orchestrationAccountMethods } from '../utils/orchestrationAccount.js';
import { makeTimestampHelper } from '../utils/time.js';

/**
 * @import {HostFn} from '@agoric/async-flow';
 * @import {AmountArg, IcaAccount, ChainAddress, CosmosValidatorAddress, ICQConnection, StakingAccountActions, DenomAmount, OrchestrationAccountI, DenomArg, ChainHub, IBCConnectionInfo, IBCMsgTransferOptions} from '../types.js';
 * @import {RecorderKit, MakeRecorderKit} from '@agoric/zoe/src/contractSupport/recorder.js';
 * @import {Coin} from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
 * @import {Delegation} from '@agoric/cosmic-proto/cosmos/staking/v1beta1/staking.js';
 * @import {Remote} from '@agoric/internal';
 * @import {InvitationMakers} from '@agoric/smart-wallet/src/types.js';
 * @import {TimerService} from '@agoric/time';
 * @import {Vow, VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {ResponseQuery} from '@agoric/cosmic-proto/tendermint/abci/types.js';
 * @import {JsonSafe} from '@agoric/cosmic-proto';
 * @import {Matcher} from '@endo/patterns';
 */

const trace = makeTracer('ComosOrchestrationAccountHolder');

const { Vow$ } = NetworkShape; // TODO #9611

/**
 * @typedef {object} ComosOrchestrationAccountNotification
 * @property {ChainAddress} chainAddress
 */

/**
 * @typedef {{
 *   topicKit: RecorderKit<ComosOrchestrationAccountNotification>;
 *   account: IcaAccount;
 *   chainAddress: ChainAddress;
 *   icqConnection: ICQConnection | undefined;
 *   bondDenom: string;
 *   timer: Remote<TimerService>;
 * }} State
 */

/** @see {OrchestrationAccountI} */
export const IcaAccountHolderI = M.interface('IcaAccountHolder', {
  ...orchestrationAccountMethods,
  delegate: M.call(ChainAddressShape, AmountArgShape).returns(VowShape),
  redelegate: M.call(
    ChainAddressShape,
    ChainAddressShape,
    AmountArgShape,
  ).returns(VowShape),
  withdrawReward: M.call(ChainAddressShape).returns(
    Vow$(M.arrayOf(DenomAmountShape)),
  ),
  withdrawRewards: M.call().returns(Vow$(M.arrayOf(DenomAmountShape))),
  undelegate: M.call(M.arrayOf(DelegationShape)).returns(VowShape),
});

/** @type {{ [name: string]: [description: string, valueShape: Matcher] }} */
const PUBLIC_TOPICS = {
  account: ['Staking Account holder status', M.any()],
};

/** @type {(c: { denom: string; amount: string }) => DenomAmount} */
const toDenomAmount = c => ({ denom: c.denom, value: BigInt(c.amount) });

/**
 * @param {Zone} zone
 * @param {object} powers
 * @param {ChainHub} powers.chainHub
 * @param {MakeRecorderKit} powers.makeRecorderKit
 * @param {Remote<TimerService>} powers.timerService
 * @param {VowTools} powers.vowTools
 * @param {ZCF} powers.zcf
 */
export const prepareCosmosOrchestrationAccountKit = (
  zone,
  {
    chainHub,
    makeRecorderKit,
    timerService,
    vowTools: { watch, asVow, when, allVows },
    zcf,
  },
) => {
  const timestampHelper = makeTimestampHelper(timerService);
  const makeCosmosOrchestrationAccountKit = zone.exoClassKit(
    'Cosmos Orchestration Account Holder',
    {
      helper: M.interface('helper', {
        owned: M.call().returns(M.remotable()),
        getUpdater: M.call().returns(M.remotable()),
        amountToCoin: M.call(AmountArgShape).returns(M.record()),
      }),
      returnVoidWatcher: M.interface('returnVoidWatcher', {
        onFulfilled: M.call(M.or(M.string(), M.record()))
          .optional(M.arrayOf(M.undefined()))
          .returns(M.undefined()),
      }),
      balanceQueryWatcher: M.interface('balanceQueryWatcher', {
        onFulfilled: M.call(M.arrayOf(M.record()))
          .optional(M.arrayOf(M.undefined())) // empty context
          .returns(M.or(M.record(), M.undefined())),
      }),
      undelegateWatcher: M.interface('undelegateWatcher', {
        onFulfilled: M.call(M.string())
          .optional(M.arrayOf(M.undefined())) // empty context
          .returns(Vow$(M.promise())),
      }),
      withdrawRewardWatcher: M.interface('withdrawRewardWatcher', {
        onFulfilled: M.call(M.string())
          .optional(M.arrayOf(M.undefined())) // empty context
          .returns(M.arrayOf(DenomAmountShape)),
      }),
      transferWatcher: M.interface('transferWatcher', {
        onFulfilled: M.call([M.record(), M.nat()])
          .optional({
            destination: ChainAddressShape,
            opts: M.or(M.undefined(), IBCTransferOptionsShape),
            token: {
              denom: M.string(),
              amount: M.string(),
            },
          })
          .returns(Vow$(M.record())),
      }),
      holder: IcaAccountHolderI,
      invitationMakers: M.interface('invitationMakers', {
        Delegate: M.call(ChainAddressShape, AmountArgShape).returns(
          M.promise(),
        ),
        Redelegate: M.call(
          ChainAddressShape,
          ChainAddressShape,
          AmountArgShape,
        ).returns(M.promise()),
        WithdrawReward: M.call(ChainAddressShape).returns(M.promise()),
        Undelegate: M.call(M.arrayOf(DelegationShape)).returns(M.promise()),
        CloseAccount: M.call().returns(M.promise()),
        TransferAccount: M.call().returns(M.promise()),
        Send: M.call().returns(M.promise()),
        SendAll: M.call().returns(M.promise()),
        Transfer: M.call().returns(M.promise()),
      }),
    },
    /**
     * @param {ChainAddress} chainAddress
     * @param {string} bondDenom e.g. 'uatom'
     * @param {object} io
     * @param {IcaAccount} io.account
     * @param {Remote<StorageNode>} io.storageNode
     * @param {ICQConnection | undefined} io.icqConnection
     * @param {Remote<TimerService>} io.timer
     * @returns {State}
     */
    (chainAddress, bondDenom, io) => {
      const { storageNode, ...rest } = io;
      // must be the fully synchronous maker because the kit is held in durable state
      const topicKit = makeRecorderKit(storageNode, PUBLIC_TOPICS.account[1]);
      // TODO determine what goes in vstorage https://github.com/Agoric/agoric-sdk/issues/9066
      void E(topicKit.recorder).write('');

      return { chainAddress, bondDenom, topicKit, ...rest };
    },
    {
      helper: {
        /** @throws if this holder no longer owns the account */
        owned() {
          const { account } = this.state;
          if (!account) {
            throw Fail`Using account holder after transfer`;
          }
          return account;
        },
        getUpdater() {
          return this.state.topicKit.recorder;
        },
        /**
         * @param {AmountArg} amount
         * @returns {Coin}
         */
        amountToCoin(amount) {
          if (!('denom' in amount)) {
            // FIXME(#9211) look up values from brands
            trace('TODO #9211: handle brand', amount);
            throw Fail`Brands not currently supported.`;
          }
          return harden({
            denom: amount.denom,
            amount: String(amount.value),
          });
        },
      },
      balanceQueryWatcher: {
        /**
         * @param {JsonSafe<ResponseQuery>[]} results
         */
        onFulfilled([result]) {
          if (!result?.key) throw Fail`Error parsing result ${result}`;
          const { balance } = QueryBalanceResponse.decode(
            decodeBase64(result.key),
          );
          if (!balance) throw Fail`Result lacked balance key: ${result}`;
          return harden(toDenomAmount(balance));
        },
      },
      undelegateWatcher: {
        /**
         * @param {string} result
         */
        onFulfilled(result) {
          const response = tryDecodeResponse(
            result,
            MsgUndelegateResponse.fromProtoMsg,
          );
          trace('undelegate response', response);
          const { completionTime } = response;
          completionTime || Fail`No completion time result ${result}`;
          return watch(
            // ignore nanoseconds and just use seconds from Timestamp
            E(this.state.timer).wakeAt(completionTime.seconds + maxClockSkew),
          );
        },
      },
      /**
       * takes an array of results (from `executeEncodedTx`) and returns void
       * since we are not interested in the result
       */
      returnVoidWatcher: {
        /** @param {string | Record<string, unknown>} result */
        onFulfilled(result) {
          trace('Result', result);
          return undefined;
        },
      },
      withdrawRewardWatcher: {
        /** @param {string} result */
        onFulfilled(result) {
          const response = tryDecodeResponse(
            result,
            MsgWithdrawDelegatorRewardResponse.fromProtoMsg,
          );
          trace('withdrawReward response', response);
          const { amount: coins } = response;
          return harden(coins.map(toDenomAmount));
        },
      },
      transferWatcher: {
        /**
         * @param {[
         *   { transferChannel: IBCConnectionInfo['transferChannel'] },
         *   bigint,
         * ]} results
         * @param {{
         *   destination: ChainAddress;
         *   opts?: IBCMsgTransferOptions;
         *   token: Coin;
         * }} ctx
         */
        onFulfilled(
          [{ transferChannel }, timeoutTimestamp],
          { opts, token, destination },
        ) {
          const results = E(this.facets.helper.owned()).executeEncodedTx([
            Any.toJSON(
              MsgTransfer.toProtoMsg({
                sourcePort: transferChannel.portId,
                sourceChannel: transferChannel.channelId,
                token,
                sender: this.state.chainAddress.value,
                receiver: destination.value,
                timeoutHeight: opts?.timeoutHeight ?? {
                  revisionHeight: 0n,
                  revisionNumber: 0n,
                },
                timeoutTimestamp,
                memo: opts?.memo ?? '',
              }),
            ),
          ]);
          return watch(results, this.facets.returnVoidWatcher);
        },
      },
      invitationMakers: {
        /**
         * @param {CosmosValidatorAddress} validator
         * @param {AmountArg} amount
         */
        Delegate(validator, amount) {
          trace('Delegate', validator, amount);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(this.facets.holder.delegate(validator, amount));
          }, 'Delegate');
        },
        /**
         * @param {CosmosValidatorAddress} srcValidator
         * @param {CosmosValidatorAddress} dstValidator
         * @param {AmountArg} amount
         */
        Redelegate(srcValidator, dstValidator, amount) {
          trace('Redelegate', srcValidator, dstValidator, amount);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(
              this.facets.holder.redelegate(srcValidator, dstValidator, amount),
            );
          }, 'Redelegate');
        },
        /** @param {CosmosValidatorAddress} validator */
        WithdrawReward(validator) {
          trace('WithdrawReward', validator);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(this.facets.holder.withdrawReward(validator));
          }, 'WithdrawReward');
        },
        /** @param {Omit<Delegation, 'delegatorAddress'>[]} delegations */
        Undelegate(delegations) {
          trace('Undelegate', delegations);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(this.facets.holder.undelegate(delegations));
          }, 'Undelegate');
        },
        CloseAccount() {
          throw Error('not yet implemented');
        },
        Send() {
          /**
           * @type {OfferHandler<
           *   Vow<void>,
           *   { toAccount: ChainAddress; amount: AmountArg }
           * >}
           */
          const offerHandler = (seat, { toAccount, amount }) => {
            seat.exit();
            return watch(this.facets.holder.send(toAccount, amount));
          };
          return zcf.makeInvitation(offerHandler, 'Send');
        },
        SendAll() {
          /**
           * @type {OfferHandler<
           *   Vow<void>,
           *   { toAccount: ChainAddress; amounts: AmountArg[] }
           * >}
           */
          const offerHandler = (seat, { toAccount, amounts }) => {
            seat.exit();
            return watch(this.facets.holder.sendAll(toAccount, amounts));
          };
          return zcf.makeInvitation(offerHandler, 'SendAll');
        },
        /**
         * Starting a transfer revokes the account holder. The associated
         * updater will get a special notification that the account is being
         * transferred.
         */
        TransferAccount() {
          throw Error('not yet implemented');
        },
        Transfer() {
          /**
           * @type {OfferHandler<
           *   Vow<void>,
           *   {
           *     amount: AmountArg;
           *     destination: ChainAddress;
           *     opts: IBCMsgTransferOptions;
           *   }
           * >}
           */
          const offerHandler = (seat, { amount, destination, opts }) => {
            seat.exit();
            return watch(
              this.facets.holder.transfer(amount, destination, opts),
            );
          };
          return zcf.makeInvitation(offerHandler, 'Transfer');
        },
      },
      holder: {
        /** @type {HostFn<OrchestrationAccountI['asContinuingOffer']>} */
        asContinuingOffer() {
          // getPublicTopics resolves promptly (same run), so we don't need a watcher
          // eslint-disable-next-line no-restricted-syntax
          return asVow(async () => {
            await null;
            const { holder, invitationMakers: im } = this.facets;
            // XXX cast to a type that has string index signature
            const invitationMakers = /** @type {InvitationMakers} */ (
              /** @type {unknown} */ (im)
            );

            return harden({
              // getPublicTopics returns a vow, for membrane compatibility.
              // it's safe to unwrap to a promise and get the result as we
              // expect this complete in the same run
              publicSubscribers: await when(holder.getPublicTopics()),
              invitationMakers,
            });
          });
        },
        /** @type {HostFn<OrchestrationAccountI['getPublicTopics']>} */
        getPublicTopics() {
          // getStoragePath resolves promptly (same run), so we don't need a watcher
          // eslint-disable-next-line no-restricted-syntax
          return asVow(async () => {
            await null;
            const { topicKit } = this.state;
            return harden({
              account: {
                description: PUBLIC_TOPICS.account[0],
                subscriber: topicKit.subscriber,
                storagePath: await topicKit.recorder.getStoragePath(),
              },
            });
          });
        },

        /** @type {HostFn<OrchestrationAccountI['getAddress']>} */
        getAddress() {
          return this.state.chainAddress;
        },
        /** @type {HostFn<StakingAccountActions['delegate']>} */
        delegate(validator, amount) {
          return asVow(() => {
            trace('delegate', validator, amount);
            const { helper } = this.facets;
            const { chainAddress, bondDenom } = this.state;

            const amountAsCoin = helper.amountToCoin(amount);
            assert.equal(amountAsCoin.denom, bondDenom);

            const results = E(helper.owned()).executeEncodedTx([
              Any.toJSON(
                MsgDelegate.toProtoMsg({
                  delegatorAddress: chainAddress.value,
                  validatorAddress: validator.value,
                  amount: amountAsCoin,
                }),
              ),
            ]);
            return watch(results, this.facets.returnVoidWatcher);
          });
        },
        /** @type {HostFn<OrchestrationAccountI['getBalances']>} */
        getBalances() {
          // TODO https://github.com/Agoric/agoric-sdk/issues/9610
          return asVow(() => Fail`not yet implemented`);
        },
        /** @type {HostFn<StakingAccountActions['redelegate']>} */
        redelegate(srcValidator, dstValidator, amount) {
          return asVow(() => {
            trace('redelegate', srcValidator, dstValidator, amount);
            const { helper } = this.facets;
            const { chainAddress } = this.state;

            const results = E(helper.owned()).executeEncodedTx([
              Any.toJSON(
                MsgBeginRedelegate.toProtoMsg({
                  delegatorAddress: chainAddress.value,
                  validatorSrcAddress: srcValidator.value,
                  validatorDstAddress: dstValidator.value,
                  amount: helper.amountToCoin(amount),
                }),
              ),
            ]);

            return watch(
              results,
              // NOTE: response, including completionTime, is currently discarded.
              this.facets.returnVoidWatcher,
            );
          });
        },
        /** @type {HostFn<StakingAccountActions['withdrawReward']>} */
        withdrawReward(validator) {
          return asVow(() => {
            trace('withdrawReward', validator);
            const { helper } = this.facets;
            const { chainAddress } = this.state;
            const msg = MsgWithdrawDelegatorReward.toProtoMsg({
              delegatorAddress: chainAddress.value,
              validatorAddress: validator.value,
            });
            const account = helper.owned();

            const results = E(account).executeEncodedTx([Any.toJSON(msg)]);
            return watch(results, this.facets.withdrawRewardWatcher);
          });
        },
        /** @type {HostFn<OrchestrationAccountI['getBalance']>} */
        getBalance(denom) {
          return asVow(() => {
            const { chainAddress, icqConnection } = this.state;
            if (!icqConnection) {
              throw Fail`Queries not available for chain ${chainAddress.chainId}`;
            }
            // TODO #9211 lookup denom from brand
            assert.typeof(denom, 'string');

            const results = E(icqConnection).query([
              toRequestQueryJson(
                QueryBalanceRequest.toProtoMsg({
                  address: chainAddress.value,
                  denom,
                }),
              ),
            ]);
            return watch(results, this.facets.balanceQueryWatcher);
          });
        },

        /** @type {HostFn<OrchestrationAccountI['send']>} */
        send(toAccount, amount) {
          return asVow(() => {
            trace('send', toAccount, amount);
            const { helper } = this.facets;
            const { chainAddress } = this.state;
            return watch(
              E(helper.owned()).executeEncodedTx([
                Any.toJSON(
                  MsgSend.toProtoMsg({
                    fromAddress: chainAddress.value,
                    toAddress: toAccount.value,
                    amount: [helper.amountToCoin(amount)],
                  }),
                ),
              ]),
              this.facets.returnVoidWatcher,
            );
          });
        },

        /** @type {HostFn<OrchestrationAccountI['sendAll']>} */
        sendAll(toAccount, amounts) {
          return asVow(() => {
            trace('sendAll', toAccount, amounts);
            const { helper } = this.facets;
            const { chainAddress } = this.state;
            return watch(
              E(helper.owned()).executeEncodedTx([
                Any.toJSON(
                  MsgSend.toProtoMsg({
                    fromAddress: chainAddress.value,
                    toAddress: toAccount.value,
                    amount: amounts.map(x => helper.amountToCoin(x)),
                  }),
                ),
              ]),
              this.facets.returnVoidWatcher,
            );
          });
        },

        /** @type {HostFn<OrchestrationAccountI['transfer']>} */
        transfer(amount, destination, opts) {
          trace('transfer', amount, destination, opts);
          return asVow(() => {
            const { helper } = this.facets;
            const token = helper.amountToCoin(amount);

            const connectionInfoV = watch(
              chainHub.getConnectionInfo(
                this.state.chainAddress.chainId,
                destination.chainId,
              ),
            );

            // set a `timeoutTimestamp` if caller does not supply either `timeoutHeight` or `timeoutTimestamp`
            // TODO #9324 what's a reasonable default? currently 5 minutes
            const timeoutTimestampVowOrValue =
              opts?.timeoutTimestamp ??
              (opts?.timeoutHeight
                ? 0n
                : E(timestampHelper).getTimeoutTimestampNS());

            // Resolves when host chain successfully submits, but not when
            // the receiving chain acknowledges.
            // See https://github.com/Agoric/agoric-sdk/issues/9784 for a
            // solution that tracks the acknowledgement on the receiving chain.
            return watch(
              allVows([connectionInfoV, timeoutTimestampVowOrValue]),
              this.facets.transferWatcher,
              { opts, token, destination },
            );
          });
        },

        /** @type {HostFn<OrchestrationAccountI['transferSteps']>} */
        transferSteps(amount, msg) {
          console.log('transferSteps got', amount, msg);
          return asVow(() => Fail`not yet implemented`);
        },

        /** @type {HostFn<StakingAccountActions['withdrawRewards']>} */
        withdrawRewards() {
          return asVow(() => Fail`Not Implemented. Try using withdrawReward.`);
        },

        /** @type {HostFn<StakingAccountActions['undelegate']>} */
        undelegate(delegations) {
          return asVow(() => {
            trace('undelegate', delegations);
            const { helper } = this.facets;
            const { chainAddress, bondDenom } = this.state;

            const undelegateV = watch(
              E(helper.owned()).executeEncodedTx(
                delegations.map(d =>
                  Any.toJSON(
                    MsgUndelegate.toProtoMsg({
                      delegatorAddress: chainAddress.value,
                      validatorAddress: d.validatorAddress,
                      amount: { denom: bondDenom, amount: d.shares },
                    }),
                  ),
                ),
              ),
              this.facets.undelegateWatcher,
            );
            return watch(undelegateV, this.facets.returnVoidWatcher);
          });
        },
      },
    },
  );

  return makeCosmosOrchestrationAccountKit;
};

/**
 * @typedef {ReturnType<
 *   ReturnType<typeof prepareCosmosOrchestrationAccountKit>
 * >} CosmosOrchestrationAccountKit
 */

/**
 * @param {Zone} zone
 * @param {object} powers
 * @param {ChainHub} powers.chainHub
 * @param {MakeRecorderKit} powers.makeRecorderKit
 * @param {Remote<TimerService>} powers.timerService
 * @param {VowTools} powers.vowTools
 * @param {ZCF} powers.zcf
 * @returns {(
 *   ...args: Parameters<
 *     ReturnType<typeof prepareCosmosOrchestrationAccountKit>
 *   >
 * ) => CosmosOrchestrationAccountKit['holder']}
 */
export const prepareCosmosOrchestrationAccount = (
  zone,
  { chainHub, makeRecorderKit, timerService, vowTools, zcf },
) => {
  const makeKit = prepareCosmosOrchestrationAccountKit(zone, {
    chainHub,
    makeRecorderKit,
    timerService,
    vowTools,
    zcf,
  });
  return (...args) => makeKit(...args).holder;
};
/** @typedef {CosmosOrchestrationAccountKit['holder']} CosmosOrchestrationAccount */
