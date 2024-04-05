// @ts-check
/** @file Orchestration service */
import { NonNullish } from '@agoric/assert';
import { makeTracer } from '@agoric/internal';
import { V as E } from '@agoric/vat-data/vow.js';
import { M } from '@endo/patterns';
import { makeICAConnectionAddress, parseAddress } from './utils/address.js';
import { makeTxPacket } from './utils/tx.js';
import '@agoric/network/exported.js';

/**
 * @import { ConnectionId } from './types';
 * @import { Zone } from '@agoric/base-zone';
 * @import { TxBody } from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx';
 */

const { Fail, bare } = assert;
const trace = makeTracer('Orchestration');

/** @import {Proto3Msg} from './utils/tx' */

// TODO improve me
/** @typedef {string} ChainAddress */

/**
 * @typedef {object} OrchestrationPowers
 * @property {ERef<
 *   import('@agoric/orchestration/src/types').AttenuatedNetwork
 * >} network
 */

/**
 * PowerStore is used so additional powers can be added on upgrade. See
 * [#7337](https://github.com/Agoric/agoric-sdk/issues/7337) for tracking on Exo
 * state migrations.
 *
 * @typedef {MapStore<
 *   keyof OrchestrationPowers,
 *   OrchestrationPowers[keyof OrchestrationPowers]
 * >} PowerStore
 */

/**
 * @template {keyof OrchestrationPowers} K
 * @param {PowerStore} powers
 * @param {K} name
 */
const getPower = (powers, name) => {
  powers.has(name) || Fail`need powers.${bare(name)} for this method`;
  return /** @type {OrchestrationPowers[K]} */ (powers.get(name));
};

export const ChainAccountI = M.interface('ChainAccount', {
  getAccountAddress: M.call().returns(M.string()),
  getLocalAddress: M.call().returns(M.string()),
  getRemoteAddress: M.call().returns(M.string()),
  getPort: M.call().returns(M.remotable('Port')),
  executeEncodedTx: M.callWhen(
    M.arrayOf({
      typeUrl: M.string(),
      value: M.string(),
    }),
  )
    .optional(M.record())
    .returns(M.string()),
  close: M.callWhen().returns(M.string()),
});

export const ConnectionHandlerI = M.interface('ConnectionHandler', {
  onOpen: M.callWhen(M.any(), M.string(), M.string(), M.any()).returns(M.any()),
  onClose: M.callWhen(M.any(), M.any(), M.any()).returns(M.any()),
  onReceive: M.callWhen(M.any(), M.string()).returns(M.any()),
});

