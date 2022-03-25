/**
 * @typedef {[string, string][]} Multiaddr
 *
 * @typedef {string} Textaddr An address string formatted as in
 *   https://github.com/multiformats/multiaddr
 *
 *   Here is the difference between Textaddr and Multiaddr:
 *
 *   Unspecified port on local ibc interface: /if/ibc0 [['if', 'ibc0']] specific
 *   local port: /if/ibc0/ordered/transfer [['if', 'ibc0'], ['ordered', 'transfer']]
 *
 *   Remote pointer to chain: /dnsaddr/ibc.testnet.agoric.com/ordered/transfer
 *   [['dnsaddr', 'ibc.testnet.agoric.com'], ['ordered', 'transfer']] resolve
 *   step to another pointer:
 *   /dnsaddr/rpc.testnet.agoric.com/ibc/testnet-1.19.0/gci/4bc8d.../ordered/transfer
 *   [['dnsaddr', 'rpc.testnet.agoric.com'], ['ibc', 'testnet-1.19.0'], ['gci',
 *   '4bc8d...'], ['ordered', 'transfer']] resolve to the individual interfaces:
 *   /ip4/172.17.0.4/tcp/26657/tendermint/0.33/ibc/testnet-1.19.0/gci/4bc8d.../ordered/transfer
 *   [['ip4', '172.17.0.4'], ['tcp', '26657'], ['tendermint', '0.33'], ['ibc',
 *   'testnet-1.19.0'], ['gci', '4bc8d...'], ['ordered', 'transfer']]
 */

/**
 * Transform a text address to a parsed multiaddr
 *
 * @param {Textaddr} ma
 * @returns {Multiaddr}
 */
export function parse(ma) {
  if (typeof ma !== 'string') {
    return ma;
  }
  let s = ma;
  let m;
  /** @type {[string, string][]} */
  const acc = [];
  // eslint-disable-next-line no-cond-assign
  while ((m = s.match(/^\/([^/]*)(\/([^/]*))?/))) {
    s = s.substr(m[0].length);
    if (m[2]) {
      acc.push([m[1], m[3]]);
    } else {
      acc.push([m[1]]);
    }
  }
  if (s !== '' || s === ma) {
    throw TypeError(
      `Error parsing Multiaddr ${JSON.stringify(ma)} at ${JSON.stringify(s)}`,
    );
  }
  return acc;
}

/**
 * Transform a parsed multiaddr to a string.
 *
 * @param {Multiaddr | Textaddr} ma
 * @returns {Textaddr}
 */
export function unparse(ma) {
  if (typeof ma === 'string') {
    return ma;
  }
  const joined = ma.map(kv => kv.join('/')).join('/');
  return `/${joined}`;
}
