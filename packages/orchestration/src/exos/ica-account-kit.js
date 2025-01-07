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
  TxBodyOptsShape,
} from '../typeGuards.js';
import { findAddressField } from '../utils/address.js';
import { makeTxPacket, parseTxPacket } from '../utils/packet.js';

/**
 * @import {HostOf} from '@agoric/async-flow';
 * @import {Zone} from '@agoric/base-zone';
 * @import {Connection, Port} from '@agoric/network';
 * @import {Remote, Vow, VowTools} from '@agoric/vow';
 * @import {AnyJson} from '@agoric/cosmic-proto';
 * @import {TxBody} from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx.js';
 * @import {LocalIbcAddress, RemoteIbcAddress} from '@agoric/vats/tools/ibc-utils.js';
 * @import {ChainAddress, IcaAccount} from '../types.js';
 */

const trace = makeTracer('IcaAccountKit');

const UNPARSABLE_CHAIN_ADDRESS = 'UNPARSABLE_CHAIN_ADDRESS';

export const IcaAccountI = M.interface('IcaAccount', {
  getAddress: M.call().returns(ChainAddressShape),
  getLocalAddress: M.call().returns(M.string()),
  getRemoteAddress: M.call().returns(M.string()),
  getPort: M.call().returns(M.remotable('Port')),
  executeTx: M.call(M.arrayOf(M.record())).returns(VowShape),
  executeEncodedTx: M.call(M.arrayOf(Proto3Shape))
    .optional(TxBodyOptsShape)
    .returns(VowShape),
  deactivate: M.call().returns(VowShape),
  reactivate: M.call().returns(VowShape),
});

// XXX none of these modifiers are working to exclude this type from api-docs
/**
 * @private
 * @typedef {{
 *   chainId: string;
 *   port: Port;
 *   connection: Remote<Connection> | undefined;
 *   localAddress: LocalIbcAddress | undefined;
 *   requestedRemoteAddress: string;
 *   remoteAddress: RemoteIbcAddress | undefined;
 *   chainAddress: ChainAddress | undefined;
 *   isInitiatingClose: boolean;
 * }} State
 *   Internal to the IcaAccountKit exo
 * @internal
 */

/**
 * Used only by CosmosInterchainService
 *
 * @param {Zone} zone
 * @param {VowTools} vowTools
 * @internal
 */
export const prepareIcaAccountKit = (zone, { watch, asVow }) =>
  zone.exoClassKit(
    'IcaAccountKit',
    {
      account: IcaAccountI,
      connectionHandler: OutboundConnectionHandlerI,
      parseTxPacketWatcher: M.interface('ParseTxPacketWatcher', {
        onFulfilled: M.call(M.string())
          .optional(M.arrayOf(M.undefined())) // does not need watcherContext
          .returns(M.string()),
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
        isInitiatingClose: false,
      }),
    {
      parseTxPacketWatcher: {
        /** @param {string} ack */
        onFulfilled(ack) {
          return parseTxPacket(ack);
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
            if (!connection) {
              throw Fail`Account not available or deactivated.`;
            }
            return watch(
              E(connection).send(makeTxPacket(msgs, opts)),
              this.facets.parseTxPacketWatcher,
            );
          });
        },
        /** @type {HostOf<IcaAccount['deactivate']>} */
        deactivate() {
          return asVow(async () => {
            const { connection } = this.state;
            if (!connection) throw Fail`Account not available or deactivated.`;
            this.state.isInitiatingClose = true;
            return E(connection).close();
          });
        },
        /** @type {HostOf<IcaAccount['reactivate']>} */
        reactivate() {
          return asVow(() => {
            const { connection, port, requestedRemoteAddress } = this.state;
            if (connection) {
              throw Fail`Account is already active.`;
            }
            return watch(
              E(port).connect(
                requestedRemoteAddress,
                this.facets.connectionHandler,
              ),
            );
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
         * This handler fires any time the connection (channel) closes. This
         * could be due to external factors (e.g. a packet timeout), or a holder
         * initiated action (`.deactivate()`).
         *
         * Here, if a connection is opened again, we clear the connection and
         * addresses from state as they will change - a new channel will be
         * established if the connection is reopened.
         *
         * If the holder did not initiate the closure, a new connection is
         * established using the original requested remote address. This will
         * result in a new channelID but the ChainAddress will be preserved.
         *
         * @param {Remote<Connection>} _connection
         * @param {unknown} reason
         * @see {@link https://docs.cosmos.network/v0.45/ibc/overview.html#:~:text=In%20ORDERED%20channels%2C%20a%20timeout%20of%20a%20single%20packet%20in%20the%20channel%20closes%20the%20channel.}
         */
        async onClose(_connection, reason) {
          trace(`ICA Channel closed. Reason: ${reason}`);
          this.state.connection = undefined;
          this.state.localAddress = undefined;
          this.state.remoteAddress = undefined;
          if (this.state.isInitiatingClose === true) {
            trace('Account deactivated by holder. Skipping reactivation.');
            this.state.isInitiatingClose = false;
          } else {
            trace('Account closed unexpectedly. Automatically reactivating.');
            void watch(this.facets.account.reactivate());
          }
        },
      },
    },
  );

/** @typedef {ReturnType<ReturnType<typeof prepareIcaAccountKit>>} IcaAccountKit */
