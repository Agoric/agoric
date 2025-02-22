/**
 * @file General API of orchestration
 * - must not have chain-specific types without runtime narrowing by chain id
 * - should remain relatively stable.
 */
import type { Amount, Brand, NatAmount } from '@agoric/ertp/src/types.js';
import type { CurrentWalletRecord } from '@agoric/smart-wallet/src/smartWallet.js';
import type { Timestamp } from '@agoric/time';
import type { QueryManyFn } from '@agoric/vats/src/localchain.js';
import type { ResolvedPublicTopic } from '@agoric/zoe/src/contractSupport/topics.js';
import type { Passable } from '@endo/marshal';
import type {
  AgoricChainMethods,
  ChainInfo,
  CosmosChainAccountMethods,
  CosmosChainInfo,
  IBCMsgTransferOptions,
  KnownChains,
  LocalAccountMethods,
  ICQQueryFunction,
} from './types.js';
import type { ResolvedContinuingOfferResult } from './utils/zoe-tools.js';

/**
 * A denom that designates a path to a token type on some blockchain.
 *
 * Multiple denoms may designate the same underlying base denom (e.g., `uist`,
 * `uatom`) on different Chains or on the same Chain via different paths. On
 * Cosmos chains, all but the base denom are IBC style denoms, but that may vary
 * across other chains. All the denoms that designate the same underlying base
 * denom form an equivalence class, along with the unique Brand on the local
 * Chain. Some operations accept any member of the equivalence class to
 * effectively designate the corresponding token type on the target chain.
 */
export type Denom = string; // ibc/... or uist

// ??? when multiple Denoms provide paths to the same remote token type,
// should the brand be 1:1 with that equivalence class or each Denom?
/**
 * In many cases, either a denom string or a local Brand can be used to
 * designate a remote token type.
 */
export type DenomArg = Denom | Brand<'nat'>;

/**
 * Count of some fungible token on some blockchain.
 *
 * @see {@link Orchestrator.asAmount} to convert to an Amount surjectively
 */
export type DenomAmount = {
  denom: Denom;
  value: bigint; // Nat
};

/** Amounts can be provided as pure data using denoms or as ERTP Amounts */
export type AmountArg = DenomAmount | Amount<'nat'>;

/** An address on some blockchain, e.g., cosmos, eth, etc. */
export type ChainAddress = {
  /** e.g. 1 for Ethereum, agoric-3 for Agoric, cosmoshub-4 for Cosmos */
  chainId: string;
  /** The address value used on-chain */
  value: string;
  encoding: 'bech32' | 'ethereum';
};

/**
 * Object that controls an account on a particular chain.
 *
 * The methods available depend on the chain and its capabilities.
 */
export type OrchestrationAccount<CI extends ChainInfo> =
  OrchestrationAccountCommon &
    (CI extends CosmosChainInfo
      ? CI['chainId'] extends `agoric${string}`
        ? LocalAccountMethods
        : CosmosChainAccountMethods<CI>
      : object);

/**
 * An object for access the core functions of a remote chain.
 *
 * Note that "remote" can mean the local chain; it's just that
 * accounts are treated as remote/arms length for consistency.
 */
export interface Chain<CI extends ChainInfo> {
  getChainInfo: () => Promise<CI>;

  // "makeAccount" suggests an operation within a vat
  /**
   * Creates a new Orchestration Account on the current Chain.
   * @returns an object that controls the account
   */
  makeAccount: () => Promise<OrchestrationAccount<CI>>;
  // FUTURE supply optional port object; also fetch port object

  query: CI extends { icqEnabled: true }
    ? ICQQueryFunction
    : CI['chainId'] extends `agoric${string}`
      ? QueryManyFn
      : never;

  // TODO provide a way to get the local denom/brand/whatever for this chain
}

/**
 * Used with `orch.getDenomInfo('ibc/1234')`. See {@link Orchestrator.getDenomInfo}
 */
export interface DenomInfo<
  HoldingChain extends keyof KnownChains,
  IssuingChain extends keyof KnownChains,
> {
  /** The well-known Brand on Agoric for the direct asset */
  brand?: Brand;
  /** The Chain at which the argument `denom` exists (where the asset is currently held) */
  chain: Chain<KnownChains[HoldingChain]>;
  /** The Chain that is the issuer of the underlying asset */
  base: Chain<KnownChains[IssuingChain]>;
  /** the Denom for the underlying asset on its issuer chain */
  baseDenom: Denom;
}

/**
 * Provided in the callback to `orchestrate()`.
 */
export interface Orchestrator {
  /**
   * Get a Chain object for working with the given chain.
   *
   * @param {C} chainName name of the chain in KnownChains or the ChainHub backing the Orchestrator
   */
  getChain: <C extends string>(
    chainName: C,
  ) => Promise<
    Chain<C extends keyof KnownChains ? KnownChains[C] : any> &
      (C extends 'agoric' ? AgoricChainMethods : object)
  >;

