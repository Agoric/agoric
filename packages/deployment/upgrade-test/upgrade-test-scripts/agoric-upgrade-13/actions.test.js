import test from 'ava';

import { promises as fs } from 'fs';
import { agd, agops, agoric } from '../cliHelper.js';
import { ATOM_DENOM, CHAINID, GOV1ADDR } from '../constants.js';
import { mintIST, openVault } from '../econHelpers.js';
import { waitForBlock } from '../commonUpgradeHelpers.js';
import { addUser, getISTBalance } from './actions.js';

test.before(async t => {
  await mintIST(GOV1ADDR, 12340000000, 10000, 2000);

  await waitForBlock(2);
  const userAddress = await addUser('u13user');
  await agd.tx(
    'bank',
    'send',
    'gov1',
    userAddress,
    `1000000uist,2100000000${ATOM_DENOM}`,
    '--from',
    GOV1ADDR,
    '--chain-id',
    CHAINID,
    '--keyring-backend',
    'test',
    '--yes',
  );
  t.context = { userAddress };
  await waitForBlock(2);
});

test('Open Vaults with auto-provisioned wallet', async t => {
  const { userAddress } = t.context;
  t.is(await getISTBalance(userAddress), 1);

  const ATOMGiven = 2000;
  const ISTWanted = 400;
  // Decompose openVault because follower is broken for auto-provisioned wallets
  // await openVault(userAddress, ATOMGiven, ISTWanted);
  const offer = await agops.vaults(
    'open',
    '--wantMinted',
    ISTWanted,
    '--giveCollateral',
    ATOMGiven,
  );
  const offerPath = `/tmp/u13-vaults`; // await mkTemp('agops.XXX');
  await fs.writeFile(offerPath, offer);
  console.log('Vaults Offer written', offerPath);
  //$ agd --chain-id=agoriclocal --from=$(agd keys add u13 --dry-run --recover --keyring-backend=test --output=json < ~/.agoric/u13user.key | jq -r .address) tx swingset wallet-action --allow-spend "$(cat /tmp/u13-vaults)" --keyring-backend=test --yes
  await agd.tx(
    'swingset',
    'wallet-action',
    '--allow-spend',
    `'${offer}'`, // cheap/brittle escaping since `executeCommand` joins args ...
    '--keyring-backend=test',
    '-y',
    `--chain-id="${CHAINID}"`,
    `--from="${userAddress}"`,
  );
  await waitForBlock(2);

  //$ agoric follow --verbose :published.wallet.$(agd keys add u13 --dry-run --recover --keyring-backend=test --output=json < ~/.agoric/u13user.key | jq -r .address)
  await agoric.follow('--first-value-only', `:published.wallet.${userAddress}`);

  const newISTBalance = await getISTBalance(userAddress);
  console.log('New IST Balance in u13 account:', newISTBalance);
  t.true(newISTBalance >= ISTWanted, 'Got the wanted IST');
});
