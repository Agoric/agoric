import { Fail, q } from '@endo/errors';
import { keyEQ } from '@endo/patterns';
import { provideLazy } from '@agoric/store';

import {
  MockChainI,
  MockOrchAccountI,
  MockOrchestratorI,
} from './typeGuards.js';
import {
  AccountsEntryShape,
  BalancesEntryShape,
  ChainsEntryShape,
  DenomsEntryShape,
  MockDenomMintI,
  MockOrchAdminI,
} from './internal-typeGuards.js';

// TODO declare less. infer more.

/**
 * @import {Zone} from '@agoric/base-zone'
 *
 * @import {Denom} from '../../orchestration-api.js'
 * @import {AcctAddrValue, ChainName, MockChain, MockOrchAccount, MockChainAcctAddr} from './types.js'
 * @import {AccountsMap, ChainsMap, DenomsMap, MockOrchestratorKit} from './internal-types.js';
 */

/**
 * Transfering to this account address should succeed, with the assets
 * disappearing. The dev/null of accounts. Used to burn assets.
 *
 * @type {MockChainAcctAddr}
 */
export const ZERO_ADDR = harden({
  chainId: '0',
  value: `0`,
});

const decrBalance = (myBalances, denom, deltaValue) => {
  const { value: myOldBalanceValue } = myBalances.get(denom);
  // Would be really good to do this source check synchronously
  // and in order.
  // TODO is this realistic for the real orch?
  myOldBalanceValue >= deltaValue ||
    Fail`overdrawn ${myOldBalanceValue} - ${deltaValue}`;
  const myNewBalanceValue = myOldBalanceValue - deltaValue;

  // Would be really good to do this source update synchronously and in order.
  // TODO is this realistic for the real orch?
  myBalances.set(denom, harden({ denom, value: myNewBalanceValue }));
};

const getDestBalances = (chains, destAddr) => {
  const { chainId: destChainId, value: destAcctAddrValue } = destAddr;
  const { accounts: destChainAccounts } = chains.get(destChainId);
  const { balances: dBalances } = destChainAccounts.get(destAcctAddrValue);
  return dBalances;
};

const restoreBalance = (myBalances, denom, deltaValue) => {
  const { value: myNextOldBalanceValue } = myBalances.get(denom);
  const myNextNewBalanceValue = myNextOldBalanceValue + deltaValue;
  myBalances.set(denom, harden({ denom, value: myNextNewBalanceValue }));
};

const incrBalance = (destBalances, denom, deltaValue) => {
  if (destBalances.has(denom)) {
    const { value: destOldBalanceValue } = destBalances.get(denom);
    const destNewBalanceValue = destOldBalanceValue + deltaValue;
    destBalances.set(denom, harden({ denom, value: destNewBalanceValue }));
  } else {
    destBalances.init(denom, harden({ denom, value: deltaValue }));
  }
};

/**
 * @param {Zone} zone
 */
