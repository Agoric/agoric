import '@agoric/swingset-liveslots/tools/prepare-test-env.js';
import test from '@endo/ses-ava/prepare-endo.js';

import { makeNameHubKit, type IBCChannelID } from '@agoric/vats';
import { prepareSwingsetVowTools } from '@agoric/vow/vat.js';
import { E } from '@endo/far';
import { makeIssuerKit } from '@agoric/ertp';
import { withAmountUtils } from '@agoric/zoe/tools/test-utils.js';
import { typedJson } from '@agoric/cosmic-proto';
import { objectMap } from '@endo/patterns';
import { makeChainHub, registerAssets } from '../../src/exos/chain-hub.js';
import { provideFreshRootZone } from '../durability.js';
import {
  registerChainAssets,
  registerKnownChains,
} from '../../src/chain-info.js';
import knownChains from '../../src/fetched-chain-info.js';
import type {
  CosmosChainInfo,
  IBCConnectionInfo,
} from '../../src/cosmos-api.js';
import { assets as assetFixture } from '../assets.fixture.js';
import { registerChainsAndAssets } from '../../src/utils/chain-hub-helper.js';
import { assetOn } from '../../src/utils/asset.js';
import { withChainCapabilities } from '../../src/chain-capabilities.js';
import type { ChainAddress, DenomAmount } from '../../src/orchestration-api.js';

// fresh state for each test
const setup = () => {
  const zone = provideFreshRootZone();
  const vt = prepareSwingsetVowTools(zone.subZone('vows'));
  const { nameHub, nameAdmin } = makeNameHubKit();
  const chainHub = makeChainHub(zone.subZone('chainHub'), nameHub, vt);

  return { chainHub, nameAdmin, vt };
};

test('getChainInfo', async t => {
  const { chainHub, nameAdmin, vt } = setup();
  // use fetched chain info
  await registerKnownChains(nameAdmin);

  const vow = chainHub.getChainInfo('celestia');
  t.like(await vt.asPromise(vow), { chainId: 'celestia' });
});

test('concurrency', async t => {
  const { chainHub, nameAdmin, vt } = setup();
  // use fetched chain info
  await registerKnownChains(nameAdmin);

  const v1 = chainHub.getChainInfo('celestia');
  const v2 = chainHub.getChainInfo('celestia');
  t.like(await vt.asPromise(vt.allVows([v1, v2])), [
    { chainId: 'celestia' },
    { chainId: 'celestia' },
  ]);
});

test('getConnectionInfo', async t => {
  const { chainHub, vt } = setup();

  // https://mapofzones.com/zones/celestia/peers
  const a = { chainId: knownChains.celestia.chainId };
  // https://mapofzones.com/zones/neutron-1/peers
  const b = { chainId: knownChains.neutron.chainId };
  const ab: IBCConnectionInfo = knownChains.celestia.connections['neutron-1'];
  const ba = knownChains.neutron.connections.celestia;

  chainHub.registerConnection(a.chainId, b.chainId, ab);

  // Look up by string or info object
  t.deepEqual(
    await vt.when(chainHub.getConnectionInfo(a.chainId, b.chainId)),
    ab,
  );
  t.deepEqual(await vt.when(chainHub.getConnectionInfo(a, b)), ab);

  // Look up the opposite direction
  t.deepEqual(await vt.when(chainHub.getConnectionInfo(b, a)), ba);
});

