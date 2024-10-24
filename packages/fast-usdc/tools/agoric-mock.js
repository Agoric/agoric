import { btoa } from '@endo/base64';
import { AgoricCalc } from '@agoric/orchestration/src/utils/address.js';
import { ibcTransfer } from './cosmoverse-mock.js';

/**
 * @import {Remote} from '@agoric/vow';
 * @import {OrchestrationAccount} from '@agoric/orchestration';
 * @import {LocalAccountMethods} from '@agoric/orchestration';
 * @import {TargetRegistration} from '@agoric/vats/src/bridge-target.js';
 * @import {CosmosChain} from './cosmoverse-mock.js';
 * @import {ExecutionContext as AvaT} from 'ava';
 */

/**
 * @param {AvaT<any>} t
 * @param {{
 *  agoric: ReturnType<typeof withVTransfer>
 *  } & Record<string, CosmosChain>
 * } chains
 * @param {{ brand: Brand; denom: string }[]} assetInfo
 */
export const makeOrchestration = (t, chains, assetInfo) => {
  const { nextLabel: next } = t.context;
  const encoding = 'bech32';
  /** @returns {Promise<OrchestrationAccount<any>>} */
  const makeAccount = async () => {
    const addr = await chains.agoric.makeAccount();
    // @ts-expect-error only some methods are mocked
    return harden({
      /** @type {OrchestrationAccount<any>['getAddress']} */
      getAddress: () => ({ value: addr, chainId: 'agoric3', encoding }),
      /** @type {OrchestrationAccount<any>['getPublicTopics']} */
      getPublicTopics: async () => ({
        account: {
          subscriber: {
            subscribeAfter: async _ => ({
              value: addr,
              publishCount: 1n,
              head: /** @type {any} */ (null),
              tail: /** @type {any} */ (null),
            }),
            getUpdateSince: async _ => ({ value: addr, updateCount: 1n }),
          },
          storagePath: 'XXX',
        },
      }),
      /** @type {OrchestrationAccount<any>['transfer']} */
      transfer: async (dest, { value: amount }) => {
        t.log(next(), 'orch acct', addr, 'txfr', amount, 'to', dest.value);
        await ibcTransfer(chains, { amount, dest: dest.value, from: addr, t });
      },
      /** @type {OrchestrationAccount<any>['send']} */
      send: async (dest, { value: amount }) => {
        t.log(next(), 'orch acct', addr, 'send', amount, 'to', dest.value);
        await chains.agoric.send({ amount, dest: dest.value, from: addr });
      },
      /** @type {LocalAccountMethods['monitorTransfers']} */
      monitorTransfers: async tap => {
        return chains.agoric.register({ addr, tap });
      },
    });
  };
  const chainHub = harden({
    agoric: { makeAccount, getVBankAssetInfo: async () => assetInfo },
  });
  return harden({
    getChain: name => chainHub[name],
  });
};

export const makeVStorage = () => {
  const data = new Map();
  /** @type {Remote<StorageNode>} */
  const storageNode = harden({
    makeChildNode: path =>
      // @ts-expect-error mock
      harden({
        /** @param {string} value */
        setValue: value => data.set(path, value),
      }),
  });
  const rpc = harden({
    getData: async path => data.get(path),
  });

  return { storageNode, rpc };
};

const mkEvent = data => ({ packet: { data: btoa(JSON.stringify(data)) } });

/**
 * @param {CosmosChain} chain
 * @param {AvaT} t
 */
export const withVTransfer = (chain, t) => {
  const addrToTap = new Map();
  return harden({
    ...chain,
    /**
     * @param {{addr: string, tap: {receiveUpcall: (obj: any) => Promise<any>}}} param0
     * @returns {Promise<TargetRegistration>}
     */
    register: async ({ addr, tap }) => {
      t.log('vtransfer register', { addr, tap });
      !addrToTap.has(addr) || assert.fail('already registered');
      addrToTap.set(addr, tap);
      return harden({
        revoke: async () => {},
        updateTargetApp: async () => {},
      });
    },
    send: async ({ amount, from, dest }) => {
      const [agAddr, extra] = AgoricCalc.isVirtualAddress(dest)
        ? AgoricCalc.virtualAddressParts(dest)
        : [dest, undefined];
      const quiet = true;
      const result = await chain.send({ amount, from, dest: agAddr, quiet });

      if (extra === undefined) return result;
      t.log('vtransfer to virtual address', { agAddr, extra });
      if (!addrToTap.has(agAddr)) return result;

      const handler = addrToTap.get(agAddr);
      handler.receiveUpcall(mkEvent({ amount: Number(amount), extra }));

      return result;
    },
  });
};
