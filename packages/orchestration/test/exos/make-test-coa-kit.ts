/* eslint-disable jsdoc/require-param -- ts types */
import { heapVowE as E } from '@agoric/vow/vat.js';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/recorder.js';
import { Far, type EReturn } from '@endo/far';
import type { ExecutionContext } from 'ava';
import { prepareCosmosOrchestrationAccount } from '../../src/exos/cosmos-orchestration-account.js';
import { commonSetup } from '../supports.js';
import type { ICQConnection } from '../../src/exos/icq-connection-kit.js';

/**
 * A testing utility that creates a (Cosmos)ChainAccount and makes a
 * CosmosOrchestrationAccount with necessary endowments like: recorderKit,
 * storageNode, mock ZCF, mock TimerService, and a ChainHub.
 *
 * Helps reduce boilerplate in test files, and retains testing context through
 * parameterized endowments.
 */
export const prepareMakeTestCOAKit = (
  t: ExecutionContext,
  {
    bootstrap,
    commonPrivateArgs: { marshaller },
    facadeServices,
  }: EReturn<typeof commonSetup>,
  { noble } = { noble: false },
  { zcf = Far('MockZCF', {}) } = {},
) => {
  t.log('exo setup - prepareCosmosOrchestrationAccount');
  const { cosmosInterchainService, rootZone, timer, vowTools } = bootstrap;

  const { makeRecorderKit } = prepareRecorderKitMakers(
    rootZone.mapStore('CosmosOrchAccountRecorder'),
    marshaller,
  );

  const makeCosmosOrchestrationAccount = prepareCosmosOrchestrationAccount(
    rootZone.subZone('CosmosOrchAccount'),
    {
      chainHub: facadeServices.chainHub,
      makeRecorderKit,
      timerService: timer,
      vowTools,
      // @ts-expect-error mocked zcf
      zcf,
    },
  );

  return async ({
    storageNode = bootstrap.storage.rootNode.makeChildNode('accounts'),
    chainId = noble ? 'noble-1' : 'cosmoshub-4',
    hostConnectionId = 'connection-0' as const,
    controllerConnectionId = 'connection-1' as const,
    icqEnabled = false,
  } = {}) => {
    t.log('request account from orchestration service');
    const cosmosOrchAccount = await E(cosmosInterchainService).makeAccount(
      chainId,
      hostConnectionId,
      controllerConnectionId,
    );

    let icqConnection: ICQConnection | undefined;
    if (icqEnabled) {
      t.log('requesting icq connection from orchestration service');
      icqConnection = await E(cosmosInterchainService).provideICQConnection(
        controllerConnectionId,
      );
    }

    const [chainAddress, localAddress, remoteAddress] = await Promise.all([
      E(cosmosOrchAccount).getAddress(),
      E(cosmosOrchAccount).getLocalAddress(),
      E(cosmosOrchAccount).getRemoteAddress(),
    ]);

    t.log('make a CosmosOrchestrationAccount');
    const holder = makeCosmosOrchestrationAccount(
      { chainAddress, localAddress, remoteAddress },
      {
        account: cosmosOrchAccount,
        storageNode: storageNode.makeChildNode(chainAddress.value),
        icqConnection,
        timer,
      },
    );
    return holder;
  };
};