test('denom info support via getAsset and getDenom', async t => {
  const { chainHub } = setup();

  const denom = 'utok1';
  const info1: CosmosChainInfo = {
    bech32Prefix: 'chain',
    chainId: 'agoric',
    stakingTokens: [{ denom }],
  };
  const tok1 = withAmountUtils(makeIssuerKit('Tok1'));

  chainHub.registerChain('agoric', info1);
  const info = {
    chainName: 'agoric',
    baseName: 'agoric',
    baseDenom: denom,
    brand: tok1.brand,
  };
  chainHub.registerAsset('utok1', info);

  t.deepEqual(
    chainHub.getAsset('utok1', 'agoric'),
    info,
    'getAsset(denom) returns denom info',
  );

  t.is(
    chainHub.getAsset('utok404', 'agoric'),
    undefined,
    'getAsset returns undefined when denom not registered',
  );

  t.deepEqual(
    chainHub.getDenom(tok1.brand),
    info.baseDenom,
    'getDenom(brand) returns denom info',
  );

  const tok44 = withAmountUtils(makeIssuerKit('Tok404'));
  t.is(
    chainHub.getDenom(tok44.brand),
    undefined,
    'getDenom returns undefined when brand is not found',
  );
});

test('toward asset info in agoricNames (#9572)', async t => {
  const { chainHub, nameAdmin, vt } = setup();
  // use fetched chain info
  await registerKnownChains(nameAdmin);

  await vt.when(chainHub.getChainInfo('cosmoshub'));

  for (const name of ['kava', 'fxcore']) {
    chainHub.registerChain(name, { chainId: name, bech32Prefix: name });
  }

  await registerChainAssets(nameAdmin, 'cosmoshub', assetFixture.cosmoshub);
  const details = await E(E(nameAdmin).readonly()).lookup(
    'chainAssets',
    'cosmoshub',
  );
  registerAssets(chainHub, 'cosmoshub', details);

  {
    const actual = chainHub.getAsset('uatom', 'cosmoshub');
    t.deepEqual(actual, {
      chainName: 'cosmoshub',
      baseName: 'cosmoshub',
      baseDenom: 'uatom',
    });
  }

  {
    const actual = chainHub.getAsset(
      'ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0',
      'cosmoshub',
    );
    t.deepEqual(actual, {
      chainName: 'cosmoshub',
      baseName: 'kava',
      baseDenom: 'erc20/tether/usdt',
    });
  }
});

test('makeChainAddress', async t => {
  const { chainHub, nameAdmin, vt } = setup();
  // use fetched chain info
  await registerKnownChains(nameAdmin);

  // call getChainInfo so ChainHub performs agoricNames lookup that populates its local cache
  await vt.asPromise(chainHub.getChainInfo('osmosis'));

  const MOCK_ICA_ADDRESS =
    'osmo1ht7u569vpuryp6utadsydcne9ckeh2v8dkd38v5hptjl3u2ewppqc6kzgd';
  t.deepEqual(chainHub.makeChainAddress(MOCK_ICA_ADDRESS), {
    chainId: 'osmosis-1',
    value: MOCK_ICA_ADDRESS,
    encoding: 'bech32',
  });

  t.throws(
    () => chainHub.makeChainAddress(MOCK_ICA_ADDRESS.replace('osmo1', 'foo1')),
    {
      message: 'Chain info not found for bech32Prefix "foo"',
    },
  );

  t.throws(() => chainHub.makeChainAddress('notbech32'), {
    message: 'No separator character for "notbech32"',
  });

  t.throws(() => chainHub.makeChainAddress('1notbech32'), {
    message: 'Missing prefix for "1notbech32"',
  });
});

test('updateChain updates existing chain info and mappings', t => {
  const { chainHub } = setup();

  const initialInfo = {
    chainId: 'chain-1',
    bech32Prefix: 'chain',
  };
  const updatedInfo = {
    ...initialInfo,
    bech32Prefix: 'newchain',
  };

  // Register initial chain
  chainHub.registerChain('testchain', initialInfo);

  // Update chain
  chainHub.updateChain('testchain', updatedInfo);

  // Verify chain address works with new prefix
  const address = `${updatedInfo.bech32Prefix}1abc`;
  const chainAddress = chainHub.makeChainAddress(address);
  t.deepEqual(chainAddress, {
    chainId: 'chain-1',
    value: address,
    encoding: 'bech32',
  });

  // Old prefix should not work
  t.throws(() => chainHub.makeChainAddress(`${initialInfo.bech32Prefix}1abc`), {
    message: `Chain info not found for bech32Prefix "${initialInfo.bech32Prefix}"`,
  });
});