export const prepareMockOrchestratorKit = zone => {
  const makeMapStore = zone.detached().mapStore;

  /**
   * @type {(
   *   chains: ChainsMap,
   *   accounts: AccountsMap,
   *   chainId: ChainName,
   *   chain: MockChain,
   * ) => MockOrchAccount}
   */
  const mockOrchAccount = zone.exoClass(
    'MockOrchAccount',
    MockOrchAccountI,
    /**
     * @param {ChainsMap} chains
     * @param {AccountsMap} accounts
     * @param {ChainName} chainId
     * @param {MockChain} chain
     */
    (chains, accounts, chainId, chain) => {
      /**
       * Start at `1` since we must avoid colliding with `ZERO_ADDR`
       *
       * @type {AcctAddrValue}
       */
      const acctAddrValue = `${accounts.getSize() + 1}`;
      return { chains, accounts, chainId, chain, acctAddrValue };
    },
    {
      getAddress() {
        const { chainId, acctAddrValue } = this.state;
        return harden({ chainId, value: acctAddrValue });
      },
      async getBalances() {
        const { accounts, acctAddrValue } = this.state;
        const { balances } = accounts.get(acctAddrValue);
        return [...balances.values()];
      },
      async getBalance(denom) {
        const { accounts, acctAddrValue } = this.state;
        const { balances } = accounts.get(acctAddrValue);
        return balances.has(denom)
          ? balances.get(denom)
          : harden({
              denom,
              value: 0n,
            });
      },
      async transfer(destAddr, denomAmount) {
        const { chains, accounts, acctAddrValue } = this.state;
        const { balances: myBalances } = accounts.get(acctAddrValue);
        const { denom, value: deltaValue } = denomAmount;

        decrBalance(myBalances, denom, deltaValue);

        await null; // sometime later...

        if (keyEQ(destAddr, ZERO_ADDR)) {
          // Effectively burn the assets since nothing else increments.
          return;
        }

        let destBalances;
        try {
          // TODO To better mock actual orchestration, getting from a destAddr
          // should return a promise that might resolve *later* if an account
          // with that address is defined later.
          destBalances = getDestBalances(chains, destAddr);
        } catch (err) {
          // A failure at this point means the `denomAmount` is not yet spent
          // at dest, and so should be restored to `myBalances`.
          restoreBalance(myBalances, denom, deltaValue);
          throw err;
        }
        incrBalance(destBalances, denom, deltaValue);
      },
    },
  );

  const makeMockChain = zone.exoClass(
    'MockChain',
    MockChainI,
    /**
     * @param {ChainsMap} chains
     * @param {DenomsMap} denoms
     * @param {ChainName} chainName
     */
    (chains, denoms, chainName) => ({
      chains,
      denoms,
      chainId: chainName,
    }),
    {
      getChainInfo() {
        const { chainId } = this.state;
        return harden({ chainId });
      },
      async makeAccount() {
        const { self } = this;
        const { chains, chainId } = this.state;
        const { accounts } = chains.get(chainId);

        const account = mockOrchAccount(chains, accounts, chainId, self);
        const { value: acctAddrValue } = account.getAddress();
        accounts.init(
          acctAddrValue,
          harden({
            account,
            balances: makeMapStore('balances', BalancesEntryShape),
          }),
        );
        return account;
      },
    },
  );

  const mockDenomMint = zone.exoClass(
    'MockDenomMint',
    MockDenomMintI,
    /**
     * @param {ChainsMap} chains
     * @param {DenomsMap} denoms
     * @param {Denom} denom
     */
    (chains, denoms, denom) => ({
      chains,
      denoms,
      denom,
    }),
    {
      mintTo(destAddr, denomAmount) {
        const { chains, denom } = this.state;
        const { denom: sameDenom, value: deltaValue } = denomAmount;
        denom === sameDenom ||
          Fail`${q(denom)} should be same as ${q(sameDenom)}`;

        const destBalances = getDestBalances(chains, destAddr);
        incrBalance(destBalances, denom, deltaValue);
      },
    },
  );

  /** @type {() => MockOrchestratorKit} */
  const mockOrchestratorKit = zone.exoClassKit(
    'MockOrchestrator',
    {
      orchestrator: MockOrchestratorI,
      admin: MockOrchAdminI,
    },
    () => {
      /** @type {ChainsMap} */
      const chains = makeMapStore('chains', ChainsEntryShape);
      /** @type {DenomsMap} */
      const denoms = makeMapStore('denoms', DenomsEntryShape);
      return { chains, denoms };
    },
    {
      orchestrator: {
        getChain(chainName) {
          const { chains, denoms } = this.state;
          // @ts-expect-error typing problems with provideLazy
          const { chain } = provideLazy(chains, chainName, cName =>
            harden({
              chain: makeMockChain(chains, denoms, cName),
              accounts: makeMapStore('accounts', AccountsEntryShape),
            }),
          );
          return chain;
        },
        getDenomInfo(denom) {
          return this.state.denoms.get(denom);
        },
      },
      admin: {
        async makeDenom(denom, chainP) {
          const chain = await chainP;
          const { chains, denoms } = this.state;
          // init will throw if `denom` name is already taken
          denoms.init(denom, harden({ chain }));
          return mockDenomMint(chains, denoms, denom);
        },
      },
    },
  );
  return mockOrchestratorKit;
};
harden(prepareMockOrchestratorKit);
