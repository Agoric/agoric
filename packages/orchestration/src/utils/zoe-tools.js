/**
 * @file Helper functions for transferring payments between a LocalChainAccount
 *   and a ZCFSeat.
 *
 *   Maintainers: This exists as an endowment for orchestrated async-flows so we
 *   can make use of E and promises. The logic for recovering partial failures
 *   is also an added convenience for developers.
 *
 *   Functions are written using `asVow` and non-resumable promises as we expect
 *   each invocation to resolve promptly - there are no timers or interchain
 *   network calls.
 *
 *   A promise resolved promptly is currently safe from being severed by an
 *   upgrade because we only trigger vat upgrades as the result of network
 *   input.
 */

import { makeError, q, Fail } from '@endo/errors';
import { depositToSeat } from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/far';

const { assign, keys, values } = Object;

/**
 * @import {HostOf} from '@agoric/async-flow';
 * @import {InvitationMakers} from '@agoric/smart-wallet/src/types.js';
 * @import {ResolvedPublicTopic} from '@agoric/zoe/src/contractSupport/topics.js';
 * @import {VowTools} from '@agoric/vow';
 * @import {LocalAccountMethods} from '../types.js';
 */

/**
 * @typedef {{
 *   invitationMakers: InvitationMakers;
 *   publicSubscribers: Record<string, ResolvedPublicTopic<any>>;
 * }} ResolvedContinuingOfferResult
 *
 * @see {ContinuingOfferResult}
 */

/**
 * @typedef {(
 *   srcSeat: ZCFSeat,
 *   localAccount: LocalAccountMethods,
 *   amounts: AmountKeywordRecord,
 * ) => Promise<void>} LocalTransfer
 */

/**
 * @typedef {(
 *   localAccount: LocalAccountMethods,
 *   destSeat: ZCFSeat,
 *   amounts: AmountKeywordRecord,
 * ) => Promise<void>} WithdrawToSeat
 */

/**
 * @param {ZCF} zcf
 * @param {VowTools} vowTools
 */
export const makeZoeTools = (zcf, { when, allVows, allSettled, asVow }) => {
  /**
   * Transfer the `amounts` from `srcSeat` to `localAccount`. If any of the
   * deposits fail, everything will be rolled back to the `srcSeat`. Supports
   * multiple items in the `amounts` {@link AmountKeywordRecord}.
   *
   * @type {HostOf<LocalTransfer>}
   */
  const localTransfer = (srcSeat, localAccount, amounts) =>
    asVow(async () => {
      !srcSeat.hasExited() || Fail`The seat cannot have exited.`;
      const { zcfSeat: tempSeat, userSeat: userSeatP } = zcf.makeEmptySeatKit();
      const userSeat = await userSeatP;
      zcf.atomicRearrange(harden([[srcSeat, tempSeat, amounts]]));
      tempSeat.exit();
      // TODO (#9541) get the userSeat into baggage so it's at least recoverable
      // const userSeat = await subzone.makeOnce(
      //   'localTransferHelper',
      //   async () => {
      //     const { zcfSeat: tempSeat, userSeat: userSeatP } =
      //       zcf.makeEmptySeatKit();
      //     const uSeat = await userSeatP;
      //     // TODO how do I store in the place for this retryable?
      //     atomicTransfer(zcf, srcSeat, tempSeat, amounts);
      //     tempSeat.exit();
      //     return uSeat;
      //   },
      // );

      // Now all the `amounts` are accessible, so we can move them to the localAccount
      const payments = await Promise.all(
        keys(amounts).map(async kw => E(userSeat).getPayout(kw)),
      );
      const settleDeposits = await when(
        allSettled(payments.map(async pmt => E(localAccount).deposit(pmt))),
      );
      // if any of the deposits to localAccount failed, unwind all of the allocations
      if (settleDeposits.find(x => x.status === 'rejected')) {
        const amts = values(amounts);
        const errors = [];
        // withdraw the successfully deposited payments
        const paymentsOrWithdrawVs = settleDeposits.map(async (x, i) => {
          if (x.status === 'rejected') {
            errors.push(x.reason);
            return payments[i];
          }
          return E(localAccount).withdraw(amts[i]);
        });

        // return all payments to the srcSeat
        const paymentsToReturn = await when(allVows(paymentsOrWithdrawVs));
        const paymentKwr = harden(
          keys(amounts).reduce(
            (kwr, kw, i) => assign(kwr, { [kw]: paymentsToReturn[i] }),
            {},
          ),
        );
        const depositResponse = await depositToSeat(
          zcf,
          srcSeat,
          amounts,
          paymentKwr,
        );
        console.debug(depositResponse);
        throw makeError(`One or more deposits failed ${q(errors)}`);
      }
      // TODO #9541 remove userSeat from baggage
    });

  /**
   * Transfer the `amounts` from a `localAccount` to the `recipientSeat`. If any
   * of the withdrawals fail, everything will be rolled back to the
   * `srcLocalAccount`. Supports multiple items in the `amounts`
   * {@link PaymentKeywordRecord}
   *
   * @type {HostOf<WithdrawToSeat>}
   */
  const withdrawToSeat = (localAccount, destSeat, amounts) =>
    asVow(async () => {
      !destSeat.hasExited() || Fail`The seat cannot have exited.`;

      const settledWithdrawals = await when(
        allSettled(
          values(amounts).map(async amt => E(localAccount).withdraw(amt)),
        ),
      );

      // if any of the withdrawals were rejected, unwind the successful ones
      if (settledWithdrawals.find(x => x.status === 'rejected')) {
        const returnPaymentVs = [];
        const errors = [];
        for (const result of settledWithdrawals) {
          if (result.status === 'fulfilled') {
            returnPaymentVs.push(E(localAccount).deposit(result.value));
          } else {
            errors.push(result.reason);
          }
        }
        await when(allVows(returnPaymentVs));
        throw makeError(`One or more withdrawals failed ${q(errors)}`);
      }
      // successfully withdrew payments from srcLocalAccount, deposit to recipientSeat
      const paymentKwr = harden(
        keys(amounts).reduce(
          (acc, kw, i) =>
            assign(acc, {
              [kw]: /** @type {{ value: Amount }[]} */ (settledWithdrawals)[i]
                .value,
            }),
          {},
        ),
      );
      const depositResponse = await depositToSeat(
        zcf,
        destSeat,
        amounts,
        paymentKwr,
      );
      console.debug(depositResponse);
    });

  return harden({
    localTransfer,
    withdrawToSeat,
  });
};

/** @typedef {ReturnType<typeof makeZoeTools>} ZoeTools */