/** @param {Zone} zone */
const prepareChainAccount = zone =>
  zone.exoClassKit(
    'ChainAccount',
    { account: ChainAccountI, connectionHandler: ConnectionHandlerI },
    /**
     * @param {Port} port
     * @param {string} requestedRemoteAddress
     */
    (port, requestedRemoteAddress) =>
      /**
       * @type {{
       *   port: Port;
       *   connection: Connection | undefined;
       *   localAddress: string | undefined;
       *   requestedRemoteAddress: string;
       *   remoteAddress: string | undefined;
       *   accountAddress: ChainAddress | undefined;
       * }}
       */ (
        harden({
          port,
          connection: undefined,
          requestedRemoteAddress,
          remoteAddress: undefined,
          accountAddress: undefined,
          localAddress: undefined,
        })
      ),
    {
      account: {
        getAccountAddress() {
          return NonNullish(
            this.state.accountAddress,
            'Error parsing account address from remote address',
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
        /**
         * @param {Proto3Msg[]} msgs
         * @param {Omit<TxBody, 'messages'>} [opts]
         */
        async executeEncodedTx(msgs, opts) {
          const { connection } = this.state;
          if (!connection) throw Fail`connection not available`;
          return E(connection).send(makeTxPacket(msgs, opts));
        },
        async close() {
          /// XXX what should the behavior be here? and `onClose`?
          // - retrieve assets?
          // - revoke the port?
          const { connection } = this.state;
          if (!connection) throw Fail`connection not available`;
          await null;
          try {
            await E(connection).close();
          } catch (e) {
            throw Fail`Failed to close connection: ${e}`;
          }
          return 'Connection closed';
        },
      },
      connectionHandler: {
        /**
         * @param {Connection} connection
         * @param {string} localAddr
         * @param {string} remoteAddr
         */
        async onOpen(connection, localAddr, remoteAddr) {
          trace(`ICA Channel Opened for ${localAddr} at ${remoteAddr}`);
          this.state.connection = connection;
          this.state.remoteAddress = remoteAddr;
          this.state.localAddress = localAddr;
          // XXX parseAddress currently throws, should it return '' instead?
          this.state.accountAddress = parseAddress(remoteAddr);
        },
        async onClose(_connection, reason) {
          trace(`ICA Channel closed. Reason: ${reason}`);
          // XXX handle connection closing
          // XXX is there a scenario where a connection will unexpectedly close? _I think yes_
        },
        async onReceive(connection, bytes) {
          trace(`ICA Channel onReceive`, connection, bytes);
          return '';
        },
      },
    },
  );

export const OrchestrationI = M.interface('Orchestration', {
  createAccount: M.callWhen(M.string(), M.string()).returns(
    M.remotable('ChainAccount'),
  ),
});

/**
 * @param {Zone} zone
 * @param {ReturnType<typeof prepareChainAccount>} createChainAccount
 */
const prepareOrchestration = (zone, createChainAccount) =>
  zone.exoClassKit(
    'Orchestration',
    {
      self: M.interface('OrchestrationSelf', {
        bindPort: M.callWhen().returns(M.remotable()),
      }),
      public: OrchestrationI,
    },
    /** @param {Partial<OrchestrationPowers>} [initialPowers] */
    initialPowers => {
      /** @type {PowerStore} */
      const powers = zone.detached().mapStore('PowerStore');
      if (initialPowers) {
        for (const [name, power] of Object.entries(initialPowers)) {
          powers.init(/** @type {keyof OrchestrationPowers} */ (name), power);
        }
      }
      return { powers, icaControllerNonce: 0 };
    },
    {
      self: {
        async bindPort() {
          const network = getPower(this.state.powers, 'network');
          const port = await E(network)
            .bind(`/ibc-port/icacontroller-${this.state.icaControllerNonce}`)
            .catch(e => Fail`Failed to bind port: ${e}`);
          this.state.icaControllerNonce += 1;
          return port;
        },
      },
      public: {
        /**
         * @param {ConnectionId} hostConnectionId
         *   the counterparty connection_id
         * @param {ConnectionId} controllerConnectionId
         *   self connection_id
         * @returns {Promise<ChainAccount>}
         */
        async createAccount(hostConnectionId, controllerConnectionId) {
          const port = await this.facets.self.bindPort();

          const remoteConnAddr = makeICAConnectionAddress(
            hostConnectionId,
            controllerConnectionId,
          );
          const chainAccount = createChainAccount(port, remoteConnAddr);

          // await so we do not return a ChainAccount before it successfully instantiates
          await E(port)
            .connect(remoteConnAddr, chainAccount.connectionHandler)
            // XXX if we fail, should we close the port (if it was created in this flow)?
            .catch(e => Fail`Failed to create ICA connection: ${bare(e)}`);

          return chainAccount.account;
        },
      },
    },
  );

/** @param {Zone} zone */
export const prepareOrchestrationTools = zone => {
  const createChainAccount = prepareChainAccount(zone);
  const makeOrchestration = prepareOrchestration(zone, createChainAccount);

  return harden({ makeOrchestration });
};
harden(prepareOrchestrationTools);

/** @typedef {ReturnType<ReturnType<typeof prepareChainAccount>>} ChainAccountKit */
/** @typedef {ChainAccountKit['account']} ChainAccount */
/** @typedef {ReturnType<typeof prepareOrchestrationTools>} OrchestrationTools */
/** @typedef {ReturnType<OrchestrationTools['makeOrchestration']>} OrchestrationKit */
/** @typedef {OrchestrationKit['public']} Orchestration */