test('updateChain errors on non-existent chain', t => {
  const { chainHub } = setup();

  t.throws(() => chainHub.updateChain('nonexistent', { chainId: 'test' }), {
    message: 'Chain "nonexistent" not registered',
  });
});

test('updateConnection updates existing connection info', async t => {
  const { chainHub, vt } = setup();

  const celestia = { chainId: knownChains.celestia.chainId };
  const neutron = { chainId: knownChains.neutron.chainId };
  const initialConnection = knownChains.celestia.connections['neutron-1'];

  // Register initial connection
  chainHub.registerConnection(
    celestia.chainId,
    neutron.chainId,
    initialConnection,
  );

  // Update with new channel info
  const updatedConnection = {
    ...initialConnection,
    transferChannel: {
      ...initialConnection.transferChannel,
      channelId: 'channel-999' as IBCChannelID,
    },
  };
  chainHub.updateConnection(
    celestia.chainId,
    neutron.chainId,
    updatedConnection,
  );

  // Verify lookup from both directions
  const forwardInfo = await vt.when(
    chainHub.getConnectionInfo(celestia.chainId, neutron.chainId),
  );
  t.is(forwardInfo.transferChannel.channelId, 'channel-999');

  const reverseInfo = await vt.when(
    chainHub.getConnectionInfo(neutron.chainId, celestia.chainId),
  );
  t.is(
    reverseInfo.transferChannel.counterPartyChannelId,
    'channel-999',
    'reverse direction shows updated channel',
  );
});

test('updateConnection errors on non-existent connection', t => {
  const { chainHub } = setup();

  t.throws(
    () =>
      chainHub.updateConnection('chain1', 'chain2', {
        id: 'connection-0',
        client_id: '07-tendermint-test',
        counterparty: {
          client_id: '07-tendermint-test',
          connection_id: 'connection-1',
        },
        state: 3,
        transferChannel: {
          channelId: 'channel-0',
          portId: 'transfer',
          counterPartyChannelId: 'channel-1',
          counterPartyPortId: 'transfer',
          version: 'ics20-1',
          state: 3,
          ordering: 0,
        },
      }),
    { message: 'Connection "chain1"<->"chain2" not registered' },
  );
});

test('updateAsset updates existing asset and brand mappings', t => {
  const { chainHub } = setup();

  // Register chains
  chainHub.registerChain('chain1', { chainId: 'chain-1', bech32Prefix: 'a' });
  chainHub.registerChain('chain2', { chainId: 'chain-2', bech32Prefix: 'b' });
  chainHub.registerChain('agoric', {
    chainId: 'agoric-3',
    bech32Prefix: 'agoric',
  });

  // Create initial asset with brand
  const tok1 = withAmountUtils(makeIssuerKit('Tok1'));
  const tok2 = withAmountUtils(makeIssuerKit('Tok2'));

  const initialDetail = {
    chainName: 'agoric',
    baseName: 'chain1',
    baseDenom: 'utok1',
    brand: tok1.brand,
  };

  // Register initial asset
  chainHub.registerAsset('utok1', initialDetail);

  // Update asset with new base chain and brand
  const updatedDetail = {
    ...initialDetail,
    baseName: 'chain2',
    brand: tok2.brand,
  };

  chainHub.updateAsset('utok1', updatedDetail);

  // Verify getAsset shows new details
  t.deepEqual(chainHub.getAsset('utok1', 'agoric'), updatedDetail);

  // Verify brand mappings are updated
  t.is(chainHub.getDenom(tok1.brand), undefined, 'old brand mapping removed');
  t.is(chainHub.getDenom(tok2.brand), 'utok1', 'new brand mapping added');
});

