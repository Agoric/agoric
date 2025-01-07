// @ts-check
import { X } from '@endo/errors';

import { AmountMath } from '@agoric/ertp';
import { WalletName } from '@agoric/internal';
import { E, Far } from '@endo/far';
import { makeOncePromiseKit } from './once-promise-kit.js';

/**
 * @import {DepositFacet} from '@agoric/ertp/src/types.js'
 * @import {Connection} from '@agoric/network';
 * @import {Remote} from '@agoric/vow';
 */

/**
 * Create or return an existing courier promise kit.
 *
 * @template K
 * @param {K} key
 * @param {LegacyMap<K, PromiseRecord<Courier>>} keyToCourierPK
 */
export const getCourierPK = (key, keyToCourierPK) => {
  if (keyToCourierPK.has(key)) {
    return keyToCourierPK.get(key);
  }

  // This is the first packet for this denomination.
  // Create a new Courier promise kit for it.
  const courierPK = makeOncePromiseKit(X`${key} already pegged`);

  keyToCourierPK.init(key, courierPK);
  return courierPK;
};

/**
 * Create the [send, receive] pair.
 *
 * @import {NameHub} from '@agoric/vats'
 *
 * @typedef {object} CourierArgs
 * @property {ZCF} zcf
 * @property {Remote<BoardDepositFacet>} board
 * @property {Remote<NameHub>} namesByAddress
 * @property {Denom} sendDenom
 * @property {Brand} localBrand
 * @property {(zcfSeat: ZCFSeat, amounts: AmountKeywordRecord) => void} retain
 * @property {(zcfSeat: ZCFSeat, amounts: AmountKeywordRecord) => void} redeem
 * @property {Remote<TransferProtocol>} transferProtocol
 * @property {ReturnType<import('@agoric/vow').prepareVowTools>['when']} when
 * @param {Remote<Connection>} connection
 * @returns {(args: CourierArgs) => Courier}
 */
export const makeCourierMaker =
  connection =>
  ({
    zcf,
    board,
    namesByAddress,
    sendDenom,
    localBrand,
    retain,
    redeem,
    transferProtocol,
    when,
  }) => {
    /** @type {Sender} */
    const send = async (zcfSeat, depositAddress, memo, opts) => {
      const tryToSend = async () => {
        const amount = zcfSeat.getAmountAllocated('Transfer', localBrand);
        const transferPacket = await E(transferProtocol).makeTransferPacket({
          value: amount.value,
          remoteDenom: sendDenom,
          depositAddress,
          memo,
          opts,
        });

        // Retain the payment.  We must not proceed on failure.
        retain(zcfSeat, { Transfer: amount });

        // The payment is already escrowed, and proposed to retain, so try sending.
        return when(E(connection).send(transferPacket))
          .then(async ack => E(transferProtocol).assertTransferPacketAck(ack))
          .then(
            _ => zcfSeat.exit(),
            reason => {
              // Return the payment to the seat, if possible.
              redeem(zcfSeat, { Transfer: amount });
              throw reason;
            },
          );
      };

      // Reflect any error back to the seat.
      return tryToSend().catch(reason => {
        zcfSeat.fail(reason);
      });
    };

    /** @type {Receiver} */
    const receive = async ({ value, depositAddress }) => {
      const localAmount = AmountMath.make(localBrand, value);

      // Look up the deposit facet for this board address, if there is one.
      /** @type {DepositFacet} */
      const depositFacet = await E(board)
        .getValue(depositAddress)
        .catch(async _ =>
          E(namesByAddress).lookup(depositAddress, WalletName.depositFacet),
        );

      const { userSeat, zcfSeat } = zcf.makeEmptySeatKit();

      // Redeem the backing payment.
      try {
        redeem(zcfSeat, { Transfer: localAmount });
        zcfSeat.exit();
      } catch (e) {
        zcfSeat.fail(e);
        throw e;
      }

      // Once we've gotten to this point, their payment is committed and
      // won't be refunded on a failed receive.
      const payout = await E(userSeat).getPayout('Transfer');

      // Send the payout promise to the deposit facet.
      //
      // We don't want to wait for the depositFacet to return, so that
      // it can't hang up (i.e. DoS) an ordered channel, which relies on
      // us returning promptly.
      E(depositFacet)
        .receive(payout)
        .catch(_ => {});

      return E(transferProtocol).makeTransferPacketAck(true);
    };

    return Far('courier', { send, receive });
  };
