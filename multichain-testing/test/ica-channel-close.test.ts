import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import type { CosmosOrchestrationAccountStorageState } from '@agoric/orchestration/src/exos/cosmos-orchestration-account.js';
import type { IdentifiedChannelSDKType } from '@agoric/cosmic-proto/ibc/core/channel/v1/channel.js';
import type { IBCChannelID, IBCPortID } from '@agoric/vats';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { commonSetup, type SetupContext, chainConfig } from './support.js';
import { makeQueryClient } from '../tools/query.js';
import { parseLocalAddress, parseRemoteAddress } from '../tools/address.js';
import chainInfo from '../starship-chain-info.js';
import { TWO_MINUTES } from './config.js';
import { sleep } from '../tools/sleep.js';

const test = anyTest as TestFn<SetupContext>;

const accounts = ['cosmoshub', 'osmosis'];

const contractName = 'basicFlows';
const contractBuilder =
  '../packages/builders/scripts/orchestration/init-basic-flows.js';

test.before(async t => {
  t.context = await commonSetup(t, accounts);
  const { startContract } = t.context;
  await startContract(contractName, contractBuilder);
});

test.after(async t => {
  const { deleteTestKeys } = t.context;
  await deleteTestKeys(accounts);
});

// XXX until https://github.com/Agoric/agoric-sdk/issues/9066,
// where localAddr + remoteAddr are reliably published to vstorage,
// us original port to determine new channelID. currently, vstorage
// values won't be updated when the ICA channel is reopened.
const findNewChannel = (
  channels: IdentifiedChannelSDKType[],
  { rPortID, lPortID }: { rPortID: IBCPortID; lPortID: IBCPortID },
) =>
  channels.find(
    c =>
      c.port_id === rPortID &&
      c.counterparty.port_id === lPortID &&
      // @ts-expect-error ChannelSDKType.state is a string not a number
      c.state === 'STATE_OPEN',
  );

