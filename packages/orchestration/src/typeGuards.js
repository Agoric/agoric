import { BrandShape } from '@agoric/ertp/src/typeGuards.js';
import { VowShape } from '@agoric/vow';
import { M } from '@endo/patterns';

/**
 * @import {TypedPattern} from '@agoric/internal';
 * @import {ChainAddress, CosmosAssetInfo, Chain, ChainInfo, CosmosChainInfo, DenomAmount, DenomInfo, AmountArg, CosmosValidatorAddress, OrchestrationPowers, ForwardInfo, IBCMsgTransferOptions} from './types.js';
 * @import {Any as Proto3Msg} from '@agoric/cosmic-proto/google/protobuf/any.js';
 * @import {TxBody} from '@agoric/cosmic-proto/cosmos/tx/v1beta1/tx.js';
 * @import {Coin} from '@agoric/cosmic-proto/cosmos/base/v1beta1/coin.js';
 * @import {TypedJson} from '@agoric/cosmic-proto';
 * @import {DenomDetail} from './exos/chain-hub.js';
 */

/**
 * Used for IBC Channel Connections that only send outgoing transactions. If
 * your channel expects incoming transactions, please extend this interface to
 * include the `onReceive` handler.
 */
export const OutboundConnectionHandlerI = M.interface(
  'OutboundConnectionHandler',
  {
    onOpen: M.callWhen(M.any(), M.string(), M.string(), M.any()).returns(
      M.any(),
    ),
    onClose: M.callWhen(M.any(), M.any(), M.any()).returns(M.any()),
  },
);

/** @type {TypedPattern<ChainAddress>} */
export const ChainAddressShape = {
  chainId: M.string(),
  encoding: M.string(),
  value: M.string(),
};
harden(ChainAddressShape);

/** @type {TypedPattern<Proto3Msg>} */
export const Proto3Shape = { typeUrl: M.string(), value: M.string() };
harden(ChainAddressShape);

/** @internal */
export const IBCChannelIDShape = M.string();

/** @internal */
export const IBCChannelInfoShape = M.splitRecord({
  portId: M.string(),
  channelId: IBCChannelIDShape,
  counterPartyPortId: M.string(),
  counterPartyChannelId: IBCChannelIDShape,
  ordering: M.scalar(), // XXX
  state: M.scalar(), // XXX
  version: M.string(),
});

/** @internal */
export const IBCConnectionIDShape = M.string();

/** @internal */
export const IBCConnectionInfoShape = M.splitRecord({
  id: IBCConnectionIDShape,
  client_id: M.string(),
  state: M.scalar(), // XXX STATE_OPEN or...
  counterparty: {
    client_id: M.string(),
    connection_id: IBCConnectionIDShape,
  },
  transferChannel: IBCChannelInfoShape,
});

/** @type {TypedPattern<CosmosAssetInfo>} */
export const CosmosAssetInfoShape = M.splitRecord({
  base: M.string(),
  name: M.string(),
  display: M.string(),
  symbol: M.string(),
  denom_units: M.arrayOf(
    M.splitRecord({ denom: M.string(), exponent: M.number() }),
  ),
});

/** @type {TypedPattern<CosmosChainInfo>} */
export const CosmosChainInfoShape = M.splitRecord(
  {
    chainId: M.string(),
  },
  {
    bech32Prefix: M.string(),
    cctpDestinationDomain: M.number(),
    connections: M.record(),
    stakingTokens: M.arrayOf({ denom: M.string() }),
    // UNTIL https://github.com/Agoric/agoric-sdk/issues/9326
    icqEnabled: M.boolean(),
    pfmEnabled: M.boolean(),
  },
);

/** @type {TypedPattern<ChainInfo>} */
export const ChainInfoShape = M.splitRecord({
  chainId: M.string(),
});
export const DenomShape = M.string();

/** @type {TypedPattern<Coin>} */
export const CoinShape = {
  /** json-safe stringified bigint */
  amount: M.string(),
  denom: DenomShape,
};
harden(CoinShape);

/** @type {TypedPattern<DenomInfo<any, any>>} */
export const DenomInfoShape = {
  chain: M.remotable('Chain'),
  base: M.remotable('Chain'),
  brand: M.or(M.remotable('Brand'), M.undefined()),
  baseDenom: M.string(),
};
harden(DenomInfoShape);