test('updateAsset errors appropriately', t => {
  const { chainHub } = setup();

  // Register chains
  chainHub.registerChain('agoric', {
    chainId: 'agoric-3',
    bech32Prefix: 'agoric',
  });
  chainHub.registerChain('chain1', { chainId: 'chain-1', bech32Prefix: 'c1' });

  const detail = {
    chainName: 'agoric',
    baseName: 'chain1',
    baseDenom: 'utok1',
  };

  // Register initial asset
  chainHub.registerAsset('utok1', detail);

  // Error on non-existent asset
  t.throws(() => chainHub.updateAsset('utok2', detail), {
    message: 'Asset "utok2" on "agoric" not registered',
  });

  // Error on non-existent base chain
  t.throws(
    () =>
      chainHub.updateAsset('utok1', {
        ...detail,
        baseName: 'nonexistent',
      }),
    { message: 'Chain "nonexistent" not registered' },
  );

  // First register an asset on chain1
  const tok1 = withAmountUtils(makeIssuerKit('Tok1'));
  chainHub.registerAsset('utok1', {
    ...detail,
    chainName: 'chain1',
  });

  // Now try to update it with a brand (which should fail)
  t.throws(
    () =>
      chainHub.updateAsset('utok1', {
        ...detail,
        chainName: 'chain1',
        brand: tok1.brand,
      }),
    { message: 'Brands only registerable for agoric-held assets' },
  );
});

const [uusdcOnAgoric, agDetail] = assetOn(
  'uusdc',
  'noble',
  undefined,
  'agoric',
  knownChains,
);
const [uusdcOnOsmosis, osDetail] = assetOn(
  'uusdc',
  'noble',
  undefined,
  'osmosis',
  knownChains,
);

test('makeTransferRoute - to issuing chain', async t => {
  const { chainHub } = setup();
  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains), // adds pfmEnabled
    harden([
      [uusdcOnAgoric, agDetail],
      [uusdcOnOsmosis, osDetail],
    ]),
  );

  const dest: ChainAddress = chainHub.makeChainAddress('noble1234');
  {
    // 100 USDC on agoric -> noble
    const amt: DenomAmount = harden({ denom: uusdcOnAgoric, value: 100n });
    t.deepEqual(chainHub.makeTransferRoute(dest, amt, 'agoric'), {
      receiver: 'noble1234',
      sourceChannel: 'channel-62',
      sourcePort: 'transfer',
      token: {
        amount: '100',
        denom:
          'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
      },
    });
  }
  {
    // 100 USDC on osmosis -> noble
    const amt: DenomAmount = harden({ denom: uusdcOnOsmosis, value: 100n });
    t.deepEqual(chainHub.makeTransferRoute(dest, amt, 'osmosis'), {
      receiver: 'noble1234',
      sourceChannel: 'channel-750',
      sourcePort: 'transfer',
      token: {
        amount: '100',
        denom:
          'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
      },
    });
  }
});

test('makeTransferRoute - from issuing chain', async t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains), // adds pfmEnabled
    harden([assetOn('uist', 'agoric'), assetOn('uosmo', 'osmosis')]),
  );

  const dest: ChainAddress = chainHub.makeChainAddress('noble1234');
  {
    // IST on agoric -> noble
    const amt: DenomAmount = harden({ denom: 'uist', value: 100n });
    t.deepEqual(chainHub.makeTransferRoute(dest, amt, 'agoric'), {
      receiver: 'noble1234',
      sourceChannel: 'channel-62',
      sourcePort: 'transfer',
      token: {
        amount: '100',
        denom: 'uist',
      },
    });
  }
  {
    // OSMO on osmosis -> noble
    const amt: DenomAmount = harden({ denom: 'uosmo', value: 100n });
    t.deepEqual(chainHub.makeTransferRoute(dest, amt, 'osmosis'), {
      receiver: 'noble1234',
      sourceChannel: 'channel-750',
      sourcePort: 'transfer',
      token: {
        amount: '100',
        denom: 'uosmo',
      },
    });
  }
});

