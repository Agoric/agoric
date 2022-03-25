// @ts-check

import { E as defaultE } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeStore } from '@agoric/store';
import { assert, details as X } from '@agoric/assert';
import { makeNetworkProtocol, ENDPOINT_SEPARATOR } from './network.js';

import '@agoric/store/exported.js';
import './types.js';

/**
 * @typedef {Object} Router A delimited string router implementation
 * @property {(addr: string) => [string, Protocol][]} getRoutes Return the match
 *   and route in order of preference
 * @property {(prefix: string, route: Protocol) => void} register Add a
 *   prefix->route to the database
 * @property {(prefix: string, route: Protocol) => void} unregister Remove a
 *   prefix->route from the database
 */

/**
 * Create a slash-delimited router.
 *
 * @returns {Router} A new Router
 */
export default function makeRouter() {
  /** @type {Store<string, any>} */
  const prefixToRoute = makeStore('prefix');
  return Far('Router', {
    getRoutes(addr) {
      const parts = addr.split(ENDPOINT_SEPARATOR);
      /** @type {[string, Protocol][]} */
      const ret = [];
      for (let i = parts.length; i > 0; i -= 1) {
        // Try most specific match.
        const prefix = parts.slice(0, i).join(ENDPOINT_SEPARATOR);
        if (prefixToRoute.has(prefix)) {
          ret.push([prefix, prefixToRoute.get(prefix)]);
        }
        // Trim off the last value (after the slash).
        const defaultPrefix = prefix.substr(
          0,
          prefix.lastIndexOf(ENDPOINT_SEPARATOR) + 1,
        );
        if (prefixToRoute.has(defaultPrefix)) {
          ret.push([defaultPrefix, prefixToRoute.get(defaultPrefix)]);
        }
      }
      return harden(ret);
    },
    register(prefix, route) {
      prefixToRoute.init(prefix, route);
    },
    unregister(prefix, route) {
      assert(
        prefixToRoute.get(prefix) === route,
        X`Router is not registered at prefix ${prefix}`,
        TypeError,
      );
      prefixToRoute.delete(prefix);
    },
  });
}
/**
 * @typedef {Object} RouterProtocol
 * @property {(prefix: string) => Promise<Port>} bind
 * @property {(paths: string[], protocolHandler: ProtocolHandler) => void} registerProtocolHandler
 * @property {(prefix: string, protocolHandler: ProtocolHandler) => void} unregisterProtocolHandler
 */

/**
 * Create a router that behaves like a Protocol.
 *
 * @param {typeof defaultE} [E=defaultE] Eventual sender
 * @returns {RouterProtocol} The new delegated protocol
 */
export function makeRouterProtocol(E = defaultE) {
  const router = makeRouter();
  const protocols = makeStore('prefix');
  const protocolHandlers = makeStore('prefix');

  function registerProtocolHandler(paths, protocolHandler) {
    const protocol = makeNetworkProtocol(protocolHandler);
    for (const prefix of paths) {
      router.register(prefix, protocol);
      protocols.init(prefix, protocol);
      protocolHandlers.init(prefix, protocolHandler);
    }
  }

  // FIXME: Buggy.
  // Needs to account for multiple paths.
  function unregisterProtocolHandler(prefix, protocolHandler) {
    const ph = protocolHandlers.get(prefix);
    assert(
      ph === protocolHandler,
      X`Protocol handler is not registered at prefix ${prefix}`,
      TypeError,
    );
    router.unregister(prefix, ph);
    protocols.delete(prefix);
    protocolHandlers.delete(prefix);
  }

  /** @type {Protocol['bind']} */
  async function bind(localAddr) {
    const [route] = router.getRoutes(localAddr);
    assert(
      route !== undefined,
      X`No registered router for ${localAddr}`,
      TypeError,
    );
    return E(route[1]).bind(localAddr);
  }

  return Far('RouterProtocol', {
    bind,
    registerProtocolHandler,
    unregisterProtocolHandler,
  });
}
