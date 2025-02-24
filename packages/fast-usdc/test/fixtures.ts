import { encodeAddressHook } from '@agoric/cosmic-proto/address-hooks.js';
import { buildVTransferEvent } from '@agoric/orchestration/tools/ibc-mocks.js';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import type { ChainAddress } from '@agoric/orchestration';
import type { VTransferIBCEvent } from '@agoric/vats';
import type { CctpTxEvidence, EvmAddress } from '../src/types.js';

const mockScenarios = [
  'AGORIC_PLUS_OSMO',
  'AGORIC_PLUS_DYDX',
  'AGORIC_PLUS_AGORIC',
  'AGORIC_NO_PARAMS',
  'AGORIC_UNKNOWN_EUD',
  'AGORIC_PLUS_SOLANA',
  'AGORIC_PLUS_BASE',
  'AGORIC_PLUS_BASE_NO_CHAIN_ID',
] as const;

type MockScenario = (typeof mockScenarios)[number];

export const Senders = {
  default: '0xDefaultFakeEthereumAddress',
} as unknown as Record<string, EvmAddress>;

const blockTimestamp = 1632340000n;

export const MockCctpTxEvidences: Record<
  MockScenario,
  (receiverAddress?: string) => CctpTxEvidence
> = {
  AGORIC_PLUS_OSMO: (receiverAddress?: string) => ({
    blockHash:
      '0x90d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee665',
    blockNumber: 21037663n,
    blockTimestamp,
    txHash:
      '0xc81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761702',
    tx: {
      amount: 150000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelqkd',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: 'osmo183dejcnmkka5dzcu9xw6mywq0p2m5peks28men',
          CID: 'osmosis-1',
        }),
    },
    chainId: 1,
  }),
  AGORIC_PLUS_DYDX: (receiverAddress?: string) => ({
    blockHash:
      '0x80d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    blockTimestamp,
    txHash:
      '0xd81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 300000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelktz',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: 'dydx183dejcnmkka5dzcu9xw6mywq0p2m5peks28men',
          CID: 'dydx-mainnet-1',
        }),
    },
    chainId: 1,
  }),
  AGORIC_PLUS_AGORIC: (receiverAddress?: string) => ({
    blockHash:
      '0x80d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee6z9',
    blockNumber: 21037600n,
    blockTimestamp,
    txHash:
      '0xd81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff3875527617z9',
    tx: {
      amount: 250000000n,
      forwardingAddress: 'noble17ww3rfusv895d92c0ncgj0fl9trntn70jz7hd5',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: 'agoric13rj0cc0hm5ac2nt0sdup2l7gvkx4v9tyvgq3h2',
          CID: 'agoric-3',
        }),
    },
    chainId: 1,
  }),
  AGORIC_NO_PARAMS: (receiverAddress?: string) => ({
    blockHash:
      '0x70d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    blockTimestamp,
    txHash:
      '0xa81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 200000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelyyy',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress: receiverAddress || settlementAddress.value,
    },
    chainId: 1,
  }),
  AGORIC_UNKNOWN_EUD: (receiverAddress?: string) => ({
    blockHash:
      '0x70d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    blockTimestamp,
    txHash:
      '0xa81bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 200000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelyyy',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: 'random1addr',
          CID: 'random-1',
        }),
    },
    chainId: 1,
  }),
  AGORIC_PLUS_SOLANA: (receiverAddress?: string) => ({
    blockHash:
      '0x70d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    txHash:
      '0xaa1bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 210000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelyyy',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: 'EUdL1XDvkcu7xAE5iack1h6zbR8k6wCebTfmtQGk8fFS',
          CID: 'solana',
        }),
    },
    chainId: 1,
  }),
  AGORIC_PLUS_BASE: (receiverAddress?: string) => ({
    blockHash:
      '0x70d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    txHash:
      '0xba1bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 210000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelyyy',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: '0xe0d43135EBd2593907F8f56c25ADC1Bf94FCf993',
          CID: '8453', // integer, but only string permitted
        }),
    },
    chainId: 1,
  }),
  AGORIC_PLUS_BASE_NO_CHAIN_ID: (receiverAddress?: string) => ({
    blockHash:
      '0x70d7343e04f8160892e94f02d6a9b9f255663ed0ac34caca98544c8143fee699',
    blockNumber: 21037669n,
    txHash:
      '0xba1bc6105b60a234c7c50ac17816ebcd5561d366df8bf3be59ff387552761799',
    tx: {
      amount: 210000000n,
      forwardingAddress: 'noble1x0ydg69dh6fqvr27xjvp6maqmrldam6yfelyyy',
      sender: Senders.default,
    },
    aux: {
      forwardingChannel: 'channel-21',
      recipientAddress:
        receiverAddress ||
        encodeAddressHook(settlementAddress.value, {
          EUD: '0xe0d43135EBd2593907F8f56c25ADC1Bf94FCf993',
        }),
    },
    chainId: 1,
  }),
};