  /**
   * For a denom, return information about a denom including the equivalent
   * local Brand, the Chain on which the denom is held, and the Chain that
   * issues the corresponding asset.
   * @param denom
   */
  getDenomInfo: <
    HoldingChain extends keyof KnownChains,
    IssuingChain extends keyof KnownChains,
  >(
    denom: Denom,
    srcChainName: HoldingChain,
  ) => DenomInfo<HoldingChain, IssuingChain>;

  /**
   * Convert an amount described in native data to a local, structured Amount.
   * @param amount - the described amount
   * @returns the Amount in local structuerd format
   */
  asAmount: (amount: DenomAmount) => NatAmount;
}

/**
 * An object that supports high-level operations for an account on a remote chain.
 */
export interface OrchestrationAccountCommon {
  /**
   * @returns the address of the account on the remote chain
   */
  getAddress: () => ChainAddress;

  /** @returns an array of amounts for every balance in the account. */
  getBalances: () => Promise<DenomAmount[]>;

  /** @returns the balance of a specific denom for the account. */
  getBalance: (denom: DenomArg) => Promise<DenomAmount>;

  /**
   * Transfer amount to another account on the same chain. The promise settles when the transfer is complete.
   * @param toAccount - the account to send the amount to. MUST be on the same chain
   * @param amount - the amount to send
   * @returns void
   */
  send: (toAccount: ChainAddress, amount: AmountArg) => Promise<void>;

  /**
   * Transfer multiple amounts to another account on the same chain. The promise settles when the transfer is complete.
   * @param toAccount - the account to send the amount to. MUST be on the same chain
   * @param amounts - the amounts to send
   * @returns void
   */
  sendAll: (toAccount: ChainAddress, amounts: AmountArg[]) => Promise<void>;

  /**
   * Transfer an amount to another account, typically on another chain.
   * The promise settles when the transfer is complete.
   * @param amount - the amount to transfer. Can be provided as pure data using denoms or as ERTP Amounts.
   * @param destination - the account to transfer the amount to. The denom in the destination arg has to be 
   * registered with `chainHub` via {@link `registerAsset`} API.
   * @param [opts] - an optional memo to include with the transfer, which could drive custom PFM behavior, and timeout parameters 
   * @returns void
   * @throws {Error} if route is not determinable, asset is not recognized, or
   * the transfer is rejected (insufficient funds, timeout)
   */
  transfer: (
    destination: ChainAddress,
    amount: AmountArg,
    opts?: IBCMsgTransferOptions,
  ) => Promise<void>;

  /**
   * Transfer an amount to another account in multiple steps. The promise settles when
   * the entire path of the transfer is complete.
   * @param amount - the amount to transfer
   * @param msg - the transfer message, including follow-up steps
   * @returns void
   */
  transferSteps: (amount: AmountArg, msg: TransferMsg) => Promise<void>;

  /**
   * Returns `invitationMakers` and `publicSubscribers` to the account
   * holder's smart wallet so they can continue interacting with the account
   * and read account state in vstorage if published.
   */
  asContinuingOffer: () => Promise<ResolvedContinuingOfferResult>;

  /**
   * Public topics are a map to different vstorage paths and subscribers that
   * can be shared with on or offchain clients.
   * When returned as part of a continuing invitation, it will appear
   * in the {@link CurrentWalletRecord} in vstorage.
   */
  getPublicTopics: () => Promise<Record<string, ResolvedPublicTopic<unknown>>>;
}

/**
 * Flows to orchestrate are regular Javascript functions but have some
 * constraints to fulfill the requirements of resumability after termination of
 * the enclosing vat. Some requirements for each orchestration flow:
 * - must not close over any values that could change between invocations
 * - must satisfy the `OrchestrationFlow` interface
 * - must be hardened
 * - must not use `E()` (eventual send)
 *
 * The call to `orchestrate` using a flow function in reincarnations of the vat
 * must have the same `durableName` as before. To help enforce these
 * constraints, we recommend:
 *
 * - keeping flows in a `.flows.js` module
 * - importing them all with `import * as flows` to get a single object keyed by
 *   the export name
 * - using `orchestrateAll` to treat each export name as the `durableName` of
 *   the flow
 * - adopting `@agoric/eslint-config` that has rules to help detect problems
 */
export interface OrchestrationFlow<CT = unknown> {
  (orc: Orchestrator, ctx: CT, ...args: Passable[]): Promise<unknown>;
}

/**
 * Internal structure for TransferMsgs.
 * The type must be able to express transfers across different chains and transports.
 *
 * NOTE Expected to change, so consider an opaque structure.
 * @internal
 */
export interface TransferMsg {
  toAccount: ChainAddress;
  timeout?: Timestamp;
  next?: TransferMsg;
  data?: object;
}

/** @alpha */
export interface AfterAction {
  destChain: string;
  destAddress: ChainAddress;
}
/** @alpha */
export interface SwapExact {
  amountIn: Amount;
  amountOut: Amount;
}
/** @alpha */
export interface SwapMaxSlippage {
  amountIn: Amount;
  brandOut: Brand;
  slippage: number;
}
