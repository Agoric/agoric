import { AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';

/**
 * @param {VaultId} vaultId
 * @param {Amount} initDebt
 * @param {Amount} initCollateral
 * @returns {InnerVault & { setDebt: (Amount) => void }}
 */
export function makeFakeInnerVault(
  vaultId,
  initDebt,
  initCollateral = AmountMath.make(initDebt.brand, 100n),
) {
  let debt = initDebt;
  let collateral = initCollateral;
  const vault = Far('Vault', {
    getCollateralAmount: () => collateral,
    getNormalizedDebt: () => debt,
    getCurrentDebt: () => debt,
    setDebt: newDebt => (debt = newDebt),
    setCollateral: newCollateral => (collateral = newCollateral),
    getIdInManager: () => vaultId,
    liquidate: () => {},
  });
  // @ts-expect-error pretend this is compatible with VaultKit
  return vault;
}