const nobleDefaultVTransferParams = {
  // (XXX confirm) FungibleTokenPacketData is from the perspective of the counterparty
  denom: 'uusdc',
  sourceChannel:
    fetchedChainInfo.agoric.connections['noble-1'].transferChannel
      .counterPartyChannelId,
  destinationChannel:
    fetchedChainInfo.agoric.connections['noble-1'].transferChannel.channelId,
};

export const MockVTransferEvents: Record<
  MockScenario,
  (receiverAddress?: string) => VTransferIBCEvent
> = {
  AGORIC_PLUS_OSMO: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_OSMO().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_PLUS_OSMO().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_OSMO().aux.recipientAddress,
    }),
  AGORIC_PLUS_DYDX: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_DYDX().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_PLUS_DYDX().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_DYDX().aux.recipientAddress,
    }),
  AGORIC_PLUS_AGORIC: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_AGORIC().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_PLUS_AGORIC().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_AGORIC().aux.recipientAddress,
    }),
  AGORIC_NO_PARAMS: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_NO_PARAMS().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_NO_PARAMS().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_NO_PARAMS().aux.recipientAddress,
    }),
  AGORIC_UNKNOWN_EUD: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_UNKNOWN_EUD().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_UNKNOWN_EUD().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_UNKNOWN_EUD().aux.recipientAddress,
    }),
  AGORIC_PLUS_SOLANA: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_SOLANA().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_PLUS_SOLANA().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_SOLANA().aux.recipientAddress,
    }),
  AGORIC_PLUS_BASE: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_BASE().tx.amount,
      sender: MockCctpTxEvidences.AGORIC_PLUS_BASE().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_BASE().aux.recipientAddress,
    }),
  AGORIC_PLUS_BASE_NO_CHAIN_ID: (recieverAddress?: string) =>
    buildVTransferEvent({
      ...nobleDefaultVTransferParams,
      amount: MockCctpTxEvidences.AGORIC_PLUS_BASE_NO_CHAIN_ID().tx.amount,
      sender:
        MockCctpTxEvidences.AGORIC_PLUS_BASE_NO_CHAIN_ID().tx.forwardingAddress,
      receiver:
        recieverAddress ||
        MockCctpTxEvidences.AGORIC_PLUS_BASE_NO_CHAIN_ID().aux.recipientAddress,
    }),
};

export const intermediateRecipient: ChainAddress = harden({
  chainId: 'noble-1',
  value: 'noble1test',
  encoding: 'bech32',
});

export const settlementAddress: ChainAddress = harden({
  chainId: 'agoric-3',
  encoding: 'bech32' as const,
  // Random value, copied from tests of address hooks
  value: 'agoric16kv2g7snfc4q24vg3pjdlnnqgngtjpwtetd2h689nz09lcklvh5s8u37ek',
});
