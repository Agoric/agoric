import type { CosmosAssetInfo } from '../src/cosmos-api.js';

// https://github.com/cosmos/chain-registry/blob/master/cosmoshub/assetlist.json
export const assets = {
  cosmoshub: [
    {
      description:
        'ATOM is the native cryptocurrency of the Cosmos network, designed to facilitate interoperability between multiple blockchains through its innovative hub-and-spoke model.',
      extended_description:
        "ATOM, the native cryptocurrency of the Cosmos network, is essential for achieving the project's goal of creating an 'Internet of Blockchains.' Launched in 2019, Cosmos aims to solve the scalability, usability, and interoperability issues prevalent in existing blockchain ecosystems. The Cosmos Hub, the central blockchain of the network, uses ATOM for transaction fees, staking, and governance. By staking ATOM, users can earn rewards and participate in governance, influencing decisions on network upgrades and changes.\n\nCosmos leverages the Tendermint consensus algorithm to achieve high transaction throughput and fast finality. Its Inter-Blockchain Communication (IBC) protocol enables seamless data and value transfer between different blockchains, fostering a highly interconnected and collaborative ecosystem. The flexibility and scalability offered by Cosmos have attracted numerous projects, enhancing its utility and adoption. ATOM's role in securing the network and facilitating governance underscores its importance in the broader blockchain landscape.",
      denomUnits: [
        {
          denom: 'uatom',
          exponent: 0,
        },
        {
          denom: 'atom',
          exponent: 6,
        },
      ],
      base: 'uatom',
      name: 'Cosmos Hub Atom',
      display: 'atom',
      symbol: 'ATOM',
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
      },
      coingecko_id: 'cosmos',
      images: [
        {
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
          theme: {
            primary_color_hex: '#272d45',
          },
        },
      ],
      socials: {
        website: 'https://cosmos.network',
        twitter: 'https://twitter.com/cosmoshub',
      },
    },
    {
      description: 'Tether USDt on the Cosmos Hub',
      denomUnits: [
        {
          denom:
            'ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0',
          exponent: 0,
        },
        {
          denom: 'usdt',
          exponent: 6,
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0',
      name: 'Tether USDt',
      display: 'usdt',
      symbol: 'USDt',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chainName: 'kava',
            baseDenom: 'erc20/tether/usdt',
            channelId: 'channel-0',
          },
          chain: {
            channelId: 'channel-277',
            path: 'transfer/channel-277/erc20/tether/usdt',
          },
        },
      ],
      images: [
        {
          image_sync: {
            chainName: 'kava',
            baseDenom: 'erc20/tether/usdt',
          },
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg',
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png',
          theme: {
            circle: true,
            primary_color_hex: '#009393',
            background_color_hex: '#009393',
          },
        },
      ],
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg',
      },
    },
    {
      description: 'FX on Cosmos Hub',
      denomUnits: [
        {
          denom:
            'ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729',
          exponent: 0,
          aliases: ['FX'],
        },
      ],
      type_asset: 'ics20',
      base: 'ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729',
      name: 'Function X',
      display: 'FX',
      symbol: 'FX',
      traces: [
        {
          type: 'ibc',
          counterparty: {
            chainName: 'fxcore',
            baseDenom: 'FX',
            channelId: 'channel-10',
          },
          chain: {
            channelId: 'channel-585',
            path: 'transfer/channel-585/FX',
          },
        },
      ],
      images: [
        {
          image_sync: {
            chainName: 'fxcore',
            baseDenom: 'FX',
          },
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg',
          theme: {
            primary_color_hex: '#1c1c1c',
          },
        },
      ],
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png',
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg',
      },
    },
  ] as CosmosAssetInfo[],
};
harden(assets);
