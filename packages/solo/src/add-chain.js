/* global process */
import fetch from 'node-fetch';
import crypto from 'crypto';
import djson from 'deterministic-json';
import path from 'path';
import fs from 'fs';

import { assert, details as X } from '@agoric/assert';
import setGCIIngress from './set-gci-ingress.js';

const DEFAULT_CHAIN_CONFIG = 'https://testnet.agoric.com/network-config';

/**
 * @param {string} basedir
 * @param {string} [chainConfig]
 * @param {boolean} [force=false]
 */
async function addChain(basedir, chainConfig, force = false) {
  let actualConfig = chainConfig;
  const cache = path.join(basedir, 'add-chain-default.txt');
  if (actualConfig === undefined) {
    if (fs.existsSync(cache)) {
      actualConfig = fs.readFileSync(cache, 'utf-8');
    } else {
      actualConfig = DEFAULT_CHAIN_CONFIG;
    }
  }

  const url = new URL(actualConfig, `file://${process.cwd()}`);
  console.log('downloading netconfig from', url.href);
  let netconf;
  if (url.protocol === 'file:') {
    const f = fs.readFileSync(url.pathname, 'utf-8');
    netconf = JSON.parse(f);
  } else {
    const r = await fetch(url.href);
    netconf = await r.json();
  }
  const gciUrl = new URL(netconf.gci, 'unspecified://');
  if (gciUrl.protocol !== 'unspecified:') {
    const g = await fetch(gciUrl.href);
    const resp = await g.json();
    let genesis = resp;
    if (resp.jsonrpc === '2.0') {
      // JSON-RPC embedded genesis.
      genesis = resp.result.genesis;
    }

    if (!genesis.genesis_time) {
      throw Error(
        `Malformed JSON genesis response from ${gciUrl.href}: ${JSON.stringify(
          resp,
          null,
          2,
        )}`,
      );
    }
    const s = djson.stringify(resp.result);
    const gci = crypto.createHash('sha256').update(s).digest('hex');

    netconf.gci = gci;
  }

  assert(netconf.gci, X`${url.href} does not contain a "gci" entry`);

  const connFile = path.join(basedir, 'connections.json');
  const conns = JSON.parse(fs.readFileSync(connFile));
  for (const conn of conns) {
    if (conn.GCI === netconf.gci) {
      if (!force) {
        console.log(`Already have an entry for ${conn.GCI}; not replacing`);
        return 0;
      }
    }
  }

  console.log('Setting chain parameters');
  setGCIIngress(basedir, netconf.gci, netconf.rpcAddrs, netconf.chainName);

  if (chainConfig === undefined) {
    console.log('Writing', actualConfig, 'to', cache);
    fs.writeFileSync(cache, actualConfig);
  }
  return 0;
}

export default addChain;
