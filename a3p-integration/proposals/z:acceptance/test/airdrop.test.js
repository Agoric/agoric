import test from 'ava';

// XXX the @cosmjs packages load `axios` and `protobufjs`  versions that are incompatible with Endo (which Ava has already inited)
// UNTIL https://github.com/cosmology-tech/telescope/issues/692
import { QueryClient, setupStakingExtension } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

import { GOV1ADDR } from '@agoric/synthetic-chain';
import assert from 'node:assert';
import process from 'node:process';
import { networkConfig, agdWalletUtils } from './test-lib/index.js';
import TREE from './merkleTree.js';

// XXX not the same as VALIDATOR_ADDRESS, which is actually the delegator
const VALIDATOR_ADDRESS = process.env.VALIDATOR_ADDRESS;
assert(VALIDATOR_ADDRESS, 'Missing VALIDATOR_ADDRESS in env');

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?
const STRING_CONSTANTS = {
  OFFER_TYPES: {
    AGORIC_CONTRACT: 'agoricContract',
    CONTRACT: 'contract',
  },
  OFFER_NAME: 'makeClaimTokensInvitation',
  INSTANCE: {
    PATH: 'tribblesAirdrop3',
  },
  ISSUERS: {
    TRIBBLES: 'Tribbles3',
    IST: 'IST',
    BLD: 'BLD',
  },
};

const currentDelegation = async () => {
  const endpoint = networkConfig.rpcAddrs[0];
  const tmClient = await Tendermint34Client.connect(endpoint);
  const query = QueryClient.withExtensions(tmClient, setupStakingExtension);
  const res = await query.staking.validatorDelegations(VALIDATOR_ADDRESS);

  return res.delegationResponses;
};

const setupTestEnv = () => {
  return {
    TREE,
    accounts: TREE.accounts.map(x => ({
      ...x,
      proof: TREE.constructProof(x.pubkey.key),
    })),
  };
};
test.before(async t => (t.context = await setupTestEnv()));

const runClaimAirdrop = async account => {
  const { brand } = agdWalletUtils.agoricNames;

  await agdWalletUtils.broadcastBridgeAction(account.address, {
    method: 'executeOffer',
    offer: {
      id: 'request-stake',
      invitationSpec: {
        source: 'agoricContract',
        instancePath: ['tribblesAirdrop3'],
        callPipe: [['makeClaimTokensInvitation']],
      },
      proposal: {
        give: {
          Fee: { brand: brand.IST, value: 5n },
        },
      },
      offerArgs: {
        key: account.pubkey.key,
        proof: account.proof,
        tier: createTestTier(),
      },
    },
  });
};

test('Claim attempt', async t => {
  const { accounts } = t.context;

  const firstFive = accounts.slice(0, 5);

  const offers = await Promise.all(firstFive.map(runClaimAirdrop));

  t.deepEqual(await offers, []);
});
