/** @file Mock IBC Server */
// @ts-check
import { Far } from '@endo/far';
import { V as E } from '@agoric/vow/vat.js';

/**
 * @import {ListenHandler, PortAllocator} from '@agoric/network';
 */

/**
 * @param {ZCF} zcf
 * @param {{
 *   portAllocator: ERef<PortAllocator>;
 * }} privateArgs
 * @param {import('@agoric/vat-data').Baggage} _baggage
 */
export const start = async (zcf, privateArgs, _baggage) => {
  const { portAllocator } = privateArgs;

  const myPort = await E(portAllocator).allocateCustomIBCPort();

  const { log } = console;
  let connP;
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
    getAck: () => E.when(ackP),
    close: () => E(connP).close(),
    getLocalAddress: async () => {
      return E(myPort).getLocalAddress();
    },
  });

  return { creatorFacet };
};
