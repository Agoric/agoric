import { NonNullish } from '@agoric/internal';
import { makeError, q } from '@endo/errors';
import { M, mustMatch } from '@endo/patterns';

/**
 * @import {GuestInterface, GuestOf} from '@agoric/async-flow';
 * @import {Vow} from '@agoric/vow';
 * @import {LocalOrchestrationAccountKit} from '../exos/local-orchestration-account.js';
 * @import {ZoeTools} from '../utils/zoe-tools.js';
 * @import {Orchestrator, OrchestrationFlow, LocalAccountMethods, OrchestrationAccountCommon, OrchestrationAccount, IBCConnectionInfo, ChainAddress, ForwardInfo, Chain} from '../types.js';
 * @import {IBCChannelID} from '@agoric/vats';
 */

const { entries } = Object;

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 */
export const makeNobleAccount = async orch => {
  const nobleChain = await orch.getChain('noble');
  return nobleChain.makeAccount();
};
harden(makeNobleAccount);

// TODO use case should be handled by `sendIt` based on the destination
/**
 * @deprecated `sendIt` should handle this
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {object} ctx
 * @param {Promise<GuestInterface<LocalOrchestrationAccountKit['holder']>>} ctx.sharedLocalAccountP
 * @param {Promise<
 *   GuestInterface<
 *     import('../exos/cosmos-orchestration-account.js').CosmosOrchestrationAccountKit['holder']
 *   >
 * >} ctx.nobleAccountP
 * @param {GuestInterface<ZoeTools>} ctx.zoeTools
 * @param {GuestOf<(msg: string) => Vow<void>>} ctx.log
 * @param {ZCFSeat} seat
 * @param {{ chainName: string; destAddr: string }} offerArgs
 */
export const sendByCCTP = async (
  orch,
  {
    sharedLocalAccountP,
    nobleAccountP,
    log,
    zoeTools: { localTransfer, withdrawToSeat },
  },
  seat,
  offerArgs,
) => {
  mustMatch(offerArgs, harden({ chainName: M.scalar(), destAddr: M.string() }));
  const { chainName, destAddr } = offerArgs;
  // NOTE the proposal shape ensures that the `give` is a single asset
  const { give } = seat.getProposal();
  const [[_kw, amt]] = entries(give);
  void log(`sending {${amt.value}} from ${chainName} to ${destAddr}`);
  const agoric = await orch.getChain('agoric');
  const assets = await agoric.getVBankAssetInfo();
  void log(`got info for denoms: ${assets.map(a => a.denom).join(', ')}`);
  const { denom } = NonNullish(
    assets.find(a => a.brand === amt.brand),
    `${amt.brand} not registered in vbank`,
  );

  /** @type {Chain<any>} */
  const chain = await orch.getChain(chainName);
  const info = await chain.getChainInfo();
  const { chainId } = info;
  assert(typeof chainId === 'string', 'bad chainId');
  console.log(`got info for chain: ${chainName} ${chainId}`, info);

  /**
   * @type {OrchestrationAccount<{ chainId: 'agoric' }>}
   */
  // @ts-expect-error XXX methods returning vows https://github.com/Agoric/agoric-sdk/issues/9822
  const sharedLocalAccount = await sharedLocalAccountP;
  await localTransfer(seat, sharedLocalAccount, give);

  if (typeof info.cctpDestinationDomain !== 'number') {
    // within the inter-chain; no CCTP needed
    try {
      await sharedLocalAccount.transfer(
        {
          value: destAddr,
          encoding: 'bech32',
          chainId,
        },
        { denom, value: amt.value },
      );
      void log(`completed transfer to ${destAddr}`);
    } catch (e) {
      await withdrawToSeat(sharedLocalAccount, seat, give);
      const errorMsg = `IBC Transfer failed ${q(e)}`;
      void log(`ERROR: ${errorMsg}`);
      seat.exit(errorMsg);
      throw makeError(errorMsg);
    }
  }

  console.log(`CCTP case: assume USDC`, amt.brand);

  const nobleAccount = await nobleAccountP;
  const nobleAddr = await nobleAccount.getAddress();
  const denomAmt = { denom, value: amt.value };
  await sharedLocalAccount.transfer(nobleAddr, denomAmt);
  console.log('assets are now on noble');

  const encoding = 'ethereum'; // XXX TODO. could be solana?
  /** @type {ChainAddress} */
  const mintRecipient = { chainId, encoding, value: destAddr };
  await nobleAccount.depositForBurn(mintRecipient, denomAmt);
  console.log(
    `transfer complete, we hope; could have FAILed between noble and dest, though`,
  );

  seat.exit();
};
harden(sendByCCTP);
