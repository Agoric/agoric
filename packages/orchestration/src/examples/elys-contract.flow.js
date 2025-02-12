import { Fail } from '@endo/errors';
import { makeScalarMapStore } from '@agoric/store';
import { denomHash } from '../utils/denomHash.js';
import { makeTracer } from '@agoric/internal';

/**
 * @import {GuestInterface} from '@agoric/async-flow';
 * @import {Orchestrator, OrchestrationFlow} from '@agoric/orchestration';
 * @import {MakeStrideStakingTap, SupportedHostChainShape} from './elys-contract-tap-kit.js';
 * @import {ChainHub} from '../exos/chain-hub.js';
 */
const trace = makeTracer('StrideStakingFlow');

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {{
 *   makeStrideStakingTap: MakeStrideStakingTap;
 *   chainHub: GuestInterface<ChainHub>;
 * }} ctx
 * @param {{
 *   chainNames: string[];
 *   supportedHostChains: MapStore<any, any>;
 *   stDenomOnElysTohostToAgoricChannelMap: MapStore<any, any>;
 * }} offerArgs
 */
export const makeICAHookAccounts = async (
  orch,
  { makeStrideStakingTap, chainHub },
  { chainNames, supportedHostChains, stDenomOnElysTohostToAgoricChannelMap },
) => {
  const allRemoteChains = await Promise.all(
    chainNames.map(n => orch.getChain(n)),
  );

  // Agoric local account
  const agoric = await orch.getChain('agoric');
  const { chainId: agoricChainId, bech32Prefix: agoricBech32Prefix } =
    await agoric.getChainInfo();
  const localAccount = await agoric.makeAccount();
  const localAccountAddress = localAccount.getAddress();

  // stride ICA account
  const stride = await orch.getChain('stride');
  const { chainId: strideChainId, bech32Prefix: strideBech32Prefix } =
    await stride.getChainInfo();
  const strideICAAccount = await stride.makeAccount();
  const strideICAAddress = strideICAAccount.getAddress();

  // Elys ICA account
  const elys = await orch.getChain('elys');
  const { chainId: elysChainId, bech32Prefix: elysBech32Prefix } =
    await elys.getChainInfo();
  const elysICAAccount = await elys.makeAccount();
  const elysICAAddress = elysICAAccount.getAddress();

  const { transferChannel: transferChannelAgoricElys } =
    await chainHub.getConnectionInfo(agoricChainId, elysChainId);
  const { transferChannel: transferChannelStrideElys } =
    await chainHub.getConnectionInfo(strideChainId, elysChainId);

  // ICA account on all the supported host chains
  for (const [index, remoteChain] of allRemoteChains.entries()) {
    const chainInfo = await remoteChain.getChainInfo();
    const { chainId, stakingTokens, bech32Prefix } = chainInfo;
    stakingTokens || Fail`${chainId} does not have stakingTokens in config`;

    const nativeDenom = stakingTokens[0].denom;
    trace('NativeDenom ', nativeDenom);
    nativeDenom ||
      Fail`${chainId || chainId} does not have stakingTokens in config`;

    const ICAAccount = await remoteChain.makeAccount();
    const ICAAddress = ICAAccount.getAddress();

    // get the connection info between agoric and remote chain
    const { transferChannel } = await chainHub.getConnectionInfo(
      agoricChainId,
      chainId,
    );
    const { transferChannel: transferChannelhostStride } =
      await chainHub.getConnectionInfo(chainId, strideChainId);

    const ibcDenomOnAgoric = `ibc/${denomHash({ denom: nativeDenom, channelId: transferChannel.channelId })}`;
    const ibcDenomOnStride = `ibc/${denomHash({ denom: nativeDenom, channelId: transferChannelhostStride.channelId })}`;

    // Required in retrieving native token back from stTokens on elys chain
    const stTokenDenomOnElys = `ibc/${denomHash({ denom: `st${nativeDenom}`, channelId: transferChannelStrideElys.channelId })}`;
    stDenomOnElysTohostToAgoricChannelMap.init(
      stTokenDenomOnElys,
      transferChannel.counterPartyChannelId,
    );

    const chainName = chainNames[index];

    /** @type {SupportedHostChainShape} */
    const hostChainInfo = {
      hostToAgoricChannel: transferChannel.counterPartyChannelId,
      nativeDenom,
      ibcDenomOnAgoric,
      ibcDenomOnStride,
      hostICAAccount: ICAAccount,
      hostICAAccountAddress: ICAAddress,
      bech32Prefix,
    };
    supportedHostChains.init(
      transferChannel.counterPartyChannelId,
      hostChainInfo,
    );
  }

  const tap = makeStrideStakingTap({
    localAccount,
    localAccountAddress,
    strideICAAccount,
    strideICAAddress,
    elysICAAccount,
    elysICAAddress,
    supportedHostChains,
    elysToAgoricChannel: transferChannelAgoricElys.counterPartyChannelId,
    AgoricToElysChannel: transferChannelAgoricElys.channelId,
    stDenomOnElysTohostToAgoricChannelMap,
    agoricBech32Prefix,
    strideBech32Prefix,
    elysBech32Prefix,
  });

  // @ts-expect-error tap.receiveUpcall: 'Vow<void> | undefined' not assignable to 'Promise<any>'
  await localAccount.monitorTransfers(tap);

  return localAccount;
};
harden(makeICAHookAccounts);
