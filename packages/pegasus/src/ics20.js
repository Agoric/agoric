// @ts-check
import { Nat } from '@agoric/nat';
import { Far } from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';

/**
 * @typedef {Object} ICS20TransferPacket Packet shape defined at:
 *   https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 * @property {string} amount The extent of the amount
 * @property {Denom} denom The denomination of the amount
 * @property {string} sender The sender address
 * @property {DepositAddress} receiver The receiver deposit address
 */

// As specified in ICS20, the success result is a base64-encoded '\0x1' byte.
const ICS20_TRANSFER_SUCCESS_RESULT = 'AQ==';

// ibc-go as late as v3 requires the `sender` to be nonempty, but doesn't
// actually use it on the receiving side.  We don't need it on the sending side,
// either, so we can just omit it.
export const DUMMY_SENDER_ADDRESS = 'pegasus';

/** @param {string} s */
const safeJSONParseObject = s => {
  /** @type {unknown} */
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (e) {
    assert.note(e, X`${s} is not valid JSON`);
    throw e;
  }
  assert.typeof(obj, 'object', X`${s} is not a JSON object`);
  assert(obj !== null, X`${s} is null`);
  return obj;
};

/**
 * Convert an inbound packet to a local amount.
 *
 * @param {Bytes} packet
 * @returns {Promise<PacketParts>}
 */
export const parseICS20TransferPacket = async packet => {
  const ics20Packet = safeJSONParseObject(packet);
  const { amount, denom, receiver } = ics20Packet;

  assert.typeof(denom, 'string', X`Denom ${denom} must be a string`);
  assert.typeof(receiver, 'string', X`Receiver ${receiver} must be a string`);

  // amount is a string in JSON.
  assert.typeof(amount, 'string', X`Amount ${amount} must be a string`);
  const bigValue = BigInt(amount);

  // If we overflow, or don't have a non-negative integer, throw an exception!
  const value = Nat(bigValue);

  return harden({
    depositAddress: receiver,
    remoteDenom: denom,
    value,
  });
};

/**
 * Convert the amount to a packet to send. PacketParts.value is limited to
 * fungible (bigint) amounts.
 *
 * @param {PacketParts} param0
 * @returns {Promise<Bytes>}
 */
export const makeICS20TransferPacket = async ({
  value,
  remoteDenom,
  depositAddress,
}) => {
  // We're using Nat as a dynamic check for overflow.
  // @ts-ignore - this causes errors on some versions of TS, but not others.
  const stringValue = String(Nat(value));

  // Generate the ics20-1 packet.
  /** @type {ICS20TransferPacket} */
  const ics20 = {
    amount: stringValue,
    denom: remoteDenom,
    receiver: depositAddress,
    sender: DUMMY_SENDER_ADDRESS,
  };

  return JSON.stringify(ics20);
};

/**
 * Check the results of the transfer.
 *
 * @param {Bytes} ack
 * @returns {Promise<void>}
 */
export const assertICS20TransferPacketAck = async ack => {
  const { result, error } = safeJSONParseObject(ack);
  assert(error === undefined, X`ICS20 transfer error ${error}`);
  assert(result !== undefined, X`ICS20 transfer missing result in ${ack}`);
  if (result !== ICS20_TRANSFER_SUCCESS_RESULT) {
    // We don't want to throw an error here, because we want only to be able to
    // differentiate between a transfer that failed and a transfer that succeeded.
    console.warn(`ICS20 transfer succeeded with unexpected result: ${result}`);
  }
};

/**
 * Create results of the transfer. Acknowledgement shape defined at:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 *
 * @param {boolean} success
 * @param {any} error
 * @returns {Promise<Bytes>}
 */
export const makeICS20TransferPacketAck = async (success, error) => {
  if (success) {
    const ack = { result: ICS20_TRANSFER_SUCCESS_RESULT };
    return JSON.stringify(ack);
  }
  const nack = { error: `${error}` };
  return JSON.stringify(nack);
};

/** @type {TransferProtocol} */
export const ICS20TransferProtocol = Far('ics20-1 transfer protocol', {
  makeTransferPacket: makeICS20TransferPacket,
  assertTransferPacketAck: assertICS20TransferPacketAck,
  parseTransferPacket: parseICS20TransferPacket,
  makeTransferPacketAck: makeICS20TransferPacketAck,
});
