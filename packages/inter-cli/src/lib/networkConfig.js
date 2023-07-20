// @ts-check
import { M, mustMatch } from '@endo/patterns';

/**
 * @typedef {{ rpcAddrs: string[], chainName: string }} MinimalNetworkConfig
 */

const { freeze } = Object;
const localConfig = freeze({
  rpcAddrs: ['http://0.0.0.0:26657'],
  chainName: 'agoriclocal',
});

export const networkConfigUrl = agoricNetSubdomain =>
  `https://${agoricNetSubdomain}.agoric.net/network-config`;
export const rpcUrl = agoricNetSubdomain =>
  `https://${agoricNetSubdomain}.rpc.agoric.net:443`;

const ConfigShape = M.splitRecord({
  rpcAddrs: M.arrayOf(M.string()),
  chainName: M.string(),
});

/**
 * @param {typeof process.env} env
 * @param {object} io
 * @param {typeof window.fetch} io.fetch
 * @returns {Promise<MinimalNetworkConfig>}
 */
export const getNetworkConfig = async (env, { fetch }) => {
  const { AGORIC_NET = 'local' } = env;
  if (AGORIC_NET === 'local') {
    return localConfig;
  }

  /**
   * @param {string} str
   * @returns {Promise<MinimalNetworkConfig>}
   */
  const fromAgoricNet = async str => {
    const [netName, chainName] = str.split(',');
    if (chainName) {
      return freeze({ chainName, rpcAddrs: [rpcUrl(netName)] });
    }
    const config = await fetch(networkConfigUrl(netName)).then(res =>
      res.json(),
    );
    harden(config);
    mustMatch(config, ConfigShape);
    return config;
  };

  return fromAgoricNet(AGORIC_NET).catch(err => {
    throw Error(`cannot get network config (${AGORIC_NET}): ${err.message}`);
  });
};
