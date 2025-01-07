/** @file Use-object for the owner of a localchain account */
import { typedJson } from '@agoric/cosmic-proto';
import { AmountShape, PaymentShape } from '@agoric/ertp';
import { makeTracer } from '@agoric/internal';
import { Shape as NetworkShape } from '@agoric/network';
import { M } from '@agoric/vat-data';
import { VowShape } from '@agoric/vow';
import { E } from '@endo/far';
import { Fail, q } from '@endo/errors';

import {
  AmountArgShape,
  AnyNatAmountsRecord,
  DenomAmountShape,
  DenomShape,
  IBCTransferOptionsShape,
  TimestampProtoShape,
  TypedJsonShape,
} from '../typeGuards.js';
import { maxClockSkew, toDenomAmount } from '../utils/cosmos.js';
import { orchestrationAccountMethods } from '../utils/orchestrationAccount.js';
import { makeTimestampHelper } from '../utils/time.js';
import { preparePacketTools } from './packet-tools.js';
import { prepareIBCTools } from './ibc-packet.js';
import { coerceCoin, coerceDenomAmount } from '../utils/amounts.js';
import { TransferRouteShape } from './chain-hub.js';

/**
 * @import {HostOf} from '@agoric/async-flow';
 * @import {LocalChain, LocalChainAccount} from '@agoric/vats/src/localchain.js';
 * @import {AmountArg, ChainAddress, DenomAmount, IBCMsgTransferOptions, IBCConnectionInfo, OrchestrationAccountCommon, LocalAccountMethods, TransferRoute} from '@agoric/orchestration';
 * @import {RecorderKit, MakeRecorderKit} from '@agoric/zoe/src/contractSupport/recorder.js'.
 * @import {Zone} from '@agoric/zone';
 * @import {Remote} from '@agoric/internal';
 * @import {InvitationMakers} from '@agoric/smart-wallet/src/types.js';
 * @import {TimerService, TimestampRecord} from '@agoric/time';
 * @import {Vow, VowTools} from '@agoric/vow';
 * @import {TypedJson, JsonSafe, ResponseTo} from '@agoric/cosmic-proto';
 * @import {Coin} from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
 * @import {Matcher} from '@endo/patterns';
 * @import {ChainHub} from './chain-hub.js';
 * @import {PacketTools} from './packet-tools.js';
 * @import {ZoeTools} from '../utils/zoe-tools.js';
 */

const trace = makeTracer('LocalOrchAccount');

const { Vow$ } = NetworkShape; // TODO #9611

const EVow$ = shape => M.or(Vow$(shape), M.promise(/* shape */));

/**
 * @typedef {object} LocalChainAccountNotification
 * @property {string} address
 */

/**
 * @private
 * @typedef {{
 *   topicKit: RecorderKit<LocalChainAccountNotification>;
 *   packetTools: PacketTools;
 *   account: LocalChainAccount;
 *   address: ChainAddress;
 * }} State
 *   Internal to the LocalOrchestrationAccount exo
 */

const HolderI = M.interface('holder', {
  ...orchestrationAccountMethods,
  delegate: M.call(M.string(), AmountShape).returns(VowShape),
  undelegate: M.call(M.string(), AmountShape).returns(VowShape),
  deposit: M.call(PaymentShape).returns(VowShape),
  withdraw: M.call(AmountShape).returns(Vow$(PaymentShape)),
  executeTx: M.call(M.arrayOf(M.record())).returns(Vow$(M.record())),
  sendThenWaitForAck: M.call(EVow$(M.remotable('PacketSender')))
    .optional(M.any())
    .returns(EVow$(M.string())),
  matchFirstPacket: M.call(M.any()).returns(EVow$(M.any())),
  monitorTransfers: M.call(M.remotable('TargetApp')).returns(EVow$(M.any())),
});

/** @type {{ [name: string]: [description: string, valueShape: Matcher] }} */
const PUBLIC_TOPICS = {
  account: ['Account holder status', M.any()],
};

/**
 * @param {Zone} zone
 * @param {object} powers
 * @param {MakeRecorderKit} powers.makeRecorderKit
 * @param {ZCF} powers.zcf
 * @param {Remote<TimerService>} powers.timerService
 * @param {VowTools} powers.vowTools
 * @param {ChainHub} powers.chainHub
 * @param {Remote<LocalChain>} powers.localchain
 * @param {ZoeTools} powers.zoeTools
 */
