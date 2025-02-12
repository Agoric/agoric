import { M, mustMatch } from '@endo/patterns';
import { E } from '@endo/far';
import { VowShape } from '@agoric/vow';
import { makeTracer } from '@agoric/internal';
import { atob } from '@endo/base64';
import { ChainAddressShape } from '../typeGuards.js';
import { denomHash } from '../utils/denomHash.js';
import { Any } from '@agoric/cosmic-proto/google/protobuf/any.js';
import {
  MsgLiquidStake,
  MsgLiquidStakeResponse,
  MsgRedeemStake,
} from '../../cosmic-proto/dist/codegen/stride/stakeibc/tx.js';
import {
  decodeBech32,
  encodeBech32,
} from '@agoric/cosmic-proto/address-hooks.js';
import { tryDecodeResponse } from '../utils/cosmos.js';

const trace = makeTracer('StrideStakingTap');

/**
 * @import {IBCChannelID, VTransferIBCEvent} from '@agoric/vats';
 * @import {VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {TargetApp} from '@agoric/vats/src/bridge-target.js';
 * @import {ChainAddress, OrchestrationAccount} from '@agoric/orchestration';
 * @import {FungibleTokenPacketData} from '@agoric/cosmic-proto/ibc/applications/transfer/v2/packet.js';
 * @import {TypedPattern} from '@agoric/internal';
 */

/**
 * @typedef {{
 *   hostToAgoricChannel: IBCChannelID;
 *   nativeDenom: string;
 *   ibcDenomOnAgoric: string;
 *   ibcDenomOnStride: string;
 *   hostICAAccount: ERef<OrchestrationAccount<any>>;
 *   hostICAAccountAddress: ChainAddress;
 *   bech32Prefix: string;
 * }} SupportedHostChainShape
 */
const SupportedHostChainShape = {
  hostToAgoricChannel: M.string(),
  nativeDenom: M.string(),
  ibcDenomOnAgoric: M.string(),
  ibcDenomOnStride: M.string(),
  hostICAAccount: M.remotable('HostAccountICA'),
  hostICAAccountAddress: ChainAddressShape,
  bech32Prefix: M.string(),
};
harden(SupportedHostChainShape);

/**
 * @typedef {{
 *   localAccount: ERef<OrchestrationAccount<{ chainId: string }>>;
 *   localAccountAddress: ChainAddress;
 *   strideICAAccount: ERef<OrchestrationAccount<{ chainId: string }>>;
 *   strideICAAddress: ChainAddress;
 *   elysICAAccount: ERef<OrchestrationAccount<{ chainId: string }>>;
 *   elysICAAddress: ChainAddress;
 *   supportedHostChains: MapStore<string, SupportedHostChainShape>;
 *   elysToAgoricChannel: IBCChannelID;
 *   AgoricToElysChannel: IBCChannelID;
 *   stDenomOnElysTohostToAgoricChannelMap: MapStore<string, string>;
 *   agoricBech32Prefix: string;
 *   strideBech32Prefix: string;
 *   elysBech32Prefix: string;
 * }} StakingTapState
 */
/** @type {TypedPattern<StakingTapState>} */
const StakingTapStateShape = {
  localAccount: M.remotable('LocalOrchestrationAccount'),
  localAccountAddress: ChainAddressShape,
  strideICAAccount: M.remotable('StrideICAAccount'),
  strideICAAddress: ChainAddressShape,
  elysICAAccount: M.remotable('ElysICAAccount'),
  elysICAAddress: ChainAddressShape,
  supportedHostChains: M.remotable('MapStore'),
  elysToAgoricChannel: M.string(),
  AgoricToElysChannel: M.string(),
  stDenomOnElysTohostToAgoricChannelMap: M.remotable(
    'stDenomOnElysToHostChannelMap',
  ),
  agoricBech32Prefix: M.string(),
  strideBech32Prefix: M.string(),
  elysBech32Prefix: M.string(),
};
harden(StakingTapStateShape);

