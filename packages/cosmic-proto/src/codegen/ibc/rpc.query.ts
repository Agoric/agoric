//@ts-nocheck
import { Tendermint34Client, HttpEndpoint } from '@cosmjs/tendermint-rpc';
import { QueryClient } from '@cosmjs/stargate';
export const createRPCQueryClient = async ({
  rpcEndpoint,
}: {
  rpcEndpoint: string | HttpEndpoint;
}) => {
  const tmClient = await Tendermint34Client.connect(rpcEndpoint);
  const client = new QueryClient(tmClient);
  return {
    cosmos: {
      auth: {
        v1beta1: (
          await import('../cosmos/auth/v1beta1/query.rpc.Query.js')
        ).createRpcQueryExtension(client),
      },
      authz: {
        v1beta1: (
          await import('../cosmos/authz/v1beta1/query.rpc.Query.js')
        ).createRpcQueryExtension(client),
      },
      bank: {
        v1beta1: (
          await import('../cosmos/bank/v1beta1/query.rpc.Query.js')
        ).createRpcQueryExtension(client),
      },
      staking: {
        v1beta1: (
          await import('../cosmos/staking/v1beta1/query.rpc.Query.js')
        ).createRpcQueryExtension(client),
      },
    },
    ibc: {
      applications: {
        interchain_accounts: {
          controller: {
            v1: (
              await import(
                './applications/interchain_accounts/controller/v1/query.rpc.Query.js'
              )
            ).createRpcQueryExtension(client),
          },
          host: {
            v1: (
              await import(
                './applications/interchain_accounts/host/v1/query.rpc.Query.js'
              )
            ).createRpcQueryExtension(client),
          },
        },
        transfer: {
          v1: (
            await import('./applications/transfer/v1/query.rpc.Query.js')
          ).createRpcQueryExtension(client),
        },
      },
    },
  };
};
