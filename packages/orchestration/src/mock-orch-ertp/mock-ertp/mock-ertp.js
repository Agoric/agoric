import { Fail, q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { mustMatch } from '@endo/patterns';

import { AmountMath, BrandI, PaymentShape } from '@agoric/ertp';
import { AnyNatAmountShape } from '../../typeGuards.js';
import {
  mockIssuerInterfacesPlus,
  PaymentLedgerEntryShape,
  PaymentRecoveryEntryShape,
  Brand2DenomEntryShape,
  Denom2IssuerKitEntryShape,
} from './internal-typeGuards.js';
import { ZERO_ADDR } from '../mock-orch/mock-orch.js';

/**
 * @import {ERef} from '@endo/eventual-send'
 * @import {Amplify} from '@endo/exo'
 *
 * @import {WeakMapStore} from '@agoric/store'
 * @import {Zone} from '@agoric/zone'
 * @import {Brand, Amount, Payment} from '@agoric/ertp'
 * @import {Denom, DenomAmount} from '../../orchestration-api.js'
 * @import {MockOrchestratorAdmin, MockDenomMint} from '../mock-orch/internal-types.js'
 * @import {MockOrchestrator, MockChain, MockOrchAccount, MockChainAcctAddr} from '../mock-orch/types.js'
 * @import {PaymentLedgerMap, RecoveryFacet, PaymentRecoveryMap} from './internal-types.js'
 * @import {MockPurse} from './types.js'
 */

const {
  IssuerI,
  MintI,
  PaymentI,
  PurseIKit: MockPurseIKitPlus,
  IssuerAdminI,
} = mockIssuerInterfacesPlus();

/**
 * @param {Zone} zone
 */
export const prepareERTPOrchestrator = zone => {
  const makeWeakMapStore = zone.detached().weakMapStore;
  const makeSetStore = zone.detached().setStore;

  const mockPayment = zone.exoClass(
    'MockPayment',
    PaymentI,
    brand => ({ brand }),
    {
      getAllegedBrand() {
        return this.state.brand;
      },
    },
  );

  /**
   * Common to `purse.deposit` and `issuer.burn`
   *
   * @param {object} state
   * @param {Denom} state.denom
   * @param {PaymentLedgerMap} state.paymentLedger
   * @param {WeakMapStore<Payment, RecoveryFacet>} state.paymentRecoveryFacets
   * @param {Payment} payment
   * @param {MockChainAcctAddr} destAddr
   * @param {Pattern} [optAmountShape]
   * @returns {Promise<Amount>}
   */
  const transferPaymentToAddr = async (
    { denom, paymentLedger, paymentRecoveryFacets },
    payment,
    destAddr,
    optAmountShape,
  ) => {
    const recoveryFacet = paymentRecoveryFacets.get(payment);
    const amount = paymentLedger.get(payment);
    if (optAmountShape !== undefined) {
      mustMatch(amount, optAmountShape);
    }
    const denomAmount = /** @type {DenomAmount} */ (
      harden({
        denom,
        value: amount.value,
      })
    );

    // COMMIT POINT

    // TODO Should we move the unencumber up here?
    // recoveryFacet.unencumber(paymentAmount);

    recoveryFacet.deletePayment(payment);

    const srcOrchAcct = await recoveryFacet.getOrchAcct();
    try {
      await E(srcOrchAcct).transfer(destAddr, denomAmount);
      recoveryFacet.unencumber(amount);
      return amount;
    } catch (err) {
      recoveryFacet.unencumber(amount);
      throw err;
    }
  };

  /** @type {Amplify} */
  let purseKitAmp;

  const mockPurseKit = zone.exoClassKit(
    'MockPurse',
    MockPurseIKitPlus,
    /**
     * @param {MockOrchAccount} orchAcct
     * @param {Denom} denom
     * @param {Brand} brand
     * @param {PaymentLedgerMap} paymentLedger
     * @param {WeakMapStore<Payment, RecoveryFacet>} paymentRecoveryFacets
     */
    (orchAcct, denom, brand, paymentLedger, paymentRecoveryFacets) => {
      const recoverySet = makeSetStore('recoverySet', {
        keyShape: PaymentShape,
      });
      const initialEncumberedBalance = /** @type {Amount} */ (
        harden({
          brand,
          value: 0n,
        })
      );
      return {
        orchAcct,
        denom,
        brand,
        paymentLedger,
        paymentRecoveryFacets,
        recoverySet,
        currentEncumberedBalance: initialEncumberedBalance,
      };
    },
    {
      purse: {
        getAllegedBrand() {
          return this.state.brand;
        },
        async getCurrentFullBalance() {
          const { orchAcct, denom, brand } = this.state;
          const { value } = await E(orchAcct).getBalance(denom);
          return /** @type {Amount} */ (harden({ brand, value }));
        },
        getCurrentEncumberedBalance() {
          return this.state.currentEncumberedBalance;
        },
        async getCurrentUnencumberedBalance() {
          const { purse } = this.facets;
          const fullBalance = await purse.getCurrentFullBalance();
          const encBalance = purse.getCurrentEncumberedBalance();
          AmountMath.isGTE(fullBalance, encBalance) ||
            Fail`unencumbered balance is negative`;
          return AmountMath.subtract(fullBalance, encBalance);
        },
        // alias for getCurrentUnencumberedBalance
        async getCurrentAmount() {
          return this.facets.purse.getCurrentUnencumberedBalance();
        },
        async getCurrentAmountNotifier() {
          Fail`Mock ertp does not implement amount/balance notifiers`;
        },
        async deposit(payment, optAmountShape = undefined) {
          const { orchAcct } = this.state;

          const destAddr = await E(orchAcct).getAddress();
          return transferPaymentToAddr(
            this.state,
            payment,
            destAddr,
            optAmountShape,
          );
        },
        async withdraw(amount) {
          // No overdrawn prevention on withdraw. Only deposit.
          // Surprising, but probably correct!
          const { brand, paymentLedger } = this.state;
          const { recoveryFacet } = this.facets;

          const payment = mockPayment(brand);
          if (!AmountMath.isEmpty(amount)) {
            recoveryFacet.initPayment(payment);
            recoveryFacet.encumber(amount);
          }
          paymentLedger.init(payment, amount);
          return payment;
        },
        getDepositFacet() {
          return this.facets.depositFacet;
        },
        getRecoverySet() {
          return this.state.recoverySet.snapshot();
        },
        recoverAll() {
          const {
            brand,
            recoverySet,
            currentEncumberedBalance: value,
          } = this.state;
          const { recoveryFacet } = this.facets;
          for (const payment of recoverySet.keys()) {
            recoveryFacet.deletePayment(payment);
          }
          this.state.currentEncumberedBalance = /** @type {Amount} */ (
            harden({
              brand,
              value: 0n,
            })
          );
          return harden({ brand, value });
        },
      },
      depositFacet: {
        async receive(payment, optAmountShape) {
          return this.facets.purse.deposit(payment, optAmountShape);
        },
      },
      recoveryFacet: {
        initPayment(payment) {
          const { paymentRecoveryFacets, recoverySet } = this.state;
          const { recoveryFacet } = this.facets;

          recoverySet.add(payment);
          paymentRecoveryFacets.init(payment, recoveryFacet);
        },
        deletePayment(payment) {
          const { paymentLedger, paymentRecoveryFacets, recoverySet } =
            this.state;

          paymentRecoveryFacets.delete(payment);
          recoverySet.delete(payment);
          paymentLedger.delete(payment);
        },
        getRecoverySetStore() {
          return this.state.recoverySet;
        },
        getCurrentEncumberedBalance() {
          return this.state.currentEncumberedBalance;
        },
        encumber(amount) {
          const { currentEncumberedBalance: oldEncBalance } = this.state;
          this.state.currentEncumberedBalance = AmountMath.add(
            oldEncBalance,
            amount,
          );
        },
        unencumber(amount) {
          const { currentEncumberedBalance: oldEncBalance } = this.state;
          this.state.currentEncumberedBalance = AmountMath.subtract(
            oldEncBalance,
            amount,
          );
        },
        getOrchAcct() {
          return this.state.orchAcct;
        },
      },
    },
    {
      receiveAmplifier(a) {
        purseKitAmp = a;
      },
    },
  );

  // @ts-expect-error TS thinks it is used before assigned, which is a hazard
  // TS is correct to bring to our attention, since there is not enough static
  // into to infer otherwise.
  assert(purseKitAmp !== undefined);

  const mockIssuerKitInternal = zone.exoClassKit(
    'MockIssuerKit',
    {
      brand: BrandI,
      issuer: IssuerI,
      mint: MintI,
      admin: IssuerAdminI,
    },
    /**
     * @param {Denom} denom
     * @param {ERef<MockChain>} chain
     * @param {ERef<MockDenomMint>} [optDenomMint]
     */
    (denom, chain, optDenomMint = undefined) => {
      /** @type {PaymentLedgerMap} */
      const paymentLedger = makeWeakMapStore(
        'paymentLedger',
        PaymentLedgerEntryShape,
      );
      /** @type {PaymentRecoveryMap} */
      const paymentRecoveryFacets = makeWeakMapStore(
        'paymentRecoverFacets',
        PaymentRecoveryEntryShape,
      );
      return {
        denom,
        chain,
        paymentLedger,
        paymentRecoveryFacets,
        optDenomMint,
        optMintRecoveryPurse: /** @type {MockPurse | undefined} */ (undefined),
      };
    },
    {
      brand: {
        isMyIssuer(allegedIssuer) {
          return this.facets.issuer === allegedIssuer;
        },
        getAllegedName() {
          return this.state.denom;
        },
        getAmountShape() {
          return AnyNatAmountShape;
        },
        getDisplayInfo() {
          Fail`mock ertp does not implement displayInfo`;
        },
      },
      issuer: {
        getBrand() {
          return this.facets.brand;
        },
        getAllegedName() {
          return this.state.denom;
        },
        getAssetKind() {
          return 'nat';
        },
        getDisplayInfo() {
          Fail`mock ertp does not implement deprecated getDisplayInfo`;
        },
        async makeEmptyPurse() {
          const { chain } = this.state;
          const { admin } = this.facets;
          const orchAcct = await E(chain).makeAccount();
          return admin.makePurse(orchAcct);
        },
        isLive(payment) {
          return this.state.paymentLedger.has(payment);
        },
        getAmountOf(payment) {
          return this.state.paymentLedger.get(payment);
        },
        async burn(payment, optAmountShape = undefined) {
          return transferPaymentToAddr(
            this.state,
            payment,
            ZERO_ADDR,
            optAmountShape,
          );
        },
      },
      mint: {
        getIssuer() {
          return this.facets.issuer;
        },
        async mintPayment(newAmount) {
          const { denom, optDenomMint } = this.state;
          if (optDenomMint === undefined) {
            throw Fail`Cannot mint without ${q(denom)} denom mint permission`;
          }
          const denomMint = optDenomMint;
          const { issuer } = this.facets;

          await null;
          if (this.state.optMintRecoveryPurse === undefined) {
            this.state.optMintRecoveryPurse = await issuer.makeEmptyPurse();
          }
          const mintRecoveryPurse = this.state.optMintRecoveryPurse;
          const { recoveryFacet } =
            /** @type {{ recoveryFacet: RecoveryFacet }} */ (
              purseKitAmp(mintRecoveryPurse)
            );
          const orchAcct = recoveryFacet.getOrchAcct();
          const acctAddr = await E(orchAcct).getAddress();
          await E(denomMint).mintTo(
            acctAddr,
            harden({
              denom,
              value: newAmount.value,
            }),
          );
          return mintRecoveryPurse.withdraw(newAmount);
        },
      },
      admin: {
        async makePurse(orchAcct) {
          const { denom, paymentLedger, paymentRecoveryFacets } = this.state;
          const { brand } = this.facets;
          const { purse } = mockPurseKit(
            orchAcct,
            denom,
            /** @type {Brand} */ (/** @type {unknown} */ (brand)),
            paymentLedger,
            paymentRecoveryFacets,
          );
          return /** @type {MockPurse} */ (/** @type {unknown} */ (purse));
        },
      },
    },
  );

  /**
   * @param {Denom} denom
   * @param {ERef<MockChain>} chain
   * @param {ERef<MockDenomMint>} [optDenomMint] When `optDenomMint` is omitted,
   *   omit `mint` from the result.
   */
  const mockIssuerKit = (denom, chain, optDenomMint = undefined) => {
    const { brand, issuer, mint, admin } = mockIssuerKitInternal(
      denom,
      chain,
      optDenomMint,
    );
    if (optDenomMint === undefined) {
      return harden({
        brand,
        issuer,
        admin,
      });
    } else {
      return harden({
        brand,
        issuer,
        mint,
        admin,
      });
    }
  };

  const mockERTPOrchestrator = zone.exoClass(
    'ERTPTools',
    undefined, // TODO ERTPOrchestratorI,
    /**
     * @param {MockOrchestrator} orchestrator
     * @param {MockOrchestratorAdmin} [optOrchAdmin]
     */
    (orchestrator, optOrchAdmin = undefined) => {
      const denom2IssuerKit = zone.mapStore(
        'denom2IssuerKit',
        Denom2IssuerKitEntryShape,
      );
      const brand2Denom = zone.weakMapStore(
        'brand2Denom',
        Brand2DenomEntryShape,
      );

      return {
        orchestrator,
        denom2IssuerKit,
        brand2Denom,
        optOrchAdmin,
      };
    },
    {
      getDenomForBrand(brand) {
        const { brand2Denom } = this.state;
        return brand2Denom.get(brand);
      },
      async provideIssuerKitForDenom(
        denom,
        defaultChainName = 'defaultChainName',
      ) {
        const { orchestrator, denom2IssuerKit, brand2Denom, optOrchAdmin } =
          this.state;
        await null;
        if (!denom2IssuerKit.has(denom)) {
          let issuerKitPlus;
          try {
            // TODO should be a better way than try/catch to determine
            // if a denom already exists
            const { chain } = await E(orchestrator).getDenomInfo(denom);
            issuerKitPlus = mockIssuerKit(denom, chain);
          } catch (err) {
            if (optOrchAdmin === undefined) {
              throw Fail`Cannot mint without orchestrator admin facet`;
            }
            const chain = await E(orchestrator).getChain(defaultChainName);
            const denomMint = await E(optOrchAdmin).makeDenom(denom, chain);
            issuerKitPlus = mockIssuerKit(denom, chain, denomMint);
          }
          denom2IssuerKit.init(denom, issuerKitPlus);
          brand2Denom.init(issuerKitPlus.brand, denom);
        }
        return denom2IssuerKit.get(denom);
      },
    },
  );

  return mockERTPOrchestrator;
};
harden(prepareERTPOrchestrator);