test('makeTransferRoute - through issuing chain', async t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains), // adds pfmEnabled
    harden([[uusdcOnAgoric, agDetail]]),
  );

  const dest: ChainAddress = chainHub.makeChainAddress('osmo1234');
  const amt: DenomAmount = harden({ denom: uusdcOnAgoric, value: 100n });

  // 100 USDC on agoric -> osmosis
  const route = chainHub.makeTransferRoute(dest, amt, 'agoric');
  t.deepEqual(route, {
    sourcePort: 'transfer',
    sourceChannel: 'channel-62',
    token: {
      amount: '100',
      denom:
        'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
    },
    receiver: 'pfm',
    forwardInfo: {
      forward: {
        receiver: 'osmo1234',
        port: 'transfer',
        channel: 'channel-1',
        retries: 3,
        timeout: '10m',
      },
    },
  });

  // use TransferRoute to build a MsgTransfer
  if (!('forwardInfo' in route)) {
    throw new Error('forwardInfo not returned'); // appease tsc...
  }

  const { forwardInfo, ...rest } = route;
  const transferMsg = typedJson('/ibc.applications.transfer.v1.MsgTransfer', {
    ...rest,
    memo: JSON.stringify(forwardInfo),
    // callers of `.makeTransferRoute` will provide these fields themselves:
    sender: 'agoric123',
    timeoutHeight: {
      revisionHeight: 0n,
      revisionNumber: 0n,
    },
    timeoutTimestamp: 0n,
  });
  t.like(transferMsg, {
    memo: '{"forward":{"receiver":"osmo1234","port":"transfer","channel":"channel-1","retries":3,"timeout":"10m"}}',
    receiver: 'pfm',
  });
});

test('makeTransferRoute - takes forwardOpts', t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains), // adds pfmEnabled
    harden([[uusdcOnOsmosis, osDetail]]),
  );

  const dest: ChainAddress = chainHub.makeChainAddress('agoric1234');
  const amt: DenomAmount = harden({ denom: uusdcOnOsmosis, value: 100n });
  const forwardOpts = harden({
    retries: 1,
    timeout: '3m' as const,
  });

  // 100 USDC on osmosis -> agoric
  const route = chainHub.makeTransferRoute(dest, amt, 'osmosis', forwardOpts);
  t.like(route, {
    sourceChannel: 'channel-750',
    token: {
      denom: uusdcOnOsmosis,
    },
    receiver: 'pfm',
    forwardInfo: {
      forward: {
        channel: 'channel-21',
        ...forwardOpts,
      },
    },
  });

  const nobleAddr = harden({
    value: 'noble1234',
    encoding: 'bech32' as const,
    chainId: 'noble-1',
  });

  t.like(
    chainHub.makeTransferRoute(dest, amt, 'osmosis', {
      timeout: '99m',
      intermediateRecipient: nobleAddr,
    }),
    {
      receiver: nobleAddr.value,
      forwardInfo: {
        forward: {
          timeout: '99m' as const,
        },
      },
    },
    'each field is optional',
  );

  // test that typeGuard works
  t.throws(
    () =>
      chainHub.makeTransferRoute(
        dest,
        amt,
        'osmosis',
        harden({
          ...forwardOpts,
          forward: JSON.stringify('stringified nested forward data'),
        }),
      ),
    { message: /In "makeTransferRoute" method of/ },
  );
});

const nobleDest: ChainAddress = harden({
  value: 'noble1234',
  chainId: 'noble-1',
  encoding: 'bech32',
});

test('makeTransferRoute - no chain info', t => {
  const { chainHub } = setup();

  const amt: DenomAmount = harden({ denom: 'uist', value: 100n });
  t.throws(() => chainHub.makeTransferRoute(nobleDest, amt, 'agoric'), {
    message: 'chain info not found for holding chain: "agoric"',
  });
});

