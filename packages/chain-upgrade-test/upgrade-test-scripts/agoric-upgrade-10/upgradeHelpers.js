/* eslint-disable @jessie.js/safe-await-separator */
import { $ } from 'execa';

import {
  GOV1ADDR,
  GOV2ADDR,
  GOV3ADDR,
  VALIDATORADDR,
  USER1ADDR,
  CHAINID,
} from '../constants.js';

import { agd } from '../cliHelper.js';
import { getUser } from '../commonUpgradeHelpers.js';

export const printKeys = async () => {
  console.log('========== GOVERNANCE KEYS ==========');

  console.log(`gov1: ${GOV1ADDR}`);
  const gov1Key = await $`cat /root/.agoric/gov1.key`;
  console.log(gov1Key.stdout);

  console.log(`gov2: ${GOV2ADDR}`);
  const gov2Key = await $`cat /root/.agoric/gov2.key`;
  console.log(gov2Key.stdout);

  console.log(`gov3: ${GOV3ADDR}`);
  const gov3Key = await $`cat /root/.agoric/gov3.key`;
  console.log(gov3Key.stdout);

  console.log(`validator: ${VALIDATORADDR}`);
  const validatorKey = await $`cat /root/.agoric/validator.key`;
  console.log(validatorKey.stdout);

  console.log(`user1: ${USER1ADDR}`);
  const user1Key = await $`cat /root/.agoric/user1.key`;
  console.log(user1Key.stdout);

  const user2Address = await getUser('user2');

  console.log(`user2: ${user2Address}`);
  const user2Key = await $`cat /root/.agoric/user1.key`;
  console.log(user2Key.stdout);
};

// submit a DeliverInbound transaction
//
// see {agoric.swingset.MsgDeliverInbound} in swingset/msgs.proto
// https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/golang/cosmos/proto/agoric/swingset/msgs.proto#L23
export const submitDeliverInbound = async sender => {
  // ag-solo is a client that sends DeliverInbound transactions using a golang client
  // @see {connectToChain} in chain-cosmos-sdk.js
  // runHelper
  // https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/packages/solo/src/chain-cosmos-sdk.js

  // The payload is JSON.stringify([messages, highestAck])
  // https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/packages/solo/src/chain-cosmos-sdk.js#L625
  // for example, this json was captured from a running `agoric start local-solo`
  const json = `[[[1,"1:0:deliver:ro+1:rp-44;#[\\"getConfiguration\\",[]]"]],0]`;
  await agd.tx(
    'swingset',
    'deliver',
    `'${json}'`,
    `--chain-id="${CHAINID}"`,
    '--yes',
    `--from="${sender}"`,
    '--keyring-backend=test',
    '-b block',
  );
};
