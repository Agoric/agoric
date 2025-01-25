import type { ERef } from '@endo/far';
import type { MapStore } from '@agoric/store';
import type { Denom, DenomAmount } from '../../orchestration-api.ts';
import type {
  MockChain,
  MockDenomInfo,
  MockChainAcctAddr,
  AcctAddrValue,
  MockOrchAccount,
  ChainName,
  MockOrchestrator,
} from './types.ts';

export type MockDenomMint = {
  // like transfer, but with no src account
  mintTo(destAddr: MockChainAcctAddr, denomAmount: DenomAmount): ERef<void>;
};

/**
 * Essentially, minting authority for mock testing purposes.
 */
export type MockOrchestratorAdmin = {
  makeDenom(denom: Denom, chainP: ERef<MockChain>): ERef<MockDenomMint>;
};

export type BalancesMap = MapStore<Denom, DenomAmount>;

export type AccountsMap = MapStore<
  AcctAddrValue,
  {
    account: MockOrchAccount;
    balances: BalancesMap;
  }
>;

export type ChainsMap = MapStore<
  ChainName,
  {
    chain: MockChain;
    accounts: AccountsMap;
  }
>;

export type DenomsMap = MapStore<Denom, MockDenomInfo>;

export type MockOrchestratorKit = {
  orchestrator: MockOrchestrator;
  admin: MockOrchestratorAdmin;
};
