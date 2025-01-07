/* global globalThis */

import { DirectSecp256k1HdWallet, Registry } from '@cosmjs/proto-signing';
import { AminoTypes, SigningStargateClient } from '@cosmjs/stargate';
import { nobleAminoConverters, nobleProtoRegistry } from '@nick134-bit/noblejs';

export const makeSigner = async (
  /** @type {string} */ nobleSeed,
  /** @type {string} */ nobleRpc,
  out = console,
) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(nobleSeed, {
    prefix: 'noble',
  });
  out.log('got noble wallet from seed');
  const accounts = await wallet.getAccounts();
  const address = accounts[0].address;
  const signer = await SigningStargateClient.connectWithSigner(
    nobleRpc,
    wallet,
    {
      aminoTypes: new AminoTypes({
        ...nobleAminoConverters,
      }),
      registry: new Registry([...nobleProtoRegistry]),
    },
  );
  return { address, signer };
};

const createMsgRegisterAccount = (
  /** @type {string} */ signer,
  /** @type {string} */ recipient,
  /** @type {string} */ channel,
) => {
  return {
    typeUrl: '/noble.forwarding.v1.MsgRegisterAccount',
    value: {
      signer,
      recipient,
      channel,
    },
  };
};

export const registerFwdAccount = async (
  /** @type {SigningStargateClient} */ nobleSigner,
  /** @type {string} */ nobleAddress,
  /** @type {string} */ nobleToAgoricChannel,
  /** @type {string} */ recipient,
  out = console,
) => {
  out.log('registering fwd account on noble');
  const msg = createMsgRegisterAccount(
    nobleAddress,
    recipient,
    nobleToAgoricChannel,
  );
  const fee = {
    amount: [
      {
        denom: 'uusdc',
        amount: '20000',
      },
    ],
    gas: '200000',
  };
  out.log('signing message', msg);
  const txResult = await nobleSigner.signAndBroadcast(
    nobleAddress,
    [msg],
    fee,
    'Register Account Transaction',
  );
  if (txResult.code !== undefined && txResult.code !== 0) {
    throw new Error(
      `Transaction failed with code ${txResult.code}: ${txResult.events || ''}`,
    );
  }
  return `Transaction successful with hash: ${txResult.transactionHash}`;
};

export const queryForwardingAccount = async (
  /** @type {string} */ nobleApi,
  /** @type {string} */ nobleToAgoricChannel,
  /** @type {string} */ agoricAddr,
  out = console,
  fetch = globalThis.fetch,
) => {
  /**
   * https://github.com/noble-assets/forwarding/blob/9d7657a/proto/noble/forwarding/v1/query.proto
   * v2.0.0 10 Nov 2024
   */
  const query = `${nobleApi}/noble/forwarding/v1/address/${nobleToAgoricChannel}/${encodeURIComponent(agoricAddr)}/`;
  out.log(`querying forward address details from noble api: ${query}`);
  let forwardingAddressRes;
  await null;
  try {
    forwardingAddressRes = await fetch(query).then(async res => res.json());
  } catch (e) {
    out.error(`Error querying forwarding address from ${query}`);
    throw e;
  }
  /** @type {{ address: string, exists: boolean }} */
  const { address, exists } = forwardingAddressRes;
  out.log(
    `got forwarding address details: ${JSON.stringify(forwardingAddressRes)}`,
  );
  return { address, exists };
};
