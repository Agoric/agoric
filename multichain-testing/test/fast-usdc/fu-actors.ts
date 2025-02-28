import { encodeAddressHook } from '@agoric/cosmic-proto/address-hooks.js';
import type {
  CctpTxEvidence,
  PoolMetrics,
} from '@agoric/fast-usdc/src/types.js';
import type {
  CurrentWalletRecord,
  UpdateRecord,
} from '@agoric/smart-wallet/src/smartWallet.js';
import type { IBCChannelID } from '@agoric/vats';
import type { ExecutionContext } from 'ava';
import { makeDoOffer, type WalletDriver } from '../../tools/e2e-tools.js';
import type { createWallet } from '../../tools/wallet.js';
import type { commonSetup, SetupContextWithWallets } from '../support.js';

const { fromEntries } = Object;

const contractName = 'fastUsdc';

type VStorageClient = Awaited<ReturnType<typeof commonSetup>>['vstorageClient'];
export const agoricNamesQ = (vsc: VStorageClient) =>
  harden({
    brands: <K extends AssetKind>(_assetKind: K) =>
      vsc
        .queryData('published.agoricNames.brand')
        .then(pairs => fromEntries(pairs) as Record<string, Brand<K>>),
    instance: (name: string) =>
      vsc
        .queryData('published.agoricNames.instance')
        .then(pairs => fromEntries(pairs)[name] as Instance),
  });
const walletQ = (vsc: VStorageClient) => {
  const self = harden({
    current: (addr: string) =>
      vsc.queryData(
        `published.wallet.${addr}.current`,
      ) as Promise<CurrentWalletRecord>,
    findInvitationDetail: async (addr: string, description: string) => {
      const { Invitation } = await agoricNamesQ(vsc).brands('set');
      const current = await self.current(addr);
      const { purses } = current;
      const { value: details } = purses.find(p => p.brand === Invitation)!
        .balance as Amount<'set', InvitationDetails>;
      const detail = details.find(x => x.description === description);
      return { current, detail };
    },
    update: (addr: string) =>
      vsc.queryData(`published.wallet.${addr}`) as Promise<UpdateRecord>,
  });
  return self;
};

export const fastLPQ = (vsc: VStorageClient) =>
  harden({
    metrics: () =>
      vsc.queryData(`published.fastUsdc.poolMetrics`) as Promise<PoolMetrics>,
    info: () =>
      vsc.queryData(`published.fastUsdc`) as Promise<{
        poolAccount: string;
        settlementAccount: string;
        nobleICA?: string;
      }>,
  });

export const makeTxOracle = (
  name: string,
  io: {
    wd: WalletDriver;
    vstorageClient: VStorageClient;
    blockIter: AsyncIterable<{ height: number; time: unknown }, void, void>;
    now: () => number;
  },
) => {
  const { wd, vstorageClient, blockIter, now } = io;

  const description = 'oracle operator invitation';
  const address = wd.deposit.getAddress();
  const acceptOfferId = `${name}-accept`;

  const instanceP = agoricNamesQ(vstorageClient).instance(contractName);

  const doOffer = makeDoOffer(wd);
  const self = harden({
    getName: () => name,
    getAddress: () => address,
    acceptInvitation: async () => {
      const instance = await instanceP;
      await doOffer({
        id: acceptOfferId,
        invitationSpec: { source: 'purse', instance, description },
        proposal: {},
      });

      for await (const block of blockIter) {
        const check = await self.checkInvitation();
        if (check.usedInvitation) break;
        console.log(block.height, `${name} invitation used`);
      }
    },
    checkInvitation: async () => {
      const {
        current: { offerToUsedInvitation },
        detail,
      } = await walletQ(vstorageClient).findInvitationDetail(
        address,
        description,
      );
      const usedInvitation = offerToUsedInvitation.some(
        ([k, _v]) => k === `${name}-accept`,
      );
      return { detail, usedInvitation };
    },
    submit: async (evidence: CctpTxEvidence) => {
      const id = `${now()}-evm-evidence`;
      const tx = await wd.offers.executeOfferTx({
        id,
        invitationSpec: {
          source: 'continuing',
          previousOffer: acceptOfferId,
          invitationMakerName: 'SubmitEvidence',
          invitationArgs: [evidence],
        },
        proposal: {},
      });
      for await (const block of blockIter) {
        const update = await walletQ(vstorageClient).update(address);
        if (update.updated === 'offerStatus' && update.status.id === id) {
          if (update.status.error) {
            throw Error(update.status.error);
          }
          console.log(block.height, name, 'seated', id);
          return { txhash: tx?.txhash, block };
        }
        console.log(block.height, name, 'not seated', id);
      }
      throw Error('no more blocks');
    },
  });
  return self;
};
export type TxOracle = ReturnType<typeof makeTxOracle>;

export const makeUserAgent = (
  my: { wallet: Awaited<ReturnType<typeof createWallet>> },
  vstorageClient: VStorageClient,
  nobleTools: SetupContextWithWallets['nobleTools'],
  nobleAgoricChannelId: IBCChannelID,
) => {
  const fastInfoP = fastLPQ(vstorageClient).info();
  return harden({
    makeSendTx: async (
      t: ExecutionContext,
      mintAmt: bigint,
      EUD: string,
      chainId = 42161,
    ) => {
      t.log(`sending to EUD`, EUD);

      // parameterize agoric address
      const { settlementAccount } = await fastInfoP;
      t.log('settlementAccount address', settlementAccount);

      const recipientAddress = encodeAddressHook(settlementAccount, { EUD });
      t.log('recipientAddress', recipientAddress);

      // register forwarding address on noble
      const txRes = nobleTools.registerForwardingAcct(
        nobleAgoricChannelId,
        recipientAddress,
      );
      t.is(txRes?.code, 0, 'registered forwarding account');
      const { address: userForwardingAddr } = nobleTools.queryForwardingAddress(
        nobleAgoricChannelId,
        recipientAddress,
      );
      t.log('got forwardingAddress', userForwardingAddr);

      const senderDigits = 'FAKE_SENDER_ADDR' as string & { length: 40 };
      const tx: Omit<
        CctpTxEvidence,
        'blockHash' | 'blockNumber' | 'blockTimestamp'
      > = harden({
        txHash: `0xFAKE_TX_HASH`,
        tx: {
          sender: `0x${senderDigits}`,
          amount: mintAmt,
          forwardingAddress: userForwardingAddr,
        },
        aux: {
          forwardingChannel: nobleAgoricChannelId,
          recipientAddress,
        },
        chainId,
      });

      console.log('User initiates evm mint:', tx.txHash);

      return tx;
    },
  });
};
