import { M, getInterfaceGuardPayload } from '@endo/patterns';

import {
  AmountShape,
  AmountPatternShape,
  BrandShape,
  PaymentShape,
  PurseShape,
  makeIssuerInterfaces,
  IssuerShape,
  MintShape,
} from '@agoric/ertp';
import { AnyNatAmountShape, DenomShape } from '../../typeGuards.js';
import { MockOrchAccountShape } from '../mock-orch/typeGuards.js';
import { MockPurseShape } from './typeGuards.js';

export const IssuerAdminShape = M.remotable('IssuerAdmin');
export const RecoverySetShape = M.remotable('RecoverySet');
export const RecoveryFacetShape = M.remotable('RecoverFacet');
export const Denom2IssuerKitShape = M.remotable('Denom2IssuerKit');
export const Brand2DenomShape = M.remotable('Brand2Denom');

export const IssuerKitPlusShape = M.splitRecord(
  {
    brand: BrandShape,
    issuer: IssuerShape,
    admin: IssuerAdminShape,
  },
  {
    mint: MintShape,
  },
);

export const PaymentLedgerEntryShape = harden({
  keyShape: PaymentShape,
  valueShape: AnyNatAmountShape,
});

export const PaymentRecoveryEntryShape = harden({
  keyShape: PaymentShape,
  valueShape: RecoveryFacetShape,
});

export const Denom2IssuerKitEntryShape = harden({
  keyShape: DenomShape,
  valueShape: IssuerKitPlusShape,
});

export const Brand2DenomEntryShape = harden({
  keyShape: BrandShape,
  valueShape: DenomShape,
});

/**
 * @param {Pattern} [brandShape]
 * @param {Pattern} [assetKindShape]
 * @param {Pattern} [amountShape]
 */
const mockIssuerInterfaces = (
  brandShape = undefined,
  assetKindShape = undefined,
  amountShape = AmountShape,
) => {
  const {
    IssuerI: OriginalIssuerI,
    MintI: OriginalMintI,
    PaymentI,
    PurseIKit: { purse: OriginalPurseI },
  } = makeIssuerInterfaces(brandShape, assetKindShape, amountShape);

  const { methodGuards: originalPurseMethodGuards } =
    getInterfaceGuardPayload(OriginalPurseI);

  const MockPurseI = M.interface('MockPurse', {
    ...originalPurseMethodGuards,
    getCurrentFullBalance: M.call().returns(M.eref(amountShape)),
    getCurrentEncumberedBalance: M.call().returns(amountShape),
    getCurrentUnencumberedBalance: M.call().returns(M.eref(amountShape)),
    getCurrentAmount: M.call().returns(M.eref(amountShape)),
    deposit: M.call(PaymentShape)
      .optional(AmountPatternShape)
      .returns(M.eref(amountShape)),
    withdraw: M.call(amountShape).returns(M.eref(PaymentShape)),
  });

  const MockDepositFacetI = M.interface('MockDepositFacet', {
    receive: getInterfaceGuardPayload(MockPurseI).methodGuards.deposit,
  });

  const MockPurseIKit = harden({
    purse: MockPurseI,
    depositFacet: MockDepositFacetI,
  });

  const { methodGuards: originalIssuerMethodGuards } =
    getInterfaceGuardPayload(OriginalIssuerI);

  const MockIssuerI = M.interface('MockIssuer', {
    ...originalIssuerMethodGuards,
    makeEmptyPurse: M.call().returns(M.eref(MockPurseShape)),
  });

  const { methodGuards: originalMintMethodGuards } =
    getInterfaceGuardPayload(OriginalMintI);

  const MockMintI = M.interface('MockMint', {
    ...originalMintMethodGuards,
    mintPayment: M.call(amountShape).returns(M.eref(PaymentShape)),
  });

  return harden({
    IssuerI: MockIssuerI,
    MintI: MockMintI,
    PaymentI,
    PurseIKit: MockPurseIKit,
  });
};
harden(mockIssuerInterfaces);

/**
 * @param {Pattern} [brandShape]
 * @param {Pattern} [assetKindShape]
 * @param {Pattern} [amountShape]
 */
export const mockIssuerInterfacesPlus = (
  brandShape = undefined,
  assetKindShape = undefined,
  amountShape = AmountShape,
) => {
  const {
    IssuerI,
    MintI,
    PaymentI,
    PurseIKit: MockPurseIKit,
  } = mockIssuerInterfaces(brandShape, assetKindShape, amountShape);

  const RecoveryFacetI = M.interface('RecoveryFacet', {
    initPayment: M.call(PaymentShape).returns(),
    deletePayment: M.call(PaymentShape).returns(),
    getRecoverySetStore: M.call().returns(RecoverySetShape),
    getCurrentEncumberedBalance: M.call().returns(amountShape),
    encumber: M.call(amountShape).returns(),
    unencumber: M.call(amountShape).returns(),
    getOrchAcct: M.call().returns(M.eref(MockOrchAccountShape)),
  });

  const MockPurseIKitPlus = {
    ...MockPurseIKit,
    recoveryFacet: RecoveryFacetI,
  };

  const IssuerAdminI = M.interface('MockIssuerAdmin', {
    makePurse: M.call(M.eref(MockOrchAccountShape)).returns(M.eref(PurseShape)),
  });

  return harden({
    IssuerI,
    MintI,
    PaymentI,
    PurseIKit: MockPurseIKitPlus,
    IssuerAdminI,
  });
};
harden(mockIssuerInterfacesPlus);
