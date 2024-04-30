// @ts-check
import { E as defaultE } from '@endo/far';
import { M } from '@endo/patterns';
import { Fail } from '@agoric/assert';
import { ENDPOINT_SEPARATOR, prepareNetworkProtocol } from './network.js';
import { Shape } from './shapes.js';

import '@agoric/store/exported.js';
/// <reference path="./types.js" />

/**
 * @import {VowTools} from '@agoric/vow';
 */

/**
 * @template T
 * @typedef {object} Router A delimited string router implementation
 * @property {(addr: string) => [string, T][]} getRoutes Return the match and
 *   route in order of preference
 * @property {(prefix: string, route: T) => void} register Add a prefix->route
 *   to the database
 * @property {(prefix: string, route: T) => void} unregister Remove a
 *   prefix->route from the database
 */

export const RouterI = M.interface('Router', {
  getRoutes: M.call(Shape.Endpoint).returns(M.arrayOf([M.string(), M.any()])),
  register: M.call(M.string(), M.any()).returns(M.undefined()),
  unregister: M.call(M.string(), M.any()).returns(M.undefined()),
});

/**
 * @template T
 * @param {import('@agoric/base-zone').Zone} zone
 */
export const prepareRouter = zone => {
  const detached = zone.detached();

  const makeRouter = zone.exoClass(
    'Router',
    RouterI,
    () => {
      /** @type {MapStore<string, T>} */
      const prefixToRoute = detached.mapStore('prefix');

      return {
        prefixToRoute,
      };
    },
    {
      /** @param {Endpoint} addr */
      getRoutes(addr) {
        const parts = addr.split(ENDPOINT_SEPARATOR);
        /** @type {[string, T][]} */
        const ret = [];
        for (let i = parts.length; i > 0; i -= 1) {
          // Try most specific match.
          const prefix = parts.slice(0, i).join(ENDPOINT_SEPARATOR);
          if (this.state.prefixToRoute.has(prefix)) {
            ret.push([prefix, this.state.prefixToRoute.get(prefix)]);
          }
          // Trim off the last value (after the slash).
          const defaultPrefix = prefix.slice(
            0,
            prefix.lastIndexOf(ENDPOINT_SEPARATOR) + 1,
          );
          if (this.state.prefixToRoute.has(defaultPrefix)) {
            ret.push([
              defaultPrefix,
              this.state.prefixToRoute.get(defaultPrefix),
            ]);
          }
        }
        return harden(ret);
      },
      /**
       * @param {string} prefix
       * @param {T} route
       */
      register(prefix, route) {
        this.state.prefixToRoute.init(prefix, route);
      },
      /**
       * @param {string} prefix
       * @param {T} route
       */
      unregister(prefix, route) {
        this.state.prefixToRoute.get(prefix) === route ||
          Fail`Router is not registered at prefix ${prefix}`;
        this.state.prefixToRoute.delete(prefix);
      },
    },
  );

  return makeRouter;
};

/**
 * @typedef {object} RouterProtocol
 * @property {(prefix: string) => PromiseVow<Port>} bindPort
 * @property {(paths: string[], protocolHandler: ProtocolHandler) => void} registerProtocolHandler
 * @property {(prefix: string, protocolHandler: ProtocolHandler) => void} unregisterProtocolHandler
 */

/**
 * Create a router that behaves like a Protocol.
 *
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {VowTools} powers
 * @param {typeof defaultE} [E] Eventual sender
 */
export const prepareRouterProtocol = (zone, powers, E = defaultE) => {
  const detached = zone.detached();

  const makeRouter = prepareRouter(zone);
  const makeNetworkProtocol = prepareNetworkProtocol(zone, powers);

  const makeRouterProtocol = zone.exoClass(
    'RouterProtocol',
    M.interface('RouterProtocol', {
      registerProtocolHandler: M.call(
        M.arrayOf(M.string()),
        M.remotable(),
      ).returns(),
      unregisterProtocolHandler: M.call(M.string(), M.remotable()).returns(),
      bindPort: M.callWhen(Shape.Endpoint).returns(Shape.Vow$(Shape.Port)),
    }),
    () => {
      /** @type {Router<Protocol>} */
      const router = makeRouter();

      /** @type {MapStore<string, Protocol>} */
      const protocols = detached.mapStore('prefix');

      /** @type {MapStore<string, Remote<ProtocolHandler>>} */
      const protocolHandlers = detached.mapStore('prefix');

      return {
        router,
        protocolHandlers,
        protocols,
      };
    },
    {
      /**
       * @param {string[]} paths
       * @param {Remote<ProtocolHandler>} protocolHandler
       */
      registerProtocolHandler(paths, protocolHandler) {
        const protocol = makeNetworkProtocol(protocolHandler);
        for (const prefix of paths) {
          this.state.router.register(prefix, protocol);
          this.state.protocols.init(prefix, protocol);
          this.state.protocolHandlers.init(prefix, protocolHandler);
        }
      },
      // FIXME: Buggy.
      // Needs to account for multiple paths.
      /**
       * @param {string} prefix
       * @param {Remote<ProtocolHandler>} protocolHandler
       */
      unregisterProtocolHandler(prefix, protocolHandler) {
        const ph = this.state.protocolHandlers.get(prefix);
        ph === protocolHandler ||
          Fail`Protocol handler is not registered at prefix ${prefix}`;
        // TODO: unmap protocol handlers to their corresponding protocol
        // e.g. using a map
        // before unregistering
        // @ts-expect-error note FIXME above
        this.state.router.unregister(prefix, ph);
        this.state.protocols.delete(prefix);
        this.state.protocolHandlers.delete(prefix);
      },
      /** @param {Endpoint} localAddr */
      async bindPort(localAddr) {
        const [route] = this.state.router.getRoutes(localAddr);
        route !== undefined || Fail`No registered router for ${localAddr}`;
        return E(route[1]).bindPort(localAddr);
      },
    },
  );

  return makeRouterProtocol;
};