export const prepareLocalOrchestrationAccountKit = (
  zone,
  {
    makeRecorderKit,
    zcf,
    timerService,
    vowTools,
    chainHub,
    localchain,
    zoeTools,
  },
) => {
  const { watch, asVow, when } = vowTools;
  const { makeIBCTransferSender } = prepareIBCTools(
    zone.subZone('ibcTools'),
    vowTools,
  );
  const makePacketTools = preparePacketTools(
    zone.subZone('packetTools'),
    vowTools,
  );
  const timestampHelper = makeTimestampHelper(timerService);

  /** Make an object wrapping an LCA with Zoe interfaces. */
  const makeLocalOrchestrationAccountKit = zone.exoClassKit(
    'Local Orchestration Account Kit',
    {
      helper: M.interface('helper', {
        amountToCoin: M.call(AmountArgShape).returns(M.record()),
      }),
      holder: HolderI,
      undelegateWatcher: M.interface('undelegateWatcher', {
        onFulfilled: M.call([
          M.splitRecord({ completionTime: TimestampProtoShape }),
        ])
          .optional(M.arrayOf(M.undefined())) // empty context
          .returns(VowShape),
      }),
      transferWatcher: M.interface('transferWatcher', {
        onFulfilled: M.call(M.nat())
          .optional({
            opts: M.or(M.undefined(), IBCTransferOptionsShape),
            route: TransferRouteShape,
          })
          .returns(Vow$(M.record())),
      }),
      extractFirstResultWatcher: M.interface('extractFirstResultWatcher', {
        onFulfilled: M.call([M.record()])
          .optional(M.arrayOf(M.undefined()))
          .returns(M.any()),
      }),
      returnVoidWatcher: M.interface('returnVoidWatcher', {
        onFulfilled: M.call(M.any()).optional(M.any()).returns(M.undefined()),
      }),
      seatExiterHandler: M.interface('seatExiterHandler', {
        onFulfilled: M.call(M.undefined(), M.remotable()).returns(
          M.undefined(),
        ),
        onRejected: M.call(M.error(), M.remotable()).returns(M.undefined()),
      }),
      getBalanceWatcher: M.interface('getBalanceWatcher', {
        onFulfilled: M.call(AmountShape, DenomShape).returns(DenomAmountShape),
      }),
      queryBalanceWatcher: M.interface('queryBalanceWatcher', {
        onFulfilled: M.call(TypedJsonShape).returns(DenomAmountShape),
      }),
      queryBalancesWatcher: M.interface('queryBalancesWatcher', {
        onFulfilled: M.call(TypedJsonShape).returns(
          M.arrayOf(DenomAmountShape),
        ),
      }),
      invitationMakers: M.interface('invitationMakers', {
        CloseAccount: M.call().returns(M.promise()),
        Delegate: M.call(M.string(), AmountShape).returns(M.promise()),
        Deposit: M.call().returns(M.promise()),
        Send: M.call().returns(M.promise()),
        SendAll: M.call().returns(M.promise()),
        Transfer: M.call().returns(M.promise()),
        Undelegate: M.call(M.string(), AmountShape).returns(M.promise()),
        Withdraw: M.call().returns(M.promise()),
      }),
    },
    /**
     * @param {object} initState
     * @param {LocalChainAccount} initState.account
     * @param {ChainAddress} initState.address
     * @param {Remote<StorageNode>} initState.storageNode
     * @returns {State}
     */
    ({ account, address, storageNode }) => {
      // must be the fully synchronous maker because the kit is held in durable state
      const topicKit = makeRecorderKit(storageNode, PUBLIC_TOPICS.account[1]);
      // TODO determine what goes in vstorage https://github.com/Agoric/agoric-sdk/issues/9066
      void E(topicKit.recorder).write('');
      const packetTools = makePacketTools(account);

      return { account, address, topicKit, packetTools };
    },
    {
      helper: {
        /**
         * @param {AmountArg} amount
         * @returns {Coin}
         */
        amountToCoin(amount) {
          return coerceCoin(chainHub, amount);
        },
      },
      invitationMakers: {
        /**
         * @param {string} validatorAddress
         * @param {Amount<'nat'>} ertpAmount
         */
        Delegate(validatorAddress, ertpAmount) {
          trace('Delegate', validatorAddress, ertpAmount);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(
              this.facets.holder.delegate(validatorAddress, ertpAmount),
            );
          }, 'Delegate');
        },
        Deposit() {
          trace('Deposit');
          return zcf.makeInvitation(
            seat => {
              const { give } = seat.getProposal();
              return watch(
                zoeTools.localTransfer(
                  seat,
                  // @ts-expect-error LocalAccount vs LocalAccountMethods
                  this.state.account,
                  give,
                ),
                this.facets.seatExiterHandler,
                seat,
              );
            },
            'Deposit',
            undefined,
            M.splitRecord({ give: AnyNatAmountsRecord, want: {} }),
          );
        },
        /**
         * @param {string} validatorAddress
         * @param {Amount<'nat'>} ertpAmount
         */
        Undelegate(validatorAddress, ertpAmount) {
          trace('Undelegate', validatorAddress, ertpAmount);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return watch(
              this.facets.holder.undelegate(validatorAddress, ertpAmount),
            );
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
        Transfer() {
          /**
           * @type {OfferHandler<
           *   Vow<void>,
           *   {
           *     amount: AmountArg;
           *     destination: ChainAddress;
           *     opts?: IBCMsgTransferOptions;
           *   }
           * >}
           */
          const offerHandler = (seat, { amount, destination, opts }) => {
            seat.exit();
            return watch(
              this.facets.holder.transfer(destination, amount, opts),
            );
          };
          return zcf.makeInvitation(offerHandler, 'Transfer');
        },
        Withdraw() {
          trace('Withdraw');
          return zcf.makeInvitation(
            seat => {
              const { want } = seat.getProposal();
              return watch(
                zoeTools.withdrawToSeat(
                  // @ts-expect-error LocalAccount vs LocalAccountMethods
                  this.state.account,
                  seat,
                  want,
                ),
                this.facets.seatExiterHandler,
                seat,
              );
            },
            'Withdraw',
            undefined,
            M.splitRecord({ give: {}, want: AnyNatAmountsRecord }),
          );
        },
      },
      undelegateWatcher: {
        /**
         * @param {[
         *   JsonSafe<
         *     TypedJson<'/cosmos.staking.v1beta1.MsgUndelegateResponse'>
         *   >,
         * ]} response
         */
        onFulfilled(response) {
          const { completionTime } = response[0];
          return watch(
            E(timerService).wakeAt(
              // ignore nanoseconds and just use seconds from Timestamp
              BigInt(completionTime.seconds) + maxClockSkew,
            ),
            this.facets.returnVoidWatcher,
          );
        },
      },
      transferWatcher: {
        /**
         * @param {bigint} timeoutTimestamp
         * @param {{
         *   opts?: Omit<IBCMsgTransferOptions, 'forwardOpts'>;
         *   route: TransferRoute;
         * }} ctx
         */
        onFulfilled(timeoutTimestamp, { opts, route }) {
          const { forwardInfo, ...transferDetails } = route;
          /** @type {string | undefined} */
          let memo;
          if (opts && 'memo' in opts) {
            memo = opts.memo;
          }
          if (forwardInfo) {
            // forward memo takes precedence
            memo = JSON.stringify(forwardInfo);
          }
          const transferMsg = typedJson(
            '/ibc.applications.transfer.v1.MsgTransfer',
            {
              ...transferDetails,
              sender: this.state.address.value,
              timeoutHeight: opts?.timeoutHeight ?? {
                revisionHeight: 0n,
                revisionNumber: 0n,
              },
              timeoutTimestamp,
              memo: memo ?? '',
            },
          );

          const { holder } = this.facets;
          const sender = makeIBCTransferSender(
            /** @type {any} */ (holder),
            transferMsg,
          );
          // Begin capturing packets, send the transfer packet, then return a
          // vow that rejects unless the packet acknowledgment comes back and is
          // verified.
          return holder.sendThenWaitForAck(sender);
        },
      },
      /**
       * takes an array of results (from `executeEncodedTx`) and returns the
       * first result
       */
      extractFirstResultWatcher: {
        /** @param {Record<unknown, unknown>[]} results */
        onFulfilled(results) {
          results.length === 1 ||
            Fail`expected exactly one result; got ${results}`;
          return results[0];
        },
      },
      returnVoidWatcher: {
        onFulfilled() {
          return undefined;
        },
      },
      /**
       * handles a request for balance from a bank purse and returns the balance
       * as a Chain Amount
       */
      getBalanceWatcher: {
        /**
         * @param {Amount<'nat'>} natAmount
         * @param {DenomAmount['denom']} denom
         * @returns {DenomAmount}
         */
        onFulfilled(natAmount, denom) {
          return harden({ denom, value: natAmount.value });
        },
      },
      /** exits or fails a seat depending the outcome */
      seatExiterHandler: {
        /**
         * @param {undefined} _
         * @param {ZCFSeat} seat
         */
        onFulfilled(_, seat) {
          seat.exit();
        },
        /**
         * @param {Error} reason
         * @param {ZCFSeat} seat
         */
        onRejected(reason, seat) {
          seat.exit(reason);
          throw reason;
        },
      },
      /**
       * handles a QueryBalanceRequest from localchain.query and returns the
       * balance as a DenomAmount
       */
      queryBalanceWatcher: {
        /**
         * @param {ResponseTo<
         *   TypedJson<'/cosmos.bank.v1beta1.QueryBalanceRequest'>
         * >} result
         * @returns {DenomAmount}
         */
        onFulfilled(result) {
          const { balance } = result;
          if (!balance || !balance?.denom) {
            throw Fail`Expected balance ${q(result)};`;
          }
          return harden(toDenomAmount(balance));
        },
      },
      /**
       * handles a QueryAllBalancesRequest from localchain.query and returns the
       * balances as a DenomAmounts
       */
      queryBalancesWatcher: {
        /**
         * @param {JsonSafe<
         *   ResponseTo<
         *     TypedJson<'/cosmos.bank.v1beta1.QueryAllBalancesRequest'>
         *   >
         * >} result
         * @returns {DenomAmount[]}
         */
        onFulfilled(result) {
          const { balances } = result;
          if (!balances || !Array.isArray(balances)) {
            throw Fail`Expected balances ${q(result)};`;
          }
          return harden(balances.map(toDenomAmount));
        },
      },
      holder: {
        /** @type {HostOf<OrchestrationAccountCommon['asContinuingOffer']>} */
        asContinuingOffer() {
          // @ts-expect-error XXX invitationMakers
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
        /** @type {HostOf<OrchestrationAccountCommon['getBalance']>} */
        getBalance(denomArg) {
          return asVow(() => {
            const [brand, denom] =
              typeof denomArg === 'string'
                ? [chainHub.getAsset(denomArg, 'agoric')?.brand, denomArg]
                : [denomArg, chainHub.getDenom(denomArg)];

            if (!denom) {
              throw Fail`No denom for brand: ${denomArg}`;
            }

            if (brand) {
              return watch(
                E(this.state.account).getBalance(brand),
                this.facets.getBalanceWatcher,
                denom,
              );
            }

            return watch(
              E(localchain).query(
                typedJson('/cosmos.bank.v1beta1.QueryBalanceRequest', {
                  address: this.state.address.value,
                  denom,
                }),
              ),
              this.facets.queryBalanceWatcher,
            );
          });
        },
        /** @type {HostOf<OrchestrationAccountCommon['getBalances']>} */
        getBalances() {
          return watch(
            E(localchain).query(
              typedJson('/cosmos.bank.v1beta1.QueryAllBalancesRequest', {
                address: this.state.address.value,
              }),
            ),
            this.facets.queryBalancesWatcher,
          );
        },

        /** @type {HostOf<OrchestrationAccountCommon['getPublicTopics']>} */
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
        // FIXME take ChainAddress to match OrchestrationAccountI
        /**
         * @param {string} validatorAddress
         * @param {Amount<'nat'>} ertpAmount
         */
        delegate(validatorAddress, ertpAmount) {
          const { account: lca } = this.state;

          const amount = coerceCoin(chainHub, ertpAmount);

          return watch(
            E(lca).executeTx([
              typedJson('/cosmos.staking.v1beta1.MsgDelegate', {
                amount,
                validatorAddress,
                delegatorAddress: this.state.address.value,
              }),
            ]),
            this.facets.extractFirstResultWatcher,
          );
        },
        // FIXME take ChainAddress to match OrchestrationAccountI
        /**
         * @param {string} validatorAddress
         * @param {Amount<'nat'>} ertpAmount
         * @returns {Vow<void | TimestampRecord>}
         */
        undelegate(validatorAddress, ertpAmount) {
          const amount = coerceCoin(chainHub, ertpAmount);
          const { account: lca } = this.state;
          return watch(
            E(lca).executeTx([
              typedJson('/cosmos.staking.v1beta1.MsgUndelegate', {
                amount,
                validatorAddress,
                delegatorAddress: this.state.address.value,
              }),
            ]),
            this.facets.undelegateWatcher,
          );
        },
        /**
         * Starting a transfer revokes the account holder. The associated
         * updater will get a special notification that the account is being
         * transferred.
         */
        /** @type {HostOf<LocalAccountMethods['deposit']>} */
        deposit(payment) {
          return watch(
            E(this.state.account).deposit(payment),
            this.facets.returnVoidWatcher,
          );
        },
        /** @type {HostOf<LocalAccountMethods['withdraw']>} */
        withdraw(amount) {
          return watch(E(this.state.account).withdraw(amount));
        },
        /** @type {HostOf<LocalChainAccount['executeTx']>} */
        executeTx(messages) {
          return watch(E(this.state.account).executeTx(messages));
        },
        /** @type {OrchestrationAccountCommon['getAddress']} */
        getAddress() {
          return this.state.address;
        },
        /**
         * XXX consider using ERTP to send if it's vbank asset
         *
         * @type {HostOf<OrchestrationAccountCommon['send']>}
         */
        send(toAccount, amount) {
          return asVow(() => {
            trace('send', toAccount, amount);
            const { helper } = this.facets;
            return watch(
              E(this.state.account).executeTx([
                typedJson('/cosmos.bank.v1beta1.MsgSend', {
                  amount: [helper.amountToCoin(amount)],
                  toAddress: toAccount.value,
                  fromAddress: this.state.address.value,
                }),
              ]),
              this.facets.returnVoidWatcher,
            );
          });
        },
        /**
         * XXX consider using ERTP to send if it's vbank asset
         *
         * @type {HostOf<OrchestrationAccountCommon['sendAll']>}
         */
        sendAll(toAccount, amounts) {
          return asVow(() => {
            trace('sendAll', toAccount, amounts);
            const { helper } = this.facets;
            return watch(
              E(this.state.account).executeTx([
                typedJson('/cosmos.bank.v1beta1.MsgSend', {
                  amount: amounts.map(a => helper.amountToCoin(a)),
                  toAddress: toAccount.value,
                  fromAddress: this.state.address.value,
                }),
              ]),
              this.facets.returnVoidWatcher,
            );
          });
        },
        /**
         * @param {ChainAddress} destination
         * @param {AmountArg} amount an ERTP {@link Amount} or a
         *   {@link DenomAmount}
         * @param {IBCMsgTransferOptions} [opts] if either timeoutHeight or
         *   timeoutTimestamp are not supplied, a default timeoutTimestamp will
         *   be set for 5 minutes in the future
         * @returns {Vow<any>}
         * @throws {Error} if route is not determinable, asset is not
         *   recognized, or the transfer is rejected (insufficient funds,
         *   timeout)
         */
        transfer(destination, amount, opts) {
          return asVow(() => {
            trace('Transferring funds over IBC');
            const denomAmount = coerceDenomAmount(chainHub, amount);

            const { forwardOpts, ...rest } = opts ?? {};

            // throws if route is not determinable
            const route = chainHub.makeTransferRoute(
              destination,
              denomAmount,
              'agoric',
              forwardOpts,
            );
            trace('got transfer route', route);

            // set a `timeoutTimestamp` if caller does not supply either `timeoutHeight` or `timeoutTimestamp`
            // TODO #9324 what's a reasonable default? currently 5 minutes
            const timeoutTimestampVowOrValue =
              opts?.timeoutTimestamp ??
              (opts?.timeoutHeight
                ? 0n
                : asVow(async () =>
                    E(timestampHelper).getTimeoutTimestampNS(),
                  ));

            // don't resolve the vow until the transfer is confirmed on remote
            // and reject vow if the transfer fails for any reason
            const resultV = watch(
              timeoutTimestampVowOrValue,
              this.facets.transferWatcher,
              {
                opts: rest,
                route,
              },
            );
            return resultV;
          });
        },
        /** @type {HostOf<OrchestrationAccountCommon['transferSteps']>} */
        transferSteps(amount, msg) {
          return asVow(() => {
            console.log('transferSteps got', amount, msg);
            throw Fail`not yet implemented`;
          });
        },
        /** @type {HostOf<PacketTools['sendThenWaitForAck']>} */
        sendThenWaitForAck(sender, opts) {
          return watch(
            E(this.state.packetTools).sendThenWaitForAck(sender, opts),
          );
        },
        /** @type {HostOf<PacketTools['matchFirstPacket']>} */
        matchFirstPacket(patternV) {
          return watch(E(this.state.packetTools).matchFirstPacket(patternV));
        },
        /** @type {HostOf<LocalAccountMethods['monitorTransfers']>} */
        monitorTransfers(tap) {
          return watch(E(this.state.packetTools).monitorTransfers(tap));
        },
      },
    },
  );
  return makeLocalOrchestrationAccountKit;
};

/** @typedef {ReturnType<typeof prepareLocalOrchestrationAccountKit>} MakeLocalOrchestrationAccountKit */
/** @typedef {ReturnType<MakeLocalOrchestrationAccountKit>} LocalOrchestrationAccountKit */
