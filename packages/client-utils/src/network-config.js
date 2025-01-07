/**
 * @typedef {{ rpcAddrs: string[], chainName: string }} MinimalNetworkConfig
 */

export const toNetworkConfigUrl = agoricNetSubdomain =>
  `https://${agoricNetSubdomain}.agoric.net/network-config`;

export const toRpcUrl = agoricNetSubdomain =>
  `https://${agoricNetSubdomain}.rpc.agoric.net:443`;

/** @satisfies {MinimalNetworkConfig} */
export const LOCAL_CONFIG = {
  rpcAddrs: ['http://0.0.0.0:26657'],
  chainName: 'agoriclocal',
};

export const LOCAL_CONFIG_KEY = 'local';

/**
 * Fetches the network config for the given network specifier.
 *
 * @param {string} spec
 * @param {{ fetch: typeof fetch }} io
 * @returns {Promise<MinimalNetworkConfig>}
 */
export const fetchNetworkConfig = async (spec, { fetch }) => {
  const [netName, chainName] = spec.split(',');

  if (netName === LOCAL_CONFIG_KEY) {
    return LOCAL_CONFIG;
  }

  if (chainName) {
    return { chainName, rpcAddrs: [toRpcUrl(netName)] };
  }

  return fetch(toNetworkConfigUrl(netName))
    .then(async res => res.json())
    .catch(err => {
      throw Error(`cannot get network config (${spec}): ${err.message}`);
    });
};
