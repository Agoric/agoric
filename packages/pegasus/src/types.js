// @ts-check

/// <reference types="ses" />
/**
 * @import {Bytes, ConnectionHandler} from '@agoric/network';
 */

/**
 * @typedef {string} Denom
 * @typedef {string} DepositAddress
 */

/**
 * @typedef {object} PacketParts
 * @property {import('@agoric/ertp/src/types.js').AmountValue} value
 * @property {Denom} remoteDenom
 * @property {DepositAddress} depositAddress
 * @property {string} memo
 * @property {SenderOptions} opts
 */

/**
 * @typedef {object} TransferProtocol
 * @property {(parts: PacketParts) => Promise<Bytes>} makeTransferPacket
 * @property {(packet: Bytes) => Promise<PacketParts>} parseTransferPacket
 * @property {(success: boolean, error?: any) => Promise<Bytes>} makeTransferPacketAck
 * @property {(ack: Bytes) => Promise<void>} assertTransferPacketAck
 */

/**
 * @typedef {object} DenomTransformer
 * @property {(remoteDenom: Denom, localAddr: string, remoteAddr: string)
 *   => Promise<{ sendDenom: Denom, receiveDenom: Denom }>
 * } getDenomsForLocalPeg
 * @property {(remoteDenom: Denom, localAddr: string, remoteAddr: string)
 *   => Promise<{ sendDenom: Denom, receiveDenom: Denom }>
 * } getDenomsForRemotePeg
 */

/**
 * @typedef {object} Peg
 * @property {() => string} getAllegedName get the debug name
 * @property {() => Brand} getLocalBrand get the brand associated with the peg
 * @property {() => Denom} getReceiveDenom get the remote denomination identifier we receive
 * @property {() => Denom} getSendDenom get the remote denomination identifier we send
 */

/**
 * @typedef {object} BoardDepositFacet a registry for depositAddresses
 * @property {(id: string) => any} getValue return the corresponding DepositFacet
 */

/**
 * @typedef {(zcfSeat: ZCFSeat, depositAddress: DepositAddress, memo: string, opt: SenderOptions) => Promise<void>} Sender
 * Successive transfers are not guaranteed to be processed in the order in which they were sent.
 * @typedef {(parts: PacketParts) => Promise<Bytes>} Receiver
 * @typedef {object} Courier
 * @property {Sender} send
 * @property {Receiver} receive
 */

/**
 * @callback RejectTransfersWaitingForPegRemote
 * Abort any in-progress receiveDenom transfers if there has not yet been a
 * pegRemote or pegLocal corresponding to it.
 *
 * This races against any attempts to obtain metadata and establish a given
 * peg.
 *
 * It's alright to expose to the holder of the connection.
 *
 * @param {Denom} receiveDenom
 * @returns {Promise<void>}
 */

/**
 * @callback PegRemote
 * Peg a remote asset over a network connection.
 *
 * @param {string} allegedName
 * @param {Denom} remoteDenom
 * @param {AssetKind} [assetKind] The kind of the pegged values
 * @param {DisplayInfo} [displayInfo]
 * @returns {Promise<Peg>}
 */

/**
 * @callback PegLocal
 * Peg a local asset over a network connection.
 *
 * @param {string} allegedName
 * @param {Issuer} localIssuer Local ERTP issuer whose assets should be
 * pegged to the connection
 * @returns {Promise<Peg>}
 */

/**
 * @typedef {object} PegasusConnectionActions
 * @property {PegLocal} pegLocal
 * @property {PegRemote} pegRemote
 * @property {RejectTransfersWaitingForPegRemote} rejectTransfersWaitingForPegRemote
 * @property {(reason?: any) => void} abort
 */

/**
 * @typedef {object} PegasusConnection
 * @property {PegasusConnectionActions} [actions]
 * @property {string} localAddr
 * @property {string} remoteAddr
 * @property {Subscription<Denom>} [remoteDenomSubscription]
 */

/**
 * @typedef {object} PegasusConnectionKit
 * @property {ConnectionHandler} handler
 * @property {Subscription<PegasusConnection>} subscription
 */

/**
 * @typedef {object} SenderOptions
 * @property {string} [sender] the sender address attached to the packet to receive any refund
 */
