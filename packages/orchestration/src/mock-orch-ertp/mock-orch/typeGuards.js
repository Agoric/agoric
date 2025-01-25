// @jessie-check
import { M } from '@endo/patterns';
import {
  ChainInfoShape,
  DenomAmountShape,
  DenomShape,
} from '../../typeGuards.js';

export const MockOrchAccountShape = M.remotable('MockOrchAccount');
export const MockChainShape = M.remotable('MockChain');
export const MockOrchestratorShape = M.remotable('MockOrchestrator');

// copied from portfolio-holder-kit.js
export const ChainNameShape = M.string();

export const AcctAddrValueShape = M.string();

/**
 * @see {ChainAddressShape}
 * @see {MockChainAcctAddr}
 */
export const MockChainAcctAddrShape = harden({
  chainId: ChainNameShape,
  value: AcctAddrValueShape, // acctAddrValue
});

/**
 * @see {orchestrationAccountMethods}
 * @see {MockOrchAccount}
 */
export const MockOrchAccountI = M.interface('MockOrchAccount', {
  getAddress: M.call().returns(MockChainAcctAddrShape),
  getBalances: M.call().returns(M.eref(M.arrayOf(DenomAmountShape))),
  getBalance: M.call(DenomShape).returns(M.eref(DenomAmountShape)),
  transfer: M.call(MockChainAcctAddrShape, DenomAmountShape).returns(
    M.eref(M.undefined()),
  ),
});

/**
 * @see {DenomInfoShape}
 * @see {MockDenomInfo}
 */
export const MockDenomInfoShape = harden({
  chain: MockChainShape,
});

/**
 * @see {chainFacadeMethods}
 * @see {MockChain}
 * @see {OrchestratorI}
 */
export const MockChainI = M.interface('MockChain', {
  getChainInfo: M.call().returns(M.eref(ChainInfoShape)),
  makeAccount: M.call().returns(M.eref(MockOrchAccountShape)),
});

/**
 * @see {OrchestratorI}
 * @see {MockOrchestrator}
 */
export const MockOrchestratorI = M.interface('MockOrchestrator', {
  getChain: M.call(ChainNameShape).returns(M.eref(MockChainShape)),
  getDenomInfo: M.call(DenomShape).returns(MockDenomInfoShape),
});