/** @type {TypedPattern<DenomDetail>} */
export const DenomDetailShape = M.splitRecord(
  { chainName: M.string(), baseName: M.string(), baseDenom: M.string() },
  { brand: BrandShape },
);
harden(DenomDetailShape);

/** @type {TypedPattern<DenomAmount>} */
export const DenomAmountShape = { denom: DenomShape, value: M.nat() };
harden(DenomAmountShape);

/** @type {TypedPattern<Amount<'nat'>>} */
export const AnyNatAmountShape = {
  brand: M.remotable('Brand'),
  value: M.nat(),
};
harden(AnyNatAmountShape);

/** @type {TypedPattern<AmountArg>} */
export const AmountArgShape = M.or(AnyNatAmountShape, DenomAmountShape);

/**
 * @type {TypedPattern<{
 *   validator: CosmosValidatorAddress;
 *   amount: AmountArg;
 * }>}
 */
export const DelegationShape = M.splitRecord(
  {
    validator: ChainAddressShape,
    amount: AmountArgShape,
  },
  { delegator: ChainAddressShape },
);

/** Approximately @see RequestQuery */
export const ICQMsgShape = M.splitRecord(
  { path: M.string(), data: M.string() },
  { height: M.string(), prove: M.boolean() },
);

/** @type {TypedPattern<TypedJson>} */
export const TypedJsonShape = M.splitRecord({ '@type': M.string() });

/** @see {Chain} */
export const chainFacadeMethods = {
  getChainInfo: M.call().returns(VowShape),
  makeAccount: M.call().returns(VowShape),
};
harden(chainFacadeMethods);

/**
 * for google/protobuf/timestamp.proto, not to be confused with TimestampShape
 * from `@agoric/time`
 *
 * `seconds` is a big integer but since it goes through JSON it is encoded as
 * string
 */
export const TimestampProtoShape = { seconds: M.string(), nanos: M.number() };
harden(TimestampProtoShape);

/**
 * see {@link TxBody} for more details
 *
 * @internal
 */
export const TxBodyOptsShape = M.splitRecord(
  {},
  {
    memo: M.string(),
    timeoutHeight: M.bigint(),
    extensionOptions: M.arrayOf(M.any()),
    nonCriticalExtensionOptions: M.arrayOf(M.any()),
  },
);

/**
 * Ensures at least one {@link AmountKeywordRecord} entry is present and only
 * permits Nat (fungible) amounts.
 */
export const AnyNatAmountsRecord = M.and(
  M.recordOf(M.string(), AnyNatAmountShape),
  M.not({}),
);

/** @type {TypedPattern<OrchestrationPowers>} */
export const OrchestrationPowersShape = {
  agoricNames: M.remotable(),
  localchain: M.remotable(),
  orchestrationService: M.remotable(),
  storageNode: M.remotable(),
  timerService: M.remotable(),
};
harden(OrchestrationPowersShape);

const ForwardArgsShape = {
  receiver: M.string(),
  port: 'transfer',
  channel: M.string(),
  timeout: M.string(),
  retries: M.number(),
};
harden(ForwardArgsShape);

/** @type {TypedPattern<ForwardInfo>} */
export const ForwardInfoShape = {
  forward: M.splitRecord(ForwardArgsShape, {
    /**
     * Protocol allows us to recursively include `next` keys, but this only
     * supports one. In practice, this is all we currently need.
     */
    next: {
      forward: ForwardArgsShape,
    },
  }),
};
harden(ForwardInfoShape);

/**
 * Caller configurable values of {@link ForwardInfo}
 *
 * @type {TypedPattern<IBCMsgTransferOptions['forwardOpts']>}
 */
export const ForwardOptsShape = M.splitRecord(
  {},
  {
    timeout: M.string(),
    retries: M.number(),
    intermediateRecipient: ChainAddressShape,
  },
  {},
);

/**
 * @type {TypedPattern<IBCMsgTransferOptions>}
 * @internal
 */
export const IBCTransferOptionsShape = M.splitRecord(
  {},
  {
    timeoutTimestamp: M.bigint(),
    timeoutHeight: {
      revisionHeight: M.bigint(),
      revisionNumber: M.bigint(),
    },
    memo: M.string(),
    forwardOpts: ForwardOptsShape,
  },
);
