// @ts-check
// XXX avoid deep imports https://github.com/Agoric/agoric-sdk/issues/4255#issuecomment-1032117527
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { fromVaultKey, toVaultKey } from './storeUtils.js';

/**
 * Used by prioritizedVaults to wrap the Collections API for this use case.
 *
 * Designed to be replaceable by naked Collections API when composite keys are available.
 *
 * In this module debts are encoded as the inverse quotient (collateral over
 * debt) so that greater collaterization sorts after lower. (Higher
 * debt-to-collateral come first.)
 */

/** @typedef {import('./vault').InnerVault} InnerVault */
/** @typedef {import('./storeUtils').CompositeKey} CompositeKey */

export const makeOrderedVaultStore = () => {
  // TODO make it work durably https://github.com/Agoric/agoric-sdk/issues/4550
  /** @type {MapStore<string, InnerVault>} */
  const store = makeScalarBigMapStore('orderedVaultStore', { durable: false });

  /**
   * @param {string} vaultId
   * @param {InnerVault} vault
   */
  const addVault = (vaultId, vault) => {
    const debt = vault.getCurrentDebt();
    const collateral = vault.getCollateralAmount();
    const key = toVaultKey(debt, collateral, vaultId);
    store.init(key, vault);
    return key;
  };

  /**
   * @param {string} key
   * @returns {InnerVault}
   */
  const removeByKey = key => {
    try {
      const vault = store.get(key);
      assert(vault);
      store.delete(key);
      return vault;
    } catch (e) {
      const keys = Array.from(store.keys());
      console.error(
        'removeByKey failed to remove',
        key,
        'parts:',
        fromVaultKey(key),
      );
      console.error('  key literals:', keys);
      console.error('  key parts:', keys.map(fromVaultKey));
      throw e;
    }
  };

  return harden({
    addVault,
    removeByKey,
    keys: store.keys,
    entries: store.entries,
    getSize: store.getSize,
    values: store.values,
  });
};