test('makeTransferRoute - no asset info', t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains), // adds pfmEnabled
    undefined, // do not supply asset info
  );

  t.throws(
    () =>
      chainHub.makeTransferRoute(
        nobleDest,
        harden({ denom: 'uist', value: 100n }),
        'agoric',
      ),
    {
      message:
        'no denom detail for: "uist" on "agoric". ensure it is registered in chainHub.',
    },
  );

  t.throws(
    () =>
      chainHub.makeTransferRoute(
        nobleDest,
        harden({ denom: uusdcOnAgoric, value: 100n }),
        'agoric',
      ),
    {
      message:
        'no denom detail for: "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9" on "agoric". ensure it is registered in chainHub.',
    },
  );
});

const knownChainsSansConns = objectMap(
  withChainCapabilities(knownChains),
  ({ connections, ...rest }) => rest,
);

test('makeTransferRoute - no connection info single hop', t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    knownChainsSansConns, // omit connections
    harden([
      [uusdcOnAgoric, agDetail],
      [uusdcOnOsmosis, osDetail],
    ]),
  );

  t.throws(
    () =>
      chainHub.makeTransferRoute(
        nobleDest,
        harden({ denom: uusdcOnAgoric, value: 100n }),
        'agoric',
      ),
    { message: 'no connection info found for "agoric-3"<->"noble-1"' },
  );
});

test('makeTransferRoute - no connection info multi hop', t => {
  const { chainHub } = setup();

  // only agoric has connection info; osmosis<>noble will be missing
  const chainInfo = { ...knownChainsSansConns, agoric: knownChains.agoric };
  registerChainsAndAssets(
    chainHub,
    {},
    harden(chainInfo),
    harden([
      [uusdcOnAgoric, agDetail],
      [uusdcOnOsmosis, osDetail],
    ]),
  );

  const osmoDest = chainHub.makeChainAddress('osmo1234');
  const agoricDest = chainHub.makeChainAddress('agoric1234');

  t.throws(
    () =>
      chainHub.makeTransferRoute(
        osmoDest,
        harden({ denom: uusdcOnAgoric, value: 100n }),
        'agoric',
      ),
    { message: 'no connection info found for "noble-1"<->"osmosis-1"' },
  );

  // transfer USDC on osmosis to agoric
  t.throws(
    () =>
      chainHub.makeTransferRoute(
        agoricDest,
        harden({ denom: uusdcOnOsmosis, value: 100n }),
        'osmosis',
      ),
    { message: 'no connection info found for "osmosis-1"<->"noble-1"' },
  );
});

test('makeTransferRoute - asset not on holding chain', t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    withChainCapabilities(knownChains),
    harden([[uusdcOnAgoric, agDetail]]),
  );

  // transfer USDC on agoric from osmosis to noble (impossible)
  t.throws(
    () =>
      chainHub.makeTransferRoute(
        nobleDest,
        harden({ denom: uusdcOnAgoric, value: 100n }),
        'osmosis',
      ),
    {
      message:
        'no denom detail for: "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9" on "osmosis". ensure it is registered in chainHub.',
    },
  );
});

test('makeTransferRoute - no PFM path', t => {
  const { chainHub } = setup();

  registerChainsAndAssets(
    chainHub,
    {},
    knownChains, // intentionally omit pfmEnabled
    harden([[uusdcOnAgoric, agDetail]]),
  );

  // transfer USDC on agoric to osmosis
  t.throws(
    () =>
      chainHub.makeTransferRoute(
        chainHub.makeChainAddress('osmo1234'),
        harden({ denom: uusdcOnAgoric, value: 100n }),
        'agoric',
      ),
    { message: 'pfm not enabled on issuing chain: "noble"' },
  );
});
