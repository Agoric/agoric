// @ts-check
import { Far } from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';

import { parse } from '@agoric/swingset-vat/src/vats/network/multiaddr.js';

/**
 * Return a source-prefixed version of the denomination, as specified in ICS20-1.
 *
 * @param {Address} addr
 * @param {Denom} denom
 */
const sourcePrefixedDenom = (addr, denom) => {
  const ma = parse(addr);

  const ibcPort = ma.find(([protocol]) => protocol === 'ibc-port');
  assert(ibcPort, X`${addr} does not contain an IBC port`);
  const ibcChannel = ma.find(([protocol]) => protocol === 'ibc-channel');
  assert(ibcChannel, X`${addr} does not contain an IBC channel`);

  return `${ibcPort[1]}/${ibcChannel[1]}/${denom}`;
};

/** @type {DenomTransformer} */
const transformer = {
  getDenomsForLocalPeg: async (denom, _localAddress, remoteAddress) => {
    return {
      sendDenom: denom,
      receiveDenom: sourcePrefixedDenom(remoteAddress, denom),
    };
  },
  getDenomsForRemotePeg: async (denom, localAddress, _remoteAddress) => {
    return {
      sendDenom: sourcePrefixedDenom(localAddress, denom),
      receiveDenom: denom,
    };
  },
};

export const IBCSourceTraceDenomTransformer = Far(
  'IBC source trace denom transformer',
  transformer,
);
