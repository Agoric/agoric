//@ts-nocheck
import { Rpc } from '../helpers.js';
export const createRPCMsgClient = async ({ rpc }: { rpc: Rpc }) => ({
  agoric: {
    swingset: new (await import('./swingset/msgs.rpc.msg.js')).MsgClientImpl(
      rpc,
    ),
    vibc: new (await import('./vibc/msgs.rpc.msg.js')).MsgClientImpl(rpc),
  },
  cosmos: {
    authz: {
      v1beta1: new (
        await import('../cosmos/authz/v1beta1/tx.rpc.msg.js')
      ).MsgClientImpl(rpc),
    },
    bank: {
      v1beta1: new (
        await import('../cosmos/bank/v1beta1/tx.rpc.msg.js')
      ).MsgClientImpl(rpc),
    },
    staking: {
      v1beta1: new (
        await import('../cosmos/staking/v1beta1/tx.rpc.msg.js')
      ).MsgClientImpl(rpc),
    },
  },
});
