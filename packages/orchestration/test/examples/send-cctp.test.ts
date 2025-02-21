import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E } from '@endo/far';
import { makeIssuerKit } from '@agoric/ertp';
import { withAmountUtils } from '@agoric/zoe/tools/test-utils.js';
import path from 'path';
import type {
  CosmosChainInfo,
  IBCConnectionInfo,
} from '../../src/cosmos-api.js';
import { commonSetup } from '../supports.js';
import { denomHash } from '../../src/utils/denomHash.js';
import type { DenomDetail } from '../../src/types.js';
import fetchedChainInfo from '../../src/fetched-chain-info.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractName = 'sendAnywhere';
const contractFile = `${dirname}/../../src/examples/send-anywhere.contract.js`;
type StartFn =
  typeof import('../../src/examples/send-anywhere.contract.js').start;

const txChannelDefaults = {
  counterPartyPortId: 'transfer',
  version: 'ics20-1',
  portId: 'transfer',
  ordering: 1, // ORDER_UNORDERED
  state: 3, // STATE_OPEN
};

const AgoricDevnetConfig = {
  chains: {
    axelar: {
      chainId: 'axelar-testnet-lisbon-3',
    },
    osmosis: {
      chainId: 'osmo-test-5',
      bech32Prefix: 'osmosis',
      connections: {
        'axelar-testnet-lisbon-3': {
          id: 'connection-1233333', // XXX???
          client_id: '07-tendermint-1258',
          state: 3, // STATE_OPEN,
          counterparty: {
            client_id: 'XXXX???',
            connection_id: 'connection-87665', // XXX???
          },
          transferChannel: {
            channelId: 'channel-566434324', // XXX???
            counterPartyChannelId: 'channel-112233', // ???
            ...txChannelDefaults,
          },
        } as IBCConnectionInfo,
      },
    } as CosmosChainInfo,
  },
  connections: {
    'axelar-testnet-lisbon-3': {
      // arbitrary ids...
      id: 'connection-8600',
      client_id: '07-tendermint-12700',
      state: 3, // STATE_OPEN
      counterparty: {
        client_id: '07-tendermint-432600',
        connection_id: 'connection-379300',
      },
      transferChannel: {
        counterPartyChannelId: 'channel-1006200',
        channelId: 'channel-6500',
        ...txChannelDefaults,
      },
    } as IBCConnectionInfo,

    'osmo-test-5': {
      id: 'connection-86',
      client_id: '07-tendermint-127',
      state: 3, // STATE_OPEN
      counterparty: {
        client_id: '07-tendermint-4326',
        connection_id: 'connection-3793',
      },
      transferChannel: {
        counterPartyChannelId: 'channel-10062',
        channelId: 'channel-65',
        ...txChannelDefaults,
      },
    } as IBCConnectionInfo,
  },
};

const registerUSDC = async ({ bankManager, agoricNamesAdmin }) => {
  const usdcKit = withAmountUtils(makeIssuerKit('USDC'));
  const { issuer, mint, brand } = usdcKit;

  // TODO: use USDC denom
  // const { axelar } = AgoricDevnetConfig.chains;
  const { noble } = fetchedChainInfo;
  const { channelId: agoricToNoble } =
    fetchedChainInfo.agoric.connections[noble.chainId].transferChannel;
  const denom = `ibc/${denomHash({ channelId: agoricToNoble, denom: 'uusdc' })}`;

  const issuerName = 'USDC';
  const proposedName = 'USDC noble';
  await E(bankManager).addAsset(denom, issuerName, proposedName, {
    issuer,
    mint,
    brand,
  });
  await E(E(agoricNamesAdmin).lookupAdmin('vbankAsset')).update(
    denom,
    /** @type {AssetInfo} */ harden({
      brand,
      issuer,
      issuerName,
      denom,
      proposedName,
      displayInfo: { IOU: true },
    }),
  );

  return harden({ ...usdcKit, denom });
};

test('send to base via noble CCTP', async t => {
  t.log('bootstrap, orchestration core-eval');
  const {
    bootstrap,
    commonPrivateArgs,
    brands: { ist },
    utils: { inspectLocalBridge, transmitTransferAck, populateChainHub },
    mocks: { ibcBridge },
  } = await commonSetup(t);
  const vt = bootstrap.vowTools;

  populateChainHub();
  const { zoe, bundleAndInstall } = await setUpZoeForTest();

  t.log('contract coreEval', contractName);

  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);

  const { bankManager, agoricNamesAdmin } = bootstrap;
  const usdcKit = await registerUSDC({
    bankManager,
    agoricNamesAdmin,
  });

  const storageNode = await E(bootstrap.storage.rootNode).makeChildNode(
    contractName,
  );

  // Mix osmosis from AgoricDevnetConfig with commonPrivateArgs
  const {
    agoric,
    osmosis: _x,
    ...withoutOsmosis
  } = commonPrivateArgs.chainInfo;
  const { osmosis } = AgoricDevnetConfig.chains;
  const connections = {
    ...agoric.connections,
    ...AgoricDevnetConfig.connections,
    // XXX to get from Agoric to axelar, use osmosis
    'axelar-testnet-lisbon-3': AgoricDevnetConfig.connections[osmosis.chainId],
  };
  const chainInfo = {
    ...withoutOsmosis,
    osmosis,
    agoric: { ...agoric, connections },
  };
  const assetInfo: Array<[string, DenomDetail]> = [
    ...commonPrivateArgs.assetInfo,
  ];
  const sendKit = await E(zoe).startInstance(
    installation,
    { Stable: ist.issuer, USDC: usdcKit.issuer },
    {},
    {
      ...commonPrivateArgs,
      assetInfo,
      chainInfo,
      storageNode,
    },
  );

  t.log('register the base chain');
  await E(sendKit.creatorFacet).registerChain(
    'base',
    {
      chainId: 'E8453',
      // allegedName: 'base',
      // https://developers.circle.com/stablecoins/supported-domains
      cctpDestinationDomain: 6,
    },
    // TODO: make this optional, since we don't really use it
    fetchedChainInfo.agoric.connections['noble-1'],
  );

  t.log('client uses contract to send to EVM chain via CCTP');
  {
    const anAmt = usdcKit.units(4.25);
    const Send = await E(usdcKit.mint).mintPayment(anAmt);

    const publicFacet = await E(zoe).getPublicFacet(sendKit.instance);
    const inv = E(publicFacet).makeSendInvitation();
    const userSeat = await E(zoe).offer(
      inv,
      { give: { Send: anAmt } },
      { Send },
      {
        destAddr: '0x20E68F6c276AC6E297aC46c84Ab260928276691D',
        chainName: 'base',
      },
    );
    await transmitTransferAck();

    await vt.when(E(userSeat).getOfferResult());
    const history = inspectLocalBridge();
    const { messages, address: fakeLocalChainAddr } = history.at(-1);
    t.is(messages.length, 1);
    const [txfr] = messages;
    t.log('local bridge', txfr);
    t.like(txfr, {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      receiver: 'cosmos1test', // TODO port setBech32Prefix from fastUSDC
      sender: fakeLocalChainAddr,
      sourceChannel: 'channel-62',
      token: {
        amount: '4250000',
        // see test above
        denom:
          'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
      },
    });
    t.is(
      usdcKit.denom,
      'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
    );
  }

  t.log(ibcBridge.inspectDibcBridge());
});
