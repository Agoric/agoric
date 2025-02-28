import type { ExecutionContext } from 'ava';
import { dirname, join } from 'path';
import { execa } from 'execa';
import fse from 'fs-extra';
import childProcess from 'node:child_process';
import {
  withChainCapabilities,
  type CosmosChainInfo,
} from '@agoric/orchestration';
import { makeAgdTools } from '../tools/agd-tools.js';
import { type E2ETools } from '../tools/e2e-tools.js';
import {
  makeGetFile,
  makeSetupRegistry,
  type MultichainRegistry,
} from '../tools/registry.js';
import { generateMnemonic } from '../tools/wallet.js';
import { makeRetryUntilCondition } from '../tools/sleep.js';
import { makeDeployBuilder } from '../tools/deploy.js';
import { makeRelayer } from '../tools/relayer-tools.js';
import { makeNobleTools } from '../tools/noble-tools.js';
import { makeAssetInfo } from '../tools/asset-info.js';
import starshipChainInfo from '../starship-chain-info.js';
import { makeFaucetTools } from '../tools/faucet-tools.js';

export const FAUCET_POUR = 10_000n * 1_000_000n;

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
} as const;

const makeKeyring = async (
  e2eTools: Pick<E2ETools, 'addKey' | 'deleteKey'>,
) => {
  let _keys = ['user1'];
  const setupTestKeys = async (
    keys = ['user1'],
    mnemonics?: (string | undefined)[],
  ) => {
    _keys = keys;
    const wallets: Record<string, string> = {};
    for (const i in keys) {
      const res = await e2eTools.addKey(
        keys[i],
        mnemonics?.[i] || generateMnemonic(),
      );
      const { address } = JSON.parse(res);
      wallets[keys[i]] = address;
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

export const commonSetup = async (
  t: ExecutionContext,
  {
    relayerType = process.env.RELAYER_TYPE,
    config = `../config${relayerType ? '.' + relayerType : ''}.yaml`,
  } = {},
) => {
  let useChain: MultichainRegistry['useChain'];
  try {
    const registry = await setupRegistry({
      config,
    });
    useChain = registry.useChain;
  } catch (e) {
    console.error('setupRegistry failed', e);
    throw e;
  }
  const tools = await makeAgdTools(t.log, childProcess);
  const keyring = await makeKeyring(tools);
  const deployBuilder = makeDeployBuilder(tools, fse.readJSON, execa);
  const retryUntilCondition = makeRetryUntilCondition({
    log: t.log,
    setTimeout: globalThis.setTimeout,
  });
  const relayer = makeRelayer(childProcess);
  const nobleTools = makeNobleTools(childProcess);
  const assetInfo = makeAssetInfo(starshipChainInfo);

  const unreachableChain: CosmosChainInfo = {
    chainId: 'unreachable-chain',
    bech32Prefix: 'unreachable',
    connections: {
      noblelocal: {
        client_id: '07-tendermint-898989',
        counterparty: {
          client_id: '07-tendermint-989898',
          connection_id: 'connection-767676',
        },
        id: 'connection-424242',
        state: 3,
        transferChannel: {
          channelId: 'channel-242424',
          counterPartyChannelId: 'channel-656565',
          counterPartyPortId: 'transfer',
          ordering: 0,
          portId: 'transfer',
          state: 3,
          version: 'ics20-1',
        },
      },
    },
  };

  const chainInfo = {
    ...withChainCapabilities(starshipChainInfo),
    ...withChainCapabilities({ unreachableChain }),
  };
  const faucetTools = makeFaucetTools(
    t,
    tools.agd,
    retryUntilCondition,
    useChain,
  );
  const commonBuilderOpts = harden({
    assetInfo: JSON.stringify(assetInfo),
    chainInfo: JSON.stringify(chainInfo),
  });

  /**
   * Starts a contract if instance not found. Takes care of installing
   * bundles and voting on the CoreEval proposal.
   *
   * @param contractName name of the contract in agoricNames
   * @param contractBuilder path to proposal builder
   */
  const startContract = async (
    contractName: string,
    contractBuilder: string,
    builderOpts?: Record<string, string | string[]>,
    { skipInstanceCheck = false } = {},
  ) => {
    await null;
    const { vstorageClient } = tools;
    if (!skipInstanceCheck) {
      const instances = Object.fromEntries(
        await vstorageClient.queryData(`published.agoricNames.instance`),
      );
      if (contractName in instances) {
        return t.log('Contract found. Skipping installation...');
      }
    }
    t.log('bundle and install contract', contractName);
    await deployBuilder(contractBuilder, builderOpts);
    await retryUntilCondition(
      () => vstorageClient.queryData(`published.agoricNames.instance`),
      res => contractName in Object.fromEntries(res),
      `${contractName} instance is available`,
    );
  };

  return {
    useChain,
    ...tools,
    ...keyring,
    retryUntilCondition,
    deployBuilder,
    relayer,
    nobleTools,
    startContract,
    assetInfo,
    chainInfo,
    commonBuilderOpts,
    faucetTools,
  };
};

export type SetupContext = Awaited<ReturnType<typeof commonSetup>>;
export type SetupContextWithWallets = Omit<SetupContext, 'setupTestKeys'> & {
  wallets: Record<string, string>;
};
