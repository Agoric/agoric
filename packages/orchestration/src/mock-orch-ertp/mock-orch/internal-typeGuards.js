import { M } from '@endo/patterns';
import { DenomAmountShape, DenomShape } from '../../typeGuards.js';
import {
  AcctAddrValueShape,
  ChainNameShape,
  MockChainAcctAddrShape,
  MockChainShape,
  MockDenomInfoShape,
  MockOrchAccountShape,
} from './typeGuards.js';

export const MockDenomMintShape = M.remotable('MockDenomMint');
export const MockOrchAdminShape = M.remotable('MockOrchAdmin');
export const BalancesMapShape = M.remotable('balancesMap');
export const AccountsMapShape = M.remotable('accountsMap');
export const ChainsMapShape = M.remotable('chainsMap');
export const DenomsMapShape = M.remotable('denomsMap');

export const MockDenomMintI = M.interface('MockDenomMint', {
  mintTo: M.call(MockChainAcctAddrShape, DenomAmountShape).returns(
    M.eref(M.undefined()),
  ),
});

export const MockOrchAdminI = M.interface('MockOrchAdmin', {
  makeDenom: M.call(DenomShape, M.eref(MockChainShape)).returns(
    M.eref(MockDenomMintShape),
  ),
});

export const BalancesEntryShape = harden({
  keyShape: DenomShape,
  valueShape: DenomAmountShape,
});

export const AccountsEntryShape = {
  keyShape: AcctAddrValueShape,
  valueShape: {
    account: MockOrchAccountShape,
    balances: BalancesMapShape,
  },
};

export const ChainsEntryShape = {
  keyShape: ChainNameShape,
  valueShape: {
    chain: MockChainShape,
    accounts: AccountsMapShape,
  },
};

export const DenomsEntryShape = {
  keyShape: DenomShape,
  valueShape: MockDenomInfoShape,
};
