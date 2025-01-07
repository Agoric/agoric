/** @file Mock IBC Server */
// @ts-check
import { Far } from '@endo/far';
import { heapVowE as E } from '@agoric/vow/vat.js';

/**
 * @import {Connection, PortAllocator} from '@agoric/network';
 * @import {FarRef} from '@agoric/internal';
 * @import {ERef} from '@agoric/vow';
 */

/**
 * @param {ZCF} zcf
 * @param {{
 *   portAllocator: FarRef<PortAllocator>;
 * }} privateArgs
 * @param {import('@agoric/vat-data').Baggage} _baggage
 */
export const start = async (zcf, privateArgs, _baggage) => {
  const { portAllocator } = privateArgs;

  const myPort = await E(portAllocator).allocateCustomIBCPort();

  const { log } = console;
  /**
   * @type {FarRef<Connection>}
   */
  let connP;
  /**
   * @type {ERef<string>}
   */
  let ackP;

  const creatorFacet = Far('CF', {
    connect: remote => {
      log('connect', remote);
      // don't return the promise.
      // We want to test a promise that lasts across cranks.
      connP = E(myPort).connect(
        remote,

        // TODO: handler
      );
    },
    send: data => {
      log('send', data);
      assert(connP, 'must connect first');
      ackP = E(connP).send(data);
    },
    getAck: async () => E.when(ackP),
    close: async () => E(connP).close(),
    getLocalAddress: async () => {
      return E(myPort).getLocalAddress();
    },
  });

  return { creatorFacet };
};