/**
 * @param {Zone} zone
 * @param {VowTools} vowTools
 */
const prepareStrideStakingTapKit = (zone, { watch }) => {
  return zone.exoClassKit(
    'StrideStakingTapKit',
    {
      // Taps ibc transfer and start the stake/unstake to/from stride
      tap: M.interface('StrideAutoStakeTap', {
        receiveUpcall: M.call(M.record()).returns(
          M.or(VowShape, M.undefined()),
        ),
      }),
      watchAndMoveFromHostToStride: M.interface(
        'WatchAndMoveFromHostToStride',
        {
          onFulfilled: M.call(
            M.undefined(),
            M.bigint(),
            M.string(),
            M.string(),
            SupportedHostChainShape,
          ).returns(VowShape),
          // On rejected, move funds to use address on agoric chain
          onRejected: M.call(
            M.error(),
            M.bigint(),
            M.string(),
            M.string(),
            SupportedHostChainShape,
          ).returns(VowShape),
        },
      ),
      watchAndLiquidStakeOnStride: M.interface('WatchAndLiquidStakeOnStride', {
        // move from host to stride
        onFulfilled: M.call(
          M.undefined(),
          M.string(),
          M.string(),
          M.string(),
          SupportedHostChainShape,
        ).returns(VowShape),
        // On rejected, move funds to user address on host chain
        onRejected: M.call(
          M.error(),
          M.string(),
          M.string(),
          M.string(),
          SupportedHostChainShape,
        ).returns(VowShape),
      }),
      watchAndSendSTtokensToUsersElysAccount: M.interface(
        'WatchAndSendSTtokensToUsersElysAccount',
        {
          // move from host to stride
          onFulfilled: M.call(
            M.string(),
            M.bigint(),
            M.string(),
            SupportedHostChainShape,
          ).returns(VowShape),
          // On rejected, move funds to user address on stride chain
          onRejected: M.call(
            M.error(),
            M.bigint(),
            M.string(),
            SupportedHostChainShape,
          ).returns(VowShape),
        },
      ),
      watchAndSendSTtokensToUsersStrideAccount: M.interface(
        'watchAndSendSTtokensToUsersStrideAccount',
        {
          // On rejected, move stTokens to user address on stride chain
          onRejected: M.call(
            M.error(),
            M.string(),
            M.bigint(),
            M.string(),
          ).returns(VowShape),
        },
      ),
      watchAndMoveFromElysToStride: M.interface(
        'WatchAndMoveFromElysToStride',
        {
          onFulfilled: M.call(
            M.undefined(),
            M.bigint(),
            M.string(),
            M.string(),
            M.string(),
            SupportedHostChainShape,
          ).returns(M.or(VowShape, M.undefined())),
          // On rejected, move funds to user address on elys chain
          onRejected: M.call(
            M.undefined(),
            M.bigint(),
            M.string(),
            M.string(),
            M.string(),
            SupportedHostChainShape,
          ).returns(M.or(VowShape, M.undefined())),
        },
      ),
      watchAndRedeemOnStride: M.interface('WatchAndRedeemOnStride', {
        // move from host to stride
        onFulfilled: M.call(
          M.undefined(),
          M.string(),
          M.string(),
          M.string(),
          SupportedHostChainShape,
        ).returns(M.or(VowShape, M.undefined())),
        onRejected: M.call(
          M.undefined(),
          M.string(),
          M.string(),
          M.string(),
          SupportedHostChainShape,
        ).returns(M.or(VowShape, M.undefined())),
      }),
    },
    /** @param {StakingTapState} initialState */
    initialState => {
      mustMatch(initialState, StakingTapStateShape);
      return harden(initialState);
    },
    {
      tap: {
        /**
         * @param {VTransferIBCEvent} event
         */
        receiveUpcall(event) {
          trace('receiveUpcall', event);

          // Receiving native from host chain

          if (
            !this.state.supportedHostChains.has(event.packet.source_channel) &&
            event.packet.source_channel !== this.state.elysToAgoricChannel
          ) {
            return;
          }

          const hostChainInfo = this.state.supportedHostChains.get(
            event.packet.source_channel,
          );

          const {
            localAccount,
            localAccountAddress,
            elysICAAddress,
            AgoricToElysChannel,
            stDenomOnElysTohostToAgoricChannelMap,
          } = this.state;

          const tx = /** @type {FungibleTokenPacketData} */ (
            JSON.parse(atob(event.packet.data))
          );
          trace('receiveUpcall packet data', tx);

          // ignore the outgoing transfers
          if (tx.receiver !== localAccountAddress.value) {
            return;
          }

          if (hostChainInfo !== undefined) {
            if (tx.denom !== hostChainInfo.nativeDenom) {
              return;
            }

            trace('LiquidStake: Moving funds to host-chain');
            trace('hostChainInfo.hostICAAccountAddress ',hostChainInfo.hostICAAccountAddress,);
            trace('hostChainInfo.ibcDenomOnAgoric ',hostChainInfo.ibcDenomOnAgoric,);
            trace('BigInt(tx.amount) ', BigInt(tx.amount));
            return watch(
              E(localAccount).transfer(hostChainInfo.hostICAAccountAddress, {
                denom: hostChainInfo.ibcDenomOnAgoric,
                value: BigInt(tx.amount),
              }),
              this.facets.watchAndMoveFromHostToStride,
              BigInt(tx.amount),
              hostChainInfo.nativeDenom, // tx.denom == hostChainInfo.nativeDenom
              tx.sender,
              hostChainInfo,
            );
          } else {
            // Retrieve Native token from stTokens on elys
            const hostToAgoricChannel =
              stDenomOnElysTohostToAgoricChannelMap.get(tx.denom);
            if (hostToAgoricChannel === undefined) {
              return;
            }
            const hostChainInfo =
              this.state.supportedHostChains.get(hostToAgoricChannel);
            if (hostChainInfo === undefined) {
              return;
            }
            const { hostICAAccountAddress } = hostChainInfo;
            const ibcDenomOnAgoricFromElys = `ibc/${denomHash({ denom: `st${tx.denom}`, channelId: AgoricToElysChannel })}`;

            trace('LiquidStakeRedeem: Moving funds to elys ICA');
            // Transfer to elys ICA account
            return watch(
              E(localAccount).transfer(elysICAAddress, {
                denom: ibcDenomOnAgoricFromElys,
                value: BigInt(tx.amount),
              }),
              this.facets.watchAndMoveFromElysToStride,
              tx.amount,
              tx.denom,
              tx.sender,
              ibcDenomOnAgoricFromElys,
              hostChainInfo,
            );
          }
        },
      },
      // Move from host to stride chainAddress
      watchAndMoveFromHostToStride: {
        /**
         * @param {void} _result
         * @param {bigint} amount
         * @param {string} denom
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        onFulfilled(_result, amount, denom, senderAddress, hostChainInfo) {
          const { strideICAAddress } = this.state;
          const { hostICAAccount,hostICAAccountAddress } = hostChainInfo;
          trace(`LiquidStake: Moving funds to stride from host ${hostICAAccountAddress.chainId}`);
          return watch(
            E(hostICAAccount).transfer(strideICAAddress, {
              denom,
              value: amount,
            }),
            this.facets.watchAndLiquidStakeOnStride,
            amount.toString(),
            denom,
            senderAddress,
            hostChainInfo,
          );
        },
        /**
         * @param {Error} _result
         * @param {bigint} amount
         * @param {string} _denom
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        // move funds to users agoric address
        onRejected(_result, amount, _denom, senderAddress, hostChainInfo) {
          trace('LiquidStakeFailed: Moving funds to host-chain failed');
          
          const { localAccount, localAccountAddress, agoricBech32Prefix } =
            this.state;
          const { ibcDenomOnAgoric } = hostChainInfo;

          const senderAgoricAddress = deriveAddress(
            senderAddress,
            agoricBech32Prefix,
          );
          const senderAgoricChainAddress = {
            chainId: localAccountAddress.chainId,
            encoding: localAccountAddress.encoding,
            value: senderAgoricAddress,
          };

          trace('LiquidStakeFailed: Moving funds to user agoric address');
          return watch(
            E(localAccount).send(senderAgoricChainAddress, {
              denom: ibcDenomOnAgoric,
              value: amount,
            }),
          );
        },
      },

      // Move from elys to stride chainAddress
      watchAndMoveFromElysToStride: {
        /**
         * @param {void} _result
         * @param {string} amount
         * @param {string} ibcDenomOnElys
         * @param {string} _ibcDenomOnAgoricFromElys
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        onFulfilled(
          _result,
          amount,
          ibcDenomOnElys,
          _ibcDenomOnAgoricFromElys,
          senderAddress,
          hostChainInfo,
        ) {
          const { strideICAAddress, elysICAAccount } = this.state;
          trace('LiquidStakeRedeem: Moving funds to stride from elys');
          return watch(
            E(elysICAAccount).transfer(strideICAAddress, {
              denom: ibcDenomOnElys,
              value: BigInt(amount),
            }),
            this.facets.watchAndRedeemOnStride,
            amount,
            ibcDenomOnElys,
            senderAddress,
            hostChainInfo,
          );
        },
        /**
         * @param {void} _result
         * @param {string} amount
         * @param {string} _ibcDenomOnElys
         * @param {string} ibcDenomOnAgoricFromElys
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} _hostChainInfo
         */
        // move funds to users agoric address
        onRejected(
          _result,
          amount,
          _ibcDenomOnElys,
          ibcDenomOnAgoricFromElys,
          senderAddress,
          _hostChainInfo,
        ) {
          trace('LiquidStakeRedeem: Moving stToken to elys ICA failed');
          const { localAccount, localAccountAddress, agoricBech32Prefix } =
            this.state;

          const senderAgoricAddress = deriveAddress(
            senderAddress,
            agoricBech32Prefix,
          );
          const senderAgoricChainAddress = {
            chainId: localAccountAddress.chainId,
            encoding: localAccountAddress.encoding,
            value: senderAgoricAddress,
          };

          trace('LiquidStakeRedeem: Moving stToken to users agoric address');
          return watch(
            E(localAccount).send(senderAgoricChainAddress, {
              denom: ibcDenomOnAgoricFromElys,
              value: BigInt(amount),
            }),
          );
        },
      },
      // Move from elys to stride chainAddress
      watchAndRedeemOnStride: {
        /**
         * @param {void} _result
         * @param {string} amount
         * @param {string} ibcDenomOnElys
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo,
         */
        onFulfilled(
          _result,
          amount,
          ibcDenomOnElys,
          senderAddress,
          hostChainInfo,
        ) {
          const { strideICAAddress, strideICAAccount } = this.state;
          const { bech32Prefix, hostICAAccountAddress } = hostChainInfo;
          // TODO: verify address derivation
          const senderNativeAddress = deriveAddress(
            senderAddress,
            bech32Prefix,
          );
          trace(
            `Derived Native address from elys address ${senderAddress} is ${senderNativeAddress}`,
          );

          // UnStake Tokens and get stTokens on strideICA wallet
          const strideRedeemStakeMsg = Any.toJSON(
            MsgRedeemStake.toProtoMsg({
              creator: strideICAAddress.value,
              amount: amount,
              hostZone: hostICAAccountAddress.chainId,
              receiver: senderNativeAddress,
            }),
          );

          trace('LiquidStakeRedeem: unstaking now');
          return watch(
            E(strideICAAccount).executeEncodedTx([strideRedeemStakeMsg]),
          );
        },
        /**
         * @param {void} _result
         * @param {string} amount
         * @param {string} ibcDenomOnElys
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} _hostChainInfo,
         */
        // move funds to users elys address
        onRejected(
          _result,
          amount,
          ibcDenomOnElys,
          senderAddress,
          _hostChainInfo,
        ) {
          trace('LiquidStakeRedeemFailed: Moving stToken to stride ICA failed');
          const { elysICAAccount, elysICAAddress, elysBech32Prefix } =
            this.state;

          const senderElysAddress = deriveAddress(
            senderAddress,
            elysBech32Prefix,
          );
          trace(
            `Derived Native address from elys address ${senderAddress} is ${senderElysAddress}`,
          );

          const senderElysChainAddress = {
            chainId: elysICAAddress.chainId,
            encoding: elysICAAddress.encoding,
            value: senderElysAddress,
          };

          trace('LiquidStakeRedeemFailed: Moving stToken to users stride address');
          return watch(
            E(elysICAAccount).send(senderElysChainAddress, {
              denom: ibcDenomOnElys,
              value: BigInt(amount),
            }),
          );
        },
      },
      // Liquid Stake on stride chain
      watchAndLiquidStakeOnStride: {
        /**
         * @param {void} _result
         * @param {string} amount
         * @param {string} nativeDenom
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        onFulfilled(
          _result,
          amount,
          nativeDenom,
          senderAddress,
          hostChainInfo,
        ) {
          const { strideICAAccount, strideICAAddress } = this.state;

          const strideLiquidStakeMsg = Any.toJSON(
            MsgLiquidStake.toProtoMsg({
              creator: strideICAAddress.value,
              amount: amount.toString(),
              hostDenom: nativeDenom,
            }),
          );

          trace('LiquidStake: Calling liquid stake');
          return watch(
            E(strideICAAccount).executeEncodedTx([strideLiquidStakeMsg]),
            this.facets.watchAndSendSTtokensToUsersElysAccount,
            BigInt(amount),
            senderAddress,
            hostChainInfo,
          );
        },
        /**
         * @param {Error} _result
         * @param {string} amount
         * @param {string} nativeDenom
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        // move funds to users host address
        onRejected(_result, amount, nativeDenom, senderAddress, hostChainInfo) {
          trace('LiquidStakeFailed: Transfer failed from host to stride');
          const { hostICAAccount, hostICAAccountAddress, bech32Prefix } =
            hostChainInfo;

          const senderHostAddress = deriveAddress(senderAddress, bech32Prefix);
          const senderHostChainAddress = {
            chainId: hostICAAccountAddress.chainId,
            encoding: hostICAAccountAddress.encoding,
            value: senderHostAddress,
          };
          trace('LiquidStakeFailed: Moving funds to users host address');
          return watch(
            E(hostICAAccount).send(senderHostChainAddress, {
              denom: nativeDenom,
              value: BigInt(amount),
            }),
          );
        },
      },
      // Decode response and send the stTokens to user's account
      watchAndSendSTtokensToUsersElysAccount: {
        /**
         * @param {string} result
         * @param {bigint} amount
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        onFulfilled(result, amount, senderAddress, hostChainInfo) {
          const { strideICAAccount, elysBech32Prefix, elysICAAddress } =
            this.state;

          const strideLSDResponse = tryDecodeResponse(
            result,
            MsgLiquidStakeResponse.fromProtoMsg,
          );
          trace(
            'Stride staking response Mock(Proto Decoded) : ',
            strideLSDResponse,
          );

          // TODO: verify the address derivation
          const senderElysAddress = deriveAddress(
            senderAddress,
            elysBech32Prefix,
          );
          trace(
            `Derived Elys address from ${senderAddress} is ${senderElysAddress}`,
          );

          /** @type {ChainAddress} */
          const senderChainAddress = {
            chainId: elysICAAddress.chainId,
            encoding: elysICAAddress.encoding,
            value: senderElysAddress.toString(),
          };

          trace('LiquidStake: Moving stTokens to elys from stride');
          // Move stTokens from stride ICA to user's elys address
          return watch(
            E(strideICAAccount).transfer(senderChainAddress, {
              denom: strideLSDResponse.stToken.denom,
              value: BigInt(strideLSDResponse.stToken.amount),
            }),
            this.facets.watchAndSendSTtokensToUsersStrideAccount,
            strideLSDResponse.stToken.denom,
            BigInt(strideLSDResponse.stToken.amount),
            senderAddress,
          );
        },
        /**
         * @param {Error} _result
         * @param {bigint} amount
         * @param {string} senderAddress
         * @param {SupportedHostChainShape} hostChainInfo
         */
        // move funds to user address on stride chain
        onRejected(_result, amount, senderAddress, hostChainInfo) {
          trace('LiquidStakeFailed: Staking on stride failed');
          const { ibcDenomOnStride } = hostChainInfo;
          const { strideICAAccount, strideICAAddress, strideBech32Prefix } =
            this.state;

          const senderStrideAddress = deriveAddress(
            senderAddress,
            strideBech32Prefix,
          );

          const senderStrideChainAddress = {
            chainId: strideICAAddress.chainId,
            encoding: strideICAAddress.encoding,
            value: senderStrideAddress,
          };
          trace('LiquidStakeFailed: moving funds to users stride address');
          return watch(
            E(strideICAAccount).send(senderStrideChainAddress, {
              denom: ibcDenomOnStride,
              value: BigInt(amount),
            }),
          );
        },
      },
      watchAndSendSTtokensToUsersStrideAccount: {
        /**
         * @param {Error} _result
         * @param {string} stTokenDenom
         * @param {bigint} stTokenAmount
         * @param {string} senderAddress
         */
        // move stTokens to user address on stride chain
        onRejected(_result, stTokenDenom, stTokenAmount, senderAddress) {
          trace('LiquidStakeFailed: Moving stToken to elys from stride failed');
          const { strideICAAccount, strideICAAddress, strideBech32Prefix } =
            this.state;

          const senderStrideAddress = deriveAddress(
            senderAddress,
            strideBech32Prefix,
          );

          const senderStrideChainAddress = {
            chainId: strideICAAddress.chainId,
            encoding: strideICAAddress.encoding,
            value: senderStrideAddress,
          };
          trace('LiquidStakeFailed: Moving stToken to users stride address');
          return watch(
            E(strideICAAccount).send(senderStrideChainAddress, {
              denom: stTokenDenom,
              value: BigInt(stTokenAmount),
            }),
          );
        },
      },
    },
  );
};

/**
 * Provides a {@link TargetApp} that reacts to an incoming IBC transfer by:
 *
 * @param {Zone} zone
 * @param {VowTools} vowTools
 * @returns {(
 *   ...args: Parameters<ReturnType<typeof prepareStrideStakingTapKit>>
 * ) => ReturnType<ReturnType<typeof prepareStrideStakingTapKit>>['tap']}
 */
export const prepareStrideStakingTap = (zone, vowTools) => {
  const makeKit = prepareStrideStakingTapKit(zone, vowTools);
  return (...args) => makeKit(...args).tap;
};

/** @typedef {ReturnType<typeof prepareStrideStakingTap>} MakeStrideStakingTap */
/** @typedef {ReturnType<MakeStrideStakingTap>} StakingTap */

const deriveAddress = (sender, hrp) => {
  const { prefix, bytes } = decodeBech32(sender);
  const derivedAddress = encodeBech32(hrp, bytes);
  return harden(derivedAddress);
};

// Add retries in ibc Transfer
