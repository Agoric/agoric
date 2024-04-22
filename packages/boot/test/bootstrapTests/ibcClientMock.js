/** @file Mock IBC Server */
// @ts-check
import { Far } from '@endo/far';
import { V as E } from '@agoric/vat-data/vow.js';

/**
 * @param {ZCF} zcf
 * @param {{
 *   networkVat: ERef<ReturnType<typeof import('@agoric/vats/src/vat-network').buildRootObject>>;
 * }} privateArgs
 * @param {import("@agoric/vat-data").Baggage} _baggage
 */
export const start = async (zcf, privateArgs, _baggage) => {
  const { networkVat } = privateArgs;

  const portAllocator = await E(networkVat).getPortAllocator();
  const myPort = E(portAllocator).allocateIBCPort();

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
