/** @file IcaAccount exo */
import { Fail } from '@endo/errors';
import { E } from '@endo/far';
import { M } from '@endo/patterns';
import { NonNullish, makeTracer } from '@agoric/internal';
import { VowShape } from '@agoric/vow';
import {
  ChainAddressShape,
  OutboundConnectionHandlerI,
  Proto3Shape,
} from '../typeGuards.js';
import { findAddressField } from '../utils/address.js';
import { makeTxPacket, parseTxPacket } from '../utils/packet.js';

/**
 * @import {Zone} from '@agoric/base-zone';
 * @import {Connection, Port} from '@agoric/network';
 * @import {Remote, Vow, VowTools} from '@agoric/vow';
 * @import {AnyJson} from '@agoric/cosmic-proto';
 * @import {TxBody} from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx.js';
 * @import {LocalIbcAddress, RemoteIbcAddress} from '@agoric/vats/tools/ibc-utils.js';
 * @import {ChainAddress} from '../types.js';
 */

const trace = makeTracer('IcaAccountKit');

/** @typedef {'UNPARSABLE_CHAIN_ADDRESS'} UnparsableChainAddress */
const UNPARSABLE_CHAIN_ADDRESS = 'UNPARSABLE_CHAIN_ADDRESS';

export const IcaAccountI = M.interface('IcaAccount', {
  getAddress: M.call().returns(ChainAddressShape),
  getLocalAddress: M.call().returns(M.string()),
  getRemoteAddress: M.call().returns(M.string()),
  getPort: M.call().returns(M.remotable('Port')),
  executeTx: M.call(M.arrayOf(M.record())).returns(VowShape),
  executeEncodedTx: M.call(M.arrayOf(Proto3Shape))
    .optional(M.record())
    .returns(VowShape),
  close: M.call().returns(VowShape),
});

/**
 * @typedef {{
 *   chainId: string;
 *   port: Port;
 *   connection: Remote<Connection> | undefined;
 *   localAddress: LocalIbcAddress | undefined;
 *   requestedRemoteAddress: string;
 *   remoteAddress: RemoteIbcAddress | undefined;
 *   chainAddress: ChainAddress | undefined;
 * }} State
 */

/**
 * @param {Zone} zone
 * @param {VowTools} vowTools
 */
export const prepareIcaAccountKit = (zone, { watch, asVow }) =>
  zone.exoClassKit(
    'IcaAccountKit',
    {
      account: IcaAccountI,
      connectionHandler: OutboundConnectionHandlerI,
      sendPacketWatcher: M.interface('SendPacketWatcher', {
        onFulfilled: M.call(M.string())
          .optional(M.arrayOf(M.undefined())) // does not need watcherContext
          .returns(VowShape),
      }),
    },
    /**
     * @param {string} chainId
     * @param {Port} port
     * @param {string} requestedRemoteAddress
     */
    (chainId, port, requestedRemoteAddress) =>
      /** @type {State} */ ({
        chainId,
        port,
        connection: undefined,
        requestedRemoteAddress,
        remoteAddress: undefined,
        chainAddress: undefined,
        localAddress: undefined,
      }),
    {
      sendPacketWatcher: {
        /** @param {string} ack */
        onFulfilled(ack) {
          return watch(parseTxPacket(ack));
        },
      },
      account: {
        /** @returns {ChainAddress} */
        getAddress() {
          return NonNullish(
            this.state.chainAddress,
            'ICA channel creation acknowledgement not yet received.',
          );
        },
        getLocalAddress() {
          return NonNullish(
            this.state.localAddress,
            'local address not available',
          );
        },
        getRemoteAddress() {
          return NonNullish(
            this.state.remoteAddress,
            'remote address not available',
          );
        },
        getPort() {
          return this.state.port;
        },
        executeTx() {
          return asVow(() => Fail`not yet implemented`);
        },
        /**
         * Submit a transaction on behalf of the remote account for execution on
         * the remote chain.
         *
         * @param {AnyJson[]} msgs
         * @param {Omit<TxBody, 'messages'>} [opts]
         * @returns {Vow<string>} - base64 encoded bytes string. Can be decoded
         *   using the corresponding `Msg*Response` object.
         * @throws {Error} if packet fails to send or an error is returned
         */
        executeEncodedTx(msgs, opts) {
          return asVow(() => {
            const { connection } = this.state;
            if (!connection) throw Fail`connection not available`;
            return watch(
              E(connection).send(makeTxPacket(msgs, opts)),
              this.facets.sendPacketWatcher,
            );
          });
        },
        /**
         * Close the remote account
         *
         * @returns {Vow<void>}
         * @throws {Error} if connection is not available or already closed
         */
        close() {
          return asVow(() => {
            /// TODO #9192 what should the behavior be here? and `onClose`?
            // - retrieve assets?
            // - revoke the port?
            const { connection } = this.state;
            if (!connection) throw Fail`connection not available`;
            return E(connection).close();
          });
        },
      },
      connectionHandler: {
        /**
         * @param {Remote<Connection>} connection
         * @param {LocalIbcAddress} localAddr
         * @param {RemoteIbcAddress} remoteAddr
         */
        async onOpen(connection, localAddr, remoteAddr) {
          trace(`ICA Channel Opened for ${localAddr} at ${remoteAddr}`);
          this.state.connection = connection;
          this.state.remoteAddress = remoteAddr;
          this.state.localAddress = localAddr;
          const address = findAddressField(remoteAddr);
          if (!address) {
            console.error('⚠️ failed to parse chain address', remoteAddr);
          }
          this.state.chainAddress = harden({
            value: address || UNPARSABLE_CHAIN_ADDRESS,
            chainId: this.state.chainId,
            encoding: 'bech32',
          });
        },
        /**
         * @param {Remote<Connection>} _connection
         * @param {unknown} reason
         */
        async onClose(_connection, reason) {
          trace(`ICA Channel closed. Reason: ${reason}`);
          // FIXME handle connection closing https://github.com/Agoric/agoric-sdk/issues/9192
          // XXX is there a scenario where a connection will unexpectedly close? _I think yes_
        },
      },
    },
  );

/** @typedef {ReturnType<ReturnType<typeof prepareIcaAccountKit>>} IcaAccountKit */
