import { agd, agops } from './cliHelper.js';
import { ATOM_DENOM, CHAINID, VALIDATORADDR } from './constants.js';
import { executeOffer } from './commonUpgradeHelpers.js';

export const openVault = (address, mint, collateral) => {
  return executeOffer(
    address,
    agops.vaults('open', '--wantMinted', mint, '--giveCollateral', collateral),
  );
};

export const adjustVault = (address, vaultId, vaultParams) => {
  let params = [
    'adjust',
    '--vaultId',
    vaultId,
    '--from',
    address,
    ' --keyring-backend=test',
  ];

  if ('wantCollateral' in vaultParams) {
    params = [...params, '--wantCollateral', vaultParams.wantCollateral];
  }

  if ('wantMinted' in vaultParams) {
    params = [...params, '--wantMinted', vaultParams.wantMinted];
  }

  if ('giveCollateral' in vaultParams) {
    params = [...params, '--giveCollateral', vaultParams.giveCollateral];
  }

  if ('giveMinted' in vaultParams) {
    params = [...params, '--giveMinted', vaultParams.giveMinted];
  }

  return executeOffer(address, agops.vaults(...params));
};

export const closeVault = (address, vaultId, mint) => {
  return executeOffer(
    address,
    agops.vaults(
      'close',
      '--vaultId',
      vaultId,
      '--giveMinted',
      mint,
      '--from',
      address,
      '--keyring-backend=test',
    ),
  );
};

export const mintIST = async (addr, sendValue, giveCollateral, wantMinted) => {
  await agd.tx(
    'bank',
    'send',
    'validator',
    addr,
    `${sendValue}${ATOM_DENOM}`,
    '--from',
    VALIDATORADDR,
    '--chain-id',
    CHAINID,
    '--keyring-backend',
    'test',
    '--yes',
  );
  await openVault(addr, giveCollateral, wantMinted);
};
