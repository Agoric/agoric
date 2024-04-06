// @ts-check
/** @file Use-object for the owner of a localchain account */
import { typedJson } from '@agoric/cosmic-proto/vatsafe';
import { AmountShape } from '@agoric/ertp';
import { makeTracer } from '@agoric/internal';
import { UnguardedHelperI } from '@agoric/internal/src/typeGuards.js';
import { M, prepareExoClassKit } from '@agoric/vat-data';
import { TopicsRecordShape } from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/far';

const trace = makeTracer('LCAH');

const { Fail } = assert;
/**
 * @typedef {object} LocalChainAccountNotification
 * @property {string} address
 */

/**
 * @typedef {{
 *   topicKit: import('@agoric/zoe/src/contractSupport/recorder.js').RecorderKit<LocalChainAccountNotification>;
 *   account: import('@agoric/vats/src/localchain.js').LocalChainAccount | null;
 * }} State
 */

const HolderI = M.interface('holder', {
  getPublicTopics: M.call().returns(TopicsRecordShape),
  makeDelegateInvitation: M.call(M.string(), AmountShape).returns(M.promise()),
  makeCloseAccountInvitation: M.call().returns(M.promise()),
  makeTransferAccountInvitation: M.call().returns(M.promise()),
});

/** @type {{ [name: string]: [description: string, valueShape: Pattern] }} */
const PUBLIC_TOPICS = {
  account: ['Account holder status', M.any()],
};

/**
 * @param {import('@agoric/swingset-liveslots').Baggage} baggage
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 * @param {ZCF} zcf
 */
export const prepareAccountHolder = (baggage, makeRecorderKit, zcf) => {
  const makeAccountHolderKit = prepareExoClassKit(
    baggage,
    'Account Holder',
    {
      helper: UnguardedHelperI,
      holder: HolderI,
      invitationMakers: M.interface('invitationMakers', {
        Delegate: HolderI.payload.methodGuards.makeDelegateInvitation,
        CloseAccount: HolderI.payload.methodGuards.makeCloseAccountInvitation,
        TransferAccount:
          HolderI.payload.methodGuards.makeTransferAccountInvitation,
      }),
    },
    /**
     * @param {import('@agoric/vats/src/localchain.js').LocalChainAccount} account
     * @param {StorageNode} storageNode
     * @returns {State}
     */
    (account, storageNode) => {
      // must be the fully synchronous maker because the kit is held in durable state
      const topicKit = makeRecorderKit(storageNode, PUBLIC_TOPICS.account[1]);

      return { account, topicKit };
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
      },
      invitationMakers: {
        Delegate(validatorAddress, amount) {
          return this.facets.holder.makeDelegateInvitation(
            validatorAddress,
            amount,
          );
        },
        CloseAccount() {
          return this.facets.holder.makeCloseAccountInvitation();
        },
        TransferAccount() {
          return this.facets.holder.makeTransferAccountInvitation();
        },
      },
      holder: {
        getPublicTopics() {
          const { topicKit } = this.state;
          return harden({
            account: {
              description: PUBLIC_TOPICS.account[0],
              subscriber: topicKit.subscriber,
              storagePath: topicKit.recorder.getStoragePath(),
            },
          });
        },
        /**
         *
         * @param {string} validatorAddress
         * @param {Amount<'nat'>} ertpAmount
         */
        async makeDelegateInvitation(validatorAddress, ertpAmount) {
          trace('makeDelegateInvitation', validatorAddress, ertpAmount);

          // FIXME get values from proposal or args
          // FIXME brand handling and amount scaling
          const amount = {
            amount: String(ertpAmount.value),
            denom: 'ubld',
          };

          return zcf.makeInvitation(async seat => {
            // TODO should it allow delegating more BLD?
            seat.exit();
            const lca = this.facets.helper.owned();
            trace('lca', lca);
            const delegatorAddress = await E(lca).getAddress();
            trace('delegatorAddress', delegatorAddress);
            const result = await E(lca).executeTx([
              typedJson('/cosmos.staking.v1beta1.MsgDelegate', {
                amount,
                validatorAddress,
                delegatorAddress,
              }),
            ]);
            trace('got result', result);
            return result;
          }, 'Delegate');
        },
        makeCloseAccountInvitation() {
          throw Error('not yet implemented');
        },
        /**
         * Starting a transfer revokes the account holder. The associated updater
         * will get a special notification that the account is being transferred.
         */
        makeTransferAccountInvitation() {
          throw Error('not yet implemented');
        },
      },
    },
  );
  return makeAccountHolderKit;
};