/** The account holder chooses to close their ICA account (channel) */
const intentionalCloseAccountScenario = test.macro({
  title: (_, chainName: string) => `Close and reopen account on ${chainName}`,
  exec: async (t, chainName: string) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);

    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
    } = t.context;

    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);

    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} makeAccount offer`);
    const offerId = `${chainName}-makeAccount-${Date.now()}`;

    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeOrchAccountInvitation']],
      },
      offerArgs: { chainName },
      proposal: {},
    });
    const currentWalletRecord = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
      ({ offerToPublicSubscriberPaths }) =>
        Object.fromEntries(offerToPublicSubscriberPaths)[offerId],
      `${offerId} continuing invitation is in vstorage`,
    );
    const offerToPublicSubscriberMap = Object.fromEntries(
      currentWalletRecord.offerToPublicSubscriberPaths,
    );

    const accountStoragePath = offerToPublicSubscriberMap[offerId]?.account;
    t.assert(accountStoragePath, 'account storage path returned');
    const address = accountStoragePath.split('.').pop();
    t.log('Got address:', address);

    const {
      remoteAddress,
      localAddress,
    }: CosmosOrchestrationAccountStorageState =
      await vstorageClient.queryData(accountStoragePath);
    const { rPortID, rChannelID } = parseRemoteAddress(remoteAddress);

    const remoteQueryClient = makeQueryClient(
      await useChain(chainName).getRestEndpoint(),
    );
    const localQueryClient = makeQueryClient(
      await useChain('agoric').getRestEndpoint(),
    );

    const { channel } = await retryUntilCondition(
      () => remoteQueryClient.queryChannel(rPortID, rChannelID),
      // @ts-expect-error ChannelSDKType.state is a string not a number
      ({ channel }) => channel?.state === 'STATE_OPEN',
      `ICA channel is open on Host - ${chainName}`,
    );
    t.log('Channel State Before', channel);
    // @ts-expect-error ChannelSDKType.state is a string not a number
    t.is(channel?.state, 'STATE_OPEN', 'channel is open');

    const closeAccountOfferId = `${chainName}-deactivateAccount-${Date.now()}`;
    await doOffer({
      id: closeAccountOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: offerId,
        invitationMakerName: 'DeactivateAccount',
      },
      proposal: {},
    });

    const { channel: rChannelAfterClose } = await retryUntilCondition(
      () => remoteQueryClient.queryChannel(rPortID, rChannelID),
      // @ts-expect-error ChannelSDKType.state is a string not a number
      ({ channel }) => channel?.state === 'STATE_CLOSED',
      `ICA channel is closed on Host - ${chainName}`,
    );
    t.log('Remote Channel State After', rChannelAfterClose);
    t.is(
      rChannelAfterClose?.state,
      // @ts-expect-error ChannelSDKType.state is a string not a number
      'STATE_CLOSED',
      `channel is closed from host perspective - ${chainName}`,
    );

    const { lPortID, lChannelID } = parseLocalAddress(localAddress);
    const { channel: lChannelAfterClose } = await retryUntilCondition(
      () => localQueryClient.queryChannel(lPortID, lChannelID),
      // @ts-expect-error ChannelSDKType.state is a string not a number
      ({ channel }) => channel?.state === 'STATE_CLOSED',
      `ICA channel is closed on Controller - ${chainName}`,
    );
    t.log('Local Channel State After', lChannelAfterClose);
    if (!lChannelAfterClose?.state) throw Error('channel state is available');
    t.is(
      lChannelAfterClose.state,
      // @ts-expect-error ChannelSDKType.state is a string not a number
      'STATE_CLOSED',
      `channel is closed from controller perspective - ${chainName}`,
    );

    const reopenAccountOfferId = `${chainName}-reactivateAccount-${Date.now()}`;
    await doOffer({
      id: reopenAccountOfferId,
      invitationSpec: {
        source: 'continuing',
        previousOffer: offerId,
        invitationMakerName: 'ReactivateAccount',
      },
      proposal: {},
    });

    const { channels } = await retryUntilCondition(
      () => remoteQueryClient.queryChannels(),
      ({ channels }) => !!findNewChannel(channels, { rPortID, lPortID }),
      `ICA channel is reopened on ${chainName} Host`,
      TWO_MINUTES,
    );
    const newChannel = findNewChannel(channels, { rPortID, lPortID });
    t.log('New Channel after Reactivate', newChannel);
    if (!newChannel) throw Error('Channel not found');
    const newAddress = JSON.parse(newChannel.version).address;
    t.is(newAddress, address, `same chain address is returned - ${chainName}`);
    t.is(
      newChannel.state,
      // @ts-expect-error ChannelSDKType.state is a string not a number
      'STATE_OPEN',
      `channel is open on ${chainName} Host`,
    );
    t.not(newChannel.channel_id, rChannelID, 'remote channel id changed');
    t.not(
      newChannel.counterparty.channel_id,
      lChannelID,
      'local channel id changed',
    );
  },
});

/** Only application logic should be able to close an ICA channel; not channelCloseInit. */
const channelCloseInitScenario = test.macro({
  title: (_, chainName: string) =>
    `Clients cannot initiate channelCloseInit on ${chainName}`,
  exec: async (t, chainName: string) => {
    const config = chainConfig[chainName];
    if (!config) return t.fail(`Unknown chain: ${chainName}`);

    const {
      wallets,
      provisionSmartWallet,
      vstorageClient,
      retryUntilCondition,
      useChain,
      relayer,
    } = t.context;

    // make an account so there's an ICA channel we can attempt to close
    const agoricAddr = wallets[chainName];
    const wdUser1 = await provisionSmartWallet(agoricAddr, {
      BLD: 100n,
      IST: 100n,
    });
    t.log(`provisioning agoric smart wallet for ${agoricAddr}`);
    const doOffer = makeDoOffer(wdUser1);
    t.log(`${chainName} makeAccount offer`);
    const offerId = `${chainName}-makeAccount-${Date.now()}`;
    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeOrchAccountInvitation']],
      },
      offerArgs: { chainName },
      proposal: {},
    });
    const currentWalletRecord = await retryUntilCondition(
      () => vstorageClient.queryData(`published.wallet.${agoricAddr}.current`),
      ({ offerToPublicSubscriberPaths }) =>
        Object.fromEntries(offerToPublicSubscriberPaths)[offerId],
      `${offerId} continuing invitation is in vstorage`,
      TWO_MINUTES,
    );
    const offerToPublicSubscriberMap = Object.fromEntries(
      currentWalletRecord.offerToPublicSubscriberPaths,
    );

    const accountStoragePath = offerToPublicSubscriberMap[offerId]?.account;
    t.assert(accountStoragePath, 'account storage path returned');
    const address = accountStoragePath.split('.').pop();
    t.log('Got address:', address);

    const {
      remoteAddress,
      localAddress,
    }: CosmosOrchestrationAccountStorageState =
      await vstorageClient.queryData(accountStoragePath);
    const { rPortID, rChannelID, rConnectionID } =
      parseRemoteAddress(remoteAddress);
    const { lPortID, lChannelID, lConnectionID } =
      parseLocalAddress(localAddress);

    const dst = {
      chainId: chainInfo['agoric'].chainId,
      channelID: lChannelID,
      portID: lPortID,
      connectionID: lConnectionID,
    };
    const src = {
      chainId: useChain(chainName).chainInfo.chain.chain_id,
      channelID: rChannelID,
      portID: rPortID,
      connectionID: rConnectionID,
    };
    console.log(
      `Initiating channelCloseInit for dst: ${JSON.stringify(dst)} src: ${JSON.stringify(src)}`,
    );
    try {
      t.log('relayer channelCloseInit failed from agoric side for ICA');
      relayer.channelCloseInit(chainName, dst, src);
    } catch (e) {
      t.log(e); // hermes relayer throws, but go-relayer does not
    }
    try {
      t.log(`relayer channelCloseInit failed from ${chainName} side for ICA`);
      relayer.channelCloseInit(chainName, src, dst);
    } catch (e) {
      t.log(e); // hermes relayer throws, but go-relayer does not
    }
    t.log('Sleeping 10 seconds for potential channel closure to propagate');
    await sleep(10000);
    const remoteQueryClient = makeQueryClient(
      await useChain(chainName).getRestEndpoint(),
    );
    const { channel } = await retryUntilCondition(
      () => remoteQueryClient.queryChannel(rPortID, rChannelID),
      // @ts-expect-error ChannelSDKType.state is a string not a number
      ({ channel }) => channel?.state === 'STATE_OPEN',
      'Relayer closeChannelInit failed so ICA channel is still open',
    );
    t.log(channel);
    t.is(
      channel?.state,
      // @ts-expect-error ChannelSDKType.state is a string not a number
      'STATE_OPEN',
      'ICA channel is still open',
    );

    {
      const transferChannel = (
        await remoteQueryClient.queryChannels()
      ).channels.find(
        x => x.port_id === 'transfer' && x.connection_hops[0] === rConnectionID,
      );
      if (!transferChannel) throw Error('Transfer channel not found.');

      const dstTransferChannel = {
        chainId: chainInfo['agoric'].chainId,
        channelID: transferChannel.counterparty.channel_id as IBCChannelID,
        portID: 'transfer',
        connectionID: lConnectionID,
      };
      const srcTransferChannel = {
        chainId: useChain(chainName).chainInfo.chain.chain_id,
        channelID: transferChannel.channel_id as IBCChannelID,
        portID: 'transfer',
        connectionID: rConnectionID,
      };
      try {
        t.log('relayer channelCloseInit failed from agoric side for transfer');
        relayer.channelCloseInit(
          chainName,
          dstTransferChannel,
          srcTransferChannel,
        );
      } catch (e) {
        t.log(e); // hermes relayer throws, but go-relayer does not
      }
      try {
        t.log(
          `relayer channelCloseInit failed from ${chainName} side for transfer`,
        );
        relayer.channelCloseInit(
          chainName,
          srcTransferChannel,
          dstTransferChannel,
        );
      } catch (e) {
        t.log(e); // hermes relayer throws, but go-relayer does not
      }
      t.log('Sleeping 10 seconds for potential channel closure to propagate');
      await sleep(10000);

      const { channel } = await retryUntilCondition(
        () =>
          remoteQueryClient.queryChannel(
            'transfer',
            transferChannel.channel_id,
          ),
        // @ts-expect-error ChannelSDKType.state is a string not a number
        ({ channel }) => channel?.state === 'STATE_OPEN',
        'Relayer closeChannelInit failed so transfer channel is still open',
      );
      t.log(channel);
      t.is(
        channel?.state,
        // @ts-expect-error ChannelSDKType.state is a string not a number
        'STATE_OPEN',
        'Transfer channel is still open',
      );
    }
  },
});

test.serial(intentionalCloseAccountScenario, 'cosmoshub');
test.serial(intentionalCloseAccountScenario, 'osmosis');
test.serial(channelCloseInitScenario, 'cosmoshub');
test.serial(channelCloseInitScenario, 'osmosis');
