import type { ExecutionContext } from 'ava';
import { dirname, join } from 'path';
import { execa } from 'execa';
import fse from 'fs-extra';
import childProcess from 'node:child_process';
import { makeAgdTools } from '../tools/agd-tools.js';
import { type E2ETools } from '../tools/e2e-tools.js';
import { makeGetFile, makeSetupRegistry } from '../tools/registry.js';
import { generateMnemonic } from '../tools/wallet.js';
import { makeRetryUntilCondition } from '../tools/sleep.js';
import { makeDeployBuilder } from '../tools/deploy.js';

const setupRegistry = makeSetupRegistry(makeGetFile({ dirname, join }));

// XXX consider including bech32Prefix in `ChainInfo`
export const chainConfig: Record<string, { expectedAddressPrefix: string }> = {
  cosmoshub: {
    expectedAddressPrefix: 'cosmos',
  },
  osmosis: {
    expectedAddressPrefix: 'osmo',
  },
  agoric: {
    expectedAddressPrefix: 'agoric',
  },
  agoricdriver: {
    expectedAddressPrefix: 'agoric',
  },
} as const;

export const chainNames = Object.keys(chainConfig);

const makeKeyring = async (
  e2eTools: Pick<E2ETools, 'addKey' | 'deleteKey'>,
) => {
  let _keys = ['user1'];
  const setupTestKeys = async (keys = ['user1']) => {
    _keys = keys;
    const wallets: Record<string, string> = {};
    for (const name of keys) {
      const walletMnemonic = generateMnemonic();
      const res = await e2eTools.addKey(name, walletMnemonic);
      const { address } = JSON.parse(res);
      wallets[name] = address;
      wallets[`seed.${name}`] = walletMnemonic;
    }
    return wallets;
  };

  const deleteTestKeys = (keys: string[] = []) =>
    Promise.allSettled(
      Array.from(new Set([...keys, ..._keys])).map(key =>
        e2eTools.deleteKey(key).catch(),
      ),
    ).catch();

  return { setupTestKeys, deleteTestKeys };
};

export const commonSetup = async (t: ExecutionContext, agoricChainName = 'agoric') => {
  const { useChain } = await setupRegistry();
  const agoricChain = useChain(agoricChainName);
  const tools = await makeAgdTools(t.log, childProcess, agoricChain.chain.chain_id, agoricChain.getRpcEndpoint(), agoricChain.getRestEndpoint());
  const keyring = await makeKeyring(tools);
  const deployBuilder = makeDeployBuilder(tools, fse.readJSON, execa);
  const retryUntilCondition = makeRetryUntilCondition({
    log: t.log,
    setTimeout: globalThis.setTimeout,
  });

  return { useChain, ...tools, ...keyring, retryUntilCondition, deployBuilder };
};

export type SetupContext = Awaited<ReturnType<typeof commonSetup>>;
export type SetupContextWithWallets = Omit<SetupContext, 'setupTestKeys'> & {
  wallets: Record<string, string>;
};
