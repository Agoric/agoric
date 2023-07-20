import '@endo/init';

import test from 'ava';
import { getNetworkConfig } from '../src/lib/networkConfig.js';

test('support AGORIC_NET', async t => {
  const env = { AGORIC_NET: 'devnet' };
  const config = {
    chainName: 'agoricdev-20',
    gci: 'https://devnet.rpc.agoric.net:443/genesis',
    peers: ['fb86a0993c694c981a28fa1ebd1fd692f345348b@34.30.39.238:26656'],
    rpcAddrs: ['https://devnet.rpc.agoric.net:443'],
    apiAddrs: ['https://devnet.api.agoric.net:443'],
    seeds: ['0f04c4610b7511a64b8644944b907416db568590@104.154.56.194:26656'],
  };
  const fetched = [];
  /** @type {typeof window.fetch} */
  // @ts-expect-error mock
  const fetch = async url => {
    fetched.push(url);
    return {
      json: async () => config,
    };
  };
  const actual = await getNetworkConfig(env, { fetch });
  t.deepEqual(actual, config);
  t.deepEqual(fetched, ['https://devnet.agoric.net/network-config']);
});
